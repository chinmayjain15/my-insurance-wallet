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

function hits(text: string, senderDomain: string, signals: Signals): boolean {
  if (signals.domains.some(d => senderDomain.endsWith(d))) return true
  return signals.keywords.some(kw => text.includes(kw))
}

export function classifyByHeuristics(
  from: string,
  subject: string,
  filename: string
): PolicyType | null {
  const senderDomain = extractSenderEmail(from).split('@')[1] ?? ''
  const text = `${subject} ${filename}`.toLowerCase()

  // Check Term before Life (Term is a more-specific subset of Life)
  if (hits(text, senderDomain, TERM_SIGNALS)) return 'Term'
  if (hits(text, senderDomain, LIFE_SIGNALS)) return 'Life'
  if (hits(text, senderDomain, HEALTH_SIGNALS)) return 'Health'
  if (hits(text, senderDomain, VEHICLE_SIGNALS)) return 'Vehicle'

  return null
}

// ─── LLM fallback via Claude API ─────────────────────────────────────────────

// Called only when heuristics return null. Uses claude-haiku for speed and cost.
// Falls back to 'Other' on any error (network, missing API key, unexpected response).
export async function classifyWithLLM(
  from: string,
  subject: string,
  filename: string
): Promise<PolicyType> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return 'Other'

  const prompt = `You are classifying an insurance policy email for an Indian user.

Email metadata:
- From: ${from}
- Subject: ${subject}
- Attachment filename: ${filename}

Classify into exactly one of: Health, Life, Term, Vehicle, Other

Definitions:
- Term = pure protection life insurance (no savings)
- Life = endowment, ULIP, money-back, whole life
- Health = mediclaim, family floater, critical illness
- Vehicle = car, bike, commercial vehicle
- Other = travel, home, gadget, or anything else

Respond with a single word only.`

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

    if (!res.ok) return 'Other'

    const data = await res.json()
    const text = (data.content?.[0]?.text ?? '').trim()
    const valid: PolicyType[] = ['Health', 'Life', 'Term', 'Vehicle', 'Other']
    return valid.includes(text as PolicyType) ? (text as PolicyType) : 'Other'
  } catch {
    return 'Other'
  }
}
