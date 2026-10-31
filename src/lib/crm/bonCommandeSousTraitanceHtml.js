/**
 * Bon de commande sous-traitance RGE & ordre de service — autoliquidation TVA 283-2 nonies CGI.
 */

import {
  cssChartePremiumEnergia,
  dateLongue,
  escapeHtml,
  euro,
  LOGO_ENERGIA_CONTRAT,
} from "./contratContractantGeneralHtml.js";
import {
  ARTICLE_CGI_AUTOLIQUIDATION,
  MODE_POSE_SEULE,
  MENTION_AUTOLIQUIDATION_TVA,
  chargerReferentiel,
  decomposerLigneSousTraitance,
  resoudreArtisanPourLigne,
} from "./artisansRge.js";
import { calculerFraisDeplacementArtisanHt } from "../chiffrage/frais-deplacement-artisan.js";
import { BRUNEL_DOSSIER_ID } from "./brunelWorkingBase.js";

export const DATE_INTERVENTION_BRUNEL_BC = "À coordonner après validation Anah - Octobre 2026";
export const CLIENT_BC_BRUNEL = "M. Emrick BRUNEL (Indivision COUBLE)";
export const ADRESSE_CHANTIER_BRUNEL = "48 Impasse des Lagunes";
export const CP_CHANTIER_BRUNEL = "42510";
export const VILLE_CHANTIER_BRUNEL = "BUSSIÈRES";
export const MONTANT_ST_C2L_BRUNEL_HT = 1050;

function ligneTache(ligne, referentiel) {
  const d = decomposerLigneSousTraitance(ligne, referentiel);
  const mode = d.mode === MODE_POSE_SEULE ? "Pose seule — matériel fourni par ENERGIA-CONSEIL IA®" : "Fourniture + pose par l’artisan";
  const montant = d.mode === MODE_POSE_SEULE ? d.coutPoseSeuleHt : d.coutFourniturePoseHt;
  return {
    nom: ligne.designationBonCommande || ligne.nom || "Poste",
    specs: ligne.specifications || "",
    quantite: d.quantite,
    unite: d.unite || ligne.unite || "",
    mode,
    fourniturePar: d.fourniturePar || "",
    montantHt: montant ?? 0,
  };
}

function htmlCorpsCahierPrescriptionsAnah() {
  return `<p>Chaque sous-traitant doit impérativement respecter le descriptif technique normalisé ci-dessous lors de l’exécution.</p>
      <h3>1. Prescriptions lot 1 — Isolation combles perdus (C2L)</h3>
      <ul>
        <li>Matériau obligatoire : laine minérale de roche à souffler certifiée ACERMI en cours de validité.</li>
        <li>Épaisseur minimale requise : 300 mm après tassement pour garantir une résistance thermique certifiée R ≥ 7,00 m².K/W (norme NF EN 13162).</li>
        <li>Règles de pose DTU 45.11 : piges de mesure d’épaisseur graduées scellées au sol, repérage et protection des boîtiers électriques, écart au feu incombustible autour du conduit de fumée/cheminée.</li>
        <li>Justificatif obligatoire à remettre à ENERGIA-CONSEIL IA® : fiche de fin de chantier mentionnant le numéro de lot ACERMI, la marque et le nombre de sacs soufflés sur les 35 m².</li>
      </ul>
      <h3>2. Prescriptions lot 2 — Menuiseries, baie &amp; porte (Bonheur d’Amarante)</h3>
      <ul>
        <li>Menuiseries PVC entrée (2 unités) : double vitrage 4/16/4 gaz Argon Warm Edge, Uw ≤ 1,30 W/m².K, Sw ≥ 0,36, vitrage certifié CEKAL.</li>
        <li>Porte d’entrée isolée : ouvrant monobloc haute performance thermique Ud ≤ 1,30 W/m².K, classement AEV conforme.</li>
        <li>Baie vitrée coulissante alu 215×240 : profils à rupture de pont thermique complète, Uw ≤ 1,40 W/m².K, Sw ≥ 0,36.</li>
        <li>Ouverture mur porteur : pose sous linteau acier IPN/HEB avec assises en béton armé conformes au DTU maçonnerie, étanchéité à l’air soignée.</li>
        <li>Justificatifs obligatoires : attestations de performances thermiques éditées par le fabricant / gammiste.</li>
      </ul>
      <h3>3. Prescriptions lot 3 — Chauffage &amp; fluides (SMN ÉNERGIES / Mustafa HEZEN)</h3>
      <ul>
        <li>Pompe à chaleur Air/Air Daikin Multi-Split (5 unités intérieures) : rendement saisonnier certifié SCOP ≥ 4,20 (classe A++), fluide R32.</li>
        <li>Chauffe-eau thermodynamique 200 L : coefficient de performance certifié COP ≥ 2,50 selon la norme EN 16147 (mesuré à 7 °C d’air ambiant), classe A+.</li>
        <li>VMC Hygro B : caisson basse consommation micro-watt (conso électrique &lt; 15 W-Th-C), gaines isolées en volume non chauffé (DTU 68.3), bouches hygroréglables certifiées CSTBat.</li>
        <li>Justificatifs obligatoires : fiches techniques constructeurs Daikin et fabricant CET, attestation de mise en service et d’étanchéité frigorifique cerfa 15497.</li>
      </ul>
      <h3>4. Engagement du sous-traitant</h3>
      <p>Le sous-traitant certifie sur l’honneur détenir la qualification RGE requise en cours de validité à la date des travaux et s’engage à exécuter les prestations en conformité stricte avec les fiches techniques fabricants et les règles de l’art pour garantir l’obtention des subventions de l’Anah.</p>`;
}

