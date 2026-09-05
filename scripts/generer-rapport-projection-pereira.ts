import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { jsPDF } from "jspdf";
import {
  PEREIRA_LABEL_APRES,
  PEREIRA_LABEL_APRES_PAC,
  PEREIRA_LABEL_AVANT_PAC,
  PEREIRA_MENTION_PAC,
  PEREIRA_MENTION_SIMULATION,
  PEREIRA_PAIRE_PAC,
  PEREIRA_PAIRES_ITI,
} from "../src/data/pereiraProjection";
import { logoFromPngBytes, type LogoPdf } from "../src/lib/generateDevisPdf";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 12;
const NAVY: [number, number, number] = [15, 23, 42];
const GOLD: [number, number, number] = [251, 191, 36];
const SLATE: [number, number, number] = [71, 85, 105];
const MENTION = PEREIRA_MENTION_SIMULATION;
const EMAIL = "contact@energia-conseil-ia.com";

function pdfText(value: string): string {
  return value
    .replace(/’/g, "'")
    .replace(/‘/g, "'")
    .replace(/“|”/g, '"')
    .replace(/–|—/g, "-")
    .replace(/\u00a0/g, " ");
}

function jpegSize(buf: Buffer): { width: number; height: number } {
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) break;
    const marker = buf[offset + 1];
    const length = buf.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error("Impossible de lire les dimensions JPEG.");
}

