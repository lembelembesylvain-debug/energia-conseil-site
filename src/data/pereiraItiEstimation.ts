/**
 * Lignes d’estimation enveloppe — dossier Pereira uniquement.
 * ITI 270 m² ; combles 60 m² déroulés ; plancher bas 19 m².
 * Hors frais administratifs et coordination.
 */

import { SOUS_CATEGORIES_METIERS } from "../lib/crm/catalogue/categories";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export const PEREIRA_ITI_LIGNE_ID = "pereira-iti-12cm-270";
export const PEREIRA_ITI_SURFACE_M2 = 270;
export const PEREIRA_ITI_EPAISSEUR_CM = 12;
export const PEREIRA_ITI_RESISTANCE = "R ≥ 3,70 m².K/W";
export const PEREIRA_ITI_TTC_AUDIT = 36204;
export const PEREIRA_ITI_TAUX_TVA = 0.055;
export const PEREIRA_ITI_MENTION =
  "Estimation à confirmer par métrage et devis artisan RGE";

export const PEREIRA_ITI_HT = round2(PEREIRA_ITI_TTC_AUDIT / (1 + PEREIRA_ITI_TAUX_TVA));
export const PEREIRA_ITI_PRIX_VENTE_UNITAIRE_HT = PEREIRA_ITI_HT / PEREIRA_ITI_SURFACE_M2;

const SOUS_ITI = SOUS_CATEGORIES_METIERS.find(
  (item) => item.categorieId === "isolation" && item.nom === "Isolation des murs par l’intérieur",
);

export const PEREIRA_ITI_NOM = "Isolation des murs par l’intérieur — ITI 12 cm";

export const PEREIRA_ITI_DESCRIPTION = [
  `Épaisseur ${PEREIRA_ITI_EPAISSEUR_CM} cm, ${PEREIRA_ITI_RESISTANCE}.`,
  `Surface estimée ${PEREIRA_ITI_SURFACE_M2.toLocaleString("fr-FR")} m² (audit).`,
  `Prix de vente : environ ${PEREIRA_ITI_TTC_AUDIT.toLocaleString("fr-FR")} € TTC (estimation audit, non contractuel).`,
  "Fournitures et pose : à renseigner (détail non communiqué dans l’audit).",
  PEREIRA_ITI_MENTION + ".",
].join(" ");

export const PEREIRA_COMBLES_SURFACE_M2 = 60;
export const PEREIRA_COMBLES_RESISTANCE = "R ≥ 7";
/** Ancien forfait 2 500 € TTC pour 120 m², recalculé au prorata de 60 m² déroulés. */
export const PEREIRA_COMBLES_TTC = 1250;
export const PEREIRA_COMBLES_HT = round2(PEREIRA_COMBLES_TTC / (1 + PEREIRA_ITI_TAUX_TVA));
export const PEREIRA_COMBLES_PRIX_VENTE_UNITAIRE_HT = PEREIRA_COMBLES_HT / PEREIRA_COMBLES_SURFACE_M2;

export const PEREIRA_PLANCHER_SURFACE_M2 = 19;
export const PEREIRA_PLANCHER_RESISTANCE = "R ≥ 3";
/** Ancien forfait 10 445 € TTC pour 60 m², recalculé au prorata de 19 m². */
export const PEREIRA_PLANCHER_TTC = round2((10445 * PEREIRA_PLANCHER_SURFACE_M2) / 60);
export const PEREIRA_PLANCHER_HT = round2(PEREIRA_PLANCHER_TTC / (1 + PEREIRA_ITI_TAUX_TVA));
export const PEREIRA_PLANCHER_PRIX_VENTE_UNITAIRE_HT = PEREIRA_PLANCHER_HT / PEREIRA_PLANCHER_SURFACE_M2;

const SOUS_COMBLES = SOUS_CATEGORIES_METIERS.find(
  (item) => item.categorieId === "isolation" && item.nom === "Isolation des combles perdus",
);
const SOUS_PLANCHER = SOUS_CATEGORIES_METIERS.find(
  (item) => item.categorieId === "isolation" && item.nom === "Isolation du plancher bas",
);

/** Objet prêt pour le calculateur — poste enveloppe `iti`, jamais coordination ni frais admin. */
export const PEREIRA_LIGNE_ITI_ESTIMATION = {
  id: PEREIRA_ITI_LIGNE_ID,
  posteId: "iti",
  nom: PEREIRA_ITI_NOM,
  categorie: "enveloppe",
  unite: "m2",
  description: PEREIRA_ITI_DESCRIPTION,
  quantite: PEREIRA_ITI_SURFACE_M2,
  coutMaterielUnitaireHt: 0,
  coutMainOeuvreUnitaireHt: 0,
  prixVenteUnitaireHt: PEREIRA_ITI_PRIX_VENTE_UNITAIRE_HT,
  tauxTva: PEREIRA_ITI_TAUX_TVA,
  statut: "estimation" as const,
  artisan: "",
  montantDevisReel: 0,
  cataloguePrestationId: "compat-iti",
  categorieMetierId: "isolation",
  sousCategorieId: SOUS_ITI?.id,
};

export const PEREIRA_LIGNE_COMBLES_ESTIMATION = {
  id: "pereira-combles-60",
  posteId: "isolation_combles",
  nom: "Isolation des combles, R ≥ 7",
  categorie: "enveloppe",
  unite: "m2",
  description: `Isolation des combles perdus, ${PEREIRA_COMBLES_SURFACE_M2} m² de surface déroulée, ${PEREIRA_COMBLES_RESISTANCE}. ${PEREIRA_ITI_MENTION}.`,
  quantite: PEREIRA_COMBLES_SURFACE_M2,
  coutMaterielUnitaireHt: 0,
  coutMainOeuvreUnitaireHt: 0,
  prixVenteUnitaireHt: PEREIRA_COMBLES_PRIX_VENTE_UNITAIRE_HT,
  tauxTva: PEREIRA_ITI_TAUX_TVA,
  statut: "estimation" as const,
  artisan: "",
  montantDevisReel: 0,
  cataloguePrestationId: "compat-combles",
  categorieMetierId: "isolation",
  sousCategorieId: SOUS_COMBLES?.id,
};

export const PEREIRA_LIGNE_PLANCHER_ESTIMATION = {
  id: "pereira-plancher-19",
  posteId: "isolation_planchers",
  nom: "Isolation plancher, R ≥ 3",
  categorie: "enveloppe",
  unite: "m2",
  description: `Plancher bas / dalle sur sous-sol, ${PEREIRA_PLANCHER_SURFACE_M2} m², ${PEREIRA_PLANCHER_RESISTANCE}. ${PEREIRA_ITI_MENTION}.`,
  quantite: PEREIRA_PLANCHER_SURFACE_M2,
  coutMaterielUnitaireHt: 0,
  coutMainOeuvreUnitaireHt: 0,
  prixVenteUnitaireHt: PEREIRA_PLANCHER_PRIX_VENTE_UNITAIRE_HT,
  tauxTva: PEREIRA_ITI_TAUX_TVA,
  statut: "estimation" as const,
  artisan: "",
  montantDevisReel: 0,
  cataloguePrestationId: "compat-plancher",
  categorieMetierId: "isolation",
  sousCategorieId: SOUS_PLANCHER?.id,
};

export const PEREIRA_LIGNES_ESTIMATION_INITIALES = [
  PEREIRA_LIGNE_ITI_ESTIMATION,
  PEREIRA_LIGNE_COMBLES_ESTIMATION,
  PEREIRA_LIGNE_PLANCHER_ESTIMATION,
];
