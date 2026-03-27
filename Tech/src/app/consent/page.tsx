'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, Lock, Share2, Database } from 'lucide-react'
import { acceptConsent } from '@/lib/actions/auth'

export default function ConsentPage() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  function handleScroll() {
    const el = scrollRef.current
    if (el && el.scrollHeight - el.scrollTop <= el.clientHeight + 10) {
      setHasScrolled(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 bg-background">
      {/* Back button */}
      <div className="pt-6 pb-4">
        <button
          onClick={() => router.push('/auth')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full pb-8">
        <h2 className="mb-2 text-foreground">Privacy &amp; Data Use</h2>
        <p className="text-muted-foreground mb-6">
          Please review how we handle your information
        </p>

        {/* Scrollable consent content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-card border border-border rounded-xl p-5 mb-6 space-y-5"
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

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mb-4">
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

        {/* Accept button */}
        <form action={acceptConsent}>
          <button
            type="submit"
            disabled={!accepted || !hasScrolled}
            className="w-full bg-primary text-primary-foreground rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Accept &amp; Continue
          </button>
        </form>
      </div>
    </div>
  )
}
