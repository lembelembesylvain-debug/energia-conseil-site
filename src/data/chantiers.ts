/**
 * Dossiers chantier du CRM — contractant général ENERGIA CONSEIL IA®.
 * Abdenabi (Strasbourg) : devis client, bon de commande sous-traitance et commission apporteur
 * sont trois pièces cloisonnées. Aucun prix de vente client ne figure sur le BDC.
 */

export const ABDENABI_ID = "DOSSIER-2026-ABDENABI-STRASBOURG";

export const ABDENABI_DEVIS = "DEV-2026-ABDENABI-01";
export const ABDENABI_BDC = "BDC-2026-ST-STRASBOURG-01";
export const ABDENABI_FACTURE = "FA-2026-STRASBOURG-01";
export const ABDENABI_DATE_ISO = "2026-10-18";
export const ABDENABI_FICHE_COMMISSION = "CONV-JAMEL-ABDENABI";
export const ABDENABI_CONVENTION = "CONV-2026-ENERGETHIQUE-JAMEL-HAMZAOUI";

export const ABDENABI_VENTE_HT = 2625;
export const ABDENABI_TVA_TAUX = 20;
export const ABDENABI_TVA_MONTANT = 525;
export const ABDENABI_VENTE_TTC = 3150;
export const ABDENABI_ACOMPTE_TTC = 945;
export const ABDENABI_SOLDE_TTC = 2205;
export const ABDENABI_ST_HT = 2100;
export const ABDENABI_CLIENT = "Monsieur Abdenabi BELOUCIF";
export const ABDENABI_CLIENT_FACTURE = "Abdenabi BELOUCIF";
export const ABDENABI_CLIENT_BDC = "M. Abdenabi BELOUCIF";
export const ABDENABI_TELEPHONE = "03 69 74 59 70";
export const ABDENABI_TELEPHONE_LIBELLE = "03 69 74 59 70 (ou via Jamel)";
export const ABDENABI_SOUS_TRAITANT = "HOLDING TRAVAUX SAS (Mohamed BENAOUDA)";
export const ABDENABI_CORPS_ETAT = "Plomberie / Génie Climatique";
export const ABDENABI_CONTACT_MOMO = "Momo — direction des travaux (06 34 17 09 47)";
export const ABDENABI_SOUS_TRAITANT_LIGNE = `${ABDENABI_SOUS_TRAITANT} · ${ABDENABI_CORPS_ETAT}`;
export const ABDENABI_ADRESSE_LIGNE1 = "100A Route des Romains";
export const ABDENABI_ADRESSE_LIGNE2 = "Lot 49 - Étage 2";
export const ABDENABI_CODE_POSTAL = "67200";
export const ABDENABI_VILLE = "STRASBOURG";
export const ABDENABI_CP_VILLE = `${ABDENABI_CODE_POSTAL} ${ABDENABI_VILLE}`;
export const ABDENABI_ADRESSE_RUE = `${ABDENABI_ADRESSE_LIGNE1}, ${ABDENABI_ADRESSE_LIGNE2}`;
export const ABDENABI_ADRESSE_CHANTIER = `${ABDENABI_ADRESSE_RUE}, ${ABDENABI_CP_VILLE}`;
export const ABDENABI_ADRESSE_CADRE = `${ABDENABI_ADRESSE_RUE}\n${ABDENABI_CP_VILLE}`;
export const ABDENABI_PRESTATION_BDC =
  "Fourniture et pose Saunier Duval Themafast VMC Gaz + Désembouage machine + Filtre à boue magnétique + Frais de route Mâcon-Strasbourg A/R";
export const ABDENABI_COMMISSION_HT = 262.5;
export const ABDENABI_COMMISSION_JALON_HT = 131.25;
export const ABDENABI_DEBOURS_HT = 2362.5;
export const ABDENABI_MARGE_HT = 262.5;
export const ABDENABI_MARGE_PCT = 10;

export const ABDENABI_CONCURRENT = {
  nom: "Proxiserve",
  montantTtc: 3526.06,
  ecartTtc: 376.06,
} as const;

