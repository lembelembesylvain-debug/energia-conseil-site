/**
 * Génère le devis CG Fariss — sous-sol PMR La Ricamarie (10 450 € TTC, échéancier 30/70).
 * Usage : npx tsx scripts/generer-devis-fariss.js
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { FARISS_DOSSIER_ID, NOM_FICHIER_DEVIS_FARISS, RIB_QONTO } from "../src/lib/crm/farissLaRicamarieOfficiel.js";
import { htmlContratPourDossier, nomFichierContrat } from "../src/lib/crm/htmlContratCrm.js";

const dossier = { id: FARISS_DOSSIER_ID };
const html = htmlContratPourDossier({}, dossier);
const nom = nomFichierContrat(dossier) || NOM_FICHIER_DEVIS_FARISS;
const publicPath = join(process.cwd(), "public", nom);
writeFileSync(publicPath, html, "utf8");

const attendus = [
  "10 450,00",
  "9 500,00",
  "3 135,00",
  "7 315,00",
  "990,00",
  "MaPrimeAdapt",
  "Kinedo",
  "Aqua Habita",
  RIB_QONTO.iban,
  RIB_QONTO.bic,
  "DEV-2026-FARISS-01",
  "Danielle Casanova",
  "Clause Julia",
];
for (const marque of attendus) {
  if (!html.includes(marque)) throw new Error(`manquant : ${marque}`);
}

console.log(`OK — ${nom}`);
console.log(`  public : ${publicPath}`);
console.log(`  taille : ${html.length} octets`);
