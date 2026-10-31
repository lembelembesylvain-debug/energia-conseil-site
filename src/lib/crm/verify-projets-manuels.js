/**
 * Contrôles des projets CRM manuels (Brunel par défaut, RFR protégé, pas de MPR auto).
 * Exécution : node src/lib/crm/verify-projets-manuels.js
 */

import {
  IDS_DOSSIERS_TEST_PROTEGES,
  LIBELLE_CATEGORIE_AIDE_A_CONFIRMER,
  PROJET_BRUNEL_DEFAUT,
  STATUT_INITIAL_DOCUMENTS,
  estDoublonProjet,
  fusionnerAvecDefautBrunel,
  mettreAJourOperationnelProjet,
  parserRfr,
  projetManuelVersAudit,
  sanitiserProjetPourRole,
  validerProjetManuel,
} from "./projetsManuels.js";
import { ROLE_ADMIN, ROLE_COMMERCIAL, ROLE_PARTENAIRE, ROLE_PRESENTATION } from "./roles.js";
import { STATUT_CRM_BRUNEL_MARCHE, TOTAUX_OPTION_BAIE } from "./brunelMarcheOfficiel2026.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

assert(IDS_DOSSIERS_TEST_PROTEGES.includes("demo-pereira"), "Pereira protégé");
assert(IDS_DOSSIERS_TEST_PROTEGES.includes("demo-marjollet"), "Marjollet protégé");

assert(/brunel/i.test(PROJET_BRUNEL_DEFAUT.nom) && /indivision couble/i.test(PROJET_BRUNEL_DEFAUT.nom), "Nom Brunel");
assert(PROJET_BRUNEL_DEFAUT.ville === "BUSSIÈRES", "Ville Brunel");
assert(PROJET_BRUNEL_DEFAUT.codePostal === "42510", "CP Brunel");
assert(PROJET_BRUNEL_DEFAUT.rfr === 20216, "RFR Brunel");
assert(PROJET_BRUNEL_DEFAUT.statut === STATUT_CRM_BRUNEL_MARCHE, "Statut devis validé, dépôt MAR en attente");
assert(PROJET_BRUNEL_DEFAUT.profilAnah === "jaune", "Profil ANAH jaune officiel");
assert(PROJET_BRUNEL_DEFAUT.apporteurId === "damien", "Apporteur Damien par défaut");
assert(PROJET_BRUNEL_DEFAUT.etapeAnah === "validation_mar_financement", "Jalon 2 — validation MAR et financement");
assert(PROJET_BRUNEL_DEFAUT.validationMar === false, "Jalon 2 non encore validé");
assert(PROJET_BRUNEL_DEFAUT.acompte30Encaisse === false, "Acompte VT non encaissé par défaut");
assert(PROJET_BRUNEL_DEFAUT.dateVisiteTechnique === "", "Aucune VT planifiée par défaut");
assert(PROJET_BRUNEL_DEFAUT.detailJalon.includes("dépôt officiel"), "Attente dépôt officiel MAR");
assert(PROJET_BRUNEL_DEFAUT.email === "brunelemrick@gmail.com", "Email Brunel");
assert(PROJET_BRUNEL_DEFAUT.margeDirectionHt === 5200, "Marge Direction 5 200 HT");
assert(PROJET_BRUNEL_DEFAUT.categorieAide == null, "Pas de catégorie MPR inventée");

const fusion = fusionnerAvecDefautBrunel([]);
assert(fusion[0].id === PROJET_BRUNEL_DEFAUT.id, "Brunel injecté par défaut");
assert(fusion[0].apporteurId === "damien", "Brunel par défaut attribué à Damien");
assert(
  fusionnerAvecDefautBrunel([{ id: PROJET_BRUNEL_DEFAUT.id, apporteurId: "direct_energia" }])[0].apporteurId === "damien",
  "Ancien défaut Direct migré vers Damien",
);
assert(
  fusionnerAvecDefautBrunel([
    { id: PROJET_BRUNEL_DEFAUT.id, apporteurId: "direct_energia", apporteurMigrationVersion: 1 },
  ])[0].apporteurId === "direct_energia",
  "Choix Direct explicite conservé après migration",
);
assert(fusion[1].id === "projet-manuel-pereira-nervieux", "Pereira Nervieux injecté");
const vtVerrouillee = mettreAJourOperationnelProjet(PROJET_BRUNEL_DEFAUT.id, {
  dateVisiteTechnique: "2026-10-15",
});
assert(!vtVerrouillee.ok, "Planification VT refusée sans acompte");
const vtAutorisee = mettreAJourOperationnelProjet(PROJET_BRUNEL_DEFAUT.id, {
  validationMar: true,
  etapeAnah: "marche_signe_acompte",
  acompte30Encaisse: true,
  dateVisiteTechnique: "2026-10-15",
});
assert(vtAutorisee.ok, "Planification VT permise après acompte au jalon 3");
assert(vtAutorisee.projet.dateVisiteTechnique === "2026-10-15", "Date VT persistée");
assert(
  fusionnerAvecDefautBrunel([{ id: "demo-pereira", nom: "hack" }]).every((p) => p.id !== "demo-pereira"),
  "Un projet manuel ne peut pas porter l’id Pereira",
);

