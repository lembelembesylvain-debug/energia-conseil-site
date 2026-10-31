/**
 * Payloads du Template Master Contractant Général.
 * Brunel / Pereira : données officielles verrouillées.
 * Autres dossiers : injection depuis l’édition CRM.
 */

import {
  AIDES_BRUNEL_V3,
  ALERTE_INDIVISION_COUBLE_815,
  BRUNEL_CONTRAT_TITRE,
  BRUNEL_FINAL_NUMERO,
  BRUNEL_V3_DATE,
  CADRE_JURIDIQUE_INDIVISION_815,
  CLIENT_BRUNEL_V3,
  DEVIS_FACADE_NUMERO,
  FINANCEMENT_BRUNEL_V3,
  NOTE_DEVIS_FACADE_V1,
  NOTE_PORTE_SERVICE_HORS_MARCHE,
  POSTE_HORS_SUBVENTION_BRUNEL,
  PRESTATAIRE_ENERGIA,
  TOTAUX_FACADE_BRUNEL,
  TOTAUX_FACADE_BRUNEL_V4,
  STATUT_DOSSIER_BRUNEL_V3,
  TOTAUX_BRUNEL_V3,
  totauxContractuelsBrunelV3,
} from "./brunelDevisV3Officiel.js";
import {
  AIDES_BRUNEL_V5_AUTONOMIE,
  AIDES_BRUNEL_V5_PERFORMANCE,
  BRUNEL_V5_DATE,
  FINANCEMENT_BRUNEL_V5_AUTONOMIE,
  FINANCEMENT_BRUNEL_V5_PERFORMANCE,
  IMAGES_CONTRAT_BRUNEL_V5,
  KPI_ROI_BRUNEL_DEFAUT,
  METRIQUES_SOLAIRES_BRUNEL,
  NOTE_METHODO_ROI_BRUNEL,
  NOTE_SOLAIRE_HORS_MPR,
  OFFRE_AUTONOMIE,
  OFFRE_PERFORMANCE,
  TABLEAU_AMORTISSEMENT_OFFICIEL_BRUNEL,
  TOTAUX_BRUNEL_V5_CUMUL,
  TOTAUX_BRUNEL_V5_PERFORMANCE,
  TOTAUX_BRUNEL_V5_SOLAIRE,
  libelleOffreBrunel,
  normaliserOffreBrunel,
  totauxContractuelsBrunelV5,
} from "./brunelOffresV5.js";
import {
  AIDES_PEREIRA_VIOLET,
  CLIENT_PEREIRA_NERVIEUX,
  CONTACTS_PEREIRA_CONTRAT,
  EXCLUSION_ITI_PEREIRA,
  FINANCEMENT_PEREIRA_CG,
  FISCALITE_AVIS_PEREIRA,
  PAIRES_PHOTOS_CONTRAT_PEREIRA,
  PEREIRA_CONTRAT_TITRE,
  PEREIRA_NERVIEUX_DATE,
  PEREIRA_NERVIEUX_DOSSIER_ID,
  PEREIRA_NERVIEUX_NUMERO,
  PHOTOS_CONTRAT_PEREIRA,
  POSTES_PEREIRA_NERVIEUX,
  TOTAUX_CG_20_PEREIRA,
  TOTAUX_PEREIRA_NERVIEUX,
  TOTAUX_TRAVAUX_55_PEREIRA,
} from "./pereiraNervieuxOfficiel.js";
import { BRUNEL_DOSSIER_ID } from "./brunelWorkingBase.js";
import {
  DETAIL_JALON_BRUNEL_DEPOT_MAR,
  LIGNES_DEVIS_HORS_ANAH,
  MAR_BRUNEL,
  MAR_BRUNEL_JAUNE,
  OFFRE_BRUNEL_OPTION_SANS_BAIE,
  TOTAUX_DEVIS_HORS_ANAH,
  TOTAUX_OPTION_BAIE,
  TOTAUX_OPTION_SANS_BAIE,
  offreMarcheBrunelActive,
} from "./brunelMarcheOfficiel2026.js";
import {
  CLIENT_CLOISON_SDB,
  CLOISON_SDB_CONTRAT_DATE,
  CLOISON_SDB_CONTRAT_NUMERO,
  CLOISON_SDB_CONTRAT_TITRE,
  CLOISON_SDB_DOSSIER_ID,
  CLOISON_SDB_REFERENCE,
  EQUIPE_CLOISON_SDB,
  FINANCEMENT_CLOISON_SDB,
  MENTION_HORS_MPR_CLOISON_SDB,
  PHOTOS_TERRAIN_CLOISON_SDB,
  POSTES_CLOISON_SDB_CONTRAT,
  TOTAUX_CLOISON_SDB,
  editionOfficielleCloisonSdb,
} from "./cloisonSdbOfficiel.js";
import {
  CLAUSES_PLANNING_GILBERTAS,
  CLIENT_GILBERTAS,
  CONTACTS_CLIENT_GILBERTAS,
  ELECTROMENAGER_GILBERTAS,
  EQUIPE_GILBERTAS,
  FACTURE_ACOMPTE_GILBERTAS,
  FINANCEMENT_GILBERTAS,
  GILBERTAS_CONTRAT_DATE,
  GILBERTAS_CONTRAT_NUMERO,
  GILBERTAS_CONTRAT_TITRE,
  GILBERTAS_DOSSIER_ID,
  GILBERTAS_REFERENCE,
  INTITULE_MARCHE_GILBERTAS,
  LIEU_EXECUTION_GILBERTAS,
  MENTION_HORS_MPR_GILBERTAS,
  ORDRE_EXECUTION_GILBERTAS,
  PLANNING_COMMANDO_GILBERTAS,
  POSTES_GILBERTAS_CONTRAT,
  RENDUS_3D_GILBERTAS,
  RIB_REGLEMENT_GILBERTAS,
  TOTAUX_GILBERTAS,
} from "./gilbertasClermontOfficiel.js";
import {
  CLIENT_MASSARDIER,
  EQUIPE_MASSARDIER,
  FINANCEMENT_MASSARDIER,
  MASSARDIER_CONTRAT_DATE,
  MASSARDIER_CONTRAT_NUMERO,
  MASSARDIER_CONTRAT_TITRE,
  MASSARDIER_LEAD_ID,
  MASSARDIER_REFERENCE,
  MENTION_HORS_MPR_MASSARDIER,
  POSTES_MASSARDIER_CONTRAT,
  TOTAUX_MASSARDIER,
} from "./massardierLeadOfficiel.js";
import {
  CLIENT_DAMIEN_PV_100KWC,
  DAMIEN_PV_100KWC_CONTRAT_DATE,
  DAMIEN_PV_100KWC_CONTRAT_NUMERO,
  DAMIEN_PV_100KWC_CONTRAT_TITRE,
  DAMIEN_PV_100KWC_DOSSIER_ID,
  DAMIEN_PV_100KWC_REFERENCE,
  EQUIPE_DAMIEN_PV_100KWC,
  FINANCEMENT_DAMIEN_PV_100KWC,
  MENTION_HORS_MPR_DAMIEN_PV_100KWC,
  POSTES_DAMIEN_PV_100KWC_CONTRAT,
  TITRE_DAMIEN_PV_100KWC,
  TOTAUX_DAMIEN_PV_100KWC,
} from "./damienPv100kwcOfficiel.js";
import {
  CLAUSE_EDF_OA_GESNOUIN,
  CLIENT_GESNOUIN,
  EQUIPE_GESNOUIN,
  FINANCEMENT_GESNOUIN,
  GESNOUIN_CONTRAT_DATE,
  GESNOUIN_CONTRAT_NUMERO,
  GESNOUIN_CONTRAT_TITRE,
  GESNOUIN_DOSSIER_ID,
  GESNOUIN_REFERENCE,
  MENTION_HORS_MPR_GESNOUIN,
  POSTES_GESNOUIN_CONTRAT,
  TITRE_GESNOUIN,
  TOTAUX_GESNOUIN,
} from "./gesnouinBatterieOfficiel.js";
import {
  CLIENT_MASSON,
  EQUIPE_MASSON,
  FINANCEMENT_MASSON,
  MASSON_DATE_VALIDITE,
  MASSON_DEVIS_DATE,
  MASSON_DEVIS_NUMERO,
  MASSON_DEVIS_TITRE,
  MASSON_DOSSIER_ID,
  MASSON_REFERENCE,
  MASSON_VALIDITE_JOURS,
  MENTION_ECHEANCIER_MASSON,
  MENTION_HORS_MPR_MASSON,
  MENTION_VALIDITE_MASSON,
  PHOTOS_TERRAIN_MASSON,
  POSTES_MASSON_DEVIS,
  TITRE_MASSON,
  TOTAUX_MASSON,
} from "./massonToulonOfficiel.js";
import {
  ASSURANCE_DECENNALE_COUTY,
  CLIENT_COUTY,
  COUTY_ESCALIER_CONTRAT_NUMERO,
  COUTY_ESCALIER_DEVIS_DATE,
  COUTY_ESCALIER_DEVIS_TITRE,
  COUTY_ESCALIER_DOSSIER_ID,
  EQUIPE_COUTY,
  FINANCEMENT_COUTY,
  MENTION_COUTY_AIDES,
  PHOTOS_TERRAIN_COUTY,
  POSTES_COUTY_CONTRAT,
  TITRE_COUTY_ESCALIER,
  TOTAUX_COUTY,
} from "./coutyEscalierOfficiel.js";
import {
  ASSURANCE_DECENNALE_FARISS,
  CLAUSE_INGENIERIE_FARISS,
  CLAUSE_LIMITE_PRESTATION_FARISS,
  CLAUSE_SUSPENSIVE_MAPRIMEADAPT_FARISS,
  CLIENT_FARISS,
  EQUIPE_FARISS,
  FARISS_DEVIS_DATE,
  FARISS_DEVIS_NUMERO,
  FARISS_DEVIS_TITRE,
  FARISS_DOSSIER_ID,
  FINANCEMENT_FARISS,
  MENTION_AIDES_FARISS,
  PHOTOS_TERRAIN_FARISS,
  POSTES_FARISS_DEVIS,
  RIB_QONTO,
  TITRE_FARISS,
  TOTAUX_FARISS,
} from "./farissLaRicamarieOfficiel.js";
import {
  CLIENT_PACK3EN1_MARSEILLE,
  FINANCEMENT_PACK3EN1_MARSEILLE,
  MENTION_PACK3EN1_MARSEILLE,
  PACK3EN1_MARSEILLE_CONTRAT_DATE,
  PACK3EN1_MARSEILLE_CONTRAT_NUMERO,
  PACK3EN1_MARSEILLE_CONTRAT_TITRE,
  PACK3EN1_MARSEILLE_DOSSIER_ID,
  PACK3EN1_MARSEILLE_REFERENCE,
  POSTES_PACK3EN1_MARSEILLE_CONTRAT,
  TOTAUX_PACK3EN1_MARSEILLE,
} from "./pack3en1MarseilleOfficiel.js";
import {
  CLIENT_ZOULOU_PARIS,
  FINANCEMENT_ZOULOU_PARIS,
  MENTION_ZOULOU_PARIS,
  POSTES_ZOULOU_PARIS_CONTRAT,
  TOTAUX_ZOULOU_PARIS,
  ZOULOU_PARIS_CONTRAT_DATE,
  ZOULOU_PARIS_CONTRAT_NUMERO,
  ZOULOU_PARIS_CONTRAT_TITRE,
  ZOULOU_PARIS_DOSSIER_ID,
  ZOULOU_PARIS_REFERENCE,
} from "./zoulouParisOfficiel.js";
import {
  BRUNEL_MACONNERIE_CONTRAT_DATE,
  BRUNEL_MACONNERIE_CONTRAT_NUMERO,
  BRUNEL_MACONNERIE_CONTRAT_TITRE,
  BRUNEL_MACONNERIE_DOSSIER_ID,
  BRUNEL_MACONNERIE_REFERENCE,
  CLIENT_BRUNEL_MACONNERIE,
  FINANCEMENT_BRUNEL_MACONNERIE,
  HEZEN_SOUS_TRAITANCE,
  MENTION_HORS_MPR_BRUNEL_MACONNERIE,
  POSTES_BRUNEL_MACONNERIE_CONTRAT,
  TOTAUX_BRUNEL_MACONNERIE,
  htmlAnnexeMaconnerieBrunel,
} from "./brunelMaconnerieOfficiel.js";
import {
  PROFILS_ANAH,
  STATUTS_OCCUPATION,
  calculerAidesIndicatives,
  calculerFinancement,
  totauxTravaux,
} from "./editionDossier.js";
import {
  CONTACTS_CONTRAT_MASTER,
  TITRE_CONTRAT_CONTRACTANT_GENERAL,
  articlesCgvContractantGeneral,
  dateLongue,
  euro,
  escapeHtml,
  htmlAnnexePhotos,
} from "./contratContractantGeneralHtml.js";

export { CONTACTS_CONTRAT_MASTER, TITRE_CONTRAT_CONTRACTANT_GENERAL };

export const CONTACTS_BRUNEL_FINAL = [
  {
    role: "Direction & Contractant Général",
    nom: "Sylvain LEMBELEMBE",
    detail: "ENERGIA-CONSEIL IA® — 06 10 59 68 98 — contact@energia-conseil-ia.com",
  },
  {
    role: "Courtier en travaux & financements",
    nom: "FABIEN — VIVONS COURTIER",
    detail: "06 71 19 96 45 — Financements travaux, prêts de 6 000 € à 75 000 € et regroupement de crédits",
  },
  {
    role: "Gestionnaire Administrative Partenaire",
    nom: "Clyve",
    detail: "Dossiers subventions ANAH / MaPrimeRénov’",
  },
  {
    role: "Juriste & Conformité",
    nom: "Julia",
    detail: "Juriste ENERGIA-CONSEIL IA® — Clause Julia responsabilité aides plafonnée à 2 000 €",
  },
  {
    role: "Opérateur MAR",
    nom: "Mon Accompagnateur Rénov' agréé national",
    detail: "Parcours Accompagné, audit/validation, montage dossier ANAH",
  },
];

export const SRC_FACADE_BRUNEL = "/images/brunel/facade-brunel.jpg";

export const TITRE_ANNEXE_VISUELLE_FACADE =
  "ANNEXE VISUELLE — PROJECTION ARCHITECTURALE DE FAÇADE VALIDÉE";

export const LEGENDE_FACADE_BRUNEL =
  "Validation du projet de façade du 18/09/2026 — Intégration de la baie vitrée coulissante RAL 7016, création d’ouverture sous linteau porteur et porte d’accès technique. Rendu contractuel conforme au dossier de Déclaration Préalable (DP) Mairie de Bussières.";

export function urlAbsolueImageContrat(cheminPublic) {
  const brut = String(cheminPublic || "").trim();
  if (!brut || brut.startsWith("data:") || /^https?:\/\//i.test(brut)) return brut;
  const chemin = brut.startsWith("/") ? brut : `/${brut}`;
  if (typeof window !== "undefined" && window.location?.origin) {
    const { origin, protocol } = window.location;
    if (protocol === "http:" || protocol === "https:") return `${origin}${chemin}`;
  }
  return chemin;
}

export function htmlAnnexeVisuelleFacadeBrunel(src = SRC_FACADE_BRUNEL) {
  const figures = IMAGES_CONTRAT_BRUNEL_V5.map((image, index) => {
    const chemin = index === 0 ? src : image.src;
    const legend = index === 0 ? LEGENDE_FACADE_BRUNEL : image.legend;
    const abs = urlAbsolueImageContrat(chemin);
    return `
      <figure class="cadre-prestige">
        <img src="${escapeHtml(abs)}" alt="${escapeHtml(image.alt)}" />
        <figcaption>${escapeHtml(legend)}</figcaption>
      </figure>`;
  }).join("\n");
  return `
    <section class="annexe-visuelle-facade">
      <h2>${TITRE_ANNEXE_VISUELLE_FACADE}</h2>
      <div class="galerie-projections-brunel">
        ${figures}
      </div>
    </section>`;
}

function euroEntier(n) {
  return Number(n)
    .toLocaleString("fr-FR", { maximumFractionDigits: 0, minimumFractionDigits: 0 })
    .replace(/[\u00a0\u202f]/g, " ");
}

function kwhEntier(n) {
  return `${euroEntier(n)} kWh`;
}

function montantSigne(n) {
  const abs = euroEntier(Math.abs(n));
  if (n > 0) return `+ ${abs} €`;
  if (n < 0) return `− ${abs} €`;
  return `${abs} €`;
}

function roundSvg(n) {
  return Math.round(Number(n) * 100) / 100;
}

function courbeCatmullRom(points) {
  if (!points.length) return "";
  let d = `M ${roundSvg(points[0].x)} ${roundSvg(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${roundSvg(cp1x)} ${roundSvg(cp1y)}, ${roundSvg(cp2x)} ${roundSvg(cp2y)}, ${roundSvg(p2.x)} ${roundSvg(p2.y)}`;
  }
  return d;
}

export function svgGraphiqueAmortissementBrunel() {
  const jalons = TABLEAU_AMORTISSEMENT_OFFICIEL_BRUNEL;
  const investissement = METRIQUES_SOLAIRES_BRUNEL.investissementTtc;
  const yMax = 60000;
  const xMin = 1;
  const xMax = 25;
  const left = 78;
  const right = 878;
  const top = 18;
  const bottom = 232;
  const plotW = right - left;
  const plotH = bottom - top;
  const xOf = (annee) => left + ((annee - xMin) / (xMax - xMin)) * plotW;
  const yOf = (valeur) => bottom - (Math.max(0, valeur) / yMax) * plotH;
  const points = jalons.map((ligne) => ({
    x: xOf(ligne.annee),
    y: yOf(ligne.cumul),
    ligne,
  }));
  const courbe = courbeCatmullRom(points);
  const aireEco = `${courbe} L ${right} ${bottom} L ${left} ${bottom} Z`;
  const yInvest = yOf(investissement);
  const pMort = points.find((p) => p.ligne.annee === 10) || points[4];
  const ticksY = [0, 15000, 30000, 45000, 60000];
  const grilleY = ticksY
    .map((val) => {
      const y = yOf(val);
      return `<line x1="${left}" y1="${roundSvg(y)}" x2="${right}" y2="${roundSvg(y)}" stroke="#e2e8f0" stroke-width="1" />
        <text x="${left - 8}" y="${roundSvg(y + 3.5)}" text-anchor="end" font-size="9" fill="#64748b">${euroEntier(val)} €</text>`;
    })
    .join("");
  const ticksX = jalons
    .map((ligne, idx) => {
      const x = xOf(ligne.annee);
      const anchor = idx === 0 ? "start" : idx === jalons.length - 1 ? "end" : "middle";
      const tx = idx === 0 ? x + 1 : idx === jalons.length - 1 ? x - 1 : x;
      return `<line x1="${roundSvg(x)}" y1="${top}" x2="${roundSvg(x)}" y2="${bottom}" stroke="#f1f5f9" stroke-width="1" />
        <text x="${roundSvg(tx)}" y="${bottom + 16}" text-anchor="${anchor}" font-size="8.5" fill="#334155" font-weight="600">Année ${ligne.annee}</text>`;
    })
    .join("");
  const pointsCourbe = points
    .map((p) => {
      if (p.ligne.annee === 10) return "";
      return `<circle cx="${roundSvg(p.x)}" cy="${roundSvg(p.y)}" r="3.2" fill="#10b981" stroke="#fff" stroke-width="1.2" />`;
    })
    .join("");

  return `
    <figure class="graphique-roi-solaire">
      <figcaption class="graphique-roi-titre">Évolution des économies d’énergie cumulées vs Investissement initial (Seuil d’amortissement à 9,8 ans)</figcaption>
      <svg viewBox="0 0 920 280" width="100%" height="280" role="img" aria-label="Graphique d’amortissement solaire Brunel — économies cumulées contre investissement 18 000 euros, point mort année 10" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="brunel-roi-fond" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f8fafc" />
            <stop offset="100%" stop-color="#eef2f7" />
          </linearGradient>
          <linearGradient id="brunel-roi-aire" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.46" />
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.07" />
          </linearGradient>
          <linearGradient id="brunel-roi-benefice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6ee7b7" stop-opacity="0.42" />
            <stop offset="100%" stop-color="#d1fae5" stop-opacity="0.16" />
          </linearGradient>
          <clipPath id="brunel-roi-clip-plot">
            <rect x="${left}" y="${top}" width="${plotW}" height="${plotH}" />
          </clipPath>
          <clipPath id="brunel-roi-clip-benefice">
            <rect x="${left}" y="${top}" width="${plotW}" height="${roundSvg(yInvest - top)}" />
          </clipPath>
        </defs>
        <rect x="0.5" y="0.5" width="919" height="279" rx="10" ry="10" fill="url(#brunel-roi-fond)" stroke="#cbd5e1" stroke-width="1" />
        <g font-family="Segoe UI, Calibri, Arial, Helvetica, sans-serif">
          ${grilleY}
          ${ticksX}
          <line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" stroke="#0B1F3A" stroke-width="1.2" />
          <line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" stroke="#0B1F3A" stroke-width="1.2" />
          <g clip-path="url(#brunel-roi-clip-plot)">
            <path d="${aireEco}" fill="url(#brunel-roi-aire)" />
            <path d="${aireEco}" fill="url(#brunel-roi-benefice)" clip-path="url(#brunel-roi-clip-benefice)" />
            <path d="${courbe}" fill="none" stroke="#d4af37" stroke-width="3.1" stroke-linejoin="round" stroke-linecap="round" />
            <path d="${courbe}" fill="none" stroke="#10b981" stroke-width="1.35" stroke-linejoin="round" stroke-linecap="round" />
          </g>
          <line x1="${left}" y1="${roundSvg(yInvest)}" x2="${right}" y2="${roundSvg(yInvest)}" stroke="#dc2626" stroke-width="1.7" stroke-dasharray="7 4" />
          <text x="${left + 8}" y="${roundSvg(yInvest - 7)}" text-anchor="start" font-size="8.5" fill="#b91c1c" font-weight="700">Investissement initial : 18 000 € TTC</text>
          <rect x="548" y="${roundSvg(top + 18)}" width="318" height="22" rx="5" fill="#ecfdf5" stroke="#6ee7b7" stroke-width="0.8" />
          <text x="707" y="${roundSvg(top + 33)}" text-anchor="middle" font-size="8.4" fill="#047857" font-weight="700">Zone de bénéfice net (+ 39 200 € de trésorerie client)</text>
          ${pointsCourbe}
          <line x1="${roundSvg(pMort.x)}" y1="${roundSvg(pMort.y)}" x2="${roundSvg(pMort.x + 42)}" y2="${roundSvg(pMort.y - 46)}" stroke="#0B1F3A" stroke-width="1" />
          <circle cx="${roundSvg(pMort.x)}" cy="${roundSvg(pMort.y)}" r="12" fill="#10b981" fill-opacity="0.18" />
          <circle cx="${roundSvg(pMort.x)}" cy="${roundSvg(pMort.y)}" r="8.2" fill="#10b981" fill-opacity="0.28" />
          <circle cx="${roundSvg(pMort.x)}" cy="${roundSvg(pMort.y)}" r="6.4" fill="#10b981" stroke="#d4af37" stroke-width="2.2" />
          <circle cx="${roundSvg(pMort.x)}" cy="${roundSvg(pMort.y)}" r="2.7" fill="#ecfdf5" />
          <rect x="${roundSvg(pMort.x + 34)}" y="${roundSvg(pMort.y - 64)}" width="214" height="26" rx="5" fill="#0B1F3A" />
          <text x="${roundSvg(pMort.x + 141)}" y="${roundSvg(pMort.y - 47)}" text-anchor="middle" font-size="8" fill="#ecfdf5" font-weight="700">Point mort franchi (Année 10 · 18 522 €)</text>
        </g>
      </svg>
      <ul class="graphique-roi-legende">
        <li><span class="pastille pastille-rouge"></span> Rouge pointillé : Seuil investissement 18 000 €</li>
        <li><span class="pastille pastille-vert"></span> Vert émeraude : Économies réelles cumulées</li>
        <li><span class="pastille pastille-or"></span> Or : Bénéfice net patrimoine</li>
      </ul>
    </figure>`;
}

