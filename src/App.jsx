import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HistoryDrawer from './components/HistoryDrawer'
import { useAnalysisHistory } from './hooks/useAnalysisHistory'
import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import PrivacyPage from './pages/PrivacyPage'

function AppContent() {
  const [historyOpen, setHistoryOpen] = useState(false)
  const { history, add, remove, clear } = useAnalysisHistory()
  return <Layout onHistory={() => setHistoryOpen(true)}>
    <Routes><Route path="/" element={<HomePage onSave={add}/>}/><Route path="/learn" element={<LearnPage/>}/><Route path="/privacy" element={<PrivacyPage/>}/><Route path="*" element={<HomePage onSave={add}/>}/></Routes>
    <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} history={history} onDelete={remove} onClear={clear}/>
  </Layout>
}

export default function App() { return <BrowserRouter><AppContent/></BrowserRouter> }
