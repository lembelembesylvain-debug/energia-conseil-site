import type { PosteCalcule, SourcePrix, TauxTva } from "../../lib/chiffrage";
import {
  SOURCES_PRIX,
  TAUX_TVA,
  formatEuro,
  formatUnite,
} from "../../lib/chiffrage";

type Props = {
  lignes: PosteCalcule[];
  onChange: (id: PosteCalcule["id"], patch: Partial<PosteCalcule>) => void;
};

const inputClass =
  "w-full min-w-[4.5rem] rounded border border-slate-300 bg-white px-1.5 py-1 text-right text-xs text-slate-900 focus:border-teal-600 focus:outline-none";

function NumberField({
  value,
  onChange,
  min = 0,
  step = 0.01,
  allowEmpty = false,
  title,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  step?: number;
  allowEmpty?: boolean;
  title?: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={min}
      step={step}
      title={title}
      value={value ?? ""}
      placeholder={allowEmpty ? "À saisir" : "0"}
      onChange={(event) => {
        const raw = event.target.value;
        if (raw === "" && allowEmpty) {
          onChange(null);
          return;
        }
        const parsed = Number(raw);
        onChange(Number.isFinite(parsed) ? parsed : null);
      }}
      className={inputClass}
    />
  );
}

export default function GrillePostesTable({ lignes, onChange }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[96rem] w-full border-collapse text-left text-xs">
        <thead className="bg-[#1a3c5e] text-white">
          <tr>
            <th className="sticky left-0 z-10 bg-[#1a3c5e] px-2 py-2 font-semibold">Inclus</th>
            <th className="sticky left-10 z-10 bg-[#1a3c5e] px-2 py-2 font-semibold">Poste</th>
            <th className="px-2 py-2 font-semibold">Unité</th>
            <th className="px-2 py-2 font-semibold">Qté</th>
            <th className="px-2 py-2 font-semibold">Coût entrant unit. HT</th>
            <th className="px-2 py-2 font-semibold">Entrant total HT</th>
            <th className="px-2 py-2 font-semibold">Aléas %</th>
            <th className="px-2 py-2 font-semibold">Aléas €</th>
            <th className="px-2 py-2 font-semibold">Pilotage %</th>
            <th className="px-2 py-2 font-semibold">Pilotage €</th>
            <th className="px-2 py-2 font-semibold">Frais compl.</th>
            <th className="px-2 py-2 font-semibold">Marge %</th>
            <th className="px-2 py-2 font-semibold">Sortant HT</th>
            <th className="px-2 py-2 font-semibold">TVA</th>
            <th className="px-2 py-2 font-semibold">Sortant TTC</th>
            <th className="px-2 py-2 font-semibold">Source du prix</th>
            <th className="px-2 py-2 font-semibold">Vérifié le</th>
            <th className="px-2 py-2 font-semibold">Commentaire</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne) => {
            const manquant = ligne.inclus && !ligne.prixRenseigne;
            return (
              <tr
                key={ligne.id}
                className={`border-t border-slate-100 ${
                  !ligne.inclus
                    ? "bg-slate-50 text-slate-400"
                    : manquant
                      ? "bg-amber-50"
                      : ligne.dateObsolete
                        ? "bg-orange-50"
                        : "bg-white"
                }`}
              >
                <td className="sticky left-0 z-10 bg-inherit px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={ligne.inclus}
                    onChange={(event) => onChange(ligne.id, { inclus: event.target.checked })}
                    aria-label={`Inclure ${ligne.nom}`}
                  />
                </td>
                <td className="sticky left-10 z-10 max-w-[14rem] bg-inherit px-2 py-1.5 font-medium text-slate-900">
                  {ligne.nom}
                  {ligne.dateObsolete ? (
                    <span className="ml-1 text-[10px] font-semibold uppercase text-orange-700">
                      &gt; 12 mois
                    </span>
                  ) : null}
                </td>
                <td className="px-2 py-1.5 text-slate-600">{formatUnite(ligne.unite)}</td>
                <td className="px-2 py-1.5">
                  <NumberField
                    value={ligne.quantite}
                    onChange={(value) => onChange(ligne.id, { quantite: value ?? 0 })}
                    step={ligne.unite === "forfait" ? 1 : 0.01}
                    title="Quantité"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <NumberField
                    value={ligne.coutEntrantUnitaireHt}
                    onChange={(value) => onChange(ligne.id, { coutEntrantUnitaireHt: value })}
                    allowEmpty
                    title="Coût unitaire HT saisi — jamais inventé par le module"
                  />
                </td>
                <td className="px-2 py-1.5 text-right font-medium">
                  {formatEuro(ligne.coutEntrantTotalHt)}
                </td>
                <td className="px-2 py-1.5">
                  <NumberField
                    value={roundPct(ligne.tauxAleas)}
                    onChange={(value) =>
                      onChange(ligne.id, { tauxAleas: value == null ? 0 : value / 100 })
                    }
                    step={0.1}
                    title="Taux d’aléas en %"
                  />
                </td>
                <td className="px-2 py-1.5 text-right">{formatEuro(ligne.montantAleas)}</td>
                <td className="px-2 py-1.5">
                  <NumberField
                    value={roundPct(ligne.tauxPilotage)}
                    onChange={(value) =>
                      onChange(ligne.id, { tauxPilotage: value == null ? 0 : value / 100 })
                    }
                    step={0.1}
                    title="Taux de pilotage en %"
                  />
                </td>
                <td className="px-2 py-1.5 text-right">{formatEuro(ligne.montantPilotage)}</td>
                <td className="px-2 py-1.5">
                  <NumberField
                    value={ligne.fraisComplementaires}
                    onChange={(value) =>
                      onChange(ligne.id, { fraisComplementaires: value ?? 0 })
                    }
                    title="Frais complémentaires HT"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <NumberField
                    value={roundPct(ligne.tauxMarge)}
                    onChange={(value) =>
                      onChange(ligne.id, { tauxMarge: value == null ? 0 : value / 100 })
                    }
                    step={0.1}
                    title="Marge en % du prix de vente HT"
                  />
                </td>
                <td className="px-2 py-1.5 text-right font-semibold text-slate-900">
                  {formatEuro(ligne.prixSortantHt)}
                </td>
                <td className="px-2 py-1.5">
                  <select
                    value={ligne.tauxTva}
                    onChange={(event) =>
                      onChange(ligne.id, { tauxTva: Number(event.target.value) as TauxTva })
                    }
                    className="rounded border border-slate-300 bg-white px-1 py-1 text-xs"
                  >
                    {TAUX_TVA.map((taux) => (
                      <option key={taux.value} value={taux.value}>
                        {taux.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1.5 text-right font-semibold">
                  {formatEuro(ligne.prixSortantTtc)}
                </td>
                <td className="px-2 py-1.5">
                  <select
                    value={ligne.sourcePrix}
                    onChange={(event) =>
                      onChange(ligne.id, { sourcePrix: event.target.value as SourcePrix })
                    }
                    className="min-w-[11rem] rounded border border-slate-300 bg-white px-1 py-1 text-xs"
                  >
                    {SOURCES_PRIX.map((source) => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="date"
                    value={ligne.dateVerification ?? ""}
                    onChange={(event) =>
                      onChange(ligne.id, {
                        dateVerification: event.target.value || null,
                      })
                    }
                    className="rounded border border-slate-300 px-1 py-1 text-xs"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="text"
                    value={ligne.commentaire}
                    onChange={(event) => onChange(ligne.id, { commentaire: event.target.value })}
                    placeholder="Réf. devis, fournisseur…"
                    className="min-w-[14rem] rounded border border-slate-300 px-1.5 py-1 text-xs"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-slate-100 px-3 py-2 text-[11px] text-slate-500">
        Coût unitaire HT : saisie manuelle obligatoire. Colonnes calculées : entrant total,
        aléas €, pilotage €, sortant HT = coût interne / (1 − marge), TVA, TTC. Une cellule
        « À saisir » n’est pas un tarif ENERGIA.
      </p>
    </div>
  );
}

function roundPct(taux: number): number {
  return Math.round(taux * 10000) / 100;
}
