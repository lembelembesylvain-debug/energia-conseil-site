/**
 * Aires géodésiques approximatives (WGS84) pour parcelles et emprises cadastrales.
 * Formule équirectangulaire + shoelace — suffisante à l’échelle d’une parcelle.
 */

const RAYON_TERRE_M = 6371008.8;

function fermerAnneau(anneau) {
  if (!Array.isArray(anneau) || anneau.length < 3) return [];
  const points = anneau.map((p) => [Number(p[0]), Number(p[1])]).filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
  if (points.length < 3) return [];
  const premier = points[0];
  const dernier = points[points.length - 1];
  if (premier[0] !== dernier[0] || premier[1] !== dernier[1]) points.push([...premier]);
  return points;
}

function aireAnneauM2(anneau) {
  const pts = fermerAnneau(anneau);
  if (pts.length < 4) return 0;
  const latMoy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const cosLat = Math.cos((latMoy * Math.PI) / 180);
  let somme = 0;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const x1 = ((pts[i][0] * Math.PI) / 180) * RAYON_TERRE_M * cosLat;
    const y1 = ((pts[i][1] * Math.PI) / 180) * RAYON_TERRE_M;
    const x2 = ((pts[i + 1][0] * Math.PI) / 180) * RAYON_TERRE_M * cosLat;
    const y2 = ((pts[i + 1][1] * Math.PI) / 180) * RAYON_TERRE_M;
    somme += x1 * y2 - x2 * y1;
  }
  return Math.abs(somme) / 2;
}

export function aireGeojsonM2(geometry) {
  if (!geometry || typeof geometry !== "object") return 0;
  const type = geometry.type;
  const coords = geometry.coordinates;
  if (type === "Polygon" && Array.isArray(coords)) {
    const exterieur = aireAnneauM2(coords[0] || []);
    const trous = coords.slice(1).reduce((s, anneau) => s + aireAnneauM2(anneau), 0);
    return Math.max(0, exterieur - trous);
  }
  if (type === "MultiPolygon" && Array.isArray(coords)) {
    return coords.reduce((s, polygone) => s + aireGeojsonM2({ type: "Polygon", coordinates: polygone }), 0);
  }
  return 0;
}

export function roundM2(valeur) {
  const n = Number(valeur);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}
