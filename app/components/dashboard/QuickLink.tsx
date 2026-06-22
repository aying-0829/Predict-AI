import Link from 'next/link'

interface QuickLinkProps {
  href: string
  icon: string
  title: string
  desc: string
}

export function QuickLink({ href, icon, title, desc }: QuickLinkProps) {
  return (
    <Link href={href} className="glass-card p-5 block group min-w-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
        <h3 className="text-sm font-semibold text-[var(--text-heading)]">{title}</h3>
      </div>
      <p className="text-xs text-[var(--text-label)]">{desc}</p>
    </Link>
  )
}