const validation = validerProjetManuel({
  nom: "Emrick Brunel",
  ville: "BUSSIÈRES",
  codePostal: "42510",
  rfr: "20 216",
  statut: STATUT_INITIAL_DOCUMENTS,
});
assert(validation.ok, "Formulaire Brunel valide");
assert(validation.valeurs.rfr === 20216, "RFR parsé depuis 20 216");
assert(parserRfr("20216") === 20216, "RFR numérique");

const invalide = validerProjetManuel({ nom: "", ville: "", codePostal: "42", rfr: "", statut: "x" });
assert(!invalide.ok, "Champs vides rejetés");
assert(invalide.erreurs.nom, "Nom requis");
assert(invalide.erreurs.codePostal, "CP invalide");

assert(
  estDoublonProjet(PROJET_BRUNEL_DEFAUT, {
    nom: "monsieur emrick brunel (agissant pour l'indivision couble)",
    ville: "Bussières",
    codePostal: "42510",
  }),
  "Doublon Brunel détecté",
);
assert(
  !estDoublonProjet(PROJET_BRUNEL_DEFAUT, { nom: "Emrick Brunel", ville: "Feurs", codePostal: "42110" }),
  "Feurs n’est pas un doublon silencieux de Bussières",
);

assert(PROJET_BRUNEL_DEFAUT.alertes?.includes("Date de naissance à confirmer entre les documents transmis. Ne pas corriger automatiquement."), "Alerte naissance");

const audit = projetManuelVersAudit(PROJET_BRUNEL_DEFAUT);
assert(audit.workingBase?.documents.rapport.bloque === true, "Rapport bloqué sur la fiche CRM");
assert(audit.workingBase?.documents.devis.lignes.length === 0, "Devis vide sur la fiche CRM");
assert(audit.email === "brunelemrick@gmail.com", "Email officiel Brunel");
assert(audit.etapeAnah === "validation_mar_financement", "Jalon ANAH 2 — attente MAR");
assert(audit.categorieAide == null, "Audit sans profil MPR déduit du RFR");
assert(audit.profilAnah === "jaune", "Profil jaune officiel sur la fiche");
assert(audit.caHt === TOTAUX_OPTION_BAIE.totalHt, "CRM Brunel HT option baie");
assert(audit.caTtc === TOTAUX_OPTION_BAIE.totalTtc, "CRM Brunel TTC option baie");
assert(audit.libelleRfr.includes("20 216") || audit.libelleRfr.includes("20 216"), "Libellé RFR");
assert(audit.libelleRfr.includes(LIBELLE_CATEGORIE_AIDE_A_CONFIRMER), "Catégorie à confirmer");
assert(!/jaune|bleu|violet|rose/i.test(audit.libelleRfr), "Aucune couleur MPR dans le libellé");

const admin = sanitiserProjetPourRole(audit, ROLE_ADMIN);
assert(admin.rfr === 20216, "Admin voit le RFR");

const commercial = sanitiserProjetPourRole(audit, ROLE_COMMERCIAL);
assert(commercial.rfr == null, "Commercial ne voit pas le RFR");
assert(!commercial.libelleRfr, "Commercial : pas de libellé RFR");

assert(sanitiserProjetPourRole(audit, ROLE_PARTENAIRE).rfr == null, "Partenaire : pas de RFR");
assert(sanitiserProjetPourRole(audit, ROLE_PRESENTATION).rfr == null, "Client : pas de RFR");

const exportCommercial = JSON.stringify(commercial);
assert(!exportCommercial.includes("20216"), "RFR absent de l’export commercial");

console.log("OK — projets manuels : Brunel, protections, pas de MPR auto.");