export const ABDENABI_LIGNES_VENTE = [
  {
    ordre: 1,
    designation: "Dépose soignée et évacuation de la chaudière existante ELM Leblanc GLM 5.20",
    montantHt: 180,
  },
  {
    ordre: 2,
    designation:
      "Fourniture et pose d'une chaudière murale Saunier Duval Themafast Classic V 18/24 (évacuation VMC Gaz, micro-accumulation)",
    montantHt: 1450,
  },
  {
    ordre: 3,
    designation:
      "Fourniture et pose d'un kit de raccordement complet, conduit de fumée D125 et bouche autoréglable BAZ D125",
    montantHt: 195,
  },
  {
    ordre: 4,
    designation:
      "Fourniture et pose sous garantie d'un filtre à boue magnétique haute performance (séparateur de boues pour protection de l'échangeur neuf)",
    montantHt: 160,
  },
  {
    ordre: 5,
    designation:
      "Désembouage hydrodynamique complet du réseau de radiateurs avec machine spécifique et injection de produit déshinhibiteur préventif de corrosion",
    montantHt: 340,
  },
  {
    ordre: 6,
    designation: "Fourniture et pose d'un thermostat d'ambiance digital modulant haute précision",
    montantHt: 140,
  },
  {
    ordre: 7,
    designation:
      "Mise en service, essais, réglages de combustion et établissement du Certificat de Conformité Gaz modèle CC2",
    montantHt: 160,
  },
] as const;

export const ABDENABI_LOTS_SOUS_TRAITANCE = [
  "Fourniture et installation Saunier Duval Themafast Classic V 18/24 (VMC Gaz)",
  "Désembouage machine + produit inhibiteur + pose pot à boue magnétique",
  "Raccordements eau/gaz, bouche BAZ, conduit D125, thermostat et CC2",
  "Forfait logistique et déplacement aller-retour Mâcon → Strasbourg (770 km, péages et carburant inclus)",
] as const;

export const ABDENABI_CONDITIONS_SURETE = [
  "Respect strict des DTU 61.1 (gaz) et DTU 65.16 (installations de chauffage et désembouage).",
  "10 photos de conformité chantier Avant / Pendant / Après (conduit VMC, étanchéité gaz, pot à boue, CC2).",
  "Règlement du forfait sous 48 h strict après signature du PV de réception sans réserve.",
] as const;

export const ABDENABI_NOTE_SYNTHESE =
  "Chantier sécurisé à 100 %, frais de route Mâcon-Strasbourg intégralement couverts, client conquis avec un tarif 376 € sous la concurrence Proxiserve et pot à boue magnétique offert.";

