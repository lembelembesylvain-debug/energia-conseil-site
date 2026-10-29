import { useEffect } from "react";
import { BRANDING } from "../../lib/branding";
import { ficheStrategiqueParCode, type FicheStrategiqueCee } from "../../lib/crm/fichesStrategiquesCee";
import { ratioStrategiqueParCode } from "../../lib/crm/ratiosDirection";
import CartesRatiosDirection from "./CartesRatiosDirection";

const MENTION_AIDES =
  "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels, éligibilité et cours EMMY. Montants définitifs après instruction ANAH et CEE.";

export function PresentationFicheStrategique({
  fiche,
  voirMarges,
}: {
  fiche: FicheStrategiqueCee;
  voirMarges: boolean;
}) {
  const ratio = ratioStrategiqueParCode(fiche.code);
  const badges = [
    { libelle: "Technologie", valeur: fiche.technologie, classe: "border-sky-400/40 bg-sky-500/10 text-sky-100" },
    { libelle: "Économies", valeur: fiche.economies, classe: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100" },
    { libelle: "Prime CEE", valeur: fiche.primeFourchette, classe: "border-amber-400/40 bg-amber-500/10 text-amber-100" },
  ];

  return (
    <article className="mx-auto max-w-5xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
        {BRANDING.nom} — Marque déposée INPI n° {BRANDING.inpi}
      </p>
      <p className="mt-2 font-mono text-xs font-semibold text-amber-100">{fiche.sousTitre}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{fiche.titre}</h2>
      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{fiche.segment}</p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <li key={badge.libelle} className={`rounded-full border px-3 py-1 text-xs font-medium ${badge.classe}`}>
            <span className="mr-1 uppercase tracking-wide opacity-80">{badge.libelle}</span>
            {badge.valeur}
          </li>
        ))}
      </ul>

      {fiche.image ? (
        <img
          src={fiche.image}
          alt={fiche.alt ?? fiche.titre}
          className="mt-5 aspect-video w-full rounded-2xl border border-slate-700 object-cover object-center"
        />
      ) : null}

      <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-100">Principe et fonctionnement</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{fiche.principe}</p>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-100">Équipements majeurs requis</h3>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
          {fiche.equipements.map((ligne) => (
            <li key={ligne}>{ligne}</li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl border border-amber-400/60 bg-amber-500/15 p-4 shadow-lg shadow-amber-950/30">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-50">
          <span aria-hidden>👷 </span>
          Corps d&apos;état et acteurs du métier
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {fiche.corpsEtat.map((acteur) => (
            <li key={acteur} className="rounded-xl border border-amber-300/30 bg-slate-950/50 px-3 py-2 text-sm font-medium text-amber-50">
              {acteur}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-100">Critères d&apos;éligibilité CEE</h3>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
          {fiche.eligibilite.map((ligne) => (
            <li key={ligne}>{ligne}</li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-100">
          Financement indicatif et volume MWh cumac
        </h3>
        <p className="mt-2 font-mono text-lg font-semibold text-amber-200">{fiche.primeFourchette}</p>
        <p className="mt-1 font-mono text-sm text-lime-200">{fiche.volumeCumac}</p>
        {fiche.financement.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-300">
            {fiche.financement.map((ligne) => (
              <li key={ligne}>{ligne}</li>
            ))}
          </ul>
        ) : null}
        <p className="mt-3 text-xs leading-relaxed text-slate-400">{MENTION_AIDES}</p>
      </section>

      {voirMarges && ratio ? (
        <section className="mt-6 rounded-2xl border border-emerald-500/30 bg-slate-950/80 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
            Ratios économiques et marges de direction
          </h3>
          <div className="mt-4">
            <CartesRatiosDirection ratio={ratio} />
          </div>
        </section>
      ) : (
        <p className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-400">
          Le détail de marge de direction est réservé à la vue administrateur.
        </p>
      )}
    </article>
  );
}

type Props = {
  code: string | null;
  onClose: () => void;
  voirMarges?: boolean;
};

export default function FicheStrategieCee({ code, onClose, voirMarges = false }: Props) {
  const fiche = code ? ficheStrategiqueParCode(code) : null;

  useEffect(() => {
    if (!fiche) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fiche, onClose]);

  if (!fiche) return null;

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-slate-950/85 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="titre-fiche-strategie">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-4 py-3 sm:px-6">
        <p id="titre-fiche-strategie" className="text-sm font-medium text-slate-200">
          Fiche technique {fiche.code} — {fiche.segment}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
        >
          ✕ Fermer
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-8">
        <PresentationFicheStrategique fiche={fiche} voirMarges={voirMarges} />
      </div>
    </div>
  );
}
