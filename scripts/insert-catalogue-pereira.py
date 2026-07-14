# -*- coding: utf-8 -*-
"""Insert Section IV Catalogue Technique pages 16-35 into PEREIRA audit."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "audit-energetique-pereira-nervieux-2026.html"


def page_header(p: int, subtitle: str) -> str:
    return f"""<!-- PAGE {p} – CATALOGUE TECHNIQUE -->
<div class="page page-compact">
  <header>
    <div>
      <div class="logo-text">ENERGIA-CONSEIL IA®</div>
      <div style="font-size: 9px; font-weight: 600; color: var(--text-muted);">{subtitle}</div>
    </div>
    <div class="company-info">Réf. AUDIT-2026-PEREIRA | Page {p}/60</div>
  </header>
"""


def page_footer(p: int) -> str:
    return (
        f'  <footer>ENERGIA-CONSEIL IA® — Décennale MIC Insurance N° LUNPIB2604975 — '
        f"Page {p}/60</footer>\n</div>\n"
    )


def build_pages() -> str:
  pages: list[str] = []

  pages.append(page_header(16, "IV. CATALOGUE TECHNIQUE &amp; DIMENSIONNEMENT") + """
  <div class="catalogue-section-tag">Section IV — Catalogue technique</div>
  <h1>IV. Catalogue Technique &amp; Dimensionnement</h1>
  <p style="font-size:11px;color:var(--text-muted);margin-bottom:10px;">Fiches produits, schémas de pose et dimensionnements validés par <strong>Mickaël</strong> — Expert technique ENERGIA-CONSEIL IA® — pour le dossier PEREIRA (Nervieux, 164 m², pisé traditionnel).</p>
  <div class="box box-info" style="font-size:10px;"><strong>Ordre d'installation impératif :</strong> Isolation (IV.1) → Menuiseries → VMC Hygro B (IV.4) → PAC Air/Air (IV.2) → Ballon thermo (IV.4) → Photovoltaïque DualSun (IV.3). Dimensionnement PAC <em>post-isolation</em> uniquement.</div>

  <h2>IV.1 — Isolation Biosourcée (Pisé Compatible)</h2>
  <h3>Fiche technique — Laine de bois STEICO flex / PAVATEX</h3>
  <div class="catalogue-photo large">
    <span style="font-size:32px;margin-bottom:8px;">🌲</span>
    <strong>Photo produit — Laine de bois 140 mm</strong>
    <span style="font-size:9px;margin-top:4px;">assets/pereira/catalogue/laine-bois-140.jpg</span>
  </div>
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
    <tr><td>Comportement hygro</td><td>Hygroscopique, perméable</td><td>Régulation humidité mur terre — pas de condensation</td></tr>
    <tr><td>Épaisseur retenue PEREIRA</td><td><strong>140 mm</strong></td><td>R ≥ 3,7 — conforme RT2012 murs</td></tr>
    <tr><td>Surface ITI murs</td><td><strong>~260 m²</strong></td><td>4 façades — ordre Nord → Sud → Est → Ouest</td></tr>
  </table>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> Sur pisé, la laine de bois est le compromis optimal entre R thermique, respirabilité et mise en œuvre ITI. Éviter polystyrène (PSE) en contact direct avec terre — risque de rétention d'humidité.</div>
