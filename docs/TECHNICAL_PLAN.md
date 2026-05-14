# Technical Plan

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | Fullstack React, server components, API routes |
| Language | TypeScript | Type safety, demonstrates skill |
| Styling | Tailwind CSS 4 | Fast, consistent |
| Components | shadcn/ui | Professional UI, full control |
| Data Fetching | TanStack Query 5 | Caching, polling, optimistic updates |
| Forms | React Hook Form 7 + Zod 3 | Performant forms, shared validation |
| Database | Supabase (PostgreSQL) | Managed DB, auth helpers, storage |
| File Storage | Supabase Storage | Bucket-based file upload/download |
| Charts | Recharts 2 | Simple dashboard charts |
| Icons | Lucide React | Clean icons, included with shadcn |
| Toasts | Sonner | Toast notifications |
| Dates | date-fns 3 | Lightweight date formatting |
| PWA | next-pwa or manual | Service worker, manifest |
| Drag-and-drop | @dnd-kit/core | Kanban board drag |
| Testing | Vitest | Unit tests for critical logic |

**No Prisma.** We use the Supabase JS client directly for database access. Types are generated via `supabase gen types typescript`.

---

## Project Structure

```
crm-module/
├── docs/                           # Documentation (this)
│   └── build-logs/
├── supabase/
│   ├── migrations/                 # SQL migrations
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_search_vectors.sql
│   │   └── 00003_triggers.sql
│   └── seed.sql                    # Demo data
├── public/
│   ├── manifest.json               # PWA manifest
│   ├── sw.js                       # Service worker
│   └── icons/                      # PWA icons (192px, 512px)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx      # Demo account selector
│   │   │   └── layout.tsx          # Centered layout
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── contacts/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── companies/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── deals/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── pipeline/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── activities/page.tsx
│   │   │   ├── team/page.tsx
│   │   │   ├── audit-logs/page.tsx
│   │   │   └── layout.tsx          # Sidebar + TopBar
│   │   ├── api/                    # API routes (see API_PLAN.md)
│   │   │   ├── auth/
│   │   │   ├── companies/
│   │   │   ├── contacts/
│   │   │   ├── leads/
│   │   │   ├── deals/
│   │   │   ├── activities/
│   │   │   ├── notifications/
│   │   │   ├── dashboard/
│   │   │   ├── search/
│   │   │   ├── attachments/
│   │   │   └── audit-logs/
│   │   ├── layout.tsx              # Root layout + providers
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                     # shadcn components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   ├── notification-tray.tsx
│   │   │   ├── search-command.tsx
│   │   │   ├── page-header.tsx
│   │   │   └── demo-account-switcher.tsx
│   │   ├── shared/
│   │   │   ├── data-table.tsx
│   │   │   ├── filter-bar.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── stage-badge.tsx
│   │   │   ├── activity-timeline.tsx
│   │   │   ├── activity-card.tsx
│   │   │   ├── detail-layout.tsx
│   │   │   ├── detail-card.tsx
│   │   │   ├── entity-drawer.tsx
│   │   │   ├── confirm-dialog.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── stat-card.tsx
│   │   │   └── user-avatar.tsx
│   │   └── features/
│   │       ├── leads/
│   │       ├── contacts/
│   │       ├── companies/
│   │       ├── deals/
│   │       ├── activities/
│   │       └── dashboard/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser Supabase client
│   │   │   ├── server.ts           # Server-side Supabase client
│   │   │   └── middleware.ts       # Supabase middleware helpers
│   │   ├── permissions.ts          # can() function
│   │   ├── audit.ts                # createAuditLog()
│   │   ├── notifications.ts        # createNotification()
│   │   ├── api-helpers.ts          # Response helpers, error classes
│   │   ├── constants.ts            # Enums, stage order, file types
│   │   └── utils.ts                # formatCurrency, formatDate, etc.
│   ├── lib/validators/
│   │   ├── company.ts
│   │   ├── contact.ts
│   │   ├── lead.ts
│   │   ├── deal.ts
│   │   ├── activity.ts
│   │   └── common.ts               # Pagination, sort schemas
│   ├── hooks/
│   │   ├── use-current-user.ts     # Current user from session
│   │   ├── use-debounce.ts
│   │   └── use-pagination.ts
│   ├── types/
│   │   ├── database.ts             # Generated Supabase types
│   │   ├── api.ts                  # API response types
│   │   └── enums.ts                # TypeScript enum mirrors
│   └── services/                   # Business logic (used by API routes)
│       ├── auth.service.ts
│       ├── company.service.ts
│       ├── contact.service.ts
│       ├── lead.service.ts
│       ├── deal.service.ts
│       ├── activity.service.ts
│       ├── notification.service.ts
│       ├── dashboard.service.ts
│       ├── search.service.ts
│       └── audit.service.ts
├── tests/
│   └── unit/
│       ├── permissions.test.ts
│       └── validators.test.ts
├── .env.local
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## Authentication Strategy (Demo Auth)

### How It Works

1. **Login page** shows 4 demo account cards (fetched from `GET /api/auth/demo-accounts`).
2. User clicks a card → `POST /api/auth/demo-login` with the user's ID.
3. Server sets an **httpOnly cookie** named `demo_user_id` with the user's UUID.
4. All subsequent API requests read this cookie to identify the current user.
5. **No passwords, no JWT, no OAuth.** Just a cookie with a user ID.

### Session Helper

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('demo_user_id')?.value;
  if (!userId) return null;

  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return data;
}
```

