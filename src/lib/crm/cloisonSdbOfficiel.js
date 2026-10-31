/**
 * Dossier second œuvre — Réaménagement Cloison 3,50 m & Faux-plafond autoportant SDB.
 * Apporteur Damien / Éco-Technicien BtoC — Direction & Coordination Technique ENERGIA.
 * Chiffres contractuels 2026 (ne pas recalculer).
 */

import {
  ETAPE_ANAH_AUDIT,
  SOURCE_APPORTEUR_DAMIEN,
  STATUT_COMMISSION_EN_ATTENTE,
  libelleSourceApporteur,
} from "./operationnelCrm.js";

export const CLOISON_SDB_DOSSIER_ID = "dossier-cloison-sdb-2026";
export const CLOISON_SDB_REFERENCE = "EC-2026-SO-CLOISON-SDB-01";
export const CLOISON_SDB_CONTRAT_NUMERO = "CONTRAT-2026-SO-CLOISON-SDB-01";
export const CLOISON_SDB_CONTRAT_DATE = "2026-10-04";
export const CLOISON_SDB_CONTRAT_TITRE =
  "CONTRAT DE CONTRACTANT GÉNÉRAL — RÉAMÉNAGEMENT CLOISON 3,50 m & FAUX-PLAFOND AUTOPORTANT SDB";
export const NOM_FICHIER_CONTRAT_CLOISON_SDB = "CONTRAT_CLOISON_SDB_FAUX_PLAFOND_2026_FINAL.html";
export const STATUT_CLOISON_SDB = "Devis en cours / À transmettre";
export const PHASE_CLOISON_SDB = "Chiffrage Contractant Général — devis à transmettre";
export const SOURCE_CLOISON_SDB = "Éco Technicien BtoC";

export const CLIENT_CLOISON_SDB = {
  /** Affichage CRM (intitulé projet) — ne pas utiliser comme identité signature. */
  nomAffichage: "Cloison & Faux-plafond SDB — GOURDON",
  intitule: "Réaménagement Cloison 3.50m & Faux-Plafond Autoportant SDB",
  /** Identité contractuelle nominative. */
  civilite: "Monsieur et Madame",
  nom: "GOURDON",
  prenom: "Georges",
  libelleSignature: "Monsieur et Madame Georges GOURDON",
  telephone: "07 69 44 85 98",
  ville: "Chambonas",
  codePostal: "07140",
  adresse: "512 Route de Saint-Laurent-les-Bains, 07140 Chambonas",
  typeBien: "Réaménagement intérieur — Second œuvre (cloison + SDB)",
  dateCreation: "2026-10-04",
};

export const EQUIPE_CLOISON_SDB = {
  directionContractantGeneral:
    "Sylvain LEMBELEMBE (06 10 59 68 98 — contact@energia-conseil-ia.com)",
  commercialApporteur:
    "Damien RICHARD (Société SRD CONSEIL — damien.srdconseil@gmail.com) — commissionnement progressif : 10 % HT jusqu’à 50 000 € HT, 5 % HT au-delà — 31 corps d’état",
  coordination: "Direction & Coordination Technique : ENERGIA CONSEIL IA®",
  commercial: "Damien RICHARD",
  direction: "Sylvain LEMBELEMBE",
  marqueInpi: "Marque INPI n°5213845",
  assuranceDecennale: "Assurance Décennale Calipso Assurances n° LUNPIB2604975",
};

/**
 * Photos de repérage — fichiers réels dans /public (même dossier que le contrat HTML).
 * Chemins relatifs ./… pour ouverture file:// du contrat ; chemins /… pour la galerie CRM.
 */
