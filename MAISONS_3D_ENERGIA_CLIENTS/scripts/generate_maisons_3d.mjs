#!/usr/bin/env node
/**
 * Génération de 6 maisons 3D pour ENERGIA-CONSEIL IA®
 * Format OBJ + MTL compatible Twinmotion 2025.2
 */

import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = join(__dirname, "..");

const MAISONS = [
  { id: "richard", nom: "M_RICHARD_UNIAS", adresse: "600 Route de la Goutte, 42210 UNIAS", gps: "45.5986°N, 4.2267°E", longueur: 9, largeur: 8, hauteur_etage: 2.7, niveaux: 2, pente_toit: 38, toit: "2_pans", materiaux: "Pierre et moellons" },
  { id: "fontanay", nom: "MME_FONTANAY_MONTROND", adresse: "167 Rue des Acacias, 42210 MONTROND-LES-BAINS", gps: "45.6408°N, 4.2480°E", longueur: 9.5, largeur: 8, hauteur_etage: 2.7, niveaux: 2, pente_toit: 40, toit: "2_pans", materiaux: "Enduit / maçonnerie traditionnelle" },
  { id: "royer", nom: "M_ROYER_CHALAIN", adresse: "6 route de Marcilly, 42600 CHALAIN-D'UZORE", gps: "45.6743°N, 4.0689°E", longueur: 9.5, largeur: 8, hauteur_etage: 2.7, niveaux: 2, pente_toit: 42, toit: "2_pans", materiaux: "Pierre et moellons 40cm" },
  { id: "seux", nom: "M_SEUX_RICAMARIE", adresse: "4 Rue Georges Laurent, 42150 LA RICAMARIE", gps: "45.4018°N, 4.3592°E", longueur: 10, largeur: 9.6, hauteur_etage: 2.7, niveaux: 2, pente_toit: 35, toit: "2_pans", materiaux: "Blocs béton creux" },
  { id: "guion", nom: "M_GUION", adresse: "(Adresse à compléter - bien en acquisition)", gps: "Non défini", longueur: 10, largeur: 10, hauteur_etage: 2.7, niveaux: 2, pente_toit: 38, toit: "2_pans", materiaux: "À déterminer (ITE fibre bois/ouate prévu)" },
  { id: "yang", nom: "M_YANG_COLLONGES", adresse: "18 Parc des Chavannes, 69660 COLLONGES-AU-MONT-D'OR", gps: "45.8259°N, 4.8431°E", longueur: 13, largeur: 12, hauteur_etage: 2.7, niveaux: 2, pente_toit: 38, toit: "2_pans", garage: true, garage_largeur: 3.5, garage_profondeur: 6, materiaux: "Pierre calcaire / enduit" },
];

function generateHouseObj(m) {
  const L = m.longueur / 2;
  const W = m.largeur / 2;
  const H = m.hauteur_etage * m.niveaux;
  const penteRad = (m.pente_toit * Math.PI) / 180;
  const hauteurFaite = W * Math.tan(penteRad);
  const cz = H + hauteurFaite;

  const vertices = [];
  const normals = [];
  const faces = [];
  let idx = 1;

  function quad(v0, v1, v2, v3, n) {
    vertices.push(v0, v1, v2, v3);
    normals.push(n, n, n, n);
    faces.push([idx, idx + 1, idx + 2], [idx, idx + 2, idx + 3]);
    idx += 4;
  }
  function tri(v0, v1, v2, n) {
    vertices.push(v0, v1, v2);
    normals.push(n, n, n);
    faces.push([idx, idx + 1, idx + 2]);
    idx += 3;
  }

  quad([-L, -W, 0], [L, -W, 0], [L, W, 0], [-L, W, 0], [0, 0, -1]);
  quad([-L, -W, 0], [L, -W, 0], [L, -W, H], [-L, -W, H], [0, -1, 0]);
  quad([L, W, 0], [-L, W, 0], [-L, W, H], [L, W, H], [0, 1, 0]);
  quad([-L, W, 0], [-L, -W, 0], [-L, -W, H], [-L, W, H], [-1, 0, 0]);
  quad([L, -W, 0], [L, W, 0], [L, W, H], [L, -W, H], [1, 0, 0]);

  const e1 = [2 * L, 0, 0];
  const e2 = [0, W, cz - H];
  let nx = e1[1] * e2[2] - e1[2] * e2[1];
  let ny = e1[2] * e2[0] - e1[0] * e2[2];
  let nz = e1[0] * e2[1] - e1[1] * e2[0];
  const ln = Math.hypot(nx, ny, nz);
  quad([-L, -W, H], [L, -W, H], [L, 0, cz], [-L, 0, cz], [nx / ln, ny / ln, nz / ln]);

  nx = -e1[1] * e2[2] + e1[2] * e2[1];
  ny = -e1[2] * e2[0] + e1[0] * e2[2];
  nz = -e1[0] * e2[1] + e1[1] * e2[0];
  quad([L, W, H], [-L, W, H], [-L, 0, cz], [L, 0, cz], [nx / ln, ny / ln, nz / ln]);

  tri([-L, -W, H], [-L, 0, cz], [-L, W, H], [-1, 0, 0]);
  tri([L, -W, H], [L, W, H], [L, 0, cz], [1, 0, 0]);

  return { vertices, normals, faces };
}

