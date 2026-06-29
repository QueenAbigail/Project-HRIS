-- Add GPS columns for check-out location to Attendance table
ALTER TABLE "attendances" ADD COLUMN "gpsLatPulang" DOUBLE PRECISION;
ALTER TABLE "attendances" ADD COLUMN "gpsLngPulang" DOUBLE PRECISION;
