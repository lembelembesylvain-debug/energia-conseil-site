/**
 * Contrôle final administrateur (lot E).
 * Aucune génération, transmission ou publication tant que les garde-fous ne passent pas.
 */

import { listerControlesBloquants, detecterContaminationBussieres } from "./brunelWorkingBase.js";
import { champsContradictoires } from "./prefillDossier.js";
import { dossierEstProtege } from "./gardeFousImport.js";
import { peutValiderDossier } from "./roles.js";

export const MENTION_PAS_DE_GARANTIE =
  "Aucune aide, économie, mensualité ou classe DPE future n’est garantie.";

function documentDemo(doc) {
  const nom = String(doc?.nomFichier || "").toLowerCase();
  return /demo|pereira|marjollet|test-local/.test(nom) || doc?.type === "demo";
}

export function listerControlesFinaux({ base, champs, documents, role, dossier }) {
  const raisons = [];
  if (!peutValiderDossier(role)) {
    raisons.push("Seul l’administrateur peut valider le contrôle final.");
  }
  if (dossierEstProtege(dossier)) {
    raisons.push("Dossier de démonstration protégé — aucune génération.");
  }
  raisons.push(...listerControlesBloquants(base));

  const contradictions = champsContradictoires(champs);
  if (contradictions.length > 0) {
    raisons.push("Contradiction non résolue : vérifier l’identité du client et l’adresse du bien avant association au dossier.");
  }
  if ((documents || []).some((d) => d.statutAnalyse === "bloque_contradiction")) {
    raisons.push("Contradiction Feurs / Bussières : import bloqué non résolu.");
  }
  const contamination = detecterContaminationBussieres(base);
  if (contamination.length > 0) {
    raisons.push("Données Feurs et Bussières mélangées.");
  }
  if ((base?.travauxProposes || []).some((l) => l.prixFerme && l.fourchette)) {
    raisons.push("Une fourchette a été convertie en prix ferme.");
  }
  if ((base?.travauxProposes || []).some((l) => l.prixHt != null && !l.sourceDocument && !l.sourcePrix)) {
    raisons.push("Prix sans source.");
  }
  if ((base?.travauxProposes || []).some((l) => Number(l.prixHt) < 0 || Number(l.prixTtc) < 0)) {
    raisons.push("Montant négatif.");
  }
  if ((documents || []).some(documentDemo)) {
    raisons.push("Document de démonstration détecté.");
  }
  const verif = base?.aidesVerification;
  if (verif?.statut === "valide" && !verif?.aides_verifiees_web) {
    raisons.push("Aide non vérifiée sur une source officielle à jour.");
  }
  if (base?.documents?.devis?.prixFerme) {
    raisons.push("Une estimation ne peut pas devenir un devis ferme.");
  }
  if (base?.documents?.audit?.publie || base?.documents?.devis?.publie || base?.documents?.rapport?.publie) {
    raisons.push("Un document a été marqué publié.");
  }

  const uniques = [...new Set(raisons)];
  return {
    ok: uniques.length === 0,
    bloque: uniques.length > 0,
    raisons: uniques,
    publication: false,
    transmissionBloquee: true,
    generationBloquee: true,
  };
}

export function actionsControleFinal(controles) {
  return {
    enregistrerBrouillon: true,
    corrigerManuellement: true,
    validerDonnees: true,
    genererDevisEstimatif: false,
    genererEtudePreparatoire: !controles.bloque ? false : false,
    genererRapport: false,
    transmettre: false,
    motifs: {
      genererDevisEstimatif: "Devis estimatif non généré automatiquement — estimation non contractuelle, validation incomplète.",
      genererEtudePreparatoire:
        "L’étude préparatoire interne est affichée à l’écran. Aucun PDF réglementaire n’est produit.",
      genererRapport: controles.raisons.join(" "),
      transmettre: "Transmission bloquée tant qu’une contradiction, une donnée obligatoire ou une aide non vérifiée subsiste.",
    },
  };
}
