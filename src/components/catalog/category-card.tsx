import { ArrowRight, Braces, ChartSpline, Sigma } from 'lucide-react'
import { Link } from 'react-router-dom'

import { getMethodsByCategory } from '@/config/methods'
import type { CategoryDefinition } from '@/types/catalog'

const ICONS = [Sigma, Braces, ChartSpline] as const

export function CategoryCard({ category, index }: { category: CategoryDefinition; index: number }) {
  const Icon = ICONS[index % ICONS.length]
  const count = getMethodsByCategory(category.id).length

  return (
    <Link
      to={`/catalogo/${category.slug}`}
      className="group rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition duration-200 hover:-translate-y-1 hover:border-cyan-200/35 hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
    >
      <div className="flex items-start justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-300/20 to-lime-300/10 text-cyan-100"><Icon size={20} aria-hidden="true" /></span>
        <span className="text-xs font-semibold text-slate-500">{String(count).padStart(2, '0')} métodos</span>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-white">{category.name}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{category.description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">Explorar <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
    </Link>
  )
}
