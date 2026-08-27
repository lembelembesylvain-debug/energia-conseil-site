import { calculateAidEstimate } from "../lib/calculateAidEstimate";
import { AID_RULES_2026 } from "../data/aidRules2026";
import { UMAFI } from "../data/umafi";
import { formatEuro } from "../types/audit";
import type { Scenario } from "../types/audit";
import type { AidEstimateResult, ChampFoyer, FinancementStatus, FoyerAides } from "../types/aides";

const CHAMP_CLASS: Record<ChampFoyer["statut"], string> = {
  EXTRAIT: "bg-emerald-100 text-emerald-900 border-emerald-300",
  "À VÉRIFIER": "bg-amber-100 text-amber-950 border-amber-300",
  "DONNÉE MANQUANTE": "bg-slate-200 text-slate-800 border-slate-400",
  "HYPOTHÈSE DE TEST": "bg-sky-100 text-sky-950 border-sky-300",
};

const AID_STATUS_CLASS: Record<string, string> = {
  AIDES_NON_CALCULABLES: "bg-slate-800 text-white",
  DONNEES_FISCALES_MANQUANTES: "bg-slate-700 text-white",
  SIMULATION_INDICATIVE: "bg-amber-200 text-amber-950",
  AIDES_A_VALIDER: "bg-amber-500 text-slate-950",
  VALIDATION_MAR_REQUISE: "bg-orange-600 text-white",
  PRET_POUR_CALCUL: "bg-sky-700 text-white",
  CALCUL_CONTROLE: "bg-emerald-800 text-white",
  VALIDE_HUMAIN: "bg-emerald-600 text-white",
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
}

function montantOuBloque(value: number | null, bloque: string): string {
  return value == null ? bloque : formatEuro(value);
}

