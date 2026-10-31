/**
 * Contrôles dossier Joël GESNOUIN — 890 HT / 1 068 TTC.
 * Exécution : npx tsx src/lib/crm/verify-gesnouin.js
 */

import {
  FINANCEMENT_GESNOUIN,
  GESNOUIN_CLIENT_ID,
  GESNOUIN_DOSSIER_ID,
  GESNOUIN_REFERENCE,
  POSTES_GESNOUIN_CONTRAT,
  PROJET_GESNOUIN_DEFAUT,
  TOTAUX_GESNOUIN,
} from "./gesnouinBatterieOfficiel.js";
import {
  fusionnerAvecDefautBrunel,
  projetManuelVersAudit,
} from "./projetsManuels.js";
import { CA_PREVISIONNEL_OPERATIONNEL_TTC, calculerCaPrevisionnelOperationnel } from "./pipelineOperationnel.ts";
import { htmlContratPourDossier } from "./htmlContratCrm.js";
import { payloadContratGesnouinOfficiel } from "./payloadContratCrm.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const htPostes = POSTES_GESNOUIN_CONTRAT.reduce((s, p) => s + p.totalHt, 0);
assert(htPostes === 890, `somme postes HT ${htPostes}`);
assert(TOTAUX_GESNOUIN.totalHt === 890, "totalHt");
assert(TOTAUX_GESNOUIN.totalTva === 178, "totalTva");
assert(TOTAUX_GESNOUIN.totalTtc === 1068, "totalTtc");
assert(TOTAUX_GESNOUIN.coutsTravauxHt === 490, "artisan 490");
assert(TOTAUX_GESNOUIN.margeNetteEnergiaHt === 400, "marge 400");
assert(FINANCEMENT_GESNOUIN.acompte === 320.4, "acompte");
assert(FINANCEMENT_GESNOUIN.solde === 747.6, "solde");
assert(PROJET_GESNOUIN_DEFAUT.clientId === GESNOUIN_CLIENT_ID, "clientId");
assert(PROJET_GESNOUIN_DEFAUT.email === "joel.gesnouin@gmail.com", "email");
assert(PROJET_GESNOUIN_DEFAUT.telephone === "06 72 78 71 11", "tel");

const fusion = fusionnerAvecDefautBrunel([]);
assert(fusion.some((item) => item.id === GESNOUIN_DOSSIER_ID), "fusion seed Gesnouin");

const audit = projetManuelVersAudit(PROJET_GESNOUIN_DEFAUT);
assert(audit.caTtc === 1068, "audit caTtc");
assert(audit.caHt === 890, "audit caHt");
assert(audit.auditId === GESNOUIN_REFERENCE, "réf devis");

const payload = payloadContratGesnouinOfficiel();
assert(payload.totaux.totalTtc === 1068, "payload TTC");
const html = htmlContratPourDossier({}, { id: GESNOUIN_DOSSIER_ID });
assert(html.includes("1 068,00") || html.includes("1068"), "HTML TTC");
assert(/GESNOUIN/i.test(html), "HTML client");

const ca = calculerCaPrevisionnelOperationnel([
  ...fusion.map(projetManuelVersAudit),
]);
assert(ca >= CA_PREVISIONNEL_OPERATIONNEL_TTC - 1, `CA live ${ca} vs const ${CA_PREVISIONNEL_OPERATIONNEL_TTC}`);

console.log(
  `OK — Gesnouin ${GESNOUIN_REFERENCE} : 890 HT / 1 068 TTC, marge 400 HT, CA prévisionnel ${CA_PREVISIONNEL_OPERATIONNEL_TTC}.`,
);
