/**
 * Lead prospect Roger Massardier — Cuisine d'exception & Agencement Italien (Catégorie 31).
 * Source Éco Technicien BtoC — budget validé 20 000 € TTC (intégré au CA prévisionnel).
 */

import {
  ETAPE_ANAH_AUDIT,
  SOURCE_APPORTEUR_DAMIEN,
  STATUT_COMMISSION_EN_ATTENTE,
  libelleSourceApporteur,
} from "./operationnelCrm.js";

export const MASSARDIER_LEAD_ID = "lead-massardier-cuisine-2026";
export const MASSARDIER_REFERENCE = "EC-2026-LEAD-MASSARDIER-01";
export const MASSARDIER_CONTRAT_NUMERO = "CONTRAT-2026-LEAD-MASSARDIER-01";
export const MASSARDIER_CONTRAT_DATE = "2026-10-04";
export const MASSARDIER_CONTRAT_TITRE =
  "CONTRAT DE CONTRACTANT GÉNÉRAL — MASSARDIER — CUISINE ITALIENNE SUR-MESURE DIRECT USINE";
export const NOM_FICHIER_CONTRAT_MASSARDIER = "CONTRAT_MASSARDIER_CUISINE_2026_FINAL.html";
export const CHEMIN_CONTRAT_MASSARDIER = `/${NOM_FICHIER_CONTRAT_MASSARDIER}`;
export const STATUT_MASSARDIER = "Nouveau Lead — À Contacter Lundi Matin";
export const PRIORITE_MASSARDIER = "Haute — Rappel prévu lundi 5 octobre matin";
export const SOURCE_MASSARDIER = "Éco Technicien BtoC";

export const DESCRIPTION_MASSARDIER =
  "Cuisine d'exception & Agencement Italien Direct Usine (Catégorie 31) — Budget validé 20 000 € TTC — Îlot central, plan céramique/Dekton, électroménager encastré Premium";

export const CLIENT_MASSARDIER = {
  nom: "Roger Massardier",
  prenom: "Roger",
  telephone: "06 59 39 82 26",
  typeProjet: DESCRIPTION_MASSARDIER,
  dateCreation: "2026-10-04",
  adresse: "Adresse du chantier à préciser",
};

export const EQUIPE_MASSARDIER = {
  commercial: "Damien",
  direction: "Sylvain LEMBELEMBE",
  commercialApporteur:
    "Damien RICHARD (Société SRD CONSEIL — damien.srdconseil@gmail.com) — commissionnement progressif : 10 % HT jusqu’à 50 000 € HT, 5 % HT au-delà — 31 corps d’état",
};

/** Budget validé — TVA 10 % — intégré au CA prévisionnel CRM. */
export const MONTANT_ESTIME_MASSARDIER_TTC = 20000;

export const TOTAUX_MASSARDIER = {
  totalHt: 18181.82,
  totalTva: 1818.18,
  totalTtc: MONTANT_ESTIME_MASSARDIER_TTC,
  coutsTravauxHt: 11500,
  commissionDamienHt: 1818.18,
  forfaitCatarinaHt: 0,
  margeNetteEnergiaHt: 4863.64,
  tauxTva: 0.1,
};

export const FINANCEMENT_MASSARDIER = {
  acompte: 6000,
  intermediaire: 8000,
  solde: 6000,
  resteACharge: MONTANT_ESTIME_MASSARDIER_TTC,
};

export const MENTION_HORS_MPR_MASSARDIER =
  "Cuisine italienne sur-mesure direct usine (Catégorie 31) — hors MaPrimeRénov’ Parcours. Aucune aide ANAH déduite. Reste à charge client = montant ferme TTC du marché.";