function htmlCahierPrescriptionsAnah() {
  return `<section class="bloc keep">
      <h2>VI. Cahier des Prescriptions Techniques Normalisées &amp; Conformité Réglementaire Anah</h2>
      ${htmlCorpsCahierPrescriptionsAnah()}
    </section>`;
}

export function payloadBonCommandeSousTraitance({
  artisan,
  lignes = [],
  client = {},
  chantier = {},
  dateIntervention = "",
  numero = "",
  distanceAllerKm = null,
  joursDePose = 1,
  referentiel = chargerReferentiel(),
  dateInterventionLibelle = "",
  inclureCahierAnah = false,
} = {}) {
  const artisanResolu = artisan || resoudreArtisanPourLigne(lignes[0], referentiel?.artisans || []);
  const taches = lignes.map((ligne) => ligneTache(ligne, referentiel));
  const calculDeplacement = calculerFraisDeplacementArtisanHt(distanceAllerKm, joursDePose);
  const fraisDeplacementHt = calculDeplacement?.fraisDeplacementHt ?? 0;
  if (fraisDeplacementHt > 0) {
    taches.push({
      nom: "Frais de déplacement et logistique chantier (> 30 km)",
      specs: `${calculDeplacement.distanceHorsZoneKm} km hors zone · ${calculDeplacement.trajetsAR} trajets aller-retour · 2,00 € HT/km`,
      quantite: 1,
      unite: "forfait",
      mode: "Déplacement et logistique chantier",
      fourniturePar: "Artisan sous-traitant",
      montantHt: fraisDeplacementHt,
    });
  }
  const totalHt = Math.round(taches.reduce((s, t) => s + (Number(t.montantHt) || 0), 0) * 100) / 100;
  const iso = dateIntervention || new Date().toISOString().slice(0, 10);
  const dateInterventionAffichee = dateInterventionLibelle || dateLongue(iso);
  return {
    numero:
      numero ||
      `BC-ST-2026-${String(artisanResolu?.id || "rge")
        .replace(/[^a-z0-9]+/gi, "-")
        .toUpperCase()}`,
    dateTxt: dateLongue(iso),
    dateIntervention: dateInterventionAffichee,
    inclureCahierAnah,
    artisan: artisanResolu,
    client,
    chantier,
    taches,
    distanceAllerKm,
    joursDePose,
    fraisDeplacementHt,
    totalHt,
    mentionAutoliquidation: referentiel?.mentionAutoliquidation || MENTION_AUTOLIQUIDATION_TVA,
    articleCgi: referentiel?.articleCgi || ARTICLE_CGI_AUTOLIQUIDATION,
  };
}

