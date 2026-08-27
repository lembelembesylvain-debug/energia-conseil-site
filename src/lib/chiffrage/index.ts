/**
 * Module de chiffrage rénovation d’ampleur — ENERGIA CONSEIL IA® 2026.
 *
 * Point d’entrée unique : types, catalogue, moteur, scénarios, aides.
 * Pour ajouter un tarif fournisseur, éditer `tarifs-fournisseurs.2026.json`
 * (voir README.md du dossier).
 */

export * from "./types";
export * from "./constantes";
export * from "./catalogue-postes";
export * from "./scenarios";
export * from "./aides";
export * from "./format";
export * from "./deplacements";
export * from "./devis-client";
export {
  round2,
  prixSortantDepuisCoutInterne,
  coutEntrantTotal,
  isSourceVerifiee,
  isDateObsolete,
  creerLigneDepuisCatalogue,
  creerGrilleInitiale,
  appliquerParametresAuxLignes,
  appliquerScenario,
  calculerLigne,
  calculerTotaux,
  calculerRecapAides,
  construireAvertissements,
  calculerChiffrage,
} from "./engine";
