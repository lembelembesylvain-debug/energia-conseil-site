import { useMemo, useState } from "react";
import {
  EMMY_CUMAC,
  estimationCentraleEur,
  fichesRadarParSegment,
  operationsB2b,
  volumeCumacDepuisEuros,
  type SegmentCee,
} from "../../lib/crm/ceeRadarTravaux";
import { telechargerNoteOpportuniteCee } from "../../lib/crm/noteOpportuniteCeePdf";
import CeeTrendBadge from "./CeeTrendBadge";
import FicheStrategieCee from "./FicheStrategieCee";
import { ficheStrategiqueParCode } from "../../lib/crm/fichesStrategiquesCee";

type Filtre = "tous" | SegmentCee;
type ActifNote = SegmentCee;

const ACTIFS_NOTE: { id: ActifNote; label: string; detail: string }[] = [
  { id: "industrie", label: "Industriel", detail: "Usine / site" },
  { id: "tertiaire", label: "Tertiaire", detail: "Bâtiment > 1 000 m²" },
  { id: "residentiel", label: "Résidentiel", detail: "Maison et logement" },
];

const FILTRES: { id: Filtre; label: string }[] = [
  { id: "tous", label: "Toutes les fiches" },
  { id: "residentiel", label: "🏡 Résidentiel — Fiches BAR" },
  { id: "tertiaire", label: "🏢 Tertiaire & Bureaux — Fiches BAT" },
  { id: "industrie", label: "🏭 Industrie & Usines — Fiches IND" },
];

