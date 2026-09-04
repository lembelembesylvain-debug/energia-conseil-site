/**
 * Contrôles dimensionnement PV 500 Wc → 100 kWc.
 * Exécution : npx tsx src/lib/calculators/verify-photovoltaique-installation.ts
 */

import { PRESTATIONS_PHOTOVOLTAIQUE } from "../crm/catalogue/prestations-seed";
import { calculerPrestation, round2 } from "../crm/catalogue/calculs";
import { tauxTvaPhotovoltaique } from "./photovoltaique-2026";
import { donneesReglementairesValidees, lireReglementairePv } from "./photovoltaique-reglementaire";
import {
  analyserPuissancePv,
  architectureDepuisSousCategorie,
  conflitMicroEtCentral,
  estPrestationPvInterne,
  ID_CABLES_FIXE,
  ID_CABLES_VARIABLE,
  ID_COFFRET_AC_DC,
  libelleCorrespondancePanneaux,
  PANNEAUX_ATTENDUS_TEST,
  PUISSANCES_TEST_PV_KWC,
  quantiteCablesConnectique,
  quantiteCablesPartFixe,
  quantiteCablesPartVariable,
  quantiteForfaitPv,
  quantiteMicroOnduleurs,
  quantiteOnduleurCentralise,
  quantiteRailsFixations,
} from "./photovoltaique-installation";

const erreurs: string[] = [];
function assert(ok: boolean, message: string) {
  if (!ok) erreurs.push(message);
}

for (const kwc of PUISSANCES_TEST_PV_KWC) {
  const analyse = analyserPuissancePv(kwc);
  const attendu = PANNEAUX_ATTENDUS_TEST[kwc];
  assert(analyse.ok, `${kwc} kWc devrait être valide`);
  assert(analyse.nombrePanneaux === attendu, `${kwc} kWc : ${analyse.nombrePanneaux} panneaux ≠ ${attendu}`);
  assert(
    analyse.correspondance === libelleCorrespondancePanneaux(kwc, attendu),
    `${kwc} kWc : correspondance ${analyse.correspondance}`,
  );
  assert(
    quantiteMicroOnduleurs(analyse.nombrePanneaux) === attendu,
    `${kwc} kWc : micro-onduleurs ${quantiteMicroOnduleurs(analyse.nombrePanneaux)} ≠ ${attendu}`,
  );
  assert(quantiteOnduleurCentralise() === 1, "Onduleur centralisé doit rester à 1");
  assert(quantiteForfaitPv() === 1, "Coffret / Consuel / étude : quantité 1");
  const rails = quantiteRailsFixations(analyse.nombrePanneaux);
  assert(rails >= 4, `${kwc} kWc : rails ${rails} < minimum 4`);
  assert(rails === Math.max(4, attendu), `${kwc} kWc : rails ${rails} ≠ max(4, ${attendu})`);
  const cablesFixe = quantiteCablesPartFixe(analyse.nombrePanneaux);
  const cablesVar = quantiteCablesPartVariable(analyse.nombrePanneaux);
  const cablesTotal = quantiteCablesConnectique(analyse.nombrePanneaux);
  assert(cablesFixe === 1, `${kwc} kWc : part fixe câbles ${cablesFixe} ≠ 1`);
  assert(cablesFixe + cablesVar === cablesTotal, `${kwc} kWc : câbles fixe+variable ≠ total combiné`);
  assert(cablesTotal === Math.max(1, Math.ceil(attendu / 6)), `${kwc} kWc : câbles ${cablesTotal}`);
  const tva = tauxTvaPhotovoltaique(kwc);
  assert(kwc <= 9 ? tva === 0.055 : tva === 0.2, `${kwc} kWc : TVA ${tva}`);
}

assert(analyserPuissancePv(9).correspondance === "9 kWc = 18 panneaux de 500 Wc", "Libellé 9 kWc");
assert(analyserPuissancePv(0.5).correspondance === "500 Wc = 1 panneau de 500 Wc", "Libellé 500 Wc");
assert(!analyserPuissancePv(0.7).ok, "0,7 kWc ne correspond pas à un nombre entier de panneaux");
assert(!analyserPuissancePv(0.4).ok, "0,4 kWc hors plage");
assert(!analyserPuissancePv(101).ok, "101 kWc hors plage");
assert(analyserPuissancePv(0.5).nombrePanneaux === 1, "500 Wc = 1 panneau");

assert(conflitMicroEtCentral("micro", "central"), "Conflit micro vs central attendu");
assert(conflitMicroEtCentral("central", "micro"), "Conflit central vs micro attendu");
assert(!conflitMicroEtCentral("aucune", "central"), "Pas de conflit si aucune architecture existante");
assert(!conflitMicroEtCentral("micro", "micro"), "Deux micros ne sont pas un conflit d’architecture");

assert(
  architectureDepuisSousCategorie("photovoltaique__micro-onduleurs") === "micro",
  "Sous-catégorie micro",
);
assert(
  architectureDepuisSousCategorie("photovoltaique__onduleur-centralise") === "central",
  "Sous-catégorie central",
);

assert(!donneesReglementairesValidees(), "Les données réglementaires ne doivent pas être présentées comme validées");
const lecture9 = lireReglementairePv(9);
assert(lecture9.alerte != null && lecture9.statut === "a_verifier", "Alerte réglementaire 9 kWc attendue");
assert(lecture9.primeEurParKwc == null || lecture9.statut !== "valide", "Prime 9 kWc non définitive");

