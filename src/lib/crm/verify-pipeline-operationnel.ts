/**
 * Contrôles pipeline opérationnel CRM — Brunel option 1, CA 223 134 €, marge 10 400 € HT.
 * Exécution : npx tsx src/lib/crm/verify-pipeline-operationnel.ts
 */

import { AUDITS_TEST_LOCAUX } from "./mockData.js";
import {
  FINANCEMENT_BRUNEL_V4,
  MARGE_NETTE_DIRECTION_BRUNEL,
  STATUT_DOSSIER_BRUNEL_V4,
  TOTAUX_BRUNEL_V4,
  totauxContractuelsBrunelV4,
} from "./brunelDevisV3Officiel.js";
import { PROJET_BRUNEL_DEFAUT, projetManuelVersAudit } from "./projetsManuels.js";
import { PROJET_PEREIRA_NERVIEUX_DEFAUT } from "./pereiraNervieuxOfficiel.js";
import { PROJET_GILBERTAS_DEFAUT } from "./gilbertasClermontOfficiel.js";
import { PROJET_MASSARDIER_DEFAUT } from "./massardierLeadOfficiel.js";
import { PROJET_CLOISON_SDB_DEFAUT } from "./cloisonSdbOfficiel.js";
import { PROJET_DAMIEN_PV_100KWC_DEFAUT } from "./damienPv100kwcOfficiel.js";
import { PROJET_GESNOUIN_DEFAUT } from "./gesnouinBatterieOfficiel.js";
import {
  CA_PREVISIONNEL_OPERATIONNEL_TTC,
  calculerCaPrevisionnelOperationnel,
  calculerMargeNetteSanctuarisee,
  calculerTresorerieEngagee,
} from "./pipelineOperationnel";
import {
  ETAPES_ANAH,
  calculerCommissionCatarina,
  infererSourceApporteur,
  libelleParcoursAnah,
  peutPlanifierVisiteTechnique,
  peutPasserAuJalon,
} from "./operationnelCrm.js";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

function round2(n: number) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

const totaux = totauxContractuelsBrunelV4();
assert(totaux.lignes.length === 8, "8 postes V4");
assert(totaux.totalHt === 35192.41, `HT V4 ${totaux.totalHt}`);
assert(totaux.totalTva === 1935.58, `TVA V4 ${totaux.totalTva}`);
assert(totaux.totalTtc === 37127.99, `TTC V4 ${totaux.totalTtc}`);
assert(totaux.totalHt === TOTAUX_BRUNEL_V4.totalHt, "constante HT V4");
assert(totaux.totalTtc === TOTAUX_BRUNEL_V4.totalTtc, "constante TTC V4");
assert(totaux.lignes[3].totalHt === 1950, "porte d’entrée 1 950 HT");
assert(totaux.lignes[7].totalHt === 5200, "Direction 5 200 HT");
assert(totaux.lignes[7].totalTtc === 5486, "Direction 5 486 TTC");
assert(
  round2(FINANCEMENT_BRUNEL_V4.acompte + FINANCEMENT_BRUNEL_V4.intermediaire + FINANCEMENT_BRUNEL_V4.solde) ===
    TOTAUX_BRUNEL_V4.totalTtc,
  "échéancier 30/40/30 = TTC V4",
);
assert(FINANCEMENT_BRUNEL_V4.acompte === 11138.4, "acompte 11 138,40");
assert(FINANCEMENT_BRUNEL_V4.intermediaire === 14851.2, "démarrage 14 851,20");
assert(FINANCEMENT_BRUNEL_V4.solde === 11138.39, "solde 11 138,39");
assert(MARGE_NETTE_DIRECTION_BRUNEL.ht === 5200, "marge Direction HT");
assert(STATUT_DOSSIER_BRUNEL_V4.includes("Contrat Contractant Général"), "statut contrat validé");
assert(STATUT_DOSSIER_BRUNEL_V4.includes("attente signature"), "statut attente signature indivision");

