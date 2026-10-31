/**
 * Pipeline opérationnel CRM ENERGIA CONSEIL IA® — typage strict.
 * CA prévisionnel (Pereira démo + marché Brunel option baie) et marge Direction sanctuarisée.
 */

import { BRUNEL_DOSSIER_ID } from "./brunelWorkingBase.js";
import {
  MARGE_NETTE_DIRECTION_BRUNEL,
  TOTAUX_BRUNEL_V4,
} from "./brunelDevisV3Officiel.js";
import {
  PEREIRA_NERVIEUX_DOSSIER_ID,
  TOTAUX_CG_20_PEREIRA,
  TOTAUX_PEREIRA_NERVIEUX,
} from "./pereiraNervieuxOfficiel.js";
import { TOTAUX_OPTION_BAIE } from "./brunelMarcheOfficiel2026.js";
import { TOTAUX_GILBERTAS } from "./gilbertasClermontOfficiel.js";
import { MONTANT_ESTIME_MASSARDIER_TTC, TOTAUX_MASSARDIER } from "./massardierLeadOfficiel.js";
import { TOTAUX_CLOISON_SDB } from "./cloisonSdbOfficiel.js";
import { TOTAUX_DAMIEN_PV_100KWC } from "./damienPv100kwcOfficiel.js";
import { TOTAUX_GESNOUIN } from "./gesnouinBatterieOfficiel.js";
import {
  ETAPES_ANAH,
  ETAPE_ANAH_MARCHE_SIGNE,
  IDS_PIPELINE_CA,
  SOURCES_APPORTEUR,
  etapeAnahDepuisStatut,
  infererSourceApporteur,
  libelleParcoursAnah,
  libelleSourceApporteur,
  normaliserEtapeAnah,
  trouverEtapeAnah,
} from "./operationnelCrm.js";

export type SourceApporteurId = (typeof SOURCES_APPORTEUR)[number]["id"];
export type EtapeAnahId = (typeof ETAPES_ANAH)[number]["id"];

export type DossierPipelineKpi = {
  id?: string | null;
  nom?: string | null;
  statut?: string | null;
  etapeAnah?: string | null;
  source?: string | null;
  archive?: boolean | null;
  acompte30Encaisse?: boolean;
  caTtc?: number | null;
  caHt?: number | null;
  margeDirectionHt?: number | null;
  margeDirectionTtc?: number | null;
  echeancier?: {
    acompte?: number | null;
    intermediaire?: number | null;
    solde?: number | null;
  } | null;
};

export type LigneTresorerieEngagee = {
  id: string;
  nom: string;
  acompteTtc: number;
  recu: boolean;
};

export type TotauxTresorerieEngagee = {
  totalEngage: number;
  totalRecu: number;
  totalARecevoir: number;
  nbDossiers: number;
  lignes: LigneTresorerieEngagee[];
};

export type LigneMargeSanctuarisee = {
  id: string;
  nom: string;
  ht: number;
  ttc: number;
};

export type TotauxMargeSanctuarisee = {
  totalHt: number;
  totalTtc: number;
  nbDossiers: number;
  lignes: LigneMargeSanctuarisee[];
};

