/**
 * Rapport technique complet — RAPPORT_TECHNIQUE_PEREIRA_NERVIEUX_2026.html
 * Charte premium identique au contrat Brunel / Pereira.
 */

import { cssChartePremiumEnergia, htmlAnnexePhotosPereira, LOGO_ENERGIA_CONTRAT } from "./devisPereiraNervieuxHtml.js";
import { htmlBadgesOfficiels, htmlPiedIdentite } from "../branding.ts";
import {
  AIDES_PEREIRA_VIOLET,
  CLIENT_PEREIRA_NERVIEUX,
  CONTACTS_PEREIRA_CONTRAT,
  EXCLUSION_ITI_PEREIRA,
  FICHIER_RAPPORT_PEREIRA_NERVIEUX,
  FINANCEMENT_PEREIRA_CG,
  FISCALITE_AVIS_PEREIRA,
  METRES_PEREIRA_NERVIEUX,
  PEREIRA_NERVIEUX_DATE,
  PEREIRA_NERVIEUX_NUMERO,
  POSTES_PEREIRA_NERVIEUX,
  PRESTATAIRE_ENERGIA,
  TOTAUX_CG_20_PEREIRA,
  TOTAUX_PEREIRA_NERVIEUX,
  TOTAUX_TRAVAUX_55_PEREIRA,
} from "./pereiraNervieuxOfficiel.js";

function euro(n) {
  return Number(n)
    .toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/[\u00a0\u202f]/g, " ");
}

