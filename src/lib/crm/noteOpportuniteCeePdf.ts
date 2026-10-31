import jsPDFModule from "jspdf";
import type { jsPDF as JsPdfDocument } from "jspdf";
import { BRANDING, fitLogo, hexToRgb } from "../branding";

/** Emblème officiel (arbres) — public/logo-energia.png, fond blanc adapté à l'en-tête. */
const LOGO_NOTE_PATH = "/logo-energia.png";

type JsPdfCtor = new (options?: { unit?: string; format?: string; compress?: boolean }) => JsPdfDocument;

function jsPdfConstructor(mod: unknown): JsPdfCtor {
  if (typeof mod === "function") return mod as JsPdfCtor;
  if (mod && typeof mod === "object") {
    const record = mod as { jsPDF?: unknown; default?: unknown };
    if (typeof record.jsPDF === "function") return record.jsPDF as JsPdfCtor;
    if (record.default && record.default !== mod) return jsPdfConstructor(record.default);
  }
  throw new Error("jsPDF introuvable");
}

const JsPDF = jsPdfConstructor(jsPDFModule);
import { accrocheHero, dossierIngenierieCee } from "./dossiersIngenierieCee";
import { ficheStrategiqueParCode, type FicheStrategiqueCee } from "./fichesStrategiquesCee";
import { euroHt, ratioStrategiqueParCode } from "./ratiosDirection";
import {
  COURS_EMMY_CLASSIQUE_EUR,
  COURS_EMMY_PRECARITE_EUR,
  estimationCentraleEur,
  LIBELLE_ACTIF_CEE,
  mwhCumacDepuisEuros,
  type CeeFicheTravaux,
} from "./ceeRadarTravaux";

const PAGE_W = 210;
const PAGE_H = 297;
const M = 10;
const INNER = PAGE_W - M * 2;
const GAP = 4;

export type LogoNote = { dataUrl: string; width: number; height: number };

const NAVY = hexToRgb("#0F172A");
const GREEN = hexToRgb("#16A34A");
const GREEN_SOFT = hexToRgb("#F0FDF4");
const BODY = hexToRgb("#334155");
const MUTED = hexToRgb("#64748B");
const LINE = hexToRgb("#E2E8F0");
const WHITE: [number, number, number] = [255, 255, 255];

export const MENTION_AIDES_NOTE =
  "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.";

export type NoteOpportuniteCee = {
  titre: string;
  date: string;
  site: string;
  actif: string;
  montant: string;
  basse: string;
  haute: string;
  volume: string;
  volumeDetail: string;
  cours: string;
  accroche: string;
  typeSite: string;
  decideur: string;
  enjeu: string;
  schemaTitre: string;
  schemaEtapes: string[];
};

type OptionsNote = {
  fiche: CeeFicheTravaux;
  site: string;
  date?: Date;
  logo?: LogoNote | null;
  schema?: LogoNote | null;
};

function espaceFin(valeur: string) {
  return valeur.replace(/\u202f/g, " ").replace(/\u00a0/g, " ");
}

function euro(montant: number) {
  return espaceFin(
    montant.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }),
  );
}

function euroCours(montant: number) {
  return espaceFin(
    montant.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );
}

function mwh(valeur: number) {
  return espaceFin(valeur.toLocaleString("fr-FR"));
}

export function composerNoteOpportuniteCee(options: OptionsNote): NoteOpportuniteCee {
  const { fiche } = options;
  const site = options.site.trim() || "Site à préciser";
  const date = (options.date ?? new Date()).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const centrale = estimationCentraleEur(fiche);
  const minMwh = mwhCumacDepuisEuros(fiche.estimationMinEur);
  const maxMwh = mwhCumacDepuisEuros(fiche.estimationMaxEur);
  const centralMwh = mwhCumacDepuisEuros(centrale);
  const dossier = dossierIngenierieCee(fiche);
  return {
    titre: `NOTE D'OPPORTUNITÉ STRATÉGIQUE CEE - ${fiche.code} : ${fiche.intitule}`,
    date,
    site,
    actif: LIBELLE_ACTIF_CEE[fiche.segment],
    montant: euro(centrale),
    basse: euro(fiche.estimationMinEur),
    haute: euro(fiche.estimationMaxEur),
    volume: `${mwh(centralMwh)} MWh cumac`,
    volumeDetail:
      minMwh === maxMwh ? "Cours EMMY classique" : `${mwh(minMwh)} à ${mwh(maxMwh)} MWh cumac`,
    cours: `Cours EMMY officiel retenu : ${euroCours(COURS_EMMY_CLASSIQUE_EUR)} €/MWh cumac classique  |  ${euroCours(COURS_EMMY_PRECARITE_EUR)} €/MWh cumac précarité`,
    accroche: accrocheHero(fiche.estimationMaxEur),
    typeSite: dossier.typeSite,
    decideur: dossier.decideur,
    enjeu: dossier.enjeu,
    schemaTitre: dossier.schemaTitre,
    schemaEtapes: dossier.schemaEtapes,
  };
}

