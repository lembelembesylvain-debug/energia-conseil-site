import { useState } from "react";
import { euro } from "../../lib/crm/mockData";
import { embarquerImagesHtmlContrat } from "../../lib/crm/htmlContratCrm";
import {
  OFFRE_PEREIRA_ABF,
  OFFRE_PEREIRA_ECO,
  TOTAUX_OFFRE_PEREIRA_ABF,
  TOTAUX_OFFRE_PEREIRA_ECO,
  construireHtmlDevisCommercialPereira,
  metaOffrePereira,
  offrePereiraActive,
} from "../../lib/crm/pereiraOffresCommerciales";

function ouvrirHtml(html) {
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

export default function SelecteurOffrePereira({ offreActive, onChange, editable = true }) {
  const active = offrePereiraActive(offreActive);
  const [exportEnCours, setExportEnCours] = useState("");

  const exporter = async (offre) => {
    setExportEnCours(offre);
    try {
      const html = await embarquerImagesHtmlContrat(construireHtmlDevisCommercialPereira(offre));
      ouvrirHtml(html);
    } finally {
      setExportEnCours("");
    }
  };

  const carte = (offre, totaux, actifClasse, montantClasse) => {
    const meta = metaOffrePereira(offre);
    const actif = active === offre;
    return (
      <button
        type="button"
        disabled={!editable}
        onClick={() => onChange?.(offre)}
        className={`rounded-xl border px-4 py-3 text-left ${
          actif ? actifClasse : "border-slate-700 bg-slate-900 text-slate-200"
        }`}
      >
        <span className="block text-sm font-semibold">
          {meta.numero} — {meta.libelleCourt}
        </span>
        <span className={`mt-1 block text-lg font-bold ${montantClasse}`}>{euro(totaux.totalTtc)} TTC</span>
        <span className="mt-1 block text-xs text-slate-300">
          RAC {euro(totaux.resteACharge)} · acompte {euro(totaux.acompte)} · ~{euro(totaux.mensualiteVivons)}/mois
        </span>
        <span className="mt-1 block text-xs text-emerald-200">Marge CG réservée {euro(5200)} HT</span>
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/70 p-4" data-testid="selecteur-offre-pereira">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
        Deux devis Pereira — Nervieux — marge 5 200 € HT dans les deux formules
      </p>
      <p className="mt-1 text-xs text-amber-100">
        Exécution chantier : combles, plancher, menuiseries (formule ABF), VMC, PAC, ballon. Le PDF rappelle cet ordre.
        L’acompte de 30 % est calculé sur le reste à charge et attend l’accord ANAH en scénario A.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {carte(OFFRE_PEREIRA_ABF, TOTAUX_OFFRE_PEREIRA_ABF, "border-emerald-400 bg-emerald-500/20 text-white", "text-emerald-200")}
        {carte(OFFRE_PEREIRA_ECO, TOTAUX_OFFRE_PEREIRA_ECO, "border-sky-400 bg-sky-500/20 text-white", "text-sky-200")}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="export-devis-pereira-01"
          className="inline-flex min-h-11 items-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          onClick={() => exporter(OFFRE_PEREIRA_ABF)}
        >
          {exportEnCours === OFFRE_PEREIRA_ABF ? "Préparation…" : "Exporter Devis 1 PDF"}
        </button>
        <button
          type="button"
          data-testid="export-devis-pereira-02"
          className="inline-flex min-h-11 items-center rounded-xl bg-sky-500 px-4 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          onClick={() => exporter(OFFRE_PEREIRA_ECO)}
        >
          {exportEnCours === OFFRE_PEREIRA_ECO ? "Préparation…" : "Exporter Devis 2 PDF"}
        </button>
      </div>
    </div>
  );
}
