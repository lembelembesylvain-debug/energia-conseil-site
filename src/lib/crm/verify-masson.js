/**
 * Contrôles dossier Kristell MASSON — 3 150 HT / 3 465 TTC — TVA 10 % — 30/70.
 * Sous-traitance BMI 2 450 HT — marge CG 700 HT.
 * Exécution : npx tsx src/lib/crm/verify-masson.js
 */

import {
  BDC_MASSON_REFERENCE,
  CLIENT_MASSON,
  FINANCEMENT_MASSON,
  MASSON_DATE_VALIDITE,
  MASSON_DOSSIER_ID,
  MASSON_REFERENCE,
  POSTES_MASSON_DEVIS,
  PROJET_MASSON_DEFAUT,
  SAISIE_JSON_MASSON,
  TOTAUX_MASSON,
} from "./massonToulonOfficiel.js";
import { fusionnerAvecDefautBrunel, projetManuelVersAudit } from "./projetsManuels.js";
import { htmlContratPourDossier, nomFichierContrat } from "./htmlContratCrm.js";
import { payloadContratMassonOfficiel } from "./payloadContratCrm.js";
import { projetManuelVersLigneCrm } from "./crmSupabaseSync.js";
import { saisieFactureMasson } from "../../components/crm/FactureAcompteModal.tsx";
import { htmlBonDeCommandeMasson } from "./bdcMassonToulon.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const htPostes = POSTES_MASSON_DEVIS.reduce((s, p) => s + p.totalHt, 0);
const tvaPostes = POSTES_MASSON_DEVIS.reduce((s, p) => s + p.totalTva, 0);
const ttcPostes = Math.round(POSTES_MASSON_DEVIS.reduce((s, p) => s + p.totalTtc, 0) * 100) / 100;
assert(htPostes === 3150, `somme postes HT ${htPostes}`);
assert(tvaPostes === 315, `somme TVA ${tvaPostes}`);
assert(ttcPostes === 3465, `somme TTC ${ttcPostes}`);
assert(POSTES_MASSON_DEVIS[2].totalHt === 320, "fumisterie 320");
assert(TOTAUX_MASSON.totalHt === 3150, "totalHt");
assert(TOTAUX_MASSON.totalTva === 315, "totalTva");
assert(TOTAUX_MASSON.totalTtc === 3465, "totalTtc");
assert(TOTAUX_MASSON.tauxTva === 0.1, "taux 10 %");
assert(TOTAUX_MASSON.coutsTravauxHt === 2450, "sous-traitance 2 450");
assert(TOTAUX_MASSON.margeNetteEnergiaHt === 700, "marge 700");
assert(TOTAUX_MASSON.totalHt - TOTAUX_MASSON.coutsTravauxHt === 700, "marge = vente − ST");
assert(FINANCEMENT_MASSON.acompte === 1039.5, "acompte 1 039,50");
assert(FINANCEMENT_MASSON.solde === 2425.5, "solde 2 425,50");
assert(FINANCEMENT_MASSON.intermediaire === 0, "pas de jalon 40 %");
assert(Math.round((FINANCEMENT_MASSON.acompte + FINANCEMENT_MASSON.solde) * 100) === 346500, "30+70");
assert(PROJET_MASSON_DEFAUT.email === "kristem@hotmail.fr", "email");
assert(PROJET_MASSON_DEFAUT.telephone === CLIENT_MASSON.telephone, "tel");
assert(PROJET_MASSON_DEFAUT.dateValidite === MASSON_DATE_VALIDITE, "validité");
assert(PROJET_MASSON_DEFAUT.horsAidesPubliques === true, "hors aides");
assert(SAISIE_JSON_MASSON.statut === "DEVIS_ENVOYE", "statut json");
assert(SAISIE_JSON_MASSON.coordination_travaux === "MOHAMED_BENAOUDA", "coordination");
assert(SAISIE_JSON_MASSON.finances.montant_ttc === 3465, "json ttc");
assert(SAISIE_JSON_MASSON.sous_traitance.montant_ht === 2450, "json ST");
assert(SAISIE_JSON_MASSON.sous_traitance.bon_de_commande.reference === BDC_MASSON_REFERENCE, "json BDC");
assert(SAISIE_JSON_MASSON.sous_traitance.acompte_30 === 735, "json acompte ST");
assert(SAISIE_JSON_MASSON.sous_traitance.solde_70 === 1715, "json solde ST");
assert(SAISIE_JSON_MASSON.sous_traitance.tva === 0, "json TVA ST");
assert(SAISIE_JSON_MASSON.marge_nette_ht === 700, "json marge");
assert(SAISIE_JSON_MASSON.photos.length === 3, "json 3 photos");

