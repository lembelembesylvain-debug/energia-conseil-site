/**
 * BET NOMOS — bureau d'études partenaire conventionné.
 * L'id d'apport CRM historique reste `romain_bet_nomos`.
 */

import { SOURCE_APPORTEUR_ROMAIN } from "./operationnelCrm.js";

export const BET_NOMOS_ID = "bet-nomos";
export const BET_NOMOS_APPORTEUR_ID = SOURCE_APPORTEUR_ROMAIN;
export const BET_NOMOS_CONVENTION_REF = "CONV-2026-BET-NOMOS-01";
export const BET_NOMOS_CONVENTION_DATE = "2026-10-15";
export const NOM_FICHIER_CONVENTION_NOMOS = "CONVENTION_CADRE_BET_NOMOS_2026.html";
export const CHEMIN_CONVENTION_NOMOS = `/${NOM_FICHIER_CONVENTION_NOMOS}`;

export const TYPES_AUDIT_MARCHE = [
  "Maison Individuelle (Résidentiel / MaPrimeRénov')",
  "Copropriété & Logement Collectif (Rénovation Globale / AMO)",
  "Tertiaire (Décret Tertiaire / Décret BACS / GTB)",
  "Industrie (Audits réglementaires NF EN 16247 / CEE Industrie)",
];

export const POLES_BET_NOMOS = [
  {
    id: "maison",
    titre: "Maison individuelle",
    missions: [
      "Audit énergétique réglementaire",
      "Étude thermique",
      "Dimensionnement PAC",
      "Accompagnement aides",
    ],
  },
  {
    id: "copropriete",
    titre: "Logement collectif (copropriétés)",
    missions: [
      "Audit énergétique global",
      "DTG",
      "Scénarios de rénovation",
      "Assistance à maîtrise d'ouvrage (AMO)",
    ],
  },
  {
    id: "tertiaire-industrie",
    titre: "Tertiaire et industrie",
    missions: [
      "Décret Tertiaire",
      "Décret BACS",
      "Audit énergétique NF EN 16247",
      "Optimisation des usages",
      "Intégration EnR (solaire, PAC tertiaire)",
    ],
  },
];

export const PARTENAIRE_BET_NOMOS = {
  id: BET_NOMOS_ID,
  nom: "BET NOMOS — Bureau d'Ingénierie en Performance Énergétique",
  entite: "BET NOMOS",
  qualite: "Bureau d'études RGE AFNOR — partenaire conventionné Contractant Général",
  referent: "Romain",
  certification: "RGE AFNOR",
  email: "contact@nomos.bet.fr",
  telephone: "06 58 25 34 44",
  site: "https://www.nomos.bet.fr",
  secteur: "Maison individuelle, copropriétés, tertiaire et industrie",
  roleCrm: "bureau_etudes",
  apporteurId: BET_NOMOS_APPORTEUR_ID,
  conventionRef: BET_NOMOS_CONVENTION_REF,
  conventionChemin: CHEMIN_CONVENTION_NOMOS,
  statutJuridique:
    "Indépendance et impartialité méthodologique certifiées AFNOR. Partenaire conventionné du Contractant Général ENERGIA CONSEIL IA®.",
  poles: POLES_BET_NOMOS,
  acces: {
    emailConnexion: "contact@nomos.bet.fr",
    creerAdresseEnergia: false,
    perimetre: ["audits", "diagnostics", "dossiers_rattaches"],
  },
};

export function estTypeAuditEtendu(typeProjet) {
  return TYPES_AUDIT_MARCHE.includes(String(typeProjet || ""));
}

export function libelleBureauEtudes(bureauEtudesId) {
  if (bureauEtudesId === BET_NOMOS_ID || bureauEtudesId === BET_NOMOS_APPORTEUR_ID) {
    return "BET NOMOS — Romain";
  }
  return "";
}
