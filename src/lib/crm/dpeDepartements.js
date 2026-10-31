/** Catalogue des départements DPE — chargement live ADEME, secours JSON local. */
import { normaliserMotifDpe, normaliserStatutOccupation } from "../proptech/statutMarcheDpe";
import { chargerPassoiresAdeme, JEU_ADEME_LOGEMENTS, JEU_ADEME_TERTIAIRE, LIMITE_ADEME } from "./ademeDpe";

export const DPE_DATA_BASE = "/data/dpe";

/** Chalon-sur-Saône : filtre ADEME affiché et chargé à chaque ouverture de la carte 71. */
export const CODE_POSTAL_ADEME_DEFAUT = "71100";

export const COULEURS_DPE = {
  A: "#15803d",
  B: "#65a30d",
  C: "#eab308",
  D: "#f59e0b",
  E: "#f97316",
  F: "#ea580c",
  G: "#dc2626",
};

/** Vue d'ensemble Corse — identique pour 2A et 2B. */
export const CENTRE_CORSE_DPE = { lat: 42.0396, lng: 9.0129, zoom: 9 };

/** Dix départements du quart Est, dans l'ordre de la présélection Chalon 300 km. */
export const CODES_ZONE_CHALON_300 = ["71", "21", "69", "42", "01", "39", "25", "03", "58", "89"];

export const DEPARTEMENTS_DPE = [
  {
    code: "71",
    nom: "Saône-et-Loire",
    villePrincipale: "Base Chalon / Mâcon",
    lat: 46.7808,
    lng: 4.8539,
    zoom: 12,
  },
  {
    code: "21",
    nom: "Côte-d'Or",
    villePrincipale: "Beaune / Dijon",
    lat: 47.322,
    lng: 5.0415,
    zoom: 12,
  },
  {
    code: "69",
    nom: "Rhône",
    villePrincipale: "Lyon / Villefranche",
    lat: 45.7578,
    lng: 4.832,
    zoom: 12,
  },
  {
    code: "42",
    nom: "Loire",
    villePrincipale: "Roanne / Bussières / Nervieux",
    lat: 45.74,
    lng: 4.23,
    zoom: 9,
  },
  {
    code: "01",
    nom: "Ain",
    villePrincipale: "Bourg-en-Bresse",
    lat: 46.205,
    lng: 5.225,
    zoom: 11,
  },
  {
    code: "39",
    nom: "Jura",
    villePrincipale: "Dole / Lons",
    lat: 47.092,
    lng: 5.489,
    zoom: 10,
  },
  {
    code: "25",
    nom: "Doubs",
    villePrincipale: "Besançon",
    lat: 47.2378,
    lng: 6.0241,
    zoom: 11,
  },
  {
    code: "03",
    nom: "Allier",
    villePrincipale: "Moulins / Vichy",
    lat: 46.34,
    lng: 3.33,
    zoom: 9,
  },
  {
    code: "58",
    nom: "Nièvre",
    villePrincipale: "Nevers",
    lat: 46.9906,
    lng: 3.1628,
    zoom: 10,
  },
  {
    code: "89",
    nom: "Yonne",
    villePrincipale: "Auxerre",
    lat: 47.7982,
    lng: 3.5738,
    zoom: 10,
  },
  {
    code: "2A",
    nom: "Corse-du-Sud",
    villePrincipale: "Ajaccio / Porto-Vecchio",
    lat: CENTRE_CORSE_DPE.lat,
    lng: CENTRE_CORSE_DPE.lng,
    zoom: CENTRE_CORSE_DPE.zoom,
  },
  {
    code: "2B",
    nom: "Haute-Corse",
    villePrincipale: "Bastia / Calvi",
    lat: CENTRE_CORSE_DPE.lat,
    lng: CENTRE_CORSE_DPE.lng,
    zoom: CENTRE_CORSE_DPE.zoom,
  },
];

const COEUR_SOUVERAIN = new Set(["71", "21"]);
const BASSIN_ARTISANS = new Set(["69", "42", "01", "39"]);
const ZONE_ELARGIE = new Set(["25", "03", "58", "89"]);

