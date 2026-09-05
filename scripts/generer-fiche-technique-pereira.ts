/**
 * Fiche de synthèse technique Pereira — document indicatif, hors devis.
 * Aucun montant, aucune marque, aucun modèle.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { jsPDF } from "jspdf";
import { PEREIRA_AUDIT_ID } from "../src/data/pereiraAuditExtract";
import { PEREIRA_ADRESSE_CHANTIER, PEREIRA_CLIENT_NOM } from "../src/data/pereiraDevisTest";
import {
  PEREIRA_COMBLES_RESISTANCE,
  PEREIRA_COMBLES_SURFACE_M2,
  PEREIRA_ITI_EPAISSEUR_CM,
  PEREIRA_ITI_RESISTANCE,
  PEREIRA_PLANCHER_RESISTANCE,
  PEREIRA_PLANCHER_SURFACE_M2,
} from "../src/data/pereiraItiEstimation";
import { CONTACT_CHIFFRAGE } from "../src/lib/chiffrage/constantes";
import { logoFromPngBytes, type LogoPdf } from "../src/lib/generateDevisPdf";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;
const NAVY: [number, number, number] = [26, 60, 94];
const GOLD: [number, number, number] = [201, 162, 39];
const SLATE: [number, number, number] = [71, 85, 105];
const INK: [number, number, number] = [15, 23, 42];
const MINT: [number, number, number] = [240, 253, 244];
const SKY: [number, number, number] = [240, 249, 255];
const CREAM: [number, number, number] = [255, 251, 235];
const LILAC: [number, number, number] = [245, 243, 255];

function pdfText(value: string): string {
  return value
    .replace(/’/g, "'")
    .replace(/‘/g, "'")
    .replace(/“|”/g, '"')
    .replace(/–|—/g, "-")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/\u00a0/g, " ");
}

function logoHeight(logo: LogoPdf, widthMm: number): number {
  return widthMm * (logo.height / logo.width);
}

function drawWrapped(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = doc.splitTextToSize(pdfText(text), maxWidth) as string[];
  for (const line of lines) {
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

type LigneFiche = { label: string; valeur: string };

function drawSection(
  doc: jsPDF,
  y: number,
  params: {
    numero: string;
    titre: string;
    fill: [number, number, number];
    accent: [number, number, number];
    lignes: LigneFiche[];
  },
): number {
  const innerW = CONTENT_W - 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  let bodyH = 0;
  for (const ligne of params.lignes) {
    bodyH += 4.2;
    const wrapped = doc.splitTextToSize(pdfText(`${ligne.label} : ${ligne.valeur}`), innerW) as string[];
    bodyH += Math.max(wrapped.length - 1, 0) * 3.8 + 2.2;
  }
  const h = 16 + bodyH;

  doc.setFillColor(...params.fill);
  doc.setDrawColor(...params.accent);
  doc.setLineWidth(0.35);
  doc.roundedRect(MARGIN, y, CONTENT_W, h, 2, 2, "FD");
  doc.setFillColor(...params.accent);
  doc.roundedRect(MARGIN, y, 5.2, h, 1.2, 1.2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...params.accent);
  doc.text(params.numero, MARGIN + 10, y + 8);
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(pdfText(params.titre), MARGIN + 22, y + 8);

  let iy = y + 15;
  for (const ligne of params.lignes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.1);
    doc.setTextColor(...NAVY);
    const label = pdfText(`${ligne.label}  `);
    doc.text(label, MARGIN + 10, iy);
    const labelW = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK);
    iy = drawWrapped(doc, ligne.valeur, MARGIN + 10 + labelW, iy, innerW - labelW, 3.8);
    iy += 2.4;
  }
  return y + h + 4.5;
}

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const logoPath = resolve(root, "public/assets/LOGO.png");
  const outputDir = resolve(root, "clients/PEREIRA");
  const outputPath = resolve(outputDir, "Fiche_Technique_Synthese_PEREIRA.pdf");

  const logoBytes = new Uint8Array(readFileSync(logoPath));
  const logo = logoFromPngBytes(logoBytes);
  if (!logo) throw new Error("Logo PNG illisible.");

  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 42, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 42, PAGE_W, 1.6, "F");

  const logoW = 46;
  const logoH = logoHeight(logo, logoW);
  doc.addImage(logo.dataUrl, "PNG", MARGIN, 8, logoW, logoH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(pdfText("Fiche de Synthese Technique"), PAGE_W - MARGIN, 16, { align: "right" });
  doc.setFontSize(12);
  doc.setTextColor(...GOLD);
  doc.text(pdfText(PEREIRA_CLIENT_NOM), PAGE_W - MARGIN, 24, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(pdfText(`Dossier ${PEREIRA_AUDIT_ID}`), PAGE_W - MARGIN, 31, { align: "right" });
  doc.text(pdfText(PEREIRA_ADRESSE_CHANTIER), PAGE_W - MARGIN, 37, { align: "right" });

  let y = 52;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.4);
  doc.setTextColor(...SLATE);
  y = drawWrapped(
    doc,
    "Caracteristiques techniques du materiel retenu pour la renovation d'ampleur. Document indicatif, hors devis contractuel. Aucune marque ni modele n'est engage a ce stade.",
    MARGIN,
    y,
    CONTENT_W,
    4,
  );
  y += 4;

  y = drawSection(doc, y, {
    numero: "01",
    titre: "Isolation (ITI, combles, plancher)",
    fill: MINT,
    accent: [22, 163, 74],
    lignes: [
      {
        label: "Materiau",
        valeur: "Isolant mineral ou biosource perspirant (adapte au pise).",
      },
      {
        label: "Performance",
        valeur: `${PEREIRA_ITI_RESISTANCE} (epaisseur ${PEREIRA_ITI_EPAISSEUR_CM} cm).`,
      },
      {
        label: "Avantage",
        valeur: "Suppression des parois froides et regulation de l'hygrometrie.",
      },
      {
        label: "Combles",
        valeur: `${PEREIRA_COMBLES_SURFACE_M2} m2 de surface deroulee, ${PEREIRA_COMBLES_RESISTANCE}.`,
      },
      {
        label: "Plancher bas",
        valeur: `${PEREIRA_PLANCHER_SURFACE_M2} m2, ${PEREIRA_PLANCHER_RESISTANCE}.`,
      },
    ],
  });

  y = drawSection(doc, y, {
    numero: "02",
    titre: "Chauffage & ECS (PAC)",
    fill: SKY,
    accent: [14, 116, 144],
    lignes: [
      {
        label: "Equipement",
        valeur: "Pompe a chaleur air/eau haute temperature (double service).",
      },
      {
        label: "Puissance estimee",
        valeur: "12 kW (a confirmer par etude de dimensionnement).",
      },
      {
        label: "Performance",
        valeur: "COP (coefficient de performance) eleve pour un fonctionnement optimal par grand froid.",
      },
    ],
  });

  y = drawSection(doc, y, {
    numero: "03",
    titre: "Menuiseries",
    fill: CREAM,
    accent: [180, 83, 9],
    lignes: [
      {
        label: "Materiau",
        valeur: "ALUMINIUM avec rupture de pont thermique, coloris blanc.",
      },
      {
        label: "Vitrage",
        valeur: "Double vitrage thermique renforce avec gaz argon.",
      },
      {
        label: "Performance",
        valeur: "Uw <= 1,30 W/m2.K.",
      },
    ],
  });

  y = drawSection(doc, y, {
    numero: "04",
    titre: "Ventilation (VMC)",
    fill: LILAC,
    accent: [91, 33, 182],
    lignes: [
      {
        label: "Systeme",
        valeur: "VMC simple flux hygroreglable type B.",
      },
      {
        label: "Fonctionnement",
        valeur: "Modulation automatique du debit d'air selon le taux d'humidite piece par piece.",
      },
    ],
  });

  y += 2;
  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(0.4);
  const mention =
    "Fiche technique indicative. Les marques et modeles definitifs seront confirmes par les devis des artisans RGE selectionnes et valides par votre Accompagnateur Renov'.";
  const mentionLines = doc.splitTextToSize(pdfText(mention), CONTENT_W - 12) as string[];
  const mentionH = 10 + mentionLines.length * 4;
  doc.roundedRect(MARGIN, y, CONTENT_W, mentionH, 1.8, 1.8, "FD");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text(mentionLines, MARGIN + 6, y + 8);

  const footerY = PAGE_H - 12;
  doc.setFillColor(...NAVY);
  doc.rect(0, PAGE_H - 18, PAGE_W, 18, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(226, 232, 240);
  doc.text(pdfText(CONTACT_CHIFFRAGE.enseigne), MARGIN, footerY - 2);
  doc.text(pdfText(`${CONTACT_CHIFFRAGE.adresse}  ·  ${CONTACT_CHIFFRAGE.telephone}`), MARGIN, footerY + 2);
  doc.text(CONTACT_CHIFFRAGE.email, PAGE_W - MARGIN, footerY - 2, { align: "right" });
  doc.text("1 / 1", PAGE_W - MARGIN, footerY + 2, { align: "right" });

  mkdirSync(outputDir, { recursive: true });
  const bytes = doc.output("arraybuffer");
  writeFileSync(outputPath, Buffer.from(bytes));
  const header = Buffer.from(bytes).subarray(0, 5).toString("utf8");
  if (header !== "%PDF-") throw new Error(`Fichier genere invalide (${header})`);
  if (doc.getNumberOfPages() !== 1) {
    throw new Error(`La fiche technique doit tenir sur 1 page (actuel : ${doc.getNumberOfPages()}).`);
  }

  console.log(
    JSON.stringify(
      {
        outputPath,
        pages: doc.getNumberOfPages(),
        client: PEREIRA_CLIENT_NOM,
        dossier: PEREIRA_AUDIT_ID,
        titre: "Fiche de Synthese Technique - M. PEREIRA",
      },
      null,
      2,
    ),
  );
}

main();
