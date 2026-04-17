import { redirect } from 'next/navigation'
import { getScanCandidates } from '@/lib/actions/gmail-import'
import ImportReviewClient from './ImportReviewClient'

export default async function ImportReviewPage() {
  const { candidates, error } = await getScanCandidates()

  if (error === 'Not authenticated') redirect('/auth')

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">Could not load scan results.</p>
        <p className="text-xs text-red-500 mt-2 font-mono">{error}</p>
      </div>
    )
  }

  if (candidates.length === 0) redirect('/home')

  return <ImportReviewClient candidates={candidates} />
}
