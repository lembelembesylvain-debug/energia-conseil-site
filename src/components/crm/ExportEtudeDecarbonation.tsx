import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  composerEtudeDecarbonation,
  peutExporterEtudeB2b,
  telechargerEtudeDecarbonationPdf,
  type ContexteFicheB2b,
  type EtudeDecarbonationB2b,
  type SiteProfessionnel,
} from "../../lib/proptech/decarbonationB2bSniper";
import { formaterEntierFr } from "../../lib/proptech/solaireCalculs";

const CSS_IMPRESSION = `
@page { size: A4 portrait; margin: 0; }
@media print {
  html, body { background: #fff !important; }
  body > *:not(#etude-b2b-print-root) { display: none !important; }
  #etude-b2b-print-root {
    position: static !important;
    inset: auto !important;
    display: block !important;
    overflow: visible !important;
    background: #fff !important;
    padding: 0 !important;
  }
  #etude-b2b-print-root .no-print { display: none !important; }
  #etude-b2b-a4 {
    width: 210mm !important;
    min-height: 297mm !important;
    margin: 0 !important;
    box-shadow: none !important;
  }
}
`;

function euros(valeur: number | null): string {
  if (valeur == null) return "Non chiffré";
  return `${formaterEntierFr(valeur)} €`;
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <p className="text-[11px] leading-snug text-slate-800">
      <span className="font-semibold text-slate-950">{label}. </span>
      {valeur}
    </p>
  );
}

function Cadre({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="border border-[#d6cec0] bg-white">
      <h3 className="bg-[#0B1F33] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
        {titre}
      </h3>
      <div className="space-y-1 border-l-[3px] border-[#b08a4a] px-3 py-2">{children}</div>
    </section>
  );
}

interface BlocEtudeDecarbonationProps {
  logement?: SiteProfessionnel | null;
  typeBatiment?: string;
  contexte?: ContexteFicheB2b;
}

export default function BlocEtudeDecarbonation({
  logement = null,
  typeBatiment = "individuel",
  contexte = {},
}: BlocEtudeDecarbonationProps) {
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState("");
  const etude = composerEtudeDecarbonation(logement, typeBatiment, contexte);
  const actif = peutExporterEtudeB2b(etude);

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

  if (!etude) return null;

  const telecharger = () => {
    try {
      telechargerEtudeDecarbonationPdf(etude);
      setErreur("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Export PDF impossible.");
    }
  };

  return (
    <section className="mt-3 rounded-xl border border-sky-400/30 bg-slate-900/80 p-3" data-testid="bloc-decarbonation-b2b">
      <Reglementation etude={etude} />
      <Dispositifs etude={etude} />
      <button
        type="button"
        data-testid="export-etude-decarbonation"
        disabled={!actif}
        onClick={(event) => {
          event.stopPropagation();
          if (!actif) return;
          setOuvert(true);
        }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-300/70 bg-sky-500/90 px-3 py-2.5 text-[12px] font-semibold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
      >
        <span aria-hidden="true">🏭</span>
        Exporter l&apos;Étude Décarbonation &amp; GTB B2B (PDF A4)
      </button>
      {erreur ? <p className="mt-2 text-[11px] text-rose-200">{erreur}</p> : null}
      {ouvert ? <Apercu etude={etude} onFermer={() => setOuvert(false)} onTelecharger={telecharger} /> : null}
    </section>
  );
}

function Reglementation({ etude }: { etude: EtudeDecarbonationB2b }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-200">Réglementation &amp; obligations</p>
      <ul className="mt-2 space-y-2 text-[11px] leading-snug text-slate-200">
        <li>
          <span className="font-semibold text-white">Décret Tertiaire. </span>
          <span className={etude.decretAssujetti ? "text-emerald-200" : "text-amber-200"}>{etude.decretStatut} </span>
          {etude.decretTexte}
        </li>
        <li>
          <span className="font-semibold text-white">Décret BACS. </span>
          <span className={etude.bacsObligatoire ? "text-emerald-200" : "text-amber-200"}>{etude.bacsStatut} </span>
          {etude.bacsTexte}
        </li>
      </ul>
    </div>
  );
}

function Dispositifs({ etude }: { etude: EtudeDecarbonationB2b }) {
  return (
    <div className="mt-3 border-t border-slate-800 pt-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-200">
        Dispositifs CEE &amp; effacement électrique
      </p>
      <ul className="mt-2 space-y-2 text-[11px] leading-snug text-slate-200">
        <li>{etude.batTh116}</li>
        <li>{etude.indUt117}</li>
        <li>
          {etude.solaireTexte}
          {etude.effacementEur != null ? (
            <span className="mt-1 block font-semibold text-amber-100">
              Effacement estimé sur ce site : {euros(etude.effacementEur)} / an.
            </span>
          ) : null}
        </li>
      </ul>
      <p className="mt-2 text-[10px] leading-snug text-slate-400">
        Aides financières 2026 (estimation à titre indicatif). Montants définitifs après instruction des CEE.
      </p>
    </div>
  );
}

