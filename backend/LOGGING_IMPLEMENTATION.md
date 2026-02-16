# Centralized Logging with Pino ✅

## Overview
Implemented structured, contextual logging using Pino for all backend operations. Provides request tracking, performance monitoring, and detailed error logging.

## Installation

```bash
bun add pino pino-pretty
bun add -d @types/pino
```

## Logger Configuration

**File:** `src/utils/logger.ts`

### Features

1. **Environment-Based Configuration**
   - `production`: JSON logs (level: info)
   - `development`: Pretty-printed colored logs (level: debug)

2. **Structured Logging**
   - ISO timestamps
   - Contextual data with every log
   - Environment information

3. **Specialized Loggers**
   - `logger` - Base logger
   - `createRequestLogger()` - HTTP request-specific
   - `authLogger` - Authentication operations
   - `serviceLogger` - Service layer operations
   - `dbLogger` - Database operations

4. **Helper Functions**
   - `logSuccess()` - Log successful operations with duration
   - `logError()` - Log errors with stack traces and context
   - `createContextLogger()` - Create child loggers with custom context

## Request Logging Middleware

**File:** `src/middlewares/request-logger.middleware.ts`

### Features

1. **Request Tracking**
   - Unique request ID (UUID) for each request
   - Request method, path, query params, body (sanitized)
   - User agent and IP address

2. **Response Tracking**
   - HTTP status code
   - Request duration in milliseconds
   - Automatic log level based on status:
     - 2xx: INFO (success)
     - 4xx: WARN (client error)
     - 5xx: ERROR (server error)

3. **Security**
   - Automatic sanitization of sensitive fields:
     - password, token, secret, accessToken, refreshToken
   - Logged as `[REDACTED]`

### Request Context

Every request gets these properties added:
```typescript
req.requestId   // Unique UUID for this request
req.logger      // Request-specific logger with context
req.startTime   // Request start time for duration calculation
```

## Error Logging

**File:** `src/middlewares/error.middleware.ts`

### Error Logging Strategy

1. **Validation Errors (Zod)**
   - Level: ERROR
   - Includes: validation issues, request path, method
   - Status: 400

2. **API Errors (Custom)**
   - 5xx: ERROR level
   - 4xx: WARN level
   - Includes: status code, message, path, method

3. **JWT Errors**
   - Level: WARN
   - Includes: error name, message, path
   - Status: 401

4. **Unknown Errors**
   - Level: ERROR
   - Includes: full stack trace, context
   - Status: 500

## Service Logging

### Auth Service

**Login/Registration Flow:**
```typescript
authLogger.info({ email }, "Starting user registration");
// ... operation ...
logSuccess(authLogger, "User registered successfully", duration, { userId, email, role });
```

**Failed Operations:**
```typescript
authLogger.warn({ email }, "Login failed: user not found");
authLogger.warn({ email, userId }, "Login failed: invalid password");
```

### Ticket Service

**Create Ticket:**
```typescript
serviceLogger.info({ userId, title, priority }, "Creating new ticket");
// ... operation ...
logSuccess(serviceLogger, "Ticket created successfully", duration, { ticketId, imageCount });
```

**Update Ticket:**
```typescript
serviceLogger.info({ ticketId, userId, updates }, "Updating ticket");
// ... operation ...
logSuccess(serviceLogger, "Ticket updated successfully", duration, { ticketId, statusChanged });
```

## Log Output Examples

### Development Mode (Pretty)

```
[14:30:45] INFO: 🚀 API server started on http://localhost:3000
    env: "development"
    port: 3000

[14:30:52] INFO: Incoming request
    requestId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    method: "POST"
    url: "/api/auth/register"
    body: {
      email: "user@example.com",
      name: "John Doe",
      password: "[REDACTED]"
    }
    ip: "::1"

[14:30:52] INFO: Starting user registration
    email: "user@example.com"
    role: "tenant"

[14:30:53] INFO: User registered successfully
    userId: "123e4567-e89b-12d3-a456-426614174000"
    email: "user@example.com"
    role: "tenant"
    duration: "245ms"

[14:30:53] INFO: Request completed
    requestId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    statusCode: 201
    duration: "247ms"
```

### Production Mode (JSON)

```json
{"level":"INFO","time":"2026-02-16T14:30:45.123Z","env":"production","msg":"🚀 API server started on http://localhost:3000","port":3000}
{"level":"INFO","time":"2026-02-16T14:30:52.456Z","env":"production","requestId":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","method":"POST","url":"/api/auth/register","msg":"Incoming request","body":{"email":"user@example.com","password":"[REDACTED]"}}
{"level":"INFO","time":"2026-02-16T14:30:52.789Z","env":"production","msg":"User registered successfully","userId":"123e4567-e89b-12d3-a456-426614174000","duration":"245ms"}
{"level":"INFO","time":"2026-02-16T14:30:53.012Z","env":"production","requestId":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","statusCode":201,"duration":"247ms","msg":"Request completed"}
```

## Request Lifecycle Logging

### Successful Request Flow
```
1. Request arrives → INFO: Incoming request
2. Service operation starts → INFO: Starting [operation]
3. Operation completes → INFO: [Operation] successful (with duration)
4. Response sent → INFO: Request completed (with status & duration)
```

### Failed Request Flow
```
1. Request arrives → INFO: Incoming request
2. Service operation starts → INFO: Starting [operation]
3. Error occurs → WARN/ERROR: [Operation] failed (with reason)
4. Error middleware → ERROR: Unhandled error (with stack trace)
5. Response sent → WARN/ERROR: Request completed with error
```

