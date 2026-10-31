/**
 * Dossier M. Mustapha FARISS — La Ricamarie (42).
 * Aménagement & second œuvre sous-sol / pièce de vie PMR.
 * Préparation douche MaPrimeAdapt'. Chiffres figés (ne pas recalculer).
 * 9 500,00 € HT / 10 450,00 € TTC — TVA rénovation 10 %.
 * Échéancier 30 % / 70 %. Facturation en direct avec le client final.
 * La commission B2C 10 % est interne : elle n'est pas imprimée sur le devis client.
 */

import { FORFAIT_INGENIERIE_TTC, RIB_QONTO } from "./paradesAntiFuite.js";
import {
  SOURCE_APPORTEUR_DAMIEN,
  STATUT_COMMISSION_EN_ATTENTE,
  libelleSourceApporteur,
} from "./operationnelCrm.js";

export const FARISS_DOSSIER_ID = "DOS-2026-FARISS-01";
export const FARISS_CLIENT_ID = "CL-2026-FARISS";
export const FARISS_REFERENCE = "DEV-2026-FARISS-01";
export const FARISS_DEVIS_NUMERO = "DEV-2026-FARISS-01";
export const FARISS_DEVIS_DATE = "2026-10-20";
export const FARISS_DEVIS_DATE_LONGUE = "20 octobre 2026";
export const FARISS_DEVIS_TITRE =
  "DEVIS CONTRACTANT GÉNÉRAL — AMÉNAGEMENT SOUS-SOL & PIÈCE DE VIE PMR (PRÉPARATION DOUCHE MAPRIMEADAPT') — LA RICAMARIE";
export const NOM_FICHIER_DEVIS_FARISS = "DEVIS_FARISS_LARICAMARIE_2026.html";
export const CHEMIN_DEVIS_FARISS = `/${NOM_FICHIER_DEVIS_FARISS}`;
export const ASSURANCE_DECENNALE_FARISS = "Garantie Décennale Calipso Assurances n° LUNPIB2604975";

export const STATUT_FARISS = "Devis émis - En attente validation MaPrimeAdapt'";
export const PHASE_FARISS = "Devis émis — condition suspensive MaPrimeAdapt'";
export const CATEGORIE_FARISS = "Maintien à domicile";
export const SOURCE_FARISS = "Aqua Habita — Partenaire Kinedo";
export const TITRE_FARISS =
  "Aménagement & Second Œuvre sous-sol / Pièce de vie PMR (Préparation Douche MaPrimeAdapt')";

export { RIB_QONTO, FORFAIT_INGENIERIE_TTC };

export const CLIENT_FARISS = {
  clientId: FARISS_CLIENT_ID,
  civilite: "M.",
  nom: "FARISS",
  prenom: "Mustapha",
  libelleSignature: "M. Mustapha FARISS",
  telephone: "06 81 07 09 17",
  email: "",
  adresse: "6 Rue Danielle Casanova, 42150 La Ricamarie",
  ville: "La Ricamarie",
  codePostal: "42150",
  departement: "42",
  region: "Loire — Auvergne-Rhône-Alpes",
  typeBien: "Sous-sol / pièce de vie PMR — préparation douche MaPrimeAdapt'",
  typeProjet: TITRE_FARISS,
  categorie: CATEGORIE_FARISS,
  dateCreation: FARISS_DEVIS_DATE,
  facturation: "En direct avec le client final (M. Fariss)",
};

export const EQUIPE_FARISS = {
  commercial: "Damien RICHARD",
  direction: "Sylvain LEMBELEMBE",
  apporteur: "Damien RICHARD (Aqua Habita — Partenaire Kinedo)",
  apporteurEmails: "dr@aqua-habita.fr / ldp@aqua-habita.fr",
  titulaireMarche: "ENERGIA CONSEIL IA® (Contractant Général)",
  facturation: CLIENT_FARISS.facturation,
  poseurDouche: "Aqua Habita — poseur tiers indépendant (cabine Kinedo et paroi 1,60 m)",
  coordination: "Direction & Portage Contractant Général : ENERGIA CONSEIL IA®",
  assuranceDecennale: ASSURANCE_DECENNALE_FARISS,
};

