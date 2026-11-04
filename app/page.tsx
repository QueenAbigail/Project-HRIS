import { getSystemSettings } from '@/lib/system'
import { LoginForm } from '@/components/login/login-form'

export default async function LoginPage() {
  const settings = await getSystemSettings()

  return (
    <LoginForm
      branding={{
        appName: settings?.appName || 'HR Administration System',
        appDescription: settings?.appDescription || 'Sign in to access the admin dashboard',
        logoUrl: settings?.logoUrl ?? null,
      }}
    />
  )
}