export function htmlEtudeRentabiliteSolaireBrunel() {
  const kpi = KPI_ROI_BRUNEL_DEFAUT;
  const m = METRIQUES_SOLAIRES_BRUNEL;
  const rows = TABLEAU_AMORTISSEMENT_OFFICIEL_BRUNEL.map((ligne) => {
    const klass =
      ligne.highlight === "amorti"
        ? " class=\"row-amorti\""
        : ligne.highlight === "garantie"
          ? " class=\"row-garantie total-row\""
          : "";
    const bilanKlass = ligne.bilan >= 0 ? "bilan-pos" : "bilan-neg";
    const badge = ligne.badge ? `<br><span class="muted">${escapeHtml(ligne.badge)}</span>` : "";
    return `<tr${klass}>
        <td>${escapeHtml(ligne.jalon)}</td>
        <td class="num">${kwhEntier(ligne.productionKwh)}</td>
        <td class="num">${ligne.autoPct} %</td>
        <td class="montant">${euroEntier(ligne.economieAnnuelle)} €</td>
        <td class="montant">${euroEntier(ligne.cumul)} €</td>
        <td class="montant ${bilanKlass}">${montantSigne(ligne.bilan)}${badge}</td>
      </tr>`;
  }).join("\n");

  return `
    <section class="bloc section-roi-solaire keep">
      <h2>IV. ÉTUDE DE RENTABILITÉ FINANCIÈRE &amp; AMORTISSEMENT PRÉVISIONNEL (LOT AUTONOMIE SOLAIRE)</h2>
      <p class="muted">Installation ${m.puissanceKwc} kWc DualSun + batterie ${m.batterieKwh} kWh à ${euroEntier(m.investissementTtc)} € TTC — production ${kwhEntier(m.productionKwhAn)}/an — autoconsommation ~${m.autoconsommationPct} % — inflation électricité +3,5 %/an. Estimation à titre indicatif.</p>
      <div class="roi-kpis">
        <article class="kpi-roi">
          <p class="kpi-roi-label">Temps de retour sur investissement (TRI)</p>
          <p class="kpi-roi-value">${String(kpi.triAns).replace(".", ",")} ans</p>
          <p class="kpi-roi-hint">Point mort atteint en Année ${kpi.anneePointMort}</p>
        </article>
        <article class="kpi-roi">
          <p class="kpi-roi-label">Rendement financier annuel moyen</p>
          <p class="kpi-roi-value">${String(kpi.rendementAnnuelPct).replace(".", ",")} %</p>
          <p class="kpi-roi-hint">Net d’impôt — horizon 25 ans</p>
        </article>
        <article class="kpi-roi">
          <p class="kpi-roi-label">Gain net cumulé sur 25 ans</p>
          <p class="kpi-roi-value">+ ${euroEntier(kpi.gainNet25Ans)} €</p>
          <p class="kpi-roi-hint">Économies nettes après amortissement intégral</p>
        </article>
      </div>
      <table class="tableau-amortissement">
        <thead>
          <tr>
            <th>Jalon temporel</th>
            <th>Production estimée</th>
            <th>Taux d’autoconsommation</th>
            <th>Économie annuelle (€/an)</th>
            <th>Économies cumulées (€)</th>
            <th>Bilan net trésorerie (€)</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      ${svgGraphiqueAmortissementBrunel()}
      <div class="disclaimer">${escapeHtml(NOTE_METHODO_ROI_BRUNEL)}</div>
    </section>`;
}

const MENTIONS_STANDARD = (p) =>
  `Document confidentiel, non cessible. Année de référence 2026. ${p.nom} — ${p.adresse} — SIRET ${p.siret} — RCS ${p.rcs} — TVA ${p.tva} — Marque déposée INPI n°${p.inpi}. Clyve intervient comme gestionnaire administrative partenaire ; ce n’est pas une ligne de travaux facturée au client.`;

export function estLigneContractantGeneral(ligne) {
  const id = String(ligne?.id || "");
  const prest = String(ligne?.prestationId || "");
  const nom = String(ligne?.nom || "");
  return (
    prest === "energia-contractant-general" ||
    id.includes("contractant-general") ||
    id === "v3-poste-8-coordination" ||
    id === "v3-poste-6-coordination" ||
    /coordination technique|contractant g/i.test(nom)
  );
}

export function htmlAnnexePhotosPereira({ avecAudit = false, paires = PAIRES_PHOTOS_CONTRAT_PEREIRA } = {}) {
  return htmlAnnexePhotos({
    paires,
    mentionLegale: PHOTOS_CONTRAT_PEREIRA.mentionLegale,
    mentionProjection: PHOTOS_CONTRAT_PEREIRA.mentionProjection,
    piedHtml:
      "Les projections ITI ne sont pas reprises : l’ITI est exclu du contrat. Menuiseries neuves : aluminium à rupture de pont thermique, Uw ≤ 1,30.",
    avecAudit,
  });
}

export function payloadContratPereiraOfficiel() {
  const c = CLIENT_PEREIRA_NERVIEUX;
  const p = PRESTATAIRE_ENERGIA;
  const t = TOTAUX_PEREIRA_NERVIEUX;
  const travaux = TOTAUX_TRAVAUX_55_PEREIRA;
  const cg = TOTAUX_CG_20_PEREIRA;
  const a = AIDES_PEREIRA_VIOLET;
  const f = FINANCEMENT_PEREIRA_CG;
  const fisc = FISCALITE_AVIS_PEREIRA;
  const dateTxt = dateLongue(PEREIRA_NERVIEUX_DATE);
  const postes = POSTES_PEREIRA_NERVIEUX.slice().sort(
    (x, y) => (x.ordreContractuel || 0) - (y.ordreContractuel || 0),
  );

  return {
    titre: PEREIRA_CONTRAT_TITRE,
    numero: PEREIRA_NERVIEUX_NUMERO,
    dateIso: PEREIRA_NERVIEUX_DATE,
    dateTxt,
    prestataire: p,
    metaLignesHtml: `Maison 164 m² — Nervieux (42) — sans ITI<br>`,
    clientHtml: `<strong>Monsieur ${c.prenom} ${c.nom}</strong><br>${c.adresse}<br>Propriétaire occupant — ${c.surfaceHabitable} m² — DPE ${c.dpeActuel} ➔ ${c.dpeCible}`,
    lieuExecution: c.adresse,
    fiscaliteHtml: `<div class="disclaimer">
        <strong>Fiscalité officielle — avis d’imposition 2025 (situation 2026).</strong>
        RFR ${euro(fisc.rfr)} € · ${fisc.parts} part · ${fisc.libelleProfil} — prise en charge ${Math.round(a.tauxParcours * 100)} %.
        ${fisc.mention}
      </div>`,
    alertHtml: `<div class="alert-red">${EXCLUSION_ITI_PEREIRA.mention} Préservation des 164 m² habitables. 0 m² d’ITI, 0 Velux, 0 m² de rampants.</div>`,
    engagementArtisansHtml:
      "Les artisans RGE interviennent sous la maîtrise d’œuvre et la sous-traitance contractuelle d’ENERGIA-CONSEIL IA®.",
    titrePostes: "II. Détail des 8 postes contractuels — ordre optimal ENERGIA",
    introPostesHtml:
      "Ordre de facturation contractuel. Ordre thermique chantier : combles ➔ plancher ➔ menuiseries ➔ VMC ➔ PAC ➔ CET 250 L ➔ induits ➔ CG. Isolation avant chauffage. TVA 5,5 % sur l’ensemble du marché. Pilotage : Sylvain LEMBELEMBE — ENERGIA-CONSEIL IA®.",
    postes,
    totaux: t,
    totauxPhraseHtml: `<strong>Marché de travaux de Contractant Général :</strong> ${euro(t.totalHt)} € HT | TVA 5,5 % : ${euro(t.totalTva)} € | <strong>TOTAL TTC : ${euro(t.totalTtc)} €</strong>.`,
    annexePhotosHtml: htmlAnnexePhotosPereira(),
    recapLignes: [
      {
        label: "Travaux TVA 5,5 %",
        montant: `${euro(travaux.totalHt)} € HT · ${euro(travaux.totalTva)} € TVA · ${euro(travaux.totalTtc)} € TTC`,
      },
      {
        label: "Direction &amp; Contractant Général — lot 8 — TVA 5,5 %",
        montant: `${euro(cg.totalHt)} € HT · ${euro(cg.totalTva)} € TVA · ${euro(cg.totalTtc)} € TTC`,
      },
      { label: "Montant du marché TTC", montant: `${euro(t.totalTtc)} €`, total: true },
      {
        label: "Acompte initial de 30 % à la signature",
        muted: "Engagement, blocage des prix artisans et constitution du dossier ANAH",
        montant: `${euro(f.acompte)} €`,
      },
      {
        label: "Acompte intermédiaire de 40 % au démarrage effectif du chantier",
        muted: "Livraison et approvisionnement des matériels PAC, CET, menuiseries et isolants",
        montant: `${euro(f.intermediaire)} €`,
      },
      {
        label: "Solde de 30 % à la réception des travaux",
        muted:
          "Après procès-verbal de réception sans réserve et validation de Sylvain LEMBELEMBE (Contractant Général — ENERGIA-CONSEIL IA®)",
        montant: `${euro(f.solde)} €`,
      },
      { label: "Total échéancier du reste à charge 30 % / 40 % / 30 %", montant: `${euro(a.resteACharge)} €`, total: true },
    ],
    titreAides: "IV. Ingénierie financière &amp; aides 2026 (estimation à titre indicatif)",
    aidesLignes: [
      {
        label: "MaPrimeRénov’ Parcours Accompagné (Violet 45 %, saut certifié 3 classes F ➔ C)",
        montant: `${euro(a.mpr)} €`,
      },
      { label: a.libelleCee, montant: `${euro(a.cee)} €` },
      ...(a.mar > 0
        ? [{ label: "Prestation MAR remboursée (80 % × plafond 2 000 €)", montant: `${euro(a.mar)} €` }]
        : []),
      { label: "Total aides estimées", montant: `${euro(a.totalAides)} €`, total: true },
      { label: "Reste à charge net client", montant: `${euro(a.resteACharge)} € TTC`, total: true },
      {
        label: "Éco-PTZ à 0 % sur 20 ans (banque partenaire, dossier technique ENERGIA)",
        montant: `~ ${euro(a.mensualite20)} € / mois`,
      },
      {
        label: "Financement travaux / Courtier FABIEN — VIVONS COURTIER — 06 71 19 96 45",
        montant: "Prêts 6 000 € à 75 000 €",
      },
    ],
    regleAnahExtra: " NE JAMAIS SIGNER LES DEVIS DÉFINITIFS AVANT L'ACCORD ÉCRIT DE L'ANAH.",
    planning: [
      {
        phase: "Dossier ANAH (Clyve / MAR)",
        duree: "3 à 6 mois",
        detail:
          "Dépôt avant tout démarrage. Aucune signature de devis artisans définitifs avant accord écrit ANAH si MaPrimeRénov’ est retenue.",
      },
      { phase: "1. Combles 60 m²", duree: "2–3 j", detail: "Déroulé R ≥ 7,0 — 0 m² de rampant" },
      { phase: "2. Plancher bas 19 m²", duree: "1–2 sem.", detail: "Cave accessible — R ≥ 3,0" },
      {
        phase: "3. Menuiseries 19,38 m²",
        duree: "2–3 sem.",
        detail: "10 châssis verticaux — 0 Velux — Uw ≤ 1,30",
      },
      { phase: "4. VMC Hygro B", duree: "3–5 j", detail: "Après isolation" },
      {
        phase: "5–7. PAC + CET 250 L + induits",
        duree: "2–3 sem.",
        detail:
          "PAC chauffage seul 65–75 °C, dépose fioul DTU 65.16, pot à boue — dimensionnement post-isolation",
      },
      {
        phase: "Contractant Général",
        duree: "Toute la durée",
        detail: "Sylvain LEMBELEMBE — ENERGIA-CONSEIL IA® — responsabilité globale du chantier",
      },
    ],
    signatureHtml: `<p>Je soussigné(e), <strong>Monsieur ${c.prenom} ${c.nom}</strong>, accepte le présent <strong>Marché de travaux de Contractant Général</strong> n° <strong>${PEREIRA_NERVIEUX_NUMERO}</strong>
        d’un montant de <strong>${euro(t.totalTtc)} € TTC</strong> (reste à charge indicatif ${euro(a.resteACharge)} €) et mandate <strong>ENERGIA-CONSEIL IA® en qualité de Contractant Général</strong> pour la rénovation globale clé en main, sans ITI.</p>
        <p>Échéancier de paiement : <strong>30 % à la signature</strong> (${euro(f.acompte)} € TTC) / <strong>40 % au démarrage effectif du chantier</strong> (${euro(f.intermediaire)} € TTC) / <strong>30 % à réception</strong> (${euro(f.solde)} € TTC), après PV sans réserve et validation Sylvain LEMBELEMBE.</p>
        <p>Mentions manuscrites obligatoires : « Lu et approuvé », « Bon pour accord », « Ne vaut pas ordre de démarrer avant accord ANAH ».</p>
        <p>Fait à ____________________________ , le ___ / ___ / 2026</p>
        <table class="sig-table">
          <tr>
            <td>Le client — Monsieur ${c.prenom} ${c.nom}<div class="sig-line"></div></td>
            <td>ENERGIA-CONSEIL IA® — Sylvain LEMBELEMBE<div class="sig-line"></div></td>
          </tr>
        </table>`,
    contacts: CONTACTS_PEREIRA_CONTRAT,
    juliaBullets: [
      `la qualité d’ENERGIA-CONSEIL IA® de <strong>Contractant Général</strong> (Marché de travaux de Contractant Général, ${euro(t.totalTtc)} € TTC, artisans RGE en sous-traitance) ;`,
      `la conformité réglementaire globale (artisans RGE, aides 2026 à titre indicatif, ordre des travaux isolation avant chauffage, plafonds MPR/CEE, exclusion ITI) ;`,
      `le profil Violet lu sur avis d’imposition (RFR ${euro(fisc.rfr)} €, 1 part, hors IDF) ;`,
      `l’interdiction de démarrer les travaux avant accord écrit de l’ANAH si MaPrimeRénov’ est retenue ;`,
      `la <strong>Clause Julia Protection Aides</strong> : responsabilité ENERGIA plafonnée à 2 000 € en cas d’écart &gt; 10 % imputable à une erreur prouvée d’ENERGIA ; 0 % si erreur client ou décision ANAH/CEE ;`,
      `le régime de paiement spécifique au présent marché : <strong>30 % signature / 40 % démarrage / 30 % réception</strong> (${euro(f.acompte)} € / ${euro(f.intermediaire)} € / ${euro(f.solde)} € TTC), le solde après PV sans réserve et validation Sylvain LEMBELEMBE.`,
    ],
    ordreTravauxCgv:
      "Isolation combles → plancher bas → menuiseries → VMC → PAC air/eau HT chauffage seul → ballon thermodynamique 250 L → travaux induits (dépose fioul / désembouage DTU 65.16). Isolation avant chauffage en toutes circonstances. 0 m² d’ITI.",
    echeancier: f,
    totauxPourCgv: t,
    mentionsHtml: MENTIONS_STANDARD(p),
    footerClientHtml: `Contrat ${PEREIRA_NERVIEUX_NUMERO} — Monsieur ${c.prenom} ${c.nom} — ${c.adresse} — ${dateTxt}`,
  };
}

