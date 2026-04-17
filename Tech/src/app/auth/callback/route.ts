import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { STAGING_COOKIE } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const isGmailCallback = searchParams.get('gmail') === 'true'

  if (error || !code) {
    return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs: { name: string; value: string; options: CookieOptions }[]) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !session?.user?.email) {
    return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
  }

  const email = session.user.email.toLowerCase()
  const { createServiceClient } = await import('@/lib/supabase/service')
  const serviceClient = createServiceClient()

  // Gmail OAuth callback: store tokens and go home
  if (isGmailCallback) {
    const accessToken = session.provider_token
    const refreshToken = session.provider_refresh_token

    console.log('[gmail-callback] email:', email)
    console.log('[gmail-callback] provider_token present:', !!accessToken)
    console.log('[gmail-callback] provider_refresh_token present:', !!refreshToken)

    if (!accessToken || !refreshToken) {
      console.error('[gmail-callback] Missing tokens — provider_token:', accessToken, 'provider_refresh_token:', refreshToken)
      return NextResponse.redirect(`${origin}/home?gmail_error=missing_tokens`)
    }

    const { data: user, error: userError } = await serviceClient
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    console.log('[gmail-callback] user lookup result:', user?.id, 'error:', userError?.message)

    if (!user) {
      console.error('[gmail-callback] User not found for email:', email)
      return NextResponse.redirect(`${origin}/home?gmail_error=user_not_found`)
    }

    const { error: upsertError } = await serviceClient
      .from('gmail_tokens')
      .upsert(
        { user_id: user.id, access_token: accessToken, refresh_token: refreshToken },
        { onConflict: 'user_id' }
      )

    if (upsertError) {
      console.error('[gmail-callback] Upsert failed:', upsertError.message)
      return NextResponse.redirect(`${origin}/home?gmail_error=upsert_failed`)
    }

    console.log('[gmail-callback] Successfully stored Gmail tokens for user:', user.id)
    return NextResponse.redirect(`${origin}/home`)
  }

  // Normal sign-in callback
  const { data: existingUser } = await serviceClient
    .from('users')
    .select('consent_given')
    .eq('email', email)
    .single()

  const consentGiven = existingUser?.consent_given === true

  cookieStore.set(STAGING_COOKIE, JSON.stringify({ email, consentGiven, createdAt: Date.now() }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.redirect(`${origin}${consentGiven ? '/home' : '/consent'}`)
}
