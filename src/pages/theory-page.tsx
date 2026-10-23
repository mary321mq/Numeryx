import { BookOpen, Check, ListChecks, Scale, Sigma } from 'lucide-react'

import { SectionHeading } from './home-page'

const sections = [
  { icon: BookOpen, title: 'Idea central', text: 'Contexto y propósito del método dentro de su categoría.' },
  { icon: Sigma, title: 'Fórmulas y notación', text: 'Bloques KaTeX reutilizables para expresiones y variables.' },
  { icon: ListChecks, title: 'Procedimiento', text: 'Pasos claros, requisitos de entrada y criterios de parada.' },
  { icon: Scale, title: 'Lectura crítica', text: 'Ventajas, limitaciones y advertencias de uso.' },
]

export function TheoryPage() { return <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16"><SectionHeading eyebrow="Teoría" title="Una plantilla para explicar sin confundir" copy="La teoría detallada se añadirá método por método. Por ahora, esta página define los bloques reutilizables y la jerarquía con que será presentada." /><div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{sections.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-white/10 bg-slate-900/55 p-5"><span className="grid size-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100"><Icon size={20} aria-hidden="true" /></span><h2 className="mt-6 text-lg font-bold text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p></article>)}</div><div className="mt-8 rounded-2xl border border-lime-300/15 bg-lime-300/[0.04] p-6"><p className="flex items-center gap-2 text-sm font-bold text-lime-200"><Check size={17} aria-hidden="true" /> Sin contenido académico inventado</p><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">La fase actual prepara la presentación y la navegación. No sustituye el desarrollo y la revisión de las explicaciones matemáticas que se incorporarán después.</p></div></section> }
