import { describe, expect, it } from 'vitest'
import type { Fill, Worksheet } from 'exceljs'

import { METHODS } from '@/config/methods'
import { calculateLagrangeInterpolation, calculateNewtonInterpolation } from '@/features/interpolation/interpolation'
import { fitMultipleLinearRegression, fitPolynomialRegression, fitSimpleLinearRegression } from '@/features/regression/regression'
import type { MethodDefinition } from '@/types/catalog'
import type { MethodExportPayload } from '@/types/export'
import type { ResultTable } from '@/types/numerical'

import { createMethodWorkbook, sanitizeWorksheetName } from './excel-export'

const GENERATED_AT = new Date('2026-10-23T12:00:00Z')
const PNG_1PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

describe('exportación Excel profesional', () => {
  it('elimina caracteres inválidos y limita los nombres de hoja', () => {
    expect(sanitizeWorksheetName('Newton: x/y? [prueba]*')).toBe('Newton x y prueba')
    expect(sanitizeWorksheetName('a'.repeat(40))).toHaveLength(31)
  })

  for (const fixture of createFixtures()) {
    it(`genera y reabre un libro profesional de ${fixture.method.name}`, async () => {
      const workbook = await createMethodWorkbook(fixture.payload)
      const buffer = await workbook.xlsx.writeBuffer()
      const { default: ExcelJS } = await import('exceljs')
      const reopened = new ExcelJS.Workbook()
      await reopened.xlsx.load(buffer)

      expect(reopened.worksheets.map((sheet) => sheet.name)).toEqual(['Resumen', 'Datos originales', 'Procedimiento', 'Resultados'])
      const summary = reopened.getWorksheet('Resumen')
      const data = reopened.getWorksheet('Datos originales')
      const procedure = reopened.getWorksheet('Procedimiento')
      const results = reopened.getWorksheet('Resultados')
      expect(summary?.getCell('A1').value).toContain('NUMERYX')
      expect(patternFillColor(summary?.getCell('A1').fill)).toBe('FF102A43')
      expect(valueNextToLabel(summary, 'Método')).toBe(fixture.method.name)
      expect(valueNextToLabel(summary, fixture.resultLabel)).toBeCloseTo(fixture.resultValue, 10)
      expect(data?.getCell('A5').value).toBe('#')
      expect(data?.getCell('B6').value).toBe(fixture.firstInputX)
      expect(patternFillColor(data?.getCell('A5').fill)).toBe('FF155E75')
      expect(data?.getCell('A6').border.top?.style).toBe('thin')
      expect(procedure?.getCell('A4').value).toBe('Procedimiento de cálculo')
      expect(procedure?.getCell('A5').value).toBe('Paso')
      expect(results?.getCell('A4').value).toBe('Resultados principales')
      expect(patternFillColor(results?.getCell('A5').fill)).toBe('FF155E75')
      expect(results?.getCell('A6').value).not.toBeNull()
      expect(results?.getImages()).toHaveLength(fixture.includesChart ? 1 : 0)
    }, 20_000)
  }

  it('conserva vacía una diferencia dividida que no corresponde', async () => {
    const fixture = createFixtures().find((item) => item.method.id === 'newton-divided-differences')
    if (!fixture) throw new Error('No se encontró la prueba de Newton')
    const workbook = await createMethodWorkbook(fixture.payload)
    const buffer = await workbook.xlsx.writeBuffer()
    const { default: ExcelJS } = await import('exceljs')
    const reopened = new ExcelJS.Workbook()
    await reopened.xlsx.load(buffer)
    const results = reopened.getWorksheet('Resultados')
    expect(results?.getCell('E7').value).toBeNull()
  })
})