const brunel = projetManuelVersAudit(PROJET_BRUNEL_DEFAUT);
const pereiraDemo = AUDITS_TEST_LOCAUX.find((item) => item.id === "demo-pereira");
const gilbertas = projetManuelVersAudit(PROJET_GILBERTAS_DEFAUT);
const massardier = projetManuelVersAudit(PROJET_MASSARDIER_DEFAUT);
const cloisonSdb = projetManuelVersAudit(PROJET_CLOISON_SDB_DEFAUT);
const damienPv = projetManuelVersAudit(PROJET_DAMIEN_PV_100KWC_DEFAUT);
const gesnouin = projetManuelVersAudit(PROJET_GESNOUIN_DEFAUT);
const pereiraOfficielAudit = projetManuelVersAudit(PROJET_PEREIRA_NERVIEUX_DEFAUT);
assert(pereiraDemo?.caTtc === 46758.4, "Pereira démo 46 758,40 TTC");
assert(brunel.caTtc === 33478.53, "Brunel option 1 33 478,53 TTC");
assert(gilbertas.caTtc === 37600, "Gilbertas 37 600 TTC");
assert(massardier.caTtc === 20000, "Massardier 20 000 TTC");
assert(cloisonSdb.caTtc === 2717, "Cloison SDB 2 717 TTC");
assert(damienPv.caTtc === 106800, "Damien PV 106 800 TTC");
assert(gesnouin.caTtc === 1068, "Gesnouin 1 068 TTC");

const ca = calculerCaPrevisionnelOperationnel([
  pereiraDemo!,
  brunel,
  pereiraOfficielAudit,
  gilbertas,
  massardier,
  cloisonSdb,
  damienPv,
  gesnouin,
]);
assert(ca === 234064, `CA prévisionnel ${ca} ≠ 234 064`);
assert(CA_PREVISIONNEL_OPERATIONNEL_TTC === 234064, "constante CA opérationnel");
assert(Math.round(ca) === 234064, "affichage 234 064 €");

const marge = calculerMargeNetteSanctuarisee([pereiraDemo!, brunel]);
assert(marge.totalHt === 10400, `marge sanctuarisée ${marge.totalHt} ≠ 10 400`);
assert(marge.nbDossiers === 2, "2 postes Direction");
assert(marge.lignes.every((ligne) => ligne.ht === 5200), "5 200 HT par dossier");

assert(infererSourceApporteur({ apporteurNom: "Damien Richards" }) === "courtier_fabien", "Ancien alias Damien Richards");
assert(infererSourceApporteur({ apporteurNom: "Damien (Commercial)" }) === "damien", "Damien = source Damien");
assert(infererSourceApporteur({ apporteurNom: "Catarina Martins" }) === "catarina_martins", "Catarina");
assert(infererSourceApporteur({ apporteurNom: "Romain BET Nomos" }) === "romain_bet_nomos", "Romain BET Nomos");
assert(infererSourceApporteur({ apporteurNom: "Fabien Vivons Courtier" }) === "courtier_fabien", "Fabien");
assert(infererSourceApporteur({}) === "direct_energia", "défaut Direct / Aucun");
assert(libelleParcoursAnah("audit_reglementaire") === "Audit réglementaire réalisé", "parcours ANAH jalon 1");
assert(
  libelleParcoursAnah("accord_indivision") === "Audit réglementaire réalisé",
  "ancien id accord_indivision → jalon 1",
);
assert(ETAPES_ANAH.length === 5, "5 jalons réglementaires");
assert(ETAPES_ANAH[1].compactLabel === "Validation MAR & Financement bancaire", "jalon 2");
assert(ETAPES_ANAH[1].sousTexte === "Verrou obligatoire avant signature devis", "sous-texte verrou");
assert(ETAPES_ANAH[2].compactLabel === "Marché signé & Acompte 30 %", "jalon 3");
assert(ETAPES_ANAH[3].compactLabel === "Dépôt MPR & Accord ANAH", "jalon 4");
assert(ETAPES_ANAH[4].compactLabel === "Réception travaux & Primes versées", "jalon 5");
assert(
  !peutPlanifierVisiteTechnique({ etapeAnah: "marche_signe_acompte", acompte30Encaisse: false }),
  "VT bloquée sans acompte explicite",
);
assert(
  !peutPlanifierVisiteTechnique({ etapeAnah: "validation_mar_financement", acompte30Encaisse: true }),
  "VT bloquée avant le jalon 3",
);
assert(
  peutPlanifierVisiteTechnique({ etapeAnah: "marche_signe_acompte", acompte30Encaisse: true }),
  "VT autorisée au jalon 3 après encaissement",
);
assert(
  peutPasserAuJalon({ etapeAnah: "validation_mar_financement", validationMar: false }, "marche_signe_acompte") === false,
  "jalon 3 bloqué sans validation MAR",
);
assert(
  peutPasserAuJalon({ etapeAnah: "validation_mar_financement", validationMar: true }, "marche_signe_acompte") === true,
  "jalon 3 ouvert après validation MAR",
);
assert(
  peutPasserAuJalon({ etapeAnah: "audit_reglementaire", validationMar: false }, "validation_mar_financement") === true,
  "passage au jalon 2 autorisé",
);

