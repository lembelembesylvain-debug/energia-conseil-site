import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  COULEURS_ADEME,
  ENTETE_FICHE,
  peutExporterFiche,
  presenterFiche,
  telechargerFicheOpportunitePdf,
  type EtiquetteDpe,
  type FicheOpportunite,
  type PresentationFiche,
} from "../../lib/proptech/ficheOpportuniteSniper";

const LETTRES: readonly EtiquetteDpe[] = ["A", "B", "C", "D", "E", "F", "G"];

const CSS_IMPRESSION = `
@page { size: A4 portrait; margin: 0; }
@media print {
  html, body { background: #fff !important; }
  body > *:not(#fiche-sniper-print-root) { display: none !important; }
  #fiche-sniper-print-root {
    position: static !important;
    inset: auto !important;
    display: block !important;
    overflow: visible !important;
    background: #fff !important;
    padding: 0 !important;
  }
  #fiche-sniper-print-root .no-print { display: none !important; }
  #fiche-sniper-a4 {
    width: 210mm !important;
    min-height: 297mm !important;
    margin: 0 !important;
    box-shadow: none !important;
  }
}
`;

function PastilleDpe({ lettre }: { lettre: EtiquetteDpe | null }) {
  const teinte = lettre ? COULEURS_ADEME[lettre] : { fond: "#64748b", texte: "#ffffff" };
  return (
    <div className="shrink-0">
      <div
        className="flex h-16 w-16 items-center justify-center text-3xl font-bold"
        style={{ backgroundColor: teinte.fond, color: teinte.texte }}
        aria-label={lettre ? `Classe énergie ${lettre}` : "Classe énergie non renseignée"}
      >
        {lettre ?? "–"}
      </div>
      <div className="mt-1.5 flex gap-0.5" aria-hidden="true">
        {LETTRES.map((item) => (
          <span
            key={item}
            className={`flex h-3.5 w-3.5 items-center justify-center text-[7px] font-bold ${item === lettre ? "ring-2 ring-slate-900" : ""}`}
            style={{ backgroundColor: COULEURS_ADEME[item].fond, color: COULEURS_ADEME[item].texte }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Paires({ lignes }: { lignes: PresentationFiche["identite"] }) {
  return (
    <dl className="grid grid-cols-[7.4rem_1fr] gap-x-2 gap-y-1">
      {lignes.map((ligne) => (
        <div key={ligne.label} className="contents">
          <dt className={ligne.label.startsWith("Motif") ? "text-[10px] font-semibold text-[#1d4ed8]" : "text-[10px] text-slate-500"}>
            {ligne.label}
          </dt>
          <dd className={ligne.label.startsWith("Motif") ? "text-[11px] font-bold text-[#6d28d9]" : "text-[11px] font-semibold text-slate-900"}>
            {ligne.valeur}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Cadre({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="flex h-full flex-col border border-[#d6cec0] bg-white">
      <h3 className="bg-[#0B1F33] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
        {titre}
      </h3>
      <div className="flex-1 border-l-[3px] border-[#b08a4a] px-2.5 py-2">{children}</div>
    </section>
  );
}

function ApercuFicheA4({ vue }: { vue: PresentationFiche }) {
  return (
    <article
      id="fiche-sniper-a4"
      className="mx-auto flex min-h-[297mm] w-[210mm] flex-col bg-white text-slate-800 shadow-2xl"
    >
      <header className="bg-[#0B1F33] px-8 pb-3 pt-5 text-white">
        <p className="text-[13px] font-bold tracking-tight">
          ENERGIA CONSEIL IA® — {ENTETE_FICHE.sousTitre}
        </p>
        <p className="mt-1 text-[10px] text-slate-200">
          {ENTETE_FICHE.inpi} | {ENTETE_FICHE.adresse}
        </p>
        <p className="mt-1 text-[10px] font-semibold text-[#d6b36a]">{ENTETE_FICHE.partenariat}</p>
        <div className="mt-3 flex items-end justify-between gap-4 text-[10px]">
          <p>Édition du {vue.dateEdition}</p>
          <p className="font-bold tracking-wide">{vue.reference}</p>
        </div>
        <p className="mt-1 text-[9px] text-slate-300">{vue.source}</p>
      </header>
      <p className="bg-[#F4F0E6] px-6 py-2 text-center text-[11px] font-bold tracking-wide text-[#0B1F33]">
        {ENTETE_FICHE.document}
      </p>
      <div className="flex-1 px-6 py-3">
        <div className="grid grid-cols-2 gap-2.5">
          <Cadre titre="1 — Fiche d'identité du bien">
            <Paires lignes={vue.identite} />
          </Cadre>
          <Cadre titre="2 — Analyse foncière et cadastrale">
            <Paires lignes={vue.foncier} />
            <p className="mt-2 text-[10px] leading-snug text-slate-700">
              <span className="font-semibold text-slate-900">Potentiel foncier. </span>
              {vue.potentiel}
            </p>
          </Cadre>
        </div>

        <div className="mt-2.5">
          <Cadre titre="3 — Diagnostic thermique et risque réglementaire">
            <div className="flex gap-3">
              <PastilleDpe lettre={vue.etiquette} />
              <div className="min-w-0 space-y-1 text-[10.5px] leading-snug">
                <p className="font-semibold text-slate-900">{vue.conso}</p>
                <p className={vue.statut.startsWith("URGENCE BAILLEUR") ? "rounded bg-rose-50 px-1.5 py-1 font-semibold text-rose-800" : ""}>
                  {vue.statut}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[10.5px] leading-snug">{vue.deperditions}</p>
            <p
              className={
                vue.impact.includes("Facture EDF")
                  ? "mt-1 rounded bg-amber-50 px-1.5 py-1 text-[10.5px] font-semibold leading-snug text-amber-950"
                  : "mt-1 text-[10.5px] leading-snug"
              }
            >
              {vue.impact}
            </p>
          </Cadre>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          <Cadre titre="4 — Marché et données DVF 5 ans">
            {vue.encadreMutation ? (
              <p className="mb-2 border-l-2 border-emerald-600 bg-emerald-50 px-2 py-1.5 text-[9.5px] font-semibold leading-snug text-emerald-950">
                {vue.encadreMutation}
              </p>
            ) : null}
            <ul className="space-y-1 text-[10px] leading-snug">
              {vue.marche.map((ligne) => (
                <li key={ligne}>{ligne}</li>
              ))}
            </ul>
          </Cadre>
          <Cadre titre="5 — Préconisations de l'ensemblier">
            <ol className="list-decimal space-y-1 pl-4 text-[10px] leading-snug">
              {vue.preconisations.map((ligne) => (
                <li key={ligne}>{ligne}</li>
              ))}
            </ol>
            <p className="mt-2 border-l-2 border-[#f97316] bg-[#fff7ed] px-2 py-1.5 text-[9px] leading-snug text-slate-700">
              {vue.mentionAides}
            </p>
          </Cadre>
        </div>
      </div>
      <footer className="mt-auto bg-[#0B1F33] px-8 py-3 text-[8px] leading-relaxed text-slate-200">
        <p>{vue.piedConfidentialite}</p>
        <p className="mt-0.5">{vue.piedContact}</p>
        <p className="mt-0.5 text-slate-300">{vue.piedEquipe}</p>
      </footer>
    </article>
  );
}

interface ExportFicheTerrainPdfProps {
  fiche: FicheOpportunite;
}

export default function ExportFicheTerrainPdf({ fiche }: ExportFicheTerrainPdfProps) {
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState("");
  const actif = peutExporterFiche(fiche);
  const vue = presenterFiche(fiche, "ecran");

  useEffect(() => {
    if (!ouvert) return undefined;
    const precedente = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const fermer = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOuvert(false);
    };
    window.addEventListener("keydown", fermer);
    return () => {
      document.body.style.overflow = precedente;
      window.removeEventListener("keydown", fermer);
    };
  }, [ouvert]);

  const telecharger = () => {
    try {
      telechargerFicheOpportunitePdf(fiche);
      setErreur("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Export PDF impossible.");
    }
  };

  return (
    <>
      <button
        type="button"
        data-testid="export-fiche-sniper"
        disabled={!actif}
        title={actif ? "Ouvrir la fiche A4 et la télécharger" : "Sélectionnez un bien ou une parcelle"}
        onClick={(event) => {
          event.stopPropagation();
          if (!actif) return;
          setOuvert(true);
        }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/60 bg-amber-400 px-3 py-2.5 text-[12px] font-semibold text-slate-950 shadow-sm hover:bg-amber-300 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
      >
        <span aria-hidden="true">📄</span>
        Exporter la Fiche Terrain PDF (A4)
      </button>

      {ouvert
        ? createPortal(
            <div
              id="fiche-sniper-print-root"
              className="fixed inset-0 z-[5000] flex flex-col bg-slate-950/80"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titre-fiche-sniper"
            >
              <style>{CSS_IMPRESSION}</style>
              <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div>
                  <p id="titre-fiche-sniper" className="text-sm font-semibold text-white">
                    Fiche d&apos;opportunité foncière — aperçu A4
                  </p>
                  <p className="text-[11px] text-slate-300">{vue.reference}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
                    onClick={() => window.print()}
                  >
                    Imprimer
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300"
                    onClick={telecharger}
                  >
                    Télécharger le PDF
                  </button>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                    onClick={() => setOuvert(false)}
                  >
                    Fermer
                  </button>
                </div>
              </div>
              {erreur ? <p className="no-print px-4 py-2 text-xs text-rose-200">{erreur}</p> : null}
              <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
                <ApercuFicheA4 vue={vue} />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
