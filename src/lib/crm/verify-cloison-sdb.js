/**
 * Contrôles dossier Cloison / Faux-plafond SDB + CA prévisionnel opérationnel.
 * Exécution : npx tsx src/lib/crm/verify-cloison-sdb.js
 */

import {
  CLIENT_CLOISON_SDB,
  CLOISON_SDB_CONTRAT_NUMERO,
  CLOISON_SDB_DOSSIER_ID,
  CLOISON_SDB_REFERENCE,
  FINANCEMENT_CLOISON_SDB,
  LOTS_CLOISON_SDB,
  POSTES_CLOISON_SDB_CONTRAT,
  PROJET_CLOISON_SDB_DEFAUT,
  STATUT_CLOISON_SDB,
  TOTAUX_CLOISON_SDB,
} from "./cloisonSdbOfficiel.js";
import {
  PROJET_BRUNEL_DEFAUT,
  projetManuelVersAudit,
  sanitiserProjetPourRole,
  fusionnerAvecDefautBrunel,
} from "./projetsManuels.js";
import { PROJET_PEREIRA_NERVIEUX_DEFAUT } from "./pereiraNervieuxOfficiel.js";
import { PROJET_GILBERTAS_DEFAUT } from "./gilbertasClermontOfficiel.js";
import { PROJET_MASSARDIER_DEFAUT } from "./massardierLeadOfficiel.js";
import { PROJET_DAMIEN_PV_100KWC_DEFAUT } from "./damienPv100kwcOfficiel.js";
import { PROJET_GESNOUIN_DEFAUT } from "./gesnouinBatterieOfficiel.js";
import {
  CA_PREVISIONNEL_OPERATIONNEL_TTC,
  calculerCaPrevisionnelOperationnel,
} from "./pipelineOperationnel.ts";
import { ROLE_ADMIN, ROLE_COMMERCIAL } from "./roles.js";
import { sanitiserProjetPourVueHub, VUE_HUB_AMO, VUE_HUB_SUPER_ADMIN } from "./operationnelCrm.js";
import { htmlContratPourDossier, nomFichierContrat } from "./htmlContratCrm.js";
import { payloadContratCloisonSdbOfficiel } from "./payloadContratCrm.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

assert(PROJET_CLOISON_SDB_DEFAUT.id === CLOISON_SDB_DOSSIER_ID, "id dossier");
assert(PROJET_CLOISON_SDB_DEFAUT.reference === CLOISON_SDB_REFERENCE, "référence");
assert(PROJET_CLOISON_SDB_DEFAUT.statut === STATUT_CLOISON_SDB, "statut");
assert(LOTS_CLOISON_SDB.length === 4, "4 lots");
assert(
  LOTS_CLOISON_SDB.reduce((s, lot) => s + lot.totalHt, 0) === 2470,
  "somme lots HT 2 470",
);
assert(TOTAUX_CLOISON_SDB.totalHt === 2470, "HT 2 470");
assert(TOTAUX_CLOISON_SDB.totalTva === 247, "TVA 247");
assert(TOTAUX_CLOISON_SDB.totalTtc === 2717, "TTC 2 717");
assert(TOTAUX_CLOISON_SDB.coutsTravauxHt === 1700, "sous-traitance 1 700");
assert(TOTAUX_CLOISON_SDB.commissionDamienHt === 247, "commission 10 %");
assert(TOTAUX_CLOISON_SDB.margeNetteEnergiaHt === 523, "marge nette 523");
assert(
  Math.round((523 / 2470) * 1000) / 10 === 21.2,
  "taux marge nette 21,2 %",
);
assert(!LOTS_CLOISON_SDB.some((lot) => /raccords sols/i.test(lot.nom)), "lot raccords sols retiré");
assert(
  !POSTES_CLOISON_SDB_CONTRAT.some((p) => /raccords sols/i.test(p.nom)),
  "poste raccords sols retiré",
);

const audit = projetManuelVersAudit(PROJET_CLOISON_SDB_DEFAUT);
assert(audit.caTtc === 2717, "CA TTC audit");
assert(audit.caHt === 2470, "CA HT audit");
assert(audit.commissionDamienHt === 247, "commission audit");
assert(audit.margeNetteEnergiaHt === 523, "marge audit");
assert(audit.travaux.length === 4, "4 travaux");
assert(audit.equipe?.coordination?.includes("ENERGIA CONSEIL IA"), "équipe coordination ENERGIA");
assert(!String(audit.equipe?.coordination || "").includes("Mohamed"), "équipe sans Mohamed");
assert(audit.sourceLead === "Éco Technicien BtoC", "source Éco Technicien");

const fusion = fusionnerAvecDefautBrunel([]);
assert(fusion.some((item) => item.id === CLOISON_SDB_DOSSIER_ID), "fusion seed cloison");

const ca = calculerCaPrevisionnelOperationnel([
  projetManuelVersAudit(PROJET_PEREIRA_NERVIEUX_DEFAUT),
  projetManuelVersAudit(PROJET_BRUNEL_DEFAUT),
  projetManuelVersAudit(PROJET_GILBERTAS_DEFAUT),
  projetManuelVersAudit(PROJET_MASSARDIER_DEFAUT),
  audit,
  projetManuelVersAudit(PROJET_DAMIEN_PV_100KWC_DEFAUT),
  projetManuelVersAudit(PROJET_GESNOUIN_DEFAUT),
]);
assert(ca === 234064, `CA prévisionnel ${ca} ≠ 237 971`);
assert(CA_PREVISIONNEL_OPERATIONNEL_TTC === 234064, "constante CA 237 971");

const admin = sanitiserProjetPourRole(audit, ROLE_ADMIN);
assert(admin.margeNetteEnergiaHt === 523, "admin voit marge nette");

