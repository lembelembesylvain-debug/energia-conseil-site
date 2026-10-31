/**
 * Contrôles de séparation Feurs / référence Bussières — Indivision COUBLE V3.
 * Exécution : node src/lib/crm/verify-references-documentaires.js
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { creerBaseTravailBrunel, detecterContaminationBussieres } from "./brunelWorkingBase.js";
import { etudierFaisabiliteFeurs } from "./etudeFaisabilite.js";
import {
  ALERTE_REFERENCE_BUSSIERES_DISTINCTE,
  REFERENCE_BRUNEL_COUBLE_V3,
  REFERENCE_BRUNEL_COUBLE_V3_ID,
  estFusionFeursBussieresInterdite,
  listerReferencesDocumentaires,
  sanitiserReferencePourRole,
} from "./referencesDocumentaires.js";
import { ROLE_ADMIN, ROLE_COMMERCIAL } from "./roles.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const racine = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const pdfDansDepot = join(racine, "Devis — BRUNEL _ Indivision COUBLE — V3.pdf");
assert(!existsSync(pdfDansDepot), "le PDF V3 n’est pas copié à la racine du dépôt");
assert(!existsSync(join(racine, "public", "Devis — BRUNEL _ Indivision COUBLE — V3.pdf")), "pas de PDF V3 dans public/");
assert(
  existsSync(join(racine, "DEVIS_BRUNEL_Indivision_COUBLE_2026_FINAL.html")),
  "HTML FINAL racine présent",
);
assert(
  existsSync(join(racine, "public", "DEVIS_BRUNEL_Indivision_COUBLE_2026_FINAL.html")),
  "HTML FINAL public présent",
);

const reference = REFERENCE_BRUNEL_COUBLE_V3;
assert(reference.id === REFERENCE_BRUNEL_COUBLE_V3_ID, "id référence");
assert(reference.numero === "CONTRAT-2026-BRUNEL-INDIVISION-COUBLE-FINAL", "numéro FINAL");
assert(reference.associeAuDossierFeurs === true, "associé au dossier Brunel");
assert(reference.fusionInterdite === false, "fusion autorisée (même chantier)");
assert(reference.fichierDansDepot === true, "HTML FINAL dans le dépôt");
assert(reference.cheminPublic === "/DEVIS_BRUNEL_Indivision_COUBLE_2026_FINAL.html", "chemin public");
assert(reference.montantsImportes === true, "montants V3 associés");
assert(reference.lignesTravauxImportees === true, "lignes V3 associées");
assert(reference.aidesImportees === true, "aides V3 associées");
assert(reference.adressesImporteesVersFeurs === true, "adresse chantier associée");
assert(!("totalHt" in reference), "pas de total HT sur la référence");
assert(!("totalTtc" in reference), "pas de total TTC sur la référence");
assert(!("rfr" in reference), "pas de RFR V3 exposé");
assert(!("lignes" in reference), "pas de lignes travaux");
assert(reference.alerte === ALERTE_REFERENCE_BUSSIERES_DISTINCTE, "alerte de non-association");
assert(reference.perimetre.villeTravaux === "Bussières", "périmètre Bussières sur la référence seule");
assert(reference.perimetre.codePostalTravaux === "42510", "CP travaux sur la référence seule");

const liste = listerReferencesDocumentaires();
assert(liste.length === 1 && liste[0].id === reference.id, "une seule référence V3");

const brunel = creerBaseTravailBrunel();
assert(estFusionFeursBussieresInterdite(brunel, reference) === false, "même chantier Bussières : association OK");
assert(brunel.rfr.montant === 20216, "RFR V3");
assert(detecterContaminationBussieres(brunel).length === 0, "pas de contamination");

const etude = etudierFaisabiliteFeurs(brunel);
assert(etude.statut === "À compléter", "étude à compléter");
assert(etude.niveauConfiance === "insuffisant", "confiance insuffisante");
assert(etude.visiteNecessaire === true, "visite nécessaire");
assert(etude.devisRgeNecessaire === true, "devis RGE nécessaire");
assert(!/jaune|bleu|violet|rose/i.test(JSON.stringify(etude.presentes)), "pas de profil MPR inventé");

const admin = sanitiserReferencePourRole(reference, ROLE_ADMIN);
assert(admin.totaux == null, "admin : pas de totaux");
assert(admin.lignes.length === 0, "admin : pas de lignes");
assert(admin.rfr == null, "admin : pas de RFR V3");
assert(admin.fichier == null, "admin : pas de fichier");

const commercial = sanitiserReferencePourRole(reference, ROLE_COMMERCIAL);
assert(!JSON.stringify(commercial).includes("42510"), "commercial : pas d’adresse Bussières");
assert(!JSON.stringify(commercial).includes("20216"), "commercial : pas de RFR V3");
assert(!JSON.stringify(commercial).toLowerCase().includes("bussières"), "commercial : pas de Bussières");

console.log("OK — référence FINAL associée au dossier Brunel, HTML signable dans public/.");
