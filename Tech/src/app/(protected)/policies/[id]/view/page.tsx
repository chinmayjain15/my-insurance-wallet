import { redirect } from 'next/navigation'
import { getSignedUrl } from '@/lib/actions/policies'
import { getSessionData } from '@/lib/session'
import PolicyViewer from './PolicyViewer'

export default async function ViewPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { isDemo } = await getSessionData()

  if (isDemo) {
    redirect(`/policies/${id}`)
  }

  const { url, error } = await getSignedUrl(id)

  return <PolicyViewer policyId={id} signedUrl={url} error={error} source="my-policy" />
}
