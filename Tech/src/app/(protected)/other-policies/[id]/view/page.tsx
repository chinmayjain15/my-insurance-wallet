import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { STAGING_COOKIE } from '@/lib/constants'
import { getSharedPolicySignedUrl } from '@/lib/actions/policies'
import PolicyViewer from '@/app/(protected)/policies/[id]/view/PolicyViewer'

export default async function ViewSharedPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const session = cookieStore.get(STAGING_COOKIE)
  const isDemo = session ? JSON.parse(session.value).isDemo === true : false

  if (isDemo) {
    redirect(`/other-policies/${id}`)
  }

  const { url, error } = await getSharedPolicySignedUrl(id)

  return <PolicyViewer policyId={id} signedUrl={url} error={error} source="shared-with-me" />
}
