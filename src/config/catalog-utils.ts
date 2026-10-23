import type { MethodDefinition, MethodStatus } from '@/types/catalog'

import { METHODS } from './methods'

export type MethodStatusFilter = MethodStatus | 'all'

export const METHOD_STATUS_LABELS: Record<MethodStatus, string> = {
  planned: 'Pendiente',
  scaffolded: 'Base preparada',
  implemented: 'Disponible',
}

export interface MethodFilters {
  query?: string
  categoryId?: string
  status?: MethodStatusFilter
}

export function filterMethods(methods: readonly MethodDefinition[], filters: MethodFilters) {
  const query = filters.query?.trim().toLocaleLowerCase('es-PE') ?? ''
  return methods.filter((method) => {
    const matchesQuery = !query || [method.name, method.description, ...method.tags].join(' ').toLocaleLowerCase('es-PE').includes(query)
    const matchesCategory = !filters.categoryId || filters.categoryId === 'all' || method.categoryId === filters.categoryId
    const matchesStatus = !filters.status || filters.status === 'all' || method.status === filters.status
    return matchesQuery && matchesCategory && matchesStatus
  })
}

export function getStatusCounts(methods: readonly MethodDefinition[] = METHODS) {
  return methods.reduce<Record<MethodStatus, number>>((counts, method) => {
    counts[method.status] += 1
    return counts
  }, { planned: 0, scaffolded: 0, implemented: 0 })
}

export function getCatalogStats() {
  const counts = getStatusCounts()
  return {
    total: METHODS.length,
    categories: new Set(METHODS.map((method) => method.categoryId)).size,
    ...counts,
  }
}

export function getCategoryAvailability(categoryId: string) {
  const methods = METHODS.filter((method) => method.categoryId === categoryId)
  const counts = getStatusCounts(methods)
  const primaryStatus: MethodStatus = counts.implemented > 0 ? 'implemented' : counts.scaffolded > 0 ? 'scaffolded' : 'planned'
  const summary = counts.implemented > 0
    ? `${counts.implemented} disponible${counts.implemented === 1 ? '' : 's'}`
    : counts.scaffolded > 0
      ? `${counts.scaffolded} base${counts.scaffolded === 1 ? '' : 's'} preparada${counts.scaffolded === 1 ? '' : 's'}`
      : 'En planificación'

  return { total: methods.length, primaryStatus, summary, ...counts }
}
