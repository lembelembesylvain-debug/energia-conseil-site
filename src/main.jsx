import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import AdminDashboard from './pages/AdminDashboard.jsx'
import NouvelAudit from './pages/NouvelAudit.jsx'
import DetailAudit from './pages/DetailAudit.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/nouvel-audit" element={<NouvelAudit />} />
        <Route path="/audit/:id" element={<DetailAudit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)