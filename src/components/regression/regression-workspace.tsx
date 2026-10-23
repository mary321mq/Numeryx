import { AlertTriangle, FileSpreadsheet, LineChart, Plus, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'

import { NumericalChart } from '@/components/charts/numerical-chart'
import { EditableXYTable } from '@/components/forms/editable-xy-table'
import { createXYDrafts, type XYDraft } from '@/components/forms/xy-draft'
import { ResultTable } from '@/components/tables/result-table'
import { Button } from '@/components/ui/button'
import { downloadMethodWorkbook } from '@/features/export/excel-export'
import { fitMultipleLinearRegression, fitPolynomialRegression, fitSimpleLinearRegression } from '@/features/regression/regression'
import type { MultipleLinearRegressionResult, MultipleObservation, PolynomialRegressionResult, RegressionResult, SimpleLinearRegressionResult, XYObservation } from '@/features/regression/types'
import { RegressionProblemError } from '@/features/regression/types'
import type { MethodDefinition } from '@/types/catalog'
import type { ChartSeries, ResultTable as ResultTableType } from '@/types/numerical'

interface VariableDraft {
  id: string
  name: string
}

interface MultipleDraftRow {
  id: string
  y: string
  values: Record<string, string>
}

type ChartCapture = (() => Promise<string | undefined>) | null

export function RegressionWorkspace({ method }: { method: MethodDefinition }) {
  switch (method.id) {
    case 'simple-linear-regression':
      return <SimpleLinearWorkspace method={method} />
    case 'polynomial-regression':
      return <PolynomialWorkspace method={method} />
    case 'multiple-linear-regression':
      return <MultipleLinearWorkspace method={method} />
    default:
      return null
  }
}

function SimpleLinearWorkspace({ method }: { method: MethodDefinition }) {
  const [rows, setRows] = useState<XYDraft[]>(() => createXYDrafts(2))
  const [result, setResult] = useState<SimpleLinearRegressionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const updateRows = (nextRows: XYDraft[]) => {
    setRows(nextRows)
    setResult(null)
    setError(null)
  }

  const calculate = () => {
    setResult(null)
    setError(null)
    try {
      setResult(fitSimpleLinearRegression(parsePairRows(rows)))
    } catch (calculationError) {
      setError(toUserMessage(calculationError))
    }
  }

  return <RegressionLayout method={method} title="Ajuste lineal simple" description="Introduce pares (x, y) para ajustar ŷ = b₀ + b₁x. Los valores se conservan al corregir una validación.">
    <EditableXYTable rows={rows} onChange={updateRows} />
    <ActionRow onCalculate={calculate} />
    <CalculationError message={error} />
    <RegressionResultView method={method} result={result} />
  </RegressionLayout>
}

function PolynomialWorkspace({ method }: { method: MethodDefinition }) {
  const [rows, setRows] = useState<XYDraft[]>(() => createXYDrafts(3))
  const [degree, setDegree] = useState('2')
  const [result, setResult] = useState<PolynomialRegressionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const updateRows = (nextRows: XYDraft[]) => {
    setRows(nextRows)
    setResult(null)
    setError(null)
  }

  const calculate = () => {
    setResult(null)
    setError(null)
    try {
      const parsedDegree = parseRequiredInteger(degree, 'El grado del polinomio')
      setResult(fitPolynomialRegression(parsePairRows(rows), parsedDegree))
    } catch (calculationError) {
      setError(toUserMessage(calculationError))
    }
  }

  return <RegressionLayout method={method} title="Ajuste polinómico por mínimos cuadrados" description="El sistema se formula con potencias de x y se resuelve con factorización QR de Householder, sin invertir las ecuaciones normales.">
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_13rem]">
      <EditableXYTable rows={rows} onChange={updateRows} />
      <label className="self-start rounded-xl border border-white/10 bg-black/15 p-4 text-sm font-semibold text-slate-100">Grado del polinomio
        <input value={degree} onChange={(event) => { setDegree(event.target.value); setResult(null); setError(null) }} inputMode="numeric" aria-label="Grado del polinomio" className="mt-3 w-full rounded-lg border border-white/12 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none ring-cyan-300 transition focus:border-cyan-200 focus:ring-2" />
        <span className="mt-2 block text-xs font-normal leading-5 text-slate-500">Debe estar entre 1 y min(n − 1, 8). Los grados altos pueden sobreajustar.</span>
      </label>
    </div>
    <ActionRow onCalculate={calculate} />
    <CalculationError message={error} />
    <RegressionResultView method={method} result={result} />
  </RegressionLayout>
}

