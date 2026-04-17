'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, FileText, Share2, ArrowLeft, Mail } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import { useAppData } from '@/components/AppDataProvider'
import { PolicyType } from '@/types'
import { track } from '@/lib/analytics'

const POLICY_TYPES: Array<PolicyType | 'All'> = ['All', 'Health', 'Life', 'Term', 'Vehicle', 'Other']

const TYPE_COLORS: Record<PolicyType, { bg: string; text: string }> = {
  Health:  { bg: 'bg-[var(--health)]',   text: 'text-[var(--health-foreground)]' },
  Life:    { bg: 'bg-[var(--life)]',     text: 'text-[var(--life-foreground)]' },
  Term:    { bg: 'bg-[var(--term)]',     text: 'text-[var(--term-foreground)]' },
  Vehicle: { bg: 'bg-[var(--vehicle)]',  text: 'text-[var(--vehicle-foreground)]' },
  Other:   { bg: 'bg-[var(--other)]',    text: 'text-[var(--other-foreground)]' },
}

export default function PoliciesPage() {
  const { policies, contacts } = useAppData()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const initialType = POLICY_TYPES.slice(1).find(
    t => t.toLowerCase() === typeParam?.toLowerCase()
  ) ?? 'All'
  const [selected, setSelected] = useState<PolicyType | 'All'>(initialType)
  const router = useRouter()
  const viewTracked = useRef(false)

  useEffect(() => {
    if (viewTracked.current) return
    viewTracked.current = true
    track('view-my-policies', { label: policies.length === 0 ? '0-state' : 'non-0-state' })
    if (searchParams.get('uploaded') === '1') {
      track('action-completed', { screen: 'upload-policy', label: 'policy-uploaded' })
    }
  }, [])

  const filtered = selected === 'All' ? policies : policies.filter(p => p.type === selected)

  const grouped = POLICY_TYPES.slice(1).reduce((acc, type) => {
    const items = policies.filter(p => p.type === type)
    if (items.length > 0) acc[type as PolicyType] = items
    return acc
  }, {} as Record<PolicyType, typeof policies>)

  const getContactName = (id: string) => contacts.find(c => c.id === id)?.name ?? id

  return (
    <div className={`min-h-screen ${policies.length < 10 ? 'pb-40' : 'pb-4'}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              onClick={() => { track('back-clicked', { screen: 'my-policies', label: 'back' }); router.back() }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg text-foreground">My Policies</h1>
            <Link href="/policies/upload" onClick={() => track('option-clicked', { screen: 'my-policies', label: 'upload-policy' })} className="bg-primary text-primary-foreground rounded-full p-2 hover:opacity-90 transition-opacity">
              <Plus className="w-5 h-5" />
            </Link>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 scrollbar-hide">
            {POLICY_TYPES.map((type) => {
              const count = type === 'All' ? policies.length : policies.filter(p => p.type === type).length
              return (
                <button
                  key={type}
                  onClick={() => { track('option-clicked', { screen: 'my-policies', label: type.toLowerCase() }); setSelected(type) }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selected === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {type}{count > 0 ? ` (${count})` : ''}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={selected === 'All' ? 'No policies yet' : `No ${selected} policies`}
            description="Upload your first insurance policy to get started."
            action={
              <Link href="/policies/upload" onClick={() => track('option-clicked', { screen: 'my-policies', label: 'upload-policy' })} className="bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity inline-block">
                Upload Policy
              </Link>
            }
          />
        ) : selected === 'All' ? (
          // Grouped view
          <div className="space-y-6">
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <h3 className="mb-3 text-foreground">{type}</h3>
                <div className="space-y-3">
                  {items.map(policy => {
                    const colors = TYPE_COLORS[policy.type]
                    return (
                      <div key={policy.id} className="relative group">
                        <button onClick={() => { track('option-clicked', { screen: 'my-policies', label: 'view-policy-details', 'policy-type': policy.type }); router.push(`/policies/${policy.id}`) }} className="w-full bg-card border border-border rounded-xl p-4 hover:bg-accent transition-colors text-left">
                          <div className="flex items-start gap-3 pr-10">
                            <div className={`${colors.bg} ${colors.text} rounded-lg p-2.5 shrink-0`}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate mb-1">{policy.name}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs ${colors.bg} ${colors.text}`}>
                                  {policy.type}
                                </span>
                                {policy.source === 'email' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground">
                                    <Mail className="w-3 h-3" />
                                    From email
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(policy.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              {policy.sharedWith.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Shared with {policy.sharedWith.map(getContactName).join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                        <button onClick={() => { track('share-clicked', { screen: 'my-policies', label: 'share', 'policy-type': policy.type }); router.push(`/policies/${policy.id}/share`) }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-2 hover:opacity-90 transition-opacity shadow-lg">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Filtered view
          <div className="space-y-3">
            {filtered.map(policy => {
              const colors = TYPE_COLORS[policy.type]
              return (
                <div key={policy.id} className="relative group">
                  <button onClick={() => { track('option-clicked', { screen: 'my-policies', label: 'view-policy-details', 'policy-type': policy.type }); router.push(`/policies/${policy.id}`) }} className="w-full bg-card border border-border rounded-xl p-4 hover:bg-accent transition-colors text-left">
                    <div className="flex items-start gap-3 pr-10">
                      <div className={`${colors.bg} ${colors.text} rounded-lg p-2.5 shrink-0`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate mb-1">{policy.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs ${colors.bg} ${colors.text}`}>
                            {policy.type}
                          </span>
                          {policy.source === 'email' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              From email
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(policy.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {policy.sharedWith.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Shared with {policy.sharedWith.map(getContactName).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                  <button onClick={() => { track('share-clicked', { screen: 'my-policies', label: 'share', 'policy-type': policy.type }); router.push(`/policies/${policy.id}/share`) }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-2 hover:opacity-90 transition-opacity shadow-lg">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Fixed Upload CTA — shown when under 10 policies */}
      {policies.length < 10 && (
        <div className="fixed bottom-20 left-0 right-0 px-6 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-8 z-40 pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <button
              onClick={() => { track('option-clicked', { screen: 'my-policies', label: 'upload-policy' }); router.push('/policies/upload') }}
              className="w-full bg-primary text-primary-foreground rounded-full px-6 py-3 font-medium hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload Policy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
