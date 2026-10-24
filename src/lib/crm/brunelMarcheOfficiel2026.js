/**
 * Marché officiel CRM — M. Emrick Brunel / Indivision COUBLE, Bussières (2026).
 * Chiffres figés. La TVA de l'option 1 est la TVA officielle 1 745,32 €
 * (somme des TVA de ligne), pas l'arrondi brut de 31 733,21 × 5,5 %.
 * Le contrat historique V4 (35 192,41 € HT) reste dans brunelDevisV3Officiel.js.
 */

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function ligne({
  id,
  nom,
  quantite,
  unite,
  puHt,
  totalHt,
  tauxTva,
  totalTva,
  ordreThermique,
  specifications,
  artisan,
  artisanId,
  grilleMetierId,
  designationBonCommande,
  coutFourniturePoseSaisiHt,
}) {
  const ht = round2(totalHt);
  const tva = totalTva != null ? round2(totalTva) : round2(ht * tauxTva);
  return {
    id,
    nom,
    quantite,
    unite,
    puHt: round2(puHt),
    totalHt: ht,
    tauxTva,
    totalTva: tva,
    totalTtc: round2(ht + tva),
    verrouillageOfficiel: true,
    ordreThermique,
    ...(specifications ? { specifications } : {}),
    ...(artisan ? { artisan } : {}),
    ...(artisanId ? { artisanId } : {}),
    ...(grilleMetierId ? { grilleMetierId } : {}),
    ...(designationBonCommande ? { designationBonCommande } : {}),
    ...(coutFourniturePoseSaisiHt != null ? { coutFourniturePoseSaisiHt } : {}),
  };
}

export const CLIENT_BRUNEL_MARCHE = {
  nom: "M. Emrick Brunel / Indivision COUBLE",
  adresse: "48 Impasse des Lagunes, 42510 Bussières",
  typeBien: "Maison individuelle (passoire thermique G → rénovation globale classe C)",
  scenarioMar: "Scénario n°3 (saut de 4 classes énergétiques)",
  dpeActuel: "G",
  dpeCible: "C",
  gainClasses: 4,
};

export const PROFIL_ANAH_BRUNEL = {
  id: "jaune",
  libelle: "JAUNE",
  taux: 0.6,
};

export const MAR_BRUNEL = {
  nom: "Antoine Baratier — Cabinet C2ET",
  honorairesTtc: 2000,
  tauxAideAnah: 0.4,
  aideAnah: 800,
  resteAChargeClientTtc: 1200,
};

/** Prestation MAR du contrat signable — profil JAUNE 60 % (option baie). */
export const MAR_BRUNEL_JAUNE = {
  nom: "Antoine Baratier — Cabinet C2ET",
  honorairesTtc: 2000,
  tauxAideAnah: 0.6,
  aideAnah: 1200,
  resteAChargeClientTtc: 800,
};

export const MARGE_CG_BRUNEL_HT = 5200;

export const STATUT_CRM_BRUNEL_MARCHE =
  "Devis validé — Dossier en attente de dépôt officiel par le MAR";

export const DETAIL_JALON_BRUNEL_DEPOT_MAR =
  "Devis validé / Dossier en attente de dépôt officiel par le MAR";

export const OFFRE_BRUNEL_OPTION_BAIE = "option-baie";
export const OFFRE_BRUNEL_OPTION_SANS_BAIE = "option-sans-baie";

const ID_BAIE = "brunel-2026-baie-ipn";
const ID_CG = "brunel-2026-direction-cg";