export const CLAUSE_LIMITE_PRESTATION_FARISS =
  "Limite de prestation & Coordination technique : Les réseaux d'eau (EC/EF) et l'évacuation sont amenés en attente bouchonnée. La fourniture, la pose et le raccordement de la cabine de douche Kinedo et de sa paroi adaptée à 1,60 m sont sous la responsabilité exclusive d'un poseur tiers indépendant (Aqua Habita).";

export const CLAUSE_SUSPENSIVE_MAPRIMEADAPT_FARISS =
  "Condition suspensive d'aide : Ce devis est subordonné à la notification officielle d'attribution de la subvention MaPrimeAdapt' par l'Anah.";

export const CLAUSE_INGENIERIE_FARISS =
  "Parade d'ingénierie & frais de dossier : En cas de désistement ou de résiliation unilatérale par le client après l'obtention de la subvention MaPrimeAdapt', un forfait d'ingénierie et d'études préparatoires de 990,00 € TTC sera immédiatement exigible et conservé par ENERGIA CONSEIL IA®.";

export const MENTION_AIDES_FARISS =
  "Aides financières 2026 (estimation à titre indicatif). MaPrimeAdapt' à valider selon la notification officielle de l'Anah et l'éligibilité en vigueur. Montants définitifs après instruction ANAH. Le présent devis ne chiffre pas le montant de la subvention : le marché à régler reste 10 450,00 € TTC tant que l'Anah n'a pas notifié le montant attribué. Clause Julia Protection Aides : responsabilité ENERGIA plafonnée à 2 000 € en cas d'écart > 10 % imputable à une erreur prouvée d'ENERGIA ; 0 % si erreur client ou décision ANAH.";

export const CLAUSES_FARISS = [
  CLAUSE_LIMITE_PRESTATION_FARISS,
  CLAUSE_SUSPENSIVE_MAPRIMEADAPT_FARISS,
  CLAUSE_INGENIERIE_FARISS,
];

/** Relevé du 20 octobre 2026 — fichiers dans public/dossiers/fariss/. */
export const DOSSIER_PHOTOS_FARISS = "/dossiers/fariss";
export const NOM_ARCHIVE_PHOTOS_FARISS = "DOS-2026-FARISS-01-photos-avant-travaux.zip";

export const PHOTOS_TERRAIN_FARISS = [
  {
    id: "fariss-01-releve",
    src: "/dossiers/fariss/01-fiche-releve-aqua-habita.jpg",
    srcContrat: "./dossiers/fariss/01-fiche-releve-aqua-habita.jpg",
    fichier: "01-fiche-releve-aqua-habita.jpg",
    titre: "Fiche de relevé Aqua Habita (HSP 1,93 m / Cotes terrain)",
    badge: "Relevé Kinedo — CDS Damien — MPA",
    label: "Fiche de relevé Aqua Habita (HSP 1,93 m / Cotes terrain)",
  },
  {
    id: "fariss-02-bac",
    src: "/dossiers/fariss/02-bac-a-laver-beton.jpg",
    srcContrat: "./dossiers/fariss/02-bac-a-laver-beton.jpg",
    fichier: "02-bac-a-laver-beton.jpg",
    titre: "Bac à laver massif en béton armé (Lot 1 : Démolition & Curage)",
    badge: "Lot 1 — Démolition & Curage",
    label: "Bac à laver massif en béton armé (Lot 1 : Démolition & Curage)",
  },
  {
    id: "fariss-03-murs",
    src: "/dossiers/fariss/03-vue-generale-murs-bruts.jpg",
    srcContrat: "./dossiers/fariss/03-vue-generale-murs-bruts.jpg",
    fichier: "03-vue-generale-murs-bruts.jpg",
    titre: "Vue générale du sous-sol / Murs bruts (Lot 2 : Doublage hydrofuge 10 cm)",
    badge: "Lot 2 — Doublage hydrofuge 10 cm",
    label: "Vue générale du sous-sol / Murs bruts (Lot 2 : Doublage hydrofuge 10 cm)",
  },
  {
    id: "fariss-04-plafond",
    src: "/dossiers/fariss/04-plafond-solives-tuyauteries.jpg",
    srcContrat: "./dossiers/fariss/04-plafond-solives-tuyauteries.jpg",
    fichier: "04-plafond-solives-tuyauteries.jpg",
    titre: "Plafond solives et tuyauteries existantes (Lot 3 : Faux-plafond hydro)",
    badge: "Lot 3 — Faux-plafond hydro",
    label: "Plafond solives et tuyauteries existantes (Lot 3 : Faux-plafond hydro)",
  },
  {
    id: "fariss-05-sol",
    src: "/dossiers/fariss/05-dallage-zone-douche-kinedo.jpg",
    srcContrat: "./dossiers/fariss/05-dallage-zone-douche-kinedo.jpg",
    fichier: "05-dallage-zone-douche-kinedo.jpg",
    titre: "Dallage brut et zone d'implantation douche Kinedo (Lot 4 : Ragréage & sol PVC)",
    badge: "Lot 4 — Ragréage & sol PVC",
    label: "Dallage brut et zone d'implantation douche Kinedo (Lot 4 : Ragréage & sol PVC)",
  },
];

