import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PEREIRA_MPR_PARCOURS_TTC,
  PEREIRA_PAC_DESIGNATION,
  PEREIRA_RAC_NET_TTC,
  PEREIRA_RAC_THEORIQUE_TTC,
  PEREIRA_REMISE_COMMERCIALE_TTC,
  PEREIRA_STATUT_DEVIS,
  PEREIRA_TOTAL_NET_TTC,
  PEREIRA_TOTAL_VENTE_TTC,
  construireDevisPereiraTest,
} from "../src/data/pereiraDevisTest";
import {
  PEREIRA_COMBLES_SURFACE_M2,
  PEREIRA_COMBLES_TTC,
  PEREIRA_PLANCHER_SURFACE_M2,
  PEREIRA_PLANCHER_TTC,
} from "../src/data/pereiraItiEstimation";
import {
  createDevisPdfDocument,
  logoFromPngBytes,
  totauxDevisClient,
} from "../src/lib/generateDevisPdf";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = resolve(root, "public/assets/LOGO.png");
const outputDir = resolve(root, "clients/PEREIRA");
const outputPath = resolve(outputDir, "Devis_AUDIT-PEREIRA-2026-001.pdf");

const input = construireDevisPereiraTest();
const iti = input.lignes.find((ligne) => ligne.designation.includes("ITI 12 cm"));
if (!iti || iti.quantite !== 270) {
  throw new Error("La ligne ITI 12 cm / 270 m² est absente du devis Pereira.");
}
if (/coordination|frais administratifs|commission|clyve/i.test(iti.description ?? "")) {
  throw new Error("La ligne ITI ne doit pas mélanger coordination, admin ou coûts internes.");
}
if (input.lignes.some((ligne) => /ballon thermodynamique/i.test(`${ligne.designation} ${ligne.description}`))) {
  throw new Error("Le devis Pereira contient encore un ballon thermodynamique.");
}
if (!input.lignes.some((ligne) => /VMC Hygro B/i.test(ligne.designation))) {
  throw new Error("La VMC Hygro B est absente du devis Pereira.");
}
const lignesPac = input.lignes.filter((ligne) => /PAC air\/eau/i.test(ligne.designation));
if (lignesPac.length !== 1) {
  throw new Error("Le devis Pereira doit contenir une seule ligne PAC air/eau.");
}
if (lignesPac[0].designation !== PEREIRA_PAC_DESIGNATION) {
  throw new Error("La désignation PAC Pereira n'est pas à jour.");
}
if (lignesPac[0].montantTtc !== 14000) {
  throw new Error("Le montant TTC PAC Pereira a été modifié sans validation.");
}
if (!/12 kW/i.test(lignesPac[0].description ?? "") || !/cuve fioul/i.test(lignesPac[0].description ?? "")) {
  throw new Error("La ligne PAC Pereira doit mentionner 12 kW (audit) et la dépose de la cuve fioul.");
}
if (!/estimation à confirmer par devis artisan RGE/i.test(input.statut ?? PEREIRA_STATUT_DEVIS)) {
  throw new Error("Le statut « estimation à confirmer par devis artisan RGE » est absent du devis.");
}
if (!input.gesteCommercial || input.gesteCommercial.remiseMontantTtc !== PEREIRA_REMISE_COMMERCIALE_TTC) {
  throw new Error("Le geste commercial de 1 500,00 € TTC est absent du devis Pereira.");
}
if (!input.lignes.some((ligne) => /coordination et pilotage/i.test(ligne.designation))) {
  throw new Error("La ligne Coordination et pilotage est absente du devis Pereira.");
}
const ligneMenuiseries = input.lignes.find((ligne) => /menuiseries/i.test(ligne.designation));
if (!ligneMenuiseries || !/ALUMINIUM/i.test(ligneMenuiseries.designation)) {
  throw new Error("La ligne menuiseries aluminium est absente du devis Pereira.");
}
if (ligneMenuiseries.prixUnitaireHt !== 900.71 || ligneMenuiseries.montantHt !== 8106.39) {
  throw new Error("Le tarif aluminium des menuiseries Pereira n'est pas à jour (900,71 € HT / 8 106,39 € HT).");
}
const ligneCombles = input.lignes.find((ligne) => /isolation combles/i.test(ligne.designation));
if (!ligneCombles || ligneCombles.quantite !== PEREIRA_COMBLES_SURFACE_M2 || ligneCombles.montantTtc !== PEREIRA_COMBLES_TTC) {
  throw new Error("La ligne combles Pereira doit être à 60 m² / 1 250,00 € TTC.");
}
const lignePlancher = input.lignes.find((ligne) => /isolation plancher/i.test(ligne.designation));
if (
  !lignePlancher ||
  lignePlancher.quantite !== PEREIRA_PLANCHER_SURFACE_M2 ||
  lignePlancher.montantTtc !== PEREIRA_PLANCHER_TTC
) {
  throw new Error("La ligne plancher Pereira doit être à 19 m² (prorata 10 445 € TTC).");
}

