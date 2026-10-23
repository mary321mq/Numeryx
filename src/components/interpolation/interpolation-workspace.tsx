import { AlertTriangle, FileSpreadsheet, LineChart } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'

import { NumericalChart } from '@/components/charts/numerical-chart'
import { EditableXYTable } from '@/components/forms/editable-xy-table'
import { createXYDrafts, type XYDraft } from '@/components/forms/xy-draft'
import { ResultTable } from '@/components/tables/result-table'
import { Button } from '@/components/ui/button'
import { downloadMethodWorkbook } from '@/features/export/excel-export'
import { calculateLagrangeInterpolation, calculateNewtonInterpolation, evaluateLagrange, evaluateNewton } from '@/features/interpolation/interpolation'
import { createLagrangeProgression, type LagrangeDegreeReport } from '@/features/interpolation/lagrange-report'
import type { InterpolationResult, LagrangeInterpolationResult, NewtonInterpolationResult, XYObservation } from '@/features/interpolation/types'
import { InterpolationProblemError } from '@/features/interpolation/types'
import type { MethodDefinition } from '@/types/catalog'
import type { ChartSeries, ResultTable as ResultTableType } from '@/types/numerical'

type ChartCapture = (() => Promise<string | undefined>) | null

export function InterpolationWorkspace({ method }: { method: MethodDefinition }) {
  const [rows, setRows] = useState<XYDraft[]>(() => createXYDrafts(2))
  const [targetX, setTargetX] = useState('')
  const [result, setResult] = useState<InterpolationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isLagrange = method.id === 'lagrange-interpolation'

  const invalidate = () => {
    setResult(null)
    setError(null)
  }

  const updateRows = (nextRows: XYDraft[]) => {
    setRows(nextRows)
    invalidate()
  }

  const calculate = () => {
    setResult(null)
    setError(null)
    try {
      const points = parseRows(rows)
      const x = parseRequiredNumber(targetX, 'El valor objetivo x')
      setResult(isLagrange ? calculateLagrangeInterpolation(points, x) : calculateNewtonInterpolation(points, x))
    } catch (calculationError) {
      setError(toUserMessage(calculationError))
    }
  }

  const methodTitle = isLagrange ? 'Interpolación de Lagrange' : 'Newton por diferencias divididas'
  const description = isLagrange
    ? 'Construye Pₙ(x) como suma de bases Lᵢ(x). Cada base y cada sustitución se generan con los nodos que introduzcas.'
    : 'Construye Pₙ(x) desde una tabla triangular de diferencias divididas. Las celdas no aplicables se mantienen vacías, no se sustituyen por ceros.'

  return <div className="mt-8 space-y-5"><section aria-labelledby="interpolation-workspace-title" className="overflow-hidden rounded-2xl border border-cyan-200/18 bg-slate-900/65"><div className="border-b border-white/8 bg-cyan-300/[0.04] px-5 py-5 sm:px-6"><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Espacio de cálculo</p><h2 id="interpolation-workspace-title" className="mt-1 text-xl font-bold text-white">{methodTitle}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p></div><div className="space-y-5 p-5 sm:p-6"><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]"><EditableXYTable rows={rows} onChange={updateRows} title="Nodos de interpolación" description="Agrega o quita puntos (x, y). Las x deben ser finitas y distintas." /><label className="self-start rounded-xl border border-white/10 bg-black/15 p-4 text-sm font-semibold text-slate-100">Valor objetivo x<input value={targetX} onChange={(event) => { setTargetX(event.target.value); invalidate() }} inputMode="decimal" aria-label="Valor objetivo x" placeholder="Ej.: 1.5" className="mt-3 w-full rounded-lg border border-white/12 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-cyan-300 transition focus:border-cyan-200 focus:ring-2" /><span className="mt-2 block text-xs font-normal leading-5 text-slate-500">Se permite un único nodo como P₀ constante. Con dos o más, se usa Pₙ de grado n − 1.</span></label></div><div className="flex flex-wrap items-center gap-3"><Button type="button" onClick={calculate}><LineChart size={17} aria-hidden="true" /> Calcular interpolación</Button><p className="text-xs leading-5 text-slate-500">Editar datos o el valor objetivo invalida el resultado para evitar cifras desactualizadas.</p></div>{error && <div role="alert" className="flex gap-3 rounded-xl border border-rose-300/25 bg-rose-300/[0.08] p-4 text-sm leading-6 text-rose-100"><AlertTriangle className="mt-0.5 shrink-0 text-rose-200" size={18} aria-hidden="true" />{error}</div>}<InterpolationResultView method={method} result={result} /></div></section><section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Convenciones</p><h2 className="mt-2 text-lg font-bold text-white">Un polinomio que atraviesa los nodos actuales</h2><p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">La interpolación usa todos los nodos con x distinta y no redondea valores intermedios. Lagrange y Newton describen el mismo Pₙ; sus formas se muestran por separado para estudiar el procedimiento.</p><p className="mt-2 text-xs leading-5 text-slate-500">Método activo: {method.name}. Si x está fuera del intervalo de nodos, el resultado se etiqueta como extrapolación.</p></section></div>
}

