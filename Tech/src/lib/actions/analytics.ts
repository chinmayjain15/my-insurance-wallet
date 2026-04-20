'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { getSessionEmail } from '@/lib/session'

export async function logEvent(
  event: string,
  screen: string | null,
  label: string | null,
  props: Record<string, string | boolean | number | null> | null,
  sessionId: string,
) {
  try {
    const supabase = createServiceClient()
    const email = await getSessionEmail()

    let userId: string | null = null
    if (email) {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()
      userId = data?.id ?? null
    }

    await supabase.from('analytics_events').insert({
      user_id: userId,
      session_id: sessionId,
      event,
      screen,
      label,
      props: props && Object.keys(props).length > 0 ? props : null,
    })
  } catch {
    // Never let analytics errors surface to the user
  }
}
