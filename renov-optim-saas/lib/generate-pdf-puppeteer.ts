import {
  DPE_GAUGE_COLORS,
  DPE_GAUGE_ORDER,
  DPE_KWH_LABELS,
  dpeGaugeTextColor,
  normalizeDpeLetter,
} from "@/lib/dpe-gauge-shared";
import type { MprProfile, RenovationReportInput } from "@/lib/generate-renovation-report-pdf";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const COMPANY = {
  name: "ENERGIA CONSEIL IA®",
  address: "16 Rue Cuvier, 69006 Lyon",
  phone: "06 10 59 68 98",
  siret: "941 819 427 00019",
  rcs: "RCS Lyon 941 819 427",
  capital: "100€",
  email: "contact@renovoptim-ia.com",
} as const;

const CONTACTS = {
  amo: { name: "Sylvain LEMBELEMBE", role: "AMO", phone: "06 10 59 68 98" },
  commercial: { name: "DAMIEN", role: "Commercial", phone: "06 72 68 09 68" },
  courtier: { name: "FABIEN VIVONS COURTIER", role: "Courtier", phone: "06 71 19 96 45" },
  mar: { name: "Léo-Energy", role: "MAR (certifié France Rénov')", phone: "—" },
} as const;

const ARTISANS = [
  {
    name: "HB FACADIER (Bas HILMI)",
    metier: "ITE",
    phone: "06 21 63 58 93",
    labels: "RGE Qualibat",
    email: "contact@hb-facadier-hilmi.fr",
  },
  {
    name: "ECO SYSTÈME DURABLE",
    metier: "PAC / VMC",
    phone: "01 70 93 97 15",
    labels: "RGE QualiPAC",
    email: "—",
  },
  { name: "2C ENERGIES", metier: "Isolation", phone: "09 72 57 47 47", labels: "—", email: "—" },
  { name: "SIPV MENUISERIE", metier: "Menuiseries", phone: "05 49 43 72 93", labels: "—", email: "—" },
] as const;

function escapeHtml(s: string | null | undefined): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtEUR(n: number): string {
  const v = Math.round(Number.isFinite(n) ? n : 0);
  return `${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}€`;
}

function profileLabelFr(p: MprProfile): string {
  return { TM: "Très Modeste (TM)", MO: "Modeste (MO)", INT: "Intermédiaire (INT)", SUP: "Supérieur (SUP)" }[p];
}

function monthlySavingsBadge(input: RenovationReportInput): string {
  const annual =
    input.roi > 0 && input.resteACharge > 0 ? input.resteACharge / input.roi : Math.max(input.totalCostHT * 0.06, 0);
  const m = Math.round(annual / 12);
  const sign = m > 0 ? "-" : "";
  const abs = Math.abs(m);
  return `${sign}${fmtEUR(abs)}/mois`;
}

function dpeGauge(current: string | null, target: string | null): string {
  const cur = normalizeDpeLetter(current, "E");
  const tgt = normalizeDpeLetter(target, "B");
  const cells = DPE_GAUGE_ORDER.map((L) => {
    const active = L === cur;
    const targetH = L === tgt;
    const bg = DPE_GAUGE_COLORS[L];
    const tc = dpeGaugeTextColor(L);
    const ring = active ? "3px solid #111" : targetH ? "3px solid #166534" : "1px solid #d4d4d8";
    const kwh = escapeHtml(DPE_KWH_LABELS[L]);
    return `<div class="dpe-col"><div class="dpe-cell" style="background:${bg};color:${tc};box-shadow:inset 0 0 0 ${ring}">${L}</div><div class="dpe-kwh">${kwh}<br/><span class="dpe-kwh-sub">kWh/m²/an</span></div></div>`;
  }).join("");
  return `<div class="dpe-gauge">${cells}</div><p class="dpe-legend">DPE actuel → cible : <strong>${escapeHtml(cur)} → ${escapeHtml(tgt)}</strong></p>`;
}