export function payloadContratBrunelOfficiel() {
  const totaux = totauxContractuelsBrunelV3();
  const p = PRESTATAIRE_ENERGIA;
  const c = CLIENT_BRUNEL_V3;
  const f = FINANCEMENT_BRUNEL_V3;
  const a = AIDES_BRUNEL_V3;
  const t = TOTAUX_BRUNEL_V3;
  const dateTxt = dateLongue(BRUNEL_V3_DATE);
  const postes = totaux.lignes
    .slice()
    .sort((x, y) => (x.ordreContractuel || 0) - (y.ordreContractuel || 0));

  return {
    titre: BRUNEL_CONTRAT_TITRE,
    numero: BRUNEL_FINAL_NUMERO,
    dateIso: BRUNEL_V3_DATE,
    dateTxt,
    prestataire: p,
    metaLignesHtml: `Combles C2L verrouillés : 100 m²<br>Devis façade N° ${DEVIS_FACADE_NUMERO} du 18/09/2026<br>Statut : ${STATUT_DOSSIER_BRUNEL_V3}<br>`,
    clientHtml: `<strong>Monsieur ${c.nom} ${c.prenom}</strong>, agissant pour le compte de l’<strong>Indivision COUBLE</strong>.<br>Domicile : ${c.adresseDomicile}<br>Tél. : ${c.telephone}<br>Cadre juridique : ${CADRE_JURIDIQUE_INDIVISION_815}`,
    lieuExecution: c.adresseChantier,
    alertHtml: `<div class="alert-red">${ALERTE_INDIVISION_COUBLE_815}</div>
      <div class="disclaimer">${NOTE_DEVIS_FACADE_V1}</div>`,
    engagementArtisansHtml:
      "Les artisans RGE (C2L, Bonheur d’Amarante, SMN Énergies) interviennent sous la maîtrise d’œuvre et la sous-traitance contractuelle d’ENERGIA-CONSEIL IA®.",
    titrePostes: "II. Détail des postes contractuels — ordre optimal ENERGIA (marché subventionnable)",
    introPostesHtml:
      `Isolation combles verrouillée à <strong>100 m²</strong> (C2L — RGE). TVA 5,5 % au centime près. Chiffrage optimisé validé : <strong>${euro(t.totalHt)} € HT / ${euro(t.totalTtc)} € TTC</strong>. Devis façade N° <strong>${DEVIS_FACADE_NUMERO}</strong> du 18/09/2026 intégré aux postes 2 à 4. Pilotage : Direction &amp; Contractant Général — Sylvain LEMBELEMBE — ENERGIA-CONSEIL IA®. La porte d’accès local technique / garage (Lot 2) est hors subvention et hors présent marché.`,
    colonneTva: "TVA 5,5 %",
    labelTotalRow: "TOTAL MARCHÉ RÉNOVATION GLOBALE",
    postes,
    totaux: t,
    totauxPhraseHtml: `<strong>Totaux du marché global subventionnable :</strong> ${euro(t.totalHt)} € HT | TVA 5,5 % : ${euro(t.totalTva)} € | <strong>TOTAL TTC DU MARCHÉ RÉNOVATION GLOBALE : ${euro(t.totalTtc)} €</strong>.`,
    apresTableauPostesHtml: `<div class="sous-ensemble"><strong>Total Sous-Ensemble Façade &amp; Menuiseries (Lot 1 éligible) — devis ${DEVIS_FACADE_NUMERO} :</strong> ${euro(TOTAUX_FACADE_BRUNEL.totalHt)} € HT | TVA 5,5 % : ${euro(TOTAUX_FACADE_BRUNEL.totalTva)} € | <strong>${euro(TOTAUX_FACADE_BRUNEL.totalTtc)} € TTC</strong>.</div>
      <div class="hors-subvention">
        <strong>LOT 2 — HORS SUBVENTION (charge directe exclusive de M. Brunel)</strong><br>
        ${POSTE_HORS_SUBVENTION_BRUNEL.nom} (panneau isolé, serrure multipoints) : <strong>${euro(POSTE_HORS_SUBVENTION_BRUNEL.totalHt)} € HT</strong> | TVA 10,0 % : ${euro(POSTE_HORS_SUBVENTION_BRUNEL.totalTva)} € | <strong>Total TTC : ${euro(POSTE_HORS_SUBVENTION_BRUNEL.totalTtc)} € TTC</strong>.
        Non comprise dans les aides de l’enveloppe chauffée, ni dans le total ${euro(t.totalTtc)} € TTC, ni dans l’échéancier 30/40/30.
      </div>`,
    annexePhotosHtml: htmlAnnexeVisuelleFacadeBrunel(),
    recapLignes: [
      { label: "Montant des travaux HT", montant: `${euro(t.totalHt)} €` },
      { label: "TVA 5,5 %", montant: `${euro(t.totalTva)} €` },
      { label: "Montant des travaux TTC", montant: `${euro(t.totalTtc)} €`, total: true },
      {
        label: "Acompte initial de 30 % à la signature",
        muted: "Engagement et blocage artisans",
        montant: `${euro(f.acompte)} € TTC`,
      },
      {
        label: "Acompte intermédiaire de 40 % au démarrage des travaux",
        muted: "Démarrage effectif du chantier et approvisionnement PAC / menuiseries",
        montant: `${euro(f.intermediaire)} € TTC`,
      },
      {
        label: "Solde de 30 % à réception sans réserve",
        muted: "Après procès-verbal de réception sans réserve et validation Sylvain LEMBELEMBE",
        montant: `${euro(f.solde)} € TTC`,
      },
      {
        label: "Total échéancier 30 % / 40 % / 30 %",
        montant: `${euro(t.totalTtc)} € TTC`,
        total: true,
      },
    ],
    titreAides: "IV. Aides financières 2026 &amp; financement (estimation à titre indicatif)",
    aidesLignes: [
      { label: a.libelleMpr, montant: `${euro(a.mpr)} €` },
      { label: a.libelleCee, montant: `${euro(a.cee)} €` },
      { label: a.libelleLocales, montant: `${euro(a.locales)} €` },
      { label: a.libelleMar, montant: `${euro(a.mar)} €` },
      { label: "Total aides publiques estimées", montant: `${euro(a.totalAides)} €`, total: true },
      { label: "Reste à charge net client", montant: `${euro(a.resteACharge)} € TTC`, total: true },
      {
        label: "Éco-PTZ à 0 % sur 20 ans (Établissement bancaire conventionné — prêt à taux zéro de l'État)",
        montant: `~ ${euro(f.mensualiteExacte)} € / mois`,
      },
      { label: "Économies factures prévues", montant: "−150,00 € / mois" },
      { label: "Gain net mensuel estimé", montant: `+${euro(f.bilanNetMensuel)} € / mois`, total: true },
    ],
    planning: [
      {
        phase: "Dossier ANAH (MAR)",
        duree: "3 à 6 mois",
        detail:
          "Dépôt avant tout démarrage. Aucune signature de devis artisans définitifs avant accord écrit ANAH si MaPrimeRénov’ est retenue.",
      },
      { phase: "1. Combles 100 m²", duree: "2–3 j", detail: "C2L — RGE — soufflage 300 mm R = 7,0" },
      {
        phase: "2. Fenêtres RAL 7016",
        duree: "1–2 sem.",
        detail: "Bonheur d’Amarante — RGE — 4 fenêtres double vitrage RAL 7016 sablé + volets roulants motorisés",
      },
      {
        phase: "3. Ensemble baie vitrée",
        duree: "2–3 sem.",
        detail: `Devis ${DEVIS_FACADE_NUMERO} — ouverture mur porteur IPN/HEB, baie 215×240 cm RAL 7016 motorisée, condamnation et rebouchage maçonné`,
      },
      {
        phase: "4. Porte d’entrée",
        duree: "2–3 j",
        detail: "Ud ≤ 1,4, serrure A2P*. Lot 2 porte garage hors marché, charge directe M. Brunel",
      },
      { phase: "5. VMC", duree: "3–5 j", detail: "SMN Énergies — RGE — hygroréglable 72 m², après isolation" },
      {
        phase: "6–7. PAC + ballon",
        duree: "2–3 sem.",
        detail: "SMN Énergies — RGE — 5 splits air/air GAMME PREMIUM (Daikin / Mitsubishi Electric, SCOP A+++) + CET 200 L, dimensionnement post-isolation",
      },
      {
        phase: "8. Contractant Général",
        duree: "Toute la durée",
        detail: "Sylvain LEMBELEMBE — ENERGIA-CONSEIL IA® — responsabilité globale du chantier",
      },
    ],
    signatureHtml: `<p>Je soussigné(e), agissant pour l’Indivision COUBLE, accepte le présent contrat n° <strong>${BRUNEL_FINAL_NUMERO}</strong>
        d’un montant <strong>ferme et définitif</strong> de <strong>${euro(t.totalTtc)} € TTC</strong> et mandate <strong>ENERGIA-CONSEIL IA® en qualité de Contractant Général</strong> pour la rénovation globale clé en main.</p>
        <p>Échéancier de paiement : <strong>30 % à la signature</strong> (${euro(f.acompte)} € TTC) / <strong>40 % au démarrage effectif du chantier</strong> (${euro(f.intermediaire)} € TTC) / <strong>30 % à réception</strong> (${euro(f.solde)} € TTC), après PV sans réserve et validation Sylvain LEMBELEMBE.</p>
        <p>Mentions manuscrites obligatoires : « Lu et approuvé », « Bon pour accord », « Ne vaut pas ordre de démarrer avant accord ANAH ».</p>
        <p>Fait à ____________________________ , le ___ / ___ / 2026</p>
        <p><strong>Signatures de TOUS les indivisaires — article 815 du Code civil :</strong></p>
        <table class="sig-table">
          <tr>
            <td>Indivisaire 1 — Nom : ____________________<div class="sig-line"></div></td>
            <td>Indivisaire 2 — Nom : ____________________<div class="sig-line"></div></td>
          </tr>
          <tr>
            <td>Indivisaire 3 — Nom : ____________________<div class="sig-line"></div></td>
            <td>M. BRUNEL Emrick (mandant)<div class="sig-line"></div></td>
          </tr>
        </table>`,
    contacts: CONTACTS_BRUNEL_FINAL,
    juliaBullets: [
      `la qualité d’ENERGIA-CONSEIL IA® de <strong>Contractant Général</strong> (responsabilité globale du chantier, prix forfaitaire ferme ${euro(t.totalTtc)} € TTC, artisans RGE en sous-traitance) ;`,
      `la conformité réglementaire globale (artisans RGE, aides 2026 à titre indicatif, ordre des travaux isolation avant chauffage, plafonds MPR/CEE) ;`,
      `la contrainte d’indivision : article 815 — signature unanime de tous les indivisaires sous peine de nullité du contrat et des aides ;`,
      `l’intégration du devis façade N° ${DEVIS_FACADE_NUMERO} du 18/09/2026 (postes 2 à 4 — Lot 1 éligible ${euro(TOTAUX_FACADE_BRUNEL.totalTtc)} € TTC) ;`,
      `l’exclusion du marché de la porte d’accès local technique / garage (Lot 2 hors subvention : 980,00 € HT, TVA 10 %, 1 078,00 € TTC à la charge directe exclusive de M. Brunel) ;`,
      `l’interdiction de démarrer les travaux avant accord écrit de l’ANAH si MaPrimeRénov’ est retenue ;`,
      `la <strong>Clause Julia Protection Aides</strong> : responsabilité ENERGIA plafonnée à 2 000 € en cas d’écart &gt; 10 % imputable à une erreur prouvée d’ENERGIA ; 0 % si erreur client ou décision ANAH/CEE ;`,
      `le régime de paiement spécifique au présent marché : <strong>30 % signature / 40 % démarrage / 30 % réception</strong> (${euro(f.acompte)} € / ${euro(f.intermediaire)} € / ${euro(f.solde)} € TTC), le solde après PV sans réserve et validation Sylvain LEMBELEMBE.`,
    ],
    cgvIntro: `Les présentes CGV s’appliquent au contrat ${BRUNEL_FINAL_NUMERO}. Elles intègrent les 12 protections juridiques ENERGIA.`,
    cgvArticles: articlesCgvContractantGeneral({
      numero: BRUNEL_FINAL_NUMERO,
      dateTxt,
      totalTtc: t.totalTtc,
      acompte: f.acompte,
      intermediaire: f.intermediaire,
      solde: f.solde,
      ordreTravaux:
        "Isolation combles → 4 fenêtres double vitrage RAL 7016 → ensemble baie vitrée (ouverture IPN/HEB, baie 215×240 RAL 7016, condamnation) → porte d’entrée Ud ≤ 1,4 → VMC → PAC → ballon thermodynamique. Isolation avant chauffage en toutes circonstances. Porte garage Lot 2 hors marché.",
      artisans: "C2L, Bonheur d’Amarante, SMN Énergies",
    }).map((article, index) => {
      if (index === 1) {
        return `<strong>Article 2 — Ordre des travaux impératif.</strong> Isolation combles → 4 fenêtres double vitrage RAL 7016 sablé + volets motorisés → ensemble baie vitrée (devis ${DEVIS_FACADE_NUMERO} : ouverture mur porteur IPN/HEB, baie 215×240 cm RAL 7016 motorisée, condamnation et rebouchage maçonné) → porte d’entrée Ud ≤ 1,4 → VMC → PAC → ballon thermodynamique. Isolation avant chauffage en toutes circonstances. Porte d’accès local technique / garage hors marché (Lot 2).`;
      }
      if (index === 2) {
        return `<strong>Article 3 — Modalités de paiement 30 / 40 / 30.</strong> Acompte initial de 30 % à la signature : ${euro(f.acompte)} € TTC (engagement et blocage artisans). Acompte intermédiaire de 40 % au démarrage effectif du chantier : ${euro(f.intermediaire)} € TTC (approvisionnement PAC / menuiseries). Solde de 30 % à la réception : ${euro(f.solde)} € TTC, après procès-verbal de réception sans réserve et validation Sylvain LEMBELEMBE. Total : ${euro(t.totalTtc)} € TTC. Aucun règlement artisans hors circuit convenu sans accord de Sylvain.`;
      }
      if (index === 3) return `<strong>Article 4 — ANAH.</strong> Démarrage des travaux uniquement après accord écrit MaPrimeRénov’ si le client retient le parcours aides. À défaut, perte définitive et irrémédiable du MPR.`;
      if (index === 4) {
        return `<strong>Article 5 — Clause Julia — Protection Aides (plafond 2 000 €).</strong> Écart ≤ 10 % : 0 % à la charge d’ENERGIA. Écart &gt; 10 % imputable à une erreur prouvée d’ENERGIA : participation 50 % plafonnée à 2 000 € par projet. Erreur client, fausse déclaration de revenus ou décision ANAH/CEE : 0 % à la charge d’ENERGIA.`;
      }
      if (index === 5) {
        return `<strong>Article 6 — Planning artisans.</strong> Délais contractuels sauf force majeure. Pénalités de retard progressives (3 % / 5 % / 10 % du lot, plafonnées à 5 % du marché). Remplacement d’un artisan défaillant sous 7 jours ouvrés, proposé par Sylvain.`;
      }
      if (index === 6) return `<strong>Article 7 — Chantier propre.</strong> Nettoyage quotidien des accès. Retenue de 5 % sur le solde du lot concerné si chantier laissé sale à réception.`;
      if (index === 7) return `<strong>Article 8 — Réserve de propriété (loi 80.335 du 12 mai 1980).</strong> Équipements et matériaux restent la propriété d’ENERGIA ou des entreprises jusqu’au paiement intégral.`;
      if (index === 8) return `<strong>Article 9 — Pénalités de retard de paiement.</strong> 3 fois le taux d’intérêt légal + indemnité forfaitaire de recouvrement 40 €.`;
      if (index === 9) return `<strong>Article 10 — Assurance dommages-ouvrage.</strong> Recommandée. ENERGIA ne peut être tenue responsable du défaut de souscription.`;
      if (index === 10) return `<strong>Article 11 — Révision des prix.</strong> Si le délai entre la date du devis et le début des travaux excède 60 jours, révision possible sur indice BT01.`;
      if (index === 11) return `<strong>Article 12 — Force majeure.</strong> Météo rendant l’intervention impossible, catastrophe, pandémie, rupture d’approvisionnement majeure : report sans pénalité, information sous 8 jours.`;
      if (index === 12) return `<strong>Article 13 — Modification / annulation.</strong> Avenant écrit obligatoire. Annulation client après signature : frais 500 € déduits de l’acompte. Annulation ENERGIA hors force majeure : remboursement intégral + 500 €.`;
      if (index === 13) return `<strong>Article 14 — Litiges.</strong> Résolution amiable sous 15 jours, puis tribunaux de Lyon. Médiation possible d’un commun accord.`;
      if (index === 14) return `<strong>Article 15 — RGPD.</strong> Données conservées 5 ans. Droits d’accès, rectification, effacement : contact@energia-conseil-ia.com. Réclamation CNIL.`;
      if (index === 16) return `<strong>Article 17 — Preuves.</strong> Photos avant / pendant / après. PV de démarrage, mi-chantier et réception. Conservation 5 ans.`;
      if (index === 17) return `<strong>Article 18 — Validité.</strong> Le présent contrat est valable 3 mois à compter du ${dateTxt}.`;
      return article;
    }),
    mentionsHtml: MENTIONS_STANDARD(p),
    footerClientHtml: `Contrat ${BRUNEL_FINAL_NUMERO} — Monsieur BRUNEL Emrick / Indivision COUBLE — 48 Impasse des Lagunes, 42510 BUSSIÈRES — ${dateTxt}`,
    printCinqPages: true,
  };
}

function posteMarcheBrunel({ ordre, nom, specifications, quantite, unite, puHt, totalHt, totalTva, totalTtc, artisan }) {
  return {
    ordreContractuel: String(ordre),
    nom,
    specifications,
    artisan,
    quantite,
    unite,
    puHt,
    tauxTva: 0.055,
    totalHt,
    totalTva,
    totalTtc,
  };
}

const POSTES_MARCHE_BRUNEL_OPTION_BAIE = [
  posteMarcheBrunel({
    ordre: 1,
    nom: "Isolation des combles perdus habitables",
    specifications: "35 m² à 41,68 € HT — combles perdus habitables",
    quantite: 35,
    unite: "m²",
    puHt: 41.68,
    totalHt: 1458.8,
    totalTva: 80.23,
    totalTtc: 1539.03,
    artisan: "C2L (RGE)",
  }),
  posteMarcheBrunel({
    ordre: 2,
    nom: "Menuiseries PVC entrée (2 unités)",
    specifications: "2 unités — entrée",
    quantite: 2,
    unite: "u",
    puHt: 900,
    totalHt: 1800,
    totalTva: 99,
    totalTtc: 1899,
    artisan: "Bonheur d'Amarante (RGE)",
  }),
  posteMarcheBrunel({
    ordre: 3,
    nom: "Baie vitrée alu 215×240 avec ouverture mur porteur et linteau acier IPN",
    specifications: "Baie vitrée 215×240 alu + ouverture mur porteur et linteau acier IPN",
    quantite: 1,
    unite: "ens",
    puHt: 4800,
    totalHt: 4800,
    totalTva: 264,
    totalTtc: 5064,
    artisan: "Bonheur d'Amarante (RGE)",
  }),
  posteMarcheBrunel({
    ordre: 4,
    nom: "Porte d'entrée isolée haute performance (Ud ≤ 1,3)",
    specifications: "Porte d'entrée isolée Ud ≤ 1,3",
    quantite: 1,
    unite: "u",
    puHt: 2100,
    totalHt: 2100,
    totalTva: 115.5,
    totalTtc: 2215.5,
    artisan: "Bonheur d'Amarante (RGE)",
  }),
  posteMarcheBrunel({
    ordre: 5,
    nom: "VMC Hygro B basse consommation",
    specifications: "VMC Hygro B basse consommation, après isolation",
    quantite: 1,
    unite: "ens",
    puHt: 1650,
    totalHt: 1650,
    totalTva: 90.75,
    totalTtc: 1740.75,
    artisan: "SMN Énergies (RGE)",
  }),
  posteMarcheBrunel({
    ordre: 6,
    nom: "Chauffe-eau thermodynamique 200 L",
    specifications: "Chauffe-eau thermodynamique 200 L",
    quantite: 1,
    unite: "u",
    puHt: 2800,
    totalHt: 2800,
    totalTva: 154,
    totalTtc: 2954,
    artisan: "SMN Énergies (RGE)",
  }),
  posteMarcheBrunel({
    ordre: 7,
    nom: "Pompe à chaleur Air/Air Daikin Multi-Split (5 splits)",
    specifications: "PAC Air/Air Daikin Multi-Split, 5 splits, dimensionnement post-isolation",
    quantite: 1,
    unite: "ens",
    puHt: 11924.41,
    totalHt: 11924.41,
    totalTva: 655.84,
    totalTtc: 12580.25,
    artisan: "SMN Énergies (RGE)",
  }),
  posteMarcheBrunel({
    ordre: 8,
    nom: "Direction de projet & Contractant Général",
    specifications: "Direction de projet et Contractant Général — Sylvain LEMBELEMBE — ENERGIA-CONSEIL IA® — 5 200,00 € HT sanctuarisés",
    quantite: 1,
    unite: "forfait",
    puHt: 5200,
    totalHt: 5200,
    totalTva: 286,
    totalTtc: 5486,
    artisan: "ENERGIA-CONSEIL IA®",
  }),
];

function postesMarcheBrunel(offreActive) {
  if (offreMarcheBrunelActive(offreActive) !== OFFRE_BRUNEL_OPTION_SANS_BAIE) {
    return POSTES_MARCHE_BRUNEL_OPTION_BAIE;
  }
  return POSTES_MARCHE_BRUNEL_OPTION_BAIE.filter((poste) => poste.ordreContractuel !== "3").map((poste, index) => {
    const suivant = { ...poste, ordreContractuel: String(index + 1) };
    if (poste.nom.startsWith("Direction de projet")) {
      return { ...suivant, totalTva: 286.01, totalTtc: 5486.01 };
    }
    return suivant;
  });
}

function htmlDevisHorsAnahBrunel() {
  const lignes = LIGNES_DEVIS_HORS_ANAH.map(
    (ligne) =>
      `${ligne.nom} : <strong>${euro(ligne.totalHt)} € HT</strong> | TVA 10,0 % : ${euro(ligne.totalTva)} € | ${euro(ligne.totalTtc)} € TTC`,
  ).join("<br>");
  return `<div class="hors-subvention">
        <strong>DEVIS N°2 — HORS SUBVENTION / HORS ANAH, LOCAUX NON CHAUFFÉS (TVA 10 %)</strong><br>
        ${lignes}<br>
        <strong>Total hors ANAH : ${euro(TOTAUX_DEVIS_HORS_ANAH.totalHt)} € HT</strong> | TVA 10,0 % : ${euro(TOTAUX_DEVIS_HORS_ANAH.totalTva)} € | <strong>${euro(TOTAUX_DEVIS_HORS_ANAH.totalTtc)} € TTC</strong>.
        Non compris dans le devis n°1 aidé, ni dans la subvention ANAH, ni dans l’échéancier 30/40/30 du marché principal. Porte de service garage / local technique : 980,00 € HT | 1 078,00 € TTC.
      </div>`;
}

export function payloadContratBrunelMarche2026(offreActive) {
  const sansBaie = offreMarcheBrunelActive(offreActive) === OFFRE_BRUNEL_OPTION_SANS_BAIE;
  const t = sansBaie ? TOTAUX_OPTION_SANS_BAIE : TOTAUX_OPTION_BAIE;
  const base = payloadContratBrunelOfficiel();
  const dateTxt = base.dateTxt;
  const postes = postesMarcheBrunel(offreActive);
  const profilJaune = !sansBaie;
  const mar = profilJaune ? MAR_BRUNEL_JAUNE : MAR_BRUNEL;
  const profilLibelle = profilJaune ? "JAUNE 60 %" : "VIOLET 45 %";
  const ligneMar = `MAR Antoine Baratier — Cabinet C2ET — honoraires ${euro(mar.honorairesTtc)} € TTC, aide ANAH ${profilJaune ? "60 %" : "40 %"} = ${euro(mar.aideAnah)} €, reste à charge client = ${euro(mar.resteAChargeClientTtc)} € TTC`;
  const ligneFinancement = profilJaune
    ? {
        label:
          "Financement Éco-PTZ à 0 % sur 20 ans possible (mensualité estimée : ~63,50 € / mois à taux zéro sans apport)",
        montant: "~ 63,50 € / mois",
      }
    : {
        label: "Éco-PTZ à 0 % sur 20 ans (Établissement bancaire conventionné — prêt à taux zéro de l'État)",
        montant: `~ ${euro(Math.round((t.resteAChargeTravauxTtc / 240) * 100) / 100)} € / mois`,
      };
  const titreOption = sansBaie
    ? "Option 2 — sans baie vitrée ni linteau IPN"
    : "Option 1 — avec baie vitrée et linteau IPN";
  return {
    ...base,
    clientHtml: `<strong>Monsieur BRUNEL Emrick</strong><br>Domicile : 111 Rue Poliacus, 42110 POUILLY-LÈS-FEURS<br>Tél. : 06 50 26 31 83`,
    alertHtml: `<div class="disclaimer">${NOTE_DEVIS_FACADE_V1}</div>`,
    footerClientHtml: `Contrat ${base.numero} — Monsieur Emrick BRUNEL — 48 Impasse des Lagunes, 42510 BUSSIÈRES — ${dateTxt}`,
    metaLignesHtml: `Combles perdus habitables : 35 m²<br>Scénario MAR n°3 — passoire G → classe C<br>Profil ANAH ${profilLibelle}<br>Statut : ${DETAIL_JALON_BRUNEL_DEPOT_MAR}<br>${titreOption}<br>`,
    titrePostes: `II. Détail des postes contractuels — devis n°1 marché aidé ANAH (${titreOption}, TVA 5,5 %)`,
    introPostesHtml: `Isolation des combles perdus habitables : <strong>35 m²</strong> à 41,68 € HT. Menuiseries PVC entrée : <strong>2 unités</strong>. TVA 5,5 % au centime près. Chiffrage validé : <strong>${euro(t.totalHt)} € HT / ${euro(t.totalTtc)} € TTC</strong>. Profil ANAH ${profilLibelle} : ${euro(t.subventionAnah)} €${profilJaune ? ` (Reste à charge travaux estimé : ${euro(t.resteAChargeTravauxTtc)} € TTC)` : ""}. Pilotage : Direction de projet &amp; Contractant Général — 5 200,00 € HT — Sylvain LEMBELEMBE`,
    postes,
    totaux: t,
    totauxPhraseHtml: `<strong>Totaux contractuels du devis n°1 :</strong> ${euro(t.totalHt)} € HT | TVA 5,5 % : ${euro(t.totalTva)} € | <strong>TOTAL TTC : ${euro(t.totalTtc)} €</strong>. Aide ANAH ${profilLibelle} : <strong>${euro(t.subventionAnah)} €</strong>. Reste à charge travaux TTC : <strong>${euro(t.resteAChargeTravauxTtc)} € TTC</strong>. ${ligneMar}. Reste à charge global TTC (travaux + MAR) : <strong>${euro(t.resteAChargeGlobalTtc)} € TTC</strong>.`,
    apresTableauPostesHtml: htmlDevisHorsAnahBrunel(),
    recapLignes: [
      { label: "Total HT", montant: `${euro(t.totalHt)} € HT` },
      { label: "TVA 5,5 %", montant: `${euro(t.totalTva)} €` },
      { label: "Total TTC", montant: `${euro(t.totalTtc)} € TTC`, total: true },
      { label: `Aide ANAH ${profilLibelle} du HT`, montant: `${euro(t.subventionAnah)} €` },
      { label: "Reste à charge travaux TTC", montant: `${euro(t.resteAChargeTravauxTtc)} € TTC`, total: true },
      { label: ligneMar, montant: `${euro(mar.resteAChargeClientTtc)} € TTC` },
      { label: "Reste à charge global TTC (travaux + MAR)", montant: `${euro(t.resteAChargeGlobalTtc)} € TTC`, total: true },
      ligneFinancement,
      { label: "Acompte 30 % à la signature", montant: `${euro(t.acompte)} € TTC` },
      {
        label: "Échéance 40 % mi-chantier",
        muted: "Après validation de Sylvain LEMBELEMBE",
        montant: `${euro(t.intermediaire)} € TTC`,
      },
      { label: "Solde 30 % à réception", montant: `${euro(t.solde)} € TTC` },
      { label: "Total échéancier 30 % / 40 % / 30 %", montant: `${euro(t.totalTtc)} € TTC`, total: true },
    ],
    aidesLignes: [
      { label: `Aide ANAH ${profilLibelle} du HT (estimation à titre indicatif)`, montant: `${euro(t.subventionAnah)} €` },
      { label: "Reste à charge travaux TTC", montant: `${euro(t.resteAChargeTravauxTtc)} € TTC`, total: true },
      { label: ligneMar, montant: `${euro(mar.resteAChargeClientTtc)} € TTC` },
      { label: "Reste à charge global TTC (travaux + MAR)", montant: `${euro(t.resteAChargeGlobalTtc)} € TTC`, total: true },
      ligneFinancement,
    ],
    planning: [
      {
        phase: "Dossier ANAH (MAR)",
        duree: "Dépôt officiel",
        detail: "Devis validé. Dossier en attente de dépôt officiel par le MAR. Aucun démarrage avant accord écrit ANAH.",
      },
      { phase: "1. Combles habitables 35 m²", duree: "2–3 j", detail: "41,68 € HT/m² — 1 458,80 € HT" },
      { phase: "2. Menuiseries PVC entrée", duree: "1–2 sem.", detail: "2 unités — 1 800,00 € HT" },
      { phase: "3. Baie 215×240 + IPN", duree: "2–3 sem.", detail: sansBaie ? "Poste non retenu dans l’option 2" : "4 800,00 € HT" },
      { phase: "4. Porte d’entrée Ud ≤ 1,3", duree: "2–3 j", detail: "2 100,00 € HT" },
      { phase: "5. VMC Hygro B", duree: "3–5 j", detail: "1 650,00 € HT — après isolation" },
      { phase: "6. Chauffe-eau thermodynamique 200 L", duree: "2–3 j", detail: "2 800,00 € HT" },
      { phase: "7. PAC Air/Air Daikin 5 splits", duree: "2–3 sem.", detail: "11 924,41 € HT — dimensionnement post-isolation" },
      { phase: "8. Direction de projet", duree: "Toute la durée", detail: "5 200,00 € HT — Sylvain LEMBELEMBE" },
    ],
    signatureHtml: `<p>Je soussigné, Monsieur Emrick BRUNEL, accepte le présent contrat n° <strong>${profilJaune ? "CONTRAT-2026-BRUNEL-FINAL" : base.numero}</strong> d’un montant ferme et définitif de <strong>${euro(t.totalTtc)} € TTC</strong> et mandate <strong>ENERGIA-CONSEIL IA®</strong> en qualité de Contractant Général pour la rénovation globale clé en main.</p>
        <div class="signature-unique">
          <p>Fait à ........................................, le ...... / ...... / 2026</p>
          <p><strong>Signature du Client / Maître d’Ouvrage :</strong><br>Monsieur Emrick BRUNEL</p>
          <p>Mentions manuscrites :<br>« Lu et approuvé », « Bon pour accord », « Ne vaut pas ordre de démarrer avant accord ANAH »</p>
          <div class="signature-cadre">Cadre réservé pour la signature de M. BRUNEL</div>
        </div>`,
    juliaBullets: [
      `la qualité d’ENERGIA-CONSEIL IA® de <strong>Contractant Général</strong> (responsabilité globale du chantier, prix forfaitaire ferme ${euro(t.totalTtc)} € TTC, artisans RGE en sous-traitance) ;`,
      `la conformité réglementaire globale (artisans RGE, aides 2026 à titre indicatif, ordre des travaux, profil ANAH ${profilLibelle}) ;`,
      `la contrainte d’indivision : article 815 — signature unanime de tous les indivisaires sous peine de nullité du contrat et des aides ;`,
      `le devis n°1 : combles habitables 35 m², 2 menuiseries PVC, ${sansBaie ? "sans baie ni IPN, " : "baie 215×240 + IPN 4 800,00 € HT, "}porte Ud ≤ 1,3, VMC Hygro B, chauffe-eau 200 L, PAC Daikin 5 splits, direction 5 200,00 € HT ;`,
      `le devis n°2 hors ANAH (locaux non chauffés, TVA 10 %) : ${euro(TOTAUX_DEVIS_HORS_ANAH.totalHt)} € HT / ${euro(TOTAUX_DEVIS_HORS_ANAH.totalTtc)} € TTC, dont porte de service 980,00 € HT / 1 078,00 € TTC ;`,
      `l’interdiction de démarrer les travaux avant accord écrit de l’ANAH si MaPrimeRénov’ est retenue ;`,
      `la <strong>Clause Julia Protection Aides</strong> : responsabilité ENERGIA plafonnée à 2 000 € en cas d’écart &gt; 10 % imputable à une erreur prouvée d’ENERGIA ; 0 % si erreur client ou décision ANAH/CEE ;`,
      `le régime de paiement : <strong>30 % signature / 40 % mi-chantier / 30 % réception</strong> (${euro(t.acompte)} € / ${euro(t.intermediaire)} € / ${euro(t.solde)} € TTC), le 40 % après validation Sylvain LEMBELEMBE.`,
    ],
    cgvArticles: base.cgvArticles.map((article, index) => {
      if (index === 0) return article.replaceAll(euro(TOTAUX_BRUNEL_V3.totalTtc), euro(t.totalTtc));
      if (index === 1) {
        return `<strong>Article 2 — Ordre des travaux impératif.</strong> Isolation combles habitables 35 m² → menuiseries PVC entrée (2 unités) → ${sansBaie ? "" : "baie vitrée alu 215×240 avec ouverture mur porteur et linteau IPN → "}porte d’entrée Ud ≤ 1,3 → VMC Hygro B → chauffe-eau thermodynamique 200 L → PAC Air/Air Daikin 5 splits. Isolation avant chauffage en toutes circonstances. Devis n°2 hors ANAH (TVA 10 %) séparé.`;
      }
      if (index === 2) {
        return `<strong>Article 3 — Modalités de paiement 30 / 40 / 30.</strong> 30 % à la signature : ${euro(t.acompte)} € TTC. 40 % mi-chantier après validation de Sylvain LEMBELEMBE : ${euro(t.intermediaire)} € TTC. 30 % à réception : ${euro(t.solde)} € TTC. Total : ${euro(t.totalTtc)} € TTC.`;
      }
      return article;
    }),
    printCinqPages: true,
    dateTxt,
  };
}

