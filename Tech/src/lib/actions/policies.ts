'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import { extractAndSavePolicyDetails } from '@/lib/extract/policy-extractor'
import { getSessionEmail } from '@/lib/session'

const VALID_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']

// Get or create a user row by email address. Returns the user ID.
async function getOrCreateUser(email: string): Promise<string> {
  const supabase = createServiceClient()

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('users')
    .insert({ email, consent_given: true, consent_given_at: new Date().toISOString() })
    .select('id')
    .single()

  if (error || !created) throw new Error(`Failed to create user: ${error?.message}`)
  return created.id
}

export async function uploadPolicy(
  _prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const name = (formData.get('name') as string)?.trim()
  const type = formData.get('type') as string
  const file = formData.get('file') as File

  if (!name)                           return { error: 'Policy name is required' }
  if (!type)                           return { error: 'Policy type is required' }
  if (!file || file.size === 0)        return { error: 'Please select a file' }
  if (!VALID_TYPES.includes(file.type)) return { error: 'Only PDF, JPG, or PNG files are allowed' }
  if (file.size > 10 * 1024 * 1024)   return { error: 'File must be under 10 MB' }

  const email = await getSessionEmail()
  if (!email) return { error: 'Not authenticated' }

  try {
    const supabase = createServiceClient()
    const userId = await getOrCreateUser(email)

    // Build a unique storage path: {userId}/{timestamp}-{random}.{ext}
    const ext = file.name.split('.').pop() ?? 'pdf'
    const storagePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('policies')
      .upload(storagePath, file, { contentType: file.type, upsert: false })

    if (uploadError) return { error: `Storage upload failed: ${uploadError.message}` }

    const { data: policyData, error: dbError } = await supabase
      .from('policies')
      .insert({
        user_id: userId,
        name,
        type,
        file_url: storagePath,   // store path, generate signed URL on demand
        file_name: file.name,
        file_size_bytes: file.size,
      })
      .select('id')
      .single()

    if (dbError) return { error: `Failed to save policy: ${dbError.message}` }

    // Kick off AI extraction — fire and forget, never blocks the redirect.
    // Failures are recorded in policy_details.extraction_status = 'failed'.
    if (policyData?.id) {
      extractAndSavePolicyDetails(policyData.id, storagePath).catch(() => {})
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unexpected error' }
  }

  revalidatePath('/', 'layout')
  redirect('/policies?uploaded=1')
}

async function getOwnerUserId(email: string): Promise<string | null> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('users').select('id').eq('email', email).single()
  return data?.id ?? null
}

export async function sharePolicy(policyId: string, contactId: string): Promise<{ error: string }> {
  const email = await getSessionEmail()
  if (!email) return { error: 'Not authenticated' }

  try {
    const supabase = createServiceClient()
    const userId = await getOwnerUserId(email)
    if (!userId) return { error: 'User not found' }

    // Verify the policy belongs to this user
    const { data: policy } = await supabase
      .from('policies')
      .select('id')
      .eq('id', policyId)
      .eq('user_id', userId)
      .single()
    if (!policy) return { error: 'Policy not found' }

    const { error } = await supabase
      .from('policy_shares')
      .insert({ policy_id: policyId, contact_id: contactId })

    if (error) {
      if (error.code === '23505') return { error: '' } // already shared — treat as success
      return { error: `Failed to share: ${error.message}` }
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unexpected error' }
  }

  revalidatePath('/', 'layout')
  return { error: '' }
}

export async function getSignedUrl(policyId: string): Promise<{ url: string; error: string }> {
  const email = await getSessionEmail()
  if (!email) return { url: '', error: 'Not authenticated' }

  try {
    const supabase = createServiceClient()
    const userId = await getOwnerUserId(email)
    if (!userId) return { url: '', error: 'User not found' }

    const { data: policy } = await supabase
      .from('policies')
      .select('file_url')
      .eq('id', policyId)
      .eq('user_id', userId)
      .single()

    if (!policy?.file_url) return { url: '', error: 'Document not found' }

    const { data, error } = await supabase.storage
      .from('policies')
      .createSignedUrl(policy.file_url, 3600) // 1 hour

    if (error || !data) return { url: '', error: 'Could not generate document link' }

    return { url: data.signedUrl, error: '' }
  } catch (err) {
    return { url: '', error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}

export async function deletePolicy(policyId: string): Promise<{ error: string }> {
  const email = await getSessionEmail()
  if (!email) return { error: 'Not authenticated' }

  try {
    const supabase = createServiceClient()
    const userId = await getOwnerUserId(email)
    if (!userId) return { error: 'User not found' }

    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', policyId)
      .eq('user_id', userId)

    if (error) return { error: `Failed to delete: ${error.message}` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unexpected error' }
  }

  revalidatePath('/', 'layout')
  return { error: '' }
}

export async function updatePolicyName(policyId: string, name: string): Promise<{ error: string }> {
  const trimmed = name.trim()
  if (!trimmed) return { error: 'Name is required' }

  const email = await getSessionEmail()
  if (!email) return { error: 'Not authenticated' }

  try {
    const supabase = createServiceClient()
    const userId = await getOwnerUserId(email)
    if (!userId) return { error: 'User not found' }

    const { error } = await supabase
      .from('policies')
      .update({ name: trimmed })
      .eq('id', policyId)
      .eq('user_id', userId)

    if (error) return { error: `Failed to update: ${error.message}` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unexpected error' }
  }

  revalidatePath('/', 'layout')
  return { error: '' }
}

export async function getSharedPolicySignedUrl(policyId: string): Promise<{ url: string; error: string }> {
  const email = await getSessionEmail()
  if (!email) return { url: '', error: 'Not authenticated' }

  try {
    const supabase = createServiceClient()

    // Find all contact entries for this email address
    const { data: meAsContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('email', email)

    const contactIds = (meAsContact ?? []).map(c => c.id)
    if (contactIds.length === 0) return { url: '', error: 'No access to this policy' }

    // Verify this policy was shared with one of our contact entries
    const { data: share } = await supabase
      .from('policy_shares')
      .select('policy_id')
      .eq('policy_id', policyId)
      .in('contact_id', contactIds)
      .single()

    if (!share) return { url: '', error: 'No access to this policy' }

    const { data: policy } = await supabase
      .from('policies')
      .select('file_url')
      .eq('id', policyId)
      .single()

    if (!policy?.file_url) return { url: '', error: 'Document not found' }

    const { data, error } = await supabase.storage
      .from('policies')
      .createSignedUrl(policy.file_url, 3600)

    if (error || !data) return { url: '', error: 'Could not generate document link' }

    return { url: data.signedUrl, error: '' }
  } catch (err) {
    return { url: '', error: err instanceof Error ? err.message : 'Unexpected error' }
  }
}

export async function unsharePolicy(policyId: string, contactId: string): Promise<{ error: string }> {
  const email = await getSessionEmail()
  if (!email) return { error: 'Not authenticated' }

  try {
    const supabase = createServiceClient()
    const userId = await getOwnerUserId(email)
    if (!userId) return { error: 'User not found' }

    // Verify the policy belongs to this user
    const { data: policy } = await supabase
      .from('policies')
      .select('id')
      .eq('id', policyId)
      .eq('user_id', userId)
      .single()
    if (!policy) return { error: 'Policy not found' }

    await supabase
      .from('policy_shares')
      .delete()
      .eq('policy_id', policyId)
      .eq('contact_id', contactId)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unexpected error' }
  }

  revalidatePath('/', 'layout')
  return { error: '' }
}
