import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Link2, MessageSquareText, QrCode, Upload } from 'lucide-react'
import { analyzeUrl } from '../features/link-analysis/analyzeUrl'
import { analyzeMessage } from '../features/message-analysis/analyzeMessage'
import { decodeQrFile } from '../features/qr-analysis/decodeQr'
import { calculateRiskScore, createReportId } from '../utils/scoring'
import ResultPanel from './ResultPanel'

const tabs = [
  { id: 'link', label: 'Link', icon: Link2, description: 'Inspect URL structure' },
  { id: 'qr', label: 'QR Code', icon: QrCode, description: 'Reveal hidden content' },
  { id: 'message', label: 'Message', icon: MessageSquareText, description: 'Review scam language' }
]

function LinkCheck({ value, setValue, onRun, error }) {
  return <form onSubmit={event => {event.preventDefault(); onRun(value)}}><label htmlFor="link-input" className="text-sm font-bold text-stone-800">Link or defanged indicator</label><p className="mt-1 text-xs text-stone-500">Supports regular URLs and analyst notation such as hxxps://example[.]com.</p><div className="mt-4 flex flex-col gap-3 sm:flex-row"><div className="flex min-w-0 flex-1 items-center rounded-2xl border border-stone-300 bg-white px-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100"><Link2 className="shrink-0 text-stone-400" size={18}/><input id="link-input" value={value} onChange={event => setValue(event.target.value)} placeholder="https://example.com/path" className="w-full bg-transparent px-3 py-4 text-sm outline-none"/></div><button className="rounded-2xl bg-indigo-700 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-900/10 hover:bg-indigo-800">Analyze Link</button></div>{error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}</form>
}

function MessageCheck({ value, setValue, onRun, error, demos }) {
  return <div><form onSubmit={event => {event.preventDefault(); onRun(value)}}><label htmlFor="message-input" className="text-sm font-bold text-stone-800">Suspicious message text</label><p className="mt-1 text-xs text-stone-500">Full message text is analyzed in memory and is not saved to history.</p><textarea id="message-input" value={value} onChange={event => setValue(event.target.value)} placeholder="Paste a suspicious SMS, WhatsApp message or email text here..." rows="7" className="mt-4 w-full resize-y rounded-2xl border border-stone-300 bg-white p-4 text-sm leading-6 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"/><div className="mt-3 flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center"><span className="text-xs text-stone-400">{value.length.toLocaleString()} / 10,000 characters</span><button className="rounded-2xl bg-indigo-700 px-7 py-3.5 text-sm font-bold text-white hover:bg-indigo-800">Check Message</button></div>{error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}</form><div className="mt-6 border-t border-stone-200 pt-5"><p className="text-xs font-bold uppercase tracking-wider text-stone-400">Educational demos</p><div className="mt-3 flex flex-wrap gap-2">{demos.map(demo => <button key={demo.title} onClick={() => {setValue(demo.text); onRun(demo.text)}} className="rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-600 hover:border-indigo-300 hover:text-indigo-700">{demo.title}</button>)}</div></div></div>
}

function QrCheck({ onFile, error, loading, preview, onDemo }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)
  return <div><label className="text-sm font-bold text-stone-800">QR image</label><p className="mt-1 text-xs text-stone-500">PNG, JPEG, WebP, or another browser-readable image up to 8 MB.</p><div onDragOver={event => {event.preventDefault(); setDrag(true)}} onDragLeave={() => setDrag(false)} onDrop={event => {event.preventDefault(); setDrag(false); onFile(event.dataTransfer.files[0])}} className={`mt-4 rounded-3xl border-2 border-dashed p-7 text-center transition ${drag ? 'border-indigo-500 bg-indigo-50' : 'border-stone-300 bg-white'}`}><input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={event => onFile(event.target.files[0])}/>{preview ? <img src={preview} alt="Uploaded QR preview" className="mx-auto mb-4 max-h-44 rounded-xl object-contain"/> : <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-700"><Upload size={23}/></span>}<p className="mt-4 font-bold">Drop a QR image here</p><p className="mt-1 text-xs text-stone-500">or select one from your device</p><button type="button" disabled={loading} onClick={() => inputRef.current?.click()} className="mt-5 rounded-full border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-xs font-bold text-indigo-800 hover:bg-indigo-100 disabled:opacity-50">{loading ? 'Decoding locally…' : 'Choose Image'}</button></div>{error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}<button onClick={onDemo} className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-700 hover:text-indigo-900"><QrCode size={15}/>Try Suspicious QR Example <span className="rounded-full bg-amber-100 px-2 py-1 text-[9px] uppercase text-amber-800">Educational Demo</span></button></div>
}

