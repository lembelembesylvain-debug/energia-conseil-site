/**
 * Fiche de synthèse technique Pereira — document indicatif, hors devis.
 * Aucun montant, aucune marque, aucun modèle.
 * Surfaces isolation combles / plancher : devis ENERGIA (60 m² / 19 m²), pas le tableau audit 120 / 60.
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
  PEREIRA_ITI_SURFACE_M2,
  PEREIRA_PLANCHER_RESISTANCE,
  PEREIRA_PLANCHER_SURFACE_M2,
} from "../src/data/pereiraItiEstimation";
import { CONTACT_CHIFFRAGE } from "../src/lib/chiffrage/constantes";
import { fitLogo, LOGO_BOX, PIED_DE_PAGE } from "../src/lib/branding";
import { resolveOfficialLogoPath } from "../src/lib/branding-fs";
import { logoFromPngBytes, type LogoPdf } from "../src/lib/generateDevisPdf";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_H = 18;
const PAGE_BOTTOM = PAGE_H - FOOTER_H - 6;
const NAVY: [number, number, number] = [26, 60, 94];
const GOLD: [number, number, number] = [201, 162, 39];
const SLATE: [number, number, number] = [71, 85, 105];
const INK: [number, number, number] = [15, 23, 42];
const MINT: [number, number, number] = [240, 253, 244];
const SKY: [number, number, number] = [240, 249, 255];
const CREAM: [number, number, number] = [255, 251, 235];
const LILAC: [number, number, number] = [245, 243, 255];
const SAND: [number, number, number] = [255, 247, 237];
const FOG: [number, number, number] = [248, 250, 252];

type LigneFiche = { label: string; valeur: string };
type Rgb = [number, number, number];

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

function logoSize(logo: LogoPdf, maxWidthMm: number, maxHeightMm: number) {
  return fitLogo(logo.width, logo.height, maxWidthMm, maxHeightMm);
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

function drawFooter(doc: jsPDF, page: number, total: number, logo: LogoPdf): void {
  doc.setFillColor(...NAVY);
  doc.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H, "F");
  const size = logoSize(logo, LOGO_BOX.footer.maxWidthMm, LOGO_BOX.footer.maxHeightMm);
  const logoY = PAGE_H - FOOTER_H + (FOOTER_H - size.height) / 2;
  doc.addImage(logo.dataUrl, "PNG", MARGIN, logoY, size.width, size.height);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.4);
  doc.setTextColor(226, 232, 240);
  const textX = MARGIN + size.width + 3;
  const y = PAGE_H - 8;
  doc.text(pdfText(PIED_DE_PAGE), textX, y - 3);
  doc.text(pdfText(CONTACT_CHIFFRAGE.enseigne), textX, y + 2);
  doc.text(`${page} / ${total}`, PAGE_W - MARGIN, y, { align: "right" });
}

function drawContinuationHeader(doc: jsPDF): number {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 16, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 16, PAGE_W, 1.1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(pdfText("Fiche de Synthese Technique - suite"), MARGIN, 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text(pdfText(`${PEREIRA_CLIENT_NOM}  ·  ${PEREIRA_AUDIT_ID}`), PAGE_W - MARGIN, 8, { align: "right" });
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text(pdfText(PEREIRA_ADRESSE_CHANTIER), MARGIN, 13);
  return 24;
}

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const logoPath = resolveOfficialLogoPath(root);
  const outputDir = resolve(root, "clients/PEREIRA");
  const outputPath = resolve(outputDir, "Fiche_Technique_Synthese_PEREIRA.pdf");

  const logoBytes = new Uint8Array(readFileSync(logoPath));
  const logo = logoFromPngBytes(logoBytes);
  if (!logo) throw new Error("Logo PNG illisible.");

  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });

  const ensureSpace = (y: number, needed: number): number => {
    if (y + needed <= PAGE_BOTTOM) return y;
    doc.addPage();
    return drawContinuationHeader(doc);
  };

  const drawSectionHeader = (y: number, numero: string, titre: string, fill: Rgb, accent: Rgb): number => {
    const h = 11;
    y = ensureSpace(y, h + 6);
    doc.setFillColor(...fill);
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, y, CONTENT_W, h, 1.6, 1.6, "FD");
    doc.setFillColor(...accent);
    doc.roundedRect(MARGIN, y, 5.2, h, 1.2, 1.2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...accent);
    doc.text(numero, MARGIN + 9, y + 7.2);
    doc.setFontSize(10.5);
    doc.setTextColor(...NAVY);
    doc.text(pdfText(titre), MARGIN + 20, y + 7.2);
    return y + h + 2.4;
  };

  const drawLignes = (y: number, lignes: LigneFiche[]): number => {
    const innerW = CONTENT_W - 4;
    for (const ligne of lignes) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.1);
      const label = pdfText(`${ligne.label}  `);
      const labelW = doc.getTextWidth(label);
      const wrapped = doc.splitTextToSize(pdfText(ligne.valeur), innerW - labelW) as string[];
      const blockH = Math.max(wrapped.length, 1) * 3.8 + 1.4;
      y = ensureSpace(y, blockH);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.1);
      doc.setTextColor(...NAVY);
      doc.text(label, MARGIN + 2, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK);
      y = drawWrapped(doc, ligne.valeur, MARGIN + 2 + labelW, y, innerW - labelW, 3.8);
      y += 1.6;
    }
    return y;
  };

  const drawEtapes = (y: number, titre: string, etapes: string[]): number => {
    y = ensureSpace(y, 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.3);
    doc.setTextColor(...NAVY);
    y = drawWrapped(doc, titre, MARGIN + 2, y, CONTENT_W - 4, 4);
    y += 1.2;
    for (const etape of etapes) {
      const wrapped = doc.splitTextToSize(pdfText(etape), CONTENT_W - 8) as string[];
      const h = wrapped.length * 3.7 + 0.8;
      y = ensureSpace(y, h);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...INK);
      y = drawWrapped(doc, etape, MARGIN + 4, y, CONTENT_W - 8, 3.7);
      y += 0.6;
    }
    return y + 1.2;
  };

  const drawMention = (y: number, texte: string): number => {
    const lines = doc.splitTextToSize(pdfText(texte), CONTENT_W - 12) as string[];
    const h = 7 + lines.length * 3.7;
    y = ensureSpace(y, h + 3);
    doc.setFillColor(...SAND);
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.35);
    doc.roundedRect(MARGIN, y, CONTENT_W, h, 1.4, 1.4, "FD");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.7);
    doc.setTextColor(146, 64, 14);
    doc.text(lines, MARGIN + 5, y + 5.2);
    return y + h + 3;
  };

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 42, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 42, PAGE_W, 1.6, "F");

  const logoSizeHeader = logoSize(logo, 40, 26);
  doc.addImage(logo.dataUrl, "PNG", MARGIN, 8, logoSizeHeader.width, logoSizeHeader.height);

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
  doc.setFontSize(8.2);
  doc.setTextColor(...SLATE);
  y = drawWrapped(
    doc,
    "Caracteristiques techniques retenues pour la renovation d'ampleur. Document indicatif, hors devis contractuel. Aucun prix. Aucune marque ni modele n'est engage a ce stade. Les metriques, materiaux et techniques de pose restent a confirmer par les devis artisans RGE.",
    MARGIN,
    y,
    CONTENT_W,
    3.9,
  );
  y += 4;

  y = drawSectionHeader(y, "01", "Isolation interieure - ITI 12 cm", MINT, [22, 163, 74]);
  y = drawLignes(y, [
    { label: "Surface", valeur: `${PEREIRA_ITI_SURFACE_M2} m2.` },
    { label: "Epaisseur", valeur: `${PEREIRA_ITI_EPAISSEUR_CM} cm.` },
    { label: "Performance prevue", valeur: `${PEREIRA_ITI_RESISTANCE}.` },
    {
      label: "Materiau",
      valeur: "Isolant perspirant adapte au pise. Produit exact a confirmer par l'artisan RGE.",
    },
    { label: "Statut", valeur: "Estimation a confirmer par devis artisan RGE." },
  ]);
  y += 1;

  y = drawSectionHeader(
    y,
    "02",
    `Isolation des combles - ${PEREIRA_COMBLES_SURFACE_M2} m2, ${PEREIRA_COMBLES_RESISTANCE}`,
    [236, 253, 245],
    [5, 150, 105],
  );
  y = drawLignes(y, [
    { label: "Surface", valeur: `${PEREIRA_COMBLES_SURFACE_M2} m2.` },
    { label: "Performance prevue", valeur: `${PEREIRA_COMBLES_RESISTANCE} m2.K/W.` },
    { label: "Statut", valeur: "Estimation a confirmer par devis artisan RGE." },
    {
      label: "Type",
      valeur: "Isolation des combles, methode et materiau a confirmer par l'artisan.",
    },
  ]);
  y = drawEtapes(y, "Deroule indicatif :", [
    "1. Verification de l'accessibilite et de l'etat des combles.",
    "2. Controle de la ventilation de la couverture.",
    "3. Reperage des reseaux et points singuliers.",
    "4. Preparation du support.",
    "5. Mise en oeuvre de l'isolant pour atteindre R >= 7 m2.K/W.",
    "6. Traitement des trappes, rives, passages de reseaux et zones difficiles.",
    "7. Verification de la continuite de l'isolation.",
    "8. Controle final et remise des documents de mise en oeuvre.",
  ]);
  y = drawMention(
    y,
    "Le materiau, l'epaisseur exacte et la technique de pose seront confirmes par le devis et la fiche technique de l'artisan RGE.",
  );

  y = drawSectionHeader(
    y,
    "03",
    `Isolation du plancher bas - ${PEREIRA_PLANCHER_SURFACE_M2} m2, ${PEREIRA_PLANCHER_RESISTANCE}`,
    FOG,
    [14, 116, 144],
  );
  y = drawLignes(y, [
    { label: "Surface", valeur: `${PEREIRA_PLANCHER_SURFACE_M2} m2.` },
    { label: "Performance prevue", valeur: `${PEREIRA_PLANCHER_RESISTANCE} m2.K/W.` },
    { label: "Designation du devis", valeur: "Plancher bas / dalle sur sous-sol." },
    { label: "Statut", valeur: "Estimation a confirmer par devis artisan RGE." },
  ]);
  y = drawEtapes(y, "Deroule indicatif :", [
    "1. Identification du support et du volume situe sous le plancher.",
    "2. Verification de l'accessibilite du sous-sol ou du local non chauffe.",
    "3. Controle de l'humidite et de l'etat du support.",
    "4. Reperage des reseaux, canalisations et equipements.",
    "5. Preparation et nettoyage du support.",
    "6. Mise en oeuvre de l'isolant sous dalle ou selon la technique retenue.",
    "7. Traitement des jonctions, peripheries et points singuliers.",
    "8. Verification de la continuite de l'isolation.",
    "9. Controle final et remise des documents de mise en oeuvre.",
  ]);
  y = drawMention(
    y,
    "La technique definitive dependra de l'accessibilite du sous-sol, de l'etat du support, de l'humidite et du devis de l'artisan RGE.",
  );

  y = drawSectionHeader(y, "04", "Chauffage & ECS - PAC air/eau haute temperature double service", SKY, [3, 105, 161]);
  y = drawLignes(y, [
    {
      label: "Equipement",
      valeur: "Pompe a chaleur air/eau haute temperature, double service (chauffage + eau chaude sanitaire).",
    },
    {
      label: "Puissance",
      valeur: "A confirmer par etude de dimensionnement, apres isolation. Estimation audit : 12 kW.",
    },
    {
      label: "Travaux associes",
      valeur: "Depose de la chaudiere fioul et des equipements associes, selon contraintes du site.",
    },
    { label: "Marque / modele", valeur: "Non retenus a ce stade. A confirmer par le devis artisan RGE." },
    { label: "Statut", valeur: "Estimation a confirmer par devis artisan RGE." },
  ]);
  y += 0.8;

  y = drawSectionHeader(y, "05", "Menuiseries - aluminium avec rupture de pont thermique", CREAM, [180, 83, 9]);
  y = drawLignes(y, [
    { label: "Materiau", valeur: "Aluminium avec rupture de pont thermique." },
    { label: "Ouvrants", valeur: "7 fenetres + 2 portes. Surface des ouvrants a confirmer en visite." },
    { label: "Coloris", valeur: "Blanc, indicatif." },
    {
      label: "Performance prevue",
      valeur: "Uw <= 1,30 W/m2.K au devis. Caracteristiques definitives a confirmer.",
    },
    { label: "Marque / modele", valeur: "Non retenus a ce stade. A confirmer par le devis artisan RGE." },
    { label: "Statut", valeur: "Estimation a confirmer par devis artisan RGE." },
  ]);
  y += 0.8;

  y = drawSectionHeader(y, "06", "Ventilation - VMC Hygro B", LILAC, [91, 33, 182]);
  y = drawLignes(y, [
    { label: "Systeme", valeur: "VMC simple flux hygroreglable type B (Hygro B)." },
    {
      label: "Fonctionnement",
      valeur: "Modulation du debit d'air selon le taux d'humidite, piece par piece.",
    },
    { label: "Marque / modele", valeur: "Non retenus a ce stade. A confirmer par le devis artisan RGE." },
    { label: "Statut", valeur: "Estimation a confirmer par devis artisan RGE." },
  ]);
  y += 0.8;

  y = drawSectionHeader(y, "07", "Ordre recommande des travaux", FOG, [26, 60, 94]);
  y = drawEtapes(y, "Deroule general du projet :", [
    "1. Releve technique contradictoire et validation des metres.",
    "2. Verification de l'humidite et de l'etat des supports.",
    "3. Isolation des combles.",
    "4. Isolation du plancher bas.",
    "5. Isolation interieure des murs.",
    "6. Remplacement des menuiseries aluminium.",
    "7. Installation ou adaptation de la ventilation VMC Hygro B.",
    "8. Depose de la chaudiere fioul et des equipements associes.",
    "9. Installation de la PAC air/eau haute temperature double service.",
    "10. Mise en service, reglages et controles.",
  ]);
  y = drawMention(
    y,
    "L'ordre definitif pourra etre adapte par les entreprises RGE selon les contraintes du site, les interfaces entre lots et les resultats du releve technique. Fiche technique indicative, sans prix : marques, modeles, materiaux, epaisseurs et techniques de pose definitifs a confirmer par les devis artisans RGE et l'Accompagnateur Renov'.",
  );

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    drawFooter(doc, page, totalPages, logo);
  }

  const forbiddenPrice = /(?:\d[\d\s]{2,}\s*€)|(?:\d+[\s.,]\d{3}\s*€)|TTC|HT\b|reste a charge/i;
  const textDump = `${PEREIRA_CLIENT_NOM} ${PEREIRA_AUDIT_ID}`;
  if (forbiddenPrice.test(textDump)) {
    throw new Error("La fiche technique ne doit contenir aucun prix.");
  }
  if (PEREIRA_COMBLES_SURFACE_M2 !== 60) {
    throw new Error("La fiche combles doit suivre le devis ENERGIA (60 m2), pas le tableau audit 120 m2.");
  }
  if (PEREIRA_PLANCHER_SURFACE_M2 !== 19) {
    throw new Error("La fiche plancher doit suivre le devis ENERGIA (19 m2), pas le tableau audit 60 m2.");
  }
  if (PEREIRA_ITI_SURFACE_M2 !== 270) {
    throw new Error("La fiche ITI doit rester a 270 m2.");
  }

  mkdirSync(outputDir, { recursive: true });
  const bytes = doc.output("arraybuffer");
  writeFileSync(outputPath, Buffer.from(bytes));
  const header = Buffer.from(bytes).subarray(0, 5).toString("utf8");
  if (header !== "%PDF-") throw new Error(`Fichier genere invalide (${header})`);
  if (doc.getNumberOfPages() > 3) {
    throw new Error(`La fiche technique depasse 3 pages (actuel : ${doc.getNumberOfPages()}).`);
  }

  console.log(
    JSON.stringify(
      {
        outputPath,
        pages: doc.getNumberOfPages(),
        client: PEREIRA_CLIENT_NOM,
        dossier: PEREIRA_AUDIT_ID,
        titre: "Fiche de Synthese Technique - M. PEREIRA",
        comblesM2: PEREIRA_COMBLES_SURFACE_M2,
        plancherM2: PEREIRA_PLANCHER_SURFACE_M2,
        itiM2: PEREIRA_ITI_SURFACE_M2,
      },
      null,
      2,
    ),
  );
}

main();
