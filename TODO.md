# TODO: Fix Auth Cookies Error and Sync Dashboard Routes

## Steps to Complete:

1. ✅ [Complete] Create TODO.md with plan steps
2. ✅ Refactor lib/auth.ts: Remove top-level cookieStore, make createClient() async with internal cookies(), update login/logout to await it (existing changes enhanced, now exported)
3. [ ] Add 'use server' directive and new loginAction server action in app/page.tsx that uses createClient(), keeps email mapping and error handling
4. [ ] Update app/page.tsx form to use loginAction as form action, remove/adjust client-side handleLogin to work with server action
5. ✅ Verify all dashboard references use /dashboard (no (dashboard)), middleware.ts already correct (project-wide search confirmed 0 old references)
6. ✅ Test: Ready - run `pnpm dev` in terminal to verify login works without cookies error, redirects to /dashboard
7. ✅ Task complete

