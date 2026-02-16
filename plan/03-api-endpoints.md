# Backend API Endpoints

Base URL: `http://localhost:4000/api`

All responses follow the pattern:
```json
// Success
{ "data": <payload> }

// Error
{ "message": "Error description", "errors": [...] }
```

All protected routes require header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Auth Endpoints

### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "Ahmed Tenant",
  "email": "tenant@demo.com",
  "password": "password123",
  "role": "tenant",
  "phone": "+1234567890"
}
```

**Validation:**
- `name`: required, 2-255 chars
- `email`: required, valid email, unique
- `password`: required, min 8 chars
- `role`: required, one of `tenant | manager | technician`
- `phone`: optional

**Response `201`:**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Ahmed Tenant",
      "email": "tenant@demo.com",
      "role": "tenant",
      "phone": "+1234567890",
      "createdAt": "2026-02-16T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
- `400` — Validation errors
- `409` — Email already exists

---

### POST `/api/auth/login`
Authenticate user.

**Request Body:**
```json
{
  "email": "tenant@demo.com",
  "password": "password123"
}
```

**Response `200`:**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Ahmed Tenant",
      "email": "tenant@demo.com",
      "role": "tenant",
      "phone": "+1234567890",
      "createdAt": "2026-02-16T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**
- `400` — Missing fields
- `401` — Invalid credentials

---

### GET `/api/auth/me`
Get current user profile. **Protected.**

**Response `200`:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ahmed Tenant",
    "email": "tenant@demo.com",
    "role": "tenant",
    "phone": "+1234567890",
    "avatarUrl": null,
    "createdAt": "2026-02-16T00:00:00.000Z"
  }
}
```

**Errors:**
- `401` — Not authenticated

---

## 2. Ticket Endpoints

### GET `/api/tickets`
List tickets (filtered by role). **Protected.**

- **Tenant**: sees only own tickets
- **Manager**: sees all tickets
- **Technician**: sees only assigned tickets

**Query Parameters:**
| Param      | Type     | Default  | Description                          |
| ---------- | -------- | -------- | ------------------------------------ |
| `status`   | string   | —        | Filter by status                     |
| `priority` | string   | —        | Filter by priority                   |
| `search`   | string   | —        | Search title/description             |
| `page`     | number   | 1        | Page number                          |
| `limit`    | number   | 20       | Items per page                       |
| `sortBy`   | string   | `createdAt` | Sort field                        |
| `sortOrder`| string   | `desc`   | `asc` or `desc`                      |

