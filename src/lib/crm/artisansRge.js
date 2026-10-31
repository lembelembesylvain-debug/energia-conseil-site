/**
 * Annuaire artisans RGE partenaires + grilles de sous-traitance (fourniture+pose vs pose seule).
 * Les PU client (devis) ne sont jamais réécrits ici — uniquement les coûts internes CG.
 */

import seedJson from "./artisans-rge-referentiel.json" with { type: "json" };

export const ARTISANS_RGE_STORAGE_KEY = "energia-crm-artisans-rge-v1";
export const MODE_FOURNITURE_POSE = "fourniture_pose";
export const MODE_POSE_SEULE = "pose_seule";
export const MENTION_AUTOLIQUIDATION_TVA =
  "Sous-traitance de travaux de bâtiment — TVA autoliquidée par le preneur assujetti (Article 283-2 nonies du Code Général des Impôts)";
export const ARTICLE_CGI_AUTOLIQUIDATION = "Art. 283-2 nonies du CGI";

/** Fallback si le référentiel JSON est absent ou invalide. */
export const REFERENTIEL_VIDE = Object.freeze({
  version: 1,
  annee: 2026,
  mentionAutoliquidation: MENTION_AUTOLIQUIDATION_TVA,
  articleCgi: ARTICLE_CGI_AUTOLIQUIDATION,
  contractantGeneral: {
    nom: "Sylvain LEMBELEMBE",
    role: "Contractant Général",
    entreprise: "ENERGIA-CONSEIL IA®",
    telephone: "06 10 59 68 98",
    email: "contact@energia-conseil-ia.com",
  },
  artisans: [],
});

export const REFERENTIEL_SEED =
  seedJson && Array.isArray(seedJson.artisans) ? seedJson : REFERENTIEL_VIDE;

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function referentielParDefaut() {
  return clone(REFERENTIEL_SEED);
}

function lireOverlay() {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(ARTISANS_RGE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.artisans)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function chargerReferentiel() {
  const base = referentielParDefaut();
  const overlay = lireOverlay();
  if (!overlay?.artisans?.length) return base;
  const parId = new Map(base.artisans.map((a) => [a.id, a]));
  for (const artisan of overlay.artisans) {
    if (artisan?.id) parId.set(artisan.id, { ...parId.get(artisan.id), ...artisan });
  }
  return {
    ...base,
    ...overlay,
    artisans: [...parId.values()],
    mentionAutoliquidation: overlay.mentionAutoliquidation || base.mentionAutoliquidation,
  };
}

export function enregistrerReferentiel(referentiel) {
  const payload = {
    version: 1,
    annee: 2026,
    mentionAutoliquidation: referentiel?.mentionAutoliquidation || MENTION_AUTOLIQUIDATION_TVA,
    articleCgi: referentiel?.articleCgi || ARTICLE_CGI_AUTOLIQUIDATION,
    contractantGeneral: referentiel?.contractantGeneral || REFERENTIEL_SEED.contractantGeneral,
    artisans: Array.isArray(referentiel?.artisans) ? referentiel.artisans : chargerReferentiel().artisans,
  };
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(ARTISANS_RGE_STORAGE_KEY, JSON.stringify(payload));
  }
  return payload;
}

export function listerArtisans(referentiel = chargerReferentiel()) {
  return Array.isArray(referentiel?.artisans) ? referentiel.artisans : [];
}

export function artisanParId(id, referentiel = chargerReferentiel()) {
  return listerArtisans(referentiel).find((a) => a.id === id) || null;
}

export function estPosteHorsSousTraitance(ligne) {
  const nom = `${ligne?.nom || ""} ${ligne?.artisan || ""}`;
  return /energia|contractant g|coordination|honoraires/i.test(nom);
}

export function resoudreArtisanPourLigne(ligne, artisans = listerArtisans()) {
  if (estPosteHorsSousTraitance(ligne)) return null;
  if (ligne?.artisanId) {
    return artisans.find((a) => a.id === ligne.artisanId) || null;
  }
  const nom = String(ligne?.artisan || "");
  if (/c2l/i.test(nom)) return artisans.find((a) => a.id === "c2l-isolation") || null;
  if (/amarante|bonheur/i.test(nom)) return artisans.find((a) => a.id === "bonheur-amarante") || null;
  if (/smn/i.test(nom)) return artisans.find((a) => a.id === "smn-energies") || null;
  return null;
}

function texteLigne(ligne) {
  return `${ligne?.nom || ""} ${ligne?.specifications || ""} ${ligne?.familleId || ""}`.toLowerCase();
}

