import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

import type { SystemSettings } from '@prisma/client'

export const SYSTEM_SETTINGS_TAG = 'system-settings'

// Cached across requests. system_settings changes very rarely (logo, app name),
// so we read from Postgres once and reuse until updateSettings invalidates the tag.
const getCachedSettings = unstable_cache(
  async (): Promise<Omit<SystemSettings, 'id'> | null> => {
    const settings = await prisma.systemSettings.findFirst()
    return settings
      ? {
          logoUrl: settings.logoUrl,
          appName: settings.appName,
          appDescription: settings.appDescription,
          appVersions: settings.appVersions,
        }
      : null
  },
  ['system-settings'],
  { tags: [SYSTEM_SETTINGS_TAG] },
)

export async function getSystemSettings(): Promise<Omit<SystemSettings, 'id'> | null> {
  try {
    return await getCachedSettings()
  } catch (error) {
    console.error('[v0] Failed to fetch system settings:', error)
    return null
  }
}