""" + page_footer(16))

  pages.append(page_header(17, "IV.1 — ISOLATION BIOSOURCÉE — SCHÉMA DE POSE") + """
  <h2>IV.1 — Schéma de pose ITI respirante (sans pare-vapeur)</h2>
  <p style="font-size:11px;color:var(--text-muted);">Principe constructif validé pour murs en pisé : isolation intérieure perméable à la vapeur d'eau, sans frein-vapeur étanche. Le mur pisé reste le « régulateur » hygrométrique du bâti.</p>
  <div class="catalogue-photo large">
    <span style="font-size:28px;margin-bottom:6px;">📐</span>
    <strong>Schéma coupe mur pisé + ITI — vue détaillée</strong>
    <span style="font-size:9px;margin-top:4px;">assets/pereira/catalogue/schema-iti-pise.jpg</span>
  </div>
  <div class="ascii-art" style="font-size:8px;">  EXTÉRIEUR                    INTÉRIEUR (pièce chauffée)
  ─────────────────────────────────────────────────────────
  Enduit chaux ext.            Plaque BA13 / Fermacell
       │                              │
  Mur PISÉ 50–60 cm ────────── Ossature 45/145 mm
  (terre + chaux)                     │
       │                    Laine de BOIS 140 mm
       │                    (STEICO flex — perméable)
       │                              │
  ─── PAS DE PARE-VAPEUR ──── Frein-vapeur HYGRA (optionnel)
  ─── INTERDIT sur pisé ───── ou AUCUN frein (recommandé)
  ─────────────────────────────────────────────────────────
  Légende : Flèches vapeur ↔ traversée libre · μ mur pisé ≈ 5–15</div>
  <table>
    <tr><th>Couche (de l'ext. vers int.)</th><th>Matériau</th><th>Épaisseur</th><th>Rôle</th></tr>
    <tr><td>1 — Extérieur</td><td>Enduit chaux aérienne</td><td>15–20 mm</td><td>Protection pluie, perméabilité</td></tr>
    <tr><td>2 — Structure</td><td>Mur pisé traditionnel</td><td>50–60 cm</td><td>Inertie + régulation hygro</td></tr>
    <tr><td>3 — Isolation</td><td>Laine de bois</td><td>140 mm</td><td>R = 3,7 — déphasage thermique</td></tr>
    <tr><td>4 — Ossature</td><td>Montants 45/145 mm</td><td>—</td><td>Support isolation + gaines</td></tr>
    <tr><td>5 — Finition</td><td>Plaque + enduit intérieur</td><td>12,5 mm</td><td>Finition respirante (chaux ou plâtre)</td></tr>
    <tr class="total-row"><td colspan="4">⚠️ PARE-VAPEUR CLASSIQUE INTERDIT — Condensation dans le pisé = dégradation irréversible</td></tr>
  </table>
  <div class="danger-box" style="font-size:10px;padding:10px;">
    <strong class="text-red">🚨 INTERDIT sur pisé :</strong> Pare-vapeur PE/Alu · Enduit ciment · Polystyrène collé · Peinture glycéro étanche
  </div>
""" + page_footer(17))

  pages.append(page_header(18, "IV.1 — ISOLATION — CONFORT ÉTÉ / HIVER") + """
  <h2>IV.1 — Déphasage thermique &amp; confort saisonnier</h2>
  <div class="cols2">
    <div class="card" style="border-top:3px solid #0369a1;">
      <strong style="color:#0369a1;">❄️ Confort HIVER</strong>
      <ul style="font-size:10px;padding-left:14px;margin:6px 0;">
        <li>R = 3,7 réduit déperditions murs de <strong>28 % → 8 %</strong></li>
        <li>Ponts thermiques traités aux jonctions plancher/mur</li>
        <li>Température intérieure homogène ±1 °C</li>
        <li>Facture chauffage : <strong>-65 %</strong> post-ITI complète</li>
      </ul>
    </div>
    <div class="card" style="border-top:3px solid #d97706;">
      <strong style="color:#d97706;">☀️ Confort ÉTÉ</strong>
      <ul style="font-size:10px;padding-left:14px;margin:6px 0;">
        <li><strong>Déphasage 8–12 h</strong> : pic chaleur ext. retardé</li>
        <li>Inertie pisé + masse bois = amplitude réduite</li>
        <li>Façade Ouest : surchauffe atténuée de <strong>4–6 °C</strong></li>
        <li>Complément PAC réversible en mode froid si besoin</li>
      </ul>
    </div>
  </div>
  <div class="catalogue-photo">
    <span style="font-size:24px;">📊</span>
    <strong>Graphique déphasage thermique — laine de bois vs laine minérale</strong>
    <span style="font-size:9px;">assets/pereira/catalogue/dephasage-laine-bois.png</span>
  </div>
  <table>
    <tr><th>Paramètre</th><th>Laine de bois 14 cm</th><th>Laine minérale 14 cm</th><th>Avantage pisé</th></tr>
    <tr><td>Déphasage (heures)</td><td><strong>8–12 h</strong></td><td>4–6 h</td><td>Confort été supérieur</td></tr>
    <tr><td>μ (perméabilité)</td><td><strong>3–5</strong> (perméable)</td><td>1–2 (semi-rigide)</td><td>Compatible mur terre</td></tr>
    <tr><td>Régulation HR</td><td><strong>Absorption / restitution</strong></td><td>Faible</td><td>Préserve pisé</td></tr>
    <tr><td>Capacité thermique</td><td><strong>2 100 J/kg.K</strong></td><td>800 J/kg.K</td><td>Inertie complémentaire</td></tr>
  </table>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> Le déphasage de la laine de bois est un atout majeur pour la façade Ouest (surchauffe estivale). Combiné à l'inertie du pisé, on évite le recours systématique à la climatisation.</div>
""" + page_footer(18))

  pages.append(page_header(19, "IV.1 — ISOLATION — COMBLES &amp; CHANVRE-LIME") + """
  <h2>IV.1 — Compléments isolation biosourcée</h2>
  <h3>Chanvre-lime TRADICAL / CHANVRIBAT (zones humides)</h3>
  <div class="catalogue-photo">
    <span style="font-size:28px;">🌿</span>
    <strong>Photo — Isolant chanvre-chaux projeté</strong>
    <span style="font-size:9px;">assets/pereira/catalogue/chanvre-lime.jpg</span>
  </div>
  <table>
    <tr><th>Poste</th><th>Matériau</th><th>Épaisseur / R</th><th>Surface PEREIRA</th></tr>
    <tr><td>ITI zones humides (SdB, cuisine)</td><td>Chanvre-lime</td><td>100 mm — R ≈ 2,5</td><td>~30 m²</td></tr>
    <tr><td>Combles perdus</td><td>Laine de roche / ouate cellulose</td><td>400 mm — R ≥ 8</td><td>164 m²</td></tr>
    <tr><td>Plancher bas (cave/vide sanitaire)</td><td>PSE sous solivage</td><td>100 mm — R ≥ 3</td><td>164 m²</td></tr>
  </table>
  <h3>Isolation combles — Ouate cellulose soufflée</h3>
  <div class="tech-kpi-row">
    <div class="tech-kpi"><div class="tech-kpi-val">R ≥ 8</div><div class="tech-kpi-label">À 40 cm</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">30 %</div><div class="tech-kpi-label">Déperditions traitées</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">2–3 j</div><div class="tech-kpi-label">Durée chantier</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">Poste #1</div><div class="tech-kpi-label">Ordre optimal</div></div>
  </div>
  <div class="box box-warn" style="font-size:10px;">
    <strong>Jonctions sablières :</strong> Relevé d'isolation 30 cm sur mur + bande d'étanchéité hygrovariable. Traitement prioritaire avant ITI murs.
  </div>
  <div class="garantie-banner">
    <div style="font-size:10px;opacity:.8;">GARANTIE ISOLANT BIOSOURCÉ</div>
    <div class="g-val">30 à 40 ans</div>
    <div style="font-size:10px;margin-top:4px;">Performance thermique stable — pas de retrait ni affaissement (laine de bois)</div>
  </div>
""" + page_footer(19))

  pages.append(page_header(20, "IV.1 — SYNTHÈSE ISOLATION &amp; GARANTIES") + """
  <h2>IV.1 — Synthèse isolation PEREIRA</h2>
  <table>
    <tr><th>Zone</th><th>Matériau retenu</th><th>R cible</th><th>Surface</th><th>Priorité</th></tr>
    <tr><td>Combles perdus</td><td>Ouate / laine de roche</td><td>R ≥ 8</td><td>164 m²</td><td class="text-red">★★★★★ #1</td></tr>
    <tr><td>Murs pisé (ITI)</td><td>Laine de bois 140 mm</td><td>R ≥ 3,7</td><td>260 m²</td><td class="text-red">★★★★★ #2</td></tr>
    <tr><td>Plancher bas</td><td>PSE 100 mm</td><td>R ≥ 3</td><td>164 m²</td><td>★★★★☆ #3</td></tr>
    <tr><td>Zones humides</td><td>Chanvre-lime</td><td>R ≥ 2,5</td><td>30 m²</td><td>★★★☆☆</td></tr>
    <tr class="total-row"><td colspan="3"><strong>Gain déperditions murs estimé</strong></td><td colspan="2"><strong>-72 %</strong> (28 % → 8 %)</td></tr>
  </table>
  <div class="grid-garanties">
    <div class="garantie-card"><div style="font-size:20px;font-weight:800;color:var(--primary);">30–40 ans</div>Garantie isolant biosourcé</div>
    <div class="garantie-card"><div style="font-size:20px;font-weight:800;color:var(--primary);">10 ans</div>Garantie décennale pose RGE</div>
    <div class="garantie-card"><div style="font-size:20px;font-weight:800;color:var(--primary);">ACERMI</div>Certification matériau</div>
    <div class="garantie-card"><div style="font-size:20px;font-weight:800;color:var(--primary);">MIC</div>Décennale N° LUNPIB2604975</div>
  </div>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> L'isolation complète (combles + ITI + plancher) conditionne le dimensionnement PAC à 12 kW au lieu de 18–20 kW pré-isolation. Économie évité : <strong>4 000–6 000 €</strong> sur le poste chauffage.</div>
  <div class="pise-focus" style="font-size:10px;padding:12px;">
    <strong>⚠️ Rappel pisé :</strong> Aucun pare-vapeur · Enduits chaux uniquement · ITI respirante · Ordre : combles → murs → planchers → menuiseries
  </div>
""" + page_footer(20))

  # IV.2 PAC - pages 21-24
  pages.append(page_header(21, "IV.2 — POMPE À CHALEUR ENPHASE / AIR-AIR") + """
  <h2>IV.2 — Système Pompe à Chaleur Enphase / Air-Air</h2>
  <p style="font-size:11px;color:var(--text-muted);">Dimensionnement <strong>post-isolation</strong> — logement 164 m², zone H1 (Loire). Unité extérieure inverter + 5 splits muraux design.</p>
  <h3>Fiche produit — Unité extérieure 12 kW (Inverter R32)</h3>
  <div class="catalogue-photo large dark">
    <span style="font-size:36px;margin-bottom:8px;">❄️</span>
    <strong style="color:#e2e8f0;">Photo — Unité extérieure PAC 12 kW</strong>
    <span style="font-size:9px;margin-top:4px;color:#64748b;">assets/pereira/catalogue/pac-unite-exterieure-12kw.jpg</span>
  </div>
  <div class="tech-kpi-row">
    <div class="tech-kpi"><div class="tech-kpi-val">12 kW</div><div class="tech-kpi-label">Puissance nominale</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">SCOP ≥ 3,5</div><div class="tech-kpi-label">Saisonnier chauffage</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">SEER ≥ 6</div><div class="tech-kpi-label">Mode froid</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">R32</div><div class="tech-kpi-label">Fluide réfrigérant</div></div>
  </div>
  <table>
    <tr><th>Caractéristique</th><th>Valeur</th></tr>
    <tr><td>Marque / gamme</td><td>Mitsubishi / Daikin / Atlantic — sélection RGE Rhône Génie Climatique</td></tr>
    <tr><td>Puissance nominale</td><td><strong>12 kW</strong> (mono-split multi-zones)</td></tr>
    <tr><td>Plage fonctionnement</td><td>-15 °C à +46 °C extérieur</td></tr>
    <tr><td>Niveau sonore UE</td><td>≤ 55 dB(A) à 1 m</td></tr>
    <tr><td>Alimentation</td><td>Monophasé 230 V — disjoncteur dédié 32 A</td></tr>
    <tr><td>Emplacement prévu</td><td>Mur Nord ou Est — anti-vibration, évacuation condensats</td></tr>
  </table>
  <span class="product-badge">RGE QualiPAC</span><span class="product-badge gold">Garantie constructeur 5 ans</span>
""" + page_footer(21))

  pages.append(page_header(22, "IV.2 — SPLITS MURAUX DESIGN") + """
  <h2>IV.2 — Unités intérieures — Splits muraux design</h2>
  <div class="catalogue-photo large">
    <span style="font-size:32px;">🏠</span>
    <strong>Photo — Split mural design blanc / argent</strong>
    <span style="font-size:9px;">assets/pereira/catalogue/split-mural-design.jpg</span>
  </div>
  <table>
    <tr><th>Pièce / Zone</th><th>Modèle</th><th>Puissance</th><th>Volume approx.</th><th>Orientation</th></tr>
    <tr><td>Séjour / Salon</td><td>Split mural design</td><td><strong>3,5 kW</strong></td><td>~55 m³</td><td>Sud — apports solaires</td></tr>
    <tr><td>Cuisine</td><td>Split compact</td><td><strong>2,5 kW</strong></td><td>~35 m³</td><td>Est</td></tr>
    <tr><td>Chambre 1 (parentale)</td><td>Split design silencieux</td><td><strong>2,5 kW</strong></td><td>~35 m³</td><td>Ouest — mode froid été</td></tr>
    <tr><td>Chambre 2</td><td>Split design</td><td><strong>2,0 kW</strong></td><td>~28 m³</td><td>Nord</td></tr>
    <tr><td>Chambre 3 / Bureau</td><td>Split design</td><td><strong>2,0 kW</strong></td><td>~28 m³</td><td>Nord</td></tr>
    <tr class="total-row"><td colspan="2"><strong>Total splits</strong></td><td><strong>12,5 kW</strong></td><td colspan="2">5 unités — couverture 164 m²</td></tr>
  </table>
  <div class="cols2" style="margin-top:10px;">
    <div class="card" style="font-size:10px;">
      <strong>Design &amp; intégration</strong>
      <ul style="padding-left:14px;margin:4px 0;">
        <li>Finition blanc mat ou argent brossé</li>
        <li>Flux d'air directionnel 3D</li>
        <li>Mode nuit &lt; 22 dB(A)</li>
        <li>Télécommande + pilotage Wi-Fi (option)</li>
      </ul>
    </div>
    <div class="card" style="font-size:10px;">
      <strong>Fonctions</strong>
      <ul style="padding-left:14px;margin:4px 0;">
        <li>Chauffage + refroidissement réversible</li>
        <li>Déshumidification passive</li>
        <li>Filtration air pollen/poussière</li>
        <li>Arrêt automatique portes/fenêtres (option)</li>
      </ul>
    </div>
  </div>
""" + page_footer(22))

  pages.append(page_header(23, "IV.2 — DIMENSIONNEMENT 164 m²") + """
  <h2>IV.2 — Tableau de dimensionnement PAC — 164 m²</h2>
  <div class="box box-info" style="font-size:10px;margin-bottom:10px;">
    <strong>Formule post-isolation :</strong> P (kW) = Surface × Coef × Marge = 164 × 0,04 × 1,15 = <strong>7,5 kW</strong> → unité retenue <strong>12 kW</strong> (marge confort + mode froid été)
  </div>
  <table>
    <tr><th>Paramètre</th><th>AVANT isolation</th><th>APRÈS isolation</th><th>Retenu PEREIRA</th></tr>
    <tr><td>Coefficient G (W/m².K)</td><td>1,2–1,5</td><td>0,35–0,45</td><td>0,40</td></tr>
    <tr><td>Besoin chauffage (kW)</td><td>18–20 kW</td><td>6,5–8 kW</td><td><strong>7,5 kW</strong></td></tr>
    <tr><td>Puissance PAC installée</td><td>—</td><td>—</td><td><strong>12 kW UE</strong></td></tr>
    <tr><td>Volume chauffé</td><td colspan="2">164 m² × 2,5 m hauteur = <strong>410 m³</strong></td><td>5 zones</td></tr>
    <tr><td>ΔT base (-7 °C ext.)</td><td colspan="3">20 °C int. − (−7 °C ext.) = <strong>27 K</strong></td></tr>
    <tr><td>Débit air splits</td><td colspan="3">400–600 m³/h cumulé — réglage par zone</td></tr>
  </table>
  <div class="catalogue-photo">
    <span style="font-size:24px;">🗺️</span>
    <strong>Plan de répartition des 5 splits — RDC + étage</strong>
    <span style="font-size:9px;">assets/pereira/catalogue/plan-splits-pereira.png</span>
  </div>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> Sans ITI préalable, il faudrait une PAC 18–20 kW (+4 000–6 000 €). L'ordre optimal (isolation d'abord) est donc économiquement et techniquement impératif. Installation PAC en <strong>semaine 11</strong> du planning.</div>
