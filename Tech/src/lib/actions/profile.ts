'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import { getSessionEmail } from '@/lib/session'

export async function updateUserName(
  _prevState: { error: string; success: boolean },
  formData: FormData
): Promise<{ error: string; success: boolean }> {
  const name = (formData.get('name') as string)?.trim()

  if (!name) return { error: 'Name is required', success: false }
  if (name.length < 2) return { error: 'Name must be at least 2 characters', success: false }

  const email = await getSessionEmail()
  if (!email) return { error: 'Not authenticated', success: false }

  try {
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('users')
      .update({ name })
      .eq('email', email)

    if (error) return { error: error.message, success: false }
  } catch {
    return { error: 'Failed to update profile', success: false }
  }

  revalidatePath('/profile')
  return { error: '', success: true }
}

export async function getUserName(email: string): Promise<string | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('users')
    .select('name')
    .eq('email', email)
    .single()
  return data?.name ?? null
}
