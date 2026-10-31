import { useState } from "react";
import { euro } from "../../lib/crm/mockData";
import {
  AVERTISSEMENT_VISITE_TECHNIQUE_VERROUILLEE,
  ETAPES_ANAH,
  SOURCES_APPORTEUR,
  calculerCommissionCatarina,
  estApporteurCatarina,
  messageVerrouMarche,
  normaliserSourceApporteur,
  peutPlanifierVisiteTechnique,
  peutPasserAuJalon,
  trouverEtapeAnah,
} from "../../lib/crm/operationnelCrm.js";
import BadgeApporteur from "./BadgeApporteur";
import IndicateurEtapeAnah from "./IndicateurEtapeAnah";

const champClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none";

export default function PilotageApporteurJalon({
  dossier,
  editableApporteur = false,
  editableJalon = false,
  voirPartEnergia = true,
  voirCommissions = true,
  onChange,
}) {
  const [alerte, setAlerte] = useState("");
  if (!dossier) return null;

  const apporteurId = normaliserSourceApporteur(dossier.apporteurId);
  const catarina = estApporteurCatarina(apporteurId);
  const etape = trouverEtapeAnah(dossier.etapeAnah);
  const visiteTechniqueAutorisee = peutPlanifierVisiteTechnique(dossier);
  const commission = calculerCommissionCatarina({
    consultationDuo: dossier.consultationDuo === true,
    montantTravauxHt: dossier.caHt,
    etapeAnah: dossier.etapeAnah,
  });

  const changerEtape = (id) => {
    if (!peutPasserAuJalon(dossier, id)) {
      setAlerte(messageVerrouMarche());
      return;
    }
    setAlerte("");
    onChange?.({ etapeAnah: id });
  };

  return (
    <div className="sm:col-span-2 space-y-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Apporteur d’affaires</p>
        {editableApporteur ? (
          <select
            className={champClass}
            value={apporteurId}
            onChange={(event) => onChange?.({ apporteurId: event.target.value })}
          >
            {SOURCES_APPORTEUR.map((source) => (
              <option key={source.id} value={source.id}>
                {source.selectLabel}
              </option>
            ))}
          </select>
        ) : (
          <div className="mt-1">
            <BadgeApporteur apporteurId={apporteurId} apporteurNom={dossier.apporteurNom} />
          </div>
        )}
      </div>

      {catarina && voirCommissions ? (
        <article className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">
            Commissions Catarina Martins
          </p>
          <label className="mt-2 flex items-start gap-2 text-sm text-violet-50">
            <input
              type="checkbox"
              className="mt-1"
              checked={dossier.consultationDuo === true}
              disabled={!editableApporteur}
              onChange={(event) => onChange?.({ consultationDuo: event.target.checked })}
            />
            <span>
              Consultation Duo cochée — 390,00 € TTC
              <span className="mt-0.5 block text-[11px] text-violet-100/80">
                60 % soit 234,00 € TTC reversés à Catarina · 40 % soit 156,00 € TTC pour Energia Conseil IA
              </span>
            </span>
          </label>
          {dossier.consultationDuo ? (
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-violet-200/80">Reversement Catarina</dt>
                <dd className="font-semibold text-white">{euro(commission.reversementDuoTtc)} TTC</dd>
              </div>
              {voirPartEnergia ? (
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-violet-200/80">Part Energia Conseil IA</dt>
                  <dd className="font-semibold text-white">{euro(commission.partEnergiaDuoTtc)} TTC</dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="mt-2 text-[11px] text-violet-100/75">
              Cochez la Consultation Duo pour calculer le reversement 60 / 40.
            </p>
          )}
          <dl className="mt-3 grid gap-2 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-violet-200/80">
                Forfait Coordination à l’acompte
              </dt>
              <dd className="font-semibold text-white">{euro(commission.forfaitCoordinationHt)} HT</dd>
              <p className="text-[11px] text-violet-100/80">
                {commission.coordinationDeclenchee
                  ? "Déclenché — acompte encaissé (jalon 3)"
                  : "Déclenchement à l’acompte encaissé (jalon 3)"}
              </p>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-violet-200/80">
                Commission Travaux (10 %) au solde
              </dt>
              <dd className="font-semibold text-white">{euro(commission.commissionTravauxHt)} HT</dd>
              <p className="text-[11px] text-violet-100/80">
                {commission.commissionTravauxDeclenchee
                  ? "Déclenchée — réception sans réserve (jalon 5)"
                  : "Déclenchement à la réception sans réserve (jalon 5)"}
                {` · Base travaux : ${euro(Number(dossier.caHt) || 0)} HT`}
              </p>
            </div>
            <div className="border-t border-violet-300/20 pt-2">
              <dt className="text-[11px] uppercase tracking-wide text-violet-200/80">
                Rémunération totale partenaire estimée
              </dt>
              <dd className="font-semibold text-white">{euro(commission.totalPartenaireEstimeHt)} HT</dd>
            </div>
          </dl>
        </article>
      ) : null}

      <IndicateurEtapeAnah
        etapeAnah={dossier.etapeAnah}
        validationMar={dossier.validationMar}
        detailJalon={dossier.detailJalon}
      />

      <section className="sm:col-span-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-100">Visite Technique</p>
        {editableJalon && etape.ordre >= 3 ? (
          <label className="mt-2 flex items-start gap-2 text-sm text-amber-50">
            <input
              type="checkbox"
              className="mt-1"
              checked={dossier.acompte30Encaisse === true}
              onChange={(event) => onChange?.({ acompte30Encaisse: event.target.checked })}
            />
            <span>Marché signé et acompte de 30 % encaissé</span>
          </label>
        ) : null}
        {!visiteTechniqueAutorisee ? (
          <p role="alert" className="mt-2 text-sm leading-relaxed text-amber-50">
            {AVERTISSEMENT_VISITE_TECHNIQUE_VERROUILLEE}
          </p>
        ) : (
          <p className="mt-2 text-xs text-emerald-100">Acompte confirmé : planification VT autorisée.</p>
        )}
        <label className="mt-3 block text-xs font-medium text-slate-300">
          Date de la Visite Technique
          <input
            type="date"
            className={champClass}
            value={dossier.dateVisiteTechnique || ""}
            disabled={!editableJalon || !visiteTechniqueAutorisee}
            onChange={(event) => onChange?.({ dateVisiteTechnique: event.target.value })}
          />
        </label>
      </section>

      {editableJalon ? (
        <div className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-3">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
            Positionner le jalon
            <select className={champClass} value={etape.id} onChange={(event) => changerEtape(event.target.value)}>
              {ETAPES_ANAH.map((item) => {
                const bloque = !peutPasserAuJalon(dossier, item.id);
                return (
                  <option key={item.id} value={item.id} disabled={bloque}>
                    {item.ordre}/5 — {item.compactLabel}
                    {bloque ? " (verrou MAR)" : ""}
                  </option>
                );
              })}
            </select>
          </label>
          {etape.ordre === 2 ? (
            <label className="mt-3 flex items-start gap-2 text-sm text-slate-100">
              <input
                type="checkbox"
                className="mt-1"
                checked={dossier.validationMar === true}
                onChange={(event) => {
                  setAlerte("");
                  onChange?.({ validationMar: event.target.checked });
                }}
              />
              <span>
                Jalon 2 validé — MAR passé et financement bancaire accordé
                <span className="mt-0.5 block text-[11px] text-slate-400">
                  Tant que cette case n’est pas cochée, le marché (jalon 3) reste impossible.
                </span>
              </span>
            </label>
          ) : null}
          {alerte ? (
            <p className="mt-3 rounded-lg border border-rose-400/40 bg-rose-500/15 px-2.5 py-2 text-[11px] leading-relaxed text-rose-50">
              {alerte}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
