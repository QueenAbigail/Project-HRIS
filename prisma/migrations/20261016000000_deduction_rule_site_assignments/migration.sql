-- Split reusable deduction definitions from site assignments.
-- deduction_rules and payroll_deductions_applied were verified empty before this migration.
CREATE TABLE "deduction_rule_site_assignments" (
  "id" TEXT NOT NULL,
  "deductionRuleId" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "deduction_rule_site_assignments_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "deduction_rules" DROP COLUMN "positionId",
  DROP COLUMN "siteId",
  DROP COLUMN "isApplicableToAll",
  DROP COLUMN "riskLevel",
  DROP COLUMN "effectiveDate",
  DROP COLUMN "endDate";

CREATE UNIQUE INDEX "deduction_rules_name_type_key" ON "deduction_rules"("name", "type");
CREATE UNIQUE INDEX "deduction_rule_site_assignments_deductionRuleId_siteId_key" ON "deduction_rule_site_assignments"("deductionRuleId", "siteId");
CREATE INDEX "deduction_rule_site_assignments_siteId_idx" ON "deduction_rule_site_assignments"("siteId");

ALTER TABLE "deduction_rule_site_assignments" ADD CONSTRAINT "deduction_rule_site_assignments_deductionRuleId_fkey" FOREIGN KEY ("deductionRuleId") REFERENCES "deduction_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deduction_rule_site_assignments" ADD CONSTRAINT "deduction_rule_site_assignments_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payroll_deductions_applied" ADD CONSTRAINT "payroll_deductions_applied_deductionRuleId_fkey" FOREIGN KEY ("deductionRuleId") REFERENCES "deduction_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
