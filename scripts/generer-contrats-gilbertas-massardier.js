/**
 * Génère les contrats CG Gilbertas + Massardier (HTML public).
 * Usage : npx tsx scripts/generer-contrats-gilbertas-massardier.js
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  GILBERTAS_DOSSIER_ID,
  NOM_FICHIER_CONTRAT_GILBERTAS,
} from "../src/lib/crm/gilbertasClermontOfficiel.js";
import {
  MASSARDIER_LEAD_ID,
  NOM_FICHIER_CONTRAT_MASSARDIER,
} from "../src/lib/crm/massardierLeadOfficiel.js";
import { htmlContratPourDossier, nomFichierContrat } from "../src/lib/crm/htmlContratCrm.js";

function ecrire(dossierId, checks) {
  const dossier = { id: dossierId };
  const html = htmlContratPourDossier({}, dossier);
  const nom = nomFichierContrat(dossier);
  const path = join(process.cwd(), "public", nom);
  writeFileSync(path, html, "utf8");
  for (const [label, ok] of checks) {
    if (!ok(html)) throw new Error(`${nom} — échec : ${label}`);
  }
  console.log(`OK — ${nom} (${html.length} octets)`);
  return path;
}

ecrire(GILBERTAS_DOSSIER_ID, [
  ["TTC 37 600", (h) => h.includes("37 600,00")],
  ["HT Gilbertas", (h) => h.includes("34 181,82")],
  ["client Leïla", (h) => h.includes("Leïla")],
  ["lot cuisine", (h) => /Cuisine sur-mesure/i.test(h)],
  ["acompte 11 280", (h) => h.includes("11 280,00")],
  ["démarrage 15 040", (h) => h.includes("15 040,00")],
  ["four AEG", (h) => h.includes("TU5PB40SK")],
  ["plaque Electrolux", (h) => h.includes("MIV63346IT")],
  ["hotte Elica", (h) => h.includes("PRF0119819A")],
  ["lave-vaisselle Bosch", (h) => h.includes("SPV4EMX17E")],
  ["frigo Beko", (h) => h.includes("BCNA275E4ZSN")],
  ["lave-linge Beko", (h) => h.includes("B3WBT691415W")],
  ["micro-ondes Whirlpool", (h) => h.includes("MBNA 920 B")],
  ["rendu 3D", (h) => h.includes("rendu-3d-cuisine-perspective-1.jpg") && h.includes("rendu-3d-cuisine-perspective-2.jpg")],
  ["sans apporteur", (h) => !/damien|apporteur|commissionnement|marge nette|débours|raison home|disac/i.test(h)],
  ["interlocuteur unique", (h) => h.includes("interlocuteur unique")],
  ["Catarina", (h) => h.includes("Catarina MARTINS")],
  ["planning 7 jours", (h) => h.includes("7 jours ouvrés")],
  ["VT trois emplacements", (h) => h.split("Visite Technique (VT) préalable obligatoire : Réalisation").length - 1 >= 3],
  ["délai usine 5 semaines", (h) => h.includes("Délai ferme de 5 semaines")],
  ["phasage préparatoire", (h) => h.includes("280 m² développés")],
  ["conditions particulières", (h) => h.includes("Conditions particulières")],
  ["lieu exécution", (h) => h.includes("Appartement 80 m² — 63000 Clermont-Ferrand")],
  ["téléphone", (h) => h.includes("06 37 96 06 91")],
  ["facture acompte", (h) => h.includes("FA-2026-GILBERTAS-01")],
  ["acompte HT", (h) => h.includes("10 254,55")],
  ["acompte TVA", (h) => h.includes("1 025,45")],
  ["RIB Qonto", (h) => h.includes("FR76 1695 8000 0186 6836 4808 772") && h.includes("QNTOFRP1XXX")],
  ["libellé virement", (h) => h.includes("Acompte Gilbertas FA-2026-01")],
  ["décennale", (h) => h.includes("LUNPIB2604975")],
  ["INPI", (h) => h.includes("5213845")],
  ["coloris Porcelaine 30", (h) => h.includes("Porcelaine / 30")],
  ["chêne du Jura", (h) => h.includes("Chêne du Jura / D016")],
  ["poignée 381", (h) => h.includes("réf. 381")],
  ["libre choix sans surcoût", (h) => h.includes("sans surcoût")],
]);

ecrire(MASSARDIER_LEAD_ID, [
  ["TTC 20 000", (h) => h.includes("20 000,00")],
  ["client Massardier", (h) => h.includes("Massardier")],
  ["cuisine Direct Usine", (h) => /Direct Usine/i.test(h)],
  ["acompte 6 000", (h) => h.includes("6 000,00")],
]);

console.log("Fichiers :", NOM_FICHIER_CONTRAT_GILBERTAS, NOM_FICHIER_CONTRAT_MASSARDIER);