function substituerMontantsTexteBrunel(texte, totauxCible, financementCible) {
  return String(texte || "")
    .replaceAll(euro(TOTAUX_BRUNEL_V3.totalTtc), euro(totauxCible.totalTtc))
    .replaceAll(euro(TOTAUX_BRUNEL_V3.totalHt), euro(totauxCible.totalHt))
    .replaceAll(euro(TOTAUX_BRUNEL_V3.totalTva), euro(totauxCible.totalTva))
    .replaceAll(euro(FINANCEMENT_BRUNEL_V3.acompte), euro(financementCible.acompte))
    .replaceAll(euro(FINANCEMENT_BRUNEL_V3.intermediaire), euro(financementCible.intermediaire))
    .replaceAll(euro(FINANCEMENT_BRUNEL_V3.solde), euro(financementCible.solde))
    .replaceAll(euro(FINANCEMENT_BRUNEL_V3.mensualiteExacte), euro(financementCible.mensualiteExacte))
    .replaceAll(euro(FINANCEMENT_BRUNEL_V3.bilanNetMensuel), euro(financementCible.bilanNetMensuel));
}

export function recapLignesFinancieresBrunelV5(offre = OFFRE_PERFORMANCE) {
  const autonomie = normaliserOffreBrunel(offre) === OFFRE_AUTONOMIE;
  const tPerf = TOTAUX_BRUNEL_V5_PERFORMANCE;
  const tSol = TOTAUX_BRUNEL_V5_SOLAIRE;
  const t = autonomie ? TOTAUX_BRUNEL_V5_CUMUL : TOTAUX_BRUNEL_V5_PERFORMANCE;
  const f = autonomie ? FINANCEMENT_BRUNEL_V5_AUTONOMIE : FINANCEMENT_BRUNEL_V5_PERFORMANCE;
  const tvaDetail = autonomie
    ? `${euro(t.totalTva)} € (dont ${euro(tPerf.totalTva)} € à 5,5 % et ${euro(tSol.totalTva)} € à 20 %)`
    : `${euro(tPerf.totalTva)} €`;
  const lignes = [
    { label: "Marché Performance HT (TVA 5,5 %)", montant: `${euro(tPerf.totalHt)} € HT` },
  ];
  if (autonomie) {
    lignes.push({ label: "Lot solaire HT (TVA 20 %)", montant: `${euro(tSol.totalHt)} € HT` });
    lignes.push({ label: "Total chantier HT", montant: `${euro(t.totalHt)} € HT` });
    lignes.push({ label: "TVA (5,5 % + 20 %)", montant: tvaDetail });
  } else {
    lignes.push({ label: "TVA 5,5 %", montant: tvaDetail });
  }
  lignes.push({
    label: "TOTAL CHANTIER GLOBAL TTC",
    montant: `${euro(t.totalTtc)} € TTC`,
    total: true,
  });
  lignes.push({
    label: "Acompte 30 % à la signature",
    muted: "Engagement, blocage des prix artisans et constitution du dossier ANAH",
    montant: `${euro(f.acompte)} € TTC`,
  });
  lignes.push({
    label: "Échéance intermédiaire 40 % démarrage",
    muted: "Démarrage effectif du chantier et approvisionnement PAC / menuiseries / solaire",
    montant: `${euro(f.intermediaire)} € TTC`,
  });
  lignes.push({
    label: "Solde 30 % à réception",
    muted:
      "Après procès-verbal de réception sans réserve et validation de Sylvain LEMBELEMBE (Contractant Général — ENERGIA-CONSEIL IA®)",
    montant: `${euro(f.solde)} € TTC`,
  });
  lignes.push({
    label: "Total échéancier 30 % / 40 % / 30 %",
    montant: `${euro(t.totalTtc)} € TTC`,
    total: true,
  });
  return lignes;
}

export function payloadContratBrunelSelonOffre(edition = {}) {
  const offre = normaliserOffreBrunel(edition?.offreActive);
  const autonomie = offre === OFFRE_AUTONOMIE;
  const base = payloadContratBrunelOfficiel();
  const totauxV5 = totauxContractuelsBrunelV5(offre);
  const t = autonomie ? TOTAUX_BRUNEL_V5_CUMUL : TOTAUX_BRUNEL_V5_PERFORMANCE;
  const tPerf = TOTAUX_BRUNEL_V5_PERFORMANCE;
  const tSol = TOTAUX_BRUNEL_V5_SOLAIRE;
  const f = autonomie ? FINANCEMENT_BRUNEL_V5_AUTONOMIE : FINANCEMENT_BRUNEL_V5_PERFORMANCE;
  const a = autonomie ? AIDES_BRUNEL_V5_AUTONOMIE : AIDES_BRUNEL_V5_PERFORMANCE;
  const dateTxt = dateLongue(BRUNEL_V5_DATE);
  const remplacer = (valeur) => substituerMontantsTexteBrunel(valeur, t, f);
  const totauxPhraseHtml = autonomie
    ? `<strong>Formule Autonomie Solaire Totale V5 :</strong> Marché Performance ${euro(tPerf.totalHt)} € HT (TVA 5,5 % : ${euro(tPerf.totalTva)} €) + lot solaire ${euro(tSol.totalHt)} € HT (TVA 20 % : ${euro(tSol.totalTva)} €) = <strong>${euro(t.totalHt)} € HT</strong> | TVA mixte ${euro(t.totalTva)} € | <strong>TOTAL CHANTIER GLOBAL TTC : ${euro(t.totalTtc)} €</strong>.`
    : `<strong>Formule Performance V5 :</strong> ${euro(t.totalHt)} € HT | TVA 5,5 % : ${euro(t.totalTva)} € | <strong>TOTAL CHANTIER GLOBAL TTC : ${euro(t.totalTtc)} €</strong>.`;
  const lotSolaireHtml = autonomie
    ? `<div class="hors-subvention"><strong>${NOTE_SOLAIRE_HORS_MPR}</strong></div>`
    : "";
  const planning = autonomie
    ? [
        ...base.planning,
        {
          phase: "9. Pack autonomie solaire 6 kWc",
          duree: "2–3 sem.",
          detail:
            "12 modules DualSun Flash 500 Wc + micro-onduleurs Enphase + batterie 7 kWh — pose RGE QualiPV, Consuel. Lot complémentaire TVA 20 %, hors MaPrimeRénov’.",
        },
      ]
    : base.planning;

  return {
    ...base,
    dateIso: BRUNEL_V5_DATE,
    dateTxt,
    metaLignesHtml: `Combles C2L verrouillés : 100 m²<br>Offre contractuelle : ${libelleOffreBrunel(offre)}<br>Devis façade N° ${DEVIS_FACADE_NUMERO} du 18/09/2026<br>Statut : ${STATUT_DOSSIER_BRUNEL_V3}<br>`,
    titrePostes: autonomie
      ? "II. Détail des 9 postes contractuels — Performance + autonomie solaire"
      : "II. Détail des 8 postes contractuels — formule Performance (TVA 5,5 %)",
    introPostesHtml: remplacer(base.introPostesHtml),
    colonneTva: autonomie ? "TVA" : "TVA 5,5 %",
    labelTotalRow: autonomie ? "TOTAL CHANTIER GLOBAL (Performance + solaire)" : "TOTAL MARCHÉ PERFORMANCE",
    postes: totauxV5.lignes
      .slice()
      .sort((x, y) => Number(x.ordreContractuel || 0) - Number(y.ordreContractuel || 0)),
    totaux: t,
    totauxPhraseHtml,
    apresTableauPostesHtml: `<div class="sous-ensemble"><strong>Total Sous-Ensemble Façade &amp; Menuiseries (Lot 1 éligible) — devis ${DEVIS_FACADE_NUMERO} :</strong> ${euro(TOTAUX_FACADE_BRUNEL_V4.totalHt)} € HT | TVA 5,5 % : ${euro(TOTAUX_FACADE_BRUNEL_V4.totalTva)} € | <strong>${euro(TOTAUX_FACADE_BRUNEL_V4.totalTtc)} € TTC</strong>.</div>
      <div class="hors-subvention">
        <strong>LOT 2 — HORS SUBVENTION (charge directe exclusive de M. Brunel)</strong><br>
        ${POSTE_HORS_SUBVENTION_BRUNEL.nom} (panneau isolé, serrure multipoints) : <strong>${euro(POSTE_HORS_SUBVENTION_BRUNEL.totalHt)} € HT</strong> | TVA 10,0 % : ${euro(POSTE_HORS_SUBVENTION_BRUNEL.totalTva)} € | <strong>Total TTC : ${euro(POSTE_HORS_SUBVENTION_BRUNEL.totalTtc)} € TTC</strong>.
        Non comprise dans les aides de l’enveloppe chauffée, ni dans le total ${euro(t.totalTtc)} € TTC, ni dans l’échéancier 30/40/30.
      </div>${lotSolaireHtml}`,
    annexePhotosHtml: htmlAnnexeVisuelleFacadeBrunel(IMAGES_CONTRAT_BRUNEL_V5[0].src),
    recapLignes: recapLignesFinancieresBrunelV5(offre),
    apresRecapHtml: autonomie ? htmlEtudeRentabiliteSolaireBrunel() : "",
    titreAides: autonomie
      ? "V. Aides financières 2026 &amp; financement (estimation à titre indicatif)"
      : "IV. Aides financières 2026 &amp; financement (estimation à titre indicatif)",
    titrePlanning: autonomie ? "VI. Planning prévisionnel" : "V. Planning prévisionnel",
    titreSignature: autonomie ? "VII. Bon pour accord" : "VI. Bon pour accord",
    titreContacts: autonomie ? "VIII. Contacts projet officiels" : "VII. Contacts projet officiels",
    titreJulia: autonomie ? "IX. Avis juridique — Julia (obligatoire)" : "VIII. Avis juridique — Julia (obligatoire)",
    titreCgv: autonomie ? "X. Conditions générales de vente — ENERGIA-CONSEIL IA®" : "IX. Conditions générales de vente — ENERGIA-CONSEIL IA®",
    titreMentions: autonomie ? "XI. Mentions légales" : "X. Mentions légales",
    aidesLignes: [
      { label: a.libelleMpr, montant: `${euro(a.mpr)} €` },
      { label: a.libelleCee, montant: `${euro(a.cee)} €` },
      { label: a.libelleLocales, montant: `${euro(a.locales)} €` },
      { label: a.libelleMar, montant: `${euro(a.mar)} €` },
      { label: "Total aides publiques estimées", montant: `${euro(a.totalAides)} €`, total: true },
      { label: "Reste à charge net client", montant: `${euro(a.resteACharge)} € TTC`, total: true },
      {
        label: "Éco-PTZ à 0 % sur 20 ans (Établissement bancaire conventionné — prêt à taux zéro de l'État)",
        montant: `~ ${euro(f.mensualiteExacte)} € / mois`,
      },
      {
        label: "Économies factures prévues",
        montant: autonomie ? "−269,17 € / mois (thermique + solaire)" : "−150,00 € / mois",
      },
      { label: "Gain net mensuel estimé", montant: `+${euro(f.bilanNetMensuel)} € / mois`, total: true },
    ],
    planning,
    signatureHtml: `<p>Je soussigné(e), agissant pour l’Indivision COUBLE, accepte le présent contrat n° <strong>${BRUNEL_FINAL_NUMERO}</strong>
        d’un montant <strong>ferme et définitif</strong> de <strong>${euro(t.totalTtc)} € TTC</strong> et mandate <strong>ENERGIA-CONSEIL IA® en qualité de Contractant Général</strong> pour la rénovation globale clé en main.</p>
        <p>Échéancier de paiement : <strong>30 % à la signature</strong> (${euro(f.acompte)} € TTC) / <strong>40 % au démarrage effectif du chantier</strong> (${euro(f.intermediaire)} € TTC) / <strong>30 % à réception</strong> (${euro(f.solde)} € TTC), après PV sans réserve et validation Sylvain LEMBELEMBE.</p>
        <p>Mentions manuscrites obligatoires : « Lu et approuvé », « Bon pour accord », « Ne vaut pas ordre de démarrer avant accord ANAH ».</p>
        <p>Fait à ____________________________ , le ___ / ___ / 2026</p>
        <p><strong>Signatures de TOUS les indivisaires — article 815 du Code civil :</strong></p>
        <table class="sig-table">
          <tr>
            <td>Indivisaire 1 — Nom : ____________________<div class="sig-line"></div></td>
            <td>Indivisaire 2 — Nom : ____________________<div class="sig-line"></div></td>
          </tr>
          <tr>
            <td>Indivisaire 3 — Nom : ____________________<div class="sig-line"></div></td>
            <td>M. BRUNEL Emrick (mandant)<div class="sig-line"></div></td>
          </tr>
        </table>`,
    juliaBullets: [
      `la qualité d’ENERGIA-CONSEIL IA® de <strong>Contractant Général</strong> (responsabilité globale du chantier, prix forfaitaire ferme ${euro(t.totalTtc)} € TTC, artisans RGE en sous-traitance) ;`,
      `la conformité réglementaire globale (artisans RGE, aides 2026 à titre indicatif, ordre des travaux isolation avant chauffage, plafonds MPR/CEE) ;`,
      `la contrainte d’indivision : article 815 — signature unanime de tous les indivisaires sous peine de nullité du contrat et des aides ;`,
      `l’intégration du devis façade N° ${DEVIS_FACADE_NUMERO} du 18/09/2026 (postes 2 à 4 — Lot 1 éligible ${euro(TOTAUX_FACADE_BRUNEL_V4.totalTtc)} € TTC) ;`,
      `l’exclusion du marché de la porte d’accès local technique / garage (Lot 2 hors subvention : 980,00 € HT, TVA 10 %, 1 078,00 € TTC à la charge directe exclusive de M. Brunel) ;`,
      `l’interdiction de démarrer les travaux avant accord écrit de l’ANAH si MaPrimeRénov’ est retenue ;`,
      `la <strong>Clause Julia Protection Aides</strong> : responsabilité ENERGIA plafonnée à 2 000 € en cas d’écart &gt; 10 % imputable à une erreur prouvée d’ENERGIA ; 0 % si erreur client ou décision ANAH/CEE ;`,
      `le régime de paiement spécifique au présent marché : <strong>30 % signature / 40 % démarrage / 30 % réception</strong> (${euro(f.acompte)} € / ${euro(f.intermediaire)} € / ${euro(f.solde)} € TTC), le solde après PV sans réserve et validation Sylvain LEMBELEMBE.`,
    ],
    cgvIntro: `Les présentes CGV s’appliquent au contrat ${BRUNEL_FINAL_NUMERO}. Elles intègrent les 12 protections juridiques ENERGIA.`,
    cgvArticles: (base.cgvArticles || []).map((article, index) => {
      if (index === 2) {
        return `<strong>Article 3 — Modalités de paiement 30 / 40 / 30.</strong> Acompte initial de 30 % à la signature : ${euro(f.acompte)} € TTC (engagement et blocage artisans). Acompte intermédiaire de 40 % au démarrage effectif du chantier : ${euro(f.intermediaire)} € TTC (approvisionnement PAC / menuiseries). Solde de 30 % à la réception : ${euro(f.solde)} € TTC, après procès-verbal de réception sans réserve et validation Sylvain LEMBELEMBE. Total : ${euro(t.totalTtc)} € TTC. Aucun règlement artisans hors circuit convenu sans accord de Sylvain.`;
      }
      if (index === 17) {
        return `<strong>Article 18 — Validité.</strong> Le présent contrat est valable 3 mois à compter du ${dateTxt}.`;
      }
      return remplacer(article);
    }),
    footerClientHtml: `Contrat ${BRUNEL_FINAL_NUMERO} — ${libelleOffreBrunel(offre)} — Monsieur BRUNEL Emrick / Indivision COUBLE — 48 Impasse des Lagunes, 42510 BUSSIÈRES — ${dateTxt}`,
    printCinqPages: true,
  };
}

function slugNom(value) {
  return String(value || "CLIENT")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase()
    .slice(0, 28);
}

function pairesPhotosEdition(edition) {
  if (Array.isArray(edition?.photos?.paires) && edition.photos.paires.length) {
    return edition.photos.paires.filter((p) => p?.avantSrc);
  }
  const ajouts = edition?.photos?.ajouts && typeof edition.photos.ajouts === "object" ? edition.photos.ajouts : {};
  return Object.entries(ajouts)
    .map(([id, item]) => ({
      id,
      titre: item.titre || `Photo — ${id}`,
      cote: item.cote || "",
      etatUsure: item.etatUsure || "",
      preconisationRge: item.preconisationRge || "",
      avantSrc: item.avantSrc,
      apresSrc: item.apresSrc || null,
      legendAvant: item.legendAvant || item.legend || "Avant — état des lieux.",
      legendApres: item.legendApres || "Après — projection indicative.",
    }))
    .filter((p) => p.avantSrc);
}

