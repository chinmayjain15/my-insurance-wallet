import type { PolicyType } from '@/types'
import { searchGmailMessages, getMessageMetadata, downloadAttachment } from './api'
import { isPersonalSender, extractSenderEmail, classifyByHeuristics, classifyWithLLM } from './classifier'

// Metadata-only result — no PDF bytes. Used during the scan phase (Phase 4).
export interface PolicyCandidate {
  messageId: string
  subject: string
  senderEmail: string
  date: string
  policyType: PolicyType
  attachmentFilename: string
  attachmentId: string
  attachmentSize: number
}

// Skip attachments smaller than 1 MB — likely not full policy documents.
const MIN_ATTACHMENT_BYTES = 1 * 1024 * 1024

// Scans Gmail and returns candidate policy metadata without downloading PDFs.
// PDF download happens later when the user confirms import on the review screen.
export async function scanGmailCandidates(accessToken: string): Promise<PolicyCandidate[]> {
  const messageIds = await searchGmailMessages(accessToken)
  if (messageIds.length === 0) return []

  const results: PolicyCandidate[] = []

  for (const msgId of messageIds) {
    const meta = await getMessageMetadata(accessToken, msgId)
    if (!meta || meta.attachments.length === 0) continue

    // Filter out personal senders — insurance companies always send from business domains.
    if (isPersonalSender(meta.from)) continue

    for (const att of meta.attachments) {
      if (att.size < MIN_ATTACHMENT_BYTES) continue

      // Classify — heuristics first, LLM only as fallback.
      // null means the document is not an insurance policy (receipt, claim form, etc.)
      // and should be skipped entirely rather than surfaced to the user.
      const policyType =
        classifyByHeuristics(meta.from, meta.subject, att.filename, meta.snippet) ??
        (await classifyWithLLM(meta.from, meta.subject, att.filename, meta.snippet))

      if (policyType === null) continue

      results.push({
        messageId: msgId,
        subject: meta.subject,
        senderEmail: extractSenderEmail(meta.from),
        date: meta.date,
        policyType,
        attachmentFilename: att.filename,
        attachmentId: att.attachmentId,
        attachmentSize: att.size,
      })
    }
  }

  return results
}

// Downloads a single candidate's PDF bytes. Used when the user confirms import.
export async function downloadCandidatePdf(
  accessToken: string,
  messageId: string,
  attachmentId: string
): Promise<Buffer> {
  return downloadAttachment(accessToken, messageId, attachmentId)
}
