'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { STAGING_COOKIE } from '@/lib/constants'
import { createServiceClient } from '@/lib/supabase/service'

async function getOrCreateUser(email: string): Promise<string | null> {
  const supabase = createServiceClient()
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()
  if (existing) return existing.id

  const { data: created } = await supabase
    .from('users')
    .insert({ email, consent_given: true, consent_given_at: new Date().toISOString() })
    .select('id')
    .single()
  return created?.id ?? null
}

export async function addContact(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const name     = (formData.get('name') as string)?.trim()
  const email    = (formData.get('email') as string)?.trim().toLowerCase()
  const returnTo = (formData.get('returnTo') as string)?.trim() || '/contacts'

  if (!name) return { error: 'Name is required' }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address' }
  }

  const cookieStore = await cookies()
  const session = cookieStore.get(STAGING_COOKIE)
  if (!session) return { error: 'Not authenticated' }

  const { email: ownerEmail } = JSON.parse(session.value)

  try {
    const supabase = createServiceClient()
    const ownerId = await getOrCreateUser(ownerEmail)
    if (!ownerId) return { error: 'User not found. Please sign in again.' }

    const { error } = await supabase
      .from('contacts')
      .insert({ owner_id: ownerId, name, email })

    if (error) {
      if (error.code === '23505') return { error: 'This contact already exists' }
      return { error: `Failed to add contact: ${error.message}` }
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unexpected error' }
  }

  revalidatePath('/', 'layout')
  redirect(returnTo)
}

export async function deleteContact(contactId: string): Promise<{ error: string }> {
  const cookieStore = await cookies()
  const session = cookieStore.get(STAGING_COOKIE)
  if (!session) return { error: 'Not authenticated' }

  const { email } = JSON.parse(session.value)

  try {
    const supabase = createServiceClient()
    const ownerId = await getOrCreateUser(email)
    if (!ownerId) return { error: 'User not found' }

    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', contactId)
      .eq('owner_id', ownerId)
      .single()
    if (!contact) return { error: 'Contact not found' }

    await supabase.from('policy_shares').delete().eq('contact_id', contactId)

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId)
      .eq('owner_id', ownerId)

    if (error) return { error: `Failed to remove contact: ${error.message}` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unexpected error' }
  }

  revalidatePath('/', 'layout')
  return { error: '' }
}
