/**
 * Prospect Charlotte LANOUX — Bordeaux, pierre de taille.
 * Maçonnerie (mur porteur / linteau) et menuiseries extérieures.
 * Apporteur Jamel HAMZAOUI — commission 10 % HT hors énergie et hors aides.
 * Aucun montant : attente de l'acte notarié, hors CA prévisionnel.
 */

import {
  SOURCE_APPORTEUR_JAMEL,
  STATUT_COMMISSION_EN_ATTENTE,
  libelleSourceApporteur,
} from "./operationnelCrm.js";

export const LANOUX_LEAD_ID = "lead-lanoux-bordeaux-2026";
export const LANOUX_REFERENCE = "EC-2026-LEAD-LANOUX-01";
export const LANOUX_CONVENTION = "CONV-2026-ENERGETHIQUE-JAMEL-HAMZAOUI";
export const STATUT_LANOUX = "Prospect qualifié — Attente acte notarié";
export const PRIORITE_LANOUX =
  "Relance fin novembre / début décembre 2026 à l'emménagement";
export const SOURCE_LANOUX = "Jamel HAMZAOUI — ENERG’ÉTHIQUE";
export const TAUX_COMMISSION_LANOUX = 0.1;

export const CLIENT_LANOUX = {
  nom: "Charlotte LANOUX",
  prenom: "Charlotte",
  telephone: "06 14 33 81 52",
  adresse: "Rue Judaïque, 33000 Bordeaux",
  ville: "Bordeaux",
  codePostal: "33000",
  dateContact: "2026-10-12",
};

export const DESCRIPTION_LANOUX =
  "Immeuble / appartement ancien en pierre de taille. Clés en main sous garantie décennale : expertise technique structurelle, dossier de déclaration préalable d’urbanisme en Mairie de Bordeaux, dépose soignée et pose. Lots autorisés uniquement : 12 Maçonnerie (ouverture de mur porteur / linteau) et 09 Menuiseries extérieures (fourniture et pose fenêtre / porte-fenêtre). Hors énergie et hors aides publiques. Commission apporteur 10 % HT sur ces lots seulement, non chiffrée tant qu’il n’y a pas de devis HT.";

export const NOTES_SUIVI_LANOUX =
  "Contactée le 12/10/2026 suite recommandation Jamel (hôtel Montempo, Bassins à Flot). Cliente entrepreneure très occupée, calendrier d’achat en cours validé par SMS. Prochaine action : relance fin novembre / début décembre 2026 à l’emménagement, après acte notarié.";

export const EQUIPE_LANOUX = {
  direction: "Sylvain LEMBELEMBE",
  apporteur:
    "Jamel HAMZAOUI — ENERG’ÉTHIQUE — CONV-2026-ENERGETHIQUE-JAMEL-HAMZAOUI — 10 % HT, périmètre strict hors énergie et hors aides publiques",
};

export const PROJET_LANOUX_DEFAUT = {
  id: LANOUX_LEAD_ID,
  nom: CLIENT_LANOUX.nom,
  prenom: CLIENT_LANOUX.prenom,
  ville: CLIENT_LANOUX.ville,
  codePostal: CLIENT_LANOUX.codePostal,
  adresse: CLIENT_LANOUX.adresse,
  telephone: CLIENT_LANOUX.telephone,
  email: "",
  rfr: null,
  statut: STATUT_LANOUX,
  priorite: PRIORITE_LANOUX,
  reference: LANOUX_REFERENCE,
  numeroAuditMar: LANOUX_REFERENCE,
  typeBien: "Immeuble / appartement ancien en pierre de taille",
  typeProjet:
    "12 Maçonnerie (ouverture mur porteur / linteau) et 09 Menuiseries extérieures (fourniture et pose fenêtre / porte-fenêtre) — clés en main, garantie décennale",
  description: DESCRIPTION_LANOUX,
  source: "lead-prospect",
  sourceLead: SOURCE_LANOUX,
  createdAt: CLIENT_LANOUX.dateContact,
  apporteurId: SOURCE_APPORTEUR_JAMEL,
  apporteurNom: libelleSourceApporteur(SOURCE_APPORTEUR_JAMEL, { select: true }),
  conventionApporteur: LANOUX_CONVENTION,
  tauxCommissionApporteur: TAUX_COMMISSION_LANOUX,
  horsAidesPubliques: true,
  etapeAnah: null,
  validationMar: false,
  acompte30Encaisse: false,
  dateVisiteTechnique: "",
  consultationDuo: false,
  statutCommission: STATUT_COMMISSION_EN_ATTENTE,
  detailJalon: PRIORITE_LANOUX,
  equipe: EQUIPE_LANOUX,
  montantEstimeTtc: null,
  montantHt: null,
  commissionDamienHt: null,
  travaux: [],
  alertes: [NOTES_SUIVI_LANOUX],
  detailsTechniques: {
    resume: `${CLIENT_LANOUX.telephone} · ${CLIENT_LANOUX.adresse} · ${NOTES_SUIVI_LANOUX}`,
  },
};
