-- CreateTable
CREATE TABLE "system_settings" (
    "id" text NOT NULL,
    "logoUrl" text,
    "appName" text NOT NULL DEFAULT 'SecureGuard',
    "appDescription" text NOT NULL DEFAULT 'HR Administration',

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_id_key" ON "system_settings"("id");

-- Insert default
INSERT INTO "system_settings" (id, appName, appDescription) VALUES ('default', 'SecureGuard', 'HR Administration') ON CONFLICT (id) DO NOTHING;

