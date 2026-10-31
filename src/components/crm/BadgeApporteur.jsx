import { libelleSourceApporteur, normaliserSourceApporteur } from "../../lib/crm/operationnelCrm.js";

export default function BadgeApporteur({ apporteurId, apporteurNom, compact = false }) {
  const id = normaliserSourceApporteur(apporteurId);
  const styles = {
    direct_energia: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
    catarina_martins: "border-violet-400/40 bg-violet-500/15 text-violet-100",
    romain_bet_nomos: "border-indigo-400/40 bg-indigo-500/15 text-indigo-100",
    jamel_hamzaoui: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
  };
  const className = styles[id] || "border-slate-500/40 bg-slate-500/15 text-slate-200";
  const label = compact ? libelleSourceApporteur(id, { compact: true }) : libelleSourceApporteur(id);

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border font-semibold uppercase tracking-wide ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]"
      } ${className}`}
      title={apporteurNom || libelleSourceApporteur(id)}
    >
      <span className="truncate">{compact ? label : label}</span>
    </span>
  );
}
