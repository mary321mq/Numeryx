import type { ResultTable as ResultTableType } from '@/types/numerical'

export function ResultTable({ table }: { table: ResultTableType }) {
  return <div className="overflow-x-auto rounded-xl border border-white/10"><table className="w-full min-w-120 text-left text-sm"><thead className="bg-white/[0.06] text-xs tracking-wide text-slate-300 uppercase"><tr>{table.columns.map((column) => <th key={column.id} className="px-4 py-3 font-semibold">{column.label}</th>)}</tr></thead><tbody>{table.rows.map((row, index) => <tr key={index} className="border-t border-white/8 text-slate-300 even:bg-white/[0.025]">{table.columns.map((column) => <td key={column.id} className="px-4 py-3 tabular-nums">{row[column.id] ?? '—'}</td>)}</tr>)}</tbody></table></div>
}