""" + page_footer(23))

  pages.append(page_header(24, "IV.2 — INSTALLATION &amp; GARANTIES PAC") + """
  <h2>IV.2 — Installation, compatibilité Enphase &amp; garanties</h2>
  <h3>Couplage PAC + solaire Enphase (autoconsommation)</h3>
  <p style="font-size:11px;">La production DualSun/Enphase alimente en priorité la PAC, le ballon thermodynamique et les auxiliaires. L'excédent est injecté ou stocké virtuellement (selon contrat EDF OA).</p>
  <div class="ascii-art" style="font-size:8px;">  ☀ DualSun 6 kWc ──► Micro-onduleurs Enphase IQ8 ──► Tableau électrique
                                                          │
                    ┌─────────────────────────────────────┼──────────────┐
                    ▼                     ▼               ▼              ▼
              PAC 12 kW UE          Ballon thermo     VMC Hygro B    Prises / éclairage
              (priorité 1)          (priorité 2)      (priorité 3)   (résiduel)</div>
  <table>
    <tr><th>Élément</th><th>Spécification</th><th>Garantie</th></tr>
    <tr><td>Unité extérieure 12 kW</td><td>Inverter R32, RGE QualiPAC</td><td><strong>5 ans</strong> constructeur</td></tr>
    <tr><td>Splits muraux (×5)</td><td>Design, silencieux &lt; 22 dB</td><td><strong>5 ans</strong> pièces</td></tr>
    <tr><td>Pose &amp; mise en service</td><td>Rhône Génie Climatique RGE</td><td><strong>10 ans</strong> décennale MIC</td></tr>
    <tr><td>Compresseur inverter</td><td>Allumage/extinction progressif</td><td><strong>7 ans</strong> (selon marque)</td></tr>
  </table>
  <div class="garantie-banner">
    <div style="font-size:10px;opacity:.8;">DÉCENNALE INSTALLATION PAC</div>
    <div class="g-val">MIC Insurance</div>
    <div style="font-size:10px;margin-top:4px;">N° LUNPIB2604975 — ENERGIA-CONSEIL IA® coordonne la réception RGE</div>
  </div>
