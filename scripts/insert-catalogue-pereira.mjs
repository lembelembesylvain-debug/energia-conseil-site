import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PATH = path.join(__dirname, '..', 'audit-energetique-pereira-nervieux-2026.html');
const FRAGMENT = path.join(__dirname, 'catalogue-iv-pereira-fragment.html');

const h = (p, sub) => `<!-- PAGE ${p} – CATALOGUE TECHNIQUE -->
<div class="page page-compact">
  <header>
    <div>
      <div class="logo-text">ENERGIA-CONSEIL IA®</div>
      <div style="font-size: 9px; font-weight: 600; color: var(--text-muted);">${sub}</div>
    </div>
    <div class="company-info">Réf. AUDIT-2026-PEREIRA | Page ${p}/60</div>
  </header>
`;
const f = (p) => `  <footer>ENERGIA-CONSEIL IA® — Décennale MIC Insurance N° LUNPIB2604975 — Page ${p}/60</footer>\n</div>\n`;

// Build fragment file if missing
if (!fs.existsSync(FRAGMENT)) {
  const pages = [];
  pages.push(h(16,'IV. CATALOGUE TECHNIQUE &amp; DIMENSIONNEMENT')+`
  <div class="catalogue-section-tag">Section IV — Catalogue technique</div>
  <h1>IV. Catalogue Technique &amp; Dimensionnement</h1>
  <p style="font-size:11px;color:var(--text-muted);margin-bottom:10px;">Fiches produits, schémas de pose et dimensionnements validés par <strong>Mickaël</strong> — Expert technique ENERGIA-CONSEIL IA® — pour le dossier PEREIRA (Nervieux, 164 m², pisé traditionnel).</p>
  <div class="box box-info" style="font-size:10px;"><strong>Ordre d'installation impératif :</strong> Isolation (IV.1) → Menuiseries → VMC Hygro B (IV.4) → PAC Air/Air (IV.2) → Ballon thermo (IV.4) → Photovoltaïque DualSun (IV.3). Dimensionnement PAC <em>post-isolation</em> uniquement.</div>
  <h2>IV.1 — Isolation Biosourcée (Pisé Compatible)</h2>
  <h3>Fiche technique — Laine de bois STEICO flex / PAVATEX</h3>
  <div class="catalogue-photo large"><span style="font-size:32px;margin-bottom:8px;">🌲</span><strong>Photo produit — Laine de bois 140 mm</strong><span style="font-size:9px;margin-top:4px;">assets/pereira/catalogue/laine-bois-140.jpg</span></div>
  <div class="tech-kpi-row">
    <div class="tech-kpi"><div class="tech-kpi-val">R = 3,7</div><div class="tech-kpi-label">À 14 cm (λ 0,038)</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">μ = 3–5</div><div class="tech-kpi-label">Diffusion vapeur</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">8–12 h</div><div class="tech-kpi-label">Déphasage thermique</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">ACERMI</div><div class="tech-kpi-label">Certification CE</div></div>
  </div>
  <table>
    <tr><th>Caractéristique</th><th>Valeur</th><th>Intérêt pisé</th></tr>
    <tr><td>Conductivité λ</td><td>0,036–0,042 W/m.K</td><td>Performance stable en humidité relative élevée</td></tr>
    <tr><td>Masse volumique</td><td>50–65 kg/m³</td><td>Légèreté — pas de surcharge mur pisé</td></tr>
    <tr><td>Capacité thermique</td><td>2 100 J/kg.K</td><td>Inertie complémentaire — confort été</td></tr>
    <tr><td>Comportement hygro</td><td>Hygroscopique, perméable</td><td>Régulation humidité mur terre</td></tr>
    <tr><td>Épaisseur retenue</td><td><strong>140 mm</strong></td><td>R ≥ 3,7 — conforme RT2012</td></tr>
    <tr><td>Surface ITI</td><td><strong>~260 m²</strong></td><td>4 façades — Nord → Sud → Est → Ouest</td></tr>
  </table>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> Sur pisé, la laine de bois est le compromis optimal entre R thermique, respirabilité et mise en œuvre ITI. Éviter PSE en contact direct avec terre.</div>
`+f(16));

  pages.push(h(17,'IV.1 — SCHÉMA POSE ITI RESPIRANTE')+`
  <h2>IV.1 — Schéma de pose ITI respirante (sans pare-vapeur)</h2>
  <div class="catalogue-photo large"><span style="font-size:28px;">📐</span><strong>Schéma coupe mur pisé + ITI</strong><span style="font-size:9px;">assets/pereira/catalogue/schema-iti-pise.jpg</span></div>
  <div class="ascii-art" style="font-size:8px;">  EXTÉRIEUR                    INTÉRIEUR
  Enduit chaux ext.            Plaque BA13 / Fermacell
  Mur PISÉ 50–60 cm ────────── Ossature 45/145 mm
       │                    Laine de BOIS 140 mm
  ─── PAS DE PARE-VAPEUR ──── (INTERDIT sur pisé)</div>
  <table>
    <tr><th>Couche</th><th>Matériau</th><th>Épaisseur</th><th>Rôle</th></tr>
    <tr><td>Extérieur</td><td>Enduit chaux aérienne</td><td>15–20 mm</td><td>Protection pluie, perméabilité</td></tr>
    <tr><td>Structure</td><td>Mur pisé traditionnel</td><td>50–60 cm</td><td>Inertie + régulation hygro</td></tr>
    <tr><td>Isolation</td><td>Laine de bois</td><td>140 mm</td><td>R = 3,7 — déphasage</td></tr>
    <tr><td>Finition</td><td>Plaque + enduit intérieur</td><td>12,5 mm</td><td>Finition respirante</td></tr>
    <tr class="total-row"><td colspan="4">⚠️ PARE-VAPEUR INTERDIT — Condensation = dégradation pisé</td></tr>
  </table>
  <div class="danger-box" style="font-size:10px;"><strong class="text-red">🚨 INTERDIT :</strong> Pare-vapeur PE/Alu · Enduit ciment · Polystyrène collé</div>
`+f(17));

  pages.push(h(18,'IV.1 — CONFORT ÉTÉ / HIVER')+`
  <h2>IV.1 — Déphasage thermique &amp; confort saisonnier</h2>
  <div class="cols2">
    <div class="card" style="border-top:3px solid #0369a1;"><strong style="color:#0369a1;">❄️ HIVER</strong><ul style="font-size:10px;padding-left:14px;"><li>Déperditions murs <strong>28 % → 8 %</strong></li><li>Température homogène ±1 °C</li><li>Facture chauffage <strong>-65 %</strong></li></ul></div>
    <div class="card" style="border-top:3px solid #d97706;"><strong style="color:#d97706;">☀️ ÉTÉ</strong><ul style="font-size:10px;padding-left:14px;"><li>Déphasage <strong>8–12 h</strong></li><li>Surchauffe Ouest <strong>-4 à -6 °C</strong></li><li>PAC réversible mode froid</li></ul></div>
  </div>
  <div class="catalogue-photo"><span style="font-size:24px;">📊</span><strong>Graphique déphasage — laine de bois vs minérale</strong></div>
  <table>
    <tr><th>Paramètre</th><th>Laine de bois</th><th>Laine minérale</th><th>Avantage pisé</th></tr>
    <tr><td>Déphasage</td><td><strong>8–12 h</strong></td><td>4–6 h</td><td>Confort été</td></tr>
    <tr><td>μ</td><td><strong>3–5</strong></td><td>1–2</td><td>Compatible terre</td></tr>
    <tr><td>Capacité thermique</td><td><strong>2 100 J/kg.K</strong></td><td>800</td><td>Inertie</td></tr>
  </table>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> Déphasage bois + inertie pisé = confort été sans climatisation systématique.</div>
`+f(18));

  pages.push(h(19,'IV.1 — COMBLES &amp; CHANVRE-LIME')+`
  <h2>IV.1 — Compléments isolation biosourcée</h2>
  <div class="catalogue-photo"><span style="font-size:28px;">🌿</span><strong>Chanvre-lime TRADICAL — zones humides</strong></div>
  <table>
    <tr><th>Poste</th><th>Matériau</th><th>R</th><th>Surface</th></tr>
    <tr><td>ITI zones humides</td><td>Chanvre-lime</td><td>R ≈ 2,5</td><td>~30 m²</td></tr>
    <tr><td>Combles perdus</td><td>Ouate / laine roche</td><td>R ≥ 8</td><td>164 m²</td></tr>
    <tr><td>Plancher bas</td><td>PSE sous solivage</td><td>R ≥ 3</td><td>164 m²</td></tr>
  </table>
  <div class="garantie-banner"><div style="font-size:10px;opacity:.8;">GARANTIE ISOLANT BIOSOURCÉ</div><div class="g-val">30 à 40 ans</div></div>
`+f(19));

  pages.push(h(20,'IV.1 — SYNTHÈSE ISOLATION')+`
  <h2>IV.1 — Synthèse isolation PEREIRA</h2>
  <table>
    <tr><th>Zone</th><th>Matériau</th><th>R</th><th>Surface</th><th>Priorité</th></tr>
    <tr><td>Combles</td><td>Ouate / laine roche</td><td>R ≥ 8</td><td>164 m²</td><td class="text-red">★★★★★</td></tr>
    <tr><td>Murs pisé ITI</td><td>Laine de bois 140 mm</td><td>R ≥ 3,7</td><td>260 m²</td><td class="text-red">★★★★★</td></tr>
    <tr><td>Plancher bas</td><td>PSE 100 mm</td><td>R ≥ 3</td><td>164 m²</td><td>★★★★☆</td></tr>
    <tr class="total-row"><td colspan="3">Gain déperditions murs</td><td colspan="2"><strong>-72 %</strong></td></tr>
  </table>
  <div class="grid-garanties">
    <div class="garantie-card"><div style="font-size:20px;font-weight:800;color:var(--primary);">30–40 ans</div>Isolant biosourcé</div>
    <div class="garantie-card"><div style="font-size:20px;font-weight:800;color:var(--primary);">10 ans</div>Décennale RGE</div>
    <div class="garantie-card"><div style="font-size:20px;font-weight:800;color:var(--primary);">MIC</div>LUNPIB2604975</div>
    <div class="garantie-card"><div style="font-size:20px;font-weight:800;color:var(--primary);">ACERMI</div>Certification</div>
  </div>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> ITI complète = PAC 12 kW au lieu de 18–20 kW. Économie : <strong>4 000–6 000 €</strong>.</div>
`+f(20));

  pages.push(h(21,'IV.2 — PAC ENPHASE / AIR-AIR')+`
  <h2>IV.2 — Pompe à Chaleur Enphase / Air-Air</h2>
  <h3>Unité extérieure 12 kW Inverter R32</h3>
  <div class="catalogue-photo large dark"><span style="font-size:36px;">❄️</span><strong style="color:#e2e8f0;">Photo UE PAC 12 kW</strong><span style="font-size:9px;color:#64748b;">assets/pereira/catalogue/pac-12kw.jpg</span></div>
  <div class="tech-kpi-row">
    <div class="tech-kpi"><div class="tech-kpi-val">12 kW</div><div class="tech-kpi-label">Puissance</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">SCOP ≥ 3,5</div><div class="tech-kpi-label">Chauffage</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">SEER ≥ 6</div><div class="tech-kpi-label">Froid</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">R32</div><div class="tech-kpi-label">Fluide</div></div>
  </div>
  <table>
    <tr><th>Caractéristique</th><th>Valeur</th></tr>
    <tr><td>Marque</td><td>Mitsubishi / Daikin / Atlantic — Rhône Génie Climatique RGE</td></tr>
    <tr><td>Plage fonctionnement</td><td>-15 °C à +46 °C</td></tr>
    <tr><td>Niveau sonore</td><td>≤ 55 dB(A)</td></tr>
    <tr><td>Emplacement</td><td>Mur Nord ou Est</td></tr>
  </table>
  <span class="product-badge">RGE QualiPAC</span><span class="product-badge gold">Garantie 5 ans</span>
`+f(21));

  pages.push(h(22,'IV.2 — SPLITS MURAUX DESIGN')+`
  <h2>IV.2 — Splits muraux design (×5)</h2>
  <div class="catalogue-photo large"><span style="font-size:32px;">🏠</span><strong>Split mural design blanc / argent</strong></div>
  <table>
    <tr><th>Pièce</th><th>Puissance</th><th>Volume</th><th>Orientation</th></tr>
    <tr><td>Séjour / Salon</td><td><strong>3,5 kW</strong></td><td>~55 m³</td><td>Sud</td></tr>
    <tr><td>Cuisine</td><td><strong>2,5 kW</strong></td><td>~35 m³</td><td>Est</td></tr>
    <tr><td>Chambre parentale</td><td><strong>2,5 kW</strong></td><td>~35 m³</td><td>Ouest</td></tr>
    <tr><td>Chambre 2</td><td><strong>2,0 kW</strong></td><td>~28 m³</td><td>Nord</td></tr>
    <tr><td>Chambre 3 / Bureau</td><td><strong>2,0 kW</strong></td><td>~28 m³</td><td>Nord</td></tr>
    <tr class="total-row"><td><strong>Total</strong></td><td><strong>12,5 kW</strong></td><td colspan="2">5 unités — 164 m²</td></tr>
  </table>
  <div class="cols2" style="font-size:10px;">
    <div class="card"><strong>Design</strong><ul style="padding-left:14px;"><li>Blanc mat / argent</li><li>Mode nuit &lt; 22 dB</li><li>Wi-Fi option</li></ul></div>
    <div class="card"><strong>Fonctions</strong><ul style="padding-left:14px;"><li>Chauff / froid réversible</li><li>Filtration air</li><li>Déshumidification</li></ul></div>
  </div>
`+f(22));

  pages.push(h(23,'IV.2 — DIMENSIONNEMENT 164 m²')+`
  <h2>IV.2 — Dimensionnement PAC — 164 m² / 410 m³</h2>
  <div class="box box-info" style="font-size:10px;"><strong>Formule :</strong> P = 164 × 0,04 × 1,15 = <strong>7,5 kW</strong> → retenu <strong>12 kW</strong> (marge + froid été)</div>
  <table>
    <tr><th>Paramètre</th><th>AVANT isolation</th><th>APRÈS isolation</th><th>Retenu</th></tr>
    <tr><td>Coefficient G</td><td>1,2–1,5</td><td>0,35–0,45</td><td>0,40</td></tr>
    <tr><td>Besoin chauffage</td><td>18–20 kW</td><td>6,5–8 kW</td><td><strong>7,5 kW</strong></td></tr>
    <tr><td>PAC installée</td><td>—</td><td>—</td><td><strong>12 kW UE</strong></td></tr>
    <tr><td>Volume chauffé</td><td colspan="3">164 m² × 2,5 m = <strong>410 m³</strong> — 5 zones</td></tr>
    <tr><td>ΔT base -7 °C</td><td colspan="3"><strong>27 K</strong></td></tr>
  </table>
  <div class="catalogue-photo"><span style="font-size:24px;">🗺️</span><strong>Plan répartition 5 splits</strong></div>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> Sans ITI = PAC 18–20 kW (+4 000–6 000 €). Installation semaine 11.</div>
`+f(23));

  pages.push(h(24,'IV.2 — GARANTIES PAC')+`
  <h2>IV.2 — Couplage Enphase &amp; garanties PAC</h2>
  <div class="ascii-art" style="font-size:8px;">  ☀ DualSun ──► Enphase IQ8 ──► Tableau électrique
                    ├── PAC 12 kW (priorité 1)
                    ├── Ballon thermo (priorité 2)
                    └── VMC + auxiliaires</div>
  <table>
    <tr><th>Élément</th><th>Spécification</th><th>Garantie</th></tr>
    <tr><td>UE 12 kW</td><td>Inverter R32 QualiPAC</td><td><strong>5 ans</strong></td></tr>
    <tr><td>Splits ×5</td><td>Design &lt; 22 dB</td><td><strong>5 ans</strong></td></tr>
    <tr><td>Pose RGE</td><td>Rhône Génie Climatique</td><td><strong>10 ans</strong> MIC</td></tr>
    <tr><td>Compresseur</td><td>Inverter</td><td><strong>7 ans</strong></td></tr>
  </table>
  <div class="garantie-banner"><div class="g-val">MIC Insurance</div><div style="font-size:10px;">N° LUNPIB2604975</div></div>
`+f(24));

  pages.push(h(25,'IV.3 — DUALSUN BIFACIAL PREMIUM')+`
  <h2>IV.3 — DualSun Bifacial Premium — SPRING 375 Wc</h2>
  <div class="catalogue-photo large dark"><span style="font-size:40px;">☀️</span><strong style="color:#fbbf24;">Panneau DualSun Bifacial</strong></div>
  <div class="tech-kpi-row">
    <div class="tech-kpi"><div class="tech-kpi-val">375 Wc</div><div class="tech-kpi-label">Unitaire</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">+30 %</div><div class="tech-kpi-label">Bifacial</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">6 kWc</div><div class="tech-kpi-label">Total</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">30–40 ans</div><div class="tech-kpi-label">Garantie</div></div>
  </div>
  <table>
    <tr><th>Caractéristique</th><th>Valeur</th></tr>
    <tr><td>Technologie</td><td>PERC bifacial — captation arrière</td></tr>
    <tr><td>Rendement</td><td>≥ 21,5 %</td></tr>
    <tr><td>Panneaux</td><td><strong>16 × 375 Wc = 6 kWc</strong></td></tr>
    <tr><td>Production Loire H1</td><td><strong>6 600–7 200 kWh/an</strong></td></tr>
    <tr><td>Toiture</td><td>~40 m² — 3 pans S+E+O</td></tr>
  </table>
  <span class="product-badge gold">Garantie 30 ans produit</span><span class="product-badge gold">40 ans performance</span>
`+f(25));

  pages.push(h(26,'IV.3 — RENDEMENT BIFACIAL +30 %')+`
  <h2>IV.3 — Technologie bifaciale +30 %</h2>
  <div class="catalogue-photo large"><span style="font-size:28px;">🔆</span><strong>Schéma principe bifacial</strong></div>
  <table>
    <tr><th>Pan</th><th>Orientation</th><th>Gain</th><th>Production</th></tr>
    <tr><td>Sud</td><td>180°</td><td>+20–25 %</td><td>~3 400 kWh/an</td></tr>
    <tr><td>Est</td><td>90°</td><td>+22 %</td><td>~1 600 kWh/an</td></tr>
    <tr><td>Ouest</td><td>270°</td><td>+22 %</td><td>~1 500 kWh/an</td></tr>
    <tr class="total-row"><td colspan="2"><strong>6 kWc bifacial</strong></td><td><strong>+30 %</strong></td><td><strong>~6 500 kWh/an</strong></td></tr>
  </table>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> 3 pans = production étalée — idéal autoconsommation PAC + ballon.</div>
`+f(26));

  pages.push(h(27,'IV.3 — MICRO-ONDULEURS ENPHASE')+`
  <h2>IV.3 — Micro-onduleurs Enphase IQ8+ / IQ8M</h2>
  <div class="catalogue-photo large dark"><span style="font-size:32px;">⚡</span><strong style="color:#60a5fa;">Enphase IQ8</strong></div>
  <table>
    <tr><th>Caractéristique</th><th>Valeur</th></tr>
    <tr><td>Architecture</td><td>1 micro-onduleur / panneau (×16)</td></tr>
    <tr><td>Puissance AC</td><td>290–330 VA</td></tr>
    <tr><td>Rendement</td><td>≥ 97 %</td></tr>
    <tr><td>Communication</td><td>PLC + Wi-Fi Envoy</td></tr>
    <tr><td>MPPT</td><td>Individuel par panneau</td></tr>
  </table>
  <div class="garantie-banner"><div style="font-size:10px;opacity:.8;">GARANTIE ENPHASE</div><div class="g-val">25 ans</div></div>
  <div class="cols2" style="font-size:10px;">
    <div class="card"><strong>Avantages</strong><ul style="padding-left:14px;"><li>Pas de SPOF</li><li>Ombrage optimisé</li><li>Extension modulaire</li></ul></div>
    <div class="card"><strong>Envoy S</strong><ul style="padding-left:14px;"><li>Wi-Fi monitoring</li><li>Mesure conso + prod</li><li>Alertes temps réel</li></ul></div>
  </div>
`+f(27));

  pages.push(h(28,'IV.3 — MONITORING ENLIGHTEN')+`
  <h2>IV.3 — Application Enphase Enlighten</h2>
  <div class="catalogue-photo large"><span style="font-size:48px;">📱</span><strong>App Enlighten — production temps réel</strong></div>
  <table>
    <tr><th>Fonction</th><th>Description</th><th>Bénéfice</th></tr>
    <tr><td>Production live</td><td>kW temps réel / panneau</td><td>Visibilité</td></tr>
    <tr><td>Historique</td><td>Jour / mois / an — CSV</td><td>ROI solaire</td></tr>
    <tr><td>Autoconsommation</td><td>% auto vs injecté</td><td>Optimisation</td></tr>
    <tr><td>Alertes</td><td>Panne défaillant</td><td>Intervention rapide</td></tr>
    <tr><td>CO₂ évité</td><td>Cumul kg CO₂</td><td>Empreinte carbone</td></tr>
  </table>
  <div class="box box-info" style="font-size:10px;"><strong>PEREIRA :</strong> 6 600 kWh × 70 % auto = <strong>4 620 kWh</strong> — économie <strong>1 100–1 300 €/an</strong>.</div>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> Formation client à Enlighten lors de la réception S12.</div>
`+f(28));

  pages.push(h(29,'IV.3 — CONFIGURATION 3 PANS')+`
  <h2>IV.3 — Implantation 3 pans — 6 kWc</h2>
  <div class="catalogue-photo large"><span style="font-size:28px;">🏠</span><strong>Schéma toiture 16 panneaux</strong></div>
  <table>
    <tr><th>Pan</th><th>Orient.</th><th>Panneaux</th><th>kWc</th><th>kWh/an</th></tr>
    <tr><td>Sud principal</td><td>180°</td><td>8</td><td>3,0</td><td>~3 400</td></tr>
    <tr><td>Est</td><td>90°</td><td>4</td><td>1,5</td><td>~1 600</td></tr>
    <tr><td>Ouest</td><td>270°</td><td>4</td><td>1,5</td><td>~1 500</td></tr>
    <tr class="total-row"><td><strong>Total</strong></td><td>3 pans</td><td><strong>16</strong></td><td><strong>6,0</strong></td><td><strong>~6 500</strong></td></tr>
  </table>
  <div class="grid-garanties">
    <div class="garantie-card" style="background:#fef3c7;"><div style="font-size:18px;font-weight:800;color:#d97706;">30 ans</div>DualSun produit</div>
    <div class="garantie-card" style="background:#fef3c7;"><div style="font-size:18px;font-weight:800;color:#d97706;">40 ans</div>Performance</div>
    <div class="garantie-card"><div style="font-size:18px;font-weight:800;color:var(--primary);">25 ans</div>Enphase</div>
    <div class="garantie-card"><div style="font-size:18px;font-weight:800;color:var(--primary);">10 ans</div>MIC pose</div>
  </div>
`+f(29));

  pages.push(h(30,'IV.4 — BALLON THERMODYNAMIQUE')+`
  <h2>IV.4 — Ballon Thermodynamique 200 L</h2>
  <div class="catalogue-photo large"><span style="font-size:36px;">💧</span><strong>Ballon thermo sur socle</strong></div>
  <div class="tech-kpi-row">
    <div class="tech-kpi"><div class="tech-kpi-val">200 L</div><div class="tech-kpi-label">Capacité</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">COP ≥ 2,5</div><div class="tech-kpi-label">ECS</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">-70 %</div><div class="tech-kpi-label">vs cumulus</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">RGE</div><div class="tech-kpi-label">QualiPAC</div></div>
  </div>
  <table>
    <tr><th>Caractéristique</th><th>Valeur</th></tr>
    <tr><td>Type</td><td>Thermodynamique air ambiant</td></tr>
    <tr><td>Capacité</td><td><strong>200 L</strong> — 4–5 personnes</td></tr>
    <tr><td>Consommation</td><td><strong>800–1 000 kWh/an</strong> vs 3 500</td></tr>
    <tr><td>Emplacement</td><td>Buanderie — air ≥ 5 m³</td></tr>
    <tr><td>Installation</td><td>Semaine 11 — post-VMC</td></tr>
  </table>
  <span class="product-badge">MPR 1 200 € (Bleu)</span><span class="product-badge">CEE 100–150 €</span>
`+f(30));

  pages.push(h(31,'IV.4 — GAINS ECS')+`
  <h2>IV.4 — Gains eau chaude sanitaire</h2>
  <table>
    <tr><th>Poste</th><th>AVANT</th><th>APRÈS</th><th>Gain</th></tr>
    <tr><td>Conso ECS</td><td>~3 500 kWh/an</td><td>~900 kWh/an</td><td><strong>-74 %</strong></td></tr>
    <tr><td>Coût ECS</td><td>~770 €/an</td><td>~200 €/an</td><td><strong>-570 €/an</strong></td></tr>
    <tr><td>CO₂ ECS</td><td>~0,7 t/an</td><td>~0,15 t/an</td><td><strong>-79 %</strong></td></tr>
  </table>
  <div class="catalogue-photo"><span style="font-size:24px;">📈</span><strong>Graphique ECS avant/après</strong></div>
  <div class="cols2" style="font-size:10px;">
    <div class="card" style="border-top:3px solid var(--primary);"><strong>Couplage DualSun</strong><p>Chauffe en journée 10 h–16 h — surplus PV valorisé.</p></div>
    <div class="card" style="border-top:3px solid var(--orange);"><strong>4–5 personnes</strong><p>200 L = 40 L/pers/jour à 55 °C.</p></div>
  </div>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> Poste #7 ordre optimal — après PAC. Jamais avant isolation.</div>
`+f(31));

  pages.push(h(32,'IV.4 — VMC HYGRO B')+`
  <h2>IV.4 — VMC Hygroréglable type B</h2>
  <div class="catalogue-photo large"><span style="font-size:32px;">🌀</span><strong>Centrale VMC Hygro B</strong></div>
  <table>
    <tr><th>Caractéristique</th><th>Valeur</th></tr>
    <tr><td>Type</td><td>Simple flux hygroréglable <strong>type B</strong></td></tr>
    <tr><td>Débit max</td><td>150–200 m³/h</td></tr>
    <tr><td>Cuisine</td><td>75–135 m³/h</td></tr>
    <tr><td>SdB / WC</td><td>15–30 m³/h chacune</td></tr>
    <tr><td>Consommation</td><td>15–30 W — ~50 €/an</td></tr>
    <tr><td>Installation</td><td><strong>Semaine 10</strong></td></tr>
  </table>
  <div class="box box-warn" style="font-size:10px;"><strong>Pisé :</strong> Renouvellement d'air sans assécher le bâti. Indispensable post-ITI.</div>
  <span class="product-badge">MPR 2 000 € (Bleu)</span><span class="product-badge">CEE 400–600 €</span>
`+f(32));

  pages.push(h(33,'IV.4 — SCHÉMA VENTILATION')+`
  <h2>IV.4 — Schéma ventilation — 164 m²</h2>
  <div class="ascii-art" style="font-size:7.5px;">  ENTREES D'AIR                    EXTRACTION
  Chambres / Salon ──────────────► SdB (hygro)
  Bureau ────────────────────────► Cuisine (135 m³/h)
                                   WC (2× 15 m³/h)
                                        │
                                   CENTRALE VMC
                                   Rejet façade Nord</div>
  <div class="catalogue-photo"><span style="font-size:24px;">📐</span><strong>Plan réseau aéraulique</strong></div>
  <table>
    <tr><th>Pièce</th><th>Type</th><th>Nominal</th><th>Max hygro</th></tr>
    <tr><td>Cuisine</td><td>Extraction</td><td>45 m³/h</td><td>135 m³/h</td></tr>
    <tr><td>SdB 1 &amp; 2</td><td>Extraction</td><td>15 m³/h</td><td>30 m³/h</td></tr>
    <tr><td>WC</td><td>Extraction</td><td>15 m³/h</td><td>30 m³/h</td></tr>
    <tr><td>Chambres + séjour</td><td>Entrées d'air</td><td colspan="2">Auto-régulation</td></tr>
  </table>
`+f(33));

  pages.push(h(34,'IV — SYNTHÈSE ORDRE OPTIMAL')+`
  <h2>IV — Synthèse catalogue &amp; ordre d'installation</h2>
  <table>
    <tr><th>N°</th><th>Équipement</th><th>Section</th><th>Semaine</th></tr>
    <tr><td>1</td><td>Combles R ≥ 8</td><td>IV.1</td><td>S3–S4</td></tr>
    <tr><td>2</td><td>ITI laine de bois</td><td>IV.1</td><td>S5–S7</td></tr>
    <tr><td>3</td><td>Plancher bas</td><td>IV.1</td><td>S3–S4</td></tr>
    <tr><td>4</td><td>Menuiseries ×21</td><td>—</td><td>S8–S9</td></tr>
    <tr><td>5</td><td>VMC Hygro B</td><td>IV.4</td><td>S10</td></tr>
    <tr><td>6</td><td>PAC 12 kW + 5 splits</td><td>IV.2</td><td>S11</td></tr>
    <tr><td>7</td><td>Ballon thermo 200 L</td><td>IV.4</td><td>S11</td></tr>
    <tr><td>8</td><td>DualSun 6 kWc + Enphase</td><td>IV.3</td><td>S11–S12</td></tr>
  </table>
  <div class="danger-box" style="font-size:10px;"><strong class="text-red">🚨 ORDRE IMPÉRATIF</strong> — PAC avant isolation = +4 000–6 000 €</div>
  <div class="mickael-box"><strong class="text-blue">Validation Mickaël :</strong> Dimensionnements validés pour profil post-rénovation PEREIRA.</div>
`+f(34));

  pages.push(h(35,'IV — RÉCAPITULATIF GARANTIES')+`
  <h2>IV — Récapitulatif garanties équipements</h2>
  <div class="grid-garanties" style="grid-template-columns:repeat(3,1fr);">
    <div class="garantie-card" style="padding:16px;background:#fef3c7;border:2px solid #d97706;"><div style="font-size:11px;font-weight:700;color:#92400e;">DUALSUN</div><div style="font-size:28px;font-weight:800;color:#d97706;">30–40 ans</div></div>
    <div class="garantie-card" style="padding:16px;background:#eff6ff;border:2px solid var(--secondary);"><div style="font-size:11px;font-weight:700;color:var(--secondary);">ENPHASE</div><div style="font-size:28px;font-weight:800;color:var(--secondary);">25 ans</div></div>
    <div class="garantie-card" style="padding:16px;background:#f0fdf4;border:2px solid var(--primary);"><div style="font-size:11px;font-weight:700;color:var(--primary);">MIC</div><div style="font-size:28px;font-weight:800;color:var(--primary);">10 ans</div></div>
  </div>
  <table style="margin-top:14px;">
    <tr><th>Équipement</th><th>Garantie produit</th><th>Garantie pose</th><th>Artisan</th></tr>
    <tr><td>Laine de bois ITI</td><td>30–40 ans</td><td>10 ans</td><td>Région Isolation</td></tr>
    <tr><td>PAC + splits</td><td>5–7 ans</td><td>10 ans MIC</td><td>Rhône Génie Clim.</td></tr>
    <tr><td>DualSun 6 kWc</td><td>30–40 ans</td><td>10 ans</td><td>Réseau PV</td></tr>
    <tr><td>Enphase ×16</td><td>25 ans</td><td>Incluse</td><td>Certifié Enphase</td></tr>
    <tr><td>Ballon 200 L</td><td>5 ans</td><td>10 ans</td><td>Rhône Génie Clim.</td></tr>
    <tr><td>VMC Hygro B</td><td>2 ans</td><td>10 ans</td><td>Rhône Génie Clim.</td></tr>
  </table>
  <div class="box box-info" style="font-size:10px;margin-top:12px;"><strong>Expert :</strong> Mickaël — ENERGIA-CONSEIL IA® · Validé 12/07/2026 · Suite : <strong>V. Les 3 Scénarios</strong></div>
`+f(35));

  fs.writeFileSync(FRAGMENT, pages.join('\n'), 'utf8');
  console.log('Fragment written:', FRAGMENT);
}

