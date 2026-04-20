import { AppDataProvider } from '@/components/AppDataProvider'
import { AmplitudeIdentify } from '@/components/AmplitudeIdentify'
import BottomNav from '@/components/layout/BottomNav'
import { getUserData } from '@/lib/data'
import { getUserName } from '@/lib/actions/profile'
import { getSessionData } from '@/lib/session'
import { Policy, Contact, SharedPolicy } from '@/types'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const sessionData = await getSessionData()
  const { email, isDemo } = sessionData

  let initialPolicies: Policy[] = []
  let initialContacts: Contact[] = []
  let initialSharedPolicies: SharedPolicy[] = []
  let userName: string | null = sessionData.name
  let userId: string | null = null

  if (!isDemo && email) {
    try {
      const [data, dbName] = await Promise.all([
        getUserData(email),
        getUserName(email),
      ])
      userId = data.userId
      initialPolicies = data.policies
      initialContacts = data.contacts
      initialSharedPolicies = data.sharedPolicies
      // Prefer DB name (user-set) over OAuth metadata name
      userName = dbName ?? sessionData.name
    } catch {
      // Non-fatal: render with empty data
    }
  }

  return (
    <AppDataProvider
      isDemo={isDemo}
      userId={userId}
      userEmail={email ?? ''}
      userName={userName}
      initialPolicies={initialPolicies}
      initialContacts={initialContacts}
      initialSharedPolicies={initialSharedPolicies}
    >
      <AmplitudeIdentify />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 overflow-y-auto pb-20">{children}</main>
        <BottomNav />
      </div>
    </AppDataProvider>
  )
}