/** Vente cliente ferme — TVA rénovation 10 %. Commission B2C interne, hors devis client. */
export const TOTAUX_FARISS = {
  totalHt: 9500,
  totalTva: 950,
  totalTtc: 10450,
  tauxTva: 0.1,
  commissionDamienHt: 950,
  tauxCommission: 0.1,
  coutsTravauxHt: null,
  forfaitCatarinaHt: 0,
  margeBruteHt: null,
  margeNetteEnergiaHt: null,
  forfaitIngenierieTtc: FORFAIT_INGENIERIE_TTC,
};

/** Échéancier 30 % à la commande / 70 % en fin de chantier. */
export const FINANCEMENT_FARISS = {
  acompte: 3135,
  intermediaire: 0,
  solde: 7315,
  resteACharge: 10450,
};

export const POSTES_FARISS_DEVIS = [
  {
    id: "fariss-poste-1-demolition",
    ordreContractuel: 1,
    nom: "Démolition & Curage lourd",
    specifications:
      "Démolition et découpe au marteau-piqueur du bac à laver massif en béton armé existant dans la cave, dépose des canalisations hors d'usage, évacuation des gravats et transport en décharge agréée avec traçabilité déchets.",
    quantite: 1,
    unite: "forfait",
    puHt: 950,
    tauxTva: 0.1,
    totalHt: 950,
    totalTva: 95,
    totalTtc: 1045,
    verrouillageOfficiel: true,
  },
  {
    id: "fariss-poste-2-doublage",
    ordreContractuel: 2,
    nom: "Doublage thermique et hydrofuge des 4 murs",
    specifications:
      "Fourniture et pose d'une isolation thermique en laine de verre épaisseur 100 mm (R = 3,15 m².K/W) avec pare-vapeur sur ossature métallique Placostil M48, parement en plaques de plâtre Placo hydrofuge BA13 (vertes) haute résistance à l'humidité, traitement complet des joints (bandes armées + 2 passes d'enduit hydrofuge) et application de 2 couches de peinture blanche satinée spéciale pièces humides.",
    quantite: 30.5,
    unite: "m²",
    puHt: 110,
    tauxTva: 0.1,
    totalHt: 3355,
    totalTva: 335.5,
    totalTtc: 3690.5,
    verrouillageOfficiel: true,
  },
  {
    id: "fariss-poste-3-plafond",
    ordreContractuel: 3,
    nom: "Faux-plafond suspendu hydrofuge",
    specifications:
      "Fourniture et mise en œuvre d'une ossature métallique courte sous solives bois existantes, pose de plaques de plâtre hydrofuges BA13 vert, calicotage/jointoiement hydrofuge et mise en peinture blanche (hauteur finie sous plafond : ~1,87 m).",
    quantite: 15.5,
    unite: "m²",
    puHt: 95,
    tauxTva: 0.1,
    totalHt: 1472.5,
    totalTva: 147.25,
    totalTtc: 1619.75,
    verrouillageOfficiel: true,
  },
  {
    id: "fariss-poste-4-sol",
    ordreContractuel: 4,
    nom: "Préparation de sol et revêtement étanche antidérapant",
    specifications:
      "Nettoyage et piquage du dallage béton brut, application d'un primaire d'accroche tous supports, ragréage autonivelant fibré haute résistance P3/P4, fourniture et pose d'un revêtement de sol PVC étanche spécial pièces d'eau classé antidérapant R10 avec remontée en plinthes étanches soudées.",
    quantite: 15.5,
    unite: "m²",
    puHt: 90,
    tauxTva: 0.1,
    totalHt: 1395,
    totalTva: 139.5,
    totalTtc: 1534.5,
    verrouillageOfficiel: true,
  },
  {
    id: "fariss-poste-5-electricite",
    ordreContractuel: 5,
    nom: "Reprise électrique et éclairage étanche IP65",
    specifications:
      "Création d'une alimentation dédiée depuis le tableau principal avec protection différentielle 30 mA conforme NF C 15-100, incorporation et pose de 5 spots encastrés LED étanches IP65 basse consommation dans le faux-plafond, appareillage étanche complet (interrupteur + prise confort).",
    quantite: 1,
    unite: "forfait",
    puHt: 1250,
    tauxTva: 0.1,
    totalHt: 1250,
    totalTva: 125,
    totalTtc: 1375,
    verrouillageOfficiel: true,
  },
  {
    id: "fariss-poste-6-chauffage",
    ordreContractuel: 6,
    nom: "Chauffage et ventilation de cave",
    specifications:
      "Fourniture et pose d'un radiateur électrique à inertie / sèche-serviettes soufflant blanc classe II IP24 avec thermostat électronique programmable + pose d'un aérateur extracteur d'air mécanique pour assainissement permanent de la pièce.",
    quantite: 1,
    unite: "forfait",
    puHt: 1077.5,
    tauxTva: 0.1,
    totalHt: 1077.5,
    totalTva: 107.75,
    totalTtc: 1185.25,
    verrouillageOfficiel: true,
  },
];

