import { Calculator, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

import { cn } from '@/lib/utils'

const navigation = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/teoria', label: 'Teoría' },
]

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-screen bg-[#07121f] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#07121f]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" onClick={closeMenu} className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-cyan-300">
            <span className="grid size-9 place-items-center rounded-xl bg-lime-300 text-slate-950 shadow-[0_0_24px_rgba(190,242,100,0.25)]"><Calculator size={19} strokeWidth={2.5} aria-hidden="true" /></span>
            <span className="leading-tight"><span className="block text-sm font-black tracking-tight text-white">NÚMERA</span><span className="block text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Laboratorio</span></span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
            {navigation.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-medium transition hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300', isActive ? 'bg-white/[0.08] text-white' : 'text-slate-400')}>{item.label}</NavLink>)}
          </nav>
          <Link to="/catalogo" className="hidden rounded-lg border border-lime-300/30 bg-lime-300/10 px-3 py-2 text-sm font-semibold text-lime-200 transition hover:bg-lime-300/20 focus-visible:outline-2 focus-visible:outline-cyan-300 sm:block">Explorar métodos</Link>
          <button type="button" onClick={() => setMenuOpen((current) => !current)} className="grid size-10 place-items-center rounded-lg text-slate-300 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-cyan-300 md:hidden" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && <nav className="border-t border-white/8 px-5 py-3 md:hidden" aria-label="Navegación móvil">{navigation.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={closeMenu} className={({ isActive }) => cn('block rounded-lg px-3 py-3 text-sm font-medium', isActive ? 'bg-white/[0.08] text-white' : 'text-slate-300')}>{item.label}</NavLink>)}</nav>}
      </header>
      <main><Outlet /></main>
      <footer className="border-t border-white/8 bg-[#06101c]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p> NúMERA · Laboratorio local de Métodos Numéricos</p>
          <p>Fase 1 · Arquitectura y catálogo</p>
        </div>
      </footer>
    </div>
  )
}
