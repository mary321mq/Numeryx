import { ArrowRight, BookOpenText } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

import { TheoryOutline } from '@/components/theory/theory-outline'
import { getCategoryById } from '@/config/categories'
import { METHODS } from '@/config/methods'

export function TheoryPage() {
  const [searchParams] = useSearchParams()
  const method = METHODS.find((candidate) => candidate.id === searchParams.get('method'))
  const category = method ? getCategoryById(method.categoryId) : undefined
  return <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16"><div className="max-w-3xl"><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Teoría y procedimiento</p><h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">Una explicación clara empieza con una estructura coherente.</h1><p className="mt-4 text-base leading-7 text-slate-400">Numeryx prepara los bloques de estudio para cada método sin adelantar fórmulas o contenidos que aún no han sido revisados académicamente.</p></div>{method && category ? <div className="mt-8 rounded-2xl border border-cyan-200/15 bg-cyan-300/[0.04] p-5"><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Método seleccionado</p><p className="mt-2 text-lg font-semibold text-white">{method.name}</p><p className="mt-1 text-sm text-slate-400">{category.name}</p></div> : <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/55 p-5"><BookOpenText className="mt-0.5 shrink-0 text-cyan-100" size={20} aria-hidden="true" /><p className="text-sm leading-6 text-slate-400">Selecciona una ficha de método para contextualizar esta guía. Mientras tanto, puedes explorar las familias del catálogo.</p></div>}<div className="mt-6"><TheoryOutline method={method} /></div><Link to="/catalogo" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 hover:text-cyan-50 focus-visible:outline-2 focus-visible:outline-cyan-300">Explorar métodos <ArrowRight size={16} aria-hidden="true" /></Link></section>
}