""" + page_footer(24))

  # IV.3 DualSun - pages 25-29
  pages.append(page_header(25, "IV.3 — OPTION SOLAIRE DUALSUN PREMIUM") + """
  <h2>IV.3 — Option Solaire DualSun Premium</h2>
  <h3>Fiche technique — Panneau DualSun Bifacial SPRING 375 Wc</h3>
  <div class="catalogue-photo large dark">
    <span style="font-size:40px;margin-bottom:8px;">☀️</span>
    <strong style="color:#fbbf24;">Photo — Panneau DualSun Bifacial Premium</strong>
    <span style="font-size:9px;color:#64748b;">assets/pereira/catalogue/dualsun-bifacial-premium.jpg</span>
  </div>
  <div class="tech-kpi-row">
    <div class="tech-kpi"><div class="tech-kpi-val">375 Wc</div><div class="tech-kpi-label">Puissance unitaire</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">+30 %</div><div class="tech-kpi-label">Gain bifacial</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">6 kWc</div><div class="tech-kpi-label">Installation PEREIRA</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">30–40 ans</div><div class="tech-kpi-label">Garantie produit</div></div>
  </div>
  <table>
    <tr><th>Caractéristique</th><th>Valeur DualSun Bifacial</th></tr>
    <tr><td>Technologie</td><td>Cellules PERC bifaciales — captation face arrière</td></tr>
    <tr><td>Rendement module</td><td>≥ 21,5 %</td></tr>
    <tr><td>Coefficient température</td><td>-0,35 %/°C (meilleur que standard)</td></tr>
    <tr><td>Nb panneaux PEREIRA</td><td><strong>16 panneaux</strong> × 375 Wc = 6 kWc</td></tr>
    <tr><td>Production estimée Loire (H1)</td><td><strong>6 600–7 200 kWh/an</strong> (1 100–1 200 kWh/kWc)</td></tr>
    <tr><td>Surface toiture</td><td>~40 m² (3 pans : Sud + Est + Ouest)</td></tr>
  </table>
  <span class="product-badge gold">Garantie produit 30 ans</span><span class="product-badge gold">Garantie performance 40 ans</span>
