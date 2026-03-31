'use client'

import { useState, useTransition, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Share2, FileText } from 'lucide-react'
import Link from 'next/link'
import { useAppData } from '@/components/AppDataProvider'
import { deleteContact } from '@/lib/actions/contacts'
import { sharePolicy, unsharePolicy } from '@/lib/actions/policies'
import { PolicyType } from '@/types'
import { track } from '@/lib/analytics'

const TYPE_COLORS: Record<PolicyType, { bg: string; text: string }> = {
  Health:  { bg: 'bg-[var(--health)]',   text: 'text-[var(--health-foreground)]' },
  Life:    { bg: 'bg-[var(--life)]',     text: 'text-[var(--life-foreground)]' },
  Term:    { bg: 'bg-[var(--term)]',     text: 'text-[var(--term-foreground)]' },
  Vehicle: { bg: 'bg-[var(--vehicle)]',  text: 'text-[var(--vehicle-foreground)]' },
  Other:   { bg: 'bg-[var(--other)]',    text: 'text-[var(--other-foreground)]' },
}

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { contacts, policies, isDemo } = useAppData()
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showShareSheet, setShowShareSheet] = useState(false)

  const contact = contacts.find(c => c.id === id)

  useEffect(() => {
    if (contact) track('view-contact-detail')
    else track('error-viewed', { screen: 'contact-detail', label: 'contact-not-found' })
  }, [])

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Contact not found</p>
          <Link href="/contacts" className="text-primary text-sm hover:underline">
            Go back to contacts
          </Link>
        </div>
      </div>
    )
  }

  const sharedPolicies = policies.filter(p => p.sharedWith.includes(contact.id))
  const allPolicies = policies

  function handleToggleShare(policyId: string) {
    if (isDemo || !contact) return
    const policy = policies.find(p => p.id === policyId)
    if (!policy) return
    track('option-clicked', { screen: 'contact-detail', label: 'toggle-policy-share', 'policy-type': policy.type })
    startTransition(async () => {
      if (policy.sharedWith.includes(contact.id)) {
        await unsharePolicy(policyId, contact.id)
      } else {
        await sharePolicy(policyId, contact.id)
      }
      router.refresh()
    })
  }

  function handleDelete() {
    if (isDemo || !contact) { router.push('/contacts'); return }
    track('action-completed', { screen: 'contact-detail', label: 'contact-removed' })
    startTransition(async () => {
      const result = await deleteContact(contact.id)
      if (!result.error) router.push('/contacts')
    })
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <button
            onClick={() => { track('back-clicked', { screen: 'contact-detail', label: 'back' }); router.back() }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">

        {/* Contact Info Card */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
              <span className="text-lg font-semibold text-foreground">{contact.name[0].toUpperCase()}</span>
            </div>
            <h2 className="text-foreground">{contact.name}</h2>
          </div>
          <div className="space-y-0 text-sm">
            <div className="flex justify-between py-2 border-t border-border">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground">{contact.email}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-border">
              <span className="text-muted-foreground">Added on</span>
              <span className="text-foreground">
                {new Date(contact.addedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between py-2 border-t border-border">
              <span className="text-muted-foreground">Shared policies</span>
              <span className="text-foreground">{sharedPolicies.length}</span>
            </div>
          </div>
        </div>

        {/* Shared Policies Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground">Shared Policies</h3>
            {allPolicies.length > 0 && (
              <button
                onClick={() => { track('button-clicked', { screen: 'contact-detail', label: 'manage-sharing' }); setShowShareSheet(true) }}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                Manage
              </button>
            )}
          </div>

          {sharedPolicies.length > 0 ? (
            <div className="space-y-3">
              {sharedPolicies.map(policy => {
                const colors = TYPE_COLORS[policy.type]
                return (
                  <div key={policy.id} className="relative">
                    <button
                      onClick={() => { track('option-clicked', { screen: 'contact-detail', label: 'view-policy', 'policy-type': policy.type }); router.push(`/policies/${policy.id}`) }}
                      className="w-full bg-card border border-border rounded-xl p-4 hover:bg-accent transition-colors text-left"
                    >
                      <div className="flex items-start gap-3 pr-20">
                        <div className={`${colors.bg} ${colors.text} rounded-lg p-2.5 shrink-0`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{policy.name}</p>
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs mt-1 ${colors.bg} ${colors.text}`}>
                            {policy.type}
                          </span>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => { track('button-clicked', { screen: 'contact-detail', label: 'unshare-policy', 'policy-type': policy.type }); handleToggleShare(policy.id) }}
                      disabled={isPending}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-destructive hover:underline disabled:opacity-50 bg-card px-2 py-1 rounded"
                    >
                      Unshare
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-muted/50 border border-border rounded-xl p-6 text-center">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No policies shared with {contact.name} yet
              </p>
              {allPolicies.length > 0 && (
                <button
                  onClick={() => { track('button-clicked', { screen: 'contact-detail', label: 'manage-sharing' }); setShowShareSheet(true) }}
                  className="text-sm text-primary hover:underline"
                >
                  Share a policy
                </button>
              )}
            </div>
          )}
        </div>

        {/* Remove Contact */}
        <button
          onClick={() => { track('button-clicked', { screen: 'contact-detail', label: 'remove-contact-tapped' }); setShowDeleteConfirm(true) }}
          className="w-full bg-destructive text-destructive-foreground rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          Remove Contact
        </button>

      </div>

      {/* Share Bottom Sheet */}
      {showShareSheet && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowShareSheet(false)}
        >
          <div
            className="bg-background rounded-t-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
              <h3 className="mb-4 text-foreground">Share policies with {contact.name}</h3>
              {allPolicies.length > 0 ? (
                <div className="space-y-2">
                  {allPolicies.map(policy => {
                    const isShared = policy.sharedWith.includes(contact.id)
                    const colors = TYPE_COLORS[policy.type]
                    return (
                      <button
                        key={policy.id}
                        onClick={() => handleToggleShare(policy.id)}
                        disabled={isPending}
                        className="w-full bg-card border border-border rounded-xl p-3 flex items-center justify-between hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs ${colors.bg} ${colors.text}`}>
                            {policy.type}
                          </span>
                          <span className="font-medium text-foreground text-sm">{policy.name}</span>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          isShared ? 'bg-primary border-primary' : 'border-border'
                        }`}>
                          {isShared && <div className="w-2 h-2 bg-primary-foreground rounded-sm" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No policies available to share</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Bottom Sheet */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-background rounded-t-3xl w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
            <h3 className="mb-2 text-foreground">Remove this contact?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will remove &ldquo;{contact.name}&rdquo; from your contacts and revoke their access to all shared policies. This action cannot be undone.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="w-full bg-destructive text-destructive-foreground rounded-xl px-6 py-3 font-medium hover:opacity-90 disabled:opacity-50"
              >
                Remove Contact
              </button>
              <button
                onClick={() => { track('button-clicked', { screen: 'contact-detail', label: 'remove-contact-cancelled' }); setShowDeleteConfirm(false) }}
                className="w-full bg-muted text-foreground rounded-xl px-6 py-3 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
