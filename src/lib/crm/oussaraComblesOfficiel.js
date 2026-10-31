/**
 * Devis M. et Mme Youssef OUSSARA — lot isolation des combles perdus.
 * DEV-2026-OUSSARA-COMBLES-01 : 1 400,00 € HT, TVA 20 % 280,00 €, 1 680,00 € TTC.
 * Forfait : aucun prix unitaire n'est réparti sur les cinq postes.
 * RIB : compte Qonto déjà enregistré (clé IBAN valide).
 */

import {
  SOURCE_APPORTEUR_DIRECT,
  STATUT_COMMISSION_EN_ATTENTE,
  libelleSourceApporteur,
} from "./operationnelCrm.js";
import { INPI_MARQUE, RIB_QONTO } from "./paradesAntiFuite.js";

export const OUSSARA_COMBLES_DOSSIER_ID = "DOS-2026-OUSSARA-COMBLES-01";
export const OUSSARA_COMBLES_CLIENT_ID = "CL-2026-OUSSARA";
export const OUSSARA_COMBLES_REFERENCE = "DEV-2026-OUSSARA-COMBLES-01";
export const OUSSARA_COMBLES_DEVIS_NUMERO = "DEV-2026-OUSSARA-COMBLES-01";
export const OUSSARA_COMBLES_DATE = "2026-10-30";
export const OUSSARA_COMBLES_DATE_LONGUE = "30 octobre 2026";
export const OUSSARA_COMBLES_VALIDITE = "29 novembre 2026";
export const OUSSARA_COMBLES_VALIDITE_LIBELLE = "30 jours — jusqu'au 29 novembre 2026";
export const NOM_FICHIER_DEVIS_OUSSARA_COMBLES = "DEVIS_OUSSARA_COMBLES_2026.html";
export const NOM_FICHIER_PDF_OUSSARA_COMBLES = "DEVIS_OUSSARA_COMBLES_2026.pdf";
export const CHEMIN_DEVIS_OUSSARA_COMBLES = `/${NOM_FICHIER_DEVIS_OUSSARA_COMBLES}`;
export const CHEMIN_PDF_OUSSARA_COMBLES = `/${NOM_FICHIER_PDF_OUSSARA_COMBLES}`;
export const LOGO_ARBRES_OUSSARA_COMBLES = "/assets/energia-logo-arbres.png";

export const ASSURANCE_DECENNALE_OUSSARA_COMBLES = "Décennale Calypso Assurances n° LUNPIB2604975";
export const MENTION_INPI_OUSSARA_COMBLES = `Marque déposée INPI n° ${INPI_MARQUE}`;
export const RAISON_SOCIALE_OUSSARA_COMBLES =
  "ENERGIA CONSEIL IA® — Bureau d'Études Thermiques & Contractant Général Digital";
export const SIEGE_OUSSARA_COMBLES =
  "SASU au capital de 100 € — 16 Rue Cuvier, 69006 Lyon — SIRET 941 819 427 00019";

export const STATUT_OUSSARA_COMBLES =
  "Devis DEV-2026-OUSSARA-COMBLES-01 envoyé — En attente acompte 40%";
export const PHASE_OUSSARA_COMBLES = "Devis combles envoyé — acompte 40 % en attente";
export const CATEGORIE_OUSSARA_COMBLES = "Isolation & Menuiseries";
export const SOURCE_OUSSARA_COMBLES = "Client direct — ENERGIA CONSEIL IA®";
export const TITRE_OUSSARA_COMBLES =
  "Lot Isolation Thermique des Combles Perdus RE2020 — 49 m²";

export const CLIENT_OUSSARA_COMBLES = {
  clientId: OUSSARA_COMBLES_CLIENT_ID,
  civilite: "M. et Mme",
  nom: "OUSSARA",
  prenom: "Youssef",
  libelleSignature: "M. et Mme Youssef OUSSARA",
  adresse: "Rue des Verchères, 69124 COLOMBIER SAUGNIEU",
  rue: "Rue des Verchères",
  ville: "COLOMBIER SAUGNIEU",
  codePostal: "69124",
  typeBien: "Maison individuelle en construction neuve RE2020",
  regimeTva: "TVA 20 % — construction neuve",
};

