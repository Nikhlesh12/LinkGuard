import { Database, EyeOff, HardDrive, Image, Link2, MessageSquareText } from 'lucide-react'

const items = [
  [Image, 'QR images stay local', 'Uploaded images are decoded in browser memory. LinkGuard does not intentionally upload or store the image.'],
  [MessageSquareText, 'Messages stay local', 'Rule matching is performed in your browser. Full pasted message text is not stored in analysis history.'],
  [Link2, 'Links are never opened', 'LinkGuard parses URL text but does not navigate to, fetch, crawl, or execute the destination.'],
  [HardDrive, 'Minimal local history', 'Only type, time, score, label, and a short domain or description are saved in localStorage.'],
  [Database, 'No account or database', 'There is no authentication, profile, backend database, analytics service, or external AI API.'],
  [EyeOff, 'You control removal', 'Delete individual history items or use Clear All. Browser site-data controls can also remove local history.']
]

export default function PrivacyPage() {
  return <main><section className="border-b border-stone-200 bg-[#28233e] py-20 text-white"><div className="mx-auto max-w-7xl px-5 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">Privacy architecture</p><h1 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">Your investigation stays yours.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">LinkGuard was designed as a static client-side utility. It avoids sending suspicious content to an application server.</p></div></section><section className="py-20"><div className="mx-auto grid max-w-7xl gap-5 px-5 md:grid-cols-2 lg:grid-cols-3 lg:px-8">{items.map(([Icon,title,text]) => <article key={title} className="rounded-3xl border border-stone-200 bg-white p-6"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-700"><Icon size={20}/></span><h2 className="mt-5 text-lg font-bold">{title}</h2><p className="mt-3 text-sm leading-7 text-stone-600">{text}</p></article>)}</div><div className="mx-auto mt-10 max-w-4xl px-5"><div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-950"><b>Important limitation:</b> LinkGuard provides explainable risk indicators and educational guidance. It does not guarantee whether a link, QR code or message is safe or malicious.</div></div></section></main>
}
