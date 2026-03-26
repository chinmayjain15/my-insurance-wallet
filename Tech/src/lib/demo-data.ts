import { Policy, Contact, SharedPolicy } from '@/types'

export const DEMO_POLICIES: Policy[] = [
  {
    id: 'policy_health_1',
    name: 'Star Health Family Floater',
    type: 'Health',
    fileName: 'star-health-policy.pdf',
    uploadedAt: '2024-01-15T00:00:00.000Z',
    sharedWith: ['contact_1', 'contact_3'],
  },
  {
    id: 'policy_health_2',
    name: 'HDFC Ergo Health Insurance',
    type: 'Health',
    fileName: 'hdfc-health-policy.pdf',
    uploadedAt: '2024-02-20T00:00:00.000Z',
    sharedWith: ['contact_2'],
  },
  {
    id: 'policy_life_1',
    name: 'LIC Jeevan Anand Policy',
    type: 'Life',
    fileName: 'lic-life-policy.pdf',
    uploadedAt: '2024-01-10T00:00:00.000Z',
    sharedWith: ['contact_3'],
  },
  {
    id: 'policy_term_1',
    name: 'ICICI Prudential Term Plan',
    type: 'Term',
    fileName: 'icici-term-policy.pdf',
    uploadedAt: '2024-03-05T00:00:00.000Z',
    sharedWith: ['contact_1', 'contact_2'],
  },
  {
    id: 'policy_vehicle_1',
    name: 'Car Insurance - Honda City',
    type: 'Vehicle',
    fileName: 'honda-car-insurance.pdf',
    uploadedAt: '2024-02-15T00:00:00.000Z',
    sharedWith: [],
  },
  {
    id: 'policy_vehicle_2',
    name: 'Two-Wheeler Insurance - Royal Enfield',
    type: 'Vehicle',
    fileName: 'bike-insurance.pdf',
    uploadedAt: '2024-01-08T00:00:00.000Z',
    sharedWith: ['contact_1'],
  },
  {
    id: 'policy_other_1',
    name: 'Home Insurance Policy',
    type: 'Other',
    fileName: 'home-insurance.pdf',
    uploadedAt: '2024-01-25T00:00:00.000Z',
    sharedWith: ['contact_3'],
  },
  {
    id: 'policy_other_2',
    name: 'Travel Insurance - Annual',
    type: 'Other',
    fileName: 'travel-insurance.pdf',
    uploadedAt: '2024-03-01T00:00:00.000Z',
    sharedWith: [],
  },
]

export const DEMO_CONTACTS: Contact[] = [
  {
    id: 'contact_1',
    name: 'Priya Sharma',
    phone: '9876543210',
    addedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'contact_2',
    name: 'Rahul Kumar',
    phone: '8765432109',
    addedAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'contact_3',
    name: 'Mom',
    phone: '7654321098',
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
    sharedByPhone: '9876543210',
  },
  {
    id: 'shared_2',
    name: "Mom's Life Insurance Policy",
    type: 'Life',
    fileName: 'mom-life-insurance.pdf',
    uploadedAt: '2023-12-15T00:00:00.000Z',
    sharedBy: 'Mom',
    sharedByPhone: '7654321098',
  },
  {
    id: 'shared_3',
    name: "Rahul's Car Insurance",
    type: 'Vehicle',
    fileName: 'rahul-car-insurance.pdf',
    uploadedAt: '2024-01-20T00:00:00.000Z',
    sharedBy: 'Rahul Kumar',
    sharedByPhone: '8765432109',
  },
]
