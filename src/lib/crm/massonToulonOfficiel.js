/**
 * Dossier Mme Kristell MASSON — Toulon (83).
 * Remplacement chaudière gaz murale + désembouage.
 * Chiffres figés : 3 150,00 € HT / 3 465,00 € TTC — TVA 10 %.
 * Sous-traitance BMI 2 450,00 € HT (autoliquidation) — marge CG 700,00 € HT.
 * Échéancier 30 % à la commande / 70 % à la réception. Validité 15 jours.
 * Coordination travaux : Mohamed BENAOUDA (BMI). Hors MaPrimeRénov’.
 */

import {
  SOURCE_APPORTEUR_DIRECT,
  STATUT_COMMISSION_EN_ATTENTE,
  libelleSourceApporteur,
} from "./operationnelCrm.js";
import { ASSURANCE_CALIPSO, INPI_MARQUE, RIB_QONTO } from "./paradesAntiFuite.js";

export const MASSON_DOSSIER_ID = "DOS-2026-MASSON-01";
export const MASSON_CLIENT_ID = "CL-2026-MASSON";
export const MASSON_REFERENCE = "DEV-2026-MASSON-01";
export const MASSON_DEVIS_NUMERO = "DEV-2026-MASSON-01";
export const MASSON_DEVIS_DATE = "2026-10-22";
export const MASSON_DATE_VALIDITE = "2026-11-06";
export const MASSON_VALIDITE_JOURS = 15;
export const MASSON_DEVIS_TITRE =
  "DEVIS — REMPLACEMENT CHAUDIÈRE GAZ MURALE & DÉSEMBOUAGE RÉSEAU — TOULON";
export const NOM_FICHIER_DEVIS_MASSON = "DEVIS_MASSON_TOULON_2026.html";
export const CHEMIN_DEVIS_MASSON = `/${NOM_FICHIER_DEVIS_MASSON}`;

export const STATUT_MASSON = "Devis envoyé";
export const PHASE_MASSON = "Devis envoyé — validité 15 jours (jusqu'au 6 novembre 2026)";
export const CATEGORIE_MASSON = "PAC / Chauffage";
export const SOURCE_MASSON = "Coordination Mohamed BENAOUDA — devis envoyé";
export const TITRE_MASSON = "Remplacement chaudière murale gaz - Pack Complet Copropriété";
export const COORDINATION_MASSON = "MOHAMED_BENAOUDA";

export const CLIENT_MASSON = {
  clientId: MASSON_CLIENT_ID,
  civilite: "Mme",
  nom: "MASSON",
  prenom: "Kristell",
  libelleSignature: "Mme Kristell MASSON",
  telephone: "07 68 86 20 82",
  telephoneBrut: "0768862082",
  email: "kristem@hotmail.fr",
  adresse: "176 Rue Bossuet - Bâtiment Orion 5, 83000 Toulon",
  adresseRue: "176 Rue Bossuet - Bâtiment Orion 5",
  ville: "Toulon",
  codePostal: "83000",
  departement: "83",
  region: "Var — Provence-Alpes-Côte d'Azur",
  typeBien: "Appartement",
  typeLogement: "Appartement",
  typeProjet: TITRE_MASSON,
  categorie: CATEGORIE_MASSON,
  dateCreation: MASSON_DEVIS_DATE,
};

export const EQUIPE_MASSON = {
  commercial: "DAMIEN",
  direction: "Sylvain LEMBELEMBE",
  apporteur: "Direct ENERGIA CONSEIL IA®",
  coordination: "Mohamed BENAOUDA",
  coordinationCode: COORDINATION_MASSON,
  coordinationTelephone: "06 34 17 09 47",
  entiteTravaux: "BMI — Mohamed BENAOUDA",
  entreprise: "BMI",
  forme: "Entreprise individuelle",
  siret: "48832778400010",
  adresseArtisan: "5 Grande Rue, 71260 Lugny",
  regimeTva: "Autoliquidation de la TVA — article 283-2 nonies du CGI",
  titulaireMarche: "ENERGIA CONSEIL IA® (Contractant Général)",
};

export const DETAILS_TECHNIQUES_MASSON = {
  depose: "Chaudière ELM LEBLANC GLM 23 existante — plaque relevée GLM23-1H",
  fourniturePose: "Saunier Duval Themafast Classic V 18/24 (VMC Gaz / Conduit) ou équivalent agréé copropriété",
  fumisterie:
    "Pack complet conduit D125/D130 aluminium classé M0 (ou inox rigide double paroi), 3 ml + 2 coudes 90° + colliers, bouche BAZ VMC gaz D125, relais sécurité DSC, évacuation des condensats et essai au déprimomètre",
  desembouage: true,
  filtreBoueMagnetique: true,
  certificatCc2: true,
  thermostat: "Thermostat d'ambiance programmable",
  logistique: "Forfait déplacement A/R Mâcon - Toulon (900 km)",
  tva: "TVA rénovation 10 % — logement achevé depuis plus de 2 ans",
  resume:
    "Dépose ELM LEBLANC GLM 23 (plaque GLM23-1H), pose Saunier Duval Themafast Classic V 18/24, pack fumisterie copropriété (conduit D125, bouche BAZ, sécurité DSC, condensats), désembouage, filtre à boue magnétique, thermostat, certificat CC2 et déplacement Mâcon → Toulon.",
};

