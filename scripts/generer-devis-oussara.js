/**
 * Génère le devis CG Oussara — HTML A4 et PDF A4.
 * Usage : npx tsx scripts/generer-devis-oussara.js
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ASSURANCE_DECENNALE_OUSSARA,
  CHEMIN_DEVIS_OUSSARA,
  CLIENT_OUSSARA,
  FINANCEMENT_OUSSARA,
  IDENTITE_FISCALE_OUSSARA,
  MENTION_CERTIBAT_OUSSARA,
  MENTION_INPI_OUSSARA,
  RAISON_SOCIALE_OUSSARA,
  RIB_OUSSARA,
  SIEGE_OUSSARA,
  NOM_FICHIER_DEVIS_OUSSARA,
  NOM_FICHIER_PDF_OUSSARA,
  OUSSARA_DEVIS_DATE_LONGUE,
  OUSSARA_DEVIS_NUMERO,
  INTERLOCUTEUR_UNIQUE_OUSSARA,
  OUSSARA_DEVIS_TITRE,
  OUSSARA_DEVIS_VALIDITE,
  POSTES_OUSSARA_DEVIS,
  TOTAUX_OUSSARA,
  euroOussara,
  htmlDevisOussara,
} from "../src/lib/crm/oussaraColombierOfficiel.js";

const html = htmlDevisOussara();
const htmlPath = join(process.cwd(), "public", NOM_FICHIER_DEVIS_OUSSARA);
writeFileSync(htmlPath, html, "utf8");

const attendus = [
  "13 000,00",
  "12 700,00",
  "2 540,00",
  "15 240,00",
  "6 096,00",
  "3 048,00",
  "Youssef OUSSARA",
  "COLOMBIER SAUGNIEU",
  "DEV-OUSSARA",
  RIB_OUSSARA.iban,
  RIB_OUSSARA.bic,
  "Bon pour accord et commande ferme",
  "5213845",
  "LUNPIB2604975",
  "28/30",
  "energia-logo-arbres.png",
  "Clause Julia",
  "RE2020",
  OUSSARA_DEVIS_NUMERO,
];
for (const marque of attendus) {
  if (!html.includes(marque)) throw new Error(`HTML manquant : ${marque}`);
}
if (html.includes("9 710,00") || html.includes("11 750,00") || html.includes("21 460") || html.includes("25 752")) {
  throw new Error("Un montant de l'ancienne version est encore sur le devis client");
}
if (/damien/i.test(html) || html.includes("06 72 68 09 68") || html.includes("0166 6836")) {
  throw new Error("Damien ou un IBAN invalide est encore sur le devis");
}

const logo = readFileSync(join(process.cwd(), "public", "assets", "energia-logo-arbres.png"));
const logoUri = `data:image/png;base64,${logo.toString("base64")}`;
const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
const pageWidth = doc.internal.pageSize.getWidth();

function piedDePage() {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `ENERGIA CONSEIL IA® — ${MENTION_INPI_OUSSARA} — ${OUSSARA_DEVIS_NUMERO} — page ${i}/${pages}`,
      12,
      290,
    );
  }
}

doc.addImage(logoUri, "PNG", 12, 8, 52, 16);
doc.setFont("helvetica", "bold");
doc.setFontSize(9);
doc.setTextColor(26, 60, 94);
const raison = doc.splitTextToSize(RAISON_SOCIALE_OUSSARA, 120);
doc.text(raison, 68, 12);
doc.setFont("helvetica", "normal");
doc.setFontSize(7.5);
doc.setTextColor(51, 65, 85);
doc.text(SIEGE_OUSSARA, 68, 22);
doc.text(IDENTITE_FISCALE_OUSSARA, 68, 26);
doc.text(MENTION_INPI_OUSSARA, 68, 30);
doc.text(ASSURANCE_DECENNALE_OUSSARA, 68, 34);
doc.text(MENTION_CERTIBAT_OUSSARA, 68, 38);

doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.setTextColor(26, 60, 94);
const titre = doc.splitTextToSize(
  `${OUSSARA_DEVIS_NUMERO} (Avenant rectifié) — ${OUSSARA_DEVIS_DATE_LONGUE} — validité ${OUSSARA_DEVIS_VALIDITE}`,
  pageWidth - 24,
);
doc.text(titre, 12, 46);

doc.setFont("helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(15, 31, 58);
const titreMarche = doc.splitTextToSize(OUSSARA_DEVIS_TITRE, pageWidth - 24);
doc.text(titreMarche, 12, 54);
let curseur = 54 + titreMarche.length * 4.2;
doc.text(`Maîtres d'ouvrage : ${CLIENT_OUSSARA.libelleSignature}`, 12, curseur);
curseur += 5;
doc.text(`Chantier : ${CLIENT_OUSSARA.adresse}`, 12, curseur);
curseur += 5;
const interlocuteur = doc.splitTextToSize(INTERLOCUTEUR_UNIQUE_OUSSARA, pageWidth - 24);
doc.text(interlocuteur, 12, curseur);

autoTable(doc, {
  startY: curseur + 4 + interlocuteur.length * 4,
  head: [["N°", "Désignation technique"]],
  body: POSTES_OUSSARA_DEVIS.map((poste) => [
    String(poste.ordreContractuel),
    `${poste.nom}\n${poste.specifications}`,
  ]),
  styles: { fontSize: 8, cellPadding: 1.5, textColor: [15, 31, 58], valign: "top" },
  headStyles: { fillColor: [26, 60, 94], textColor: 255 },
  columnStyles: { 0: { cellWidth: 10 } },
  margin: { left: 12, right: 12, bottom: 16 },
});

let y = doc.lastAutoTable.finalY + 8;
if (y > 230) {
  doc.addPage();
  y = 16;
}
doc.setFontSize(10);
doc.setFont("helvetica", "bold");
doc.text("Récapitulatif financier et appels de fonds", 12, y);
doc.setFont("helvetica", "normal");
doc.setFontSize(9);
const echeancier = [
  `Total travaux HT : ${euroOussara(TOTAUX_OUSSARA.totalHtBrut)} € HT`,
  `Geste commercial exceptionnel de Direction : - ${euroOussara(TOTAUX_OUSSARA.gesteCommercialHt)} € HT`,
  `Montant total net HT : ${euroOussara(TOTAUX_OUSSARA.totalHt)} € HT`,
  `TVA 20 % construction neuve : ${euroOussara(TOTAUX_OUSSARA.totalTva)} €`,
  `Montant total net TTC : ${euroOussara(TOTAUX_OUSSARA.totalTtc)} € TTC`,
  `${FINANCEMENT_OUSSARA.libelleAcompte} : ${euroOussara(FINANCEMENT_OUSSARA.acompte)} € TTC`,
  `${FINANCEMENT_OUSSARA.libelleIntermediaire} : ${euroOussara(FINANCEMENT_OUSSARA.intermediaire)} € TTC`,
  `${FINANCEMENT_OUSSARA.libelleSolde} : ${euroOussara(FINANCEMENT_OUSSARA.solde)} € TTC`,
  `Titulaire : ${RIB_OUSSARA.titulaire} — ${RIB_OUSSARA.banque} (${RIB_OUSSARA.adresseBanque})`,
  `IBAN : ${RIB_OUSSARA.iban} — BIC : ${RIB_OUSSARA.bic}`,
  RIB_OUSSARA.mention,
  "Mention manuscrite : Bon pour accord et commande ferme. Date, signature du client et cachet ENERGIA CONSEIL IA.",
  "Clause Julia Protection Aides : plafond 2 000 € si écart > 10 % imputable à une erreur prouvée d'ENERGIA.",
  "Avis établi sous la responsabilité de Julia, juriste ENERGIA CONSEIL IA — 30 octobre 2026.",
  INTERLOCUTEUR_UNIQUE_OUSSARA,
  "Courtier : FABIEN — VIVONS COURTIER — 06 71 19 96 45. Juriste : Julia. MAR : Antoine BARATIER – Cabinet C2ET.",
];
echeancier.forEach((ligne) => {
  const morceaux = doc.splitTextToSize(ligne, pageWidth - 24);
  if (y + morceaux.length * 4.5 > 280) {
    doc.addPage();
    y = 16;
  }
  y += 6;
  doc.text(morceaux, 12, y);
  y += (morceaux.length - 1) * 4;
});

piedDePage();
const pdfPath = join(process.cwd(), "public", NOM_FICHIER_PDF_OUSSARA);
writeFileSync(pdfPath, Buffer.from(doc.output("arraybuffer")));

const pdf = readFileSync(pdfPath);
if (pdf.subarray(0, 5).toString() !== "%PDF-") {
  throw new Error("PDF invalide");
}
if (pdf.length < 8000) throw new Error(`PDF trop court (${pdf.length} octets)`);
const pdfTexte = pdf.toString("latin1");
if (/damien/i.test(pdfTexte) || pdfTexte.includes("06 72 68 09 68")) {
  throw new Error("Damien ou son numéro est encore dans le PDF");
}

console.log(`OK — ${NOM_FICHIER_DEVIS_OUSSARA}`);
console.log(`  public : ${htmlPath}`);
console.log(`  chemin : ${CHEMIN_DEVIS_OUSSARA}`);
console.log(`  pdf : ${pdfPath} (${pdf.length} octets)`);
