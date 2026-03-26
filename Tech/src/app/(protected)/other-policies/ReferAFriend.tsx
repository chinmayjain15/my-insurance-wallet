'use client'

import { Gift, Share2 } from 'lucide-react'

export default function ReferAFriend({ referrer }: { referrer: string }) {
  function handleShare() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const utmReferrer = encodeURIComponent(referrer.replace(/\s+/g, '_'))
    const appLink = `${baseUrl}?utm_source=referral&utm_medium=whatsapp&utm_referrer=${utmReferrer}`

    const message = encodeURIComponent(
      `Hey! I use My Insurance Store to keep all my family's insurance policies organised in one place and share them easily. It's really handy — check it out: ${appLink}`
    )

    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-2.5 shrink-0">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground mb-1">Refer a Friend</p>
          <p className="text-sm text-muted-foreground mb-3">
            Help your family and friends keep their insurance organised. Share My Insurance Store with them.
          </p>
          <button
            onClick={handleShare}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share via WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}
