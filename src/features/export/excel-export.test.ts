import { describe, expect, it } from 'vitest'

import { sanitizeWorksheetName } from './excel-export'

describe('sanitizeWorksheetName', () => {
  it('elimina caracteres inválidos y limita el nombre a 31 caracteres', () => {
    expect(sanitizeWorksheetName('Newton: x/y? [prueba]*')).toBe('Newton x y prueba')
    expect(sanitizeWorksheetName('a'.repeat(40))).toHaveLength(31)
  })
})
