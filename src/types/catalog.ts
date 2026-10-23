export const METHOD_STATUSES = ['planned', 'scaffolded', 'implemented'] as const

export type MethodStatus = (typeof METHOD_STATUSES)[number]

export interface CategoryDefinition {
  id: string
  slug: string
  name: string
  shortName: string
  description: string
  accent: string
  order: number
}

export interface MethodDefinition {
  id: string
  categoryId: string
  slug: string
  name: string
  description: string
  status: MethodStatus
  tags: readonly string[]
  priority?: 'next' | 'standard'
}
