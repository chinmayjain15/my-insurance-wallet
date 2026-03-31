'use client'

import { useEffect, useRef } from 'react'
import { useAppData } from '@/components/AppDataProvider'
import { identify } from '@/lib/analytics'

// Placed inside AppDataProvider in the protected layout.
// Identifies the user in Amplitude once session data is available.
export function AmplitudeIdentify() {
  const { userId, userEmail, isDemo, userName } = useAppData()
  const identified = useRef(false)

  useEffect(() => {
    if (identified.current) return
    if (isDemo) {
      identified.current = true
      identify('demo_user', { 'is-demo': true })
    } else if (userId) {
      identified.current = true
      identify(userId, {
        email: userEmail,
        ...(userName ? { name: userName } : {}),
        'is-demo': false,
      })
    }
  }, [userId, userEmail, isDemo, userName])

  return null
}