/** Badge de distance depuis Chalon-sur-Saône. `null` hors du rayon 300 km. */
export function badgeProximiteChalon(code) {
  const dept = normaliserCodeDepartementDpe(code);
  if (COEUR_SOUVERAIN.has(dept)) {
    return { ton: "souverain", libelle: "Cœur Souverain · Moins de 60 km" };
  }
  if (BASSIN_ARTISANS.has(dept)) {
    return { ton: "bassin", libelle: "Bassin Artisans & Travaux · Moins de 150 km" };
  }
  if (ZONE_ELARGIE.has(dept)) {
    return { ton: "elargi", libelle: "Zone Élargie · 150 à 300 km" };
  }
  return null;
}

export const DEPARTEMENT_DPE_DEFAUT = "71";

/** Villes Corse interrogées en direct sur l'ADEME (code postal réel). */
export const VILLES_ADEME_CORSE = [
  { id: "ajaccio", nom: "Ajaccio", code: "2A", codePostal: "20000", lat: 41.9192, lng: 8.7386, zoom: 13 },
  { id: "porto-vecchio", nom: "Porto-Vecchio", code: "2A", codePostal: "20137", lat: 41.591, lng: 9.2794, zoom: 13 },
  { id: "bastia", nom: "Bastia", code: "2B", codePostal: "20200", lat: 42.6976, lng: 9.4509, zoom: 13 },
];

/** Cibles test Serge — visibles en 2A et en 2B. */
export const CIBLES_SERGE_CORSE = [
  {
    id: "2A-SERGE-AFA-001",
    typeBatiment: "individuel",
    titre: "Cible 1 — Villa Afa",
    resume: "150 m² · 1978 · DPE F · fioul/élec · EDF Agir Plus ZNI + MaPrimeRénov' · Solaire + Tesla Powerwall 3",
    lat: 41.9844,
    lng: 8.7931,
    zoom: 16,
  },
  {
    id: "2A-SERGE-PVEC-001",
    typeBatiment: "collectif",
    titre: "Cible 2 — Porto-Vecchio",
    resume: "Résidence touristique 6 lots · DPE G · PAC réversible + solaire toiture",
    lat: 41.5835,
    lng: 9.2758,
    zoom: 16,
  },
];

export const TYPES_BATIMENT_DPE = [
  {
    id: "individuel",
    label: "Maison Individuelle / Résidentiel",
    detail: "Passoires F/G, Fioul, MaPrimeRénov' Parcours Accompagné",
    icone: "🏠",
    selecteur: true,
  },
  {
    id: "collectif",
    label: "Immeuble Collectif / Copropriété & Bailleurs",
    detail: "Urgence interdiction location G/F, CEE Copro",
    icone: "🏘️",
    selecteur: true,
  },
  {
    id: "tertiaire",
    label: "Tertiaire & Industrie",
    detail: "Décret Tertiaire, Centrales Solaires toiture 100 kWc+, CEE Grand Volume",
    icone: "🏭",
    selecteur: true,
  },
  {
    id: "industriel",
    label: "Tertiaire & Industrie",
    detail: "Décret Tertiaire, Centrales Solaires toiture 100 kWc+, CEE Grand Volume",
    icone: "🏭",
    selecteur: false,
  },
];

export const TYPE_BATIMENT_DPE_DEFAUT = "individuel";

const cacheDepartements = new Map();

export function normaliserCodeDepartementDpe(code) {
  const brut = String(code ?? "").trim().toUpperCase();
  if (/^2[AB]$/.test(brut)) return brut;
  if (/^\d+$/.test(brut)) return brut.padStart(2, "0");
  return brut;
}

export function estCorseDpe(code) {
  const dept = normaliserCodeDepartementDpe(code);
  return dept === "2A" || dept === "2B";
}

export function trouverDepartementDpe(code) {
  const dept = normaliserCodeDepartementDpe(code);
  return DEPARTEMENTS_DPE.find((item) => item.code === dept) ?? null;
}

export function libelleOptionDepartement(dept) {
  return `${dept.code} — ${dept.nom} (${dept.villePrincipale})`;
}

export function trouverTypeBatimentDpe(id) {
  return TYPES_BATIMENT_DPE.find((item) => item.id === id) ?? TYPES_BATIMENT_DPE[0];
}

