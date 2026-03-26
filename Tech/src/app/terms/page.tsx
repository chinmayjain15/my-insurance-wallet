import { FileText } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <BackButton />
          <h1 className="text-foreground">Terms &amp; Conditions</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary/10 rounded-full p-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-base">1. Acceptance of Terms</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing and using My Insurance Store, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use the service.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base">2. Use License</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Permission is granted to use My Insurance Store for personal, non-commercial purposes only. You may not reproduce, distribute, or create derivative works from any content within this application without explicit written permission.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base">3. User Responsibilities</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. You agree to notify us immediately of any unauthorised use of your account.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base">4. Data Storage</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All policy documents you upload are encrypted and stored securely. You retain full ownership of your documents. We do not access, share, or use your documents for any purpose other than providing you the service.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base">5. Sharing and Privacy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You control who has access to your shared documents. Sharing a policy with a contact grants them view-only access. You can revoke access at any time. We are not responsible for actions taken by contacts you choose to share documents with.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base">6. Modifications</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms. We will notify users of significant changes via the app.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">Last updated: March 26, 2026</p>
        </div>
      </div>
    </div>
  )
}
