import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { STAGING_COOKIE } from '@/lib/constants'
import { getSignedUrl } from '@/lib/actions/policies'
import PolicyViewer from './PolicyViewer'

export default async function ViewPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const session = cookieStore.get(STAGING_COOKIE)
  const isDemo = session ? JSON.parse(session.value).isDemo === true : false

  if (isDemo) {
    redirect(`/policies/${id}`)
  }

  const { url, error } = await getSignedUrl(id)

  return <PolicyViewer policyId={id} signedUrl={url} error={error} source="my-policy" />
}