let content = fs.readFileSync(PATH, 'utf8');
if (content.includes('IV. Catalogue Technique')) {
  console.log('Already inserted');
  process.exit(0);
}

// Renumber old pages 16-21 -> 36-41 (reverse)
for (let n = 21; n >= 16; n--) {
  const nn = n + 20;
  content = content.replaceAll(`Page ${n}/60`, `Page ${nn}/60`);
  content = content.replaceAll(`<!-- PAGE ${n} `, `<!-- PAGE ${nn} `);
}

// Renumber sections
const sections = [
  ['<h1>III. Les 3 Scénarios de Rénovation</h1>', '<h1>V. Les 3 Scénarios de Rénovation</h1>'],
  ['<h1>IV. Détail des Travaux par Lot</h1>', '<h1>VI. Détail des Travaux par Lot</h1>'],
  ['<h1>V. Aides Financières 2026</h1>', '<h1>VII. Aides Financières 2026</h1>'],
  ['<h1>VI. Plan de Financement &amp; Délais</h1>', '<h1>VIII. Plan de Financement &amp; Délais</h1>'],
  ['<h1>VII. Option Solaire DualSun Premium</h1>', '<h1>IX. Option Solaire DualSun Premium</h1>'],
  ['<h1>VIII. Planning &amp; Engagement</h1>', '<h1>X. Planning &amp; Engagement</h1>'],
];
for (const [a, b] of sections) content = content.replaceAll(a, b);

const catalogue = fs.readFileSync(FRAGMENT, 'utf8');
const marker = '<!-- PAGE 36 – LES 3 SCÉNARIOS -->';
if (!content.includes(marker)) {
  console.error('Marker not found after renumbering');
  process.exit(1);
}
content = content.replace(marker, catalogue + marker);
fs.writeFileSync(PATH, content, 'utf8');
console.log('Done. Pages 16-35 catalogue inserted.');
