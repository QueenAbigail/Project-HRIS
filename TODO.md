# Task: Add certifications and ktaExpiry to Prisma Employee Fetch Query

## Steps:
- [x] Step 1: Edit app/dashboard/employees/page.tsx to update prisma.user.findMany with explicit select including certifications: true, ktaExpiry: true, and all mapped fields
- [ ] Step 2: Run `npx prisma generate` to regenerate Prisma client after schema changes  
- [ ] Step 3: Test /dashboard/employees page loads correctly and profile sheet receives new fields
- [ ] Step 4: Verify no breaking changes in EmployeesTable or mapping

Current progress: Step 1 complete. TypeScript errors expected to resolve after prisma generate (nested site typing).

