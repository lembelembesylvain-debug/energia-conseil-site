export type TypeBatiment = "residentiel" | "tertiaire" | "collectif";

export type UsageTertiaire = "bureaux" | "commerce" | "entrepot";

export type IsolationId = "passoire" | "rt2000" | "rt2012" | "re2020";

export type ModePac = "thermo" | "cascade" | "hybride";

export type MarquePac = "daikin" | "mitsubishi" | "viessmann";

export type EnergieChaudiere = "gaz" | "fioul";

export type ZoneCee = "H1" | "H2" | "H3";

export type ClasseGtb = "B" | "A";

export type EtatPac = {
  clientNom: string;
  typeBatiment: TypeBatiment;
  usageTertiaire: UsageTertiaire;
  surfaceM2: number;
  hauteurM: number;
  isolation: IsolationId;
  departement: string;
  tint: number;
  tintManuelle: boolean;
  mode: ModePac;
  /** Part des déperditions couverte à Text base, mode 100 % thermodynamique. */
  ratioThermo: 0.9 | 0.95 | 1;
  nombreModules: 2 | 3 | 4;
  marque: MarquePac;
  energieChaudiere: EnergieChaudiere;
  tauxTvaTertiaire: 0.1 | 0.2;
  classeGtb: ClasseGtb;
};

export type DepartementClimatique = {
  code: string;
  nom: string;
  textBase: number;
  zone: ZoneCee;
  dju: number;
};

export type LigneDevisPac = {
  id: string;
  famille: "fourniture" | "ingenierie";
  designation: string;
  quantite: number;
  unite: string;
  puHt: number;
  totalHt: number;
  coutHt: number;
};

export type AideCee = {
  id: "bar-th-104" | "bat-th-113" | "bat-th-116";
  libelle: string;
  montantEur: number;
  eligible: boolean;
  detail: string;
};

export type EtudePac = {
  volumeM3: number;
  g: number;
  textBase: number;
  zone: ZoneCee;
  dju: number;
  departementNom: string;
  deltaK: number;
  pDepKw: number;
  puissancePacKw: number;
  ratioCouvertureBase: number;
  appointElectriqueKw: number;
  alerteAppoint: string | null;
  modules: { nombre: number; unitaireKw: number; totalKw: number } | null;
  tbiv: number | null;
  couvertureAnnuelle: number;
  puissanceChaudiereKw: number;
  debitPacM3h: number;
  debitChaudiereM3h: number;
  volumeTamponL: number;
  volumeTamponStandardL: number;
  bouteille: { dn: number; entraxeMm: number; vitesseMs: number; preconisation: string };
  besoinKwh: number;
  economieAnnuelleEur: number;
  coutAvantEur: number;
  coutApresEur: number;
  devis: DevisPac;
};

export type DevisPac = {
  numero: string;
  lignes: LigneDevisPac[];
  fournituresHt: number;
  ingenierieHt: number;
  totalHt: number;
  tauxTva: number;
  tvaEur: number;
  totalTtc: number;
  aides: AideCee[];
  totalAidesEur: number;
  resteAChargeTtc: number;
  coutAchatHt: number;
  margeBruteHt: number;
  margeBrutePct: number;
  retourAns: number | null;
};
