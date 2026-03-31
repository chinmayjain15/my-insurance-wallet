'use client'

import { createContext, useContext } from 'react'
import { Policy, Contact, SharedPolicy } from '@/types'
import { DEMO_POLICIES, DEMO_CONTACTS, DEMO_SHARED_POLICIES } from '@/lib/demo-data'

interface AppDataContextType {
  policies: Policy[]
  contacts: Contact[]
  sharedPolicies: SharedPolicy[]
  isDemo: boolean
  userId: string | null
  userEmail: string
  userName: string | null
}

const AppDataContext = createContext<AppDataContextType>({
  policies: [],
  contacts: [],
  sharedPolicies: [],
  isDemo: false,
  userId: null,
  userEmail: '',
  userName: null,
})

export function AppDataProvider({
  children,
  isDemo,
  userId = null,
  userEmail = '',
  userName = null,
  initialPolicies = [],
  initialContacts = [],
  initialSharedPolicies = [],
}: {
  children: React.ReactNode
  isDemo: boolean
  userId?: string | null
  userEmail?: string
  userName?: string | null
  initialPolicies?: Policy[]
  initialContacts?: Contact[]
  initialSharedPolicies?: SharedPolicy[]
}) {
  const policies       = isDemo ? DEMO_POLICIES        : initialPolicies
  const contacts       = isDemo ? DEMO_CONTACTS        : initialContacts
  const sharedPolicies = isDemo ? DEMO_SHARED_POLICIES : initialSharedPolicies

  return (
    <AppDataContext.Provider value={{ policies, contacts, sharedPolicies, isDemo, userId, userEmail, userName }}>
      {children}
    </AppDataContext.Provider>
  )
}

export const useAppData = () => useContext(AppDataContext)
