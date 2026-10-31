/**
 * Préremplissage contrôlé (lot D).
 * Uniquement les champs validés alimentent la fiche et le logement.
 * Les travaux extraits restent proposés, jamais fermes.
 * Aucune aide chiffrée si une donnée manque ou si la vérif web officielle est absente.
 */

import {
  ALERTE_REFERENCE_BUSSIERES_DISTINCTE,
  BRUNEL_DOSSIER_ID,
  CHAMPS_LOGEMENT_REQUIS,
  detecterContaminationBussieres,
  logementManquant,
} from "./brunelWorkingBase.js";
import { etudierFaisabiliteFeurs } from "./etudeFaisabilite.js";
import { verificationWebObsolete } from "../aides/verificationLive.js";

export const MENTION_AIDES_INDICATIVES =
  "Aides indicatives sous réserve de l’éligibilité du ménage, des travaux, des entreprises, des barèmes en vigueur et de la décision des organismes compétents.";

export const MENTION_AIDES_NON_CALCULABLES = "Aides indicatives non calculables — donnée manquante";

export const MENTION_FINANCEMENT_INDICATIF =
  "Simulation indicative. Elle ne constitue pas une offre de prêt. Aucun taux, accord ou mensualité n’est garanti sans validation par un organisme financier.";

export const TITRE_ETUDE_PREPARATOIRE = "Étude préparatoire de faisabilité — document interne";

export const URL_SERVICE_PUBLIC_MPR = "https://www.service-public.fr/particuliers/vosdroits/F35083";

export const URL_ANAH = "https://www.anah.gouv.fr";

export const URL_FRANCE_RENOV_MPR = "https://www.france-renov.gouv.fr/aides/maprimerenov";

/** Vérification effectuée le 14/09/2026 — page service-public indiquant « Vérifié le 01 septembre 2026 ». */
export const DATE_VERIFICATION_SOURCES_OFFICIELLES = "2026-09-14";

export const STATUTS_DOSSIER_TRAVAIL = [
  "Documents reçus",
  "Analyse en cours",
  "Données à vérifier",
  "Étude préparatoire",
  "Devis à préparer",
  "Aides à vérifier",
  "Validation administrateur",
  "Transmis",
  "Archivé",
];

const MAP_LOGEMENT = {
  surfaceHabitable: "surfaceHabitable",
  anneeConstruction: "anneeConstruction",
  dpeActuel: "dpeFourni",
  consommationAnnuelle: "consommationAnnuelle",
  chauffageExistant: "chauffageExistant",
  ventilation: "ventilation",
  adresseExacte: "adresseExacte",
  typeLogement: "typeLogement",
  typeBatiment: "typeBatiment",
  menuiseries: "menuiseries",
  toiture: "toiture",
  murs: "murs",
  plancher: "plancher",
  nombreNiveaux: "nombreNiveaux",
  photos: "photos",
  contraintesParticulieres: "contraintesParticulieres",
};

const MAP_CLIENT = {
  nomClient: "nom",
  telephone: "telephone",
  email: "email",
  profession: "profession",
  prenoms: "prenoms",
};

function champLogementId(field) {
  if (MAP_LOGEMENT[field]) return MAP_LOGEMENT[field];
  if (CHAMPS_LOGEMENT_REQUIS.some((c) => c.id === field)) return field;
  return null;
}

function formaterValeurLogement(field, value, unit) {
  if (value == null || value === "") return null;
  if (field === "surfaceHabitable") return unit ? `${value} ${unit}` : String(value);
  if (field === "consommationAnnuelle") return unit ? `${value} ${unit}` : String(value);
  return String(value);
}

export function champsValides(champs) {
  return (champs || []).filter((c) => c.status === "validated");
}

export function champsContradictoires(champs) {
  return (champs || []).filter((c) => c.status === "conflicting");
}

