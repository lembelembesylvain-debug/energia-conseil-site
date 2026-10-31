/**
 * Génère les assets d’un partenaire duplicable :
 * QR unique, carte de visite, flyer A5 (avec / sans photo), export PDF optionnel.
 *
 * Usage :
 *   node scripts/generate_partner_assets.js demo-alexandre-morel
 *   node scripts/generate_partner_assets.js demo-alexandre-morel --pdf
 *
 * Ne lit jamais les fichiers Catarina. N’écrit jamais dans son dossier.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import {
  A_COMPLETER,
  aUnLogoReseau,
  aUnePhoto,
  assertNotCatarinaClone,
  champOuPlaceholder,
  displayNameOf,
  getPartnerById,
  PARTNER_DEMO,
  resolveQrTarget,
} from "../src/config/partners.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SHARED_DIR = resolve(ROOT, "public/assets/partners/_shared");
const CARTE_TPL = resolve(ROOT, "templates/marketing/partner/carte_visite_partenaire.html");
const FLYER_TPL = resolve(ROOT, "templates/marketing/partner/flyer_A5_partenaire.html");
const ENERGIA_LOGO_SRC = resolve(ROOT, "templates/marketing/assets/energia-logo-arbres.png");

function fill(template, vars) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => (key in vars ? vars[key] : `{{${key}}}`));
}

function websiteParts(partner) {
  const raw = champOuPlaceholder(partner.website);
  if (raw === A_COMPLETER) {
    return { href: "#", label: A_COMPLETER };
  }
  const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const label = raw.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  return { href, label };
}

function networkMark(partner, { light = false, publicBase } = {}) {
  if (aUnLogoReseau(partner)) {
    const src = partner.logoPartner.startsWith("/") || partner.logoPartner.startsWith("http")
      ? partner.logoPartner
      : `${publicBase}/${partner.logoPartner.replace(/^.*[\\/]/, "")}`;
    return `<img class="network-logo" src="${src}" alt="${champOuPlaceholder(partner.network)}" />`;
  }
  const colorStyle = light ? ' style="color:#fff"' : "";
  return `<p class="network-text"${colorStyle}>${champOuPlaceholder(partner.network)}</p>`;
}

function placeholderQrSvg(target) {
  const safe = String(target).replace(/[<>&"]/g, "");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="#fff"/>
  <rect x="8" y="8" width="184" height="184" fill="none" stroke="#0b1f3a" stroke-width="6"/>
  <text x="100" y="96" text-anchor="middle" font-family="Arial" font-size="11" fill="#0b1f3a">QR partenaire</text>
  <text x="100" y="116" text-anchor="middle" font-family="Arial" font-size="7" fill="#5b6b7c">${safe.slice(0, 42)}</text>
</svg>`;
}

async function downloadQrSvg(target, dest) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=svg&data=${encodeURIComponent(target)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const svg = await res.text();
    if (!svg.includes("<svg")) throw new Error("réponse QR invalide");
    writeFileSync(dest, svg);
    return true;
  } catch (error) {
    writeFileSync(dest, placeholderQrSvg(target));
    console.warn("QR distant indisponible, placeholder local :", error.message);
    return false;
  }
}

function findBrowser() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  return candidates.find((p) => existsSync(p)) || null;
}

function exportPdf(htmlPath, pdfPath) {
  const browser = findBrowser();
  if (!browser) {
    console.warn("PDF ignoré : Chrome / Edge introuvable.");
    return false;
  }
  const result = spawnSync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--font-render-hinting=none",
      "--virtual-time-budget=8000",
      `--print-to-pdf=${pdfPath}`,
      pathToFileURL(htmlPath).href,
    ],
    { stdio: "inherit" },
  );
  return result.status === 0;
}

function buildVars(partner, { photo, qrFile, logoFile, photoFile }) {
  const site = websiteParts(partner);
  return {
    DISPLAY_NAME: displayNameOf(partner),
    TITLE: champOuPlaceholder(partner.title),
    PHONE: champOuPlaceholder(partner.phone),
    EMAIL: champOuPlaceholder(partner.email),
    SECTOR: champOuPlaceholder(partner.sector),
    NETWORK: champOuPlaceholder(partner.network),
    LEGAL: champOuPlaceholder(partner.legalMention),
    WEBSITE_HREF: site.href,
    WEBSITE_LABEL: site.label,
    QR_TARGET: resolveQrTarget(partner),
    QR_SRC: qrFile,
    PHOTO_SRC: photoFile || qrFile,
    PHOTO_CLASS: photo ? "has-photo" : "no-photo",
    LOGO_TECHNICAL_SRC: logoFile,
    BRAND_COLOR: partner.brandColor || "#0b1f3a",
    NETWORK_MARK: networkMark(partner, { publicBase: "." }),
    NETWORK_MARK_LIGHT: networkMark(partner, { light: true, publicBase: "." }),
  };
}

async function generate(partnerId, { pdf = false } = {}) {
  const partner = getPartnerById(partnerId) || (partnerId === PARTNER_DEMO.id ? PARTNER_DEMO : null);
  if (!partner) {
    throw new Error(`Partenaire inconnu : ${partnerId}. Ajoutez-le dans src/config/partners.js après validation.`);
  }

  const clones = assertNotCatarinaClone(partner);
  if (clones.length) {
    throw new Error(`Refus : données Catarina détectées (${clones.join(", ")}). Utilisez uniquement les données validées du nouveau partenaire.`);
  }

  mkdirSync(SHARED_DIR, { recursive: true });
  const outDir = resolve(ROOT, "public/assets/partners", partner.id);
  mkdirSync(outDir, { recursive: true });
  if (existsSync(ENERGIA_LOGO_SRC)) {
    copyFileSync(ENERGIA_LOGO_SRC, resolve(SHARED_DIR, "energia-logo-arbres.png"));
    copyFileSync(ENERGIA_LOGO_SRC, resolve(outDir, "energia-logo-arbres.png"));
  }

  const qrTarget = resolveQrTarget(partner);
  const qrPath = resolve(outDir, "qr.svg");
  await downloadQrSvg(qrTarget, qrPath);

  let photoFile = "";
  if (aUnePhoto(partner)) {
    const photoName = partner.photo.replace(/^.*[\\/]/, "");
    const localPhoto = partner.photo.startsWith("public/")
      ? resolve(ROOT, partner.photo)
      : resolve(ROOT, partner.photo.replace(/^\//, ""));
    if (existsSync(localPhoto) && !localPhoto.toLowerCase().includes("catarina")) {
      copyFileSync(localPhoto, resolve(outDir, photoName));
      photoFile = photoName;
    } else if (partner.photo.startsWith("http") || partner.photo.startsWith("/")) {
      photoFile = partner.photo;
    }
  }
  if (aUnLogoReseau(partner) && !partner.logoPartner.startsWith("http") && !partner.logoPartner.startsWith("/assets/")) {
    const logoLocal = resolve(ROOT, partner.logoPartner.replace(/^\//, ""));
    if (existsSync(logoLocal) && !logoLocal.toLowerCase().includes("catarina")) {
      copyFileSync(logoLocal, resolve(outDir, logoLocal.split(/[\\/]/).pop()));
    }
  }

  const carteTpl = readFileSync(CARTE_TPL, "utf8");
  const flyerTpl = readFileSync(FLYER_TPL, "utf8");
  const logoFile = "energia-logo-arbres.png";
  const qrFile = "qr.svg";

  const withPhoto = Boolean(photoFile);
  const varsPhoto = buildVars(partner, { photo: true, qrFile, logoFile, photoFile });
  const varsSans = buildVars(partner, { photo: false, qrFile, logoFile, photoFile: "" });

  const carteSans = resolve(outDir, "carte_visite_sans_photo.html");
  const flyerSans = resolve(outDir, "flyer_A5_sans_photo.html");
  writeFileSync(carteSans, fill(carteTpl, varsSans));
  writeFileSync(flyerSans, fill(flyerTpl, varsSans));

  const carte = resolve(outDir, "carte_visite.html");
  const flyer = resolve(outDir, "flyer_A5.html");
  writeFileSync(carte, fill(carteTpl, withPhoto ? varsPhoto : varsSans));
  writeFileSync(flyer, fill(flyerTpl, withPhoto ? varsPhoto : varsSans));

  const manifest = {
    id: partner.id,
    crmPartnerId: partner.crmPartnerId,
    sourceLabel: partner.sourceLabel,
    qrTarget,
    hasPhoto: withPhoto,
    generatedAt: new Date().toISOString(),
    files: [
      "qr.svg",
      "carte_visite.html",
      "carte_visite_sans_photo.html",
      "flyer_A5.html",
      "flyer_A5_sans_photo.html",
    ],
  };

  if (pdf) {
    const pdfs = [
      [carteSans, resolve(outDir, "carte_visite_sans_photo.pdf")],
      [flyerSans, resolve(outDir, "flyer_A5_sans_photo.pdf")],
    ];
    if (withPhoto) {
      pdfs.unshift([carte, resolve(outDir, "carte_visite.pdf")], [flyer, resolve(outDir, "flyer_A5.pdf")]);
    }
    for (const [html, dest] of pdfs) {
      if (exportPdf(html, dest)) manifest.files.push(dest.split(/[\\/]/).pop());
    }
  }

  writeFileSync(resolve(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("Assets générés :", outDir);
  console.log("QR cible :", qrTarget);
  return manifest;
}

const args = process.argv.slice(2).filter((arg) => arg !== "--pdf");
const wantPdf = process.argv.includes("--pdf");
const partnerId = args[0] || PARTNER_DEMO.id;

generate(partnerId, { pdf: wantPdf }).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
