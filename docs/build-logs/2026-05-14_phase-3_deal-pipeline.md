# Phase 3 - Deal Pipeline

Date: 2026-05-14

## Scope

- Continued Claude's partial Phase 3 implementation instead of restarting it.
- Fixed deal validator output/input typing, deal service Supabase typing for `deal_stage_history`, ownership checks, and API route RBAC for Sales-owned deals.
- Completed deal table view, pipeline view, draggable Kanban board, deal cards, stage-change dialog, deal detail page, stage history timeline, assignment flow, and form company selection.
- Added `StageBadge`, deal API routes, notifications, audit hooks, and focused deal validator tests.

## Notes

- `src/types/database.ts` still does not include `deal_stage_history`, so `deal.service.ts` uses a local typed Supabase table adapter rather than widening to `any`.
- Deal ownership follows the RBAC document: `assigned_to_id ?? created_by_id`.
- Closing as `CLOSED_LOST` requires `lost_reason`; reopening closed deals is enforced by the service as Manager/Admin-only.
- Supabase changelog was checked during implementation; no relevant breaking client/API change affected this work.

## Verification

- `npx tsc --noEmit --pretty false` passed.
- `npm run lint` passed.
- `npm test` passed: 5 test files, 22 tests.
- `npm run build` passed.
- API smoke against local dev server:
  - Admin created deal `8590c9cf-4f86-423a-adb8-763ff9e1acd7`.
  - Deal list search returned the created deal.
  - Deal detail loaded.
  - Stage moved from `LEAD` to `PROPOSAL`.
  - Assignment to Sales Rep succeeded.
  - Stage history returned 2 entries.
  - Pipeline returned 6 stages.
  - `CLOSED_LOST` without a lost reason returned `400`.
  - Viewer deal creation returned `403`.
- Browser smoke:
  - `/deals` loaded.
  - `/deals/pipeline` loaded.
  - `/deals/8590c9cf-4f86-423a-adb8-763ff9e1acd7` loaded.
