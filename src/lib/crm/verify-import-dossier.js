/**
 * Tests lots A–C : import sécurisé, extraction proposée, parseurs bornés.
 * Exécution : node src/lib/crm/verify-import-dossier.js
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { ROLE_ADMIN, ROLE_COMMERCIAL, peutImporterDocument } from "./roles.js";
import { creerBaseTravailBrunel } from "./brunelWorkingBase.js";
import { IDS_DOSSIERS_TEST_PROTEGES } from "./projetsManuels.js";
import { MESSAGE_CONTRADICTION } from "./gardeFousImport.js";
import { extraireTextePdf } from "./parseurs/texte.js";
import { extraireCsvDepuisXlsx } from "./parseurs/xlsx.js";
import {
  importerDocument,
  lireEtatImport,
  reinitialiserImportsTests,
  revoirChampImport,
} from "./importDocuments.js";

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

const DPE_FEURS = [
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

const DPE_FEURS_SURFACE_90 = DPE_FEURS.replace("85 m²", "90 m²");

const DEVIS_FEURS = [
  "DEV-2026-BRUNEL-FEURS-001",
  "Client : Emrick Brunel",
  "Adresse des travaux : 42110 FEURS",
  "Isolation combles 40 m² 3200 €",
  "ITE 25 m² 80-120 €",
].join("\n");

const DEVIS_BUSSIERES = [
  "DEV-2026-BRUNEL-INDIVISION-COUBLE-V3",
  "Client : Emrick Brunel",
  "Adresse des travaux : Les Lagunes 42510 Bussières",
  "Isolation combles 45 m² 26067 €",
  "Total TTC 27502 €",
].join("\n");

const CSV_LOGEMENT = [
  "champ;valeur;unite",
  "surfaceHabitable;72;m²",
  "codePostal;42110;",
  "commune;FEURS",
  "dpeActuel;E",
].join("\n");

const CSV_DEVIS = ["prestation;quantite;unite;prixHt", "Isolation combles;40;m²;3200"].join("\n");

function pdfDepuisTexte(texte) {
  const escaped = String(texte).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  return new TextEncoder().encode(`%PDF-1.4\n1 0 obj\nBT (${escaped}) Tj ET\nendobj\n%%EOF`);
}

function zipDeflate(fichiers) {
  const parts = [];
  for (const [nom, contenu] of Object.entries(fichiers)) {
    const nameBytes = Buffer.from(nom);
    const raw = Buffer.isBuffer(contenu) ? contenu : Buffer.from(contenu);
    const compressed = deflateRawSync(raw);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0, 6);
    header.writeUInt16LE(8, 8);
    header.writeUInt32LE(compressed.length, 18);
    header.writeUInt32LE(raw.length, 22);
    header.writeUInt16LE(nameBytes.length, 26);
    header.writeUInt16LE(0, 28);
    parts.push(header, nameBytes, compressed);
  }
  return new Uint8Array(Buffer.concat(parts));
}

reinitialiserImportsTests();

assert(peutImporterDocument(ROLE_ADMIN) === true, "admin peut importer");
assert(peutImporterDocument(ROLE_COMMERCIAL) === false, "commercial ne peut pas importer");
assert(IDS_DOSSIERS_TEST_PROTEGES.includes("demo-pereira"), "Pereira protégé");
assert(IDS_DOSSIERS_TEST_PROTEGES.includes("demo-marjollet"), "Marjollet protégé");

const refuseCommercial = importerDocument({
  dossier: feurs,
  role: ROLE_COMMERCIAL,
  nomFichier: "DPE.pdf",
  typeDocument: "dpe",
  texte: DPE_FEURS,
});
assert(refuseCommercial.ok === false, "import commercial refusé");
assert(lireEtatImport(feurs.id).documents.length === 0, "aucun document stocké pour un refus rôle");

const refusePereira = importerDocument({
  dossier: pereira,
  role: ROLE_ADMIN,
  nomFichier: "DPE.pdf",
  typeDocument: "dpe",
  texte: DPE_FEURS,
});
assert(refusePereira.ok === false, "Pereira : import refusé");
assert(lireEtatImport("demo-pereira").documents.length === 0, "Pereira : pas de métadonnées d’import");

const refuseMarjollet = importerDocument({
  dossier: marjollet,
  role: ROLE_ADMIN,
  nomFichier: "DPE.pdf",
  typeDocument: "dpe",
  texte: DPE_FEURS,
});
assert(refuseMarjollet.ok === false, "Marjollet : import refusé");

const pdfDpe = extraireTextePdf(pdfDepuisTexte(`${DPE_FEURS} ${DPE_FEURS}`));
assert(pdfDpe.ok, "PDF texte DPE extractible");
assert(/85/.test(pdfDpe.texte), "PDF DPE contient la surface");

const importDpe = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "DPE-Feurs.pdf",
  typeMime: "application/pdf",
  typeDocument: "dpe",
  binaire: pdfDepuisTexte(`${DPE_FEURS}\n${DPE_FEURS}`),
});
assert(importDpe.ok, "import DPE Feurs");
assert(importDpe.publication === false, "aucune publication");
assert(importDpe.aidesCalculees === false, "aides non calculées");
assert(importDpe.documentFinalGenere === false, "pas de document final");
assert(importDpe.document.lienSecurise == null, "pas de lien public sans coffre");
assert(importDpe.document.statutAnalyse === "analyse_terminee", "analyse DPE terminée");

const surface = importDpe.etat.champs.find((c) => c.field === "surfaceHabitable");
assert(surface?.value === 85, "surface extraite 85");
assert(surface.unit === "m²", "unité m²");
assert(surface.sourceDocument === "DPE-Feurs.pdf", "source document");
assert(surface.sourcePage === 1, "page source");
assert(surface.confidence === "high", "confiance élevée surface");
assert(surface.status === "proposed", "statut proposé");
assert(importDpe.etat.champs.find((c) => c.field === "dpeActuel")?.value === "E", "DPE E");
assert(importDpe.etat.champs.find((c) => c.field === "codePostal")?.value === "42110", "CP Feurs");
assert(
  importDpe.etat.champs.some((c) => c.nEstPasUneLigneTravaux && /recommand/i.test(String(c.value))),
  "recommandation extraite sans devenir travaux",
);
assert(
  !importDpe.etat.champs.some((c) => c.categorie === "travaux"),
  "un DPE ne crée pas de ligne de travaux",
);
assert(
  !JSON.stringify(importDpe.etat.champs).toLowerCase().includes("aide garantie"),
  "pas d’aide garantie",
);

const importDpeConflit = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "DPE-Feurs-2.pdf",
  typeDocument: "dpe",
  texte: DPE_FEURS_SURFACE_90,
});
assert(importDpeConflit.ok, "second DPE accepté");
const surfaceApres = importDpeConflit.etat.champs.find((c) => c.field === "surfaceHabitable");
assert(surfaceApres.value === 85, "valeur existante conservée");
assert(surfaceApres.status === "conflicting", "conflit signalé");
assert(surfaceApres.valeurProposee === 90, "nouvelle valeur en proposition");

const importDevis = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "devis-feurs.pdf",
  typeDocument: "devis",
  texte: DEVIS_FEURS,
});
assert(importDevis.ok, "import devis Feurs");
const lignes = importDevis.etat.champs.filter((c) => c.categorie === "travaux");
assert(lignes.length >= 1, "au moins une ligne travaux proposée");
assert(
  lignes.every((l) => l.prixFerme === false && l.value?.prixFerme === false),
  "aucun prix ferme",
);
const fourchette = lignes.find((l) => l.sourcePrix === "fourchette" || l.value?.sourcePrix === "fourchette");
assert(fourchette, "fourchette ITE restée indicative");
assert(fourchette.value?.prixHt == null, "fourchette sans prix inventé");
assert(
  !lignes.some((l) => l.value?.prixHt === 80 && /ITE/i.test(String(l.value?.prestation))),
  "80-120 € n’est pas devenu un prix ferme de 80",
);
assert(importDevis.etat.champs.find((c) => c.field === "surfaceHabitable")?.value === 85, "devis n’écrase pas le DPE");

const bloqueBussieres = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "devis-couble-v3.pdf",
  typeDocument: "devis",
  texte: DEVIS_BUSSIERES,
});
assert(bloqueBussieres.ok === false, "Bussières bloqué sur Feurs");
assert(bloqueBussieres.message === MESSAGE_CONTRADICTION, "message contradiction");
assert(
  !JSON.stringify(bloqueBussieres.etat.champs).includes("26067"),
  "montants V3 non importés",
);
assert(
  !JSON.stringify(bloqueBussieres.etat.champs).includes("27502"),
  "TTC V3 non importé",
);
assert(
  bloqueBussieres.etat.documents[0].statutAnalyse === "bloque_contradiction",
  "métadonnée d’import bloqué",
);

const csv = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "logement.csv",
  typeMime: "text/csv",
  typeDocument: "dpe",
  texte: CSV_LOGEMENT,
});
assert(csv.ok, "import CSV");
assert(csv.etat.champs.find((c) => c.field === "surfaceHabitable")?.status === "conflicting", "CSV ne silencieux-écrase pas");

const csvDevis = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "devis.csv",
  typeMime: "text/csv",
  typeDocument: "devis",
  texte: CSV_DEVIS,
});
assert(csvDevis.ok, "CSV devis");
assert(
  csvDevis.etat.champs.some((c) => c.field.startsWith("ligneTravaux:") && c.value?.quantite === 40),
  "ligne CSV proposée",
);

const xmlStrings =
  '<?xml version="1.0"?><sst><si><t>champ</t></si><si><t>valeur</t></si><si><t>surfaceHabitable</t></si></sst>';
const xmlSheet =
  '<?xml version="1.0"?><worksheet><sheetData>' +
  '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>' +
  '<row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2"><v>85</v></c></row>' +
  "</sheetData></worksheet>";
const xlsxBytes = zipDeflate({
  "xl/sharedStrings.xml": xmlStrings,
  "xl/worksheets/sheet1.xml": xmlSheet,
});
const xlsxCsv = extraireCsvDepuisXlsx(xlsxBytes, inflateRawSync);
assert(xlsxCsv.ok, "XLSX lu");
assert(/surfaceHabitable/.test(xlsxCsv.csv), "XLSX contient le champ");

const xlsxImport = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "logement.xlsx",
  typeMime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  typeDocument: "dpe",
  binaire: xlsxBytes,
  inflateRaw: inflateRawSync,
});
assert(xlsxImport.ok, "import XLSX");

const scan = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "scan.pdf",
  typeMime: "application/pdf",
  typeDocument: "dpe",
  binaire: new TextEncoder().encode("%PDF-1.4 /Subtype /Image %%EOF"),
});
assert(scan.ok, "PDF scanné accepté comme pièce");
assert(scan.document.statutAnalyse === "piece_jointe_sans_extraction", "scan sans extraction");
assert(scan.champsProposes.length === 0, "scan : aucun champ");

const photo = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "facade.png",
  typeMime: "image/png",
  typeDocument: "photo_logement",
  binaire: new Uint8Array([137, 80, 78, 71]),
});
assert(photo.document.statutAnalyse === "piece_jointe_sans_extraction", "image sans OCR");

const avis = importerDocument({
  dossier: feurs,
  role: ROLE_ADMIN,
  nomFichier: "avis-impot.pdf",
  typeDocument: "avis_impot",
  texte: "Revenu fiscal de référence 18785 €",
});
assert(avis.champsProposes.length === 0, "avis d’impôt : pas d’extraction automatique");

const champSurface = lireEtatImport(feurs.id).champs.find((c) => c.field === "surfaceHabitable");
const valide = revoirChampImport(feurs.id, champSurface.id, "valider", {}, ROLE_ADMIN);
assert(valide.etat.champs.find((c) => c.id === champSurface.id).status === "validated", "revue valider");
assert(valide.etat.champs.find((c) => c.id === champSurface.id).validatedBy === "administrateur", "validé par admin");

const autre = valide.etat.champs.find((c) => c.field === "dpeActuel");
const modifie = revoirChampImport(feurs.id, autre.id, "modifier", { valeur: "D" }, ROLE_ADMIN);
assert(modifie.etat.champs.find((c) => c.id === autre.id).status === "manually_corrected", "revue modifier");
assert(modifie.etat.champs.find((c) => c.id === autre.id).value === "D", "valeur corrigée");
assert(modifie.etat.champs.find((c) => c.id === autre.id).historique.length >= 2, "historique conservé");

const reco = modifie.etat.champs.find((c) => c.nEstPasUneLigneTravaux);
const rejet = revoirChampImport(feurs.id, reco.id, "rejeter", {}, ROLE_ADMIN);
assert(rejet.etat.champs.find((c) => c.id === reco.id).status === "rejected", "revue rejeter");

const refuseRevueCommercial = revoirChampImport(feurs.id, champSurface.id, "valider", {}, ROLE_COMMERCIAL);
assert(refuseRevueCommercial.ok === false, "commercial ne revoit pas");

const base = creerBaseTravailBrunel();
assert(base.logement.surfaceHabitable == null, "logement Feurs non prérempli (lot D bloqué)");
assert(base.documents.devis.lignes.length === 0, "devis Feurs toujours vide");
assert(base.documents.rapport.bloque === true, "rapport toujours bloqué");
assert(base.documents.devis.prixFerme === false, "pas de prix ferme dossier");
assert(base.rfr.categorieAide == null, "pas de catégorie MPR");

assert(!existsSync(join(racine, "public", "DPE-Feurs.pdf")), "pas de PDF dans public/");
assert(!existsSync(join(racine, "src", "assets", "DPE-Feurs.pdf")), "pas de PDF dans src/assets/");
assert(!existsSync(join(racine, "DPE-Feurs.pdf")), "pas de PDF à la racine");

const journal = lireEtatImport(feurs.id).journal;
assert(journal.some((e) => e.action === "import_document"), "journal des imports");
assert(journal.some((e) => e.action === "import_bloque_contradiction"), "journal du blocage Bussières");
assert(journal.some((e) => e.action === "revue_valider"), "journal revue");

console.log("OK — import A–C : coffre métadonnées, extraction proposée, Feurs/Bussières séparés, Pereira/Marjollet intacts.");
