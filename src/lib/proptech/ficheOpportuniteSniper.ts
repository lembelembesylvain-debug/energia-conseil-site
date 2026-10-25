/**
 * Fiche d'opportunité foncière Carto Sniper — composition des données et PDF A4.
 * Les huit cibles Chagny / Corpeau priment sur le flux IGN lorsque l'adresse correspond,
 * parce que les coordonnées de démonstration ne tombent pas toujours sur la parcelle réelle.
 */
import { jsPDF } from "jspdf";
import {
  alerteBailleur,
  factureEdfEstimee,
  formaterEntierFr,
  libelleMotifDpe,
  type MotifDpe,
  type StatutOccupation,
} from "./statutMarcheDpe";
import { classerStatutTransaction, type MutationParcelle, type StatutTransaction } from "./statutTransactionDvf";

export type EtiquetteDpe = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type ModeAffichage = "pdf" | "ecran";

export interface TransactionFiche {
  date: string;
  prixNet: number | null;
  prixM2: number | null;
  surfaceM2: number | null;
  adresse: string;
}

export interface LogementPourFiche {
  id?: string;
  adresse?: string;
  commune?: string;
  codePostal?: string;
  etiquette?: string;
  surface?: number | null;
  annee?: number | null;
  type?: string;
  chauffage?: string;
  conso?: number | null;
  motifDpe?: MotifDpe | null;
  statutOccupation?: StatutOccupation | null;
  dateDpe?: string | null;
  couvertureDixAns?: boolean | null;
  mutationsDvf?: MutationParcelle[] | null;
}

export interface SniperPourFiche {
  cadastre?: {
    parcelle?: {
      section?: string;
      numero?: string;
      commune?: string;
      codeDep?: string;
      codeInsee?: string;
      surfaceTerrainM2?: number | null;
    } | null;
    bati?: {
      empriseSolM2?: number | null;
    } | null;
  } | null;
  dvf?: {
    prixM2Median?: number | null;
    perimetre?: string | null;
    mutations?: Array<{
      date?: string | null;
      prixNet?: number | null;
      prixM2?: number | null;
      surfaceM2?: number | null;
      adresse?: string;
    }>;
  } | null;
}

interface CibleLocale {
  id: string;
  adresse: string;
  codePostal: string;
  commune: string;
  codeDep: string;
  typeBati: string;
  surfaceHabitableM2: number;
  anneeConstruction: number;
  chauffage: string;
  consoKwhM2: number;
  etiquette: EtiquetteDpe;
  motifDpe?: MotifDpe;
  statutOccupation?: StatutOccupation;
  section: string;
  numero: string;
  terrainM2: number | null;
  empriseM2: number | null;
  potentielFoncier: string;
  prixM2Median: number | null;
  transactions: TransactionFiche[];
  noteMarche: string;
}

export interface FicheOpportunite {
  ancreeSurReleve: boolean;
  reference: string;
  dateEdition: string;
  source: string;
  adresseComplete: string;
  typeBati: string;
  surfaceHabitableM2: number | null;
  anneeConstruction: number | null;
  chauffage: string;
  commune: string;
  departement: string;
  codeDep: string;
  section: string;
  numero: string;
  terrainM2: number | null;
  empriseM2: number | null;
  ratioOccupation: number | null;
  potentielFoncier: string;
  etiquette: EtiquetteDpe | null;
  consoKwhM2: number | null;
  motifDpe: MotifDpe | null;
  statutOccupation: StatutOccupation | null;
  libelleMotif: string;
  statutClimat: string;
  deperditions: string;
  impactCombustible: string;
  perimetreMarche: string;
  prixM2Median: number | null;
  transactions: TransactionFiche[];
  valeurSectorielle: number | null;
  valeurApresReno: number | null;
  upliftPct: number | null;
  noteMarche: string;
  preconisations: readonly string[];
  statutTransaction: StatutTransaction;
}

export interface PaireFiche {
  label: string;
  valeur: string;
}

export interface PresentationFiche {
  reference: string;
  dateEdition: string;
  source: string;
  identite: PaireFiche[];
  foncier: PaireFiche[];
  potentiel: string;
  etiquette: EtiquetteDpe | null;
  conso: string;
  statut: string;
  deperditions: string;
  impact: string;
  marche: string[];
  encadreMutation: string;
  preconisations: readonly string[];
  mentionAides: string;
  piedConfidentialite: string;
  piedContact: string;
  piedEquipe: string;
}

export const ENTETE_FICHE = {
  sousTitre: "Bureau d'Ingénierie & Ensemblier Contractant Général",
  inpi: "Marque déposée INPI n° 5213845",
  adresse: "16 Rue Cuvier, 69006 Lyon",
  partenariat: "En partenariat avec la Signature Immobilière d'Exception",
  document: "FICHE D'OPPORTUNITÉ FONCIÈRE & AUDIT ÉNERGÉTIQUE — CARTO SNIPER",
} as const;

export const MENTION_AIDES =
  "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE. Ne jamais signer les devis définitifs avant l'accord écrit de l'ANAH, sous peine de perte définitive du parcours MaPrimeRénov'.";

export const PIED_CONTACT = "contact@energia-conseil-ia.com | 06 10 59 68 98 | renovoptim-ia.com";

export const PIED_EQUIPE =
  "Sylvain LEMBELEMBE (AMO) 06 10 59 68 98 | DAMIEN (Commercial) 06 72 68 09 68 | FABIEN (VIVONS COURTIER) 06 71 19 96 45 | Julia (Juriste) | MAR Antoine BARATIER - Cabinet C2ET.";

const PRECONISATIONS = [
  "Audit énergétique réglementaire et scénarios de travaux.",
  "Éradication de l'énergie fossile : remplacement fioul/gaz par PAC air/eau hybride ou haute température, dimensionnée après isolation.",
  "Traitement de l'enveloppe thermique : ITE des façades, isolation toiture/combles, VMC hygro B.",
  "Mobilisation des subventions : MaPrimeRénov' Parcours Accompagné 2026 (jusqu'à 80-90 % de prise en charge) et CEE Coup de pouce.",
] as const;

