/**
 * Dossier M. et Mme Youssef OUSSARA — COLOMBIER SAUGNIEU (69).
 * Avenant rectifié DEV-2026-OUSSARA-02, signable.
 * Vente brute 13 000,00 € HT, geste de Direction −300,00 € HT,
 * net 12 700,00 € HT, TVA 20 % 2 540,00 €, TTC 15 240,00 €.
 * Les postes sont un forfait : aucun prix unitaire n'est inventé.
 * Le RIB est celui déjà enregistré pour ENERGIA CONSEIL (clé IBAN valide).
 */

import {
  SOURCE_APPORTEUR_DIRECT,
  STATUT_COMMISSION_EN_ATTENTE,
  libelleSourceApporteur,
} from "./operationnelCrm.js";
import { INPI_MARQUE, RIB_QONTO } from "./paradesAntiFuite.js";

const QUALIFICATION_CERTIBAT =
  "Référent Technique Rénovation Globale Certibat / Réno-Perf (28/30)";

export const OUSSARA_DOSSIER_ID = "DOS-2026-OUSSARA-01";
export const OUSSARA_CLIENT_ID = "CL-2026-OUSSARA";
export const OUSSARA_REFERENCE = "DEV-2026-OUSSARA-02";
export const OUSSARA_DEVIS_NUMERO = "DEV-2026-OUSSARA-02";
export const OUSSARA_DEVIS_DATE = "2026-10-30";
export const OUSSARA_DEVIS_DATE_LONGUE = "30 octobre 2026";
export const OUSSARA_DEVIS_VALIDITE = "29 novembre 2026";
export const OUSSARA_DEVIS_VALIDITE_LIBELLE = "30 jours — jusqu'au 29 novembre 2026";
export const OUSSARA_DEVIS_TITRE =
  "DEVIS CONTRACTANT GÉNÉRAL — AVENANT RECTIFIÉ — CONSTRUCTION MAISON INDIVIDUELLE RE2020 — LOT MENUISERIES & VOLETS ROULANTS";
export const NOM_FICHIER_DEVIS_OUSSARA = "DEVIS_OUSSARA_COLOMBIER_SAUGNIEU_2026.html";
export const NOM_FICHIER_PDF_OUSSARA = "DEVIS_OUSSARA_COLOMBIER_SAUGNIEU_2026.pdf";
export const CHEMIN_DEVIS_OUSSARA = `/${NOM_FICHIER_DEVIS_OUSSARA}`;
export const CHEMIN_PDF_OUSSARA = `/${NOM_FICHIER_PDF_OUSSARA}`;
export const LOGO_ARBRES_OUSSARA = "/assets/energia-logo-arbres.png";

export const ASSURANCE_DECENNALE_OUSSARA = "Garantie décennale Calypso Assurances n° LUNPIB2604975";
export const MENTION_INPI_OUSSARA = `Marque déposée INPI n° ${INPI_MARQUE}`;
export const MENTION_CERTIBAT_OUSSARA = QUALIFICATION_CERTIBAT;
export const RAISON_SOCIALE_OUSSARA =
  "ENERGIA CONSEIL IA® — Bureau d'Études Thermiques & Contractant Général Digital";
export const SIEGE_OUSSARA = "SASU au capital de 100 € — Siège : 16 Rue Cuvier, 69006 Lyon";
export const IDENTITE_FISCALE_OUSSARA = "SIRET 941 819 427 00019 — RCS Lyon — TVA FR01941819427";

export const STATUT_OUSSARA = "Devis rectifié DEV-2026-OUSSARA-02 envoyé — En attente acompte 40%";
export const PHASE_OUSSARA = "Avenant rectifié envoyé — acompte 40 % en attente";
export const CATEGORIE_OUSSARA = "Isolation & Menuiseries";
export const SOURCE_OUSSARA = "Client direct — ENERGIA CONSEIL IA®";
export const TITRE_OUSSARA =
  "Construction Maison Individuelle RE2020 — Lot Menuiseries & Volets Roulants";

