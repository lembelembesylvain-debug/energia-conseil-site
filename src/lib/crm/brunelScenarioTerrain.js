/**
 * Scénario terrain Brunel (Feurs 42110) — réconciliation audit / métrés site.
 *
 * Le PDF d’audit réglementaire n’est pas versionné dans le dépôt.
 * Postes chauffage / VMC / ECS repris des préconisations d’audit ENERGIA 2026
 * (PAC décarbonée post-isolation, VMC, CET), sans importer Bussières / Indivision COUBLE.
 *
 * Les montants restent indicatifs (catalogue marché 2026). Ce n’est pas un devis ferme.
 */

import { BRUNEL_DOSSIER_ID, SIGNATURES_BUSSIERES_INTERDITES } from "./brunelWorkingBase.js";
import {
  TVA_RENOVATION,
  calculerLigneTravaux,
  editionVide,
  totauxTravaux,
} from "./editionDossier.js";
import { snapshotProptech } from "./sauvegardeProptech.js";
import { calculerTunnelProptech, ecoPtzAutomatique } from "./tunnelProptech.js";

const TVA = TVA_RENOVATION;

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function htDepuisTtc(ttc) {
  return round2(ttc / (1 + TVA));
}

/** Métrés relevés sur site — ne pas substituer par les surfaces d’un autre dossier. */
export const METRES_TERRAIN_BRUNEL = {
  menuiseriesM2: 19.38,
  fenetresM2: 14.2,
  fixesOpaquesM2: 5.17,
  chassisTotal: 10,
  fenetresNb: 7,
  fixesOpaquesNb: 3,
  comblesM2: 60,
  comblesResistance: "R ≥ 7 m².K/W",
  plancherM2: 19,
  plancherResistance: "R ≥ 3 m².K/W",
  materiauMenuiseries: "Alu Gris — haute performance thermique",
  sansVoletsSolaires: true,
  sansVelux: true,
};

/** PU TTC médians catalogue marché 2026 — jamais un prix ferme. */
export const TARIFS_CATALOGUE_BRUNEL = {
  combles: { id: "marche-combles-deroule", medianTTC: 38, unite: "m²" },
  plancher: { id: "marche-plancher-bas", medianTTC: 50, unite: "m²" },
  fenetreAluGrisM2: { id: "marche-fenetre-alu-gris-m2", puHt: 550, unite: "m²" },
  vmcDf: { id: "marche-vmc-df-standard", medianTTC: 6000, unite: "forfait" },
  pac: { id: "marche-pac-ae-6kw", medianTTC: 10000, unite: "forfait" },
  cet: { id: "marche-cet-simple", medianTTC: 3200, unite: "forfait" },
};

export const PROFIL_MPR_INDICATIF_BRUNEL = {
  rfr: 18785,
  parts: 1,
  zone: "hors_idf",
  profil: "jaune",
  libelle: "Jaune — modestes (indicatif, à confirmer sur avis et foyer réel)",
  mention:
    "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.",
};

/**
 * Estimation 3CL simplifiée (ordre de grandeur ingénieur).
 * SHAB de référence = 60 m² (combles perdus relevés) tant que la SHAB cadastrale n’est pas figée.
 * Sans isolation des murs, F → B n’est pas garanti. Cible retenue : C (+3 classes).
 */
