'use client'

import { X, User, Users, Settings, LogOut, Share2, Sun, Moon, FileText, Shield } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'
import { useAppData } from '@/components/AppDataProvider'
import { signOut } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

interface HamburgerMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const { theme, toggleTheme } = useTheme()
  const { userPhone } = useAppData()

  if (!isOpen) return null

  function handleReferShare() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const utmReferrer = encodeURIComponent(userPhone || 'friend')
    const appLink = `${baseUrl}?utm_source=referral&utm_medium=whatsapp&utm_referrer=${utmReferrer}`
    const message = encodeURIComponent(
      `Hey! I use My Insurance Store to keep all my family's insurance policies organised in one place and share them easily. It's really handy — check it out: ${appLink}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
    onClose()
  }

  const menuItems = [
    { icon: User, label: 'My Profile', href: '/profile' },
    { icon: Users, label: 'My Contacts', href: '/contacts' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}>
      <div
        className="absolute top-0 left-0 w-80 max-w-[85vw] h-full bg-background border-r border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {userPhone && (
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">+91 {userPhone}</p>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-1">
          {menuItems.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
            >
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{label}</span>
            </Link>
          ))}

          {/* Log Out */}
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Log Out</span>
            </button>
          </form>

          {/* Appearance toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              {theme === 'dark'
                ? <Moon className="w-5 h-5 text-muted-foreground" />
                : <Sun className="w-5 h-5 text-muted-foreground" />
              }
              <span className="text-foreground">Appearance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground capitalize">{theme}</span>
              <div className="relative w-11 h-6 bg-muted rounded-full">
                <div
                  className={cn(
                    'absolute top-0.5 w-5 h-5 bg-primary rounded-full transition-all duration-200',
                    theme === 'dark' ? 'left-5' : 'left-0.5'
                  )}
                />
              </div>
            </div>
          </button>
        </div>

        {/* Bottom: Refer + Legal — pinned */}
        <div className="absolute bottom-20 left-0 right-0 p-4">
          <button
            onClick={handleReferShare}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-colors border border-purple-500/20"
          >
            <Share2 className="w-5 h-5 text-purple-400" />
            <span className="text-foreground font-medium">Refer your loved ones</span>
          </button>

          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/terms"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Terms &amp; Conditions</span>
            </Link>
            <Link
              href="/privacy"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Privacy Policy</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
