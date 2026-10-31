import { euro } from "../../lib/crm/mockData";

function Ligne({ label, valeur, fort = false }) {
  return (
    <p className={`flex items-center justify-between gap-3 ${fort ? "font-semibold text-white" : "text-slate-200"}`}>
      <span>{label}</span>
      <span className="shrink-0 tabular-nums">{euro(valeur)}</span>
    </p>
  );
}

export default function RecapDevisClientDirect({ devis, afficherMargeCg = true }) {
  if (!devis) return null;
  const lignes = (devis.lignes || []).filter((ligne) => afficherMargeCg || !ligne.margeCg);
  return (
    <div className="mt-4 space-y-3" data-testid="recap-devis-client-direct">
      <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Devis indicatif</p>
        <ul className="mt-3 space-y-2">
          {lignes.map((ligne) => (
            <li key={ligne.id} className="flex items-start justify-between gap-3 text-slate-200">
              <span>
                {ligne.nom}
                {ligne.spec ? <span className="mt-0.5 block text-xs text-slate-500">{ligne.spec}</span> : null}
              </span>
              <span className="shrink-0 tabular-nums">{euro(ligne.totalHt)} HT</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-slate-800 pt-3">
          <Ligne label="Total HT" valeur={devis.totalHt} />
          <Ligne label="TVA" valeur={devis.totalTva} />
          <Ligne label="Total TTC" valeur={devis.totalTtc} fort />
        </div>
      </div>
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-50">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
          Aides Anah 2026 — {devis.libelleProfil || "profil à calculer"}
        </p>
        <div className="mt-3 space-y-1">
          <Ligne label={`MaPrimeRénov' parcours (${devis.sautLibelle || "saut de classes"})`} valeur={devis.mpr} />
          <Ligne label="Honoraires MAR TTC" valeur={devis.honorairesMarTtc} />
          <Ligne label="Aide Anah sur le MAR" valeur={devis.aideMar} />
          <Ligne label="Total aides indicatives" valeur={devis.totalAides} fort />
          <Ligne label="Reste à charge global TTC" valeur={devis.resteGlobal} fort />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-emerald-100/90">{devis.mention}</p>
      </div>
    </div>
  );
}
