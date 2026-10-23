import { describe, expect, it } from 'vitest'

import { createPolynomialCalculationReport } from './polynomial-report'
import { fitPolynomialRegression } from './regression'

describe('reporte de cálculo polinómico', () => {
  it('expone las potencias, productos, sumas y sistema normal del ajuste', () => {
    const result = fitPolynomialRegression([
      { x: 2, y: 5.6 },
      { x: 3, y: 7.8 },
      { x: 4, y: 10 },
      { x: 5, y: 11 },
    ], 2)
    const report = createPolynomialCalculationReport(result)

    expect(report.calculationTable.columns.map((column) => column.label)).toEqual([
      'i', 'xᵢ', 'yᵢ', 'x²', 'x³', 'x⁴', 'xᵢ·yᵢ', 'x²·yᵢ', 'ŷ = P(x)', '(ŷ − yᵢ)²', '(yᵢ − ȳ)²',
    ])
    expect(report.totals.x).toBeCloseTo(14, 12)
    expect(report.totals['power-2']).toBeCloseTo(result.normalEquations.matrix[1]?.[1] ?? 0, 12)
    expect(report.totals['product-2']).toBeCloseTo(result.normalEquations.vector[2] ?? 0, 12)
    expect(report.totals.squaredResidual).toBeCloseTo(result.metrics.sse, 12)
    expect(report.totals.squaredDeviation).toBeCloseTo(result.metrics.sst, 12)
    expect(report.normalMatrix.rows).toHaveLength(3)
    expect(report.rightHandVector.rows.map((row) => row.value)).toEqual(result.normalEquations.vector)
    expect(report.coefficients.rows.map((row) => row.value)).toEqual(result.coefficients)
    expect(report.statistics.rows.map((row) => row.statistic)).toEqual([
      'n', 'Media de y (ȳ)', 'Q = Σ(ŷ − yᵢ)²', 'Σ(yᵢ − ȳ)² = SST', 'm (grado del polinomio)', 'Sᵧ/ₓ = √[Q / (n − (m + 1))]', 'r² = (SST − Q) / SST', 'r = √(r²)',
    ])
    expect(report.standardError).toBeCloseTo(Math.sqrt(result.metrics.sse), 12)
    expect(report.correlation).toBeCloseTo(Math.sqrt(result.metrics.rSquared ?? 0), 12)
  })
})
