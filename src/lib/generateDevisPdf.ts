import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  CGV_DEVIS_CLIENT,
  CONTACT_CHIFFRAGE,
  LOGO_PUBLIC_PATH,
} from "./chiffrage/constantes";
import { formatEuro, formatUnite } from "./chiffrage/format";

const MARGIN = 15;
const PAGE_W = 210;
const PAGE_H = 297;
const NAVY: [number, number, number] = [26, 60, 94];
const LOGO_WIDTH_MM = 50;

export type DevisClientPdfLigne = {
  designation: string;
  quantite: number;
  unite: string;
  prixUnitaireHt: number | null;
  montantHt: number | null;
  tauxTva: number | null;
  montantTva?: number | null;
  montantTtc?: number | null;
};

export type DevisClientPdfInput = {
  numero: string;
  date: string;
  validite: string;
  clientNom: string;
  clientAdresse: string;
  libelleProjet: string;
  lignes: DevisClientPdfLigne[];
  totalHt: number | null;
  totalTva: number | null;
  totalTtc: number;
  mentionTva?: string;
  filename?: string;
};

const CHAMPS_INTERDITS =
  /marge|commission|clyve|co[uû]t (d['’]achat|entrant|interne|revient|mat[eé]riel)|prix plancher/i;

function pdfText(value: string): string {
  return value
    .replace(/\u00AE/g, "(R)")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\u20AC/g, " EUR");
}

function formatTva(taux: number | null): string {
  if (taux == null || Number.isNaN(taux)) return "A confirmer";
  return `${(taux * 100).toLocaleString("fr-FR", {
    minimumFractionDigits: taux === 0.055 ? 1 : 0,
    maximumFractionDigits: 1,
  })} %`;
}

function formatQty(quantite: number, unite: string): string {
  const q = quantite.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  return `${q} ${formatUnite(unite)}`;
}

function assertClientSafe(input: DevisClientPdfInput) {
  const blob = JSON.stringify(input);
  if (CHAMPS_INTERDITS.test(blob)) {
    throw new Error(
      "Le devis client ne peut pas contenir de couts d'achat, marges, commission ou cout Clyve.",
    );
  }
}

async function loadLogoDataUrl(): Promise<{
  dataUrl: string;
  width: number;
  height: number;
} | null> {
  try {
    const response = await fetch(LOGO_PUBLIC_PATH);
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
    if (!dataUrl) return null;
    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("logo"));
      img.src = dataUrl;
    });
    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

