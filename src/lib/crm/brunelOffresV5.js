/**
 * Dossier Brunel V5 — double proposition contractuelle.
 * Option 1 : rénovation globale Performance (marché subventionné TVA 5,5 %).
 * Option 2 : pack autonomie solaire 6 kWc + batterie 7 kWh (lot complémentaire TVA 20 %).
 */

import {
  AIDES_BRUNEL_V4,
  FINANCEMENT_BRUNEL_V4,
  TOTAUX_BRUNEL_V4,
  lignesTravauxBrunelV4,
} from "./brunelDevisV3Officiel.js";

export const BRUNEL_V5_VERSION = "V5";
export const BRUNEL_V5_DATE = "2026-09-20";

export const OFFRE_PERFORMANCE = "performance";
export const OFFRE_AUTONOMIE = "autonomie";

export const POSTE_SOLAIRE_V5_ID = "v5-poste-solaire-6kwc";

export const TOTAUX_BRUNEL_V5_PERFORMANCE = TOTAUX_BRUNEL_V4;

export const TOTAUX_BRUNEL_V5_SOLAIRE = {
  totalHt: 15000,
  totalTva: 3000,
  totalTtc: 18000,
  tauxTva: 0.2,
};

export const TOTAUX_BRUNEL_V5_CUMUL = {
  totalHt: 50192.41,
  totalTva: 4935.58,
  totalTtc: 55127.99,
};

export const ECHEANCIER_BRUNEL_V5_PERFORMANCE = {
  acomptePct: 0.3,
  acompte: 11138.4,
  intermediairePct: 0.4,
  intermediaire: 14851.2,
  soldePct: 0.3,
  solde: 11138.39,
};

export const ECHEANCIER_BRUNEL_V5_AUTONOMIE = {
  acomptePct: 0.3,
  acompte: 16538.4,
  intermediairePct: 0.4,
  intermediaire: 22051.2,
  soldePct: 0.3,
  solde: 16538.39,
};

export const AIDES_BRUNEL_V5_PERFORMANCE = AIDES_BRUNEL_V4;

export const AIDES_BRUNEL_V5_AUTONOMIE = {
  ...AIDES_BRUNEL_V4,
  resteACharge: 25707.99,
};

export const FINANCEMENT_BRUNEL_V5_PERFORMANCE = FINANCEMENT_BRUNEL_V4;

/** RAC 25 707,99 € / 240 mois = 107,12 €. Économies 150 € (thermique) + 119,17 € (solaire). */
export const FINANCEMENT_BRUNEL_V5_AUTONOMIE = {
  ecoPtzMontant: 25707.99,
  ecoPtzDuree: 20,
  mensualite: 107,
  mensualiteExacte: 107.12,
  economiesMensuelles: 269.17,
  bilanNetMensuel: 162.05,
  acomptePct: 0.3,
  acompte: 16538.4,
  intermediairePct: 0.4,
  intermediaire: 22051.2,
  soldePct: 0.3,
  solde: 16538.39,
  apportPersonnel: 0,
};

export const METRIQUES_SOLAIRES_BRUNEL = {
  puissanceKwc: 6,
  modules: 12,
  moduleModele: "DualSun Flash 500 Wc Bi-verre TOPCon",
  microOnduleurs: "Enphase IQ8HC / IQ8P",
  batterieKwh: 7,
  batterieModele: "Enphase IQ Battery 7 kWh LFP",
  productionKwhAn: 7268,
  autoconsommationPct: 78,
  economieAnnee1: 1430,
  factureSansSolaire: 2060,
  factureAvecSolaire: 650,
  investissementTtc: 18000,
};

export const ARGUMENTS_SOLAIRES_BRUNEL = [
  {
    titre: "Placement à 8,2 % net d’impôt",
    texte: "Aucun livret A ni assurance-vie ne rapporte 8 % net sans risque. Le soleil se lève tous les matins.",
  },
  {
    titre: "Amorti en moins de 10 ans",
    texte: "Ensuite, 15 ans d’énergie garantie DualSun et Enphase. Point mort atteint en année 10.",
  },
  {
    titre: "Près de 40 000 € de trésorerie préservée",
    texte: "Sur 25 ans de garantie, le gain net après amortissement complet atteint 39 200 €.",
  },
];

export const JALONS_ROI_BRUNEL = [1, 3, 5, 8, 10, 15, 20, 25];

export const KPI_ROI_BRUNEL_DEFAUT = {
  triAns: 9.8,
  anneePointMort: 10,
  rendementAnnuelPct: 8.2,
  gainNet25Ans: 39200,
  cumul25Ans: 57200,
};

