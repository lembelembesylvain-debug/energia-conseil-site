import { useEffect, useMemo, useState } from "react";
import ScenariosMaisonClyve from "./ScenariosMaisonClyve";
import { AidesFinancementPanel } from "./AidesFinancementPanel";
import ProjectEstimation from "./ProjectEstimation";
import type {
  AuditEnergetiqueModuleProps,
  Document,
  PaireAvantApres,
  Statut,
} from "../types/audit";
import {
  DEFAULT_STATUT_LEGENDES,
  buildGalerieAvantApres,
  formatSurfaceM2,
  sumPiecesPlan,
} from "../types/audit";

const STATUT_CLASS: Record<Statut, string> = {
  EXTRAIT: "bg-emerald-100 text-emerald-900 border-emerald-300",
  "À VÉRIFIER": "bg-amber-100 text-amber-950 border-amber-300",
  INCOHÉRENCE: "bg-red-100 text-red-900 border-red-300",
  "DONNÉE MANQUANTE": "bg-slate-200 text-slate-800 border-slate-400",
  "PRÊT POUR VALIDATION HUMAINE": "bg-sky-100 text-sky-950 border-sky-300",
  "AUDIT RÉGLEMENTAIRE REÇU": "bg-emerald-700 text-white border-emerald-800",
  "PRÊT POUR VALIDATION MAR": "bg-sky-700 text-white border-sky-800",
};

const DPE_CLASS: Record<string, string> = {
  G: "bg-[#e8412c] text-white",
  F: "bg-[#eb7d3b] text-white",
  E: "bg-[#f5b941] text-slate-950",
  D: "bg-[#f2e205] text-slate-950",
  C: "bg-[#8bd147] text-slate-950",
  B: "bg-[#52b147] text-white",
  A: "bg-[#00a651] text-white",
};

