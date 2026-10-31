/**
 * Cohérence du contrat officiel Clyve — Longère La Genête.
 * Exécution : npx tsx src/lib/crm/verify-rapport-la-genete.ts
 */

import { existsSync } from "node:fs";
import { htmlContratPourDossier, nomFichierContrat } from "./htmlContratCrm.js";
import {
  CLYVE_CONTRAT_NUMERO,
  CLYVE_CONTRAT_TITRE,
  CLYVE_DEVIS_P4_NUMERO,
  CLYVE_DEVIS_P4_TITRE,
  CLYVE_LAGENETE_DOSSIER_ID,
  FIGURES_CLYVE_CONTRAT,
  FIGURES_CLYVE_PHASE_4,
  MENTION_NON_SIGNATURE_P4,
  NOM_FICHIER_CONTRAT_CLYVE,
  NOM_FICHIER_DEVIS_P4_CLYVE,
  POSTES_CLYVE_PHASE_1,
  verifierCoherenceContratClyve,
  verifierCoherenceDevisPrintempsClyve,
} from "./clyveLaGeneteContrat.js";

const erreurs = verifierCoherenceContratClyve();
if (erreurs.length > 0) throw new Error(erreurs.join(" | "));

const html = htmlContratPourDossier({}, { id: CLYVE_LAGENETE_DOSSIER_ID });

