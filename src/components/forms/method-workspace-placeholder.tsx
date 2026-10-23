import { LockKeyhole } from 'lucide-react'

export function MethodWorkspacePlaceholder() {
  return <div className="rounded-2xl border border-dashed border-cyan-200/25 bg-cyan-300/[0.035] p-6 sm:p-8"><div className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100"><LockKeyhole size={19} aria-hidden="true" /></span><div><h2 className="font-semibold text-white">Espacio de trabajo reservado</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Esta ficha ya separa la zona para entradas, validación, resultados, tabla, gráfica y exportación. En esta fase no hay calculadora activa ni resultados de demostración.</p></div></div></div>
}
