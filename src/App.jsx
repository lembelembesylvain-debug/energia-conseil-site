import React from 'react'  
import ReactDOM from 'react-dom/client'  
import { BrowserRouter, Routes, Route } from 'react-router-dom'  
import App from './App.jsx'  
import AdminDashboard from './pages/AdminDashboard'  
import Analytics from './pages/Analytics'  
import NouvelAudit from './pages/NouvelAudit'  
import DetailAudit from './pages/DetailAudit'  
import './index.css'  
 
ReactDOM.createRoot(document.getElementById('root')).render(  
  <React.StrictMode>  
    <BrowserRouter>  
      <Routes>  
        <Route path="/" element={<App />} />  
        <Route path="/admin" element={<AdminDashboard />} />  
        <Route path="/analytics" element={<Analytics />} />  
        <Route path="/audits/new" element={<NouvelAudit />} />  
        <Route path="/audits/:id" element={<DetailAudit />} />  
      </Routes>  
    </BrowserRouter>  
  </React.StrictMode>,  
)  