'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import { refreshGmailAccessToken } from '@/lib/gmail/api'
import { getSessionEmail } from '@/lib/session'

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
