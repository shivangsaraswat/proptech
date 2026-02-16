# Technical PRD — Property Maintenance Management System

## 1. Project Overview

A **mobile-first** web application for property maintenance management that connects **Tenants**, **Property Managers**, and **Technicians** through a streamlined ticket-based workflow.

**Design Philosophy:**
- 📱 **Mobile-first**: Touch-optimized UI, thumb-friendly navigation, responsive from 320px+
- ⚡ **Progressive enhancement**: Works on mobile, enhances on tablet/desktop
- 🎯 **Touch targets**: Minimum 44x44px tap areas
- 📊 **Bottom navigation**: Primary navigation at thumb-reach on mobile
- 🖼️ **Mobile-optimized layouts**: Cards, lists, modals optimized for small screens

---

## 2. Existing Stack (Already Set Up)

| Layer     | Technology                                                        |
| --------- | ----------------------------------------------------------------- |
| Runtime   | Bun                                                               |
| Backend   | Express 4, TypeScript, Drizzle ORM, PostgreSQL, Swagger           |
| Frontend  | React 19, TanStack Start/Router, Vite 7, Tailwind CSS 4, Shadcn (radix-mira style, hugeicons) |
| Styling   | Tailwind v4 + `tw-animate-css` + custom oklch design tokens       |
| DB        | PostgreSQL via `postgres` driver + Drizzle ORM                    |
| Docs      | Swagger/OpenAPI at `/api-docs`                                    |

### Existing Patterns to Follow

- **MVC**: `routes → controllers → services → models(schema)`
- **Error handling**: `asyncHandler` wrapper + central `errorMiddleware`
- **Routing (FE)**: TanStack file-based routing (`src/routes/`)
- **Components**: Shadcn UI with `@/components/ui/*`, BaseUI, hugeicons
- **Path aliases**: `@/*` → `./src/*`

---

## 3. Roles & Permissions Matrix

| Action                          | Tenant | Manager | Technician |
| ------------------------------- | :----: | :-----: | :--------: |
| Register / Login                |   ✅   |   ✅    |     ✅     |
| Create maintenance ticket       |   ✅   |   ✅    |     ❌     |
| View own tickets                |   ✅   |   ✅    |     ❌     |
| View ALL tickets                |   ❌   |   ✅    |     ❌     |
| Assign technician               |   ❌   |   ✅    |     ❌     |
| Change priority                 |   ❌   |   ✅    |     ❌     |
| Change status (any → any)       |   ❌   |   ✅    |     ❌     |
| View assigned tickets           |   ❌   |   ❌    |     ✅     |
| Update status (assigned to them)|   ❌   |   ❌    |     ✅     |
| Add comment / note              |   ✅   |   ✅    |     ✅     |
| View activity log               |   ✅   |   ✅    |     ✅     |
| Manage users (list technicians) |   ❌   |   ✅    |     ❌     |

---

## 4. Status Flow

```
Open  →  Assigned  →  In Progress  →  Done
         ↑                              │
         └──────── Reopened ←───────────┘
```

State transitions:
- **Open**: Tenant creates ticket (auto)
- **Assigned**: Manager assigns a technician
- **In Progress**: Technician starts working
- **Done**: Technician or Manager marks complete
- **Reopened**: Manager reopens a completed ticket (edge case)

---

## 5. Priority Levels

`low` | `medium` | `high` | `urgent`

Default: `medium` (set on creation)

---

## 6. Implementation Phases

### Phase 1 — Foundation (Day 1)
- Database schema (all tables)
- Auth system (register, login, JWT)
- Auth middleware + role guard
- Seed script with demo data

### Phase 2 — Core Backend (Day 1-2)
- Ticket CRUD endpoints
- File upload (images)
- Assignment & status workflow
- Activity log system
- In-app notifications

### Phase 3 — Frontend Foundation (Day 2)
- Auth pages (login, register)
- Layout system (auth layout, dashboard layout)
- API client setup
- Auth context/store

### Phase 4 — Frontend Features (Day 2-3)
- Tenant dashboard + ticket creation
- Manager dashboard + ticket management
- Technician dashboard + task view
- Ticket detail page with activity log
- Notification bell

### Phase 5 — Polish (Day 3-4)
- Mobile responsiveness pass
- Error states & loading skeletons
- Demo data seeding
- Documentation
- Docker setup (bonus)
