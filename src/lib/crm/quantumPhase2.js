/**
 * QUANTUM — Phase 2 (architecture réservée, non implémentée).
 * Ne pas appeler depuis le MVP. Toute visualisation thermique future
 * devra être présentée comme simulation illustrative, jamais comme mesure réelle.
 */

export const QUANTUM_PHASE2 = {
  uploadPhotos: { pret: false, description: "Dépôt de 4 photos exploitables du logement." },
  comparaisonAvantApres: {
    pret: true,
    description: "Comparaison illustrative avant / après via Projection3DWow (slider web, côte à côte PDF).",
  },
  projection3d: {
    pret: true,
    description: "Projection WOW IA illustrative du potentiel (ITE, toiture, solaire) — jamais une mesure réelle.",
  },
  visualisationThermique: {
    pret: false,
    description: "Carte thermique illustrative — jamais une caméra thermique réelle.",
    avertissement: "Simulation illustrative uniquement. Ne pas simuler une mesure thermique réelle.",
  },
  miniPdf: { pret: false, description: "Génération d’un mini-bilan PDF indicatif." },
  priseRendezVous: { pret: false, description: "Prise de rendez-vous avec Catarina." },
  syncAgenda: { pret: false, description: "Synchronisation agenda Catarina / ENERGIA." },
};

export function phase2NonImplementee(fonctionnalite) {
  throw new Error(`Quantum Phase 2 — ${fonctionnalite} n’est pas implémentée dans ce MVP.`);
}
