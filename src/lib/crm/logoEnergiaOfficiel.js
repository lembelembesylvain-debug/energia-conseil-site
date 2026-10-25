/**
 * Logo officiel ENERGIA CONSEIL IA® — SVG inline (maison, toiture verte, ampoule / cerveau IA).
 * Aucune dépendance fichier externe pour l’affichage contrat / impression.
 */

export const LOGO_ENERGIA_CANDIDATS = [
  "./logo.png",
  "/logo.png",
  "./logo-energia.png",
  "/logo-energia.png",
  "/logo.svg",
  "/assets/LOGO.png",
  "/assets/energia-logo-arbres.png",
  "/assets/partners/_shared/energia-logo-arbres.png",
];

/**
 * Logo vectoriel officiel : maison + toiture verte + ampoule / cerveau IA.
 * Hauteur institutionnelle 60px (responsive, sans rognage).
 */
export function svgLogoEnergiaMaisonIa({ width = 156, height = 55, id = "logo-energia-maison" } = {}) {
  return `<svg id="${id}" class="logo logo-energia-officiel" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 148" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="ENERGIA CONSEIL IA® — Marque déposée INPI n° 5213845" style="height:${height}px;width:auto;max-height:${height}px;display:block;overflow:visible">
  <defs>
    <linearGradient id="${id}-toit" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="45%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#166534"/>
    </linearGradient>
    <linearGradient id="${id}-ampoule" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef9c3"/>
      <stop offset="55%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
    <linearGradient id="${id}-mur" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
  </defs>
  <!-- Maison -->
  <g transform="translate(8,18)">
    <path d="M16 58 L66 18 L116 58 Z" fill="url(#${id}-toit)" stroke="#14532d" stroke-width="2" stroke-linejoin="round"/>
    <path d="M26 58 L26 108 L106 108 L106 58 Z" fill="url(#${id}-mur)" stroke="#0B1F3A" stroke-width="2"/>
    <rect x="48" y="72" width="22" height="28" rx="1.5" fill="#0B1F3A"/>
    <rect x="78" y="68" width="18" height="18" rx="1.5" fill="#38bdf8" stroke="#0B1F3A" stroke-width="1.2"/>
    <path d="M78 77 H96 M87 68 V86" stroke="#0B1F3A" stroke-width="1"/>
    <rect x="54" y="8" width="12" height="18" rx="1" fill="#64748b"/>
    <!-- Ampoule / cerveau IA au-dessus du toit -->
    <g transform="translate(92,0)">
      <ellipse cx="18" cy="22" rx="16" ry="18" fill="url(#${id}-ampoule)" stroke="#ca8a04" stroke-width="1.4"/>
      <path d="M10 36 Q18 42 26 36" fill="none" stroke="#a16207" stroke-width="1.5"/>
      <rect x="13" y="38" width="10" height="6" rx="1" fill="#94a3b8" stroke="#475569" stroke-width="0.8"/>
      <path d="M12 18 Q18 10 24 18 Q20 22 18 28 Q16 22 12 18" fill="none" stroke="#0B1F3A" stroke-width="1.3" stroke-linecap="round"/>
      <circle cx="14" cy="17" r="1.3" fill="#059669"/>
      <circle cx="22" cy="17" r="1.3" fill="#059669"/>
      <circle cx="18" cy="24" r="1.4" fill="#D97706"/>
      <path d="M14 17 L18 24 L22 17" fill="none" stroke="#0B1F3A" stroke-width="0.9"/>
      <path d="M4 14 L-2 8 M32 14 L38 8 M18 2 L18 -4" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round"/>
    </g>
  </g>
  <!-- Typo marque -->
  <text x="148" y="58" fill="#0B1F3A" font-family="Segoe UI, system-ui, sans-serif" font-size="22" font-weight="800" letter-spacing="0.4">ENERGIA CONSEIL IA®</text>
  <text x="148" y="84" fill="#059669" font-family="Segoe UI, system-ui, sans-serif" font-size="12" font-weight="600">Bureau d'études &amp; Contractant Général</text>
  <text x="148" y="108" fill="#64748b" font-family="Segoe UI, system-ui, sans-serif" font-size="11">Marque déposée INPI n° 5213845</text>
</svg>`;
}

/** Alias historique — pointe désormais vers le logo maison / ampoule IA (plus de badge ovale). */
export function svgBlasonEnergia(opts = {}) {
  return svgLogoEnergiaMaisonIa(opts);
}

/**
 * Logo contrat : SVG officiel inline (maison / toiture verte / ampoule IA), sans fichier externe.
 * @param {{ src?: string, className?: string, width?: number, height?: number, fallbackId?: string }} opts
 */
export function htmlLogoEnergiaAvecFallback(opts = {}) {
  const height = opts.height || 55;
  const width = opts.width || Math.round((height * 420) / 148);
  const fallbackId = opts.fallbackId || "logo-fallback-energia";
  return `<span class="logo-wrap" style="display:inline-block;line-height:0;height:${height}px;max-height:${height}px;overflow:visible;vertical-align:top">
  <span id="${fallbackId}" class="logo-fallback-slot" style="display:block">${svgLogoEnergiaMaisonIa({
    width,
    height,
    id: `${fallbackId}-svg`,
  })}</span>
</span>`;
}