export const CLIENT_OUSSARA = {
  clientId: OUSSARA_CLIENT_ID,
  civilite: "M. et Mme",
  nom: "OUSSARA",
  prenom: "Youssef",
  libelleSignature: "M. et Mme Youssef OUSSARA",
  telephone: "",
  email: "",
  adresse: "Rue des Verchères, 69124 COLOMBIER SAUGNIEU",
  rue: "Rue des Verchères",
  ville: "COLOMBIER SAUGNIEU",
  codePostal: "69124",
  departement: "69",
  region: "Auvergne-Rhône-Alpes",
  typeBien: "Maison individuelle en construction neuve RE2020",
  typeProjet: TITRE_OUSSARA,
  categorie: CATEGORIE_OUSSARA,
  dateCreation: OUSSARA_DEVIS_DATE,
  regimeTva: "TVA 20 % — construction neuve",
};

export const INTERLOCUTEUR_UNIQUE_OUSSARA =
  "Direction de marché & Interlocuteur Unique : Sylvain LEMBELEMBE (06 10 59 68 98 — contact@renovoptim-ia.com)";

export const EQUIPE_OUSSARA = {
  commercial: null,
  direction: "Sylvain LEMBELEMBE",
  interlocuteurUnique: INTERLOCUTEUR_UNIQUE_OUSSARA,
  apporteur: "Client direct — ENERGIA CONSEIL IA®",
  titulaireMarche: "ENERGIA CONSEIL IA® (Contractant Général)",
  coordination: INTERLOCUTEUR_UNIQUE_OUSSARA,
  assuranceDecennale: ASSURANCE_DECENNALE_OUSSARA,
  juriste: "Julia",
  mar: "Antoine BARATIER – Cabinet C2ET",
  courtier: "FABIEN – VIVONS COURTIER",
};

export const TOTAUX_OUSSARA = {
  totalHtBrut: 13000,
  gesteCommercialHt: 300,
  totalHt: 12700,
  totalTva: 2540,
  totalTtc: 15240,
  tauxTva: 0.2,
  coutsTravauxHt: null,
  fournitureHt: null,
  poseHt: null,
  margeBruteHt: null,
  tauxMargePct: null,
  commissionDamienHt: 0,
  forfaitCatarinaHt: 0,
  margeNetteEnergiaHt: null,
};

/** 40 % commande ferme / 40 % livraison matériel et démarrage pose / 20 % réception sans réserve. */
export const FINANCEMENT_OUSSARA = {
  acompte: 6096,
  intermediaire: 6096,
  solde: 3048,
  resteACharge: 15240,
  libelleAcompte: "Acompte 1 à la commande ferme (40 %)",
  libelleIntermediaire: "Acompte 2 à la livraison matériel / démarrage pose (40 %)",
  libelleSolde: "Solde à la réception sans réserve (20 %)",
};

/** Compte officiel déjà enregistré. La variante …0166… / QNTORP1XXX ne passe pas la clé IBAN. */
export const RIB_OUSSARA = {
  titulaire: RIB_QONTO.titulaire,
  banque: RIB_QONTO.banque,
  adresseBanque: RIB_QONTO.adresseBanque,
  iban: RIB_QONTO.iban,
  bic: RIB_QONTO.bic,
  referenceVirement: "DEV-OUSSARA",
  mention: "Merci d'indiquer la référence 'DEV-OUSSARA' dans le libellé de votre virement d'acompte.",
};

function poste(ordre, id, nom, specifications) {
  return {
    id: `oussara-poste-${id}`,
    ordreContractuel: ordre,
    nom,
    specifications,
    quantite: 1,
    unite: "forfait",
    puHt: 0,
    tauxTva: TOTAUX_OUSSARA.tauxTva,
    totalHt: 0,
    totalTva: 0,
    totalTtc: 0,
  };
}

