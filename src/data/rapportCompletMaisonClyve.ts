/** Rapport complet Maison Clyve — uniquement extraits du test local. Aucune donnée inventée. */

import {
  CONTROLES,
  DEVIS,
  DISCLAIMER,
  DOCUMENTS,
  DONNEES_LOGEMENT,
  MANQUANT,
  PIECES_PLAN,
  type Confiance,
  type Origine,
  type Statut,
} from "./testMaisonClyve";

export { CONTROLES, DEVIS, DISCLAIMER, DOCUMENTS, DONNEES_LOGEMENT, MANQUANT, PIECES_PLAN };
export type { Confiance, Origine, Statut };

export type StatutRapport =
  | Statut
  | "CONFIRMÉ"
  | "HYPOTHÈSE"
  | "VALIDÉ PAR HUMAIN"
  | "À COMPLÉTER"
  | "À VÉRIFIER AVANT ENGAGEMENT";

export type CategoriePhoto =
  | "Façade avant"
  | "Façade arrière"
  | "Pignon"
  | "Toiture"
  | "Sous-face de toiture"
  | "Murs et enduits"
  | "Combles"
  | "Menuiseries"
  | "Chauffage"
  | "Ventilation"
  | "Tableau électrique"
  | "Plan intérieur"
  | "Autre";

export const CATEGORIES_PHOTO: CategoriePhoto[] = [
  "Façade avant",
  "Façade arrière",
  "Pignon",
  "Toiture",
  "Sous-face de toiture",
  "Murs et enduits",
  "Combles",
  "Menuiseries",
  "Chauffage",
  "Ventilation",
  "Tableau électrique",
  "Plan intérieur",
  "Autre",
];

export const DATE_TEST = "16/08/2026";
export const TITRE_RAPPORT = "Pré-rapport de préparation — Maison Clyve";
export const STATUT_DOCUMENT = "BROUILLON — validation humaine obligatoire";

export const AVERTISSEMENTS = [
  "Ce document n’est pas un audit énergétique réglementaire (arrêté du 4 mai 2022 et textes associés).",
  "Ce document n’est pas un DPE.",
  "Ce document n’est pas un devis ENERGIA-CONSEIL IA®.",
  "Les montants d’aides, classes DPE, consommations et économies ne sont pas calculés : les données nécessaires sont absentes du corpus.",
  "Chaque information porte un statut (EXTRAIT, À VÉRIFIER, DONNÉE MANQUANTE, INCOHÉRENCE, HYPOTHÈSE). Une observation visuelle n’est pas une certitude technique.",
  "Les photos « après travaux » réelles ne sont pas générées. Les emplacements restent vides jusqu’à dépôt manuel.",
  "Des projections illustratives existent (badge sous l’image : PROJECTION ILLUSTRATIVE — APRÈS TRAVAUX — À VALIDER). Elles ne remplacent pas une photo réelle.",
  "Les deux devis toiture (Faivre et Madinier) ne sont pas cumulables.",
];

export type PhotoAvant = {
  id: string;
  nom: string;
  categorie: CategoriePhoto;
  date: string;
  source: string;
  description: string;
  confiance: Confiance | "—";
  observations: string[];
  statut: StatutRapport;
  imageSrc?: string;
};

