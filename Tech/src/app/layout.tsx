import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AmplitudeProvider } from '@/components/AmplitudeProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'My Insurance Store',
  description: "Your family's safety net, always within reach",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Apply saved theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('miw_theme');
                const html = document.documentElement;
                if (t === 'light') { html.classList.remove('dark'); }
                else { html.classList.add('dark'); }
              } catch {}
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased font-sans">
        <AmplitudeProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AmplitudeProvider>
      </body>
    </html>
  )
}
