'use client'

import { useEffect } from 'react'
import { useAppData } from '@/components/AppDataProvider'
import { identify } from '@/lib/analytics'

// Placed inside AppDataProvider in the protected layout.
// Identifies the user in Amplitude once session data is available.
export function AmplitudeIdentify() {
  const { userEmail, isDemo, userName } = useAppData()

  useEffect(() => {
    if (isDemo) {
      identify('demo_user', { 'is-demo': true })
    } else if (userEmail) {
      identify(userEmail, {
        email: userEmail,
        ...(userName ? { name: userName } : {}),
        'is-demo': false,
      })
    }
  }, [userEmail, isDemo, userName])

  return null
}
