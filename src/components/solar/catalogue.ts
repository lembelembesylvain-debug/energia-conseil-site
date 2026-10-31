import type { EtatCalpinage, MarqueCascade, MarqueCentrale, MicroId, Panneau } from "./types";

/** Format de calepinage retenu pour les modules standards : 1,75 m × 1,13 m. */
export const LONGUEUR_MODULE_M = 1.75;
export const LARGEUR_MODULE_M = 1.13;

/**
 * Valeurs électriques de travail, inspirées des fiches fabricant.
 * À confirmer sur la datasheet du lot avant Consuel.
 * Vmpp est corrigée avec le coefficient de puissance lorsque le coefficient Vmpp n'est pas publié à part.
 */
export const PANNEAUX: Panneau[] = [
  {
    id: "dualsun-500",
    nom: "DualSun Flash Half-Cut Black 500 Wc",
    wc: 500,
    voc: 44.22,
    vmpp: 37.04,
    isc: 14.04,
    coeffVoc: -0.25,
    coeffVmpp: -0.34,
    longueurM: LONGUEUR_MODULE_M,
    largeurM: LARGEUR_MODULE_M,
    personnalise: false,
  },
  {
    id: "dualsun-425",
    nom: "DualSun Flash Half-Cut Black 425 Wc",
    wc: 425,
    voc: 49.8,
    vmpp: 41.7,
    isc: 10.9,
    coeffVoc: -0.27,
    coeffVmpp: -0.35,
    longueurM: LONGUEUR_MODULE_M,
    largeurM: LARGEUR_MODULE_M,
    personnalise: false,
  },
  {
    id: "maxeon-6-440",
    nom: "SunPower Maxeon 6 440 Wc",
    wc: 440,
    voc: 48.4,
    vmpp: 40.7,
    isc: 11.05,
    coeffVoc: -0.24,
    coeffVmpp: -0.29,
    longueurM: LONGUEUR_MODULE_M,
    largeurM: LARGEUR_MODULE_M,
    personnalise: false,
  },
  {
    id: "maxeon-7-440",
    nom: "SunPower Maxeon 7 440 Wc",
    wc: 440,
    voc: 47.8,
    vmpp: 40.2,
    isc: 11.2,
    coeffVoc: -0.24,
    coeffVmpp: -0.29,
    longueurM: LONGUEUR_MODULE_M,
    largeurM: LARGEUR_MODULE_M,
    personnalise: false,
  },
  {
    id: "trina-450",
    nom: "Trina Solar Vertex S+ N-Type 450 Wc",
    wc: 450,
    voc: 52.6,
    vmpp: 44.1,
    isc: 10.74,
    coeffVoc: -0.24,
    coeffVmpp: -0.3,
    longueurM: LONGUEUR_MODULE_M,
    largeurM: LARGEUR_MODULE_M,
    personnalise: false,
  },
];

export const PANNEAU_CUSTOM_DEFAUT: Panneau = {
  id: "custom",
  nom: "Module personnalisé",
  wc: 500,
  voc: 44,
  vmpp: 37,
  isc: 13,
  coeffVoc: -0.26,
  coeffVmpp: -0.34,
  longueurM: LONGUEUR_MODULE_M,
  largeurM: LARGEUR_MODULE_M,
  personnalise: true,
};

/** Powerwall 3 : 6 MPPT, fenêtre DC imposée par le cahier du module. */
export const POWERWALL_3 = {
  nom: "Tesla Powerwall 3",
  mppt: 6,
  vmax: 480,
  vmin: 60,
  imax: 13,
  capaciteKwh: 13.5,
  secoursKw: 11.5,
  solaireMaxKwc: 20,
  prixPoseTtc: 12900,
  /** Prix HT d'une unité posée en tertiaire, TVA 20 % récupérable à part. */
  prixPoseHt: 11500,
  unitesMax: 4,
} as const;

export const PALIERS_KWC = [36, 100, 250, 500] as const;

export const CONSO_PALIER_KWH: Record<(typeof PALIERS_KWC)[number], number> = {
  36: 80000,
  100: 250000,
  250: 700000,
  500: 1500000,
};

export const PRIX_TARIF_PRO = { jaune: 0.18, vert: 0.13 } as const;