export function payloadContratDepuisEdition(edition = {}, dossier = {}) {
  const p = edition.prestataire || PRESTATAIRE_ENERGIA;
  const client = edition.client || {};
  const totaux = totauxTravaux(edition.travaux || []);
  const aides = calculerAidesIndicatives(edition);
  const plan = calculerFinancement(edition);
  const dateIso = edition.devisOfficiel?.date || new Date().toISOString().slice(0, 10);
  const dateTxt = dateLongue(dateIso);
  const numero =
    edition.devisOfficiel?.numero ||
    `CONTRAT-2026-${slugNom(client.nom || dossier.nom)}`;
  const profil = PROFILS_ANAH.find((item) => item.id === (aides.profil || edition.aides?.profil));
  const libelleProfil = profil?.label || (aides.profil ? String(aides.profil) : "non renseigné");
  const rfr = Number(edition.aides?.rfr || dossier.rfr?.montant || 0);
  const parts = Number(edition.aides?.parts || dossier.rfr?.parts || 0);
  const dpeActuel = edition.valorisation?.dpeActuel || "";
  const dpeCible = edition.valorisation?.dpeCible || "";
  const saut = edition.valorisation?.gainClasses || edition.aides?.gainClasses || "";
  const statut = STATUTS_OCCUPATION.find((s) => s.id === client.statutOccupation)?.label || "Propriétaire";
  const identite = [client.prenom, client.nom].filter(Boolean).join(" ") || dossier.nom || "Client";
  const adresse = client.adresse || client.adresseChantier || dossier.adresse || "";
  const surface = client.surfaceHabitable || "";
  const lignesCg = totaux.lignes.filter(estLigneContractantGeneral);
  const lignesTravaux = totaux.lignes.filter((l) => !estLigneContractantGeneral(l));
  const ht55 = lignesTravaux.reduce((s, l) => s + (l.totalHt || 0), 0);
  const tva55 = lignesTravaux.reduce((s, l) => s + (l.totalTva || 0), 0);
  const ttc55 = lignesTravaux.reduce((s, l) => s + (l.totalTtc || 0), 0);
  const htCg = lignesCg.reduce((s, l) => s + (l.totalHt || 0), 0);
  const tvaCg = lignesCg.reduce((s, l) => s + (l.totalTva || 0), 0);
  const ttcCg = lignesCg.reduce((s, l) => s + (l.totalTtc || 0), 0);
  const mixte = lignesCg.some((l) => Number(l.tauxTva) >= 0.199);
  const postes = totaux.lignes.map((l, index) => ({
    ...l,
    ordreContractuel: l.ordreContractuel || index + 1,
    specifications: l.specifications || l.nom,
    artisan: l.artisan || "À sélectionner RGE",
  }));
  const photos = pairesPhotosEdition(edition);
  const recapLignes = mixte
    ? [
        {
          label: "Travaux TVA 5,5 %",
          montant: `${euro(ht55)} € HT · ${euro(tva55)} € TVA · ${euro(ttc55)} € TTC`,
        },
        {
          label: "Direction &amp; Contractant Général TVA 20 %",
          montant: `${euro(htCg)} € HT · ${euro(tvaCg)} € TVA · ${euro(ttcCg)} € TTC`,
        },
        { label: "Montant du marché TTC", montant: `${euro(totaux.totalTtc)} €`, total: true },
      ]
    : [
        { label: "Montant des travaux HT", montant: `${euro(totaux.totalHt)} €` },
        { label: "TVA", montant: `${euro(totaux.totalTva)} €` },
        { label: "Montant du marché TTC", montant: `${euro(totaux.totalTtc)} €`, total: true },
      ];
  recapLignes.push(
    {
      label: "Acompte initial de 30 % à la signature",
      muted: "Engagement, blocage des prix artisans et constitution du dossier ANAH",
      montant: `${euro(plan.acompte)} €`,
    },
    {
      label: "Acompte intermédiaire de 40 % au démarrage effectif du chantier",
      muted: "Livraison et approvisionnement des matériels",
      montant: `${euro(plan.intermediaire)} €`,
    },
    {
      label: "Solde de 30 % à la réception des travaux",
      muted:
        "Après procès-verbal de réception sans réserve et validation de Sylvain LEMBELEMBE (Contractant Général — ENERGIA-CONSEIL IA®)",
      montant: `${euro(plan.solde)} €`,
    },
    { label: "Total échéancier 30 % / 40 % / 30 %", montant: `${euro(totaux.totalTtc)} €`, total: true },
  );

  const aidesLignes = (aides.lignesDetail || [])
    .map((ligne) => ({ label: ligne.libelle, montant: `${euro(ligne.montant || 0)} €` }))
    .concat([
      { label: "Total aides estimées", montant: `${euro(aides.totalAides || 0)} €`, total: true },
      { label: "Reste à charge net client", montant: `${euro(plan.resteACharge)} € TTC`, total: true },
      {
        label: "Éco-PTZ à 0 % sur 20 ans (banque partenaire, dossier technique ENERGIA)",
        montant: `~ ${euro(plan.mensualite20 || plan.mensualite || 0)} € / mois`,
      },
      {
        label: "Financement travaux / Courtier FABIEN — VIVONS COURTIER — 06 71 19 96 45",
        montant: "Prêts 6 000 € à 75 000 €",
      },
    ]);

  const planning = [
    {
      phase: "Dossier ANAH (Clyve / MAR)",
      duree: "3 à 6 mois",
      detail:
        "Dépôt avant tout démarrage. Aucune signature de devis artisans définitifs avant accord écrit ANAH si MaPrimeRénov’ est retenue.",
    },
    ...postes.map((poste) => ({
      phase: `${poste.ordreContractuel}. ${poste.nom}`,
      duree: "selon lot",
      detail: `${poste.artisan || "RGE"} — isolation avant chauffage`,
    })),
    {
      phase: "Contractant Général",
      duree: "Toute la durée",
      detail: "Sylvain LEMBELEMBE — ENERGIA-CONSEIL IA® — responsabilité globale du chantier",
    },
  ];

  return {
    titre: TITRE_CONTRAT_CONTRACTANT_GENERAL,
    numero,
    dateIso,
    dateTxt,
    prestataire: p,
    metaLignesHtml: `${escapeHtml(surface ? `${surface} m²` : "Surface à confirmer")}${dpeActuel && dpeCible ? ` — DPE ${escapeHtml(dpeActuel)} ➔ ${escapeHtml(dpeCible)}` : ""}${saut ? ` — saut ${escapeHtml(String(saut))} classe(s)` : ""}<br>`,
    clientHtml: `<strong>${escapeHtml(identite)}</strong><br>${escapeHtml(adresse)}<br>${escapeHtml(statut)}${surface ? ` — ${escapeHtml(String(surface))} m²` : ""}${dpeActuel && dpeCible ? ` — DPE ${escapeHtml(dpeActuel)} ➔ ${escapeHtml(dpeCible)}` : ""}`,
    lieuExecution: escapeHtml(client.adresseChantier || adresse),
    fiscaliteHtml: `<div class="disclaimer">
        <strong>Ingénierie financière 2026 (estimation à titre indicatif).</strong>
        ${rfr ? `RFR ${euro(rfr)} €` : "RFR à confirmer"} · ${parts || "—"} part(s) · profil ANAH <strong>${escapeHtml(libelleProfil)}</strong>.
        Montants définitifs après instruction ANAH et CEE.
      </div>`,
    alertHtml: (edition.mentionsJuridiques || [])
      .map((m) => `<div class="alert-red">${escapeHtml(m)}</div>`)
      .join(""),
    titrePostes: `II. Détail des ${postes.length} postes contractuels — ordre optimal ENERGIA`,
    introPostesHtml:
      "Postes issus du CRM (travaux cochés). Isolation avant chauffage. Pilotage : Sylvain LEMBELEMBE — ENERGIA-CONSEIL IA®.",
    postes,
    totaux,
    totauxPhraseHtml: mixte
      ? `<strong>Totaux contractuels :</strong> ${euro(totaux.totalHt)} € HT | TVA 5,5 % : ${euro(tva55)} € | TVA 20 % : ${euro(tvaCg)} € | <strong>TOTAL TTC : ${euro(totaux.totalTtc)} €</strong>.`
      : `<strong>Totaux contractuels :</strong> ${euro(totaux.totalHt)} € HT | TVA : ${euro(totaux.totalTva)} € | <strong>TOTAL TTC : ${euro(totaux.totalTtc)} €</strong>.`,
    annexePhotosHtml: photos.length
      ? htmlAnnexePhotos({
          paires: photos,
          mentionLegale: "Photographies du dossier CRM — état des lieux.",
          mentionProjection: "Les images « après » sont des projections indicatives, non contractuelles.",
        })
      : "",
    recapLignes,
    aidesLignes,
    planning,
    signatureHtml: `<p>Je soussigné(e), <strong>${escapeHtml(identite)}</strong>, accepte le présent contrat n° <strong>${escapeHtml(numero)}</strong>
        d’un montant <strong>ferme et définitif</strong> de <strong>${euro(totaux.totalTtc)} € TTC</strong> (reste à charge indicatif ${euro(plan.resteACharge)} €) et mandate <strong>ENERGIA-CONSEIL IA® en qualité de Contractant Général</strong> pour la rénovation globale clé en main.</p>
        <p>Échéancier de paiement : <strong>30 % à la signature</strong> (${euro(plan.acompte)} € TTC) / <strong>40 % au démarrage effectif du chantier</strong> (${euro(plan.intermediaire)} € TTC) / <strong>30 % à réception</strong> (${euro(plan.solde)} € TTC), après PV sans réserve et validation Sylvain LEMBELEMBE.</p>
        <p>Mentions manuscrites obligatoires : « Lu et approuvé », « Bon pour accord », « Ne vaut pas ordre de démarrer avant accord ANAH ».</p>
        <p>Fait à ____________________________ , le ___ / ___ / 2026</p>
        <table class="sig-table">
          <tr>
            <td>Le client — ${escapeHtml(identite)}<div class="sig-line"></div></td>
            <td>ENERGIA-CONSEIL IA® — Sylvain LEMBELEMBE<div class="sig-line"></div></td>
          </tr>
        </table>`,
    contacts: CONTACTS_CONTRAT_MASTER,
    juliaBullets: [
      `la qualité d’ENERGIA-CONSEIL IA® de <strong>Contractant Général</strong> (responsabilité globale du chantier, prix forfaitaire ferme ${euro(totaux.totalTtc)} € TTC, artisans RGE en sous-traitance) ;`,
      `la conformité réglementaire globale (artisans RGE, aides 2026 à titre indicatif, ordre des travaux isolation avant chauffage, plafonds MPR/CEE) ;`,
      `le profil ${escapeHtml(libelleProfil)}${rfr ? ` (RFR ${euro(rfr)} €)` : ""} ;`,
      `l’interdiction de démarrer les travaux avant accord écrit de l’ANAH si MaPrimeRénov’ est retenue ;`,
      `la <strong>Clause Julia Protection Aides</strong> : responsabilité ENERGIA plafonnée à 2 000 € en cas d’écart &gt; 10 % imputable à une erreur prouvée d’ENERGIA ; 0 % si erreur client ou décision ANAH/CEE ;`,
      `le régime de paiement spécifique au présent marché : <strong>30 % signature / 40 % démarrage / 30 % réception</strong> (${euro(plan.acompte)} € / ${euro(plan.intermediaire)} € / ${euro(plan.solde)} € TTC), le solde après PV sans réserve et validation Sylvain LEMBELEMBE.`,
    ],
    mentionsHtml: MENTIONS_STANDARD(p),
    footerClientHtml: `Contrat ${escapeHtml(numero)} — ${escapeHtml(identite)} — ${escapeHtml(adresse)} — ${dateTxt}`,
    echeancier: {
      acompte: plan.acompte,
      intermediaire: plan.intermediaire,
      solde: plan.solde,
    },
  };
}

export function estDossierPereiraOfficiel(dossierId) {
  return dossierId === PEREIRA_NERVIEUX_DOSSIER_ID;
}

export function estDossierBrunelOfficiel(dossierId) {
  return dossierId === BRUNEL_DOSSIER_ID;
}

export function estDossierCloisonSdbOfficiel(dossierId) {
  return dossierId === CLOISON_SDB_DOSSIER_ID;
}

export function estDossierGilbertasOfficiel(dossierId) {
  return dossierId === GILBERTAS_DOSSIER_ID;
}

export function estDossierMassardierOfficiel(dossierId) {
  return dossierId === MASSARDIER_LEAD_ID;
}

export function estDossierDamienPv100kwcOfficiel(dossierId) {
  return dossierId === DAMIEN_PV_100KWC_DOSSIER_ID;
}

export function estDossierGesnouinOfficiel(dossierId) {
  return dossierId === GESNOUIN_DOSSIER_ID;
}

export function estDossierMassonOfficiel(dossierId) {
  return dossierId === MASSON_DOSSIER_ID;
}

export function estDossierCoutyEscalierOfficiel(dossierId) {
  return dossierId === COUTY_ESCALIER_DOSSIER_ID;
}

export function estDossierFarissOfficiel(dossierId) {
  return dossierId === FARISS_DOSSIER_ID;
}

export function estDossierPack3en1MarseilleOfficiel(dossierId) {
  return dossierId === PACK3EN1_MARSEILLE_DOSSIER_ID;
}

export function estDossierZoulouParisOfficiel(dossierId) {
  return dossierId === ZOULOU_PARIS_DOSSIER_ID;
}

export function estDossierBrunelMaconnerieOfficiel(dossierId) {
  return dossierId === BRUNEL_MACONNERIE_DOSSIER_ID;
}

function payloadSecondOeuvreCg({
  titre,
  numero,
  dateIso,
  reference,
  identite,
  adresse,
  typeBien,
  metaExtraHtml = "",
  mentionHorsMpr,
  equipeHtml = "",
  titrePostes,
  introPostesHtml,
  postes,
  totaux,
  financement,
  ordreTravaux,
  artisansCgv,
  missionHtml,
  annexePhotosHtml = "",
  tauxTvaPct = 0.1,
  echeancierLabels = null,
  inclureCommissionDamien = false,
}) {
  const p = PRESTATAIRE_ENERGIA;
  const t = totaux;
  const f = financement;
  const dateTxt = dateLongue(dateIso);
  const postesTries = (postes || []).slice().sort((a, b) => (a.ordreContractuel || 0) - (b.ordreContractuel || 0));
  const libelleTva = `${String(Math.round(Number(tauxTvaPct) * 1000) / 10).replace(".", ",")} %`;
  const labels = {
    acompteLabel: "Acompte de 30 % à la signature",
    acompteMuted: "Engagement client et blocage des prix",
    intermediaireLabel: "Acompte de 40 % au démarrage effectif du chantier",
    intermediaireMuted: "Approvisionnement et démarrage des lots",
    soldeLabel: "Solde de 30 % à la réception sans réserve",
    soldeMuted:
      "Après procès-verbal de réception sans réserve et validation de Sylvain LEMBELEMBE (Contractant Général — ENERGIA-CONSEIL IA®)",
    ...(echeancierLabels || {}),
  };
  return {
    titre,
    numero,
    dateIso,
    dateTxt,
    prestataire: p,
    metaLignesHtml: `Réf. ${escapeHtml(reference)}<br>${metaExtraHtml}`,
    clientHtml: `<strong>${escapeHtml(identite)}</strong><br>${escapeHtml(adresse)}<br>${escapeHtml(typeBien)}`,
    lieuExecution: escapeHtml(adresse),
    fiscaliteHtml: `<div class="disclaimer">
        <strong>Marché ferme — TVA ${libelleTva}.</strong>
        ${escapeHtml(mentionHorsMpr)}
        ${equipeHtml}
      </div>`,
    alertHtml: `<div class="alert-red">${escapeHtml(mentionHorsMpr)}</div>`,
    engagementArtisansHtml:
      "Les artisans et filières partenaires interviennent sous la maîtrise d’œuvre et la sous-traitance contractuelle d’ENERGIA-CONSEIL IA®.",
    titrePostes,
    introPostesHtml,
    postes: postesTries,
    totaux: { totalHt: t.totalHt, totalTva: t.totalTva, totalTtc: t.totalTtc },
    totauxPhraseHtml: `<strong>Totaux contractuels :</strong> ${euro(t.totalHt)} € HT | TVA (${libelleTva}) : ${euro(t.totalTva)} € | <strong>TOTAL FERME ET DÉFINITIF TTC : ${euro(t.totalTtc)} €</strong>.`,
    annexePhotosHtml,
    recapLignes: [
      { label: "Montant Total Travaux HT", montant: `${euro(t.totalHt)} € HT` },
      { label: `Montant TVA (${libelleTva})`, montant: `${euro(t.totalTva)} €` },
      { label: "MONTANT TOTAL DU MARCHÉ TTC", montant: `${euro(t.totalTtc)} € TTC`, total: true },
      {
        label: labels.acompteLabel,
        muted: labels.acompteMuted,
        montant: `${euro(f.acompte)} € TTC`,
      },
      {
        label: labels.intermediaireLabel,
        muted: labels.intermediaireMuted,
        montant: `${euro(f.intermediaire)} € TTC`,
      },
      {
        label: labels.soldeLabel,
        muted: labels.soldeMuted,
        montant: `${euro(f.solde)} € TTC`,
      },
      { label: "Total échéancier 30 % / 40 % / 30 %", montant: `${euro(t.totalTtc)} € TTC`, total: true },
    ],
    titreAides: "IV. Aides & reste à charge (hors MaPrimeRénov’)",
    disclaimerAidesHtml: `<div class="disclaimer">
        <strong>Aides financières 2026 (estimation à titre indicatif).</strong>
        ${escapeHtml(mentionHorsMpr)}
      </div>`,
    aidesLignes: [
      { label: "MaPrimeRénov’ Parcours", montant: "0,00 € (non éligible)" },
      { label: "Total aides estimées", montant: "0,00 €", total: true },
      { label: "Reste à charge client net", montant: `${euro(f.resteACharge ?? t.totalTtc)} € TTC`, total: true },
    ],
    regleAnahExtra:
      " Marché hors MaPrimeRénov’ : pas de condition ANAH pour démarrer. Signature du présent contrat et acompte 30 % suffisent pour engager le chantier.",
    planning: postesTries.map((poste) => ({
      phase: `${poste.ordreContractuel}. ${poste.nom}`,
      duree: "selon lot",
      detail: poste.artisan || "Partenaires RGE / usine",
    })),
    signatureHtml: `<p>Je soussigné(e), <strong>${escapeHtml(identite)}</strong>, accepte le présent contrat n° <strong>${escapeHtml(numero)}</strong>
        d’un montant <strong>ferme et définitif</strong> de <strong>${euro(t.totalTtc)} € TTC</strong>
        (reste à charge client net <strong>${euro(f.resteACharge ?? t.totalTtc)} € TTC</strong>)
        et mandate <strong>ENERGIA-CONSEIL IA® en qualité de Contractant Général</strong> ${missionHtml}.</p>
        <p>Échéancier de paiement : <strong>30 % à la signature</strong> (${euro(f.acompte)} € TTC) /
        <strong>40 % intermédiaire</strong> (${euro(f.intermediaire)} € TTC) /
        <strong>30 % solde</strong> (${euro(f.solde)} € TTC), après validation Sylvain LEMBELEMBE.</p>
        <p>Mentions manuscrites obligatoires : « Lu et approuvé », « Bon pour accord ».</p>
        <p>Fait à ____________________________ , le ___ / ___ / 2026</p>
        <table class="sig-table">
          <tr>
            <td>Le client — ${escapeHtml(identite)}<div class="sig-line"></div></td>
            <td>ENERGIA-CONSEIL IA® — Sylvain LEMBELEMBE<div class="sig-line"></div></td>
          </tr>
        </table>`,
    contacts: CONTACTS_CONTRAT_MASTER,
    juliaBullets: [
      `la qualité d’ENERGIA-CONSEIL IA® de <strong>Contractant Général</strong> (prix forfaitaire ferme ${euro(t.totalTtc)} € TTC) ;`,
      `le caractère <strong>hors MaPrimeRénov’</strong> : reste à charge = ${euro(f.resteACharge ?? t.totalTtc)} € TTC ;`,
      `la TVA de <strong>${libelleTva}</strong> ;`,
      `la <strong>Clause Julia Protection Aides</strong> (plafond 2 000 €) ;`,
      `le régime <strong>30 % / 40 % / 30 %</strong> (${euro(f.acompte)} € / ${euro(f.intermediaire)} € / ${euro(f.solde)} € TTC).`,
    ],
    ordreTravauxCgv: ordreTravaux,
    echeancier: f,
    totauxPourCgv: t,
    inclureCommissionDamien,
    mentionsHtml: MENTIONS_STANDARD(p),
    footerClientHtml: `Contrat ${escapeHtml(numero)} — ${escapeHtml(identite)} — ${escapeHtml(adresse)} — ${dateTxt}`,
    cgvArticles: articlesCgvContractantGeneral({
      numero,
      dateTxt,
      totalTtc: t.totalTtc,
      acompte: f.acompte,
      intermediaire: f.intermediaire,
      solde: f.solde,
      artisans: artisansCgv,
      ordreTravaux,
    }),
  };
}

export function payloadContratBrunelMaconnerieOfficiel() {
  const c = CLIENT_BRUNEL_MACONNERIE;
  return payloadSecondOeuvreCg({
    titre: BRUNEL_MACONNERIE_CONTRAT_TITRE,
    numero: BRUNEL_MACONNERIE_CONTRAT_NUMERO,
    dateIso: BRUNEL_MACONNERIE_CONTRAT_DATE,
    reference: BRUNEL_MACONNERIE_REFERENCE,
    identite: c.nom,
    adresse: c.adresse,
    typeBien: c.typeBien,
    metaExtraHtml:
      "Avenant n°01 Gros Œuvre &amp; Dalle 80 m² — TVA 10 % · hors MaPrimeRénov’<br>Sous-traitance Hezen Bâtiment (source interne admin)<br>",
    mentionHorsMpr: MENTION_HORS_MPR_BRUNEL_MACONNERIE,
    equipeHtml: `Artisan maçonnerie : ${escapeHtml(HEZEN_SOUS_TRAITANCE.entreprise)} — Mustafa HEZEN. Pilotage : Sylvain LEMBELEMBE.`,
    titrePostes: "II. Détail des lots — Avenant Gros Œuvre &amp; Dalle 80 m²",
    introPostesHtml:
      "Ouverture IPN 260×230 · soutènement / fondations / mur banché · préparation et dalle béton 80 m² (City pompe). Ordre : fouilles &amp; soutènement → ouverture IPN → dalle &amp; réseaux. TVA 10 %.",
    postes: POSTES_BRUNEL_MACONNERIE_CONTRAT,
    totaux: TOTAUX_BRUNEL_MACONNERIE,
    financement: FINANCEMENT_BRUNEL_MACONNERIE,
    ordreTravaux:
      "Fouilles rocheuses et soutènement / fondations 5 ml → mur agglos banché → ouverture 260×230 et pose IPN → tranchées PVC WC → préparation et coulage dalle 80 m² (City pompe).",
    artisansCgv: "HEZEN BÂTIMENT — Mustafa HEZEN",
    missionHtml: "pour l’avenant gros œuvre et dalle 80 m² à Bussières",
    annexePhotosHtml: htmlAnnexeMaconnerieBrunel(),
  });
}

function htmlAnnexeGilbertas() {
  const rendus = RENDUS_3D_GILBERTAS.map(
    (rendu) => `
      <figure style="margin:0">
        <img src="${escapeHtml(rendu.src)}" alt="${escapeHtml(rendu.titre)}" style="width:100%;max-height:280px;object-fit:cover;border:2px solid #059669;border-radius:8px" />
        <figcaption><strong>${escapeHtml(rendu.titre)}</strong><br>${escapeHtml(rendu.badge)}</figcaption>
      </figure>`,
  ).join("");
  const lignes = ELECTROMENAGER_GILBERTAS.map(
    (item) => `<tr>
      <td>${escapeHtml(item.poste)}</td>
      <td>${escapeHtml(item.marque)}</td>
      <td>${escapeHtml(item.reference)}</td>
      <td>${escapeHtml(item.classe)}</td>
      <td>${escapeHtml(item.garantie)}<br><span class="muted">${escapeHtml(item.detail)}</span></td>
    </tr>`,
  ).join("");
  return `
    <section class="photo-annexe annexe-photos bloc">
      <h2>Annexe visuelle du projet</h2>
      <p>Rendus 3D de la cuisine clé en main : façades Macaron Porcelaine / 30, plan et crédence Chêne du Jura / D016, évier Luisigranit Full Black, électroménager verre noir mat.</p>
      <div class="grille-avant-apres" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${rendus}
      </div>
    </section>
    <section class="bloc">
      <h2>Annexe technique — pack de 7 électroménagers encastrés</h2>
      <p class="muted">Références, classes énergétiques et garanties lues sur les fiches techniques. Finition harmonisée Full Black et verre noir mat sur les faces visibles. EAN de contrôle indiqué au dossier.</p>
      <table>
        <thead>
          <tr><th>Appareil</th><th>Marque</th><th>Référence</th><th>Classe énergétique</th><th>Garantie &amp; caractéristiques</th></tr>
        </thead>
        <tbody>${lignes}</tbody>
      </table>
    </section>`;
}

function cgvClientGilbertas(articles) {
  const copie = (articles || []).slice();
  const ttc = euro(TOTAUX_GILBERTAS.totalTtc);
  const acompte = euro(FINANCEMENT_GILBERTAS.acompte);
  const intermediaire = euro(FINANCEMENT_GILBERTAS.intermediaire);
  const solde = euro(FINANCEMENT_GILBERTAS.solde);
  copie[0] = `<strong>Article 1 — Qualité de Contractant Général.</strong> ENERGIA-CONSEIL IA® agit en qualité exclusive de <strong>Contractant Général</strong> et d'interlocuteur unique du maître d'ouvrage. Direction et portage : Sylvain LEMBELEMBE. Garantie décennale Calipso Assurances n° LUNPIB2604975. Direction artistique et coordination terrain : Catarina MARTINS (suivi sur site et harmonie des teintes). La livraison et la pose sont exécutées par les équipes de poseurs qualifiés d'ENERGIA CONSEIL IA®. Montant ferme et définitif : ${ttc} € TTC.`;
  const clausesPlanning = CLAUSES_PLANNING_GILBERTAS.join(" ");
  const acompteHt = euro(FACTURE_ACOMPTE_GILBERTAS.ht);
  const acompteTva = euro(FACTURE_ACOMPTE_GILBERTAS.tva);
  copie[1] = `<strong>Article 2 — Planning d'exécution.</strong> ${clausesPlanning} ${ORDRE_EXECUTION_GILBERTAS}`;
  copie[2] = `<strong>Article 3 — Modalités de paiement 30 / 40 / 30.</strong> Total du marché : ${euro(TOTAUX_GILBERTAS.totalHt)} € HT | TVA 10 % : ${euro(TOTAUX_GILBERTAS.totalTva)} € | Total : ${ttc} € TTC. Acompte de 30 % à la commande (facture ${FACTURE_ACOMPTE_GILBERTAS.numero}, blocage usine et plannings) : ${acompteHt} € HT | TVA 10 % : ${acompteTva} € | Net à payer : ${acompte} € TTC. Échéance de 40 % au démarrage effectif des travaux : ${intermediaire} € TTC. Solde de 30 % à la réception après procès-verbal sans réserve : ${solde} € TTC. RIB Qonto — Titulaire : ${RIB_REGLEMENT_GILBERTAS.titulaire} — IBAN ${RIB_REGLEMENT_GILBERTAS.iban} — BIC ${RIB_REGLEMENT_GILBERTAS.bic}. Libellé : « ${RIB_REGLEMENT_GILBERTAS.libelle} ». Décennale Calipso Assurances n° LUNPIB2604975. Marque déposée INPI n° 5213845.`;
  copie[3] = `<strong>Article 4 — Hors MaPrimeRénov'.</strong> Le présent marché est hors parcours MaPrimeRénov'. Aucune aide ANAH n'est déduite. Le démarrage n'est pas conditionné à un accord ANAH. L'encaissement de l'acompte de 30 % déclenche la visite technique préalable et le délai ferme de fabrication usine de 5 semaines. Les travaux préparatoires sont exécutés pendant ce délai.`;
  const indexGaranties = copie.findIndex((article) => String(article).includes("Malfaçons et garanties"));
  if (indexGaranties >= 0) {
    copie[indexGaranties] = `<strong>16. Malfaçons et garanties.</strong> Mise en demeure sous 7 jours. Garanties légales : décennale (Calipso Assurances n° LUNPIB2604975), biennale et parfait achèvement, portées au titre du marché par ENERGIA-CONSEIL IA®, interlocuteur unique, et les intervenants qu'elle mandate sous sa maîtrise. ENERGIA-CONSEIL IA® coordonne l'ensemble, pilote le chantier et s'engage sur le délai de 7 jours ouvrés et sur le montant total TTC convenu.`;
  }
  return copie;
}

