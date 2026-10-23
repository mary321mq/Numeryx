import type {
  InterpolationVerification,
  LagrangeBasis,
  LagrangeInterpolationResult,
  NewtonDifferenceOperation,
  NewtonInterpolationResult,
  NewtonTerm,
  XYObservation,
} from './types'
import { InterpolationProblemError } from './types'

const RELATIVE_TOLERANCE = 1e-12

export function calculateLagrangeInterpolation(observations: readonly XYObservation[], targetX: number): LagrangeInterpolationResult {
  const points = validateProblem(observations, targetX)
  const bases = points.map((_unusedPoint, index) => calculateLagrangeBasis(points, index, targetX))
  const targetY = assertFinite(bases.reduce((sum, basis) => sum + basis.contribution, 0), 'El polinomio de Lagrange produjo un resultado no finito.')

  return {
    kind: 'lagrange',
    observations: points,
    targetX,
    targetY,
    degree: points.length - 1,
    bases,
    verification: points.map((point, index) => createVerification(index, point, evaluateLagrange(points, point.x))),
  }
}

export function calculateNewtonInterpolation(observations: readonly XYObservation[], targetX: number): NewtonInterpolationResult {
  const points = validateProblem(observations, targetX)
  const { table, operations } = calculateDividedDifferences(points)
  const terms: NewtonTerm[] = table.map((column, order) => ({
    order,
    coefficient: column[0],
    nodes: points.slice(0, order).map((point) => point.x),
  }))
  const coefficients = terms.map((term) => term.coefficient)
  const targetY = evaluateNewton(points, coefficients, targetX)

  return {
    kind: 'newton',
    observations: points,
    targetX,
    targetY,
    degree: points.length - 1,
    dividedDifferences: table,
    differenceOperations: operations,
    terms,
    verification: points.map((point, index) => createVerification(index, point, evaluateNewton(points, coefficients, point.x))),
  }
}

export function evaluateLagrange(observations: readonly XYObservation[], x: number) {
  const points = validateProblem(observations, x)
  const value = points.reduce((sum, _unusedPoint, index) => sum + calculateLagrangeBasis(points, index, x).contribution, 0)
  return assertFinite(value, 'La evaluación de Lagrange produjo un resultado no finito.')
}

export function evaluateNewton(observations: readonly XYObservation[], coefficients: readonly number[], x: number) {
  const points = validateProblem(observations, x)
  if (coefficients.length !== points.length) throw new InterpolationProblemError('invalid-number', 'Los coeficientes de Newton no coinciden con los nodos.')
  let value = coefficients[coefficients.length - 1]
  for (let index = coefficients.length - 2; index >= 0; index -= 1) value = coefficients[index] + (x - points[index].x) * value
  return assertFinite(value, 'La evaluación de Newton produjo un resultado no finito.')
}

function calculateLagrangeBasis(points: readonly XYObservation[], index: number, targetX: number): LagrangeBasis {
  const point = points[index]
  const numeratorFactors: number[] = []
  const denominatorFactors: number[] = []
  points.forEach((other, otherIndex) => {
    if (otherIndex === index) return
    numeratorFactors.push(targetX - other.x)
    denominatorFactors.push(point.x - other.x)
  })
  const numerator = numeratorFactors.reduce((product, factor) => product * factor, 1)
  const denominator = denominatorFactors.reduce((product, factor) => product * factor, 1)
  if (approximatelyZero(denominator, point.x)) throw new InterpolationProblemError('duplicate-x', 'Los valores de x deben ser distintos para interpolar.')
  const valueAtTarget = assertFinite(numerator / denominator, 'Una base de Lagrange produjo un valor no finito.')
  return { index, nodeX: point.x, nodeY: point.y, numeratorFactors, denominatorFactors, numerator, denominator, valueAtTarget, contribution: assertFinite(point.y * valueAtTarget, 'Una contribución de Lagrange produjo un valor no finito.') }
}

function calculateDividedDifferences(points: readonly XYObservation[]) {
  const table: number[][] = [points.map((point) => point.y)]
  const operations: NewtonDifferenceOperation[] = []
  for (let order = 1; order < points.length; order += 1) {
    const previous = table[order - 1]
    const column: number[] = []
    for (let index = 0; index < points.length - order; index += 1) {
      const numerator = previous[index + 1] - previous[index]
      const denominator = points[index + order].x - points[index].x
      if (approximatelyZero(denominator, points[index].x)) throw new InterpolationProblemError('duplicate-x', 'Los valores de x deben ser distintos para calcular diferencias divididas.')
      const value = assertFinite(numerator / denominator, 'Una diferencia dividida produjo un valor no finito.')
      column.push(value)
      operations.push({ order, index, numerator, denominator, value })
    }
    table.push(column)
  }
  return { table, operations }
}

function validateProblem(observations: readonly XYObservation[], targetX: number) {
  if (!Number.isFinite(targetX)) throw new InterpolationProblemError('invalid-number', 'El valor objetivo x debe ser un número finito.')
  if (observations.length === 0) throw new InterpolationProblemError('insufficient-data', 'Ingresa al menos un punto (x, y) para interpolar.')
  const points = observations.map((point, index) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) throw new InterpolationProblemError('invalid-number', `La fila ${index + 1} debe contener valores numéricos finitos para x e y.`)
    return { x: point.x, y: point.y }
  })
  for (let first = 0; first < points.length; first += 1) {
    for (let second = first + 1; second < points.length; second += 1) {
      if (approximatelyEqual(points[first].x, points[second].x)) throw new InterpolationProblemError('duplicate-x', `Los valores x de las filas ${first + 1} y ${second + 1} son iguales o demasiado cercanos.`)
    }
  }
  return points
}

function createVerification(index: number, point: XYObservation, calculated: number): InterpolationVerification {
  return { index, x: point.x, expected: point.y, calculated, error: calculated - point.y }
}

function approximatelyEqual(left: number, right: number) {
  return Math.abs(left - right) <= RELATIVE_TOLERANCE * Math.max(1, Math.abs(left), Math.abs(right))
}

function approximatelyZero(value: number, scale: number) {
  return Math.abs(value) <= RELATIVE_TOLERANCE * Math.max(1, Math.abs(scale))
}

function assertFinite(value: number, message: string) {
  if (!Number.isFinite(value)) throw new InterpolationProblemError('non-finite-result', message)
  return value
}
