import { useParams } from "react-router-dom";
import { getPartnerById, isPartnerPageEnabled } from "../config/partners";
import PartnerDiagnosticFlow from "../components/partners/PartnerDiagnosticFlow.jsx";

export default function PartenairePage() {
  const { partnerId } = useParams();
  const partner = getPartnerById(partnerId);

  if (!isPartnerPageEnabled(partner)) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          fontFamily: "Arial, Helvetica, sans-serif",
          background: "#f4f7fb",
          color: "#0b1f3a",
        }}
      >
        <section style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0f766e" }}>
            Energia Conseil IA®
          </p>
          <h1 style={{ fontSize: 22, margin: "8px 0 12px" }}>Partenaire introuvable</h1>
          <p style={{ fontSize: 14, lineHeight: 1.45, color: "#5b6b7c" }}>
            Cette page partenaire n’est pas publiée, ou l’identifiant n’existe pas. Aucun
            prospect n’est affiché.
          </p>
        </section>
      </main>
    );
  }

  return <PartnerDiagnosticFlow partner={partner} />;
}