export const POSTES_OUSSARA_DEVIS = [
  poste(
    1,
    "baie-sejour-240",
    "Grande baie coulissante Séjour 2 vantaux (2,40 × 2,15 m) en Aluminium RAL 7016 + VR alu",
    "Aluminium à rupture de pont thermique, gris anthracite RAL 7016, avec volet roulant aluminium.",
  ),
  poste(
    2,
    "baie-sejour-180",
    "Baie coulissante Séjour 2 vantaux (1,80 × 2,15 m) en Aluminium RAL 7016 + VR alu",
    "Aluminium à rupture de pont thermique, gris anthracite RAL 7016, avec volet roulant aluminium.",
  ),
  poste(
    3,
    "pf-sejour-140",
    "Porte-fenêtre Séjour (1,40 × 2,15 m) en PVC RE2020 extérieur RAL 7016 + VR alu",
    "PVC haute performance RE2020, finition extérieure RAL 7016 assortie, avec volet roulant aluminium.",
  ),
  poste(
    4,
    "cuisine-allege",
    "Fenêtre panoramique Cuisine allège 140 (1,67 × 0,60 m) en PVC RE2020 + VR alu",
    "PVC haute performance RE2020, finition extérieure RAL 7016, avec volet roulant aluminium.",
  ),
  poste(
    5,
    "porte-entree",
    "Porte d'entrée monobloc Aluminium haute sécurité serrure 5 points A2P*, Ud <= 1.0",
    "Monobloc aluminium haute sécurité, serrure 5 points A2P*, Ud inférieur ou égal à 1,0.",
  ),
  poste(
    6,
    "pf-parentale",
    "Porte-fenêtre Suite Parentale RDC (1,40 × 2,15 m) en PVC RE2020 + VR alu",
    "PVC haute performance RE2020, finition extérieure RAL 7016, avec volet roulant aluminium.",
  ),
  poste(
    7,
    "sde-parentale",
    "Fenêtre oscillo-battante SDE Parentale dépolie (0,90 × 1,25 m) en PVC RE2020 + VR alu",
    "Vitrage dépoli, PVC haute performance RE2020, finition extérieure RAL 7016, avec volet roulant aluminium.",
  ),
  poste(
    8,
    "cellier",
    "Porte de service isolée Cellier / Buanderie (0,90 × 2,15 m)",
    "Porte de service isolée, PVC haute performance RE2020, finition extérieure RAL 7016.",
  ),
  poste(
    9,
    "chambre-1",
    "Fenêtre Chambre 1 R+1 (2 vantaux oscillo-battants 1,15 × 1,25 m) en PVC RE2020 + VR alu",
    "PVC haute performance RE2020, finition extérieure RAL 7016, avec volet roulant aluminium.",
  ),
  poste(
    10,
    "chambre-2",
    "Fenêtre Chambre 2 R+1 (2 vantaux oscillo-battants 1,15 × 1,25 m) en PVC RE2020 + VR alu",
    "PVC haute performance RE2020, finition extérieure RAL 7016, avec volet roulant aluminium.",
  ),
  poste(
    11,
    "chambre-3",
    "Fenêtre Chambre 3 R+1 (2 vantaux oscillo-battants 1,15 × 1,25 m) en PVC RE2020 + VR alu",
    "PVC haute performance RE2020, finition extérieure RAL 7016, avec volet roulant aluminium.",
  ),
  poste(
    12,
    "sdb-etage",
    "Fenêtre Salle de bains R+1 dépolie (0,90 × 1,25 m) en PVC RE2020 + VR alu",
    "Vitrage dépoli, PVC haute performance RE2020, finition extérieure RAL 7016, avec volet roulant aluminium.",
  ),
  poste(
    13,
    "wc-palier",
    "Châssis WC / Palier (0,60 × 0,80 m) en PVC RE2020 + VR alu",
    "PVC haute performance RE2020, finition extérieure RAL 7016, avec volet roulant aluminium.",
  ),
  poste(
    14,
    "volets",
    "11 volets roulants motorisés filaires en coffre tunnel invisible (compatibles smartphone)",
    "Lames aluminium isolées, intégration en coffres tunnel invisibles, commandes murales individuelles, compatibles domotique smartphone.",
  ),
];

