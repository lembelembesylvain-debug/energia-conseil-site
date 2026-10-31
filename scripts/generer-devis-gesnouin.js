/**
 * Génère le HTML public devis Gesnouin (stockage AC).
 * Usage : npx tsx scripts/generer-devis-gesnouin.js
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  GESNOUIN_DOSSIER_ID,
  NOM_FICHIER_CONTRAT_GESNOUIN,
} from "../src/lib/crm/gesnouinBatterieOfficiel.js";
import { htmlContratPourDossier, nomFichierContrat } from "../src/lib/crm/htmlContratCrm.js";

const dossier = { id: GESNOUIN_DOSSIER_ID };
const html = htmlContratPourDossier({}, dossier);
const nom = nomFichierContrat(dossier) || NOM_FICHIER_CONTRAT_GESNOUIN;
const path = join(process.cwd(), "public", nom);
writeFileSync(path, html, "utf8");

const checks = [
  ["TTC 1 068", (h) => h.includes("1 068,00")],
  ["HT 890", (h) => h.includes("890,00")],
  ["TVA 178", (h) => h.includes("178,00")],
  ["acompte 320,40", (h) => h.includes("320,40")],
  ["solde 747,60", (h) => h.includes("747,60")],
  ["client Gesnouin", (h) => h.includes("Joël GESNOUIN") || h.includes("GESNOUIN")],
  ["Giberville", (h) => h.includes("Giberville")],
  ["Zendure", (h) => /Zendure/i.test(h)],
  ["EDF OA", (h) => /EDF OA|Obligation d.Achat/i.test(h)],
  ["3 postes", (h) => (h.match(/<td class="num-col num">[1-3]</g) || []).length >= 3],
];

for (const [label, ok] of checks) {
  if (!ok(html)) throw new Error(`${nom} — échec : ${label}`);
}

console.log(`OK — ${nom} (${html.length} octets)`);