export const DOSSIER_PHOTOS_MASSON = "/dossiers/masson";

export const PHOTOS_TERRAIN_MASSON = [
  {
    id: "masson-01-facade",
    src: "/dossiers/masson/photo_facade_chaudiere.jpg",
    srcContrat: "./dossiers/masson/photo_facade_chaudiere.jpg",
    fichier: "photo_facade_chaudiere.jpg",
    titre: "Tableau de bord de l’ancienne chaudière murale",
    badge: "Photo 1 — Façade chaudière",
    label: "Vue rapprochée du tableau de bord et des boutons de l’ancienne chaudière murale.",
  },
  {
    id: "masson-02-plaque",
    src: "/dossiers/masson/photo_plaque_technique.jpg",
    srcContrat: "./dossiers/masson/photo_plaque_technique.jpg",
    fichier: "photo_plaque_technique.jpg",
    titre: "Plaque ELM Leblanc GLM23-1H et raccordements",
    badge: "Photo 2 — Plaque technique",
    label: "Vue sous la chaudière : plaque d’identification ELM Leblanc GLM23-1H et raccordements hydrauliques.",
  },
  {
    id: "masson-03-cuisine",
    src: "/dossiers/masson/PHOTO3.jpg",
    srcContrat: "./dossiers/masson/PHOTO3.jpg",
    fichier: "PHOTO3.jpg",
    titre: "Cuisine — tracé de la fumisterie existante",
    badge: "Photo 3 — Vue d’ensemble",
    label:
      "Vue d’ensemble de la cuisine : gaine horizontale d’environ 2,5 m au-dessus des meubles hauts jusqu’au conduit dans l’angle gauche.",
  },
];

/** Vente cliente ferme — TVA rénovation 10 %. Marge interne, absente du devis client. */
export const TOTAUX_MASSON = {
  totalHt: 3150,
  totalTva: 315,
  totalTtc: 3465,
  tauxTva: 0.1,
  commissionDamienHt: null,
  coutsTravauxHt: 2450,
  forfaitCatarinaHt: 0,
  margeBruteHt: 700,
  margeNetteEnergiaHt: 700,
  margeNetteTtc: 770,
};

export const BDC_MASSON_REFERENCE = "BDC-2026-ST-MASSON-01";
export const NOM_FICHIER_BDC_MASSON = "BDC_MOMO_TOULON_2026.html";
export const CHEMIN_BDC_MASSON = `/${NOM_FICHIER_BDC_MASSON}`;

export const LOTS_BDC_MASSON = [
  "Fourniture chaudière Saunier Duval Themafast Classic V 18/24",
  "Pack fumisterie D125 (3 m rigide + 2 coudes 90° + bouche BAZ + sécurité DSC)",
  "Dépose ancienne chaudière, pose, raccordements cuivre/gaz et déchetterie",
  "Désembouage machine + produit inhibiteur + filtre à boue magnétique",
  "Thermostat d’ambiance et Certificat CC2 Qualigaz",
  "Forfait déplacement A/R Mâcon - Toulon (900 km, péages et carburant inclus)",
  "Protocole Sûreté-6™ (10 photos de traçabilité et PV de fin de chantier sans réserve)",
];

export const SOUS_TRAITANCE_MASSON = {
  entreprise: "BMI",
  dirigeant: "Mohamed BENAOUDA",
  adresse: "5 Grande Rue, 71260 Lugny",
  siren: "488327784",
  siret: "48832778400010",
  siretStatut: "a_confirmer",
  decennale: "Entoria (Fidelidade) n° CRCD04-001151",
  decennaleValiditeAu: "2026-10-31",
  montantHt: 2450,
  tva: 0,
  netAPayer: 2450,
  acompteDemarrage: 735,
  soldeReception: 1715,
  regime: "Autoliquidation de la TVA — article 283-2 nonies du CGI",
  couverture:
    "Fourniture chaudière Saunier Duval, pack fumisterie complète D125 (3 ml + 2 coudes 90° + colliers), dépose/pose, désembouage machine, certificat CC2 Qualigaz et forfait déplacement aller-retour Mâcon–Toulon (900 km).",
  bonDeCommande: {
    reference: BDC_MASSON_REFERENCE,
    dateEmission: MASSON_DEVIS_DATE,
    devisClient: MASSON_REFERENCE,
    fichier: NOM_FICHIER_BDC_MASSON,
    lots: LOTS_BDC_MASSON,
  },
};

