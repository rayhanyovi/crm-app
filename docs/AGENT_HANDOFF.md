# Agent Handoff Instructions

## What Is This Project?

A **portfolio/interview demo CRM** built with Next.js + Supabase. It has demo accounts (no real auth), RBAC with 4 roles, and a full lead → contact → deal → activity workflow. The goal is to look polished and professional for a 15-minute interview demo.

**It is NOT a production app.** Do not overengineer.

## Source of Truth Documents

Read in this order before starting any phase:

1. `IMPLEMENTATION_PHASES.md` — What to build, in what order
2. `TECHNICAL_PLAN.md` — Architecture, folder structure, Supabase setup
3. `DATABASE_SCHEMA.md` — Tables, SQL, Supabase-specific setup
4. `API_PLAN.md` — Endpoints, request/response, permissions
5. `RBAC_AND_PERMISSIONS.md` — Roles, permission matrix, `can()` function
6. `DESIGN_DIRECTION.md` — UI components, page layouts, colors
7. `PRODUCT_PLAN.md` — Business rules, validation, edge cases
8. `PROJECT_OVERVIEW.md` — Product context, demo scope

---

## Critical Rules

### Before Coding

1. **Read the current phase** in IMPLEMENTATION_PHASES.md.
2. **Read any referenced docs** (e.g., API_PLAN.md for endpoint specs).
3. **Check existing code** — look at what patterns prior phases established.
4. **Never skip a phase.** They are sequential.

### While Coding

5. **Follow existing patterns.** If Phase 1 established a DataTable pattern, use it in Phase 2. Don't invent a second way.
6. **Always check permissions.** Every mutating API route must call `can()`.
7. **Always create audit logs** for state-changing operations.
8. **Always validate with Zod** on both client (React Hook Form) and server (API route).
9. **No `any`.** Use proper TypeScript types.
10. **Keep it simple.** No premature abstractions. No unused features. No "just in case" code.

### After Coding

11. **Verify the app runs.** `npm run dev` — no crashes. Click through the feature you built.
12. **Run tests.** `npm test` — all pass.
13. **Write a build log** in `docs/build-logs/`.

---

## Don't Overengineer

This is the most important rule. Examples of overengineering to avoid:

| Overengineering | What to Do Instead |
|----------------|---------------------|
| Generic "entity service" for all types | Separate service per entity |
| Custom state management (Redux/Zustand) | TanStack Query + React state |
| Complex middleware chain | Simple `can()` check in each route |
| Dynamic pipeline stages config | Hardcode the 6 stages |
| Fancy loading animations | Simple skeleton shimmer |
| Complex error retry logic | Basic error boundary + retry button |
| WebSocket/SSE notifications | Simple 5-second polling |
| Real auth (JWT, sessions, OAuth) | Cookie with user ID |
| Custom drag-and-drop | @dnd-kit (library) |
| Database ORM (Prisma) | Supabase client directly |

**Rule of thumb:** If a feature takes more than 30 minutes and isn't in the phase spec, skip it.

---

## Architecture Layers

```
[UI Component] → [TanStack Query Hook] → [API Route] → [Service] → [Supabase Client]
                                              ↓
                                         [Validators (Zod)]
                                         [Permissions (can())]
                                         [Audit (createAuditLog)]
                                         [Notifications (createNotification)]
```

- **API routes** handle HTTP. They parse requests, call services, return responses.
- **Services** contain business logic. They call Supabase.
- **Components** fetch data via TanStack Query hooks. They never call Supabase directly.
- **Validators** are shared between client forms and server routes.

---

## Common Patterns

### Adding a New API Route

```typescript
// src/app/api/{entity}/route.ts
import { withErrorHandler, successResponse, errorResponse } from '@/lib/api-helpers';
import { getCurrentUser } from '@/lib/supabase/server';
import { can } from '@/lib/permissions';
import { createEntitySchema } from '@/lib/validators/{entity}';
import { entityService } from '@/services/{entity}.service';

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const user = await getCurrentUser();
    if (!user) throw new AuthError();
    if (!can(user, 'create', '{entity}')) throw new ForbiddenError();

    const body = await request.json();
    const validated = createEntitySchema.parse(body);
    const result = await entityService.create(validated, user.id);
    return successResponse(result, undefined, 201);
  });
}
```

### Adding a New List Page

```typescript
// src/app/(dashboard)/{entity}/page.tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { columns } from '@/components/features/{entity}/{entity}-columns';

export default function EntityListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['{entity}', filters],
    queryFn: () => fetch(`/api/{entity}?${params}`).then(r => r.json()),
  });

  return (
    <div>
      <PageHeader title="{Entity}" action={<CreateButton />} />
      <FilterBar ... />
      <DataTable columns={columns} data={data?.data} isLoading={isLoading} />
    </div>
  );
}
```

### Adding a New Form

```typescript
// src/components/features/{entity}/{entity}-form.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { entitySchema } from '@/lib/validators/{entity}';
import { EntityDrawer } from '@/components/shared/entity-drawer';

export function EntityForm({ onSuccess }) {
  const form = useForm({ resolver: zodResolver(entitySchema) });

  const mutation = useMutation({
    mutationFn: (data) => fetch('/api/{entity}', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { queryClient.invalidateQueries(['{entity}']); onSuccess(); toast.success('Created!'); },
    onError: () => toast.error('Failed to create'),
  });

  return <EntityDrawer><form onSubmit={form.handleSubmit(mutation.mutate)}>...</form></EntityDrawer>;
}
```

---

## How to Handle Ambiguity

1. **Check other docs.** The answer is usually in API_PLAN.md or PRODUCT_PLAN.md.
2. **Follow existing patterns.** If companies handle it one way, contacts should too.
3. **Pick the simpler option.** Document what you chose in the build log.
4. **Only ask a human** if the decision is irreversible (schema change) or dramatically changes UX.

---

## Verification Checklist (Per Phase)

- [ ] `npm run dev` — no errors
- [ ] `npm test` — all pass
- [ ] New pages load correctly
- [ ] Forms validate (try empty/invalid data)
- [ ] Permissions enforced (switch to Viewer — buttons hidden, API returns 403)
- [ ] Audit logs created for state changes
- [ ] Empty states display correctly
- [ ] Loading skeletons appear
- [ ] Error states work (try disconnecting network)
- [ ] Build log written

---

## Summary

| Do | Don't |
|----|-------|
| Keep it simple and polished | Overengineer or add unused features |
| Follow existing patterns | Invent new patterns |
| Check permissions with `can()` | Skip permission checks |
| Validate with Zod (client + server) | Trust client input |
| Create audit logs for state changes | Skip audit logging |
| Use Supabase client directly | Add an ORM layer |
| Use TanStack Query for data | Add Redux/Zustand |
| Write build logs after each phase | Skip documentation |
| Make it look professional | Make it look like a toy |
