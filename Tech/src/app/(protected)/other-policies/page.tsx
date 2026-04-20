import SharedPoliciesList from './SharedPoliciesList'
import SharedPoliciesSubtitle from './SharedPoliciesSubtitle'
import ReferAFriend from './ReferAFriend'
import { SharedWithMeViewTracker } from '@/components/SharedWithMeViewTracker'
import BackButton from '@/components/ui/BackButton'
import { getSessionData } from '@/lib/session'

export default async function OtherPoliciesPage() {
  const { name, email } = await getSessionData()
  const referrer: string = name ?? email ?? 'friend'

  return (
    <div className="min-h-screen pb-40">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <BackButton screen="shared-with-me" />
          <div className="text-center">
            <h1 className="text-lg text-foreground">Shared with Me</h1>
            <SharedPoliciesSubtitle />
          </div>
          <div className="w-9" />
        </div>
      </div>

      <SharedWithMeViewTracker />
      <SharedPoliciesList />

      {/* Refer a Friend — fixed above nav */}
      <div className="fixed bottom-20 left-0 right-0 px-6 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-8 z-40">
        <div className="max-w-lg mx-auto">
          <ReferAFriend referrer={referrer} />
        </div>
      </div>
    </div>
  )
}
