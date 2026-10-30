import jsPDFModule from "jspdf";
import type { jsPDF as JsPdfDocument } from "jspdf";
import { BRANDING, fitLogo, hexToRgb } from "../branding";
import { logoDepuisPng, type LogoNote } from "./noteOpportuniteCeePdf";
import {
  BADGE_TESLA,
  MENTIONS_COUVERTURE,
  BADGES_QUATRIEME,
  CONTACTS_QUATRIEME,
  MENTION_AIDES_CATALOGUE,
  MOT_FONDATEUR,
  PLANCHE_PROFILS,
  PLANCHE_TRAME,
  SLOGAN_INSTITUTIONNEL,
  PLANCHES_B2B,
  PLANCHES_GARANTIES,
  PLANCHES_RESIDENTIEL,
  POLICE_DECENNALE,
  QUALIFICATION_CERTIBAT,
  type BlocCatalogue,
  type PlancheCatalogue,
} from "./catalogueCommercial";

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

function imageDepuisOctets(bytes: Uint8Array): LogoNote | null {
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

async function chargerVisuel(chemin: string): Promise<LogoNote | null> {
  if (typeof fetch !== "function" || !chemin) return null;
  try {
    const response = await fetch(chemin);
    if (!response.ok) return null;
    return imageDepuisOctets(new Uint8Array(await response.arrayBuffer()));
  } catch {
    return null;
  }
}

const PAGE_W = 210;
const PAGE_H = 297;
const M = 14;
const INNER = PAGE_W - M * 2;
const NAVY = hexToRgb("#0c1220");
const GOLD = hexToRgb("#d4af37");
const INK = hexToRgb("#1e293b");
const MUTED = hexToRgb("#64748b");
const WHITE: [number, number, number] = [255, 255, 255];

function formatImage(dataUrl: string) {
  return dataUrl.includes("image/png") ? "PNG" : "JPEG";
}

function pied(doc: JsPdfDocument) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 288, PAGE_W, 9, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text(
    `ENERGIA-CONSEIL IA  ·  INPI ${BRANDING.inpi}  ·  ${POLICE_DECENNALE}  ·  Damien 06 72 68 09 68`,
    PAGE_W / 2,
    293.2,
    { align: "center" },
  );
}

function suite(doc: JsPdfDocument, kicker: string) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 12, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text(kicker, M, 7.5);
  pied(doc);
  return 18;
}

function assurer(doc: JsPdfDocument, y: number, hauteur: number, kicker: string) {
  if (y + hauteur <= 282) return y;
  doc.addPage();
  return suite(doc, `${kicker} — suite`);
}

function ecrire(doc: JsPdfDocument, texte: string, y: number, kicker: string, taille = 10, couleur = INK) {
  const lignes = doc.splitTextToSize(texte, INNER);
  const hauteur = lignes.length * (taille * 0.42) + 2;
  let curseur = assurer(doc, y, hauteur, kicker);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(taille);
  doc.setTextColor(...couleur);
  doc.text(lignes, M, curseur);
  return curseur + hauteur;
}

function bloc(doc: JsPdfDocument, item: BlocCatalogue, y: number, kicker: string) {
  let curseur = assurer(doc, y, 8, kicker);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(item.titre, M, curseur);
  curseur += 5;
  if (item.texte) curseur = ecrire(doc, item.texte, curseur, kicker);
  for (const puce of item.puces ?? []) {
    curseur = ecrire(doc, `• ${puce}`, curseur, kicker, 9.5);
  }
  return curseur + 2;
}

