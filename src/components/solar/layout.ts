import type { Cellule, Obstacle, OrientationPanneau, Panneau, SegmentProjet, Toiture, TypeCouverture } from "./types";

/** DTU 43.1 : marge de sécurité en rive, faîtage et égout. */
export const MARGE_DTU_M = 0.3;
/** Jeu de pince entre modules. */
export const ECART_PINCE_M = 0.02;

export function borne(valeur: number, min: number, max: number): number {
  if (!Number.isFinite(valeur)) return min;
  return Math.min(max, Math.max(min, valeur));
}

export function arrondi(valeur: number, digits = 3): number {
  const facteur = 10 ** digits;
  return Math.round(valeur * facteur) / facteur;
}

export function toitureDepuis(
  largeurM: number,
  rampantM: number,
  inclinaisonDeg: number,
  azimutDeg: number,
  typeCouverture: TypeCouverture = "rampant",
  segment: SegmentProjet = "residentiel",
): Toiture {
  const grand = segment === "tertiaire";
  return {
    largeurM: borne(largeurM, 0.5, grand ? 220 : 80),
    rampantM: borne(rampantM, 0.5, grand ? 160 : 40),
    inclinaisonDeg: borne(inclinaisonDeg, 0, 90),
    azimutDeg: borne(azimutDeg, -180, 180),
    typeCouverture,
  };
}

/** Pas entre rangées : pinces en rampant, nervures en bac acier, ombre d'hiver en terrasse et ombrière. */
export function pasRangeeM(hauteurM: number, type: TypeCouverture, inclinaisonDeg: number): number {
  if (type === "bac-acier") return hauteurM + 0.08;
  if (type === "terrasse" || type === "ombriere") {
    const beta = (borne(inclinaisonDeg, 0, 60) * Math.PI) / 180;
    const soleilHiver = (20 * Math.PI) / 180;
    const pasOmbre = hauteurM * (Math.cos(beta) + Math.sin(beta) / Math.tan(soleilHiver));
    const plancher = type === "ombriere" ? hauteurM + 0.4 : hauteurM + 0.15;
    return Math.max(plancher, pasOmbre);
  }
  return hauteurM + ECART_PINCE_M;
}

/** Empreinte au sol du rampant : x = largeur d'égout, y = longueur de rampant. */
export function empreinteModule(orientation: OrientationPanneau, panneau: Panneau): { largeurM: number; hauteurM: number } {
  const longueur = Math.max(0.4, panneau.longueurM);
  const largeur = Math.max(0.4, panneau.largeurM);
  if (orientation === "portrait") return { largeurM: largeur, hauteurM: longueur };
  return { largeurM: longueur, hauteurM: largeur };
}

type Rect = { x: number; y: number; w: number; h: number };

function chevauche(a: Rect, b: Rect): boolean {
  const eps = 0.001;
  return a.x < b.x + b.w - eps && a.x + a.w > b.x + eps && a.y < b.y + b.h - eps && a.y + a.h > b.y + eps;
}

