/**
 * Dossier Madame Marie-France COUTY — Mably (42).
 * Sécurisation escalier & main courante — maintien à domicile.
 * Apporteur Damien RICHARD (Éco-Technicien BtoC) — 10 % HT.
 * Chiffres figés (ne pas recalculer) : 1 350 € HT / 1 485 € TTC, TVA 10 %.
 * Hors MaPrimeRénov’ et hors CEE. Crédit d’impôt autonomie 25 % à titre indicatif.
 */

import {
  SOURCE_APPORTEUR_DAMIEN,
  STATUT_COMMISSION_EN_ATTENTE,
  libelleSourceApporteur,
} from "./operationnelCrm.js";

export const COUTY_ESCALIER_DOSSIER_ID = "dossier-couty-escalier-mably-2026";
export const COUTY_ESCALIER_CLIENT_ID = "CL-2026-15-COUTY";
export const COUTY_ESCALIER_REFERENCE = "DEV-2026-MAD-COUTY-01";
export const COUTY_ESCALIER_DEVIS_NUMERO = "DEV-2026-MAD-COUTY-01";
export const COUTY_ESCALIER_CONTRAT_NUMERO = "EC-2026-SO-MAIN-COURANTE-01";
export const COUTY_ESCALIER_DEVIS_DATE = "2026-10-13";
export const COUTY_ESCALIER_DEVIS_TITRE =
  "CONTRAT CONTRACTANT GÉNÉRAL — SÉCURISATION & POSE D'UNE MAIN COURANTE SUR-MESURE D'ESCALIER (MAINTIEN À DOMICILE) — MABLY";
export const NOM_FICHIER_DEVIS_COUTY = "CONTRAT_COUTY_ESCALIER_MABLY_2026.html";
export const CHEMIN_CONTRAT_COUTY = `/${NOM_FICHIER_DEVIS_COUTY}`;
export const ASSURANCE_DECENNALE_COUTY =
  "Garantie Décennale Calipso Assurances n° LUNPIB2604975";

export const STATUT_COUTY_ESCALIER = "Devis à émettre — Étude technique finalisée";
export const PHASE_COUTY_ESCALIER = "Étude technique finalisée — devis à émettre";
export const CATEGORIE_COUTY_ESCALIER = "Maintien à domicile";
export const SOURCE_COUTY_ESCALIER = "Éco-Technicien BtoC";
export const TITRE_COUTY_ESCALIER =
  "Sécurisation & Pose d'une Main Courante sur-mesure d'Escalier (Maintien à Domicile)";

export const CLIENT_COUTY = {
  clientId: COUTY_ESCALIER_CLIENT_ID,
  civilite: "Madame",
  nom: "COUTY",
  prenom: "Marie-France",
  libelleSignature: "Madame Marie-France COUTY",
  telephone: "07 66 01 07 52",
  email: "Couty.marie-france@orange.fr",
  adresse: "23 Rue du Fort Troyon, 42300 Mably",
  ville: "Mably",
  codePostal: "42300",
  departement: "42",
  region: "Loire — Auvergne-Rhône-Alpes",
  typeBien: "Maison — escalier intérieur maintien à domicile",
  typeProjet: TITRE_COUTY_ESCALIER,
  categorie: CATEGORIE_COUTY_ESCALIER,
  dateCreation: "2026-10-13",
};

export const EQUIPE_COUTY = {
  commercial: "Damien RICHARD",
  direction: "Sylvain LEMBELEMBE",
  commercialApporteur:
    "Damien RICHARD (Éco-Technicien BtoC) — commission 135,00 € HT (10 % du montant HT)",
  apporteur: "Damien RICHARD (Éco-Technicien BtoC)",
  artisanLocal:
    "Sous-traitance menuiserie — Direction & Portage Contractant Général : ENERGIA CONSEIL IA®",
  coordination: "Direction & Portage Contractant Général : ENERGIA CONSEIL IA®",
  assuranceDecennale: ASSURANCE_DECENNALE_COUTY,
};

