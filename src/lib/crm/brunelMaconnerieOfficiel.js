/**
 * Avenant n°01 — Gros Œuvre & Dalle 80 m² — M. Emrick Brunel / Indivision COUBLE.
 * Galerie technique : public/brunel-maconnerie/ + projections apres/.
 * Bordereau technique Hezen — document admin (aucun montant affiché côté présentation).
 */

import { CLIENT_BRUNEL_MARCHE } from "./brunelMarcheOfficiel2026.js";

export const BRUNEL_MACONNERIE_DOSSIER_ID = "dossier-brunel-avenant-maconnerie-2026";
export const BRUNEL_MACONNERIE_REFERENCE = "EC-2026-BRUNEL-AVENANT-01-GO";
export const BRUNEL_MACONNERIE_CONTRAT_NUMERO = "AVENANT-01-2026-BRUNEL-GO-DALLE";
export const BRUNEL_MACONNERIE_CONTRAT_DATE = "2026-10-04";
export const BRUNEL_MACONNERIE_CONTRAT_TITRE =
  "AVENANT N°01 — GROS ŒUVRE & DALLE 80 m² — M. EMRICK BRUNEL / INDIVISION COUBLE";
export const NOM_FICHIER_CONTRAT_BRUNEL_MACONNERIE = "CONTRAT_AVENANT_01_BRUNEL_MACONNERIE_2026.html";
export const CHEMIN_CONTRAT_BRUNEL_MACONNERIE = `/${NOM_FICHIER_CONTRAT_BRUNEL_MACONNERIE}`;
export const CHEMIN_GALERIE_BRUNEL_MACONNERIE = "/brunel-maconnerie";

export const HEZEN_SOUS_TRAITANCE = {
  entreprise: "HEZEN BÂTIMENT",
  adresse: "96 Rue du Beaujolais, 71000 Mâcon",
  siret: "84821544800012",
  devisNumero: "01/10",
  devisDate: "2026-10-04",
  /** Coût d’achat interne — jamais affiché dans la présentation client. */
  coutAchatInterneHt: 17770,
  mentionTva: "TVA non applicable, art. 293B du CGI",
  fichier: `${CHEMIN_GALERIE_BRUNEL_MACONNERIE}/DEVIS-HEZEN-BATIMENT.jpg`,
  fichierContrat: `${CHEMIN_GALERIE_BRUNEL_MACONNERIE}/DEVIS-HEZEN-BATIMENT.jpg`,
  titrePresentation: "DOCUMENT TECHNIQUE INTERNE — ADMINISTRATEUR UNIQUEMENT",
  sousTitrePresentation:
    "Bordereau Technique d'Exécution Gros Œuvre — Hezen Bâtiment (Dalle 80 m² & IPN)",
  badgePresentation: "Bordereau Technique Hezen Bâtiment",
};

/** Plan technique DAO vectoriel (SVG) — affichage par défaut. */
export const PLAN_DAO_BRUNEL = {
  id: "brunel-maco-plan-dao",
  src: `${CHEMIN_GALERIE_BRUNEL_MACONNERIE}/PLAN-TECHNIQUE-DAO-NIVEAU-0.svg`,
  srcContrat: `${CHEMIN_GALERIE_BRUNEL_MACONNERIE}/PLAN-TECHNIQUE-DAO-NIVEAU-0.svg`,
  titre: "Plan Technique DAO Vectoriel",
  badge: "80,50 m² niveau 0 · IPN 260×230 · mur banché · dalle BA 15 cm",
  label: "Plan de principe Gros Œuvre & Niveau 0 — DAO vectoriel 80,50 m²",
  lot: "schema",
  kind: "dao",
};

/** Croquis manuscrit terrain Mustafa — archive consultable. */
export const CROQUIS_MANUSCRIT_MUSTAFA = {
  id: "brunel-maco-shema",
  src: `${CHEMIN_GALERIE_BRUNEL_MACONNERIE}/SHEMA.jpg`,
  srcContrat: `${CHEMIN_GALERIE_BRUNEL_MACONNERIE}/SHEMA.jpg`,
  titre: "Croquis Manuscrit Terrain (Mustafa)",
  badge: "Carnet d'origine — relevé constructeur sur site",
  label: "Croquis manuscrit terrain Mustafa — 80 m² niveau 0, mur banché, ouverture IPN",
  lot: "schema",
  kind: "croquis",
};

