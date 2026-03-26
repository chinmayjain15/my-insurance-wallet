'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react'
import { addContact } from '@/lib/actions/contacts'

export default function AddContactForm({ returnTo }: { returnTo: string }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(addContact, { error: '' })

  return (
    <div className="min-h-screen flex flex-col">
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
          <h1 className="text-foreground">Add Contact</h1>
        </div>
      </div>

      <form action={formAction} className="flex-1">
        <div className="max-w-lg mx-auto w-full px-6 py-6 space-y-6">

          <p className="text-muted-foreground">
            Add a trusted family member or friend to share your insurance policies with them.
          </p>

          {/* Pass returnTo through the form */}
          <input type="hidden" name="returnTo" value={returnTo} />

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Contact name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Priya Sharma"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
              Phone number
            </label>
            <div className="flex gap-2">
              <div className="flex items-center bg-muted border border-border rounded-xl px-3 py-3 text-muted-foreground text-sm font-medium">
                +91
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              They will receive an SMS when you share a policy with them
            </p>
          </div>

          {/* Info box */}
          <div className="bg-accent border border-border rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">What happens next?</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                'Your contact will be added to your list',
                'You can choose which policies to share with them',
                "They'll receive an SMS notification when you share a policy",
                'You can revoke access anytime',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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
                Adding…
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Add Contact
              </>
            )}
          </button>

        </div>
      </form>
    </div>
  )
}
