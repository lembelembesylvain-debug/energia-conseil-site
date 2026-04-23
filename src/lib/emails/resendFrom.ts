/** Domaine vérifié Resend — ne pas utiliser d’autre domaine en expéditeur. */
export const RESEND_VERIFIED_ADDRESS = "noreply@energia-conseil-ia.com";

/**
 * Construit l’en-tête From pour Resend : domaine vérifié uniquement,
 * remplace tout @…renovoptim-ia.com par @energia-conseil-ia.com.
 */
export function buildResendFromHeader(
  envFrom: string | undefined,
  displayName: string,
): string {
  const raw = (envFrom?.trim() || RESEND_VERIFIED_ADDRESS).replace(
    /renovoptim-ia\.com/gi,
    "energia-conseil-ia.com",
  );
  if (raw.includes("<")) {
    return raw;
  }
  return `${displayName} <${raw}>`;
}
