/**
 * Contrôles double mode sous-traitance — catalogue BTP complet.
 * Exécution : node src/lib/crm/verify-double-mode.js
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CATEGORIES_HORS_SOUS_TRAITANCE,
  CATEGORIES_STRATEGIQUES_DOUBLE_MODE,
  MENTION_SOUS_TRAITANCE_AUTOLIQUIDATION,
  MODE_FOURNITURE_POSE,
  MODE_POSE_SEULE,
  RATIOS_MARCHE_2026,
  enrichirPrestationDoubleMode,
  estCategorieDoubleMode,
  estPrestationDoubleMode,
  extraMargeAchatDirectHt,
  extraMargePrestation,
} from "./sousTraitanceDoubleMode.js";
import {
  htmlBonCommandeSousTraitance,
  payloadBonCommandeSousTraitance,
} from "./bonCommandeSousTraitanceHtml.js";
import { MENTION_AUTOLIQUIDATION_TVA, referentielParDefaut } from "./artisansRge.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const enrichi = JSON.parse(readFileSync(join(root, "data/catalogue-metiers-enrichi.json"), "utf8"));
const artisans = JSON.parse(readFileSync(join(root, "data/artisans-rge-referentiel.json"), "utf8"));

assert(CATEGORIES_STRATEGIQUES_DOUBLE_MODE.length === 4, "4 métiers phares conservés");
assert(CATEGORIES_HORS_SOUS_TRAITANCE.length === 3, "études + honoraires + cuisines hors ST");
assert(estCategorieDoubleMode("photovoltaique"), "PV dans le double mode");
assert(estCategorieDoubleMode("peinture"), "peinture");
assert(estCategorieDoubleMode("poele-bois-granules"), "poêle");
assert(estCategorieDoubleMode("mobilite-electrique"), "IRVE");
assert(!estCategorieDoubleMode("etude-accompagnement"), "études hors switch");
assert(!estCategorieDoubleMode("frais-administratifs-coordination"), "honoraires hors switch");
assert(!estCategorieDoubleMode("cuisines-agencement-italien"), "cuisines direct usine hors switch");
assert(
  !estPrestationDoubleMode({
    categorieId: "cuisines-agencement-italien",
    nom: "Pack Meubles Usine Italie (Linéaire ou Îlot)",
    id: "cuisine-pack-meubles-italie",
  }),
  "pack meubles hors overlay PAC",
);

const packCuisine = enrichirPrestationDoubleMode(
  {
    id: "cuisine-pack-meubles-italie",
    categorieId: "cuisines-agencement-italien",
    nom: "Pack Meubles Usine Italie (Linéaire ou Îlot)",
    coutMaterielHt: 4500,
    coutMainOeuvreHt: 0,
    prixVenteHt: 9500,
  },
  enrichi,
);
assert(packCuisine.coutMaterielHt === 4500 && packCuisine.prixVenteHt === 9500, "pack meubles 4 500 / 9 500");
assert(packCuisine.coutFourniturePoseHt == null, "pack meubles non écrasé par le forfait PAC 10 500");

const planCuisine = enrichirPrestationDoubleMode(
  {
    id: "cuisine-plan-travail",
    categorieId: "cuisines-agencement-italien",
    nom: "Plan de travail Compact/Céramique",
    coutMaterielHt: 180,
    coutMainOeuvreHt: 0,
    prixVenteHt: 380,
  },
  enrichi,
);
assert(planCuisine.coutMaterielHt === 180 && planCuisine.prixVenteHt === 380, "plan 180 / 380");
assert(planCuisine.coutFourniturePoseHt == null, "plan compact non écrasé par le forfait PAC");

assert(estPrestationDoubleMode({ categorieId: "isolation", nom: "Combles perdus R≥7" }), "isolation");
assert(estPrestationDoubleMode({ categorieId: "photovoltaique", nom: "DualSun FLASH 500" }), "PV DualSun a le switch");
assert(estPrestationDoubleMode({ familleId: "chauffage", nom: "Poêle à granulés" }), "poêle");
assert(estPrestationDoubleMode({ categorieId: "toiture", nom: "Tuiles terre cuite" }), "toiture");
assert(!estPrestationDoubleMode({ categorieId: "etude-accompagnement", nom: "Audit énergétique" }), "audit hors ST");
assert(!estPrestationDoubleMode({ nom: "Contractant Général ENERGIA" }), "CG hors ST");

assert(enrichi.ratiosMarche2026.materiel_lourd.materiel === 0.6, "ratio PV matériel");
assert(enrichi.prestations.length >= 8, "overlay enrichi présent");
assert(MENTION_SOUS_TRAITANCE_AUTOLIQUIDATION.includes("preneur assujetti"), "mention légale moteur");
assert(artisans.mentionAutoliquidation.includes("preneur assujetti"), "mention JSON artisans");
assert(enrichi.mentionAutoliquidation.includes("283-2 nonies"), "mention JSON enrichi");

const extraPac = extraMargeAchatDirectHt({
  coutFourniturePoseHt: 10500,
  coutMaterielDirectHt: 7500,
  coutPoseRgeHt: 2500,
});
assert(extraPac === 500, `gain PAC ${extraPac} ≠ 500`);

const demoIsolation = {
  id: "demo-isolation-combles-soufflee",
  categorieId: "isolation",
  nom: "Isolation combles soufflée",
  coutMaterielHt: 12,
  coutMainOeuvreHt: 8,
  prixVenteHt: 28,
};
const enrichie = enrichirPrestationDoubleMode(demoIsolation, enrichi);
assert(enrichie.coutMaterielHt === 12, "overlay ne réécrit pas le matériel démo");
assert(enrichie.coutMainOeuvreHt === 8, "overlay ne réécrit pas la pose démo");
assert(enrichie.prixVenteHt === 28, "prix client catalogue inchangé");
assert(enrichie.coutFourniturePoseHt === 22, "forfait F+P overlay si absent");
assert(extraMargePrestation({ ...enrichie, modeSousTraitance: MODE_POSE_SEULE }) === 2, "gain 22-(12+8)");
assert(
  extraMargePrestation({ ...enrichie, modeSousTraitance: MODE_FOURNITURE_POSE }) === 0,
  "pas de gain extra en F+P",
);

const dualsun = {
  id: "pv-dualsun-flash-500",
  categorieId: "photovoltaique",
  nom: "DualSun FLASH 500",
  coutMaterielHt: 999,
  coutMainOeuvreHt: 111,
  prixVenteHt: 2222,
};
const apresDualsun = enrichirPrestationDoubleMode(dualsun, enrichi);
assert(apresDualsun.prixVenteHt === 2222, "DualSun vente intacte");
assert(apresDualsun.coutMaterielHt === 999, "DualSun matériel intact");
assert(apresDualsun.coutMainOeuvreHt === 111, "DualSun pose intacte");
assert(apresDualsun.modeSousTraitance === MODE_FOURNITURE_POSE, "DualSun a le switch F+P");

const peinture = {
  id: "marche-peinture-test",
  categorieId: "peinture",
  nom: "Peinture intérieure écologique",
  prixVenteHt: null,
  coutMaterielHt: null,
  coutMainOeuvreHt: null,
  referenceMarche: { priceMedianHT: 100 },
};
const peintureEnrichie = enrichirPrestationDoubleMode(peinture, enrichi);
assert(peintureEnrichie.prixVenteHt == null, "repère marché non transformé en PU client");
assert(peintureEnrichie.coutMaterielHt === 28, `peinture matériel ${peintureEnrichie.coutMaterielHt}`);
assert(peintureEnrichie.coutMainOeuvreHt === 50, `peinture pose ${peintureEnrichie.coutMainOeuvreHt}`);
assert(peintureEnrichie.coutFourniturePoseHt === 78, "peinture F+P = mat+pose");

const pvMarche = {
  id: "marche-pv-test",
  categorieId: "photovoltaique",
  nom: "Panneaux monocristallins",
  referenceMarche: { priceMedianHT: 1000 },
};
const pvEnrichi = enrichirPrestationDoubleMode(pvMarche, enrichi);
assert(pvEnrichi.coutMaterielHt === 600, "PV matériel 60 %");
assert(pvEnrichi.coutMainOeuvreHt === 220, "PV pose 22 %");
assert(pvEnrichi.coutFourniturePoseHt === 820, "PV F+P 82 %");

const menuiserie = {
  id: "marche-chassis-bois-test",
  categorieId: "menuiserie",
  nom: "Châssis bois de rénovation",
  referenceMarche: { priceMedianHT: 200 },
};
const fenetreEnrichie = enrichirPrestationDoubleMode(menuiserie, enrichi);
assert(fenetreEnrichie.coutMaterielHt === 90, "menuiserie 45 %");
assert(fenetreEnrichie.coutMainOeuvreHt === 55, "menuiserie pose 27,5 %");

assert(RATIOS_MARCHE_2026.materiel_lourd.marge === 0.18, "marge lourde 18 %");
assert(Math.abs(0.6 + 0.22 + 0.18 - 1) < 1e-9, "ratios lourds = 100 %");
assert(Math.abs(0.28 + 0.5 + 0.22 - 1) < 1e-9, "ratios second œuvre = 100 %");
assert(Math.abs(0.45 + 0.275 + 0.275 - 1) < 1e-9, "ratios menuiseries = 100 %");

const referentiel = referentielParDefaut();
const html = htmlBonCommandeSousTraitance(
  payloadBonCommandeSousTraitance({
    artisan: referentiel.artisans[0],
    lignes: [{ nom: "Peinture intérieure", quantite: 1, unite: "m²", totalHt: 100, familleId: "isolation" }],
    client: { nom: "Test" },
    chantier: { adresse: "Lyon" },
    referentiel,
  }),
);
assert(/preneur assujetti/i.test(html), "BC mention preneur assujetti");
assert(/283-2 nonies/i.test(html), "BC article 283-2 nonies");
assert(MENTION_AUTOLIQUIDATION_TVA.includes("preneur assujetti"), "constante BC alignée");

console.log("OK verify-double-mode — catalogue BTP complet, ratios 2026, DualSun intact, autoliquidation.");