export const INTERLOCUTEUR_UNIQUE_OUSSARA_COMBLES =
  "Interlocuteur Unique : Sylvain LEMBELEMBE (06 10 59 68 98 — contact@renovoptim-ia.com)";

export const EQUIPE_OUSSARA_COMBLES = {
  commercial: null,
  direction: "Sylvain LEMBELEMBE",
  interlocuteurUnique: INTERLOCUTEUR_UNIQUE_OUSSARA_COMBLES,
  apporteur: "Client direct — ENERGIA CONSEIL IA®",
  titulaireMarche: "ENERGIA CONSEIL IA® (Contractant Général)",
  coordination: INTERLOCUTEUR_UNIQUE_OUSSARA_COMBLES,
  assuranceDecennale: ASSURANCE_DECENNALE_OUSSARA_COMBLES,
  juriste: "Julia",
  mar: "Antoine BARATIER – Cabinet C2ET",
  courtier: "FABIEN – VIVONS COURTIER",
};

export const TOTAUX_OUSSARA_COMBLES = {
  surfaceM2: 49,
  totalHt: 1400,
  totalTva: 280,
  totalTtc: 1680,
  tauxTva: 0.2,
  coutsTravauxHt: null,
  margeBruteHt: null,
};

export const FINANCEMENT_OUSSARA_COMBLES = {
  acompte: 672,
  solde: 1008,
  resteACharge: 1680,
  libelleAcompte: "Acompte à la commande (40 %)",
  libelleSolde: "Solde à l'achèvement des travaux (60 %)",
};

export const RIB_OUSSARA_COMBLES = {
  titulaire: RIB_QONTO.titulaire,
  banque: RIB_QONTO.banque,
  adresseBanque: RIB_QONTO.adresseBanque,
  iban: RIB_QONTO.iban,
  bic: RIB_QONTO.bic,
  referenceVirement: "DEV-OUSSARA-COMBLES",
  mention: "Merci d'indiquer la référence 'DEV-OUSSARA-COMBLES' dans le libellé de votre virement d'acompte.",
};

function poste(ordre, id, nom, specifications) {
  return {
    id: `oussara-combles-${id}`,
    ordreContractuel: ordre,
    nom,
    specifications,
    quantite: ordre === 4 ? 49 : 1,
    unite: ordre === 4 ? "m²" : "forfait",
    puHt: 0,
    tauxTva: 0.2,
    totalHt: 0,
    totalTva: 0,
    totalTtc: 0,
  };
}

export const POSTES_OUSSARA_COMBLES = [
  poste(
    1,
    "preparation",
    "Préparation de la zone, repérage et protection thermique des boîtiers électriques et conduits de ventilation",
    "Repérage des points singuliers avant soufflage. Protection thermique des boîtiers électriques et des conduits de ventilation.",
  ),
  poste(
    2,
    "trappe",
    "Cadre d'entourage rigide en bois autour de la trappe d'accès et joint d'étanchéité à l'air",
    "Entourage rigide en bois de la trappe d'accès, avec joint d'étanchéité à l'air.",
  ),
  poste(
    3,
    "piges",
    "Piges graduées de contrôle visuel d'épaisseur réglementaires RE2020",
    "Piges laissées en place pour le contrôle visuel de l'épaisseur après soufflage.",
  ),
  poste(
    4,
    "soufflage",
    "Fourniture et soufflage mécanisé pneumatique de laine minérale certifiée ACERMI — 49,00 m²",
    "R supérieur ou égal à 7,50 m².K/W. Épaisseur minimale 350 mm après tassement. Plancher de comble perdu.",
  ),
  poste(
    5,
    "attestation",
    "Fiche de contrôle et attestation de conformité RE2020 / Garantie décennale 10 ans",
    "Fiche de contrôle d'épaisseur et attestation de conformité RE2020. Garantie décennale 10 ans.",
  ),
];

