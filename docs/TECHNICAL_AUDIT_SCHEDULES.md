# Schedule Page — Technical Audit

> **Source of truth:** This document tracks the Schedule page audit, implementation status, verification results, and follow-up work.
>
> **Last reviewed:** 16 September 2026

## Status legend

| Symbol | Status | Meaning |
|:---:|---|---|
| ✅ | **Complete** | Implemented and verified. |
| 🔍 | **Verified** | Reviewed or tested; no remaining fix is required. |
| ⚠️ | **Open** | Still requires implementation or verification. |
| ℹ️ | **Follow-up** | Optional improvement or future optimization. |

## Audit checklist

| # | Finding | Status | Current result / next action |
|---:|---|:---:|---|
| 1 | Schedule API authentication | ✅ **Complete** | Schedule and schedule-pattern APIs return `401` for unauthenticated requests and `403` for authenticated non-super-admin users. |
| 2 | Schedule server-action authentication | ✅ **Complete** | Schedule server actions use the shared `SUPER_ADMIN` guard before database operations. Unauthorized actions fail through the Server Action error boundary. |
| 3 | Excel import employee lookup | ✅ **Complete** | Create, update, case-insensitive matching, partial success, row-specific errors, and duplicate-row blocking were tested successfully. |
| 4 | Sequential bulk-import performance | 🔍 **Improved; verify** | Dynamic batches are selected directly from total rows: 1 row for up to 100, 5 for 101–500, and 10 above 500. Every batch is processed sequentially to avoid overlapping database writes. Runtime timing verification is still recommended. |
| 5 | Pagination reset after filtering | 🔍 **Implemented; verify** | Search and past-schedule filters reset to page 1, and the displayed page is clamped when filtered results shrink. Browser verification remains pending because the preview requires authenticated access. |
| 6 | Loading skeleton behavior | ✅ **Complete** | Layout-matched skeletons for shift rows and schedule assignments are working correctly, with accessible loading status semantics. |
| 7 | Native delete confirmation | ✅ **Complete** | Replaced native `confirm()` with an accessible Alert Dialog showing the employee, shift, date, Cancel, and Delete actions. Browser verification completed successfully. |
| 8 | Pagination footer accuracy | ✅ **Complete** | Non-empty ranges remain accurate, and empty filtered results show `Showing 0 of 0 schedules` without pagination controls. Browser verification completed successfully. |
| 9 | Import replacement safety | 🔍 **Protected; follow-up** | Import and bulk operations now block today/past dates. Manual changes require two confirmations for protected dates. Replacement remains scoped for future review because upsert-only versus explicit range replacement still needs a final product decision. |
| 10 | Import atomicity | ⚠️ **Open** | Evaluate transaction or rollback behavior when a later import batch fails after earlier batches have changed the database. |
| 11 | Import database efficiency | ℹ️ **Follow-up** | Review the number of employee, shift, lookup, and upsert queries performed per row and consider a safer server-side bulk operation. |
| 12 | Server-action error reporting | ⚠️ **Open** | Ensure database failures are not converted into empty schedule lists that look like a valid no-data state. |
| 13 | Schedule type safety | ℹ️ **Follow-up** | Replace schedule-page `any` values with explicit shared types where practical. |
| 14 | Date and timezone consistency | ⚠️ **Open** | Verify import, filtering, storage, and display use the same calendar-date semantics across timezones. |
| 15 | Schedule refresh race conditions | ℹ️ **Follow-up** | Review overlapping `loadData()` calls and prevent stale responses from overwriting newer schedule data. |

## Item 3 — Completed import extensions

- ✅ Actual server-confirmed progress.
- ✅ Dynamic batching based on total row count.
- ✅ Separate created and updated totals.
- ✅ Existing schedules update through Prisma `upsert` instead of failing on the unique `employee/date` constraint.
- ✅ Employee-code matching trims input and supports case-insensitive values.
- ✅ Unknown employee codes are blocked with row-specific details.
- ✅ Duplicate employee/date rows in one file are rejected before database writes.
- ✅ Partial imports and re-uploads behave correctly.
- ✅ Import errors are concise and do not expose Prisma stack traces.

## Verification status

- ✅ Items 1–3 and 6–8 are complete.
- 🔍 Items 4–5 are implemented; real-data/browser verification remains.
- ⚠️ Items 9–10, 12, and 14 require future technical work.
- ℹ️ Items 11, 13, and 15 are follow-up improvements.

## Extended audit backlog

The following items were identified in a second technical review outside the original eight-point audit:

- **Item 9 — Import replacement safety:** import and bulk operations now block today/past dates; manual protected-date changes require two confirmations. Future work should decide whether replacement becomes upsert-only.
s- **Item 10 — Import atomicity:** prevent partially applied replacement imports when a later batch fails.
- **Item 11 — Import database efficiency:** reduce avoidable per-row database queries without introducing unsafe parallel writes.
- **Item 12 — Server-action error reporting:** distinguish database failures from legitimate empty results.
- **Item 13 — Schedule type safety:** reduce `any` usage in schedule-related components and actions.
- **Item 14 — Date and timezone consistency:** verify calendar-date behavior across import, filtering, storage, and display.
- **Item 15 — Schedule refresh race conditions:** prevent stale `loadData()` responses from overwriting newer results.

No extended-backlog item has been implemented yet.

## Change history

- Extended technical review — added Issues 9–15 for replacement safety, atomicity, query efficiency, error reporting, type safety, timezone consistency, and refresh race conditions.

- Import safety decision — all dynamic batches remain sequential; no parallel requests are sent, preventing overlapping database writes and preserving ordered initialization/finalization.
- Pagination fix — schedule search and past-date filter changes reset pagination to page 1, with safe clamping when result counts shrink.
- Loading skeleton fix — replaced plain loading text with layout-matched shift and assignment skeletons, including an accessible loading status; verified working in the Schedule page.
- Delete confirmation fix — replaced the native browser confirmation with an accessible Alert Dialog that identifies the schedule before deletion.
- Pagination footer fix — empty filtered results now show `Showing 0 of 0 schedules`, while pagination controls remain hidden; verified by the user.
- Delete dialog and footer verification — user confirmed both Issue 7 and Issue 8 behavior in the browser.

- `4fa8ac3` — marked Schedule audit Issue 3 complete.
- `3f3ff7a` — showed employee details in the import error notification.
- `38abba5` — prevented duplicate schedule rows and labeled import errors.
- `b008142` — recorded runtime import verification results.
- `6c29dcc` — verified schedule server-action authentication.
- `d5863df` — fixed schedule API authorization responses.
- `16e9ec3` — handled duplicate schedules during batch import.
- `ba36dcb` — reported created and updated schedule imports.
- `ac5f439` — added dynamic schedule import batch sizes.
- `cf2e4d4` — resolved project TypeScript errors before continuing the audit.

## Documentation rules

- Keep project documentation under `docs/`.
- Do not add feature or audit documentation to the project root.
- Update this checklist whenever an item is implemented or verified.
- Use this document as the audit source of truth instead of relying on chat history.
