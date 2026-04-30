# Role-Based Password Field Implementation
## Approved Plan Steps

- [x] **Step 1**: Create this TODO.md
- [x] **Step 2**: Update imports in employee-edit-dialog.tsx (add Eye, EyeOff)
- [x] **Step 3**: Update interfaces (add password to EmployeeEditFormData, currentUserRole to EmployeeEditDialogProps)
- [x] **Step 4**: Add showPassword state ✅ (syntax fixed)
- [x] **Step 5**: Add hasPasswordAccess role logic
- [x] **Step 6**: Replace Email with Password field UI in Tab 1
- [x] **Step 7**: Update useEffect to init password
- [x] **Step 8**: Identify and update dependent caller files (add currentUserRole prop) ✅ (employees-table.tsx)
- [x] **Step 9**: Test implementation (SUPER_ADMIN, HR_ADMIN, other roles) - Run `pnpm dev`, open employees table, edit dialog with role SUPER_ADMIN (toggle works), other roles (disabled)
- [ ] **Step 10**: Mark complete
- [ ] **Step 10**: Mark complete

**Notes**: 
- Uses shadcn Button for toggle (ghost variant).
- Disabled field shows masked placeholder.
- Follows .blackboxrules (shadcn, Tailwind vars, lucide icons).

