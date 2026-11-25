-- Purely additive / widening schema fixes (zero data loss)
ALTER TABLE "deduction_rules" ALTER COLUMN "value" TYPE DECIMAL(15, 4);
ALTER TABLE "payroll_deductions_applied" ALTER COLUMN "baseValue" TYPE DECIMAL(15, 4);
ALTER TABLE "bulk_import_logs" ALTER COLUMN "importedBy" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "payroll_earnings_scope_name_effective_unique"
  ON "payroll_earnings" (
    "companyId",
    COALESCE("siteId", ''),
    COALESCE("positionId", ''),
    LOWER(TRIM("name")),
    "effectiveFrom"
  );
