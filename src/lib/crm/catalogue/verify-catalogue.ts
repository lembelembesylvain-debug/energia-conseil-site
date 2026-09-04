/**
 * Contrôles du catalogue métiers CRM.
 * Exécution : npx tsx src/lib/crm/catalogue/verify-catalogue.ts
 */

import { CATEGORIES_METIERS, SOUS_CATEGORIES_METIERS, sousCategorieAppartientA } from "./categories";
import { calculerPrestation, round2 } from "./calculs";
import { PRESTATIONS_SEED } from "./prestations-seed";
import { CATALOGUE_POSTES } from "../../chiffrage/catalogue-postes";

const erreurs: string[] = [];

function assert(ok: boolean, message: string) {
  if (!ok) erreurs.push(message);
}

assert(CATEGORIES_METIERS.length === 30, `30 catégories attendues, ${CATEGORIES_METIERS.length} trouvées`);
assert(SOUS_CATEGORIES_METIERS.length > 0, "Aucune sous-catégorie");

const idsCategories = new Set(CATEGORIES_METIERS.map((item) => item.id));
assert(idsCategories.size === CATEGORIES_METIERS.length, "IDs de catégories en doublon");

for (const sous of SOUS_CATEGORIES_METIERS) {
  assert(idsCategories.has(sous.categorieId), `Sous-catégorie orpheline : ${sous.id}`);
}

const idsSous = new Set(SOUS_CATEGORIES_METIERS.map((item) => item.id));
assert(idsSous.size === SOUS_CATEGORIES_METIERS.length, "IDs de sous-catégories en doublon");

for (const prestation of PRESTATIONS_SEED) {
  assert(Boolean(prestation.categorieId), `${prestation.id} sans catégorie`);
  assert(Boolean(prestation.sousCategorieId), `${prestation.id} sans sous-catégorie`);
  assert(
    sousCategorieAppartientA(prestation.sousCategorieId, prestation.categorieId),
    `${prestation.id} : sous-catégorie ${prestation.sousCategorieId} incohérente avec ${prestation.categorieId}`,
  );
  if (prestation.posteIdLegacy) {
    assert(
      CATALOGUE_POSTES.some((poste) => poste.id === prestation.posteIdLegacy),
      `${prestation.id} pointe vers un poste chiffrage inconnu : ${prestation.posteIdLegacy}`,
    );
  }
}

const demoIsolation = PRESTATIONS_SEED.find((item) => item.id === "demo-isolation-combles-soufflee");
if (!demoIsolation) {
  erreurs.push("Prestation démo isolation introuvable");
} else {
  const calc = calculerPrestation(demoIsolation);
  assert(calc.coutRevientHt === 20, `Isolation démo : coût de revient ${calc.coutRevientHt} ≠ 20`);
  assert(calc.margeBruteHt === 8, `Isolation démo : marge ${calc.margeBruteHt} ≠ 8`);
  assert(calc.tauxMarge != null && round2(calc.tauxMarge * 100) === 28.57, `Isolation démo : taux ${calc.tauxMarge}`);
  assert(calc.montantTva === 1.54, `Isolation démo : TVA ${calc.montantTva} ≠ 1.54`);
  assert(calc.prixVenteTtc === 29.54, `Isolation démo : TTC ${calc.prixVenteTtc} ≠ 29.54`);
  assert(calc.tarifRenseigne, "Isolation démo devrait être chiffrée");
  assert(!calc.venteInferieureAuCout, "Isolation démo : marge devrait être positive");
}

const demoPac = PRESTATIONS_SEED.find((item) => item.id === "demo-pac-air-eau");
if (demoPac) {
  const calc = calculerPrestation(demoPac);
  assert(calc.coutRevientHt === 6700, `PAC démo : coût ${calc.coutRevientHt} ≠ 6700`);
  assert(calc.margeBruteHt === 2200, `PAC démo : marge ${calc.margeBruteHt} ≠ 2200`);
}

const sansTarif = PRESTATIONS_SEED.filter((item) => item.posteIdLegacy && !item.demo);
for (const prestation of sansTarif) {
  const calc = calculerPrestation(prestation);
  assert(!calc.tarifRenseigne, `${prestation.id} compatible ne doit pas apparaître comme chiffrée`);
}

