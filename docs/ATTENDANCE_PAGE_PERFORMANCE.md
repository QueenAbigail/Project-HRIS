# Attendance Page Performance Improvements

This document summarizes the changes used to make the Attendance page load faster and provide a smoother user experience.

## 1. Instant loading skeleton

Added `app/dashboard/attendance/loading.tsx` with a layout-matching loading skeleton. The page shell appears immediately while Attendance data is loading instead of showing a blank screen.

## 2. Parallel initial requests

Independent data requests, such as the current user and available sites, are started in parallel with `Promise.all()` rather than waiting for each request sequentially.

## 3. Separate rows and counts requests

Attendance data is split into focused API views:

- `view=rows` loads only records needed for the current table page.
- `view=counts` loads total records and status counts.

This avoids downloading every attendance record just to calculate totals.

## 4. Server-side pagination

The API returns only the records needed for the current page. The table uses a bounded page size of 25 records, reducing response size and browser rendering work.

## 5. SWR caching and background refresh

Attendance rows and counts use SWR for:

- Request caching.
- Request deduplication.
- Background revalidation.
- Keeping existing data visible while filters or pages change.

`keepPreviousData: true` prevents the table from flashing empty during transitions.

## 6. Targeted refreshes

After creating or editing attendance data, only the affected SWR queries are revalidated. The page does not use a full `window.location.reload()`, which avoids rebuilding the entire page.

## 7. Next-page prefetching

The next table page is prefetched when the user hovers over or focuses the Next button. When the user clicks Next, the response is often already cached.

## 8. Debounced employee search

Employee-name search waits approximately 300 milliseconds after typing stops before requesting data. This prevents a network request for every keystroke.

## 9. Server-side filtering

Filters are sent to the API as query parameters so filtering happens before pagination. Supported filters include:

- Site.
- Date range and custom dates.
- Department.
- Employee search.

## 10. Stable rendering during transitions

Existing table data remains visible while new results load. This avoids a blank table, reduces layout shift, and makes filtering feel faster.

## Reusable pattern for other pages

```text
Loading skeleton
  -> parallel initial requests
  -> server-side filtering
  -> server-side pagination
  -> separate rows and counts requests
  -> SWR caching with keepPreviousData
  -> debounced text filters
  -> next-page prefetching
  -> targeted refresh after edits
```

## Highest-impact improvements

The largest improvements came from:

1. Server-side pagination.
2. SWR caching with previous data preserved.
3. Parallel independent requests.
4. Prefetching the next page.
5. Avoiding full-page reloads after mutations.

## Behavior to preserve

When applying this pattern to another page, preserve the existing business rules, permissions, date and timezone handling, filters, pagination behavior, error states, and access scoping. Performance improvements should not move authorization or sensitive filtering to the client.

## Validation checklist

- Confirm the loading skeleton appears immediately.
- Confirm rows and counts requests do not download unnecessary records.
- Confirm changing filters does not blank the entire table.
- Confirm the Next button uses prefetched data when available.
- Confirm employee search does not request on every keystroke.
- Confirm edits refresh only affected queries.
- Confirm restricted users still receive only authorized records.
- Confirm date and timezone behavior remains unchanged.
- Run TypeScript and diff checks after changes.
  
## Related document

See [`ATTENDANCE_PERFORMANCE_CHECKLIST.md`](./ATTENDANCE_PERFORMANCE_CHECKLIST.md) for the investigation and profiling checklist.
