import type { CategoryDefinition } from '@/types/catalog'

export const CATEGORIES = [
  { id: 'nonlinear-roots', slug: 'raices-ecuaciones-no-lineales', name: 'Raíces de ecuaciones no lineales', shortName: 'Raíces', description: 'Localiza aproximaciones de soluciones para ecuaciones no lineales.', accent: 'lime', order: 1 },
  { id: 'linear-systems', slug: 'sistemas-ecuaciones-lineales', name: 'Sistemas de ecuaciones lineales', shortName: 'Sistemas', description: 'Resuelve y analiza sistemas lineales mediante técnicas directas e iterativas.', accent: 'cyan', order: 2 },
  { id: 'regression', slug: 'regresion-ajuste-curvas', name: 'Regresión y ajuste de curvas', shortName: 'Regresión', description: 'Modela relaciones entre datos y evalúa la calidad del ajuste.', accent: 'violet', order: 3 },
  { id: 'integration', slug: 'integracion-numerica', name: 'Integración numérica', shortName: 'Integración', description: 'Estima integrales definidas a partir de reglas de cuadratura.', accent: 'amber', order: 4 },
  { id: 'differential-equations', slug: 'ecuaciones-diferenciales', name: 'Ecuaciones diferenciales', shortName: 'EDO', description: 'Aproxima soluciones de problemas de valor inicial.', accent: 'rose', order: 5 },
  { id: 'interpolation', slug: 'interpolacion-numerica', name: 'Interpolación numérica', shortName: 'Interpolación', description: 'Construye funciones aproximadas a partir de datos discretos.', accent: 'sky', order: 6 },
] as const satisfies readonly CategoryDefinition[]

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((category) => category.slug === slug)
}

export function getCategoryById(id: string) {
  return CATEGORIES.find((category) => category.id === id)
}
