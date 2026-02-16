# Backend Architecture & File Structure

## New Dependencies to Install

```bash
# Auth
bun add bcryptjs jsonwebtoken
bun add -d @types/bcryptjs @types/jsonwebtoken

# Validation
bun add zod
```

---

## Backend File Structure (Final)

```
backend/
├── src/
│   ├── app.ts                          # Express app setup (EXISTING - modify)
│   ├── server.ts                       # Server entry (EXISTING - no change)
│   │
│   ├── config/
│   │   ├── database.ts                 # DB connection (EXISTING - no change)
│   │   ├── env.ts                      # Env vars (EXISTING - extend)
│   │   └── swagger.ts                  # Swagger config (EXISTING - no change)
│   │
│   ├── models/
│   │   └── schema.ts                   # Drizzle schema (EXISTING - extend with all tables)
│   │
│   ├── middlewares/
│   │   ├── error.middleware.ts          # Error handler (EXISTING - enhance)
│   │   ├── auth.middleware.ts           # NEW — JWT verification
│   │   └── role.middleware.ts           # NEW — Role-based access guard
│   │
│   ├── routes/
│   │   ├── index.ts                    # Route aggregator (EXISTING - extend)
│   │   ├── health.routes.ts            # Health check (EXISTING - no change)
│   │   ├── user.routes.ts              # User CRUD (EXISTING - keep)
│   │   ├── auth.routes.ts              # NEW — Auth routes
│   │   ├── ticket.routes.ts            # NEW — Ticket routes
│   │   ├── notification.routes.ts      # NEW — Notification routes
│   │   └── dashboard.routes.ts         # NEW — Dashboard stats routes
│   │
│   ├── controllers/
│   │   ├── health.controller.ts        # (EXISTING - no change)
│   │   ├── user.controller.ts          # (EXISTING - keep)
│   │   ├── auth.controller.ts          # NEW — Auth handlers
│   │   ├── ticket.controller.ts        # NEW — Ticket handlers
│   │   ├── notification.controller.ts  # NEW — Notification handlers
│   │   └── dashboard.controller.ts     # NEW — Dashboard handlers
│   │
│   ├── services/
│   │   ├── user.service.ts             # (EXISTING - keep)
│   │   ├── auth.service.ts             # NEW — Auth logic
│   │   ├── ticket.service.ts           # NEW — Ticket CRUD + workflow
│   │   ├── activity.service.ts         # NEW — Activity log writer
│   │   ├── notification.service.ts     # NEW — Notification CRUD + creator
│   │   └── dashboard.service.ts        # NEW — Stats aggregation
│   │
│   ├── validators/
│   │   ├── auth.validator.ts           # NEW — Zod schemas for auth
│   │   └── ticket.validator.ts         # NEW — Zod schemas for tickets
│   │
│   ├── utils/
│   │   ├── async-handler.ts            # (EXISTING - no change)
│   │   ├── jwt.ts                      # NEW — JWT sign/verify helpers
│   │   ├── password.ts                 # NEW — Hash/compare helpers
│   │   └── api-error.ts               # NEW — Custom error class
│   │
│   └── scripts/
│       └── seed.ts                     # NEW — Seed demo data
│
├── drizzle/                            # Migration files (auto-generated)
├── drizzle.config.ts                   # (EXISTING - no change)
├── package.json
└── tsconfig.json
```

---

## Module Details

### `config/env.ts` — Extend

Add:
```
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d
```

### `utils/api-error.ts` — New

```ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: unknown[]
  ) {
    super(message);
  }
}
```

### `utils/jwt.ts` — New

```ts
signToken(payload: { userId: string; role: string }): string
verifyToken(token: string): { userId: string; role: string }
```

### `utils/password.ts` — New

```ts
hashPassword(password: string): Promise<string>
comparePassword(password: string, hash: string): Promise<boolean>
```

### `middlewares/auth.middleware.ts` — New

- Extracts `Bearer <token>` from `Authorization` header
- Verifies JWT
- Fetches user from DB
- Attaches `req.user` (id, name, email, role)
- Returns `401` if invalid/missing

### `middlewares/role.middleware.ts` — New

```ts
export const requireRole = (...roles: string[]) => middleware
```
- Checks `req.user.role` against allowed roles
- Returns `403` if not authorized

### `middlewares/error.middleware.ts` — Enhance

- Handle `ApiError` with proper status codes
- Handle Zod validation errors → `400` with field errors
- Handle multer errors (file too large, wrong type)
- Keep generic `500` fallback

### `services/activity.service.ts` — New

```ts
logActivity(params: {
  ticketId: string;
  actorId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
}): Promise<void>
```

Called internally by ticket service on every state change.

### `services/notification.service.ts` — New

```ts
createNotification(params: {
  userId: string;
  ticketId?: string;
  type: string;
  title: string;
  message: string;
}): Promise<void>

getNotifications(userId: string, filters): Promise<...>
markAsRead(notificationId: string, userId: string): Promise<void>
markAllAsRead(userId: string): Promise<number>
```

### Express `req` Type Extension

File: `backend/src/types/express.d.ts`
```ts
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      name: string;
      email: string;
      role: "tenant" | "manager" | "technician";
    };
  }
}
```

---

## Business Logic: Ticket Workflow

### On Create Ticket
1. Insert ticket with status `open`
2. Save uploaded images (if any)
3. Create activity log: `created`
4. Notify all managers: `ticket_created`

### On Assign Technician
1. Update `assigned_to` on ticket
2. If status is `open`, auto-set to `assigned`
3. Create activity log: `assigned`
4. Create activity log: `status_changed` (if changed)
5. Notify technician: `ticket_assigned`
6. Notify tenant: `status_updated`

### On Status Change
1. Validate transition is valid
2. Update status
3. Create activity log: `status_changed`
4. Notify relevant parties: `status_updated`

### On Comment
1. Insert comment
2. Create activity log: `comment_added`
3. Notify other participants: `comment_added`

### On Image Upload (Frontend → S3)
1. Frontend uploads directly to S3 bucket
2. Frontend receives public S3 URL
3. Frontend sends URL to backend API
4. Backend validates URL format
5. Backend inserts image record with S3 URL
6. Backend creates activity log: `image_uploaded`

---

## Seed Script

`bun run src/scripts/seed.ts`

Add to `package.json`:
```json
"db:seed": "bun run src/scripts/seed.ts"
```

Steps:
1. Clear all tables (in reverse FK order)
2. Insert demo users (with hashed passwords)
3. Insert demo tickets
4. Insert demo images (use public S3 URLs or placeholder URLs)
5. Insert demo activity logs
6. Insert demo comments
7. Insert demo notifications
8. Log summary