export function payloadContratGilbertasOfficiel() {
  const c = CLIENT_GILBERTAS;
  const base = payloadSecondOeuvreCg({
    titre: GILBERTAS_CONTRAT_TITRE,
    numero: GILBERTAS_CONTRAT_NUMERO,
    dateIso: GILBERTAS_CONTRAT_DATE,
    reference: GILBERTAS_REFERENCE,
    identite: `${c.civilite} ${c.nom}`,
    adresse: c.villeAffichee,
    typeBien: `${c.typeBien} de ${c.surfaceTotale} m² — tél. ${c.telephoneAffiche}`,
    metaExtraHtml: "Second œuvre &amp; cuisine clé en main — TVA rénovation 10 % · hors MaPrimeRénov’<br>",
    mentionHorsMpr: MENTION_HORS_MPR_GILBERTAS,
    equipeHtml: `Direction et portage : ${escapeHtml(EQUIPE_GILBERTAS.directionContractantGeneral)}. ${escapeHtml(EQUIPE_GILBERTAS.designAgencement)}.`,
    titrePostes: "II. Détail des 4 lots contractuels",
    introPostesHtml:
      "TVA rénovation 10 %. Cuisine Macaron Porcelaine / 30, plan Chêne du Jura / D016, poignées fines 381, pack électroménager Full Black, sol LVT Chêne Naturel et peinture coordonnée par Catarina MARTINS. Visite technique préalable dès l'acompte, fabrication usine 5 semaines (préparation du chantier pendant ce délai), puis pose cuisine en 7 jours ouvrés. Interlocuteur unique : ENERGIA CONSEIL IA® — Sylvain LEMBELEMBE.",
    postes: POSTES_GILBERTAS_CONTRAT,
    totaux: TOTAUX_GILBERTAS,
    financement: FINANCEMENT_GILBERTAS,
    echeancierLabels: {
      acompteLabel: "Acompte de 30 % à la commande",
      acompteMuted: "Blocage usine et plannings",
      intermediaireLabel: "Échéance de 40 % au démarrage effectif des travaux",
      intermediaireMuted: "Ouverture du chantier dans la fenêtre de mise à disposition",
      soldeLabel: "Solde de 30 % à la livraison finale",
      soldeMuted: "Après procès-verbal de réception sans réserve",
    },
    ordreTravaux: ORDRE_EXECUTION_GILBERTAS,
    artisansCgv: "équipes de poseurs qualifiés ENERGIA CONSEIL IA®",
    missionHtml: `pour ${INTITULE_MARCHE_GILBERTAS} à Clermont-Ferrand`,
    annexePhotosHtml: htmlAnnexeGilbertas(),
    inclureCommissionDamien: false,
  });
  return {
    ...base,
    clientHtml: `<strong>${escapeHtml(c.civilite)} ${escapeHtml(c.nom)}</strong><br>Téléphone : ${escapeHtml(c.telephoneAffiche)}<br>Lieu d'exécution : ${escapeHtml(LIEU_EXECUTION_GILBERTAS)}<br>Intitulé : ${escapeHtml(INTITULE_MARCHE_GILBERTAS)}`,
    lieuExecution: escapeHtml(LIEU_EXECUTION_GILBERTAS),
    modalitesReglementHtml: `<div class="disclaimer">
        <strong>Modalités de règlement — Facture d'acompte n° ${escapeHtml(FACTURE_ACOMPTE_GILBERTAS.numero)}.</strong>
        Total du marché : ${euro(TOTAUX_GILBERTAS.totalHt)} € HT | TVA 10 % (${euro(TOTAUX_GILBERTAS.totalTva)} €) | Total TTC : ${euro(TOTAUX_GILBERTAS.totalTtc)} € TTC.
        Acompte 30 % à la commande : ${euro(FACTURE_ACOMPTE_GILBERTAS.ht)} € HT | TVA 10 % : ${euro(FACTURE_ACOMPTE_GILBERTAS.tva)} € | Net à payer : ${euro(FACTURE_ACOMPTE_GILBERTAS.ttc)} € TTC.
        Échéance 40 % au démarrage des travaux : ${euro(FINANCEMENT_GILBERTAS.intermediaire)} € TTC.
        Solde 30 % à la réception après PV sans réserve : ${euro(FINANCEMENT_GILBERTAS.solde)} € TTC.
        <br>RIB Qonto vérifié — Titulaire : ${escapeHtml(RIB_REGLEMENT_GILBERTAS.titulaire)} — IBAN ${escapeHtml(RIB_REGLEMENT_GILBERTAS.iban)} — BIC ${escapeHtml(RIB_REGLEMENT_GILBERTAS.bic)}.
        Libellé : « ${escapeHtml(RIB_REGLEMENT_GILBERTAS.libelle)} ».
        <br>Mentions légales : Décennale Calipso Assurances n° LUNPIB2604975 — Marque déposée INPI n° 5213845.
      </div>`,
    conditionsParticulieresHtml: CLAUSES_PLANNING_GILBERTAS.map(
      (clause) => `<p>${escapeHtml(clause)}</p>`,
    ).join("\n"),
    engagementArtisansHtml:
      "La livraison, la pose et les raccordements sont exécutés par les équipes de poseurs qualifiés d'ENERGIA CONSEIL IA®, interlocuteur unique du maître d'ouvrage.",
    titrePlanning: "V. Planning commando — visite technique, usine 5 semaines et pose",
    planning: PLANNING_COMMANDO_GILBERTAS,
    contacts: CONTACTS_CLIENT_GILBERTAS,
    regleAnahHtml: `<p><strong>Hors MaPrimeRénov'.</strong> Aucune aide ANAH n'est déduite. Le démarrage n'est pas conditionné à un accord ANAH : l'encaissement de l'acompte de 30 % déclenche la visite technique préalable et le délai ferme de fabrication usine de 5 semaines. Les travaux préparatoires (supports, sol LVT, peinture, électricité et fibre) sont exécutés pendant ce délai, afin que le chantier soit prêt pour la pose cuisine.</p>`,
    cgvArticles: cgvClientGilbertas(base.cgvArticles),
    inclureCommissionDamien: false,
    signatureHtml: base.signatureHtml
      .replace("30 % à la signature", "30 % à la commande")
      .replace("40 % intermédiaire", "40 % au démarrage effectif")
      .replace("30 % solde", "30 % à la livraison finale"),
  };
}

export function payloadContratMassardierOfficiel() {
  const c = CLIENT_MASSARDIER;
  return payloadSecondOeuvreCg({
    titre: MASSARDIER_CONTRAT_TITRE,
    numero: MASSARDIER_CONTRAT_NUMERO,
    dateIso: MASSARDIER_CONTRAT_DATE,
    reference: MASSARDIER_REFERENCE,
    identite: `Monsieur ${c.nom}`,
    adresse: c.adresse,
    typeBien: "Cuisine italienne sur-mesure Direct Usine (Catégorie 31) — budget ferme 20 000 € TTC",
    metaExtraHtml: "Cuisine & agencement — TVA 10 % · hors MaPrimeRénov’<br>",
    mentionHorsMpr: MENTION_HORS_MPR_MASSARDIER,
    equipeHtml: `Apporteur : ${escapeHtml(EQUIPE_MASSARDIER.commercialApporteur)}.`,
    titrePostes: "II. Détail du marché — Cuisine italienne Direct Usine",
    introPostesHtml:
      "Forfait ferme cuisine sur-mesure (îlot, plan céramique/Dekton, électroménager Premium). TVA 10 %.",
    postes: POSTES_MASSARDIER_CONTRAT,
    totaux: TOTAUX_MASSARDIER,
    financement: FINANCEMENT_MASSARDIER,
    ordreTravaux: "Métré → commande usine Italie → livraison → pose & raccordements → réception.",
    artisansCgv: "filières Veneta Cucine / Arredo3 — Damien / Catarina",
    missionHtml: "pour la cuisine italienne sur-mesure Direct Usine",
    inclureCommissionDamien: true,
  });
}

/**
 * Devis / marché CG — Joël GESNOUIN stockage batterie AC (TVA 20 %, 3 postes).
 */
export function payloadContratGesnouinOfficiel() {
  const c = CLIENT_GESNOUIN;
  return payloadSecondOeuvreCg({
    titre: GESNOUIN_CONTRAT_TITRE,
    numero: GESNOUIN_CONTRAT_NUMERO,
    dateIso: GESNOUIN_CONTRAT_DATE,
    reference: GESNOUIN_REFERENCE,
    identite: c.libelleSignature,
    adresse: c.adresse,
    typeBien: `${TITRE_GESNOUIN} — ${c.telephone} · ${c.email}`,
    metaExtraHtml:
      "Électricité & Stockage Énergétique — TVA 20 % · matériel Zendure fourni par le client · hors MaPrimeRénov’<br>",
    mentionHorsMpr: `${MENTION_HORS_MPR_GESNOUIN}<br><br><strong>${CLAUSE_EDF_OA_GESNOUIN}</strong>`,
    equipeHtml: `Direction : ${escapeHtml(EQUIPE_GESNOUIN.direction)}. Commercial : ${escapeHtml(EQUIPE_GESNOUIN.commercial)}. Source : demande entrante site web / email direct.`,
    titrePostes: "II. Détail des 3 postes — Devis électrique stockage AC",
    introPostesHtml:
      "Marché ferme TVA 20 % : visite & raccordement NF C 15-100, protections modulaires, tore Linky & mise en service. Total 890 € HT / 1 068 € TTC.",
    postes: POSTES_GESNOUIN_CONTRAT,
    totaux: TOTAUX_GESNOUIN,
    financement: FINANCEMENT_GESNOUIN,
    tauxTvaPct: 0.2,
    echeancierLabels: {
      acompteLabel: "Acompte 30 % à la signature",
      acompteMuted: "Engagement client — 320,40 € TTC",
      intermediaireLabel: "Jalon intermédiaire",
      intermediaireMuted: "Non applicable (échéancier 30 % / 70 %)",
      soldeLabel: "Solde 70 % à la mise en service",
      soldeMuted:
        "Après tests, PV de mise en service et validation de Sylvain LEMBELEMBE (Contractant Général — ENERGIA-CONSEIL IA®)",
    },
    ordreTravaux:
      "Visite conformité → fixation Zendure & batteries → protections tableau → tore Linky → mise en service connectée.",
    artisansCgv: "électricien RGE local secteur Caen (14) — Direct ENERGIA",
    missionHtml: "pour le raccordement stockage batterie Zendure SolarFlow 2400 AC — Giberville (14)",
  });
}

/**
 * Devis CG — Mme Kristell MASSON, remplacement chaudière gaz Toulon.
 * TVA 10 %. Hors MaPrimeRénov’. Échéancier 30 % / 70 %. Validité 15 jours.
 */
export function payloadContratMassonOfficiel() {
  const c = CLIENT_MASSON;
  const f = FINANCEMENT_MASSON;
  const t = TOTAUX_MASSON;
  const annexePhotosHtml = `
    <section class="photo-annexe annexe-photos bloc annexe-masson">
      <h2>Annexe photographique — état des lieux avant travaux</h2>
      <p>Relevé du 22 octobre 2026, appartement Orion 5, 176 rue Bossuet à Toulon. Ancienne chaudière ELM Leblanc, plaque GLM23-1H. Gaine horizontale d’environ 2,5 m au-dessus des meubles hauts, jusqu’au conduit dans l’angle gauche.</p>
      <style>
        .annexe-masson .grille-photos-masson { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 10px 0 14px; }
        .annexe-masson figure { margin: 0; break-inside: avoid; page-break-inside: avoid; }
        .annexe-masson figure img { width: 100%; height: auto; max-height: 320px; object-fit: cover; border: 2px solid #0f766e; border-radius: 8px; background: #f1f5f9; display: block; }
        .annexe-masson figcaption { font-size: 8pt; color: #334155; margin-top: 6px; font-weight: 600; }
        @media print { .annexe-masson figure img { max-height: 260px; print-color-adjust: exact; } }
      </style>
      <div class="grille-photos-masson">
        ${PHOTOS_TERRAIN_MASSON.map(
          (photo, index) => `
        <figure>
          <img src="${photo.srcContrat || photo.src}" alt="${escapeHtml(photo.label)}" />
          <figcaption>Photo ${index + 1} — ${escapeHtml(photo.titre)}</figcaption>
        </figure>`,
        ).join("")}
      </div>
    </section>`;
  const base = payloadSecondOeuvreCg({
    titre: MASSON_DEVIS_TITRE,
    numero: MASSON_DEVIS_NUMERO,
    dateIso: MASSON_DEVIS_DATE,
    reference: MASSON_REFERENCE,
    identite: c.libelleSignature,
    adresse: c.adresse,
    typeBien: `${TITRE_MASSON} — ${c.telephone} · ${c.email}`,
    metaExtraHtml:
      "Chaudière gaz murale — TVA rénovation 10 % · hors MaPrimeRénov’ et hors CEE<br>" +
      `Validité ${MASSON_VALIDITE_JOURS} jours — jusqu’au 6 novembre 2026<br>` +
      `Coordination travaux : ${escapeHtml(EQUIPE_MASSON.coordination)} — ${escapeHtml(EQUIPE_MASSON.coordinationTelephone)}<br>`,
    mentionHorsMpr: MENTION_HORS_MPR_MASSON,
    equipeHtml: `Direction : ${escapeHtml(EQUIPE_MASSON.direction)}. Commercial : ${escapeHtml(EQUIPE_MASSON.commercial)} (06 72 68 09 68). Coordination travaux : ${escapeHtml(EQUIPE_MASSON.entiteTravaux)} — ${escapeHtml(EQUIPE_MASSON.coordinationTelephone)}.`,
    titrePostes: "II. Détail des 6 postes — remplacement chaudière gaz",
    introPostesHtml: `Marché ferme TVA 10 % : dépose ELM LEBLANC GLM 23 (plaque GLM23-1H), pose Saunier Duval Themafast Classic V 18/24, pack fumisterie copropriété (conduit D125, bouche BAZ, sécurité DSC, condensats), désembouage, filtre à boue magnétique, thermostat, certificat CC2 et forfait logistique Mâcon → Toulon. Total ${euro(t.totalHt)} € HT / ${euro(t.totalTtc)} € TTC.`,
    postes: POSTES_MASSON_DEVIS,
    totaux: t,
    financement: f,
    tauxTvaPct: 0.1,
    inclureCommissionDamien: false,
    annexePhotosHtml,
    echeancierLabels: {
      acompteLabel: "Acompte 30 % à la commande",
      acompteMuted: `${euro(f.acompte)} € TTC — déclenche l’approvisionnement et la date d’intervention`,
      intermediaireLabel: "Jalon intermédiaire",
      intermediaireMuted: "Non applicable — échéancier 30 % / 70 %",
      soldeLabel: "Solde 70 % à la réception",
      soldeMuted: `${euro(f.solde)} € TTC — à la mise en service et à la remise du certificat CC2 Qualigaz`,
    },
    ordreTravaux:
      "Dépose et recyclage de la chaudière existante → fourniture et pose de la chaudière gaz → raccordement fumisterie D125 → désembouage et filtre à boue → thermostat et certificat CC2 → mise en service.",
    artisansCgv: EQUIPE_MASSON.entiteTravaux,
    missionHtml: "pour le remplacement de la chaudière gaz murale et le désembouage du réseau à Toulon (83000)",
  });
  const cgv = articlesCgvContractantGeneral({
    numero: MASSON_DEVIS_NUMERO,
    dateTxt: dateLongue(MASSON_DEVIS_DATE),
    totalTtc: t.totalTtc,
    acompte: f.acompte,
    intermediaire: 0,
    solde: f.solde,
    artisans: EQUIPE_MASSON.entiteTravaux,
    ordreTravaux: base.ordreTravauxCgv,
  });
  cgv[0] =
    `<strong>Article 1 — Qualité de Contractant Général.</strong> ENERGIA-CONSEIL IA® agit en qualité de <strong>Contractant Général</strong> et garantit la coordination du marché ainsi que le montant total de ${euro(t.totalTtc)} € TTC. La coordination travaux est assurée par Mohamed BENAOUDA (BMI), qui intervient en sous-traitance.`;
  cgv[2] =
    `<strong>Article 3 — Modalités de paiement 30 / 70.</strong> Acompte de 30 % à la commande : ${euro(f.acompte)} € TTC. Il déclenche l’approvisionnement et la date d’intervention. Solde de 70 % à la réception : ${euro(f.solde)} € TTC, à la mise en service et à la remise du certificat de conformité gaz modèle 2 (CC2 Qualigaz). Il n’y a pas de jalon intermédiaire de 40 %. Total : ${euro(t.totalTtc)} € TTC. Le solde est dû après validation de Sylvain LEMBELEMBE (Contractant Général — ENERGIA-CONSEIL IA®).`;
  cgv[3] =
    "<strong>Article 4 — Hors MaPrimeRénov’.</strong> Ce marché ne porte aucune aide MaPrimeRénov’ ni CEE. Le remplacement d’une chaudière gaz n’ouvre pas le parcours accompagné ANAH sur le présent devis. Le démarrage est conditionné à l’acompte de 30 %, pas à un accord ANAH. Signer un autre devis d’aides avant accord écrit ANAH resterait interdit pour tout parcours MaPrimeRénov’ distinct.";
  cgv[17] =
    `<strong>Article 18 — Validité.</strong> ${MENTION_VALIDITE_MASSON} Date limite : ${dateLongue(MASSON_DATE_VALIDITE)}.`;
  return {
    ...base,
    clientHtml: `<strong>${escapeHtml(c.libelleSignature)}</strong><br>${escapeHtml(c.adresseRue)}<br>${escapeHtml(c.codePostal)} ${escapeHtml(c.ville)}<br>Tél. ${escapeHtml(c.telephone)} · ${escapeHtml(c.email)}<br><span class="muted">${escapeHtml(TITRE_MASSON)} — appartement</span>`,
    regleAnahExtra:
      " Marché hors MaPrimeRénov’ et hors CEE. L’acompte de 30 % déclenche l’approvisionnement. Aucune aide n’est déduite du reste à charge.",
    recapLignes: [
      { label: "Montant Total HT", montant: `${euro(t.totalHt)} € HT` },
      { label: "TVA rénovation (10 %)", muted: "Logement achevé depuis plus de 2 ans", montant: `${euro(t.totalTva)} €` },
      { label: "Montant Total TTC", montant: `${euro(t.totalTtc)} € TTC`, total: true },
      {
        label: "Acompte 30 % à la commande",
        muted: "Déclenche l’approvisionnement et la date d’intervention",
        montant: `${euro(f.acompte)} € TTC`,
      },
      {
        label: "Solde 70 % à la réception",
        muted: "Mise en service et remise du certificat CC2",
        montant: `${euro(f.solde)} € TTC`,
      },
      { label: "Total échéancier 30 % / 70 %", montant: `${euro(t.totalTtc)} € TTC`, total: true },
    ],
    titreAides: "IV. Aides & reste à charge (hors MaPrimeRénov’)",
    aidesLignes: [
      { label: "MaPrimeRénov’", montant: "0,00 € (non concerné)" },
      { label: "CEE", montant: "0,00 € (non déduit)" },
      { label: "Total aides estimées", montant: "0,00 €", total: true },
      { label: "Reste à charge", montant: `${euro(t.totalTtc)} € TTC`, total: true },
    ],
    signatureHtml: `<p>Je soussigné(e), <strong>${escapeHtml(c.libelleSignature)}</strong>, accepte le présent devis n° <strong>${escapeHtml(MASSON_DEVIS_NUMERO)}</strong>
        d’un montant ferme de <strong>${euro(t.totalTtc)} € TTC</strong>
        et mandate <strong>ENERGIA-CONSEIL IA®</strong> pour la coordination du remplacement de chaudière gaz à Toulon.</p>
        <p>${escapeHtml(MENTION_ECHEANCIER_MASSON)}</p>
        <p>${escapeHtml(MENTION_VALIDITE_MASSON)} ${escapeHtml(MENTION_HORS_MPR_MASSON)}</p>
        <p>Mentions manuscrites : « Lu et approuvé », « Bon pour accord ».</p>
        <p>Fait à ____________________________ , le ___ / ___ / 2026</p>
        <table class="sig-table">
          <tr>
            <td>La cliente — ${escapeHtml(c.libelleSignature)}<div class="sig-line"></div></td>
            <td>ENERGIA-CONSEIL IA® — Sylvain LEMBELEMBE<div class="sig-line"></div></td>
          </tr>
        </table>`,
    contacts: [
      {
        role: "AMO / Contractant Général",
        nom: "Sylvain LEMBELEMBE",
        detail: "ENERGIA-CONSEIL IA® — 06 10 59 68 98 — contact@energia-conseil-ia.com",
      },
      {
        role: "Commercial",
        nom: "DAMIEN",
        detail: "06 72 68 09 68 — damien.srdconseil@gmail.com",
      },
      {
        role: "Coordination travaux",
        nom: "Mohamed BENAOUDA",
        detail: `${EQUIPE_MASSON.entiteTravaux} — ${EQUIPE_MASSON.coordinationTelephone}`,
      },
      {
        role: "Courtier financement",
        nom: "FABIEN — VIVONS COURTIER",
        detail: "06 71 19 96 45 — Éco-PTZ et prêts travaux",
      },
      {
        role: "Juriste",
        nom: "Julia",
        detail: "Avis juridique — Clause Julia Protection Aides (plafond 2 000 €) — Mars 2026",
      },
      {
        role: "MAR",
        nom: "Antoine BARATIER — Cabinet C2ET",
        detail: "Mon Accompagnateur Rénov’ agréé Anah — coordination ENERGIA. Non requis sur ce devis hors parcours.",
      },
    ],
    juliaBullets: [
      `le montant ferme de <strong>${euro(t.totalTtc)} € TTC</strong> (TVA rénovation 10 %, logement achevé depuis plus de 2 ans) ;`,
      `le caractère <strong>hors MaPrimeRénov’ et hors CEE</strong> : reste à charge = ${euro(t.totalTtc)} € TTC ;`,
      `l’échéancier <strong>30 % / 70 %</strong> (${euro(f.acompte)} € à la commande / ${euro(f.solde)} € à la réception), sans jalon de 40 % ;`,
      `la <strong>validité de ${MASSON_VALIDITE_JOURS} jours</strong>, jusqu’au 6 novembre 2026 ;`,
      "la <strong>Clause Julia Protection Aides</strong> (plafond 2 000 €) : 0 € d’aides estimées sur ce devis ;",
      "le certificat de conformité gaz <strong>CC2 Qualigaz</strong>, remis avec le solde.",
    ],
    cgvArticles: cgv,
    footerClientHtml: `Devis ${escapeHtml(MASSON_DEVIS_NUMERO)} — ${escapeHtml(c.libelleSignature)} — ${escapeHtml(c.adresse)} — ${dateLongue(MASSON_DEVIS_DATE)} — validité jusqu’au ${dateLongue(MASSON_DATE_VALIDITE)}`,
  };
}

/**
 * Contrat CG — Madame Marie-France COUTY, main courante maintien à domicile (TVA 10 %).
 * Hors MaPrimeRénov’. Crédit d’impôt autonomie 25 % indicatif.
 * Commission et marge internes absentes du document client. Échéancier 30 % / 70 %.
 */
