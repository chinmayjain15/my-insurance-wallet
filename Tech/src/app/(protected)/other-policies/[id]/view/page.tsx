import { redirect } from 'next/navigation'
import { getSharedPolicySignedUrl } from '@/lib/actions/policies'
import { getSessionData } from '@/lib/session'
import PolicyViewer from '@/app/(protected)/policies/[id]/view/PolicyViewer'

export default async function ViewSharedPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { isDemo } = await getSessionData()

  if (isDemo) {
    redirect(`/other-policies/${id}`)
  }

  const { url, error } = await getSharedPolicySignedUrl(id)

  return <PolicyViewer policyId={id} signedUrl={url} error={error} source="shared-with-me" />
}