export function texteRibAcompteFariss() {
  return [
    `Titulaire : ${RIB_QONTO.titulaire}`,
    `Banque : ${RIB_QONTO.banque}`,
    `IBAN : ${RIB_QONTO.iban}`,
    `BIC : ${RIB_QONTO.bic}`,
    `Référence : ${FARISS_DEVIS_NUMERO} — M. Mustapha FARISS`,
    "Acompte 30 % à la commande : 3 135,00 € TTC",
  ].join("\n");
}

export function editionOfficielleFariss() {
  return {
    devisOfficiel: {
      numero: FARISS_DEVIS_NUMERO,
      date: FARISS_DEVIS_DATE,
      titre: FARISS_DEVIS_TITRE,
      validiteJours: 90,
    },
    financement: {
      ecoPtzMontant: 0,
      ecoPtzDuree: 15,
      apportPersonnel: FINANCEMENT_FARISS.resteACharge,
      acompte: FINANCEMENT_FARISS.acompte,
      intermediaire: FINANCEMENT_FARISS.intermediaire,
      solde: FINANCEMENT_FARISS.solde,
    },
    travaux: POSTES_FARISS_DEVIS.map((poste) => ({
      ...poste,
      familleId: "maintien-domicile",
      categorieId: "second-oeuvre",
      prestationId: poste.id,
    })),
    postesContractuels: POSTES_FARISS_DEVIS,
    lignes: POSTES_FARISS_DEVIS,
    travauxCoches: POSTES_FARISS_DEVIS,
    mentionsJuridiques: [MENTION_AIDES_FARISS, ...CLAUSES_FARISS],
    photos: {
      paires: PHOTOS_TERRAIN_FARISS.map((photo) => ({
        avant: photo.src,
        apres: photo.src,
        titre: photo.titre,
        badge: photo.badge,
      })),
    },
    verrouillageOfficiel: true,
  };
}