export const PHOTOS_AVANT: PhotoAvant[] = [
  {
    id: "facade-avant",
    nom: "FACADE_AVANT.png",
    categorie: "Façade avant",
    date: MANQUANT,
    source: "Photo jointe au test local Maison Clyve",
    description:
      "Bâtiment allongé de type longère, un niveau apparent, toiture tuiles canal, ouvertures hétérogènes.",
    confiance: "moyen",
    observations: [
      "Enduit clair en décollement, maçonnerie / brique apparente par endroits",
      "Faîtage affaissé, tuiles déplacées, mousse",
      "Plusieurs souches de cheminée",
      "Porte de grange, fenêtres, volets bois rouges",
      "Puits en pierre au premier plan",
    ],
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/facade-avant.png",
  },
  {
    id: "facade-arriere",
    nom: "FACADE_ARRIERE.png",
    categorie: "Façade arrière",
    date: MANQUANT,
    source: "Photo jointe au test local Maison Clyve (filigrane NEYRAT IMMOBILIER)",
    description:
      "Longère traditionnelle, toiture tuiles terre cuite, auvent / galerie sur poteaux bois.",
    confiance: "moyen",
    observations: [
      "Faîtage irrégulier",
      "Enduit beige dégradé, traces d’humidité en soubassement",
      "Souche de cheminée visible ; antenne sur toiture",
      "Menuiseries anciennes apparentes ; une porte claire à droite",
    ],
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/facade-arriere.png",
  },
  {
    id: "pignon",
    nom: "PHOTO-2026-07-28-21-36-39.png",
    categorie: "Pignon",
    date: "28/07/2026 (horodatage du nom de fichier)",
    source: "Photo jointe au test local Maison Clyve",
    description: "Pignon / rive de toiture, végétation grimpante sur le pan droit.",
    confiance: "moyen",
    observations: [
      "Rive de toiture endommagée, tuiles manquantes",
      "Enduit taché / réparé (zone rectangulaire d’aspect différent)",
      "Végétation grimpante sur le pan droit",
    ],
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/pignon.png",
  },
  {
    id: "pignon-nord",
    nom: "PIGNON NORD .JPG",
    categorie: "Pignon",
    date: MANQUANT,
    source: "Photo réelle jointe (clients/ANDRIOT_Clyve/images) — original non retouché",
    description: "Même pignon nord : rive dégradée, enduit taché, végétation, haie au premier plan.",
    confiance: "moyen",
    observations: [
      "Fichier original distinct conservé (basse définition)",
      "Correspond visuellement à PHOTO-2026-07-28-21-36-39.png",
    ],
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/pignon-nord.jpg",
  },
  {
    id: "pignon-sud",
    nom: "PIGNON SUD.JPG",
    categorie: "Pignon",
    date: MANQUANT,
    source: "Photo réelle jointe (clients/ANDRIOT_Clyve/images) — original non retouché",
    description: "Contre-plongée rive / faîtage : tuiles irrégulières, enduit taché, câble apparent.",
    confiance: "moyen",
    observations: ["Faîtage irrégulier", "Sous-face d’égout vieillie", "Câble blanc en rive"],
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/pignon-sud.jpg",
  },
  {
    id: "toiture-exterieur",
    nom: "TOITURE EXTERIEUR.jpg",
    categorie: "Toiture",
    date: MANQUANT,
    source: "Photo réelle jointe (vue aérienne basse définition) — original non retouché",
    description: "Emprise de longère vue du ciel, toiture tuiles, souches visibles.",
    confiance: "faible",
    observations: [
      "Résolution très limitée",
      "Emprise allongée cohérente avec les façades",
      "Ne permet pas un diagnostic tuile par tuile",
    ],
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/toiture-exterieur.jpg",
  },
  {
    id: "toiture-combles",
    nom: "PHOTO-2026-07-28-21-10-34.png",
    categorie: "Combles",
    date: "28/07/2026 (horodatage du nom de fichier)",
    source: "Photo jointe au test local Maison Clyve",
    description: "Combles / étage en travaux : charpente et liteaux exposés, jour traversant.",
    confiance: "élevé",
    observations: [
      "Charpente et liteaux exposés",
      "Jour traversant",
      "Murs bruts, une baie sans menuiserie visible",
      "Panneaux de plancher partiellement posés ; trémies ouvertes",
    ],
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/combles.png",
  },
  {
    id: "sous-face",
    nom: "PHOTO-2026-07-28-22-05-52.png",
    categorie: "Sous-face de toiture",
    date: "28/07/2026 (horodatage du nom de fichier)",
    source: "Photo jointe au test local Maison Clyve",
    description:
      "Sous-face de toiture : liteaux exposés, jour visible, pas d’isolant visible sur ce cliché.",
    confiance: "élevé",
    observations: [
      "Charpente et liteaux exposés, pas d’isolant visible sur la zone photographiée",
      "Jour visible à travers la couverture (tuiles manquantes ou disjointes)",
      "L’absence d’isolant sur ce cliché ne prouve pas l’absence d’isolant sur toute la toiture",
    ],
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/interieur-toiture.png",
  },
  {
    id: "murs-interieurs",
    nom: "PHOTO-2026-07-28-22-05-52.png",
    categorie: "Murs et enduits",
    date: "28/07/2026 (horodatage du nom de fichier)",
    source: "Même cliché que la sous-face — PHOTO-2026-07-28-22-05-52.png",
    description:
      "Mur intérieur en matériau traditionnel rugueux, fissure verticale, niche en arc.",
    confiance: "élevé",
    observations: [
      "Mur en matériau traditionnel rugueux",
      "Fissure verticale visible",
      "Niche en arc dans le mur",
      "Matériau porteur exact (pierre, terre, mixte) : non nommé sur un document joint",
    ],
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/interieur-toiture.png",
  },
  {
    id: "menuiseries",
    nom: "PHOTO-2026-07-28-22-18-11.png",
    categorie: "Menuiseries",
    date: "28/07/2026 (horodatage du nom de fichier)",
    source: "Photo jointe au test local Maison Clyve",
    description:
      "Fenêtre à cadre blanc et volets bois ; portes de grange anciennes en arrière-plan.",
    confiance: "moyen",
    observations: [
      "Fenêtre à cadre blanc + volets bois rouge-brun ouverts",
      "Portes de grange bois anciennes en arrière-plan",
      "Uw, type de vitrage, dimensions et nombre d’ouvrants : non lus sur un document joint",
    ],
    statut: "À VÉRIFIER",
    imageSrc: "/test-maison-clyve/facade-pierre.png",
  },
  {
    id: "plan",
    nom: "PHOTO-2026-07-28-21-03-21.png",
    categorie: "Plan intérieur",
    date: "28/07/2026 (horodatage du nom de fichier)",
    source: "Plan d’aménagement meublé joint au test local",
    description:
      "Plan coté intitulé visuellement MAISON CLYVE. Somme des pièces chiffrées : 153,00 m².",
    confiance: "élevé",
    observations: [
      "14 pièces portant une surface — somme 153,00 m²",
      "Terrasse 1 : 28,97 m² ; Terrasse 2 : 52,02 m² ; Allée privée 1 : 105,51 m²",
      "Couloir et salles d’eau communes : surfaces non indiquées",
      "Aucun total « surface habitable » écrit sur le plan",
      "QR code présent — contenu non lu",
    ],
    statut: "À VÉRIFIER",
    imageSrc: "/test-maison-clyve/plan-maison-clyve.png",
  },
  {
    id: "autre-terrasse",
    nom: "PHOTO-2026-07-28-21-27-52.png",
    categorie: "Autre",
    date: "28/07/2026 (horodatage du nom de fichier)",
    source: "Photo jointe au test local Maison Clyve",
    description:
      "Façade occupée / travaux en cours : dalle béton, poutres bois neuves, enduit largement manquant.",
    confiance: "moyen",
    observations: [
      "Enduit largement manquant, terre / maçonnerie apparente",
      "Dalle béton récente devant la façade",
      "Poutres bois neuves empilées",
      "Menuiseries mixtes : châssis blanc récent + volets bois rouges",
      "Mobilier de terrasse présent — ne permet pas de conclure au statut d’occupation",
    ],
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/facade-terrasse.png",
  },
  {
    id: "chauffage-absent",
    nom: "—",
    categorie: "Chauffage",
    date: MANQUANT,
    source: "Aucun cliché dédié dans le corpus",
    description: "Générateur de chauffage non photographié. Souches de cheminée visibles sur d’autres vues.",
    confiance: "—",
    observations: [
      "Souche(s) de cheminée visibles en toiture sur FACADE_AVANT.png et FACADE_ARRIERE.png",
      "Émetteur / générateur (foyer, insert, chaudière, PAC, etc.) : non identifié",
    ],
    statut: "DONNÉE MANQUANTE",
  },
  {
    id: "ventilation-absente",
    nom: "—",
    categorie: "Ventilation",
    date: MANQUANT,
    source: "Aucun cliché dédié dans le corpus",
    description: "Aucune grille VMC clairement identifiable sur les photos jointes.",
    confiance: "—",
    observations: [
      "L’absence de vue ne prouve pas l’absence d’équipement",
    ],
    statut: "DONNÉE MANQUANTE",
  },
  {
    id: "tableau-absent",
    nom: "—",
    categorie: "Tableau électrique",
    date: MANQUANT,
    source: "Aucun cliché dédié dans le corpus",
    description: "Tableau électrique non fourni dans le test local.",
    confiance: "—",
    observations: ["Photo du tableau à réaliser lors de la visite."],
    statut: "DONNÉE MANQUANTE",
  },
];

