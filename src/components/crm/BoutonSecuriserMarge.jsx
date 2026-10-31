import { euro } from "../../lib/crm/mockData";
import { TAUX_MARGE_SECURISATION } from "../../lib/crm/gardeFouMarge";

/**
 * Recalcule le prix de vente minimum pour 15 % de marge brute.
 */
export default function BoutonSecuriserMarge({
  visible = true,
  disabled = false,
  prixPlancherHt,
  onClick,
}) {
  if (!visible || prixPlancherHt == null || !Number.isFinite(prixPlancherHt)) return null;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={`Prix de vente HT minimum pour ${(TAUX_MARGE_SECURISATION * 100).toFixed(0)} % de marge : ${euro(prixPlancherHt)}`}
      className="rounded-lg border border-emerald-400/50 bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Sécuriser Marge à 15 %
    </button>
  );
}
