/**
 * Lignes commerciales du devis client — sans données internes sensibles.
 *
 * N’affiche jamais : coût entrant, marge, coût interne, coefficient de marge,
 * prix payé au sous-traitant.
 */

import { CATALOGUE_POSTES } from "./catalogue-postes";
import type {
  DevisClientChiffrage,
  LigneCommercialeClient,
  ParametresChiffrage,
  PosteCalcule,
  PosteId,
  ResultatDeplacements,
} from "./types";

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

const LIBELLES: Record<string, string> = {
  etude_audit: "Étude et audit",
  travaux: "Travaux",
  fournitures: "Fournitures",
  deplacements_visites: "Déplacements et visites",
  coordination_pilotage: "Coordination et pilotage",
  aleas: "Aléas éventuels",
};

function categoriePoste(id: PosteId): string {
  return CATALOGUE_POSTES.find((poste) => poste.id === id)?.categorie ?? "chantier";
}

function ajouter(acc: Record<string, number>, id: string, montant: number) {
  acc[id] = round2((acc[id] ?? 0) + montant);
}

/**
 * Répartit le prix sortant HT de chaque ligne selon ses composantes de coût,
 * pour que la somme des lignes commerciales égale le total HT (marge incluse
 * dans chaque ligne, jamais affichée).
 */
export function construireDevisClient(
  lignes: PosteCalcule[],
  deplacements: ResultatDeplacements,
  parametres: ParametresChiffrage,
  totalSortantHt: number,
  totalTva: number,
  totalTtc: number,
): DevisClientChiffrage {
  const buckets: Record<string, number> = {
    etude_audit: 0,
    travaux: 0,
    fournitures: 0,
    deplacements_visites: 0,
    coordination_pilotage: 0,
    aleas: 0,
  };

  for (const ligne of lignes) {
    if (!ligne.inclus || !ligne.prixRenseigne || ligne.prixSortantHt == null) continue;
    const ht = ligne.prixSortantHt;
    const interne = ligne.coutInterne ?? 0;
    const categorie = categoriePoste(ligne.id);

    if (categorie === "etude") {
      ajouter(buckets, "etude_audit", ht);
      continue;
    }
    if (ligne.id === "coordination_pilotage" || ligne.id === "frais_administratifs") {
      ajouter(buckets, "coordination_pilotage", ht);
      continue;
    }
    if (ligne.id === "aleas_techniques") {
      ajouter(buckets, "aleas", ht);
      continue;
    }
    if (interne <= 0) {
      ajouter(buckets, "travaux", ht);
      continue;
    }

    const ratio = ht / interne;
    ajouter(buckets, "travaux", (ligne.coutEntrantTotalHt ?? 0) * ratio);
    ajouter(buckets, "aleas", (ligne.montantAleas ?? 0) * ratio);
    ajouter(buckets, "coordination_pilotage", (ligne.montantPilotage ?? 0) * ratio);
    ajouter(buckets, "fournitures", ligne.fraisComplementaires * ratio);
  }

  if (parametres.fraisStructureHt > 0) {
    const htStructure = round2(
      parametres.fraisStructureHt / (1 - parametres.tauxMarge),
    );
    ajouter(buckets, "coordination_pilotage", htStructure);
  }

  const travelInterne = deplacements.totalAjoutesHt;
  if (travelInterne > 0) {
    ajouter(buckets, "deplacements_visites", travelInterne / (1 - parametres.tauxMarge));
  }

  const ordre = [
    "etude_audit",
    "travaux",
    "fournitures",
    "deplacements_visites",
    "coordination_pilotage",
    "aleas",
  ];
  let lignesClient: LigneCommercialeClient[] = ordre
    .map((id) => ({
      id,
      libelle: LIBELLES[id],
      montantHt: round2(buckets[id] ?? 0),
    }))
    .filter((ligne) => ligne.montantHt > 0);

  const somme = round2(lignesClient.reduce((acc, ligne) => acc + ligne.montantHt, 0));
  const delta = round2(totalSortantHt - somme);
  if (delta !== 0 && lignesClient.length > 0) {
    const idx = lignesClient.reduce(
      (best, ligne, index, arr) =>
        ligne.montantHt > arr[best].montantHt ? index : best,
      0,
    );
    lignesClient = lignesClient.map((ligne, index) =>
      index === idx ? { ...ligne, montantHt: round2(ligne.montantHt + delta) } : ligne,
    );
  }

  return {
    lignes: lignesClient,
    totalHt: totalSortantHt,
    totalTva,
    totalTtc,
  };
}
