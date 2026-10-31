/**
 * Template Master Contractant Général — moteur unique CRM.
 * Exécution : node src/lib/crm/verify-contrat-master.js
 */

import { BRUNEL_DOSSIER_ID } from "./brunelWorkingBase.js";
import { PEREIRA_NERVIEUX_DOSSIER_ID } from "./pereiraNervieuxOfficiel.js";
import { genererHtmlDevisBrunelFinal } from "./devisBrunelFinalHtml.js";
import { construireHtmlDevisPereiraNervieux } from "./devisPereiraNervieuxHtml.js";
import { htmlContratPourDossier } from "./htmlContratCrm.js";
import {
  CONTACTS_CONTRAT_MASTER,
  TITRE_CONTRAT_CONTRACTANT_GENERAL,
  payloadContratCloisonSdbOfficiel,
  payloadContratDepuisEdition,
} from "./payloadContratCrm.js";
import { CLOISON_SDB_DOSSIER_ID } from "./cloisonSdbOfficiel.js";
import {
  construireHtmlContratContractantGeneral,
  cssChartePremiumEnergia,
} from "./contratContractantGeneralHtml.js";
import { editionVide } from "./editionDossier.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

assert(TITRE_CONTRAT_CONTRACTANT_GENERAL.includes("CONTRACTANT GÉNÉRAL"), "titre master");
assert(CONTACTS_CONTRAT_MASTER.length === 4, "4 contacts master");
assert(CONTACTS_CONTRAT_MASTER[0].nom === "Sylvain LEMBELEMBE", "Sylvain CG");
assert(CONTACTS_CONTRAT_MASTER[1].nom === "Clyve", "Clyve");
assert(CONTACTS_CONTRAT_MASTER[2].nom.includes("FABIEN"), "Fabien");
assert(CONTACTS_CONTRAT_MASTER[3].nom === "Julia", "Julia");
assert(
  !CONTACTS_CONTRAT_MASTER.some((c) => /DAMIEN|damien/i.test(`${c.nom} ${c.role} ${c.detail}`)),
  "master sans Damien",
);

const css = cssChartePremiumEnergia("CONTRAT-TEST");
assert(css.includes("#0B1F3A"), "bleu nuit");
assert(css.includes("#059669"), "émeraude");
assert(css.includes("page-break-inside: avoid"), "print avoid");
assert(css.includes("@media print"), "media print");
assert(css.includes("margin: 10mm 12mm"), "@page A4 10mm 12mm");
assert(css.includes("print-color-adjust: exact !important"), "couleurs impression exactes");

const pereira = construireHtmlDevisPereiraNervieux();
const brunel = genererHtmlDevisBrunelFinal();
assert(pereira.includes("class=\"sheet\""), "Pereira sheet");
assert(brunel.includes("class=\"sheet\""), "Brunel sheet");
assert(pereira.includes("#0B1F3A") && brunel.includes("#0B1F3A"), "même charte bleu nuit");
assert(
  pereira.includes('class="brand"') &&
    brunel.includes('class="brand"') &&
    pereira.includes("ENERGIA-CONSEIL IA®") &&
    brunel.includes("ENERGIA-CONSEIL IA®") &&
    pereira.includes('class="brand-lockup"') &&
    brunel.includes('class="brand-lockup"') &&
    (pereira.includes("data:image/png;base64,") || pereira.includes("/logo.png")) &&
    (brunel.includes("data:image/png;base64,") || brunel.includes("/logo.png")),
  "en-tête institutionnel commun (logo + brand 2 colonnes)",
);
assert(
  pereira.includes("ENERGIA-CONSEIL IA® intervient en qualité exclusive de CONTRACTANT GÉNÉRAL"),
  "Pereira article 16",
);
assert(
  brunel.includes("ENERGIA-CONSEIL IA® intervient en qualité exclusive de CONTRACTANT GÉNÉRAL"),
  "Brunel article 16",
);
const pereiraRoute = htmlContratPourDossier({}, { id: PEREIRA_NERVIEUX_DOSSIER_ID });
const brunelRoute = htmlContratPourDossier({}, { id: BRUNEL_DOSSIER_ID });
assert(
  pereiraRoute.includes("CONTRACTANT GÉNÉRAL") && /36[\s]?306,58/.test(pereiraRoute),
  "route Pereira officiel (moteur CG)",
);
assert(
  brunelRoute.includes("33 478,53") && brunelRoute.includes("CONTRACTANT GÉNÉRAL"),
  "route Brunel officiel (moteur CG)",
);
assert(brunel.includes("33 478,53"), "Brunel TTC marché 2026");
assert(brunel.includes('class="print-cinq-pages"'), "Brunel impression 5 pages");
assert(!pereira.includes('class="print-cinq-pages"'), "Pereira hors forçage 5 pages");
assert(brunel.includes("ANNEXE VISUELLE — PROJECTION ARCHITECTURALE DE FAÇADE VALIDÉE"), "Brunel annexe visuelle");
assert(brunel.includes("max-width: 850px") && brunel.includes("border-radius: 12px"), "Brunel CSS façade prestige");
assert(/36[\s]?306,58/.test(pereira), "Pereira TTC verrouillé");
assert(!pereira.replace(/src="data:image\/[^;]+;base64,[^"]+"/g, "").includes("DAMIEN") && !brunel.replace(/src="data:image\/[^;]+;base64,[^"]+"/g, "").includes("DAMIEN"), "aucun Damien");

