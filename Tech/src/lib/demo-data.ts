import { Policy, PolicyDetails, Contact, SharedPolicy } from '@/types'

// ── Demo policy_details ────────────────────────────────────────────────────────

const demoDetails: Record<string, PolicyDetails> = {
  policy_health_1: {
    id: 'det_h1', policyId: 'policy_health_1',
    insurerName: 'Star Health and Allied Insurance', policyNumber: 'P/211222/01/2024/003456',
    sumAssured: 1000000, annualPremium: 14500,
    policyStartDate: '2025-05-10', expiryDate: '2026-05-09',   // expiring in ~22 days
    nomineeName: 'Priya Jain',
    extractionStatus: 'completed', extractedAt: '2025-05-10T10:00:00.000Z',
  },
  policy_health_2: {
    id: 'det_h2', policyId: 'policy_health_2',
    insurerName: 'HDFC ERGO General Insurance', policyNumber: '2311200123456',
    sumAssured: 500000, annualPremium: 8200,
    policyStartDate: '2025-04-25', expiryDate: '2026-04-24',   // expiring in ~7 days
    nomineeName: null,
    extractionStatus: 'completed', extractedAt: '2025-04-25T10:00:00.000Z',
  },
  policy_life_1: {
    id: 'det_l1', policyId: 'policy_life_1',
    insurerName: 'LIC of India', policyNumber: '123456789',
    sumAssured: 5000000, annualPremium: 45000,
    policyStartDate: '2020-01-10', expiryDate: '2040-01-09',
    nomineeName: 'Sunita Jain',
    extractionStatus: 'completed', extractedAt: '2024-01-10T10:00:00.000Z',
  },
  policy_term_1: {
    id: 'det_t1', policyId: 'policy_term_1',
    insurerName: 'ICICI Prudential Life Insurance', policyNumber: '07123456',
    sumAssured: 10000000, annualPremium: 11800,
    policyStartDate: '2024-03-05', expiryDate: '2054-03-04',
    nomineeName: 'Priya Jain',
    extractionStatus: 'completed', extractedAt: '2024-03-05T10:00:00.000Z',
  },
  policy_vehicle_1: {
    id: 'det_v1', policyId: 'policy_vehicle_1',
    insurerName: 'HDFC ERGO General Insurance', policyNumber: '2808200234567',
    sumAssured: null, annualPremium: 9500,
    policyStartDate: '2025-06-15', expiryDate: '2026-06-14',   // ~58 days away
    nomineeName: null,
    extractionStatus: 'completed', extractedAt: '2025-06-15T10:00:00.000Z',
  },
  policy_vehicle_2: {
    id: 'det_v2', policyId: 'policy_vehicle_2',
    insurerName: null, policyNumber: null,
    sumAssured: null, annualPremium: null,
    policyStartDate: null, expiryDate: null,
    nomineeName: null,
    extractionStatus: 'failed', extractedAt: '2024-01-08T10:00:00.000Z',
  },
}

export const DEMO_POLICIES: Policy[] = [
  {
    id: 'policy_health_1',
    name: 'Star Health Family Floater',
    type: 'Health',
    fileName: 'star-health-policy.pdf',
    uploadedAt: '2024-01-15T00:00:00.000Z',
    sharedWith: ['contact_1', 'contact_3'],
    source: 'upload',
    details: demoDetails.policy_health_1,
  },
  {
    id: 'policy_health_2',
    name: 'HDFC Ergo Health Insurance',
    type: 'Health',
    fileName: 'hdfc-health-policy.pdf',
    uploadedAt: '2024-02-20T00:00:00.000Z',
    sharedWith: ['contact_2'],
    source: 'upload',
    details: demoDetails.policy_health_2,
  },
  {
    id: 'policy_life_1',
    name: 'LIC Jeevan Anand Policy',
    type: 'Life',
    fileName: 'lic-life-policy.pdf',
    uploadedAt: '2024-01-10T00:00:00.000Z',
    sharedWith: ['contact_1'],
    source: 'upload',
    details: demoDetails.policy_life_1,
  },
  {
    id: 'policy_term_1',
    name: 'ICICI Prudential Term Plan',
    type: 'Term',
    fileName: 'icici-term-policy.pdf',
    uploadedAt: '2024-03-05T00:00:00.000Z',
    sharedWith: [],
    source: 'upload',
    details: demoDetails.policy_term_1,
  },
  {
    id: 'policy_vehicle_1',
    name: 'Car Insurance - Honda City',
    type: 'Vehicle',
    fileName: 'honda-car-insurance.pdf',
    uploadedAt: '2024-02-15T00:00:00.000Z',
    sharedWith: [],
    source: 'upload',
    details: demoDetails.policy_vehicle_1,
  },
  {
    id: 'policy_vehicle_2',
    name: 'Two-Wheeler Insurance - Royal Enfield',
    type: 'Vehicle',
    fileName: 'bike-insurance.pdf',
    uploadedAt: '2024-01-08T00:00:00.000Z',
    sharedWith: ['contact_2'],
    source: 'upload',
    details: demoDetails.policy_vehicle_2,
  },
  {
    id: 'policy_other_1',
    name: 'Home Insurance Policy',
    type: 'Other',
    fileName: 'home-insurance.pdf',
    uploadedAt: '2024-01-25T00:00:00.000Z',
    sharedWith: [],
    source: 'upload',
    details: null,
  },
  {
    id: 'policy_other_2',
    name: 'Travel Insurance - Annual',
    type: 'Other',
    fileName: 'travel-insurance.pdf',
    uploadedAt: '2024-03-01T00:00:00.000Z',
    sharedWith: [],
    source: 'upload',
    details: null,
  },
]

export const DEMO_CONTACTS: Contact[] = [
  {
    id: 'contact_1',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    addedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'contact_2',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@example.com',
    addedAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'contact_3',
    name: 'Mom',
    email: 'mom@example.com',
    addedAt: '2024-01-20T00:00:00.000Z',
  },
]

export const DEMO_SHARED_POLICIES: SharedPolicy[] = [
  {
    id: 'shared_1',
    name: "Priya's Health Insurance",
    type: 'Health',
    fileName: 'priya-health-insurance.pdf',
    uploadedAt: '2024-02-10T00:00:00.000Z',
    sharedBy: 'Priya Sharma',
    sharedByEmail: 'priya.sharma@example.com',
  },
  {
    id: 'shared_2',
    name: "Mom's Life Insurance Policy",
    type: 'Life',
    fileName: 'mom-life-insurance.pdf',
    uploadedAt: '2023-12-15T00:00:00.000Z',
    sharedBy: 'Mom',
    sharedByEmail: 'mom@example.com',
  },
  {
    id: 'shared_3',
    name: "Rahul's Car Insurance",
    type: 'Vehicle',
    fileName: 'rahul-car-insurance.pdf',
    uploadedAt: '2024-01-20T00:00:00.000Z',
    sharedBy: 'Rahul Kumar',
    sharedByEmail: 'rahul.kumar@example.com',
  },
]
