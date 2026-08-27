import type { ChampFoyer, FoyerAides } from "../types/aides";
import { MANQUANT } from "./testMaisonClyve";

const MANQUANT_STATUT = "DONNÉE MANQUANTE" as const;

function champ(label: string, value: string | null, statut: ChampFoyer["statut"], note?: string): ChampFoyer {
  return {
    label,
    value: value ?? MANQUANT,
    statut: value ? statut : MANQUANT_STATUT,
    note,
  };
}

/** Foyer Clyve — uniquement ce qui est lisible dans le corpus. Rien n’est inventé. */
export const CLYVE_FOYER_CORPUS: FoyerAides = {
  rfr: null,
  rfrYear: null,
  householdSize: null,
  region: "Bourgogne-Franche-Comté",
  regionCode: "HORS_IDF",
  department: "71 — Saône-et-Loire",
  housingStatus: null,
  residenceType: null,
  occupantType: null,
  constructionYear: null,
  housingAgeLabel: null,
  dpeActuel: null,
  dpeVise: null,
  parcoursType: "non_determine",
  eligibleWorksLabel: null,
  rgeCompany: "SARL FAIVRE — mention « Agrémént RGE » sans n° de certificat lu",
  filingDate: null,
  champs: [
    champ("RFR du foyer", null, MANQUANT_STATUT, "Absent des devis, photos et plan."),
    champ("Année du RFR", null, MANQUANT_STATUT),
    champ("Nombre de personnes dans le foyer", null, MANQUANT_STATUT),
    champ("Région", "Bourgogne-Franche-Comté", "EXTRAIT", "Déduite du CP 71290 lu sur les devis."),
    champ("Département", "71 — Saône-et-Loire", "EXTRAIT", "Code postal 71290 lu sur les devis."),
    champ("Statut du logement", null, MANQUANT_STATUT),
    champ("Résidence principale ou secondaire", null, MANQUANT_STATUT),
    champ("Propriétaire occupant ou bailleur", null, MANQUANT_STATUT),
    champ("Ancienneté du logement", null, MANQUANT_STATUT, "Année de construction absente du corpus."),
    champ("DPE actuel", null, MANQUANT_STATUT, "Aucun DPE ni audit réglementaire joint."),
    champ("Gain DPE visé", null, MANQUANT_STATUT, "Les classes G ➔ E / C / A des scénarios sont des hypothèses visuelles, non un DPE."),
    champ("Type de parcours d’aide", "Non déterminable", "DONNÉE MANQUANTE"),
    champ("Travaux éligibles", "Non déterminables sans DPE / MAR / RGE complet", "DONNÉE MANQUANTE"),
    champ(
      "Entreprise RGE associée",
      "SARL FAIVRE — mention RGE sans n° de certificat",
      "À VÉRIFIER",
    ),
    champ("Date prévue de dépôt du dossier", null, MANQUANT_STATUT),
  ],
};

export const CLYVE_AID_ALERTS = [
  "RFR manquant.",
  "Composition du foyer manquante.",
  "DPE manquant.",
  "Année de construction manquante.",
  "Plafonds non calculables.",
  "Travaux non éligibles ou non documentés.",
  "Devis échus.",
  "Devis toiture contradictoires.",
  "Aucun devis chauffage.",
  "Aucun devis ventilation.",
  "Aucun devis menuiseries.",
  "Validation MAR obligatoire.",
];

/**
 * Jeu de test fictif — NE PAS fusionner avec le corpus Clyve.
 * Sert uniquement à vérifier que le moteur calcule une fois les données fiscales présentes.
 */
export const CLYVE_FOYER_FICTIF: FoyerAides = {
  rfr: 28000,
  rfrYear: 2024,
  householdSize: 2,
  region: "Bourgogne-Franche-Comté",
  regionCode: "HORS_IDF",
  department: "71 — Saône-et-Loire",
  housingStatus: "Maison individuelle",
  residenceType: "principale",
  occupantType: "proprietaire_occupant",
  constructionYear: 1950,
  housingAgeLabel: "Achevé depuis plus de 2 ans (hypothèse de test : 1950)",
  dpeActuel: "G",
  dpeVise: "C",
  parcoursType: "parcours",
  eligibleWorksLabel:
    "Parcours Accompagné (hypothèse de test) — isolation toiture (part isolation à isoler), PAC, VMC. Maçonnerie et PV exclus.",
  rgeCompany: "SARL FAIVRE — n° RGE à confirmer (hypothèse de test)",
  filingDate: "2026-09-15",
  champs: [
    champ("RFR du foyer", "28 000 €", "HYPOTHÈSE DE TEST", "Jeu fictif — n’appartient pas au corpus Clyve."),
    champ("Année du RFR", "2024", "HYPOTHÈSE DE TEST"),
    champ("Nombre de personnes dans le foyer", "2", "HYPOTHÈSE DE TEST"),
    champ("Région", "Bourgogne-Franche-Comté", "EXTRAIT"),
    champ("Département", "71 — Saône-et-Loire", "EXTRAIT"),
    champ("Statut du logement", "Maison individuelle", "HYPOTHÈSE DE TEST"),
    champ("Résidence principale ou secondaire", "Résidence principale", "HYPOTHÈSE DE TEST"),
    champ("Propriétaire occupant ou bailleur", "Propriétaire occupant", "HYPOTHÈSE DE TEST"),
    champ("Ancienneté du logement", "1950 (> 2 ans)", "HYPOTHÈSE DE TEST"),
    champ("DPE actuel", "G", "HYPOTHÈSE DE TEST"),
    champ("Gain DPE visé", "G ➔ C (4 classes)", "HYPOTHÈSE DE TEST"),
    champ("Type de parcours d’aide", "MaPrimeRénov’ Parcours Accompagné", "HYPOTHÈSE DE TEST"),
    champ("Travaux éligibles", "PAC + VMC estimés ; toiture mixte hors assiette MPR tant que la part isolation n’est pas isolée", "HYPOTHÈSE DE TEST"),
    champ("Entreprise RGE associée", "SARL FAIVRE — n° à confirmer", "HYPOTHÈSE DE TEST"),
    champ("Date prévue de dépôt du dossier", "15/09/2026", "HYPOTHÈSE DE TEST"),
  ],
};