function InterpolationResultView({ method, result }: { method: MethodDefinition; result: InterpolationResult | null }) {
  const chartCapture = useRef<ChartCapture>(null)
  const onCaptureReady = useCallback((capture: ChartCapture) => { chartCapture.current = capture }, [])
  const chartSeries = useMemo(() => result ? buildChartSeries(result) : [], [result])
  const extrapolation = result ? isExtrapolation(result) : false

  if (!result) return null

  const exportWorkbook = async () => {
    const image = await chartCapture.current?.()
    const { table, tableTotals, additionalTables } = createExportTables(result)
    await downloadMethodWorkbook({
      method,
      generatedAt: new Date(),
      inputs: {
        'Puntos originales (x, y)': result.observations.map((point) => `(${formatNumber(point.x)}, ${formatNumber(point.y)})`).join('; '),
        'Valor objetivo x': result.targetX,
        'Grado de Pₙ': result.degree,
        Alcance: extrapolation ? 'Extrapolación: x fuera del intervalo de nodos' : 'Interpolación dentro del intervalo de nodos',
      },
      highlights: [{ label: 'Polinomio', value: buildPolynomial(result) }, { label: `P${subscript(result.degree)}(${formatNumber(result.targetX)})`, value: result.targetY }],
      originalData: createOriginalDataTable(result),
      table,
      tableTotals,
      additionalTables,
      diagnostics: [`Se verificó Pₙ(xᵢ) = yᵢ en ${result.verification.length} nodo(s).`, extrapolation ? 'El valor objetivo está fuera del intervalo de los nodos; el resultado es una extrapolación.' : 'El valor objetivo se encuentra dentro del intervalo de los nodos.'],
      procedure: buildProcedure(result),
      ...(image ? { chartImage: { base64Png: image, title: 'Polinomio interpolante y nodos' } } : {}),
    })
  }

  return <section className="space-y-5" aria-live="polite"><div className="grid gap-3 sm:grid-cols-3"><Metric label="Resultado" value={`P${subscript(result.degree)}(${formatNumber(result.targetX)}) = ${formatNumber(result.targetY)}`} /><Metric label="Grado" value={`n = ${result.degree}`} /><Metric label="Alcance" value={extrapolation ? 'Extrapolación' : 'Interpolación'} emphasis={extrapolation ? 'amber' : 'teal'} /></div><section className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Polinomio obtenido</p><p className="mt-2 overflow-x-auto text-sm leading-7 text-white"><code>{buildPolynomial(result)}</code></p><p className="mt-2 text-xs leading-5 text-slate-500">Forma factorizada construida con tus nodos; no se evalúa ninguna expresión de texto.</p></section>{result.kind === 'lagrange' ? <LagrangeDetail result={result} /> : <NewtonDetail result={result} />}<section><SectionTitle title="Verificación en los nodos" description="Cada valor calculado se contrasta contra el y original. El error mostrado es Pₙ(xᵢ) − yᵢ." /><ResultTable table={verificationTable(result)} /></section><section className="rounded-xl border border-white/10 bg-black/15 p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Gráfica</p><h3 className="mt-1 text-base font-bold text-white">Nodos y polinomio interpolante</h3><p className="mt-1 text-xs leading-5 text-slate-500">{extrapolation ? 'El rango se extiende al valor objetivo para mostrar la zona de extrapolación.' : 'El valor objetivo está incluido como marcador sobre la curva.'}</p></div><Button type="button" variant="secondary" size="sm" onClick={() => void exportWorkbook()}><FileSpreadsheet size={16} aria-hidden="true" /> Exportar Excel</Button></div><div className="mt-4"><NumericalChart series={chartSeries} title="Polinomio interpolante" xAxisTitle="x" yAxisTitle="Pₙ(x)" downloadFileName={`${method.slug}-grafica`} onCaptureReady={onCaptureReady} /></div></section></section>
}

