import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./vite-pages/AdminDashboard";
import NouvelAudit from "./vite-pages/NouvelAudit";
import DetailAudit from "./vite-pages/DetailAudit";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/nouvel-audit" element={<NouvelAudit />} />
      <Route path="/audit/:id" element={<DetailAudit />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