const edition = {
  ...editionVide(),
  client: { nom: "DUPONT", prenom: "Marie", adresse: "12 rue Test, 69006 Lyon", surfaceHabitable: "90" },
  aides: { profil: "bleu", parcours: "parcours", gainClasses: 3, rfr: 15000, parts: 1 },
  travaux: [
    {
      id: "t1",
      nom: "Isolation combles perdus",
      specifications: "R ≥ 7",
      artisan: "RGE Test",
      quantite: 40,
      unite: "m²",
      puHt: 50,
      tauxTva: 0.055,
    },
    {
      id: "t-cg",
      nom: "Direction & Contractant Général",
      prestationId: "energia-contractant-general",
      quantite: 1,
      unite: "lot",
      puHt: 5200,
      tauxTva: 0.2,
    },
  ],
};
const payload = payloadContratDepuisEdition(edition, { id: "projet-manuel-dupont", nom: "DUPONT" });
assert(payload.contacts.length === 4, "nouveau client 4 contacts");
assert(payload.postes.length === 2, "2 postes CRM");
const htmlNouveau = construireHtmlContratContractantGeneral(payload);
assert(htmlNouveau.includes("DUPONT"), "nom client");
assert(htmlNouveau.includes("Bleu"), "profil ANAH dynamique");
assert(htmlNouveau.includes("TVA 20"), "ligne CG 20 %");
assert(!htmlNouveau.includes("DAMIEN"), "nouveau client sans Damien");
assert(htmlContratPourDossier(edition, { id: "projet-manuel-dupont", nom: "DUPONT" }).includes("CONTRAT-2026-DUPONT"), "numéro auto");

const cloisonPayload = payloadContratCloisonSdbOfficiel();
assert(cloisonPayload.totaux.totalTtc === 2717, "Cloison TTC payload");
const cloisonHtml = htmlContratPourDossier({}, { id: CLOISON_SDB_DOSSIER_ID });
assert(cloisonHtml.includes("2 717,00"), "Cloison HTML TTC");
assert(!/Damien RICHARD/i.test(cloisonHtml), "Cloison sans Damien RICHARD");
assert(!/apporteur/i.test(cloisonHtml), "Cloison sans apporteur");
assert(cloisonHtml.includes("Direction & Portage Contractant Général : ENERGIA CONSEIL IA"), "Cloison portage ENERGIA");
assert(!cloisonHtml.includes("Mohamed BENAOUDA") && !cloisonHtml.includes("6 34 17 09 47"), "Cloison sans Mohamed");
assert(!/prix\s+ferme/i.test(cloisonHtml) && !/march[ée]\s+ferme/i.test(cloisonHtml), "Cloison sans prix/marché ferme");
assert(
  cloisonHtml.includes('class="brand"') &&
    cloisonHtml.includes("ENERGIA-CONSEIL IA®") &&
    cloisonHtml.includes('class="brand-lockup"') &&
    cloisonHtml.includes('class="logo"'),
  "Cloison en-tête institutionnel (logo + brand 2 colonnes)",
);
assert(cloisonHtml.includes("LUNPIB2604975"), "Cloison décennale Calipso");
assert(!cloisonHtml.includes("Encart contractuel"), "Cloison sans encart rémunération");
assert(!cloisonHtml.includes("Bénéficiaire :</strong> Damien RICHARD"), "Cloison sans bénéficiaire");
assert(!cloisonHtml.includes("10 % HT sur la tranche de travaux jusqu’à 50 000 € HT"), "Cloison sans grille 10 %");
assert(!cloisonHtml.includes("5 % HT sur la part excédentaire au-delà de 50 000 € HT"), "Cloison sans grille 5 %");
assert(!cloisonHtml.includes("Périmètre et Barème des Commissions"), "Cloison sans article barème");
assert(!cloisonHtml.includes("Conditions de Déclenchement et d’Échéance"), "Cloison sans article échéance commission");
assert(!cloisonHtml.includes("Facturation et Indépendance Juridique"), "Cloison sans article facturation commission");
assert(cloisonHtml.includes("5213845"), "Cloison INPI");
assert(!cloisonHtml.includes("Commission 10 % HT"), "Cloison sans forfait 10 % unique");
assert(!pereira.includes("Société SRD CONSEIL") && !brunel.includes("Société SRD CONSEIL"), "Pereira/Brunel sans commission Damien");
assert(cloisonHtml.includes("Monsieur et Madame Georges GOURDON"), "Cloison signature client");
assert(cloisonHtml.includes("07 69 44 85 98"), "Cloison téléphone");
assert(cloisonHtml.includes("512 Route de Saint-Laurent-les-Bains"), "Cloison adresse");
assert(construireHtmlContratContractantGeneral(cloisonPayload) === cloisonHtml, "route Cloison officiel");

console.log("OK — Template Master Contractant Général : charte unique, Article 16 CG, Brunel/Pereira/Cloison/nouveau client.");
