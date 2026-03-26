import { cookies } from 'next/headers'
import { STAGING_COOKIE } from '@/lib/constants'
import { AppDataProvider } from '@/components/AppDataProvider'
import BottomNav from '@/components/layout/BottomNav'
import { getUserData } from '@/lib/data'
import { Policy, Contact, SharedPolicy } from '@/types'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get(STAGING_COOKIE)
  const sessionData = session ? JSON.parse(session.value) : null
  const isDemo = sessionData?.isDemo === true

  let initialPolicies: Policy[] = []
  let initialContacts: Contact[] = []
  let initialSharedPolicies: SharedPolicy[] = []

  if (!isDemo && sessionData?.phone) {
    try {
      const data = await getUserData(sessionData.phone)
      initialPolicies = data.policies
      initialContacts = data.contacts
      initialSharedPolicies = data.sharedPolicies
    } catch {
      // Non-fatal: render with empty data
    }
  }

  return (
    <AppDataProvider
      isDemo={isDemo}
      userPhone={sessionData?.phone ?? ''}
      initialPolicies={initialPolicies}
      initialContacts={initialContacts}
      initialSharedPolicies={initialSharedPolicies}
    >
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto pb-20">{children}</main>
        <BottomNav />
      </div>
    </AppDataProvider>
  )
}
