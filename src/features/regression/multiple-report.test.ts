import { describe, expect, it } from 'vitest'

import { createMultipleCalculationReport } from './multiple-report'
import { fitMultipleLinearRegression } from './regression'

describe('reporte de cálculo de regresión múltiple', () => {
  it('expone predictores, sistema normal, sumas y estadísticas', () => {
    const result = fitMultipleLinearRegression([
      { predictors: [0, 0], y: 4 },
      { predictors: [1, 0], y: 6 },
      { predictors: [0, 1], y: 3 },
      { predictors: [2, 1], y: 7 },
      { predictors: [1, 3], y: 3 },
      { predictors: [3, 2], y: 8 },
    ])
    const report = createMultipleCalculationReport(result, ['horas', 'prácticas'])

    expect(report.calculationTable.columns.map((column) => column.label)).toEqual(['i', 'horas', 'prácticas', 'yᵢ', 'ŷ', '(ŷ − yᵢ)²', '(yᵢ − ȳ)²'])
    expect(report.totals.x0).toBeCloseTo(7, 12)
    expect(report.totals.x1).toBeCloseTo(7, 12)
    expect(report.totals.squaredResidual).toBeCloseTo(result.metrics.sse, 12)
    expect(report.totals.squaredDeviation).toBeCloseTo(result.metrics.sst, 12)
    expect(report.normalMatrix.rows).toHaveLength(3)
    expect(report.rightHandVector.rows.map((row) => row.value)).toEqual(result.normalEquations.vector)
    expect(report.coefficients.rows.map((row) => row.value)).toEqual(result.coefficients)
    expect(report.statistics.rows.find((row) => row.statistic === 'm (número de predictores)')?.value).toBe(2)
  })
})
