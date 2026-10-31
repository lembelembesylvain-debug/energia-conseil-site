import { euro } from "../../lib/crm/mockData";

export default function BadgeGainMarge({ montantHt, visible = true }) {
  if (!visible || montantHt == null || Number(montantHt) <= 0) return null;
  return (
    <span className="inline-flex rounded-full border border-emerald-400/50 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-100">
      Gain de marge brute supplémentaire captée : +{euro(montantHt)} HT
    </span>
  );
}
