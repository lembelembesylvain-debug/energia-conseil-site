import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { libelleOptionDepartement, normaliserLogementDpe, trouverDepartementDpe } from "../crm/dpeDepartements.js";
import {
  assujettiDecretTertiaire,
  cibleSolaireIndustriel,
  composerEtudeDecarbonation,
  gtbBacsObligatoire,
  mettreEnPageEtudeDecarbonation,
  peutExporterEtudeB2b,
} from "./decarbonationB2bSniper.ts";
import { composerFicheOpportunite, mettreEnPageFiche, peutExporterFiche } from "./ficheOpportuniteSniper.ts";
import { CENTRE_LOIRE_42, LIBELLE_DEPARTEMENT_42, NB_CIBLES_B2B_42, NB_PARTICULIERS_42 } from "./packProspectionLoire42.ts";
import { classerStatutTransaction } from "./statutTransactionDvf.ts";

const AUJOURDHUI = new Date("2026-10-25T12:00:00");

function lire(nom: string) {
  return JSON.parse(readFileSync(new URL(`../../../public/data/dpe/${nom}`, import.meta.url), "utf8"));
}

const meta = trouverDepartementDpe("42");
assert.ok(meta);
assert.equal(libelleOptionDepartement(meta), LIBELLE_DEPARTEMENT_42);
assert.equal(meta.lat, CENTRE_LOIRE_42.lat);
assert.equal(meta.lng, CENTRE_LOIRE_42.lng);
assert.equal(meta.zoom, CENTRE_LOIRE_42.zoom);

const maisonsBrut = lire("42.json");
const usinesBrut = lire("42-industriel.json");
assert.equal(maisonsBrut.villePrincipale.lat, CENTRE_LOIRE_42.lat);
assert.equal(maisonsBrut.villePrincipale.zoom, CENTRE_LOIRE_42.zoom);
assert.equal(usinesBrut.villePrincipale.nom, "Roanne / Saint-Étienne / Bussières");

const maisons = maisonsBrut.logements.map(normaliserLogementDpe).filter(Boolean);
const usines = usinesBrut.logements.map(normaliserLogementDpe).filter(Boolean);
assert.equal(maisons.length, NB_PARTICULIERS_42);
assert.equal(usines.length, NB_CIBLES_B2B_42);

const communesMaisons = new Set(maisons.map((item) => item.commune));
assert.ok(communesMaisons.has("Bussières"));
assert.ok(communesMaisons.has("Roanne"));

for (const maison of maisons) {
  assert.ok(maison.etiquette === "F" || maison.etiquette === "G", maison.id);
  const fioul = /fioul/i.test(maison.chauffage);
  const vendu = classerStatutTransaction(maison, AUJOURDHUI).id === "vendu_recent";
  assert.ok(fioul || vendu, `${maison.id} ni fioul ni vente récente`);
  const fiche = composerFicheOpportunite(maison, null);
  assert.equal(peutExporterFiche(fiche), true, maison.id);
  assert.match(fiche.adresseComplete, new RegExp(maison.adresse.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.equal(fiche.departement, "Loire");
  const { pdf } = mettreEnPageFiche(fiche);
  assert.equal(pdf.getNumberOfPages(), 1, maison.id);
  const latin = Buffer.from(pdf.output("arraybuffer")).toString("latin1");
  assert.match(latin, new RegExp(maison.codePostal));
}

const vendues = maisons.filter((item) => classerStatutTransaction(item, AUJOURDHUI).id === "vendu_recent");
assert.equal(vendues.length, 2);

for (const usine of usines) {
  assert.ok(usine.surface >= 1000 && usine.surface <= 3000, usine.id);
  assert.equal(assujettiDecretTertiaire(usine), true, usine.id);
  assert.equal(gtbBacsObligatoire(usine), true, usine.id);
  assert.equal(cibleSolaireIndustriel(usine), true, usine.id);
  assert.ok(usine.potentielPvKwc >= 100 && usine.potentielPvKwc <= 500, usine.id);
  const etude = composerEtudeDecarbonation(usine, "industriel");
  if (!etude) throw new Error(`étude absente ${usine.id}`);
  assert.equal(peutExporterEtudeB2b(etude), true, usine.id);
  assert.equal(etude.solaireRetenu, true, usine.id);
  const { pdf, bas } = mettreEnPageEtudeDecarbonation(etude);
  assert.equal(pdf.getNumberOfPages(), 1, usine.id);
  assert.ok(bas < 272, usine.id);
  const latin = Buffer.from(pdf.output("arraybuffer")).toString("latin1");
  assert.match(latin, /BAT-TH-116/);
  assert.match(latin, new RegExp(usine.codePostal));
}

console.log("Pack Loire 42 : 5 particuliers, 5 cibles B2B, fiches A4 OK.");
