/**
 * Mise à jour des dossiers clients — garde-fou Vérification live.
 * Le champ source_verification_url est obligatoire côté métier avant Validé.
 */

import {
  STATUT_AIDES_BROUILLON,
  STATUT_AIDES_VALIDE,
  URL_ANAH_GOUV,
  peutPasserBrouillonVersValide,
} from "../aides/verificationLive.js";

export function payloadVerificationAidesDossier({
  sourceVerificationUrl = URL_ANAH_GOUV,
  aidesVerifieesWeb = false,
  dateVerificationWeb = null,
  auteur = null,
}) {
  return {
    source_verification_url: sourceVerificationUrl,
    aides_verifiees_web: aidesVerifieesWeb === true,
    aides_date_verification_web: dateVerificationWeb,
    aides_verifiees_web_par: auteur,
    aides_verifiees_web_at: aidesVerifieesWeb ? new Date().toISOString() : null,
  };
}

export function controlerChangementStatutDossier({
  statutActuel = STATUT_AIDES_BROUILLON,
  statutCible,
  aidesVerifieesWeb = false,
}) {
  return peutPasserBrouillonVersValide({
    statutActuel,
    statutCible,
    aidesVerifieesWeb,
  });
}

export { STATUT_AIDES_BROUILLON, STATUT_AIDES_VALIDE, URL_ANAH_GOUV };
