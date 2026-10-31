/**
 * Document client Clyve — contrat officiel de Contractant Général.
 * Remplace l’ancien PDF jsPDF à couverture blanche : même charte que Brunel
 * (HTML imprimable → Enregistrer en PDF).
 */

import {
  CLYVE_LAGENETE_DOSSIER_ID,
  NOM_FICHIER_CONTRAT_CLYVE,
} from "./crm/clyveLaGeneteContrat";
import { htmlContratPourDossierAvecImagesEmbarquees } from "./crm/htmlContratCrm";

function ouvrirEtImprimer(html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const fenetre = window.open(url, "_blank", "noopener,noreferrer");
  if (fenetre) {
    const timer = window.setInterval(() => {
      try {
        if (fenetre.closed) {
          window.clearInterval(timer);
          return;
        }
        if (fenetre.document.readyState === "complete") {
          window.clearInterval(timer);
          fenetre.focus();
          fenetre.print();
        }
      } catch {
        window.clearInterval(timer);
      }
    }, 250);
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120000);
}

function telechargerHtml(html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = NOM_FICHIER_CONTRAT_CLYVE;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(url);
}

export async function generateRapportLaGenetePdf(): Promise<void> {
  const html = await htmlContratPourDossierAvecImagesEmbarquees({}, { id: CLYVE_LAGENETE_DOSSIER_ID });
  telechargerHtml(html);
  ouvrirEtImprimer(html);
}

/** Impression du marché d'urgence — contrat officiel Brunel, pas la fiche écran. */
export async function imprimerContratUrgenceLaGenete(): Promise<void> {
  const html = await htmlContratPourDossierAvecImagesEmbarquees({}, { id: CLYVE_LAGENETE_DOSSIER_ID });
  ouvrirEtImprimer(html);
}

/** Impression du devis prévisionnel Phase 4 — même charte Brunel, pas la fiche écran. */
export async function imprimerDevisPrintempsLaGenete(): Promise<void> {
  const html = await htmlContratPourDossierAvecImagesEmbarquees(
    { devisPrintemps: true },
    { id: CLYVE_LAGENETE_DOSSIER_ID },
  );
  ouvrirEtImprimer(html);
}
