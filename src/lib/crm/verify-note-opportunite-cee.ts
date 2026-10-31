/**
 * Note d'opportunité CEE : une page A4 pour chaque fiche du radar.
 * Exécution : npx tsx src/lib/crm/verify-note-opportunite-cee.ts
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DOSSIERS_INGENIERIE_CEE } from "./dossiersIngenierieCee.js";
import { ficheStrategiqueParCode } from "./fichesStrategiquesCee.js";
import { FICHES_CEE_ABROGEES_JO_20261028, FICHES_RADAR_CEE } from "./ceeRadarTravaux.js";
import { corpsSelectionCee } from "./selectionCee.js";
import {
  composerNoteOpportuniteCee,
  creerNoteOpportuniteCee,
  imageDepuisOctets,
  logoDepuisPng,
  MENTION_AIDES_NOTE,
} from "./noteOpportuniteCeePdf.js";

const CODES_DEMANDES = [
  "BAR-TH-164",
  "BAR-TH-104",
  "BAR-TH-173",
  "BAR-TH-148",
  "BAT-TH-116",
  "BAT-TH-104",
  "BAT-EN-101",
  "IND-UT-117",
  "IND-UT-115",
  "IND-UT-102",
];

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const ORDRE_CATALOGUE = [
  "IND-UT-117",
  "IND-UT-116",
  "IND-UT-115",
  "IND-UT-125",
  "IND-UT-121",
  "IND-UT-114",
  "IND-UT-102",
  "IND-UT-129",
  "IND-UT-134",
  "BAT-TH-116",
  "BAT-TH-139",
  "BAT-TH-134",
  "BAT-TH-140",
  "BAT-EQ-127",
  "BAT-TH-104",
  "BAT-EN-101",
  "BAT-TH-157",
  "BAR-TH-164",
  "BAR-TH-145",
  "BAR-TH-104",
  "BAR-EN-101",
  "BAR-EN-102",
  "BAR-EN-103",
  "BAR-TH-148",
  "BAR-TH-173",
];

const presents = new Set(FICHES_RADAR_CEE.map((fiche) => fiche.code));
assert(FICHES_RADAR_CEE.length === 25, `attendu 25 fiches, reçu ${FICHES_RADAR_CEE.length}`);
assert(FICHES_CEE_ABROGEES_JO_20261028.length === 27, "liste JO du 28 octobre 2026");
assert(
  FICHES_RADAR_CEE.filter((fiche) => fiche.segment === "industrie").length === 9,
  "compteur IND",
);
assert(
  FICHES_RADAR_CEE.filter((fiche) => fiche.segment === "tertiaire").length === 8,
  "compteur BAT",
);
assert(
  FICHES_RADAR_CEE.filter((fiche) => fiche.segment === "residentiel").length === 8,
  "compteur BAR",
);
assert(
  FICHES_RADAR_CEE.map((fiche) => fiche.code).join("|") === ORDRE_CATALOGUE.join("|"),
  "ordre du catalogue",
);
for (const code of FICHES_CEE_ABROGEES_JO_20261028) {
  assert(!presents.has(code), `fiche abrogée encore au catalogue : ${code}`);
}
for (const code of CODES_DEMANDES) {
  assert(presents.has(code), `fiche absente du catalogue : ${code}`);
  assert(DOSSIERS_INGENIERIE_CEE[code], `dossier d'ingénierie absent : ${code}`);
}
for (const fiche of FICHES_RADAR_CEE) {
  assert(fiche.argumentCle.length > 12, `${fiche.code} : argument`);
  assert(fiche.estimationMaxEur >= fiche.estimationMinEur, `${fiche.code} : fourchette`);
  const technique = ficheStrategiqueParCode(fiche.code);
  assert(technique?.code === fiche.code, `fiche technique absente : ${fiche.code}`);
  assert(technique.corpsEtat.length >= 1, `${fiche.code} : corps d'état`);
  assert(technique.technologie.length > 3, `${fiche.code} : technologie`);
  assert(technique.economies.length > 3, `${fiche.code} : économies`);
  assert(technique.primeFourchette.includes("€"), `${fiche.code} : prime`);
  assert(technique.volumeCumac.toLowerCase().includes("mwh"), `${fiche.code} : volume`);
  assert(technique.principe.length > 20, `${fiche.code} : principe`);
  assert(technique.equipements.length >= 1 && technique.eligibilite.length >= 1, `${fiche.code} : blocs`);
  assert(technique.image, `${fiche.code} : visuel`);
  const relatif = technique.image.replace(/^\//, "");
  const visuel = join(dirname(fileURLToPath(import.meta.url)), "../../../public", relatif);
  assert(existsSync(visuel), `${fiche.code} : fichier image ${technique.image}`);
}
assert(new Set(FICHES_RADAR_CEE.map((fiche) => fiche.id)).size === 25, "identifiants uniques");
const corpsCatalogue = corpsSelectionCee(
  FICHES_RADAR_CEE.map((fiche) => ({ id: fiche.id, code: fiche.code, intitule: fiche.intitule })),
);
assert(corpsCatalogue.length >= 20 && corpsCatalogue.length <= 20000, `lettre trop longue : ${corpsCatalogue.length}`);
for (const fiche of FICHES_RADAR_CEE) {
  const technique = ficheStrategiqueParCode(fiche.code);
  assert(corpsCatalogue.includes(`${fiche.code} — ${fiche.intitule}`), `lettre ${fiche.code}`);
  assert(corpsCatalogue.includes(technique!.primeFourchette), `prime dans la lettre ${fiche.code}`);
  assert(corpsCatalogue.includes(technique!.corpsEtat[0]), `corps d'état dans la lettre ${fiche.code}`);
}

for (const fiche of FICHES_RADAR_CEE) {
  assert(DOSSIERS_INGENIERIE_CEE[fiche.code], `dossier d'ingénierie absent : ${fiche.code}`);
}

const logo = logoDepuisPng(
  new Uint8Array(
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../public/logo-energia.png")),
  ),
);
assert(logo && logo.width > 200 && logo.height > 80, "logo officiel public/logo-energia.png");

const apercus = ["BAR-TH-164", "BAR-TH-104", "BAR-TH-173", "BAR-TH-148", "BAT-TH-116", "BAT-TH-140", "IND-UT-117"];
const dossierApercu = join(dirname(fileURLToPath(import.meta.url)), "../../../tmp-notes-cee");
mkdirSync(dossierApercu, { recursive: true });

for (const fiche of FICHES_RADAR_CEE) {
  const note = composerNoteOpportuniteCee({
    fiche,
    site: "Ateliers Métallurgiques de la Vallée du Gier et Fils",
    date: new Date("2026-10-20T12:00:00Z"),
  });
  assert(note.titre.startsWith(`NOTE D'OPPORTUNITÉ STRATÉGIQUE CEE - ${fiche.code} :`), note.titre);
  assert(note.actif === "Industriel" || note.actif === "Tertiaire" || note.actif === "Résidentiel", note.actif);
  assert(note.cours.includes("7,45") && note.cours.includes("8,70"), note.cours);
  assert(note.typeSite.length > 8 && note.decideur.length > 4 && note.enjeu.length > 8, fiche.code);
  assert(note.schemaEtapes.length >= 2 && note.schemaEtapes.length <= 4, `${fiche.code} : schéma`);
  assert(note.accroche.length > 10, fiche.code);
  const dossier = DOSSIERS_INGENIERIE_CEE[fiche.code];
  assert(dossier.metrologie.toLowerCase().includes("cofrac"), fiche.code);
  if (fiche.estimationMaxEur >= 15000) {
    assert(note.accroche.includes("quasi-blanche"), `${fiche.code} : ${note.accroche}`);
  } else {
    assert(!note.accroche.includes("quasi-blanche"), `${fiche.code} : ${note.accroche}`);
  }
  const pdf = creerNoteOpportuniteCee({
    fiche,
    site: note.site,
    date: new Date("2026-10-20T12:00:00Z"),
    logo,
  });
  assert(pdf.getNumberOfPages() === 2, `${fiche.code} : ${pdf.getNumberOfPages()} pages`);
  const brutTexte = Buffer.from(pdf.output("arraybuffer")).toString("latin1");
  assert(brutTexte.includes("/Subtype") || brutTexte.includes("Image"), `${fiche.code} : logo absent`);
  if (apercus.includes(fiche.code)) {
    const brut = Buffer.from(pdf.output("arraybuffer"));
    writeFileSync(join(dossierApercu, `${fiche.code}.pdf`), brut);
  }
}

const residentiel = FICHES_RADAR_CEE.find((fiche) => fiche.code === "BAR-TH-173");
assert(residentiel, "BAR-TH-173");
const noteResidentielle = composerNoteOpportuniteCee({ fiche: residentiel!, site: "   " });
assert(noteResidentielle.site === "Site à préciser", noteResidentielle.site);
assert(noteResidentielle.actif === "Résidentiel", noteResidentielle.actif);
assert(MENTION_AIDES_NOTE.includes("à titre indicatif"), "mention aides");

const ind = FICHES_RADAR_CEE.find((fiche) => fiche.code === "IND-UT-117");
assert(ind, "IND-UT-117");
const schema = imageDepuisOctets(
  new Uint8Array(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../public/assets/cee/ind-ut-117.jpg"))),
);
assert(schema && schema.width > 400, "schéma 3D IND-UT-117");
const pdfImage = creerNoteOpportuniteCee({
  fiche: ind!,
  site: "Usine test",
  date: new Date("2026-10-20T12:00:00Z"),
  logo,
  schema,
});
const brutImage = Buffer.from(pdfImage.output("arraybuffer")).toString("latin1");
assert(brutImage.includes("DCTDecode"), "le schéma JPEG doit être intégré au PDF");
assert(!brutImage.includes("32 500") && !brutImage.includes("72 %"), "la marge interne ne doit pas figurer");

const pac = FICHES_RADAR_CEE.find((fiche) => fiche.code === "BAR-TH-104");
assert(pac, "BAR-TH-104");
const schemaPac = imageDepuisOctets(
  new Uint8Array(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../public/assets/cee/bar-th-104.jpg"))),
);
assert(schemaPac && schemaPac.width > 400, "schéma 3D BAR-TH-104");
const pdfPac = creerNoteOpportuniteCee({
  fiche: pac!,
  site: "Maison test",
  date: new Date("2026-10-20T12:00:00Z"),
  logo,
  schema: schemaPac,
});
const brutPac = Buffer.from(pdfPac.output("arraybuffer")).toString("latin1");
assert(brutPac.includes("DCTDecode"), "le schéma PAC doit être intégré au PDF");
assert(pdfPac.getNumberOfPages() === 2, "BAR-TH-104 : deux pages");

const combles = FICHES_RADAR_CEE.find((fiche) => fiche.code === "BAR-EN-101");
assert(combles, "BAR-EN-101");
const schemaCombles = imageDepuisOctets(
  new Uint8Array(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../public/assets/cee/bar-en-101.jpg"))),
);
assert(schemaCombles && schemaCombles.width > 400, "schéma 3D BAR-EN-101");
const pdfCombles = creerNoteOpportuniteCee({
  fiche: combles!,
  site: "Maison test",
  date: new Date("2026-10-20T12:00:00Z"),
  logo,
  schema: schemaCombles,
});
const brutCombles = Buffer.from(pdfCombles.output("arraybuffer")).toString("latin1");
assert(brutCombles.includes("DCTDecode"), "le schéma combles doit être intégré au PDF");
assert(pdfCombles.getNumberOfPages() === 2, "BAR-EN-101 : deux pages");

const murs = FICHES_RADAR_CEE.find((fiche) => fiche.code === "BAR-EN-102");
assert(murs, "BAR-EN-102");
const schemaMurs = imageDepuisOctets(
  new Uint8Array(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../public/assets/cee/bar-en-102.jpg"))),
);
assert(schemaMurs && schemaMurs.width > 400, "schéma 3D BAR-EN-102");
const pdfMurs = creerNoteOpportuniteCee({
  fiche: murs!,
  site: "Maison test",
  date: new Date("2026-10-20T12:00:00Z"),
  logo,
  schema: schemaMurs,
});
const brutMurs = Buffer.from(pdfMurs.output("arraybuffer")).toString("latin1");
assert(brutMurs.includes("DCTDecode"), "le schéma ITE doit être intégré au PDF");
assert(pdfMurs.getNumberOfPages() === 2, "BAR-EN-102 : deux pages");

const plancher = FICHES_RADAR_CEE.find((fiche) => fiche.code === "BAR-EN-103");
assert(plancher, "BAR-EN-103");
const schemaPlancher = imageDepuisOctets(
  new Uint8Array(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../public/assets/cee/bar-en-103.jpg"))),
);
assert(schemaPlancher && schemaPlancher.width > 400, "schéma 3D BAR-EN-103");
const pdfPlancher = creerNoteOpportuniteCee({
  fiche: plancher!,
  site: "Maison test",
  date: new Date("2026-10-20T12:00:00Z"),
  logo,
  schema: schemaPlancher,
});
const brutPlancher = Buffer.from(pdfPlancher.output("arraybuffer")).toString("latin1");
assert(brutPlancher.includes("DCTDecode"), "le schéma plancher bas doit être intégré au PDF");
assert(pdfPlancher.getNumberOfPages() === 2, "BAR-EN-103 : deux pages");

const cet = FICHES_RADAR_CEE.find((fiche) => fiche.code === "BAR-TH-148");
assert(cet, "BAR-TH-148");
const schemaCet = imageDepuisOctets(
  new Uint8Array(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../public/assets/cee/bar-th-148.jpg"))),
);
assert(schemaCet && schemaCet.width > 400, "schéma 3D BAR-TH-148");
const pdfCet = creerNoteOpportuniteCee({
  fiche: cet!,
  site: "Maison test",
  date: new Date("2026-10-20T12:00:00Z"),
  logo,
  schema: schemaCet,
});
const brutCet = Buffer.from(pdfCet.output("arraybuffer")).toString("latin1");
assert(brutCet.includes("DCTDecode"), "le schéma CET doit être intégré au PDF");
assert(pdfCet.getNumberOfPages() === 2, "BAR-TH-148 : deux pages");

const thermostat = FICHES_RADAR_CEE.find((fiche) => fiche.code === "BAR-TH-173");
assert(thermostat, "BAR-TH-173");
const schemaThermostat = imageDepuisOctets(
  new Uint8Array(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../../public/assets/cee/bar-th-173.jpg"))),
);
assert(schemaThermostat && schemaThermostat.width > 400, "schéma 3D BAR-TH-173");
const pdfThermostat = creerNoteOpportuniteCee({
  fiche: thermostat!,
  site: "Maison test",
  date: new Date("2026-10-20T12:00:00Z"),
  logo,
  schema: schemaThermostat,
});
const brutThermostat = Buffer.from(pdfThermostat.output("arraybuffer")).toString("latin1");
assert(brutThermostat.includes("DCTDecode"), "le schéma thermostat doit être intégré au PDF");
assert(pdfThermostat.getNumberOfPages() === 2, "BAR-TH-173 : deux pages");

console.log(`OK — ${FICHES_RADAR_CEE.length} notes CEE sur deux pages A4.`);
console.log(`Aperçus : ${dossierApercu}`);