export const COULEURS_ADEME: Record<EtiquetteDpe, { fond: string; texte: string; rvb: readonly [number, number, number] }> = {
  A: { fond: "#319834", texte: "#ffffff", rvb: [49, 152, 52] },
  B: { fond: "#34a357", texte: "#ffffff", rvb: [52, 163, 87] },
  C: { fond: "#c3d600", texte: "#1a1a1a", rvb: [195, 214, 0] },
  D: { fond: "#fbee00", texte: "#1a1a1a", rvb: [251, 238, 0] },
  E: { fond: "#f5a202", texte: "#1a1a1a", rvb: [245, 162, 2] },
  F: { fond: "#ee6c1e", texte: "#ffffff", rvb: [238, 108, 30] },
  G: { fond: "#e31d23", texte: "#ffffff", rvb: [227, 29, 35] },
};

const DEPARTEMENTS: Record<string, string> = {
  "21": "Côte-d'Or",
  "42": "Loire",
  "69": "Rhône",
  "71": "Saône-et-Loire",
};

const LETTRES: readonly EtiquetteDpe[] = ["A", "B", "C", "D", "E", "F", "G"];

/** Barème énergie primaire ADEME en vigueur (kWhEP/m².an). */
export function etiquetteDepuisConso(conso: number): EtiquetteDpe {
  if (conso <= 70) return "A";
  if (conso <= 110) return "B";
  if (conso <= 180) return "C";
  if (conso <= 250) return "D";
  if (conso <= 330) return "E";
  if (conso <= 420) return "F";
  return "G";
}

export const CIBLES_TERRAIN_CHAGNY: readonly CibleLocale[] = [
  {
    id: "71-DPE-0023",
    adresse: "103 Rue de la République",
    codePostal: "71150",
    commune: "Chagny",
    codeDep: "71",
    typeBati: "Maison individuelle",
    surfaceHabitableM2: 161,
    anneeConstruction: 1962,
    chauffage: "bois",
    consoKwhM2: 354,
    etiquette: "F",
    motifDpe: "vente",
    statutOccupation: "occupant",
    section: "AB",
    numero: "0102",
    terrainM2: 10320,
    empriseM2: 18,
    potentielFoncier: "Emprise bâtie très faible. Terrain divisible, dépendances ou cour à confirmer au PLU.",
    prixM2Median: 1375,
    transactions: [],
    noteMarche: "Prix moyen sectoriel appliqué à la surface habitable, avant décote de passoire.",
  },
  {
    id: "71-DPE-0021",
    adresse: "68 Rue de la République",
    codePostal: "71150",
    commune: "Chagny",
    codeDep: "71",
    typeBati: "Maison individuelle",
    surfaceHabitableM2: 129,
    anneeConstruction: 1966,
    chauffage: "gaz",
    consoKwhM2: 438,
    etiquette: "G",
    motifDpe: "location",
    statutOccupation: "bailleur",
    section: "AB",
    numero: "0049",
    terrainM2: 30390,
    empriseM2: null,
    potentielFoncier: "Domaine XXL. Dépendances, grange ou cour fermée possibles. Terrain divisible sous réserve d'urbanisme.",
    prixM2Median: 1475,
    transactions: [],
    noteMarche: "Domaine étendu : le prix au mètre carré bâti ne capitalise pas, à lui seul, l'assiette foncière.",
  },
  {
    id: "71-DPE-0020",
    adresse: "15 Rue de la République",
    codePostal: "71150",
    commune: "Chagny",
    codeDep: "71",
    typeBati: "Maison individuelle",
    surfaceHabitableM2: 176,
    anneeConstruction: 1952,
    chauffage: "fioul",
    consoKwhM2: 475,
    etiquette: "G",
    motifDpe: "vente",
    statutOccupation: "occupant",
    section: "",
    numero: "",
    terrainM2: null,
    empriseM2: null,
    potentielFoncier: "Propriétaire historique, pas de mutation récente. Dépendances et assiette à recouper sur le cadastre.",
    prixM2Median: null,
    transactions: [],
    noteMarche: "Propriétaire historique. Aucune mutation récente : la valeur vénale reste à établir.",
  },
  {
    id: "71-DPE-0022",
    adresse: "149 Rue des Halles",
    codePostal: "71150",
    commune: "Chagny",
    codeDep: "71",
    typeBati: "Maison individuelle",
    surfaceHabitableM2: 159,
    anneeConstruction: 1968,
    chauffage: "fioul",
    consoKwhM2: 209,
    // 209 kWhEP/m².an est en classe D (bande 181-250). Le relevé de nuit indiquait E.
    etiquette: "D",
    motifDpe: "vente",
    statutOccupation: "occupant",
    section: "AC",
    numero: "0033",
    terrainM2: 1257,
    empriseM2: 246,
    potentielFoncier: "Propriété en L au centre-ville. Emprise bâtie importante, cour et ailes. Division peu évidente.",
    prixM2Median: null,
    transactions: [
      {
        date: "Récente",
        prixNet: 400000,
        prixM2: null,
        surfaceM2: null,
        adresse: "Vente voisine, Rue des Halles, Chagny",
      },
    ],
    noteMarche: "La vente voisine ne fixe pas la valeur de cette propriété en L.",
  },
  {
    id: "71-DPE-0017",
    adresse: "150 Rue des Halles",
    codePostal: "71150",
    commune: "Chagny",
    codeDep: "71",
    typeBati: "Maison individuelle",
    surfaceHabitableM2: 70,
    anneeConstruction: 1964,
    chauffage: "fioul",
    consoKwhM2: 218,
    etiquette: "D",
    motifDpe: "location",
    statutOccupation: "bailleur",
    section: "AD",
    numero: "0058",
    terrainM2: 12257,
    empriseM2: 161,
    potentielFoncier: "Parc centre-ville. Habitable modeste au regard de l'assiette. Terrain divisible, dépendances possibles.",
    prixM2Median: null,
    transactions: [],
    noteMarche: "Pas de mutation exploitable dans le jeu analysé. Valeur vénale à établir.",
  },
  {
    id: "71-DPE-0018",
    adresse: "48 Rue des Halles",
    codePostal: "71150",
    commune: "Chagny",
    codeDep: "71",
    typeBati: "Maison individuelle",
    surfaceHabitableM2: 71,
    anneeConstruction: 1957,
    chauffage: "fioul",
    consoKwhM2: 257,
    etiquette: "E",
    section: "BD",
    numero: "0118",
    terrainM2: 14543,
    empriseM2: null,
    potentielFoncier: "Parc géant. Potentiel de grange, dépendances ou détachement, à confirmer au PLU.",
    prixM2Median: null,
    transactions: [],
    noteMarche: "Pas de mutation exploitable dans le jeu analysé. Valeur vénale à établir.",
  },
  {
    id: "71-DPE-0019",
    adresse: "125 Rue des Halles",
    codePostal: "71150",
    commune: "Chagny",
    codeDep: "71",
    typeBati: "Maison individuelle",
    surfaceHabitableM2: 103,
    anneeConstruction: 1956,
    chauffage: "fioul",
    consoKwhM2: 306,
    etiquette: "E",
    section: "BK",
    numero: "0239",
    terrainM2: 800,
    empriseM2: null,
    potentielFoncier: "Pavillon sur parcelle contenue, impasse des Érables. Peu divisible. Valorisation par la rénovation.",
    prixM2Median: 2222,
    transactions: [
      {
        date: "Récente",
        prixNet: 361800,
        prixM2: null,
        surfaceM2: null,
        adresse: "Vente voisine, secteur Impasse des Érables",
      },
    ],
    noteMarche: "La vente voisine porte sur un bien distinct. Le prix sectoriel est un ordre de grandeur, avant décote énergétique.",
  },
  {
    id: "71-DPE-0024",
    adresse: "58 Rue de la République",
    codePostal: "21190",
    commune: "Corpeau",
    codeDep: "21",
    typeBati: "Maison individuelle",
    surfaceHabitableM2: 113,
    anneeConstruction: 1957,
    chauffage: "gaz",
    consoKwhM2: 383,
    etiquette: "F",
    section: "AI",
    numero: "0016",
    terrainM2: 2796,
    empriseM2: null,
    potentielFoncier: "Porte des Grands Crus. Parcelle confortable, annexe ou jardin de rapport possibles.",
    prixM2Median: null,
    transactions: [],
    noteMarche: "Pas de mutation exploitable dans le jeu analysé. Valeur vénale à établir.",
  },
];

