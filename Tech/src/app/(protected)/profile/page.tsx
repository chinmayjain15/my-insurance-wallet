import { getUserName } from '@/lib/actions/profile'
import { getSessionData } from '@/lib/session'
import BackButton from '@/components/ui/BackButton'
import ProfileEditor from './ProfileEditor'
import { PageViewTracker } from '@/components/PageViewTracker'

export default async function ProfilePage() {
  const { email } = await getSessionData()
  const name = email ? await getUserName(email) : null

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <BackButton screen="my-profile" />
          <h1 className="text-foreground">My Profile</h1>
          <div className="w-9" />
        </div>
      </div>
      <PageViewTracker event="view-my-profile" />
      <ProfileEditor initialName={name} email={email ?? ''} />
    </div>
  )
}
