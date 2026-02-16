# Frontend Architecture & File Structure

## Mobile-First Design Principles

**Core Philosophy: Mobile-first, touch-optimized, progressive enhancement**

### Key Mobile Constraints
- **Viewport**: Design for 320px - 428px (iPhone SE to iPhone Pro Max)
- **Touch Targets**: Minimum 44x44px (Apple HIG), 48x48px preferred (Material Design)
- **Navigation**: Bottom tab bar (thumb zone), collapsible sidebar on desktop
- **Gestures**: Swipe actions, pull-to-refresh, tap-to-expand
- **Performance**: Optimize for 3G networks, lazy load images
- **Typography**: Minimum 16px body text (prevents zoom on iOS)

### Mobile Layout Strategy
```
Mobile (< 768px):
- Bottom navigation bar (fixed, 5 tabs max)
- Stacked cards
- Full-width modals (slide up from bottom)
- Hidden sidebar
- Hamburger menu for secondary actions

Tablet (768px - 1024px):
- Side navigation (collapsible)
- Grid layouts (2 columns)
- Sheet modals

Desktop (> 1024px):
- Permanent sidebar
- Multi-column layouts
- Dialog modals
```

---

## New Dependencies to Install

```bash
# HTTP client
bun add axios

# S3 upload (AWS SDK v3 - modular)
bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# TanStack Query (already installed via TanStack Start)
# Verify: @tanstack/react-query should be in package.json

# Forms
bun add react-hook-form @hookform/resolvers zod

# State (auth only - server state managed by TanStack Query)
bun add zustand

# Date formatting
bun add date-fns

# File upload UI
bun add react-dropzone

# Toast notifications
bun add sonner
```

---

## Frontend File Structure (Final)

