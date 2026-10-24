export const EXPEDITEUR_NOM = "ENERGIA CONSEIL IA®";
export const EXPEDITEUR_EMAIL = "contact@energia-conseil-ia.com";
export const EXPEDITEUR_FROM = `${EXPEDITEUR_NOM} <${EXPEDITEUR_EMAIL}>`;

export const SIGNATURE_OFFICIELLE = [
  "Sylvain Lembelembe",
  "Fondateur & CEO — Contractant Général Digital",
  "ENERGIA-CONSEIL IA®️",
  "Direction & Ingénierie",
  "Bureau d'Études Thermiques & Solaire — Contractant Général",
  "Marque déposée INPI n° 5213845",
  "16 Rue Cuvier, 69006 Lyon",
  "06 10 59 68 98",
  "contact@energia-conseil-ia.com",
  "energia-conseil-ia.com | renovoptim-ia.com",
].join("\n");

export function avecSignature(corps: string): string {
  const texte = corps.replace(/\s+$/u, "");
  if (texte.includes("Sylvain Lembelembe") && texte.includes("energia-conseil-ia.com")) {
    return texte;
  }
  return `${texte}\n\n${SIGNATURE_OFFICIELLE}`;
}
