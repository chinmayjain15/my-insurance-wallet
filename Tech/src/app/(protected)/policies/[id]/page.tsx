'use client'

import { useState, useTransition, use, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, Share2, Edit3, Heart, FileText, Car, Activity } from 'lucide-react'
import { useAppData } from '@/components/AppDataProvider'
import { unsharePolicy, deletePolicy, updatePolicyName } from '@/lib/actions/policies'
import { PolicyType } from '@/types'
import Link from 'next/link'
import { track } from '@/lib/analytics'

const TYPE_COLORS: Record<PolicyType, { bg: string; text: string }> = {
  Health:  { bg: 'bg-[var(--health)]',   text: 'text-[var(--health-foreground)]' },
  Life:    { bg: 'bg-[var(--life)]',     text: 'text-[var(--life-foreground)]' },
  Term:    { bg: 'bg-[var(--term)]',     text: 'text-[var(--term-foreground)]' },
  Vehicle: { bg: 'bg-[var(--vehicle)]',  text: 'text-[var(--vehicle-foreground)]' },
  Other:   { bg: 'bg-[var(--other)]',    text: 'text-[var(--other-foreground)]' },
}

const TYPE_ICONS: Record<PolicyType, React.ElementType> = {
  Health:  Activity,
  Life:    Heart,
  Term:    FileText,
  Vehicle: Car,
  Other:   FileText,
}

export default function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { policies, contacts, isDemo } = useAppData()
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [nameError, setNameError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const policy = policies.find(p => p.id === id)
  const viewTracked = useRef(false)

  useEffect(() => {
    if (viewTracked.current) return
    viewTracked.current = true
    if (policy) track('view-policy-detail', { 'policy-type': policy.type })
    else track('error-viewed', { screen: 'policy-detail', label: 'policy-not-found' })
  }, [])
  useEffect(() => { if (nameError) track('error-viewed', { screen: 'policy-detail', label: 'policy-rename-failed', 'policy-type': policy?.type ?? null }) }, [nameError])

  if (!policy) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Policy not found</p>
          <Link href="/policies" className="text-primary text-sm hover:underline">Go back to policies</Link>
        </div>
      </div>
    )
  }

  const colors = TYPE_COLORS[policy.type]
  const Icon = TYPE_ICONS[policy.type]
  const sharedContacts = contacts.filter(c => policy.sharedWith.includes(c.id))

  function handleUnshare(contactId: string) {
    if (isDemo || !policy) return
    track('button-clicked', { screen: 'policy-detail', label: 'unshare-policy', 'policy-type': policy.type })
    startTransition(async () => {
      await unsharePolicy(policy.id, contactId)
      router.refresh()
    })
  }

  function handleDelete() {
    if (isDemo || !policy) { router.push('/policies'); return }
    track('button-clicked', { screen: 'policy-detail', label: 'delete-policy-confirmed', 'policy-type': policy.type })
    startTransition(async () => {
      await deletePolicy(policy.id)
      router.push('/policies')
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => { track('back-clicked', { screen: 'policy-detail', label: 'back', 'policy-type': policy.type }); router.back() }}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg text-foreground">Policy Details</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">

        {/* Policy Info */}
        <div className="bg-card border border-border rounded-xl p-5">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedName}
                onChange={e => setEditedName(e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
              {nameError && <p className="text-xs text-destructive">{nameError}</p>}
              <div className="flex gap-2">
                <button
                  disabled={isPending}
                  onClick={() => {
                    if (isDemo) { setIsEditing(false); return }
                    setNameError('')
                    track('action-completed', { screen: 'policy-detail', label: 'rename-policy', 'policy-type': policy.type })
                    startTransition(async () => {
                      const result = await updatePolicyName(policy.id, editedName)
                      if (result.error) { setNameError(result.error); return }
                      setIsEditing(false)
                      router.refresh()
                    })
                  }}
                  className="flex-1 bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => { track('button-clicked', { screen: 'policy-detail', label: 'cancel-rename', 'policy-type': policy.type }); setIsEditing(false); setEditedName(policy.name); setNameError('') }}
                  className="flex-1 bg-muted text-foreground rounded-lg px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className={`${colors.bg} ${colors.text} w-10 h-10 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`${colors.text} text-xs font-medium`}>{policy.type}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-foreground break-words">{policy.name}</h2>
                </div>
                <button
                  onClick={() => { track('button-clicked', { screen: 'policy-detail', label: 'edit-policy-name', 'policy-type': policy.type }); setEditedName(policy.name); setIsEditing(true) }}
                  className="p-2 rounded-lg hover:bg-accent transition-colors shrink-0"
                >
                  <Edit3 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="text-sm">
                <div className="flex justify-between py-2 border-t border-border">
                  <span className="text-muted-foreground">Uploaded</span>
                  <span className="text-foreground">
                    {new Date(policy.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-border">
                  <span className="text-muted-foreground">File</span>
                  <span className="text-foreground truncate ml-4 text-right">{policy.fileName}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-border">
                  <span className="text-muted-foreground">Shared with</span>
                  <span className="text-foreground">{sharedContacts.length} contacts</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Shared With section */}
        <div>
          <h3 className="mb-3 text-foreground">Shared With</h3>

          {sharedContacts.length > 0 ? (
            <div className="space-y-2 mb-4">
              {sharedContacts.map(contact => (
                <div key={contact.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Shared on {new Date(contact.addedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnshare(contact.id)}
                    disabled={isPending}
                    className="text-sm text-destructive hover:underline disabled:opacity-50"
                  >
                    Unshare
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-muted/50 border border-border rounded-xl p-4 text-center mb-4">
              <p className="text-sm text-muted-foreground">
                This policy hasn&apos;t been shared with anyone yet
              </p>
            </div>
          )}

          {/* Share CTA */}
          {contacts.length > 0 ? (
            <Link
              href={`/policies/${policy.id}/share`}
              onClick={() => track('option-clicked', { screen: 'policy-detail', label: 'share-policy', 'policy-type': policy.type })}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share with Family &amp; Friends
            </Link>
          ) : (
            <Link
              href="/contacts/add"
              onClick={() => track('option-clicked', { screen: 'policy-detail', label: 'add-contacts-to-share' })}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Add Contacts to Share
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button onClick={() => { track('continue-clicked', { screen: 'policy-detail', label: 'view-document', 'policy-type': policy.type, source: 'my-policy' }); router.push(`/policies/${id}/view`) }} className="w-full bg-primary text-primary-foreground rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            View Document
          </button>

          <div className="text-center pt-1">
            <button
              onClick={() => { track('button-clicked', { screen: 'policy-detail', label: 'delete-policy-tapped', 'policy-type': policy.type }); setShowDeleteConfirm(true) }}
              className="text-xs text-muted-foreground/60 hover:text-destructive underline underline-offset-2 transition-colors"
            >
              Delete policy
            </button>
          </div>
        </div>

      </div>

      {/* Delete confirmation bottom sheet */}
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
            <h3 className="mb-2 text-foreground">Delete this policy?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently delete &ldquo;{policy.name}&rdquo; and revoke access for all shared contacts. This action cannot be undone.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="w-full bg-destructive text-destructive-foreground rounded-xl px-6 py-3 font-medium hover:opacity-90 disabled:opacity-50"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => { track('button-clicked', { screen: 'policy-detail', label: 'delete-policy-cancelled', 'policy-type': policy.type }); setShowDeleteConfirm(false) }}
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