export type Pathologie = {
  id: string;
  titre: string;
  observation: string;
  source: string;
  statut: StatutRapport;
  confiance: Confiance;
  nePasConclure: string;
};

export const PATHOLOGIES: Pathologie[] = [
  {
    id: "tuiles",
    titre: "Tuiles manquantes ou déplacées",
    observation:
      "Tuiles manquantes en rive, tuiles déplacées et mousse visibles sur les vues extérieures ; jour traversant depuis l’intérieur.",
    source: "FACADE_AVANT.png, PHOTO-2026-07-28-21-36-39.png, PHOTO-2026-07-28-22-05-52.png, PHOTO-2026-07-28-21-10-34.png",
    statut: "EXTRAIT",
    confiance: "élevé",
    nePasConclure: "Ne pas conclure à l’étendue exacte des désordres sans visite et métrée.",
  },
  {
    id: "faitage",
    titre: "Faîtage irrégulier",
    observation: "Faîtage affaissé / irrégulier visible sur les façades.",
    source: "FACADE_AVANT.png, FACADE_ARRIERE.png",
    statut: "EXTRAIT",
    confiance: "moyen",
    nePasConclure: "Ne pas conclure à un défaut structurel de charpente sans inspection.",
  },
  {
    id: "jour",
    titre: "Jour visible depuis l’intérieur",
    observation: "Jour visible à travers la couverture (tuiles manquantes ou disjointes).",
    source: "PHOTO-2026-07-28-22-05-52.png, PHOTO-2026-07-28-21-10-34.png",
    statut: "EXTRAIT",
    confiance: "élevé",
    nePasConclure:
      "Le jour visible justifie une hypothèse d’infiltration (HYPOTHÈSE), pas une preuve de dégât des eaux généralisé.",
  },
  {
    id: "isolant",
    titre: "Absence d’isolant visible en sous-face",
    observation: "Charpente et liteaux exposés, pas d’isolant visible sur la zone photographiée.",
    source: "PHOTO-2026-07-28-22-05-52.png, PHOTO-2026-07-28-21-10-34.png",
    statut: "EXTRAIT",
    confiance: "élevé",
    nePasConclure: "L’absence sur un cliché ne prouve pas l’absence d’isolant sur toute la toiture.",
  },
  {
    id: "enduit",
    titre: "Enduit dégradé ou manquant",
    observation: "Enduit en décollement, largement manquant par endroits, terre / maçonnerie apparente.",
    source: "FACADE_AVANT.png, PHOTO-2026-07-28-21-27-52.png, PHOTO-2026-07-28-22-18-11.png",
    statut: "EXTRAIT",
    confiance: "moyen",
    nePasConclure: "Ne pas conclure au matériau porteur exact (pisé non retenu faute de document le nommant).",
  },
  {
    id: "humidite",
    titre: "Traces d’humidité",
    observation: "Traces d’humidité en soubassement ; enduit taché / réparé sur un pignon.",
    source: "FACADE_ARRIERE.png, PHOTO-2026-07-28-21-36-39.png",
    statut: "À VÉRIFIER",
    confiance: "moyen",
    nePasConclure:
      "Origine (remontées capillaires, évacuations, zinguerie, projections) non identifiée. Hypothèse, pas diagnostic.",
  },
  {
    id: "fissure",
    titre: "Fissure visible",
    observation: "Fissure verticale visible sur un mur intérieur.",
    source: "PHOTO-2026-07-28-22-05-52.png",
    statut: "EXTRAIT",
    confiance: "élevé",
    nePasConclure: "Ne pas conclure à un désordre structurel sans avis professionnel.",
  },
  {
    id: "vegetation",
    titre: "Végétation sur un pignon",
    observation: "Végétation grimpante sur le pan droit d’un pignon.",
    source: "PHOTO-2026-07-28-21-36-39.png",
    statut: "EXTRAIT",
    confiance: "moyen",
    nePasConclure: "Impact sur l’enduit et l’humidité : à vérifier sur site.",
  },
];

