# Step-by-Step Implementation Guide

This is the exact order of implementation. Each step is designed to be independently testable.

---

## Phase 1 — Foundation (Day 1, Morning)

### Step 1.1: Backend — Install new dependencies
```bash
cd backend
bun add bcryptjs jsonwebtoken multer zod
bun add -d @types/bcryptjs @types/jsonwebtoken @types/multer
```

### Step 1.2: Backend — Extend environment config
- Add `JWT_SECRET`, `JWT_EXPIRES_IN`, `UPLOAD_DIR`, `MAX_FILE_SIZE` to `config/env.ts`
- Create `.env.example` with all vars documented
- Update `.env` with development values

### Step 1.3: Backend — Utility modules
Create in order:
1. `src/utils/api-error.ts` — Custom ApiError class with statusCode
2. `src/utils/password.ts` — bcrypt hash/compare wrappers
3. `src/utils/jwt.ts` — sign/verify JWT wrappers
4. `src/types/express.d.ts` — Extend Express Request with `user`

### Step 1.4: Backend — Database schema
Extend `src/models/schema.ts`:
1. Add `userRoleEnum`, `ticketStatusEnum`, `ticketPriorityEnum`
2. Modify `users` table (add `password_hash`, `role`, `phone`, `avatar_url`, `is_active`, `updated_at`)
3. Add `tickets` table
4. Add `ticketImages` table
5. Add `ticketActivityLog` table
6. Add `ticketComments` table
7. Add `notifications` table
8. Export all types

**Test:** Run `bun run db:generate` and `bun run db:push` — verify tables created.

### Step 1.5: Backend — Middleware
1. `src/middlewares/auth.middleware.ts` — JWT auth middleware
2. `src/middlewares/role.middleware.ts` — Role guard factory
3. Enhance `src/middlewares/error.middleware.ts` — Handle ApiError, Zod errors, Multer errors

### Step 1.6: Backend — Auth module
1. `src/validators/auth.validator.ts` — Zod schemas for register/login
2. `src/services/auth.service.ts` — register, login, getMe logic
3. `src/controllers/auth.controller.ts` — HTTP handlers
4. `src/routes/auth.routes.ts` — POST register, POST login, GET me
5. Register in `src/routes/index.ts`

**Test:** Use curl/Postman:
- Register a user → get token
- Login → get token
- GET /api/auth/me with token → get user

### Step 1.7: Backend — Seed script
1. `src/scripts/seed.ts`
2. Add `"db:seed"` script to package.json
3. Seed 5 users, 10 tickets (with S3 placeholder URLs for images), activity logs, comments, notifications

**Test:** Run `bun run db:seed` — verify data in DB.

---

## Phase 2 — Core Backend Features (Day 1, Afternoon → Day 2, Morning)

### Step 2.1: Backend — Activity & Notification services
1. `src/services/activity.service.ts` — logActivity function
2. `src/services/notification.service.ts` — create, list, markRead, markAllRead

### Step 2.2: Backend — Ticket module
1. `src/validators/ticket.validator.ts` — Zod schemas for create/update (include S3 URL validation)
2. `src/services/ticket.service.ts`:
   - `listTickets(userId, role, filters)` — role-based filtering + pagination
   - `getTicket(ticketId, userId, role)` — with access check
   - `createTicket(data, userId)` — create + save imageUrls + log + notify
   - `updateTicket(ticketId, data, userId, role)` — workflow logic
   - `addComment(ticketId, content, userId)` — comment + log + notify
   - `addImages(ticketId, imageUrls, userId)` — validate URLs + save + log
3. `src/controllers/ticket.controller.ts` — HTTP handlers
4. `src/routes/ticket.routes.ts` — All ticket routes with middleware
5. Register in `src/routes/index.ts`

**Test:** Full CRUD flow via curl:
- Create ticket with imageUrls (as tenant) ✓
- List tickets (as each role) ✓
- Assign technician (as manager) ✓
- Change status (as technician) ✓
- Add comment ✓
- Add images via POST /tickets/:id/images ✓