function quantiteSousTraitance(ligne, grille) {
  const q = Math.max(0, Number(ligne?.quantite) || 0);
  const uniteGrille = String(grille?.unite || "").toLowerCase();
  if (uniteGrille === "forfait") return q > 0 ? 1 : 0;
  return q;
}

export function resoudreGrille(ligne, artisan) {
  if (!artisan) return null;
  const grilles = Array.isArray(artisan.grilles) ? artisan.grilles : [];
  if (ligne?.grilleMetierId) {
    const cible = grilles.find((g) => g.id === ligne.grilleMetierId);
    if (cible) return cible;
  }
  const texte = texteLigne(ligne);
  const parMot = grilles.find((g) =>
    (g.motsCles || []).some((mot) => mot && texte.includes(String(mot).toLowerCase())),
  );
  if (parMot) return parMot;
  if (ligne?.familleId) {
    const parFamille = grilles.find((g) => g.familleId === ligne.familleId);
    if (parFamille) return parFamille;
  }
  return grilles[0] || null;
}

export function artisansEligiblesPourLigne(ligne, artisans = listerArtisans()) {
  if (estPosteHorsSousTraitance(ligne)) return [];
  const texte = texteLigne(ligne);
  return artisans.filter((artisan) => {
    const grilles = Array.isArray(artisan.grilles) ? artisan.grilles : [];
    return grilles.some(
      (g) =>
        (g.motsCles || []).some((mot) => mot && texte.includes(String(mot).toLowerCase())) ||
        (ligne?.familleId && g.familleId === ligne.familleId),
    );
  });
}

export function patchTarifsDepuisArtisan(ligne, artisanId, referentiel = chargerReferentiel()) {
  const artisan = artisanParId(artisanId, referentiel);
  if (!artisan) {
    return {
      ...ligne,
      artisanId: "",
      grilleMetierId: "",
    };
  }
  const grille = resoudreGrille(ligne, artisan);
  return {
    ...ligne,
    artisanId: artisan.id,
    artisan: artisan.enseigne || artisan.raisonSociale,
    grilleMetierId: grille?.id || "",
    fourniturePosePuHt: grille?.fourniturePosePuHt ?? ligne.fourniturePosePuHt ?? null,
    poseSeulePuHt: grille?.poseSeulePuHt ?? ligne.poseSeulePuHt ?? null,
    materielDirectPuHt: grille?.materielDirectPuHt ?? ligne.materielDirectPuHt ?? null,
    modeSousTraitance: ligne.modeSousTraitance || artisan.modeDefaut || MODE_FOURNITURE_POSE,
  };
}

export function decomposerLigneSousTraitance(ligne, referentiel = chargerReferentiel()) {
  const artisans = listerArtisans(referentiel);
  const artisan = resoudreArtisanPourLigne(ligne, artisans);
  if (!artisan) {
    return {
      applicable: false,
      artisan: null,
      grille: null,
      mode: ligne?.modeSousTraitance || MODE_FOURNITURE_POSE,
      venteHt: round2(ligne?.totalHt || 0),
      quantite: Number(ligne?.quantite) || 0,
      coutFourniturePoseHt: null,
      coutPoseSeuleHt: null,
      coutMaterielDirectHt: null,
      coutRevientHt: null,
      margeBruteHt: null,
      extraMargeAchatDirectHt: null,
      extraMargeActive: false,
    };
  }
  const grille = resoudreGrille(ligne, artisan);
  const q = quantiteSousTraitance(ligne, grille);
  const venteHt = round2(ligne?.totalHt || 0);
  const puA = Number(ligne?.fourniturePosePuHt ?? grille?.fourniturePosePuHt) || 0;
  const puPose = Number(ligne?.poseSeulePuHt ?? grille?.poseSeulePuHt) || 0;
  const puMat = Number(ligne?.materielDirectPuHt ?? grille?.materielDirectPuHt) || 0;
  const coutFourniturePoseHt =
    ligne?.coutFourniturePoseSaisiHt != null && Number.isFinite(Number(ligne.coutFourniturePoseSaisiHt))
      ? round2(Number(ligne.coutFourniturePoseSaisiHt))
      : round2(q * puA);
  const coutPoseSeuleHt =
    ligne?.coutPoseArtisanSaisiHt != null && Number.isFinite(Number(ligne.coutPoseArtisanSaisiHt))
      ? round2(Number(ligne.coutPoseArtisanSaisiHt))
      : round2(q * puPose);
  const coutMaterielDirectHt =
    ligne?.coutMaterielDirectSaisiHt != null && Number.isFinite(Number(ligne.coutMaterielDirectSaisiHt))
      ? round2(Number(ligne.coutMaterielDirectSaisiHt))
      : round2(q * puMat);
  const coutRevientPoseSeuleHt = round2(coutPoseSeuleHt + coutMaterielDirectHt);
  const extraMargeAchatDirectHt = round2(coutFourniturePoseHt - coutRevientPoseSeuleHt);
  const mode = ligne?.modeSousTraitance === MODE_POSE_SEULE ? MODE_POSE_SEULE : MODE_FOURNITURE_POSE;
  const coutRevientHt = mode === MODE_POSE_SEULE ? coutRevientPoseSeuleHt : coutFourniturePoseHt;
  const extraMargeActive = mode === MODE_POSE_SEULE;
  return {
    applicable: true,
    artisan,
    grille,
    mode,
    venteHt,
    quantite: q,
    unite: ligne?.unite || grille?.unite || "",
    puFourniturePoseHt: puA,
    puPoseSeuleHt: puPose,
    puMaterielDirectHt: puMat,
    coutFourniturePoseHt,
    coutPoseSeuleHt,
    coutMaterielDirectHt,
    coutRevientPoseSeuleHt,
    coutRevientHt,
    margeBruteHt: round2(venteHt - coutRevientHt),
    extraMargeAchatDirectHt,
    extraMargeActive,
    extraMargeCaptureeHt: extraMargeActive ? extraMargeAchatDirectHt : 0,
    fourniturePar: mode === MODE_POSE_SEULE ? "ENERGIA-CONSEIL IA® (achat fabricant direct)" : artisan.raisonSociale,
  };
}