function MultipleLinearWorkspace({ method }: { method: MethodDefinition }) {
  const [variables, setVariables] = useState<VariableDraft[]>(() => [{ id: createId(), name: 'x1' }])
  const [rows, setRows] = useState<MultipleDraftRow[]>(() => createMultipleRows(2, []))
  const [result, setResult] = useState<MultipleLinearRegressionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const invalidate = () => {
    setResult(null)
    setError(null)
  }

  const addVariable = () => {
    const variable = { id: createId(), name: `x${variables.length + 1}` }
    setVariables((current) => [...current, variable])
    setRows((current) => current.map((row) => ({ ...row, values: { ...row.values, [variable.id]: '' } })))
    invalidate()
  }

  const removeVariable = (variableId: string) => {
    if (variables.length <= 1) return
    setVariables((current) => current.filter((variable) => variable.id !== variableId))
    setRows((current) => current.map((row) => {
      const { [variableId]: _removedValue, ...remainingValues } = row.values
      return { ...row, values: remainingValues }
    }))
    invalidate()
  }

  const updateVariableName = (variableId: string, name: string) => {
    setVariables((current) => current.map((variable) => variable.id === variableId ? { ...variable, name } : variable))
    invalidate()
  }

  const updateRow = (rowId: string, field: 'y' | string, value: string) => {
    setRows((current) => current.map((row) => field === 'y'
      ? row.id === rowId ? { ...row, y: value } : row
      : row.id === rowId ? { ...row, values: { ...row.values, [field]: value } } : row))
    invalidate()
  }

  const addRow = () => {
    setRows((current) => [...current, createMultipleRow(variables)])
    invalidate()
  }

  const removeRow = (rowId: string) => {
    setRows((current) => current.length > 1 ? current.filter((row) => row.id !== rowId) : current)
    invalidate()
  }

  const calculate = () => {
    setResult(null)
    setError(null)
    try {
      const names = validateVariableNames(variables)
      const observations = parseMultipleRows(rows, variables)
      setResult(fitMultipleLinearRegression(observations))
      setVariables((current) => current.map((variable, index) => ({ ...variable, name: names[index] })))
    } catch (calculationError) {
      setError(toUserMessage(calculationError))
    }
  }

  return <RegressionLayout method={method} title="Ajuste lineal múltiple" description="Define las variables independientes y la respuesta y. El ajuste detecta matrices de diseño sin rango suficiente en lugar de mostrar coeficientes arbitrarios.">
    <section className="rounded-xl border border-white/10 bg-black/15 p-4" aria-labelledby="variables-title">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 id="variables-title" className="text-sm font-semibold text-white">Variables independientes</h3><p className="mt-1 text-xs leading-5 text-slate-500">Edita sus nombres; debe existir al menos una variable.</p></div><Button type="button" variant="secondary" size="sm" onClick={addVariable}><Plus size={15} aria-hidden="true" /> Añadir variable</Button></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{variables.map((variable, index) => <div key={variable.id} className="flex gap-2"><label className="sr-only" htmlFor={`variable-${variable.id}`}>Nombre de la variable {index + 1}</label><input id={`variable-${variable.id}`} value={variable.name} onChange={(event) => updateVariableName(variable.id, event.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/12 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-300 focus:border-cyan-200 focus:ring-2" /><Button type="button" variant="ghost" size="sm" onClick={() => removeVariable(variable.id)} disabled={variables.length === 1} title={variables.length === 1 ? 'Se requiere una variable independiente' : 'Eliminar variable'} aria-label={`Eliminar ${variable.name || `variable ${index + 1}`}`}><Trash2 size={16} aria-hidden="true" /></Button></div>)}</div>
    </section>
    <section className="overflow-x-auto rounded-xl border border-white/10 bg-black/15" aria-labelledby="multiple-data-title">
      <div className="flex min-w-[38rem] items-center justify-between gap-3 border-b border-white/8 px-4 py-3"><div><h3 id="multiple-data-title" className="text-sm font-semibold text-white">Observaciones</h3><p className="mt-1 text-xs text-slate-500">Completa cada predictor y el valor observado y.</p></div><Button type="button" variant="secondary" size="sm" onClick={addRow}><Plus size={15} aria-hidden="true" /> Añadir fila</Button></div>
      <table className="min-w-[38rem] w-full text-left text-sm"><thead className="bg-white/[0.04] text-xs tracking-wide text-slate-400 uppercase"><tr><th className="px-4 py-3">#</th>{variables.map((variable, index) => <th key={variable.id} className="px-3 py-3">{variable.name.trim() || `x${index + 1}`}</th>)}<th className="px-3 py-3">y</th><th className="px-3 py-3"><span className="sr-only">Acciones</span></th></tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={row.id} className="border-t border-white/8"><td className="px-4 py-2 text-slate-500">{rowIndex + 1}</td>{variables.map((variable, index) => <td key={variable.id} className="px-3 py-2"><label className="sr-only" htmlFor={`${row.id}-${variable.id}`}>Fila {rowIndex + 1}, {variable.name || `x${index + 1}`}</label><input id={`${row.id}-${variable.id}`} value={row.values[variable.id] ?? ''} onChange={(event) => updateRow(row.id, variable.id, event.target.value)} inputMode="decimal" className="w-28 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-300 focus:border-cyan-200 focus:ring-2" /></td>)}<td className="px-3 py-2"><label className="sr-only" htmlFor={`${row.id}-y`}>Fila {rowIndex + 1}, y</label><input id={`${row.id}-y`} value={row.y} onChange={(event) => updateRow(row.id, 'y', event.target.value)} inputMode="decimal" className="w-28 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-300 focus:border-cyan-200 focus:ring-2" /></td><td className="px-3 py-2"><Button type="button" variant="ghost" size="sm" onClick={() => removeRow(row.id)} disabled={rows.length === 1} aria-label={`Eliminar fila ${rowIndex + 1}`}><Trash2 size={16} aria-hidden="true" /></Button></td></tr>)}</tbody></table>
    </section>
    <ActionRow onCalculate={calculate} />
    <CalculationError message={error} />
    <RegressionResultView method={method} result={result} variableNames={variables.map((variable, index) => variable.name.trim() || `x${index + 1}`)} />
  </RegressionLayout>
}

function RegressionLayout({ method, title, description, children }: { method: MethodDefinition; title: string; description: string; children: React.ReactNode }) {
  return <div className="mt-8 space-y-5"><section aria-labelledby="regression-workspace-title" className="overflow-hidden rounded-2xl border border-cyan-200/18 bg-slate-900/65"><div className="border-b border-white/8 bg-cyan-300/[0.04] px-5 py-5 sm:px-6"><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Espacio de cálculo</p><h2 id="regression-workspace-title" className="mt-1 text-xl font-bold text-white">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{description}</p></div><div className="space-y-5 p-5 sm:p-6">{children}</div></section><section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"><p className="text-xs font-bold tracking-[0.12em] text-cyan-200 uppercase">Convenciones de ajuste</p><h2 className="mt-2 text-lg font-bold text-white">Métricas calculadas sobre las entradas actuales</h2><p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">SSE = Σeᵢ², SST = Σ(yᵢ − ȳ)² y RMSE = √(SSE / n). R² se calcula como 1 − SSE/SST cuando SST es mayor que cero; si todos los valores de y son iguales, R² se muestra como indefinido.</p><p className="mt-2 text-xs leading-5 text-slate-500">Método activo: {method.name}. Los valores internos no se redondean antes del cálculo.</p></section></div>
}

function ActionRow({ onCalculate }: { onCalculate: () => void }) {
  return <div className="flex flex-wrap items-center gap-3"><Button type="button" onClick={onCalculate}><LineChart size={17} aria-hidden="true" /> Calcular ajuste</Button><p className="text-xs leading-5 text-slate-500">Un cálculo nuevo reemplaza el resultado anterior; editar cualquier campo lo invalida.</p></div>
}

function CalculationError({ message }: { message: string | null }) {
  if (!message) return null
  return <div role="alert" className="flex gap-3 rounded-xl border border-rose-300/25 bg-rose-300/[0.08] p-4 text-sm leading-6 text-rose-100"><AlertTriangle className="mt-0.5 shrink-0 text-rose-200" size={18} aria-hidden="true" />{message}</div>
}

function RegressionResultView({ method, result, variableNames = [] }: { method: MethodDefinition; result: RegressionResult | null; variableNames?: readonly string[] }) {
  const chartCapture = useRef<ChartCapture>(null)
  const [exportState, setExportState] = useState<'idle' | 'working' | 'error'>('idle')
  const chartSeries = useMemo(() => result ? createChartSeries(result) : [], [result])
  const chartInfo = result ? getChartInfo(result) : null
  const table = result ? createResultTable(result, variableNames) : null
  const captureChart = useCallback((capture: ChartCapture) => { chartCapture.current = capture }, [])

  if (!result || !table || !chartInfo) {
    return <section className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-8 text-center"><p className="font-semibold text-slate-200">Aún no hay un cálculo válido.</p><p className="mt-2 text-sm text-slate-500">Completa los datos y selecciona “Calcular ajuste” para mostrar métricas, procedimiento, tabla y gráfica.</p></section>
  }

  const exportWorkbook = async () => {
    setExportState('working')
    try {
      const chartImage = await chartCapture.current?.()
      await downloadMethodWorkbook({
        method,
        generatedAt: new Date(),
        inputs: createExportInputs(result, variableNames),
        highlights: createHighlights(result, variableNames),
        table,
        procedure: createProcedure(result, variableNames).map((step) => `${step.title}: ${step.content}`),
        diagnostics: result.kind === 'polynomial' ? result.warnings : [],
        chartImage: chartImage ? { base64Png: chartImage, title: chartInfo.title } : undefined,
      })
      setExportState('idle')
    } catch {
      setExportState('error')
    }
  }

  return <section className="space-y-5" aria-live="polite"><div className="rounded-xl border border-lime-300/20 bg-lime-300/[0.06] p-4"><p className="text-xs font-bold tracking-[0.12em] text-lime-200 uppercase">Resultado actualizado</p><p className="mt-2 text-sm leading-6 text-slate-300">El ajuste, las métricas, la tabla, el procedimiento y la gráfica corresponden exactamente a las entradas actuales.</p></div><section className="rounded-xl border border-white/10 bg-black/15 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-lg font-bold text-white">Modelo estimado</h3><p className="mt-2 break-words font-mono text-sm leading-7 text-cyan-100">{buildEquation(result, variableNames)}</p></div><Button type="button" variant="secondary" size="sm" onClick={() => void exportWorkbook()} disabled={exportState === 'working'}><FileSpreadsheet size={16} aria-hidden="true" /> {exportState === 'working' ? 'Generando Excel…' : 'Exportar Excel'}</Button></div>{exportState === 'error' && <p role="alert" className="mt-3 text-sm text-rose-200">No se pudo generar el archivo Excel. Reintenta con este resultado válido.</p>}<MetricGrid result={result} /></section><section className="rounded-xl border border-white/10 bg-black/15 p-4 sm:p-5"><h3 className="text-lg font-bold text-white">Datos, estimaciones y residuos</h3><p className="mt-1 text-sm text-slate-500">Residuo eᵢ = yᵢ − ŷᵢ.</p><div className="mt-4"><ResultTable table={table} /></div></section><section className="rounded-xl border border-white/10 bg-black/15 p-4 sm:p-5"><h3 className="text-lg font-bold text-white">Procedimiento generado con estos datos</h3><div className="mt-4 grid gap-3 lg:grid-cols-2">{createProcedure(result, variableNames).map((step, index) => <article key={step.title} className="rounded-xl border border-white/8 bg-white/[0.025] p-4"><p className="text-xs font-bold tracking-[0.1em] text-cyan-200 uppercase">{index + 1}. {step.title}</p><p className="mt-2 text-sm leading-6 text-slate-300">{step.content}</p></article>)}</div></section><section className="rounded-xl border border-white/10 bg-black/15 p-4 sm:p-5"><h3 className="text-lg font-bold text-white">Gráfica del ajuste</h3><p className="mt-1 text-sm text-slate-500">{chartInfo.description}</p><div className="mt-4"><NumericalChart series={chartSeries} title={chartInfo.title} xAxisTitle={chartInfo.xAxisTitle} yAxisTitle={chartInfo.yAxisTitle} downloadFileName={`${method.slug}-grafica`} onCaptureReady={captureChart} /></div></section>{result.kind === 'polynomial' && result.warnings.length > 0 && <div className="flex gap-3 rounded-xl border border-amber-300/25 bg-amber-300/[0.07] p-4 text-sm leading-6 text-amber-100"><AlertTriangle className="mt-0.5 shrink-0 text-amber-200" size={18} aria-hidden="true" />{result.warnings[0]}</div>}</section>
}

function MetricGrid({ result }: { result: RegressionResult }) {
  const { metrics } = result
  const cards = [
    ['Observaciones', String(metrics.observationCount)],
    ['SSE', formatNumber(metrics.sse)],
    ['SST', formatNumber(metrics.sst)],
    ['R²', metrics.rSquared === null ? 'Indefinido (SST = 0)' : formatNumber(metrics.rSquared)],
    ['RMSE', formatNumber(metrics.rmse)],
  ]
  return <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([label, value]) => <div key={label} className="rounded-lg border border-white/8 bg-slate-950/55 p-3"><p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p><p className="mt-2 break-words font-mono text-sm font-bold text-white">{value}</p></div>)}</div>
}

function createResultTable(result: RegressionResult, variableNames: readonly string[]): ResultTableType {
  if (result.kind === 'multiple') {
    const predictorColumns = variableNames.map((name, index) => ({ id: `x${index}`, label: name, numeric: true, precision: 6 }))
    return {
      columns: [{ id: 'index', label: '#', numeric: true }, ...predictorColumns, { id: 'observed', label: 'y', numeric: true, precision: 6 }, { id: 'predicted', label: 'ŷ', numeric: true, precision: 6 }, { id: 'residual', label: 'e = y − ŷ', numeric: true, precision: 6 }],
      rows: result.points.map((point) => ({ index: point.index, ...Object.fromEntries(point.predictors.map((value, index) => [`x${index}`, value])), observed: point.observed, predicted: point.predicted, residual: point.residual })),
    }
  }
  return {
    columns: [{ id: 'index', label: '#', numeric: true }, { id: 'x', label: 'x', numeric: true, precision: 6 }, { id: 'observed', label: 'y', numeric: true, precision: 6 }, { id: 'predicted', label: 'ŷ', numeric: true, precision: 6 }, { id: 'residual', label: 'e = y − ŷ', numeric: true, precision: 6 }],
    rows: result.points.map((point) => ({ index: point.index, x: point.x, observed: point.observed, predicted: point.predicted, residual: point.residual })),
  }
}

function createChartSeries(result: RegressionResult): readonly ChartSeries[] {
  if (result.kind === 'multiple') {
    const observed = result.points.map((point) => point.observed)
    const predicted = result.points.map((point) => point.predicted)
    const lower = Math.min(...observed, ...predicted)
    const upper = Math.max(...observed, ...predicted)
    const padding = lower === upper ? 1 : (upper - lower) * 0.05
    return [
      { id: 'observed-predicted', name: 'Observado frente a predicho', x: predicted, y: observed, mode: 'markers', marker: { color: '#a5f3fc', size: 9 } },
      { id: 'identity', name: 'Referencia y = ŷ', x: [lower - padding, upper + padding], y: [lower - padding, upper + padding], mode: 'lines', line: { color: '#bef264', dash: 'dash', width: 2 } },
    ]
  }

  const sortedPoints = [...result.points].sort((left, right) => left.x - right.x)
  const observed: ChartSeries = { id: 'observed', name: 'Datos observados', x: result.points.map((point) => point.x), y: result.points.map((point) => point.observed), mode: 'markers', marker: { color: '#a5f3fc', size: 9 } }
  if (result.kind === 'simple') {
    return [observed, { id: 'fit', name: 'Recta de regresión', x: sortedPoints.map((point) => point.x), y: sortedPoints.map((point) => point.predicted), mode: 'lines', line: { color: '#bef264', width: 3 } }]
  }
  const minX = sortedPoints[0].x
  const maxX = sortedPoints.at(-1)!.x
  const sampleCount = 100
  const x = Array.from({ length: sampleCount }, (_, index) => minX + (maxX - minX) * index / (sampleCount - 1))
  return [observed, { id: 'fit', name: 'Curva ajustada', x, y: x.map((value) => evaluatePolynomial(result.coefficients, value)), mode: 'lines', line: { color: '#bef264', width: 3 } }]
}

function getChartInfo(result: RegressionResult) {
  if (result.kind === 'multiple') return { title: 'Valores observados frente a predichos', description: 'Cada punto compara ŷ en el eje horizontal con y observado en el eje vertical. La línea discontinua representa coincidencia perfecta.', xAxisTitle: 'Valor predicho ŷ', yAxisTitle: 'Valor observado y' }
  if (result.kind === 'polynomial') return { title: 'Datos observados y curva polinómica', description: 'Los puntos son las observaciones y la curva se evalúa desde los coeficientes obtenidos por QR.', xAxisTitle: 'x', yAxisTitle: 'y / ŷ' }
  return { title: 'Datos observados y recta de regresión', description: 'Los puntos son las observaciones y la línea representa ŷ = b₀ + b₁x.', xAxisTitle: 'x', yAxisTitle: 'y / ŷ' }
}

function createProcedure(result: RegressionResult, variableNames: readonly string[]) {
  const metricsText = `SSE = ${formatNumber(result.metrics.sse)}, SST = ${formatNumber(result.metrics.sst)}, RMSE = ${formatNumber(result.metrics.rmse)} y R² = ${result.metrics.rSquared === null ? 'indefinido porque SST = 0' : formatNumber(result.metrics.rSquared)}.`
  if (result.kind === 'simple') {
    const { sums } = result
    return [
      { title: 'Datos de entrada', content: `n = ${result.metrics.observationCount}; Σx = ${formatNumber(sums.sumX)}, Σy = ${formatNumber(sums.sumY)}, Σx² = ${formatNumber(sums.sumXX)} y Σxy = ${formatNumber(sums.sumXY)}.` },
      { title: 'Fórmulas utilizadas', content: 'b₁ = Σ[(xᵢ − x̄)(yᵢ − ȳ)] / Σ[(xᵢ − x̄)²] y b₀ = ȳ − b₁x̄.' },
      { title: 'Sustitución numérica', content: `x̄ = ${formatNumber(result.meanX)}, ȳ = ${formatNumber(result.meanY)}; con los datos introducidos resulta b₁ = ${formatNumber(result.slope)} y b₀ = ${formatNumber(result.intercept)}.` },
      { title: 'Valores estimados', content: `Para cada fila se aplicó ŷᵢ = ${formatNumber(result.intercept)} + (${formatNumber(result.slope)})xᵢ y eᵢ = yᵢ − ŷᵢ.` },
      { title: 'Métricas e interpretación', content: metricsText },
    ]
  }
  if (result.kind === 'polynomial') {
    const normalSystem = `${formatMatrix(result.normalEquations.matrix)} · [a₀ … a${result.degree}]ᵀ = ${formatVector(result.normalEquations.vector)}`
    return [
      { title: 'Datos de entrada', content: `n = ${result.metrics.observationCount} y grado m = ${result.degree}. La matriz de diseño contiene las columnas 1, x, …, x^${result.degree}.` },
      { title: 'Fórmulas utilizadas', content: 'El modelo es ŷ = a₀ + a₁x + … + aₘx^m. El sistema de mínimos cuadrados se construye como XᵀX a = Xᵀy.' },
      { title: 'Sistema construido', content: normalSystem },
      { title: 'Cálculo de coeficientes', content: `Para evitar invertir XᵀX, se factorizó X = QR y se resolvió R a = Qᵀy. Coeficientes: ${formatVector(result.coefficients)}.` },
      { title: 'Valores estimados y métricas', content: `${metricsText} Los residuos de cada observación se muestran en la tabla.` },
    ]
  }
  const terms = variableNames.map((name, index) => `${name} (b${index + 1} = ${formatNumber(result.coefficients[index + 1])})`).join(', ')
  return [
    { title: 'Datos de entrada', content: `n = ${result.metrics.observationCount} observaciones y ${result.predictorCount} variables independientes: ${variableNames.join(', ')}.` },
    { title: 'Fórmula utilizada', content: 'ŷ = b₀ + b₁x₁ + … + bₚxₚ. La matriz de diseño incorpora una primera columna de unos para el intercepto.' },
    { title: 'Cálculo de coeficientes', content: `La factorización QR de la matriz de diseño resolvió el ajuste sin inversión explícita. b₀ = ${formatNumber(result.coefficients[0])}; ${terms}.` },
    { title: 'Valores estimados', content: 'Cada predicción se obtuvo al multiplicar la fila de entrada [1, x₁, …, xₚ] por el vector de coeficientes; eᵢ = yᵢ − ŷᵢ.' },
    { title: 'Métricas e interpretación', content: metricsText },
  ]
}

function createHighlights(result: RegressionResult, variableNames: readonly string[]) {
  return [
    { label: 'Ecuación', value: buildEquation(result, variableNames) },
    { label: 'SSE', value: result.metrics.sse },
    { label: 'SST', value: result.metrics.sst },
    { label: 'R²', value: result.metrics.rSquared === null ? 'Indefinido (SST = 0)' : result.metrics.rSquared },
    { label: 'RMSE', value: result.metrics.rmse },
  ]
}

function createExportInputs(result: RegressionResult, variableNames: readonly string[]) {
  return {
    'Número de observaciones': result.metrics.observationCount,
    Modelo: buildEquation(result, variableNames),
    ...(result.kind === 'polynomial' ? { 'Grado seleccionado': result.degree } : {}),
    ...(result.kind === 'multiple' ? { 'Variables independientes': variableNames.join(', ') } : {}),
  }
}

function buildEquation(result: RegressionResult, variableNames: readonly string[]) {
  if (result.kind === 'simple') return `ŷ = ${formatNumber(result.intercept)}${formatSignedTerm(result.slope, 'x')}`
  if (result.kind === 'polynomial') return `ŷ = ${result.coefficients.map((coefficient, index) => index === 0 ? formatNumber(coefficient) : formatSignedTerm(coefficient, index === 1 ? 'x' : `x^${index}`)).join('')}`
  return `ŷ = ${result.coefficients.map((coefficient, index) => index === 0 ? formatNumber(coefficient) : formatSignedTerm(coefficient, variableNames[index - 1] ?? `x${index}`)).join('')}`
}

function formatSignedTerm(value: number, symbol: string) {
  return `${value < 0 ? ' − ' : ' + '}${formatNumber(Math.abs(value))}·${symbol}`
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return 'No definido'
  if (Math.abs(value) < 1e-12) return '0'
  return new Intl.NumberFormat('es-PE', { maximumFractionDigits: 8, useGrouping: false }).format(value)
}

function formatVector(values: readonly number[]) {
  return `[${values.map(formatNumber).join(', ')}]ᵀ`
}

function formatMatrix(matrix: readonly (readonly number[])[]) {
  return `[${matrix.map((row) => `[${row.map(formatNumber).join(', ')}]`).join('; ')}]`
}

function evaluatePolynomial(coefficients: readonly number[], x: number) {
  return coefficients.reduce((total, coefficient, exponent) => total + coefficient * x ** exponent, 0)
}

function createMultipleRows(count: number, variables: readonly VariableDraft[]) {
  return Array.from({ length: count }, () => createMultipleRow(variables))
}

function createMultipleRow(variables: readonly VariableDraft[]): MultipleDraftRow {
  return { id: createId(), y: '', values: Object.fromEntries(variables.map((variable) => [variable.id, ''])) }
}

function parsePairRows(rows: readonly XYDraft[]): XYObservation[] {
  return rows.map((row, index) => ({ x: parseRequiredNumber(row.x, `La fila ${index + 1}, x`), y: parseRequiredNumber(row.y, `La fila ${index + 1}, y`) }))
}

function parseMultipleRows(rows: readonly MultipleDraftRow[], variables: readonly VariableDraft[]): MultipleObservation[] {
  return rows.map((row, index) => ({
    predictors: variables.map((variable, variableIndex) => parseRequiredNumber(row.values[variable.id] ?? '', `La fila ${index + 1}, ${variable.name.trim() || `x${variableIndex + 1}`}`)),
    y: parseRequiredNumber(row.y, `La fila ${index + 1}, y`),
  }))
}

function parseRequiredNumber(value: string, label: string) {
  if (value.trim() === '') throw new RegressionProblemError('invalid-number', `${label} es obligatorio.`)
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) throw new RegressionProblemError('invalid-number', `${label} debe ser un número finito.`)
  return numericValue
}

function parseRequiredInteger(value: string, label: string) {
  const numericValue = parseRequiredNumber(value, label)
  if (!Number.isInteger(numericValue)) throw new RegressionProblemError('invalid-degree', `${label} debe ser un número entero.`)
  return numericValue
}

function validateVariableNames(variables: readonly VariableDraft[]) {
  const names = variables.map((variable, index) => {
    const name = variable.name.trim()
    if (!name) throw new RegressionProblemError('invalid-number', `El nombre de la variable ${index + 1} es obligatorio.`)
    return name
  })
  if (new Set(names.map((name) => name.toLocaleLowerCase('es-PE'))).size !== names.length) {
    throw new RegressionProblemError('invalid-number', 'Los nombres de las variables independientes deben ser distintos.')
  }
  return names
}

function toUserMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar el cálculo. Revisa las entradas e inténtalo nuevamente.'
}

function createId() {
  return `row-${Math.random().toString(36).slice(2, 10)}`
}
