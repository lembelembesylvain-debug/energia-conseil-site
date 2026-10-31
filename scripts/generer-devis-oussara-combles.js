/**
 * Génère le devis combles Oussara — HTML A4 et PDF A4.
 * Usage : npx tsx scripts/generer-devis-oussara-combles.js
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ASSURANCE_DECENNALE_OUSSARA_COMBLES,
  CHEMIN_DEVIS_OUSSARA_COMBLES,
  CLIENT_OUSSARA_COMBLES,
  FINANCEMENT_OUSSARA_COMBLES,
  INTERLOCUTEUR_UNIQUE_OUSSARA_COMBLES,
  MENTION_INPI_OUSSARA_COMBLES,
  NOM_FICHIER_DEVIS_OUSSARA_COMBLES,
  NOM_FICHIER_PDF_OUSSARA_COMBLES,
  OUSSARA_COMBLES_DATE_LONGUE,
  OUSSARA_COMBLES_DEVIS_NUMERO,
  OUSSARA_COMBLES_VALIDITE,
  POSTES_OUSSARA_COMBLES,
  RIB_OUSSARA_COMBLES,
  SIEGE_OUSSARA_COMBLES,
  TITRE_OUSSARA_COMBLES,
  TOTAUX_OUSSARA_COMBLES,
  euroOussaraCombles,
  htmlDevisOussaraCombles,
} from "../src/lib/crm/oussaraComblesOfficiel.js";

const html = htmlDevisOussaraCombles();
const htmlPath = join(process.cwd(), "public", NOM_FICHIER_DEVIS_OUSSARA_COMBLES);
writeFileSync(htmlPath, html, "utf8");

const attendus = [
  "1 400,00",
  "280,00",
  "1 680,00",
  "672,00",
  "1 008,00",
  "49,00",
  "7,50",
  "350 mm",
  "ACERMI",
  "DEV-OUSSARA-COMBLES",
  RIB_OUSSARA_COMBLES.iban,
  RIB_OUSSARA_COMBLES.bic,
  "Youssef OUSSARA",
  "COLOMBIER SAUGNIEU",
  "energia-logo-arbres.png",
  "LUNPIB2604975",
  "941 819 427 00019",
  "contact@renovoptim-ia.com",
  OUSSARA_COMBLES_DEVIS_NUMERO,
];
for (const marque of attendus) {
  if (!html.includes(marque)) throw new Error(`HTML manquant : ${marque}`);
}
if (/damien/i.test(html) || html.includes("06 72 68 09 68") || html.includes("0166 6836")) {
  throw new Error("Damien ou un IBAN invalide est encore sur le devis combles");
}

const logo = readFileSync(join(process.cwd(), "public", "assets", "energia-logo-arbres.png"));
const logoUri = `data:image/png;base64,${logo.toString("base64")}`;
const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
const pageWidth = doc.internal.pageSize.getWidth();

doc.addImage(logoUri, "PNG", 12, 8, 48, 15);
doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.setTextColor(26, 60, 94);
doc.text("ENERGIA CONSEIL IA", 64, 13);
doc.setFont("helvetica", "normal");
doc.setFontSize(8);
doc.setTextColor(51, 65, 85);
doc.text(SIEGE_OUSSARA_COMBLES, 64, 18);
doc.text(`${ASSURANCE_DECENNALE_OUSSARA_COMBLES} — ${MENTION_INPI_OUSSARA_COMBLES}`, 64, 22);
doc.text(INTERLOCUTEUR_UNIQUE_OUSSARA_COMBLES, 64, 26);

doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(26, 60, 94);
doc.text(`${OUSSARA_COMBLES_DEVIS_NUMERO}`, 12, 38);
doc.setFont("helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(15, 31, 58);
const titre = doc.splitTextToSize(TITRE_OUSSARA_COMBLES, pageWidth - 24);
doc.text(titre, 12, 44);
let y = 44 + titre.length * 4.5;
doc.text(`Client : ${CLIENT_OUSSARA_COMBLES.libelleSignature}`, 12, y);
y += 5;
doc.text(`Chantier : ${CLIENT_OUSSARA_COMBLES.adresse}`, 12, y);
y += 5;
doc.text(`Date : ${OUSSARA_COMBLES_DATE_LONGUE} — validité ${OUSSARA_COMBLES_VALIDITE}`, 12, y);

autoTable(doc, {
  startY: y + 4,
  head: [["N°", "Prestation"]],
  body: POSTES_OUSSARA_COMBLES.map((poste) => [String(poste.ordreContractuel), `${poste.nom}\n${poste.specifications}`]),
  styles: { fontSize: 8, cellPadding: 1.6, textColor: [15, 31, 58], valign: "top" },
  headStyles: { fillColor: [26, 60, 94], textColor: 255 },
  columnStyles: { 0: { cellWidth: 10 } },
  margin: { left: 12, right: 12, bottom: 16 },
});

y = doc.lastAutoTable.finalY + 8;
doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.text("Montants et règlement", 12, y);
doc.setFont("helvetica", "normal");
doc.setFontSize(9);
const lignes = [
  `Fourniture et pose : ${euroOussaraCombles(TOTAUX_OUSSARA_COMBLES.totalHt)} € HT`,
  `TVA 20 % : ${euroOussaraCombles(TOTAUX_OUSSARA_COMBLES.totalTva)} €`,
  `Total net TTC : ${euroOussaraCombles(TOTAUX_OUSSARA_COMBLES.totalTtc)} € TTC`,
  `${FINANCEMENT_OUSSARA_COMBLES.libelleAcompte} : ${euroOussaraCombles(FINANCEMENT_OUSSARA_COMBLES.acompte)} € TTC`,
  `${FINANCEMENT_OUSSARA_COMBLES.libelleSolde} : ${euroOussaraCombles(FINANCEMENT_OUSSARA_COMBLES.solde)} € TTC`,
  `Titulaire : ${RIB_OUSSARA_COMBLES.titulaire} — ${RIB_OUSSARA_COMBLES.banque}`,
  `IBAN : ${RIB_OUSSARA_COMBLES.iban} — BIC : ${RIB_OUSSARA_COMBLES.bic}`,
  `Libellé : ${RIB_OUSSARA_COMBLES.referenceVirement}`,
  "Mention manuscrite : Bon pour accord et commande ferme.",
  INTERLOCUTEUR_UNIQUE_OUSSARA_COMBLES,
];
lignes.forEach((ligne) => {
  y += 6;
  doc.text(doc.splitTextToSize(ligne, pageWidth - 24), 12, y);
});

const pages = doc.getNumberOfPages();
for (let i = 1; i <= pages; i += 1) {
  doc.setPage(i);
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`ENERGIA CONSEIL IA® — ${OUSSARA_COMBLES_DEVIS_NUMERO} — page ${i}/${pages}`, 12, 290);
}

const pdfPath = join(process.cwd(), "public", NOM_FICHIER_PDF_OUSSARA_COMBLES);
writeFileSync(pdfPath, Buffer.from(doc.output("arraybuffer")));
const pdf = readFileSync(pdfPath);
if (pdf.subarray(0, 5).toString() !== "%PDF-") throw new Error("PDF invalide");
console.log(`OK — ${NOM_FICHIER_DEVIS_OUSSARA_COMBLES}`);
console.log(`  ${htmlPath}`);
console.log(`  ${CHEMIN_DEVIS_OUSSARA_COMBLES}`);
console.log(`  ${pdfPath} (${pdf.length} octets)`);