export function construireHtmlRapportPereiraNervieux() {
  const c = CLIENT_PEREIRA_NERVIEUX;
  const p = PRESTATAIRE_ENERGIA;
  const t = TOTAUX_PEREIRA_NERVIEUX;
  const travaux = TOTAUX_TRAVAUX_55_PEREIRA;
  const cg = TOTAUX_CG_20_PEREIRA;
  const a = AIDES_PEREIRA_VIOLET;
  const f = FINANCEMENT_PEREIRA_CG;
  const fisc = FISCALITE_AVIS_PEREIRA;
  const m = METRES_PEREIRA_NERVIEUX;
  const lignes = POSTES_PEREIRA_NERVIEUX.map(
    (poste) =>
      `<tr><td class="num-col">${poste.ordreThermique}</td><td><strong>${poste.nom}</strong><div class="muted">${poste.specifications}</div></td><td class="num">${poste.quantite} ${poste.unite}</td><td class="montant">${euro(poste.totalHt)} €</td><td class="montant">${euro(poste.totalTtc)} €</td></tr>`,
  ).join("");
  const contactsRows = CONTACTS_PEREIRA_CONTRAT.map(
    (item) => `<tr>
      <th>${item.role}</th>
      <td><strong>${item.nom}</strong><div class="muted">${item.detail}</div></td>
    </tr>`,
  ).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rapport technique — ${c.prenom} ${c.nom} — Nervieux | ENERGIA-CONSEIL IA®</title>
  <style>${cssChartePremiumEnergia()}</style>
</head>
<body>
  <div class="toolbar no-print">
    <button type="button" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
  </div>
  <article class="sheet">
    <header class="header keep">
      <div class="header-row">
        <div class="left">
          <img class="logo" src="${LOGO_ENERGIA_CONTRAT}" alt="ENERGIA-CONSEIL IA®" />
          <div class="brand">ENERGIA-CONSEIL IA®</div>
          <div class="company">
            Audit Énergétique Intelligence Artificielle · Marque déposée INPI n°${p.inpi}<br>
            ${p.forme} — ${p.adresse}<br>
            SIRET ${p.siret} — RCS ${p.rcs} — TVA ${p.tva}
            ${htmlBadgesOfficiels()}
          </div>
        </div>
        <div class="right">
          <div class="meta">
            Rapport technique ${PEREIRA_NERVIEUX_NUMERO}<br>
            Date : ${PEREIRA_NERVIEUX_DATE}<br>
            DPE ${c.dpeActuel} ➔ ${c.dpeCible} · 164 m² · sans ITI
          </div>
        </div>
      </div>
      <div class="doc-title">RAPPORT TECHNIQUE — Rénovation globale clé en main (sans ITI)</div>
    </header>

    <section class="bloc keep">
      <h2>I. Synthèse exécutive</h2>
      <p>Bouquet PAC air/eau HT chauffage seul + CET 250 L + menuiseries 19,38 m² + combles 60 m² + plancher 19 m² + VMC hygro B. Contrat ${euro(t.totalTtc)} € TTC. Aides 2026 à titre indicatif : ${euro(a.totalAides)} € (MPR ${euro(a.mpr)} € + MAR ${euro(a.mar)} €). Reste à charge ${euro(a.resteACharge)} €, Éco-PTZ 0 % 20 ans = ${euro(a.mensualite20)} €/mois. ${EXCLUSION_ITI_PEREIRA.mention}</p>
    </section>

    <section class="bloc keep">
      <h2>II. Fiche client détaillée</h2>
      <table>
        <tr><th>Client</th><td>Monsieur ${c.prenom} ${c.nom}</td></tr>
        <tr><th>Adresse / zone</th><td>${c.adresse} — ${c.zoneClimatique}, ${c.altitudeM} m, département ${c.departement}</td></tr>
        <tr><th>Bien</th><td>${c.typeBien} — ${c.surfaceHabitable} m² — ${c.anneeConstruction}</td></tr>
        <tr><th>RFR / parts / profil</th><td>${euro(fisc.rfr)} € · ${fisc.parts} part · ${fisc.libelleProfil}</td></tr>
        <tr><th>DPE / CEP</th><td>${c.dpeActuel} ➔ ${c.dpeCible} · ${c.cepInitial} ➔ ${c.cepCible} kWhEP/m².an (−${c.gainEpPct} %)</td></tr>
        <tr><th>Facture chauffage avant</th><td>${euro(c.factureAvantMin)} à ${euro(c.factureAvantMax)} €/an (indicatif)</td></tr>
      </table>
    </section>

    <section class="bloc">
      <h2>III. État des lieux technique approfondi</h2>
      <p>Chaudière fioul en cave (usure avancée, réseau HT conservable pour PAC air/eau). Menuiseries bois / simple vitrage 19,38 m². Combles perdus 60 m² accessibles. Plancher bas cave 19 m². VMC à créer. Murs : ITI non retenue.</p>
      ${htmlAnnexePhotosPereira({ avecAudit: true })}
      <div class="alert-red">
        <strong>Analyse d'état d'usure et non-nécessité de l'ITI.</strong> Les 164 m² habitables sont à préserver. Le saut certifié F ➔ C (−67 % EP) est obtenu par le bouquet PAC + menuiseries + combles ${m.comblesM2} m² + plancher ${m.plancherM2} m². L'ITI 12 cm n'est pas nécessaire à l'éligibilité Parcours 3 classes et provoquerait une perte de surface + nuisances de doublage. Économie ${euro(EXCLUSION_ITI_PEREIRA.economieHt)} € HT / ${euro(EXCLUSION_ITI_PEREIRA.economieTtc)} € TTC.
      </div>
    </section>

    <section class="bloc keep">
      <h2>IV. Analyse des déperditions</h2>
      <p>Priorité : combles (≈ 25–30 %) puis plancher bas cave (7–10 %) puis menuiseries (10–15 %) puis système (fioul ➔ PAC + CET). Isolation avant dimensionnement PAC. Ordre thermique : 1 combles, 3 plancher, 4 menuiseries, 5 VMC, 6 PAC, 7 CET 250 L.</p>
    </section>

    <section class="bloc keep">
      <h2>V. Solution technique recommandée</h2>
      <p>Scénario Performance sans ITI, objectif DPE C. PAC air/eau HT chauffage seul (radiateurs fonte, 65 °C / 75 °C) + ballon thermodynamique 250 L indépendant. Pas de multi-split. Menuiseries Uw ≤ 1,30. Combles R ≥ 7. Plancher R ≥ 3. VMC SF hygro B. 0 m² d'ITI.</p>
    </section>

    <section class="bloc keep">
      <h2>VI. Détail technique des postes</h2>
      <table>
        <thead><tr><th>Ordre thermique</th><th>Poste</th><th>Qté</th><th>HT</th><th>TTC</th></tr></thead>
        <tbody>${lignes}</tbody>
      </table>
    </section>

    <section class="bloc keep">
      <h2>VII. Dimensionnements justifiés</h2>
      <p>PAC : dimensionnement POST-isolation (164 m², cible C, coef RE2020 0,03–0,05 kW/m² × marge 1,1–1,2). Réseau radiateurs fonte HT existant conservé. ECS par CET 250 L indépendant (COP ≥ 3,0). VMC SF hygro B dimensionnée 164 m² / HSP 2,50 m.</p>
    </section>

    <section class="bloc keep">
      <h2>VIII. Récapitulatif financier</h2>
      <table>
        <tr><td>Travaux TVA 5,5 %</td><td class="montant">${euro(travaux.totalHt)} € HT · ${euro(travaux.totalTva)} € TVA</td></tr>
        <tr><td>Contractant Général — lot 8 — TVA 5,5 %</td><td class="montant">${euro(cg.totalHt)} € HT · ${euro(cg.totalTva)} € TVA</td></tr>
        <tr class="total-row"><td>Total marché</td><td class="montant">${euro(t.totalHt)} € HT / ${euro(t.totalTtc)} € TTC</td></tr>
      </table>
      <div class="disclaimer">
        <strong>Aides financières 2026 (estimation à titre indicatif).</strong> Aides à valider selon revenus réels du client. Montants définitifs après instruction ANAH et CEE.
        MPR ${euro(a.mpr)} € + MAR ${euro(a.mar)} € = ${euro(a.totalAides)} €. RAC ${euro(a.resteACharge)} €.
      </div>
    </section>

    <section class="bloc keep">
      <h2>IX. Aides (estimation indicative)</h2>
      <p>Profil Violet, 1 part, hors IDF, RFR ${euro(fisc.rfr)} €. Parcours 3 classes, taux 45 %, base HT ${euro(a.travauxEligiblesHt)} € (hors CG). ${a.libelleCee}. Écrêtement 80 % TTC = ${euro(a.plafondEcretement)} €, non saturé. ${fisc.mention}</p>
    </section>

    <section class="bloc keep">
      <h2>X. PLAN DE FINANCEMENT &amp; SCÉNARIOS DE DÉMARRAGE</h2>
      <p>Éco-PTZ 0 % 20 ans : ${euro(a.mensualite20)} €/mois sur RAC ${euro(a.resteACharge)} €. Courtier en travaux &amp; financements : FABIEN — VIVONS COURTIER — 06 71 19 96 45 (prêts travaux 6 000 € à 75 000 €). L'Éco-PTZ à taux 0 % est instruit en banque partenaire avec le dossier technique ENERGIA. Déblocage 30/40/30 : ${euro(f.acompte)} / ${euro(f.intermediaire)} (validation de Sylvain LEMBELEMBE, Contractant Général — ENERGIA-CONSEIL IA®) / ${euro(f.solde)} €. NE JAMAIS SIGNER LES DEVIS DÉFINITIFS AVANT L'ACCORD ÉCRIT DE L'ANAH.</p>
    </section>

    <section class="bloc keep">
      <h2>XI. Planning détaillé avec malus</h2>
      <p>ANAH 3–6 mois puis chantier (éviter juil–août). Combles 2–3 j, plancher 1–2 sem, menuiseries 2–3 sem, VMC 3–5 j, PAC 2–3 sem, CET 2–3 j. Réunions J-7, hebdo, mi-parcours (validation Sylvain), réception Sylvain + MAR + client.</p>
    </section>

    <section class="bloc keep">
      <h2>XII. Artisans RGE sélectionnés</h2>
      <p>PAC : ECO SYSTÈME DURABLE (à confirmer). Menuiseries / isolation / VMC : réseau RGE, 2–3 devis par poste coordonnés par Sylvain LEMBELEMBE.</p>
    </section>

    <section class="bloc keep">
      <h2>XIII. Résultats attendus</h2>
      <p>DPE F ➔ C, CEP 337 ➔ 111 kWhEP/m².an (−67 %). Sortie de passoire. Confort HT conservé. Surface 164 m² préservée.</p>
    </section>

    <section class="bloc keep">
      <h2>XIV. Avis juridique (Julia)</h2>
      <div class="julia">
        <p>Conformité RGE, aides 2026 Violet, ordre isolation avant PAC, exclusion ITI. Clause Julia Protection Aides plafonnée à 2 000 €. ENERGIA-CONSEIL IA® intervient en qualité exclusive de CONTRACTANT GÉNÉRAL. Avis établi sous la responsabilité de Julia, juriste. ${PEREIRA_NERVIEUX_DATE}.</p>
      </div>
    </section>

    <section class="bloc keep">
      <h2>XV. Contacts projet</h2>
      <table class="contacts-table">${contactsRows}</table>
    </section>

    <section class="bloc keep">
      <h2>XVI. Annexes A à I</h2>
      <p>A. Barèmes MPR 2026 Violet 45 % / max 18 000 € / écrêtement 80 %. B. CEE intégrées au taux Parcours. C. Éco-PTZ 50 000 € max, 20 ans. D. Artisans RGE à sélectionner. E. Certifications RGE. F. TVA mixte 5,5 % / 20 %. G. Ordre travaux. H. Déblocage 30/40/30. I. Photos visite AUDIT-PEREIRA-2026-001.</p>
    </section>

    <section class="bloc keep">
      <h2>XVII. Mentions légales</h2>
      <div class="footer-doc">
        ${htmlPiedIdentite()}
        <p>Document confidentiel 2026. Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.</p>
      </div>
    </section>
  </article>
</body>
</html>`;
}

export { FICHIER_RAPPORT_PEREIRA_NERVIEUX };
