/**
 * Contrôles du calepinage solaire — DTU, chaînes Powerwall 3, productible.
 * Lancer : npx tsx src/components/solar/verify-calpinage.ts
 */
import { ETAT_INITIAL, panneauDepuisEtat } from "./catalogue";
import { lignesSyntheseElectrique, composerEtudePdf } from "./exportEtude";
import { evaluerElectrique, bornesSerie, proposerChaines } from "./electrical";
import { construireEtude } from "./etude";
import { MARGE_DTU_M, dimensionnerPalier, empreinteModule, genererCalpinage, pasRangeeM, toitureDepuis } from "./layout";
import { facteurOrientation, tauxCibleAutoconsommation } from "./production";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const trina = panneauDepuisEtat({ ...ETAT_INITIAL, panneauId: "trina-450" });
const toit = toitureDepuis(10, 6, 30, 0);
const cellules = genererCalpinage(toit, "portrait", trina, [], []);
assert(cellules.length === 24, `portrait 10×6 = 24 modules, obtenu ${cellules.length}`);

const empreinte = empreinteModule("portrait", trina);
for (const cellule of cellules) {
  assert(cellule.x >= MARGE_DTU_M - 1e-6, "marge rive gauche");
  assert(cellule.x + empreinte.largeurM <= toit.largeurM - MARGE_DTU_M + 1e-6, "marge rive droite");
  assert(cellule.y >= MARGE_DTU_M - 1e-6, "marge égout");
  assert(cellule.y + empreinte.hauteurM <= toit.rampantM - MARGE_DTU_M + 1e-6, "marge faîtage");
}

const voisins = cellules.filter((cellule) => cellule.col === 0).sort((a, b) => a.row - b.row);
assert(Math.abs(voisins[1].y - (voisins[0].y + empreinte.hauteurM) - 0.02) < 1e-6, "jeu de pinces 20 mm");

const bloquees = genererCalpinage(
  toit,
  "portrait",
  trina,
  [{ id: "v", type: "velux", x: cellules[0].x, y: cellules[0].y, largeurM: empreinte.largeurM, hauteurM: empreinte.hauteurM }],
  [],
);
assert(bloquees.length === 23, "un Velux retire un module");
assert(!bloquees.some((cellule) => cellule.id === cellules[0].id), "le module couvert disparaît");

const bornes = bornesSerie(trina, 480, 60);
assert(bornes.max === 8, `Trina max 8 modules sous 480 V, obtenu ${bornes.max}`);
assert(bornes.min === 2, `Trina min 2 modules au-dessus de 60 V, obtenu ${bornes.min}`);

const etude = construireEtude(ETAT_INITIAL, "dossier-test");
assert(etude.kwc === 10.8, `10,8 kWc, obtenu ${etude.kwc}`);
assert(etude.electrique.ok, etude.electrique.alertes.join(" | ") || "Powerwall 3 devrait être dans la fenêtre");
assert(etude.electrique.chaines.filter((chaine) => chaine.nombre > 0).length === 3, "3 chaînes de 8");

const dualsun = panneauDepuisEtat({ ...ETAT_INITIAL, panneauId: "dualsun-500" });
const horsCourant = evaluerElectrique({
  architecture: "tesla-pw3",
  panneau: dualsun,
  modulesActifs: 8,
  kwc: 4,
  repartition: "auto",
  comptes: [],
  secours: true,
  microId: "enphase-iq8",
  marqueCentrale: "huawei",
  modeleCentralId: "auto",
});
assert(!horsCourant.ok, "DualSun 500 Wc doit être refusé au-dessus de 13 A");

const sud = facteurOrientation(30, 0);
assert(sud > 0.97 && sud < 1.03, `sud 30° proche de 1, obtenu ${sud}`);
const est = facteurOrientation(30, -90);
assert(est > 0.78 && est < 0.88, `est 30° autour de 0,83, obtenu ${est}`);

