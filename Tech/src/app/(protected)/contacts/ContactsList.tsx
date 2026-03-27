'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, FileText, X, Share2 } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import { useAppData } from '@/components/AppDataProvider'

export default function ContactsList() {
  const { contacts, policies } = useAppData()
  const router = useRouter()

  function handleReferShare() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const appLink = `${baseUrl}?utm_source=referral&utm_medium=whatsapp`
    const message = encodeURIComponent(
      `Hey! I use My Insurance Store to keep all my family's insurance policies organised in one place and share them easily. It's really handy — check it out: ${appLink}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }
  const [filterContactId, setFilterContactId] = useState<string | null>(null)

  const sharedCount = (contactId: string) =>
    policies.filter(p => p.sharedWith.includes(contactId)).length

  const filteredPolicies = filterContactId
    ? policies.filter(p => p.sharedWith.includes(filterContactId))
    : []

  const selectedContact = filterContactId
    ? contacts.find(c => c.id === filterContactId)
    : null

  if (contacts.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-6">
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description="Add trusted family members or friends to share your insurance policies with them."
          action={
            <Link href="/contacts/add" className="bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity inline-block">
              Add Contact
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-6 space-y-4">

      {/* Filter */}
      <div>
        <label className="block mb-2 text-sm text-muted-foreground">
          View policies shared with
        </label>
        <div className="relative">
          <select
            value={filterContactId ?? ''}
            onChange={(e) => setFilterContactId(e.target.value || null)}
            className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none pr-10 transition-colors"
          >
            <option value="">All contacts</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>{contact.name}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▼</div>
        </div>
      </div>

      {/* Filtered policies */}
      {filterContactId && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium text-foreground text-sm">
              Policies shared with {selectedContact?.name}
            </p>
            <button
              onClick={() => setFilterContactId(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {filteredPolicies.length > 0 ? (
            <div className="space-y-2">
              {filteredPolicies.map(policy => (
                <button
                  key={policy.id}
                  onClick={() => router.push(`/policies/${policy.id}`)}
                  className="w-full bg-background border border-border rounded-lg p-3 hover:bg-accent transition-colors text-left flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate text-sm">{policy.name}</p>
                    <p className="text-xs text-muted-foreground">{policy.type}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-3">
              No policies shared with {selectedContact?.name} yet
            </p>
          )}
        </div>
      )}

      {/* Contacts list */}
      <div className="space-y-3">
        {contacts.map(contact => (
          <button
            key={contact.id}
            onClick={() => router.push(`/contacts/${contact.id}`)}
            className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:bg-accent transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-foreground">{contact.name[0].toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{contact.name}</p>
              <p className="text-xs text-muted-foreground">{contact.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sharedCount(contact.id)} {sharedCount(contact.id) === 1 ? 'policy' : 'policies'} shared
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Referral CTA */}
      <button
        onClick={handleReferShare}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center justify-center gap-3">
          <Share2 className="w-5 h-5" />
          <div className="text-left">
            <p className="font-medium">Invite your loved ones</p>
          </div>
        </div>
      </button>

      {/* Privacy note */}
      <div className="bg-accent border border-border rounded-xl p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Privacy note:</strong> Contacts can only view policies you explicitly share with them. They won't see your email address or other personal information.
        </p>
      </div>
    </div>
  )
}
