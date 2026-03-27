import { Shield } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <BackButton />
          <h1 className="text-foreground">Privacy Policy</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-primary/10 rounded-full p-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-base">Information We Collect</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We collect information you provide directly to us, including your email address, name, and insurance policy documents you choose to upload. We also collect basic usage data to improve the service.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base">How We Use Your Information</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your information is used solely to provide, maintain, and improve our services, and to communicate with you about your account. We do not use your data for advertising or sell it to third parties.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base">Data Security</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your personal information and policy documents. All data is encrypted both in transit and at rest using AES-256 encryption.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base">Information Sharing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We only share your policy information with contacts you explicitly choose to share with. We never sell your personal information to third parties or share it with advertisers.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base">Your Rights</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You have the right to access, update, or delete your personal information at any time through your account settings. You may also request a complete export of your data by contacting us.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base">Data Retention</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide you our services. You can request deletion of your account and all associated data at any time from the Settings page.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base">Contact Us</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through the app settings or reach out via the feedback option in the menu.
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
