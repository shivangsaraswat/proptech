# Logging Quick Reference Guide

## Import Logger

```typescript
import { logger, serviceLogger, authLogger, logSuccess, logError } from "../utils/logger";
```

## Basic Logging

```typescript
// Info
logger.info("Simple message");
logger.info({ userId: "123" }, "Message with context");

// Warning
logger.warn({ issue: "something" }, "Warning message");

// Error
logger.error({ error }, "Error occurred");

// Debug (only in development)
logger.debug({ data }, "Debug information");
```

## Request Logger (Automatic)

Every request automatically gets:
- `req.requestId` - Unique UUID
- `req.logger` - Request-specific logger
- `req.startTime` - For duration calculation

Use in controllers:
```typescript
export const myController = {
  async myAction(req: Request, res: Response, next: NextFunction) {
    req.logger.info({ action: "processing" }, "Handling request");
    // ... your code ...
  }
};
```

## Service Logging Pattern

```typescript
export const myService = {
  async myOperation(input: any, userId: string) {
    const startTime = Date.now();
    
    // Log start
    serviceLogger.info({ userId, input }, "Starting operation");

    try {
      // Do work
      const result = await doWork();

      // Log success with duration
      logSuccess(
        serviceLogger,
        "Operation completed successfully",
        Date.now() - startTime,
        { resultId: result.id, userId }
      );

      return result;
    } catch (error) {
      // Log error with context
      logError(
        serviceLogger,
        "Operation failed",
        error as Error,
        { userId, input }
      );
      throw error; // Re-throw for error middleware
    }
  }
};
```

## Available Loggers

```typescript
import {
  logger,         // Base logger
  authLogger,     // For authentication operations
  serviceLogger,  // For service layer
  dbLogger,       // For database operations
} from "../utils/logger";
```

## Helper Functions

### Log Success with Duration
```typescript
logSuccess(
  logger,
  "Operation completed",
  duration,  // in milliseconds
  { key: "value" }  // optional context
);
```

### Log Error with Context
```typescript
logError(
  logger,
  "Operation failed",
  error,  // Error object
  { key: "value" }  // optional context
);
```

### Create Custom Logger
```typescript
const myLogger = createContextLogger({ module: "my-module" });
myLogger.info("Message from my module");
```

## Common Patterns

### Authentication
```typescript
authLogger.info({ email }, "User login attempt");
authLogger.warn({ email }, "Login failed: invalid password");
logSuccess(authLogger, "User logged in", duration, { userId, email });
```

### CRUD Operations
```typescript
// Create
serviceLogger.info({ userId, data }, "Creating resource");
logSuccess(serviceLogger, "Resource created", duration, { resourceId });

// Update
serviceLogger.info({ resourceId, updates }, "Updating resource");
logSuccess(serviceLogger, "Resource updated", duration, { resourceId });

// Delete
serviceLogger.info({ resourceId }, "Deleting resource");
logSuccess(serviceLogger, "Resource deleted", duration, { resourceId });
```

### Error Handling
```typescript
try {
  // operation
} catch (error) {
  if (error instanceof ApiError) {
    // Expected error - log as warning
    logger.warn({ error: error.message }, "Operation failed");
  } else {
    // Unexpected error - log with full context
    logError(logger, "Unexpected error", error as Error, { context });
  }
  throw error;
}
```

## What Gets Logged Automatically

### Every HTTP Request
- ✅ Request ID (UUID)
- ✅ Method and URL
- ✅ Query parameters
- ✅ Request body (sanitized)
- ✅ IP address and user agent
- ✅ Response status code
- ✅ Request duration

### Sensitive Data (Automatically Redacted)
- password
- token
- secret
- accessToken
- refreshToken

Shows as `[REDACTED]` in logs

## Development vs Production

### Development (Pretty Logs)
```bash
bun run dev
```
Output:
```
[14:30:52] INFO: User registered successfully
    userId: "123e4567-e89b-12d3-a456-426614174000"
    email: "user@example.com"
    duration: "245ms"
```

### Production (JSON Logs)
```bash
NODE_ENV=production bun run start
```
Output:
```json
{"level":"INFO","time":"2026-02-16T14:30:52.789Z","userId":"123e4567...","duration":"245ms","msg":"User registered successfully"}
```

## Log Levels (When to Use)

| Level | Use Case | Example |
|-------|----------|---------|
| `debug` | Development details | "Query executed", "Cache hit" |
| `info` | Normal operations | "User created", "Request completed" |
| `warn` | Recoverable issues | "Invalid input", "Retry attempt" |
| `error` | System errors | "Database down", "Unhandled exception" |

## Tips

### ✅ Good Practices
```typescript
// Include relevant IDs
logger.info({ userId, ticketId }, "Message");

// Log operation boundaries
logger.info("Starting");
// work...
logSuccess(logger, "Completed", duration);

// Use structured data
logger.info({ count: 10, type: "ticket" }, "Processed items");
```

### ❌ Avoid
```typescript
// Don't use console.log
console.log("message"); // ❌

// Don't log in loops
items.forEach(item => logger.info({ item })); // ❌

// Don't log sensitive data manually
logger.info({ password: user.password }); // ❌ (use middleware sanitization)
```

## Quick Test

```bash
# Start server
bun run dev

# Make request
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Check console for:
# 1. Incoming request log
# 2. Login attempt log
# 3. Login success/failure log
# 4. Request completed log
```

## Need Help?

See full documentation: `LOGGING_IMPLEMENTATION.md`