/** Coût HT indicatif d'une borne tertiaire 22 kW posée (prix de vente BPU). ADVENIR : 50 % de ce montant, plafonné. */
export const COUT_BORNE_22_HT = 2400;
/** ADVENIR : jusqu'à 50 % du coût, plafonné par point. Hypothèse de travail, hors accord Avere. */
export const TAUX_ADVENIR = 0.5;
export const PLAFOND_ADVENIR_PAR_BORNE = 2100;
export const PRIX_BATTERIE_CI_HT_KWH = 480;
export const TAUX_IS = 0.25;
export const DUREE_AMORTISSEMENT_ANS = 20;

/**
 * Bordereau ENERGIA 2026 — contractant général.
 * Le prix de vente est celui du devis. Le coût d'achat n'est renseigné que lorsqu'il est distinct.
 * Câble, démarches et mise en service : forfaits de grille (le cahier ne donnait pas leur montant).
 */
export const BPU_2026 = {
  moduleAchatHt: 85,
  moduleVenteHt: 145,
  fixationHt: { rampant: 30, "bac-acier": 20, terrasse: 40, ombriere: 130 } as const,
  coffretHt: { residentiel: 650, tertiaire: 2200 },
  /** En tertiaire, un coffret par tranche de 100 kWc entamée. */
  coffretTrancheKwc: 100,
  consuelHt: 220,
  cableEurKwc: { residentiel: 35, tertiaire: 18 },
  cablePlancherHt: { residentiel: 180, tertiaire: 650 },
  powerwallAchatHt: 9900,
  powerwallPoseTtc: 12900,
  onduleurHt: { k30: 2200, k50: 3400, k100: 5800 },
  microVenteHt: { "enphase-iq8": 165, "apsystems-ds3": 220 } as const,
  wallConnectorAchatHt: 550,
  wallConnectorPoseTtc: 1490,
  borneCiAchatHt: 1450,
  borneCiPoseHt: 2400,
  poseEurKwc: { residentiel: 450, tertiaireToiture: 250, ombriere: 350 },
  demarchesHt: { residentiel: 490, tertiaire: 1450, tertiaireAuDela100: 2400 },
  miseEnServiceHt: { residentiel: 380, tertiaire: 850, ombriere: 1200 },
} as const;

export function prixOnduleurChaineHt(kwAc: number): { puHt: number; officiel: boolean } {
  const kw = Math.max(0, kwAc);
  if (Math.abs(kw - 30) < 1) return { puHt: BPU_2026.onduleurHt.k30, officiel: true };
  if (Math.abs(kw - 50) < 1) return { puHt: BPU_2026.onduleurHt.k50, officiel: true };
  if (Math.abs(kw - 100) < 1) return { puHt: BPU_2026.onduleurHt.k100, officiel: true };
  if (kw > 100) return { puHt: Math.round((BPU_2026.onduleurHt.k100 * kw) / 100), officiel: false };
  if (kw >= 30) {
    const paliers = [
      { kw: 30, pu: BPU_2026.onduleurHt.k30 },
      { kw: 50, pu: BPU_2026.onduleurHt.k50 },
      { kw: 100, pu: BPU_2026.onduleurHt.k100 },
    ];
    const proche = [...paliers].sort((a, b) => Math.abs(a.kw - kw) - Math.abs(b.kw - kw))[0];
    return { puHt: proche.pu, officiel: false };
  }
  return { puHt: Math.max(900, Math.round(145 * kw)), officiel: false };
}

export type ModeleCascade = {
  id: string;
  marque: MarqueCascade;
  nom: string;
  kwAc: number;
  mppt: number;
  vmax: number;
  vmin: number;
  imax: number;
  ratioDcMax: number;
};