export const PHOTOS_TERRAIN_CLOISON_SDB = [
  {
    id: "cloison-sdb-photo-chambre",
    src: "/photo1.jpg",
    srcContrat: "./photo1.jpg",
    fallbackSrc: "/cloison-sdb/01-chambre-reperage.svg",
    fichierPublic: "photo1.jpg",
    titre: "Chambre — vue cloison",
    badge: "Repérage cloison 3,50 ml à déposer / décaler",
    label: "Photo 1 — Chambre / entrée — repérage cloison existante 3,50 ml",
  },
  {
    id: "cloison-sdb-photo-sdb-haute",
    src: "/photo2.jpg",
    srcContrat: "./photo2.jpg",
    fallbackSrc: "/cloison-sdb/02-sdb-vue-haute.svg",
    fichierPublic: "photo2.jpg",
    titre: "SDB — vue haute",
    badge: "Hauteur sous plafond & zone faux-plafond 2,52 m",
    label: "Photo 2 — SDB vue haute — faux-plafond autoportant hydrofuge",
  },
  {
    id: "cloison-sdb-photo-porte-clim",
    src: "/photo3.jpg",
    srcContrat: "./photo3.jpg",
    fallbackSrc: "/cloison-sdb/03-sdb-porte-split-clim.svg",
    fichierPublic: "photo3.jpg",
    titre: "SDB — porte & split clim",
    badge: "Interface porte / unité split — contraintes raccordements",
    label: "Photo 3 — SDB porte et split clim — contraintes techniques",
  },
  {
    id: "cloison-sdb-photo-vasque",
    src: "/PHOTO-2026-10-04-18-09-52.jpg",
    srcContrat: "./PHOTO-2026-10-04-18-09-52.jpg",
    fallbackSrc: "/cloison-sdb/04-vasque-cloison.svg",
    fichierPublic: "PHOTO-2026-10-04-18-09-52.jpg",
    titre: "Détail vasque & cloison",
    badge: "Reprises périphériques sols 30 cm & zone humide",
    label: "Photo 4 — Détail vasque et cloison — bandes de reprise 30 cm",
  },
];

/** Lots de travaux — montants figés (HT / TTC / achat / marge). */
export const LOTS_CLOISON_SDB = [
  {
    id: "cloison-sdb-lot-depose",
    ordre: 1,
    nom: "Dépose et démolition soignée cloison existante (3,50 ml), évacuation gravats",
    categorieId: "demolition",
    quantite: 3.5,
    unite: "ml",
    postes: [
      "Dépose soignée de la cloison existante sur 3,50 ml",
      "Protection des zones attenantes",
      "Évacuation des gravats en déchetterie",
    ],
    totalHt: 486,
    totalTtc: 534.6,
    coutAchatHt: 340,
    margeBruteHt: 146,
    tauxTva: 0.1,
  },
  {
    id: "cloison-sdb-lot-cloison",
    ordre: 2,
    nom: "Création nouvelle cloison Placostil 72/48 hydrofuge côté SDB + acoustique, décalée de 30 cm (3,50 ml)",
    categorieId: "isolation",
    quantite: 3.5,
    unite: "ml",
    postes: [
      "Cloison Placostil 72/48 hydrofuge côté SDB",
      "Isolation acoustique",
      "Implantation décalée de 30 cm par rapport à l’existant",
    ],
    totalHt: 935,
    totalTtc: 1028.5,
    coutAchatHt: 640,
    margeBruteHt: 295,
    tauxTva: 0.1,
  },
  {
    id: "cloison-sdb-lot-faux-plafond",
    ordre: 3,
    nom: "Faux-plafond autoportant hydrofuge abaissé à 2,52 m (~6 m²), bandes et peinture velours",
    categorieId: "peinture",
    quantite: 6,
    unite: "m2",
    postes: [
      "Faux-plafond autoportant hydrofuge ~6 m²",
      "Abaissement à 2,52 m sous plafond fini",
      "Bandes à joint + peinture velours",
    ],
    totalHt: 711,
    totalTtc: 782.1,
    coutAchatHt: 490,
    margeBruteHt: 221,
    tauxTva: 0.1,
  },
  {
    id: "cloison-sdb-lot-electricite",
    ordre: 4,
    nom: "Électricité — Fourniture, pose et raccordement de 3 spots LED IP65 étanches norme NF C 15-100",
    categorieId: "electricite",
    quantite: 3,
    unite: "u",
    postes: [
      "Fourniture 3 spots LED IP65 étanches",
      "Pose et raccordement NF C 15-100",
      "Intégration dans le faux-plafond hydrofuge",
    ],
    totalHt: 338,
    totalTtc: 371.8,
    coutAchatHt: 230,
    margeBruteHt: 108,
    tauxTva: 0.1,
  },
];

export const TOTAUX_CLOISON_SDB = {
  totalHt: 2470,
  totalTva: 247,
  totalTtc: 2717,
  coutsTravauxHt: 1700,
  commissionDamienHt: 247,
  forfaitCatarinaHt: 0,
  margeNetteEnergiaHt: 523,
  tauxMargeNettePct: 21.2,
  tauxTva: 0.1,
};

export const FINANCEMENT_CLOISON_SDB = {
  acompte: 815.1,
  intermediaire: 1086.8,
  solde: 815.1,
  resteACharge: 2717,
};

