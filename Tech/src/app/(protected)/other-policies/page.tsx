import { cookies } from 'next/headers'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { STAGING_COOKIE } from '@/lib/constants'
import SharedPoliciesList from './SharedPoliciesList'
import ReferAFriend from './ReferAFriend'

export default async function OtherPoliciesPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get(STAGING_COOKIE)
  const sessionData = session ? JSON.parse(session.value) : null

  // Use name if available, fall back to phone number
  const referrer: string = sessionData?.name ?? sessionData?.phone ?? 'friend'

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/home"
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg text-foreground">Shared with Me</h1>
          <div className="w-9" />
        </div>
      </div>
      <SharedPoliciesList />

      {/* Refer a Friend */}
      <div className="max-w-lg mx-auto px-6 pb-6">
        <ReferAFriend referrer={referrer} />
      </div>
    </div>
  )
}
