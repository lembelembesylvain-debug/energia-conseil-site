import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  CONDITIONS_PAIEMENT_DEVIS,
  CONTACT_CHIFFRAGE,
  LOGO_PUBLIC_PATH,
  OBJET_TRAVAUX_DEFAUT,
} from "./chiffrage/constantes";
import { espacesNombresFr, formatEuro, formatUnite } from "./chiffrage/format";

const MARGIN = 14;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_H = 20;
/** Largeurs fixes (mm) — somme = CONTENT_W, jamais plus large que la zone imprimable A4. */
const TABLE_COL_WIDTHS = [48, 50, 10, 12, 24, 12, 26] as const;

const NAVY: [number, number, number] = [26, 60, 94];
const GREEN: [number, number, number] = [20, 83, 45];
const GREEN_SOFT: [number, number, number] = [240, 253, 244];
const GREEN_LINE: [number, number, number] = [167, 243, 208];
const MINT: [number, number, number] = [236, 253, 245];
const SKY: [number, number, number] = [240, 249, 255];
const SLATE: [number, number, number] = [71, 85, 105];
const INK: [number, number, number] = [15, 23, 42];
const LINE: [number, number, number] = [226, 232, 240];
const ALT_ROW: [number, number, number] = [248, 250, 252];
const ALERT: [number, number, number] = [185, 28, 28];
const ALERT_BG: [number, number, number] = [254, 242, 242];
const TTC_BG: [number, number, number] = [20, 83, 45];

export type DevisClientPdfLigne = {
  designation: string;
  description?: string;
  quantite: number;
  unite: string;
  prixUnitaireHt: number | null;
  montantHt: number | null;
  tauxTva: number | null;
  montantTva?: number | null;
  montantTtc?: number | null;
};

export type ConditionsPaiementPdf = {
  acompte?: string;
  echeances?: string;
  solde?: string;
  moyensPaiement?: string;
  validite?: string;
};

export type DevisClientPdfFinancementLigne = {
  libelle: string;
  detail: string;
};

export type DevisClientPdfFinancementBloc = {
  titre?: string;
  lignes: DevisClientPdfFinancementLigne[];
  note?: string;
};

export type DevisClientPdfSolutionOption = {
  code: string;
  titre: string;
  sousTitre?: string;
  blocs: DevisClientPdfFinancementBloc[];
};

export type DevisClientPdfSolutionsExclusives = {
  optionA: DevisClientPdfSolutionOption;
  optionB: DevisClientPdfSolutionOption;
  separateur?: string;
};

export type DevisClientPdfEtudeFinanciere = {
  profil?: string;
  aides: { libelle: string; montant: number }[];
  totalAides: number;
  resteACharge: number;
  disclaimers: string[];
  financementTitre?: string;
  financement: DevisClientPdfFinancementLigne[];
  solutionsExclusives?: DevisClientPdfSolutionsExclusives;
  mentionFinancement?: string;
};

export type DevisClientPdfGesteCommercial = {
  titre: string;
  vmcLibelle: string;
  vmcMontantTtc: number;
  remiseLibelle: string;
  remiseMontantTtc: number;
  mention: string;
};

export type DevisClientPdfInput = {
  numero: string;
  date: string;
  validite: string;
  clientNom: string;
  clientAdresse: string;
  clientEmail?: string;
  clientTelephone?: string;
  adresseFacturation?: string;
  referenceDossier?: string;
  statut?: string;
  libelleProjet: string;
  objetTravaux?: string;
  introductionProjet?: string;
  lignes: DevisClientPdfLigne[];
  totalHt: number | null;
  totalTva: number | null;
  totalTtc: number;
  mentionTva?: string;
  conditionsPaiement?: ConditionsPaiementPdf;
  etudeFinanciere?: DevisClientPdfEtudeFinanciere;
  gesteCommercial?: DevisClientPdfGesteCommercial;
  modeCompact?: boolean;
  filename?: string;
};

export type TvaParTaux = {
  taux: number;
  ht: number;
  tva: number;
};

export type TotauxDevisCalcules = {
  totalHt: number | null;
  tvaParTaux: TvaParTaux[];
  totalTva: number | null;
  totalTtc: number;
  totalTtcAvantRemise?: number;
  remiseCommercialeTtc?: number;
  coherent: boolean;
  acompteTtc: number | null;
  miChantierTtc: number | null;
  soldeTtc: number | null;
};

type LogoPdf = {
  dataUrl: string;
  width: number;
  height: number;
};