function LagrangeDetail({ result }: { result: LagrangeInterpolationResult }) {
  const progression = createLagrangeProgression(result)
  return <section className="space-y-4"><SectionTitle title="Desarrollo progresivo por grado" description="Como en tu hoja de cálculo: P₁ usa los dos primeros nodos, P₂ añade el tercero y así sucesivamente hasta el polinomio final." /><div className="grid gap-4 2xl:grid-cols-2">{progression.map((step) => <LagrangeDegreeCard key={step.degree} step={step} />)}</div><section className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Tabla del polinomio final</p><p className="mt-2 text-sm text-slate-400">Cada contribución yᵢLᵢ se suma para obtener P{subscript(result.degree)}({formatNumber(result.targetX)}).</p><div className="mt-4"><ResultTable table={lagrangeBasisTable(result)} /></div></section></section>
}

function LagrangeDegreeCard({ step }: { step: LagrangeDegreeReport }) {
  const { result } = step
  return <article className="rounded-xl border border-cyan-200/15 bg-cyan-300/[0.035] p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-bold tracking-[0.1em] text-cyan-200 uppercase">Grado {step.degree}</p><h4 className="mt-1 text-base font-bold text-white">P{subscript(step.degree)}({formatNumber(result.targetX)})</h4></div><span className="rounded-md border border-cyan-200/20 bg-black/15 px-2 py-1 font-mono text-xs text-cyan-100">x = {formatNumber(result.targetX)}</span></div><p className="mt-3 text-xs leading-5 text-slate-400">Nodos usados: {result.observations.map((point, index) => `(x${subscript(index)}=${formatNumber(point.x)}, y${subscript(index)}=${formatNumber(point.y)})`).join(' · ')}</p><p className="mt-3 overflow-x-auto font-mono text-xs leading-6 text-slate-200">{buildPolynomial(result)}</p><div className="mt-3 space-y-2">{result.bases.map((basis) => <div key={basis.index} className="rounded-lg border border-white/8 bg-black/15 p-3"><p className="font-semibold text-slate-100">L{subscript(basis.index)}({formatNumber(result.targetX)}) = <span className="font-mono text-cyan-100">{formatLagrangeFraction(result, basis.index)}</span> = {formatNumber(basis.valueAtTarget)}</p><p className="mt-1 text-xs text-slate-400">y{subscript(basis.index)}·L{subscript(basis.index)} = {formatNumber(basis.nodeY)} · {formatNumber(basis.valueAtTarget)} = <span className="font-semibold text-cyan-100">{formatNumber(basis.contribution)}</span></p></div>)}</div><div className="mt-3 rounded-lg border border-lime-300/20 bg-lime-300/[0.07] px-3 py-2 text-sm font-bold text-lime-100">P{subscript(step.degree)}({formatNumber(result.targetX)}) = {formatNumber(result.targetY)}</div></article>
}

function NewtonDetail({ result }: { result: NewtonInterpolationResult }) {
  return <section className="space-y-4"><SectionTitle title="Tabla de diferencias divididas" description="La tabla es triangular: una celda sin diferencia aplicable se representa con un guion, nunca con un cero artificial." /><div className="overflow-x-auto rounded-xl border border-white/10"><table className="min-w-max w-full text-left text-sm"><thead className="bg-white/[0.06] text-xs tracking-wide text-slate-300 uppercase"><tr><th className="px-4 py-3">i</th><th className="px-4 py-3">xᵢ</th>{result.dividedDifferences.map((_column, order) => <th key={order} className="px-4 py-3">{order === 0 ? 'f[xᵢ]' : `Orden ${order}`}</th>)}</tr></thead><tbody>{result.observations.map((point, index) => <tr key={`${point.x}-${index}`} className="border-t border-white/8 text-slate-300 even:bg-white/[0.025]"><td className="px-4 py-3 tabular-nums">{index}</td><td className="px-4 py-3 tabular-nums">{formatNumber(point.x)}</td>{result.dividedDifferences.map((column, order) => <td key={order} className="px-4 py-3 tabular-nums">{index < column.length ? formatNumber(column[index]) : <span className="text-slate-600">—</span>}</td>)}</tr>)}</tbody></table></div><div className="grid gap-3 lg:grid-cols-2">{result.differenceOperations.map((operation) => <article key={`${operation.order}-${operation.index}`} className="rounded-xl border border-white/10 bg-black/15 p-3 text-xs leading-6 text-slate-300"><code>{formatDifferenceOperation(result, operation.order, operation.index)}</code></article>)}</div><section className="rounded-xl border border-white/10 bg-black/15 p-4"><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Recurrencia de Newton</p><p className="mt-2 overflow-x-auto text-sm leading-7 text-white"><code>{buildPolynomial(result)}</code></p><p className="mt-2 text-xs leading-5 text-slate-500">Los coeficientes son la primera entrada de cada columna de diferencias divididas.</p></section></section>
}

