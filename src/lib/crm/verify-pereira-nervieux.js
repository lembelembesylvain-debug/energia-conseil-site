/**
 * Contrôles du contrat Pereira Nervieux SANS ITI (Violet, photos, HTML).
 * Exécution : node src/lib/crm/verify-pereira-nervieux.js
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AIDES_PEREIRA_VIOLET,
  CLIENT_PEREIRA_NERVIEUX,
  CONTACTS_PEREIRA_CONTRAT,
  FICHIER_DEVIS_PEREIRA_NERVIEUX,
  FICHIER_RAPPORT_PEREIRA_NERVIEUX,
  FICHIER_SAUVEGARDE_PEREIRA_NERVIEUX,
  FISCALITE_AVIS_PEREIRA,
  METRES_PEREIRA_NERVIEUX,
  PEREIRA_NERVIEUX_DOSSIER_ID,
  PEREIRA_NERVIEUX_NUMERO,
  PHOTOS_CONTRAT_PEREIRA,
  POSTES_PEREIRA_NERVIEUX,
  TOTAUX_PEREIRA_NERVIEUX,
  editionOfficiellePereiraNervieux,
  totauxContractuelsPereiraNervieux,
} from "./pereiraNervieuxOfficiel.js";
import { construireHtmlDevisPereiraNervieux } from "./devisPereiraNervieuxHtml.js";
import { construireHtmlRapportPereiraNervieux } from "./rapportPereiraNervieuxHtml.js";
import {
  appliquerVerrouillagePereiraNervieux,
  calculerAidesIndicatives,
  calculerFinancement,
  calculerFinancesInternes,
  lireEditionDossier,
  reinitialiserEditionTests,
} from "./editionDossier.js";
import {
  IDS_DOSSIERS_TEST_PROTEGES,
  fusionnerAvecDefautBrunel,
  projetManuelVersAudit,
} from "./projetsManuels.js";
import { BRUNEL_DOSSIER_ID } from "./brunelWorkingBase.js";
import { ROLE_ADMIN, ROLE_COMMERCIAL } from "./roles.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

assert(PEREIRA_NERVIEUX_DOSSIER_ID !== "demo-pereira", "id distinct du fixture Pereira");
assert(!IDS_DOSSIERS_TEST_PROTEGES.includes(PEREIRA_NERVIEUX_DOSSIER_ID), "pas un id protégé");
assert(PEREIRA_NERVIEUX_DOSSIER_ID !== BRUNEL_DOSSIER_ID, "distinct de Brunel");
assert(PEREIRA_NERVIEUX_NUMERO === "DEV-2026-PEREIRA-01", "réf DEV-2026-PEREIRA-01");

assert(CLIENT_PEREIRA_NERVIEUX.prenom === "David Emmanuel", "prénom");
assert(CLIENT_PEREIRA_NERVIEUX.nom === "PEREIRA", "nom");
assert(CLIENT_PEREIRA_NERVIEUX.adresse.includes("1 Route de Saint Germain Laval"), "adresse");
assert(CLIENT_PEREIRA_NERVIEUX.adresse.includes("42510"), "CP 42510");
assert(CLIENT_PEREIRA_NERVIEUX.adresse.includes("Nervieux"), "Nervieux");
assert(CLIENT_PEREIRA_NERVIEUX.surfaceHabitable === "164", "164 m²");
assert(CLIENT_PEREIRA_NERVIEUX.zoneClimatique === "H1c", "H1c");
assert(CLIENT_PEREIRA_NERVIEUX.altitudeM === 315, "altitude 315");
assert(CLIENT_PEREIRA_NERVIEUX.dpeActuel === "F", "DPE F");
assert(CLIENT_PEREIRA_NERVIEUX.dpeCible === "C", "cible C (3 classes)");
assert(CLIENT_PEREIRA_NERVIEUX.gainClasses === 3, "saut 3 classes");
assert(CLIENT_PEREIRA_NERVIEUX.factureAvantMin === 6860, "facture avant min");

assert(FISCALITE_AVIS_PEREIRA.rfr === 27522, "RFR avis 27 522");
assert(FISCALITE_AVIS_PEREIRA.parts === 1, "1 part");
assert(FISCALITE_AVIS_PEREIRA.profil === "violet", "profil Violet");
assert(FISCALITE_AVIS_PEREIRA.departement === "42", "département 42");
assert(FISCALITE_AVIS_PEREIRA.zone === "hors_idf", "hors IDF");

assert(METRES_PEREIRA_NERVIEUX.comblesM2 === 60, "combles 60 m²");
assert(METRES_PEREIRA_NERVIEUX.rampantsM2 === 0, "0 m² rampants");
assert(METRES_PEREIRA_NERVIEUX.rampantsExclusM2 === 70, "70 m² rampants exclus");
assert(METRES_PEREIRA_NERVIEUX.plancherM2 === 19, "plancher 19 m²");
assert(METRES_PEREIRA_NERVIEUX.menuiseriesM2 === 19.38, "menuiseries 19,38 m²");
assert(METRES_PEREIRA_NERVIEUX.fenetresNb === 7, "7 fenêtres");
assert(METRES_PEREIRA_NERVIEUX.fixesOpaquesNb === 3, "3 châssis fixes");
assert(METRES_PEREIRA_NERVIEUX.chassisTotal === 10, "10 châssis");
assert(METRES_PEREIRA_NERVIEUX.veluxNb === 0, "0 Velux");
assert(METRES_PEREIRA_NERVIEUX.veluxExclusNb === 3, "3 Velux exclus");
assert(METRES_PEREIRA_NERVIEUX.itiM2 === 0, "0 m² ITI");

assert(POSTES_PEREIRA_NERVIEUX.length === 8, "8 postes");
assert(POSTES_PEREIRA_NERVIEUX[0].quantite === 19.38, "poste 1 contractuel menuiseries");
assert(POSTES_PEREIRA_NERVIEUX[0].nom.includes("0 Velux"), "exclusion Velux");
assert(POSTES_PEREIRA_NERVIEUX[0].totalHt === 6557.14, "menuiseries 6 557,14 HT");
assert(POSTES_PEREIRA_NERVIEUX[1].quantite === 60, "poste 2 combles 60 m²");
assert(POSTES_PEREIRA_NERVIEUX[1].nom.includes("0 m² de rampant"), "exclusion rampants");
assert(POSTES_PEREIRA_NERVIEUX[2].quantite === 19, "poste 3 plancher 19 m²");
assert(POSTES_PEREIRA_NERVIEUX[3].nom.includes("simple flux"), "poste 4 VMC SF");
assert(POSTES_PEREIRA_NERVIEUX[4].nom.includes("air/eau"), "poste 5 PAC air/eau");
assert(POSTES_PEREIRA_NERVIEUX[4].nom.includes("chauffage seul"), "PAC chauffage seul");
assert(POSTES_PEREIRA_NERVIEUX[3].totalHt === 1160.9, "VMC 1 160,90 HT");
assert(POSTES_PEREIRA_NERVIEUX[4].totalHt === 9772.67, "PAC 9 772,67 HT");
assert(POSTES_PEREIRA_NERVIEUX[4].totalTtc === 10310.16, "PAC 10 310,16 TTC");
assert(!/multi-split/i.test(POSTES_PEREIRA_NERVIEUX[4].nom), "pas de multi-split");
assert(!/double service/i.test(POSTES_PEREIRA_NERVIEUX[4].nom), "pas de double service");
assert(POSTES_PEREIRA_NERVIEUX[5].nom.includes("250 L"), "poste 6 CET 250 L");
assert(POSTES_PEREIRA_NERVIEUX[5].totalHt === 2200, "CET 2 200 HT");
assert(POSTES_PEREIRA_NERVIEUX[6].nom.includes("induits"), "poste 7 induits");
assert(POSTES_PEREIRA_NERVIEUX[6].nom.includes("DTU 65.16"), "poste 7 DTU 65.16");
assert(POSTES_PEREIRA_NERVIEUX[6].unite === "forfait", "poste 7 forfait");
assert(POSTES_PEREIRA_NERVIEUX[6].totalHt === 1500, "induits 1 500 HT");
assert(POSTES_PEREIRA_NERVIEUX[6].totalTva === 82.5, "induits TVA 82,50");
assert(POSTES_PEREIRA_NERVIEUX[6].totalTtc === 1582.5, "induits 1 582,50 TTC");
assert(POSTES_PEREIRA_NERVIEUX[7].nom.includes("Contractant Général"), "poste 8 CG");
assert(POSTES_PEREIRA_NERVIEUX[7].totalHt === 5200, "CG 5 200 HT");
assert(POSTES_PEREIRA_NERVIEUX[7].tauxTva === 0.055, "CG TVA 5,5 %");
assert(!/prix ferme/i.test(POSTES_PEREIRA_NERVIEUX[7].specifications), "lot 8 sans prix ferme");
assert(POSTES_PEREIRA_NERVIEUX[4].prestationId === "marche-pac-ae-6kw", "catalogue PAC AE");
assert(POSTES_PEREIRA_NERVIEUX[5].prestationId === "marche-cet-simple", "catalogue CET");

const noms = POSTES_PEREIRA_NERVIEUX.map((p) => p.nom).join(" | ");
assert(!/\bITE\b/.test(noms), "pas d’ITE dans le panier");
assert(!/\bITI\b/.test(noms), "pas d’ITI dans le panier");
assert(!POSTES_PEREIRA_NERVIEUX.some((p) => /velux/i.test(p.nom) && !/0 Velux/.test(p.nom)), "aucun poste Velux");
assert(!POSTES_PEREIRA_NERVIEUX.some((p) => /rampant/i.test(p.nom) && !/0 m² de rampant/.test(p.nom)), "aucun poste rampant");
assert(!POSTES_PEREIRA_NERVIEUX.some((p) => /200 L/.test(p.nom)), "pas de CET 200 L");

assert(CONTACTS_PEREIRA_CONTRAT[0].role === "Direction & Contractant Général", "contact 1 CG");
assert(CONTACTS_PEREIRA_CONTRAT[1].nom === "Clyve", "contact 2 Clyve");
assert(CONTACTS_PEREIRA_CONTRAT[2].role.includes("Courtier en travaux"), "contact 3 Fabien");
assert(CONTACTS_PEREIRA_CONTRAT[3].nom === "Julia", "contact 4 Julia");
assert(CONTACTS_PEREIRA_CONTRAT.length === 4, "4 contacts officiels");
assert(!CONTACTS_PEREIRA_CONTRAT.some((c) => /DAMIEN|damien/i.test(`${c.nom} ${c.role} ${c.detail}`)), "contacts sans Damien");
assert(!CONTACTS_PEREIRA_CONTRAT.some((c) => /\bAMO\b/.test(`${c.nom} ${c.role} ${c.detail}`)), "contacts sans AMO");

const totaux = totauxContractuelsPereiraNervieux();
assert(totaux.totalTtc === TOTAUX_PEREIRA_NERVIEUX.totalTtc, "totaux cohérents");
assert(totaux.totalHt === TOTAUX_PEREIRA_NERVIEUX.totalHt, `HT ${totaux.totalHt}`);
assert(totaux.totalHt === 30710.9, "HT 30 710,90");
assert(totaux.totalTtc === 32400, "TTC 32 400,00");
assert(totaux.lignes.length === 8, "8 lignes contractuelles");

assert(AIDES_PEREIRA_VIOLET.mpr === 11500, "MPR 11 500");
assert(AIDES_PEREIRA_VIOLET.cee === 4000, "CEE fioul 4 000");
assert(AIDES_PEREIRA_VIOLET.mar === 0, "MAR non ajouté au total");
assert(AIDES_PEREIRA_VIOLET.totalAides === 15500, "total aides 15 500");
assert(AIDES_PEREIRA_VIOLET.resteACharge === 16900, "RAC 16 900");
assert(AIDES_PEREIRA_VIOLET.mensualite20 === 70.42, "Éco-PTZ 70,42 €/mois");
assert(AIDES_PEREIRA_VIOLET.tauxParcours === 0.45, "Violet 45 % officiel");

assert(PHOTOS_CONTRAT_PEREIRA.paires.length === 4, "4 paires Avant/Après");
assert(PHOTOS_CONTRAT_PEREIRA.paires[0].id === "facade-menuiseries", "paire façade");
assert(PHOTOS_CONTRAT_PEREIRA.paires[1].id === "chaufferie-pac", "paire chaufferie");
assert(PHOTOS_CONTRAT_PEREIRA.paires[2].id === "combles", "paire combles");
assert(PHOTOS_CONTRAT_PEREIRA.paires[3].id === "plancher", "paire plancher");
assert(PHOTOS_CONTRAT_PEREIRA.chauffage.avantSrc.includes("/images/pereira/02-chaufferie"), "photo chaudière");
assert(PHOTOS_CONTRAT_PEREIRA.chauffage.apresSrc.includes("/images/pereira/02-pac"), "projection PAC");
assert(PHOTOS_CONTRAT_PEREIRA.menuiseries.avantSrc.includes("/images/pereira/01-facade"), "photo façade");
assert(PHOTOS_CONTRAT_PEREIRA.etatLieux.length >= 2, "au moins 2 vues état des lieux");
assert(PHOTOS_CONTRAT_PEREIRA.mentionLegale.includes("AUDIT-PEREIRA-2026-001"), "mention visite");

const edition = editionOfficiellePereiraNervieux();
assert(edition.client.surfaceHabitable === "164", "édition 164 m²");
assert(edition.aides.parcours === "parcours", "Parcours Accompagné");
assert(edition.aides.gainClasses === 3, "3 classes");
assert(edition.aides.region === "AURA", "région AURA");
assert(edition.aides.profil === "violet", "profil Violet verrouillé");
assert(edition.aides.rfr === 27522, "RFR édition");
assert(edition.financement.ecoPtzMontant === 16900, "Éco-PTZ = RAC");
assert(edition.financement.ecoPtzDuree === 20, "Éco-PTZ 20 ans");
assert(edition.finances.coutClyveHt === 990, "Clyve 990 HT");
assert(edition.mar.role.includes("Contractant Général"), "rôle CG");
assert(!JSON.stringify(edition).includes("Léo-Energy"), "pas de Léo-Energy facturé");
assert(edition.mentionsJuridiques.some((m) => /70 m² de rampants/.test(m)), "alerte rampants");
assert(edition.mentionsJuridiques.some((m) => /Velux/.test(m)), "alerte Velux");
assert(edition.mentionsJuridiques.some((m) => /ITI/.test(m)), "mention exclusion ITI");

const aides = calculerAidesIndicatives(edition);
assert(aides.mpr === 11500, "MPR CRM verrouillé");
assert(aides.cee === 4000, "CEE CRM");
assert(aides.mar === 0, "MAR CRM");
assert(aides.totalAides === 15500, "total aides CRM");
assert(aides.profil === "violet", "profil aides");
assert(aides.libelleCee.toLowerCase().includes("fioul"), "CEE sortie de fioul");
assert(!aides.libelleCee.includes("air/air"), "pas de CEE air/air sur Pereira");
assert(edition.mentionsJuridiques.some((m) => /à titre indicatif/i.test(m)), "disclaimer aides");
assert(edition.mentionsJuridiques.some((m) => /3 classes/.test(m)), "mention 3 classes");
assert(edition.mentionsJuridiques.some((m) => /Courtier en travaux & financements/.test(m)), "mention Fabien courtier travaux");
assert(edition.mentionsJuridiques.some((m) => /Contractant Général — ENERGIA-CONSEIL IA/.test(m)), "mention CG 30/40/30");
assert(!JSON.stringify(edition.mentionsJuridiques).includes("AMO ENERGIA"), "mentions sans AMO");

const plan = calculerFinancement(edition);
assert(plan.ecoPtzMontant === 16900, "plan Éco-PTZ = RAC");
assert(plan.mensualite20 === 70.42, "mensualité 70,42");
assert(plan.canalPretTravaux.option.includes("FABIEN"), "canal Fabien");
assert(plan.canalPretTravaux.option.includes("06 71 19 96 45"), "tél Fabien");
assert(Math.abs(plan.acompte + plan.intermediaire + plan.solde - 16900) < 0.02, "30/40/30 = reste à charge");
assert(plan.acompte === 5070, "30 % 5 070");
assert(plan.intermediaire === 6760, "40 % 6 760");
assert(plan.solde === 5070, "30 % 5 070");
assert(plan.verrouillageOfficiel === true, "verrou financement Pereira");

const finAdmin = calculerFinancesInternes(edition, ROLE_ADMIN);
assert(finAdmin.coutClyveHt === 990, "Clyve admin");
assert(finAdmin.recetteCoordinationHt === 5200, "recette CG 5 200");
assert(finAdmin.margeNetteCoordination === 4210, "5 200 − 990");
assert(calculerFinancesInternes(edition, ROLE_COMMERCIAL).coutClyveHt == null, "Clyve masqué commercial");

reinitialiserEditionTests();
const locked = lireEditionDossier(PEREIRA_NERVIEUX_DOSSIER_ID, {
  nom: "David Emmanuel PEREIRA",
  adresse: CLIENT_PEREIRA_NERVIEUX.adresse,
});
assert(locked.travaux.length === 8, "lock 8 postes");
assert(locked.client.nom === "PEREIRA", "lock nom");
assert(locked.devisOfficiel.numero === PEREIRA_NERVIEUX_NUMERO, "numéro DEV-2026-PEREIRA-01");
assert(locked.travaux[0].quantite === 19.38, "lock menuiseries 19,38");
assert(locked.travaux[1].quantite === 60, "lock combles 60");
assert(locked.aides.profil === "violet", "lock profil");
assert(appliquerVerrouillagePereiraNervieux({ travaux: [] }).travaux.length === 8, "verrou écrase");

const fusion = fusionnerAvecDefautBrunel([]);
assert(fusion[0].id === BRUNEL_DOSSIER_ID, "Brunel en tête");
assert(fusion[1].id === PEREIRA_NERVIEUX_DOSSIER_ID, "Pereira Nervieux 2e");
assert(fusion.every((p) => p.id !== "demo-pereira"), "fixture Pereira absent des manuels");

const audit = projetManuelVersAudit(fusion[1]);
assert(audit.auditId === PEREIRA_NERVIEUX_NUMERO, "auditId CRM");
assert(audit.caTtc === TOTAUX_PEREIRA_NERVIEUX.totalTtc, "CA TTC CRM");
assert(audit.categorieAide === "violet", "couleur MPR avis");
assert(audit.ville.includes("Nervieux"), "ville CRM");
assert(audit.typeProjet.includes("hors Velux"), "type projet hors Velux");
assert(audit.typeProjet.includes("sans ITI"), "type projet sans ITI");

const html = construireHtmlDevisPereiraNervieux();
const htmlSansLogo = html.replace(/src="data:image\/png;base64,[^"]+"/g, "");
assert(html.includes("Annexe Photographique — État des Lieux"), "section photos devis");
assert(html.includes("page-break-inside: avoid"), "CSS print annexe");
assert(html.includes("photo-annexe"), "classe photo-annexe");
assert(html.includes("Bon pour accord"), "bon pour accord");
assert(html.indexOf("Détail des 8 postes") < html.indexOf("Annexe Photographique"), "photos sous le tableau travaux");
assert(html.indexOf("Annexe Photographique") < html.indexOf("Bon pour accord"), "photos avant signature");
assert(html.includes(PHOTOS_CONTRAT_PEREIRA.chauffage.avantSrc), "src chaudière");
assert(html.includes("/images/pereira/01-facade-menuiseries-avant.png"), "src façade");
assert(/11[\s\u00a0\u202f]?500,00/.test(html), "MPR 11 500 dans HTML");
assert(/16[\s\u00a0\u202f]?900,00/.test(html), "RAC 16 900 dans HTML");
assert(/32[\s\u00a0\u202f]?400,00/.test(html), "TTC 32 400 dans HTML");
assert(/5[\s\u00a0\u202f]?070,00/.test(html), "acompte 5 070 dans HTML");
assert(html.includes("Marché de travaux de Contractant Général"), "qualification du marché");
assert(!/prix ferme/i.test(htmlSansLogo), "HTML sans prix ferme");
assert(html.includes("Violet"), "Violet dans HTML");
assert(html.includes("AUDIT-PEREIRA-2026-001"), "mention visite");
assert(html.includes("DTU 65.16"), "DTU 65.16 dans HTML");
assert(/1[\s\u00a0\u202f]?500,00/.test(html), "induits 1 500 HT dans HTML");
assert(/30[\s\u00a0\u202f]?710,90/.test(html), "HT contrat dans HTML");
assert(html.includes("8 postes"), "8 postes HTML");
assert(html.includes("Clyve"), "HTML Clyve");
assert(html.includes("class=\"sheet\""), "charte sheet Brunel");
assert(html.includes("#0B1F3A"), "bleu nuit");
assert(html.includes("#059669"), "vert émeraude");
assert(html.includes("data:image/png;base64,"), "logo ENERGIA embarqué");
assert(html.includes("16. Malfaçons et garanties"), "CGV Article 16");
assert(html.includes("ENERGIA-CONSEIL IA® intervient en qualité exclusive de CONTRACTANT GÉNÉRAL"), "Article 16 CG");
assert(html.includes("chauffage seul"), "PAC chauffage seul HTML");
assert(html.includes("250 L"), "CET 250 L HTML");
assert(!htmlSansLogo.includes("DAMIEN"), "HTML sans Damien");
assert(!/damien\.srdconseil/i.test(htmlSansLogo), "HTML sans email Damien");
assert(html.includes("PAC air/eau haute température"), "CEE PAC AE HTML");
assert(!html.includes("PAC air/air"), "pas de CEE air/air Pereira");
assert(html.includes("Financement travaux / Courtier FABIEN"), "libellé courtier tableau");
assert(html.includes("Courtier en travaux & financements"), "rôle Fabien HTML");
assert(html.includes("Contractant Général — ENERGIA-CONSEIL IA"), "CG 30/40/30 HTML");
assert(!htmlSansLogo.includes("AMO ENERGIA-CONSEIL"), "HTML sans AMO");
assert(!htmlSansLogo.includes("Éco-PTZ + prêt relais"), "plus de prêt relais ANAH attribué à Fabien");
assert(!html.includes("projection-iti"), "pas de projection ITI dans le devis");
assert(!/PVC/i.test(htmlSansLogo), "menuiseries alu, pas PVC");

const rapport = construireHtmlRapportPereiraNervieux();
assert(rapport.includes("non-nécessité de l'ITI") || rapport.includes("non-nécessité de l’ITI"), "justif ITI rapport");
assert(rapport.includes("164 m²"), "164 m² rapport");
assert(rapport.includes(PHOTOS_CONTRAT_PEREIRA.menuiseries.avantSrc), "photos rapport");
assert(rapport.includes("Préconisation RGE"), "légendes RGE rapport");
assert(rapport.includes("class=\"sheet\""), "rapport charte sheet");
assert(rapport.includes("CONTRACTANT GÉNÉRAL"), "rapport statut CG");

const racine = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const fichier = join(racine, "data/sauvegardes", FICHIER_SAUVEGARDE_PEREIRA_NERVIEUX);
assert(existsSync(fichier), `sauvegarde absente : ${fichier}`);
const disque = JSON.parse(readFileSync(fichier, "utf8"));
assert(disque.dossierId === PEREIRA_NERVIEUX_DOSSIER_ID, "fichier id");
assert(disque.edition?.travaux?.length === 8, "fichier 8 postes");
assert(disque.edition?.client?.adresse.includes("Nervieux"), "fichier adresse");
assert(disque.tunnel?.totaux?.totalTtc === TOTAUX_PEREIRA_NERVIEUX.totalTtc, "fichier TTC");
assert(disque.aides?.mpr === 11500, "fichier MPR");
assert(disque.financement?.resteACharge === 16900, "fichier RAC");
assert(disque.financement?.acompte === 5070, "fichier acompte");
assert(disque.financesInternes?.coutClyveHt === 990, "fichier Clyve");
assert(disque.edition.aides.profil === "violet", "fichier Violet");
assert(!JSON.stringify(disque).includes("demo-pereira"), "fichier ≠ fixture");
assert(!disque.edition.travaux.some((l) => /\bITE\b/.test(l.nom || "")), "fichier sans ITE");
assert(disque.edition.travaux[0].quantite === 19.38, "fichier menuiseries 19,38");
assert(disque.edition.travaux[1].quantite === 60, "fichier combles 60");

const devisDisque = join(racine, FICHIER_DEVIS_PEREIRA_NERVIEUX);
const devisPublic = join(racine, "public", FICHIER_DEVIS_PEREIRA_NERVIEUX);
const rapportDisque = join(racine, FICHIER_RAPPORT_PEREIRA_NERVIEUX);
assert(existsSync(devisDisque), "HTML devis racine");
assert(existsSync(devisPublic), "HTML devis public");
assert(existsSync(rapportDisque), "HTML rapport racine");
assert(existsSync(join(racine, "public", PHOTOS_CONTRAT_PEREIRA.chauffage.avantSrc.replace(/^\//, ""))), "photo chaudière disque");
assert(existsSync(join(racine, "public", PHOTOS_CONTRAT_PEREIRA.paires[0].avantSrc.replace(/^\//, ""))), "photo façade disque");
assert(existsSync(join(racine, "public", PHOTOS_CONTRAT_PEREIRA.etatLieux[0].src.replace(/^\//, ""))), "vue 1 disque");
assert(disque.photos?.paires?.length === 4, "sauvegarde 4 paires");

console.log(
  `OK — Pereira SANS ITI Violet : RFR ${FISCALITE_AVIS_PEREIRA.rfr} € | 8 postes | ${totaux.totalHt} HT / ${totaux.totalTtc} TTC | MPR ${aides.mpr} + MAR ${aides.mar} | RAC ${plan.resteACharge} | Éco-PTZ ${plan.mensualite20} €/mois | photos + HTML.`,
);
