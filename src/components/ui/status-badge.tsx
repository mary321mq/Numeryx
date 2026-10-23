import type { MethodStatus } from '@/types/catalog'
import { cn } from '@/lib/utils'

const STATUS_COPY: Record<MethodStatus, string> = {
  planned: 'Pendiente',
  scaffolded: 'Base preparada',
  implemented: 'Disponible',
}

const STATUS_STYLES: Record<MethodStatus, string> = {
  planned: 'border-white/10 bg-white/[0.06] text-slate-300',
  scaffolded: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
  implemented: 'border-lime-300/30 bg-lime-300/10 text-lime-200',
}

export function StatusBadge({ status, className }: { status: MethodStatus; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] uppercase', STATUS_STYLES[status], className)}>
      {STATUS_COPY[status]}
    </span>
  )
}
