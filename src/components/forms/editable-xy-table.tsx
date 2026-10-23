import { Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createXYDraft, type XYDraft } from './xy-draft'

interface EditableXYTableProps {
  rows: readonly XYDraft[]
  onChange: (rows: XYDraft[]) => void
  title?: string
  description?: string
  minimumRows?: number
  addLabel?: string
}

export function EditableXYTable({ rows, onChange, title = 'Pares de datos', description = 'Usa números finitos. No se cargan ejemplos automáticamente.', minimumRows = 1, addLabel = 'Añadir fila' }: EditableXYTableProps) {
  const updateValue = (rowId: string, field: 'x' | 'y', value: string) => onChange(rows.map((row) => row.id === rowId ? { ...row, [field]: value } : row))
  const addRow = () => onChange([...rows, createXYDraft()])
  const removeRow = (rowId: string) => onChange(rows.length > minimumRows ? rows.filter((row) => row.id !== rowId) : [...rows])

  return <section className="overflow-x-auto rounded-xl border border-white/10 bg-black/15" aria-labelledby="xy-data-title"><div className="flex min-w-[30rem] items-center justify-between gap-3 border-b border-white/8 px-4 py-3"><div><h3 id="xy-data-title" className="text-sm font-semibold text-white">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div><Button type="button" variant="secondary" size="sm" onClick={addRow}><Plus size={15} aria-hidden="true" /> {addLabel}</Button></div><table className="min-w-[30rem] w-full text-left text-sm"><thead className="bg-white/[0.04] text-xs tracking-wide text-slate-400 uppercase"><tr><th className="px-4 py-3">#</th><th className="px-3 py-3">x</th><th className="px-3 py-3">y</th><th className="px-3 py-3"><span className="sr-only">Acciones</span></th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id} className="border-t border-white/8"><td className="px-4 py-2 text-slate-500">{index + 1}</td><td className="px-3 py-2"><label className="sr-only" htmlFor={`${row.id}-x`}>Fila {index + 1}, x</label><input id={`${row.id}-x`} value={row.x} onChange={(event) => updateValue(row.id, 'x', event.target.value)} inputMode="decimal" className="w-full min-w-28 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-300 focus:border-cyan-200 focus:ring-2" /></td><td className="px-3 py-2"><label className="sr-only" htmlFor={`${row.id}-y`}>Fila {index + 1}, y</label><input id={`${row.id}-y`} value={row.y} onChange={(event) => updateValue(row.id, 'y', event.target.value)} inputMode="decimal" className="w-full min-w-28 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-300 focus:border-cyan-200 focus:ring-2" /></td><td className="px-3 py-2"><Button type="button" variant="ghost" size="sm" onClick={() => removeRow(row.id)} disabled={rows.length <= minimumRows} aria-label={`Eliminar fila ${index + 1}`}><Trash2 size={16} aria-hidden="true" /></Button></td></tr>)}</tbody></table></section>
}