/** Valeurs de travail à confirmer sur la fiche fabricant avant Consuel. */
export const MODELES_CASCADE: ModeleCascade[] = [
  { id: "sun2000-50", marque: "huawei", nom: "Huawei SUN2000-50KTL-M3", kwAc: 50, mppt: 6, vmax: 1100, vmin: 200, imax: 30, ratioDcMax: 1.5 },
  { id: "sun2000-100", marque: "huawei", nom: "Huawei SUN2000-100KTL-M2", kwAc: 100, mppt: 10, vmax: 1100, vmin: 200, imax: 26, ratioDcMax: 1.5 },
  { id: "sun2000-185", marque: "huawei", nom: "Huawei SUN2000-185KTL-H1", kwAc: 185, mppt: 9, vmax: 1500, vmin: 500, imax: 30, ratioDcMax: 1.4 },
  { id: "sma-core1", marque: "sma", nom: "SMA Sunny Tripower CORE1", kwAc: 50, mppt: 6, vmax: 1000, vmin: 150, imax: 20, ratioDcMax: 1.5 },
  { id: "sma-core2", marque: "sma", nom: "SMA Sunny Tripower CORE2", kwAc: 110, mppt: 12, vmax: 1000, vmin: 200, imax: 26, ratioDcMax: 1.5 },
];

export const MICROS: Record<
  MicroId,
  {
    nom: string;
    panneauxParMicro: number;
    va: number;
    iac: number;
    disjoncteurA: number;
    courantUtileA: number;
  }
> = {
  "enphase-iq8": {
    nom: "Enphase IQ8HC",
    panneauxParMicro: 1,
    va: 384,
    iac: 1.67,
    disjoncteurA: 20,
    courantUtileA: 16,
  },
  "apsystems-ds3": {
    nom: "APSystems DS3",
    panneauxParMicro: 2,
    va: 730,
    iac: 3.3,
    disjoncteurA: 20,
    courantUtileA: 16,
  },
};

export type ModeleOnduleur = {
  id: string;
  marque: MarqueCentrale;
  nom: string;
  kwAc: number;
  mppt: number;
  vmax: number;
  vmin: number;
  imax: number;
  ratioDcMax: number;
  optimiseurs: boolean;
  optMin: number;
  optMax: number;
};

export const MODELES_CENTRAUX: ModeleOnduleur[] = [
  { id: "sun2000-5", marque: "huawei", nom: "Huawei SUN2000-5KTL-M1", kwAc: 5, mppt: 2, vmax: 1100, vmin: 140, imax: 11, ratioDcMax: 1.5, optimiseurs: false, optMin: 0, optMax: 0 },
  { id: "sun2000-6", marque: "huawei", nom: "Huawei SUN2000-6KTL-M1", kwAc: 6, mppt: 2, vmax: 1100, vmin: 140, imax: 11, ratioDcMax: 1.5, optimiseurs: false, optMin: 0, optMax: 0 },
  { id: "sun2000-8", marque: "huawei", nom: "Huawei SUN2000-8KTL-M1", kwAc: 8, mppt: 2, vmax: 1100, vmin: 140, imax: 13.5, ratioDcMax: 1.5, optimiseurs: false, optMin: 0, optMax: 0 },
  { id: "sun2000-10", marque: "huawei", nom: "Huawei SUN2000-10KTL-M1", kwAc: 10, mppt: 2, vmax: 1100, vmin: 140, imax: 13.5, ratioDcMax: 1.5, optimiseurs: false, optMin: 0, optMax: 0 },
  { id: "sun2000-12", marque: "huawei", nom: "Huawei SUN2000-12K-M5", kwAc: 12, mppt: 2, vmax: 1100, vmin: 200, imax: 20, ratioDcMax: 1.5, optimiseurs: false, optMin: 0, optMax: 0 },
  { id: "sun2000-15", marque: "huawei", nom: "Huawei SUN2000-15K-M5", kwAc: 15, mppt: 2, vmax: 1100, vmin: 200, imax: 20, ratioDcMax: 1.5, optimiseurs: false, optMin: 0, optMax: 0 },
  { id: "sun2000-20", marque: "huawei", nom: "Huawei SUN2000-20K-M5", kwAc: 20, mppt: 2, vmax: 1100, vmin: 200, imax: 22, ratioDcMax: 1.5, optimiseurs: false, optMin: 0, optMax: 0 },
  { id: "se5000h", marque: "solaredge", nom: "SolarEdge SE5000H + optimiseurs", kwAc: 5, mppt: 1, vmax: 480, vmin: 380, imax: 13, ratioDcMax: 1.55, optimiseurs: true, optMin: 8, optMax: 25 },
  { id: "se6000h", marque: "solaredge", nom: "SolarEdge SE6000H + optimiseurs", kwAc: 6, mppt: 1, vmax: 480, vmin: 380, imax: 13, ratioDcMax: 1.55, optimiseurs: true, optMin: 8, optMax: 25 },
  { id: "se8000h", marque: "solaredge", nom: "SolarEdge SE8000H + optimiseurs", kwAc: 8, mppt: 2, vmax: 480, vmin: 380, imax: 14, ratioDcMax: 1.55, optimiseurs: true, optMin: 8, optMax: 25 },
  { id: "se10000h", marque: "solaredge", nom: "SolarEdge SE10000H + optimiseurs", kwAc: 10, mppt: 2, vmax: 480, vmin: 380, imax: 14, ratioDcMax: 1.55, optimiseurs: true, optMin: 8, optMax: 25 },
];

