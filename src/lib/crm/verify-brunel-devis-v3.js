/**
 * Contrôles du devis officiel Brunel / Indivision COUBLE FINAL (100 m²).
 * Devis façade N° EC-2026-BRUNEL-FACADE-V1 du 18/09/2026.
 * Exécution : node src/lib/crm/verify-brunel-devis-v3.js
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AIDES_BRUNEL_V3,
  ALERTE_INDIVISION_COUBLE_815,
  BRUNEL_CONTRAT_TITRE,
  BRUNEL_FINAL_NUMERO,
  CADRE_JURIDIQUE_INDIVISION_815,
  CLAUSE_INDIVISION_COUBLE_815,
  CLIENT_BRUNEL_V3,
  COMBLES_PU_HT,
  COMBLES_QTE_OFFICIELLE,
  COORDINATION_ENERGIA,
  DEVIS_FACADE_NUMERO,
  FICHIER_DEVIS_BRUNEL_FINAL,
  FINANCEMENT_BRUNEL_V3,
  NOTE_DEVIS_FACADE_V1,
  NOTE_PORTE_SERVICE_HORS_MARCHE,
  POSTE_HORS_SUBVENTION_BRUNEL,
  POSTES_BRUNEL_V3,
  STATUT_DOSSIER_BRUNEL_V3,
  TOTAUX_BRUNEL_V3,
  TOTAUX_FACADE_BRUNEL,
  calculerPosteCombles,
  editionOfficielleBrunelV3,
  totauxContractuelsBrunelV3,
} from "./brunelDevisV3Officiel.js";
import {
  CONTACTS_BRUNEL_FINAL,
  LEGENDE_FACADE_BRUNEL,
  TITRE_ANNEXE_VISUELLE_FACADE,
} from "./payloadContratCrm.js";
import { genererHtmlDevisBrunelFinal } from "./devisBrunelFinalHtml.js";
import {
  appliquerVerrouillageBrunelV3,
  calculerAidesIndicatives,
  calculerFinancement,
  calculerFinancesInternes,
  totauxTravaux,
} from "./editionDossier.js";
import {
  BRUNEL_DOSSIER_ID,
  CLAUSE_INDIVISION_COUBLE_815 as CLAUSE_BASE,
  creerBaseTravailBrunel,
} from "./brunelWorkingBase.js";
import { ROLE_ADMIN, ROLE_COMMERCIAL } from "./roles.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

const totaux = totauxContractuelsBrunelV3();
assert(POSTES_BRUNEL_V3.length === 8, "8 postes du marché global");
assert(totaux.totalHt === 35742.41, `HT ${totaux.totalHt}`);
assert(totaux.totalTva === 1965.83, `TVA ${totaux.totalTva}`);
assert(totaux.totalTtc === 37708.24, `TTC ${totaux.totalTtc}`);
assert(totaux.totalHt === TOTAUX_BRUNEL_V3.totalHt, "constante HT");
assert(totaux.totalTva === TOTAUX_BRUNEL_V3.totalTva, "constante TVA");
assert(totaux.totalTtc === TOTAUX_BRUNEL_V3.totalTtc, "constante TTC");
assert(totaux.lignes[0].artisan.includes("C2L"), "poste 1 C2L");
assert(totaux.lignes[0].quantite === COMBLES_QTE_OFFICIELLE, "combles 100 m²");
assert(totaux.lignes[0].quantiteFlexible === false, "combles verrouillés");
assert(totaux.lignes[0].totalHt === 4168, "combles 4 168 HT");
assert(totaux.lignes[0].totalTva === 229.24, "combles TVA 229,24");
assert(totaux.lignes[0].totalTtc === 4397.24, "combles TTC 4 397,24");
assert(totaux.lignes[0].puHt === COMBLES_PU_HT, "PU combles 41,68");
assert(totaux.lignes[1].id === "v3-poste-2-fenetres-pvc", "poste 2 fenêtres");
assert(totaux.lignes[1].quantite === 4 && totaux.lignes[1].totalHt === 2600, "poste 2 2 600 HT");
assert(totaux.lignes[1].totalTva === 143 && totaux.lignes[1].totalTtc === 2743, "poste 2 TVA/TTC");
assert(totaux.lignes[1].nom.includes("4 Fenêtres double vitrage RAL 7016"), "poste 2 4 fenêtres RAL 7016");
assert(totaux.lignes[2].id === "v3-poste-3-ensemble-baie", "poste 3 ensemble baie");
assert(totaux.lignes[2].totalHt === 6200 && totaux.lignes[2].totalTva === 341 && totaux.lignes[2].totalTtc === 6541, "poste 3 montants");
assert(totaux.lignes[2].specifications.includes("2 800,00"), "poste 3 ouverture 2 800 HT");
assert(totaux.lignes[2].specifications.includes("2 950,00"), "poste 3 baie 2 950 HT");
assert(totaux.lignes[2].specifications.includes("450,00"), "poste 3 condamnation 450 HT");
assert(totaux.lignes[3].id === "v3-poste-4-porte-entree", "poste 4 porte");
assert(totaux.lignes[3].totalHt === 2500 && totaux.lignes[3].totalTva === 137.5 && totaux.lignes[3].totalTtc === 2637.5, "poste 4 montants");
const facadeHt = round2(totaux.lignes.slice(1, 4).reduce((s, l) => s + l.totalHt, 0));
const facadeTva = round2(totaux.lignes.slice(1, 4).reduce((s, l) => s + l.totalTva, 0));
const facadeTtc = round2(totaux.lignes.slice(1, 4).reduce((s, l) => s + l.totalTtc, 0));
assert(facadeHt === TOTAUX_FACADE_BRUNEL.totalHt, "façade HT 11 300");
assert(facadeTva === TOTAUX_FACADE_BRUNEL.totalTva, "façade TVA 621,50");
assert(facadeTtc === TOTAUX_FACADE_BRUNEL.totalTtc, "façade TTC 11 921,50");
assert(totaux.lignes[4].totalHt === 1500 && totaux.lignes[4].totalTva === 82.5, "VMC");
assert(totaux.lignes[5].quantite === 5 && totaux.lignes[5].totalHt === 11374.41, "5 splits Premium 11 374,41 HT");
assert(totaux.lignes[5].puHt === 2274.88 && totaux.lignes[5].totalTva === 625.59 && totaux.lignes[5].totalTtc === 12000, "poste 6 Premium TVA/TTC");
assert(totaux.lignes[5].nom.includes("GAMME PREMIUM"), "poste 6 Gamme Premium");
assert(totaux.lignes[6].totalHt === 2200 && totaux.lignes[6].totalTtc === 2321, "CET");
assert(totaux.lignes[7].totalHt === 5200, "coordination 5 200 HT");
assert(totaux.lignes[7].nom.includes("Contractant Général"), "ligne 8 Contractant Général");
assert(!JSON.stringify(totaux).includes("Léo-Energy"), "aucune Léo-Energy dans les postes");
assert(POSTE_HORS_SUBVENTION_BRUNEL.totalHt === 980, "lot 2 HT");
assert(POSTE_HORS_SUBVENTION_BRUNEL.tauxTva === 0.1, "lot 2 TVA 10 %");
assert(POSTE_HORS_SUBVENTION_BRUNEL.totalTtc === 1078, "lot 2 TTC");
assert(!totaux.lignes.some((l) => l.id === POSTE_HORS_SUBVENTION_BRUNEL.id), "lot 2 hors totaux marché");

const combles = calculerPosteCombles(100);
assert(combles.totalHt === 4168 && combles.totalTva === 229.24 && combles.totalTtc === 4397.24, "combles 100 m² au centime");

const edition = editionOfficielleBrunelV3();
assert(edition.devisOfficiel.numero === BRUNEL_FINAL_NUMERO, "numéro FINAL");
assert(edition.devisOfficiel.devisFacade.numero === DEVIS_FACADE_NUMERO, "numéro devis façade");
assert(edition.client.adresse === CLIENT_BRUNEL_V3.adresse, "adresse Lagunes");
assert(edition.client.mandant === "Indivision COUBLE", "mandant");
assert(edition.client.cadreJuridique === CADRE_JURIDIQUE_INDIVISION_815, "cadre 815");
assert(edition.client.statutDossier === STATUT_DOSSIER_BRUNEL_V3, "statut attente signature");
assert(edition.mentionsJuridiques.includes(CLAUSE_INDIVISION_COUBLE_815), "clause 815");
assert(edition.mentionsJuridiques.includes(ALERTE_INDIVISION_COUBLE_815), "alerte 815");
assert(edition.mentionsJuridiques.includes(NOTE_DEVIS_FACADE_V1), "note devis façade");
assert(edition.mentionsJuridiques.includes(NOTE_PORTE_SERVICE_HORS_MARCHE), "note porte garage");
assert(edition.prestataire.siret === "94181942700019", "SIRET");
assert(edition.mar.nom === "ENERGIA-CONSEIL IA®", "coordination ENERGIA");
assert(edition.mar.role === COORDINATION_ENERGIA.role, "rôle Contractant Général");
assert(edition.mar.coordination === "Sylvain LEMBELEMBE", "Sylvain");
assert(edition.horsSubvention.totalTtc === 1078, "édition lot 2");
assert(!JSON.stringify(edition).includes("Léo-Energy"), "édition sans Léo-Energy");

const calc = totauxTravaux(edition.travaux);
assert(calc.totalHt === 35742.41 && calc.totalTva === 1965.83 && calc.totalTtc === 37708.24, "totaux moteur = devis FINAL");

const aides = calculerAidesIndicatives(edition);
assert(aides.mpr === AIDES_BRUNEL_V3.mpr, "MPR 21 445");
assert(aides.cee === 4875, "CEE 4 875");
assert(aides.libelleCee === AIDES_BRUNEL_V3.libelleCee, "libellé CEE Chauffage");
assert(aides.locales === 1500, "Région 1 500");
assert(aides.mar === 1600, "MAR 1 600");
assert(aides.totalAides === 29420, "total aides 29 420");
assert(aides.verrouillageOfficiel === true, "verrouillage aides");

const plan = calculerFinancement(edition);
assert(plan.resteACharge === 8288.24, `RAC ${plan.resteACharge}`);
assert(plan.acompte === 11312.47, "acompte 11 312,47");
assert(plan.intermediaire === 15083.3, "intermédiaire 15 083,30");
assert(plan.solde === 11312.47, "solde 11 312,47");
assert(round2(plan.acompte + plan.intermediaire + plan.solde) === 37708.24, "échéancier = TTC");
assert(plan.mensualite === FINANCEMENT_BRUNEL_V3.mensualiteExacte, `mensualité ${plan.mensualite}`);
assert(plan.bilanNetMensuel === FINANCEMENT_BRUNEL_V3.bilanNetMensuel, `bilan ${plan.bilanNetMensuel}`);
assert(plan.ecoPtzDuree === 20, "20 ans");

const finAdmin = calculerFinancesInternes(edition, ROLE_ADMIN);
assert(finAdmin.coutClyveHt === 990, "Clyve 990 HT");
assert(finAdmin.recetteCoordinationHt === 5200, "recette coordination 5 200 HT");
assert(finAdmin.margeNetteCoordination === 4210, "5 200 − 990 = 4 210 HT net ENERGIA");
assert(calculerFinancesInternes(edition, ROLE_COMMERCIAL).coutClyveHt == null, "Clyve masqué hors admin");

const locked = appliquerVerrouillageBrunelV3({ travaux: [{ id: "x", nom: "intrus", quantite: 1, puHt: 1 }] });
assert(locked.travaux.length === 8, "verrouillage écrase les lots CRM");
assert(locked.travaux.every((l) => l.id.startsWith("v3-poste-")), "ids officiels");
assert(locked.travaux[0].quantite === 100, "verrouillage impose 100 m²");

const ignore70 = appliquerVerrouillageBrunelV3({
  travaux: [{ id: "v3-poste-1-combles", quantite: 70, quantiteFlexible: true, puHt: 41.68 }],
});
assert(ignore70.travaux[0].quantite === 100, "70 m² recalé à 100 m²");
assert(ignore70.travaux[0].quantiteFlexible === false, "plus de surface flexible");

const base = creerBaseTravailBrunel();
assert(base.id === BRUNEL_DOSSIER_ID, "id dossier");
assert(base.client.codePostal === "42510", "working base CP Bussières");
assert(base.client.ville === "BUSSIÈRES", "working base ville");
assert(base.rfr.montant === 20216, "RFR 20 216");
assert(base.alertes.includes(CLAUSE_BASE), "clause 815 en alerte");
assert(base.documents.devis.lignes.length === 0, "factory devis interne toujours vide");

assert(CONTACTS_BRUNEL_FINAL.length === 5, "5 contacts officiels");
assert(CONTACTS_BRUNEL_FINAL[0].nom === "Sylvain LEMBELEMBE", "contact 1 Sylvain");
assert(CONTACTS_BRUNEL_FINAL[1].role.includes("Courtier en travaux"), "contact 2 Fabien");
assert(CONTACTS_BRUNEL_FINAL[2].nom === "Clyve", "contact 3 Clyve");
assert(CONTACTS_BRUNEL_FINAL[3].nom === "Julia", "contact 4 Julia");
assert(CONTACTS_BRUNEL_FINAL[4].role === "Opérateur MAR", "contact 5 MAR");
assert(
  !CONTACTS_BRUNEL_FINAL.some((c) => /catarina|architecte|iad/i.test(`${c.role} ${c.nom} ${c.detail}`)),
  "contacts sans Catarina, architecte ni iad",
);

const html = genererHtmlDevisBrunelFinal();
const htmlSansLogo = html.replace(/src="data:image\/[^;]+;base64,[^"]+"/g, 'src="LOGO_EMBARQUE"');
assert(html.includes(BRUNEL_CONTRAT_TITRE), "HTML titre Contractant Général");
assert(html.includes(BRUNEL_FINAL_NUMERO), "HTML numéro FINAL");
assert(html.includes("data:image/png;base64,"), "logo Base64 embarqué");
assert(!/src="\/assets\/partners\/_shared\/energia-logo-arbres\.png"/.test(html), "plus de src fichier logo");
assert(html.includes("Direction de projet &amp; Contractant Général") || html.includes("Direction de projet & Contractant Général"), "HTML Direction de projet & Contractant Général");
assert(html.includes("Article 1 — Qualité de Contractant Général"), "HTML Article 1 Contractant Général");
assert(html.includes("16. Malfaçons et garanties"), "HTML Article 16");
assert(html.includes("Article 18 — Validité"), "HTML Article 18");
assert(html.includes("ENERGIA-CONSEIL IA® intervient en qualité exclusive de CONTRACTANT GÉNÉRAL"), "HTML Article 16 statut");
assert(html.includes("en qualité de Contractant Général"), "HTML Bon pour accord mandat");
assert(!htmlSansLogo.includes("AMO"), "HTML sans AMO");
assert(!htmlSansLogo.includes("ENERGIA agit en AMO"), "HTML plus d'AMO à l'article 16");
assert(html.includes("31 733,21"), "HTML HT");
assert(html.includes("1 745,32"), "HTML TVA");
assert(html.includes("33 478,53"), "HTML TTC");
assert(html.includes("10 043,56"), "HTML acompte 30 %");
assert(html.includes("13 391,41"), "HTML acompte 40 %");
assert(html.includes("30 % / 40 % / 30 %") || html.includes("30 % signature / 40 % démarrage / 30 % réception"), "HTML cadencement 30/40/30");
assert(FINANCEMENT_BRUNEL_V3.acompte + FINANCEMENT_BRUNEL_V3.intermediaire + FINANCEMENT_BRUNEL_V3.solde === TOTAUX_BRUNEL_V3.totalTtc || round2(FINANCEMENT_BRUNEL_V3.acompte + FINANCEMENT_BRUNEL_V3.intermediaire + FINANCEMENT_BRUNEL_V3.solde) === TOTAUX_BRUNEL_V3.totalTtc, "constantes 30+40+30 = TTC");
assert(html.includes("19 039,93"), "HTML ANAH jaune 60 %");
assert(html.includes("14 438,60"), "HTML RAC travaux");
assert(html.includes("15 238,60"), "HTML RAC global");
assert(html.includes("111 Rue Poliacus"), "HTML domicile Pouilly-lès-Feurs");
assert(!html.includes("Montrambert"), "HTML sans ancienne adresse");
assert(!html.includes("Indivisaire"), "HTML sans cases indivisaires");
assert(!html.includes("INDIVISION COUBLE — Article 815"), "HTML sans bandeau rouge indivision");
assert(html.includes("signature-unique"), "HTML signature unique");
assert(html.includes("CONTRAT-2026-BRUNEL-FINAL"), "HTML numéro bon pour accord");
assert(html.includes("~63,50"), "HTML mensualité Éco-PTZ");
assert(html.includes("1 200,00"), "HTML RAC MAR");
assert(html.includes("11 924,41"), "HTML PAC Daikin HT");
assert(html.includes("1 458,80"), "HTML combles 35 m²");
assert(html.includes("1 800,00"), "HTML 2 menuiseries");
assert(html.includes("4 800,00"), "HTML baie et IPN");
assert(html.includes("2 100,00"), "HTML porte Ud 1,3");
assert(html.includes("1 650,00"), "HTML VMC");
assert(html.includes("5 200,00"), "HTML direction CG");
assert(html.includes("35 m²") || html.includes("35 m&sup2;"), "HTML 35 m²");
assert(html.includes("18/09/2026"), "HTML date devis façade");
assert(html.includes("JAUNE 60 %"), "HTML profil jaune");
assert(!htmlSansLogo.includes("VIOLET"), "HTML sans profil violet");
assert(html.includes("HORS SUBVENTION"), "HTML lot 2 encadré");
assert(html.includes("980,00"), "HTML porte garage HT");
assert(html.includes("1 078,00"), "HTML porte garage TTC");
assert(html.includes("TVA 10,0 %") || html.includes("10,0 %"), "HTML TVA 10 % lot 2");
assert(html.includes("Aide ANAH JAUNE 60 %"), "HTML aide ANAH jaune");
assert(html.includes("Pilotage") || html.includes("pilotage"), "HTML poste 8 Pilotage");
assert(html.includes("article 815"), "HTML article 815 avis Julia");
assert(html.includes("Bon pour accord"), "HTML signature");
assert(html.includes("Clause Julia"), "HTML Julia");
assert(html.includes(TITRE_ANNEXE_VISUELLE_FACADE), "HTML annexe visuelle façade");
assert(html.includes("max-width: 850px"), "CSS façade max-width 850px");
assert(html.includes("border-radius: 12px"), "CSS façade radius 12px");
assert(html.includes(LEGENDE_FACADE_BRUNEL), "HTML légende contractuelle façade");
assert(html.includes("Déclaration Préalable"), "HTML DP Mairie de Bussières");
assert(html.includes("/images/brunel/facade-brunel.jpg") || html.includes("data:image/jpeg;base64,"), "image façade");
assert(html.includes("FABIEN"), "HTML Fabien");
assert(html.includes("Courtier en travaux"), "HTML rôle Fabien");
assert(
  CONTACTS_BRUNEL_FINAL[1].detail.includes("Financements travaux, prêts de 6 000 € à 75 000 € et regroupement de crédits"),
  "Fabien : prêts travaux / regroupement",
);
assert(!/Éco-PTZ/i.test(CONTACTS_BRUNEL_FINAL[1].detail), "ligne Fabien sans Éco-PTZ");
assert(html.includes("06 71 19 96 45 — Financements travaux, prêts de 6 000 € à 75 000 € et regroupement de crédits"), "HTML rôle Fabien exact");
assert(
  html.includes("Financement Éco-PTZ à 0 % sur 20 ans possible (mensualité estimée : ~63,50 € / mois à taux zéro sans apport)"),
  "HTML Éco-PTZ 63,50 €",
);
assert(!html.includes("via FABIEN"), "Éco-PTZ plus attribué à Fabien");
assert(!html.includes("Éco-PTZ et prêts travaux"), "plus d’Éco-PTZ sur la ligne Fabien");
assert(!/catarina/i.test(htmlSansLogo), "HTML sans Catarina");
assert(!/architecte/i.test(htmlSansLogo), "HTML sans architecte");
assert(!/iad France/i.test(htmlSansLogo), "HTML sans iad");
assert(html.includes("Opérateur MAR"), "HTML Opérateur MAR");
assert(html.includes("Mon Accompagnateur Rénov"), "HTML MAR agréé national");
assert(html.includes("Clyve"), "HTML Clyve contact");
assert(html.includes("break-inside: avoid"), "CSS print avoid");
assert(html.includes('class="print-cinq-pages"'), "HTML classe impression 5 pages");
assert(html.includes("print-page-1") && html.includes("print-page-2") && html.includes("print-page-3") && html.includes("print-page-4") && html.includes("print-page-5"), "HTML 5 blocs d'impression");
assert(html.includes("margin: 10mm 12mm"), "CSS @page 10mm 12mm");
assert(html.includes("print-color-adjust: exact !important"), "CSS couleurs d'impression forcées");
assert(html.includes("page-break-after: always"), "CSS sauts de page forcés");
assert(html.includes(".print-cinq-pages .cgv-page") && html.includes("page-break-before: auto !important"), "CGV sans page supplémentaire Brunel");
assert(!htmlSansLogo.includes("DAMIEN"), "HTML sans Damien");
assert(!/damien\.srdconseil/i.test(htmlSansLogo), "HTML sans email Damien");
assert(!htmlSansLogo.includes("Léo-Energy"), "HTML sans Léo-Energy");
assert(!html.includes("1 100,00 € HT Clyve") && !html.includes("Clyve</td>"), "Clyve non facturé au client");
assert(html.includes("à titre indicatif"), "disclaimer aides");
assert(html.includes("Menuiseries PVC entrée (2 unités)"), "HTML 2 menuiseries PVC");
assert(!html.includes("2 Fenêtres PVC 1×1,47 m"), "plus de 2 fenêtres PVC 1×1,47 m");
assert(!html.includes("1 Fenêtre PVC 1×1,3 m + volet roulant solaire"), "plus de poste fenêtre 1×1,3 m");
assert(!html.includes("4 Fenêtres alu"), "plus des 4 fenêtres alu génériques");

const racine = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const fichier = join(racine, "data/sauvegardes/devis-brunel-v3-officiel.json");
assert(existsSync(fichier), `sauvegarde absente : ${fichier}`);
const disque = JSON.parse(readFileSync(fichier, "utf8"));
assert(disque.dossierId === BRUNEL_DOSSIER_ID, "fichier id");
assert(disque.edition?.travaux?.length === 8, "fichier 8 postes");
assert(disque.tunnel?.totaux?.totalTtc === 37708.24, "fichier TTC");
assert(disque.tunnel?.aides?.totalAides === 29420, "fichier aides");
assert(disque.tunnel?.resteACharge === 8288.24, "fichier RAC");
assert(JSON.stringify(disque).includes("42510"), "fichier Bussières");
assert(JSON.stringify(disque).includes("Indivision COUBLE"), "fichier indivision");
assert(!JSON.stringify(disque).includes("Léo-Energy"), "fichier sans Léo-Energy");
assert(JSON.stringify(disque).includes("v3-poste-3-ensemble-baie"), "fichier id poste 3 baie");
assert(JSON.stringify(disque).includes(DEVIS_FACADE_NUMERO), "fichier n° façade");

const htmlRacine = join(racine, FICHIER_DEVIS_BRUNEL_FINAL);
const htmlPublic = join(racine, "public", FICHIER_DEVIS_BRUNEL_FINAL);
assert(existsSync(htmlRacine), `HTML racine absent : ${htmlRacine}`);
assert(existsSync(htmlPublic), `HTML public absent : ${htmlPublic}`);
assert(readFileSync(htmlRacine, "utf8").includes("33 478,53"), "HTML racine TTC");
assert(readFileSync(htmlRacine, "utf8").includes("data:image/png;base64,"), "HTML racine logo Base64");
assert(readFileSync(htmlRacine, "utf8").includes("data:image/jpeg;base64,"), "HTML racine façade Base64");
assert(readFileSync(htmlRacine, "utf8").includes(TITRE_ANNEXE_VISUELLE_FACADE), "HTML racine annexe visuelle");
assert(readFileSync(htmlPublic, "utf8").includes(BRUNEL_FINAL_NUMERO), "HTML public numéro");
assert(readFileSync(htmlRacine, "utf8").includes(BRUNEL_CONTRAT_TITRE), "HTML racine titre");
assert(readFileSync(htmlRacine, "utf8").includes('class="print-cinq-pages"'), "HTML racine 5 pages");
assert(readFileSync(htmlRacine, "utf8").includes("margin: 10mm 12mm"), "HTML racine marges A4");
assert(
  readFileSync(htmlRacine, "utf8").includes("~63,50 € / mois à taux zéro sans apport"),
  "HTML racine Éco-PTZ 63,50 €",
);
assert(
  !readFileSync(htmlRacine, "utf8").includes("via FABIEN"),
  "HTML racine sans Éco-PTZ via Fabien",
);
assert(!readFileSync(htmlPublic, "utf8").replace(/src="data:image\/[^;]+;base64,[^"]+"/g, "").includes("AMO"), "HTML public sans AMO");

console.log(
  "OK — contrat Brunel Contractant Général : 31 733,21 HT / 33 478,53 TTC | 35 m² | 2 menuiseries | baie IPN 4 800 HT | ANAH jaune 19 039,93.",
);
