/**
 * Contrôles du catalogue métiers CRM.
 * Exécution : npx tsx src/lib/crm/catalogue/verify-catalogue.ts
 */

import { CATEGORIES_METIERS, SOUS_CATEGORIES_METIERS, sousCategorieAppartientA } from "./categories";
import { calculerPrestation, round2 } from "./calculs";
import { PRESTATIONS_SEED } from "./prestations-seed";
import { CATALOGUE_POSTES } from "../../chiffrage/catalogue-postes";
import { infererPrioriteTravaux } from "../../chiffrage/priorite-travaux";
import { IDS_COMPLEMENT_MARCHE_2026 } from "./tarifs-marche-2026-complement";
import {
  journaliserMigrationCatalogue,
  snapshotTarifsFermes,
  verifierMigrationRejouable,
  erreursFourchettesSeed,
} from "./migration";
import { IDS_TARIFS_FERMES_PROTEGES, prestationPourRole, validerFourchetteMarche } from "./visibilite";
import { MENTIONS_AFFICHAGE_MARCHE } from "./tarifs-marche-2026";
import {
  CATEGORIES_COORDINATION_MOHAMED,
  COORDINATION_NATIONALE,
  assignerCoordinateurLot,
  estCategorieCoordonneeParMohamed,
} from "./coordinationNationale";

const erreurs: string[] = [];

function assert(ok: boolean, message: string) {
  if (!ok) erreurs.push(message);
}

assert(CATEGORIES_METIERS.length === 31, `31 catégories attendues, ${CATEGORIES_METIERS.length} trouvées`);
assert(CATEGORIES_COORDINATION_MOHAMED.length === 31, "Mohamed couvre les 31 corps d’état");
assert(COORDINATION_NATIONALE.responsable === "Mohamed", "responsable Mohamed");
assert(COORDINATION_NATIONALE.telephoneTel === "+33634170947", "tél Mohamed");
assert(estCategorieCoordonneeParMohamed("peinture"), "peinture coordonnée");
assert(estCategorieCoordonneeParMohamed("cuisines-agencement-italien"), "cuisines coordonnées");
const lotAssigne = assignerCoordinateurLot({ id: "lot-test", nom: "Test" }, "electricite");
assert(lotAssigne.coordinateur?.nom === "Mohamed", "coordinateur auto Mohamed sur lot");
const cuisines = CATEGORIES_METIERS.find((item) => item.id === "cuisines-agencement-italien");
assert(cuisines?.ordre === 31 && cuisines.nom.includes("Cuisines & Agencement Italien"), "Catégorie 31 cuisines");
const packMeubles = PRESTATIONS_SEED.find((item) => item.id === "cuisine-pack-meubles-italie");
assert(packMeubles?.coutMaterielHt === 4500 && packMeubles.prixVenteHt === 9500, "Pack meubles 4 500 / 9 500");
const planTravail = PRESTATIONS_SEED.find((item) => item.id === "cuisine-plan-travail");
assert(planTravail?.unite === "ml" && planTravail.coutMaterielHt === 180 && planTravail.prixVenteHt === 380, "Plan 180 / 380 €/ml");
const poseCuisine = PRESTATIONS_SEED.find((item) => item.id === "cuisine-pose-menuiserie");
assert(poseCuisine?.coutMainOeuvreHt === 140 && poseCuisine.prixVenteHt === 240, "Pose 140 / 240 €/ml");
const momo = PRESTATIONS_SEED.find((item) => item.id === "cuisine-raccordements-momo");
assert(momo?.artisan === "Momo" && momo.coutMainOeuvreHt === 1250 && momo.prixVenteHt === 2500, "Raccordements Momo");
const demolition = PRESTATIONS_SEED.find((item) => item.id === "cuisine-demolition");
assert(demolition?.coutMainOeuvreHt === 350 && demolition.prixVenteHt === 750, "Démolition 350 / 750");
const ipn = PRESTATIONS_SEED.find((item) => item.id === "cuisine-ouverture-ipn");
assert(ipn?.artisan === "Mustafa" && ipn.coutMainOeuvreHt === 2200 && ipn.prixVenteHt === 4500, "IPN Mustafa");
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
  assert(calc.extraMargeAchatDirectHt === 0, "Isolation démo F+P : pas d’extra marge");
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

assert(infererPrioriteTravaux({ posteId: "isolation_combles" }) === 1, "P1 isolation combles");
assert(infererPrioriteTravaux({ posteId: "fenetres_portes_fenetres" }) === 1, "P1 menuiseries");
assert(infererPrioriteTravaux({ posteId: "pac_air_eau" }) === 1, "P1 PAC");
assert(infererPrioriteTravaux({ posteId: "vmc_double_flux" }) === 2, "P2 VMC");
assert(infererPrioriteTravaux({ posteId: "ballon_thermodynamique" }) === 2, "P2 ECS");
assert(infererPrioriteTravaux({ posteId: "panneaux_photovoltaiques" }) === 3, "P3 PV");
assert(infererPrioriteTravaux({ designation: "PAC air/eau haute température" }) === 1, "P1 libellé PAC");
assert(
  infererPrioriteTravaux({ prioriteCatalogue: 3, posteId: "isolation_combles" }) === 3,
  "Override catalogue priorite",
);

