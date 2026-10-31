import { euro } from "../../lib/crm/mockData";
import {
  MENTION_AIDES_EDITION,
  PROFILS_ANAH,
  REGIONS_AIDES_LOCALES,
  calculerAidesIndicatives,
} from "../../lib/crm/editionDossier";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none";
const labelClass = "text-xs font-medium uppercase tracking-wide text-slate-500";

export default function AidesIndicativesEdition({ edition, onChange, editable, peutEcraser = false }) {
  const aides = calculerAidesIndicatives(edition);
  const patchAides = (partial) => onChange?.({ ...edition.aides, ...partial });
  const patchOverride = (cle, valeur) => {
    const n = valeur === "" ? null : Number(String(valeur).replace(",", "."));
    patchAides({
      overrides: {
        ...edition.aides.overrides,
        [cle]: Number.isFinite(n) ? n : null,
      },
    });
  };

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm font-medium text-amber-200">
        {aides.verrouillageOfficiel
          ? aides.mention
          : edition?.mentionsJuridiques?.find((m) => /aides financières 2026/i.test(m)) || MENTION_AIDES_EDITION}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className={labelClass} htmlFor="profil-anah">
          Profil Anah 2026
          <select
            id="profil-anah"
            className={inputClass}
            disabled={!editable}
            value={edition.aides.profil}
            onChange={(event) => patchAides({ profil: event.target.value })}
          >
            <option value="">Sélectionner…</option>
            {PROFILS_ANAH.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass} htmlFor="parcours-mpr">
          Parcours
          <select
            id="parcours-mpr"
            className={inputClass}
            disabled={!editable}
            value={edition.aides.parcours}
            onChange={(event) => patchAides({ parcours: event.target.value })}
          >
            <option value="parcours">Parcours Accompagné</option>
            <option value="geste">Geste par geste</option>
          </select>
        </label>
        <label className={labelClass} htmlFor="gain-classes">
          Gain de classes (Parcours)
          <select
            id="gain-classes"
            className={inputClass}
            disabled={!editable || edition.aides.parcours !== "parcours"}
            value={edition.aides.gainClasses}
            onChange={(event) => patchAides({ gainClasses: Number(event.target.value) })}
          >
            <option value={2}>2 classes</option>
            <option value={3}>3 classes et +</option>
          </select>
        </label>
        <label className={labelClass} htmlFor="region-aides">
          Région (aides locales manuelles)
          <select
            id="region-aides"
            className={inputClass}
            disabled={!editable}
            value={edition.aides.region}
            onChange={(event) => patchAides({ region: event.target.value })}
          >
            <option value="">Non renseignée</option>
            {REGIONS_AIDES_LOCALES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-slate-500">
            0,00 € par défaut — saisie manuelle validée uniquement.
          </span>
        </label>
      </div>

      {!aides.calculable ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Choisissez un profil Anah et ajoutez des travaux pour obtenir une estimation indicative.
        </p>
      ) : (
        <div className="space-y-2">
          {aides.verrouillageOfficiel ? (
            <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              {aides.clauseIndivision}
            </p>
          ) : null}
          {[
            { cle: "mpr", label: aides.libelleMpr || "MaPrimeRénov’ Parcours Accompagné", value: aides.mpr, ecrasable: !aides.verrouillageOfficiel },
            {
              cle: "cee",
              label: aides.libelleCee || "Primes CEE estimées",
              value: aides.cee,
              ecrasable: !aides.verrouillageOfficiel && edition.aides.parcours === "geste",
              mention: aides.mentionCee,
            },
            ...(aides.verrouillageOfficiel && !aides.coupDePouce
              ? []
              : [
                  {
                    cle: "coupDePouce",
                    label: "Coup de pouce",
                    value: aides.coupDePouce,
                    ecrasable: !aides.verrouillageOfficiel && edition.aides.parcours === "geste",
                    mention: aides.verrouillageOfficiel ? null : aides.mentionCee,
                  },
                ]),
            { cle: "locales", label: aides.libelleLocales || (aides.verrouillageOfficiel ? "Aide Région Auvergne-Rhône-Alpes" : "Aides locales"), value: aides.locales, ecrasable: !aides.verrouillageOfficiel },
            ...(aides.mar
              ? [{ cle: "mar", label: aides.libelleMar || "Prestation MAR remboursée (80 % × plafond 2 000 €)", value: aides.mar, ecrasable: false }]
              : []),
          ].map((ligne) => (
            <div
              key={ligne.cle}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3"
            >
              <div>
                <p className="text-sm text-slate-200">{ligne.label}</p>
                {ligne.mention ? <p className="mt-0.5 text-[11px] text-amber-200/90">{ligne.mention}</p> : null}
              </div>
              {peutEcraser && editable && ligne.ecrasable ? (
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="w-36 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-right text-sm text-emerald-200"
                  value={edition.aides.overrides?.[ligne.cle] ?? ligne.value}
                  onChange={(event) => patchOverride(ligne.cle, event.target.value)}
                />
              ) : (
                <p className="text-sm font-semibold text-emerald-200">{euro(ligne.value)}</p>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-100">Total aides (indicatif)</p>
            <p className="text-lg font-semibold text-white">{euro(aides.totalAides)}</p>
          </div>
          {aides.verrouillageOfficiel ? (
            <p className="text-xs text-slate-400">
              Reste à charge net client : {euro(Math.max(0, (aides.totalTtc || 0) - (aides.totalAides || 0)))} TTC.
            </p>
          ) : null}
          {aides.ecrete ? (
            <p className="text-xs text-amber-200">
              Écrêtement appliqué : le cumul des aides ne peut pas dépasser le plafond TTC du profil.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
