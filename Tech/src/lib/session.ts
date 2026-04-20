import { cookies } from 'next/headers'
import { STAGING_COOKIE } from '@/lib/constants'

const IS_STAGING = process.env.NEXT_PUBLIC_APP_ENV === 'staging'

/**
 * Returns the signed-in user's email, or null if unauthenticated.
 * Staging: reads from the miw_staging_session cookie.
 * Production: reads from the Supabase Auth session.
 */
export async function getSessionEmail(): Promise<string | null> {
  if (IS_STAGING) {
    const cookieStore = await cookies()
    const session = cookieStore.get(STAGING_COOKIE)
    if (!session) return null
    const data = JSON.parse(session.value)
    if (data.isDemo) return null  // demo users don't have a real DB row
    return data.email ?? null
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email?.toLowerCase() ?? null
}

/**
 * Full session context used by the layout and server-rendered pages.
 * Staging: reads from the miw_staging_session cookie.
 * Production: reads from the Supabase Auth session.
 */
export async function getSessionData(): Promise<{
  email: string | null
  isDemo: boolean
  name: string | null
  consentGiven: boolean
}> {
  if (IS_STAGING) {
    const cookieStore = await cookies()
    const session = cookieStore.get(STAGING_COOKIE)
    if (!session) return { email: null, isDemo: false, name: null, consentGiven: false }
    const data = JSON.parse(session.value)
    return {
      email: data.isDemo ? null : (data.email ?? null),
      isDemo: data.isDemo === true,
      name: data.name ?? null,
      consentGiven: data.consentGiven === true,
    }
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { email: null, isDemo: false, name: null, consentGiven: false }

  return {
    email: user.email?.toLowerCase() ?? null,
    isDemo: false,
    // Google OAuth stores the user's display name in user_metadata.full_name
    name: (user.user_metadata?.full_name as string | undefined) ?? null,
    // Production users reach the app only after accepting consent in the callback
    consentGiven: true,
  }
}
