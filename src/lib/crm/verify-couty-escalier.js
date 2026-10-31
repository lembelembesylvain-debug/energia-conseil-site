/**
 * Contrôles dossier Madame Marie-France COUTY — Mably.
 * 1 350 HT / 1 485 TTC · commission Damien 135 HT · marge ENERGIA 715 HT.
 * Exécution : npx tsx src/lib/crm/verify-couty-escalier.js
 */

import {
  COUTY_ESCALIER_CLIENT_ID,
  COUTY_ESCALIER_DOSSIER_ID,
  COUTY_ESCALIER_REFERENCE,
  FINANCEMENT_COUTY,
  POSTES_COUTY_DEVIS,
  PROJET_COUTY_ESCALIER_DEFAUT,
  STATUT_COUTY_ESCALIER,
  TOTAUX_COUTY,
} from "./coutyEscalierOfficiel.js";
import { fusionnerAvecDefautBrunel, projetManuelVersAudit } from "./projetsManuels.js";
import { cheminContratPublic, htmlContratPourDossier, nomFichierContrat } from "./htmlContratCrm.js";
import { payloadContratCoutyEscalierOfficiel } from "./payloadContratCrm.js";
import { projetManuelVersLeadCourtier, projetManuelVersLigneCrm } from "./crmSupabaseSync.js";
import { calculerCommissionOfficielle } from "./commissionPareto.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(TOTAUX_COUTY.totalHt === 1350, "HT");
assert(TOTAUX_COUTY.totalTva === 135, "TVA 10 %");
assert(TOTAUX_COUTY.totalTtc === 1485, "TTC");
assert(TOTAUX_COUTY.coutsTravauxHt + TOTAUX_COUTY.commissionDamienHt + TOTAUX_COUTY.margeNetteEnergiaHt === 1350, "débours + commission + marge");
assert(TOTAUX_COUTY.commissionDamienHt === 135, "commission 10 %");
assert(TOTAUX_COUTY.margeNetteEnergiaHt === 715, "marge nette");
assert(Math.round(TOTAUX_COUTY.totalTtc * 0.25 * 100) / 100 === 371.25, "crédit 25 %");
assert(TOTAUX_COUTY.resteAChargeNetTtc === 1113.75, "RAC net");
assert(FINANCEMENT_COUTY.acompte === 445.5, "acompte 30 %");
assert(FINANCEMENT_COUTY.intermediaire === 0, "pas de jalon 40 %");
assert(FINANCEMENT_COUTY.solde === 1039.5, "solde 70 %");
assert(Math.round((FINANCEMENT_COUTY.acompte + FINANCEMENT_COUTY.solde) * 100) / 100 === 1485, "échéancier 30/70");
assert(POSTES_COUTY_DEVIS.reduce((s, p) => s + p.totalHt, 0) === 1350, "poste HT");

assert(PROJET_COUTY_ESCALIER_DEFAUT.id === COUTY_ESCALIER_DOSSIER_ID, "id");
assert(PROJET_COUTY_ESCALIER_DEFAUT.clientId === COUTY_ESCALIER_CLIENT_ID, "clientId");
assert(PROJET_COUTY_ESCALIER_DEFAUT.statut === STATUT_COUTY_ESCALIER, "statut");
assert(PROJET_COUTY_ESCALIER_DEFAUT.email === "Couty.marie-france@orange.fr", "email");
assert(PROJET_COUTY_ESCALIER_DEFAUT.telephone === "07 66 01 07 52", "téléphone");
assert(PROJET_COUTY_ESCALIER_DEFAUT.adresse.includes("23 Rue du Fort Troyon"), "adresse");
assert(PROJET_COUTY_ESCALIER_DEFAUT.codePostal === "42300", "CP");
assert(PROJET_COUTY_ESCALIER_DEFAUT.apporteurId === "damien", "apporteur Damien");

const fusion = fusionnerAvecDefautBrunel([]);
assert(fusion.some((item) => item.id === COUTY_ESCALIER_DOSSIER_ID), "fusion seed Couty");

const audit = projetManuelVersAudit(PROJET_COUTY_ESCALIER_DEFAUT);
assert(audit.caHt === 1350, "audit HT");
assert(audit.caTtc === 1485, "audit TTC");
assert(audit.commissionDamienHt === 135, "audit commission");
assert(audit.margeNetteEnergiaHt === 715, "audit marge");
assert(audit.coutArtisanHt === 500, "audit débours");
assert(audit.auditId === COUTY_ESCALIER_REFERENCE, "référence");
assert(audit.horsAidesPubliques === true, "hors MPR");
assert(audit.nom.includes("COUTY"), "nom cliente");

