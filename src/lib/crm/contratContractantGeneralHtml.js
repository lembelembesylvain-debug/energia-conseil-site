/**
 * Template Master — Contrat de Contractant Général (charte Pereira = standard officiel).
 * Bleu nuit #0B1F3A · émeraude #059669 · 18 articles CGV · Article 16 verrouillé CG.
 */

import { LOGO_ENERGIA_DATA_URI } from "./logoEnergiaDataUri.js";
import {
  htmlBadgesOfficiels,
  htmlMentionContractuelle,
  htmlPiedIdentite,
  MENTION_MARCHE_CONTRACTANT_GENERAL,
} from "../branding.ts";

export const TITRE_CONTRAT_CONTRACTANT_GENERAL =
  "CONTRAT DE CONTRACTANT GÉNÉRAL — MARCHÉ DE RÉNOVATION GLOBALE CLÉ EN MAIN";

export const LOGO_ENERGIA_CONTRAT_PATH = "/logo.png";
/** Logo officiel (data-URI) — en-tête contrat CG + embarquerImages / file://. */
export const LOGO_ENERGIA_CONTRAT = LOGO_ENERGIA_DATA_URI;

export const CONTACTS_CONTRAT_MASTER = [
  {
    role: "Direction & Contractant Général",
    nom: "Sylvain LEMBELEMBE",
    detail: "ENERGIA-CONSEIL IA® — 06 10 59 68 98 — contact@energia-conseil-ia.com",
  },
  {
    role: "Gestionnaire Administrative Partenaire",
    nom: "Clyve",
    detail:
      "Gestion administrative, instruction et montage des dossiers de subventions ANAH / MaPrimeRénov’",
  },
  {
    role: "Courtier en travaux & financements",
    nom: "FABIEN — VIVONS COURTIER",
    detail: "06 71 19 96 45 — Prêts travaux (6 000 € à 75 000 €), trésorerie et solutions de financement",
  },
  {
    role: "Juriste ENERGIA-CONSEIL IA®",
    nom: "Julia",
    detail: "Avis juridique, conformité contractuelle & clause de protection des aides",
  },
];

export function euro(n) {
  return Number(n)
    .toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/[\u00a0\u202f]/g, " ");
}

