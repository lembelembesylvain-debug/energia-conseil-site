/** Dossiers association — hors pipeline commercial. Aucune donnée nominative à la création. */

export const STORAGE_DOSSIERS_INSALUBRITE = "energia-crm-dossiers-insalubrite";

export const STATUT_ATTENTE_CONSENTEMENT = "en_attente_consentement";

function lireBrut() {
  try {
    const raw = localStorage.getItem(STORAGE_DOSSIERS_INSALUBRITE);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ecrire(dossiers) {
  localStorage.setItem(STORAGE_DOSSIERS_INSALUBRITE, JSON.stringify(dossiers.slice(0, 200)));
}

export function lireDossiersInsalubrite() {
  return lireBrut();
}

export function creerDossierInsalubrite(point) {
  if (!point?.id) return null;
  const existants = lireBrut();
  const deja = existants.find((item) => item.sourcePointId === point.id);
  if (deja) return deja;

  const dossier = {
    id: `insal-${Date.now()}`,
    sourcePointId: String(point.id),
    createdAt: new Date().toISOString(),
    statut: STATUT_ATTENTE_CONSENTEMENT,
    city: String(point.city || ""),
    quartier: String(point.quartier || ""),
    zone_label: String(point.zone_label || "Zone agrégée"),
    lat: Number(point.lat),
    lng: Number(point.lng),
    type_pb: String(point.type_pb || ""),
    urgency_score: Number(point.urgency_score) || 1,
    signalements_count: Number(point.signalements_count) || 0,
    building_kind: String(point.building_kind || ""),
    notes:
      "Dossier créé depuis le radar. Aucune donnée nominative. Occupant, téléphone et e-mail à saisir uniquement après contact direct et consentement.",
  };

  ecrire([dossier, ...existants]);
  return dossier;
}
