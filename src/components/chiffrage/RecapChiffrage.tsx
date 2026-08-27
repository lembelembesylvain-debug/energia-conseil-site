import type { AvertissementChiffrage, TotauxChiffrage } from "../../lib/chiffrage";
import { formatEuro, formatPct } from "../../lib/chiffrage";

type Props = {
  totaux: TotauxChiffrage;
  avertissements: AvertissementChiffrage[];
  tvaWarning: string;
};

function couchesPrix(totaux: TotauxChiffrage) {
  return [
    {
      label: "1. Coûts entrants artisans HT",
      hint: "Prestations des entreprises (déplacements compris uniquement s’ils figurent déjà au devis)",
      value: totaux.totalEntrantHt,
    },
    {
      label: "2. Déplacements artisans non inclus",
      hint: "Ajoutés seulement si le devis n’indique pas « déplacement compris »",
      value: totaux.totalDeplacementsArtisansAjoutesHt,
    },
    {
      label: "3. Aléas techniques",
      hint: "Taux appliqué aux postes techniques",
      value: totaux.totalAleas,
    },
    {
      label: "4. Fournitures complémentaires",
      hint: "Frais complémentaires saisis sur les lignes",
      value: totaux.totalFraisComplementaires,
    },
    {
      label: "5. Déplacements ENERGIA CONSEIL IA®",
      hint: "Visites et suivi depuis la base ENERGIA",
      value: totaux.totalDeplacementsEnergiaHt,
    },
    {
      label: "6. Frais administratifs / structure",
      hint: "Frais globaux de structure",
      value: totaux.totalFraisStructure,
    },
    {
      label: "7. Pilotage et coordination",
      hint: "Taux de pilotage des postes",
      value: totaux.totalPilotage,
    },
    {
      label: "8. Marge commerciale",
      hint: "% du prix de vente HT — prix = coût interne / (1 − taux), pas une majoration",
      value: totaux.totalMargeEuros,
    },
    {
      label: "9. Tarif sortant HT",
      hint: "Coût interne / (1 − taux de marge)",
      value: totaux.totalSortantHt,
      accent: true,
    },
    {
      label: "10. TVA applicable",
      hint: "Taux à confirmer selon les travaux",
      value: totaux.totalTva,
    },
    {
      label: "11. Tarif sortant TTC",
      hint: "Prix client TTC indicatif",
      value: totaux.totalSortantTtc,
      accent: true,
    },
  ];
}

const NIVEAU_CLASS = {
  info: "border-sky-200 bg-sky-50 text-sky-950",
  warning: "border-amber-300 bg-amber-50 text-amber-950",
  critique: "border-red-400 bg-red-50 text-red-950",
};

export default function RecapChiffrage({ totaux, avertissements, tvaWarning }: Props) {
  const aucunPrix = totaux.nbPostesPrixRenseignes === 0 && totaux.totalDeplacementsAjoutesHt === 0;
  const masque = aucunPrix;

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1a3c5e]">Construction du prix</h2>
        <p className="mt-1 text-sm text-slate-600">
          Coût interne = artisans + déplacements non inclus + fournitures + aléas +
          déplacements ENERGIA + structure + pilotage. Puis prix HT = coût interne /
          (1 − marge). Les aides restent séparées.
        </p>

        {masque ? (
          <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            Aucun total n’est affiché : saisissez d’abord un coût entrant (devis,
            tarif fournisseur, estimation de marché ou hypothèse provisoire). Le module
            n’invente aucun tarif.
          </p>
        ) : !totaux.budgetAffichable ? (
          <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            Totaux indicatifs uniquement : aucun devis sous-traitant ni tarif
            fournisseur vérifié. Ce n’est pas un budget de référence.
          </p>
        ) : null}
        {masque ? null : (
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            {couchesPrix(totaux).map((couche) => (
              <div
                key={couche.label}
                className={`rounded-lg border px-3 py-2 ${
                  couche.accent ? "border-teal-300 bg-teal-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {couche.label}
                </dt>
                <dd className="text-lg font-bold text-slate-900">{formatEuro(couche.value)}</dd>
                <p className="text-[11px] text-slate-500">{couche.hint}</p>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <p>
            Frais complémentaires (lignes) :{" "}
            <strong>{masque ? "—" : formatEuro(totaux.totalFraisComplementaires)}</strong>
          </p>
          <p>
            Marge réelle / prix de vente HT :{" "}
            <strong>{masque ? "—" : formatPct(totaux.tauxMargeReel)}</strong>
          </p>
          <p>
            Postes inclus / prix renseignés / vérifiés :{" "}
            <strong>
              {totaux.nbPostesInclus} / {totaux.nbPostesPrixRenseignes} / {totaux.nbPostesVerifies}
            </strong>
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-orange-300 bg-[#fff7ed] p-4">
        <p className="text-sm font-medium text-orange-950">{tvaWarning}</p>
      </div>

      {avertissements.length > 0 ? (
        <ul className="space-y-2">
          {avertissements.map((avis) => (
            <li
              key={avis.id}
              className={`rounded-lg border px-3 py-2 text-sm ${NIVEAU_CLASS[avis.niveau]}`}
            >
              {avis.message}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
