# UUID Implementation Notes

All database tables now use UUIDs instead of serial/integer IDs.

## Database Changes

### PostgreSQL UUID Extension
Ensure the `uuid-ossp` or `pgcrypto` extension is enabled:
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Drizzle Schema Pattern
```ts
import { uuid, pgTable } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(), // or .default(sql`gen_random_uuid()`)
  // ... other fields
});

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  assignedTo: uuid("assigned_to").references(() => users.id),
  // ... other fields
});
```

## TypeScript Types

All ID fields are now `string` type:

```ts
// User type
interface User {
  id: string;  // UUID
  name: string;
  email: string;
  role: "tenant" | "manager" | "technician";
}

// Ticket type
interface Ticket {
  id: string;  // UUID
  createdBy: string;  // UUID
  assignedTo?: string;  // UUID
  // ...
}
```

## API Changes

### JWT Payload
```ts
// Before
{ userId: 1, role: "tenant" }

// After
{ userId: "550e8400-e29b-41d4-a716-446655440000", role: "tenant" }
```

### URL Parameters
Routes with IDs remain the same:
```
GET /api/tickets/:id
PATCH /api/tickets/:id
```

But the `:id` param is now a UUID string:
```
GET /api/tickets/a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d
```

### Request Bodies
When referencing IDs in request bodies:
```json
{
  "assignedTo": "7c8d9e0f-1a2b-4c5d-8e9f-0a1b2c3d4e5f"
}
```

## Validation

### Zod Schema for UUIDs
```ts
import { z } from "zod";

const uuidSchema = z.string().uuid();

const assignTicketSchema = z.object({
  assignedTo: uuidSchema,
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});
```

## Frontend Considerations

### No Change Required
Since JavaScript/TypeScript treats all IDs as strings anyway, the frontend code doesn't need modification for UUID vs integer IDs.

```tsx
// Works the same for both
const ticket = { id: "uuid-here" };
navigate(`/tickets/${ticket.id}`);
```

### Display
UUIDs are long. When displaying in UI:
- Use full UUID in data attributes or keys
- Show shortened version in logs: `ticket.id.slice(0, 8)`
- Don't show IDs to users (they're not meant to be user-facing)

## Benefits of UUIDs

1. **Distributed systems**: Can generate IDs client-side or across multiple DB instances
2. **Security**: Harder to enumerate/guess IDs
3. **Merging**: No ID collision when merging data from different sources
4. **URL obfuscation**: Less revealing than sequential integers

## Performance Considerations

- UUIDs are 128-bit (16 bytes) vs integers (4-8 bytes)
- Slightly slower for indexing (use UUID v7 for better performance if needed)
- Modern PostgreSQL handles UUIDs efficiently
- For this project scale, performance difference is negligible