function Metric({ label, value, emphasis = 'teal' }: { label: string; value: string; emphasis?: 'teal' | 'amber' }) {
  return <div className={`rounded-xl border p-4 ${emphasis === 'amber' ? 'border-amber-200/20 bg-amber-300/[0.06]' : 'border-white/10 bg-black/15'}`}><p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p><p className={`mt-2 text-sm font-bold ${emphasis === 'amber' ? 'text-amber-100' : 'text-white'}`}>{value}</p></div>
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return <div><h3 className="text-base font-bold text-white">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div>
}

function buildChartSeries(result: InterpolationResult): ChartSeries[] {
  const xs = result.observations.map((point) => point.x)
  const lower = Math.min(...xs, result.targetX)
  const upper = Math.max(...xs, result.targetX)
  const span = upper - lower
  const padding = span === 0 ? 1 : span * 0.06
  const start = lower - padding
  const end = upper + padding
  const coefficient = result.kind === 'newton' ? result.terms.map((term) => term.coefficient) : []
  const curveX = Array.from({ length: 161 }, (_value, index) => start + (end - start) * index / 160)
  const curveY = curveX.map((x) => result.kind === 'lagrange' ? evaluateLagrange(result.observations, x) : evaluateNewton(result.observations, coefficient, x))
  return [
    { id: 'curve', name: 'Pₙ(x)', x: curveX, y: curveY, mode: 'lines', line: { color: '#67e8f9', width: 3 } },
    { id: 'nodes', name: 'Nodos (xᵢ, yᵢ)', x: result.observations.map((point) => point.x), y: result.observations.map((point) => point.y), mode: 'markers', marker: { color: '#fbbf24', size: 10, symbol: 'circle' } },
    { id: 'target', name: `Pₙ(${formatNumber(result.targetX)})`, x: [result.targetX], y: [result.targetY], mode: 'markers', marker: { color: '#f472b6', size: 12, symbol: 'diamond' } },
  ]
}

function verificationTable(result: InterpolationResult): ResultTableType {
  return { columns: [{ id: 'index', label: 'i', numeric: true, precision: 0 }, { id: 'x', label: 'xᵢ', numeric: true }, { id: 'expected', label: 'yᵢ original', numeric: true }, { id: 'calculated', label: 'Pₙ(xᵢ)', numeric: true }, { id: 'error', label: 'Error', numeric: true, precision: 10 }], rows: result.verification.map((entry) => ({ index: entry.index, x: entry.x, expected: entry.expected, calculated: entry.calculated, error: entry.error })) }
}

function createOriginalDataTable(result: InterpolationResult): ResultTableType {
  return {
    columns: [{ id: 'index', label: '#', numeric: true, precision: 0 }, { id: 'x', label: 'xᵢ', numeric: true }, { id: 'y', label: 'yᵢ', numeric: true }],
    rows: result.observations.map((point, index) => ({ index, x: point.x, y: point.y })),
  }
}

function lagrangeBasisTable(result: LagrangeInterpolationResult): ResultTableType {
  return {
    columns: [
      { id: 'index', label: 'i', numeric: true, precision: 0 },
      { id: 'x', label: 'xᵢ', numeric: true },
      { id: 'y', label: 'yᵢ', numeric: true },
      { id: 'formula', label: 'Base Lᵢ(x objetivo)' },
      { id: 'basis', label: 'Lᵢ(x objetivo)', numeric: true },
      { id: 'contribution', label: 'yᵢLᵢ', numeric: true },
    ],
    rows: result.bases.map((basis) => ({ index: basis.index, x: basis.nodeX, y: basis.nodeY, formula: formatLagrangeFraction(result, basis.index), basis: basis.valueAtTarget, contribution: basis.contribution })),
  }
}

function lagrangeTotalRow(result: LagrangeInterpolationResult) {
  return { index: `P${subscript(result.degree)}(x)`, x: null, y: null, formula: 'Σ yᵢLᵢ(x)', basis: null, contribution: result.targetY }
}

