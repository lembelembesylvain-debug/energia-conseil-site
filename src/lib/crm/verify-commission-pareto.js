/**
 * Contrôle de la double règle de commissionnement.
 * node src/lib/crm/verify-commission-pareto.js
 */
import {
  calculerCommissionOfficielle,
  simulerCommission,
} from "./commissionPareto.js";
import { TOTAUX_CLOISON_SDB } from "./cloisonSdbOfficiel.js";
import { TOTAUX_DAMIEN_PV_100KWC, PROJET_DAMIEN_PV_100KWC_DEFAUT } from "./damienPv100kwcOfficiel.js";
import { TOTAUX_MASSARDIER } from "./massardierLeadOfficiel.js";

function assert(condition, message) {
  if (!condition) {
    console.error("ÉCHEC", message);
    process.exit(1);
  }
}

const exemple = simulerCommission({ montantHt: 75000, coutHt: 55000, hauteValeur: true });
assert(exemple.margeBruteHt === 20000, "marge exemple 20 000");
assert(exemple.partApporteurHt === 6000, "apporteur exemple 6 000");
assert(exemple.partEnergiaHt === 14000, "ENERGIA exemple 14 000");

const residentiel = simulerCommission({ montantHt: 20000, coutHt: 12000, hauteValeur: false });
assert(residentiel.regle === "b2c" && residentiel.partApporteurHt === 2000, "B2C 10 %");

const cloison = calculerCommissionOfficielle({
  nom: "Cloison SDB",
  commissionDamienHt: TOTAUX_CLOISON_SDB.commissionDamienHt,
  caHt: TOTAUX_CLOISON_SDB.totalHt,
  coutAchatHt: TOTAUX_CLOISON_SDB.coutsTravauxHt,
});
assert(cloison.regle === "b2c" && cloison.partApporteurHt === 247, "cloison 247");

const massardier = calculerCommissionOfficielle({
  nom: "Cuisine Massardier",
  commissionDamienHt: TOTAUX_MASSARDIER.commissionDamienHt,
  caHt: TOTAUX_MASSARDIER.totalHt,
  coutAchatHt: TOTAUX_MASSARDIER.coutsTravauxHt,
});
assert(massardier.regle === "b2c" && massardier.partApporteurHt === 1818.18, "massardier 10 %");

const solaire = calculerCommissionOfficielle({
  id: PROJET_DAMIEN_PV_100KWC_DEFAUT.id,
  nom: PROJET_DAMIEN_PV_100KWC_DEFAUT.nom,
  categorie: "Photovoltaïque & Énergie",
  commissionDamienHt: TOTAUX_DAMIEN_PV_100KWC.commissionDamienHt,
  caHt: TOTAUX_DAMIEN_PV_100KWC.totalHt,
  coutAchatHt: TOTAUX_DAMIEN_PV_100KWC.coutsTravauxHt,
});
assert(solaire.regle === "pareto", "100 kWc en Pareto");
assert(solaire.margeBruteHt === 18000, "marge réelle 18 000");
assert(solaire.partApporteurHt === 5400, "30 % = 5 400");
assert(solaire.partEnergiaHt === 12600, "70 % = 12 600");

assert(calculerCommissionOfficielle({ nom: "Brunel", caHt: 31733, coutAchatHt: 20000, commissionDamienHt: 0 }) == null, "sans commission stockée");

console.log("commission Pareto OK");
