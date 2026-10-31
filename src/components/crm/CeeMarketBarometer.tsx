import { EMMY_CUMAC, FICHES_CEE_TRAVAUX } from "../../lib/crm/ceeRadarTravaux";
import CeeTrendBadge from "./CeeTrendBadge";

const CARD_BORDER = {
  up: "border-emerald-500/30",
  boom: "border-fuchsia-400/45",
  neutral: "border-sky-500/30",
  fluo: "border-lime-400/30",
} as const;

export default function CeeMarketBarometer() {
  return (
    <section
      data-testid="cee-market-barometer"
      className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-slate-950/40"
      aria-labelledby="cee-barometer-title"
    >
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-800 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-lime-300">
            Primes chantiers
          </p>
          <h2 id="cee-barometer-title" className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-100">
            Tendances CEE par type de travaux
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            BAR, BAT et IND — primes estimées et cibles à prospecter.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.location.hash = "radar-cee";
          }}
          className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/20"
        >
          Radar CEE & Marchés
        </button>
      </header>

      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {FICHES_CEE_TRAVAUX.map((fiche) => (
          <article
            key={fiche.id}
            className={`flex flex-col rounded-xl border bg-slate-950/70 p-4 ${CARD_BORDER[fiche.tone]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-slate-500">
                  <span className="mr-1.5" aria-hidden>
                    {fiche.emoji}
                  </span>
                  {fiche.code}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white">{fiche.intitule}</h3>
              </div>
              <CeeTrendBadge tone={fiche.tone} label={fiche.tendance} />
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {fiche.primeLibelle}
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-slate-50">{fiche.prime}</p>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">{fiche.cibles}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-800 px-5 py-3 font-mono text-[11px] text-slate-400">
        <span>
          {EMMY_CUMAC.emoji} {EMMY_CUMAC.titre} · Classique {EMMY_CUMAC.classique} · Précarité{" "}
          {EMMY_CUMAC.precarite} / {EMMY_CUMAC.unite}
        </span>
      </div>
      <p className="border-t border-slate-800 px-5 py-3 text-[10px] leading-relaxed text-slate-500">
        Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du
        client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.
      </p>
    </section>
  );
}
