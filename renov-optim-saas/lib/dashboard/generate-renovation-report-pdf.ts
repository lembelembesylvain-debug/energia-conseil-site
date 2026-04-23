import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";

const TOTAL_PAGES = 35;
const GREEN: [number, number, number] = [16, 185, 129];
const DARK: [number, number, number] = [31, 41, 55];
const RED: [number, number, number] = [239, 68, 68];
const ALT_ROW: [number, number, number] = [249, 250, 251];

export type ReportDpe = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type ReportProfile = "TM" | "MO" | "INT" | "SUP";
export type ReportZone = "IDF" | "HORS_IDF";

export type ReportStep1 = {
  housingType: string;
  surfaceM2: number;
  constructionPeriod: string;
  zone: ReportZone;
  dpe: ReportDpe;
  income: number;
  persons: number;
};

export type ReportWorks = {
  comblesPerdusM2: number;
  comblesAmenagesM2: number;
  plancherBasM2: number;
  toitureTerrasseM2: number;
  iteM2: number;
  itiM2: number;
  fenetresCount: number;
  portesEntreeCount: number;
  voletsCount: number;
  pacAirEauKw: number;
  pacAirAirKw: number;
  pacGeoKw: number;
  chauffeEauThermoL: number;
  cesiM2: number;
  chaudiereBiomasseKw: number;
  deposeCuveFioul: boolean;
  vmcSimpleM2: number;
  vmcDoubleM2: number;
  pvKwc: number;
  auditEnergetique: boolean;
  dpeGainTarget: "2_CLASSES" | "3_CLASSES_OU_PLUS";
};

export type ReportStep2Row = {
  key: string;
  label: string;
  quantity: string;
  lowCost: number;
  highCost: number;
  mpr: number;
  mprNote?: string;
};

export type RenovationReportInput = {
  step1: ReportStep1;
  works: ReportWorks;
  profile: ReportProfile;
  profileLabel: string;
  userEmail: string | null;
  clientName?: string | null;
  clientAddress?: string | null;
  parcoursEligible: boolean;
  estimatedWorksCost: number;
  mprTotal: number;
  ceeEstimate: number;
  tvaSavings: number;
  totalAides: number;
  resteCharge: number;
  ecoPtz: number;
  annualSavings: number;
  roiYears: number;
  step2Rows: ReportStep2Row[];
};

const DPE_ORDER: ReportDpe[] = ["G", "F", "E", "D", "C", "B", "A"];
const KWH_M2: Record<ReportDpe, number> = {
  G: 400,
  F: 280,
  E: 200,
  D: 140,
  C: 100,
  B: 70,
  A: 45,
};

const GESTE_RATES: Record<
  ReportProfile,
  {
    combles: number;
    plancher: number;
    fenetres: number;
    portes: number;
    pacAe: number;
    pacGeo: number;
    pacAa: number;
    vmcDf: number;
    vmcSf: number;
    audit: number;
    depose: number;
    cesi: number;
    chauffeEau: number;
  }
> = {
  TM: {
    combles: 25,
    plancher: 50,
    fenetres: 100,
    portes: 150,
    pacAe: 5000,
    pacGeo: 11000,
    pacAa: 1200,
    vmcDf: 4000,
    vmcSf: 800,
    audit: 500,
    depose: 1200,
    cesi: 4000,
    chauffeEau: 1200,
  },
  MO: {
    combles: 20,
    plancher: 40,
    fenetres: 80,
    portes: 120,
    pacAe: 4000,
    pacGeo: 9000,
    pacAa: 900,
    vmcDf: 3000,
    vmcSf: 600,
    audit: 400,
    depose: 800,
    cesi: 3000,
    chauffeEau: 800,
  },
  INT: {
    combles: 15,
    plancher: 25,
    fenetres: 40,
    portes: 80,
    pacAe: 3000,
    pacGeo: 6000,
    pacAa: 600,
    vmcDf: 2000,
    vmcSf: 400,
    audit: 300,
    depose: 400,
    cesi: 2000,
    chauffeEau: 400,
  },
  SUP: {
    combles: 0,
    plancher: 0,
    fenetres: 0,
    portes: 0,
    pacAe: 0,
    pacGeo: 0,
    pacAa: 0,
    vmcDf: 0,
    vmcSf: 0,
    audit: 0,
    depose: 0,
    cesi: 0,
    chauffeEau: 0,
  },
};

const MAR_RATE: Record<ReportProfile, number> = {
  TM: 1,
  MO: 0.8,
  INT: 0.6,
  SUP: 0.4,
};

