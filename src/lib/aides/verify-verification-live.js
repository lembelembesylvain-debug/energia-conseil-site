/**
 * Contrôles du module Vérification live des aides.
 * Exécution : node src/lib/aides/verify-verification-live.js
 */

import {
  ALERTE_VERIFICATION_ANAH,
  STATUT_AIDES_BROUILLON,
  STATUT_AIDES_VALIDE,
  appliquerDateLigne,
  creerVerificationAidesDossier,
  dateDuJourISO,
  formaterDateFr,
  lignesAidesVerifieesWeb,
  marquerAidesVerifieesWeb,
  mentionLegaleAidesVerifiees,
  passerAidesValidees,
  peutPasserBrouillonVersValide,
  verificationWebObsolete,
} from "./verificationLive.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const fixe = new Date("2026-09-14T12:00:00Z");

assert(dateDuJourISO(fixe) === "2026-09-14", "date ISO");
assert(formaterDateFr("2026-09-14", fixe) === "14/09/2026", "date FR");

const mention = mentionLegaleAidesVerifiees(fixe);
assert(mention.includes("14/09/2026"), "mention contient DATE_DU_JOUR");
assert(mention.includes("ANAH, Pollueurs"), "mention organismes");
assert(mention.includes("barèmes vérifiés le"), "mention barèmes");

assert(verificationWebObsolete(null, fixe) === true, "sans date = obsolète");
assert(verificationWebObsolete("2026-09-14", fixe) === false, "aujourd’hui OK");
assert(verificationWebObsolete("2026-08-15", fixe) === false, "30 jours pile encore OK");
assert(verificationWebObsolete("2026-08-14", fixe) === true, "31 jours = alerte");
assert(ALERTE_VERIFICATION_ANAH.includes("anah.gouv.fr"), "alerte ANAH");

const vide = creerVerificationAidesDossier();
assert(vide.statut === STATUT_AIDES_BROUILLON, "statut initial brouillon");
assert(vide.aides_verifiees_web === false, "pas encore vérifié");
assert(vide.source_verification_url === "https://www.anah.gouv.fr", "URL ANAH par défaut");
assert(vide.lignes.length === 3, "MPR / CEE / Bonus");
assert(lignesAidesVerifieesWeb(vide.lignes, fixe) === false, "lignes non vérifiées");

const bloque = peutPasserBrouillonVersValide({
  statutActuel: STATUT_AIDES_BROUILLON,
  statutCible: STATUT_AIDES_VALIDE,
  aidesVerifieesWeb: false,
});
assert(bloque.ok === false, "Brouillon → Validé bloqué");
assert(bloque.raisons[0].includes("Vérifiées Web"), "motif bloquant");

const okSansChangement = peutPasserBrouillonVersValide({
  statutActuel: STATUT_AIDES_BROUILLON,
  statutCible: STATUT_AIDES_BROUILLON,
  aidesVerifieesWeb: false,
});
assert(okSansChangement.ok === true, "rester brouillon autorisé");

const marque = marquerAidesVerifieesWeb(vide, { auteur: "administrateur", au: fixe });
assert(marque.aides_verifiees_web === true, "marqué vérifié");
assert(marque.aides_verifiees_web_par === "administrateur", "auteur admin");
assert(lignesAidesVerifieesWeb(marque.lignes, fixe) === true, "lignes OK");
assert(marque.statut === STATUT_AIDES_BROUILLON, "le marquage ne valide pas tout seul le dossier");

const passage = peutPasserBrouillonVersValide({
  statutActuel: STATUT_AIDES_BROUILLON,
  statutCible: STATUT_AIDES_VALIDE,
  aidesVerifieesWeb: marque.aides_verifiees_web,
});
assert(passage.ok === true, "passage autorisé après Vérifiées Web");

const refuseValide = passerAidesValidees(vide);
assert(refuseValide.ok === false, "valider sans marquage refusé");
const accepteValide = passerAidesValidees(marque);
assert(accepteValide.ok === true && accepteValide.verification.statut === STATUT_AIDES_VALIDE, "valider après marquage");

const ancienne = appliquerDateLigne(marque, "mpr", "2026-01-01");
assert(verificationWebObsolete(ancienne.lignes.find((l) => l.id === "mpr").dateVerificationWeb, fixe), "MPR trop vieux");
assert(ancienne.aides_verifiees_web === false, "une date périmée retire le flag dossier");

console.log("OK — vérification live : badges 30 jours, mention DATE_DU_JOUR, blocage Brouillon → Validé.");
