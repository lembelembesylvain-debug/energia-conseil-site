/** Catalogue des départements DPE — un fichier JSON par code INSEE. */
import { normaliserMotifDpe, normaliserStatutOccupation } from "../proptech/statutMarcheDpe";

export const DPE_DATA_BASE = "/data/dpe";

export const COULEURS_DPE = {
  A: "#15803d",
  B: "#65a30d",
  C: "#eab308",
  D: "#f59e0b",
  E: "#f97316",
  F: "#ea580c",
  G: "#dc2626",
};

export const DEPARTEMENTS_DPE = [
  {
    code: "21",
    nom: "Côte-d'Or",
    villePrincipale: "Dijon",
    lat: 47.322,
    lng: 5.0415,
    zoom: 12,
  },
  {
    code: "69",
    nom: "Rhône",
    villePrincipale: "Lyon",
    lat: 45.7578,
    lng: 4.832,
    zoom: 12,
  },
  {
    code: "71",
    nom: "Saône-et-Loire",
    villePrincipale: "Chalon-sur-Saône",
    lat: 46.7808,
    lng: 4.8539,
    zoom: 12,
  },
];

export const DEPARTEMENT_DPE_DEFAUT = "71";

export const TYPES_BATIMENT_DPE = [
  { id: "individuel", label: "Maison individuelle", icone: "🏠" },
  { id: "collectif", label: "Logement collectif", icone: "🏢" },
  { id: "tertiaire", label: "Tertiaire", icone: "🏬" },
  { id: "industriel", label: "Industriel", icone: "🏭" },
];

export const TYPE_BATIMENT_DPE_DEFAUT = "individuel";

const cacheDepartements = new Map();

export function trouverDepartementDpe(code) {
  return DEPARTEMENTS_DPE.find((item) => item.code === String(code)) ?? null;
}

export function trouverTypeBatimentDpe(id) {
  return TYPES_BATIMENT_DPE.find((item) => item.id === id) ?? TYPES_BATIMENT_DPE[0];
}

export function urlJsonDepartement(code, typeBatiment = TYPE_BATIMENT_DPE_DEFAUT) {
  const cle = String(code).padStart(2, "0");
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
  const geopoint = String(brut._geopoint || brut.geopoint || "");
  const [geoLat, geoLng] = geopoint.split(",").map((part) => Number(part.trim()));
  const etiquette = String(
    brut.etiquette_dpe || brut.Etiquette_DPE || brut.etiquette || "",
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
    nbLots: nombre(brut.nb_lots),
    dpeImmeuble: String(brut.dpe_immeuble || etiquette).trim().toUpperCase() || etiquette,
    decretTertiaire: String(brut.decret_tertiaire || "").trim(),
    activite: String(brut.activite || "").trim(),
    potentielPvKwc: nombre(brut.potentiel_pv_kwc),
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
  };
}

export function normaliserPayloadDpe(code, brut) {
  const meta = trouverDepartementDpe(code);
  const ville = brut?.villePrincipale ?? {};
  return {
    departement: String(brut?.departement || code),
    nom: String(brut?.nom || meta?.nom || `Département ${code}`),
    source: String(brut?.source || ""),
    villePrincipale: {
      nom: String(ville.nom || meta?.villePrincipale || ""),
      lat: nombre(ville.lat) ?? meta?.lat ?? 46.6,
      lng: nombre(ville.lng) ?? meta?.lng ?? 4.8,
      zoom: nombre(ville.zoom) ?? meta?.zoom ?? 12,
    },
    logements: extraireListe(brut)
      .map(normaliserLogementDpe)
      .filter((item) => item.lat != null && item.lng != null),
  };
}

export async function chargerDpeDepartement(
  code,
  { signal, ignorerCache = false, typeBatiment = TYPE_BATIMENT_DPE_DEFAUT } = {},
) {
  const dept = String(code).padStart(2, "0");
  const type = trouverTypeBatimentDpe(typeBatiment).id;
  const cle = `${dept}:${type}`;
  if (!ignorerCache && cacheDepartements.has(cle)) {
    return cacheDepartements.get(cle);
  }

  const reponse = await fetch(urlJsonDepartement(dept, type), { signal });
  if (!reponse.ok) {
    throw new Error(`Impossible de charger ${urlJsonDepartement(dept, type)} (${reponse.status}).`);
  }

  const brut = await reponse.json();
  const payload = normaliserPayloadDpe(dept, brut);
  cacheDepartements.set(cle, payload);
  return payload;
}