function round2(n: number): number {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function montant(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? round2(n) : 0;
}

export const MARGE_DIRECTION_SANCTUARISEE_HT = 5200;
export const CA_PEREIRA_DEMO_TTC = 46758.4;
export const CA_PEREIRA_NERVIEUX_TTC = TOTAUX_PEREIRA_NERVIEUX.totalTtc;
export const CA_BRUNEL_V4_TTC = TOTAUX_BRUNEL_V4.totalTtc;
export const CA_BRUNEL_MARCHE_TTC = TOTAUX_OPTION_BAIE.totalTtc;
export const CA_GILBERTAS_TTC = TOTAUX_GILBERTAS.totalTtc;
export const CA_MASSARDIER_TTC = MONTANT_ESTIME_MASSARDIER_TTC;
export const CA_CLOISON_SDB_TTC = TOTAUX_CLOISON_SDB.totalTtc;
export const CA_DAMIEN_PV_100KWC_TTC = TOTAUX_DAMIEN_PV_100KWC.totalTtc;
export const CA_GESNOUIN_TTC = TOTAUX_GESNOUIN.totalTtc;

/** Affichage commercial arrondi : 32 400 + 33 479 + 37 600 + 20 000 + 2 717 + 106 800 + 1 068 = 234 064 € TTC. */
export const CA_PEREIRA_AFFICHE_TTC = Math.round(CA_PEREIRA_NERVIEUX_TTC);
export const CA_BRUNEL_AFFICHE_TTC = Math.round(CA_BRUNEL_MARCHE_TTC);
export const CA_PREVISIONNEL_OPERATIONNEL_TTC =
  CA_PEREIRA_AFFICHE_TTC +
  CA_BRUNEL_AFFICHE_TTC +
  CA_GILBERTAS_TTC +
  CA_MASSARDIER_TTC +
  CA_CLOISON_SDB_TTC +
  CA_DAMIEN_PV_100KWC_TTC +
  CA_GESNOUIN_TTC;

/** Somme exacte des marchés (cents) — marchés officiels + cloison + PV 100 kWc + Gesnouin. */
export const CA_PREVISIONNEL_OPERATIONNEL_EXACT_TTC = round2(
  CA_PEREIRA_NERVIEUX_TTC +
    CA_BRUNEL_MARCHE_TTC +
    CA_GILBERTAS_TTC +
    CA_MASSARDIER_TTC +
    CA_CLOISON_SDB_TTC +
    CA_DAMIEN_PV_100KWC_TTC +
    CA_GESNOUIN_TTC,
);

export const MARGE_NETTE_MASSARDIER_HT = TOTAUX_MASSARDIER.margeNetteEnergiaHt;

export const DOSSIERS_MARGE_DIRECTION: ReadonlyArray<LigneMargeSanctuarisee> = [
  {
    id: BRUNEL_DOSSIER_ID,
    nom: "Brunel — Direction & Pilotage Contractant Général",
    ht: MARGE_NETTE_DIRECTION_BRUNEL.ht,
    ttc: MARGE_NETTE_DIRECTION_BRUNEL.ttc,
  },
  {
    id: PEREIRA_NERVIEUX_DOSSIER_ID,
    nom: "Pereira — Direction & Contractant Général",
    ht: TOTAUX_CG_20_PEREIRA.totalHt,
    ttc: TOTAUX_CG_20_PEREIRA.totalTtc,
  },
];

export function extraireDossiersCaPrevisionnel<T extends DossierPipelineKpi>(dossiers: T[]): T[] {
  const liste = Array.isArray(dossiers) ? dossiers : [];
  const brunel = liste.filter((item) => item.id === IDS_PIPELINE_CA.brunel);
  // Marchés officiels : Pereira Nervieux prioritaire sur la démo Pereira.
  const pereira = liste.some((item) => item.id === IDS_PIPELINE_CA.pereiraNervieux)
    ? liste.filter((item) => item.id === IDS_PIPELINE_CA.pereiraNervieux)
    : liste.filter((item) => item.id === IDS_PIPELINE_CA.pereiraDemo);
  const gilbertas = liste.filter((item) => item.id === IDS_PIPELINE_CA.gilbertas);
  const massardier = liste.filter((item) => item.id === IDS_PIPELINE_CA.massardier);
  const cloisonSdb = liste.filter((item) => item.id === IDS_PIPELINE_CA.cloisonSdb);
  const damienPv = liste.filter((item) => item.id === IDS_PIPELINE_CA.damienPv100kwc);
  const gesnouin = liste.filter((item) => item.id === IDS_PIPELINE_CA.gesnouin);
  return [...pereira, ...brunel, ...gilbertas, ...massardier, ...cloisonSdb, ...damienPv, ...gesnouin];
}

/** CA prévisionnel affiché : marchés officiels + projets manuels actifs (hors archives / test). */
export function calculerCaPrevisionnelOperationnel(dossiers: DossierPipelineKpi[]): number {
  const liste = Array.isArray(dossiers) ? dossiers.filter((item) => item && item.archive !== true) : [];
  const officiels = extraireDossiersCaPrevisionnel(liste);
  const idsOfficiels = new Set(officiels.map((item) => String(item.id || "")));
  const extras = liste.filter(
    (item) =>
      !idsOfficiels.has(String(item.id || "")) &&
      item.source !== "test-local" &&
      montant(item.caTtc) > 0,
  );
  const totalOfficiel = officiels.reduce((somme, dossier) => somme + Math.round(montant(dossier.caTtc)), 0);
  const totalExtra = extras.reduce((somme, dossier) => somme + Math.round(montant(dossier.caTtc)), 0);
  return round2(totalOfficiel + totalExtra);
}

export function calculerMargeNetteSanctuarisee(dossiers: DossierPipelineKpi[]): TotauxMargeSanctuarisee {
  const ids = new Set((dossiers ?? []).map((item) => String(item.id || "")));
  const hasPereira = ids.has(IDS_PIPELINE_CA.pereiraDemo) || ids.has(IDS_PIPELINE_CA.pereiraNervieux);
  const lignes: LigneMargeSanctuarisee[] = [];

  if (ids.has(IDS_PIPELINE_CA.brunel)) {
    const brunel = DOSSIERS_MARGE_DIRECTION[0];
    lignes.push(brunel);
  }
  if (hasPereira) {
    const pereira = DOSSIERS_MARGE_DIRECTION[1];
    lignes.push(pereira);
  }

  return {
    totalHt: round2(lignes.reduce((somme, ligne) => somme + ligne.ht, 0)),
    totalTtc: round2(lignes.reduce((somme, ligne) => somme + ligne.ttc, 0)),
    nbDossiers: lignes.length,
    lignes,
  };
}

export function acompteCommandeRecu(dossier: DossierPipelineKpi): boolean {
  const etape = trouverEtapeAnah(dossier.etapeAnah || etapeAnahDepuisStatut(dossier.statut));
  if (typeof dossier.acompte30Encaisse === "boolean") {
    return dossier.acompte30Encaisse && etape.ordre >= 3;
  }
  const seuil = trouverEtapeAnah(ETAPE_ANAH_MARCHE_SIGNE);
  return etape.ordre >= seuil.ordre;
}

export function calculerTresorerieEngagee(dossiers: DossierPipelineKpi[]): TotauxTresorerieEngagee {
  // Massardier / Cloison SDB / PV 100 kWc = budgetés (CA) sans acompte 30 % engagé tant que le marché n'est pas signé.
  const lignes: LigneTresorerieEngagee[] = extraireDossiersCaPrevisionnel(dossiers)
    .filter(
      (dossier) =>
        dossier.id !== IDS_PIPELINE_CA.massardier &&
        dossier.id !== IDS_PIPELINE_CA.cloisonSdb &&
        dossier.id !== IDS_PIPELINE_CA.damienPv100kwc &&
        dossier.id !== IDS_PIPELINE_CA.gesnouin,
    )
    .map((dossier) => {
    const acompteTtc = montant(dossier.echeancier?.acompte ?? montant(dossier.caTtc) * 0.3);
    return {
      id: String(dossier.id || ""),
      nom: String(dossier.nom || dossier.id || "Dossier"),
      acompteTtc,
      recu: acompteCommandeRecu(dossier),
    };
  });

  const totalEngage = round2(lignes.reduce((somme, ligne) => somme + ligne.acompteTtc, 0));
  const totalRecu = round2(lignes.filter((ligne) => ligne.recu).reduce((somme, ligne) => somme + ligne.acompteTtc, 0));

  return {
    totalEngage,
    totalRecu,
    totalARecevoir: round2(totalEngage - totalRecu),
    nbDossiers: lignes.length,
    lignes,
  };
}

export {
  ETAPES_ANAH,
  IDS_PIPELINE_CA,
  SOURCES_APPORTEUR,
  etapeAnahDepuisStatut,
  infererSourceApporteur,
  libelleParcoursAnah,
  libelleSourceApporteur,
  normaliserEtapeAnah,
};

export type { SourceApporteurId as ApporteurId, EtapeAnahId as AnahId };
