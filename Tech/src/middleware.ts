import { NextRequest, NextResponse } from 'next/server'
import { STAGING_COOKIE } from '@/lib/constants'

const IS_STAGING = process.env.NEXT_PUBLIC_APP_ENV === 'staging'

const PROTECTED = ['/home', '/policies', '/contacts', '/settings', '/other-policies']
const AUTH_ONLY = ['/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some((r) => pathname.startsWith(r))
  const isAuthOnly = AUTH_ONLY.some((r) => pathname.startsWith(r))

  if (IS_STAGING) {
    const session = request.cookies.get(STAGING_COOKIE)

    if (isProtected && !session) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    if (isAuthOnly && session) {
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