const parId = (id: string) => PRESTATIONS_PHOTOVOLTAIQUE.find((item) => item.id === id);
const flash = parId("pv-dualsun-flash-500");
const iq8 = parId("pv-enphase-iq8plus");
const central = parId("pv-huawei-sun2000-9-12");
const coffret = parId(ID_COFFRET_AC_DC);
const rails = parId("pv-rails-fixations");
const cablesFixe = parId(ID_CABLES_FIXE);
const cablesVar = parId(ID_CABLES_VARIABLE);
const terre = parId("pv-mise-a-la-terre");
const calepinage = parId("pv-calepinage");
const raccord = parId("pv-raccordement-enedis-consuel");
const consuel = parId("pv-consuel");
const monitoring = parId("pv-monitoring-production");
const mise = parId("pv-mise-en-service");
const luna5 = parId("pv-huawei-luna-5");
const pyl15 = parId("pv-pylontech-h2-15");
const pyl30 = parId("pv-pylontech-h2-30");
const crochets = parId("pv-crochets-supports");
const poseFixe = parId("pv-pose-forfait");
const poseVar = parId("pv-pose-variable");
const protections = parId("pv-protections-complementaires");
const demarches = parId("pv-demarches-administratives");
const coordination = parId("pv-coordination-energia");
const clyve = parId("pv-frais-clyve");

for (const item of [
  flash, iq8, central, coffret, rails, cablesFixe, cablesVar, terre, calepinage, raccord, consuel,
  monitoring, mise, luna5, pyl15, pyl30, crochets, poseFixe, poseVar, protections, demarches, coordination, clyve,
]) {
  assert(Boolean(item), "Prestation PV manquante dans le seed");
}

assert(coffret?.unite === "forfait", "Coffret AC/DC doit être un forfait");
assert(consuel?.unite === "forfait", "Consuel doit être un forfait");
assert(flash?.unite === "panneau", "DualSun Flash : unité panneau");
assert(cablesFixe?.unite === "forfait", "Câbles part fixe : forfait");
assert(clyve ? estPrestationPvInterne(clyve.id) : false, "Clyve doit rester interne");
assert(clyve?.prixVenteHt == null, "Clyve ne doit pas avoir de prix de vente client inventé");
assert(crochets?.prixVenteHt == null, "Crochets : pas de tarif fournisseur inventé");
assert(poseFixe?.prixVenteHt == null && poseVar?.prixVenteHt == null, "Pose : pas de tarif inventé");

const n9 = 18;
const lot9 = [
  { p: flash, q: n9 },
  { p: iq8, q: n9 },
  { p: coffret, q: 1 },
  { p: rails, q: quantiteRailsFixations(n9) },
  { p: cablesFixe, q: quantiteCablesPartFixe(n9) },
  { p: cablesVar, q: quantiteCablesPartVariable(n9) },
  { p: terre, q: 1 },
  { p: calepinage, q: 1 },
  { p: raccord, q: 1 },
  { p: consuel, q: 1 },
  { p: monitoring, q: 1 },
];

assert(!lot9.some((l) => l.p?.id === central?.id), "9 kWc micro : pas d’onduleur centralisé");
assert(lot9.filter((l) => l.p?.id === iq8?.id).length === 1, "Un seul poste micro-onduleurs");
assert(lot9.find((l) => l.p?.id === coffret?.id)?.q === 1, "Coffret quantité 1, pas × 18");
assert(lot9.find((l) => l.p?.id === cablesFixe?.id)?.q === 1, "Câbles part fixe = 1");
assert(lot9.find((l) => l.p?.id === cablesVar?.id)?.q === 2, "Câbles part variable 18 panneaux = 2 lots");
assert(!lot9.some((l) => l.p?.id === clyve?.id), "Clyve absent du devis client");
assert(!lot9.some((l) => l.p?.id === poseFixe?.id), "Pose optionnelle absente du lot par défaut (évite double comptage MO)");

let venteHt = 0;
let revientHt = 0;
for (const ligne of lot9) {
  if (!ligne.p) continue;
  const calc = calculerPrestation(ligne.p);
  assert(calc.tarifRenseigne, `${ligne.p.id} non chiffrée`);
  venteHt += (ligne.p.prixVenteHt ?? 0) * ligne.q;
  revientHt += ((ligne.p.coutMaterielHt ?? 0) + (ligne.p.coutMainOeuvreHt ?? 0)) * ligne.q;
}
const tva = round2(venteHt * 0.055);
const ttc = round2(venteHt + tva);
const marge = round2(venteHt - revientHt);
assert(venteHt > 0 && ttc > venteHt, "Totaux 9 kWc HT/TTC");
assert(marge > 0, `Marge brute 9 kWc négative (${marge})`);
assert(
  round2(venteHt) === round2(n9 * 350 + n9 * 280 + 520 + 18 * 65 + 180 + 2 * 180 + 390 + 380 + 400 + 250 + 220),
  `Vente HT 9 kWc ${venteHt}`,
);

if (erreurs.length) {
  console.error("PV installation — échecs :");
  for (const erreur of erreurs) console.error(` - ${erreur}`);
  process.exit(1);
}

console.log(
  `OK — puissances ${PUISSANCES_TEST_PV_KWC.join("/")} kWc, 9 kWc = ${n9} panneaux / ${n9} micros / coffret 1 / câbles 1+2, vente HT ${round2(venteHt)} €, TTC ${ttc} €, revient ${round2(revientHt)} €, marge ${marge} €.`,
);
