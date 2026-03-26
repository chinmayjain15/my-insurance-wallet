'use client'

import { useTransition, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, Share2, Download, Heart, FileText, Car, Activity } from 'lucide-react'
import Link from 'next/link'
import { useAppData } from '@/components/AppDataProvider'
import { getSharedPolicySignedUrl } from '@/lib/actions/policies'
import { PolicyType } from '@/types'

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

export default function SharedPolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { sharedPolicies, isDemo } = useAppData()
  const [isPending, startTransition] = useTransition()

  const policy = sharedPolicies.find(p => p.id === id)

  if (!policy) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Policy not found</p>
          <Link href="/other-policies" className="text-primary text-sm hover:underline">
            Go back to shared policies
          </Link>
        </div>
      </div>
    )
  }

  const colors = TYPE_COLORS[policy.type]
  const Icon = TYPE_ICONS[policy.type]

  function handleDownload() {
    if (isDemo || !policy) return
    startTransition(async () => {
      const { url, error } = await getSharedPolicySignedUrl(policy.id)
      if (error || !url) return
      const a = document.createElement('a')
      a.href = url
      a.download = policy.fileName
      a.click()
    })
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg text-foreground">Policy Details</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">

        {/* Policy Info Card */}
        <div className="bg-card border border-border rounded-xl p-5">
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
          </div>
          <div className="space-y-0 text-sm">
            <div className="flex justify-between py-2 border-t border-border">
              <span className="text-muted-foreground">Shared by</span>
              <span className="text-foreground font-medium">{policy.sharedBy}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-border">
              <span className="text-muted-foreground">Phone</span>
              <span className="text-foreground">+91 {policy.sharedByPhone}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-border">
              <span className="text-muted-foreground">Uploaded</span>
              <span className="text-foreground">
                {new Date(policy.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between py-2 border-t border-border">
              <span className="text-muted-foreground">File</span>
              <span className="text-foreground truncate ml-4 text-right max-w-[60%]" title={policy.fileName}>
                {policy.fileName}
              </span>
            </div>
          </div>
        </div>

        {/* Permissions info */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Share2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/90">
              This policy was shared with you by <span className="font-medium">{policy.sharedBy}</span>. You can view and download the document, but you cannot edit or share it further.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push(`/other-policies/${id}/view`)}
            className="w-full bg-primary text-primary-foreground rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Document
          </button>

          <button
            onClick={handleDownload}
            disabled={isPending || isDemo}
            className="w-full bg-card border border-border text-foreground rounded-xl px-6 py-3 font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isPending ? 'Preparing download…' : 'Download Policy'}
          </button>
        </div>

      </div>
    </div>
  )
}
