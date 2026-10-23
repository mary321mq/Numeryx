import { describe, expect, it } from 'vitest'

import { METHODS } from '@/config/methods'

import { createMethodWorkbook, sanitizeWorksheetName } from './excel-export'

describe('sanitizeWorksheetName', () => {
  it('elimina caracteres inválidos y limita el nombre a 31 caracteres', () => {
    expect(sanitizeWorksheetName('Newton: x/y? [prueba]*')).toBe('Newton x y prueba')
    expect(sanitizeWorksheetName('a'.repeat(40))).toHaveLength(31)
  })

  it('genera un libro xlsx que puede volver a abrirse', async () => {
    const method = METHODS.find((item) => item.id === 'simple-linear-regression')
    if (!method) throw new Error('Método de prueba no encontrado')

    const workbook = await createMethodWorkbook({
      method,
      generatedAt: new Date('2026-10-23T12:00:00Z'),
      inputs: { Observaciones: 3, Modelo: 'ŷ = 1 + 2·x' },
      highlights: [{ label: 'R²', value: 1 }],
      procedure: ['Datos de prueba verificados.', 'Coeficientes obtenidos por QR.'],
      table: {
        columns: [{ id: 'x', label: 'x', numeric: true }, { id: 'y', label: 'y', numeric: true }],
        rows: [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }],
      },
      additionalTables: [{
        title: 'Diferencias divididas',
        table: {
          columns: [{ id: 'order0', label: 'f[xᵢ]', numeric: true }, { id: 'order1', label: 'Orden 1', numeric: true }],
          rows: [{ order0: 1, order1: 2 }, { order0: 3, order1: null }],
        },
      }],
    })
    const buffer = await workbook.xlsx.writeBuffer()
    const { default: ExcelJS } = await import('exceljs')
    const reopened = new ExcelJS.Workbook()
    await reopened.xlsx.load(buffer)

    expect(reopened.worksheets).toHaveLength(1)
    expect(reopened.worksheets[0].getCell('A1').value).toContain('NUMERYX')
    expect(reopened.worksheets[0].getColumn(1).values).toContain('Diferencias divididas')
  })
})