function eur(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

function def(v: string | null | undefined, fallback = "À définir") {
  if (v === null || v === undefined || v.trim() === "") return fallback;
  return v;
}

function targetDpe(current: ReportDpe, gain: "2_CLASSES" | "3_CLASSES_OU_PLUS"): ReportDpe {
  const idx = DPE_ORDER.indexOf(current);
  if (idx < 0) return "D";
  const steps = gain === "2_CLASSES" ? 2 : 3;
  return DPE_ORDER[Math.min(idx + steps, DPE_ORDER.length - 1)];
}

function co2Kg(dpe: ReportDpe, surface: number) {
  const base = { G: 42, F: 32, E: 24, D: 18, C: 12, B: 8, A: 5 }[dpe];
  return Math.round(base * surface);
}

function drawCover(doc: jsPDF, input: RenovationReportInput) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  for (let i = 0; i < 90; i++) {
    const t = i / 90;
    const g = Math.round(185 - t * 40);
    doc.setFillColor(16, g, 129);
    doc.rect(0, (i * h) / 90, w, h / 90 + 0.5, "F");
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("RenovOptim IA", w / 2, 55, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("RAPPORT D'AIDES À LA RÉNOVATION ÉNERGÉTIQUE", w / 2, 78, { align: "center" });
  doc.setFontSize(11);
  doc.text("Barèmes officiels ANAH Février 2026", w / 2, 90, { align: "center" });
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.line(30, 98, w - 30, 98);

  const dpeVisé = targetDpe(input.step1.dpe, input.works.dpeGainTarget);
  const dateStr = new Date().toLocaleDateString("fr-FR");
  doc.setFontSize(10);
  let y = 112;
  const lines = [
    `Date : ${dateStr}`,
    `Client : ${def(input.clientName ?? input.userEmail, "N/A")}`,
    `Adresse : ${def(input.clientAddress)}`,
    `Profil MPR : ${input.profileLabel} (${input.profile})`,
    `DPE actuel : ${input.step1.dpe}  →  DPE visé : ${dpeVisé}`,
  ];
  lines.forEach((line) => {
    doc.text(line, 30, y);
    y += 7;
  });

  doc.setFontSize(9);
  doc.text("Généré par RenovOptim IA — renovoptim-ia.com", w / 2, h - 18, { align: "center" });
  doc.setTextColor(0, 0, 0);
}

function drawPageChrome(doc: jsPDF, pageNum: number, dateStr: string) {
  doc.setPage(pageNum);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text("RenovOptim IA — Rapport Aides 2026", 14, 12);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.25);
  doc.line(14, 14, doc.internal.pageSize.getWidth() - 14, 14);
  const h = doc.internal.pageSize.getHeight();
  doc.text(`${dateStr} — Non contractuel`, 14, h - 10);
  doc.text(`Page ${pageNum} / ${TOTAL_PAGES}`, doc.internal.pageSize.getWidth() - 14, h - 10, { align: "right" });
  doc.setTextColor(0, 0, 0);
}

function addPageWithChrome(doc: jsPDF, pageNum: number, dateStr: string) {
  doc.addPage();
  drawPageChrome(doc, pageNum, dateStr);
}

function scenarioBundle(
  input: RenovationReportInput,
  gainSteps: number,
  costFactor: number,
  aidFactor: number
) {
  const cost = Math.round(input.estimatedWorksCost * costFactor);
  const aids = Math.round(input.totalAides * aidFactor);
  const rac = Math.max(cost - aids, 0);
  const sav = Math.round(input.annualSavings * (0.85 + gainSteps * 0.05));
  const roi = sav > 0 ? rac / sav : 0;
  return { cost, aids, rac, sav, roi };
}

function lastTableY(doc: jsPDF) {
  const j = doc as unknown as { lastAutoTable?: { finalY: number } };
  return j.lastAutoTable?.finalY ?? 22;
}

function mprRatePercentForRow(
  input: RenovationReportInput,
  row: ReportStep2Row
): string {
  if (input.parcoursEligible) {
    const plafond = input.works.dpeGainTarget === "2_CLASSES" ? 30000 : 40000;
    const base = Math.min(input.estimatedWorksCost, plafond);
    if (base <= 0) return "—";
    const pct = (input.mprTotal / base) * 100;
    return `${pct.toFixed(0)} %`;
  }
  const costMid = (row.lowCost + row.highCost) / 2;
  if (costMid <= 0 || row.mpr <= 0) return "—";
  return `${((row.mpr / costMid) * 100).toFixed(0)} %`;
}

export function generateRenovationReportPdf(input: RenovationReportInput) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const dateStr = new Date().toLocaleDateString("fr-FR");
  const dpeVisé = targetDpe(input.step1.dpe, input.works.dpeGainTarget);
  const kwhAvant = KWH_M2[input.step1.dpe];
  const kwhAprès = KWH_M2[dpeVisé];
  const factAvant = Math.round(kwhAvant * input.step1.surfaceM2 * 0.14);
  const factAprès = Math.round(kwhAprès * input.step1.surfaceM2 * 0.14);
  const ecoAn = Math.max(factAvant - factAprès, 0);

  const ess = scenarioBundle(input, 2, 0.88, 0.9);
  const opt = scenarioBundle(input, 3, 1, 1);
  const exc = scenarioBundle(input, 4, 1.12, 1.05);

  const marCost = 2500;
  const marPrise = MAR_RATE[input.profile];
  const marReste = Math.round(marCost * (1 - marPrise));

  const ttc = Math.round(input.estimatedWorksCost * 1.055);
  const mens15 = input.ecoPtz > 0 ? Math.round(input.ecoPtz / (15 * 12)) : 0;
  const mens20 = input.ecoPtz > 0 ? Math.round(input.ecoPtz / (20 * 12)) : 0;

  const hasIso =
    input.works.comblesPerdusM2 +
      input.works.comblesAmenagesM2 +
      input.works.plancherBasM2 +
      input.works.toitureTerrasseM2 +
      input.works.iteM2 +
      input.works.itiM2 >
    0;
  const vmcOk = hasIso && (input.works.vmcDoubleM2 > 0 || input.works.vmcSimpleM2 > 0);

  drawCover(doc, input);

  const headGreen = { fillColor: GREEN, textColor: 255, fontStyle: "bold" as const };
  const alt = { fillColor: ALT_ROW };

  const drawFiche = (startY: number, title: string, lines: string[]) => {
    let yy = startY;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text(title, 14, yy);
    yy += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    lines.forEach((line, i) => {
      doc.text(line, 14, yy + i * 5);
    });
  };

  for (let p = 2; p <= TOTAL_PAGES; p++) {
    addPageWithChrome(doc, p, dateStr);
    let y = 22;

    if (p === 2) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...DARK);
      doc.text("SYNTHÈSE EXÉCUTIVE", 14, y);
      y += 10;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const cards = [
        `Total aides estimées : ${eur(input.totalAides)}`,
        `Coût travaux estimé : ${eur(input.estimatedWorksCost)}`,
        `Reste à charge : ${eur(input.resteCharge)}`,
        `ROI estimé : ${input.roiYears.toFixed(1)} ans`,
      ];
      cards.forEach((c, i) => {
        doc.setFillColor(240, 253, 244);
        doc.rect(14 + i * 46, y, 44, 16, "F");
        doc.setTextColor(...DARK);
        doc.text(c.split(" : ")[0] + " :", 16 + i * 46, y + 6);
        doc.setFont("helvetica", "bold");
        doc.text(c.split(" : ")[1] ?? "", 16 + i * 46, y + 12);
        doc.setFont("helvetica", "normal");
      });
      y += 24;
      const recapBody = input.step2Rows.map((r) => [
        r.label,
        r.quantity,
        `${eur(r.lowCost)} - ${eur(r.highCost)}`,
        eur(r.mpr),
      ]);
      if (recapBody.length === 0) recapBody.push(["—", "—", "À définir", "À définir"]);
      autoTable(doc, {
        startY: y,
        head: [["Travaux", "Quantité", "Coût estimé", "Aide MPR"]],
        body: recapBody,
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { font: "helvetica", fontSize: 8 },
      });
      y = lastTableY(doc) + 6;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Calcul estimatif basé sur les barèmes ANAH Février 2026 — Montants non contractuels — Sous réserve d'éligibilité.",
        14,
        y,
        { maxWidth: 180 }
      );
    }

    if (p === 3) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...DARK);
      doc.text("DIAGNOSTIC THERMIQUE ACTUEL", 14, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head: [["Poste", "% déperditions", "Priorité"]],
        body: [
          ["Combles", "30%", "*****"],
          ["Murs", "25%", "****"],
          ["Fenêtres", "15%", "***"],
          ["Planchers", "10%", "***"],
          ["Ponts thermiques", "10%", "**"],
          ["Ventilation", "10%", "**"],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 8 },
      });
    }

    if (p === 4) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Consommation et facture (indicatif)", 14, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head: [["", "Avant", "Après"]],
        body: [
          ["kWh/m²/an", String(kwhAvant), String(kwhAprès)],
          ["Facture/an", eur(factAvant), eur(factAprès)],
          ["Économies/an", "", eur(ecoAn)],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 8 },
      });
      y = lastTableY(doc) + 6;
      doc.setFontSize(8);
      doc.text(`Note : Calcul basé sur DPE ${input.step1.dpe} déclaré — à affiner avec audit terrain.`, 14, y);
    }

    if (p === 5) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("VOS 3 SCÉNARIOS DE RÉNOVATION", 14, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head: [["Critère", "Essentiel", "Optimal (RECOMMANDÉ)", "Excellence"]],
        body: [
          ["Gain DPE", "+2 classes", "+3 classes", "+4 classes"],
          ["Coût travaux", eur(ess.cost), eur(opt.cost), eur(exc.cost)],
          ["Total aides", eur(ess.aids), eur(opt.aids), eur(exc.aids)],
          ["Reste à charge", eur(ess.rac), eur(opt.rac), eur(exc.rac)],
          ["Économies/an", eur(ess.sav), eur(opt.sav), eur(exc.sav)],
          ["ROI", `${ess.roi.toFixed(1)} ans`, `${opt.roi.toFixed(1)} ans`, `${exc.roi.toFixed(1)} ans`],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 7 },
        columnStyles: { 2: { fillColor: [236, 253, 245] } },
      });
    }

    if (p === 6) {
      doc.setFontSize(9);
      doc.text(
        "Le scénario Optimal est marqué RECOMMANDÉ dans le tableau précédent (colonne surlignée). Calculs basés sur les travaux sélectionnés et profil MPR.",
        14,
        y,
        { maxWidth: 180 }
      );
    }

    if (p === 7) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text("Rappel : ordre optimal des travaux — isolation avant chauffage et ventilation.", 14, y, { maxWidth: 180 });
    }

    const rates = GESTE_RATES[input.profile];

    if (p === 8) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("ISOLATION THERMIQUE", 14, y);
      y += 7;
      const isoRows: (string | number)[][] = [];
      if (input.works.comblesPerdusM2 > 0)
        isoRows.push([
          "Combles perdus",
          `${input.works.comblesPerdusM2} m²`,
          "Laine de roche 35 cm",
          "R ≥ 7",
          eur(input.works.comblesPerdusM2 * 65),
          eur(Math.min(input.works.comblesPerdusM2, 100) * rates.combles),
        ]);
      if (input.works.comblesAmenagesM2 > 0)
        isoRows.push([
          "Combles aménagés",
          `${input.works.comblesAmenagesM2} m²`,
          "Laine de roche / ouate",
          "R ≥ 7",
          eur(input.works.comblesAmenagesM2 * 95),
          eur(Math.min(input.works.comblesAmenagesM2, 100) * rates.combles),
        ]);
      if (input.works.plancherBasM2 > 0)
        isoRows.push([
          "Plancher bas",
          `${input.works.plancherBasM2} m²`,
          "Isolant rigide / flocage",
          "R ≥ 3",
          eur(input.works.plancherBasM2 * 80),
          eur(Math.min(input.works.plancherBasM2, 100) * rates.plancher),
        ]);
      if (input.works.toitureTerrasseM2 > 0)
        isoRows.push([
          "Toiture terrasse",
          `${input.works.toitureTerrasseM2} m²`,
          "PSE / polyuréthane",
          "R ≥ 4",
          eur(input.works.toitureTerrasseM2 * 180),
          eur(Math.min(input.works.toitureTerrasseM2, 100) * 60),
        ]);
      if (input.works.iteM2 > 0)
        isoRows.push([`ITE`, `${input.works.iteM2} m²`, "PSE graphité 14 cm", "R ≥ 3,7", eur(input.works.iteM2 * 190), "Parcours"]);
      if (input.works.itiM2 > 0)
        isoRows.push([`ITI`, `${input.works.itiM2} m²`, "Doublage isolant", "R ≥ 3,7", eur(input.works.itiM2 * 120), "Parcours"]);
      if (isoRows.length === 0) isoRows.push(["—", "À définir", "—", "—", "—", "—"]);
      autoTable(doc, {
        startY: y,
        head: [["Poste", "Surface", "Matériau recommandé", "R visé", "Coût HT", "Aide MPR"]],
        body: isoRows,
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 7 },
      });
      y = lastTableY(doc) + 5;
      doc.setFontSize(8);
      doc.text("Artisan recommandé : HB FACADIER / 2C ENERGIES — Résistance thermique minimale selon réglementation.", 14, y);
    }

    if (p === 9) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("MENUISERIES", 14, y);
      y += 7;
      const mRows: (string | number)[][] = [];
      if (input.works.fenetresCount > 0)
        mRows.push([
          "Fenêtres PVC",
          input.works.fenetresCount,
          "Uw ≤ 1,3 W/m².K",
          eur(input.works.fenetresCount * 650),
          eur(Math.min(input.works.fenetresCount, 10) * rates.fenetres),
        ]);
      if (input.works.portesEntreeCount > 0)
        mRows.push([
          "Portes entrée",
          input.works.portesEntreeCount,
          "U ≤ 1,3",
          eur(input.works.portesEntreeCount * 1800),
          eur(Math.min(input.works.portesEntreeCount, 10) * rates.portes),
        ]);
      if (input.works.voletsCount > 0)
        mRows.push(["Volets", input.works.voletsCount, "Isolants", eur(input.works.voletsCount * 300), "—"]);
      if (mRows.length === 0) mRows.push(["—", "À définir", "—", "—", "—"]);
      autoTable(doc, {
        startY: y,
        head: [["Type", "Quantité", "Specs", "Coût HT", "Aide MPR"]],
        body: mRows,
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 8 },
      });
      y = lastTableY(doc) + 5;
      doc.setFontSize(8);
      doc.text("Artisan : SIPV MENUISERIE — 05 49 43 72 93", 14, y);
    }

    if (p === 10) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("SYSTÈME DE CHAUFFAGE", 14, y);
      y += 7;
      const cRows: (string | number)[][] = [];
      if (input.works.pacAirEauKw > 0)
        cRows.push(["PAC Air/Eau", `${input.works.pacAirEauKw} kW`, "≥ 4,0", eur(12000), eur(rates.pacAe)]);
      if (input.works.pacGeoKw > 0)
        cRows.push(["PAC Géothermique", `${input.works.pacGeoKw} kW`, "≥ 4,0", eur(22000), eur(rates.pacGeo)]);
      if (input.works.pacAirAirKw > 0)
        cRows.push(["PAC Air/Air", `${input.works.pacAirAirKw} kW`, "SCOP", eur(3500), eur(rates.pacAa)]);
      if (input.works.chauffeEauThermoL > 0)
        cRows.push(["Chauffe-eau thermo", `${input.works.chauffeEauThermoL} L`, "COP", eur(3500), eur(rates.chauffeEau)]);
      if (input.works.cesiM2 > 0) cRows.push(["CESI", `${input.works.cesiM2} m²`, "Capteurs", eur(7000), eur(rates.cesi)]);
      if (input.works.chaudiereBiomasseKw > 0)
        cRows.push(["Chaudière biomasse", `${input.works.chaudiereBiomasseKw} kW`, "Rendement", eur(13000), "Parcours"]);
      if (cRows.length === 0) cRows.push(["—", "À définir", "—", "—", "—"]);
      autoTable(doc, {
        startY: y,
        head: [["Équipement", "Puissance", "COP", "Coût HT", "Aide MPR"]],
        body: cRows,
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 8 },
      });
      y = lastTableY(doc) + 5;
      doc.setFontSize(8);
      doc.text("Note : Dimensionnement après isolation. Artisan : ECO SYSTÈME DURABLE — 01 70 93 97 15", 14, y);
    }

    if (p === 11) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("VENTILATION", 14, y);
      y += 7;
      const vRows: (string | number)[][] = [];
      if (input.works.vmcDoubleM2 > 0)
        vRows.push([
          "VMC Double flux",
          `${Math.round(input.works.vmcDoubleM2 * 25)} m³/h`,
          "≥ 85 %",
          eur(8000),
          vmcOk ? eur(rates.vmcDf) : "0 €",
        ]);
      if (input.works.vmcSimpleM2 > 0)
        vRows.push([
          "VMC Simple flux hygro",
          `${Math.round(input.works.vmcSimpleM2 * 20)} m³/h`,
          "Hygro B",
          eur(2800),
          vmcOk ? eur(rates.vmcSf) : "0 €",
        ]);
      if (vRows.length === 0) vRows.push(["—", "À définir", "—", "—", "—"]);
      autoTable(doc, {
        startY: y,
        head: [["Type", "Débit", "Rendement", "Coût HT", "Aide MPR"]],
        body: vRows,
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 8 },
      });
      y = lastTableY(doc) + 5;
      doc.setFontSize(8);
      doc.text("Note : Obligatoire après isolation renforcée. Artisan : ECO SYSTÈME DURABLE.", 14, y);
    }

    if (p === 12) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("AUTRES POSTES", 14, y);
      y += 7;
      const oRows: (string | number)[][] = [];
      if (input.works.deposeCuveFioul) oRows.push(["Dépose cuve fioul", "1", "—", eur(1200), eur(rates.depose)]);
      if (input.works.auditEnergetique) oRows.push(["Audit DPE", "1", "RE2020", eur(900), eur(rates.audit)]);
      if (input.works.pvKwc > 0) oRows.push(["Photovoltaïque", `${input.works.pvKwc} kWc`, "Autoconso", eur(input.works.pvKwc * 2500), "—"]);
      if (oRows.length === 0) oRows.push(["—", "À définir", "—", "—", "—"]);
      autoTable(doc, {
        startY: y,
        head: [["Poste", "Qté", "Détail", "Coût HT", "Aide MPR"]],
        body: oRows,
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 8 },
      });
    }

    if (p === 13) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Synthèse corps de métier — lots", 14, y);
      y += 7;
      autoTable(doc, {
        startY: y,
        head: [["Lot", "Statut", "Commentaire"]],
        body: [
          ["Isolation", hasIso ? "Sélectionné" : "À définir", "Priorité absolue"],
          ["Menuiseries", input.works.fenetresCount + input.works.portesEntreeCount > 0 ? "Sélectionné" : "Option", "Après isolation"],
          ["Chauffage", input.works.pacAirEauKw + input.works.pacGeoKw + input.works.pacAirAirKw > 0 ? "Sélectionné" : "À définir", "Post-isolation"],
          ["Ventilation", vmcOk ? "Sélectionné" : input.works.vmcDoubleM2 + input.works.vmcSimpleM2 > 0 ? "Conditionnel" : "À définir", "Isolation préalable"],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 8 },
      });
    }

    if (p === 14) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("AIDES FINANCIÈRES 2026", 14, y);
      y += 6;
      doc.setDrawColor(...RED);
      doc.setLineWidth(0.3);
      doc.rect(14, y, 182, 12);
      doc.setFontSize(8);
      doc.setTextColor(...RED);
      doc.text("Barèmes ANAH Février 2026 — Bonus supprimés depuis sept. 2025", 16, y + 7);
      doc.setTextColor(0, 0, 0);
      y += 16;
      const mprBody = input.step2Rows.map((r) => [
        r.label,
        `${eur(r.lowCost)} - ${eur(r.highCost)}`,
        mprRatePercentForRow(input, r),
        eur(r.mpr),
      ]);
      if (mprBody.length === 0) mprBody.push(["—", "À définir", "—", "—"]);
      mprBody.push(["TOTAL MPR", "", "", eur(input.mprTotal)]);
      autoTable(doc, {
        startY: y,
        head: [["Travaux", "Coût HT (fourchette)", `Taux (${input.profile})`, "Aide MPR"]],
        body: mprBody,
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 7 },
      });
    }

    if (p === 15) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("CEE — Éco-PTZ — TVA — MAR", 14, y);
      y += 7;
      doc.setFontSize(8);
      doc.setTextColor(...RED);
      doc.text("CEE non cumulable avec Parcours Accompagné — Cumulable avec Monogeste uniquement.", 14, y, { maxWidth: 180 });
      doc.setTextColor(0, 0, 0);
      y += 10;
      autoTable(doc, {
        startY: y,
        head: [["Travaux", "Prime CEE estimée"]],
        body: [
          ["Combles / murs (est.)", eur(input.ceeEstimate * 0.35)],
          ["Fenêtres / PAC (est.)", eur(input.ceeEstimate * 0.4)],
          ["Autres", eur(input.ceeEstimate * 0.25)],
          ["TOTAL CEE", eur(input.ceeEstimate)],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 8 },
      });
      y = lastTableY(doc) + 8;
      autoTable(doc, {
        startY: y,
        head: [["Nb actions", "Plafond", "Durée"]],
        body: [
          ["1", "15 000 €", "15 ans"],
          ["2", "25 000 €", "15 ans"],
          ["3+", "50 000 €", "20 ans"],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 8 },
      });
    }

    if (p === 16) {
      doc.setFontSize(10);
      doc.text(`Économie TVA 5,5% (indicatif) : ${eur(input.tvaSavings)}`, 14, y);
      y += 8;
      doc.text(`Coût MAR : ${eur(marCost)} TTC`, 14, y);
      y += 6;
      doc.text(`Prise en charge (${input.profile}) : ${Math.round(marPrise * 100)} %`, 14, y);
      y += 6;
      doc.text(`Reste MAR à charge : ${eur(marReste)}`, 14, y);
      y += 10;
      autoTable(doc, {
        startY: y,
        head: [["Type aide", "Montant"]],
        body: [
          ["MPR", eur(input.mprTotal)],
          ["CEE", eur(input.ceeEstimate)],
          ["TVA économisée", eur(input.tvaSavings)],
          ["TOTAL", eur(input.totalAides)],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 9 },
      });
    }

    if (p === 17) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("PLAN DE FINANCEMENT", 14, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head: [["", "Montant"]],
        body: [
          ["Coût total travaux TTC (est.)", eur(ttc)],
          ["- MPR", `- ${eur(input.mprTotal)}`],
          ["- CEE", `- ${eur(input.ceeEstimate)}`],
          ["= Reste à charge (hors TVA éco.)", eur(input.resteCharge)],
          ["Éco-PTZ disponible", eur(input.ecoPtz)],
          ["Apport personnel nécessaire (indicatif)", eur(Math.max(input.resteCharge - input.ecoPtz, 0))],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 8 },
      });
    }

    if (p === 18) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Simulation mensualités Éco-PTZ (taux 0 % indicatif)", 14, y);
      y += 7;
      autoTable(doc, {
        startY: y,
        head: [["Durée", "Mensualité estimée"]],
        body: [
          ["15 ans", `${eur(mens15)}/mois`],
          ["20 ans", `${eur(mens20)}/mois`],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 9 },
      });
      y = lastTableY(doc) + 8;
      doc.setFontSize(9);
      doc.text("Contact courtier : FABIEN — VIVONS COURTIER — 06 71 19 96 45", 14, y);
      y += 5;
      doc.text("Spécialité : Éco-PTZ, 0 € apport, accord 48-72h", 14, y);
    }

    if (p === 19) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("ÉCONOMIES ÉNERGÉTIQUES PROJETÉES", 14, y);
      y += 8;
      const rows20: (string | number)[][] = [];
      const idxs = [1, 5, 10, 20];
      let cum = 0;
      for (const yr of idxs) {
        cum += Math.round(ecoAn * Math.pow(1.05, yr - 1));
        rows20.push([`An ${yr}`, eur(cum), eur(factAvant), eur(factAprès)]);
      }
      autoTable(doc, {
        startY: y,
        head: [["Année", "Économies cumulées", "Facture actuelle", "Facture après"]],
        body: rows20,
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 8 },
      });
      y = lastTableY(doc) + 6;
      doc.setFontSize(8);
      doc.text("Note : Indexation prix énergie +5%/an (hypothèse).", 14, y);
    }

    if (p === 20) {
      doc.setFontSize(10);
      doc.text(`ROI : investissement rentabilisé en ${input.roiYears.toFixed(1)} ans (estimatif).`, 14, y);
    }

    if (p === 21) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("IMPACT ENVIRONNEMENTAL", 14, y);
      y += 8;
      const co2A = co2Kg(input.step1.dpe, input.step1.surfaceM2);
      const co2B = Math.round(co2A * (kwhAprès / Math.max(kwhAvant, 1)));
      autoTable(doc, {
        startY: y,
        head: [["Indicateur", "Avant", "Après", "Gain"]],
        body: [
          ["CO₂/an (kg)", String(co2A), String(co2B), `-${Math.round(((co2A - co2B) / co2A) * 100)} %`],
          ["kWh/m²/an", String(kwhAvant), String(kwhAprès), `-${Math.round(((kwhAvant - kwhAprès) / kwhAvant) * 100)} %`],
          ["Classe énergie", input.step1.dpe, dpeVisé, "—"],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 8 },
      });
      y = lastTableY(doc) + 6;
      doc.setFontSize(9);
      doc.text(`Équivalent : ~${Math.round((co2A - co2B) / 22)} arbres plantés / an (ordre de grandeur).`, 14, y);
      y += 6;
      doc.text("Label atteignable : BBC / RE2020 selon scénario réalisé.", 14, y);
    }

    if (p === 22) {
      doc.setFontSize(9);
      doc.text("Les indicateurs sont indicatifs et dépendent des travaux effectivement réalisés.", 14, y, { maxWidth: 180 });
    }

    if (p === 23) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("IMPACT SUR LA VALEUR DU BIEN", 14, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head: [["DPE", "Impact valeur"]],
        body: [
          ["F ou G", "-15 à -20 % vs marché"],
          ["D", "Valeur marché"],
          ["B ou A", "+10 à +25 %"],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 9 },
      });
      y = lastTableY(doc) + 8;
      doc.setDrawColor(...RED);
      doc.rect(14, y, 182, 18);
      doc.setFontSize(8);
      doc.setTextColor(...RED);
      doc.text("Logements classés G : interdits à la location depuis jan. 2025", 16, y + 6, { maxWidth: 176 });
      doc.text("Logements classés F : interdits à la location dès jan. 2028", 16, y + 13, { maxWidth: 176 });
      doc.setTextColor(0, 0, 0);
      y += 24;
      doc.text(`Estimation gain valeur bien : +${eur(input.step1.surfaceM2 * 450)} (indicatif)`, 14, y);
    }

    if (p === 24) {
      doc.setFontSize(9);
      doc.text("Valorisation indicative — à confirmer par un professionnel de l'immobilier.", 14, y, { maxWidth: 180 });
    }

    if (p === 25) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("PLANNING PRÉVISIONNEL DES TRAVAUX", 14, y);
      y += 7;
      doc.setFontSize(9);
      doc.text('Règle d\'or : "Isolation AVANT chauffage".', 14, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head: [["Semaine", "Travaux", "Corps de métier", "Durée"]],
        body: [
          ["S1-S2", "Isolation combles", "Isolation", "2 jours"],
          ["S3-S6", "ITE", "Façadier", "4 semaines"],
          ["S7-S8", "Planchers", "Isolation", "1 semaine"],
          ["S9-S10", "Fenêtres", "Menuisier", "2 semaines"],
          ["S11", "VMC", "Ventilation", "3 jours"],
          ["S12-S13", "PAC", "Chauffagiste", "2 semaines"],
          ["S14", "Ballon thermo", "Plombier", "2 jours"],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 7 },
      });
      y = lastTableY(doc) + 6;
      doc.text("Durée totale indicative : 14 semaines — Planning indicatif à affiner avec les artisans.", 14, y);
    }

    if (p === 26) {
      doc.setFontSize(8);
      doc.text("Adapter le planning selon disponibilités, météo (ITE) et coordination MAR.", 14, y, { maxWidth: 180 });
    }

    if (p === 27) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("MODE OPÉRATOIRE — ÉTAPES CLÉS", 14, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head: [["Étape", "Action", "Délai", "Responsable"]],
        body: [
          ["1", "Trouver MAR", "Maintenant", "Client"],
          ["2", "Visite MAR", "J+15", "MAR"],
          ["3", "Validation éligibilité", "J+30", "ANAH"],
          ["4", "Demande MPR", "Avant devis", "MAR"],
          ["5", "Signature devis", "Après accord", "Client"],
          ["6", "Démarrage travaux", "Après MPR", "Artisans"],
          ["7", "Réception chantier", "Fin travaux", "Client + MAR"],
          ["8", "Solde MPR", "Après factures", "ANAH"],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 7 },
      });
      y = lastTableY(doc) + 8;
      doc.setDrawColor(...RED);
      doc.rect(14, y, 182, 16);
      doc.setFontSize(8);
      doc.setTextColor(...RED);
      doc.text(
        "RÈGLE ABSOLUE : Ne jamais signer de devis AVANT la demande MPR — risque de perdre toutes les aides.",
        16,
        y + 6,
        { maxWidth: 176 }
      );
      doc.setTextColor(0, 0, 0);
    }

    if (p === 28) {
      doc.setFontSize(9);
      doc.text("Coordination : MAR Léo-Energy / France Rénov' — vérifier éligibilité avant engagement.", 14, y, { maxWidth: 180 });
    }

    if (p === 29) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("CHECKLIST — NE RIEN OUBLIER", 14, y);
      y += 8;
      const items = [
        "Audit DPE récent (moins de 5 ans)",
        "MAR sélectionné et mandaté",
        "Éligibilité ANAH vérifiée",
        "Demande MPR déposée (avant devis)",
        "Devis artisans RGE obtenus (3 minimum)",
        "Devis signés (après accord MPR)",
        "Photos avant travaux",
        "Travaux réalisés par artisans RGE",
        "Factures récupérées",
        "Dossier solde MPR déposé",
        "Photos après travaux",
        "Satisfaction client signée",
      ];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      items.forEach((it, i) => {
        doc.text(`☐ ${it}`, 18, y + i * 6);
      });
    }

    if (p === 30) {
      doc.setFontSize(8);
      doc.text("Cochez avec votre MAR / AMO au fil du dossier.", 14, y);
    }

    if (p === 31) {
      drawFiche(y, "FICHE TECHNIQUE — PAC Air/Eau", [
        "Caractéristiques minimales : COP ≥ 4 — Régulation modulante",
        "Performance : dimensionnement après isolation",
        "Garantie recommandée : 2 ans pièces / 5 ans compresseur (indicatif)",
        "Entretien annuel : obligatoire — coût estimé 150-250 €/an",
      ]);
    }

    if (p === 32) {
      drawFiche(y, "FICHE TECHNIQUE — VMC double flux", [
        "Rendement de récupération ≥ 85 %",
        "Débit adapté aux pièces humides",
        "Garantie recommandée : 2 ans",
        "Entretien filtres 1-2 fois / an — ~80-150 €/an",
      ]);
    }

    if (p === 33) {
      drawFiche(y, "FICHE TECHNIQUE — Isolation combles", [
        "Résistance R ≥ 7 (objectif RT2012 / RE2020 selon contexte)",
        "Matériaux certifiés (ACERMI / marquage CE)",
        "Garantie décennale entreprise",
        "Contrôle étanchéité toiture après travaux",
      ]);
    }

    if (p === 34) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("VOS ARTISANS RGE RECOMMANDÉS", 14, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head: [["Poste", "Artisan", "Téléphone", "Certification"]],
        body: [
          ["ITE / Façade", "HB FACADIER — Bas HILMI", "06 21 63 58 93", "RGE Qualibat"],
          ["PAC / VMC / Isolation", "ECO SYSTÈME DURABLE", "01 70 93 97 15", "RGE QualiPAC"],
          ["Isolation écologique", "2C ENERGIES", "09 72 57 47 47", "RGE"],
          ["Menuiseries", "SIPV MENUISERIE", "05 49 43 72 93", "RGE"],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 7 },
      });
      y = lastTableY(doc) + 5;
      doc.setFontSize(8);
      doc.text("Tous certifiés RGE — Obligatoire pour obtenir les aides.", 14, y);
    }

    if (p === 35) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("CONTACTS UTILES", 14, y);
      y += 8;
      autoTable(doc, {
        startY: y,
        head: [["Service", "Contact", "Téléphone"]],
        body: [
          ["France Rénov'", "Conseil gratuit", "0 808 800 700"],
          ["ANAH", "Aides nationales", "anah.fr"],
          ["Courtier financement", "FABIEN — VIVONS COURTIER", "06 71 19 96 45"],
          ["RenovOptim IA", "Support", "renovoptim-ia.com"],
        ],
        theme: "grid",
        headStyles: headGreen,
        alternateRowStyles: alt,
        styles: { fontSize: 8 },
      });
      y = lastTableY(doc) + 10;
      doc.setFontSize(8);
      doc.text(
        "Rapport généré par RenovOptim IA — Barèmes ANAH Février 2026 — Calcul estimatif non contractuel — Sous réserve d'éligibilité — renovoptim-ia.com",
        14,
        y,
        { maxWidth: 180 }
      );
    }
  }

  const name = `rapport-renovation-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(name);
}