function euro(montant: number) {
  return montant.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function primeAffichee(fiche: { prime: string; estimationMinEur: number; estimationMaxEur: number }) {
  if (fiche.estimationMinEur === fiche.estimationMaxEur || fiche.prime.includes("€")) return fiche.prime;
  return `${fiche.prime} · ${euro(fiche.estimationMinEur)} à ${euro(fiche.estimationMaxEur)}`;
}

export default function RadarCeeMarches({ voirMarges = false }: { voirMarges?: boolean }) {
  const [ficheCode, setFicheCode] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [actif, setActif] = useState<ActifNote>("industrie");
  const [operationId, setOperationId] = useState("ind-ut-117");
  const [site, setSite] = useState("");

  const fiches = useMemo(() => fichesRadarParSegment(filtre), [filtre]);
  const toutesOperations = useMemo(() => fichesRadarParSegment("tous"), []);
  const operation = toutesOperations.find((fiche) => fiche.id === operationId) ?? toutesOperations[0];

  const choisirActif = (next: ActifNote) => {
    setActif(next);
    const suite = operationsB2b(next);
    setOperationId(suite[0]?.id ?? "");
  };

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-amber-400/30 bg-slate-950 shadow-lg shadow-slate-950/40">
        <header className="border-b border-slate-800 px-5 py-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200">
            Chasse B2B
          </p>
          <h2 className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-100">
            Simulateur express — industrie, tertiaire, résidentiel
          </h2>
          <p className="mt-1 max-w-3xl text-xs text-slate-400">
            Estimation immédiate de la subvention CEE, avant visite de site. La note PDF reprend la fiche choisie.
          </p>
        </header>
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
          <div className="space-y-4">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Site ou raison sociale</span>
              <input
                value={site}
                onChange={(event) => setSite(event.target.value)}
                placeholder="Nom du site"
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-300"
              />
            </label>
            <fieldset>
              <legend className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Type d&apos;actif</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {ACTIFS_NOTE.map((item) => {
                  const selectionne = actif === item.id;
                  const ton =
                    item.id === "industrie"
                      ? "border-amber-300 bg-amber-400/10 text-amber-100"
                      : item.id === "tertiaire"
                        ? "border-sky-300 bg-sky-400/10 text-sky-100"
                        : "border-emerald-300 bg-emerald-400/10 text-emerald-100";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => choisirActif(item.id)}
                      aria-pressed={selectionne}
                      className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold ${
                        selectionne ? ton : "border-slate-700 bg-slate-900 text-slate-300"
                      }`}
                    >
                      {item.label}
                      <span className="mt-0.5 block text-[11px] font-medium text-slate-400">{item.detail}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Opération ciblée — {toutesOperations.length} fiches
              </span>
              <select
                data-testid="select-operation-cee"
                value={operation.id}
                onChange={(event) => {
                  const id = event.target.value;
                  setOperationId(id);
                  const choisie = toutesOperations.find((fiche) => fiche.id === id);
                  if (choisie) setActif(choisie.segment);
                }}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-300"
              >
                {ACTIFS_NOTE.map((groupe) => (
                  <optgroup key={groupe.id} label={`${groupe.label} — ${groupe.detail}`}>
                    {toutesOperations
                      .filter((fiche) => fiche.segment === groupe.id)
                      .map((fiche) => (
                        <option key={fiche.id} value={fiche.id}>
                          {fiche.code} — {fiche.intitule}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>
          </div>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4" aria-live="polite">
            <p className="font-mono text-[11px] font-semibold text-amber-100">{operation.code}</p>
            <p className="mt-0.5 text-sm font-medium text-white">{operation.intitule}</p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {operation.primeLibelle}
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-amber-200">
              {euro(estimationCentraleEur(operation))}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Fourchette {euro(operation.estimationMinEur)} à {euro(operation.estimationMaxEur)}
              {operation.prime.includes("%") ? ` · ${operation.prime}` : ""}
            </p>
            <p className="mt-3 text-xs text-slate-300">
              Volume {volumeCumacDepuisEuros(operation.estimationMinEur, operation.estimationMaxEur)}
            </p>
            <p className="mt-2 text-sm font-medium text-white">{operation.argumentCle}</p>
            <button
              type="button"
              onClick={() => telechargerNoteOpportuniteCee({ fiche: operation, site })}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-3 text-sm font-semibold text-slate-950 hover:from-amber-300 hover:to-orange-300"
            >
              Générer la Note d&apos;Opportunité CEE B2B (PDF)
            </button>
            {ficheStrategiqueParCode(operation.code) ? (
              <button
                type="button"
                onClick={() => setFicheCode(operation.code)}
                className="mt-2 w-full rounded-xl border border-amber-300/50 px-3 py-3 text-sm font-semibold text-amber-100 hover:bg-amber-400/10"
              >
                Fiche technique {operation.code}
              </button>
            ) : null}
          </article>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-slate-950/40">
        <header className="border-b border-slate-800 px-5 py-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-lime-300">
            Prospection chantiers
          </p>
          <h2 className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-100">
            Matrice des marchés CEE — résidentiel, tertiaire, industrie
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-400">
            Prime, volume cumac et argument de vente. La bourse EMMY sert de cours de valorisation.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 bg-slate-950/60 px-5 py-3 font-mono text-xs text-slate-300">
          <span aria-hidden>{EMMY_CUMAC.emoji}</span>
          <span className="text-slate-400">{EMMY_CUMAC.titre}</span>
          <span>
            {EMMY_CUMAC.unite} Classique{" "}
            <strong className="font-semibold text-lime-300">{EMMY_CUMAC.classique}</strong>
          </span>
          <CeeTrendBadge tone="fluo" label="Hausse" />
          <span className="text-slate-600" aria-hidden>
            ·
          </span>
          <span>
            Précarité <strong className="font-semibold text-lime-300">{EMMY_CUMAC.precarite}</strong>
          </span>
          <CeeTrendBadge tone="fluo" label="Hausse" />
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-800 px-4 py-3" role="tablist" aria-label="Filtrer les fiches CEE">
          {FILTRES.map((item) => {
            const actifFiltre = filtre === item.id;
            const compte = fichesRadarParSegment(item.id).length;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={actifFiltre}
                onClick={() => setFiltre(item.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  actifFiltre
                    ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
                    : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                }`}
              >
                {item.label}
                <span className="ml-1.5 font-mono text-[10px] text-slate-400">{compte}</span>
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[68rem] text-left text-sm">
            <caption className="sr-only">
              Matrice CEE : prime, volume cumac, argument de vente et cibles. {fiches.length} fiches affichées.
            </caption>
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Fiche</th>
                <th className="px-4 py-3 font-medium">Travaux</th>
                <th className="px-4 py-3 font-medium">Prime / prise en charge</th>
                <th className="px-4 py-3 font-medium">Volume CEE</th>
                <th className="px-4 py-3 font-medium">Argument clé</th>
                <th className="px-4 py-3 font-medium">Tendance</th>
                <th className="px-4 py-3 font-medium">Cibles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {fiches.map((fiche) => (
                <tr key={fiche.id} id={fiche.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="mr-2" aria-hidden>
                      {fiche.emoji}
                    </span>
                    <span className="font-mono text-xs font-semibold text-white">{fiche.code}</span>
                    <button
                      type="button"
                      onClick={() => telechargerNoteOpportuniteCee({ fiche, site })}
                      className="mt-2 block rounded-lg bg-lime-400/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-lime-200 ring-1 ring-lime-400/40 hover:bg-lime-400/25"
                      aria-label={`Générer la note d'opportunité PDF ${fiche.code}`}
                    >
                      Note PDF
                    </button>
                    {ficheStrategiqueParCode(fiche.code) ? (
                      <button
                        type="button"
                        onClick={() => setFicheCode(fiche.code)}
                        className="mt-2 block rounded-lg border border-amber-300/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-100 hover:bg-amber-400/10"
                      >
                        Fiche
                      </button>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-slate-200">{fiche.intitule}</td>
                  <td className="px-4 py-4">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">{fiche.primeLibelle}</p>
                    <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-slate-100">{primeAffichee(fiche)}</p>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs tabular-nums text-lime-200">
                    {volumeCumacDepuisEuros(fiche.estimationMinEur, fiche.estimationMaxEur)}
                  </td>
                  <td className="max-w-xs px-4 py-4 text-xs leading-relaxed text-amber-100">{fiche.argumentCle}</td>
                  <td className="px-4 py-4">
                    <CeeTrendBadge tone={fiche.tone} label={fiche.tendance} />
                  </td>
                  <td className="px-4 py-4 text-xs leading-relaxed text-slate-300">{fiche.cibles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="border-t border-slate-800 px-5 py-3 text-[10px] leading-relaxed text-slate-500">
          Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du
          client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE. Les volumes
          cumac sont déduits des fourchettes euros au cours EMMY classique de 7,45 €/MWh cumac. Le signal
          « obligation 2027 » sur BAR-TH-173 est un repère commercial, à confirmer au dossier.
        </p>
      </section>
      <FicheStrategieCee code={ficheCode} onClose={() => setFicheCode(null)} voirMarges={voirMarges} />
    </div>
  );
}