```
frontend/src/
├── router.tsx                              # Router setup (EXISTING - no change)
├── routeTree.gen.ts                        # Auto-generated (EXISTING - auto)
├── styles.css                              # Global styles (EXISTING - extend)
├── logo.svg                                # (EXISTING)
│
├── lib/
│   ├── utils.ts                            # cn() helper (EXISTING - no change)
│   ├── api.ts                              # NEW — Axios instance + interceptors
│   ├── auth.ts                             # NEW — Auth token helpers
│   ├── s3.ts                               # NEW — S3 upload client
│   ├── query-client.ts                     # NEW — TanStack Query client config
│   └── constants.ts                        # NEW — Status/priority labels, colors
│
├── hooks/
│   ├── use-auth.ts                         # NEW — Auth context hook
│   ├── use-s3-upload.ts                    # NEW — S3 file upload hook
│   ├── use-media-query.ts                  # NEW — Responsive breakpoint hook
│   │
│   ├── queries/                            # NEW — TanStack Query hooks
│   │   ├── use-tickets.ts                  # Ticket queries & mutations
│   │   ├── use-ticket-detail.ts            # Single ticket query
│   │   ├── use-notifications.ts            # Notification queries
│   │   ├── use-dashboard.ts                # Dashboard stats query
│   │   └── use-users.ts                    # User/technician queries
│
├── stores/
│   └── auth-store.ts                       # NEW — Zustand auth store
│
├── components/
│   ├── ui/                                 # Shadcn components (EXISTING - extend)
│   │   ├── alert-dialog.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx                      # NEW — Add via shadcn
│   │   ├── avatar.tsx                      # NEW — Add via shadcn
│   │   ├── skeleton.tsx                    # NEW — Add via shadcn
│   │   ├── toast.tsx                       # NEW — Sonner integration
│   │   ├── tabs.tsx                        # NEW — Add via shadcn
│   │   ├── table.tsx                       # NEW — Add via shadcn  
│   │   └── ... (existing ones)
│   │
│   ├── layout/
│   │   ├── auth-layout.tsx                 # NEW — Centered card layout for login/register
│   │   ├── dashboard-layout.tsx            # NEW — Sidebar + header + content
│   │   ├── sidebar.tsx                     # NEW — Navigation sidebar (collapsible on mobile)
│   │   ├── header.tsx                      # NEW — Top bar with user menu + notifications
│   │   ├── mobile-nav.tsx                  # NEW — Bottom tab navigation for mobile
│   │   └── notification-bell.tsx           # NEW — Bell icon with badge + dropdown
│   │
│   ├── auth/
│   │   ├── login-form.tsx                  # NEW — Login form component
│   │   ├── register-form.tsx               # NEW — Register form with role selection
│   │   └── protected-route.tsx             # NEW — Route guard component
│   │
│   ├── tickets/
│   │   ├── ticket-list.tsx                 # NEW — Ticket list with filters
│   │   ├── ticket-card.tsx                 # NEW — Single ticket card (mobile-friendly)
│   │   ├── ticket-detail.tsx               # NEW — Full ticket view
│   │   ├── ticket-form.tsx                 # NEW — Create ticket form
│   │   ├── ticket-status-badge.tsx         # NEW — Colored status badge
│   │   ├── ticket-priority-badge.tsx       # NEW — Colored priority badge
│   │   ├── ticket-filters.tsx              # NEW — Filter bar (status, priority, search)
│   │   ├── ticket-assign-dialog.tsx        # NEW — Assign technician modal
│   │   ├── ticket-status-select.tsx        # NEW — Status change dropdown
│   │   ├── ticket-activity-log.tsx         # NEW — Timeline of activity
│   │   ├── ticket-comments.tsx             # NEW — Comments section
│   │   ├── ticket-comment-form.tsx         # NEW — Add comment form
│   │   └── ticket-image-upload.tsx         # NEW — Image upload with preview
│   │
│   ├── dashboard/
│   │   ├── stats-cards.tsx                 # NEW — KPI cards (open, in progress, etc.)
│   │   ├── recent-tickets.tsx              # NEW — Recent tickets list
│   │   ├── tenant-dashboard.tsx            # NEW — Tenant-specific dashboard
│   │   ├── manager-dashboard.tsx           # NEW — Manager-specific dashboard
│   │   └── technician-dashboard.tsx        # NEW — Technician-specific dashboard
│   │
│   └── shared/
│       ├── empty-state.tsx                 # NEW — No data placeholder
│       ├── loading-skeleton.tsx            # NEW — Loading skeletons
│       ├── error-state.tsx                 # NEW — Error display
│       ├── page-header.tsx                 # NEW — Page title + actions
│       └── role-badge.tsx                  # NEW — User role display
│
├── routes/
│   ├── __root.tsx                          # Root layout (EXISTING - modify)
│   ├── index.tsx                           # Landing → redirect (EXISTING - modify)
│   │
│   ├── _auth.tsx                           # NEW — Auth layout route
│   ├── _auth/
│   │   ├── login.tsx                       # NEW — Login page
│   │   └── register.tsx                    # NEW — Register page
│   │
│   ├── _dashboard.tsx                      # NEW — Dashboard layout route (protected)
│   ├── _dashboard/
│   │   ├── index.tsx                       # NEW — Dashboard home (role-based)
│   │   ├── tickets/
│   │   │   ├── index.tsx                   # NEW — Ticket list page
│   │   │   ├── new.tsx                     # NEW — Create ticket page
│   │   │   └── $ticketId.tsx               # NEW — Ticket detail page
│   │   └── notifications.tsx              # NEW — All notifications page
│   │
│   └── ... (auto-generated route tree)
│
└── types/
    ├── auth.ts                             # NEW — Auth types
    ├── ticket.ts                           # NEW — Ticket types
    ├── notification.ts                     # NEW — Notification types
    └── api.ts                              # NEW — API response types
```

---

## Layout Architecture

### Layout Hierarchy

```
__root.tsx (html, head, body, scripts)
├── _auth.tsx (AuthLayout — centered card, no sidebar)
│   ├── _auth/login.tsx
│   └── _auth/register.tsx
│
├── _dashboard.tsx (DashboardLayout — sidebar + header, PROTECTED)
│   ├── _dashboard/index.tsx (Dashboard home)
│   ├── _dashboard/tickets/index.tsx (Ticket list)
│   ├── _dashboard/tickets/new.tsx (Create ticket)
│   ├── _dashboard/tickets/$ticketId.tsx (Ticket detail)
│   └── _dashboard/notifications.tsx (Notifications)
│
└── index.tsx (Redirect → /login or /dashboard)
```

