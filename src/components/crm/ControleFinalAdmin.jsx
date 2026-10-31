import { listerControlesFinaux, actionsControleFinal, MENTION_PAS_DE_GARANTIE } from "../../lib/crm/controleFinal";
import { peutValiderDossier } from "../../lib/crm/roles";

export default function ControleFinalAdmin({ dossier, etatImport, role, onBrouillon, onValider }) {
  const admin = peutValiderDossier(role);
  if (!admin) return null;
  const base = dossier?.workingBase;
  const champs = etatImport?.champs || [];
  const documents = etatImport?.documents || [];
  const controles = listerControlesFinaux({
    base,
    champs,
    documents,
    role,
    dossier,
  });
  const actions = actionsControleFinal(controles);

  return (
    <section className="mt-6 rounded-2xl border border-orange-500/40 bg-orange-500/10 p-4">
      <h3 className="text-sm font-semibold text-orange-100">Contrôle final administrateur</h3>
      <p className="mt-2 text-xs text-orange-50/90">{MENTION_PAS_DE_GARANTIE}</p>

      <dl className="mt-4 grid gap-2 text-xs text-slate-200 sm:grid-cols-2">
        <div>
          <dt className="uppercase tracking-wide text-slate-500">Client</dt>
          <dd>{base?.client?.nom} — {base?.client?.codePostal} {base?.client?.ville}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide text-slate-500">DPE</dt>
          <dd>{base?.logement?.dpeFourni || base?.logementExtras?.dpeActuel || "non renseigné"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide text-slate-500">Travaux proposés</dt>
          <dd>{(base?.travauxProposes || []).length} ligne(s) — aucune ferme</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide text-slate-500">Contradictions</dt>
          <dd>{champs.filter((c) => c.status === "conflicting").length}</dd>
        </div>
      </dl>

      <ul className="mt-3 max-h-40 space-y-1 overflow-auto text-xs text-orange-50/80">
        {controles.raisons.map((raison) => (
          <li key={raison}>• {raison}</li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBrouillon}
          className="rounded-xl border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100"
        >
          Enregistrer comme brouillon
        </button>
        <button
          type="button"
          onClick={onValider}
          className="rounded-xl border border-emerald-500/50 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100"
        >
          Valider les données
        </button>
        <button type="button" disabled title={actions.motifs.genererDevisEstimatif} className="cursor-not-allowed rounded-xl border border-slate-800 px-3 py-2 text-xs text-slate-500">
          Générer un devis estimatif
        </button>
        <button type="button" disabled title={actions.motifs.genererEtudePreparatoire} className="cursor-not-allowed rounded-xl border border-slate-800 px-3 py-2 text-xs text-slate-500">
          Générer l’étude préparatoire
        </button>
        <button type="button" disabled title={actions.motifs.genererRapport} className="cursor-not-allowed rounded-xl border border-slate-800 px-3 py-2 text-xs text-slate-500">
          Générer le rapport
        </button>
        <button type="button" disabled title={actions.motifs.transmettre} className="cursor-not-allowed rounded-xl border border-slate-800 px-3 py-2 text-xs text-slate-500">
          Transmettre au client
        </button>
      </div>
    </section>
  );
}
