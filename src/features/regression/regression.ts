import { LeastSquaresError, solveLeastSquaresByQr } from './least-squares'
import type {
  MultipleLinearRegressionResult,
  MultipleObservation,
  NormalEquationSystem,
  PolynomialRegressionResult,
  RegressionMetrics,
  RegressionPoint,
  SimpleLinearRegressionResult,
  XYObservation,
} from './types'
import { RegressionProblemError } from './types'

const RELATIVE_TOLERANCE = 1e-12
const MAX_POLYNOMIAL_DEGREE = 8

export function fitSimpleLinearRegression(observations: readonly XYObservation[]): SimpleLinearRegressionResult {
  validateXyObservations(observations, 2)
  const observationCount = observations.length
  const sumX = sum(observations.map((point) => point.x))
  const sumY = sum(observations.map((point) => point.y))
  const sumXX = sum(observations.map((point) => point.x * point.x))
  const sumXY = sum(observations.map((point) => point.x * point.y))
  const meanX = sumX / observationCount
  const meanY = sumY / observationCount
  const centeredXX = sum(observations.map((point) => (point.x - meanX) ** 2))
  const centeredXY = sum(observations.map((point) => (point.x - meanX) * (point.y - meanY)))

  if (isEffectivelyZero(centeredXX, sumXX)) {
    throw new RegressionProblemError('zero-variance', 'No se puede ajustar una recta: todos los valores de x son iguales o indistinguibles numéricamente.')
  }

  const slope = centeredXY / centeredXX
  const intercept = meanY - slope * meanX
  const predicted = observations.map((point) => intercept + slope * point.x)
  const points = buildRegressionPoints(observations, predicted)

  return {
    kind: 'simple',
    slope,
    intercept,
    meanX,
    meanY,
    sums: { sumX, sumY, sumXX, sumXY },
    points,
    metrics: calculateMetrics(observations.map((point) => point.y), predicted),
  }
}

export function fitPolynomialRegression(observations: readonly XYObservation[], degree: number): PolynomialRegressionResult {
  validateXyObservations(observations, 2)
  if (!Number.isInteger(degree) || degree < 1) {
    throw new RegressionProblemError('invalid-degree', 'El grado debe ser un número entero mayor o igual que 1.')
  }
  if (degree > MAX_POLYNOMIAL_DEGREE) {
    throw new RegressionProblemError('invalid-degree', `El grado máximo permitido es ${MAX_POLYNOMIAL_DEGREE} para evitar ajustes numéricamente inestables.`)
  }
  if (degree >= observations.length) {
    throw new RegressionProblemError('invalid-degree', 'El grado debe ser menor que el número de observaciones para obtener un ajuste determinado.')
  }

  const designMatrix = observations.map((point) => Array.from({ length: degree + 1 }, (_, exponent) => point.x ** exponent))
  const target = observations.map((point) => point.y)
  const coefficients = solveWithQr(designMatrix, target)
  const predicted = designMatrix.map((row) => dotProduct(row, coefficients))
  const warnings = degree >= 5
    ? ['Los grados altos pueden sobreajustar los datos y aumentar la sensibilidad ante pequeños cambios.']
    : []

  return {
    kind: 'polynomial',
    degree,
    coefficients,
    normalEquations: buildNormalEquations(designMatrix, target),
    points: buildRegressionPoints(observations, predicted),
    metrics: calculateMetrics(target, predicted),
    warnings,
  }
}

export function fitMultipleLinearRegression(observations: readonly MultipleObservation[]): MultipleLinearRegressionResult {
  if (observations.length < 2) {
    throw new RegressionProblemError('insufficient-data', 'Agrega al menos dos observaciones antes de calcular.')
  }
  const predictorCount = observations[0]?.predictors.length ?? 0
  if (predictorCount === 0) {
    throw new RegressionProblemError('insufficient-data', 'Agrega al menos una variable independiente.')
  }
  if (observations.length < predictorCount + 1) {
    throw new RegressionProblemError('insufficient-data', `Se requieren al menos ${predictorCount + 1} observaciones para ${predictorCount} variable${predictorCount === 1 ? '' : 's'} independiente${predictorCount === 1 ? '' : 's'} y el intercepto.`)
  }
  observations.forEach((observation, index) => {
    if (observation.predictors.length !== predictorCount || !Number.isFinite(observation.y) || observation.predictors.some((value) => !Number.isFinite(value))) {
      throw new RegressionProblemError('invalid-number', `La observación ${index + 1} tiene valores vacíos o no numéricos.`)
    }
  })

  const designMatrix = observations.map((observation) => [1, ...observation.predictors])
  const target = observations.map((observation) => observation.y)
  const coefficients = solveWithQr(designMatrix, target)
  const predicted = designMatrix.map((row) => dotProduct(row, coefficients))

  return {
    kind: 'multiple',
    coefficients,
    predictorCount,
    points: observations.map((observation, index) => ({
      index: index + 1,
      predictors: [...observation.predictors],
      observed: observation.y,
      predicted: predicted[index],
      residual: observation.y - predicted[index],
    })),
    metrics: calculateMetrics(target, predicted),
  }
}

function validateXyObservations(observations: readonly XYObservation[], minimum: number) {
  if (observations.length < minimum) {
    throw new RegressionProblemError('insufficient-data', `Se requieren al menos ${minimum} observaciones para este ajuste.`)
  }
  observations.forEach((point, index) => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      throw new RegressionProblemError('invalid-number', `La fila ${index + 1} tiene valores vacíos o no numéricos.`)
    }
  })
}

function solveWithQr(matrix: readonly (readonly number[])[], target: readonly number[]) {
  try {
    return solveLeastSquaresByQr(matrix, target)
  } catch (error) {
    if (error instanceof LeastSquaresError) {
      throw new RegressionProblemError('rank-deficient', `${error.message} Revisa columnas dependientes o valores repetidos.`)
    }
    throw error
  }
}

function buildRegressionPoints(observations: readonly XYObservation[], predicted: readonly number[]): readonly RegressionPoint[] {
  return observations.map((point, index) => ({
    index: index + 1,
    x: point.x,
    observed: point.y,
    predicted: predicted[index],
    residual: point.y - predicted[index],
  }))
}

export function calculateMetrics(observed: readonly number[], predicted: readonly number[]): RegressionMetrics {
  const observationCount = observed.length
  const mean = sum(observed) / observationCount
  const sse = sum(observed.map((value, index) => (value - predicted[index]) ** 2))
  const sst = sum(observed.map((value) => (value - mean) ** 2))
  const rSquared = isEffectivelyZero(sst, sum(observed.map((value) => value * value))) ? null : 1 - sse / sst
  return { observationCount, sse, sst, rSquared, rmse: Math.sqrt(sse / observationCount) }
}

function buildNormalEquations(matrix: readonly (readonly number[])[], target: readonly number[]): NormalEquationSystem {
  const size = matrix[0].length
  return {
    matrix: Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, column) => sum(matrix.map((values) => values[row] * values[column])))),
    vector: Array.from({ length: size }, (_, column) => sum(matrix.map((values, row) => values[column] * target[row]))),
  }
}

function isEffectivelyZero(value: number, scale: number) {
  return Math.abs(value) <= RELATIVE_TOLERANCE * Math.max(1, Math.abs(scale))
}

function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function dotProduct(left: readonly number[], right: readonly number[]) {
  return left.reduce((total, value, index) => total + value * right[index], 0)
}