const CHAMPS_INTERDITS =
  /marge|commission|clyve|co[uû]t (d['’]achat|entrant|interne|revient|mat[eé]riel)|prix plancher|taux de rentabilit/i;

export function roundEuro(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function texteOuACompleter(value?: string | null): string {
  const texte = value?.trim();
  return texte ? texte : "À compléter";
}

function pdfText(value: string): string {
  return espacesNombresFr(value)
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-");
}

export function formatTvaTaux(taux: number | null | undefined): string {
  if (taux == null || Number.isNaN(taux)) return "À compléter";
  return `${(taux * 100).toLocaleString("fr-FR", {
    minimumFractionDigits: taux === 0.055 ? 1 : 0,
    maximumFractionDigits: 1,
  })} %`;
}

function formatMontant(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "À compléter";
  return formatEuro(value);
}

function assertClientSafe(input: DevisClientPdfInput) {
  const blob = JSON.stringify(input);
  if (CHAMPS_INTERDITS.test(blob)) {
    throw new Error(
      "Le devis client ne peut pas contenir de couts d'achat, marges, commission ou cout Clyve.",
    );
  }
}

export function regrouperTva(lignes: DevisClientPdfLigne[]): TvaParTaux[] {
  const map = new Map<number, TvaParTaux>();
  for (const ligne of lignes) {
    if (ligne.montantHt == null || ligne.tauxTva == null) continue;
    const taux = ligne.tauxTva;
    const ht = roundEuro(ligne.montantHt);
    const tva = roundEuro(ligne.montantTva ?? ht * taux);
    const actuel = map.get(taux) ?? { taux, ht: 0, tva: 0 };
    actuel.ht = roundEuro(actuel.ht + ht);
    actuel.tva = roundEuro(actuel.tva + tva);
    map.set(taux, actuel);
  }
  return [...map.values()].sort((a, b) => a.taux - b.taux);
}

export function totauxDevisClient(input: DevisClientPdfInput): TotauxDevisCalcules {
  let tvaParTaux = regrouperTva(input.lignes);
  const htLignes = tvaParTaux.reduce((acc, row) => acc + row.ht, 0);
  const tvaLignes = tvaParTaux.reduce((acc, row) => acc + row.tva, 0);
  const hasLignesChiffrees = tvaParTaux.length > 0;

  let totalHt = hasLignesChiffrees
    ? roundEuro(htLignes)
    : input.totalHt == null
      ? null
      : roundEuro(input.totalHt);
  let totalTva = hasLignesChiffrees
    ? roundEuro(tvaLignes)
    : input.totalTva == null
      ? null
      : roundEuro(input.totalTva);

  let totalTtc: number;
  if (totalHt != null && totalTva != null) {
    totalTtc = roundEuro(totalHt + totalTva);
  } else {
    totalTtc = roundEuro(input.totalTtc);
  }

  let totalTtcAvantRemise: number | undefined;
  let remiseCommercialeTtc: number | undefined;
  const remiseTtc = input.gesteCommercial?.remiseMontantTtc;
  if (remiseTtc && remiseTtc > 0) {
    const tauxRemise = 0.2;
    const remiseHt = roundEuro(remiseTtc / (1 + tauxRemise));
    const remiseTva = roundEuro(remiseTtc - remiseHt);
    totalTtcAvantRemise = totalTtc;
    remiseCommercialeTtc = roundEuro(remiseTtc);
    if (totalHt != null) totalHt = roundEuro(totalHt - remiseHt);
    if (totalTva != null) totalTva = roundEuro(totalTva - remiseTva);
    tvaParTaux = tvaParTaux.map((row) =>
      row.taux === tauxRemise
        ? { ...row, ht: roundEuro(row.ht - remiseHt), tva: roundEuro(row.tva - remiseTva) }
        : row,
    );
    totalTtc = roundEuro(totalTtc - remiseTtc);
  }

  const coherent =
    totalHt != null && totalTva != null && roundEuro(totalHt + totalTva) === totalTtc;

  const acompteTtc = Number.isFinite(totalTtc) ? roundEuro(totalTtc * 0.3) : null;
  const miChantierTtc = Number.isFinite(totalTtc) ? roundEuro(totalTtc * 0.4) : null;
  const soldeTtc =
    acompteTtc != null && miChantierTtc != null
      ? roundEuro(totalTtc - acompteTtc - miChantierTtc)
      : null;

  return {
    totalHt,
    tvaParTaux,
    totalTva,
    totalTtc,
    totalTtcAvantRemise,
    remiseCommercialeTtc,
    coherent,
    acompteTtc,
    miChantierTtc,
    soldeTtc,
  };
}

function conditionsEffectives(input: DevisClientPdfInput, totaux: TotauxDevisCalcules) {
  const source = { ...CONDITIONS_PAIEMENT_DEVIS, ...input.conditionsPaiement };
  const acompteMontant =
    totaux.acompteTtc != null ? ` (${formatEuro(totaux.acompteTtc)} TTC)` : "";
  const echeanceMontant =
    totaux.miChantierTtc != null ? ` (${formatEuro(totaux.miChantierTtc)} TTC)` : "";
  const soldeMontant =
    totaux.soldeTtc != null ? ` (${formatEuro(totaux.soldeTtc)} TTC)` : "";
  return {
    acompte: `${source.acompte}${acompteMontant}`,
    echeances: `${source.echeances}${echeanceMontant}`,
    solde: `${source.solde}${soldeMontant}`,
    moyensPaiement: texteOuACompleter(source.moyensPaiement),
    validite: source.validite || input.validite || CONDITIONS_PAIEMENT_DEVIS.validite,
  };
}

async function loadLogoDataUrl(): Promise<LogoPdf | null> {
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

export function logoFromPngBytes(bytes: Uint8Array): LogoPdf | null {
  if (bytes.length < 24 || bytes[0] !== 0x89 || bytes[1] !== 0x50) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  if (width <= 0 || height <= 0) return null;
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return {
    dataUrl: `data:image/png;base64,${btoa(binary)}`,
    width,
    height,
  };
}

function logoHeight(logo: LogoPdf | null, widthMm: number): number {
  if (!logo || logo.width <= 0) return 0;
  return widthMm * (logo.height / logo.width);
}

function needPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed <= PAGE_H - FOOTER_H - 6) return y;
  doc.addPage();
  return 16;
}

function wrapHeight(doc: jsPDF, text: string, maxWidth: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(pdfText(text), maxWidth) as string[];
  return Math.max(lines.length, 1) * lineHeight;
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

function drawTopBar(doc: jsPDF) {
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, PAGE_W, 3.2, "F");
}

function drawHeader(doc: jsPDF, logo: LogoPdf | null, input: DevisClientPdfInput): number {
  drawTopBar(doc);
  const y = 8;
  const logoW = 62;
  const logoH = logo ? logoHeight(logo, logoW) : 0;
  if (logo) {
    doc.addImage(logo.dataUrl, "PNG", MARGIN, y, logoW, logoH);
  }

  const cardW = 68;
  const cardX = PAGE_W - MARGIN - cardW;
  const cardH = 42;
  doc.setFillColor(...NAVY);
  doc.roundedRect(cardX, y, cardW, cardH, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("DEVIS", cardX + cardW / 2, y + 8.5, { align: "center" });

  const meta: [string, string][] = [
    ["N°", input.numero],
    ["Emission", input.date],
    ["Validite", input.validite],
    ["Objet", input.libelleProjet],
  ];
  let metaY = y + 13.5;
  for (const [label, value] of meta) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.4);
    doc.setTextColor(167, 243, 208);
    doc.text(pdfText(label), cardX + 4, metaY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.1);
    doc.setTextColor(255, 255, 255);
    const wrapped = doc.splitTextToSize(pdfText(value), cardW - 8) as string[];
    doc.text(wrapped[0] ?? "", cardX + 4, metaY + 3);
    metaY += 6.4;
  }

  const bandY = Math.max(y + logoH, y + cardH) + 4;
  doc.setFillColor(...GREEN_SOFT);
  doc.roundedRect(MARGIN, bandY, CONTENT_W, 16, 1.4, 1.4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  doc.text(
    pdfText(`${CONTACT_CHIFFRAGE.enseigne}  ·  ${CONTACT_CHIFFRAGE.dirigeant} — ${CONTACT_CHIFFRAGE.fondateurQualite}`),
    MARGIN + 4,
    bandY + 5,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.3);
  doc.setTextColor(...SLATE);
  doc.text(
    pdfText(
      `${CONTACT_CHIFFRAGE.adresse}   ·   ${CONTACT_CHIFFRAGE.telephone}   ·   ${CONTACT_CHIFFRAGE.email}`,
    ),
    MARGIN + 4,
    bandY + 9.4,
  );
  doc.setFontSize(7);
  doc.text(
    pdfText(
      `SIRET ${CONTACT_CHIFFRAGE.siret}   ·   RCS ${CONTACT_CHIFFRAGE.rcs}   ·   ${CONTACT_CHIFFRAGE.forme}`,
    ),
    MARGIN + 4,
    bandY + 13.4,
  );

  return bandY + 20;
}

function drawStatut(doc: jsPDF, y: number, statut: string): number {
  const label = pdfText(statut);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const w = Math.min(CONTENT_W, doc.getTextWidth(label) + 10);
  doc.setFillColor(...ALERT_BG);
  doc.roundedRect(MARGIN, y, w, 8, 1.2, 1.2, "F");
  doc.setTextColor(...ALERT);
  doc.text(label, MARGIN + 5, y + 5.4);
  return y + 12;
}

function drawClientBlock(doc: jsPDF, y: number, input: DevisClientPdfInput): number {
  const rows: [string, string][] = [
    ["Nom du client", texteOuACompleter(input.clientNom)],
    ["Adresse du chantier", texteOuACompleter(input.clientAdresse)],
    ["Telephone", texteOuACompleter(input.clientTelephone)],
    ["E-mail", texteOuACompleter(input.clientEmail)],
    ["Reference dossier / audit", texteOuACompleter(input.referenceDossier)],
  ];
  const facturation = input.adresseFacturation?.trim();
  if (facturation && facturation !== input.clientAdresse?.trim()) {
    rows.push(["Adresse de facturation", facturation]);
  }

  const colW = (CONTENT_W - 6) / 2;
  const lineH = 8;
  const rowsPerCol = Math.ceil(rows.length / 2);
  const h = 11 + rowsPerCol * lineH;
  y = needPage(doc, y, h + 4);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.35);
  doc.roundedRect(MARGIN, y, CONTENT_W, h, 1.8, 1.8, "FD");
  doc.setFillColor(...GREEN);
  doc.rect(MARGIN, y, 2.2, h, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text("Informations client", MARGIN + 8, y + 7);

  rows.forEach((row, index) => {
    const col = index < rowsPerCol ? 0 : 1;
    const rowIndex = index % rowsPerCol;
    const x = MARGIN + 8 + col * (colW + 2);
    const yy = y + 14 + rowIndex * lineH;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...SLATE);
    doc.text(pdfText(row[0].toUpperCase()), x, yy);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    const wrapped = doc.splitTextToSize(pdfText(row[1]), colW - 10) as string[];
    doc.text(wrapped[0] ?? "", x, yy + 4);
  });

  return y + h + 6;
}

function drawIntroduction(doc: jsPDF, y: number, input: DevisClientPdfInput): number {
  const phrase = texteOuACompleter(
    input.introductionProjet || input.objetTravaux || OBJET_TRAVAUX_DEFAUT,
  );
  const wrapped = doc.splitTextToSize(pdfText(phrase), CONTENT_W - 14) as string[];
  const h = 12 + wrapped.length * 3.8;
  y = needPage(doc, y, h + 4);
  doc.setFillColor(...MINT);
  doc.roundedRect(MARGIN, y, CONTENT_W, h, 1.8, 1.8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  doc.text("Objet du projet", MARGIN + 6, y + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  doc.text(wrapped, MARGIN + 6, y + 10.5);
  return y + h + 5;
}

function drawGesteCommercial(
  doc: jsPDF,
  y: number,
  geste: DevisClientPdfGesteCommercial,
  compact = false,
): number {
  const innerW = CONTENT_W - 12;
  const lineH = compact ? 3.1 : 3.4;
  const vmc = `${geste.vmcLibelle} : ${formatEuro(geste.vmcMontantTtc)} TTC`;
  const remise = `${geste.remiseLibelle} : -${formatEuro(geste.remiseMontantTtc)} TTC`;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(compact ? 7.4 : 8);
  let contentH = compact ? 6 : 8;
  contentH += wrapHeight(doc, vmc, innerW, lineH) + (compact ? 1 : 2);
  contentH += wrapHeight(doc, geste.titre, innerW, compact ? 3.3 : 3.6) + (compact ? 1 : 2);
  contentH += wrapHeight(doc, remise, innerW, lineH) + (compact ? 2 : 3);
  contentH += wrapHeight(doc, geste.mention, innerW, compact ? 3 : 3.3) + (compact ? 2.5 : 4);
  y = needPage(doc, y, contentH + 4);

  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN, y, CONTENT_W, contentH, 1.6, 1.6, "FD");

  let iy = y + (compact ? 4.4 : 5.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(compact ? 7.4 : 8);
  doc.setTextColor(...NAVY);
  iy = drawWrapped(doc, vmc, MARGIN + 5, iy, innerW, lineH);
  iy += compact ? 1 : 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(compact ? 7.6 : 8.2);
  doc.setTextColor(...GREEN);
  iy = drawWrapped(doc, geste.titre, MARGIN + 5, iy, innerW, compact ? 3.3 : 3.6);
  iy += compact ? 0.8 : 1.2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(compact ? 7.4 : 8);
  doc.setTextColor(...GREEN);
  iy = drawWrapped(doc, remise, MARGIN + 5, iy, innerW, lineH);
  iy += compact ? 1.2 : 2;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(compact ? 6.2 : 6.6);
  doc.setTextColor(...SLATE);
  drawWrapped(doc, geste.mention, MARGIN + 5, iy, innerW, compact ? 3 : 3.3);
  return y + contentH + (compact ? 2.5 : 4);
}

function drawRecap(
  doc: jsPDF,
  y: number,
  totaux: TotauxDevisCalcules,
  etude?: DevisClientPdfEtudeFinanciere,
  compact = false,
): number {
  const rows: [string, string, "normal" | "ttc" | "aide" | "rac" | "remise"][] = [
    ["Total HT", formatMontant(totaux.totalHt), "normal"],
    ...totaux.tvaParTaux.map(
      (row): [string, string, "normal" | "ttc" | "aide" | "rac" | "remise"] => [
        `TVA ${formatTvaTaux(row.taux)}`,
        formatMontant(row.tva),
        "normal",
      ],
    ),
    ["Total TVA", formatMontant(totaux.totalTva), "normal"],
  ];
  if (totaux.totalTtcAvantRemise != null && totaux.remiseCommercialeTtc != null) {
    rows.push(["Total TTC avant remise", formatEuro(totaux.totalTtcAvantRemise), "normal"]);
    rows.push(["Remise commerciale", `-${formatEuro(totaux.remiseCommercialeTtc)}`, "remise"]);
    rows.push(["Total TTC net", formatMontant(totaux.totalTtc), "ttc"]);
  } else {
    rows.push(["Total TTC", formatMontant(totaux.totalTtc), "ttc"]);
  }
  if (etude) {
    rows.push(["Aides estimatives", formatEuro(etude.totalAides), "aide"]);
    rows.push([
      totaux.remiseCommercialeTtc ? "Reste a charge apres remise TTC" : "Reste a charge net TTC",
      formatEuro(etude.resteACharge),
      "rac",
    ]);
  }

  const rowH = compact ? 6.2 : 7.2;
  const boxW = CONTENT_W;
  const x = MARGIN;
  const h = (compact ? 6 : 8) + rows.length * rowH + (compact ? 2 : 4);
  y = needPage(doc, y, h + (compact ? 8 : 12));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(compact ? 9.5 : 10.5);
  doc.setTextColor(...NAVY);
  doc.text("Recapitulatif financier", MARGIN, y);
  y += compact ? 4 : 5;

  doc.setDrawColor(...LINE);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, boxW, h, 2, 2, "FD");

  let rowY = y + 7;
  for (const [label, value, kind] of rows) {
    if (kind === "ttc") {
      doc.setFillColor(...TTC_BG);
      doc.rect(x, rowY - 4.4, boxW, 9.6, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(pdfText(label), x + 4, rowY + 1.4);
      doc.setFontSize(12);
      doc.text(pdfText(value), x + boxW - 4, rowY + 1.4, { align: "right" });
      rowY += compact ? 9.2 : 11;
      continue;
    }
    if (kind === "rac") {
      doc.setFillColor(...NAVY);
      doc.rect(x, rowY - 4.4, boxW, compact ? 8 : 9.2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text(pdfText(label), x + 4, rowY + 1.2);
      doc.text(pdfText(value), x + boxW - 4, rowY + 1.2, { align: "right" });
      rowY += compact ? 8.4 : 10;
      continue;
    }
    if (kind === "remise") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...GREEN);
      doc.text(pdfText(label), x + 4, rowY);
      doc.text(pdfText(value), x + boxW - 4, rowY, { align: "right" });
      rowY += rowH;
      continue;
    }
    doc.setFont("helvetica", kind === "aide" ? "bold" : "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(kind === "aide" ? GREEN[0] : SLATE[0], kind === "aide" ? GREEN[1] : SLATE[1], kind === "aide" ? GREEN[2] : SLATE[2]);
    doc.text(pdfText(label), x + 4, rowY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(pdfText(value), x + boxW - 4, rowY, { align: "right" });
    rowY += rowH;
  }
  return y + h + (compact ? 4 : 8);
}

function drawEtudeFinanciere(
  doc: jsPDF,
  y: number,
  etude: DevisClientPdfEtudeFinanciere,
  compact = false,
): number {
  y = needPage(doc, y, compact ? 18 : 62);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(compact ? 9.5 : 10.5);
  doc.setTextColor(...NAVY);
  doc.text("Etude financiere et aides 2026 (simulation indicative)", MARGIN, y);
  y += compact ? 4 : 5;
  if (etude.profil) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(compact ? 7 : 7.5);
    doc.setTextColor(...SLATE);
    doc.text(pdfText(etude.profil), MARGIN, y);
    y += compact ? 3.6 : 4.5;
  }

  if (compact) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(...GREEN);
    doc.text(pdfText(`Aides estimatives : ${formatEuro(etude.totalAides)}`), MARGIN, y);
    doc.setTextColor(...NAVY);
    doc.text(
      pdfText(`Reste a charge apres remise : ${formatEuro(etude.resteACharge)}`),
      PAGE_W - MARGIN,
      y,
      { align: "right" },
    );
    y += 4.2;
  }

  if (!compact) {
    const aidesH = 10 + etude.aides.length * 7 + 12;
    doc.setFillColor(...GREEN_SOFT);
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(0.35);
    doc.roundedRect(MARGIN, y, CONTENT_W, aidesH, 1.6, 1.6, "FD");
    let inner = y + 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GREEN);
    doc.text("MaPrimeRenov' Parcours Accompagne", MARGIN + 5, inner);
    inner += 6;
    for (const aide of etude.aides) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.6);
      doc.setTextColor(...INK);
      const label = doc.splitTextToSize(pdfText(aide.libelle), CONTENT_W - 46) as string[];
      doc.text(label[0] ?? "", MARGIN + 5, inner);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(pdfText(formatEuro(aide.montant)), PAGE_W - MARGIN - 5, inner, { align: "right" });
      inner += 7;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...NAVY);
    doc.text("Reste a charge apres remise TTC", MARGIN + 5, inner + 1);
    doc.setFontSize(10.5);
    doc.text(pdfText(formatEuro(etude.resteACharge)), PAGE_W - MARGIN - 5, inner + 1, {
      align: "right",
    });
    y += aidesH + 3;
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(compact ? 6.4 : 6.8);
  doc.setTextColor(...SLATE);
  doc.text(pdfText(etude.disclaimers.join(" ")), MARGIN, y, { maxWidth: CONTENT_W });
  y += compact ? 6 : 8;

  y = drawFinancement(doc, y, etude, compact);
  return y;
}