export function calculerMargesSousTraitance(travaux, referentiel = chargerReferentiel()) {
  const decompositions = (Array.isArray(travaux) ? travaux : []).map((ligne) =>
    decomposerLigneSousTraitance(ligne, referentiel),
  );
  const applicables = decompositions.filter((d) => d.applicable);
  const somme = (cle) => round2(applicables.reduce((s, d) => s + (Number(d[cle]) || 0), 0));
  return {
    lignes: decompositions,
    applicable: applicables.length,
    venteHt: somme("venteHt"),
    coutFourniturePoseHt: somme("coutFourniturePoseHt"),
    coutPoseSeuleHt: somme("coutPoseSeuleHt"),
    coutMaterielDirectHt: somme("coutMaterielDirectHt"),
    coutRevientHt: somme("coutRevientHt"),
    margeBruteHt: somme("margeBruteHt"),
    extraMargeAchatDirectPotentielleHt: somme("extraMargeAchatDirectHt"),
    extraMargeCaptureeHt: somme("extraMargeCaptureeHt"),
  };
}

export function grouperLignesParArtisan(travaux, referentiel = chargerReferentiel()) {
  const artisans = listerArtisans(referentiel);
  const groupes = new Map();
  for (const ligne of Array.isArray(travaux) ? travaux : []) {
    const artisan = resoudreArtisanPourLigne(ligne, artisans);
    if (!artisan) continue;
    if (!groupes.has(artisan.id)) {
      groupes.set(artisan.id, { artisan, lignes: [] });
    }
    groupes.get(artisan.id).lignes.push(ligne);
  }
  return [...groupes.values()];
}

export function normaliserReferentielPourSauvegarde(referentiel, role = "administrateur") {
  const payload = {
    version: 1,
    annee: 2026,
    mentionAutoliquidation: referentiel?.mentionAutoliquidation || MENTION_AUTOLIQUIDATION_TVA,
    articleCgi: referentiel?.articleCgi || ARTICLE_CGI_AUTOLIQUIDATION,
    contractantGeneral: referentiel?.contractantGeneral || REFERENTIEL_SEED.contractantGeneral,
    artisans: Array.isArray(referentiel?.artisans) ? clone(referentiel.artisans) : [],
  };
  if (role !== "administrateur") {
    payload.artisans = payload.artisans.map((artisan) => ({
      ...artisan,
      grilles: (artisan.grilles || []).map((g) => ({
        ...g,
        fourniturePosePuHt: null,
        poseSeulePuHt: null,
        materielDirectPuHt: null,
      })),
    }));
  }
  return payload;
}

export async function persisterReferentielDisque(referentiel, role = "administrateur") {
  const payload = normaliserReferentielPourSauvegarde(referentiel, role);
  enregistrerReferentiel(payload);
  try {
    const res = await fetch("/api/sauvegarde-artisans-rge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, referentiel: payload }),
    });
    if (!res.ok) return { ok: false, stockeFichier: false };
    return await res.json();
  } catch {
    return { ok: true, stockeFichier: false, raison: "API indisponible — sauvegarde locale uniquement." };
  }
}