export const LIGNES_OPTION_BAIE = [
  ligne({
    id: "brunel-2026-combles-habitables",
    nom: "Isolation des combles perdus habitables",
    designationBonCommande:
      "Isolation combles soufflage laine de roche 300 mm R=7,0 (Combles perdus habitables éligibles Anah)",
    specifications:
      "Laine de roche soufflée 300 mm (R = 7,0), pare-vapeur, étanchéité. Soufflage laine de roche. Sous-traitance C2L : 30,00 € HT/m².",
    artisan: "C2L (RGE)",
    artisanId: "c2l-isolation",
    grilleMetierId: "combles-soufflage",
    coutFourniturePoseSaisiHt: 1050,
    quantite: 35,
    unite: "m²",
    puHt: 41.68,
    totalHt: 1458.8,
    tauxTva: 0.055,
    ordreThermique: 1,
  }),
  ligne({
    id: "brunel-2026-menuiseries-pvc",
    nom: "2 fenêtres double vitrage PVC blanc/gris à l'entrée",
    specifications:
      "2 fenêtres double vitrage PVC blanc/gris à l'entrée. Lot menuiseries, baie et ouverture IPN — Bonheur d'Amarante.",
    artisan: "Bonheur d'Amarante (RGE)",
    artisanId: "bonheur-amarante",
    grilleMetierId: "menuiseries-fenetres",
    quantite: 2,
    unite: "u",
    puHt: 900,
    totalHt: 1800,
    tauxTva: 0.055,
    ordreThermique: 4,
  }),
  ligne({
    id: "brunel-2026-porte-entree",
    nom: "Porte d'entrée isolée haute performance (Ud ≤ 1,3)",
    specifications:
      "1 porte d'entrée isolée haute performance Ud ≤ 1,3. Lot menuiseries, baie et ouverture IPN — Bonheur d'Amarante.",
    artisan: "Bonheur d'Amarante (RGE)",
    artisanId: "bonheur-amarante",
    grilleMetierId: "portes-isolantes",
    quantite: 1,
    unite: "u",
    puHt: 2100,
    totalHt: 2100,
    tauxTva: 0.055,
    ordreThermique: 4,
  }),
  ligne({
    id: ID_BAIE,
    nom: "Baie coulissante alu 215×240 avec ouverture mur porteur et linteau IPN/HEB",
    specifications:
      "1 ensemble baie coulissante alu 215×240 avec ouverture mur porteur moellons et pose linteau acier IPN/HEB avec rebouchage maçonné. Lot menuiseries, baie et ouverture IPN — Bonheur d'Amarante.",
    artisan: "Bonheur d'Amarante (RGE)",
    artisanId: "bonheur-amarante",
    grilleMetierId: "menuiseries-fenetres",
    quantite: 1,
    unite: "ens",
    puHt: 4800,
    totalHt: 4800,
    tauxTva: 0.055,
    ordreThermique: 4,
  }),
  ligne({
    id: "brunel-2026-vmc",
    nom: "VMC Hygro B basse consommation",
    specifications:
      "1 VMC Hygro B basse consommation (gaines isolées + bouches). Lot CVC / fluides — SMN ÉNERGIES / Mustafa HEZEN.",
    artisan: "SMN Énergies (RGE)",
    artisanId: "smn-energies",
    grilleMetierId: "vmc",
    quantite: 1,
    unite: "ens",
    puHt: 1650,
    totalHt: 1650,
    tauxTva: 0.055,
    ordreThermique: 5,
  }),
  ligne({
    id: "brunel-2026-cet",
    nom: "Chauffe-eau thermodynamique 200 L",
    specifications:
      "1 chauffe-eau thermodynamique 200 L. Lot CVC / fluides — SMN ÉNERGIES / Mustafa HEZEN.",
    artisan: "SMN Énergies (RGE)",
    artisanId: "smn-energies",
    grilleMetierId: "ballon-thermo",
    quantite: 1,
    unite: "u",
    puHt: 2800,
    totalHt: 2800,
    tauxTva: 0.055,
    ordreThermique: 7,
  }),
  ligne({
    id: "brunel-2026-pac",
    nom: "PAC Air/Air Daikin Multi-Split (groupe extérieur + 5 splits)",
    specifications:
      "1 PAC Air/Air Daikin Multi-Split (groupe extérieur + 5 unités intérieures splits). Lot CVC / fluides — SMN ÉNERGIES / Mustafa HEZEN.",
    artisan: "SMN Énergies (RGE)",
    artisanId: "smn-energies",
    grilleMetierId: "pac-air-air",
    quantite: 1,
    unite: "ens",
    puHt: 11924.41,
    totalHt: 11924.41,
    tauxTva: 0.055,
    ordreThermique: 6,
  }),
  ligne({
    id: ID_CG,
    nom: "Direction de projet et Contractant Général",
    quantite: 1,
    unite: "forfait",
    puHt: 5200,
    totalHt: 5200,
    tauxTva: 0.055,
    ordreThermique: 8,
  }),
];

/** Centime de TVA porté sur la ligne CG pour coller au total officiel 1 481,33 €. */
export const LIGNES_OPTION_SANS_BAIE = LIGNES_OPTION_BAIE.filter((item) => item.id !== ID_BAIE).map((item) =>
  item.id === ID_CG ? { ...item, totalTva: 286.01, totalTtc: 5486.01 } : { ...item },
);