export function syntheseFinanciereFariss() {
  return { ...TOTAUX_FARISS, ...FINANCEMENT_FARISS };
}

export function lotsFarissPourTravaux() {
  return POSTES_FARISS_DEVIS.map((poste) => ({
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
    ordre: poste.ordreContractuel,
    ordreContractuel: poste.ordreContractuel,
    puHt: poste.puHt,
    specifications: poste.specifications,
    categorieId: "second-oeuvre",
    verrouillageOfficiel: true,
  }));
}

export const PROJET_FARISS_DEFAUT = {
  id: FARISS_DOSSIER_ID,
  clientId: FARISS_CLIENT_ID,
  nom: CLIENT_FARISS.libelleSignature,
  prenom: CLIENT_FARISS.prenom,
  ville: CLIENT_FARISS.ville,
  codePostal: CLIENT_FARISS.codePostal,
  adresse: CLIENT_FARISS.adresse,
  telephone: CLIENT_FARISS.telephone,
  email: CLIENT_FARISS.email,
  rfr: null,
  statut: STATUT_FARISS,
  phase: PHASE_FARISS,
  priorite: "Devis émis — en attente de notification MaPrimeAdapt'",
  reference: FARISS_REFERENCE,
  numeroAuditMar: FARISS_REFERENCE,
  typeBien: CLIENT_FARISS.typeBien,
  typeProjet: `${CATEGORIE_FARISS} — ${TITRE_FARISS}`,
  categorie: CATEGORIE_FARISS,
  description: `${TITRE_FARISS}. Chantier ${CLIENT_FARISS.adresse}. Marché ${TOTAUX_FARISS.totalHt.toLocaleString("fr-FR")} € HT / ${TOTAUX_FARISS.totalTtc.toLocaleString("fr-FR")} € TTC (TVA 10 %). Acompte 30 % : ${FINANCEMENT_FARISS.acompte.toLocaleString("fr-FR")} € TTC. Solde 70 % : ${FINANCEMENT_FARISS.solde.toLocaleString("fr-FR")} € TTC. ${CLAUSE_SUSPENSIVE_MAPRIMEADAPT_FARISS} ${MENTION_AIDES_FARISS}`,
  horsAidesPubliques: true,
  maprimeAdapt: true,
  source: "manuel",
  sourceLead: SOURCE_FARISS,
  createdAt: CLIENT_FARISS.dateCreation,
  apporteurId: SOURCE_APPORTEUR_DAMIEN,
  apporteurNom: EQUIPE_FARISS.apporteur || libelleSourceApporteur(SOURCE_APPORTEUR_DAMIEN, { select: true }),
  etapeAnah: null,
  validationMar: false,
  acompte30Encaisse: false,
  dateVisiteTechnique: "",
  consultationDuo: false,
  statutCommission: STATUT_COMMISSION_EN_ATTENTE,
  detailJalon: PHASE_FARISS,
  equipe: EQUIPE_FARISS,
  montantEstimeTtc: TOTAUX_FARISS.totalTtc,
  montantHt: TOTAUX_FARISS.totalHt,
  commissionDamienHt: TOTAUX_FARISS.commissionDamienHt,
  travaux: lotsFarissPourTravaux(),
  postesContractuels: POSTES_FARISS_DEVIS,
  lignes: POSTES_FARISS_DEVIS,
  travauxCoches: POSTES_FARISS_DEVIS,
  syntheseFinanciere: syntheseFinanciereFariss(),
  alertes: [
    CLAUSE_SUSPENSIVE_MAPRIMEADAPT_FARISS,
    CLAUSE_LIMITE_PRESTATION_FARISS,
    CLAUSE_INGENIERIE_FARISS,
    MENTION_AIDES_FARISS,
  ],
};
