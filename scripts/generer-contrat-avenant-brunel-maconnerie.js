/**
 * Génère l'avenant n°01 Gros Œuvre & Dalle 80 m² — Brunel.
 * Usage : npx tsx scripts/generer-contrat-avenant-brunel-maconnerie.js
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  BRUNEL_MACONNERIE_DOSSIER_ID,
  NOM_FICHIER_CONTRAT_BRUNEL_MACONNERIE,
} from "../src/lib/crm/brunelMaconnerieOfficiel.js";
import { htmlContratPourDossier, nomFichierContrat } from "../src/lib/crm/htmlContratCrm.js";

const dossier = { id: BRUNEL_MACONNERIE_DOSSIER_ID };
const html = htmlContratPourDossier({}, dossier);
const nom = nomFichierContrat(dossier) || NOM_FICHIER_CONTRAT_BRUNEL_MACONNERIE;

const publicPath = join(process.cwd(), "public", nom);
writeFileSync(publicPath, html, "utf8");

console.log(`OK — ${nom}`);
console.log(`  public : ${publicPath}`);
console.log(`  taille : ${html.length} octets`);

const checks = [
  ["24 420,00", "TTC avenant"],
  ["7 326,00", "acompte 30 %"],
  ["9 768,00", "acompte 40 %"],
  ["Annexe Architecturale — Galerie Comparative Avant / Après Travaux (10 zones)", "titre annexe galerie"],
  ["Zone 1 —", "zone 1"],
  ["Zone 10 —", "zone 10"],
  ["Note contractuelle", "mention juridique"],
  ["IPN 260", "IPN mention"],
  ["DOC%204.jpg", "après DOC 4 encodé"],
  ["Direction Technique & Compagnons Gros Œuvre ENERGIA CONSEIL IA®", "artisan lot dalle confidentiel"],
];
for (const [needle, label] of checks) {
  if (!html.includes(needle)) throw new Error(`${label} manquant (${needle})`);
}
if (html.includes("PLAN TECHNIQUE D'INGÉNIERIE GROS ŒUVRE")) {
  throw new Error("Le bloc plan DAO technique ne doit plus figurer dans l'avenant client");
}
if (html.includes("PLAN-TECHNIQUE-DAO-NIVEAU-0.svg")) {
  throw new Error("Le SVG plan DAO ne doit plus figurer dans l'avenant client");
}
if (html.includes("plan-tabs-brunel") || html.includes("Croquis Manuscrit Terrain")) {
  throw new Error("Les onglets plan/croquis ne doivent plus figurer dans l'avenant client");
}
if (html.includes("17 770") || html.includes("17770")) {
  throw new Error("Montant Hezen 17770 ne doit pas apparaître dans l'avenant client");
}
if (html.includes("DEVIS-HEZEN-BATIMENT.jpg")) {
  throw new Error("Le devis Hezen admin ne doit pas figurer dans l'avenant client");
}
console.log("Contrôles avenant Brunel maçonnerie : OK");
