import { describe, expect, it } from 'vitest'

import { CATEGORIES } from './categories'
import { METHODS, getMethodsByCategory } from './methods'

describe('catálogo inicial', () => {
  it('registra las seis categorías y los 24 métodos previstos', () => {
    expect(CATEGORIES).toHaveLength(6)
    expect(METHODS).toHaveLength(24)
  })

  it('prepara regresión e interpolación como las prioridades siguientes', () => {
    const prepared = METHODS.filter((method) => method.status === 'scaffolded')
    expect(prepared).toHaveLength(5)
    expect(getMethodsByCategory('regression')).toHaveLength(3)
    expect(getMethodsByCategory('interpolation')).toHaveLength(2)
  })
})
