import type { MethodInputField } from '@/types/numerical'

interface DynamicMethodFormProps {
  fields: readonly MethodInputField[]
  section: 'data' | 'parameters'
}

export function DynamicMethodForm({ fields, section }: DynamicMethodFormProps) {
  const displayFields = fields.filter((field) => section === 'data' ? field.kind === 'table' || field.kind === 'expression' : field.kind !== 'table' && field.kind !== 'expression')

  if (displayFields.length === 0) {
    return <p className="rounded-xl border border-dashed border-white/12 bg-black/15 px-4 py-4 text-sm leading-6 text-slate-500">No se requieren parámetros independientes para este método. Su futura interfaz se ajustará al contrato de cálculo.</p>
  }

  return <div className="space-y-4">{displayFields.map((field) => <MethodField key={field.id} field={field} />)}</div>
}

function MethodField({ field }: { field: MethodInputField }) {
  const fieldId = `method-field-${field.id}`
  if (field.kind === 'table') {
    return <div><label htmlFor={fieldId} className="text-sm font-semibold text-slate-100">{field.label}{field.required && <span className="ml-1 text-cyan-200" aria-label="requerido">*</span>}</label><p className="mt-1 text-xs leading-5 text-slate-500">{field.description}</p><div id={fieldId} aria-describedby={`${fieldId}-status`} className="mt-3 rounded-xl border border-dashed border-cyan-200/20 bg-cyan-300/[0.035] px-4 py-5"><p className="text-sm font-medium text-slate-300">Editor de datos reservado</p><p id={`${fieldId}-status`} className="mt-1 text-xs leading-5 text-slate-500">Las filas numéricas se habilitarán al conectar la validación específica de este método.</p></div></div>
  }

  const inputType = field.kind === 'number' ? 'number' : 'text'
  return <div><label htmlFor={fieldId} className="text-sm font-semibold text-slate-100">{field.label}{field.required && <span className="ml-1 text-cyan-200" aria-label="requerido">*</span>}</label>{field.description && <p className="mt-1 text-xs leading-5 text-slate-500">{field.description}</p>}<input id={fieldId} type={inputType} disabled placeholder={field.placeholder ?? 'Se habilitará con el algoritmo'} className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-slate-500 outline-none disabled:cursor-not-allowed" /></div>
}