**Test:** Full CRUD flow via curl:
- Create ticket (as tenant) ✓
- List tickets (as each role) ✓
- Assign technician (as manager) ✓
- Change status (as technician) ✓
- Add comment ✓
- Upload image ✓

### Step 2.3: Backend — Notification endpoints
1. `src/controllers/notification.controller.ts`
2. `src/routes/notification.routes.ts`
3. Register in `src/routes/index.ts`

**Test:** List notifications, mark as read.

### Step 2.4: Backend — Dashboard stats
1. `src/services/dashboard.service.ts` — Role-based aggregation queries
2. `src/controllers/dashboard.controller.ts`
3. `src/routes/dashboard.routes.ts`
4. Register in `src/routes/index.ts`

**Test:** GET /api/dashboard/stats as each role.

### Step 2.5: Backend — Technician list endpoint
1. Add to `src/controllers/user.controller.ts` — `listTechnicians`
2. Add route in `src/routes/user.routes.ts` — GET `/users/technicians`

**Test:** GET /api/users/technicians as manager.

---

## Phase 3 — Frontend Foundation (Day 2)

### Step 3.1: Frontend — Install dependencies
```bash
cd frontend
bun add axios @aws-sdk/client-s3 @aws-sdk/s3-request-presigner react-hook-form @hookform/resolvers zod zustand date-fns react-dropzone sonner
```
> **Note:** TanStack Query is already installed via TanStack Start.

### Step 3.2: Frontend — Setup TanStack Query
1. `src/lib/query-client.ts` — Configure QueryClient with defaults
2. `src/lib/query-keys.ts` — Query key factory for type safety
3. Modify `src/routes/__root.tsx` — Wrap app with QueryClientProvider + DevTools

**Test:** Verify React Query DevTools appear in bottom-left corner.

### Step 3.3: Frontend — Setup S3 & environment
1. Create `.env` with AWS credentials (see S3 upload guide)
2. Create S3 bucket with proper CORS and permissions
3. `src/lib/s3.ts` — S3 upload client
4. `src/hooks/use-s3-upload.ts` — Upload hook with progress tracking

### Step 3.3: Frontend — Setup S3 & environment
1. Create `.env` with AWS credentials (see S3 upload guide)
2. Create S3 bucket with proper CORS and permissions
3. `src/lib/s3.ts` — S3 upload client
4. `src/hooks/use-s3-upload.ts` — Upload hook with progress tracking

**Test:** Upload a test image to S3, verify public URL is accessible.

### Step 3.4: Frontend — Add Shadcn components
```bash
bunx shadcn@latest add dialog avatar skeleton tabs toast table sheet
```

### Step 3.5: Frontend — Types & API client
1. `src/types/auth.ts` — User, LoginRequest, RegisterRequest, AuthResponse
2. `src/types/ticket.ts` — Ticket, TicketImage, ActivityLog, Comment, etc.
3. `src/types/notification.ts` — Notification types
4. `src/types/api.ts` — Generic API response wrapper
### Step 3.5: Frontend — Types & API client
1. `src/types/auth.ts` — User, LoginRequest, RegisterRequest, AuthResponse
2. `src/types/ticket.ts` — Ticket, TicketImage, ActivityLog, Comment, etc.
3. `src/types/notification.ts` — Notification types
4. `src/types/api.ts` — Generic API response wrapper
5. `src/lib/api.ts` — Axios instance with interceptors
6. `src/lib/auth.ts` — Token get/set/clear from localStorage
7. `src/lib/constants.ts` — Status/priority labels, colors, icons

### Step 3.6: Frontend — Query hooks
Create TanStack Query hooks in `src/hooks/queries/`:
1. `use-tickets.ts` — useTickets, useCreateTicket, useUpdateTicket with optimistic updates
2. `use-ticket-detail.ts` — useTicketDetail, useAddComment, useAddImages
3. `use-notifications.ts` — useNotifications (polling), useUnreadNotifications, useMarkNotificationRead
4. `use-dashboard.ts` — useDashboardStats
5. `use-users.ts` — useTechnicians

**Test:** Call each hook in a test component, verify data fetching + caching works.