const dualSunFlash = PRESTATIONS_SEED.find((item) => item.id === "pv-dualsun-flash-500");
if (dualSunFlash) {
  assert(dualSunFlash.unite === "panneau", "DualSun Flash : unité Panneau");
  assert(dualSunFlash.coutMaterielHt === 200, "DualSun Flash : matériel 200 €");
  assert(dualSunFlash.coutMainOeuvreHt === 50, "DualSun Flash : MO 50 €");
  assert(dualSunFlash.prixVenteHt === 350, "DualSun Flash : vente 350 €");
  assert(!dualSunFlash.referenceMarche, "DualSun Flash : ne pas écraser par un tarif marché");
}

const idsMarche = PRESTATIONS_SEED.filter((item) => item.id.startsWith("marche-"));
assert(idsMarche.length > 0, "Prestations marché 2026 absentes");
for (const prestation of idsMarche) {
  const calc = calculerPrestation(prestation);
  assert(!calc.tarifRenseigne, `${prestation.id} marché ne doit pas être un devis ferme`);
  assert(Boolean(prestation.referenceMarche), `${prestation.id} sans référence de marché`);
  const ref = prestation.referenceMarche;
  if (!ref) continue;
  assert(ref.requiresQuote === true, `${prestation.id} doit rester « à confirmer par devis »`);
  assert(Boolean(ref.sourceName && ref.sourceUrl), `${prestation.id} sans source`);
  assert(Boolean(ref.unit), `${prestation.id} sans unité`);
  assert(ref.priceMinTTC <= ref.priceMedianTTC && ref.priceMedianTTC <= ref.priceMaxTTC, `${prestation.id} fourchette incohérente`);
  assert(ref.vatRate === 0.055 || ref.vatRate === 0.1 || ref.vatRate === 0.2, `${prestation.id} TVA invalide`);
}

const compatAvecMarche = PRESTATIONS_SEED.filter((item) => item.id.startsWith("compat-") && item.referenceMarche);
assert(compatAvecMarche.length >= 12, `Au moins 12 compat devraient avoir un repère marché, ${compatAvecMarche.length} trouvés`);
for (const prestation of compatAvecMarche) {
  assert(prestation.prixVenteHt == null, `${prestation.id} : ne pas remplir un prix de vente marché`);
  assert(prestation.coutMaterielHt == null, `${prestation.id} : ne pas inventer un coût matériel`);
}

