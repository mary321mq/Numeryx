import { describe, expect, it } from 'vitest'

import { calculateLagrangeInterpolation, calculateNewtonInterpolation, evaluateLagrange, evaluateNewton } from './interpolation'
import { InterpolationProblemError } from './types'

describe('algoritmos de interpolación', () => {
  const line = [{ x: 0, y: 1 }, { x: 2, y: 5 }]
  const quadratic = [{ x: -1, y: 4 }, { x: 0, y: 1 }, { x: 2, y: 1 }]

  it('interpela una recta con Lagrange sin redondear durante el cálculo', () => {
    const result = calculateLagrangeInterpolation(line, 1.5)
    expect(result.targetY).toBeCloseTo(4, 12)
    expect(result.degree).toBe(1)
    expect(result.bases.map((basis) => basis.valueAtTarget)).toEqual(expect.arrayContaining([expect.closeTo(0.25, 12), expect.closeTo(0.75, 12)]))
  })

  it('construye diferencias divididas y evalúa un polinomio cuadrático con Newton', () => {
    const result = calculateNewtonInterpolation(quadratic, 3)
    expect(result.targetY).toBeCloseTo(4, 12)
    expect(result.dividedDifferences[0]).toEqual([4, 1, 1])
    expect(result.dividedDifferences[1]).toEqual(expect.arrayContaining([expect.closeTo(-3, 12), expect.closeTo(0, 12)]))
    expect(result.dividedDifferences[2][0]).toBeCloseTo(1, 12)
  })

  it('reproduce exactamente los nodos de interpolación', () => {
    const lagrange = calculateLagrangeInterpolation(quadratic, 0.5)
    const newton = calculateNewtonInterpolation(quadratic, 0.5)
    expect(lagrange.verification.every((entry) => Math.abs(entry.error) < 1e-10)).toBe(true)
    expect(newton.verification.every((entry) => Math.abs(entry.error) < 1e-10)).toBe(true)
  })

  it('obtiene el mismo resultado en Lagrange y Newton', () => {
    const lagrange = calculateLagrangeInterpolation(quadratic, 0.5)
    const newton = calculateNewtonInterpolation(quadratic, 0.5)
    expect(lagrange.targetY).toBeCloseTo(newton.targetY, 12)
    expect(evaluateLagrange(quadratic, 0.5)).toBeCloseTo(evaluateNewton(quadratic, newton.terms.map((term) => term.coefficient), 0.5), 12)
  })

  it('rechaza nodos x repetidos y valores no finitos', () => {
    expect(() => calculateLagrangeInterpolation([{ x: 1, y: 2 }, { x: 1, y: 3 }], 2)).toThrow(InterpolationProblemError)
    expect(() => calculateNewtonInterpolation([{ x: 0, y: Number.NaN }], 1)).toThrow(/finitos/i)
  })

  it('admite un único nodo como polinomio constante P₀', () => {
    const lagrange = calculateLagrangeInterpolation([{ x: 2, y: 7 }], -5)
    const newton = calculateNewtonInterpolation([{ x: 2, y: 7 }], -5)
    expect(lagrange.targetY).toBe(7)
    expect(newton.targetY).toBe(7)
    expect(lagrange.degree).toBe(0)
  })
})