export const NOTE_METHODO_ROI_BRUNEL =
  "Note méthodologique : Calcul établi sur la base du tarif réglementé de l'électricité à 0,25 €/kWh en 2026, revente du surplus résiduel à 0,011 €/kWh (arrêté juin 2026) et indexation prévisionnelle de +3,5 %/an. Garantie de performance constructeur DualSun de 25 à 30 ans.";

/** Tableau contractuel officiel — jalons V5 (18 000 € TTC, 7 268 kWh/an, 78 %, +3,5 %/an). */
export const TABLEAU_AMORTISSEMENT_OFFICIEL_BRUNEL = [
  {
    annee: 1,
    jalon: "Année 1",
    productionKwh: 7268,
    autoPct: 78,
    economieAnnuelle: 1430,
    cumul: 1430,
    bilan: -16570,
  },
  {
    annee: 3,
    jalon: "Année 3",
    productionKwh: 7268,
    autoPct: 78,
    economieAnnuelle: 1532,
    cumul: 4456,
    bilan: -13544,
  },
  {
    annee: 5,
    jalon: "Année 5",
    productionKwh: 7268,
    autoPct: 78,
    economieAnnuelle: 1641,
    cumul: 7644,
    bilan: -10356,
  },
  {
    annee: 8,
    jalon: "Année 8",
    productionKwh: 7268,
    autoPct: 78,
    economieAnnuelle: 1819,
    cumul: 12876,
    bilan: -5124,
  },
  {
    annee: 10,
    jalon: "Année 10 (AMORTI)",
    productionKwh: 7268,
    autoPct: 78,
    economieAnnuelle: 1950,
    cumul: 18522,
    bilan: 522,
    badge: "Point mort franchi",
    highlight: "amorti",
  },
  {
    annee: 15,
    jalon: "Année 15",
    productionKwh: 7268,
    autoPct: 78,
    economieAnnuelle: 2316,
    cumul: 29270,
    bilan: 11270,
    badge: "Bénéfice net",
  },
  {
    annee: 20,
    jalon: "Année 20",
    productionKwh: 7268,
    autoPct: 78,
    economieAnnuelle: 2751,
    cumul: 42040,
    bilan: 24040,
    badge: "Bénéfice net",
  },
  {
    annee: 25,
    jalon: "Année 25 (Garantie)",
    productionKwh: 7268,
    autoPct: 78,
    economieAnnuelle: 3267,
    cumul: 57200,
    bilan: 39200,
    badge: "NET CLIENT",
    highlight: "garantie",
  },
];

export const NOTE_SOLAIRE_HORS_MPR =
  "LOT COMPLÉMENTAIRE — PACK AUTONOMIE SOLAIRE 6 kWc + batterie 7 kWh : 15 000,00 € HT | TVA 20,0 % : 3 000,00 € | 18 000,00 € TTC. Hors marché subventionné MaPrimeRénov’ (TVA 20 %). Pose RGE QualiPV, Consuel inclus.";

export const POSTE_SOLAIRE_BRUNEL_V5 = {
  id: POSTE_SOLAIRE_V5_ID,
  familleId: "solaire",
  nom: "Pack Autonomie Solaire & Stockage 6 kWc (DualSun + Enphase + batterie 7 kWh)",
  specifications:
    "12 modules DualSun Flash 500 Wc Bi-verre TOPCon (génération 6,00 kWc) + 12 micro-onduleurs Enphase IQ8HC/IQ8P (garantie 25 ans) + batterie résidentielle Enphase IQ Battery 7 kWh LFP + passerelle IQ Envoy + coffret AC/DC + structure surimposition. Pose, raccordement, mise en service RGE QualiPV et passage Consuel. Lot complémentaire hors MaPrimeRénov’ — TVA 20 %.",
  artisan: "RGE QualiPV (sélection Sylvain LEMBELEMBE)",
  quantite: 1,
  unite: "lot",
  puHt: 15000,
  tauxTva: 0.2,
  totalHt: 15000,
  totalTva: 3000,
  totalTtc: 18000,
  ordreThermique: 8,
  ordreContractuel: "9",
  verrouillageOfficiel: true,
  quantiteFlexible: false,
  sourcePrix: "devis-v5-solaire",
  versionOfficielle: BRUNEL_V5_VERSION,
  prestationId: POSTE_SOLAIRE_V5_ID,
  horsSubventionMpr: true,
};

export const SRC_FACADE_BAIE_BRUNEL =
  "/projects/brunel/renovation-architecturale-contemporaine-anthracite.jpg";
export const SRC_FACADE_SUD_SOLAIRE_BRUNEL =
  "/projects/brunel/facade-sud-panneaux-solaires-gris-anthracite.jpg";
