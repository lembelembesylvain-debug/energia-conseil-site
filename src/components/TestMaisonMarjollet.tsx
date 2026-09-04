import { useEffect, useState } from "react";
import EnergiaCoPilot from "./EnergiaCoPilot";
import PhotovoltaiqueBareme2026 from "./PhotovoltaiqueBareme2026";
import ProjectEstimation from "./ProjectEstimation";
import {
  MARJOLLET_AUDIT_ID,
  MARJOLLET_DEVIS_LIGNES,
  MARJOLLET_DEVIS_NUMERO,
  MARJOLLET_DEVIS_TOTAL_TTC,
  MARJOLLET_HREF,
  MARJOLLET_IDENTITE,
} from "../data/marjolletDossier";
import { generateDevisPdf } from "../lib/generateDevisPdf";

const CHAMPS = [
  { label: "Identifiant d’audit ENERGIA", valeur: MARJOLLET_AUDIT_ID },
  { label: "Client", valeur: MARJOLLET_IDENTITE.nom },
  { label: "Adresse du chantier", valeur: MARJOLLET_IDENTITE.adresse },
  { label: "Département", valeur: MARJOLLET_IDENTITE.departement },
  { label: "Type de projet", valeur: MARJOLLET_IDENTITE.typeProjet },
  { label: "Statut", valeur: MARJOLLET_IDENTITE.statut },
  { label: "Facture électrique actuelle", valeur: MARJOLLET_IDENTITE.factureElectrique },
  { label: "Apporteur d’affaires", valeur: MARJOLLET_IDENTITE.apporteur },
  { label: "Interlocuteur", valeur: MARJOLLET_IDENTITE.interlocuteur },
  { label: "Téléphone", valeur: MARJOLLET_IDENTITE.telephone },
  { label: "E-mail", valeur: MARJOLLET_IDENTITE.email },
  { label: "Date de création", valeur: "4 septembre 2026" },
];

/** Dossier CRM local — Monsieur Marjollet. Hors production. Prestations à saisir depuis le catalogue. */
export default function TestMaisonMarjollet() {
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfMessage, setPdfMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "TEST LOCAL — MARJOLLET | ENERGIA CONSEIL IA®";
  }, []);

  async function genererDevisPdfMarjollet() {
    setPdfBusy(true);
    setPdfMessage(null);
    try {
      await generateDevisPdf({
        numero: MARJOLLET_DEVIS_NUMERO,
        date: "4 septembre 2026",
        validite: "30 jours",
        clientNom: MARJOLLET_IDENTITE.nom,
        clientAdresse: MARJOLLET_IDENTITE.adresse,
        libelleProjet: MARJOLLET_IDENTITE.typeProjet,
        lignes: MARJOLLET_DEVIS_LIGNES.map((ligne) => ({
          designation: ligne.designation,
          quantite: ligne.quantite,
          unite: ligne.unite,
          prixUnitaireHt: null,
          montantHt: null,
          tauxTva: null,
        })),
        totalHt: null,
        totalTva: null,
        totalTtc: MARJOLLET_DEVIS_TOTAL_TTC,
        mentionTva:
          "TVA selon le régime applicable, à confirmer poste par poste. Le montant de 47 520 EUR TTC est un global estimatif. Le détail HT et la TVA par ligne seront établis après confirmation des taux applicables.",
        filename: "Devis_Marjollet_Projet_Complet.pdf",
      });
      setPdfMessage("PDF client généré. Vérifiez le logo sur la première page.");
    } catch (error) {
      setPdfMessage(error instanceof Error ? error.message : "Export PDF impossible.");
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Dossier de démonstration — hors production
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Dossier {MARJOLLET_IDENTITE.nom}
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
            Fiche d’estimation locale. Route{" "}
            <code className="text-sky-200">{MARJOLLET_HREF}</code> — identifiant{" "}
            <code className="text-sky-200">{MARJOLLET_AUDIT_ID}</code>. Aucune prestation ni montant
            n’est prérempli : les lignes se saisissent depuis le catalogue métiers.
          </p>
          <a href="/test-dashboard-crm#projets" className="text-sm font-medium text-emerald-300 hover:text-white">
            ← Retour aux projets CRM
          </a>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => void genererDevisPdfMarjollet()}
              disabled={pdfBusy}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pdfBusy ? "Génération PDF…" : "Télécharger le devis PDF client"}
            </button>
            {pdfMessage ? <p className="text-xs text-slate-300">{pdfMessage}</p> : null}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
          <h2 className="border-b border-slate-800 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-300 sm:px-5">
            Fiche client
          </h2>
          <dl className="divide-y divide-slate-800">
            {CHAMPS.map((champ) => (
              <div key={champ.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[14rem_1fr] sm:gap-4 sm:px-5">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{champ.label}</dt>
                <dd className="text-sm leading-relaxed text-white">{champ.valeur}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Estimation des travaux
          </h2>
          <PhotovoltaiqueBareme2026 />
          <p className="text-xs text-slate-500">
            Tableau vide au départ. Ajoutez les prestations depuis le catalogue métiers, puis
            enregistrez l’estimation (stockage local du navigateur). La TVA photovoltaïque
            (5,5 % ≤ 9 kWc / 20 % au-delà) s’applique automatiquement selon la puissance saisie.
          </p>
          <ProjectEstimation
            auditId={MARJOLLET_AUDIT_ID}
            clientNom={MARJOLLET_IDENTITE.nom}
            clientAdresse={MARJOLLET_IDENTITE.adresse}
            numeroDevis={MARJOLLET_DEVIS_NUMERO}
          />
        </section>
      </main>

      <EnergiaCoPilot
        syntheseAudit={`Dossier Monsieur Marjollet — ${MARJOLLET_IDENTITE.adresse}. ${MARJOLLET_IDENTITE.typeProjet}. Facture électrique actuelle ${MARJOLLET_IDENTITE.factureElectrique}. Aucune prestation ni montant n’est encore enregistré.`}
      />
    </div>
  );
}
