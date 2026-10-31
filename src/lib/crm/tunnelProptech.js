/**
 * Tunnel financier & technique PropTech — cascade automatique indicative 2026.
 *
 * Surface × PU catalogue → TTC → aides MPR/CEE → RAC → Éco-PTZ 0 % → plus-value / ROI.
 * Les aides restent « à titre indicatif ». L’onglet Finances (marges) n’est pas exposé ici.
 */

import {
  CANAL_ECO_PTZ_ETAT,
  CANAL_PRET_TRAVAUX_FABIEN,
  ECO_PTZ_MAX,
  MENTION_AIDES_EDITION,
  MENTION_FINANCEMENT_EDITION,
  calculerAidesIndicatives,
  calculerFinancement,
  mensualiteTauxZero,
  simulationsEcoPtzEtat,
  totauxTravaux,
} from "./editionDossier.js";

export const MENTION_PLUS_VALUE =
  "Plus-value vénale et ROI propriétaire : estimation indicative 2026, hors frais de notaire. À valider par une expertise immobilière. Ne constitue pas une garantie de prix de vente.";

/** Médiane indicative BFC / AURA rural si aucun DVF n’est disponible. */
export const PRIX_M2_DEFAUT_BFC = 1850;

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function nombreOuNull(value) {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function extraireSurfaceTravaux(edition) {
  const surfaceClient = nombreOuNull(edition?.client?.surfaceHabitable);
  const lignes = Array.isArray(edition?.travaux) ? edition.travaux : [];
  const surfaceLignes = lignes.reduce((somme, ligne) => {
    const unite = String(ligne.unite || "").toLowerCase();
    if (unite.includes("m") && (unite.includes("²") || unite.includes("2"))) {
      return somme + Math.max(0, nombreOuNull(ligne.quantite) ?? 0);
    }
    return somme;
  }, 0);
  return {
    surfaceHabitable: surfaceClient,
    surfaceLignesM2: surfaceLignes > 0 ? round2(surfaceLignes) : null,
    surfaceRef: surfaceClient || (surfaceLignes > 0 ? round2(surfaceLignes) : null),
  };
}

/**
 * Prime vénale indicative liée au gain de classes DPE (Notaires / observatoires 2024-2026, fourchette).
 * Calibrée pour un pavillon 164 m² à 1 850 €/m² passoire F, 2 classes : ≈ +53 000 €.
 */
export function primePlusValue({ gainClasses = 2, dpeActuel = "" } = {}) {
  let prime = Number(gainClasses) >= 3 ? 0.2 : 0.14;
  const dpe = String(dpeActuel || "").toUpperCase();
  if (dpe === "G") prime += 0.05;
  else if (dpe === "F") prime += 0.035;
  else if (dpe === "E") prime += 0.02;
  return round2(prime);
}

export function calculerPlusValueVenale({
  surfaceHabitable,
  prixM2Constate,
  gainClasses = 2,
  dpeActuel = "",
} = {}) {
  const surface = nombreOuNull(surfaceHabitable) ?? 0;
  const prixM2 = nombreOuNull(prixM2Constate) > 0 ? round2(nombreOuNull(prixM2Constate)) : PRIX_M2_DEFAUT_BFC;
  const prime = primePlusValue({ gainClasses, dpeActuel });
  const valeurActuelle = round2(surface * prixM2);
  const montant = round2(valeurActuelle * prime);
  return {
    calculable: surface > 0,
    surface,
    prixM2,
    prime,
    valeurActuelle,
    montant,
    mention: MENTION_PLUS_VALUE,
  };
}

/**
 * Éco-PTZ 0 %. Rénovation d’ampleur (Parcours Accompagné) : 20 ans.
 * Geste / hors parcours : 15 ans si montant ≤ 25 000 €, sinon 20 ans.
 */
export function ecoPtzAutomatique(resteACharge, { parcours } = {}) {
  const rac = Math.max(0, Number(resteACharge) || 0);
  const montant = round2(Math.min(ECO_PTZ_MAX, rac));
  const duree = parcours === "parcours" || montant > 25000 ? 20 : 15;
  const simu = simulationsEcoPtzEtat(montant);
  return {
    montant,
    duree,
    mensualite: mensualiteTauxZero(montant, duree),
    mensualite15: simu.mensualite15,
    mensualite20: simu.mensualite20,
    canal: CANAL_ECO_PTZ_ETAT.id,
  };
}

export function calculerRoiProprietaire(plusValueMontant, resteACharge) {
  const rac = Math.max(0, Number(resteACharge) || 0);
  const pv = Math.max(0, Number(plusValueMontant) || 0);
  if (rac <= 0) return { pourcentage: null, multiple: null };
  return {
    pourcentage: round2((pv / rac) * 100),
    multiple: round2(pv / rac),
  };
}

/**
 * Cascade unique consommée par la fiche projet, les aides et le financement.
 */
export function calculerTunnelProptech(edition, { prixM2Constate, dpeActuel } = {}) {
  const surfaces = extraireSurfaceTravaux(edition);
  const totaux = totauxTravaux(edition?.travaux);
  const aides = calculerAidesIndicatives(edition);
  const planSaisi = calculerFinancement(edition);
  const rac = planSaisi.resteACharge;
  const auto = ecoPtzAutomatique(rac, { parcours: edition?.aides?.parcours });
  const plusValue = calculerPlusValueVenale({
    surfaceHabitable: surfaces.surfaceRef,
    prixM2Constate: prixM2Constate ?? edition?.valorisation?.prixM2Constate,
    gainClasses: edition?.aides?.gainClasses,
    dpeActuel: dpeActuel || edition?.valorisation?.dpeActuel,
  });
  const roi = calculerRoiProprietaire(plusValue.montant, rac);

  return {
    surfaces,
    totaux,
    aides,
    resteACharge: rac,
    ecoPtzSaisi: {
      montant: planSaisi.ecoPtzMontant,
      duree: planSaisi.ecoPtzDuree,
      mensualite: planSaisi.mensualite,
    },
    ecoPtzAuto: auto,
    canauxFinancement: {
      ecoPtz: {
        ...CANAL_ECO_PTZ_ETAT,
        ...auto,
      },
      pretTravaux: CANAL_PRET_TRAVAUX_FABIEN,
    },
    plusValue,
    roi,
    mentionAides: MENTION_AIDES_EDITION,
    mentionFinancement: MENTION_FINANCEMENT_EDITION,
    mentionPlusValue: MENTION_PLUS_VALUE,
  };
}