function mesureOption(doc: jsPDF, option: DevisClientPdfSolutionOption, innerW: number, compact = false): number {
  const lineH = compact ? 3.2 : 3.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(compact ? 6.9 : 7.3);
  let h = compact ? 8.5 : 11;
  if (option.sousTitre) h += compact ? 5 : 6;
  for (const bloc of option.blocs) {
    if (bloc.titre) h += compact ? 4.6 : 5.5;
    for (const ligne of bloc.lignes) {
      h += wrapHeight(doc, `- ${ligne.libelle} : ${ligne.detail}`, innerW, lineH) + (compact ? 0.8 : 1.2);
    }
    if (bloc.note) h += wrapHeight(doc, bloc.note, innerW, compact ? 3 : 3.3) + (compact ? 1.6 : 2.2);
  }
  return h + (compact ? 3 : 4);
}

function drawOptionBox(
  doc: jsPDF,
  y: number,
  option: DevisClientPdfSolutionOption,
  variant: "A" | "B",
  compact = false,
): number {
  const innerW = CONTENT_W - 10;
  const lineH = compact ? 3.2 : 3.5;
  const h = mesureOption(doc, option, innerW, compact);
  y = needPage(doc, y, h);

  const fill = variant === "A" ? GREEN_SOFT : SKY;
  const stroke: [number, number, number] = variant === "A" ? [22, 163, 74] : [14, 165, 233];
  const accent = variant === "A" ? GREEN : NAVY;

  doc.setFillColor(...fill);
  doc.setDrawColor(...stroke);
  doc.setLineWidth(0.35);
  doc.roundedRect(MARGIN, y, CONTENT_W, h, 1.6, 1.6, "FD");

  let iy = y + (compact ? 4.4 : 5.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(compact ? 7.6 : 8.2);
  doc.setTextColor(...accent);
  iy = drawWrapped(doc, `SOLUTION OPTION ${option.code} : ${option.titre}`, MARGIN + 5, iy, innerW, compact ? 3.5 : 3.8);
  if (option.sousTitre) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(compact ? 6.7 : 7.2);
    doc.setTextColor(...SLATE);
    iy = drawWrapped(doc, option.sousTitre, MARGIN + 5, iy + 0.4, innerW, compact ? 3.1 : 3.4);
    iy += compact ? 0.8 : 1.2;
  } else {
    iy += compact ? 1 : 1.4;
  }

  for (const bloc of option.blocs) {
    if (bloc.titre) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(compact ? 7.1 : 7.6);
      doc.setTextColor(...NAVY);
      iy = drawWrapped(doc, bloc.titre, MARGIN + 5, iy + (compact ? 0.8 : 1.2), innerW, compact ? 3.2 : 3.5);
    }
    for (const ligne of bloc.lignes) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(compact ? 6.9 : 7.3);
      doc.setTextColor(...INK);
      iy = drawWrapped(doc, `- ${ligne.libelle} : ${ligne.detail}`, MARGIN + 5, iy + (compact ? 0.4 : 0.6), innerW, lineH);
    }
    if (bloc.note) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(compact ? 6.6 : 7);
      doc.setTextColor(...SLATE);
      iy = drawWrapped(doc, bloc.note, MARGIN + 5, iy + (compact ? 0.5 : 0.8), innerW, compact ? 3 : 3.3);
      iy += compact ? 0.6 : 1;
    }
  }
  return y + h + (compact ? 1.6 : 2.5);
}