export const ABDENABI_CHANTIER = {
  id: ABDENABI_ID,
  client: ABDENABI_CLIENT,
  clientFacture: ABDENABI_CLIENT_FACTURE,
  clientBdc: ABDENABI_CLIENT_BDC,
  adresseLigne1: ABDENABI_ADRESSE_LIGNE1,
  adresseLigne2: ABDENABI_ADRESSE_LIGNE2,
  adresse: ABDENABI_ADRESSE_RUE,
  adresseComplete: ABDENABI_ADRESSE_CHANTIER,
  codePostal: ABDENABI_CODE_POSTAL,
  ville: ABDENABI_VILLE,
  villeComplete: ABDENABI_CP_VILLE,
  telephone: ABDENABI_TELEPHONE_LIBELLE,
  batiment: "Appartement en copropriété (+15 ans), conduit collectif VMC Gaz",
  devis: ABDENABI_DEVIS,
  dateLibelle: "Octobre 2026",
  validiteJours: 30,
  objet:
    "Remplacement d'une chaudière murale gaz existante par un générateur Saunier Duval Themafast Classic V 18/24 VMC Gaz avec désembouage et protection magnétique du réseau.",
  venteHt: ABDENABI_VENTE_HT,
  tauxTva: ABDENABI_TVA_TAUX,
  tva: ABDENABI_TVA_MONTANT,
  venteTtc: ABDENABI_VENTE_TTC,
  acompteTtc: ABDENABI_ACOMPTE_TTC,
  soldeTtc: ABDENABI_SOLDE_TTC,
  lignesVente: ABDENABI_LIGNES_VENTE,
  sousTraitance: {
    reference: ABDENABI_BDC,
    destinataire: ABDENABI_SOUS_TRAITANT_LIGNE,
    entite: "Mohamed BENAOUDA (Momo / HOLDING TRAVAUX SAS)",
    raisonSociale: ABDENABI_SOUS_TRAITANT,
    corpsEtat: ABDENABI_CORPS_ETAT,
    contact: ABDENABI_CONTACT_MOMO,
    role: "Direction des travaux et sous-traitance",
    adresseChantier: ABDENABI_ADRESSE_CHANTIER,
    prestation: ABDENABI_PRESTATION_BDC,
    montantHt: ABDENABI_ST_HT,
    lots: ABDENABI_LOTS_SOUS_TRAITANCE,
    conditions: ABDENABI_CONDITIONS_SURETE,
    regime:
      "Autoliquidation de la TVA (Article 283-2 nonies du CGI — Travaux de sous-traitance BTP).",
  },
  apporteur: {
    nom: "Monsieur Jamel HAMZAOUI",
    societe: "ENERG'ÉTHIQUE",
    siret: "478 386 261 00059",
    adresse: "62 Route d'Oberhausbergen, 67200 Strasbourg",
    convention: ABDENABI_CONVENTION,
    dateSignature: "10/10/2026",
    referenceFiche: ABDENABI_FICHE_COMMISSION,
    statut: "Apporteur d'affaires indépendant (Société ENERG'ÉTHIQUE)",
    articleTaux: "Article 2.5 B2C",
    articleEcheancier: "Article 3",
    tauxPct: 10,
    assietteHt: ABDENABI_VENTE_HT,
    commissionHt: ABDENABI_COMMISSION_HT,
    jalonHt: ABDENABI_COMMISSION_JALON_HT,
    conditionPaiement:
      "Sur présentation d'une facture officielle émise par ENERG'ÉTHIQUE comportant son SIRET.",
  },
  contractant: {
    nom: "ENERGIA CONSEIL IA® (Sylvain LEMBELEMBE)",
    role: "Contractant général et portage",
    decennale: "Calipso Assurances n° LUNPIB2604975",
  },
  deboursHt: ABDENABI_DEBOURS_HT,
  margeHt: ABDENABI_MARGE_HT,
  margePct: ABDENABI_MARGE_PCT,
  noteSynthese: ABDENABI_NOTE_SYNTHESE,
  concurrent: ABDENABI_CONCURRENT,
} as const;

const sommeLignes = ABDENABI_LIGNES_VENTE.reduce((total, ligne) => total + ligne.montantHt, 0);
if (sommeLignes !== ABDENABI_VENTE_HT) {
  throw new Error(`Abdenabi : somme des lignes HT ${sommeLignes} ≠ ${ABDENABI_VENTE_HT}`);
}
if (roundCheck(ABDENABI_VENTE_HT * 0.2) !== ABDENABI_TVA_MONTANT) {
  throw new Error("Abdenabi : TVA incohérente");
}
if (ABDENABI_VENTE_HT + ABDENABI_TVA_MONTANT !== ABDENABI_VENTE_TTC) {
  throw new Error("Abdenabi : TTC incohérent");
}
if (roundCheck(ABDENABI_VENTE_TTC * 0.3) !== ABDENABI_ACOMPTE_TTC) {
  throw new Error("Abdenabi : acompte 30 % incohérent");
}
if (roundCheck(ABDENABI_VENTE_TTC * 0.7) !== ABDENABI_SOLDE_TTC) {
  throw new Error("Abdenabi : solde 70 % incohérent");
}
if (roundCheck(ABDENABI_VENTE_HT * 0.1) !== ABDENABI_COMMISSION_HT) {
  throw new Error("Abdenabi : commission 10 % incohérente");
}
if (ABDENABI_ST_HT + ABDENABI_COMMISSION_HT !== ABDENABI_DEBOURS_HT) {
  throw new Error("Abdenabi : débours incohérents");
}
if (ABDENABI_VENTE_HT - ABDENABI_DEBOURS_HT !== ABDENABI_MARGE_HT) {
  throw new Error("Abdenabi : marge incohérente");
}

function roundCheck(montant: number): number {
  return Math.round((montant + Number.EPSILON) * 100) / 100;
}
