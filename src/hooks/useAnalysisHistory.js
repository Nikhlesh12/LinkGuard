import { useEffect, useState } from 'react'

const KEY = 'linkguard-investigations-v2'

export function useAnalysisHistory() {
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
  })
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(history)) } catch { /* optional storage may be blocked */ } }, [history])
  const add = result => setHistory(items => [{ id: `${result.id}-${Date.now()}`, type: result.type, timestamp: result.timestamp, score: result.score, label: result.label, description: result.description || 'Local analysis' }, ...items].slice(0, 10))
  const remove = id => setHistory(items => items.filter(item => item.id !== id))
  const clear = () => setHistory([])
  return { history, add, remove, clear }
}