export type Recommandation = {
  priorite: 1 | 2 | 3 | 4 | 5;
  titre: string;
  recommandation: string;
  motif: string[];
  source: string;
  risque: string;
  actionSuivante: string[];
  responsable: string;
  statut: StatutRapport;
};

export const RECOMMANDATIONS: Recommandation[] = [
  {
    priorite: 1,
    titre: "Sécuriser et étancher la toiture",
    recommandation:
      "Organiser une visite technique de toiture avant tout engagement. Ne pas additionner les deux devis toiture.",
    motif: [
      "Tuiles manquantes ou déplacées",
      "Faîtage irrégulier",
      "Jour visible depuis l’intérieur",
      "Surface de toiture incohérente entre les devis (360 / 450 / 505 m²)",
    ],
    source: "Photos toiture + devis Faivre et Madinier",
    risque: "Risque d’infiltration et de dégradation de la structure (hypothèse à confirmer sur site).",
    actionSuivante: [
      "Organiser une visite technique",
      "Relever précisément les surfaces",
      "Vérifier charpente, liteaux et écran sous-toiture",
      "Demander un devis corrigé et comparable",
      "Ne pas additionner automatiquement les deux devis toiture",
    ],
    responsable: "Sylvain LEMBELEMBE (AMO) — visite / coordination",
    statut: "À VÉRIFIER AVANT ENGAGEMENT",
  },
  {
    priorite: 2,
    titre: "Diagnostiquer l’humidité et les murs",
    recommandation:
      "Identifier l’origine de l’humidité et le matériau porteur avant de prescrire un traitement ou une isolation.",
    motif: [
      "Enduit dégradé ou manquant",
      "Traces d’humidité",
      "Maçonnerie apparente",
      "Fissure visible",
      "Végétation sur un pignon",
    ],
    source: "Photos façades, pignon et intérieur",
    risque: "Traitement inadapté si l’origine de l’humidité n’est pas établie.",
    actionSuivante: [
      "Identifier l’origine de l’humidité",
      "Vérifier les remontées capillaires",
      "Vérifier les évacuations d’eau et la zinguerie",
      "Définir le matériau porteur exact",
      "Faire valider la solution de traitement par un professionnel",
    ],
    responsable: "Sylvain LEMBELEMBE (AMO) + professionnel mur / humidité à désigner",
    statut: "À VÉRIFIER",
  },
  {
    priorite: 3,
    titre: "Confirmer la surface habitable",
    recommandation:
      "Ne pas utiliser 153 m² comme SHAB définitive sans validation. Faire confirmer la surface habitable totale.",
    motif: [
      "Le plan permet de sommer 153 m² de pièces cotées",
      "La surface habitable totale n’est pas explicitement indiquée",
      "Le couloir et les salles d’eau communes ne sont pas cotés",
    ],
    source: "Plan PHOTO-2026-07-28-21-03-21.png",
    risque: "Erreur de métrée, de chiffrage et d’éligibilité si une SHAB non écrite est utilisée.",
    actionSuivante: [
      "Faire confirmer la SHAB",
      "Relever les surfaces manquantes",
      "Ne pas utiliser 153 m² comme SHAB définitive sans validation",
    ],
    responsable: "Sylvain LEMBELEMBE (AMO) — relevé / confirmation client",
    statut: "DONNÉE MANQUANTE",
  },
  {
    priorite: 4,
    titre: "Identifier le chauffage et la ventilation",
    recommandation:
      "Photographier le générateur, les émetteurs, le tableau électrique et vérifier l’existence d’une VMC.",
    motif: [
      "Le générateur de chauffage n’est pas identifié",
      "La ventilation n’est pas documentée",
      "Aucune grille VMC clairement visible",
    ],
    source: "Corpus photos — catégories Chauffage, Ventilation, Tableau électrique vides",
    risque: "Impossible de dimensionner un scénario énergétique ou de vérifier l’ordre des travaux.",
    actionSuivante: [
      "Photographier le générateur",
      "Photographier le tableau électrique",
      "Identifier les émetteurs",
      "Vérifier l’existence d’une VMC",
      "Relever les équipements d’eau chaude",
    ],
    responsable: "Sylvain LEMBELEMBE (AMO) — visite photo",
    statut: "DONNÉE MANQUANTE",
  },
  {
    priorite: 5,
    titre: "Vérifier les menuiseries",
    recommandation:
      "Relever chaque fenêtre et porte (vitrage, menuiserie, état, dimensions). Préparer un tableau menuiserie par menuiserie.",
    motif: [
      "Les ouvertures sont hétérogènes",
      "Les performances Uw et le type de vitrage ne sont pas documentés",
      "Les dimensions et le nombre d’ouvrants restent à confirmer",
    ],
    source: "Photos façades et PHOTO-2026-07-28-22-18-11.png",
    risque: "Devis menuiseries non comparable ; ponts thermiques non localisés.",
    actionSuivante: [
      "Relever chaque fenêtre et porte",
      "Identifier vitrage, menuiserie et état",
      "Préparer un tableau menuiserie par menuiserie",
    ],
    responsable: "Sylvain LEMBELEMBE (AMO) — relevé",
    statut: "À VÉRIFIER",
  },
];

