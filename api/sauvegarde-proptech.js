/**
 * POST /api/sauvegarde-proptech
 * Écrit un JSON daté dans data/sauvegardes/ (environnement local / disque inscriptible).
 * Re-sanitise hors administrateur : jamais de marges ni coûts d’achat.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ROLE_ADMIN } from "../src/lib/crm/roles.js";
import { snapshotProptech } from "../src/lib/crm/sauvegardeProptech.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOSSIER = join(ROOT, "data", "sauvegardes");

function slug(value) {
  return String(value || "dossier")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "dossier";
}

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
  const snapshot = snapshotProptech({
    dossierId: brut.dossierId,
    edition: brut.edition,
    role,
    sniper: brut.sniper,
    tunnel: brut.tunnel,
  });

  if (!snapshot.dossierId) {
    res.status(400).json({ error: "dossierId manquant." });
    return;
  }

  if (role !== ROLE_ADMIN && snapshot.edition?.finances) {
    snapshot.edition.finances = {
      coutMaterielHt: null,
      coutPoseRgeHt: null,
      tauxCommission: null,
    };
  }

  const jour = new Date().toISOString().slice(0, 10);
  const fichier = `proptech-${slug(snapshot.dossierId)}-${jour}.json`;
  const chemin = join(DOSSIER, fichier);

  try {
    mkdirSync(DOSSIER, { recursive: true });
    writeFileSync(chemin, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    res.status(200).json({
      ok: true,
      stockeFichier: true,
      fichier: `data/sauvegardes/${fichier}`,
      financesInternesIncluses: snapshot.controles.financesInternesIncluses,
    });
  } catch (err) {
    res.status(200).json({
      ok: true,
      stockeFichier: false,
      raison: err?.message || "Disque en lecture seule (hébergement).",
      financesInternesIncluses: snapshot.controles.financesInternesIncluses,
    });
  }
}
