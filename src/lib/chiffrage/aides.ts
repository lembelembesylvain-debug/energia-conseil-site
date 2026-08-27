/**
 * Aides financières — affichage séparé du prix des travaux.
 *
 * Aucun montant n’est prérempli. Les lignes sont des gabarits :
 * organisme, conditions à vérifier, date de validité. L’utilisateur
 * saisit le montant estimatif et le montant retenu dans la simulation.
 */

import type { AideEstimative } from "./types";

export const AIDES_GABARITS: AideEstimative[] = [
  {
    id: "mpr-parcours",
    libelle: "MaPrimeRénov’ Parcours (aide estimative)",
    organisme: "ANAH — MaPrimeRénov’",
    conditionsAVerifier:
      "Profil de revenus, gain de classes, artisans RGE, MAR, validation ANAH avant démarrage des travaux.",
    dateValidite: "2026-12-31",
    montantEstimatif: null,
    montantRetenu: 0,
    commentaire: "Montant à renseigner après simulation MAR / barème 2026. Non garanti.",
  },
  {
    id: "cee",
    libelle: "Certificats d’économies d’énergie (CEE)",
    organisme: "Obligé CEE / délégataire",
    conditionsAVerifier:
      "Postes éligibles (hors ITE/ITI selon Coup de pouce 2026), fourchette variable 20–40 %, dossier CEE.",
    dateValidite: "2026-12-31",
    montantEstimatif: null,
    montantRetenu: 0,
    commentaire: "Toujours afficher une fourchette. Montant retenu = hypothèse basse sauf devis CEE.",
  },
  {
    id: "coup-de-pouce",
    libelle: "Coup de pouce rénovation d’ampleur",
    organisme: "CEE — Coup de pouce",
    conditionsAVerifier: "Gain de 2 classes (≈ 4 700 €) ou 3 classes et plus (≈ 5 800 €), selon barème 2026.",
    dateValidite: "2026-12-31",
    montantEstimatif: null,
    montantRetenu: 0,
    commentaire: "Montants barème 2026 à confirmer selon le gain de classes réel.",
  },
  {
    id: "mar",
    libelle: "Prise en charge MAR (Parcours accompagné)",
    organisme: "ANAH / France Rénov’",
    conditionsAVerifier: "MAR certifié, profil de revenus, plafond 2 000 € de prise en charge selon profil.",
    dateValidite: "2026-12-31",
    montantEstimatif: null,
    montantRetenu: 0,
    commentaire: "Coût MAR 2 000–4 000 € ; part prise en charge selon profil (Bleu/Jaune 100 %, Violet 80 %, Rose 40 %).",
  },
  {
    id: "locales",
    libelle: "Aides locales (commune, EPCI, département, région)",
    organisme: "Collectivité territoriale",
    conditionsAVerifier: "Règlement local 2026, cumul avec MPR/CEE, justificatifs de résidence.",
    dateValidite: "2026-12-31",
    montantEstimatif: null,
    montantRetenu: 0,
    commentaire: "Fourchette typique 500–5 000 € — à vérifier commune par commune.",
  },
];

export function aidesInitiales(): AideEstimative[] {
  return AIDES_GABARITS.map((aide) => ({ ...aide }));
}
