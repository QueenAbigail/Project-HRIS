# Pro Maxima Rajawali HRIS - Payroll System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Payroll Calculation Logic](#payroll-calculation-logic)
4. [Workflow & Approval Process](#workflow--approval-process)
5. [Data Entry Methods](#data-entry-methods)
6. [Examples & Test Cases](#examples--test-cases)

---

## System Overview

The Pro Maxima Rajawali payroll system is a comprehensive, multi-stage calculation engine designed to:
- Track employee salaries, overtime, bonuses, and deductions
- Calculate accurate net pay based on position-based rules
- Maintain permanent audit trail of all calculations
- Require multi-level approval before PDF generation
- Support 100-200+ employees per payroll period

### Key Principles
- **Position-Based Deductions**: All employees in same position/site pay same deduction rates
- **Individual Tracking**: Each overtime, bonus, deduction tracked separately for audit
- **Permanent History**: All calculations kept forever (can be exported/archived manually)
- **No Automatic Overtime**: Overtime only entered manually (backup duty, national holiday, weekly overages)
- **Manual Bonuses**: No system-triggered bonuses; all entered manually by HRD

---

## Database Schema

### Table 1: `salary_rules`
**Purpose**: Store base salary and allowance configuration by position and site

```sql
CREATE TABLE salary_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  positionId UUID NOT NULL,
  siteId UUID NOT NULL,
  baseSalary DECIMAL(15,2) NOT NULL,           -- Monthly base salary
  positionAllowance DECIMAL(15,2) NOT NULL,    -- Risk/management allowance
  minimumWage DECIMAL(15,2) NOT NULL,          -- Government minimum wage baseline
  effectiveDate DATE NOT NULL,
  endDate DATE,                                 -- Optional expiration
  status VARCHAR(50) DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (positionId) REFERENCES positions(id),
  FOREIGN KEY (siteId) REFERENCES sites(id)
);
```

**Example Data**:
```
Position: Security Guard, Site: Jakarta
  baseSalary: 4,000,000
  positionAllowance: 500,000 (risk allowance)
  minimumWage: 4,000,000
```

---

### Table 2: `overtime_rules`
**Purpose**: Define overtime types and multiplier rates

```sql
CREATE TABLE overtime_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL UNIQUE,           -- 'backup_duty', 'national_holiday', 'weekly_overtime'
  description VARCHAR(500),
  multiplier DECIMAL(4,2) NOT NULL,            -- 1.5, 2.0, 2.5, etc.
  maxHoursPerMonth INTEGER,                    -- Optional: enforce max hours (e.g., max 20 holiday OT/month)
  status VARCHAR(50) DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

**Example Data**:
```
Type: backup_duty
  multiplier: 1.5x

Type: national_holiday
  multiplier: 2.0x
  maxHoursPerMonth: 20

Type: weekly_overtime
  multiplier: 1.75x
```

---

### Table 3: `deduction_rules`
**Purpose**: Define deduction rates by position and site

```sql
CREATE TABLE deduction_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  positionId UUID NOT NULL,
  siteId UUID NOT NULL,
  name VARCHAR(200) NOT NULL,                  -- 'Income Tax', 'Health Insurance', etc.
  type VARCHAR(50) NOT NULL,                   -- 'tax', 'insurance', 'health', 'pension', 'special'
  deductionType VARCHAR(50) NOT NULL,          -- 'percentage' or 'fixed_amount'
  value DECIMAL(10,4) NOT NULL,                -- % or fixed amount
  riskLevel VARCHAR(50),                       -- 'low', 'medium', 'high' (for health insurance variation)
  effectiveDate DATE NOT NULL,
  endDate DATE,
  status VARCHAR(50) DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (positionId) REFERENCES positions(id),
  FOREIGN KEY (siteId) REFERENCES sites(id)
);
```

**Example Data**:
```
Security Guard @ Jakarta:
  Income Tax: 5% (percentage)
  Health Insurance: 2.5% (percentage, medium risk)
  Pension: 3% (percentage)
  Company Debt (special): 250,000 (fixed_amount) [for specific employee if needed]
```

---

### Table 4: `payroll_periods`
**Purpose**: Define payroll periods and track approval workflow

```sql
CREATE TABLE payroll_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL UNIQUE,                  -- First day of month (2026-07-01)
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',          -- 'draft', 'locked', 'approved', 'finalized', 'paid'
  approvedBy UUID,                             -- FK to users (admin/HRD)
  approvedAt TIMESTAMP,
  pdfGeneratedAt TIMESTAMP,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (approvedBy) REFERENCES users(id)
);
```

**Status Workflow**:
```
draft → locked → approved → finalized → paid
 |       |        |          |         |
 HRD     HRD      Admin      System    Admin
 enters  locks    approves   generates marks
 data    for PDF  for PDF    PDF       as paid
         safety
```

---

### Table 5: `payroll_calculations` (MAIN)
**Purpose**: Store final calculated payroll per employee per month

```sql
CREATE TABLE payroll_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  payrollPeriodId UUID NOT NULL,
  
  -- Salary Components
  baseSalary DECIMAL(15,2) NOT NULL,
  positionAllowance DECIMAL(15,2) NOT NULL,
  overtimeEarnings DECIMAL(15,2) DEFAULT 0,
  bonusAmount DECIMAL(15,2) DEFAULT 0,
  
  -- Gross Calculation
  grossSalary DECIMAL(15,2) NOT NULL,          -- base + allowance + OT + bonus
  
  -- Deductions
  totalDeductions DECIMAL(15,2) NOT NULL,      -- Sum of all deductions
  
  -- Net Pay
  netPay DECIMAL(15,2) NOT NULL,               -- grossSalary - totalDeductions
  
  -- Status & Adjustments
  status VARCHAR(50) DEFAULT 'calculated',     -- 'calculated', 'approved_for_payment', 'paid'
  adjustmentAmount DECIMAL(15,2),              -- Manual adjustment by admin
  adjustmentReason TEXT,
  
  -- Timestamps
  calculatedAt TIMESTAMP DEFAULT NOW(),
  approvedAt TIMESTAMP,
  paidAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (payrollPeriodId) REFERENCES payroll_periods(id)
);
```

---

### Table 6: `payroll_overtime_hours`
**Purpose**: Track individual overtime incidents per employee per month

```sql
CREATE TABLE payroll_overtime_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  payrollPeriodId UUID NOT NULL,
  overtimeRuleId UUID NOT NULL,
  
  -- Tracking
  date DATE NOT NULL,                          -- When overtime occurred
  hours DECIMAL(10,2) NOT NULL,                -- Number of overtime hours
  description TEXT,                            -- e.g., "Backup duty 2026-07-15"
  
  -- Calculation
  hourlyRate DECIMAL(15,2) NOT NULL,           -- Base hourly rate (baseSalary / 22 / 8)
  multiplier DECIMAL(4,2) NOT NULL,            -- From overtime rule
  totalAmount DECIMAL(15,2) NOT NULL,          -- hours × hourlyRate × multiplier
  
  -- Approval
  approvedBy UUID,
  approvedAt TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',        -- 'pending', 'approved', 'rejected'
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (payrollPeriodId) REFERENCES payroll_periods(id),
  FOREIGN KEY (overtimeRuleId) REFERENCES overtime_rules(id),
  FOREIGN KEY (approvedBy) REFERENCES users(id)
);
```

---

### Table 7: `payroll_deductions_applied`
**Purpose**: Track actual deductions per employee per month

```sql
CREATE TABLE payroll_deductions_applied (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  payrollPeriodId UUID NOT NULL,
  deductionRuleId UUID NOT NULL,
  
  -- Reference
  baseSalary DECIMAL(15,2) NOT NULL,           -- Used for % calculations
  deductionType VARCHAR(50) NOT NULL,          -- 'percentage' or 'fixed_amount'
  deductionName VARCHAR(200) NOT NULL,         -- e.g., "Income Tax"
  
  -- Calculation
  baseValue DECIMAL(10,4) NOT NULL,            -- % or fixed amount from rule
  calculatedAmount DECIMAL(15,2) NOT NULL,     -- Actual deduction applied
  
  specialNotes TEXT,                           -- e.g., "Company debt payment"
  createdAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (payrollPeriodId) REFERENCES payroll_periods(id),
  FOREIGN KEY (deductionRuleId) REFERENCES deduction_rules(id)
);
```

---

### Table 8: `payroll_bonuses`
**Purpose**: Track manual bonus allocations

```sql
CREATE TABLE payroll_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL,
  payrollPeriodId UUID NOT NULL,
  
  -- Bonus Details
  type VARCHAR(50) NOT NULL,                   -- 'performance', 'attendance', 'special', 'manual'
  amount DECIMAL(15,2) NOT NULL,
  reason TEXT NOT NULL,
  
  -- Approval
  status VARCHAR(50) DEFAULT 'pending_approval', -- 'pending_approval', 'approved', 'rejected', 'included_in_payroll'
  approvedBy UUID,
  approvedAt TIMESTAMP,
  notes TEXT,
  
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (payrollPeriodId) REFERENCES payroll_periods(id),
  FOREIGN KEY (approvedBy) REFERENCES users(id)
);
```

---

## Payroll Calculation Logic

### Step-by-Step Calculation Process

#### **Step 1: Fetch Base Salary & Allowance**
```
For Employee: John Doe (Security Guard, Jakarta Site)
Look up salary_rules WHERE positionId = 'security_guard' AND siteId = 'jakarta'

