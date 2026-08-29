-- CreateEnum
CREATE TYPE "AuthChannel" AS ENUM ('WEB', 'MOBILE');

-- CreateEnum
CREATE TYPE "AuthResult" AS ENUM ('SUCCESS', 'FAILED_INVALID_CREDENTIALS', 'FAILED_DEVICE_LIMIT', 'FAILED_OTHER');

-- CreateTable
CREATE TABLE "auth_activity_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "channel" "AuthChannel" NOT NULL,
    "result" "AuthResult" NOT NULL,
    "deviceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_activity_logs_createdAt_idx" ON "auth_activity_logs"("createdAt");

-- CreateIndex
CREATE INDEX "auth_activity_logs_userId_idx" ON "auth_activity_logs"("userId");

-- CreateIndex
CREATE INDEX "auth_activity_logs_channel_idx" ON "auth_activity_logs"("channel");

-- CreateIndex
CREATE INDEX "auth_activity_logs_result_idx" ON "auth_activity_logs"("result");

-- AddForeignKey
ALTER TABLE "auth_activity_logs" ADD CONSTRAINT "auth_activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
