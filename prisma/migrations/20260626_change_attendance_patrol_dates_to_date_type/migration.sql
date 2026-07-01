-- AlterTable
ALTER TABLE "attendances" ALTER COLUMN "date" TYPE date USING "date"::date;

-- AlterTable
ALTER TABLE "patrols" ALTER COLUMN "date" TYPE date USING "date"::date;
