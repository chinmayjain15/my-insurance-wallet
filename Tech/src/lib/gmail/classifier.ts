import type { PolicyType } from '@/types'

// ─── Personal-sender filter ───────────────────────────────────────────────────

const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'ymail.com',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com', 'live.in', 'msn.com',
  'aol.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me',
  'rediffmail.com',
])

// Parses "Display Name <user@domain.com>" or bare "user@domain.com".
export function extractSenderEmail(fromHeader: string): string {
  const bracketMatch = fromHeader.match(/<([^>]+)>/)
  if (bracketMatch) return bracketMatch[1].toLowerCase().trim()
  const bareMatch = fromHeader.match(/\S+@\S+/)
  return bareMatch ? bareMatch[0].toLowerCase().trim() : fromHeader.toLowerCase().trim()
}

export function isPersonalSender(fromHeader: string): boolean {
  const email = extractSenderEmail(fromHeader)
  const domain = email.split('@')[1] ?? ''
  return PERSONAL_DOMAINS.has(domain)
}

// ─── Heuristic classification ─────────────────────────────────────────────────

type Signals = { domains: string[]; keywords: string[] }

const TERM_SIGNALS: Signals = {
  domains: [],
  keywords: ['term plan', 'term insurance', 'term life', 'pure protection', 'iterm', 'e-term', 'saral jeevan'],
}

const LIFE_SIGNALS: Signals = {
  domains: [
    'licindia.in', 'hdfclife.com', 'iciciprulife.com', 'sbilife.co.in',
    'maxlifeinsurance.com', 'tataaialife.com', 'bajajlifeinsurance.com',
    'pnbmetlife.co.in', 'aegonlife.com', 'kotaklife.com', 'canara-hsbc-life.com',
    'absliinsurance.com', 'indiafirstlife.com', 'reliancelife.com',
  ],
  keywords: [
    'life insurance', 'life cover', 'death benefit', 'endowment',
    'whole life', 'money back', 'ulip', 'savings plan', 'jeevan',
  ],
}

const HEALTH_SIGNALS: Signals = {
  domains: [
    'hdfcergo.com', 'starhealth.in', 'niva-bupa.com', 'careinsurance.com',
    'religarehealthinsurance.com', 'maxbupa.com', 'adityabirlahealthinsurance.com',
    'bajajfinserv.com', 'cholainsurance.com', 'royalsundaram.in',
    'unitedindiainsurance.com', 'orientalinsurance.co.in', 'newindia.co.in',
  ],
  keywords: [
    'health insurance', 'mediclaim', 'health cover', 'hospitalization',
    'family floater', 'health plan', 'medical insurance', 'cashless',
    'critical illness', 'super top-up',
  ],
}

const VEHICLE_SIGNALS: Signals = {
  domains: [
    'acko.com', 'godigit.com', 'turtlemint.com', 'renewbuy.com',
    'policybazaar.com', 'insurancedekho.com', 'mahindrainsurance.com',
    'tataaiageneralinsurance.com', 'iffcotokio.co.in', 'bharti-axagi.co.in',
  ],
  keywords: [
    'motor insurance', 'vehicle insurance', 'car insurance', 'two-wheeler',
    'bike insurance', 'comprehensive', 'third party', 'od premium',
    'own damage', 'rc book',
  ],
}

// Patterns that indicate the attachment is a transactional document, not a policy.
// Returning null here lets the LLM make the final call (with the "Not Insurance" option).
const NON_POLICY_PATTERNS = [
  'premium receipt', 'payment receipt', 'payment confirmation', 'premium paid',
  'claim form', 'claim settlement', 'claim intimation',
  'proposal form', 'kyc document',
  'renewal reminder', 'renewal notice', 'payment due', 'outstanding premium',
]

function hits(text: string, senderDomain: string, signals: Signals): boolean {
  if (signals.domains.some(d => senderDomain.endsWith(d))) return true
  return signals.keywords.some(kw => text.includes(kw))
}

export function classifyByHeuristics(
  from: string,
  subject: string,
  filename: string,
  snippet: string = ''
): PolicyType | null {
  const senderDomain = extractSenderEmail(from).split('@')[1] ?? ''
  const text = `${subject} ${filename} ${snippet}`.toLowerCase()

  // If the combined text clearly identifies a non-policy document, skip heuristics
  // and let the LLM make the final determination (it can return "Not Insurance").
  if (NON_POLICY_PATTERNS.some(p => text.includes(p))) return null

  // Check Term before Life (Term is a more-specific subset of Life)
  if (hits(text, senderDomain, TERM_SIGNALS)) return 'Term'
  if (hits(text, senderDomain, LIFE_SIGNALS)) return 'Life'
  if (hits(text, senderDomain, HEALTH_SIGNALS)) return 'Health'
  if (hits(text, senderDomain, VEHICLE_SIGNALS)) return 'Vehicle'

  return null
}

// ─── LLM fallback via Claude API ─────────────────────────────────────────────

// Called only when heuristics return null. Uses claude-haiku for speed and cost.
// Returns null when the LLM determines the attachment is NOT an insurance policy
// document (e.g. premium receipt, claim form, renewal notice). The caller should
// discard the candidate in that case.
// Falls back to null on any error so we err on the side of fewer false positives.
export async function classifyWithLLM(
  from: string,
  subject: string,
  filename: string,
  snippet: string = ''
): Promise<PolicyType | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const snippetLine = snippet ? `- Email preview: ${snippet.slice(0, 300)}` : ''

  const prompt = `You are reviewing an email to decide whether its PDF attachment is an insurance POLICY DOCUMENT for an Indian user.

Email metadata:
- From: ${from}
- Subject: ${subject}
- Attachment filename: ${filename}
${snippetLine}

Step 1 — Is the attachment a policy document?
A policy document is a policy schedule, e-policy, certificate of insurance, or cover note issued by an insurer.
It is NOT a policy if it is a: premium receipt, payment confirmation, claim form, claim settlement letter, renewal reminder, proposal form, KYC document, or marketing email.

Step 2 — If it IS a policy document, classify it:
- Term   = pure protection life insurance (no savings component)
- Life   = endowment, ULIP, money-back, whole life, savings plan
- Health = mediclaim, family floater, critical illness, super top-up
- Vehicle = car, bike, two-wheeler, commercial vehicle insurance
- Other  = travel, home, gadget, or any other insurance type

Respond with EXACTLY one of these words: Term, Life, Health, Vehicle, Other, Not Insurance
No explanation. Single response only.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    const text = (data.content?.[0]?.text ?? '').trim()
    if (text === 'Not Insurance') return null
    const valid: PolicyType[] = ['Health', 'Life', 'Term', 'Vehicle', 'Other']
    return valid.includes(text as PolicyType) ? (text as PolicyType) : null
  } catch {
    return null
  }
}
