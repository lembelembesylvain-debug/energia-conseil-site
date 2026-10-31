/**
 * Prospect Charlotte LANOUX — hors énergie, hors CA, apporteur Jamel.
 * Exécution : node src/lib/crm/verify-lanoux-lead.js
 */

import {
  LANOUX_CONVENTION,
  LANOUX_LEAD_ID,
  LANOUX_REFERENCE,
  PROJET_LANOUX_DEFAUT,
  STATUT_LANOUX,
  TAUX_COMMISSION_LANOUX,
} from "./lanouxBordeauxOfficiel.js";
import { etapeDepuisStatutManuel, fusionnerAvecDefautBrunel, projetManuelVersAudit } from "./projetsManuels.js";
import {
  SOURCE_APPORTEUR_JAMEL,
  infererSourceApporteur,
  regrouperPipelineAnah,
} from "./operationnelCrm.js";

function assert(condition, message) {
  if (!condition) {
    console.error("ECHEC", message);
    process.exit(1);
  }
}

const projet = PROJET_LANOUX_DEFAUT;
assert(projet.id === LANOUX_LEAD_ID, "id");
assert(projet.nom === "Charlotte LANOUX", "nom");
assert(projet.prenom === "Charlotte", "prénom");
assert(projet.telephone === "06 14 33 81 52", "téléphone");
assert(projet.adresse === "Rue Judaïque, 33000 Bordeaux", "adresse");
assert(projet.ville === "Bordeaux" && projet.codePostal === "33000", "ville");
assert(projet.statut === STATUT_LANOUX, "statut");
assert(etapeDepuisStatutManuel(projet.statut) === "qualifie", "pipeline qualifié");
assert(projet.apporteurId === SOURCE_APPORTEUR_JAMEL, "apporteur");
assert(projet.conventionApporteur === LANOUX_CONVENTION, "convention");
assert(projet.tauxCommissionApporteur === TAUX_COMMISSION_LANOUX, "taux 10 %");
assert(projet.montantEstimeTtc == null && projet.montantHt == null, "aucun montant inventé");
assert(projet.horsAidesPubliques === true, "hors aides");
assert(projet.description.includes("12 Maçonnerie"), "maçonnerie");
assert(projet.description.includes("09 Menuiseries extérieures"), "menuiseries");
assert(projet.description.includes("déclaration préalable"), "urbanisme");
assert(projet.alertes[0].includes("12/10/2026"), "date de contact");
assert(projet.alertes[0].includes("Montempo"), "origine recommandation");
assert(projet.priorite.includes("fin novembre"), "relance");
assert(
  infererSourceApporteur({ apporteurNom: "Jamel HAMZAOUI — ENERG’ÉTHIQUE" }) === SOURCE_APPORTEUR_JAMEL,
  "inférence nom",
);

const fusion = fusionnerAvecDefautBrunel([]);
const seed = fusion.find((item) => item.id === LANOUX_LEAD_ID);
assert(seed && seed.horsAidesPubliques === true, "seed fusion");
assert(fusion.filter((item) => item.id === LANOUX_LEAD_ID).length === 1, "pas de doublon");

const audit = projetManuelVersAudit(projet);
assert(audit.etape === "qualifie", "étape audit");
assert(audit.etapeAnah == null, "pas de jalon ANAH");
assert(audit.horsAidesPubliques === true, "flag audit");
assert(audit.caTtc == null && audit.caHt == null, "hors CA");
assert(audit.telephone === "06 14 33 81 52", "téléphone audit");
assert(audit.reference === LANOUX_REFERENCE || audit.auditId === LANOUX_REFERENCE, "référence");
assert(audit.parcoursAnah.includes("Hors MaPrimeRénov"), "parcours hors aides");

const anah = regrouperPipelineAnah([
  audit,
  { etapeAnah: "audit_reglementaire", horsAidesPubliques: false, statut: "Audit en cours" },
]);
const jalonAudit = anah.find((etape) => etape.id === "audit_reglementaire");
assert(jalonAudit.count === 1, "Lanoux absente du décompte ANAH");

console.log("OK — prospect Charlotte LANOUX : qualifiée, Jamel 10 % HT, hors énergie, hors CA.");