export type DevisFiche = {
  fichier: string;
  entreprise: string;
  date: string;
  numero: string;
  nature: string;
  ht: string;
  tva: string;
  ttc: string;
  surfaceAnnoncee: string;
  validite: string;
  statut: StatutRapport;
  observations: string[];
};

export const DEVIS_FICHES: DevisFiche[] = [
  {
    fichier: "devis toiture valid 150922.pdf",
    entreprise: "SARL FAIVRE (affaire suivie par FAIVRE Geoffrey)",
    date: "15/03/2022",
    numero: "508-v1",
    nature: "Réfection de toiture",
    ht: "48 879,20 €",
    tva: "4 887,92 € (10 %)",
    ttc: "53 767,12 €",
    surfaceAnnoncee: "Couverture neuve 360 m² — Découverture 505 m²",
    validite:
      "Page totaux : « Validité : 6 mois ». CGV p.3 : signature dans un délai maximum de 3 mois. Échue à la date du test (16/08/2026).",
    statut: "PRÊT POUR VALIDATION HUMAINE",
    observations: [
      "Nom de fichier « 150922 » ≠ date interne 15/03/2022 (INCOHÉRENCE).",
      "Contradiction interne 6 mois vs 3 mois.",
      "Numéro RGE : mention « Agrémént RGE » sans numéro de certificat lu.",
      "Non cumulable avec le devis Madinier.",
    ],
  },
  {
    fichier: "devis toiture madinier.pdf",
    entreprise: "Madinier entreprise — 1495 route des 4 Vents (commune non indiquée)",
    date: "25/10/2021",
    numero: "EST0001",
    nature: "Rénovation d’une toiture",
    ht: MANQUANT,
    tva: MANQUANT,
    ttc: MANQUANT,
    surfaceAnnoncee: "450 m²",
    validite: MANQUANT,
    statut: "À VÉRIFIER",
    observations: [
      "Total unique 57 850,00 € — HT / TTC non distingués.",
      "Réserve boiseries 5 000,00 € incluse dans le total.",
      "Champ « n° TVA 405 035 734 000 20 » : format proche d’un SIRET, à vérifier.",
      "Non cumulable avec le devis Faivre.",
    ],
  },
  {
    fichier: "devis macon.pdf",
    entreprise: "MTL MACONNERIE — Le Nuzeret, 71440 SAINT-VINCENT-EN-BRESSE",
    date: "14/04/2022",
    numero: "I-22-04-4",
    nature: "Dalles + ouvertures (grange et partie habitation)",
    ht: "25 239,00 €",
    tva: "2 523,90 € (10 %)",
    ttc: "27 762,90 €",
    surfaceAnnoncee: "5 dalles : 66 + 40 + 33 + 36 + 36 m² = 211 m² (somme des lignes, pas une SHAB)",
    validite: "2 mois — échue à la date du test (16/08/2026).",
    statut: "PRÊT POUR VALIDATION HUMAINE",
    observations: [
      "Lien possible avec la dalle photographiée (PHOTO-2026-07-28-21-27-52.png), non démontré pièce par pièce.",
      "Aucune cote de dalle n’est écrite sur le plan joint.",
    ],
  },
];

