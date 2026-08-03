-- CreateEnum
CREATE TYPE "AnnouncementRecipientType" AS ENUM ('ALL_EMPLOYEES', 'SITE_WIDE', 'DEPARTMENT_SPECIFIC');

-- CreateEnum
CREATE TYPE "AnnouncementPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recipientType" "AnnouncementRecipientType" NOT NULL DEFAULT 'ALL_EMPLOYEES',
    "recipientSiteId" TEXT,
    "recipientDepartment" TEXT,
    "priority" "AnnouncementPriority" NOT NULL DEFAULT 'MEDIUM',
    "attachmentUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_read_statuses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "announcementId" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_read_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "announcements_createdBy_idx" ON "announcements"("createdBy");

-- CreateIndex
CREATE INDEX "announcements_recipientType_idx" ON "announcements"("recipientType");

-- CreateIndex
CREATE INDEX "announcements_recipientSiteId_idx" ON "announcements"("recipientSiteId");

-- CreateIndex
CREATE INDEX "announcements_isActive_idx" ON "announcements"("isActive");

-- CreateIndex
CREATE INDEX "announcements_expiresAt_idx" ON "announcements"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_read_statuses_announcementId_userId_key" ON "announcement_read_statuses"("announcementId", "userId");

-- CreateIndex
CREATE INDEX "announcement_read_statuses_userId_idx" ON "announcement_read_statuses"("userId");

-- CreateIndex
CREATE INDEX "announcement_read_statuses_announcementId_idx" ON "announcement_read_statuses"("announcementId");

-- CreateIndex
CREATE INDEX "announcement_read_statuses_readAt_idx" ON "announcement_read_statuses"("readAt");

-- CreateIndex
CREATE INDEX "announcement_read_statuses_dismissedAt_idx" ON "announcement_read_statuses"("dismissedAt");

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_recipientSiteId_fkey" FOREIGN KEY ("recipientSiteId") REFERENCES "sites"("id") ON DELETE SET NULL;

-- AddForeignKey
ALTER TABLE "announcement_read_statuses" ADD CONSTRAINT "announcement_read_statuses_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_read_statuses" ADD CONSTRAINT "announcement_read_statuses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