function Badge({ statut }: { statut: Statut }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUT_CLASS[statut]}`}
    >
      {statut}
    </span>
  );
}

function OrigineTag({ value }: { value: string }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
      Origine : {value}
    </span>
  );
}

function RichParagraph({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className={className}>
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </p>
  );
}

function SliderCompare({ avantSrc, apresSrc, apresLabel }: { avantSrc: string; apresSrc: string; apresLabel: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative h-48 overflow-hidden rounded-xl border sm:h-56">
      <img src={avantSrc} alt="Avant" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={apresSrc} alt="Après" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }} />
      <p className="absolute left-2 top-2 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] font-semibold text-white">
        AVANT — PHOTO RÉELLE
      </p>
      <p className="absolute right-2 top-2 rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-slate-950">
        {apresLabel}
      </p>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(event) => setPos(Number(event.target.value))}
        className="absolute bottom-3 left-4 right-4"
        aria-label="Comparer avant et après"
      />
    </div>
  );
}

function GalerieAvantApres({ paires }: { paires: PaireAvantApres[] }) {
  if (paires.length === 0) return null;
  return (
    <section id="galerie" className="space-y-4">
      <h2 className="text-xl font-semibold">Galerie avant / après</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {paires.map((paire) => (
          <article key={paire.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold">{paire.titre}</h3>
            <SliderCompare
              avantSrc={paire.avantSrc}
              apresSrc={paire.apresSrc}
              apresLabel={paire.apresLabel ?? "APRÈS"}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

export default function AuditEnergetiqueModule({
  projectData,
  auditData,
  documentsList,
  scenarios,
}: AuditEnergetiqueModuleProps) {
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    () => scenarios.find((item) => item.recommande)?.id ?? scenarios[0]?.id ?? "",
  );

  useEffect(() => {
    const previous = document.title;
    document.title = projectData.documentTitle ?? projectData.titre;
    return () => {
      document.title = previous;
    };
  }, [projectData.documentTitle, projectData.titre]);

  const visuels = documentsList.filter((doc) => doc.kind !== "devis" && (doc.imageSrc || doc.kind === "plan" || doc.origine !== "devis"));
  const devisDocs = documentsList.filter((doc) => doc.kind === "devis" || doc.origine === "devis");
  const legendes = auditData.statutLegendes?.length ? auditData.statutLegendes : DEFAULT_STATUT_LEGENDES;
  const piecesSomme = sumPiecesPlan(projectData.piecesPlan);
  const piecesSommeDetail =
    projectData.piecesPlanSommeDetail ?? `${formatSurfaceM2(piecesSomme)} — EXTRAIT plan`;

  const galerieDocuments = useMemo(() => {
    const documentPairs = documentsList.filter((doc) => {
      const avant = doc.photoAvantSrc ?? doc.imageSrc;
      return Boolean(avant && doc.photoApresSrc);
    });
    return buildGalerieAvantApres(documentPairs, []);
  }, [documentsList]);

  const documentsIntro =
    auditData.mentions?.documentsIntro ??
    `${visuels.length} visuels joints + ${devisDocs.length} devis PDF. Confiance = lisibilité de l’extraction, pas une validation technique de chantier.`;

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900">
      <header className="border-b-4 border-amber-500 bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {projectData.headerKicker ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-400">
              {projectData.headerKicker}
            </p>
          ) : null}
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{projectData.titre}</h1>
          {projectData.sousTitre ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">{projectData.sousTitre}</p>
          ) : null}
          <p className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {projectData.disclaimer}
          </p>
          {projectData.rapportHref ? (
            <a
              href={projectData.rapportHref}
              className="mt-4 mr-3 inline-flex rounded-full border border-amber-400 px-4 py-1.5 text-sm text-amber-100 hover:bg-amber-500/20"
            >
              Ouvrir le rapport complet avant / après
            </a>
          ) : null}
          {projectData.presentationHref ? (
            <a
              href={projectData.presentationHref}
              className="mt-4 inline-flex rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-slate-950 hover:bg-amber-400"
            >
              Lancer la Présentation
            </a>
          ) : null}
          {projectData.links?.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={
                link.variant === "primary"
                  ? "mt-4 mr-3 inline-flex rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-slate-950 hover:bg-amber-400"
                  : "mt-4 mr-3 inline-flex rounded-full border border-amber-400 px-4 py-1.5 text-sm text-amber-100 hover:bg-amber-500/20"
              }
            >
              {link.label}
            </a>
          ))}
        </div>
      </header>

      <nav
        className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur"
        aria-label="Sections de l’audit"
      >
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-2 text-xs font-medium sm:px-6">
          {[
            ["#documents", "1. Documents"],
            ...(galerieDocuments.length > 0 ? [["#galerie", "Avant / après"] as const] : []),
            ...(auditData.photoSlots?.length ? [["#photos", "Photos"] as const] : []),
            ["#logement", "2. Logement"],
            ...(auditData.pathologies?.length ? [["#pathologies", "Pathologies"] as const] : []),
            ["#devis", "3. Devis"],
            ["#controles", "4. Contrôles"],
            ["#statuts", "5. Statuts"],
            ["#scenarios", "Scénarios"],
            ["#travaux-financement", "Travaux & Financement"],
            ["#aides-financement", "Aides & financement"],
            ["#pre-rapport", "6. Pré-rapport"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-slate-700 hover:border-slate-900"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
        <section id="documents">
          <h2 className="text-xl font-semibold">1. Documents analysés</h2>
          <p className="mt-1 text-sm text-slate-600">{documentsIntro}</p>
          <div className="mt-4 grid gap-4">
            {documentsList.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                broken={Boolean(brokenImages[doc.id])}
                onBroken={() => setBrokenImages((prev) => ({ ...prev, [doc.id]: true }))}
              />
            ))}
          </div>
        </section>

        {auditData.performanceBanner ? (
          <section className="rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 to-white p-5 shadow-[0_0_32px_rgba(16,185,129,0.25)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-800">
              {auditData.performanceBanner.mention}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-bold ${DPE_CLASS[auditData.performanceBanner.dpeAvant] ?? "bg-slate-300"}`}
              >
                {auditData.performanceBanner.dpeAvant}
              </span>
              <span className="text-xl text-slate-500">➔</span>
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-bold ${DPE_CLASS[auditData.performanceBanner.dpeApres] ?? "bg-slate-300"}`}
              >
                {auditData.performanceBanner.dpeApres}
              </span>
              <p className="text-3xl font-black tracking-tight text-emerald-700">
                {auditData.performanceBanner.gain}
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              {auditData.performanceBanner.consoAvant} → {auditData.performanceBanner.consoApres}
              {" · "}
              {auditData.performanceBanner.reductionCo2}
            </p>
          </section>
        ) : null}

        <GalerieAvantApres paires={galerieDocuments} />

        {auditData.photoSlots && auditData.photoSlots.length > 0 ? (
          <section id="photos" className="space-y-3">
            <h2 className="text-xl font-semibold">Photos avant / après — chargement manuel</h2>
            <p className="text-sm text-slate-600">
              Emplacements réservés. Aucune photo n’est inventée : à charger manuellement (visite / client).
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {auditData.photoSlots.map((slot) => (
                <article
                  key={slot.id}
                  className="rounded-2xl border border-dashed border-slate-300 bg-white p-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {slot.cote === "avant" ? "AVANT — PHOTO RÉELLE" : "APRÈS — PHOTO RÉELLE"}
                  </p>
                  <h3 className="mt-1 font-semibold">{slot.titre}</h3>
                  <p className="mt-1 text-sm text-slate-600">{slot.description}</p>
                  <div className="mt-3 flex min-h-32 items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-500">
                    Emplacement vide — chargement manuel
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section id="logement">
          <h2 className="text-xl font-semibold">2. Données du logement</h2>
          <p className="mt-1 text-sm text-slate-600">
            {auditData.mentions?.logementIntro ??
              `Chaque ligne porte une origine. Les totaux non écrits sur le plan restent « ${projectData.missingLabel} ».`}
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Donnée</th>
                  <th className="px-3 py-2">Valeur</th>
                  <th className="px-3 py-2">Origine</th>
                  <th className="px-3 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {projectData.donneesLogement.map((row) => (
                  <tr key={row.libelle} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2 font-medium">{row.libelle}</td>
                    <td className="px-3 py-2">
                      {row.valeur}
                      {row.note ? <p className="mt-1 text-xs text-slate-500">{row.note}</p> : null}
                    </td>
                    <td className="px-3 py-2 text-xs uppercase">{row.origine}</td>
                    <td className="px-3 py-2">
                      <Badge statut={row.statut} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {projectData.piecesPlan.length > 0 ? (
            <>
              <h3 className="mt-6 text-base font-semibold">Pièces cotées sur le plan</h3>
              <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Pièce</th>
                      <th className="px-3 py-2">Surface (plan)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectData.piecesPlan.map((piece) => (
                      <tr key={piece.nom} className="border-t border-slate-100">
                        <td className="px-3 py-2">{piece.nom}</td>
                        <td className="px-3 py-2">{piece.surface}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-slate-200 bg-slate-50 font-medium">
                      <td className="px-3 py-2">Somme des pièces cotées</td>
                      <td className="px-3 py-2">{piecesSommeDetail}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </section>

        {auditData.pathologies && auditData.pathologies.length > 0 ? (
          <section id="pathologies" className="space-y-3">
            <h2 className="text-xl font-semibold">Pathologies visibles</h2>
            <p className="text-sm text-slate-600">
              Descriptions reprises de l’audit réglementaire. Photos associées : emplacements ci-dessus.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {auditData.pathologies.map((item) => (
                <article key={item.titre} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold">{item.titre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.description}</p>
                  {item.conseils ? <p className="mt-2 text-xs text-slate-500">{item.conseils}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section id="devis">
          <h2 className="text-xl font-semibold">3. Analyse des devis</h2>
          <p className="mt-1 text-sm text-slate-600">
            {auditData.mentions?.devisIntro ?? "Montants repris exactement depuis les documents fournis."}
          </p>
          <div className="mt-4 space-y-6">
            {projectData.devis.map((devis) => (
              <article
                key={devis.fichier}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold break-all">{devis.fichier}</h3>
                  <Badge statut={devis.statut} />
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Entreprise</dt>
                    <dd>{devis.entreprise}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Poste</dt>
                    <dd>{devis.poste}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Montant HT</dt>
                    <dd>{devis.ht}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">TVA</dt>
                    <dd>{devis.tva}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Montant TTC</dt>
                    <dd>{devis.ttc}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Date</dt>
                    <dd>{devis.date}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase text-slate-500">Validité</dt>
                    <dd>{devis.validite}</dd>
                  </div>
                </dl>
                <h4 className="mt-4 text-sm font-semibold">Lignes lues</h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-2 py-1">Réf.</th>
                        <th className="px-2 py-1">Désignation</th>
                        <th className="px-2 py-1">Montant lu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devis.lignes.map((ligne) => (
                        <tr key={ligne.ref} className="border-t border-slate-100">
                          <td className="px-2 py-1 align-top">{ligne.ref}</td>
                          <td className="px-2 py-1">{ligne.designation}</td>
                          <td className="whitespace-nowrap px-2 py-1">{ligne.montantHt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <h4 className="mt-4 text-sm font-semibold">Informations non lisibles</h4>
                <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
                  {devis.nonLisible.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {devis.notes.map((note) => (
                    <li key={note}>— {note}</li>
                  ))}
                </ul>
                <OrigineTag value="devis" />
              </article>
            ))}
          </div>
        </section>

        <section id="controles">
          <h2 className="text-xl font-semibold">4. Contrôles de cohérence</h2>
          <div className="mt-4 space-y-3">
            {auditData.controles.map((item) => (
              <article key={item.titre} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{item.titre}</h3>
                  <Badge statut={item.statut} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="statuts">
          <h2 className="text-xl font-semibold">5. Statuts</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {legendes.map((item) => (
              <li key={item.statut} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                <Badge statut={item.statut} />
                <p className="mt-2 text-slate-700">{item.texte}</p>
              </li>
            ))}
          </ul>
          {auditData.statutGlobal ? (
            <p className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm">
              {auditData.statutGlobal.label ?? "Statut global du dossier :"}{" "}
              <Badge statut={auditData.statutGlobal.statut} /> {auditData.statutGlobal.texte}
            </p>
          ) : null}
        </section>

        <section id="scenarios">
          <ScenariosMaisonClyve
            scenarios={scenarios}
            intro={projectData.scenariosIntro}
            presentationHref={projectData.presentationHref}
            mentions={auditData.mentions}
            disclaimer={projectData.disclaimer}
            pdfTitle={projectData.titre}
            selectedScenarioId={selectedScenarioId}
            onSelectScenario={setSelectedScenarioId}
            foyer={projectData.foyer}
          />
        </section>

        <section id="travaux-financement" className="scroll-mt-16 space-y-6">
          <h2 className="text-xl font-semibold">Travaux & Financement</h2>
          <ProjectEstimation auditId={auditData.id ?? auditData.projectId ?? projectData.id ?? ""} />
        </section>

        {projectData.foyer ? (
          <section id="aides-financement" className="scroll-mt-16">
            <AidesFinancementPanel
              foyer={projectData.foyer}
              scenarios={scenarios}
              alertesCorpus={auditData.alertesAides}
            />
          </section>
        ) : null}

        <section id="pre-rapport" className="rounded-2xl border-2 border-slate-900 bg-white p-5">
          <h2 className="text-xl font-semibold">6. Pré-rapport — synthèse de travail</h2>
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950">
            {projectData.disclaimer}
          </p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-800">
            {auditData.preRapport.map((paragraphe) => (
              <RichParagraph key={paragraphe.slice(0, 80)} text={paragraphe} />
            ))}
          </div>
          {auditData.alertesAides && auditData.alertesAides.length > 0 ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-950">Alertes (pré-rapport interne)</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-950">
                {auditData.alertesAides.map((alerte) => (
                  <li key={alerte}>{alerte}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {projectData.footer ? <p className="mt-6 text-xs text-slate-500">{projectData.footer}</p> : null}
        </section>
      </main>
    </div>
  );
}

function DocumentCard({
  doc,
  broken,
  onBroken,
}: {
  doc: Document;
  broken: boolean;
  onBroken: () => void;
}) {
  const previewSrc = doc.imageSrc ?? doc.photoAvantSrc;
  const showImage = Boolean(previewSrc) && !broken;
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[180px_1fr]">
        {showImage ? (
          <img
            src={previewSrc}
            alt=""
            className="h-40 w-full object-cover md:h-full"
            onError={onBroken}
          />
        ) : (
          <div className="flex min-h-24 items-center justify-center bg-slate-50 px-3 text-center text-xs text-slate-500">
            {doc.origine === "devis" || doc.kind === "devis" ? "PDF" : "Aperçu non chargé en local"}
          </div>
        )}
        <div className="space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold break-all">{doc.nom}</h3>
            <Badge statut={doc.statut} />
          </div>
          <p className="text-sm text-slate-700">{doc.type}</p>
          <OrigineTag value={doc.origine} />
          <p className="text-xs text-slate-500">Niveau de confiance : {doc.confiance}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {doc.extraits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
