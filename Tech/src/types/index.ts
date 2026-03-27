export type PolicyType = 'Health' | 'Life' | 'Term' | 'Vehicle' | 'Other'

export interface Policy {
  id: string
  name: string
  type: PolicyType
  fileName: string
  fileUrl?: string
  uploadedAt: string // ISO string
  sharedWith: string[] // contact IDs
}

export interface Contact {
  id: string
  name: string
  email: string
  addedAt: string // ISO string
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
