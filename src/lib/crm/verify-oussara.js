/**
 * Contrôles dossier M. et Mme Youssef OUSSARA — avenant DEV-2026-OUSSARA-02.
 * 13 000 HT brut − 300 geste = 12 700 HT · TVA 20 % 2 540 · 15 240 TTC.
 * Échéancier 6 096 / 6 096 / 3 048. RIB Qonto officiel (clé IBAN valide).
 * Exécution : npx tsx src/lib/crm/verify-oussara.js
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  FINANCEMENT_OUSSARA,
  NOM_FICHIER_DEVIS_OUSSARA,
  NOM_FICHIER_PDF_OUSSARA,
  OUSSARA_DOSSIER_ID,
  OUSSARA_REFERENCE,
  POSTES_OUSSARA_DEVIS,
  PROJET_OUSSARA_DEFAUT,
  RIB_OUSSARA,
  STATUT_OUSSARA,
  TOTAUX_OUSSARA,
  htmlDevisOussara,
} from "./oussaraColombierOfficiel.js";
import { fusionnerAvecDefautBrunel, projetManuelVersAudit } from "./projetsManuels.js";
import { cheminContratPublic, htmlContratPourDossier, nomFichierContrat } from "./htmlContratCrm.js";
import { MARCHES } from "../../components/crm/ModulesStrategiquesCrm.jsx";
import { saisieFactureOussara } from "../../components/crm/FactureAcompteModal.tsx";
import { saisieOussara } from "../../components/crm/BonDeCommandeArtisanModal.tsx";
import { calculerFinancesProjet } from "./finances.ts";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(POSTES_OUSSARA_DEVIS.length === 14, "14 postes");
assert(POSTES_OUSSARA_DEVIS.some((poste) => /2,40/.test(poste.nom) && /RAL 7016/.test(poste.nom)), "baie 2,40");
assert(POSTES_OUSSARA_DEVIS.some((poste) => /A2P/.test(poste.nom)), "porte A2P");
assert(POSTES_OUSSARA_DEVIS.some((poste) => /11 volets/i.test(poste.nom)), "11 volets");
assert(TOTAUX_OUSSARA.totalHtBrut === 13000, "brut");
assert(TOTAUX_OUSSARA.gesteCommercialHt === 300, "geste");
assert(TOTAUX_OUSSARA.totalHt === 12700, "net HT");
assert(TOTAUX_OUSSARA.totalTva === 2540, "TVA");
assert(TOTAUX_OUSSARA.totalTtc === 15240, "TTC");
assert(TOTAUX_OUSSARA.coutsTravauxHt == null, "pas d'ancien déboursé");
assert(TOTAUX_OUSSARA.margeBruteHt == null, "pas d'ancienne marge");
assert(FINANCEMENT_OUSSARA.acompte === 6096, "acompte 1");
assert(FINANCEMENT_OUSSARA.intermediaire === 6096, "acompte 2");
assert(FINANCEMENT_OUSSARA.solde === 3048, "solde");
assert(
  FINANCEMENT_OUSSARA.acompte + FINANCEMENT_OUSSARA.intermediaire + FINANCEMENT_OUSSARA.solde === 15240,
  "échéancier 40/40/20",
);
assert(RIB_OUSSARA.iban === "FR76 1695 8000 0186 6836 4808 772", "IBAN officiel");
assert(RIB_OUSSARA.bic === "QNTOFRP1XXX", "BIC Qonto");
assert(RIB_OUSSARA.referenceVirement === "DEV-OUSSARA", "référence virement");
assert(PROJET_OUSSARA_DEFAUT.id === OUSSARA_DOSSIER_ID, "id");
assert(PROJET_OUSSARA_DEFAUT.statut === STATUT_OUSSARA, "statut");
assert(PROJET_OUSSARA_DEFAUT.nom.includes("Youssef"), "Youssef");
assert(PROJET_OUSSARA_DEFAUT.adresse.includes("69124"), "adresse");
assert(PROJET_OUSSARA_DEFAUT.adresse.toLowerCase().includes("verch"), "rue");

const fusion = fusionnerAvecDefautBrunel([
  {
    id: OUSSARA_DOSSIER_ID,
    statut: "Devis n°1 Contractant Général émis — En attente signature",
    prenom: "M. et Mme",
    adresse: "ancienne adresse",
    montantHt: 21460,
    montantEstimeTtc: 25752,
    description: "ancienne marge 9 710",
  },
]);
const stocke = fusion.find((item) => item.id === OUSSARA_DOSSIER_ID);
assert(stocke.statut === STATUT_OUSSARA, "statut verrouillé");
assert(stocke.prenom === "Youssef", "prénom verrouillé");
assert(stocke.montantHt === 12700, "HT verrouillé");
assert(stocke.montantEstimeTtc === 15240, "TTC verrouillé");
assert(!String(stocke.description).includes("9 710"), "description sans ancienne marge");

const audit = projetManuelVersAudit(PROJET_OUSSARA_DEFAUT);
assert(audit.caHt === 12700, `caHt ${audit.caHt}`);
assert(audit.caTtc === 15240, `caTtc ${audit.caTtc}`);
assert(audit.margeBruteHt == null, "marge audit vide");
assert(audit.coutArtisanHt == null, "coût artisan vide");
assert(audit.travaux.length === 14, "travaux audit");
assert(audit.commission_rate_default === 0, "pas de commission 10 %");

const finances = calculerFinancesProjet({
  venteHt: audit.caHt,
  coutArtisanHt: audit.coutArtisanHt,
  commission_rate_default: audit.commission_rate_default,
  partner_commission: 0,
});
assert(finances.net_margin == null, `marge nette non chiffrée ${finances.net_margin}`);

const html = htmlContratPourDossier({}, { id: OUSSARA_DOSSIER_ID });
assert(html === htmlDevisOussara(), "html contrat");
for (const marque of [
  "DEV-2026-OUSSARA-02",
  "Youssef OUSSARA",
  "13 000,00",
  "12 700,00",
  "2 540,00",
  "15 240,00",
  "6 096,00",
  "3 048,00",
  "DEV-OUSSARA",
  RIB_OUSSARA.iban,
  RIB_OUSSARA.bic,
  "Bon pour accord et commande ferme",
  "contact@renovoptim-ia.com",
  "energia-logo-arbres.png",
  "5213845",
  "LUNPIB2604975",
  "28/30",
  "FR01941819427",
  "Bureau d'Études Thermiques",
  "Julia",
]) {
  assert(html.includes(marque), `html manquant : ${marque}`);
}
assert(/interlocuteur unique/i.test(html), "interlocuteur unique");
assert(!html.includes("Interlocuteur commercial"), "ligne commerciale absente");
assert(!/damien/i.test(html), "Damien absent du devis");
assert(!html.includes("06 72 68 09 68"), "numéro Damien absent");
assert(!html.includes("21 460"), "ancien HT absent");
assert(!html.includes("25 752"), "ancien TTC absent");
assert(!html.includes("9 710,00"), "ancienne marge absente");
assert(!html.includes("11 750,00"), "ancien déboursé absent");
assert(!html.includes("0166 6836"), "IBAN invalide absent");
assert(!html.includes("30/40/30"), "ancien échéancier absent");
assert(nomFichierContrat({ id: OUSSARA_DOSSIER_ID }) === NOM_FICHIER_DEVIS_OUSSARA, "nom fichier");
assert(cheminContratPublic(OUSSARA_DOSSIER_ID) === `/${NOM_FICHIER_DEVIS_OUSSARA}`, "chemin");

const marche = MARCHES.find((item) => item.id === OUSSARA_DOSSIER_ID);
assert(marche, "marché Devis & Marchés");
assert(marche.montantTtc === 15240, "montant marché");
assert(marche.ref === OUSSARA_REFERENCE, "référence");
assert(marche.tauxTva === 20, "tva marché");
assert(marche.acompteTtc === 6096, "acompte marché");
assert(!String(marche.precision).includes("9 710"), "précision sans ancienne marge");

const facture = saisieFactureOussara();
assert(facture.tauxTva === 20, "facture tva");
assert(facture.montantTtc === 15240, "facture ttc");
assert(facture.pourcentageLibre === 40, "facture 40 %");
assert(Math.round(facture.montantTtc * 0.4 * 100) / 100 === 6096, "acompte facture");

const bdc = saisieOussara();
assert(bdc.montantHt !== 11750, "bdc sans ancien déboursé");
assert(bdc.referenceMarche === OUSSARA_REFERENCE, "bdc ref");

const publicHtml = join(process.cwd(), "public", NOM_FICHIER_DEVIS_OUSSARA);
const publicPdf = join(process.cwd(), "public", NOM_FICHIER_PDF_OUSSARA);
assert(existsSync(publicHtml), "html public");
assert(existsSync(publicPdf), "pdf public");
assert(readFileSync(publicHtml, "utf8").includes("15 240,00"), "html public à jour");
assert(readFileSync(publicPdf).subarray(0, 5).toString() === "%PDF-", "pdf signature");

console.log("OK — dossier OUSSARA Colombier-Saugnieu");
console.log(`  ${OUSSARA_REFERENCE} — 12 700,00 € HT — 15 240,00 € TTC — acompte 6 096,00 €`);
