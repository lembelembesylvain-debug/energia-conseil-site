/**
 * Bon de commande de sous-traitance artisan — feuille A4 charte contrats ENERGIA.
 * Même structure que la facture d'acompte : fond blanc, logo vert, cartouche, tableaux.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, ClipboardList, Download, PenLine, Printer } from "lucide-react";
import { BRANDING } from "../../lib/branding";
import {
  CLIENT_COUTY,
  COUTY_ESCALIER_CONTRAT_NUMERO,
  COUTY_ESCALIER_DOSSIER_ID,
  COUTY_ESCALIER_REFERENCE,
} from "../../lib/crm/coutyEscalierOfficiel";
import { dateCourte, dateLongue, euro, round2 } from "./FactureAcompteModal";
import {
  ABDENABI_ADRESSE_RUE,
  ABDENABI_BDC,
  ABDENABI_CLIENT_BDC,
  ABDENABI_CONTACT_MOMO,
  ABDENABI_CORPS_ETAT,
  ABDENABI_CP_VILLE,
  ABDENABI_DEVIS,
  ABDENABI_ID,
  ABDENABI_PRESTATION_BDC,
  ABDENABI_SOUS_TRAITANT,
  ABDENABI_ST_HT,
} from "../../data/chantiers";
import {
  BDC_MASSON_REFERENCE,
  CLIENT_MASSON,
  EQUIPE_MASSON,
  MASSON_DOSSIER_ID,
  MASSON_REFERENCE,
  SOUS_TRAITANCE_MASSON,
} from "../../lib/crm/massonToulonOfficiel";
import { conditionsBdcMasson, LOT_BDC_MASSON, MODALITE_BDC_MASSON } from "../../lib/crm/bdcMassonToulon";
import {
  CLIENT_OUSSARA,
  OUSSARA_DEVIS_DATE,
  OUSSARA_DEVIS_NUMERO,
  OUSSARA_DOSSIER_ID,
  TITRE_OUSSARA,
} from "../../lib/crm/oussaraColombierOfficiel";
import {
  CLIENT_OUSSARA_COMBLES,
  OUSSARA_COMBLES_DATE,
  OUSSARA_COMBLES_DEVIS_NUMERO,
  OUSSARA_COMBLES_DOSSIER_ID,
  TITRE_OUSSARA_COMBLES,
} from "../../lib/crm/oussaraComblesOfficiel";

export const ASSURANCE_FACTURE =
  "Garantie Décennale & RCP : Calipso Assurances n° LUNPIB2604975";

export const LOT_MENUISERIE_COUTY =
  "Lot Menuiserie & Maintien à Domicile — Fourniture et pose clé en main d'une main courante d'escalier sur-mesure en chêne massif Ø 42 mm (~4,80 ml), raccord articulé d'angle, 6 platines scellées, retours arrondis PMR, quincaillerie complète et nettoyage de chantier.";

export const MODALITE_FORFAIT = "Forfait Clé en Main (Fourniture + Pose + Déplacement)";

export const MONTANT_HT_COUTY = 480;

export const MENTION_AUTOLIQUIDATION =
  "Autoliquidation de la TVA par le preneur — Article 283-2 nonies du Code Général des Impôts (TVA 0 % en sous-traitance BTP).";

const ARTISAN_DEFAUT = "Entreprise de pose partenaire";
const CORPS_ETAT_DEFAUT_COUTY = "Menuisier";
const MAX_PHOTOS = 4;

export type StatutCommandeArtisan = "attente" | "valide";

export type PhotoChantier = {
  src: string;
  legende: string;
  phase?: "avant" | "apres";
};

export type SaisieBonCommande = {
  numero: string;
  dateEmission: string;
  referenceMarche: string;
  client: string;
  adresse: string;
  telephone: string;
  ville: string;
  artisan: string;
  corpsEtat: string;
  siretArtisan: string;
  decennaleArtisan: string;
  contactArtisan: string;
  adresseArtisan: string;
  lot: string;
  modalite: string;
  montantHt: number;
  statut: StatutCommandeArtisan;
};

export type MarcheCommandable = {
  id?: string;
  nom?: string;
  ref?: string;
  montantTtc?: number;
  adresse?: string;
  designation?: string;
  telephone?: string;
};

export type LeadCommandable = {
  id?: string;
  prenom?: string;
  nomFamille?: string;
  nom?: string;
  ville?: string;
  region?: string;
  adresse?: string;
  address?: string;
  telephone?: string;
  typeTravaux?: string;
  typeProjet?: string;
  notes?: string;
  reference?: string;
  budget?: number | string | null;
  montantHt?: number | string | null;
};

type Props = {
  ouvert: boolean;
  onFermer: () => void;
  marche?: MarcheCommandable | null;
  /** Identité du chantier — prioritaire sur les valeurs du marché. */
  clientNom?: string;
  clientAdresse?: string;
  clientTel?: string;
  clientVille?: string;
  marcheRef?: string;
  bdcRef?: string;
  lotDescription?: string;
  artisanNom?: string;
  artisanCorpsEtat?: string;
  artisanContact?: string;
  montantHT?: number;
  photos?: PhotoChantier[];
  dossierId?: string;
};

const PHOTOS_ANNEXE_COUTY = [
  {
    src: "/couty-escalier/04-palier-bas.jpg",
    legende: "Vue plongeante — Trémie et départ haut de l'escalier",
  },
  {
    src: "/couty-escalier/01-volee-droite.jpg",
    legende: "Mur latéral droit — Support de fixation des platines murales",
  },
  {
    src: "/couty-escalier/02-vue-plongeante.jpg",
    legende: "Alignement de la volée — Hauteur réglementaire 90 cm requise",
  },
  {
    src: "/couty-escalier/03-quart-tournant.jpg",
    legende: "Angle quart-tournant — Raccord articulé sur-mesure requis",
  },
] as const;

const NOTE_ANNEXE_COUTY =
  "L'artisan sous-traitant atteste avoir pris connaissance de la configuration des lieux et des contraintes d'accès. Fourniture des fixations adaptées à la nature du support à la charge exclusive du poseur.";

export const MENTION_FINITION_CONTRACTUELLE =
  "Niveau d'exigence et de finition contractuel exigé pour la signature du Procès-Verbal de Réception sans réserve (Protocole Sûreté-6™️).";

export const PRINT_CSS_BDC = `
  .bdc-artisan-a4,
  .bdc-artisan-logo,
  .bdc-artisan-entete,
  .bdc-artisan-photo {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bdc-artisan-logo { filter: none; -webkit-filter: none; }
  @media print {
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    html, body, #root {
      background: white !important;
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      overflow: visible !important;
    }
    body { background: white !important; }
    body > * { display: none !important; }
    body > .bdc-artisan-overlay {
      display: block !important;
      position: static !important;
      inset: auto !important;
      width: auto !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      background: white !important;
    }
    .bdc-artisan-noprint { display: none !important; }
    .bdc-artisan-overlay > div,
    .bdc-artisan-dossier {
      display: block !important;
      position: static !important;
      width: auto !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      margin: 0 !important;
      padding: 0 !important;
      gap: 0 !important;
      overflow: visible !important;
      background: white !important;
      box-shadow: none !important;
    }
    .page-1,
    .page-2 {
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      width: auto !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      padding: 0 !important;
      margin: 0 !important;
      overflow: visible !important;
      position: static !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      transform: none !important;
    }
    .page-1 {
      page-break-after: always !important;
      break-after: page !important;
    }
    .page-1-seule {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    .page-2 {
      page-break-before: auto !important;
      break-before: auto !important;
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    .page-2-relais {
      page-break-after: always !important;
      break-after: page !important;
    }
    .bdc-artisan-photo {
      height: 170px !important;
      max-height: 170px !important;
      width: 100% !important;
      object-fit: cover !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .bdc-comparatif-photo {
      height: 128px !important;
      max-height: 128px !important;
      width: 100% !important;
      object-fit: cover !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .bdc-legende-saisie {
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      color: #334155 !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
    }
  }
`;

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#f9c74f]";