/** @deprecated Utiliser PLAN_DAO_BRUNEL — alias de compatibilité. */
export const SCHEMA_MUSTAFA_BRUNEL = PLAN_DAO_BRUNEL;

/** Photo de cadrage sur site (Mustafa & M. Brunel). */
export const PHOTO_CADRAGE_BRUNEL = {
  id: "brunel-maco-cadrage",
  src: `${CHEMIN_GALERIE_BRUNEL_MACONNERIE}/CADRAGE-MUSTAFA-BRUNEL.jpg`,
  srcContrat: `${CHEMIN_GALERIE_BRUNEL_MACONNERIE}/CADRAGE-MUSTAFA-BRUNEL.jpg`,
  titre: "Cadrage sur site",
  badge: "Mustafa HEZEN & M. Brunel — validation métrés gros œuvre",
  label: "Cadrage sur site — Mustafa HEZEN & M. Emrick Brunel",
  lot: "cadrage",
};

export const CHEMIN_PROJECTIONS_APRES_BRUNEL = `${CHEMIN_GALERIE_BRUNEL_MACONNERIE}/apres`;

export const MENTION_JURIDIQUE_PROJECTIONS_BRUNEL =
  "Note contractuelle : Les perspectives 3D d'ambiance et d'agencement sont remises à titre d'illustration d'objectifs de rénovation. Les ouvrages de gros œuvre, niveaux altimétriques continus (Niveau 0.00), ouverture de mur porteur sous IPN 260 × 230 et réseaux d'évacuation intégrés sont strictement conformes aux spécifications quantitatives du marché de Contractant Général ENERGIA CONSEIL IA®.";

export const REF_PLAN_DAO_BRUNEL = "EC-2026-BRUNEL-GO-01";

/**
 * Galerie comparative Avant / Après — 10 zones architecturales.
 * Avant : public/brunel-maconnerie/ · Après : public/brunel-maconnerie/apres/
 */
