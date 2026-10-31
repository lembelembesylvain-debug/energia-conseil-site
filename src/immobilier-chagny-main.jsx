import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ImmobilierChagnyApp from "./sites/immobilier-chagny/ImmobilierChagnyApp";
import "./sites/immobilier-chagny/immobilier-chagny.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ImmobilierChagnyApp />
  </StrictMode>,
);