/** Désignations contractuelles fermes (corps du contrat CG). */
export const POSTES_CLOISON_SDB_CONTRAT = [
  {
    id: "cloison-sdb-lot-depose",
    ordreContractuel: 1,
    nom: "Dépose et démolition soignée cloison existante (3,50 ml), évacuation gravats",
    specifications: "Dépose soignée 3,50 ml · protection zones attenantes · évacuation gravats",
    artisan: "Sous-traitance RGE — Direction & Portage Contractant Général : ENERGIA CONSEIL IA®",
    quantite: 3.5,
    unite: "ml",
    puHt: 138.86,
    tauxTva: 0.1,
    totalHt: 486,
    totalTva: 48.6,
    totalTtc: 534.6,
    verrouillageOfficiel: true,
  },
  {
    id: "cloison-sdb-lot-cloison",
    ordreContractuel: 2,
    nom: "Nouvelle cloison Placostil 72/48 hydrofuge/phonique décalée de 30 cm (3,50 ml)",
    specifications: "Placostil 72/48 hydrofuge côté SDB + acoustique · décalage 30 cm",
    artisan: "Sous-traitance RGE — Direction & Portage Contractant Général : ENERGIA CONSEIL IA®",
    quantite: 3.5,
    unite: "ml",
    puHt: 267.14,
    tauxTva: 0.1,
    totalHt: 935,
    totalTva: 93.5,
    totalTtc: 1028.5,
    verrouillageOfficiel: true,
  },
  {
    id: "cloison-sdb-lot-faux-plafond",
    ordreContractuel: 3,
    nom: "Faux-plafond autoportant hydrofuge abaissé à 2,52 m (~6 m²), bandes et peinture velours",
    specifications: "Autoportant hydrofuge ~6 m² · fini 2,52 m · bandes + peinture velours",
    artisan: "Sous-traitance RGE — Direction & Portage Contractant Général : ENERGIA CONSEIL IA®",
    quantite: 6,
    unite: "m²",
    puHt: 118.5,
    tauxTva: 0.1,
    totalHt: 711,
    totalTva: 71.1,
    totalTtc: 782.1,
    verrouillageOfficiel: true,
  },
  {
    id: "cloison-sdb-lot-electricite",
    ordreContractuel: 4,
    nom: "Électricité — Fourniture et pose de 3 spots LED IP65 étanches",
    specifications: "3 spots LED IP65 · raccordement NF C 15-100 · intégration faux-plafond",
    artisan: "Sous-traitance RGE — Direction & Portage Contractant Général : ENERGIA CONSEIL IA®",
    quantite: 3,
    unite: "u",
    puHt: 112.67,
    tauxTva: 0.1,
    totalHt: 338,
    totalTva: 33.8,
    totalTtc: 371.8,
    verrouillageOfficiel: true,
  },
];

export const MENTION_HORS_MPR_CLOISON_SDB =
  "Travaux de second œuvre (cloison / faux-plafond / électricité) — non éligibles MaPrimeRénov’ Parcours. Aucune aide ANAH déduite. Reste à charge client = montant ferme TTC du marché.";

export function editionOfficielleCloisonSdb() {
  return {
    client: {
      nom: CLIENT_CLOISON_SDB.nom,
      prenom: CLIENT_CLOISON_SDB.civilite,
      telephone: CLIENT_CLOISON_SDB.telephone,
      email: "",
      adresse: CLIENT_CLOISON_SDB.adresse,
      adresseChantier: CLIENT_CLOISON_SDB.adresse,
      surfaceHabitable: "",
      statutOccupation: "proprietaire_occupant",
    },
    devisOfficiel: {
      numero: CLOISON_SDB_CONTRAT_NUMERO,
      date: CLOISON_SDB_CONTRAT_DATE,
      reference: CLOISON_SDB_REFERENCE,
    },
    verrouillageOfficiel: true,
    aides: {
      profil: "",
      parcours: "",
      rfr: 0,
      parts: 0,
      gainClasses: 0,
      verrouillageOfficiel: true,
    },
    financement: {
      ecoPtzMontant: 0,
      ecoPtzDuree: 15,
      apportPersonnel: FINANCEMENT_CLOISON_SDB.resteACharge,
      acompte: FINANCEMENT_CLOISON_SDB.acompte,
      intermediaire: FINANCEMENT_CLOISON_SDB.intermediaire,
      solde: FINANCEMENT_CLOISON_SDB.solde,
    },
    travaux: POSTES_CLOISON_SDB_CONTRAT.map((poste) => ({
      ...poste,
      familleId: "second-oeuvre",
      categorieId: LOTS_CLOISON_SDB.find((lot) => lot.id === poste.id)?.categorieId || "",
      prestationId: poste.id,
    })),
    mentionsJuridiques: [MENTION_HORS_MPR_CLOISON_SDB],
    photos: {
      paires: PHOTOS_TERRAIN_CLOISON_SDB.map((photo) => ({
        id: photo.id,
        titre: photo.titre,
        /** Relatif au HTML contrat dans /public (file:// + serveur). */
        avantSrc: photo.srcContrat || photo.src,
        apresSrc: null,
        legendAvant: photo.label,
        legendApres: "",
      })),
    },
  };
}