export const POSTES_MASSARDIER_CONTRAT = [
  {
    id: "massardier-lot-cuisine",
    ordreContractuel: 1,
    nom: "Cuisine italienne sur-mesure Direct Usine (Catégorie 31)",
    specifications:
      "Îlot central · plan céramique/Dekton · électroménager encastré Premium · filières Veneta Cucine / Arredo3 — design Catarina Martins",
    artisan: "Direct usine Italie — coordination ENERGIA / Damien",
    quantite: 1,
    unite: "forfait",
    puHt: TOTAUX_MASSARDIER.totalHt,
    tauxTva: 0.1,
    totalHt: TOTAUX_MASSARDIER.totalHt,
    totalTva: TOTAUX_MASSARDIER.totalTva,
    totalTtc: TOTAUX_MASSARDIER.totalTtc,
    verrouillageOfficiel: true,
  },
];

export function editionOfficielleMassardier() {
  return {
    client: {
      nom: CLIENT_MASSARDIER.nom,
      prenom: CLIENT_MASSARDIER.prenom,
      telephone: CLIENT_MASSARDIER.telephone,
      email: "",
      adresse: CLIENT_MASSARDIER.adresse,
      adresseChantier: CLIENT_MASSARDIER.adresse,
      surfaceHabitable: "",
      statutOccupation: "proprietaire_occupant",
    },
    devisOfficiel: {
      numero: MASSARDIER_CONTRAT_NUMERO,
      date: MASSARDIER_CONTRAT_DATE,
      reference: MASSARDIER_REFERENCE,
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
      apportPersonnel: FINANCEMENT_MASSARDIER.resteACharge,
      acompte: FINANCEMENT_MASSARDIER.acompte,
      intermediaire: FINANCEMENT_MASSARDIER.intermediaire,
      solde: FINANCEMENT_MASSARDIER.solde,
    },
    travaux: POSTES_MASSARDIER_CONTRAT.map((poste) => ({
      ...poste,
      familleId: "cuisines-agencement",
      categorieId: "cuisines-agencement-italien",
      prestationId: poste.id,
    })),
    mentionsJuridiques: [MENTION_HORS_MPR_MASSARDIER],
    photos: { paires: [] },
  };
}

export const PROJET_MASSARDIER_DEFAUT = {
  id: MASSARDIER_LEAD_ID,
  nom: CLIENT_MASSARDIER.nom,
  prenom: "Roger",
  ville: "À préciser",
  codePostal: "00000",
  adresse: "",
  telephone: CLIENT_MASSARDIER.telephone,
  email: "",
  rfr: null,
  statut: STATUT_MASSARDIER,
  priorite: PRIORITE_MASSARDIER,
  reference: MASSARDIER_REFERENCE,
  numeroAuditMar: MASSARDIER_REFERENCE,
  typeBien: "Cuisine & Agencement Italien (Catégorie 31)",
  typeProjet: DESCRIPTION_MASSARDIER,
  description: DESCRIPTION_MASSARDIER,
  source: "lead-prospect",
  sourceLead: SOURCE_MASSARDIER,
  createdAt: CLIENT_MASSARDIER.dateCreation,
  apporteurId: SOURCE_APPORTEUR_DAMIEN,
  apporteurNom: libelleSourceApporteur(SOURCE_APPORTEUR_DAMIEN, { select: true }),
  etapeAnah: ETAPE_ANAH_AUDIT,
  validationMar: false,
  acompte30Encaisse: false,
  dateVisiteTechnique: "",
  consultationDuo: false,
  statutCommission: STATUT_COMMISSION_EN_ATTENTE,
  detailJalon: PRIORITE_MASSARDIER,
  equipe: EQUIPE_MASSARDIER,
  montantEstimeTtc: MONTANT_ESTIME_MASSARDIER_TTC,
  montantHt: TOTAUX_MASSARDIER.totalHt,
  coutsTravauxHt: TOTAUX_MASSARDIER.coutsTravauxHt,
  commissionDamienHt: TOTAUX_MASSARDIER.commissionDamienHt,
  margeNetteEnergiaHt: TOTAUX_MASSARDIER.margeNetteEnergiaHt,
  syntheseFinanciere: { ...TOTAUX_MASSARDIER },
  travaux: [],
  margeDirectionHt: null,
  margeDirectionTtc: null,
  alertes: [
    "Rappel lundi matin — premier contact chaleureux pour qualifier la cuisine d'exception et caler le métré Direct Usine.",
  ],
};