export const DETAILS_TECHNIQUES_COUTY = {
  typeOuvrage:
    "Escalier intérieur avec volée droite et virage quart-tournant balancé bas (~14 marches moquettées, mur nu sans rampe existante)",
  lineaireMl: 4.8,
  materiaux:
    "Main courante ergonomique diamètre 42 mm en chêne massif verni ou aluminium laqué — linéaire total 4,80 ml",
  securite:
    "Coude de liaison articulé sur-mesure pour le franchissement d’angle du virage, 6 platines murales renforcées avec scellement de sécurité, retours d’extrémités arrondis anti-accrochage (norme accessibilité PMR)",
  regimeFiscal:
    "Éligible crédit d’impôt équipement personnes âgées / autonomie 25 % — hors MaPrimeRénov’ et hors CEE",
  resume:
    "Main courante continue 4,80 ml, profil Ø 42 mm, mur nu sans rampe existante, coude articulé sur-mesure, 6 platines à scellement de sécurité, retours d’extrémités arrondis PMR.",
};

/** Repérage du 13 octobre 2026 — mêmes fichiers que public/couty-escalier/. */
export const PHOTOS_TERRAIN_COUTY = [
  {
    id: "couty-01-volee",
    src: "/couty-escalier/01-volee-droite.jpg",
    srcContrat: "./couty-escalier/01-volee-droite.jpg",
    titre: "Volée droite",
    badge: "Zone d’implantation — mur nu, interrupteur bas",
    label: "Volée droite moquettée, mur nu, interrupteur bas à contourner, aucune rampe existante",
  },
  {
    id: "couty-02-plongee",
    src: "/couty-escalier/02-vue-plongeante.jpg",
    srcContrat: "./couty-escalier/02-vue-plongeante.jpg",
    titre: "Vue plongeante vers le virage",
    badge: "Volée moquettée sans main courante",
    label: "Vue plongeante de la volée vers le quart-tournant, moquette, mur nu",
  },
  {
    id: "couty-03-virage",
    src: "/couty-escalier/03-quart-tournant.jpg",
    srcContrat: "./couty-escalier/03-quart-tournant.jpg",
    titre: "Quart-tournant balancé bas",
    badge: "Virage nu — zone d’implantation du coude",
    label: "Virage quart-tournant nu, mur sans rampe, zone d’implantation du raccord d’angle",
  },
  {
    id: "couty-04-palier",
    src: "/couty-escalier/04-palier-bas.jpg",
    srcContrat: "./couty-escalier/04-palier-bas.jpg",
    titre: "Palier bas",
    badge: "Arrivée — retour d’extrémité",
    label: "Palier bas, carrelage hexagonal, arrivée de l’escalier sans rampe",
  },
];

/** Vente cliente ferme — TVA rénovation 10 %. Montants internes figés. */
export const TOTAUX_COUTY = {
  totalHt: 1350,
  totalTva: 135,
  totalTtc: 1485,
  tauxTva: 0.1,
  coutsTravauxHt: 500,
  commissionDamienHt: 135,
  tauxCommission: 0.1,
  forfaitCatarinaHt: 0,
  margeBruteHt: 850,
  margeNetteEnergiaHt: 715,
  creditImpotTaux: 0.25,
  creditImpotTtc: 371.25,
  resteAChargeNetTtc: 1113.75,
};

/** Échéancier 30 % à la commande / 70 % à la réception. Le crédit d’impôt est récupéré ensuite par la cliente. */
export const FINANCEMENT_COUTY = {
  acompte: 445.5,
  intermediaire: 0,
  solde: 1039.5,
  resteACharge: 1485,
  resteAChargeNetApresCredit: 1113.75,
};

export const POSTES_COUTY_DEVIS = [
  {
    id: "couty-poste-main-courante",
    ordreContractuel: 1,
    nom: "Main courante continue ~4,80 ml — sécurisation escalier maintien à domicile",
    specifications:
      "Escalier intérieur, volée droite et virage quart-tournant balancé bas (~14 marches moquettées), mur nu sans rampe existante. Linéaire total 4,80 ml de main courante ergonomique diamètre 42 mm, chêne massif verni ou aluminium laqué. Coude de liaison articulé sur-mesure pour le franchissement d’angle, 6 platines murales renforcées avec scellement de sécurité, retours d’extrémités arrondis anti-accrochage (norme accessibilité PMR).",
    artisan: EQUIPE_COUTY.artisanLocal,
    quantite: 1,
    unite: "forfait",
    puHt: 1350,
    tauxTva: 0.1,
    totalHt: 1350,
    totalTva: 135,
    totalTtc: 1485,
    verrouillageOfficiel: true,
  },
];