function drawOuSeparator(doc: jsPDF, y: number, label = "OU", compact = false): number {
  y = needPage(doc, y, compact ? 7 : 10);
  const midY = y + (compact ? 2.6 : 3.5);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  const gap = 16;
  const midX = PAGE_W / 2;
  doc.line(MARGIN, midY, midX - gap, midY);
  doc.line(midX + gap, midY, PAGE_W - MARGIN, midY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(compact ? 7.8 : 8.5);
  doc.setTextColor(...NAVY);
  doc.text(label, midX, midY + 1, { align: "center" });
  return y + (compact ? 6 : 9);
}

function drawFinancement(doc: jsPDF, y: number, etude: DevisClientPdfEtudeFinanciere, compact = false): number {
  y = needPage(doc, y, compact ? 14 : 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(compact ? 9.2 : 10);
  doc.setTextColor(...NAVY);
  doc.text(
    pdfText(etude.financementTitre || "Solutions de financement (simulations indicatives a valider)"),
    MARGIN,
    y,
  );
  y += compact ? 4 : 5;

  if (etude.solutionsExclusives) {
    y = drawOptionBox(doc, y, etude.solutionsExclusives.optionA, "A", compact);
    y = drawOuSeparator(doc, y, etude.solutionsExclusives.separateur || "OU", compact);
    y = drawOptionBox(doc, y, etude.solutionsExclusives.optionB, "B", compact);
  } else {
    const finH = 6 + etude.financement.length * 6.6;
    y = needPage(doc, y, finH + 4);
    doc.setFillColor(...SKY);
    doc.setDrawColor(14, 165, 233);
    doc.roundedRect(MARGIN, y, CONTENT_W, finH, 1.6, 1.6, "FD");
    let finY = y + 5.5;
    for (const row of etude.financement) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.6);
      doc.setTextColor(...NAVY);
      doc.text(pdfText(row.libelle), MARGIN + 5, finY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK);
      const detail = doc.splitTextToSize(pdfText(row.detail), CONTENT_W - 58) as string[];
      doc.text(detail[0] ?? "", MARGIN + 50, finY);
      finY += 6.6;
    }
    y += finH + 4;
  }

  if (etude.mentionFinancement) {
    y = needPage(doc, y, compact ? 10 : 14);
    const wrapped = doc.splitTextToSize(pdfText(etude.mentionFinancement), CONTENT_W) as string[];
    doc.setFont("helvetica", "italic");
    doc.setFontSize(compact ? 6.3 : 6.7);
    doc.setTextColor(...SLATE);
    for (const line of wrapped) {
      y = needPage(doc, y, 3.5);
      doc.text(line, MARGIN, y);
      y += compact ? 2.9 : 3.3;
    }
    y += compact ? 1.2 : 2;
  }
  return y;
}