export const INCOHERENCES_TOITURE = [
  "Faivre : 360 m² de couverture neuve et 505 m² de découverture.",
  "Madinier : 450 m² de toiture.",
  "Trois surfaces différentes pour le lot toiture.",
  "Devis Madinier : HT/TTC non distingués.",
  "Devis anciens à actualiser (2021 et 2022, validités échues au 16/08/2026).",
  "Les deux devis toiture sont non cumulables.",
];

export const ENCADRE_TOITURE =
  "Ne pas additionner les devis toiture. Une métrée contradictoire doit être réalisée avant comparaison.";

export type ActionSuivi = {
  id: string;
  action: string;
  priorite: 1 | 2 | 3 | 4 | 5;
  responsable: string;
  datePrevue: string;
  dateRealisee: string;
  documentAttendu: string;
  photoAvantRequise: string;
  photoApresRequise: string;
  statutInitial: "À faire" | "En cours" | "Bloqué" | "À valider" | "Validé" | "Terminé";
};

export const ACTIONS_SUIVI: ActionSuivi[] = [
  {
    id: "a1",
    action: "Organiser une visite technique de toiture",
    priorite: 1,
    responsable: "Sylvain LEMBELEMBE (AMO)",
    datePrevue: MANQUANT,
    dateRealisee: "—",
    documentAttendu: "Compte rendu de visite + photos charpente / liteaux / écran",
    photoAvantRequise: "Oui — toiture, sous-face, rives",
    photoApresRequise: "Oui — après intervention, à déposer manuellement",
    statutInitial: "À faire",
  },
  {
    id: "a2",
    action: "Relever précisément les surfaces de toiture",
    priorite: 1,
    responsable: "Sylvain LEMBELEMBE (AMO)",
    datePrevue: MANQUANT,
    dateRealisee: "—",
    documentAttendu: "Métrée unique (m² couverture / découverture)",
    photoAvantRequise: "Oui",
    photoApresRequise: "Non (relevé)",
    statutInitial: "À faire",
  },
  {
    id: "a3",
    action: "Demander un devis toiture corrigé et comparable — ne pas additionner Faivre et Madinier",
    priorite: 1,
    responsable: "Sylvain LEMBELEMBE (AMO) / DAMIEN (commercial)",
    datePrevue: MANQUANT,
    dateRealisee: "—",
    documentAttendu: "Devis actualisé 2026, surfaces unifiées",
    photoAvantRequise: "Oui",
    photoApresRequise: "Oui — après travaux toiture",
    statutInitial: "Bloqué",
  },
  {
    id: "a4",
    action: "Diagnostiquer l’origine de l’humidité et le matériau porteur",
    priorite: 2,
    responsable: "Professionnel à désigner — coordination Sylvain LEMBELEMBE",
    datePrevue: MANQUANT,
    dateRealisee: "—",
    documentAttendu: "Avis professionnel (humidité / mur)",
    photoAvantRequise: "Oui — façades, pignon, soubassement, fissure",
    photoApresRequise: "Oui — après traitement, si réalisé",
    statutInitial: "À faire",
  },
  {
    id: "a5",
    action: "Faire confirmer la SHAB et coter le couloir et les salles d’eau communes",
    priorite: 3,
    responsable: "Sylvain LEMBELEMBE (AMO) + client",
    datePrevue: MANQUANT,
    dateRealisee: "—",
    documentAttendu: "Plan coté complet ou attestation SHAB",
    photoAvantRequise: "Plan existant déjà joint",
    photoApresRequise: "Non",
    statutInitial: "À faire",
  },
  {
    id: "a6",
    action: "Photographier générateur, émetteurs, ECS et tableau électrique",
    priorite: 4,
    responsable: "Sylvain LEMBELEMBE (AMO)",
    datePrevue: MANQUANT,
    dateRealisee: "—",
    documentAttendu: "Photos catégories Chauffage / Tableau électrique",
    photoAvantRequise: "Oui — absentes du corpus actuel",
    photoApresRequise: "Oui — si remplacement ultérieur",
    statutInitial: "À faire",
  },
  {
    id: "a7",
    action: "Vérifier l’existence d’une VMC",
    priorite: 4,
    responsable: "Sylvain LEMBELEMBE (AMO)",
    datePrevue: MANQUANT,
    dateRealisee: "—",
    documentAttendu: "Photo grilles / caisson ou constat d’absence",
    photoAvantRequise: "Oui — absente du corpus actuel",
    photoApresRequise: "Oui — si pose ultérieure",
    statutInitial: "À faire",
  },
  {
    id: "a8",
    action: "Relevé menuiserie par menuiserie (Uw, vitrage, dimensions, état)",
    priorite: 5,
    responsable: "Sylvain LEMBELEMBE (AMO)",
    datePrevue: MANQUANT,
    dateRealisee: "—",
    documentAttendu: "Tableau menuiseries",
    photoAvantRequise: "Oui — déjà partiel",
    photoApresRequise: "Oui — si remplacement",
    statutInitial: "À faire",
  },
];