/** Trois lots de périmètre. Le prix client est le forfait global, non ventilé. */
export const POSTES_COUTY_CONTRAT = [
  {
    id: "couty-lot-1-fourniture",
    ordreContractuel: 1,
    nom: "Lot 1 — Fourniture main courante chêne Ø 42 mm",
    specifications:
      "Fourniture d’une main courante ergonomique Ø 42 mm en chêne massif verni haute résistance, linéaire continu de 4,80 ml adapté à la volée droite et au virage bas. Escalier intérieur moquetté (~14 marches), mur nu, aucune rampe existante.",
    quantite: "4,80",
    unite: "ml",
    tauxTva: 0.1,
    prixInclus: true,
    verrouillageOfficiel: true,
  },
  {
    id: "couty-lot-2-raccord",
    ordreContractuel: 2,
    nom: "Lot 2 — Raccord d’angle articulé et retours PMR",
    specifications:
      "Raccord d’angle articulé orientable sur-mesure pour le franchissement sécurisé du quart-tournant balancé bas, et retours d’extrémité arrondis anti-accrochage (norme accessibilité PMR).",
    quantite: 1,
    unite: "ensemble",
    tauxTva: 0.1,
    prixInclus: true,
    verrouillageOfficiel: true,
  },
  {
    id: "couty-lot-3-pose",
    ordreContractuel: 3,
    nom: "Lot 3 — Pose, scellement et finitions",
    specifications:
      "Pose soignée et fixation lourde par 6 platines murales renforcées avec scellement de sécurité adapté au support, contournement de l’interrupteur bas, nettoyage et enlèvement des emballages.",
    quantite: 1,
    unite: "forfait",
    tauxTva: 0.1,
    prixInclus: true,
    verrouillageOfficiel: true,
  },
];

export const MENTION_COUTY_AIDES =
  "Hors MaPrimeRénov’ et hors CEE. Crédit d’impôt équipement personnes âgées / autonomie 25 % : estimation à titre indicatif (371,25 €, reste à charge net estimé 1 113,75 € TTC). Aides à valider selon la situation fiscale réelle de la cliente. Montant définitif après déclaration fiscale. Le marché à régler reste 1 485,00 € TTC ; l’avantage fiscal est récupéré ensuite par la cliente.";

export function editionOfficielleCouty() {
  return {
    devisOfficiel: {
      numero: COUTY_ESCALIER_REFERENCE,
      date: COUTY_ESCALIER_DEVIS_DATE,
      titre: COUTY_ESCALIER_DEVIS_TITRE,
      validiteJours: 90,
    },
    financement: {
      ecoPtzMontant: 0,
      ecoPtzDuree: 15,
      apportPersonnel: FINANCEMENT_COUTY.resteACharge,
      acompte: FINANCEMENT_COUTY.acompte,
      intermediaire: FINANCEMENT_COUTY.intermediaire,
      solde: FINANCEMENT_COUTY.solde,
    },
    travaux: POSTES_COUTY_DEVIS.map((poste) => ({
      ...poste,
      familleId: "maintien-domicile",
      categorieId: "second-oeuvre",
      prestationId: poste.id,
    })),
    postesContractuels: POSTES_COUTY_DEVIS,
    lignes: POSTES_COUTY_DEVIS,
    travauxCoches: POSTES_COUTY_DEVIS,
    mentionsJuridiques: [MENTION_COUTY_AIDES],
    photos: {
      paires: PHOTOS_TERRAIN_COUTY.map((photo) => ({
        avant: photo.src,
        apres: photo.src,
        titre: photo.titre,
        badge: photo.badge,
      })),
    },
  };
}

export function syntheseFinanciereCouty() {
  return { ...TOTAUX_COUTY };
}

export function lotsCoutyPourTravaux() {
  return POSTES_COUTY_DEVIS.map((poste) => ({
    id: poste.id,
    nom: poste.nom,
    quantite: poste.quantite,
    unite: poste.unite,
    prixVentePuHt: poste.puHt,
    coutAchatPuHt: TOTAUX_COUTY.coutsTravauxHt,
    tauxTva: poste.tauxTva,
    postes: [poste.specifications],
    totalHt: poste.totalHt,
    totalTva: poste.totalTva,
    totalTtc: poste.totalTtc,
    coutAchatHt: TOTAUX_COUTY.coutsTravauxHt,
    margeBruteHt: TOTAUX_COUTY.margeBruteHt,
    ordre: poste.ordreContractuel,
    ordreContractuel: poste.ordreContractuel,
    puHt: poste.puHt,
    specifications: poste.specifications,
    artisan: poste.artisan,
    categorieId: "second-oeuvre",
    verrouillageOfficiel: true,
  }));
}

