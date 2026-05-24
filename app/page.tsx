'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react'
import { login } from '@/lib/auth'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { LoginLoading } from '@/components/login/login-loading'

interface SystemSettings {
  appName: string
  appDescription: string
  logoUrl?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    appName: 'HR Administration System',
    appDescription: 'Sign in to access the admin dashboard'
  })
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/system-settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        // Silently fail and use default settings
      } finally {
        setIsLoadingSettings(false)
      }
    }
    fetchSettings()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const mappedEmail = `${email.trim()}@hris.com`
    const result = await login(mappedEmail, password, remember)
    
    if (result?.error) {
      // Show different toast messages based on error type
      if (result.error.includes('device') || result.error.includes('Device') || result.error.includes('bound')) {
        toast.error('Device Not Authorized', {
          description: 'This account is bound to another device. Contact your administrator to reset the device binding.',
          duration: 5000,
        })
      } else if (result.error.includes('password') || result.error.includes('Password') || result.error.includes('incorrect')) {
        toast.error('Invalid Credentials', {
          description: 'The password you entered is incorrect. Please try again.',
          duration: 4000,
        })
      } else if (result.error.includes('not found') || result.error.includes('does not exist')) {
        toast.error('User Not Found', {
          description: 'The employee number does not exist in the system.',
          duration: 4000,
        })
      } else {
        toast.error('Login Failed', {
          description: result.error,
          duration: 4000,
        })
      }
      setIsLoading(false)
      return
    }

    // Redirect to dashboard immediately - welcome toast will show there
    if (result?.success) {
      router.push('/dashboard')
    }
  }

  if (isLoadingSettings) {
    return <LoginLoading />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                           linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-2">
          {/* Logo */}
          <div className="flex justify-center">
            <img src={settings.logoUrl || '/koperasi_icon.png'} alt="App Logo" className="max-w-xs h-auto shadow-lg shadow-primary/10" />
          </div>
          
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {settings.appName}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {settings.appDescription}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Nomor Karyawan Field */}
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-sm font-medium">
                Nomor Karyawan
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="employeeId"
                  type="text"
                  placeholder="12345"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-input/50 border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-input/50 border-border/50 focus:border-primary/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <Checkbox 
                id="remember" 
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked === true)}
                className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Remember me for 30 days
              </Label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign in</span>
                  <ArrowRight className="size-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Secure access
              </span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
            <Shield className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Protected System
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This system is for authorized personnel only. All access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-6 text-xs text-muted-foreground text-center relative z-10">
        &copy; {new Date().getFullYear()} Pro Maxima Rajawali. All rights reserved.
      </p>
    </div>
  )
}
