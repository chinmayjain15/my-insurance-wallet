import AddContactForm from './AddContactForm'

export default async function AddContactPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const { returnTo } = await searchParams
  return <AddContactForm returnTo={returnTo ?? '/contacts'} />
}