export const PHOTOS_ETAT_LIEUX_BRUNEL_MACONNERIE = [
  {
    id: "brunel-maco-photo1",
    zone: 1,
    zoneTitre: "Seuil & Tranchée rocheuse",
    fichier: "PHOTO1.jpg",
    fichierApres: "DOC 4.jpg",
    fichiersApresAlternatifs: ["DOC 4.jpg", "DOC4.jpg"],
    titre: "Seuil & Tranchée rocheuse",
    titreApres: "Dalle Niveau 0.00",
    badge: "ÉTAT INITIAL BRUT",
    badgeApres: "✨ PROJECTION 3D — DALLE NIVEAU 0.00",
    label: "Zone 1 — Avant — Seuil & tranchée rocheuse",
    labelApres: "Zone 1 — Après — Projection 3D dalle Niveau 0.00",
    legende:
      "Rattrapage altimétrique : suppression des tranchées et coulage du radier 15 cm pour planéité parfaite Niveau 0.",
    lot: "soutenement",
  },
  {
    id: "brunel-maco-photo2",
    zone: 2,
    zoneTitre: "Séjour principal & Escalier d'origine",
    fichier: "PHOTO2.jpg",
    fichierApres: "PHOTO2.jpg",
    titre: "Séjour & escalier d'origine",
    titreApres: "Séjour & escalier restaurés",
    badge: "ÉTAT INITIAL BRUT",
    badgeApres: "✨ PROJECTION 3D — NIVEAU 0 FINI",
    label: "Zone 2 — Avant — Séjour principal & escalier",
    labelApres: "Zone 2 — Après — Séjour & escalier chêne",
    legende:
      "Escalier chêne d'origine conservé et restauré, sol continu en béton ciré gris clair satiné, lumière traversante.",
    lot: "dalle",
  },
  {
    id: "brunel-maco-photo3",
    zone: 3,
    zoneTitre: "Ancienne Étable & Râtelier",
    fichier: "PHOTO3.jpg",
    fichierApres: "PHOTO3.jpg",
    titre: "Ancienne étable & râtelier",
    titreApres: "Salon lounge rustique-contemporain",
    badge: "ÉTAT INITIAL BRUT",
    badgeApres: "✨ PROJECTION 3D — NIVEAU 0 FINI",
    label: "Zone 3 — Avant — Étable & râtelier",
    labelApres: "Zone 3 — Après — Salon lounge",
    legende:
      "Métamorphose du volume brut en salon lounge rustique-contemporain avec conservation du râtelier d'origine.",
    lot: "dalle",
  },
  {
    id: "brunel-maco-photo4",
    zone: 4,
    zoneTitre: "Mur de refend porteur & Ouverture IPN",
    fichier: "PHOTO4.jpg",
    fichierApres: "PHOTO4.jpg",
    titre: "Mur de refend & ouverture IPN",
    titreApres: "Ouverture IPN 260×230",
    badge: "ÉTAT INITIAL BRUT",
    badgeApres: "✨ PROJECTION 3D — IPN 260×230",
    label: "Zone 4 — Avant — Mur porteur / IPN",
    labelApres: "Zone 4 — Après — Ouverture sous IPN",
    legende:
      "Création d'ouverture 2,60 m × 2,30 m sous linteau acier IPN 260×230 scellé, décloisonnement total vers le séjour.",
    lot: "ouverture-ipn",
  },
  {
    id: "brunel-maco-photo5",
    zone: 5,
    zoneTitre: "Espace de vie & Convivialité",
    fichier: "PHOTO5.jpg",
    fichierApres: "PHOTO5.jpg",
    titre: "Espace de vie & convivialité",
    titreApres: "Agencement volume principal",
    badge: "ÉTAT INITIAL BRUT",
    badgeApres: "✨ PROJECTION 3D — NIVEAU 0 FINI",
    label: "Zone 5 — Avant — Espace de vie",
    labelApres: "Zone 5 — Après — Îlot & moellons",
    legende:
      "Perspective d'agencement du volume principal avec îlot central et mise en valeur des moellons de pierre à la chaux.",
    lot: "cadrage",
  },
  {
    id: "brunel-maco-photo6",
    zone: 6,
    zoneTitre: "Grange & Volume Cathédrale",
    fichier: "PHOTO6.jpg",
    fichierApres: "PHOTO6.jpg",
    titre: "Grange & volume cathédrale",
    titreApres: "Mezzanine & lumière zénithale",
    badge: "ÉTAT INITIAL BRUT",
    badgeApres: "✨ PROJECTION 3D — NIVEAU 0 FINI",
    label: "Zone 6 — Avant — Grange",
    labelApres: "Zone 6 — Après — Volume cathédrale",
    legende: "Création d'un volume cathédrale avec mezzanine et apport de lumière zénithale.",
    lot: "dalle",
  },
  {
    id: "brunel-maco-photo7",
    zone: 7,
    zoneTitre: "Façade Extérieure & Terrasse Panoramique",
    fichier: "PHOTO7.jpg",
    fichierApres: "PHOTO7.jpg",
    titre: "Façade & terrasse",
    titreApres: "Terrasse panoramique",
    badge: "ÉTAT INITIAL BRUT",
    badgeApres: "✨ PROJECTION 3D — TERRASSE",
    label: "Zone 7 — Avant — Façade extérieure",
    labelApres: "Zone 7 — Après — Terrasse panoramique",
    legende:
      "Aménagement de la terrasse extérieure de plain-pied avec vue panoramique sur la vallée.",
    lot: "dalle",
  },
  {
    id: "brunel-maco-photo8",
    zone: 8,
    zoneTitre: "Accès Intérieur & Entrée Noble",
    fichier: "PHOTO8.jpg",
    fichierApres: "PHOTO8.jpg",
    titre: "Accès intérieur & entrée",
    titreApres: "Entrée noble de plain-pied",
    badge: "ÉTAT INITIAL BRUT",
    badgeApres: "✨ PROJECTION 3D — ENTRÉE",
    label: "Zone 8 — Avant — Accès intérieur",
    labelApres: "Zone 8 — Après — Entrée noble",
    legende:
      "Entrée de domaine de plain-pied avec double porte contemporaine aluminium gris anthracite.",
    lot: "ouverture-ipn",
  },
  {
    id: "brunel-maco-photo9",
    zone: 9,
    zoneTitre: "Fouilles rocheuses comblées & Dalle finie",
    fichier: "PHOTO9.jpg",
    fichierApres: "PHOTO9.jpg",
    titre: "Fouilles rocheuses",
    titreApres: "Dalle finie Niveau 0",
    badge: "ÉTAT INITIAL BRUT",
    badgeApres: "✨ PROJECTION 3D — DALLE FINIE",
    label: "Zone 9 — Avant — Fouilles rocheuses",
    labelApres: "Zone 9 — Après — Dalle finie",
    legende:
      "Traitement des sols rocheux, évacuation des terres et finition béton micro-ciment minéral.",
    lot: "dalle",
  },
  {
    id: "brunel-maco-photo10",
    zone: 10,
    zoneTitre: "Fouilles rocheuses comblées & Dalle finie",
    fichier: "PHOTO10.jpg",
    fichierApres: "PHOTO10.jpg",
    titre: "Fouilles & préparation",
    titreApres: "Dalle finie Niveau 0",
    badge: "ÉTAT INITIAL BRUT",
    badgeApres: "✨ PROJECTION 3D — DALLE FINIE",
    label: "Zone 10 — Avant — Fouilles / brouette",
    labelApres: "Zone 10 — Après — Dalle finie",
    legende:
      "Traitement des sols rocheux, évacuation des terres et finition béton micro-ciment minéral.",
    lot: "soutenement",
  },
].map((photo) => {
  const apresPrincipal = encodeURI(
    `${CHEMIN_PROJECTIONS_APRES_BRUNEL}/${photo.fichierApres}`,
  );
  const apresFallbacks = (photo.fichiersApresAlternatifs || [photo.fichierApres]).map(
    (fichier) => encodeURI(`${CHEMIN_PROJECTIONS_APRES_BRUNEL}/${fichier}`),
  );
  return {
    ...photo,
    src: `${CHEMIN_GALERIE_BRUNEL_MACONNERIE}/${photo.fichier}`,
    srcContrat: `${CHEMIN_GALERIE_BRUNEL_MACONNERIE}/${photo.fichier}`,
    srcApres: apresPrincipal,
    srcApresFallbacks: apresFallbacks,
    srcApresContrat: apresPrincipal,
  };
});

