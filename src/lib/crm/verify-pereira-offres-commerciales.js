/**
 * Contrôles des deux formules commerciales Pereira.
 * Exécution : node src/lib/crm/verify-pereira-offres-commerciales.js
 */

import { RIB_QONTO } from "./paradesAntiFuite.js";
import {
  OFFRE_PEREIRA_ABF,
  OFFRE_PEREIRA_ECO,
  construireHtmlDevisCommercialPereira,
  controlerTotauxOffrePereira,
  lignesOffrePereira,
} from "./pereiraOffresCommerciales.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

for (const offre of [OFFRE_PEREIRA_ABF, OFFRE_PEREIRA_ECO]) {
  const controle = controlerTotauxOffrePereira(offre);
  assert(controle.ok, `${offre} totaux ${JSON.stringify(controle.somme)} ≠ ${JSON.stringify(controle.attendu)}`);
  const html = construireHtmlDevisCommercialPereira(offre);
  assert(html.includes("data:image/png;base64,"), `${offre} logo`);
  assert(html.includes("Bureau d'Études"), `${offre} en-tête direction`);
  assert(html.includes("Marque INPI n° 5213845") || html.includes("INPI n°5213845") || html.includes("INPI n° 5213845"), `${offre} INPI`);
  assert(html.includes("941 819 427 00019"), `${offre} SIRET affiché`);
  assert(html.includes("FR01941819427"), `${offre} TVA`);
  assert(html.includes("278-0 bis A"), `${offre} article CGI`);
  assert(html.includes(RIB_QONTO.iban), `${offre} IBAN Qonto`);
  assert(html.includes(RIB_QONTO.bic), `${offre} BIC`);
  assert(html.includes("Qonto"), `${offre} banque`);
  assert(html.includes("5 200,00"), `${offre} marge 5 200`);
  assert(html.includes("à titre indicatif"), `${offre} aides indicatives`);
  assert(html.includes("Clause Julia"), `${offre} clause Julia`);
  assert(html.includes("2 000"), `${offre} plafond Julia`);
  assert(html.includes("Antoine BARATIER"), `${offre} MAR`);
  assert(html.includes("Sylvain LEMBELEMBE"), `${offre} Sylvain`);
  assert(html.includes("FABIEN"), `${offre} Fabien`);
  assert(html.includes("Clyve"), `${offre} Clyve`);
  assert(html.includes("Julia"), `${offre} Julia`);
  assert(html.includes("ALERTE CRITIQUE"), `${offre} alerte ordre`);
  assert(html.includes("Isolation combles"), `${offre} ordre correct`);
  assert(html.includes("NE JAMAIS SIGNER LES DEVIS DÉFINITIFS"), `${offre} règle ANAH`);
  assert(html.includes("Conformité ABF") || html.includes("conformité ABF") || html.includes("conforme ABF"), `${offre} ABF`);
  assert(html.includes("côté cour"), `${offre} groupe côté cour`);
  assert(html.includes("BAR-TH-104"), `${offre} fiche PAC`);
  assert(html.includes("DTU 65.16"), `${offre} DTU`);
  assert(html.includes("PLAN DE FINANCEMENT"), `${offre} plan financement`);
  assert(html.includes("Scénario A"), `${offre} scénario A`);
  assert(html.includes("Scénario B"), `${offre} scénario B`);
  assert(!html.includes("DAMIEN"), `${offre} sans Damien`);
  assert(lignesOffrePereira(offre).some((l) => l.prestationId === "energia-contractant-general" && l.totalHt === 5200), `${offre} ligne CG`);
}

const htmlAbf = construireHtmlDevisCommercialPereira(OFFRE_PEREIRA_ABF);
const htmlEco = construireHtmlDevisCommercialPereira(OFFRE_PEREIRA_ECO);
assert(htmlAbf.includes("DEV-2026-PEREIRA-01"), "réf 01");
assert(htmlEco.includes("DEV-2026-PEREIRA-02"), "réf 02");
assert(htmlAbf.includes("32 400,00"), "TTC 01");
assert(htmlAbf.includes("16 900,00"), "RAC 01");
assert(htmlAbf.includes("5 070,00"), "acompte 01");
assert(htmlAbf.includes("135,00"), "mensualité 01");
assert(htmlEco.includes("25 400,00"), "TTC 02");
assert(htmlEco.includes("9 900,00"), "RAC 02");
assert(htmlEco.includes("2 970,00"), "acompte 02");
assert(htmlEco.includes("79,00"), "mensualité 02");
assert(htmlAbf.includes("11 500,00") && htmlEco.includes("11 500,00"), "MPR");
assert(htmlAbf.includes("4 000,00") && htmlEco.includes("4 000,00"), "CEE");
assert(htmlAbf.includes("PVC"), "exclusion PVC sur formule ABF");
assert(!htmlEco.includes("Lot 5"), "formule éco sans lot menuiseries");
assert(htmlAbf.includes("30 710,90"), "HT 01");
assert(htmlEco.includes("24 075,83"), "HT 02");

console.log("OK — devis commerciaux Pereira 01 (32 400 €) et 02 (25 400 €), marge 5 200 € HT, IBAN Qonto, logo, Julia.");
