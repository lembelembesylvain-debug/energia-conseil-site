import { euro } from "../../lib/crm/mockData";
import {
  STATUT_DEVIS_BLOQUE,
  STATUT_DEVIS_CONFORME,
  STATUT_DEVIS_VIGILANCE,
} from "../../lib/crm/gardeFouMarge";

function formatTaux(taux) {
  if (taux == null || !Number.isFinite(taux)) return "—";
  return `${(taux * 100).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

/**
 * Récapitulatif de rentabilité sous le chiffrage — session administrateur.
 */
export default function WidgetRentabiliteDevis({ analyse }) {
  if (!analyse) return null;
  const cadre =
    analyse.statut === STATUT_DEVIS_BLOQUE
      ? "border-red-500 bg-red-950/40"
      : analyse.statut === STATUT_DEVIS_VIGILANCE
        ? "border-orange-400/70 bg-orange-950/30"
        : analyse.statut === STATUT_DEVIS_CONFORME
          ? "border-emerald-500/50 bg-emerald-950/30"
          : "border-slate-800 bg-slate-950/50";
  return (
    <aside className={`mt-4 rounded-2xl border p-4 ${cadre}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Rentabilité chantier — interne ENERGIA
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{analyse.libelleStatut}</p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Total facturé client HT</dt>
          <dd className="text-lg font-semibold text-white">{euro(analyse.totalFactureClientHt)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Coûts d’achat &amp; sous-traitance HT</dt>
          <dd className="text-lg font-semibold text-amber-100">{euro(analyse.totalCoutsAchatHt)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Marge brute totale</dt>
          <dd className={`text-lg font-semibold ${analyse.margeBruteHt < 0 ? "text-red-300" : "text-emerald-200"}`}>
            {euro(analyse.margeBruteHt)}
            <span className="ml-2 text-sm font-medium text-slate-400">{formatTaux(analyse.tauxMarge)}</span>
          </dd>
        </div>
      </dl>
      {analyse.venteAPerte ? (
        <p role="alert" className="mt-3 text-xs font-semibold text-red-200">
          Export client bloqué : au moins une ligne est vendue à perte.
        </p>
      ) : null}
    </aside>
  );
}