/** Document source interne — réservé administrateur (aucun montant affiché). */
export const DOC_ADMIN_DEVIS_HEZEN = {
  id: "brunel-maco-devis-hezen",
  src: HEZEN_SOUS_TRAITANCE.fichier,
  srcContrat: HEZEN_SOUS_TRAITANCE.fichierContrat,
  titre: HEZEN_SOUS_TRAITANCE.titrePresentation,
  badge: HEZEN_SOUS_TRAITANCE.badgePresentation,
  label: HEZEN_SOUS_TRAITANCE.sousTitrePresentation,
  sousTitre: HEZEN_SOUS_TRAITANCE.sousTitrePresentation,
  adminOnly: true,
  lot: "admin",
};

/**
 * Galerie technique complète.
 * Ordre : plan DAO → croquis Mustafa → cadrage → 10 photos → devis Hezen (admin).
 */
export const GALERIE_TECHNIQUE_BRUNEL_MACONNERIE = [
  PLAN_DAO_BRUNEL,
  CROQUIS_MANUSCRIT_MUSTAFA,
  PHOTO_CADRAGE_BRUNEL,
  ...PHOTOS_ETAT_LIEUX_BRUNEL_MACONNERIE,
  DOC_ADMIN_DEVIS_HEZEN,
];

export function documentsGaleriePublique(afficherAdmin = false) {
  return GALERIE_TECHNIQUE_BRUNEL_MACONNERIE.filter((doc) => afficherAdmin || !doc.adminOnly);
}

/** Documents pour annexe contrat (hors devis Hezen admin). */
export const ANNEXE_DOCS_BRUNEL_MACONNERIE = [
  PLAN_DAO_BRUNEL,
  CROQUIS_MANUSCRIT_MUSTAFA,
  PHOTO_CADRAGE_BRUNEL,
  ...PHOTOS_ETAT_LIEUX_BRUNEL_MACONNERIE,
];

