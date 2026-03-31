'use client'

import { useEffect, useRef } from 'react'
import { track } from '@/lib/analytics'

export function PageViewTracker({ event }: { event: `view-${string}` }) {
  const tracked = useRef(false)
  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    track(event)
  }, [event])
  return null
}
