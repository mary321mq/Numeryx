import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { MethodCard } from '@/components/catalog/method-card'
import { getCategoryBySlug } from '@/config/categories'
import { getMethodsByCategory } from '@/config/methods'
import { NotFoundPage } from './not-found-page'

export function CategoryPage() {
  const { categorySlug } = useParams()
  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined
  if (!category) return <NotFoundPage />
  const methods = getMethodsByCategory(category.id)
  const preparedCount = methods.filter((method) => method.status === 'scaffolded').length
  return <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><Link to="/catalogo" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-cyan-300"><ArrowLeft size={16} aria-hidden="true" /> Catálogo</Link><div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-[#0a1b2e] p-7 sm:p-10"><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Familia de métodos</p><h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">{category.name}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">{category.description}</p><div className="mt-8 flex gap-7"><p><span className="block text-xl font-bold text-white">{methods.length}</span><span className="text-xs text-slate-500">métodos registrados</span></p><p><span className="block text-xl font-bold text-cyan-100">{preparedCount}</span><span className="text-xs text-slate-500">bases preparadas</span></p></div></div><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{methods.map((method) => <MethodCard key={method.id} method={method} />)}</div></section>
}
