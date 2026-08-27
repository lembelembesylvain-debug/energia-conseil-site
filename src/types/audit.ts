/** Types du module d’audit énergétique — indépendants d’un client. Compatible JSONB Supabase. */

import type { FoyerAides } from "./aides";

export type Origine = "photo" | "plan" | "devis" | "hypothèse" | "audit";

export type Statut =
  | "EXTRAIT"
  | "À VÉRIFIER"
  | "INCOHÉRENCE"
  | "DONNÉE MANQUANTE"
  | "PRÊT POUR VALIDATION HUMAINE"
  | "AUDIT RÉGLEMENTAIRE REÇU"
  | "PRÊT POUR VALIDATION MAR";

export type Confiance = "élevé" | "moyen" | "faible" | "illisible";

export type DocumentKind = "photo" | "plan" | "devis" | "autre";

export type SourceChiffrage = "DEVIS RÉEL" | "ESTIMATION TECHNIQUE" | "HYPOTHÈSE";

export type StatutScenarioVisuel =
  | "PHOTO AVANT CONFIRMÉE"
  | "PROJECTION WOW À VALIDER"
  | "VALIDÉE PAR HUMAIN"
  | "PHOTO APRÈS TRAVAUX RÉELLE À AJOUTER";

export type ProfilSimulationId = "bleu" | "jaune" | "violet" | "rose";

export type PiecePlan = {
  nom: string;
  surface: string;
  surfaceM2?: number;
};

export type DonneeLogement = {
  libelle: string;
  valeur: string;
  origine: Origine | "—";
  statut: Statut;
  note?: string;
};

export type LigneDevis = {
  ref: string;
  designation: string;
  montantHt: string;
};

export type DevisAnalyse = {
  fichier: string;
  entreprise: string;
  poste: string;
  ht: string;
  tva: string;
  ttc: string;
  date: string;
  validite: string;
  nonLisible: string[];
  lignes: LigneDevis[];
  notes: string[];
  statut: Statut;
};

export type Controle = {
  titre: string;
  statut: Statut;
  detail: string;
};

export type LegendeStatut = {
  statut: Statut;
  texte: string;
};

export type StatutGlobal = {
  statut: Statut;
  texte: string;
  label?: string;
};

export type WorkItem = {
  libelle: string;
  detail: string;
  montantTtc: number;
  source: SourceChiffrage;
  reference: string;
};

export type Document = {
  id: string;
  nom: string;
  type: string;
  extraits: string[];
  confiance: Confiance;
  origine: Origine;
  statut: Statut;
  imageSrc?: string;
  kind?: DocumentKind;
  /** Photo réelle « avant » (galerie). */
  photoAvantSrc?: string;
  /** Photo réelle « après » si disponible (distincte d’une projection). */
  photoApresSrc?: string;
};

export type Scenario = {
  id: string;
  code?: string;
  titre: string;
  nomCourt: string;
  objectif: string;
  badge: string;
  recommande: boolean;
  dpeAvantHypothese?: string;
  dpeApresHypothese?: string;
  gainDeperditionsHypothese?: string;
  lotsInclus: WorkItem[];
  lotsExclus: string[];
  totalTtc: number;
  photoAvantSrc?: string;
  photoAvantNom?: string;
  projectionWowSrc?: string;
  photoApresSrc?: string;
  transformations: string[];
  sources: string[];
  confiance: Confiance;
  notesTechniques: string[];
  /** Si true, le DPE affiché vient d’un audit réglementaire (pas une hypothèse visuelle). */
  dpeOfficiel?: boolean;
  dpeCaption?: string;
};

export type AidProfile = {
  id: ProfilSimulationId;
  label: string;
  sousTitre: string;
  taux: number;
  note: string;
};

export type Pathologie = {
  titre: string;
  description: string;
  conseils?: string;
};

export type PhotoSlot = {
  id: string;
  titre: string;
  cote: "avant" | "apres";
  description: string;
};

export type PerformanceBanner = {
  dpeAvant: string;
  dpeApres: string;
  consoAvant: string;
  consoApres: string;
  gain: string;
  reductionCo2: string;
  mention: string;
};

export type AuditMentions = {
  dpe?: string;
  aides?: string;
  toiture?: string;
  devisNonCumulable?: string;
  scenarios?: string;
  simulateurNote?: string;
  documentsIntro?: string;
  logementIntro?: string;
  devisIntro?: string;
};

export type ProjectLink = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

/** Données projet / logement (table projets ou JSONB). */
export type Project = {
  id?: string;
  titre: string;
  sousTitre?: string;
  documentTitle?: string;
  clientNom?: string;
  adresse?: string;
  disclaimer: string;
  missingLabel: string;
  headerKicker?: string;
  headerNote?: string;
  scenariosIntro?: string;
  footer?: string;
  links?: ProjectLink[];
  presentationHref?: string;
  rapportHref?: string;
  piecesPlan: PiecePlan[];
  piecesPlanSommeDetail?: string;
  donneesLogement: DonneeLogement[];
  devis: DevisAnalyse[];
  foyer?: FoyerAides;
};

/** Résultats d’analyse IA / contrôles (table audits ou JSONB). */
export type Audit = {
  id?: string;
  projectId?: string;
  controles: Controle[];
  statutLegendes?: LegendeStatut[];
  statutGlobal?: StatutGlobal;
  preRapport: string[];
  alertesAides?: string[];
  mentions?: AuditMentions;
  profilsSimulation?: AidProfile[];
  defaultProfilId?: ProfilSimulationId;
  pathologies?: Pathologie[];
  photoSlots?: PhotoSlot[];
  performanceBanner?: PerformanceBanner;
};

