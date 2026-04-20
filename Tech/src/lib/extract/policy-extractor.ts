import { createServiceClient } from '@/lib/supabase/service'

// Fields Claude attempts to extract from the policy PDF.
interface ExtractedFields {
  insurer_name: string | null
  policy_number: string | null
  sum_assured: number | null      // rupees, integer
  annual_premium: number | null   // rupees, integer
  policy_start_date: string | null  // YYYY-MM-DD
  expiry_date: string | null        // YYYY-MM-DD
  nominee_name: string | null
}

const EXTRACTION_PROMPT = `You are extracting structured data from an Indian insurance policy PDF.

Return ONLY a valid JSON object with exactly these keys. Use null for any field you cannot find or are not confident about. Do not guess.

{
  "insurer_name": "Name of the insurance company (e.g. HDFC Life, Star Health)",
  "policy_number": "The unique policy/certificate number",
  "sum_assured": 1000000,
  "annual_premium": 12000,
  "policy_start_date": "YYYY-MM-DD",
  "expiry_date": "YYYY-MM-DD",
  "nominee_name": "Name of the nominee/beneficiary"
}

Rules:
- sum_assured and annual_premium must be plain integers in rupees (no commas, no symbols).
- Dates must be in YYYY-MM-DD format. Convert "dd/mm/yyyy" or "dd-MMM-yyyy" accordingly.
- If the document is a premium receipt, claim form, or any non-policy document, return all fields as null.
- Return ONLY the JSON object — no markdown, no explanation.`

// Downloads the PDF bytes for a stored policy file using the service role key.
async function downloadPdfFromStorage(fileUrl: string): Promise<Buffer | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase.storage.from('policies').download(fileUrl)
  if (error || !data) return null
  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// Calls Claude Sonnet with the PDF as a base64 document block.
// Returns parsed fields, or null on any error.
async function callClaudeForExtraction(pdfBuffer: Buffer): Promise<ExtractedFields | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const base64Pdf = pdfBuffer.toString('base64')

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: base64Pdf,
                },
              },
              {
                type: 'text',
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    const text: string = data.content?.[0]?.text ?? ''

    // Strip any accidental markdown fences before parsing
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(cleaned) as ExtractedFields
    return parsed
  } catch {
    return null
  }
}

// Extracts policy details from the stored PDF and writes them to the policy_details table.
// Called after a policy row is inserted (both upload and email import paths).
// Never throws — failures are recorded as extraction_status = 'failed'.
export async function extractAndSavePolicyDetails(
  policyId: string,
  fileUrl: string
): Promise<void> {
  const supabase = createServiceClient()

  // Insert a 'pending' row immediately so the UI can show "extracting…" state.
  await supabase.from('policy_details').upsert(
    { policy_id: policyId, extraction_status: 'pending' },
    { onConflict: 'policy_id' }
  )

  const pdfBuffer = await downloadPdfFromStorage(fileUrl)
  if (!pdfBuffer) {
    await supabase
      .from('policy_details')
      .update({ extraction_status: 'failed', extracted_at: new Date().toISOString() })
      .eq('policy_id', policyId)
    return
  }

  const fields = await callClaudeForExtraction(pdfBuffer)
  if (!fields) {
    await supabase
      .from('policy_details')
      .update({ extraction_status: 'failed', extracted_at: new Date().toISOString() })
      .eq('policy_id', policyId)
    return
  }

  await supabase.from('policy_details').update({
    insurer_name: fields.insurer_name,
    policy_number: fields.policy_number,
    sum_assured: fields.sum_assured,
    annual_premium: fields.annual_premium,
    policy_start_date: fields.policy_start_date,
    expiry_date: fields.expiry_date,
    nominee_name: fields.nominee_name,
    extraction_status: 'completed',
    extracted_at: new Date().toISOString(),
  }).eq('policy_id', policyId)

  // For email-imported policies the name comes from the attachment filename (e.g.
  // "epolicy_89234"). Replace it with a proper insurer-based name if Claude found one.
  // Manual uploads keep the user-typed name unchanged.
  if (fields.insurer_name) {
    const { data: policyRow } = await supabase
      .from('policies')
      .select('source')
      .eq('id', policyId)
      .single()

    if (policyRow?.source === 'email') {
      const betterName = fields.policy_number
        ? `${fields.insurer_name} · ${fields.policy_number}`
        : fields.insurer_name
      await supabase.from('policies').update({ name: betterName }).eq('id', policyId)
    }
  }
}
