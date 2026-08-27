/**
 * Catalogue des postes de rénovation d’ampleur.
 *
 * Aucun prix n’est renseigné ici. Les coûts unitaires se chargent depuis
 * `tarifs-fournisseurs.2026.json` (tous nuls par défaut) puis sont
 * surchargés par la saisie utilisateur.
 */

import type { PosteCatalogue, PosteId } from "./types";

export const CATALOGUE_POSTES: PosteCatalogue[] = [
  {
    id: "audit_etude",
    nom: "Audit et étude préalable",
    unite: "forfait",
    categorie: "etude",
    appliqueAleas: false,
    appliquePilotage: false,
    description: "Audit énergétique, étude technique et dimensionnements post-isolation.",
  },
  {
    id: "isolation_combles",
    nom: "Isolation des combles",
    unite: "m2",
    categorie: "enveloppe",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "Isolation des combles perdus ou aménagés — premier poste de l’ordre optimal.",
  },
  {
    id: "isolation_rampants",
    nom: "Isolation des rampants",
    unite: "m2",
    categorie: "enveloppe",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "Isolation des rampants de toiture (combles aménagés).",
  },
  {
    id: "ite",
    nom: "ITE — isolation thermique par l’extérieur",
    unite: "m2",
    categorie: "enveloppe",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "Isolation des murs par l’extérieur. Attention malus météo novembre–mars.",
  },
  {
    id: "iti",
    nom: "ITI — isolation thermique par l’intérieur",
    unite: "m2",
    categorie: "enveloppe",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "Isolation des murs par l’intérieur. ITI en geste isolé exclu MaPrimeRénov’ 2026.",
  },
  {
    id: "isolation_planchers",
    nom: "Isolation des planchers bas",
    unite: "m2",
    categorie: "enveloppe",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "Isolation des planchers bas / sous-sol / vide sanitaire.",
  },
  {
    id: "fenetres_portes_fenetres",
    nom: "Fenêtres et portes-fenêtres",
    unite: "unite",
    categorie: "enveloppe",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "Remplacement menuiseries après isolation, pour limiter les ponts thermiques.",
  },
  {
    id: "pac_air_eau",
    nom: "PAC air-eau",
    unite: "forfait",
    categorie: "equipement",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "Pompe à chaleur air-eau dimensionnée POST-isolation. COP ≥ 4.",
  },
  {
    id: "pac_air_air",
    nom: "PAC air-air",
    unite: "unite",
    categorie: "equipement",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "Pompe à chaleur air-air (chauffage ciblé). Dimensionnement post-isolation.",
  },
  {
    id: "vmc_simple_flux",
    nom: "VMC simple flux",
    unite: "forfait",
    categorie: "equipement",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "Ventilation mécanique simple flux — après isolation.",
  },
  {
    id: "vmc_double_flux",
    nom: "VMC double flux",
    unite: "forfait",
    categorie: "equipement",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "VMC double flux rendement ≥ 85 % — après isolation.",
  },
  {
    id: "ballon_thermodynamique",
    nom: "Ballon thermodynamique",
    unite: "forfait",
    categorie: "equipement",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "Chauffe-eau thermodynamique pour l’eau chaude sanitaire.",
  },
  {
    id: "panneaux_photovoltaiques",
    nom: "Panneaux photovoltaïques",
    unite: "kWc",
    categorie: "equipement",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "Photovoltaïque en dernier, après réduction des besoins. Surface ~6–8 m²/kWc.",
  },
  {
    id: "depose_evacuation",
    nom: "Dépose et évacuation",
    unite: "forfait",
    categorie: "chantier",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "Dépose des équipements existants, évacuation et mise en décharge.",
  },
  {
    id: "finitions",
    nom: "Finitions",
    unite: "forfait",
    categorie: "chantier",
    appliqueAleas: true,
    appliquePilotage: true,
    description: "Reprises de finitions après isolation et menuiseries.",
  },
  {
    id: "coordination_pilotage",
    nom: "Coordination et pilotage",
    unite: "forfait",
    categorie: "structure",
    appliqueAleas: false,
    appliquePilotage: false,
    description:
      "Prestation AMO / contractant général. Le taux de pilotage des autres postes couvre déjà une part ; n’ajouter ici qu’un coût réel distinct (heures, sous-traitance).",
  },
  {
    id: "frais_administratifs",
    nom: "Frais administratifs",
    unite: "forfait",
    categorie: "structure",
    appliqueAleas: false,
    appliquePilotage: false,
    description: "Frais de dossier, assurances, reproductions, déplacements administratifs.",
  },
  {
    id: "aleas_techniques",
    nom: "Aléas techniques (forfait complémentaire)",
    unite: "forfait",
    categorie: "structure",
    appliqueAleas: false,
    appliquePilotage: false,
    description:
      "Forfait d’aléas additionnel, distinct du taux d’aléas appliqué aux postes techniques. À n’utiliser que si un devis le justifie.",
  },
];

export function getPosteCatalogue(id: PosteId): PosteCatalogue {
  const poste = CATALOGUE_POSTES.find((item) => item.id === id);
  if (!poste) {
    throw new Error(`Poste catalogue inconnu : ${id}`);
  }
  return poste;
}
