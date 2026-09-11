import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { History, Menu, ShieldCheck, X } from 'lucide-react'

export default function Layout({ children, onHistory }) {
  const [open, setOpen] = useState(false)
  const navClass = ({ isActive }) => `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'}`
  return <div className="min-h-screen bg-[#f7f6f2] text-[#27262b]">
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f7f6f2]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="LinkGuard home"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-700 text-white shadow-lg shadow-indigo-900/15"><ShieldCheck size={21}/></span><span><b className="block text-lg tracking-tight">LinkGuard</b><span className="block text-[9px] font-bold uppercase tracking-[.18em] text-stone-500">Scam signal analyzer</span></span></Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation"><NavLink to="/" className={navClass}>Check</NavLink><NavLink to="/learn" className={navClass}>Signal Library</NavLink><NavLink to="/privacy" className={navClass}>Privacy</NavLink><button onClick={onHistory} className="ml-2 flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-indigo-300 hover:text-indigo-700"><History size={15}/>History</button></nav>
        <button className="rounded-xl p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>{open ? <X/> : <Menu/>}</button>
      </div>
      {open && <nav className="border-t border-stone-200 bg-white p-4 md:hidden" aria-label="Mobile navigation"><div className="mx-auto flex max-w-7xl flex-col gap-2"><NavLink onClick={() => setOpen(false)} to="/" className={navClass}>Check</NavLink><NavLink onClick={() => setOpen(false)} to="/learn" className={navClass}>Signal Library</NavLink><NavLink onClick={() => setOpen(false)} to="/privacy" className={navClass}>Privacy</NavLink><button onClick={() => {onHistory(); setOpen(false)}} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-stone-600"><History size={15}/>History</button></div></nav>}
    </header>
    {children}
    <footer className="border-t border-stone-200 bg-white py-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 text-xs text-stone-500 sm:flex-row lg:px-8"><span className="font-semibold text-stone-700">LinkGuard · Digital trust starts with a pause.</span><span>Local, explainable analysis · No automatic navigation</span><Link className="font-semibold text-indigo-700" to="/privacy">Privacy architecture</Link></div></footer>
  </div>
}
