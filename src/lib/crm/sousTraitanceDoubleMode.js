/**
 * Double mode sous-traitance — tous les corps d’état BTP du catalogue.
 * Fourniture+Pose vs Pose seule (achat matériel direct ENERGIA).
 * Les PU client / tarifs fermes DualSun ne sont jamais réécrits ici.
 */

export const MODE_FOURNITURE_POSE = "fourniture_pose";
export const MODE_POSE_SEULE = "pose_seule";

export const MENTION_SOUS_TRAITANCE_AUTOLIQUIDATION =
  "Sous-traitance de travaux de bâtiment — TVA autoliquidée par le preneur assujetti (Article 283-2 nonies du Code Général des Impôts)";

/** Catégories hors sous-traitance artisan (études / honoraires ENERGIA / achat usine ferme). */
export const CATEGORIES_HORS_SOUS_TRAITANCE = [
  "etude-accompagnement",
  "frais-administratifs-coordination",
  "cuisines-agencement-italien",
];

export const CATEGORIES_STRATEGIQUES_DOUBLE_MODE = [
  {
    id: "isolation",
    ordre: 7,
    label: "07 — Isolation",
    categorieIds: ["isolation"],
    familleIds: ["isolation"],
    exemples: ["Combles perdus R≥7", "Planchers bas R≥3", "ITE"],
  },
  {
    id: "menuiserie",
    ordre: 9,
    label: "09 — Menuiserie",
    categorieIds: ["menuiserie", "double-vitrage"],
    familleIds: ["menuiseries"],
    exemples: ["Fenêtres PVC Uw≤1,30", "Portes d’entrée Ud≤1,50", "Volets solaires"],
  },
  {
    id: "pac",
    ordre: 23,
    label: "23 / 06 — Pompe à chaleur",
    categorieIds: ["pompe-a-chaleur", "chauffage"],
    familleIds: ["chauffage"],
    exemples: ["PAC Air/Eau Haute Température", "PAC Air/Air"],
  },
  {
    id: "ecs-vmc",
    ordre: null,
    label: "Chauffe-eau & Ventilation",
    categorieIds: ["plomberie-sanitaire", "electricite"],
    familleIds: ["ecs", "ventilation"],
    exemples: ["Ballon thermodynamique 250 L", "VMC simple flux Hygro B"],
  },
];

/** Ratios marché 2026 — parts du prix de vente / médian HT. Somme ≈ 100 %. */
export const RATIOS_MARCHE_2026 = {
  materiel_lourd: { materiel: 0.6, pose: 0.22, marge: 0.18 },
  second_oeuvre: { materiel: 0.28, pose: 0.5, marge: 0.22 },
  menuiseries: { materiel: 0.45, pose: 0.275, marge: 0.275 },
  electricite: { materiel: 0.38, pose: 0.42, marge: 0.2 },
  isolation: { materiel: 0.4, pose: 0.38, marge: 0.22 },
};

export const PROFIL_RATIO_PAR_CATEGORIE = {
  photovoltaique: "materiel_lourd",
  "pompe-a-chaleur": "materiel_lourd",
  chauffage: "materiel_lourd",
  climatisation: "materiel_lourd",
  "poele-bois-granules": "materiel_lourd",
  "mobilite-electrique": "materiel_lourd",
  "chauffe-eau-solaire": "materiel_lourd",
  peinture: "second_oeuvre",
  "plafonds-tendus": "second_oeuvre",
  carrelage: "second_oeuvre",
  maconnerie: "second_oeuvre",
  demolition: "second_oeuvre",
  "ravalement-facade": "second_oeuvre",
  terrassement: "second_oeuvre",
  paysagisme: "second_oeuvre",
  toiture: "second_oeuvre",
  charpente: "second_oeuvre",
  piscine: "second_oeuvre",
  "renovation-globale": "second_oeuvre",
  menuiserie: "menuiseries",
  "menuiserie-interieure": "menuiseries",
  "double-vitrage": "menuiseries",
  serrurerie: "menuiseries",
  vitrerie: "menuiseries",
  plomberie: "menuiseries",
  "plomberie-sanitaire": "menuiseries",
  electricite: "electricite",
  isolation: "isolation",
};

