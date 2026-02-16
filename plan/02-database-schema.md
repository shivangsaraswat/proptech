# Database Schema Design

## Entity Relationship

```
users ─────────┬──────────────────────────────────────────┐
               │                                          │
               ▼                                          ▼
           tickets ◄──────── ticket_assignments ──► users (technician)
               │
               ├──► ticket_images
               ├──► ticket_activity_log
               ├──► ticket_comments
               └──► notifications ──► users (recipient)
```

---

## Tables

### `users`

| Column         | Type                     | Constraints                          |
| -------------- | ------------------------ | ------------------------------------ |
| `id`           | `uuid`                   | PK, DEFAULT gen_random_uuid()        |
| `name`         | `varchar(255)`           | NOT NULL                             |
| `email`        | `varchar(255)`           | NOT NULL, UNIQUE                     |
| `password_hash`| `varchar(255)`           | NOT NULL                             |
| `role`         | `enum('tenant','manager','technician')` | NOT NULL, DEFAULT 'tenant' |
| `phone`        | `varchar(20)`            | nullable                             |
| `avatar_url`   | `varchar(500)`           | nullable                             |
| `is_active`    | `boolean`                | NOT NULL, DEFAULT true               |
| `created_at`   | `timestamp with tz`      | NOT NULL, DEFAULT now()              |
| `updated_at`   | `timestamp with tz`      | NOT NULL, DEFAULT now()              |

### `tickets`

| Column         | Type                     | Constraints                          |
| -------------- | ------------------------ | ------------------------------------ |
| `id`           | `uuid`                   | PK, DEFAULT gen_random_uuid()        |
| `title`        | `varchar(255)`           | NOT NULL                             |
| `description`  | `text`                   | NOT NULL                             |
| `status`       | `enum('open','assigned','in_progress','done','reopened')` | NOT NULL, DEFAULT 'open' |
| `priority`     | `enum('low','medium','high','urgent')` | NOT NULL, DEFAULT 'medium' |
| `created_by`   | `uuid`                   | NOT NULL, FK → users.id              |
| `assigned_to`  | `uuid`                   | nullable, FK → users.id             |
| `unit_number`  | `varchar(50)`            | nullable (e.g., "Apt 3B")           |
| `building`     | `varchar(255)`           | nullable                             |
| `created_at`   | `timestamp with tz`      | NOT NULL, DEFAULT now()              |
| `updated_at`   | `timestamp with tz`      | NOT NULL, DEFAULT now()              |

Indexes:
- `idx_tickets_status` on `status`
- `idx_tickets_created_by` on `created_by`
- `idx_tickets_assigned_to` on `assigned_to`
- `idx_tickets_priority` on `priority`

### `ticket_images`

| Column         | Type                     | Constraints                          |
| -------------- | ------------------------ | ------------------------------------ |
| `id`           | `uuid`                   | PK, DEFAULT gen_random_uuid()        |
| `ticket_id`    | `uuid`                   | NOT NULL, FK → tickets.id, CASCADE   |
| `url`          | `varchar(1000)`          | NOT NULL (S3 public URL)             |
| `filename`     | `varchar(255)`           | NOT NULL (extracted from URL)        |
| `uploaded_by`  | `uuid`                   | NOT NULL, FK → users.id              |
| `created_at`   | `timestamp with tz`      | NOT NULL, DEFAULT now()              |

### `ticket_activity_log`

| Column         | Type                     | Constraints                          |
| -------------- | ------------------------ | ------------------------------------ |
| `id`           | `uuid`                   | PK, DEFAULT gen_random_uuid()        |
| `ticket_id`    | `uuid`                   | NOT NULL, FK → tickets.id, CASCADE   |
| `actor_id`     | `uuid`                   | NOT NULL, FK → users.id              |
| `action`       | `varchar(50)`            | NOT NULL (see action types below)    |
| `old_value`    | `varchar(255)`           | nullable                             |
| `new_value`    | `varchar(255)`           | nullable                             |
| `metadata`     | `jsonb`                  | nullable (extra context)             |
| `created_at`   | `timestamp with tz`      | NOT NULL, DEFAULT now()              |

**Action types:**
- `created` — ticket created
- `status_changed` — status transition
- `priority_changed` — priority changed
- `assigned` — technician assigned
- `unassigned` — technician removed
- `comment_added` — comment posted
- `image_uploaded` — image added

### `ticket_comments`

| Column         | Type                     | Constraints                          |
| -------------- | ------------------------ | ------------------------------------ |
| `id`           | `uuid`                   | PK, DEFAULT gen_random_uuid()        |
| `ticket_id`    | `uuid`                   | NOT NULL, FK → tickets.id, CASCADE   |
| `author_id`    | `uuid`                   | NOT NULL, FK → users.id              |
| `content`      | `text`                   | NOT NULL                             |
| `created_at`   | `timestamp with tz`      | NOT NULL, DEFAULT now()              |

### `notifications`

| Column         | Type                     | Constraints                          |
| -------------- | ------------------------ | ------------------------------------ |
| `id`           | `uuid`                   | PK, DEFAULT gen_random_uuid()        |
| `user_id`      | `uuid`                   | NOT NULL, FK → users.id, CASCADE     |
| `ticket_id`    | `uuid`                   | nullable, FK → tickets.id            |
| `type`         | `varchar(50)`            | NOT NULL                             |
| `title`        | `varchar(255)`           | NOT NULL                             |
| `message`      | `text`                   | NOT NULL                             |
| `is_read`      | `boolean`                | NOT NULL, DEFAULT false              |
| `created_at`   | `timestamp with tz`      | NOT NULL, DEFAULT now()              |

**Notification types:**
- `ticket_created` — manager notified when tenant creates ticket
- `ticket_assigned` — technician notified when assigned
- `status_updated` — tenant notified when status changes
- `comment_added` — relevant parties notified on new comment

---

## Drizzle Schema File Structure

The schema will live in `backend/src/models/schema.ts` (extend existing file).

Enums to define:
```ts
export const userRoleEnum = pgEnum("user_role", ["tenant", "manager", "technician"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "assigned", "in_progress", "done", "reopened"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high", "urgent"]);
```

---

## Seed Data Plan

File: `backend/src/scripts/seed.ts`

### Demo Users (passwords all: `password123`)
| Name              | Email                    | Role       |
| ----------------- | ------------------------ | ---------- |
| Ahmed Tenant      | tenant@demo.com          | tenant     |
| Sara Manager      | manager@demo.com         | manager    |
| Ali Technician    | technician@demo.com      | technician |
| Fatima Tenant     | tenant2@demo.com         | tenant     |
| Omar Technician   | technician2@demo.com     | technician |

### Demo Tickets (8-10 tickets across various statuses and priorities)
### Demo Activity Logs (auto-generated with tickets)
### Demo Comments (2-3 per ticket)
### Demo Notifications (unread notifications for each user)
