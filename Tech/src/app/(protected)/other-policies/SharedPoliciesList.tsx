'use client'

import { FileText, Share2 } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import { useAppData } from '@/components/AppDataProvider'
import { PolicyType } from '@/types'

const TYPE_COLORS: Record<PolicyType, { bg: string; text: string }> = {
  Health:  { bg: 'bg-[var(--health)]',   text: 'text-[var(--health-foreground)]' },
  Life:    { bg: 'bg-[var(--life)]',     text: 'text-[var(--life-foreground)]' },
  Term:    { bg: 'bg-[var(--term)]',     text: 'text-[var(--term-foreground)]' },
  Vehicle: { bg: 'bg-[var(--vehicle)]',  text: 'text-[var(--vehicle-foreground)]' },
  Other:   { bg: 'bg-[var(--other)]',    text: 'text-[var(--other-foreground)]' },
}

export default function SharedPoliciesList() {
  const { sharedPolicies } = useAppData()

  if (sharedPolicies.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-6">
        <EmptyState
          icon={Share2}
          title="No shared policies"
          description="When your family or friends share their insurance policies with you, they'll appear here for easy access."
        />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-6 space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        {sharedPolicies.length} {sharedPolicies.length === 1 ? 'policy' : 'policies'} shared with you
      </p>
      {sharedPolicies.map(policy => {
        const colors = TYPE_COLORS[policy.type]
        return (
          <button key={policy.id} className="w-full bg-card border border-border rounded-xl p-4 hover:bg-accent transition-colors text-left">
            <div className="flex items-start gap-3">
              <div className={`${colors.bg} ${colors.text} rounded-lg p-2.5 shrink-0`}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate mb-1">{policy.name}</p>
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-xs ${colors.bg} ${colors.text}`}>
                    {policy.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(policy.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Share2 className="w-3 h-3" />
                  <span>Shared by {policy.sharedBy}</span>
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
