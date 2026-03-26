interface HeaderProps {
  title: string
  right?: React.ReactNode
}

export default function Header({ title, right }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800/50 px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-zinc-100">{title}</h1>
        {right && <div>{right}</div>}
      </div>
    </header>
  )
}
