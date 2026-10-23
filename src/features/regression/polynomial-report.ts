import type { PolynomialRegressionResult } from './types'
import type { ResultColumn, ResultTable } from '@/types/numerical'

type TableRow = ResultTable['rows'][number]

export interface PolynomialCalculationReport {
  calculationTable: ResultTable
  totals: TableRow
  normalMatrix: ResultTable
  rightHandVector: ResultTable
  coefficients: ResultTable
  statistics: ResultTable
  meanY: number
  standardError: number | null
  correlation: number | null
}

/**
 * Prepara los datos de auditoría del ajuste polinómico. El cálculo de los
 * coeficientes sigue realizándose mediante QR; aquí solo se exponen de forma
 * legible las sumas que componen XᵀX y Xᵀy.
 */
export function createPolynomialCalculationReport(result: PolynomialRegressionResult): PolynomialCalculationReport {
  const powerExponents = Array.from({ length: result.degree * 2 - 1 }, (_, index) => index + 2)
  const productExponents = Array.from({ length: result.degree }, (_, index) => index + 1)
  const columns: ResultColumn[] = [
    { id: 'index', label: 'i', numeric: true, precision: 0 },
    { id: 'x', label: 'xᵢ', numeric: true, precision: 6 },
    { id: 'observed', label: 'yᵢ', numeric: true, precision: 6 },
    ...powerExponents.map((exponent) => ({ id: `power-${exponent}`, label: powerLabel(exponent), numeric: true, precision: 6 })),
    ...productExponents.map((exponent) => ({ id: `product-${exponent}`, label: productLabel(exponent), numeric: true, precision: 6 })),
    { id: 'predicted', label: 'ŷ = P(x)', numeric: true, precision: 6 },
    { id: 'squaredResidual', label: '(ŷ − yᵢ)²', numeric: true, precision: 6 },
    { id: 'squaredDeviation', label: '(yᵢ − ȳ)²', numeric: true, precision: 6 },
  ]
  const meanY = sum(result.points.map((point) => point.observed)) / result.points.length
  const residualDegreesOfFreedom = result.metrics.observationCount - (result.degree + 1)
  const standardError = residualDegreesOfFreedom > 0 ? Math.sqrt(result.metrics.sse / residualDegreesOfFreedom) : null
  const correlation = result.metrics.rSquared !== null && result.metrics.rSquared >= 0 ? Math.sqrt(result.metrics.rSquared) : null
  const rows = result.points.map<TableRow>((point) => ({
    index: point.index,
    x: point.x,
    observed: point.observed,
    ...Object.fromEntries(powerExponents.map((exponent) => [`power-${exponent}`, point.x ** exponent])),
    ...Object.fromEntries(productExponents.map((exponent) => [`product-${exponent}`, point.x ** exponent * point.observed])),
    predicted: point.predicted,
    squaredResidual: point.residual ** 2,
    squaredDeviation: (point.observed - meanY) ** 2,
  }))

  return {
    calculationTable: { columns, rows },
    totals: createTotals(columns, rows),
    normalMatrix: {
      columns: [{ id: 'row', label: 'C = XᵀX' }, ...result.coefficients.map((_value, index) => ({ id: `a${index}`, label: coefficientLabel(index), numeric: true, precision: 6 }))],
      rows: result.normalEquations.matrix.map((row, rowIndex) => ({
        row: coefficientLabel(rowIndex),
        ...Object.fromEntries(row.map((value, columnIndex) => [`a${columnIndex}`, value])),
      })),
    },
    rightHandVector: {
      columns: [{ id: 'term', label: 'Componente de Xᵀy' }, { id: 'value', label: 'Valor', numeric: true, precision: 6 }],
      rows: result.normalEquations.vector.map((value, index) => ({ term: vectorTerm(index), value })),
    },
    coefficients: {
      columns: [{ id: 'coefficient', label: 'Coeficiente' }, { id: 'value', label: 'Valor', numeric: true, precision: 8 }, { id: 'term', label: 'Término del modelo' }],
      rows: result.coefficients.map((value, index) => ({ coefficient: coefficientLabel(index), value, term: index === 0 ? 'Constante' : index === 1 ? 'x' : `x${toSuperscript(index)}` })),
    },
    statistics: {
      columns: [{ id: 'statistic', label: 'Estadístico' }, { id: 'value', label: 'Valor', numeric: true, precision: 8 }],
      rows: [
        { statistic: 'n', value: result.metrics.observationCount },
        { statistic: 'Media de y (ȳ)', value: meanY },
        { statistic: 'Q = Σ(ŷ − yᵢ)²', value: result.metrics.sse },
        { statistic: 'Σ(yᵢ − ȳ)² = SST', value: result.metrics.sst },
        { statistic: 'm (grado del polinomio)', value: result.degree },
        { statistic: 'Sᵧ/ₓ = √[Q / (n − (m + 1))]', value: standardError ?? 'No definido: n debe ser mayor que m + 1' },
        { statistic: 'r² = (SST − Q) / SST', value: result.metrics.rSquared ?? 'No definido: SST = 0' },
        { statistic: 'r = √(r²)', value: correlation ?? 'No definido: r² no es positivo' },
      ],
    },
    meanY,
    standardError,
    correlation,
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

function coefficientLabel(index: number) {
  return `a${toSubscript(index)}`
}

function vectorTerm(index: number) {
  if (index === 0) return 'Σyᵢ'
  return `Σ${productLabel(index)}`
}

function powerLabel(exponent: number) {
  return `x${toSuperscript(exponent)}`
}

function productLabel(exponent: number) {
  return exponent === 1 ? 'xᵢ·yᵢ' : `x${toSuperscript(exponent)}·yᵢ`
}

function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function toSubscript(value: number) {
  return String(value).replace(/\d/g, (digit) => '₀₁₂₃₄₅₆₇₈₉'[Number(digit)] ?? digit)
}

function toSuperscript(value: number) {
  return String(value).replace(/\d/g, (digit) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digit)] ?? digit)
}
