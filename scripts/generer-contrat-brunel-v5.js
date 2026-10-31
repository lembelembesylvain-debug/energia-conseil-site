/**
 * Génère les HTML Brunel V5 (Performance / Autonomie) avec images embarquées.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { htmlContratPourDossier } from "../src/lib/crm/htmlContratCrm.js";
import { BRUNEL_DOSSIER_ID } from "../src/lib/crm/brunelWorkingBase.js";
import { OFFRE_AUTONOMIE, OFFRE_PERFORMANCE } from "../src/lib/crm/brunelOffresV5.js";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

const IMAGES = [
  "/projects/brunel/renovation-architecturale-contemporaine-anthracite.jpg",
  "/projects/brunel/facade-sud-panneaux-solaires-gris-anthracite.jpg",
  "/projects/brunel/unite-exterieure-daikin-sur-mur-de-pierre-anthracite.jpg",
  "/images/brunel/facade-brunel.jpg",
];

function embarquer(html) {
  let out = html;
  for (const src of IMAGES) {
    const file = join(racine, "public", src.replace(/^\//, ""));
    if (!existsSync(file)) continue;
    const data = `data:image/jpeg;base64,${readFileSync(file).toString("base64")}`;
    out = out.split(`src="${src}"`).join(`src="${data}"`);
  }
  return out;
}

function ecrire(offre, nom) {
  const html = embarquer(htmlContratPourDossier({ offreActive: offre }, { id: BRUNEL_DOSSIER_ID }));
  const cible = join(racine, "public", nom);
  writeFileSync(cible, html, "utf8");
  const images = (html.match(/src="data:image/g) || []).length;
  console.log(`${nom} — images embarquées: ${images} — TTC ${html.includes("55 127,99") ? "55 127,99" : html.includes("37 127,99") ? "37 127,99" : "?"}`);
}

ecrire(OFFRE_AUTONOMIE, "DEVIS_BRUNEL_Indivision_COUBLE_2026_AUTONOMIE.html");
ecrire(OFFRE_PERFORMANCE, "DEVIS_BRUNEL_Indivision_COUBLE_2026_PERFORMANCE.html");
