# Design Direction

## Philosophy

This is a **portfolio demo**. It must look like a real SaaS product built by a senior engineer, not a student project. Prioritize:

- **Professional:** Clean, neutral, business-tool aesthetic. Think Linear, Attio, HubSpot (simplified).
- **Data-dense:** Tables, metrics, and timelines dominate. No filler content.
- **Fast:** Skeleton loaders, instant page transitions, no unnecessary animations.
- **Polished:** Consistent spacing, proper empty states, proper error states. These details make the difference.

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#FFFFFF` | Page background |
| Card/Sidebar | `#FAFAFA` | Cards, sidebar |
| Border | `#E5E7EB` | All borders |
| Text Primary | `#111827` | Headings, body text |
| Text Secondary | `#6B7280` | Labels, descriptions |
| Text Muted | `#9CA3AF` | Placeholders |
| Primary | `#2563EB` | Buttons, links, active |
| Success | `#16A34A` | Won, completed |
| Warning | `#F59E0B` | Stale, follow-up |
| Danger | `#DC2626` | Lost, errors, delete |

### Deal Stage Colors

| Stage | Badge Class |
|-------|-------------|
| Lead | `bg-gray-100 text-gray-700` |
| Qualified | `bg-blue-100 text-blue-700` |
| Proposal | `bg-purple-100 text-purple-700` |
| Negotiation | `bg-amber-100 text-amber-700` |
| Closed Won | `bg-green-100 text-green-700` |
| Closed Lost | `bg-red-100 text-red-700` |

### Activity Type Icons

| Type | Color | Lucide Icon |
|------|-------|-------------|
| Call | Blue | `Phone` |
| Email | Purple | `Mail` |
| Meeting | Amber | `Calendar` |
| Task | Gray | `CheckSquare` |
| Note | Sky | `FileText` |
| Demo | Pink | `Monitor` |
| Follow-Up | Orange | `Clock` |

---

## Layout

```
┌─────────────────────────────────────────────────┐
│  Top Bar (search, notifications, user/switch)   │
├────────┬────────────────────────────────────────┤
│        │                                        │
│ Side   │  Main Content                          │
│ bar    │                                        │
│        │  ┌────────────────────────────────┐    │
│ - Dash │  │ Page Header + Actions          │    │
│ - Leads│  ├────────────────────────────────┤    │
│ - Cont │  │ Content (table/form/board)     │    │
│ - Comp │  │                                │    │
│ - Deals│  │                                │    │
│ - Acts │  └────────────────────────────────┘    │
│ ─────  │                                        │
│ - Team │                                        │
│ - Audit│                                        │
└────────┴────────────────────────────────────────┘
```

### Sidebar (240px expanded, 64px collapsed)

- App logo/name at top.
- Nav items with Lucide icons:
  - Dashboard
  - Leads
  - Contacts
  - Companies
  - Deals
  - Activities
  - --- (divider)
  - Team (ADMIN only)
  - Audit Logs (ADMIN only)
- Collapse toggle at bottom.
- Items hidden based on role.

### Top Bar (56px)

- Left: Breadcrumbs.
- Center/Right: Global search (`Cmd+K`), Notification bell (with badge), User avatar dropdown.
- User dropdown: Current user name + role badge, "Switch Account" option, Logout.

**No workspace selector** — single instance.

---

## URL Structure

```
/login                         — Demo account selector
/dashboard                     — Main dashboard
/leads                         — Lead list
/leads/:id                     — Lead detail
/contacts                      — Contact list
/contacts/:id                  — Contact detail
/companies                     — Company list
/companies/:id                 — Company detail
/deals                         — Deal list (table)
/deals/pipeline                — Deal pipeline (Kanban)
/deals/:id                     — Deal detail
/activities                    — Activity list
/team                          — Team/user management (ADMIN)
/audit-logs                    — Audit logs (ADMIN)
```

---

## Page Designs

### Login Page (Demo Account Selector)

**No form. Just cards.**

```
┌─────────────────────────────────────────┐
│         UnifiedCRM Demo                 │
│    Select an account to continue        │
│                                         │
│  ┌───────────┐  ┌───────────┐          │
│  │ 👤 Admin  │  │ 👤 Manager│          │
│  │ ADMIN     │  │ MANAGER   │          │
│  │ Full      │  │ Team      │          │
│  │ access    │  │ oversight │          │
│  └───────────┘  └───────────┘          │
│                                         │
│  ┌───────────┐  ┌───────────┐          │
│  │ 👤 Sales  │  │ 👤 Viewer │          │
│  │ SALES     │  │ VIEWER    │          │
│  │ CRM       │  │ Read-only │          │
│  │ workflow  │  │ access    │          │
│  └───────────┘  └───────────┘          │
│                                         │
│    Built with Next.js + Supabase        │
└─────────────────────────────────────────┘
```

Click a card → instant login → redirect to /dashboard.

### Dashboard

Manager/Admin view:

```
┌──────────┬──────────┬──────────┬──────────┐
│ Total    │ Open     │ Won This │ Pipeline │
│ Deals    │ Deals    │ Month    │ Value    │
│ 45       │ 32       │ 8        │ $1.25M   │
├──────────┴──────────┴──────────┴──────────┤
│ Pipeline Summary (bar chart by stage)     │
├───────────────────┬───────────────────────┤
│ Recent Activities │ Stale Deals           │
│ (timeline list)   │ (alert table)         │
├───────────────────┴───────────────────────┤
│ Team Activity (activities per member)     │
└───────────────────────────────────────────┘
```

Sales view: Personal summary (my deals, my upcoming/overdue activities).

### List Pages (all entities)