""" + page_footer(25))

  pages.append(page_header(26, "IV.3 — RENDEMENT BIFACIAL +30 %") + """
  <h2>IV.3 — Technologie bifaciale : +30 % de rendement</h2>
  <p style="font-size:11px;color:var(--text-muted);">Les panneaux bifaciaux DualSun captent la lumière directe (face avant) <strong>et</strong> la lumière réfléchie par le toit/support (face arrière). Sur toiture claire ou bac acier, le gain atteint <strong>+25 à +30 %</strong> vs monocristallin standard.</p>
  <div class="catalogue-photo large">
    <span style="font-size:28px;">🔆</span>
    <strong>Schéma — Principe bifacial (face avant + arrière)</strong>
    <span style="font-size:9px;">assets/pereira/catalogue/schema-bifacial-dualsun.png</span>
  </div>
  <div class="ascii-art" style="font-size:8px;">         ☀ RAYONNEMENT DIRECT
              │
              ▼
    ╔═══════════════════════╗  ← Face AVANT (375 Wc nominal)
    ║   DUALSUN BIFACIAL    ║
    ╚═══════════════════════╝
              │
    ~~~~~~~~~~│~~~~~~~~~~  ← Lumière réfléchie toiture / albedo
              ▼
         Face ARRIÈRE (+30 % production)
              │
              ▼
         Micro-onduleur Enphase IQ8</div>
  <table>
    <tr><th>Configuration toit PEREIRA</th><th>Albédo support</th><th>Gain bifacial</th><th>Production pan</th></tr>
    <tr><td>Pan Sud (tuiles terre cuite)</td><td>0,20–0,25</td><td>+20–25 %</td><td>~2 800 kWh/an</td></tr>
    <tr><td>Pan Est (matin)</td><td>0,20</td><td>+22 %</td><td>~1 900 kWh/an</td></tr>
    <tr><td>Pan Ouest (soir)</td><td>0,20</td><td>+22 %</td><td>~1 800 kWh/an</td></tr>
    <tr class="total-row"><td colspan="2"><strong>Total 6 kWc bifacial</strong></td><td><strong>+30 % vs standard</strong></td><td><strong>~6 600 kWh/an</strong></td></tr>
  </table>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> La configuration 3 pans (S+E+O) identifiée en II.QUATER maximise la production étalée sur la journée — idéal pour autoconsommation PAC + ballon.</div>
""" + page_footer(26))

  pages.append(page_header(27, "IV.3 — MICRO-ONDULEURS ENPHASE IQ8") + """
  <h2>IV.3 — Micro-onduleurs Enphase IQ8+ / IQ8M</h2>
  <div class="catalogue-photo large dark">
    <span style="font-size:32px;">⚡</span>
    <strong style="color:#60a5fa;">Photo — Micro-onduleur Enphase IQ8</strong>
    <span style="font-size:9px;color:#64748b;">assets/pereira/catalogue/enphase-iq8-micro.jpg</span>
  </div>
  <table>
    <tr><th>Caractéristique</th><th>Enphase IQ8+ / IQ8M</th></tr>
    <tr><td>Architecture</td><td>1 micro-onduleur par panneau (16 unités)</td></tr>
    <tr><td>Puissance AC</td><td>290–330 VA par module</td></tr>
    <tr><td>Rendement</td><td>≥ 97 % (CEC)</td></tr>
    <tr><td>Communication</td><td>PLC + Wi-Fi Envoy — monitoring temps réel</td></tr>
    <tr><td>Sécurité</td><td>Arrêt automatique réseau (norme VDE 0126)</td></tr>
    <tr><td>Compatibilité</td><td>DualSun bifacial — optimisé MPPT par panneau</td></tr>
  </table>
  <div class="garantie-banner">
    <div style="font-size:10px;opacity:.8;">GARANTIE ENPHASE MICRO-ONDULEURS</div>
    <div class="g-val">25 ans</div>
    <div style="font-size:10px;margin-top:4px;">Garantie produit + garantie performance — la plus longue du marche résidentiel</div>
  </div>
  <div class="cols2" style="font-size:10px;">
    <div class="card"><strong>Avantages vs onduleur central</strong><ul style="padding-left:14px;margin:4px 0;"><li>Pas de point unique de défaillance</li><li>Optimisation ombrage partiel (arbres, cheminée)</li><li>Extension modulaire (+ panneaux)</li><li>Maintenance panneau par panneau</li></ul></div>
    <div class="card"><strong>Envoy S Metered</strong><ul style="padding-left:14px;margin:4px 0;"><li>Passerelle communication Wi-Fi</li><li>Mesure production + consommation</li><li>Données historiques 25 ans</li><li>Alertes panne en temps réel</li></ul></div>
  </div>
""" + page_footer(27))

  pages.append(page_header(28, "IV.3 — MONITORING ENLIGHTEN") + """
  <h2>IV.3 — Monitoring mobile — Application Enphase Enlighten</h2>
  <div class="catalogue-photo large">
    <span style="font-size:48px;margin-bottom:8px;">📱</span>
    <strong>Capture écran — App Enlighten (production temps réel)</strong>
    <span style="font-size:9px;">assets/pereira/catalogue/enphase-enlighten-app.png</span>
  </div>
  <p style="font-size:11px;">L'application <strong>Enphase Enlighten</strong> (iOS / Android) permet à M. PEREIRA de suivre en temps réel la production solaire, la consommation et le taux d'autoconsommation.</p>
  <table>
    <tr><th>Fonction</th><th>Description</th><th>Bénéfice client</th></tr>
    <tr><td>Production live</td><td>Courbe kW en temps réel par panneau</td><td>Visibilité immédiate</td></tr>
    <tr><td>Historique</td><td>Jour / mois / année — export CSV</td><td>Suivi ROI solaire</td></tr>
    <tr><td>Autoconsommation</td><td>% énergie auto-consommée vs injectée</td><td>Optimisation usages</td></tr>
    <tr><td>Alertes</td><td>Notification panneau défaillant</td><td>Intervention rapide</td></tr>
    <tr><td>Impact CO₂</td><td>kg CO₂ évité cumulé</td><td>Suivi empreinte carbone</td></tr>
  </table>
  <div class="box box-info" style="font-size:10px;">
    <strong>Exemple PEREIRA :</strong> Production 6 600 kWh/an × 70 % autoconsommation = <strong>4 620 kWh</strong> valorisés sur place (PAC + ballon + ménage). Économie estimée : <strong>1 100–1 300 €/an</strong>.
  </div>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> Le monitoring Enphase est indispensable pour vérifier le couplage solaire → PAC. ENERGIA configure les alertes et forme le client à la lecture des courbes lors de la réception (S12).</div>
