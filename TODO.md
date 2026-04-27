# Add Employee Dialog Rewrite

## Objective
Completely rewrite `components/employees/add-employee-dialog.tsx` into a 4-step wizard based on `schema.prisma` while preserving the existing Import tab functionality.

## Steps
1. [x] Read existing files (`schema.prisma`, `add-employee-dialog.tsx`, `employees-header.tsx`, `employees-table.tsx`, `constants.ts`, `client-system.ts`, `switch.tsx`)
2. [x] Analyze dependencies and props
3. [ ] Rewrite `components/employees/add-employee-dialog.tsx` with:
   - 4-step wizard in Manual tab
   - State for `step`, `showPassword`, `errorMsg`, `formData`
   - Dynamic per-step validation with Indonesian error messages
   - `fetchUserRole` to conditionally hide SUPER_ADMIN
   - Hardcoded `locations`/`departments`/`positions` arrays for dropdowns
   - Proper dialog sizing (`sm:max-w-[700px] min-h-[500px]`)
   - All navigation buttons with `type="button"`
   - Updated `NewEmployee` interface
4. [ ] Verify the file compiles (type-check / lint)

