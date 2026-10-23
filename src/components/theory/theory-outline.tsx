import { BookOpenText, CircleHelp, ListChecks, Sigma, Scale } from 'lucide-react'

import type { MethodDefinition } from '@/types/catalog'

const THEORY_SECTIONS = [
  { icon: CircleHelp, title: '¿Qué es y para qué sirve?', detail: 'Contexto y objetivo del método.' },
  { icon: Sigma, title: 'Fórmula principal', detail: 'Notación KaTeX y significado de variables.' },
  { icon: ListChecks, title: 'Procedimiento general', detail: 'Pasos, requisitos y criterios de aplicación.' },
  { icon: Scale, title: 'Ventajas y limitaciones', detail: 'Alcance, supuestos y precauciones de uso.' },
]

export function TheoryOutline({ method }: { method?: MethodDefinition }) {
  return <section aria-labelledby="theory-outline-title" className="rounded-2xl border border-white/10 bg-slate-900/55 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100"><BookOpenText size={19} aria-hidden="true" /></span><div><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Teoría</p><h2 id="theory-outline-title" className="mt-1 text-lg font-bold text-white">{method ? `Guía de estudio · ${method.name}` : 'Estructura de estudio reutilizable'}</h2><p className="mt-2 text-sm leading-6 text-slate-400">El contenido académico se incorporará únicamente tras su validación. Esta estructura no sustituye una explicación matemática revisada.</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{THEORY_SECTIONS.map(({ icon: Icon, title, detail }) => <article key={title} className="rounded-xl border border-white/8 bg-black/15 p-4"><Icon size={17} className="text-cyan-100" aria-hidden="true" /><h3 className="mt-3 text-sm font-semibold text-slate-100">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p><p className="mt-3 text-xs font-medium text-lime-200/80">Pendiente de contenido validado</p></article>)}</div></section>
}
