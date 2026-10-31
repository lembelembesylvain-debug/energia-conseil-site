import { useMemo, useState } from "react";
import { euro } from "../../lib/crm/mockData";
import { MENTION_AIDES_BRUNEL_MARCHE, TOTAUX_OPTION_BAIE } from "../../lib/crm/brunelMarcheOfficiel2026";
import {
  BAREME_RFR_2026_HORS_IDF,
  FOYER_BRUNEL_BAREME_MAR,
  PLAFONDS_PARCOURS_ACCOMPAGNE_HT,
  PRISE_EN_CHARGE_MAR_2026,
  TAUX_TRAVAUX_PARCOURS_2026,
  TEXTE_ECO_PTZ_BRUNEL,
  profilDepuisRfrHorsIdf,
  seuilsRfrHorsIdf,
} from "../../lib/crm/operationnelCrm";

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none";

function ligneProfil(id) {
  return TAUX_TRAVAUX_PARCOURS_2026.find((item) => item.id === id);
}

function ligneMar(id) {
  return PRISE_EN_CHARGE_MAR_2026.profils.find((item) => item.id === id);
}

export default function BaremeAnahMar2026({ afficherEcoPtz = false }) {
  const [personnes, setPersonnes] = useState(FOYER_BRUNEL_BAREME_MAR.personnes);
  const [rfr, setRfr] = useState("");
  const seuils = useMemo(() => seuilsRfrHorsIdf(personnes), [personnes]);
  const profilSimule = rfr === "" ? null : profilDepuisRfrHorsIdf(rfr, personnes);
  const travauxSimule = ligneProfil(profilSimule);
  const marSimule = ligneMar(profilSimule);

  return (
    <div className="space-y-4" data-testid="bareme-anah-2026-mar">
      <div className="rounded-xl border border-violet-400/50 bg-violet-500/15 p-4" data-testid="brunel-profil-violet">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-200">Dossier Brunel — barème MAR 2026</p>
        <p className="mt-2 text-sm font-semibold text-white">{FOYER_BRUNEL_BAREME_MAR.libelle}</p>
        <p className="mt-1 text-xs text-violet-100">
          Profil retenu par Antoine Baratier — Cabinet C2ET. Plafond dépenses éligibles scénario n°3 (saut de 4 classes, G → C) :{" "}
          {euro(PLAFONDS_PARCOURS_ACCOMPAGNE_HT.troisClassesOuPlus)} HT. Taux Violet 45 % HT — subvention travaux{" "}
          {euro(TOTAUX_OPTION_BAIE.subventionAnah)}. Prise en charge MAR 40 % : aide {euro(800)}, reste à charge {euro(1200)} TTC.
        </p>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Plafonds de ressources 2026 — hors Île-de-France
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-200">
            <thead className="text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-2 py-1">Foyer</th>
                <th className="px-2 py-1">Bleu</th>
                <th className="px-2 py-1">Jaune</th>
                <th className="px-2 py-1">Violet</th>
                <th className="px-2 py-1">Rose</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((n) => {
                const row = BAREME_RFR_2026_HORS_IDF[n];
                const actif = Number(personnes) === n;
                return (
                  <tr key={n} className={actif ? "bg-violet-500/15" : ""}>
                    <td className="px-2 py-1">{n} personne{n > 1 ? "s" : ""}</td>
                    <td className="px-2 py-1">≤ {euro(row.bleu)}</td>
                    <td className="px-2 py-1">≤ {euro(row.jaune)}</td>
                    <td className="px-2 py-1">≤ {euro(row.violet)}</td>
                    <td className="px-2 py-1">&gt; {euro(row.violet)}</td>
                  </tr>
                );
              })}
              <tr>
                <td className="px-2 py-1">Personne supplémentaire</td>
                <td className="px-2 py-1">+ {euro(BAREME_RFR_2026_HORS_IDF.parPersonneSupplementaire.bleu)}</td>
                <td className="px-2 py-1">+ {euro(BAREME_RFR_2026_HORS_IDF.parPersonneSupplementaire.jaune)}</td>
                <td className="px-2 py-1" colSpan={2}>
                  + {euro(BAREME_RFR_2026_HORS_IDF.parPersonneSupplementaire.violet)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-slate-400">
            Personnes au foyer
            <input
              className={`${inputClass} mt-1`}
              type="number"
              min={1}
              max={12}
              value={personnes}
              onChange={(event) => setPersonnes(event.target.value)}
            />
          </label>
          <label className="text-xs text-slate-400">
            RFR à simuler (€)
            <input
              className={`${inputClass} mt-1`}
              inputMode="decimal"
              value={rfr}
              placeholder="Saisie indicative"
              onChange={(event) => setRfr(event.target.value)}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-300">
          Plafonds du foyer saisi : Bleu ≤ {euro(seuils.bleu)} · Jaune ≤ {euro(seuils.jaune)} · Violet ≤ {euro(seuils.violet)} · Rose &gt; {euro(seuils.violet)}.
          {profilSimule ? (
            <>
              {" "}
              Simulation : <strong className="text-white">{ligneProfil(profilSimule)?.label}</strong>
              {travauxSimule ? ` — travaux ${Math.round(travauxSimule.tauxHt * 100)} % HT, écrêtement ${Math.round(travauxSimule.ecretementTtc * 100)} % TTC.` : ""}
              {marSimule ? ` MAR : aide ${euro(marSimule.aide)}, reste à charge ${euro(marSimule.resteACharge)} TTC.` : ""}
            </>
          ) : (
            " Le profil officiel du dossier Brunel reste Violet, indépendamment de cette simulation."
          )}
        </p>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Parcours accompagné 2026 — travaux et prestation MAR
        </p>
        <p className="mt-2 text-xs text-slate-300">
          Plafond de dépenses éligibles : {euro(PLAFONDS_PARCOURS_ACCOMPAGNE_HT.deuxClasses)} HT pour 2 classes,{" "}
          {euro(PLAFONDS_PARCOURS_ACCOMPAGNE_HT.troisClassesOuPlus)} HT pour 3 classes ou plus. Prestation MAR plafonnée à{" "}
          {euro(PRISE_EN_CHARGE_MAR_2026.plafondTtc)} TTC.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-xs text-slate-200">
            <thead className="text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-2 py-1">Profil</th>
                <th className="px-2 py-1">Travaux</th>
                <th className="px-2 py-1">Écrêtement</th>
                <th className="px-2 py-1">MAR</th>
                <th className="px-2 py-1">RAC MAR</th>
              </tr>
            </thead>
            <tbody>
              {TAUX_TRAVAUX_PARCOURS_2026.map((row) => {
                const mar = ligneMar(row.id);
                const brunel = row.id === "violet";
                return (
                  <tr key={row.id} className={brunel ? "bg-violet-500/15" : ""}>
                    <td className="px-2 py-1">{row.label}</td>
                    <td className="px-2 py-1">{Math.round(row.tauxHt * 100)} % HT</td>
                    <td className="px-2 py-1">{Math.round(row.ecretementTtc * 100)} % TTC</td>
                    <td className="px-2 py-1">{euro(mar.aide)}</td>
                    <td className="px-2 py-1">{euro(mar.resteACharge)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-amber-100">{MENTION_AIDES_BRUNEL_MARCHE}</p>
      </div>

      {afficherEcoPtz ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4" data-testid="encadre-eco-ptz-brunel">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Éco-PTZ à 0 %</p>
          <p className="mt-2 text-sm leading-relaxed text-emerald-50">{TEXTE_ECO_PTZ_BRUNEL}</p>
          <p className="mt-2 text-xs text-amber-100">{MENTION_AIDES_BRUNEL_MARCHE}</p>
        </div>
      ) : null}
    </div>
  );
}
