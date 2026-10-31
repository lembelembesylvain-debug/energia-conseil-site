/**
 * Contrôles dossier Gilbertas Clermont + CA prévisionnel (marché global 37 600 € TTC).
 * Exécution : node src/lib/crm/verify-gilbertas.js
 */

import {
  CLAUSES_PLANNING_GILBERTAS,
  CLIENT_GILBERTAS,
  EQUIPE_GILBERTAS,
  FACTURE_ACOMPTE_GILBERTAS,
  GILBERTAS_DOSSIER_ID,
  GILBERTAS_REFERENCE,
  LIEU_EXECUTION_GILBERTAS,
  LOTS_GILBERTAS,
  PROJET_GILBERTAS_DEFAUT,
  RIB_REGLEMENT_GILBERTAS,
  TOTAUX_GILBERTAS,
} from "./gilbertasClermontOfficiel.js";
import { PROJET_BRUNEL_DEFAUT, fusionnerAvecDefautBrunel, projetManuelVersAudit, sanitiserProjetPourRole } from "./projetsManuels.js";
import { PROJET_PEREIRA_NERVIEUX_DEFAUT } from "./pereiraNervieuxOfficiel.js";
import { PROJET_MASSARDIER_DEFAUT } from "./massardierLeadOfficiel.js";
import { PROJET_CLOISON_SDB_DEFAUT } from "./cloisonSdbOfficiel.js";
import { PROJET_DAMIEN_PV_100KWC_DEFAUT } from "./damienPv100kwcOfficiel.js";
import { PROJET_GESNOUIN_DEFAUT } from "./gesnouinBatterieOfficiel.js";
import {
  CA_PREVISIONNEL_OPERATIONNEL_TTC,
  calculerCaPrevisionnelOperationnel,
} from "./pipelineOperationnel.ts";
import { ROLE_ADMIN, ROLE_COMMERCIAL } from "./roles.js";
import { sanitiserProjetPourVueHub, VUE_HUB_AMO, VUE_HUB_SUPER_ADMIN } from "./operationnelCrm.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

assert(PROJET_GILBERTAS_DEFAUT.id === GILBERTAS_DOSSIER_ID, "id dossier");
assert(PROJET_GILBERTAS_DEFAUT.reference === GILBERTAS_REFERENCE, "référence");
assert(CLIENT_GILBERTAS.nom === "Leïla Gilbertas", "nom client");
assert(CLIENT_GILBERTAS.telephoneAffiche === "06 37 96 06 91", "téléphone affiché");
assert(CLIENT_GILBERTAS.lieuExecution === LIEU_EXECUTION_GILBERTAS, "lieu d'exécution");
assert(LIEU_EXECUTION_GILBERTAS === "Appartement 80 m² — 63000 Clermont-Ferrand", "libellé lieu");
assert(FACTURE_ACOMPTE_GILBERTAS.numero === "FA-2026-GILBERTAS-01", "n° facture acompte");
assert(FACTURE_ACOMPTE_GILBERTAS.ht === 10254.55 && FACTURE_ACOMPTE_GILBERTAS.tva === 1025.45, "acompte HT / TVA");
assert(FACTURE_ACOMPTE_GILBERTAS.ttc === 11280, "acompte TTC");
assert(RIB_REGLEMENT_GILBERTAS.iban === "FR76 1695 8000 0186 6836 4808 772", "IBAN");
assert(RIB_REGLEMENT_GILBERTAS.bic === "QNTOFRP1XXX", "BIC");
assert(RIB_REGLEMENT_GILBERTAS.libelle === "Acompte Gilbertas FA-2026-01", "libellé virement");
assert(CLAUSES_PLANNING_GILBERTAS.length === 3, "3 clauses planning");
assert(CLAUSES_PLANNING_GILBERTAS[0].startsWith("Visite Technique (VT) préalable obligatoire"), "clause VT");
assert(CLAUSES_PLANNING_GILBERTAS[1].includes("Délai ferme de 5 semaines"), "clause usine");
assert(CLAUSES_PLANNING_GILBERTAS[2].includes("280 m² développés"), "clause phasage");
assert(PROJET_GILBERTAS_DEFAUT.adresse === LIEU_EXECUTION_GILBERTAS, "adresse dossier");
assert(PROJET_GILBERTAS_DEFAUT.telephone === "06 37 96 06 91", "téléphone dossier");
assert(CLIENT_GILBERTAS.surfaceTotale === 80, "surface 80");
assert(LOTS_GILBERTAS.length === 4, "4 lots");
assert(LOTS_GILBERTAS[0].totalTtc === 17500 && LOTS_GILBERTAS[0].totalHt === 15909.09, "lot cuisine");
assert(LOTS_GILBERTAS[1].totalTtc === 5800 && LOTS_GILBERTAS[1].totalHt === 5272.73, "lot sols");
assert(LOTS_GILBERTAS[2].totalTtc === 10500 && LOTS_GILBERTAS[2].totalHt === 9545.45, "lot peinture");
assert(LOTS_GILBERTAS[3].totalTtc === 3800 && LOTS_GILBERTAS[3].totalHt === 3454.55, "lot électricité");
assert(LOTS_GILBERTAS.every((lot) => lot.coutAchatHt == null && lot.margeBruteHt == null), "aucun débours client");
assert(TOTAUX_GILBERTAS.totalTtc === 37600, "TTC 37 600");
assert(TOTAUX_GILBERTAS.totalHt === 34181.82, "HT 34 181,82");
assert(TOTAUX_GILBERTAS.totalTva === 3418.18, "TVA 3 418,18");
assert(TOTAUX_GILBERTAS.coutsTravauxHt == null, "débours non publiés");
assert(TOTAUX_GILBERTAS.commissionDamienHt == null, "pas de commission sur le marché client");
assert(TOTAUX_GILBERTAS.forfaitCatarinaHt == null, "pas de forfait publié");
assert(TOTAUX_GILBERTAS.margeNetteEnergiaHt == null, "pas de marge publiée");
assert(/Sylvain/.test(EQUIPE_GILBERTAS.directionContractantGeneral), "équipe Sylvain");
assert(!EQUIPE_GILBERTAS.commercialApporteur, "pas d'apporteur sur la fiche");
assert(/Catarina/.test(EQUIPE_GILBERTAS.designAgencement), "équipe Catarina");

