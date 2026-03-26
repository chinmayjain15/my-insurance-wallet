'use client'

import { useActionState } from 'react'
import { signInWithPhone, demoSignIn } from '@/lib/actions/auth'
import { Shield, ArrowRight } from 'lucide-react'

const initialState = { error: '' }

export default function AuthPage() {
  const [state, formAction, isPending] = useActionState(signInWithPhone, initialState)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">

        {/* Hero icon */}
        <div className="rounded-3xl p-4 mb-6" style={{ background: 'linear-gradient(135deg, var(--health), var(--life))' }}>
          <Shield className="w-16 h-16 text-white" strokeWidth={1.5} />
        </div>

        <h1 className="mb-3 text-center text-foreground">My Insurance Store</h1>
        <p className="text-center text-muted-foreground max-w-sm mb-12">
          Store your insurance policies in one secure place. Share them with trusted family members when it matters most.
        </p>

        {/* Phone form */}
        <div className="w-full max-w-sm mb-8 space-y-3">
          <form action={formAction}>
            <label htmlFor="phone" className="block mb-2 text-sm text-muted-foreground">
              Enter your phone number to get started
            </label>
            <div className="flex bg-white dark:bg-white/95 border-2 border-border rounded-xl p-1 shadow-lg">
              <div className="flex items-center px-3 py-2.5 text-gray-700 font-medium shrink-0">
                +91
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="10-digit mobile number"
                maxLength={10}
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                required
                className="flex-1 bg-transparent px-2 py-2.5 text-gray-900 placeholder:text-gray-500 focus:outline-none min-w-0"
              />
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            {state?.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}
          </form>

          {/* Demo mode — separate form, outside the phone form */}
          <form action={demoSignIn} className="text-center">
            <button
              type="submit"
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground underline underline-offset-2 transition-colors"
            >
              Try demo mode
            </button>
          </form>
        </div>

        {/* Features */}
        <div className="w-full max-w-sm space-y-3">
          {[
            { title: 'Secure Storage', desc: 'Your policies, encrypted and safe' },
            { title: 'Easy Sharing', desc: 'Grant access to family and friends' },
            { title: 'Always Accessible', desc: 'Available when you need it most' },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-card border border-border rounded-lg p-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {process.env.NEXT_PUBLIC_APP_ENV === 'staging' && (
          <p className="mt-8 text-center text-xs text-amber-500/50">
            Staging — authentication bypassed
          </p>
        )}
      </div>
    </div>
  )
}
