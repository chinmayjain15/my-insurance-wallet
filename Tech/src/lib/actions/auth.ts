'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { STAGING_COOKIE } from '@/lib/constants'
import { createServiceClient } from '@/lib/supabase/service'

const IS_STAGING = process.env.NEXT_PUBLIC_APP_ENV === 'staging'

function isValidIndianMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone)
}

export async function signInWithPhone(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const phone = (formData.get('phone') as string)?.trim()

  if (!phone || !isValidIndianMobile(phone)) {
    return { error: 'Please enter a valid 10-digit mobile number' }
  }

  if (IS_STAGING) {
    const cookieStore = await cookies()
    cookieStore.set(STAGING_COOKIE, JSON.stringify({ phone, createdAt: Date.now() }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    redirect('/home')
  }

  // Production: Supabase phone OTP
  // TODO: implement when Supabase phone auth is configured
  return { error: 'Production auth not yet configured' }
}

export async function demoSignIn(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(STAGING_COOKIE, JSON.stringify({ phone: '9999999999', isDemo: true, createdAt: Date.now() }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
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

  const { phone } = JSON.parse(session.value)

  try {
    const supabase = createServiceClient()
    const { data: user } = await supabase.from('users').select('id').eq('phone', phone).single()

    if (user) {
      // Get policy IDs to clean up shares and storage
      const { data: policies } = await supabase
        .from('policies')
        .select('id, file_url')
        .eq('user_id', user.id)

      if (policies?.length) {
        // Delete files from storage
        const paths = policies.filter(p => p.file_url).map(p => p.file_url as string)
        if (paths.length > 0) await supabase.storage.from('policies').remove(paths)

        // Delete outbound policy_shares
        await supabase.from('policy_shares').delete().in('policy_id', policies.map(p => p.id))
      }

      // Delete inbound shares (contacts owned by this user)
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

  if (IS_STAGING) {
    cookieStore.delete(STAGING_COOKIE)
  } else {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  redirect('/auth')
}
