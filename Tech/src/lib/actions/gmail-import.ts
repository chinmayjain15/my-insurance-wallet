'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { STAGING_COOKIE } from '@/lib/constants'
import { createServiceClient } from '@/lib/supabase/service'
import { refreshGmailAccessToken } from '@/lib/gmail/api'
import { downloadCandidatePdf } from '@/lib/gmail/scanner'
import { isPdfPasswordProtected } from '@/lib/gmail/pdf-utils'
import type { PolicyType } from '@/types'

const IS_STAGING = process.env.NEXT_PUBLIC_APP_ENV === 'staging'

export interface ScanCandidate {
  id: string
  subject: string
  senderEmail: string
  sentDate: string
  policyType: PolicyType
  attachmentFilename: string
  attachmentId: string
  messageId: string
  attachmentSizeBytes: number
}

export interface ImportResult {
  imported: number
  skipped: number
  passwordProtected: number
  error: string
}

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

// Returns all pending candidates for the current user.
export async function getScanCandidates(): Promise<{ candidates: ScanCandidate[]; error: string }> {
  const email = await getSessionEmail()
  if (!email) return { candidates: [], error: 'Not authenticated' }

  const supabase = createServiceClient()
  const { data: user } = await supabase.from('users').select('id').eq('email', email).single()
  if (!user) return { candidates: [], error: 'User not found' }

  const { data, error } = await supabase
    .from('gmail_scan_candidates')
    .select('*')
    .eq('user_id', user.id)
    .order('scanned_at', { ascending: false })

  if (error) return { candidates: [], error: error.message }

  const candidates: ScanCandidate[] = (data ?? []).map(row => ({
    id: row.id,
    subject: row.subject,
    senderEmail: row.sender_email,
    sentDate: row.sent_date,
    policyType: row.policy_type as PolicyType,
    attachmentFilename: row.attachment_filename,
    attachmentId: row.attachment_id,
    messageId: row.message_id,
    attachmentSizeBytes: row.attachment_size_bytes,
  }))

  return { candidates, error: '' }
}

// Downloads and imports the selected candidates into the policies table.
// Deletes successfully imported candidates from gmail_scan_candidates.
export async function importSelected(ids: string[]): Promise<ImportResult> {
  if (ids.length === 0) return { imported: 0, skipped: 0, passwordProtected: 0, error: '' }

  const email = await getSessionEmail()
  if (!email) return { imported: 0, skipped: 0, passwordProtected: 0, error: 'Not authenticated' }

  const supabase = createServiceClient()

  const { data: user } = await supabase.from('users').select('id').eq('email', email).single()
  if (!user) return { imported: 0, skipped: 0, passwordProtected: 0, error: 'User not found' }

  // Fetch the selected candidates (scoped to user for safety)
  const { data: rows } = await supabase
    .from('gmail_scan_candidates')
    .select('*')
    .eq('user_id', user.id)
    .in('id', ids)

  if (!rows?.length) return { imported: 0, skipped: 0, passwordProtected: 0, error: 'No candidates found' }

  // Get a fresh Gmail access token
  const { data: tokenRow } = await supabase
    .from('gmail_tokens')
    .select('refresh_token')
    .eq('user_id', user.id)
    .single()
  if (!tokenRow) return { imported: 0, skipped: 0, passwordProtected: 0, error: 'Gmail not connected' }

  let accessToken: string
  try {
    accessToken = await refreshGmailAccessToken(tokenRow.refresh_token)
  } catch (err) {
    return {
      imported: 0,
      skipped: 0,
      passwordProtected: 0,
      error: `Token refresh failed: ${err instanceof Error ? err.message : String(err)}`,
    }
  }

  let imported = 0
  let skipped = 0
  let passwordProtected = 0

  for (const row of rows) {
    // Skip if already imported by message ID (most reliable) or filename (fallback)
    const { data: existing } = await supabase
      .from('policies')
      .select('id')
      .eq('user_id', user.id)
      .or(`gmail_message_id.eq.${row.message_id},file_name.eq.${row.attachment_filename}`)
      .maybeSingle()

    if (existing) {
      await supabase.from('gmail_scan_candidates').delete().eq('id', row.id)
      skipped++
      continue
    }

    // Download PDF
    let pdfBytes: Buffer
    try {
      pdfBytes = await downloadCandidatePdf(accessToken, row.message_id, row.attachment_id)
    } catch {
      skipped++
      continue
    }

    // Detect password-protected PDFs — flag and skip rather than silently fail
    if (isPdfPasswordProtected(pdfBytes)) {
      await supabase.from('gmail_scan_candidates').delete().eq('id', row.id)
      passwordProtected++
      continue
    }

    // Upload to Supabase Storage
    const storagePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('policies')
      .upload(storagePath, pdfBytes, { contentType: 'application/pdf', upsert: false })

    if (uploadError) {
      skipped++
      continue
    }

    const policyName = row.attachment_filename.replace(/\.pdf$/i, '').trim() || row.subject || 'Imported policy'

    const { error: dbError } = await supabase.from('policies').insert({
      user_id: user.id,
      name: policyName,
      type: row.policy_type,
      file_url: storagePath,
      file_name: row.attachment_filename,
      file_size_bytes: row.attachment_size_bytes,
      source: 'email',
      gmail_message_id: row.message_id,
    })

    if (dbError) {
      await supabase.storage.from('policies').remove([storagePath])
      skipped++
      continue
    }

    // Remove from candidates on success
    await supabase.from('gmail_scan_candidates').delete().eq('id', row.id)
    imported++
  }

  revalidatePath('/', 'layout')
  return { imported, skipped, passwordProtected, error: '' }
}

// Dismisses all pending candidates for the current user.
export async function dismissAll(): Promise<void> {
  const email = await getSessionEmail()
  if (!email) return

  const supabase = createServiceClient()
  const { data: user } = await supabase.from('users').select('id').eq('email', email).single()
  if (!user) return

  await supabase.from('gmail_scan_candidates').delete().eq('user_id', user.id)
  redirect('/home')
}
