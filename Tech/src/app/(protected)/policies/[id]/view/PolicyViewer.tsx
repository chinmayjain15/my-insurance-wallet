'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileX, ExternalLink } from 'lucide-react'
import { track } from '@/lib/analytics'

function isPdf(url: string) {
  return url.toLowerCase().includes('.pdf') || url.includes('pdf')
}

export default function PolicyViewer({
  policyId,
  signedUrl,
  error,
  source,
}: {
  policyId: string
  signedUrl: string
  error: string
  source: 'my-policy' | 'shared-with-me'
}) {
  const router = useRouter()

  useEffect(() => {
    track('view-policy-document', { source })
    if (error) track('error-viewed', { screen: 'view-policy-document', label: 'document-load-failed', source })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border shrink-0">
        <div className="max-w-lg mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => { track('back-clicked', { screen: 'view-policy-document', label: 'back', source }); router.back() }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
          {signedUrl && (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('option-clicked', { screen: 'view-policy-document', label: 'open-in-browser', source })}
              className="flex items-center gap-1.5 text-primary text-sm hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Open in browser
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {error ? (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                <FileX className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">Couldn&apos;t load document</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                onClick={() => { track('back-clicked', { screen: 'view-policy-document', label: 'back', source }); router.back() }}
                className="text-primary text-sm hover:underline"
              >
                Go back
              </button>
            </div>
          </div>
        ) : isPdf(signedUrl) ? (
          <iframe
            src={signedUrl}
            className="flex-1 w-full"
            style={{ minHeight: 'calc(100vh - 65px)' }}
            title="Policy document"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/30 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={signedUrl}
              alt="Policy document"
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  )
}