function createFixtures() {
  const simple = fitSimpleLinearRegression([{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }])
  const polynomial = fitPolynomialRegression([{ x: -1, y: 4 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 1 }], 2)
  const multiple = fitMultipleLinearRegression([{ predictors: [0, 0], y: 4 }, { predictors: [1, 0], y: 6 }, { predictors: [0, 1], y: 3 }, { predictors: [2, 1], y: 7 }, { predictors: [1, 3], y: 3 }, { predictors: [3, 2], y: 8 }])
  const lagrange = calculateLagrangeInterpolation([{ x: 0, y: 1 }, { x: 2, y: 5 }], 1.5)
  const newton = calculateNewtonInterpolation([{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 5 }], 3)

  return [
    { method: method('simple-linear-regression'), payload: regressionPayload(method('simple-linear-regression'), simple, ['x']), resultLabel: 'SSE', resultValue: simple.metrics.sse, firstInputX: 0, includesChart: true },
    { method: method('polynomial-regression'), payload: regressionPayload(method('polynomial-regression'), polynomial, ['x']), resultLabel: 'SSE', resultValue: polynomial.metrics.sse, firstInputX: -1, includesChart: false },
    { method: method('multiple-linear-regression'), payload: regressionPayload(method('multiple-linear-regression'), multiple, ['x1', 'x2']), resultLabel: 'SSE', resultValue: multiple.metrics.sse, firstInputX: 0, includesChart: false },
    { method: method('lagrange-interpolation'), payload: lagrangePayload(method('lagrange-interpolation'), lagrange), resultLabel: 'P₁(1.5)', resultValue: lagrange.targetY, firstInputX: 0, includesChart: false },
    { method: method('newton-divided-differences'), payload: newtonPayload(method('newton-divided-differences'), newton), resultLabel: 'P₂(3)', resultValue: newton.targetY, firstInputX: 0, includesChart: false },
  ]
}

function regressionPayload(methodDefinition: MethodDefinition, result: ReturnType<typeof fitSimpleLinearRegression> | ReturnType<typeof fitPolynomialRegression> | ReturnType<typeof fitMultipleLinearRegression>, variableNames: readonly string[]): MethodExportPayload {
  const isMultiple = result.kind === 'multiple'
  const originalData: ResultTable = isMultiple
    ? { columns: [{ id: 'index', label: '#', numeric: true, precision: 0 }, ...variableNames.map((name, index) => ({ id: `x${index}`, label: name, numeric: true })), { id: 'y', label: 'y', numeric: true }], rows: result.points.map((point) => ({ index: point.index, ...Object.fromEntries(point.predictors.map((value, index) => [`x${index}`, value])), y: point.observed })) }
    : { columns: [{ id: 'index', label: '#', numeric: true, precision: 0 }, { id: 'x', label: 'x', numeric: true }, { id: 'y', label: 'y', numeric: true }], rows: result.points.map((point) => ({ index: point.index, x: point.x, y: point.observed })) }
  const results: ResultTable = isMultiple
    ? { columns: [{ id: 'index', label: '#', numeric: true, precision: 0 }, { id: 'observed', label: 'y', numeric: true }, { id: 'predicted', label: 'ŷ', numeric: true }, { id: 'residual', label: 'e', numeric: true }], rows: result.points.map((point) => ({ index: point.index, observed: point.observed, predicted: point.predicted, residual: point.residual })) }
    : { columns: [{ id: 'index', label: '#', numeric: true, precision: 0 }, { id: 'x', label: 'x', numeric: true }, { id: 'observed', label: 'y', numeric: true }, { id: 'predicted', label: 'ŷ', numeric: true }, { id: 'residual', label: 'e', numeric: true }], rows: result.points.map((point) => ({ index: point.index, x: point.x, observed: point.observed, predicted: point.predicted, residual: point.residual })) }
  return {
    method: methodDefinition,
    generatedAt: GENERATED_AT,
    inputs: { Observaciones: result.metrics.observationCount, Modelo: 'Ajuste calculado con QR' },
    highlights: [{ label: 'SSE', value: result.metrics.sse }, { label: 'SST', value: result.metrics.sst }, { label: 'R²', value: result.metrics.rSquared ?? 'Indefinido' }, { label: 'RMSE', value: result.metrics.rmse }],
    originalData,
    table: results,
    procedure: ['Se validaron los datos de entrada.', 'Se obtuvieron estimaciones y residuos para cada observación.'],
    ...(methodDefinition.id === 'simple-linear-regression' ? { chartImage: { base64Png: PNG_1PX, title: 'Gráfica verificada de la ejecución' } } : {}),
  }
}

