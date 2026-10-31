import { useMemo, useState } from "react";
import { lireEditionStockee } from "../../lib/crm/editionDossier";
import { calculerDoubleOption, euroParade, lireParades, phasageVide } from "../../lib/crm/paradesAntiFuite";

export default function PhasageEtancheChantier({ lignes = [], phasage, editable = false, onPhasage }) {
  const [revelerInterne, setRevelerInterne] = useState(false);
  const calcul = useMemo(() => calculerDoubleOption(lignes, phasage, { masquerPhase2: true }), [lignes, phasage]);
  const accord = Boolean(phasage?.accordAnahNotifie);
  const montantVisible = accord || revelerInterne;

  return (
    <section data-testid="phasage-etanche" className="space-y-3 rounded-2xl border border-emerald-500/30 bg-slate-950/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Phasage étanche · rénovation globale
          </p>
          <h3 className="mt-1 font-serif text-lg text-white">Lot Anah et lot gros œuvre</h3>
          <p className="mt-1 max-w-3xl text-xs text-slate-400">
            Le devis déposé pour la subvention ne porte que sur la Phase 1. L&apos;avenant de Phase 2 est présenté
            après la notification d&apos;accord de l&apos;Anah.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs text-emerald-100">
          <input
            type="checkbox"
            disabled={!editable}
            checked={accord}
            onChange={(event) => onPhasage?.({ ...phasage, accordAnahNotifie: event.target.checked })}
          />
          Notification d&apos;accord Anah reçue
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-emerald-400/40 bg-[#f0fdf4] p-4 text-slate-900">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800">Phase 1 — devis Anah</p>
          <p className="mt-1 text-sm">Lot énergétique aidé, déposé pour la subvention.</p>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-emerald-950" data-testid="montant-phase-1">
            {euroParade(calcul.phase1.total)}
          </p>
          <p className="text-xs text-emerald-900">{calcul.phase1.lots.length} lot(s) au devis initial</p>
        </article>
        <article className="rounded-2xl border border-sky-400/40 bg-[#f0f9ff] p-4 text-slate-900">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-900">Phase 2 — avenant</p>
          <p className="mt-1 text-sm">Gros œuvre et travaux non aidés.</p>
          {montantVisible ? (
            <p className="mt-3 text-2xl font-semibold tabular-nums text-sky-950" data-testid="montant-phase-2">
              {euroParade(calcul.phase2.total)}
            </p>
          ) : (
            <p className="mt-3 text-lg font-semibold text-slate-700" data-testid="montant-phase-2-masque">
              Montant masqué
            </p>
          )}
          <p className="text-xs text-sky-950">
            {calcul.phase2.lots.length} lot(s)
            {accord
              ? " — avenant ouvrable"
              : " — affiché uniquement après notification d'accord Anah"}
          </p>
          {!accord && calcul.phase2.lots.length > 0 ? (
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-sky-800 underline-offset-2 hover:underline"
              onClick={() => setRevelerInterne((v) => !v)}
            >
              {revelerInterne ? "Masquer le montant interne" : "Afficher le montant en interne"}
            </button>
          ) : null}
        </article>
      </div>
    </section>
  );
}

export function SynthesePhasagePipeline({ dossiers = [] }) {
  const lignes = useMemo(() => {
    return (dossiers || [])
      .map((dossier) => {
        const edition = lireEditionStockee(dossier.id);
        const parades = lireParades(dossier.id);
        const phasage = edition?.phasage || parades.phasage || phasageVide();
        const source =
          (Array.isArray(edition?.travaux) && edition.travaux.length > 0 && edition.travaux) ||
          (Array.isArray(dossier.travaux) && dossier.travaux.length > 0 && dossier.travaux) ||
          parades.lots;
        if (!source?.length) return null;
        const calcul = calculerDoubleOption(source, phasage, { masquerPhase2: true });
        if (calcul.phase2.lots.length === 0 && !phasage?.accordAnahNotifie) return null;
        return { dossier, calcul, accord: Boolean(phasage?.accordAnahNotifie) };
      })
      .filter(Boolean);
  }, [dossiers]);

  return (
    <section data-testid="synthese-phasage-pipeline" className="mb-6 rounded-2xl border border-emerald-500/30 bg-slate-900/70 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
        Pipeline rénovation globale
      </p>
      <h2 className="mt-1 font-serif text-xl text-white">Phasage étanche Anah / gros œuvre</h2>
      <p className="mt-2 max-w-3xl text-sm text-slate-400">
        Phase 1 : lot énergétique aidé, seul montant du devis déposé. Phase 2 : avenant de gros œuvre et travaux
        non aidés, présenté après la notification d&apos;accord de l&apos;Anah.
      </p>
      {lignes.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          Aucun lot mixte encore affecté. Le montant de Phase 2 reste masqué sur chaque devis Anah initial.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {lignes.map(({ dossier, calcul, accord }) => (
            <li key={dossier.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
              <div>
                <p className="font-medium text-white">{dossier.nom || dossier.client || "Dossier"}</p>
                <p className="text-xs text-slate-400">
                  {calcul.phase1.lots.length === 0
                    ? "Aucun lot énergétique aidé sur le devis Anah"
                    : `Phase 1 Anah ${euroParade(calcul.phase1.total)}`}
                  {" · Phase 2 "}
                  {calcul.phase2.lots.length === 0
                    ? "aucun lot"
                    : accord
                      ? euroParade(calcul.phase2.total)
                      : "montant masqué"}
                </p>
              </div>
              <span className="rounded-full border border-emerald-400/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                {accord ? "Accord Anah notifié" : "Devis Anah sans Phase 2"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