export const LOTS_ANNEXE_BRUNEL_MACONNERIE = [
  {
    id: "ouverture-ipn",
    titre: "Lot ouverture IPN 260 × 230",
    docIds: ["brunel-maco-plan-dao", "brunel-maco-photo4", "brunel-maco-photo5", "brunel-maco-photo8"],
  },
  {
    id: "soutenement",
    titre: "Lot soutènement / fondations / mur banché",
    docIds: ["brunel-maco-photo1", "brunel-maco-photo10", "brunel-maco-photo4", "brunel-maco-plan-dao"],
  },
  {
    id: "dalle",
    titre: "Lot dalle 80,50 m² & accès City pompe",
    docIds: [
      "brunel-maco-photo2",
      "brunel-maco-photo3",
      "brunel-maco-photo6",
      "brunel-maco-photo7",
      "brunel-maco-photo9",
      "brunel-maco-cadrage",
    ],
  },
];

/** Bloc plan DAO pleine largeur + onglet croquis Mustafa. */
export function htmlSelecteurPlanBrunel() {
  return `
      <div class="plan-dao-plein" id="plan-dao-brunel-contrat">
        <h3 class="plan-dao-titre">PLAN TECHNIQUE D'INGÉNIERIE GROS ŒUVRE — RÉF. ${escapeHtml(REF_PLAN_DAO_BRUNEL)}</h3>
        <div class="plan-tabs-brunel" id="plan-tabs-brunel" data-onglet="dao">
          <div class="plan-tabs-bar" role="tablist" aria-label="Plans techniques Brunel">
            <button type="button" class="plan-tab active" role="tab" aria-selected="true" data-onglet-cible="dao">📐 Plan Technique DAO Vectoriel</button>
            <button type="button" class="plan-tab" role="tab" aria-selected="false" data-onglet-cible="croquis">📝 Croquis Manuscrit Terrain (Mustafa)</button>
          </div>
          <div class="plan-tab-panel active" data-onglet-panel="dao">
            <figure class="annexe-maco-shema-hero annexe-maco-dao" data-lightbox-src="${PLAN_DAO_BRUNEL.srcContrat}" data-lightbox-label="${escapeAttr(PLAN_DAO_BRUNEL.label)}">
              <object type="image/svg+xml" data="${PLAN_DAO_BRUNEL.srcContrat}" aria-label="${escapeAttr(PLAN_DAO_BRUNEL.label)}" class="plan-dao-object">
                <img src="${PLAN_DAO_BRUNEL.srcContrat}" alt="${escapeAttr(PLAN_DAO_BRUNEL.label)}" />
              </object>
            </figure>
          </div>
          <div class="plan-tab-panel" data-onglet-panel="croquis" hidden>
            <figure class="annexe-maco-shema-hero" data-lightbox-src="${CROQUIS_MANUSCRIT_MUSTAFA.srcContrat}" data-lightbox-label="${escapeAttr(CROQUIS_MANUSCRIT_MUSTAFA.label)}">
              <img src="${CROQUIS_MANUSCRIT_MUSTAFA.srcContrat}" alt="${escapeAttr(CROQUIS_MANUSCRIT_MUSTAFA.label)}" />
              <figcaption><strong>Archive terrain — ${escapeHtml(CROQUIS_MANUSCRIT_MUSTAFA.titre)}</strong></figcaption>
            </figure>
          </div>
        </div>
      </div>`;
}