export const SRC_UNITE_DAIKIN_BRUNEL =
  "/projects/brunel/unite-exterieure-daikin-sur-mur-de-pierre-anthracite.jpg";

export const IMAGES_CONTRAT_BRUNEL_V5 = [
  {
    id: "facade-baie-215x240",
    src: SRC_FACADE_BAIE_BRUNEL,
    fallbackSrc: "/images/brunel/facade-brunel.jpg",
    alt: "Façade validée — baie vitrée coulissante 215×240 RAL 7016",
    titre: "Façade validée baie 215×240",
    legend:
      "Façade validée — baie vitrée coulissante 215×240 RAL 7016, création d’ouverture sous linteau porteur. Rendu contractuel conforme au dossier de Déclaration Préalable (DP) Mairie de Bussières.",
  },
  {
    id: "facade-sud-solaire",
    src: SRC_FACADE_SUD_SOLAIRE_BRUNEL,
    fallbackSrc: "/images/brunel/facade-brunel.jpg",
    alt: "Projection Façade Sud — 12 panneaux DualSun 500 Wc",
    titre: "Projection Façade Sud — Confort & Autonomie Solaire",
    legend: "Projection Façade Sud — Confort & Autonomie Solaire (12 panneaux DualSun 500 Wc · 7 268 kWh/an)",
  },
  {
    id: "pignon-pac-daikin",
    src: SRC_UNITE_DAIKIN_BRUNEL,
    fallbackSrc: "",
    alt: "Unité extérieure PAC Daikin en pignon ombragé",
    titre: "Implantation Technique — Unité Extérieure PAC Daikin",
    legend:
      "Implantation Technique — Unité Extérieure PAC Daikin en pignon ombragé sur plots antivibratiles (conforme DTU)",
  },
];

export const GALERIE_PROJECTIONS_BRUNEL = [
  {
    id: IMAGES_CONTRAT_BRUNEL_V5[0].id,
    src: IMAGES_CONTRAT_BRUNEL_V5[0].src,
    fallbackSrc: IMAGES_CONTRAT_BRUNEL_V5[0].fallbackSrc,
    titre: IMAGES_CONTRAT_BRUNEL_V5[0].titre,
    description: IMAGES_CONTRAT_BRUNEL_V5[0].legend,
    badge: "Baie 215×240 · RAL 7016",
    statut: "Rendu officiel V5",
  },
  {
    id: IMAGES_CONTRAT_BRUNEL_V5[1].id,
    src: IMAGES_CONTRAT_BRUNEL_V5[1].src,
    fallbackSrc: IMAGES_CONTRAT_BRUNEL_V5[1].fallbackSrc,
    titre: IMAGES_CONTRAT_BRUNEL_V5[1].titre,
    description:
      "Toiture équipée de 12 panneaux DualSun 500 Wc (6 kWc) plein Sud, baie vitrée 215x240 RAL 7016 et jardin préservé sans groupe technique apparent.",
    badge: "Orientation Sud · 7 268 kWh/an",
    statut: "Rendu officiel V5",
  },
  {
    id: IMAGES_CONTRAT_BRUNEL_V5[2].id,
    src: IMAGES_CONTRAT_BRUNEL_V5[2].src,
    fallbackSrc: IMAGES_CONTRAT_BRUNEL_V5[2].fallbackSrc,
    titre: IMAGES_CONTRAT_BRUNEL_V5[2].titre,
    description:
      "Installation en pignon ombragé abrité sur dalle béton avec plots antivibratiles et goulotte technique RAL 7016 (conforme DTU, hors surchauffe Sud).",
    badge: "Conformité DTU Frigorifique · Pignon Ombragé",
    statut: "Rendu officiel V5",
  },
];

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function normaliserOffreBrunel(value) {
  return value === OFFRE_AUTONOMIE ? OFFRE_AUTONOMIE : OFFRE_PERFORMANCE;
}

export function estOffreAutonomieBrunel(edition) {
  if (normaliserOffreBrunel(edition?.offreActive) === OFFRE_AUTONOMIE) return true;
  return (edition?.travaux || []).some((ligne) => ligne?.id === POSTE_SOLAIRE_V5_ID);
}

export function lignesTravauxBrunelV5(offre = OFFRE_PERFORMANCE) {
  const thermiques = lignesTravauxBrunelV4().map((ligne) => ({
    ...ligne,
    versionOfficielle: ligne.versionOfficielle || "V4",
  }));
  if (normaliserOffreBrunel(offre) !== OFFRE_AUTONOMIE) return thermiques;
  return [...thermiques, { ...POSTE_SOLAIRE_BRUNEL_V5 }];
}

