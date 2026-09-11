import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle, ArrowRight, Braces, Check, ChevronDown, ChevronUp, CircleAlert,
  Clock3, Eye, FileSearch, Fingerprint, Gauge, Globe2, History, Info, KeyRound,
  Link2, LockKeyhole, Menu, Network, Search, Shield, ShieldCheck, ShieldQuestion,
  Sparkles, Trash2, X, Zap
} from 'lucide-react'
import { analyzeUrl, examples } from './analyzer'

const HISTORY_KEY = 'linkguard-history-v1'

function cx(...classes) { return classes.filter(Boolean).join(' ') }

const tone = {
  low: { text: 'text-emerald-300', bg: 'bg-emerald-400', soft: 'bg-emerald-400/10 border-emerald-400/20' },
  some: { text: 'text-amber-300', bg: 'bg-amber-400', soft: 'bg-amber-400/10 border-amber-400/20' },
  suspicious: { text: 'text-orange-300', bg: 'bg-orange-400', soft: 'bg-orange-400/10 border-orange-400/20' },
  high: { text: 'text-red-300', bg: 'bg-red-400', soft: 'bg-red-400/10 border-red-400/20' }
}

function levelTone(score) { return score <= 24 ? tone.low : score <= 49 ? tone.some : score <= 74 ? tone.suspicious : tone.high }