function drawPaiementEtMentions(
  doc: jsPDF,
  y: number,
  conditions: ReturnType<typeof conditionsEffectives>,
  compact = false,
): number {
  y = needPage(doc, y, compact ? 28 : 36);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(compact ? 9.2 : 10);
  doc.setTextColor(...NAVY);
  doc.text("Conditions de paiement", MARGIN, y);
  y += compact ? 4 : 5;
  const rows: [string, string][] = [
    ["Acompte", conditions.acompte],
    ["Echeances", conditions.echeances],
    ["Solde", conditions.solde],
    ["Validite", conditions.validite],
  ];
  for (const [label, value] of rows) {
    const wrapped = doc.splitTextToSize(pdfText(value), CONTENT_W - 38) as string[];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(compact ? 7 : 7.5);
    doc.setTextColor(...SLATE);
    doc.text(pdfText(label), MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK);
    doc.text(wrapped[0] ?? "", MARGIN + 32, y);
    y += compact ? 4.6 : 5.4;
  }

  y += compact ? 1.2 : 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(compact ? 9.2 : 10);
  doc.setTextColor(...NAVY);
  doc.text("Mentions legales", MARGIN, y);
  y += compact ? 3.6 : 4.5;
  const mention =
    "Document estimatif, valable 3 mois. Travaux RGE coordonnes par ENERGIA CONSEIL IA®. Aides 2026 a titre indicatif, a valider selon revenus reels. Montants definitifs apres ANAH et CEE. Financement sous reserve d'etude et d'acceptation bancaire. Garanties legales : decennale, biennale, parfait achevement. Assurance DO recommandee (non souscrite par ENERGIA). Travaux MaPrimeRenov' : ne pas demarrer avant l'accord ANAH.";
  const wrapped = doc.splitTextToSize(pdfText(mention), CONTENT_W) as string[];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(compact ? 6.5 : 7);
  doc.setTextColor(51, 65, 85);
  for (const line of wrapped) {
    doc.text(line, MARGIN, y);
    y += compact ? 2.9 : 3.3;
  }

  y += compact ? 3.5 : 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(compact ? 9.2 : 10);
  doc.setTextColor(...NAVY);
  doc.text("Bon pour accord", MARGIN, y);
  y += compact ? 4 : 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(compact ? 7.5 : 8);
  doc.setTextColor(...SLATE);
  doc.text(pdfText("Fait a ____________________    le ____________________"), MARGIN, y);
  y += compact ? 4.5 : 6;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.4);
  const signH = compact ? 14 : 20;
  doc.roundedRect(MARGIN, y, 88, signH, 1.4, 1.4, "S");
  doc.setFontSize(8);
  doc.text("Signature du client", MARGIN + 4, y + 5);
  return y + signH + (compact ? 1 : 2);
}

