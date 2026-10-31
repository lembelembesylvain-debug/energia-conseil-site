/**
 * API ouverte ADEME (data.ademe.fr) — DPE v2 certifiés.
 * Le jeu public « DPE Logements existants (depuis juillet 2021) » a le slug
 * data-fair `dpe03existant`. L'alias `dpe-v2-logements-existants` ne répond pas.
 * L'étiquette v2 est `etiquette_dpe` (ancien champ `classe_consommation_energie`).
 */

const BASE_ADEME = "https://data.ademe.fr/data-fair/api/v1/datasets";

export const JEU_ADEME_LOGEMENTS = "dpe03existant";
export const JEU_ADEME_TERTIAIRE = "dpe01tertiaire";
export const LIMITE_ADEME = 50;
export const DELAI_ADEME_MS = 20000;

const CHAMPS_LOGEMENTS = [
  "numero_dpe",
  "etiquette_dpe",
  "adresse_ban",
  "adresse_complete_brut",
  "code_postal_ban",
  "code_postal_brut",
  "nom_commune_ban",
  "nom_commune_brut",
  "code_departement_ban",
  "annee_construction",
  "surface_habitable_logement",
  "conso_5_usages_par_m2_ep",
  "type_batiment",
  "type_energie_principale_chauffage",
  "date_etablissement_dpe",
  "_geopoint",
].join(",");

const CHAMPS_TERTIAIRE = [
  "numero_dpe",
  "etiquette_dpe",
  "adresse_ban",
  "adresse_complete_brut",
  "code_postal_ban",
  "code_postal_brut",
  "nom_commune_ban",
  "nom_commune_brut",
  "code_departement_ban",
  "annee_construction",
  "surface_utile",
  "surface_shon",
  "conso_kwhep_m2_an",
  "type_energie_principale_chauffage",
  "date_etablissement_dpe",
  "_geopoint",
].join(",");

export function jeuAdemePourType(typeBatiment) {
  if (typeBatiment === "tertiaire" || typeBatiment === "industriel") return JEU_ADEME_TERTIAIRE;
  return JEU_ADEME_LOGEMENTS;
}

/** Corse : 20000–20199 = 2A, 20200 et au-delà = 2B. */
export function departementDepuisCodePostal(codePostal) {
  const cp = String(codePostal || "").trim();
  if (!/^\d{5}$/.test(cp)) return "";
  if (cp.startsWith("20")) return Number(cp) >= 20200 ? "2B" : "2A";
  if (/^97|^98/.test(cp)) return cp.slice(0, 3);
  return cp.slice(0, 2);
}

export function requetePassoiresAdeme({ codeDepartement = "", codePostal = "", typeBatiment = "individuel" } = {}) {
  const morceaux = ["etiquette_dpe:(F OR G)"];
  const cp = String(codePostal || "").trim();
  const dept = String(codeDepartement || "").trim().toUpperCase();
  if (/^\d{5}$/.test(cp)) morceaux.push(`code_postal_ban:${cp}`);
  else if (dept) morceaux.push(`code_departement_ban:"${dept}"`);
  if (typeBatiment === "individuel") morceaux.push('type_batiment:"maison"');
  if (typeBatiment === "collectif") morceaux.push('type_batiment:"appartement"');
  return {
    dataset: jeuAdemePourType(typeBatiment),
    qs: morceaux.join(" AND "),
    size: LIMITE_ADEME,
    select: jeuAdemePourType(typeBatiment) === JEU_ADEME_TERTIAIRE ? CHAMPS_TERTIAIRE : CHAMPS_LOGEMENTS,
  };
}

export function urlLignesAdeme(requete) {
  const params = new URLSearchParams({
    size: String(requete.size || LIMITE_ADEME),
    sort: "-date_etablissement_dpe",
    select: requete.select,
    qs: requete.qs,
  });
  return `${BASE_ADEME}/${requete.dataset}/lines?${params}`;
}

export function logementDepuisLigneAdeme(ligne, index = 0) {
  if (!ligne || typeof ligne !== "object") return null;
  return {
    id: String(ligne.numero_dpe || `ademe-${index}`),
    adresse: String(ligne.adresse_ban || ligne.adresse_complete_brut || "").trim(),
    commune: String(ligne.nom_commune_ban || ligne.nom_commune_brut || "").trim(),
    code_postal: String(ligne.code_postal_ban || ligne.code_postal_brut || "").trim(),
    etiquette_dpe: ligne.etiquette_dpe,
    surface_habitable: ligne.surface_habitable_logement ?? ligne.surface_utile ?? ligne.surface_shon,
    annee_construction: ligne.annee_construction,
    type_batiment: String(ligne.type_batiment || "").trim(),
    _geopoint: ligne._geopoint,
    conso_energie: ligne.conso_5_usages_par_m2_ep ?? ligne.conso_kwhep_m2_an,
    type_chauffage: String(ligne.type_energie_principale_chauffage || "").trim(),
    date_dpe: ligne.date_etablissement_dpe,
  };
}

function erreurAnnulee() {
  const err = new Error("Requête ADEME annulée.");
  err.name = "AbortError";
  return err;
}

async function fetchAvecDelai(url, signal, delaiMs) {
  const chrono = new AbortController();
  const timer = setTimeout(() => chrono.abort(), delaiMs);
  const couper = () => chrono.abort();
  signal?.addEventListener("abort", couper);
  try {
    if (signal?.aborted) throw erreurAnnulee();
    return await fetch(url, { signal: chrono.signal });
  } catch (err) {
    if (signal?.aborted) throw erreurAnnulee();
    if (err?.name === "AbortError") {
      throw new Error("L'API ADEME n'a pas répondu à temps.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", couper);
  }
}

export async function chargerPassoiresAdeme(
  { codeDepartement, codePostal, typeBatiment, signal } = {},
) {
  const requete = requetePassoiresAdeme({ codeDepartement, codePostal, typeBatiment });
  const reponse = await fetchAvecDelai(urlLignesAdeme(requete), signal, DELAI_ADEME_MS);
  if (!reponse.ok) {
    const detail = await reponse.text().catch(() => "");
    throw new Error(`API ADEME indisponible (${reponse.status}). ${detail.slice(0, 160)}`.trim());
  }
  const brut = await reponse.json();
  const lignes = Array.isArray(brut?.results) ? brut.results : [];
  return {
    dataset: requete.dataset,
    totalZone: Number(brut?.total) || lignes.length,
    logements: lignes.map(logementDepuisLigneAdeme).filter(Boolean),
  };
}