const totaux = totauxDevisClient(input);
const ht = totaux.totalHt ?? 0;
const tva = totaux.totalTva ?? 0;
const somme = Math.round((ht + tva + Number.EPSILON) * 100) / 100;

if (somme !== totaux.totalTtc) {
  throw new Error(`Incoherence HT + TVA = ${somme} / TTC ${totaux.totalTtc}`);
}
if (totaux.totalTtcAvantRemise !== PEREIRA_TOTAL_VENTE_TTC) {
  throw new Error(`Total TTC avant remise ${totaux.totalTtcAvantRemise} ≠ ${PEREIRA_TOTAL_VENTE_TTC}`);
}
if (totaux.remiseCommercialeTtc !== PEREIRA_REMISE_COMMERCIALE_TTC) {
  throw new Error(`Remise commerciale ${totaux.remiseCommercialeTtc} ≠ ${PEREIRA_REMISE_COMMERCIALE_TTC}`);
}
if (totaux.totalTtc !== PEREIRA_TOTAL_NET_TTC) {
  throw new Error(`Total TTC net ${totaux.totalTtc} ≠ ${PEREIRA_TOTAL_NET_TTC}`);
}
if (input.etudeFinanciere?.totalAides !== PEREIRA_MPR_PARCOURS_TTC) {
  throw new Error("MaPrimeRénov’ Parcours attendu : 20 000,00 €.");
}
if (input.etudeFinanciere?.resteACharge !== PEREIRA_RAC_NET_TTC) {
  throw new Error(`Reste à charge net attendu : ${PEREIRA_RAC_NET_TTC} €.`);
}
const optionA = JSON.stringify(input.etudeFinanciere?.solutionsExclusives?.optionA ?? {});
const optionB = JSON.stringify(input.etudeFinanciere?.solutionsExclusives?.optionB ?? {});
if (!optionA.includes("votre banque partenaire")) {
  throw new Error("L'option A (Éco-PTZ + préfinancement) est incomplète.");
}
if (!optionB.includes("ORIAS 26 009 255")) {
  throw new Error("L'option B doit porter la mention ORIAS UMAFI.");
}
if (!/partenaires financiers/i.test(input.etudeFinanciere?.mentionFinancement ?? "")) {
  throw new Error("La mention de prudence du financement est absente.");
}

const logoBytes = new Uint8Array(readFileSync(logoPath));
const logo = logoFromPngBytes(logoBytes);
if (!logo) {
  throw new Error("Logo PNG illisible.");
}

const doc = createDevisPdfDocument(input, logo);
const bytes = doc.output("arraybuffer");
mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, Buffer.from(bytes));

const header = Buffer.from(bytes).subarray(0, 5).toString("utf8");
if (header !== "%PDF-") {
  throw new Error(`Le fichier genere n'est pas un PDF (${header})`);
}

const pdfLatin = Buffer.from(bytes).toString("latin1");
const extraits = [...pdfLatin.matchAll(/\((?:\\.|[^\\)]){8,180}\)/g)].map((item) =>
  item[0].slice(1, -1).replace(/\\n/g, " "),
);
const textePdf = extraits.join("\n");
if (/75[\s\u00a0]?000|73[\s\u00a0]?500|55[\s\u00a0]?000|53[\s\u00a0]?500/.test(textePdf)) {
  throw new Error("Le PDF Pereira contient encore un ancien montant 75 000 / 73 500 / 55 000 / 53 500.");
}
if (totaux.totalTtcAvantRemise !== 66612.58 || totaux.totalTtc !== 65112.58) {
  throw new Error("Les totaux TTC Pereira (66 612,58 / 65 112,58) ne sont pas à jour.");
}
if (input.etudeFinanciere?.resteACharge !== 45112.58 || input.etudeFinanciere?.totalAides !== 20000) {
  throw new Error("Les aides 20 000,00 € ou le RAC après remise 45 112,58 € ne sont pas à jour.");
}

const pages = doc.getNumberOfPages();
console.log(
  JSON.stringify(
    {
      outputPath,
      pages,
      totalHt: totaux.totalHt,
      totalTva: totaux.totalTva,
      totalTtcAvantRemise: totaux.totalTtcAvantRemise,
      remiseCommercialeTtc: totaux.remiseCommercialeTtc,
      totalTtc: totaux.totalTtc,
      acompteTtc: totaux.acompteTtc,
      miChantierTtc: totaux.miChantierTtc,
      soldeTtc: totaux.soldeTtc,
      racTheorique: PEREIRA_RAC_THEORIQUE_TTC,
      tvaParTaux: totaux.tvaParTaux,
      mpr: input.etudeFinanciere?.totalAides,
      resteACharge: input.etudeFinanciere?.resteACharge,
      coherent: totaux.coherent,
      logoMm: { width: 50, height: Number((50 * (logo.height / logo.width)).toFixed(2)) },
    },
    null,
    2,
  ),
);
if (pages > 2) {
  throw new Error(`Le devis tient sur ${pages} pages (maximum 2).`);
}
