import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";
import { BRANDING } from "../../lib/branding";
import { ALPHA_PAC } from "./calcul";
import type { EtudePac } from "./types";

const MARINE: [number, number, number] = [8, 18, 40];
const MARINE_BANDE: [number, number, number] = [5, 12, 28];
const CYAN: [number, number, number] = [34, 211, 238];
const CYAN_ENCRE: [number, number, number] = [14, 116, 144];
const ENCRE: [number, number, number] = [15, 23, 42];
const ARDOISE: [number, number, number] = [71, 85, 105];
const GRIS: [number, number, number] = [241, 245, 249];
const FILET: [number, number, number] = [203, 213, 225];
const MARGE = 14;
const PIED = 16;

const CONTACTS =
  "Sylvain LEMBELEMBE (AMO) 06 10 59 68 98 | DAMIEN 06 72 68 09 68 | FABIEN - VIVONS COURTIER 06 71 19 96 45 | Julia (Juriste) | MAR Antoine BARATIER - Cabinet C2ET";

function latin(texte: string): string {
  return texte
    .replace(/[—–−]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/\u00a0|\u202f/g, " ")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/€/g, "EUR")
    .replace(/×/g, "x")
    .replace(/Δ/g, "Delta ");
}

function euro(montant: number): string {
  const arrondi = Math.round(montant);
  const signe = arrondi < 0 ? "-" : "";
  const corps = String(Math.abs(arrondi)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${signe}${corps} EUR`;
}

function entier(montant: number): string {
  return String(Math.round(montant)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function decimal(valeur: number, digits = 1): string {
  const [corps, dec] = Math.abs(valeur).toFixed(digits).split(".");
  const signe = valeur < 0 ? "-" : "";
  const entierFormate = corps.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return dec ? `${signe}${entierFormate},${dec}` : `${signe}${entierFormate}`;
}

function dateFr(date = new Date()): string {
  const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  return `${date.getDate()} ${mois[date.getMonth()]} ${date.getFullYear()}`;
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

function carte(doc: jsPDF, x: number, y: number, w: number, h: number, label: string, valeur: string, detail: string) {
  doc.setFillColor(...GRIS);
  doc.setDrawColor(...FILET);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, w, h, 1.6, 1.6, "FD");
  doc.setFillColor(...CYAN);
  doc.rect(x + 1.6, y + 0.4, w - 3.2, 1.1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(...ARDOISE);
  doc.text(latin(label), x + 3, y + 6.2);
  doc.setFontSize(11);
  doc.setTextColor(...ENCRE);
  doc.text(latin(valeur), x + 3, y + 13.2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.3);
  doc.setTextColor(...ARDOISE);
  doc.text(latin(detail), x + 3, y + 18.2, { maxWidth: w - 6 });
}

function dessinerBivalence(doc: jsPDF, x: number, y: number, w: number, h: number, etude: EtudePac, tint: number) {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...FILET);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 1.6, 1.6, "FD");
  const plotX = x + 8;
  const plotY = y + 7;
  const plotW = w - 16;
  const plotH = h - 16;
  const tMin = etude.textBase - 2;
  const tMax = Math.max(tint, tMin + 1);
  const pMax = Math.max(etude.pDepKw, etude.puissancePacKw, 1) * 1.2;
  const xOf = (t: number) => plotX + ((t - tMin) / (tMax - tMin)) * plotW;
  const yOf = (p: number) => plotY + plotH - (Math.max(0, p) / pMax) * plotH;
  const tbiv = etude.tbiv ?? etude.textBase;
  const xSplit = Math.min(plotX + plotW, Math.max(plotX, xOf(tbiv)));

  doc.setFillColor(255, 247, 237);
  doc.rect(plotX, plotY, Math.max(0.4, xSplit - plotX), plotH, "F");
  doc.setFillColor(240, 249, 255);
  doc.rect(xSplit, plotY, plotX + plotW - xSplit, plotH, "F");

  const pas = 20;
  let precedentBat: [number, number] | null = null;
  let precedentPac: [number, number] | null = null;
  for (let i = 0; i <= pas; i += 1) {
    const t = tMin + ((tMax - tMin) * i) / pas;
    const pBat = etude.deltaK > 0 ? (etude.pDepKw * (tint - t)) / etude.deltaK : 0;
    const pPac = etude.puissancePacKw * (1 + ALPHA_PAC * (t - etude.textBase));
    const bat: [number, number] = [xOf(t), yOf(pBat)];
    const pac: [number, number] = [xOf(t), yOf(Math.min(pMax, Math.max(0, pPac)))];
    if (precedentBat) {
      doc.setDrawColor(...ENCRE);
      doc.setLineWidth(0.55);
      doc.line(precedentBat[0], precedentBat[1], bat[0], bat[1]);
    }
    if (precedentPac) {
      doc.setDrawColor(...CYAN_ENCRE);
      doc.setLineWidth(0.8);
      doc.line(precedentPac[0], precedentPac[1], pac[0], pac[1]);
    }
    precedentBat = bat;
    precedentPac = pac;
  }

  doc.setDrawColor(217, 119, 6);
  doc.setLineDashPattern([1.1, 0.9], 0);
  doc.setLineWidth(0.45);
  doc.line(xSplit, plotY, xSplit, plotY + plotH);
  doc.setLineDashPattern([], 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(146, 64, 14);
  doc.text(latin(`Tbiv ${decimal(tbiv)} °C`), xSplit + 1.4, plotY + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(...ARDOISE);
  doc.text(latin(`Text ${etude.textBase} °C`), plotX, y + h - 2.4);
  doc.text("Déperditions", plotX + plotW * 0.28, y + h - 2.4);
  doc.setTextColor(...CYAN_ENCRE);
  doc.text("Puissance PAC", plotX + plotW * 0.52, y + h - 2.4);
  doc.setTextColor(146, 64, 14);
  doc.text(latin(`Tint ${tint} °C`), plotX + plotW - 2, y + h - 2.4, { align: "right" });
}

function enTete(doc: jsPDF, numero: string, date: string, suite: boolean) {
  const pageW = doc.internal.pageSize.getWidth();
  if (!suite) {
    doc.setFillColor(...MARINE);
    doc.rect(0, 0, pageW, 29, "F");
    doc.setFillColor(...MARINE_BANDE);
    doc.rect(0, 29, pageW, 8, "F");
    doc.setFillColor(...CYAN);
    doc.rect(0, 37, pageW, 1.15, "F");
    doc.setFont("times", "bold");
    doc.setFontSize(17);
    doc.setTextColor(255, 255, 255);
    doc.text("ENERGIA CONSEIL IA", MARGE, 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...CYAN);
    doc.text("Bureau d'Études Thermiques & Solaire", MARGE, 19);
    doc.setFontSize(7.4);
    doc.setTextColor(203, 213, 225);
    doc.text("Contractant général  ·  QualiPAC  ·  Chaufferies hybrides", MARGE, 25);
    const badgeW = 62;
    const badgeX = pageW - MARGE - badgeW;
    doc.setFillColor(10, 28, 58);
    doc.setDrawColor(...CYAN);
    doc.setLineWidth(0.35);
    doc.roundedRect(badgeX, 6.5, badgeW, 19, 1.4, 1.4, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.4);
    doc.setTextColor(...CYAN);
    doc.text("DEVIS D'INGÉNIERIE", badgeX + badgeW / 2, 11.5, { align: "center" });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.4);
    doc.text(latin(numero), badgeX + badgeW / 2, 16.4, { align: "center", maxWidth: badgeW - 6 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(203, 213, 225);
    doc.text(date, badgeX + badgeW / 2, 21.2, { align: "center" });
    doc.setFontSize(7.2);
    doc.setTextColor(226, 232, 240);
    doc.text(latin(`${BRANDING.siege}   ·   ${BRANDING.telephone}   ·   ${BRANDING.email}`), pageW / 2, 34, { align: "center" });
    return 42;
  }
  doc.setFillColor(...MARINE);
  doc.rect(0, 0, pageW, 11, "F");
  doc.setFillColor(...CYAN);
  doc.rect(0, 11, pageW, 0.55, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("ENERGIA CONSEIL IA", MARGE, 7.2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(latin(`Devis ${numero}`), pageW - MARGE, 7.2, { align: "right" });
  return 18;
}

function pied(doc: jsPDF) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    const y = pageH - PIED;
    doc.setFillColor(...MARINE);
    doc.rect(0, y, pageW, PIED, "F");
    doc.setFillColor(...CYAN);
    doc.rect(0, y, pageW, 0.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.4);
    doc.setTextColor(255, 255, 255);
    doc.text("Avis juridique Julia  ·  Validité 3 mois  ·  Garantie décennale & RC professionnelle  ·  INPI n° 5213845", MARGE, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.setTextColor(203, 213, 225);
    doc.text(latin(`${BRANDING.siege}  ·  ${BRANDING.telephone}  ·  SIRET ${BRANDING.siretAffiche}  ·  Document confidentiel`), MARGE, y + 11);
    doc.setTextColor(...CYAN);
    doc.setFont("helvetica", "bold");
    doc.text(`${page} / ${total}`, pageW - MARGE, y + 8.5, { align: "right" });
  }
}

export function composerPacPdf(etude: EtudePac, clientNom: string, tint: number): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const utile = pageW - MARGE * 2;
  const date = dateFr();
  const numero = etude.devis.numero;
  const devis = etude.devis;
  enTete(doc, numero, date, false);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...FILET);
  doc.roundedRect(MARGE, 42, utile, 28, 1.5, 1.5, "FD");
  doc.setFillColor(...CYAN);
  doc.rect(MARGE, 43.2, 1.2, 25.6, "F");
  const champs: [string, string, number][] = [
    ["RAISON SOCIALE", "ENERGIA CONSEIL IA", MARGE + 5],
    ["FOYER", clientNom || "Client à préciser", MARGE + 68],
    ["N° DE DEVIS", numero, MARGE + 128],
  ];
  champs.forEach(([label, valeur, x]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(...ARDOISE);
    doc.text(label, x, 48);
    doc.setFontSize(8.5);
    doc.setTextColor(...ENCRE);
    doc.text(latin(valeur), x, 53, { maxWidth: 58 });
  });
  doc.setDrawColor(...FILET);
  doc.line(MARGE + 5, 57.5, MARGE + utile - 4, 57.5);
  doc.setFontSize(6);
  doc.setTextColor(...ARDOISE);
  doc.text("CLIMAT", MARGE + 5, 62);
  doc.setFontSize(8);
  doc.setTextColor(...ENCRE);
  doc.text(latin(`${etude.departementNom}  ·  Text base ${etude.textBase} °C  ·  zone CEE ${etude.zone}  ·  ${date}`), MARGE + 5, 66.5);

  const gap = 2.6;
  const carteW = (utile - gap * 3) / 4;
  const yKpi = 74;
  const retour = devis.retourAns === null ? "> 25 ans" : `${decimal(devis.retourAns, 1)} ans`;
  carte(doc, MARGE, yKpi, carteW, 22, "PUISSANCE THERMIQUE", `${decimal(etude.pDepKw, 1)} kW`, `PAC ${decimal(etude.puissancePacKw, 1)} kW`);
  carte(doc, MARGE + (carteW + gap), yKpi, carteW, 22, "COUVERTURE ENR", `${Math.round(etude.couvertureAnnuelle * 100)} %`, "des kWh annuels");
  carte(doc, MARGE + (carteW + gap) * 2, yKpi, carteW, 22, "ÉCONOMIES ANNUELLES", euro(etude.economieAnnuelleEur), "avant aides du devis");
  carte(doc, MARGE + (carteW + gap) * 3, yKpi, carteW, 22, "TEMPS DE RETOUR", retour, "reste à charge / économies");

  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...ENCRE);
  doc.text("Schéma de bivalence", MARGE, 104);
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.7);
  doc.line(MARGE, 106, MARGE + 42, 106);
  dessinerBivalence(doc, MARGE, 109, utile, 58, etude, tint);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...ARDOISE);
  const legendeBiv =
    etude.puissanceChaudiereKw > 0
      ? `PAC à 60 % de P_dep. Chaudière conservée en secours 100 % (${decimal(etude.puissanceChaudiereKw, 1)} kW) sous Tbiv. Couverture annuelle ${Math.round(etude.couvertureAnnuelle * 100)} %.`
      : `Couverture à Text base ${Math.round(Math.min(1, etude.ratioCouvertureBase) * 100)} %. Hypothèse +3 % de puissance PAC par degré.`;
  doc.text(latin(legendeBiv), MARGE, 171, { maxWidth: utile });

  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...ENCRE);
  doc.text("Synthèse hydraulique", MARGE, 180);
  doc.setDrawColor(...CYAN);
  doc.line(MARGE, 182, MARGE + 42, 182);
  const hydro = [
    ["Débit primaire PAC", `${decimal(etude.debitPacM3h, 2)} m3/h`, "Delta T 5 K"],
    ["Débit équivalent chaudière", `${decimal(etude.debitChaudiereM3h, 2)} m3/h`, "Delta T 15 K, environ 3 fois plus faible"],
    ["Ballon tampon", `${entier(etude.volumeTamponStandardL)} L`, `minimum ${entier(etude.volumeTamponL)} L, soit 20 L/kW`],
    ["Découplage", `DN ${etude.bouteille.dn}`, latin(`${etude.bouteille.preconisation}. Vitesse ${decimal(etude.bouteille.vitesseMs, 2)} m/s`)],
  ];
  hydro.forEach((ligneHydro, index) => {
    const y = 186 + index * 11;
    doc.setFillColor(...GRIS);
    doc.setDrawColor(...FILET);
    doc.roundedRect(MARGE, y, utile, 9.5, 1.2, 1.2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...ARDOISE);
    doc.text(ligneHydro[0].toUpperCase(), MARGE + 3, y + 4);
    doc.setFontSize(9);
    doc.setTextColor(...ENCRE);
    doc.text(ligneHydro[1], MARGE + 62, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...ARDOISE);
    doc.text(ligneHydro[2], MARGE + 98, y + 4, { maxWidth: utile - 102 });
  });

  doc.addPage();
  enTete(doc, numero, date, true);
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...ENCRE);
  doc.text("Bordereau de prix unitaires", MARGE, 24);
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.7);
  doc.line(MARGE, 26, MARGE + 46, 26);

  const fournitures = devis.lignes.filter((ligneDevis) => ligneDevis.famille === "fourniture");
  const ingenierie = devis.lignes.filter((ligneDevis) => ligneDevis.famille === "ingenierie");
  const corps: { content: string; colSpan?: number; styles?: Record<string, unknown> }[][] = [];
  const section = (titre: string) => [
    { content: titre, colSpan: 4, styles: { fillColor: [226, 232, 240], textColor: MARINE, fontStyle: "bold", fontSize: 7.2 } },
  ];
  const ajouter = (items: typeof fournitures) => {
    items.forEach((item, index) => {
      const fond = index % 2 === 1 ? [241, 245, 249] : [255, 255, 255];
      const base = { fillColor: fond, textColor: ENCRE };
      corps.push([
        { content: latin(item.designation), styles: base },
        { content: `${entier(item.quantite) === String(item.quantite) ? entier(item.quantite) : decimal(item.quantite, 1)} ${item.unite}`, styles: { ...base, halign: "right" } },
        { content: euro(item.puHt), styles: { ...base, halign: "right" } },
        { content: euro(item.totalHt), styles: { ...base, halign: "right", fontStyle: "bold" } },
      ]);
    });
  };
  if (fournitures.length) {
    corps.push(section("FOURNITURES"));
    ajouter(fournitures);
  }
  if (ingenierie.length) {
    corps.push(section("MAIN-D'OEUVRE ET INGENIERIE"));
    ajouter(ingenierie);
  }

  autoTable(doc, {
    startY: 30,
    margin: { left: MARGE, right: MARGE, bottom: 80 },
    tableWidth: utile,
    head: [["Désignation", "Quantité", "PU HT", "Total HT"]],
    body: corps,
    theme: "plain",
    showHead: "firstPage",
    pageBreak: "avoid",
    styles: { font: "helvetica", fontSize: 7.6, cellPadding: 1.8, textColor: ENCRE, valign: "middle" },
    headStyles: { fillColor: MARINE, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.6 },
    columnStyles: { 0: { cellWidth: "auto" }, 1: { halign: "right", cellWidth: 28 }, 2: { halign: "right", cellWidth: 28 }, 3: { halign: "right", cellWidth: 30 } },
  });

  let y = ((doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 100) + 5;
  const recapW = 96;
  const gaucheW = utile - recapW - 4;
  const lignesRecap: { label: string; valeur: string; pied?: boolean }[] = [
    { label: "Fournitures HT", valeur: euro(devis.fournituresHt) },
    { label: "Pose et ingénierie HT", valeur: euro(devis.ingenierieHt) },
    { label: "Total HT", valeur: euro(devis.totalHt) },
    { label: `TVA ${decimal(devis.tauxTva * 100, devis.tauxTva < 0.1 ? 1 : 0)} %`, valeur: euro(devis.tvaEur) },
    { label: "Total TTC", valeur: euro(devis.totalTtc) },
  ];
  devis.aides.filter((aide) => aide.eligible && aide.montantEur > 0).forEach((aide) => {
    lignesRecap.push({ label: aide.id.toUpperCase(), valeur: `- ${euro(aide.montantEur)}` });
  });
  lignesRecap.push({ label: "Reste à charge TTC", valeur: euro(devis.resteAChargeTtc), pied: true });
  const corpsRecap = lignesRecap.filter((item) => !item.pied);
  const recapH = 7 + corpsRecap.length * 5.4 + 9;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...FILET);
  doc.roundedRect(MARGE, y, gaucheW, recapH, 1.4, 1.4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...CYAN_ENCRE);
  doc.text("CADRE CONTRACTUEL", MARGE + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(...ENCRE);
  ["Validité 3 mois", "QualiPAC · Contractant général", "Garantie décennale et RC professionnelle", `INPI n° ${BRANDING.inpi}`, "Aides CEE indicatives, non instruites"].forEach((condition, index) => {
    doc.text(latin(condition), MARGE + 3, y + 11 + index * 4.6);
  });

  const recapX = pageW - MARGE - recapW;
  doc.setFillColor(...MARINE);
  doc.roundedRect(recapX, y, recapW, recapH, 1.4, 1.4, "F");
  doc.setFillColor(255, 255, 255);
  doc.rect(recapX + 0.4, y + 0.4, recapW - 0.8, recapH - 9.2, "F");
  corpsRecap.forEach((item, index) => {
    const yy = y + 5.2 + index * 5.4;
    doc.setFont("helvetica", item.label.startsWith("Total") ? "bold" : "normal");
    doc.setFontSize(7.4);
    doc.setTextColor(...ENCRE);
    doc.text(latin(item.label), recapX + 3, yy);
    doc.text(item.valeur, recapX + recapW - 3, yy, { align: "right" });
  });
  const piedRecap = lignesRecap.find((item) => item.pied);
  if (piedRecap) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.6);
    doc.setTextColor(255, 255, 255);
    doc.text(latin(piedRecap.label), recapX + 3, y + recapH - 3.4);
    doc.text(piedRecap.valeur, recapX + recapW - 3, y + recapH - 3.4, { align: "right" });
  }

  y += recapH + 4;
  const rac = devis.resteAChargeTtc;
  const acompte = Math.round(rac * 30) / 100;
  const demarrage = Math.round(rac * 40) / 100;
  const solde = Math.round((rac - acompte - demarrage) * 100) / 100;
  const centimes = (montant: number) => {
    const cents = Math.round(montant * 100);
    const entierPart = Math.trunc(Math.abs(cents) / 100);
    const dec = String(Math.abs(cents) % 100).padStart(2, "0");
    return `${String(entierPart).replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${dec} EUR`;
  };
  const echeances: [string, string][] = [
    ["Acompte 30 % a la signature", centimes(acompte)],
    ["40 % au demarrage des travaux", centimes(demarrage)],
    ["Solde 30 % a la reception sans reserve", centimes(solde)],
  ];
  const blocH = 36;
  const gauche = utile * 0.58;
  doc.setDrawColor(...FILET);
  doc.roundedRect(MARGE, y, gauche - 3, blocH, 1.2, 1.2, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...CYAN_ENCRE);
  doc.text("ECHEANCIER DU RESTE A CHARGE", MARGE + 3, y + 5);
  echeances.forEach((ligneEcheance, index) => {
    const yy = y + 11 + index * 6.2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...ENCRE);
    doc.text(ligneEcheance[0], MARGE + 3, yy);
    doc.text(ligneEcheance[1], MARGE + gauche - 6, yy, { align: "right" });
  });
  doc.setFontSize(6);
  doc.setTextColor(...ARDOISE);
  doc.text("40 % et solde apres validation de Sylvain LEMBELEMBE.", MARGE + 3, y + blocH - 2.5);

  const signX = MARGE + gauche;
  const signW = utile - gauche;
  doc.setLineDashPattern([1.1, 1.1], 0);
  doc.setDrawColor(...ENCRE);
  doc.roundedRect(signX, y, signW, blocH, 1.2, 1.2, "S");
  doc.setLineDashPattern([], 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.4);
  doc.setTextColor(...ENCRE);
  doc.text("CADRE RESERVE AU CLIENT", signX + 2.5, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(doc.splitTextToSize("Mention manuscrite : Bon pour accord et marche de travaux accepte. Date et signature.", signW - 5) as string[], signX + 2.5, y + 10);
  doc.text("Date : ________    Signature :", signX + 2.5, y + blocH - 5);

  y += blocH + 4;
  doc.setFontSize(6.5);
  doc.setTextColor(...ENCRE);
  doc.text("Garantie Decennale Calypso Assurances n° LUNPIB2604975 - ENERGIA CONSEIL IA.", MARGE, y);
  y += 3.6;
  doc.setFontSize(6.3);
  doc.setTextColor(...ARDOISE);
  doc.text("Aides financieres 2026, estimation a titre indicatif. Montants definitifs apres instruction ANAH et CEE. Avis Julia, 2026.", MARGE, y);
  y += 3.6;
  doc.text(doc.splitTextToSize(CONTACTS, utile) as string[], MARGE, y);

  pied(doc);
  return doc;
}

export function telechargerPacPdf(
  etude: EtudePac,
  clientNom: string,
  tint: number,
  partie: "rapport" | "devis" | "complet" = "complet",
) {
  const doc = composerPacPdf(etude, clientNom, tint);
  if (partie === "rapport" && doc.getNumberOfPages() > 1) doc.deletePage(2);
  if (partie === "devis" && doc.getNumberOfPages() > 1) doc.deletePage(1);
  const prefixe = partie === "rapport" ? "rapport-technique" : partie === "devis" ? "devis-chiffre" : "etude-et-devis";
  doc.save(`${prefixe}-${slug(clientNom)}.pdf`);
}

/** PDF texte, page 1 = rapport d'ingénierie, page 2 = devis. */
export function pacPdfBase64(etude: EtudePac, clientNom: string, tint: number, partie: "rapport" | "devis"): string {
  const doc = composerPacPdf(etude, clientNom, tint);
  if (partie === "rapport" && doc.getNumberOfPages() > 1) doc.deletePage(2);
  if (partie === "devis" && doc.getNumberOfPages() > 1) doc.deletePage(1);
  const brut = doc.output("datauristring");
  const coupe = brut.indexOf(",");
  return coupe >= 0 ? brut.slice(coupe + 1) : brut;
}
