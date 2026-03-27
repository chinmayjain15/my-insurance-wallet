import { cookies } from 'next/headers'
import { STAGING_COOKIE } from '@/lib/constants'
import { getUserName } from '@/lib/actions/profile'
import BackButton from '@/components/ui/BackButton'
import ProfileEditor from './ProfileEditor'

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const session = cookieStore.get(STAGING_COOKIE)
  const sessionData = session ? JSON.parse(session.value) : null
  const email: string = sessionData?.email ?? ''

  const name = email ? await getUserName(email) : null

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <BackButton />
          <h1 className="text-foreground">My Profile</h1>
          <div className="w-9" />
        </div>
      </div>
      <ProfileEditor initialName={name} email={email} />
    </div>
  )
}
