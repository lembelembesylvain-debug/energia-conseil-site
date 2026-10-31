/**
 * Étude de faisabilité préparatoire — document interne uniquement.
 * N’importe aucune ligne du devis Bussières / Indivision COUBLE.
 * Ne jamais l’intituler DPE officiel, audit réglementaire, audit certifié ou conformité ANAH.
 */

import {
  ALERTE_REFERENCE_BUSSIERES_DISTINCTE,
  CHAMPS_LOGEMENT_REQUIS,
  logementManquant,
} from "./brunelWorkingBase.js";

export const TITRE_ETUDE_PREPARATOIRE = "Étude préparatoire de faisabilité — document interne";

export const ORDRE_TRAVAUX_RECOMMANDE = [
  "Isolation combles",
  "Isolation murs (ITE ou ITI)",
  "Isolation planchers",
  "Fenêtres",
  "VMC",
  "PAC (dimensionnement post-isolation)",
  "Ballon thermodynamique",
  "Photovoltaïque",
];

const TITRES_INTERDITS = ["dpe officiel", "audit réglementaire", "audit certifie", "audit certifié", "conformité anah"];

export function etudierFaisabiliteFeurs(base) {
  const manquants = logementManquant(base?.logement);
  const travaux = (base?.travauxProposes || []).filter((l) => l.statut !== "rejete");
  const recommandations = base?.recommandationsImport || [];
  const logementRenseigne = CHAMPS_LOGEMENT_REQUIS.length - manquants.length;
  const presentes = [
    base?.client?.nom ? `Identité : ${base.client.nom}` : null,
    base?.client?.ville && base?.client?.codePostal
      ? `Dossier localisé : ${base.client.codePostal} ${base.client.ville}`
      : null,
    base?.rfr?.montant != null ? "RFR reçu — catégorie d’aide à confirmer" : null,
    base?.logement?.dpeFourni ? `DPE actuel renseigné : ${base.logement.dpeFourni}` : null,
    base?.logement?.surfaceHabitable ? `Surface : ${base.logement.surfaceHabitable}` : null,
    base?.statutDossier || null,
  ].filter(Boolean);

  const travauxPotentiels =
    travaux.length > 0
      ? travaux.map((l) => l.prestation).join(" · ")
      : recommandations.length > 0
        ? "Recommandations documentaires à confirmer par visite — pas des lignes de devis."
        : "Non déterminés tant que le logement Feurs n’est pas relevé.";

  const niveauConfiance =
    manquants.length === 0 && travaux.length > 0 ? "moyen" : logementRenseigne > 0 ? "faible" : "insuffisant";

  return {
    titre: TITRE_ETUDE_PREPARATOIRE,
    statut: manquants.length === 0 ? "Étude préparatoire à valider" : "À compléter",
    niveauConfiance,
    presentes,
    manquantes: manquants.map((champ) => champ.label),
    champsLogement: CHAMPS_LOGEMENT_REQUIS.map((champ) => champ.label),
    travauxPotentiels,
    recommandations: recommandations.map((r) => r.texte || r),
    ordreRecommande: ORDRE_TRAVAUX_RECOMMANDE,
    dependances: "Isolation avant chauffage, sauf justification technique validée par l’administrateur.",
    visiteNecessaire: true,
    devisRgeNecessaire: true,
    risques: ["Amiante, plomb et électricité : à confirmer sur site — non déduits d’un PDF."],
    reserves: [
      "Aucun DPE cible, économie, ROI, aide chiffrée ni dimensionnement PAC tant que le logement est incomplet.",
      "Les lignes du devis Indivision COUBLE / Bussières ne sont pas des travaux du dossier Feurs.",
      ALERTE_REFERENCE_BUSSIERES_DISTINCTE,
      "Ce document n’est pas un DPE officiel, ni un audit réglementaire, ni une conformité ANAH.",
    ],
    importBussieresInterdit: true,
    titresInterdits: TITRES_INTERDITS,
  };
}
