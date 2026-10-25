import assert from "node:assert/strict";
import { composerFicheOpportunite } from "./ficheOpportuniteSniper.ts";
import { mettreEnPageEtudeSolaire } from "./etudeSolaireSniper.ts";
import { calculerEtudeSolaire } from "./solaireCalculs.ts";
import { factureEdfEstimee } from "./statutMarcheDpe.ts";

const facture = factureEdfEstimee(88, 365);
assert.equal(facture, 8030);

const creusot = calculerEtudeSolaire({
  surfaceHabitableM2: 88,
  chauffage: "électricité",
  consoKwhM2: 365,
  etiquette: "F",
  typeBati: "maison",
});
const creusotIgn = calculerEtudeSolaire({
  empriseM2: 7,
  empriseFiable: false,
  surfaceHabitableM2: 88,
  chauffage: "électricité",
  consoKwhM2: 365,
  etiquette: "F",
  typeBati: "maison",
});
assert.equal(creusotIgn.puissanceKwc, 9, "une emprise IGN aberrante ne réduit pas le 109");

assert.equal(creusot.puissanceKwc, 9);
assert.equal(creusot.nombreModules, 18);
assert.equal(creusot.productionAnnuelleKwh, 9 * 1150);
assert.equal(creusot.factureActuelleEur, 8030);
assert.equal(creusot.economieAnnuelleEur, 2216);
assert.ok(creusot.toitureIdeale);
assert.ok(creusot.roiAnnees != null && creusot.roiAnnees > 7, "le retour suit le tarif OA de juin 2026");

const fiche = composerFicheOpportunite(
  {
    id: "71-DPE-0040",
    adresse: "109 Rue de la République",
    commune: "Le Creusot",
    codePostal: "71200",
    surface: 88,
    conso: 365,
    chauffage: "électrique",
    etiquette: "F",
    motifDpe: "vente",
  },
  null,
);
assert.equal(fiche.libelleMotif, "VENTE EN COURS");
assert.match(fiche.impactCombustible, /8 030 EUR/);
assert.ok(fiche.preconisations.some((ligne) => ligne.includes("Tesla Powerwall 3")));

const { pdf, bas } = mettreEnPageEtudeSolaire(fiche);
assert.equal(pdf.getNumberOfPages(), 1);
assert.ok(bas < 274, `étude solaire déborde (${bas})`);
const latin = Buffer.from(pdf.output("arraybuffer")).toString("latin1");
assert.ok(latin.includes("8030") || latin.includes("8 030"));
assert.ok(latin.includes("QualiPV"));
assert.equal(latin.includes("\u20AC"), false);

console.log("Étude solaire Le Creusot : 9 kWc, facture 8 030 EUR, PDF A4 OK.");