""" + page_footer(28))

  pages.append(page_header(29, "IV.3 — CONFIGURATION 3 PANS PEREIRA") + """
  <h2>IV.3 — Implantation toiture — 3 pans DualSun (6 kWc)</h2>
  <div class="catalogue-photo large">
    <span style="font-size:28px;">🏠</span>
    <strong>Vue aérienne / schéma toiture — 16 panneaux 3 pans</strong>
    <span style="font-size:9px;">assets/pereira/catalogue/plan-toiture-dualsun-pereira.png</span>
  </div>
  <table>
    <tr><th>Pan toiture</th><th>Orientation</th><th>Nb panneaux</th><th>Puissance</th><th>Production est.</th></tr>
    <tr><td>Pan 1 — Principal</td><td>Sud (180°)</td><td>8</td><td>3,0 kWc</td><td>~3 400 kWh/an</td></tr>
    <tr><td>Pan 2 — Est</td><td>Est (90°)</td><td>4</td><td>1,5 kWc</td><td>~1 600 kWh/an</td></tr>
    <tr><td>Pan 3 — Ouest</td><td>Ouest (270°)</td><td>4</td><td>1,5 kWc</td><td>~1 500 kWh/an</td></tr>
    <tr class="total-row"><td><strong>Total</strong></td><td>3 pans</td><td><strong>16</strong></td><td><strong>6,0 kWc</strong></td><td><strong>~6 500 kWh/an</strong></td></tr>
  </table>
  <div class="grid-garanties">
    <div class="garantie-card" style="background:#fef3c7;"><div style="font-size:18px;font-weight:800;color:#d97706;">30 ans</div>Garantie produit DualSun</div>
    <div class="garantie-card" style="background:#fef3c7;"><div style="font-size:18px;font-weight:800;color:#d97706;">40 ans</div>Garantie performance linéaire</div>
    <div class="garantie-card"><div style="font-size:18px;font-weight:800;color:var(--primary);">25 ans</div>Enphase micro-onduleurs</div>
    <div class="garantie-card"><div style="font-size:18px;font-weight:800;color:var(--primary);">10 ans</div>Décennale pose MIC</div>
  </div>
""" + page_footer(29))

  # IV.4 Ballon + VMC - pages 30-35
  pages.append(page_header(30, "IV.4 — BALLON THERMODYNAMIQUE") + """
  <h2>IV.4 — Ballon Thermodynamique &amp; VMC Hygro B</h2>
  <h3>Fiche produit — Ballon thermodynamique 200 L</h3>
  <div class="catalogue-photo large">
    <span style="font-size:36px;">💧</span>
    <strong>Photo — Ballon thermodynamique sur socle</strong>
    <span style="font-size:9px;">assets/pereira/catalogue/ballon-thermo-200l.jpg</span>
  </div>
  <div class="tech-kpi-row">
    <div class="tech-kpi"><div class="tech-kpi-val">200 L</div><div class="tech-kpi-label">Capacité stockage</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">COP ≥ 2,5</div><div class="tech-kpi-label">À +7 °C air</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">-70 %</div><div class="tech-kpi-label">vs cumulus électrique</div></div>
    <div class="tech-kpi"><div class="tech-kpi-val">RGE</div><div class="tech-kpi-label">Qualibat / QualiPAC</div></div>
  </div>
  <table>
    <tr><th>Caractéristique</th><th>Valeur</th></tr>
    <tr><td>Type</td><td>Ballon thermodynamique air ambiant (split ou monobloc)</td></tr>
    <tr><td>Capacité</td><td><strong>200 litres</strong> — adapté 4–5 personnes</td></tr>
    <tr><td>COP ECS</td><td>≥ 2,5 (profil M +7 °C) — ≥ 3,0 en été</td></tr>
    <tr><td>Consommation annuelle</td><td><strong>800–1 000 kWh</strong> vs 3 500 kWh cumulus</td></tr>
    <tr><td>Emplacement</td><td>Buanderie / garage — air ambiant ≥ 5 m³</td></tr>
    <tr><td>Installation</td><td>Post-isolation + post-VMC — <strong>semaine 11</strong></td></tr>
  </table>
  <span class="product-badge">Aide MPR 1 200 € (Bleu)</span><span class="product-badge">CEE 100–150 €</span>
""" + page_footer(30))

  pages.append(page_header(31, "IV.4 — GAINS EAU CHAUDE SANITAIRE") + """
  <h2>IV.4 — Gains sur l'eau chaude sanitaire (ECS)</h2>
  <table>
    <tr><th>Poste</th><th>AVANT (cumulus électrique)</th><th>APRÈS (ballon thermo)</th><th>Gain</th></tr>
    <tr><td>Consommation ECS</td><td>~3 500 kWh/an</td><td>~900 kWh/an</td><td><strong>-74 %</strong></td></tr>
    <tr><td>Coût annuel ECS</td><td>~770 €/an</td><td>~200 €/an</td><td><strong>-570 €/an</strong></td></tr>
    <tr><td>Émissions CO₂ ECS</td><td>~0,7 t CO₂/an</td><td>~0,15 t CO₂/an</td><td><strong>-79 %</strong></td></tr>
    <tr><td>Temps chauffe eau 40 → 55 °C</td><td>2–3 h (résistance)</td><td>3–4 h (thermo, COP 2,5)</td><td>Énergie divisée par 2,5</td></tr>
  </table>
  <div class="catalogue-photo">
    <span style="font-size:24px;">📈</span>
    <strong>Graphique — Courbe de consommation ECS avant/après</strong>
    <span style="font-size:9px;">assets/pereira/catalogue/graph-ecs-pereira.png</span>
  </div>
  <div class="cols2" style="font-size:10px;">
    <div class="card" style="border-top:3px solid var(--primary);">
      <strong>Couplage solaire DualSun</strong>
      <p style="margin:4px 0;">Le ballon thermo fonctionne de préférence en journée (10 h–16 h) quand la production solaire est maximale. Pilotage intelligent via contact heures creuses + surplus PV.</p>
    </div>
    <div class="card" style="border-top:3px solid var(--orange);">
      <strong>Dimensionnement 4–5 personnes</strong>
      <p style="margin:4px 0;">200 L = 40 L/personne/jour à 55 °C. Suffisant pour douches + vaisselle. Si besoin futur : appoint solaire thermique DualSun (option).</p>
    </div>
  </div>
  <div class="mickael-box"><strong class="text-blue">Note Mickaël :</strong> Le ballon thermo est en poste #7 de l'ordre optimal (après PAC). Ne jamais installer avant isolation — risque de surdimensionnement et condensation en local non chauffé.</div>
