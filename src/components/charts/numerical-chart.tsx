import { useEffect, useRef } from 'react'

import type { ChartSeries } from '@/types/numerical'

export function NumericalChart({ series, title = 'Visualización' }: { series: readonly ChartSeries[]; title?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || series.length === 0) return
    let mounted = true
    void import('plotly.js-dist-min').then(({ default: Plotly }) => {
      if (!mounted) return
      void Plotly.newPlot(container, series.map((item) => ({ x: [...item.x], y: [...item.y], name: item.name, mode: item.mode ?? 'lines+markers', type: 'scatter' })), { title: { text: title }, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { color: '#cbd5e1' }, margin: { l: 48, r: 20, b: 44, t: 44 } }, { responsive: true, displayModeBar: false })
    })
    return () => { mounted = false; if (container) void import('plotly.js-dist-min').then(({ default: Plotly }) => Plotly.purge(container)) }
  }, [series, title])

  return <div ref={containerRef} className="min-h-72 rounded-xl border border-white/10 bg-slate-950/50" aria-label={title} />
}