function dateDuJourIso(): string {
  const date = new Date();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mois}-${jour}`;
}

function tokenClient(nom: string): string {
  const mots = nom
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const ignores = new Set(["madame", "monsieur", "mme", "mr", "mlle", "indivision", "dossier", "avenant"]);
  const utiles = mots.filter((mot) => !ignores.has(mot.toLowerCase()) && mot.length > 1);
  return (utiles[utiles.length - 1] || mots[0] || "CLIENT").toUpperCase().slice(0, 18);
}

export function estMarcheCouty(marche?: MarcheCommandable | null): boolean {
  if (!marche) return false;
  if (marche.id === COUTY_ESCALIER_DOSSIER_ID) return true;
  if (marche.ref === COUTY_ESCALIER_CONTRAT_NUMERO || marche.ref === COUTY_ESCALIER_REFERENCE) return true;
  return /couty|mably|main courante/i.test(`${marche.nom || ""} ${marche.ref || ""} ${marche.designation || ""}`);
}

export function extraireVille(adresse: string, villeConnue = ""): string {
  const connue = villeConnue.trim();
  if (connue && !/^\d{5}$/.test(connue)) return connue.replace(/^\d{5}\s*/, "");
  const code = adresse.match(/\b\d{5}\s+([^,]+)/);
  if (code?.[1]) return code[1].trim();
  const segments = adresse.split(",").map((part) => part.trim()).filter(Boolean);
  return segments.length > 1 ? segments[segments.length - 1].replace(/^\d{5}\s*/, "") : "";
}

function referenceMarcheLead(reference?: string): string {
  const valeur = (reference || "").trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valeur)) return "";
  return valeur;
}

function corpsEtatDepuisTexte(texte: string): string {
  const brut = texte.toLowerCase();
  if (/menuiser|escalier|main courante|fen[eê]tre|volet/.test(brut)) return "Menuisier";
  if (/électr|electr|batterie|photovolta|solaire/.test(brut)) return "Électricien";
  if (/maçon|macon|dalle|gros oeuvre|gros œuvre/.test(brut)) return "Maçon";
  if (/plomb/.test(brut)) return "Plombier";
  if (/isol/.test(brut)) return "Isolateur";
  if (/peint|placo|cloison|faux plafond|plafond/.test(brut)) return "Plaquiste";
  return "";
}

function photosCouty(): PhotoChantier[] {
  return PHOTOS_ANNEXE_COUTY.map((photo) => ({ src: photo.src, legende: photo.legende }));
}

function clePhotos(numero: string, dossierId = ""): string {
  return `energia-bdc-photos:${(numero || dossierId || "brouillon").trim()}`;
}

function lirePhotos(cle: string): PhotoChantier[] | null {
  try {
    const brut = localStorage.getItem(cle);
    if (!brut) return null;
    const data = JSON.parse(brut);
    if (!Array.isArray(data)) return null;
    const items = data.filter((item) => item && typeof item.src === "string" && item.src.trim());
    const avant = items.filter((item) => item.phase !== "apres").slice(0, MAX_PHOTOS);
    const apres = items.filter((item) => item.phase === "apres").slice(0, 2);
    return [...avant, ...apres].map((item) => ({
      src: String(item.src),
      legende: String(item.legende || ""),
      phase: item.phase === "apres" ? "apres" as const : "avant" as const,
    }));
  } catch {
    return null;
  }
}

function ecrirePhotos(cle: string, photos: PhotoChantier[]) {
  try {
    const avant = photos.filter((photo) => photo.phase !== "apres").slice(0, MAX_PHOTOS);
    const apres = photos.filter((photo) => photo.phase === "apres").slice(0, 2);
    localStorage.setItem(cle, JSON.stringify([...avant, ...apres]));
  } catch {
    /* quota ou navigation privée */
  }
}

function compresserImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("image illisible"));
      image.onload = () => {
        const max = 900;
        const ratio = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));
        const contexte = canvas.getContext("2d");
        if (!contexte) {
          resolve(String(reader.result || ""));
          return;
        }
        contexte.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

export function saisieCouty(date = dateDuJourIso()): SaisieBonCommande {
  return {
    numero: "BDC-2026-ST-COUTY-01",
    dateEmission: date,
    referenceMarche: COUTY_ESCALIER_CONTRAT_NUMERO,
    client: CLIENT_COUTY.libelleSignature,
    adresse: CLIENT_COUTY.adresse,
    telephone: CLIENT_COUTY.telephone,
    ville: CLIENT_COUTY.ville,
    artisan: ARTISAN_DEFAUT,
    corpsEtat: CORPS_ETAT_DEFAUT_COUTY,
    siretArtisan: "",
    decennaleArtisan: "",
    contactArtisan: "",
    adresseArtisan: "",
    lot: LOT_MENUISERIE_COUTY,
    modalite: MODALITE_FORFAIT,
    montantHt: MONTANT_HT_COUTY,
    statut: "attente",
  };
}

export function estMarcheAbdenabi(marche?: MarcheCommandable | null): boolean {
  if (!marche) return false;
  if (marche.id === ABDENABI_ID) return true;
  if (marche.ref === ABDENABI_DEVIS || marche.ref === ABDENABI_BDC) return true;
  return /abdenabi|beloucif/i.test(`${marche.nom || ""} ${marche.ref || ""} ${marche.designation || ""}`);
}

export function saisieAbdenabi(date = dateDuJourIso()): SaisieBonCommande {
  return {
    numero: ABDENABI_BDC,
    dateEmission: date,
    referenceMarche: ABDENABI_DEVIS,
    client: ABDENABI_CLIENT_BDC,
    adresse: ABDENABI_ADRESSE_RUE,
    telephone: "",
    ville: ABDENABI_CP_VILLE,
    artisan: ABDENABI_SOUS_TRAITANT,
    corpsEtat: ABDENABI_CORPS_ETAT,
    siretArtisan: "",
    decennaleArtisan: "",
    contactArtisan: ABDENABI_CONTACT_MOMO,
    adresseArtisan: "",
    lot: ABDENABI_PRESTATION_BDC,
    modalite: MODALITE_FORFAIT,
    montantHt: ABDENABI_ST_HT,
    statut: "attente",
  };
}

export function saisieMasson(): SaisieBonCommande {
  return {
    numero: BDC_MASSON_REFERENCE,
    dateEmission: "2026-10-22",
    referenceMarche: MASSON_REFERENCE,
    client: CLIENT_MASSON.libelleSignature,
    adresse: "176 Rue Bossuet, Bâtiment Orion 5, 83000 Toulon",
    telephone: CLIENT_MASSON.telephone,
    ville: "Toulon",
    artisan: "Entreprise BMI — Mohamed BENAOUDA",
    corpsEtat: "PAC / Chauffage",
    siretArtisan: "488 327 784",
    decennaleArtisan: "Entoria n° CRCD04-001151",
    contactArtisan: `${EQUIPE_MASSON.coordinationTelephone} — kimo7125@hotmail.fr`,
    adresseArtisan: "5 Grande Rue, 71260 LUGNY",
    lot: LOT_BDC_MASSON,
    modalite: MODALITE_BDC_MASSON,
    montantHt: SOUS_TRAITANCE_MASSON.montantHt,
    statut: "attente",
  };
}

export function estMarcheMasson(marche?: MarcheCommandable | null): boolean {
  if (!marche) return false;
  if (marche.id === MASSON_DOSSIER_ID) return true;
  if (marche.ref === MASSON_REFERENCE || marche.ref === BDC_MASSON_REFERENCE) return true;
  return /masson|kristell/i.test(`${marche.nom || ""} ${marche.ref || ""} ${marche.designation || ""} ${marche.adresse || ""}`);
}

export function saisieOussara(): SaisieBonCommande {
  return {
    numero: "BDC-2026-ST-OUSSARA-01",
    dateEmission: OUSSARA_DEVIS_DATE,
    referenceMarche: OUSSARA_DEVIS_NUMERO,
    client: CLIENT_OUSSARA.libelleSignature,
    adresse: CLIENT_OUSSARA.adresse,
    telephone: "",
    ville: CLIENT_OUSSARA.ville,
    artisan: "Réseau RGE menuiseries — à sélectionner par Sylvain LEMBELEMBE",
    corpsEtat: "Menuiseries extérieures",
    siretArtisan: "",
    decennaleArtisan: "",
    contactArtisan: "Sylvain LEMBELEMBE — 06 10 59 68 98",
    adresseArtisan: "",
    lot: `${TITRE_OUSSARA}. Avenant client ${OUSSARA_DEVIS_NUMERO}. Le montant de sous-traitance n'est pas figé : il est confirmé par Sylvain LEMBELEMBE avant envoi à l'artisan.`,
    modalite: MODALITE_FORFAIT,
    montantHt: 0,
    statut: "attente",
  };
}

export function saisieOussaraCombles(): SaisieBonCommande {
  return {
    numero: "BDC-2026-ST-OUSSARA-COMBLES-01",
    dateEmission: OUSSARA_COMBLES_DATE,
    referenceMarche: OUSSARA_COMBLES_DEVIS_NUMERO,
    client: CLIENT_OUSSARA_COMBLES.libelleSignature,
    adresse: CLIENT_OUSSARA_COMBLES.adresse,
    telephone: "",
    ville: CLIENT_OUSSARA_COMBLES.ville,
    artisan: "Réseau RGE isolation — à sélectionner par Sylvain LEMBELEMBE",
    corpsEtat: "Isolation combles",
    siretArtisan: "",
    decennaleArtisan: "",
    contactArtisan: "Sylvain LEMBELEMBE — 06 10 59 68 98",
    adresseArtisan: "",
    lot: `${TITRE_OUSSARA_COMBLES}. Le montant de sous-traitance est confirmé par Sylvain LEMBELEMBE avant envoi à l'artisan.`,
    modalite: MODALITE_FORFAIT,
    montantHt: 0,
    statut: "attente",
  };
}

