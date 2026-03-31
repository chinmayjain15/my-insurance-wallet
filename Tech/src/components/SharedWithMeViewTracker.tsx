'use client'

import { useEffect } from 'react'
import { useAppData } from '@/components/AppDataProvider'
import { track } from '@/lib/analytics'

export function SharedWithMeViewTracker() {
  const { sharedPolicies } = useAppData()

  useEffect(() => {
    track('view-shared-with-me', { label: sharedPolicies.length === 0 ? '0-state' : 'non-0-state' })
  }, [])

  return null
}
