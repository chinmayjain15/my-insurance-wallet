import { cookies } from 'next/headers'
import { STAGING_COOKIE } from '@/lib/constants'
import { AppDataProvider } from '@/components/AppDataProvider'
import BottomNav from '@/components/layout/BottomNav'
import { getUserData } from '@/lib/data'
import { getUserName } from '@/lib/actions/profile'
import { Policy, Contact, SharedPolicy } from '@/types'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get(STAGING_COOKIE)
  const sessionData = session ? JSON.parse(session.value) : null
  const isDemo = sessionData?.isDemo === true

  let initialPolicies: Policy[] = []
  let initialContacts: Contact[] = []
  let initialSharedPolicies: SharedPolicy[] = []
  let userName: string | null = null

  if (!isDemo && sessionData?.email) {
    try {
      const [data, name] = await Promise.all([
        getUserData(sessionData.email),
        getUserName(sessionData.email),
      ])
      initialPolicies = data.policies
      initialContacts = data.contacts
      initialSharedPolicies = data.sharedPolicies
      userName = name
    } catch {
      // Non-fatal: render with empty data
    }
  }

  return (
    <AppDataProvider
      isDemo={isDemo}
      userEmail={sessionData?.email ?? ''}
      userName={userName}
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
