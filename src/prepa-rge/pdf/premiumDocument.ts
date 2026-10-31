import { jsPDF } from "jspdf";

export type SheetIndicator = { label: string; value: string };

export type SheetModule = { title: string; points: string[] };

export type PremiumDocument = {
  fileName: string;
  title: string;
  indicators: SheetIndicator[];
  lead?: string;
  modules?: SheetModule[];
  notes?: string[];
  footnote?: string;
};

const GOLD: [number, number, number] = [212, 175, 55];
const GOLD_INK: [number, number, number] = [122, 92, 32];
const INK: [number, number, number] = [28, 24, 18];
const MUTED: [number, number, number] = [88, 80, 68];
const PEARL: [number, number, number] = [247, 244, 238];
const FORMULA: [number, number, number] = [236, 230, 216];

const MARGIN = 14;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;
const CONTENT_BOTTOM = 258;
const PROSE_BOTTOM = 272;

type Block =
  | { kind: "text" | "check"; lines: string[]; height: number }
  | { kind: "formula"; lines: string[]; height: number };

function isFormula(point: string) {
  return /surchauffe évaporateur|sous-refroidissement condenseur/i.test(point);
}

function normalizePdfText(value: string) {
  return value.replace(/\u2212/g, " - ").replace(/\u2013|\u2014/g, " - ").replace(/\u00a0/g, " ");
}

function wrap(doc: jsPDF, text: string, width: number) {
  return doc.splitTextToSize(normalizePdfText(text), Math.max(24, width * 0.92)) as string[];
}

function isChecklist(title: string) {
  return /mise en service|épreuve pratique/i.test(title);
}

function drawDiamond(doc: jsPDF, cx: number, cy: number, radius: number) {
  doc.setFillColor(...GOLD);
  doc.triangle(cx, cy - radius, cx + radius, cy, cx, cy + radius, "F");
  doc.triangle(cx, cy - radius, cx - radius, cy, cx, cy + radius, "F");
}

function drawHeader(doc: jsPDF) {
  const left = "ENERGIA-CONSEIL IA  ·  ACADÉMIE DU BÂTIMENT & DES FLUIDES";
  const badge = "DOCUMENT OFFICIEL  ·  ÉDITION 2026";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.4);
  const badgeW = doc.getTextWidth(badge) + 5.2;
  const badgeX = PAGE_W - MARGIN - badgeW;
  doc.setFontSize(7.2);
  const leftW = doc.getTextWidth(left);
  const leftSize = leftW > badgeX - MARGIN - 3 ? 6.4 : 7.2;
  doc.setFontSize(leftSize);
  doc.setTextColor(...INK);
  doc.text(left, MARGIN, 12);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.roundedRect(badgeX, 7.8, badgeW, 5.4, 0.7, 0.7, "S");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(...GOLD_INK);
  doc.text(badge, badgeX + 2.6, 11.5);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.35);
  doc.line(MARGIN, 16.4, PAGE_W - MARGIN, 16.4);
  return 22;
}

function drawFooter(doc: jsPDF, page: number, total: number) {
  const y = 278;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.25);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.1);
  doc.setTextColor(...MUTED);
  const legal = `ENERGIA CONSEIL IA SASU  ·  Ingénierie & Conseil Technique  ·  Code APE 71.12B  ·  SIRET 941 819 427 00019  ·  Marque INPI n°5213845  ·  Page ${page}/${total}`;
  const legalLines = doc.splitTextToSize(legal, CONTENT_W) as string[];
  doc.text(legalLines, MARGIN, y + 4);
  doc.setFontSize(6);
  doc.text(
    "Programme de préparation et perfectionnement professionnel privé. Ne remplace pas le stage pratique en centre d'examen agréé.",
    MARGIN,
    y + 4 + legalLines.length * 3.1,
  );
}

function layoutModule(doc: jsPDF, module: SheetModule) {
  const checklist = isChecklist(module.title);
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  const titleLines = wrap(doc, module.title, CONTENT_W - 22);
  const blocks: Block[] = module.points.map((point) => {
    if (isFormula(point)) {
      doc.setFont("times", "italic");
      doc.setFontSize(10);
      const lines = wrap(doc, point, CONTENT_W - 32);
      return { kind: "formula" as const, lines, height: 10 + lines.length * 4.6 };
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const lines = wrap(doc, point, CONTENT_W - (checklist ? 20 : 16));
    return { kind: checklist ? ("check" as const) : ("text" as const), lines, height: lines.length * 4.15 + 1.8 };
  });
  const height = 5 + titleLines.length * 4.8 + 2 + blocks.reduce((sum, block) => sum + block.height, 0) + 3.5;
  return { titleLines, blocks, height, checklist };
}

function paintModule(doc: jsPDF, y: number, index: number, module: SheetModule) {
  const layout = layoutModule(doc, module);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y, CONTENT_W, layout.height, 1.4, 1.4, "S");
  drawDiamond(doc, MARGIN + 5.2, y + 6.3, 1.15);
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...GOLD_INK);
  doc.text(String(index + 1).padStart(2, "0"), MARGIN + 8.2, y + 7.2);
  doc.setTextColor(...INK);
  doc.text(layout.titleLines, MARGIN + 16, y + 7.2);
  let cursor = y + 7.2 + layout.titleLines.length * 4.8 + 1.2;
  for (const block of layout.blocks) {
    if (block.kind === "formula") {
      doc.setFillColor(...FORMULA);
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.25);
      doc.roundedRect(MARGIN + 4, cursor, CONTENT_W - 8, block.height - 1.6, 1, 1, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(...GOLD_INK);
      doc.text("FORMULE", MARGIN + 6.5, cursor + 3.6);
      doc.setFont("times", "italic");
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      doc.text(block.lines, MARGIN + 6.5, cursor + 8);
    } else if (block.kind === "check") {
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.3);
      doc.rect(MARGIN + 5, cursor + 0.4, 2.5, 2.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text(block.lines, MARGIN + 10, cursor + 2.6);
    } else {
      drawDiamond(doc, MARGIN + 6.1, cursor + 1.5, 0.7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text(block.lines, MARGIN + 9, cursor + 2.5);
    }
    cursor += block.height;
  }
  return y + layout.height + 4.5;
}

