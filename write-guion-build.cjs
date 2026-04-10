/**
 * Génère les 3 HTML du dossier GUION (fs.writeFileSync).
 * Exécution : node write-guion-build.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;

const CSS_COMMON = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --vert: #1B5E20;
    --orange: #E65100;
    --bleu: #1565C0;
    --gris: #37474F;
    --fond: #FAFAFA;
  }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.55;
    color: var(--gris);
    background: #fff;
    font-size: 14px;
  }
  .wrap { max-width: 900px; margin: 0 auto; padding: 1.25rem 1.5rem 3rem; }
  @media (min-width: 768px) { .wrap { padding: 2rem 2.5rem 4rem; } }
  .entete {
    border-bottom: 4px solid var(--vert);
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }
  .entete h1 { color: var(--vert); font-size: 1.35rem; font-weight: 700; }
  .entete .sous { color: var(--bleu); font-size: 0.95rem; margin-top: 0.35rem; }
  .entete .coordonnees { font-size: 0.82rem; color: #546E7A; margin-top: 0.5rem; line-height: 1.45; }
  h2 {
    color: var(--vert);
    font-size: 1.05rem;
    margin: 1.35rem 0 0.6rem;
    padding-bottom: 0.25rem;
    border-bottom: 2px solid var(--orange);
    page-break-after: avoid;
  }
  h3 { color: var(--bleu); font-size: 0.95rem; margin: 0.85rem 0 0.4rem; }
  p { margin: 0.4rem 0; }
  ul, ol { margin: 0.4rem 0 0.4rem 1.35rem; }
  table { width: 100%; border-collapse: collapse; margin: 0.65rem 0; font-size: 0.88rem; page-break-inside: avoid; }
  th { background: var(--bleu); color: #fff; padding: 0.45rem 0.55rem; text-align: left; font-weight: 600; }
  td { padding: 0.4rem 0.55rem; border-bottom: 1px solid #E0E0E0; vertical-align: top; }
  tr:nth-child(even) { background: #F5F5F5; }
  .right { text-align: right; }
  .encadre {
    background: #E8F5E9;
    border-left: 4px solid var(--vert);
    padding: 0.75rem 1rem;
    margin: 0.75rem 0;
    border-radius: 0 6px 6px 0;
  }
  .encadre-orange {
    background: #FFF3E0;
    border: 2px solid var(--orange);
    border-radius: 8px;
    padding: 0.85rem 1rem;
    margin: 0.85rem 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .disclaimer {
    font-size: 0.75rem;
    color: #607D8B;
    font-style: italic;
    margin: 0.5rem 0;
    line-height: 1.4;
  }
  .footer-legal {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #BDBDBD;
    font-size: 0.7rem;
    color: #78909C;
    line-height: 1.45;
    text-align: center;
  }
  .badge { display: inline-block; background: var(--orange); color: #fff; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
  @media print {
    body { font-size: 11pt; }
    .wrap { max-width: 100%; padding: 0.5cm; }
    h2 { page-break-after: avoid; }
    table { page-break-inside: avoid; }
  }
`;

const ENTETE_HTML = `
    <div class="entete">
      <h1>ENERGIA-CONSEIL IA®</h1>
      <div class="sous">Audit Énergétique Intelligence Artificielle · Marque déposée INPI · Bureau d'études &amp; AMO</div>
      <div class="coordonnees">
        16 Rue Cuvier, 69006 Lyon · Tél. 06 10 59 68 98 · <a href="mailto:contact@energia-conseils-ia.com">contact@energia-conseils-ia.com</a><br>
        <a href="https://www.energia-conseils-ia.com" target="_blank" rel="noopener">www.energia-conseils-ia.com</a> · SIRET 94181942700019 · Responsable : Sylvain LEMBELEMBE
      </div>
    </div>
`;

// Montants TTC fournis — TVA rénovation 5,5 %
const TVA = 0.055;
const lignes = [
  { artisan: 'AKPRO (RGE E83956)', desc: 'ITI murs + Combles ISONAT', ttc: 36054 },
  { artisan: "Décoplatre L'Habitat Durable", desc: 'Planchers + Charpente', ttc: 13810 },
  { artisan: 'ECO SYSTÈME DURABLE', desc: 'PAC 6 kW + Ballon 250 L + Menuiseries + VMC double flux', ttc: 31500 },
  { artisan: 'AMO Sylvain LEMBELEMBE – ENERGIA-CONSEIL IA®', desc: 'Coordination AMO (sélection RGE, planning, suivi, réception)', ttc: 12000 }
];
lignes.forEach((l) => {
  l.ht = Math.round((l.ttc / (1 + TVA)) * 100) / 100;
  l.tva = Math.round((l.ttc - l.ht) * 100) / 100;
});
const totHT = Math.round(lignes.reduce((s, l) => s + l.ht, 0) * 100) / 100;
const totTVA = Math.round(lignes.reduce((s, l) => s + l.tva, 0) * 100) / 100;
const totTTC = lignes.reduce((s, l) => s + l.ttc, 0);

const auditHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit énergétique – GUION | ENERGIA-CONSEIL IA®</title>
  <style>${CSS_COMMON}</style>
</head>
<body>
  <div class="wrap">
    ${ENTETE_HTML}
    <p class="badge">DOCUMENT CONFIDENTIEL</p>
    <h1 style="color:var(--bleu);font-size:1.15rem;margin:0.5rem 0 0;">AUDIT ÉNERGÉTIQUE</h1>
    <p><strong>Projet :</strong> Rénovation énergétique globale – Maison individuelle · DPE visé F → B</p>
    <p><strong>Clients :</strong> M. GUION Quentin &amp; Mme GUION Romane · <a href="mailto:quentin-guion@hotmail.fr">quentin-guion@hotmail.fr</a></p>
    <p><strong>Bien :</strong> 3997 Route de la Ricamarie, 42660 Saint-Genest-Malifaux · 110 m² · Année 1980</p>
    <p><strong>Profil MaPrimeRénov' :</strong> ROSE · <strong>RFR :</strong> 80 000 € · <strong>Date du document :</strong> 9 avril 2026</p>

    <h2>I. Synthèse exécutive</h2>
    <p>La stratégie retenue vise une <strong>rénovation globale</strong> respectant l’ordre technique : isolation (combles, murs en ITI, planchers) puis menuiseries, ventilation double flux, enfin <strong>PAC air-eau 6 kW</strong> et <strong>ballon thermodynamique 250 L</strong>, avec coordination AMO et parcours MAR Léo-Energy (France Rénov’).</p>
    <p><strong>Investissement travaux TTC :</strong> 93 364 € · <strong>Aides financières 2026 (estimation à titre indicatif) :</strong> MaPrimeRénov’ 23 100 € + aide Loire 1 500 € = <strong>24 600 €</strong> · <strong>Reste à charge :</strong> 68 764 €.</p>
    <p><strong>Financement :</strong> Éco-PTZ 50 000 € (0 %, 15 ans) + dispositif courtier FABIEN (VIVONS COURTIER) pour le complément 18 764 € — bilan client environ <strong>−28 €/mois</strong> (quasi-autofinancement sur base des économies d’énergie et du plan de financement).</p>
    <p class="disclaimer">Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.</p>

    <h2>II. Fiche client</h2>
    <table>
      <tr><th>Élément</th><th>Détail</th></tr>
      <tr><td>Clients</td><td>M. GUION Quentin &amp; Mme GUION Romane</td></tr>
      <tr><td>Email</td><td>quentin-guion@hotmail.fr</td></tr>
      <tr><td>Adresse du bien</td><td>3997 Route de la Ricamarie, 42660 Saint-Genest-Malifaux</td></tr>
      <tr><td>Type / surface</td><td>Maison individuelle · 110 m²</td></tr>
      <tr><td>Année de construction</td><td>1980</td></tr>
      <tr><td>RFR (foyer fiscal)</td><td>80 000 €</td></tr>
      <tr><td>Profil MaPrimeRénov’</td><td>ROSE (taux et plafonds selon barème 2026 – à confirmer à l’instruction)</td></tr>
      <tr><td>DPE actuel → cible</td><td>F → B (objectif +4 classes)</td></tr>
      <tr><td>Responsable projet AMO</td><td>Sylvain LEMBELEMBE – 06 10 59 68 98 – contact@energia-conseils-ia.com</td></tr>
    </table>

    <h2>III. État des lieux technique et déperditions</h2>
    <p>Logement typique fin des années 1970–1980 : <strong>enveloppe peu performante</strong> (combles et murs sous-isolés ou non conformes aux objectifs RE2020), planchers peu ou non isolés, menuiseries anciennes (Uw élevé), <strong>chauffage et ECS</strong> généralement au gaz ou électrique vétustes, <strong>ventilation</strong> naturelle ou VMC simple déficiente.</p>
    <h3>Répartition indicative des déperditions thermiques (avant travaux)</h3>
    <table>
      <tr><th>Poste</th><th>Part indicative</th><th>Commentaire</th></tr>
      <tr><td>Toiture / combles</td><td>25–30 %</td><td>Priorité n°1 — fort impact sur besoins chauffage</td></tr>
      <tr><td>Murs</td><td>20–25 %</td><td>ITI ISONAT / matériaux biosourcés pour performance et confort d’été</td></tr>
      <tr><td>Menuiseries</td><td>10–15 %</td><td>Remplacement après isolation pour limiter ponts thermiques résiduels</td></tr>
      <tr><td>Planchers</td><td>7–10 %</td><td>Complémentaire au confort et au DPE</td></tr>
      <tr><td>Ventilation / ressuyage</td><td>variable</td><td>VMC double flux après enveloppe pour qualité d’air et efficacité</td></tr>
    </table>

    <h2>IV. Scénario retenu et tableau artisans</h2>
    <p><strong>Scénario « Performance » :</strong> rénovation globale coordonnée, objectif <strong>DPE B</strong>, matériaux d’isolation compatibles chantier (ISONAT / ITI), PAC dimensionnée <strong>post-isolation</strong> (6 kW), ballon thermodynamique 250 L, menuiseries performantes, VMC double flux à haut rendement.</p>
    <table>
      <tr><th>Ordre</th><th>Entreprise</th><th>Certification</th><th>Prestations</th><th class="right">Montant TTC</th></tr>
      <tr><td>1–2</td><td>AKPRO</td><td>RGE E83956</td><td>ITI murs + Combles ISONAT</td><td class="right">36 054 €</td></tr>
      <tr><td>3</td><td>Décoplatre L'Habitat Durable</td><td>RGE (à préciser sur devis signé)</td><td>Planchers + Charpente</td><td class="right">13 810 €</td></tr>
      <tr><td>4–7</td><td>ECO SYSTÈME DURABLE</td><td>RGE</td><td>Menuiseries · VMC DF · PAC 6 kW · Ballon 250 L</td><td class="right">31 500 €</td></tr>
      <tr><td>Transversal</td><td>Sylvain LEMBELEMBE – ENERGIA</td><td>AMO</td><td>Coordination, concurrence devis, suivi, réception</td><td class="right">12 000 €</td></tr>
      <tr><th colspan="4" class="right">Total travaux TTC</th><th class="right">93 364 €</th></tr>
    </table>
    <p class="disclaimer">Les montants sont ceux retenus pour le chiffrage global du dossier ; les devis détaillés par entreprise font foi pour chaque corps d’état.</p>

    <h2>V. Aides 2026</h2>
    <p class="disclaimer">Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.</p>
    <table>
      <tr><th>Aide</th><th>Montant indicatif</th></tr>
      <tr><td>MaPrimeRénov’ (profil ROSE – parcours adapté au dossier)</td><td class="right">23 100 €</td></tr>
      <tr><td>Aide locale Département de la Loire</td><td class="right">1 500 €</td></tr>
      <tr><th>Total aides estimées</th><th class="right">24 600 €</th></tr>
      <tr><th>Reste à charge après aides</th><th class="right">68 764 €</th></tr>
    </table>
    <p>Les CEE et autres primes éventuelles pourront compléter le dispositif selon éligibilité des postes et obligés ; non intégrés au présent tableau si non contractualisés.</p>

    <h2>VI. MAR Léo-Energy</h2>
    <div class="encadre-orange">
      <strong><span style="color:var(--orange);">Accompagnement MAR – Léo-Energy (France Rénov’)</span></strong>
      <p style="margin-top:0.5rem;">Prise en charge du <strong>Parcours Accompagné</strong> : audit réglementaire, montage et suivi du dossier ANAH, coordination avec l’AMO.</p>
      <p><strong>Honoraires MAR (indicatif dossier) :</strong> 1 250 € à la signature + 1 250 € à la réception — <strong>reste net client après prise en charge ANAH (profil ROSE) : environ 750 €</strong> (montants à confirmer avec le MAR et l’ANAH).</p>
      <p>Contact MAR : <strong>via Sylvain LEMBELEMBE</strong> — 06 10 59 68 98 — contact@energia-conseils-ia.com</p>
    </div>

    <h2>VII. Financement</h2>
    <ul>
      <li><strong>Éco-PTZ :</strong> 50 000 € à taux 0 % sur 15 ans (éligibilité : résidence principale &gt; 2 ans, travaux par entreprises RGE — à valider avec le courtier).</li>
      <li><strong>Complément :</strong> montage courtier <strong>FABIEN – VIVONS COURTIER</strong> — 06 71 19 96 45 — pour <strong>18 764 €</strong> (prêt travaux ou solution adaptée).</li>
      <li><strong>Reste à charge financé :</strong> 50 000 + 18 764 = 68 764 € (cohérent avec le montant après aides).</li>
      <li><strong>Bilan mensuel indicatif :</strong> environ <strong>−28 €/mois</strong> pour le foyer, compte tenu des économies d’énergie estimées et du plan de financement — simulation à affiner avec FABIEN.</li>
    </ul>
    <div class="encadre">
      <strong>Rappel réglementaire :</strong> pour bénéficier de MaPrimeRénov’ en parcours accompagné, les travaux ne doivent pas démarrer avant accord écrit de l’ANAH lorsque le dossier est déposé dans ce cadre. Toute stratégie « démarrage rapide » sans ANAH doit être validée par écrit (renonciation MPR éventuelle) avec conseil juridique.
    </div>

    <h2>VIII. Dimensionnements techniques</h2>
    <h3>PAC air-eau 6 kW</h3>
    <p><strong>Méthode (post-isolation) :</strong> puissance ≈ surface habitable × coefficient spécifique post-rénovation × marge sécurité.</p>
    <ul>
      <li>Surface : <strong>110 m²</strong></li>
      <li>Coefficient post-isolation (logement visé label basse consommation / RE2020) : <strong>0,04 à 0,05 kW/m²</strong></li>
      <li>Besoin de base : 110 × 0,045 ≈ <strong>4,95 kW</strong></li>
      <li>Marge 1,15 (pertes réseau ECS, régulation, pics hivernaux Loire) : 4,95 × 1,15 ≈ <strong>5,7 kW</strong> → <strong>unité 6 kW</strong> retenue</li>
    </ul>
    <h3>VMC double flux</h3>
    <p>Débits conformes aux besoins sanitaires : cuisine <strong>90–120 m³/h</strong>, salle de bains <strong>25–30 m³/h</strong>, WC <strong>15–30 m³/h</strong>, pièces principales en extraction / soufflage équilibrés ; rendement de récupération visé <strong>≥ 85 %</strong> sur l’échangeur.</p>
    <h3>Ballon thermodynamique 250 L</h3>
    <p>Dimensionné pour un foyer type 2–4 personnes avec <strong>PAC air-eau</strong> prioritaire chauffage ; 250 L standard pour couverture ECS avec bon COP.</p>

    <h2>IX. Résultats attendus avant / après</h2>
    <table>
      <tr><th>Indicateur</th><th>Avant (indicatif)</th><th>Après travaux (visé)</th></tr>
      <tr><td>Lettre DPE</td><td>F</td><td>B</td></tr>
      <tr><td>Confort hiver / été</td><td>Médiocre (ponts thermiques, courants d’air)</td><td>Amélioré (enveloppe + VMC)</td></tr>
      <tr><td>Facture énergie chauffage + ECS</td><td>Élevée (gaz / élec ancien)</td><td>Réduction importante (ordre <strong>70–75 %</strong> sur besoins chauffage selon usage et tarifs)</td></tr>
      <tr><td>Qualité d’air</td><td>Ventilation aléatoire</td><td>VMC double flux contrôlée</td></tr>
    </table>

    <h2>X. Planning prévisionnel (18 à 20 semaines)</h2>
    <ol>
      <li><strong>Semaines 1–2 :</strong> finalisation MAR, dépôt dossier ANAH, instruction.</li>
      <li><strong>Semaines 3–6 :</strong> validation aides (délai ANAH variable), signatures devis entreprises, planning détaillé Sylvain.</li>
      <li><strong>Semaines 7–10 :</strong> isolation combles et ITI murs (AKPRO) — météo favorable printemps–été.</li>
      <li><strong>Semaines 11–13 :</strong> planchers / charpente (Décoplatre).</li>
      <li><strong>Semaines 14–17 :</strong> menuiseries, VMC, pose PAC et ballon (ECO SYSTÈME DURABLE), raccordements, mise en service.</li>
      <li><strong>Semaines 18–20 :</strong> réglages, réception, DPE après travaux, demandes de paiement aides.</li>
    </ol>
    <p class="disclaimer">Délais sous réserve de disponibilités artisans, météo (ITI) et instruction ANAH. Éviter périodes de forte indisponibilité estivale si possible.</p>

    <h2>XI. Contacts projet</h2>
    <table>
      <tr><th>Rôle</th><th>Interlocuteur</th></tr>
      <tr><td>AMO / Coordination</td><td>Sylvain LEMBELEMBE — 06 10 59 68 98 — contact@energia-conseils-ia.com</td></tr>
      <tr><td>Commercial</td><td>DAMIEN — 06 72 68 09 68 — damien.srdconseil@gmail.com</td></tr>
      <tr><td>Courtier financement</td><td>FABIEN — VIVONS COURTIER — 06 71 19 96 45</td></tr>
      <tr><td>MAR France Rénov’</td><td>Léo-Energy (mise en relation via Sylvain)</td></tr>
      <tr><td>Juriste</td><td>Julia — Juriste ENERGIA-CONSEIL IA® (coordonnées sur demande auprès de l’AMO)</td></tr>
    </table>

    <div class="footer-legal">
      ENERGIA-CONSEIL IA® · Marque déposée INPI · SASU · SIRET 94181942700019 · 16 Rue Cuvier, 69006 Lyon<br>
      www.energia-conseils-ia.com · contact@energia-conseils-ia.com · Document confidentiel — usage client GUION — 2026
    </div>
  </div>
</body>
</html>
`;

let rowsDevis = '';
lignes.forEach((l) => {
  rowsDevis += `      <tr><td>${l.artisan}</td><td>${l.desc}</td><td class="right">${l.ht.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td><td class="right">${l.tva.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td><td class="right">${l.ttc.toLocaleString('fr-FR')} €</td></tr>\n`;
});

const devisHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devis DEV-2026-GUION-ITI-V3 | ENERGIA-CONSEIL IA®</title>
  <style>${CSS_COMMON}
    .doc-title { font-size: 1.2rem; color: var(--bleu); margin: 0.5rem 0; }
    .meta { background: #E3F2FD; padding: 0.65rem 1rem; border-radius: 6px; margin: 0.75rem 0; font-size: 0.9rem; }
    .signature-box { margin-top: 2rem; padding: 1.25rem; border: 2px dashed var(--gris); border-radius: 8px; min-height: 120px; }
  </style>
</head>
<body>
  <div class="wrap">
    ${ENTETE_HTML}
    <h1 class="doc-title">DEVIS — DEV-2026-GUION-ITI-V3</h1>
    <div class="meta">
      <strong>Date d’émission :</strong> 9 avril 2026 · <strong>Validité :</strong> 30 jours<br>
      <strong>Clients :</strong> M. GUION Quentin &amp; Mme GUION Romane — quentin-guion@hotmail.fr<br>
      <strong>Chantier :</strong> 3997 Route de la Ricamarie, 42660 Saint-Genest-Malifaux · Maison 110 m² (1980) · DPE F → B visé
    </div>

    <h2>Prestations — détail par intervenant (HT / TVA 5,5 % / TTC)</h2>
    <p>TVA applicable au taux réduit de <strong>5,5 %</strong> sous réserve d’éligibilité aux travaux de rénovation énergétique sur logement achevé depuis plus de deux ans (conditions légales à confirmer sur pièces).</p>
    <table>
      <tr><th>Entreprise / AMO</th><th>Désignation</th><th class="right">Total HT</th><th class="right">TVA 5,5 %</th><th class="right">Total TTC</th></tr>
${rowsDevis}      <tr><th colspan="2" class="right">Totaux</th><th class="right">${totHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</th><th class="right">${totTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</th><th class="right">${totTTC.toLocaleString('fr-FR')} €</th></tr>
    </table>

    <h2>Récapitulatif aides et reste à charge</h2>
    <p class="disclaimer">Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.</p>
    <table>
      <tr><td>Total travaux TTC</td><td class="right">${totTTC.toLocaleString('fr-FR')} €</td></tr>
      <tr><td>MaPrimeRénov’ (estimation)</td><td class="right">23 100 €</td></tr>
      <tr><td>Aide Département de la Loire (estimation)</td><td class="right">1 500 €</td></tr>
      <tr><th>Total aides estimées</th><th class="right">24 600 €</th></tr>
      <tr><th>Reste à charge</th><th class="right">68 764 €</th></tr>
    </table>

    <h2>Financement</h2>
    <ul>
      <li><strong>Éco-PTZ :</strong> 50 000 € — taux 0 % — 15 ans (montage par FABIEN – VIVONS COURTIER, 06 71 19 96 45).</li>
      <li><strong>Complément prêt travaux / solution courtier :</strong> 18 764 € (même interlocuteur).</li>
      <li><strong>Bilan indicatif :</strong> environ <strong>−28 €/mois</strong> pour le foyer (quasi-autofinancement).</li>
    </ul>

    <h2>Conditions de règlement — prestation AMO (12 000 € TTC)</h2>
    <div class="encadre-orange">
      <p>La prestation de <strong>coordination AMO ENERGIA-CONSEIL IA®</strong> (12 000 € TTC incluse dans le total ci-dessus) est réglée ainsi :</p>
      <ul>
        <li><strong>50 % à la signature</strong> du présent devis ou du mandat AMO (6 000 € TTC) ;</li>
        <li><strong>50 % à la réception</strong> des travaux ou à la clôture du dossier de suivi convenu (6 000 € TTC).</li>
      </ul>
      <p>Les autres corps d’état sont réglés selon les devis respectifs des entreprises RGE (acomptes et solde conformément aux contrats artisans).</p>
    </div>

    <h2>Mentions légales et avis juridique (résumé)</h2>
    <p>Devis établi sous le pilotage technique de <strong>Sylvain LEMBELEMBE</strong>. Travaux à réaliser par des entreprises <strong>certifiées RGE</strong> pour l’éligibilité aux aides. Respect impératif de l’ordre des travaux (isolation avant systèmes). Validité 30 jours. Cumul des aides ≤ 100 % du coût des travaux éligibles.</p>
    <p class="encadre" style="border-left-color:var(--orange);background:#FFF8E1;">
      <strong>⚖️ Avis juridique (Julia – Juriste ENERGIA-CONSEIL IA®)</strong> — Conformité réglementaire des postes présentés sous réserve de pièces justificatives (avis d’imposition, notice descriptive, devis entreprises). Toute décision de démarrer les travaux avant accord ANAH, si le dossier MaPrimeRénov’ est engagé, peut entraîner <strong>perte des aides</strong>. Le client reconnaît avoir été informé. <em>Avis établi sous la responsabilité de Julia – Juriste – avril 2026.</em>
    </p>
    <p>Contact société : <a href="mailto:contact@energia-conseils-ia.com">contact@energia-conseils-ia.com</a> — <a href="https://www.energia-conseils-ia.com" target="_blank" rel="noopener">www.energia-conseils-ia.com</a> — SIRET 94181942700019.</p>

    <div class="signature-box">
      <p><strong>Lu et approuvé, bon pour accord du devis DEV-2026-GUION-ITI-V3</strong></p>
      <p style="margin-top:2rem;">Fait à _____________________________, le _____________________________</p>
      <p style="margin-top:2.5rem;">Signature du client (M. ou Mme GUION) :</p>
      <p style="margin-top:3rem;border-bottom:1px solid #999;max-width:320px;">&nbsp;</p>
    </div>

    <div class="footer-legal">
      ENERGIA-CONSEIL IA® · 16 Rue Cuvier, 69006 Lyon · 06 10 59 68 98<br>
      contact@energia-conseils-ia.com · www.energia-conseils-ia.com · SIRET 94181942700019 · 2026
    </div>
  </div>
</body>
</html>
`;

const rapportHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport technique – GUION | ENERGIA-CONSEIL IA®</title>
  <style>${CSS_COMMON}</style>
</head>
<body>
  <div class="wrap">
    ${ENTETE_HTML}
    <h1 style="color:var(--bleu);font-size:1.15rem;margin:0.75rem 0 0;">RAPPORT TECHNIQUE</h1>
    <p><strong>Réf. dossier :</strong> GUION – Saint-Genest-Malifaux · <strong>Date :</strong> 9 avril 2026</p>

    <h2>Objet du rapport</h2>
    <p>Le présent rapport décrit l’état thermique du logement, les solutions techniques de rénovation énergétique retenues (ITI ISONAT, combles, planchers, menuiseries, VMC double flux, PAC 6 kW, ballon thermodynamique 250 L), les dimensionnements et les performances attendues (DPE F → B, baisse forte de la consommation). Il complète l’audit énergétique et le devis DEV-2026-GUION-ITI-V3.</p>

    <h2>Description du bien</h2>
    <p>Maison individuelle de <strong>110 m²</strong> datant de <strong>1980</strong>, située <strong>3997 Route de la Ricamarie, 42660 Saint-Genest-Malifaux</strong>. Enveloppe initialement peu performante ; systèmes de chauffage et ventilation à moderniser. Occupants : M. GUION Quentin &amp; Mme GUION Romane. Objectif réglementaire et patrimonial : atteindre une classe <strong>B</strong> au DPE.</p>

    <h2>Diagnostic thermique et déperditions par poste</h2>
    <p>L’analyse repose sur l’inspection et les données projet. Les déperditions majoritaires proviennent de la <strong>toiture/combles</strong>, des <strong>murs non isolés ou insuffisamment isolés</strong>, des <strong>menuiseries</strong> et des <strong>planchers</strong>. Le renouvellement d’air non contrôlé augmente les pertes et les risques sanitaires (humidité).</p>
    <table>
      <tr><th>Poste</th><th>Diagnostic</th><th>Priorité d’intervention</th></tr>
      <tr><td>Combles</td><td>Isolation insuffisante vs objectifs R ≥ 7–8</td><td>1 (avec murs selon planning chantier)</td></tr>
      <tr><td>Murs</td><td>Ponts thermiques, inertie pierre / parois froides</td><td>2 — ITI ISONAT / matériaux adaptés</td></tr>
      <tr><td>Planchers</td><td>Déperditions vers sous-sol / vide sanitaire</td><td>3</td></tr>
      <tr><td>Menuiseries</td><td>Uw élevé, joints vétustes</td><td>4 (après enveloppe)</td></tr>
      <tr><td>Ventilation</td><td>Pas de VMC DF performante</td><td>5 (après étanchéité à l’air améliorée)</td></tr>
      <tr><td>Chauffage / ECS</td><td>Génération ancienne, rendement faible</td><td>6–7 — PAC + ballon après isolation</td></tr>
    </table>

    <h2>Solutions techniques détaillées</h2>
    <h3>ITI et combles ISONAT (AKPRO – RGE E83956)</h3>
    <p>Isolation par l’intérieur des murs avec système compatible <strong>ISONAT</strong> / laine biosourcée ou équivalent certifié : résistance thermique visée <strong>R ≥ 3,7 m²·K/W</strong> (objectif performance). Combles : renfort pour atteindre <strong>R ≥ 7 à 8 m²·K/W</strong> selon produits et épaisseurs. Attention aux traitements pare-vapeur et continuité de l’enveloppe.</p>
    <h3>Planchers et charpente (Décoplatre L'Habitat Durable)</h3>
    <p>Isolation des planchers — objectif <strong>R ≥ 3 m²·K/W</strong> minimum sur ce type de projet ; reprise ou confortement charpente si nécessaire pour charge et durabilité des ITI/combles.</p>
    <h3>Menuiseries, VMC, PAC, ballon (ECO SYSTÈME DURABLE)</h3>
    <ul>
      <li><strong>Menuiseries :</strong> Uw ≤ 1,2 W/m²·K (objectif performance) —Uw selon produits retenus sur devis signé.</li>
      <li><strong>VMC double flux :</strong> rendement de récupération ≥ 85 % sur échangeur ; réseaux calorifugés et équilibrage.</li>
      <li><strong>PAC air-eau 6 kW :</strong> COP nominal à vérifier sur fiche produit (≥ 4 attendu pour classe A+ / bonnes pratiques 2026).</li>
      <li><strong>Ballon thermodynamique 250 L :</strong> appoint ECS décarboné couplé logiquement à la PAC.</li>
    </ul>

    <h2>Dimensionnements et calculs</h2>
    <p><strong>PAC :</strong> P ≈ 110 × 0,045 kW/m² × 1,15 ≈ 5,7 kW → <strong>6 kW</strong> nominal. La puissance est calculée <em>après</em> réduction des besoins par l’isolation ; un surdimensionnement pré-isolation entraînerait surcoût d’investissement et de consommation.</p>
    <p><strong>VMC :</strong> débit total basé sur les pièces desservies (cf. audit section VIII) — respect du règlement sanitaire dérivé (arrêté 24 mars 1982 modifié) et bonnes pratiques RE2020 pour les bâtiments rénovés.</p>
    <p><strong>Surface PV :</strong> non incluse dans le présent lot ; pourrait compléter le bilan après stabilisation des besoins (phase ultérieure possible).</p>

    <h2>Performances attendues</h2>
    <ul>
      <li><strong>DPE :</strong> passage <strong>F → B</strong> (sous réserve de modélisation ADEME et mesures réelles après travaux).</li>
      <li><strong>Consommation chauffage + ECS :</strong> réduction estimée de l’ordre de <strong>70 à 75 %</strong> par rapport au scénario avant travaux (ordre de grandeur ; dépend des usages et des tarifs).</li>
      <li><strong>Confort :</strong> température homogène, moins de courants d’air, meilleure qualité d’air via VMC DF.</li>
    </ul>

    <h2>Conformité RGE, ACERMI, RE2020</h2>
    <p>Les travaux d’isolation doivent être réalisés avec des matériaux disposant de documents techniques à jour (avis techniques ou <strong>ACERMI</strong> pour les isolants concernés). Les entreprises interviennent sous certification <strong>RGE</strong> pour l’éligibilité aux aides. La performance globale du bâtiment rénové se rapproche des exigences de <strong>RE2020</strong> en rénovation (Bbio réduit, besoins limités) sans préjuger du résultat du calcul réglementaire final.</p>

    <h2>Conclusion et recommandations</h2>
    <p>Le scénario proposé est <strong>cohérent techniquement et financièrement</strong> : ordre des travaux respecté, puissance PAC adaptée au bâtiment rénové, VMC en phase tardive du gros œuvre secondaire. Il est recommandé de : (1) verrouiller les fiches techniques des isolants et menuiseries ; (2) réaliser un test d’infiltrométrie si possible après isolation ; (3) faire établir le nouveau DPE par diagnostiqueur certifié ; (4) suivre le parcours MAR pour sécuriser les aides ANAH.</p>
    <p>Contacts : <strong>Sylvain LEMBELEMBE</strong> — 06 10 59 68 98 — contact@energia-conseils-ia.com · <strong>DAMIEN</strong> — 06 72 68 09 68 · <strong>FABIEN</strong> — 06 71 19 96 45 · MAR Léo-Energy via Sylvain.</p>

    <div class="footer-legal">
      <strong>ENERGIA-CONSEIL IA®</strong> — Bureau d’études &amp; AMO — Marque déposée INPI<br>
      16 Rue Cuvier, 69006 Lyon · www.energia-conseils-ia.com · contact@energia-conseils-ia.com<br>
      SIRET 94181942700019 · Rapport technique confidentiel — 2026
    </div>
  </div>
</body>
</html>
`;

function write(name, html) {
  const fp = path.join(root, name);
  fs.writeFileSync(fp, html, { encoding: 'utf8' });
  const st = fs.statSync(fp);
  console.log(`${name}: ${st.size} octets`);
  return fp;
}

const f1 = write('audit-energetique-guion.html', auditHtml);
const f2 = write('devis-guion.html', devisHtml);
const f3 = write('rapport-technique-guion.html', rapportHtml);

const chromeCandidates = [
  path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe')
    : ''
].filter(Boolean);

let chrome = chromeCandidates.find((c) => {
  try {
    return fs.existsSync(c);
  } catch {
    return false;
  }
});

if (chrome) {
  const urls = [f1, f2, f3].map((p) => {
    const norm = path.resolve(p).replace(/\\/g, '/');
    return `file:///${encodeURI(norm)}`;
  });
  try {
    execSync(`"${chrome}" ${urls.map((u) => `"${u}"`).join(' ')}`, { stdio: 'inherit' });
  } catch (e) {
    console.warn('Ouverture Chrome:', e.message);
  }
} else {
  console.warn('Chrome non trouvé — ouvrez manuellement les fichiers HTML.');
}
console.log('Terminé.');

