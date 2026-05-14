# Implementation Phases

**7 phases instead of 10.** This is a demo app — we move faster and combine related work.

---

## Phase 0: Project Bootstrap + Supabase + Demo Auth

### Goal

Working Next.js app with Supabase connected, demo auth functional, layout shell (sidebar + topbar) rendered. User can click a demo account and land on an empty dashboard.

### Tasks

| # | Task | Details |
|---|------|---------|
| 0.1 | Init Next.js | `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` |
| 0.2 | Install deps | `npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query @tanstack/react-query-devtools react-hook-form @hookform/resolvers zod sonner recharts date-fns @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities next-pwa` |
| 0.3 | Install dev deps | `npm install -D vitest @types/node` |
| 0.4 | Init shadcn/ui | `npx shadcn@latest init` then install all base components listed in DESIGN_DIRECTION.md |
| 0.5 | Set up Supabase project | Create project at supabase.com. Get URL + keys. Create `.env.local` and `.env.example`. |
| 0.6 | Run schema migration | Paste `00001_initial_schema.sql` (all tables + enums from DATABASE_SCHEMA.md) into Supabase SQL editor. Run it. |
| 0.7 | Run search + triggers migration | Paste `00002_search_vectors.sql` and `00003_triggers.sql`. Run them. |
| 0.8 | Enable pg_trgm | Run `CREATE EXTENSION IF NOT EXISTS pg_trgm;` in Supabase SQL editor. |
| 0.9 | Create Supabase Storage bucket | Create `attachments` bucket (private) via Supabase dashboard. |
| 0.10 | Run seed SQL | Paste `seed.sql` (4 demo users + sample data) into Supabase SQL editor. Run it. |
| 0.11 | Generate types | `npx supabase gen types typescript --project-id <id> > src/types/database.ts` |
| 0.12 | Create Supabase clients | `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (server). |
| 0.13 | Create project structure | All directories per TECHNICAL_PLAN.md. |
| 0.14 | Create constants | `src/lib/constants.ts` — deal stages, activity types, results, lead statuses, sources, allowed file types. |
| 0.15 | Create API helpers | `src/lib/api-helpers.ts` — successResponse, errorResponse, withErrorHandler, custom error classes. |
| 0.16 | Create permissions module | `src/lib/permissions.ts` — full `can()` function per RBAC_AND_PERMISSIONS.md. |
| 0.17 | Create auth service | `src/services/auth.service.ts` — getDemoAccounts(), demoLogin(userId), getCurrentUser(). |
| 0.18 | Build auth API routes | `POST /api/auth/demo-login`, `GET /api/auth/me`, `POST /api/auth/logout`, `GET /api/auth/demo-accounts`. |
| 0.19 | Create middleware | `src/middleware.ts` — redirect to /login if no `demo_user_id` cookie. |
| 0.20 | Build login page | `src/app/(auth)/login/page.tsx` — 4 demo account cards. Click → login → redirect to /dashboard. |
| 0.21 | Build auth layout | `src/app/(auth)/layout.tsx` — centered, clean. |
| 0.22 | Set up TanStack Query | `src/app/providers.tsx` with QueryClientProvider. Wrap root layout. |
| 0.23 | Create use-current-user hook | `src/hooks/use-current-user.ts` — fetches /api/auth/me. |
| 0.24 | Build sidebar | `src/components/layout/sidebar.tsx` — navigation items, role-based visibility. |
| 0.25 | Build topbar | `src/components/layout/topbar.tsx` — breadcrumbs, placeholder search, placeholder notification bell, user avatar with switch account. |
| 0.26 | Build DemoAccountSwitcher | `src/components/layout/demo-account-switcher.tsx` — dropdown in user menu to switch between demo accounts. |
| 0.27 | Build dashboard layout | `src/app/(dashboard)/layout.tsx` — sidebar + topbar + main content area. |
| 0.28 | Build placeholder dashboard | `src/app/(dashboard)/dashboard/page.tsx` — "Welcome to UnifiedCRM" with logged-in user info. |
| 0.29 | Build PageHeader component | `src/components/layout/page-header.tsx`. |
| 0.30 | Build UserAvatar component | `src/components/shared/user-avatar.tsx`. |
| 0.31 | Set up PWA | Add `manifest.json`, configure `next-pwa` in `next.config.ts`, create basic icons. |
| 0.32 | Set up Vitest | `vitest.config.ts`. Add test script to package.json. |
| 0.33 | Write permissions tests | Unit tests for all role/action combinations in `can()`. |

### Acceptance Criteria

- [ ] `npm run dev` starts. Login page shows 4 demo account cards.
- [ ] Clicking a card logs in and redirects to /dashboard.
- [ ] Dashboard shows the user's name and role.
- [ ] Sidebar shows correct nav items per role (Team/Audit hidden for non-admins).
- [ ] Switching accounts works from the user menu.
- [ ] Supabase Studio shows all tables with seed data.
- [ ] Permission tests pass.
- [ ] App is installable as PWA (manifest loads).

---

## Phase 1: Companies & Contacts

### Goal

Full company and contact CRUD with list pages, detail pages, create/edit forms, duplicate company detection, and proper empty/loading/error states.

### Tasks

| # | Task | Details |
|---|------|---------|
| 1.1 | Create validators | `src/lib/validators/company.ts`, `contact.ts`, `common.ts` (pagination/sort). |
| 1.2 | Create services | `src/services/company.service.ts`, `contact.service.ts`. |
| 1.3 | Create audit helper | `src/lib/audit.ts` — `createAuditLog()`. |
| 1.4 | Build company API routes | All 6 endpoints from API_PLAN.md. |
| 1.5 | Build contact API routes | All 5 endpoints from API_PLAN.md. |
| 1.6 | Build shared components | `DataTable`, `FilterBar`, `StatusBadge`, `EntityDrawer`, `ConfirmDialog`, `EmptyState`, `DetailLayout`, `DetailCard`. |
| 1.7 | Build company list page | `/companies` — DataTable + FilterBar + create button. |
| 1.8 | Build company form | Drawer with duplicate detection on name blur. |
| 1.9 | Build company detail page | `/companies/:id` — detail card + linked contacts/deals. |
| 1.10 | Build contact list page | `/contacts` — DataTable with company filter. |
| 1.11 | Build contact form | Drawer with company combobox. |
| 1.12 | Build contact detail page | `/contacts/:id` — detail card + company + placeholder timeline. |

### Acceptance Criteria

- [ ] Companies: create, list, detail, update, archive all work.
- [ ] Duplicate company detection: exact match blocks, fuzzy match warns.
- [ ] Contacts: create, list, detail, update, archive all work.
- [ ] Contact requires email or phone (validation works).
- [ ] DataTable sorts, paginates, and filters.
- [ ] Empty states show on empty lists.
- [ ] Loading skeletons appear while fetching.
- [ ] RBAC enforced: Viewer can't create, Sales can create, Admin can archive.

---

## Phase 2: Lead Management

### Goal

Full lead lifecycle: create, assign, update status, convert to contact + deal.

### Tasks

| # | Task | Details |
|---|------|---------|
| 2.1 | Create validators | `src/lib/validators/lead.ts` — status progression rules. |
| 2.2 | Create lead service | CRUD, assign, convert (creates Contact + optional Deal + DealStageHistory). |
| 2.3 | Build lead API routes | All 6 lead endpoints including /assign and /convert. |
| 2.4 | Create notification helper | `src/lib/notifications.ts` — `createNotification()`. |
| 2.5 | Build lead list page | `/leads` — DataTable with status/source/owner filters. |
| 2.6 | Build lead form | Drawer with company combobox (+ "create new company" option). |
| 2.7 | Build lead detail page | `/leads/:id` — detail card + status badge + assignee + conversion info. |
| 2.8 | Build LeadConvertDialog | Modal: preview contact fields, optional deal creation form. |
| 2.9 | Wire up notifications | Lead assigned → notification. Lead converted → notification to managers. |
| 2.10 | Wire up audit logs | All lead actions logged. |

### Acceptance Criteria

- [ ] Leads: full CRUD with status, source, assignment.
- [ ] Status progression enforced (Sales forward only, Manager can go backward).
- [ ] Lead conversion creates Contact + optional Deal.
- [ ] Converted leads show link to resulting contact and are read-only.
- [ ] Converting an already-converted lead shows error.
- [ ] Notifications created on assign and convert.

---

## Phase 3: Deal Pipeline & Stage Tracking

### Goal

Deal CRUD, Kanban pipeline board with drag-and-drop, table view, stage transitions with history, and deal detail page.

### Tasks

| # | Task | Details |
|---|------|---------|
| 3.1 | Create validators | `src/lib/validators/deal.ts` — stage rules, lostReason required for CLOSED_LOST. |
| 3.2 | Create deal service | CRUD, stage change (+ DealStageHistory), assign, archive. |
| 3.3 | Build deal API routes | All 9 deal endpoints including /pipeline, /stage, /assign, /stage-history. |
| 3.4 | Build StageBadge | `src/components/shared/stage-badge.tsx`. |
| 3.5 | Build deal list page | `/deals` — DataTable with toggle to pipeline view. |
| 3.6 | Build PipelineBoard | `/deals/pipeline` — Kanban with @dnd-kit. |
| 3.7 | Build PipelineColumn | Stage column with count + total value header. |
| 3.8 | Build DealCard | Compact card: title, value, contact, assignee. |
| 3.9 | Build deal form | Drawer with contact combobox (required), company, value, close date. |
| 3.10 | Build deal detail page | `/deals/:id` — detail card + stage badge + stage history timeline + placeholder activity timeline. |
| 3.11 | Build StageChangeDialog | Confirmation. Lost reason required for CLOSED_LOST. |
| 3.12 | Wire up notifications + audit | Stage change, assignment, deal closed. |

### Acceptance Criteria

- [ ] Deals: full CRUD linked to contacts.
- [ ] Kanban board shows deals grouped by stage with drag-and-drop.
- [ ] Stage transitions recorded in deal_stage_history.
- [ ] Closing as Lost requires reason.
- [ ] Reopening a closed deal requires Manager+.
- [ ] Deal detail shows full stage history timeline.
- [ ] Pipeline view shows count and total value per stage header.

---

## Phase 4: Activities, Comments & Attachments

### Goal

Full activity system: log activities on deals/contacts/leads, activity timeline on detail pages, comments, file attachments via Supabase Storage.

### Tasks

| # | Task | Details |
|---|------|---------|
| 4.1 | Create validators | `src/lib/validators/activity.ts` — type-specific metadata with Zod discriminated union. |
| 4.2 | Create activity service | CRUD, complete, comments, attachments (Supabase Storage). |
| 4.3 | Build activity API routes | All 11 activity endpoints including comments and attachments. |
| 4.4 | Build ActivityTimeline | `src/components/shared/activity-timeline.tsx`. |
| 4.5 | Build ActivityCard | Individual timeline item with type icon, result badge, expandable description. |
| 4.6 | Build activity form | Modal with type pill selector, dynamic metadata fields, entity linking. |
| 4.7 | Build CommentList | Comment list with inline add form. |
| 4.8 | Build attachment UI | Upload button + attachment list with download/delete. |
| 4.9 | Build activity list page | `/activities` — DataTable with type/result/entity filters. |
| 4.10 | Integrate timeline into detail pages | Add ActivityTimeline to deal, contact, and lead detail pages. "Add Activity" button pre-links the entity. |
| 4.11 | Build attachment download/delete routes | Signed URL from Supabase Storage. |

### Acceptance Criteria

- [ ] Activities: create with all 7 types and type-specific metadata.
- [ ] Activity timeline on deal/contact/lead detail pages (reverse chronological).
- [ ] Comments: add and list on activities.
- [ ] File attachments: upload (max 10MB), download, delete.
- [ ] Activity linked to at least one entity (enforced).
- [ ] Only creator or Manager+ can edit activities.

---

## Phase 5: Dashboard & Notifications

### Goal

Dashboard with pipeline summary, recent activities, stale deals, team metrics, personal summary. Notification tray with 5-second polling.

### Tasks

| # | Task | Details |
|---|------|---------|
| 5.1 | Create dashboard service | Aggregation queries: pipeline summary, recent activities, stale deals, team activity, personal summary. |
| 5.2 | Build dashboard API routes | All 5 dashboard endpoints. |
| 5.3 | Build StatCard | `src/components/shared/stat-card.tsx`. |
| 5.4 | Build dashboard widgets | PipelineSummary (bar chart), RecentActivities (list), StaleDeals (table), TeamActivity (chart), MySummary. |
| 5.5 | Build dashboard page | `/dashboard` — grid layout. Manager/Admin see team dashboard. Sales sees personal. |
| 5.6 | Create notification service | `src/services/notification.service.ts` — list, mark read. |
| 5.7 | Build notification API routes | GET list, PATCH mark read, POST mark all read. |
| 5.8 | Build NotificationTray | `src/components/layout/notification-tray.tsx` — bell + badge + dropdown. 5-second polling via TanStack Query `refetchInterval`. |
| 5.9 | Wire up notification tray in TopBar | Replace placeholder bell with working NotificationTray. |
| 5.10 | Verify all notification triggers | Review all prior phases. Ensure notifications fire for: lead assign, lead convert, deal stage change, deal assign, deal close, comment added. |

### Acceptance Criteria

- [ ] Dashboard shows pipeline summary chart with correct data.
- [ ] Stale deals widget shows deals not updated in 7+ days.
- [ ] Team activity shows per-member counts.
- [ ] Sales user sees personal dashboard (my deals, my activities).
- [ ] Notification bell shows unread count, updates every 5 seconds.
- [ ] Clicking a notification shows details. Can mark as read.
- [ ] Empty dashboard shows guided empty states.

---

## Phase 6: Search, Audit Logs & Polish

### Goal

Global search, audit log viewer, and final polish pass — loading states, error states, responsive behavior, PWA verification.

### Tasks

| # | Task | Details |
|---|------|---------|
| 6.1 | Create search service | Unified full-text search across companies, contacts, leads, deals. |
| 6.2 | Build search API route | `GET /api/search`. |
| 6.3 | Build SearchCommand | `src/components/layout/search-command.tsx` — Cmd+K command palette. Results grouped by entity type. Click navigates to detail. |
| 6.4 | Wire search into TopBar | Replace placeholder search with working SearchCommand. |
| 6.5 | Create audit service | `src/services/audit.service.ts` — list with filters. |
| 6.6 | Build audit log API route | `GET /api/audit-logs` (ADMIN only). |
| 6.7 | Build audit log page | `/audit-logs` — DataTable with entity type, user, action, date filters. |
| 6.8 | Build team page | `/team` — list of users with roles. ADMIN only. (Read-only for demo.) |
| 6.9 | Add loading skeletons | Verify all pages have skeleton loaders. |
| 6.10 | Add error boundaries | Error boundary per route segment with retry button. |
| 6.11 | Review all empty states | Ensure every list/widget has a proper empty state. |
| 6.12 | Review all form validations | Test with invalid data. Check inline error messages. |
| 6.13 | Review toasts | All mutations show success/error toasts. |
| 6.14 | Responsive pass | Test at desktop, tablet, mobile widths. Fix layout issues. |
| 6.15 | PWA verification | Verify manifest loads, service worker registers, app is installable. Test "Add to Home Screen". |
| 6.16 | Write remaining tests | Validator tests, deal stage transition tests. |
| 6.17 | Final demo walkthrough | Complete full demo flow as each user role. No crashes, no missing states. |
| 6.18 | Create README.md | Setup instructions, tech stack, demo accounts, screenshots placeholder. |

### Acceptance Criteria

- [ ] Cmd+K search finds entities with grouped results.
- [ ] Audit log page shows all actions (ADMIN only).
- [ ] Team page shows users and roles (ADMIN only).
- [ ] All pages: loading skeletons, error states, empty states work.
- [ ] All forms validate properly with clear error messages.
- [ ] All mutations show toasts.
- [ ] App is responsive on desktop and tablet.
- [ ] PWA installs and loads correctly.
- [ ] 15-minute demo walkthrough completes without crashes.
- [ ] README has setup instructions.
- [ ] All tests pass.