export default function InvestigationWorkspace({ onSave, messageDemos, initialDemo }) {
  const [tab, setTab] = useState('link')
  const [link, setLink] = useState('')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState('')
  const run = analysis => { setResult(analysis); setError(''); onSave(analysis); setTimeout(() => document.getElementById('investigation-result')?.scrollIntoView({behavior:'smooth', block:'start'}), 50) }
  const runLink = value => { try { run(analyzeUrl(value)) } catch (issue) { setError(issue.message); setResult(null) } }
  const runMessage = value => { try { run(analyzeMessage(value)) } catch (issue) { setError(issue.message); setResult(null) } }
  useEffect(() => {
    if (!initialDemo) return
    const demo = messageDemos[1] || messageDemos[0]
    setTab('message'); setMessage(demo.text); runMessage(demo.text)
    // A changing request number intentionally triggers the selected educational demo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDemo])
  const processFile = async file => {
    if (!file) return
    setLoading(true); setError('')
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    try {
      const decoded = await decodeQrFile(file)
      let linkResult = null
      if (decoded.contentType === 'URL') linkResult = analyzeUrl(decoded.content)
      const findings = linkResult?.findings || []
      const risk = calculateRiskScore(findings)
      run({ type: 'qr', id: createReportId(decoded.content), timestamp: new Date().toISOString(), ...decoded, ...risk, findings, linkResult, breakdown: linkResult?.breakdown, label: risk.label, description: decoded.contentType === 'URL' ? linkResult.description : decoded.contentType, summary: linkResult ? `The QR code contains a URL. LinkGuard decoded it locally and found ${findings.length} explainable URL risk signal${findings.length === 1 ? '' : 's'}.` : `The QR code contains ${decoded.contentType.toLowerCase()}. It was decoded and displayed as inert text; no action was performed.`, recommendations: linkResult ? ['Check the decoded registered domain before opening it on another device.', 'Verify who provided the QR code and why.', 'Do not enter credentials or payment details unless the destination is independently verified.'] : ['Verify who supplied the QR code before acting on its content.', 'Copy details only when you understand and trust the requested action.'] })
    } catch (issue) { setError(issue.message); setResult(null) } finally { setLoading(false) }
  }
  const runQrDemo = async () => {
    try {
      const dataUrl = await QRCode.toDataURL('https://paypal-login-secure.example.com/account/verify?next=https%3A%2F%2Fexample.net', { width: 420, margin: 3 })
      const [header, encoded] = dataUrl.split(','); const mime = header.match(/:(.*?);/)[1]; const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0))
      processFile(new File([bytes], 'educational-qr-demo.png', {type: mime}))
    } catch { setError('The educational QR demo could not be generated in this browser.') }
  }
  const analyzeExtracted = value => { setTab('link'); setLink(value); runLink(value); document.getElementById('workspace')?.scrollIntoView({behavior:'smooth'}) }

  return <section id="workspace" className="scroll-mt-24 rounded-[2rem] border border-stone-200 bg-[#fbfaf7] p-3 shadow-xl shadow-stone-900/5 sm:p-5"><div className="grid grid-cols-3 gap-2 rounded-2xl bg-stone-100 p-1.5" role="tablist" aria-label="Analysis type">{tabs.map(item => <button key={item.id} role="tab" aria-selected={tab === item.id} onClick={() => {setTab(item.id); setError(''); setResult(null)}} className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-bold uppercase tracking-wider transition sm:py-4 ${tab === item.id ? 'bg-white text-indigo-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}><item.icon size={17}/><span className="truncate">{item.label}</span><span className="hidden font-normal normal-case tracking-normal text-stone-400 lg:inline">· {item.description}</span></button>)}</div>
    <div className="p-3 py-7 sm:p-7">{tab === 'link' && <LinkCheck value={link} setValue={setLink} onRun={runLink} error={error}/>} {tab === 'message' && <MessageCheck value={message} setValue={setMessage} onRun={runMessage} error={error} demos={messageDemos}/>} {tab === 'qr' && <QrCheck onFile={processFile} error={error} loading={loading} preview={preview} onDemo={runQrDemo}/>}</div>
    <div id="investigation-result"><ResultPanel result={result} onAnalyzeLink={analyzeExtracted}/></div>
  </section>
}
