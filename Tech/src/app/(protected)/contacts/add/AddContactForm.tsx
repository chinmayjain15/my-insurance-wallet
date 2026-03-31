'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react'
import { addContact } from '@/lib/actions/contacts'
import { track } from '@/lib/analytics'

export default function AddContactForm({ returnTo }: { returnTo: string }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(addContact, { error: '' })

  useEffect(() => { track('view-add-contact') }, [])
  useEffect(() => { if (state.error) track('error-viewed', { screen: 'add-contact', label: 'add-contact-failed' }) }, [state.error])

  return (
    <div className="min-h-screen flex flex-col px-6">
      {/* Back button */}
      <div className="pt-6 pb-4">
        <button
          onClick={() => { track('back-clicked', { screen: 'add-contact', label: 'back' }); router.back() }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      <form action={formAction} onSubmit={() => track('continue-clicked', { screen: 'add-contact', label: 'add-contact' })} className="flex-1">
        <div className="max-w-lg mx-auto w-full py-6 space-y-6">

          <div>
            <h2 className="mb-2 text-foreground">Add Contact</h2>
            <p className="text-muted-foreground">
              Add a trusted family member or friend to share your insurance policies with them.
            </p>
          </div>

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
              onBlur={e => { if (e.target.value) track('field-entered', { screen: 'add-contact', label: 'contact-name' }) }}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              placeholder="e.g. priya@example.com"
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              onBlur={e => { if (e.target.value) track('field-entered', { screen: 'add-contact', label: 'contact-email' }) }}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              They will receive an email when you share a policy with them
            </p>
          </div>

          {/* Info box */}
          <div className="bg-accent border border-border rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">What happens next?</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                'Your contact will be added to your list',
                'You can choose which policies to share with them',
                "They'll receive an email notification when you share a policy",
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
