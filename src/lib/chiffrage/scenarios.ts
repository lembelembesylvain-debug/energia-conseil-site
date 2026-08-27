/**
 * Scénarios de rénovation d’ampleur.
 *
 * Les listes de postes indiquent le périmètre technique, pas un budget.
 * Aucun montant n’est associé : le budget se calcule uniquement à partir
 * des coûts entrants saisis (devis / tarifs vérifiés).
 */

import type { ScenarioAmpleur } from "./types";

export const SCENARIOS_AMPLEUR: ScenarioAmpleur[] = [
  {
    id: "essentiel",
    nom: "Niveau 1 — Essentiel",
    icone: "①",
    couleur: "#0f766e",
    recommande: false,
    synthese:
      "Isolation prioritaire, ventilation, chauffage ciblé et finitions. Périmètre de sécurisation thermique, sans enveloppe complète.",
    postesInclus: [
      "audit_etude",
      "isolation_combles",
      "isolation_planchers",
      "vmc_simple_flux",
      "pac_air_air",
      "depose_evacuation",
      "finitions",
      "coordination_pilotage",
      "frais_administratifs",
    ],
  },
  {
    id: "performance",
    nom: "Niveau 2 — Performance",
    icone: "②",
    couleur: "#1d4ed8",
    recommande: true,
    synthese:
      "Isolation complète, menuiseries ciblées, PAC, VMC et régulation. Scénario principal recommandé pour une rénovation d’ampleur.",
    postesInclus: [
      "audit_etude",
      "isolation_combles",
      "isolation_rampants",
      "ite",
      "isolation_planchers",
      "fenetres_portes_fenetres",
      "pac_air_eau",
      "vmc_double_flux",
      "depose_evacuation",
      "finitions",
      "coordination_pilotage",
      "frais_administratifs",
    ],
  },
  {
    id: "excellence",
    nom: "Niveau 3 — Excellence",
    icone: "③",
    couleur: "#7c3aed",
    recommande: false,
    synthese:
      "Traitement complet de l’enveloppe, équipements performants, ventilation renforcée, régulation et photovoltaïque éventuel.",
    postesInclus: [
      "audit_etude",
      "isolation_combles",
      "isolation_rampants",
      "ite",
      "isolation_planchers",
      "fenetres_portes_fenetres",
      "pac_air_eau",
      "vmc_double_flux",
      "ballon_thermodynamique",
      "panneaux_photovoltaiques",
      "depose_evacuation",
      "finitions",
      "coordination_pilotage",
      "frais_administratifs",
      "aleas_techniques",
    ],
  },
];