Result:
  baseSalary = 4,000,000
  positionAllowance = 500,000
  
grossSalary_base = 4,000,000 + 500,000 = 4,500,000
```

---

#### **Step 2: Calculate Hourly Rate**
```
Used for overtime calculations

Assumptions:
  - 1 month = 22 working days
  - 1 day = 8 working hours
  - Total working hours per month = 22 × 8 = 176 hours

Formula:
  hourlyRate = baseSalary / 176
  
For John:
  hourlyRate = 4,000,000 / 176 = 22,727.27 per hour
  
Note: Position allowance NOT included in hourly rate for government compliance
```

---

#### **Step 3: Calculate Total Overtime Earnings**
```
Fetch all payroll_overtime_hours WHERE userId = john AND payrollPeriodId = july_2026

Overtime Records:
  1. Date: 2026-07-10, Type: backup_duty, Hours: 8, Multiplier: 1.5x
     Calculation: 8 × 22,727.27 × 1.5 = 272,727.24
     
  2. Date: 2026-07-25, Type: national_holiday, Hours: 4, Multiplier: 2.0x
     Calculation: 4 × 22,727.27 × 2.0 = 181,818.16
     
  3. Date: 2026-07-28, Type: weekly_overtime, Hours: 6, Multiplier: 1.75x
     Calculation: 6 × 22,727.27 × 1.75 = 238,636.39

