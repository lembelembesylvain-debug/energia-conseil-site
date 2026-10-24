import { etatInitialPac, evaluerPac } from "../hvac/devis";
import type { EtatPac, EtudePac } from "../hvac/types";
import type { DossierMessagerie } from "./types";

const DEPARTEMENT: Record<string, string> = {
  MASSON: "83",
  BRUNEL: "42",
  GILBERTAS: "63",
  PEREIRA: "42",
  GESNOUIN: "14",
  COUTY: "42",
};

/** Étude PAC figée par dossier. Mme Masson : 163 m² passoire, Var, 100 % thermodynamique → 18,3 kW et 99 % EnR. */
export function etatPourDossier(dossier: DossierMessagerie): EtatPac {
  const base = etatInitialPac(dossier.libelle);
  if (dossier.nom === "MASSON") {
    return {
      ...base,
      clientNom: dossier.libelle,
      surfaceM2: 163,
      hauteurM: 2.5,
      isolation: "passoire",
      departement: "83",
      tint: 20,
      mode: "thermo",
      ratioThermo: 1,
    };
  }
  return {
    ...base,
    clientNom: dossier.libelle,
    departement: DEPARTEMENT[dossier.nom] || base.departement,
  };
}

export function etudePourDossier(dossier: DossierMessagerie): { etat: EtatPac; etude: EtudePac } {
  const etat = etatPourDossier(dossier);
  return { etat, etude: evaluerPac(etat, dossier.id) };
}
