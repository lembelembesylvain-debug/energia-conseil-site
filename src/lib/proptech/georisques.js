/**
 * Couche Géorisques — API officielle georisques.gouv.fr
 * RGA (argiles / sécheresse), inondation, sismicité, radon.
 * @see https://www.georisques.gouv.fr/doc-api
 */

export const URL_GEORISQUES = "https://georisques.gouv.fr/api/v1";

const ENTETES = {
  Accept: "application/json",
  "User-Agent": "ENERGIA-CONSEIL-IA/proptech-georisques",
};

async function fetchJson(url, { signal } = {}) {
  const reponse = await fetch(url, { signal, headers: ENTETES });
  if (!reponse.ok) {
    throw new Error(`Géorisques indisponible (${reponse.status}).`);
  }
  return reponse.json();
}

function premier(data) {
  if (Array.isArray(data)) return data[0] || null;
  if (Array.isArray(data?.data)) return data.data[0] || null;
  if (data && typeof data === "object") return data;
  return null;
}

function latlon(lng, lat) {
  return `${Number(lng)},${Number(lat)}`;
}

export function normaliserResumeGeorisques({ rga, sismique, radon, gaspar, rapport } = {}) {
  const itemRga = premier(rga);
  const expo = String(itemRga?.exposition || itemRga?.alea || itemRga?.libelle_exposition || itemRga?.libelle || "").trim();

  const itemSis = premier(sismique);
  const zone = itemSis?.zone_sismicite ?? itemSis?.zone ?? itemSis?.code_zone;
  const libSis = String(itemSis?.libelle || itemSis?.zone_sismicite_libelle || (zone != null ? `Zone ${zone}` : "")).trim();

  const itemRadon = premier(radon);
  const potentiel = String(itemRadon?.classe_potentiel || itemRadon?.classe || itemRadon?.potentiel || "").trim();
  const libRadon = String(itemRadon?.libelle || (potentiel ? `Classe ${potentiel}` : "")).trim();

  const risques = Array.isArray(gaspar?.data) ? gaspar.data : Array.isArray(gaspar) ? gaspar : [];
  const inond = risques.find((r) => /inond/i.test(`${r.libelle_risque_long || r.libelle || r.risque || ""}`));
  const rapportRisques = Array.isArray(rapport?.risques) ? rapport.risques : [];
  const inondRapport = rapportRisques.find((r) => /inond/i.test(`${r.libelle || r.groupeRisque || ""}`));

  return {
    rga: {
      libelle: "Retrait-gonflement des argiles (RGA / sécheresse)",
      niveau: expo || "Non renseigné",
    },
    inondation: {
      libelle: "Inondation",
      niveau: inond || inondRapport ? String(inond?.libelle_risque_long || inondRapport?.libelle || "Territoire concerné") : "Pas de signalement API à cette coordonnée",
      expose: Boolean(inond || inondRapport),
    },
    sismicite: {
      libelle: "Sismicité",
      niveau: libSis || "Non renseigné",
      zone: zone != null ? Number(zone) : null,
    },
    radon: {
      libelle: "Radon",
      niveau: libRadon || "Non renseigné",
      classe: potentiel || null,
    },
    source: "API Géorisques (georisques.gouv.fr)",
  };
}

export async function chargerGeorisques(lat, lng, { signal, codeInsee } = {}) {
  const q = latlon(lng, lat);
  const urls = {
    rga: `${URL_GEORISQUES}/rga?latlon=${encodeURIComponent(q)}`,
    sismique: `${URL_GEORISQUES}/zonage_sismique?latlon=${encodeURIComponent(q)}`,
    gaspar: `${URL_GEORISQUES}/gaspar/risques?latlon=${encodeURIComponent(q)}`,
    rapport: `${URL_GEORISQUES}/resultats_rapport_risque?latlon=${encodeURIComponent(q)}`,
  };
  if (codeInsee) {
    urls.radon = `${URL_GEORISQUES}/radon?code_insee=${encodeURIComponent(codeInsee)}`;
  }

  const entrees = Object.entries(urls);
  const resultats = await Promise.allSettled(entrees.map(([, url]) => fetchJson(url, { signal })));
  const brut = {};
  entrees.forEach(([cle], index) => {
    brut[cle] = resultats[index].status === "fulfilled" ? resultats[index].value : null;
  });

  return {
    resume: normaliserResumeGeorisques(brut),
    brutDisponible: Object.fromEntries(Object.entries(brut).map(([k, v]) => [k, Boolean(v)])),
  };
}