function remplir(doc: JsPdfDocument, rgb: [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function tracer(doc: JsPdfDocument, rgb: [number, number, number]) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

function encre(doc: JsPdfDocument, rgb: [number, number, number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function uneLigne(doc: JsPdfDocument, texte: string, largeur: number) {
  if (doc.getTextWidth(texte) <= largeur) return texte;
  let reste = texte;
  while (reste.length > 1 && doc.getTextWidth(`${reste}...`) > largeur) reste = reste.slice(0, -1);
  return `${reste.trimEnd()}...`;
}

function paragraphe(doc: JsPdfDocument, texte: string, largeur: number, maxLignes: number) {
  const lignes = doc.splitTextToSize(texte, largeur) as string[];
  if (lignes.length <= maxLignes) return lignes;
  const gardees = lignes.slice(0, maxLignes);
  let derniere = gardees[maxLignes - 1].replace(/\s+$/, "");
  while (derniere.length > 0 && doc.getTextWidth(`${derniere}...`) > largeur) derniere = derniere.slice(0, -1);
  gardees[maxLignes - 1] = `${derniere.trimEnd()}...`;
  return gardees;
}

function tailleAjustee(
  doc: JsPdfDocument,
  texte: string,
  largeur: number,
  police: "helvetica" | "times",
  style: "normal" | "bold",
  maxPt: number,
  minPt: number,
) {
  doc.setFont(police, style);
  let taille = maxPt;
  doc.setFontSize(taille);
  while (taille > minPt && doc.getTextWidth(texte) > largeur) {
    taille -= 0.25;
    doc.setFontSize(taille);
  }
  return taille;
}

function ecrireLignes(doc: JsPdfDocument, lignes: string[], x: number, y: number, interligne: number) {
  for (const ligne of lignes) {
    doc.text(ligne, x, y);
    y += interligne;
  }
  return y;
}

export function logoDepuisPng(bytes: Uint8Array): LogoNote | null {
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
  return { dataUrl: `data:image/png;base64,${btoa(binary)}`, width, height };
}

export function imageDepuisOctets(bytes: Uint8Array): LogoNote | null {
  if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50) return logoDepuisPng(bytes);
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let curseur = 2;
  let width = 0;
  let height = 0;
  while (curseur + 8 < bytes.length) {
    if (bytes[curseur] !== 0xff) {
      curseur += 1;
      continue;
    }
    const marqueur = bytes[curseur + 1];
    if (marqueur === 0xd8 || marqueur === 0xd9) {
      curseur += 2;
      continue;
    }
    const longueur = (bytes[curseur + 2] << 8) + bytes[curseur + 3];
    if (marqueur >= 0xc0 && marqueur <= 0xc2) {
      height = (bytes[curseur + 5] << 8) + bytes[curseur + 6];
      width = (bytes[curseur + 7] << 8) + bytes[curseur + 8];
      break;
    }
    curseur += 2 + longueur;
  }
  if (width <= 0 || height <= 0) return null;
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return { dataUrl: `data:image/jpeg;base64,${btoa(binary)}`, width, height };
}

export async function chargerVisuel(chemin: string): Promise<LogoNote | null> {
  if (typeof fetch !== "function" || !chemin) return null;
  try {
    const response = await fetch(chemin);
    if (!response.ok) return null;
    return imageDepuisOctets(new Uint8Array(await response.arrayBuffer()));
  } catch {
    return null;
  }
}

const ETIQUETTES_SCHEMA: Record<string, string[]> = {
  "IND-UT-117": [
    "Compresseur — huile 90 °C",
    "Échangeur — entrée 320 °C",
    "Eau chaude — sortie 70 °C",
    "Ballon tampon 1 000 L",
  ],
  "BAR-TH-104": [
    "Unité extérieure — liaisons isolées",
    "Module hydraulique intérieur",
    "Ballon tampon isolé",
    "Filtre à boues et émetteurs",
  ],
  "BAR-EN-101": [
    "Laine soufflée — R ≥ 7",
    "Pare-vapeur continu et scellé",
    "Trappe d'accès isolée",
    "Écart au feu autour du conduit",
  ],
  "BAR-EN-102": [
    "PSE graphite — R ≥ 3,7",
    "Chevilles à rosace",
    "Sous-enduit armé fibre de verre",
    "Retours de tableau isolés",
  ],
  "BAR-EN-103": [
    "Panneaux rigides — R ≥ 3",
    "Pare-vapeur aluminium",
    "Rosaces en trame régulière",
    "Sous-face sans pont thermique",
  ],
  "BAR-TH-148": [
    "Ballon émaillé 250 L",
    "PAC intégrée — gaines isolées",
    "Groupe de sécurité 7 bar",
    "Vase et raccords diélectriques",
  ],
  "BAR-TH-173": [
    "Thermostat mural tactile",
    "Têtes sur chaque radiateur",
    "Passerelle et sonde extérieure",
    "Application pièce par pièce",
  ],
};

function formatImage(dataUrl: string) {
  return dataUrl.includes("image/png") ? "PNG" : "JPEG";
}

function piedPage(doc: JsPdfDocument) {
  remplir(doc, NAVY);
  doc.rect(0, 291.2, PAGE_W, 5.8, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.4);
  encre(doc, WHITE);
  doc.text(`INPI n° ${BRANDING.inpi}    ·    ${BRANDING.site}    ·    ${BRANDING.email}`, PAGE_W / 2, 294.9, {
    align: "center",
  });
}

function enteteNuit(doc: JsPdfDocument, logo: LogoNote | null, code: string) {
  remplir(doc, NAVY);
  doc.rect(0, 0, PAGE_W, 24, "F");
  const boite = logo ? fitLogo(logo.width, logo.height, 36, 14) : { width: 0, height: 0 };
  if (logo && boite.width > 0) {
    doc.addImage(logo.dataUrl, formatImage(logo.dataUrl), M, 5, boite.width, boite.height);
  }
  const x = logo && boite.width > 0 ? M + boite.width + 4 : M;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  encre(doc, WHITE);
  doc.text("ENERGIA CONSEIL IA", x, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Marque déposée INPI n° ${BRANDING.inpi}`, x, 15.5);
  doc.setFontSize(7);
  doc.text(code, PAGE_W - M, 12, { align: "right" });
}

function dessinerSchema(doc: JsPdfDocument, schema: LogoNote | null, y: number) {
  const largeur = INNER;
  const hauteur = largeur * (9 / 16);
  const x = M;
  remplir(doc, NAVY);
  doc.roundedRect(x, y, largeur, hauteur, 1.6, 1.6, "F");
  if (schema) {
    const ratio = schema.width / schema.height;
    const cible = 16 / 9;
    let w = largeur - 2;
    let h = hauteur - 2;
    if (ratio > cible) h = w / ratio;
    else w = h * ratio;
    doc.addImage(schema.dataUrl, formatImage(schema.dataUrl), x + (largeur - w) / 2, y + (hauteur - h) / 2, w, h);
  } else {
    encre(doc, WHITE);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Schema d'ingenierie indisponible", PAGE_W / 2, y + hauteur / 2, { align: "center" });
  }
  return y + hauteur;
}

function dessinerFicheClient(
  doc: JsPdfDocument,
  note: NoteOpportuniteCee,
  fiche: CeeFicheTravaux,
  strategie: FicheStrategiqueCee | null,
  logo: LogoNote | null,
  schema: LogoNote | null,
) {
  enteteNuit(doc, logo, fiche.code);
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  encre(doc, NAVY);
  const titre = uneLigne(doc, strategie?.titre || fiche.intitule, INNER);
  doc.text(titre, M, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  encre(doc, MUTED);
  doc.text(`${fiche.code}  ·  ${strategie?.segment || note.actif}  ·  ${note.site}`, M, 37);

  let y = dessinerSchema(doc, schema, 41);
  y += 3;
  const etiquettes = ETIQUETTES_SCHEMA[fiche.code] || note.schemaEtapes;
  const col = (INNER - 3) / Math.max(etiquettes.length, 1);
  etiquettes.slice(0, 4).forEach((etiquette, index) => {
    const x = M + index * (col + 1);
    carte(doc, x, y, col, 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    encre(doc, NAVY);
    doc.text(uneLigne(doc, etiquette, col - 4), x + 2, y + 7);
  });
  y += 16;
  carte(doc, M, y, INNER, 28, true);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  encre(doc, MUTED);
  doc.text("PRIME CEE INDICATIVE", PAGE_W / 2, y + 7, { align: "center" });
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  encre(doc, GREEN);
  doc.text(uneLigne(doc, strategie?.primeFourchette || note.montant, INNER - 8), PAGE_W / 2, y + 18, { align: "center" });

  doc.addPage();
  remplir(doc, hexToRgb("#F4F7FB"));
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  enteteNuit(doc, logo, fiche.code);
  y = 32;
  const blocs: { titre: string; lignes: string[] }[] = [
    {
      titre: "Équipements majeurs requis",
      lignes: strategie?.equipements?.length ? strategie.equipements : note.schemaEtapes,
    },
    {
      titre: "Corps d'état recommandés",
      lignes: strategie?.corpsEtat?.length ? strategie.corpsEtat : [note.decideur],
    },
    {
      titre: "Éligibilité CEE et volume MWh cumac",
      lignes: [
        strategie?.volumeCumac || note.volume,
        note.cours,
        ...(strategie?.eligibilite || [note.enjeu]),
      ],
    },
  ];
  blocs.forEach((bloc) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    encre(doc, NAVY);
    doc.text(bloc.titre, M, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    encre(doc, BODY);
    bloc.lignes.forEach((ligne) => {
      const morceaux = paragraphe(doc, ligne, INNER, 3);
      ecrireLignes(doc, morceaux, M, y, 3.6);
      y += morceaux.length * 3.6 + 1;
    });
    y += 3;
  });

  const ratio = ratioStrategiqueParCode(fiche.code);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  encre(doc, NAVY);
  doc.text("Financement client", M, y);
  y += 3;
  const chiffres = [
    { label: "Prix de vente conseillé", valeur: ratio?.venteHt != null ? euroHt(ratio.venteHt) : "À chiffrer au dossier" },
    { label: "Prime CEE", valeur: ratio?.primeHt != null ? euroHt(ratio.primeHt) : note.montant },
    { label: "Reste à charge net", valeur: ratio?.racHt != null ? euroHt(ratio.racHt) : "Après chiffrage" },
  ];
  const largeur = (INNER - 4) / 3;
  chiffres.forEach((item, index) => {
    const x = M + index * (largeur + 2);
    carte(doc, x, y, largeur, 18, index === 1);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    encre(doc, MUTED);
    doc.text(item.label, x + 2, y + 6);
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    encre(doc, index === 1 ? GREEN : NAVY);
    doc.text(uneLigne(doc, item.valeur, largeur - 4), x + 2, y + 13);
  });
  y += 24;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  encre(doc, MUTED);
  const avertissement = `${MENTION_AIDES_NOTE} Ce document n'est pas un devis et ne vaut pas accord CEE.`;
  ecrireLignes(doc, paragraphe(doc, avertissement, INNER, 3), M, y, 3.2);
  piedPage(doc);
  doc.setPage(1);
  piedPage(doc);
}

export async function chargerLogoNote(): Promise<LogoNote | null> {
  if (typeof fetch !== "function") return null;
  try {
    const response = await fetch(LOGO_NOTE_PATH);
    if (!response.ok) return null;
    return logoDepuisPng(new Uint8Array(await response.arrayBuffer()));
  } catch {
    return null;
  }
}

function carte(doc: JsPdfDocument, x: number, y: number, w: number, h: number, emeraude = false) {
  remplir(doc, WHITE);
  doc.roundedRect(x, y, w, h, 1.8, 1.8, "F");
  tracer(doc, emeraude ? GREEN : LINE);
  doc.setLineWidth(emeraude ? 0.55 : 0.25);
  doc.roundedRect(x, y, w, h, 1.8, 1.8, "S");
}

function bandeau(doc: JsPdfDocument, logo: LogoNote | null) {
  remplir(doc, WHITE);
  doc.rect(0, 0, PAGE_W, 29, "F");
  remplir(doc, GREEN);
  doc.rect(0, 29, PAGE_W, 1.15, "F");

  const boite = logo ? fitLogo(logo.width, logo.height, 44, 18) : { width: 0, height: 0 };
  if (logo && boite.width > 0) {
    doc.addImage(logo.dataUrl, "PNG", M, 5.5 + (18 - boite.height) / 2, boite.width, boite.height);
  }
  const texteX = logo && boite.width > 0 ? M + boite.width + 4 : M;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  encre(doc, NAVY);
  doc.text("Bureau d'études & AMO  |  Ingénierie CEE & Décarbonation", texteX, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  encre(doc, BODY);
  doc.text(`Marque Déposée INPI n° ${BRANDING.inpi}`, texteX, 17.4);
  doc.text("Partenaire Référencé Tesla Energy", texteX, 22.2);

  tracer(doc, GREEN);
  doc.setLineWidth(0.35);
  doc.roundedRect(PAGE_W - M - 26, 10, 26, 8, 1.4, 1.4, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  encre(doc, GREEN);
  doc.text("INDICATIF", PAGE_W - M - 13, 15.2, { align: "center" });
}

function titreEtMeta(doc: JsPdfDocument, note: NoteOpportuniteCee) {
  const taille = tailleAjustee(doc, note.titre, INNER, "times", "bold", 12, 8.5);
  doc.setFont("times", "bold");
  doc.setFontSize(taille);
  encre(doc, NAVY);
  doc.text(note.titre, M, 37.2);

  const y = 41;
  const h = 12.5;
  const colW = (INNER - GAP * 2) / 3;
  const cols = [
    { label: "DATE", valeur: note.date },
    { label: "SITE / CLIENT", valeur: note.site },
    { label: "TYPE D'ACTIF", valeur: note.actif },
  ];
  cols.forEach((col, index) => {
    const x = M + index * (colW + GAP);
    carte(doc, x, y, colW, h);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    encre(doc, MUTED);
    doc.text(col.label, x + 3, y + 4.4);
    doc.setFontSize(8);
    encre(doc, NAVY);
    doc.text(uneLigne(doc, col.valeur, colW - 6), x + 3, y + 9);
  });
}

function blocChiffre(doc: JsPdfDocument, note: NoteOpportuniteCee) {
  const y = 56.5;
  const h = 58;
  carte(doc, M, y, INNER, h, true);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  encre(doc, MUTED);
  doc.text("SUBVENTION CEE ESTIMÉE", PAGE_W / 2, y + 8, { align: "center" });

  const taille = tailleAjustee(doc, note.montant, INNER - 20, "times", "bold", 32, 18);
  doc.setFont("times", "bold");
  doc.setFontSize(taille);
  encre(doc, GREEN);
  doc.text(note.montant, PAGE_W / 2, y + 22, { align: "center" });

  const metriques = [
    { label: "FOURCHETTE BASSE", valeur: note.basse },
    { label: "FOURCHETTE HAUTE", valeur: note.haute },
    { label: "VOLUME CEE", valeur: note.volume },
  ];
  const mw = INNER / 3;
  metriques.forEach((item, index) => {
    const x = M + index * mw;
    if (index > 0) {
      tracer(doc, LINE);
      doc.setLineWidth(0.15);
      doc.line(x, y + 26, x, y + 40);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    encre(doc, MUTED);
    doc.text(item.label, x + mw / 2, y + 30, { align: "center" });
    doc.setFont("times", "bold");
    const tv = tailleAjustee(doc, item.valeur, mw - 6, "times", "bold", 11, 8);
    doc.setFontSize(tv);
    encre(doc, NAVY);
    doc.text(item.valeur, x + mw / 2, y + 36.5, { align: "center" });
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  encre(doc, hexToRgb("#166534"));
  doc.text(uneLigne(doc, note.cours, INNER - 10), PAGE_W / 2, y + 46, { align: "center" });

  const pillW = Math.min(doc.getTextWidth(note.accroche) + 8, INNER - 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  const pillX = (PAGE_W - pillW) / 2;
  remplir(doc, GREEN_SOFT);
  doc.roundedRect(pillX, y + 49, pillW, 6.2, 1.2, 1.2, "F");
  encre(doc, GREEN);
  doc.text(uneLigne(doc, note.accroche, pillW - 4), PAGE_W / 2, y + 53.2, { align: "center" });
}

function iconeCible(doc: JsPdfDocument, x: number, y: number) {
  tracer(doc, GREEN);
  doc.setLineWidth(0.4);
  doc.circle(x, y, 4.4, "S");
  doc.circle(x, y, 2.3, "S");
  remplir(doc, GREEN);
  doc.circle(x, y, 0.85, "F");
  doc.setLineWidth(0.3);
  doc.line(x - 6.2, y, x - 4.8, y);
  doc.line(x + 4.8, y, x + 6.2, y);
  doc.line(x, y - 6.2, x, y - 4.8);
  doc.line(x, y + 4.8, x, y + 6.2);
}

function carteCible(doc: JsPdfDocument, note: NoteOpportuniteCee) {
  const y = 117.5;
  const h = 32;
  carte(doc, M, y, INNER, h);
  iconeCible(doc, M + 10, y + 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  encre(doc, NAVY);
  doc.text("CIBLE PRIORITAIRE & DÉCIDEUR", M + 18, y + 7);
  const lignes = [
    ["Type de site", note.typeSite],
    ["Décideur", note.decideur],
    ["Enjeu client", note.enjeu],
  ];
  lignes.forEach((ligne, index) => {
    const base = y + 13.2 + index * 5.6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    encre(doc, GREEN);
    doc.text(ligne[0], M + 18, base);
    const decalage = doc.getTextWidth(ligne[0]) + 2.2;
    doc.setFont("helvetica", "normal");
    encre(doc, BODY);
    doc.text(uneLigne(doc, ligne[1], INNER - 22 - decalage), M + 18 + decalage, base);
  });
}

function fleche(doc: JsPdfDocument, x: number, y: number) {
  tracer(doc, GREEN);
  doc.setLineWidth(0.55);
  doc.line(x, y, x + 4.6, y);
  doc.line(x + 2.8, y - 1.35, x + 5.2, y);
  doc.line(x + 2.8, y + 1.35, x + 5.2, y);
}

function schemaPrincipe(doc: JsPdfDocument, note: NoteOpportuniteCee) {
  const y = 152.5;
  const h = 44;
  carte(doc, M, y, INNER, h);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  encre(doc, NAVY);
  doc.text("SCHÉMA DE PRINCIPE", M + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  encre(doc, MUTED);
  doc.text(uneLigne(doc, note.schemaTitre, INNER - 62), M + 52, y + 7);

  const etapes = note.schemaEtapes.slice(0, 4);
  const n = Math.max(etapes.length, 1);
  const flecheW = 8;
  const utile = INNER - 12 - flecheW * (n - 1);
  const boxW = utile / n;
  const boxH = 22;
  const top = y + 14;
  etapes.forEach((etape, index) => {
    const x = M + 6 + index * (boxW + flecheW);
    tracer(doc, NAVY);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, top, boxW, boxH, 1.2, 1.2, "S");
    remplir(doc, GREEN);
    doc.circle(x + boxW / 2, top + 4.2, 2.1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    encre(doc, WHITE);
    doc.text(String(index + 1), x + boxW / 2, top + 5.15, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    encre(doc, NAVY);
    const lignes = paragraphe(doc, etape, boxW - 4, 2);
    const depart = top + 11 + (2 - lignes.length) * 1.6;
    lignes.forEach((ligne, ligneIndex) => {
      doc.text(ligne, x + boxW / 2, depart + ligneIndex * 3.3, { align: "center" });
    });
    if (index < n - 1) fleche(doc, x + boxW + 0.8, top + boxH / 2);
  });
}

function frise(doc: JsPdfDocument) {
  const y = 199.5;
  const h = 34;
  carte(doc, M, y, INNER, h);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  encre(doc, NAVY);
  doc.text("LE PROTOCOLE EN 4 ÉTAPES", M + 4, y + 6.5);
  const etapes = [
    ["Audit et métrologie", "Relevé des puissances sur site"],
    ["Dépôt et réservation CEE", "Avant tout engagement de travaux"],
    ["Travaux et mise en service", "Par des artisans qualifiés"],
    ["Contrôle COFRAC", "Versement de la prime"],
  ];
  const pas = INNER / etapes.length;
  const cy = y + 15;
  tracer(doc, hexToRgb("#86EFAC"));
  doc.setLineWidth(0.7);
  doc.line(M + pas / 2, cy, M + pas * 3.5, cy);
  etapes.forEach((etape, index) => {
    const cx = M + pas * index + pas / 2;
    remplir(doc, GREEN);
    doc.circle(cx, cy, 3.1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    encre(doc, WHITE);
    doc.text(String(index + 1), cx, cy + 1.15, { align: "center" });
    doc.setFontSize(6.2);
    encre(doc, NAVY);
    doc.text(uneLigne(doc, etape[0], pas - 3), cx, y + 22.6, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.8);
    encre(doc, MUTED);
    doc.text(uneLigne(doc, etape[1], pas - 3), cx, y + 26.6, { align: "center" });
  });
}

function pied(doc: JsPdfDocument) {
  const y = 236.5;
  carte(doc, M, y, INNER, 54.2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  encre(doc, NAVY);
  doc.text("Sylvain LEMBELEMBE", M + 4, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  encre(doc, GREEN);
  doc.text(`Bureau d'études & AMO    ·    ${BRANDING.telephone}    ·    ${BRANDING.email}`, M + 4, y + 13.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  encre(doc, BODY);
  doc.text("Damien (Commercial)   ·   Vivons Courtier (Financement)   ·   Cabinet C2ET (Audit & MAR)   ·   Julia (Juriste)", M + 4, y + 19.5);

  remplir(doc, GREEN_SOFT);
  doc.roundedRect(M + 4, y + 22.8, INNER - 8, 7, 1.2, 1.2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.4);
  encre(doc, GREEN);
  doc.text("Apporteurs qualifiés : partenariat 70/30 sur dossier complet", M + 7, y + 27.4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  encre(doc, BODY);
  doc.text(
    `${BRANDING.forme} ${BRANDING.nom}   ·   RCS ${BRANDING.rcsAffiche}   ·   SIRET ${BRANDING.siretAffiche}   ·   Capital ${BRANDING.capital}`,
    M + 4,
    y + 35,
  );
  doc.text(`Siège : ${BRANDING.siege}   ·   INPI n° ${BRANDING.inpi}   ·   APE ${BRANDING.ape}   ·   TVA ${BRANDING.tva}`, M + 4, y + 39.2);

  doc.setFontSize(6);
  encre(doc, MUTED);
  const avertissement = `${MENTION_AIDES_NOTE} Ce document n'est pas un devis et ne vaut pas accord CEE.`;
  ecrireLignes(doc, paragraphe(doc, avertissement, INNER - 8, 2), M + 4, y + 44.5, 2.7);

  remplir(doc, NAVY);
  doc.rect(0, 291.2, PAGE_W, 5.8, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.4);
  encre(doc, WHITE);
  doc.text(
    `${BRANDING.site}    ·    ${BRANDING.email}    ·    ${BRANDING.telephone}`,
    PAGE_W / 2,
    294.9,
    { align: "center" },
  );
}

export function creerNoteOpportuniteCee(options: OptionsNote) {
  const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
  const note = composerNoteOpportuniteCee(options);
  const strategie = ficheStrategiqueParCode(options.fiche.code);
  doc.setProperties({
    title: note.titre,
    author: "ENERGIA CONSEIL IA",
    subject: "Note d'opportunité stratégique CEE",
    creator: "ENERGIA CONSEIL IA",
  });
  remplir(doc, hexToRgb("#F4F7FB"));
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  dessinerFicheClient(doc, note, options.fiche, strategie, options.logo ?? null, options.schema ?? null);
  if (doc.getNumberOfPages() > 2) {
    throw new Error("La note d'opportunité CEE doit tenir sur deux pages A4.");
  }
  return doc;
}

async function documentNote(options: OptionsNote) {
  const logo = options.logo === undefined ? await chargerLogoNote() : options.logo;
  const strategie = ficheStrategiqueParCode(options.fiche.code);
  const schema =
    options.schema === undefined && strategie?.image ? await chargerVisuel(strategie.image) : (options.schema ?? null);
  return creerNoteOpportuniteCee({ ...options, logo, schema });
}

export async function noteOpportuniteCeeBase64(fiche: CeeFicheTravaux, site = "") {
  const brut = (await documentNote({ fiche, site })).output("datauristring");
  return brut.includes(",") ? brut.split(",")[1] : brut;
}

export async function telechargerNoteOpportuniteCee(options: OptionsNote) {
  const doc = await documentNote(options);
  const slug = options.fiche.code.replace(/[^a-zA-Z0-9]+/g, "-");
  const jour = (options.date ?? new Date()).toISOString().slice(0, 10);
  doc.save(`Note_Opportunite_CEE_${slug}_${jour}.pdf`);
}
