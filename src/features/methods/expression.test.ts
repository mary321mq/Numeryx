import { describe, expect, it } from 'vitest'

import { evaluateNumericExpression } from './expression'

describe('evaluateNumericExpression', () => {
  it('evalúa expresiones con variables sin usar eval nativo', () => {
    expect(evaluateNumericExpression('sqrt(x^2) + 1', { x: 3 })).toBe(4)
  })
})
