/**
 * GET /api/proptech-sniper?lat=&lng=&voie=
 * Agrège Cadastre IGN + DVF Etalab + Géorisques (côté serveur, hors CORS navigateur).
 */
import { enrichirPointSniper, pointValide } from "../src/lib/proptech/sniper.js";

function queryOf(req) {
  if (req.query && typeof req.query === "object") return req.query;
  try {
    const url = new URL(req.url || "", "http://localhost");
    return Object.fromEntries(url.searchParams.entries());
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Méthode non autorisée." });
    return;
  }

  const q = queryOf(req);
  const lat = Number(q.lat);
  const lng = Number(q.lng);
  if (!pointValide(lat, lng)) {
    res.status(400).json({ error: "Coordonnées invalides (France métropolitaine)." });
    return;
  }

  try {
    const payload = await enrichirPointSniper(lat, lng, { voie: q.voie || "" });
    res.status(200).json(payload);
  } catch (err) {
    res.status(502).json({ error: err?.message || "Enrichissement carto indisponible." });
  }
}
