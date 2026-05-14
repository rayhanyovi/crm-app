# Product Plan

## User Personas (Demo Accounts)

### Persona 1: Admin

- **Role:** ADMIN
- **Demo email:** admin@demo.com
- **What they demonstrate:** Full system access — user management, audit logs, archiving, dashboard, all CRUD.
- **Key actions to show:** View audit logs, manage team, archive entities, view full dashboard.

### Persona 2: Manager

- **Role:** MANAGER
- **Demo email:** manager@demo.com
- **What they demonstrate:** Team oversight — assign leads/deals, view all data, team metrics.
- **Key actions to show:** Assign leads, reassign deals, view team dashboard, review activity logs.

### Persona 3: Sales Rep

- **Role:** SALES
- **Demo email:** sales@demo.com
- **What they demonstrate:** Day-to-day CRM work — create leads, log calls, move deals.
- **Key actions to show:** Full lead-to-deal workflow, log activities, update own records.

### Persona 4: Viewer

- **Role:** VIEWER
- **Demo email:** viewer@demo.com
- **What they demonstrate:** Read-only access for stakeholders.
- **Key actions to show:** Browse data, view dashboards. Cannot create or edit.

---

## User Stories

### Module: Demo Auth

| ID | Story | Priority |
|----|-------|----------|
| AUTH-01 | As a user, I see a login page with demo account cards (Admin, Manager, Sales, Viewer). | Must |
| AUTH-02 | As a user, I click a demo account card to instantly log in as that user. | Must |
| AUTH-03 | As a logged-in user, I can switch to a different demo account from the user menu. | Must |
| AUTH-04 | As a logged-in user, I see my name, role, and avatar in the sidebar/topbar. | Must |

### Module: Company Management

| ID | Story | Priority |
|----|-------|----------|
| CO-01 | As a sales rep, I can create a company with name, industry, website, phone, email, address, notes. | Must |
| CO-02 | As a sales rep, I see a warning if a similar company name already exists. | Must |
| CO-03 | As a user, I can view a company list page with search, sorting, and pagination. | Must |
| CO-04 | As a user, I can view a company detail page showing linked contacts, leads, and deals. | Must |
| CO-05 | As a sales rep, I can update a company. | Must |
| CO-06 | As an admin, I can archive a company. | Must |

### Module: Contact Management

| ID | Story | Priority |
|----|-------|----------|
| CT-01 | As a sales rep, I can create a contact with name, email, phone, title, and optional company link. | Must |
| CT-02 | As a user, I can view a contact list with filters (company, has deals). | Must |
| CT-03 | As a user, I can view a contact detail page with deals and activity timeline. | Must |
| CT-04 | As a sales rep, I can update a contact. | Must |
| CT-05 | As an admin, I can archive a contact. | Must |

### Module: Lead Management

| ID | Story | Priority |
|----|-------|----------|
| LD-01 | As a sales rep, I can create a lead with name, email/phone, source, and optional company. | Must |
| LD-02 | As a user, I can view a lead list with filters (status, source, owner). | Must |
| LD-03 | As a user, I can view a lead detail page with activity timeline. | Must |
| LD-04 | As a sales rep, I can update a lead's status (New → Contacted → Qualified → Converted/Lost). | Must |
| LD-05 | As a manager, I can assign a lead to a sales rep. | Must |
| LD-06 | As a sales rep, I can convert a qualified lead into a contact + optionally a deal. | Must |
| LD-07 | As a user, I can see which leads have been converted and follow the link. | Must |

### Module: Deal Pipeline

| ID | Story | Priority |
|----|-------|----------|
| DL-01 | As a sales rep, I can create a deal with title, value, contact, company, and initial stage. | Must |
| DL-02 | As a user, I can view deals on a Kanban board grouped by stage. | Must |
| DL-03 | As a user, I can view deals in a table/list view. | Must |
| DL-04 | As a sales rep, I can move a deal to a different stage (drag or click). | Must |
| DL-05 | As a user, I can view a deal detail page with stage history and activity timeline. | Must |
| DL-06 | As a user, I can see stage transition history (who, when, from/to). | Must |
| DL-07 | As a sales rep, I must provide a reason when closing a deal as Lost. | Must |
| DL-08 | As a manager, I can reassign a deal to a different sales rep. | Must |

### Module: Activities

| ID | Story | Priority |
|----|-------|----------|
| AC-01 | As a sales rep, I can log an activity (call, email, meeting, task, note, demo, follow-up) on a deal/contact/lead. | Must |
| AC-02 | As a sales rep, I can set the result of an activity (Completed, No Answer, etc.). | Must |
| AC-03 | As a user, I can view an activity timeline on deal/contact/lead detail pages. | Must |
| AC-04 | As a sales rep, I can add comments to an activity. | Must |
| AC-05 | As a sales rep, I can attach files to an activity (via Supabase Storage). | Must |
| AC-06 | As a user, I can view an activity list page with filters. | Must |

### Module: Dashboard

| ID | Story | Priority |
|----|-------|----------|
| DB-01 | As a manager, I see a dashboard with pipeline summary (deal count + value per stage). | Must |
| DB-02 | As a manager, I see recent activities across the system. | Must |
| DB-03 | As a manager, I see stale deals (not updated in 7+ days). | Must |
| DB-04 | As a manager, I see team activity summary (per member). | Must |
| DB-05 | As a sales rep, I see my personal summary (my deals, my upcoming activities). | Must |

### Module: Notifications