function Header({ onHistory }) {
  const [open, setOpen] = useState(false)
  return <header className="relative z-30 border-b border-white/[.07] bg-ink/80 backdrop-blur-xl">
    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
      <a href="#top" className="flex items-center gap-3" aria-label="LinkGuard home">
        <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300">
          <ShieldCheck size={23}/><span className="absolute inset-0 rounded-xl shadow-[0_0_22px_rgba(34,211,238,.12)]" />
        </span>
        <span><span className="block text-lg font-bold tracking-tight text-white">Link<span className="text-cyan-300">Guard</span></span><span className="block text-[10px] font-semibold uppercase tracking-[.22em] text-slate-500">URL Risk Analyzer</span></span>
      </a>
      <nav className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
        <a className="transition hover:text-white" href="#how-it-works">How it works</a>
        <a className="transition hover:text-white" href="#examples">Examples</a>
        <a className="transition hover:text-white" href="#safety">Safety tips</a>
        <button onClick={onHistory} className="flex items-center gap-2 rounded-lg border border-line bg-white/[.03] px-4 py-2.5 text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"><History size={16}/> History</button>
      </nav>
      <button className="text-slate-300 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button>
    </div>
    {open && <nav className="absolute inset-x-0 top-20 flex flex-col gap-1 border-b border-line bg-panel p-4 text-sm md:hidden">
      {['how-it-works','examples','safety'].map((id, i) => <a key={id} onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-slate-300 hover:bg-white/5" href={`#${id}`}>{['How it works','Examples','Safety tips'][i]}</a>)}
      <button onClick={() => { onHistory(); setOpen(false) }} className="flex items-center gap-2 rounded-lg px-4 py-3 text-left text-slate-300 hover:bg-white/5"><History size={16}/>History</button>
    </nav>}
  </header>
}

function GaugeChart({ score }) {
  const color = score <= 24 ? '#34d399' : score <= 49 ? '#fbbf24' : score <= 74 ? '#fb923c' : '#f87171'
  const radius = 74, circumference = Math.PI * radius
  return <div className="relative mx-auto h-[118px] w-[180px] overflow-hidden" aria-label={`Risk score ${score} out of 100`}>
    <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-0">
      <path d="M 16 90 A 74 74 0 0 1 164 90" fill="none" stroke="#1e334b" strokeWidth="13" strokeLinecap="round" />
      <path className="ring-progress" d="M 16 90 A 74 74 0 0 1 164 90" fill="none" stroke={color} strokeWidth="13" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} style={{filter:`drop-shadow(0 0 7px ${color}70)`}} />
    </svg>
    <div className="absolute inset-x-0 top-12 text-center"><span className="text-5xl font-extrabold tracking-tighter text-white">{score}</span><span className="ml-1 text-sm text-slate-500">/100</span><p className="mt-1 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Risk score</p></div>
  </div>
}

function Stat({ icon: Icon, label, value, className }) {
  return <div className="min-w-0 rounded-xl border border-line bg-ink/45 p-4">
    <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500"><Icon size={14} className="text-cyan-400"/>{label}</div>
    <div className={cx('truncate text-sm font-semibold text-slate-100', className)} title={value}>{value}</div>
  </div>
}

function SeverityBadge({ severity }) {
  const classes = severity === 'High' ? 'border-red-400/20 bg-red-400/10 text-red-300' : severity === 'Medium' ? 'border-amber-400/20 bg-amber-400/10 text-amber-300' : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300'
  return <span className={cx('rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', classes)}>{severity}</span>
}

function Finding({ item, index }) {
  const [open, setOpen] = useState(index < 2)
  return <article className="overflow-hidden rounded-xl border border-line bg-panel/70 transition hover:border-slate-600">
    <button className="flex w-full items-center gap-3 p-4 text-left sm:p-5" onClick={() => setOpen(!open)} aria-expanded={open}>
      <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg', item.severity === 'High' ? 'bg-red-400/10 text-red-300' : item.severity === 'Medium' ? 'bg-amber-400/10 text-amber-300' : 'bg-cyan-400/10 text-cyan-300')}><AlertTriangle size={18}/></span>
      <span className="min-w-0 flex-1 font-semibold text-white">{item.title}</span><SeverityBadge severity={item.severity}/>{open ? <ChevronUp size={17} className="text-slate-500"/> : <ChevronDown size={17} className="text-slate-500"/>}
    </button>
    {open && <div className="grid gap-5 border-t border-line px-5 py-5 text-sm sm:grid-cols-3">
      <div><p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">What was detected</p><p className="leading-6 text-slate-300">{item.detected}</p></div>
      <div><p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">Why it can matter</p><p className="leading-6 text-slate-300">{item.why}</p></div>
      <div><p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-cyan-500">Safety recommendation</p><p className="leading-6 text-slate-300">{item.recommendation}</p></div>
    </div>}
  </article>
}

function Breakdown({ data }) {
  const fields = [
    ['Protocol', data.protocol, LockKeyhole], ['Hostname', data.hostname, Globe2], ['Subdomain', data.subdomain, Network],
    ['Domain', data.domain, Shield], ['Port', data.port, Zap], ['Path', data.path, Link2], ['Fragment', data.fragment, Braces]
  ]
  return <div className="glass rounded-2xl border border-line p-5 shadow-glow sm:p-7">
    <div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300"><FileSearch size={20}/></span><div><h3 className="font-bold text-white">URL Breakdown</h3><p className="text-xs text-slate-500">The anatomy of this link, separated for inspection</p></div></div>
    <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
      {fields.map(([label, value, Icon]) => <div key={label} className="min-w-0 bg-ink/70 p-4"><div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500"><Icon size={13}/>{label}</div><div className="break-all font-mono text-xs leading-5 text-slate-200">{value}</div></div>)}
      <div className="min-w-0 bg-ink/70 p-4 sm:col-span-2"><div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Query parameters · {data.queryParameters.length}</div>{data.queryParameters.length ? <div className="flex flex-wrap gap-2">{data.queryParameters.map(({key,value}, i) => <span key={`${key}-${i}`} className="max-w-full break-all rounded-md border border-line bg-white/[.03] px-2.5 py-1.5 font-mono text-xs text-slate-300"><b className="text-cyan-400">{key}</b>={value}</span>)}</div> : <span className="font-mono text-xs text-slate-300">None</span>}</div>
    </div>
  </div>
}

function Results({ result, resultRef }) {
  const t = levelTone(result.score)
  return <section ref={resultRef} className="scroll-mt-24 border-t border-white/[.06] bg-[#081422] py-20">
    <div className="mx-auto max-w-7xl px-5 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><span className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-cyan-400"><Gauge size={15}/>Assessment complete</span><h2 className="text-2xl font-bold text-white sm:text-3xl">URL Risk Assessment</h2></div><div className="max-w-xl rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-4 py-3 text-xs leading-5 text-slate-400"><Info size={14} className="mr-2 inline text-cyan-400"/>This score is based on URL characteristics and does not guarantee that a website is safe or malicious.</div></div>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="glass rounded-2xl border border-line p-6 text-center shadow-glow">
          <GaugeChart score={result.score}/><div className={cx('mx-auto mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold', t.soft, t.text)}><span className={cx('h-2 w-2 rounded-full',t.bg)}/>{result.level}</div>
          <div className="mt-6 border-t border-line pt-5 text-left"><p className="mb-2 text-xs text-slate-500">Analyzed URL</p><p className="break-all font-mono text-xs leading-5 text-slate-300">{result.normalized}</p></div>
        </div>
        <div className="grid content-start grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat icon={Gauge} label="Risk score" value={`${result.score} / 100`}/><Stat icon={ShieldQuestion} label="Risk level" value={result.level}/><Stat icon={CircleAlert} label="Indicators" value={`${result.findings.length} detected`}/><Stat icon={LockKeyhole} label="Protocol" value={result.summary.protocol}/><Stat icon={Globe2} label="Domain" value={result.summary.domain}/><Stat icon={Network} label="Subdomains" value={result.summary.subdomains}/>
          <div className="col-span-2 rounded-xl border border-line bg-ink/45 p-5 sm:col-span-3"><div className="mb-3 flex items-center justify-between text-xs"><span className="font-semibold text-slate-300">Indicator scale</span><span className="text-slate-500">0—100</span></div><div className="flex h-2 overflow-hidden rounded-full"><div className="w-1/4 bg-emerald-400"/><div className="w-1/4 bg-amber-400"/><div className="w-1/4 bg-orange-400"/><div className="w-1/4 bg-red-400"/></div><div className="mt-2 grid grid-cols-4 text-[9px] text-slate-600"><span>Low</span><span>Some</span><span>Suspicious</span><span className="text-right">High</span></div></div>
        </div>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <div><div className="mb-5 flex items-end justify-between"><div><h3 className="text-xl font-bold text-white">Detected Indicators</h3><p className="mt-1 text-sm text-slate-500">Explainable signals found in the URL string</p></div><span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">{result.findings.length}</span></div>
          <div className="space-y-3">{result.findings.length ? result.findings.map((item, i) => <Finding key={item.key} item={item} index={i}/>) : <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-8 text-center"><ShieldCheck className="mx-auto mb-3 text-emerald-300" size={34}/><h4 className="font-bold text-white">No rule-based indicators detected</h4><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">This does not prove the destination is safe. Continue to verify the sender and domain before opening unfamiliar links.</p></div>}</div>
        </div>
        <Breakdown data={result.breakdown}/>
      </div>
    </div>
  </section>
}

function HistoryDrawer({ open, onClose, history, onView, onDelete, onClear }) {
  return <><div onClick={onClose} className={cx('fixed inset-0 z-40 bg-black/65 backdrop-blur-sm transition', open ? 'visible opacity-100' : 'invisible opacity-0')}/><aside className={cx('fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-line bg-[#081422] shadow-2xl transition-transform duration-300', open ? 'translate-x-0' : 'translate-x-full')} aria-hidden={!open}>
    <div className="flex items-center justify-between border-b border-line p-5"><div className="flex items-center gap-3"><History className="text-cyan-400" size={21}/><div><h2 className="font-bold text-white">Analysis History</h2><p className="text-xs text-slate-500">Stored only on this device</p></div></div><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Close history"><X size={20}/></button></div>
    <div className="flex-1 space-y-3 overflow-y-auto p-5">{history.length ? history.map(item => { const t = levelTone(item.score); return <div key={item.id} className="rounded-xl border border-line bg-panel p-4"><div className="mb-3 flex items-start gap-3"><span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-full border text-sm font-bold', t.soft, t.text)}>{item.score}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-200" title={item.input}>{item.input}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500"><Clock3 size={11}/>{new Date(item.timestamp).toLocaleString()}</p></div></div><div className="flex gap-2"><button onClick={() => onView(item)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-400/10 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/15"><Eye size={14}/>View</button><button onClick={() => onDelete(item.id)} className="rounded-lg border border-line px-3 text-slate-500 hover:border-red-400/20 hover:text-red-300" aria-label="Delete history item"><Trash2 size={15}/></button></div></div> }) : <div className="py-20 text-center"><History className="mx-auto mb-3 text-slate-700" size={38}/><p className="font-medium text-slate-300">No analyses yet</p><p className="mt-1 text-sm text-slate-600">Your latest 10 assessments will appear here.</p></div>}</div>
    {history.length > 0 && <div className="border-t border-line p-5"><button onClick={onClear} className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-400/15 py-3 text-sm font-semibold text-red-300 hover:bg-red-400/5"><Trash2 size={15}/>Clear history</button></div>}
  </aside></>
}

const safetyTips = [
  [Fingerprint, 'Verify the sender', 'Confirm unexpected messages using a known phone number or a separate trusted channel.'],
  [Search, 'Inspect domain spelling', 'Look for swapped letters, misleading subdomains, or unfamiliar domain endings.'],
  [KeyRound, 'Protect your credentials', 'Avoid entering passwords or payment details into sites you have not independently verified.'],
  [ShieldCheck, 'Use trusted services', 'When more certainty is needed, check with reputable security tools and your organization’s security team.']
]

function App() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [] } catch { return [] } })
  const [drawer, setDrawer] = useState(false)
  const resultRef = useRef(null)
  const totalRules = 15
  useEffect(() => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)) } catch { /* storage can be unavailable in private browsing */ } }, [history])
  const runAnalysis = (value = input, save = true) => {
    try {
      const analyzed = analyzeUrl(value); setResult(analyzed); setError('')
      if (save) setHistory(prev => [analyzed, ...prev.filter(x => x.normalized !== analyzed.normalized)].slice(0,10))
      requestAnimationFrame(() => setTimeout(() => resultRef.current?.scrollIntoView({behavior:'smooth', block:'start'}), 50))
    } catch (e) { setError(e.message); setResult(null) }
  }
  const viewHistory = item => { setResult(item); setInput(item.input); setDrawer(false); requestAnimationFrame(() => setTimeout(() => resultRef.current?.scrollIntoView({behavior:'smooth'}),100)) }
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  return <div id="top" className="min-h-screen overflow-x-hidden bg-ink">
    <Header onHistory={() => setDrawer(true)}/>
    <main>
      <section className="relative overflow-hidden pb-24 pt-20 sm:pt-28">
        <div className="grid-bg absolute inset-0"/><div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/[.07] blur-[110px]"/>
        <div className="relative mx-auto max-w-5xl px-5 text-center lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/[.06] px-4 py-2 text-xs font-semibold text-cyan-200"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50"/><span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400"/></span>Private, local URL analysis</div>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-[-.04em] text-white sm:text-6xl lg:text-7xl">Check a Link Before <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">You Trust It</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">Inspect a URL for explainable risk indicators—without opening the website or sending the link anywhere.</p>
          <form onSubmit={e => { e.preventDefault(); runAnalysis() }} className="mx-auto mt-10 max-w-3xl text-left">
            <div className={cx('flex flex-col rounded-2xl border bg-panel/80 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl transition sm:flex-row', error ? 'border-red-400/50' : 'border-slate-600/70 focus-within:border-cyan-400/60 focus-within:shadow-glow')}>
              <div className="flex min-w-0 flex-1 items-center"><Link2 className="ml-4 shrink-0 text-slate-500" size={20}/><input value={input} onChange={e => {setInput(e.target.value); setError('')}} aria-label="Paste a URL" autoComplete="off" spellCheck="false" placeholder="Paste a URL — example.com/path" className="w-full bg-transparent px-4 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none sm:text-base" /></div>
              <button className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-7 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 active:scale-[.98]">Analyze Link<ArrowRight size={17}/></button>
            </div>
            {error && <p className="mt-3 flex items-center gap-2 px-2 text-sm text-red-300"><CircleAlert size={15}/>{error}</p>}
            <div className="mt-4 flex flex-col items-center justify-between gap-3 px-2 sm:flex-row"><span className="flex items-center gap-2 text-xs text-slate-500"><LockKeyhole size={14} className="text-emerald-400"/>URL analysis happens locally in your browser.</span><button type="button" onClick={() => {setInput(examples[2].value); runAnalysis(examples[2].value)}} className="flex items-center gap-2 text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"><Sparkles size={14}/>Try Example</button></div>
          </form>
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 divide-x divide-line text-center"><div><p className="text-xl font-bold text-white">{totalRules}</p><p className="mt-1 text-[10px] uppercase tracking-widest text-slate-600">Explainable rules</p></div><div><p className="text-xl font-bold text-white">0</p><p className="mt-1 text-[10px] uppercase tracking-widest text-slate-600">External requests</p></div><div><p className="text-xl font-bold text-white">100%</p><p className="mt-1 text-[10px] uppercase tracking-widest text-slate-600">Client-side</p></div></div>
        </div>
      </section>

      {result && <Results result={result} resultRef={resultRef}/>} 

      <section id="how-it-works" className="border-t border-white/[.06] py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-center"><div><span className="text-xs font-bold uppercase tracking-[.22em] text-cyan-400">Transparent by design</span><h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Security guidance you can understand.</h2><p className="mt-5 leading-7 text-slate-400">LinkGuard parses the text of a URL with your browser’s built-in URL API, then applies a documented set of weighted rules. It never visits the destination.</p><div className="mt-7 rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-4 text-sm leading-6 text-slate-300"><Info className="mr-2 inline text-cyan-400" size={16}/>The score supports informed decisions. It is not a malware scan, reputation check, or guarantee.</div></div>
          <div className="grid gap-4 sm:grid-cols-3">{[[Link2,'1','Parse','Separate the protocol, hostname, path, query, and fragment.'],[FileSearch,'2','Inspect','Test URL characteristics against clear, local rules.'],[Gauge,'3','Assess','Add weighted indicators and explain every finding.']].map(([Icon,n,title,desc]) => <div key={n} className="relative rounded-2xl border border-line bg-panel p-6"><span className="absolute right-4 top-3 text-5xl font-extrabold text-white/[.025]">{n}</span><span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><Icon size={21}/></span><h3 className="font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p></div>)}</div></div></div>
      </section>

      <section id="examples" className="border-y border-white/[.06] bg-[#081422] py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><span className="text-xs font-bold uppercase tracking-[.22em] text-cyan-400">Learning lab</span><h2 className="mt-3 text-3xl font-bold text-white">Synthetic educational examples</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">These reserved or illustrative addresses demonstrate how URL characteristics affect an assessment.</p></div><span className="flex items-center gap-2 text-xs text-slate-500"><CircleAlert size={14}/>Examples are not real threat claims</span></div>
          <div className="grid gap-3">{examples.map((ex,i) => <button key={ex.label} onClick={() => {setInput(ex.value); runAnalysis(ex.value)}} className="group flex flex-col items-start gap-3 rounded-xl border border-line bg-panel/70 p-4 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/[.03] sm:flex-row sm:items-center"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-ink text-xs font-bold text-slate-500">0{i+1}</span><span className="w-40 shrink-0 text-sm font-semibold text-slate-200">{ex.label}</span><code className="min-w-0 flex-1 break-all text-xs leading-5 text-slate-500 group-hover:text-slate-400">{ex.value}</code><span className="flex items-center gap-1 text-xs font-semibold text-cyan-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">Analyze<ArrowRight size={13}/></span></button>)}</div>
        </div>
      </section>

      <section id="safety" className="py-24"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="rounded-3xl border border-line bg-gradient-to-br from-[#0d2034] to-panel p-6 sm:p-10 lg:p-12"><div className="flex flex-col gap-10 lg:flex-row lg:items-start"><div className="max-w-md"><span className="grid h-12 w-12 place-items-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300"><Shield size={25}/></span><h2 className="mt-6 text-3xl font-bold text-white">Before Opening a Suspicious Link</h2><p className="mt-4 text-sm leading-7 text-slate-400">A URL score is one piece of context. Use simple verification habits whenever a message feels urgent, unexpected, or too good to be true.</p></div><div className="grid flex-1 gap-4 sm:grid-cols-2">{safetyTips.map(([Icon,title,desc]) => <div key={title} className="rounded-xl border border-white/[.06] bg-ink/40 p-5"><Icon size={19} className="mb-4 text-cyan-400"/><h3 className="font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p></div>)}</div></div></div></div></section>
    </main>
    <footer className="border-t border-white/[.06] py-8"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-xs text-slate-600 sm:flex-row lg:px-8"><div className="flex items-center gap-2 text-slate-400"><ShieldCheck size={16} className="text-cyan-500"/><b>LinkGuard</b><span>· URL Risk Analyzer</span></div><p>Built for education and safer browsing · {currentYear}</p><p className="flex items-center gap-1.5"><LockKeyhole size={13}/>No URLs leave your browser</p></div></footer>
    <HistoryDrawer open={drawer} onClose={() => setDrawer(false)} history={history} onView={viewHistory} onDelete={id => setHistory(h => h.filter(x => x.id !== id))} onClear={() => setHistory([])}/>
  </div>
}

export default App
