import { euro } from "../../lib/crm/mockData";
import { GALERIE_PROJECTIONS_BRUNEL } from "../../lib/crm/brunelOffresV5";
import {
  OFFRE_BRUNEL_OPTION_BAIE,
  OFFRE_BRUNEL_OPTION_SANS_BAIE,
  TOTAUX_OPTION_BAIE,
  TOTAUX_OPTION_SANS_BAIE,
  offreMarcheBrunelActive,
} from "../../lib/crm/brunelMarcheOfficiel2026";

export default function SelecteurOffreBrunel({
  offreActive = OFFRE_BRUNEL_OPTION_BAIE,
  onChange,
  editable = true,
  afficherMargeCg = true,
}) {
  const active = offreMarcheBrunelActive(offreActive);

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
        Devis n°1 — marché aidé ANAH, TVA 5,5 %
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={!editable}
          onClick={() => onChange?.(OFFRE_BRUNEL_OPTION_BAIE)}
          className={`rounded-xl border px-4 py-3 text-left ${
            active === OFFRE_BRUNEL_OPTION_BAIE
              ? "border-emerald-400 bg-emerald-500/20 text-white"
              : "border-slate-700 bg-slate-900 text-slate-200"
          }`}
        >
          <span className="block text-sm font-semibold">Option 1 — avec baie et IPN</span>
          <span className="mt-1 block text-lg font-bold text-emerald-200">{euro(TOTAUX_OPTION_BAIE.totalTtc)} TTC</span>
          <span className="mt-1 block text-xs text-slate-400">31 733,21 € HT — ANAH 14 279,94 €</span>
        </button>
        <button
          type="button"
          disabled={!editable}
          onClick={() => onChange?.(OFFRE_BRUNEL_OPTION_SANS_BAIE)}
          className={`rounded-xl border px-4 py-3 text-left ${
            active === OFFRE_BRUNEL_OPTION_SANS_BAIE
              ? "border-sky-400 bg-sky-500/20 text-white"
              : "border-slate-700 bg-slate-900 text-slate-200"
          }`}
        >
          <span className="block text-sm font-semibold">Option 2 — sans baie ni IPN</span>
          <span className="mt-1 block text-lg font-bold text-sky-200">{euro(TOTAUX_OPTION_SANS_BAIE.totalTtc)} TTC</span>
          <span className="mt-1 block text-xs text-slate-400">
            {afficherMargeCg ? "26 933,21 € HT — ANAH 12 119,94 € — marge 5 200 € HT" : "26 933,21 € HT — ANAH 12 119,94 €"}
          </span>
        </button>
      </div>
    </div>
  );
}

export function GalerieProjectionsBrunel() {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-3">
      {GALERIE_PROJECTIONS_BRUNEL.map((item) => (
        <figure key={item.id} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
          <img
            src={item.src}
            alt={item.titre}
            className="block h-auto w-full"
            style={{ maxWidth: "100%", height: "auto", borderRadius: 8, marginBottom: 12, display: "block" }}
            onError={(event) => {
              if (item.fallbackSrc && event.currentTarget.src !== item.fallbackSrc) {
                event.currentTarget.src = item.fallbackSrc;
              }
            }}
          />
          <figcaption className="px-3 pb-3 text-xs text-slate-300">
            <strong className="block text-sm text-white">{item.titre}</strong>
            {item.description}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