| ID | Story | Priority |
|----|-------|----------|
| NT-01 | As a user, I see a notification bell with unread count in the top bar. | Must |
| NT-02 | As a user, I can open a notification tray showing recent notifications. | Must |
| NT-03 | As a user, I can mark notifications as read. | Must |
| NT-04 | Notifications auto-refresh via 5-second polling. | Must |

### Module: Search

| ID | Story | Priority |
|----|-------|----------|
| SR-01 | As a user, I can use Cmd+K to open global search. | Must |
| SR-02 | Search finds companies, contacts, leads, and deals by keyword. | Must |
| SR-03 | Clicking a search result navigates to the detail page. | Must |

---

## Business Rules

### Companies

1. Company names must be unique (case-insensitive).
2. Duplicate detection shows a warning for similar names (prefix match). User can proceed or select existing.
3. Cannot archive a company with active (non-archived) contacts or deals.

### Contacts

4. A contact must have at least one of: email or phone.
5. A contact can optionally belong to a company.

### Leads

6. Lead status progression: New → Contacted → Qualified → Converted / Lost.
7. Sales users can only move status forward. Manager/Admin can move backward.
8. Converting a lead creates a Contact (copying fields) and optionally a Deal.
9. Conversion is one-time and irreversible. Converted leads become read-only.

### Deals

10. Pipeline stages: Lead → Qualified → Proposal → Negotiation → Closed Won → Closed Lost.
11. Deals can move forward or backward, except: reopening a Closed deal requires Manager/Admin.
12. Closing as Lost requires a `lostReason`.
13. Every stage change is recorded in `deal_stage_history`.
14. Deal value must be >= 0.

### Activities

15. An activity must link to at least one of: deal, contact, or lead.
16. Activity types: Call, Email, Meeting, Task, Note, Demo, Follow-Up.
17. Activity results: Completed, No Answer, Follow-up Needed, Meeting Scheduled, Deal Advanced, Cancelled, Failed.
18. Only the creator or Manager/Admin can edit an activity.
19. Comments are append-only for Sales. Only Admin can delete comments.

### General

20. Soft-delete (archive) via `deleted_at` timestamp on Company, Contact, Lead, Deal.
21. Activities are never deleted (permanent audit trail).
22. All state changes create audit log entries.

---

## Validation Rules

### Company

| Field | Required | Validation |
|-------|----------|------------|
| name | Yes | 1-200 chars, unique (case-insensitive) |
| industry | No | Max 100 chars |
| website | No | Valid URL if provided |
| phone | No | Max 20 chars |
| email | No | Valid email if provided |
| address | No | Max 500 chars |
| notes | No | Max 5000 chars |

### Contact

| Field | Required | Validation |
|-------|----------|------------|
| first_name | Yes | 1-100 chars |
| last_name | Yes | 1-100 chars |
| email | Conditional | Valid email. At least one of email/phone required |
| phone | Conditional | Max 20 chars. At least one of email/phone required |
| title | No | Max 100 chars |
| company_id | No | Must exist if provided |

### Lead

| Field | Required | Validation |
|-------|----------|------------|
| first_name | Yes | 1-100 chars |
| last_name | Yes | 1-100 chars |
| email | Conditional | At least one of email/phone required |
| phone | Conditional | At least one of email/phone required |
| source | Yes | Enum: WEBSITE, REFERRAL, COLD_CALL, SOCIAL_MEDIA, EVENT, ADVERTISEMENT, OTHER |
| status | Yes | Default: NEW |
| company_id | No | Must exist if provided |
| assigned_to_id | No | Must be a valid user |

### Deal

| Field | Required | Validation |
|-------|----------|------------|
| title | Yes | 1-200 chars |
| value | No | >= 0, default 0, max 2 decimal places |
| stage | Yes | Default: LEAD |
| contact_id | Yes | Must exist |
| company_id | No | Must exist if provided |
| expected_close_date | No | Must be today or future |
| lost_reason | Conditional | Required when stage = CLOSED_LOST, max 1000 chars |

### Activity

| Field | Required | Validation |
|-------|----------|------------|
| type | Yes | Enum: CALL, EMAIL, MEETING, TASK, NOTE, DEMO, FOLLOW_UP |
| subject | Yes | 1-200 chars |
| description | No | Max 5000 chars |
| result | No | Enum if provided |
| scheduled_at | No | ISO 8601 |
| completed_at | No | ISO 8601 |
| deal_id | Conditional | At least one of deal_id/contact_id/lead_id required |
| contact_id | Conditional | At least one of deal_id/contact_id/lead_id required |
| lead_id | Conditional | At least one of deal_id/contact_id/lead_id required |
| metadata | No | JSON, validated per type |

### Activity Metadata by Type

| Type | Fields | Notes |
|------|--------|-------|
| CALL | `direction` (INBOUND/OUTBOUND), `duration` (seconds) | Direction required |
| EMAIL | `email_subject` | Optional |
| MEETING | `location`, `attendees` | Optional |
| TASK | `due_date`, `priority` (LOW/MEDIUM/HIGH) | Optional |
| NOTE | (none) | — |
| DEMO | `demo_url` | Optional |
| FOLLOW_UP | `follow_up_date` | Required |

---

## Edge Cases

| Case | Handling |
|------|----------|
| Company name exact duplicate | Block creation, show error with link to existing |
| Company name fuzzy match | Show warning, let user proceed or select existing |
| Convert already-converted lead | Show error: "This lead has already been converted" |
| Close deal as Lost without reason | Form blocks submission, reason is required |
| Archive company with active contacts | Block with error, must archive contacts first |
| Viewer tries to create/edit | Buttons hidden in UI. API returns 403 if called directly. |
| Search returns nothing | Show "No results found" empty state |
| Dashboard with no data | Show empty states with guidance messages |