export function estimerGainEnergetiqueBrunel() {
  const cepAvant = 350;
  const reductions = [
    { poste: "Combles déroulés 60 m² R ≥ 7", facteur: 0.22 },
    { poste: "Plancher bas 19 m² R ≥ 3 (sous-face partielle)", facteur: 0.04 },
    { poste: "Menuiseries alu HP 19,38 m² (7 vitrages + 3 opaques, sans volets ni Velux)", facteur: 0.1 },
    { poste: "PAC air/eau post-isolation ~6 kW", facteur: 0.38 },
    { poste: "VMC double flux ≥ 85 %", facteur: 0.07 },
    { poste: "Ballon thermodynamique", facteur: 0.05 },
  ];
  let cep = cepAvant;
  const etapes = reductions.map((item) => {
    cep = round2(cep * (1 - item.facteur));
    return { ...item, cepApres: cep };
  });
  const cepApres = cep;
  const gainPct = round2(((cepAvant - cepApres) / cepAvant) * 100);
  const classe = (cepVal) => {
    if (cepVal <= 70) return "A";
    if (cepVal <= 110) return "B";
    if (cepVal <= 180) return "C";
    if (cepVal <= 250) return "D";
    if (cepVal <= 330) return "E";
    if (cepVal <= 420) return "F";
    return "G";
  };
  const dpeActuel = classe(cepAvant);
  const dpeCible = classe(cepApres);
  const lettres = ["G", "F", "E", "D", "C", "B", "A"];
  const gainClasses = lettres.indexOf(dpeCible) - lettres.indexOf(dpeActuel);

  return {
    methode: "Estimation ingénieur 3CL simplifiée — non substitutive d’un DPE officiel ni d’un audit réglementaire.",
    surfaceRefM2: METRES_TERRAIN_BRUNEL.comblesM2,
    surfaceRefMention: "SHAB de calcul = 60 m² (plafond combles relevé). Surface habitable exacte à confirmer.",
    cepAvant,
    cepApres,
    unite: "kWhEP/m².an",
    gainPct,
    dpeActuel,
    dpeCible,
    gainClasses,
    dpeBGaranti: dpeCible === "B" || dpeCible === "A",
    eligibiliteParcours: gainClasses >= 2,
    plafondMprHt: gainClasses >= 3 ? 40000 : 30000,
    reserveMurs:
      "Les murs ne font pas partie du relevé terrain. Sans ITI/ITE, le saut F → B n’est pas garanti. Cible retenue : DPE C (+3 classes), éligible Parcours Accompagné (plafond 40 000 € HT).",
    etapes,
    ordreTravaux: [
      "Isolation combles",
      "Isolation plancher bas",
      "Menuiseries alu gris",
      "VMC double flux",
      "PAC air/eau post-isolation",
      "Ballon thermodynamique",
    ],
  };
}

function ligneCatalogue({
  id,
  nom,
  familleId,
  categorieId,
  prestationId,
  quantite,
  unite,
  medianTTC,
  puHt,
  ordreThermique,
}) {
  return calculerLigneTravaux({
    id,
    nom,
    familleId,
    categorieId,
    prestationId,
    quantite,
    unite,
    puHt: puHt != null ? round2(puHt) : htDepuisTtc(medianTTC),
    tauxTva: TVA,
    sourcePrix: "marche",
    ordreThermique,
  });
}

export function lignesTravauxBrunelTerrain() {
  const t = TARIFS_CATALOGUE_BRUNEL;
  const m = METRES_TERRAIN_BRUNEL;
  return [
    ligneCatalogue({
      id: "brunel-combles",
      nom: "Isolation combles perdus déroulés R ≥ 7 (relevé terrain 60 m²)",
      familleId: "isolation",
      categorieId: "isolation",
      prestationId: t.combles.id,
      quantite: m.comblesM2,
      unite: t.combles.unite,
      medianTTC: t.combles.medianTTC,
    }),
    ligneCatalogue({
      id: "brunel-plancher",
      nom: "Isolation plancher bas sous-face dalle R ≥ 3 (relevé terrain 19 m²)",
      familleId: "isolation",
      categorieId: "isolation",
      prestationId: t.plancher.id,
      quantite: m.plancherM2,
      unite: t.plancher.unite,
      medianTTC: t.plancher.medianTTC,
    }),
    ligneCatalogue({
      id: "brunel-fenetres",
      nom: "Fenêtre / châssis aluminium double vitrage Uw ≤ 1.3 (Alu Gris) — 19,38 m² (7 fenêtres 14,20 m² + 3 opaques 5,17 m², sans volets, sans Velux)",
      familleId: "menuiseries",
      categorieId: "menuiserie",
      prestationId: t.fenetreAluGrisM2.id,
      quantite: m.menuiseriesM2,
      unite: t.fenetreAluGrisM2.unite,
      puHt: t.fenetreAluGrisM2.puHt,
    }),
    ligneCatalogue({
      id: "brunel-vmc",
      nom: "VMC double flux rendement ≥ 85 % (post-isolation)",
      familleId: "ventilation",
      categorieId: "electricite",
      prestationId: t.vmcDf.id,
      quantite: 1,
      unite: t.vmcDf.unite,
      medianTTC: t.vmcDf.medianTTC,
    }),
    ligneCatalogue({
      id: "brunel-pac",
      nom: "PAC air/eau ~6 kW — dimensionnement post-isolation (décarbonation)",
      familleId: "chauffage",
      categorieId: "pompe-a-chaleur",
      prestationId: t.pac.id,
      quantite: 1,
      unite: t.pac.unite,
      medianTTC: t.pac.medianTTC,
    }),
    ligneCatalogue({
      id: "brunel-cet",
      nom: "Chauffe-eau thermodynamique 200–270 L (ECS décarbonée)",
      familleId: "ecs",
      categorieId: "plomberie-sanitaire",
      prestationId: t.cet.id,
      quantite: 1,
      unite: t.cet.unite,
      medianTTC: t.cet.medianTTC,
    }),
  ];
}

