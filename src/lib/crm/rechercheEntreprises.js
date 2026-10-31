/**
 * API publique Recherche d'entreprises (recherche-entreprises.api.gouv.fr).
 * Personnes morales uniquement : dénomination, dirigeant, SIREN.
 */

const API_ENTREPRISES = "https://recherche-entreprises.api.gouv.fr/search";

const MOTS_VOIE = new Set([
  "rue",
  "avenue",
  "av",
  "bd",
  "boulevard",
  "chemin",
  "impasse",
  "place",
  "allee",
  "route",
  "lotissement",
  "residence",
  "lieu",
  "dit",
  "ld",
  "imp",
  "che",
  "rte",
  "pl",
  "res",
  "stretta",
  "traverse",
  "cours",
  "quai",
  "sente",
  "sentier",
]);

export function normaliserAdresse(valeur) {
  return String(valeur || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function codePostalDans(adresse) {
  const trouve = String(adresse || "").match(/\b(\d{5})\b/);
  return trouve ? trouve[1] : "";
}

function jetonsVoie(adresse) {
  return normaliserAdresse(adresse)
    .split(" ")
    .filter((jeton) => jeton.length > 2 && !MOTS_VOIE.has(jeton) && !/^\d+$/.test(jeton));
}

function numeroVoie(adresse) {
  const trouve = String(adresse || "").trim().match(/^(\d{1,4})\b/);
  return trouve ? trouve[1] : "";
}

export function formaterDirigeant(dirigeants) {
  const liste = Array.isArray(dirigeants) ? dirigeants : [];
  const personne =
    liste.find((item) => item?.type_dirigeant === "personne physique" && item?.nom) ||
    liste.find((item) => item?.nom || item?.denomination);
  if (!personne) return "";
  if (personne.denomination) return String(personne.denomination).trim();
  const prenom = String(personne.prenoms || "")
    .replace(/[()]/g, "")
    .trim();
  const nom = String(personne.nom || "").trim();
  return [prenom, nom].filter(Boolean).join(" ");
}

export function formaterEntreprise(entree) {
  if (!entree?.siren) return null;
  const siege = entree.siege || {};
  return {
    siren: String(entree.siren),
    denomination: String(entree.nom_complet || entree.nom_raison_sociale || "").trim(),
    dirigeant: formaterDirigeant(entree.dirigeants),
    qualite: String(
      (entree.dirigeants || []).find((item) => item?.qualite)?.qualite || "",
    ).trim(),
    adresse: String(siege.adresse || "").trim(),
    codePostal: String(siege.code_postal || "").trim(),
    commune: String(siege.libelle_commune || "").trim(),
  };
}

function texteSiege(entree) {
  const siege = entree?.siege || {};
  return normaliserAdresse(
    `${siege.numero_voie || ""} ${siege.type_voie || ""} ${siege.libelle_voie || ""} ${siege.adresse || ""}`,
  );
}

/** Ne retient une société que si le code postal et la voie correspondent. */
export function retenirEntrepriseAdresse(resultats, { adresse = "", codePostal = "" } = {}) {
  const jetons = jetonsVoie(adresse);
  if (!jetons.length) return null;
  const numero = numeroVoie(adresse);
  const cp = String(codePostal || codePostalDans(adresse) || "").trim();
  const candidats = [];

  for (const entree of resultats || []) {
    const siege = entree?.siege || {};
    if (cp && String(siege.code_postal || "") !== cp) continue;
    const texte = texteSiege(entree);
    const communs = jetons.filter((jeton) => texte.includes(jeton));
    if (!communs.length) continue;
    const numeroOk = !numero || texte.split(" ").includes(numero) || String(siege.numero_voie || "") === numero;
    const forme = /sci|sarl|sas|eurl|sa\b/i.test(entree?.nom_complet || "") ? 2 : 0;
    candidats.push({
      entree,
      score: communs.length * 10 + (numeroOk ? 5 : 0) + forme,
      numeroOk,
    });
  }

  candidats.sort((a, b) => b.score - a.score);
  const meilleur = candidats.find((item) => item.numeroOk) || candidats[0];
  if (!meilleur || meilleur.score < 10) return null;
  return formaterEntreprise(meilleur.entree);
}

export function urlRechercheEntreprises({ adresse, codePostal, commune }) {
  const q = [adresse, codePostal, commune].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const params = new URLSearchParams({
    q,
    per_page: "8",
    page: "1",
  });
  const cp = String(codePostal || codePostalDans(adresse) || "").trim();
  if (/^\d{5}$/.test(cp)) params.set("code_postal", cp);
  return `${API_ENTREPRISES}?${params}`;
}

export async function rechercherEntrepriseAdresse(
  { adresse, codePostal, commune, signal } = {},
) {
  const url = urlRechercheEntreprises({ adresse, codePostal, commune });
  const reponse = await fetch(url, { signal });
  if (!reponse.ok) {
    throw new Error(`Registre des entreprises indisponible (${reponse.status}).`);
  }
  const brut = await reponse.json();
  return retenirEntrepriseAdresse(brut?.results, { adresse, codePostal });
}

export function urlAnnuairePublic(adresse) {
  const ou = encodeURIComponent(String(adresse || "").trim());
  return `https://www.pagesjaunes.fr/pagesblanches/recherche?quoiqui=&ou=${ou}`;
}

export function estMaisonIndividuelle(typeBati) {
  const brut = String(typeBati || "");
  if (/collectif|immeuble|copro|tertiaire|industriel|appartement|hangar/i.test(brut)) return false;
  return /maison|individuel|villa|pavillon/i.test(brut) || brut.trim() === "";
}
