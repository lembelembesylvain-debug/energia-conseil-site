/** Types du moteur d’aides contrôlé — distincts des taux pédagogiques. */

import type { SourceChiffrage, WorkItem } from "./audit";

export type ProfilMpr = "bleu" | "jaune" | "violet" | "rose";

export type RegionCode = "IDF" | "HORS_IDF";

export type ParcoursAide = "parcours" | "geste" | "non_determine";

export type ResidenceType = "principale" | "secondaire";

export type OccupantType = "proprietaire_occupant" | "bailleur";

export type PosteAide =
  | "isolation_toiture"
  | "isolation_murs"
  | "isolation_planchers"
  | "menuiseries"
  | "pac"
  | "vmc"
  | "ballon"
  | "pv"
  | "maconnerie"
  | "autre";

export type AidEngineStatus =
  | "AIDES_NON_CALCULABLES"
  | "DONNEES_FISCALES_MANQUANTES"
  | "SIMULATION_INDICATIVE"
  | "AIDES_A_VALIDER"
  | "VALIDATION_MAR_REQUISE"
  | "PRET_POUR_CALCUL"
  | "CALCUL_CONTROLE"
  | "VALIDE_HUMAIN";

export type FinancementStatus =
  | "ÉTUDE FINANCIÈRE REQUISE"
  | "SIMULATION UMAFI EN COURS"
  | "DOSSIER TRANSMIS À FABIEN"
  | "ACCORD DE PRINCIPE REÇU"
  | "FINANCEMENT VALIDÉ";

export type ChampFoyerStatut = "EXTRAIT" | "À VÉRIFIER" | "DONNÉE MANQUANTE" | "HYPOTHÈSE DE TEST";

export type ChampFoyer = {
  label: string;
  value: string;
  statut: ChampFoyerStatut;
  note?: string;
};

export type FoyerAides = {
  rfr: number | null;
  rfrYear: number | null;
  householdSize: number | null;
  region: string | null;
  regionCode: RegionCode | null;
  department: string | null;
  housingStatus: string | null;
  residenceType: ResidenceType | null;
  occupantType: OccupantType | null;
  constructionYear: number | null;
  housingAgeLabel: string | null;
  dpeActuel: string | null;
  dpeVise: string | null;
  parcoursType: ParcoursAide | null;
  eligibleWorksLabel: string | null;
  rgeCompany: string | null;
  filingDate: string | null;
  champs: ChampFoyer[];
};

export type EligibleWorkInput = {
  libelle: string;
  poste: PosteAide;
  montantTtc: number;
  montantHt?: number;
  surfaceM2?: number;
  quantite?: number;
  source: SourceChiffrage;
  eligibleMpr: boolean;
  eligibleCee: boolean;
  note?: string;
};

export type CalculateAidEstimateInput = {
  foyer: FoyerAides;
  budgetTtc: number;
  lots: WorkItem[];
  scenarioId?: string;
  scenarioLabel?: string;
};

export type AideLigne = {
  dispositif: "MaPrimeRénov'" | "CEE" | "Aides locales" | "Autres";
  libelle: string;
  montant: number;
  detail: string;
};

export type AidEstimateResult = {
  calculable: boolean;
  status: AidEngineStatus;
  profile: ProfilMpr | null;
  profileLabel: string;
  profileMessage: string;
  baremeVersion: string;
  missingFields: string[];
  alerts: string[];
  travauxDocumentesTtc: number;
  travauxEstimesTtc: number;
  travauxHypothesesTtc: number;
  depensesEligiblesHt: number;
  depensesEligiblesTtc: number;
  depensesNonEligiblesTtc: number;
  plafondDepensesHt: number | null;
  mpr: number | null;
  cee: number | null;
  locales: number | null;
  autres: number | null;
  totalAides: number | null;
  resteACharge: number | null;
  ecretementApplied: boolean;
  ecoPtzPossible: boolean;
  ecoPtzMessage: string;
  lignes: AideLigne[];
  lotsClasses: {
    documentes: WorkItem[];
    estimes: WorkItem[];
    hypotheses: WorkItem[];
  };
};
