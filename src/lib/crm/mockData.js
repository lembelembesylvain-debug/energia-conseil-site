/**
 * Jeu de test local du CRM (hors production).
 * Source de vérité des montants : devis Monsieur Pereira fourni pour vérification
 * de l’affichage (CA prévisionnel) et de la répartition des marges.
 */

import { PEREIRA_AUDIT_ID } from "../../data/pereiraAuditExtract";
import { MARJOLLET_AUDIT_ID, MARJOLLET_HREF, MARJOLLET_IDENTITE } from "../../data/marjolletDossier";
import {
  COMMISSION_RATE_DEFAULT,
  calculerFinancesProjet,
} from "./finances";
import {
  HONORAIRES_HUB_ADMIN_HT,
  SOURCE_APPORTEUR_CATARINA,
  SOURCE_APPORTEUR_DIRECT,
  SOURCE_APPORTEUR_EXTERNE,
  etapeAnahDepuisStatut,
  infererSourceApporteur,
  libelleParcoursAnah,
  libelleSourceApporteur,
} from "./operationnelCrm.js";

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
    const commercial_id = dossier.commercial_id !== undefined ? dossier.commercial_id : null;
    const finances = calculerFinancesProjet({
      commercial_id,
      venteHt: marges.totalHt,
      coutArtisanHt: dossier.coutArtisanHt ?? null,
      partner_commission: dossier.partner_commission ?? 0,
      partner_id: dossier.partenaire_id ?? null,
      commission_rate_default:
        dossier.commission_rate_default !== undefined ? dossier.commission_rate_default : COMMISSION_RATE_DEFAULT,
    });
    const apporteurId = infererSourceApporteur({
      apporteurId: dossier.apporteur?.id,
      apporteurNom: dossier.apporteur?.nom,
    });
    const etapeAnah = dossier.etapeAnah || etapeAnahDepuisStatut(dossier.statut);
    return {
      id: dossier.id,
      auditId: dossier.auditId ?? "",
      nom: dossier.nom,
      nomRenseigne: true,
      ville: dossier.ville,
      adresse: dossier.adresse ?? "",
      statut: dossier.statut,
      etape: dossier.etape,
      etapeAnah,
      parcoursAnah: libelleParcoursAnah(etapeAnah),
      paye: Boolean(dossier.paye),
      date: dossier.date,
      href: dossier.href || "",
      source: "test-local",
      typeProjet: dossier.typeProjet,
      apporteurId,
      apporteurNom: dossier.apporteur?.nom ?? libelleSourceApporteur(apporteurId),
      interlocuteur: dossier.pilotage?.intervenant ?? "",
      telephone: dossier.telephone ?? "",
      email: dossier.email ?? "",
      factureElectrique: dossier.factureElectrique ?? "",
      caHt: marges.totalHt,
      caTtc: marges.totalTtc,
      commercial_id,
      commission_rate_default: finances.commission_rate_default,
      commission_amount: finances.commission_amount,
      partner_commission: finances.partner_commission,
      net_margin: finances.net_margin,
      travaux: dossier.travaux,
      marges,
      finances,
      dossier,
      echeancier: dossier.echeancier
        ?? (marges.totalTtc
          ? {
              acompte: round2(marges.totalTtc * 0.3),
              intermediaire: round2(marges.totalTtc * 0.4),
              solde: round2(marges.totalTtc - round2(marges.totalTtc * 0.3) - round2(marges.totalTtc * 0.4)),
            }
          : null),
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
    id: SOURCE_APPORTEUR_EXTERNE,
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
      label:
        "Remplacement chaudière fioul par PAC air/eau HT double service — 12 kW (estimation audit, à confirmer)",
      ordre: 5,
      ht: 18767.77,
      quantite: 1,
      unite: "forfait",
    },
    {
      id: "admin_clyve",
      posteId: "prestation_administrative",
      label: "Prestation Administrative (Clyve)",
      ordre: 6,
      ht: HONORAIRES_HUB_ADMIN_HT,
      quantite: 1,
      unite: "forfait",
    },
  ],
  totaux: {
    ht: 44320.76,
    ttc: 46758.4,
    tvaTaux: TAUX_TVA_RENOVATION,
  },
  echeancier: {
    acompte: 14027.52,
    intermediaire: 18703.36,
    solde: 14027.52,
  },
  commercial_id: null,
  commission_rate_default: COMMISSION_RATE_DEFAULT,
  /** Coût artisan non renseigné : les lignes travaux sont des prix de vente devis, pas des achats. */
  coutArtisanHt: null,
  /** Catarina non rattachée à ce dossier de test — commission partenaire configurée à part. */
  partner_commission: 0,
  partenaire_id: null,
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
    id: SOURCE_APPORTEUR_EXTERNE,
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
  commercial_id: null,
  commission_rate_default: COMMISSION_RATE_DEFAULT,
  coutArtisanHt: null,
  partner_commission: 0,
  partenaire_id: null,
};

