import Link from 'next/link'
import { Plus } from 'lucide-react'
import BackButton from '@/components/ui/BackButton'
import ContactsList from './ContactsList'
import ContactsSubtitle from './ContactsSubtitle'

export default function ContactsPage() {
  return (
    <div className="min-h-screen pb-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-1">
            <BackButton />
            <h1 className="text-foreground">Contacts</h1>
            <Link href="/contacts/add" className="bg-primary text-primary-foreground rounded-full p-2.5 hover:opacity-90 transition-opacity">
              <Plus className="w-5 h-5" />
            </Link>
          </div>
          <ContactsSubtitle />
        </div>
      </div>
      <ContactsList />
    </div>
  )
}
