/**
 * Contrat de partenariat commercial et d'apport d'affaires
 * ENERGIA CONSEIL IA × Catarina MARTINS
 *
 * Logo officiel : public/assets/LOGO.png (motif des arbres isolé en mémoire).
 * Sortie : juridique/projet_contrat_partenariat_catarina_energia_signature.pdf
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { jsPDF } from "jspdf";
import sharp from "sharp";
import { fitLogo, LOGO_BOX, LOGO_FS_RELATIVE, PIED_DE_PAGE } from "../src/lib/branding";
import { resolveOfficialLogoPath } from "../src/lib/branding-fs";
import { logoFromPngBytes, type LogoPdf } from "../src/lib/generateDevisPdf";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_H = 16;
const PAGE_BOTTOM = PAGE_H - FOOTER_H - 4;
const HEADER_LOGO_W = 42;
const HEADER_LOGO_H = 18;
const FOOTER_LOGO_W = 16;
const TOP_BAR_H = 3.1;

const NAVY: [number, number, number] = [26, 60, 94];
const TEAL: [number, number, number] = [15, 118, 110];
const GREEN: [number, number, number] = [22, 163, 74];
const INK: [number, number, number] = [30, 41, 59];
const SLATE: [number, number, number] = [71, 85, 105];
const LINE: [number, number, number] = [203, 213, 225];
const MINT: [number, number, number] = [240, 253, 244];
const ORANGE_BG: [number, number, number] = [255, 247, 237];
const ORANGE: [number, number, number] = [249, 115, 22];
const WHITE: [number, number, number] = [255, 255, 255];
const FOG: [number, number, number] = [241, 245, 249];

const REF = "PART-CATARINA-2026-001";
const DATE_DOC = "12 septembre 2026";
const QUALITE_SYLVAIN = "Fondateur & CEO — Contractant Général Digital & 3D Thermique";
const QUALITE_CATARINA = "Partenaire indépendante — Facilitatrice et apporteuse d'affaires";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const logoCandidate = resolve(root, LOGO_FS_RELATIVE);
const logoPath = existsSync(logoCandidate) ? logoCandidate : resolveOfficialLogoPath(root);
const outputDir = resolve(root, "juridique");
const outputPath = resolve(outputDir, "projet_contrat_partenariat_catarina_energia_signature.pdf");
const BANNER_STATUT = "PROJET SOUMIS À VALIDATION — NON SIGNÉ À CE STADE";
const MENTION_VALIDATION =
  "Ce document constitue un projet soumis à validation. Il devra être complété avec les informations exactes des Parties, relu si nécessaire par un professionnel du droit, puis signé par les deux Parties. Tant qu'il n'est pas signé, il ne constitue pas un engagement contractuel définitif.";
const MENTION_SIGNATURE_ELECTRONIQUE =
  "Signature électronique possible après validation complète du document par les deux Parties.";

type Rgb = [number, number, number];

function pdfText(value: string): string {
  return value
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\u00a0/g, " ");
}

function logoSize(logo: LogoPdf, maxW: number, maxH: number) {
  return fitLogo(logo.width, logo.height, maxW, maxH);
}

function drawOfficialLogo(
  doc: jsPDF,
  logo: LogoPdf,
  destX: number,
  destY: number,
  destW: number,
  destH: number,
): { width: number; height: number } {
  const size = logoSize(logo, destW, destH);
  doc.addImage(logo.dataUrl, "PNG", destX, destY, size.width, size.height, undefined, "NONE");
  return size;
}

async function prepareOfficialLogo(pngPath: string): Promise<LogoPdf> {
  const { data, info } = await sharp(pngPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels;
  const searchMaxX = Math.floor(width * 0.76);
  const searchMaxY = Math.floor(height * 0.62);

  let minX = searchMaxX;
  let minY = searchMaxY;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < searchMaxY; y += 1) {
    for (let x = 0; x < searchMaxX; x += 1) {
      const i = (y * width + x) * channels;
      const r = data[i] ?? 255;
      const g = data[i + 1] ?? 255;
      const b = data[i + 2] ?? 255;
      const isTreeGreen = g > 80 && g >= r + 10 && g >= b;
      if (!isTreeGreen) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  const pad = 8;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const cropW = Math.max(32, Math.min(searchMaxX, maxX + pad) - left);
  const cropH = Math.max(24, Math.min(searchMaxY, maxY + pad) - top);

  const cropped = await sharp(pngPath)
    .extract({ left, top, width: cropW, height: cropH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(cropped.data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] ?? 255;
    const g = pixels[i + 1] ?? 255;
    const b = pixels[i + 2] ?? 255;
    if (r > 242 && g > 242 && b > 242) {
      pixels[i + 3] = 0;
    } else if (r > 226 && g > 226 && b > 226) {
      const t = (Math.min(r, g, b) - 226) / 16;
      pixels[i + 3] = Math.round(255 * (1 - t));
    }
  }

  const png = await sharp(pixels, {
    raw: { width: cropped.info.width, height: cropped.info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const logo = logoFromPngBytes(new Uint8Array(png));
  if (!logo) {
    throw new Error("Logo officiel PNG illisible après préparation.");
  }
  return logo;
}

function wrapped(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number,
  style: "normal" | "bold" | "italic" = "normal",
): string[] {
  doc.setFont("helvetica", style);
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(pdfText(text), maxWidth) as string[];
}

class ContratPdf {
  doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  y = 0;
  logo: LogoPdf;
  control: boolean;

  constructor(logo: LogoPdf, control = false) {
    this.logo = logo;
    this.control = control;
  }

  drawHeader(): void {
    const doc = this.doc;
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, PAGE_W, 2.4, "F");
    doc.setFillColor(...TEAL);
    doc.rect(0, 2.4, PAGE_W, 0.7, "F");

    const logoY = TOP_BAR_H + 4.2;
    const size = drawOfficialLogo(doc, this.logo, MARGIN, logoY, HEADER_LOGO_W, HEADER_LOGO_H);
    const textX = MARGIN + size.width + 5;
    const textY = logoY + size.height / 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13.5);
    doc.setTextColor(...NAVY);
    doc.text(pdfText("ENERGIA CONSEIL IA"), textX, textY - 2.4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    doc.setTextColor(...TEAL);
    doc.text(pdfText("Partenariat commercial et apport d'affaires"), textX, textY + 3.2);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(...NAVY);
    doc.text(REF, PAGE_W - MARGIN, logoY + 3.2, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...SLATE);
    doc.text(DATE_DOC, PAGE_W - MARGIN, logoY + 7.4, { align: "right" });

    const ruleY = logoY + size.height + 3.6;
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, ruleY, PAGE_W - MARGIN, ruleY);
    doc.setDrawColor(...TEAL);
    doc.setLineWidth(1.15);
    doc.line(MARGIN, ruleY, MARGIN + 24, ruleY);
    this.y = ruleY + 7.5;
  }

  drawFooter(page: number, total: number): void {
    const doc = this.doc;
    const y = PAGE_H - FOOTER_H + 1.2;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    const footerSize = drawOfficialLogo(
      doc,
      this.logo,
      MARGIN,
      y + 1.8,
      FOOTER_LOGO_W,
      LOGO_BOX.footer.maxHeightMm,
    );
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.2);
    doc.setTextColor(...NAVY);
    doc.text(pdfText("Projet soumis à validation — non signé"), MARGIN + footerSize.width + 3.5, y + 5.4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.4);
    doc.setTextColor(...SLATE);
    doc.text(pdfText(PIED_DE_PAGE), MARGIN + footerSize.width + 3.5, y + 9.4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(this.control ? 8.2 : 7);
    doc.setTextColor(...NAVY);
    const pageLabel = this.control ? `CONTROLE  ${page} / ${total}` : `${page} / ${total}`;
    doc.text(pageLabel, PAGE_W - MARGIN, y + 5.4, { align: "right" });
  }

  newPage(): void {
    this.doc.addPage();
    this.drawHeader();
  }

  ensure(needed: number): void {
    if (this.y + needed <= PAGE_BOTTOM) return;
    this.newPage();
  }

  gap(mm = 3): void {
    this.y += mm;
  }

  title(): void {
    this.ensure(24);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(12.8);
    this.doc.setTextColor(...NAVY);
    const lines = wrapped(
      this.doc,
      "PROJET DE CONTRAT DE PARTENARIAT COMMERCIAL ET D'APPORT D'AFFAIRES",
      CONTENT_W,
      12.4,
      "bold",
    );
    for (const line of lines) {
      this.doc.text(line, PAGE_W / 2, this.y, { align: "center" });
      this.y += 5.3;
    }
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8.4);
    this.doc.setTextColor(...TEAL);
    this.doc.text(pdfText("Entre ENERGIA CONSEIL IA® et Madame Catarina Martins"), PAGE_W / 2, this.y, {
      align: "center",
    });
    this.y += 5.2;
    const bannerLines = wrapped(this.doc, BANNER_STATUT, CONTENT_W - 8, 7.8, "bold");
    const bannerH = 5 + bannerLines.length * 4.2;
    this.doc.setFillColor(...ORANGE_BG);
    this.doc.setDrawColor(...ORANGE);
    this.doc.setLineWidth(0.35);
    this.doc.roundedRect(MARGIN, this.y, CONTENT_W, bannerH, 1, 1, "FD");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(7.8);
    this.doc.setTextColor(...ORANGE);
    let by = this.y + 4.6;
    for (const line of bannerLines) {
      this.doc.text(line, PAGE_W / 2, by, { align: "center" });
      by += 4.2;
    }
    this.y += bannerH + 4.5;
  }

  paragraph(text: string, opts?: { bold?: boolean; size?: number; color?: Rgb; after?: number; italic?: boolean }): void {
    const size = opts?.size ?? 9.2;
    const lh = size * 0.42 + 1.12;
    const style = opts?.bold ? "bold" : opts?.italic ? "italic" : "normal";
    const lines = wrapped(this.doc, text, CONTENT_W, size, style);
    this.ensure(lines.length * lh + 2);
    this.doc.setFont("helvetica", style);
    this.doc.setFontSize(size);
    this.doc.setTextColor(...(opts?.color ?? INK));
    for (const line of lines) {
      this.ensure(lh);
      this.doc.text(line, MARGIN, this.y);
      this.y += lh;
    }
    this.y += opts?.after ?? 2.1;
  }

  bullets(items: string[]): void {
    const lh = 4.4;
    for (const item of items) {
      const lines = wrapped(this.doc, item, CONTENT_W - 6, 9.1);
      this.ensure(lines.length * lh + 1);
      this.doc.setFillColor(...TEAL);
      this.doc.circle(MARGIN + 1.4, this.y - 1.1, 0.7, "F");
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(9.1);
      this.doc.setTextColor(...INK);
      for (const [i, line] of lines.entries()) {
        this.ensure(lh);
        this.doc.text(line, MARGIN + 5, this.y);
        this.y += lh;
        if (i < lines.length - 1) this.ensure(lh);
      }
    }
    this.y += 1.3;
  }

  article(num: string, title: string): void {
    this.ensure(22);
    this.gap(1.2);
    this.doc.setFillColor(...NAVY);
    this.doc.roundedRect(MARGIN, this.y, CONTENT_W, 7.4, 0.8, 0.8, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9.3);
    this.doc.setTextColor(...WHITE);
    this.doc.text(pdfText(`Article ${num}  —  ${title}`), MARGIN + 3, this.y + 5);
    this.y += 11;
  }

  box(kind: "mint" | "orange" | "navy", title: string, body: string[]): void {
    const lh = 4.3;
    const inner = body.reduce((acc, t) => acc + wrapped(this.doc, t, CONTENT_W - 8, 8.5).length * lh, 0);
    const h = 6 + 5.2 + inner + body.length * 1.15;
    this.ensure(h + 2);
    const bg: Rgb = kind === "mint" ? MINT : kind === "orange" ? ORANGE_BG : FOG;
    const accent: Rgb = kind === "mint" ? GREEN : kind === "orange" ? ORANGE : NAVY;
    this.doc.setFillColor(...bg);
    this.doc.setDrawColor(...accent);
    this.doc.setLineWidth(0.45);
    this.doc.roundedRect(MARGIN, this.y, CONTENT_W, h, 1.2, 1.2, "FD");
    this.doc.setFillColor(...accent);
    this.doc.rect(MARGIN, this.y, 1.6, h, "F");
    let y = this.y + 5.2;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8.6);
    this.doc.setTextColor(...accent);
    this.doc.text(pdfText(title), MARGIN + 5, y);
    y += 5.4;
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...INK);
    for (const para of body) {
      const lines = wrapped(this.doc, para, CONTENT_W - 8, 8.5);
      for (const line of lines) {
        this.doc.text(line, MARGIN + 5, y);
        y += lh;
      }
      y += 1.05;
    }
    this.y += h + 3;
  }

  kvBlock(title: string, rows: [string, string][], fill: Rgb): void {
    const labelW = 52;
    const valueW = CONTENT_W - labelW - 10;
    const lineH = 4.35;
    const heights = rows.map(([, value]) => Math.max(1, wrapped(this.doc, value, valueW, 7.4).length) * lineH);
    const h = 8 + heights.reduce((a, b) => a + b, 0);
    this.ensure(h + 2);
    this.doc.setFillColor(...fill);
    this.doc.roundedRect(MARGIN, this.y, CONTENT_W, h, 1.1, 1.1, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8.2);
    this.doc.setTextColor(...NAVY);
    this.doc.text(pdfText(title), MARGIN + 3.5, this.y + 5);
    let y = this.y + 9.2;
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!row) continue;
      const [label, value] = row;
      const lines = wrapped(this.doc, value, valueW, 7.4);
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7);
      this.doc.setTextColor(...TEAL);
      this.doc.text(pdfText(label), MARGIN + 3.5, y);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.4);
      this.doc.setTextColor(...INK);
      for (const line of lines) {
        this.doc.text(line, MARGIN + 3.5 + labelW, y);
        y += lineH;
      }
    }
    this.y += h + 3.2;
  }

  moneyTable(rows: [string, string][]): void {
    const rowH = 6.2;
    const h = 7.4 + rows.length * rowH;
    this.ensure(h + 2);
    this.doc.setFillColor(...NAVY);
    this.doc.roundedRect(MARGIN, this.y, CONTENT_W, 7.2, 0.8, 0.8, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.doc.setTextColor(...WHITE);
    this.doc.text("Libellé", MARGIN + 3.5, this.y + 4.8);
    this.doc.text("Montant HT", PAGE_W - MARGIN - 3.5, this.y + 4.8, { align: "right" });
    let y = this.y + 7.2;
    rows.forEach((row, i) => {
      const last = i === rows.length - 1;
      this.doc.setFillColor(...(last ? MINT : i % 2 === 0 ? WHITE : FOG));
      this.doc.rect(MARGIN, y, CONTENT_W, rowH, "F");
      this.doc.setDrawColor(...LINE);
      this.doc.setLineWidth(0.15);
      this.doc.line(MARGIN, y + rowH, MARGIN + CONTENT_W, y + rowH);
      this.doc.setFont("helvetica", last ? "bold" : "normal");
      this.doc.setFontSize(8.4);
      this.doc.setTextColor(...(last ? GREEN : INK));
      this.doc.text(pdfText(row[0]), MARGIN + 3.5, y + 4.2);
      this.doc.text(pdfText(row[1]), PAGE_W - MARGIN - 3.5, y + 4.2, { align: "right" });
      y += rowH;
    });
    this.y += h + 3;
  }

  parties(): void {
    this.article("1", "Identification des parties");
    this.kvBlock(
      "Partie 1 - ENERGIA CONSEIL IA®",
      [
        ["Raison sociale / marque", "ENERGIA CONSEIL IA®"],
        ["Forme", "SASU"],
        ["Capital", "100 EUR"],
        ["SIRET", "941 819 427 00019"],
        ["RCS", "Lyon 941 819 427"],
        ["Siège", "16 rue Cuvier, 69006 Lyon"],
        ["Représentant", "Sylvain Lembelembe"],
        ["Qualité", QUALITE_SYLVAIN],
        ["Téléphone", "06 10 59 68 98"],
        ["Email professionnel", "contact@energia-conseil-ia.com"],
      ],
      FOG,
    );
    this.kvBlock(
      "Partie 2 - La Partenaire",
      [
        ["Nom", "Madame Catarina Martins"],
        ["Qualité", QUALITE_CATARINA],
        ["Statut", "Indépendante"],
        ["Adresse", "[À COMPLÉTER PAR CATARINA]"],
        ["Téléphone", "[À COMPLÉTER PAR CATARINA]"],
        ["Email", "[À COMPLÉTER PAR CATARINA]"],
        ["SIRET / identifiant professionnel", "[À COMPLÉTER SI APPLICABLE]"],
        ["Ci-après", "la Partenaire"],
        ["Ci-après ENERGIA", "ENERGIA"],
      ],
      MINT,
    );
    this.paragraph(
      "Les Parties entendent formaliser un partenariat commercial clair, respectueux et stimulant. Catarina Martins intervient comme partenaire indépendante, facilitatrice et apporteuse d'affaires. Le présent document est un projet soumis à validation : il n'engage les Parties qu'après complétion des mentions manquantes et signature des deux Parties.",
    );
  }

  signatures(): void {
    this.newPage();
    this.article("16", "Signatures");
    this.box("orange", "PROJET SOUMIS À VALIDATION — NON SIGNÉ À CE STADE", [
      MENTION_VALIDATION,
      MENTION_SIGNATURE_ELECTRONIQUE,
      "Les zones de signature, de date et de lieu restent vierges. Aucune signature n'est apposée automatiquement.",
    ]);
    this.paragraph("Fait à ________________________, le ____________________.");
    this.paragraph(
      "En deux exemplaires originaux, ou par signature électronique équivalente après validation complète du document par les deux Parties.",
    );
    const boxW = (CONTENT_W - 8) / 2;
    const boxH = 66;
    this.ensure(boxH + 2);
    const boxes = [
      {
        x: MARGIN,
        title: "ENERGIA CONSEIL IA®",
        role1: "Sylvain Lembelembe",
        role2: QUALITE_SYLVAIN,
      },
      {
        x: MARGIN + boxW + 8,
        title: "La Partenaire",
        role1: "Catarina Martins",
        role2: QUALITE_CATARINA,
      },
    ];
    for (const box of boxes) {
      this.doc.setDrawColor(...NAVY);
      this.doc.setLineWidth(0.35);
      this.doc.setFillColor(248, 250, 252);
      this.doc.roundedRect(box.x, this.y, boxW, boxH, 1.2, 1.2, "FD");
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(9);
      this.doc.setTextColor(...NAVY);
      this.doc.text(pdfText(box.title), box.x + 4, this.y + 6.2);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.6);
      this.doc.setTextColor(...SLATE);
      this.doc.text(pdfText(box.role1), box.x + 4, this.y + 11.4);
      const roleLines = wrapped(this.doc, box.role2, boxW - 8, 7.1);
      this.doc.setFontSize(7.1);
      this.doc.text(roleLines[0] ?? "", box.x + 4, this.y + 16);
      if (roleLines[1]) this.doc.text(roleLines[1], box.x + 4, this.y + 20.2);
      this.doc.setTextColor(...INK);
      this.doc.setFontSize(8);
      this.doc.text(pdfText("Lu et approuvé"), box.x + 4, this.y + 27);
      this.doc.text("Signature :", box.x + 4, this.y + 33);
      this.doc.setFontSize(6.5);
      this.doc.setTextColor(...SLATE);
      this.doc.text(pdfText("(zone vierge — à signer après validation)"), box.x + 4, this.y + 37);
      this.doc.setFontSize(8);
      this.doc.setTextColor(...INK);
      this.doc.setDrawColor(...SLATE);
      this.doc.line(box.x + 4, this.y + 46, box.x + boxW - 4, this.y + 46);
      this.doc.text("Lieu :", box.x + 4, this.y + 52.2);
      this.doc.line(box.x + 18, this.y + 52.4, box.x + boxW - 4, this.y + 52.4);
      this.doc.text("Date :", box.x + 4, this.y + 58);
      this.doc.line(box.x + 18, this.y + 58.2, box.x + boxW - 4, this.y + 58.2);
    }
    this.y += boxH + 4;
  }

  build(): void {
    this.doc.setProperties({
      title: "Projet de contrat de partenariat - Catarina Martins - ENERGIA CONSEIL IA - pret a signer",
      author: "ENERGIA CONSEIL IA",
      subject: "Projet soumis a validation - non signe a ce stade - signature electronique possible apres validation",
      creator: "ENERGIA CONSEIL IA",
    });
    this.drawHeader();
    this.title();
    this.parties();

    this.ensure(42);
    this.article("2", "Objet du partenariat et rôle de facilitatrice");
    this.paragraph(
      "Le présent contrat organise un partenariat commercial et d'apport d'affaires entre ENERGIA et Madame Catarina Martins, partenaire indépendante, facilitatrice et apporteuse d'affaires.",
    );
    this.paragraph(
      "Il vise à relier, avec professionnalisme, les propriétaires et porteurs de projets, la valorisation immobilière et 3D, et la rénovation énergétique portée par ENERGIA.",
    );
    this.paragraph("Catarina peut :");
    this.bullets([
      "présenter les services d'ENERGIA CONSEIL IA ;",
      "identifier des propriétaires ou porteurs de projets ;",
      "transmettre des prospects avec leur accord lorsque nécessaire ;",
      "faciliter la collecte des informations et documents ;",
      "faciliter la prise de contact entre le prospect et ENERGIA ;",
      "suivre commercialement les prospects qu'elle a apportés ;",
      "utiliser le site internet mis à sa disposition ;",
      "présenter la complémentarité entre immobilier, valorisation 3D et rénovation énergétique.",
    ]);
    this.paragraph("Catarina ne peut pas :");
    this.bullets([
      "signer un devis au nom d'ENERGIA ;",
      "engager ENERGIA ;",
      "encaisser de fonds pour ENERGIA ;",
      "garantir une aide, une économie, un financement ou un résultat ;",
      "se présenter comme salariée, dirigeante ou porte-parole habilitée d'ENERGIA ;",
      "modifier les outils, logos ou documents sans autorisation.",
    ]);

    this.article("3", "Site internet offert");
    this.paragraph(
      "ENERGIA met gratuitement à disposition de Catarina un site internet professionnel, pour son activité et la présentation du partenariat.",
    );
    this.paragraph(
      "La gratuité porte sur la version du site publiée à la date de signature. Aucune redevance n'est due par la Partenaire au titre de cette version.",
    );
    this.paragraph("Sauf accord écrit contraire, la gratuité ne comprend pas automatiquement :");
    this.bullets([
      "la publicité ;",
      "la maintenance illimitée ;",
      "les évolutions majeures ;",
      "les abonnements tiers ;",
      "les frais exceptionnels de domaine ou d'hébergement ;",
      "la production illimitée de contenus.",
    ]);
    this.paragraph(
      "Les modalités d'évolution ou de fin de mise à disposition pourront être définies séparément. Le site et ses éléments techniques restent la propriété de leurs titulaires respectifs.",
    );

    this.article("4", "Accès CRM ENERGIA CONSEIL IA");
    this.paragraph(
      "ENERGIA pourra ouvrir à Catarina un accès CRM limité, personnel, non transférable et sécurisé, exclusivement pour le suivi des dossiers qu'elle a apportés.",
    );
    this.paragraph("Catarina pourra consulter uniquement :");
    this.bullets([
      "les prospects qu'elle a apportés ;",
      "le statut commercial de ses dossiers ;",
      "les devis liés à ses prospects ;",
      "les encaissements nécessaires au calcul de sa commission ;",
      "les commissions dues ou versées.",
    ]);
    this.paragraph("Elle ne pourra pas consulter :");
    this.bullets([
      "la base complète des clients ENERGIA ;",
      "les prospects d'autres partenaires ;",
      "les marges internes ;",
      "les données confidentielles non nécessaires ;",
      "les informations personnelles non utiles au suivi du dossier.",
    ]);
    this.paragraph(
      "L'accès CRM est révocable à la fin du partenariat, ou plus tôt en cas de manquement. Les identifiants ne peuvent être cédés ni partagés.",
    );

    this.ensure(70);
    this.article("5", "Commission de 10 % HT");
    this.paragraph(
      "En contrepartie des affaires apportées et effectivement conclues, Catarina perçoit une commission de 10 % du montant global HT des travaux effectivement encaissés au titre du dossier apporté.",
    );
    this.box("mint", "Crédit bancaire effectif", [
      "La commission concerne uniquement les montants effectivement crédités sur le compte bancaire concerné.",
      "La signature du devis, l'émission d'une facture ou l'accord verbal du client ne déclenche aucun paiement de commission.",
    ]);
    this.paragraph("La commission peut porter sur :");
    this.bullets([
      "l'acompte ;",
      "les situations de travaux ;",
      "les règlements intermédiaires ;",
      "le solde ;",
      "les avenants effectivement encaissés.",
    ]);
    this.paragraph("Elle ne porte pas sur :");
    this.bullets([
      "les sommes non encaissées ;",
      "les impayés ;",
      "les annulations ;",
      "les remboursements ;",
      "les travaux non réalisés ;",
      "les aides ou financements non crédités ;",
      "les montants simplement mentionnés dans un devis.",
    ]);

    this.article("6", "Paiement de la commission — 60 % / 40 %");
    this.paragraph(
      "La commission est versée par virement bancaire, sur facture conforme de Catarina, en deux versements.",
    );
    this.bullets([
      "Premier versement : 60 % de la commission totale, après crédit effectif de l'acompte initial, et après expiration de tout délai de rétractation ou d'annulation applicable au dossier, sous réserve des éventuelles règles de remboursement applicables.",
      "Second versement : 40 % de la commission restante, après crédit effectif du solde ou du principal restant dû.",
      "Les encaissements intermédiaires peuvent être regroupés dans le second versement.",
    ]);
    this.box("navy", "Délai de 7 jours calendaires", [
      "Chaque virement est effectué dans un délai de 7 jours calendaires à compter de la réunion des conditions suivantes :",
      "1. crédit effectif des sommes sur le compte bancaire concerné ;",
      "2. réception d'une facture conforme ;",
      "3. absence d'annulation, de remboursement ou d'impayé applicable au dossier.",
    ]);

    this.ensure(95);
    this.article("7", "Exemple illustratif sur 50 000 EUR HT");
    this.paragraph(
      "L'illustration ci-dessous décrit le calcul de la commission de 10 % HT et son versement 60 % / 40 %. Elle n'anticipe aucun dossier concret.",
    );
    this.moneyTable([
      ["Projet global", "50 000 EUR HT"],
      ["Acompte initial de 30 %", "15 000 EUR HT"],
      ["Commission totale (10 %)", "5 000 EUR HT"],
      ["Premier versement — 60 % de la commission", "3 000 EUR HT"],
      ["Solde de 70 %", "35 000 EUR HT"],
      ["Second versement — 40 % de la commission", "2 000 EUR HT"],
      ["Total commission Catarina", "5 000 EUR HT"],
    ]);
    this.box("orange", "Mention obligatoire", [
      "Cet exemple est exclusivement illustratif. Il ne constitue aucune garantie de volume de travaux, de montant encaissé ou de commission.",
    ]);

    this.article("8", "Identification et suivi des prospects");
    this.paragraph(
      "La commission n'est due que si le prospect a été apporté ou identifié par Catarina avant la conclusion du devis, enregistré dans le suivi commercial, rattachable au projet concerné, et transmis de manière traçable.",
    );
    this.paragraph("Le suivi partagé comprend notamment : nom ou identifiant, date de transmission, coordonnées, objet du projet, preuve de transmission, devis, encaissements et statut du dossier.");
    this.paragraph("En cas de doublon, la priorité revient à la première transmission traçable et exploitable.");

    this.article("9", "Licence d'usage de la marque");
    this.paragraph(
      "ENERGIA accorde à Catarina un droit d'usage limité de la marque ENERGIA CONSEIL IA® et de ses logos. Ce droit est personnel, non exclusif, non transférable, limité à l'objet du partenariat, limité à la durée du contrat, et révocable en cas de manquement.",
    );
    this.paragraph("Catarina peut utiliser la marque :");
    this.bullets([
      "sur le site mis à disposition ;",
      "dans les présentations liées au partenariat ;",
      "dans les échanges commerciaux autorisés.",
    ]);
    this.paragraph("Elle ne peut pas :");
    this.bullets([
      "déposer la marque ;",
      "créer une marque similaire ;",
      "créer un nom de domaine contenant Energia Conseil sans accord écrit ;",
      "modifier le logo ;",
      "utiliser la marque pour une autre activité ;",
      "transmettre les fichiers à un tiers.",
    ]);
    this.paragraph("À la fin du partenariat, Catarina cesse toute utilisation de la marque et des supports.");

    this.article("10", "Propriété intellectuelle");
    this.paragraph(
      "Tous les outils, scripts, bases de données, modèles, rapports, visuels, logiciels et documents restent la propriété de leurs titulaires respectifs. Le contrat ne transfère aucun droit de propriété intellectuelle à Catarina.",
    );
    this.paragraph(
      "Les données personnelles sont traitées pour l'exécution du partenariat. Droits d'accès, de rectification et d'effacement : contact@energia-conseil-ia.com. Réclamation possible auprès de la CNIL.",
    );

    this.article("11", "Statut indépendant");
    this.paragraph("Catarina :");
    this.bullets([
      "agit en toute indépendance ;",
      "n'est pas salariée d'ENERGIA ;",
      "n'est pas associée d'ENERGIA ;",
      "n'est pas mandataire sociale ;",
      "n'a pas de lien de subordination ;",
      "organise librement son activité ;",
      "établit ses propres factures ;",
      "assume ses obligations fiscales, sociales et professionnelles ;",
      "ne peut pas représenter ENERGIA au-delà du présent contrat.",
    ]);
    this.paragraph(
      "La réalité de la relation doit rester cohérente avec cette indépendance. Le contrat ne crée ni contrat de travail, ni société créée de fait, ni mandat social, ni exclusivité générale.",
    );

    this.article("12", "Reconnaissance et évolution future");
    this.paragraph(
      "Selon le développement de l'activité de la Partenaire, les résultats obtenus et le volume de projets apportés, ENERGIA pourra étudier des mesures de reconnaissance ou d'accompagnement, notamment :",
    );
    this.bullets([
      "mise à disposition de matériel de présentation ;",
      "participation à certains frais validés par écrit ;",
      "prime ou bonus exceptionnel ;",
      "accompagnement matériel ou commercial ;",
      "solution de mobilité ou véhicule.",
    ]);
    this.box("navy", "Aucune obligation automatique", [
      "Ces éléments ne sont pas garantis. Ils ne constituent ni un salaire, ni un droit acquis. Ils ne doivent être accordés qu'après validation écrite, peuvent faire l'objet d'un accord séparé, et doivent être examinés avec les règles fiscales, sociales et comptables applicables.",
      "Le présent article n'attribue automatiquement ni véhicule, ni matériel, ni prise en charge de frais.",
    ]);

    this.article("13", "Durée et résiliation");
    this.paragraph("Durée : 12 mois à compter de la signature.");
    this.paragraph("Renouvellement : par accord écrit ou renouvellement convenu entre les Parties.");
    this.paragraph("Préavis : 30 jours calendaires, sauf faute grave ou impossibilité légale.");
    this.paragraph(
      "Les commissions restent dues pour les prospects correctement enregistrés avant la fin du contrat, sous réserve de la réalisation effective des travaux, du crédit bancaire effectif, de la réception de la facture, et des autres conditions contractuelles.",
    );
    this.paragraph("Aucune commission n'est due sur les dossiers apportés après la date d'effet de la résiliation.");

    this.article("14", "Association, leasing et exclusions");
    this.paragraph("Le présent contrat n'inclut pas :");
    this.bullets([
      "un rôle éventuel dans une association ;",
      "un contrat de travail ;",
      "un mandat social ;",
      "un leasing définitif ;",
      "un véhicule définitif ;",
      "la prise en charge automatique des frais personnels ou professionnels.",
    ]);
    this.paragraph("Ces éléments, s'ils étaient un jour examinés, feraient l'objet de documents distincts.");

    this.article("15", "Droit applicable et litiges");
    this.paragraph(
      "Le contrat est soumis au droit français. En cas de litige, les Parties recherchent une solution amiable dans un délai de 15 jours à compter de la notification écrite du différend. À défaut d'accord, compétence exclusive des tribunaux de Lyon.",
    );

    this.ensure(18);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...NAVY);
    this.doc.text(pdfText("Contact projet confirmé"), MARGIN, this.y);
    this.y += 5;
    this.paragraph(
      "ENERGIA / Sylvain Lembelembe — Fondateur & CEO — 06 10 59 68 98 — contact@energia-conseil-ia.com.",
      { size: 8.4, after: 2 },
    );

    this.signatures();

    const total = this.doc.getNumberOfPages();
    for (let i = 1; i <= total; i += 1) {
      this.doc.setPage(i);
      this.drawFooter(i, total);
    }
  }
}

const logo = await prepareOfficialLogo(logoPath);
mkdirSync(outputDir, { recursive: true });

const pdf = new ContratPdf(logo, false);
pdf.build();
writeFileSync(outputPath, Buffer.from(pdf.doc.output("arraybuffer")));

console.log(`PDF genere : ${outputPath}`);
console.log(`Logo source : ${logoPath}`);
console.log(`Logo integre : ${logo.width}x${logo.height} px`);
console.log(`Pages : ${pdf.doc.getNumberOfPages()}`);
