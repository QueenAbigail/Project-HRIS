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
| 3 | Excel import employee lookup | Verified with follow-up | Runtime testing confirmed create, update, case-insensitive matching, partial success, and re-upload behavior. Unknown employees are blocked, but row-specific error details should be improved. Duplicate same-employee/date rows currently use last-row-wins behavior and need a product decision. |
| 4 | Sequential bulk-import performance | Open | Current import uses dynamic request batches: 1 row for up to 100 rows, 5 for 101–500, and 10 above 500. A shared/background import runner remains a future optimization. |
| 5 | Pagination reset after filtering | Open | Confirm page index resets when schedule filters change. |
| 6 | Loading skeleton behavior | Open | Review whether the schedule loading state uses the correct skeleton layout. |
| 7 | Native delete confirmation | Open | Replace native `confirm()` with an accessible application dialog. |
| 8 | Pagination footer accuracy | Open | Ensure displayed totals and page ranges reflect filtered results. |

## Completed extensions for item 3

- Actual server-confirmed import progress.
- Runtime verification: new rows create successfully; re-imports update successfully; employee-code casing works; unknown employee codes are blocked; partial imports work; re-uploading after an error updates existing records.
- Follow-up: identify invalid employee-code rows explicitly and decide whether duplicate employee/date rows should reject the file, keep the first row, or intentionally use last-row-wins.
- Dynamic import batching based on total rows.
- Separate created and updated counts.
- Existing schedules update through Prisma upsert instead of failing on the unique employee/date constraint.
- Concise import error messages instead of exposing Prisma stack traces.

## Verification still needed

- Import a new schedule and confirm it is counted as created.
- Re-import the same employee/date and confirm it is counted as updated.
- Test employee-code whitespace and casing.
- Test an unknown employee code.
- Test duplicate rows within one uploaded file.
- Test partial failures and retry behavior.

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
