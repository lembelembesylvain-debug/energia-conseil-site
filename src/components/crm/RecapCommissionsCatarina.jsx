import { euro } from "../../lib/crm/mockData";
import {
  libelleStatutCommission,
  recapitulatifCommissionsCatarina,
  STATUTS_COMMISSION,
} from "../../lib/crm/operationnelCrm.js";

const statutClass = {
  en_attente: "border-amber-300 bg-amber-50 text-amber-900",
  a_regler: "border-sky-300 bg-sky-50 text-sky-900",
  regle: "border-emerald-300 bg-emerald-50 text-emerald-900",
};

export default function RecapCommissionsCatarina({ dossiers, editable = false, voirPartEnergia = true, onStatut }) {
  const recap = recapitulatifCommissionsCatarina(dossiers);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-100 shadow-lg shadow-slate-900/20">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">Apporteur d’affaires</p>
      <h3 className="mt-1 text-lg font-semibold text-white">Catarina Martins</h3>
      <p className="mt-1 text-xs text-slate-400">
        Consultation Duo 390 € TTC : 60 % (234,00 € TTC) pour Catarina, 40 % (156,00 € TTC) pour Energia Conseil IA.
        Coordination : 1 500,00 € HT au jalon 3 (acompte encaissé). Travaux : 10 % HT au jalon 5 (réception sans réserve).
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-3">
          <dt className="text-[11px] uppercase tracking-wide text-slate-400">Dossiers apportés</dt>
          <dd className="mt-1 text-2xl font-semibold text-white">{recap.nbDossiers}</dd>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-3">
          <dt className="text-[11px] uppercase tracking-wide text-slate-400">Rémunération totale partenaire estimée</dt>
          <dd className="mt-1 text-lg font-semibold text-white">{euro(recap.totalPartenaireEstimeHt)} HT</dd>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Coordination {euro(recap.totalCoordinationHt)} HT + travaux {euro(recap.totalTravauxHt)} HT
          </p>
          <p className="text-[11px] leading-relaxed text-slate-400">Consultations Duo : {euro(recap.totalDuoTtc)} TTC, à part.</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-3">
          <dt className="text-[11px] uppercase tracking-wide text-slate-400">Statut</dt>
          <dd className="mt-2">
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statutClass[recap.statut] || statutClass.en_attente}`}>
              {libelleStatutCommission(recap.statut)}
            </span>
          </dd>
        </div>
      </dl>

      {recap.lignes.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">
          Aucun dossier n’est encore rattaché à Catarina Martins. Choisissez cet apporteur sur la fiche projet pour calculer les commissions.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-800">
          {recap.lignes.map((ligne) => (
            <li key={ligne.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-white">{ligne.nom}</p>
                <p className="text-xs text-slate-400">
                  {ligne.ville ? `${ligne.ville} · ` : ""}
                </p>
                <p className="text-xs text-slate-400">
                  Forfait Coordination à l’acompte : {euro(ligne.forfaitCoordinationHt)} HT
                  {ligne.coordinationDeclenchee ? " · acompte encaissé" : " · dû au jalon 3"}
                </p>
                <p className="text-xs text-slate-400">
                  Commission Travaux (10 %) au solde : {euro(ligne.commissionTravauxHt)} HT
                  {ligne.commissionTravauxDeclenchee ? " · réception sans réserve" : " · due au jalon 5"}
                </p>
                <p className="text-xs font-medium text-white">
                  Rémunération totale partenaire estimée : {euro(ligne.totalPartenaireEstimeHt)} HT
                </p>
                {ligne.consultationDuo ? (
                  <p className="text-xs text-slate-400">
                    Consultation Duo : {euro(ligne.reversementDuoTtc)} TTC
                    {voirPartEnergia ? ` · Energia ${euro(ligne.partEnergiaDuoTtc)} TTC` : ""}
                  </p>
                ) : null}
              </div>
              {editable ? (
                <label className="text-xs text-slate-400">
                  Statut
                  <select
                    className="mt-1 block rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white"
                    value={ligne.statut}
                    onChange={(event) => onStatut?.(ligne.id, event.target.value)}
                  >
                    {STATUTS_COMMISSION.map((statut) => (
                      <option key={statut.id} value={statut.id}>
                        {statut.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statutClass[ligne.statut] || statutClass.en_attente}`}>
                  {libelleStatutCommission(ligne.statut)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
