/**
 * Génère le contrat CG Couty — main courante Mably (1 485 € TTC, échéancier 30/70).
 * Usage : npx tsx scripts/generer-contrat-couty-escalier.js
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  COUTY_ESCALIER_DOSSIER_ID,
  NOM_FICHIER_DEVIS_COUTY,
} from "../src/lib/crm/coutyEscalierOfficiel.js";
import { htmlContratPourDossier, nomFichierContrat } from "../src/lib/crm/htmlContratCrm.js";

const dossier = { id: COUTY_ESCALIER_DOSSIER_ID };
const html = htmlContratPourDossier({}, dossier);
const nom = nomFichierContrat(dossier) || NOM_FICHIER_DEVIS_COUTY;

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
if (!html.includes("1 485,00")) throw new Error("TTC 1 485 manquant");
if (!html.includes("1 350,00")) throw new Error("HT 1 350 manquant");
if (!html.includes("445,50")) throw new Error("acompte 30 % manquant");
if (!html.includes("1 039,50")) throw new Error("solde 70 % manquant");
if (!html.includes("1 113,75")) throw new Error("RAC net manquant");
if (!html.includes("LUNPIB2604975")) throw new Error("décennale manquante");
if (!html.includes("EC-2026-SO-MAIN-COURANTE-01")) throw new Error("référence EC manquante");
if (!html.includes("Lot 3")) throw new Error("lots manquants");
if (/damien/i.test(html)) throw new Error("mention Damien encore présente");
if (!html.includes("Annexe Photographique — Repérage technique")) throw new Error("annexe manquante");
if (!html.includes("./couty-escalier/04-palier-bas.jpg")) throw new Error("photos manquantes");
if (/encart contractuel/i.test(html)) throw new Error("encart rémunération encore présent");
if (/Damien RICHARD/i.test(html)) throw new Error("mention Damien RICHARD encore présente");
if (/apporteur/i.test(html)) throw new Error("mot apporteur encore présent");
if (html.includes("715,00") || html.includes("594")) throw new Error("donnée interne ou ancien échéancier présent");
