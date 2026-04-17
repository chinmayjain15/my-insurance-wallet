'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { STAGING_COOKIE } from '@/lib/constants'
import { createServiceClient } from '@/lib/supabase/service'
import { refreshGmailAccessToken } from '@/lib/gmail/api'

const IS_STAGING = process.env.NEXT_PUBLIC_APP_ENV === 'staging'

async function getSessionEmail(): Promise<string | null> {
  if (IS_STAGING) {
    const cookieStore = await cookies()
    const session = cookieStore.get(STAGING_COOKIE)
    if (!session) return null
    return JSON.parse(session.value).email ?? null
  }
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email ?? null
}

// Revokes the Gmail access token with Google, then deletes the local token row
// and any pending scan candidates for the user.
export async function disconnectGmail(): Promise<{ error: string }> {
  const email = await getSessionEmail()
  if (!email) return { error: 'Not authenticated' }

  const supabase = createServiceClient()

  const { data: user } = await supabase.from('users').select('id').eq('email', email).single()
  if (!user) return { error: 'User not found' }

  const { data: tokenRow } = await supabase
    .from('gmail_tokens')
    .select('refresh_token')
    .eq('user_id', user.id)
    .single()

  if (tokenRow) {
    // Revoke with Google — non-fatal if it fails (token may already be expired)
    try {
      const accessToken = await refreshGmailAccessToken(tokenRow.refresh_token)
      await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, { method: 'POST' })
    } catch {
      // Proceed with local cleanup regardless
    }

    await supabase.from('gmail_tokens').delete().eq('user_id', user.id)
    await supabase.from('gmail_scan_candidates').delete().eq('user_id', user.id)
  }

  revalidatePath('/', 'layout')
  return { error: '' }
}