/** Productible AC de référence, orientation sud ~30°, pertes système déjà intégrées (ordre de grandeur PVGIS). */
export const DEPARTEMENTS: { code: string; nom: string; productible: number }[] = [
  { code: "21", nom: "Côte-d'Or", productible: 1180 },
  { code: "69", nom: "Rhône", productible: 1240 },
  { code: "71", nom: "Saône-et-Loire", productible: 1220 },
  { code: "01", nom: "Ain", productible: 1210 },
  { code: "07", nom: "Ardèche", productible: 1380 },
  { code: "13", nom: "Bouches-du-Rhône", productible: 1480 },
  { code: "38", nom: "Isère", productible: 1280 },
  { code: "42", nom: "Loire", productible: 1200 },
  { code: "75", nom: "Paris", productible: 1100 },
];

export const OBSTACLES_DEFAUT: Record<
  "velux" | "cheminee" | "ventilation",
  { largeurM: number; hauteurM: number; libelle: string }
> = {
  velux: { largeurM: 0.78, hauteurM: 1.18, libelle: "Velux" },
  cheminee: { largeurM: 0.5, hauteurM: 0.7, libelle: "Cheminée" },
  ventilation: { largeurM: 0.3, hauteurM: 0.3, libelle: "Ventilation" },
};

export const ETAT_INITIAL: EtatCalpinage = {
  clientNom: "",
  largeurM: 10,
  rampantM: 6,
  inclinaisonDeg: 30,
  azimutDeg: 0,
  segment: "residentiel",
  typeCouverture: "rampant",
  kwcCible: null,
  unitesPowerwall: 1,
  marqueCascade: "huawei",
  modeleCascadeId: "auto",
  batterieCiKwh: 0,
  irveActive: false,
  nbBornes: 4,
  tarifPro: "jaune",
  prixManuel: false,
  injectionManuelle: false,
  obstacles: [],
  orientation: "portrait",
  panneauId: "trina-450",
  panneauCustom: { ...PANNEAU_CUSTOM_DEFAUT },
  desactives: [],
  architecture: "tesla-pw3",
  repartition: "auto",
  comptes: [0, 0, 0, 0, 0, 0],
  secours: true,
  microId: "enphase-iq8",
  marqueCentrale: "huawei",
  modeleCentralId: "auto",
  departement: "71",
  productible: 1220,
  productibleManuel: false,
  consoKwh: 10000,
  prixKwh: 0.25,
  tarifInjection: 0.1,
  investissementSaisi: null,
};

export const MENTIONS_ETUDE = [
  "Étude technique indicative. Elle ne constitue pas un devis contractuel ni une note de calcul Consuel.",
  "Productible corrigé par une méthode inspirée de PVGIS (inclinaison et azimut). Pas d'appel au service en ligne PVGIS.",
  "Tensions de chaîne : Voc à −10 °C et Vmpp à 70 °C, à partir des coefficients catalogue.",
  "Aides financières 2026 (estimation à titre indicatif). Aucune aide n'est déduite de ce bilan.",
  "Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction des organismes concernés.",
  "En rénovation globale, le photovoltaïque s'installe en dernier, après isolation, menuiseries, ventilation et chauffage.",
  "Validation d'un installateur QualiPV requise avant commande du matériel.",
] as const;

export function panneauDepuisEtat(etat: Pick<EtatCalpinage, "panneauId" | "panneauCustom">): Panneau {
  if (etat.panneauId === "custom") return { ...etat.panneauCustom, id: "custom", personnalise: true };
  return PANNEAUX.find((item) => item.id === etat.panneauId) ?? PANNEAUX[0];
}
