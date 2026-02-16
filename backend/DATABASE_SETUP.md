# Database Setup Guide

## ⚠️ IMPORTANT: Read Before Running

This guide will help you set up the database properly. Choose ONE of the options below.

---

## Option 1: Fresh Start (Recommended for Development)

**WARNING: This will DELETE ALL existing data!**

### Step 1: Reset Database
Run this SQL script in your database (Supabase SQL Editor or psql):

```sql
-- Drop all tables
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS ticket_activity_log CASCADE;
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS ticket_images CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS ticket_priority CASCADE;

-- Drop drizzle schema
DROP SCHEMA IF EXISTS drizzle CASCADE;
```

### Step 2: Push Schema
```bash
cd backend
bun run drizzle-kit push
```

### Step 3: Seed Database (Optional)
```bash
bun run db:seed
```

---

## Option 2: Keep Existing Data

If you have important data and just need to update the schema:

### Check Current Schema
```bash
cd backend
bun run drizzle-kit studio
```

This will open Drizzle Studio where you can see your current database structure.

### Manual Migration
If the enum types are causing issues, run this SQL manually:

```sql
-- Fix user_role enum
ALTER TABLE users ALTER COLUMN role TYPE text;
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM('tenant', 'manager', 'technician');
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;

-- Fix ticket_status enum
ALTER TABLE tickets ALTER COLUMN status TYPE text;
DROP TYPE IF EXISTS ticket_status CASCADE;
CREATE TYPE ticket_status AS ENUM('open', 'assigned', 'in_progress', 'done', 'cancelled');
ALTER TABLE tickets ALTER COLUMN status TYPE ticket_status USING status::ticket_status;

-- Fix ticket_priority enum  
ALTER TABLE tickets ALTER COLUMN priority TYPE text;
DROP TYPE IF EXISTS ticket_priority CASCADE;
CREATE TYPE ticket_priority AS ENUM('low', 'medium', 'high', 'urgent');
ALTER TABLE tickets ALTER COLUMN priority TYPE ticket_priority USING priority::ticket_priority;
```

Then run:
```bash
bun run drizzle-kit push
```

---

## Quick Start (No Data, Fresh Install)

```bash
cd backend

# Method 1: Using push (recommended for development)
bun run drizzle-kit push

# Method 2: Using migrations (recommended for production)
bun run drizzle-kit generate
bun run drizzle-kit migrate

# Seed with demo data
bun run db:seed

# Start server
bun run dev
```

---

## Troubleshooting

### Error: "type user_role already exists"
Solution: Use Option 1 (Fresh Start) or manually drop the type in SQL:
```sql
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS ticket_priority CASCADE;
```

### Error: "invalid input value for enum"
Solution: Your database has data with values that don't match the enum. Either:
1. Use Option 1 (Fresh Start) to wipe all data
2. Update the data to match the enum values before migrating

### Check if database is empty
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM tickets;
```

If both return 0, you can safely use Option 1.

---

## Database Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "bun run src/scripts/seed.ts",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## Supabase-Specific Instructions

### Reset via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Paste the reset script from Option 1
5. Click "Run"
6. Then run `bun run drizzle-kit push` locally

### Direct Connection
```bash
# Connect to Supabase PostgreSQL
psql "postgresql://postgres:LZ2jykW316qToc7n@db.gxlooppuvobcmhjmqvet.supabase.co:5432/postgres"

# Run reset commands
\i reset-db.sql

# Exit
\q
```

---

## Recommended Approach for Your Setup

Since you're using Supabase and likely don't have production data yet:

1. **Go to Supabase SQL Editor**: https://supabase.com/dashboard/project/gxlooppuvobcmhjmqvet/sql/new

2. **Run this**:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

3. **Then locally run**:
```bash
cd /home/rudeus/Projects/proptech/backend
bun run drizzle-kit push
bun run db:seed
```

This gives you a completely fresh database with all the correct schema and demo data.