function lagrangePayload(methodDefinition: MethodDefinition, result: ReturnType<typeof calculateLagrangeInterpolation>): MethodExportPayload {
  return {
    method: methodDefinition,
    generatedAt: GENERATED_AT,
    inputs: { 'Valor objetivo x': result.targetX, 'Grado de Pₙ': result.degree },
    highlights: [{ label: 'Polinomio', value: 'P₁(x) = y₀L₀(x) + y₁L₁(x)' }, { label: 'P₁(1.5)', value: result.targetY }],
    originalData: pointTable(result.observations),
    table: { columns: [{ id: 'index', label: 'i', numeric: true, precision: 0 }, { id: 'basis', label: 'Lᵢ(x)', numeric: true }, { id: 'contribution', label: 'yᵢLᵢ', numeric: true }], rows: result.bases.map((basis) => ({ index: basis.index, basis: basis.valueAtTarget, contribution: basis.contribution })) },
    additionalTables: [{ title: 'Verificación de nodos', table: verificationTable(result.verification) }],
    procedure: ['Se calcularon las bases Lᵢ(x) con los nodos originales.', 'Se sumaron las contribuciones yᵢLᵢ(x).'],
  }
}

function newtonPayload(methodDefinition: MethodDefinition, result: ReturnType<typeof calculateNewtonInterpolation>): MethodExportPayload {
  const differenceColumns = [{ id: 'index', label: 'i', numeric: true, precision: 0 }, { id: 'x', label: 'xᵢ', numeric: true }, ...result.dividedDifferences.map((_column, order) => ({ id: `order-${order}`, label: order === 0 ? 'f[xᵢ]' : `Orden ${order}`, numeric: true }))]
  return {
    method: methodDefinition,
    generatedAt: GENERATED_AT,
    inputs: { 'Valor objetivo x': result.targetX, 'Grado de Pₙ': result.degree },
    highlights: [{ label: 'Polinomio', value: 'P₂(x) = 1 + (x − 0) + (x − 0)(x − 1)' }, { label: 'P₂(3)', value: result.targetY }],
    originalData: pointTable(result.observations),
    table: { columns: differenceColumns, rows: result.observations.map((point, index) => Object.fromEntries([['index', index], ['x', point.x], ...result.dividedDifferences.map((column, order) => [`order-${order}`, index < column.length ? column[index] : null])])) },
    additionalTables: [{ title: 'Verificación de nodos', table: verificationTable(result.verification) }],
    procedure: ['Se construyó la tabla triangular de diferencias divididas.', 'Los coeficientes se tomaron de la primera entrada de cada orden.'],
  }
}

function pointTable(points: readonly { x: number; y: number }[]): ResultTable {
  return { columns: [{ id: 'index', label: '#', numeric: true, precision: 0 }, { id: 'x', label: 'x', numeric: true }, { id: 'y', label: 'y', numeric: true }], rows: points.map((point, index) => ({ index, x: point.x, y: point.y })) }
}

function verificationTable(verification: readonly { index: number; x: number; expected: number; calculated: number; error: number }[]): ResultTable {
  return { columns: [{ id: 'index', label: 'i', numeric: true, precision: 0 }, { id: 'x', label: 'xᵢ', numeric: true }, { id: 'expected', label: 'yᵢ', numeric: true }, { id: 'calculated', label: 'Pₙ(xᵢ)', numeric: true }, { id: 'error', label: 'Error', numeric: true }], rows: verification.map((entry) => ({ ...entry })) }
}

function method(id: string) {
  const item = METHODS.find((candidate) => candidate.id === id)
  if (!item) throw new Error(`Método de prueba no encontrado: ${id}`)
  return item
}

function valueNextToLabel(worksheet: Worksheet | undefined, label: string) {
  if (!worksheet) throw new Error('Hoja de resumen no encontrada')
  for (let row = 1; row <= worksheet.rowCount; row += 1) {
    if (worksheet.getCell(row, 1).value === label) return worksheet.getCell(row, 2).value
  }
  throw new Error(`No se encontró la etiqueta ${label}`)
}

function patternFillColor(fill: Fill | undefined) {
  return fill?.type === 'pattern' ? fill.fgColor?.argb : undefined
}
