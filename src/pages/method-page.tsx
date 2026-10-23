import { ArrowLeft, CircleDashed, FileSpreadsheet, LineChart, Table2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { TheoryOutline } from '@/components/theory/theory-outline'
import { StatusBadge } from '@/components/ui/status-badge'
import { MethodWorkspace } from '@/components/workspace/method-workspace'
import { InterpolationWorkspace } from '@/components/interpolation/interpolation-workspace'
import { RegressionWorkspace } from '@/components/regression/regression-workspace'
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
  const preparedIntegration = method.status === 'scaffolded' ? integration : undefined
  const regressionIntegration = method.status === 'implemented' && integration?.workspace === 'regression'
  const interpolationIntegration = method.status === 'implemented' && integration?.workspace === 'interpolation'

  return <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16"><Link to={`/catalogo/${category.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-cyan-300"><ArrowLeft size={16} aria-hidden="true" /> {category.shortName}</Link><header className="mt-8"><div className="flex flex-wrap items-center gap-3"><StatusBadge status={method.status} /><span className="text-xs font-semibold tracking-[0.1em] text-slate-500 uppercase">{category.name}</span></div><h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">{method.name}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">{method.description}</p></header>{regressionIntegration ? <RegressionWorkspace method={method} /> : interpolationIntegration ? <InterpolationWorkspace method={method} /> : preparedIntegration ? <MethodWorkspace method={method} integration={preparedIntegration} /> : <><section className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-6 sm:p-8"><CircleDashed size={24} className="text-slate-400" aria-hidden="true" /><p className="mt-4 text-xs font-bold tracking-[0.12em] text-slate-500 uppercase">Funcionalidad pendiente</p><h2 className="mt-2 text-xl font-bold text-white">Esta ficha todavía no ejecuta cálculos.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">El método está registrado en el catálogo y su espacio de trabajo se activará cuando cuente con entradas, validaciones y un algoritmo verificado. No se muestran campos o resultados genéricos para evitar confusiones.</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><Capability icon={Table2} title="Tabla" text="Se definirá según sus iteraciones o datos." /><Capability icon={LineChart} title="Gráfica" text="Se agregará solo cuando aporte al método." /><Capability icon={FileSpreadsheet} title="Exportación" text="Disponible tras resultados verificables." /></div></section><div className="mt-5"><TheoryOutline method={method} /></div></>}</section>
}

function Capability({ icon: Icon, title, text }: { icon: typeof Table2; title: string; text: string }) { return <div className="rounded-xl border border-white/10 bg-black/15 p-4"><Icon className="text-cyan-100" size={18} aria-hidden="true" /><p className="mt-4 text-sm font-semibold text-white">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div> }