function htmlZoneComparativeBrunel(photo) {
  const srcAvant = photo.srcContrat || photo.src;
  const srcApres = photo.srcApresContrat || photo.srcApres;
  return `
      <article class="zone-comparative" data-zone="${photo.zone}" data-mode="cote">
        <header class="zone-comparative-head">
          <h3>Zone ${photo.zone} — ${escapeHtml(photo.zoneTitre)}</h3>
          <div class="zone-toggle" role="group" aria-label="Basculer Avant / Après zone ${photo.zone}">
            <button type="button" class="zone-btn active" data-mode-cible="cote">Vis-à-vis</button>
            <button type="button" class="zone-btn" data-mode-cible="avant">📸 Avant</button>
            <button type="button" class="zone-btn" data-mode-cible="apres">✨ Après 3D</button>
          </div>
        </header>
        <div class="zone-grille">
          <figure class="zone-fig zone-avant" data-lightbox-src="${srcAvant}" data-lightbox-label="${escapeAttr(photo.label)}">
            <span class="badge-avant">ÉTAT INITIAL BRUT</span>
            <img src="${srcAvant}" alt="${escapeAttr(photo.label)}" loading="lazy" />
            <figcaption>Avant — ${escapeHtml(photo.titre)}</figcaption>
          </figure>
          <figure class="zone-fig zone-apres" data-lightbox-src="${srcApres}" data-lightbox-label="${escapeAttr(photo.labelApres)}">
            <span class="badge-apres">${escapeHtml(photo.badgeApres)}</span>
            <img src="${srcApres}" alt="${escapeAttr(photo.labelApres)}" loading="lazy"
              onerror="this.onerror=null;this.src='${escapeAttr(photo.srcApresFallbacks?.[1] || srcApres)}';" />
            <figcaption>Après — ${escapeHtml(photo.titreApres)}</figcaption>
          </figure>
        </div>
        <p class="zone-legende">${escapeHtml(photo.legende)}</p>
      </article>`;
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function poste({ id, ordre, nom, specifications, quantite, unite, totalHt, coutAchatHt, artisan }) {
  const tauxTva = 0.1;
  const totalTva = round2(totalHt * tauxTva);
  return {
    id,
    ordreContractuel: ordre,
    nom,
    specifications,
    artisan: artisan || "HEZEN BÂTIMENT — Mustafa HEZEN (sous-traitance ENERGIA)",
    quantite,
    unite,
    puHt: round2(totalHt / quantite),
    tauxTva,
    totalHt,
    totalTva,
    totalTtc: round2(totalHt + totalTva),
    coutAchatHt,
    margeBruteHt: round2(totalHt - coutAchatHt),
    verrouillageOfficiel: true,
  };
}

/**
 * Lots client — vente CG (TVA 10 %).
 * Coût d’achat Hezen interne (non affiché en présentation).
 */
export const POSTES_BRUNEL_MACONNERIE_CONTRAT = [
  poste({
    id: "brunel-maco-lot-ouverture-ipn",
    ordre: 1,
    nom: "Ouverture 260 × 230 et pose IPN / HEB",
    specifications:
      "Création d’ouverture 260 × 230 (épaisseur ~60 cm) · fourniture et pose linteau acier IPN/HEB · reprises maçonnées — schéma Mustafa",
    quantite: 1,
    unite: "forfait",
    totalHt: 4000,
    coutAchatHt: 3200,
  }),
  poste({
    id: "brunel-maco-lot-soutenement",
    ordre: 2,
    nom: "Soutènement, fondations 5 ml et mur agglos banché",
    specifications:
      "Enrochement côté mur pierre (L≈5 ml, h≈75 cm) · fouilles fondations 40×30 · coulage/ferraillage · pose agglos à bancher (~4 m²) — mur banché 75 cm",
    quantite: 5,
    unite: "ml",
    totalHt: 2700,
    coutAchatHt: 2160,
  }),
  poste({
    id: "brunel-maco-lot-dalle",
    ordre: 3,
    nom: "Préparation, dalle béton 80 m² et évacuation WC",
    specifications:
      "Casse/préparation dalle 80 m² · chape/coulage 15 m³ béton City pompe 40 ml · PVC Ø125 WC · tranchées 5 ml profondeur 60 cm raccordées à l’égout",
    quantite: 80,
    unite: "m²",
    totalHt: 15500,
    coutAchatHt: 12410,
    artisan: "Direction Technique & Compagnons Gros Œuvre ENERGIA CONSEIL IA®",
  }),
];

export const TOTAUX_BRUNEL_MACONNERIE = {
  totalHt: 22200,
  totalTva: 2220,
  totalTtc: 24420,
  tauxTva: 0.1,
  coutsTravauxHt: HEZEN_SOUS_TRAITANCE.coutAchatInterneHt,
  margeBruteHt: 4430,
  tauxMargePct: 20,
};

export const FINANCEMENT_BRUNEL_MACONNERIE = {
  acompte: 7326,
  intermediaire: 9768,
  solde: 7326,
  resteACharge: TOTAUX_BRUNEL_MACONNERIE.totalTtc,
};

export const MENTION_HORS_MPR_BRUNEL_MACONNERIE =
  "Avenant gros œuvre / dalle — travaux structurels hors MaPrimeRénov’ Parcours (enveloppe chauffée non concernée). Aucune aide ANAH déduite sur cet avenant. Reste à charge = montant ferme TTC.";

export const CLIENT_BRUNEL_MACONNERIE = {
  nom: CLIENT_BRUNEL_MARCHE.nom,
  adresse: CLIENT_BRUNEL_MARCHE.adresse,
  typeBien: "Gros œuvre grange / niveau 0 — dalle 80 m², mur banché, ouverture IPN",
};

/**
 * Annexe contrat : galerie comparative Avant/Après (10 zones) + mention juridique.
 * (Plan DAO technique retiré de l'avenant client — choc visuel direct.)
 */
export function htmlAnnexeMaconnerieBrunel() {
  const zonesHtml = PHOTOS_ETAT_LIEUX_BRUNEL_MACONNERIE.map(htmlZoneComparativeBrunel).join("");

  return `
    <section class="photo-annexe annexe-photos bloc annexe-brunel-maconnerie" id="annexe-maconnerie-brunel">
      <h2>Annexe Architecturale — Galerie Comparative Avant / Après Travaux (10 zones)</h2>
      <p>Comparatif des 10 zones du projet : état initial brut vs projection 3D Niveau 0 fini.</p>
      <div class="galerie-comparative-zones">
        ${zonesHtml}
      </div>
      <aside class="note-juridique-projections">
        <p>⚖️ ${escapeHtml(MENTION_JURIDIQUE_PROJECTIONS_BRUNEL)}</p>
      </aside>
      <style>
        .annexe-brunel-maconnerie .galerie-aa-titre {
          font-size: 12pt; color: #1a3c5e; margin: 18px 0 12px; border-bottom: 2px solid #059669; padding-bottom: 6px;
        }
        .annexe-brunel-maconnerie .zone-comparative {
          margin: 0 0 18px; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px;
          background: #f8fafc; break-inside: avoid; page-break-inside: avoid;
        }
        .annexe-brunel-maconnerie .zone-comparative-head {
          display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; align-items: center; margin-bottom: 10px;
        }
        .annexe-brunel-maconnerie .zone-comparative-head h3 {
          margin: 0; font-size: 10.5pt; color: #0f172a;
        }
        .annexe-brunel-maconnerie .zone-toggle { display: flex; flex-wrap: wrap; gap: 6px; }
        .annexe-brunel-maconnerie .zone-btn {
          border: 1px solid #94a3b8; background: #fff; border-radius: 6px; padding: 5px 10px;
          font-size: 8pt; font-weight: 700; cursor: pointer; color: #334155;
        }
        .annexe-brunel-maconnerie .zone-btn.active { background: #1a3c5e; color: #fff; border-color: #1a3c5e; }
        .annexe-brunel-maconnerie .zone-grille {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .annexe-brunel-maconnerie .zone-comparative[data-mode="avant"] .zone-apres { display: none; }
        .annexe-brunel-maconnerie .zone-comparative[data-mode="avant"] .zone-grille { grid-template-columns: 1fr; }
        .annexe-brunel-maconnerie .zone-comparative[data-mode="apres"] .zone-avant { display: none; }
        .annexe-brunel-maconnerie .zone-comparative[data-mode="apres"] .zone-grille { grid-template-columns: 1fr; }
        .annexe-brunel-maconnerie .zone-fig {
          margin: 0; position: relative; cursor: zoom-in;
        }
        .annexe-brunel-maconnerie .zone-fig img {
          width: 100%; height: 220px; object-fit: cover; border-radius: 8px; display: block;
          background: #e2e8f0; border: 2px solid #64748b;
        }
        .annexe-brunel-maconnerie .zone-apres img { border-color: #059669; }
        .annexe-brunel-maconnerie .badge-avant,
        .annexe-brunel-maconnerie .badge-apres {
          position: absolute; left: 8px; top: 8px; z-index: 2;
          font-size: 7.5pt; font-weight: 800; padding: 4px 8px; border-radius: 6px;
        }
        .annexe-brunel-maconnerie .badge-avant {
          background: #475569; color: #fff;
        }
        .annexe-brunel-maconnerie .badge-apres {
          background: #059669; color: #ecfdf5;
        }
        .annexe-brunel-maconnerie .zone-fig figcaption {
          font-size: 8pt; color: #334155; margin-top: 6px; font-weight: 600;
        }
        .annexe-brunel-maconnerie .zone-legende {
          margin: 10px 0 0; font-size: 8.5pt; color: #1e293b; line-height: 1.45;
          padding: 8px 10px; background: #fff; border-left: 4px solid #38bdf8; border-radius: 0 6px 6px 0;
        }
        .annexe-brunel-maconnerie .note-juridique-projections {
          margin-top: 16px; padding: 12px 14px; border: 2px solid #f97316; border-radius: 8px;
          background: #fff7ed; color: #9a3412; font-size: 8.5pt; line-height: 1.5;
        }
        .annexe-brunel-maconnerie .note-juridique-projections p { margin: 0; }
        #lightbox-brunel-maco {
          display: none; position: fixed; inset: 0; z-index: 9999;
          background: rgba(15, 23, 42, 0.96); align-items: center; justify-content: center;
          flex-direction: column; padding: 24px; box-sizing: border-box;
        }
        #lightbox-brunel-maco.open { display: flex; }
        #lightbox-brunel-maco img {
          max-width: 96vw; max-height: 82vh; object-fit: contain; border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.45);
        }
        #lightbox-brunel-maco .lb-caption {
          color: #e2e8f0; margin-top: 12px; font-size: 12px; text-align: center; max-width: 90vw;
        }
        #lightbox-brunel-maco .lb-close {
          position: absolute; top: 16px; right: 20px; border: 0; border-radius: 8px;
          background: #fff; color: #0f172a; font-weight: 700; padding: 10px 16px; cursor: pointer;
        }
        @media print {
          #lightbox-brunel-maco { display: none !important; }
          .annexe-brunel-maconnerie .zone-toggle { display: none !important; }
          .annexe-brunel-maconnerie .zone-avant,
          .annexe-brunel-maconnerie .zone-apres { display: block !important; }
          .annexe-brunel-maconnerie .zone-grille { grid-template-columns: 1fr 1fr !important; }
          .annexe-brunel-maconnerie .zone-fig img { height: 180px; print-color-adjust: exact; }
        }
      </style>
      <div id="lightbox-brunel-maco" role="dialog" aria-modal="true" aria-label="Visionneuse plein écran">
        <button type="button" class="lb-close" id="lightbox-brunel-maco-close">Fermer</button>
        <img id="lightbox-brunel-maco-img" src="" alt="" />
        <p class="lb-caption" id="lightbox-brunel-maco-caption"></p>
      </div>
      <script>
        (function () {
          var root = document.getElementById("annexe-maconnerie-brunel");
          if (!root) return;
          root.querySelectorAll(".zone-comparative").forEach(function (zone) {
            zone.querySelectorAll(".zone-btn").forEach(function (btn) {
              btn.addEventListener("click", function () {
                var mode = btn.getAttribute("data-mode-cible") || "cote";
                zone.setAttribute("data-mode", mode);
                zone.querySelectorAll(".zone-btn").forEach(function (b) {
                  b.classList.toggle("active", b === btn);
                });
              });
            });
          });
          var lb = document.getElementById("lightbox-brunel-maco");
          var img = document.getElementById("lightbox-brunel-maco-img");
          var cap = document.getElementById("lightbox-brunel-maco-caption");
          var closeBtn = document.getElementById("lightbox-brunel-maco-close");
          function openLb(src, label) {
            img.src = src;
            img.alt = label || "";
            cap.textContent = label || "";
            lb.classList.add("open");
            document.body.style.overflow = "hidden";
          }
          function closeLb() {
            lb.classList.remove("open");
            img.removeAttribute("src");
            document.body.style.overflow = "";
          }
          root.querySelectorAll("[data-lightbox-src]").forEach(function (el) {
            el.addEventListener("click", function () {
              openLb(el.getAttribute("data-lightbox-src"), el.getAttribute("data-lightbox-label") || "");
            });
          });
          closeBtn.addEventListener("click", closeLb);
          lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
          document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && lb.classList.contains("open")) closeLb();
          });
        })();
      </script>
    </section>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
