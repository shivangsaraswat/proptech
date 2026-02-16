# Testing & Deployment Plan

---

## Testing Strategy

### Backend Testing

**Tool:** Bun's built-in test runner (`bun test`)

#### Unit Tests (Priority: High)
| Module                  | Test File                              | What to Test                                    |
| ----------------------- | -------------------------------------- | ----------------------------------------------- |
| `utils/password.ts`     | `__tests__/utils/password.test.ts`     | Hash/compare, empty strings, long passwords     |
| `utils/jwt.ts`          | `__tests__/utils/jwt.test.ts`          | Sign/verify, expired token, invalid token       |
| `validators/*`          | `__tests__/validators/*.test.ts`       | Valid/invalid inputs for all Zod schemas         |
| `services/auth`         | `__tests__/services/auth.test.ts`      | Register, login, duplicate email, wrong password |
| `services/ticket`       | `__tests__/services/ticket.test.ts`    | CRUD, access control, status transitions        |

#### Integration Tests (Priority: Medium)
| Test                        | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| Auth flow                   | Register → Login → Access protected route                 |
| Ticket lifecycle            | Create → Assign → In Progress → Done                     |
| Role access                 | Tenant can't assign, technician can't create, etc.        |
| File upload                 | Upload image, verify stored, verify served                |

### Frontend Testing

**Tool:** Vitest + Testing Library (already configured)

#### Component Tests (Priority: Medium)
| Component                | What to Test                                               |
| ------------------------ | ---------------------------------------------------------- |
| `login-form`             | Renders, validates, submits, shows errors                  |
| `register-form`          | Renders, validates role selection, submits                 |
| `ticket-card`            | Renders ticket data, badges, click handler                 |
| `ticket-status-badge`    | Correct color/label for each status                        |
| `ticket-priority-badge`  | Correct color/label for each priority                      |
| `stats-cards`            | Renders counts correctly                                   |

---

## Deployment Plan

### Option A: Docker Compose (Recommended)

```yaml
# docker-compose.yml (project root)
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: proptech
      POSTGRES_USER: proptech
      POSTGRES_PASSWORD: proptech123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://proptech:proptech123@postgres:5432/proptech
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    depends_on:
      - postgres
    volumes:
      - uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:4000/api

volumes:
  pgdata:
  uploads:
```

### Backend Dockerfile
```dockerfile
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run typecheck

FROM oven/bun:1
WORKDIR /app
COPY --from=builder /app ./
RUN mkdir -p uploads
EXPOSE 4000
CMD ["bun", "run", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
```

---

## Environment Variables Summary

### Backend `.env`
```env
# Server
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/proptech

# Auth
JWT_SECRET=change-this-in-production-use-a-long-random-string
JWT_EXPIRES_IN=7d

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:4000/api
```

---

## Startup Commands (Development)

```bash
# Terminal 1: Database (if not using Docker)
# Ensure PostgreSQL is running

# Terminal 2: Backend
cd backend
cp .env.example .env  # Edit with your DB credentials
bun install
bun run db:push       # Push schema to DB
bun run db:seed       # Seed demo data
bun run dev           # Start dev server on :4000

# Terminal 3: Frontend
cd frontend
bun install
bun run dev           # Start dev server on :3000
```

---

## Demo Walkthrough Script

1. **Open** `http://localhost:3000`
2. **Login as Tenant** (`tenant@demo.com` / `password123`)
   - See tenant dashboard with stats
   - Create a new maintenance ticket with image
   - View ticket in list
3. **Login as Manager** (`manager@demo.com` / `password123`)
   - See full dashboard with all tickets
   - Open the ticket created above
   - Assign a technician
   - Change priority to "high"
   - View notification bell
4. **Login as Technician** (`technician@demo.com` / `password123`)
   - See assigned tasks
   - See notification about new assignment
   - Start work (status → In Progress)
   - Add a comment
   - Mark as done
5. **Login as Tenant** again
   - See notification about status change
   - View completed ticket with full activity log
