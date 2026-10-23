import { evaluate } from 'mathjs'

/**
 * Evalúa una expresión numérica con Math.js. Los futuros formularios deben usar
 * esta función en lugar de `eval`, después de validar su propio esquema de datos.
 */
export function evaluateNumericExpression(expression: string, scope: Readonly<Record<string, number>> = {}) {
  const result = evaluate(expression, scope)
  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new Error('La expresión debe producir un número finito.')
  }
  return result
}
