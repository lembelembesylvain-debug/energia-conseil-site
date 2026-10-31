/**
 * Couche Cadastre — API Carto IGN (Parcellaire Express) + emprise bâti BD TOPO (Géoplateforme).
 * Sources officielles ouvertes, sans clé.
 * @see https://apicarto.ign.fr/api/doc/cadastre
 */

import { aireGeojsonM2, roundM2 } from "./aire.js";

export const URL_CADASTRE_PARCELLE = "https://apicarto.ign.fr/api/cadastre/parcelle";
export const URL_WFS_BATIMENT = "https://data.geopf.fr/wfs/ows";

const ENTETES = {
  Accept: "application/json",
  "User-Agent": "ENERGIA-CONSEIL-IA/proptech-cadastre",
};

async function fetchJson(url, { signal } = {}) {
  const reponse = await fetch(url, { signal, headers: ENTETES });
  if (!reponse.ok) {
    throw new Error(`Cadastre indisponible (${reponse.status}).`);
  }
  return reponse.json();
}

function propsParcelle(feature) {
  const p = feature?.properties || {};
  const section = String(p.section || p.sectioncadastrale || "").trim();
  const numero = String(p.numero || p.numero_parcelle || "").trim().padStart(4, "0");
  const codeInsee = String(p.code_insee || `${p.code_dep || ""}${p.code_com || ""}`).trim();
  const contenance = roundM2(p.contenance);
  return {
    section,
    numero,
    feuille: String(p.feuille || "").trim(),
    codeInsee,
    commune: String(p.nom_com || p.nomcommune || "").trim(),
    codeDep: String(p.code_dep || "").trim(),
    contenanceM2: contenance,
    idu: String(p.idu || p.id || `${codeInsee}${section}${numero}`).trim(),
  };
}

export function normaliserParcelle(feature) {
  if (!feature?.geometry) return null;
  const meta = propsParcelle(feature);
  const surfaceCalculee = roundM2(aireGeojsonM2(feature.geometry));
  return {
    ...meta,
    surfaceTerrainM2: meta.contenanceM2 || surfaceCalculee,
    surfaceCalculeeM2: surfaceCalculee,
    geometry: feature.geometry,
  };
}

export async function chargerParcelleCadastre(lat, lng, { signal } = {}) {
  const geom = JSON.stringify({ type: "Point", coordinates: [Number(lng), Number(lat)] });
  const params = new URLSearchParams({
    geom,
    source_ign: "PCI",
    _limit: "1",
  });
  const brut = await fetchJson(`${URL_CADASTRE_PARCELLE}?${params}`, { signal });
  const feature = brut?.features?.[0];
  return normaliserParcelle(feature);
}

function bboxAutour(lat, lng, metres = 40) {
  const dLat = metres / 111320;
  const dLng = metres / (111320 * Math.cos((Number(lat) * Math.PI) / 180));
  return {
    minLat: Number(lat) - dLat,
    minLng: Number(lng) - dLng,
    maxLat: Number(lat) + dLat,
    maxLng: Number(lng) + dLng,
  };
}

function pointDansBbox(lat, lng, bbox) {
  return lat >= bbox.minLat && lat <= bbox.maxLat && lng >= bbox.minLng && lng <= bbox.maxLng;
}

function centroideLatLng(geometry) {
  if (!geometry) return null;
  const coords =
    geometry.type === "Polygon"
      ? geometry.coordinates?.[0]
      : geometry.type === "MultiPolygon"
        ? geometry.coordinates?.[0]?.[0]
        : null;
  if (!Array.isArray(coords) || !coords.length) return null;
  const n = coords.length;
  const lng = coords.reduce((s, p) => s + Number(p[0]), 0) / n;
  const lat = coords.reduce((s, p) => s + Number(p[1]), 0) / n;
  return { lat, lng };
}

export function choisirBatimentPrincipal(features, lat, lng) {
  const liste = Array.isArray(features) ? features : [];
  if (!liste.length) return null;
  const bbox = bboxAutour(lat, lng, 80);
  const notes = liste
    .map((feature) => {
      const surface = roundM2(aireGeojsonM2(feature.geometry)) || 0;
      const c = centroideLatLng(feature.geometry);
      if (!c) return null;
      const dx = (c.lng - lng) * 111320 * Math.cos((lat * Math.PI) / 180);
      const dy = (c.lat - lat) * 111320;
      const dist = Math.hypot(dx, dy);
      const proche = pointDansBbox(c.lat, c.lng, bbox);
      return { feature, surface, dist, proche };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.proche !== b.proche) return a.proche ? -1 : 1;
      if (Math.abs(a.dist - b.dist) > 8) return a.dist - b.dist;
      return b.surface - a.surface;
    });
  const meilleur = notes[0];
  if (!meilleur) return null;
  const usage = String(meilleur.feature.properties?.usage_1 || meilleur.feature.properties?.nature || "bâti").trim();
  return {
    empriseSolM2: meilleur.surface,
    usage,
    geometry: meilleur.feature.geometry,
    distanceM: Math.round(meilleur.dist),
  };
}

export async function chargerEmpriseBati(lat, lng, { signal } = {}) {
  const bbox = bboxAutour(lat, lng, 50);
  const params = new URLSearchParams({
    SERVICE: "WFS",
    VERSION: "2.0.0",
    REQUEST: "GetFeature",
    TYPENAMES: "BDTOPO_V3:batiment",
    OUTPUTFORMAT: "application/json",
    SRSNAME: "EPSG:4326",
    COUNT: "20",
    BBOX: `${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat},EPSG:4326`,
  });
  try {
    const brut = await fetchJson(`${URL_WFS_BATIMENT}?${params}`, { signal });
    return choisirBatimentPrincipal(brut?.features, Number(lat), Number(lng));
  } catch {
    return null;
  }
}

export async function chargerCoucheCadastre(lat, lng, { signal } = {}) {
  const [parcelle, bati] = await Promise.all([
    chargerParcelleCadastre(lat, lng, { signal }),
    chargerEmpriseBati(lat, lng, { signal }),
  ]);
  return {
    source: "IGN API Carto (Parcellaire Express) + Géoplateforme BD TOPO",
    parcelle,
    bati,
  };
}
