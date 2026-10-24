/**
 * Identité visuelle centrale ENERGIA CONSEIL IA® — CRM.
 * Logo officiel unique : scripts_ia/assets/LOGO.png
 * (copie web : public/assets/LOGO.png — jamais dans un dossier client).
 */

export const LOGO_PUBLIC_PATH = "/assets/LOGO.png";
export const LOGO_FS_RELATIVE = "public/assets/LOGO.png";
export const LOGO_SCRIPTS_IA_FS = "C:/scripts_ia/assets/LOGO.png";
/** Ratio naturel du PNG officiel 709×412. */
export const LOGO_NATURAL = { width: 709, height: 412 } as const;

export const BRANDING = {
  nom: "ENERGIA CONSEIL IA®",
  slogan: "Audit Énergétique Intelligence Artificielle",
  adresse: "16 rue Cuvier, 69006 Lyon",
  siege: "16 Rue Cuvier, 69006 Lyon",
  telephone: "06 10 59 68 98",
  email: "contact@energia-conseil-ia.com",
  site: "www.energia-conseil-ia.com",
  siret: "94181942700019",
  siretAffiche: "941 819 427 00019",
  rcs: "Lyon 941819427",
  rcsAffiche: "Lyon 941 819 427",
  forme: "SASU",
  capital: "100 €",
  inpi: "5213845",
  ape: "7112B",
  apeLibelle: "Ingénierie, études techniques",
  tva: "FR01941819427",
} as const;

/** Bloc d'identité officielle — pieds de devis, contrats et rapports. */
export const IDENTITE_LEGALE = {
  raisonSociale: "ENERGIA CONSEIL IA® — Marque déposée et protégée INPI n° 5213845",
  forme: "SASU au capital de 100 € — RCS Lyon 941 819 427 — SIRET : 941 819 427 00019",
  ape: "Code APE / NAF : 7112B (Ingénierie, études techniques) — N° TVA Intracommunautaire : FR01941819427",
  siege: "Siège social : 16 Rue Cuvier, 69006 Lyon",
} as const;

export const MENTION_PROPRIETE_INTELLECTUELLE =
  "Algorithmes de modélisation thermique et méthodologie d'audit propriétaires protégés par le droit d'auteur (Code de la propriété intellectuelle). Plateforme exploitée sous licence de marque exclusive ENERGIA CONSEIL IA®. Reproduction et diffusion interdites sans autorisation.";

export const MENTION_MARCHE_CONTRACTANT_GENERAL =
  "Marché de Rénovation Globale Clé en Main régi par les articles 1787 et suivants du Code Civil. Mission complète de Contractant Général : conception, ingénierie financière des aides (Anah / CEE), coordination et exécution des travaux, garantie de parfait achèvement et responsabilité décennale.";

export const BADGES_OFFICIELS = [
  "Marque Déposée INPI n° 5213845",
  "Ingénierie CEE & Décret Tertiaire",
  "Partenaire Référencé Tesla Energy (Powerwall 3 & Wall Connector)",
] as const;

export const LIGNES_IDENTITE_OFFICIELLE = [
  IDENTITE_LEGALE.raisonSociale,
  IDENTITE_LEGALE.forme,
  IDENTITE_LEGALE.ape,
  IDENTITE_LEGALE.siege,
  MENTION_PROPRIETE_INTELLECTUELLE,
] as const;

export const COULEURS = {
  primary: "#0F172A",
  secondary: "#10B981",
  accent: "#0F766E",
  alert: "#F97316",
  bgLight: "#F8FAFC",
  textDark: "#1E293B",
  textMuted: "#64748B",
  white: "#FFFFFF",
  border: "#E2E8F0",
} as const;

export const PIED_DE_PAGE = LIGNES_IDENTITE_OFFICIELLE.join(" — ");

export function htmlPiedIdentite(): string {
  return LIGNES_IDENTITE_OFFICIELLE.map((ligne) => `<p>${ligne}</p>`).join("\n");
}

export function htmlMentionContractuelle(): string {
  return `<p class="mention-marche"><strong>Qualification du marché.</strong> ${MENTION_MARCHE_CONTRACTANT_GENERAL}</p>`;
}

export function htmlBadgesOfficiels(): string {
  const pastilles = BADGES_OFFICIELS.map(
    (badge) => `<span class="badge-officiel">${badge}</span>`,
  ).join("");
  return `<div class="badges-officiels" aria-label="Badges officiels">${pastilles}</div>`;
}

export const LOGO_BOX = {
  header: { maxWidthMm: 42, maxHeightMm: 18 },
  footer: { maxWidthMm: 22, maxHeightMm: 9 },
  cover: { maxWidthMm: 52, maxHeightMm: 30 },
} as const;

export function fitLogo(
  naturalWidth: number,
  naturalHeight: number,
  maxWidthMm: number,
  maxHeightMm: number,
): { width: number; height: number } {
  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: maxWidthMm, height: maxHeightMm };
  }
  const ratio = naturalHeight / naturalWidth;
  let width = maxWidthMm;
  let height = width * ratio;
  if (height > maxHeightMm) {
    height = maxHeightMm;
    width = height / ratio;
  }
  return { width, height };
}

export function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "").trim();
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}