export const MENTION_HORS_AIDES_OUSSARA =
  "Ce marché porte sur une construction neuve (TVA 20 %). Aucune aide MaPrimeRénov' ni CEE n'est chiffrée. Aides financières 2026 (estimation à titre indicatif) : non intégrées à ce devis. Toute aide sollicitée par ailleurs reste à valider selon les revenus réels du client et l'éligibilité en vigueur. Montants définitifs après instruction des organismes compétents. Clause Julia Protection Aides : responsabilité ENERGIA plafonnée à 2 000 € en cas d'écart > 10 % imputable à une erreur prouvée d'ENERGIA ; 0 % si erreur client ou décision ANAH/CEE.";

export const CLAUSE_NEUF_OUSSARA =
  "Régime fiscal : construction neuve, TVA au taux de 20 %. Le présent lot n'est pas un parcours MaPrimeRénov'. Les travaux de ce lot peuvent démarrer après signature et encaissement de l'acompte de 40 %.";

export const CLAUSE_ECHEANCIER_OUSSARA =
  "Échéancier d'appels de fonds : acompte 1 de 40 % à la commande ferme, acompte 2 de 40 % à la livraison du matériel et au démarrage de la pose, solde de 20 % à la réception sans réserve.";

export function euroOussara(n) {
  return Number(n)
    .toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/[\u00a0\u202f]/g, " ");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function lotsOussaraPourTravaux() {
  return POSTES_OUSSARA_DEVIS.map((posteLigne) => ({
    id: posteLigne.id,
    nom: posteLigne.nom,
    quantite: posteLigne.quantite,
    unite: posteLigne.unite,
    prixVentePuHt: 0,
    tauxTva: posteLigne.tauxTva,
    postes: [posteLigne.specifications],
    totalHt: 0,
    totalTva: 0,
    totalTtc: 0,
    ordre: posteLigne.ordreContractuel,
    ordreContractuel: posteLigne.ordreContractuel,
    puHt: 0,
    specifications: posteLigne.specifications,
    categorieId: "menuiseries",
    verrouillageOfficiel: true,
  }));
}

export function syntheseFinanciereOussara() {
  return { ...TOTAUX_OUSSARA, ...FINANCEMENT_OUSSARA, rib: RIB_OUSSARA };
}

export const PROJET_OUSSARA_DEFAUT = {
  id: OUSSARA_DOSSIER_ID,
  clientId: OUSSARA_CLIENT_ID,
  nom: CLIENT_OUSSARA.libelleSignature,
  prenom: CLIENT_OUSSARA.prenom,
  ville: CLIENT_OUSSARA.ville,
  codePostal: CLIENT_OUSSARA.codePostal,
  adresse: CLIENT_OUSSARA.adresse,
  telephone: "",
  email: "",
  rfr: null,
  statut: STATUT_OUSSARA,
  phase: PHASE_OUSSARA,
  priorite: "Avenant rectifié envoyé — acompte 40 % en attente",
  reference: OUSSARA_REFERENCE,
  numeroAuditMar: OUSSARA_REFERENCE,
  typeBien: CLIENT_OUSSARA.typeBien,
  typeProjet: TITRE_OUSSARA,
  categorie: CATEGORIE_OUSSARA,
  description: `${TITRE_OUSSARA}. Maîtres d'ouvrage ${CLIENT_OUSSARA.libelleSignature}. Chantier ${CLIENT_OUSSARA.adresse}. ${OUSSARA_DEVIS_NUMERO} (Avenant rectifié) du ${OUSSARA_DEVIS_DATE_LONGUE}, validité ${OUSSARA_DEVIS_VALIDITE_LIBELLE}. Brut ${euroOussara(TOTAUX_OUSSARA.totalHtBrut)} € HT, geste commercial de Direction −${euroOussara(TOTAUX_OUSSARA.gesteCommercialHt)} € HT, net ${euroOussara(TOTAUX_OUSSARA.totalHt)} € HT, TVA 20 % ${euroOussara(TOTAUX_OUSSARA.totalTva)} €, ${euroOussara(TOTAUX_OUSSARA.totalTtc)} € TTC. ${CLAUSE_ECHEANCIER_OUSSARA} ${MENTION_HORS_AIDES_OUSSARA} ${INTERLOCUTEUR_UNIQUE_OUSSARA}`,
  detailsTechniques: {
    regimeTva: CLIENT_OUSSARA.regimeTva,
    venteHtBrut: TOTAUX_OUSSARA.totalHtBrut,
    gesteCommercialHt: TOTAUX_OUSSARA.gesteCommercialHt,
    venteHt: TOTAUX_OUSSARA.totalHt,
    tva: TOTAUX_OUSSARA.totalTva,
    venteTtc: TOTAUX_OUSSARA.totalTtc,
    debourseDirectHt: null,
    fournitureHt: null,
    poseHt: null,
    margeBruteHt: null,
    tauxMarge: null,
  },
  horsAidesPubliques: true,
  source: "manuel",
  sourceLead: SOURCE_OUSSARA,
  createdAt: CLIENT_OUSSARA.dateCreation,
  apporteurId: SOURCE_APPORTEUR_DIRECT,
  apporteurNom: libelleSourceApporteur(SOURCE_APPORTEUR_DIRECT, { select: true }),
  etapeAnah: null,
  validationMar: false,
  acompte30Encaisse: false,
  dateVisiteTechnique: "",
  consultationDuo: false,
  statutCommission: STATUT_COMMISSION_EN_ATTENTE,
  detailJalon: PHASE_OUSSARA,
  equipe: EQUIPE_OUSSARA,
  commission_rate_default: 0,
  montantEstimeTtc: TOTAUX_OUSSARA.totalTtc,
  montantHt: TOTAUX_OUSSARA.totalHt,
  coutsTravauxHt: null,
  margeBruteHt: null,
  margeNetteEnergiaHt: null,
  travaux: lotsOussaraPourTravaux(),
  postesContractuels: POSTES_OUSSARA_DEVIS,
  lignes: POSTES_OUSSARA_DEVIS,
  travauxCoches: POSTES_OUSSARA_DEVIS,
  syntheseFinanciere: syntheseFinanciereOussara(),
  alertes: [CLAUSE_NEUF_OUSSARA, CLAUSE_ECHEANCIER_OUSSARA, MENTION_HORS_AIDES_OUSSARA],
};

