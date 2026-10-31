/**
 * Journal de migration catalogue — rejouable, sans doublon, sans écrasement des tarifs fermes.
 */

import { calculerPrestation } from "./calculs";
import { PRESTATIONS_SEED } from "./prestations-seed";
import { PRESTATIONS_MARCHE_COMPLEMENT } from "./tarifs-marche-2026-complement";
import type { PrestationCatalogue } from "./types";
import {
  IDS_TARIFS_FERMES_PROTEGES,
  badgeStatutTarif,
  estTarifFermeProtege,
  validerFourchetteMarche,
} from "./visibilite";

export type CompteurMigrationCatalogue = {
  avant: number;
  apres: number;
  ajoutees: string[];
  completees: string[];
  ignoreesDejaPresentes: string[];
  protegeesTarifFerme: string[];
  aRecalibrerLocalement: string[];
};

export function fusionnerSansDoublon(
  existantes: PrestationCatalogue[],
  candidates: PrestationCatalogue[],
): {
  fusionnees: PrestationCatalogue[];
  journal: CompteurMigrationCatalogue;
} {
  const parId = new Map<string, PrestationCatalogue>();
  const ignoreesDejaPresentes: string[] = [];
  const protegeesTarifFerme: string[] = [];
  const ajoutees: string[] = [];
  const completees: string[] = [];

  for (const item of existantes) {
    parId.set(item.id, item);
  }
  const avant = parId.size;

  for (const candidate of candidates) {
    const actuelle = parId.get(candidate.id);
    if (!actuelle) {
      parId.set(candidate.id, candidate);
      ajoutees.push(candidate.id);
      continue;
    }
    if (estTarifFermeProtege(actuelle.id) || calculerPrestation(actuelle).tarifRenseigne) {
      protegeesTarifFerme.push(candidate.id);
      continue;
    }
    const manquaitRef = !actuelle.referenceMarche && Boolean(candidate.referenceMarche);
    if (manquaitRef) {
      parId.set(candidate.id, {
        ...actuelle,
        referenceMarche: candidate.referenceMarche,
        structurePrixInterne: actuelle.structurePrixInterne ?? candidate.structurePrixInterne,
        coutMaterielHt: actuelle.coutMaterielHt,
        coutMainOeuvreHt: actuelle.coutMainOeuvreHt,
        prixVenteHt: actuelle.prixVenteHt,
      });
      completees.push(candidate.id);
      continue;
    }
    ignoreesDejaPresentes.push(candidate.id);
  }

  const fusionnees = [...parId.values()];
  return {
    fusionnees,
    journal: {
      avant,
      apres: fusionnees.length,
      ajoutees,
      completees,
      ignoreesDejaPresentes,
      protegeesTarifFerme,
      aRecalibrerLocalement: fusionnees
        .filter((item) => badgeStatutTarif(item) === "a_recalibrer")
        .map((item) => item.id),
    },
  };
}

export function journaliserMigrationCatalogue(): CompteurMigrationCatalogue {
  const idsComplement = new Set(PRESTATIONS_MARCHE_COMPLEMENT.map((item) => item.id));
  const existantesSansComplement = PRESTATIONS_SEED.filter((item) => !idsComplement.has(item.id));
  const { journal } = fusionnerSansDoublon(existantesSansComplement, PRESTATIONS_MARCHE_COMPLEMENT);
  const replay = fusionnerSansDoublon(PRESTATIONS_SEED, PRESTATIONS_MARCHE_COMPLEMENT);
  const completees = existantesSansComplement
    .filter((item) => item.referenceMarche?.recalibrageLocal)
    .map((item) => item.id);
  return {
    avant: existantesSansComplement.length,
    apres: PRESTATIONS_SEED.length,
    ajoutees: journal.ajoutees,
    completees,
    ignoreesDejaPresentes: replay.journal.ignoreesDejaPresentes,
    protegeesTarifFerme: [...IDS_TARIFS_FERMES_PROTEGES],
    aRecalibrerLocalement: PRESTATIONS_SEED.filter((item) => badgeStatutTarif(item) === "a_recalibrer").map(
      (item) => item.id,
    ),
  };
}

export function verifierMigrationRejouable(): string | null {
  const premier = fusionnerSansDoublon(
    PRESTATIONS_SEED.filter((item) => !PRESTATIONS_MARCHE_COMPLEMENT.some((c) => c.id === item.id)),
    PRESTATIONS_MARCHE_COMPLEMENT,
  );
  const second = fusionnerSansDoublon(premier.fusionnees, PRESTATIONS_MARCHE_COMPLEMENT);
  if (second.journal.ajoutees.length !== 0) {
    return `Rejeu : ${second.journal.ajoutees.length} ajouts inattendus`;
  }
  if (second.fusionnees.length !== premier.fusionnees.length) {
    return "Rejeu : le nombre de fiches a changé";
  }
  return null;
}

export function snapshotTarifsFermes(): Record<
  string,
  { coutMaterielHt: number | null; coutMainOeuvreHt: number | null; prixVenteHt: number | null }
> {
  const out: Record<
    string,
    { coutMaterielHt: number | null; coutMainOeuvreHt: number | null; prixVenteHt: number | null }
  > = {};
  for (const id of IDS_TARIFS_FERMES_PROTEGES) {
    const item = PRESTATIONS_SEED.find((p) => p.id === id);
    if (!item) continue;
    out[id] = {
      coutMaterielHt: item.coutMaterielHt,
      coutMainOeuvreHt: item.coutMainOeuvreHt,
      prixVenteHt: item.prixVenteHt,
    };
  }
  return out;
}

export function erreursFourchettesSeed(): string[] {
  return PRESTATIONS_SEED.map(validerFourchetteMarche).filter((item): item is string => item != null);
}