function estMarcheOussaraCombles(marche?: MarcheCommandable | null): boolean {
  if (!marche) return false;
  if (marche.id === OUSSARA_COMBLES_DOSSIER_ID) return true;
  if (marche.ref === OUSSARA_COMBLES_DEVIS_NUMERO) return true;
  return /combles/i.test(`${marche.ref || ""} ${marche.designation || ""}`);
}

function estMarcheOussara(marche?: MarcheCommandable | null): boolean {
  if (!marche) return false;
  if (estMarcheOussaraCombles(marche)) return false;
  if (marche.id === OUSSARA_DOSSIER_ID) return true;
  if (marche.ref === OUSSARA_DEVIS_NUMERO) return true;
  return /oussara|colombier/i.test(`${marche.nom || ""} ${marche.ref || ""} ${marche.designation || ""} ${marche.adresse || ""}`);
}

function estContexteMasson(texte: string): boolean {
  const indice = texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return indice.includes("masson") || indice.includes("kristell") || indice.includes(BDC_MASSON_REFERENCE.toLowerCase());
}

export function saisiePourMarche(marche?: MarcheCommandable | null, date = dateDuJourIso()): SaisieBonCommande {
  if (estMarcheMasson(marche)) return saisieMasson();
  if (estMarcheOussaraCombles(marche)) return saisieOussaraCombles();
  if (estMarcheOussara(marche)) return saisieOussara();
  if (estMarcheCouty(marche)) return saisieCouty(date);
  if (estMarcheAbdenabi(marche)) return saisieAbdenabi(date);
  const client = (marche?.nom || "Client").trim();
  const token = tokenClient(client);
  const adresse = (marche?.adresse || "").trim();
  const lot = (marche?.designation || "").trim() || `Lot de sous-traitance — ${client}`;
  return {
    numero: `BDC-2026-ST-${token}-01`,
    dateEmission: date,
    referenceMarche: (marche?.ref || "").trim(),
    client,
    adresse,
    telephone: (marche?.telephone || "").trim(),
    ville: extraireVille(adresse),
    artisan: ARTISAN_DEFAUT,
    corpsEtat: corpsEtatDepuisTexte(`${lot} ${client}`),
    siretArtisan: "",
    decennaleArtisan: "",
    contactArtisan: "",
    adresseArtisan: "",
    lot,
    modalite: MODALITE_FORFAIT,
    montantHt: 0,
    statut: "attente",
  };
}

function propsDynamiques(props: Props): boolean {
  return (
    props.clientNom != null ||
    props.clientAdresse != null ||
    props.clientTel != null ||
    props.bdcRef != null ||
    props.marcheRef != null ||
    props.lotDescription != null ||
    props.artisanNom != null ||
    props.montantHT != null
  );
}

export function saisieDepuisProps(props: Props, date = dateDuJourIso()): SaisieBonCommande {
  if (
    estContexteMasson(
      `${props.clientNom || ""} ${props.clientVille || ""} ${props.marcheRef || ""} ${props.bdcRef || ""} ${props.dossierId || ""}`,
    )
  ) {
    return saisieMasson();
  }
  const client = (props.clientNom || "Client").trim();
  const token = tokenClient(client);
  const adresse = (props.clientAdresse || "").trim();
  const montant = Number(props.montantHT);
  return {
    numero: (props.bdcRef || `BDC-2026-ST-${token}-01`).trim(),
    dateEmission: date,
    referenceMarche: (props.marcheRef || "").trim(),
    client,
    adresse,
    telephone: (props.clientTel || "").trim(),
    ville: (props.clientVille || "").trim() || extraireVille(adresse),
    artisan: (props.artisanNom || ARTISAN_DEFAUT).trim(),
    corpsEtat: (props.artisanCorpsEtat || "").trim(),
    siretArtisan: "",
    decennaleArtisan: "",
    contactArtisan: (props.artisanContact || "").trim(),
    adresseArtisan: "",
    lot: (props.lotDescription || "").trim() || `Lot de sous-traitance — ${client}`,
    modalite: MODALITE_FORFAIT,
    montantHt: Number.isFinite(montant) && montant > 0 ? round2(montant) : 0,
    statut: "attente",
  };
}

