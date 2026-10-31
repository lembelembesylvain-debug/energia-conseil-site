/**
 * Configuration centrale des partenaires duplicables.
 *
 * Le prototype Catarina (/diagnostic-rapide, ses visuels, son QR, son contrat)
 * n’est PAS une source de données ici. Aucune photo, coordonnée ou QR Catarina
 * ne doit être copié dans un nouveau partenaire.
 *
 * L’identifiant historique `catarina-martins` est seulement reconnu pour
 * l’attribution CRM / API déjà en production — sans exposer son profil.
 */

export const A_COMPLETER = "[À COMPLÉTER]";

export const PARTNER_PUBLIC_ORIGIN = "https://www.energia-conseil-ia.com";

export const LOGO_TECHNIQUE_ENERGIA = "/assets/partners/_shared/energia-logo-arbres.png";

/** Prototype existant — id + source uniquement, aucune donnée personnelle recopiée. */
export const LEGACY_PROTOTYPE_ID = "catarina-martins";
export const LEGACY_PROTOTYPE_SOURCE = "Catarina / QR flyer";

export const PARTNER_FIELD_KEYS = [
  "id",
  "firstName",
  "lastName",
  "displayName",
  "network",
  "title",
  "phone",
  "email",
  "website",
  "sector",
  "photo",
  "logoPartner",
  "logoTechnicalPartner",
  "qrTarget",
  "crmPartnerId",
  "sourceLabel",
];

/**
 * Champs optionnels documentés (hors schéma minimal) :
 * - status: "demo" | "draft" | "published"
 * - legalMention, brandColor
 * Ne jamais remplir un nouveau partenaire avec les données Catarina.
 */
export function createEmptyPartner(id = "") {
  const slug = String(id || "").trim();
  return {
    id: slug,
    firstName: "",
    lastName: "",
    displayName: "",
    network: "",
    title: "",
    phone: "",
    email: "",
    website: "",
    sector: "",
    photo: "",
    logoPartner: "",
    logoTechnicalPartner: LOGO_TECHNIQUE_ENERGIA,
    qrTarget: slug ? `${PARTNER_PUBLIC_ORIGIN}/partenaire/${slug}` : "",
    crmPartnerId: slug,
    sourceLabel: "",
    status: "draft",
    legalMention: A_COMPLETER,
    brandColor: "#0b1f3a",
  };
}

export function champOuPlaceholder(value) {
  const texte = typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
  return texte ? texte : A_COMPLETER;
}

export function aUnePhoto(partner) {
  const photo = typeof partner?.photo === "string" ? partner.photo.trim() : "";
  return Boolean(photo) && photo !== A_COMPLETER;
}

export function aUnLogoReseau(partner) {
  const logo = typeof partner?.logoPartner === "string" ? partner.logoPartner.trim() : "";
  return Boolean(logo) && logo !== A_COMPLETER;
}

export function displayNameOf(partner) {
  if (!partner) return A_COMPLETER;
  const composed = `${partner.firstName || ""} ${partner.lastName || ""}`.trim();
  return champOuPlaceholder(partner.displayName || composed);
}

export function resolveQrTarget(partner) {
  const raw = champOuPlaceholder(partner?.qrTarget);
  if (raw === A_COMPLETER) return A_COMPLETER;
  if (/^https?:\/\//i.test(raw)) return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${PARTNER_PUBLIC_ORIGIN}${path}`;
}

export function partnerPagePath(partner) {
  const id = partner?.id ? String(partner.id).trim() : "";
  return id ? `/partenaire/${id}` : "";
}

/**
 * Partenaire fictif de test — aucune donnée Catarina.
 * Photo, logo réseau et plusieurs coordonnées volontairement vides.
 */
export const PARTNER_DEMO = {
  id: "demo-alexandre-morel",
  firstName: "Alexandre",
  lastName: "Morel",
  displayName: "Alexandre Morel",
  network: "Réseau partenaire (démo)",
  title: "Conseiller immobilier — valorisation énergétique",
  phone: A_COMPLETER,
  email: "demo.partenaire@example.com",
  website: "",
  sector: A_COMPLETER,
  photo: "",
  logoPartner: "",
  logoTechnicalPartner: LOGO_TECHNIQUE_ENERGIA,
  qrTarget: `${PARTNER_PUBLIC_ORIGIN}/partenaire/demo-alexandre-morel`,
  crmPartnerId: "demo-alexandre-morel",
  sourceLabel: "Alexandre Morel / QR partenaire (démo)",
  status: "demo",
  legalMention: A_COMPLETER,
  brandColor: "#0b1f3a",
};

export const PARTNERS = [PARTNER_DEMO];

const BY_ID = new Map(PARTNERS.map((partner) => [partner.id, partner]));

export function getPartnerById(id) {
  const key = String(id || "").trim();
  if (!key) return null;
  return BY_ID.get(key) || null;
}

export function isKnownPartnerId(id) {
  const key = String(id || "").trim();
  if (!key) return false;
  if (key === LEGACY_PROTOTYPE_ID) return true;
  return BY_ID.has(key);
}

export function getPartnerAttribution(id) {
  const key = String(id || "").trim();
  if (key === LEGACY_PROTOTYPE_ID) {
    return {
      partenaire_id: LEGACY_PROTOTYPE_ID,
      crmPartnerId: LEGACY_PROTOTYPE_ID,
      sourceLabel: LEGACY_PROTOTYPE_SOURCE,
    };
  }
  const partner = getPartnerById(key);
  if (!partner) return null;
  const crmPartnerId = champOuPlaceholder(partner.crmPartnerId) === A_COMPLETER
    ? partner.id
    : partner.crmPartnerId;
  return {
    partenaire_id: crmPartnerId,
    crmPartnerId,
    sourceLabel: champOuPlaceholder(partner.sourceLabel) === A_COMPLETER
      ? `${displayNameOf(partner)} / QR partenaire`
      : partner.sourceLabel,
    assignee: displayNameOf(partner),
  };
}

export function isPartnerPageEnabled(partner) {
  if (!partner?.id) return false;
  return partner.status === "demo" || partner.status === "published";
}

export function listKnownPartnerIds() {
  return [LEGACY_PROTOTYPE_ID, ...PARTNERS.map((partner) => partner.id)];
}

export function partnerAssetDir(partnerId) {
  return `/assets/partners/${partnerId}`;
}

export function partnerQrPublicPath(partnerId) {
  return `${partnerAssetDir(partnerId)}/qr.svg`;
}

export function assertNotCatarinaClone(partner) {
  const blob = JSON.stringify(partner || {}).toLowerCase();
  const interdits = [
    "catarina",
    "martins",
    "immobilier-chagny",
    "06 61 37 14 64",
    "0661371464",
    "qr-immobilier-chagny",
    "catarina-martins.png",
  ];
  return interdits.filter((motif) => blob.includes(motif));
}
