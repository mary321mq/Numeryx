import { ArrowLeft, CheckCircle2, CircleDashed, FileSpreadsheet, LineChart, Table2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { MethodWorkspacePlaceholder } from '@/components/forms/method-workspace-placeholder'
import { MathExpression } from '@/components/math/math-expression'
import { StatusBadge } from '@/components/ui/status-badge'
import { getCategoryBySlug } from '@/config/categories'
import { getMethodBySlug } from '@/config/methods'
import { getMethodIntegration } from '@/features/methods/registry'
import { NotFoundPage } from './not-found-page'

export function MethodPage() {
  const { categorySlug, methodSlug } = useParams()
  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined
  const method = categorySlug && methodSlug ? getMethodBySlug(categorySlug, methodSlug) : undefined
  if (!category || !method || method.categoryId !== category.id) return <NotFoundPage />
  const integration = getMethodIntegration(method.id)
  const isScaffolded = method.status === 'scaffolded'
  return <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16"><Link to={`/catalogo/${category.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-cyan-300"><ArrowLeft size={16} aria-hidden="true" /> {category.shortName}</Link><div className="mt-8"><div className="flex flex-wrap items-center gap-3"><StatusBadge status={method.status} /><span className="text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase">{category.name}</span></div><h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">{method.name}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">{method.description}</p></div><div className="mt-10 grid gap-4 md:grid-cols-3"><Capability icon={Table2} title="Tabla" text={integration?.resultColumns ? 'Definida por método' : 'Reservada para iteraciones'} /><Capability icon={LineChart} title="Gráfica" text={integration?.chartSupport ? 'Contrato preparado' : 'Pendiente de implementación'} /><Capability icon={FileSpreadsheet} title="Exportación" text={integration?.exportSupport ? 'Contrato preparado' : 'Reservada para la fase de resultados'} /></div><div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/55 p-6 sm:p-8"><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Ficha provisional</p><h2 className="mt-3 text-xl font-bold text-white">Una base honesta para el trabajo que sigue</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">No se muestran cifras de prueba como si fueran resultados. Esta página define el contexto y el espacio donde se conectarán validación, motor numérico, tabla, gráfica y exportación.</p><div className="mt-5 rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm"><MathExpression expression="f(x) \approx 0" /></div></div>{isScaffolded && integration ? <div className="mt-5"><MethodWorkspacePlaceholder /><p className="mt-4 text-xs text-slate-500">La futura ficha recibirá {integration.inputSchema.length} grupo(s) de entrada definido(s) por el contrato de este método.</p></div> : <div className="mt-5 rounded-2xl border border-dashed border-white/15 px-6 py-8 text-sm leading-6 text-slate-400"><CircleDashed className="mb-3 text-slate-500" size={22} aria-hidden="true" />Este método permanece pendiente. Puedes revisar su ficha, pero no existe un botón para ejecutarlo hasta implementar y validar su algoritmo.</div>}<div className="mt-8 flex flex-wrap gap-3"><Link to={`/teoria?method=${method.id}`} className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-cyan-300"><CheckCircle2 size={16} aria-hidden="true" /> Ver estructura teórica</Link></div></section>
}

function Capability({ icon: Icon, title, text }: { icon: typeof Table2; title: string; text: string }) { return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><Icon className="text-cyan-100" size={18} aria-hidden="true" /><p className="mt-4 text-sm font-semibold text-white">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div> }
