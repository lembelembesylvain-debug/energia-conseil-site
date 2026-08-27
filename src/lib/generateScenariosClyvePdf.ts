import jsPDF from "jspdf";
import { DISCLAIMER } from "../data/testMaisonClyve";
import {
  BANDEAU_WOW,
  DISCLAIMER_SCENARIOS,
  LEGENDE_WOW,
  MENTION_AIDES,
  MENTION_DPE,
  MENTION_MADINIER,
  SCENARIOS_TRAVAUX,
  formatEuro,
  type ScenarioTravaux,
  type StatutScenarioVisuel,
} from "../data/scenariosMaisonClyve";
import type { Scenario } from "../types/audit";

const MARGIN = 14;
const PAGE_W = 210;
const PAGE_H = 297;
const NAVY: [number, number, number] = [15, 23, 42];

function t(value: string): string {
  return value
    .replace(/’/g, "'")
    .replace(/‘/g, "'")
    .replace(/“|”/g, '"')
    .replace(/–|—/g, "-")
    .replace(/€/g, " EUR")
    .replace(/➔/g, "->")
    .replace(/⭐/g, "*")
    .replace(/✅/g, "[oui]")
    .replace(/❌/g, "[non]");
}

function imageFormat(src: string): "PNG" | "JPEG" {
  return /\.jpe?g$/i.test(src) ? "JPEG" : "PNG";
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

function wrap(doc: jsPDF, text: string, y: number, size = 8): number {
  doc.setFontSize(size);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(t(text), PAGE_W - MARGIN * 2) as string[];
  for (const line of lines) {
    if (y > PAGE_H - 18) {
      doc.addPage();
      y = 22;
    }
    doc.text(line, MARGIN, y);
    y += 4.4;
  }
  return y;
}

function header(doc: jsPDF, titre?: string) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 16, "F");
  doc.setTextColor(253, 230, 138);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(t(DISCLAIMER), PAGE_W / 2, 6, { align: "center", maxWidth: PAGE_W - 12 });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(t(titre || "TEST LOCAL — Scenarios — ne pas publier"), PAGE_W / 2, 12, { align: "center" });
  doc.setTextColor(0, 0, 0);
}

async function pageScenario(
  doc: jsPDF,
  scenario: Scenario,
  statutWow: StatutScenarioVisuel,
  photoApresReelle?: string,
  titre?: string,
) {
  header(doc, titre);
  let y = 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(t(`${scenario.id}. ${scenario.titre}`), MARGIN, y);
  y += 6;
  doc.setFontSize(9);
  doc.text(t(`Badge : ${scenario.badge}  |  Objectif : ${scenario.objectif}`), MARGIN, y, {
    maxWidth: PAGE_W - MARGIN * 2,
  });
  y += 8;
  y = wrap(doc, DISCLAIMER_SCENARIOS, y, 7);
  y = wrap(
    doc,
    `DPE hypothese (NON DOCUMENTÉ) : ${scenario.dpeAvantHypothese} -> ${scenario.dpeApresHypothese}  |  Gain hypothese : ${scenario.gainDeperditionsHypothese}  |  Confiance : ${scenario.confiance}  |  Statut visuel : ${statutWow}`,
    y,
    8,
  );
  y += 2;

  const imgW = 88;
  const imgH = 50;
  const avant = scenario.photoAvantSrc ? await loadImageDataUrl(scenario.photoAvantSrc) : null;
  const wow = scenario.projectionWowSrc ? await loadImageDataUrl(scenario.projectionWowSrc) : null;
  if (avant && scenario.photoAvantSrc) {
    try {
      doc.addImage(avant, imageFormat(scenario.photoAvantSrc), MARGIN, y, imgW, imgH);
    } catch {
      /* ignore */
    }
  }
  if (wow) {
    try {
      doc.addImage(wow, "PNG", MARGIN + 94, y, imgW, imgH);
    } catch {
      /* ignore */
    }
  }
  y += imgH + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("AVANT — PHOTO REELLE", MARGIN, y);
  doc.setTextColor(146, 64, 14);
  doc.text(t(BANDEAU_WOW), MARGIN + 94, y, { maxWidth: imgW });
  doc.setTextColor(0, 0, 0);
  y += 5;
  y = wrap(doc, LEGENDE_WOW, y, 6);
  y += 2;

  if (photoApresReelle) {
    y = wrap(doc, "Photo apres travaux REELLE jointe — la projection WOW est conservee a part.", y, 8);
    try {
      doc.addImage(photoApresReelle, "PNG", MARGIN, y, imgW, imgH);
      y += imgH + 6;
    } catch {
      y += 4;
    }
  } else {
    y = wrap(doc, "PHOTO APRES TRAVAUX REELLE A AJOUTER", y, 8);
  }

  y = wrap(doc, `Budget total TTC : ${formatEuro(scenario.totalTtc)}`, y, 11);
  y += 2;
  y = wrap(doc, "Travaux inclus :", y, 8);
  for (const lot of scenario.lotsInclus) {
    y = wrap(
      doc,
      `- ${lot.libelle} | ${formatEuro(lot.montantTtc)} TTC | ${lot.source} | ${lot.reference}`,
      y,
      7,
    );
  }
  y = wrap(doc, `Travaux exclus : ${scenario.lotsExclus.join(" ; ")}`, y, 7);
  y = wrap(doc, `Transformations illustrees : ${scenario.transformations.join(" ; ")}`, y, 7);
  y = wrap(doc, `Sources : ${scenario.sources.join(" ; ")}`, y, 7);
  for (const note of scenario.notesTechniques) {
    y = wrap(doc, note, y, 7);
  }
  wrap(doc, LEGENDE_WOW, y + 2, 6);
}

