import { useMemo, useState } from "react";
import { generateScenariosClyvePdf } from "../lib/generateScenariosClyvePdf";
import { calculateAidEstimate } from "../lib/calculateAidEstimate";
import { UMAFI } from "../data/umafi";
import type { AuditMentions, Scenario, StatutScenarioVisuel, WorkItem } from "../types/audit";
import { formatEuro } from "../types/audit";
import type { AidEstimateResult, FoyerAides } from "../types/aides";

const BANDEAU_WOW = "PROJECTION WOW — APRÈS TRAVAUX — À VALIDER";
const LABEL_AVANT = "AVANT — PHOTO RÉELLE";
const LABEL_APRES_REEL = "APRÈS — PHOTO RÉELLE";
const LEGENDE_WOW =
  "Simulation visuelle indicative basée sur les photos et documents disponibles. Elle ne constitue pas une photographie du résultat final, un plan architectural définitif ou un engagement contractuel.";
const DISCLAIMER_SCENARIOS_DEFAULT =
  "Les scénarios présentés sont des simulations de travail basées sur les devis fournis et des estimations techniques. Ils ne constituent pas un audit réglementaire officiel ni un engagement contractuel d’aides ou de financement. Validation humaine par le MAR obligatoire.";

const DPE_CLASS: Record<string, string> = {
  G: "bg-[#e8412c] text-white",
  F: "bg-[#eb7d3b] text-white",
  E: "bg-[#f5b941] text-slate-950",
  D: "bg-[#f2e205] text-slate-950",
  C: "bg-[#8bd147] text-slate-950",
  B: "bg-[#52b147] text-white",
  A: "bg-[#00a651] text-white",
};

const STATUT_CLASS: Record<StatutScenarioVisuel, string> = {
  "PHOTO AVANT CONFIRMÉE": "bg-emerald-100 text-emerald-900 border-emerald-300",
  "PROJECTION WOW À VALIDER": "bg-orange-100 text-orange-950 border-orange-300",
  "VALIDÉE PAR HUMAIN": "bg-sky-200 text-sky-950 border-sky-400",
  "PHOTO APRÈS TRAVAUX RÉELLE À AJOUTER": "bg-slate-200 text-slate-800 border-slate-400",
};

function DpeTag({ lettre }: { lettre: string }) {
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded text-sm font-bold ${DPE_CLASS[lettre] ?? "bg-slate-300"}`}
    >
      {lettre}
    </span>
  );
}

function BadgeStatut({ statut }: { statut: StatutScenarioVisuel }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUT_CLASS[statut]}`}
    >
      {statut}
    </span>
  );
}

function SliderCompare({ avantSrc, apresSrc }: { avantSrc: string; apresSrc: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative h-48 overflow-hidden rounded-xl border sm:h-56">
      <img src={avantSrc} alt="Avant réel" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={apresSrc} alt="Projection WOW illustrative" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }} />
      <p className="absolute left-2 top-2 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] font-semibold text-white">
        {LABEL_AVANT}
      </p>
      <p className="absolute right-2 top-2 rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-slate-950">
        {BANDEAU_WOW}
      </p>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(event) => setPos(Number(event.target.value))}
        className="absolute bottom-3 left-4 right-4"
        aria-label="Comparer avant et projection"
      />
    </div>
  );
}

