/**
 * Dimensionnement PAC — déperditions, bivalence, hydraulique, PDF 2 pages.
 * Lancer : npx tsx src/components/hvac/verify-pac.ts
 */
import { debitM3h, DELTA_T_CHAUDIERE, DELTA_T_PAC, pointBivalence, puissanceDeperditionsKw, volumeM3, volumeTamponMinL } from "./calcul";
import { etatInitialPac, evaluerPac } from "./devis";
import { composerPacPdf } from "./exportPdf";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

assert(volumeM3(120, 2.5) === 300, "volume 120 × 2,5 = 300 m³");
const pDep = puissanceDeperditionsKw(300, 1.2, 20, -10);
assert(Math.abs(pDep - 10.8) < 0.001, `P_dep 10,8 kW, obtenu ${pDep}`);

const tbiv = pointBivalence(20, -10, 0.6);
assert(tbiv !== null && Math.abs(tbiv - -2.2) < 0.05, `Tbiv −2,2 °C, obtenu ${tbiv}`);
assert(pointBivalence(20, -10, 1) === -10, "couverture 100 % : bivalence à Text base");

assert(Math.abs(debitM3h(50, DELTA_T_PAC) - 50 / (1.163 * 5)) < 1e-9, "débit PAC 50 kW");
assert(Math.abs(debitM3h(50, DELTA_T_PAC) / debitM3h(50, DELTA_T_CHAUDIERE) - 3) < 1e-9, "débit PAC = 3 × débit chaudière");
assert(volumeTamponMinL(50) === 1000, "50 kW → 1 000 L");

const maison = evaluerPac(
  {
    ...etatInitialPac("Foyer Martin"),
    surfaceM2: 120,
    hauteurM: 2.5,
    isolation: "rt2000",
    departement: "71",
    tint: 20,
    mode: "hybride",
  },
  "MARTIN",
);
assert(Math.abs(maison.pDepKw - 10.8) < 0.05, `maison 10,8 kW, obtenu ${maison.pDepKw}`);
assert(maison.volumeM3 === 300, "volume maison");
assert(maison.tbiv !== null && maison.tbiv < -1 && maison.tbiv > -3, `Tbiv maison ${maison.tbiv}`);
assert(maison.couvertureAnnuelle === 0.85, "hybride 85 % des kWh");
assert(maison.puissanceChaudiereKw >= maison.pDepKw, "chaudière en secours 100 %");
assert(maison.devis.aides.find((aide) => aide.id === "bar-th-104")?.eligible === true, "BAR-TH-104 résidentiel");
assert(maison.devis.aides.find((aide) => aide.id === "bat-th-113")?.eligible === false, "pas de BAT-TH-113 en maison");
assert(maison.devis.tauxTva === 0.055, "TVA 5,5 % réno");
assert(maison.devis.resteAChargeTtc < maison.devis.totalTtc, "reste à charge après CEE");
assert(maison.devis.margeBruteHt > 0, "marge interne calculée");
assert(!maison.devis.lignes.some((ligne) => /marge/i.test(ligne.designation)), "la marge ne sort pas dans le bordereau");

const tertiaire = evaluerPac(
  {
    ...etatInitialPac("SCI Les Grands Prés"),
    typeBatiment: "tertiaire",
    usageTertiaire: "bureaux",
    surfaceM2: 2000,
    hauteurM: 3,
    isolation: "rt2012",
    departement: "71",
    tint: 19,
    mode: "cascade",
    nombreModules: 3,
    tauxTvaTertiaire: 0.2,
  },
  "GRANDS-PRES",
);
assert(tertiaire.pDepKw > 36 && tertiaire.pDepKw < 400, `tertiaire dans la plage cascade, ${tertiaire.pDepKw}`);
assert(tertiaire.modules?.nombre === 3, "3 modules");
assert((tertiaire.modules?.totalKw ?? 0) >= tertiaire.pDepKw, "la cascade couvre les déperditions");
assert(tertiaire.devis.tauxTva === 0.2, "TVA tertiaire 20 %");
assert(tertiaire.devis.aides.find((aide) => aide.id === "bat-th-113")?.eligible === true, "BAT-TH-113");
assert(tertiaire.devis.aides.find((aide) => aide.id === "bat-th-116")?.eligible === true, "BAT-TH-116");
assert(tertiaire.devis.aides.find((aide) => aide.id === "bar-th-104")?.eligible === false, "pas de BAR-TH-104 en tertiaire");
assert(tertiaire.volumeTamponL === tertiaire.puissancePacKw * 20, "tampon 20 L/kW");

const pdfMaison = composerPacPdf(maison, "Foyer Martin", 20);
const pdfTertiaire = composerPacPdf(tertiaire, "SCI Les Grands Prés", 19);
assert(pdfMaison.getNumberOfPages() === 2, `PDF maison sur 2 pages, obtenu ${pdfMaison.getNumberOfPages()}`);
assert(pdfTertiaire.getNumberOfPages() === 2, `PDF tertiaire sur 2 pages, obtenu ${pdfTertiaire.getNumberOfPages()}`);
const texteTertiaire = Buffer.from(pdfTertiaire.output("arraybuffer")).toString("latin1");
assert(!texteTertiaire.includes("undefined"), "le PDF tertiaire ne contient pas de libellé undefined");
assert(texteTertiaire.includes("TVA 20 %"), "TVA 20 % libellée sans décimale fantôme");

console.log("verify-pac OK", {
  maisonKw: maison.pDepKw,
  tbiv: maison.tbiv,
  rac: maison.devis.resteAChargeTtc,
  tertiaireKw: tertiaire.pDepKw,
  cascade: tertiaire.modules,
});