export async function generateScenariosClyvePdf(input: {
  scenarios?: Scenario[] | ScenarioTravaux[];
  statutsWow: Record<string, StatutScenarioVisuel>;
  photosApresReelles?: Partial<Record<string, string>>;
  titre?: string;
  filePrefix?: string;
  mentionDpe?: string;
  mentionAides?: string;
  mentionDevisNonCumulable?: string;
  aidesBloquees?: boolean;
}): Promise<void> {
  const scenarios = input.scenarios ?? SCENARIOS_TRAVAUX;
  const aidesBloquees = input.aidesBloquees !== false;
  const filePrefix = input.filePrefix ?? "scenarios-audit";
  const headerTitre = input.titre ?? "TEST LOCAL — Scenarios — ne pas publier";
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  for (let i = 0; i < scenarios.length; i += 1) {
    if (i > 0) doc.addPage();
    const scenario = scenarios[i];
    await pageScenario(
      doc,
      scenario,
      input.statutsWow[scenario.id] ?? "PROJECTION WOW À VALIDER",
      input.photosApresReelles?.[scenario.id],
      headerTitre,
    );
  }

  doc.addPage();
  header(doc, headerTitre);
  let y = 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Aides et financement — moteur controle", MARGIN, y);
  y += 8;
  y = wrap(doc, input.mentionDpe ?? MENTION_DPE, y, 8);
  y = wrap(doc, input.mentionAides ?? MENTION_AIDES, y, 8);
  if (aidesBloquees) {
    y = wrap(
      doc,
      "Profil d'aide non determinable : RFR et/ou composition du foyer manquants. AIDES NON CALCULABLES. Reste a charge NON CALCULABLE.",
      y,
      9,
    );
  } else {
    y = wrap(
      doc,
      "Estimation eventuelle issue du moteur controle (bareme 2026). Aucun taux pedagogique. Aides a titre indicatif, a valider ANAH / CEE / MAR.",
      y,
      9,
    );
  }
  y += 2;
  for (const scenario of scenarios) {
    y = wrap(
      doc,
      aidesBloquees
        ? `${scenario.id} ${scenario.nomCourt} | Total ${formatEuro(scenario.totalTtc)} | Aides NON CALCULABLES | RAC NON CALCULABLE | Eco-PTZ : simulation impossible tant que le montant eligible, le projet valide et l'accord bancaire ne sont pas confirmes.`
        : `${scenario.id} ${scenario.nomCourt} | Total ${formatEuro(scenario.totalTtc)} | Detail aides : voir module Aides et financement. Mensualite indicative : aucun accord bancaire n'est garanti.`,
      y,
      8,
    );
  }
  y += 3;
  y = wrap(doc, input.mentionDevisNonCumulable ?? MENTION_MADINIER, y, 8);
  y = wrap(doc, DISCLAIMER_SCENARIOS, y, 8);
  wrap(doc, "Aides financieres 2026 (estimation a titre indicatif). A valider selon revenus reels. Montants definitifs apres instruction ANAH et CEE.", y, 7);

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text("PROJECTION / SIMULATION — NON CONTRACTUELLE", PAGE_W / 2, PAGE_H - 8, { align: "center" });
    doc.text(`Page ${i}/${total}`, PAGE_W - MARGIN, PAGE_H - 8, { align: "right" });
  }

  const name =
    scenarios.length === 1
      ? `${filePrefix}-${scenarios[0].id}.pdf`
      : `${filePrefix}.pdf`;
  doc.save(name);
}
