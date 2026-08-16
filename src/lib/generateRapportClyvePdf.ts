import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AVERTISSEMENTS,
  CATEGORIES_PHOTO,
  DEVIS_FICHES,
  DISCLAIMER,
  DONNEES_MANQUANTES,
  ENCADRE_TOITURE,
  INCOHERENCES_TOITURE,
  PATHOLOGIES,
  PHOTOS_AVANT,
  POINTS_A_CONFIRMER,
  PREPARATION_RAPPORT_FINAL,
  RECOMMANDATIONS,
  TITRE_RAPPORT,
  type AfterPhoto,
  type CategoriePhoto,
  type ComparisonState,
  type ValidationState,
} from "../data/rapportCompletMaisonClyve";

const MARGIN = 14;
const PAGE_W = 210;
const PAGE_H = 297;
const NAVY: [number, number, number] = [15, 23, 42];
const AMBER: [number, number, number] = [180, 83, 9];
const GRAY: [number, number, number] = [71, 85, 105];

function t(value: string): string {
  return value
    .replace(/’/g, "'")
    .replace(/‘/g, "'")
    .replace(/“|”/g, '"')
    .replace(/–|—/g, "-")
    .replace(/€/g, " EUR");
}

async function loadImageDataUrl(src: string): Promise<string | null> {
  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function header(doc: jsPDF, page: number, total: number) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 18, "F");
  doc.setTextColor(253, 230, 138);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(t(DISCLAIMER), PAGE_W / 2, 7, { align: "center", maxWidth: PAGE_W - 16 });
  doc.setTextColor(226, 232, 240);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("ENERGIA-CONSEIL IA - test local Maison Clyve - hors production", MARGIN, 14);
  doc.text(`Page ${page}/${total}`, PAGE_W - MARGIN, 14, { align: "right" });
  doc.setTextColor(0, 0, 0);
}

function footerNote(doc: jsPDF) {
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text(
    t("Pre-rapport interne. Validation humaine obligatoire. Non constitutif d'un audit reglementaire."),
    PAGE_W / 2,
    PAGE_H - 8,
    { align: "center" },
  );
  doc.setTextColor(0, 0, 0);
}

function ensureSpace(doc: jsPDF, y: number, need: number): number {
  if (y + need < PAGE_H - 16) return y;
  doc.addPage();
  return 26;
}

function title(doc: jsPDF, y: number, text: string): number {
  y = ensureSpace(doc, y, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text(t(text), MARGIN, y);
  doc.setTextColor(0, 0, 0);
  return y + 8;
}

function para(doc: jsPDF, y: number, text: string, size = 9): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  const lines = doc.splitTextToSize(t(text), PAGE_W - MARGIN * 2) as string[];
  for (const line of lines) {
    y = ensureSpace(doc, y, 6);
    doc.text(line, MARGIN, y);
    y += 5;
  }
  return y + 2;
}