export function AidesFinancementPanel({
  foyer,
  scenarios,
  alertesCorpus,
  financementStatus = "ÉTUDE FINANCIÈRE REQUISE",
}: {
  foyer: FoyerAides;
  scenarios: Scenario[];
  alertesCorpus?: string[];
  financementStatus?: FinancementStatus;
}) {
  const results: { scenario: Scenario; estimate: AidEstimateResult }[] = scenarios.map((scenario) => ({
    scenario,
    estimate: calculateAidEstimate({
      foyer,
      budgetTtc: scenario.totalTtc,
      lots: scenario.lotsInclus,
      scenarioId: scenario.id,
      scenarioLabel: scenario.nomCourt,
    }),
  }));
  const first = results[0]?.estimate;
  const aidesBloquees = !first?.calculable;
  const showRegroupement = scenarios.some((item) => item.id === "B" || item.id === "C" || item.totalTtc >= 40000);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Aides et financement</h2>
        <p className="mt-1 text-sm text-slate-600">
          Barème {AID_RULES_2026.version} — entrée en vigueur {AID_RULES_2026.dateEntreeEnVigueur}.{" "}
          {AID_RULES_2026.disclaimer}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {first ? (
            <Badge
              label={first.status}
              className={`${AID_STATUS_CLASS[first.status] ?? "bg-slate-200"} border-transparent`}
            />
          ) : null}
          <Badge label={financementStatus} className="border-slate-400 bg-white text-slate-800" />
          <Badge label="VALIDATION_MAR_REQUISE" className="border-transparent bg-orange-600 text-white" />
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-lg font-semibold">Données nécessaires pour calculer les aides</h3>
        <p className="mt-1 text-sm text-slate-600">
          Aucun profil Bleu / Jaune / Violet / Rose n’est sélectionné tant que le RFR et la composition du foyer
          manquent. Statut des champs manquants : DONNÉE MANQUANTE.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Donnée</th>
                <th className="px-3 py-2">Valeur</th>
                <th className="px-3 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {foyer.champs.map((item) => (
                <tr key={item.label} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-2 font-medium">{item.label}</td>
                  <td className="px-3 py-2">
                    {item.value}
                    {item.note ? <p className="mt-1 text-xs text-slate-500">{item.note}</p> : null}
                  </td>
                  <td className="px-3 py-2">
                    <Badge label={item.statut} className={CHAMP_CLASS[item.statut]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">
          {first?.profileMessage ?? "Profil d’aide non déterminable : RFR et/ou composition du foyer manquants."}
        </p>
      </section>

      {(alertesCorpus?.length || first?.alerts.length) ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-red-950">Alertes aides & dossier</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-950">
            {(alertesCorpus ?? first?.alerts ?? []).map((alerte) => (
              <li key={alerte}>{alerte}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-lg font-semibold">Synthèse par scénario</h3>
        <p className="mt-1 text-sm text-slate-600">
          Les devis réels restent visibles. Les estimations techniques et les hypothèses sont séparées. Aucun
          pourcentage n’est appliqué au budget total.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-[#1a3c5e] text-white">
                <th className="px-3 py-2 font-medium">Scénario</th>
                <th className="px-3 py-2 font-medium">Budget TTC</th>
                <th className="px-3 py-2 font-medium">Devis réel</th>
                <th className="px-3 py-2 font-medium">Estimations</th>
                <th className="px-3 py-2 font-medium">Hypothèses</th>
                <th className="px-3 py-2 font-medium">Aides</th>
                <th className="px-3 py-2 font-medium">Reste à charge</th>
                <th className="px-3 py-2 font-medium">Éco-PTZ</th>
              </tr>
            </thead>
            <tbody>
              {results.map(({ scenario, estimate }) => (
                <tr key={scenario.id} className="border-b border-slate-200 align-top">
                  <td className="px-3 py-2 font-medium">
                    {scenario.id} — {scenario.nomCourt}
                  </td>
                  <td className="px-3 py-2 tabular-nums">{formatEuro(scenario.totalTtc)}</td>
                  <td className="px-3 py-2 tabular-nums">{formatEuro(estimate.travauxDocumentesTtc)}</td>
                  <td className="px-3 py-2 tabular-nums">{formatEuro(estimate.travauxEstimesTtc)}</td>
                  <td className="px-3 py-2 tabular-nums">{formatEuro(estimate.travauxHypothesesTtc)}</td>
                  <td className="px-3 py-2 text-xs font-semibold uppercase text-slate-700">
                    {estimate.calculable ? montantOuBloque(estimate.totalAides, "NON CALCULABLES") : "NON CALCULABLES"}
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold uppercase text-slate-700">
                    {estimate.calculable ? montantOuBloque(estimate.resteACharge, "NON CALCULABLE") : "NON CALCULABLE"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {estimate.calculable ? "À confirmer" : "Simulation impossible"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {first && !first.calculable ? (
          <p className="mt-3 text-sm text-slate-700">{UMAFI.ecoPtzIndisponible}</p>
        ) : (
          <p className="mt-3 text-sm text-amber-900">{UMAFI.mensualiteDisclaimer}</p>
        )}
        {results.some((item) => item.estimate.calculable) ? (
          <div className="mt-4 space-y-3">
            {results
              .filter((item) => item.estimate.calculable)
              .map(({ scenario, estimate }) => (
                <article key={scenario.id} className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
                  <p className="font-semibold">
                    {scenario.id} — estimation contrôlée ({estimate.baremeVersion}) — {estimate.profileLabel}
                  </p>
                  <p className="mt-1 text-xs text-emerald-900">{estimate.profileMessage}</p>
                  <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                    <li>MaPrimeRénov’ : {montantOuBloque(estimate.mpr, "—")}</li>
                    <li>CEE : {montantOuBloque(estimate.cee, "—")}</li>
                    <li>Aides locales : {montantOuBloque(estimate.locales, "0,00 €")}</li>
                    <li>Autres (coup de pouce indicatif) : {montantOuBloque(estimate.autres, "—")}</li>
                    <li>Total aides (après cumul / écrêtement) : {montantOuBloque(estimate.totalAides, "—")}</li>
                    <li>Reste à charge : {montantOuBloque(estimate.resteACharge, "—")}</li>
                  </ul>
                  <p className="mt-2 text-xs text-slate-600">
                    Assiette éligible retenue : {formatEuro(estimate.depensesEligiblesHt)} HT / plafond{" "}
                    {estimate.plafondDepensesHt ? formatEuro(estimate.plafondDepensesHt) : "n.d."} HT. Statut{" "}
                    {estimate.status}.
                  </p>
                </article>
              ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-lg font-semibold">Financement UMAFI</h3>
        <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {UMAFI.mentionConventionB}
        </p>
        <p className="mt-3 text-sm text-slate-700">
          Interlocuteur : <strong>{UMAFI.contact.libelle}</strong>
        </p>
        {aidesBloquees ? (
          <p className="mt-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium">
            {UMAFI.etudeCapaciteClyve} Calcul de mensualité automatique bloqué : revenus du foyer non connus.
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={UMAFI.urls.travaux}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Simuler mon financement travaux
          </a>
          <a
            href={UMAFI.urls.regroupement}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Simuler mon regroupement de crédits
          </a>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">Liens partenaires — code apporteur {UMAFI.codeApporteur} (source=D4).</p>

        {showRegroupement ? (
          <p className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950">
            <strong>Regroupement de crédits (scénarios B / C ou reste à charge élevé).</strong> {UMAFI.regroupementTexte}
          </p>
        ) : null}

        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
          {UMAFI.acompteJ15}
        </p>

        <h4 className="mt-6 text-base font-semibold">Tableau de financement par scénario</h4>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-[#1a3c5e] text-white">
                <th className="px-3 py-2 font-medium">Ligne</th>
                {results.map(({ scenario }) => (
                  <th key={scenario.id} className="px-3 py-2 font-medium">
                    {scenario.id} — {scenario.nomCourt}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-3 py-2 font-medium">Coût TTC du projet</td>
                {results.map(({ scenario }) => (
                  <td key={scenario.id} className="px-3 py-2 tabular-nums">
                    {formatEuro(scenario.totalTtc)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-3 py-2 font-medium">(−) Aides estimées (MPR + CEE)</td>
                {results.map(({ scenario, estimate }) => (
                  <td key={scenario.id} className="px-3 py-2 text-xs font-semibold uppercase">
                    {estimate.calculable ? montantOuBloque(estimate.totalAides, "NON CALCULABLES") : "NON CALCULABLES"}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="px-3 py-2 font-medium">(=) Reste à charge net</td>
                {results.map(({ scenario, estimate }) => (
                  <td key={scenario.id} className="px-3 py-2 text-xs font-semibold uppercase">
                    {estimate.calculable ? montantOuBloque(estimate.resteACharge, "NON CALCULABLE") : "NON CALCULABLE"}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-3 py-2">Option 1 — Mensualité Éco-PTZ (si éligible)</td>
                {results.map(({ scenario, estimate }) => (
                  <td key={scenario.id} className="px-3 py-2 text-xs text-slate-700">
                    {estimate.calculable && estimate.resteACharge != null && estimate.ecoPtzPossible
                      ? `${formatEuro(round2(Math.min(estimate.resteACharge, AID_RULES_2026.ecoPtz.troisOuGlobal) / (20 * 12)))} / mois — Éco-PTZ taux 0 %, 20 ans, plafond ${AID_RULES_2026.ecoPtz.troisOuGlobal.toLocaleString("fr-FR")} € — sous réserve d’acceptation bancaire. Aucun taux d’intérêt n’est inventé.`
                      : UMAFI.ecoPtzIndisponible}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-3 py-2">Option 2 — Mensualité financement travaux UMAFI</td>
                {results.map(({ scenario }) => (
                  <td key={scenario.id} className="px-3 py-2 text-xs text-slate-700">
                    {UMAFI.etudeCapaciteClyve} Aucun taux n’est affiché (Convention B).
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-2">Option 3 — Impact mensuel regroupement de crédits</td>
                {results.map(({ scenario }) => (
                  <td key={scenario.id} className="px-3 py-2 text-xs text-slate-700">
                    {scenario.id === "A"
                      ? "Option possible — à chiffrer par UMAFI (crédits existants non connus)."
                      : UMAFI.regroupementTexte}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