overtimeEarnings = 272,727.24 + 181,818.16 + 238,636.39 = 693,181.79
```

---

#### **Step 4: Add Bonuses**
```
Fetch approved payroll_bonuses WHERE userId = john AND payrollPeriodId = july_2026

Bonus Records:
  1. Type: performance, Amount: 1,000,000, Status: approved
  2. Type: attendance, Amount: 500,000, Status: approved
  
bonusAmount = 1,000,000 + 500,000 = 1,500,000
```

---

#### **Step 5: Calculate Gross Salary**
```
grossSalary = baseSalary + positionAllowance + overtimeEarnings + bonusAmount
grossSalary = 4,000,000 + 500,000 + 693,181.79 + 1,500,000
grossSalary = 6,693,181.79
```

---

#### **Step 6: Apply Deductions**
```
Fetch deduction_rules WHERE positionId = 'security_guard' AND siteId = 'jakarta'

Deduction Rules:
  1. Income Tax: 5% (percentage)
     Calculation: 6,693,181.79 × 5% = 334,659.09
     
  2. Health Insurance: 2.5% (percentage, medium risk)
     Calculation: 6,693,181.79 × 2.5% = 167,329.54
     
  3. Pension: 3% (percentage)
     Calculation: 6,693,181.79 × 3% = 200,795.45
     
  4. Special Deduction (Company Debt): 250,000 (fixed)
     Calculation: 250,000 (flat)