assert(tauxCibleAutoconsommation(6000, 10000, false) === 0.4, "sans batterie, conso couvrante : 40 %");
assert(tauxCibleAutoconsommation(6000, 10000, true) === 0.9, "Powerwall 3, conso couvrante : 90 %");
assert(etude.production.productionKwh > 10000, "production 10,8 kWc en Saône-et-Loire");
assert(etude.production.retourAns !== null && etude.production.retourAns > 0, "retour chiffré");

const plein = proposerChaines(50, 2, 8, 6);
assert(plein.reste === 2 && plein.comptes.length === 6, "50 modules : 6×8 et 2 hors MPPT");

const paysage = empreinteModule("paysage", trina);
assert(pasRangeeM(paysage.hauteurM, "terrasse", 12) > paysage.hauteurM + 0.02, "terrasse : rangées écartées pour l'ombre");
assert(pasRangeeM(paysage.hauteurM, "bac-acier", 8) === paysage.hauteurM + 0.08, "bac acier : 8 cm entre rangées");

function etudePalier(
  kwc: 36 | 100 | 250 | 500,
  extra: Partial<typeof ETAT_INITIAL> = {},
) {
  const type = extra.typeCouverture ?? "bac-acier";
  const inclinaisonDeg = type === "terrasse" ? 12 : type === "ombriere" ? 10 : 8;
  const dims = dimensionnerPalier(kwc, trina, "paysage", type, inclinaisonDeg);
  return construireEtude(
    {
      ...ETAT_INITIAL,
      segment: "tertiaire",
      typeCouverture: type,
      orientation: "paysage",
      inclinaisonDeg,
      largeurM: dims.largeurM,
      rampantM: dims.rampantM,
      kwcCible: kwc,
      architecture: kwc >= 100 ? "cascade" : "tesla-pw3",
      unitesPowerwall: Math.min(4, Math.ceil(kwc / 20)),
      tarifPro: kwc > 250 ? "vert" : "jaune",
      consoKwh: kwc === 36 ? 80000 : kwc === 100 ? 250000 : kwc === 250 ? 700000 : 1500000,
      secours: true,
      irveActive: false,
      ...extra,
    },
    "dossier-tertiaire",
  );
}

for (const kwc of [36, 100, 250, 500] as const) {
  const etudeT = etudePalier(kwc);
  const cible = Math.round((kwc * 1000) / trina.wc);
  assert(etudeT.modulesActifs === cible, `${kwc} kWc : ${cible} modules, obtenu ${etudeT.modulesActifs}`);
}

const quatre = etudePalier(36, { unitesPowerwall: 4 });
assert(quatre.electrique.ok, quatre.electrique.alertes.join(" | ") || "4 Powerwall hors plage");
assert(quatre.electrique.unitesPowerwall === 4, "4 unités Powerwall");
assert(quatre.electrique.secoursKw === 46, `46 kW AC, obtenu ${quatre.electrique.secoursKw}`);
assert(quatre.production.tertiaire?.kwhStockage === 54, "54 kWh de stockage");

const tropGrand = evaluerElectrique({
  architecture: "tesla-pw3",
  panneau: trina,
  modulesActifs: 1111,
  kwc: 500,
  repartition: "auto",
  comptes: [],
  secours: true,
  microId: "enphase-iq8",
  marqueCentrale: "huawei",
  modeleCentralId: "auto",
  segment: "tertiaire",
  unitesPowerwall: 4,
});
assert(!tropGrand.ok, "500 kWc dépasse le plafond DC de 4 Powerwall 3");

const industrie = etudePalier(500);
assert(industrie.electrique.architecture === "cascade", "500 kWc en cascade");
assert(industrie.electrique.ok, industrie.electrique.alertes.join(" | ") || industrie.electrique.resume);
assert((industrie.electrique.cascade?.kwAcTotal ?? 0) > 0, "puissance AC cascade");

