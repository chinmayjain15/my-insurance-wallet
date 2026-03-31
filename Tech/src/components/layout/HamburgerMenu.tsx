'use client'

import { X, User, Users, Settings, LogOut, Share2, Sun, Moon, FileText, Shield } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'
import { useAppData } from '@/components/AppDataProvider'
import { signOut } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'

interface HamburgerMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const { theme, toggleTheme } = useTheme()
  const { userEmail, userName } = useAppData()

  if (!isOpen) return null

  function handleReferShare() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const appLink = `${baseUrl}?utm_source=referral&utm_medium=whatsapp`
    const message = encodeURIComponent(
      `Hey! I use My Insurance Store to keep all my family's insurance policies organised in one place and share them easily. It's really handy — check it out: ${appLink}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}>
      <div
        className="absolute top-0 left-0 w-80 max-w-[85vw] h-full bg-background border-r border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {userName && (
                <p className="font-medium text-foreground truncate">{userName}</p>
              )}
              {userEmail && (
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              )}
            </div>
            <button
              onClick={() => { track('button-clicked', { screen: 'hamburger-menu', label: 'close' }); onClose() }}
              className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-1">
          {/* My Profile */}
          <Link href="/profile" onClick={() => { track('option-clicked', { screen: 'hamburger-menu', label: 'my-profile' }); onClose() }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors">
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground">My Profile</span>
          </Link>

          {/* My Contacts */}
          <Link href="/contacts" onClick={() => { track('option-clicked', { screen: 'hamburger-menu', label: 'my-contacts' }); onClose() }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground">My Contacts</span>
          </Link>

          {/* Appearance toggle */}
          <button
            onClick={() => { track('option-clicked', { screen: 'hamburger-menu', label: 'toggle-appearance' }); toggleTheme() }}
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

          {/* Settings */}
          <Link href="/settings" onClick={() => { track('option-clicked', { screen: 'hamburger-menu', label: 'settings' }); onClose() }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground">Settings</span>
          </Link>
        </div>

        {/* Bottom: Refer + Legal + Log Out — pinned */}
        <div className="absolute bottom-20 left-0 right-0 p-4">
          <button
            onClick={() => { track('option-clicked', { screen: 'hamburger-menu', label: 'refer-loved-ones' }); handleReferShare() }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-colors border border-purple-500/20"
          >
            <Share2 className="w-5 h-5 text-purple-400" />
            <span className="text-foreground font-medium">Refer your loved ones</span>
          </button>

          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/terms"
              onClick={() => { track('option-clicked', { screen: 'hamburger-menu', label: 'terms-and-conditions' }); onClose() }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Terms &amp; Conditions</span>
            </Link>
            <Link
              href="/privacy"
              onClick={() => { track('option-clicked', { screen: 'hamburger-menu', label: 'privacy-policy' }); onClose() }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Privacy Policy</span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                onClick={() => {
                  track('option-clicked', { screen: 'hamburger-menu', label: 'log-out' })
                  track('action-completed', { screen: 'hamburger-menu', label: 'log-out' })
                }}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Log Out</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
