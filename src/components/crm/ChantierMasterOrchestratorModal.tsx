/**
 * Orchestrateur maître — Contractant Général ENERGIA CONSEIL IA®.
 * Cinq onglets : dossier, vente, dispatch BTP, bons de commande, réception.
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ABDENABI_BDC,
  ABDENABI_CHANTIER,
  ABDENABI_CONCURRENT,
  ABDENABI_DEVIS,
  ABDENABI_FICHE_COMMISSION,
  ABDENABI_ID,
  ABDENABI_LIGNES_VENTE,
  ABDENABI_LOTS_SOUS_TRAITANCE,
  ABDENABI_NOTE_SYNTHESE,
  ABDENABI_ST_HT,
  ABDENABI_VENTE_TTC,
} from "../../data/chantiers";
import { BRANDING } from "../../lib/branding";
import { CLIENT_COUTY, COUTY_ESCALIER_CONTRAT_NUMERO } from "../../lib/crm/coutyEscalierOfficiel";
import { MENTION_AUTOLIQUIDATION } from "./BonDeCommandeArtisanModal";
import FactureAcompteModal, { euro, round2, type TauxTvaFacture, type TypeAppelFonds } from "./FactureAcompteModal";

export type LotId = "gros-oeuvre" | "clos-couvert" | "isolation" | "fluides" | "finitions";
type Phase = "avant" | "apres";
type Taux = TauxTvaFacture;

type Photo = {
  id: string;
  src: string;
  legende: string;
  phase: Phase;
  lotId: LotId | "";
};

type Lot = {
  id: LotId;
  ordre: number;
  titre: string;
  actif: boolean;
  artisan: string;
  contact: string;
  siret: string;
  assurance: string;
  police: string;
  echeance: string;
  dateIntervention: string;
  dureeJours: number;
  montantHt: number;
  designation: string;
  marque: string;
  modele: string;
  references: string;
  certifications: string;
  schema: string;
};

type LigneVente = { ordre: number; designation: string; montantHt: number };

type BdcDossier = {
  reference: string;
  destinataire: string;
  lots: readonly string[];
  montantHt: number;
  conditions: readonly string[];
  regime: string;
  prestation?: string;
  adresseChantier?: string;
};

type ApporteurDossier = {
  nom: string;
  societe: string;
  siret: string;
  adresse: string;
  convention: string;
  dateSignature: string;
  referenceFiche: string;
  statut: string;
  articleTaux: string;
  articleEcheancier: string;
  tauxPct: number;
  assietteHt: number;
  commissionHt: number;
  jalonHt: number;
  conditionPaiement: string;
};

type Dossier = {
  id: string;
  client: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone: string;
  email: string;
  dateDemarrage: string;
  reference: string;
  venteTtc: number;
  tauxTva: Taux;
  commissionPct: number;
  lienStripe: string;
  photos: Photo[];
  lots: Lot[];
  pvSigne: boolean;
  noteMarge: string;
  objet?: string;
  dateLibelle?: string;
  validiteJours?: number;
  batiment?: string;
  lignesVente?: readonly LigneVente[];
  bdc?: BdcDossier;
  apporteur?: ApporteurDossier;
  ecartConcurrent?: string;
};

type LeadMaster = {
  id?: string;
  prenom?: string;
  nomFamille?: string;
  nom?: string;
  ville?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  typeTravaux?: string;
  notes?: string;
  budget?: number | string | null;
};

type DocumentImprime =
  | { type: "devis" }
  | { type: "cerfa" }
  | { type: "pv" }
  | { type: "bdc"; lotId: LotId }
  | { type: "liasse" }
  | { type: "commission" };

type Props = {
  ouvert: boolean;
  onFermer: () => void;
  lead?: LeadMaster | null;
  presetId?: string | null;
};

const STORAGE = "energia-chantier-master-v1";
const LOGO = "/logo-energia.png";
const AUJOURDHUI = "2026-10-17";
const CERFA_1301_SD = "/cerfa-1301-sd.pdf";

const ORDRE: { id: LotId; ordre: number; titre: string }[] = [
  { id: "gros-oeuvre", ordre: 1, titre: "Gros œuvre / Démolition / Dalle béton / IPN / Terrassement" },
  { id: "clos-couvert", ordre: 2, titre: "Clos & couvert / Charpente / Couverture / Menuiseries extérieures" },
  { id: "isolation", ordre: 3, titre: "Isolation thermique (combles / murs) / Plâtrerie / Faux-plafonds" },
  { id: "fluides", ordre: 4, titre: "Réseaux fluides / Chauffage PAC / Plomberie / Électricité générale" },
  { id: "finitions", ordre: 5, titre: "Second œuvre / Finitions / Peinture / Cuisine / Équipements PMR" },
];

const PRINT_CSS = `
  @media print {
    @page { size: A4 portrait; margin: 0; }
    html, body { background: white !important; margin: 0 !important; padding: 0 !important; height: auto !important; }
    body * { visibility: hidden !important; }
    body > *:not(#printable-document) { display: none !important; }
    #printable-document, #printable-document * { visibility: visible !important; }
    body > #printable-document {
      display: block !important;
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 210mm !important;
      background: white !important;
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
    }
    .print-page {
      height: auto !important;
      max-height: 285mm !important;
      page-break-after: always !important;
      break-after: page !important;
      box-sizing: border-box !important;
      padding: 10mm !important;
      overflow: hidden !important;
      background: white !important;
    }
    .print-page-fin {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    .master-noprint { display: none !important; }
  }
`;

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#f9c74f]";

function lotVide(def: (typeof ORDRE)[number]): Lot {
  return {
    id: def.id,
    ordre: def.ordre,
    titre: def.titre,
    actif: false,
    artisan: "",
    contact: "",
    siret: "",
    assurance: "",
    police: "",
    echeance: "",
    dateIntervention: "",
    dureeJours: 5,
    montantHt: 0,
    designation: "",
    marque: "",
    modele: "",
    references: "",
    certifications: "",
    schema: "Schéma de pose et calepinage constructeur à respecter. Application stricte des DTU du lot.",
  };
}

function lotsBase(): Lot[] {
  return ORDRE.map(lotVide);
}

function tokenClient(nom: string): string {
  const mots = nom
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const ignores = new Set(["madame", "monsieur", "mme", "mr", "mlle", "indivision", "dossier"]);
  const utiles = mots.filter((mot) => !ignores.has(mot.toLowerCase()) && mot.length > 1);
  return (utiles[utiles.length - 1] || "CLIENT").toUpperCase().slice(0, 18);
}

function dateFr(iso: string): string {
  if (!iso) return "—";
  const [an, mois, jour] = iso.split("-");
  if (!jour) return iso;
  return `${jour}/${mois}/${an}`;
}

function synthese(dossier: Dossier) {
  const venteHt = round2(dossier.venteTtc / (1 + dossier.tauxTva / 100));
  const debours = round2(
    dossier.lots.filter((lot) => lot.actif).reduce((total, lot) => total + (Number(lot.montantHt) || 0), 0),
  );
  const commission = round2(venteHt * (Number(dossier.commissionPct) || 0) / 100);
  const marge = round2(venteHt - debours - commission);
  const pct = venteHt > 0 ? round2((marge / venteHt) * 100) : 0;
  return { venteHt, debours, commission, marge, pct };
}

function badgeAssurance(echeance: string): "conforme" | "expiree" | "a-controler" {
  if (!echeance) return "a-controler";
  const fin = new Date(`${echeance}T12:00:00`);
  if (Number.isNaN(fin.getTime())) return "a-controler";
  return fin >= new Date(`${AUJOURDHUI}T12:00:00`) ? "conforme" : "expiree";
}

function lotsPrets(dossier: Dossier): Lot[] {
  return dossier.lots.filter((lot) => lot.actif && lot.artisan.trim() && lot.montantHt > 0 && lot.designation.trim());
}

function photosLot(dossier: Dossier, lotId: LotId, phase?: Phase): Photo[] {
  return dossier.photos.filter((photo) => photo.lotId === lotId && photo.src && (!phase || photo.phase === phase));
}

function numeroBdc(dossier: Dossier, ordre: number): string {
  if (dossier.bdc?.reference) return dossier.bdc.reference;
  return `BDC-2026-ST-${tokenClient(dossier.client)}-${String(ordre).padStart(2, "0")}`;
}

function estAbdenabi(dossier: Dossier): boolean {
  return dossier.id === ABDENABI_ID || dossier.reference === ABDENABI_DEVIS;
}

function presetCouty(): Dossier {
  const lots = lotsBase();
  const finitions = lots[4];
  finitions.actif = true;
  finitions.artisan = "Entreprise de pose partenaire";
  finitions.contact = "Menuisier poseur";
  finitions.montantHt = 480;
  finitions.dureeJours = 3;
  finitions.designation =
    "Fourniture et pose clé en main d'une main courante d'escalier sur-mesure en chêne massif Ø 42 mm (~4,80 ml), raccord articulé d'angle, 6 platines scellées, retours arrondis PMR, quincaillerie complète et nettoyage de chantier.";
  finitions.marque = "Chêne massif";
  finitions.modele = "Main courante Ø 42 mm";
  finitions.references = "Raccord articulé d'angle, 6 platines scellées, retours arrondis PMR";
  finitions.certifications = "Maintien à domicile — hauteur réglementaire 90 cm. Quincaillerie adaptée au support.";
  finitions.schema = "Plan de fixation des platines sur le mur latéral et raccord du quart-tournant. Respect des DTU menuiserie bois.";
  return {
    id: "couty",
    client: CLIENT_COUTY.libelleSignature,
    adresse: "23 Rue du Fort Troyon",
    ville: "Mably",
    codePostal: "42300",
    telephone: CLIENT_COUTY.telephone,
    email: CLIENT_COUTY.email,
    dateDemarrage: "2026-10-27",
    reference: COUTY_ESCALIER_CONTRAT_NUMERO,
    venteTtc: 1485,
    tauxTva: 10,
    commissionPct: 10,
    lienStripe: "",
    photos: [
      ["/couty-escalier/04-palier-bas.jpg", "Vue plongeante — Trémie et départ haut de l'escalier"],
      ["/couty-escalier/01-volee-droite.jpg", "Mur latéral droit — Support de fixation des platines murales"],
      ["/couty-escalier/02-vue-plongeante.jpg", "Alignement de la volée — Hauteur réglementaire 90 cm requise"],
      ["/couty-escalier/03-quart-tournant.jpg", "Angle quart-tournant — Raccord articulé sur-mesure requis"],
    ].map(([src, legende], index) => ({
      id: `couty-${index}`,
      src,
      legende,
      phase: "avant" as const,
      lotId: "finitions" as const,
    })),
    lots,
    pvSigne: false,
    noteMarge: "",
  };
}

function presetBrunel(): Dossier {
  const lots = lotsBase();
  const gros = lots[0];
  gros.actif = true;
  gros.artisan = "Mustafa HEZEN — Hezen Bâtiment";
  gros.contact = "contact@hezen-macon.fr";
  gros.siret = "84821544800010";
  gros.montantHt = 17770;
  gros.dureeJours = 15;
  gros.designation = "Dalle béton 80,5 m² + city pompe + mur banché + IPN 260×230. Forfait clé en main fourniture, pose et déplacement.";
  gros.marque = "Béton prêt à l'emploi";
  gros.modele = "IPN 260×230";
  gros.references = "Dalle 80,5 m², city pompe, mur banché";
  gros.certifications = "DTU 13.3, DTU 21 et DTU 23.1. Aciers de linteau selon note de calcul.";
  gros.schema = "Calepinage de la dalle, réservations et pose de l'IPN 260×230 avant coulage. Respect strict des DTU gros œuvre.";
  const isolation = lots[2];
  isolation.actif = true;
  isolation.artisan = "C2L Isolation";
  isolation.contact = "RGE E-E102269";
  isolation.siret = "53461962200101";
  isolation.echeance = "2027-12-31";
  isolation.assurance = "Attestation RGE Qualibat à jour — police décennale à joindre avant démarrage";
  isolation.montantHt = 1050;
  isolation.dureeJours = 2;
  isolation.designation = "Combles perdus 35 m² soufflés. Laine de roche 300 mm, R = 7,0, pare-vapeur et étanchéité. Tarif C2L 30,00 € HT/m².";
  isolation.marque = "Laine de roche";
  isolation.modele = "Soufflage 300 mm";
  isolation.references = "R = 7,0 m².K/W — 35 m²";
  isolation.certifications = "Certificat ACERMI de l'isolant. RGE Qualibat E-E102269, validité 31/12/2027.";
  isolation.schema = "Plan de soufflage des combles perdus et traitement des trappes. Respect du DTU 45.11.";
  return {
    id: "brunel",
    client: "Monsieur Emrick BRUNEL / Indivision COUBLE",
    adresse: "48 Impasse des Lagunes",
    ville: "Bussières",
    codePostal: "42510",
    telephone: "",
    email: "",
    dateDemarrage: "2026-11-16",
    reference: "AVENANT-2026-BRUNEL-GO",
    venteTtc: 27500,
    tauxTva: 10,
    commissionPct: 0,
    lienStripe: "",
    photos: [],
    lots,
    pvSigne: false,
    noteMarge: "Avenant gros œuvre seul, hors isolation : 7 230 € HT, soit 28,92 % du CA.",
  };
}

function presetPereira(): Dossier {
  const lots = lotsBase();
  const isolation = lots[2];
  isolation.actif = true;
  isolation.artisan = "C2L Isolation";
  isolation.contact = "RGE E-E102269";
  isolation.siret = "53461962200101";
  isolation.echeance = "2027-12-31";
  isolation.assurance = "Attestation RGE Qualibat à jour — police décennale à joindre avant démarrage";
  isolation.montantHt = 1800;
  isolation.dureeJours = 3;
  isolation.designation =
    "Isolation des combles perdus 60 m² déroulés, R ≥ 7 (débours C2L 30 € HT/m²). Plancher bas 19 m², R ≥ 3 : débours artisan à compléter sur ce lot.";
  isolation.marque = "Laine minérale";
  isolation.modele = "Combles R ≥ 7 et plancher bas R ≥ 3";
  isolation.references = "60 m² combles + 19 m² plancher bas";
  isolation.certifications = "Certificat ACERMI des isolants. RGE E-E102269.";
  isolation.schema = "Soufflage des combles puis isolation du plancher bas. Isolation avant tout dimensionnement de la PAC. DTU 45.11.";
  const fluides = lots[3];
  fluides.actif = true;
  fluides.artisan = "Installateur PAC à désigner";
  fluides.montantHt = 0;
  fluides.dureeJours = 10;
  fluides.designation =
    "PAC air/eau haute température et ballon thermodynamique. Dépose de la chaudière fioul. Dimensionnement après isolation. Forfait artisan à saisir.";
  fluides.marque = "PAC air/eau";
  fluides.modele = "Haute température + ballon thermodynamique";
  fluides.references = "Puissance issue de l'audit, à confirmer après isolation";
  fluides.certifications = "NF PAC / Eurovent pour la pompe à chaleur. Installateur RGE.";
  fluides.schema = "Schéma hydraulique constructeur. La PAC ne démarre qu'après l'isolation des combles et du plancher bas.";
  return {
    id: "pereira",
    client: "Monsieur David Emmanuel PEREIRA",
    adresse: "1 route de Mizérieux",
    ville: "Nervieux",
    codePostal: "42510",
    telephone: "",
    email: "",
    dateDemarrage: "2026-11-23",
    reference: "AUDIT-PEREIRA-2026-001",
    venteTtc: 18557.58,
    tauxTva: 5.5,
    commissionPct: 10,
    lienStripe: "",
    photos: [],
    lots,
    pvSigne: false,
    noteMarge: "Vente officielle : combles 1 250 € TTC, plancher bas 3 307,58 € TTC, PAC 14 000 € TTC. Le forfait PAC artisan reste à saisir.",
  };
}

function presetAbdenabi(): Dossier {
  const lots = lotsBase();
  const fluides = lots[3];
  fluides.actif = true;
  fluides.artisan = ABDENABI_CHANTIER.sousTraitance.destinataire;
  fluides.contact = ABDENABI_CHANTIER.sousTraitance.contact;
  fluides.montantHt = ABDENABI_ST_HT;
  fluides.dureeJours = 2;
  fluides.designation = ABDENABI_CHANTIER.sousTraitance.prestation;
  fluides.marque = "Saunier Duval";
  fluides.modele = "Themafast Classic V 18/24 VMC Gaz";
  fluides.references = "Conduit D125, bouche BAZ D125, filtre à boue magnétique, thermostat modulant, certificat CC2";
  fluides.certifications = "DTU 61.1 (gaz) et DTU 65.16 (chauffage et désembouage). Certificat de conformité gaz modèle CC2.";
  fluides.schema =
    "Raccordement sur le conduit collectif VMC Gaz. Étanchéité gaz, pot à boue magnétique en protection de l'échangeur, désembouage avant mise en service.";
  return {
    id: ABDENABI_ID,
    client: ABDENABI_CHANTIER.client,
    adresse: ABDENABI_CHANTIER.adresse,
    ville: ABDENABI_CHANTIER.ville,
    codePostal: ABDENABI_CHANTIER.codePostal,
    telephone: ABDENABI_CHANTIER.telephone,
    email: "",
    dateDemarrage: "",
    reference: ABDENABI_DEVIS,
    venteTtc: ABDENABI_VENTE_TTC,
    tauxTva: 20,
    commissionPct: ABDENABI_CHANTIER.apporteur.tauxPct,
    lienStripe: "",
    photos: [],
    lots,
    pvSigne: false,
    noteMarge: ABDENABI_NOTE_SYNTHESE,
    objet: ABDENABI_CHANTIER.objet,
    dateLibelle: ABDENABI_CHANTIER.dateLibelle,
    validiteJours: ABDENABI_CHANTIER.validiteJours,
    batiment: ABDENABI_CHANTIER.batiment,
    lignesVente: ABDENABI_LIGNES_VENTE,
    ecartConcurrent: `Positionné ${ABDENABI_CONCURRENT.ecartTtc.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € moins cher que le devis concurrent ${ABDENABI_CONCURRENT.nom} à ${ABDENABI_CONCURRENT.montantTtc.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €.`,
    bdc: {
      reference: ABDENABI_BDC,
      destinataire: ABDENABI_CHANTIER.sousTraitance.destinataire,
      lots: ABDENABI_LOTS_SOUS_TRAITANCE,
      montantHt: ABDENABI_ST_HT,
      prestation: ABDENABI_CHANTIER.sousTraitance.prestation,
      adresseChantier: ABDENABI_CHANTIER.sousTraitance.adresseChantier,
      conditions: ABDENABI_CHANTIER.sousTraitance.conditions,
      regime: ABDENABI_CHANTIER.sousTraitance.regime,
    },
    apporteur: {
      nom: ABDENABI_CHANTIER.apporteur.nom,
      societe: ABDENABI_CHANTIER.apporteur.societe,
      siret: ABDENABI_CHANTIER.apporteur.siret,
      adresse: ABDENABI_CHANTIER.apporteur.adresse,
      convention: ABDENABI_CHANTIER.apporteur.convention,
      dateSignature: ABDENABI_CHANTIER.apporteur.dateSignature,
      referenceFiche: ABDENABI_CHANTIER.apporteur.referenceFiche,
      statut: ABDENABI_CHANTIER.apporteur.statut,
      articleTaux: ABDENABI_CHANTIER.apporteur.articleTaux,
      articleEcheancier: ABDENABI_CHANTIER.apporteur.articleEcheancier,
      tauxPct: ABDENABI_CHANTIER.apporteur.tauxPct,
      assietteHt: ABDENABI_CHANTIER.apporteur.assietteHt,
      commissionHt: ABDENABI_CHANTIER.apporteur.commissionHt,
      jalonHt: ABDENABI_CHANTIER.apporteur.jalonHt,
      conditionPaiement: ABDENABI_CHANTIER.apporteur.conditionPaiement,
    },
  };
}

function dossierDepuisPreset(presetId?: string | null): Dossier | null {
  if (!presetId) return null;
  if (presetId === ABDENABI_ID || presetId === "abdenabi") return presetAbdenabi();
  if (presetId === "couty") return presetCouty();
  if (presetId === "brunel") return presetBrunel();
  if (presetId === "pereira") return presetPereira();
  return null;
}

function dossierVide(lead?: LeadMaster | null): Dossier {
  const client = [lead?.prenom, lead?.nomFamille].filter(Boolean).join(" ").trim() || lead?.nom || "";
  return {
    id: lead?.id || "manuel",
    client,
    adresse: lead?.adresse || "",
    ville: lead?.ville || "",
    codePostal: "",
    telephone: lead?.telephone || "",
    email: lead?.email || "",
    dateDemarrage: "",
    reference: "",
    venteTtc: Number(lead?.budget) || 0,
    tauxTva: 10,
    commissionPct: 10,
    lienStripe: "",
    photos: [],
    lots: lotsBase(),
    pvSigne: false,
    noteMarge: "",
  };
}

export function dossierMasterDepuisLead(lead?: LeadMaster | null): Dossier {
  const indice = `${lead?.prenom || ""} ${lead?.nomFamille || ""} ${lead?.nom || ""} ${lead?.ville || ""} ${lead?.notes || ""} ${lead?.typeTravaux || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (indice.includes("couty") || indice.includes("mably")) return { ...presetCouty(), id: lead?.id || "couty" };
  if (indice.includes("brunel") || indice.includes("bussiere") || indice.includes("couble")) {
    return { ...presetBrunel(), id: lead?.id || "brunel" };
  }
  if (indice.includes("pereira") || indice.includes("nervieux")) return { ...presetPereira(), id: lead?.id || "pereira" };
  if (indice.includes("abdenabi") || indice.includes("beloucif")) return { ...presetAbdenabi(), id: lead?.id || ABDENABI_ID };
  return dossierVide(lead);
}

function lireTous(): Record<string, Dossier> {
  try {
    const brut = localStorage.getItem(STORAGE);
    if (!brut) return {};
    const data = JSON.parse(brut);
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function compresserImage(fichier: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onerror = () => reject(new Error("lecture"));
    lecteur.onload = () => {
      const image = new Image();
      image.onload = () => {
        const echelle = Math.min(1, 900 / Math.max(image.width, image.height));
        const toile = document.createElement("canvas");
        toile.width = Math.max(1, Math.round(image.width * echelle));
        toile.height = Math.max(1, Math.round(image.height * echelle));
        toile.getContext("2d")?.drawImage(image, 0, 0, toile.width, toile.height);
        resolve(toile.toDataURL("image/jpeg", 0.72));
      };
      image.onerror = () => reject(new Error("image"));
      image.src = String(lecteur.result);
    };
    lecteur.readAsDataURL(fichier);
  });
}

function alerteOrdre(dossier: Dossier): string {
  const actif = (id: LotId) => dossier.lots.some((lot) => lot.id === id && lot.actif);
  if (actif("fluides") && !actif("isolation") && (actif("gros-oeuvre") || actif("clos-couvert"))) {
    return "Le lot chauffage / PAC est actif sans le lot isolation. L'isolation précède le dimensionnement du chauffage.";
  }
  return "";
}

export default function ChantierMasterOrchestratorModal({ ouvert, onFermer, lead = null, presetId = null }: Props) {
  const [onglet, setOnglet] = useState(1);
  const [dossier, setDossier] = useState<Dossier>(() => dossierDepuisPreset(presetId) || presetCouty());
  const [message, setMessage] = useState("");
  const [documentImprime, setDocumentImprime] = useState<DocumentImprime | null>(null);
  const [facture, setFacture] = useState<{ appel: TypeAppelFonds; pourcentage: number; suffixe: string } | null>(null);
  const chiffres = useMemo(() => synthese(dossier), [dossier]);
  const prets = useMemo(() => lotsPrets(dossier), [dossier]);

  useEffect(() => {
    if (!ouvert) return;
    const officiel = dossierDepuisPreset(presetId);
    if (officiel) {
      setDossier(officiel);
    } else {
      const cle = lead?.id || "couty";
      const sauve = lireTous()[cle];
      setDossier(sauve?.client ? sauve : lead ? dossierMasterDepuisLead(lead) : presetCouty());
    }
    setOnglet(1);
    setMessage("");
    setDocumentImprime(null);
    setFacture(null);
  }, [ouvert, lead?.id, presetId]);

  useEffect(() => {
    if (!ouvert || facture || documentImprime) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onFermer();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [ouvert, onFermer, facture, documentImprime]);

  if (!ouvert) return null;

  function patch(partiel: Partial<Dossier>) {
    setDossier((prev) => ({ ...prev, ...partiel }));
  }

  function patchLot(id: LotId, partiel: Partial<Lot>) {
    setDossier((prev) => ({
      ...prev,
      lots: prev.lots.map((lot) => (lot.id === id ? { ...lot, ...partiel } : lot)),
    }));
  }

  async function ajouterPhotos(liste: FileList | File[] | null) {
    if (!liste) return;
    const ajouts: Photo[] = [];
    for (const fichier of [...liste].filter((item) => item.type.startsWith("image/")).slice(0, 8)) {
      try {
        const src = await compresserImage(fichier);
        ajouts.push({ id: `photo-${Date.now()}-${ajouts.length}`, src, legende: "", phase: "avant", lotId: "" });
      } catch {
        /* fichier ignoré */
      }
    }
    if (ajouts.length) setDossier((prev) => ({ ...prev, photos: [...prev.photos, ...ajouts] }));
  }

  function enregistrer() {
    try {
      const tous = lireTous();
      tous[dossier.id || "manuel"] = dossier;
      localStorage.setItem(STORAGE, JSON.stringify(tous));
      setMessage("Dossier chantier enregistré.");
    } catch {
      setMessage("Enregistrement impossible : le navigateur a refusé le stockage local.");
    }
  }

  function validerPv() {
    setDossier((prev) => ({ ...prev, pvSigne: true }));
    setMessage("PV sans réserve validé. Paiement des sous-traitants sous 48 h. Facture de solde 70 % ouverte.");
    setFacture({ appel: "libre", pourcentage: 70, suffixe: "-70" });
  }

  const marcheFacture = {
    id: dossier.id,
    nom: dossier.client,
    ref: dossier.reference,
    montantTtc: dossier.venteTtc,
    adresse: `${dossier.adresse}, ${dossier.codePostal} ${dossier.ville}`.trim(),
    designation: dossier.lots.filter((lot) => lot.actif).map((lot) => lot.designation).filter(Boolean).join(" "),
    tauxTva: dossier.tauxTva,
  };

  const onglets = [
    [1, "1. Dossier & visuels"],
    [2, "2. Vente client"],
    [3, "3. Dispatch BTP"],
    [4, "4. Bons de commande"],
    [5, "5. Réception"],
    ...(dossier.apporteur ? [[6, "6. Apporteur d'affaires - Jamel HAMZAOUI"] as const] : []),
  ] as const;

  return createPortal(
    <div className="fixed inset-0 z-[95] flex flex-col bg-[#07111f] text-white" data-testid="modal-chantier-master">
      <style>{PRINT_CSS}</style>
      <header className="master-noprint flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f9c74f]">Contractant général</p>
          <h2 className="text-lg font-semibold">Orchestrateur maître de chantier</h2>
        </div>
        <button type="button" onClick={onFermer} className="rounded-lg border border-white/20 px-3 py-1.5 text-sm">
          Fermer
        </button>
      </header>
      <div className="master-noprint flex flex-wrap gap-2 border-b border-white/10 px-5 py-3">
        <button type="button" data-testid="jeu-couty" onClick={() => setDossier(presetCouty())} className="rounded-full border border-white/15 px-3 py-1 text-xs hover:bg-white/10">
          Couty — Mably
        </button>
        <button type="button" data-testid="jeu-brunel" onClick={() => setDossier(presetBrunel())} className="rounded-full border border-white/15 px-3 py-1 text-xs hover:bg-white/10">
          Brunel — Bussières
        </button>
        <button type="button" data-testid="jeu-pereira" onClick={() => setDossier(presetPereira())} className="rounded-full border border-white/15 px-3 py-1 text-xs hover:bg-white/10">
          Pereira — Nervieux
        </button>
        <button type="button" data-testid="jeu-abdenabi" onClick={() => { setDossier(presetAbdenabi()); setOnglet(1); }} className="rounded-full border border-emerald-300/50 bg-emerald-700/40 px-3 py-1 text-xs font-semibold text-emerald-50 hover:bg-emerald-600/50">
          Abdenabi — Strasbourg
        </button>
      </div>
      {estAbdenabi(dossier) ? (
        <div className="master-noprint flex flex-wrap gap-2 border-b border-emerald-400/20 bg-emerald-950/40 px-5 py-3" data-testid="exports-abdenabi">
          <button type="button" data-testid="export-devis-abdenabi" onClick={() => setDocumentImprime({ type: "devis" })} className="rounded-xl bg-[#047857] px-3 py-2 text-xs font-semibold text-white hover:bg-[#059669]">
            Télécharger Devis Vente Client ({ABDENABI_DEVIS})
          </button>
          <button type="button" data-testid="export-bdc-abdenabi" onClick={() => setDocumentImprime({ type: "bdc", lotId: "fluides" })} className="rounded-xl border border-emerald-300/40 px-3 py-2 text-xs font-semibold text-emerald-50 hover:bg-emerald-800/60">
            Télécharger BDC Sous-Traitance ({ABDENABI_BDC})
          </button>
          <button type="button" data-testid="export-commission-abdenabi" onClick={() => setDocumentImprime({ type: "commission" })} className="rounded-xl border border-[#f9c74f]/50 px-3 py-2 text-xs font-semibold text-[#f9c74f] hover:bg-emerald-800/60">
            Télécharger Fiche Commission Jamel ({ABDENABI_FICHE_COMMISSION})
          </button>
        </div>
      ) : null}
      <nav className="master-noprint flex flex-wrap gap-2 px-5 py-3">
        {onglets.map(([id, label]) => (
          <button
            key={id}
            type="button"
            data-testid={`onglet-master-${id}`}
            onClick={() => setOnglet(id)}
            className={`rounded-xl px-3 py-2 text-sm ${onglet === id ? "bg-[#1a5c2e] text-white" : "border border-white/15 text-slate-200"}`}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className={`master-noprint min-h-0 flex-1 overflow-y-auto px-5 ${estAbdenabi(dossier) ? "pb-72" : "pb-28"}`}>
        {onglet === 1 ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {estAbdenabi(dossier) ? (
              <article className="lg:col-span-2 rounded-2xl border border-emerald-400/30 bg-emerald-950/40 p-4 text-sm" data-testid="identite-abdenabi">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Trio du chantier · {ABDENABI_ID}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <p><span className="text-slate-400">Client final.</span> {ABDENABI_CHANTIER.client}<br />{ABDENABI_CHANTIER.adresseComplete}<br />{ABDENABI_CHANTIER.telephone}<br />{ABDENABI_CHANTIER.batiment}</p>
                  <p><span className="text-slate-400">Contractant général.</span> {ABDENABI_CHANTIER.contractant.nom}<br />SIRET {BRANDING.siretAffiche} · RCS {BRANDING.rcsAffiche}<br />{ABDENABI_CHANTIER.contractant.decennale}</p>
                  <p><span className="text-slate-400">Direction des travaux.</span> {ABDENABI_CHANTIER.sousTraitance.entite}<br />{ABDENABI_CHANTIER.sousTraitance.role}</p>
                  <p><span className="text-slate-400">Apporteur d&apos;affaires.</span> {ABDENABI_CHANTIER.apporteur.nom} · {ABDENABI_CHANTIER.apporteur.societe}<br />SIRET {ABDENABI_CHANTIER.apporteur.siret}<br />{ABDENABI_CHANTIER.apporteur.convention} · signée le {ABDENABI_CHANTIER.apporteur.dateSignature}</p>
                </div>
              </article>
            ) : null}
            <label className="text-xs text-slate-300">Client
              <input className={inputClass} value={dossier.client} onChange={(event) => patch({ client: event.target.value })} />
            </label>
            <label className="text-xs text-slate-300">Adresse d&apos;exécution
              <input className={inputClass} value={dossier.adresse} onChange={(event) => patch({ adresse: event.target.value })} />
            </label>
            <label className="text-xs text-slate-300">Code postal
              <input className={inputClass} value={dossier.codePostal} onChange={(event) => patch({ codePostal: event.target.value })} />
            </label>
            <label className="text-xs text-slate-300">Ville
              <input className={inputClass} value={dossier.ville} onChange={(event) => patch({ ville: event.target.value })} />
            </label>
            <label className="text-xs text-slate-300">Téléphone
              <input className={inputClass} value={dossier.telephone} onChange={(event) => patch({ telephone: event.target.value })} />
            </label>
            <label className="text-xs text-slate-300">Email
              <input className={inputClass} value={dossier.email} onChange={(event) => patch({ email: event.target.value })} />
            </label>
            <label className="text-xs text-slate-300">Démarrage souhaité
              <input type="date" className={inputClass} value={dossier.dateDemarrage} onChange={(event) => patch({ dateDemarrage: event.target.value })} />
            </label>
            <label className="text-xs text-slate-300">Référence marché
              <input className={inputClass} value={dossier.reference} onChange={(event) => patch({ reference: event.target.value })} />
            </label>
            <div
              className="lg:col-span-2 rounded-xl border border-dashed border-white/20 p-4"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void ajouterPhotos(event.dataTransfer.files);
              }}
            >
              <p className="text-sm font-semibold text-[#f9c74f]">Galerie in situ — avant / après</p>
              <label className="mt-2 inline-flex cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs">
                Importer des photos
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => { void ajouterPhotos(event.target.files); event.target.value = ""; }} />
              </label>
            </div>
            {dossier.photos.map((photo) => (
              <article key={photo.id} className="rounded-xl border border-white/10 p-3">
                <img src={photo.src} alt={photo.legende || "Visuel chantier"} className="h-28 w-full rounded object-cover" />
                <label className="mt-2 block text-[11px] text-slate-300">Type
                  <select className={inputClass} value={photo.phase} onChange={(event) => setDossier((prev) => ({ ...prev, photos: prev.photos.map((item) => item.id === photo.id ? { ...item, phase: event.target.value === "apres" ? "apres" : "avant" } : item) }))}>
                    <option value="avant">Photo avant travaux (état initial)</option>
                    <option value="apres">Projection / visuel cible après travaux</option>
                  </select>
                </label>
                <label className="mt-2 block text-[11px] text-slate-300">Corps d&apos;état
                  <select className={inputClass} value={photo.lotId} onChange={(event) => setDossier((prev) => ({ ...prev, photos: prev.photos.map((item) => item.id === photo.id ? { ...item, lotId: event.target.value as LotId | "" } : item) }))}>
                    <option value="">Non assignée</option>
                    {ORDRE.map((lot) => <option key={lot.id} value={lot.id}>Ordre {lot.ordre} — {lot.titre}</option>)}
                  </select>
                </label>
                <label className="mt-2 block text-[11px] text-slate-300">Légende
                  <input className={inputClass} value={photo.legende} placeholder="Vue trémie, support de fixation…" onChange={(event) => setDossier((prev) => ({ ...prev, photos: prev.photos.map((item) => item.id === photo.id ? { ...item, legende: event.target.value } : item) }))} />
                </label>
                <button type="button" className="mt-2 text-xs text-rose-200" onClick={() => setDossier((prev) => ({ ...prev, photos: prev.photos.filter((item) => item.id !== photo.id) }))}>Retirer</button>
              </article>
            ))}
          </section>
        ) : null}
        {onglet === 2 ? (
          <section className="max-w-3xl space-y-4">
            <p className="text-sm text-slate-300">Montant vendu au client. Le TTC est la base du marché. Le HT suit le taux de TVA.</p>
            {dossier.lignesVente?.length ? (
              <table className="w-full border-collapse text-sm" data-testid="lignes-vente-abdenabi">
                <thead>
                  <tr className="bg-[#047857] text-left text-white">
                    <th className="px-2 py-1">N°</th>
                    <th className="px-2 py-1">Prestation</th>
                    <th className="px-2 py-1 text-right">HT</th>
                  </tr>
                </thead>
                <tbody>
                  {dossier.lignesVente.map((ligne) => (
                    <tr key={ligne.ordre} className="border-b border-white/10">
                      <td className="px-2 py-1">{ligne.ordre}</td>
                      <td className="px-2 py-1">{ligne.designation}</td>
                      <td className="px-2 py-1 text-right">{euro(ligne.montantHt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {dossier.objet ? <p className="text-sm text-slate-200">{dossier.objet}</p> : null}
            {dossier.ecartConcurrent ? <p className="text-sm text-emerald-200">{dossier.ecartConcurrent}</p> : null}
            <label className="block text-xs text-slate-300">Montant TTC
              <input type="number" className={inputClass} value={dossier.venteTtc} onChange={(event) => patch({ venteTtc: Number(event.target.value) })} />
            </label>
            <p className="text-sm">Montant HT : <strong>{euro(chiffres.venteHt)}</strong></p>
            <div className="flex flex-wrap gap-2">
              {([5.5, 10, 20] as Taux[]).map((taux) => (
                <button key={taux} type="button" onClick={() => patch({ tauxTva: taux })} className={`rounded-lg px-3 py-2 text-xs ${dossier.tauxTva === taux ? "bg-[#1a5c2e]" : "border border-white/15"}`}>
                  {taux === 5.5 ? "5,5 % rénovation énergétique" : taux === 10 ? "10 % amélioration-autonomie" : "20 % standard"}
                </button>
              ))}
            </div>
            <label className="block text-xs text-slate-300">Lien de paiement Stripe
              <input className={inputClass} data-testid="lien-stripe" value={dossier.lienStripe} placeholder="https://buy.stripe.com/…" onChange={(event) => patch({ lienStripe: event.target.value })} />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" data-testid="master-devis" onClick={() => setDocumentImprime({ type: "devis" })} className="rounded-xl bg-[#1a5c2e] px-4 py-3 text-sm font-semibold">Générer devis & marché</button>
              <button type="button" data-testid="master-facture-30" onClick={() => setFacture({ appel: "acompte30", pourcentage: 30, suffixe: "-01" })} className="rounded-xl border border-[#f9c74f]/50 px-4 py-3 text-sm font-semibold text-[#f9c74f]">Émettre facture d&apos;acompte 30 %</button>
              <button
                type="button"
                data-testid="master-cerfa"
                onClick={() => {
                  window.open(CERFA_1301_SD, "_blank", "noopener,noreferrer");
                  setDocumentImprime({ type: "cerfa" });
                }}
                className="rounded-xl border border-white/20 px-4 py-3 text-sm"
              >
                🏛️ Attestation Simplifiée de TVA (Cerfa 1301-SD)
              </button>
            </div>
          </section>
        ) : null}
        {onglet === 3 ? (
          <section className="space-y-3">
            {alerteOrdre(dossier) ? <p data-testid="master-alerte-ordre" className="rounded-xl border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">{alerteOrdre(dossier)}</p> : null}
            {dossier.lots.map((lot) => (
              <article key={lot.id} className="rounded-2xl border border-white/10 p-4">
                <label className="flex items-start gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={lot.actif} onChange={(event) => patchLot(lot.id, { actif: event.target.checked })} />
                  <span>Ordre {lot.ordre} — {lot.titre}</span>
                </label>
                {lot.actif ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="text-xs text-slate-300">Artisan
                      <input className={inputClass} value={lot.artisan} onChange={(event) => patchLot(lot.id, { artisan: event.target.value })} />
                    </label>
                    <label className="text-xs text-slate-300">Contact
                      <input className={inputClass} value={lot.contact} onChange={(event) => patchLot(lot.id, { contact: event.target.value })} />
                    </label>
                    <label className="text-xs text-slate-300">SIRET
                      <input className={inputClass} value={lot.siret} onChange={(event) => patchLot(lot.id, { siret: event.target.value })} />
                    </label>
                    <label className="text-xs text-slate-300">Compagnie d&apos;assurance
                      <input className={inputClass} value={lot.assurance} onChange={(event) => patchLot(lot.id, { assurance: event.target.value })} />
                    </label>
                    <label className="text-xs text-slate-300">N° police décennale
                      <input className={inputClass} value={lot.police} onChange={(event) => patchLot(lot.id, { police: event.target.value })} />
                    </label>
                    <label className="text-xs text-slate-300">Échéance de validité
                      <input type="date" className={inputClass} value={lot.echeance} onChange={(event) => patchLot(lot.id, { echeance: event.target.value })} />
                    </label>
                    <BadgeDecennale echeance={lot.echeance} />
                    <label className="text-xs text-slate-300">Date d&apos;intervention
                      <input type="date" className={inputClass} value={lot.dateIntervention} onChange={(event) => patchLot(lot.id, { dateIntervention: event.target.value })} />
                    </label>
                    <label className="text-xs text-slate-300">Durée max (jours ouvrés)
                      <input type="number" className={inputClass} value={lot.dureeJours} onChange={(event) => patchLot(lot.id, { dureeJours: Number(event.target.value) })} />
                    </label>
                    <label className="text-xs text-slate-300">Forfait HT
                      <input type="number" className={inputClass} value={lot.montantHt} onChange={(event) => patchLot(lot.id, { montantHt: Number(event.target.value) })} />
                    </label>
                    <label className="text-xs text-slate-300 md:col-span-2">Description et matériel
                      <textarea className={`${inputClass} min-h-16`} value={lot.designation} onChange={(event) => patchLot(lot.id, { designation: event.target.value })} />
                    </label>
                  </div>
                ) : null}
              </article>
            ))}
          </section>
        ) : null}
        {onglet === 4 ? (
          <OngletBdc dossier={dossier} prets={prets} onOuvrir={(lotId) => setDocumentImprime({ type: "bdc", lotId })} onLiasse={() => setDocumentImprime({ type: "liasse" })} />
        ) : null}
        {onglet === 5 ? (
          <section className="max-w-3xl space-y-4">
            <p className="text-sm text-slate-300">Protocole Sûreté-6™️. La validation ouvre la facture de solde 70 % et lance le délai de paiement artisans de 48 h.</p>
            <button type="button" data-testid="master-pv" onClick={() => setDocumentImprime({ type: "pv" })} className="rounded-xl bg-[#1a5c2e] px-4 py-3 text-sm font-semibold">Générer le procès-verbal de réception</button>
            <button type="button" data-testid="master-valider-pv" onClick={validerPv} className="rounded-xl border border-[#f9c74f]/50 px-4 py-3 text-sm font-semibold text-[#f9c74f]">Valider le PV sans réserve</button>
            {dossier.pvSigne ? <p className="text-sm text-emerald-200">PV signé. Sous-traitants payables sous 48 h. Solde client 70 % : {euro(round2(dossier.venteTtc * 0.7))} TTC.</p> : null}
          </section>
        ) : null}
        {onglet === 6 && dossier.apporteur ? (
          <OngletApporteur dossier={dossier} onFiche={() => setDocumentImprime({ type: "commission" })} />
        ) : null}
        {message ? <p className="mt-4 text-sm text-emerald-200">{message}</p> : null}
      </div>
      <footer className="master-noprint absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#07111f]/95 px-5 py-3" data-testid="master-marge">
        {estAbdenabi(dossier) ? (
          <div data-testid="synthese-financiere-abdenabi" className="space-y-0.5 text-sm">
            <p>Chiffre d&apos;affaires vente client : <strong>{euro(chiffres.venteHt)} HT</strong> ({euro(dossier.venteTtc)} TTC)</p>
            <p>Débours sous-traitance travaux (Momo, route Mâcon–Strasbourg) : <strong>{euro(chiffres.debours)} HT</strong></p>
            <p>Commission apporteur d&apos;affaires (Jamel) : <strong>{euro(chiffres.commission)} HT</strong></p>
            <p>Total des débours du projet : <strong>{euro(round2(chiffres.debours + chiffres.commission))} HT</strong></p>
            <p>Marge nette contractant général : <strong>{euro(chiffres.marge)} HT ({chiffres.pct.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} % net pur)</strong></p>
            {dossier.noteMarge ? <p className="pt-1 text-xs text-emerald-100/80">{dossier.noteMarge}</p> : null}
          </div>
        ) : (
          <>
            <p className="text-sm">
              Vente {euro(chiffres.venteHt)} HT — débours {euro(chiffres.debours)} HT — commission {euro(chiffres.commission)} ({dossier.commissionPct} %) = marge nette {euro(chiffres.marge)} HT ({chiffres.pct} %)
            </p>
            {dossier.noteMarge ? <p className="mt-1 text-xs text-slate-400">{dossier.noteMarge}</p> : null}
          </>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-300">Commission apporteur %
            <input type="number" className="ml-2 w-20 rounded border border-white/15 bg-transparent px-2 py-1" value={dossier.commissionPct} onChange={(event) => patch({ commissionPct: Number(event.target.value) })} />
          </label>
          <button type="button" onClick={enregistrer} className="rounded-lg bg-[#1a5c2e] px-3 py-1.5 text-xs font-semibold">Enregistrer le dossier</button>
        </div>
      </footer>
      {documentImprime ? (
        <ApercuDocument dossier={dossier} piece={documentImprime} onFermer={() => setDocumentImprime(null)} />
      ) : null}
      <FactureAcompteModal
        ouvert={Boolean(facture)}
        marche={marcheFacture}
        appel={facture?.appel}
        pourcentageLibre={facture?.pourcentage}
        suffixeNumero={facture?.suffixe}
        lienPaiement={dossier.lienStripe}
        onFermer={() => setFacture(null)}
      />
    </div>,
    document.body,
  );
}

function BadgeDecennale({ echeance }: { echeance: string }) {
  const etat = badgeAssurance(echeance);
  const label = etat === "conforme" ? "Conforme" : etat === "expiree" ? "Expirée" : "À contrôler";
  const classe = etat === "conforme" ? "bg-emerald-600" : etat === "expiree" ? "bg-rose-700" : "bg-slate-600";
  return <p className={`mt-6 inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold ${classe}`}>{label}</p>;
}

function OngletBdc({
  dossier,
  prets,
  onOuvrir,
  onLiasse,
}: {
  dossier: Dossier;
  prets: Lot[];
  onOuvrir: (lotId: LotId) => void;
  onLiasse: () => void;
}) {
  const [lotId, setLotId] = useState<LotId | "">(prets[0]?.id || "");
  const courant = prets.find((lot) => lot.id === lotId) || prets[0];
  return (
    <section>
      <div className="flex flex-wrap gap-2">
        {prets.map((lot) => (
          <button key={lot.id} type="button" onClick={() => setLotId(lot.id)} className={`rounded-full px-3 py-1.5 text-xs ${courant?.id === lot.id ? "bg-[#1a5c2e]" : "border border-white/15"}`}>
            BDC {lot.artisan}
          </button>
        ))}
      </div>
      {courant ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm">{numeroBdc(dossier, courant.ordre)} — {euro(courant.montantHt)} HT — {courant.dureeJours} jours ouvrés</p>
          <button type="button" data-testid="master-imprimer-bdc" onClick={() => onOuvrir(courant.id)} className="rounded-xl bg-[#1a5c2e] px-4 py-3 text-sm font-semibold">Imprimer ce BDC (3 pages)</button>
          <button type="button" data-testid="master-imprimer-liasse" onClick={onLiasse} className="ml-2 rounded-xl border border-white/20 px-4 py-3 text-sm">Imprimer la liasse de tous les BDC</button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-300">Aucun lot prêt. Renseignez l&apos;artisan, le forfait HT et la description.</p>
      )}
    </section>
  );
}

function Entete({ numero, date, statut }: { numero: string; date: string; statut: string }) {
  return (
    <header className="flex items-start justify-between gap-3 border-b border-[#0B1F3A] pb-2">
      <div className="flex min-w-0 gap-2">
        <img src={LOGO} alt="Logo ENERGIA CONSEIL IA" className="h-12 w-auto" />
        <div className="text-[6.4pt] leading-tight text-[#334155]">
          <p className="text-[7.4pt] font-bold text-[#0B1F3A]">ENERGIA CONSEIL IA® — Audit Énergétique Intelligence Artificielle • Marque déposée INPI n° {BRANDING.inpi}</p>
          <p>SASU au capital de {BRANDING.capital} — {BRANDING.siege}</p>
          <p>SIRET {BRANDING.siretAffiche} — RCS {BRANDING.rcsAffiche} — TVA {BRANDING.tva} — APE {BRANDING.ape}</p>
          <p>Garantie Décennale &amp; RCP : Calipso Assurances n° LUNPIB2604975</p>
          <p>Direction &amp; Contractant Général : Sylvain LEMBELEMBE — {BRANDING.telephone} — {BRANDING.email}</p>
        </div>
      </div>
      <aside className="w-[46mm] shrink-0 border border-[#0B1F3A] p-1.5 text-[7pt] leading-snug">
        <p className="font-bold">N° {numero}</p>
        <p>Date : {date}</p>
        <p className="mt-1 inline-block border border-[#1a5c2e] px-1 font-semibold text-[#1a5c2e]">{statut}</p>
      </aside>
    </header>
  );
}

function PageBdc({ dossier, lot, page, fin }: { dossier: Dossier; lot: Lot; page: 1 | 2 | 3; fin: boolean }) {
  const avant = photosLot(dossier, lot.id, "avant").slice(0, 2);
  const apres = photosLot(dossier, lot.id, "apres").slice(0, 2);
  const classe = `print-page mx-auto mb-6 w-[210mm] max-w-full bg-white text-[#0B1F3A] shadow ${fin ? "print-page-fin" : ""}`;
  if (page === 1) {
    return (
      <article className={classe}>
        <Entete numero={numeroBdc(dossier, lot.ordre)} date={dateFr(AUJOURDHUI)} statut="En attente signature artisan" />
        <h3 className="mt-3 text-center text-[11pt] font-bold underline">BON DE COMMANDE DE SOUS-TRAITANCE BTP — FORFAIT CLÉ EN MAIN</h3>
        <table className="mt-3 w-full border-collapse text-[8pt]">
          <thead><tr className="bg-[#1a5c2e] text-left text-white"><th className="px-2 py-1" colSpan={2}>I. Identification des parties</th></tr></thead>
          <tbody>
            <tr><td className="w-1/2 border border-slate-300 p-2 align-top"><strong>Donneur d&apos;ordre</strong><br />ENERGIA CONSEIL IA®<br />SIRET {BRANDING.siretAffiche}<br />{BRANDING.siege}<br />Décennale Calipso n° LUNPIB2604975</td><td className="border border-slate-300 p-2 align-top"><strong>Sous-traitant</strong><br />{lot.artisan}<br />{lot.contact}<br />SIRET {lot.siret || "—"}<br />Décennale {lot.assurance || "—"} {lot.police} — échéance {dateFr(lot.echeance)}</td></tr>
            <tr><td className="border border-slate-300 p-2" colSpan={2}><strong>Lieu du chantier.</strong> {dossier.client} — {dossier.adresse}, {dossier.codePostal} {dossier.ville} {dossier.telephone ? `• ${dossier.telephone}` : ""}</td></tr>
          </tbody>
        </table>
        <table className="mt-3 w-full border-collapse text-[8pt]">
          <thead><tr className="bg-[#1a5c2e] text-left text-white"><th className="px-2 py-1">II. Prestations au forfait clé en main</th><th className="px-2 py-1 text-right">Montant HT</th></tr></thead>
          <tbody>
            <tr><td className="border border-slate-300 p-2">{lot.designation}<br /><span className="text-[7pt]">Forfait clé en main (fourniture + pose + déplacement). Autoliquidation.</span></td><td className="border border-slate-300 p-2 text-right font-semibold">{euro(lot.montantHt)}</td></tr>
          </tbody>
        </table>
        <p className="mt-3 text-[8pt] font-semibold">{MENTION_AUTOLIQUIDATION}</p>
        <p className="mt-2 text-[8pt]">Démarrage prévisionnel : {dateFr(lot.dateIntervention || dossier.dateDemarrage)}. Durée maximale d&apos;exécution : {lot.dureeJours} jours ouvrés.</p>
        <p className="mt-2 border border-[#0B1F3A] p-2 text-[8pt]">Clause Sûreté-6™️. Règlement à 100 % par virement sous 48 h après fourniture de la facture artisan accompagnée du procès-verbal de réception de travaux signé sans réserve par le client.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[8pt]">
          <div className="h-[28mm] border border-[#0B1F3A] p-2">Bon pour commande et exécution<br />Sylvain LEMBELEMBE<br />ENERGIA CONSEIL IA®</div>
          <div className="h-[28mm] border border-[#0B1F3A] p-2">Bon pour accord et acceptation de la commande<br />{lot.artisan}</div>
        </div>
      </article>
    );
  }
  if (page === 2) {
    return (
      <article className={classe}>
        <Entete numero={`${numeroBdc(dossier, lot.ordre)}-A1`} date={dateFr(AUJOURDHUI)} statut="Annexe technique" />
        <h3 className="mt-3 text-[10pt] font-bold">ANNEXE TECHNIQUE N° 1 — REPÉRAGE IN SITU &amp; OBJECTIF FINITION</h3>
        <p className="text-[8pt]">Chantier {dossier.client} ({dossier.ville}) — {lot.titre}</p>
        <div className="mt-3 grid grid-cols-[1fr_8mm_1fr] gap-2 text-[7.5pt]">
          <div>
            <p className="font-bold uppercase">Photos avant travaux / état initial</p>
            {avant.length ? avant.map((photo) => (
              <figure key={photo.id} className="mt-2">
                <img src={photo.src} alt={photo.legende} className="h-[42mm] w-full object-cover" />
                <figcaption>{photo.legende}</figcaption>
              </figure>
            )) : <p className="mt-2 border border-dashed border-slate-300 p-3">Aucune photo d&apos;état initial assignée à ce lot.</p>}
          </div>
          <p className="pt-16 text-center text-lg font-bold text-[#1a5c2e]" aria-hidden>➔</p>
          <div>
            <p className="font-bold uppercase text-[#1a5c2e]">Visuel cible / projection après travaux</p>
            {apres.length ? apres.map((photo) => (
              <figure key={photo.id} className="mt-2">
                <img src={photo.src} alt={photo.legende} className="h-[42mm] w-full object-cover" />
                <figcaption>{photo.legende}</figcaption>
              </figure>
            )) : <p className="mt-2 border border-dashed border-[#1a5c2e] p-3">Visuel cible non déposé. Le niveau de finition reste celui décrit au tableau II.</p>}
            <p className="mt-2 border border-[#0B1F3A] p-2">Niveau d&apos;exigence et de finition contractuel exigé pour le PV de réception sans réserve (Protocole Sûreté-6™️).</p>
          </div>
        </div>
      </article>
    );
  }
  return (
    <article className={classe}>
      <Entete numero={`${numeroBdc(dossier, lot.ordre)}-A2`} date={dateFr(AUJOURDHUI)} statut="Annexe matériel" />
      <h3 className="mt-3 text-[10pt] font-bold">ANNEXE TECHNIQUE N° 2 — MATÉRIEL &amp; SCHÉMA CONSTRUCTEUR</h3>
      <table className="mt-3 w-full border-collapse text-[8pt]">
        <thead><tr className="bg-[#1a5c2e] text-left text-white"><th className="px-2 py-1">Spécification</th><th className="px-2 py-1">Valeur retenue</th></tr></thead>
        <tbody>
          {[["Marque", lot.marque], ["Modèle", lot.modele], ["Références", lot.references], ["Certifications exigées", lot.certifications], ["Schéma de pose / calepinage", lot.schema]].map(([label, valeur]) => (
            <tr key={label}><td className="border border-slate-300 p-2 font-semibold">{label}</td><td className="border border-slate-300 p-2">{valeur || "—"}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[8pt]">Certifications selon le lot : certificat ACERMI pour les isolants, NF PAC / Eurovent pour les pompes à chaleur, ACOTHERM pour les fenêtres. Le sous-traitant applique le DTU du corps d&apos;état et le schéma constructeur.</p>
    </article>
  );
}

function OngletApporteur({ dossier, onFiche }: { dossier: Dossier; onFiche: () => void }) {
  const apporteur = dossier.apporteur;
  if (!apporteur) return null;
  return (
    <section className="max-w-3xl space-y-4" data-testid="onglet-apporteur-jamel">
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/30 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Convention {apporteur.convention}</p>
        <h3 className="mt-1 text-lg font-semibold">Apporteur d&apos;affaires — Jamel HAMZAOUI</h3>
        <p className="mt-2 text-sm text-slate-200">{apporteur.statut}</p>
        <p className="mt-1 text-sm text-slate-300">{apporteur.societe} · SIRET {apporteur.siret}</p>
        <p className="text-sm text-slate-300">{apporteur.adresse}</p>
        <p className="mt-1 text-sm text-slate-300">Convention signée le {apporteur.dateSignature}</p>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[#047857] text-left text-white">
            <th className="px-3 py-2">Règle contractuelle</th>
            <th className="px-3 py-2 text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-white/10">
            <td className="px-3 py-2">{apporteur.articleTaux} — {apporteur.tauxPct} % HT du montant des travaux HT (TVA 20 % exclue)</td>
            <td className="px-3 py-2 text-right">Assiette {euro(apporteur.assietteHt)} HT</td>
          </tr>
          <tr className="border-b border-white/10">
            <td className="px-3 py-2 font-semibold">Montant total de la commission due</td>
            <td className="px-3 py-2 text-right font-semibold">{euro(apporteur.commissionHt)} HT</td>
          </tr>
          <tr className="border-b border-white/10">
            <td className="px-3 py-2">50 % — après purge du délai de rétractation de 14 jours et encaissement de l&apos;acompte client de 30 % ({euro(round2(dossier.venteTtc * 0.3))} TTC) sur le compte Qonto d&apos;ENERGIA CONSEIL IA®</td>
            <td className="px-3 py-2 text-right">{euro(apporteur.jalonHt)} HT</td>
          </tr>
          <tr>
            <td className="px-3 py-2">50 % — à la réception finale, PV signé sans réserve, et encaissement effectif du solde client ({euro(round2(dossier.venteTtc * 0.7))} TTC)</td>
            <td className="px-3 py-2 text-right">{euro(apporteur.jalonHt)} HT</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-slate-300">{apporteur.articleEcheancier}. {apporteur.conditionPaiement}</p>
      <button type="button" onClick={onFiche} className="rounded-xl bg-[#047857] px-4 py-3 text-sm font-semibold">
        Télécharger Fiche Commission Jamel ({apporteur.referenceFiche})
      </button>
    </section>
  );
}

function EnteteEmeraude({ numero, date, statut }: { numero: string; date: string; statut: string }) {
  return (
    <header className="bg-[#047857] px-3 py-2 text-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-2">
          <img src={LOGO} alt="Logo ENERGIA CONSEIL IA" className="h-11 w-auto bg-white p-0.5" />
          <div className="text-[6.4pt] leading-tight">
            <p className="text-[8pt] font-bold">ENERGIA CONSEIL IA® — {BRANDING.slogan}</p>
            <p>Marque déposée INPI n° {BRANDING.inpi} · Bureau d&apos;études &amp; contractant général</p>
            <p>SASU au capital de {BRANDING.capital} · {BRANDING.siege}</p>
            <p>SIRET {BRANDING.siretAffiche} · RCS {BRANDING.rcsAffiche} · TVA {BRANDING.tva} · APE {BRANDING.ape}</p>
            <p>Garantie décennale &amp; RCP : Calipso Assurances n° LUNPIB2604975</p>
            <p>Sylvain LEMBELEMBE — {BRANDING.telephone} — {BRANDING.email}</p>
          </div>
        </div>
        <aside className="w-[46mm] shrink-0 border border-white/50 p-1.5 text-[7pt] leading-snug">
          <p className="font-bold">N° {numero}</p>
          <p>Date : {date}</p>
          <p className="mt-1 font-semibold">{statut}</p>
        </aside>
      </div>
    </header>
  );
}

function DevisVenteClientAbdenabi({ dossier }: { dossier: Dossier }) {
  const lignes = dossier.lignesVente || [];
  const chiffres = synthese(dossier);
  const acompte = round2(dossier.venteTtc * 0.3);
  const solde = round2(dossier.venteTtc * 0.7);
  return (
    <>
      <article className="print-page mx-auto mb-6 w-[210mm] max-w-full bg-white text-[#0B1F3A] shadow">
        <EnteteEmeraude numero={dossier.reference || ABDENABI_DEVIS} date={dossier.dateLibelle || "Octobre 2026"} statut={`Valable ${dossier.validiteJours || 30} jours`} />
        <h3 className="mt-3 text-center text-[12pt] font-bold text-[#047857] underline">DEVIS DE VENTE CLIENT — CLÉ EN MAIN</h3>
        <p className="mt-2 text-[8pt]"><strong>Client.</strong> {dossier.client} — {dossier.adresse}, {dossier.codePostal} {dossier.ville}{dossier.telephone ? ` — ${dossier.telephone}` : ""}</p>
        <p className="text-[8pt]">{dossier.batiment}</p>
        <p className="mt-1 text-[8pt]"><strong>Objet.</strong> {dossier.objet}</p>
        <table className="mt-2 w-full border-collapse text-[7.5pt]">
          <thead>
            <tr className="bg-[#047857] text-left text-white">
              <th className="px-2 py-1">N°</th>
              <th className="px-2 py-1">Désignation</th>
              <th className="px-2 py-1 text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne) => (
              <tr key={ligne.ordre}>
                <td className="border border-slate-300 px-2 py-1">{ligne.ordre}</td>
                <td className="border border-slate-300 px-2 py-1">{ligne.designation}</td>
                <td className="border border-slate-300 px-2 py-1 text-right">{euro(ligne.montantHt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-right text-[9pt] font-semibold">Total travaux HT {euro(chiffres.venteHt)} · TVA {dossier.tauxTva.toLocaleString("fr-FR")} % {euro(round2(dossier.venteTtc - chiffres.venteHt))} · Montant total TTC {euro(dossier.venteTtc)}</p>
        {dossier.ecartConcurrent ? <p className="mt-1 text-[8pt] font-semibold text-[#047857]">{dossier.ecartConcurrent}</p> : null}
        <p className="mt-2 text-[8pt]"><strong>Échéancier.</strong> Acompte de 30 % à la commande : {euro(acompte)} TTC. Solde de 70 % à l&apos;achèvement et réception sans réserve : {euro(solde)} TTC.</p>
        <p className="mt-2 text-[7pt]">Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE. Aucune aide n&apos;est chiffrée sur ce devis.</p>
      </article>
      <article className="print-page print-page-fin mx-auto mb-6 w-[210mm] max-w-full bg-white text-[#0B1F3A] shadow">
        <h3 className="text-[11pt] font-bold text-[#047857]">X. Avis juridique — Julia</h3>
        <div className="mt-2 border-l-4 border-[#f97316] bg-[#fff7ed] p-2 text-[7.5pt]">
          <p>Conformité réglementaire : marché de remplacement de chaudière murale gaz en appartement de copropriété, TVA au taux normal de 20 %. Exécution sous la responsabilité du contractant général ENERGIA CONSEIL IA®, décennale Calipso Assurances n° LUNPIB2604975, marque INPI n° {BRANDING.inpi}.</p>
          <p className="mt-1">Contraintes : conduit collectif VMC Gaz, désembouage et protection magnétique de l&apos;échangeur neuf, certificat de conformité gaz modèle CC2. Échéancier de ce marché : 30 % à la commande, 70 % à la réception sans réserve.</p>
          <p className="mt-1">Clause Julia Protection Aides : responsabilité ENERGIA plafonnée à 2 000 € en cas d&apos;écart supérieur à 10 % imputable à une erreur prouvée d&apos;ENERGIA ; 0 % si erreur client ou décision ANAH/CEE.</p>
          <p className="mt-1 font-semibold">Avis établi par Julia — Juriste ENERGIA CONSEIL IA® — Mars 2026.</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[8pt]">
          <div className="h-[28mm] border border-[#047857] p-2">Bon pour accord. Le client accepte le devis {dossier.reference}.<br />Fait à ________ le ________<br />Signature du client</div>
          <div className="h-[28mm] border border-[#047857] p-2">Pour ENERGIA CONSEIL IA®<br />Sylvain LEMBELEMBE, contractant général</div>
        </div>
        <p className="mt-3 text-[7pt]">Contacts : Sylvain LEMBELEMBE (AMO) 06 10 59 68 98 · DAMIEN (commercial) 06 72 68 09 68 · FABIEN — VIVONS COURTIER 06 71 19 96 45 · Julia (juriste) · MAR Antoine BARATIER — Cabinet C2ET.</p>
      </article>
    </>
  );
}

function BdcSousTraitanceAbdenabi({ dossier }: { dossier: Dossier }) {
  const bdc = dossier.bdc;
  const lot = dossier.lots.find((item) => item.actif);
  if (!bdc) return null;
  return (
    <>
      <article className="print-page mx-auto mb-6 w-[210mm] max-w-full bg-white text-[#0B1F3A] shadow">
        <EnteteEmeraude numero={bdc.reference} date={dossier.dateLibelle || "Octobre 2026"} statut="En attente signature artisan" />
        <h3 className="mt-3 text-center text-[11pt] font-bold text-[#047857] underline">BON DE COMMANDE DE SOUS-TRAITANCE BTP — FORFAIT CLÉ EN MAIN</h3>
        <table className="mt-2 w-full border-collapse text-[8pt]">
          <thead><tr className="bg-[#047857] text-left text-white"><th className="px-2 py-1" colSpan={2}>Parties et lieu d&apos;exécution</th></tr></thead>
          <tbody>
            <tr>
              <td className="w-1/2 border border-slate-300 p-2 align-top"><strong>Donneur d&apos;ordre</strong><br />ENERGIA CONSEIL IA®<br />SIRET {BRANDING.siretAffiche}<br />{BRANDING.siege}<br />Décennale Calipso n° LUNPIB2604975<br />INPI n° {BRANDING.inpi}</td>
              <td className="border border-slate-300 p-2 align-top"><strong>Sous-traitant</strong><br />{bdc.destinataire}<br />Direction des travaux — Momo</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2" colSpan={2}><strong>Adresse chantier.</strong> {bdc.adresseChantier || `${dossier.adresse}, ${dossier.codePostal} ${dossier.ville}`}</td>
            </tr>
          </tbody>
        </table>
        <table className="mt-2 w-full border-collapse text-[8pt]">
          <thead><tr className="bg-[#047857] text-left text-white"><th className="px-2 py-1">Prestation au forfait</th><th className="px-2 py-1 text-right">Montant HT</th></tr></thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 px-2 py-1">{bdc.prestation}</td>
              <td className="border border-slate-300 px-2 py-1 text-right font-semibold whitespace-nowrap">{euro(bdc.montantHt)} HT autoliquidé</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-[7.5pt] font-semibold">Périmètre d&apos;exécution</p>
        <ul className="mt-1 list-disc pl-4 text-[8pt]">
          {bdc.lots.map((ligne) => <li key={ligne}>{ligne}</li>)}
        </ul>
        <p className="mt-2 text-[8pt] font-semibold">{bdc.regime}</p>
        <p className="text-[8pt]">{MENTION_AUTOLIQUIDATION}</p>
        <p className="mt-2 border border-[#047857] bg-emerald-50 p-2 text-[9pt] font-semibold">Montant forfait HT : {euro(bdc.montantHt)} HT autoliquidé — net à payer par ENERGIA CONSEIL IA®</p>
        <ul className="mt-2 list-disc pl-4 text-[8pt]">
          {bdc.conditions.map((condition) => <li key={condition}>{condition}</li>)}
        </ul>
        <p className="mt-2 text-[7.5pt]">Protocole Sûreté-6™️. Le forfait inclut fourniture, pose et déplacement.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-[8pt]">
          <div className="h-[24mm] border border-[#047857] p-2">Bon pour commande et exécution<br />Sylvain LEMBELEMBE<br />ENERGIA CONSEIL IA®</div>
          <div className="h-[24mm] border border-[#047857] p-2">Bon pour accord<br />{bdc.destinataire}</div>
        </div>
      </article>
      <article className="print-page print-page-fin mx-auto mb-6 w-[210mm] max-w-full bg-white text-[#0B1F3A] shadow">
        <EnteteEmeraude numero={`${bdc.reference}-A1`} date={dossier.dateLibelle || "Octobre 2026"} statut="Annexe technique" />
        <h3 className="mt-3 text-[10pt] font-bold text-[#047857]">ANNEXE — MATÉRIEL, DTU ET PREUVES CHANTIER</h3>
        <table className="mt-2 w-full border-collapse text-[8pt]">
          <tbody>
            {[
              ["Marque", lot?.marque || "Saunier Duval"],
              ["Modèle", lot?.modele || "Themafast Classic V 18/24 VMC Gaz"],
              ["Références", lot?.references || "—"],
              ["DTU et certifications", lot?.certifications || "—"],
              ["Schéma de pose", lot?.schema || "—"],
            ].map(([label, valeur]) => (
              <tr key={label}><td className="w-[42mm] border border-slate-300 p-2 font-semibold">{label}</td><td className="border border-slate-300 p-2">{valeur}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[8pt]">Dix photographies de conformité sont exigées avant le PV : conduit VMC, étanchéité gaz, pot à boue magnétique et certificat CC2, en phases Avant, Pendant et Après. Le règlement du forfait intervient sous 48 h après le PV signé sans réserve.</p>
      </article>
    </>
  );
}

function FicheCommissionJamel({ dossier }: { dossier: Dossier }) {
  const apporteur = dossier.apporteur;
  if (!apporteur) return null;
  const acompte = round2(dossier.venteTtc * 0.3);
  const solde = round2(dossier.venteTtc * 0.7);
  return (
    <article className="print-page print-page-fin mx-auto mb-6 w-[210mm] max-w-full bg-white text-[#0B1F3A] shadow">
      <EnteteEmeraude numero={apporteur.referenceFiche} date={dossier.dateLibelle || "Octobre 2026"} statut="Commission contractuelle" />
      <h3 className="mt-3 text-center text-[11pt] font-bold text-[#047857] underline">FICHE DE COMMISSION — APPORTEUR D&apos;AFFAIRES</h3>
      <p className="mt-2 text-[8pt]"><strong>{apporteur.nom}</strong> · {apporteur.societe} · SIRET {apporteur.siret}</p>
      <p className="text-[8pt]">{apporteur.adresse}</p>
      <p className="mt-1 text-[8pt]">Convention {apporteur.convention}, signée le {apporteur.dateSignature}. Chantier {dossier.client}, {dossier.adresse}, {dossier.codePostal} {dossier.ville}.</p>
      <table className="mt-3 w-full border-collapse text-[8pt]">
        <thead><tr className="bg-[#047857] text-left text-white"><th className="px-2 py-1">Règle</th><th className="px-2 py-1 text-right">Montant</th></tr></thead>
        <tbody>
          <tr><td className="border border-slate-300 p-2">{apporteur.articleTaux} — {apporteur.tauxPct} % HT des travaux HT, TVA exclue</td><td className="border border-slate-300 p-2 text-right">Assiette {euro(apporteur.assietteHt)} HT</td></tr>
          <tr><td className="border border-slate-300 p-2 font-semibold">Commission due</td><td className="border border-slate-300 p-2 text-right font-semibold">{euro(apporteur.commissionHt)} HT</td></tr>
          <tr><td className="border border-slate-300 p-2">{apporteur.articleEcheancier} — 50 % après purge des 14 jours de rétractation et encaissement de l&apos;acompte client {euro(acompte)} TTC sur le compte Qonto d&apos;ENERGIA CONSEIL IA®</td><td className="border border-slate-300 p-2 text-right">{euro(apporteur.jalonHt)} HT</td></tr>
          <tr><td className="border border-slate-300 p-2">50 % à la réception finale, PV signé sans réserve, et encaissement du solde client {euro(solde)} TTC</td><td className="border border-slate-300 p-2 text-right">{euro(apporteur.jalonHt)} HT</td></tr>
        </tbody>
      </table>
      <p className="mt-3 text-[8pt]">{apporteur.conditionPaiement}</p>
      <p className="mt-2 text-[7.5pt]">Cette fiche ne communique pas le prix de sous-traitance. Elle constate uniquement la commission contractuelle de l&apos;apporteur sur l&apos;assiette des travaux HT.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-[8pt]">
        <div className="h-[24mm] border border-[#047857] p-2">ENERGIA CONSEIL IA®<br />Sylvain LEMBELEMBE</div>
        <div className="h-[24mm] border border-[#047857] p-2">{apporteur.societe}<br />{apporteur.nom}</div>
      </div>
    </article>
  );
}

function PagesDocument({ dossier, piece }: { dossier: Dossier; piece: DocumentImprime }) {
  if (piece.type === "commission") return <FicheCommissionJamel dossier={dossier} />;
  if ((piece.type === "bdc" || piece.type === "liasse") && dossier.bdc) return <BdcSousTraitanceAbdenabi dossier={dossier} />;
  if (piece.type === "bdc" || piece.type === "liasse") {
    const lots = piece.type === "bdc" ? dossier.lots.filter((lot) => lot.id === piece.lotId) : lotsPrets(dossier);
    const pages = lots.flatMap((lot) => [1, 2, 3] as const);
    return (
      <>
        {lots.flatMap((lot, indexLot) => [1, 2, 3].map((page) => {
          const index = indexLot * 3 + (page - 1);
          return <PageBdc key={`${lot.id}-${page}`} dossier={dossier} lot={lot} page={page} fin={index === pages.length - 1} />;
        }))}
      </>
    );
  }
  if (piece.type === "devis") return dossier.lignesVente?.length ? <DevisVenteClientAbdenabi dossier={dossier} /> : <DevisMarche dossier={dossier} />;
  if (piece.type === "cerfa") return <CerfaTva dossier={dossier} />;
  return <PvReception dossier={dossier} />;
}

function DevisMarche({ dossier }: { dossier: Dossier }) {
  const chiffres = synthese(dossier);
  const lots = dossier.lots.filter((lot) => lot.actif);
  const paires = lots.flatMap((lot) => {
    const avant = photosLot(dossier, lot.id, "avant")[0];
    const apres = photosLot(dossier, lot.id, "apres")[0];
    return avant && apres ? [{ lot, avant, apres }] : [];
  });
  return (
    <>
      <article className="print-page mx-auto mb-6 w-[210mm] max-w-full bg-white text-[#0B1F3A] shadow">
        <Entete numero={dossier.reference || "DEV-2026"} date={dateFr(AUJOURDHUI)} statut="Devis de marché" />
        <h3 className="mt-3 text-center text-[12pt] font-bold underline">DEVIS &amp; MARCHÉ DE CONTRACTANT GÉNÉRAL</h3>
        <p className="mt-2 text-[8pt]"><strong>Client.</strong> {dossier.client} — {dossier.adresse}, {dossier.codePostal} {dossier.ville} — {dossier.telephone} — {dossier.email}</p>
        <p className="text-[8pt]">Démarrage souhaité : {dateFr(dossier.dateDemarrage)}. Interlocuteur commercial : DAMIEN — 06 72 68 09 68.</p>
        <table className="mt-3 w-full border-collapse text-[8pt]">
          <thead><tr className="bg-[#1a5c2e] text-left text-white"><th className="px-2 py-1">Ordre</th><th className="px-2 py-1">Prestations du marché</th></tr></thead>
          <tbody>
            {lots.map((lot) => (
              <tr key={lot.id}><td className="border border-slate-300 p-2">{lot.ordre}</td><td className="border border-slate-300 p-2"><strong>{lot.titre}</strong><br />{lot.designation}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-right text-[9pt] font-semibold">Total HT {euro(chiffres.venteHt)} · TVA {dossier.tauxTva} % · Total TTC {euro(dossier.venteTtc)}</p>
        <p className="mt-2 text-[7.5pt]">Acompte 30 % à la commande : {euro(round2(dossier.venteTtc * 0.3))} TTC. Solde 70 % après procès-verbal de réception sans réserve. Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE. Aucun montant d&apos;aide n&apos;est chiffré sur ce marché.</p>
        <p className="mt-2 text-[7.5pt]">Clause Julia Protection Aides : responsabilité ENERGIA plafonnée à 2 000 € en cas d&apos;écart supérieur à 10 % imputable à une erreur prouvée d&apos;ENERGIA. Avis établi par Julia — Juriste ENERGIA CONSEIL IA® — Mars 2026.</p>
      </article>
      <article className="print-page print-page-fin mx-auto mb-6 w-[210mm] max-w-full bg-white text-[#0B1F3A] shadow">
        <h3 className="text-[10pt] font-bold">Projections après travaux</h3>
        {paires.length === 0 ? <p className="mt-2 text-[8pt]">Aucune paire avant / après n&apos;est encore assignée. Le niveau de finition est celui décrit au devis.</p> : paires.map((paire) => (
          <div key={paire.lot.id} className="mt-3 grid grid-cols-[1fr_8mm_1fr] gap-2 text-[7.5pt]">
            <figure><img src={paire.avant.src} alt={paire.avant.legende} className="h-[40mm] w-full object-cover" /><figcaption>Avant — {paire.avant.legende}</figcaption></figure>
            <p className="pt-10 text-center font-bold" aria-hidden>➔</p>
            <figure><img src={paire.apres.src} alt={paire.apres.legende} className="h-[40mm] w-full object-cover" /><figcaption>Après — {paire.apres.legende}</figcaption></figure>
          </div>
        ))}
        <div className="mt-6 grid grid-cols-2 gap-3 text-[8pt]">
          <div className="h-[28mm] border border-[#0B1F3A] p-2">Bon pour accord. Le client accepte le marché et mandate ENERGIA CONSEIL IA®.<br />Fait à ________ le ________<br />Signature du client</div>
          <div className="h-[28mm] border border-[#0B1F3A] p-2">Pour ENERGIA CONSEIL IA®<br />Sylvain LEMBELEMBE, contractant général</div>
        </div>
        <p className="mt-3 text-[7pt]">Contacts : Sylvain LEMBELEMBE (AMO) 06 10 59 68 98 · DAMIEN (commercial) 06 72 68 09 68 · FABIEN — VIVONS COURTIER 06 71 19 96 45 · Julia (juriste) · MAR Antoine BARATIER — Cabinet C2ET.</p>
      </article>
    </>
  );
}

function CerfaTva({ dossier }: { dossier: Dossier }) {
  return (
    <article className="print-page print-page-fin mx-auto mb-6 w-[210mm] max-w-full bg-white text-[#0B1F3A] shadow">
      <Entete numero="1301-SD" date={dateFr(AUJOURDHUI)} statut="Attestation simplifiée" />
      <h3 className="mt-3 text-center text-[11pt] font-bold">ATTESTATION SIMPLIFIÉE DE TVA — CERFA 1301-SD</h3>
      <p className="mt-2 text-[8pt]">Attestation préremplie pour le marché {dossier.reference || "en cours"}. Le client certifie la nature des locaux et des travaux pour l&apos;application du taux de TVA réduit.</p>
      <table className="mt-3 w-full border-collapse text-[8pt]">
        <thead><tr className="bg-[#1a5c2e] text-left text-white"><th className="px-2 py-1" colSpan={2}>Identité et chantier</th></tr></thead>
        <tbody>
          <tr><td className="border border-slate-300 p-2">Client</td><td className="border border-slate-300 p-2">{dossier.client}</td></tr>
          <tr><td className="border border-slate-300 p-2">Adresse des travaux</td><td className="border border-slate-300 p-2">{dossier.adresse}, {dossier.codePostal} {dossier.ville}</td></tr>
          <tr><td className="border border-slate-300 p-2">Nature</td><td className="border border-slate-300 p-2">Locaux à usage d&apos;habitation achevés depuis plus de deux ans. Travaux d&apos;amélioration, de transformation ou d&apos;aménagement.</td></tr>
          <tr><td className="border border-slate-300 p-2">Taux retenu</td><td className="border border-slate-300 p-2">{dossier.tauxTva} %{dossier.tauxTva === 5.5 ? " — rénovation énergétique" : dossier.tauxTva === 10 ? " — amélioration / autonomie" : " — taux normal"}</td></tr>
        </tbody>
      </table>
      <p className="mt-3 text-[8pt]">Je certifie que les travaux n&apos;augmentent pas la surface de plancher de plus de 10 % et portent sur des locaux d&apos;habitation achevés depuis plus de deux ans, pour la part éligible au taux indiqué.</p>
      <div className="mt-4 h-[32mm] border border-[#0B1F3A] p-2 text-[8pt]">Fait à {dossier.ville || "________"} le {dateFr(AUJOURDHUI)}<br />Signature du client : {dossier.client}</div>
    </article>
  );
}

function PvReception({ dossier }: { dossier: Dossier }) {
  const lots = dossier.lots.filter((lot) => lot.actif);
  return (
    <article className="print-page print-page-fin mx-auto mb-6 w-[210mm] max-w-full bg-white text-[#0B1F3A] shadow">
      <Entete numero={`PV-2026-${tokenClient(dossier.client)}`} date={dateFr(AUJOURDHUI)} statut={dossier.pvSigne ? "Signé sans réserve" : "À signer"} />
      <h3 className="mt-3 text-center text-[11pt] font-bold">PROCÈS-VERBAL DE RÉCEPTION DE CHANTIER SANS RÉSERVE</h3>
      <p className="mt-2 text-[8pt]"><strong>Chantier.</strong> {dossier.client} — {dossier.adresse}, {dossier.codePostal} {dossier.ville}. Marché {dossier.reference || "—"}.</p>
      <table className="mt-3 w-full border-collapse text-[8pt]">
        <thead><tr className="bg-[#1a5c2e] text-left text-white"><th className="px-2 py-1">Lot</th><th className="px-2 py-1">Constat</th></tr></thead>
        <tbody>
          {lots.map((lot) => (
            <tr key={lot.id}><td className="border border-slate-300 p-2">{lot.ordre}. {lot.titre}<br />{lot.artisan}</td><td className="border border-slate-300 p-2">Réceptionné. Parfait achèvement constaté, sans réserve.</td></tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[8pt]">Les parties constatent le parfait achèvement des lots ci-dessus. Ce procès-verbal déclenche le règlement des sous-traitants sous 48 h et la facture de solde de 70 % du marché client, soit {euro(round2(dossier.venteTtc * 0.7))} TTC. Protocole Sûreté-6™️.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-[8pt]">
        <div className="h-[28mm] border border-[#0B1F3A] p-2">Le client, {dossier.client}<br />Bon pour réception sans réserve</div>
        <div className="h-[28mm] border border-[#0B1F3A] p-2">ENERGIA CONSEIL IA®<br />Sylvain LEMBELEMBE, contractant général</div>
      </div>
    </article>
  );
}

function ApercuDocument({ dossier, piece, onFermer }: { dossier: Dossier; piece: DocumentImprime; onFermer: () => void }) {
  useEffect(() => {
    const precedent = document.title;
    const titre = piece.type === "devis"
      ? dossier.reference
      : piece.type === "commission"
        ? dossier.apporteur?.referenceFiche
        : piece.type === "bdc" || piece.type === "liasse"
          ? dossier.bdc?.reference
          : "";
    if (titre) document.title = titre;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onFermer();
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.title = precedent;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [onFermer, dossier, piece]);
  return createPortal(
    <>
      <style>{PRINT_CSS}</style>
      <div className="master-noprint fixed inset-x-0 top-0 z-[98] flex justify-end gap-2 bg-[#047857] px-4 py-2">
        {piece.type === "cerfa" ? (
          <a href={CERFA_1301_SD} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#f9c74f] px-3 py-1.5 text-sm font-semibold text-[#0B1F3A]">Télécharger le Cerfa officiel</a>
        ) : null}
        <button type="button" onClick={() => window.print()} className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-[#047857]">Enregistrer en PDF</button>
        <button type="button" onClick={onFermer} className="rounded-lg border border-white/30 px-3 py-1.5 text-sm text-white">Fermer l&apos;aperçu</button>
      </div>
      <div id="printable-document" className="fixed inset-0 z-[97] overflow-auto bg-slate-300 pt-14">
        <PagesDocument dossier={dossier} piece={piece} />
      </div>
    </>,
    document.body,
  );
}