export function libelleOptionTypeBatiment(type) {
  if (!type?.detail) return type?.label ?? "";
  return `${type.label} (${type.detail})`;
}

export function urlJsonDepartement(code, typeBatiment = TYPE_BATIMENT_DPE_DEFAUT) {
  const cle = normaliserCodeDepartementDpe(code);
  if (!typeBatiment || typeBatiment === "individuel") {
    return `${DPE_DATA_BASE}/${cle}.json`;
  }
  return `${DPE_DATA_BASE}/${cle}-${typeBatiment}.json`;
}

function extraireListe(brut) {
  if (Array.isArray(brut)) return brut;
  if (Array.isArray(brut?.logements)) return brut.logements;
  if (Array.isArray(brut?.dpe)) return brut.dpe;
  return [];
}

function nombre(valeur) {
  const n = Number(valeur);
  return Number.isFinite(n) ? n : null;
}

export function normaliserLogementDpe(brut, index = 0) {
  if (!brut || typeof brut !== "object") return null;
    const geopoint = String(brut?._geopoint || brut?.geopoint || "");
  const [geoLat, geoLng] = geopoint.split(",").map((part) => Number(part.trim()));
  const etiquette = String(
    brut?.etiquette_dpe || brut?.Etiquette_DPE || brut?.etiquette || "",
  )
    .trim()
    .toUpperCase();

  return {
    id: String(brut.id || brut["N°DPE"] || brut.numero_dpe || `dpe-${index}`),
    adresse: String(brut.adresse || brut["Adresse_(BAN)"] || "").trim(),
    commune: String(brut.commune || brut["Nom__commune_(BAN)"] || "").trim(),
    codePostal: String(brut.code_postal || brut["Code_postal_(BAN)"] || "").trim(),
    etiquette: COULEURS_DPE[etiquette] ? etiquette : "G",
    surface: nombre(brut.surface_habitable || brut.Surface_habitable_logement),
    annee: nombre(brut.annee_construction || brut["Année_construction"]),
    type: String(brut.type_batiment || brut["Type_bâtiment"] || "maison").trim(),
    niveaux: nombre(brut.niveaux ?? brut.nb_niveaux ?? brut.nombre_niveaux),
    nbLots: nombre(brut.nb_lots),
    dpeImmeuble: String(brut.dpe_immeuble || etiquette).trim().toUpperCase() || etiquette,
    decretTertiaire: String(brut.decret_tertiaire || "").trim(),
    activite: String(brut.activite || "").trim(),
    potentielPvKwc: nombre(brut.potentiel_pv_kwc),
    aides: String(brut.aides || "").trim(),
    offre: String(brut.offre || "").trim(),
    cibleSerge: brut.cible_serge === true,
    lat: nombre(brut.lat ?? brut.latitude ?? geoLat),
    lng: nombre(brut.lng ?? brut.longitude ?? brut.lon ?? geoLng),
    conso: nombre(brut.conso_energie || brut["Conso_5_usages_é_finale"]),
    chauffage: String(
      brut.type_chauffage || brut["Type_énergie_principale_chauffage"] || "",
    ).trim(),
    motifDpe: normaliserMotifDpe(brut.motif_dpe ?? brut.motifDpe),
    statutOccupation: normaliserStatutOccupation(
      brut.statut_occupation ?? brut.statutOccupation,
    ),
    dateDpe: dateIso(brut.date_dpe ?? brut.dateDpe ?? brut.date_etablissement_dpe),
    couvertureDixAns: Number(brut.couverture_dvf_ans) >= 10,
    mutationsDvf: normaliserMutationsLocales(brut.mutations_dvf ?? brut.mutationsDvf),
  };
}

function dateIso(valeur) {
  const brut = String(valeur || "").slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(brut) ? brut : null;
}

function normaliserMutationsLocales(liste) {
  if (!Array.isArray(liste)) return [];
  return liste
    .map((item) => ({
      date: dateIso(item?.date),
      prixNet: nombre(item?.prix_net ?? item?.prixNet),
      prixM2: nombre(item?.prix_m2 ?? item?.prixM2),
      surfaceM2: nombre(item?.surface_m2 ?? item?.surfaceM2),
      surParcelle: item?.sur_parcelle === false || item?.surParcelle === false ? false : true,
    }))
    .filter((item) => item.date);
}

