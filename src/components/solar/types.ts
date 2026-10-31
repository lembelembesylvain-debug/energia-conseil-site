/** Calepinage solaire — types du module CRM. */

export type OrientationPanneau = "portrait" | "paysage";

export type TypeObstacle = "velux" | "cheminee" | "ventilation";

export type Obstacle = {
  id: string;
  type: TypeObstacle;
  /** Mètres depuis la rive gauche. */
  x: number;
  /** Mètres depuis l'égout, le long du rampant. */
  y: number;
  largeurM: number;
  hauteurM: number;
};

export type SegmentProjet = "residentiel" | "tertiaire";

export type TypeCouverture = "rampant" | "bac-acier" | "terrasse" | "ombriere";

export type MarqueCascade = "huawei" | "sma";

export type TarifPro = "jaune" | "vert";

export type Toiture = {
  largeurM: number;
  rampantM: number;
  inclinaisonDeg: number;
  /** −180° nord, 0° sud, +180° nord. Est négatif, ouest positif. */
  azimutDeg: number;
  typeCouverture: TypeCouverture;
};

export type Panneau = {
  id: string;
  nom: string;
  wc: number;
  voc: number;
  vmpp: number;
  isc: number;
  /** Coefficient de température Voc, en %/°C (négatif). */
  coeffVoc: number;
  /** Coefficient appliqué à Vmpp, en %/°C (négatif). */
  coeffVmpp: number;
  longueurM: number;
  largeurM: number;
  personnalise: boolean;
};

export type Cellule = {
  id: string;
  col: number;
  row: number;
  x: number;
  y: number;
  actif: boolean;
};

export type ArchitectureId = "tesla-pw3" | "micro" | "hybride" | "cascade";

export type MicroId = "enphase-iq8" | "apsystems-ds3";

export type MarqueCentrale = "huawei" | "solaredge";

export type EtatCalpinage = {
  clientNom: string;
  largeurM: number;
  rampantM: number;
  inclinaisonDeg: number;
  azimutDeg: number;
  segment: SegmentProjet;
  typeCouverture: TypeCouverture;
  /** Plafond de modules quand un palier 36 / 100 / 250 / 500 kWc est actif. */
  kwcCible: number | null;
  unitesPowerwall: number;
  marqueCascade: MarqueCascade;
  modeleCascadeId: string;
  batterieCiKwh: number;
  irveActive: boolean;
  nbBornes: number;
  tarifPro: TarifPro;
  prixManuel: boolean;
  injectionManuelle: boolean;
  obstacles: Obstacle[];
  orientation: OrientationPanneau;
  panneauId: string;
  panneauCustom: Panneau;
  desactives: string[];
  architecture: ArchitectureId;
  repartition: "auto" | "manuel";
  comptes: number[];
  secours: boolean;
  microId: MicroId;
  marqueCentrale: MarqueCentrale;
  modeleCentralId: string;
  departement: string;
  productible: number;
  productibleManuel: boolean;
  consoKwh: number;
  prixKwh: number;
  tarifInjection: number;
  investissementSaisi: number | null;
};

export type ControleChaine = {
  index: number;
  nombre: number;
  ok: boolean;
  vocFroidV: number;
  vmppChaudV: number;
  iscA: number;
  motifs: string[];
};

export type BilanMicro = {
  id: MicroId;
  nom: string;
  panneauxParMicro: number;
  nombreMicros: number;
  va: number;
  iac: number;
  maxParBranche: number;
  branches: number[];
  courantsA: number[];
  ok: boolean;
  ecretage: boolean;
};

export type BilanCentrale = {
  id: string;
  nom: string;
  kwAc: number;
  kwDc: number;
  ratio: number;
  mppt: number;
  vmax: number;
  vmin: number;
  imax: number;
  optimiseurs: boolean;
  ok: boolean;
  motifs: string[];
};

export type BilanElectrique = {
  architecture: ArchitectureId;
  ok: boolean;
  resume: string;
  chaines: ControleChaine[];
  nonAffectes: number;
  micro: BilanMicro | null;
  centrale: BilanCentrale | null;
  secoursKw: number | null;
  alertes: string[];
  unitesPowerwall: number;
  cascade: {
    nom: string;
    nombre: number;
    kwAcTotal: number;
    ratio: number;
    mpptTotal: number;
    chainesParMppt: number;
    resumeChaines: string;
  } | null;
};

export type PointCourbe = {
  annee: number;
  gain: number;
  cumul: number;
};

export type BilanProduction = {
  productibleReference: number;
  facteurOrientation: number;
  productibleCorrige: number;
  productionKwh: number;
  tauxCible: number;
  tauxReel: number;
  couvertureConso: number;
  autoconsommationKwh: number;
  surplusKwh: number;
  economieAnnuelleEur: number;
  revenuInjectionEur: number;
  gainAnnuelEur: number;
  cumul25Eur: number;
  retourAns: number | null;
  courbe: PointCourbe[];
  investissementEur: number;
  detailInvestissement: string;
  avecBatterie: boolean;
  tertiaire: {
    tarif: TarifPro;
    investissementHt: number;
    tvaRecuperableEur: number;
    aideAdvenirEur: number;
    coutIrveHt: number;
    coutIrveNetHt: number;
    kwhIrve: number;
    kwhBatterie: number;
    economieFiscaleEur: number;
    amortissementAnnuelHt: number;
    tarifInjectionS21: number;
    kwhStockage: number;
    kwAcStockage: number;
  } | null;
};

export type FamilleDevis = "fourniture" | "ingenierie";

export type LigneDevis = {
  id: string;
  famille: FamilleDevis;
  designation: string;
  quantite: number;
  unite: string;
  puHt: number;
  totalHt: number;
  /** Coût d'achat HT de la ligne. Égal au prix de vente quand le bordereau ne distingue pas le coût. */
  coutHt: number;
  margeConnue: boolean;
};

export type AideDevis = {
  id: string;
  libelle: string;
  montantEur: number;
};

export type DevisContractant = {
  numero: string;
  lignes: LigneDevis[];
  fournituresHt: number;
  ingenierieHt: number;
  totalHt: number;
  tauxTva: number;
  tvaEur: number;
  totalTtc: number;
  aides: AideDevis[];
  totalAidesEur: number;
  resteAChargeTtc: number;
  coutAchatHt: number;
  margeBruteHt: number;
  margeBrutePct: number;
  /** Vrai quand l'export a retiré la marge avant remise au client. */
  margeMasquee: boolean;
  mentions: string[];
};

export type EtudeTechnique = {
  version: 1;
  genereLe: string;
  clientNom: string;
  dossierId: string | null;
  departement: string;
  toiture: Toiture;
  obstacles: Obstacle[];
  orientation: OrientationPanneau;
  panneau: Panneau;
  cellules: Cellule[];
  modulesActifs: number;
  kwc: number;
  electrique: BilanElectrique;
  production: BilanProduction;
  devis: DevisContractant;
  mentions: string[];
};