function texte(valeur: unknown): string {
  return typeof valeur === "string" ? valeur.trim() : "";
}

function nombre(valeur: unknown): number | null {
  if (typeof valeur === "number" && Number.isFinite(valeur)) return valeur;
  if (typeof valeur === "string" && valeur.trim() !== "") {
    const n = Number(valeur);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function cleAdresse(valeur: string): string {
  return valeur
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function estEtiquette(valeur: string): valeur is EtiquetteDpe {
  return (LETTRES as readonly string[]).includes(valeur);
}

export function textePdf(valeur: string): string {
  return valeur
    .replace(/\s*\u20AC/g, " EUR")
    .replace(/\u00AE/g, " (R)")
    .replace(/\u00B2/g, "2")
    .replace(/[\u202F\u00A0\u2009]/g, " ")
    .replace(/[\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u2026/g, "...")
    .replace(/[^\n\r\t\x20-\xFF]/g, "");
}

export function formaterRatio(ratio: number | null): string {
  if (ratio == null || !Number.isFinite(ratio)) return "Non calculé";
  const pct = ratio * 100;
  const digits = pct < 1 ? 2 : 1;
  return `${pct.toLocaleString("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits })} %`;
}

export function formaterHectares(m2: number | null): string | null {
  if (m2 == null || !Number.isFinite(m2)) return null;
  return (m2 / 10000).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function numeroCadastre(brut: string): string {
  const v = brut.trim();
  if (!v) return "";
  return /^\d+$/.test(v) ? v.padStart(4, "0") : v.toUpperCase();
}

function codeDepDepuis(cp: string, explicite: string): string {
  const direct = explicite.trim();
  if (/^\d{2,3}$/.test(direct)) return direct;
  const code = cp.trim();
  if (code.startsWith("97") || code.startsWith("98")) return code.slice(0, 3);
  return code.length >= 2 ? code.slice(0, 2) : "71";
}

function nomDepartement(code: string): string {
  return DEPARTEMENTS[code] ?? `Département ${code}`;
}

function libelleChauffage(brut: string): string {
  const v = cleAdresse(brut);
  if (!v) return "Non renseigné";
  if (v.includes("fioul") || v.includes("fuel") || v.includes("mazout")) return "Fioul";
  if (v.includes("gaz")) return "Gaz";
  if (v.includes("bois") || v.includes("granule") || v.includes("pellet")) return "Bois";
  if (v.includes("elec")) return "Électricité";
  if (v.includes("pac") || v.includes("pompe")) return "Pompe à chaleur";
  if (v.includes("charbon")) return "Charbon";
  const propre = brut.trim();
  return propre.charAt(0).toLocaleUpperCase("fr-FR") + propre.slice(1);
}

function typeBatiDepuis(brut: string): string {
  const v = cleAdresse(brut);
  if (!v) return "Maison individuelle";
  if (v.includes("immeuble") || v.includes("collectif") || v.includes("appartement")) return "Immeuble";
  return "Maison individuelle";
}

function statutClimat(
  etiquette: EtiquetteDpe | null,
  conso: number | null,
  motifDpe: MotifDpe | null,
  statutOccupation: StatutOccupation | null,
): string {
  const urgence = alerteBailleur({ motifDpe, statutOccupation, etiquette });
  if (urgence) {
    if (etiquette === "G" && conso != null && conso >= 450) {
      return `${urgence} Consommation G extrême.`;
    }
    return urgence;
  }
  if (etiquette === "G") {
    const extreme = conso != null && conso >= 450 ? " G extrême." : "";
    return `Passoire thermique G - location interdite depuis le 1er janvier 2025, gel des loyers, audit énergétique obligatoire pour la vente.${extreme}`;
  }
  if (etiquette === "F") {
    return "Passoire thermique F - gel des loyers, audit énergétique obligatoire pour la vente, interdiction de location au 1er janvier 2028.";
  }
  if (etiquette === "E") {
    return "Classe E - audit énergétique obligatoire pour la vente depuis le 1er janvier 2025. Interdiction de location visée au 1er janvier 2034.";
  }
  if (etiquette === "D") {
    return "Classe D - hors gel des loyers et hors interdiction de location. Audit énergétique à la vente généralisé en 2034. Trajectoire de rénovation à anticiper.";
  }
  if (etiquette == null) {
    return "Classe énergétique non renseignée. Un audit réglementaire fixera la lettre et les obligations de vente.";
  }
  return `Classe ${etiquette} - situation plus favorable. L'audit confirmera les postes utiles avant travaux.`;
}

function deperditionsDe(etiquette: EtiquetteDpe | null): string {
  if (etiquette === "F" || etiquette === "G") {
    return "Déperditions très élevées. L'enveloppe (combles, murs, menuiseries) prime sur le changement de générateur. Isolation avant PAC.";
  }
  if (etiquette === "E") {
    return "Déperditions élevées. Isolation des combles et des murs avant tout dimensionnement de PAC.";
  }
  if (etiquette === "D") {
    return "Déperditions modérées à fortes selon les postes. L'audit départagera combles, murs et menuiseries.";
  }
  return "Déperditions à quantifier par l'audit. L'ordre des travaux reste : isolation, puis ventilation, puis chauffage.";
}

function impactDe(chauffage: string, surface: number | null, conso: number | null): string {
  if (chauffage === "Fioul") {
    return "Fioul : énergie fossile, coût volatil, émissions élevées. Substitution par PAC air/eau après isolation.";
  }
  if (chauffage === "Gaz") {
    return "Gaz : énergie fossile réseau. Substitution par PAC air/eau hybride ou haute température après isolation.";
  }
  if (chauffage === "Bois") {
    return "Bois : appoint possible si l'appareil est performant. Une PAC en base se dimensionne après isolation.";
  }
  if (chauffage === "Électricité") {
    const facture = factureEdfEstimee(surface, conso);
    const montant = facture != null ? `${formaterEntierFr(facture)} EUR` : "non chiffrable";
    return `Effet Joule : coût d'usage élevé. Facture EDF annuelle estimée : ${montant}. PAC air/eau après traitement de l'enveloppe.`;
  }
  return "Combustible à qualifier sur place. Le générateur se choisit après l'enveloppe.";
}

function preconisationsDe(chauffage: string): readonly string[] {
  if (chauffage !== "Électricité") return PRECONISATIONS;
  return [
    ...PRECONISATIONS,
    "Centrale solaire en toiture 6-9 kWc + Stockage Tesla Powerwall 3 pour effacement tarifaire.",
  ];
}

function potentielLive(terrain: number | null, emprise: number | null): string {
  if (terrain == null) {
    return "Potentiel foncier à confirmer sur place : dépendances, grange, cour fermée ou terrain divisible.";
  }
  if (terrain >= 5000) {
    return "Assiette foncière étendue. Division, dépendances ou grange à confirmer au cadastre et au PLU.";
  }
  if (terrain >= 1500) {
    return "Parcelle confortable. Cour, annexe ou détachement éventuel à vérifier.";
  }
  if (emprise != null && terrain > 0 && emprise / terrain > 0.35) {
    return "Emprise bâtie forte. Division peu probable, valorisation surtout par la rénovation.";
  }
  return "Parcelle contenue. Dépendances et divisibilité à confirmer sur place.";
}

function upliftDe(etiquette: EtiquetteDpe | null): number | null {
  if (etiquette === "G") return 0.2;
  if (etiquette === "F") return 0.15;
  if (etiquette === "E") return 0.1;
  if (etiquette === "D") return 0.08;
  if (etiquette === "A" || etiquette === "B" || etiquette === "C") return 0.05;
  return null;
}

function arrondir(valeur: number, pas: number): number {
  return Math.round(valeur / pas) * pas;
}

function trouverCible(logement: LogementPourFiche | null | undefined): CibleLocale | null {
  if (!logement) return null;
  const id = texte(logement.id);
  if (id) {
    const parId = CIBLES_TERRAIN_CHAGNY.find((cible) => cible.id === id);
    if (parId) return parId;
  }
  const adresse = cleAdresse(texte(logement.adresse));
  if (!adresse) return null;
  const candidats = CIBLES_TERRAIN_CHAGNY.filter((cible) => cleAdresse(cible.adresse) === adresse);
  if (candidats.length !== 1) return null;
  const cible = candidats[0];
  const surface = nombre(logement.surface);
  if (surface != null && Math.abs(surface - cible.surfaceHabitableM2) > 2) return null;
  return cible;
}

function suffixeReference(id: string, section: string, numero: string): string {
  if (section && numero) return `${section}${numero}`.replace(/\s/g, "").toUpperCase();
  const trouve = /(\d{3,})$/.exec(id);
  return trouve ? trouve[1] : "XXXX";
}

function adresseCompleteDe(rue: string, cp: string, commune: string): string {
  if (!rue && !commune) return "Adresse non renseignée";
  const loc = [cp, commune].filter(Boolean).join(" ");
  if (!rue) return loc || "Adresse non renseignée";
  if (!loc) return rue;
  return `${rue}, ${loc}`;
}

function dateEditionFr(): string {
  return new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function mutationsPourStatut(
  cible: CibleLocale | null,
  logement: LogementPourFiche | null | undefined,
  sniper: SniperPourFiche | null | undefined,
): MutationParcelle[] {
  const locales = cible?.transactions?.length ? cible.transactions : logement?.mutationsDvf ?? [];
  if (locales.length) {
    return locales.map((mutation) => ({
      date: mutation.date,
      prixNet: mutation.prixNet,
      prixM2: mutation.prixM2,
      surfaceM2: mutation.surfaceM2,
      surParcelle: true,
    }));
  }
  if (sniper?.dvf?.perimetre !== "parcelle") return [];
  return (sniper.dvf.mutations ?? []).map((mutation) => ({
    date: mutation.date,
    prixNet: mutation.prixNet,
    prixM2: mutation.prixM2,
    surfaceM2: mutation.surfaceM2,
    surParcelle: true,
  }));
}

function transactionsLive(sniper: SniperPourFiche | null | undefined): TransactionFiche[] {
  const liste = sniper?.dvf?.mutations ?? [];
  return liste.slice(0, 4).map((mutation) => ({
    date: texte(mutation.date) || "Date non précisée",
    prixNet: nombre(mutation.prixNet),
    prixM2: nombre(mutation.prixM2),
    surfaceM2: nombre(mutation.surfaceM2),
    adresse: texte(mutation.adresse) || "Adresse non précisée",
  }));
}

export function composerFicheOpportunite(
  logement: LogementPourFiche | null | undefined,
  sniper: SniperPourFiche | null | undefined,
): FicheOpportunite {
  const cible = trouverCible(logement);
  const parcelle = sniper?.cadastre?.parcelle ?? null;
  const annee = new Date().getFullYear();

  const rue = cible?.adresse || texte(logement?.adresse);
  const cp = cible?.codePostal || texte(logement?.codePostal);
  const commune = cible?.commune || texte(parcelle?.commune) || texte(logement?.commune);
  const codeDep = cible?.codeDep || codeDepDepuis(cp, texte(parcelle?.codeDep));
  const section = (cible ? cible.section : texte(parcelle?.section)).toUpperCase();
  const numero = cible ? cible.numero : numeroCadastre(texte(parcelle?.numero));
  const terrain = cible ? cible.terrainM2 : nombre(parcelle?.surfaceTerrainM2);
  const emprise = cible ? cible.empriseM2 : nombre(sniper?.cadastre?.bati?.empriseSolM2);
  const surface = cible?.surfaceHabitableM2 ?? nombre(logement?.surface);
  const anneeConstruction = cible?.anneeConstruction ?? nombre(logement?.annee);
  const conso = cible?.consoKwhM2 ?? nombre(logement?.conso);
  const etiquetteBrute = texte(logement?.etiquette).toUpperCase();
  const etiquette: EtiquetteDpe | null = cible
    ? cible.etiquette
    : estEtiquette(etiquetteBrute)
      ? etiquetteBrute
      : conso != null
        ? etiquetteDepuisConso(conso)
        : null;
  const chauffage = libelleChauffage(cible?.chauffage || texte(logement?.chauffage));
  const typeBati = cible?.typeBati || typeBatiDepuis(texte(logement?.type));
  const prixM2 = cible ? cible.prixM2Median : nombre(sniper?.dvf?.prixM2Median);
  const transactions = cible ? cible.transactions : transactionsLive(sniper);
  const uplift = upliftDe(etiquette);
  const valeurSectorielle =
    prixM2 != null && surface != null && surface > 0 ? Math.round(prixM2 * surface) : null;
  const valeurApresReno =
    valeurSectorielle != null && uplift != null ? arrondir(valeurSectorielle * (1 + uplift), 100) : null;
  const id = cible?.id || texte(logement?.id);
  const ratio = terrain != null && terrain > 0 && emprise != null ? emprise / terrain : null;
  const motifDpe = cible?.motifDpe ?? logement?.motifDpe ?? null;
  const statutOccupation = cible?.statutOccupation ?? logement?.statutOccupation ?? null;
  const statutTransaction = classerStatutTransaction({
    motifDpe,
    statutOccupation,
    etiquette,
    chauffage,
    conso,
    surface,
    dateDpe: logement?.dateDpe,
    couvertureDixAns: logement?.couvertureDixAns,
    mutationsDvf: mutationsPourStatut(cible, logement, sniper),
  });

  return {
    ancreeSurReleve: cible != null,
    reference: `SNIPER-${codeDep || "71"}-${annee}-${suffixeReference(id, section, numero)}`,
    dateEdition: dateEditionFr(),
    source: cible
      ? "Relevé terrain ENERGIA - secteur Chagny / Corpeau"
      : "Flux ouvert IGN, DVF et DPE",
    adresseComplete: adresseCompleteDe(rue, cp, commune),
    typeBati,
    surfaceHabitableM2: surface,
    anneeConstruction,
    chauffage,
    commune: commune || "Commune non renseignée",
    departement: nomDepartement(codeDep || "71"),
    codeDep: codeDep || "71",
    section,
    numero,
    terrainM2: terrain,
    empriseM2: emprise,
    ratioOccupation: ratio,
    potentielFoncier: cible?.potentielFoncier || potentielLive(terrain, emprise),
    etiquette,
    consoKwhM2: conso,
    motifDpe,
    statutOccupation,
    libelleMotif: libelleMotifDpe({ motifDpe, statutOccupation, etiquette }),
    statutClimat: statutClimat(etiquette, conso, motifDpe, statutOccupation),
    deperditions: deperditionsDe(etiquette),
    impactCombustible: impactDe(chauffage, surface, conso),
    perimetreMarche: cible
      ? "Relevé DVF 5 ans - secteur immédiat"
      : `DVF 5 ans - ${texte(sniper?.dvf?.perimetre) || "périmètre non précisé"}`,
    prixM2Median: prixM2,
    transactions,
    valeurSectorielle,
    valeurApresReno,
    upliftPct: valeurSectorielle != null ? uplift : null,
    noteMarche: cible?.noteMarche || "",
    preconisations: preconisationsDe(chauffage),
    statutTransaction,
  };
}

export function peutExporterFiche(fiche: FicheOpportunite): boolean {
  const adresseUtile = fiche.adresseComplete !== "Adresse non renseignée";
  const parcelleUtile = Boolean(fiche.section || fiche.numero || fiche.terrainM2);
  const dpeUtile = fiche.etiquette != null || fiche.consoKwhM2 != null;
  return adresseUtile || parcelleUtile || dpeUtile;
}

function symboleSurface(mode: ModeAffichage): string {
  return mode === "pdf" ? "m2" : "m²";
}

function montant(valeur: number | null, mode: ModeAffichage): string {
  if (valeur == null || !Number.isFinite(valeur)) return "Non chiffré";
  const nombreFormate = Math.round(valeur).toLocaleString("fr-FR");
  if (mode === "pdf") return `${nombreFormate} EUR`;
  return `${nombreFormate}\u00A0€`;
}

function surfaceTexte(valeur: number | null, mode: ModeAffichage, hectares: boolean): string {
  if (valeur == null) return "Non communiquée";
  const unite = symboleSurface(mode);
  const metres = `${Math.round(valeur).toLocaleString("fr-FR")} ${unite}`;
  if (!hectares) return metres;
  const ha = (valeur / 10000).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${metres} (${ha} ha)`;
}

function formaterDateTransaction(brut: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(brut)) {
    const [annee, mois, jour] = brut.split("-");
    return `${jour}/${mois}/${annee}`;
  }
  return brut;
}

function marque(mode: ModeAffichage): string {
  return mode === "pdf" ? "ENERGIA CONSEIL IA (R)" : "ENERGIA CONSEIL IA\u00AE";
}

export function presenterFiche(fiche: FicheOpportunite, mode: ModeAffichage): PresentationFiche {
  const unite = symboleSurface(mode);
  const conso =
    fiche.consoKwhM2 == null
      ? "Consommation d'énergie primaire non renseignée."
      : `Consommation d'énergie primaire : ${Math.round(fiche.consoKwhM2).toLocaleString("fr-FR")} kWh/${unite}.an`;

  const marche: string[] = [
    fiche.perimetreMarche,
    fiche.prixM2Median == null
      ? `Prix moyen au ${unite} : non constaté sur le secteur immédiat.`
      : `Prix moyen au ${unite} constaté : ${montant(fiche.prixM2Median, mode)}/${unite}`,
  ];

  if (fiche.transactions.length === 0) {
    marche.push("Dernières transactions comparables : aucune mutation récente exploitable.");
  } else {
    marche.push("Dernières transactions comparables :");
    fiche.transactions.slice(0, 3).forEach((mutation) => {
      const morceaux = [
        formaterDateTransaction(mutation.date),
        mutation.prixNet != null ? montant(mutation.prixNet, mode) : "",
        mutation.surfaceM2 != null ? surfaceTexte(mutation.surfaceM2, mode, false) : "",
        mutation.adresse,
      ].filter(Boolean);
      marche.push(morceaux.join(" | "));
    });
  }

  if (fiche.valeurSectorielle != null && fiche.surfaceHabitableM2 != null && fiche.prixM2Median != null) {
    marche.push(
      `Valeur vénale actuelle (surface x prix moyen, avant décote énergétique) : ${montant(fiche.valeurSectorielle, mode)}.`,
    );
  }
  if (fiche.valeurApresReno != null && fiche.upliftPct != null) {
    const pct = Math.round(fiche.upliftPct * 100);
    marche.push(
      `Valeur après rénovation globale (ordre de grandeur indicatif, +${pct} %) : ${montant(fiche.valeurApresReno, mode)}.`,
    );
  }
  if (fiche.noteMarche) marche.push(fiche.noteMarche);

  const encadreMutation =
    fiche.statutTransaction.id === "vendu_recent" && fiche.statutTransaction.prixNet != null
      ? `Historique de mutation : Bien acquis le ${formaterDateTransaction(fiche.statutTransaction.dateMutation || "")} pour ${montant(fiche.statutTransaction.prixNet, mode)} - Profil : Acquéreur récent en phase de programmation travaux.`
      : "";

  return {
    reference: fiche.reference,
    dateEdition: fiche.dateEdition,
    source: fiche.source,
    identite: [
      { label: "Adresse", valeur: fiche.adresseComplete },
      { label: "Motif DPE / Statut", valeur: fiche.libelleMotif },
      { label: "Type de bâti", valeur: fiche.typeBati },
      { label: "Surface habitable", valeur: surfaceTexte(fiche.surfaceHabitableM2, mode, false) },
      {
        label: "Année",
        valeur: fiche.anneeConstruction != null ? String(fiche.anneeConstruction) : "Non renseignée",
      },
      { label: "Chauffage", valeur: fiche.chauffage },
    ],
    foncier: [
      { label: "Commune", valeur: `${fiche.commune} - ${fiche.departement} (${fiche.codeDep})` },
      { label: "Section", valeur: fiche.section || "Non communiquée" },
      { label: "Parcelle", valeur: fiche.numero || "Non communiquée" },
      { label: "Terrain", valeur: surfaceTexte(fiche.terrainM2, mode, true) },
      { label: "Emprise au sol", valeur: surfaceTexte(fiche.empriseM2, mode, false) },
      { label: "Ratio d'occupation", valeur: formaterRatio(fiche.ratioOccupation) },
    ],
    potentiel: fiche.potentielFoncier,
    etiquette: fiche.etiquette,
    conso,
    statut: fiche.statutClimat,
    deperditions: fiche.deperditions,
    impact: fiche.impactCombustible,
    marche,
    encadreMutation,
    preconisations: fiche.preconisations,
    mentionAides: MENTION_AIDES,
    piedConfidentialite: `Document confidentiel d'aide à la décision immobilière et technique - Édité par ${marque(mode)}`,
    piedContact: `Contact : ${PIED_CONTACT}`,
    piedEquipe: PIED_EQUIPE,
  };
}

type Rvb = readonly [number, number, number];

const ENCRE = {
  marine: [11, 31, 51] as Rvb,
  or: [176, 138, 74] as Rvb,
  creme: [244, 240, 230] as Rvb,
  texte: [30, 41, 59] as Rvb,
  muted: [71, 85, 105] as Rvb,
  filet: [214, 206, 192] as Rvb,
  blanc: [255, 255, 255] as Rvb,
  encart: [255, 247, 237] as Rvb,
};

const MARGE = 9;
const LARGEUR = 192;
const COL = 94.5;
const LABEL = 32;
const PIED_Y = 276;

function remplir(doc: jsPDF, rvb: Rvb): void {
  doc.setFillColor(rvb[0], rvb[1], rvb[2]);
}

function tracer(doc: jsPDF, rvb: Rvb): void {
  doc.setDrawColor(rvb[0], rvb[1], rvb[2]);
}

function encrer(doc: jsPDF, rvb: Rvb): void {
  doc.setTextColor(rvb[0], rvb[1], rvb[2]);
}

function preparer(doc: jsPDF, style: "normal" | "bold", taille: number): void {
  doc.setFont("helvetica", style);
  doc.setFontSize(taille);
}

function lignesPdf(doc: jsPDF, valeur: string, largeur: number): string[] {
  const propre = textePdf(valeur);
  if (!propre.trim()) return [];
  const brut: string | string[] = doc.splitTextToSize(propre, largeur);
  return typeof brut === "string" ? [brut] : brut;
}

function hauteurPaire(doc: jsPDF, valeur: string, largeur: number): number {
  preparer(doc, "bold", 8);
  return Math.max(lignesPdf(doc, valeur, largeur - LABEL - 2).length, 1) * 4;
}

function ecrirePaire(doc: jsPDF, label: string, valeur: string, x: number, y: number, largeur: number): number {
  preparer(doc, "normal", 7);
  encrer(doc, ENCRE.muted);
  doc.text(textePdf(label), x, y);
  preparer(doc, "bold", 8);
  encrer(doc, ENCRE.texte);
  const ls = lignesPdf(doc, valeur, largeur - LABEL - 2);
  ls.forEach((ligne, index) => {
    doc.text(ligne, x + LABEL, y + index * 4);
  });
  return y + Math.max(ls.length, 1) * 4;
}

function hauteurParagraphe(doc: jsPDF, valeur: string, largeur: number): number {
  preparer(doc, "normal", 7.5);
  const n = lignesPdf(doc, valeur, largeur).length;
  return n === 0 ? 0 : n * 3.5;
}

function ecrireParagraphe(
  doc: jsPDF,
  valeur: string,
  x: number,
  y: number,
  largeur: number,
  options?: { couleur?: Rvb; taille?: number; interligne?: number },
): number {
  const taille = options?.taille ?? 7.5;
  const interligne = options?.interligne ?? 3.5;
  preparer(doc, "normal", taille);
  encrer(doc, options?.couleur ?? ENCRE.texte);
  const ls = lignesPdf(doc, valeur, largeur);
  ls.forEach((ligne, index) => {
    doc.text(ligne, x, y + index * interligne);
  });
  return y + ls.length * interligne;
}

function ouvrirCarte(doc: jsPDF, x: number, y: number, w: number, h: number, titre: string): { x: number; y: number; w: number } {
  remplir(doc, ENCRE.blanc);
  doc.rect(x, y, w, h, "F");
  remplir(doc, ENCRE.marine);
  doc.rect(x, y, w, 6.4, "F");
  remplir(doc, ENCRE.or);
  doc.rect(x, y, 1.15, h, "F");
  tracer(doc, ENCRE.filet);
  doc.setLineWidth(0.25);
  doc.rect(x, y, w, h, "S");
  preparer(doc, "bold", 7.5);
  encrer(doc, ENCRE.blanc);
  doc.text(textePdf(titre), x + 3.2, y + 4.3);
  return { x: x + 3.2, y: y + 10, w: w - 6.4 };
}

function hauteurPaires(doc: jsPDF, paires: readonly PaireFiche[], largeur: number): number {
  return paires.reduce((total, paire) => total + hauteurPaire(doc, paire.valeur, largeur), 0);
}

function dessinerEnTete(doc: jsPDF, vue: PresentationFiche): number {
  remplir(doc, ENCRE.marine);
  doc.rect(0, 0, 210, 36, "F");
  remplir(doc, ENCRE.or);
  doc.rect(0, 36, 210, 1.3, "F");

  preparer(doc, "bold", 9);
  encrer(doc, ENCRE.blanc);
  doc.text(textePdf(`ENERGIA CONSEIL IA (R) - ${ENTETE_FICHE.sousTitre}`), MARGE, 8);

  preparer(doc, "normal", 7.5);
  doc.text(textePdf(`${ENTETE_FICHE.inpi}  |  ${ENTETE_FICHE.adresse}`), MARGE, 14);

  preparer(doc, "bold", 7.5);
  encrer(doc, ENCRE.or);
  doc.text(textePdf(ENTETE_FICHE.partenariat), MARGE, 20);

  preparer(doc, "normal", 7);
  encrer(doc, ENCRE.blanc);
  doc.text(textePdf(`Édition du ${vue.dateEdition}`), MARGE, 27);
  preparer(doc, "bold", 8);
  doc.text(textePdf(vue.reference), MARGE + LARGEUR, 27, { align: "right" });

  preparer(doc, "normal", 6.5);
  encrer(doc, [203, 213, 225]);
  doc.text(textePdf(vue.source), MARGE, 32.5);

  remplir(doc, ENCRE.creme);
  doc.rect(0, 37.3, 210, 9.2, "F");
  preparer(doc, "bold", 8);
  encrer(doc, ENCRE.marine);
  doc.text(textePdf(ENTETE_FICHE.document), 105, 43, { align: "center" });
  return 50;
}

function dessinerColonnePaires(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  titre: string,
  paires: readonly PaireFiche[],
  extra: string,
): void {
  const zone = ouvrirCarte(doc, x, y, w, h, titre);
  let curseur = zone.y;
  paires.forEach((paire) => {
    curseur = ecrirePaire(doc, paire.label, paire.valeur, zone.x, curseur, zone.w);
  });
  if (extra) {
    curseur += 1.4;
    ecrireParagraphe(doc, extra, zone.x, curseur, zone.w);
  }
}

function hauteurColonne(doc: jsPDF, paires: readonly PaireFiche[], extra: string, largeurUtile: number): number {
  const pairesH = hauteurPaires(doc, paires, largeurUtile);
  const extraH = extra ? 1.4 + hauteurParagraphe(doc, extra, largeurUtile) : 0;
  return 10 + pairesH + extraH + 3;
}

function dessinerThermique(doc: jsPDF, x: number, y: number, w: number, h: number, vue: PresentationFiche): void {
  const zone = ouvrirCarte(doc, x, y, w, h, "3  -  Diagnostic thermique et risque réglementaire");
  const lettre = vue.etiquette;
  const teinte = lettre ? COULEURS_ADEME[lettre] : { rvb: [100, 116, 139] as Rvb, texte: "#ffffff" };
  const encreLettre: Rvb = lettre && (lettre === "C" || lettre === "D" || lettre === "E") ? [26, 26, 26] : ENCRE.blanc;

  remplir(doc, teinte.rvb);
  doc.roundedRect(zone.x, zone.y - 1, 16, 16, 1, 1, "F");
  preparer(doc, "bold", 16);
  encrer(doc, encreLettre);
  doc.text(lettre ?? "-", zone.x + 8, zone.y + 10, { align: "center" });

  LETTRES.forEach((item, index) => {
    remplir(doc, COULEURS_ADEME[item].rvb);
    const bx = zone.x + index * 2.5;
    doc.rect(bx, zone.y + 16.2, 2.3, 2.3, "F");
    if (item === lettre) {
      tracer(doc, ENCRE.marine);
      doc.setLineWidth(0.35);
      doc.rect(bx - 0.2, zone.y + 16, 2.7, 2.7, "S");
    }
  });

  const texteX = zone.x + 22;
  const texteW = zone.w - 22;
  let curseur = zone.y + 1;
  curseur = ecrireParagraphe(doc, vue.conso, texteX, curseur, texteW) + 1.2;
  curseur = ecrireParagraphe(doc, vue.statut, texteX, curseur, texteW) + 1.5;
  const pleinX = zone.x;
  const pleinW = zone.w;
  const basBadge = zone.y + 20;
  curseur = Math.max(curseur, basBadge);
  curseur = ecrireParagraphe(doc, vue.deperditions, pleinX, curseur, pleinW) + 1.3;
  ecrireParagraphe(doc, vue.impact, pleinX, curseur, pleinW);
}

function hauteurThermique(doc: jsPDF, vue: PresentationFiche, largeurUtile: number): number {
  const texteW = largeurUtile - 22;
  const blocDroit =
    hauteurParagraphe(doc, vue.conso, texteW) +
    1.2 +
    hauteurParagraphe(doc, vue.statut, texteW) +
    1.5;
  const suite =
    Math.max(blocDroit, 20) +
    hauteurParagraphe(doc, vue.deperditions, largeurUtile) +
    1.3 +
    hauteurParagraphe(doc, vue.impact, largeurUtile);
  return 10 + suite + 3;
}

function dessinerListe(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  titre: string,
  lignes: readonly string[],
  encart: string,
): void {
  const zone = ouvrirCarte(doc, x, y, w, h, titre);
  let curseur = zone.y;
  lignes.forEach((ligne) => {
    curseur = ecrireParagraphe(doc, ligne, zone.x, curseur, zone.w) + 1.1;
  });
  if (encart) {
    const mutation = encart.startsWith("Historique de mutation");
    const hEncart = hauteurParagraphe(doc, encart, zone.w - 3) + 3;
    remplir(doc, mutation ? [236, 253, 245] : ENCRE.encart);
    doc.rect(zone.x, curseur - 0.5, zone.w, hEncart, "F");
    remplir(doc, mutation ? [5, 150, 105] : [249, 115, 22]);
    doc.rect(zone.x, curseur - 0.5, 1, hEncart, "F");
    ecrireParagraphe(doc, encart, zone.x + 2.2, curseur + 2.6, zone.w - 3.4);
  }
}

function hauteurListe(doc: jsPDF, lignes: readonly string[], encart: string, largeurUtile: number): number {
  const corps = lignes.reduce((total, ligne) => total + hauteurParagraphe(doc, ligne, largeurUtile) + 1.1, 0);
  const enc = encart ? hauteurParagraphe(doc, encart, largeurUtile - 3) + 4 : 0;
  return 10 + corps + enc + 3;
}

export function mettreEnPageFiche(fiche: FicheOpportunite): { pdf: jsPDF; bas: number } {
  const vue = presenterFiche(fiche, "pdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: false });
  pdf.setProperties({
    title: textePdf(`Fiche opportunite ${vue.reference}`),
    author: "ENERGIA CONSEIL IA",
    subject: "Carto Sniper - fiche d'opportunite fonciere",
    creator: "ENERGIA CONSEIL IA",
  });

  let y = dessinerEnTete(pdf, vue);
  const utile = COL - 6.4;
  const hGauche = hauteurColonne(pdf, vue.identite, "", utile);
  const hDroite = hauteurColonne(pdf, vue.foncier, `Potentiel foncier : ${vue.potentiel}`, utile);
  const hHaut = Math.max(hGauche, hDroite);
  dessinerColonnePaires(pdf, MARGE, y, COL, hHaut, "1  -  Fiche d'identité du bien", vue.identite, "");
  dessinerColonnePaires(
    pdf,
    MARGE + COL + 3,
    y,
    COL,
    hHaut,
    "2  -  Analyse foncière et cadastrale",
    vue.foncier,
    `Potentiel foncier : ${vue.potentiel}`,
  );
  y += hHaut + 3;

  const hThermo = hauteurThermique(pdf, vue, LARGEUR - 6.4);
  dessinerThermique(pdf, MARGE, y, LARGEUR, hThermo, vue);
  y += hThermo + 3;

  const precoLignes = vue.preconisations.map((ligne, index) => `${index + 1}. ${ligne}`);
  const hMarche = hauteurListe(pdf, vue.marche, vue.encadreMutation, utile);
  const hPreco = hauteurListe(pdf, precoLignes, vue.mentionAides, utile);
  const hBas = Math.max(hMarche, hPreco);
  dessinerListe(pdf, MARGE, y, COL, hBas, "4  -  Marché et données DVF 5 ans", vue.marche, vue.encadreMutation);
  dessinerListe(
    pdf,
    MARGE + COL + 3,
    y,
    COL,
    hBas,
    "5  -  Préconisations de l'ensemblier",
    precoLignes,
    vue.mentionAides,
  );
  y += hBas;

  remplir(pdf, ENCRE.marine);
  pdf.rect(0, PIED_Y, 210, 297 - PIED_Y, "F");
  remplir(pdf, ENCRE.or);
  pdf.rect(0, PIED_Y, 210, 0.8, "F");
  const piedOptions = { couleur: ENCRE.blanc, taille: 6.5, interligne: 3.1 };
  let pied = PIED_Y + 4.4;
  pied = ecrireParagraphe(pdf, vue.piedConfidentialite, MARGE, pied, LARGEUR, piedOptions) + 0.6;
  pied = ecrireParagraphe(pdf, vue.piedContact, MARGE, pied, LARGEUR, piedOptions) + 0.6;
  ecrireParagraphe(pdf, vue.piedEquipe, MARGE, pied, LARGEUR, {
    couleur: [203, 213, 225],
    taille: 6.2,
    interligne: 3,
  });

  return { pdf, bas: y };
}

export function telechargerFicheOpportunitePdf(fiche: FicheOpportunite): void {
  const { pdf } = mettreEnPageFiche(fiche);
  pdf.save(`${fiche.reference}.pdf`);
}
