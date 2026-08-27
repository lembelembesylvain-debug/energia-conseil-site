import { useEffect, useMemo, useState } from "react";
import {
  BANDEAU_WOW,
  DISCLAIMER_SCENARIOS,
  LABEL_AVANT,
  LEGENDE_WOW,
  MENTION_DPE,
  MENTION_MADINIER,
  MENTION_TOITURE_FAIVRE,
  SCENARIOS_TRAVAUX,
  formatEuro,
} from "../data/scenariosMaisonClyve";
import { DISCLAIMER } from "../data/testMaisonClyve";
import { AID_RULES_2026 } from "../data/aidRules2026";
import { UMAFI } from "../data/umafi";
import { calculateAidEstimate } from "../lib/calculateAidEstimate";
import { useClyveTestJeu } from "../hooks/useClyveTestJeu";
import ClyveTestBanner from "./ClyveTestBanner";
import type { AidEstimateResult } from "../types/aides";

const DPE_CLASS: Record<string, string> = {
  G: "bg-[#e8412c] text-white",
  E: "bg-[#f5b941] text-slate-950",
  C: "bg-[#8bd147] text-slate-950",
  A: "bg-[#00a651] text-white",
};

const PIECES_FOURNIR = [
  "Avis d’imposition (RFR N-1 ou N-2)",
  "Justificatif de propriété",
  "Composition du foyer (nombre de personnes)",
  "Attestation de résidence principale",
  "DPE ou audit réglementaire s’il existe",
  "Devis RGE actualisés",
];

