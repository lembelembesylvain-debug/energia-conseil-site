import assert from "node:assert/strict";
import {
  assujettiDecretTertiaire,
  cibleDecarbonationChaleur,
  cibleSolaireIndustriel,
  composerEtudeDecarbonation,
  correspondFiltreB2b,
  effacementFactureEdf,
  estModeB2b,
  gtbBacsObligatoire,
  mettreEnPageEtudeDecarbonation,
  EFFACEMENT_MAX_EUR,
  EFFACEMENT_MIN_EUR,
} from "./decarbonationB2bSniper.ts";

assert.equal(estModeB2b("individuel"), false);
assert.equal(estModeB2b("collectif"), false);
assert.equal(estModeB2b("tertiaire"), true);
assert.equal(estModeB2b("industriel"), true);

assert.equal(effacementFactureEdf(100), EFFACEMENT_MIN_EUR);
assert.equal(effacementFactureEdf(500), EFFACEMENT_MAX_EUR);
assert.equal(effacementFactureEdf(300), 67_500);

const tertiaire = {
  id: "71-TER-0001",
  adresse: "Bureaux centre-ville",
  commune: "Chalon-sur-Saône",
  codePostal: "71100",
  surface: 2663,
  decretTertiaire: "Assujetti",
  chauffage: "gaz",
  etiquette: "E",
};
assert.equal(assujettiDecretTertiaire(tertiaire), true);
assert.equal(gtbBacsObligatoire(tertiaire), true);
assert.equal(cibleSolaireIndustriel(tertiaire), true);
assert.equal(cibleDecarbonationChaleur(tertiaire), true);
assert.equal(correspondFiltreB2b(tertiaire, "tous"), true);

const sousSeuil = {
  id: "71-TER-0003",
  adresse: "Commerce",
  surface: 995,
  decretTertiaire: "Non assujetti",
  chauffage: "électrique",
};
assert.equal(assujettiDecretTertiaire(sousSeuil), false);
assert.equal(gtbBacsObligatoire(sousSeuil), true);
assert.equal(cibleSolaireIndustriel(sousSeuil), true);
assert.equal(cibleDecarbonationChaleur(sousSeuil), false);

const petit = { surface: 700, chauffage: "électrique", decretTertiaire: "Non assujetti" };
assert.equal(correspondFiltreB2b(petit, "decret"), false);
assert.equal(correspondFiltreB2b(petit, "bacs"), false);
assert.equal(correspondFiltreB2b(petit, "solaire"), false);
assert.equal(correspondFiltreB2b(petit, "chaleur"), false);

const usine = {
  id: "71-IND-0001",
  adresse: "Zone industrielle nord 1",
  commune: "Chalon-sur-Saône",
  surface: 3448,
  activite: "mécanique",
  potentielPvKwc: 648,
  chauffage: "électrique",
  etiquette: "E",
};
const etude = composerEtudeDecarbonation(usine, "industriel", { reference: "SNIPER-71-IND-0001", section: "ZI", numero: "12" });
if (!etude) throw new Error("étude B2B absente");
assert.equal(etude.reference, "B2B-71-IND-0001");
assert.equal(etude.puissanceKwc, 500);
assert.equal(etude.effacementEur, EFFACEMENT_MAX_EUR);
assert.equal(etude.solaireRetenu, true);
assert.match(etude.decretTexte, /OPERAT/);
assert.match(etude.bacsTexte, /70%/);
assert.match(etude.batTh116, /BAT-TH-116/);
assert.match(etude.indUt117, /IND-UT-117/);

assert.equal(composerEtudeDecarbonation(usine, "individuel"), null);

const { pdf, bas } = mettreEnPageEtudeDecarbonation(etude);
assert.equal(pdf.getNumberOfPages(), 1);
assert.ok(bas < 272, `le contenu déborde le pied de page (${bas})`);
const latin = Buffer.from(pdf.output("arraybuffer")).toString("latin1");
assert.match(latin, /BAT-TH-116/);
assert.match(latin, /IND-UT-117/);
assert.match(latin, /OPERAT/);

console.log("Étude décarbonation B2B : filtres, effacement et PDF A4 OK.");
