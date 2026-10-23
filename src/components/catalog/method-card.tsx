import { ArrowUpRight, Clock3, FlaskConical } from 'lucide-react'
import { Link } from 'react-router-dom'

import { getCategoryById } from '@/config/categories'
import { StatusBadge } from '@/components/ui/status-badge'
import type { MethodDefinition } from '@/types/catalog'

export function MethodCard({ method, featured = false }: { method: MethodDefinition; featured?: boolean }) {
  const category = getCategoryById(method.categoryId)
  const destination = category ? `/catalogo/${category.slug}/${method.slug}` : '/catalogo'
  const isPlanned = method.status === 'planned'

  return (
    <Link
      to={destination}
      className="group relative flex min-h-56 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/65 p-5 transition duration-200 hover:-translate-y-1 hover:border-cyan-200/35 hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-cyan-200">
          {isPlanned ? <Clock3 size={19} aria-hidden="true" /> : <FlaskConical size={19} aria-hidden="true" />}
        </span>
        <StatusBadge status={method.status} />
      </div>
      <div className="flex-1">
        <p className="mb-2 text-xs font-semibold tracking-[0.12em] text-slate-400 uppercase">{category?.shortName}</p>
        <h3 className="text-lg leading-snug font-semibold text-white">{method.name}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">{method.description}</p>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-xs font-semibold text-slate-300">
        <span>{method.status === 'scaffolded' ? 'Siguiente fase' : 'Ver ficha'}</span>
        <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={16} aria-hidden="true" />
      </div>
      {featured && <span className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-lime-300/10" aria-hidden="true" />}
    </Link>
  )
}
