'use client'

import { useEffect } from 'react'
import { initAmplitude } from '@/lib/analytics'

export function AmplitudeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY
    if (apiKey) initAmplitude(apiKey)
  }, [])

  return <>{children}</>
}
