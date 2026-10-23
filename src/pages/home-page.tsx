import { ArrowRight, BookOpenCheck, CircleHelp, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CategoryCard } from '@/components/catalog/category-card'
import { MethodCard } from '@/components/catalog/method-card'
import { MathExpression } from '@/components/math/math-expression'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/config/categories'
import { METHODS } from '@/config/methods'

const nextMethods = METHODS.filter((method) => method.priority === 'next')

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_24%,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_20%_10%,rgba(190,242,100,0.10),transparent_20%)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pt-18 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pt-28 lg:pb-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/8 px-3 py-1.5 text-xs font-bold tracking-[0.09em] text-lime-200 uppercase"><Sparkles size={14} aria-hidden="true" /> Laboratorio de aprendizaje</div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">Entiende el cálculo.<br /><span className="text-cyan-200">Explora el método.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">NúMERA reúne un catálogo científico para estudiar Métodos Numéricos con una experiencia clara, visual y lista para resolver ejercicios paso a paso.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/catalogo">Explorar catálogo <ArrowRight size={18} aria-hidden="true" /></Link></Button><Button asChild variant="secondary" size="lg"><Link to="/teoria"><BookOpenCheck size={18} aria-hidden="true" /> Ver estructura teórica</Link></Button></div>
            <dl className="mt-11 grid max-w-lg grid-cols-3 gap-3 border-t border-white/10 pt-6"><Metric value="06" label="categorías" /><Metric value="24" label="métodos" /><Metric value="02" label="rutas prioritarias" /></dl>
          </div>
          <div className="relative self-center rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:p-7">
            <div className="absolute -top-px left-8 h-px w-32 bg-gradient-to-r from-transparent via-lime-300 to-transparent" />
            <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><p className="text-xs font-bold tracking-[0.12em] text-slate-400 uppercase">Punto de partida</p><h2 className="mt-1 text-xl font-bold text-white">Espacio científico</h2></div><span className="grid size-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100"><CircleHelp size={20} aria-hidden="true" /></span></div>
            <div className="space-y-4 py-6"><PreviewRow index="01" label="Entrada validada" value="datos · función · tolerancia" /><PreviewRow index="02" label="Proceso trazable" value="iteraciones · tabla · precisión" /><PreviewRow index="03" label="Resultado exportable" value="Excel profesional · PNG" /></div>
            <div className="rounded-xl border border-cyan-200/15 bg-cyan-300/[0.045] p-4"><p className="text-xs font-semibold tracking-[0.09em] text-cyan-100 uppercase">Notación preparada</p><div className="mt-3 text-lg"><MathExpression display expression="x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}" /></div></div>
          </div>
        </div>
      </section>
      <section className="border-y border-white/8 bg-white/[0.025]"><div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 md:grid-cols-3 lg:px-8"><Value label="Explora" text="Empieza por una familia de métodos, no por una pantalla técnica." /><Value label="Comprende" text="La arquitectura reserva el camino para procedimiento, fórmula y visualización." /><Value label="Documenta" text="Los resultados futuros podrán llegar a hojas Excel legibles y editables." /></div></section>
      <section className="mx-auto max-w-7xl px-5 py-18 lg:px-8"><SectionHeading eyebrow="Catálogo inicial" title="Seis rutas para organizar el aprendizaje" copy="Cada familia ya tiene una identidad, una descripción y métodos registrados desde una fuente central." linkTo="/catalogo" linkText="Ver todo el catálogo" /><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{CATEGORIES.map((category, index) => <CategoryCard key={category.id} category={category} index={index} />)}</div></section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8"><SectionHeading eyebrow="Siguiente desarrollo" title="Regresión e interpolación primero" copy="Estas fichas tienen sus contratos de entrada, gráfica y exportación preparados para la próxima fase." /><div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{nextMethods.map((method) => <MethodCard key={method.id} method={method} featured />)}</div></section>
    </>
  )
}

function Metric({ value, label }: { value: string; label: string }) { return <div><dt className="text-2xl font-black text-white">{value}</dt><dd className="mt-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</dd></div> }
function PreviewRow({ index, label, value }: { index: string; label: string; value: string }) { return <div className="flex items-center gap-4"><span className="font-mono text-xs text-lime-200">{index}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-100">{label}</p><p className="mt-0.5 truncate font-mono text-xs text-slate-500">{value}</p></div></div> }
function Value({ label, text }: { label: string; text: string }) { return <div className="border-l border-lime-300/50 pl-4"><p className="text-sm font-bold text-lime-200">{label}</p><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></div> }

export function SectionHeading({ eyebrow, title, copy, linkTo, linkText }: { eyebrow: string; title: string; copy: string; linkTo?: string; linkText?: string }) {
  return <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">{eyebrow}</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{copy}</p></div>{linkTo && linkText && <Link className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 hover:text-cyan-50 focus-visible:outline-2 focus-visible:outline-cyan-300" to={linkTo}>{linkText}<ArrowRight size={16} aria-hidden="true" /></Link>}</div>
}
