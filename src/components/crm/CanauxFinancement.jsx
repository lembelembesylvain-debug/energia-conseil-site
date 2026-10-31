import { euro } from "../../lib/crm/mockData";
import {
  CANAL_ECO_PTZ_ETAT,
  CANAL_PRET_TRAVAUX_FABIEN,
  CONTACT_FABIEN_COURTAGE,
  simulationsEcoPtzEtat,
} from "../../lib/crm/editionDossier";

export default function CanauxFinancement({
  resteACharge,
  montantEcoPtz,
  dureeEcoPtz = 20,
  compact = false,
}) {
  const simu = simulationsEcoPtzEtat(montantEcoPtz ?? resteACharge ?? 0);
  const mens20 = simu.mensualite20;
  const mens15 = simu.mensualite15;
  const duree = Number(dureeEcoPtz) === 15 ? 15 : 20;
  const mensAffichee = duree === 15 ? mens15 : mens20;

  return (
    <div className="space-y-3">
      <div className={`grid gap-3 ${compact ? "md:grid-cols-2" : "lg:grid-cols-2"}`}>
        <article className="rounded-xl border border-sky-500/35 bg-sky-500/10 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300">
            {CANAL_ECO_PTZ_ETAT.option}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {euro(mensAffichee)}
            <span className="ml-1 text-sm font-medium text-sky-100">/ mois</span>
          </p>
          <p className="mt-1 text-xs text-slate-300">
            {euro(simu.montant)} à 0,00 % d’intérêts — {duree} ans
            {duree === 20 ? ` (ou ${euro(mens15)} / mois sur 15 ans)` : ` (ou ${euro(mens20)} / mois sur 20 ans)`}.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{CANAL_ECO_PTZ_ETAT.rappel}</p>
        </article>

        <article className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">
            {CANAL_PRET_TRAVAUX_FABIEN.option}
          </p>
          <p className="mt-1 text-lg font-semibold text-white">{CANAL_PRET_TRAVAUX_FABIEN.enveloppe}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
            {CONTACT_FABIEN_COURTAGE.libelle}. {CANAL_PRET_TRAVAUX_FABIEN.pretTravaux}
          </p>
        </article>
      </div>
    </div>
  );
}