function drawHeader(
  doc: jsPDF,
  logo: { dataUrl: string; width: number; height: number } | null,
): number {
  let y = 12;
  if (logo && logo.width > 0) {
    const height = LOGO_WIDTH_MM * (logo.height / logo.width);
    doc.addImage(logo.dataUrl, "PNG", MARGIN, y, LOGO_WIDTH_MM, height);
    y += height + 8;
  }

  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(pdfText(CONTACT_CHIFFRAGE.enseigne), MARGIN, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(pdfText(CONTACT_CHIFFRAGE.fondateurQualite), MARGIN, y);
  y += 5;
  doc.setFontSize(8);
  const legal = [
    CONTACT_CHIFFRAGE.adresse,
    `${CONTACT_CHIFFRAGE.telephone}  |  ${CONTACT_CHIFFRAGE.email}`,
    `SIRET ${CONTACT_CHIFFRAGE.siret}  |  RCS ${CONTACT_CHIFFRAGE.rcs}  |  ${CONTACT_CHIFFRAGE.forme}`,
    CONTACT_CHIFFRAGE.assurances,
  ];
  for (const line of legal) {
    const wrapped = doc.splitTextToSize(pdfText(line), PAGE_W - MARGIN * 2) as string[];
    for (const w of wrapped) {
      doc.text(w, MARGIN, y);
      y += 4;
    }
  }
  y += 6;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("DEVIS", MARGIN, y);
  return y + 8;
}

function footer(doc: jsPDF, page: number, total: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(90, 90, 90);
  doc.text(
    pdfText(
      `${CONTACT_CHIFFRAGE.enseigne}  |  ${CONTACT_CHIFFRAGE.adresse}  |  SIRET ${CONTACT_CHIFFRAGE.siret}`,
    ),
    PAGE_W / 2,
    PAGE_H - 8,
    { align: "center" },
  );
  doc.text(`${page} / ${total}`, PAGE_W - MARGIN, PAGE_H - 8, { align: "right" });
  doc.setTextColor(0, 0, 0);
}

export function createDevisPdfDocument(
  input: DevisClientPdfInput,
  logo: { dataUrl: string; width: number; height: number } | null,
): jsPDF {
  assertClientSafe(input);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = drawHeader(doc, logo);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const meta = [
    `N : ${input.numero}`,
    `Date : ${input.date}`,
    `Validite : ${input.validite}`,
    `Client : ${input.clientNom}`,
    `Chantier : ${input.clientAdresse || "Non renseigne"}`,
    `Objet : ${input.libelleProjet}`,
  ];
  for (const line of meta) {
    const wrapped = doc.splitTextToSize(pdfText(line), PAGE_W - MARGIN * 2) as string[];
    for (const w of wrapped) {
      doc.text(w, MARGIN, y);
      y += 4.5;
    }
  }
  y += 3;

  const body = input.lignes.map((ligne) => [
    pdfText(ligne.designation),
    pdfText(formatQty(ligne.quantite, ligne.unite)),
    ligne.prixUnitaireHt == null ? "Inclus" : pdfText(formatEuro(ligne.prixUnitaireHt)),
    ligne.tauxTva == null ? "A confirmer" : pdfText(formatTva(ligne.tauxTva)),
    ligne.montantHt == null ? "Inclus" : pdfText(formatEuro(ligne.montantHt)),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Prestation", "Qte", "Prix HT", "TVA", "Total HT"]],
    body,
    styles: { fontSize: 8, cellPadding: 1.6, overflow: "linebreak" },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 28 },
      2: { cellWidth: 28, halign: "right" },
      3: { cellWidth: 24, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
  });

  y = ((doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 8;

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN + 80, right: MARGIN },
    body: [
      ["Total HT", input.totalHt == null ? "A confirmer" : pdfText(formatEuro(input.totalHt))],
      ["TVA", input.totalTva == null ? "A confirmer" : pdfText(formatEuro(input.totalTva))],
      ["Total TTC", pdfText(formatEuro(input.totalTtc))],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 1.4 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40 },
      1: { halign: "right", cellWidth: 50, fontStyle: "bold" },
    },
  });

  y = ((doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 8;

  if (input.mentionTva) {
    doc.setFontSize(8);
    const wrapped = doc.splitTextToSize(pdfText(input.mentionTva), PAGE_W - MARGIN * 2) as string[];
    for (const line of wrapped) {
      if (y > PAGE_H - 40) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, MARGIN, y);
      y += 4;
    }
    y += 4;
  }

  if (y > PAGE_H - 70) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("Conditions generales de vente", MARGIN, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  for (const mention of CGV_DEVIS_CLIENT) {
    const wrapped = doc.splitTextToSize(`- ${pdfText(mention)}`, PAGE_W - MARGIN * 2) as string[];
    for (const line of wrapped) {
      if (y > PAGE_H - 18) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, MARGIN, y);
      y += 4;
    }
    y += 1;
  }

  y += 4;
  if (y > PAGE_H - 28) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text("Mentions legales", MARGIN, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  const mentions = [
    `${CONTACT_CHIFFRAGE.enseigne} - ${CONTACT_CHIFFRAGE.forme}`,
    CONTACT_CHIFFRAGE.adresse,
    `SIRET ${CONTACT_CHIFFRAGE.siret} - RCS ${CONTACT_CHIFFRAGE.rcs}`,
    CONTACT_CHIFFRAGE.assurances,
  ];
  for (const line of mentions) {
    doc.text(pdfText(line), MARGIN, y);
    y += 4;
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    footer(doc, i, pages);
  }

  return doc;
}

export async function generateDevisPdf(input: DevisClientPdfInput): Promise<void> {
  const logo = await loadLogoDataUrl();
  const doc = createDevisPdfDocument(input, logo);
  doc.save(input.filename ?? `Devis_${input.numero.replace(/[^\w-]+/g, "_")}.pdf`);
}