function LotsParNiveau({ lots }: { lots: WorkItem[] }) {
  const groupes: { source: WorkItem["source"]; titre: string; className: string }[] = [
    { source: "DEVIS RÉEL", titre: "Devis réel", className: "bg-emerald-50" },
    { source: "ESTIMATION TECHNIQUE", titre: "Estimation technique", className: "bg-amber-50" },
    { source: "HYPOTHÈSE", titre: "Hypothèse non documentée", className: "bg-slate-100" },
  ];
  return (
    <div className="mt-3 space-y-3">
      {groupes.map((groupe) => {
        const items = lots.filter((lot) => lot.source === groupe.source);
        if (items.length === 0) return null;
        return (
          <div key={groupe.source}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{groupe.titre}</p>
            <ul className="mt-1 space-y-2 text-sm">
              {items.map((lot) => (
                <li key={lot.libelle} className={`rounded-lg px-2 py-1.5 ${groupe.className}`}>
                  <p>
                    <span className="font-medium">{lot.libelle}</span>
                    <span className="float-right font-semibold tabular-nums">{formatEuro(lot.montantTtc)}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-600">{lot.detail}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {lot.source} — {lot.reference}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function CarteScenario({
  scenario,
  selected,
  statutWow,
  comparing,
  photoApresReelle,
  pdfBusy,
  onSelect,
  onCompare,
  onValidate,
  onDownload,
  onAddPhotoApres,
  aidesLabel,
  racLabel,
  ecoPtzMessage,
}: {
  scenario: Scenario;
  selected: boolean;
  statutWow: StatutScenarioVisuel;
  comparing: boolean;
  photoApresReelle?: string;
  pdfBusy: boolean;
  onSelect: () => void;
  onCompare: () => void;
  onValidate: () => void;
  onDownload: () => void;
  onAddPhotoApres: (dataUrl: string) => void;
  aidesLabel: string;
  racLabel: string;
  ecoPtzMessage: string;
}) {
  const apresSrc = photoApresReelle ?? scenario.photoApresSrc ?? scenario.projectionWowSrc;
  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white p-4 shadow-sm ${
        scenario.recommande || selected
          ? "border-amber-400 shadow-amber-200/70 ring-2 ring-amber-300"
          : "border-slate-200"
      }`}
    >
      <button type="button" className="text-left" onClick={onSelect}>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Option {scenario.id}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              scenario.recommande ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-white"
            }`}
          >
            {scenario.badge}
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-snug">{scenario.titre}</h3>
        <p className="mt-1 text-sm text-slate-700">{scenario.objectif}</p>
      </button>

      {scenario.dpeAvantHypothese && scenario.dpeApresHypothese ? (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 ${
            /−80\s*%|-80\s*%/.test(scenario.gainDeperditionsHypothese ?? "")
              ? "border-emerald-400 bg-emerald-50 shadow-[0_0_24px_rgba(16,185,129,0.35)]"
              : "border-dashed border-amber-300 bg-amber-50"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-900">
            {scenario.dpeOfficiel ? "DPE — audit réglementaire" : "DPE — hypothèse de travail"}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <DpeTag lettre={scenario.dpeAvantHypothese} />
            <span className="text-sm text-slate-600">➔</span>
            <DpeTag lettre={scenario.dpeApresHypothese} />
            {scenario.gainDeperditionsHypothese ? (
              <span className="text-sm font-bold text-emerald-800">
                Gain {scenario.gainDeperditionsHypothese}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[11px] leading-snug text-amber-950">
            {scenario.dpeCaption ??
              (scenario.dpeOfficiel
                ? "Données issues de l’audit réglementaire."
                : "Aucun DPE au corpus. Non calculé, non garanti.")}
          </p>
        </div>
      ) : null}

      <p className="mt-4 text-3xl font-bold tabular-nums tracking-tight">{formatEuro(scenario.totalTtc)}</p>
      <p className="text-xs text-slate-500">Budget total TTC</p>

      <LotsParNiveau lots={scenario.lotsInclus} />
      <ul className="mt-2 space-y-1 text-sm text-slate-700">
        {scenario.lotsExclus.map((item) => (
          <li key={item}>
            <span aria-hidden>❌ </span>
            {item}
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
        <div className="flex justify-between gap-2">
          <dt>Aides</dt>
          <dd className="font-semibold uppercase">{aidesLabel}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Reste à charge</dt>
          <dd className="font-semibold uppercase">{racLabel}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Éco-PTZ</dt>
          <dd className="mt-0.5 text-slate-700">{ecoPtzMessage}</dd>
        </div>
      </dl>

      {scenario.photoAvantSrc ? (
        <div className="mt-4 space-y-2">
          <figure className="overflow-hidden rounded-xl border">
            <p className="bg-slate-900 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white">
              {LABEL_AVANT}
            </p>
            <img src={scenario.photoAvantSrc} alt={scenario.photoAvantNom ?? "Photo avant"} className="h-40 w-full object-cover" />
            <figcaption className="px-2 py-1 text-center text-[10px] text-slate-500">
              Photo réelle non retouchée{scenario.photoAvantNom ? ` — ${scenario.photoAvantNom}` : ""}
            </figcaption>
          </figure>
          {scenario.projectionWowSrc ? (
            <figure className="overflow-hidden rounded-xl border border-amber-300">
              <p className="bg-amber-500 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-950">
                {BANDEAU_WOW}
              </p>
              <img
                src={scenario.projectionWowSrc}
                alt={`Projection WOW option ${scenario.id}`}
                className="h-40 w-full object-cover"
              />
              <figcaption className="px-2 py-1.5 text-center text-[10px] leading-snug text-slate-600">
                {LEGENDE_WOW}
              </figcaption>
            </figure>
          ) : null}
          <div className="flex flex-wrap gap-1">
            <BadgeStatut statut="PHOTO AVANT CONFIRMÉE" />
            <BadgeStatut statut={statutWow} />
            {photoApresReelle ? null : <BadgeStatut statut="PHOTO APRÈS TRAVAUX RÉELLE À AJOUTER" />}
          </div>
          {photoApresReelle ? (
            <figure className="overflow-hidden rounded-xl border border-emerald-400">
              <p className="bg-emerald-800 px-2 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white">
                {LABEL_APRES_REEL}
              </p>
              <img src={photoApresReelle} alt={`Après réel option ${scenario.id}`} className="h-40 w-full object-cover" />
              <figcaption className="px-2 py-1 text-center text-[10px] text-slate-500">
                Photo réelle après travaux — distincte de la projection WOW.
              </figcaption>
            </figure>
          ) : (
            <label className="block cursor-pointer rounded-lg border border-dashed border-slate-300 px-3 py-2 text-center text-xs text-slate-600">
              Ajouter une photo après réelle (optionnel)
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === "string") onAddPhotoApres(reader.result);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          )}
        </div>
      ) : null}

      {scenario.transformations.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Légende des transformations</p>
          <ul className="mt-1 list-disc pl-4 text-xs text-slate-700">
            {scenario.transformations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {scenario.sources.length > 0 ? (
        <p className="mt-2 text-xs text-slate-500">
          Sources : {scenario.sources.join(" · ")} — Confiance : {scenario.confiance}
        </p>
      ) : null}

      {comparing && scenario.photoAvantSrc && apresSrc ? (
        <div className="mt-3">
          <SliderCompare avantSrc={scenario.photoAvantSrc} apresSrc={apresSrc} />
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {scenario.photoAvantSrc && apresSrc ? (
          <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" onClick={onCompare}>
            {comparing ? "Fermer la comparaison" : "Comparer avant / après"}
          </button>
        ) : null}
        <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={onDownload} disabled={pdfBusy}>
          Télécharger la comparaison
        </button>
        {statutWow !== "VALIDÉE PAR HUMAIN" ? (
          <button
            type="button"
            className="rounded-lg border border-sky-700 px-3 py-2 text-sm text-sky-900"
            onClick={onValidate}
          >
            Valider cette projection
          </button>
        ) : null}
      </div>
    </article>
  );
}

export type ScenariosAuditPanelProps = {
  scenarios: Scenario[];
  intro?: string;
  presentationHref?: string;
  mentions?: AuditMentions;
  disclaimer?: string;
  pdfTitle?: string;
  selectedScenarioId?: string;
  onSelectScenario?: (id: string) => void;
  foyer?: FoyerAides;
};

export default function ScenariosMaisonClyve({
  scenarios,
  intro,
  presentationHref,
  mentions,
  disclaimer = DISCLAIMER_SCENARIOS_DEFAULT,
  pdfTitle,
  selectedScenarioId,
  onSelectScenario,
  foyer,
}: ScenariosAuditPanelProps) {
  const recommendedId = scenarios.find((item) => item.recommande)?.id ?? scenarios[0]?.id ?? "";
  const [internalSelected, setInternalSelected] = useState(recommendedId);
  const selectedId = selectedScenarioId ?? internalSelected;
  const [compareId, setCompareId] = useState<string | null>(null);
  const [statutsWow, setStatutsWow] = useState<Record<string, StatutScenarioVisuel>>(() =>
    Object.fromEntries(scenarios.map((item) => [item.id, "PROJECTION WOW À VALIDER" as StatutScenarioVisuel])),
  );
  const [photosApres, setPhotosApres] = useState<Partial<Record<string, string>>>({});
  const [pdfBusy, setPdfBusy] = useState(false);
  const [message, setMessage] = useState("");

  const selectedScenario = scenarios.find((item) => item.id === selectedId) ?? scenarios[0];
  const estimates = useMemo((): Record<string, AidEstimateResult> => {
    if (!foyer) return {};
    return Object.fromEntries(
      scenarios.map((scenario) => [
        scenario.id,
        calculateAidEstimate({
          foyer,
          budgetTtc: scenario.totalTtc,
          lots: scenario.lotsInclus,
          scenarioId: scenario.id,
        }),
      ]),
    );
  }, [foyer, scenarios]);

  function selectScenario(id: string) {
    setInternalSelected(id);
    onSelectScenario?.(id);
  }

  async function download(scenario?: Scenario) {
    setPdfBusy(true);
    try {
      await generateScenariosClyvePdf({
        scenarios: scenario ? [scenario] : scenarios,
        statutsWow,
        photosApresReelles: photosApres,
        titre: pdfTitle,
        filePrefix: "scenarios-audit",
        mentionDpe: mentions?.dpe,
        mentionAides: mentions?.aides,
        mentionDevisNonCumulable: mentions?.devisNonCumulable,
        aidesBloquees: !foyer || Object.values(estimates).every((item) => !item.calculable),
      });
      setMessage("PDF téléchargé.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Export PDF impossible.");
    } finally {
      setPdfBusy(false);
      window.setTimeout(() => setMessage(""), 3500);
    }
  }

  const mentionsBandeau = [mentions?.toiture, mentions?.devisNonCumulable].filter(Boolean).join(" ");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Scénarios de travaux</h2>
          {intro ? <p className="mt-1 max-w-3xl text-sm text-slate-600">{intro}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {presentationHref ? (
            <a
              href={presentationHref}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              Lancer la Présentation
            </a>
          ) : null}
          <button
            type="button"
            className="rounded-lg border border-slate-900 px-4 py-2 text-sm"
            onClick={() => download()}
            disabled={pdfBusy}
          >
            {pdfBusy ? "Export…" : "Exporter le PDF des scénarios"}
          </button>
        </div>
      </div>

      {message ? <p className="text-sm text-emerald-800">{message}</p> : null}

      {mentionsBandeau ? (
        <p className="rounded-lg border border-amber-400 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {mentionsBandeau}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const estimate = estimates[scenario.id];
          const aidesLabel =
            estimate?.calculable && estimate.totalAides != null
              ? `${formatEuro(estimate.totalAides)} (indicatif)`
              : "NON CALCULABLES";
          const racLabel =
            estimate?.calculable && estimate.resteACharge != null
              ? `${formatEuro(estimate.resteACharge)} (indicatif)`
              : "NON CALCULABLE";
          return (
            <CarteScenario
              key={scenario.id}
              scenario={scenario}
              selected={selectedId === scenario.id}
              statutWow={statutsWow[scenario.id] ?? "PROJECTION WOW À VALIDER"}
              comparing={compareId === scenario.id}
              photoApresReelle={photosApres[scenario.id] ?? scenario.photoApresSrc}
              pdfBusy={pdfBusy}
              onSelect={() => selectScenario(scenario.id)}
              onCompare={() => setCompareId((current) => (current === scenario.id ? null : scenario.id))}
              onValidate={() =>
                setStatutsWow((current) => ({ ...current, [scenario.id]: "VALIDÉE PAR HUMAIN" }))
              }
              onDownload={() => download(scenario)}
              onAddPhotoApres={(dataUrl) => setPhotosApres((current) => ({ ...current, [scenario.id]: dataUrl }))}
              aidesLabel={aidesLabel}
              racLabel={racLabel}
              ecoPtzMessage={estimate?.ecoPtzMessage ?? UMAFI.ecoPtzIndisponible}
            />
          );
        })}
      </div>

      {selectedScenario ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
          <h3 className="text-lg font-semibold">Recommandations — option {selectedScenario.id}</h3>
          <p className="mt-1 text-sm text-slate-700">{selectedScenario.objectif}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-800">
            {selectedScenario.lotsInclus.map((lot) => (
              <li key={lot.libelle}>
                {lot.libelle} — {formatEuro(lot.montantTtc)} ({lot.source})
              </li>
            ))}
          </ul>
          {selectedScenario.notesTechniques.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              {selectedScenario.notesTechniques.map((note) => (
                <li key={note}>— {note}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        Le simulateur pédagogique (profils Bleu / Jaune / Violet / Rose à taux libres) a été retiré. Le calcul
        contrôlé, les données foyer et le financement UMAFI sont dans la section{" "}
        <a href="#aides-financement" className="font-semibold underline">
          Aides et financement
        </a>
        .
      </p>

      <p className="rounded-xl border-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
        {mentions?.scenarios ?? disclaimer}
      </p>
    </div>
  );
}
