# Plan Index

Technical PRD for the Property Maintenance Management System.

## Documents

| # | File | Description |
|---|------|-------------|
| 01 | [Overview](./01-overview.md) | Project overview, roles, permissions, status flow, phases |
| 02 | [Database Schema](./02-database-schema.md) | All tables, columns, types, relationships, seed data plan |
| 03 | [API Endpoints](./03-api-endpoints.md) | Every HTTP endpoint with request/response payloads |
| 04 | [Backend Architecture](./04-backend-architecture.md) | File structure, modules, dependencies, business logic |
| 05 | [Frontend Architecture](./05-frontend-architecture.md) | File structure, layouts, pages, components, state management |
| 06 | [Implementation Steps](./06-implementation-steps.md) | Step-by-step build order with test checkpoints |
| 07 | [Edge Cases](./07-edge-cases.md) | Error handling, edge cases, response standardization |
| 08 | [UI Wireframes](./08-ui-wireframes.md) | Text-based wireframes for all major screens |
| 09 | [Testing & Deployment](./09-testing-deployment.md) | Test strategy, Docker, env vars, demo walkthrough |
| 10 | [UUID Implementation](./10-uuid-implementation.md) | UUID usage instead of serial IDs, patterns, validation |
| 11 | [S3 File Uploads](./11-s3-file-uploads.md) | S3 direct upload architecture, setup, implementation |
| 12 | [TanStack Query Patterns](./12-tanstack-query.md) | Query hooks, optimistic UI, caching, state management |
| 13 | [Mobile-First Design](./13-mobile-first-design.md) | Touch targets, responsive layouts, gestures, performance |

## Tech Stack Summary

- **Backend:** Bun + Express + TypeScript + Drizzle ORM + PostgreSQL + JWT Auth
- **Frontend:** React 19 + TanStack Start (Router + Query) + Vite + Tailwind v4 + Shadcn UI
- **Storage:** AWS S3 (direct frontend uploads)
- **State:** TanStack Query (server state + optimistic UI) + Zustand (auth) + react-hook-form
- **Validation:** Zod (both ends)
- **Database:** PostgreSQL with UUID primary keys (pgcrypto)

## Quick Reference: Demo Credentials

| Role       | Email                | Password     |
|------------|----------------------|--------------|
| Tenant     | tenant@demo.com      | password123  |
| Manager    | manager@demo.com     | password123  |
| Technician | technician@demo.com  | password123  |