export async function generateRapportClyvePdf(input: {
  afterPhotos: Partial<Record<CategoriePhoto, AfterPhoto>>;
  comparisons: Record<string, ComparisonState>;
  validation: ValidationState;
  actionStatuts: Record<string, string>;
}): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 26;

  y = title(doc, y, TITRE_RAPPORT);
  y = para(doc, y, "Client lu sur devis et plan : Mme ANDRIOT Clyve.");
  y = para(doc, y, "Adresse lue : 654 route departementale 975 / 654 RD 975, 71290 - graphie LA GENETE / LA GENETE.");
  y = para(doc, y, `Statut du document : BROUILLON. Date du test : 16/08/2026.`);
  y = para(doc, y, DISCLAIMER, 10);

  y = title(doc, y, "2. Avertissement et statut");
  for (const item of AVERTISSEMENTS) {
    y = para(doc, y, `- ${item}`, 8);
  }

  y = title(doc, y, "3. Synthese executive");
  y = para(
    doc,
    y,
    "Maison de type longere (observation photo, statut EXTRAIT). Somme des pieces cotees sur le plan : 153,00 m2 (EXTRAIT). Surface habitable totale : non confirmee (DONNEE MANQUANTE). Toiture degradee : tuiles manquantes ou deplacees, faitage irregulier, jour visible depuis l'interieur. Pas d'isolant visible en sous-face sur les cliches. Traces d'humidite, enduit degrade, fissure, vegetation sur un pignon. Chauffage, ventilation, DPE : non documentes. Trois devis joints (deux toiture non cumulables, surfaces 360 / 450 / 505 m2). Aucun resultat energetique n'est calcule.",
  );

  y = title(doc, y, "8. Recommandations prioritaires");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Prio", "Recommandation", "Statut", "Source"]],
    body: RECOMMANDATIONS.map((item) => [
      String(item.priorite),
      t(`${item.titre}. ${item.recommandation}`),
      t(item.statut),
      t(item.source),
    ]),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: NAVY, textColor: 255 },
    columnStyles: { 0: { cellWidth: 12 }, 2: { cellWidth: 38 } },
  });
  y = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? y) + 8;

  y = title(doc, y, "7. Analyse des devis");
  y = para(doc, y, ENCADRE_TOITURE, 10);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Fichier", "Entreprise", "Date / Ndeg", "HT / TVA / TTC", "Surface", "Statut"]],
    body: DEVIS_FICHES.map((fiche) => [
      t(fiche.fichier),
      t(fiche.entreprise),
      t(`${fiche.date} / ${fiche.numero}`),
      t(`HT ${fiche.ht} | TVA ${fiche.tva} | TTC ${fiche.ttc}`),
      t(fiche.surfaceAnnoncee),
      t(fiche.statut),
    ]),
    styles: { fontSize: 6.5, cellPadding: 1.4 },
    headStyles: { fillColor: NAVY, textColor: 255 },
  });
  y = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? y) + 8;

  y = title(doc, y, "Incoherences toiture");
  for (const item of INCOHERENCES_TOITURE) y = para(doc, y, `- ${item}`, 8);

  y = title(doc, y, "6. Pathologies visibles");
  for (const item of PATHOLOGIES) {
    y = para(doc, y, `${item.titre} [${item.statut}] - ${item.observation} Source : ${item.source}. ${item.nePasConclure}`, 8);
  }

  y = title(doc, y, "10. Galerie photos avant travaux");
  for (const photo of PHOTOS_AVANT) {
    y = ensureSpace(doc, y, photo.imageSrc ? 62 : 22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(t(`${photo.categorie} - ${photo.nom}`), MARGIN, y);
    y += 5;
    y = para(doc, y, `${photo.description} | Date : ${photo.date} | Confiance : ${photo.confiance} | Statut : ${photo.statut}`, 8);
    if (photo.imageSrc) {
      const dataUrl = await loadImageDataUrl(photo.imageSrc);
      if (dataUrl) {
        y = ensureSpace(doc, y, 48);
        try {
          doc.addImage(dataUrl, "PNG", MARGIN, y, 70, 42);
          y += 46;
        } catch {
          y = para(doc, y, "Image avant non integrable dans le PDF.", 8);
        }
      } else {
        y = para(doc, y, "Apercu photo avant non charge.", 8);
      }
    }
  }

  y = title(doc, y, "11. Galerie photos apres travaux");
  y = para(doc, y, "Aucune photo apres travaux n'a ete generee. Emplacements a completer manuellement.");
  const categories = CATEGORIES_PHOTO;
  for (const categorie of categories) {
    const after = input.afterPhotos[categorie];
    y = para(
      doc,
      y,
      after?.dataUrl
        ? `${categorie} : photo deposee manuellement le ${after.datePrise || "date non saisie"} - ${after.description || "sans description"}. Statut : a verifier.`
        : `${categorie} : Photo apres travaux non disponible - A COMPLETER.`,
      8,
    );
    if (after?.dataUrl) {
      y = ensureSpace(doc, y, 48);
      try {
        doc.addImage(after.dataUrl, "PNG", MARGIN, y, 70, 42);
        y += 46;
      } catch {
        y = para(doc, y, "Photo apres deposee mais non integrable.", 8);
      }
    }
  }

  y = title(doc, y, "12. Comparaison avant / apres");
  const avantAvecImage = PHOTOS_AVANT.filter((item) => item.imageSrc);
  for (const photo of avantAvecImage) {
    const cmp = input.comparisons[photo.id];
    y = para(
      doc,
      y,
      `${photo.categorie} : ${
        cmp?.validated
          ? "Comparaison VALIDEE par humain."
          : "Photo apres travaux non disponible - a completer apres realisation. Comparaison non validee."
      } ${cmp?.comment ? `Commentaire : ${cmp.comment}` : ""}`,
      8,
    );
  }

  y = title(doc, y, "13. Donnees manquantes");
  for (const item of DONNEES_MANQUANTES) y = para(doc, y, `- ${item}`, 8);
  y = title(doc, y, "Points a confirmer");
  for (const item of POINTS_A_CONFIRMER) y = para(doc, y, `- ${item}`, 8);

  y = title(doc, y, "15. Validation humaine");
  y = para(doc, y, "Ce rapport contient des extractions, observations et hypotheses. Il ne constitue pas un audit reglementaire final.");
  y = para(doc, y, `Valideur : ${input.validation.nom || "non renseigne"}`);
  y = para(doc, y, `Date : ${input.validation.date || "non renseignee"}`);
  y = para(doc, y, `Commentaire : ${input.validation.commentaire || "—"}`);
  y = para(doc, y, `Reserves : ${input.validation.reserves || "—"}`);
  y = para(doc, y, `Decision : ${input.validation.decision}`);

  y = title(doc, y, "16. Preparation du rapport final");
  for (const item of PREPARATION_RAPPORT_FINAL) y = para(doc, y, `- ${item}`, 8);

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    header(doc, i, total);
    footerNote(doc);
    doc.setFillColor(...AMBER);
    doc.rect(0, 18, PAGE_W, 1.2, "F");
  }

  doc.save("pre-rapport-maison-clyve-preparation-interne.pdf");
}
