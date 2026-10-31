/** Auto-complétion villes / CP via la Base Adresse Nationale (adresse.data.gouv.fr). */

const BAN_URL = "https://api-adresse.data.gouv.fr/search/";

export function extraireDepartementBan(properties = {}) {
  const contexte = String(properties.context || "")
    .split(",")[0]
    .trim()
    .toUpperCase();
  if (/^2[AB]$/.test(contexte)) return contexte;
  if (/^\d{2,3}$/.test(contexte)) return contexte.padStart(2, "0");

  const insee = String(properties.citycode || "").trim();
  if (/^2[AB]/i.test(insee)) return insee.slice(0, 2).toUpperCase();
  if (/^97|^98/.test(insee) && insee.length >= 3) return insee.slice(0, 3);

  const cp = String(properties.postcode || "").trim();
  if (/^97|^98/.test(cp) && cp.length >= 3) return cp.slice(0, 3);
  if (cp.length >= 2) return cp.slice(0, 2);

  return "";
}

export function normaliserSuggestionBan(feature, index = 0) {
  const props = feature?.properties ?? {};
  const coords = feature?.geometry?.coordinates ?? [];
  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const nom = String(props.city || props.name || props.label || "").trim();
  const codePostal = String(props.postcode || "").trim();
  const departement = extraireDepartementBan(props);

  return {
    id: String(props.id || `${departement}-${codePostal}-${index}`),
    nom,
    codePostal,
    departement,
    label: String(props.label || `${nom} ${codePostal}`).trim(),
    contexte: String(props.context || "").trim(),
    lat,
    lng,
    type: String(props.type || "municipality"),
    rue: String(props.street || props.name || "").trim(),
    numero: String(props.housenumber || "").trim(),
    codeInsee: String(props.citycode || "").trim(),
  };
}

async function rechercherBan(saisie, { signal, lat, lng, type, limit = "8" } = {}) {
  const q = String(saisie || "").trim();
  if (q.length < 3) return [];

  const params = new URLSearchParams({
    q,
    limit: String(limit),
    autocomplete: "1",
  });
  if (type) params.set("type", type);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    params.set("lat", String(lat));
    params.set("lon", String(lng));
  }

  const reponse = await fetch(`${BAN_URL}?${params}`, { signal });
  if (!reponse.ok) {
    throw new Error(`Recherche BAN indisponible (${reponse.status}).`);
  }
  return reponse.json();
}

export async function rechercherVillesBan(saisie, { signal, lat, lng } = {}) {
  const q = String(saisie || "").trim();
  const estCodePostal = /^\d{5}$/.test(q);
  const brut = await rechercherBan(q, {
    signal,
    lat,
    lng,
    type: estCodePostal ? undefined : "municipality",
  });
  const vues = new Set();
  const suggestions = [];
  for (const feature of brut.features ?? []) {
    const item = normaliserSuggestionBan(feature, suggestions.length);
    if (!item) continue;
    const cle = `${item.departement}|${item.codePostal}|${item.nom.toLowerCase()}`;
    if (vues.has(cle)) continue;
    vues.add(cle);
    suggestions.push(item);
  }
  return suggestions;
}

/** Adresses précises (n° + voie) pour le sniper cadastre / DVF / géorisques. */
export async function rechercherAdressesBan(saisie, { signal, lat, lng } = {}) {
  const brut = await rechercherBan(saisie, {
    signal,
    lat,
    lng,
    type: "housenumber",
    limit: "6",
  });
  return (brut.features ?? []).map((feature, index) => normaliserSuggestionBan(feature, index)).filter(Boolean);
}