export function payloadContratCoutyEscalierOfficiel() {
  const c = CLIENT_COUTY;
  const annexePhotosHtml = `
    <section class="photo-annexe annexe-photos bloc annexe-couty-escalier">
      <h2>Annexe Photographique — Repérage technique &amp; état des lieux avant travaux</h2>
      <p>Repérage du 13 octobre 2026. Mise en évidence du <strong>virage quart-tournant nu</strong> (aucune main courante) et de la <strong>zone d’implantation</strong> : mur de la volée droite, contournement de l’interrupteur bas, retour au palier.</p>
      <style>
        .annexe-couty-escalier .grille-photos-couty {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 10px 0 14px;
        }
        .annexe-couty-escalier figure {
          margin: 0; break-inside: avoid; page-break-inside: avoid;
        }
        .annexe-couty-escalier figure img {
          width: 100%; height: auto; max-height: 320px; object-fit: cover;
          border: 2px solid #059669; border-radius: 8px; background: #f1f5f9;
          display: block;
        }
        .annexe-couty-escalier figcaption {
          font-size: 8pt; color: #334155; margin-top: 6px; font-weight: 600;
        }
        @media print {
          .annexe-couty-escalier figure img { max-height: 260px; print-color-adjust: exact; }
        }
      </style>
      <div class="grille-photos-couty">
        ${PHOTOS_TERRAIN_COUTY.map(
          (photo, index) => `
        <figure>
          <img src="${photo.srcContrat || photo.src}" alt="${escapeHtml(photo.label)}" />
          <figcaption>Photo ${index + 1} — ${escapeHtml(photo.titre)} — ${escapeHtml(photo.badge)}</figcaption>
        </figure>`,
        ).join("")}
      </div>
      <p class="mentions-legales">Photographies de repérage avant travaux. Photo 3 : virage quart-tournant nu, zone du coude articulé. Photos 1 et 4 : zone d’implantation sur le mur nu et retour d’extrémité au palier bas. Linéaire retenu : 4,80 ml.</p>
    </section>`;
  const base = payloadSecondOeuvreCg({
    titre: COUTY_ESCALIER_DEVIS_TITRE,
    numero: COUTY_ESCALIER_CONTRAT_NUMERO,
    dateIso: COUTY_ESCALIER_DEVIS_DATE,
    reference: COUTY_ESCALIER_CONTRAT_NUMERO,
    identite: c.libelleSignature,
    adresse: c.adresse,
    typeBien: `${TITRE_COUTY_ESCALIER} — ${c.telephone} · ${c.email}`,
    metaExtraHtml:
      "Second œuvre — maintien à domicile — TVA rénovation 10 % · hors MaPrimeRénov’ et hors CEE<br>Direction &amp; Portage Contractant Général : ENERGIA CONSEIL IA® — Sylvain LEMBELEMBE — " +
      escapeHtml(ASSURANCE_DECENNALE_COUTY) +
      "<br>",
    mentionHorsMpr: MENTION_COUTY_AIDES,
    equipeHtml: `Direction &amp; Portage Contractant Général : ENERGIA CONSEIL IA® — ${escapeHtml(EQUIPE_COUTY.direction)} (06 10 59 68 98 — contact@energia-conseil-ia.com). ${escapeHtml(ASSURANCE_DECENNALE_COUTY)}.`,
    titrePostes: "II. Détail des prestations contractuelles — lots second œuvre",
    introPostesHtml:
      "Marché forfaitaire ferme. Les lots 1 à 3 sont inclus dans le montant global de 1 350,00 € HT / 1 485,00 € TTC (TVA rénovation 10 %). Chêne massif verni Ø 42 mm, linéaire 4,80 ml, volée droite et quart-tournant balancé bas, mur nu sans rampe existante.",
    postes: POSTES_COUTY_CONTRAT,
    totaux: TOTAUX_COUTY,
    financement: FINANCEMENT_COUTY,
    tauxTvaPct: 0.1,
    inclureCommissionDamien: false,
    annexePhotosHtml,
    ordreTravaux:
      "Relevé du linéaire et du quart-tournant → scellement de sécurité des 6 platines murales → pose de la main courante continue Ø 42 mm et du coude de liaison articulé sur-mesure → retours d’extrémités arrondis anti-accrochage.",
    artisansCgv:
      "sous-traitance menuiserie — Direction et Portage Contractant Général ENERGIA CONSEIL IA® — Calipso Assurances n° LUNPIB2604975",
    missionHtml: "pour la sécurisation de l’escalier et la main courante de maintien à domicile à Mably (42300)",
  });
  return {
    ...base,
    clientHtml: `<strong>${escapeHtml(c.libelleSignature)}</strong><br>Tél. ${escapeHtml(c.telephone)}<br>${escapeHtml(c.email)}<br><span class="muted">Intitulé : ${escapeHtml(TITRE_COUTY_ESCALIER)}</span>`,
    contacts: [
      {
        role: "Direction & Portage Contractant Général",
        nom: "Sylvain LEMBELEMBE",
        detail:
          "ENERGIA-CONSEIL IA® — 06 10 59 68 98 — contact@energia-conseil-ia.com — " +
          ASSURANCE_DECENNALE_COUTY,
      },
      {
        role: "Courtier financement",
        nom: "FABIEN — VIVONS COURTIER",
        detail: "06 71 19 96 45 — Éco-PTZ et prêts travaux",
      },
      {
        role: "Juriste",
        nom: "Julia",
        detail: "Avis juridique — Clause Julia Protection Aides (plafond 2 000 €)",
      },
      {
        role: "MAR",
        nom: "Antoine BARATIER — Cabinet C2ET",
        detail: "Mon Accompagnateur Rénov’ agréé Anah — coordination ENERGIA",
      },
    ],
    titreAides: "IV. Crédit d’impôt autonomie & reste à charge (estimation à titre indicatif)",
    aidesLignes: [
      { label: "MaPrimeRénov’ / CEE", montant: "0,00 € (non concernés)" },
      {
        label: "Crédit d’impôt équipement personnes âgées / autonomie / maintien à domicile 25 % (estimation à titre indicatif)",
        montant: "371,25 €",
      },
      { label: "Total avantage fiscal estimé", montant: "371,25 €", total: true },
      {
        label: "Reste à charge net estimé après crédit d’impôt",
        montant: "1 113,75 € TTC",
        total: true,
      },
    ],
    recapLignes: [
      { label: "Montant Total Travaux HT", montant: "1 350,00 € HT" },
      { label: "Montant TVA (10 %)", montant: "135,00 €" },
      { label: "MONTANT TOTAL DU MARCHÉ TTC", montant: "1 485,00 € TTC", total: true },
      {
        label: "Acompte 30 % à la commande",
        muted: "Engagement cliente — le crédit d’impôt est récupéré ensuite",
        montant: "445,50 € TTC",
      },
      {
        label: "Solde 70 % à la réception après PV sans réserve",
        muted: "Après procès-verbal de réception sans réserve et validation de Sylvain LEMBELEMBE",
        montant: "1 039,50 € TTC",
      },
      { label: "Total échéancier 30 % / 70 %", montant: "1 485,00 € TTC", total: true },
    ],
    cgvArticles: base.cgvArticles.map((article) =>
      String(article).includes("Article 3")
        ? `<strong>Article 3 — Modalités de paiement 30 / 70.</strong> Acompte de 30 % à la commande : 445,50 € TTC. Solde de 70 % à la réception : 1 039,50 € TTC, après procès-verbal de réception sans réserve et validation de Sylvain LEMBELEMBE (Contractant Général — ENERGIA-CONSEIL IA®). Total : 1 485,00 € TTC. Aucun règlement artisans hors circuit convenu sans accord de Sylvain.`
        : article,
    ),
    signatureHtml: `<p>Je soussignée, <strong>${escapeHtml(c.libelleSignature)}</strong>, accepte le présent contrat n° <strong>${escapeHtml(COUTY_ESCALIER_CONTRAT_NUMERO)}</strong>
        d’un montant <strong>ferme et définitif</strong> de <strong>1 485,00 € TTC</strong>
        (crédit d’impôt autonomie / maintien à domicile 25 % estimé <strong>371,25 €</strong> — reste à charge net estimé <strong>1 113,75 € TTC</strong>, à titre indicatif)
        et mandate <strong>ENERGIA-CONSEIL IA® en qualité de Contractant Général</strong> pour la sécurisation de l’escalier et la main courante de maintien à domicile au 23 Rue du Fort Troyon, 42300 Mably.</p>
        <p>Échéancier de paiement sur le marché TTC : <strong>acompte 30 % à la commande</strong> (445,50 € TTC) /
        <strong>solde 70 % à la réception après PV sans réserve</strong> (1 039,50 € TTC), après validation de Sylvain LEMBELEMBE.</p>
        <p>Aides financières 2026 (estimation à titre indicatif). Le crédit d’impôt est à valider selon la situation fiscale réelle. Montant définitif après déclaration fiscale. Le marché à régler reste 1 485,00 € TTC.</p>
        <p>Mentions manuscrites obligatoires : « Lu et approuvé », « Bon pour accord ».</p>
        <p>Fait à ____________________________ , le ___ / ___ / 2026</p>
        <table class="sig-table">
          <tr>
            <td>La cliente — ${escapeHtml(c.libelleSignature)}<div class="sig-line"></div></td>
            <td>ENERGIA-CONSEIL IA® — Sylvain LEMBELEMBE<div class="sig-line"></div></td>
          </tr>
        </table>`,
    regleAnahExtra:
      " Marché hors MaPrimeRénov’ : le crédit d’impôt autonomie n’est pas une aide ANAH. Aides financières 2026 (estimation à titre indicatif). Aides à valider selon la situation fiscale réelle de la cliente. Montants définitifs après déclaration fiscale. Le marché à régler reste 1 485,00 € TTC.",
    juliaBullets: [
      `la qualité d’ENERGIA-CONSEIL IA® de <strong>Contractant Général</strong> (prix forfaitaire ferme 1 485,00 € TTC, TVA 10 %, ${escapeHtml(ASSURANCE_DECENNALE_COUTY)}) ;`,
      `le caractère <strong>hors MaPrimeRénov’ et hors CEE</strong> ;`,
      `le crédit d’impôt équipement personnes âgées / autonomie / maintien à domicile de <strong>25 %</strong> (371,25 €), estimation à titre indicatif, reste à charge net estimé <strong>1 113,75 € TTC</strong> — à valider selon la situation fiscale réelle ;`,
      `la <strong>Clause Julia Protection Aides</strong> : responsabilité ENERGIA plafonnée à 2 000 € en cas d’écart &gt; 10 % imputable à une erreur prouvée d’ENERGIA ; 0 % si erreur cliente ou décision de l’administration fiscale ;`,
      `le régime <strong>30 % à la commande / 70 % à la réception</strong> (445,50 € TTC / 1 039,50 € TTC), le solde après procès-verbal sans réserve et validation de Sylvain LEMBELEMBE.`,
    ],
  };
}

/**
 * Devis CG — M. Mustapha FARISS, sous-sol PMR La Ricamarie (TVA 10 %).
 * MaPrimeAdapt' en attente de notification. Échéancier 30 % / 70 %.
 * Commission interne absente du document client.
 */
export function payloadContratFarissOfficiel() {
  const c = CLIENT_FARISS;
  const base = payloadSecondOeuvreCg({
    titre: FARISS_DEVIS_TITRE,
    numero: FARISS_DEVIS_NUMERO,
    dateIso: FARISS_DEVIS_DATE,
    reference: FARISS_DEVIS_NUMERO,
    identite: c.libelleSignature,
    adresse: c.adresse,
    typeBien: `${TITRE_FARISS} — ${c.telephone}`,
    metaExtraHtml:
      "Second œuvre — pièce de vie PMR — TVA rénovation 10 % · MaPrimeAdapt' (condition suspensive)<br>Titulaire du marché : ENERGIA CONSEIL IA® — Contractant Général — Sylvain LEMBELEMBE<br>Facturation en direct avec le client final<br>" +
      escapeHtml(ASSURANCE_DECENNALE_FARISS) +
      "<br>",
    mentionHorsMpr: MENTION_AIDES_FARISS,
    equipeHtml: `Direction &amp; Portage Contractant Général : ENERGIA CONSEIL IA® — ${escapeHtml(EQUIPE_FARISS.direction)} (06 10 59 68 98 — contact@energia-conseil-ia.com). Interlocuteur commercial : Damien RICHARD — 06 72 68 09 68. ${escapeHtml(ASSURANCE_DECENNALE_FARISS)}.`,
    titrePostes: "II. Détail des prestations — 6 postes second œuvre",
    introPostesHtml:
      "Marché ferme. TVA rénovation 10 % sur l'ensemble des postes. Total 9 500,00 € HT / 10 450,00 € TTC. Les réseaux d'eau et l'évacuation sont amenés en attente bouchonnée. La cabine de douche Kinedo et sa paroi 1,60 m restent hors du présent marché (poseur Aqua Habita).",
    postes: POSTES_FARISS_DEVIS.map((poste) => ({
      ...poste,
      quantite: poste.unite === "m²" ? String(poste.quantite).replace(".", ",") : poste.quantite,
    })),
    totaux: TOTAUX_FARISS,
    financement: FINANCEMENT_FARISS,
    tauxTvaPct: 0.1,
    inclureCommissionDamien: false,
    annexePhotosHtml: `
    <section class="photo-annexe annexe-photos bloc annexe-fariss">
      <h2>Galerie Photos &amp; Constat Technique Avant Travaux</h2>
      <p>Relevé du 20 octobre 2026 — sous-sol, 6 Rue Danielle Casanova, 42150 La Ricamarie. Fiche Aqua Habita / Kinedo et état des supports avant second œuvre.</p>
      <div class="grille-photos-fariss">
        ${PHOTOS_TERRAIN_FARISS.map(
          (photo, index) => `
        <figure>
          <img src="${photo.srcContrat || photo.src}" alt="${escapeHtml(photo.label)}" />
          <figcaption>Photo ${index + 1} — ${escapeHtml(photo.titre)}</figcaption>
        </figure>`,
        ).join("")}
      </div>
      <style>
        .annexe-fariss .grille-photos-fariss { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:10px 0 14px; }
        .annexe-fariss figure { margin:0; break-inside:avoid; page-break-inside:avoid; }
        .annexe-fariss figure img { width:100%; height:auto; max-height:280px; object-fit:cover; border:2px solid #059669; border-radius:8px; display:block; }
        .annexe-fariss figcaption { font-size:8pt; color:#334155; margin-top:6px; font-weight:600; }
      </style>
    </section>
    <section class="bloc">
      <h2>Clauses de verrouillage — MaPrimeAdapt' &amp; limite de prestation</h2>
      <div class="alert-red">${escapeHtml(CLAUSE_SUSPENSIVE_MAPRIMEADAPT_FARISS)}</div>
      <p>${escapeHtml(CLAUSE_LIMITE_PRESTATION_FARISS)}</p>
      <p><strong>${escapeHtml(CLAUSE_INGENIERIE_FARISS)}</strong></p>
      <p class="disclaimer"><strong>Aides financières 2026 (estimation à titre indicatif).</strong> ${escapeHtml(MENTION_AIDES_FARISS)}</p>
      <h2>Coordonnées bancaires — acompte 3 135,00 € TTC</h2>
      <p>
        Titulaire : ${escapeHtml(RIB_QONTO.titulaire)} — ${escapeHtml(RIB_QONTO.adresseTitulaire)}<br>
        Banque : ${escapeHtml(RIB_QONTO.banque)} — ${escapeHtml(RIB_QONTO.adresseBanque)}<br>
        <strong>IBAN : ${escapeHtml(RIB_QONTO.iban)}</strong><br>
        <strong>BIC : ${escapeHtml(RIB_QONTO.bic)}</strong><br>
        Libellé : acompte ${escapeHtml(FARISS_DEVIS_NUMERO)} — ${escapeHtml(c.libelleSignature)} — 3 135,00 € TTC
      </p>
    </section>`,
    ordreTravaux:
      "Démolition et curage du bac à laver → doublage thermique et hydrofuge des murs → faux-plafond hydrofuge → préparation de sol et revêtement étanche → reprise électrique IP65 → chauffage et ventilation. La cabine Kinedo est posée ensuite par Aqua Habita, hors du présent marché.",
    artisansCgv:
      "sous-traitance second œuvre — Direction et Portage Contractant Général ENERGIA CONSEIL IA® — cabine Kinedo hors marché (Aqua Habita) — Calipso Assurances n° LUNPIB2604975",
    missionHtml:
      "pour l'aménagement du sous-sol et la préparation de la pièce de vie PMR au 6 Rue Danielle Casanova, 42150 La Ricamarie",
  });
  return {
    ...base,
    clientHtml: `<strong>${escapeHtml(c.libelleSignature)}</strong><br>Tél. ${escapeHtml(c.telephone)}<br>${escapeHtml(c.adresse)}<br><span class="muted">${escapeHtml(TITRE_FARISS)}</span><br><span class="muted">Facturation : ${escapeHtml(c.facturation)}</span>`,
    contacts: [
      {
        role: "AMO / Coordination",
        nom: "Sylvain LEMBELEMBE",
        detail: "ENERGIA-CONSEIL IA® — 06 10 59 68 98 — contact@energia-conseil-ia.com — " + ASSURANCE_DECENNALE_FARISS,
      },
      {
        role: "Interlocuteur commercial",
        nom: "Damien RICHARD",
        detail: "06 72 68 09 68 — damien.srdconseil@gmail.com — apporteur Aqua Habita (dr@aqua-habita.fr / ldp@aqua-habita.fr)",
      },
      {
        role: "Courtier financement",
        nom: "FABIEN — VIVONS COURTIER",
        detail: "06 71 19 96 45 — Éco-PTZ et prêts travaux",
      },
      {
        role: "Juriste",
        nom: "Julia",
        detail: "Avis juridique — Clause Julia Protection Aides (plafond 2 000 €) — Mars 2026",
      },
      {
        role: "MAR",
        nom: "Antoine BARATIER — Cabinet C2ET",
        detail: "Mon Accompagnateur Rénov' agréé Anah — coordination ENERGIA. MaPrimeAdapt' : instruction Anah.",
      },
    ],
    titreAides: "IV. MaPrimeAdapt' & reste à charge (estimation à titre indicatif)",
    aidesLignes: [
      { label: "MaPrimeRénov' Parcours / CEE", montant: "Non concernés par ce devis" },
      {
        label: "MaPrimeAdapt' — en attente de notification Anah (montant non chiffré)",
        montant: "À notifier",
      },
      { label: "MARCHÉ À RÉGLER TTC (tant que l'aide n'est pas notifiée)", montant: "10 450,00 € TTC", total: true },
    ],
    recapLignes: [
      { label: "Montant Total Travaux HT", montant: "9 500,00 € HT" },
      { label: "Montant TVA (10 %)", montant: "950,00 €" },
      { label: "MONTANT TOTAL DU MARCHÉ TTC", montant: "10 450,00 € TTC", total: true },
      {
        label: "Acompte 30 % à la commande",
        muted: "Sous condition suspensive de notification MaPrimeAdapt'",
        montant: "3 135,00 € TTC",
      },
      {
        label: "Solde 70 % en fin de chantier",
        muted: "Après réception et validation de Sylvain LEMBELEMBE",
        montant: "7 315,00 € TTC",
      },
      { label: "Total échéancier 30 % / 70 %", montant: "10 450,00 € TTC", total: true },
    ],
    cgvArticles: [
      ...base.cgvArticles.map((article) =>
        String(article).includes("Article 3")
          ? `<strong>Article 3 — Modalités de paiement 30 / 70.</strong> Acompte de 30 % à la commande : 3 135,00 € TTC. Solde de 70 % en fin de chantier : 7 315,00 € TTC, après réception et validation de Sylvain LEMBELEMBE (AMO ENERGIA-CONSEIL IA®). Total : 10 450,00 € TTC. RIB Qonto — Titulaire : ${RIB_QONTO.titulaire} — IBAN ${RIB_QONTO.iban} — BIC ${RIB_QONTO.bic}.`
          : article,
      ),
      `<strong>Article 19 — Limite de prestation.</strong> ${CLAUSE_LIMITE_PRESTATION_FARISS}`,
      `<strong>Article 20 — Condition suspensive MaPrimeAdapt'.</strong> ${CLAUSE_SUSPENSIVE_MAPRIMEADAPT_FARISS} Les travaux ne démarrent qu'après la notification officielle de l'Anah. Démarrer avant cet accord écrit expose au refus de l'aide.`,
      `<strong>Article 21 — Parade d'ingénierie.</strong> ${CLAUSE_INGENIERIE_FARISS}`,
    ],
    signatureHtml: `<p>Je soussigné, <strong>${escapeHtml(c.libelleSignature)}</strong>, accepte le présent devis n° <strong>${escapeHtml(FARISS_DEVIS_NUMERO)}</strong>
        d’un montant <strong>ferme</strong> de <strong>10 450,00 € TTC</strong> (9 500,00 € HT, TVA 10 %)
        et mandate <strong>ENERGIA-CONSEIL IA® en qualité de Contractant Général</strong> pour l'aménagement du sous-sol et la préparation de la pièce de vie PMR au 6 Rue Danielle Casanova, 42150 La Ricamarie.</p>
        <p><strong>${escapeHtml(CLAUSE_SUSPENSIVE_MAPRIMEADAPT_FARISS)}</strong></p>
        <p>${escapeHtml(CLAUSE_LIMITE_PRESTATION_FARISS)}</p>
        <p>${escapeHtml(CLAUSE_INGENIERIE_FARISS)}</p>
        <p>Échéancier : <strong>acompte 30 % à la commande</strong> (3 135,00 € TTC) /
        <strong>solde 70 % en fin de chantier</strong> (7 315,00 € TTC), après validation de Sylvain LEMBELEMBE.</p>
        <p>Aides financières 2026 (estimation à titre indicatif). Aides à valider selon la notification Anah. Montants définitifs après instruction ANAH. Clause Julia Protection Aides : plafond 2 000 €.</p>
        <p>Avis établi par Julia — Juriste ENERGIA-CONSEIL IA® — Mars 2026.</p>
        <p>Mentions manuscrites obligatoires : « Lu et approuvé », « Bon pour accord ».</p>
        <p>Fait à ____________________________ , le ___ / ___ / 2026</p>
        <table class="sig-table">
          <tr>
            <td>Le client — ${escapeHtml(c.libelleSignature)}<div class="sig-line"></div></td>
            <td>ENERGIA-CONSEIL IA® — Sylvain LEMBELEMBE<div class="sig-line"></div></td>
          </tr>
        </table>`,
    regleAnahExtra:
      " Condition suspensive : ne pas démarrer les travaux avant la notification officielle MaPrimeAdapt' de l'Anah. Aides financières 2026 (estimation à titre indicatif). Montants définitifs après instruction ANAH.",
    juliaBullets: [
      `la qualité d’ENERGIA-CONSEIL IA® de <strong>Contractant Général</strong> (prix ferme 10 450,00 € TTC, TVA 10 %, ${escapeHtml(ASSURANCE_DECENNALE_FARISS)}) ;`,
      `la <strong>condition suspensive MaPrimeAdapt'</strong> : devis subordonné à la notification officielle de l'Anah ;`,
      `la <strong>limite de prestation</strong> : réseaux EC/EF et évacuation en attente bouchonnée ; cabine Kinedo et paroi 1,60 m sous la responsabilité exclusive d'Aqua Habita ;`,
      `la <strong>Clause Julia Protection Aides</strong> : responsabilité ENERGIA plafonnée à 2 000 € en cas d’écart &gt; 10 % imputable à une erreur prouvée d’ENERGIA ; 0 % si erreur client ou décision ANAH ;`,
      `le forfait d'ingénierie de <strong>990,00 € TTC</strong> exigible en cas de désistement après obtention de MaPrimeAdapt' ;`,
      `le régime <strong>30 % à la commande / 70 % en fin de chantier</strong> (3 135,00 € TTC / 7 315,00 € TTC).`,
    ],
  };
}

/**
 * Contrat CG officiel — Centrale PV 100 kWc hangar Ardèche (TVA 20 %, 5 postes).
 */