### Middleware

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const userId = request.cookies.get('demo_user_id')?.value;
  if (!userId && request.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!login|api/auth|_next|icons|manifest.json|sw.js).*)'],
};
```

---

## Supabase Client Setup

### Browser Client

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Server Client (for API routes and server components)

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role for full access
    { cookies: { /* cookie handlers */ } }
  );
}
```

**Important:** We use the **service role key** on the server because we're not using Supabase Auth. Our app-level auth (demo cookie + `can()` function) handles access control. RLS is not needed for a demo.

### Type Generation

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

Run this after any schema change to keep types in sync.

---

## State Management

- **Server state:** TanStack Query for all API data. Query keys follow a factory pattern.
- **Form state:** React Hook Form + Zod.
- **UI state:** React `useState` (sidebar collapsed, modal open, filters).
- **Auth state:** `use-current-user` hook backed by TanStack Query calling `/api/auth/me`.

### Notification Polling

```typescript
// In the NotificationTray component:
const { data } = useQuery({
  queryKey: ['notifications'],
  queryFn: () => fetch('/api/notifications?is_read=false').then(r => r.json()),
  refetchInterval: 5000,  // Poll every 5 seconds
});
```

---

## Error Handling

### API Routes

```typescript
// lib/api-helpers.ts
export function successResponse(data: any, meta?: any, status = 200) {
  return NextResponse.json({ data, meta }, { status });
}

export function errorResponse(code: string, message: string, status: number, details?: any) {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

export async function withErrorHandler(handler: () => Promise<NextResponse>) {
  try { return await handler(); }
  catch (e) {
    if (e instanceof ZodError) return errorResponse('VALIDATION_ERROR', 'Invalid input', 400, e.flatten());
    if (e instanceof ForbiddenError) return errorResponse('FORBIDDEN', e.message, 403);
    if (e instanceof NotFoundError) return errorResponse('NOT_FOUND', e.message, 404);
    console.error(e);
    return errorResponse('INTERNAL_ERROR', 'Something went wrong', 500);
  }
}
```

### Client

- TanStack Query `onError` → toast notification.
- React error boundaries per route segment.
- Form validation errors shown inline.

---

## File Upload (Supabase Storage)

```typescript
// In API route for file upload:
const supabase = createServerSupabaseClient();
const file = await request.formData().then(fd => fd.get('file'));

const path = `activities/${activityId}/${crypto.randomUUID()}_${file.name}`;
const { data, error } = await supabase.storage
  .from('attachments')
  .upload(path, file, { contentType: file.type });

// Save metadata to attachments table
await supabase.from('attachments').insert({
  entity_type: 'ACTIVITY',
  entity_id: activityId,
  file_name: file.name,
  file_size: file.size,
  mime_type: file.type,
  storage_path: path,
  uploaded_by_id: currentUser.id,
});
```

For download: generate a signed URL via `supabase.storage.from('attachments').createSignedUrl(path, 3600)`.

---

## PWA Setup

### manifest.json

```json
{
  "name": "UnifiedCRM",
  "short_name": "CRM",
  "start_url": "/login",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563EB",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker (basic)

Use `next-pwa` package or a minimal custom service worker that caches the app shell (HTML, CSS, JS bundles). Data always fetched from network.

```bash
npm install next-pwa
```

Configure in `next.config.ts`:
```typescript
const withPWA = require('next-pwa')({ dest: 'public', disable: process.env.NODE_ENV === 'development' });
module.exports = withPWA({ /* next config */ });
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_APP_NAME=UnifiedCRM
```

**Only 3 required env vars.** Keep it simple.

---

## Deployment

### Development

1. Create Supabase project at supabase.com.
2. Run migrations via Supabase dashboard SQL editor (paste migration files).
3. Run seed SQL.
4. Copy Supabase URL and keys to `.env.local`.
5. `npm install && npm run dev`

### Production

Deploy to **Vercel** (free tier):
1. Push to GitHub.
2. Connect to Vercel.
3. Set env vars in Vercel dashboard.
4. Auto-deploys on push.

Supabase free tier handles the database and storage.

**Total cost: $0.** Perfect for a portfolio demo.

---

## Testing Strategy

**Keep it minimal.** This is a demo, not a production app.

| What | How | Priority |
|------|-----|----------|
| Permission logic (`can()`) | Vitest unit tests | Must |
| Zod validators | Vitest unit tests | Must |
| Deal stage transition rules | Vitest unit tests | Should |
| Lead conversion logic | Vitest unit tests | Should |
| E2E flows | Manual testing | Must |

**No integration tests** (would need a test database setup — not worth the complexity for a demo).

---

## Code Conventions

| Item | Convention |
|------|-----------|
| Component files | PascalCase: `DealCard.tsx` |
| Utility files | kebab-case: `api-helpers.ts` |
| Functions | camelCase: `createDeal()` |
| DB columns | snake_case: `assigned_to_id` |
| API JSON fields | snake_case (matching DB): `assigned_to_id` |
| TypeScript types | PascalCase: `DealResponse` |
| No `any` | Use proper types |
| Named exports | Except page.tsx (default export) |
