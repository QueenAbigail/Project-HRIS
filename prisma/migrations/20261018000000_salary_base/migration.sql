-- New table holding the regional minimum wage (UMK/UMP) per site, effective-dated.
-- salary_rules is verified empty; the only change to it is a nullable link column, so no data is touched.
CREATE TABLE IF NOT EXISTS "salary_base" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "minimumWage" DECIMAL(15,2) NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_base_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "salary_base_siteId_effectiveDate_key" ON "salary_base"("siteId", "effectiveDate");
CREATE INDEX IF NOT EXISTS "salary_base_siteId_idx" ON "salary_base"("siteId");

ALTER TABLE "salary_base" ADD CONSTRAINT "salary_base_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "salary_rules" ADD COLUMN IF NOT EXISTS "salaryBaseId" TEXT;
CREATE INDEX IF NOT EXISTS "salary_rules_salaryBaseId_idx" ON "salary_rules"("salaryBaseId");

ALTER TABLE "salary_rules" ADD CONSTRAINT "salary_rules_salaryBaseId_fkey" FOREIGN KEY ("salaryBaseId") REFERENCES "salary_base"("id") ON DELETE SET NULL ON UPDATE CASCADE;
