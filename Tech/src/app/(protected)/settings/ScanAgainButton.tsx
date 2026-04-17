'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Loader2, WifiOff } from 'lucide-react'
import { triggerGmailScan } from '@/lib/actions/gmail'
import { disconnectGmail } from '@/lib/actions/gmail-disconnect'

export default function GmailSettingsSection() {
  const router = useRouter()
  const [scanPending, startScanTransition] = useTransition()
  const [disconnectPending, startDisconnectTransition] = useTransition()
  const [scanStatus, setScanStatus] = useState<string | null>(null)
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)

  function handleScan() {
    setScanStatus(null)
    startScanTransition(async () => {
      const result = await triggerGmailScan()
      if (result.error) {
        setScanStatus(result.error)
        return
      }
      if (result.totalCandidates > 0) {
        router.push('/import-review')
      } else {
        setScanStatus('No new policies found in your email.')
      }
    })
  }

  function handleDisconnect() {
    startDisconnectTransition(async () => {
      await disconnectGmail()
      setShowDisconnectConfirm(false)
      setScanStatus('Gmail disconnected.')
    })
  }

  return (
    <>
      <button
        onClick={handleScan}
        disabled={scanPending || disconnectPending}
        className="w-full p-4 flex items-center justify-between hover:bg-accent transition-colors rounded-t-xl disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-primary" />
          <div className="text-left">
            <p className="font-medium text-foreground">Scan email again</p>
            <p className="text-sm text-muted-foreground">Find new policies in your Gmail inbox</p>
          </div>
        </div>
        {scanPending && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
      </button>

      {scanStatus && (
        <p className="px-4 pb-2 text-xs text-muted-foreground">{scanStatus}</p>
      )}

      <div className="border-t border-border" />

      <button
        onClick={() => setShowDisconnectConfirm(true)}
        disabled={scanPending || disconnectPending}
        className="w-full p-4 flex items-center gap-3 hover:bg-accent transition-colors rounded-b-xl disabled:opacity-50"
      >
        <WifiOff className="w-5 h-5 text-muted-foreground" />
        <div className="text-left">
          <p className="font-medium text-foreground">Disconnect Gmail</p>
          <p className="text-sm text-muted-foreground">Stop email scanning and remove access</p>
        </div>
      </button>

      {/* Disconnect confirmation sheet */}
      {showDisconnectConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowDisconnectConfirm(false)}
        >
          <div
            className="bg-background rounded-t-3xl w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
            <h3 className="mb-2">Disconnect Gmail?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This removes your Gmail access token and deletes any pending scan results. Previously imported policies are not affected.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleDisconnect}
                disabled={disconnectPending}
                className="w-full bg-destructive text-destructive-foreground rounded-lg px-6 py-3 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {disconnectPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Disconnect
              </button>
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="w-full bg-muted text-foreground rounded-lg px-6 py-3 font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
