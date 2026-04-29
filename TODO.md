# Assignment Detail Section Implementation Plan (Approved)

Current Working Directory: c:/laragon/www/Project-HRIS

## Status: ✅ Plan Approved - Ready to Implement

**Plan Summary** (from brainstorm):
- Transform existing Assignment Details stub in `components/employees/employee-profile-sheet.tsx`
- Use EXACT same expandable pattern/animations as Contact Information (grid transition, ChevronDown rotate)
- Always visible: Location (MapPin), Department (Building), Join Date (Calendar)
- Expandable: Employment Status (FileSignature), Supervisor (UserCheck)

## Implementation Steps

### Step 1: ✅ Extend Employee Interface & Mock Data
- Add `employmentStatus?: string`, `site?: {name: string}`, `supervisor?: {name: string}` to Employee interface
- Update `employeeDetails` mock object with sample values (Permanent/Contract, Supervisor names)

### Step 2: 🔄 Add Assignment State & Structure
- Add `const [isExpandedAssignment, setIsExpandedAssignment] = useState(false)`
- **EXACT** Contact pattern:
  ```tsx
  className={`grid transition-all duration-300 ease-in-out ${isExpandedAssignment ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}
  ```
- Toggle button with `ChevronDown` rotate-180 animation

### Step 3: 🔧 Update Icons & Content
- Location: `MapPin` ✅ (keep `employee.location`)
- Department: `Briefcase` → `Building` icon
- Join Date: `Calendar` ✅
- **New expandable**:
  - Employment Status: `FileSignature` (`employee.employmentStatus`)
  - Direct Supervisor: `UserCheck` (`employee.supervisor?.name`)

### Step 4: ✅ Test & Complete
- Verify smooth expand/collapse animation matches Contact section
- Check all icons display correctly
- Data fallbacks work (`|| 'Not assigned'`)
- Mark complete with `attempt_completion`

## Progress Tracking
- [✅] Step 1: Interface/Mock Data
- [✅] Step 2: State & Expandable Container  
- [✅] Step 3: Icons/Content
- [ ] Step 4: Test & Complete

**Next Action**: Proceed with Step 1 → edit employee-profile-sheet.tsx

**Files to Edit**: `components/employees/employee-profile-sheet.tsx` (1 file)

