# Build Log Template

## Location

```
docs/build-logs/YYYY-MM-DD_phase-N_short-description.md
```

## When to Write

- After completing a phase.
- After a significant sub-task if the phase spans multiple sessions.
- When deviating from documentation.

---

## Template

```markdown
# Build Log: Phase [N] — [Phase Name]

## Session Info

| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Phase | Phase N: [Phase Name] |
| Agent/Model | [e.g., Claude Sonnet] |

## Tasks Completed

- [x] Task N.1: [Description]
- [x] Task N.2: [Description]
- [ ] Task N.3: [Incomplete — reason]

## Files Created

| File | Purpose |
|------|---------|
| `src/path/file.ts` | Brief description |

## Files Modified

| File | Changes |
|------|---------|
| `src/path/file.ts` | What changed |

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| [What] | [Why] |

## Issues Encountered

| Issue | Resolution |
|-------|-----------|
| [Problem] | [Fix or "UNRESOLVED"] |

## Deviations from Docs

| Document | What Changed | Why |
|----------|-------------|-----|
| [Doc] | [Deviation] | [Reason] |

## Testing

- [ ] `npm run dev` — no errors
- [ ] `npm test` — all pass
- [ ] Manual testing completed

## Remaining Work

- [Items not completed]

## Next Phase Ready

- [ ] All acceptance criteria met
- [ ] App is stable
```

---

## Guidelines

1. **Be specific.** "Fixed a bug" → "Fixed duplicate company check — was comparing with `=` instead of `ILIKE`."
2. **Document decisions.** The next agent needs to know why you chose A over B.
3. **Flag deviations.** If you changed something from the docs, explain why.
4. **Be honest about issues.** Don't hide problems.
5. **Keep it short.** Tables and checkboxes. No essays.
