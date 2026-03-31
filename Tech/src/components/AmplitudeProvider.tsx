'use client'

import { useEffect } from 'react'
import { initAmplitude, initMixpanel } from '@/lib/analytics'

export function AmplitudeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const amplitudeKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY
    if (amplitudeKey) initAmplitude(amplitudeKey)

    const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
    if (mixpanelToken) initMixpanel(mixpanelToken)
  }, [])

  return <>{children}</>
}
