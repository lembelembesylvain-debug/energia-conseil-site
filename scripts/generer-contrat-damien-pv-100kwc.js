/**
 * Génère le contrat CG Damien PV 100 kWc (HTML public).
 * Usage : npx tsx scripts/generer-contrat-damien-pv-100kwc.js
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  DAMIEN_PV_100KWC_DOSSIER_ID,
  NOM_FICHIER_CONTRAT_DAMIEN_PV_100KWC,
} from "../src/lib/crm/damienPv100kwcOfficiel.js";
import { htmlContratPourDossier, nomFichierContrat } from "../src/lib/crm/htmlContratCrm.js";

const dossier = { id: DAMIEN_PV_100KWC_DOSSIER_ID };
const html = htmlContratPourDossier({}, dossier);
const nom = nomFichierContrat(dossier) || NOM_FICHIER_CONTRAT_DAMIEN_PV_100KWC;
const path = join(process.cwd(), "public", nom);
writeFileSync(path, html, "utf8");

const checks = [
  ["TTC 106 800", (h) => h.includes("106 800,00")],
  ["HT 89 000", (h) => h.includes("89 000,00")],
  ["TVA 17 800", (h) => h.includes("17 800,00")],
  ["acompte 32 040", (h) => h.includes("32 040,00")],
  ["intermédiaire 42 720", (h) => h.includes("42 720,00")],
  ["client Exploitation", (h) => h.includes("Exploitation Tertiaire / Agricole")],
  ["Ardèche", (h) => h.includes("Ardèche") || h.includes("07")],
  ["modules TOPCon", (h) => /TOPCon/i.test(h)],
  ["total ferme 106 800", (h) => h.includes("TOTAL FERME ET DÉFINITIF TTC : 106 800,00")],
  ["5 lignes postes", (h) => (h.match(/<td class="num-col num">[1-5]</g) || []).length === 5],
];

for (const [label, ok] of checks) {
  if (!ok(html)) throw new Error(`${nom} — échec : ${label}`);
}

console.log(`OK — ${nom} (${html.length} octets)`);
