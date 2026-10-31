/**
 * Couche DVF — Demandes de valeurs foncières (DGFiP / Etalab).
 * API ouverte de réutilisation du millésime geo-DVF (même base que data.gouv.fr).
 * Filtre : 5 dernières années, parcelle puis rue.
 */

export const URL_DVF_ETALAB = "https://api.cquest.org/dvf";
export const URL_GEO_DVF = "https://files.data.gouv.fr/geo-dvf/latest/csv";
export const DVF_ATTRIBUTION = "DVF — DGFiP / Etalab (données ouvertes)";

const ENTETES = {
  Accept: "application/json",
  "User-Agent": "ENERGIA-CONSEIL-IA/proptech-dvf",
};

function anneeMutation(item) {
  const brut = item?.date_mutation || item?.date || "";
  const d = new Date(String(brut).slice(0, 10));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function dansLesCinqDernieresAnnees(item, maintenant = new Date()) {
  const d = anneeMutation(item);
  if (!d) return false;
  const cutoff = new Date(maintenant);
  cutoff.setFullYear(cutoff.getFullYear() - 5);
  return d >= cutoff && d <= maintenant;
}

export function prixM2Mutation(item) {
  const prix = Number(String(item?.valeur_fonciere ?? item?.valeur ?? "").replace(/\s/g, "").replace(",", "."));
  const surface = Number(item?.surface_reelle_bati ?? item?.surface_reelle ?? item?.surface);
  if (!Number.isFinite(prix) || prix <= 0) return null;
  if (!Number.isFinite(surface) || surface <= 0) return null;
  return Math.round(prix / surface);
}

function idParcelle(item) {
  return String(item?.id_parcelle || item?.id_parcelle_cadastre || item?.code_parcelle || "").replace(/\s/g, "").toUpperCase();
}

function voieNorm(item) {
  return `${item?.adresse_numero || item?.numero_voie || ""} ${item?.adresse_nom_voie || item?.voie || item?.nom_voie || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normaliserMutationDvf(item) {
  const date = anneeMutation(item);
  const prix = Number(String(item?.valeur_fonciere ?? "").replace(/\s/g, "").replace(",", "."));
  const surface = Number(item?.surface_reelle_bati ?? item?.surface);
  return {
    date: date ? date.toISOString().slice(0, 10) : null,
    prixNet: Number.isFinite(prix) ? Math.round(prix) : null,
    surfaceM2: Number.isFinite(surface) && surface > 0 ? Math.round(surface) : null,
    prixM2: prixM2Mutation(item),
    typeLocal: String(item?.type_local || item?.type || "Local").trim(),
    adresse: String(item?.adresse || `${item?.adresse_numero || ""} ${item?.adresse_nom_voie || item?.voie || ""}`.trim()).trim(),
    idParcelle: idParcelle(item),
    lat: Number(item?.lat || item?.latitude),
    lng: Number(item?.lon || item?.lng || item?.longitude),
  };
}

export function selectionnerMutationsDvf(brut, { idu = "", voie = "" } = {}) {
  const liste = Array.isArray(brut) ? brut : brut?.resultats || brut?.features || [];
  const items = liste
    .map((item) => (item?.properties ? { ...item.properties, ...item.geometry } : item))
    .filter((item) => dansLesCinqDernieresAnnees(item))
    .map(normaliserMutationDvf)
    .filter((item) => item.prixNet != null);

  const iduNorm = String(idu || "").replace(/\s/g, "").toUpperCase();
  const voieCible = String(voie || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  const surParcelle = iduNorm
    ? items.filter((item) => item.idParcelle && (item.idParcelle.includes(iduNorm) || iduNorm.includes(item.idParcelle)))
    : [];
  const dansLaRue =
    !surParcelle.length && voieCible
      ? items.filter((item) => item.adresse && item.adresse.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(voieCible.split(" ").slice(-2).join(" ")))
      : [];

  const retenues = (surParcelle.length ? surParcelle : dansLaRue.length ? dansLaRue : items)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 8);

  const avecM2 = retenues.filter((item) => item.prixM2 != null);
  const prixM2Median =
    avecM2.length === 0
      ? null
      : [...avecM2].sort((a, b) => a.prixM2 - b.prixM2)[Math.floor(avecM2.length / 2)].prixM2;

  return {
    perimetre: surParcelle.length ? "parcelle" : dansLaRue.length ? "rue" : "proximite",
    mutations: retenues,
    prixM2Median,
    attribution: DVF_ATTRIBUTION,
  };
}

function parseCsvDvf(texte) {
  const lignes = String(texte || "").split(/\r?\n/).filter(Boolean);
  if (lignes.length < 2) return [];
  const headers = lignes[0].split(";").length > 1 ? lignes[0].split(";") : lignes[0].split(",");
  const sep = lignes[0].includes(";") ? ";" : ",";
  return lignes.slice(1).map((ligne) => {
    const cols = ligne.split(sep);
    const obj = {};
    headers.forEach((h, i) => {
      obj[String(h).trim()] = cols[i] == null ? "" : String(cols[i]).trim();
    });
    return obj;
  });
}

function distanceM(lat1, lng1, lat2, lng2) {
  const dLat = (lat2 - lat1) * 111320;
  const dLng = (lng2 - lng1) * 111320 * Math.cos((lat1 * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

async function chargerDvfGeoFichiers(codeInsee, { signal } = {}) {
  const insee = String(codeInsee || "").replace(/\D/g, "");
  if (insee.length < 5) return [];
  const dept = insee.startsWith("97") || insee.startsWith("98") ? insee.slice(0, 3) : insee.slice(0, 2);
  const annees = [2025, 2024, 2023, 2022, 2021];
  const lignes = [];
  await Promise.all(
    annees.map(async (annee) => {
      const url = `${URL_GEO_DVF}/${annee}/communes/${dept}/${insee}.csv`;
      try {
        const reponse = await fetch(url, { signal, headers: ENTETES });
        if (!reponse.ok) return;
        const texte = await reponse.text();
        lignes.push(...parseCsvDvf(texte));
      } catch {
        /* millésime absent */
      }
    }),
  );
  return lignes;
}

export async function chargerDvfPoint(lat, lng, { signal, idu, voie, dist = 180, codeInsee } = {}) {
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      dist: String(dist),
    });
    const reponse = await fetch(`${URL_DVF_ETALAB}?${params}`, {
      signal,
      headers: ENTETES,
    });
    if (reponse.ok) {
      const brut = await reponse.json();
      const sel = selectionnerMutationsDvf(brut, { idu, voie });
      if (sel.mutations.length) return sel;
    }
  } catch {
    /* bascule fichiers geo-DVF Etalab */
  }

  const csv = await chargerDvfGeoFichiers(codeInsee, { signal });
  const proches = csv.filter((item) => {
    const la = Number(item.latitude || item.lat);
    const lo = Number(item.longitude || item.lon || item.lng);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) return true;
    return distanceM(Number(lat), Number(lng), la, lo) <= Math.max(dist, 250);
  });
  return selectionnerMutationsDvf(proches, { idu, voie });
}
