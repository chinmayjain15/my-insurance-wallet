'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { track } from '@/lib/analytics'

export default function BackButton({ screen }: { screen: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => { track('back-clicked', { screen, label: 'back' }); router.back() }}
      className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  )
}