const internauxSansMarche = ["pv-frais-clyve", "pv-coordination-energia", "compat-audit_etude"];
for (const id of internauxSansMarche) {
  const prestation = PRESTATIONS_SEED.find((item) => item.id === id);
  assert(Boolean(prestation), `${id} manquant`);
  assert(!prestation?.referenceMarche, `${id} ne doit pas recevoir un tarif marché client`);
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

const idsPrestations = PRESTATIONS_SEED.map((item) => item.id);
assert(idsPrestations.length === new Set(idsPrestations).size, "Doublon d’identifiant / slug");

const fermes = PRESTATIONS_SEED.filter((item) =>
  (IDS_TARIFS_FERMES_PROTEGES as readonly string[]).includes(item.id),
);
assert(fermes.length === 34, `34 tarifs fermes attendus, ${fermes.length} trouvés`);
const snapshot = snapshotTarifsFermes();
assert(snapshot["pv-dualsun-flash-500"]?.coutMaterielHt === 200, "DualSun Flash coût 200");
assert(snapshot["pv-dualsun-flash-500"]?.coutMainOeuvreHt === 50, "DualSun Flash marge/MO 50");
assert(snapshot["pv-dualsun-flash-500"]?.prixVenteHt === 350, "DualSun Flash vente 350");
for (const id of IDS_TARIFS_FERMES_PROTEGES) {
  const item = PRESTATIONS_SEED.find((p) => p.id === id);
  const figé = snapshot[id];
  assert(Boolean(item && figé), `${id} tarif ferme manquant`);
  if (!item || !figé) continue;
  assert(item.coutMaterielHt === figé.coutMaterielHt, `${id} matériel modifié`);
  assert(item.coutMainOeuvreHt === figé.coutMainOeuvreHt, `${id} MO modifiée`);
  assert(item.prixVenteHt === figé.prixVenteHt, `${id} vente modifié`);
}

for (const id of IDS_COMPLEMENT_MARCHE_2026) {
  const prestation = PRESTATIONS_SEED.find((item) => item.id === id);
  if (!prestation) {
    erreurs.push(`${id} complément manquant`);
    continue;
  }
  const calc = calculerPrestation(prestation);
  assert(!calc.tarifRenseigne, `${id} ne doit pas être un devis ferme`);
  assert(Boolean(prestation.categorieId), `${id} sans catégorie`);
  assert(Boolean(prestation.unite), `${id} sans unité`);
  assert(Boolean(prestation.referenceMarche), `${id} sans fourchette`);
  assert(prestation.tauxTva === 0.055 || prestation.tauxTva === 0.1 || prestation.tauxTva === 0.2, `${id} TVA`);
  assert(Boolean(prestation.referenceMarche?.sourceName), `${id} sans source`);
  assert(Boolean(prestation.referenceMarche?.sourceDate), `${id} sans date`);
  assert(Boolean(prestation.referenceMarche?.statutRepere), `${id} sans statut`);
  assert(prestation.prixVenteHt == null, `${id} : fourchette transformée en prix ferme`);
}

for (const err of erreursFourchettesSeed()) erreurs.push(err);

const demoVueCommerciale = prestationPourRole(demoIsolation!, "commercial");
assert(demoVueCommerciale == null || demoVueCommerciale.coutMaterielHt == null, "Commercial : coûts démo masqués si visibles");
const dualVueCommerciale = prestationPourRole(dualSunFlash!, "commercial");
assert(dualVueCommerciale?.coutMaterielHt == null, "Commercial ne doit pas lire le coût DualSun");
assert(dualVueCommerciale?.structurePrixInterne == null, "Commercial ne doit pas lire la marge DualSun");
assert(dualVueCommerciale?.prixVenteHt === 350, "Commercial peut voir le prix de vente DualSun autorisé");

const dualVuePartenaire = prestationPourRole(dualSunFlash!, "partenaire_apporteur");
assert(dualVuePartenaire == null || dualVuePartenaire.coutMaterielHt == null, "Partenaire : pas de coût interne");
assert(dualVuePartenaire == null || dualVuePartenaire.structurePrixInterne == null, "Partenaire : pas de marge");

const serrure = PRESTATIONS_SEED.find((item) => item.id === "marche-serrurerie-ouverture");
assert(prestationPourRole(serrure!, "partenaire_apporteur") == null, "Partenaire ne voit pas le catalogue serrurerie complet");

assert(MENTIONS_AFFICHAGE_MARCHE.includes("Tarif indicatif marché 2026"), "Mention tarif indicatif");
assert(MENTIONS_AFFICHAGE_MARCHE.includes("À confirmer par devis artisan"), "Mention devis artisan");
assert(MENTIONS_AFFICHAGE_MARCHE.includes("Hors aides"), "Mention hors aides");
assert(MENTIONS_AFFICHAGE_MARCHE.includes("Hors aléas"), "Mention hors aléas");

const replayErr = verifierMigrationRejouable();
assert(replayErr == null, replayErr ?? "rejeu");

const journal = journaliserMigrationCatalogue();
assert(journal.protegeesTarifFerme.length === 34, `Journal : ${journal.protegeesTarifFerme.length} tarifs fermes protégés`);
assert(journal.ajoutees.length === IDS_COMPLEMENT_MARCHE_2026.length, `Journal ajouts ${journal.ajoutees.length}`);
assert(journal.apres === journal.avant + journal.ajoutees.length, "Journal avant/après incohérent");

const vueClient = prestationPourRole(PRESTATIONS_SEED[0], "presentation_client");
assert(vueClient == null, "Le client ne doit pas voir le catalogue interne");

const aluGrisM2 = PRESTATIONS_SEED.find((item) => item.id === "marche-fenetre-alu-gris-m2");
assert(Boolean(aluGrisM2), "Prestation Alu Gris au m² manquante");
assert(aluGrisM2?.unite === "m²", "Alu Gris : unité m²");
assert(aluGrisM2?.categorieId === "menuiserie", "Alu Gris : catégorie menuiserie");
assert(aluGrisM2?.prixVenteHt == null, "Alu Gris : pas un prix ferme");
assert(aluGrisM2?.referenceMarche?.priceMedianHT === 550, `Alu Gris : 550 € HT/m², obtenu ${aluGrisM2?.referenceMarche?.priceMedianHT}`);
assert(aluGrisM2?.referenceMarche?.supplyMode === "fourniture_pose", "Alu Gris : fourniture + pose");
assert(/Uw\s*≤\s*1[.,]3/i.test(aluGrisM2?.nom || ""), "Alu Gris : Uw ≤ 1.3 dans le libellé");

const cesi = PRESTATIONS_SEED.find((item) => item.id === "marche-cesi-standard");
if (cesi?.referenceMarche) {
  assert(
    validerFourchetteMarche({
      ...cesi,
      referenceMarche: { ...cesi.referenceMarche, priceMinHT: -1 },
    }) != null,
    "Montant négatif doit être refusé",
  );
  assert(
    validerFourchetteMarche({
      ...cesi,
      referenceMarche: { ...cesi.referenceMarche, priceMinHT: 9000, priceMaxHT: 100 },
    }) != null,
    "Min > max doit être refusé",
  );
}

if (erreurs.length) {
  console.error("Catalogue métiers — échecs :");
  for (const erreur of erreurs) console.error(` - ${erreur}`);
  process.exit(1);
}

console.log(
  `OK — ${CATEGORIES_METIERS.length} catégories, ${SOUS_CATEGORIES_METIERS.length} sous-catégories, ${PRESTATIONS_SEED.length} prestations seed.`,
);
