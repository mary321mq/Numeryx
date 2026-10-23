export interface XYObservation {
  x: number
  y: number
}

export interface MultipleObservation {
  predictors: readonly number[]
  y: number
}

export interface RegressionMetrics {
  observationCount: number
  sse: number
  sst: number
  rSquared: number | null
  rmse: number
}

export interface RegressionPoint {
  index: number
  x: number
  observed: number
  predicted: number
  residual: number
}

export interface MultipleRegressionPoint {
  index: number
  predictors: readonly number[]
  observed: number
  predicted: number
  residual: number
}

export interface NormalEquationSystem {
  matrix: readonly (readonly number[])[]
  vector: readonly number[]
}

export interface SimpleLinearRegressionResult {
  kind: 'simple'
  slope: number
  intercept: number
  meanX: number
  meanY: number
  sums: {
    sumX: number
    sumY: number
    sumXX: number
    sumXY: number
  }
  points: readonly RegressionPoint[]
  metrics: RegressionMetrics
}

export interface PolynomialRegressionResult {
  kind: 'polynomial'
  degree: number
  coefficients: readonly number[]
  normalEquations: NormalEquationSystem
  points: readonly RegressionPoint[]
  metrics: RegressionMetrics
  warnings: readonly string[]
}

export interface MultipleLinearRegressionResult {
  kind: 'multiple'
  coefficients: readonly number[]
  predictorCount: number
  points: readonly MultipleRegressionPoint[]
  metrics: RegressionMetrics
}

export type RegressionResult = SimpleLinearRegressionResult | PolynomialRegressionResult | MultipleLinearRegressionResult

export type RegressionProblemCode = 'insufficient-data' | 'invalid-number' | 'invalid-degree' | 'rank-deficient' | 'zero-variance'

export class RegressionProblemError extends Error {
  readonly code: RegressionProblemCode

  constructor(
    code: RegressionProblemCode,
    message: string,
  ) {
    super(message)
    this.name = 'RegressionProblemError'
    this.code = code
  }
}
