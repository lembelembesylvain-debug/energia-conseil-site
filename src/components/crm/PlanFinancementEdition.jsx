import { euro } from "../../lib/crm/mockData";
import {
  CANAL_ECO_PTZ_ETAT,
  CANAL_PRET_TRAVAUX_FABIEN,
  CONTACT_FABIEN_COURTAGE,
  ECO_PTZ_DUREE_MAX,
  ECO_PTZ_DUREE_MIN,
  ECO_PTZ_MAX,
  MENTION_FINANCEMENT_EDITION,
  calculerFinancement,
} from "../../lib/crm/editionDossier";
import CanauxFinancement from "./CanauxFinancement";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none";
const labelClass = "text-xs font-medium uppercase tracking-wide text-slate-500";

function Ligne({ label, value, emphasis }) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
        emphasis ? "border-emerald-500/40 bg-emerald-500/10" : "border-slate-800 bg-slate-950/50"
      }`}
    >
      <p className={`text-sm ${emphasis ? "font-semibold text-emerald-100" : "text-slate-200"}`}>{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${emphasis ? "text-white" : "text-emerald-200"}`}>
        {euro(value)}
      </p>
    </div>
  );
}

export default function PlanFinancementEdition({ edition, onChange, editable }) {
  const plan = calculerFinancement(edition);
  const patch = (cle, valeur) => onChange?.({ ...edition.financement, [cle]: valeur });

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-amber-100">{MENTION_FINANCEMENT_EDITION}</p>
      <div className="space-y-2">
        <Ligne label="Coût total des travaux TTC" value={plan.totalTtc} />
        <Ligne label="Total des aides d’État (indicatif)" value={plan.totalAides} />
        <Ligne label="Reste à charge réel" value={plan.resteACharge} emphasis />
      </div>

      {plan.verrouillageOfficiel ? (
        <div className="space-y-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Conditions de paiement — devis officiel FINAL
          </p>
          <Ligne label="Acompte 30 % à la signature" value={plan.acompte} />
          <Ligne label="Acompte 40 % au démarrage chantier" value={plan.intermediaire} />
          <Ligne label="Solde 30 % à réception" value={plan.solde} />
          <p className="text-sm text-slate-200">
            Mensualité crédit Éco-PTZ (banque partenaire, dossier technique ENERGIA) /
            prêt travaux : ~{euro(plan.mensualite)} / mois sur 20 ans. Courtier en
            travaux &amp; financements : FABIEN — VIVONS COURTIER — 06 71 19 96 45.
          </p>
          <p className="text-sm text-slate-300">
            Économies d’énergie prévues : −{euro(plan.economiesMensuelles)} / mois · Bilan mensuel net : +
            {euro(plan.bilanNetMensuel)} / mois.
          </p>
        </div>
      ) : null}

      <section className="rounded-2xl border border-sky-500/25 bg-slate-950/50 p-4">
        <h3 className="text-sm font-semibold text-sky-100">{CANAL_ECO_PTZ_ETAT.titre}</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">{CANAL_ECO_PTZ_ETAT.rappel}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className={labelClass} htmlFor="eco-ptz-montant">
            Éco-PTZ — montant emprunté (€)
            <input
              id="eco-ptz-montant"
              type="number"
              min={0}
              max={ECO_PTZ_MAX}
              step="500"
              disabled={!editable}
              className={inputClass}
              value={plan.verrouillageOfficiel ? plan.ecoPtzMontant : edition.financement.ecoPtzMontant}
              onChange={(event) => patch("ecoPtzMontant", event.target.value)}
            />
            <span className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-slate-500">
              Plafond 50 000 € — taux 0 % — banques conventionnées.
            </span>
          </label>
          <label className={labelClass} htmlFor="eco-ptz-duree">
            Durée (ans)
            <input
              id="eco-ptz-duree"
              type="number"
              min={ECO_PTZ_DUREE_MIN}
              max={ECO_PTZ_DUREE_MAX}
              disabled={!editable}
              className={inputClass}
              value={edition.financement.ecoPtzDuree}
              onChange={(event) => patch("ecoPtzDuree", event.target.value)}
            />
            <span className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-slate-500">
              15 à 20 ans (banques partenaires de l’État).
            </span>
          </label>
          <label className={labelClass} htmlFor="apport-perso">
            Apport personnel restant (€)
            <input
              id="apport-perso"
              type="number"
              min="0"
              step="100"
              disabled={!editable}
              className={inputClass}
              value={edition.financement.apportPersonnel ?? plan.apportCalcule}
              onChange={(event) => patch("apportPersonnel", event.target.value === "" ? null : event.target.value)}
            />
          </label>
        </div>
      </section>

      <CanauxFinancement
        resteACharge={plan.resteACharge}
        montantEcoPtz={plan.ecoPtzMontant}
        dureeEcoPtz={plan.ecoPtzDuree}
      />

      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <h3 className="text-sm font-semibold text-amber-100">{CANAL_PRET_TRAVAUX_FABIEN.titre}</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">{CANAL_PRET_TRAVAUX_FABIEN.pretTravaux}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">{CANAL_PRET_TRAVAUX_FABIEN.regroupement}</p>
        <p className="mt-3 text-sm font-semibold text-white">{CONTACT_FABIEN_COURTAGE.libelle}</p>
      </section>
    </div>
  );
}
