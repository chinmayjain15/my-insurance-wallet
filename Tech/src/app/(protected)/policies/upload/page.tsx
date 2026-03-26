'use client'

import { useActionState, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, FileText, X, Loader2 } from 'lucide-react'
import { uploadPolicy } from '@/lib/actions/policies'
import { PolicyType } from '@/types'

const POLICY_TYPES: PolicyType[] = ['Health', 'Life', 'Term', 'Vehicle', 'Other']

const TYPE_COLORS: Record<PolicyType, { bg: string; activeBg: string; text: string; activeText: string; border: string }> = {
  Health:  { bg: 'bg-[var(--health)]/10',  activeBg: 'bg-[var(--health)]',  text: 'text-[var(--health)]',  activeText: 'text-[var(--health-foreground)]',  border: 'border-[var(--health)]' },
  Life:    { bg: 'bg-[var(--life)]/10',    activeBg: 'bg-[var(--life)]',    text: 'text-[var(--life)]',    activeText: 'text-[var(--life-foreground)]',    border: 'border-[var(--life)]' },
  Term:    { bg: 'bg-[var(--term)]/10',    activeBg: 'bg-[var(--term)]',    text: 'text-[var(--term)]',    activeText: 'text-[var(--term-foreground)]',    border: 'border-[var(--term)]' },
  Vehicle: { bg: 'bg-[var(--vehicle)]/10', activeBg: 'bg-[var(--vehicle)]', text: 'text-[var(--vehicle)]', activeText: 'text-[var(--vehicle-foreground)]', border: 'border-[var(--vehicle)]' },
  Other:   { bg: 'bg-[var(--other)]/10',   activeBg: 'bg-[var(--other)]',   text: 'text-[var(--other)]',   activeText: 'text-[var(--other-foreground)]',   border: 'border-[var(--other)]' },
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadPolicyPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [policyName, setPolicyName] = useState('')
  const [selectedType, setSelectedType] = useState<PolicyType | null>(null)
  const [state, formAction, isPending] = useActionState(uploadPolicy, { error: '' })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
    if (file && !policyName) {
      // Auto-fill name from filename (strip extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setPolicyName(nameWithoutExt)
    }
  }

  function clearFile() {
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-foreground">Upload Policy</h1>
        </div>
      </div>

      <form action={formAction}>
        <div className="max-w-lg mx-auto px-6 py-6 space-y-6">

          {/* File picker — single input always in DOM, visual swaps around it */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Policy Document</label>

            {/* Always-present file input */}
            <input
              type="file"
              name="file"
              ref={fileInputRef}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
            />

            {selectedFile ? (
              <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
                <div className="bg-primary/10 rounded-lg p-2.5 shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors shrink-0"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary hover:bg-accent/50 transition-colors"
              >
                <div className="bg-muted rounded-full p-3">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Tap to select a file</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG · Max 10 MB</p>
                </div>
              </button>
            )}
          </div>

          {/* Policy name */}
          <div>
            <label htmlFor="policy-name" className="block text-sm font-medium text-foreground mb-2">Policy Name</label>
            <input
              id="policy-name"
              name="name"
              type="text"
              value={policyName}
              onChange={e => setPolicyName(e.target.value)}
              placeholder="e.g. HDFC Health Insurance"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>

          {/* Policy type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Policy Type</label>
            <div className="grid grid-cols-2 gap-2.5">
              {POLICY_TYPES.map(type => {
                const colors = TYPE_COLORS[type]
                const isActive = selectedType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`flex items-center gap-2.5 rounded-xl px-4 py-3 border transition-all ${
                      isActive
                        ? `${colors.activeBg} ${colors.activeText} border-transparent`
                        : `${colors.bg} ${colors.text} ${colors.border} border hover:opacity-80`
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${isActive ? colors.activeText : colors.text}`}
                      style={{ backgroundColor: 'currentColor' }}
                    />
                    <span className="text-sm font-medium">{type}</span>
                  </button>
                )
              })}
            </div>
            {/* Hidden input carries the selected type */}
            <input type="hidden" name="type" value={selectedType ?? ''} />
          </div>

          {/* Error */}
          {state.error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Policy
              </>
            )}
          </button>

        </div>
      </form>
    </div>
  )
}
