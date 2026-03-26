'use client'

import { useAppData } from '@/components/AppDataProvider'

export default function ContactsSubtitle() {
  const { contacts } = useAppData()
  return (
    <p className="text-sm text-muted-foreground text-center mt-0.5">
      {contacts.length} trusted {contacts.length === 1 ? 'contact' : 'contacts'}
    </p>
  )
}
