import {
  PRIORITE_TRAVAUX,
  type PrioriteTravaux,
} from "../../lib/chiffrage/priorite-travaux";

type Props = {
  priorite: PrioriteTravaux;
  compact?: boolean;
};

export default function BadgePrioriteTravaux({ priorite, compact = false }: Props) {
  const style = PRIORITE_TRAVAUX[priorite];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold uppercase tracking-wide ${style.className} ${
        compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
      }`}
      title={style.libelle}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: `rgb(${style.barRgb.join(",")})` }}
        aria-hidden
      />
      {style.code}
      {compact ? null : <span className="font-medium normal-case tracking-normal">{style.libelleCourt}</span>}
    </span>
  );
}
