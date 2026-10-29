import { euroAvecUnite, euroHt, pctMarge, type RatioDirection } from "../../lib/crm/ratiosDirection";

const CASES: { cle: keyof RatioDirection; label: string; accent?: boolean }[] = [
  { cle: "revientHt", label: "Coût de revient HT" },
  { cle: "venteHt", label: "Prix de vente HT" },
  { cle: "racHt", label: "Reste à charge net" },
  { cle: "margeHt", label: "Marge nette direction", accent: true },
];

export default function CartesRatiosDirection({ ratio }: { ratio: RatioDirection }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
        {ratio.code} — {ratio.libelle}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CASES.map((carte) => {
          const valeur = ratio[carte.cle];
          const montant = typeof valeur === "number" ? valeur : null;
          const affiche = carte.cle === "racHt" ? euroAvecUnite(montant, ratio.racUnite) : euroHt(montant);
          return (
            <article
              key={carte.label}
              className={`rounded-2xl border px-3 py-3 ${
                carte.accent
                  ? "border-emerald-400/50 bg-emerald-500/15"
                  : "border-slate-700 bg-slate-900/80"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{carte.label}</p>
              <p className={`mt-1 font-mono text-xl font-semibold tabular-nums ${carte.accent ? "text-emerald-200" : "text-white"}`}>
                {affiche}
              </p>
              {carte.accent ? (
                <p className="mt-2 inline-flex rounded-full border border-emerald-300/50 bg-emerald-400/20 px-2 py-0.5 text-[11px] font-bold text-emerald-100">
                  {pctMarge(ratio.margePct)} de marge
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div className="flex justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2">
          <dt className="text-slate-400">{ratio.materielLibelle ?? "Coût matériel négoce HT"}</dt>
          <dd className="font-medium text-white">
            {ratio.code === "BAR-TH-164" ? "Inclus dans le forfait sous-traité" : euroHt(ratio.materielHt)}
          </dd>
        </div>
        <div className="flex justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2">
          <dt className="text-slate-400">{ratio.poseLibelle ?? "Main d'œuvre pose et raccordement HT"}</dt>
          <dd className="font-medium text-white">{euroHt(ratio.poseHt)}</dd>
        </div>
        <div className="flex justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2">
          <dt className="text-slate-400">Total coût de revient HT</dt>
          <dd className="font-medium text-white">{euroHt(ratio.revientHt)}</dd>
        </div>
        <div className="flex justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2">
          <dt className="text-slate-400">{ratio.venteLibelle ?? "Prix de vente marché conseillé HT"}</dt>
          <dd className="font-medium text-white">{euroHt(ratio.venteHt)}</dd>
        </div>
        <div className="flex justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2">
          <dt className="text-slate-400">{ratio.primeLibelle}</dt>
          <dd className="font-medium text-emerald-200">
            {ratio.primeHt == null
              ? "À confirmer"
              : `− ${euroAvecUnite(ratio.primeHt, ratio.racUnite === "TTC" ? "EUR" : "HT")}`}
          </dd>
        </div>
        <div className="flex justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2">
          <dt className="text-slate-400">{ratio.racLibelle ?? "Reste à charge net client"}</dt>
          <dd className="font-medium text-white">{euroAvecUnite(ratio.racHt, ratio.racUnite)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-slate-400">{ratio.mention}</p>
    </div>
  );
}
