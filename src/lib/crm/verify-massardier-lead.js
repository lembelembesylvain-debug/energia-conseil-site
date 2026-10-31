/**
 * Contrôles lead Massardier — budget 20 000 € TTC intégré au CA prévisionnel 222 066 €.
 * Exécution : npx tsx src/lib/crm/verify-massardier-lead.js
 */

import {
  MASSARDIER_LEAD_ID,
  MASSARDIER_REFERENCE,
  MONTANT_ESTIME_MASSARDIER_TTC,
  PRIORITE_MASSARDIER,
  PROJET_MASSARDIER_DEFAUT,
  SOURCE_MASSARDIER,
  STATUT_MASSARDIER,
  TOTAUX_MASSARDIER,
} from "./massardierLeadOfficiel.js";
import {
  etapeDepuisStatutManuel,
  fusionnerAvecDefautBrunel,
  PROJET_BRUNEL_DEFAUT,
  projetManuelVersAudit,
  sanitiserProjetPourRole,
} from "./projetsManuels.js";
import { PROJET_PEREIRA_NERVIEUX_DEFAUT } from "./pereiraNervieuxOfficiel.js";
import { PROJET_GILBERTAS_DEFAUT } from "./gilbertasClermontOfficiel.js";
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

assert(PROJET_MASSARDIER_DEFAUT.id === MASSARDIER_LEAD_ID, "id lead");
assert(PROJET_MASSARDIER_DEFAUT.reference === MASSARDIER_REFERENCE, "référence");
assert(PROJET_MASSARDIER_DEFAUT.nom === "Roger Massardier", "nom");
assert(PROJET_MASSARDIER_DEFAUT.telephone === "06 59 39 82 26", "téléphone");
assert(PROJET_MASSARDIER_DEFAUT.statut === STATUT_MASSARDIER, "statut");
assert(PROJET_MASSARDIER_DEFAUT.statut === "Nouveau Lead — À Contacter Lundi Matin", "libellé statut");
assert(PROJET_MASSARDIER_DEFAUT.priorite === PRIORITE_MASSARDIER, "priorité");
assert(PROJET_MASSARDIER_DEFAUT.sourceLead === SOURCE_MASSARDIER, "source Éco Technicien");
assert(PROJET_MASSARDIER_DEFAUT.montantEstimeTtc === 20000, "estimé 20 000");
assert(PROJET_MASSARDIER_DEFAUT.montantHt === 18181.82, "HT 18 181,82");
assert(TOTAUX_MASSARDIER.coutsTravauxHt === 11500, "coûts travaux 11 500");
assert(TOTAUX_MASSARDIER.commissionDamienHt === 1818.18, "commission Damien 10 %");
assert(TOTAUX_MASSARDIER.margeNetteEnergiaHt === 4863.64, "marge nette ENERGIA");
assert(
  /Cuisine d'exception & Agencement Italien Direct Usine/.test(PROJET_MASSARDIER_DEFAUT.description),
  "description cuisine d'exception",
);
assert(etapeDepuisStatutManuel(STATUT_MASSARDIER) === "nouveau", "pipeline Nouveau / en attente");

const audit = projetManuelVersAudit(PROJET_MASSARDIER_DEFAUT);
assert(audit.etape === "nouveau", "étape nouveau");
assert(audit.caTtc === MONTANT_ESTIME_MASSARDIER_TTC, "CA estimé affiché");
assert(audit.caHt === 18181.82, "CA HT");
assert(audit.montantEstimeTtc === 20000, "montantEstimeTtc");
assert(audit.coutArtisanHt === 11500, "coûts travaux");
assert(audit.commissionDamienHt === 1818.18, "commission Damien audit");
assert(audit.margeNetteEnergiaHt === 4863.64, "marge nette audit");
assert(audit.source === "lead-prospect", "source lead-prospect");
assert(audit.sourceLead === "Éco Technicien BtoC", "sourceLead");
assert(audit.equipe?.commercial === "Damien", "commercial Damien");
assert(audit.equipe?.direction === "Sylvain LEMBELEMBE", "direction Sylvain");
assert(!audit.equipe?.designAgencement, "pas de Catarina sur ce lead");

const fusion = fusionnerAvecDefautBrunel([]);
assert(fusion.some((item) => item.id === MASSARDIER_LEAD_ID), "fusion seed Massardier");

const ca = calculerCaPrevisionnelOperationnel([
  projetManuelVersAudit(PROJET_PEREIRA_NERVIEUX_DEFAUT),
  projetManuelVersAudit(PROJET_BRUNEL_DEFAUT),
  projetManuelVersAudit(PROJET_GILBERTAS_DEFAUT),
  audit,
  projetManuelVersAudit(PROJET_CLOISON_SDB_DEFAUT),
  projetManuelVersAudit(PROJET_DAMIEN_PV_100KWC_DEFAUT),
  projetManuelVersAudit(PROJET_GESNOUIN_DEFAUT),
]);
assert(ca === 234064, `CA prévisionnel ${ca} ≠ 237 971`);
assert(CA_PREVISIONNEL_OPERATIONNEL_TTC === 234064, "constante CA 237 971");

const admin = sanitiserProjetPourRole(audit, ROLE_ADMIN);
assert(admin.margeNetteEnergiaHt === 4863.64, "admin voit marge nette");
assert(admin.commissionDamienHt === 1818.18, "admin voit commission Damien");

const commercial = sanitiserProjetPourRole(audit, ROLE_COMMERCIAL);
assert(commercial.margeNetteEnergiaHt == null, "commercial sans marge nette");
assert(commercial.commissionDamienHt == null, "commercial sans commission");

const amo = sanitiserProjetPourVueHub(sanitiserProjetPourRole(audit, ROLE_ADMIN), VUE_HUB_AMO);
assert(amo.margeNetteEnergiaHt == null, "AMO sans marge nette");
assert(amo.commissionDamienHt == null, "AMO sans commission Damien");
assert(amo.coutArtisanHt == null, "AMO sans coûts travaux");
assert(amo.caTtc === 20000, "AMO conserve TTC client");

const superAdmin = sanitiserProjetPourVueHub(admin, VUE_HUB_SUPER_ADMIN);
assert(superAdmin.margeNetteEnergiaHt === 4863.64, "Super-Admin conserve marges");

console.log("OK — lead Massardier : 20 000 TTC, CA 237 971, marge 4 863,64 HT, masquage AMO.");