/** Lead partenaire Catarina — hors CA prévisionnel (montant 0). */
export const DOSSIER_CATARINA_QR = {
  id: "demo-catarina-chagny",
  auditId: "LEAD-QR-CATARINA-2026",
  nom: "Lead QR · La Signature Immobilière",
  typeProjet: "Consultation Duo 390 € — valorisation patrimoniale (QR flyer Catarina)",
  statut: "Consultation Duo 390 € — à planifier",
  etape: "nouveau",
  paye: false,
  ville: "Chagny (71)",
  date: "2026-09-16",
  href: "/immobilier-chagny/",
  apporteur: {
    id: SOURCE_APPORTEUR_CATARINA,
    nom: "Catarina Martins · La Signature Immobilière",
    role: "Apporteur d'affaires",
    taux: TAUX_APPORTEUR,
    ht: 0,
  },
  pilotage: {
    nom: "ENERGIA CONSEIL IA",
    intervenant: "Sylvain LEMBELEMBE",
    taux: TAUX_PILOTAGE_ENERGIA,
    ht: 0,
  },
  travaux: [],
  totaux: {
    ht: 0,
    ttc: 0,
    tvaTaux: TAUX_TVA_RENOVATION,
  },
  commercial_id: null,
  commission_rate_default: COMMISSION_RATE_DEFAULT,
  coutArtisanHt: null,
  partner_commission: 0,
  partenaire_id: "catarina-martins",
};

/**
 * Maison Clyve — La Genête, phase 1 urgence hiver.
 * Lots 7 350 € HT + direction sanctuarisée 1 500 € HT = 8 850 € HT / 9 735 € TTC (TVA 10 %).
 */
export const DOSSIER_CLYVE_LAGENETE = {
  id: "demo-clyve-lagenete",
  auditId: "DEV-2026-LAGENETE-P1",
  nom: "Maison Clyve - La Genête",
  typeProjet: "Urgence hiver — charpente, hors d'eau et plomberie (phase 1)",
  statut: "Devis phase 1 en attente de signature",
  etape: "devis",
  paye: false,
  ville: "La Genête (71)",
  adresse: "654 route départementale 975, 71290 La Genête",
  date: "2026-09-23",
  href: "/longere-la-genete",
  telephone: "",
  email: "",
  apporteur: {
    id: SOURCE_APPORTEUR_DIRECT,
    nom: "Direct / Aucun",
    role: "Sans apporteur externe",
    taux: 0,
    ht: 0,
  },
  pilotage: {
    nom: "ENERGIA CONSEIL IA",
    intervenant: "Sylvain LEMBELEMBE",
    taux: 0,
    ht: 1500,
  },
  travaux: [
    { id: "clyve-sablieres", posteId: "charpente", label: "Pannes sablières sur têtes de murs en pisé (B–D)", ordre: 1, ht: 1850, quantite: 1, unite: "forfait" },
    { id: "clyve-pannes", posteId: "charpente", label: "Reprise des pannes dégradées (B–D)", ordre: 2, ht: 1650, quantite: 1, unite: "forfait" },
    { id: "clyve-volige", posteId: "charpente", label: "Platelage / voligeage continu", ordre: 3, ht: 1450, quantite: 1, unite: "forfait" },
    { id: "clyve-bache", posteId: "couverture", label: "Bâche armée — mise hors d'eau provisoire", ordre: 4, ht: 980, quantite: 1, unite: "forfait" },
    { id: "clyve-pise", posteId: "plomberie", label: "Étanchéité nourrice / cuivre — protection du pisé (B)", ordre: 5, ht: 620, quantite: 1, unite: "forfait" },
    { id: "clyve-groupe", posteId: "plomberie", label: "Groupe de sécurité ballon 200 L (A)", ordre: 6, ht: 280, quantite: 1, unite: "forfait" },
    { id: "clyve-gel", posteId: "plomberie", label: "Calorifugeage compteur et vanne (E)", ordre: 7, ht: 220, quantite: 1, unite: "forfait" },
    { id: "clyve-durgo", posteId: "plomberie", label: "Clapet aérateur Durgo", ordre: 8, ht: 300, quantite: 1, unite: "forfait" },
  ],
  totaux: {
    ht: 8850,
    ttc: 9735,
    tvaTaux: 0.1,
  },
  echeancier: {
    acompte: 2920.5,
    intermediaire: 3894,
    solde: 2920.5,
  },
  commercial_id: null,
  commission_rate_default: 0,
  coutArtisanHt: null,
  partner_commission: 0,
  partenaire_id: null,
};

export const DOSSIERS_TEST_LOCAUX = [
  DOSSIER_PEREIRA,
  DOSSIER_MARJOLLET,
  DOSSIER_CATARINA_QR,
  DOSSIER_CLYVE_LAGENETE,
];

export const AUDITS_TEST_LOCAUX = dossiersVersAuditsCrm(DOSSIERS_TEST_LOCAUX);

/** Pereira seul dans ce libellé : Marjollet et Catarina sont à 0, La Genête a son propre CA. */
export const CA_PREVISIONNEL_TEST_TTC = caPrevisionnelTtc(
  DOSSIERS_TEST_LOCAUX.filter((dossier) => dossier.id !== DOSSIER_CLYVE_LAGENETE.id),
);
