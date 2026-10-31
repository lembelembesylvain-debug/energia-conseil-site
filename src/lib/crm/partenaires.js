/**
 * Annuaire CRM des partenaires apporteurs.
 * Catarina n’a pas d’adresse @energia-conseil-ia.com.
 * Accès limité aux prospects et dossiers rattachés.
 * Les commissions internes ENERGIA (10 % HT commercial) et la marge nette
 * ne sont jamais exposées au partenaire dans le CRM.
 *
 * Les partenaires duplicables viennent de src/config/partners.js.
 * Le prototype Catarina reste défini ici — il n’est pas recopié dans la config duplicable.
 */

import {
  PARTNERS,
  champOuPlaceholder,
  displayNameOf,
} from "../../config/partners.js";
import { estPartenaireApporteur } from "./roles.js";
import { BET_NOMOS_APPORTEUR_ID, BET_NOMOS_ID, PARTENAIRE_BET_NOMOS } from "./betNomosOfficiel.js";

export const EMAIL_ENERGIA = "contact@energia-conseil-ia.com";
export const SOURCE_QR_FLYER = "Catarina / QR flyer";

export const PARTENAIRE_CATARINA = {
  id: "catarina-martins",
  nom: "Catarina Martins",
  entite: "iad France",
  qualite: "Partenaire indépendante — apporteuse d’affaires",
  email: "contact@catarinamartins-immobilier.fr",
  telephone: "06 61 37 14 64",
  site: "https://catarinamartins-immobilier.fr",
  secteur: "Chagny (71150) et environs",
  roleCrm: "partenaire_apporteur",
  acces: {
    emailConnexion: "contact@catarinamartins-immobilier.fr",
    creerAdresseEnergia: false,
    perimetre: ["prospects_apportes", "dossiers_rattaches", "commissions"],
  },
};

export const PARTENAIRES_CRM = [PARTENAIRE_CATARINA, PARTENAIRE_BET_NOMOS];

export function partnerConfigToCrm(partner) {
  const id = partner.crmPartnerId || partner.id;
  const nom = displayNameOf(partner);
  const email = champOuPlaceholder(partner.email);
  return {
    id,
    nom,
    entite: champOuPlaceholder(partner.network),
    qualite: "Partenaire indépendant — apporteur d’affaires",
    email,
    telephone: champOuPlaceholder(partner.phone),
    site: partner.website || "",
    secteur: champOuPlaceholder(partner.sector),
    roleCrm: "partenaire_apporteur",
    sourceLabel: champOuPlaceholder(partner.sourceLabel),
    acces: {
      emailConnexion: email === "[À COMPLÉTER]" ? "" : email,
      creerAdresseEnergia: false,
      perimetre: ["prospects_apportes", "dossiers_rattaches", "commissions"],
    },
  };
}

export function listerPartenairesCrm() {
  const fromConfig = PARTNERS.map(partnerConfigToCrm);
  const ids = new Set(PARTENAIRES_CRM.map((partenaire) => partenaire.id));
  return [...PARTENAIRES_CRM, ...fromConfig.filter((partenaire) => !ids.has(partenaire.id))];
}

export function trouverPartenaireCrm(partenaireId, fallback = PARTENAIRE_CATARINA) {
  const id = String(partenaireId || "").trim();
  if (!id) return fallback;
  return listerPartenairesCrm().find((partenaire) => partenaire.id === id) || fallback;
}

export function partenairesVisiblesPourRole(role, partenaireId) {
  const tous = listerPartenairesCrm();
  if (!estPartenaireApporteur(role)) return tous;
  const id = String(partenaireId || PARTENAIRE_CATARINA.id).trim() || PARTENAIRE_CATARINA.id;
  return tous.filter((partenaire) => partenaire.id === id);
}

export function estDossierRattacheAuPartenaire(dossier, partenaire = PARTENAIRE_CATARINA) {
  if (!dossier || !partenaire) return false;
  const nom = String(dossier.apporteurNom || dossier.apporteur?.nom || "").toLowerCase();
  const id = String(
    dossier.apporteurId || dossier.apporteur?.id || dossier.partenaire_id || "",
  ).toLowerCase();
  const email = String(dossier.apporteurEmail || dossier.apporteur?.email || "").toLowerCase();
  const partnerId = String(partenaire.id || partenaire.crmPartnerId || "").toLowerCase();
  const partnerEmail = String(partenaire.email || "").toLowerCase();
  const partnerNom = String(partenaire.nom || "").toLowerCase();
  if (partnerId && id === partnerId) return true;
  if (partnerEmail && email && email === partnerEmail) return true;
  if (partnerNom && nom && (nom === partnerNom || nom.includes(partnerNom))) return true;
  if (partenaire.id === PARTENAIRE_CATARINA.id && nom.includes("catarina")) return true;
  if (partenaire.id === BET_NOMOS_ID) {
    const bureau = String(dossier.bureauEtudesId || "").toLowerCase();
    if (bureau === BET_NOMOS_ID || id === BET_NOMOS_APPORTEUR_ID || id === BET_NOMOS_ID) return true;
    if (nom.includes("nomos") || nom.includes("romain bet")) return true;
  }
  return false;
}

export function filtrerDossiersPartenaire(dossiers, partenaire = PARTENAIRE_CATARINA) {
  return (dossiers ?? []).filter((dossier) => estDossierRattacheAuPartenaire(dossier, partenaire));
}
