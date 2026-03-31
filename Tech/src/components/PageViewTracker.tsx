'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

export function PageViewTracker({ event }: { event: `view-${string}` }) {
  useEffect(() => { track(event) }, [event])
  return null
}
