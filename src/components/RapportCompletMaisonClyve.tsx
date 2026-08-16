import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  ACTIONS_SUIVI,
  AVERTISSEMENTS,
  CATEGORIES_PHOTO,
  CONTROLES,
  DATE_TEST,
  DEVIS,
  DEVIS_FICHES,
  DISCLAIMER,
  DOCUMENTS,
  DONNEES_LOGEMENT,
  DONNEES_MANQUANTES,
  DRAFT_STORAGE_KEY,
  ENCADRE_TOITURE,
  INCOHERENCES_TOITURE,
  MANQUANT,
  PATHOLOGIES,
  PHASES,
  PHOTOS_AVANT,
  PIECES_PLAN,
  POINTS_A_CONFIRMER,
  PREPARATION_RAPPORT_FINAL,
  RECOMMANDATIONS,
  STATUT_DOCUMENT,
  TITRE_RAPPORT,
  type ActionStatut,
  type AfterPhoto,
  type CategoriePhoto,
  type ComparisonState,
  type RapportDraft,
  type StatutRapport,
  type ValidationDecision,
  type ValidationState,
} from "../data/rapportCompletMaisonClyve";
import { generateRapportClyvePdf } from "../lib/generateRapportClyvePdf";

const STATUT_CLASS: Record<StatutRapport, string> = {
  EXTRAIT: "bg-emerald-100 text-emerald-900 border-emerald-300",
  CONFIRMÉ: "bg-emerald-200 text-emerald-950 border-emerald-400",
  "À VÉRIFIER": "bg-amber-100 text-amber-950 border-amber-300",
  "DONNÉE MANQUANTE": "bg-slate-200 text-slate-800 border-slate-400",
  INCOHÉRENCE: "bg-red-100 text-red-900 border-red-300",
  HYPOTHÈSE: "bg-violet-100 text-violet-950 border-violet-300",
  "VALIDÉ PAR HUMAIN": "bg-sky-200 text-sky-950 border-sky-400",
  "PRÊT POUR VALIDATION HUMAINE": "bg-sky-100 text-sky-950 border-sky-300",
  "À COMPLÉTER": "bg-orange-100 text-orange-950 border-orange-300",
  "À VÉRIFIER AVANT ENGAGEMENT": "bg-red-50 text-red-950 border-red-400",
};

const EMPTY_AFTER: AfterPhoto = {
  dataUrl: "",
  datePrise: "",
  entreprise: "",
  description: "",
  travauxRealises: "",
  commentaire: "",
};

const EMPTY_VALIDATION: ValidationState = {
  nom: "",
  date: "",
  commentaire: "",
  reserves: "",
  decision: "BROUILLON",
};

const SECTIONS = [
  ["#garde", "1. Garde"],
  ["#avertissement", "2. Avertissement"],
  ["#synthese", "3. Synthèse"],
  ["#documents", "4. Documents"],
  ["#logement", "5. État actuel"],
  ["#pathologies", "6. Pathologies"],
  ["#devis", "7. Devis"],
  ["#recommandations", "8. Recommandations"],
  ["#phases", "9. Plan d’action"],
  ["#photos-avant", "10. Photos avant"],
  ["#photos-apres", "11. Photos après"],
  ["#comparaison", "12. Comparaison"],
  ["#manquantes", "13. Données manquantes"],
  ["#controles", "14. Contrôles"],
  ["#validation", "15. Validation"],
  ["#final", "16. Rapport final"],
] as const;

