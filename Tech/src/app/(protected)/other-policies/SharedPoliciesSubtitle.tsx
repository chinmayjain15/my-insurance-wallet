'use client'

import { useAppData } from '@/components/AppDataProvider'

export default function SharedPoliciesSubtitle() {
  const { sharedPolicies } = useAppData()
  return (
    <p className="text-xs text-muted-foreground">
      {sharedPolicies.length} {sharedPolicies.length === 1 ? 'policy' : 'policies'}
    </p>
  )
}
