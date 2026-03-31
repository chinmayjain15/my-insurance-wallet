'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { STAGING_COOKIE } from '@/lib/constants'
import { createServiceClient } from '@/lib/supabase/service'

const IS_STAGING = process.env.NEXT_PUBLIC_APP_ENV === 'staging'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Staging-only: bypass with any email address
export async function signInWithEmail(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  if (!IS_STAGING) return { error: 'Not available in production' }

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email || !isValidEmail(email)) {
    return { error: 'Please enter a valid email address' }
  }

  const supabase = createServiceClient()
  const { data: existingUser } = await supabase
    .from('users')
    .select('consent_given')
    .eq('email', email)
    .single()

  const consentGiven = existingUser?.consent_given === true

  const cookieStore = await cookies()
  cookieStore.set(
    STAGING_COOKIE,
    JSON.stringify({ email, consentGiven, createdAt: Date.now() }),
    COOKIE_OPTIONS
  )
  redirect(consentGiven ? '/home' : '/consent')
}

export async function acceptConsent(): Promise<void> {
  const cookieStore = await cookies()
  const session = cookieStore.get(STAGING_COOKIE)
  if (!session) redirect('/auth')
  const data = JSON.parse(session.value)
  cookieStore.set(
    STAGING_COOKIE,
    JSON.stringify({ ...data, consentGiven: true }),
    COOKIE_OPTIONS
  )
  redirect('/home')
}

export async function demoSignIn(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(
    STAGING_COOKIE,
    JSON.stringify({ email: 'demo@myinsurancewallet.com', isDemo: true, consentGiven: true, createdAt: Date.now() }),
    COOKIE_OPTIONS
  )
  redirect('/home')
}

export async function deleteAccount(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const otp = (formData.get('otp') as string)?.trim()

  if (!otp || !/^\d{6}$/.test(otp)) {
    return { error: 'Please enter a valid 6-digit code' }
  }

  const cookieStore = await cookies()
  const session = cookieStore.get(STAGING_COOKIE)
  if (!session) return { error: 'Not authenticated' }

  const { email } = JSON.parse(session.value)

  try {
    const supabase = createServiceClient()
    const { data: user } = await supabase.from('users').select('id').eq('email', email).single()

    if (user) {
      const { data: policies } = await supabase
        .from('policies')
        .select('id, file_url')
        .eq('user_id', user.id)

      if (policies?.length) {
        const paths = policies.filter(p => p.file_url).map(p => p.file_url as string)
        if (paths.length > 0) await supabase.storage.from('policies').remove(paths)
        await supabase.from('policy_shares').delete().in('policy_id', policies.map(p => p.id))
      }

      const { data: contacts } = await supabase.from('contacts').select('id').eq('owner_id', user.id)
      if (contacts?.length) {
        await supabase.from('policy_shares').delete().in('contact_id', contacts.map(c => c.id))
        await supabase.from('contacts').delete().eq('owner_id', user.id)
      }

      await supabase.from('policies').delete().eq('user_id', user.id)
      await supabase.from('users').delete().eq('id', user.id)
    }
  } catch {
    return { error: 'Failed to delete account. Please try again.' }
  }

  const cookieStore2 = await cookies()
  cookieStore2.delete(STAGING_COOKIE)
  redirect('/auth')
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(STAGING_COOKIE)

  // Also sign out from Supabase Auth (for Google SSO users)
  if (!IS_STAGING) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      await supabase.auth.signOut()
    } catch {
      // Ignore — cookie deletion above is sufficient
    }
  }

  redirect('/auth')
}
