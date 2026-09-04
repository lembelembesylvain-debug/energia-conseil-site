import type { CategoriePoste, UnitePoste } from "../../chiffrage/types";
import type { UnitePrestation } from "./types";

const CATEGORIE_POSTE_PAR_METIER: Record<string, CategoriePoste> = {
  "etude-accompagnement": "etude",
  isolation: "enveloppe",
  toiture: "enveloppe",
  menuiserie: "enveloppe",
  "double-vitrage": "enveloppe",
  "ravalement-facade": "enveloppe",
  "renovation-globale": "enveloppe",
  chauffage: "equipement",
  "pompe-a-chaleur": "equipement",
  photovoltaique: "equipement",
  electricite: "equipement",
  climatisation: "equipement",
  "poele-bois-granules": "equipement",
  "chauffe-eau-solaire": "equipement",
  "plomberie-sanitaire": "equipement",
  "mobilite-electrique": "equipement",
  "frais-administratifs-coordination": "structure",
};

export function categoriePosteDepuisMetier(categorieId: string): CategoriePoste {
  return CATEGORIE_POSTE_PAR_METIER[categorieId] ?? "chantier";
}

export function uniteChiffrageDepuisCatalogue(unite: UnitePrestation): UnitePoste {
  if (unite === "m²") return "m2";
  if (unite === "panneau") return "panneau";
  if (unite === "u") return "unite";
  if (unite === "kWc") return "kWc";
  if (unite === "ml") return "ml";
  return "forfait";
}

export function statutEstimationDepuisCatalogue(
  statut: string,
): "estimation" | "devis_demande" | "devis_recu" | "valide" {
  if (statut === "devis_recu") return "devis_recu";
  if (statut === "valide" || statut === "realise") return "valide";
  return "estimation";
}