export const PROJET_COUTY_ESCALIER_DEFAUT = {
  id: COUTY_ESCALIER_DOSSIER_ID,
  clientId: COUTY_ESCALIER_CLIENT_ID,
  nom: CLIENT_COUTY.libelleSignature,
  prenom: CLIENT_COUTY.prenom,
  ville: CLIENT_COUTY.ville,
  codePostal: CLIENT_COUTY.codePostal,
  adresse: CLIENT_COUTY.adresse,
  telephone: CLIENT_COUTY.telephone,
  email: CLIENT_COUTY.email,
  rfr: null,
  statut: STATUT_COUTY_ESCALIER,
  phase: PHASE_COUTY_ESCALIER,
  priorite: "Devis à émettre — étude technique finalisée",
  reference: COUTY_ESCALIER_REFERENCE,
  numeroAuditMar: COUTY_ESCALIER_REFERENCE,
  typeBien: CLIENT_COUTY.typeBien,
  typeProjet: `${CATEGORIE_COUTY_ESCALIER} — ${TITRE_COUTY_ESCALIER}`,
  categorie: CATEGORIE_COUTY_ESCALIER,
  description: `${DETAILS_TECHNIQUES_COUTY.resume} Marché ${TOTAUX_COUTY.totalHt.toLocaleString("fr-FR")} € HT / ${TOTAUX_COUTY.totalTtc.toLocaleString("fr-FR")} € TTC (TVA 10 %). Débours poseur local ${TOTAUX_COUTY.coutsTravauxHt.toLocaleString("fr-FR")} € HT. Commission Damien RICHARD ${TOTAUX_COUTY.commissionDamienHt.toLocaleString("fr-FR")} € HT (10 %). Marge nette ENERGIA ${TOTAUX_COUTY.margeNetteEnergiaHt.toLocaleString("fr-FR")} € HT. Crédit d’impôt autonomie 25 % indicatif : reste à charge net estimé ${TOTAUX_COUTY.resteAChargeNetTtc.toLocaleString("fr-FR")} € TTC.`,
  detailsTechniques: DETAILS_TECHNIQUES_COUTY,
  horsAidesPubliques: true,
  source: "manuel",
  sourceLead: SOURCE_COUTY_ESCALIER,
  createdAt: CLIENT_COUTY.dateCreation,
  apporteurId: SOURCE_APPORTEUR_DAMIEN,
  apporteurNom: EQUIPE_COUTY.apporteur || libelleSourceApporteur(SOURCE_APPORTEUR_DAMIEN, { select: true }),
  etapeAnah: null,
  validationMar: false,
  acompte30Encaisse: false,
  dateVisiteTechnique: "",
  consultationDuo: false,
  statutCommission: STATUT_COMMISSION_EN_ATTENTE,
  detailJalon: PHASE_COUTY_ESCALIER,
  equipe: EQUIPE_COUTY,
  montantEstimeTtc: TOTAUX_COUTY.totalTtc,
  montantHt: TOTAUX_COUTY.totalHt,
  coutsTravauxHt: TOTAUX_COUTY.coutsTravauxHt,
  commissionDamienHt: TOTAUX_COUTY.commissionDamienHt,
  margeNetteEnergiaHt: TOTAUX_COUTY.margeNetteEnergiaHt,
  travaux: lotsCoutyPourTravaux(),
  postesContractuels: POSTES_COUTY_DEVIS,
  lignes: POSTES_COUTY_DEVIS,
  travauxCoches: POSTES_COUTY_DEVIS,
  syntheseFinanciere: syntheseFinanciereCouty(),
  margeDirectionHt: TOTAUX_COUTY.margeNetteEnergiaHt,
  margeDirectionTtc: Math.round(TOTAUX_COUTY.margeNetteEnergiaHt * 1.1 * 100) / 100,
  alertes: [
    "Devis à émettre — étude technique finalisée. Ne pas présenter comme un devis déjà envoyé.",
    "Aides financières 2026 (estimation à titre indicatif). Crédit d’impôt autonomie 25 % à valider selon la situation fiscale réelle. Montant définitif après déclaration fiscale. Hors MaPrimeRénov’ et hors CEE.",
  ],
};