### Auth Layout (`_auth.tsx`)
- Full-screen centered layout
- Background gradient/pattern
- Card container (max-w-md)
- App logo at top
- No sidebar, no header

### Dashboard Layout (`_dashboard.tsx`)
- **Route guard**: checks auth, redirects to `/login` if not authenticated
- **Desktop**: Left sidebar (240px) + main content area
- **Mobile**: Bottom tab navigation + collapsible hamburger menu
- **Header**: Page title + notification bell + user avatar/dropdown
- **Sidebar items** (role-filtered):
  - Dashboard (all)
  - Tickets (all)
  - New Ticket (tenant, manager only)
  - Notifications (all)

---

## Page Details

### Login Page (`/login`)
**Mobile Layout:**
- Centered card (max-w-sm on mobile, full-width with padding)
- Email input (type="email" for mobile keyboard)
- Password input (type="password" with show/hide toggle)
- Large touch-friendly submit button (min 48px height)
- Link to register (44px min tap target)
- Demo credentials hint (collapsible/expandable on mobile)

### Register Page (`/register`)
**Mobile Layout:**
- Scrollable form (prevent zoom on input focus - 16px font minimum)
- Name input (autocomplete="name")
- Email input (autocomplete="email", inputmode="email")
- Password input (with strength indicator)
- Role selector (large radio cards with icons, not small radios)
- Phone input (inputmode="tel", optional)
- Large submit button (bottom sticky on mobile)
- Link to login

### Dashboard Page (`/dashboard`)
**Mobile Layout: Card-based, vertical scroll**

Renders different dashboard based on `user.role`:

**Tenant Dashboard (Mobile-first):**
- Stats cards: 2x2 grid on mobile (My Tickets, Open, In Progress, Resolved)
- Prominent floating action button (FAB) - "Report New Issue" (bottom-right, thumb-friendly)
- Recent tickets: Full-width cards with swipe actions
- Pull-to-refresh enabled

**Manager Dashboard (Mobile-first):**
- Stats cards: 2x3 grid on mobile (Total, Open, Assigned, In Progress, Done, Urgent)
- Priority breakdown: Horizontal scroll cards or stacked bars
- Recent tickets: Compact cards with quick-assign button
- Filter chips: Horizontal scroll
- Search bar: Sticky at top

**Technician Dashboard (Mobile-first):**
- Stats cards: 3-card row (Assigned, In Progress, Completed Today)
- Task list: Large touch-friendly cards with status toggle
- Quick actions: Swipe left for "Start Work" / "Mark Done"
- Sort/filter: Bottom sheet modal

### Ticket List Page (`/dashboard/tickets`)
**Mobile Layout:**
- Sticky search bar at top (16px+ font to prevent zoom)
- Filter chips: Horizontal scroll, pill-shaped (Status, Priority)
- Active filters: Dismissible chips with count
- Ticket cards: Full-width, vertical stack
  - Large tap area (full card clickable)
  - Status/priority badges: Top-right
  - Key info: Title (bold), date, assignee avatar
  - Swipe right: Quick status change
- Empty state: Centered illustration + CTA
- Pull-to-refresh enabled
- Infinite scroll or "Load More" button

### Create Ticket Page (`/dashboard/tickets/new`)
**Mobile Layout:**
- Full-screen form (no modal on mobile)
- Back button (top-left, 44px tap target)
- Title input (large, 18px font)
- Description textarea (auto-grow, minimum 4 rows)
- Priority selector: Large radio cards with icons (not dropdown)
- Unit/Building: Combo inputs (autocomplete friendly)
- Image upload: 
  - Large drop zone (full-width, 120px height)
  - Camera icon + "Tap to capture/upload"
  - Mobile: Opens native camera/gallery picker
  - Thumbnail grid with delete (X button on top-right)
- Submit button: Bottom sticky bar (always visible)
- Save draft: Secondary action

### Ticket Detail Page (`/dashboard/tickets/:ticketId`)
**Mobile Layout: Vertical scroll with sticky action bar**

- **Header section** (sticky on scroll):
  - Back button (top-left)
  - Title (truncate if long)
  - Status/priority badges
  - Share/options menu (top-right)

- **Hero section**:
  - Image carousel (swipeable if multiple)
  - Pinch-to-zoom support
  - Full-screen image modal on tap