export function htmlBonCommandeSousTraitance(payload) {
  const a = payload.artisan || {};
  const c = payload.client || {};
  const ch = payload.chantier || {};
  const rows = (payload.taches || [])
    .map(
      (t) => `<tr>
        <td><strong>${escapeHtml(t.nom)}</strong>${t.specs ? `<br><span class="muted">${escapeHtml(t.specs)}</span>` : ""}</td>
        <td>${escapeHtml(t.quantite)} ${escapeHtml(t.unite)}</td>
        <td>${escapeHtml(t.mode)}<br><span class="muted">${escapeHtml(t.fourniturePar)}</span></td>
        <td class="montant">${euro(t.montantHt)} €</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(payload.numero)} — Bon de commande sous-traitance RGE</title>
  <style>${cssChartePremiumEnergia(payload.numero)}</style>
</head>
<body>
  <div class="no-print toolbar">
    <button type="button" onclick="window.print()">Imprimer</button>
  </div>
  <article class="sheet">
    <header class="header">
      <div class="header-row">
        <div class="left">
          <img class="logo" src="${LOGO_ENERGIA_CONTRAT}" alt="ENERGIA-CONSEIL IA" />
          <div class="brand">ENERGIA-CONSEIL IA®</div>
          <div class="company">Contractant Général · 16 Rue Cuvier, 69006 Lyon · SIRET 94181942700019</div>
        </div>
        <div class="right">
          <div class="doc-title">BON DE COMMANDE SOUS-TRAITANCE<br>&amp; ORDRE DE SERVICE</div>
          <p class="meta">${escapeHtml(payload.numero)} · ${escapeHtml(payload.dateTxt)}</p>
        </div>
      </div>
    </header>

    <section class="bloc keep">
      <h2>I. Donneur d’ordre — Contractant Général</h2>
      <p><strong>ENERGIA-CONSEIL IA®</strong> — SASU · 16 Rue Cuvier, 69006 Lyon<br>
      SIRET 94181942700019 · RCS Lyon 941819427<br>
      Coordination : <strong>Sylvain LEMBELEMBE</strong> (Contractant Général) — 06 10 59 68 98 — contact@energia-conseil-ia.com</p>
    </section>

    <section class="bloc keep">
      <h2>II. Sous-traitant RGE</h2>
      <table>
        <tr><th>Raison sociale</th><td>${escapeHtml(a.raisonSociale || "")}${a.enseigne ? ` — ${escapeHtml(a.enseigne)}` : ""}</td></tr>
        <tr><th>Forme / Dirigeant</th><td>${escapeHtml(a.forme || "")} · ${escapeHtml(a.dirigeant || "")}</td></tr>
        <tr><th>SIRET</th><td>${escapeHtml(a.siret || "")}${a.siretStatut === "a_confirmer" ? " (à confirmer sur Kbis)" : ""}</td></tr>
        <tr><th>Contact</th><td>${escapeHtml(a.telephone || "")} · ${escapeHtml(a.email || "")}</td></tr>
        <tr><th>Adresse</th><td>${escapeHtml(a.adresse || "")}</td></tr>
        <tr><th>Qualification RGE</th><td>${escapeHtml(a.rge?.organisme || "")} n° ${escapeHtml(a.rge?.numero || "")} — validité ${escapeHtml(a.rge?.validite || "")}</td></tr>
        <tr><th>Décennale</th><td>${escapeHtml(a.decennale?.compagnie || "")} — police ${escapeHtml(a.decennale?.police || "")}</td></tr>
        <tr><th>Contrat</th><td>${escapeHtml(a.contratSousTraitance?.type || "Contrat de sous-traitance BTP")} — autoliquidation TVA (${escapeHtml(payload.articleCgi)})</td></tr>
      </table>
    </section>

    <section class="bloc keep">
      <h2>III. Client &amp; chantier</h2>
      <table>
        <tr><th>Client</th><td>${escapeHtml(c.nom || "Client")} ${escapeHtml(c.prenom || "")}</td></tr>
        <tr><th>Adresse du chantier</th><td>${escapeHtml(ch.adresse || c.adresse || "")}<br>${escapeHtml(ch.codePostal || c.codePostal || "")} ${escapeHtml(ch.ville || c.ville || "")}</td></tr>
        <tr><th>Date d’intervention</th><td>${escapeHtml(payload.dateIntervention)}</td></tr>
      </table>
    </section>

    <section class="bloc keep">
      <h2>IV. Descriptif des tâches${payload.inclureCahierAnah ? " &amp; Montant" : ""}</h2>
      <p class="muted">Mention expresse de la fourniture du matériel : ENERGIA-CONSEIL IA® (achat direct) ou artisan selon le mode retenu sur chaque poste.</p>
      <table>
        <thead>
          <tr>
            <th>Désignation</th>
            <th>Qté</th>
            <th>Fourniture / pose</th>
            <th>Montant HT forfaitaire</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td colspan="3">TOTAL HT FORFAITAIRE CONVENU</td>
            <td class="montant">${euro(payload.totalHt)} €</td>
          </tr>
        </tbody>
      </table>
    </section>

    ${payload.inclureCahierAnah ? htmlCahierPrescriptionsAnah() : ""}

    <section class="bloc keep">
      <h2>${payload.inclureCahierAnah ? "VII" : "V"}. Conditions de facturation</h2>
      <div class="disclaimer">
        <strong>${escapeHtml(payload.mentionAutoliquidation)}</strong><br>
        Le sous-traitant facture exclusivement hors taxes. La TVA est autoliquidée par ENERGIA-CONSEIL IA®, donneur d’ordre, conformément à l’${escapeHtml(payload.articleCgi)}.
        Aucun règlement hors circuit Contractant Général. Intervention coordonnée par Sylvain LEMBELEMBE.
      </div>
    </section>

    <section class="bloc keep">
      <h2>${payload.inclureCahierAnah ? "VIII" : "VI"}. Bon pour accord</h2>
      <p>Fait à Lyon, le ${escapeHtml(payload.dateTxt)}.</p>
      <table>
        <tr>
          <th style="width:50%">ENERGIA-CONSEIL IA® — Sylvain LEMBELEMBE<br>Contractant Général</th>
          <th>Sous-traitant RGE — ${escapeHtml(a.raisonSociale || "")}</th>
        </tr>
        <tr>
          <td style="height:72px">Signature :</td>
          <td>Signature :</td>
        </tr>
      </table>
    </section>
    ${
      payload.inclureCahierAnah
        ? `<section class="bloc keep">
      <h2>Annexe — Cahier des Prescriptions Techniques Normalisées &amp; Conformité Réglementaire Anah</h2>
      <p>La présente annexe fait partie intégrante du bon de commande ${escapeHtml(payload.numero)}. Le sous-traitant reconnaît avoir pris connaissance de l’ensemble des prescriptions des lots 1, 2 et 3 et s’engage sur le lot qui lui est commandé.</p>
      <h3>Rappel des prescriptions contractuelles</h3>
      ${htmlCorpsCahierPrescriptionsAnah()}
      <p>Fait à Lyon. Signature du sous-traitant, précédée de la mention « lu et approuvé — certification RGE en cours de validité » :</p>
      <p style="height:72px">Signature :</p>
    </section>`
        : ""
    }
  </article>
</body>
</html>`;
}

export function htmlBonCommandePourGroupe({
  artisan,
  lignes,
  dossier,
  edition,
  dateIntervention,
  distanceAllerKm = null,
  joursDePose = 1,
}) {
  const client = edition?.client || {};
  const estBrunel =
    dossier?.id === BRUNEL_DOSSIER_ID || /brunel/i.test(`${dossier?.client || ""} ${dossier?.nom || ""} ${client.nom || ""}`);
  const payload = payloadBonCommandeSousTraitance({
    artisan,
    lignes,
    client: estBrunel
      ? {
          nom: CLIENT_BC_BRUNEL,
          prenom: "",
          adresse: ADRESSE_CHANTIER_BRUNEL,
          codePostal: CP_CHANTIER_BRUNEL,
          ville: VILLE_CHANTIER_BRUNEL,
        }
      : {
          nom: client.nom || dossier?.client || dossier?.nom,
          prenom: client.prenom || "",
          adresse: client.adresse || dossier?.adresse,
          codePostal: client.codePostal || dossier?.codePostal,
          ville: client.ville || dossier?.ville,
        },
    chantier: estBrunel
      ? {
          adresse: ADRESSE_CHANTIER_BRUNEL,
          codePostal: CP_CHANTIER_BRUNEL,
          ville: VILLE_CHANTIER_BRUNEL,
        }
      : {
          adresse: client.adresse || dossier?.adresse,
          codePostal: client.codePostal || dossier?.codePostal,
          ville: client.ville || dossier?.ville,
        },
    dateIntervention,
    dateInterventionLibelle: estBrunel ? DATE_INTERVENTION_BRUNEL_BC : "",
    inclureCahierAnah: estBrunel,
    distanceAllerKm,
    joursDePose,
  });
  return htmlBonCommandeSousTraitance(payload);
}

export function nomFichierBonCommande(artisan, dossier) {
  const estBrunel = dossier?.id === BRUNEL_DOSSIER_ID || /brunel/i.test(`${dossier?.client || ""} ${dossier?.nom || ""}`);
  if (estBrunel && artisan?.id === "c2l-isolation") return "c2l-isolation-chantier.html";
  const slug = String(artisan?.id || "rge").replace(/[^a-z0-9]+/gi, "-");
  const client = String(dossier?.id || "chantier").replace(/[^a-z0-9]+/gi, "-");
  return `BC-ST-2026-${slug}-${client}.html`;
}
