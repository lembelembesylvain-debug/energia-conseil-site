import { useState } from "react";
import AuditSimulator from "./components/AuditSimulator";
import LandingPage from "./components/landing/LandingPage";

export default function App() {
  const [showSimulator, setShowSimulator] = useState(false);

  if (showSimulator) {
    return <AuditSimulator onBack={() => setShowSimulator(false)} />;
  }

  return <LandingPage onStartAudit={() => setShowSimulator(true)} />;
}