/** Échéancier 30 % à la commande / 70 % à la réception. Pas de jalon 40 %. */
export const FINANCEMENT_MASSON = {
  acompte: 1039.5,
  intermediaire: 0,
  solde: 2425.5,
  resteACharge: 3465,
};

export const MENTION_HORS_MPR_MASSON =
  "Prestation de remplacement de chaudière gaz — hors MaPrimeRénov’ et hors CEE. TVA rénovation 10 % (logement achevé depuis plus de 2 ans). Aucune aide n’est déduite : reste à charge = 3 465,00 € TTC. Aides financières 2026 (estimation à titre indicatif) : 0 €. Aides à valider selon revenus réels du client et éligibilité en vigueur si un dispositif devenait applicable. Montants définitifs après instruction ANAH et CEE. Clause Julia Protection Aides : responsabilité ENERGIA plafonnée à 2 000 € en cas d’écart > 10 % imputable à une erreur prouvée d’ENERGIA ; 0 % si erreur client ou décision ANAH/CEE.";

export const MENTION_VALIDITE_MASSON =
  "Devis valable 15 jours, jusqu’au vendredi 6 novembre 2026. Au-delà, les prix sont à reconfirmer.";

export const MENTION_ECHEANCIER_MASSON =
  "Échéancier sécurisé : acompte 30 % à la commande (1 039,50 € TTC) déclenche l’approvisionnement et la date d’intervention ; solde 70 % à la réception (2 425,50 € TTC) à la mise en service et à la remise du certificat de conformité gaz CC2.";

const ARTISAN_MASSON = EQUIPE_MASSON.entiteTravaux;

export const POSTES_MASSON_DEVIS = [
  {
    id: "masson-poste-1-depose",
    ordreContractuel: 1,
    nom: "Dépose & Évacuation",
    specifications:
      "Dépose soignée de l’ancienne chaudière murale ELM LEBLANC GLM 23, vidange du circuit, évacuation et recyclage en filière agréée.",
    artisan: ARTISAN_MASSON,
    quantite: 1,
    unite: "forfait",
    puHt: 180,
    tauxTva: 0.1,
    totalHt: 180,
    totalTva: 18,
    totalTtc: 198,
    verrouillageOfficiel: true,
  },
  {
    id: "masson-poste-2-chaudiere",
    ordreContractuel: 2,
    nom: "Chaudière Saunier Duval Themafast Classic V 18/24",
    specifications:
      "Fourniture et installation d’une chaudière murale gaz Saunier Duval Themafast Classic V 18/24 (ou équivalent agréé copropriété VMC Gaz / tirage naturel), raccordements hydrauliques cuivre, robinetterie d’arrêt, groupe de sécurité et raccordement gaz normalisé.",
    artisan: ARTISAN_MASSON,
    quantite: 1,
    unite: "forfait",
    puHt: 1690,
    tauxTva: 0.1,
    totalHt: 1690,
    totalTva: 169,
    totalTtc: 1859,
    verrouillageOfficiel: true,
  },
  {
    id: "masson-poste-3-fumisterie",
    ordreContractuel: 3,
    nom: "Pack Fumisterie Complète Copro & Bouche BAZ D125 & Sécurité DSC",
    specifications:
      "Conduit de raccordement D125/D130 en aluminium extensible classé M0 ou inox rigide double paroi, avec colliers de serrage étanches (3 ml, 2 coudes à 90°). Bouche d’extraction VMC Gaz type BAZ D125. Relais électrique DSC (dispositif de sécurité collective) coupant l’arrivée de gaz si l’extracteur de toit s’arrête. Kit d’évacuation des condensats acides en PVC avec siphon disconnecteur anti-odeurs jusqu’à la vidange de la cuisine. Essai de dépression au déprimomètre et test de tirage.",
    artisan: ARTISAN_MASSON,
    quantite: 1,
    unite: "forfait",
    puHt: 320,
    tauxTva: 0.1,
    totalHt: 320,
    totalTva: 32,
    totalTtc: 352,
    verrouillageOfficiel: true,
  },
  {
    id: "masson-poste-4-desembouage",
    ordreContractuel: 4,
    nom: "Désembouage hydrodynamique machine + Filtre à boue magnétique",
    specifications:
      "Désembouage hydrodynamique du réseau de radiateurs à la machine pulsée, injection d’un inhibiteur de corrosion préventif longue durée et fourniture/pose d’un filtre à boue magnétique sous la chaudière.",
    artisan: ARTISAN_MASSON,
    quantite: 1,
    unite: "forfait",
    puHt: 390,
    tauxTva: 0.1,
    totalHt: 390,
    totalTva: 39,
    totalTtc: 429,
    verrouillageOfficiel: true,
  },
  {
    id: "masson-poste-5-regulation",
    ordreContractuel: 5,
    nom: "Thermostat d’ambiance + Certificat CC2 Qualigaz",
    specifications:
      "Fourniture et pose d’un thermostat d’ambiance programmable et délivrance du Certificat de Conformité Gaz modèle 2 (CC2 Qualigaz) obligatoire.",
    artisan: ARTISAN_MASSON,
    quantite: 1,
    unite: "forfait",
    puHt: 180,
    tauxTva: 0.1,
    totalHt: 180,
    totalTva: 18,
    totalTtc: 198,
    verrouillageOfficiel: true,
  },
  {
    id: "masson-poste-6-logistique",
    ordreContractuel: 6,
    nom: "Forfait Logistique Déplacement Mâcon → Toulon (900 km A/R)",
    specifications:
      "Prise en charge logistique et déplacement aller/retour Mâcon - Toulon (900 km, carburant, télépéages A6/A7/A8 et temps d’acheminement équipe technique).",
    artisan: ARTISAN_MASSON,
    quantite: 1,
    unite: "forfait",
    puHt: 390,
    tauxTva: 0.1,
    totalHt: 390,
    totalTva: 39,
    totalTtc: 429,
    verrouillageOfficiel: true,
  },
];