### Step 3.7: Frontend — Auth store & hooks
### Step 3.7: Frontend — Auth store & hooks
1. `src/stores/auth-store.ts` — Zustand store (user, token, login, logout, loadUser)
2. `src/hooks/use-auth.ts` — Hook wrapping the store
3. `src/hooks/use-media-query.ts` — Responsive hook

### Step 3.8: Frontend — Layout components
### Step 3.8: Frontend — Layout components
1. `src/components/layout/auth-layout.tsx` — Centered card layout
2. `src/components/layout/sidebar.tsx` — Role-filtered nav links
3. `src/components/layout/header.tsx` — Title + notifications + user menu
4. `src/components/layout/mobile-nav.tsx` — Bottom tab bar
5. `src/components/layout/notification-bell.tsx` — Bell + dropdown using useUnreadNotifications
6. `src/components/layout/dashboard-layout.tsx` — Assembles sidebar+header+content
7. `src/components/shared/empty-state.tsx`
8. `src/components/shared/loading-skeleton.tsx`
9. `src/components/shared/error-state.tsx`
10. `src/components/shared/page-header.tsx`

### Step 3.9: Frontend — Auth pages
### Step 3.9: Frontend — Auth pages
1. `src/components/auth/login-form.tsx` — Form with react-hook-form + Zod
2. `src/components/auth/register-form.tsx` — Form with role selection
3. `src/components/auth/protected-route.tsx` — Guard component
4. `src/routes/_auth.tsx` — Auth layout route
5. `src/routes/_auth/login.tsx` — Login page
6. `src/routes/_auth/register.tsx` — Register page
7. Modify `src/routes/index.tsx` — Redirect logic

**Test:** Navigate to `/login`, register a user, login, see redirect to dashboard.

---

## Phase 4 — Frontend Features (Day 2 Evening → Day 3)

### Step 4.1: Frontend — Dashboard layout route
1. `src/routes/_dashboard.tsx` — Protected layout with DashboardLayout
2. `src/routes/_dashboard/index.tsx` — Role-based dashboard using useDashboardStats

### Step 4.2: Frontend — Dashboard components
1. `src/components/dashboard/stats-cards.tsx` — Display stats from query
2. `src/components/dashboard/recent-tickets.tsx` — Use useTickets with filters
3. `src/components/dashboard/tenant-dashboard.tsx`
4. `src/components/dashboard/manager-dashboard.tsx`
5. `src/components/dashboard/technician-dashboard.tsx`

**Test:** Login as each role, see appropriate dashboard with real-time data.

### Step 4.3: Frontend — Ticket components
1. `src/components/tickets/ticket-status-badge.tsx`
2. `src/components/tickets/ticket-priority-badge.tsx`
3. `src/components/tickets/ticket-card.tsx` — Prefetch on hover
4. `src/components/tickets/ticket-filters.tsx`
5. `src/components/tickets/ticket-list.tsx` — Use useTickets with filters
6. `src/components/tickets/ticket-image-upload.tsx` — S3 upload with useS3Upload
7. `src/components/tickets/ticket-form.tsx` — Use useCreateTicket mutation
8. `src/components/tickets/ticket-assign-dialog.tsx` — Use useTechnicians + useUpdateTicket
9. `src/components/tickets/ticket-status-select.tsx` — Optimistic update with useUpdateTicket
10. `src/components/tickets/ticket-activity-log.tsx`
11. `src/components/tickets/ticket-comment-form.tsx` — Use useAddComment
12. `src/components/tickets/ticket-comments.tsx`
13. `src/components/tickets/ticket-detail.tsx` — Use useTicketDetail

### Step 4.4: Frontend — Ticket pages
1. `src/routes/_dashboard/tickets/index.tsx` — List page with filters
2. `src/routes/_dashboard/tickets/new.tsx` — Create page with S3 upload
3. `src/routes/_dashboard/tickets/$ticketId.tsx` — Detail page with prefetching

**Test:** Full flow:
- Tenant creates ticket with images → optimistic UI shows immediately ✓
- Manager sees all tickets, assigns technician → instant update ✓
- Technician sees assigned tasks, updates status → optimistic UI ✓
- Activity log shows all changes ✓
- Comments work with optimistic updates ✓
- Data refetches in background, cache stays fresh ✓