const fusion = fusionnerAvecDefautBrunel([]);
assert(fusion.some((item) => item.id === MASSON_DOSSIER_ID), "fusion seed Masson");

const audit = projetManuelVersAudit(PROJET_MASSON_DEFAUT);
assert(audit.caHt === 3150, "audit HT");
assert(audit.caTtc === 3465, "audit TTC");
assert(audit.auditId === MASSON_REFERENCE, "réf devis");
assert(audit.echeancier?.acompte === 1039.5, "échéancier acompte");
assert(audit.echeancier?.solde === 2425.5, "échéancier solde");
assert(audit.margeNetteEnergiaHt === 700, "audit marge 700");
assert(audit.coutArtisanHt === 2450, "audit ST 2 450");
assert(audit.travaux.length === 6, "6 postes");
assert(audit.equipe?.coordination === "Mohamed BENAOUDA", "équipe Mohamed");

const ligne = projetManuelVersLigneCrm(PROJET_MASSON_DEFAUT);
assert(ligne.reference === MASSON_REFERENCE, "supabase réf");
assert(ligne.montant_ht === 3150, "supabase HT");
assert(ligne.montant_ttc === 3465, "supabase TTC");
assert(ligne.marge_nette_ht === 700, "supabase marge");
assert(ligne.email === "kristem@hotmail.fr", "supabase email");
assert(ligne.ville === "Toulon", "supabase ville");

const payload = payloadContratMassonOfficiel();
assert(payload.totaux.totalTtc === 3465, "payload TTC");
assert(payload.echeancier.acompte === 1039.5, "payload acompte");
assert(payload.echeancier.solde === 2425.5, "payload solde");
assert(!payload.totaux.margeNetteEnergiaHt, "payload client sans marge interne");
assert(!payload.signatureHtml.includes("40 %"), "signature sans jalon 40 %");
assert(payload.cgvArticles[2].includes("30 / 70"), "CGV 30/70");
assert(payload.cgvArticles[17].includes("15 jours"), "CGV validité 15 jours");
assert(payload.contacts.some((c) => c.nom.includes("Julia")), "contact Julia");
assert(payload.contacts.some((c) => c.nom.includes("Mohamed")), "contact Mohamed");
assert(payload.contacts.some((c) => c.nom.includes("FABIEN")), "contact Fabien");
assert(payload.contacts.some((c) => c.nom.includes("Sylvain")), "contact Sylvain");
assert(payload.contacts.some((c) => /DAMIEN/i.test(c.nom)), "contact Damien");
assert(payload.contacts.some((c) => c.nom.includes("BARATIER")), "contact MAR");