function AidStatusBox({
  bloque,
  estimate,
}: {
  bloque: boolean;
  estimate?: AidEstimateResult;
}) {
  if (bloque) {
    return (
      <div className="rounded-2xl border border-amber-400/50 bg-amber-500/10 px-4 py-3">
        <p className="text-sm font-semibold text-amber-200">Aides et Financement : Étude en cours (RFR manquant)</p>
        <p className="mt-1 text-xs text-amber-100/90">Mensualités : Étude de capacité d’emprunt requise</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {estimate?.status ?? "CALCUL_CONTROLE"}
        </span>
        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-950">
          AIDES_ESTIMEES
        </span>
        {estimate?.profileLabel ? (
          <span className="rounded-full border border-emerald-300 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-100">
            {estimate.profileLabel}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-emerald-100">
        Aides estimées (après plafonds / écrêtement {AID_RULES_2026.version}) :{" "}
        <strong className="tabular-nums">
          {estimate?.totalAides != null ? formatEuro(estimate.totalAides) : "—"}
        </strong>
      </p>
      <p className="text-sm text-emerald-100">
        Reste à charge net :{" "}
        <strong className="tabular-nums">
          {estimate?.resteACharge != null ? formatEuro(estimate.resteACharge) : "—"}
        </strong>
      </p>
      <p className="mt-1 text-[11px] text-emerald-200/80">{AID_RULES_2026.disclaimer}</p>
    </div>
  );
}

export default function PresentationMaisonClyve() {
  const { jeu, setJeu, foyer, controleMoteur } = useClyveTestJeu();
  const [index, setIndex] = useState(0);
  const slides = useMemo(() => ["intro", ...SCENARIOS_TRAVAUX.map((item) => item.id), "aides"] as const, []);
  const last = slides.length - 1;

  const estimates = useMemo(() => {
    return Object.fromEntries(
      SCENARIOS_TRAVAUX.map((scenario) => [
        scenario.id,
        calculateAidEstimate({
          foyer,
          budgetTtc: scenario.totalTtc,
          lots: scenario.lotsInclus,
          scenarioId: scenario.id,
        }),
      ]),
    ) as Record<string, AidEstimateResult>;
  }, [foyer]);

  const fiscalBloque = foyer.rfr == null || foyer.householdSize == null;

  useEffect(() => {
    const previous = document.title;
    document.title = "Présentation — Scénarios Maison Clyve | TEST LOCAL";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        setIndex((current) => Math.min(current + 1, last));
      }
      if (event.key === "ArrowLeft") {
        setIndex((current) => Math.max(current - 1, 0));
      }
      if (event.key === "Escape") {
        window.location.href = "/test-maison-clyve#scenarios";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.title = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [last]);

  const slide = slides[index];
  const scenario = SCENARIOS_TRAVAUX.find((item) => item.id === slide);

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <ClyveTestBanner jeu={jeu} onChange={setJeu} controleMoteur={controleMoteur} />

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/40 px-4 py-3 md:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-400">
            Test local — ne pas publier
          </p>
          <h1 className="text-lg font-semibold">Présentation — 3 scénarios Maison Clyve</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/test-maison-clyve#scenarios"
            className="inline-flex min-h-11 items-center rounded-full border border-slate-500 px-3 py-2 text-sm"
          >
            Retour au test
          </a>
          <button
            type="button"
            className="min-h-11 rounded-full border border-slate-500 px-3 py-2 text-sm disabled:opacity-40"
            disabled={index === 0}
            onClick={() => setIndex((current) => Math.max(current - 1, 0))}
          >
            Précédent
          </button>
          <button
            type="button"
            className="min-h-11 rounded-full bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
            disabled={index === last}
            onClick={() => setIndex((current) => Math.min(current + 1, last))}
          >
            Suivant
          </button>
        </div>
      </header>

      <p className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-100 md:px-6">
        {DISCLAIMER}
      </p>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <p className="mb-4 text-xs text-slate-400">
          Diapositive {index + 1} / {slides.length} — flèches clavier, Échap pour quitter
        </p>

        {slide === "intro" ? (
          <section className="space-y-4">
            <h2 className="text-3xl font-semibold">Trois options de travaux progressives</h2>
            <p className="max-w-3xl text-slate-300">{DISCLAIMER_SCENARIOS}</p>
            <ul className="grid gap-3 md:grid-cols-3">
              {SCENARIOS_TRAVAUX.map((item) => {
                const estimate = estimates[item.id];
                return (
                  <li
                    key={item.id}
                    className={`rounded-2xl border p-4 ${item.recommande ? "border-amber-400 bg-amber-500/10" : "border-slate-700"}`}
                  >
                    <p className="text-sm text-amber-300">{item.badge}</p>
                    <p className="mt-1 font-semibold">{item.nomCourt}</p>
                    <p className="mt-2 text-2xl font-bold tabular-nums">{formatEuro(item.totalTtc)}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.objectif}</p>
                    {fiscalBloque ? (
                      <p className="mt-3 text-xs font-medium text-amber-200">
                        Aides et Financement : Étude en cours (RFR manquant)
                      </p>
                    ) : (
                      <p className="mt-3 text-xs text-emerald-200">
                        RAC net indicatif : {estimate?.resteACharge != null ? formatEuro(estimate.resteACharge) : "—"}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {scenario ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Option {scenario.id} — {scenario.nomCourt}
              </h2>
              <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-slate-950">
                {scenario.badge}
              </span>
            </div>
            <p className="text-slate-300">{scenario.objectif}</p>
            <p className="text-3xl font-bold tabular-nums">{formatEuro(scenario.totalTtc)} TTC</p>
            <AidStatusBox bloque={fiscalBloque} estimate={estimates[scenario.id]} />
            <div className="flex items-center gap-2 text-sm">
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded font-bold ${DPE_CLASS.G}`}>
                G
              </span>
              <span>➔</span>
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded font-bold ${DPE_CLASS[scenario.dpeApresHypothese]}`}
              >
                {scenario.dpeApresHypothese}
              </span>
              <span className="text-amber-200">Hypothèse — {scenario.gainDeperditionsHypothese} de déperditions</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <figure className="overflow-hidden rounded-2xl border border-slate-700">
                <p className="bg-slate-800 px-3 py-1 text-center text-xs font-semibold uppercase">{LABEL_AVANT}</p>
                <img src={scenario.photoAvantSrc} alt="" className="h-56 w-full object-cover md:h-64" />
              </figure>
              <figure className="overflow-hidden rounded-2xl border border-amber-400">
                <p className="bg-amber-500 px-3 py-1 text-center text-xs font-semibold uppercase text-slate-950">
                  {BANDEAU_WOW}
                </p>
                <img src={scenario.projectionWowSrc} alt="" className="h-56 w-full object-cover md:h-64" />
              </figure>
            </div>
            <p className="text-xs text-slate-400">{LEGENDE_WOW}</p>
            {scenario.transformations.length > 0 ? (
              <ul className="grid gap-1 text-sm text-slate-300 md:grid-cols-2">
                {scenario.transformations.map((item) => (
                  <li key={item}>— {item}</li>
                ))}
              </ul>
            ) : null}
            <ul className="grid gap-2 text-sm md:grid-cols-2">
              {scenario.lotsInclus.map((lot) => (
                <li key={lot.libelle} className="rounded-lg bg-slate-900 px-3 py-2">
                  ✅ {lot.libelle} — {formatEuro(lot.montantTtc)} — {lot.source}
                </li>
              ))}
              {scenario.lotsExclus.map((item) => (
                <li key={item} className="rounded-lg bg-slate-900/60 px-3 py-2 text-slate-400">
                  ❌ {item}
                </li>
              ))}
            </ul>
            <p className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm leading-relaxed text-slate-300">
              Enveloppe toiture (SARL FAIVRE) : 360 m² de couverture neuve et sous-toiture R3 — lot structurant pour
              l’étanchéité et le confort. {MENTION_TOITURE_FAIVRE} {MENTION_MADINIER} Les métrés du corpus (360 / 450 /
              505 m²) restent contradictoires : ils seront levés lors de la visite technique, sans surface figée
              contractuellement ici.
            </p>
            {scenario.id === "B" || scenario.id === "C" ? (
              <p className="rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
                <strong>Regroupement de crédits recommandé pour cette option.</strong> {UMAFI.regroupementTexte}
              </p>
            ) : null}
          </section>
        ) : null}

        {slide === "aides" ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Aides et financement</h2>
            <p className="text-sm text-slate-300">{MENTION_DPE}</p>
            <p className="text-sm text-slate-300">{AID_RULES_2026.disclaimer}</p>
            <p className="text-xs text-slate-400">Barème {AID_RULES_2026.version} — {AID_RULES_2026.dateEntreeEnVigueur}.</p>

            {fiscalBloque ? (
              <div className="rounded-2xl border border-amber-400/40 bg-slate-900 p-4 md:p-5">
                <p className="text-lg font-semibold text-amber-200">📋 Pièces à fournir pour calculer vos aides</p>
                <p className="mt-2 text-sm text-slate-300">
                  Aides et Financement : Étude en cours (RFR manquant). Aucun profil Bleu / Jaune / Violet / Rose n’est
                  affiché tant que le foyer n’est pas documenté.
                </p>
                <ul className="mt-3 grid gap-2 text-sm text-slate-200 md:grid-cols-2">
                  {PIECES_FOURNIR.map((item) => (
                    <li key={item} className="rounded-lg border border-slate-700 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm font-medium text-amber-100">
                  Mensualités : Étude de capacité d’emprunt requise
                </p>
              </div>
            ) : (
              <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
                Jeu de test actif — profil {estimates.A?.profileLabel ?? "Jaune"} — statut {estimates.A?.status} /
                AIDES_ESTIMEES. Montants indicatifs, écrêtés selon les plafonds 2026.
              </p>
            )}

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="min-w-[640px] w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#1a3c5e]">
                    <th className="px-3 py-2">Scénario</th>
                    <th className="px-3 py-2">Budget TTC</th>
                    <th className="px-3 py-2">Aides</th>
                    <th className="px-3 py-2">Reste à charge</th>
                    <th className="px-3 py-2">Mensualités</th>
                  </tr>
                </thead>
                <tbody>
                  {SCENARIOS_TRAVAUX.map((item) => {
                    const estimate = estimates[item.id];
                    return (
                      <tr key={item.id} className="border-b border-slate-800">
                        <td className="px-3 py-2">{item.nomCourt}</td>
                        <td className="px-3 py-2 tabular-nums">{formatEuro(item.totalTtc)}</td>
                        <td className="px-3 py-2">
                          {fiscalBloque
                            ? "Étude en cours (RFR manquant)"
                            : estimate?.totalAides != null
                              ? formatEuro(estimate.totalAides)
                              : "NON CALCULABLES"}
                        </td>
                        <td className="px-3 py-2">
                          {fiscalBloque
                            ? "Étude en cours (RFR manquant)"
                            : estimate?.resteACharge != null
                              ? formatEuro(estimate.resteACharge)
                              : "NON CALCULABLE"}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-300">
                          {fiscalBloque
                            ? "Étude de capacité d’emprunt requise"
                            : UMAFI.etudeCapaciteClyve}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-5">
              <h3 className="text-lg font-semibold">Financement UMAFI</h3>
              <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {UMAFI.mentionConventionB}
              </p>
              <p className="text-sm text-slate-300">{UMAFI.contact.libelle}</p>
              <p className="rounded-xl border border-slate-600 px-4 py-3 text-sm font-medium text-slate-100">
                {fiscalBloque
                  ? `${UMAFI.etudeCapaciteClyve} Mensualités : Étude de capacité d’emprunt requise. Aucun taux d’intérêt n’est affiché.`
                  : `${UMAFI.etudeCapaciteClyve} Aucun taux d’intérêt n’est affiché.`}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={UMAFI.urls.travaux}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  Simuler mon financement travaux
                </a>
                <a
                  href={UMAFI.urls.regroupement}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-full border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-100"
                >
                  Simuler mon regroupement de crédits
                </a>
              </div>
              <p className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
                <strong>Scénarios B et C — regroupement de crédits.</strong> {UMAFI.regroupementTexte}
              </p>
              <p className="rounded-xl border border-slate-600 px-4 py-3 text-sm text-slate-200">{UMAFI.acompteJ15}</p>
            </div>

            <p className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {DISCLAIMER_SCENARIOS}
            </p>
          </section>
        ) : null}
      </main>
    </div>
  );
}
