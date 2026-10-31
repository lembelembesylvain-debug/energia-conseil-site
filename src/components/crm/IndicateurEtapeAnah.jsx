import {
  ETAPES_ANAH,
  libelleParcoursAnah,
  messageVerrouMarche,
  trouverEtapeAnah,
  validationMarAcquise,
} from "../../lib/crm/operationnelCrm.js";

export default function IndicateurEtapeAnah({
  etapeAnah,
  validationMar,
  detailJalon = "",
  compact = false,
}) {
  const courant = trouverEtapeAnah(etapeAnah);
  const verrou = !validationMarAcquise({ etapeAnah: courant.id, validationMar });

  if (compact) {
    return (
      <p className="text-[11px] leading-relaxed text-amber-100/90" title={libelleParcoursAnah(courant.id)}>
        ANAH {courant.ordre}/5 — {courant.compactLabel}
        {verrou ? (
          <span className="ml-1.5 inline-flex rounded-full border border-rose-400/50 bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-100">
            Verrou MAR
          </span>
        ) : null}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">
        Pipeline réglementaire ANAH / CEE
      </p>
      <ol className="mt-2 flex flex-col gap-1.5">
        {ETAPES_ANAH.map((etape) => {
          const actif = etape.id === courant.id;
          const fait = etape.ordre < courant.ordre;
          return (
            <li key={etape.id} className="flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                  actif
                    ? "border-amber-300/70 bg-amber-400/20 text-amber-50"
                    : fait
                      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
                      : "border-slate-600/40 bg-slate-950/40 text-slate-400"
                }`}
              >
                Jalon {etape.ordre}/5 — {etape.compactLabel}
              </span>
              {etape.verrouMar && verrou ? (
                <span className="rounded-full border border-rose-400/50 bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-100">
                  Verrouillé
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      {courant.sousTexte ? (
        <p className="mt-2 text-[11px] font-medium text-amber-50">{courant.sousTexte}</p>
      ) : null}
      {detailJalon ? <p className="mt-1 text-[11px] text-amber-100/80">{detailJalon}</p> : null}
      {verrou ? (
        <p className="mt-2 rounded-lg border border-rose-400/40 bg-rose-500/15 px-2.5 py-2 text-[11px] leading-relaxed text-rose-50">
          {messageVerrouMarche()}
        </p>
      ) : null}
    </div>
  );
}
