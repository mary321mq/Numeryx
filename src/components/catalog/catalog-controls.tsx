import { Search, SlidersHorizontal } from 'lucide-react'

import { CATEGORIES } from '@/config/categories'

interface CatalogControlsProps {
  query: string
  categoryId: string
  onQueryChange: (value: string) => void
  onCategoryChange: (value: string) => void
}

export function CatalogControls({ query, categoryId, onQueryChange, onCategoryChange }: CatalogControlsProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3 sm:grid-cols-[1fr_auto]">
      <label className="flex items-center gap-3 rounded-xl bg-black/20 px-4 py-3 text-slate-400 focus-within:ring-2 focus-within:ring-cyan-300/70">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Buscar método</span>
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar por nombre o tema…" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
      </label>
      <label className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-slate-300 focus-within:ring-2 focus-within:ring-cyan-300/70">
        <SlidersHorizontal size={17} aria-hidden="true" />
        <span className="sr-only">Filtrar por categoría</span>
        <select value={categoryId} onChange={(event) => onCategoryChange(event.target.value)} className="min-w-44 bg-transparent text-sm outline-none">
          <option className="bg-slate-900" value="all">Todas las categorías</option>
          {CATEGORIES.map((category) => <option className="bg-slate-900" key={category.id} value={category.id}>{category.shortName}</option>)}
        </select>
      </label>
    </div>
  )
}
