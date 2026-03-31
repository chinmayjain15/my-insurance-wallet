import BackButton from '@/components/ui/BackButton'
import ContactsList from './ContactsList'
import ContactsSubtitle from './ContactsSubtitle'
import { PageViewTracker } from '@/components/PageViewTracker'
import { AddContactButton } from './AddContactButton'

export default function ContactsPage() {
  return (
    <div className="min-h-screen pb-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-1">
            <BackButton screen="my-contacts" />
            <h1 className="text-foreground">Contacts</h1>
            <AddContactButton />
          </div>
          <ContactsSubtitle />
        </div>
      </div>
      <PageViewTracker event="view-my-contacts" />
      <ContactsList />
    </div>
  )
}
