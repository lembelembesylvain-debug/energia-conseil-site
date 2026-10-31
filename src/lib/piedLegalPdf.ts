import type { jsPDF } from "jspdf";
import {
  LIGNES_IDENTITE_OFFICIELLE,
  MENTION_MARCHE_CONTRACTANT_GENERAL,
} from "./branding";

type DocPdf = Pick<
  jsPDF,
  "setFont" | "setFontSize" | "setTextColor" | "splitTextToSize" | "text" | "getNumberOfPages" | "setPage"
> & {
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
};

function ecrireLignes(doc: DocPdf, lignes: readonly string[], x: number, y: number, largeur: number, centre = false) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.4);
  doc.setTextColor(71, 85, 105);
  for (const ligne of lignes) {
    const wrapped = doc.splitTextToSize(ligne, largeur) as string[];
    if (centre) {
      doc.text(wrapped, x, y, { align: "center" });
    } else {
      doc.text(wrapped, x, y);
    }
    y += wrapped.length * 2.7 + 0.4;
  }
  return y;
}

/** Bloc complet en bas de la page courante. */
export function ecrirePiedIdentite(doc: DocPdf, x = 14, y?: number, largeur?: number) {
  const utile = largeur ?? doc.internal.pageSize.getWidth() - x * 2;
  const depart = y ?? doc.internal.pageSize.getHeight() - 28;
  return ecrireLignes(doc, LIGNES_IDENTITE_OFFICIELLE, x, depart, utile, false);
}

/** Pied centré sur chaque page déjà créée. */
export function tamponnerPiedIdentite(doc: DocPdf) {
  const total = doc.getNumberOfPages();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    ecrireLignes(doc, LIGNES_IDENTITE_OFFICIELLE, pageW / 2, pageH - 22, pageW - 24, true);
  }
}

export function ecrireMentionMarche(doc: DocPdf, x: number, y: number, largeur: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const wrapped = doc.splitTextToSize(MENTION_MARCHE_CONTRACTANT_GENERAL, largeur) as string[];
  doc.text(wrapped, x, y);
  return y + wrapped.length * 3.6 + 2;
}