/** Devis A4 signable — forfait, RIB, signature. Sans prix de revient ni interlocuteur commercial. */
export function htmlDevisOussara() {
  const lignes = POSTES_OUSSARA_DEVIS.map(
    (ligne) => `<tr>
      <td class="num">${ligne.ordreContractuel}</td>
      <td><strong>${escapeHtml(ligne.nom)}</strong><br><span class="detail">${escapeHtml(ligne.specifications)}</span></td>
    </tr>`,
  ).join("\n");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(OUSSARA_DEVIS_NUMERO)} | ENERGIA CONSEIL IA®</title>
  <style>
    :root { --encre: #0B1F3A; --bleu: #1a3c5e; --ligne: #d5e0ea; --fond: #f4f7fb; --orange: #f97316; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #e8eef4; color: var(--encre); font-family: "Segoe UI", Calibri, sans-serif; font-size: 11.5px; line-height: 1.4; }
    .barre { position: sticky; top: 0; display: flex; gap: 8px; justify-content: flex-end; padding: 8px 16px; background: #0b1f3a; }
    .barre button, .barre a { color: white; background: #1a3c5e; border: 1px solid #7dd3fc; border-radius: 8px; padding: 8px 12px; font-weight: 650; text-decoration: none; cursor: pointer; }
    .page { width: 210mm; min-height: 297mm; margin: 12px auto; background: white; padding: 12mm 13mm 14mm; box-shadow: 0 8px 28px rgba(11,31,58,.12); }
    header { display: grid; grid-template-columns: 58mm 1fr; gap: 8px 12px; align-items: start; border-bottom: 3px solid var(--bleu); padding-bottom: 8px; }
    header img { width: 54mm; height: auto; }
    h1 { margin: 0; font-size: 13px; letter-spacing: .01em; color: var(--bleu); }
    .meta { margin: 2px 0 0; font-size: 10px; color: #334155; }
    h2 { margin: 14px 0 6px; font-size: 12.5px; color: var(--bleu); text-transform: uppercase; letter-spacing: .03em; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid var(--ligne); padding: 5px 7px; vertical-align: top; }
    th { background: var(--bleu); color: white; text-align: left; font-size: 10.5px; }
    td.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
    .detail { color: #475569; font-size: 10px; }
    .bilan td:first-child { width: 72%; }
    .net { background: #f0fdf4; font-weight: 750; }
    .geste { color: #9a3412; }
    .rib { border: 2px solid var(--bleu); background: var(--fond); padding: 10px 12px; }
    .rib strong { color: var(--bleu); }
    .iban { font-family: Consolas, "Courier New", monospace; font-size: 13px; letter-spacing: .02em; }
    .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; }
    .cadre { border: 1px dashed #94a3b8; min-height: 34mm; padding: 8px; }
    .mention { font-family: "Segoe Script", "Segoe Print", cursive; font-size: 14px; color: #1e3a5f; }
    .julia { background: #fff7ed; border-left: 4px solid var(--orange); padding: 8px 10px; }
    .avert { font-size: 10px; color: #334155; }
    @media print {
      body { background: white; }
      .barre { display: none; }
      .page { margin: 0; box-shadow: none; width: auto; min-height: auto; }
    }
  </style>
</head>
<body>
  <div class="barre">
    <button type="button" onclick="window.print()">Imprimer le Devis</button>
    <a href="${CHEMIN_PDF_OUSSARA}" download>Télécharger le Devis Officiel PDF A4</a>
  </div>
  <article class="page">
    <header>
      <img src="${LOGO_ARBRES_OUSSARA}" alt="ENERGIA CONSEIL IA — trois arbres verts">
      <div>
        <h1>${escapeHtml(RAISON_SOCIALE_OUSSARA)}</h1>
        <p class="meta">${escapeHtml(SIEGE_OUSSARA)}</p>
        <p class="meta">${escapeHtml(IDENTITE_FISCALE_OUSSARA)}</p>
        <p class="meta">${escapeHtml(MENTION_INPI_OUSSARA)}</p>
        <p class="meta">${escapeHtml(ASSURANCE_DECENNALE_OUSSARA)}</p>
        <p class="meta">${escapeHtml(MENTION_CERTIBAT_OUSSARA)}</p>
        <p class="meta"><strong>${escapeHtml(INTERLOCUTEUR_UNIQUE_OUSSARA)}</strong></p>
      </div>
    </header>

    <h2>Identité du client</h2>
    <table>
      <tr><th>Maîtres d'ouvrage</th><td>${escapeHtml(CLIENT_OUSSARA.libelleSignature)}</td></tr>
      <tr><th>Projet</th><td>${escapeHtml(TITRE_OUSSARA)}</td></tr>
      <tr><th>Adresse du chantier</th><td>${escapeHtml(CLIENT_OUSSARA.adresse)}</td></tr>
      <tr><th>Référence</th><td>${escapeHtml(OUSSARA_DEVIS_NUMERO)} (Avenant rectifié)</td></tr>
      <tr><th>Date</th><td>${escapeHtml(OUSSARA_DEVIS_DATE_LONGUE)} — Validité : ${escapeHtml(OUSSARA_DEVIS_VALIDITE_LIBELLE)}</td></tr>
      <tr><th>Interlocuteur unique</th><td>${escapeHtml(INTERLOCUTEUR_UNIQUE_OUSSARA)}</td></tr>
    </table>

    <h2>Détail des postes techniques</h2>
    <p class="avert">Forfait unique. Les quatorze postes ci-dessous sont inclus dans le montant net, sans prix unitaire séparé.</p>
    <table>
      <thead><tr><th style="width:14mm">N°</th><th>Désignation</th></tr></thead>
      <tbody>
        ${lignes}
      </tbody>
    </table>

    <h2>Récapitulatif financier</h2>
    <table class="bilan">
      <tr><td>Montant total des travaux HT</td><td class="num">${euroOussara(TOTAUX_OUSSARA.totalHtBrut)} € HT</td></tr>
      <tr class="geste"><td>Geste commercial exceptionnel de Direction</td><td class="num">− ${euroOussara(TOTAUX_OUSSARA.gesteCommercialHt)} € HT</td></tr>
      <tr><td>Montant total net HT</td><td class="num">${euroOussara(TOTAUX_OUSSARA.totalHt)} € HT</td></tr>
      <tr><td>TVA applicable 20 % (construction neuve)</td><td class="num">${euroOussara(TOTAUX_OUSSARA.totalTva)} €</td></tr>
      <tr class="net"><td>Montant total net TTC</td><td class="num">${euroOussara(TOTAUX_OUSSARA.totalTtc)} € TTC</td></tr>
    </table>

    <h2>Échéancier d'appels de fonds</h2>
    <table class="bilan">
      <tr><td>${escapeHtml(FINANCEMENT_OUSSARA.libelleAcompte)}</td><td class="num">${euroOussara(FINANCEMENT_OUSSARA.acompte)} € TTC</td></tr>
      <tr><td>${escapeHtml(FINANCEMENT_OUSSARA.libelleIntermediaire)}</td><td class="num">${euroOussara(FINANCEMENT_OUSSARA.intermediaire)} € TTC</td></tr>
      <tr><td>${escapeHtml(FINANCEMENT_OUSSARA.libelleSolde)}</td><td class="num">${euroOussara(FINANCEMENT_OUSSARA.solde)} € TTC</td></tr>
    </table>
    <p class="avert">${escapeHtml(CLAUSE_NEUF_OUSSARA)} ${escapeHtml(MENTION_HORS_AIDES_OUSSARA)}</p>

    <h2>Coordonnées bancaires — virement de l'acompte</h2>
    <div class="rib">
      <p><strong>Titulaire du compte :</strong> ${escapeHtml(RIB_OUSSARA.titulaire)}</p>
      <p><strong>Établissement bancaire :</strong> ${escapeHtml(RIB_OUSSARA.banque)} (${escapeHtml(RIB_OUSSARA.adresseBanque)})</p>
      <p><strong>IBAN :</strong> <span class="iban">${escapeHtml(RIB_OUSSARA.iban)}</span></p>
      <p><strong>Code BIC / SWIFT :</strong> <span class="iban">${escapeHtml(RIB_OUSSARA.bic)}</span></p>
      <p>${escapeHtml(RIB_OUSSARA.mention)}</p>
    </div>

    <h2>Cadre de validation et signature</h2>
    <p>Le maître d'ouvrage porte la mention manuscrite <strong>Bon pour accord et commande ferme</strong>, date et signe. ENERGIA CONSEIL IA® appose son cachet.</p>
    <div class="sign">
      <div class="cadre">
        <p class="mention">Bon pour accord et commande ferme</p>
        <p>Fait à ________________, le ________________</p>
        <p>Signature du client<br>${escapeHtml(CLIENT_OUSSARA.libelleSignature)}</p>
      </div>
      <div class="cadre">
        <p><strong>Cachet officiel ENERGIA CONSEIL IA®</strong></p>
        <p>${escapeHtml(INTERLOCUTEUR_UNIQUE_OUSSARA)}</p>
      </div>
    </div>

    <h2>Avis juridique</h2>
    <div class="julia">
      <p>Conformité : artisans RGE, TVA 20 % construction neuve, forfait menuiseries et volets, échéancier 40 / 40 / 20, validité 30 jours. Aucune aide publique n'est déduite de ce devis.</p>
      <p>${escapeHtml(MENTION_HORS_AIDES_OUSSARA)}</p>
      <p>Avis établi sous la responsabilité de Julia, juriste ENERGIA CONSEIL IA® — ${escapeHtml(OUSSARA_DEVIS_DATE_LONGUE)}.</p>
    </div>

    <h2>Contacts du projet</h2>
    <ul>
      <li>${escapeHtml(INTERLOCUTEUR_UNIQUE_OUSSARA)}</li>
      <li>Courtier financement : FABIEN — VIVONS COURTIER — 06 71 19 96 45</li>
      <li>Juriste : Julia</li>
      <li>MAR : Antoine BARATIER – Cabinet C2ET</li>
    </ul>
    <p class="avert">Données traitées pour la gestion du projet. Conservation 5 ans. Droits : contact@energia-conseil-ia.com. Réclamation possible auprès de la CNIL.</p>
  </article>
</body>
</html>`;
}
