'use client'

import { useActionState } from 'react'
import { signInWithEmail, demoSignIn } from '@/lib/actions/auth'
import { Shield, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const IS_STAGING = process.env.NEXT_PUBLIC_APP_ENV === 'staging'

const initialState = { error: '' }

export default function AuthPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, initialState)

  function handleGoogleSignIn() {
    const supabase = createClient()
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

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

        <div className="w-full max-w-sm mb-8 space-y-3">

          {IS_STAGING ? (
            /* Staging: email bypass */
            <form action={formAction}>
              <label htmlFor="email" className="block mb-2 text-sm text-muted-foreground">
                Enter your email to get started
              </label>
              <div className="flex bg-white dark:bg-white/95 border-2 border-border rounded-xl p-1 shadow-lg">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  inputMode="email"
                  required
                  className="flex-1 bg-transparent px-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:outline-none min-w-0"
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
                <p className="text-sm text-red-500 mt-2">{state.error}</p>
              )}
            </form>
          ) : (
            /* Production: Google SSO */
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white/95 text-gray-900 rounded-xl px-6 py-3.5 font-medium hover:bg-gray-50 dark:hover:bg-white transition-colors shadow-lg border-2 border-border"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}

          {/* Demo mode */}
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

        {IS_STAGING && (
          <p className="mt-8 text-center text-xs text-amber-500/50">
            Staging — authentication bypassed
          </p>
        )}
      </div>
    </div>
  )
}
