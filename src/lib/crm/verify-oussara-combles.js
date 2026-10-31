/**
 * Contrôles devis combles M. et Mme Youssef OUSSARA.
 * 1 400 HT · TVA 20 % 280 · 1 680 TTC · acompte 672 · solde 1 008.
 * Exécution : npx tsx src/lib/crm/verify-oussara-combles.js
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  FINANCEMENT_OUSSARA_COMBLES,
  NOM_FICHIER_DEVIS_OUSSARA_COMBLES,
  NOM_FICHIER_PDF_OUSSARA_COMBLES,
  OUSSARA_COMBLES_DOSSIER_ID,
  OUSSARA_COMBLES_REFERENCE,
  POSTES_OUSSARA_COMBLES,
  PROJET_OUSSARA_COMBLES_DEFAUT,
  RIB_OUSSARA_COMBLES,
  TOTAUX_OUSSARA_COMBLES,
  htmlDevisOussaraCombles,
} from "./oussaraComblesOfficiel.js";
import { fusionnerAvecDefautBrunel, projetManuelVersAudit } from "./projetsManuels.js";
import { cheminContratPublic, htmlContratPourDossier, nomFichierContrat } from "./htmlContratCrm.js";
import { MARCHES } from "../../components/crm/ModulesStrategiquesCrm.jsx";
import { saisieFactureOussaraCombles } from "../../components/crm/FactureAcompteModal.tsx";
import { OUSSARA_DOSSIER_ID } from "./oussaraColombierOfficiel.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(POSTES_OUSSARA_COMBLES.length === 5, "5 postes");
assert(TOTAUX_OUSSARA_COMBLES.totalHt === 1400, "HT");
assert(TOTAUX_OUSSARA_COMBLES.totalTva === 280, "TVA");
assert(TOTAUX_OUSSARA_COMBLES.totalTtc === 1680, "TTC");
assert(TOTAUX_OUSSARA_COMBLES.surfaceM2 === 49, "surface");
assert(FINANCEMENT_OUSSARA_COMBLES.acompte === 672, "acompte");
assert(FINANCEMENT_OUSSARA_COMBLES.solde === 1008, "solde");
assert(FINANCEMENT_OUSSARA_COMBLES.acompte + FINANCEMENT_OUSSARA_COMBLES.solde === 1680, "40/60");
assert(RIB_OUSSARA_COMBLES.iban === "FR76 1695 8000 0186 6836 4808 772", "IBAN");
assert(RIB_OUSSARA_COMBLES.bic === "QNTOFRP1XXX", "BIC");
assert(RIB_OUSSARA_COMBLES.referenceVirement === "DEV-OUSSARA-COMBLES", "libellé");
assert(PROJET_OUSSARA_COMBLES_DEFAUT.id !== OUSSARA_DOSSIER_ID, "dossier distinct");

const fusion = fusionnerAvecDefautBrunel([]);
assert(fusion.some((item) => item.id === OUSSARA_COMBLES_DOSSIER_ID), "seed");
assert(fusion.some((item) => item.id === OUSSARA_DOSSIER_ID), "menuiseries conservées");
const audit = projetManuelVersAudit(PROJET_OUSSARA_COMBLES_DEFAUT);
assert(audit.caHt === 1400, `caHt ${audit.caHt}`);
assert(audit.caTtc === 1680, `caTtc ${audit.caTtc}`);
assert(audit.commission_rate_default === 0, "commission");
assert(audit.travaux.length === 5, "travaux");

const html = htmlContratPourDossier({}, { id: OUSSARA_COMBLES_DOSSIER_ID });
assert(html === htmlDevisOussaraCombles(), "html contrat");
for (const marque of [
  "DEV-2026-OUSSARA-COMBLES-01",
  "Youssef OUSSARA",
  "1 400,00",
  "280,00",
  "1 680,00",
  "672,00",
  "1 008,00",
  "49,00",
  "7,50",
  "350 mm",
  "ACERMI",
  "DEV-OUSSARA-COMBLES",
  RIB_OUSSARA_COMBLES.iban,
  "contact@renovoptim-ia.com",
  "energia-logo-arbres.png",
  "LUNPIB2604975",
  "Julia",
]) {
  assert(html.includes(marque), `manquant ${marque}`);
}
assert(!/damien/i.test(html), "Damien absent");
assert(!html.includes("06 72 68 09 68"), "numéro absent");
assert(!html.includes("0166 6836"), "IBAN invalide absent");
assert(!html.includes("15 240,00"), "montant menuiseries absent");
assert(nomFichierContrat({ id: OUSSARA_COMBLES_DOSSIER_ID }) === NOM_FICHIER_DEVIS_OUSSARA_COMBLES, "nom");
assert(cheminContratPublic(OUSSARA_COMBLES_DOSSIER_ID) === `/${NOM_FICHIER_DEVIS_OUSSARA_COMBLES}`, "chemin");

const marche = MARCHES.find((item) => item.id === OUSSARA_COMBLES_DOSSIER_ID);
assert(marche?.montantTtc === 1680, "marché");
assert(marche?.ref === OUSSARA_COMBLES_REFERENCE, "réf marché");
assert(marche?.acompteTtc === 672, "acompte marché");

const facture = saisieFactureOussaraCombles();
assert(facture.montantTtc === 1680, "facture");
assert(facture.pourcentageLibre === 40, "40 %");
assert(Math.round(facture.montantTtc * 0.4 * 100) / 100 === 672, "acompte facture");

const publicHtml = join(process.cwd(), "public", NOM_FICHIER_DEVIS_OUSSARA_COMBLES);
const publicPdf = join(process.cwd(), "public", NOM_FICHIER_PDF_OUSSARA_COMBLES);
assert(existsSync(publicHtml), "html public");
assert(existsSync(publicPdf), "pdf public");
assert(readFileSync(publicHtml, "utf8").includes("1 680,00"), "html à jour");
assert(readFileSync(publicPdf).subarray(0, 5).toString() === "%PDF-", "pdf");

console.log("OK — devis combles OUSSARA");
console.log(`  ${OUSSARA_COMBLES_REFERENCE} — 1 400,00 € HT — 1 680,00 € TTC`);