const IDS_PV = [
  "pv-dualsun-flash-500",
  "pv-dualsun-spring-500",
  "pv-enphase-iq8plus",
  "pv-enphase-iq8m",
  "pv-huawei-sun2000-3-6",
  "pv-huawei-sun2000-9-12",
  "pv-pylontech-h2-3-5",
  "pv-pylontech-h2-7",
  "pv-pylontech-h2-10",
  "pv-pylontech-h2-15",
  "pv-pylontech-h2-20",
  "pv-pylontech-h2-30",
  "pv-huawei-luna-5",
  "pv-huawei-luna-10",
  "pv-huawei-luna-15",
  "pv-huawei-luna-20",
  "pv-huawei-luna-30",
  "pv-coffret-ac-dc",
  "pv-rails-fixations",
  "pv-cables-connectique",
  "pv-cables-forfait-base",
  "pv-mise-a-la-terre",
  "pv-calepinage",
  "pv-raccordement-enedis-consuel",
  "pv-consuel",
  "pv-mise-en-service",
  "pv-monitoring-production",
  "pv-deplacement",
  "pv-maintenance-annuelle",
  "pv-crochets-supports",
  "pv-pose-forfait",
  "pv-pose-variable",
  "pv-protections-complementaires",
  "pv-demarches-administratives",
  "pv-coordination-energia",
  "pv-frais-clyve",
] as const;
const IDS_PV_SANS_TARIF = new Set([
  "pv-crochets-supports",
  "pv-pose-forfait",
  "pv-pose-variable",
  "pv-protections-complementaires",
  "pv-demarches-administratives",
  "pv-coordination-energia",
  "pv-frais-clyve",
]);
for (const id of IDS_PV) {
  const prestation = PRESTATIONS_SEED.find((item) => item.id === id);
  if (!prestation) {
    erreurs.push(`${id} manquant dans le seed photovoltaïque`);
    continue;
  }
  const calc = calculerPrestation(prestation);
  assert(prestation.categorieId === "photovoltaique", `${id} hors catégorie photovoltaïque`);
  assert(!prestation.demo, `${id} ne doit pas être marqué démo`);
  if (IDS_PV_SANS_TARIF.has(id)) {
    assert(!calc.tarifRenseigne, `${id} ne doit pas inventer un tarif fournisseur`);
  } else {
    assert(calc.tarifRenseigne, `${id} doit être chiffrée`);
  }
}

const dualSunFlash = PRESTATIONS_SEED.find((item) => item.id === "pv-dualsun-flash-500");
if (dualSunFlash) {
  assert(dualSunFlash.unite === "panneau", "DualSun Flash : unité Panneau");
  assert(dualSunFlash.coutMaterielHt === 200, "DualSun Flash : matériel 200 €");
  assert(dualSunFlash.coutMainOeuvreHt === 50, "DualSun Flash : MO 50 €");
  assert(dualSunFlash.prixVenteHt === 350, "DualSun Flash : vente 350 €");
}

const venteInf = calculerPrestation({
  ...PRESTATIONS_SEED[0],
  id: "test-marge-neg",
  coutMaterielHt: 80,
  coutMainOeuvreHt: 20,
  prixVenteHt: 90,
});
assert(venteInf.venteInferieureAuCout, "Alerte vente < coût absente");
assert(venteInf.margeBruteHt === -10, `Marge négative ${venteInf.margeBruteHt} ≠ -10`);

const postesCompat = PRESTATIONS_SEED.filter((item) => item.posteIdLegacy && !item.demo);
assert(
  postesCompat.length === CATALOGUE_POSTES.length,
  `Mapping incomplet : ${postesCompat.length} / ${CATALOGUE_POSTES.length} postes chiffrage`,
);

if (erreurs.length) {
  console.error("Catalogue métiers — échecs :");
  for (const erreur of erreurs) console.error(` - ${erreur}`);
  process.exit(1);
}

console.log(
  `OK — ${CATEGORIES_METIERS.length} catégories, ${SOUS_CATEGORIES_METIERS.length} sous-catégories, ${PRESTATIONS_SEED.length} prestations seed.`,
);