function writeObj(vertices, normals, faces, path, mtlName) {
  let out = "# Maison 3D - ENERGIA-CONSEIL IA®\n# Format OBJ - Compatible Twinmotion\n# Unités: mètres\n\nmtllib " + mtlName + "\n\n";
  for (const v of vertices) out += `v ${v[0].toFixed(4)} ${v[1].toFixed(4)} ${v[2].toFixed(4)}\n`;
  out += "\n";
  for (const n of normals) out += `vn ${n[0].toFixed(4)} ${n[1].toFixed(4)} ${n[2].toFixed(4)}\n`;
  out += "\nusemtl murs\n";
  for (const f of faces) out += `f ${f[0]}//${f[0]} ${f[1]}//${f[1]} ${f[2]}//${f[2]}\n`;
  writeFileSync(path, out, "utf8");
}

function writeMtl(path, type) {
  const c = type.toLowerCase().includes("pierre") ? [0.75, 0.68, 0.58] : type.toLowerCase().includes("béton") || type.toLowerCase().includes("bloc") ? [0.72, 0.70, 0.68] : [0.92, 0.88, 0.82];
  const toit = [0.45, 0.35, 0.3];
  const txt = `# Matériaux de base - Twinmotion
# Remplacer par textures dans Twinmotion

newmtl murs
Kd ${c[0].toFixed(2)} ${c[1].toFixed(2)} ${c[2].toFixed(2)}
Ka 0.2 0.2 0.2
Ks 0.1 0.1 0.1
Ns 10

newmtl toit
Kd ${toit[0].toFixed(2)} ${toit[1].toFixed(2)} ${toit[2].toFixed(2)}
Ka 0.2 0.2 0.2
Ks 0.05 0.05 0.05
Ns 5

newmtl sol
Kd 0.5 0.5 0.5
Ka 0.2 0.2 0.2
`;
  writeFileSync(path, txt, "utf8");
}

function writeInfos(m, dir) {
  const garageTxt = m.garage ? `Garage intégré: ${m.garage_largeur}x${m.garage_profondeur} m` : "Non";
  const txt = `══════════════════════════════════════════════════════════
EXTRACTION DONNÉES - ${m.nom}
══════════════════════════════════════════════════════════

ADRESSE: ${m.adresse}
COORDONNÉES GPS: ${m.gps}

DIMENSIONS EXTRAITES:
- Longueur: ${m.longueur} m
- Largeur: ${m.largeur} m
- Hauteur (murs): ${(m.hauteur_etage * m.niveaux).toFixed(1)} m
- Niveaux: ${m.niveaux}
- Pente toit: ${m.pente_toit}°
- ${garageTxt}

MATÉRIAUX: ${m.materiaux}
TYPE TOIT: ${m.toit}

SOURCES:
- Google Earth / Street View (estimations)
- Nominatim OpenStreetMap (coordonnées)
- Géoportail (cadastre - à vérifier sur place)

OBSERVATIONS:
- Modèle 3D généré à partir des dimensions estimées
- Appliquer textures réalistes dans Twinmotion
- Ajuster ouvertures (fenêtres/portes) si besoin

DATE EXTRACTION: 2025-02-22
`;
  writeFileSync(join(dir, "infos_extraction.txt"), txt, "utf8");
}

for (const m of MAISONS) {
  const dir = join(BASE, m.nom);
  mkdirSync(dir, { recursive: true });
  const { vertices, normals, faces } = generateHouseObj(m);
  const objName = `maison_${m.id}.obj`;
  const mtlName = `maison_${m.id}.mtl`;
  writeObj(vertices, normals, faces, join(dir, objName), mtlName);
  writeMtl(join(dir, mtlName), m.materiaux);
  writeInfos(m, dir);
  console.log(`✓ ${m.nom}: ${objName}, ${mtlName}, infos_extraction.txt`);
}
console.log("\nGénération terminée.");
