-- Drop old pattern-based schedule system tables
-- Migration: Remove EmployeePatternAssignment and SchedulePattern
-- These are replaced by the new manual assignment system (schedules table)

-- Drop constraints first
ALTER TABLE "bulk_import_records" DROP CONSTRAINT IF EXISTS "bulk_import_records_assignmentId_fkey";
ALTER TABLE "employee_pattern_assignments" DROP CONSTRAINT IF EXISTS "employee_pattern_assignments_userId_fkey";
ALTER TABLE "employee_pattern_assignments" DROP CONSTRAINT IF EXISTS "employee_pattern_assignments_patternId_fkey";
ALTER TABLE "employee_pattern_assignments" DROP CONSTRAINT IF EXISTS "employee_pattern_assignments_siteId_fkey";
ALTER TABLE "schedule_patterns" DROP CONSTRAINT IF EXISTS "schedule_patterns_shiftId_fkey";

-- Drop tables
DROP TABLE IF EXISTS "employee_pattern_assignments" CASCADE;
DROP TABLE IF EXISTS "schedule_patterns" CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "PatternType" CASCADE;
DROP TYPE IF EXISTS "ShiftTypePattern" CASCADE;
