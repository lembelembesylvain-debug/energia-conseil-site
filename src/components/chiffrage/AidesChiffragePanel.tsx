import type { AideEstimative, RecapAides } from "../../lib/chiffrage";
import { DISCLAIMERS_AIDES, formatEuro } from "../../lib/chiffrage";

type Props = {
  aides: AideEstimative[];
  recap: RecapAides;
  budgetAffichable: boolean;
  onChange: (id: string, patch: Partial<AideEstimative>) => void;
};

export default function AidesChiffragePanel({
  aides,
  recap,
  budgetAffichable,
  onChange,
}: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[#1a3c5e]">Aides financières (séparées du prix des travaux)</h2>
      <p className="mt-1 text-sm text-slate-600">
        Une aide n’est jamais présentée comme garantie. Saisir un montant retenu uniquement
        pour la simulation, après vérification des conditions.
      </p>
      <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-slate-600">
        {DISCLAIMERS_AIDES.map((texte) => (
          <li key={texte}>{texte}</li>
        ))}
      </ul>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[72rem] w-full border-collapse text-left text-xs">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-2 py-2">Aide estimative</th>
              <th className="px-2 py-2">Organisme</th>
              <th className="px-2 py-2">Conditions à vérifier</th>
              <th className="px-2 py-2">Validité</th>
              <th className="px-2 py-2">Montant estimatif</th>
              <th className="px-2 py-2">Montant retenu</th>
              <th className="px-2 py-2">Commentaire</th>
            </tr>
          </thead>
          <tbody>
            {aides.map((aide) => (
              <tr key={aide.id} className="border-t border-slate-100 align-top">
                <td className="px-2 py-2 font-medium text-slate-900">{aide.libelle}</td>
                <td className="px-2 py-2">{aide.organisme}</td>
                <td className="px-2 py-2 text-slate-600">{aide.conditionsAVerifier}</td>
                <td className="px-2 py-2">
                  <input
                    type="date"
                    value={aide.dateValidite}
                    onChange={(event) => onChange(aide.id, { dateValidite: event.target.value })}
                    className="rounded border border-slate-300 px-1 py-1"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="À saisir"
                    value={aide.montantEstimatif ?? ""}
                    onChange={(event) =>
                      onChange(aide.id, {
                        montantEstimatif:
                          event.target.value === "" ? null : Number(event.target.value),
                      })
                    }
                    className="w-28 rounded border border-slate-300 px-1.5 py-1 text-right"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={aide.montantRetenu || ""}
                    onChange={(event) =>
                      onChange(aide.id, {
                        montantRetenu: event.target.value === "" ? 0 : Number(event.target.value),
                      })
                    }
                    className="w-28 rounded border border-slate-300 px-1.5 py-1 text-right"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={aide.commentaire}
                    onChange={(event) => onChange(aide.id, { commentaire: event.target.value })}
                    className="min-w-[12rem] w-full rounded border border-slate-300 px-1.5 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-[11px] uppercase text-slate-500">Total estimatif</p>
          <p className="text-lg font-bold">{formatEuro(recap.totalEstimatif)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-[11px] uppercase text-slate-500">Total retenu (simulation)</p>
          <p className="text-lg font-bold">{formatEuro(recap.totalRetenu)}</p>
          {recap.plafondApplique ? (
            <p className="text-[11px] text-red-800">
              Plafonné au coût des travaux (saisi : {formatEuro(recap.totalRetenuSaisi)}).
            </p>
          ) : null}
        </div>
        <div
          className={`rounded-lg border px-3 py-2 ${
            recap.aidesSuperieuresAuxTravaux
              ? "border-red-400 bg-red-50"
              : "border-teal-200 bg-teal-50"
          }`}
        >
          <p className="text-[11px] uppercase text-slate-500">Reste à charge estimatif</p>
          <p className="text-lg font-bold">
            {recap.resteAChargeEstimatif == null
              ? "Non calculable — saisir d’abord les coûts des travaux"
              : formatEuro(recap.resteAChargeEstimatif)}
          </p>
          {!budgetAffichable && recap.resteAChargeEstimatif != null ? (
            <p className="text-[11px] text-amber-800">Estimatif : aucun tarif vérifié.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