export function payloadContratDamienPv100kwcOfficiel() {
  const c = CLIENT_DAMIEN_PV_100KWC;
  return payloadSecondOeuvreCg({
    titre: DAMIEN_PV_100KWC_CONTRAT_TITRE,
    numero: DAMIEN_PV_100KWC_CONTRAT_NUMERO,
    dateIso: DAMIEN_PV_100KWC_CONTRAT_DATE,
    reference: DAMIEN_PV_100KWC_REFERENCE,
    identite: c.raisonSociale,
    adresse: c.lieu,
    typeBien: `${TITRE_DAMIEN_PV_100KWC} — Apporteur : ${EQUIPE_DAMIEN_PV_100KWC.apporteur}`,
    metaExtraHtml: "Photovoltaïque & Énergie — TVA 20 % · hors MaPrimeRénov’ résidentiel<br>",
    mentionHorsMpr: MENTION_HORS_MPR_DAMIEN_PV_100KWC,
    equipeHtml: `Apporteur : ${escapeHtml(EQUIPE_DAMIEN_PV_100KWC.apporteur)}. Direction : ${escapeHtml(EQUIPE_DAMIEN_PV_100KWC.direction)}.`,
    titrePostes: "II. Détail des 5 postes contractuels — Centrale solaire 100 kWc",
    introPostesHtml:
      "Marché ferme TVA 20 % : ingénierie & Enedis, 200 modules TOPCon, onduleur 100 kW, structure ETN, pose QualiPV 500. Total 89 000 € HT / 106 800 € TTC.",
    postes: POSTES_DAMIEN_PV_100KWC_CONTRAT,
    totaux: TOTAUX_DAMIEN_PV_100KWC,
    financement: FINANCEMENT_DAMIEN_PV_100KWC,
    tauxTvaPct: 0.2,
    echeancierLabels: {
      acompteLabel: "Acompte initial 30 % à la signature",
      acompteMuted: "Engagement client et blocage des prix",
      intermediaireLabel: "Acompte intermédiaire 40 % à la livraison matériel sur site",
      intermediaireMuted: "Livraison modules, onduleur et structure sur chantier",
      soldeLabel: "Solde 30 % à la mise en service & raccordement Enedis",
      soldeMuted:
        "Après mise en service, tests de conformité QualiPV et validation de Sylvain LEMBELEMBE (Contractant Général — ENERGIA-CONSEIL IA®)",
    },
    ordreTravaux:
      "Ingénierie / DP / Enedis → modules TOPCon → onduleur & protections → structure ETN & câblage → pose, mise en service & raccordement.",
    artisansCgv: "équipe certifiée QualiPV 500 — apport Damien (Éco-Technicien BtoC)",
    missionHtml: "pour la centrale solaire photovoltaïque 100 kWc toiture hangar (Ardèche 07)",
  });
}

/**
 * Contrat CG officiel — Pack 3 en 1 Marseille (PAC + PV/batterie + ballon).
 */
export function payloadContratPack3en1MarseilleOfficiel() {
  const c = CLIENT_PACK3EN1_MARSEILLE;
  return payloadSecondOeuvreCg({
    titre: PACK3EN1_MARSEILLE_CONTRAT_TITRE,
    numero: PACK3EN1_MARSEILLE_CONTRAT_NUMERO,
    dateIso: PACK3EN1_MARSEILLE_CONTRAT_DATE,
    reference: PACK3EN1_MARSEILLE_REFERENCE,
    identite: c.raisonSociale,
    adresse: c.lieu,
    typeBien: `${c.typeBien} — Apporteur : Direct ENERGIA CONSEIL`,
    metaExtraHtml: "Pack autonomie totale — TVA mixte 5,5 % / 20 % · Direct ENERGIA<br>",
    mentionHorsMpr: MENTION_PACK3EN1_MARSEILLE,
    equipeHtml: "Apporteur : Direct ENERGIA CONSEIL. Direction : Sylvain LEMBELEMBE.",
    titrePostes: "II. Détail des 3 lots techniques — Pack 3 en 1 Autonomie Totale",
    introPostesHtml:
      "Marché ferme : PAC Air/Eau R32 + PV 6 kWc / batterie 10 kWh + ballon thermodynamique 500 L. Total 37 500 € HT / 41 500 € TTC. Économie cible ~2 250 €/an.",
    postes: POSTES_PACK3EN1_MARSEILLE_CONTRAT,
    totaux: TOTAUX_PACK3EN1_MARSEILLE,
    financement: FINANCEMENT_PACK3EN1_MARSEILLE,
    tauxTvaPct: 0.1,
    echeancierLabels: {
      acompteLabel: "Acompte 1 — 30 % à la signature du marché",
      acompteMuted: "Engagement client et blocage des prix",
      intermediaireLabel: "Acompte 2 — 40 % approvisionnement matériel & batterie",
      intermediaireMuted: "PAC, modules, batterie et ballon livrés sur site",
      soldeLabel: "Solde 3 — 30 % mise en service & Consuel",
      soldeMuted:
        "Après mise en service, tests et validation de Sylvain LEMBELEMBE (Contractant Général — ENERGIA-CONSEIL IA®)",
    },
    ordreTravaux: "PAC Air/Eau → Photovoltaïque + batterie → Ballon thermodynamique 500 L → mise en service.",
    artisansCgv: "artisans RGE QualiPAC / QualiPV — Direct ENERGIA",
    missionHtml: "pour le Pack 3 en 1 Autonomie Totale — Marseille (13000)",
  });
}

/**
 * Contrat CG officiel — Monsieur Zoulou Paris (rénovation globale, 5 lots, aides ANAH).
 */
export function payloadContratZoulouParisOfficiel() {
  const c = CLIENT_ZOULOU_PARIS;
  const t = TOTAUX_ZOULOU_PARIS;
  const f = FINANCEMENT_ZOULOU_PARIS;
  const base = payloadSecondOeuvreCg({
    titre: ZOULOU_PARIS_CONTRAT_TITRE,
    numero: ZOULOU_PARIS_CONTRAT_NUMERO,
    dateIso: ZOULOU_PARIS_CONTRAT_DATE,
    reference: ZOULOU_PARIS_REFERENCE,
    identite: c.identite,
    adresse: c.adresse,
    typeBien: c.typeBien,
    metaExtraHtml:
      "Rénovation globale Paris IDF — TVA 5,5 % · MaPrimeRénov’ Parcours (estimation indicative)<br>",
    mentionHorsMpr: MENTION_ZOULOU_PARIS,
    equipeHtml: "Apporteur : Direct ENERGIA. Direction : Sylvain LEMBELEMBE. MAR : Antoine BARATIER — Cabinet C2ET.",
    titrePostes: "II. Détail des 5 lots contractuels — Rénovation globale Monsieur Zoulou",
    introPostesHtml:
      "Ordre optimal ENERGIA : combles → ITE → menuiseries → VMC DF → PAC + solaire (post-isolation). Total ferme 84 500 € TTC.",
    postes: POSTES_ZOULOU_PARIS_CONTRAT,
    totaux: t,
    financement: f,
    tauxTvaPct: 0.055,
    echeancierLabels: {
      acompteLabel: "Acompte 30 % à la signature (sur reste à charge)",
      acompteMuted: "Engagement client — 13 800 € TTC",
      intermediaireLabel: "Acompte 40 % mi-chantier après validation Sylvain LEMBELEMBE",
      intermediaireMuted: "Déblocage conditionné à la conformité des lots — 18 400 € TTC",
      soldeLabel: "Solde 30 % à réception",
      soldeMuted: "Après PV sans réserve — 13 800 € TTC",
    },
    ordreTravaux: "1. Combles 2. ITE 3. Menuiseries 4. VMC DF 5. PAC + solaire",
    artisansCgv: "artisans RGE Isolation / Menuiseries / VMC / QualiPAC / QualiPV",
    missionHtml: "pour la rénovation globale de la maison à Paris (75000)",
  });
  return {
    ...base,
    titreAides: "IV. Aides ANAH / CEE & reste à charge (estimation indicative)",
    aidesLignes: [
      { label: "MaPrimeRénov’ + CEE (estimation à titre indicatif)", montant: `${euro(t.aidesAnahCee)} €` },
      { label: "Total aides estimées", montant: `${euro(t.aidesAnahCee)} €`, total: true },
      { label: "Reste à charge client net", montant: `${euro(t.resteACharge)} € TTC`, total: true },
    ],
    recapLignes: base.recapLignes.map((ligne) =>
      ligne.label.startsWith("Total échéancier")
        ? {
            label: "Total échéancier 30 % / 40 % / 30 % (sur reste à charge)",
            montant: `${euro(t.resteACharge)} € TTC`,
            total: true,
          }
        : ligne,
    ),
    regleAnahExtra:
      " NE JAMAIS SIGNER LES DEVIS DÉFINITIFS AVANT L'ACCORD ÉCRIT DE L'ANAH (sinon perte définitive et irrémédiable du MPR). Travaux après validation ANAH uniquement.",
    signatureHtml: `<p>Je soussigné(e), <strong>${escapeHtml(c.identite)}</strong>, accepte le présent contrat n° <strong>${escapeHtml(ZOULOU_PARIS_CONTRAT_NUMERO)}</strong>
        d’un montant <strong>ferme et définitif</strong> de <strong>${euro(t.totalTtc)} € TTC</strong>
        (aides estimatives <strong>${euro(t.aidesAnahCee)} €</strong> — reste à charge net <strong>${euro(t.resteACharge)} € TTC</strong>)
        et mandate <strong>ENERGIA-CONSEIL IA® en qualité de Contractant Général</strong> pour la rénovation globale à Paris.</p>
        <p>Échéancier de paiement sur reste à charge : <strong>30 % signature</strong> (${euro(f.acompte)} € TTC) /
        <strong>40 % mi-chantier</strong> (${euro(f.intermediaire)} € TTC, validation Sylvain LEMBELEMBE) /
        <strong>30 % réception</strong> (${euro(f.solde)} € TTC).</p>
        <p>Mentions manuscrites obligatoires : « Lu et approuvé », « Bon pour accord », « Ne vaut pas ordre de démarrer avant accord ANAH ».</p>
        <p>Fait à ____________________________ , le ___ / ___ / 2026</p>
        <table class="sig-table">
          <tr>
            <td>Le client — ${escapeHtml(c.identite)}<div class="sig-line"></div></td>
            <td>ENERGIA-CONSEIL IA® — Sylvain LEMBELEMBE<div class="sig-line"></div></td>
          </tr>
        </table>`,
    juliaBullets: [
      `la qualité d’ENERGIA-CONSEIL IA® de <strong>Contractant Général</strong> (prix forfaitaire ferme ${euro(t.totalTtc)} € TTC, 5 lots) ;`,
      `les aides ANAH / CEE estimées à titre indicatif (<strong>${euro(t.aidesAnahCee)} €</strong>) et le reste à charge net <strong>${euro(t.resteACharge)} € TTC</strong> — montants définitifs après instruction ANAH et CEE ;`,
      `l’interdiction de démarrer les travaux avant accord écrit de l’ANAH ;`,
      `le régime <strong>30 % / 40 % / 30 %</strong> sur le reste à charge (${euro(f.acompte)} € / ${euro(f.intermediaire)} € / ${euro(f.solde)} € TTC) ;`,
      `la <strong>Clause Julia Protection Aides</strong> : responsabilité ENERGIA plafonnée à 2 000 € en cas d’écart &gt; 10 % imputable à une erreur prouvée d’ENERGIA ; 0 % si erreur client ou décision ANAH/CEE.`,
    ],
  };
}

/**
 * Contrat CG officiel — Cloison / Faux-plafond SDB (second œuvre, TVA 10 %, hors MPR).
 */
export function payloadContratCloisonSdbOfficiel() {
  const edition = editionOfficielleCloisonSdb();
  const c = CLIENT_CLOISON_SDB;
  const p = PRESTATAIRE_ENERGIA;
  const t = TOTAUX_CLOISON_SDB;
  const f = FINANCEMENT_CLOISON_SDB;
  const dateTxt = dateLongue(CLOISON_SDB_CONTRAT_DATE);
  const postes = POSTES_CLOISON_SDB_CONTRAT.slice().sort(
    (a, b) => (a.ordreContractuel || 0) - (b.ordreContractuel || 0),
  );
  const identite = c.libelleSignature;
  const annexePhotosHtml = `
    <section class="photo-annexe annexe-photos bloc annexe-cloison-sdb">
      <h2>Annexe Photographique — Repérage technique Cloison / SDB</h2>
      <p>4 photos terrain (mêmes fichiers que le dossier <code>public/</code>) — affichage grand format.</p>
      <style>
        .annexe-cloison-sdb .grille-photos-cloison {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 10px 0 14px;
        }
        .annexe-cloison-sdb figure {
          margin: 0; break-inside: avoid; page-break-inside: avoid;
        }
        .annexe-cloison-sdb figure img {
          width: 100%; height: auto; max-height: 320px; object-fit: cover;
          border: 2px solid #059669; border-radius: 8px; background: #f1f5f9;
          display: block;
        }
        .annexe-cloison-sdb figcaption {
          font-size: 8pt; color: #334155; margin-top: 6px; font-weight: 600;
        }
        @media print {
          .annexe-cloison-sdb figure img { max-height: 260px; print-color-adjust: exact; }
        }
      </style>
      <div class="grille-photos-cloison">
        ${PHOTOS_TERRAIN_CLOISON_SDB.map(
          (photo, index) => `
        <figure>
          <img src="${photo.srcContrat || photo.src}" alt="${escapeHtml(photo.label)}" />
          <figcaption>Photo ${index + 1} — ${escapeHtml(photo.titre)} — ${escapeHtml(photo.badge)}</figcaption>
        </figure>`,
        ).join("")}
      </div>
      <p class="mentions-legales">Photographies de repérage technique — chambre, SDB vue haute, porte/split clim, vasque &amp; cloison. Cotes à confirmer avant démarrage.</p>
    </section>`;

  return {
    titre: CLOISON_SDB_CONTRAT_TITRE,
    numero: CLOISON_SDB_CONTRAT_NUMERO,
    dateIso: CLOISON_SDB_CONTRAT_DATE,
    dateTxt,
    prestataire: p,
    metaLignesHtml: `Réf. ${CLOISON_SDB_REFERENCE}<br>Second œuvre — TVA 10 % · hors MaPrimeRénov’<br>`,
    clientHtml: `<strong>${escapeHtml(identite)}</strong><br>Tél. ${escapeHtml(c.telephone || "—")}<br>${escapeHtml(c.adresse)}<br>${escapeHtml(c.typeBien)}<br><span class="muted">Intitulé projet : ${escapeHtml(c.intitule)}</span>`,
    lieuExecution: escapeHtml(c.adresse),
    fiscaliteHtml: `<div class="disclaimer">
        <strong>Marché de second œuvre — TVA 10 %.</strong>
        ${escapeHtml(MENTION_HORS_MPR_CLOISON_SDB)}
        Direction &amp; Portage Contractant Général : ENERGIA CONSEIL IA®.
        Interlocuteur unique : Sylvain LEMBELEMBE (06 10 59 68 98 — contact@energia-conseil-ia.com).
        ${escapeHtml(EQUIPE_CLOISON_SDB.marqueInpi)} — ${escapeHtml(EQUIPE_CLOISON_SDB.assuranceDecennale)}.
      </div>`,
    alertHtml: `<div class="alert-red">${escapeHtml(MENTION_HORS_MPR_CLOISON_SDB)}</div>`,
    engagementArtisansHtml:
      "Les artisans interviennent sous la maîtrise d’œuvre et la sous-traitance contractuelle d’ENERGIA-CONSEIL IA®. Direction &amp; Portage Contractant Général : ENERGIA CONSEIL IA®.",
    titrePostes: "II. Détail des 4 lots contractuels — second œuvre Cloison / SDB",
    introPostesHtml:
      "Lots Contractant Général. TVA rénovation 10 %. Direction &amp; Portage Contractant Général : ENERGIA CONSEIL IA®. Interlocuteur unique : Sylvain LEMBELEMBE.",
    postes,
    totaux: {
      totalHt: t.totalHt,
      totalTva: t.totalTva,
      totalTtc: t.totalTtc,
    },
    totauxPhraseHtml: `<strong>Totaux contractuels :</strong> ${euro(t.totalHt)} € HT | TVA (10 %) : ${euro(t.totalTva)} € | <strong>Montant total TTC : ${euro(t.totalTtc)} € TTC</strong>.`,
    annexePhotosHtml,
    recapLignes: [
      { label: "Montant Total HT", montant: `${euro(t.totalHt)} € HT` },
      { label: "TVA (10 %)", montant: `${euro(t.totalTva)} €` },
      {
        label: "Montant total TTC",
        montant: `${euro(t.totalTtc)} € TTC`,
        total: true,
      },
      {
        label: "Acompte de 30 % à la signature",
        muted: "Engagement client et blocage des prix artisans",
        montant: `${euro(f.acompte)} € TTC`,
      },
      {
        label: "Acompte de 40 % au démarrage effectif du chantier",
        muted: "Approvisionnement et démarrage des lots",
        montant: `${euro(f.intermediaire)} € TTC`,
      },
      {
        label: "Solde de 30 % à la réception sans réserve",
        muted:
          "Après procès-verbal de réception sans réserve et validation de Sylvain LEMBELEMBE (Contractant Général — ENERGIA-CONSEIL IA®)",
        montant: `${euro(f.solde)} € TTC`,
      },
      {
        label: "Total échéancier 30 % / 40 % / 30 %",
        montant: `${euro(t.totalTtc)} € TTC`,
        total: true,
      },
    ],
    titreAides: "IV. Aides & reste à charge (second œuvre hors MaPrimeRénov’)",
    disclaimerAidesHtml: `<div class="disclaimer">
        <strong>Aides financières 2026 (estimation à titre indicatif).</strong>
        ${escapeHtml(MENTION_HORS_MPR_CLOISON_SDB)}
        Montants définitifs après instruction éventuelle (hors périmètre MPR Parcours pour ce marché).
      </div>`,
    aidesLignes: [
      { label: "MaPrimeRénov’ Parcours", montant: "0,00 € (non éligible)" },
      { label: "CEE / Coup de pouce", montant: "0,00 € (hors périmètre)" },
      { label: "Total aides estimées", montant: "0,00 €", total: true },
      {
        label: "Reste à charge client net",
        montant: `${euro(f.resteACharge)} € TTC`,
        total: true,
      },
    ],
    regleAnahExtra:
      " Marché de second œuvre hors MaPrimeRénov’ : pas de condition ANAH pour démarrer. Signature du présent contrat et acompte 30 % suffisent pour engager le chantier.",
    planning: [
      {
        phase: "Validation devis & signature contrat",
        duree: "J0",
        detail: "Acompte 30 % à la signature — Direction & Portage Contractant Général : ENERGIA CONSEIL IA® — Sylvain LEMBELEMBE",
      },
      { phase: "1. Dépose cloison 3,50 ml", duree: "0,5–1 j", detail: "Évacuation gravats" },
      {
        phase: "2. Nouvelle cloison Placostil 72/48",
        duree: "1–2 j",
        detail: "Hydrofuge / phonique — décalage 30 cm",
      },
      {
        phase: "3. Faux-plafond autoportant hydrofuge",
        duree: "1–2 j",
        detail: "Abaissement 2,52 m · bandes · peinture pro",
      },
      { phase: "4. Électricité 3 spots LED IP65", duree: "0,5 j", detail: "NF C 15-100" },
      {
        phase: "Réception",
        duree: "Fin chantier",
        detail: "PV sans réserve — solde 30 % — validation Sylvain LEMBELEMBE",
      },
    ],
    signatureHtml: `<p>Je soussigné(e), <strong>${escapeHtml(identite)}</strong>, accepte le présent contrat n° <strong>${CLOISON_SDB_CONTRAT_NUMERO}</strong>
        d’un <strong>Montant total TTC : ${euro(t.totalTtc)} € TTC</strong>
        (reste à charge client net <strong>${euro(f.resteACharge)} € TTC</strong>, hors aides / travaux second œuvre non éligibles MaPrimeRénov’)
        et mandate <strong>ENERGIA-CONSEIL IA® en qualité de Contractant Général</strong> pour le réaménagement cloison 3,50 m &amp; faux-plafond autoportant SDB.</p>
        <p>Échéancier de paiement : <strong>30 % à la signature</strong> (${euro(f.acompte)} € TTC) /
        <strong>40 % au démarrage effectif du chantier</strong> (${euro(f.intermediaire)} € TTC) /
        <strong>30 % à réception sans réserve</strong> (${euro(f.solde)} € TTC), après PV et validation Sylvain LEMBELEMBE.</p>
        <p class="muted">Direction &amp; Portage Contractant Général : ENERGIA CONSEIL IA®. Interlocuteur unique : Sylvain LEMBELEMBE (06 10 59 68 98 — contact@energia-conseil-ia.com).</p>
        <p class="muted">${escapeHtml(EQUIPE_CLOISON_SDB.marqueInpi)} — ${escapeHtml(EQUIPE_CLOISON_SDB.assuranceDecennale)}.</p>
        <p>Mentions manuscrites obligatoires : « Lu et approuvé », « Bon pour accord ».</p>
        <p>Fait à ____________________________ , le ___ / ___ / 2026</p>
        <table class="sig-table">
          <tr>
            <td>Le client — ${escapeHtml(identite)}<div class="sig-line"></div>
              <p class="muted" style="margin-top:8px">Nom / prénom manuscrit : ________________________________</p>
            </td>
            <td>ENERGIA-CONSEIL IA® — Sylvain LEMBELEMBE<div class="sig-line"></div></td>
          </tr>
        </table>`,
    juliaBullets: [
      `la qualité d’ENERGIA-CONSEIL IA® de <strong>Contractant Général</strong> (responsabilité globale, Montant total TTC : ${euro(t.totalTtc)} € TTC, artisans en sous-traitance) ;`,
      `le caractère de <strong>second œuvre hors MaPrimeRénov’</strong> : aucune aide ANAH déduite ; reste à charge = ${euro(f.resteACharge)} € TTC ;`,
      `la TVA rénovation applicable de <strong>10 %</strong> sur l’ensemble des lots ;`,
      `la <strong>Clause Julia Protection Aides</strong> : responsabilité ENERGIA plafonnée à 2 000 € en cas d’écart &gt; 10 % imputable à une erreur prouvée d’ENERGIA (sans objet MPR sur ce marché, sauf aides locales éventuelles) ;`,
      `le régime de paiement : <strong>30 % signature / 40 % démarrage / 30 % réception</strong> (${euro(f.acompte)} € / ${euro(f.intermediaire)} € / ${euro(f.solde)} € TTC), solde après PV sans réserve et validation Sylvain LEMBELEMBE.`,
    ],
    ordreTravauxCgv:
      "Dépose cloison → nouvelle cloison Placostil 72/48 → faux-plafond autoportant hydrofuge → électricité spots IP65.",
    echeancier: f,
    totauxPourCgv: t,
    mentionsHtml: MENTIONS_STANDARD(p),
    inclureCommissionDamien: false,
    footerClientHtml: `Contrat ${CLOISON_SDB_CONTRAT_NUMERO} — ${escapeHtml(c.intitule)} — ${escapeHtml(identite)} — ${dateTxt}`,
    cgvArticles: articlesCgvContractantGeneral({
      numero: CLOISON_SDB_CONTRAT_NUMERO,
      dateTxt,
      totalTtc: t.totalTtc,
      acompte: f.acompte,
      intermediaire: f.intermediaire,
      solde: f.solde,
      artisans: "réseau partenaires second œuvre — Direction & Portage Contractant Général : ENERGIA CONSEIL IA®",
      ordreTravaux:
        "Dépose cloison → nouvelle cloison → faux-plafond → électricité. Pas d’ordre thermique MPR (marché second œuvre).",
    }),
    contacts: [
      {
        role: "Direction & Contractant Général",
        nom: "Sylvain LEMBELEMBE",
        detail: "06 10 59 68 98 — contact@energia-conseil-ia.com — interlocuteur unique",
      },
      {
        role: "Direction & Portage Contractant Général",
        nom: "ENERGIA CONSEIL IA®",
        detail: "Pilotage technique et coordination des lots",
      },
      {
        role: "Marque & Assurances",
        nom: "ENERGIA-CONSEIL IA®",
        detail: "INPI n°5213845 — Décennale Calipso Assurances n° LUNPIB2604975",
      },
    ],
  };
}