const html = htmlContratPourDossier({}, { id: MASSON_DOSSIER_ID });
assert(html.includes("3 465,00"), "HTML TTC");
assert(html.includes("3 150,00"), "HTML HT");
assert(html.includes("1 039,50"), "HTML acompte");
assert(html.includes("2 425,50"), "HTML solde");
assert(html.includes("1 980,00"), "HTML chaudière");
assert(html.includes("2 178,00"), "HTML chaudière TTC");
assert(html.includes("420,00"), "HTML fumisterie");
assert(html.includes("462,00"), "HTML fumisterie TTC");
assert(!/Mâcon|Macon|900 km|péage|télépéage|déplacement|trajet/i.test(html), "HTML sans logistique");
assert(html.includes("photo_facade_chaudiere.jpg"), "HTML photo 1");
assert(html.includes("photo_plaque_technique.jpg"), "HTML photo 2");
assert(html.includes("PHOTO3.jpg"), "HTML photo 3");
assert(!html.includes("2 450,00"), "HTML client sans prix de sous-traitance");
assert(html.includes("MASSON"), "HTML client");
assert(html.includes("Themafast"), "HTML chaudière");
assert(html.includes("Validité du devis : 15 jours (Jusqu'au 06 novembre 2026)"), "HTML validité 15 jours");
assert(html.includes("Équipe technique agréée ENERGIA CONSEIL IA"), "HTML exécution interne");
assert(html.includes("Équipe technique ENERGIA CONSEIL IA"), "HTML planning");
assert(html.includes("FR76 1695 8000 0186 6836 4808 772"), "HTML IBAN");
assert(html.includes("QNTOFRP1XXX"), "HTML BIC");
assert(html.includes("fonds propres"), "HTML financement");
assert(html.includes("Sylvain LEMBELEMBE"), "HTML Sylvain");
assert(!html.includes("Clause Julia"), "HTML sans Julia");
assert(!/BMI|Mohamed|BENAOUDA|DAMIEN|Damien|FABIEN|Fabien|Baratier|ANAH|Anah|3 mois|ferme|sous-trait/i.test(html), "HTML client sans sous-traitant ni aides");
assert(!html.includes("30 / 40 / 30"), "HTML sans échéancier 30/40/30");
assert((html.match(/class="page"/g) || []).length === 3, "HTML 3 pages");
assert(html.includes("Annexe photographique — État des lieux avant travaux"), "HTML annexe");
assert(html.includes("max-height: 190px"), "HTML photos 190px");
assert(html.includes("page-break-inside: avoid"), "HTML anti-coupure");
assert(nomFichierContrat({ id: MASSON_DOSSIER_ID }) === "DEVIS_MASSON_TOULON_2026.html", "nom fichier");

const bdc = htmlBonDeCommandeMasson();
assert(bdc.includes(BDC_MASSON_REFERENCE), "BDC référence");
assert(bdc.includes("2 450,00"), "BDC forfait");
assert(bdc.includes("735,00"), "BDC acompte");
assert(bdc.includes("1 715,00"), "BDC solde");
assert(bdc.includes("283-2 nonies"), "BDC autoliquidation");
assert(bdc.includes("CRCD04-001151"), "BDC décennale");
assert(bdc.includes("Bon pour accord et acceptation de la commande"), "BDC signature");
assert(bdc.includes("kimo7125@hotmail.fr"), "BDC email");
assert(bdc.includes("FORFAIT CLÉ EN MAIN"), "BDC titre");
assert(bdc.includes("735,00"), "BDC acompte conditions");
assert(bdc.includes("non-contournement"), "BDC clause");
assert(bdc.includes("Total net à régler à l'artisan"), "BDC total artisan");
assert(bdc.includes("sous 48 h"), "BDC solde 48 h");
assert(!bdc.includes(">0,00"), "BDC sans ligne à zéro");
assert(!bdc.includes("3 465,00"), "BDC sans prix client");
assert(!html.includes(BDC_MASSON_REFERENCE), "devis client sans BDC");

const facture = saisieFactureMasson();
assert(facture.montantTtc === 3465, "facture TTC");
assert(facture.tauxTva === 10, "facture TVA 10");
assert(facture.pourcentageLibre === 30, "facture 30 %");
assert(facture.numero === "FA-2026-MASSON-01", "n° facture");

console.log(
  `OK — Masson ${MASSON_REFERENCE} : 3 150 HT / 3 465 TTC, ST 2 450, marge 700, validité ${MASSON_DATE_VALIDITE}.`,
);