export function editionBrunelTerrain() {
  const gain = estimerGainEnergetiqueBrunel();
  const vide = editionVide();
  return {
    ...vide,
    client: {
      ...vide.client,
      nom: "Brunel",
      prenom: "Emrick",
      adresse: "42110 FEURS",
      surfaceHabitable: String(METRES_TERRAIN_BRUNEL.comblesM2),
      statutOccupation: "proprietaire_occupant",
    },
    travaux: lignesTravauxBrunelTerrain(),
    aides: {
      ...vide.aides,
      profil: PROFIL_MPR_INDICATIF_BRUNEL.profil,
      parcours: "parcours",
      gainClasses: 2,
      region: "AURA",
      overrides: { mpr: null, cee: null, locales: null, coupDePouce: null },
    },
    valorisation: {
      ...vide.valorisation,
      dpeActuel: gain.dpeActuel,
      dpeCible: gain.dpeCible,
    },
    pieces: {
      ...vide.pieces,
      avis_imposition: { ...vide.pieces.avis_imposition, statut: "recue", nomFichier: "Document sécurisé" },
    },
    reconciliationTerrain: {
      ...METRES_TERRAIN_BRUNEL,
      gain,
      mention: PROFIL_MPR_INDICATIF_BRUNEL.mention,
      horsVoletsVelux: true,
      sourceMetres: "Relevé terrain ENERGIA — 16 septembre 2026",
    },
  };
}

export function scenarioFinancierBrunel() {
  const edition0 = editionBrunelTerrain();
  const totaux = totauxTravaux(edition0.travaux);
  const tunnel0 = calculerTunnelProptech(edition0, { dpeActuel: edition0.valorisation.dpeActuel });
  const auto = ecoPtzAutomatique(tunnel0.resteACharge, { parcours: edition0.aides.parcours });
  const edition = {
    ...edition0,
    financement: {
      ecoPtzMontant: auto.montant,
      ecoPtzDuree: auto.duree,
      apportPersonnel: null,
    },
  };
  const tunnel = calculerTunnelProptech(edition, { dpeActuel: edition.valorisation.dpeActuel });
  return { edition, totaux, tunnel, ecoPtz: auto, gain: edition.reconciliationTerrain.gain };
}

export function snapshotBrunelTerrain({ role = "commercial", date = new Date().toISOString() } = {}) {
  const { edition, tunnel } = scenarioFinancierBrunel();
  const snapshot = snapshotProptech({
    dossierId: BRUNEL_DOSSIER_ID,
    edition,
    role,
    sniper: null,
    tunnel,
  });
  return {
    ...snapshot,
    date,
    reconciliationTerrain: edition.reconciliationTerrain,
  };
}

export function payloadSansContamination(value) {
  return JSON.stringify(value).toLowerCase();
}

export function signaturesInterditesDans(value) {
  const payload = payloadSansContamination(value);
  return SIGNATURES_BUSSIERES_INTERDITES.filter((signature) => payload.includes(signature));
}

export function surfaceVitreieTotale() {
  return round2(METRES_TERRAIN_BRUNEL.fenetresM2 + METRES_TERRAIN_BRUNEL.fixesOpaquesM2);
}
