import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import DiagnosticRapide from "./vite-pages/DiagnosticRapide.jsx";

document.documentElement.style.background = "#f4f7fb";
document.body.style.margin = "0";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DiagnosticRapide />
  </StrictMode>,
);
