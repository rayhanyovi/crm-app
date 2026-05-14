# API Plan

## Conventions

### Base Path

All API endpoints are under `/api`. No workspace prefix — this is a single-instance demo.

### Response Envelope

```typescript
// Success
{ "data": T, "meta"?: { total, page, pageSize, hasMore } }

// Error
{ "error": { "code": string, "message": string, "details"?: object } }
```

### Error Codes

| Status | Code | Usage |
|--------|------|-------|
| 400 | VALIDATION_ERROR | Invalid input |
| 401 | UNAUTHORIZED | Not logged in |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Duplicate (e.g., company name) |
| 413 | PAYLOAD_TOO_LARGE | File > 10MB |
| 422 | UNPROCESSABLE | Business rule violation |
| 500 | INTERNAL_ERROR | Server error |

### Pagination

Offset-based: `page` (1-based, default 1), `pageSize` (default 25, max 100).

### Sorting

`sortBy` (column name), `sortOrder` ("asc" or "desc"). Default: `created_at desc`.

### Filtering

Query params with field names: `?status=NEW&source=WEBSITE&assigned_to_id=uuid`
Date ranges: `created_at_from=2025-01-01&created_at_to=2025-12-31`

---

## Auth Endpoints

### POST /api/auth/demo-login

- **Purpose:** Login as a demo account.
- **No auth required.**
- **Request:** `{ "userId": "uuid" }`
- **Response:** `{ "data": { "user": { id, email, first_name, last_name, role, avatar_url } } }`
- **Side effects:** Sets session cookie with user ID.
- **Notes:** No password validation. Just sets the session to the requested user.

### GET /api/auth/me

- **Purpose:** Get current logged-in user.
- **Auth:** Required.
- **Response:** `{ "data": { id, email, first_name, last_name, role, avatar_url } }`

### POST /api/auth/logout

- **Purpose:** Clear session.
- **Response:** `{ "data": { "message": "Logged out" } }`

### GET /api/auth/demo-accounts

- **Purpose:** List all demo accounts for the login page.
- **No auth required.**
- **Response:** `{ "data": [{ id, email, first_name, last_name, role, avatar_url }] }`

---

## Company Endpoints

### GET /api/companies

- **Purpose:** List companies.
- **Auth:** VIEWER+
- **Query:** `search`, `industry`, `page`, `pageSize`, `sortBy`, `sortOrder`, `includeArchived`
- **Response:** Paginated list with contact_count, deal_count.

### POST /api/companies

- **Purpose:** Create company.
- **Auth:** SALES+
- **Body:** `{ name, industry?, website?, phone?, email?, address?, notes? }`
- **Validation:** Name required, 1-200 chars, unique (case-insensitive).
- **Response (201):** Created company. Includes `warnings[]` for similar names.
- **Error:** 409 if exact name match.
- **Side effects:** Audit log CREATE.

### GET /api/companies/:id

- **Purpose:** Company detail with linked contacts, leads, deals.
- **Auth:** VIEWER+

### PATCH /api/companies/:id

- **Purpose:** Update company.
- **Auth:** SALES+
- **Side effects:** Audit log UPDATE.

### DELETE /api/companies/:id

- **Purpose:** Archive (soft-delete).
- **Auth:** ADMIN only.
- **Validation:** No active contacts/deals.
- **Side effects:** Audit log ARCHIVE.

### GET /api/companies/check-duplicate

- **Purpose:** Check for duplicates before creation.
- **Auth:** SALES+
- **Query:** `name`
- **Response:** `{ data: { exactMatch: null | {...}, similarMatches: [...] } }`

---

## Contact Endpoints

### GET /api/contacts

- **Auth:** VIEWER+
- **Query:** `search`, `company_id`, `has_deals`, `page`, `pageSize`, `sortBy`, `sortOrder`

### POST /api/contacts

- **Auth:** SALES+
- **Body:** `{ first_name, last_name, email?, phone?, title?, company_id? }`
- **Validation:** At least one of email/phone.
- **Side effects:** Audit log CREATE.

### GET /api/contacts/:id

- **Auth:** VIEWER+
- **Response:** Contact with company, deals[], recent activities[].

### PATCH /api/contacts/:id

- **Auth:** SALES+ (own for SALES, all for MANAGER+)
- **Side effects:** Audit log UPDATE.

### DELETE /api/contacts/:id

- **Auth:** ADMIN only.
- **Side effects:** Audit log ARCHIVE.

---

## Lead Endpoints

### GET /api/leads

- **Auth:** VIEWER+
- **Query:** `search`, `status`, `source`, `assigned_to_id`, `company_id`, `page`, `pageSize`, `sortBy`, `sortOrder`

### POST /api/leads

- **Auth:** SALES+
- **Body:** `{ first_name, last_name, email?, phone?, source, company_id?, notes? }`
- **Side effects:** `assigned_to_id` defaults to creator. Audit log CREATE.

### GET /api/leads/:id

- **Auth:** VIEWER+
- **Response:** Lead with company, assignee, activities[], converted_contact.

### PATCH /api/leads/:id