totalDeductions = 334,659.09 + 167,329.54 + 200,795.45 + 250,000
totalDeductions = 952,784.08

Each deduction stored in payroll_deductions_applied table for audit trail
```

---

#### **Step 7: Calculate Net Pay**
```
netPay = grossSalary - totalDeductions
netPay = 6,693,181.79 - 952,784.08
netPay = 5,740,397.71
```

---

#### **Step 8: Apply Manual Adjustments (Optional)**
```
Admin may add adjustments for:
  - Loan deductions
  - Prior month corrections
  - Extraordinary deductions
  
If adjustmentAmount = 200,000:
  netPay = 5,740,397.71 - 200,000 = 5,540,397.71
```

---

### Complete Calculation Summary

**For John Doe - July 2026 Payroll**:

| Component | Amount |
|-----------|--------|
| **Base Salary** | 4,000,000 |
| **Position Allowance** | 500,000 |
| **Overtime Earnings** | 693,181.79 |
| **Bonus** | 1,500,000 |
| **GROSS SALARY** | **6,693,181.79** |
| | |
| **Deductions:** | |
| - Income Tax (5%) | (334,659.09) |
| - Health Insurance (2.5%) | (167,329.54) |
| - Pension (3%) | (200,795.45) |
| - Company Debt (special) | (250,000) |
| **TOTAL DEDUCTIONS** | **(952,784.08)** |
| | |
| **Manual Adjustment** | (200,000) |
| **NET PAY** | **5,540,397.71** |

---

## Workflow & Approval Process

### Monthly Payroll Workflow

```
START: New Payroll Period Created
│
├─ STATUS: DRAFT
│  │
│  ├─ HRD enters overtime data
│  │  └─ Bulk entry form with previous month template
│  │  └─ Records stored in payroll_overtime_hours (status: pending)
│  │
│  ├─ HRD enters manual bonuses
│  │  └─ Records stored in payroll_bonuses (status: pending_approval)
│  │
│  ├─ System auto-calculates payroll
│  │  └─ Calculation logic runs (see above)
│  │  └─ Results stored in payroll_calculations (status: calculated)
│  │
│  └─ HRD reviews calculation details
│     └─ Can see breakdown by employee, overtime, deductions
│     └─ Can make adjustments if needed
│
├─ STATUS: LOCKED
│  └─ HRD clicks "Lock Period" to prevent accidental changes
│  └─ No more edits allowed to overtime, bonuses, or calculations
│
├─ STATUS: APPROVED
│  └─ Admin/HRD approves payroll (payroll_periods.approvedBy, approvedAt)
│  └─ Triggers PDF generation (integrated with existing system)
│  └─ PDFs stored in payrolls table (for backward compatibility)
│
├─ STATUS: FINALIZED
│  └─ System marks PDFs as finalized
│  └─ Ready for payment
│
└─ STATUS: PAID
   └─ Admin confirms payment processed
   └─ Payroll period closed
   └─ Historical record maintained forever
```

### Approval Authority

| Step | Who | Permissions |
|------|-----|-----------|
| Data Entry | HRD | Can enter overtime, bonuses; can edit while in "draft" |
| Calculation Review | HRD | Can see calculations, make manual adjustments |
| Period Lock | HRD | Can lock to prevent accidental changes |
| Final Approval | Admin/HRD | Can approve for PDF generation |
| PDF Generation | System | Automatic after approval |
| Payment Confirmation | Admin | Marks as paid |

---

## Data Entry Methods

### Method 1: Visual Bulk Entry Form
**For**: Overtime hours entry

**Workflow**:
```
1. Open July 2026 payroll period
2. Click "Load Previous Month Template"
3. System loads June 2026 overtime data
4. Visual table appears:
   
   | Employee    | Backup Hrs | Holiday Hrs | Weekly OT Hrs |
   |-------------|-----------|------------|--------------|
   | John Doe    | 8         | 4          | 6            |
   | Maria Smith | 0         | 8          | 12           |
   | ...         | ...       | ...        | ...          |

