# Add Certification Dropdown to Add Employee Form - ✅ COMPLETE

## Completed Steps:
- [x] Step 1: formData state updated (initial + reset)
- [x] Step 2: Certification Select added to Step 3 JSX (between NPWP & KTA Number)
- [x] Step 3: handleSubmit transforms `certification` → `certifications: [...] || []`

**Changes in**: `components/employees/add-employee-dialog.tsx`

## Testing:
1. Navigate to Employees → Add Employee → Step 3
2. Select Certification (e.g. "Gada Madya"), fill required, submit
3. Verify browser Network tab: payload has `"certifications": ["Gada Madya"]`
4. Check DB: `npx prisma studio` → users → certifications array

No migrations/installs needed. Ready to use.