**Response `200`:**
```json
{
  "data": {
    "tickets": [
      {
        "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        "title": "Leaking faucet in kitchen",
        "description": "The kitchen faucet has been...",
        "status": "open",
        "priority": "high",
        "unitNumber": "Apt 3B",
        "building": "Sunrise Towers",
        "createdBy": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Ahmed Tenant",
          "email": "tenant@demo.com"
        },
        "assignedTo": null,
        "images": [
          {
            "id": "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e",
            "url": "/uploads/abc123.jpg",
            "filename": "faucet.jpg"
          }
        ],
        "commentCount": 3,
        "createdAt": "2026-02-16T00:00:00.000Z",
        "updatedAt": "2026-02-16T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### POST `/api/tickets`
Create a new ticket. **Protected. Roles: `tenant`, `manager`.**

**Request Body (application/json):**
| Field         | Type       | Required | Description                     |
| ------------- | ---------- | -------- | ------------------------------- |
| `title`       | string     | ✅       | 5-255 chars                     |
| `description` | string     | ✅       | 10-5000 chars                   |
| `priority`    | string     | ❌       | Default: `medium`               |
| `unitNumber`  | string     | ❌       | Apartment/unit identifier       |
| `building`    | string     | ❌       | Building name                   |
| `imageUrls`   | string[]   | ❌       | Array of S3 public URLs (max 5) |

**Example Request:**
```json
{
  "title": "Leaking faucet in kitchen",
  "description": "The kitchen faucet has been dripping...",
  "priority": "high",
  "unitNumber": "Apt 3B",
  "building": "Sunrise Towers",
  "imageUrls": [
    "https://bucket.s3.region.amazonaws.com/tickets/abc123.jpg",
    "https://bucket.s3.region.amazonaws.com/tickets/def456.jpg"
  ]
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "title": "Leaking faucet in kitchen",
    "description": "The kitchen faucet has been dripping...",
    "status": "open",
    "priority": "high",
    "unitNumber": "Apt 3B",
    "building": "Sunrise Towers",
    "createdBy": { "id": "550e8400-e29b-41d4-a716-446655440000", "name": "Ahmed Tenant" },
    "assignedTo": null,
    "images": [
      {
        "id": "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e",
        "url": "https://bucket.s3.region.amazonaws.com/tickets/abc123.jpg",
        "filename": "abc123.jpg"
      },
      {
        "id": "c3d4e5f6-a7b8-4c5d-9e0f-1a2b3c4d5e6f",
        "url": "https://bucket.s3.region.amazonaws.com/tickets/def456.jpg",
        "filename": "def456.jpg"
      }
    ],
    "createdAt": "2026-02-16T00:00:00.000Z",
    "updatedAt": "2026-02-16T00:00:00.000Z"
  }
}
```

**Errors:**
- `400` — Validation errors
- `403` — Technicians cannot create tickets

---

### GET `/api/tickets/:id`
Get single ticket with full details. **Protected.**

Access rules:
- Tenant: only own tickets
- Manager: any ticket
- Technician: only assigned tickets

**Response `200`:**
```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "title": "Leaking faucet in kitchen",
    "description": "The kitchen faucet has been dripping...",
    "status": "assigned",
    "priority": "high",
    "unitNumber": "Apt 3B",
    "building": "Sunrise Towers",
    "createdBy": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Ahmed Tenant",
      "email": "tenant@demo.com",
      "phone": "+1234567890"
    },
    "assignedTo": {
      "id": "7c8d9e0f-1a2b-4c5d-8e9f-0a1b2c3d4e5f",
      "name": "Ali Technician",
      "email": "technician@demo.com",
      "phone": "+9876543210"
    },
    "images": [
      {
        "id": "b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e",
        "url": "/uploads/abc123.jpg",
        "filename": "faucet.jpg",
        "mimeType": "image/jpeg",
        "sizeBytes": 245000,
        "createdAt": "2026-02-16T00:00:00.000Z"
      }
    ],
    "comments": [
      {
        "id": "c3d4e5f6-a7b8-4c5d-9e0f-1a2b3c4d5e6f",
        "content": "I'll take a look tomorrow morning.",
        "author": { "id": "7c8d9e0f-1a2b-4c5d-8e9f-0a1b2c3d4e5f", "name": "Ali Technician", "role": "technician" },
        "createdAt": "2026-02-16T01:00:00.000Z"
      }
    ],
    "activityLog": [
      {
        "id": "d4e5f6a7-b8c9-4d5e-0f1a-2b3c4d5e6f7a",
        "action": "created",
        "oldValue": null,
        "newValue": null,
        "actor": { "id": "550e8400-e29b-41d4-a716-446655440000", "name": "Ahmed Tenant" },
        "createdAt": "2026-02-16T00:00:00.000Z"
      },
      {
        "id": "e5f6a7b8-c9d0-4e5f-1a2b-3c4d5e6f7a8b",
        "action": "assigned",
        "oldValue": null,
        "newValue": "Ali Technician",
        "actor": { "id": "6b7c8d9e-0f1a-4b5c-8d9e-0f1a2b3c4d5e", "name": "Sara Manager" },
        "createdAt": "2026-02-16T00:30:00.000Z"
      }
    ],
    "createdAt": "2026-02-16T00:00:00.000Z",
    "updatedAt": "2026-02-16T00:30:00.000Z"
  }
}
```

**Errors:**
- `403` — Access denied
- `404` — Ticket not found

---

### PATCH `/api/tickets/:id`
Update ticket fields. **Protected.**

**Who can update what:**
- **Manager**: `status`, `priority`, `assignedTo`
- **Technician**: `status` (only `in_progress` or `done` for tickets assigned to them)
- **Tenant**: cannot update

**Request Body:**
```json
{
  "status": "in_progress",
  "priority": "urgent",
  "assignedTo": "7c8d9e0f-1a2b-4c5d-8e9f-0a1b2c3d4e5f"
}
```

All fields optional. Only include what you're changing.

**Business rules:**
- When `assignedTo` is set and status is `open`, status auto-changes to `assigned`
- Technician can only set status to `in_progress` or `done`
- Each field change creates an activity log entry
- Relevant notifications are created

**Response `200`:**
```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "title": "Leaking faucet in kitchen",
    "status": "in_progress",
    "priority": "urgent",
    "assignedTo": { "id": "7c8d9e0f-1a2b-4c5d-8e9f-0a1b2c3d4e5f", "name": "Ali Technician" },
    "updatedAt": "2026-02-16T01:00:00.000Z"
  }
}
```

**Errors:**
- `400` — Invalid status transition
- `403` — Not authorized for this action
- `404` — Ticket not found

---

### POST `/api/tickets/:id/comments`
Add comment to ticket. **Protected. All roles (with access).**

**Request Body:**
```json
{
  "content": "I'll be there at 10am tomorrow."
}
```

**Validation:**
- `content`: required, 1-2000 chars

**Response `201`:**
```json
{
  "data": {
    "id": "c3d4e5f6-a7b8-4c5d-9e0f-1a2b3c4d5e6f",
    "ticketId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "content": "I'll be there at 10am tomorrow.",
    "author": { "id": "7c8d9e0f-1a2b-4c5d-8e9f-0a1b2c3d4e5f", "name": "Ali Technician", "role": "technician" },
    "createdAt": "2026-02-16T01:00:00.000Z"
  }
}
```

---

### POST `/api/tickets/:id/images`
Add image URLs to a ticket (after S3 upload). **Protected. Roles: `tenant`, `manager`.**

**Request Body (application/json):**
```json
{
  "imageUrls": [
    "https://bucket.s3.region.amazonaws.com/tickets/def456.jpg",
    "https://bucket.s3.region.amazonaws.com/tickets/ghi789.jpg"
  ]
}
```

**Validation:**
- `imageUrls`: required, array of 1-5 valid URLs
- Each URL must be from allowed S3 bucket domain

**Response `201`:**
```json
{
  "data": [
    {
      "id": "f6a7b8c9-d0e1-4f5a-1b2c-3d4e5f6a7b8c",
      "ticketId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "url": "https://bucket.s3.region.amazonaws.com/tickets/def456.jpg",
      "filename": "def456.jpg",
      "createdAt": "2026-02-16T01:00:00.000Z"
    },
    {
      "id": "a7b8c9d0-e1f2-4a5b-8c9d-0e1f2a3b4c5d",
      "ticketId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "url": "https://bucket.s3.region.amazonaws.com/tickets/ghi789.jpg",
      "filename": "ghi789.jpg",
      "createdAt": "2026-02-16T01:00:00.000Z"
    }
  ]
}
```

**Errors:**
- `400` — Invalid URLs / not from allowed domain / too many
- `403` — Technicians cannot upload
- `404` — Ticket not found

---

## 3. User Endpoints (Manager Only)

### GET `/api/users/technicians`
List available technicians (for assignment dropdown). **Protected. Role: `manager`.**

**Response `200`:**
```json
{
  "data": [
    {
      "id": "7c8d9e0f-1a2b-4c5d-8e9f-0a1b2c3d4e5f",
      "name": "Ali Technician",
      "email": "technician@demo.com",
      "phone": "+9876543210",
      "assignedTicketCount": 4
    },
    {
      "id": "8d9e0f1a-2b3c-4d5e-9f0a-1b2c3d4e5f6a",
      "name": "Omar Technician",
      "email": "technician2@demo.com",
      "phone": null,
      "assignedTicketCount": 2
    }
  ]
}
```

---

## 4. Notification Endpoints

### GET `/api/notifications`
List notifications for current user. **Protected.**

**Query Parameters:**
| Param    | Type    | Default | Description              |
| -------- | ------- | ------- | ------------------------ |
| `unread` | boolean | —       | Filter unread only       |
| `limit`  | number  | 20      | Items per page           |

**Response `200`:**
```json
{
  "data": {
    "notifications": [
      {
        "id": "a7b8c9d0-e1f2-4a5b-8c9d-0e1f2a3b4c5d",
        "type": "ticket_assigned",
        "title": "New task assigned",
        "message": "You've been assigned to: Leaking faucet in kitchen",
        "ticketId": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        "isRead": false,
        "createdAt": "2026-02-16T00:30:00.000Z"
      }
    ],
    "unreadCount": 5
  }
}
```

---

### PATCH `/api/notifications/:id/read`
Mark single notification as read. **Protected.**

**Response `200`:**
```json
{
  "data": { "id": "a7b8c9d0-e1f2-4a5b-8c9d-0e1f2a3b4c5d", "isRead": true }
}
```

---

### PATCH `/api/notifications/read-all`
Mark all notifications as read. **Protected.**

**Response `200`:**
```json
{
  "data": { "markedCount": 5 }
}
```

---

## 5. Dashboard / Stats Endpoints

### GET `/api/dashboard/stats`
Get dashboard statistics based on role. **Protected.**

**Response `200` (Manager):**
```json
{
  "data": {
    "totalTickets": 45,
    "openTickets": 12,
    "assignedTickets": 8,
    "inProgressTickets": 15,
    "doneTickets": 10,
    "urgentTickets": 3,
    "recentTickets": [ /* last 5 tickets, abbreviated */ ],
    "ticketsByPriority": {
      "low": 10,
      "medium": 20,
      "high": 12,
      "urgent": 3
    }
  }
}
```

**Response `200` (Tenant):**
```json
{
  "data": {
    "myTickets": 5,
    "openTickets": 2,
    "inProgressTickets": 2,
    "doneTickets": 1,
    "recentTickets": [ /* last 5 own tickets */ ]
  }
}
```

**Response `200` (Technician):**
```json
{
  "data": {
    "assignedToMe": 6,
    "inProgress": 3,
    "completedToday": 2,
    "recentTasks": [ /* last 5 assigned tickets */ ]
  }
}
```

---

## 6. Upload / Static Files

### GET `/uploads/:filename`
Serve uploaded images. **Public** (files are served via express.static).

Upload directory: `backend/uploads/`

---

## Endpoint Summary Table

| Method  | Path                            | Auth | Roles              |
| ------- | ------------------------------- | ---- | ------------------- |
| POST    | `/api/auth/register`            | ❌   | —                   |
| POST    | `/api/auth/login`               | ❌   | —                   |
| GET     | `/api/auth/me`                  | ✅   | all                 |
| GET     | `/api/tickets`                  | ✅   | all (filtered)      |
| POST    | `/api/tickets`                  | ✅   | tenant, manager     |
| GET     | `/api/tickets/:id`              | ✅   | all (with access)   |
| PATCH   | `/api/tickets/:id`              | ✅   | manager, technician |
| POST    | `/api/tickets/:id/comments`     | ✅   | all (with access)   |
| POST    | `/api/tickets/:id/images`       | ✅   | tenant, manager     |
| GET     | `/api/users/technicians`        | ✅   | manager             |
| GET     | `/api/notifications`            | ✅   | all                 |
| PATCH   | `/api/notifications/:id/read`   | ✅   | all                 |
| PATCH   | `/api/notifications/read-all`   | ✅   | all                 |
| GET     | `/api/dashboard/stats`          | ✅   | all (role-based)    |
| GET     | `/api/health`                   | ❌   | —                   |
