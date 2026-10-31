/**
 * Génère data/sauvegardes/proptech-projet-manuel-brunel-emrick-YYYY-MM-DD.json
 * à partir du scénario terrain Feurs (métrés + catalogue 2026).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { snapshotBrunelTerrain } from "../src/lib/crm/brunelScenarioTerrain.js";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const dossier = join(racine, "data", "sauvegardes");
const dateIso = "2026-09-16T09:00:00.000Z";
const jour = dateIso.slice(0, 10);
const snapshot = snapshotBrunelTerrain({ role: "commercial", date: dateIso });
const fichier = join(dossier, `proptech-${snapshot.dossierId}-${jour}.json`);

mkdirSync(dossier, { recursive: true });
writeFileSync(fichier, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Écrit ${fichier}`);
console.log(
  JSON.stringify(
    {
      ttc: snapshot.tunnel?.totaux?.totalTtc,
      mpr: snapshot.tunnel?.aides?.mpr,
      cee: snapshot.tunnel?.aides?.cee,
      totalAides: snapshot.tunnel?.aides?.totalAides,
      rac: snapshot.tunnel?.resteACharge,
      ecoPtz: snapshot.tunnel?.ecoPtzAuto,
      dpe: snapshot.edition?.valorisation,
    },
    null,
    2,
  ),
);