```
┌─────────────────────────────────────────┐
│ Leads                      [+ Add Lead] │
├─────────────────────────────────────────┤
│ [Search...] [Status ▼] [Source ▼] [Owner]│
├─────────────────────────────────────────┤
│ Name       │ Company │ Status │ Owner   │
│ Bob Jones  │ Acme    │ NEW    │ Sales   │
│ Alice S.   │ TechCo  │ QUAL   │ Sales   │
├─────────────────────────────────────────┤
│ 1-25 of 156         [◀ Prev] [Next ▶]  │
└─────────────────────────────────────────┘
```

### Detail Pages (two-column)

```
┌─────────────────────┬───────────────────┐
│ ← Back     [Edit][⋮]│                   │
│                     │ Activity Timeline  │
│ Detail Card         │ [+ Add Activity]  │
│ ┌─────────────────┐ │                   │
│ │ Name: Bob Jones │ │ ● Jan 15 — Call   │
│ │ Email: bob@...  │ │   "Discussed..."  │
│ │ Status: QUAL    │ │                   │
│ │ Owner: Sales    │ │ ● Jan 12 — Email  │
│ └─────────────────┘ │   "Sent proposal" │
│                     │                   │
│ Related Entities    │ ● Jan 10 — Note   │
│ ┌─────────────────┐ │   "Initial call"  │
│ │ Deals (2)       │ │                   │
│ └─────────────────┘ │                   │
└─────────────────────┴───────────────────┘
```

### Deal Pipeline (Kanban)

```
┌────────┬────────┬────────┬────────┬────────┐
│ LEAD   │ QUAL   │ PROP   │ NEGO   │ WON    │
│ (5)    │ (3)    │ (4)    │ (2)    │ (8)    │
│ $120K  │ $85K   │ $200K  │ $150K  │ $450K  │
├────────┼────────┼────────┼────────┼────────┤
│┌──────┐│┌──────┐│┌──────┐│        │        │
││ Deal ││ Deal ││ Deal ││        │        │
││ $25K ││ $30K ││ $50K ││        │        │
│└──────┘│└──────┘│└──────┘│        │        │
│┌──────┐│        │        │        │        │
││ Deal ││        │        │        │        │
│└──────┘│        │        │        │        │
└────────┴────────┴────────┴────────┴────────┘
```

Toggle between Kanban and Table views. Deal cards show: title, value, contact, assignee.

### Forms (Right Drawer, 480px)

Slide-over from right for create/edit. Required fields marked with `*`. Validation inline. Cancel asks for confirmation if dirty.

### Activity Form (Modal, 560px)

Type selector as pill buttons. Dynamic metadata fields based on type. Entity linking with combobox.

---

## Component Library

### shadcn/ui Base Components

Install: `button`, `input`, `textarea`, `select`, `checkbox`, `badge`, `dialog`, `sheet`, `dropdown-menu`, `popover`, `command`, `table`, `tabs`, `avatar`, `separator`, `skeleton`, `tooltip`, `card`, `calendar`, `form`, `label`, `scroll-area`. Plus `sonner` for toasts.

### Custom Components

| Component | Purpose |
|-----------|---------|
| `DataTable` | Sortable, filterable, paginated table |
| `FilterBar` | Search + dropdown filters |
| `StatusBadge` | Colored badge for statuses |
| `StageBadge` | Deal stage badge |
| `ActivityTimeline` | Vertical timeline of activities |
| `ActivityCard` | Single activity in timeline |
| `DetailLayout` | Two-column detail page layout |
| `DetailCard` | Read-only field display |
| `EntityDrawer` | Right slide-over for forms |
| `ConfirmDialog` | Confirmation with destructive option |
| `EmptyState` | Icon + message + CTA |
| `StatCard` | Metric card for dashboard |
| `PipelineBoard` | Kanban board |
| `PipelineColumn` | Single Kanban column |
| `DealCard` | Compact deal card for Kanban |
| `NotificationTray` | Bell + dropdown list |
| `SearchCommand` | Cmd+K command palette |
| `PageHeader` | Title + actions |
| `UserAvatar` | Avatar with initials fallback |
| `DemoAccountSwitcher` | User menu with account switch |

---

## States

### Loading

- Table skeleton: 5 rows of rectangular placeholders.
- Detail skeleton: card placeholder + timeline placeholder.
- Dashboard skeleton: stat card placeholders.
- Button loading: spinner icon, disabled.

### Empty

| Context | Message | CTA |
|---------|---------|-----|
| No leads | "No leads yet. Start prospecting!" | + Add Lead |
| No deals | "Your pipeline is empty." | + Create Deal |
| No activities | "No activities logged." | + Log Activity |
| Search empty | "No results for '[q]'" | — |
| Dashboard empty | "Get started by adding your first lead." | + Add Lead |

### Error

- Page error: error card with "Try Again" button.
- Form error: inline red text per field.
- Mutation error: toast notification (sonner).
- Network error: "Unable to connect" with retry.

---

## Responsive

- **Desktop (≥1280px):** Full layout.
- **Tablet (768-1279px):** Sidebar collapses to icons. Dashboard grid 2 columns.
- **Mobile (<768px):** Since this is a PWA, the sidebar becomes a bottom navigation bar or hamburger menu. Tables scroll horizontally. Forms go full-width.

---

## PWA Requirements

- `manifest.json` with app name, icons, theme color, `display: standalone`.
- Service worker with basic shell caching (app shell loads offline, data requires network).
- `<meta name="theme-color">` matching the primary color.
- iOS splash screens (optional — nice-to-have).
- App is installable via "Add to Home Screen" on Chrome and Safari.