""" + page_footer(31))

  pages.append(page_header(32, "IV.4 — VMC HYGRO RÉGLABLE B") + """
  <h2>IV.4 — VMC Hygroréglable type B</h2>
  <div class="catalogue-photo large">
    <span style="font-size:32px;">🌀</span>
    <strong>Photo — Centrale VMC Hygro B + bouches</strong>
    <span style="font-size:9px;">assets/pereira/catalogue/vmc-hygro-b.jpg</span>
  </div>
  <table>
    <tr><th>Caractéristique</th><th>Valeur</th></tr>
    <tr><td>Type</td><td>VMC simple flux hygroréglable <strong>type B</strong></td></tr>
    <tr><td>Débit max</td><td>150–200 m³/h (maison 164 m²)</td></tr>
    <tr><td>Bouches extraction</td><td>Cuisine 75–135 m³/h · SdB 15–30 · WC 15–30</td></tr>
    <tr><td>Entrées d'air</td><td>Hygrovisibles pièces humides + fixes pièces sèches</td></tr>
    <tr><td>Régulation</td><td>Automatique selon taux d'humidité (pas de commande manuelle)</td></tr>
    <tr><td>Consommation</td><td>15–30 W — ~50 €/an électricité</td></tr>
    <tr><td>Installation</td><td><strong>Semaine 10</strong> — après menuiseries, avant PAC</td></tr>
  </table>
  <div class="box box-warn" style="font-size:10px;">
    <strong>Compatibilité pisé :</strong> La VMC Hygro B assure le renouvellement d'air sans assécher le bâti. Indispensable après ITI (étanchéité accrue). Pas de VMC double flux sur pisé sans étude hygro spécifique.
  </div>
  <span class="product-badge">Aide MPR geste 2 000 € (Bleu)</span><span class="product-badge">CEE 400–600 €</span>
""" + page_footer(32))

  pages.append(page_header(33, "IV.4 — SCHÉMA VENTILATION") + """
  <h2>IV.4 — Schéma de ventilation Hygro B — 164 m²</h2>
  <div class="ascii-art" style="font-size:7.5px;">  ENTREES D'AIR HYGRORÉGLABLES                    EXTRACTION VMC
  ─────────────────────────────────────────────────────────────────
  Chambres (grilles fixes)  ──────────────────►  Bouches SdB (hygro)
  Salon (grille fixe)       ──────────────────►  Bouche cuisine (135 m³/h)
  Bureau (grille fixe)      ──────────────────►  Bouches WC (2× 15 m³/h)
                              │
                              ▼
                    ┌─────────────────────┐
                    │  CENTRALE VMC       │  ← Combles / garage
                    │  Hygro B 150 m³/h   │
                    └──────────┬──────────┘
                               │
                               ▼
                         REJET EXTÉRIEUR
                         (façade Nord, bas)</div>
  <div class="catalogue-photo">
    <span style="font-size:24px;">📐</span>
    <strong>Plan réseau aéraulique — gaines Ø 125 / 160 mm</strong>
    <span style="font-size:9px;">assets/pereira/catalogue/plan-vmc-pereira.png</span>
  </div>
  <table>
    <tr><th>Pièce</th><th>Type bouche</th><th>Débit nominal</th><th>Débit hygro max</th></tr>
    <tr><td>Cuisine</td><td>Extraction hygro</td><td>45 m³/h</td><td>135 m³/h</td></tr>
    <tr><td>Salle de bain 1</td><td>Extraction hygro</td><td>15 m³/h</td><td>30 m³/h</td></tr>
    <tr><td>Salle de bain 2</td><td>Extraction hygro</td><td>15 m³/h</td><td>30 m³/h</td></tr>
    <tr><td>WC</td><td>Extraction hygro</td><td>15 m³/h</td><td>30 m³/h</td></tr>
    <tr><td>Chambres + séjour</td><td>Entrées d'air</td><td colspan="2">Auto-régulation par dépression</td></tr>
  </table>
""" + page_footer(33))

  pages.append(page_header(34, "IV — SYNTHÈSE ORDRE OPTIMAL") + """
  <h2>IV — Synthèse catalogue &amp; ordre d'installation</h2>
  <table>
    <tr><th>N°</th><th>Équipement</th><th>Section</th><th>Semaine</th><th>Prérequis</th></tr>
    <tr><td>1</td><td>Isolation combles (R ≥ 8)</td><td>IV.1</td><td>S3–S4</td><td>—</td></tr>
    <tr><td>2</td><td>ITI laine de bois pisé (R ≥ 3,7)</td><td>IV.1</td><td>S5–S7</td><td>Combles posés</td></tr>
    <tr><td>3</td><td>Isolation plancher bas</td><td>IV.1</td><td>S3–S4</td><td>—</td></tr>
    <tr><td>4</td><td>Menuiseries PVC DV (21 ouvrants)</td><td>—</td><td>S8–S9</td><td>ITI murs ≥ 80 %</td></tr>
    <tr><td>5</td><td>VMC Hygro B</td><td>IV.4</td><td>S10</td><td>Menuiseries posées</td></tr>
    <tr><td>6</td><td>PAC Air/Air 12 kW + 5 splits</td><td>IV.2</td><td>S11</td><td>Isolation complète</td></tr>
    <tr><td>7</td><td>Ballon thermodynamique 200 L</td><td>IV.4</td><td>S11</td><td>PAC + VMC</td></tr>
    <tr><td>8</td><td>DualSun 6 kWc + Enphase IQ8</td><td>IV.3</td><td>S11–S12</td><td>Tous postes précédents</td></tr>
  </table>
  <div class="danger-box" style="font-size:10px;">
    <strong class="text-red">🚨 ORDRE IMPÉRATIF :</strong> PAC avant isolation = surcoût 4 000–6 000 € · VMC avant isolation = inefficace · PV avant réduction besoins = surdimensionnement
  </div>
  <div class="mickael-box"><strong class="text-blue">Validation Mickaël :</strong> Chaque équipement de ce catalogue a été dimensionné pour le profil thermique post-rénovation du logement PEREIRA. Toute modification de scope (surface ITI, nb splits, kWc) nécessite une revalidation technique.</div>