/** Bon de commande prérempli depuis une fiche lead courtier. Couty garde son marché officiel. */
export function commandeDepuisLead(lead?: LeadCommandable | null): Required<
  Pick<
    Props,
    | "clientNom"
    | "clientAdresse"
    | "clientTel"
    | "clientVille"
    | "marcheRef"
    | "bdcRef"
    | "lotDescription"
    | "artisanNom"
    | "artisanCorpsEtat"
    | "montantHT"
    | "photos"
    | "dossierId"
  >
> {
  const indice = `${lead?.prenom || ""} ${lead?.nomFamille || ""} ${lead?.nom || ""} ${lead?.ville || ""} ${lead?.region || ""} ${lead?.notes || ""} ${lead?.typeTravaux || ""} ${lead?.typeProjet || ""} ${lead?.reference || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (indice.includes("masson") || indice.includes("kristell")) {
    return {
      clientNom: CLIENT_MASSON.libelleSignature,
      clientAdresse: "176 Rue Bossuet, Bâtiment Orion 5, 83000 Toulon",
      clientTel: CLIENT_MASSON.telephone,
      clientVille: "Toulon",
      marcheRef: MASSON_REFERENCE,
      bdcRef: BDC_MASSON_REFERENCE,
      lotDescription: LOT_BDC_MASSON,
      artisanNom: "Entreprise BMI — Mohamed BENAOUDA",
      artisanCorpsEtat: "PAC / Chauffage",
      montantHT: SOUS_TRAITANCE_MASSON.montantHt,
      photos: [],
      dossierId: MASSON_DOSSIER_ID,
    };
  }
  if (indice.includes("abdenabi") || indice.includes("beloucif")) {
    return {
      clientNom: ABDENABI_CLIENT_BDC,
      clientAdresse: ABDENABI_ADRESSE_RUE,
      clientTel: "",
      clientVille: ABDENABI_CP_VILLE,
      marcheRef: ABDENABI_DEVIS,
      bdcRef: ABDENABI_BDC,
      lotDescription: ABDENABI_PRESTATION_BDC,
      artisanNom: ABDENABI_SOUS_TRAITANT,
      artisanCorpsEtat: ABDENABI_CORPS_ETAT,
      montantHT: ABDENABI_ST_HT,
      photos: [],
      dossierId: ABDENABI_ID,
    };
  }
  if (indice.includes("couty") || indice.includes("mably") || indice.includes("main courante")) {
    return {
      clientNom: CLIENT_COUTY.libelleSignature,
      clientAdresse: CLIENT_COUTY.adresse,
      clientTel: CLIENT_COUTY.telephone,
      clientVille: CLIENT_COUTY.ville,
      marcheRef: COUTY_ESCALIER_CONTRAT_NUMERO,
      bdcRef: "BDC-2026-ST-COUTY-01",
      lotDescription: LOT_MENUISERIE_COUTY,
      artisanNom: ARTISAN_DEFAUT,
      artisanCorpsEtat: CORPS_ETAT_DEFAUT_COUTY,
      montantHT: MONTANT_HT_COUTY,
      photos: photosCouty(),
      dossierId: COUTY_ESCALIER_DOSSIER_ID,
    };
  }
  const prenom = (lead?.prenom || "").trim();
  const nomFamille = (lead?.nomFamille || "").trim();
  const clientNom =
    (prenom && nomFamille.toLowerCase().startsWith(prenom.toLowerCase())
      ? nomFamille
      : [prenom, nomFamille].filter(Boolean).join(" ").trim()) || (lead?.nom || "Client").trim();
  const ville = (lead?.ville || lead?.region || "").trim();
  const adresse = (lead?.adresse || lead?.address || ville).trim();
  const travaux = (lead?.typeTravaux || lead?.typeProjet || "").trim();
  const ht = Number(lead?.montantHt);
  return {
    clientNom,
    clientAdresse: adresse,
    clientTel: (lead?.telephone || "").trim(),
    clientVille: extraireVille(adresse, ville),
    marcheRef: referenceMarcheLead(lead?.reference),
    bdcRef: `BDC-2026-ST-${tokenClient(clientNom)}-01`,
    lotDescription: travaux || `Lot de sous-traitance — ${clientNom}`,
    artisanNom: ARTISAN_DEFAUT,
    artisanCorpsEtat: corpsEtatDepuisTexte(travaux),
    montantHT: Number.isFinite(ht) && ht > 0 ? round2(ht) : 0,
    photos: [],
    dossierId: lead?.id || tokenClient(clientNom),
  };
}

function dossierEstCouty(saisie: Pick<SaisieBonCommande, "numero" | "client" | "referenceMarche" | "ville">, marche?: MarcheCommandable | null): boolean {
  if (estMarcheCouty(marche)) return true;
  const indice = `${saisie.numero} ${saisie.client} ${saisie.referenceMarche} ${saisie.ville}`.toLowerCase();
  return indice.includes("couty") || indice.includes("main-courante") || indice.includes("mably");
}

function bornerPhotos(photos: PhotoChantier[]): PhotoChantier[] {
  const avant = photos.filter((photo) => photo.phase !== "apres").slice(0, MAX_PHOTOS);
  const apres = photos.filter((photo) => photo.phase === "apres").slice(0, 2);
  return [...avant, ...apres];
}

function photosInitiales(cle: string, props: Props, couty: boolean): PhotoChantier[] {
  const depuisProps = props.photos && props.photos.length ? bornerPhotos(props.photos) : null;
  if (depuisProps?.some((photo) => photo.phase === "apres")) return depuisProps;
  const stockees = lirePhotos(cle);
  if (stockees) return stockees;
  if (depuisProps) return depuisProps;
  if (couty) return photosCouty();
  return [];
}

function lireStatut(numero: string): StatutCommandeArtisan | null {
  try {
    const valeur = sessionStorage.getItem(`energia-bdc-artisan:${numero}`);
    return valeur === "attente" || valeur === "valide" ? valeur : null;
  } catch {
    return null;
  }
}

function ecrireStatut(numero: string, statut: StatutCommandeArtisan) {
  try {
    sessionStorage.setItem(`energia-bdc-artisan:${numero}`, statut);
  } catch {
    /* session indisponible */
  }
}

function champOuTiret(valeur: string, libelle: string): string {
  const texte = valeur.trim();
  return texte ? `${libelle} : ${texte}` : `${libelle} : —`;
}

export default function BonDeCommandeArtisanModal({
  ouvert,
  onFermer,
  marche = null,
  clientNom,
  clientAdresse,
  clientTel,
  clientVille,
  marcheRef,
  bdcRef,
  lotDescription,
  artisanNom,
  artisanCorpsEtat,
  artisanContact,
  montantHT,
  photos: photosProps,
  dossierId,
}: Props) {
  const champs: Props = {
    ouvert,
    onFermer,
    marche,
    clientNom,
    clientAdresse,
    clientTel,
    clientVille,
    marcheRef,
    bdcRef,
    lotDescription,
    artisanNom,
    artisanCorpsEtat,
    artisanContact,
    montantHT,
    photos: photosProps,
    dossierId,
  };
  const [saisie, setSaisie] = useState<SaisieBonCommande>(() =>
    propsDynamiques(champs) ? saisieDepuisProps(champs) : saisiePourMarche(marche),
  );
  const [photos, setPhotos] = useState<PhotoChantier[]>([]);
  const clePhotosRef = useRef("");
  const inputPhotosRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    const prochaine = propsDynamiques(champs) ? saisieDepuisProps(champs) : saisiePourMarche(marche);
    const statutMemoire = lireStatut(prochaine.numero);
    const cle = clePhotos(prochaine.numero, dossierId);
    clePhotosRef.current = cle;
    setSaisie(statutMemoire ? { ...prochaine, statut: statutMemoire } : prochaine);
    setPhotos(photosInitiales(cle, champs, dossierEstCouty(prochaine, marche)));
  }, [
    ouvert,
    marche?.id,
    marche?.nom,
    marche?.ref,
    marche?.adresse,
    marche?.designation,
    marche?.telephone,
    clientNom,
    clientAdresse,
    clientTel,
    clientVille,
    marcheRef,
    bdcRef,
    lotDescription,
    artisanNom,
    artisanCorpsEtat,
    artisanContact,
    montantHT,
    dossierId,
  ]);

  useEffect(() => {
    if (!ouvert) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onFermer();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [ouvert, onFermer]);

  const invalide = !saisie.client.trim() || !saisie.numero.trim() || !(saisie.montantHt > 0) || !saisie.lot.trim();

  function maj<K extends keyof SaisieBonCommande>(cle: K, valeur: SaisieBonCommande[K]) {
    setSaisie((prev) => {
      const next = { ...prev, [cle]: valeur };
      if (cle === "statut" && typeof valeur === "string") ecrireStatut(next.numero, valeur);
      if (cle === "numero" && typeof valeur === "string") {
        const memoire = lireStatut(valeur);
        if (memoire) next.statut = memoire;
      }
      return next;
    });
  }

  function enregistrerPhotos(suivantes: PhotoChantier[]) {
    const bornees = suivantes.slice(0, MAX_PHOTOS);
    setPhotos(bornees);
    if (clePhotosRef.current) ecrirePhotos(clePhotosRef.current, bornees);
  }

  async function ajouterFichiers(liste: FileList | File[] | null) {
    if (!liste) return;
    const images = [...liste].filter((fichier) => fichier.type.startsWith("image/"));
    const places = MAX_PHOTOS - photos.length;
    if (places <= 0 || images.length === 0) return;
    const ajouts: PhotoChantier[] = [];
    for (const fichier of images.slice(0, places)) {
      try {
        const src = await compresserImage(fichier);
        if (src) ajouts.push({ src, legende: "" });
      } catch {
        /* fichier ignoré */
      }
    }
    if (ajouts.length) enregistrerPhotos([...photos, ...ajouts]);
  }

  if (!ouvert || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="bdc-artisan-overlay fixed inset-0 z-[97] flex flex-col bg-[#102a43] lg:flex-row"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bdc-artisan-titre"
      data-testid="modal-bdc-artisan"
    >
      <style>{PRINT_CSS_BDC}</style>

      <aside className="bdc-artisan-noprint flex max-h-[46vh] w-full shrink-0 flex-col overflow-y-auto border-b border-white/10 lg:max-h-none lg:w-[440px] lg:border-b-0 lg:border-r">
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f9c74f]">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              Sous-traitance BTP
            </p>
            <h2 id="bdc-artisan-titre" className="mt-1 text-xl font-semibold text-white">
              Bon de commande artisan
            </h2>
            <p className="mt-1 text-sm text-slate-300">Forfait clé en main, éditable avant impression.</p>
          </div>
          <button
            type="button"
            onClick={onFermer}
            className="rounded-lg border border-white/15 px-2.5 py-1 text-sm text-slate-200 hover:bg-white/10"
            aria-label="Fermer le bon de commande"
          >
            Fermer
          </button>
        </div>

        <form
          className="space-y-5 px-5 pb-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!invalide) window.print();
          }}
        >
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-[#2d8a4e]">Commande</legend>
            <label className="block text-xs text-slate-300">
              N° commande
              <input className={inputClass} value={saisie.numero} onChange={(event) => maj("numero", event.target.value)} />
            </label>
            <label className="block text-xs text-slate-300">
              Date d&apos;émission
              <input
                type="date"
                className={inputClass}
                value={saisie.dateEmission}
                onChange={(event) => maj("dateEmission", event.target.value)}
              />
            </label>
            <label className="block text-xs text-slate-300">
              Réf. marché lié
              <input
                className={inputClass}
                value={saisie.referenceMarche}
                onChange={(event) => maj("referenceMarche", event.target.value)}
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-[#2d8a4e]">Chantier</legend>
            <label className="block text-xs text-slate-300">
              Client
              <input className={inputClass} value={saisie.client} onChange={(event) => maj("client", event.target.value)} />
            </label>
            <label className="block text-xs text-slate-300">
              Adresse
              <textarea
                className={`${inputClass} min-h-16 resize-y`}
                value={saisie.adresse}
                onChange={(event) => maj("adresse", event.target.value)}
              />
            </label>
            <label className="block text-xs text-slate-300">
              Téléphone client
              <input
                className={inputClass}
                value={saisie.telephone}
                onChange={(event) => maj("telephone", event.target.value)}
              />
            </label>
            <label className="block text-xs text-slate-300">
              Ville
              <input className={inputClass} value={saisie.ville} onChange={(event) => maj("ville", event.target.value)} />
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-[#2d8a4e]">Sous-traitant</legend>
            <label className="block text-xs text-slate-300">
              Raison sociale
              <input className={inputClass} value={saisie.artisan} onChange={(event) => maj("artisan", event.target.value)} />
            </label>
            <label className="block text-xs text-slate-300">
              Corps d&apos;état
              <input
                className={inputClass}
                value={saisie.corpsEtat}
                onChange={(event) => maj("corpsEtat", event.target.value)}
                placeholder="Menuisier, électricien…"
              />
            </label>
            <label className="block text-xs text-slate-300">
              {saisie.siretArtisan.replace(/\D/g, "").length === 9 ? "SIREN" : "SIRET"}
              <input
                className={inputClass}
                value={saisie.siretArtisan}
                onChange={(event) => maj("siretArtisan", event.target.value)}
                placeholder="À compléter"
              />
            </label>
            <label className="block text-xs text-slate-300">
              Adresse
              <input
                className={inputClass}
                value={saisie.adresseArtisan}
                onChange={(event) => maj("adresseArtisan", event.target.value)}
                placeholder="Adresse de l'artisan"
              />
            </label>
            <label className="block text-xs text-slate-300">
              N° décennale
              <input
                className={inputClass}
                value={saisie.decennaleArtisan}
                onChange={(event) => maj("decennaleArtisan", event.target.value)}
                placeholder="À compléter"
              />
            </label>
            <label className="block text-xs text-slate-300">
              Contact
              <input
                className={inputClass}
                value={saisie.contactArtisan}
                onChange={(event) => maj("contactArtisan", event.target.value)}
                placeholder="Nom, téléphone, e-mail"
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-[#2d8a4e]">Lot</legend>
            <label className="block text-xs text-slate-300">
              Spécifications
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                value={saisie.lot}
                onChange={(event) => maj("lot", event.target.value)}
              />
            </label>
            <label className="block text-xs text-slate-300">
              Modalité
              <input className={inputClass} value={saisie.modalite} onChange={(event) => maj("modalite", event.target.value)} />
            </label>
            <label className="block text-xs text-slate-300">
              Montant HT
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={Number.isFinite(saisie.montantHt) ? saisie.montantHt : ""}
                onChange={(event) => maj("montantHt", event.target.value === "" ? 0 : Number(event.target.value))}
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-[#2d8a4e]">Repérage photographique</legend>
            <button
              type="button"
              data-testid="bouton-photos-chantier"
              onClick={() => inputPhotosRef.current?.click()}
              className="inline-flex w-full items-center justify-center rounded-xl border border-dashed border-[#f9c74f]/70 bg-white/5 px-3 py-3 text-sm font-semibold text-[#f9c74f] hover:bg-white/10"
            >
              📷 Ajouter / Modifier les photos de ce chantier
            </button>
            <div
              data-testid="zone-photos-chantier"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void ajouterFichiers(event.dataTransfer.files);
              }}
              className="rounded-xl border border-dashed border-white/20 px-3 py-3 text-center text-xs text-slate-300"
            >
              Glisser-déposer jusqu&apos;à {MAX_PHOTOS} photos — {photos.length}/{MAX_PHOTOS}
              <input
                ref={inputPhotosRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => {
                  void ajouterFichiers(event.target.files);
                  event.target.value = "";
                }}
              />
            </div>
            {photos.length > 0 ? (
              <ul className="space-y-2">
                {photos.map((photo, index) => (
                  <li key={`${index}-${photo.src.slice(0, 24)}`} className="flex items-center gap-2">
                    <img src={photo.src} alt="" className="h-10 w-14 rounded object-cover" />
                    <span className="min-w-0 flex-1 truncate text-xs text-slate-200">
                      Photo {index + 1}
                      {photo.legende ? ` — ${photo.legende}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => enregistrerPhotos(photos.filter((_, i) => i !== index))}
                      className="text-xs text-rose-200 hover:text-white"
                    >
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Sans photo, l&apos;impression reste sur une seule page.</p>
            )}
          </fieldset>

          <div className="rounded-2xl border border-[#f9c74f]/40 bg-[#1a5c2e]/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f9c74f]">Net à régler à l&apos;artisan</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-white" data-testid="bdc-artisan-net">
              {euro(round2(saisie.montantHt || 0))} HT
            </p>
            <p className="mt-1 text-xs text-slate-200">TVA 0 % — autoliquidation art. 283-2 nonies du CGI</p>
            <button
              type="submit"
              disabled={invalide}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a5c2e] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#2d8a4e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer className="h-4 w-4" aria-hidden />
              Imprimer / enregistrer en PDF
            </button>
          </div>
        </form>
      </aside>

      <div className="min-h-0 flex-1 overflow-auto bg-slate-200">
        <div className="bdc-artisan-noprint sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-white/95 px-4 py-3">
          <p className="text-sm font-medium text-[#102a43]">Aperçu A4 — bon de commande sous-traitance</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={invalide}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1a5c2e] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2d8a4e] disabled:opacity-50"
            >
              <Printer className="h-4 w-4" aria-hidden />
              Imprimer
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={invalide}
              title="Dans la fenêtre d'impression, choisir Enregistrer au format PDF"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1a5c2e] bg-white px-3 py-2 text-sm font-semibold text-[#1a5c2e] hover:bg-emerald-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" aria-hidden />
              PDF
            </button>
          </div>
        </div>
        <div className="bdc-artisan-dossier flex flex-col items-center gap-8 px-4 py-6">
          <FeuilleCommande
            saisie={saisie}
            suite={photos.length > 0}
            onBasculerStatut={() => maj("statut", saisie.statut === "valide" ? "attente" : "valide")}
          />
          {photos.length > 0 ? (
            <AnnexePhotos
              saisie={saisie}
              photos={photos}
              onLegende={(index, legende) => {
                const suivantes = photos.map((photo, i) => (i === index ? { ...photo, legende } : photo));
                enregistrerPhotos(suivantes);
              }}
            />
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function FeuilleCommande({
  saisie,
  suite,
  relais = false,
  ancre,
  onBasculerStatut,
}: {
  saisie: SaisieBonCommande;
  suite: boolean;
  relais?: boolean;
  ancre?: string;
  onBasculerStatut: () => void;
}) {
  const valide = saisie.statut === "valide";
  const montantHt = round2(saisie.montantHt || 0);
  const rue = saisie.adresse.trim();
  const ville = saisie.ville.trim();
  const adresseLieu = ville && !rue.includes(ville) ? [rue, ville].filter(Boolean).join(", ") : rue || ville;
  const detailsLieu = [adresseLieu, saisie.telephone.trim() ? `Tél : ${saisie.telephone.trim()}` : ""]
    .filter(Boolean)
    .join(" • ");
  const lieu =
    saisie.numero === BDC_MASSON_REFERENCE
      ? "Chantier Mme Kristell MASSON — 176 Rue Bossuet, Bâtiment Orion 5, 83000 Toulon"
      : detailsLieu
        ? `Chantier ${saisie.client || "—"} (${detailsLieu}).`
        : `Chantier ${saisie.client || "—"}.`;
  const cellule = "border border-[#cbd5e1] px-[1.6mm] py-[1.3mm] align-top";

  return (
    <article
      id={ancre || "bdc-artisan-a4"}
      data-testid="bdc-artisan-a4"
      className={`bdc-artisan-a4 page-1 mx-auto flex w-[210mm] max-w-full flex-col bg-white px-[11mm] pt-[9mm] pb-[7mm] text-[#0B1F3A] shadow-[0_12px_40px_rgba(11,31,58,0.16)] ${suite || relais ? "" : "page-1-seule"}`}
    >
      <header className="border-b-[3px] border-[#059669] pb-[2mm]">
        <div className="flex items-start justify-between gap-[5mm]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[3.2mm]">
              <img
                src="/logo-energia.png"
                alt="Logo ENERGIA CONSEIL IA®"
                className="bdc-artisan-logo h-[12mm] w-auto shrink-0 object-contain object-left"
              />
              <div className="min-w-0">
                <p className="text-[12pt] font-extrabold leading-none tracking-[0.02em] text-[#059669]">ENERGIA CONSEIL IA®</p>
                <p className="mt-[0.6mm] text-[7pt] leading-snug text-[#475569]">
                  {BRANDING.slogan} · Marque déposée INPI n° {BRANDING.inpi}
                </p>
              </div>
            </div>
            <p className="mt-[1.4mm] text-[7pt] leading-[1.3] text-[#475569]">
              {BRANDING.forme} au capital de {BRANDING.capital} — {BRANDING.siege}
              <br />
              SIRET {BRANDING.siretAffiche} — RCS {BRANDING.rcsAffiche} — TVA {BRANDING.tva} — APE {BRANDING.ape}
              <br />
              {ASSURANCE_FACTURE}
              <br />
              Direction &amp; Contractant Général : Sylvain LEMBELEMBE — {BRANDING.telephone} — {BRANDING.email}
            </p>
          </div>
          <aside className="w-[64mm] shrink-0 border border-[#0B1F3A] px-[2.6mm] py-[1.8mm] text-[7.5pt] leading-snug text-[#475569]">
            <p className="text-[7pt] font-extrabold uppercase tracking-[0.08em] text-[#0B1F3A]">N° Commande</p>
            <p className="mt-[0.4mm] text-[9.5pt] font-extrabold leading-tight text-[#0B1F3A]">{saisie.numero || "—"}</p>
            <p className="mt-[1.2mm]">Date d&apos;émission : {dateLongue(saisie.dateEmission)}</p>
            <p>Réf. marché lié : {saisie.referenceMarche || "—"}</p>
            <button
              type="button"
              onClick={onBasculerStatut}
              className={`bdc-artisan-statut mt-[1.2mm] inline-flex items-center gap-1 border px-[1.4mm] py-[0.5mm] text-[7pt] font-semibold ${
                valide ? "border-[#059669] text-[#065f46]" : "border-[#cbd5e1] text-[#0B1F3A]"
              }`}
            >
              {valide ? <CheckCircle2 className="h-3 w-3" aria-hidden /> : <PenLine className="h-3 w-3" aria-hidden />}
              {valide ? "Validé" : "En attente signature artisan"}
            </button>
          </aside>
        </div>
        <h1 className="mt-[2.4mm] border-b-2 border-[#059669] pb-[1mm] text-center text-[10pt] font-extrabold uppercase tracking-[0.02em] text-[#0B1F3A]">
          Bon de commande de sous-traitance BTP — forfait clé en main
        </h1>
      </header>

      <section className="mt-[2.6mm]">
        <h2 className="border-b border-[#059669]/40 pb-[0.8mm] text-[9.5pt] font-extrabold text-[#059669]">
          I. Identification des parties
        </h2>
        <table className="mt-[1.6mm] w-full border-collapse text-[7.5pt]">
          <thead>
            <tr className="bdc-artisan-entete bg-[#1a5c2e] text-left text-white">
              <th className="w-1/2 border border-[#1a5c2e] px-[2.2mm] py-[1.2mm] font-semibold">Donneur d&apos;ordre</th>
              <th className="w-1/2 border border-[#1a5c2e] px-[2.2mm] py-[1.2mm] font-semibold">Sous-traitant assigné</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#cbd5e1] px-[2.2mm] py-[1.4mm] leading-snug text-[#334155]">
                <strong className="text-[#0B1F3A]">{BRANDING.nom}</strong>
                <br />
                {BRANDING.forme} au capital de {BRANDING.capital}
                <br />
                SIRET {BRANDING.siret}
                <br />
                {BRANDING.siege}
                <br />
                Assurance Décennale : Calipso Assurances n° LUNPIB2604975
                <br />
                Direction : Sylvain LEMBELEMBE ({BRANDING.telephone}) — {BRANDING.email}
              </td>
              <td className="border border-[#cbd5e1] px-[2.2mm] py-[1.4mm] leading-snug text-[#334155]">
                {saisie.adresseArtisan.trim() ? (
                  <>
                    <strong className="text-[#0B1F3A]">Raison sociale :</strong> {saisie.artisan}
                    <br />
                    <strong>SIREN :</strong> {saisie.siretArtisan}
                    <br />
                    <strong>Adresse :</strong> {saisie.adresseArtisan}
                    <br />
                    <strong>Assurance Décennale :</strong> {saisie.decennaleArtisan}
                    <br />
                    <strong>Contact :</strong> {saisie.contactArtisan}
                  </>
                ) : (
                  <>
                    <strong className="text-[#0B1F3A]">{saisie.artisan || ARTISAN_DEFAUT}</strong>
                    {saisie.corpsEtat.trim() ? (
                      <>
                        <br />
                        Corps d&apos;état : {saisie.corpsEtat.trim()}
                      </>
                    ) : null}
                    <br />
                    {champOuTiret(saisie.siretArtisan, "SIRET")}
                    <br />
                    {champOuTiret(saisie.decennaleArtisan, "N° Décennale")}
                    <br />
                    {champOuTiret(saisie.contactArtisan, "Contact")}
                  </>
                )}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mt-[1.6mm] border border-[#cbd5e1]">
          <p className="bdc-artisan-entete bg-[#1a5c2e] px-[2.2mm] py-[1.1mm] text-[7.5pt] font-semibold text-white">
            Lieu d&apos;exécution
          </p>
          <p className="px-[2.2mm] py-[1.3mm] text-[7.5pt] leading-snug text-[#334155]">{lieu}</p>
        </div>
      </section>

      <section className="mt-[2.6mm]">
        <h2 className="border-b border-[#059669]/40 pb-[0.8mm] text-[9.5pt] font-extrabold text-[#059669]">
          II. Prestations sous-traitées
        </h2>
        <table className="mt-[1.6mm] w-full border-collapse text-[7.2pt]">
          <thead>
            <tr className="bdc-artisan-entete bg-[#0B1F3A] text-left text-[6.5pt] uppercase tracking-wide text-white">
              <th className={`${cellule} w-[8mm] border-[#0B1F3A] font-semibold`}>N°</th>
              <th className={`${cellule} border-[#0B1F3A] font-semibold`}>Lot &amp; spécifications techniques</th>
              <th className={`${cellule} w-[42mm] border-[#0B1F3A] font-semibold`}>Modalité</th>
              <th className={`${cellule} w-[24mm] border-[#0B1F3A] text-right font-semibold`}>Montant HT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${cellule} text-right font-bold text-[#059669]`}>1</td>
              <td className={`${cellule} leading-snug text-[#334155]`}>{saisie.lot}</td>
              <td className={`${cellule} leading-snug`}>{saisie.modalite}</td>
              <td className={`${cellule} text-right font-semibold tabular-nums`}>{euro(montantHt)}</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-[2mm] border-l-4 border-[#059669] bg-[#ecfdf5] px-[2.4mm] py-[1.4mm] text-[7.2pt] leading-snug text-[#14532d]">
          {MENTION_AUTOLIQUIDATION}
        </p>
        <div className="mt-[2mm] ml-auto w-[78mm] border border-[#0B1F3A] text-[8pt]">
          <div className="bdc-artisan-entete flex items-center justify-between gap-3 bg-[#0B1F3A] px-[3mm] py-[1.6mm] font-extrabold text-white">
            <span>Total net à régler à l&apos;artisan</span>
            <span data-testid="bdc-artisan-total" className="tabular-nums">
              {euro(montantHt)} HT
            </span>
          </div>
        </div>
      </section>

      <section className="mt-[2.6mm] border border-[#0B1F3A] px-[2.6mm] py-[1.8mm] text-[7.4pt] leading-snug text-[#334155]">
        {saisie.numero === BDC_MASSON_REFERENCE ? (
          <p className="whitespace-pre-line text-[#0B1F3A]">{conditionsBdcMasson()}</p>
        ) : (
          <>
            <p className="font-extrabold text-[#0B1F3A]">Conditions de règlement &amp; exigences Sûreté-6™</p>
            <p className="mt-[1mm]">
              {saisie.numero === ABDENABI_BDC
                ? "Règlement sous 48 h strict après PV de réception sans réserve signé par le client."
                : "Règlement à 100 % par virement sous 48 h après fourniture de la facture artisan accompagnée du procès-verbal de réception de chantier signé sans réserve par le client."}
            </p>
            <p className="mt-[1mm]">
              Obligation impérative : fourniture de l&apos;attestation d&apos;assurance Décennale et RC Pro en cours de validité
              avant démarrage.
            </p>
          </>
        )}
      </section>

      <section className="mt-[2.6mm] grid grid-cols-2 gap-[3mm]">
        <div className="flex min-h-[28mm] flex-col border border-slate-300 px-[2.6mm] py-[1.8mm]">
          <p className="text-[6.5pt] font-semibold uppercase tracking-[0.12em] text-[#64748b]">Pour ENERGIA CONSEIL IA®</p>
          <p className="mt-[1mm] text-[7.5pt] leading-snug text-[#0B1F3A]">
            Sylvain LEMBELEMBE — Direction &amp; Contractant Général
          </p>
          <p className="mt-[1.2mm] text-[7.5pt] font-semibold text-[#0B1F3A]">« Bon pour commande et exécution »</p>
          <p className="mt-auto pt-[3mm] text-[7pt] text-[#94a3b8]">Cachet et signature</p>
        </div>
        <div className="flex min-h-[28mm] flex-col border-2 border-[#059669] px-[2.6mm] py-[1.8mm]">
          <p className="text-[6.5pt] font-semibold uppercase tracking-[0.12em] text-[#059669]">Pour l&apos;artisan sous-traitant</p>
          <p className="mt-[1mm] text-[7.5pt] font-semibold text-[#0B1F3A]">{saisie.artisan || ARTISAN_DEFAUT}</p>
          <p className="mt-[1mm] text-[7.5pt] font-semibold text-[#0B1F3A]">« Bon pour accord et acceptation de la commande »</p>
          <p className="mt-[1.4mm] text-[7.2pt] text-[#475569]">
            Fait à ____________________ le {dateCourte(saisie.dateEmission)}
          </p>
          <p className="mt-auto pt-[3mm] text-[7pt] text-[#94a3b8]">Date, lieu et signature</p>
        </div>
      </section>

      <footer className="mt-auto border-t border-slate-200 pt-[1.6mm] text-[6.2pt] leading-snug text-[#64748b]">
        <p>{MENTION_AUTOLIQUIDATION}</p>
        <p className="mt-[0.6mm] text-[#0f172a]">
          {BRANDING.nom} — {BRANDING.forme} au capital de {BRANDING.capital} — {BRANDING.siege} — SIRET {BRANDING.siretAffiche}
        </p>
      </footer>
    </article>
  );
}

function titreAnnexe(saisie: SaisieBonCommande): string {
  const nom = (saisie.client || "Client").trim();
  const ville = (saisie.ville || extraireVille(saisie.adresse)).trim();
  return ville
    ? `Annexe technique n° 1 — Chantier ${nom} (${ville})`
    : `Annexe technique n° 1 — Chantier ${nom}`;
}

export function AnnexePhotos({
  saisie,
  photos,
  relais = false,
  ancre,
  onLegende,
}: {
  saisie: SaisieBonCommande;
  photos: PhotoChantier[];
  relais?: boolean;
  ancre?: string;
  onLegende: (index: number, legende: string) => void;
}) {
  const ville = (saisie.ville || extraireVille(saisie.adresse)).trim();
  const chantier = ville ? `${saisie.client || "—"} (${ville})` : saisie.client || "—";
  const avant = photos.filter((photo) => photo.phase !== "apres");
  const apres = photos.filter((photo) => photo.phase === "apres");
  const paires = avant
    .slice(0, 2)
    .map((photo, index) => ({ avant: photo, apres: apres[index], index }))
    .filter((paire) => paire.apres);
  return (
    <article
      id={ancre || "bdc-artisan-annexe"}
      data-testid="bdc-artisan-annexe"
      className={`bdc-artisan-a4 bdc-artisan-annexe page-2 mx-auto flex w-[210mm] max-w-full flex-col bg-white px-[11mm] pt-[9mm] pb-[8mm] text-[#0B1F3A] shadow-[0_12px_40px_rgba(11,31,58,0.16)] ${relais ? "page-2-relais" : ""}`}
    >
      <header className="flex items-center justify-between gap-[4mm] border-b border-[#059669] pb-[2mm]">
        <div className="flex min-w-0 items-center gap-[2.5mm]">
          <img
            src="/logo-energia.png"
            alt="Logo ENERGIA CONSEIL IA®"
            className="bdc-artisan-logo h-[9mm] w-auto shrink-0 object-contain object-left"
          />
          <p className="text-[8pt] font-extrabold tracking-[0.02em] text-[#059669]">ENERGIA CONSEIL IA®</p>
        </div>
        <p className="max-w-[118mm] text-right text-[7.5pt] leading-snug text-[#475569]">
          N° Commande : {saisie.numero || "—"}
          <br />
          Chantier : {chantier}
        </p>
      </header>

      <h1 className="mt-[3.5mm] border-b-2 border-[#059669] pb-[1.4mm] text-center text-[10pt] font-extrabold uppercase leading-snug tracking-[0.02em] text-[#0B1F3A]">
        {titreAnnexe(saisie)}
      </h1>

      {paires.length > 0 ? (
        <div className="mt-[3mm] space-y-[3mm]" data-testid="annexe-comparatif">
          {paires.map((paire) => (
            <div key={paire.index} className="grid grid-cols-[1fr_7mm_1fr] items-start gap-[1.5mm]">
              <figure className="min-w-0">
                <p className="text-[7pt] font-extrabold uppercase tracking-wide text-[#0B1F3A]">État initial du chantier</p>
                <div className="mt-[1mm] overflow-hidden border border-[#cbd5e1] bg-[#f8fafc]">
                  <img
                    src={paire.avant.src}
                    alt={paire.avant.legende || "État initial"}
                    className="bdc-comparatif-photo h-[128px] max-h-[128px] w-full object-cover object-center"
                  />
                </div>
                <figcaption className="mt-[1mm] text-[7pt] leading-snug text-[#334155]">{paire.avant.legende}</figcaption>
              </figure>
              <p className="pt-[16mm] text-center text-[12pt] font-bold text-[#059669]" aria-hidden>➔</p>
              <figure className="min-w-0">
                <p className="text-[7pt] font-extrabold uppercase tracking-wide text-[#059669]">Visuel objectif de finition finale</p>
                <div className="mt-[1mm] overflow-hidden border border-[#059669] bg-[#f8fafc]">
                  <img
                    src={paire.apres.src}
                    alt={paire.apres.legende || "Visuel objectif"}
                    className="bdc-comparatif-photo h-[128px] max-h-[128px] w-full object-cover object-center"
                  />
                </div>
                <figcaption className="mt-[1mm] text-[7pt] leading-snug text-[#334155]">{paire.apres.legende}</figcaption>
                <p className="mt-[1.2mm] border border-[#0B1F3A] px-[2mm] py-[1.2mm] text-[6.5pt] leading-snug text-[#334155]">
                  {MENTION_FINITION_CONTRACTUELLE}
                </p>
              </figure>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-[4mm] grid grid-cols-2 content-start gap-x-[5mm] gap-y-[4mm]">
          {(avant.length ? avant : photos).map((photo, index) => (
            <figure key={`${index}-${photo.src.slice(0, 32)}`} className="min-w-0">
              <div className="overflow-hidden border border-[#cbd5e1] bg-[#f8fafc]">
                <img
                  src={photo.src}
                  alt={photo.legende || `Photo ${index + 1}`}
                  className="bdc-artisan-photo h-[170px] max-h-[170px] w-full object-cover object-center"
                />
              </div>
              <figcaption className="mt-[1.2mm] text-[7.2pt] leading-snug text-[#334155]">
                <span className="font-semibold text-[#0B1F3A]">Photo {index + 1}. </span>
                <input
                  aria-label={`Légende photo ${index + 1}`}
                  className="bdc-legende-saisie mt-0.5 w-full border-0 bg-transparent p-0 text-[7.2pt] text-[#334155] outline-none focus:border-b focus:border-[#059669]"
                  value={photo.legende}
                  placeholder="Légende du repérage"
                  onChange={(event) => onLegende(index, event.target.value)}
                />
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <p className="mt-[3mm] border border-[#0B1F3A] px-[3mm] py-[2mm] text-[7.4pt] leading-snug text-[#334155]">
        {NOTE_ANNEXE_COUTY}
      </p>
    </article>
  );
}