export const LIGNES_DEVIS_HORS_ANAH = [
  ligne({
    id: "brunel-2026-hors-combles",
    nom: "Solde isolation combles non habitables",
    quantite: 65,
    unite: "m²",
    puHt: 41.68,
    totalHt: 2709.2,
    tauxTva: 0.1,
    ordreThermique: 1,
  }),
  ligne({
    id: "brunel-2026-hors-fenetres",
    nom: "2 fenêtres PVC solaires",
    quantite: 2,
    unite: "u",
    puHt: 1500,
    totalHt: 3000,
    tauxTva: 0.1,
    ordreThermique: 4,
  }),
  ligne({
    id: "brunel-2026-hors-porte-service",
    nom: "Porte de service garage / local technique",
    quantite: 1,
    unite: "u",
    puHt: 980,
    totalHt: 980,
    tauxTva: 0.1,
    ordreThermique: 4,
  }),
  ligne({
    id: "brunel-2026-hors-coordination",
    nom: "Coordination second œuvre",
    quantite: 1,
    unite: "forfait",
    puHt: 800,
    totalHt: 800,
    tauxTva: 0.1,
    ordreThermique: 8,
  }),
];

export const TOTAUX_OPTION_BAIE = {
  totalHt: 31733.21,
  totalTva: 1745.32,
  totalTtc: 33478.53,
  tauxTva: 0.055,
  subventionAnah: 19039.93,
  resteAChargeTravauxTtc: 14438.6,
  resteAChargeGlobalTtc: 15238.6,
  acompte: 10043.56,
  intermediaire: 13391.41,
  solde: 10043.56,
};

export const TOTAUX_OPTION_SANS_BAIE = {
  totalHt: 26933.21,
  totalTva: 1481.33,
  totalTtc: 28414.54,
  tauxTva: 0.055,
  subventionAnah: 12119.94,
  resteAChargeTravauxTtc: 16294.6,
  resteAChargeGlobalTtc: 17494.6,
  acompte: 8524.36,
  intermediaire: 11365.82,
  solde: 8524.36,
};

export const TOTAUX_DEVIS_HORS_ANAH = {
  totalHt: 7489.2,
  totalTva: 748.92,
  totalTtc: 8238.12,
  tauxTva: 0.1,
  acompte: 2471.44,
  intermediaire: 3295.25,
  solde: 2471.43,
};

export const CHEMIN_FICHE_TECHNIQUE_BRUNEL = "/data/FICHE_TECHNIQUE_NORMALISEE_BRUNEL.html";

export const MENTION_AIDES_BRUNEL_MARCHE =
  "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.";

export function offreMarcheBrunelActive(offreActive) {
  return offreActive === OFFRE_BRUNEL_OPTION_SANS_BAIE
    ? OFFRE_BRUNEL_OPTION_SANS_BAIE
    : OFFRE_BRUNEL_OPTION_BAIE;
}

export function lignesMarcheBrunel(offreActive) {
  return offreMarcheBrunelActive(offreActive) === OFFRE_BRUNEL_OPTION_SANS_BAIE
    ? LIGNES_OPTION_SANS_BAIE
    : LIGNES_OPTION_BAIE;
}

export function totauxMarcheBrunel(offreActive) {
  return offreMarcheBrunelActive(offreActive) === OFFRE_BRUNEL_OPTION_SANS_BAIE
    ? TOTAUX_OPTION_SANS_BAIE
    : TOTAUX_OPTION_BAIE;
}

export function libelleVerrouMarcheBrunel(offreActive) {
  const sansBaie = offreMarcheBrunelActive(offreActive) === OFFRE_BRUNEL_OPTION_SANS_BAIE;
  return sansBaie
    ? "Devis n°1 option 2 — sans baie vitrée ni linteau IPN — 26 933,21 € HT / 28 414,54 € TTC (TVA 5,5 %). Subvention ANAH 45 % : 12 119,94 €. Marge Contractant Général 5 200 € HT préservée. Devis n°2 hors ANAH : 7 489,20 € HT / 8 238,12 € TTC (TVA 10 %)."
    : "Devis n°1 option 1 — avec baie et IPN — 31 733,21 € HT / 33 478,53 € TTC (TVA 5,5 %). Subvention ANAH JAUNE 60 % : 19 039,93 €. Reste à charge travaux : 14 438,60 € TTC. Marge Contractant Général 5 200 € HT. Devis n°2 hors ANAH : 7 489,20 € HT / 8 238,12 € TTC (TVA 10 %).";
}

