import { NextRequest, NextResponse } from 'next/server'
import { STAGING_COOKIE } from '@/lib/constants'

const IS_STAGING = process.env.NEXT_PUBLIC_APP_ENV === 'staging'

const PROTECTED = ['/home', '/policies', '/contacts', '/settings', '/other-policies', '/profile']
const AUTH_ONLY = ['/auth']
const CONSENT_ROUTE = '/consent'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some((r) => pathname.startsWith(r))
  const isAuthOnly = AUTH_ONLY.some((r) => pathname.startsWith(r))
  const isConsent = pathname.startsWith(CONSENT_ROUTE)

  if (IS_STAGING) {
    const session = request.cookies.get(STAGING_COOKIE)
    const sessionData = session ? JSON.parse(session.value) : null
    const consentGiven = sessionData?.consentGiven === true

    // No session → send to auth (unless already there)
    if (!session && (isProtected || isConsent)) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    // Has session but no consent → send to consent (unless already there)
    if (session && !consentGiven && isProtected) {
      return NextResponse.redirect(new URL('/consent', request.url))
    }
    // Has session + consent → skip consent and auth pages
    if (session && consentGiven && (isAuthOnly || isConsent)) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return NextResponse.next()
  }

  // Production: Supabase session check
  // TODO: add createServerClient + session refresh here when production auth is ready
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
