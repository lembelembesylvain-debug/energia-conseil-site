import { BRUNEL_DOSSIER_ID } from "../../lib/crm/brunelWorkingBase.js";
import { CLIENT_BRUNEL_V3 } from "../../lib/crm/brunelDevisV3Officiel.js";
import {
  CHEMIN_CONTRAT_COUTY,
  CLIENT_COUTY,
  COUTY_ESCALIER_DOSSIER_ID,
  TITRE_COUTY_ESCALIER,
} from "../../lib/crm/coutyEscalierOfficiel.js";
import {
  CHEMIN_CONTRAT_GESNOUIN,
  CLIENT_GESNOUIN,
  GESNOUIN_DOSSIER_ID,
  TITRE_GESNOUIN,
} from "../../lib/crm/gesnouinBatterieOfficiel.js";
import {
  CHEMIN_CONTRAT_GILBERTAS,
  CLIENT_GILBERTAS,
  GILBERTAS_DOSSIER_ID,
  INTITULE_MARCHE_GILBERTAS,
} from "../../lib/crm/gilbertasClermontOfficiel.js";
import {
  CHEMIN_DEVIS_MASSON,
  CLIENT_MASSON,
  MASSON_DOSSIER_ID,
  TITRE_MASSON,
} from "../../lib/crm/massonToulonOfficiel.js";
import {
  CHEMIN_DEVIS_PEREIRA_NERVIEUX,
  CLIENT_PEREIRA_NERVIEUX,
  PEREIRA_CONTRAT_TITRE,
  PEREIRA_NERVIEUX_DOSSIER_ID,
} from "../../lib/crm/pereiraNervieuxOfficiel.js";
import type { DossierMessagerie } from "./types";

function texte(valeur: unknown): string {
  return typeof valeur === "string" ? valeur.trim() : "";
}

export const DOSSIERS_MESSAGERIE: DossierMessagerie[] = [
  {
    id: MASSON_DOSSIER_ID,
    libelle: texte(CLIENT_MASSON.libelleSignature) || "Mme Kristell MASSON",
    nom: "MASSON",
    civilite: "Mme",
    email: texte(CLIENT_MASSON.email),
    telephone: texte(CLIENT_MASSON.telephone),
    ville: `${texte(CLIENT_MASSON.ville)} (${texte(CLIENT_MASSON.codePostal)})`.trim(),
    projet: TITRE_MASSON,
    lienDocument: CHEMIN_DEVIS_MASSON,
  },
  {
    id: BRUNEL_DOSSIER_ID,
    libelle: "M. Emrick BRUNEL",
    nom: "BRUNEL",
    civilite: "M.",
    email: texte(CLIENT_BRUNEL_V3.email),
    telephone: texte(CLIENT_BRUNEL_V3.telephone),
    ville: `${texte(CLIENT_BRUNEL_V3.ville)} (${texte(CLIENT_BRUNEL_V3.codePostal)})`.trim(),
    projet: "Rénovation énergétique — indivision COUBLE, Bussières",
    lienDocument: "/DEVIS_BRUNEL_Indivision_COUBLE_2026_FINAL.html",
  },
  {
    id: GILBERTAS_DOSSIER_ID,
    libelle: "Mme Leïla GILBERTAS",
    nom: "GILBERTAS",
    civilite: "Mme",
    email: "",
    telephone: texte(CLIENT_GILBERTAS.telephoneAffiche),
    ville: texte(CLIENT_GILBERTAS.villeAffichee),
    projet: INTITULE_MARCHE_GILBERTAS,
    lienDocument: CHEMIN_CONTRAT_GILBERTAS,
  },
  {
    id: PEREIRA_NERVIEUX_DOSSIER_ID,
    libelle: "M. David Emmanuel PEREIRA",
    nom: "PEREIRA",
    civilite: "M.",
    email: texte(CLIENT_PEREIRA_NERVIEUX.email),
    telephone: texte(CLIENT_PEREIRA_NERVIEUX.telephone),
    ville: `${texte(CLIENT_PEREIRA_NERVIEUX.ville)} (${texte(CLIENT_PEREIRA_NERVIEUX.codePostal)})`.trim(),
    projet: PEREIRA_CONTRAT_TITRE,
    lienDocument: CHEMIN_DEVIS_PEREIRA_NERVIEUX,
  },
  {
    id: GESNOUIN_DOSSIER_ID,
    libelle: texte(CLIENT_GESNOUIN.libelleSignature) || "M. Joël GESNOUIN",
    nom: "GESNOUIN",
    civilite: "M.",
    email: texte(CLIENT_GESNOUIN.email),
    telephone: texte(CLIENT_GESNOUIN.telephone),
    ville: `${texte(CLIENT_GESNOUIN.ville)} (${texte(CLIENT_GESNOUIN.codePostal)})`.trim(),
    projet: TITRE_GESNOUIN,
    lienDocument: CHEMIN_CONTRAT_GESNOUIN,
  },
  {
    id: COUTY_ESCALIER_DOSSIER_ID,
    libelle: texte(CLIENT_COUTY.libelleSignature) || "Mme Marie-France COUTY",
    nom: "COUTY",
    civilite: "Mme",
    email: texte(CLIENT_COUTY.email),
    telephone: texte(CLIENT_COUTY.telephone),
    ville: `${texte(CLIENT_COUTY.ville)} (${texte(CLIENT_COUTY.codePostal)})`.trim(),
    projet: TITRE_COUTY_ESCALIER,
    lienDocument: CHEMIN_CONTRAT_COUTY,
  },
];

export function trouverDossier(id: string | null | undefined, annuaire: DossierMessagerie[]): DossierMessagerie | undefined {
  if (!id) return undefined;
  return annuaire.find((dossier) => dossier.id === id);
}

export function dossierPonctuel(id: string, nom: string, email = ""): DossierMessagerie {
  const libelle = nom.trim() || "Dossier en cours";
  return {
    id,
    libelle,
    nom: libelle,
    civilite: "",
    email: email.trim(),
    telephone: "",
    ville: "",
    projet: "Dossier CRM en cours",
    lienDocument: "",
  };
}
