import { jsPDF } from "jspdf";
import { COEFFICIENTS_G } from "../hvac/calcul";
import { pacPdfBase64 } from "../hvac/exportPdf";
import type { EtatPac, EtudePac } from "../hvac/types";
import { FICHES_RADAR_CEE } from "../../lib/crm/ceeRadarTravaux";
import { creerNoteOpportuniteCee } from "../../lib/crm/noteOpportuniteCeePdf";
import type { DossierMessagerie } from "./types";

export const MAX_PIECES_EMAIL = 25;
export const MAX_OCTETS_FICHIER = 4_000_000;

export type PackId = "devis" | "dpe" | "aides" | "rapport" | "cee";

export const PACK_OPTIONS: { id: PackId; libelle: string; testid: string }[] = [
  { id: "devis", libelle: "Devis officiel A4 Contractant Général (PDF)", testid: "joindre-devis" },
  { id: "dpe", libelle: "Fiche DPE Avant/Après & Synthèse thermique (PDF)", testid: "joindre-dpe" },
  { id: "aides", libelle: "Simulation financière des Aides 2026 (MaPrimeRénov' & CEE)", testid: "joindre-aides" },
  { id: "rapport", libelle: "Rapport technique de dimensionnement PAC / Photovoltaïque", testid: "joindre-rapport" },
  { id: "cee", libelle: "Fiche technique CEE normalisée avec Schéma 3D (B2B / Industrie)", testid: "joindre-cee" },
];

const PACK_VIDE: Record<PackId, boolean> = {
  devis: false,
  dpe: false,
  aides: false,
  rapport: false,
  cee: false,
};

export function packVide(): Record<PackId, boolean> {
  return { ...PACK_VIDE };
}

export function packPourModele(joindreLesDeux: boolean): Record<PackId, boolean> {
  return { ...PACK_VIDE, devis: joindreLesDeux, rapport: joindreLesDeux };
}

type PiecePdf = { filename: string; content: string };

const MARINE: [number, number, number] = [8, 18, 40];
const ENCRE: [number, number, number] = [15, 23, 42];
const ARDOISE: [number, number, number] = [71, 85, 105];
const LETTRES = ["A", "B", "C", "D", "E", "F", "G"] as const;
const COULEURS: Record<(typeof LETTRES)[number], [number, number, number]> = {
  A: [49, 152, 52],
  B: [82, 177, 83],
  C: [195, 210, 0],
  D: [247, 236, 0],
  E: [240, 181, 15],
  F: [235, 130, 53],
  G: [227, 29, 35],
};

function latin(texte: string): string {
  return texte
    .replace(/[—–−]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/\u00a0|\u202f/g, " ")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/€/g, "EUR")
    .replace(/²/g, "2");
}

