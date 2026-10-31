import { CHAMPS_LOGEMENT_REQUIS, LIBELLE_DONNEE_MANQUANTE } from "../../lib/crm/brunelWorkingBase";

const EXTRAS = [
  { id: "dpeActuel", label: "Classe DPE (extraite)" },
  { id: "numeroDpe", label: "N° DPE" },
  { id: "emissionsGes", label: "Émissions GES" },
  { id: "eauChaude", label: "Eau chaude" },
];

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none";

export default function FormulaireLogementDossier({
  logement,
  sources = {},
  extras = {},
  editable = false,
  onChange,
}) {
  const source = logement && typeof logement === "object" ? logement : {};
  const patch = (id, valeur) => onChange?.({ ...source, [id]: valeur === "" ? null : valeur });

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
        Caractéristiques du logement
      </h3>
      <p className="mt-2 text-xs text-slate-500">
        {editable
          ? "Tous les champs sont modifiables. Sauvegarde automatique."
          : `Les champs vides restent « ${LIBELLE_DONNEE_MANQUANTE} ». Seules les valeurs validées par l’administrateur sont recopiées. Aucune donnée d’une autre référence n’est fusionnée.`}
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {CHAMPS_LOGEMENT_REQUIS.map((champ) => {
          const value = source[champ.id];
          const vide = value == null || String(value).trim() === "";
          const meta = sources[champ.id];
          if (editable) {
            return (
              <div key={champ.id}>
                <dt className="text-xs uppercase tracking-wide text-slate-500">{champ.label}</dt>
                <dd>
                  <input
                    className={inputClass}
                    value={value ?? ""}
                    onChange={(event) => patch(champ.id, event.target.value)}
                  />
                </dd>
              </div>
            );
          }
          return (
            <div key={champ.id}>
              <dt className="text-xs uppercase tracking-wide text-slate-500">{champ.label}</dt>
              <dd className={`mt-1 text-sm ${vide ? "text-amber-200" : "text-white"}`}>
                {vide ? LIBELLE_DONNEE_MANQUANTE : String(value)}
              </dd>
              {meta?.sourceDocument ? (
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Source : {meta.sourceDocument}
                  {meta.sourcePage ? ` · p.${meta.sourcePage}` : ""} · confiance {meta.confidence || "—"}
                </p>
              ) : null}
            </div>
          );
        })}
        {EXTRAS.map((champ) => {
          const value = extras[champ.id];
          if (value == null || String(value).trim() === "") return null;
          return (
            <div key={champ.id}>
              <dt className="text-xs uppercase tracking-wide text-slate-500">{champ.label}</dt>
              <dd className="mt-1 text-sm text-white">{String(value)}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
