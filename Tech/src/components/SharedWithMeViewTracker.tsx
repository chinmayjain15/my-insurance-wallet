'use client'

import { useEffect, useRef } from 'react'
import { useAppData } from '@/components/AppDataProvider'
import { track } from '@/lib/analytics'

export function SharedWithMeViewTracker() {
  const { sharedPolicies } = useAppData()
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    track('view-shared-with-me', { label: sharedPolicies.length === 0 ? '0-state' : 'non-0-state' })
  }, [])

  return null
}
