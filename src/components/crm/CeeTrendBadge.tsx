import { Minus, Rocket, TrendingUp } from "lucide-react";
import type { CeeTrendTone } from "../../lib/crm/ceeRadarTravaux";

const BADGE: Record<CeeTrendTone, string> = {
  up: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  boom: "border-fuchsia-400/50 bg-fuchsia-500/20 text-fuchsia-100",
  neutral: "border-sky-400/40 bg-sky-500/15 text-sky-100",
  fluo: "border-lime-300/40 bg-lime-400/10 text-lime-200",
};

export default function CeeTrendBadge({
  tone,
  label,
}: {
  tone: CeeTrendTone;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${BADGE[tone]}`}
    >
      {tone === "boom" ? (
        <Rocket className="size-3 shrink-0" aria-hidden />
      ) : tone === "neutral" ? (
        <Minus className="size-3 shrink-0" aria-hidden />
      ) : (
        <TrendingUp className="size-3 shrink-0" aria-hidden />
      )}
      {label}
    </span>
  );
}
