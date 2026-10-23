import { AreaChart, ArrowRight, Braces, ChartSpline, Sigma, Spline, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'

import { StatusBadge } from '@/components/ui/status-badge'
import { getCategoryAvailability } from '@/config/catalog-utils'
import type { CategoryDefinition } from '@/types/catalog'

const CATEGORY_ICONS = {
  'nonlinear-roots': Sigma,
  'linear-systems': Braces,
  regression: ChartSpline,
  integration: AreaChart,
  'differential-equations': Waves,
  interpolation: Spline,
} as const

export function CategoryCard({ category }: { category: CategoryDefinition }) {
  const Icon = CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS] ?? Sigma
  const availability = getCategoryAvailability(category.id)

  return (
    <Link
      to={`/catalogo/${category.slug}`}
      className="group rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition duration-200 hover:-translate-y-1 hover:border-cyan-200/35 hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-300/20 to-lime-300/10 text-cyan-100"><Icon size={20} aria-hidden="true" /></span>
        <StatusBadge status={availability.primaryStatus} />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-white">{category.name}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{category.description}</p>
      <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4"><span className="text-xs font-semibold text-slate-500">{String(availability.total).padStart(2, '0')} métodos · {availability.summary}</span><span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">Explorar <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" /></span></div>
    </Link>
  )
}
