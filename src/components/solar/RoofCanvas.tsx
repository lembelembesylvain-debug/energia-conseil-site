import { useRef } from "react";
import { ECART_PINCE_M, MARGE_DTU_M } from "./layout";
import type { Cellule, Obstacle, TypeCouverture } from "./types";

type Props = {
  largeurM: number;
  rampantM: number;
  cellules: Cellule[];
  empreinte: { largeurM: number; hauteurM: number };
  obstacles: Obstacle[];
  typeCouverture?: TypeCouverture;
  onToggle: (id: string) => void;
  onDeplacerObstacle: (id: string, x: number, y: number) => void;
};

type Glisser = { id: string; dx: number; dy: number };

function pointToit(svg: SVGSVGElement, clientX: number, clientY: number, rampant: number) {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const matrice = svg.getScreenCTM();
  if (!matrice) return { x: 0, y: 0 };
  const local = point.matrixTransform(matrice.inverse());
  return { x: local.x, y: rampant - local.y };
}

function ySvg(yDepuisEgout: number, hauteur: number, rampant: number) {
  return rampant - yDepuisEgout - hauteur;
}

export default function RoofCanvas({
  largeurM,
  rampantM,
  cellules,
  empreinte,
  obstacles,
  typeCouverture = "rampant",
  onToggle,
  onDeplacerObstacle,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const glisser = useRef<Glisser | null>(null);
  const trait = Math.max(largeurM, rampantM) / 220;
  const marge = Math.min(MARGE_DTU_M, largeurM / 2 - 0.01, rampantM / 2 - 0.01);
  const pasGrille = Math.max(largeurM, rampantM) > 40 ? 5 : 1;
  const fond = typeCouverture === "terrasse" ? "#1e293b" : typeCouverture === "bac-acier" ? "#0b1220" : "#020617";
  const beaucoup = cellules.length > 250;

  if (largeurM < 0.4 || rampantM < 0.4) {
    return <p className="text-sm text-slate-400">Indiquez une toiture d'au moins 0,4 m.</p>;
  }

  return (
    <div className="space-y-2">
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
        style={{ aspectRatio: `${largeurM} / ${rampantM}`, maxHeight: 520 }}
      >
        <svg
          ref={svgRef}
          data-testid="calpinage-toit"
          viewBox={`0 0 ${largeurM} ${rampantM}`}
          className="h-full w-full touch-none"
          role="img"
          aria-label="Plan de toiture, égout en bas, faîtage en haut"
          onPointerMove={(event) => {
            const courant = glisser.current;
            if (!courant) return;
            const point = pointToit(event.currentTarget, event.clientX, event.clientY, rampantM);
            onDeplacerObstacle(courant.id, point.x - courant.dx, point.y - courant.dy);
          }}
          onPointerUp={() => {
            glisser.current = null;
          }}
          onPointerCancel={() => {
            glisser.current = null;
          }}
        >
          <rect width={largeurM} height={rampantM} fill={fond} />
          {typeCouverture === "bac-acier"
            ? Array.from({ length: Math.floor(largeurM / 1.2) }, (_, index) => (
                <line
                  key={`nervure-${index}`}
                  x1={(index + 1) * 1.2}
                  y1={0}
                  x2={(index + 1) * 1.2}
                  y2={rampantM}
                  stroke="#334155"
                  strokeWidth={trait * 1.6}
                />
              ))
            : null}
          {typeCouverture === "terrasse" ? (
            <rect
              x={trait * 4}
              y={trait * 4}
              width={Math.max(0, largeurM - trait * 8)}
              height={Math.max(0, rampantM - trait * 8)}
              fill="none"
              stroke="#64748b"
              strokeDasharray={`${trait * 6} ${trait * 4}`}
              strokeWidth={trait}
            />
          ) : null}
          {typeCouverture === "ombriere"
            ? Array.from({ length: Math.floor(largeurM / 2.5) }, (_, index) => (
                <g key={`place-${index}`}>
                  <line
                    x1={(index + 1) * 2.5}
                    y1={0}
                    x2={(index + 1) * 2.5}
                    y2={rampantM}
                    stroke="#475569"
                    strokeDasharray={`${trait * 5} ${trait * 4}`}
                    strokeWidth={trait}
                  />
                  <rect x={(index + 1) * 2.5 - trait * 2} y={rampantM * 0.5} width={trait * 4} height={trait * 8} fill="#94a3b8" />
                </g>
              ))
            : null}
          {Array.from({ length: Math.floor(largeurM / pasGrille) }, (_, index) => (
            <line
              key={`vx-${index}`}
              x1={(index + 1) * pasGrille}
              y1={0}
              x2={(index + 1) * pasGrille}
              y2={rampantM}
              stroke="#1e293b"
              strokeWidth={trait}
            />
          ))}
          {Array.from({ length: Math.floor(rampantM / pasGrille) }, (_, index) => (
            <line
              key={`hy-${index}`}
              x1={0}
              y1={(index + 1) * pasGrille}
              x2={largeurM}
              y2={(index + 1) * pasGrille}
              stroke="#1e293b"
              strokeWidth={trait}
            />
          ))}
          {marge > 0 ? (
            <>
              <rect x={0} y={0} width={largeurM} height={marge} fill="#f59e0b" opacity={0.2} />
              <rect x={0} y={rampantM - marge} width={largeurM} height={marge} fill="#f59e0b" opacity={0.2} />
              <rect x={0} y={0} width={marge} height={rampantM} fill="#f59e0b" opacity={0.16} />
              <rect x={largeurM - marge} y={0} width={marge} height={rampantM} fill="#f59e0b" opacity={0.16} />
            </>
          ) : null}
          {cellules.map((cellule) => (
            <g key={cellule.id}>
              <rect
                x={cellule.x}
                y={ySvg(cellule.y, empreinte.hauteurM, rampantM)}
                width={empreinte.largeurM}
                height={empreinte.hauteurM}
                rx={trait * 1.4}
                fill={cellule.actif ? "#059669" : "#1e293b"}
                stroke={cellule.actif ? "#6ee7b7" : "#475569"}
                strokeWidth={trait}
                role="button"
                aria-pressed={cellule.actif}
                aria-label={cellule.actif ? "Retirer ce module" : "Reposer ce module"}
                className="cursor-pointer"
                onClick={() => onToggle(cellule.id)}
              />
              {cellule.actif || beaucoup ? null : (
                <line
                  x1={cellule.x + trait}
                  y1={ySvg(cellule.y, empreinte.hauteurM, rampantM) + empreinte.hauteurM - trait}
                  x2={cellule.x + empreinte.largeurM - trait}
                  y2={ySvg(cellule.y, empreinte.hauteurM, rampantM) + trait}
                  stroke="#94a3b8"
                  strokeWidth={trait}
                  pointerEvents="none"
                />
              )}
            </g>
          ))}
          {obstacles.map((obstacle) => {
            const couleur = obstacle.type === "velux" ? "#38bdf8" : obstacle.type === "cheminee" ? "#fb923c" : "#94a3b8";
            const libelle = obstacle.type === "velux" ? "Velux" : obstacle.type === "cheminee" ? "Cheminée" : "Vent.";
            return (
              <g key={obstacle.id}>
                <rect
                  x={obstacle.x}
                  y={ySvg(obstacle.y, obstacle.hauteurM, rampantM)}
                  width={obstacle.largeurM}
                  height={obstacle.hauteurM}
                  fill={couleur}
                  fillOpacity={0.85}
                  stroke="#0f172a"
                  strokeWidth={trait}
                  className="cursor-grab"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const svg = svgRef.current;
                    if (!svg) return;
                    const point = pointToit(svg, event.clientX, event.clientY, rampantM);
                    glisser.current = { id: obstacle.id, dx: point.x - obstacle.x, dy: point.y - obstacle.y };
                    svg.setPointerCapture(event.pointerId);
                  }}
                />
                <text
                  x={obstacle.x + obstacle.largeurM / 2}
                  y={ySvg(obstacle.y, obstacle.hauteurM, rampantM) + obstacle.hauteurM / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#0f172a"
                  fontSize={Math.min(obstacle.largeurM, obstacle.hauteurM) * 0.28}
                  pointerEvents="none"
                >
                  {libelle}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-xs text-slate-400">
        {typeCouverture === "ombriere"
          ? "Ombrière : places de parking tous les 2,50 m, poteaux au droit des files. "
          : typeCouverture === "bac-acier"
            ? "Bac acier : nervures et rangées écartées de 8 cm au-delà du module. "
            : typeCouverture === "terrasse"
              ? "Toiture terrasse : rangées écartées pour l'ombre d'hiver (soleil à 20°). "
              : "Haut = faîtage, bas = égout. "}
        Bande orange = marge DTU {Math.round(MARGE_DTU_M * 100)} cm. Jeu de pinces {Math.round(ECART_PINCE_M * 1000)} mm.
        Clic sur un module pour le retirer ou le reposer. Glisser un obstacle pour le déplacer.
      </p>
    </div>
  );
}