export function totauxContractuelsBrunelV5(offre = OFFRE_PERFORMANCE) {
  const lignes = lignesTravauxBrunelV5(offre);
  if (normaliserOffreBrunel(offre) === OFFRE_AUTONOMIE) {
    return { lignes, ...TOTAUX_BRUNEL_V5_CUMUL };
  }
  return { lignes, ...TOTAUX_BRUNEL_V5_PERFORMANCE };
}

export function libelleOffreBrunel(offre = OFFRE_PERFORMANCE) {
  if (normaliserOffreBrunel(offre) === OFFRE_AUTONOMIE) {
    return "Formule Autonomie Solaire Totale (55 127,99 € TTC)";
  }
  return "Formule Performance Thermique (37 127,99 € TTC)";
}

export function recapOffreBrunel(offre = OFFRE_PERFORMANCE) {
  const autonomie = normaliserOffreBrunel(offre) === OFFRE_AUTONOMIE;
  const totaux = autonomie ? TOTAUX_BRUNEL_V5_CUMUL : TOTAUX_BRUNEL_V5_PERFORMANCE;
  const aides = autonomie ? AIDES_BRUNEL_V5_AUTONOMIE : AIDES_BRUNEL_V5_PERFORMANCE;
  const financement = autonomie ? FINANCEMENT_BRUNEL_V5_AUTONOMIE : FINANCEMENT_BRUNEL_V5_PERFORMANCE;
  return {
    offre: autonomie ? OFFRE_AUTONOMIE : OFFRE_PERFORMANCE,
    libelle: libelleOffreBrunel(offre),
    totalHt: totaux.totalHt,
    totalTva: totaux.totalTva,
    totalTtc: totaux.totalTtc,
    totalAides: aides.totalAides,
    resteACharge: aides.resteACharge,
    mensualite: financement.mensualiteExacte,
    economiesMensuelles: financement.economiesMensuelles,
    bilanNetMensuel: financement.bilanNetMensuel,
    acompte: financement.acompte,
    intermediaire: financement.intermediaire,
    solde: financement.solde,
    solaireInclus: autonomie,
  };
}

/**
 * Tableau d’amortissement solaire — inflation électrique au choix (3 % / 3,5 % / 5 %).
 * Année n : économie = 1 430 × (1+r)^(n-1) ; cumul = somme ; facture sans solaire = 2 060 × (1+r)^(n-1).
 */
export function calculerAmortissementSolaireBrunel(tauxInflation = 0.035, dureeAns = 25) {
  const r = Number(tauxInflation);
  const investissement = METRIQUES_SOLAIRES_BRUNEL.investissementTtc;
  const e0 = METRIQUES_SOLAIRES_BRUNEL.economieAnnee1;
  const f0 = METRIQUES_SOLAIRES_BRUNEL.factureSansSolaire;
  const lignes = [];
  let cumul = 0;
  let anneePointMort = null;

  for (let annee = 1; annee <= dureeAns; annee += 1) {
    const facteur = (1 + r) ** (annee - 1);
    const economieAnnuelle = round2(e0 * facteur);
    const factureSansSolaire = round2(f0 * facteur);
    cumul = round2(cumul + economieAnnuelle);
    if (anneePointMort == null && cumul >= investissement) anneePointMort = annee;
    lignes.push({
      annee,
      factureSansSolaire,
      economieAnnuelle,
      economieCumulee: cumul,
      pointMort: anneePointMort != null && annee >= anneePointMort,
      jalon: JALONS_ROI_BRUNEL.includes(annee),
    });
  }

  const cumul25 = lignes[dureeAns - 1]?.economieCumulee ?? 0;
  const gainNet25 = round2(cumul25 - investissement);
  const triAns =
    anneePointMort == null
      ? null
      : interpolerTri(lignes, investissement, anneePointMort);
  const rendementAnnuelPct =
    dureeAns > 0 && investissement > 0 ? round2((gainNet25 / investissement / dureeAns) * 100) : 0;

  return {
    tauxInflation: r,
    investissement,
    anneePointMort,
    triAns,
    rendementAnnuelPct,
    gainNet25Ans: gainNet25,
    cumul25Ans: cumul25,
    lignes,
    jalons: lignes.filter((l) => l.jalon),
  };
}

function interpolerTri(lignes, investissement, anneePointMort) {
  if (anneePointMort <= 1) return 1;
  const precedente = lignes[anneePointMort - 2];
  const actuelle = lignes[anneePointMort - 1];
  const delta = actuelle.economieCumulee - precedente.economieCumulee;
  if (delta <= 0) return anneePointMort;
  const fraction = (investissement - precedente.economieCumulee) / delta;
  return round2(anneePointMort - 1 + Math.max(0, Math.min(1, fraction)));
}
