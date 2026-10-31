/**
 * Contrôles de la base de travail Brunel (brouillon, devis vide, rapport bloqué).
 * Exécution : node src/lib/crm/verify-brunel-working-base.js
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { passerAidesValidees } from "../aides/verificationLive.js";
import {
  ALERTE_NAISSANCE_BRUNEL,
  BRUNEL_DOSSIER_ID,
  CHAMPS_LOGEMENT_REQUIS,
  CLAUSE_INDIVISION_COUBLE_815,
  LIBELLE_PIECE_IDENTITE_SECURISEE,
  MENTION_ESTIMATION_INDICATIVE,
  MODELES_LIES,
  TAMPON_DEVIS_NON_CONTRACTUEL,
  construireEntreeDevisEstimatif,
  creerBaseTravailBrunel,
  detecterContaminationBussieres,
  logementComplet,
  logementManquant,
  peutGenererDocumentFinal,
  sanitiserBasePourRole,
  tenterGenererDocumentFinalBrunel,
} from "./brunelWorkingBase.js";
import { STATUT_DOSSIER_BRUNEL_V4 } from "./brunelDevisV3Officiel.js";
import { CHEMIN_FICHE_TECHNIQUE_BRUNEL, verifierCoherenceMarcheBrunel } from "./brunelMarcheOfficiel2026.js";
import {
  BAREME_RFR_2026_HORS_IDF,
  FOYER_BRUNEL_BAREME_MAR,
  PLAFONDS_PARCOURS_ACCOMPAGNE_HT,
  PRISE_EN_CHARGE_MAR_2026,
  AUDIT_REGLEMENTAIRE_BRUNEL,
  CHEMIN_AUDIT_AER_BRUNEL,
  TEXTE_ECO_PTZ_BRUNEL,
  economiesAnnuellesScenario3Brunel,
  HONORAIRES_HUB_ADMIN_HT,
  HONORAIRES_HUB_ADMIN_TTC,
  HONORAIRES_HUB_ADMIN_TVA,
  VUE_HUB_AMO,
  VUE_HUB_SUPER_ADMIN,
  droitsVueHub,
  libelleHonorairesAmoHubAdmin,
  profilDepuisRfrHorsIdf,
  sanitiserProjetPourVueHub,
  seuilsRfrHorsIdf,
} from "./operationnelCrm.js";
import { IDS_DOSSIERS_TEST_PROTEGES, PROJET_BRUNEL_DEFAUT, projetManuelVersAudit, sanitiserProjetPourRole } from "./projetsManuels.js";
import { ROLE_ADMIN, ROLE_COMMERCIAL, ROLE_PARTENAIRE, ROLE_PRESENTATION } from "./roles.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const base = creerBaseTravailBrunel();

assert(base.id === BRUNEL_DOSSIER_ID, "id Brunel");
assert(base.client.nom === "Emrick Brunel", "nom");
assert(base.client.prenoms === "Emrick", "prénoms");
assert(base.client.mandant === "Indivision COUBLE", "mandant");
assert(base.client.profession === "préparateur de commande", "profession");
assert(base.client.partsIndiquees === 1, "parts indiquées");
assert(base.client.foyerReelVerifie === false, "foyer non vérifié");
assert(base.client.ville === "BUSSIÈRES", "ville Bussières");
assert(base.client.codePostal === "42510", "CP");
assert(String(base.client.adresse).includes("Lagunes"), "adresse chantier");
assert(base.rfr.montant === 20216, "RFR V3");
assert(base.rfr.anneeRevenus === 2024, "revenus 2024");
assert(base.rfr.anneeAvis === 2025, "avis 2025");
assert(base.rfr.categorieAide == null, "pas de catégorie MPR");
assert(base.statutDossier === STATUT_DOSSIER_BRUNEL_V4, "statut V4 validé");
assert(base.client.cadreJuridique.includes("Article 815"), "cadre indivision");
assert(base.alertes.includes(ALERTE_NAISSANCE_BRUNEL), "alerte naissance");
assert(base.alertes.includes(CLAUSE_INDIVISION_COUBLE_815), "clause 815");
assert(base.referenceDistincteAssociee === true, "V3 associé");
assert(base.mention === MENTION_ESTIMATION_INDICATIVE, "mention indicative");
assert(base.documents.audit.statut === "brouillon", "audit brouillon");
assert(base.documents.audit.dpeOfficiel === false, "pas un DPE officiel");
assert(base.documents.audit.publie === false, "audit non publié");
assert(base.documents.devis.lignes.length === 0, "devis interne vide");
assert(base.documents.devis.totalHt == null && base.documents.devis.totalTtc == null, "pas de totaux factory");
assert(base.documents.devis.prixFerme === false, "pas de prix ferme");
assert(base.documents.devis.aidesImportees === false, "pas d’aides importées factory");
assert(base.documents.devis.tampon === TAMPON_DEVIS_NON_CONTRACTUEL, "tampon non contractuel");
assert(base.documents.rapport.bloque === true, "rapport bloqué");
assert(base.aidesVerification?.statut === "brouillon", "aides en brouillon");
assert(base.aidesVerification?.aides_verifiees_web === false, "aides non vérifiées web");
assert(base.source_verification_url === "https://www.anah.gouv.fr", "source_verification_url");
assert(passerAidesValidees(base.aidesVerification).ok === false, "aides non validables sans Vérifiées Web");
assert(base.documents.rapport.statut === "non_genere", "rapport non généré");
assert(!logementComplet(base.logement), "logement incomplet");
assert(CHAMPS_LOGEMENT_REQUIS.length === 16, "16 champs logement");
assert(logementManquant(base.logement).length === 16, "16 champs logement manquants");
assert(detecterContaminationBussieres(base).length === 0, "pas de contamination résiduelle");

const devis = construireEntreeDevisEstimatif(base);
assert(devis.lignes.length === 0, "entrée PDF devis sans lignes");
assert(devis.statut === TAMPON_DEVIS_NON_CONTRACTUEL, "statut PDF");
assert(devis.totalHt == null, "PDF sans HT");
assert(!devis.filename, "aucun fichier PDF nommé");
assert(MODELES_LIES.devisPdf.includes("generateDevisPdf.ts"), "liaison modèle devis");
assert(MODELES_LIES.auditTypes.includes("audit.ts"), "liaison modèle audit");

const bloqueAdmin = peutGenererDocumentFinal(base, ROLE_ADMIN);
assert(bloqueAdmin.bloque === true, "génération finale bloquée");
assert(bloqueAdmin.raisons.some((r) => r.includes("Logement incomplet")), "blocage logement");
assert(bloqueAdmin.raisons.some((r) => r.toLowerCase().includes("validation humaine")), "blocage validation");

const tente = tenterGenererDocumentFinalBrunel(ROLE_ADMIN);
assert(tente.genere === false, "aucun PDF généré");

assert(peutGenererDocumentFinal(base, ROLE_COMMERCIAL).ok === false, "commercial ne génère pas");

const commercial = sanitiserBasePourRole(base, ROLE_COMMERCIAL);
assert(commercial.rfr.montant == null, "RFR masqué commercial");
assert(commercial.alertes.length === 0, "alertes identité masquées commercial");
assert(commercial.pieces.every((p) => p.type === "identite"), "commercial : seulement libellé identité");
assert(commercial.pieces[0].libellePublic === LIBELLE_PIECE_IDENTITE_SECURISEE, "libellé sécurisé");
assert(!JSON.stringify(commercial).includes("20216"), "RFR absent JSON commercial");
assert(!JSON.stringify(commercial).includes("avis_impot"), "avis d’impôt absent commercial");

assert(sanitiserBasePourRole(base, ROLE_PARTENAIRE).pieces.every((p) => p.type === "identite"), "partenaire");
assert(sanitiserBasePourRole(base, ROLE_PRESENTATION).rfr.montant == null, "client sans RFR");

const admin = sanitiserBasePourRole(base, ROLE_ADMIN);
assert(admin.rfr.montant === 20216, "admin voit RFR");
assert(admin.alertes.includes(CLAUSE_INDIVISION_COUBLE_815), "admin voit clause 815");
assert(admin.pieces.every((p) => p.numero == null && p.fichier == null), "pas de n° ni fichier");

assert(IDS_DOSSIERS_TEST_PROTEGES.includes("demo-pereira"), "Pereira protégé");
assert(IDS_DOSSIERS_TEST_PROTEGES.includes("demo-marjollet"), "Marjollet protégé");
assert(PROJET_BRUNEL_DEFAUT.id !== "demo-pereira", "Brunel ≠ Pereira");

const auditCrm = projetManuelVersAudit(PROJET_BRUNEL_DEFAUT);
assert(auditCrm.workingBase?.documents.audit.statut === "brouillon", "CRM : audit brouillon lié");
assert(auditCrm.travaux.length === 0, "CRM : pas de lignes travaux inventées");
assert(verifierCoherenceMarcheBrunel(), "cohérence arithmétique marché Brunel 2026");
assert(auditCrm.caTtc === 33478.53, "CRM : TTC option 1 33 478,53");
assert(auditCrm.caHt === 31733.21, "CRM : HT option 1 31 733,21");
assert(auditCrm.margeDirectionHt === 5200, "CRM : marge Direction 5 200 HT");
assert(auditCrm.apporteurId === "damien", "CRM : apporteur Damien");
assert(auditCrm.etapeAnah === "validation_mar_financement", "CRM : jalon 2 validation MAR");
assert(auditCrm.validationMar === false, "CRM : jalon 2 non validé");
assert(auditCrm.email === "brunelemrick@gmail.com", "CRM : email Brunel");
assert(auditCrm.telephone === "06 50 26 31 83", "CRM : téléphone");
assert(auditCrm.href === "", "CRM : pas de lien HTML public");
assert(detecterContaminationBussieres(auditCrm.workingBase).length === 0, "pas de contamination");

const commercialProjet = sanitiserProjetPourRole(auditCrm, ROLE_COMMERCIAL);
assert(!JSON.stringify(commercialProjet).includes("20216"), "projet commercial sans RFR");

const adminProjet = sanitiserProjetPourRole(auditCrm, ROLE_ADMIN);
assert(adminProjet.alertes.includes(CLAUSE_INDIVISION_COUBLE_815), "admin : clause 815");
assert(adminProjet.rfr === 20216, "admin projet : RFR V3");

const ficheTechnique = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../..", "public", CHEMIN_FICHE_TECHNIQUE_BRUNEL.replace(/^\//, "")),
  "utf8",
);
assert(ficheTechnique.includes("M. Emrick BRUNEL / Indivision COUBLE"), "fiche : maître d'ouvrage");
assert(ficheTechnique.includes("35 m²"), "fiche : combles 35 m²");
assert(ficheTechnique.includes("2 unités"), "fiche : 2 menuiseries");
assert(ficheTechnique.includes("Sylvain LEMBELEMBE"), "fiche : signature Sylvain");
assert(ficheTechnique.includes("Cahier") || ficheTechnique.includes("prescription technique"), "fiche : titre prescription");
assert(!ficheTechnique.includes("100 m²"), "fiche sans 100 m²");
assert(BAREME_RFR_2026_HORS_IDF[1].violet === 31185, "RFR 1 pers. violet");
assert(BAREME_RFR_2026_HORS_IDF[4].bleu === 35676 && BAREME_RFR_2026_HORS_IDF[4].jaune === 45735, "RFR 4 pers.");
assert(BAREME_RFR_2026_HORS_IDF[5].bleu === 40835 && BAREME_RFR_2026_HORS_IDF[5].violet === 73907, "RFR 5 pers.");
assert(BAREME_RFR_2026_HORS_IDF.parPersonneSupplementaire.violet === 9357, "majoration violet");
assert(seuilsRfrHorsIdf(6).bleu === 40835 + 5151, "6e personne bleu");
assert(profilDepuisRfrHorsIdf(31185, 1) === "violet", "plafond violet inclus");
assert(profilDepuisRfrHorsIdf(31186, 1) === "rose", "au-dessus violet = rose");
assert(FOYER_BRUNEL_BAREME_MAR.profil === "jaune" && FOYER_BRUNEL_BAREME_MAR.personnes === 1, "Brunel foyer jaune");
assert(PLAFONDS_PARCOURS_ACCOMPAGNE_HT.troisClassesOuPlus === 40000, "plafond 4 classes");
assert(PRISE_EN_CHARGE_MAR_2026.profils.find((p) => p.id === "violet").resteACharge === 1200, "MAR violet 1 200");
assert(PRISE_EN_CHARGE_MAR_2026.profils.find((p) => p.id === "jaune").aide === 1600, "MAR jaune 1 600");
assert(TEXTE_ECO_PTZ_BRUNEL.includes("15 238,60"), "Éco-PTZ reste à charge Brunel");
assert(TEXTE_ECO_PTZ_BRUNEL.includes("63,50"), "Éco-PTZ mensualité Brunel");

const auditAer = AUDIT_REGLEMENTAIRE_BRUNEL;
const scenario3 = auditAer.scenarios.find((item) => item.id === "scenario-3");
const economies = economiesAnnuellesScenario3Brunel();
assert(auditAer.numero === "A26420202241D", "n° audit AER");
assert(auditAer.bati.surfaceReferenceM2 === 82.9, "surface audit 82,90");
assert(auditAer.etatInitial.kwhEpM2 === 460 && auditAer.etatInitial.classeEnergie === "G", "état initial G");
assert(scenario3.kwhEpM2Apres === 123 && scenario3.classeApres === "C", "scénario 3 classe C");
assert(scenario3.gainPourcentEp === 73 && scenario3.gainKwhEpM2 === 337, "gain 73 %");
assert(scenario3.investissementTtcEur === 31450, "investissement scénario 3");
assert(economies.eurosMilieu === 2290, "économies milieu de fourchette");
assert(economies.kwhEpAn === 27937, "kWhEP/an");
const pdfAudit = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../../..", "public", CHEMIN_AUDIT_AER_BRUNEL.replace(/^\//, "")),
);
assert(pdfAudit.length > 100000, "PDF audit servi");

const droitsAmo = droitsVueHub(VUE_HUB_AMO);
const droitsAdmin = droitsVueHub(VUE_HUB_SUPER_ADMIN);
assert(droitsAmo.afficherRfr && droitsAmo.afficherGed && droitsAmo.afficherHonorairesHubAdmin, "AMO voit le dossier");
assert(droitsAmo.afficherDevisOfficiel && droitsAmo.afficherSubventionAnah && droitsAmo.afficherJalonsAnah, "AMO voit devis et jalons");
assert(!droitsAmo.afficherMargeCg && !droitsAmo.afficherBonsCommande, "AMO sans marge ni BC");
assert(!droitsAmo.afficherCommissionsCommerciales && !droitsAmo.afficherTresorerieInterne, "AMO sans commission ni trésorerie");
assert(droitsAdmin.afficherMargeCg && droitsAdmin.afficherBonsCommande && droitsAdmin.afficherTresorerieInterne, "Super-Admin complet");
const projetAmo = sanitiserProjetPourVueHub(
  { margeBruteHt: 5200, coutAchatHt: 1050, rfr: 20216, libelleRfr: "20 216 €", workingBase: { rfr: { montant: 20216 }, pieces: [{ type: "avis" }], financesInternes: { coutArtisanHt: 1050 } } },
  VUE_HUB_AMO,
);
assert(projetAmo.margeBruteHt == null && projetAmo.coutAchatHt == null, "AMO sans marge projet");
assert(projetAmo.rfr === 20216 && projetAmo.workingBase.pieces.length === 1, "AMO garde RFR et GED");
assert(projetAmo.workingBase.financesInternes.coutArtisanHt == null, "AMO sans trésorerie interne");
assert(HONORAIRES_HUB_ADMIN_HT === 990 && HONORAIRES_HUB_ADMIN_TVA === 198 && HONORAIRES_HUB_ADMIN_TTC === 1188, "forfait Hub Admin 990 HT");
const libelleHub = libelleHonorairesAmoHubAdmin().replace(/\u202f|\u00a0/g, " ");
assert(
  libelleHub === "Honoraires AMO Hub Admin = 990,00 € HT (TVA 20 % = 198,00 €, soit 1 188,00 € TTC réglés à l'acompte).",
  `libellé honoraires AMO : ${libelleHub}`,
);

console.log("OK — base de travail Brunel : brouillon, devis vide, rapport bloqué, pas de publication.");
