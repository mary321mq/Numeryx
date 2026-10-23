import { describe, expect, it } from 'vitest'

import { calculateLagrangeInterpolation } from './interpolation'
import { createLagrangeProgression } from './lagrange-report'

describe('desarrollo progresivo de Lagrange', () => {
  it('construye P₁, P₂ y el polinomio final con los nodos acumulados', () => {
    const result = calculateLagrangeInterpolation([
      { x: 1, y: 1 },
      { x: 1.1, y: 1.23368 },
      { x: 1.2, y: 1.55271 },
      { x: 1.3, y: 1.99372 },
    ], 1.25)
    const progression = createLagrangeProgression(result)

    expect(progression.map((step) => step.degree)).toEqual([1, 2, 3])
    expect(progression.map((step) => step.result.observations.length)).toEqual([2, 3, 4])
    expect(progression[0]?.result.targetY).toBeCloseTo(1.5842, 8)
    expect(progression.at(-1)?.result.targetY).toBeCloseTo(result.targetY, 12)
    expect(progression[1]?.result.bases).toHaveLength(3)
  })

  it('mantiene P₀ cuando solo se recibe un nodo', () => {
    const result = calculateLagrangeInterpolation([{ x: 2, y: 7 }], 1.25)
    expect(createLagrangeProgression(result).map((step) => step.degree)).toEqual([0])
  })
})