function jpegDataUrl(buf: Buffer): string {
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

function fitBox(srcW: number, srcH: number, maxW: number, maxH: number): { w: number; h: number } {
  const ratio = Math.min(maxW / srcW, maxH / srcH);
  return { w: srcW * ratio, h: srcH * ratio };
}

function logoHeight(logo: LogoPdf, widthMm: number): number {
  return widthMm * (logo.height / logo.width);
}

function drawCover(doc: jsPDF, logo: LogoPdf) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 0, PAGE_W, 4, "F");
  doc.rect(0, PAGE_H - 4, PAGE_W, 4, "F");

  const logoW = 92;
  const logoH = logoHeight(logo, logoW);
  doc.addImage(logo.dataUrl, "PNG", (PAGE_W - logoW) / 2, 38, logoW, logoH);

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(40, 38 + logoH + 10, PAGE_W - 40, 38 + logoH + 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(253, 230, 138);
  doc.text("ENERGIA-CONSEIL IA", PAGE_W / 2, 38 + logoH + 20, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  const titre = doc.splitTextToSize(
    pdfText("PROJECTION VISUELLE : VOTRE FUTUR CONFORT THERMIQUE"),
    150,
  ) as string[];
  let y = 38 + logoH + 36;
  for (const line of titre) {
    doc.text(line, PAGE_W / 2, y, { align: "center" });
    y += 8;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(253, 224, 71);
  doc.text(pdfText("Rapport de Projection Visuelle ITI et chauffage - M. PEREIRA"), PAGE_W / 2, y + 8, {
    align: "center",
  });

  y += 28;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(32, y, PAGE_W - 64, 52, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("M. David Emmanuel PEREIRA", PAGE_W / 2, y + 16, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  doc.text("1 Route de Saint Germain Laval", PAGE_W / 2, y + 26, { align: "center" });
  doc.text("42510 Nervieux", PAGE_W / 2, y + 33, { align: "center" });
  doc.setTextColor(253, 224, 71);
  doc.text("05/09/2026", PAGE_W / 2, y + 44, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const coverNotes = doc.splitTextToSize(
    pdfText(
      "8 vues ITI 12 cm + 1 vue chauffage / ECS (PAC air/eau haute temperature double service, projection indicative). Aucune marque, aucun modele. Puissance et implantation a confirmer. Aucun resultat energetique garanti. Document indicatif - hors devis contractuel - estimation a confirmer par devis artisan RGE.",
    ),
    160,
  ) as string[];
  let noteY = PAGE_H - 16 - (coverNotes.length - 1) * 5;
  for (const line of coverNotes) {
    doc.text(line, PAGE_W / 2, noteY, { align: "center" });
    noteY += 5;
  }
}

function drawFooter(doc: jsPDF, logo: LogoPdf, page: number, total: number) {
  const y = PAGE_H - 16;
  const w = 22;
  const h = logoHeight(logo, w);
  doc.addImage(logo.dataUrl, "PNG", MARGIN, PAGE_H - 14 - h, w, h);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  doc.text(`${page} / ${total}`, PAGE_W / 2, y, { align: "center" });
  doc.text(EMAIL, PAGE_W - MARGIN, y, { align: "right" });
}

type PairPageOptions = {
  headerRight: string;
  bandeau: string;
  titre: string;
  captionAvant: string;
  captionApres: string;
  mention: string;
  mentionBoxH: number;
};

function drawPairPage(doc: jsPDF, avantBuf: Buffer, apresBuf: Buffer, options: PairPageOptions) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 18, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 18, PAGE_W, 1.2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(253, 230, 138);
  doc.text("ENERGIA-CONSEIL IA", MARGIN, 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(pdfText(options.headerRight), PAGE_W - MARGIN, 8, { align: "right" });
  doc.text(pdfText(options.bandeau), MARGIN, 14.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text(pdfText(options.titre), MARGIN, 28);

  const colGap = 6;
  const colW = (PAGE_W - MARGIN * 2 - colGap) / 2;
  const mentionTop = PAGE_H - 20 - options.mentionBoxH;
  const maxImgH = mentionTop - 48;
  const avantSize = jpegSize(avantBuf);
  const apresSize = jpegSize(apresBuf);
  const avantFit = fitBox(avantSize.width, avantSize.height, colW, maxImgH);
  const apresFit = fitBox(apresSize.width, apresSize.height, colW, maxImgH);
  const imgH = Math.min(avantFit.h, apresFit.h);
  const avantDraw = fitBox(avantSize.width, avantSize.height, colW, imgH);
  const apresDraw = fitBox(apresSize.width, apresSize.height, colW, imgH);
  const imgY = 34;

  const avantX = MARGIN + (colW - avantDraw.w) / 2;
  const apresX = MARGIN + colW + colGap + (colW - apresDraw.w) / 2;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(MARGIN, imgY - 2, colW, imgH + 18, 2, 2, "F");
  doc.roundedRect(MARGIN + colW + colGap, imgY - 2, colW, imgH + 18, 2, 2, "F");

  doc.addImage(jpegDataUrl(avantBuf), "JPEG", avantX, imgY, avantDraw.w, avantDraw.h, undefined, "NONE");
  doc.addImage(jpegDataUrl(apresBuf), "JPEG", apresX, imgY, apresDraw.w, apresDraw.h, undefined, "NONE");

  const capY = imgY + imgH + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...NAVY);
  doc.text(pdfText(options.captionAvant), MARGIN + colW / 2, capY, {
    align: "center",
    maxWidth: colW - 4,
  });
  doc.setTextColor(146, 64, 14);
  doc.text(pdfText(options.captionApres), MARGIN + colW + colGap + colW / 2, capY, {
    align: "center",
    maxWidth: colW - 4,
  });

  doc.setFillColor(255, 247, 237);
  doc.roundedRect(MARGIN, mentionTop, PAGE_W - MARGIN * 2, options.mentionBoxH, 1.5, 1.5, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(146, 64, 14);
  const mentionLines = doc.splitTextToSize(pdfText(options.mention), PAGE_W - MARGIN * 2 - 8) as string[];
  doc.text(mentionLines, PAGE_W / 2, mentionTop + 6, { align: "center" });
}

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const galerie = resolve(root, "public/test-maison-pereira/galerie");
  const logoPath = resolve(root, "public/assets/LOGO-report-projection.png");
  const outputDir = resolve(root, "clients/PEREIRA");
  const outputPath = resolve(outputDir, "Rapport_Projection_Visuelle_PEREIRA.pdf");

  if (PEREIRA_PAIRES_ITI.length !== 8) {
    throw new Error(`La galerie Pereira doit contenir 8 paires (actuel : ${PEREIRA_PAIRES_ITI.length}).`);
  }

  const logoBytes = new Uint8Array(readFileSync(logoPath));
  const logo = logoFromPngBytes(logoBytes);
  if (!logo) throw new Error("Logo PNG illisible.");

  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  drawCover(doc, logo);

  for (const paire of PEREIRA_PAIRES_ITI) {
    const avantPath = resolve(galerie, `avant-${String(paire.index).padStart(2, "0")}.jpg`);
    const apresPath = resolve(galerie, `apres-${String(paire.index).padStart(2, "0")}.jpg`);
    const avantBuf = readFileSync(avantPath);
    const apresBuf = readFileSync(apresPath);
    doc.addPage();
    drawPairPage(doc, avantBuf, apresBuf, {
      headerRight: "Rapport de Projection Visuelle ITI",
      bandeau: `Vue ${paire.index}/8  |  ${paire.titre}`,
      titre: paire.titre,
      captionAvant: "Avant - Etat initial",
      captionApres: PEREIRA_LABEL_APRES,
      mention: MENTION,
      mentionBoxH: 18,
    });
  }

  const avantPac = readFileSync(resolve(galerie, "avant-pac.jpg"));
  const apresPac = readFileSync(resolve(galerie, "apres-pac.jpg"));
  doc.addPage();
  drawPairPage(doc, avantPac, apresPac, {
    headerRight: "Rapport de Projection Visuelle - chauffage / ECS",
    bandeau: PEREIRA_PAIRE_PAC.titre,
    titre: PEREIRA_PAIRE_PAC.titre,
    captionAvant: PEREIRA_LABEL_AVANT_PAC,
    captionApres: PEREIRA_LABEL_APRES_PAC,
    mention: PEREIRA_MENTION_PAC,
    mentionBoxH: 28,
  });

  const total = doc.getNumberOfPages();
  for (let i = 2; i <= total; i += 1) {
    doc.setPage(i);
    drawFooter(doc, logo, i, total);
  }
  doc.setPage(1);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`1 / ${total}`, PAGE_W / 2, PAGE_H - 10, { align: "center" });
  doc.text(EMAIL, PAGE_W - 16, PAGE_H - 10, { align: "right" });

  mkdirSync(outputDir, { recursive: true });
  const bytes = doc.output("arraybuffer");
  writeFileSync(outputPath, Buffer.from(bytes));
  const header = Buffer.from(bytes).subarray(0, 5).toString("utf8");
  if (header !== "%PDF-") throw new Error(`Fichier genere invalide (${header})`);

  console.log(
    JSON.stringify(
      {
        outputPath,
        pages: total,
        pairesIti: PEREIRA_PAIRES_ITI.length,
        pairePac: 1,
        titre: "Rapport de Projection Visuelle ITI et chauffage - M. PEREIRA",
      },
      null,
      2,
    ),
  );
}

main();