export function travauxProposesDepuisChamps(champs) {
  return (champs || [])
    .filter((c) => c.categorie === "travaux" && c.status !== "rejected" && !c.nEstPasUneLigneTravaux)
    .map((c) => {
      const ligne = typeof c.value === "object" && c.value ? c.value : { prestation: String(c.value || "") };
      return {
        id: c.id,
        prestation: ligne.prestation || c.field,
        quantite: ligne.quantite ?? null,
        unite: ligne.unite || c.unit || null,
        prixHt: ligne.prixHt ?? null,
        tva: ligne.tva ?? null,
        prixTtc: ligne.prixTtc ?? null,
        sourcePrix: ligne.sourcePrix || c.sourcePrix || "devis",
        prixFerme: false,
        statut: "propose",
        sourceDocument: c.sourceDocument,
        sourcePage: c.sourcePage,
        confidence: c.confidence,
        fourchette: ligne.sourcePrix === "fourchette" || c.sourcePrix === "fourchette" || ligne.prixHt == null,
      };
    });
}

export function recommandationsDepuisChamps(champs) {
  return (champs || [])
    .filter((c) => c.nEstPasUneLigneTravaux && c.status !== "rejected")
    .map((c) => ({
      id: c.id,
      texte: String(c.value || ""),
      sourceDocument: c.sourceDocument,
      status: c.status,
    }));
}

function fusionnerTravauxSansEcrasement(existants, nouveaux) {
  const resultat = Array.isArray(existants) ? [...existants] : [];
  for (const ligne of nouveaux || []) {
    const actuel = resultat.find(
      (item) => String(item.prestation || "").toLowerCase() === String(ligne.prestation || "").toLowerCase(),
    );
    if (!actuel) {
      resultat.push({ ...ligne, prixFerme: false, statut: "propose" });
      continue;
    }
    const memePrix = actuel.prixHt === ligne.prixHt && actuel.quantite === ligne.quantite;
    if (memePrix) continue;
    actuel.statut = "contradictoire";
    actuel.valeurProposee = ligne;
    actuel.prixFerme = false;
  }
  return resultat;
}

