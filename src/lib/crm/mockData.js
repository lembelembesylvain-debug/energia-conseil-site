/**
 * Jeu de test local du CRM (hors production).
 * Source de vérité des montants : devis Monsieur Pereira fourni pour vérification
 * de l’affichage (CA prévisionnel) et de la répartition des marges.
 */

import { PEREIRA_AUDIT_ID } from "../../data/pereiraAuditExtract";
import { MARJOLLET_AUDIT_ID, MARJOLLET_HREF, MARJOLLET_IDENTITE } from "../../data/marjolletDossier";

export const TAUX_TVA_RENOVATION = 0.055;
export const TAUX_APPORTEUR = 0.1;
export const TAUX_PILOTAGE_ENERGIA = 0.1;

export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function euro(n, digits = 2) {
  return Number(n).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function sommeHt(lignes) {
  return round2((lignes ?? []).reduce((s, ligne) => s + Number(ligne.ht || 0), 0));
}

/**
 * Répartition : Part Travaux (lots + admin Clyve) / Part Apporteur / Part ENERGIA.
 * Les totaux HT/TTC du devis font foi lorsqu’ils sont renseignés.
 */
export function calculerMarges(dossier) {
  const partTravauxHt = sommeHt(dossier.travaux);
  const tauxApporteur = dossier.apporteur?.taux ?? TAUX_APPORTEUR;
  const tauxPilotage = dossier.pilotage?.taux ?? TAUX_PILOTAGE_ENERGIA;
  const partApporteurCalculee = round2(partTravauxHt * tauxApporteur);
  const partEnergiaCalculee = round2(partTravauxHt * tauxPilotage);
  const partApporteurHt = dossier.apporteur?.ht ?? partApporteurCalculee;
  const partEnergiaHt = dossier.pilotage?.ht ?? partEnergiaCalculee;
  const totalHtCalcule = round2(partTravauxHt + partApporteurHt + partEnergiaHt);
  const totalHt = dossier.totaux?.ht ?? totalHtCalcule;
  const totalTtcCalcule = round2(totalHt * (1 + (dossier.totaux?.tvaTaux ?? TAUX_TVA_RENOVATION)));
  const totalTtc = dossier.totaux?.ttc ?? totalTtcCalcule;

  return {
    partTravauxHt,
    partApporteurHt,
    partEnergiaHt,
    partApporteurCalculee,
    partEnergiaCalculee,
    totalHt,
    totalTtc,
    totalHtCalcule,
    tvaTaux: dossier.totaux?.tvaTaux ?? TAUX_TVA_RENOVATION,
    partTravauxPct: totalHt > 0 ? partTravauxHt / totalHt : 0,
    partApporteurPct: totalHt > 0 ? partApporteurHt / totalHt : 0,
    partEnergiaPct: totalHt > 0 ? partEnergiaHt / totalHt : 0,
  };
}

export function caPrevisionnelTtc(dossiers) {
  return round2((dossiers ?? []).reduce((s, dossier) => s + calculerMarges(dossier).totalTtc, 0));
}

export function dossiersVersAuditsCrm(dossiers) {
  return (dossiers ?? []).map((dossier) => {
    const marges = calculerMarges(dossier);
    return {
      id: dossier.id,
      auditId: dossier.auditId ?? "",
      nom: dossier.nom,
      nomRenseigne: true,
      ville: dossier.ville,
      adresse: dossier.adresse ?? "",
      statut: dossier.statut,
      etape: dossier.etape,
      paye: Boolean(dossier.paye),
      date: dossier.date,
      href: dossier.href || "",
      source: "test-local",
      typeProjet: dossier.typeProjet,
      apporteurNom: dossier.apporteur?.nom ?? "",
      interlocuteur: dossier.pilotage?.intervenant ?? "",
      telephone: dossier.telephone ?? "",
      email: dossier.email ?? "",
      factureElectrique: dossier.factureElectrique ?? "",
      caHt: marges.totalHt,
      caTtc: marges.totalTtc,
      travaux: dossier.travaux,
      marges,
      dossier,
    };
  });
}

/** Dossier de test — Monsieur Pereira. Montants du devis (HT) et totaux TTC 5,5 %. */
export const DOSSIER_PEREIRA = {
  id: "demo-pereira",
  auditId: PEREIRA_AUDIT_ID,
  nom: "Monsieur Pereira",
  typeProjet: "Rénovation Globale (Sortie de passoire thermique / Remplacement Fioul)",
  statut: "Devis en attente de signature / Lead qualifié",
  etape: "devis",
  paye: false,
  ville: "Nervieux (42)",
  date: "2026-09-03",
  href: "/test-maison-pereira",
  apporteur: {
    nom: "Damien Richards",
    role: "Apporteur d'affaires",
    taux: TAUX_APPORTEUR,
    ht: 3958.01,
  },
  pilotage: {
    nom: "ENERGIA CONSEIL IA",
    intervenant: "Sylvain LEMBELEMBE",
    taux: TAUX_PILOTAGE_ENERGIA,
    ht: 3958.01,
  },
  travaux: [
    {
      id: "isolation_toiture",
      posteId: "isolation_combles",
      label: "Isolation Toiture (60 m² Combles Perdus)",
      ordre: 1,
      ht: 3071.09,
      quantite: 60,
      unite: "m²",
    },
    {
      id: "isolation_plancher",
      posteId: "isolation_planchers",
      label: "Isolation Plancher Bas (19 m²)",
      ordre: 2,
      ht: 1500.0,
      quantite: 19,
      unite: "m²",
    },
    {
      id: "menuiseries",
      posteId: "fenetres_portes_fenetres",
      label: "Menuiseries (9 ouvertures Alu Gris)",
      ordre: 3,
      ht: 10236.97,
      quantite: 9,
      unite: "ouvertures",
    },
    {
      id: "vmc",
      posteId: "vmc_simple_flux",
      label: "VMC Simple Flux Hygroréglable",
      ordre: 4,
      ht: 1706.16,
      quantite: 1,
      unite: "forfait",
    },
    {
      id: "pac",
      posteId: "pac_air_eau",
      label: "PAC Air/Eau Haute Température 12kW",
      ordre: 5,
      ht: 18767.77,
      quantite: 1,
      unite: "forfait",
    },
    {
      id: "ballon",
      posteId: "ballon_thermodynamique",
      label: "Ballon Thermodynamique 250L",
      ordre: 6,
      ht: 3175.35,
      quantite: 1,
      unite: "forfait",
    },
    {
      id: "admin_clyve",
      posteId: "prestation_administrative",
      label: "Prestation Administrative (Clyve)",
      ordre: 7,
      ht: 1100.0,
      quantite: 1,
      unite: "forfait",
    },
  ],
  totaux: {
    ht: 47496.11,
    ttc: 50103.32,
    tvaTaux: TAUX_TVA_RENOVATION,
  },
};

/** Dossier de test — Monsieur Marjollet. Aucune prestation ni montant tant qu’une estimation n’est pas enregistrée. */
export const DOSSIER_MARJOLLET = {
  id: "demo-marjollet",
  auditId: MARJOLLET_AUDIT_ID,
  nom: MARJOLLET_IDENTITE.nom,
  typeProjet: MARJOLLET_IDENTITE.typeProjet,
  statut: MARJOLLET_IDENTITE.statut,
  etape: "devis",
  paye: false,
  ville: MARJOLLET_IDENTITE.ville,
  adresse: MARJOLLET_IDENTITE.adresse,
  departement: MARJOLLET_IDENTITE.departement,
  telephone: MARJOLLET_IDENTITE.telephone,
  email: MARJOLLET_IDENTITE.email,
  factureElectrique: MARJOLLET_IDENTITE.factureElectrique,
  date: MARJOLLET_IDENTITE.date,
  href: MARJOLLET_HREF,
  apporteur: {
    nom: MARJOLLET_IDENTITE.apporteur,
    role: "Apporteur d'affaires",
    taux: TAUX_APPORTEUR,
  },
  pilotage: {
    nom: "ENERGIA CONSEIL IA",
    intervenant: MARJOLLET_IDENTITE.interlocuteur,
    taux: TAUX_PILOTAGE_ENERGIA,
  },
  travaux: [],
};

export const DOSSIERS_TEST_LOCAUX = [DOSSIER_PEREIRA, DOSSIER_MARJOLLET];

export const AUDITS_TEST_LOCAUX = dossiersVersAuditsCrm(DOSSIERS_TEST_LOCAUX);

export const CA_PREVISIONNEL_TEST_TTC = caPrevisionnelTtc(DOSSIERS_TEST_LOCAUX);
