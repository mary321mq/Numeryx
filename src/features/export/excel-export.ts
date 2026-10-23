import type { Cell } from 'exceljs'

import type { MethodExportPayload } from '@/types/export'

const EXCEL_INVALID_SHEET_CHARS = /[\\/?*\[\]:]/g

export function sanitizeWorksheetName(value: string, fallback = 'Resultados') {
  const normalized = value.replace(EXCEL_INVALID_SHEET_CHARS, ' ').replace(/\s+/g, ' ').trim()
  return (normalized || fallback).slice(0, 31)
}

export async function createMethodWorkbook(payload: MethodExportPayload) {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'NúMERA Laboratorio'
  workbook.created = payload.generatedAt
  workbook.modified = payload.generatedAt

  const worksheet = workbook.addWorksheet(sanitizeWorksheetName(payload.method.name))
  worksheet.views = [{ state: 'frozen', ySplit: 4 }]
  worksheet.mergeCells('A1:F1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = `NúMERA · ${payload.method.name}`
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } }
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } }
  titleCell.alignment = { vertical: 'middle' }
  worksheet.getRow(1).height = 28

  worksheet.getCell('A3').value = 'Generado'
  worksheet.getCell('B3').value = payload.generatedAt.toLocaleString('es-PE')
  worksheet.getCell('A3').font = { bold: true, color: { argb: 'FF0F766E' } }

  worksheet.addRow([])
  const inputHeader = worksheet.addRow(['Datos introducidos'])
  worksheet.mergeCells(`A${inputHeader.number}:F${inputHeader.number}`)
  styleSectionHeader(worksheet.getCell(`A${inputHeader.number}`))
  Object.entries(payload.inputs).forEach(([label, value]) => {
    const row = worksheet.addRow([label, value])
    row.getCell(1).font = { bold: true, color: { argb: 'FF334155' } }
    if (typeof value === 'number') row.getCell(2).numFmt = '0.000000'
  })

  if (payload.highlights?.length) {
    worksheet.addRow([])
    const highlightHeader = worksheet.addRow(['Resultados principales'])
    worksheet.mergeCells(`A${highlightHeader.number}:F${highlightHeader.number}`)
    styleSectionHeader(worksheet.getCell(`A${highlightHeader.number}`))
    payload.highlights.forEach((highlight) => {
      const row = worksheet.addRow([highlight.label, highlight.value])
      row.getCell(1).font = { bold: true }
      row.getCell(2).font = { bold: true, color: { argb: 'FF0F766E' } }
      if (typeof highlight.value === 'number') row.getCell(2).numFmt = '0.000000'
    })
  }

  if (payload.table) {
    worksheet.addRow([])
    const tableTitle = worksheet.addRow(['Tabla de resultados'])
    worksheet.mergeCells(`A${tableTitle.number}:F${tableTitle.number}`)
    styleSectionHeader(worksheet.getCell(`A${tableTitle.number}`))
    const header = worksheet.addRow(payload.table.columns.map((column) => column.label))
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF155E75' } }
      cell.alignment = { horizontal: 'center' }
    })
    payload.table.rows.forEach((record, index) => {
      const row = worksheet.addRow(payload.table!.columns.map((column) => record[column.id] ?? ''))
      if (index % 2 === 1) row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDFA' } } })
      payload.table!.columns.forEach((column, columnIndex) => {
        if (column.numeric) row.getCell(columnIndex + 1).numFmt = column.precision ? `0.${'0'.repeat(column.precision)}` : '0.000000'
      })
    })
  }

  if (payload.diagnostics?.length) {
    worksheet.addRow([])
    const noteHeader = worksheet.addRow(['Notas de cálculo'])
    worksheet.mergeCells(`A${noteHeader.number}:F${noteHeader.number}`)
    styleSectionHeader(worksheet.getCell(`A${noteHeader.number}`))
    payload.diagnostics.forEach((note) => worksheet.addRow([note]))
  }

  if (payload.chartImage) {
    const imageId = workbook.addImage({ base64: payload.chartImage.base64Png.replace(/^data:image\/png;base64,/, ''), extension: 'png' })
    worksheet.addImage(imageId, { tl: { col: 0, row: worksheet.rowCount + 2 }, ext: { width: 620, height: 340 } })
  }

  worksheet.columns.forEach((column) => { column.width = Math.min(Math.max((column.values ?? []).reduce<number>((max, value) => Math.max(max, String(value ?? '').length), 10) + 2, 12), 42) })
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

function styleSectionHeader(cell: Cell) {
  cell.font = { bold: true, color: { argb: 'FF134E4A' } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFBF1' } }
}