function euro(montant: number): string {
  const arrondi = Math.round(montant);
  const signe = arrondi < 0 ? "-" : "";
  const corps = String(Math.abs(arrondi)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${signe}${corps} EUR`;
}

function base64Doc(doc: { output(type: "datauristring"): string }): string {
  const brut = doc.output("datauristring");
  const coupe = brut.indexOf(",");
  return coupe >= 0 ? brut.slice(coupe + 1) : brut;
}

function classeDepuisKwh(kwh: number): (typeof LETTRES)[number] {
  if (kwh <= 70) return "A";
  if (kwh <= 110) return "B";
  if (kwh <= 180) return "C";
  if (kwh <= 250) return "D";
  if (kwh <= 330) return "E";
  if (kwh <= 420) return "F";
  return "G";
}

function entete(doc: jsPDF, titre: string, sousTitre: string) {
  doc.setFillColor(...MARINE);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(232, 255, 246);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ENERGIA CONSEIL IA", 14, 10);
  doc.setFontSize(13);
  doc.text(latin(titre), 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(latin(sousTitre), 14, 24);
}

function etiquettes(doc: jsPDF, x: number, y: number, active: (typeof LETTRES)[number]) {
  LETTRES.forEach((lettre, index) => {
    const largeur = 18 + index * 6;
    const yy = y + index * 8;
    doc.setFillColor(...(lettre === active ? COULEURS[lettre] : [226, 232, 240]));
    doc.roundedRect(x, yy, largeur, 6.5, 0.6, 0.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...(lettre === active ? [255, 255, 255] : [100, 116, 139]));
    doc.text(lettre, x + 2.2, yy + 4.6);
  });
}

function ficheDpe(dossier: DossierMessagerie, etat: EtatPac, etude: EtudePac): PiecePdf {
  const surface = Math.max(etat.surfaceM2, 1);
  const g = COEFFICIENTS_G[etat.isolation].g;
  const gCible = Math.min(g, COEFFICIENTS_G.re2020.g);
  const kwhAvant = etude.besoinKwh / surface;
  const kwhApresUtile = (etude.besoinKwh * (gCible / g)) / surface;
  const kwhApresEp = (kwhApresUtile / 4) * 2.3;
  const avant = classeDepuisKwh(kwhAvant);
  const apres = classeDepuisKwh(kwhApresEp);
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  entete(doc, "Fiche DPE Avant / Apres", `${dossier.libelle} - ${dossier.ville}`);
  doc.setTextColor(...ENCRE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Avant travaux", 14, 42);
  doc.text("Apres enveloppe cible + PAC", 118, 42);
  etiquettes(doc, 14, 48, avant);
  etiquettes(doc, 118, 48, apres);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...ARDOISE);
  const lignes = [
    `Surface etudiee : ${surface} m2. Isolation actuelle : ${COEFFICIENTS_G[etat.isolation].libelle}.`,
    `Besoin chauffage utile actuel : ${Math.round(kwhAvant)} kWh/m2/an. Classe repere : ${avant}.`,
    `Apres isolation cible (G ${gCible}) et PAC COP 4 : ${Math.round(kwhApresEp)} kWhEP/m2/an. Classe repere : ${apres}.`,
    `Puissance PAC retenue : ${etude.puissancePacKw} kW. Departement ${etat.departement}, zone ${etude.zone}.`,
    "Ce repere est calcule a partir de l'etude thermique du dossier. Il ne remplace pas un DPE reglementaire 3CL.",
  ];
  let y = 118;
  lignes.forEach((ligne) => {
    const morceaux = doc.splitTextToSize(latin(ligne), 182) as string[];
    doc.text(morceaux, 14, y);
    y += morceaux.length * 5 + 2;
  });
  doc.setFontSize(8);
  doc.text("ENERGIA CONSEIL IA - Bureau d'etudes & AMO - 16 rue Cuvier, 69006 Lyon", 14, 280);
  return { filename: "Fiche-DPE-avant-apres.pdf", content: base64Doc(doc) };
}

function simulationAides(dossier: DossierMessagerie, etude: EtudePac): PiecePdf {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  entete(doc, "Simulation aides 2026", `${dossier.libelle} - estimation a titre indicatif`);
  doc.setTextColor(...ENCRE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(latin(`Travaux TTC etude PAC : ${euro(etude.devis.totalTtc)}`), 14, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  let y = 52;
  etude.devis.aides.forEach((aide) => {
    const statut = aide.eligible ? euro(aide.montantEur) : "non retenue";
    doc.text(latin(`${aide.libelle} : ${statut}`), 14, y);
    y += 6;
  });
  doc.setFont("helvetica", "bold");
  doc.text(latin(`Total CEE retenu sur l'etude : ${euro(etude.devis.totalAidesEur)}`), 14, y + 2);
  doc.text(latin(`Reste a charge apres CEE : ${euro(etude.devis.resteAChargeTtc)}`), 14, y + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...ARDOISE);
  const bareme = [
    "MaPrimeReno' Parcours 2026 hors IDF (1 a 3 parts), plafonds 30 000 EUR HT (2 classes) ou 40 000 EUR HT (3 classes et plus) :",
    "Bleu 80 % (max 24 000 / 32 000 EUR) - Jaune 60 % (max 18 000 / 24 000 EUR).",
    "Violet 45 % (max 13 500 / 18 000 EUR) - Rose 10 % (max 3 000 / 4 000 EUR).",
    "Le profil couleur n'est pas attribue ici : il depend du revenu fiscal de reference reel.",
    "Aides financieres 2026 (estimation a titre indicatif).",
    "Aides a valider selon revenus reels du client et eligibilite en vigueur.",
    "Montants definitifs apres instruction ANAH et CEE. Cumul des aides plafonne a 100 % des travaux.",
  ];
  let yAides = y + 20;
  bareme.forEach((ligne) => {
    const morceaux = doc.splitTextToSize(latin(ligne), 182) as string[];
    doc.text(morceaux, 14, yAides);
    yAides += morceaux.length * 4.5 + 1.5;
  });
  return { filename: "Simulation-aides-2026.pdf", content: base64Doc(doc) };
}

function ficheCee(dossier: DossierMessagerie, etat: EtatPac): PiecePdf {
  const code = etat.typeBatiment === "tertiaire" ? "BAT-TH-116" : etat.typeBatiment === "collectif" ? "BAT-TH-140" : "BAR-TH-104";
  const fiche = FICHES_RADAR_CEE.find((item) => item.code === code) ?? FICHES_RADAR_CEE.find((item) => item.code === "IND-UT-117");
  if (!fiche) throw new Error("Fiche CEE introuvable.");
  const doc = creerNoteOpportuniteCee({
    fiche,
    site: `${dossier.libelle} - ${dossier.ville || "site a preciser"}`,
  });
  const nom = fiche.code.replace(/[^A-Za-z0-9-]+/g, "");
  return { filename: `Fiche-CEE-${nom}.pdf`, content: base64Doc(doc) };
}

export function piecePack(
  id: PackId,
  dossier: DossierMessagerie,
  etat: EtatPac,
  etude: EtudePac,
): PiecePdf {
  if (id === "devis") {
    return {
      filename: "Devis-officiel-A4.pdf",
      content: pacPdfBase64(etude, dossier.libelle, etat.tint, "devis"),
    };
  }
  if (id === "rapport") {
    return {
      filename: "Rapport-dimensionnement-PAC.pdf",
      content: pacPdfBase64(etude, dossier.libelle, etat.tint, "rapport"),
    };
  }
  if (id === "dpe") return ficheDpe(dossier, etat, etude);
  if (id === "aides") return simulationAides(dossier, etude);
  return ficheCee(dossier, etat);
}
