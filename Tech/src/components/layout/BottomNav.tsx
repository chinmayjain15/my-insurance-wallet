'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Home, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'

const navItems = [
  { href: '/policies', label: 'My Policies', trackLabel: 'my-policies', icon: FileText, special: false },
  { href: '/home', label: 'Home', trackLabel: 'home', icon: Home, special: true },
  { href: '/other-policies', label: 'Shared with Me', trackLabel: 'shared-with-me', icon: Share2, special: false },
]

function screenFromPath(pathname: string): string {
  if (pathname.startsWith('/other-policies')) return 'shared-with-me'
  if (pathname.startsWith('/policies')) return 'my-policies'
  if (pathname.startsWith('/home')) return 'home'
  return pathname.replace('/', '')
}

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-3 pb-safe">
        {navItems.map(({ href, label, trackLabel, icon: Icon, special }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')

          if (special) {
            return (
              <Link
                key={href}
                href={href}
                onClick={() => track('option-clicked', { screen: screenFromPath(pathname), label: trackLabel })}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[60px] min-h-[44px] -mt-6 transition-all',
                  isActive ? 'scale-110' : 'scale-100'
                )}
              >
                <div
                  className={cn(
                    'rounded-full p-3 mb-1',
                    isActive
                      ? 'bg-primary shadow-lg'
                      : 'bg-accent border-2 border-border'
                  )}
                >
                  <Icon
                    className={cn('w-5 h-5', isActive ? 'text-primary-foreground' : 'text-muted-foreground')}
                    strokeWidth={2.5}
                  />
                </div>
                <span className={cn('text-[11px]', isActive ? 'text-primary' : 'text-muted-foreground')}>
                  {label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              onClick={() => track('option-clicked', { screen: screenFromPath(pathname), label: trackLabel })}
              className={cn(
                'flex flex-col items-center justify-center min-w-[60px] min-h-[44px] gap-1 px-3 py-2 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[11px]">{label}</span>
            </Link>
          )
        })}
      </div>
      <style>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .pb-safe { padding-bottom: max(0.75rem, env(safe-area-inset-bottom)); }
        }
      `}</style>
    </nav>
  )
}
