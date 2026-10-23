import type { MultipleLinearRegressionResult } from './types'
import type { ResultColumn, ResultTable } from '@/types/numerical'

type TableRow = ResultTable['rows'][number]

export interface MultipleCalculationReport {
  calculationTable: ResultTable
  totals: TableRow
  normalMatrix: ResultTable
  rightHandVector: ResultTable
  coefficients: ResultTable
  statistics: ResultTable
}

/** Datos de auditoría para presentar el ajuste múltiple sin cambiar la
 * resolución numérica por QR usada para obtener los coeficientes. */
export function createMultipleCalculationReport(result: MultipleLinearRegressionResult, variableNames: readonly string[]): MultipleCalculationReport {
  const names = Array.from({ length: result.predictorCount }, (_value, index) => variableNames[index]?.trim() || `x${index + 1}`)
  const columns: ResultColumn[] = [
    { id: 'index', label: 'i', numeric: true, precision: 0 },
    ...names.map((name, index) => ({ id: `x${index}`, label: name, numeric: true, precision: 6 })),
    { id: 'observed', label: 'yᵢ', numeric: true, precision: 6 },
    { id: 'predicted', label: 'ŷ', numeric: true, precision: 6 },
    { id: 'squaredResidual', label: '(ŷ − yᵢ)²', numeric: true, precision: 6 },
    { id: 'squaredDeviation', label: '(yᵢ − ȳ)²', numeric: true, precision: 6 },
  ]
  const meanY = sum(result.points.map((point) => point.observed)) / result.points.length
  const rows = result.points.map<TableRow>((point) => ({
    index: point.index,
    ...Object.fromEntries(point.predictors.map((value, index) => [`x${index}`, value])),
    observed: point.observed,
    predicted: point.predicted,
    squaredResidual: point.residual ** 2,
    squaredDeviation: (point.observed - meanY) ** 2,
  }))
  const termLabels = ['b₀', ...names]
  const residualDegreesOfFreedom = result.metrics.observationCount - (result.predictorCount + 1)
  const standardError = residualDegreesOfFreedom > 0 ? Math.sqrt(result.metrics.sse / residualDegreesOfFreedom) : null
  const correlation = result.metrics.rSquared !== null && result.metrics.rSquared >= 0 ? Math.sqrt(result.metrics.rSquared) : null

  return {
    calculationTable: { columns, rows },
    totals: createTotals(columns, rows),
    normalMatrix: {
      columns: [{ id: 'row', label: 'C = XᵀX' }, ...termLabels.map((label, index) => ({ id: `term-${index}`, label, numeric: true, precision: 6 }))],
      rows: result.normalEquations.matrix.map((row, rowIndex) => ({ row: termLabels[rowIndex], ...Object.fromEntries(row.map((value, columnIndex) => [`term-${columnIndex}`, value])) })),
    },
    rightHandVector: {
      columns: [{ id: 'term', label: 'Componente de Xᵀy' }, { id: 'value', label: 'Valor', numeric: true, precision: 6 }],
      rows: result.normalEquations.vector.map((value, index) => ({ term: index === 0 ? 'Σyᵢ' : `Σ(${names[index - 1]}·yᵢ)`, value })),
    },
    coefficients: {
      columns: [{ id: 'coefficient', label: 'Coeficiente' }, { id: 'value', label: 'Valor', numeric: true, precision: 8 }, { id: 'term', label: 'Término del modelo' }],
      rows: result.coefficients.map((value, index) => ({ coefficient: `b${toSubscript(index)}`, value, term: index === 0 ? 'Constante' : names[index - 1] })),
    },
    statistics: {
      columns: [{ id: 'statistic', label: 'Estadístico' }, { id: 'value', label: 'Valor', numeric: true, precision: 8 }],
      rows: [
        { statistic: 'n', value: result.metrics.observationCount },
        { statistic: 'Media de y (ȳ)', value: meanY },
        { statistic: 'Q = Σ(ŷ − yᵢ)²', value: result.metrics.sse },
        { statistic: 'Σ(yᵢ − ȳ)² = SST', value: result.metrics.sst },
        { statistic: 'm (número de predictores)', value: result.predictorCount },
        { statistic: 'Sᵧ/ₓ = √[Q / (n − (m + 1))]', value: standardError ?? 'No definido: n debe ser mayor que m + 1' },
        { statistic: 'r² = (SST − Q) / SST', value: result.metrics.rSquared ?? 'No definido: SST = 0' },
        { statistic: 'r = √(r²)', value: correlation ?? 'No definido: r² no es positivo' },
      ],
    },
  }
}

function createTotals(columns: readonly ResultColumn[], rows: readonly TableRow[]): TableRow {
  return Object.fromEntries(columns.map((column) => {
    if (column.id === 'index') return [column.id, 'Σ']
    if (!column.numeric) return [column.id, null]
    return [column.id, sum(rows.map((row) => {
      const value = row[column.id]
      return typeof value === 'number' ? value : 0
    }))]
  }))
}

function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function toSubscript(value: number) {
  return String(value).replace(/\d/g, (digit) => '₀₁₂₃₄₅₆₇₈₉'[Number(digit)] ?? digit)
}
