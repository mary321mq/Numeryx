import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function NotFoundPage() { return <section className="mx-auto grid min-h-[65vh] max-w-7xl place-items-center px-5 text-center"><div><p className="text-sm font-bold tracking-[0.14em] text-cyan-200 uppercase">404 · Ruta no encontrada</p><h1 className="mt-4 text-4xl font-black tracking-tight text-white">Esta ficha no está en el catálogo.</h1><p className="mt-4 text-slate-400">Puede que el enlace haya cambiado o que el método aún no esté registrado.</p><Button asChild className="mt-8"><Link to="/catalogo">Volver al catálogo</Link></Button></div></section> }
