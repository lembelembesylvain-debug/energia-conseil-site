/**
 * Contrôles dossier Damien PV 100 kWc Ardèche + contrat HTML 5 postes.
 * Exécution : npx tsx src/lib/crm/verify-damien-pv-100kwc.js
 */

import {
  DAMIEN_PV_100KWC_DOSSIER_ID,
  DAMIEN_PV_100KWC_REFERENCE,
  FINANCEMENT_DAMIEN_PV_100KWC,
  POSTES_DAMIEN_PV_100KWC_CONTRAT,
  PROJET_DAMIEN_PV_100KWC_DEFAUT,
  STATUT_DAMIEN_PV_100KWC,
  TOTAUX_DAMIEN_PV_100KWC,
  postesContractuels,
  travauxCoches,
} from "./damienPv100kwcOfficiel.js";
import {
  etapeDepuisStatutManuel,
  fusionnerAvecDefautBrunel,
  PROJET_BRUNEL_DEFAUT,
  projetManuelVersAudit,
} from "./projetsManuels.js";
import { PROJET_PEREIRA_NERVIEUX_DEFAUT } from "./pereiraNervieuxOfficiel.js";
import { PROJET_GILBERTAS_DEFAUT } from "./gilbertasClermontOfficiel.js";
import { PROJET_MASSARDIER_DEFAUT } from "./massardierLeadOfficiel.js";
import { PROJET_CLOISON_SDB_DEFAUT } from "./cloisonSdbOfficiel.js";
import { PROJET_GESNOUIN_DEFAUT } from "./gesnouinBatterieOfficiel.js";
import {
  CA_PREVISIONNEL_OPERATIONNEL_TTC,
  calculerCaPrevisionnelOperationnel,
} from "./pipelineOperationnel.ts";
import { htmlContratPourDossier, nomFichierContrat } from "./htmlContratCrm.js";
import { payloadContratDamienPv100kwcOfficiel } from "./payloadContratCrm.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

assert(PROJET_DAMIEN_PV_100KWC_DEFAUT.id === DAMIEN_PV_100KWC_DOSSIER_ID, "id");
assert(PROJET_DAMIEN_PV_100KWC_DEFAUT.reference === DAMIEN_PV_100KWC_REFERENCE, "référence");
assert(PROJET_DAMIEN_PV_100KWC_DEFAUT.statut === STATUT_DAMIEN_PV_100KWC, "statut");
assert(PROJET_DAMIEN_PV_100KWC_DEFAUT.apporteurNom === "Damien (Éco-Technicien BtoC)", "apporteur");
assert(TOTAUX_DAMIEN_PV_100KWC.totalHt === 89000, "HT 89 000");
assert(TOTAUX_DAMIEN_PV_100KWC.totalTtc === 106800, "TTC 106 800");
assert(TOTAUX_DAMIEN_PV_100KWC.tauxTva === 0.2, "TVA 20 %");
assert(TOTAUX_DAMIEN_PV_100KWC.commissionDamienHt === 3500, "commission 3 500");
assert(TOTAUX_DAMIEN_PV_100KWC.margeNetteEnergiaHt === 14500, "marge CG 14 500");
assert(etapeDepuisStatutManuel(STATUT_DAMIEN_PV_100KWC) === "nouveau", "pipeline Nouveau");

assert(POSTES_DAMIEN_PV_100KWC_CONTRAT.length === 5, "5 postes");
assert(postesContractuels.length === 5 && travauxCoches.length === 5, "alias postes");
assert(
  POSTES_DAMIEN_PV_100KWC_CONTRAT.reduce((s, p) => s + p.totalHt, 0) === 89000,
  "somme HT postes",
);
assert(
  POSTES_DAMIEN_PV_100KWC_CONTRAT.reduce((s, p) => s + p.totalTtc, 0) === 106800,
  "somme TTC postes",
);
assert(POSTES_DAMIEN_PV_100KWC_CONTRAT[1].quantite === 200 && POSTES_DAMIEN_PV_100KWC_CONTRAT[1].puHt === 197.5, "modules");
assert(FINANCEMENT_DAMIEN_PV_100KWC.acompte === 32040, "acompte 32 040");
assert(FINANCEMENT_DAMIEN_PV_100KWC.intermediaire === 42720, "intermédiaire 42 720");
assert(FINANCEMENT_DAMIEN_PV_100KWC.solde === 32040, "solde 32 040");

const audit = projetManuelVersAudit(PROJET_DAMIEN_PV_100KWC_DEFAUT);
assert(audit.etape === "nouveau", "étape nouveau");
assert(audit.caHt === 89000, "caHt");
assert(audit.caTtc === 106800, "caTtc");
assert(audit.commissionDamienHt === 3500, "commission audit");
assert(audit.margeNetteEnergiaHt === 14500, "marge audit");
assert(audit.auditId === DAMIEN_PV_100KWC_REFERENCE, "auditId");
assert(audit.categorie === "Photovoltaïque & Énergie", "catégorie");
assert(audit.detailsTechniques?.puissanceKwc === 100, "100 kWc");
assert(audit.travaux.length === 5, "5 travaux audit");

const fusion = fusionnerAvecDefautBrunel([]);
assert(fusion.some((item) => item.id === DAMIEN_PV_100KWC_DOSSIER_ID), "fusion seed");

const ca = calculerCaPrevisionnelOperationnel([
  projetManuelVersAudit(PROJET_PEREIRA_NERVIEUX_DEFAUT),
  projetManuelVersAudit(PROJET_BRUNEL_DEFAUT),
  projetManuelVersAudit(PROJET_GILBERTAS_DEFAUT),
  projetManuelVersAudit(PROJET_MASSARDIER_DEFAUT),
  projetManuelVersAudit(PROJET_CLOISON_SDB_DEFAUT),
  audit,
  projetManuelVersAudit(PROJET_GESNOUIN_DEFAUT),
]);
assert(ca === 234064, `CA prévisionnel ${ca} ≠ 237 971`);
assert(CA_PREVISIONNEL_OPERATIONNEL_TTC === 234064, "constante CA 237 971");

const payload = payloadContratDamienPv100kwcOfficiel();
assert(payload.postes.length === 5, "payload 5 postes");
assert(payload.totaux.totalTtc === 106800, "payload TTC");
assert(payload.echeancier.acompte === 32040, "payload acompte");
assert(payload.postes.every((p) => Number(p.totalTtc) > 0), "postes non nuls");

const html = htmlContratPourDossier({}, { id: DAMIEN_PV_100KWC_DOSSIER_ID });
assert(html.includes("106 800,00"), "HTML TTC");
assert(html.includes("89 000,00"), "HTML HT");
assert(html.includes("17 800,00"), "HTML TVA");
assert(html.includes("32 040,00"), "HTML acompte");
assert(html.includes("42 720,00"), "HTML intermédiaire");
assert(html.includes("Exploitation Tertiaire / Agricole"), "HTML client");
assert(/TOPCon/i.test(html), "HTML TOPCon");
assert(/QualiPV/i.test(html), "HTML QualiPV");
assert(html.includes("TOTAL FERME ET DÉFINITIF TTC : 106 800,00"), "HTML total ferme");
assert(
  nomFichierContrat({ id: DAMIEN_PV_100KWC_DOSSIER_ID }) === "CONTRAT_DAMIEN_PV_100KWC_HANGAR_2026_FINAL.html",
  "nom fichier",
);

console.log("OK — Damien PV 100 kWc : 5 postes, 106 800 TTC, échéancier 32 040 / 42 720 / 32 040, contrat HTML chiffré.");