/** Bloc JSON source, tel qu’inséré dans le CRM. */
export const SAISIE_JSON_MASSON = {
  reference: MASSON_REFERENCE,
  date_emission: MASSON_DEVIS_DATE,
  date_validite: MASSON_DATE_VALIDITE,
  validite_jours: MASSON_VALIDITE_JOURS,
  client: {
    civilite: CLIENT_MASSON.civilite,
    nom: CLIENT_MASSON.nom,
    prenom: CLIENT_MASSON.prenom,
    telephone: CLIENT_MASSON.telephoneBrut,
    email: CLIENT_MASSON.email,
    adresse: CLIENT_MASSON.adresseRue,
    code_postal: CLIENT_MASSON.codePostal,
    ville: CLIENT_MASSON.ville,
    type_logement: CLIENT_MASSON.typeLogement,
  },
  prestation: {
    titre: TITRE_MASSON,
    depose: DETAILS_TECHNIQUES_MASSON.depose,
    fourniture_pose: "Saunier Duval Themafast Classic V 18/24 (VMC Gaz / Conduit)",
    fumisterie: DETAILS_TECHNIQUES_MASSON.fumisterie,
    desembouage: "Machine hydrodynamique + filtre à boue magnétique + inhibiteur",
    conformite: "Certificat Qualigaz CC2 inclus",
    logistique: "Déplacement A/R Mâcon - Toulon (900 km)",
  },
  postes: POSTES_MASSON_DEVIS.map((poste) => ({
    ordre: poste.ordreContractuel,
    designation: poste.nom,
    detail: poste.specifications,
    montant_ht: poste.totalHt,
  })),
  finances: {
    montant_ht: TOTAUX_MASSON.totalHt,
    taux_tva: 10,
    montant_tva: TOTAUX_MASSON.totalTva,
    montant_ttc: TOTAUX_MASSON.totalTtc,
    acompte_30_ttc: FINANCEMENT_MASSON.acompte,
    solde_70_ttc: FINANCEMENT_MASSON.solde,
  },
  sous_traitance: {
    entreprise: SOUS_TRAITANCE_MASSON.entreprise,
    dirigeant: SOUS_TRAITANCE_MASSON.dirigeant,
    adresse: SOUS_TRAITANCE_MASSON.adresse,
    siren: SOUS_TRAITANCE_MASSON.siren,
    decennale: SOUS_TRAITANCE_MASSON.decennale,
    decennale_validite_au: SOUS_TRAITANCE_MASSON.decennaleValiditeAu,
    montant_ht: SOUS_TRAITANCE_MASSON.montantHt,
    tva: SOUS_TRAITANCE_MASSON.tva,
    net_a_payer: SOUS_TRAITANCE_MASSON.netAPayer,
    acompte_30: SOUS_TRAITANCE_MASSON.acompteDemarrage,
    solde_70: SOUS_TRAITANCE_MASSON.soldeReception,
    regime: SOUS_TRAITANCE_MASSON.regime,
    couverture: SOUS_TRAITANCE_MASSON.couverture,
    bon_de_commande: {
      reference: BDC_MASSON_REFERENCE,
      date_emission: MASSON_DEVIS_DATE,
      devis_client: MASSON_REFERENCE,
      fichier: NOM_FICHIER_BDC_MASSON,
      lots: LOTS_BDC_MASSON,
    },
  },
  marge_nette_ht: TOTAUX_MASSON.margeNetteEnergiaHt,
  photos: PHOTOS_TERRAIN_MASSON.map((photo) => photo.fichier),
  statut: "DEVIS_ENVOYE",
  coordination_travaux: COORDINATION_MASSON,
};

