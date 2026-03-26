import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { STAGING_COOKIE } from '@/lib/constants'
import { getSignedUrl } from '@/lib/actions/policies'
import PolicyViewer from './PolicyViewer'

export default async function ViewPolicyPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const session = cookieStore.get(STAGING_COOKIE)
  const isDemo = session ? JSON.parse(session.value).isDemo === true : false

  if (isDemo) {
    redirect(`/policies/${params.id}`)
  }

  const { url, error } = await getSignedUrl(params.id)

  return <PolicyViewer policyId={params.id} signedUrl={url} error={error} />
}
