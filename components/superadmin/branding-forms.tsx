"use client"

import { useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateMobileAppVersion, updateSettings, type SettingsActionResult } from '@/app/superadmin/actions'

export interface BrandingSettings {
  appName: string
  appDescription: string
  appVersions: string
  logoUrl: string | null
}

const DEFAULT_LOGO = '/koperasi_icon.png'

export function BrandingForms({ settings }: { settings: BrandingSettings }) {
  const router = useRouter()
  const [isSavingBranding, startBrandingTransition] = useTransition()
  const [isSavingVersion, startVersionTransition] = useTransition()
  const [previewLogo, setPreviewLogo] = useState<string | null>(null)
  const previewLogoRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (previewLogoRef.current) URL.revokeObjectURL(previewLogoRef.current)
    }
  }, [])

  const clearPreview = () => {
    if (previewLogoRef.current) URL.revokeObjectURL(previewLogoRef.current)
    previewLogoRef.current = null
    setPreviewLogo(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return clearPreview()

    if (previewLogoRef.current) URL.revokeObjectURL(previewLogoRef.current)
    const url = URL.createObjectURL(file)
    previewLogoRef.current = url
    setPreviewLogo(url)
  }

  const report = (result: SettingsActionResult) => {
    if (result.success) toast.success(result.message)
    else toast.error(result.message)
    return result.success
  }

  const handleBrandingSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startBrandingTransition(async () => {
      try {
        if (report(await updateSettings(formData))) {
          clearPreview()
          router.refresh()
        }
      } catch {
        toast.error('Unable to save branding. Please try again.')
      }
    })
  }

  const handleVersionSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    startVersionTransition(async () => {
      try {
        if (report(await updateMobileAppVersion(formData))) router.refresh()
      } catch {
        toast.error('Unable to save the mobile app version. Please try again.')
      }
    })
  }

  // Remount the uncontrolled inputs whenever the saved values change so they
  // always display what is actually stored.
  const brandingKey = `${settings.appName}|${settings.appDescription}|${settings.logoUrl ?? ''}`

  return (
    <div className="space-y-6">
      <form key={brandingKey} onSubmit={handleBrandingSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Global Branding</CardTitle>
            <CardDescription>Update logo, app name and description. Changes reflect everywhere.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logo">App Logo</Label>
              <Input
                ref={fileInputRef}
                id="logo"
                name="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
              />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {previewLogo ? 'New logo preview (not saved yet)' : 'Currently used logo'}
                </p>
                <Image
                  src={previewLogo || settings.logoUrl || DEFAULT_LOGO}
                  alt={previewLogo ? 'New app logo preview' : 'Currently used app logo'}
                  width={128}
                  height={128}
                  unoptimized
                  className="h-32 w-32 rounded-lg border border-border bg-muted object-contain p-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appName">App Name</Label>
              <Input id="appName" name="appName" defaultValue={settings.appName} required maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appDescription">App Description</Label>
              <Input
                id="appDescription"
                name="appDescription"
                defaultValue={settings.appDescription}
                required
                maxLength={120}
              />
            </div>
          </CardContent>
        </Card>
        <Button type="submit" className="w-full md:w-auto" disabled={isSavingBranding}>
          {isSavingBranding && <Loader2 className="size-4 animate-spin" />}
          {isSavingBranding ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>

      <form key={`version-${settings.appVersions}`} onSubmit={handleVersionSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mobile Settings</CardTitle>
            <CardDescription>Manage the mobile app version required to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="appVersions">Mobile App Version</Label>
            <Input
              id="appVersions"
              name="appVersions"
              defaultValue={settings.appVersions}
              placeholder="1.1.0"
              pattern="[0-9]+\.[0-9]+\.[0-9]+"
              title="Use the format x.y.z, for example 1.1.0"
              required
            />
            <p className="text-sm text-muted-foreground">
              The version mobile apps must match before they can continue.
            </p>
          </CardContent>
        </Card>
        <Button type="submit" className="w-full md:w-auto" disabled={isSavingVersion}>
          {isSavingVersion && <Loader2 className="size-4 animate-spin" />}
          {isSavingVersion ? 'Saving...' : 'Save Mobile Settings'}
        </Button>
      </form>
    </div>
  )
}
