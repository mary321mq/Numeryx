import type { MethodDefinition } from './catalog'
import type { ResultTable } from './numerical'

export interface ExportResultHighlight {
  label: string
  value: string | number
}

export interface ExportChartImage {
  base64Png: string
  title?: string
}

export interface ExportDataTable {
  title: string
  table: ResultTable
}

export interface MethodExportPayload {
  method: MethodDefinition
  generatedAt: Date
  inputs: Readonly<Record<string, string | number | boolean | null>>
  originalData?: ResultTable
  table?: ResultTable
  additionalTables?: readonly ExportDataTable[]
  highlights?: readonly ExportResultHighlight[]
  diagnostics?: readonly string[]
  procedure?: readonly string[]
  chartImage?: ExportChartImage
}
