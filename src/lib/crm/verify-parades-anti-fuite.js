/**
 * Contrôles des parades anti-fuite.
 * Exécution : node src/lib/crm/verify-parades-anti-fuite.js
 */

import {
  ASSURANCE_CALIPSO,
  CLAUSE_DEDUCTION_INGENIERIE,
  FORFAIT_INGENIERIE_HT,
  FORFAIT_INGENIERIE_TTC,
  FORFAIT_INGENIERIE_TVA,
  RIB_QONTO,
  analyserEcartBudget,
  calculerDoubleOption,
  htmlConventionIngenierie,
  qualificationComplete,
  qualificationVide,
} from "./paradesAntiFuite.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const vide = qualificationVide();
assert(qualificationComplete(vide) === false, "qualification vide incomplète");
assert(
  qualificationComplete({
    budgetMaxTtc: 20000,
    origineFonds: "epargne",
    decisionnaires: "proprietaire_unique",
    statutFaisabilite: "qualifie_solvable",
  }),
  "qualification complète",
);

const sousSeuil = analyserEcartBudget(10000, 12000);
assert(sousSeuil.alerte === false, "20 % pile ne déclenche pas l'alerte");
const alerte = analyserEcartBudget(10000, 12001);
assert(alerte.alerte === true && alerte.severe === false, "dépassement > 20 % en alerte orange");
const severe = analyserEcartBudget(10000, 15000);
assert(severe.severe === true, "dépassement > 40 % sévère");

const lots = [
  { id: "cuisine", nom: "Cuisine posée", totalTtc: 8000, pack: "essentiel", phase: "phase2" },
  { id: "sols", nom: "Sols LVT", totalTtc: 2500, pack: "essentiel", phase: "phase2" },
  { id: "peinture", nom: "Peinture complète 280 m²", totalTtc: 6000, pack: "signature", phase: "phase2" },
  { id: "combles", nom: "Isolation combles", totalTtc: 4000, pack: "essentiel", phase: "phase1" },
];

const anah = calculerDoubleOption(lots, { accordAnahNotifie: false }, { masquerPhase2: true });
assert(anah.phase2Masquee === true, "phase 2 masquée sans accord");
assert(anah.phase1.total === 4000, `phase 1 = 4000, obtenu ${anah.phase1.total}`);
assert(anah.essentiels.total === 4000, "option 1 du devis Anah = seulement le lot aidé");
assert(anah.signature.total === 4000, "option 2 du devis Anah n'embarque pas la phase 2");
assert(anah.essentiels.acompte30 === 1200, "acompte 30 % phase 1");

const apresAccord = calculerDoubleOption(lots, { accordAnahNotifie: true }, { masquerPhase2: true });
assert(apresAccord.phase2Masquee === false, "phase 2 visible après accord");
assert(apresAccord.essentiels.total === 14500, `essentiel après accord ${apresAccord.essentiels.total}`);
assert(apresAccord.signature.total === 20500, `signature après accord ${apresAccord.signature.total}`);
assert(apresAccord.signature.acompte30 === 6150, "acompte 30 % signature");

const html = htmlConventionIngenierie({ client: "MARTIN", reference: "CONV-TEST" });
assert(html.includes("Convention d'assistance"), "titre convention");
assert(html.includes(CLAUSE_DEDUCTION_INGENIERIE), "clause de déduction intégrale");
assert(html.includes("990,00 € TTC"), "forfait 990");
assert(html.includes(ASSURANCE_CALIPSO), "Calipso");
assert(html.includes("5213845"), "INPI");
assert(html.includes(RIB_QONTO.iban), "IBAN Qonto");
assert(html.includes("energia-logo-arbres.png"), "logo 3 arbres");
assert(FORFAIT_INGENIERIE_HT + FORFAIT_INGENIERIE_TVA === FORFAIT_INGENIERIE_TTC, "HT + TVA = TTC");

console.log("Parades anti-fuite : OK");