const audit = projetManuelVersAudit(PROJET_GILBERTAS_DEFAUT);
assert(audit.caTtc === 37600, "CA TTC audit");
assert(audit.caHt === 34181.82, "CA HT audit");
assert(audit.coutArtisanHt == null, "cout artisan non publié");
assert(audit.partner_commission == null, "partner non publié");
assert(audit.equipe?.designAgencement?.includes("Catarina"), "équipe sur audit");
assert(audit.travaux.length === 4, "4 travaux");
assert(audit.travaux[0].ht === 15909.09, "HT cuisine");
assert(audit.travaux[3].ht === 3454.55 && audit.travaux[3].totalTtc === 3800, "HT / TTC électricité");

const brunel = projetManuelVersAudit(PROJET_BRUNEL_DEFAUT);
const pereira = projetManuelVersAudit(PROJET_PEREIRA_NERVIEUX_DEFAUT);
const massardier = projetManuelVersAudit(PROJET_MASSARDIER_DEFAUT);
const cloison = projetManuelVersAudit(PROJET_CLOISON_SDB_DEFAUT);
const damienPv = projetManuelVersAudit(PROJET_DAMIEN_PV_100KWC_DEFAUT);
const gesnouin = projetManuelVersAudit(PROJET_GESNOUIN_DEFAUT);
const ca = calculerCaPrevisionnelOperationnel([pereira, brunel, audit, massardier, cloison, damienPv, gesnouin]);
assert(ca === 234064, `CA prévisionnel ${ca} ≠ 237 971`);
assert(CA_PREVISIONNEL_OPERATIONNEL_TTC === 234064, "constante CA");
assert(Math.round(ca) === 234064, "affichage 237 971 €");

const admin = sanitiserProjetPourRole(audit, ROLE_ADMIN);
assert(admin.margeNetteEnergiaHt == null, "marge non publiée même en admin");
assert(admin.travaux[0].coutAchatHt == null, "achat lot non publié");
assert(admin.caTtc === 37600, "admin conserve TTC");

const commercial = sanitiserProjetPourRole(audit, ROLE_COMMERCIAL);
assert(commercial.margeNetteEnergiaHt == null, "commercial sans marge nette");
assert(commercial.travaux[0].coutAchatHt == null, "commercial sans achat");

const amo = sanitiserProjetPourVueHub(sanitiserProjetPourRole(audit, ROLE_ADMIN), VUE_HUB_AMO);
assert(amo.margeNetteEnergiaHt == null, "AMO sans marge nette");
assert(amo.commissionDamienHt == null, "AMO sans commission");
assert(amo.forfaitCatarinaHt == null, "AMO sans forfait Catarina");
assert(amo.travaux[0].margeBruteHt == null, "AMO sans marge lot");
assert(amo.travaux[0].coutAchatHt == null, "AMO sans achat lot");
assert(amo.caTtc === 37600, "AMO conserve TTC client");
assert(amo.equipe?.designAgencement?.includes("Catarina"), "AMO conserve Catarina");
assert(!amo.equipe?.commercialApporteur, "AMO sans apporteur affiché");

const superAdmin = sanitiserProjetPourVueHub(admin, VUE_HUB_SUPER_ADMIN);
assert(superAdmin.margeNetteEnergiaHt == null, "Super-Admin sans marge publiée");
assert(superAdmin.caTtc === 37600, "Super-Admin conserve TTC");

const fusion = fusionnerAvecDefautBrunel([
  {
    id: GILBERTAS_DOSSIER_ID,
    typeProjet: "ancien chiffrage 21 850",
    montantEstimeTtc: 21850,
    montantHt: 19863.64,
    statut: "Nouveau Lead Qualifié",
    equipe: { commercialApporteur: "Damien — commission" },
    telephone: "+33 6 00 00 00 00",
    adresse: "ancienne adresse",
  },
]);
const stocke = fusion.find((item) => item.id === GILBERTAS_DOSSIER_ID);
assert(stocke.montantEstimeTtc === 37600, "le stockage local ne rétrograde pas le TTC");
assert(stocke.montantHt === 34181.82, "le stockage local ne rétrograde pas le HT");
assert(String(stocke.typeProjet).includes("37"), "intitulé officiel conservé");
assert(!stocke.equipe?.commercialApporteur, "équipe officielle sans apporteur");
assert(stocke.statut === "Contrat CG établi", "statut officiel");
assert(stocke.telephone === "06 37 96 06 91", "le stockage local ne rétrograde pas le téléphone");
assert(stocke.adresse === "Appartement 80 m² — 63000 Clermont-Ferrand", "le stockage local ne rétrograde pas le lieu");

console.log("OK — Gilbertas : 37 600 TTC, CA 237 971, 4 lots, sans débours client.");
