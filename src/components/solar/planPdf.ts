import { empreinteModule, libelleAzimut, MARGE_DTU_M } from "./layout";
import type { EtudeTechnique, TypeCouverture } from "./types";

function fondCouverture(type: TypeCouverture): string {
  if (type === "terrasse") return "#1e293b";
  if (type === "bac-acier") return "#0b1220";
  if (type === "ombriere") return "#020617";
  return "#020617";
}

function metres(valeur: number): string {
  const arrondi = Math.round(valeur * 10) / 10;
  if (Math.abs(arrondi - Math.round(arrondi)) < 0.05) return `${Math.round(arrondi)} m`;
  return `${arrondi.toFixed(1).replace(".", ",")} m`;
}

/** Plan coté du calepinage, égout en bas. Null hors navigateur. */
export function capturerPlanToiture(etude: EtudeTechnique): { png: string; ratio: number } | null {
  if (typeof document === "undefined") return null;
  const { largeurM, rampantM, typeCouverture, inclinaisonDeg, azimutDeg } = etude.toiture;
  if (!(largeurM > 0) || !(rampantM > 0)) return null;

  const empreinte = empreinteModule(etude.orientation, etude.panneau);
  const ratioToit = largeurM / rampantM;
  const drawHCible = 760;
  let drawW = Math.round(drawHCible * ratioToit);
  let drawH = drawHCible;
  const maxDrawW = 1680;
  if (drawW > maxDrawW) {
    drawW = maxDrawW;
    drawH = Math.max(280, Math.round(maxDrawW / ratioToit));
  }
  if (drawW < 420) {
    drawW = 420;
    drawH = Math.max(280, Math.round(420 / ratioToit));
  }

  const padL = 78;
  const padR = 28;
  const padT = 52;
  const padB = 78;
  const canvas = document.createElement("canvas");
  canvas.width = drawW + padL + padR;
  canvas.height = drawH + padT + padB;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const sx = drawW / largeurM;
  const sy = drawH / rampantM;
  const ox = padL;
  const oy = padT;
  const yPx = (yMetre: number, hauteur: number) => oy + (rampantM - yMetre - hauteur) * sy;

  ctx.fillStyle = "#e8eef4";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 20px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("PLAN DE CALEPINAGE", 18, 30);
  ctx.fillStyle = "#64748b";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("orientation", canvas.width - 18, 18);
  ctx.fillStyle = "#0f172a";
  ctx.font = "700 16px sans-serif";
  ctx.fillText(libelleAzimut(azimutDeg), canvas.width - 18, 36);

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(ox + 5, oy + 6, drawW, drawH);
  ctx.fillStyle = fondCouverture(typeCouverture);
  ctx.fillRect(ox, oy, drawW, drawH);

  if (typeCouverture === "bac-acier") {
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = Math.max(1, sx * 0.035);
    for (let x = 1.2; x < largeurM; x += 1.2) {
      ctx.beginPath();
      ctx.moveTo(ox + x * sx, oy);
      ctx.lineTo(ox + x * sx, oy + drawH);
      ctx.stroke();
    }
  }
  if (typeCouverture === "terrasse") {
    ctx.strokeStyle = "#64748b";
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ox + 8, oy + 8, drawW - 16, drawH - 16);
    ctx.setLineDash([]);
  }
  if (typeCouverture === "ombriere") {
    ctx.strokeStyle = "#475569";
    ctx.setLineDash([6, 5]);
    ctx.lineWidth = Math.max(1, sx * 0.025);
    for (let x = 2.5; x < largeurM; x += 2.5) {
      ctx.beginPath();
      ctx.moveTo(ox + x * sx, oy);
      ctx.lineTo(ox + x * sx, oy + drawH);
      ctx.stroke();
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(ox + x * sx - 3, oy + drawH * 0.46, 6, 14);
    }
    ctx.setLineDash([]);
  }

  const pas = Math.max(largeurM, rampantM) > 40 ? 5 : 1;
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;
  for (let x = pas; x < largeurM; x += pas) {
    ctx.beginPath();
    ctx.moveTo(ox + x * sx, oy);
    ctx.lineTo(ox + x * sx, oy + drawH);
    ctx.stroke();
  }
  for (let y = pas; y < rampantM; y += pas) {
    const py = oy + (rampantM - y) * sy;
    ctx.beginPath();
    ctx.moveTo(ox, py);
    ctx.lineTo(ox + drawW, py);
    ctx.stroke();
  }

  const margeX = Math.min(MARGE_DTU_M, largeurM / 2) * sx;
  const margeY = Math.min(MARGE_DTU_M, rampantM / 2) * sy;
  ctx.fillStyle = "rgba(245, 158, 11, 0.28)";
  ctx.fillRect(ox, oy, drawW, margeY);
  ctx.fillRect(ox, oy + drawH - margeY, drawW, margeY);
  ctx.fillRect(ox, oy, margeX, drawH);
  ctx.fillRect(ox + drawW - margeX, oy, margeX, drawH);

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.strokeRect(ox + 0.5, oy + 0.5, drawW - 1, drawH - 1);

  const lw = Math.max(0.7, Math.min(sx, sy) * 0.018);
  for (const cellule of etude.cellules) {
    const x = ox + cellule.x * sx;
    const y = yPx(cellule.y, empreinte.hauteurM);
    const w = empreinte.largeurM * sx;
    const h = empreinte.hauteurM * sy;
    const gutter = Math.max(1.6, Math.min(w, h) * 0.16);
    ctx.fillStyle = cellule.actif ? "#059669" : "#1e293b";
    ctx.fillRect(x + gutter, y + gutter, Math.max(0.8, w - gutter * 2), Math.max(0.8, h - gutter * 2));
    if (cellule.actif && w > 16 && h > 18) {
      ctx.strokeStyle = "rgba(167, 243, 208, 0.75)";
      ctx.lineWidth = Math.max(0.6, w * 0.03);
      ctx.beginPath();
      ctx.moveTo(x + w * 0.36, y + gutter + 1);
      ctx.lineTo(x + w * 0.36, y + h - gutter - 1);
      ctx.moveTo(x + w * 0.64, y + gutter + 1);
      ctx.lineTo(x + w * 0.64, y + h - gutter - 1);
      ctx.stroke();
    }
    ctx.strokeStyle = cellule.actif ? "#022c22" : "#475569";
    ctx.lineWidth = Math.max(lw, 0.8);
    ctx.strokeRect(x + gutter, y + gutter, Math.max(0.8, w - gutter * 2), Math.max(0.8, h - gutter * 2));
  }

  for (const obstacle of etude.obstacles) {
    const x = ox + obstacle.x * sx;
    const y = yPx(obstacle.y, obstacle.hauteurM);
    const w = obstacle.largeurM * sx;
    const h = obstacle.hauteurM * sy;
    ctx.fillStyle = obstacle.type === "velux" ? "#38bdf8" : obstacle.type === "cheminee" ? "#fb923c" : "#94a3b8";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    if (w > 28 && h > 16) {
      const libelle = obstacle.type === "velux" ? "Velux" : obstacle.type === "cheminee" ? "Cheminée" : "Vent.";
      ctx.fillStyle = "#0f172a";
      ctx.font = "700 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(libelle, x + w / 2, y + h / 2);
    }
  }

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#64748b";
  ctx.font = "700 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("FAÎTAGE", ox + drawW / 2, oy - 8);
  ctx.fillText("ÉGOUT", ox + drawW / 2, oy + drawH + 16);

  const yCote = oy + drawH + 40;
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ox, oy + drawH);
  ctx.lineTo(ox, yCote + 5);
  ctx.moveTo(ox + drawW, oy + drawH);
  ctx.lineTo(ox + drawW, yCote + 5);
  ctx.stroke();
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(ox, yCote);
  ctx.lineTo(ox + drawW, yCote);
  ctx.moveTo(ox, yCote - 4);
  ctx.lineTo(ox, yCote + 4);
  ctx.moveTo(ox + drawW, yCote - 4);
  ctx.lineTo(ox + drawW, yCote + 4);
  ctx.stroke();
  ctx.fillStyle = "#0f172a";
  ctx.font = "600 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(metres(largeurM), ox + drawW / 2, yCote - 6);

  const xCote = ox - 36;
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(xCote - 6, oy);
  ctx.moveTo(ox, oy + drawH);
  ctx.lineTo(xCote - 6, oy + drawH);
  ctx.stroke();
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(xCote, oy);
  ctx.lineTo(xCote, oy + drawH);
  ctx.moveTo(xCote - 4, oy);
  ctx.lineTo(xCote + 4, oy);
  ctx.moveTo(xCote - 4, oy + drawH);
  ctx.lineTo(xCote + 4, oy + drawH);
  ctx.stroke();
  ctx.save();
  ctx.translate(xCote - 8, oy + drawH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#0f172a";
  ctx.font = "600 16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(metres(rampantM), 0, 0);
  ctx.restore();

  const pasEchelle = [1, 2, 5, 10, 20, 25, 50].find((pasMetre) => pasMetre * sx >= 90) ?? 50;
  const barre = Math.min(drawW * 0.45, pasEchelle * sx);
  const bx = ox;
  const by = canvas.height - 18;
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(bx, by, barre, 4);
  ctx.font = "12px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(metres(pasEchelle), bx + barre + 8, by + 5);
  ctx.textAlign = "right";
  ctx.fillStyle = "#334155";
  ctx.fillText(
    `${etude.modulesActifs.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ")} modules posés  ·  ${inclinaisonDeg}°`,
    canvas.width - 16,
    by + 5,
  );

  return { png: canvas.toDataURL("image/png"), ratio: canvas.width / canvas.height };
}
