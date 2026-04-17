'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Mail, Check } from 'lucide-react'
import { importSelected, dismissAll } from '@/lib/actions/gmail-import'
import type { ScanCandidate } from '@/lib/actions/gmail-import'
import type { PolicyType } from '@/types'

const TYPE_COLORS: Record<PolicyType, { bg: string; text: string }> = {
  Health:  { bg: 'bg-[var(--health)]',   text: 'text-[var(--health-foreground)]' },
  Life:    { bg: 'bg-[var(--life)]',     text: 'text-[var(--life-foreground)]' },
  Term:    { bg: 'bg-[var(--term)]',     text: 'text-[var(--term-foreground)]' },
  Vehicle: { bg: 'bg-[var(--vehicle)]',  text: 'text-[var(--vehicle-foreground)]' },
  Other:   { bg: 'bg-[var(--other)]',    text: 'text-[var(--other-foreground)]' },
}

function formatDate(raw: string): string {
  try {
    return new Date(raw).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return raw
  }
}

export default function ImportReviewClient({ candidates }: { candidates: ScanCandidate[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set(candidates.map(c => c.id)))
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ imported: number; skipped: number; passwordProtected: number } | null>(null)

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(prev =>
      prev.size === candidates.length ? new Set() : new Set(candidates.map(c => c.id))
    )
  }

  function handleImport() {
    startTransition(async () => {
      const res = await importSelected(Array.from(selected))
      if (res.error) {
        alert(res.error)
        return
      }
      setResult({ imported: res.imported, skipped: res.skipped, passwordProtected: res.passwordProtected })
    })
  }

  function handleDismiss() {
    startTransition(async () => {
      await dismissAll()
    })
  }

  if (result) {
    const notes: string[] = []
    if (result.skipped > 0) notes.push(`${result.skipped} already existed and were skipped`)
    if (result.passwordProtected > 0) notes.push(`${result.passwordProtected} were password-protected and couldn't be imported`)

    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="bg-primary/10 rounded-full p-4 inline-flex mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-2">
            {result.imported === 0 ? 'Nothing imported' : `${result.imported} ${result.imported === 1 ? 'policy' : 'policies'} imported`}
          </h2>
          {notes.length > 0 && (
            <p className="text-sm text-muted-foreground mb-6">{notes.join('. ')}.</p>
          )}
          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground mb-6">Your policies are ready to view.</p>
          )}
          <button
            onClick={() => router.push('/policies')}
            className="w-full bg-primary text-primary-foreground rounded-full px-6 py-3 font-medium hover:opacity-90 transition-opacity"
          >
            View My Policies
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-40">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <h1 className="text-lg text-foreground">Found in Email</h1>
            </div>
            <button
              onClick={toggleAll}
              className="text-sm text-primary hover:opacity-70 transition-opacity"
            >
              {selected.size === candidates.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {candidates.length} {candidates.length === 1 ? 'policy' : 'policies'} found · {selected.size} selected
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-4 space-y-3">
        {candidates.map(c => {
          const colors = TYPE_COLORS[c.policyType]
          const isSelected = selected.has(c.id)

          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`w-full bg-card border rounded-xl p-4 text-left transition-all ${
                isSelected ? 'border-primary ring-1 ring-primary' : 'border-border hover:bg-accent'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-primary border-primary' : 'border-border'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                </div>

                {/* Icon */}
                <div className={`${colors.bg} ${colors.text} rounded-lg p-2 shrink-0`}>
                  <FileText className="w-4 h-4" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate text-sm">
                    {c.attachmentFilename.replace(/\.pdf$/i, '')}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs ${colors.bg} ${colors.text}`}>
                      {c.policyType}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{c.senderEmail}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(c.sentDate)}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Fixed bottom actions */}
      <div className="fixed bottom-20 left-0 right-0 px-6 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-8 z-40">
        <div className="max-w-lg mx-auto space-y-2">
          <button
            onClick={handleImport}
            disabled={isPending || selected.size === 0}
            className="w-full bg-primary text-primary-foreground rounded-full px-6 py-3 font-medium hover:opacity-90 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Importing…' : `Import ${selected.size > 0 ? `${selected.size} ` : ''}${selected.size === 1 ? 'policy' : 'policies'}`}
          </button>
          <button
            onClick={handleDismiss}
            disabled={isPending}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