function somme(lignes, cle) {
  return round2(lignes.reduce((total, item) => total + Number(item[cle] || 0), 0));
}

export function verifierCoherenceMarcheBrunel() {
  const controles = [
    [somme(LIGNES_OPTION_BAIE, "totalHt"), TOTAUX_OPTION_BAIE.totalHt, "HT option 1"],
    [somme(LIGNES_OPTION_BAIE, "totalTva"), TOTAUX_OPTION_BAIE.totalTva, "TVA option 1"],
    [somme(LIGNES_OPTION_BAIE, "totalTtc"), TOTAUX_OPTION_BAIE.totalTtc, "TTC option 1"],
    [somme(LIGNES_OPTION_SANS_BAIE, "totalHt"), TOTAUX_OPTION_SANS_BAIE.totalHt, "HT option 2"],
    [somme(LIGNES_OPTION_SANS_BAIE, "totalTva"), TOTAUX_OPTION_SANS_BAIE.totalTva, "TVA option 2"],
    [somme(LIGNES_OPTION_SANS_BAIE, "totalTtc"), TOTAUX_OPTION_SANS_BAIE.totalTtc, "TTC option 2"],
    [somme(LIGNES_DEVIS_HORS_ANAH, "totalHt"), TOTAUX_DEVIS_HORS_ANAH.totalHt, "HT devis 2"],
    [somme(LIGNES_DEVIS_HORS_ANAH, "totalTva"), TOTAUX_DEVIS_HORS_ANAH.totalTva, "TVA devis 2"],
    [somme(LIGNES_DEVIS_HORS_ANAH, "totalTtc"), TOTAUX_DEVIS_HORS_ANAH.totalTtc, "TTC devis 2"],
    [round2(TOTAUX_OPTION_BAIE.totalTtc - TOTAUX_OPTION_BAIE.subventionAnah), TOTAUX_OPTION_BAIE.resteAChargeTravauxTtc, "RAC travaux option 1"],
    [round2(TOTAUX_OPTION_BAIE.totalHt * PROFIL_ANAH_BRUNEL.taux), TOTAUX_OPTION_BAIE.subventionAnah, "ANAH 60 % option 1"],
    [round2(TOTAUX_OPTION_BAIE.resteAChargeTravauxTtc + MAR_BRUNEL_JAUNE.resteAChargeClientTtc), TOTAUX_OPTION_BAIE.resteAChargeGlobalTtc, "RAC global option 1"],
    [round2(TOTAUX_OPTION_SANS_BAIE.totalTtc - TOTAUX_OPTION_SANS_BAIE.subventionAnah), TOTAUX_OPTION_SANS_BAIE.resteAChargeTravauxTtc, "RAC travaux option 2"],
    [round2(TOTAUX_OPTION_SANS_BAIE.resteAChargeTravauxTtc + MAR_BRUNEL.resteAChargeClientTtc), TOTAUX_OPTION_SANS_BAIE.resteAChargeGlobalTtc, "RAC global option 2"],
    [round2(TOTAUX_OPTION_BAIE.acompte + TOTAUX_OPTION_BAIE.intermediaire + TOTAUX_OPTION_BAIE.solde), TOTAUX_OPTION_BAIE.totalTtc, "30/40/30 option 1"],
    [round2(TOTAUX_OPTION_SANS_BAIE.acompte + TOTAUX_OPTION_SANS_BAIE.intermediaire + TOTAUX_OPTION_SANS_BAIE.solde), TOTAUX_OPTION_SANS_BAIE.totalTtc, "30/40/30 option 2"],
    [round2(TOTAUX_DEVIS_HORS_ANAH.acompte + TOTAUX_DEVIS_HORS_ANAH.intermediaire + TOTAUX_DEVIS_HORS_ANAH.solde), TOTAUX_DEVIS_HORS_ANAH.totalTtc, "30/40/30 devis 2"],
    [LIGNES_OPTION_BAIE.find((item) => item.id === ID_CG)?.totalHt, MARGE_CG_BRUNEL_HT, "marge CG option 1"],
    [LIGNES_OPTION_SANS_BAIE.find((item) => item.id === ID_CG)?.totalHt, MARGE_CG_BRUNEL_HT, "marge CG option 2"],
  ];
  const ecarts = controles.filter(([obtenu, attendu]) => obtenu !== attendu);
  if (ecarts.length) {
    throw new Error(ecarts.map(([obtenu, attendu, label]) => `${label} : ${obtenu} ≠ ${attendu}`).join(" | "));
  }
  return true;
}