const commission = calculerCommissionOfficielle(audit);
assert(commission?.regle === "b2c" && commission.partApporteurHt === 135, "règle B2C 10 %");

const ligne = projetManuelVersLigneCrm(PROJET_COUTY_ESCALIER_DEFAUT);
assert(ligne.client_nom.includes("COUTY"), "ligne CRM");
assert(ligne.montant_ttc === 1485, "ligne TTC");
assert(ligne.commission_ht === 135, "ligne commission");
assert(ligne.marge_nette_ht === 715, "ligne marge");
assert(ligne.email === "Couty.marie-france@orange.fr", "ligne email");

const lead = projetManuelVersLeadCourtier(PROJET_COUTY_ESCALIER_DEFAUT);
assert(lead && lead.telephone === "07 66 01 07 52", "lead téléphone");
assert(lead.prenom === "Marie-France", "lead prénom");
assert(/COUTY/.test(lead.nom), "lead nom");

const payload = payloadContratCoutyEscalierOfficiel();
assert(payload.totaux.totalTtc === 1485, "payload TTC");
assert(payload.aidesLignes.some((l) => String(l.montant).includes("1 113,75")), "payload RAC net");
const html = htmlContratPourDossier({}, { id: COUTY_ESCALIER_DOSSIER_ID });
assert(/COUTY/.test(html), "HTML cliente");
assert(/1[\s\u202f\u00a0]?485/.test(html), "HTML TTC");
assert(/1[\s\u202f\u00a0]?113,75/.test(html), "HTML RAC");
assert(/à titre indicatif/i.test(html), "disclaimer aides");
assert(/Clause Julia/i.test(html), "Clause Julia");
assert(!html.includes("715,00") && !html.includes("715.00"), "marge interne absente du devis client");
assert(!html.includes("500,00"), "débours interne absent du contrat client");
assert(!/apporteur/i.test(html), "mot apporteur absent du contrat client");
assert(!/Damien RICHARD/i.test(html), "identité apporteur absente du contrat client");
assert(!/encart contractuel/i.test(html), "encart commission absent");
assert(!html.includes("Périmètre et Barème"), "articles commission absents");
assert(!html.includes("594"), "ancien jalon 40 % absent");
assert(!html.includes("30 / 40 / 30"), "échéancier 30/40/30 absent");
assert(html.includes("445,50"), "acompte 445,50");
assert(html.includes("1 039,50"), "solde 1 039,50");
assert(html.includes("LUNPIB2604975"), "décennale Calipso");
assert(html.includes("Annexe Photographique — Repérage technique"), "titre annexe");
assert(html.includes("état des lieux avant travaux"), "sous-titre annexe");
assert(html.includes("./couty-escalier/01-volee-droite.jpg"), "photo 1");
assert(html.includes("./couty-escalier/02-vue-plongeante.jpg"), "photo 2");
assert(html.includes("./couty-escalier/03-quart-tournant.jpg"), "photo 3");
assert(html.includes("./couty-escalier/04-palier-bas.jpg"), "photo 4");
assert(html.includes("mur nu"), "mur nu sans rampe");
assert(html.includes("EC-2026-SO-MAIN-COURANTE-01"), "référence contrat");
assert(html.includes("13 octobre 2026"), "date");
assert(html.includes("Validité : 3 mois"), "validité 3 mois");
assert(html.includes("Lot 1"), "lot 1");
assert(html.includes("Lot 2"), "lot 2");
assert(html.includes("Lot 3"), "lot 3");
assert(html.includes("chêne massif verni"), "chêne");
assert(html.includes("interrupteur bas"), "contournement interrupteur");
assert(html.includes("Inclus"), "lots inclus au forfait");
assert(!/damien/i.test(html), "aucune mention Damien sur le contrat client");
assert(!/commission/i.test(html.replace(/<style[\s\S]*?<\/style>/gi, "")), "aucune commission visible");
assert(nomFichierContrat({ id: COUTY_ESCALIER_DOSSIER_ID }) === "CONTRAT_COUTY_ESCALIER_MABLY_2026.html", "nom fichier");
assert(cheminContratPublic(COUTY_ESCALIER_DOSSIER_ID) === "/CONTRAT_COUTY_ESCALIER_MABLY_2026.html", "chemin public");

console.log(
  `OK — Couty ${COUTY_ESCALIER_REFERENCE} : 1 350 HT / 1 485 TTC, commission 135 HT, marge 715 HT, RAC net indicatif 1 113,75 TTC.`,
);
