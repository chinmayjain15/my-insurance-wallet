import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    console.error('[gmail-callback] OAuth error or missing code:', error)
    return NextResponse.redirect(`${origin}/home?gmail_error=oauth_failed`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs: { name: string; value: string; options: CookieOptions }[]) =>
          cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  console.log('[gmail-callback] exchangeCodeForSession error:', exchangeError?.message ?? 'none')
  console.log('[gmail-callback] session user email:', session?.user?.email ?? 'missing')

  if (exchangeError || !session?.user?.email) {
    return NextResponse.redirect(`${origin}/home?gmail_error=session_failed`)
  }

  const email = session.user.email.toLowerCase()
  const accessToken = session.provider_token
  const refreshToken = session.provider_refresh_token

  console.log('[gmail-callback] provider_token present:', !!accessToken)
  console.log('[gmail-callback] provider_refresh_token present:', !!refreshToken)

  if (!accessToken || !refreshToken) {
    console.error('[gmail-callback] Missing tokens — access:', !!accessToken, 'refresh:', !!refreshToken)
    return NextResponse.redirect(`${origin}/home?gmail_error=missing_tokens`)
  }

  const { createServiceClient } = await import('@/lib/supabase/service')
  const serviceClient = createServiceClient()

  const { data: user, error: userError } = await serviceClient
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  console.log('[gmail-callback] user lookup — id:', user?.id ?? 'not found', 'error:', userError?.message ?? 'none')

  if (!user) {
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
