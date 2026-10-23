import type { MethodIntegrationContract } from '@/types/numerical'

const DATA_TABLE_FIELDS = [
  { id: 'dataset', label: 'Datos de entrada', kind: 'table', required: true, description: 'Filas numéricas que serán validadas por el método.' },
] as const

export const methodIntegrations: Readonly<Record<string, MethodIntegrationContract>> = {
  'simple-linear-regression': {
    inputSchema: DATA_TABLE_FIELDS,
    chartSupport: true,
    exportSupport: true,
  },
  'polynomial-regression': {
    inputSchema: [...DATA_TABLE_FIELDS, { id: 'degree', label: 'Grado del polinomio', kind: 'number', required: true, validation: { min: 1 } }],
    chartSupport: true,
    exportSupport: true,
  },
  'multiple-linear-regression': {
    inputSchema: DATA_TABLE_FIELDS,
    chartSupport: true,
    exportSupport: true,
  },
  'lagrange-interpolation': {
    inputSchema: [...DATA_TABLE_FIELDS, { id: 'targetX', label: 'Valor a interpolar', kind: 'number', required: true }],
    chartSupport: true,
    exportSupport: true,
  },
  'newton-divided-differences': {
    inputSchema: [...DATA_TABLE_FIELDS, { id: 'targetX', label: 'Valor a interpolar', kind: 'number', required: true }],
    chartSupport: true,
    exportSupport: true,
  },
}

export function getMethodIntegration(methodId: string) {
  return methodIntegrations[methodId]
}