5. HRD can:
   - Edit inline
   - Add new employees
   - Remove rows
   - Export to CSV
   - Import CSV updates

6. Click "Bulk Approve All"
7. All overtime records saved and approved
```

### Method 2: CSV Import/Export
**For**: Bulk updates or offline editing

**CSV Format**:
```
userId,backup_hours,holiday_hours,weekly_ot_hours,description
emp-001,8,4,6,Monthly duties
emp-002,0,8,12,Coverage duties
emp-003,6,0,8,Regular schedule
```

**Workflow**:
```
1. Export current month data as CSV
2. Open in Excel/Sheets
3. Make bulk changes
4. Re-import to system
5. System validates and merges data
```

### Method 3: Manual Bonus Entry
**For**: Individual bonus allocation

**Workflow**:
```
1. Open July 2026 payroll period
2. Go to "Bonuses" section
3. Click "Add Bonus"
4. Fill form:
   - Employee: [dropdown]
   - Type: [performance/attendance/special/manual]
   - Amount: 1,000,000
   - Reason: "Excellent client service this month"
   - Status: pending_approval
5. Submit
6. Admin approves or rejects
7. If approved, auto-included in next calculation
```

---

## Examples & Test Cases

### Test Case 1: Standard Employee (No Overtime, No Special Deductions)

**Employee**: Maria Smith  
**Position**: Office Staff  
**Site**: Jakarta  
**Payroll Period**: July 2026

**Salary Rules**:
- baseSalary: 3,500,000
- positionAllowance: 0
- hourlyRate: 3,500,000 / 176 = 19,886.36/hr

**Overtime**: None (0 hours)

**Deduction Rules**:
- Income Tax: 5%
- Health Insurance: 2%
- Pension: 3%

**Bonuses**: 500,000 (approved)

**Calculation**:
```
Base Salary: 3,500,000
Position Allowance: 0
Overtime: 0
Bonus: 500,000
─────────────────
GROSS: 4,000,000

Deductions:
  Tax (5%): 200,000
  Health (2%): 80,000
  Pension (3%): 120,000
  Total: 400,000
─────────────────
NET PAY: 3,600,000
```

---

### Test Case 2: Security Guard with Mixed Overtime

**Employee**: John Doe  
**Position**: Security Guard  
**Site**: Jakarta  
**Payroll Period**: July 2026

**Salary Rules**:
- baseSalary: 4,000,000
- positionAllowance: 500,000
- hourlyRate: 4,000,000 / 176 = 22,727.27/hr

**Overtime**:
- Backup duty: 8 hrs × 22,727.27 × 1.5 = 272,727.24
- National holiday: 4 hrs × 22,727.27 × 2.0 = 181,818.16
- Total OT: 693,181.79

**Deduction Rules**:
- Income Tax: 5%
- Health Insurance: 2.5% (medium risk)
- Pension: 3%
- Company Debt: 250,000 (special)

**Bonuses**: 1,000,000 (approved)

**Calculation**:
```
Base Salary: 4,000,000
Position Allowance: 500,000
Overtime: 693,181.79
Bonus: 1,000,000
─────────────────
GROSS: 6,193,181.79

Deductions:
  Tax (5%): 309,659.09
  Health (2.5%): 154,829.54
  Pension (3%): 185,795.45
  Debt (special): 250,000
  Total: 900,284.08
─────────────────
NET PAY: 5,292,897.71
```

---

### Test Case 3: Minimum Wage Employee with Partial Month

**Employee**: New Hire (started mid-July)  
**Position**: Junior Staff  
**Site**: Medan  
**Payroll Period**: July 2026 (started July 15)

**Salary Rules**:
- baseSalary: 4,000,000 (prorated for 11 days: 4,000,000 × 11/22 = 2,000,000)
- positionAllowance: 0

**Overtime**: None

**Deduction Rules**: Standard

**Bonuses**: None

**Calculation**:
```
Base Salary (prorated): 2,000,000
Position Allowance: 0
Overtime: 0
Bonus: 0
─────────────────
GROSS: 2,000,000