export function normaliserPayloadDpe(code, brut) {
  const meta = trouverDepartementDpe(code);
  const ville = brut?.villePrincipale ?? {};
  return {
    departement: String(brut?.departement || code),
    nom: String(brut?.nom || meta?.nom || `Département ${code}`),
    source: String(brut?.source || ""),
    live: brut?.live === true,
    codePostal: String(brut?.codePostal || ""),
    totalZone: Number(brut?.totalZone) || 0,
    villePrincipale: {
      nom: String(ville.nom || meta?.villePrincipale || ""),
      lat: nombre(ville.lat) ?? meta?.lat ?? 46.6,
      lng: nombre(ville.lng) ?? meta?.lng ?? 4.8,
      zoom: nombre(ville.zoom) ?? meta?.zoom ?? 12,
    },
    logements: extraireListe(brut)
      .map(normaliserLogementDpe)
      .filter((item) => item?.lat != null && item?.lng != null),
  };
}

function libelleSourceAdeme(typeBatiment, codePostal, totalZone, dataset) {
  const zone = codePostal ? `code postal ${codePostal}` : "département";
  const jeu = dataset === JEU_ADEME_TERTIAIRE ? "DPE tertiaire" : "DPE logements existants";
  const plafond = Math.min(LIMITE_ADEME, Number(totalZone) || 0);
  return `ADEME ${jeu} (${dataset}) — ${plafond.toLocaleString("fr-FR")} passoires F/G affichées sur ${Number(totalZone).toLocaleString("fr-FR")} certifiées (${zone}, ${typeBatiment}).`;
}

async function chargerJsonLocal(dept, type, signal) {
  const reponse = await fetch(urlJsonDepartement(dept, type), { signal });
  if (reponse.status === 404 && trouverDepartementDpe(dept)) {
    return normaliserPayloadDpe(dept, {
      departement: dept,
      logements: [],
      live: false,
      source: "ADEME injoignable et aucun extrait local pour ce couple département / type",
    });
  }
  if (!reponse.ok) {
    throw new Error(`Secours local impossible (${reponse.status}).`);
  }
  const brut = await reponse.json();
  const payload = normaliserPayloadDpe(dept, brut);
  payload.live = false;
  payload.source = payload.source
    ? `${payload.source} — secours local, ADEME injoignable`
    : "Secours local — ADEME injoignable";
  return payload;
}

export async function chargerDpeDepartement(
  code,
  { signal, ignorerCache = false, typeBatiment = TYPE_BATIMENT_DPE_DEFAUT, codePostal = "" } = {},
) {
  const dept = normaliserCodeDepartementDpe(code);
  const type = trouverTypeBatimentDpe(typeBatiment).id;
  const cp = String(codePostal || "").trim();
  const cle = `${dept}:${type}:${cp}`;
  if (!ignorerCache && cacheDepartements.has(cle)) {
    return cacheDepartements.get(cle);
  }

  try {
    const ademe = await chargerPassoiresAdeme({
      codeDepartement: dept,
      codePostal: cp,
      typeBatiment: type,
      signal,
    });
    const meta = trouverDepartementDpe(dept);
    const payload = normaliserPayloadDpe(dept, {
      departement: dept,
      nom: meta?.nom || `Département ${dept}`,
      live: true,
      codePostal: cp,
      totalZone: ademe.totalZone,
      source: libelleSourceAdeme(type, cp, ademe.totalZone, ademe.dataset),
      villePrincipale: cp
        ? {
            nom: cp,
            lat: meta?.lat,
            lng: meta?.lng,
            zoom: 13,
          }
        : undefined,
      logements: ademe.logements,
    });
    cacheDepartements.set(cle, payload);
    return payload;
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    const local = await chargerJsonLocal(dept, type, signal);
    cacheDepartements.set(cle, local);
    return local;
  }
}

export { JEU_ADEME_LOGEMENTS, LIMITE_ADEME };
