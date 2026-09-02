import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Skip Supabase client creation if environment variables are not set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return res
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // getClaims() verifies the JWT signature locally (asymmetric keys) instead of
  // calling the Supabase Auth server on every request. It still calls getSession()
  // internally, so an expired access token is refreshed and cookies are updated here.
  const { data: claimsData } = await supabase.auth.getClaims()
  const isAuthenticated = Boolean(claimsData?.claims?.sub)

  // Protect dashboard routes - redirect to login if no user
  if (req.nextUrl.pathname.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Protect login page - redirect to dashboard if user exists
  if (req.nextUrl.pathname === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/',
    '/dashboard/:path*',
  ],
}
