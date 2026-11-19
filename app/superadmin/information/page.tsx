import { ShieldAlert } from 'lucide-react'

import { prisma } from '@/lib/prisma'
import { BrandingForms, type BrandingSettings } from '@/components/superadmin/branding-forms'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Read straight from the database (not the shared cache) so this page always
// shows exactly what is stored.
async function loadBrandingSettings(): Promise<BrandingSettings | null> {
  try {
    const row = await prisma.systemSettings.findFirst()

    return {
      appName: row?.appName ?? '',
      appDescription: row?.appDescription ?? '',
      appVersions: row?.appVersions ?? '',
      logoUrl: row?.logoUrl ?? null,
    }
  } catch (error) {
    console.error('[v0] Failed to load system information:', error)
    return null
  }
}

export default async function InformationPage() {
  const settings = await loadBrandingSettings()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <ShieldAlert className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Information</h1>
          <p className="text-muted-foreground">Configure global application branding</p>
        </div>
      </div>

      {settings ? (
        <BrandingForms settings={settings} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load system information</CardTitle>
            <CardDescription>Please refresh the page and try again.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
