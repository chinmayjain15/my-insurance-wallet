import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { STAGING_COOKIE } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

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

  // Normal sign-in callback
  const { data: existingUser } = await serviceClient
    .from('users')
    .select('id, consent_given')
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

  if (!consentGiven) {
    return NextResponse.redirect(`${origin}/consent`)
  }

  // Returning user — check if Gmail is connected; if not, prompt them to connect
  if (existingUser?.id) {
    const { data: gmailToken } = await serviceClient
      .from('gmail_tokens')
      .select('user_id')
      .eq('user_id', existingUser.id)
      .single()

    if (!gmailToken) {
      return NextResponse.redirect(`${origin}/consent?gmail_only=true`)
    }
  }

  return NextResponse.redirect(`${origin}/home`)
}
