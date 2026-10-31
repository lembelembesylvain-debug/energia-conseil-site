/**
 * Longère bressane — 71290 La Genête.
 * Source : plans d'architecte, schéma de charpente, réseaux de plomberie,
 * cahier des charges (Clyve A. — Cabinet Hub Admin).
 * Prix fermes des phases 1 à 3. La phase 4 n'est pas chiffrée ici.
 */

import { TAUX_MARGE_SECURISATION, TAUX_MARGE_VIGILANCE } from "../lib/crm/gardeFouMarge.js";

export const TAUX_TVA_URGENCE = 0.1;

/** Honoraires de direction de la phase 1, inclus dans les 8 850 € HT. */
export const MARGE_CG_PHASE_1_HT = 1500;
export const TOTAL_PHASE_1_HT = 8850;
export const TOTAL_PHASE_1_TTC = 9735;

/** Taux sanctuarisé = direction phase 1 / forfait phase 1. Ventilé tel quel sur les phases suivantes. */
export const TAUX_MARGE_CG_SANCTUARISE = MARGE_CG_PHASE_1_HT / TOTAL_PHASE_1_HT;

export type NatureLigne = "travaux" | "marge_cg";
export type ModeOffre = "phase1" | "phase1et2";
export type StatutMarge = "conforme" | "vigilance" | "insuffisante";

export type PieceModule = {
  nom: string;
  surfaceM2: number;
  note?: string;
};

export type ModuleTravee = {
  id: "A" | "B" | "C" | "D" | "E" | "F";
  nom: string;
  role: string;
  longueurM: number;
  surfaceM2: number;
  pieces: PieceModule[];
  etat: string;
  horsPerimetreUrgent: boolean;
  prioritaire: boolean;
  alertes: string[];
};

export type LigneOffre = {
  id: string;
  phase: 1 | 2 | 3;
  nature: NatureLigne;
  sanctuarisee: boolean;
  designation: string;
  specifications: string;
  module: string;
  quantite: number;
  unite: string;
  puHt: number;
  totalHt: number;
};

export type PrioriteVisite = {
  rang: number;
  niveau: "immédiat" | "hiver" | "consolidé" | "printemps";
  module: string;
  titre: string;
  constat: string;
  action: string;
};