const commissionBrunel = calculerCommissionCatarina({ consultationDuo: true, montantTravauxHt: 31733.21 });
assert(commissionBrunel.reversementDuoTtc === 234, "Duo Catarina 234 € TTC");
assert(commissionBrunel.partEnergiaDuoTtc === 156, "Duo Energia 156 € TTC");
assert(commissionBrunel.commissionTravauxHt === 3173.32, `travaux 10 % ${commissionBrunel.commissionTravauxHt}`);
assert(commissionBrunel.forfaitCoordinationHt === 1500, "forfait coordination Catarina 1 500 HT");
assert(commissionBrunel.totalPartenaireEstimeHt === 4673.32, "rémunération estimée Catarina 4 673,32 HT");
const coordinationJalon3 = calculerCommissionCatarina({ montantTravauxHt: 31733.21, etapeAnah: "marche_signe_acompte" });
assert(coordinationJalon3.forfaitCoordinationDuHt === 1500, "forfait déclenché au jalon 3");
assert(coordinationJalon3.commissionTravauxDueHt === 0, "commission travaux non déclenchée au jalon 3");
const remunerationJalon5 = calculerCommissionCatarina({ montantTravauxHt: 31733.21, etapeAnah: "chantier_receptionne" });
assert(remunerationJalon5.commissionTravauxDueHt === 3173.32, "commission travaux déclenchée au jalon 5");
assert(remunerationJalon5.totalDeclencheHt === 4673.32, "total déclenché au jalon 5");

const pereiraOfficiel = pereiraOfficielAudit;
assert(pereiraOfficiel.caHt === 30710.9, "Pereira 30 710,90 HT");
assert(pereiraOfficiel.caTtc === 32400, "Pereira 32 400,00 TTC");
assert(pereiraOfficiel.margeDirectionHt === 5200, "Pereira marge CG 5 200 HT");
assert(pereiraOfficiel.etapeAnah === "validation_mar_financement", "Pereira jalon 2");
assert(brunel.etapeAnah === "validation_mar_financement", "Brunel jalon 2");
assert(brunel.caHt === 31733.21, "Brunel 31 733,21 HT");
assert(brunel.validationMar === false, "Brunel en attente MAR");

const treso = calculerTresorerieEngagee([pereiraOfficiel, brunel, gilbertas]);
assert(treso.nbDossiers === 3, "3 acomptes officiels (Pereira + Brunel + Gilbertas)");
assert(treso.totalEngage === round2(5070 + 33478.53 * 0.3 + 37600 * 0.3), "trésorerie acomptes des 3 marchés");
assert(treso.totalARecevoir === treso.totalEngage, "acomptes non reçus tant que signature en attente");

console.log(
  "OK — pipeline opérationnel : Brunel 33 478,53 TTC, CA 234 064, marge 10 400 HT, Gilbertas 37 600, Massardier 20 000, Cloison SDB 2 717, PV 100 kWc 106 800, Gesnouin 1 068.",
);