function footer(
  doc: jsPDF,
  page: number,
  total: number,
  input: DevisClientPdfInput,
  logo: LogoPdf | null,
) {
  const y = PAGE_H - 12;
  doc.setFillColor(...GREEN_SOFT);
  doc.rect(0, PAGE_H - 18, PAGE_W, 18, "F");
  doc.setDrawColor(...GREEN_LINE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, PAGE_H - 18, PAGE_W - MARGIN, PAGE_H - 18);

  if (logo) {
    const w = 16;
    const h = logoHeight(logo, w);
    doc.addImage(logo.dataUrl, "PNG", MARGIN, PAGE_H - 16, w, h);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GREEN);
  doc.text(pdfText(CONTACT_CHIFFRAGE.enseigne), MARGIN + 18, y - 2);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.text(pdfText(CONTACT_CHIFFRAGE.adresse), MARGIN + 18, y + 2);
  doc.text(pdfText(input.numero), PAGE_W / 2, y - 2, { align: "center" });
  doc.text(pdfText(`Edition : ${input.date}`), PAGE_W / 2, y + 2, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text(`Page ${page} / ${total}`, PAGE_W - MARGIN, y, { align: "right" });
}

export function createDevisPdfDocument(input: DevisClientPdfInput, logo: LogoPdf | null): jsPDF {
  assertClientSafe(input);
  const totaux = totauxDevisClient(input);
  const conditions = conditionsEffectives(input, totaux);
  const compact = Boolean(input.modeCompact);
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  let y = drawHeader(doc, logo, input);
  y = drawStatut(doc, y, texteOuACompleter(input.statut));
  y = drawClientBlock(doc, y, input);
  y = drawIntroduction(doc, y, input);

  const body = input.lignes.map((ligne) => [
    pdfText(ligne.designation),
    pdfText(ligne.description?.trim() || "—"),
    espacesNombresFr(ligne.quantite.toLocaleString("fr-FR", { maximumFractionDigits: 2 })),
    pdfText(formatUnite(ligne.unite)),
    ligne.prixUnitaireHt == null ? "À compléter" : pdfText(formatEuro(ligne.prixUnitaireHt)),
    pdfText(formatTvaTaux(ligne.tauxTva)),
    ligne.montantHt == null ? "À compléter" : pdfText(formatEuro(ligne.montantHt)),
  ]);

  const tableWidthMm = TABLE_COL_WIDTHS.reduce((sum, width) => sum + width, 0);
  if (tableWidthMm !== CONTENT_W) {
    throw new Error(
      `Tableau devis PDF hors zone imprimable (${tableWidthMm} mm > ${CONTENT_W} mm).`,
    );
  }

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN, bottom: FOOTER_H + 4 },
    tableWidth: CONTENT_W,
    horizontalPageBreak: false,
    head: [["Désignation", "Description", "Qté", "Unité", "Prix unitaire HT", "TVA", "Total HT"]],
    body: body.length
      ? body
      : [["Aucune prestation chiffrée", "À compléter", "—", "—", "À compléter", "—", "À compléter"]],
    styles: {
      font: "helvetica",
      fontSize: compact ? 7 : 7.4,
      cellPadding: compact
        ? { top: 1.35, bottom: 1.35, left: 1.2, right: 1.2 }
        : { top: 2, bottom: 2, left: 1.3, right: 1.3 },
      overflow: "linebreak",
      valign: "top",
      textColor: INK,
      lineColor: LINE,
      lineWidth: 0.12,
    },
    headStyles: {
      fillColor: GREEN,
      textColor: 255,
      fontStyle: "bold",
      fontSize: compact ? 6.8 : 7.2,
      overflow: "linebreak",
      valign: "middle",
      cellPadding: compact
        ? { top: 1.8, bottom: 1.8, left: 1.2, right: 1.2 }
        : { top: 2.6, bottom: 2.6, left: 1.3, right: 1.3 },
    },
    alternateRowStyles: { fillColor: ALT_ROW },
    columnStyles: {
      0: { cellWidth: TABLE_COL_WIDTHS[0], fontStyle: "bold", overflow: "linebreak" },
      1: { cellWidth: TABLE_COL_WIDTHS[1], overflow: "linebreak" },
      2: { cellWidth: TABLE_COL_WIDTHS[2], halign: "right", overflow: "linebreak" },
      3: { cellWidth: TABLE_COL_WIDTHS[3], overflow: "linebreak" },
      4: { cellWidth: TABLE_COL_WIDTHS[4], halign: "right", overflow: "linebreak" },
      5: { cellWidth: TABLE_COL_WIDTHS[5], halign: "right", overflow: "linebreak" },
      6: { cellWidth: TABLE_COL_WIDTHS[6], halign: "right", fontStyle: "bold", overflow: "linebreak" },
    },
    didParseCell: (data) => {
      if (data.section === "head" && [2, 4, 5, 6].includes(data.column.index)) {
        data.cell.styles.halign = "right";
      }
    },
    showHead: "everyPage",
    rowPageBreak: "avoid",
  });

  y = ((doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + (compact ? 4 : 6);

  if (input.gesteCommercial) {
    y = drawGesteCommercial(doc, y, input.gesteCommercial, compact);
  }

  y = drawRecap(doc, y, totaux, input.etudeFinanciere, compact);
  if (input.mentionTva) {
    const wrapped = doc.splitTextToSize(pdfText(input.mentionTva), CONTENT_W) as string[];
    doc.setFont("helvetica", "italic");
    doc.setFontSize(compact ? 6.5 : 7);
    doc.setTextColor(...SLATE);
    for (const line of wrapped) {
      y = needPage(doc, y, 4);
      doc.text(line, MARGIN, y);
      y += compact ? 3 : 3.4;
    }
    y += compact ? 2.5 : 4;
  }
  if (input.etudeFinanciere) {
    y = drawEtudeFinanciere(doc, y, input.etudeFinanciere, compact);
  }
  drawPaiementEtMentions(doc, y, conditions, compact);

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    if (i > 1) drawTopBar(doc);
    footer(doc, i, pages, input, logo);
  }

  return doc;
}

export async function generateDevisPdf(input: DevisClientPdfInput): Promise<void> {
  const logo = await loadLogoDataUrl();
  const doc = createDevisPdfDocument(input, logo);
  doc.save(input.filename ?? `Devis_${input.numero.replace(/[^\w-]+/g, "_")}.pdf`);
}
