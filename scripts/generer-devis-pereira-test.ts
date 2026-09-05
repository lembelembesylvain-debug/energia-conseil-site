import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PEREIRA_MPR_PARCOURS_TTC,
  PEREIRA_PAC_DESIGNATION,
  PEREIRA_RAC_NET_TTC,
  PEREIRA_REMISE_COMMERCIALE_TTC,
  PEREIRA_STATUT_DEVIS,
  PEREIRA_TOTAL_NET_TTC,
  PEREIRA_TOTAL_VENTE_TTC,
  construireDevisPereiraTest,
} from "../src/data/pereiraDevisTest";
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
  throw new Error("Reste à charge net attendu : 55 000,00 €.");
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
if (pages > 3) {
  throw new Error(`Le devis tient sur ${pages} pages (objectif : 2, maximum 3).`);
}