export type OffreGeneree = {
  mode: ModeOffre;
  numero: string;
  lignes: LigneOffre[];
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  travauxHt: number;
  margeCgHt: number;
  tauxMargeCg: number;
  statutMarge: StatutMarge;
  libelleStatutMarge: string;
  echeancier: { signature: number; miChantier: number; reception: number };
};

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function euro(n: number): string {
  return (
    round2(n).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

export function pct(n: number): string {
  return (
    (n * 100).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " %"
  );
}

/**
 * Ventile la marge CG au taux sanctuarisé de la phase 1.
 * La phase 1 reste calée sur 1 500 € pile. Les phases suivantes sont arrondies à l'euro.
 */
export function ventilerMargeCg(totalPhaseHt: number, phase: 1 | 2 | 3): { margeHt: number; travauxHt: number } {
  const margeHt = phase === 1 ? MARGE_CG_PHASE_1_HT : Math.round(totalPhaseHt * TAUX_MARGE_CG_SANCTUARISE);
  return { margeHt, travauxHt: round2(totalPhaseHt - margeHt) };
}

function ligne(partial: Omit<LigneOffre, "quantite" | "unite" | "totalHt" | "sanctuarisee"> & { sanctuarisee?: boolean }): LigneOffre {
  return {
    quantite: 1,
    unite: "forfait",
    totalHt: partial.puHt,
    sanctuarisee: partial.nature === "marge_cg",
    ...partial,
  };
}

const ventilation1 = ventilerMargeCg(TOTAL_PHASE_1_HT, 1);
const ventilation2 = ventilerMargeCg(6000, 2);
const ventilation3 = ventilerMargeCg(4200, 3);

export const PROJET_LONGERE = {
  nom: "Longère La Genête",
  numeroBase: "DEV-2026-LAGENETE",
  date: "2026-09-23",
  dateLibelle: "23 septembre 2026",
  validite: "3 mois",
  client: "Clyve A.",
  cabinet: "Cabinet Hub Admin",
  adresse: "654 route départementale 975",
  codePostal: "71290",
  commune: "La Genête",
  typologie: "Longère bressane en pisé sur soubassement pierre et brique",
  longueurFacadeM: 31.03,
  surfaceHabitablePlanM2: 242.8,
  hauteurFaitageM: 6.25,
  hauteurEgoutM: 4.87,
  epaisseurRefendsCm: "50 à 80",
  tauxTva: TAUX_TVA_URGENCE,
  motifTva:
    "TVA 10 % — travaux d'amélioration d'un logement achevé depuis plus de deux ans, marché forfaitaire y compris la direction de chantier.",
} as const;

export const MODULES_TRAVEES: ModuleTravee[] = [
  {
    id: "A",
    nom: "Annexe studio",
    role: "Toiture mono-pente adossée au mur B",
    longueurM: 4.2,
    surfaceM2: 23.9,
    pieces: [
      { nom: "Bureau", surfaceM2: 11.1, note: "Plancher haut existant, solives entraxe 45–50 cm" },
      { nom: "Cuisine", surfaceM2: 10.9, note: "Sans plancher haut" },
      { nom: "Salle d'eau", surfaceM2: 1.9, note: "Ballon 200 L en hauteur, environ 2,60 m" },
    ],
    etat: "Annexe habitée en partie. Départ tout-à-l'égout général Ø100 à l'angle, côté route.",
    horsPerimetreUrgent: false,
    prioritaire: false,
    alertes: [
      "Fuite permanente du ballon 200 L par le groupe de sécurité",
      "Évacuation générale Ø100 à l'angle",
    ],
  },
  {
    id: "B",
    nom: "Pièce de vie",
    role: "Cuisine, séjour et entrée — priorité familiale",
    longueurM: 4.65,
    surfaceM2: 44.3,
    pieces: [
      { nom: "Cuisine", surfaceM2: 18.2 },
      { nom: "Séjour", surfaceM2: 21.3, note: "Salle à manger 13,1 m² et salon 8,2 m²" },
      { nom: "Entrée", surfaceM2: 4.8 },
    ],
    etat: "Vide de plancher haut : volume cathédrale. Nourrice principale 4 sorties après réducteur de pression.",
    horsPerimetreUrgent: false,
    prioritaire: true,
    alertes: [
      "Fuite nourrice / cuivre : le mur en pisé est imbibé",
      "Aucun plancher haut aujourd'hui",
    ],
  },
  {
    id: "C",
    nom: "Chambre GG",
    role: "Chambre, buanderie, salle de bain et WC",
    longueurM: 4.07,
    surfaceM2: 28.3,
    pieces: [
      { nom: "Chambre GG", surfaceM2: 12.7 },
      { nom: "Buanderie", surfaceM2: 5.1, note: "Ballon 300 L au sol, contre le refend avec D" },
      { nom: "Salle de bain", surfaceM2: 4.5 },
      { nom: "WC", surfaceM2: 1.7 },
      { nom: "Circulations", surfaceM2: 4.3, note: "Solde du module pour atteindre 28,3 m² — à recouper sur site" },
    ],
    etat: "Plancher haut existant, niveaux décalés, structure mixte poutre et muralières, trémie d'escalier, solives entraxe 37–39 cm.",
    horsPerimetreUrgent: false,
    prioritaire: false,
    alertes: ["Décalage de niveau du plancher haut", "Trémie d'escalier à conserver"],
  },
  {
    id: "D",
    nom: "Aile enfants",
    role: "Chambres des garçons et d'Alexia, salle d'eau",
    longueurM: 4.45,
    surfaceM2: 33.1,
    pieces: [
      { nom: "Chambre des garçons", surfaceM2: 17.5 },
      { nom: "Chambre Alexia", surfaceM2: 10.1 },
      { nom: "Salle d'eau", surfaceM2: 3.2 },
      { nom: "Couloir", surfaceM2: 2.3 },
    ],
    etat: "Plancher aggloméré 18 mm sur solives, entraxe 37–39 cm. Deux poutres maîtresses nord-sud. Muralières côté jardin et côté route.",
    horsPerimetreUrgent: false,
    prioritaire: false,
    alertes: ["Plancher aggloméré 18 mm à consolider"],
  },
  {
    id: "E",
    nom: "Suite parentale future",
    role: "Espace brut — compteur général",
    longueurM: 4.57,
    surfaceM2: 36.1,
    pieces: [{ nom: "Espace brut", surfaceM2: 36.1, note: "Future suite parentale, aucun plancher haut" }],
    etat: "Arrivée générale d'eau, vanne au compteur, conduite enterrée noire Ø27 jusqu'à B. Départs vers C et D en PER Ø16.",
    horsPerimetreUrgent: false,
    prioritaire: false,
    alertes: ["Compteur déjà gelé une fois : calorifugeage avant l'hiver"],
  },
  {
    id: "F",
    nom: "Grange / garage",
    role: "Abri véhicules et stockage — toiture plus récente",
    longueurM: 9.09,
    surfaceM2: 71.9,
    pieces: [{ nom: "Pièce brute", surfaceM2: 71.9, note: "Hors périmètre des travaux urgents" }],
    etat: "Grande grange. Toiture différente, non représentée sur le schéma de charpente des travées B à E. Non desservie en eau.",
    horsPerimetreUrgent: true,
    prioritaire: false,
    alertes: ["Hors périmètre urgent"],
  },
];

export const LIGNES_PHASE_1: LigneOffre[] = [
  ligne({
    id: "p1-sablieres",
    phase: 1,
    nature: "travaux",
    module: "B–D",
    designation: "Pannes sablières continues sur têtes de murs en pisé",
    specifications:
      "Travées B à D. Report des charges de charpente sur les têtes de murs en terre crue (refends 50 à 80 cm), en bout de mur côté façade. Ancrage adapté au pisé, sans ceinture étanche ni enduit ciment.",
    puHt: 1850,
  }),
  ligne({
    id: "p1-pannes",
    phase: 1,
    nature: "travaux",
    module: "B–D",
    designation: "Reprise des pannes dégradées",
    specifications:
      "Panne faîtière et pannes intermédiaires (deux par pan en général). Remplacement des pièces défectueuses. Les pièces saines sont conservées après diagnostic du charpentier sur site.",
    puHt: 1650,
  }),
  ligne({
    id: "p1-volige",
    phase: 1,
    nature: "travaux",
    module: "B–D",
    designation: "Platelage / voligeage continu",
    specifications:
      "Pose sur les chevrons, au-dessus des pannes, pour porter la mise hors d'eau provisoire. Continuité possible d'une travée à l'autre selon l'état constaté.",
    puHt: 1450,
  }),
  ligne({
    id: "p1-bache",
    phase: 1,
    nature: "travaux",
    module: "B–D",
    designation: "Bâche armée renforcée — mise hors d'eau provisoire",
    specifications:
      "Couverture provisoire pour passer l'hiver au sec. La couverture définitive en tuiles canal bressanes est reportée à la phase 4, avec l'isolation sarking.",
    puHt: 980,
  }),
  ligne({
    id: "p1-pise",
    phase: 1,
    nature: "travaux",
    module: "B",
    designation: "Réfection de l'étanchéité nourrice / cuivre — protection du pisé",
    specifications:
      "Fuite à la jonction nourrice / tube cuivre dans le module B, qui imbibe le mur en terre crue. Reprise du raccord, assèchement et protection du mur. Aucun enduit ciment.",
    puHt: 620,
  }),
  ligne({
    id: "p1-groupe",
    phase: 1,
    nature: "travaux",
    module: "A",
    designation: "Remplacement du groupe de sécurité du ballon 200 L",
    specifications:
      "Module A, ballon acquis en 2022, posé à environ 2,60 m derrière la porte côté route. Fuite permanente par le tuyau de rejet : groupe de sécurité entartré à remplacer. Ballon conservé si le contrôle le permet.",
    puHt: 280,
  }),
  ligne({
    id: "p1-gel",
    phase: 1,
    nature: "travaux",
    module: "E",
    designation: "Calorifugeage du compteur d'eau et de la vanne générale",
    specifications:
      "Module E. Le compteur a déjà gelé une fois. Protection gel à reposer avant l'hiver, vanne générale comprise.",
    puHt: 220,
  }),
  ligne({
    id: "p1-durgo",
    phase: 1,
    nature: "travaux",
    module: "A",
    designation: "Ventilation primaire — clapet aérateur Durgo",
    specifications:
      "Aucune ventilation primaire identifiée. Pose d'un clapet aérateur pour supprimer les odeurs du tout-à-l'égout. Le collecteur général part à l'angle du module A, côté route.",
    puHt: 300,
  }),
  ligne({
    id: "p1-direction",
    phase: 1,
    nature: "marge_cg",
    module: "A–E",
    designation: "Direction et coordination — ENERGIA-CONSEIL IA®",
    specifications:
      "Sylvain LEMBELEMBE, contractant général. Coordination des artisans, respect de l'ordre des interventions, prix ferme, validation des déblocages de 40 % et de 30 %. Incluse au forfait de 8 850 € HT.",
    puHt: ventilation1.margeHt,
  }),
];

export const LIGNES_PHASE_2: LigneOffre[] = [
  ligne({
    id: "p2-muralieres",
    phase: 2,
    nature: "travaux",
    module: "B",
    designation: "Muralières sur refends",
    specifications:
      "Module B, aujourd'hui sans plancher haut. Muralières ancrées sur les murs de refend (épaisseur d'ordre 60 cm), appuis adaptés au pisé.",
    puHt: 1450,
  }),
  ligne({
    id: "p2-solives",
    phase: 2,
    nature: "travaux",
    module: "B",
    designation: "Solives 75 × 225",
    specifications:
      "Plancher haut bois du module B. Section 75 × 225. Entraxe et portée à confirmer au lever d'exécution, dans le forfait.",
    puHt: 1680,
  }),
  ligne({
    id: "p2-osb",
    phase: 2,
    nature: "travaux",
    module: "B",
    designation: "Dalles OSB 3",
    specifications: "Platelage du plancher haut du module B en dalles OSB 3, sur les solives.",
    puHt: 1150,
  }),
  ligne({
    id: "p2-cuisine",
    phase: 2,
    nature: "travaux",
    module: "B",
    designation: "Attentes cuisine du module B",
    specifications:
      "Attentes eau froide et évacuation pour la future cuisine. La sortie cuisine en PER Ø16 figure au plan et n'est pas raccordée aujourd'hui. Nourrice principale 4 sorties conservée.",
    puHt: 703,
  }),
  ligne({
    id: "p2-direction",
    phase: 2,
    nature: "marge_cg",
    module: "B",
    designation: "Direction et coordination — habitabilité du module B",
    specifications:
      "Pilotage du plancher haut et des attentes cuisine du module B. Inclus dans le forfait de 6 000 € HT.",
    puHt: ventilation2.margeHt,
  }),
];

export const LIGNES_PHASE_3: LigneOffre[] = [
  ligne({
    id: "p3-plancher-c",
    phase: 3,
    nature: "travaux",
    module: "C",
    designation: "Consolidation du plancher haut du module C",
    specifications:
      "Reprise du décalage de niveau, structure mixte poutre maîtresse côté route et muralières. Trémie d'escalier conservée. Solives entraxe 37–39 cm.",
    puHt: 1480,
  }),
  ligne({
    id: "p3-plancher-d",
    phase: 3,
    nature: "travaux",
    module: "D",
    designation: "Consolidation du plancher haut du module D",
    specifications:
      "Plancher aggloméré 18 mm, deux poutres maîtresses nord-sud, muralières côté jardin et côté route, solives entraxe 37–39 cm.",
    puHt: 1360,
  }),
  ligne({
    id: "p3-attentes",
    phase: 3,
    nature: "travaux",
    module: "C",
    designation: "Attentes salle de bain et WC du module C",
    specifications:
      "Attentes sur le réseau déjà alimenté depuis C (douche, lavabo, WC). Évacuations existantes : évier / lavabo / douche Ø40, WC Ø100. Hors pose des appareils.",
    puHt: 648,
  }),
  ligne({
    id: "p3-direction",
    phase: 3,
    nature: "marge_cg",
    module: "C–D",
    designation: "Direction et coordination — consolidation C et D",
    specifications: "Pilotage de la consolidation des planchers C et D et des attentes sanitaires. Inclus dans le forfait de 4 200 € HT.",
    puHt: ventilation3.margeHt,
  }),
];

export const CHARTE_PHASES = {
  1: {
    id: 1 as const,
    nomCourt: "Urgence Hiver",
    badge: "Phase 1 — Urgence Hiver",
    liseret: "#475569",
    fond: "#f1f5f9",
    texte: "#f8fafc",
    thead: "#334155",
    liseretClasse: "border-l-4 border-slate-600",
    badgeClasse: "bg-slate-700 text-slate-50",
    fondCarte: "bg-slate-50",
    theadClasse: "bg-slate-700 text-white",
    boutonActif: "border-slate-600 bg-slate-50 ring-2 ring-slate-600",
  },
  2: {
    id: 2 as const,
    nomCourt: "Habitabilité B",
    badge: "Phase 2 — Habitabilité B",
    liseret: "#b45309",
    fond: "#fffbeb",
    texte: "#fffbeb",
    thead: "#92400e",
    liseretClasse: "border-l-4 border-amber-700",
    badgeClasse: "bg-amber-700 text-amber-50",
    fondCarte: "bg-amber-50",
    theadClasse: "bg-amber-800 text-amber-50",
    boutonActif: "border-amber-700 bg-amber-50 ring-2 ring-amber-700",
  },
  3: {
    id: 3 as const,
    nomCourt: "Consolidation",
    badge: "Phase 3 — Consolidation",
    liseret: "#0B1F3A",
    fond: "#e8eef5",
    texte: "#e2e8f0",
    thead: "#0B1F3A",
    liseretClasse: "border-l-4 border-[#0B1F3A]",
    badgeClasse: "bg-[#0B1F3A] text-slate-100",
    fondCarte: "bg-slate-50",
    theadClasse: "bg-[#0B1F3A] text-white",
    boutonActif: "border-[#0B1F3A] bg-slate-50 ring-2 ring-[#0B1F3A]",
  },
  4: {
    id: 4 as const,
    nomCourt: "Printemps Anah",
    badge: "Parcours aidé Anah 80 %",
    liseret: "#059669",
    or: "#C9A227",
    fond: "#ecfdf5",
    texte: "#fef3c7",
    thead: "#047857",
    liseretClasse: "border-l-4 border-emerald-600",
    badgeClasse: "bg-emerald-700 text-amber-100 ring-1 ring-[#C9A227]",
    fondCarte: "bg-emerald-50",
    theadClasse: "bg-emerald-800 text-amber-100",
    boutonActif: "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600",
  },
} as const;

export type IdPhase = keyof typeof CHARTE_PHASES;

export const PHASES = [
  {
    id: 1 as const,
    nom: "Urgence hiver",
    resume: "Charpente, voligeage, bâche armée, plomberie urgente et direction.",
    totalHt: TOTAL_PHASE_1_HT,
    lignes: LIGNES_PHASE_1,
    dansDevisInstantane: true,
  },
  {
    id: 2 as const,
    nom: "Habitabilité du module B",
    resume: "Plancher haut bois, attentes cuisine et pilotage.",
    totalHt: 6000,
    lignes: LIGNES_PHASE_2,
    dansDevisInstantane: true,
  },
  {
    id: 3 as const,
    nom: "Consolidation C et D",
    resume: "Planchers hauts C et D, attentes salle de bain et WC.",
    totalHt: 4200,
    lignes: LIGNES_PHASE_3,
    dansDevisInstantane: false,
  },
] as const;

export const TAUX_TVA_PHASE_4 = 0.055;
export const TOTAL_PHASE_4_HT = 69000;
export const TOTAL_PHASE_4_TVA = 3795;
export const TOTAL_PHASE_4_TTC = 72795;
export const MARGE_CG_PHASE_4_HT = 5200;
export const AIDES_PHASE_4_INDICATIVES = 55200;
export const AIDES_PHASE_4_MAX = 56000;
export const RAC_PHASE_4_MIN_TTC = 13600;
export const RAC_PHASE_4_TTC = 17595;

export const PHASE_4 = {
  id: 4 as const,
  nom: "Rénovation énergétique globale",
  saison: "Printemps",
  libelleOption: "Phase 4 — Rénovation Énergétique Globale Printemps (Parcours MAR / Anah)",
  resume:
    "Couverture définitive, isolation sarking fibre de bois, menuiseries, VMC, pompe à chaleur et eau chaude. Dimensionnements post-isolation. Parcours accompagné MAR / Anah.",
  profilAides: "Bleu — Très Modeste, foyer de 5 personnes",
  tauxTva: TAUX_TVA_PHASE_4,
  totalHt: TOTAL_PHASE_4_HT,
  totalTva: TOTAL_PHASE_4_TVA,
  totalTtc: TOTAL_PHASE_4_TTC,
  aidesIndicatives: AIDES_PHASE_4_INDICATIVES,
  resteAChargeTtc: RAC_PHASE_4_TTC,
  financement:
    "~13 600 € à 17 595 € TTC (finançable via Éco-PTZ à taux 0 % par Vivons Courtier).",
  postes: [
    {
      ordre: 1,
      nom: "Sarking fibre de bois",
      ht: 18500,
      detail: "Isolation de toiture posée avant la couverture définitive et avant tout chauffage. Isolant perspirant, compatible pisé.",
    },
    {
      ordre: 2,
      nom: "Couverture tuiles canal bressanes",
      ht: 14800,
      detail: "Remplace la bâche armée de la phase 1. Tuiles neuves et liteaux sur le complexe sarking.",
    },
    {
      ordre: 3,
      nom: "Menuiseries double vitrage",
      ht: 12400,
      detail: "Après isolation de toiture. Uw à confirmer au lever. Pose RGE.",
    },
    {
      ordre: 4,
      nom: "VMC Hygro",
      ht: 1800,
      detail: "Après l'isolation. Débits à dimensionner. Le pisé doit continuer à pouvoir sécher.",
    },
    {
      ordre: 5,
      nom: "PAC Air/Eau",
      ht: 13500,
      detail: "Puissance calculée après isolation, avec marge de 10 à 20 %. Coefficient post-isolation.",
    },
    {
      ordre: 6,
      nom: "Chauffe-eau thermodynamique",
      ht: 2800,
      detail: "Remplacement des ballons 200 L (A) et 300 L (C), à confirmer sur site.",
    },
    {
      ordre: 7,
      nom: "Direction & Coordination ENERGIA-CONSEIL IA®",
      ht: MARGE_CG_PHASE_4_HT,
      sanctuarisee: true,
      detail: "Ligne sanctuarisée 5 200 € HT. 100 % ENERGIA, aucun intermédiaire commercial.",
    },
  ],
};

export type FigureAnnexe = {
  src: string;
  alt: string;
  legende: string;
  mention: string;
};

export const ANNEXE_COUPE_3D = {
  titre: "ANNEXE TECHNIQUE 1 — PROJECTION 3D ET ORGANISATION MODULAIRE DES TRAVÉES (A à F)",
  figures: [
    {
      src: "/projects/clyve-lagenete/plan-3d-rez-de-chaussee-travees-a-f.jpg",
      alt: "Plan 3D axonométrique du rez-de-chaussée de la longère rénovée, murs arasés, travées A à F repérées et nommées.",
      legende:
        "Figure 1 : Vue en coupe 3D du bâti de 31 mètres (Travées A à F) — Repérage des volumes, de l'espace familial B, du pôle enfants D et de la grange/garage F. Source : Bureau d'études ENERGIA CONSEIL IA.",
      mention:
        "Projection du programme après rénovation. Les aménagements représentés ne font pas partie du présent devis d'urgence.",
    },
    {
      src: "/projects/clyve-lagenete/coupe-3d-travees-a-f.jpg",
      alt: "Schéma technique de la charpente : pannes sablières, intermédiaires et faîtière sur murs de refend, travées A à F cotées.",
      legende:
        "Figure 2 : Schéma technique de la charpente à pannes sur murs de refend — Positionnement des sablières en tête de mur en pisé et du voligeage continu, objet de la phase 1. Source : Bureau d'études ENERGIA CONSEIL IA.",
      mention:
        "Schéma indicatif, à adapter sur site par le charpentier. Sections et nombre de pannes à valider après visite.",
    },
  ] as FigureAnnexe[],
} as const;

export const MENTIONS_AIDES = [
  "Aides financières 2026 (estimation à titre indicatif).",
  "Aides à valider selon revenus réels du client et éligibilité en vigueur.",
  "Montants définitifs après instruction ANAH et CEE.",
] as const;

export const TITRE_PROJECTION_FINANCIERE_2027 =
  "IV. Projection financière indicative — Transition énergétique Printemps 2027";

export const AVERTISSEMENT_AIDES_2027 =
  "Avertissement réglementaire : Les montants d'aides mentionnés pour la Phase 4 sont calculés à titre purement estimatif sur la base des barèmes officiels Anah en vigueur pour un foyer de 5 personnes (profil Bleu). Les montants et taux réels seront arrêtés conformément aux dispositions de la Loi de Finances et aux barèmes Anah applicables en 2027 au moment de l'instruction du dossier par le MAR (Cabinet C2ET). ENERGIA CONSEIL IA® ne garantit pas les décisions d'attribution des organismes financeurs.";

export const INDEPENDANCE_PHASE_1 =
  "Les travaux d'urgence de la Phase 1 sont indépendants et non conditionnés à l'accord d'aides de la Phase 4. Le présent marché d'urgence peut être signé immédiatement : il ne contient aucun geste énergétique subventionné.";

export const MENTION_NON_SIGNATURE_ANAH =
  "Projet soumis à instruction MAR / Anah au printemps 2027 — Ne pas signer avant notification d'accord Anah";

export const TEXTE_PRISE_EN_CHARGE_ANAH_BLEU =
  "80 % de prise en charge financière (Profil Anah Bleu — Très Modeste). Subvention Anah directe estimée : 55 200 € à 56 000 €.";

export const LIBELLE_MPR_PHASE_4 =
  "MaPrimeRénov' Parcours Accompagné (Profil Bleu 80 % indicatif)";

export const SIMULATION_AIDES_PHASE_4 = [
  {
    poste: LIBELLE_MPR_PHASE_4,
    detail: TEXTE_PRISE_EN_CHARGE_ANAH_BLEU,
    montant: AIDES_PHASE_4_INDICATIVES,
  },
  {
    poste: "CEE et Coup de pouce",
    detail: "Fourchette selon obligés (variation 20 à 40 %). Hors ITE / ITI. Montants définitifs après CEE.",
  },
  {
    poste: "Reste à charge prévisionnel estimé",
    detail: "~13 600 € à 17 595 € TTC (finançable via Éco-PTZ à taux 0 % par Vivons Courtier).",
    montant: RAC_PHASE_4_TTC,
  },
] as const;

export const PRIORITES_VISITE: PrioriteVisite[] = [
  {
    rang: 1,
    niveau: "immédiat",
    module: "B",
    titre: "Fuite nourrice / cuivre dans le pisé",
    constat: "La jonction nourrice / tube cuivre fuit et imbibe le mur en terre crue.",
    action: "Couper, reprendre l'étanchéité, laisser sécher le pisé. Interdire tout enduit ciment.",
  },
  {
    rang: 2,
    niveau: "immédiat",
    module: "A",
    titre: "Groupe de sécurité du ballon 200 L",
    constat: "Fuite permanente par le tuyau de rejet. Groupe entartré.",
    action: "Remplacer le groupe de sécurité. Contrôler le ballon avant de le conserver.",
  },
  {
    rang: 3,
    niveau: "hiver",
    module: "E",
    titre: "Compteur d'eau exposé au gel",
    constat: "Compteur général et vanne dans le module E. Déjà gelé une fois.",
    action: "Calorifuger le compteur, la vanne et le départ enterré Ø27 accessible.",
  },
  {
    rang: 4,
    niveau: "hiver",
    module: "A",
    titre: "Odeurs du tout-à-l'égout",
    constat: "Aucune ventilation primaire identifiée. Départ Ø100 à l'angle du module A, côté route.",
    action: "Poser un clapet aérateur Durgo sur la ventilation primaire.",
  },
  {
    rang: 5,
    niveau: "hiver",
    module: "B–D",
    titre: "Têtes de murs en pisé sous la charpente",
    constat: "Les charges de toiture portent mal sur les murs en terre. Pannes dégradées.",
    action: "Créer les pannes sablières en bout de mur, remplacer les pannes mortes, voliger en continu, bâcher.",
  },
  {
    rang: 6,
    niveau: "hiver",
    module: "B–D",
    titre: "Mise hors d'eau sans tuiles définitives",
    constat: "La couverture canal actuelle est à reprendre. L'hiver ne permet pas d'attendre la phase 4.",
    action: "Bâche armée sur le voligeage. Tuiles neuves et sarking au printemps seulement.",
  },
  {
    rang: 7,
    niveau: "consolidé",
    module: "B",
    titre: "Volume cathédrale",
    constat: "Aucun plancher haut dans le module B. Pièce de vie prioritaire, 44,3 m².",
    action: "Prévoir muralières sur refends, solives 75 × 225 et OSB 3. Phase 2 du devis.",
  },
  {
    rang: 8,
    niveau: "consolidé",
    module: "C–D",
    titre: "Planchers hauts existants",
    constat: "C : niveaux décalés et trémie. D : aggloméré 18 mm, entraxe 37–39 cm.",
    action: "Relever flèches, appuis et état des solives avant la phase 3. Passage C–D relevé à 0,80 m.",
  },
  {
    rang: 9,
    niveau: "printemps",
    module: "F",
    titre: "Grange hors campagne urgente",
    constat: "Module F, 9,09 m, 71,9 m², toiture plus récente, non desservie en eau.",
    action: "Ne pas l'inclure dans le bâchage ni dans le devis d'urgence. Étude séparée.",
  },
];

export const CONTACTS_PROJET = [
  {
    role: "Direction et contractant général",
    nom: "Sylvain LEMBELEMBE",
    detail: "06 10 59 68 98 — contact@energia-conseil-ia.com",
  },
  {
    role: "Courtier financement",
    nom: "FABIEN — VIVONS COURTIER",
    detail: "06 71 19 96 45 — prêt travaux jusqu'à 75 000 €, éco-PTZ jusqu'à 50 000 €",
  },
  {
    role: "Juriste",
    nom: "Julia",
    detail: "Avis juridique, clause de protection des aides, plafond 2 000 €",
  },
  {
    role: "MAR (Mon Accompagnateur Rénov' agréé Anah)",
    nom: "Antoine BARATIER — Cabinet C2ET",
    detail: "Parcours accompagné et validation du dossier d'aides ANAH — phase 4, au printemps",
  },
] as const;

export const CLAUSES_DEVIS = [
  {
    titre: "Clause Julia — protection des aides",
    texte:
      "Responsabilité d'ENERGIA plafonnée à 2 000 € en cas d'écart supérieur à 10 % imputable à une erreur prouvée d'ENERGIA. Aucune participation si l'écart vient du client ou d'une décision ANAH / CEE.",
  },
  {
    titre: "Délais artisans",
    texte:
      "Délais respectés sauf météo et force majeure. Pénalités progressives en cas de retard injustifié. Remplacement de l'artisan défaillant sous 7 jours ouvrés, proposé par Sylvain.",
  },
  {
    titre: "Chantier propre",
    texte: "Nettoyage en fin de phase. Retenue possible de 5 % du lot si la réception se fait sur un chantier laissé sale.",
  },
  {
    titre: "Réserve de propriété",
    texte: "Matériaux et équipements restent la propriété des entreprises jusqu'au paiement intégral, loi du 12 mai 1980.",
  },
  {
    titre: "Retard de paiement",
    texte: "Pénalités au taux de 3 fois l'intérêt légal, et indemnité forfaitaire de recouvrement de 40 €.",
  },
  {
    titre: "Dommages-ouvrage",
    texte:
      "Le maître d'ouvrage est informé de l'intérêt d'une assurance dommages-ouvrage. ENERGIA ne répond pas d'un défaut de souscription.",
  },
  {
    titre: "Révision des prix",
    texte:
      "Si plus de 60 jours séparent le devis du démarrage, révision possible sur l'indice BT01. En deçà, le prix du présent devis est ferme.",
  },
  {
    titre: "Force majeure",
    texte: "Météo rendant la charpente impossible, rupture d'approvisionnement, maladie : report sans pénalité, information sous 8 jours.",
  },
  {
    titre: "Modification et annulation",
    texte:
      "Avenant écrit pour toute modification. Annulation client après signature : 500 € déduits du remboursement de l'acompte. Annulation ENERGIA hors force majeure : remboursement intégral et 500 €.",
  },
  {
    titre: "Litiges",
    texte: "Règlement amiable sous 15 jours, puis tribunaux de Lyon. Médiation possible si les deux parties l'acceptent.",
  },
  {
    titre: "Données personnelles",
    texte:
      "Traitement limité au projet, aux aides et à la relation commerciale. Conservation 5 ans. Droits : contact@energia-conseil-ia.com. Réclamation possible auprès de la CNIL.",
  },
  {
    titre: "Malfaçons et garanties",
    texte:
      "Mise en demeure sous 7 jours, proposition de reprise sous 15 jours. Garanties légales des entreprises. ENERGIA facilite leur mise en œuvre dans son rôle de contractant général.",
  },
] as const;

function statutDepuisTaux(taux: number): { statut: StatutMarge; libelle: string } {
  if (taux + 1e-9 >= TAUX_MARGE_SECURISATION) {
    return {
      statut: "conforme",
      libelle: `Marge sanctuarisée conforme — au-dessus du seuil de ${pct(TAUX_MARGE_SECURISATION)}`,
    };
  }
  if (taux + 1e-9 >= TAUX_MARGE_VIGILANCE) {
    return {
      statut: "vigilance",
      libelle: `Vigilance — marge sous ${pct(TAUX_MARGE_SECURISATION)}`,
    };
  }
  return {
    statut: "insuffisante",
    libelle: "Marge sous le seuil de vigilance",
  };
}

function echeancierDepuisTtc(totalTtc: number): OffreGeneree["echeancier"] {
  const cents = Math.round(round2(totalTtc) * 100);
  const signature = Math.round(cents * 0.3);
  const miChantier = Math.round(cents * 0.4);
  const reception = cents - signature - miChantier;
  return {
    signature: signature / 100,
    miChantier: miChantier / 100,
    reception: reception / 100,
  };
}

export function genererOffre(mode: ModeOffre): OffreGeneree {
  const lignes = mode === "phase1" ? LIGNES_PHASE_1 : [...LIGNES_PHASE_1, ...LIGNES_PHASE_2];
  const totalHt = round2(lignes.reduce((somme, item) => somme + item.totalHt, 0));
  const margeCgHt = round2(lignes.filter((item) => item.nature === "marge_cg").reduce((somme, item) => somme + item.totalHt, 0));
  const travauxHt = round2(totalHt - margeCgHt);
  const totalTva = round2(totalHt * TAUX_TVA_URGENCE);
  const totalTtc = round2(totalHt + totalTva);
  const tauxMargeCg = totalHt > 0 ? margeCgHt / totalHt : 0;
  const statut = statutDepuisTaux(tauxMargeCg);
  const echeancier = echeancierDepuisTtc(totalTtc);

  if (Math.abs(travauxHt + margeCgHt - totalHt) > 0.001) {
    throw new Error("Ventilation incohérente : travaux + marge ≠ total HT");
  }
  if (!lignes.some((item) => item.sanctuarisee && item.nature === "marge_cg")) {
    throw new Error("La ligne de direction sanctuarisée est absente du devis");
  }

  return {
    mode,
    numero: mode === "phase1" ? `${PROJET_LONGERE.numeroBase}-P1` : `${PROJET_LONGERE.numeroBase}-P1P2`,
    lignes,
    totalHt,
    totalTva,
    totalTtc,
    travauxHt,
    margeCgHt,
    tauxMargeCg,
    statutMarge: statut.statut,
    libelleStatutMarge: statut.libelle,
    echeancier,
  };
}

export function sommeSurfacesModules(): number {
  return round2(MODULES_TRAVEES.reduce((somme, module) => somme + module.surfaceM2, 0));
}

export function sommeLongueurs(): number {
  return round2(MODULES_TRAVEES.reduce((somme, module) => somme + module.longueurM, 0));
}

export function verifierCoherenceLongere(): string[] {
  const erreurs: string[] = [];
  const pousser = (condition: boolean, message: string) => {
    if (!condition) erreurs.push(message);
  };

  pousser(MODULES_TRAVEES.length === 6, "6 modules");
  pousser(sommeLongueurs() === 31.03, `longueur ${sommeLongueurs()}`);
  for (const module of MODULES_TRAVEES) {
    const sommePieces = round2(module.pieces.reduce((somme, piece) => somme + piece.surfaceM2, 0));
    pousser(sommePieces === module.surfaceM2, `${module.id} pièces ${sommePieces} ≠ ${module.surfaceM2}`);
  }
  pousser(sommeSurfacesModules() === 237.6, `somme modules ${sommeSurfacesModules()}`);
  pousser(round2(PROJET_LONGERE.surfaceHabitablePlanM2 - sommeSurfacesModules()) === 5.2, "écart plan");

  const somme = (lignes: LigneOffre[]) => round2(lignes.reduce((total, item) => total + item.totalHt, 0));
  pousser(somme(LIGNES_PHASE_1) === 8850, "phase 1 HT");
  pousser(somme(LIGNES_PHASE_1.filter((item) => item.nature === "travaux")) === 7350, "phase 1 travaux");
  pousser(somme(LIGNES_PHASE_1.filter((item) => item.nature === "marge_cg")) === 1500, "phase 1 marge");
  pousser(somme(LIGNES_PHASE_2) === 6000, "phase 2 HT");
  pousser(somme(LIGNES_PHASE_3) === 4200, "phase 3 HT");
  pousser(ventilation2.margeHt === 1017, `marge phase 2 ${ventilation2.margeHt}`);
  pousser(ventilation3.margeHt === 712, `marge phase 3 ${ventilation3.margeHt}`);

  const phase1 = genererOffre("phase1");
  const cumul = genererOffre("phase1et2");
  pousser(phase1.totalHt === 8850 && phase1.totalTtc === 9735, "TTC phase 1");
  pousser(phase1.totalTva === 885, "TVA phase 1");
  pousser(cumul.totalHt === 14850 && cumul.totalTtc === 16335, "TTC cumul");
  pousser(cumul.margeCgHt === 2517, "marge cumul");
  pousser(
    round2(phase1.echeancier.signature + phase1.echeancier.miChantier + phase1.echeancier.reception) === 9735,
    "échéancier phase 1",
  );
  pousser(
    round2(cumul.echeancier.signature + cumul.echeancier.miChantier + cumul.echeancier.reception) === 16335,
    "échéancier cumul",
  );
  pousser(phase1.statutMarge === "conforme" && cumul.statutMarge === "conforme", "statut marge");
  pousser(PHASE_4.postes[0].nom.toLowerCase().includes("sarking"), "sarking en tête de phase 4");
  pousser(PHASE_4.postes.findIndex((poste) => poste.nom.includes("PAC")) > PHASE_4.postes.findIndex((poste) => poste.nom.includes("VMC")), "PAC après VMC");
  pousser(round2(PHASE_4.postes.reduce((somme, poste) => somme + poste.ht, 0)) === TOTAL_PHASE_4_HT, "phase 4 HT");
  pousser(PHASE_4.totalTtc === TOTAL_PHASE_4_TTC && PHASE_4.totalTva === TOTAL_PHASE_4_TVA, "phase 4 TTC");
  pousser(PHASE_4.postes.some((poste) => poste.sanctuarisee && poste.ht === MARGE_CG_PHASE_4_HT), "marge CG phase 4");
  pousser(PHASE_4.resteAChargeTtc === RAC_PHASE_4_TTC && PHASE_4.aidesIndicatives === AIDES_PHASE_4_INDICATIVES, "aides / RAC phase 4");
  pousser(AIDES_PHASE_4_INDICATIVES === 55200 && AIDES_PHASE_4_MAX === 56000, "fourchette Anah Bleu 55 200–56 000");
  pousser(RAC_PHASE_4_MIN_TTC === 13600 && RAC_PHASE_4_TTC === 17595, "RAC 13 600–17 595");
  pousser(!SIMULATION_AIDES_PHASE_4.some((ligne) => /passoire|90 %/.test(`${ligne.poste} ${ligne.detail}`)), "pas de bonus sortie de passoire");
  pousser(/Bleu/.test(PHASE_4.profilAides), "profil aides Phase 4 = Bleu");
  pousser(TITRE_PROJECTION_FINANCIERE_2027.includes("Printemps 2027"), "titre projection 2027");
  pousser(AVERTISSEMENT_AIDES_2027.includes("profil Bleu") && AVERTISSEMENT_AIDES_2027.includes("Cabinet C2ET"), "avertissement 2027");
  pousser(INDEPENDANCE_PHASE_1.includes("indépendants"), "indépendance Phase 1");
  pousser(MENTION_NON_SIGNATURE_ANAH.includes("Ne pas signer avant notification d'accord Anah"), "mention non-signature Anah");
  pousser(SIMULATION_AIDES_PHASE_4.length === 3, "simulation aides Phase 4");
  pousser(Object.keys(CHARTE_PHASES).length === 4, "charte 4 phases");
  pousser(!CONTACTS_PROJET.some((contact) => /DAMIEN/i.test(contact.nom)), "pas de Damien sur dossier direct");

  return erreurs;
}