function createExportTables(result: InterpolationResult) {
  const verification = { title: 'Verificación de nodos', table: verificationTable(result) }
  if (result.kind === 'lagrange') {
    const progression = createLagrangeProgression(result)
    return {
      table: lagrangeBasisTable(result),
      tableTotals: lagrangeTotalRow(result),
      additionalTables: [
        ...progression.slice(0, -1).map((step) => ({ title: `Desarrollo de grado ${step.degree}: P${subscript(step.degree)}(${formatNumber(step.result.targetX)})`, table: lagrangeBasisTable(step.result), totalRow: lagrangeTotalRow(step.result) })),
        verification,
      ],
    }
  }
  const columns = [{ id: 'index', label: 'i', numeric: true, precision: 0 }, { id: 'x', label: 'xᵢ', numeric: true }, ...result.dividedDifferences.map((_column, order) => ({ id: `order-${order}`, label: order === 0 ? 'f[xᵢ]' : `Orden ${order}`, numeric: true }))]
  return {
    table: { columns, rows: result.observations.map((point, index) => Object.fromEntries([['index', index], ['x', point.x], ...result.dividedDifferences.map((column, order) => [`order-${order}`, index < column.length ? column[index] : null])])) },
    tableTotals: undefined,
    additionalTables: [verification],
  }
}

function buildProcedure(result: InterpolationResult) {
  const common = [`Se validaron ${result.observations.length} nodo(s) con valores x distintos.`, `Se evaluó ${buildPolynomial(result)} en x = ${formatNumber(result.targetX)}.`, `Resultado: P${subscript(result.degree)}(${formatNumber(result.targetX)}) = ${formatNumber(result.targetY)}.`]
  return result.kind === 'lagrange'
    ? [common[0], 'Se calculó cada base Lᵢ(x) y su contribución yᵢLᵢ(x) sin redondeos intermedios.', ...common.slice(1), 'Se verificó el polinomio contra todos los nodos originales.']
    : [common[0], 'Se construyó la tabla triangular de diferencias divididas y se tomaron los coeficientes de su primera entrada.', ...common.slice(1), 'Se verificó el polinomio contra todos los nodos originales.']
}

function buildPolynomial(result: InterpolationResult) {
  if (result.kind === 'lagrange') return `P${subscript(result.degree)}(x) = ${result.bases.map((basis) => `${formatNumber(basis.nodeY)}·L${subscript(basis.index)}(x)`).join(' + ')}`
  return `P${subscript(result.degree)}(x) = ${result.terms.map((term, index) => index === 0 ? formatNumber(term.coefficient) : `${formatSigned(term.coefficient)}${term.nodes.map((node) => `(x − ${formatNumber(node)})`).join('')}`).join('')}`
}

function formatLagrangeFraction(result: LagrangeInterpolationResult, index: number) {
  const basis = result.bases[index]
  const others = result.observations.filter((_point, otherIndex) => otherIndex !== index).map((point) => point.x)
  if (others.length === 0) return '1'
  const numerator = others.map((x) => `(${formatNumber(result.targetX)} − ${formatNumber(x)})`).join(' · ')
  const denominator = others.map((x) => `(${formatNumber(basis.nodeX)} − ${formatNumber(x)})`).join(' · ')
  return `[${numerator}] / [${denominator}]`
}

function formatDifferenceOperation(result: NewtonInterpolationResult, order: number, index: number) {
  const previous = result.dividedDifferences[order - 1]
  const left = previous[index + 1]
  const right = previous[index]
  const value = result.dividedDifferences[order][index]
  return `f[x${subscript(index)}, …, x${subscript(index + order)}] = (${formatNumber(left)} − ${formatNumber(right)}) / (${formatNumber(result.observations[index + order].x)} − ${formatNumber(result.observations[index].x)}) = ${formatNumber(value)}`
}

function parseRows(rows: readonly XYDraft[]): XYObservation[] {
  return rows.map((row, index) => ({ x: parseRequiredNumber(row.x, `La fila ${index + 1}, x`), y: parseRequiredNumber(row.y, `La fila ${index + 1}, y`) }))
}

function parseRequiredNumber(value: string, label: string) {
  if (value.trim() === '') throw new InterpolationProblemError('invalid-number', `${label} es obligatorio.`)
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) throw new InterpolationProblemError('invalid-number', `${label} debe ser un número finito.`)
  return numericValue
}

function isExtrapolation(result: InterpolationResult) {
  const xs = result.observations.map((point) => point.x)
  return result.targetX < Math.min(...xs) || result.targetX > Math.max(...xs)
}

function formatNumber(value: number) {
  if (Math.abs(value) < 1e-12) return '0'
  return new Intl.NumberFormat('es-PE', { maximumFractionDigits: 8, useGrouping: false }).format(value)
}

function formatSigned(value: number) {
  return `${value < 0 ? ' − ' : ' + '}${formatNumber(Math.abs(value))}·`
}

function subscript(value: number) {
  return String(value).replace(/\d/g, (digit) => '₀₁₂₃₄₅₆₇₈₉'[Number(digit)])
}

function toUserMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar el cálculo. Revisa las entradas e inténtalo nuevamente.'
}
