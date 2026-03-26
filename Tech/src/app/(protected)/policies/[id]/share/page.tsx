'use client'

import { useState, useTransition, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Users, Loader2 } from 'lucide-react'
import { useAppData } from '@/components/AppDataProvider'
import { sharePolicy, unsharePolicy } from '@/lib/actions/policies'
import EmptyState from '@/components/ui/EmptyState'
import Link from 'next/link'

export default function SharePolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { policies, contacts, isDemo } = useAppData()
  const [isPending, startTransition] = useTransition()

  const policy = policies.find(p => p.id === id)

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(policy?.sharedWith ?? [])
  )

  if (!policy) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Policy not found</p>
          <Link href="/policies" className="text-primary text-sm hover:underline">Back to policies</Link>
        </div>
      </div>
    )
  }

  const originallyShared = new Set(policy.sharedWith)

  function toggleContact(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleConfirm() {
    if (isDemo || !policy) { router.back(); return }
    startTransition(async () => {
      for (const id of selected) {
        if (!originallyShared.has(id)) await sharePolicy(policy.id, id)
      }
      for (const id of originallyShared) {
        if (!selected.has(id)) await unsharePolicy(policy.id, id)
      }
      router.push(`/policies/${policy.id}`)
      router.refresh()
    })
  }

  // Build CTA label
  const newlySelected = contacts.filter(c => selected.has(c.id) && !originallyShared.has(c.id))
  const totalSelected = contacts.filter(c => selected.has(c.id))

  let ctaLabel = 'Select contacts to share'
  if (selected.size > 0) {
    if (newlySelected.length === 1 && selected.size === 1) {
      ctaLabel = `Share with ${newlySelected[0].name}`
    } else if (newlySelected.length === 1) {
      ctaLabel = `Share with ${newlySelected[0].name}`
    } else if (newlySelected.length > 1) {
      ctaLabel = `Share with ${newlySelected.length} contacts`
    } else {
      // Only previously shared contacts selected — no new shares, just managing
      ctaLabel = totalSelected.length === 1
        ? `Update sharing with ${totalSelected[0].name}`
        : `Update sharing with ${totalSelected.length} contacts`
    }
  }

  const hasChanges = [...selected].some(id => !originallyShared.has(id)) ||
    [...originallyShared].some(id => !selected.has(id))

  return (
    <div className="min-h-screen pb-40">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back</span>
            </button>
            <button
              onClick={() => router.back()}
              className="text-primary hover:underline text-sm font-medium"
            >
              Cancel
            </button>
          </div>
          <h1 className="text-foreground mb-1">Share Policy</h1>
          <p className="text-sm text-muted-foreground">
            Select contacts to share &ldquo;{policy.name}&rdquo; with
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6">
        {contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="Add trusted family members or friends to share your insurance policies with them."
            action={
              <Link
                href="/contacts/add"
                className="bg-primary text-primary-foreground rounded-lg px-6 py-2.5 font-medium hover:opacity-90 transition-opacity inline-block"
              >
                Add Contact
              </Link>
            }
          />
        ) : (
          <div className="space-y-2">
            {contacts.map(contact => {
              const isSelected = selected.has(contact.id)
              const wasShared = originallyShared.has(contact.id)
              return (
                <button
                  key={contact.id}
                  onClick={() => toggleContact(contact.id)}
                  className={`w-full bg-card border rounded-xl p-4 hover:bg-accent transition-colors text-left ${
                    isSelected ? 'border-primary' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">
                          +91 {contact.phone}
                          {wasShared && (
                            <span className="ml-2 text-xs text-primary">• Already shared</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? 'bg-primary border-primary' : 'border-border'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-primary-foreground rounded-sm" />}
                    </div>
                  </div>
                </button>
              )
            })}

            {/* Add another contact */}
            <Link
              href={`/contacts/add?returnTo=/policies/${id}/share`}
              className="w-full bg-muted/50 border-2 border-dashed border-border rounded-xl p-4 hover:bg-accent transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Another Contact</span>
            </Link>
          </div>
        )}
      </div>

      {/* Fixed bottom CTA */}
      {contacts.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-b border-border px-4 py-3 z-40">
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleConfirm}
              disabled={!hasChanges || isPending}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-3.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sharing…
                </>
              ) : (
                ctaLabel
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
