# Schedule Page Technical Audit

Last reviewed: 2026-09-16

This file is the authoritative checklist for the Schedule page technical audit and its follow-up work.

## Status legend

- **Fixed**: implemented in code.
- **Verified**: implemented and validated with a focused test or review.
- **Open**: still requires implementation or verification.

## Audit checklist

| # | Finding | Status | Notes |
|---|---|---|---|
| 1 | Schedule API authentication | Verified | All schedule and schedule-pattern API routes return 401 for unauthenticated requests and 403 for authenticated non-super-admin users. |
| 2 | Schedule server-action authentication | Verified | Schedule-related server actions use the shared SUPER_ADMIN guard before database operations. Unauthorized access fails through the Server Action error boundary rather than an HTTP response, which is expected for Server Actions. |
| 3 | Excel import employee lookup | Complete | Runtime testing confirmed create, update, case-insensitive matching, partial success, and re-upload behavior. Unknown employees show row-specific details in the Sonner notification, and duplicate employee/date rows are detected and blocked before import. |
| 4 | Sequential bulk-import performance | Open | Current import uses dynamic request batches: 1 row for up to 100 rows, 5 for 101–500, and 10 above 500. A shared/background import runner remains a future optimization. |
| 5 | Pagination reset after filtering | Open | Confirm page index resets when schedule filters change. |
| 6 | Loading skeleton behavior | Open | Review whether the schedule loading state uses the correct skeleton layout. |
| 7 | Native delete confirmation | Open | Replace native `confirm()` with an accessible application dialog. |
| 8 | Pagination footer accuracy | Open | Ensure displayed totals and page ranges reflect filtered results. |

## Completed extensions for item 3

- Actual server-confirmed import progress.
- Runtime verification: new rows create successfully; re-imports update successfully; employee-code casing works; unknown employee codes are blocked; partial imports work; re-uploading after an error updates existing records.
- Issue 3 completed: invalid employee-code errors include row details in Sonner, and duplicate employee/date rows are rejected before database writes.
- Dynamic import batching based on total rows.
- Separate created and updated counts.
- Existing schedules update through Prisma upsert instead of failing on the unique employee/date constraint.
- Concise import error messages instead of exposing Prisma stack traces.

## Verification still needed

No remaining verification items for Issue 3. Future audit work continues with Issue 4.

## Change history

- Current auth fix — centralized API authorization responses and corrected 401/403 handling for schedule endpoints.
- Issue 2 verification — confirmed schedule server actions use the shared SUPER_ADMIN authorization guard.

- `16e9ec3` — handle duplicate schedules during batch import.
- `ba36dcb` — report created and updated schedule imports.
- `ac5f439` — use dynamic schedule import batch sizes.
- `cf2e4d4` — resolve project TypeScript errors before continuing the audit.

Keep this checklist updated when an item is implemented or verified. Do not rely on chat history as the audit source of truth.

## Documentation location

Project documentation belongs under `docs/`. Root-level Markdown files should not be added for feature or audit documentation.
