import type { Borders, Cell, Workbook, Worksheet } from 'exceljs'

import type { MethodExportPayload } from '@/types/export'
import type { ResultColumn, ResultTable } from '@/types/numerical'

const EXCEL_INVALID_SHEET_CHARS = /[\\/?*[\]:]/g
const REPORT_COLUMNS = 8
const NAVY = 'FF102A43'
const TEAL = 'FF0F766E'
const MID_BLUE = 'FF155E75'
const GREEN = 'FF4D7C0F'
const LIGHT_TEAL = 'FFE6FFFB'
const LIGHT_BLUE = 'FFEFF6FF'
const LIGHT_GREEN = 'FFF0FDF4'
const LIGHT_ROW = 'FFF8FAFC'
const TEXT = 'FF1E293B'
const MUTED = 'FF475569'
const WHITE = 'FFFFFFFF'
const TABLE_BORDER: Partial<Borders> = {
  top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
}

interface TableRange {
  headerRow: number
  lastRow: number
  columnCount: number
}

export function sanitizeWorksheetName(value: string, fallback = 'Resultados') {
  const normalized = value.replace(EXCEL_INVALID_SHEET_CHARS, ' ').replace(/\s+/g, ' ').trim()
  return (normalized || fallback).slice(0, 31)
}

export async function createMethodWorkbook(payload: MethodExportPayload) {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Numeryx · Numerical Methods Lab'
  workbook.lastModifiedBy = 'Numeryx · Numerical Methods Lab'
  workbook.created = payload.generatedAt
  workbook.modified = payload.generatedAt

  const summary = createReportSheet(workbook, 'Resumen', payload.method.name, 'Informe de cálculo generado por Numeryx')
  writeSummary(summary, payload)

  if (payload.originalData) {
    const data = createReportSheet(workbook, 'Datos originales', payload.method.name, 'Valores introducidos para la ejecución actual')
    writeTable(data, 'Datos de entrada', payload.originalData, { freezeHeader: true, autoFilter: true })
    finalizeSheet(data)
  }

  if (payload.procedure?.length) {
    const procedure = createReportSheet(workbook, 'Procedimiento', payload.method.name, 'Pasos y sustituciones generados con los datos actuales')
    writeProcedure(procedure, payload.procedure)
    finalizeSheet(procedure)
  }

  const hasResultContent = Boolean(payload.table || payload.additionalTables?.length || payload.chartImage)
  const resultColumnCount = Math.max(
    REPORT_COLUMNS,
    payload.table?.columns.length ?? 0,
    ...(payload.additionalTables?.map(({ table }) => table.columns.length) ?? []),
  )
  const results = hasResultContent ? createReportSheet(workbook, 'Resultados', payload.method.name, 'Resultados, tablas de comprobación y visualización', resultColumnCount) : undefined
  if (results) {
    if (payload.table) writeTable(results, 'Resultados principales', payload.table, { freezeHeader: true, autoFilter: true, totalRow: payload.tableTotals })
    payload.additionalTables?.forEach(({ title, table, totalRow }) => writeTable(results, title, table, { totalRow }))
    if (payload.chartImage) writeChartImage(workbook, results, payload.chartImage)
    finalizeSheet(results)
  }

  finalizeSheet(summary)
  return workbook
}

export async function downloadMethodWorkbook(payload: MethodExportPayload) {
  const workbook = await createMethodWorkbook(payload)
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${payload.method.slug}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}

function createReportSheet(workbook: Workbook, name: string, methodName: string, subtitle: string, columnCount = REPORT_COLUMNS) {
  const worksheet = workbook.addWorksheet(sanitizeWorksheetName(name))
  worksheet.properties.defaultRowHeight = 19
  worksheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 }
  worksheet.mergeCells(`A1:${toExcelColumn(columnCount)}1`)
  const title = worksheet.getCell('A1')
  title.value = `NUMERYX · ${methodName}`
  title.font = { name: 'Aptos', bold: true, size: 16, color: { argb: WHITE } }
  title.fill = solidFill(NAVY)
  title.alignment = { vertical: 'middle' }
  worksheet.getRow(1).height = 30
  worksheet.mergeCells(`A2:${toExcelColumn(columnCount)}2`)
  const subheading = worksheet.getCell('A2')
  subheading.value = subtitle
  subheading.font = { name: 'Aptos', italic: true, size: 10, color: { argb: MUTED } }
  subheading.fill = solidFill(LIGHT_BLUE)
  subheading.alignment = { vertical: 'middle', wrapText: true }
  worksheet.getRow(2).height = 26
  worksheet.getColumn(1).width = 24
  worksheet.getColumn(2).width = 19
  return worksheet
}

function writeSummary(worksheet: Worksheet, payload: MethodExportPayload) {
  writeKeyValueSection(worksheet, 'Información del reporte', [
    ['Método', payload.method.name],
    ['Generado', payload.generatedAt],
  ])
  writeKeyValueSection(worksheet, 'Parámetros y modelo', Object.entries(payload.inputs))
  if (payload.highlights?.length) writeKeyValueSection(worksheet, 'Resultados principales', payload.highlights.map((item) => [item.label, item.value]), true)
  if (payload.diagnostics?.length) writeNotes(worksheet, 'Notas de cálculo', payload.diagnostics)
}

