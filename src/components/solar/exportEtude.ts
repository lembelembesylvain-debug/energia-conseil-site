import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";
import { BRANDING } from "../../lib/branding";
import { DEPARTEMENTS } from "./catalogue";
import { libelleAzimut } from "./layout";
import { capturerPlanToiture } from "./planPdf";
import type { EtudeTechnique } from "./types";

const CLE_STOCKAGE = "energia-etude-calpinage-v1";

const CONTACTS = [
  "Sylvain LEMBELEMBE (AMO) - 06 10 59 68 98 - contact@energia-conseil-ia.com",
  "DAMIEN (Commercial) - 06 72 68 09 68 - damien.srdconseil@gmail.com",
  "FABIEN - VIVONS COURTIER - 06 71 19 96 45",
  "Julia (Juriste)",
  "MAR Antoine BARATIER - Cabinet C2ET",
];

export function euroEtude(montant: number): string {
  const arrondi = Math.round(montant);
  const signe = arrondi < 0 ? "-" : "";
  const corps = String(Math.abs(arrondi)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${signe}${corps} EUR`;
}

export function entierEspace(montant: number): string {
  return String(Math.round(montant)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function slug(nom: string): string {
  const base = nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "client";
}

function resoudreDossier(dossierId: string | null): string {
  if (dossierId) return dossierId;
  try {
    return localStorage.getItem("energia-crm-dossier-actif-v1") || "sans-dossier";
  } catch {
    return "sans-dossier";
  }
}

function sansMarge(etude: EtudeTechnique): EtudeTechnique {
  if (!etude.devis || etude.devis.margeMasquee) return etude;
  return {
    ...etude,
    devis: {
      ...etude.devis,
      lignes: etude.devis.lignes.map((ligne) => ({ ...ligne, coutHt: ligne.totalHt, margeConnue: false })),
      coutAchatHt: etude.devis.totalHt,
      margeBruteHt: 0,
      margeBrutePct: 0,
      margeMasquee: true,
    },
  };
}

export function telechargerEtudeJson(etude: EtudeTechnique, options?: { masquerMarge?: boolean }) {
  const payload = options?.masquerMarge ? sansMarge(etude) : etude;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = `etude-calepinage-${slug(etude.clientNom)}.json`;
  lien.click();
  URL.revokeObjectURL(url);
}

export function attacherEtudeAuDevis(
  etude: EtudeTechnique,
  dossierId: string | null,
  options?: { masquerMarge?: boolean },
): string {
  const id = resoudreDossier(dossierId);
  const source = options?.masquerMarge ? sansMarge(etude) : etude;
  const payload: EtudeTechnique = { ...source, dossierId: id, genereLe: new Date().toISOString() };
  const brut = localStorage.getItem(CLE_STOCKAGE);
  const map = brut ? (JSON.parse(brut) as Record<string, EtudeTechnique>) : {};
  map[id] = payload;
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent("energia-calpinage-attache", { detail: { dossierId: id } }));
  return id;
}

const MARINE: [number, number, number] = [8, 18, 40];
const MARINE_BANDE: [number, number, number] = [5, 12, 28];
const CYAN: [number, number, number] = [34, 211, 238];
const CYAN_ENCRE: [number, number, number] = [14, 116, 144];
const ENCRE: [number, number, number] = [15, 23, 42];
const ARDOISE: [number, number, number] = [71, 85, 105];
const GRIS_CARTE: [number, number, number] = [241, 245, 249];
const FILET: [number, number, number] = [203, 213, 225];
const MARGE = 14;
const PIED = 20;
const Y_SUITE = 18;

export type LigneSpec = { label: string; valeur: string };

function latin(texte: string): string {
  return texte
    .replace(/[—–−]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/\u00a0|\u202f/g, " ")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/€/g, "EUR")
    .replace(/×/g, "x");
}

function decimalFr(valeur: number, decimales: number): string {
  const signe = valeur < 0 ? "-" : "";
  const [entier, dec] = Math.abs(valeur).toFixed(decimales).split(".");
  return `${signe}${entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${dec}`;
}

function quantitePdf(valeur: number): string {
  const arrondi = Math.round(valeur * 100) / 100;
  const [entier, decimale] = arrondi.toFixed(2).split(".");
  const corps = entier.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  if (decimale === "00") return corps;
  return `${corps},${decimale.endsWith("0") ? decimale[0] : decimale}`;
}

function couvertureLibelle(type: EtudeTechnique["toiture"]["typeCouverture"]): string {
  if (type === "bac-acier") return "Bac acier";
  if (type === "terrasse") return "Toiture terrasse";
  if (type === "ombriere") return "Ombrière de parking";
  return "Rampant";
}

function assurer(doc: jsPDF, y: number, hauteur: number): number {
  const utile = doc.internal.pageSize.getHeight() - PIED - Y_SUITE;
  const besoin = Math.min(hauteur, utile);
  if (y + besoin <= doc.internal.pageSize.getHeight() - PIED) return y;
  doc.addPage();
  return Y_SUITE;
}

function tailleAjustee(doc: jsPDF, texte: string, maxW: number, max: number, min: number, style: "normal" | "bold" = "bold"): number {
  let taille = max;
  doc.setFont("helvetica", style);
  doc.setFontSize(taille);
  while (taille > min && doc.getTextWidth(texte) > maxW) {
    taille -= 0.3;
    doc.setFontSize(taille);
  }
  return taille;
}

function uneLigne(doc: jsPDF, texte: string, maxW: number): string {
  const propre = latin(texte);
  const lignes = doc.splitTextToSize(propre, maxW) as string[];
  if (lignes.length <= 1) return lignes[0] || "";
  let court = lignes[0];
  while (court.length > 1 && doc.getTextWidth(`${court}...`) > maxW) court = court.slice(0, -1);
  return `${court}...`;
}

function formaterRepartition(chaines: EtudeTechnique["electrique"]["chaines"]): string {
  const map = new Map<number, number>();
  chaines.forEach((chaine) => {
    if (chaine.nombre > 0) map.set(chaine.nombre, (map.get(chaine.nombre) ?? 0) + 1);
  });
  const morceaux = [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([nombre, compte]) => `${compte} x ${nombre}`);
  if (morceaux.length === 0) return "aucune chaîne";
  if (morceaux.length === 1) return morceaux[0];
  const dernier = morceaux.pop() ?? "";
  return `${morceaux.join(", ")} et ${dernier}`;
}

export function lignesSyntheseElectrique(etude: EtudeTechnique): LigneSpec[] {
  const electrique = etude.electrique;
  const actives = electrique.chaines.filter((chaine) => chaine.nombre > 0);
  const repartition = formaterRepartition(electrique.chaines);
  const chaines =
    actives.length > 0 ? `${actives.length} chaînes réparties (${repartition})` : "Aucune chaîne";
  const lignes: LigneSpec[] = [];
  if (electrique.cascade) {
    lignes.push({ label: "Onduleurs", valeur: `${electrique.cascade.nombre} x ${electrique.cascade.nom}` });
    lignes.push({ label: "Ratio DC/AC", valeur: electrique.cascade.ratio.toFixed(2).replace(".", ",") });
    lignes.push({ label: "Chaînes MPPT", valeur: chaines });
  } else if (electrique.micro) {
    lignes.push({ label: "Micro-onduleurs", valeur: `${electrique.micro.nombreMicros} x ${electrique.micro.nom}` });
    lignes.push({
      label: "Bus AC",
      valeur: `${electrique.micro.branches.length} branche(s) · ${electrique.micro.va} VA`,
    });
    lignes.push({
      label: "Modules",
      valeur: `${entierEspace(etude.modulesActifs)} modules · ${electrique.micro.panneauxParMicro} par micro`,
    });
  } else if (electrique.centrale) {
    lignes.push({ label: "Onduleur", valeur: electrique.centrale.nom });
    lignes.push({
      label: "Ratio DC/AC",
      valeur: `${electrique.centrale.ratio.toFixed(2).replace(".", ",")} · ${decimalFr(electrique.centrale.kwAc, 0)} kW AC`,
    });
    lignes.push({ label: "Chaînes MPPT", valeur: chaines });
  } else {
    const unites = Math.max(1, electrique.unitesPowerwall);
    lignes.push({
      label: "Architecture",
      valeur: unites > 1 ? `${unites} x Tesla Powerwall 3` : "Tesla Powerwall 3",
    });
    if (electrique.secoursKw) lignes.push({ label: "Secours", valeur: `${electrique.secoursKw} kW` });
    lignes.push({ label: "Chaînes MPPT", valeur: chaines });
  }
  return lignes.map((ligne) => ({ label: latin(ligne.label), valeur: latin(ligne.valeur) }));
}

function dateFr(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return latin(iso);
  const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  return `${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}`;
}

function retourLabel(ans: number | null): string {
  if (ans === null || !Number.isFinite(ans)) return "> 25 ans";
  const arrondi = Math.round(ans * 10) / 10;
  if (Math.abs(arrondi - Math.round(arrondi)) < 0.05) return `${entierEspace(Math.round(arrondi))} ans`;
  return `${decimalFr(arrondi, 1)} ans`;
}

function titreSection(doc: jsPDF, y: number, index: string, texte: string): number {
  const suivant = assurer(doc, y, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...CYAN_ENCRE);
  doc.text(index, MARGE, suivant + 4.2);
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...ENCRE);
  doc.text(latin(texte), MARGE + 9, suivant + 4.4);
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.8);
  doc.line(MARGE, suivant + 7.4, MARGE + 46, suivant + 7.4);
  return suivant + 12;
}

function carteKpi(doc: jsPDF, x: number, y: number, w: number, h: number, label: string, valeur: string, detail: string) {
  doc.setFillColor(...GRIS_CARTE);
  doc.setDrawColor(...FILET);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, w, h, 1.8, 1.8, "FD");
  doc.setFillColor(...CYAN);
  doc.rect(x + 1.8, y + 0.45, w - 3.6, 1.15, "F");
  doc.setTextColor(...ARDOISE);
  const tailleLabel = tailleAjustee(doc, label, w - 6, 6.2, 5, "bold");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(tailleLabel);
  doc.text(label, x + 3, y + 6.6);
  const tailleValeur = tailleAjustee(doc, valeur, w - 6, 11, 7.5, "bold");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(tailleValeur);
  doc.setTextColor(...ENCRE);
  doc.text(valeur, x + 3, y + 14.2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.4);
  doc.setTextColor(...ARDOISE);
  doc.text(uneLigne(doc, detail, w - 6), x + 3, y + 19.4);
}

type CelluleTableau = {
  content: string;
  colSpan?: number;
  styles?: Record<string, unknown>;
};

function peindreLettre(doc: jsPDF, numero: string, date: string) {
  const pageW = doc.internal.pageSize.getWidth();
  const hauteur = 29;
  const bandes = 12;
  for (let i = 0; i < bandes; i += 1) {
    const t = i / (bandes - 1);
    doc.setFillColor(Math.round(6 + t * 10), Math.round(16 + t * 14), Math.round(36 + t * 22));
    doc.rect(0, (hauteur / bandes) * i, pageW, hauteur / bandes + 0.25, "F");
  }
  doc.setFillColor(...MARINE_BANDE);
  doc.rect(0, 29, pageW, 8, "F");
  doc.setFillColor(...CYAN);
  doc.rect(0, 37, pageW, 1.2, "F");

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("ENERGIA CONSEIL IA", MARGE, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...CYAN);
  doc.text("Bureau d'Études Thermiques & Solaire", MARGE, 19.2);
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text("Bureau d'études & AMO    ·    Contractant général    ·    QualiPV", MARGE, 25.4);

  const badgeW = 64;
  const badgeX = pageW - MARGE - badgeW;
  doc.setFillColor(10, 28, 58);
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.4);
  doc.roundedRect(badgeX, 6.2, badgeW, 20.2, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.6);
  doc.setTextColor(...CYAN);
  doc.text("DEVIS D'INGÉNIERIE", badgeX + badgeW / 2, 11.6, { align: "center" });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(uneLigne(doc, numero || "ETUDE PV", badgeW - 6), badgeX + badgeW / 2, 16.8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(203, 213, 225);
  doc.text(uneLigne(doc, date, badgeW - 6), badgeX + badgeW / 2, 22, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.3);
  doc.setTextColor(226, 232, 240);
  doc.text(
    latin(`${BRANDING.siege}     ·     ${BRANDING.telephone}     ·     ${BRANDING.email}     ·     ${BRANDING.site}`),
    pageW / 2,
    34.2,
    { align: "center", maxWidth: pageW - 16 },
  );
}

function champCartouche(doc: jsPDF, x: number, y: number, label: string, valeur: string, largeur: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.1);
  doc.setTextColor(...ARDOISE);
  doc.text(label, x, y);
  doc.setFontSize(9);
  doc.setTextColor(...ENCRE);
  doc.text(uneLigne(doc, valeur, largeur), x, y + 5);
}

function blocCartouche(doc: jsPDF, etude: EtudeTechnique, date: string, productible: string, segment: string): number {
  const utile = doc.internal.pageSize.getWidth() - MARGE * 2;
  const y = 42.2;
  const h = 33;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...FILET);
  doc.setLineWidth(0.35);
  doc.roundedRect(MARGE, y, utile, h, 1.6, 1.6, "FD");
  doc.setFillColor(...CYAN);
  doc.rect(MARGE, y + 1.5, 1.35, h - 3, "F");

  const x0 = MARGE + 6;
  const col = (utile - 14) / 3;
  [
    ["RAISON SOCIALE", "ENERGIA CONSEIL IA"],
    ["FOYER", etude.clientNom || "Client à préciser"],
    ["N° DE DEVIS", etude.devis?.numero || "-"],
  ].forEach(([label, valeur], index) => {
    const x = x0 + index * col;
    if (index > 0) {
      doc.setDrawColor(...FILET);
      doc.setLineWidth(0.2);
      doc.line(x - 3, y + 3.5, x - 3, y + 14.5);
    }
    champCartouche(doc, x, y + 6.2, label, valeur, col - 6);
  });

  doc.setDrawColor(...FILET);
  doc.setLineWidth(0.2);
  doc.line(x0, y + 17.2, MARGE + utile - 5, y + 17.2);
  const dateW = 42;
  const segmentW = 50;
  const prodX = x0 + dateW;
  const prodW = utile - 16 - dateW - segmentW;
  champCartouche(doc, x0, y + 22.2, "DATE", date, dateW - 4);
  champCartouche(doc, prodX, y + 22.2, "PRODUCTIBLE", productible, prodW - 4);
  champCartouche(doc, prodX + prodW, y + 22.2, "SEGMENT", segment, segmentW - 4);
  return y + h;
}

function blocKpi(doc: jsPDF, y: number, etude: EtudeTechnique): number {
  const utile = doc.internal.pageSize.getWidth() - MARGE * 2;
  const gap = 2.6;
  const carteW = (utile - gap * 3) / 4;
  const carteH = 24;
  const cartes = [
    ["PUISSANCE CRÊTE", `${decimalFr(etude.kwc, 2)} kWc`, `${entierEspace(etude.modulesActifs)} modules`],
    ["PRODUCTION ANNUELLE", `${entierEspace(etude.production.productionKwh)} kWh`, "par an"],
    ["ÉCONOMIE AN 1", euroEtude(etude.production.gainAnnuelEur), "gain année 1"],
    ["TEMPS DE RETOUR", retourLabel(etude.production.retourAns), "ROI · inflation 3 %"],
  ] as const;
  cartes.forEach((carte, index) => {
    carteKpi(doc, MARGE + index * (carteW + gap), y, carteW, carteH, carte[0], carte[1], carte[2]);
  });
  return y + carteH;
}

function blocPlan(doc: jsPDF, y: number, etude: EtudeTechnique): number {
  y = titreSection(doc, y, "01", "Calepinage de la toiture");
  const utile = doc.internal.pageSize.getWidth() - MARGE * 2;
  const plan = capturerPlanToiture(etude);
  const legende = latin(
    `${couvertureLibelle(etude.toiture.typeCouverture)}  ·  ${decimalFr(etude.toiture.largeurM, 1)} m x ${decimalFr(etude.toiture.rampantM, 1)} m  ·  ${etude.toiture.inclinaisonDeg}°  ·  ${libelleAzimut(etude.toiture.azimutDeg)}  ·  ${etude.panneau.nom}  ·  marge DTU 30 cm  ·  égout en bas`,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.4);
  const lignes = doc.splitTextToSize(legende, utile - 10) as string[];
  if (!plan) {
    const h = 24;
    y = assurer(doc, y, h + 4);
    doc.setFillColor(...GRIS_CARTE);
    doc.setDrawColor(...FILET);
    doc.roundedRect(MARGE, y, utile, h, 1.6, 1.6, "FD");
    doc.setTextColor(...ARDOISE);
    doc.text("Plan de toiture indisponible dans cet environnement.", MARGE + 4, y + 10);
    doc.text(lignes, MARGE + 4, y + 16);
    return y + h + 6;
  }
  const maxW = utile - 8;
  const maxH = 64;
  let largeur = maxW;
  let hauteur = largeur / plan.ratio;
  if (hauteur > maxH) {
    hauteur = maxH;
    largeur = hauteur * plan.ratio;
  }
  const carteH = 5 + hauteur + 3 + lignes.length * 3.5 + 2;
  y = assurer(doc, y, carteH);
  doc.setFillColor(...GRIS_CARTE);
  doc.setDrawColor(...FILET);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGE, y, utile, carteH, 1.6, 1.6, "FD");
  const imageX = MARGE + (utile - largeur) / 2;
  doc.addImage(plan.png, "PNG", imageX, y + 3, largeur, hauteur);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.rect(imageX, y + 3, largeur, hauteur);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.4);
  doc.setTextColor(...ARDOISE);
  doc.text(lignes, MARGE + 4, y + 6 + hauteur + 2);
  return y + carteH + 4;
}

function blocElectrique(doc: jsPDF, y: number, etude: EtudeTechnique): number {
  y = titreSection(doc, y, "02", "Synthèse électrique");
  const utile = doc.internal.pageSize.getWidth() - MARGE * 2;
  const specs = lignesSyntheseElectrique(etude);
  const valeurW = utile - 46;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const rangees = specs.map((spec) => {
    const wrapped = (doc.splitTextToSize(spec.valeur, valeurW) as string[]).slice(0, 2);
    return { ...spec, wrapped, h: Math.max(8.2, wrapped.length * 4.3 + 3.4) };
  });
  const h = 8 + rangees.reduce((total, rangee) => total + rangee.h, 0);
  y = assurer(doc, y, h + (etude.electrique.ok ? 2 : 8));
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.setLineWidth(0.35);
  doc.roundedRect(MARGE, y, utile, h, 1.6, 1.6, "FD");
  doc.setFillColor(...CYAN);
  doc.rect(MARGE, y + 1.5, 1.35, h - 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...(etude.electrique.ok ? CYAN_ENCRE : [146, 64, 14]));
  doc.text(etude.electrique.ok ? "CONFORME" : "À REVOIR", MARGE + utile - 5, y + 5.4, { align: "right" });

  let curseur = y + 8;
  rangees.forEach((rangee, index) => {
    if (index > 0) {
      doc.setDrawColor(186, 230, 253);
      doc.setLineWidth(0.15);
      doc.line(MARGE + 5, curseur, MARGE + utile - 4, curseur);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.6);
    doc.setTextColor(...ARDOISE);
    doc.text(rangee.label.toUpperCase(), MARGE + 5.5, curseur + 5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...ENCRE);
    doc.text(rangee.wrapped, MARGE + 40, curseur + 5);
    curseur += rangee.h;
  });

  if (!etude.electrique.ok && etude.electrique.alertes[0]) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.4);
    doc.setTextColor(146, 64, 14);
    doc.text(uneLigne(doc, etude.electrique.alertes[0], utile), MARGE, curseur + 4);
    return curseur + 8;
  }
  return curseur + 4;
}

function corpsDevis(etude: EtudeTechnique): CelluleTableau[][] {
  const lignes = etude.devis?.lignes ?? [];
  const corps: CelluleTableau[][] = [];
  const familles: { id: EtudeTechnique["devis"]["lignes"][number]["famille"]; titre: string }[] = [
    { id: "fourniture", titre: "FOURNITURES" },
    { id: "ingenierie", titre: "MAIN-D'OEUVRE ET INGÉNIERIE" },
  ];
  familles.forEach((famille) => {
    const groupe = lignes.filter((ligne) => ligne.famille === famille.id);
    if (groupe.length === 0) return;
    corps.push([
      {
        content: famille.titre,
        colSpan: 4,
        styles: {
          fillColor: [226, 232, 240],
          textColor: MARINE,
          fontStyle: "bold",
          fontSize: 7.4,
        },
      },
    ]);
    groupe.forEach((ligne, index) => {
      const fond = index % 2 === 1 ? [241, 245, 249] : [255, 255, 255];
      const base = { fillColor: fond, textColor: ENCRE };
      corps.push([
        { content: latin(ligne.designation), styles: base },
        { content: `${quantitePdf(ligne.quantite)} ${ligne.unite}`, styles: { ...base, halign: "right" } },
        { content: euroEtude(ligne.puHt), styles: { ...base, halign: "right" } },
        { content: euroEtude(ligne.totalHt), styles: { ...base, halign: "right", fontStyle: "bold" } },
      ]);
    });
  });
  return corps;
}

function blocFinancier(doc: jsPDF, y: number, etude: EtudeTechnique): number {
  const devis = etude.devis;
  const pageW = doc.internal.pageSize.getWidth();
  const utile = pageW - MARGE * 2;
  const recapW = 98;
  const gap = 4;
  const gaucheW = utile - recapW - gap;
  const lignes: { label: string; valeur: string; fort?: boolean; pied?: boolean }[] = [
    { label: "Fournitures HT", valeur: euroEtude(devis?.fournituresHt ?? 0) },
    { label: "Main-d'oeuvre et ingénierie HT", valeur: euroEtude(devis?.ingenierieHt ?? 0) },
    { label: "Total HT", valeur: euroEtude(devis?.totalHt ?? 0), fort: true },
    { label: `TVA ${Math.round((devis?.tauxTva ?? 0.2) * 100)} %`, valeur: euroEtude(devis?.tvaEur ?? 0) },
  ];
  const aides = devis?.aides ?? [];
  if (aides.length === 0) {
    lignes.push({ label: "Total TTC / Reste à charge", valeur: euroEtude(devis?.totalTtc ?? 0), pied: true });
  } else {
    lignes.push({ label: "Total TTC", valeur: euroEtude(devis?.totalTtc ?? 0), fort: true });
    aides.forEach((aide) => {
      lignes.push({
        label: aide.id === "advenir" ? "ADVENIR indicatif" : "Prime autoconsommation indicative",
        valeur: `- ${euroEtude(aide.montantEur)}`,
      });
    });
    lignes.push({ label: "Reste à charge TTC", valeur: euroEtude(devis?.resteAChargeTtc ?? 0), pied: true });
  }
  const corps = lignes.filter((ligne) => !ligne.pied);
  const pied = lignes.find((ligne) => ligne.pied);
  const recapH = 8 + corps.length * 6.2 + 11;
  const avis =
    "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon les revenus réels du client et l'éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE. Ne pas signer un devis définitif de rénovation globale avant l'accord écrit de l'ANAH si un parcours MaPrimeRénov' est visé. Clause Julia Protection Aides : responsabilité ENERGIA plafonnée à 2 000 EUR en cas d'écart supérieur à 10 % imputable à une erreur prouvée d'ENERGIA. Garantie décennale et responsabilité civile professionnelle, police Calipso n° LUNPIB2604975. Avis établi par Julia, juriste ENERGIA-CONSEIL IA, 2026.";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.3);
  const avisLignes = doc.splitTextToSize(latin(avis), utile - 10) as string[];
  const avisH = 12 + avisLignes.length * 3.5;
  const contacts = doc.splitTextToSize(CONTACTS.join("   |   "), utile) as string[];
  const blocH = recapH + 6 + avisH + 8 + contacts.length * 3.5;
  y = assurer(doc, y, Math.min(blocH, doc.internal.pageSize.getHeight() - PIED - Y_SUITE));

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...FILET);
  doc.setLineWidth(0.35);
  doc.roundedRect(MARGE, y, gaucheW, recapH, 1.6, 1.6, "FD");
  doc.setFillColor(...CYAN);
  doc.rect(MARGE, y + 1.4, 1.2, recapH - 2.8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...CYAN_ENCRE);
  doc.text("CADRE CONTRACTUEL", MARGE + 5, y + 6);
  const conditions = [
    "Validité du devis : 3 mois",
    "Contractant général QualiPV",
    "Garantie décennale et RC professionnelle",
    `Marque déposée INPI n° ${BRANDING.inpi}`,
    "Clause Julia : plafond 2 000 EUR",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...ENCRE);
  conditions.forEach((condition, index) => {
    doc.text(latin(condition), MARGE + 5, y + 13 + index * 5.2);
  });

  const recapX = pageW - MARGE - recapW;
  doc.setFillColor(...MARINE);
  doc.roundedRect(recapX, y, recapW, recapH, 1.6, 1.6, "F");
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(recapX + 0.4, y + 0.4, recapW - 0.8, recapH - 11, 1.4, 1.4, "F");
  doc.rect(recapX + 0.4, y + recapH - 13, recapW - 0.8, 3, "F");
  doc.setDrawColor(...FILET);
  doc.setLineWidth(0.25);
  doc.roundedRect(recapX, y, recapW, recapH, 1.6, 1.6, "S");
  corps.forEach((ligne, index) => {
    const yy = y + 6.5 + index * 6.2;
    doc.setFont("helvetica", ligne.fort ? "bold" : "normal");
    doc.setFontSize(8);
    doc.setTextColor(...ENCRE);
    doc.text(uneLigne(doc, ligne.label, recapW - 38), recapX + 3.5, yy);
    doc.text(ligne.valeur, recapX + recapW - 3.5, yy, { align: "right" });
  });
  if (pied) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    const yy = y + recapH - 4.2;
    doc.text(uneLigne(doc, pied.label, recapW - 40), recapX + 3.5, yy);
    doc.text(pied.valeur, recapX + recapW - 3.5, yy, { align: "right" });
  }

  let suite = y + recapH + 5;
  suite = assurer(doc, suite, avisH + 8 + contacts.length * 3.5);
  doc.setFillColor(255, 247, 237);
  doc.roundedRect(MARGE, suite, utile, avisH, 1.4, 1.4, "F");
  doc.setFillColor(249, 115, 22);
  doc.rect(MARGE, suite + 1.3, 1.5, avisH - 2.6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(154, 52, 18);
  doc.text("Avis juridique Julia", MARGE + 5, suite + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("2026", MARGE + utile - 4, suite + 5.5, { align: "right" });
  doc.setFontSize(7.3);
  doc.text(avisLignes, MARGE + 5, suite + 10.5);
  doc.setFontSize(8);
  doc.setTextColor(...ENCRE);
  doc.text("Bon pour accord : Fait à ______________  le ______________     Signature du client : ________________________", MARGE, suite + avisH + 6);
  doc.setFontSize(7);
  doc.setTextColor(...ARDOISE);
  doc.text(contacts, MARGE, suite + avisH + 11);
  return suite + avisH + 11 + contacts.length * 3.5;
}

function tamponnerPages(doc: jsPDF, numero: string) {
  const total = doc.getNumberOfPages();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    if (page > 1) {
      doc.setFillColor(...MARINE);
      doc.rect(0, 0, pageW, 11, "F");
      doc.setFillColor(...CYAN);
      doc.rect(0, 11, pageW, 0.6, "F");
      doc.setFont("times", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("ENERGIA CONSEIL IA", MARGE, 7.2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(uneLigne(doc, `Devis ${numero}`, 90), pageW - MARGE, 7.2, { align: "right" });
    }
    const piedY = pageH - 16;
    doc.setFillColor(...MARINE);
    doc.rect(0, piedY, pageW, 16, "F");
    doc.setFillColor(...CYAN);
    doc.rect(0, piedY, pageW, 0.7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(
      "Avis juridique Julia   ·   Validité 3 mois   ·   Garantie décennale & RC professionnelle   ·   INPI n° 5213845",
      MARGE,
      piedY + 6,
      { maxWidth: pageW - MARGE * 2 - 16 },
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.3);
    doc.setTextColor(203, 213, 225);
    doc.text(
      latin(`${BRANDING.siege}   ·   ${BRANDING.telephone}   ·   SIRET ${BRANDING.siretAffiche}   ·   Document confidentiel`),
      MARGE,
      piedY + 11,
    );
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...CYAN);
    doc.text(`${page} / ${total}`, pageW - MARGE, piedY + 8.6, { align: "right" });
  }
}

export function composerEtudePdf(etude: EtudeTechnique): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const date = dateFr(etude.genereLe);
  const dept = DEPARTEMENTS.find((item) => item.code === etude.departement);
  const productible = dept
    ? `${dept.nom} (${dept.code}) · ${entierEspace(etude.production.productibleReference)} kWh/kWc`
    : `${entierEspace(etude.production.productibleReference)} kWh/kWc`;
  const segment = `${etude.production.tertiaire ? "Tertiaire" : "Résidentiel"} · ${couvertureLibelle(etude.toiture.typeCouverture)}`;
  const numero = etude.devis?.numero || "ETUDE PV";

  peindreLettre(doc, numero, date);
  blocCartouche(doc, etude, date, productible, segment);
  let y = blocKpi(doc, 80.5, etude) + 5;
  y = blocPlan(doc, y, etude);
  y = blocElectrique(doc, y, etude);

  const reste = pageH - PIED - y;
  if (reste < 78) {
    doc.addPage();
    y = Y_SUITE;
  }
  y = titreSection(doc, y, "03", "Bordereau de prix unitaires");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGE, right: MARGE, top: Y_SUITE, bottom: PIED },
    tableWidth: pageW - MARGE * 2,
    head: [["Désignation", "Quantité", "PU HT", "Total HT"]],
    body: corpsDevis(etude),
    theme: "plain",
    showHead: "everyPage",
    styles: {
      font: "helvetica",
      fontSize: 8,
      textColor: ENCRE,
      cellPadding: { top: 2.3, right: 2.2, bottom: 2.3, left: 2.4 },
      lineColor: [226, 232, 240],
      lineWidth: 0.12,
      valign: "middle",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: MARINE,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "right", cellWidth: 28 },
      2: { halign: "right", cellWidth: 30 },
      3: { halign: "right", cellWidth: 30 },
    },
  });
  y = ((doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 6;
  blocFinancier(doc, y, etude);
  tamponnerPages(doc, numero);
  return doc;
}

export function telechargerEtudePdf(etude: EtudeTechnique) {
  composerEtudePdf(etude).save(`etude-calepinage-${slug(etude.clientNom)}.pdf`);
}