export function appliquerChampsValides(base, champs) {
  const dossier = structuredCloneSafe(base);
  const sources = { ...(dossier.logementSources || {}) };
  const extras = { ...(dossier.logementExtras || {}) };
  const contradictions = [];

  for (const champ of champsValides(champs)) {
    const cibleLogement = champLogementId(champ.field);
    if (cibleLogement) {
      const nouvelle = formaterValeurLogement(champ.field, champ.value, champ.unit);
      const actuelle = dossier.logement?.[cibleLogement];
      if (actuelle && String(actuelle) !== String(nouvelle)) {
        contradictions.push({
          field: cibleLogement,
          actuelle,
          proposee: nouvelle,
          sourceDocument: champ.sourceDocument,
        });
        continue;
      }
      dossier.logement[cibleLogement] = nouvelle;
      sources[cibleLogement] = {
        sourceDocument: champ.sourceDocument,
        sourcePage: champ.sourcePage,
        confidence: champ.confidence,
        validatedAt: champ.validatedAt,
      };
    }

    if (champ.field === "numeroDpe") extras.numeroDpe = champ.value;
    if (champ.field === "emissionsGes") extras.emissionsGes = champ.value;
    if (champ.field === "eauChaude") extras.eauChaude = champ.value;
    if (champ.field === "dpeActuel") extras.dpeActuel = champ.value;
    if (champ.field === "commune" && !dossier.client.ville) dossier.client.ville = String(champ.value);
    if (champ.field === "codePostal" && !dossier.client.codePostal) dossier.client.codePostal = String(champ.value);

    const cibleClient = MAP_CLIENT[champ.field];
    if (cibleClient) {
      const actuelle = dossier.client[cibleClient];
      const nouvelle = String(champ.value);
      if (actuelle && String(actuelle) !== nouvelle) {
        contradictions.push({
          field: cibleClient,
          actuelle,
          proposee: nouvelle,
          sourceDocument: champ.sourceDocument,
        });
        continue;
      }
      if (!actuelle) dossier.client[cibleClient] = nouvelle;
    }

    if (champ.field === "adresseExacte" && !dossier.client.adresse) {
      dossier.client.adresse = String(champ.value);
    }
  }

  const contamination = detecterContaminationBussieres(dossier);
  if (contamination.length > 0) {
    return {
      ok: false,
      base,
      contradictions: [
        ...contradictions,
        { field: "dossier", actuelle: "Feurs", proposee: contamination.join(", "), motif: "feurs_bussieres" },
      ],
      message: ALERTE_REFERENCE_BUSSIERES_DISTINCTE,
    };
  }

  dossier.logementSources = sources;
  dossier.logementExtras = extras;
  dossier.recommandationsImport = recommandationsDepuisChamps(champs);
  dossier.travauxProposes = fusionnerTravauxSansEcrasement(
    dossier.travauxProposes,
    travauxProposesDepuisChamps(champs),
  );
  dossier.documents = {
    ...dossier.documents,
    devis: {
      ...dossier.documents.devis,
      lignes: [],
      prixFerme: false,
      totalHt: null,
      totalTtc: null,
    },
  };

  return { ok: true, base: dossier, contradictions, message: null };
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

export function listerDonneesManquantesAides(base) {
  const manquantes = [];
  if (!base?.client?.codePostal && !base?.client?.ville) manquantes.push("localisation");
  if (!base?.logement?.typeLogement && !base?.logement?.typeBatiment) manquantes.push("type de logement");
  if (!base?.client?.statutOccupation) manquantes.push("statut du ménage (propriétaire / bailleur / indivision)");
  if (!base?.client?.foyerReelVerifie) manquantes.push("composition du foyer vérifiée");
  if (base?.client?.occupants == null && !base?.client?.foyerReelVerifie) manquantes.push("nombre de personnes");
  if (!base?.rfr?.montant || !base?.client?.foyerReelVerifie) manquantes.push("revenus vérifiés");
  if (!base?.logement?.dpeFourni && !base?.logementExtras?.dpeActuel) manquantes.push("DPE actuel");
  const travaux = (base?.travauxProposes || []).filter((l) => l.statut !== "rejete");
  if (travaux.length === 0) manquantes.push("travaux");
  return manquantes;
}

export function preparerAidesIndicatives(base) {
  const manquantes = listerDonneesManquantesAides(base);
  const sources = [
    {
      dispositif: "MaPrimeRénov’",
      sourceOfficielle: "service-public.fr — fiche F35083",
      url: URL_SERVICE_PUBLIC_MPR,
      dateVerificationWeb: DATE_VERIFICATION_SOURCES_OFFICIELLES,
      pageVerifieeLe: "2026-09-01",
      statut: "consulte",
    },
    {
      dispositif: "ANAH",
      sourceOfficielle: "anah.gouv.fr",
      url: URL_ANAH,
      dateVerificationWeb: DATE_VERIFICATION_SOURCES_OFFICIELLES,
      statut: "consulte",
    },
    {
      dispositif: "France Rénov’",
      sourceOfficielle: "france-renov.gouv.fr",
      url: URL_FRANCE_RENOV_MPR,
      dateVerificationWeb: DATE_VERIFICATION_SOURCES_OFFICIELLES,
      statut: "consulte",
    },
  ];

  const verif = base?.aidesVerification;
  const webOk =
    verif?.aides_verifiees_web === true &&
    !verificationWebObsolete(verif?.aides_date_verification_web);

  if (manquantes.length > 0) {
    return {
      calculable: false,
      message: MENTION_AIDES_NON_CALCULABLES,
      manquantes,
      lignes: [],
      mention: MENTION_AIDES_INDICATIVES,
      sources,
      verifieesWeb: Boolean(webOk),
      categorieAide: null,
    };
  }

  if (!webOk) {
    return {
      calculable: false,
      message: "Aides indicatives bloquées — vérification sur une source officielle à jour requise.",
      manquantes: ["date de vérification web"],
      lignes: [],
      mention: MENTION_AIDES_INDICATIVES,
      sources,
      verifieesWeb: false,
      categorieAide: null,
    };
  }

  return {
    calculable: false,
    message: MENTION_AIDES_NON_CALCULABLES,
    manquantes: ["décision administrateur après contrôle des barèmes officiels"],
    lignes: [],
    mention: MENTION_AIDES_INDICATIVES,
    sources,
    verifieesWeb: true,
    categorieAide: null,
  };
}

export function preparerFinancementIndicatif(base) {
  const lignes = (base?.travauxProposes || []).filter((l) => !l.fourchette && l.prixHt != null && l.statut !== "rejete");
  const cout = lignes.reduce((sum, l) => sum + Number(l.prixHt || 0), 0);
  if (!lignes.length || !(cout > 0)) {
    return {
      calculable: false,
      message: "Simulation indicative non calculable — coût des travaux validé manquant.",
      mention: MENTION_FINANCEMENT_INDICATIF,
      hypothese: null,
    };
  }
  return {
    calculable: true,
    message: MENTION_FINANCEMENT_INDICATIF,
    mention: MENTION_FINANCEMENT_INDICATIF,
    hypothese: {
      coutTravauxHt: cout,
      aidesIndicatives: null,
      apport: null,
      montantAFinancer: cout,
      duree: null,
      taux: null,
      mensualite: null,
      dateSimulation: new Date().toISOString().slice(0, 10),
      statutPrix: "indicatif_a_verifier",
    },
  };
}

export function preparerFinancesInternes(base, role = "administrateur") {
  const coutArtisan = base?.financesInternes?.coutArtisanHt ?? null;
  const prixVente = base?.financesInternes?.prixVenteHt ?? null;
  const commission =
    prixVente == null ? null : Math.round((prixVente * 0.1 + Number.EPSILON) * 100) / 100;
  const marge =
    prixVente == null || coutArtisan == null || commission == null
      ? null
      : Math.round((prixVente - coutArtisan - commission + Number.EPSILON) * 100) / 100;

  if (role !== "administrateur") {
    return {
      visible: role === "commercial",
      commission_amount: role === "commercial" ? commission : null,
      coutArtisanHt: null,
      net_margin: null,
      prixVenteHt: null,
    };
  }
  return {
    visible: true,
    commission_amount: commission,
    coutArtisanHt: coutArtisan,
    prixVenteHt: prixVente,
    net_margin: coutArtisan == null ? null : marge,
    statutPaiement: base?.financesInternes?.statutPaiement ?? null,
  };
}

export function deriverStatutDossierTravail({ base, champs, documents }) {
  const contradictions = champsContradictoires(champs);
  if ((documents || []).some((d) => d.statutAnalyse === "bloque_contradiction") || contradictions.length) {
    return "Données à vérifier";
  }
  if ((champs || []).some((c) => c.status === "proposed" || c.status === "extracted")) {
    return "Données à vérifier";
  }
  if ((documents || []).length > 0 && (champs || []).every((c) => c.status === "validated" || c.status === "rejected")) {
    if ((base?.travauxProposes || []).length > 0) return "Devis à préparer";
    if (logementManquant(base?.logement).length < CHAMPS_LOGEMENT_REQUIS.length) return "Étude préparatoire";
    return "Analyse en cours";
  }
  if ((documents || []).length > 0) return "Analyse en cours";
  return base?.statutDossier?.startsWith("Documents reçus") ? "Documents reçus" : "Documents reçus";
}

export function construireDossierTravailSynthese({ base, champs, documents, role = "administrateur" }) {
  const etude = etudierFaisabiliteFeurs(base);
  const aides = preparerAidesIndicatives(base);
  const financement = preparerFinancementIndicatif(base);
  const finances = preparerFinancesInternes(base, role);
  const statut = deriverStatutDossierTravail({ base, champs, documents });
  const valides = champsValides(champs);
  const contradictions = champsContradictoires(champs);
  const manquantsLogement = logementManquant(base?.logement);

  return {
    statut,
    documentsRecus: (documents || []).length,
    documentsAnalyses: (documents || []).filter((d) => d.statutAnalyse === "analyse_terminee").length,
    donneesExtraites: (champs || []).length,
    donneesValidees: valides.length,
    donneesContradictoires: contradictions.length,
    donneesManquantes: manquantsLogement.map((c) => c.label),
    travauxProposes: base?.travauxProposes || [],
    aidesVerifiees: Boolean(aides.verifieesWeb),
    financementSimule: Boolean(financement.calculable),
    etude,
    aides,
    financement,
    finances,
    prochainesActions: [
      manquantsLogement.length ? "Compléter le logement" : null,
      contradictions.length ? "Résoudre les contradictions" : null,
      "Vérifier les aides sur une source officielle",
      "Ne pas transmettre tant que le contrôle administrateur n’est pas levé",
    ].filter(Boolean),
    responsable: "Sylvain LEMBELEMBE — administrateur",
    echeance: null,
  };
}

export function estDossierBrunel(dossierId) {
  return dossierId === BRUNEL_DOSSIER_ID;
}