Deductions (calculated on gross):
  Tax (5%): 100,000
  Health (2%): 40,000
  Pension (3%): 60,000
  Total: 200,000
─────────────────
NET PAY: 1,800,000
```

---

### Test Case 4: Multiple Bonus Types

**Employee**: High Performer  
**Position**: Team Lead  
**Site**: Jakarta  
**Payroll Period**: July 2026

**Base Salary Components**:
- baseSalary: 5,000,000
- positionAllowance: 1,000,000

**Overtime**:
- Regular: 4 hrs × 26,136.36 × 1.5 = 156,818.16

**Bonuses**:
- Performance Bonus: 2,000,000 (approved)
- Attendance Bonus: 1,000,000 (approved)
- Special Incentive: 1,500,000 (approved)
- Total Bonuses: 4,500,000

**Deductions**: Standard 10.5% (5% + 2.5% + 3%)

**Calculation**:
```
Base Salary: 5,000,000
Position Allowance: 1,000,000
Overtime: 156,818.16
Bonuses: 4,500,000
─────────────────
GROSS: 10,656,818.16

Deductions (10.5%): 1,118,965.90
─────────────────
NET PAY: 9,537,852.26
```

---

## Verification Checklist for HRD/Finance Team

Use this checklist to verify the system calculations are correct:

### Before Go-Live

- [ ] Salary rules match employee contracts and position setup
- [ ] Overtime multipliers align with government regulations
  - [ ] Regular overtime: 1.5x base hourly rate
  - [ ] National holiday: 2.0x base hourly rate
  - [ ] Weekly overtime: 1.75x base hourly rate (adjust if needed)
- [ ] Deduction percentages:
  - [ ] Income tax rates correct for Indonesia (5%, or your standard)
  - [ ] Health insurance rates: 2-2.5% (verify your rate)
  - [ ] Pension contribution: 3% (verify your company policy)
- [ ] Position allowances match your established rates
- [ ] Hourly rate calculation: baseSalary / 176 is correct (22 working days × 8 hours)

### Monthly Verification Process

1. **Before Lock**:
   - [ ] Review all overtime entries for accuracy
   - [ ] Verify bonus amounts and approvals
   - [ ] Spot-check 2-3 employee calculations manually
   
2. **Before Final Approval**:
   - [ ] Gross salary looks reasonable
   - [ ] Total deductions not exceeding 20% of gross
   - [ ] No negative net pay (flag as error)
   - [ ] All adjustments documented with reason

3. **After PDF Generation**:
   - [ ] Export payroll report
   - [ ] Reconcile total payroll cost vs budget
   - [ ] Check for duplicates or missing employees
   - [ ] Verify PDF format is correct for bank transfer

---

## FAQ

**Q: What if an employee's salary changes mid-month?**  
A: Create a new salary_rules record with the new effectiveDate. The system will use the most recent active rule for that employee.

**Q: Can we override deductions for specific employees?**  
A: In Phase 1, deductions are position-based. If you need individual overrides, we'll add a `payroll_deduction_overrides` table in Phase 2.

**Q: What if overtime data changes after approval?**  
A: Period locking prevents changes after approval. You'd need to create a new "Adjustment" or revert to draft status (manual process).

**Q: How do we handle payroll corrections (e.g., overpayment from last month)?**  
A: Use the adjustmentAmount field in payroll_calculations with reason documented.

**Q: Can we export calculation history for audit?**  
A: Yes, all data is permanent. You can query payroll_calculations for any past period.

---

## Document Version

- **Version**: 1.0
- **Date**: July 2026
- **Created By**: v0 AI
- **Review Status**: Pending HRD/Finance Approval
- **Last Updated**: [To be filled on implementation]

---

**Next Step**: Once HRD/Finance team reviews and approves this calculation logic, proceed to implementation of all 8 database tables and API endpoints.
