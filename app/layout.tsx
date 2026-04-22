import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { getSystemSettings } from '@/lib/system'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSystemSettings()
    const title = settings ? `${settings.appName} HR | Admin Dashboard` : 'SecureGuard HR | Admin Dashboard'
    const description = settings ? `${settings.appDescription} Dashboard for Private Security Company - Manage employees, attendance, payroll, and more.` : 'HR Administration Dashboard for Private Security Company - Manage employees, attendance, payroll, and more.'
    
    return {
          title,
          description,
          generator: 'v0.app',
          icons: {
            icon: [
              {
                url: '/icon-light-32x32.png',
                media: '(prefers-color-scheme: light)',
              },
              {
                url: '/icon-dark-32x32.png',
                media: '(prefers-color-scheme: dark)',
              },
              {
                url: '/icon.svg',
                type: 'image/svg+xml',
              },
            ],
              apple: '/apple-icon.png',
            },
          }
        }
        export const viewport: Viewport = {
          themeColor: '#1a1b26',
          colorScheme: ['normal', 'dark light'],
        }
        import { Providers } from '@/components/providers'
        export default function RootLayout({
          children,
        }: Readonly<{
          children: React.ReactNode
        }>) {
            return (
              <html lang="en" suppressHydrationWarning={true}>
                <body className="font-sans antialiased min-h-screen">
                  <Providers>
                    {children}
                    </Providers>
                    </body>
                    </html>
                    )
                  }