const commercial = sanitiserProjetPourRole(audit, ROLE_COMMERCIAL);
assert(commercial.margeNetteEnergiaHt == null, "commercial sans marge nette");

const amo = sanitiserProjetPourVueHub(sanitiserProjetPourRole(audit, ROLE_ADMIN), VUE_HUB_AMO);
assert(amo.margeNetteEnergiaHt == null, "AMO sans marge nette");
assert(amo.commissionDamienHt == null, "AMO sans commission");
assert(amo.caTtc === 2717, "AMO conserve TTC");

const superAdmin = sanitiserProjetPourVueHub(admin, VUE_HUB_SUPER_ADMIN);
assert(superAdmin.margeNetteEnergiaHt === 523, "Super-Admin conserve marges");

assert(POSTES_CLOISON_SDB_CONTRAT.length === 4, "4 postes contrat");
assert(FINANCEMENT_CLOISON_SDB.acompte === 815.1, "acompte 30 %");
assert(FINANCEMENT_CLOISON_SDB.intermediaire === 1086.8, "acompte 40 %");
assert(FINANCEMENT_CLOISON_SDB.solde === 815.1, "solde 30 %");
assert(CLIENT_CLOISON_SDB.libelleSignature === "Monsieur et Madame Georges GOURDON", "signature client");
assert(CLIENT_CLOISON_SDB.telephone === "07 69 44 85 98", "téléphone GOURDON");
assert(
  CLIENT_CLOISON_SDB.adresse.includes("512 Route de Saint-Laurent-les-Bains"),
  "adresse Chambonas",
);

const payload = payloadContratCloisonSdbOfficiel();
assert(payload.numero === CLOISON_SDB_CONTRAT_NUMERO, "n° contrat");
assert(payload.totaux.totalTtc === 2717, "payload TTC");
assert(payload.echeancier.acompte === 815.1, "payload acompte");
assert(payload.inclureCommissionDamien === false, "encart commission absent");
assert(payload.signatureHtml.includes("Monsieur et Madame Georges GOURDON"), "payload signature");
assert(!payload.signatureHtml.includes("Réaménagement Cloison"), "signature ≠ intitulé");
assert(!payload.planning.some((p) => /raccords sols/i.test(p.phase)), "planning sans lot 5");

const html = htmlContratPourDossier({}, { id: CLOISON_SDB_DOSSIER_ID });
assert(html.includes("2 717,00"), "HTML TTC 2 717");
assert(html.includes("2 470,00"), "HTML HT 2 470");
assert(html.includes("247,00"), "HTML TVA 247");
assert(html.includes("815,10"), "HTML échéancier 30 %");
assert(html.includes("1 086,80"), "HTML échéancier 40 %");
assert(html.includes("Nouvelle cloison Placostil 72/48"), "HTML lot 2");
assert(!html.includes("Raccords sols et finitions périphériques"), "HTML sans lot 5");
assert(!html.includes("Encart contractuel"), "HTML sans encart rémunération");
assert(!/Damien RICHARD/i.test(html), "HTML sans Damien RICHARD");
assert(!/damien\.srdconseil@gmail\.com/i.test(html), "HTML sans email Damien");
assert(!/apporteur/i.test(html), "HTML sans le terme apporteur");
assert(html.includes("Direction & Portage Contractant Général : ENERGIA CONSEIL IA"), "HTML portage ENERGIA");
assert(!html.includes("Mohamed BENAOUDA") && !html.includes("6 34 17 09 47"), "HTML sans Mohamed");
assert(!/prix\s+ferme/i.test(html) && !/march[ée]\s+ferme/i.test(html), "HTML sans prix/marché ferme");
assert(html.includes("Montant total TTC : 2 717,00 € TTC"), "HTML montant total TTC");
assert(html.includes('class="brand"') && html.includes("ENERGIA-CONSEIL IA®"), "HTML en-tête brand institutionnel");
assert(html.includes('class="brand-lockup"') && html.includes('class="logo"'), "HTML logo officiel 2 colonnes");
assert(html.includes("data:image/png;base64,") || html.includes("/logo.png") || html.includes("logo-energia"), "HTML logo visuel");
assert(html.includes("LUNPIB2604975"), "HTML décennale");
assert(html.includes("Assurance Décennale Calipso Assurances"), "HTML décennale Calipso en en-tête");
assert(html.includes("peinture velours"), "HTML peinture velours");
assert(html.includes("Monsieur et Madame Georges GOURDON"), "HTML signature GOURDON");
assert(html.includes("07 69 44 85 98"), "HTML téléphone");
assert(html.includes("512 Route de Saint-Laurent-les-Bains"), "HTML adresse");
assert(!html.includes("[Nom du Client]"), "HTML sans placeholder nom");
assert(!html.includes("Adresse du chantier à préciser"), "HTML sans placeholder adresse");
assert(!html.includes("Je soussigné(e), <strong>Réaménagement Cloison"), "HTML sans intitulé en signature");
assert(html.includes('src="./photo1.jpg"'), "HTML photo1");
assert(html.includes('src="./photo2.jpg"'), "HTML photo2");
assert(html.includes('src="./photo3.jpg"'), "HTML photo3");
assert(html.includes('src="./PHOTO-2026-10-04-18-09-52.jpg"'), "HTML photo4");
assert(
  nomFichierContrat({ id: CLOISON_SDB_DOSSIER_ID }) === "CONTRAT_CLOISON_SDB_FAUX_PLAFOND_2026_FINAL.html",
  "nom fichier contrat",
);

console.log("OK — Cloison SDB GOURDON : 2 717 TTC, CA 237 971, contrat CG 4 lots, sans encart commercial, masquage AMO.");
