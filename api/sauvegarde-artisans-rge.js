/**
 * POST /api/sauvegarde-artisans-rge
 * Persiste le référentiel artisans RGE dans data/artisans-rge-referentiel.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ROLE_ADMIN } from "../src/lib/crm/roles.js";
import { normaliserReferentielPourSauvegarde } from "../src/lib/crm/artisansRge.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function bodyOf(req) {
  if (req.body && typeof req.body === "object") return req.body;
  return {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée." });
    return;
  }

  const brut = bodyOf(req);
  const role = String(brut.role || "commercial");
  const referentiel = normaliserReferentielPourSauvegarde(brut.referentiel, role);

  if (!Array.isArray(referentiel.artisans) || referentiel.artisans.length === 0) {
    res.status(400).json({ error: "Référentiel artisans vide." });
    return;
  }

  if (role !== ROLE_ADMIN) {
    res.status(403).json({ error: "Seule l’administration peut écrire le référentiel RGE." });
    return;
  }

  const json = `${JSON.stringify(referentiel, null, 2)}\n`;
  const cibles = [
    join(ROOT, "data", "artisans-rge-referentiel.json"),
    join(ROOT, "public", "data", "artisans-rge-referentiel.json"),
  ];

  try {
    mkdirSync(join(ROOT, "data"), { recursive: true });
    mkdirSync(join(ROOT, "public", "data"), { recursive: true });
    for (const chemin of cibles) {
      writeFileSync(chemin, json, "utf8");
    }
    res.status(200).json({
      ok: true,
      stockeFichier: true,
      fichier: "data/artisans-rge-referentiel.json",
      artisans: referentiel.artisans.length,
    });
  } catch (err) {
    res.status(200).json({
      ok: true,
      stockeFichier: false,
      raison: err?.message || "Disque en lecture seule.",
      artisans: referentiel.artisans.length,
    });
  }
}