export function lotsMassonPourTravaux() {
  return POSTES_MASSON_DEVIS.map((poste) => ({
    id: poste.id,
    nom: poste.nom,
    quantite: poste.quantite,
    unite: poste.unite,
    prixVentePuHt: poste.puHt,
    tauxTva: poste.tauxTva,
    postes: [poste.specifications],
    totalHt: poste.totalHt,
    totalTva: poste.totalTva,
    totalTtc: poste.totalTtc,
    coutAchatHt: null,
    ordre: poste.ordreContractuel,
    ordreContractuel: poste.ordreContractuel,
    puHt: poste.puHt,
    specifications: poste.specifications,
    artisan: poste.artisan,
    categorieId: "chauffage",
    verrouillageOfficiel: true,
  }));
}

export const PROJET_MASSON_DEFAUT = {
  id: MASSON_DOSSIER_ID,
  clientId: MASSON_CLIENT_ID,
  nom: CLIENT_MASSON.libelleSignature,
  prenom: CLIENT_MASSON.prenom,
  ville: CLIENT_MASSON.ville,
  codePostal: CLIENT_MASSON.codePostal,
  adresse: CLIENT_MASSON.adresse,
  telephone: CLIENT_MASSON.telephone,
  email: CLIENT_MASSON.email,
  rfr: null,
  statut: STATUT_MASSON,
  phase: PHASE_MASSON,
  priorite: "Devis envoyé — validité 15 jours",
  reference: MASSON_REFERENCE,
  numeroAuditMar: MASSON_REFERENCE,
  typeBien: CLIENT_MASSON.typeBien,
  typeProjet: `${CATEGORIE_MASSON} — ${TITRE_MASSON}`,
  categorie: CATEGORIE_MASSON,
  description: `${TITRE_MASSON}. ${CLIENT_MASSON.adresse}. 3 150 € HT / 3 465 € TTC (TVA 10 %). Acompte 30 % : 1 039,50 € TTC. Solde 70 % : 2 425,50 € TTC. ${MENTION_VALIDITE_MASSON} ${MENTION_HORS_MPR_MASSON}`,
  detailsTechniques: DETAILS_TECHNIQUES_MASSON,
  horsAidesPubliques: true,
  source: "manuel",
  sourceLead: SOURCE_MASSON,
  createdAt: CLIENT_MASSON.dateCreation,
  dateValidite: MASSON_DATE_VALIDITE,
  validiteJours: MASSON_VALIDITE_JOURS,
  apporteurId: SOURCE_APPORTEUR_DIRECT,
  apporteurNom: EQUIPE_MASSON.apporteur || libelleSourceApporteur(SOURCE_APPORTEUR_DIRECT, { select: true }),
  etapeAnah: null,
  validationMar: false,
  acompte30Encaisse: false,
  dateVisiteTechnique: "",
  consultationDuo: false,
  statutCommission: STATUT_COMMISSION_EN_ATTENTE,
  detailJalon: PHASE_MASSON,
  equipe: EQUIPE_MASSON,
  montantEstimeTtc: TOTAUX_MASSON.totalTtc,
  montantHt: TOTAUX_MASSON.totalHt,
  coutsTravauxHt: TOTAUX_MASSON.coutsTravauxHt,
  commissionDamienHt: null,
  margeBruteHt: TOTAUX_MASSON.margeBruteHt,
  margeNetteEnergiaHt: TOTAUX_MASSON.margeNetteEnergiaHt,
  sousTraitance: SOUS_TRAITANCE_MASSON,
  photos: PHOTOS_TERRAIN_MASSON,
  travaux: lotsMassonPourTravaux(),
  postesContractuels: POSTES_MASSON_DEVIS,
  lignes: POSTES_MASSON_DEVIS,
  travauxCoches: POSTES_MASSON_DEVIS,
  syntheseFinanciere: { ...TOTAUX_MASSON, ...FINANCEMENT_MASSON },
  saisieJson: SAISIE_JSON_MASSON,
  alertes: [
    MENTION_VALIDITE_MASSON,
    MENTION_ECHEANCIER_MASSON,
    MENTION_HORS_MPR_MASSON,
    "Décennale BMI, police CRCD04-001151, valide jusqu’au 31 octobre 2026 : renouvellement à confirmer avant l’intervention à Toulon. Qualification RGE BMI non renseignée au référentiel.",
  ],
};

const EXECUTION_CLIENT_MASSON = "Exécution : Équipe technique agréée ENERGIA CONSEIL IA®";
const EQUIPE_PLANNING_MASSON = "Équipe technique ENERGIA CONSEIL IA®";

