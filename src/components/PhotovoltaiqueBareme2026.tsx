import {
  ALERTE_DONNEES_NON_VALIDEES,
  lireReglementairePv,
  MENTION_AIDES_NON_DEFINITIVES,
} from "../lib/calculators/photovoltaique-reglementaire";
import {
  BATTERIE_MAX_KWH,
  BATTERIE_MIN_KWH,
  PV_BAREME_VERSION,
  recapPhotovoltaique2026,
} from "../lib/calculators/photovoltaique-2026";

function euro(n: number): string {
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type PhotovoltaiqueBareme2026Props = {
  puissanceKwc?: number;
  consoAnnuelleKwh?: number;
};

export default function PhotovoltaiqueBareme2026({
  puissanceKwc = 0,
  consoAnnuelleKwh,
}: PhotovoltaiqueBareme2026Props) {
  const recap = recapPhotovoltaique2026(puissanceKwc, consoAnnuelleKwh);
  const lecture = lireReglementairePv(puissanceKwc);
  const nonValide = recap.statutReglementaire !== "valide";

  return (
    <section className="space-y-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
        Données réglementaires {PV_BAREME_VERSION} — non contractuelles
      </p>
      {nonValide ? (
        <p role="alert" className="rounded-xl border border-orange-500/50 bg-orange-500/15 px-3 py-3 text-sm font-semibold leading-relaxed text-orange-100">
          {lecture.alerte ?? ALERTE_DONNEES_NON_VALIDEES}
        </p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">TVA</p>
          <p className="mt-1 text-sm font-semibold text-white">{recap.labelTva}</p>
          {lecture.sourceTva ? (
            <p className="mt-0.5 text-[11px] text-slate-500">{lecture.sourceTva}</p>
          ) : null}
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Prime éventuelle (hypothèse)
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-100">
            {recap.primeTotale != null && recap.puissanceKwc > 0
              ? `${euro(recap.primeTotale)} (${recap.primeEurParKwc} €/kWc) — non définitif`
              : "Non affichée comme définitive"}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {recap.sourcePrime ?? "Source non validée"}
          </p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Tarif de surplus
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {recap.tarifAchatEurKwh != null
              ? `${(recap.tarifAchatEurKwh * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} c€/kWh — à vérifier`
              : "Non renseigné"}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {recap.sourceTarif ?? "Source non validée"}
          </p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Batterie recommandée</p>
          <p className="mt-1 text-sm font-semibold text-sky-200">
            {recap.batterieRecommandeeKwh > 0
              ? `${recap.batterieRecommandeeKwh.toLocaleString("fr-FR")} kWh (indicatif)`
              : `${BATTERIE_MIN_KWH} à ${BATTERIE_MAX_KWH} kWh`}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Optionnelle, jamais obligatoire. Le dimensionnement final de la batterie dépend de la
            consommation réelle, du profil de charge et de l’étude technique.
          </p>
        </article>
      </div>
      <p className="text-[11px] leading-relaxed text-amber-100/80">{MENTION_AIDES_NON_DEFINITIVES}</p>
    </section>
  );
}
