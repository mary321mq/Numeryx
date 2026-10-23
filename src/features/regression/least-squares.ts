export class LeastSquaresError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LeastSquaresError'
  }
}

/**
 * Resuelve min ||Ax - b||₂ usando reflexiones de Householder.
 * No forma AᵀA ni calcula una inversa explícita; esto evita amplificar el
 * condicionamiento de los datos como ocurre con las ecuaciones normales.
 */
export function solveLeastSquaresByQr(matrix: readonly (readonly number[])[], target: readonly number[]) {
  const rowCount = matrix.length
  const columnCount = matrix[0]?.length ?? 0
  if (rowCount === 0 || columnCount === 0 || target.length !== rowCount || rowCount < columnCount) {
    throw new LeastSquaresError('La matriz de diseño no tiene dimensiones suficientes para el ajuste.')
  }
  const hasInvalidValue = matrix.some((row) => row.some((value) => !Number.isFinite(value))) || target.some((value) => !Number.isFinite(value))
  if (matrix.some((row) => row.length !== columnCount) || hasInvalidValue) {
    throw new LeastSquaresError('La matriz de diseño contiene valores no finitos.')
  }

  const upper = matrix.map((row) => [...row])
  const projectedTarget = [...target]
  const scale = Math.max(1, ...upper.flat().map((value) => Math.abs(value)))
  const tolerance = Number.EPSILON * Math.max(rowCount, columnCount) * scale * 128

  for (let column = 0; column < columnCount; column += 1) {
    const vector = Array.from({ length: rowCount - column }, (_, offset) => upper[column + offset][column])
    const norm = Math.hypot(...vector)
    if (norm <= tolerance) {
      throw new LeastSquaresError('Las columnas de entrada no tienen rango suficiente para obtener coeficientes únicos.')
    }

    const alpha = vector[0] >= 0 ? -norm : norm
    vector[0] -= alpha
    const vectorNorm = Math.hypot(...vector)
    if (vectorNorm <= tolerance) {
      throw new LeastSquaresError('No fue posible estabilizar la factorización QR.')
    }
    const reflector = vector.map((value) => value / vectorNorm)

    for (let targetColumn = column; targetColumn < columnCount; targetColumn += 1) {
      let dotProduct = 0
      for (let offset = 0; offset < reflector.length; offset += 1) dotProduct += reflector[offset] * upper[column + offset][targetColumn]
      for (let offset = 0; offset < reflector.length; offset += 1) upper[column + offset][targetColumn] -= 2 * reflector[offset] * dotProduct
    }

    let targetDotProduct = 0
    for (let offset = 0; offset < reflector.length; offset += 1) targetDotProduct += reflector[offset] * projectedTarget[column + offset]
    for (let offset = 0; offset < reflector.length; offset += 1) projectedTarget[column + offset] -= 2 * reflector[offset] * targetDotProduct
  }

  const coefficients = Array<number>(columnCount).fill(0)
  for (let row = columnCount - 1; row >= 0; row -= 1) {
    const diagonal = upper[row][row]
    if (Math.abs(diagonal) <= tolerance) {
      throw new LeastSquaresError('El sistema es singular o presenta multicolinealidad.')
    }
    let remainder = projectedTarget[row]
    for (let column = row + 1; column < columnCount; column += 1) remainder -= upper[row][column] * coefficients[column]
    coefficients[row] = remainder / diagonal
  }

  return coefficients
}
