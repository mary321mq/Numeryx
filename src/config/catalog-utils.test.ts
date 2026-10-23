import { describe, expect, it } from 'vitest'

import { filterMethods, getCatalogStats, getCategoryAvailability } from './catalog-utils'
import { METHODS } from './methods'

describe('utilidades del catálogo', () => {
  it('filtra por texto y conserva coincidencias reales', () => {
    expect(filterMethods(METHODS, { query: 'Newton' }).map((method) => method.id)).toEqual(['newton-raphson', 'newton-divided-differences'])
  })

  it('distingue los métodos disponibles de los pendientes', () => {
    expect(filterMethods(METHODS, { status: 'scaffolded' })).toHaveLength(0)
    expect(filterMethods(METHODS, { status: 'implemented' })).toHaveLength(5)
  })

  it('calcula disponibilidad desde los metadatos del catálogo', () => {
    expect(getCatalogStats()).toMatchObject({ total: 24, categories: 6, planned: 19, scaffolded: 0, implemented: 5 })
    expect(getCategoryAvailability('regression')).toMatchObject({ total: 3, implemented: 3, primaryStatus: 'implemented' })
    expect(getCategoryAvailability('interpolation')).toMatchObject({ total: 2, implemented: 2, primaryStatus: 'implemented' })
  })
})
