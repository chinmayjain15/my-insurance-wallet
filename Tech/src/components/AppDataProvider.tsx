'use client'

import { createContext, useContext } from 'react'
import { Policy, Contact, SharedPolicy } from '@/types'
import { DEMO_POLICIES, DEMO_CONTACTS, DEMO_SHARED_POLICIES } from '@/lib/demo-data'

interface AppDataContextType {
  policies: Policy[]
  contacts: Contact[]
  sharedPolicies: SharedPolicy[]
  isDemo: boolean
  userPhone: string
  userName: string | null
}

const AppDataContext = createContext<AppDataContextType>({
  policies: [],
  contacts: [],
  sharedPolicies: [],
  isDemo: false,
  userPhone: '',
  userName: null,
})

export function AppDataProvider({
  children,
  isDemo,
  userPhone = '',
  userName = null,
  initialPolicies = [],
  initialContacts = [],
  initialSharedPolicies = [],
}: {
  children: React.ReactNode
  isDemo: boolean
  userPhone?: string
  userName?: string | null
  initialPolicies?: Policy[]
  initialContacts?: Contact[]
  initialSharedPolicies?: SharedPolicy[]
}) {
  const policies       = isDemo ? DEMO_POLICIES        : initialPolicies
  const contacts       = isDemo ? DEMO_CONTACTS        : initialContacts
  const sharedPolicies = isDemo ? DEMO_SHARED_POLICIES : initialSharedPolicies

  return (
    <AppDataContext.Provider value={{ policies, contacts, sharedPolicies, isDemo, userPhone, userName }}>
      {children}
    </AppDataContext.Provider>
  )
}

export const useAppData = () => useContext(AppDataContext)
