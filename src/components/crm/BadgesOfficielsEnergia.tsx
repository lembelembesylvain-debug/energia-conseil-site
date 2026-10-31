import { BADGES_OFFICIELS } from "../../lib/branding";

export default function BadgesOfficielsEnergia({ className = "" }: { className?: string }) {
  return (
    <ul
      className={`flex flex-wrap gap-1.5 ${className}`}
      aria-label="Badges officiels ENERGIA CONSEIL IA"
    >
      {BADGES_OFFICIELS.map((label) => (
        <li
          key={label}
          className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-emerald-100"
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