if (!html.includes(CLYVE_CONTRAT_TITRE)) throw new Error("titre bandeau absent");
if (!html.includes(CLYVE_CONTRAT_NUMERO)) throw new Error("numéro contrat absent");
if (!html.includes("I. Identification des parties")) throw new Error("section I absente");
if (!html.includes("II. Détail des postes contractuels")) throw new Error("section II absente");
if (!html.includes("Désignation détaillée")) throw new Error("tableau 8 colonnes absent");
if (!html.includes("CADRE TECHNIQUE BÂTI ANCIEN PISÉ")) throw new Error("alerte pisé absente");
if (!html.includes("engagement-bleu")) throw new Error("bloc d'engagement bleu absent");
if (!html.includes("8 850,00")) throw new Error("prix Phase 1 HT absent");
if (!html.includes("9 735,00")) throw new Error("prix Phase 1 TTC absent");
if (!html.includes("14 850,00")) throw new Error("option 1+2 HT absente");
if (!html.includes("16 335,00")) throw new Error("option 1+2 TTC absente");
if (!html.includes("2 920,50")) throw new Error("acompte 30 % absent");
if (!html.includes("3 894,00")) throw new Error("40 % démarrage absent");
if (!html.includes("40 % au démarrage")) throw new Error("libellé 40 % démarrage absent");
if (!html.includes("Lu et approuvé, bon pour accord et commande ferme")) {
  throw new Error("formule de signature absente");
}
if (!html.includes("doc-title-bandeau")) throw new Error("bandeau marine du titre absent");
if (!html.includes("Option 1") || !html.includes("16 335,00")) throw new Error("choix Option 1 / Option 2 absent");
if (!html.includes("Printemps 2027")) throw new Error("titre projection 2027 absent");
if (!html.includes("profil Bleu")) throw new Error("avertissement profil Bleu absent");
if (!html.includes("indépendants")) throw new Error("indépendance Phase 1 absente");
if (!html.includes("badge-p4")) throw new Error("badge Phase 4 absent");
if (!html.includes("Antoine BARATIER")) throw new Error("MAR officiel absent");
if (html.includes("Léo-Energy")) throw new Error("Léo-Energy encore présent");
if (/DAMIEN|damien\.srdconseil/.test(html.replace(/src="data:image\/[^;]+;base64,[^"]+"/g, ""))) {
  throw new Error("Damien encore présent dans le contrat Clyve");
}
if (!html.includes("data:image/png;base64,")) throw new Error("logo embarqué absent");
if (!html.includes("#0B1F3A") || !html.includes("#059669")) throw new Error("charte Brunel absente");
if (POSTES_CLYVE_PHASE_1.length !== 6) throw new Error("6 postes requis");

for (const figure of FIGURES_CLYVE_CONTRAT) {
  if (!existsSync(`public${figure.src}`)) throw new Error(`figure absente : public${figure.src}`);
  if (!html.includes(figure.src)) throw new Error(`src figure absente du HTML : ${figure.src}`);
}

if (nomFichierContrat({ id: CLYVE_LAGENETE_DOSSIER_ID }) !== NOM_FICHIER_CONTRAT_CLYVE) {
  throw new Error("nom de fichier contrat");
}

const erreursP4 = verifierCoherenceDevisPrintempsClyve();
if (erreursP4.length > 0) throw new Error(erreursP4.join(" | "));

const htmlP4 = htmlContratPourDossier({ devisPrintemps: true }, { id: CLYVE_LAGENETE_DOSSIER_ID });
if (!htmlP4.includes(CLYVE_DEVIS_P4_TITRE)) throw new Error("titre Phase 4 absent");
if (!htmlP4.includes(CLYVE_DEVIS_P4_NUMERO)) throw new Error("numéro DEVIS-2027-LAGENETE-PHASE4-GLOBAL absent");
if (!htmlP4.includes("doc-title-bandeau")) throw new Error("bandeau marine Phase 4 absent");
if (!htmlP4.includes("Maître d'ouvrage")) throw new Error("maître d'ouvrage absent");
if (!htmlP4.includes("Lieu des travaux")) throw new Error("lieu des travaux absent");
if (!htmlP4.includes("spécifications techniques RGE")) throw new Error("colonne 8 RGE absente");
if (!htmlP4.includes("69 000,00")) throw new Error("69 000 HT absent");
if (!htmlP4.includes("3 795,00")) throw new Error("TVA 5,5 % absente");
if (!htmlP4.includes("72 795,00")) throw new Error("72 795 TTC absent");
if (!htmlP4.includes("18 500,00") || !htmlP4.includes("14 800,00") || !htmlP4.includes("13 500,00")) {
  throw new Error("postes Phase 4 manquants");
}
if (!htmlP4.includes("55 200") || !htmlP4.includes("56 000")) throw new Error("subvention Anah Bleu 55 200–56 000 € absente");
if (!htmlP4.includes("13 600") || !htmlP4.includes("17 595")) throw new Error("RAC 13 600–17 595 € absent");
if (htmlP4.includes("bonus sortie de passoire") || htmlP4.includes("80 % à 90 %")) {
  throw new Error("bonus sortie de passoire encore présent Phase 4");
}
if (!htmlP4.includes("70") || !htmlP4.includes("Éco-PTZ")) throw new Error("mensualité Éco-PTZ absente");
if (!htmlP4.includes(MENTION_NON_SIGNATURE_P4)) throw new Error("avertissement Loi de Finances 2027 absent");
if (!htmlP4.includes("Ne pas signer avant notification d'accord officiel de l'ANAH")) {
  throw new Error("interdiction de signature Anah absente");
}
const idxVmcHtml = htmlP4.indexOf("Ventilation VMC");
const idxPacHtml = htmlP4.indexOf("Pompe à chaleur");
if (idxVmcHtml < 0 || idxPacHtml < 0 || idxVmcHtml > idxPacHtml) {
  throw new Error("VMC doit précéder la PAC dans le devis Phase 4");
}
if (/DAMIEN|damien\.srdconseil/.test(htmlP4.replace(/src="data:image\/[^;]+;base64,[^"]+"/g, ""))) {
  throw new Error("Damien encore présent dans le devis Phase 4");
}
if (htmlP4.includes("Léo-Energy")) throw new Error("Léo-Energy encore présent Phase 4");
if (!htmlP4.includes("Antoine BARATIER")) throw new Error("MAR C2ET absent Phase 4");
if (!htmlP4.includes("Clause Julia")) throw new Error("Clause Julia absente Phase 4");
if (nomFichierContrat({ id: CLYVE_LAGENETE_DOSSIER_ID }, { devisPrintemps: true }) !== NOM_FICHIER_DEVIS_P4_CLYVE) {
  throw new Error("nom de fichier devis Phase 4");
}
if (FIGURES_CLYVE_PHASE_4.length !== 2) throw new Error("2 figures Phase 4 requises");
if (FIGURES_CLYVE_PHASE_4[0].src !== "/facade-nord-pac.jpg") throw new Error("figure 1 doit être la façade Nord-Est PAC");
if (!htmlP4.includes("implantation d'architecte de la Pompe à Chaleur Air/Eau 14 kW")) {
  throw new Error("légende PAC Figure 1 absente");
}
if (!htmlP4.includes("VUE INTÉRIEURE 3D")) throw new Error("vue intérieure absente");
if (!htmlP4.includes("socle béton technique")) throw new Error("socle PAC absent de la légende");
if (!htmlP4.includes("nouveau plancher haut bois")) throw new Error("légende intérieur absente");
if (htmlP4.includes("/0.jpg") || htmlP4.includes("Coupe 3D axonométrique")) {
  throw new Error("coupe axonométrique encore en Figure 1");
}
for (const figure of FIGURES_CLYVE_PHASE_4) {
  if (!existsSync(`public${figure.src}`)) throw new Error(`figure Phase 4 absente : public${figure.src}`);
  if (!htmlP4.includes(figure.src)) throw new Error(`src figure Phase 4 absente : ${figure.src}`);
}

console.log(
  `Contrat Clyve La Genête — cohérence OK (${CLYVE_CONTRAT_NUMERO}, 6 postes, 8 850 € HT / 9 735 € TTC, charte Brunel).`,
);
console.log(
  `Devis Phase 4 — cohérence OK (${CLYVE_DEVIS_P4_NUMERO}, 7 postes, 69 000 € HT / 72 795 € TTC, Anah Bleu 80 % / 55 200–56 000 €).`,
);