const HORS_ST = new Set(CATEGORIES_HORS_SOUS_TRAITANCE);
const IDS_INTERNES = new Set([
  "pv-frais-clyve",
  "pv-coordination-energia",
  "compat-audit_etude",
  "compat-coordination_pilotage",
  "compat-frais_administratifs",
  "compat-aleas_techniques",
  "demo-coordination-amo",
]);

function texte(item) {
  return `${item?.categorieId || ""} ${item?.familleId || ""} ${item?.sousCategorieId || ""} ${item?.nom || ""} ${item?.specifications || ""} ${item?.id || ""} ${item?.prestationId || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function estCategorieStrategique(categorieId) {
  return CATEGORIES_STRATEGIQUES_DOUBLE_MODE.some((g) => g.categorieIds.includes(categorieId));
}

export function estCategorieDoubleMode(categorieId) {
  return Boolean(categorieId) && !HORS_ST.has(categorieId);
}

export function groupeStrategiqueDe(item = {}) {
  const t = texte(item);
  if (item.familleId === "isolation" || item.categorieId === "isolation" || /comble|plancher|ite|isolation par l.exterieur/.test(t)) {
    return CATEGORIES_STRATEGIQUES_DOUBLE_MODE[0];
  }
  if (
    item.familleId === "menuiseries" ||
    item.categorieId === "menuiserie" ||
    item.categorieId === "double-vitrage" ||
    /fenetre|menuiser|porte d.entree|volet/.test(t)
  ) {
    return CATEGORIES_STRATEGIQUES_DOUBLE_MODE[1];
  }
  if (item.categorieId === "pompe-a-chaleur" || /(?:^|[^a-z])pac(?:[^a-z]|$)|pompe a chaleur|air\/eau|air-eau|air\/air/.test(t)) {
    return CATEGORIES_STRATEGIQUES_DOUBLE_MODE[2];
  }
  if (
    item.familleId === "ecs" ||
    item.familleId === "ventilation" ||
    (/ballon|cet|thermodynamique|ecs|eau chaude/.test(t) && item.categorieId !== "photovoltaique") ||
    /vmc/.test(t)
  ) {
    return CATEGORIES_STRATEGIQUES_DOUBLE_MODE[3];
  }
  return null;
}

export function estPosteHorsSousTraitanceDoubleMode(item = {}) {
  const id = item.id || item.prestationId || "";
  if (IDS_INTERNES.has(id)) return true;
  if (HORS_ST.has(item.categorieId)) return true;
  return /energia|contractant g|coordination|honoraires|clyve/.test(`${item.nom || ""} ${item.artisan || ""} ${id}`);
}

export function estPrestationDoubleMode(item = {}) {
  if (!item || estPosteHorsSousTraitanceDoubleMode(item)) return false;
  if (item.categorieId) return estCategorieDoubleMode(item.categorieId);
  if (
    item.familleId &&
    ["isolation", "menuiseries", "ventilation", "chauffage", "ecs", "solaire"].includes(item.familleId)
  ) {
    return true;
  }
  const t = texte(item);
  return /peinture|carrel|toiture|charpente|plomb|elec|irve|borne|poele|facade|terrasse|paysag|vitr|serrur|demol|pac|isol|fenetre|menuiser|ballon|vmc|photovolta|dualsun|enphase/.test(
    t,
  );
}

export function profilRatioDe(item = {}, enrichi = null) {
  const fromJson = enrichi?.profilParCategorie?.[item.categorieId];
  if (fromJson && RATIOS_MARCHE_2026[fromJson]) return fromJson;
  return PROFIL_RATIO_PAR_CATEGORIE[item.categorieId] || "second_oeuvre";
}

export function ratiosDeProfil(profilId, enrichi = null) {
  const json = enrichi?.ratiosMarche2026?.[profilId];
  if (json && Number.isFinite(json.materiel) && Number.isFinite(json.pose)) return json;
  return RATIOS_MARCHE_2026[profilId] || RATIOS_MARCHE_2026.second_oeuvre;
}

export function baseChiffrageHt(prestation) {
  const vente = Number(prestation?.prixVenteHt);
  if (Number.isFinite(vente) && vente > 0) return round2(vente);
  const median = Number(prestation?.referenceMarche?.priceMedianHT);
  if (Number.isFinite(median) && median > 0) return round2(median);
  return null;
}

export function extraMargeAchatDirectHt({
  coutFourniturePoseHt = null,
  coutMaterielDirectHt = null,
  coutPoseRgeHt = null,
} = {}) {
  if (coutFourniturePoseHt == null) return null;
  const mat = Number(coutMaterielDirectHt);
  const pose = Number(coutPoseRgeHt);
  if (!Number.isFinite(mat) && !Number.isFinite(pose)) return null;
  const revient = round2((Number.isFinite(mat) ? mat : 0) + (Number.isFinite(pose) ? pose : 0));
  return round2(Number(coutFourniturePoseHt) - revient);
}

export function trouverOverlayEnrichi(item, enrichi) {
  const lignes = Array.isArray(enrichi?.prestations) ? enrichi.prestations : [];
  const t = texte(item);
  const groupe = groupeStrategiqueDe(item);
  return (
    lignes.find((overlay) => {
      if (overlay.categorieId && item.categorieId && overlay.categorieId !== item.categorieId) {
        if (!groupe?.categorieIds.includes(overlay.categorieId)) return false;
      }
      const mots = Array.isArray(overlay.motsCles) ? overlay.motsCles : [];
      return mots.some((mot) => mot && t.includes(String(mot).toLowerCase()));
    }) || null
  );
}

function decomposerParRatios(prestation, enrichi) {
  const base = baseChiffrageHt(prestation);
  if (base == null) return null;
  const profil = profilRatioDe(prestation, enrichi);
  const ratios = ratiosDeProfil(profil, enrichi);
  const materiel = round2(base * Number(ratios.materiel));
  const pose = round2(base * Number(ratios.pose));
  return {
    coutMaterielDirectHt: materiel,
    coutPoseRgeHt: pose,
    coutFourniturePoseHt: round2(materiel + pose),
    profil,
  };
}

export function enrichirPrestationDoubleMode(prestation, enrichi) {
  if (!prestation || !estPrestationDoubleMode(prestation)) {
    return prestation;
  }
  const overlay = trouverOverlayEnrichi(prestation, enrichi);
  const mode =
    prestation.modeSousTraitance === MODE_POSE_SEULE || prestation.modeSousTraitance === MODE_FOURNITURE_POSE
      ? prestation.modeSousTraitance
      : overlay?.modeSousTraitanceDefaut || MODE_FOURNITURE_POSE;
  const id = String(prestation.id || "");
  const ratios = /^(pv-dualsun|pv-enphase|pv-huawei|pv-pylontech|demo-)/.test(id)
    ? null
    : decomposerParRatios(prestation, enrichi);
  return {
    ...prestation,
    modeSousTraitance: mode,
    coutFourniturePoseHt:
      prestation.coutFourniturePoseHt ?? overlay?.coutFourniturePoseHt ?? ratios?.coutFourniturePoseHt ?? null,
    coutMaterielHt: prestation.coutMaterielHt ?? overlay?.coutMaterielDirectHt ?? ratios?.coutMaterielDirectHt ?? null,
    coutMainOeuvreHt: prestation.coutMainOeuvreHt ?? overlay?.coutPoseRgeHt ?? ratios?.coutPoseRgeHt ?? null,
  };
}

export function extraMargePrestation(prestation) {
  if (prestation?.modeSousTraitance !== MODE_POSE_SEULE) return 0;
  return (
    extraMargeAchatDirectHt({
      coutFourniturePoseHt: prestation.coutFourniturePoseHt,
      coutMaterielDirectHt: prestation.coutMaterielHt,
      coutPoseRgeHt: prestation.coutMainOeuvreHt,
    }) ?? 0
  );
}

export function margeVsBaseHt(prestation) {
  const base = baseChiffrageHt(prestation);
  if (base == null) return null;
  const mat = Number(prestation?.coutMaterielHt);
  const pose = Number(prestation?.coutMainOeuvreHt);
  const forfait = Number(prestation?.coutFourniturePoseHt);
  const revientPose = (Number.isFinite(mat) ? mat : 0) + (Number.isFinite(pose) ? pose : 0);
  const revientFourniture = Number.isFinite(forfait) ? forfait : revientPose;
  const revient = prestation?.modeSousTraitance === MODE_POSE_SEULE ? revientPose : revientFourniture;
  if (!Number.isFinite(revient) || revient <= 0) return null;
  return round2(base - revient);
}
