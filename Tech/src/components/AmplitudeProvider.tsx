'use client'

import { useEffect } from 'react'
import { initAmplitude, initMixpanel, initPostHog, initRudderStack } from '@/lib/analytics'

export function AmplitudeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const amplitudeKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY
    if (amplitudeKey) initAmplitude(amplitudeKey)

    const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
    if (mixpanelToken) initMixpanel(mixpanelToken)

    const rudderWriteKey = process.env.NEXT_PUBLIC_RUDDERSTACK_WRITE_KEY
    const rudderDataPlaneUrl = process.env.NEXT_PUBLIC_RUDDERSTACK_DATA_PLANE_URL
    if (rudderWriteKey && rudderDataPlaneUrl) initRudderStack(rudderWriteKey, rudderDataPlaneUrl)

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'
    if (posthogKey) initPostHog(posthogKey, posthogHost)
  }, [])

  return <>{children}</>
}
