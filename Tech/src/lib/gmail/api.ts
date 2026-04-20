export interface GmailAttachmentMeta {
  attachmentId: string
  filename: string
  mimeType: string
  size: number
}

export interface GmailMessageMeta {
  id: string
  subject: string
  from: string
  date: string
  snippet: string
  attachments: GmailAttachmentMeta[]
}

// Exchange a stored refresh token for a fresh access token.
// Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars.
export async function refreshGmailAccessToken(refreshToken: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Token refresh failed (${res.status}): ${body}`)
  }

  const data = await res.json()
  if (!data.access_token) throw new Error('Token refresh returned no access_token')
  return data.access_token as string
}

// Known insurer name fragments used to narrow the Gmail search via from: filters.
// Substring matches are enough — Gmail matches these against sender name and address.
const INSURER_FROM_FRAGMENTS = [
  'hdfclife', 'iciciprulife', 'licindia', 'sbilife', 'maxlife',
  'kotaklife', 'bajajlife', 'tataaig', 'starhealth', 'hdfcergo',
  'niva-bupa', 'nivabupa', 'careinsurance', 'acko', 'godigit',
  'policybazaar', 'turtlemint', 'bajajfinserv', 'pnbmetlife', 'reliancelife',
]

// Search the user's mailbox for emails that likely contain insurance policy PDFs.
// Combines known insurer from: fragments with subject keywords to reduce noise before
// any metadata fetching or classification occurs.
export async function searchGmailMessages(accessToken: string): Promise<string[]> {
  const fromClauses = INSURER_FROM_FRAGMENTS.map(f => `from:${f}`).join(' OR ')
  const query =
    `has:attachment filename:pdf newer_than:365d ` +
    `(subject:insurance OR subject:policy OR subject:mediclaim OR subject:premium OR subject:coverage OR ${fromClauses})`
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=100`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) throw new Error(`Gmail search failed (${res.status})`)

  const data = await res.json()
  return (data.messages ?? []).map((m: { id: string }) => m.id)
}

// Fetch full message metadata for a single message ID.
// Traverses the MIME part tree to collect all PDF attachment descriptors.
// Returns null if the request fails (caller should skip the message).
export async function getMessageMetadata(
  accessToken: string,
  messageId: string
): Promise<GmailMessageMeta | null> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) return null

  const msg = await res.json()
  const headers: { name: string; value: string }[] = msg.payload?.headers ?? []
  const get = (name: string) =>
    headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''

  const attachments: GmailAttachmentMeta[] = []

  // Recursively walk the MIME tree to find PDF parts with an attachmentId.
  function collectParts(part: {
    filename?: string
    mimeType?: string
    body?: { attachmentId?: string; size?: number }
    parts?: unknown[]
  }) {
    if (
      part.filename &&
      part.mimeType?.toLowerCase() === 'application/pdf' &&
      part.body?.attachmentId
    ) {
      attachments.push({
        attachmentId: part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body.size ?? 0,
      })
    }
    for (const child of (part.parts ?? []) as typeof part[]) {
      collectParts(child)
    }
  }

  if (msg.payload) collectParts(msg.payload)

  return {
    id: messageId,
    subject: get('Subject'),
    from: get('From'),
    date: get('Date'),
    snippet: (msg.snippet as string) ?? '',
    attachments,
  }
}

// Download a specific attachment and return the raw PDF bytes.
// Gmail returns base64url-encoded data; we decode it to a Buffer.
export async function downloadAttachment(
  accessToken: string,
  messageId: string,
  attachmentId: string
): Promise<Buffer> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) throw new Error(`Attachment download failed (${res.status})`)

  const data = await res.json()
  // Gmail uses base64url encoding (- → +, _ → /)
  const standard = (data.data as string).replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(standard, 'base64')
}
