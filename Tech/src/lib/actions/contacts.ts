'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { STAGING_COOKIE } from '@/lib/constants'
import { createServiceClient } from '@/lib/supabase/service'

async function getUserId(phone: string): Promise<string | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('phone', phone)
    .single()
  return data?.id ?? null
}

export async function addContact(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const name     = (formData.get('name') as string)?.trim()
  const phone    = (formData.get('phone') as string)?.trim()
  const returnTo = (formData.get('returnTo') as string)?.trim() || '/contacts'

  if (!name)                         return { error: 'Name is required' }
  if (!phone || phone.length !== 10) return { error: 'Enter a valid 10-digit mobile number' }
  if (!/^\d{10}$/.test(phone))       return { error: 'Phone number must be digits only' }

  const cookieStore = await cookies()
  const session = cookieStore.get(STAGING_COOKIE)
  if (!session) return { error: 'Not authenticated' }

  const { phone: ownerPhone } = JSON.parse(session.value)

  try {
    const supabase = createServiceClient()
    const ownerId = await getUserId(ownerPhone)
    if (!ownerId) return { error: 'User not found. Please sign in again.' }

    const { error } = await supabase
      .from('contacts')
      .insert({ owner_id: ownerId, name, phone })

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

  const { phone } = JSON.parse(session.value)

  try {
    const supabase = createServiceClient()
    const ownerId = await getUserId(phone)
    if (!ownerId) return { error: 'User not found' }

    // Verify this contact belongs to the user
    const { data: contact } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', contactId)
      .eq('owner_id', ownerId)
      .single()
    if (!contact) return { error: 'Contact not found' }

    // Revoke all shared policy access for this contact
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
