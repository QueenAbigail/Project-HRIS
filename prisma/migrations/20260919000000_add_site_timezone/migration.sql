-- Add the site as the single source of truth for WIB/WITA/WIT.
ALTER TABLE "sites" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'WIB';

-- Preserve existing configuration when a site already has attendance locations.
UPDATE "sites" s
SET "timezone" = source."timezone"
FROM (
  SELECT DISTINCT ON ("siteId") "siteId", "timezone"
  FROM "attendance_locations"
  WHERE "timezone" IN ('WIB', 'WITA', 'WIT')
  ORDER BY "siteId", "isActive" DESC, "createdAt" ASC
) source
WHERE s."id" = source."siteId";
