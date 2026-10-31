import {
  cheminContratPublic,
  htmlContratPourDossierAvecImagesEmbarquees,
  nomFichierContrat,
} from "../../lib/crm/htmlContratCrm";
import { lireEditionDossier } from "../../lib/crm/editionDossier";
import { chargerReferentiel } from "../../lib/crm/artisansRge";
import { tenterExportClient } from "../../lib/crm/gardeFouMarge";
import {
  CHEMIN_RAPPORT_PEREIRA_NERVIEUX,
  PEREIRA_NERVIEUX_DOSSIER_ID,
} from "../../lib/crm/pereiraNervieuxOfficiel";
import { BRUNEL_DOSSIER_ID } from "../../lib/crm/brunelWorkingBase";
import { CHEMIN_FICHE_TECHNIQUE_BRUNEL } from "../../lib/crm/brunelMarcheOfficiel2026";

function classesPrimaire(compact, disabled) {
  const base = compact
    ? "inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/30 hover:from-emerald-400 hover:to-teal-400"
    : "inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-900/40 hover:from-emerald-400 hover:to-teal-400";
  return disabled ? `${base} cursor-not-allowed opacity-40 hover:from-emerald-500 hover:to-teal-500` : base;
}

function classesSecondaire(compact, disabled) {
  const base = compact
    ? "inline-flex min-h-10 items-center justify-center rounded-xl border border-emerald-400/50 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20"
    : "inline-flex min-h-12 items-center justify-center rounded-2xl border border-emerald-400/50 px-5 py-3 text-base font-semibold text-emerald-100 hover:bg-emerald-500/20";
  return disabled ? `${base} cursor-not-allowed opacity-40 hover:bg-transparent` : base;
}

function ouvrirHtml(html, { imprimer = false } = {}) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const fenetre = window.open(url, "_blank", "noopener,noreferrer");
  if (imprimer && fenetre) {
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

function ouvrirEtImprimer(url) {
  const fenetre = window.open(url, "_blank", "noopener,noreferrer");
  if (!fenetre) return;
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

async function telechargerFichierHtml(url, nomFichier) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = objectUrl;
    lien.download = nomFichier;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = nomFichier;
    lien.target = "_blank";
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
  }
}

/**
 * Bouton unique CRM — Template Master Contractant Général (charte Pereira).
 */
export default function ContratContractantGeneralMaster({
  dossier,
  edition,
  compact = false,
  afficherContrat = true,
}) {
  if (!dossier?.id) return null;

  const editionEffective = edition || lireEditionDossier(dossier.id, dossier);
  const htmlAvecImages = () => htmlContratPourDossierAvecImagesEmbarquees(editionEffective, dossier);
  const cheminPublic = cheminContratPublic(dossier.id, editionEffective);
  const nomFichier = nomFichierContrat(dossier, editionEffective);
  const exportEtat = tenterExportClient({
    travaux: editionEffective?.travaux,
    dossier,
    edition: editionEffective,
    referentiel: chargerReferentiel(),
  });
  const bloque = exportEtat.bloque;
  const motifBlocage = exportEtat.motif || "";

  const ouvrirPdfOuImprimer = async () => {
    if (bloque) return;
    if (cheminPublic) {
      ouvrirEtImprimer(cheminPublic);
      return;
    }
    ouvrirHtml(await htmlAvecImages(), { imprimer: true });
  };

  const telecharger = async () => {
    if (bloque) return;
    if (cheminPublic) {
      await telechargerFichierHtml(cheminPublic, nomFichier);
      return;
    }
    const html = await htmlAvecImages();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = nomFichier;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {afficherContrat ? (
      <>
      <button
        type="button"
        className={classesPrimaire(compact, bloque)}
        disabled={bloque}
        title={bloque ? motifBlocage : "Télécharger Contrat Officiel PDF — ouvre le HTML et déclenche l’impression / Enregistrer en PDF"}
        onClick={ouvrirPdfOuImprimer}
      >
        Télécharger Contrat Officiel PDF
      </button>
      <button
        type="button"
        className={classesSecondaire(compact, bloque)}
        disabled={bloque}
        title={bloque ? motifBlocage : "Imprimer le contrat (window.print)"}
        onClick={ouvrirPdfOuImprimer}
      >
        Imprimer le Contrat
      </button>
      <button
        type="button"
        className={classesSecondaire(compact, bloque)}
        disabled={bloque}
        title={bloque ? motifBlocage : "Télécharger le fichier HTML du marché"}
        onClick={telecharger}
      >
        Télécharger HTML
      </button>
      </>
      ) : null}
      {afficherContrat && bloque ? (
        <span role="alert" className="max-w-md text-[11px] font-semibold text-red-300">
          {motifBlocage}
        </span>
      ) : null}
      {dossier.id === BRUNEL_DOSSIER_ID ? (
        <button
          type="button"
          className={classesSecondaire(compact, false)}
          data-testid="bouton-fiche-technique-brunel"
          title="Ouvre et imprime la fiche technique normalisée Anah"
          onClick={() => ouvrirEtImprimer(CHEMIN_FICHE_TECHNIQUE_BRUNEL)}
        >
          Imprimer la fiche technique Anah
        </button>
      ) : null}
      {dossier.id === PEREIRA_NERVIEUX_DOSSIER_ID ? (
        <a href={CHEMIN_RAPPORT_PEREIRA_NERVIEUX} target="_blank" rel="noopener noreferrer" className={classesSecondaire(compact, false)}>
          Rapport technique
        </a>
      ) : null}
    </span>
  );
}
