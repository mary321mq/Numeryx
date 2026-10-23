import katex from 'katex'
import 'katex/dist/katex.min.css'

export function MathExpression({ expression, display = false }: { expression: string; display?: boolean }) {
  const markup = katex.renderToString(expression, { displayMode: display, throwOnError: false, strict: 'ignore' })
  return <span className="text-cyan-100" dangerouslySetInnerHTML={{ __html: markup }} />
}
