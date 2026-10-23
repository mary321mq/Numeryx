export type InputKind = 'number' | 'text' | 'expression' | 'table' | 'select'

export interface MethodInputField {
  id: string
  label: string
  kind: InputKind
  required?: boolean
  description?: string
  placeholder?: string
  validation?: { min?: number; max?: number; pattern?: string }
}

export interface ValidationIssue {
  fieldId?: string
  message: string
}

export interface ResultColumn {
  id: string
  label: string
  numeric?: boolean
  precision?: number
}

export interface ResultTable {
  columns: readonly ResultColumn[]
  rows: readonly Record<string, string | number | null>[]
}

export interface ChartSeries {
  id: string
  name: string
  x: readonly number[]
  y: readonly number[]
  mode?: 'lines' | 'markers' | 'lines+markers'
}

export interface NumericalResult {
  summary: readonly { label: string; value: string | number }[]
  table?: ResultTable
  chartSeries?: readonly ChartSeries[]
  diagnostics?: readonly string[]
}

export interface MethodExecutionContext {
  values: Readonly<Record<string, unknown>>
}

export interface MethodIntegrationContract {
  inputSchema: readonly MethodInputField[]
  validate?: (context: MethodExecutionContext) => readonly ValidationIssue[]
  calculate?: (context: MethodExecutionContext) => NumericalResult
  resultColumns?: readonly ResultColumn[]
  chartSupport?: boolean
  exportSupport?: boolean
}
