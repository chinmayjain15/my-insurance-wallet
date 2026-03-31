'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, FileText, CheckCircle2, Loader2, ShieldOff } from 'lucide-react'
import { uploadPolicy } from '@/lib/actions/policies'
import { useAppData } from '@/components/AppDataProvider'
import { PolicyType } from '@/types'
import { track } from '@/lib/analytics'

const POLICY_TYPES: PolicyType[] = ['Health', 'Life', 'Term', 'Vehicle', 'Other']

const LIMIT = 10

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadPolicyPage() {
  const router = useRouter()
  const { policies } = useAppData()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [policyName, setPolicyName] = useState('')
  const [selectedType, setSelectedType] = useState<PolicyType | null>(null)
  const [state, formAction, isPending] = useActionState(uploadPolicy, { error: '' })

  useEffect(() => {
    track('view-upload-policy')
    if (policies.length >= LIMIT) track('error-viewed', { screen: 'upload-policy', label: 'policy-limit-reached' })
  }, [])
  useEffect(() => { if (state.error) track('error-viewed', { screen: 'upload-policy', label: 'upload-failed' }) }, [state.error])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
    if (file) {
      track('field-entered', { screen: 'upload-policy', label: 'file-selected', 'file-type': file.type })
      if (!policyName) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        setPolicyName(nameWithoutExt)
      }
    }
  }

  if (policies.length >= LIMIT) {
    return (
      <div className="min-h-screen flex flex-col px-6">
        <div className="pt-6 pb-4">
          <button
            onClick={() => { track('back-clicked', { screen: 'upload-policy', label: 'back', 'policy-type': 'not-selected' }); router.back() }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-16">
          <div className="bg-muted rounded-full p-5">
            <ShieldOff className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-foreground">Policy limit reached</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            You can store up to {LIMIT} policies. Delete an existing policy to upload a new one.
          </p>
          <button
            onClick={() => { track('option-clicked', { screen: 'upload-policy', label: 'manage-policies' }); router.push('/policies') }}
            className="mt-2 bg-primary text-primary-foreground rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity"
          >
            Manage Policies
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-6">
      {/* Back button */}
      <div className="pt-6 pb-4">
        <button
          onClick={() => { track('back-clicked', { screen: 'upload-policy', label: 'back', 'policy-type': selectedType ?? 'not-selected' }); router.back() }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      <form
        action={formAction}
        className="flex-1"
        onSubmit={() => track('continue-clicked', {
          screen: 'upload-policy',
          label: 'upload-policy',
          'policy-type': selectedType ?? 'unknown',
          'file-type': selectedFile?.type ?? 'unknown',
          'file-size-kb': selectedFile ? Math.round(selectedFile.size / 1024) : 0,
        })}
      >
        <div className="max-w-lg mx-auto w-full py-6 space-y-6">

          <div>
            <h2 className="mb-2 text-foreground">Upload Policy</h2>
            <p className="text-muted-foreground">
              Add a new insurance policy to your wallet ({policies.length}/{LIMIT} used)
            </p>
          </div>

          {/* File picker */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Policy Document</label>

            <input
              type="file"
              name="file"
              ref={fileInputRef}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => { track('option-clicked', { screen: 'upload-policy', label: 'choose-file' }); fileInputRef.current?.click() }}
              className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary hover:bg-accent/50 transition-colors"
            >
              {selectedFile ? (
                <>
                  <div className="bg-primary/10 rounded-full p-3">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatBytes(selectedFile.size)} · Tap to change</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-muted rounded-full p-3">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Choose a file</p>
                    <p className="text-xs text-muted-foreground mt-1">Tap to browse from your device</p>
                    <p className="text-xs text-muted-foreground mt-0.5">PDF, JPG, or PNG · Max 10 MB</p>
                  </div>
                </>
              )}
            </button>
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
              onBlur={e => { if (e.target.value) track('field-entered', { screen: 'upload-policy', label: 'policy-name' }) }}
              placeholder="e.g. HDFC Health Insurance"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>

          {/* Policy type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Policy Type</label>
            <div className="grid grid-cols-2 gap-2.5">
              {POLICY_TYPES.map(type => {
                const isActive = selectedType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { track('option-clicked', { screen: 'upload-policy', label: type.toLowerCase() }); setSelectedType(type) }}
                    className={`flex items-center gap-2.5 rounded-xl px-4 py-3 border transition-all ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-card text-foreground hover:bg-accent'
                    }`}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">{type}</span>
                  </button>
                )
              })}
            </div>
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
            disabled={!selectedFile || !policyName.trim() || isPending}
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