""" + page_footer(34))

  pages.append(page_header(35, "IV — RÉCAPITULATIF GARANTIES") + """
  <h2>IV — Récapitulatif des garanties équipements</h2>
  <div class="grid-garanties" style="grid-template-columns:repeat(3,1fr);gap:12px;">
    <div class="garantie-card" style="padding:16px;background:#fef3c7;border:2px solid #d97706;">
      <div style="font-size:11px;font-weight:700;color:#92400e;">DUALSUN BIFACIAL</div>
      <div style="font-size:28px;font-weight:800;color:#d97706;margin:8px 0;">30–40 ans</div>
      <div style="font-size:9px;">30 ans produit · 40 ans performance linéaire · Made in France</div>
    </div>
    <div class="garantie-card" style="padding:16px;background:#eff6ff;border:2px solid var(--secondary);">
      <div style="font-size:11px;font-weight:700;color:var(--secondary);">ENPHASE IQ8</div>
      <div style="font-size:28px;font-weight:800;color:var(--secondary);margin:8px 0;">25 ans</div>
      <div style="font-size:9px;">Micro-onduleurs · Monitoring Enlighten inclus · Extension modulaire</div>
    </div>
    <div class="garantie-card" style="padding:16px;background:#f0fdf4;border:2px solid var(--primary);">
      <div style="font-size:11px;font-weight:700;color:var(--primary);">DÉCENNALE MIC</div>
      <div style="font-size:28px;font-weight:800;color:var(--primary);margin:8px 0;">10 ans</div>
      <div style="font-size:9px;">N° LUNPIB2604975 · Tous corps de métier RGE · ENERGIA coordonne</div>
    </div>
  </div>
  <table style="margin-top:14px;">
    <tr><th>Équipement</th><th>Garantie produit</th><th>Garantie pose</th><th>Artisan RGE</th></tr>
    <tr><td>Laine de bois ITI</td><td>30–40 ans</td><td>10 ans décennale</td><td>Région Isolation</td></tr>
    <tr><td>PAC 12 kW + splits</td><td>5–7 ans constructeur</td><td>10 ans décennale</td><td>Rhône Génie Climatique</td></tr>
    <tr><td>DualSun 6 kWc</td><td>30–40 ans</td><td>10 ans décennale</td><td>Réseau partenaires PV</td></tr>
    <tr><td>Enphase IQ8 (×16)</td><td>25 ans</td><td>Incluse pose</td><td>Installateur certifié Enphase</td></tr>
    <tr><td>Ballon thermo 200 L</td><td>5 ans</td><td>10 ans décennale</td><td>Rhône Génie Climatique</td></tr>
    <tr><td>VMC Hygro B</td><td>2 ans</td><td>10 ans décennale</td><td>Rhône Génie Climatique</td></tr>
  </table>
  <div class="box box-info" style="font-size:10px;margin-top:12px;">
    <strong>Expert technique :</strong> Mickaël — ENERGIA-CONSEIL IA® · Dimensionnements validés le 12/07/2026 · Dossier AUDIT-2026-PEREIRA · Prochaine section : <strong>V. Les 3 Scénarios de Rénovation</strong>
  </div>
""" + page_footer(35))

  return "\n".join(pages)


def renumber_pages(content: str, offset: int = 20, from_page: int = 16) -> str:
    def repl_header(m: re.Match) -> str:
        n = int(m.group(1))
        if n >= from_page:
            return f"Page {n + offset}/60"
        return m.group(0)

    def repl_comment(m: re.Match) -> str:
        n = int(m.group(1))
        if n >= from_page:
            return f"<!-- PAGE {n + offset}"
        return m.group(0)

    content = re.sub(r"Page (\d+)/60", repl_header, content)
    content = re.sub(r"<!-- PAGE (\d+)", repl_comment, content)
    return content


def renumber_sections(content: str) -> str:
    replacements = [
        ("<h1>III. Les 3 Scénarios de Rénovation</h1>", "<h1>V. Les 3 Scénarios de Rénovation</h1>"),
        ("AUDIT ÉNERGÉTIQUE — SCÉNARIOS DE TRAVAUX", "AUDIT ÉNERGÉTIQUE — SCÉNARIOS DE TRAVAUX"),
        ("<h1>IV. Détail des Travaux par Lot</h1>", "<h1>VI. Détail des Travaux par Lot</h1>"),
        ("<h1>V. Aides Financières 2026</h1>", "<h1>VII. Aides Financières 2026</h1>"),
        ("<h1>VI. Plan de Financement &amp; Délais</h1>", "<h1>VIII. Plan de Financement &amp; Délais</h1>"),
        ("<h1>VII. Option Solaire DualSun Premium</h1>", "<h1>IX. Option Solaire DualSun Premium</h1>"),
        ("<h1>VIII. Planning &amp; Engagement</h1>", "<h1>X. Planning &amp; Engagement</h1>"),
    ]
    for old, new in replacements:
        content = content.replace(old, new)
    return content


def main() -> None:
    content = PATH.read_text(encoding="utf-8")
    marker = "<!-- PAGE 16 – LES 3 SCÉNARIOS -->"
    if marker not in content:
        raise SystemExit("Marker not found")
    if "IV. Catalogue Technique" in content:
        raise SystemExit("Catalogue already inserted")

    catalogue = build_pages()
    before, after = content.split(marker, 1)
    content = before + catalogue + marker + after

    content = renumber_pages(content, offset=20, from_page=16)
    content = renumber_sections(content)

    PATH.write_text(content, encoding="utf-8")
    print(f"Inserted 20 catalogue pages. File size: {PATH.stat().st_size} bytes")


if __name__ == "__main__":
    main()