function couverture(doc: JsPdfDocument, logo: LogoNote | null) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(M, 18, PAGE_W - M, 18);

  let y = 28;
  if (logo) {
    const boite = fitLogo(logo.width, logo.height, 52, 28);
    doc.setFillColor(...WHITE);
    doc.roundedRect(M, y, boite.width + 8, boite.height + 6, 2, 2, "F");
    doc.addImage(logo.dataUrl, formatImage(logo.dataUrl), M + 4, y + 3, boite.width, boite.height);
    y += boite.height + 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.text("ENERGIA-CONSEIL IA", M, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...GOLD);
  doc.text("Bureau d'Études Thermiques & Contractant Général Digital", M, y);
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...WHITE);
  const titre = doc.splitTextToSize("Catalogue officiel des solutions énergétiques 2026", INNER);
  doc.text(titre, M, y);
  y += titre.length * 6 + 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.text("Rénovation globale  ·  Écosystème solaire Tesla  ·  Tertiaire & industrie", M, y);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text("Informations légales & qualifications", M, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  for (const ligne of MENTIONS_COUVERTURE) {
    const morceaux = doc.splitTextToSize(ligne, INNER);
    doc.text(morceaux, M, y);
    y += morceaux.length * 4.2 + 1.5;
  }
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  const tesla = doc.splitTextToSize(BADGE_TESLA, INNER);
  doc.text(tesla, M, y);
  y += tesla.length * 4.5 + 8;

  doc.setDrawColor(...GOLD);
  doc.line(M, y, PAGE_W - M, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text("Le mot de Sylvain LEMBELEMBE, Fondateur & CEO", M, y);
  y += 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  const mot = doc.splitTextToSize(MOT_FONDATEUR.replace(/\n\n/g, " "), INNER);
  const place = Math.min(mot.length, Math.floor((270 - y) / 4.1));
  doc.text(mot.slice(0, place), M, y);
  y += place * 4.1 + 6;
  if (y < 278) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.text(`${QUALIFICATION_CERTIBAT}`, M, Math.min(y, 278));
  }
}

async function planche(doc: JsPdfDocument, item: PlancheCatalogue) {
  doc.addPage();
  let y = suite(doc, item.kicker);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...NAVY);
  const titre = doc.splitTextToSize(item.titre, INNER);
  y = assurer(doc, y, titre.length * 7, item.kicker);
  doc.text(titre, M, y);
  y += titre.length * 7 + 2;

  if (item.image) {
    const visuel = await chargerVisuel(item.image);
    if (visuel) {
      const hauteur = 58;
      const largeur = Math.min(INNER, hauteur * (visuel.width / visuel.height));
      y = assurer(doc, y, hauteur + 4, item.kicker);
      doc.addImage(visuel.dataUrl, formatImage(visuel.dataUrl), M, y, largeur, hauteur);
      y += hauteur + 5;
    }
  }

  for (const itemBloc of item.blocs) {
    y = bloc(doc, itemBloc, y, item.kicker);
  }
}

function quatriemeCouverture(doc: JsPdfDocument, logo: LogoNote | null) {
  doc.addPage();
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(M, 16, PAGE_W - M, 16);

  let y = 28;
  if (logo) {
    const boite = fitLogo(logo.width, logo.height, 78, 40);
    doc.setFillColor(...WHITE);
    doc.roundedRect(M, y, boite.width + 10, boite.height + 8, 2, 2, "F");
    doc.addImage(logo.dataUrl, formatImage(logo.dataUrl), M + 5, y + 4, boite.width, boite.height);
    y += boite.height + 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...WHITE);
  doc.text("ENERGIA-CONSEIL IA", M, y);
  y += 10;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...GOLD);
  const slogan = doc.splitTextToSize(SLOGAN_INSTITUTIONNEL, INNER);
  doc.text(slogan, M, y);
  y += slogan.length * 5.5 + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text("Contacts", M, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  for (const contact of CONTACTS_QUATRIEME) {
    doc.setTextColor(...GOLD);
    doc.text(contact.role, M, y);
    doc.setTextColor(...WHITE);
    doc.text(contact.valeur, M + 52, y);
    y += 7;
  }

  y += 6;
  doc.setDrawColor(...GOLD);
  doc.line(M, y, PAGE_W - M, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  for (const badge of BADGES_QUATRIEME) {
    const lignes = doc.splitTextToSize(badge, INNER);
    doc.text(lignes, M, y);
    y += lignes.length * 4.6 + 2;
  }

  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const mentions = doc.splitTextToSize(
    `${MENTION_AIDES_CATALOGUE} Aucun devis définitif de parcours MaPrimeRénov' ne se signe avant l'accord écrit de l'ANAH. Clause Julia : responsabilité ENERGIA plafonnée à 2 000 EUR si l'écart d'aides est imputable à une erreur prouvée.`,
    INNER,
  );
  doc.text(mentions, M, 268);
}

export async function telechargerCatalogueCommercialPdf() {
  const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
  const logo = await chargerVisuel("/assets/energia-logo-arbres.png");
  couverture(doc, logo);
  const planches = [PLANCHES_GARANTIES, ...PLANCHES_RESIDENTIEL, ...PLANCHES_B2B, PLANCHE_PROFILS, PLANCHE_TRAME];
  for (const item of planches) {
    await planche(doc, item);
  }
  quatriemeCouverture(doc, logo);
  doc.save("Catalogue-Commercial-ENERGIA-2026.pdf");
}
