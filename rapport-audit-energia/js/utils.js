/** Utilitaires rapport ENERGIA CONSEIL IA® */
export const PLACEHOLDER = "À confirmer / sous réserve de validation";
export const PAGES_TOTALES = 85;

export function val(v, fallback = PLACEHOLDER) {
  if (v === null || v === undefined || v === "") return fallback;
  return v;
}

export function money(v) {
  if (v === null || v === undefined || v === "" || Number.isNaN(Number(v))) {
    return PLACEHOLDER;
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v));
}

export function moneyOrDash(v) {
  if (v === null || v === undefined || v === "") return PLACEHOLDER;
  if (typeof v === "string" && /confirmer|démonstration|DEMO/i.test(v)) return v;
  return money(v);
}

export function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function list(items) {
  if (!items || !items.length) return `<p class="muted">${esc(PLACEHOLDER)}</p>`;
  return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

export function formatDateFR(isoOrFr) {
  if (!isoOrFr) return PLACEHOLDER;
  if (/^\d{4}-\d{2}-\d{2}/.test(isoOrFr)) {
    const [y, m, d] = isoOrFr.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
  }
  return isoOrFr;
}

export function pctBar(pct) {
  const n = Math.max(0, Math.min(100, Number(pct) || 0));
  return `<div class="chart-track"><div class="chart-fill" style="width:${n}%"></div></div>`;
}

export function pageShell(num, bodyHtml, { cover = false, demo = false } = {}) {
  const cls = cover ? "page cover" : "page";
  const header = cover
    ? ""
    : `<div class="page-header">
        <div class="logo-name">ENERGIA CONSEIL <span>IA®</span></div>
        <div>Rapport d'audit énergétique${demo ? ' · <span class="badge badge-demo">Données de démonstration</span>' : ""}</div>
      </div>`;
  const footer = cover
    ? ""
    : `<div class="page-footer">
        <div class="limova">Généré par Limova</div>
        <div>Page ${num} / ${PAGES_TOTALES}</div>
      </div>`;
  return `<section class="${cls}" data-page="${num}">
    ${header}
    <div class="page-body">${bodyHtml}</div>
    ${footer}
  </section>`;
}

export function getQueryParam(name, fallback = "") {
  const u = new URL(window.location.href);
  return u.searchParams.get(name) ?? fallback;
}

export async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Impossible de charger ${path} (${res.status})`);
  return res.json();
}
