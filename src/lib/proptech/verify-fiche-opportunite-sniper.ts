/**
 * Vérifie le relevé Chagny / Corpeau et la mise en page A4 (une page, sans euro mal encodé).
 * Lancement : npx tsx src/lib/proptech/verify-fiche-opportunite-sniper.ts
 */
import assert from "node:assert/strict";
import {
  CIBLES_TERRAIN_CHAGNY,
  composerFicheOpportunite,
  etiquetteDepuisConso,
  mettreEnPageFiche,
  textePdf,
  type LogementPourFiche,
} from "./ficheOpportuniteSniper.ts";

const annee = new Date().getFullYear();

function logementDe(id: string): LogementPourFiche {
  const cible = CIBLES_TERRAIN_CHAGNY.find((item) => item.id === id);
  assert.ok(cible, id);
  return {
    id: cible.id,
    adresse: cible.adresse,
    commune: cible.commune === "Corpeau" ? "Chagny" : cible.commune,
    codePostal: cible.commune === "Corpeau" ? "71150" : cible.codePostal,
    surface: cible.surfaceHabitableM2,
    annee: cible.anneeConstruction,
    type: "maison",
    chauffage: cible.chauffage,
    conso: cible.consoKwhM2,
    etiquette: "C",
  };
}

for (const cible of CIBLES_TERRAIN_CHAGNY) {
  assert.equal(
    etiquetteDepuisConso(cible.consoKwhM2),
    cible.etiquette,
    `${cible.adresse} : la lettre doit suivre le barème ADEME`,
  );
}

const cible103 = composerFicheOpportunite(logementDe("71-DPE-0023"), {
  cadastre: { parcelle: { section: "ZZ", numero: "9", surfaceTerrainM2: 100 }, bati: { empriseSolM2: 40 } },
  dvf: { prixM2Median: 900, mutations: [] },
});
assert.equal(cible103.ancreeSurReleve, true);
assert.equal(cible103.section, "AB");
assert.equal(cible103.numero, "0102");
assert.equal(cible103.terrainM2, 10320);
assert.equal(cible103.empriseM2, 18);
assert.equal(cible103.etiquette, "F");
assert.equal(cible103.consoKwhM2, 354);
assert.equal(cible103.chauffage, "Bois");
assert.equal(cible103.surfaceHabitableM2, 161);
assert.equal(cible103.prixM2Median, 1375);
assert.equal(cible103.valeurSectorielle, 161 * 1375);
assert.equal(cible103.reference, `SNIPER-71-${annee}-AB0102`);
assert.match(cible103.statutClimat, /Passoire thermique F/);
assert.match(cible103.statutClimat, /gel des loyers/);

const cible68 = composerFicheOpportunite(logementDe("71-DPE-0021"), null);
assert.equal(cible68.terrainM2, 30390);
assert.equal(cible68.numero, "0049");
assert.equal(cible68.etiquette, "G");
assert.equal(cible68.valeurSectorielle, 129 * 1475);
assert.match(cible68.statutClimat, /Passoire thermique G/);

const cible15 = composerFicheOpportunite(logementDe("71-DPE-0020"), null);
assert.equal(cible15.etiquette, "G");
assert.equal(cible15.consoKwhM2, 475);
assert.equal(cible15.section, "");
assert.equal(cible15.prixM2Median, null);
assert.equal(cible15.reference, `SNIPER-71-${annee}-0020`);
assert.match(cible15.statutClimat, /G extrême/);
assert.match(cible15.noteMarche, /historique/i);

const cible149 = composerFicheOpportunite(logementDe("71-DPE-0022"), null);
assert.equal(cible149.etiquette, "D");
assert.equal(cible149.consoKwhM2, 209);
assert.equal(cible149.section, "AC");
assert.equal(cible149.numero, "0033");
assert.equal(cible149.terrainM2, 1257);
assert.equal(cible149.empriseM2, 246);
assert.equal(cible149.transactions[0]?.prixNet, 400000);
assert.equal(cible149.valeurSectorielle, null);

