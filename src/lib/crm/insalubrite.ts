export const URL_INSALUBRITE_DATA = "/data/insalubrite_data.json";

export const AVERTISSEMENT_CONFIDENTIALITE =
  "Données agrégées et indicatives. Ne permettent pas d'identifier des personnes. Pour toute action, un contact direct et un consentement sont nécessaires.";

export const TYPES_PROBLEME = [
  { id: "tous", label: "Tous les problèmes", emoji: "" },
  { id: "humidité", label: "Humidité", emoji: "💧" },
  { id: "plomb", label: "Plomb", emoji: "☢️" },
  { id: "moisissure", label: "Moisissure", emoji: "🦠" },
  { id: "chauffage", label: "Chauffage", emoji: "🔥" },
  { id: "suroccupation", label: "Suroccupation", emoji: "👥" },
] as const;

export const FILTRES_URGENCE = [
  { id: "tous", label: "Toute urgence", min: 0 },
  { id: "3", label: "Urgence ≥ 3", min: 3 },
  { id: "4", label: "Urgence ≥ 4", min: 4 },
  { id: "5", label: "Urgence 5", min: 5 },
] as const;

export const FILTRES_ANCIENNETE = [
  { id: "tous", label: "Toute ancienneté", jours: 0 },
  { id: "30", label: "< 30 jours", jours: 30 },
  { id: "90", label: "< 90 jours", jours: 90 },
  { id: "365", label: "< 1 an", jours: 365 },
] as const;

export type TypeProbleme = (typeof TYPES_PROBLEME)[number]["id"];

export type PointInsalubrite = {
  id: string;
  city: string;
  quartier: string;
  zone_label: string;
  lat: number;
  lng: number;
  type_pb: Exclude<TypeProbleme, "tous"> | string;
  urgency_score: number;
  signalements_count: number;
  signalement_date: string;
  building_kind: string;
};

export type PayloadInsalubrite = {
  source: string;
  avertissement: string;
  centre: { nom: string; lat: number; lng: number; zoom: number };
  points: PointInsalubrite[];
};

const CHAMPS_INTERDITS = [
  "nom",
  "prenom",
  "name",
  "owner",
  "proprietaire",
  "occupant",
  "telephone",
  "tel",
  "phone",
  "email",
  "mail",
  "adresse_exacte",
];

export function emojiProbleme(typePb: string) {
  return TYPES_PROBLEME.find((item) => item.id === typePb)?.emoji ?? "⚠️";
}

export function libelleProbleme(typePb: string) {
  return TYPES_PROBLEME.find((item) => item.id === typePb)?.label ?? typePb;
}

export function couleurUrgence(score: number) {
  if (score >= 5) return "#dc2626";
  if (score >= 4) return "#ea580c";
  if (score >= 3) return "#f59e0b";
  return "#64748b";
}

function nombre(valeur: unknown) {
  const n = Number(valeur);
  return Number.isFinite(n) ? n : null;
}

function aChampInterdit(brut: Record<string, unknown>) {
  return Object.keys(brut).some((cle) => CHAMPS_INTERDITS.includes(cle.toLowerCase()));
}

export function normaliserPointInsalubrite(brut: Record<string, unknown>, index: number): PointInsalubrite | null {
  if (aChampInterdit(brut)) return null;
  const lat = nombre(brut.lat);
  const lng = nombre(brut.lng);
  if (lat == null || lng == null) return null;
  return {
    id: String(brut.id || `ins-${index}`),
    city: String(brut.city || "").trim(),
    quartier: String(brut.quartier || "").trim(),
    zone_label: String(brut.zone_label || "Zone agrégée").trim(),
    lat,
    lng,
    type_pb: String(brut.type_pb || "humidité").trim().toLowerCase(),
    urgency_score: Math.min(5, Math.max(1, nombre(brut.urgency_score) ?? 1)),
    signalements_count: Math.max(0, nombre(brut.signalements_count) ?? 0),
    signalement_date: String(brut.signalement_date || "").slice(0, 10),
    building_kind: String(brut.building_kind || "collectif").trim(),
  };
}

export function ancienneteJours(dateIso: string, maintenant = Date.now()) {
  const t = new Date(dateIso).getTime();
  if (Number.isNaN(t)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.round((maintenant - t) / 86400000));
}

export function pointVisible(
  point: PointInsalubrite,
  filtreType: string,
  filtreUrgence: string,
  filtreAnciennete: string,
) {
  if (filtreType !== "tous" && point.type_pb !== filtreType) return false;
  const minUrgence = FILTRES_URGENCE.find((item) => item.id === filtreUrgence)?.min ?? 0;
  if (point.urgency_score < minUrgence) return false;
  if (filtreUrgence === "5" && point.urgency_score !== 5) return false;
  const maxJours = FILTRES_ANCIENNETE.find((item) => item.id === filtreAnciennete)?.jours ?? 0;
  if (maxJours > 0 && ancienneteJours(point.signalement_date) > maxJours) return false;
  return true;
}

export async function chargerInsalubrite(signal?: AbortSignal): Promise<PayloadInsalubrite> {
  const reponse = await fetch(URL_INSALUBRITE_DATA, { signal });
  if (!reponse.ok) {
    throw new Error(`Impossible de charger les données agrégées (${reponse.status}).`);
  }
  const brut = await reponse.json();
  const points = (Array.isArray(brut?.points) ? brut.points : [])
    .map((item: Record<string, unknown>, index: number) => normaliserPointInsalubrite(item, index))
    .filter(Boolean) as PointInsalubrite[];
  return {
    source: String(brut?.source || ""),
    avertissement: String(brut?.avertissement || AVERTISSEMENT_CONFIDENTIALITE),
    centre: {
      nom: String(brut?.centre?.nom || "Zones d'intervention"),
      lat: nombre(brut?.centre?.lat) ?? 46.7808,
      lng: nombre(brut?.centre?.lng) ?? 4.8539,
      zoom: nombre(brut?.centre?.zoom) ?? 11,
    },
    points,
  };
}