function Apercu({
  etude,
  onFermer,
  onTelecharger,
}: {
  etude: EtudeDecarbonationB2b;
  onFermer: () => void;
  onTelecharger: () => void;
}) {
  return createPortal(
    <div
      id="etude-b2b-print-root"
      className="fixed inset-0 z-[5000] flex flex-col bg-slate-950/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-etude-b2b"
    >
      <style>{CSS_IMPRESSION}</style>
      <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <p id="titre-etude-b2b" className="text-sm font-semibold text-white">
            Étude décarbonation &amp; GTB — aperçu A4
          </p>
          <p className="text-[11px] text-slate-300">{etude.reference}</p>
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
            className="rounded-lg bg-sky-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-300"
            onClick={onTelecharger}
          >
            Télécharger le PDF
          </button>
          <button
            type="button"
            className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
            onClick={onFermer}
          >
            Fermer
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <article id="etude-b2b-a4" className="mx-auto flex min-h-[297mm] w-[210mm] flex-col bg-white text-slate-800 shadow-2xl">
          <header className="bg-[#0B1F33] px-8 pb-3 pt-5 text-white">
            <p className="text-[13px] font-bold">ENERGIA CONSEIL IA®</p>
            <p className="mt-1 text-[10px] text-[#d6b36a]">
              Bureau d&apos;études &amp; AMO — Tertiaire, Industrie &amp; Décarbonation CEE
            </p>
            <p className="mt-2 text-[10px] font-semibold">{etude.reference}</p>
          </header>
          <p className="bg-[#F4F0E6] px-6 py-2 text-center text-[11px] font-bold text-[#0B1F33]">
            ÉTUDE DÉCARBONATION &amp; GTB B2B
          </p>
          <div className="space-y-2 px-6 py-3">
            <Cadre titre="1 — Site professionnel">
              <Ligne label="Segment" valeur={etude.segment} />
              <Ligne label="Adresse" valeur={etude.adresse} />
              <Ligne label="Parcelle" valeur={etude.parcelle} />
              <Ligne
                label="Surface"
                valeur={etude.surfaceM2 != null ? `${formaterEntierFr(etude.surfaceM2)} m²` : "Non renseignée"}
              />
              <Ligne label="Activité" valeur={etude.activite} />
              <Ligne label="Chauffage" valeur={`${etude.chauffage} · étiquette ${etude.etiquette}`} />
            </Cadre>
            <Cadre titre="2 — Réglementation et obligations">
              <Ligne label="Décret Tertiaire" valeur={`${etude.decretStatut} ${etude.decretTexte}`} />
              <Ligne label="Décret BACS" valeur={`${etude.bacsStatut} ${etude.bacsTexte}`} />
            </Cadre>
            <Cadre titre="3 — Dispositifs CEE et effacement électrique">
              <Ligne label="BAT-TH-116" valeur={etude.batTh116} />
              <Ligne label="IND-UT-117" valeur={etude.indUt117} />
              <Ligne label="Centrale solaire" valeur={etude.solaireTexte} />
            </Cadre>
            <Cadre titre="4 — Cadrage">
              <Ligne
                label="Remise"
                valeur="Document d'ingénierie ENERGIA CONSEIL IA, à remettre au dirigeant avant devis d'entreprise."
              />
              <Ligne
                label="Aides"
                valeur="Aides financières 2026 (estimation à titre indicatif). Aides à valider selon éligibilité en vigueur. Montants définitifs après instruction CEE."
              />
              <Ligne
                label="Julia"
                valeur="Avis de cadrage établi par Julia, juriste ENERGIA-CONSEIL IA. Aucun engagement de prime."
              />
            </Cadre>
          </div>
          <footer className="mt-auto bg-[#0B1F33] px-8 py-3 text-[8px] leading-relaxed text-slate-200">
            <p>ENERGIA CONSEIL IA® · 16 Rue Cuvier, 69006 Lyon · SIRET 94181942700019</p>
            <p className="mt-0.5">contact@energia-conseil-ia.com | 06 10 59 68 98</p>
            <p className="mt-0.5">
              Sylvain LEMBELEMBE (AMO) · DAMIEN (Commercial) · FABIEN — VIVONS COURTIER · Julia (Juriste) · MAR Antoine
              BARATIER — Cabinet C2ET
            </p>
          </footer>
        </article>
      </div>
    </div>,
    document.body,
  );
}