function Badge({ statut }: { statut: StatutRapport }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUT_CLASS[statut]}`}
    >
      {statut}
    </span>
  );
}

function PageBanner() {
  return (
    <p className="clyve-page-banner rounded-lg border border-amber-400 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950 print:border-amber-700">
      {DISCLAIMER}
    </p>
  );
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="clyve-section space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 print:break-before-page print:shadow-none">
      <PageBanner />
      <h2 className="text-xl font-semibold text-slate-900">
        {number}. {title}
      </h2>
      {children}
    </section>
  );
}

function loadDraft(): RapportDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RapportDraft;
  } catch {
    return null;
  }
}

function emptyDraft(): RapportDraft {
  return {
    afterPhotos: {},
    comparisons: {},
    validation: EMPTY_VALIDATION,
    actionStatuts: Object.fromEntries(ACTIONS_SUIVI.map((item) => [item.id, item.statutInitial])) as Record<
      string,
      ActionStatut
    >,
  };
}

export default function RapportCompletMaisonClyve() {
  const [draft, setDraft] = useState<RapportDraft>(emptyDraft);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "Pré-rapport Maison Clyve — test local | ENERGIA CONSEIL IA®";
    const saved = loadDraft();
    if (saved) setDraft({ ...emptyDraft(), ...saved, validation: { ...EMPTY_VALIDATION, ...saved.validation } });
    return () => {
      document.title = previous;
    };
  }, []);

  const photosAvantAvecImage = useMemo(
    () => PHOTOS_AVANT.filter((item) => item.imageSrc),
    [],
  );

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3500);
  }

  function saveDraft(next = draft) {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
      flash("Brouillon enregistré localement (pas de Supabase).");
    } catch {
      const lite: RapportDraft = {
        ...next,
        afterPhotos: Object.fromEntries(
          Object.entries(next.afterPhotos).map(([key, value]) => [
            key,
            value ? { ...value, dataUrl: value.dataUrl ? "[photo locale non stockée — quota]" : "" } : value,
          ]),
        ),
      };
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(lite));
        flash("Brouillon enregistré sans les fichiers photo (quota navigateur).");
      } catch {
        flash("Enregistrement impossible : quota navigateur dépassé.");
      }
    }
  }

  function updateAfter(categorie: CategoriePhoto, patch: Partial<AfterPhoto>) {
    setDraft((prev) => ({
      ...prev,
      afterPhotos: {
        ...prev.afterPhotos,
        [categorie]: { ...(prev.afterPhotos[categorie] ?? EMPTY_AFTER), ...patch },
      },
    }));
  }

  function onAfterFile(categorie: CategoriePhoto, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      flash("Fichier refusé : une image est attendue. Aucune photo n’a été générée.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      updateAfter(categorie, { dataUrl: reader.result });
    };
    reader.readAsDataURL(file);
  }

  function updateComparison(id: string, patch: Partial<ComparisonState>) {
    setDraft((prev) => ({
      ...prev,
      comparisons: {
        ...prev.comparisons,
        [id]: {
          descriptionChangement: "",
          travauxConcernes: "",
          dateApres: "",
          comment: "",
          validated: false,
          validatedAt: "",
          validatedBy: "",
          ...prev.comparisons[id],
          ...patch,
        },
      },
    }));
  }

  function validateComparison(id: string, categorie: CategoriePhoto) {
    const after = draft.afterPhotos[categorie];
    if (!after?.dataUrl) {
      flash("Impossible de valider : photo après travaux absente.");
      return;
    }
    if (!draft.validation.nom.trim()) {
      flash("Indiquez le nom du valideur (section 15) avant de valider une comparaison.");
      return;
    }
    updateComparison(id, {
      validated: true,
      validatedAt: new Date().toLocaleString("fr-FR"),
      validatedBy: draft.validation.nom.trim(),
    });
  }

  function setDecision(decision: ValidationDecision) {
    if (decision === "PRÉ-RAPPORT VALIDÉ" && !draft.validation.nom.trim()) {
      flash("Nom du valideur obligatoire.");
      return;
    }
    setDraft((prev) => ({
      ...prev,
      validation: {
        ...prev.validation,
        decision,
        date: prev.validation.date || new Date().toISOString().slice(0, 10),
      },
    }));
  }

  async function exportPdf() {
    setPdfBusy(true);
    try {
      await generateRapportClyvePdf({
        afterPhotos: draft.afterPhotos,
        comparisons: draft.comparisons,
        validation: draft.validation,
        actionStatuts: draft.actionStatuts,
      });
      flash("PDF exporté (pré-rapport interne).");
    } catch (error) {
      flash(error instanceof Error ? error.message : "Export PDF impossible.");
    } finally {
      setPdfBusy(false);
    }
  }

  const blocked = draft.validation.decision === "DOSSIER BLOQUÉ";
  const validated = draft.validation.decision === "PRÉ-RAPPORT VALIDÉ";

  return (
    <div className={`min-h-dvh bg-slate-100 text-slate-900 ${preview ? "clyve-preview" : ""}`}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .clyve-section { break-inside: avoid; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .clyve-preview .clyve-toolbar { position: sticky; }
      `}</style>

      <header className="border-b-4 border-amber-500 bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-400">
            Test local — ne pas publier — hors production
          </p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{TITRE_RAPPORT}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Route dédiée <code className="text-amber-200">/test-maison-clyve/rapport-complet</code>.
            Corpus unique du test Maison Clyve. Aucune donnée inventée. Aucun résultat énergétique calculé.
          </p>
          <p className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {DISCLAIMER}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <a href="/test-maison-clyve" className="rounded-full border border-slate-600 px-3 py-1 hover:border-amber-400">
              ← Test documents
            </a>
            <span className="rounded-full border border-slate-600 px-3 py-1">Statut : {STATUT_DOCUMENT}</span>
            <span className="rounded-full border border-slate-600 px-3 py-1">Date test : {DATE_TEST}</span>
          </div>
        </div>
      </header>

      <div className="clyve-toolbar no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2 sm:px-6">
          <button type="button" className="rounded-full border px-3 py-1 text-xs" onClick={() => setPreview((v) => !v)}>
            {preview ? "Fermer la prévisualisation" : "Prévisualiser le rapport"}
          </button>
          <button type="button" className="rounded-full border px-3 py-1 text-xs" onClick={() => exportPdf()} disabled={pdfBusy}>
            {pdfBusy ? "Export PDF…" : "Exporter en PDF"}
          </button>
          <button type="button" className="rounded-full border px-3 py-1 text-xs" onClick={() => window.print()}>
            Imprimer
          </button>
          <button type="button" className="rounded-full border px-3 py-1 text-xs" onClick={() => saveDraft()}>
            Enregistrer le brouillon
          </button>
          {message ? <span className="text-xs text-emerald-800">{message}</span> : null}
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-2 text-[11px] font-medium sm:px-6" aria-label="Sections">
          {SECTIONS.map(([href, label]) => (
            <a key={href} href={href} className="shrink-0 rounded-full border border-slate-200 px-2 py-1 text-slate-700 hover:border-slate-900">
              {label}
            </a>
          ))}
        </nav>
      </div>

      {(blocked || validated) && (
        <div className={`mx-auto max-w-6xl px-4 pt-4 sm:px-6 ${blocked ? "text-red-900" : "text-sky-900"}`}>
          <p className={`rounded-xl border px-3 py-2 text-sm ${blocked ? "border-red-300 bg-red-50" : "border-sky-300 bg-sky-50"}`}>
            Décision humaine : {draft.validation.decision}
            {draft.validation.nom ? ` — ${draft.validation.nom}` : ""}.
            Ce document n’est toujours pas un audit réglementaire.
          </p>
        </div>
      )}

      <div ref={reportRef} className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <Section id="garde" number={1} title="Page de garde">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-slate-500">Document</dt>
              <dd>{TITRE_RAPPORT}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Identité lue</dt>
              <dd>Mme ANDRIOT Clyve (noms lus sur devis et plan)</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Adresse lue</dt>
              <dd>654 route départementale 975 / 654 RD 975, 71290 — LA GENETE / LA GENÊTE</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Émetteur</dt>
              <dd>ENERGIA-CONSEIL IA® — préparation interne, test local</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Date du test</dt>
              <dd>{DATE_TEST}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Statut</dt>
              <dd>
                <Badge statut="À VÉRIFIER" /> {STATUT_DOCUMENT}
              </dd>
            </div>
          </dl>
          <p className="text-sm text-slate-600">
            Type observé : longère (EXTRAIT photo). Surface des pièces cotées : 153 m² (EXTRAIT plan).
            SHAB totale : {MANQUANT}
          </p>
        </Section>

        <Section id="avertissement" number={2} title="Avertissement et statut du document">
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-800">
            {AVERTISSEMENTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-sm">
            Statuts utilisés : EXTRAIT, CONFIRMÉ, À VÉRIFIER, DONNÉE MANQUANTE, INCOHÉRENCE, HYPOTHÈSE, VALIDÉ PAR HUMAIN.
            Rien n’est CONFIRMÉ ni VALIDÉ PAR HUMAIN tant qu’un humain ne l’a pas décidé en section 15.
          </p>
        </Section>

        <Section id="synthese" number={3} title="Synthèse exécutive">
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              Dossier test « Maison Clyve » : 8 visuels (7 photos + 1 plan) et 3 devis PDF au nom de Mme ANDRIOT Clyve.
              Bâtiment de type longère. Les photos montrent une toiture dégradée, un jour visible depuis l’intérieur,
              un enduit manquant, des traces d’humidité, une fissure et de la végétation sur un pignon.
            </p>
            <p>
              Le plan permet d’additionner <strong>153,00 m²</strong> de pièces cotées. Cette somme n’est pas une SHAB
              écrite. Couloir et salles d’eau communes : {MANQUANT}
            </p>
            <p>
              Toiture : deux offres <strong>non cumulables</strong> — Faivre 15/03/2022, 48 879,20 € HT / 53 767,12 € TTC
              (360 m² couverture / 505 m² découverture) ; Madinier 25/10/2021, total unique 57 850,00 € (HT/TTC non
              distingués, 450 m²). Maçonnerie MTL 14/04/2022 : 25 239,00 € HT / 27 762,90 € TTC. Devis échus.
            </p>
            <p>
              Chauffage, ventilation, tableau électrique, DPE : données manquantes. Aucune classe énergétique, aucune
              aide, aucune économie annuelle n’est affichée.
            </p>
          </div>
        </Section>

        <Section id="documents" number={4} title="Documents analysés">
          <div className="grid gap-4">
            {DOCUMENTS.map((doc) => (
              <article key={doc.nom} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="grid gap-0 md:grid-cols-[160px_1fr]">
                  {doc.imageSrc && !brokenImages[doc.nom] ? (
                    <img
                      src={doc.imageSrc}
                      alt={doc.nom}
                      className="h-36 w-full object-cover md:h-full"
                      onError={() => setBrokenImages((prev) => ({ ...prev, [doc.nom]: true }))}
                    />
                  ) : (
                    <div className="flex min-h-20 items-center justify-center bg-slate-50 px-3 text-center text-xs text-slate-500">
                      {doc.type.startsWith("Devis") ? "PDF — pas d’aperçu image" : "Aperçu non chargé"}
                    </div>
                  )}
                  <div className="space-y-1 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold break-all">{doc.nom}</h3>
                      <Badge statut={doc.statut} />
                    </div>
                    <p className="text-sm">{doc.type}</p>
                    <p className="text-[11px] uppercase text-slate-500">
                      Origine : {doc.origine} — confiance : {doc.confiance}
                    </p>
                    <ul className="list-disc pl-5 text-sm">
                      {doc.extraits.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section id="logement" number={5} title="État actuel du logement">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Donnée</th>
                  <th className="px-3 py-2">Valeur</th>
                  <th className="px-3 py-2">Origine</th>
                  <th className="px-3 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {DONNEES_LOGEMENT.map((row) => (
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
          <h3 className="text-base font-semibold">Pièces cotées sur le plan</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Pièce</th>
                  <th className="px-3 py-2">Surface (plan)</th>
                  <th className="px-3 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {PIECES_PLAN.map((piece) => (
                  <tr key={piece.nom} className="border-t border-slate-100">
                    <td className="px-3 py-2">{piece.nom}</td>
                    <td className="px-3 py-2">{piece.surface}</td>
                    <td className="px-3 py-2">
                      <Badge statut="EXTRAIT" />
                    </td>
                  </tr>
                ))}
                <tr className="border-t bg-slate-50 font-medium">
                  <td className="px-3 py-2">Somme des pièces cotées</td>
                  <td className="px-3 py-2">153,00 m² — ce n’est pas une SHAB confirmée</td>
                  <td className="px-3 py-2">
                    <Badge statut="EXTRAIT" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="pathologies" number={6} title="Analyse des pathologies visibles">
          <p className="text-sm text-slate-600">
            Observations visuelles uniquement. Une photo ne constitue pas un diagnostic structurel.
          </p>
          <div className="grid gap-3">
            {PATHOLOGIES.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{item.titre}</h3>
                  <Badge statut={item.statut} />
                </div>
                <p className="mt-2 text-sm">{item.observation}</p>
                <p className="mt-1 text-xs text-slate-500">Source : {item.source} — confiance : {item.confiance}</p>
                <p className="mt-1 text-xs text-amber-900">{item.nePasConclure}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="devis" number={7} title="Analyse des devis">
          <div className="rounded-xl border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-semibold text-red-950">
            {ENCADRE_TOITURE}
          </div>
          <ul className="list-disc pl-5 text-sm">
            {INCOHERENCES_TOITURE.map((item) => (
              <li key={item}>
                <Badge statut="INCOHÉRENCE" /> {item}
              </li>
            ))}
          </ul>
          <div className="space-y-5">
            {DEVIS_FICHES.map((fiche) => {
              const detail = DEVIS.find((item) => item.fichier === fiche.fichier);
              return (
                <article key={fiche.fichier} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold break-all">{fiche.fichier}</h3>
                    <Badge statut={fiche.statut} />
                  </div>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase text-slate-500">Entreprise</dt>
                      <dd>{fiche.entreprise}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-slate-500">Date</dt>
                      <dd>{fiche.date}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-slate-500">Numéro de devis</dt>
                      <dd>{fiche.numero}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-slate-500">Nature des travaux</dt>
                      <dd>{fiche.nature}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-slate-500">Montant HT</dt>
                      <dd>{fiche.ht}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-slate-500">TVA</dt>
                      <dd>{fiche.tva}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-slate-500">Montant TTC</dt>
                      <dd>{fiche.ttc}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase text-slate-500">Surface annoncée</dt>
                      <dd>{fiche.surfaceAnnoncee}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs uppercase text-slate-500">Validité</dt>
                      <dd>{fiche.validite}</dd>
                    </div>
                  </dl>
                  <h4 className="mt-3 text-sm font-semibold">Observations</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {fiche.observations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {detail ? (
                    <div className="mt-3 overflow-x-auto">
                      <table className="min-w-full text-left text-xs">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-2 py-1">Réf.</th>
                            <th className="px-2 py-1">Désignation</th>
                            <th className="px-2 py-1">Montant lu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.lignes.map((ligne) => (
                            <tr key={ligne.ref} className="border-t">
                              <td className="px-2 py-1">{ligne.ref}</td>
                              <td className="px-2 py-1">{ligne.designation}</td>
                              <td className="whitespace-nowrap px-2 py-1">{ligne.montantHt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </Section>

        <Section id="recommandations" number={8} title="Recommandations prioritaires">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase tracking-wide text-white">
                <tr>
                  <th className="px-2 py-2">Priorité</th>
                  <th className="px-2 py-2">Recommandation</th>
                  <th className="px-2 py-2">Motif</th>
                  <th className="px-2 py-2">Source</th>
                  <th className="px-2 py-2">Risque si non traité</th>
                  <th className="px-2 py-2">Action suivante</th>
                  <th className="px-2 py-2">Responsable</th>
                  <th className="px-2 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {RECOMMANDATIONS.map((item) => (
                  <tr key={item.priorite} className="border-t align-top">
                    <td className="px-2 py-2 font-semibold">P{item.priorite}</td>
                    <td className="px-2 py-2">
                      <strong>{item.titre}.</strong> {item.recommandation}
                    </td>
                    <td className="px-2 py-2">
                      <ul className="list-disc pl-4">
                        {item.motif.map((motif) => (
                          <li key={motif}>{motif}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-2 py-2">{item.source}</td>
                    <td className="px-2 py-2">{item.risque}</td>
                    <td className="px-2 py-2">
                      <ul className="list-disc pl-4">
                        {item.actionSuivante.map((action) => (
                          <li key={action}>{action}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-2 py-2">{item.responsable}</td>
                    <td className="px-2 py-2">
                      <Badge statut={item.statut} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="phases" number={9} title="Plan d’action par phases">
          <div className="grid gap-3">
            {PHASES.map((phase) => (
              <article key={phase.id} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{phase.titre}</h3>
                  <Badge statut={phase.statut} />
                </div>
                <p className="mt-2 text-sm">{phase.contenu}</p>
              </article>
            ))}
          </div>
          <h3 className="text-base font-semibold">Tableau de suivi</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-2 py-2">Action</th>
                  <th className="px-2 py-2">Priorité</th>
                  <th className="px-2 py-2">Responsable</th>
                  <th className="px-2 py-2">Date prévue</th>
                  <th className="px-2 py-2">Date réalisée</th>
                  <th className="px-2 py-2">Document attendu</th>
                  <th className="px-2 py-2">Photo avant</th>
                  <th className="px-2 py-2">Photo après</th>
                  <th className="px-2 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {ACTIONS_SUIVI.map((item) => (
                  <tr key={item.id} className="border-t align-top">
                    <td className="px-2 py-2">{item.action}</td>
                    <td className="px-2 py-2">P{item.priorite}</td>
                    <td className="px-2 py-2">{item.responsable}</td>
                    <td className="px-2 py-2">{item.datePrevue}</td>
                    <td className="px-2 py-2">{item.dateRealisee}</td>
                    <td className="px-2 py-2">{item.documentAttendu}</td>
                    <td className="px-2 py-2">{item.photoAvantRequise}</td>
                    <td className="px-2 py-2">{item.photoApresRequise}</td>
                    <td className="px-2 py-2">
                      <select
                        className="rounded border px-1 py-1 text-xs"
                        value={draft.actionStatuts[item.id] ?? item.statutInitial}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            actionStatuts: {
                              ...prev.actionStatuts,
                              [item.id]: event.target.value as ActionStatut,
                            },
                          }))
                        }
                      >
                        {["À faire", "En cours", "Bloqué", "À valider", "Validé", "Terminé"].map((statut) => (
                          <option key={statut} value={statut}>
                            {statut}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="photos-avant" number={10} title="Galerie photos avant travaux">
          <div className="grid gap-4 md:grid-cols-2">
            {PHOTOS_AVANT.map((photo) => (
              <article key={photo.id} className="overflow-hidden rounded-xl border">
                {photo.imageSrc && !brokenImages[photo.id] ? (
                  <img
                    src={photo.imageSrc}
                    alt={photo.nom}
                    className="h-52 w-full object-cover"
                    onError={() => setBrokenImages((prev) => ({ ...prev, [photo.id]: true }))}
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-slate-100 px-3 text-center text-sm text-slate-600">
                    Photo avant non fournie dans le corpus — {photo.categorie}
                  </div>
                )}
                <div className="space-y-1 p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{photo.categorie}</h3>
                    <Badge statut={photo.statut} />
                  </div>
                  <p><span className="text-xs uppercase text-slate-500">Nom :</span> {photo.nom}</p>
                  <p><span className="text-xs uppercase text-slate-500">Date :</span> {photo.date}</p>
                  <p><span className="text-xs uppercase text-slate-500">Source :</span> {photo.source}</p>
                  <p>{photo.description}</p>
                  <p className="text-xs text-slate-500">Niveau de confiance : {photo.confiance}</p>
                  <ul className="list-disc pl-5 text-xs">
                    {photo.observations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section id="photos-apres" number={11} title="Galerie photos après travaux">
          <p className="text-sm text-amber-900">
            Aucune photo après travaux n’est générée ni dupliquée depuis l’avant. Chaque emplacement reste à compléter.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {CATEGORIES_PHOTO.map((categorie) => {
              const after = draft.afterPhotos[categorie];
              return (
                <article key={categorie} className="rounded-xl border border-dashed border-slate-400 p-3">
                  {after?.dataUrl ? (
                    <img src={after.dataUrl} alt={`Après travaux — ${categorie}`} className="mb-3 h-44 w-full rounded object-cover" />
                  ) : (
                    <div className="mb-3 flex h-40 items-center justify-center rounded bg-slate-50 text-center text-sm text-slate-600">
                      Emplacement vide — À compléter
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{categorie}</h3>
                    <Badge statut="À COMPLÉTER" />
                  </div>
                  <div className="mt-2 grid gap-2 text-sm">
                    <label>
                      Date de prise de vue
                      <input
                        type="date"
                        className="mt-1 w-full rounded border px-2 py-1"
                        value={after?.datePrise ?? ""}
                        onChange={(event) => updateAfter(categorie, { datePrise: event.target.value })}
                      />
                    </label>
                    <label>
                      Entreprise
                      <input
                        className="mt-1 w-full rounded border px-2 py-1"
                        value={after?.entreprise ?? ""}
                        onChange={(event) => updateAfter(categorie, { entreprise: event.target.value })}
                      />
                    </label>
                    <label>
                      Description
                      <textarea
                        className="mt-1 w-full rounded border px-2 py-1"
                        value={after?.description ?? ""}
                        onChange={(event) => updateAfter(categorie, { description: event.target.value })}
                      />
                    </label>
                    <label>
                      Travaux réalisés
                      <textarea
                        className="mt-1 w-full rounded border px-2 py-1"
                        value={after?.travauxRealises ?? ""}
                        onChange={(event) => updateAfter(categorie, { travauxRealises: event.target.value })}
                      />
                    </label>
                    <label>
                      Commentaire
                      <textarea
                        className="mt-1 w-full rounded border px-2 py-1"
                        value={after?.commentaire ?? ""}
                        onChange={(event) => updateAfter(categorie, { commentaire: event.target.value })}
                      />
                    </label>
                    <input
                      ref={(el) => {
                        fileInputs.current[categorie] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => onAfterFile(categorie, event)}
                    />
                    <button
                      type="button"
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
                      onClick={() => fileInputs.current[categorie]?.click()}
                    >
                      Ajouter une photo après travaux
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </Section>

        <Section id="comparaison" number={12} title="Comparaison avant / après">
          <div className="grid gap-4">
            {photosAvantAvecImage.map((photo) => {
              const after = draft.afterPhotos[photo.categorie];
              const cmp = draft.comparisons[photo.id];
              return (
                <article key={photo.id} className="rounded-xl border p-3">
                  <h3 className="font-semibold">{photo.categorie}</h3>
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase text-slate-500">Photo avant</p>
                      <img src={photo.imageSrc} alt={`Avant ${photo.nom}`} className="mt-1 h-44 w-full rounded object-cover" />
                      <p className="mt-1 text-xs">Date avant : {photo.date}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">Photo après</p>
                      {after?.dataUrl ? (
                        <img src={after.dataUrl} alt={`Après ${photo.categorie}`} className="mt-1 h-44 w-full rounded object-cover" />
                      ) : (
                        <div className="mt-1 flex h-44 items-center justify-center rounded bg-slate-50 p-3 text-center text-sm text-slate-600">
                          Photo après travaux non disponible — à compléter après réalisation.
                        </div>
                      )}
                      <p className="mt-1 text-xs">Date après : {after?.datePrise || MANQUANT}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    <label>
                      Description du changement
                      <textarea
                        className="mt-1 w-full rounded border px-2 py-1"
                        value={cmp?.descriptionChangement ?? ""}
                        onChange={(event) => updateComparison(photo.id, { descriptionChangement: event.target.value })}
                      />
                    </label>
                    <label>
                      Travaux concernés
                      <textarea
                        className="mt-1 w-full rounded border px-2 py-1"
                        value={cmp?.travauxConcernes ?? ""}
                        onChange={(event) => updateComparison(photo.id, { travauxConcernes: event.target.value })}
                      />
                    </label>
                    <label className="md:col-span-2">
                      Commentaire
                      <textarea
                        className="mt-1 w-full rounded border px-2 py-1"
                        value={cmp?.comment ?? ""}
                        onChange={(event) => updateComparison(photo.id, { comment: event.target.value })}
                      />
                    </label>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge statut={cmp?.validated ? "VALIDÉ PAR HUMAIN" : "À VÉRIFIER"} />
                    <button
                      type="button"
                      className="rounded-lg border border-slate-900 px-3 py-1.5 text-sm"
                      onClick={() => validateComparison(photo.id, photo.categorie)}
                    >
                      Valider la comparaison
                    </button>
                    {cmp?.validated ? (
                      <span className="text-xs text-slate-500">
                        {cmp.validatedBy} — {cmp.validatedAt}
                      </span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </Section>

        <Section id="manquantes" number={13} title="Données manquantes et points à confirmer">
          <h3 className="text-base font-semibold">Données manquantes</h3>
          <ul className="list-disc pl-5 text-sm">
            {DONNEES_MANQUANTES.map((item) => (
              <li key={item}>
                <Badge statut="DONNÉE MANQUANTE" /> {item}
              </li>
            ))}
          </ul>
          <h3 className="text-base font-semibold">Points à confirmer</h3>
          <ul className="list-disc pl-5 text-sm">
            {POINTS_A_CONFIRMER.map((item) => (
              <li key={item}>
                <Badge statut="À VÉRIFIER" /> {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="controles" number={14} title="Contrôles de cohérence">
          <div className="space-y-3">
            {CONTROLES.map((item) => (
              <article key={item.titre} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{item.titre}</h3>
                  <Badge statut={item.statut} />
                </div>
                <p className="mt-2 text-sm">{item.detail}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="validation" number={15} title="Validation humaine">
          <p className="rounded-xl border border-amber-400 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950">
            Ce rapport contient des extractions, observations et hypothèses. Il ne constitue pas un audit réglementaire final.
          </p>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <label>
              Nom du valideur
              <input
                className="mt-1 w-full rounded border px-2 py-1"
                value={draft.validation.nom}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, validation: { ...prev.validation, nom: event.target.value } }))
                }
              />
            </label>
            <label>
              Date
              <input
                type="date"
                className="mt-1 w-full rounded border px-2 py-1"
                value={draft.validation.date}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, validation: { ...prev.validation, date: event.target.value } }))
                }
              />
            </label>
            <label className="md:col-span-2">
              Commentaire
              <textarea
                className="mt-1 w-full rounded border px-2 py-1"
                value={draft.validation.commentaire}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    validation: { ...prev.validation, commentaire: event.target.value },
                  }))
                }
              />
            </label>
            <label className="md:col-span-2">
              Réserves
              <textarea
                className="mt-1 w-full rounded border px-2 py-1"
                value={draft.validation.reserves}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, validation: { ...prev.validation, reserves: event.target.value } }))
                }
              />
            </label>
          </div>
          <p className="text-sm">
            Décision actuelle : <strong>{draft.validation.decision}</strong>
          </p>
          <div className="no-print flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-amber-600 px-3 py-2 text-sm text-amber-950"
              onClick={() => setDecision("CORRECTION DEMANDÉE")}
            >
              Demander correction
            </button>
            <button
              type="button"
              className="rounded-lg bg-sky-800 px-3 py-2 text-sm text-white"
              onClick={() => setDecision("PRÉ-RAPPORT VALIDÉ")}
            >
              Valider le pré-rapport
            </button>
            <button
              type="button"
              className="rounded-lg bg-red-800 px-3 py-2 text-sm text-white"
              onClick={() => setDecision("DOSSIER BLOQUÉ")}
            >
              Bloquer le dossier
            </button>
          </div>
        </Section>

        <Section id="final" number={16} title="Préparation du rapport final">
          <p className="text-sm">
            Le présent document prépare un rapport final. Il ne le remplace pas. Les éléments suivants restent
            indispensables avant tout audit réglementaire, DPE ou devis ENERGIA.
          </p>
          <ul className="list-disc pl-5 text-sm">
            {PREPARATION_RAPPORT_FINAL.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">
            ENERGIA CONSEIL IA® — 16 rue Cuvier, 69006 Lyon — contact@energia-conseil-ia.com — page locale
            /test-maison-clyve/rapport-complet — hors production — Supabase non connecté.
          </p>
        </Section>
      </div>
    </div>
  );
}
