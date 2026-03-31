'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, Heart, Activity, Car, FileText, Plus } from 'lucide-react'
import HamburgerMenu from '@/components/layout/HamburgerMenu'
import { useAppData } from '@/components/AppDataProvider'
import { PolicyType } from '@/types'
import { track } from '@/lib/analytics'

const policyTypes: { type: PolicyType; icon: React.ElementType; cssVar: string }[] = [
  { type: 'Health', icon: Activity, cssVar: '--health' },
  { type: 'Life', icon: Heart, cssVar: '--life' },
  { type: 'Term', icon: FileText, cssVar: '--term' },
  { type: 'Vehicle', icon: Car, cssVar: '--vehicle' },
  { type: 'Other', icon: FileText, cssVar: '--other' },
]

const gridClasses = [
  'col-span-2 row-span-2', // Health — large
  'col-span-2',
  'col-span-2',
  'col-span-2',
  'col-span-2',
]

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { policies } = useAppData()
  const viewTracked = useRef(false)

  useEffect(() => {
    if (viewTracked.current) return
    viewTracked.current = true
    track('view-home', { 'number-of-policies': policies.length })
  }, [])

  const getCount = (type: PolicyType) => policies.filter(p => p.type === type).length
  const getSharedCount = (type: PolicyType) => {
    const contactIds = new Set<string>()
    policies.filter(p => p.type === type).forEach(p => p.sharedWith.forEach(id => contactIds.add(id)))
    return contactIds.size
  }

  const statusText = (count: number) => {
    if (count === 0) return 'No policies yet'
    if (count === 1) return '1 policy'
    return `${count} policies`
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <button
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            onClick={() => { track('view-hamburger-menu'); setIsMenuOpen(true) }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg text-foreground">My Insurance Store</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6">
        {/* Stats bar */}
        <div className="bg-accent border border-border rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Total Coverage</p>
          <p className="font-medium text-foreground">
            {policies.length} {policies.length === 1 ? 'policy' : 'policies'}
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-4 gap-3" style={{ gridAutoRows: '120px' }}>
          {policyTypes.map((item, index) => {
            const Icon = item.icon
            const count = getCount(item.type)
            const sharedCount = getSharedCount(item.type)

            return (
              <Link
                key={item.type}
                href={`/policies?type=${item.type.toLowerCase()}`}
                onClick={() => track('button-clicked', { screen: 'home', label: 'bento-click', 'bento-type': item.type.toLowerCase() })}
                className={`group relative bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all overflow-hidden ${gridClasses[index]}`}
              >
                <div
                  className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{ backgroundColor: `var(${item.cssVar})` }}
                />
                <div className="relative h-full flex flex-col">
                  <div className="mb-2.5">
                    <div className="rounded-lg p-2 inline-flex" style={{ backgroundColor: `var(${item.cssVar})` }}>
                      <Icon className="w-4 h-4" style={{ color: `var(${item.cssVar}-foreground)` }} />
                    </div>
                  </div>
                  <h3 className="text-base text-foreground mb-1">{item.type}</h3>
                  <p className="text-xs text-muted-foreground">{statusText(count)}</p>
                  {count > 0 && sharedCount > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: `var(${item.cssVar}-foreground)` }}>
                      Shared with {sharedCount} {sharedCount === 1 ? 'person' : 'people'}
                    </p>
                  )}
                  <div className="absolute bottom-3 right-3">
                    <div
                      className="rounded-md p-1 opacity-60 group-hover:opacity-100 transition-opacity inline-flex"
                      style={{ backgroundColor: `var(${item.cssVar})` }}
                    >
                      <Plus className="w-3.5 h-3.5" style={{ color: `var(${item.cssVar}-foreground)` }} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  )
}