export function genererCalpinage(
  toiture: Toiture,
  orientation: OrientationPanneau,
  panneau: Panneau,
  obstacles: Obstacle[],
  desactives: readonly string[],
  options?: { modulesMax?: number },
): Cellule[] {
  const utileL = toiture.largeurM - 2 * MARGE_DTU_M;
  const utileH = toiture.rampantM - 2 * MARGE_DTU_M;
  const { largeurM, hauteurM } = empreinteModule(orientation, panneau);
  if (utileL < largeurM || utileH < hauteurM) return [];

  const pasX = largeurM + ECART_PINCE_M;
  const pasY = pasRangeeM(hauteurM, toiture.typeCouverture, toiture.inclinaisonDeg);
  const cols = Math.floor((utileL + ECART_PINCE_M) / pasX);
  const rows = Math.floor((utileH - hauteurM) / pasY + 1e-9) + 1;
  if (cols < 1 || rows < 1) return [];

  const grilleL = cols * largeurM + (cols - 1) * ECART_PINCE_M;
  const grilleH = (rows - 1) * pasY + hauteurM;
  const origineX = MARGE_DTU_M + (utileL - grilleL) / 2;
  const origineY = MARGE_DTU_M + (utileH - grilleH) / 2;
  const exclus = new Set(desactives);
  const plafond = options?.modulesMax && options.modulesMax > 0 ? Math.round(options.modulesMax) : Infinity;
  const cellules: Cellule[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (cellules.length >= plafond) return cellules;
      const x = arrondi(origineX + col * pasX, 4);
      const y = arrondi(origineY + row * pasY, 4);
      const bloque = obstacles.some((obstacle) =>
        chevauche(
          { x, y, w: largeurM, h: hauteurM },
          { x: obstacle.x, y: obstacle.y, w: obstacle.largeurM, h: obstacle.hauteurM },
        ),
      );
      if (bloque) continue;
      const id = `c${col}-r${row}`;
      cellules.push({ id, col, row, x, y, actif: !exclus.has(id) });
    }
  }
  return cellules;
}

/** Toiture minimale pour viser un palier kWc, dernière rangée partielle comprise. */
export function dimensionnerPalier(
  kwc: number,
  panneau: Panneau,
  orientation: OrientationPanneau,
  type: TypeCouverture,
  inclinaisonDeg: number,
): { largeurM: number; rampantM: number; modules: number } {
  const modules = Math.max(1, Math.round((kwc * 1000) / Math.max(1, panneau.wc)));
  const { largeurM, hauteurM } = empreinteModule(orientation, panneau);
  const pasX = largeurM + ECART_PINCE_M;
  const pasY = pasRangeeM(hauteurM, type, inclinaisonDeg);
  const maxCols = Math.max(1, Math.floor((220 - 2 * MARGE_DTU_M + ECART_PINCE_M) / pasX));
  const maxRows = Math.max(1, Math.floor((160 - 2 * MARGE_DTU_M - hauteurM) / pasY + 1e-9) + 1);
  const cible = Math.sqrt((modules * pasY) / pasX) * 1.55;
  let cols = Math.min(maxCols, Math.max(2, Math.round(cible)));
  cols = Math.min(maxCols, Math.max(cols, Math.ceil(modules / maxRows)));
  const rows = Math.min(maxRows, Math.ceil(modules / cols));
  cols = Math.min(maxCols, Math.max(cols, Math.ceil(modules / rows)));
  const utileL = cols * largeurM + Math.max(0, cols - 1) * ECART_PINCE_M + 0.6;
  const utileH = Math.max(0, rows - 1) * pasY + hauteurM + 0.6;
  return {
    largeurM: arrondi(Math.min(220, utileL + 2 * MARGE_DTU_M), 2),
    rampantM: arrondi(Math.min(160, utileH + 2 * MARGE_DTU_M), 2),
    modules,
  };
}

export function deplacerObstacle(obstacle: Obstacle, x: number, y: number, toiture: Toiture): Obstacle {
  return {
    ...obstacle,
    x: arrondi(borne(x, 0, Math.max(0, toiture.largeurM - obstacle.largeurM))),
    y: arrondi(borne(y, 0, Math.max(0, toiture.rampantM - obstacle.hauteurM))),
  };
}

export function libelleAzimut(azimutDeg: number): string {
  const azimut = borne(azimutDeg, -180, 180);
  const abs = Math.abs(azimut);
  if (abs <= 12) return "Sud";
  if (abs >= 168) return "Nord";
  if (azimut < 0 && abs >= 78 && abs <= 102) return "Est";
  if (azimut > 0 && abs >= 78 && abs <= 102) return "Ouest";
  if (azimut < 0 && abs < 90) return "Sud-Est";
  if (azimut > 0 && abs < 90) return "Sud-Ouest";
  if (azimut < 0) return "Nord-Est";
  return "Nord-Ouest";
}