export const PHASES = [
  {
    id: "phase-0",
    titre: "Phase 0 — Sécuriser le clos et le couvert",
    statut: "À VÉRIFIER AVANT ENGAGEMENT" as StatutRapport,
    contenu:
      "Toiture prioritaire. Visite, métrée, devis comparable. Aucun démarrage énergétique tant que l’étanchéité n’est pas expertisée.",
  },
  {
    id: "phase-1",
    titre: "Phase 1 — Diagnostiquer murs et humidité",
    statut: "À VÉRIFIER" as StatutRapport,
    contenu:
      "Origine de l’humidité, matériau porteur, fissure. Pas d’isolation de murs prescrite avant ce diagnostic.",
  },
  {
    id: "phase-2",
    titre: "Phase 2 — Compléter le dossier (SHAB, systèmes, menuiseries)",
    statut: "DONNÉE MANQUANTE" as StatutRapport,
    contenu:
      "Confirmer la SHAB. Photographier chauffage, ECS, VMC, tableau. Relevé menuiseries. Sans ces pièces, aucun scénario énergétique n’est constructible.",
  },
  {
    id: "phase-3",
    titre: "Phase 3 — Préparer le rapport final (hors présent document)",
    statut: "DONNÉE MANQUANTE" as StatutRapport,
    contenu:
      "Le rapport final (audit réglementaire, DPE, devis ENERGIA) ne peut être établi qu’après validation humaine, métrées et documents manquants. Le présent fichier reste un pré-rapport interne.",
  },
];

