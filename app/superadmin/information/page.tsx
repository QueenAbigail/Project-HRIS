"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldAlert } from 'lucide-react'
import { useState, useEffect } from 'react'

// 👉 Import fungsi penarik datanya juga
import { updateSettings, updateMobileAppVersion, getSystemSettings } from '../actions'

export default function InformationPage() {
  const [previewLogo, setPreviewLogo] = useState<string | null>(null)
  
  // 👉 State buat nampung data asli dari database
  const [settings, setSettings] = useState({ appName: '', appDescription: '', appVersions: '' })
  const [isLoading, setIsLoading] = useState(true)

  // 👉 Narik data pas halaman pertama kali dibuka
  useEffect(() => {
    getSystemSettings().then((data) => {
      if (data) {
        setSettings({
          appName: data.appName,
          appDescription: data.appDescription,
          appVersions: data.appVersions ?? ''
        })
      }
      setIsLoading(false) // Matiin loading kalau data udah dapet
    })
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewLogo(url)
    }
  }

  // Return null while loading to let skeleton handle loading state
  if (isLoading) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <ShieldAlert className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Information</h1>
          <p className="text-muted-foreground">Configure global application branding</p>
        </div>
      </div>

      <form action={updateSettings} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Global Branding</CardTitle>
            <CardDescription>Update logo, app name and description. Changes reflect everywhere.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logo">App Logo</Label>
              <Input id="logo" name="logo" type="file" accept="image/*" onChange={handleLogoChange} />
              {previewLogo && (
                <img src={previewLogo} alt="Preview" className="mt-2 h-32 w-32 rounded-lg object-cover" />
              )}
            </div>
            <div className="space-y-4 md:col-span-2">
              <div className="space-y-2">
                <Label htmlFor="appName">App Name</Label>
                {/* 👉 Sekarang defaultValue ngambil dari database */}
                <Input id="appName" name="appName" defaultValue={settings.appName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appDescription">App Description</Label>
                {/* 👉 Ini juga ngambil data dari database */}
                <Input id="appDescription" name="appDescription" defaultValue={settings.appDescription} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Button type="submit" className="w-full md:w-auto">
          Save Changes
        </Button>
      </form>

      <form action={updateMobileAppVersion} className="space-y-6">
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
              pattern="[0-9]+\\.[0-9]+\\.[0-9]+"
              required
            />
            <p className="text-sm text-muted-foreground">The version mobile apps must match before they can continue.</p>
          </CardContent>
        </Card>
        <Button type="submit" className="w-full md:w-auto">
          Save Mobile Settings
        </Button>
      </form>
    </div>
  )
}
