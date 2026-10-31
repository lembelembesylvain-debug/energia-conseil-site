import { useSyncExternalStore } from "react";
import { FICHES_RADAR_CEE, type CeeFicheTravaux } from "./ceeRadarTravaux";
import { ficheStrategiqueParCode } from "./fichesStrategiquesCee";
import { noteOpportuniteCeeBase64 } from "./noteOpportuniteCeePdf";

const CLE = "energia-selected-cee-fiches-v1";

export type FicheCeeSelectionnee = {
  id: string;
  code: string;
  intitule: string;
};

function ficheValide(valeur: unknown): valeur is FicheCeeSelectionnee {
  if (!valeur || typeof valeur !== "object") return false;
  const fiche = valeur as FicheCeeSelectionnee;
  return Boolean(fiche.id && fiche.code && fiche.intitule);
}

function lireStockage(): FicheCeeSelectionnee[] {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const lu = JSON.parse(sessionStorage.getItem(CLE) || "[]") as unknown;
    return Array.isArray(lu) ? lu.filter(ficheValide) : [];
  } catch {
    return [];
  }
}

let selectedCeeFiches: FicheCeeSelectionnee[] = lireStockage();
const auditeurs = new Set<() => void>();

function publier() {
  if (typeof sessionStorage !== "undefined") {
    try {
      sessionStorage.setItem(CLE, JSON.stringify(selectedCeeFiches));
    } catch {
      /* Quota session : la sélection reste en mémoire pour l'onglet. */
    }
  }
  auditeurs.forEach((auditeur) => auditeur());
}

export function lireSelectedCeeFiches() {
  return selectedCeeFiches;
}

export function ficheCeeEstSelectionnee(id: string) {
  return selectedCeeFiches.some((fiche) => fiche.id === id);
}

export function basculerFicheCee(fiche: FicheCeeSelectionnee) {
  selectedCeeFiches = ficheCeeEstSelectionnee(fiche.id)
    ? selectedCeeFiches.filter((item) => item.id !== fiche.id)
    : [...selectedCeeFiches, fiche];
  publier();
}

export function retirerFicheCee(id: string) {
  if (!ficheCeeEstSelectionnee(id)) return;
  selectedCeeFiches = selectedCeeFiches.filter((item) => item.id !== id);
  publier();
}

export function souscrireSelectedCeeFiches(auditeur: () => void) {
  auditeurs.add(auditeur);
  return () => auditeurs.delete(auditeur);
}

export function useSelectedCeeFiches() {
  return useSyncExternalStore(souscrireSelectedCeeFiches, lireSelectedCeeFiches, lireSelectedCeeFiches);
}

export function libellePieceCee(fiche: Pick<FicheCeeSelectionnee, "code" | "intitule">) {
  return `Fiche technique 3D : ${fiche.code} (${fiche.intitule})`;
}

export function nomFichierPieceCee(code: string) {
  return `Fiche-technique-3D-${code.replace(/[^a-zA-Z0-9]+/g, "-")}.pdf`;
}

export function fichesRadarSelectionnees(selection = selectedCeeFiches): CeeFicheTravaux[] {
  const parId = new Map<string, CeeFicheTravaux>();
  for (const fiche of FICHES_RADAR_CEE) {
    if (!parId.has(fiche.id)) parId.set(fiche.id, fiche);
  }
  return selection.flatMap((item) => {
    const fiche = parId.get(item.id);
    return fiche ? [fiche] : [];
  });
}

export function corpsSelectionCee(selection = selectedCeeFiches) {
  const fiches = fichesRadarSelectionnees(selection);
  const lignes = fiches.flatMap((fiche, index) => {
    const strategie = ficheStrategiqueParCode(fiche.code);
    const prime = strategie?.primeFourchette || fiche.prime;
    const metiers = strategie?.corpsEtat.length ? strategie.corpsEtat.join(" · ") : "à confirmer au dossier";
    return [
      `${index + 1}. ${fiche.code} — ${fiche.intitule}`,
      `   Prime indicative : ${prime}`,
      `   Corps d'état : ${metiers}`,
      "",
    ];
  });
  return [
    "Bonjour,",
    "",
    `Veuillez trouver ci-joint ${fiches.length} fiche(s) technique(s) CEE. Chaque PDF reprend le schéma d'ingénierie de l'opération.`,
    "",
    ...lignes,
    "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon l'éligibilité en vigueur. Montants définitifs après instruction CEE.",
    "",
    "Bien cordialement,",
  ].join("\n");
}

export async function piecesPdfSelectionCee(selection = selectedCeeFiches) {
  const pieces: { filename: string; content: string }[] = [];
  for (const fiche of fichesRadarSelectionnees(selection)) {
    pieces.push({
      filename: nomFichierPieceCee(fiche.code),
      content: await noteOpportuniteCeeBase64(fiche),
    });
  }
  return pieces;
}
