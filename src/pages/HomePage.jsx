import { useState } from 'react'
import { ArrowDown, ArrowRight, Link2, MessageSquareText, MousePointerClick, QrCode, ScanSearch, Sparkles, Upload, Waypoints } from 'lucide-react'
import InvestigationWorkspace from '../components/InvestigationWorkspace'
import { MESSAGE_DEMOS } from '../data/messageRules'

const features = [
  { icon: Link2, title: 'Check a Link', text: 'Inspect suspicious URL characteristics and understand the registered destination.', accent: 'bg-indigo-50 text-indigo-700' },
  { icon: QrCode, title: 'Scan a QR Code', text: 'Reveal and assess content hidden inside a QR image without opening it.', accent: 'bg-amber-50 text-amber-700' },
  { icon: MessageSquareText, title: 'Check a Message', text: 'Identify pressure, impersonation, payment, and credential-request signals.', accent: 'bg-rose-50 text-rose-700' }
]
const flow = [['Paste / Upload', Upload], ['Analyze', ScanSearch], ['Understand Signals', Waypoints], ['Decide Safely', MousePointerClick]]

export default function HomePage({ onSave }) {
  const [demoRequest, setDemoRequest] = useState(0)
  const goToWorkspace = () => document.getElementById('workspace')?.scrollIntoView({behavior:'smooth', block:'start'})
  return <main>
    <section className="relative overflow-hidden pb-20 pt-20 sm:pb-28 sm:pt-28">
      <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-200/50 blur-3xl"/><div className="absolute -left-48 top-44 h-96 w-96 rounded-full bg-amber-100/60 blur-3xl"/>
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8"><div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-4 py-2 text-xs font-bold text-indigo-800 shadow-sm"><Sparkles size={14}/>A private digital trust tool</span>
        <h1 className="mt-7 text-4xl font-black leading-[1.05] tracking-[-.045em] text-[#28233e] sm:text-6xl lg:text-7xl">Check Before You Click, <span className="text-indigo-700">Scan or Trust</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">Analyze suspicious links, QR codes and messages for common scam and phishing signals.</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={goToWorkspace} className="flex items-center justify-center gap-2 rounded-full bg-indigo-700 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-900/15 hover:bg-indigo-800">Start a Check<ArrowDown size={17}/></button><button onClick={() => {setDemoRequest(value => value + 1); goToWorkspace()}} className="flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-7 py-4 text-sm font-bold text-stone-800 hover:border-indigo-300">Try Demo<ArrowRight size={17}/></button></div>
        <p className="mt-5 text-xs text-stone-500">Nothing is opened automatically. Analysis stays in your browser.</p>
      </div>
      <div className="mt-16 grid gap-4 md:grid-cols-3">{features.map(({icon:Icon,title,text,accent}) => <article key={title} className="rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-7"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${accent}`}><Icon size={22}/></span><h2 className="mt-6 text-xl font-bold">{title}</h2><p className="mt-3 text-sm leading-6 text-stone-500">{text}</p></article>)}</div></div>
    </section>
    <section className="border-y border-stone-200 bg-white py-10"><div className="mx-auto grid max-w-6xl grid-cols-2 items-center gap-y-7 px-5 sm:grid-cols-7 lg:px-8">{flow.map(([label,Icon], index) => <div className="contents" key={label}><div className="text-center"><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-indigo-50 text-indigo-700"><Icon size={17}/></span><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-stone-600">{label}</p></div>{index < flow.length - 1 && <ArrowRight className="mx-auto hidden text-stone-300 sm:block" size={18}/>}</div>)}</div></section>
    <section className="py-20 sm:py-28"><div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8"><div className="mb-9 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-700">Investigation workspace</p><h2 className="mt-3 text-3xl font-black tracking-tight text-[#28233e] sm:text-4xl">One place to understand suspicious content.</h2><p className="mt-4 text-sm leading-7 text-stone-600">Choose an input type. LinkGuard separates evidence from conclusions and explains every point in the score.</p></div><InvestigationWorkspace onSave={onSave} messageDemos={MESSAGE_DEMOS} initialDemo={demoRequest}/></div></section>
  </main>
}