export function dateLongue(iso) {
  const [y, m, d] = String(iso || "2026-01-01").split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  return dt.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function cssChartePremiumEnergia(numero = "") {
  return `
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
      @bottom-center {
        content: "ENERGIA-CONSEIL IA®  ·  ${numero || "CONTRAT"}  ·  " counter(page) " / " counter(pages);
        font-size: 8pt;
        color: #64748b;
      }
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: "Segoe UI", Calibri, Arial, Helvetica, sans-serif;
      font-size: 9.5pt;
      line-height: 1.38;
      color: #0f172a;
      background: #e2e8f0;
    }
    .no-print { display: flex; }
    .toolbar {
      position: sticky; top: 0; z-index: 20;
      justify-content: flex-end; align-items: center; gap: 8px;
      padding: 10px 16px;
      background: #0B1F3A;
    }
    .toolbar .print-hint {
      margin-right: auto;
      color: #ecfdf5;
      font-size: 11px;
      line-height: 1.35;
      max-width: 74%;
    }
    .print-page { display: block; }
    .toolbar button {
      border: 0; border-radius: 8px; padding: 8px 14px;
      font-weight: 700; font-size: 12px; cursor: pointer;
      color: #0B1F3A; background: #059669;
    }
    .sheet {
      width: 210mm; max-width: 210mm;
      min-height: 297mm;
      margin: 16px auto;
      padding: 12mm 11mm 14mm;
      background: #fff;
      box-shadow: 0 12px 40px rgba(11, 31, 58, 0.16);
    }
    .header {
      display: block;
      width: 100%;
      border-bottom: 3px solid #059669;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .header-row { display: table; width: 100%; }
    .header .left, .header .right { display: table-cell; vertical-align: top; }
    .header .right { text-align: right; width: 38%; }
    .brand-lockup {
      display: table;
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 0 0 8px;
    }
    .brand-logo-cell, .brand-text-cell {
      display: table-cell;
      vertical-align: middle;
    }
    .brand-logo-cell {
      width: 72px;
      padding-right: 12px;
    }
    .logo {
      height: 60px;
      width: auto;
      max-width: 170px;
      display: block;
      margin: 0;
      object-fit: contain;
      object-position: left center;
      background: transparent;
    }
    .logo-wrap, .logo-blason, .logo-energia-officiel {
      height: 60px !important;
      width: auto !important;
      max-height: 60px;
      display: block;
      margin: 0;
    }
    .brand {
      font-size: 16pt;
      font-weight: 800;
      color: #059669;
      letter-spacing: .02em;
      line-height: 1.15;
      margin: 0;
    }
    .brand-tagline {
      font-size: 8pt;
      color: #475569;
      margin-top: 3px;
      line-height: 1.35;
    }
    .badges-officiels { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
    .badge-officiel {
      display: inline-block; border: 1px solid #059669; color: #065f46; background: #ecfdf5;
      border-radius: 999px; font-size: 7pt; font-weight: 700; padding: 2px 7px; line-height: 1.3;
    }
    .mention-marche {
      margin-top: 8px; border-left: 3px solid #0B1F3A; background: #f8fafc;
      padding: 6px 8px; font-size: 8pt; color: #0f172a; line-height: 1.4;
    }
    .company {
      font-size: 8pt;
      color: #475569;
      margin-top: 2px;
      line-height: 1.4;
    }
    .doc-title { font-size: 11pt; font-weight: 800; color: #0B1F3A; line-height: 1.3; margin-top: 8px; }
    .doc-title-bandeau {
      background: #0B1F3A;
      color: #fff;
      font-size: 11pt;
      font-weight: 800;
      line-height: 1.35;
      letter-spacing: 0.01em;
      text-align: left;
      padding: 10px 12px;
      margin: 10px 0 0;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .meta { font-size: 8pt; color: #64748b; }
    h2 {
      font-size: 10.5pt;
      color: #059669;
      border-bottom: 1px solid #a7f3d0;
      padding-bottom: 3px;
      margin: 0 0 8px;
      break-after: avoid;
      page-break-after: avoid;
    }
    p { margin: 0 0 6px; orphans: 3; widows: 3; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 8px;
      font-size: 8pt;
    }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    th, td { border: 1px solid #cbd5e1; padding: 4px 6px; vertical-align: top; }
    th { background: #0B1F3A; color: #fff; font-weight: 700; text-align: left; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    .montant, .tar { text-align: right; white-space: nowrap; }
    table small { color: #64748b; font-size: 7.5pt; font-weight: 400; }
    .num, .num-col { text-align: right; white-space: nowrap; }
    .num-col { width: 22px; }
    .total-row { font-weight: 800; background: #ecfdf5; }
    .muted { color: #64748b; font-size: 7.5pt; font-weight: 400; margin-top: 2px; }
    .alert-red {
      background: #fef2f2; border: 2px solid #dc2626; color: #7f1d1d;
      padding: 8px 10px; margin: 0 0 10px; border-radius: 6px; font-weight: 600; font-size: 8.5pt;
    }
    .disclaimer {
      background: #fffbeb; border: 1px solid #f59e0b; color: #78350f;
      padding: 8px 10px; margin: 0 0 8px; border-radius: 6px; font-size: 8pt;
    }
    .encart-commission { background: #f8fafc; border: 1px solid #0B1F3A; color: #0f172a; }
    .encart-commission ul { margin: 4px 0 6px 18px; padding: 0; }
    .encart-commission li { margin: 2px 0; }
    .encart-direction {
      margin-top: 6px; padding-top: 6px; border-top: 1px solid #cbd5e1; font-size: 7.5pt;
    }
    .section-roi-solaire { margin: 8px 0 0; }
    .roi-kpis {
      display: table;
      width: 100%;
      border-collapse: separate;
      border-spacing: 8px 0;
      margin: 0 0 10px;
    }
    .kpi-roi {
      display: table-cell;
      width: 33.33%;
      background: #ecfdf5;
      border: 1px solid #059669;
      border-radius: 8px;
      padding: 10px 12px;
      vertical-align: top;
    }
    .kpi-roi-label {
      font-size: 7pt;
      color: #064e3b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .03em;
      margin: 0 0 4px;
    }
    .kpi-roi-value {
      font-size: 15pt;
      font-weight: 800;
      color: #0B1F3A;
      margin: 0;
      line-height: 1.15;
    }
    .kpi-roi-hint {
      font-size: 7.5pt;
      color: #047857;
      margin: 4px 0 0;
      font-weight: 600;
    }
    .tableau-amortissement .row-amorti { background: #d1fae5; font-weight: 700; }
    .tableau-amortissement .row-garantie { background: #ecfdf5; }
    .tableau-amortissement .bilan-neg { color: #9a3412; }
    .tableau-amortissement .bilan-pos { color: #047857; font-weight: 700; }
    .graphique-roi-solaire {
      margin: 10px 0 8px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .graphique-roi-titre {
      font-size: 8.5pt;
      font-weight: 700;
      color: #0B1F3A;
      text-align: center;
      margin: 0 0 6px;
      font-style: normal;
    }
    .graphique-roi-solaire svg {
      display: block;
      width: 100%;
      height: 280px;
      max-width: 100%;
      overflow: visible;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .graphique-roi-legende {
      display: table;
      width: 100%;
      margin: 6px 0 0;
      padding: 0;
      list-style: none;
      font-size: 7.5pt;
      color: #334155;
    }
    .graphique-roi-legende li {
      display: table-cell;
      width: 33.33%;
      vertical-align: middle;
      margin: 0;
    }
    .pastille {
      display: inline-block;
      width: 11px;
      height: 11px;
      border-radius: 99px;
      margin-right: 6px;
      vertical-align: -1px;
    }
    .pastille-rouge { background: #dc2626; box-shadow: inset 0 0 0 2px #fff; outline: 1px dashed #dc2626; }
    .pastille-vert { background: #10b981; }
    .pastille-or { background: #d4af37; }
    .sous-ensemble {
      background: #ecfdf5; border: 1px solid #059669; color: #064e3b;
      padding: 8px 10px; margin: 8px 0; border-radius: 6px; font-size: 8.5pt;
    }
    .hors-subvention {
      background: #fff7ed; border: 2px solid #f97316; color: #9a3412;
      padding: 10px 12px; margin: 8px 0; border-radius: 8px; font-size: 8.5pt;
    }
    .julia {
      background: #fff7ed; border-left: 5px solid #f97316;
      padding: 10px 12px; margin: 0;
    }
    .signature-block {
      border: 1px solid #94a3b8;
      padding: 12px;
      border-radius: 8px;
      background: #fff;
    }
    .sig-table { width: 100%; border-collapse: separate; border-spacing: 14px 8px; margin: 4px 0 0; }
    .sig-table td { border: 0; padding: 0; width: 50%; vertical-align: bottom; }
    .sig-line { border-bottom: 1px solid #334155; height: 38px; margin-top: 6px; }
    .signature-unique {
      text-align: center;
      margin: 22px auto 6px;
      max-width: 440px;
      line-height: 1.65;
    }
    .signature-unique p { margin: 0 0 12px; }
    .signature-cadre {
      margin: 16px auto 4px;
      width: 300px;
      height: 118px;
      border: 1.5px dashed #334155;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #64748b;
      font-size: 8pt;
      background: #f8fafc;
      padding: 8px;
    }
    .contacts-table th { width: 38%; background: #064e3b; }
    ul, ol { margin: 4px 0 0 18px; padding: 0; }
    li { margin: 3px 0; break-inside: avoid; page-break-inside: avoid; }
    .footer-doc {
      margin-top: 10px; font-size: 7.5pt; color: #64748b;
      border-top: 1px solid #e2e8f0; padding-top: 6px;
    }
    .bloc, .keep,
    .alert-red, .disclaimer, .sous-ensemble, .hors-subvention, .julia, .signature-block, .signature-unique, .signature-cadre,
    table, .header, .photo-paire, .roi-kpis, .section-roi-solaire {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .cgv-page { break-before: page; page-break-before: always; }
    .cgv-page li { break-inside: avoid; page-break-inside: avoid; }
    .photo-annexe, .annexe-photos { margin: 8px 0 12px; }
    .grille-avant-apres { display: table; width: 100%; border-spacing: 8px 0; }
    .grille-avant-apres figure { display: table-cell; width: 50%; margin: 0; vertical-align: top; }
    figure img {
      width: 100%; height: 148px; object-fit: cover;
      border: 1px solid #059669; border-radius: 6px; background: #f1f5f9;
    }
    figcaption { font-size: 7.5pt; color: #334155; margin-top: 4px; }
    .engagement-bleu {
      background: #eff6ff; border: 2px solid #1d4ed8; color: #1e3a8a;
      padding: 8px 10px; margin: 0 0 8px; border-radius: 6px; font-size: 8.5pt; font-weight: 600;
    }
    .badge-phase {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 7.5pt; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
      padding: 3px 8px; border-radius: 999px; margin: 0 4px 6px 0;
      print-color-adjust: exact; -webkit-print-color-adjust: exact;
    }
    .badge-p1 { background: #475569; color: #f8fafc; }
    .badge-p2 { background: #b45309; color: #fffbeb; }
    .badge-p3 { background: #0B1F3A; color: #e2e8f0; }
    .badge-p4 { background: #047857; color: #fef3c7; border: 1px solid #C9A227; }
    .liseret-p1 { border-left: 4px solid #475569; padding-left: 10px; }
    .liseret-p2 { border-left: 4px solid #b45309; padding-left: 10px; }
    .liseret-p3 { border-left: 4px solid #0B1F3A; padding-left: 10px; }
    .liseret-p4 { border-left: 4px solid #059669; padding-left: 10px; }
    .avertissement-2027 {
      background: #fff7ed; border-left: 4px solid #f97316;
      padding: 8px 10px; margin: 8px 0; font-size: 8.5pt; color: #9a3412;
    }
    .independance-p1 {
      background: #f1f5f9; border-left: 4px solid #475569;
      padding: 8px 10px; margin: 8px 0; font-size: 8.5pt; color: #1e293b;
    }
    thead.thead-p1 th { background: #334155; color: #fff; }
    thead.thead-p2 th { background: #92400e; color: #fffbeb; }
    thead.thead-p3 th { background: #0B1F3A; color: #fff; }
    thead.thead-p4 th { background: #047857; color: #fef3c7; }
    .annexe-3d { margin: 8px 0 12px; text-align: center; }
    .annexe-3d figure {
      margin: 0 0 14px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .annexe-3d img {
      display: block;
      margin: 0 auto;
      width: auto;
      max-width: 100%;
      height: auto !important;
      max-height: 128mm;
      object-fit: contain !important;
      border: 1px solid #059669;
      border-radius: 8px;
      background: #fff;
    }
    .annexe-projet-acheve {
      margin: 0 0 12px;
      text-align: center;
    }
    .annexe-projet-acheve > h2 {
      text-align: left;
    }
    .annexe-projet-acheve figure {
      margin: 0 0 18px;
      break-inside: avoid;
      page-break-inside: avoid;
      page-break-after: always;
      break-after: page;
    }
    .annexe-projet-acheve figure:last-of-type {
      page-break-after: auto;
      break-after: auto;
    }
    .annexe-projet-acheve img {
      display: block;
      margin: 0 auto 8px;
      width: 100% !important;
      max-width: 100%;
      height: auto !important;
      max-height: 198mm;
      object-fit: contain !important;
      border: 1px solid #059669;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 10px 24px rgba(11, 31, 58, 0.12);
    }
    .annexe-projet-acheve figcaption {
      max-width: 100%;
      margin: 0 auto;
      font-size: 8.5pt;
      color: #334155;
      text-align: left;
      line-height: 1.45;
    }
    .annexe-visuelle-facade {
      margin: 14px 0 18px;
      text-align: center;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .annexe-visuelle-facade .cadre-prestige {
      display: block;
      margin: 0 auto;
      max-width: 850px;
      width: 100%;
      border-radius: 12px;
    }
    .annexe-visuelle-facade .cadre-prestige img,
    .galerie-projections-brunel img {
      display: block;
      width: 100%;
      max-width: 100%;
      height: auto !important;
      margin: 0 auto 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 12px 28px rgba(11, 31, 58, 0.16);
      object-fit: contain;
      background: #f8fafc;
    }
    .galerie-projections-brunel {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      max-width: 850px;
      margin: 0 auto;
    }
    .annexe-visuelle-facade figcaption {
      max-width: 850px;
      margin: 0 auto 8px;
      font-size: 8.5pt;
      color: #334155;
      text-align: center;
      line-height: 1.45;
      font-style: italic;
    }
    .fiche-preconisation .preco {
      min-height: 148px; border: 1px dashed #059669; border-radius: 6px;
      background: #ecfdf5; padding: 10px 12px; font-size: 8pt;
    }
    .audit-visuel { font-size: 7.5pt; color: #334155; margin: 6px 0 0; }
    .mentions-legales { font-size: 7.5pt; color: #475569; }
    @media print {
      html, body { background: #fff !important; }
      .no-print { display: none !important; }
      .sheet {
        width: auto; max-width: none; min-height: 0;
        margin: 0; padding: 0; box-shadow: none;
      }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      a { color: inherit; text-decoration: none; }
      .annexe-visuelle-facade .cadre-prestige img,
      .galerie-projections-brunel img,
      .annexe-projet-acheve img {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        max-height: 198mm !important;
        object-fit: contain !important;
        border-radius: 8px !important;
        margin-bottom: 12px !important;
        display: block !important;
        box-shadow: 0 8px 22px rgba(11, 31, 58, 0.14) !important;
      }
      .annexe-projet-acheve figure {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .print-cinq-pages {
        font-size: 8.6pt;
        line-height: 1.28;
      }
      .print-cinq-pages .print-page-1,
      .print-cinq-pages .print-page-2,
      .print-cinq-pages .print-page-3,
      .print-cinq-pages .print-page-roi,
      .print-cinq-pages .print-page-4 {
        break-after: page;
        page-break-after: always;
      }
      .print-cinq-pages .print-page-5 {
        break-after: auto;
        page-break-after: auto;
      }
      .print-cinq-pages .print-page-1,
      .print-cinq-pages .print-page-2,
      .print-cinq-pages .print-page-3,
      .print-cinq-pages .print-page-roi,
      .print-cinq-pages .print-page-4,
      .print-cinq-pages .print-page-5 {
        break-inside: auto;
        page-break-inside: auto;
      }
      .print-cinq-pages .bloc,
      .print-cinq-pages .keep {
        break-inside: auto;
        page-break-inside: auto;
      }
      .print-cinq-pages table,
      .print-cinq-pages .alert-red,
      .print-cinq-pages .disclaimer,
      .print-cinq-pages .sous-ensemble,
      .print-cinq-pages .hors-subvention,
      .print-cinq-pages .julia,
      .print-cinq-pages .signature-block,
      .print-cinq-pages .header,
      .print-cinq-pages .annexe-visuelle-facade {
        break-inside: auto;
        page-break-inside: auto;
      }
      .print-cinq-pages .print-page-2 table,
      .print-cinq-pages .print-page-3 table,
      .print-cinq-pages .print-page-4 > section.bloc:first-of-type table,
      .print-cinq-pages tr,
      .print-cinq-pages .signature-unique,
      .print-cinq-pages .signature-cadre {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .print-cinq-pages .print-page-5 table,
      .print-cinq-pages .print-page-5 .julia {
        break-inside: auto;
        page-break-inside: auto;
      }
      .print-cinq-pages .cgv-page {
        break-before: auto !important;
        page-break-before: auto !important;
      }
      .print-cinq-pages .cgv-page li {
        break-inside: auto;
        page-break-inside: auto;
        margin: 1px 0;
      }
      .print-cinq-pages .tableau-amortissement { font-size: 7.1pt; }
      .print-cinq-pages .graphique-roi-solaire svg { height: 248px; }
      .print-cinq-pages .kpi-roi { padding: 8px 10px; }
      .print-cinq-pages .kpi-roi-value { font-size: 13pt; }
      .print-cinq-pages h2 {
        font-size: 9.5pt;
        margin: 0 0 5px;
        padding-bottom: 2px;
      }
      .print-cinq-pages table { font-size: 7.3pt; margin-bottom: 5px; }
      .print-cinq-pages th, .print-cinq-pages td { padding: 3px 4px; }
      .print-cinq-pages .muted { font-size: 6.6pt; }
      .print-cinq-pages table small { font-size: 6.6pt; }
      .print-cinq-pages .alert-red,
      .print-cinq-pages .disclaimer,
      .print-cinq-pages .sous-ensemble,
      .print-cinq-pages .hors-subvention {
        padding: 6px 8px;
        margin: 0 0 6px;
        font-size: 7.5pt;
      }
      .print-cinq-pages .brand { font-size: 14pt; }
      .print-cinq-pages .brand-tagline { font-size: 7.5pt; }
      .print-cinq-pages .logo,
      .print-cinq-pages .logo-wrap,
      .print-cinq-pages .logo-energia-officiel {
        height: 60px !important;
        max-height: 60px !important;
        width: auto !important;
      }
      .print-cinq-pages .brand-logo-cell { width: 72px; padding-right: 10px; }
      .print-cinq-pages .company { font-size: 7.5pt; }
      .print-cinq-pages .doc-title { font-size: 10pt; margin-top: 4px; }
      .print-cinq-pages .header { padding-bottom: 6px; margin-bottom: 6px; }
      .print-cinq-pages .annexe-visuelle-facade { margin: 2px 0 8px; }
      .print-cinq-pages .annexe-visuelle-facade .cadre-prestige img,
      .print-cinq-pages .galerie-projections-brunel img {
        max-width: 100% !important;
        max-height: 52mm !important;
        width: auto !important;
        height: auto !important;
        margin: 0 auto 8px !important;
        border-radius: 8px !important;
        display: block !important;
      }
      .print-cinq-pages .annexe-visuelle-facade figcaption {
        font-size: 7.2pt;
        margin-top: 4px;
      }
      .print-cinq-pages .signature-block { padding: 8px 10px; }
      .print-cinq-pages .signature-unique { margin: 12px auto 4px; }
      .print-cinq-pages .signature-cadre { height: 96px; }
      .print-cinq-pages .sig-line { height: 28px; }
      .print-cinq-pages .julia { padding: 6px 8px; font-size: 7.3pt; }
      .print-cinq-pages .cgv-page { font-size: 6.55pt; line-height: 1.2; }
      .print-cinq-pages .cgv-page ol { margin: 2px 0 4px 16px; }
      .print-cinq-pages .mentions-legales,
      .print-cinq-pages .footer-doc { font-size: 6.6pt; margin-top: 6px; }
    }
  `;
}

function figureApres(paire) {
  if (paire.apresSrc) {
    return `
        <figure>
          <img src="${paire.apresSrc}" alt="${escapeHtml(paire.legendApres || "Après")}" />
          <figcaption><strong>Après (projection)</strong> — ${escapeHtml(paire.legendApres || "")}</figcaption>
        </figure>`;
  }
  return `
        <figure class="fiche-preconisation">
          <div class="preco">
            <p><strong>Préconisation RGE</strong></p>
            <p>${escapeHtml(paire.cote || "")}</p>
            <p>${escapeHtml(paire.preconisationRge || "")}</p>
          </div>
          <figcaption><strong>Après</strong> — ${escapeHtml(paire.legendApres || "")}</figcaption>
        </figure>`;
}

export function htmlAnnexePhotos({
  paires = [],
  mentionLegale = "",
  mentionProjection = "",
  piedHtml = "",
  avecAudit = false,
} = {}) {
  if (!paires.length) return "";
  const cartes = paires
    .map((paire) => {
      const audit = avecAudit
        ? `<p class="audit-visuel"><strong>Cote :</strong> ${escapeHtml(paire.cote || "")}<br /><strong>État d’usure :</strong> ${escapeHtml(paire.etatUsure || "")}<br /><strong>Préconisation RGE :</strong> ${escapeHtml(paire.preconisationRge || "")}</p>`
        : "";
      return `
    <article class="photo-paire">
      <h2 style="font-size:9.5pt">${escapeHtml(paire.titre || "Photo")}</h2>
      <div class="grille-avant-apres">
        <figure>
          <img src="${paire.avantSrc}" alt="${escapeHtml(paire.legendAvant || "Avant")}" />
          <figcaption><strong>Avant</strong> — ${escapeHtml(paire.legendAvant || "")}</figcaption>
        </figure>
        ${figureApres(paire)}
      </div>
      ${audit}
    </article>`;
    })
    .join("");
  return `
    <section class="photo-annexe annexe-photos bloc">
      <h2>Annexe Photographique — État des Lieux &amp; Diagnostic Avant Travaux</h2>
      <p>Grille Avant / Après — ${escapeHtml(mentionLegale)}</p>
      ${cartes}
      <p class="mentions-legales">${escapeHtml(mentionLegale)} ${escapeHtml(mentionProjection)} ${piedHtml}</p>
    </section>`;
}

/** Désignation contractuelle — grille multi-lots Damien RICHARD (SRD CONSEIL). */
export const DESIGNATION_COMMISSION_DAMIEN =
  "Damien RICHARD (Société SRD CONSEIL — damien.srdconseil@gmail.com) — commissionnement progressif : 10 % HT jusqu’à 50 000 € HT, 5 % HT au-delà — 31 corps d’état du catalogue officiel";

export const MENTIONS_DIRECTION_ASSURANCES_CONTRAT = [
  "ENERGIA CONSEIL IA® — Sylvain LEMBELEMBE (Direction Générale et Portage Contractant Général - Art. 1787 du Code Civil).",
  "Marque déposée INPI n° 5213845.",
  "Garantie Décennale Calipso Assurances n° LUNPIB2604975.",
  "Honoraires d’ingénierie et de direction générale sanctuarisés à 15 % HT.",
];

/** Encart page 3/5 — récapitulatif financier. */
export function htmlEncartCommissionDamien() {
  const direction = MENTIONS_DIRECTION_ASSURANCES_CONTRAT.map((ligne) => `<div>${ligne}</div>`).join("");
  return `<aside class="disclaimer encart-commission">
      <p><strong>Encart contractuel — rémunération commerciale</strong></p>
      <ul>
        <li><strong>Bénéficiaire :</strong> Damien RICHARD (Société SRD CONSEIL)</li>
        <li><strong>Contact :</strong> damien.srdconseil@gmail.com</li>
        <li><strong>Rémunération commerciale :</strong> Commissionnement progressif par tranches :
          <ul>
            <li>10 % HT sur la tranche de travaux jusqu’à 50 000 € HT</li>
            <li>5 % HT sur la part excédentaire au-delà de 50 000 € HT</li>
          </ul>
        </li>
        <li><strong>Périmètre :</strong> Ensemble des 31 corps d’état du catalogue officiel ENERGIA CONSEIL IA® (Rénovation Globale Parcours Accompagné, PAC Air/Eau, Solaire &amp; Tesla Powerwall 3, ITE, Menuiseries Uw ≤ 1,3, Aménagement).</li>
      </ul>
      <div class="encart-direction">${direction}</div>
    </aside>`;
}

/** Clauses particulières de commissionnement — conditions financières. */
export function articlesCommissionDamien() {
  return [
    `<strong>Article — Périmètre et Barème des Commissions.</strong> La commission due à la société de Monsieur Damien RICHARD (SRD CONSEIL) est calculée sur le Montant Total Hors Taxes (HT) des travaux vendus et validés par ENERGIA CONSEIL IA®, selon le barème dégressif par tranche : 10 % HT du montant des travaux pour la fraction comprise entre 0 € et 50 000 € HT ; 5 % HT du montant des travaux pour la fraction strictement supérieure à 50 000 € HT. Périmètre : ensemble des 31 corps d’état du catalogue officiel ENERGIA CONSEIL IA® (Rénovation Globale Parcours Accompagné, PAC Air/Eau, Solaire &amp; Tesla Powerwall 3, ITE, Menuiseries Uw ≤ 1,3, Aménagement).`,
    `<strong>Article — Conditions de Déclenchement et d’Échéance.</strong> La commission est acquise et payable exclusivement selon l’échéancier suivant : 50 % du montant de la commission versés après expiration du délai légal de rétractation du client (14 jours calendaires) et encaissement effectif du premier acompte sur le compte bancaire d’ENERGIA CONSEIL IA® ; 50 % du solde de la commission versés à la réception définitive des travaux avec signature du Procès-Verbal (PV) de réception sans réserve et encaissement intégral du solde dû par le client ou versement des aides.`,
    `<strong>Article — Facturation et Indépendance Juridique.</strong> Le règlement de la commission intervient sous 15 jours suivant présentation d’une facture en bonne et due forme émise par la société de Damien RICHARD (SRD CONSEIL) comportant son numéro SIRET. Les parties attestent d’une indépendance juridique et commerciale totale, excluant tout lien de subordination.`,
  ];
}

function avecClausesCommission(articles, inclure) {
  const liste = articles || [];
  if (!inclure) return liste;
  if (liste.some((article) => String(article).includes("Périmètre et Barème des Commissions"))) return liste;
  return [...liste, ...articlesCommissionDamien()];
}

export function articlesCgvContractantGeneral({
  numero,
  dateTxt,
  totalTtc,
  acompte,
  intermediaire,
  solde,
  ordreTravaux,
  artisans,
} = {}) {
  const ttc = euro(totalTtc);
  return [
    `<strong>Article 1 — Qualité de Contractant Général.</strong> ENERGIA-CONSEIL IA® agit en qualité exclusive de <strong>Contractant Général</strong>. Elle garantit la coordination globale du marché, le respect du Montant total TTC : ${ttc} € TTC et la conformité des interventions des artisans partenaires RGE${artisans ? ` (${artisans})` : ""}, qui interviennent sous sa maîtrise d’œuvre et sa sous-traitance contractuelle. Tous les travaux sont réalisés par des artisans certifiés RGE, sélectionnés et coordonnés par Sylvain LEMBELEMBE (2 à 3 devis comparatifs par poste).`,
    `<strong>Article 2 — Ordre des travaux impératif.</strong> ${ordreTravaux || "Isolation combles → isolation murs → planchers → menuiseries → VMC → PAC (dimensionnement post-isolation) → ballon thermodynamique → photovoltaïque. Isolation avant chauffage en toutes circonstances."}`,
    `<strong>Article 3 — Modalités de paiement 30 / 40 / 30.</strong> Acompte initial de 30 % à la signature : ${euro(acompte)} € TTC (engagement, blocage des prix artisans et constitution du dossier ANAH). Acompte intermédiaire de 40 % au démarrage effectif du chantier : ${euro(intermediaire)} € TTC (livraison et approvisionnement). Solde de 30 % à la réception : ${euro(solde)} € TTC, après procès-verbal de réception sans réserve et validation de Sylvain LEMBELEMBE (Contractant Général — ENERGIA-CONSEIL IA®). Total : ${ttc} € TTC. Aucun règlement artisans hors circuit convenu sans accord de Sylvain.`,
    `<strong>Article 4 — ANAH.</strong> Démarrage des travaux uniquement après accord écrit MaPrimeRénov’ si le client retient le parcours aides. À défaut, perte définitive et irrémédiable du MPR.`,
    `<strong>Article 5 — Clause Julia — Protection Aides (plafond 2 000 €).</strong> Écart ≤ 10 % : 0 % à la charge d’ENERGIA. Écart &gt; 10 % imputable à une erreur prouvée d’ENERGIA : participation 50 % plafonnée à 2 000 € par projet. Erreur client, fausse déclaration de revenus ou décision ANAH/CEE : 0 % à la charge d’ENERGIA.`,
    `<strong>Article 6 — Planning artisans.</strong> Délais contractuels sauf force majeure. Pénalités de retard progressives (3 % / 5 % / 10 % du lot, plafonnées à 5 % du marché). Remplacement d’un artisan défaillant sous 7 jours ouvrés, proposé par Sylvain.`,
    `<strong>Article 7 — Chantier propre.</strong> Nettoyage quotidien des accès. Retenue de 5 % sur le solde du lot concerné si chantier laissé sale à réception.`,
    `<strong>Article 8 — Réserve de propriété (loi 80.335 du 12 mai 1980).</strong> Équipements et matériaux restent la propriété d’ENERGIA ou des entreprises jusqu’au paiement intégral.`,
    `<strong>Article 9 — Pénalités de retard de paiement.</strong> 3 fois le taux d’intérêt légal + indemnité forfaitaire de recouvrement 40 €.`,
    `<strong>Article 10 — Assurance dommages-ouvrage.</strong> Recommandée. ENERGIA ne peut être tenue responsable du défaut de souscription.`,
    `<strong>Article 11 — Révision des prix.</strong> Si le délai entre la date du devis et le début des travaux excède 60 jours, révision possible sur indice BT01.`,
    `<strong>Article 12 — Force majeure.</strong> Météo rendant l’intervention impossible, catastrophe, pandémie, rupture d’approvisionnement majeure : report sans pénalité, information sous 8 jours.`,
    `<strong>Article 13 — Modification / annulation.</strong> Avenant écrit obligatoire. Annulation client après signature : frais 500 € déduits de l’acompte. Annulation ENERGIA hors force majeure : remboursement intégral + 500 €.`,
    `<strong>Article 14 — Litiges.</strong> Résolution amiable sous 15 jours, puis tribunaux de Lyon. Médiation possible d’un commun accord.`,
    `<strong>Article 15 — RGPD.</strong> Données conservées 5 ans. Droits d’accès, rectification, effacement : contact@energia-conseil-ia.com. Réclamation CNIL.`,
    `<strong>16. Malfaçons et garanties.</strong> Mise en demeure sous 7 jours. Garanties légales : garantie décennale, garantie biennale de bon fonctionnement et garantie de parfait achèvement (GPA) portées par les artisans RGE partenaires sous contrat. ENERGIA-CONSEIL IA® intervient en qualité exclusive de CONTRACTANT GÉNÉRAL (coordination d’ensemble, pilotage de chantier, engagement sur les délais et respect du Montant total TTC convenu).`,
    `<strong>Article 17 — Preuves.</strong> Photos avant / pendant / après. PV de démarrage, mi-chantier et réception. Conservation 5 ans.`,
    `<strong>Article 18 — Validité.</strong> Le présent contrat est valable 3 mois à compter du ${dateTxt}.`,
  ];
}

function ligneSpecsHtml(l) {
  const spec = l.specifications || "";
  const artisan = l.artisan && !spec.includes(l.artisan) ? ` — ${l.artisan}` : "";
  return `${spec}${artisan}`;
}

function rowsPostes(postes) {
  return (postes || [])
    .map((l) => {
      const tvaPct = Number(l.tauxTva) >= 0 ? (Number(l.tauxTva) * 100).toFixed(1).replace(".", ",") : "5,5";
      const pu = l.prixInclus ? "Inclus" : `${euro(l.puHt)} €`;
      const ht = l.prixInclus ? "Inclus" : `${euro(l.totalHt)} €`;
      const tva = l.prixInclus ? `${tvaPct} % · Inclus` : `${tvaPct} % · ${euro(l.totalTva)} €`;
      const ttc = l.prixInclus ? "Inclus" : `${euro(l.totalTtc)} €`;
      return `<tr>
        <td class="num-col num">${l.ordreContractuel ?? ""}</td>
        <td>
<strong>${l.nom}</strong><br>
<small>${ligneSpecsHtml(l)}</small>
</td>
        <td class="num">${l.quantite ?? ""}</td>
        <td>${l.unite || ""}</td>
        <td class="montant tar">${pu}</td>
        <td class="montant tar">${ht}</td>
        <td class="montant tar">${tva}</td>
        <td class="montant tar">${ttc}</td>
      </tr>`;
    })
    .join("\n");
}

function rowsContacts(contacts) {
  return (contacts || CONTACTS_CONTRAT_MASTER)
    .map(
      (item) => `<tr>
      <th>${item.role}</th>
      <td><strong>${item.nom}</strong><div class="muted">${item.detail || ""}</div></td>
    </tr>`,
    )
    .join("\n");
}

function rowsRecap(lignes) {
  return (lignes || [])
    .map((row) => {
      const klass = row.total ? ' class="total-row"' : "";
      const muted = row.muted ? `<br><span class="muted">${row.muted}</span>` : "";
      return `<tr${klass}><td>${row.label}${muted}</td><td class="montant">${row.montant}</td></tr>`;
    })
    .join("\n");
}

/**
 * @param {object} payload
 */
export function construireHtmlContratContractantGeneral(payload) {
  const p = payload.prestataire;
  const t = payload.totaux;
  const dateTxt = payload.dateTxt || dateLongue(payload.dateIso);
  const titre = payload.titre || TITRE_CONTRAT_CONTRACTANT_GENERAL;
  const numero = payload.numero || "";
  const contacts = payload.contacts?.length ? payload.contacts : CONTACTS_CONTRAT_MASTER;
  const cgvArticles = avecClausesCommission(
    payload.cgvArticles?.length > 0
      ? payload.cgvArticles
      : articlesCgvContractantGeneral({
          numero,
          dateTxt,
          totalTtc: t.totalTtc,
          acompte: payload.echeancier?.acompte,
          intermediaire: payload.echeancier?.intermediaire,
          solde: payload.echeancier?.solde,
          ordreTravaux: payload.ordreTravauxCgv,
          artisans: payload.artisansCgv,
        }),
    payload.inclureCommissionDamien,
  );
  const labelTotal = payload.labelTotalRow || "TOTAL CONTRAT";
  const colonneTva = payload.colonneTva || "TVA";
  const titrePostes =
    payload.titrePostes ||
    `II. Détail des ${payload.postes?.length || 0} postes contractuels — ordre optimal ENERGIA`;
  const titreAides = payload.titreAides || "IV. Ingénierie financière & aides 2026 (estimation à titre indicatif)";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titre} | ENERGIA-CONSEIL IA®</title>
  <style>${cssChartePremiumEnergia(numero)}</style>
</head>
<body${payload.printCinqPages ? ' class="print-cinq-pages"' : ""}>
  <div class="toolbar no-print">
    ${payload.printCinqPages ? `<span class="print-hint">PDF 5 pages A4 — dans Edge : décocher « En-têtes et pieds de page », cocher « Graphiques d’arrière-plan ».</span>` : ""}
    <button type="button" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
  </div>
  <article class="sheet">
    <div class="print-page print-page-1">
    <header class="header keep">
      <div class="header-row">
        <div class="left">
          <div class="brand-lockup">
            <div class="brand-logo-cell">
              ${
                payload.logoHtml ||
                `<img class="logo" src="${LOGO_ENERGIA_CONTRAT}" alt="ENERGIA-CONSEIL IA®" height="60" />`
              }
            </div>
            <div class="brand-text-cell">
              <div class="brand">${p.nom}</div>
              <div class="brand-tagline">Audit Énergétique Intelligence Artificielle · Marque déposée et protégée INPI n°${p.inpi}</div>
              ${htmlBadgesOfficiels()}
            </div>
          </div>
          <div class="company">
            ${
              payload.companyHtml ||
              `${p.forme} — ${p.adresse}<br>
            SIRET ${p.siret} — RCS ${p.rcs} — TVA ${p.tva}<br>
            ${p.assuranceDecennale ? `Assurance Décennale ${p.assuranceDecennale}<br>` : ""}
            Direction &amp; Contractant Général : ${p.representant} — ${p.telephone} — ${p.email}`
            }
          </div>
        </div>
        <div class="right">
          <div class="meta">
            ${
              payload.enteteDroitHtml ||
              `N° ${numero}<br>
            Date : ${dateTxt} · Validité : 3 mois<br>
            ${payload.metaLignesHtml || ""}
            Montant total TTC : ${euro(t.totalTtc)} € TTC`
            }
          </div>
        </div>
      </div>
      <div class="${payload.docTitleClass || "doc-title"}">${titre}</div>
      ${htmlMentionContractuelle()}
    </header>

    <section class="bloc keep">
      <h2>I. Identification des parties</h2>
      <table>
        <tr><th style="width:28%">Contractant Général</th><td><strong>${p.nom}</strong> — ${p.forme}<br>${p.adresse}<br>SIRET ${p.siret} — RCS ${p.rcs} — TVA ${p.tva}<br>Marque déposée INPI n°${p.inpi}<br>Direction &amp; Contractant Général : ${p.representant} — ${p.telephone} — ${p.email}</td></tr>
        <tr><th>${payload.labelClient || "Client"}</th><td>${payload.clientHtml}</td></tr>
        <tr><th>${payload.labelLieu || "Lieu d’exécution"}</th><td><strong>${payload.lieuExecution}</strong></td></tr>
      </table>
      ${payload.fiscaliteHtml || ""}
      ${payload.alertHtml || ""}
      ${
        payload.engagementHtml ||
        `<div class="disclaimer">
        <strong>Engagement de Contractant Général — Montant total TTC : ${euro(t.totalTtc)} € TTC.</strong>
        ENERGIA-CONSEIL IA® prend la responsabilité globale du chantier, garantit la coordination unique des lots et le respect du montant total convenu.
        ${payload.engagementArtisansHtml || "Les artisans RGE interviennent sous la maîtrise d’œuvre et la sous-traitance contractuelle d’ENERGIA-CONSEIL IA®."}
      </div>`
      }
    </section>
    </div>

    <div class="print-page print-page-2">
    <section class="bloc keep">
      <h2>${titrePostes}</h2>
      ${payload.introPostesHtml ? `<p class="muted">${payload.introPostesHtml}</p>` : ""}
      <table>
        <thead${payload.theadClass ? ` class="${payload.theadClass}"` : ""}>
          <tr>
            <th>N°</th><th>${payload.colonneDesignation || "Désignation détaillée &amp; spécifications"}</th><th>Qté</th><th>Unité</th>
            <th>PU HT</th><th>Total HT</th><th>${colonneTva}</th><th>Total TTC</th>
          </tr>
        </thead>
        <tbody>
          ${rowsPostes(payload.postes)}
          <tr class="total-row">
            <td colspan="5">${labelTotal}</td>
            <td class="montant">${euro(t.totalHt)} €</td>
            <td class="montant">${euro(t.totalTva)} €</td>
            <td class="montant">${euro(t.totalTtc)} €</td>
          </tr>
        </tbody>
      </table>
      <p>${payload.totauxPhraseHtml || `<strong>Totaux contractuels :</strong> ${euro(t.totalHt)} € HT | TVA : ${euro(t.totalTva)} € | <strong>TOTAL TTC : ${euro(t.totalTtc)} €</strong>.`}</p>
      ${payload.apresTableauPostesHtml || ""}
    </section>
    </div>

    <div class="print-page print-page-3">
    ${payload.annexePhotosHtml || ""}

    <section class="bloc keep">
      <h2>${payload.titreRecap || "III. Récapitulatif financier"}</h2>
      <table>
        ${rowsRecap(payload.recapLignes)}
      </table>
      ${payload.modalitesReglementHtml || ""}
      ${payload.inclureCommissionDamien ? htmlEncartCommissionDamien() : ""}
    </section>
    </div>

    ${payload.apresRecapHtml ? `<div class="print-page print-page-roi">${payload.apresRecapHtml}</div>` : ""}

    <div class="print-page print-page-4">
    <section class="bloc keep">
      <h2>${titreAides}</h2>
      ${
        payload.disclaimerAidesHtml ||
        `<div class="disclaimer">
        <strong>Aides financières 2026 (estimation à titre indicatif).</strong>
        Aides à valider selon revenus réels du client et éligibilité en vigueur.
        Montants définitifs après instruction ANAH et CEE.
        ENERGIA-CONSEIL IA® ne garantit pas l’acceptation des dossiers.
      </div>`
      }
      <table>
        ${rowsRecap(payload.aidesLignes)}
      </table>
      ${payload.avertissementAidesHtml || ""}
      ${
        payload.regleAnahHtml ||
        `<p><strong>Règle ANAH :</strong> les travaux ne peuvent démarrer qu’après validation officielle du dossier MaPrimeRénov’ par l’ANAH. Un démarrage avant accord = refus total des aides MaPrimeRénov’.${payload.regleAnahExtra || ""}</p>`
      }
    </section>

    <section class="bloc keep">
      <h2>${payload.titrePlanning || "V. Planning prévisionnel"}</h2>
      <table>
        <thead>
          <tr><th>Phase</th><th>Durée</th><th>Détail</th></tr>
        </thead>
        <tbody>
          ${(payload.planning || [])
            .map((row) => `<tr><td>${row.phase}</td><td>${row.duree}</td><td>${row.detail}</td></tr>`)
            .join("\n")}
        </tbody>
      </table>
    </section>

    ${
      payload.conditionsParticulieresHtml
        ? `<section class="bloc keep">
      <h2>Conditions particulières</h2>
      ${payload.conditionsParticulieresHtml}
    </section>`
        : ""
    }

    <section class="bloc keep">
      <h2>${payload.titreSignature || "VI. Bon pour accord"}</h2>
      <div class="signature-block">
        ${payload.signatureHtml}
      </div>
    </section>
    </div>

    <div class="print-page print-page-5">
    <section class="bloc keep">
      <h2>${payload.titreContacts || "VII. Contacts projet officiels"}</h2>
      <table class="contacts-table">
        ${rowsContacts(contacts)}
      </table>
    </section>

    <section class="bloc keep">
      <h2>${payload.titreJulia || "VIII. Avis juridique — Julia (obligatoire)"}</h2>
      <div class="julia">
        <p>⚖️ Le présent contrat a été relu par <strong>Julia</strong>, juriste ENERGIA-CONSEIL IA®, qui confirme :</p>
        <ul>
          ${(payload.juliaBullets || [])
            .map((item) => `<li>${item}</li>`)
            .join("\n")}
        </ul>
        <p><strong>Signature :</strong> Avis établi sous la responsabilité de Julia, juriste ENERGIA-CONSEIL IA® — ${dateTxt}.</p>
      </div>
    </section>

    <section class="cgv-page">
      <h2>${payload.titreCgv || "IX. Conditions générales de vente — ENERGIA-CONSEIL IA®"}</h2>
      <p class="muted">${payload.cgvIntro || `Les présentes CGV s’appliquent au contrat ${numero}. Elles intègrent les 12 protections juridiques ENERGIA. 18 articles.`}</p>
      <ol>
        ${cgvArticles.map((item) => `<li>${item}</li>`).join("\n")}
      </ol>
      <h2>${payload.titreMentions || "X. Mentions légales"}</h2>
      ${htmlPiedIdentite()}
      <p>${MENTION_MARCHE_CONTRACTANT_GENERAL}</p>
      <p>${payload.mentionsHtml || "Document confidentiel, non cessible. Année de référence 2026. Clyve intervient comme gestionnaire administrative partenaire ; ce n’est pas une ligne de travaux facturée au client."}</p>
      ${payload.piedReglementHtml || ""}
      <div class="footer-doc">
        ${htmlPiedIdentite()}
        <p>${payload.footerClientHtml || `Contrat ${numero} — ${dateTxt}`}</p>
      </div>
    </section>
    </div>
  </article>
</body>
</html>`;
}
