export interface XYObservation {
  x: number
  y: number
}

export interface InterpolationVerification {
  index: number
  x: number
  expected: number
  calculated: number
  error: number
}

export interface LagrangeBasis {
  index: number
  nodeX: number
  nodeY: number
  numeratorFactors: readonly number[]
  denominatorFactors: readonly number[]
  numerator: number
  denominator: number
  valueAtTarget: number
  contribution: number
}

export interface LagrangeInterpolationResult {
  kind: 'lagrange'
  observations: readonly XYObservation[]
  targetX: number
  targetY: number
  degree: number
  bases: readonly LagrangeBasis[]
  verification: readonly InterpolationVerification[]
}

export interface NewtonDifferenceOperation {
  order: number
  index: number
  numerator: number
  denominator: number
  value: number
}

export interface NewtonTerm {
  order: number
  coefficient: number
  nodes: readonly number[]
}

export interface NewtonInterpolationResult {
  kind: 'newton'
  observations: readonly XYObservation[]
  targetX: number
  targetY: number
  degree: number
  dividedDifferences: readonly (readonly number[])[]
  differenceOperations: readonly NewtonDifferenceOperation[]
  terms: readonly NewtonTerm[]
  verification: readonly InterpolationVerification[]
}

export type InterpolationResult = LagrangeInterpolationResult | NewtonInterpolationResult

export type InterpolationProblemCode = 'insufficient-data' | 'invalid-number' | 'duplicate-x' | 'non-finite-result'

export class InterpolationProblemError extends Error {
  readonly code: InterpolationProblemCode

  constructor(code: InterpolationProblemCode, message: string) {
    super(message)
    this.name = 'InterpolationProblemError'
    this.code = code
  }
}
