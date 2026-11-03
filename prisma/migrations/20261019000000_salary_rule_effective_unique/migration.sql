-- A position at a site can have several rules over time (current + scheduled), so uniqueness includes the effective date.
DROP INDEX IF EXISTS "salary_rules_positionId_siteId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "salary_rules_positionId_siteId_effectiveDate_key" ON "salary_rules"("positionId", "siteId", "effectiveDate");