- **Auth:** SALES+ (own for SALES)
- **Validation:** Status progression rules. SALES cannot move backward.
- **Side effects:** If status changes: Audit log STATUS_CHANGE + notification.

### POST /api/leads/:id/assign

- **Auth:** MANAGER+
- **Body:** `{ assigned_to_id: "uuid" }`
- **Side effects:** Notification to assignee. Audit log ASSIGNMENT_CHANGE.

### POST /api/leads/:id/convert

- **Auth:** SALES+ (own for SALES)
- **Body:** `{ createDeal?: boolean, deal?: { title, value, stage } }`
- **Validation:** Must not already be converted.
- **Response:** `{ data: { contact: {...}, deal?: {...} } }`
- **Side effects:**
  1. Create Contact from lead fields.
  2. Set lead `converted_contact_id`, `status = CONVERTED`.
  3. Optionally create Deal + initial DealStageHistory.
  4. Notification + Audit log CONVERSION.

---

## Deal Endpoints

### GET /api/deals

- **Auth:** VIEWER+
- **Query:** `search`, `stage`, `assigned_to_id`, `company_id`, `value_min`, `value_max`, `page`, `pageSize`, `sortBy`, `sortOrder`

### GET /api/deals/pipeline

- **Auth:** VIEWER+
- **Query:** `assigned_to_id` (optional filter)
- **Response:** Deals grouped by stage with count and total value per stage.
  ```json
  { "data": { "stages": [{ "stage": "LEAD", "count": 5, "totalValue": 120000, "deals": [...] }] } }
  ```

### POST /api/deals

- **Auth:** SALES+
- **Body:** `{ title, value?, stage?, contact_id, company_id?, lead_id?, expected_close_date? }`
- **Side effects:** `assigned_to_id` defaults to creator. Create initial DealStageHistory. Audit log CREATE. Notification to managers.

### GET /api/deals/:id

- **Auth:** VIEWER+
- **Response:** Deal with contact, company, lead, assignee, stage_history[], recent activities[].

### PATCH /api/deals/:id

- **Auth:** SALES+ (own for SALES)
- **Body:** Any deal field except `stage` (use /stage endpoint).
- **Side effects:** Audit log UPDATE.

### POST /api/deals/:id/stage

- **Auth:** SALES+ (own for SALES)
- **Body:** `{ stage: "PROPOSAL", note?: "Client requested proposal", lost_reason?: "..." }`
- **Validation:** If CLOSED_LOST: `lost_reason` required. Reopening closed: MANAGER+ only.
- **Side effects:** Update deal stage + updatedAt. Create DealStageHistory. Set closedAt if closing. Audit log STAGE_CHANGE. Notification.

### POST /api/deals/:id/assign

- **Auth:** MANAGER+
- **Body:** `{ assigned_to_id: "uuid" }`
- **Side effects:** Notification + Audit log ASSIGNMENT_CHANGE.

### DELETE /api/deals/:id

- **Auth:** ADMIN only.
- **Side effects:** Audit log ARCHIVE.

### GET /api/deals/:id/stage-history

- **Auth:** VIEWER+
- **Response:** List of stage transitions with user info.

---

## Activity Endpoints

### GET /api/activities

- **Auth:** VIEWER+
- **Query:** `type`, `result`, `assigned_to_id`, `deal_id`, `contact_id`, `lead_id`, `page`, `pageSize`, `sortBy`, `sortOrder`

### POST /api/activities

- **Auth:** SALES+
- **Body:** `{ type, subject, description?, result?, scheduled_at?, completed_at?, deal_id?, contact_id?, lead_id?, metadata? }`
- **Validation:** At least one linked entity. Type-specific metadata validation.
- **Side effects:** Audit log CREATE. Touch deal's `updated_at` if linked.

### GET /api/activities/:id

- **Auth:** VIEWER+
- **Response:** Activity with comments[], attachments[], linked entities.

### PATCH /api/activities/:id

- **Auth:** SALES+ (own for SALES)
- **Side effects:** Audit log UPDATE.

### POST /api/activities/:id/complete

- **Auth:** SALES+ (own for SALES)
- **Body:** `{ result, completed_at?, notes? }`
- **Side effects:** Touch deal's `updated_at`.

### POST /api/activities/:id/comments

- **Auth:** SALES+
- **Body:** `{ content }`  (1-2000 chars)
- **Response (201):** Created comment.
- **Side effects:** Notification to activity creator.

### GET /api/activities/:id/comments

- **Auth:** VIEWER+

### DELETE /api/activities/:id/comments/:commentId

- **Auth:** ADMIN only.

### POST /api/activities/:id/attachments

- **Auth:** SALES+
- **Content-Type:** multipart/form-data
- **Body:** `file` (max 10MB, allowed MIME types)
- **Side effects:** Upload to Supabase Storage. Create attachment record.

### GET /api/attachments/:id/download

- **Auth:** VIEWER+
- **Response:** Signed URL redirect or file stream from Supabase Storage.

### DELETE /api/attachments/:id

- **Auth:** ADMIN or uploader.

---

## Notification Endpoints

