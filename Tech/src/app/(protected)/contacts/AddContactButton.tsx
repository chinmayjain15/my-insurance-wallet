'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { track } from '@/lib/analytics'

export function AddContactButton() {
  return (
    <Link
      href="/contacts/add"
      onClick={() => track('option-clicked', { screen: 'my-contacts', label: 'add-contact' })}
      className="bg-primary text-primary-foreground rounded-full p-2.5 hover:opacity-90 transition-opacity"
    >
      <Plus className="w-5 h-5" />
    </Link>
  )
}