## Performance Monitoring

All operations log duration:
```typescript
const startTime = Date.now();
// ... operation ...
logSuccess(logger, "Operation completed", Date.now() - startTime, { metadata });
```

**Benefits:**
- Identify slow operations
- Track performance degradation
- Optimize bottlenecks

## Debugging Support

### Request Tracking
Every log for a request includes `requestId`:
```bash
# Filter logs by request ID
cat logs.json | grep "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### Error Tracking
Errors include full context:
```typescript
{
  error: {
    message: "...",
    stack: "...",
    name: "ApiError"
  },
  path: "/api/tickets",
  method: "POST",
  requestId: "...",
  userId: "..."
}
```

## Integration with Services

### Adding Logging to New Service

```typescript
import { serviceLogger, logSuccess, logError } from "../utils/logger";

export const myService = {
  async myOperation(input: any) {
    const startTime = Date.now();
    serviceLogger.info({ input }, "Starting my operation");

    try {
      const result = await someAsyncOperation();
      
      logSuccess(
        serviceLogger,
        "My operation completed successfully",
        Date.now() - startTime,
        { resultId: result.id }
      );
      
      return result;
    } catch (error) {
      logError(
        serviceLogger,
        "My operation failed",
        error as Error,
        { input }
      );
      throw error;
    }
  }
};
```

## Log Levels

| Level | When to Use | Examples |
|-------|-------------|----------|
| `debug` | Development details | Fetching data, queries |
| `info` | Normal operations | Request completed, user created |
| `warn` | Recoverable issues | Invalid login, validation errors |
| `error` | System errors | Database errors, crashes |

## Best Practices

### ✅ Do

1. **Log Operation Start and Completion**
   ```typescript
   logger.info("Starting operation");
   // ... work ...
   logSuccess(logger, "Operation completed", duration);
   ```

2. **Include Relevant Context**
   ```typescript
   logger.info({ userId, ticketId, action }, "Processing ticket");
   ```

3. **Log Durations for Performance**
   ```typescript
   const start = Date.now();
   // ... work ...
   logSuccess(logger, "Done", Date.now() - start);
   ```

4. **Use Appropriate Log Levels**
   - INFO for normal flow
   - WARN for expected errors (bad input)
   - ERROR for unexpected errors (DB failure)

### ❌ Don't

1. **Don't Log Sensitive Data**
   ```typescript
   // Bad
   logger.info({ password: user.password });
   
   // Good - already sanitized by middleware
   logger.info({ userId: user.id });
   ```

2. **Don't Use console.log**
   ```typescript
   // Bad
   console.log("User created:", user);
   
   // Good
   logger.info({ userId: user.id }, "User created");
   ```

3. **Don't Log Inside Loops**
   ```typescript
   // Bad
   items.forEach(item => logger.info({ item }, "Processing"));
   
   // Good
   logger.info({ count: items.length }, "Processing items");
   ```

## Production Recommendations

### 1. Log Aggregation
Use a log management service:
- **Datadog**: Full observability platform
- **Logtail**: Pino-friendly logging service
- **Elasticsearch + Kibana**: Self-hosted solution
- **CloudWatch Logs**: AWS-native

### 2. Log Rotation
```bash
# Add to package.json for production
"start": "node server.js | pino-pretty > logs/app.log"
```

Or use a process manager like PM2:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    script: './server.js',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
};
```

### 3. Monitoring Alerts
Set up alerts for:
- High error rate (> 1% of requests)
- Slow requests (> 1000ms average)
- 5xx status codes
- Failed authentications

### 4. Performance Impact
Pino is extremely fast:
- **~30x faster than Winston**
- **~10x faster than Bunyan**
- < 1ms overhead per log in production

## Testing Logs

### View Development Logs
```bash
cd backend
bun run dev

# Logs will be pretty-printed with colors
```

### Test Request Logging
```bash
# Make a request
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}'

# Check logs for:
# - Incoming request with requestId
# - Service operation logs
# - Request completion with duration
```

### Test Error Logging
```bash
# Trigger a validation error
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}'

# Check logs for:
# - Validation error with issues
# - WARN level for client error
# - Request completed with 400 status
```

## Summary

### ✅ Implementation Complete

- **Centralized logger** with Pino
- **Request logging middleware** with unique IDs
- **Error logging** with context and stack traces
- **Service logging** for auth and tickets
- **Performance tracking** with durations
- **Security** with sensitive data sanitization
- **Development-friendly** pretty printing
- **Production-ready** JSON structured logs

### 📊 Logging Coverage

| Component | Status | Features |
|-----------|--------|----------|
| Server Startup | ✅ | Port, environment |
| HTTP Requests | ✅ | Method, URL, duration, status |
| Authentication | ✅ | Login, register, getMe |
| Tickets | ✅ | Create, update (partial) |
| Errors | ✅ | Validation, API, JWT, unknown |
| Transactions | ✅ | Via error logging |

### 🚀 Benefits

1. **Debugging**: Trace requests end-to-end with unique IDs
2. **Performance**: Identify slow operations with duration logging
3. **Security**: Audit trail for authentication and authorization
4. **Monitoring**: Production-ready structured logs for aggregation
5. **Development**: Beautiful colored output for local development

**Your backend now has enterprise-grade logging!** 🎉