export const DONNEES_MANQUANTES = [
  "Surface habitable totale (SHAB) — 153 m² = somme de pièces cotées, pas une SHAB écrite",
  "Surfaces du couloir et des salles d’eau communes",
  "Année de construction",
  "DPE / audit réglementaire",
  "Générateur de chauffage et émetteurs",
  "Ventilation (VMC ou autre)",
  "Tableau électrique",
  "Eau chaude sanitaire",
  "Nombre, dimensions et Uw des menuiseries",
  "Matériau porteur exact des murs",
  "Surface de toiture unique et contradictoire entre devis",
  "RFR / occupants / statut d’occupation",
  "Devis menuiseries, isolation murs, VMC, chauffage",
];

export const POINTS_A_CONFIRMER = [
  "Orthographe de la commune : LA GENETE / LA GENÊTE",
  "Correspondance dalle photographiée ↔ devis MTL",
  "Validité et actualisation 2026 des trois devis",
  "Numéro RGE Faivre et SIRET / TVA Madinier",
  "Comparabilité Faivre (tuile oméga 10, 360 m²) vs Madinier (tuile plate Delta 10, 450 m²)",
];

export const PREPARATION_RAPPORT_FINAL = [
  "Collecter les photos manquantes (chauffage, ventilation, tableau électrique, après travaux).",
  "Faire réaliser une métrée de toiture unique.",
  "Faire confirmer la SHAB.",
  "Obtenir un avis humidité / murs.",
  "Actualiser les devis (validités 2021-2022 échues).",
  "Ne pas produire de classes DPE, d’aides ou d’économies tant que ces pièces manquent.",
  "Validation humaine obligatoire avant tout document client final.",
];

export const DRAFT_STORAGE_KEY = "energia-test-maison-clyve-rapport-v1";

export type AfterPhoto = {
  dataUrl: string;
  datePrise: string;
  entreprise: string;
  description: string;
  travauxRealises: string;
  commentaire: string;
};

export type ComparisonState = {
  descriptionChangement: string;
  travauxConcernes: string;
  dateApres: string;
  comment: string;
  validated: boolean;
  validatedAt: string;
  validatedBy: string;
};

export type ValidationDecision =
  | "BROUILLON"
  | "CORRECTION DEMANDÉE"
  | "PRÉ-RAPPORT VALIDÉ"
  | "DOSSIER BLOQUÉ";

export type ValidationState = {
  nom: string;
  date: string;
  commentaire: string;
  reserves: string;
  decision: ValidationDecision;
};

export type ActionStatut =
  | "À faire"
  | "En cours"
  | "Bloqué"
  | "À valider"
  | "Validé"
  | "Terminé";

export type RapportDraft = {
  afterPhotos: Partial<Record<CategoriePhoto, AfterPhoto>>;
  comparisons: Record<string, ComparisonState>;
  validation: ValidationState;
  actionStatuts: Record<string, ActionStatut>;
};
