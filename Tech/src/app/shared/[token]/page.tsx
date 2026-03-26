import { Shield, Download } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface Props {
  params: Promise<{ token: string }>
}

export default async function SharedPolicyPage({ params }: Props) {
  const { token } = await params

  // TODO: look up shared policy by token in Supabase
  // For now, render a placeholder
  void token

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="max-w-sm mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-100">Shared with you</h1>
            <p className="text-xs text-zinc-500">via My Insurance Store</p>
          </div>
        </div>

        {/* Policy card placeholder */}
        <Card className="space-y-3">
          <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse" />
          <div className="h-3 bg-zinc-800 rounded w-2/3 animate-pulse" />
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2 mt-2">
            <Download className="w-4 h-4" />
            Download policy
          </Button>
        </Card>

        <p className="text-center text-xs text-zinc-600">
          This link was shared with you by a family member or friend.
        </p>
      </div>
    </div>
  )
}
