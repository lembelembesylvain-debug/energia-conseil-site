import { euro } from "../../lib/crm/mockData";
import {
  STATUT_MARGE_PERTE,
  STATUT_MARGE_VIGILANCE,
  libelleAlerteMarge,
} from "../../lib/crm/gardeFouMarge";

/**
 * Badge d’alerte marge — administrateur uniquement.
 */
export default function AlerteMargeLigne({ analyse, compact = false }) {
  const texte = libelleAlerteMarge(analyse);
  if (!texte) return null;
  const perte = analyse?.statut === STATUT_MARGE_PERTE;
  const vigilance = analyse?.statut === STATUT_MARGE_VIGILANCE;
  return (
    <span
      role="alert"
      className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
        perte
          ? "animate-pulse border-red-400 bg-red-950/80 text-red-200"
          : vigilance
            ? "border-orange-400 bg-orange-950/70 text-orange-100"
            : "border-slate-600 text-slate-300"
      } ${compact ? "" : "whitespace-normal"}`}
    >
      {texte}
      {analyse?.analysable && analyse.tauxMarge != null && !perte ? (
        <span className="ml-1 font-normal opacity-80">
          ({(analyse.tauxMarge * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} % · {euro(analyse.margeHt)})
        </span>
      ) : null}
    </span>
  );
}
