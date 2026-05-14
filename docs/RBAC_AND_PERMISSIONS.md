# RBAC and Permissions

## Overview

UnifiedCRM uses **simple role-based access control**. Each user has a `role` field directly on their user record. No multi-tenant / workspace scoping — this is a single-instance demo.

## Roles

| Role | Level | Purpose |
|------|-------|---------|
| ADMIN | Highest | Full access. Manage users, audit logs, archive anything. |
| MANAGER | High | Team oversight. Assign leads/deals, view all data, team metrics. |
| SALES | Standard | Day-to-day CRM work. CRUD on own records. |
| VIEWER | Lowest | Read-only access. Browse and view only. |

Higher roles inherit all permissions of lower roles.

---

## Permission Matrix

### Company

| Action | Admin | Manager | Sales | Viewer |
|--------|-------|---------|-------|--------|
| Create | Yes | Yes | Yes | No |
| Read (list + detail) | Yes | Yes | Yes | Yes |
| Update | Yes | Yes | Yes | No |
| Archive | Yes | No | No | No |

### Contact

| Action | Admin | Manager | Sales | Viewer |
|--------|-------|---------|-------|--------|
| Create | Yes | Yes | Yes | No |
| Read | Yes | Yes | Yes | Yes |
| Update | Yes | Yes | Own only | No |
| Archive | Yes | No | No | No |

### Lead

| Action | Admin | Manager | Sales | Viewer |
|--------|-------|---------|-------|--------|
| Create | Yes | Yes | Yes | No |
| Read | Yes | Yes | Yes | Yes |
| Update | Yes | Yes | Own only | No |
| Assign | Yes | Yes | No | No |
| Convert | Yes | Yes | Own only | No |
| Move status backward | Yes | Yes | No | No |

### Deal

| Action | Admin | Manager | Sales | Viewer |
|--------|-------|---------|-------|--------|
| Create | Yes | Yes | Yes | No |
| Read (list + detail + Kanban) | Yes | Yes | Yes | Yes |
| Update | Yes | Yes | Own only | No |
| Change stage | Yes | Yes | Own only | No |
| Reopen closed deal | Yes | Yes | No | No |
| Assign/reassign | Yes | Yes | No | No |
| Archive | Yes | No | No | No |

### Activity

| Action | Admin | Manager | Sales | Viewer |
|--------|-------|---------|-------|--------|
| Create | Yes | Yes | Yes | No |
| Read | Yes | Yes | Yes | Yes |
| Update | Yes | Yes | Own only | No |
| Add comment | Yes | Yes | Yes | No |
| Delete comment | Yes | No | No | No |
| Add attachment | Yes | Yes | Yes | No |
| Delete attachment | Yes | No | Own (uploader) | No |

### System

| Action | Admin | Manager | Sales | Viewer |
|--------|-------|---------|-------|--------|
| View dashboard (team) | Yes | Yes | No | Yes (read) |
| View dashboard (personal) | Yes | Yes | Yes | No |
| View audit logs | Yes | No | No | No |
| Manage users (view team page) | Yes | No | No | No |
| Global search | Yes | Yes | Yes | Yes |
| View notifications | Own | Own | Own | Own |

---

## Data Visibility

- **VIEWER:** Can see all data (read-only). Cannot create, edit, or delete anything.
- **SALES:** Can see all data. Can create new records. Can only **edit records they own** (created by them or assigned to them).
- **MANAGER:** Can see and edit all data. Can assign/reassign leads and deals. Cannot archive or manage users.
- **ADMIN:** Full access to everything including archiving, audit logs, and user management.

**"Own only" means:** The `assigned_to_id` (for leads/deals) or `created_by_id` (for activities/contacts) matches the current user.

---

## Authorization Implementation

### `can()` Function

A single function checks permissions. Used in every API route handler.

```typescript
// src/lib/permissions.ts

type Action = 'create' | 'read' | 'update' | 'delete' | 'assign' | 'convert' | 'archive';
type Resource = 'company' | 'contact' | 'lead' | 'deal' | 'activity' | 'comment' | 'attachment' | 'audit_log' | 'user';

interface AuthUser {
  id: string;
  role: 'ADMIN' | 'MANAGER' | 'SALES' | 'VIEWER';
}

interface ResourceContext {
  ownerId?: string;    // assigned_to_id or created_by_id
}

function can(user: AuthUser, action: Action, resource: Resource, ctx?: ResourceContext): boolean
```

### Rule Encoding

```typescript
const RULES = {
  company: {
    create:  { minRole: 'SALES' },
    read:    { minRole: 'VIEWER' },
    update:  { minRole: 'SALES' },
    archive: { minRole: 'ADMIN' },
  },
  deal: {
    create:  { minRole: 'SALES' },
    read:    { minRole: 'VIEWER' },
    update:  { minRole: 'SALES', ownerOnly: true },
    assign:  { minRole: 'MANAGER' },
    archive: { minRole: 'ADMIN' },
  },
  // ... etc
};

// Role hierarchy for comparison
const ROLE_LEVEL = { VIEWER: 0, SALES: 1, MANAGER: 2, ADMIN: 3 };

// ownerOnly: true means SALES must own the resource. MANAGER+ bypasses.
```

### Usage in API Routes

```typescript
const user = await getCurrentUser(request);
if (!can(user, 'update', 'deal', { ownerId: deal.assigned_to_id })) {
  return errorResponse('FORBIDDEN', 'No permission', 403);
}
```

### Usage in UI

```typescript
// Conditionally render buttons
{can(currentUser, 'create', 'lead') && <Button>+ Add Lead</Button>}
{can(currentUser, 'archive', 'company') && <DropdownMenuItem>Archive</DropdownMenuItem>}
```

---

## Notification Recipients

| Event | Who Gets Notified |
|-------|------------------|
| Lead assigned | Assigned user |
| Lead converted | Managers + Admins |
| Deal stage changed | Deal owner (if not the actor) + Managers |
| Deal closed (Won/Lost) | Managers + Admins |
| Deal assigned | New assignee |
| Activity comment added | Activity creator (if not the commenter) |
| Stale deal detected | Deal owner + Managers |
