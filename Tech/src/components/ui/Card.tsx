import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export default function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-card border border-border rounded-xl p-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}
