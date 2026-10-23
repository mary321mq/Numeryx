import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { CatalogControls } from '@/components/catalog/catalog-controls'
import { MethodCard } from '@/components/catalog/method-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { getCategoryBySlug } from '@/config/categories'
import { filterMethods, getCategoryAvailability, type MethodStatusFilter } from '@/config/catalog-utils'
import { getMethodsByCategory } from '@/config/methods'
import { NotFoundPage } from './not-found-page'

export function CategoryPage() {
  const { categorySlug } = useParams()
  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<MethodStatusFilter>('all')
  const methods = category ? getMethodsByCategory(category.id) : []
  const availability = category ? getCategoryAvailability(category.id) : undefined
  const filteredMethods = filterMethods(methods, { query, status })
  if (!category || !availability) return <NotFoundPage />

  return <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><Link to="/catalogo" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-cyan-300"><ArrowLeft size={16} aria-hidden="true" /> Catálogo</Link><div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-[#0a1b2e] p-7 sm:p-10"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Familia de métodos</p><h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">{category.name}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">{category.description}</p></div><StatusBadge status={availability.primaryStatus} /></div><div className="mt-8 flex flex-wrap gap-7"><p><span className="block text-xl font-bold text-white">{availability.total}</span><span className="text-xs text-slate-500">métodos registrados</span></p><p><span className="block text-xl font-bold text-cyan-100">{availability.scaffolded}</span><span className="text-xs text-slate-500">bases preparadas</span></p><p><span className="block text-xl font-bold text-slate-300">{availability.planned}</span><span className="text-xs text-slate-500">pendientes</span></p></div></div><div className="mt-8"><CatalogControls query={query} categoryId={category.id} status={status} onQueryChange={setQuery} onCategoryChange={() => undefined} onStatusChange={setStatus} showCategoryFilter={false} /></div><p className="mt-5 text-sm text-slate-400"><span className="font-semibold text-white">{filteredMethods.length}</span> método{filteredMethods.length === 1 ? '' : 's'} en esta vista</p>{filteredMethods.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredMethods.map((method) => <MethodCard key={method.id} method={method} />)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-12 text-center text-sm text-slate-400">No hay métodos de esta categoría con esos filtros.</div>}</section>
}