- **Info cards** (collapsible accordions on mobile):
  - Created by, date
  - Assigned to (with avatar)
  - Location (unit/building)

- **Action bar** (bottom sticky, role-based):
  - Manager: "Assign" | "Edit Priority" | "Change Status" (icon buttons)
  - Technician: Large "Start Work" or "Mark Done" button
  - Tenant: "Add Comment" button

- **Activity timeline**: Expandable/collapsible, vertical line with icons

- **Comments section**:
  - Threaded view
  - "Add Comment" expands to textarea + submit
  - Optimistic UI: Comment appears immediately

### Notifications Page (`/dashboard/notifications`)
**Mobile Layout:**
- Tabs: "All" / "Unread" (swipeable)
- "Mark all as read" button (top-right)
- Notification cards: Full-width
  - Unread: Blue left border + bold text
  - Avatar + icon (left)
  - Message (truncate if long)
  - Time (relative, e.g., "2h ago")
  - Tap entire card to navigate
  - Swipe left: "Mark as read" action
- Empty state: Centered with icon
- Pull-to-refresh enabled
- Individual mark-as-read (swipe or click)

---

## Mobile-First Design Principles

1. **Touch targets**: Min 44px height for all interactive elements
2. **Bottom navigation**: 4 tabs — Dashboard, Tickets, New Ticket(+), Notifications
3. **Cards over tables**: Ticket data displayed as cards, not rows
4. **Swipe actions**: Mark notification as read
5. **Floating action button**: "+" on ticket list to create new (tenant/manager)
6. **Sheet/bottom-drawer**: Filters, assign dialog on mobile
7. **Responsive breakpoints**:
   - `< 640px`: Mobile (bottom nav, single column)
   - `640-1024px`: Tablet (sidebar collapsible)
   - `> 1024px`: Desktop (sidebar always visible)

---

## API Client Setup (`lib/api.ts`)

```ts
const api = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach Bearer token
// Response interceptor: handle 401 → redirect to login
```

---

## Auth Flow

1. User logs in → receives JWT token
2. Token stored in `localStorage` + Zustand store
3. On app load, check localStorage for token
4. If token exists, call `GET /api/auth/me` to validate
5. If valid, set user in store, proceed
6. If invalid/expired, clear token, redirect to `/login`
7. Protected routes check store before rendering

---

## State Management Strategy

| Concern          | Solution                                                |
| ---------------- | ------------------------------------------------------- |
| Auth state       | Zustand store (`auth-store.ts`)                         |
| Server data      | **TanStack Query** (queries, mutations, caching)        |
| Optimistic UI    | **TanStack Query** optimistic updates                   |
| Route data       | TanStack Router loaders (initial data fetch)            |
| Form state       | `react-hook-form` + Zod validation                      |
| UI state         | Local React state                                       |

### TanStack Query Strategy
- **Queries**: Auto-caching, background refetch, stale-while-revalidate
- **Mutations**: Optimistic updates for instant UI feedback
- **Cache invalidation**: Granular control per resource
- **Prefetching**: On route hover/navigation
- **Polling**: Real-time updates for notifications

> **📘 Full Guide:** See **[12-tanstack-query.md](./12-tanstack-query.md)** for complete implementation patterns, code examples, query hooks, and best practices.

---

## Color Coding

### Status Colors
| Status      | Color                   | Tailwind Class               |
| ----------- | ----------------------- | ---------------------------- |
| Open        | Blue                    | `bg-blue-100 text-blue-700`  |
| Assigned    | Yellow/Amber            | `bg-amber-100 text-amber-700`|
| In Progress | Purple                  | `bg-purple-100 text-purple-700`|
| Done        | Green                   | `bg-green-100 text-green-700`|
| Reopened    | Red                     | `bg-red-100 text-red-700`    |

### Priority Colors
| Priority | Color                     | Tailwind Class               |
| -------- | ------------------------- | ---------------------------- |
| Low      | Gray                      | `bg-gray-100 text-gray-600`  |
| Medium   | Blue                      | `bg-blue-100 text-blue-600`  |
| High     | Orange                    | `bg-orange-100 text-orange-600`|
| Urgent   | Red (pulsing)             | `bg-red-100 text-red-600`    |
