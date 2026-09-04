import { euro } from "../../lib/crm/mockData";

function barre(pct, color) {
  return {
    width: `${Math.max(0, Math.min(100, pct * 100))}%`,
    backgroundColor: color,
  };
}

export default function RepartitionMarges({ marges, apporteurNom, compact = false }) {
  if (!marges) return null;

  const parts = [
    {
      id: "travaux",
      label: "Part Travaux",
      hint: "Lots + prestation administrative Clyve",
      ht: marges.partTravauxHt,
      pct: marges.partTravauxPct,
      color: "#38bdf8",
    },
    {
      id: "apporteur",
      label: "Part Apporteur",
      hint: apporteurNom ? `${apporteurNom} — 10 %` : "Commission apporteur 10 %",
      ht: marges.partApporteurHt,
      pct: marges.partApporteurPct,
      color: "#f59e0b",
    },
    {
      id: "energia",
      label: "Part ENERGIA CONSEIL IA",
      hint: "Pilotage Sylvain — 10 %",
      ht: marges.partEnergiaHt,
      pct: marges.partEnergiaPct,
      color: "#10b981",
    },
  ];

  return (
    <section className={compact ? "space-y-3" : "space-y-4"}>
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-3" : "sm:grid-cols-3"}`}>
        {parts.map((part) => (
          <article
            key={part.id}
            className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {part.label}
            </p>
            <p className="mt-1 text-xl font-semibold text-white">{euro(part.ht)}</p>
            <p className="mt-1 text-xs text-slate-500">
              {(part.pct * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} % du HT — {part.hint}
            </p>
          </article>
        ))}
      </div>

      <div className="flex h-3 overflow-hidden rounded-full bg-slate-800" aria-hidden>
        {parts.map((part) => (
          <span key={part.id} className="h-full" style={barre(part.pct, part.color)} title={part.label} />
        ))}
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg bg-slate-950/50 px-3 py-2">
          <dt className="text-slate-400">Total global HT</dt>
          <dd className="font-semibold text-white">{euro(marges.totalHt)}</dd>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-2">
          <dt className="text-emerald-200">Total global TTC (TVA 5,5 %)</dt>
          <dd className="font-semibold text-emerald-100">{euro(marges.totalTtc)}</dd>
        </div>
      </dl>
    </section>
  );
}
