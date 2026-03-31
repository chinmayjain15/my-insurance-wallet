'use client'

import { Share2 } from 'lucide-react'
import { track } from '@/lib/analytics'

export default function ReferAFriend({ referrer }: { referrer: string }) {
  function handleShare() {
    track('option-clicked', { screen: 'shared-with-me', label: 'refer-loved-ones' })
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const utmReferrer = encodeURIComponent(referrer.replace(/\s+/g, '_'))
    const appLink = `${baseUrl}?utm_source=referral&utm_medium=whatsapp&utm_referrer=${utmReferrer}`
    const message = encodeURIComponent(
      `Hey! I use My Insurance Store to keep all my family's insurance policies organised in one place and share them easily. It's really handy — check it out: ${appLink}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  return (
    <button
      onClick={handleShare}
      className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-2 border-purple-400/30 text-foreground rounded-xl px-6 py-3 font-medium transition-all shadow-lg shadow-purple-500/10 flex items-center justify-center gap-3"
    >
      <div className="bg-purple-500/20 rounded-lg p-2">
        <Share2 className="w-5 h-5 text-purple-400" />
      </div>
      <span className="font-medium">Refer your loved ones</span>
    </button>
  )
}