export const MENTION_HORS_AIDES_OUSSARA_COMBLES =
  "Ce lot porte sur une construction neuve (TVA 20 %). Aucune aide MaPrimeRénov' ni CEE n'est déduite. Aides financières 2026 (estimation à titre indicatif) : non intégrées à ce devis. Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE. Clause Julia Protection Aides : responsabilité ENERGIA plafonnée à 2 000 € en cas d'écart > 10 % imputable à une erreur prouvée d'ENERGIA ; 0 % si erreur client ou décision ANAH/CEE.";

export function euroOussaraCombles(n) {
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

export function lotsOussaraComblesPourTravaux() {
  return POSTES_OUSSARA_COMBLES.map((ligne) => ({
    id: ligne.id,
    nom: ligne.nom,
    quantite: ligne.quantite,
    unite: ligne.unite,
    prixVentePuHt: 0,
    tauxTva: ligne.tauxTva,
    postes: [ligne.specifications],
    totalHt: 0,
    specifications: ligne.specifications,
    ordre: ligne.ordreContractuel,
    categorieId: "isolation",
    verrouillageOfficiel: true,
  }));
}

export const PROJET_OUSSARA_COMBLES_DEFAUT = {
  id: OUSSARA_COMBLES_DOSSIER_ID,
  clientId: OUSSARA_COMBLES_CLIENT_ID,
  nom: `${CLIENT_OUSSARA_COMBLES.libelleSignature} — Combles`,
  prenom: CLIENT_OUSSARA_COMBLES.prenom,
  ville: CLIENT_OUSSARA_COMBLES.ville,
  codePostal: CLIENT_OUSSARA_COMBLES.codePostal,
  adresse: CLIENT_OUSSARA_COMBLES.adresse,
  telephone: "",
  email: "",
  rfr: null,
  statut: STATUT_OUSSARA_COMBLES,
  phase: PHASE_OUSSARA_COMBLES,
  priorite: PHASE_OUSSARA_COMBLES,
  reference: OUSSARA_COMBLES_REFERENCE,
  numeroAuditMar: OUSSARA_COMBLES_REFERENCE,
  typeBien: CLIENT_OUSSARA_COMBLES.typeBien,
  typeProjet: TITRE_OUSSARA_COMBLES,
  categorie: CATEGORIE_OUSSARA_COMBLES,
  description: `${TITRE_OUSSARA_COMBLES}. Maîtres d'ouvrage ${CLIENT_OUSSARA_COMBLES.libelleSignature}. Chantier ${CLIENT_OUSSARA_COMBLES.adresse}. ${OUSSARA_COMBLES_DEVIS_NUMERO} du ${OUSSARA_COMBLES_DATE_LONGUE}. Fourniture et pose ${euroOussaraCombles(TOTAUX_OUSSARA_COMBLES.totalHt)} € HT, TVA 20 % ${euroOussaraCombles(TOTAUX_OUSSARA_COMBLES.totalTva)} €, ${euroOussaraCombles(TOTAUX_OUSSARA_COMBLES.totalTtc)} € TTC. Acompte 40 % ${euroOussaraCombles(FINANCEMENT_OUSSARA_COMBLES.acompte)} € TTC, solde 60 % ${euroOussaraCombles(FINANCEMENT_OUSSARA_COMBLES.solde)} € TTC. ${MENTION_HORS_AIDES_OUSSARA_COMBLES} ${INTERLOCUTEUR_UNIQUE_OUSSARA_COMBLES}`,
  horsAidesPubliques: true,
  source: "manuel",
  sourceLead: SOURCE_OUSSARA_COMBLES,
  createdAt: OUSSARA_COMBLES_DATE,
  apporteurId: SOURCE_APPORTEUR_DIRECT,
  apporteurNom: libelleSourceApporteur(SOURCE_APPORTEUR_DIRECT, { select: true }),
  etapeAnah: null,
  validationMar: false,
  acompte30Encaisse: false,
  dateVisiteTechnique: "",
  consultationDuo: false,
  statutCommission: STATUT_COMMISSION_EN_ATTENTE,
  detailJalon: PHASE_OUSSARA_COMBLES,
  equipe: EQUIPE_OUSSARA_COMBLES,
  commission_rate_default: 0,
  montantEstimeTtc: TOTAUX_OUSSARA_COMBLES.totalTtc,
  montantHt: TOTAUX_OUSSARA_COMBLES.totalHt,
  coutsTravauxHt: null,
  margeBruteHt: null,
  travaux: lotsOussaraComblesPourTravaux(),
  syntheseFinanciere: { ...TOTAUX_OUSSARA_COMBLES, ...FINANCEMENT_OUSSARA_COMBLES },
  alertes: [MENTION_HORS_AIDES_OUSSARA_COMBLES],
};

export function htmlDevisOussaraCombles() {
  const lignes = POSTES_OUSSARA_COMBLES.map(
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
  <title>${escapeHtml(OUSSARA_COMBLES_DEVIS_NUMERO)} | ENERGIA CONSEIL IA®</title>
  <style>
    :root { --encre: #0B1F3A; --bleu: #1a3c5e; --ligne: #d5e0ea; --fond: #f4f7fb; --orange: #f97316; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #e8eef4; color: var(--encre); font-family: "Segoe UI", Calibri, sans-serif; font-size: 12px; line-height: 1.4; }
    .barre { position: sticky; top: 0; display: flex; gap: 8px; justify-content: flex-end; padding: 8px 16px; background: #0b1f3a; }
    .barre button, .barre a { color: white; background: #1a3c5e; border: 1px solid #7dd3fc; border-radius: 8px; padding: 8px 12px; font-weight: 650; text-decoration: none; cursor: pointer; }
    .page { width: 210mm; min-height: 297mm; margin: 12px auto; background: white; padding: 12mm 14mm 16mm; box-shadow: 0 8px 28px rgba(11,31,58,.12); }
    header { display: grid; grid-template-columns: 58mm 1fr; gap: 10px 14px; align-items: start; border-bottom: 3px solid var(--bleu); padding-bottom: 10px; }
    header img { width: 54mm; height: auto; }
    h1 { margin: 0; font-size: 14px; color: var(--bleu); }
    .meta { margin: 2px 0 0; font-size: 11px; color: #334155; }
    h2 { margin: 14px 0 6px; font-size: 12.5px; color: var(--bleu); text-transform: uppercase; letter-spacing: .03em; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid var(--ligne); padding: 6px 8px; vertical-align: top; }
    th { background: var(--bleu); color: white; text-align: left; }
    td.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
    .detail { color: #475569; font-size: 11px; }
    .net { background: #f0fdf4; font-weight: 750; }
    .rib { border: 2px solid var(--bleu); background: var(--fond); padding: 10px 12px; }
    .iban { font-family: Consolas, "Courier New", monospace; font-size: 13px; }
    .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cadre { border: 1px dashed #94a3b8; min-height: 32mm; padding: 8px; }
    .mention { font-family: "Segoe Script", "Segoe Print", cursive; font-size: 15px; }
    .julia { background: #fff7ed; border-left: 4px solid var(--orange); padding: 8px 10px; }
    .avert { font-size: 10.5px; color: #334155; }
    .barre { flex-wrap: wrap; align-items: center; }
    .barre button.st { margin-right: auto; background: #9a3412; border-color: #fdba74; }
    body.mode-st .barre button.st { background: #166534; border-color: #86efac; }
    .note-st { display: none; margin: 2px 0 4px; }
    body.mode-st .note-st { display: block; }
    .bandeau-st, .encadre-st, .sign-st { display: none; }
    .bandeau-st { margin: 10px 0 0; padding: 8px 10px; background: #fff7ed; border-left: 4px solid var(--orange); font-weight: 700; color: #9a3412; }
    .bandeau-st .bdc-titre { margin: 0; font-size: 11px; letter-spacing: .01em; }
    .bandeau-st .bdc-num { margin: 2px 0 0; }
    .encadre-st { margin-top: 14px; border: 2px solid var(--bleu); background: #f8fafc; padding: 10px 12px; page-break-inside: avoid; }
    .encadre-st h2 { margin-top: 0; }
    .encadre-st .ligne-contrat { margin: 8px 0; padding: 8px 10px; background: #f0fdf4; border-left: 4px solid #16a34a; font-weight: 750; }
    .encadre-st .exigence { margin: 8px 0 0; padding: 8px 10px; background: #fff7ed; border-left: 4px solid var(--orange); font-weight: 650; }
    body.mode-st .prix-vente,
    body.mode-st .col-prix,
    body.mode-st th.prix,
    body.mode-st td.prix,
    body.mode-st .hors-st { display: none !important; }
    body.mode-st .bandeau-st,
    body.mode-st .encadre-st,
    body.mode-st .sign-st { display: block; }
    body.mode-st .page { padding: 6mm 8mm 5mm; font-size: 10px; line-height: 1.22; }
    body.mode-st h1 { font-size: 12px; }
    body.mode-st h2 { margin: 5px 0 2px; font-size: 11px; }
    body.mode-st .meta { font-size: 9px; }
    body.mode-st header { gap: 4px 8px; padding-bottom: 4px; }
    body.mode-st header img { width: 40mm; }
    body.mode-st th, body.mode-st td { padding: 2px 5px; }
    body.mode-st .detail { font-size: 9.5px; }
    body.mode-st .bandeau-st { margin: 3px 0 0; padding: 3px 7px; font-size: 9.5px; }
    body.mode-st .encadre-st { margin-top: 5px; padding: 6px 8px; }
    body.mode-st .encadre-st p,
    body.mode-st .encadre-st .ligne-contrat,
    body.mode-st .encadre-st .exigence { margin: 3px 0; }
    body.mode-st .sign { gap: 8px; margin-top: 4px; }
    body.mode-st .sign-st .cadre { min-height: 22mm; padding: 6px; }
    @media print {
      @page { margin: 8mm 10mm; size: A4 portrait; }
      body { background: white; }
      .barre { display: none; }
      .page { margin: 0; box-shadow: none; width: auto; min-height: auto; }
      body.mode-st .prix-vente,
      body.mode-st .col-prix,
      body.mode-st th.prix,
      body.mode-st td.prix,
      body.mode-st .hors-st { display: none !important; }
      body.mode-st .bandeau-st,
      body.mode-st .encadre-st,
      body.mode-st .sign-st,
      body.mode-st .note-st { display: block !important; }
      body.mode-st .page { padding: 0; }
      body.mode-st .encadre-st,
      body.mode-st .sign-st,
      body.mode-st tr { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="barre">
    <button type="button" class="st" id="btn-st" aria-pressed="false" onclick="basculerSousTraitant()">👷‍♂️ Version Consultation Sous-Traitant (Sans prix de vente)</button>
    <button type="button" onclick="window.print()">Imprimer le Devis</button>
    <a href="${CHEMIN_PDF_OUSSARA_COMBLES}" download>Télécharger le Devis Officiel PDF A4</a>
  </div>
  <article class="page">
    <header>
      <img src="${LOGO_ARBRES_OUSSARA_COMBLES}" alt="ENERGIA CONSEIL IA — trois arbres verts">
      <div>
        <h1>${escapeHtml(RAISON_SOCIALE_OUSSARA_COMBLES)}</h1>
        <p class="meta">${escapeHtml(SIEGE_OUSSARA_COMBLES)}</p>
        <p class="meta">${escapeHtml(ASSURANCE_DECENNALE_OUSSARA_COMBLES)} — ${escapeHtml(MENTION_INPI_OUSSARA_COMBLES)}</p>
        <p class="meta"><strong>${escapeHtml(INTERLOCUTEUR_UNIQUE_OUSSARA_COMBLES)}</strong></p>
      </div>
    </header>

    <div class="bandeau-st">
      <p class="bdc-titre">BON DE COMMANDE DE SOUS-TRAITANCE — MARCHÉ FORFAITAIRE FOURNITURE &amp; POSE</p>
      <p class="bdc-num">Numéro : BDC-ST-2026-OUSSARA-ISO-01</p>
    </div>

    <h2>Identité du client</h2>
    <table>
      <tr><th>Client</th><td>${escapeHtml(CLIENT_OUSSARA_COMBLES.libelleSignature)}</td></tr>
      <tr><th>Chantier</th><td>${escapeHtml(CLIENT_OUSSARA_COMBLES.adresse)}</td></tr>
      <tr><th>Référence</th><td>${escapeHtml(OUSSARA_COMBLES_DEVIS_NUMERO)}</td></tr>
      <tr><th>Date</th><td>${escapeHtml(OUSSARA_COMBLES_DATE_LONGUE)} — Validité : ${escapeHtml(OUSSARA_COMBLES_VALIDITE_LIBELLE)}</td></tr>
      <tr><th>Objet</th><td>${escapeHtml(TITRE_OUSSARA_COMBLES)}</td></tr>
      <tr><th>Interlocuteur unique</th><td>${escapeHtml(INTERLOCUTEUR_UNIQUE_OUSSARA_COMBLES)}</td></tr>
    </table>

    <h2>Détail des prestations techniques</h2>
    <p class="avert hors-st">Forfait unique de fourniture et de pose. Les cinq postes sont inclus dans le montant HT, sans prix unitaire séparé. Isolation des combles en premier, avant les lots de chauffage.</p>
    <p class="avert note-st">Isolation des combles en premier, avant les lots de chauffage. Prix de vente client inclus dans le marché forfaitaire — non communiqué.</p>
    <table>
      <thead><tr><th style="width:14mm">N°</th><th>Désignation</th></tr></thead>
      <tbody>${lignes}</tbody>
    </table>

    <aside class="encadre-st" aria-label="Marché de sous-traitance">
      <h2>Marché de sous-traitance</h2>
      <p><strong>Prestation confiée :</strong> Fourniture de laine minérale certifiée ACERMI (résistance thermique R ≥ 7,50 m²·K/W) et soufflage mécanisé sur 49 m² de combles perdus, incluant cadre de trappe isolé, piges de mesure certifiées RE2020 et repérage des boîtiers électriques.</p>
      <p class="ligne-contrat">Montant forfaitaire arrêté (fourniture &amp; pose) : 1 000,00 € HT (TVA 20 % : 200,00 € | Total TTC : 1 200,00 €).</p>
      <p><strong>Règlement :</strong> 100 % à réception des travaux sans réserve.</p>
      <p class="exigence">Assurance décennale obligatoire.</p>
    </aside>

    <section class="sign-st">
      <h2>Signatures</h2>
      <div class="sign">
        <div class="cadre">
          <p><strong>L'Artisan Sous-Traitant</strong></p>
          <p>Bon pour commande Fourniture et Pose</p>
          <p>Date et signature</p>
        </div>
        <div class="cadre">
          <p><strong>Pour ENERGIA CONSEIL IA®</strong></p>
          <p>Sylvain LEMBELEMBE</p>
        </div>
      </div>
    </section>

    <div class="hors-st">
    <section class="prix-vente">
    <h2>Montants</h2>
    <table>
      <tr><td>Montant total fourniture et pose HT</td><td class="num">${euroOussaraCombles(TOTAUX_OUSSARA_COMBLES.totalHt)} € HT</td></tr>
      <tr><td>TVA applicable 20 %</td><td class="num">${euroOussaraCombles(TOTAUX_OUSSARA_COMBLES.totalTva)} €</td></tr>
      <tr class="net"><td>Total net TTC client</td><td class="num">${euroOussaraCombles(TOTAUX_OUSSARA_COMBLES.totalTtc)} € TTC</td></tr>
    </table>
    </section>

    <section class="prix-vente">
    <h2>Règlement</h2>
    <table>
      <tr><td>${escapeHtml(FINANCEMENT_OUSSARA_COMBLES.libelleAcompte)}</td><td class="num">${euroOussaraCombles(FINANCEMENT_OUSSARA_COMBLES.acompte)} € TTC</td></tr>
      <tr><td>${escapeHtml(FINANCEMENT_OUSSARA_COMBLES.libelleSolde)}</td><td class="num">${euroOussaraCombles(FINANCEMENT_OUSSARA_COMBLES.solde)} € TTC</td></tr>
    </table>
    </section>

    <h2>Coordonnées bancaires</h2>
    <div class="rib">
      <p><strong>Titulaire :</strong> ${escapeHtml(RIB_OUSSARA_COMBLES.titulaire)}</p>
      <p><strong>Banque :</strong> ${escapeHtml(RIB_OUSSARA_COMBLES.banque)} (${escapeHtml(RIB_OUSSARA_COMBLES.adresseBanque)})</p>
      <p><strong>IBAN :</strong> <span class="iban">${escapeHtml(RIB_OUSSARA_COMBLES.iban)}</span></p>
      <p><strong>BIC :</strong> <span class="iban">${escapeHtml(RIB_OUSSARA_COMBLES.bic)}</span></p>
      <p>Libellé : <strong>${escapeHtml(RIB_OUSSARA_COMBLES.referenceVirement)}</strong>. ${escapeHtml(RIB_OUSSARA_COMBLES.mention)}</p>
    </div>

    <h2>Signature</h2>
    <p>Mention manuscrite : <strong>Bon pour accord et commande ferme</strong>.</p>
    <div class="sign">
      <div class="cadre">
        <p class="mention">Bon pour accord et commande ferme</p>
        <p>Fait à ________________, le ________________</p>
        <p>Signature du client<br>${escapeHtml(CLIENT_OUSSARA_COMBLES.libelleSignature)}</p>
      </div>
      <div class="cadre">
        <p><strong>Cachet officiel ENERGIA CONSEIL IA®</strong></p>
        <p>${escapeHtml(INTERLOCUTEUR_UNIQUE_OUSSARA_COMBLES)}</p>
      </div>
    </div>

    <h2>Avis juridique</h2>
    <div class="julia">
      <p>Conformité : laine minérale certifiée ACERMI, R ≥ 7,50 m².K/W, épaisseur minimale 350 mm après tassement sur 49,00 m², TVA 20 % construction neuve, échéancier 40 / 60, validité 30 jours.</p>
      <p>${escapeHtml(MENTION_HORS_AIDES_OUSSARA_COMBLES)}</p>
      <p>Avis établi sous la responsabilité de Julia, juriste ENERGIA CONSEIL IA® — ${escapeHtml(OUSSARA_COMBLES_DATE_LONGUE)}.</p>
    </div>
    <p class="avert">${escapeHtml(INTERLOCUTEUR_UNIQUE_OUSSARA_COMBLES)}. Courtier : FABIEN — VIVONS COURTIER — 06 71 19 96 45. Juriste : Julia. MAR : Antoine BARATIER – Cabinet C2ET.</p>
    </div>
  </article>
  <script>
    function appliquerModeSousTraitant(actif) {
      document.body.classList.toggle("mode-st", actif);
      var bouton = document.getElementById("btn-st");
      if (!bouton) return;
      bouton.setAttribute("aria-pressed", actif ? "true" : "false");
      bouton.textContent = actif
        ? "👷‍♂️ Consultation sous-traitant active — revenir au devis client"
        : "👷‍♂️ Version Consultation Sous-Traitant (Sans prix de vente)";
    }
    function basculerSousTraitant() {
      appliquerModeSousTraitant(!document.body.classList.contains("mode-st"));
    }
    (function () {
      var params = new URLSearchParams(window.location.search);
      if (params.get("st") === "1") appliquerModeSousTraitant(true);
    })();
  </script>
</body>
</html>`;
}
