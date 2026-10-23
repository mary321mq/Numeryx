import { calculateLagrangeInterpolation } from './interpolation'
import type { LagrangeInterpolationResult } from './types'

export interface LagrangeDegreeReport {
  degree: number
  result: LagrangeInterpolationResult
}

/**
 * Reproduce el desarrollo gradual de Lagrange: P₁ se forma con los dos
 * primeros nodos, P₂ con los tres primeros y así hasta el polinomio final.
 */
export function createLagrangeProgression(result: LagrangeInterpolationResult): readonly LagrangeDegreeReport[] {
  const firstDegree = result.degree === 0 ? 0 : 1
  return Array.from({ length: result.degree - firstDegree + 1 }, (_value, offset) => {
    const degree = firstDegree + offset
    return {
      degree,
      result: degree === result.degree
        ? result
        : calculateLagrangeInterpolation(result.observations.slice(0, degree + 1), result.targetX),
    }
  })
}
