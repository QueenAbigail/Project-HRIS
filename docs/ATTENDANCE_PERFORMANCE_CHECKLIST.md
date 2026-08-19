# Attendance Performance Investigation Checklist

This checklist records possible causes of slow Attendance page loading. Investigate these separately before making further optimizations.

## 1. Measure request timings

- Measure `/api/attendance` duration.
- Measure `/api/attendance/stats` duration.
- Measure authentication/session requests.
- Measure site and department lookup requests.
- Compare server response time with browser hydration time.
- Add database query timing only in development or server logs.

## 2. Inspect Attendance stats

- Check the cost of the attendance query.
- Check the BKO assignment count query.
- Check scheduled employee queries.
- Check approved leave queries.
- Confirm leave and schedule processing is not doing unnecessary work.
- Check whether stats can be combined into fewer database operations.

## 3. Check database indexes

Review indexes for the fields used by Attendance filters and joins:

- Attendance date.
- Attendance location/site.
- Attendance employee/user.
- Schedule date.
- Schedule employee.
- Leave status.
- Leave start and end dates.
- BKO assignment status.
- BKO leave and substitute relations.

Verify indexes with the actual database query plan before adding new ones.

## 4. Check Attendance table queries

- Compare `count()` duration with `findMany()` duration.
- Confirm pagination uses a bounded `take` value.
- Check whether joined employee, shift, location, and company data is heavier than necessary.
- Select only fields required by the table and details modal.
- Keep deterministic ordering for stable pagination.

## 5. Check client-side request waterfalls

- Confirm Attendance stats, table, header, site list, and department requests run in parallel where possible.
- Check whether one request waits for another unnecessarily.
- Check whether the layout or auth request blocks the page shell.
- Check whether client components wait for hydration before showing content.

## 6. Check prefetch behavior

- Confirm the next page is prefetched only after the current page succeeds.
- Confirm the prefetched response is cached and reused when Next is clicked.
- Avoid prefetching multiple pages unnecessarily.
- Clear prefetched data when date, site, department, or page-size filters change.

## 7. Check rendering and bundle size

- Inspect the Attendance JavaScript bundle size.
- Check whether dialogs, calendars, charts, and modals are loaded eagerly.
- Lazy-load heavy components that are not visible on initial render.
- Check for unnecessary rerenders when filters or refresh state changes.
- Use skeletons so the page shell appears before all data finishes loading.

## 8. Check development-preview overhead

- Compare v0 preview timing with a production build/deployment.
- Account for Next.js compilation and hot-module-reload overhead.
- Check whether the first request is slower than subsequent requests.
- Test with browser cache disabled and enabled.

## 9. Check database connection overhead

- Measure connection acquisition time.
- Confirm serverless database pooling is configured correctly.
- Check for cold-start or scale-to-zero latency.
- Confirm queries are not opening unnecessary database clients.

## 10. Preserve existing behavior

Any future performance change must preserve:

- `Asia/Jakarta` business date boundaries.
- Indonesian display format: `DD-MM-YYYY`.
- API/database format: `YYYY-MM-DD`.
- Site and department filters.
- `SUPER_ADMIN` and `HR_ADMIN` unrestricted access.
- Company scope for restricted roles.
- BKO status and date-range behavior.
- Server-side pagination.
- Attendance status resolution.
- User-facing error states without raw error details.

## Recommended investigation order

1. Measure API and browser timings.
2. Profile `/api/attendance/stats`.
3. Profile `/api/attendance` count and page queries.
4. Inspect database indexes and query plans.
5. Check request waterfalls and hydration.
6. Inspect bundle size and lazy-loading opportunities.
7. Compare preview performance with production.
8. Apply only changes supported by measurements.
