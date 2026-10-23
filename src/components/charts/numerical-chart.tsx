import { Download } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

import { Button } from '@/components/ui/button'
import type { ChartSeries } from '@/types/numerical'

type ChartCapture = (() => Promise<string | undefined>) | null

interface NumericalChartProps {
  series: readonly ChartSeries[]
  title?: string
  xAxisTitle?: string
  yAxisTitle?: string
  downloadFileName?: string
  onCaptureReady?: (capture: ChartCapture) => void
}

export function NumericalChart({ series, title = 'Visualización', xAxisTitle, yAxisTitle, downloadFileName, onCaptureReady }: NumericalChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || series.length === 0) return
    let mounted = true
    void import('plotly.js-dist-min').then(({ default: Plotly }) => {
      if (!mounted) return
      void Plotly.newPlot(container, series.map((item) => ({ x: [...item.x], y: [...item.y], name: item.name, mode: item.mode ?? 'lines+markers', type: 'scatter', ...(item.line ? { line: item.line } : {}), ...(item.marker ? { marker: item.marker } : {}) })), { title: { text: title }, paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', font: { color: '#cbd5e1' }, margin: { l: 56, r: 20, b: 56, t: 44 }, xaxis: { title: { text: xAxisTitle }, gridcolor: 'rgba(148, 163, 184, 0.15)', zerolinecolor: 'rgba(148, 163, 184, 0.25)' }, yaxis: { title: { text: yAxisTitle }, gridcolor: 'rgba(148, 163, 184, 0.15)', zerolinecolor: 'rgba(148, 163, 184, 0.25)' }, legend: { orientation: 'h', y: -0.22 } }, { responsive: true, displayModeBar: true, displaylogo: false })
      onCaptureReady?.(async () => {
        if (!container) return undefined
        return Plotly.toImage(container, { format: 'png', width: 1200, height: 720 })
      })
    })
    return () => { mounted = false; onCaptureReady?.(null); if (container) void import('plotly.js-dist-min').then(({ default: Plotly }) => Plotly.purge(container)) }
  }, [onCaptureReady, series, title, xAxisTitle, yAxisTitle])

  const downloadChart = async () => {
    const container = containerRef.current
    if (!container) return
    try {
      const { default: Plotly } = await import('plotly.js-dist-min')
      const image = await Plotly.toImage(container, { format: 'png', width: 1200, height: 720 })
      const link = document.createElement('a')
      link.href = image
      link.download = `${downloadFileName ?? 'grafica-numeryx'}.png`
      link.click()
      setDownloadError(null)
    } catch {
      setDownloadError('No se pudo preparar la imagen PNG de esta gráfica.')
    }
  }

  return <div className="space-y-3"><div ref={containerRef} className="min-h-72 rounded-xl border border-white/10 bg-slate-950/50" aria-label={title} />{downloadFileName && <div className="flex flex-wrap items-center gap-3"><Button type="button" variant="secondary" size="sm" onClick={() => void downloadChart()}><Download size={15} aria-hidden="true" /> Descargar PNG</Button>{downloadError && <p role="alert" className="text-xs text-rose-200">{downloadError}</p>}</div>}</div>
}
