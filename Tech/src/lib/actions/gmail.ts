'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { refreshGmailAccessToken } from '@/lib/gmail/api'
import { scanGmailCandidates } from '@/lib/gmail/scanner'
import { getSessionEmail } from '@/lib/session'

export interface ScanResult {
  newCandidates: number
  totalCandidates: number
  error: string
}

// Scans Gmail for policy candidates and stores them in gmail_scan_candidates for review.
// Does NOT download PDFs or create policy rows — that happens on the review screen.
export async function triggerGmailScan(): Promise<ScanResult> {
  const email = await getSessionEmail()
  if (!email) return { newCandidates: 0, totalCandidates: 0, error: 'Not authenticated' }

  try {
    const supabase = createServiceClient()

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    if (!user) return { newCandidates: 0, totalCandidates: 0, error: 'User not found' }

    const { data: tokenRow } = await supabase
      .from('gmail_tokens')
      .select('refresh_token')
      .eq('user_id', user.id)
      .single()
    if (!tokenRow) return { newCandidates: 0, totalCandidates: 0, error: 'Gmail not connected' }

    let accessToken: string
    try {
      accessToken = await refreshGmailAccessToken(tokenRow.refresh_token)
    } catch (err) {
      return {
        newCandidates: 0,
        totalCandidates: 0,
        error: `Token refresh failed: ${err instanceof Error ? err.message : String(err)}`,
      }
    }

    const candidates = await scanGmailCandidates(accessToken)

    // Build set of message IDs already imported so we skip them during this scan.
    const { data: imported } = await supabase
      .from('policies')
      .select('gmail_message_id')
      .eq('user_id', user.id)
      .not('gmail_message_id', 'is', null)

    const importedMessageIds = new Set((imported ?? []).map(p => p.gmail_message_id as string))

    let newCandidates = 0

    for (const c of candidates) {
      // Skip if this email's attachment was already imported
      if (importedMessageIds.has(c.messageId)) continue

      const { error } = await supabase
        .from('gmail_scan_candidates')
        .upsert(
          {
            user_id: user.id,
            message_id: c.messageId,
            subject: c.subject,
            sender_email: c.senderEmail,
            sent_date: c.date,
            policy_type: c.policyType,
            attachment_filename: c.attachmentFilename,
            attachment_id: c.attachmentId,
            attachment_size_bytes: c.attachmentSize,
          },
          { onConflict: 'user_id,message_id,attachment_id', ignoreDuplicates: true }
        )
      if (!error) newCandidates++
    }

    // Total pending candidates after this scan
    const { count } = await supabase
      .from('gmail_scan_candidates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    await supabase
      .from('gmail_tokens')
      .update({ last_scanned_at: new Date().toISOString() })
      .eq('user_id', user.id)

    return { newCandidates, totalCandidates: count ?? 0, error: '' }
  } catch (err) {
    return {
      newCandidates: 0,
      totalCandidates: 0,
      error: err instanceof Error ? err.message : 'Unexpected error',
    }
  }
}