function writeKeyValueSection(worksheet: Worksheet, title: string, entries: readonly (readonly [string, string | number | boolean | Date | null])[], highlight = false) {
  if (entries.length === 0) return
  worksheet.addRow([])
  const heading = worksheet.addRow([title])
  mergeAcross(worksheet, heading.number, REPORT_COLUMNS)
  styleSectionHeader(worksheet.getCell(`A${heading.number}`))
  entries.forEach(([label, value]) => {
    const row = worksheet.addRow([label, normalizeCellValue(value)])
    mergeAcrossFrom(worksheet, row.number, 2, REPORT_COLUMNS)
    row.getCell(1).font = { name: 'Aptos', bold: true, color: { argb: TEXT } }
    row.getCell(1).fill = solidFill(highlight ? LIGHT_GREEN : LIGHT_TEAL)
    row.getCell(1).border = TABLE_BORDER
    const valueCell = row.getCell(2)
    valueCell.font = { name: 'Aptos', bold: highlight, color: { argb: highlight ? GREEN : TEXT } }
    valueCell.fill = solidFill(highlight ? 'FFFAFFF5' : WHITE)
    valueCell.alignment = { vertical: 'top', wrapText: true }
    valueCell.border = TABLE_BORDER
    if (value instanceof Date) valueCell.numFmt = 'dd/mm/yyyy hh:mm'
    if (typeof value === 'number') valueCell.numFmt = '#,##0.000000'
    row.height = isLongText(value) ? 34 : 21
  })
}

function writeNotes(worksheet: Worksheet, title: string, notes: readonly string[]) {
  worksheet.addRow([])
  const heading = worksheet.addRow([title])
  mergeAcross(worksheet, heading.number, REPORT_COLUMNS)
  styleSectionHeader(worksheet.getCell(`A${heading.number}`))
  notes.forEach((note) => {
    const row = worksheet.addRow([note])
    mergeAcross(worksheet, row.number, REPORT_COLUMNS)
    const cell = row.getCell(1)
    cell.font = { name: 'Aptos', size: 10, color: { argb: MUTED } }
    cell.fill = solidFill('FFFFFBEB')
    cell.alignment = { vertical: 'top', wrapText: true }
    cell.border = TABLE_BORDER
    row.height = 32
  })
}

function writeProcedure(worksheet: Worksheet, steps: readonly string[]) {
  worksheet.addRow([])
  const heading = worksheet.addRow(['Procedimiento de cálculo'])
  mergeAcross(worksheet, heading.number, REPORT_COLUMNS)
  styleSectionHeader(worksheet.getCell(`A${heading.number}`))
  const header = worksheet.addRow(['Paso', 'Detalle'])
  mergeAcrossFrom(worksheet, header.number, 2, REPORT_COLUMNS)
  styleTableHeader(header, 2)
  steps.forEach((step, index) => {
    const row = worksheet.addRow([index + 1, step])
    mergeAcrossFrom(worksheet, row.number, 2, REPORT_COLUMNS)
    styleTableRow(row, [{ id: 'step', label: 'Paso', numeric: true, precision: 0 }, { id: 'detail', label: 'Detalle' }], index)
    row.getCell(2).alignment = { vertical: 'top', wrapText: true }
    row.height = 38
  })
  worksheet.views = [{ state: 'frozen', ySplit: header.number }]
}

function writeTable(worksheet: Worksheet, title: string, table: ResultTable, options: { freezeHeader?: boolean; autoFilter?: boolean; totalRow?: ResultTable['rows'][number] } = {}): TableRange {
  worksheet.addRow([])
  const columnCount = Math.max(1, table.columns.length)
  const heading = worksheet.addRow([title])
  mergeAcross(worksheet, heading.number, columnCount)
  styleSectionHeader(worksheet.getCell(`A${heading.number}`))
  const header = worksheet.addRow(table.columns.map((column) => column.label))
  styleTableHeader(header, columnCount)
  table.rows.forEach((record, rowIndex) => {
    const row = worksheet.addRow(table.columns.map((column) => record[column.id] ?? null))
    styleTableRow(row, table.columns, rowIndex)
  })
  if (options.totalRow) {
    const totalRow = worksheet.addRow(table.columns.map((column) => options.totalRow?.[column.id] ?? null))
    styleTableTotalRow(totalRow, table.columns)
  }
  const range = { headerRow: header.number, lastRow: header.number + table.rows.length, columnCount }
  if (options.freezeHeader) worksheet.views = [{ state: 'frozen', ySplit: header.number }]
  if (options.autoFilter && !worksheet.autoFilter) worksheet.autoFilter = { from: { row: header.number, column: 1 }, to: { row: range.lastRow, column: columnCount } }
  return range
}