function euroClient(n) {
  return Number(n)
    .toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/[\u00a0\u202f]/g, " ");
}

/** Devis client épuré — aucun sous-traitant, un seul contact, validité 15 jours. */
export function htmlDevisMassonClient() {
  const lignes = [
    {
      nom: "Dépose & Recyclage",
      detail:
        "Dépose et évacuation de l’ancienne chaudière murale ELM LEBLANC GLM 23, vidange et recyclage en filière agréée.",
      ht: 180,
      tva: 18,
      ttc: 198,
    },
    {
      nom: "Fourniture, pose & raccordements chaudière Saunier Duval",
      detail:
        "Fourniture et pose d’une chaudière gaz Saunier Duval Themafast Classic V 18/24 (agréée copropriété VMC Gaz / conduit collectif), raccordements hydrauliques cuivre, robinetterie et gaz.",
      ht: 1980,
      tva: 198,
      ttc: 2178,
    },
    {
      nom: "Pack Fumisterie Grande Longueur Copro 3m + 2 coudes + bouche BAZ + sécurité DSC",
      detail:
        "Fourniture et pose d’un conduit rigide alu/inox D125 (3 mètres linéaires + 2 coudes 90° + colliers de reprise plafond le long des meubles hauts), bouche BAZ VMC Gaz, raccordement de l’évacuation des condensats et relais DSC de sécurité collective.",
      ht: 420,
      tva: 42,
      ttc: 462,
    },
    {
      nom: "Désembouage machine + filtre magnétique",
      detail:
        "Désembouage hydrodynamique du réseau de radiateurs à la machine pulsée, injection d’un inhibiteur longue durée et pose d’un filtre à boue magnétique sous la chaudière.",
      ht: 390,
      tva: 39,
      ttc: 429,
    },
    {
      nom: "Thermostat d’ambiance + Certificat CC2",
      detail: "Thermostat d’ambiance programmable et délivrance du Certificat de Conformité Gaz CC2 Qualigaz.",
      ht: 180,
      tva: 18,
      ttc: 198,
    },
  ];
  const rows = lignes
    .map(
      (ligne, index) => `<tr>
        <td class="num">${index + 1}</td>
        <td><strong>${ligne.nom}</strong><br><span class="detail">${ligne.detail}</span><br><span class="exec">${EXECUTION_CLIENT_MASSON}</span></td>
        <td class="num">${euroClient(ligne.ht)} €</td>
        <td class="num">${euroClient(ligne.tva)} €</td>
        <td class="num">${euroClient(ligne.ttc)} €</td>
      </tr>`,
    )
    .join("\n");
  const planning = lignes
    .map(
      (ligne, index) =>
        `<tr><td>${index + 1}. ${ligne.nom}</td><td>selon lot</td><td>${EQUIPE_PLANNING_MASSON}</td></tr>`,
    )
    .join("\n");
  const photos = PHOTOS_TERRAIN_MASSON.map(
    (photo, index) => `<figure class="no-break">
      <img src="${photo.srcContrat}" alt="${photo.label}" />
      <figcaption>Photo ${index + 1} — ${photo.titre}. ${photo.label}</figcaption>
    </figure>`,
  ).join("\n");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${MASSON_DEVIS_TITRE} | ENERGIA-CONSEIL IA®</title>
  <style>
    :root { --encre: #0f2744; --bleu: #0f4c81; --ligne: #d5e0ea; --fond: #f4f7fb; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #e8eef4; color: var(--encre); font-family: "Segoe UI", Calibri, sans-serif; font-size: 12px; line-height: 1.35; }
    .page { width: 210mm; min-height: 297mm; margin: 12px auto; background: #fff; padding: 8mm 10mm; box-shadow: 0 8px 28px rgba(15, 39, 68, 0.08); }
    header { display: flex; justify-content: space-between; gap: 12px; border-bottom: 3px solid var(--bleu); padding-bottom: 6px; }
    header img { height: 42px; }
    .brand { font-size: 16px; font-weight: 800; letter-spacing: 0.02em; color: var(--bleu); }
    .company { margin-top: 4px; font-size: 11px; line-height: 1.3; color: #334155; }
    .meta { text-align: right; font-size: 11px; line-height: 1.35; }
    .meta strong { color: var(--bleu); }
    h1 { margin: 8px 0 2px; font-size: 14px; line-height: 1.25; color: var(--bleu); }
    .objet { margin: 0 0 6px; font-weight: 700; font-size: 12px; }
    h2 { margin: 8px 0 4px; font-size: 13px; color: var(--bleu); border-bottom: 1px solid var(--ligne); padding-bottom: 2px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid var(--ligne); padding: 4px 6px; vertical-align: top; text-align: left; }
    th { background: var(--bleu); color: #fff; font-weight: 650; }
    td.num, th.num { text-align: right; white-space: nowrap; }
    .detail { color: #334155; }
    .exec { display: inline-block; margin-top: 2px; font-size: 11px; font-weight: 700; color: var(--bleu); }
    .total td { background: #e8f1f8; font-weight: 800; }
    .finance { background: var(--fond); border-left: 4px solid var(--bleu); padding: 6px 8px; margin: 0; }
    .intro { margin: 0 0 8px; }
    .photos { display: flex; flex-direction: column; gap: 8px; }
    figure { margin: 0; }
    figure img { display: block; width: 100%; max-height: 190px; object-fit: contain; border: 2px solid var(--bleu); border-radius: 8px; background: #f8fafc; }
    figcaption { margin-top: 4px; font-size: 11px; font-weight: 650; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px; }
    .sig { border: 1px solid var(--ligne); border-radius: 8px; min-height: 78px; padding: 8px; }
    .sig-line { margin-top: 28px; border-bottom: 1px solid #94a3b8; }
    .accord p { margin: 4px 0; }
    .toolbar { max-width: 210mm; margin: 16px auto 0; text-align: right; }
    .toolbar button { background: var(--bleu); color: #fff; border: 0; border-radius: 8px; padding: 8px 14px; font-weight: 700; cursor: pointer; }
    @media print {
      @page { size: A4 portrait; margin: 8mm 10mm; }
      html, body { margin: 0 !important; padding: 0 !important; font-size: 10px !important; line-height: 1.25 !important; background: #fff !important; }
      .toolbar { display: none !important; }
      .page { page-break-after: always; break-after: page; box-sizing: border-box; width: auto; min-height: 0; margin: 0; padding: 0; box-shadow: none; }
      .page:last-child { page-break-after: avoid; break-after: avoid; }
      table { width: 100% !important; border-collapse: collapse !important; page-break-inside: avoid !important; break-inside: avoid !important; }
      tr, td, th, figure, .no-break { page-break-inside: avoid !important; break-inside: avoid !important; }
      th, td { padding: 3px 5px !important; font-size: 10px !important; }
      h1, h2, h3, h4 { margin: 4px 0 !important; }
      figure img { max-height: 190px !important; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="toolbar"><button type="button" onclick="window.print()">Imprimer / Enregistrer en PDF</button></div>
  <div class="page">
    <header>
      <div>
        <img src="/logo.png" alt="ENERGIA-CONSEIL IA®" height="42">
        <div class="brand">ENERGIA-CONSEIL IA®</div>
        <div class="company">
          SASU au capital de 100 €<br>
          16 Rue Cuvier, 69006 Lyon<br>
          SIRET 94181942700019 — RCS Lyon 941819427<br>
          TVA FR01941819427 — Marque INPI n°${INPI_MARQUE}<br>
          Assurance Décennale ${ASSURANCE_CALIPSO}<br>
          Direction : Sylvain LEMBELEMBE (06 10 59 68 98)<br>
          contact@energia-conseil-ia.com
        </div>
      </div>
      <div class="meta">
        <strong>N° ${MASSON_REFERENCE}</strong><br>
        Date d’émission : 22 octobre 2026<br>
        <strong>Validité du devis : 15 jours (Jusqu'au 06 novembre 2026)</strong><br>
        Montant TTC : ${euroClient(TOTAUX_MASSON.totalTtc)} €
      </div>
    </header>

    <h1>${MASSON_DEVIS_TITRE}</h1>
    <p class="objet">Objet du marché : Marché de travaux de Contractant Général</p>

    <h2>I. Identification des parties</h2>
    <table>
      <tr>
        <th>Contractant Général</th>
        <td>
          <strong>ENERGIA-CONSEIL IA®</strong> — SASU au capital de 100 €<br>
          16 Rue Cuvier, 69006 Lyon<br>
          SIRET 94181942700019 — RCS Lyon 941819427 — TVA FR01941819427<br>
          Marque INPI n°${INPI_MARQUE}<br>
          Assurance Décennale ${ASSURANCE_CALIPSO}<br>
          Direction : Sylvain LEMBELEMBE (06 10 59 68 98) — contact@energia-conseil-ia.com
        </td>
      </tr>
      <tr>
        <th>Client</th>
        <td>
          <strong>Mme Kristell MASSON</strong><br>
          176 Rue Bossuet, Bâtiment Orion 5, 83000 Toulon<br>
          Tél : 07 68 86 20 82 — kristem@hotmail.fr
        </td>
      </tr>
      <tr>
        <th>Lieu des travaux</th>
        <td>176 Rue Bossuet, Bâtiment Orion 5, 83000 Toulon (Appartement)</td>
      </tr>
    </table>

    <h2>II. Détail des 5 postes</h2>
    <table>
      <thead>
        <tr>
          <th>N°</th>
          <th>Désignation</th>
          <th class="num">Montant HT</th>
          <th class="num">TVA 10 %</th>
          <th class="num">Total TTC</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="total">
          <td colspan="2">Total HT / TVA rénovation 10 % / Total TTC</td>
          <td class="num">${euroClient(TOTAUX_MASSON.totalHt)} €</td>
          <td class="num">${euroClient(TOTAUX_MASSON.totalTva)} €</td>
          <td class="num">${euroClient(TOTAUX_MASSON.totalTtc)} €</td>
        </tr>
      </tbody>
    </table>

    <h2>III. Totaux et échéancier</h2>
    <table>
      <tr><td>Total HT</td><td class="num">${euroClient(TOTAUX_MASSON.totalHt)} € HT</td></tr>
      <tr><td>TVA rénovation (10 %)</td><td class="num">${euroClient(TOTAUX_MASSON.totalTva)} €</td></tr>
      <tr class="total"><td>TOTAL DU MARCHÉ DE TRAVAUX TTC</td><td class="num">${euroClient(TOTAUX_MASSON.totalTtc)} € TTC</td></tr>
      <tr><td>Acompte 30 % à la commande<br><span class="detail">Déclenche l’approvisionnement et la date d’intervention</span></td><td class="num">${euroClient(FINANCEMENT_MASSON.acompte)} € TTC</td></tr>
      <tr><td>Solde 70 % à la réception<br><span class="detail">À la mise en service et à la remise du certificat CC2</span></td><td class="num">${euroClient(FINANCEMENT_MASSON.solde)} € TTC</td></tr>
    </table>

    <h2>IV. Financement</h2>
    <p class="finance">Financement : Prestation réalisée sur fonds propres (hors MaPrimeRénov’ et hors CEE). Montant total à charge du client : ${euroClient(TOTAUX_MASSON.totalTtc)} € TTC.</p>
  </div>

  <div class="page">
    <h2>V. Planning prévisionnel</h2>
    <table>
      <thead><tr><th>Phase</th><th>Durée</th><th>Détail</th></tr></thead>
      <tbody>
        ${planning}
      </tbody>
    </table>

    <h2>VI. Bon pour accord</h2>
    <div class="accord no-break">
    <p>Je soussignée, <strong>Mme Kristell MASSON</strong>, accepte le présent devis n° <strong>${MASSON_REFERENCE}</strong> d’un montant de <strong>${euroClient(TOTAUX_MASSON.totalTtc)} € TTC</strong> et mandate ENERGIA-CONSEIL IA® pour la coordination des travaux à Toulon.</p>
    <p>Validité du devis : 15 jours (Jusqu'au 06 novembre 2026).</p>
    <p>Fait à ____________________________ , le ___ / ___ / 2026. Mention manuscrite : « Lu et approuvé, bon pour accord ».</p>
    <div class="signatures">
      <div class="sig">La cliente — Mme Kristell MASSON<div class="sig-line"></div></div>
      <div class="sig">ENERGIA-CONSEIL IA® — Sylvain LEMBELEMBE<div class="sig-line"></div></div>
    </div>
    </div>
    <div class="no-break" style="margin-top: 12px; padding: 10px 12px; border: 2px solid #0f4c81; border-radius: 8px; background-color: #f4f8fb;">
      <h4 style="margin: 0 0 10px 0; color: #0f4c81;">Règlement de l'acompte par virement bancaire (30 % soit ${euroClient(FINANCEMENT_MASSON.acompte)} € TTC)</h4>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Titulaire du compte :</strong> ENERGIA CONSEIL IA SASU</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Banque :</strong> ${RIB_QONTO.banque}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>IBAN :</strong> ${RIB_QONTO.iban}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>BIC :</strong> ${RIB_QONTO.bic}</p>
      <p style="margin: 4px 0; font-size: 12px; color: #555;"><em>* Indiquer en libellé de virement : "Acompte ${MASSON_REFERENCE}"</em></p>
    </div>

    <h2>VII. Contact</h2>
    <table>
      <tr>
        <th>Direction &amp; Contractant Général</th>
        <td><strong>Sylvain LEMBELEMBE</strong> — ENERGIA CONSEIL IA® — Tél : 06 10 59 68 98 — contact@energia-conseil-ia.com</td>
      </tr>
    </table>
  </div>

  <div class="page">
    <h2>Annexe photographique — État des lieux avant travaux</h2>
    <p class="intro">Relevé réalisé dans l’appartement avant chiffrage : tableau de bord de la chaudière existante, plaque d’identification et tracé de la fumisterie en cuisine.</p>
    <div class="photos">
      ${photos}
    </div>
  </div>
</body>
</html>`;
}