export function syntheseFinanciereCloisonSdb() {
  return { ...TOTAUX_CLOISON_SDB };
}

export function lotsCloisonSdbPourTravaux() {
  return LOTS_CLOISON_SDB.map((lot) => ({
    id: lot.id,
    nom: lot.nom,
    quantite: lot.quantite,
    unite: lot.unite,
    prixVentePuHt: Math.round((lot.totalHt / lot.quantite) * 100) / 100,
    coutAchatPuHt: Math.round((lot.coutAchatHt / lot.quantite) * 100) / 100,
    tauxTva: lot.tauxTva,
    postes: lot.postes,
    totalHt: lot.totalHt,
    totalTtc: lot.totalTtc,
    coutAchatHt: lot.coutAchatHt,
    margeBruteHt: lot.margeBruteHt,
    ordre: lot.ordre,
    categorieId: lot.categorieId,
    coordinateur: {
      id: "direction-coordination-technique-energia",
      nom: "ENERGIA CONSEIL IA®",
      telephone: "06 10 59 68 98",
      telephoneTel: "+33610596898",
      role: "Direction & Coordination Technique",
    },
  }));
}

export const PROJET_CLOISON_SDB_DEFAUT = {
  id: CLOISON_SDB_DOSSIER_ID,
  nom: CLIENT_CLOISON_SDB.intitule,
  prenom: "",
  ville: CLIENT_CLOISON_SDB.ville,
  codePostal: CLIENT_CLOISON_SDB.codePostal,
  adresse: "",
  telephone: CLIENT_CLOISON_SDB.telephone,
  email: "",
  rfr: null,
  statut: STATUT_CLOISON_SDB,
  phase: PHASE_CLOISON_SDB,
  priorite: "Devis à transmettre — Damien / Direction ENERGIA",
  reference: CLOISON_SDB_REFERENCE,
  numeroAuditMar: CLOISON_SDB_REFERENCE,
  typeBien: CLIENT_CLOISON_SDB.typeBien,
  typeProjet: `${CLIENT_CLOISON_SDB.intitule} — ${TOTAUX_CLOISON_SDB.totalTtc.toLocaleString("fr-FR")} € TTC`,
  description:
    "Réaménagement cloison 3,50 ml décalée 30 cm (Placostil 72/48 hydrofuge + acoustique), faux-plafond autoportant hydrofuge 2,52 m, 3 spots LED IP65.",
  source: "manuel",
  sourceLead: SOURCE_CLOISON_SDB,
  createdAt: CLIENT_CLOISON_SDB.dateCreation,
  apporteurId: SOURCE_APPORTEUR_DAMIEN,
  apporteurNom: libelleSourceApporteur(SOURCE_APPORTEUR_DAMIEN, { select: true }),
  etapeAnah: ETAPE_ANAH_AUDIT,
  validationMar: false,
  acompte30Encaisse: false,
  dateVisiteTechnique: "",
  consultationDuo: false,
  statutCommission: STATUT_COMMISSION_EN_ATTENTE,
  detailJalon: PHASE_CLOISON_SDB,
  equipe: EQUIPE_CLOISON_SDB,
  montantEstimeTtc: TOTAUX_CLOISON_SDB.totalTtc,
  montantHt: TOTAUX_CLOISON_SDB.totalHt,
  coutsTravauxHt: TOTAUX_CLOISON_SDB.coutsTravauxHt,
  commissionDamienHt: TOTAUX_CLOISON_SDB.commissionDamienHt,
  margeNetteEnergiaHt: TOTAUX_CLOISON_SDB.margeNetteEnergiaHt,
  travaux: lotsCloisonSdbPourTravaux(),
  syntheseFinanciere: syntheseFinanciereCloisonSdb(),
  margeDirectionHt: null,
  margeDirectionTtc: null,
  alertes: [
    "Devis en cours — à transmettre au client après validation Damien + Direction ENERGIA.",
  ],
};