export type AuditEnergetiqueModuleProps = {
  projectData: Project;
  auditData: Audit;
  documentsList: Document[];
  scenarios: Scenario[];
};

export const DEFAULT_MISSING_LABEL = "Non communiqué — à confirmer.";

export const DEFAULT_DISCLAIMER =
  "Document de préparation interne — non constitutif d’un audit réglementaire. Validation humaine nécessaire.";

export const DEFAULT_STATUT_LEGENDES: LegendeStatut[] = [
  { statut: "EXTRAIT", texte: "Lu tel quel sur photo, plan ou devis." },
  { statut: "À VÉRIFIER", texte: "Lu mais incomplet, ambigu ou à recouper sur site." },
  { statut: "INCOHÉRENCE", texte: "Deux documents du corpus se contredisent." },
  { statut: "DONNÉE MANQUANTE", texte: "Absent du corpus — non inventé." },
  {
    statut: "PRÊT POUR VALIDATION HUMAINE",
    texte: "Extraction chiffrée cohérente en interne ; devis échus, pas un audit.",
  },
  { statut: "AUDIT RÉGLEMENTAIRE REÇU", texte: "Audit réglementaire officiel joint au dossier." },
  { statut: "PRÊT POUR VALIDATION MAR", texte: "Analyse prête pour validation du MAR (parcours accompagné)." },
];

export const DEFAULT_AID_PROFILES: AidProfile[] = [
  {
    id: "bleu",
    label: "Profil Bleu",
    sousTitre: "Très modestes",
    taux: 0.8,
    note: "80 % d’aides max — simulation interne, RFR non fourni",
  },
  {
    id: "jaune",
    label: "Profil Jaune",
    sousTitre: "Modestes",
    taux: 0.7,
    note: "70 % d’aides max — simulation interne (barème officiel 2026 = 60 %)",
  },
  {
    id: "violet",
    label: "Profil Violet",
    sousTitre: "Intermédiaires",
    taux: 0.5,
    note: "50 % d’aides max — simulation interne (barème officiel 2026 = 45 %)",
  },
  {
    id: "rose",
    label: "Profil Rose",
    sousTitre: "Aisés",
    taux: 0.35,
    note: "35 % d’aides max — simulation interne (barème officiel 2026 = 10 %)",
  },
];

export function formatEuro(montant: number): string {
  return `${montant.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

export function simulerAides(
  totalTtc: number,
  taux: number,
): { aides: number; reste: number; mensualite: number } {
  const aides = Math.round(totalTtc * taux * 100) / 100;
  const reste = Math.round((totalTtc - aides) * 100) / 100;
  const mensualite = Math.round((reste / (15 * 12)) * 100) / 100;
  return { aides, reste, mensualite };
}

export function parseSurfaceM2(value: string): number | null {
  const match = value.replace(/\s/g, " ").replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function sumPiecesPlan(pieces: PiecePlan[]): number {
  return pieces.reduce((total, piece) => {
    const value = piece.surfaceM2 ?? parseSurfaceM2(piece.surface) ?? 0;
    return total + value;
  }, 0);
}

export function formatSurfaceM2(value: number): string {
  return `${value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} m²`;
}

export type PaireAvantApres = {
  id: string;
  titre: string;
  avantSrc: string;
  apresSrc: string;
  avantLabel?: string;
  apresLabel?: string;
  apresEstProjection?: boolean;
};

/** Paires avant/après issues des documents (photos réelles) et des scénarios (projections). */
export function buildGalerieAvantApres(
  documents: Document[],
  scenarios: Scenario[],
): PaireAvantApres[] {
  const fromDocuments: PaireAvantApres[] = documents
    .filter((doc) => {
      const avant = doc.photoAvantSrc ?? doc.imageSrc;
      return Boolean(avant && doc.photoApresSrc);
    })
    .map((doc) => ({
      id: `doc-${doc.id}`,
      titre: doc.nom,
      avantSrc: (doc.photoAvantSrc ?? doc.imageSrc) as string,
      apresSrc: doc.photoApresSrc as string,
      avantLabel: "AVANT — PHOTO RÉELLE",
      apresLabel: "APRÈS — PHOTO RÉELLE",
      apresEstProjection: false,
    }));

  const fromScenarios: PaireAvantApres[] = scenarios
    .filter((scenario) => Boolean(scenario.photoAvantSrc && (scenario.photoApresSrc || scenario.projectionWowSrc)))
    .map((scenario) => {
      const apresEstReel = Boolean(scenario.photoApresSrc);
      return {
        id: `scenario-${scenario.id}`,
        titre: scenario.nomCourt || scenario.titre,
        avantSrc: scenario.photoAvantSrc as string,
        apresSrc: (scenario.photoApresSrc ?? scenario.projectionWowSrc) as string,
        avantLabel: "AVANT — PHOTO RÉELLE",
        apresLabel: apresEstReel ? "APRÈS — PHOTO RÉELLE" : "PROJECTION WOW — APRÈS TRAVAUX — À VALIDER",
        apresEstProjection: !apresEstReel,
      };
    });

  return [...fromDocuments, ...fromScenarios];
}