const cent = etudePalier(100);
const centIrve = etudePalier(100, { irveActive: true, nbBornes: 4 });
assert(
  cent.production.retourAns !== null && cent.production.retourAns >= 4 && cent.production.retourAns <= 9,
  `retour 100 kWc hors 4–9 ans : ${cent.production.retourAns}`,
);
assert((centIrve.production.tertiaire?.aideAdvenirEur ?? 0) === 4800, `ADVENIR 4 800 EUR, obtenu ${centIrve.production.tertiaire?.aideAdvenirEur}`);
assert((centIrve.production.tertiaire?.kwhIrve ?? 0) > 0, "les bornes absorbent du surplus");
assert(centIrve.production.autoconsommationKwh > cent.production.autoconsommationKwh, "IRVE relève l'autoconsommation directe");

const terrasse = etudePalier(36, { typeCouverture: "terrasse", architecture: "cascade" });
const colonne = terrasse.cellules.filter((cellule) => cellule.col === 0).sort((a, b) => a.row - b.row);
assert(colonne.length >= 2, "au moins deux rangées en terrasse");
assert(colonne[1].y - colonne[0].y - paysage.hauteurM > 0.02, "écart de rangée terrasse supérieur au jeu de pinces");

const devis = etude.devis;
const ligneModules = devis.lignes.find((ligne) => ligne.id === "modules");
const ligneFixation = devis.lignes.find((ligne) => ligne.id === "fixation");
assert(ligneModules?.quantite === 24 && ligneModules.puHt === 145, "module revendu 145 EUR HT");
assert(ligneModules?.coutHt === 24 * 85, "coût d'achat module 85 EUR HT");
assert(ligneFixation?.puHt === 30, "fixation tuiles 30 EUR HT");
const lignePose = devis.lignes.find((ligne) => ligne.id === "pose");
assert(lignePose?.quantite === 10.8 && lignePose.totalHt === 4860, `pose 10,8 kWc x 450 = 4 860, obtenu ${lignePose?.quantite} / ${lignePose?.totalHt}`);
assert(devis.tauxTva === 0.2, "TVA 20 % au-dessus de 3 kWc");
assert(devis.aides.some((aide) => aide.id === "prime-autoconso"), "prime autoconsommation résidentielle");
assert(devis.resteAChargeTtc > 0 && devis.resteAChargeTtc < devis.totalTtc, "reste à charge après aides");
assert(devis.margeBruteHt === 24 * (145 - 85) + (devis.lignes.find((ligne) => ligne.id === "powerwall")!.totalHt - 9900), "marge modules et Powerwall");

const onduleur = cent.devis.lignes.find((ligne) => ligne.id === "onduleurs");
assert(onduleur?.puHt === 5800, `onduleur 100 kW à 5 800 EUR HT, obtenu ${onduleur?.puHt}`);
assert(cent.devis.lignes.find((ligne) => ligne.id === "fixation")?.puHt === 20, "fixation bac acier 20 EUR HT");
assert(cent.devis.tauxTva === 0.2, "TVA tertiaire 20 %");
assert(!cent.devis.aides.some((aide) => aide.id === "prime-autoconso"), "pas de prime autoconsommation en tertiaire");
assert(centIrve.devis.aides.find((aide) => aide.id === "advenir")?.montantEur === 4800, "ADVENIR devis 4 800 EUR");

const specs = lignesSyntheseElectrique({ ...industrie, clientNom: "Foyer Industrie" });
const bloc = specs.map((ligne) => `${ligne.label} ${ligne.valeur}`).join(" | ");
assert(specs.length <= 4, bloc);
assert(!/MPPT \d+\s*:/.test(bloc), `la synthèse ne doit pas lister les MPPT : ${bloc}`);
assert(bloc.includes("Huawei SUN2000"), bloc);
assert(/chaînes réparties \(36 x 26 et 7 x 25\)/.test(bloc), bloc);
const pdfIndustrie = composerEtudePdf({ ...industrie, clientNom: "Foyer Industrie" });
assert(pdfIndustrie.getNumberOfPages() >= 1, "pdf industrie");
assert((pdfIndustrie.output("arraybuffer") as ArrayBuffer).byteLength > 4000, "pdf industrie trop léger");
const pdfMaison = composerEtudePdf(etude);
assert(pdfMaison.getNumberOfPages() >= 1, "pdf résidentiel");

console.log("verify-calpinage OK");
