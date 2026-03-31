'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Moon, Sun, LogOut, ArrowLeft, Shield, Trash2, Loader2, Edit3 } from 'lucide-react'
import { useActionState } from 'react'
import { signOut, deleteAccount } from '@/lib/actions/auth'
import { useTheme } from '@/components/ThemeProvider'
import { useAppData } from '@/components/AppDataProvider'
import { track } from '@/lib/analytics'

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { userEmail, userName } = useAppData()
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteOtp, setDeleteOtp] = useState('')
  const [deleteState, deleteAction, isDeleting] = useActionState(deleteAccount, { error: '' })
  const viewTracked = useRef(false)

  useEffect(() => {
    if (viewTracked.current) return
    viewTracked.current = true
    track('view-settings')
  }, [])
  useEffect(() => { if (deleteState.error) track('error-viewed', { screen: 'settings', label: 'delete-account-failed' }) }, [deleteState.error])

  return (
    <div className="min-h-screen pb-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={() => { track('back-clicked', { screen: 'settings', label: 'back' }); router.back() }}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-foreground">Settings</h1>
            <div className="w-9" />
          </div>
          <p className="text-sm text-muted-foreground text-center">Manage your account and preferences</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">

        {/* Account */}
        {userEmail && (
          <div>
            <h3 className="mb-3">Account</h3>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-accent rounded-full p-2.5 shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {userName ?? <span className="text-muted-foreground italic">Enter your name</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">{userEmail}</p>
                  </div>
                </div>
                {!userName && (
                  <Link href="/profile" onClick={() => track('option-clicked', { screen: 'settings', label: 'edit-profile' })} className="p-2 rounded-lg hover:bg-accent transition-colors">
                    <Edit3 className="w-4 h-4 text-muted-foreground" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appearance */}
        <div>
          <h3 className="mb-3">Appearance</h3>
          <div className="bg-card border border-border rounded-xl">
            <button
              onClick={() => { track('option-clicked', { screen: 'settings', label: 'toggle-theme', theme: theme === 'dark' ? 'light' : 'dark' }); toggleTheme() }}
              className="w-full p-4 flex items-center justify-between hover:bg-accent transition-colors rounded-xl"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark'
                  ? <Moon className="w-5 h-5 text-primary" />
                  : <Sun className="w-5 h-5 text-primary" />
                }
                <div className="text-left">
                  <p className="font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </span>
                <div className={`w-11 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-5 h-5 bg-background rounded-full m-0.5 transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* About */}
        <div>
          <h3 className="mb-3">About</h3>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              My Insurance Store helps you store and share insurance policies with trusted family members and friends.
            </p>
            <div className="text-xs text-muted-foreground">Version 1.0 • March 2026</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <form action={signOut}>
            <button
              type="submit"
              onClick={() => track('action-completed', { screen: 'settings', label: 'log-out' })}
              className="w-full bg-muted text-foreground rounded-lg px-6 py-3 font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </form>

          <button
            onClick={() => { track('button-clicked', { screen: 'settings', label: 'delete-account-tapped' }); setShowDeleteConfirm(true) }}
            className="w-full bg-destructive text-destructive-foreground rounded-lg px-6 py-3 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>

        {process.env.NEXT_PUBLIC_APP_ENV === 'staging' && (
          <p className="text-center text-xs text-amber-500/50">Staging environment</p>
        )}
      </div>

      {/* Delete Account bottom sheet */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-background rounded-t-3xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
            <h3 className="mb-2">Delete your account?</h3>
            <div className="mb-6 space-y-3">
              <p className="text-sm text-muted-foreground">This will permanently delete:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  'All your uploaded insurance policies',
                  'All your contacts',
                  'All sharing permissions you\'ve granted',
                  'Your account data',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground pt-2">This action cannot be undone.</p>
            </div>

            <form action={deleteAction} onSubmit={() => track('action-completed', { screen: 'settings', label: 'account-deleted' })}>
              <div className="mb-4">
                <label className="block mb-2 text-sm text-muted-foreground">
                  Enter any 6-digit code to confirm
                </label>
                <input
                  name="otp"
                  type="tel"
                  value={deleteOtp}
                  onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center tracking-widest"
                />
                {deleteState.error && (
                  <p className="mt-2 text-xs text-destructive text-center">{deleteState.error}</p>
                )}
                {process.env.NEXT_PUBLIC_APP_ENV === 'staging' && (
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Staging: enter any 6 digits
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={deleteOtp.length !== 6 || isDeleting}
                  className="w-full bg-destructive text-destructive-foreground rounded-lg px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                  ) : (
                    'Delete Permanently'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { track('button-clicked', { screen: 'settings', label: 'delete-account-cancelled' }); setShowDeleteConfirm(false); setDeleteOtp('') }}
                  className="w-full bg-muted text-foreground rounded-lg px-6 py-3 font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
