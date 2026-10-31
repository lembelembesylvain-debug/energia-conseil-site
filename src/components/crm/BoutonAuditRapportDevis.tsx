import { useState } from "react";
import {
  construireHtmlAuditRapportDevis,
  embarquerImagesLocales,
  ouvrirApercuAuditRapportDevis,
} from "../../lib/crm/auditRapportDevisLicence.js";
import { chargerRelevesTransmis } from "../../lib/crm/photosReleveTerrain.js";

type Props = {
  dossier?: { id?: string; nom?: string } | null;
  edition?: unknown;
  className?: string;
};

export default function BoutonAuditRapportDevis({ dossier, edition, className = "" }: Props) {
  const [enCours, setEnCours] = useState(false);

  const lancer = async () => {
    if (!dossier || enCours) return;
    setEnCours(true);
    try {
      let galerie: { id?: string; src?: string; label?: string }[] = [];
      try {
        const releves = await chargerRelevesTransmis();
        const nom = String(dossier.nom || "").trim().toLowerCase();
        const releve = releves.find(
          (item: { id?: string; nom?: string }) =>
            item.id === dossier.id || String(item.nom || "").trim().toLowerCase() === nom,
        );
        galerie = releve?.galerie || [];
      } catch {
        galerie = [];
      }
      const html = await embarquerImagesLocales(
        construireHtmlAuditRapportDevis({ dossier, edition, galerie }),
      );
      ouvrirApercuAuditRapportDevis(html);
    } finally {
      setEnCours(false);
    }
  };

  return (
    <button
      type="button"
      onClick={lancer}
      disabled={!dossier || enCours}
      className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 via-cyan-500 to-sky-400 px-4 py-3 text-left text-sm font-semibold text-white shadow-lg shadow-cyan-950/40 hover:from-blue-600 hover:to-cyan-300 disabled:opacity-60 ${className}`}
    >
      <span aria-hidden>📄</span>
      {enCours
        ? "Préparation de l’aperçu…"
        : "Télécharger Audit, Rapport & Devis sous Licence de Marque (PDF)"}
    </button>
  );
}
