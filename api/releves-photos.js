/**
 * GET/POST /api/releves-photos
 * Stocke les photos de relevé terrain (disque local) et, si les clés sont présentes,
 * les recopie dans le bucket Supabase Storage "releves-photos".
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOSSIER = join(ROOT, "data", "releves-photos");
const INDEX = join(DOSSIER, "index.json");
const BUCKET = "releves-photos";
const ID_RE = /^[a-zA-Z0-9_-]{4,80}$/;
const SLOT_RE = /^[a-z0-9_-]{2,40}$/;

function json(res, code, payload) {
  res.status(code).json(payload);
}

function idValide(id) {
  return ID_RE.test(String(id || ""));
}

function slotValide(slot) {
  return SLOT_RE.test(String(slot || ""));
}

function lireIndex() {
  try {
    const brut = JSON.parse(readFileSync(INDEX, "utf8"));
    return Array.isArray(brut?.releves) ? brut.releves : [];
  } catch {
    return [];
  }
}

function ecrireIndex(releves) {
  mkdirSync(DOSSIER, { recursive: true });
  writeFileSync(INDEX, `${JSON.stringify({ releves }, null, 2)}\n`, "utf8");
}

function dossierReleve(id) {
  const chemin = resolve(DOSSIER, id);
  if (!chemin.startsWith(resolve(DOSSIER))) return null;
  return chemin;
}

function clientSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function octetsDepuisDataUrl(dataUrl) {
  const texte = String(dataUrl || "");
  if (!texte.startsWith("data:image/") || texte.length > 12_000_000) return null;
  const base64 = texte.split(",")[1] || "";
  return Buffer.from(base64, "base64");
}

async function pousserSupabase(id, slotId, buffer, manifeste) {
  const supabase = clientSupabase();
  if (!supabase) return null;
  let url = null;
  if (buffer && slotId) {
    const chemin = `${id}/${slotId}.jpg`;
    const { error } = await supabase.storage.from(BUCKET).upload(chemin, new Uint8Array(buffer), {
      upsert: true,
      contentType: "image/jpeg",
      cacheControl: "3600",
    });
    if (!error) {
      url = supabase.storage.from(BUCKET).getPublicUrl(chemin).data?.publicUrl || null;
    }
  }
  if (manifeste) {
    await supabase.storage.from(BUCKET).upload(`manifests/${id}.json`, Buffer.from(JSON.stringify(manifeste)), {
      upsert: true,
      contentType: "application/json",
      cacheControl: "30",
    });
  }
  return url;
}

function fichePublique(releve, origine) {
  const photos = (Array.isArray(releve.photos) ? releve.photos : []).map((photo) => ({
    id: photo.id,
    label: photo.label,
    groupe: photo.groupe || "bien",
    url: photo.url || `${origine}/api/releves-photos?id=${encodeURIComponent(releve.id)}&photo=${encodeURIComponent(photo.id)}`,
  }));
  return { ...releve, photos };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const id = String(req.query?.id || "");
    const photo = String(req.query?.photo || "");
    if (id && photo) {
      if (!idValide(id) || !slotValide(photo)) {
        json(res, 400, { error: "Identifiant de photo invalide." });
        return;
      }
      const fichier = join(dossierReleve(id) || "", `${photo}.jpg`);
      if (!existsSync(fichier)) {
        json(res, 404, { error: "Photo introuvable." });
        return;
      }
      const buffer = readFileSync(fichier);
      res.status(200);
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "private, max-age=3600");
      res.end(buffer);
      return;
    }

    const origine = "";
    json(res, 200, {
      ok: true,
      releves: lireIndex().map((releve) => fichePublique(releve, origine)),
    });
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "Méthode non autorisée." });
    return;
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};

  if (body.action === "photo") {
    const id = String(body.id || "");
    const slotId = String(body.slotId || "");
    if (!idValide(id) || !slotValide(slotId)) {
      json(res, 400, { error: "Identifiant de relevé invalide." });
      return;
    }
    const buffer = octetsDepuisDataUrl(body.dataUrl);
    if (!buffer || buffer.length < 32) {
      json(res, 400, { error: "Photo illisible." });
      return;
    }
    const dossier = dossierReleve(id);
    mkdirSync(dossier, { recursive: true });
    writeFileSync(join(dossier, `${slotId}.jpg`), buffer);
    let url = null;
    try {
      url = await pousserSupabase(id, slotId, buffer, null);
    } catch {
      url = null;
    }
    json(res, 200, {
      ok: true,
      src: `/api/releves-photos?id=${encodeURIComponent(id)}&photo=${encodeURIComponent(slotId)}`,
      url: url || `/api/releves-photos?id=${encodeURIComponent(id)}&photo=${encodeURIComponent(slotId)}`,
    });
    return;
  }

  if (body.action === "manifeste") {
    const releve = body.releve && typeof body.releve === "object" ? body.releve : null;
    if (!releve || !idValide(releve.id)) {
      json(res, 400, { error: "Manifeste incomplet." });
      return;
    }
    const photos = (Array.isArray(releve.photos) ? releve.photos : [])
      .filter((photo) => slotValide(photo?.id))
      .map((photo) => ({
        id: String(photo.id),
        label: String(photo.label || photo.id).slice(0, 80),
        groupe: photo.groupe === "documents" ? "documents" : "bien",
        url: typeof photo.url === "string" ? photo.url.slice(0, 500) : "",
      }));
    const fiche = {
      id: String(releve.id),
      nom: String(releve.nom || "").slice(0, 120),
      adresse: String(releve.adresse || "").slice(0, 240),
      ville: String(releve.ville || "").slice(0, 80),
      codePostal: String(releve.codePostal || "").slice(0, 8),
      telephone: String(releve.telephone || "").slice(0, 24),
      dateVisite: String(releve.dateVisite || "").slice(0, 10),
      surfaceHabitable: Number.isFinite(Number(releve.surfaceHabitable)) ? Number(releve.surfaceHabitable) : null,
      hauteurSousPlafond: Number.isFinite(Number(releve.hauteurSousPlafond)) ? Number(releve.hauteurSousPlafond) : null,
      surfaceCombles: Number.isFinite(Number(releve.surfaceCombles)) ? Number(releve.surfaceCombles) : null,
      objectifLabel: String(releve.objectifLabel || "").slice(0, 180),
      photos,
    };
    const releves = lireIndex().filter((item) => item.id !== fiche.id);
    releves.unshift(fiche);
    ecrireIndex(releves.slice(0, 40));
    try {
      await pousserSupabase(fiche.id, null, null, fiche);
    } catch {
      /* cloud optionnel */
    }
    json(res, 200, { ok: true, id: fiche.id });
    return;
  }

  json(res, 400, { error: "Action inconnue." });
}
