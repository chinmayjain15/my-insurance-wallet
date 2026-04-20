export type PolicyType = 'Health' | 'Life' | 'Term' | 'Vehicle' | 'Other'

export interface Policy {
  id: string
  name: string
  type: PolicyType
  fileName: string
  fileUrl?: string
  uploadedAt: string // ISO string
  sharedWith: string[] // contact IDs
  source: 'upload' | 'email'
  details: PolicyDetails | null
}

export interface Contact {
  id: string
  name: string
  email: string
  addedAt: string // ISO string
}

export interface PolicyDetails {
  id: string
  policyId: string
  insurerName: string | null
  policyNumber: string | null
  sumAssured: number | null        // rupees
  annualPremium: number | null     // rupees
  policyStartDate: string | null   // YYYY-MM-DD
  expiryDate: string | null        // YYYY-MM-DD
  nomineeName: string | null
  extractionStatus: 'pending' | 'completed' | 'failed'
  extractedAt: string
}

export interface SharedPolicy {
  id: string
  name: string
  type: PolicyType
  fileName: string
  fileUrl?: string
  uploadedAt: string
  sharedBy: string
  sharedByEmail: string
}