### Step 4.5: Frontend — Notifications
1. `src/routes/_dashboard/notifications.tsx` — Notifications page with useNotifications (polling)
2. Wire notification bell in header with useUnreadNotifications + real-time badge

**Test:** Notifications appear, update every 30s, can be marked as read with optimistic UI.

---

## Phase 5 — Polish (Day 3-4)

### Step 5.1: Mobile-first responsiveness audit

**Test on real devices if possible, or Chrome DevTools device emulation:**

📱 **Mobile (320px - 428px) - PRIMARY TARGET:**
- [ ] All pages render correctly at 320px (iPhone SE), 375px (iPhone 12/13), 390px (iPhone 14), 428px (iPhone Pro Max)
- [ ] Bottom navigation bar always visible, doesn't overlap content
- [ ] Bottom nav icons + labels fit comfortably (max 5 tabs)
- [ ] All touch targets minimum 44x44px (iOS HIG) or 48x48px (Material)
- [ ] Input fields: 16px+ font size (prevents iOS auto-zoom)
- [ ] Text is readable without zooming (16px body minimum)
- [ ] Buttons: Full-width on mobile, adequate height (48px+)
- [ ] Forms: Fields stack vertically, no horizontal scroll
- [ ] Modals: Full-screen or slide-up sheet (not centered dialog)
- [ ] Images: Responsive, proper aspect ratio, lazy loading
- [ ] Tables: Convert to cards or horizontal scroll with shadows
- [ ] Swipe gestures work: Pull-to-refresh, swipe-to-delete
- [ ] Safe area insets respected (notch, home indicator)
- [ ] Landscape mode usable (optional but nice)

📱 **Thumb Zone Test (Critical for mobile-first):**
- [ ] Primary actions in bottom 1/3 of screen (thumb-friendly)
- [ ] Bottom nav icons reachable with one thumb
- [ ] Floating action buttons (FAB) in bottom-right
- [ ] Dangerous actions require confirmation modal
- [ ] Search bar accessible but not blocking content

📱 **Performance (3G/4G simulation):**
- [ ] Initial page load < 3s on Fast 3G
- [ ] Images: Use WebP, lazy load, proper compression
- [ ] React Query cache reduces redundant requests
- [ ] Skeleton loaders show immediately (no blank screens)
- [ ] Optimistic UI makes app feel instant

📱 **Tablet (768px - 1024px) - SECONDARY:**
- [ ] Bottom nav converts to side nav or remains visible
- [ ] Stats grid: 3-4 columns instead of 2
- [ ] Ticket cards: 2-column grid
- [ ] Modals: Sheet or centered dialog (not full-screen)

💻 **Desktop (>1024px) - TERTIARY:**
- [ ] Sidebar always visible
- [ ] Multi-column layouts
- [ ] Hover states work
- [ ] Centered modals
- [ ] Keyboard navigation

### Step 5.2: Loading & error states
- Add skeleton loading to all data-fetching pages (built into query hooks)
- Add error boundaries
- Add empty states ("No tickets yet")
- Add toast notifications for actions (created, updated, etc.)
- Test React Query DevTools for debugging cache

### Step 5.3: Edge cases
- Handle token expiry gracefully (401 interceptor)
- Handle offline/network errors (React Query auto-retry)
- Prevent double-submit on forms (check mutation.isPending)
- Validate file sizes client-side before S3 upload
- Handle concurrent status updates (React Query deduplication)
- Test optimistic update rollbacks on errors

### Step 5.4: Performance optimization
- Verify query key consistency across app
- Test prefetching on navigation
- Verify stale times are appropriate per resource
- Test cache invalidation after mutations
- Monitor React Query DevTools for over-fetching

### Step 5.4: Root route update
- Modify `__root.tsx`: Add `<Toaster />` from sonner
- Add global loading indicator

### Step 5.5: Documentation
- Update backend `.env.example`
- Write `README.md` with:
  - Setup instructions
  - Demo credentials
  - Architecture overview
  - API docs link

### Step 5.6: Docker (Bonus)
- `Dockerfile` for backend
- `Dockerfile` for frontend
- `docker-compose.yml` with backend + frontend + postgres
