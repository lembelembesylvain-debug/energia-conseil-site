/**
 * Génère le contrat CG Cloison SDB (montants fermes 2 717 € TTC — 4 lots).
 * Usage : npx tsx scripts/generer-contrat-cloison-sdb.js
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  CLOISON_SDB_DOSSIER_ID,
  NOM_FICHIER_CONTRAT_CLOISON_SDB,
} from "../src/lib/crm/cloisonSdbOfficiel.js";
import { htmlContratPourDossier, nomFichierContrat } from "../src/lib/crm/htmlContratCrm.js";

const dossier = { id: CLOISON_SDB_DOSSIER_ID };
const html = htmlContratPourDossier({}, dossier);
const nom = nomFichierContrat(dossier) || NOM_FICHIER_CONTRAT_CLOISON_SDB;

const publicPath = join(process.cwd(), "public", nom);
writeFileSync(publicPath, html, "utf8");

const downloadsDir = join(homedir(), "Downloads");
try {
  mkdirSync(downloadsDir, { recursive: true });
  writeFileSync(join(downloadsDir, nom), html, "utf8");
} catch (err) {
  console.warn("Downloads non écrit :", err?.message || err);
}

console.log(`OK — ${nom}`);
console.log(`  public : ${publicPath}`);
console.log(`  taille : ${html.length} octets`);
if (!html.includes("2 717,00")) throw new Error("TTC 2 717 manquant");
if (!html.includes("2 470,00")) throw new Error("HT 2 470 manquant");
if (!html.includes("247,00")) throw new Error("TVA 247 manquant");
if (!html.includes("815,10")) throw new Error("acompte 30 % manquant");
if (!html.includes("1 086,80")) throw new Error("acompte 40 % manquant");
if (/encart contractuel/i.test(html)) throw new Error("encart rémunération encore présent");
if (/damien richard/i.test(html)) throw new Error("mention Damien RICHARD encore présente");
if (html.includes("Raccords sols et finitions périphériques")) {
  throw new Error("lot 5 raccords sols encore présent");
}
if (!html.includes("M. / Mme [Nom du Client]") && !html.includes("Monsieur et Madame Georges GOURDON")) {
  throw new Error("signature client manquante");
}
if (html.includes("Je soussigné(e), <strong>Réaménagement Cloison")) {
  throw new Error("signature utilise encore l’intitulé projet");
}