function writeChartImage(workbook: Workbook, worksheet: Worksheet, image: NonNullable<MethodExportPayload['chartImage']>) {
  worksheet.addRow([])
  const heading = worksheet.addRow([image.title ?? 'Gráfica de la ejecución actual'])
  mergeAcross(worksheet, heading.number, REPORT_COLUMNS)
  styleSectionHeader(worksheet.getCell(`A${heading.number}`))
  const note = worksheet.addRow(['La gráfica se inserta como imagen PNG de Plotly; no es una gráfica nativa editable de Excel.'])
  mergeAcross(worksheet, note.number, REPORT_COLUMNS)
  note.getCell(1).font = { name: 'Aptos', size: 10, color: { argb: MUTED } }
  note.getCell(1).alignment = { wrapText: true }
  const imageId = workbook.addImage({ base64: image.base64Png.replace(/^data:image\/png;base64,/, ''), extension: 'png' })
  worksheet.addImage(imageId, { tl: { col: 0, row: worksheet.rowCount }, ext: { width: 760, height: 420 } })
}

function styleSectionHeader(cell: Cell) {
  cell.font = { name: 'Aptos', bold: true, color: { argb: WHITE } }
  cell.fill = solidFill(TEAL)
  cell.alignment = { vertical: 'middle' }
  cell.border = TABLE_BORDER
}

function styleTableHeader(row: ReturnType<Worksheet['addRow']>, columnCount: number) {
  for (let index = 1; index <= columnCount; index += 1) {
    const cell = row.getCell(index)
    cell.font = { name: 'Aptos', bold: true, color: { argb: WHITE } }
    cell.fill = solidFill(MID_BLUE)
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = TABLE_BORDER
  }
  row.height = 29
}

function styleTableRow(row: ReturnType<Worksheet['addRow']>, columns: readonly ResultColumn[], rowIndex: number) {
  columns.forEach((column, index) => {
    const cell = row.getCell(index + 1)
    cell.font = { name: 'Aptos', color: { argb: TEXT } }
    cell.fill = solidFill(rowIndex % 2 === 1 ? LIGHT_ROW : WHITE)
    cell.alignment = { horizontal: column.numeric ? 'right' : 'left', vertical: 'top', wrapText: !column.numeric }
    cell.border = TABLE_BORDER
    if (column.numeric && typeof cell.value === 'number') cell.numFmt = numberFormat(column)
  })
}

function styleTableTotalRow(row: ReturnType<Worksheet['addRow']>, columns: readonly ResultColumn[]) {
  columns.forEach((column, index) => {
    const cell = row.getCell(index + 1)
    cell.font = { name: 'Aptos', bold: true, color: { argb: NAVY } }
    cell.fill = solidFill('FFCFFAFE')
    cell.alignment = { horizontal: column.numeric ? 'right' : 'left', vertical: 'middle', wrapText: !column.numeric }
    cell.border = TABLE_BORDER
    if (column.numeric && typeof cell.value === 'number') cell.numFmt = numberFormat(column)
  })
}

function finalizeSheet(worksheet: Worksheet) {
  const usedColumns = Math.max(worksheet.columnCount, 2)
  for (let index = 1; index <= usedColumns; index += 1) {
    const column = worksheet.getColumn(index)
    const longest = (column.values ?? []).reduce<number>((maximum, value) => Math.max(maximum, longestLine(value)), 10)
    column.width = Math.min(Math.max(longest + 2, index === 1 ? 15 : 12), index === 2 ? 52 : 26)
  }
  worksheet.views = worksheet.views.length > 0 ? worksheet.views : [{ showGridLines: false }]
}

function mergeAcross(worksheet: Worksheet, row: number, columnCount: number) {
  if (columnCount > 1) worksheet.mergeCells(`A${row}:${toExcelColumn(columnCount)}${row}`)
}

function mergeAcrossFrom(worksheet: Worksheet, row: number, startColumn: number, endColumn: number) {
  if (endColumn > startColumn) worksheet.mergeCells(`${toExcelColumn(startColumn)}${row}:${toExcelColumn(endColumn)}${row}`)
}

function solidFill(color: string) {
  return { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: color } }
}

function normalizeCellValue(value: string | number | boolean | Date | null) {
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  return value
}

function numberFormat(column: ResultColumn) {
  if (column.precision === 0) return '0'
  const precision = column.precision ?? 6
  return `#,##0.${'0'.repeat(precision)}`
}

function isLongText(value: string | number | boolean | Date | null) {
  return typeof value === 'string' && value.length > 85
}

function longestLine(value: unknown) {
  return String(value ?? '').split(/\r?\n/).reduce((maximum, line) => Math.max(maximum, line.length), 0)
}

function toExcelColumn(index: number) {
  let value = index
  let label = ''
  while (value > 0) {
    const remainder = (value - 1) % 26
    label = String.fromCharCode(65 + remainder) + label
    value = Math.floor((value - 1) / 26)
  }
  return label
}
