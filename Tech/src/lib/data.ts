import { createServiceClient } from '@/lib/supabase/service'
import { Policy, Contact, SharedPolicy } from '@/types'

export async function getUserData(email: string): Promise<{
  userId: string | null
  policies: Policy[]
  contacts: Contact[]
  sharedPolicies: SharedPolicy[]
}> {
  const supabase = createServiceClient()

  // Run both in parallel — shared-with-me doesn't require a user row
  const [{ data: user }, { data: meAsContact }] = await Promise.all([
    supabase.from('users').select('id').eq('email', email).single(),
    supabase.from('contacts').select('id, owner_id').eq('email', email),
  ])

  // ── Own policies & contacts (only if user row exists) ──────────────────────
  let policies: Policy[] = []
  let contacts: Contact[] = []

  if (user) {
    const [{ data: rawPolicies }, { data: rawContacts }] = await Promise.all([
      supabase
        .from('policies')
        .select('id, name, type, file_url, file_name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('contacts')
        .select('id, name, email, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    // Build sharedWith map: policyId → contactId[]
    const policyIds = (rawPolicies ?? []).map(p => p.id)
    const sharedWithMap: Record<string, string[]> = {}

    if (policyIds.length > 0) {
      const { data: outboundShares } = await supabase
        .from('policy_shares')
        .select('policy_id, contact_id')
        .in('policy_id', policyIds)

      for (const share of outboundShares ?? []) {
        if (!sharedWithMap[share.policy_id]) sharedWithMap[share.policy_id] = []
        sharedWithMap[share.policy_id].push(share.contact_id)
      }
    }

    policies = (rawPolicies ?? []).map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      fileName: p.file_name,
      fileUrl: p.file_url ?? undefined,
      uploadedAt: p.created_at,
      sharedWith: sharedWithMap[p.id] ?? [],
    }))

    contacts = (rawContacts ?? []).map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      addedAt: c.created_at,
    }))
  }

  // ── Shared with me (runs regardless of user row) ───────────────────────────
  let sharedPolicies: SharedPolicy[] = []
  const contactIds = (meAsContact ?? []).map(c => c.id)

  if (contactIds.length > 0) {
    const { data: inboundShares } = await supabase
      .from('policy_shares')
      .select('policy_id')
      .in('contact_id', contactIds)

    const sharedPolicyIds = (inboundShares ?? []).map(s => s.policy_id)

    if (sharedPolicyIds.length > 0) {
      const { data: sharedPoliciesData } = await supabase
        .from('policies')
        .select('id, name, type, file_url, file_name, created_at, user_id')
        .in('id', sharedPolicyIds)

      if ((sharedPoliciesData ?? []).length > 0) {
        const ownerIds = [...new Set((sharedPoliciesData ?? []).map(p => p.user_id))]
        const { data: owners } = await supabase
          .from('users')
          .select('id, email, name')
          .in('id', ownerIds)

        const ownerMap = Object.fromEntries((owners ?? []).map(o => [o.id, o]))

        sharedPolicies = (sharedPoliciesData ?? []).map(p => {
          const owner = ownerMap[p.user_id]
          return {
            id: p.id,
            name: p.name,
            type: p.type,
            fileName: p.file_name,
            fileUrl: p.file_url ?? undefined,
            uploadedAt: p.created_at,
            sharedBy: owner?.name ?? owner?.email ?? '',
            sharedByEmail: owner?.email ?? '',
          }
        })
      }
    }
  }

  return { userId: user?.id ?? null, policies, contacts, sharedPolicies }
}