function workRows(input: RenovationReportInput): string {
  if (!input.selectedActions.length) {
    return `<tr><td colspan="5" class="muted">Aucun geste détaillé — saisir les travaux dans l’estimateur pour alimenter cette section.</td></tr>`;
  }
  return input.selectedActions
    .map((a, i) => {
      const badge = a.mprAmount <= 0 && a.costHT > 0 ? `<span class="badge-warn">MPR non éligible sur ce poste</span>` : "";
      return `<tr>
        <td><span class="num">${i + 1}</span> ${escapeHtml(a.label)} ${badge}</td>
        <td class="val">${fmtEUR(a.costHT)}</td>
        <td class="val">${Math.round(a.mprRate * 100)}%</td>
        <td class="val">${fmtEUR(a.mprAmount)}</td>
        <td><span class="badge-green">${monthlySavingsBadge({ ...input, totalCostHT: a.costHT, resteACharge: a.costHT - a.mprAmount, roi: input.roi })}</span></td>
      </tr>`;
    })
    .join("");
}

function optionalBlock(title: string, inner: string): string {
  return `<div class="card"><p class="label">SECTION</p><h2 class="h2">${escapeHtml(title)}</h2>${inner}</div>`;
}

export function buildRenovationReportPremiumHtml(input: RenovationReportInput, dossierRef: string): string {
  const advisor = escapeHtml(input.advisorName || "—");
  const advisorCo = escapeHtml(input.advisorCompany || COMPANY.name);
  const client = escapeHtml(input.clientName || "Client");
  const addr = escapeHtml(input.clientAddress || "—");
  const dateStr = escapeHtml(input.reportDate || new Date().toISOString().split("T")[0]);
  const footerHtml = () =>
    `<div class="footer">
      ${escapeHtml(COMPANY.name)} — ${escapeHtml(COMPANY.address)} — ${escapeHtml(COMPANY.phone)}<br/>
      SIRET ${escapeHtml(COMPANY.siret)} — ${escapeHtml(COMPANY.rcs)} — Capital ${escapeHtml(COMPANY.capital)}
    </div>`;
  const supAlert =
    input.mprProfile === "SUP"
      ? `<div class="alert-orange"><strong>Profil SUP :</strong> pas d’aide MaPrimeRénov’ en parcours « gestes » — vérifier l’éligibilité au parcours accompagné uniquement.</div>`
      : "";

  const pv = input.calepinagePv
    ? `<p><span class="label">PV</span><span class="val-strong">Toiture ${input.calepinagePv.form.surfaceToiture} m² — ${escapeHtml(input.calepinagePv.form.orientation)} — ${input.calepinagePv.form.inclinaison}° — ${input.calepinagePv.computed.puissanceCrete} kWc</span></p>`
    : `<p class="muted">Non renseigné.</p>`;

  const pac = input.dimensionnementPac
    ? `<p><span class="label">PAC</span><span class="val-strong">${input.dimensionnementPac.computed.puissanceRecommandee} kW — ${escapeHtml(input.dimensionnementPac.computed.modeleSuggere)}</span></p>`
    : `<p class="muted">Non renseigné.</p>`;

  const menu = input.metragesFenetres
    ? `<p><span class="label">Métrages</span><span class="val-strong">${input.metragesFenetres.computed.grandTotal} m² (total)</span></p>`
    : `<p class="muted">Non renseigné.</p>`;

  const annexPages = Array.from({ length: 13 }, (_, i) => i + 23).map(
    (n) => `
  <div class="page">
    <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page ${n} / 35</span></div>
    <div class="header">
      <div class="logo">${escapeHtml(COMPANY.name)}</div>
      <div class="hdr-right">
        <div>${escapeHtml(COMPANY.address)}</div>
        <div>${escapeHtml(COMPANY.phone)}</div>
      </div>
    </div>
    <div class="card">
      <p class="label">ANNEXE TECHNIQUE</p>
      <h2 class="h2">Annexe ${n - 22}</h2>
      <p class="muted">Détail technique, schémas et références réglementaires — document indicatif.</p>
      <ul class="list">
        <li>Estimatif non contractuel</li>
        <li>Aides à valider selon revenus réels</li>
        <li>Les travaux ne peuvent démarrer qu’après validation officielle ANAH</li>
        <li>Validité du rapport : 3 mois</li>
      </ul>
    </div>
    ${footerHtml()}
  </div>`
  );

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', system-ui, sans-serif; color: #111; background: #f4f4f5; font-size: 11pt; }
  .page { page-break-after: always; break-after: page; padding: 0 0 14mm; min-height: 297mm; position: relative; }
  .page:last-child { page-break-after: auto; }
  .header {
    background: #1a2744; color: #fff; padding: 14mm 12mm 10mm;
    display: flex; justify-content: space-between; align-items: flex-start;
  }
  .logo { font-weight: 800; font-size: 15pt; letter-spacing: .02em; max-width: 55%; }
  .hdr-right { text-align: right; font-size: 9pt; line-height: 1.45; opacity: .95; }
  .subbar {
    background: #dbeafe; color: #1a2744; padding: 6px 12mm; font-size: 8.5pt;
    display: flex; justify-content: space-between; border-bottom: 1px solid #bfdbfe;
  }
  .wrap { padding: 8mm 12mm 0; }
  .card {
    background: #fff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 12px 14px; margin-bottom: 10px;
    box-shadow: 0 1px 2px rgba(0,0,0,.04);
  }
  .label { font-size: 7.5pt; letter-spacing: .08em; text-transform: uppercase; color: #71717a; margin: 0 0 4px; }
  .val-strong { font-weight: 700; font-size: 11pt; }
  .h2 { margin: 0 0 8px; font-size: 13pt; color: #1a2744; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .dpe-gauge { display: flex; gap: 5px; flex-wrap: wrap; margin: 8px 0; align-items: flex-start; }
  .dpe-col { display: flex; flex-direction: column; align-items: center; width: 38px; }
  .dpe-cell { width: 100%; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 10pt; }
  .dpe-kwh { font-size: 5.5pt; text-align: center; color: #52525b; line-height: 1.15; margin-top: 2px; max-width: 38px; }
  .dpe-kwh-sub { font-size: 5pt; color: #71717a; }
  .dpe-legend { font-size: 9pt; margin: 0; color: #52525b; }
  table.data { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  table.data th { text-align: left; background: #f4f4f5; padding: 8px; border: 1px solid #e4e4e7; font-size: 7.5pt; text-transform: uppercase; color: #71717a; }
  table.data td { padding: 8px; border: 1px solid #e4e4e7; vertical-align: top; }
  .num { display: inline-flex; width: 22px; height: 22px; border-radius: 50%; background: #1a2744; color: #fff; font-size: 9pt; align-items: center; justify-content: center; font-weight: 700; margin-right: 6px; }
  .badge-green { background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 999px; font-weight: 700; font-size: 8.5pt; }
  .badge-warn { background: #ffedd5; color: #9a3412; padding: 2px 6px; border-radius: 4px; font-size: 7.5pt; margin-left: 6px; }
  .alert-orange { background: #fff7ed; border: 1px solid #fdba74; color: #9a3412; padding: 10px 12px; border-radius: 8px; margin: 8px 0; font-size: 9pt; }
  .muted { color: #71717a; font-size: 9pt; }
  .list { margin: 6px 0 0; padding-left: 18px; }
  .list li { margin-bottom: 4px; }
  .footer {
    position: absolute; left: 0; right: 0; bottom: 0; padding: 6mm 12mm;
    background: #e4e4e7; font-size: 7pt; color: #52525b; text-align: center; line-height: 1.35;
  }
  .kpi { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-top: 8px; }
  .kpi .card { margin: 0; text-align: center; }
</style>
</head>
<body>

<!-- P1 -->
<div class="page">
  <div class="header">
    <div class="logo">${escapeHtml(COMPANY.name)}<br/><span style="font-size:9pt;font-weight:400;opacity:.9">Rapport premium RénovOptim IA</span></div>
    <div class="hdr-right">
      <div><strong>Conseiller</strong><br/>${advisor}</div>
      <div style="margin-top:6px"><strong>${advisorCo}</strong></div>
      <div style="margin-top:6px">${escapeHtml(COMPANY.phone)}<br/>${escapeHtml(COMPANY.email)}</div>
    </div>
  </div>
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 1 / 35</span></div>
  <div class="wrap">
    <div class="grid2">
      <div class="card">
        <p class="label">CLIENT</p>
        <p class="val-strong">${client}</p>
        <p class="muted">${addr}</p>
        <p class="muted">${escapeHtml(input.clientEmail || "")} ${escapeHtml(input.clientPhone || "")}</p>
      </div>
      <div class="card">
        <p class="label">SYNTHÈSE FINANCIÈRE</p>
        <p><span class="label">Coût travaux HT</span><br/><span class="val-strong">${fmtEUR(input.totalCostHT)}</span></p>
        <p><span class="label">Total aides</span><br/><span class="val-strong">${fmtEUR(input.totalAides)}</span></p>
        <p><span class="label">Reste à charge</span><br/><span class="val-strong" style="color:#1a2744">${fmtEUR(input.resteACharge)}</span></p>
      </div>
    </div>
    ${supAlert}
    <div class="kpi">
      <div class="card"><p class="label">MPR</p><p class="val-strong">${fmtEUR(input.totalMpr)}</p></div>
      <div class="card"><p class="label">CEE</p><p class="val-strong">${fmtEUR(input.totalCee)}</p></div>
      <div class="card"><p class="label">Éco-PTZ</p><p class="val-strong">${fmtEUR(input.ecoPtz)}</p></div>
    </div>
    <p class="muted" style="margin-top:10px">Estimatif non contractuel — Barèmes ANAH Février 2026 — Validité 3 mois.</p>
  </div>
  ${footerHtml()}
</div>

<!-- P2 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 2 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">${advisor}<br/>${advisorCo}</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">INFORMATIONS CLIENT & LOGEMENT</p>
      <div class="grid2">
        <div><p class="label">Profil MPR</p><p class="val-strong">${escapeHtml(profileLabelFr(input.mprProfile))}</p></div>
        <div><p class="label">Revenus / occupants</p><p class="val-strong">${fmtEUR(input.annualIncome)} / ${input.occupants}</p></div>
        <div><p class="label">Zone</p><p class="val-strong">${input.isIdf ? "Île-de-France" : "Hors IDF"}</p></div>
        <div><p class="label">Parcours</p><p class="val-strong">${input.renovationType === "parcours_accompagne" ? "Accompagné" : "Monogeste"}</p></div>
      </div>
    </div>
    <div class="card">
      <p class="label">Jauge DPE</p>
      ${dpeGauge(input.dpe, input.dpeGainTarget)}
    </div>
  </div>
  ${footerHtml()}
</div>

<!-- P3 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 3 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">Contexte 2026</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">CONTEXTE RÉGLEMENTAIRE 2026</p>
      <ul class="list">
        <li>MaPrimeRénov’ — parcours accompagné vs monogeste</li>
        <li>CEE — cumul selon parcours</li>
        <li>Éco-PTZ — financement du reste à charge</li>
        <li>TVA 5,5% sur travaux éligibles</li>
      </ul>
      <p class="muted">Aides à valider selon revenus réels.</p>
    </div>
  </div>
  ${footerHtml()}
</div>

<!-- P4 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 4 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">Barèmes ANAH</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">BARÈMES MPR — ANAH FÉVRIER 2026</p>
      <p class="muted">Plafonds revenus et taux parcours accompagné (référentiel public — vérification ANAH obligatoire).</p>
    </div>
  </div>
  ${footerHtml()}
</div>

<!-- P5 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 5 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">Travaux</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">PRÉCONISATIONS DE TRAVAUX</p>
      <table class="data">
        <thead><tr><th>Travaux</th><th>Coût HT</th><th>Taux MPR</th><th>MPR</th><th>Économie / mois</th></tr></thead>
        <tbody>${workRows(input)}</tbody>
      </table>
    </div>
  </div>
  ${footerHtml()}
</div>

<!-- P6 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 6 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">MPR détaillé</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">CALCUL MPR DÉTAILLÉ</p>
      <p class="val-strong">Total MPR : ${fmtEUR(input.totalMpr)}</p>
      <p class="muted">Profil ${escapeHtml(profileLabelFr(input.mprProfile))}</p>
    </div>
  </div>
  ${footerHtml()}
</div>

<!-- P7 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 7 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">CEE</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">CEE DÉTAILLÉ</p>
      <p class="val-strong">Total CEE : ${fmtEUR(input.totalCee)}</p>
    </div>
  </div>
  ${footerHtml()}
</div>

<!-- P8 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 8 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">Éco-PTZ</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">ÉCO-PTZ & FINANCEMENT</p>
      <p class="val-strong">Plafond indicatif : ${fmtEUR(input.ecoPtz)}</p>
      <p class="muted">Les travaux ne peuvent démarrer qu’après validation officielle ANAH.</p>
    </div>
  </div>
  ${footerHtml()}
</div>

<!-- P9 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 9 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">TVA</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">TVA 5,5%</p>
      <p class="val-strong">Montant TVA économisée (estimatif) : ${fmtEUR(input.totalTva)}</p>
    </div>
  </div>
  ${footerHtml()}
</div>

<!-- P10 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 10 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">Récap</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">RÉCAPITULATIF FINANCIER GLOBAL</p>
      <table class="data">
        <tbody>
          <tr><td class="label">Coût total HT</td><td class="val-strong">${fmtEUR(input.totalCostHT)}</td></tr>
          <tr><td class="label">MPR</td><td class="val-strong">${fmtEUR(input.totalMpr)}</td></tr>
          <tr><td class="label">CEE</td><td class="val-strong">${fmtEUR(input.totalCee)}</td></tr>
          <tr><td class="label">TVA économisée</td><td class="val-strong">${fmtEUR(input.totalTva)}</td></tr>
          <tr><td class="label">Total aides</td><td class="val-strong">${fmtEUR(input.totalAides)}</td></tr>
          <tr><td class="label">Reste à charge</td><td class="val-strong">${fmtEUR(input.resteACharge)}</td></tr>
          <tr><td class="label">ROI (ans)</td><td class="val-strong">${input.roi}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  ${footerHtml()}
</div>

<!-- P11 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 11 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">PV</div></div>
  <div class="wrap">${optionalBlock("Calepinage photovoltaïque", pv)}</div>
  ${footerHtml()}
</div>

<!-- P12 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 12 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">PAC</div></div>
  <div class="wrap">${optionalBlock("Dimensionnement pompe à chaleur", pac)}</div>
  ${footerHtml()}
</div>

<!-- P13 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 13 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">Menuiseries</div></div>
  <div class="wrap">${optionalBlock("Métrages menuiseries", menu)}</div>
  ${footerHtml()}
</div>

<!-- P14 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 14 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">Planning</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">PLANNING PRÉVISIONNEL (6 PHASES)</p>
      <ol class="list">
        <li>Audit & montage dossier</li>
        <li>Instruction ANAH</li>
        <li>Consultation artisans RGE</li>
        <li>Réalisation travaux</li>
        <li>Contrôle</li>
        <li>Versement aides</li>
      </ol>
    </div>
  </div>
  ${footerHtml()}
</div>

<!-- P15 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 15 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">Valeur</div></div>
  <div class="wrap">${optionalBlock("Impact sur la valeur du bien", `<p class="muted">Gain DPE ${input.gainClasses} classe(s) — ${escapeHtml(String(input.dpe))} → ${escapeHtml(String(input.dpeGainTarget))}.</p>`)}</div>
  ${footerHtml()}
</div>

<!-- P16 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 16 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">Thermique</div></div>
  <div class="wrap">${optionalBlock("Diagnostic thermique (déperditions par poste)", `<p class="muted">Répartition indicative : toiture, murs, menuiseries, plancher, ventilation.</p>`)}</div>
  ${footerHtml()}
</div>

<!-- P17 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 17 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">Économies</div></div>
  <div class="wrap">${optionalBlock("Économies d'énergie estimées", `<p class="val-strong">Badge indicatif : <span class="badge-green">${monthlySavingsBadge(input)}</span></p>`)}</div>
  ${footerHtml()}
</div>

<!-- P18 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 18 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">Carbone</div></div>
  <div class="wrap">${optionalBlock("Bilan carbone", `<p class="muted">Estimatif — isolation & systèmes performants réduisent les émissions liées au résidentiel.</p>`)}</div>
  ${footerHtml()}
</div>

<!-- P19 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 19 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">RGE</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">ARTISANS RGE PARTENAIRES</p>
      ${ARTISANS.map(
        (a) => `<p style="margin:10px 0;border-bottom:1px solid #e4e4e7;padding-bottom:8px">
          <span class="num">✓</span> <strong>${escapeHtml(a.name)}</strong> — ${escapeHtml(a.metier)}<br/>
          <span class="muted">${escapeHtml(a.labels)} — ${escapeHtml(a.phone)} — ${escapeHtml(a.email)}</span>
        </p>`
      ).join("")}
    </div>
  </div>
  ${footerHtml()}
</div>

<!-- P20 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 20 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">MAR</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">PROCESSUS MAR</p>
      <p class="val-strong">${escapeHtml(CONTACTS.mar.name)} — ${escapeHtml(CONTACTS.mar.role)}</p>
      <p class="muted">Accompagnement, conformité, coordination des intervenants certifiés.</p>
    </div>
  </div>
  ${footerHtml()}
</div>

<!-- P21 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 21 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">Dossier</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">DOCUMENTS À FOURNIR</p>
      <ul class="list">
        <li>Avis d’imposition</li>
        <li>Titre de propriété / bail</li>
        <li>Devis RGE</li>
        <li>RIB & pièce d’identité</li>
      </ul>
    </div>
  </div>
  ${footerHtml()}
</div>

<!-- P22 -->
<div class="page">
  <div class="subbar"><span>Réf. ${escapeHtml(dossierRef)}</span><span>${dateStr}</span><span>Page 22 / 35</span></div>
  <div class="header"><div class="logo">${escapeHtml(COMPANY.name)}</div><div class="hdr-right">CG</div></div>
  <div class="wrap">
    <div class="card">
      <p class="label">CONDITIONS GÉNÉRALES</p>
      <ul class="list">
        <li>Estimatif non contractuel</li>
        <li>Aides à valider selon revenus réels</li>
        <li>Les travaux ne peuvent démarrer qu’après validation officielle ANAH</li>
        <li>Validité 3 mois</li>
        <li>Contact : ${escapeHtml(COMPANY.email)}</li>
      </ul>
    </div>
    <div class="card">
      <p class="label">CONTACTS PROJET</p>
      <p><strong>${escapeHtml(CONTACTS.amo.role)}</strong> — ${escapeHtml(CONTACTS.amo.name)} — ${escapeHtml(CONTACTS.amo.phone)}</p>
      <p><strong>${escapeHtml(CONTACTS.commercial.role)}</strong> — ${escapeHtml(CONTACTS.commercial.name)} — ${escapeHtml(CONTACTS.commercial.phone)}</p>
      <p><strong>${escapeHtml(CONTACTS.courtier.role)}</strong> — ${escapeHtml(CONTACTS.courtier.name)} — ${escapeHtml(CONTACTS.courtier.phone)}</p>
    </div>
  </div>
  ${footerHtml()}
</div>

${annexPages.join("\n")}

</body>
</html>`;
}

export async function generatePremiumRenovationPdfBuffer(input: RenovationReportInput): Promise<Buffer> {
  const dossierRef = `RO-${(input.reportDate || new Date().toISOString().split("T")[0]).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const html = buildRenovationReportPremiumHtml(input, dossierRef);

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
