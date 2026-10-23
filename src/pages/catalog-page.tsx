import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { CatalogControls } from '@/components/catalog/catalog-controls'
import { CategoryCard } from '@/components/catalog/category-card'
import { MethodCard } from '@/components/catalog/method-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { CATEGORIES } from '@/config/categories'
import { filterMethods, getCatalogStats, type MethodStatusFilter } from '@/config/catalog-utils'
import { METHODS } from '@/config/methods'

const catalogStats = getCatalogStats()

export function CatalogPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('search') ?? '')
  const [categoryId, setCategoryId] = useState('all')
  const [status, setStatus] = useState<MethodStatusFilter>('all')
  const filteredMethods = useMemo(() => filterMethods(METHODS, { query, categoryId, status }), [categoryId, query, status])

  return <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><div className="max-w-3xl"><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Catálogo de métodos</p><h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">Encuentra una ruta para tu problema.</h1><p className="mt-4 text-base leading-7 text-slate-400">Filtra por familia, disponibilidad o tema. Los estados se calculan desde la configuración real del catálogo.</p></div><div className="mt-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{CATEGORIES.map((category) => <CategoryCard key={category.id} category={category} />)}</div><div className="mt-10"><CatalogControls query={query} categoryId={categoryId} status={status} onQueryChange={setQuery} onCategoryChange={setCategoryId} onStatusChange={setStatus} /></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-400"><span className="font-semibold text-white">{filteredMethods.length}</span> método{filteredMethods.length === 1 ? '' : 's'} encontrado{filteredMethods.length === 1 ? '' : 's'}</p><div className="flex flex-wrap items-center gap-2"><StatusBadge status="scaffolded" /><span className="text-xs text-slate-500">{catalogStats.scaffolded} preparados</span><StatusBadge status="planned" /><span className="text-xs text-slate-500">{catalogStats.planned} pendientes</span></div></div>{filteredMethods.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredMethods.map((method) => <MethodCard key={method.id} method={method} />)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center"><p className="font-semibold text-white">No hay métodos que coincidan con estos filtros.</p><p className="mt-2 text-sm text-slate-400">Intenta borrar la búsqueda, elegir otra familia o volver a todos los estados.</p></div>}</section>
}
