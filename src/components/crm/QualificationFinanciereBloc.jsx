import {
  DECISIONNAIRES,
  ORIGINES_FONDS,
  STATUTS_FAISABILITE,
  analyserEcartBudget,
  euroParade,
  libelleStatut,
  qualificationComplete,
} from "../../lib/crm/paradesAntiFuite";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none";
const labelClass = "text-xs font-medium uppercase tracking-wide text-slate-500";

function toneStatut(id) {
  if (id === "qualifie_solvable") return "border-emerald-400/50 bg-emerald-500/15 text-emerald-100";
  if (id === "budget_recadrer") return "border-amber-400/50 bg-amber-500/15 text-amber-100";
  if (id === "touriste") return "border-red-400/50 bg-red-500/15 text-red-100";
  return "border-slate-600 bg-slate-800 text-slate-300";
}

export function BadgeEcartBudget({ budgetMaxTtc, montantChiffreTtc, statutFaisabilite }) {
  const analyse = analyserEcartBudget(budgetMaxTtc, montantChiffreTtc);
  const touriste = statutFaisabilite === "touriste";
  if (!analyse.alerte && !touriste && statutFaisabilite !== "budget_recadrer") return null;

  const severe = analyse.severe || (touriste && analyse.alerte);
  const classe = severe
    ? "border-red-400/60 bg-red-500/15 text-red-50"
    : "border-orange-400/60 bg-orange-500/15 text-orange-50";

  let message = libelleStatut(statutFaisabilite);
  if (analyse.alerte) {
    const pct = Math.round(analyse.ecartPct * 100);
    message = `Chiffrage ${euroParade(montantChiffreTtc)} — dépassement de ${pct} % au-dessus du budget qualifié ${euroParade(budgetMaxTtc)}. Appel de recadrage oral avant tout envoi.`;
  } else if (touriste) {
    message = "Touriste / Risque élevé — protéger l'étude par la convention d'ingénierie avant d'envoyer un scénario.";
  } else if (statutFaisabilite === "budget_recadrer") {
    message = "Budget à recadrer — valider l'enveloppe à l'oral avant l'envoi du devis.";
  }

  return (
    <p
      data-testid="badge-ecart-budget"
      className={`rounded-xl border px-3 py-2 text-sm font-semibold leading-snug ${classe}`}
      role="status"
    >
      {message}
    </p>
  );
}

export default function QualificationFinanciereBloc({
  qualification,
  onChange,
  editable = true,
  montantChiffreTtc = 0,
}) {
  const valeur = qualification || {};
  const complete = qualificationComplete(valeur);
  const patch = (champ, suivant) => {
    const next = { ...valeur, [champ]: suivant };
    if (qualificationComplete(next) && !next.qualifieLe) {
      next.qualifieLe = new Date().toISOString().slice(0, 10);
    }
    onChange?.(next);
  };

  return (
    <section
      data-testid="qualification-financiere"
      className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Parade anti-fuite · avant chiffrage
          </p>
          <h3 className="mt-1 font-serif text-lg text-white">Qualification financière obligatoire</h3>
          <p className="mt-1 text-xs text-slate-400">
            Budget, origine des fonds et décisionnaires sont requis pour ouvrir le chiffrage.
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${toneStatut(valeur.statutFaisabilite)}`}>
          {complete ? libelleStatut(valeur.statutFaisabilite) || "Qualifié" : "Non qualifié"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className={labelClass} htmlFor="qualif-budget">
          Budget maximum client validé (€ TTC)
          <input
            id="qualif-budget"
            data-testid="qualif-budget"
            type="number"
            min="0"
            step="100"
            disabled={!editable}
            className={inputClass}
            value={valeur.budgetMaxTtc ?? ""}
            onChange={(event) => patch("budgetMaxTtc", event.target.value)}
          />
        </label>
        <label className={labelClass} htmlFor="qualif-fonds">
          Origine des fonds
          <select
            id="qualif-fonds"
            data-testid="qualif-fonds"
            disabled={!editable}
            className={inputClass}
            value={valeur.origineFonds ?? ""}
            onChange={(event) => patch("origineFonds", event.target.value)}
          >
            <option value="">Choisir…</option>
            {ORIGINES_FONDS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass} htmlFor="qualif-decision">
          Décisionnaires validés
          <select
            id="qualif-decision"
            data-testid="qualif-decision"
            disabled={!editable}
            className={inputClass}
            value={valeur.decisionnaires ?? ""}
            onChange={(event) => patch("decisionnaires", event.target.value)}
          >
            <option value="">Choisir…</option>
            {DECISIONNAIRES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass} htmlFor="qualif-statut">
          Statut de faisabilité financière
          <select
            id="qualif-statut"
            data-testid="qualif-statut"
            disabled={!editable}
            className={inputClass}
            value={valeur.statutFaisabilite ?? ""}
            onChange={(event) => patch("statutFaisabilite", event.target.value)}
          >
            <option value="">Choisir…</option>
            {STATUTS_FAISABILITE.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3">
        <BadgeEcartBudget
          budgetMaxTtc={valeur.budgetMaxTtc}
          montantChiffreTtc={montantChiffreTtc}
          statutFaisabilite={valeur.statutFaisabilite}
        />
      </div>
    </section>
  );
}
