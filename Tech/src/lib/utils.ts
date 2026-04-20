import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Renewal helpers ───────────────────────────────────────────────────────────

export type ExpiryStatus = 'expired' | 'soon' | 'ok'

const SOON_THRESHOLD_DAYS = 30

/** Returns days until expiry (negative = already expired). */
export function daysUntilExpiry(expiryDateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDateStr)
  expiry.setHours(0, 0, 0, 0)
  return Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getExpiryStatus(expiryDateStr: string): ExpiryStatus {
  const days = daysUntilExpiry(expiryDateStr)
  if (days < 0)                       return 'expired'
  if (days <= SOON_THRESHOLD_DAYS)    return 'soon'
  return 'ok'
}

/** Human-readable label: "Expired", "Expires in 3 days", "Expires 10 May 2026". */
export function expiryLabel(expiryDateStr: string): string {
  const days = daysUntilExpiry(expiryDateStr)
  if (days < 0)   return 'Expired'
  if (days === 0) return 'Expires today'
  if (days === 1) return 'Expires tomorrow'
  if (days <= SOON_THRESHOLD_DAYS) return `Expires in ${days} days`
  return `Expires ${new Date(expiryDateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

/** Format rupee amounts as ₹X Cr / ₹X L / ₹X. */
export function formatAmount(rupees: number): string {
  if (rupees >= 10_000_000) return `₹${(rupees / 10_000_000).toFixed(rupees % 10_000_000 === 0 ? 0 : 2)} Cr`
  if (rupees >= 100_000)    return `₹${(rupees / 100_000).toFixed(rupees % 100_000 === 0 ? 0 : 2)} L`
  return `₹${rupees.toLocaleString('en-IN')}`
}
