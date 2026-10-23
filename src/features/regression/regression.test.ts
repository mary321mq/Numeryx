import { describe, expect, it } from 'vitest'

import { fitMultipleLinearRegression, fitPolynomialRegression, fitSimpleLinearRegression } from './regression'
import { RegressionProblemError } from './types'

describe('algoritmos de regresión', () => {
  it('ajusta una recta exacta, sus predicciones y sus métricas', () => {
    const result = fitSimpleLinearRegression([
      { x: -1, y: -1 },
      { x: 0, y: 1 },
      { x: 2, y: 5 },
      { x: 4, y: 9 },
    ])

    expect(result.slope).toBeCloseTo(2, 12)
    expect(result.intercept).toBeCloseTo(1, 12)
    expect(result.points.map((point) => point.predicted)).toEqual(expect.arrayContaining([expect.closeTo(-1, 12), expect.closeTo(9, 12)]))
    expect(result.metrics).toMatchObject({ observationCount: 4, sse: expect.closeTo(0, 12), rSquared: expect.closeTo(1, 12), rmse: expect.closeTo(0, 12) })
  })

  it('ajusta un polinomio conocido con QR sin invertir la matriz normal', () => {
    const result = fitPolynomialRegression([
      { x: -2, y: 17 },
      { x: -1, y: 6 },
      { x: 0, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 9 },
    ], 2)

    expect(result.coefficients).toEqual(expect.arrayContaining([expect.closeTo(1, 10), expect.closeTo(-2, 10), expect.closeTo(3, 10)]))
    expect(result.points.map((point) => point.predicted)).toEqual(expect.arrayContaining([expect.closeTo(17, 10), expect.closeTo(9, 10)]))
    expect(result.metrics.sse).toBeCloseTo(0, 10)
    expect(result.metrics.rSquared).toBeCloseTo(1, 10)
  })

  it('ajusta una regresión múltiple con coeficientes conocidos', () => {
    const result = fitMultipleLinearRegression([
      { predictors: [0, 0], y: 4 },
      { predictors: [1, 0], y: 6 },
      { predictors: [0, 1], y: 3 },
      { predictors: [2, 1], y: 7 },
      { predictors: [1, 3], y: 3 },
      { predictors: [3, 2], y: 8 },
    ])

    expect(result.coefficients).toEqual(expect.arrayContaining([expect.closeTo(4, 10), expect.closeTo(2, 10), expect.closeTo(-1, 10)]))
    expect(result.metrics).toMatchObject({ sse: expect.closeTo(0, 10), rSquared: expect.closeTo(1, 10), rmse: expect.closeTo(0, 10) })
  })

  it('informa datos insuficientes, grados inválidos y columnas dependientes', () => {
    expect(() => fitSimpleLinearRegression([{ x: 1, y: 2 }])).toThrow(RegressionProblemError)
    expect(() => fitPolynomialRegression([{ x: 0, y: 0 }, { x: 1, y: 1 }], 2)).toThrow(/grado debe ser menor/i)
    expect(() => fitMultipleLinearRegression([
      { predictors: [1, 2], y: 1 },
      { predictors: [2, 4], y: 2 },
      { predictors: [3, 6], y: 3 },
    ])).toThrow(/rango suficiente|multicolinealidad/i)
  })

  it('mantiene SSE y RMSE y comunica R² indefinido cuando SST es cero', () => {
    const result = fitSimpleLinearRegression([
      { x: 0, y: 5 },
      { x: 1, y: 5 },
      { x: 2, y: 5 },
    ])

    expect(result.metrics.sse).toBeCloseTo(0, 12)
    expect(result.metrics.sst).toBeCloseTo(0, 12)
    expect(result.metrics.rmse).toBeCloseTo(0, 12)
    expect(result.metrics.rSquared).toBeNull()
  })
})
