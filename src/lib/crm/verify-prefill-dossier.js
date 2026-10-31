/**
 * Tests lots D–F : préremplissage contrôlé, contrôle admin, protections.
 * Exécution : node src/lib/crm/verify-prefill-dossier.js
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ROLE_ADMIN, ROLE_COMMERCIAL, ROLE_PARTENAIRE } from "./roles.js";
import {
  creerBaseTravailBrunel,
  lireBaseTravailBrunel,
  reinitialiserBaseTravailTests,
  sanitiserBasePourRole,
  tenterGenererDocumentFinalBrunel,
  logementManquant,
  detecterContaminationBussieres,
} from "./brunelWorkingBase.js";
import { etudierFaisabiliteFeurs, TITRE_ETUDE_PREPARATOIRE } from "./etudeFaisabilite.js";
import { IDS_DOSSIERS_TEST_PROTEGES } from "./projetsManuels.js";
import { MESSAGE_CONTRADICTION } from "./gardeFousImport.js";
import {
  importerDocument,
  lireEtatImport,
  reinitialiserImportsTests,
  revoirChampImport,
} from "./importDocuments.js";
import {
  MENTION_AIDES_NON_CALCULABLES,
  MENTION_FINANCEMENT_INDICATIF,
  MENTION_AIDES_INDICATIVES,
  preparerAidesIndicatives,
  preparerFinancementIndicatif,
  preparerFinancesInternes,
  construireDossierTravailSynthese,
} from "./prefillDossier.js";
import { listerControlesFinaux } from "./controleFinal.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const racine = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const feurs = {
  id: "projet-manuel-brunel-emrick",
  nom: "Emrick Brunel",
  ville: "FEURS",
  codePostal: "42110",
  workingBase: { client: { nom: "Emrick Brunel", ville: "FEURS", codePostal: "42110" } },
};
const pereira = { id: "demo-pereira", source: "test-local", nom: "Monsieur Pereira" };
const marjollet = { id: "demo-marjollet", source: "test-local", nom: "Marjollet" };

const DPE = [
  "Diagnostic de performance energetique",
  "DPE actuel : E",
  "N° DPE : 2269E1234567",
  "Surface habitable : 85 m²",
  "Année de construction : 1974",
  "Adresse du bien : 12 rue de la Republique",
  "Code postal : 42110",
  "Commune : FEURS",
  "Chauffage : chaudiere gaz",
  "Eau chaude : ballon electrique",
  "Ventilation : naturelle",
  "Consommation : 331 kWh/m².an",
  "Émissions GES : 55 kg",
  "Il est recommandé d isoler les combles perdus",
].join("\n");

const DEVIS = [
  "DEV-2026-BRUNEL-FEURS-001",
  "Client : Emrick Brunel",
  "Adresse des travaux : 42110 FEURS",
  "Isolation combles 40 m² 3200 €",
].join("\n");

const AUDIT = `${DPE}\nAudit energetique interne\nIl est recommandé de remplacer le chauffage après isolation`;

const BUSSIERES = [
  "DEV-2026-BRUNEL-INDIVISION-COUBLE-V3",
  "Adresse des travaux : Les Lagunes 42510 Bussières",
  "Isolation combles 45 m² 26067 €",
].join("\n");

reinitialiserImportsTests();
reinitialiserBaseTravailTests();

assert(IDS_DOSSIERS_TEST_PROTEGES.includes("demo-pereira"), "Pereira protégé");
assert(IDS_DOSSIERS_TEST_PROTEGES.includes("demo-marjollet"), "Marjollet protégé");

const importDpe = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "DPE-Feurs.pdf",
  typeDocument: "dpe",
  texte: DPE,
});
assert(importDpe.ok, "import DPE");
assert(lireBaseTravailBrunel().logement.surfaceHabitable == null, "logement non rempli avant validation");

const surface = importDpe.etat.champs.find((c) => c.field === "surfaceHabitable");
const dpe = importDpe.etat.champs.find((c) => c.field === "dpeActuel");
const adresse = importDpe.etat.champs.find((c) => c.field === "adresseExacte");
revoirChampImport(feurs.id, surface.id, "valider", {}, ROLE_ADMIN);
revoirChampImport(feurs.id, dpe.id, "valider", {}, ROLE_ADMIN);
revoirChampImport(feurs.id, adresse.id, "valider", {}, ROLE_ADMIN);

const apresDpe = lireBaseTravailBrunel();
assert(String(apresDpe.logement.surfaceHabitable).includes("85"), "DPE → surface logement");
assert(apresDpe.logement.dpeFourni === "E", "DPE → classe logement");
assert(String(apresDpe.logement.adresseExacte).includes("Republique"), "DPE → adresse");
assert(apresDpe.logementSources.surfaceHabitable.sourceDocument === "DPE-Feurs.pdf", "source conservée");
assert(logementManquant(apresDpe.logement).length < 16, "moins de champs manquants");
assert(apresDpe.documents.devis.lignes.length === 0, "devis.lignes toujours vide");
assert(apresDpe.documents.devis.prixFerme === false, "pas de prix ferme");
assert(apresDpe.documents.rapport.bloque === true, "rapport bloqué");
assert(apresDpe.documents.audit.publie === false, "audit non publié");

const importDevis = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "devis-feurs.pdf",
  typeDocument: "devis",
  texte: DEVIS,
});
assert(importDevis.ok, "import devis");
const apresDevis = lireBaseTravailBrunel();
assert(apresDevis.travauxProposes.length >= 1, "travaux proposés");
assert(apresDevis.travauxProposes.every((l) => l.prixFerme === false && l.statut === "propose"), "travaux non validés auto");
assert(apresDevis.documents.devis.lignes.length === 0, "devis n’écrase pas / lignes non fermes");
assert(String(apresDevis.logement.surfaceHabitable).includes("85"), "devis n’écrase pas la surface DPE");

const importAudit = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "audit-feurs.pdf",
  typeDocument: "audit",
  texte: AUDIT,
});
assert(importAudit.ok, "import audit");
const etude = etudierFaisabiliteFeurs(lireBaseTravailBrunel());
assert(etude.titre === TITRE_ETUDE_PREPARATOIRE, "titre étude interne");
assert(!/dpe officiel|audit réglementaire|conformité anah/i.test(etude.titre), "pas un titre réglementaire");
assert(etude.visiteNecessaire === true, "visite nécessaire");
assert(etude.recommandations.length + etude.travauxPotentiels.length > 0, "audit → étude préparatoire");

const bloque = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "devis-couble.pdf",
  typeDocument: "devis",
  texte: BUSSIERES,
});
assert(bloque.ok === false, "Bussières bloqué");
assert(bloque.message === MESSAGE_CONTRADICTION, "message contradiction");
assert(!JSON.stringify(lireBaseTravailBrunel().travauxProposes).includes("26067"), "montants V3 absents");
assert(detecterContaminationBussieres(lireBaseTravailBrunel()).length === 0, "Feurs non contaminé");

assert(importerDocument({ dossier: pereira, role: ROLE_ADMIN, nomFichier: "x.pdf", typeDocument: "dpe", texte: DPE }).ok === false, "Pereira bloqué");
assert(importerDocument({ dossier: marjollet, role: ROLE_ADMIN, nomFichier: "x.pdf", typeDocument: "dpe", texte: DPE }).ok === false, "Marjollet bloqué");

const aides = preparerAidesIndicatives(lireBaseTravailBrunel());
assert(aides.calculable === false, "aides non calculables");
assert(aides.message === MENTION_AIDES_NON_CALCULABLES, "message donnée manquante");
assert(aides.categorieAide == null, "pas de profil MPR inventé");
assert(aides.mention === MENTION_AIDES_INDICATIVES, "disclaimer aides");
assert(aides.sources.some((s) => s.url.includes("service-public.fr")), "source officielle service-public");
assert(aides.sources.every((s) => s.dateVerificationWeb), "date de vérification web");
assert(!/aide garantie|bonus garanti|reste à charge garanti|économie garantie/i.test(JSON.stringify(aides)), "aucune aide affichée comme garantie");

const financement = preparerFinancementIndicatif(lireBaseTravailBrunel());
assert(financement.mention === MENTION_FINANCEMENT_INDICATIF, "financement indicatif");
assert(!/mensualité garantie|taux garanti|accord de prêt garanti/i.test(`${financement.message} ${financement.mention}`), "pas de mensualité garantie");

const financesAdmin = preparerFinancesInternes(lireBaseTravailBrunel(), ROLE_ADMIN);
assert(financesAdmin.coutArtisanHt == null, "pas de coût artisan inventé");
assert(financesAdmin.net_margin == null, "pas de marge sans coût");
const financesCom = preparerFinancesInternes(lireBaseTravailBrunel(), ROLE_COMMERCIAL);
assert(financesCom.coutArtisanHt == null && financesCom.net_margin == null, "marges masquées commercial");
const financesPart = preparerFinancesInternes(lireBaseTravailBrunel(), ROLE_PARTENAIRE);
assert(financesPart.visible === false || financesPart.net_margin == null, "partenaire sans marge");

const commercial = sanitiserBasePourRole(lireBaseTravailBrunel(), ROLE_COMMERCIAL);
assert(commercial.rfr.montant == null, "RFR masqué");
assert(commercial.financesInternes.coutArtisanHt == null, "coût masqué");
assert(commercial.pieces.every((p) => p.numero == null && p.fichier == null), "pièces sans fichier");

const etat = lireEtatImport(feurs.id);
const controles = listerControlesFinaux({
  base: lireBaseTravailBrunel(),
  champs: etat.champs,
  documents: etat.documents,
  role: ROLE_ADMIN,
  dossier: feurs,
});
assert(controles.bloque === true, "rapport final bloqué");
assert(controles.generationBloquee === true, "génération bloquée");
assert(controles.transmissionBloquee === true, "transmission bloquée");
assert(controles.publication === false, "pas de publication");
assert(tenterGenererDocumentFinalBrunel(ROLE_ADMIN).genere === false, "aucun PDF généré");

const synthese = construireDossierTravailSynthese({
  base: lireBaseTravailBrunel(),
  champs: etat.champs,
  documents: etat.documents,
  role: ROLE_ADMIN,
});
assert(synthese.donneesContradictoires >= 0, "synthèse contradictions");
assert(synthese.statut !== "Transmis", "pas de transmission auto");

assert(!existsSync(join(racine, "public", "DPE-Feurs.pdf")), "pas de publication public/");
assert(!existsSync(join(racine, "src", "assets", "DPE-Feurs.pdf")), "pas de publication src/assets");

const factory = creerBaseTravailBrunel();
assert(factory.logement.surfaceHabitable == null, "factory Brunel inchangée");
assert(factory.documents.devis.lignes.length === 0, "factory devis vide");

console.log("OK — lots D–F : préremplissage contrôlé, aides non chiffrées, rapport bloqué, Feurs/Bussières séparés, aucune publication.");
