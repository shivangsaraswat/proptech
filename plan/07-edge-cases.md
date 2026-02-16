# Edge Cases & Error Handling

## Authentication Edge Cases

| Scenario                                | Handling                                                      |
| --------------------------------------- | ------------------------------------------------------------- |
| Token expired                           | 401 response → interceptor clears token → redirect to /login  |
| Token tampered                          | 401 response → same as above                                  |
| User deleted but token still valid      | Auth middleware checks user exists in DB                       |
| User deactivated (`is_active = false`)  | Auth middleware rejects with 403                               |
| Concurrent login from multiple devices  | Allowed (stateless JWT)                                       |
| Registration with existing email        | 409 Conflict with clear message                                |
| SQL injection in login fields           | Parameterized queries via Drizzle ORM                          |
| Password brute force                    | Out of scope (would add rate limiting in production)           |

## Ticket Workflow Edge Cases

| Scenario                                        | Handling                                                      |
| ------------------------------------------------ | ------------------------------------------------------------- |
| Assign technician who is deactivated             | Validate technician is active before assignment                |
| Technician tries to update someone else's ticket | Check `assigned_to === req.user.id`                            |
| Manager changes status to `in_progress` directly | Allowed — manager has full control                             |
| Technician tries to set status to `assigned`     | Rejected — technician can only do `in_progress` or `done`     |
| Ticket marked `done` then reopened               | Only manager can reopen → status goes to `reopened`            |
| Reopened ticket has no technician                 | Keep the previously assigned technician                        |
| Comment on ticket user has no access to           | 403 — verify access before allowing comment                   |
| Upload to a closed (`done`) ticket                | Allowed — images can document resolution                      |
| Delete ticket                                     | Not implemented — tickets are permanent records                |
| Duplicate ticket submission (double-click)        | Frontend: disable button on submit. Backend: idempotent        |

## File Upload Edge Cases

| Scenario                            | Handling                                                      |
| ----------------------------------- | ------------------------------------------------------------- |
| File > 5MB                          | Frontend validation before S3 upload, show error             |
| Wrong MIME type (e.g., .exe)        | Frontend validation, only allow jpg/png/webp                 |
| 0 files uploaded                    | Optional field, allowed                                       |
| > 5 files uploaded                  | Frontend limits selection to 5 max                            |
| S3 upload fails                     | Show error toast, allow retry, don't submit ticket           |
| S3 upload succeeds but API fails    | Images remain in S3 (orphaned), acceptable for MVP            |
| Invalid S3 URL sent to backend      | Backend validates URL format and domain, reject with 400      |
| S3 URL from different bucket        | Backend validates against allowed bucket name                 |
| Network timeout during upload       | Frontend shows timeout error, allow retry                     |
| Duplicate filename                  | S3 key uses UUID, duplicates are separate objects             |
| User closes browser during upload   | Upload may continue or abort, acceptable                      |
| Image already deleted from S3       | API returns 404 for image, acceptable (still show ticket)     |

## Frontend Edge Cases

| Scenario                            | Handling                                                      |
| ----------------------------------- | ------------------------------------------------------------- |
| Network error during form submit    | Show toast error, keep form data, allow retry                 |
| Network error during page load      | Show error state with "Retry" button                          |
| User navigates away during upload   | Upload continues (no cancellation — keep simple)              |
| Screen resize mid-interaction       | Responsive layout adjusts, no data loss                       |
| Very long ticket title              | CSS truncation with ellipsis, full title in detail view       |
| Very long description               | Scrollable text area, line-clamp in cards                     |
| No tickets exist                    | Empty state illustration with CTA                             |
| Rapid filter changes                | Debounce search input (300ms)                                 |
| Deep linking to ticket detail       | Router loads ticket directly, auth check on layout            |
| Back button after form submit       | Allow — list will show new ticket                             |

## API Response Standardization

### Success Response
```json
{
  "data": <payload>
}
```

### Error Response
```json
{
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is already registered"
    }
  ]
}
```

### HTTP Status Codes Used
| Code | Usage                                     |
| ---- | ----------------------------------------- |
| 200  | Successful GET, PATCH                     |
| 201  | Successful POST (resource created)        |
| 400  | Validation error, bad request             |
| 401  | Not authenticated                         |
| 403  | Not authorized (wrong role/access)        |
| 404  | Resource not found                        |
| 409  | Conflict (duplicate email)                |
| 500  | Unexpected server error                   |
