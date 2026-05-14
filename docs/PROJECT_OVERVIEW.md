# Project Overview

## Product Name

**UnifiedCRM** — Interview/Portfolio Demo

## What This Is

This is a **portfolio demo application** built to showcase fullstack engineering skills in an interview setting. It is NOT a production CRM. The goal is to demonstrate:

- Clean, modern UI with a professional SaaS-like feel.
- Fullstack architecture (Next.js + Supabase).
- RBAC with multiple user roles.
- Complex data relationships (leads → contacts → deals → activities).
- Real-time-like features (notification polling).
- Deal pipeline with Kanban board.
- Activity timeline and audit logging.
- PWA support (installable, offline-capable shell).

## Product Summary

UnifiedCRM is a CRM demo application for sales, marketing, and telemarketing teams. It manages leads, contacts, companies, deals (with pipeline stages), and activities (calls, emails, meetings, etc.) — with role-based access control so different demo accounts show different capabilities.

## Target Users (Demo Accounts)

The app ships with **pre-seeded demo accounts** that interviewers can switch between instantly:

| Demo Account | Role | What It Demonstrates |
|-------------|------|---------------------|
| **Admin User** | ADMIN | Full access: manage users, view audit logs, archive entities, dashboard |
| **Manager User** | MANAGER | Team oversight: assign leads/deals, view team metrics, all data access |
| **Sales Rep User** | SALES | Front-line work: create leads, log activities, manage own deals |
| **Viewer User** | VIEWER | Read-only: browse data, view dashboards, no create/edit |

## Core Workflows to Demo

### Telemarketer/Sales Flow

1. Login as Sales Rep.
2. Create a lead → link to company (or create new company).
3. Log activities (calls, emails) on the lead.
4. Convert the lead into a contact + deal.
5. Move the deal through pipeline stages on the Kanban board.
6. Log more activities on the deal.

### Supervisor/Manager Flow

1. Login as Manager.
2. View dashboard: pipeline summary, team activity, stale deals.
3. Assign leads to team members.
4. Review activity timeline on a deal.
5. Check audit logs.

### RBAC Demo

1. Switch between accounts to show different permission levels.
2. Sales Rep cannot see audit logs or manage users.
3. Viewer cannot create or edit anything.
4. Admin has full access.

## Demo Scope

### Included

- Demo auth (account selector — no passwords, no registration).
- Company management (CRUD, duplicate detection).
- Contact management (CRUD, linked to companies).
- Lead management (CRUD, assignment, conversion to contact/deal).
- Deal pipeline (CRUD, Kanban board, stage history).
- Activity logging (7 types, 7 results, timeline view).
- Comments on activities.
- File attachments via Supabase Storage.
- Dashboard with pipeline summary, recent activities, stale deals, team metrics.
- Notification tray with 5-second long-polling.
- Audit logging.
- RBAC (4 roles with different access levels).
- Global search.
- PWA (installable, app-like experience).
- Responsive layout (desktop-first, works on tablet).

### Not Included

- Real authentication (registration, password reset, OAuth).
- Multi-workspace / multi-tenant.
- Email/WhatsApp/calendar integrations.
- Push notifications (Firebase, etc.).
- Workflow automation.
- Import/export.
- Mobile-native app.
- Advanced analytics.
- Rate limiting.
- i18n.

## Key Assumptions

1. **Single-instance demo:** No multi-tenancy. One shared dataset.
2. **Pre-seeded data:** The app comes with realistic demo data (companies, contacts, leads, deals, activities) so interviewers see a populated UI immediately.
3. **Demo auth only:** No real passwords. Just click an account to switch.
4. **Supabase backend:** Database, auth session management, and file storage all run on Supabase.
5. **Small dataset:** Demo data is small (tens of records, not thousands).
6. **Interview context:** The interviewer will spend 5-15 minutes clicking through the app. Every page must look polished and functional within that time.

## Success Criteria

| Criteria | What "Done" Looks Like |
|----------|----------------------|
| Instant demo start | Click an account → land on dashboard with data in < 2 seconds |
| Professional UI | Looks like a real SaaS product, not a student project |
| Full CRUD flow | Can create, read, update, and archive all entities |
| Pipeline works | Kanban board with drag-and-drop or click-to-move |
| Activity timeline | Deal/contact detail pages show chronological activity history |
| RBAC visible | Switching accounts shows/hides buttons and pages based on role |
| Notifications work | Notification tray shows updates, polling refreshes it |
| Installable PWA | Can "Add to Home Screen" on mobile/desktop |
| No crashes | No errors during a 15-minute demo walkthrough |

## Glossary

| Term | Definition |
|------|-----------|
| **Lead** | A potential prospect not yet qualified. Can be converted into a contact. |
| **Contact** | A qualified person linked to a company. Can have multiple deals. |
| **Company** | An organization. Contacts and leads are linked to companies. |
| **Deal** | A sales opportunity linked to a contact. Moves through pipeline stages. |
| **Pipeline** | Deal stages: Lead → Qualified → Proposal → Negotiation → Closed Won / Closed Lost. |
| **Activity** | An action (call, email, meeting, task, note, demo, follow-up) logged against a deal, contact, or lead. |
| **RBAC** | Role-Based Access Control. 4 roles: Admin, Manager, Sales, Viewer. |
| **PWA** | Progressive Web App. Installable on devices, works offline (shell only). |