### GET /api/notifications

- **Auth:** Required.
- **Query:** `is_read` (boolean), `page`, `pageSize`
- **Response:** Paginated list + `meta.unreadCount`.
- **Notes:** Only returns notifications for the current user. Polled every 5 seconds.

### PATCH /api/notifications/:id/read

- **Auth:** Required (own only).
- **Side effects:** Set `is_read = true`, `read_at = now()`.

### POST /api/notifications/mark-all-read

- **Auth:** Required.

---

## Dashboard Endpoints

### GET /api/dashboard/pipeline-summary

- **Auth:** VIEWER+
- **Response:** `{ stages: [{ stage, count, totalValue }], totalDeals, totalValue }`

### GET /api/dashboard/recent-activities

- **Auth:** MANAGER+ or VIEWER
- **Query:** `limit` (default 20)

### GET /api/dashboard/stale-deals

- **Auth:** MANAGER+ or VIEWER
- **Response:** Deals not updated in 7+ days with `days_since_update`.

### GET /api/dashboard/team-activity

- **Auth:** MANAGER+ or VIEWER
- **Query:** `from`, `to` (dates)
- **Response:** Activity count per user with breakdown by type.

### GET /api/dashboard/my-summary

- **Auth:** SALES+
- **Response:** Current user's deals by stage, upcoming activities, overdue activities.

---

## Search Endpoint

### GET /api/search

- **Auth:** VIEWER+
- **Query:** `q` (min 2 chars), `entity_types` (comma-separated, optional), `limit` (per type, default 5)
- **Response:** Results grouped by type: `{ companies: [...], contacts: [...], leads: [...], deals: [...] }`

---

## Audit Log Endpoint

### GET /api/audit-logs

- **Auth:** ADMIN only.
- **Query:** `entity_type`, `entity_id`, `user_id`, `action`, `created_at_from`, `created_at_to`, `page`, `pageSize`

---

## Endpoint Summary

| Method | Path | Min Role | Purpose |
|--------|------|----------|---------|
| POST | /api/auth/demo-login | Public | Demo login |
| GET | /api/auth/me | Auth | Current user |
| POST | /api/auth/logout | Auth | Logout |
| GET | /api/auth/demo-accounts | Public | List demo accounts |
| GET | /api/companies | Viewer | List |
| POST | /api/companies | Sales | Create |
| GET | /api/companies/:id | Viewer | Detail |
| PATCH | /api/companies/:id | Sales | Update |
| DELETE | /api/companies/:id | Admin | Archive |
| GET | /api/companies/check-duplicate | Sales | Dupe check |
| GET | /api/contacts | Viewer | List |
| POST | /api/contacts | Sales | Create |
| GET | /api/contacts/:id | Viewer | Detail |
| PATCH | /api/contacts/:id | Sales | Update |
| DELETE | /api/contacts/:id | Admin | Archive |
| GET | /api/leads | Viewer | List |
| POST | /api/leads | Sales | Create |
| GET | /api/leads/:id | Viewer | Detail |
| PATCH | /api/leads/:id | Sales | Update |
| POST | /api/leads/:id/assign | Manager | Assign |
| POST | /api/leads/:id/convert | Sales | Convert |
| GET | /api/deals | Viewer | List |
| GET | /api/deals/pipeline | Viewer | Pipeline |
| POST | /api/deals | Sales | Create |
| GET | /api/deals/:id | Viewer | Detail |
| PATCH | /api/deals/:id | Sales | Update |
| POST | /api/deals/:id/stage | Sales | Change stage |
| POST | /api/deals/:id/assign | Manager | Assign |
| DELETE | /api/deals/:id | Admin | Archive |
| GET | /api/deals/:id/stage-history | Viewer | Stage history |
| GET | /api/activities | Viewer | List |
| POST | /api/activities | Sales | Create |
| GET | /api/activities/:id | Viewer | Detail |
| PATCH | /api/activities/:id | Sales | Update |
| POST | /api/activities/:id/complete | Sales | Complete |
| POST | /api/activities/:id/comments | Sales | Add comment |
| GET | /api/activities/:id/comments | Viewer | List comments |
| DELETE | /api/activities/:id/comments/:cid | Admin | Delete comment |
| POST | /api/activities/:id/attachments | Sales | Upload |
| GET | /api/attachments/:id/download | Viewer | Download |
| DELETE | /api/attachments/:id | Admin/Owner | Delete |
| GET | /api/notifications | Auth | List |
| PATCH | /api/notifications/:id/read | Auth | Mark read |
| POST | /api/notifications/mark-all-read | Auth | Mark all |
| GET | /api/dashboard/pipeline-summary | Viewer | Stats |
| GET | /api/dashboard/recent-activities | Manager | Feed |
| GET | /api/dashboard/stale-deals | Manager | Alerts |
| GET | /api/dashboard/team-activity | Manager | Team stats |
| GET | /api/dashboard/my-summary | Sales | Personal |
| GET | /api/search | Viewer | Search |
| GET | /api/audit-logs | Admin | Logs |

**Total: 48 endpoints**
