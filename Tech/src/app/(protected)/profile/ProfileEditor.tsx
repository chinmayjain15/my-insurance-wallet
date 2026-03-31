'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { User, Mail, Edit3, Loader2 } from 'lucide-react'
import { updateUserName } from '@/lib/actions/profile'
import { track } from '@/lib/analytics'

export default function ProfileEditor({
  initialName,
  email,
}: {
  initialName: string | null
  email: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [state, formAction, isPending] = useActionState(updateUserName, { error: '', success: false })
  const [displayName, setDisplayName] = useState(initialName ?? '')

  function handleSuccess(e: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget)
    const newName = (data.get('name') as string)?.trim()
    if (newName) setDisplayName(newName)
  }

  useEffect(() => { if (state.error) track('error-viewed', { screen: 'my-profile', label: 'name-update-failed' }) }, [state.error])

  if (state.success && isEditing) setIsEditing(false)

  return (
    <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
      {/* Profile card */}
      <div className="bg-card border border-border rounded-xl p-6">
        {/* Avatar */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
        </div>

        {isEditing ? (
          <form
            action={formAction}
            onSubmit={(e) => { track('continue-clicked', { screen: 'my-profile', label: 'save-name' }); handleSuccess(e) }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Name</label>
              <input
                name="name"
                type="text"
                defaultValue={displayName}
                placeholder="Your name"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                autoFocus
              />
              {state.error && (
                <p className="mt-1.5 text-xs text-destructive">{state.error}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { track('button-clicked', { screen: 'my-profile', label: 'cancel-edit-name' }); setIsEditing(false) }}
                className="flex-1 bg-muted text-foreground rounded-xl py-3 font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-1">
            {/* Name row */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">
                    {displayName || <span className="text-muted-foreground italic">Not set</span>}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { track('button-clicked', { screen: 'my-profile', label: 'edit-name' }); setIsEditing(true) }}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Edit3 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Email row */}
            <div className="flex items-center gap-3 py-3">
              <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{email}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="bg-accent/30 border border-border rounded-xl p-4">
        <p className="text-sm text-muted-foreground text-center">
          Your email address is used for authentication and cannot be changed.
        </p>
      </div>
    </div>
  )
}