function drawCartouche(doc: jsPDF, y: number, title: string, indicators: SheetIndicator[]) {
  const cells = indicators.slice(0, 4);
  while (cells.length < 4) cells.push({ label: "—", value: "—" });
  doc.setFont("times", "bold");
  doc.setFontSize(12.5);
  const titleLines = wrap(doc, title.toLocaleUpperCase("fr-FR"), CONTENT_W - 10);
  const colW = (CONTENT_W - 10) / 4;
  doc.setFont("times", "bold");
  doc.setFontSize(8.5);
  const valueLines = cells.map((cell) => wrap(doc, cell.value, colW - 4));
  const valueH = Math.max(...valueLines.map((lines) => lines.length), 1) * 3.7;
  const height = 7 + titleLines.length * 5.4 + 6 + valueH + 5;
  doc.setFillColor(...PEARL);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN, y, CONTENT_W, height, 1.6, 1.6, "FD");
  doc.setFont("times", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(...INK);
  doc.text(titleLines, MARGIN + 5, y + 7);
  const rowY = y + 7 + titleLines.length * 5.4 + 2;
  cells.forEach((cell, index) => {
    const x = MARGIN + 5 + index * colW;
    if (index > 0) {
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.15);
      doc.line(x - 1.5, rowY, x - 1.5, y + height - 3.5);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.setTextColor(...GOLD_INK);
    doc.text(cell.label.toLocaleUpperCase("fr-FR"), x, rowY + 3);
    doc.setFont("times", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text(valueLines[index], x, rowY + 7.2);
  });
  return y + height + 6;
}

function drawProse(doc: jsPDF, y: number, paragraphs: string[]) {
  for (const paragraph of paragraphs) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const lines = wrap(doc, paragraph, CONTENT_W);
    const height = lines.length * 4.2 + 2;
    if (y + height > PROSE_BOTTOM) {
      doc.addPage();
      y = drawHeader(doc);
    }
    doc.setTextColor(...INK);
    doc.text(lines, MARGIN, y + 3.5);
    y += height;
  }
  return y + 1;
}

export function renderPremiumPdf(documentSpec: PremiumDocument) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  let y = drawHeader(doc);
  const cartoucheH = (() => {
    doc.setFont("times", "bold");
    doc.setFontSize(12.5);
    const titleLines = wrap(doc, documentSpec.title.toLocaleUpperCase("fr-FR"), CONTENT_W - 10);
    doc.setFontSize(8.5);
    const colW = (CONTENT_W - 10) / 4;
    const valueH = Math.max(
      ...documentSpec.indicators.slice(0, 4).map((cell) => wrap(doc, cell.value, colW - 4).length),
      1,
    ) * 3.7;
    return 7 + titleLines.length * 5.4 + 6 + valueH + 5;
  })();
  if (y + cartoucheH > CONTENT_BOTTOM) {
    doc.addPage();
    y = drawHeader(doc);
  }
  y = drawCartouche(doc, y, documentSpec.title, documentSpec.indicators);
  if (documentSpec.lead) y = drawProse(doc, y, [documentSpec.lead]);
  for (const [index, module] of (documentSpec.modules ?? []).entries()) {
    const layout = layoutModule(doc, module);
    if (y + layout.height > CONTENT_BOTTOM) {
      doc.addPage();
      y = drawHeader(doc);
    }
    y = paintModule(doc, y, index, module);
  }
  if (documentSpec.notes?.length) y = drawProse(doc, y + 1, documentSpec.notes);
  if (documentSpec.footnote) y = drawProse(doc, y, [documentSpec.footnote]);
  void y;
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    drawFooter(doc, page, total);
  }
  return doc;
}

export function downloadPremiumPdf(documentSpec: PremiumDocument) {
  renderPremiumPdf(documentSpec).save(documentSpec.fileName);
}
