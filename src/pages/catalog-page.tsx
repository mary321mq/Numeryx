import { useMemo, useState } from 'react'

import { CatalogControls } from '@/components/catalog/catalog-controls'
import { MethodCard } from '@/components/catalog/method-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { METHODS } from '@/config/methods'

export function CatalogPage() {
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const normalizedQuery = query.trim().toLocaleLowerCase('es-PE')
  const filteredMethods = useMemo(() => METHODS.filter((method) => (categoryId === 'all' || method.categoryId === categoryId) && (!normalizedQuery || [method.name, method.description, ...method.tags].join(' ').toLocaleLowerCase('es-PE').includes(normalizedQuery))), [categoryId, normalizedQuery])
  const prepared = METHODS.filter((method) => method.status === 'scaffolded').length

  return <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><div className="max-w-2xl"><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Catálogo</p><h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">Encuentra el método que necesitas.</h1><p className="mt-4 text-base leading-7 text-slate-400">El catálogo nace de una sola configuración: cada ficha conserva su categoría, estado y contrato de crecimiento.</p></div><div className="mt-9"><CatalogControls query={query} categoryId={categoryId} onQueryChange={setQuery} onCategoryChange={setCategoryId} /></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-400"><span className="font-semibold text-white">{filteredMethods.length}</span> métodos encontrados</p><div className="flex items-center gap-2"><StatusBadge status="scaffolded" /><span className="text-xs text-slate-500">{prepared} listos para continuar</span></div></div>{filteredMethods.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredMethods.map((method) => <MethodCard key={method.id} method={method} />)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-14 text-center"><p className="font-semibold text-white">No encontramos un método con esos filtros.</p><p className="mt-2 text-sm text-slate-400">Prueba con otro nombre o vuelve a todas las categorías.</p></div>}</section>
}
