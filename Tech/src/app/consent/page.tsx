'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Shield, Lock, Share2, Database, Mail, CheckCircle2 } from 'lucide-react'
import { acceptConsent, acceptConsentOnly } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'

export default function ConsentPage() {
  return (
    <Suspense>
      <ConsentPageInner />
    </Suspense>
  )
}

function ConsentPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gmailOnly = searchParams.get('gmail_only') === 'true'

  const [accepted, setAccepted] = useState(gmailOnly)
  const [hasScrolled, setHasScrolled] = useState(gmailOnly)
  const [gmailOptIn, setGmailOptIn] = useState(gmailOnly)
  const [isPending, setIsPending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const viewTracked = useRef(false)

  useEffect(() => {
    if (viewTracked.current) return
    viewTracked.current = true
    track('view-consent')
  }, [])

  function handleScroll() {
    const el = scrollRef.current
    if (el && el.scrollHeight - el.scrollTop <= el.clientHeight + 10) {
      setHasScrolled(true)
    }
  }

  async function handleContinue() {
    if (!accepted || !hasScrolled || isPending) return
    setIsPending(true)
    track('continue-clicked', { screen: 'consent', label: 'accept-and-continue', gmail_opt_in: gmailOptIn })

    if (gmailOptIn) {
      // Save consent first, then trigger Gmail OAuth
      const result = await acceptConsentOnly()
      if ('error' in result) {
        setIsPending(false)
        return
      }
      track('action-completed', { screen: 'consent', label: 'sign-in' })
      const supabase = createClient()
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/gmail-callback`,
          scopes: 'https://www.googleapis.com/auth/gmail.readonly',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      // OAuth redirects the page — no further code runs
    } else {
      track('action-completed', { screen: 'consent', label: 'sign-in' })
      await acceptConsent()
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 bg-background">
      {/* Back button */}
      <div className="pt-6 pb-4">
        <button
          onClick={() => { track('back-clicked', { screen: 'consent', label: 'back' }); router.push('/auth') }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full pb-8">
        <h2 className="mb-2 text-foreground">{gmailOnly ? 'Connect your Gmail' : 'Privacy & Data Use'}</h2>
        <p className="text-muted-foreground mb-6">
          {gmailOnly
            ? 'We found that your Gmail isn\'t connected yet. Connect it to auto-import your insurance policies.'
            : 'Please review how we handle your information'}
        </p>

        {/* Scrollable consent content — hidden in gmail_only mode */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto bg-card border border-border rounded-xl p-5 mb-6 space-y-5 ${gmailOnly ? 'hidden' : ''}`}
          style={{ maxHeight: '50vh' }}
        >
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="bg-accent rounded-lg p-2 shrink-0">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="mb-1 text-foreground">Data We Collect</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We collect your email address for authentication, and the insurance policy documents you choose to upload. We also store the names and email addresses of contacts you add for sharing purposes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-accent rounded-lg p-2 shrink-0">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="mb-1 text-foreground">How We Store It</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All uploaded documents are stored encrypted at rest. Your data is transmitted over secure HTTPS connections. We use industry-standard security practices to protect your information.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-accent rounded-lg p-2 shrink-0">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="mb-1 text-foreground">Who Can Access It</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Only the trusted contacts you explicitly add and share policies with can view those specific documents. We never share your data with third parties for marketing or advertising purposes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-accent rounded-lg p-2 shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="mb-1 text-foreground">Your Control</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You can delete any uploaded policy or remove any contact at any time. When you delete your account, all your data is permanently removed from our systems.
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="mb-2 text-foreground">Important Notice</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                My Insurance Store is designed for personal use and is not intended for collecting personally identifiable information beyond what is necessary for the service, or for securing highly sensitive data beyond standard encryption practices.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By using this service, you acknowledge that you understand the nature of the data being stored and accept responsibility for the information you choose to upload and share.
              </p>
            </div>
          </div>

          {!hasScrolled && (
            <p className="text-center text-xs text-muted-foreground pt-2">
              Scroll to read all terms
            </p>
          )}
        </div>

        {/* Checkbox — hidden in gmail_only mode */}
        <label className={`flex items-start gap-3 cursor-pointer mb-6 ${gmailOnly ? 'hidden' : ''}`}>
          <div className="flex items-center h-6">
            <input
              type="checkbox"
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              disabled={!hasScrolled}
              className="w-5 h-5 rounded border-2 border-border bg-card checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <span className="text-sm text-foreground flex-1">
            I have read and accept the privacy policy and terms of data use
          </span>
        </label>

        {/* Gmail opt-in */}
        <div
          className={`rounded-xl border-2 p-4 mb-6 transition-colors ${
            gmailOptIn ? 'border-primary bg-accent/50' : 'border-border bg-card'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="bg-accent rounded-lg p-2 shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-foreground text-sm font-medium">Auto-import from email</h4>
                <span className="text-xs text-muted-foreground shrink-0">Optional</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Allow us to scan your last 12 months of emails to find insurance policies sent by insurers and import them automatically. We only read emails — we never send, delete, or modify anything.
              </p>
              <button
                type="button"
                onClick={() => {
                  setGmailOptIn(v => !v)
                  track('toggle-clicked', { screen: 'consent', label: 'gmail-opt-in', value: !gmailOptIn })
                }}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  gmailOptIn ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${gmailOptIn ? 'text-primary' : 'text-muted-foreground'}`} />
                {gmailOptIn ? 'Yes, scan my email for policies' : 'Enable email scanning'}
              </button>
            </div>
          </div>
        </div>

        {/* Accept button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!accepted || !hasScrolled || isPending}
          className="w-full bg-primary text-primary-foreground rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Please wait…' : gmailOnly ? 'Connect Gmail' : 'Accept & Continue'}
        </button>
      </div>
    </div>
  )
}
