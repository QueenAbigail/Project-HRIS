-- Add per-hour tiers to overtime rules so each overtime type can hold one multiplier per hour.
-- overtime_rules was verified empty and has no inbound foreign keys; no other table is touched.
ALTER TABLE "overtime_rules" ADD COLUMN IF NOT EXISTS "hour" INTEGER NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX IF NOT EXISTS "overtime_rules_type_hour_key" ON "overtime_rules"("type", "hour");