const cible150 = composerFicheOpportunite(logementDe("71-DPE-0017"), null);
assert.equal(cible150.etiquette, "D");
assert.equal(cible150.terrainM2, 12257);
assert.equal(cible150.empriseM2, 161);
assert.equal(cible150.numero, "0058");

const cible48 = composerFicheOpportunite(logementDe("71-DPE-0018"), null);
assert.equal(cible48.etiquette, "E");
assert.equal(cible48.terrainM2, 14543);
assert.equal(cible48.section, "BD");

const cible125 = composerFicheOpportunite(logementDe("71-DPE-0019"), null);
assert.equal(cible125.etiquette, "E");
assert.equal(cible125.terrainM2, 800);
assert.equal(cible125.prixM2Median, 2222);
assert.equal(cible125.valeurSectorielle, 103 * 2222);
assert.equal(cible125.transactions[0]?.prixNet, 361800);
assert.equal(cible125.reference, `SNIPER-71-${annee}-BK0239`);

const corpeau = composerFicheOpportunite(logementDe("71-DPE-0024"), null);
assert.equal(corpeau.commune, "Corpeau");
assert.equal(corpeau.codeDep, "21");
assert.equal(corpeau.departement, "Côte-d'Or");
assert.equal(corpeau.etiquette, "F");
assert.equal(corpeau.terrainM2, 2796);
assert.equal(corpeau.reference, `SNIPER-21-${annee}-AI0016`);
assert.match(corpeau.adresseComplete, /21190 Corpeau/);

const live = composerFicheOpportunite(
  {
    id: "hors-catalogue",
    adresse: "1 Rue du Test",
    commune: "Mâcon",
    codePostal: "71000",
    surface: 100,
    annee: 1980,
    type: "appartement",
    chauffage: "électrique",
    conso: 280,
  },
  {
    cadastre: {
      parcelle: { section: "cd", numero: "12", commune: "Mâcon", codeDep: "71", surfaceTerrainM2: 500 },
      bati: { empriseSolM2: 80 },
    },
    dvf: { prixM2Median: 1500, perimetre: "rue", mutations: [] },
  },
);
assert.equal(live.ancreeSurReleve, false);
assert.equal(live.section, "CD");
assert.equal(live.numero, "0012");
assert.equal(live.etiquette, "E");
assert.equal(live.typeBati, "Immeuble");
assert.equal(live.chauffage, "Électricité");
assert.equal(live.valeurSectorielle, 150000);

assert.equal(etiquetteDepuisConso(209), "D");
assert.equal(etiquetteDepuisConso(257), "E");
assert.equal(etiquetteDepuisConso(306), "E");
assert.equal(textePdf("1 375 € / m²"), "1 375 EUR / m2");
assert.equal(textePdf("ENERGIA®").includes("\u20AC"), false);

for (const cible of CIBLES_TERRAIN_CHAGNY) {
  const fiche = composerFicheOpportunite(
    {
      id: cible.id,
      adresse: cible.adresse,
      surface: cible.surfaceHabitableM2,
      conso: cible.consoKwhM2,
      chauffage: cible.chauffage,
    },
    null,
  );
  const { pdf, bas } = mettreEnPageFiche(fiche);
  assert.equal(pdf.getNumberOfPages(), 1, fiche.reference);
  assert.ok(bas < 274, `${fiche.reference} déborde du pied de page (${bas})`);
  const latin = Buffer.from(pdf.output("arraybuffer")).toString("latin1");
  assert.ok(latin.includes(fiche.reference), fiche.reference);
  assert.equal(latin.includes("\u20AC"), false, "symbole euro brut");
  assert.equal(latin.includes("â‚¬"), false, "euro mal encodé");
  assert.equal(latin.includes("Ã©"), false, "accent mal encodé");
  if (fiche.prixM2Median != null || fiche.transactions.some((mutation) => mutation.prixNet != null)) {
    assert.ok(latin.includes("EUR"), `${fiche.reference} : montant en EUR`);
  }
}

console.log(`Fiche Carto Sniper : ${CIBLES_TERRAIN_CHAGNY.length} cibles et PDF A4 OK.`);
