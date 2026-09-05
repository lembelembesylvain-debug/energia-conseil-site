import type { SourcePrix } from "./types";
import { SOURCES_PRIX, UNITES_LABEL } from "./constantes";

/**
 * `toLocaleString("fr-FR")` insère U+202F (espace fine insécable).
 * Helvetica (jsPDF / WinAnsi) ne connaît pas ce glyphe et l’affiche comme `/`.
 * On le remplace par un espace insécable standard (U+00A0).
 */
export function espacesNombresFr(texte: string): string {
  return texte.replace(/[\u202f\u2007\u2008\u2009\u200a]/g, "\u00a0");
}

export function formatEuro(value: number | null | undefined, fallback = "—"): string {
  if (value == null || Number.isNaN(value)) return fallback;
  return espacesNombresFr(
    value.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );
}

export function formatPct(taux: number | null | undefined): string {
  if (taux == null || Number.isNaN(taux)) return "—";
  return espacesNombresFr(
    `${(taux * 100).toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })} %`,
  );
}

export function formatUnite(unite: string): string {
  return UNITES_LABEL[unite] ?? unite;
}

export function labelSource(source: SourcePrix): string {
  return SOURCES_PRIX.find((item) => item.value === source)?.label ?? source;
}

export function formatKm(value: number | null | undefined, fallback = "—"): string {
  if (value == null || Number.isNaN(value)) return fallback;
  return espacesNombresFr(
    `${value.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })} km`,
  );
}

export function parseNombre(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".").trim();
  if (cleaned === "") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}
