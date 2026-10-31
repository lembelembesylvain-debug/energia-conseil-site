import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ZOULOU_PARIS_DOSSIER_ID,
  NOM_FICHIER_CONTRAT_ZOULOU_PARIS,
} from "../src/lib/crm/zoulouParisOfficiel.js";
import { htmlContratPourDossier, nomFichierContrat } from "../src/lib/crm/htmlContratCrm.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const dossier = { id: ZOULOU_PARIS_DOSSIER_ID };
const html = htmlContratPourDossier({}, dossier);
const nom = nomFichierContrat(dossier) || NOM_FICHIER_CONTRAT_ZOULOU_PARIS;
const out = join(root, "public", nom);
writeFileSync(out, html, "utf8");

const checks = [
  ["TTC 84500", html.includes("84 500")],
  ["aides 38500", html.includes("38 500")],
  ["RAC 46000", html.includes("46 000")],
  ["30 13800", html.includes("13 800")],
  ["40 18400", html.includes("18 400")],
  ["Zoulou", /Zoulou/i.test(html)],
  ["Paris", /Paris/i.test(html)],
  ["Lot 1", html.includes("Lot 1")],
  ["Lot 5", html.includes("Lot 5")],
  ["sig-table", html.includes("sig-table")],
  ["logo/energia", /energia/i.test(html)],
];

for (const [label, ok] of checks) {
  if (!ok) {
    console.error("FAIL", label);
    process.exit(1);
  }
  console.log("OK", label);
}

console.log("FILE", out, "bytes", html.length);
