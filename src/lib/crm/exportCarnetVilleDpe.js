/** Carnet de prospection DPE : CSV UTF-8 (BOM) séparateur « ; » pour Excel. */

const COLONNES = [
  "Rang",
  "Adresse complète (Numéro et Rue)",
  "Code Postal",
  "Ville",
  "Note DPE (F ou G)",
  "Consommation (kWh/m².an)",
  "Énergie de chauffage (Fioul, Gaz, Élec...)",
  "Surface habitable (m²)",
  "Année de construction",
  "Lien Cadastre IGN / Géorisques",
  "Notes & Retours terrain",
];

function texte(valeur) {
  return valeur == null ? "" : String(valeur).trim();
}

function nombreFr(valeur) {
  const n = Number(valeur);
  if (!Number.isFinite(n)) return "";
  return String(n).replace(".", ",");
}

function cellule(valeur) {
  const brut = texte(valeur);
  if (/[;"\n\r]/.test(brut)) return `"${brut.replace(/"/g, '""')}"`;
  return brut;
}

export function rueSansLocalisation(adresse, codePostal, ville) {
  let rue = texte(adresse);
  const cp = texte(codePostal);
  if (cp) {
    const index = rue.search(new RegExp(`\\b${cp}\\b`));
    if (index > 0) rue = rue.slice(0, index).replace(/[,\s]+$/g, "");
  }
  const villeNet = texte(ville);
  if (villeNet && rue.toLowerCase().endsWith(villeNet.toLowerCase())) {
    rue = rue.slice(0, -villeNet.length).replace(/[,\s]+$/g, "");
  }
  return rue;
}

export function lienCadastreGeorisques(logement) {
  const lat = Number(logement?.lat);
  const lng = Number(logement?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
  const ign = `https://www.geoportail.gouv.fr/carte?c=${lng},${lat}&z=18&l0=CADASTRALPARCELS.PARCELLAIRE_EXPRESS::GEOPORTAIL:OGC:WMTS(1)&permalink=yes`;
  const geo = `https://www.georisques.gouv.fr/mes-risques/connaitre-les-risques-pres-de-chez-moi/resultat?latlon=${lng},${lat}`;
  return `${ign} | ${geo}`;
}

export function villeDuCarnet(logements, { codePostal = "", villeLabel = "" } = {}) {
  const communes = [...new Set((logements || []).map((item) => texte(item?.commune)).filter(Boolean))];
  if (communes.length === 1) return communes[0];
  const cp = texte(codePostal);
  if (cp) return cp;
  const label = texte(villeLabel);
  return label && label !== "—" ? label : "Ville";
}

export function nomFichierCarnet(ville, date = new Date()) {
  const jour = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  const propre = texte(ville)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9-]+/g, "_")
    .replace(/^_|_$/g, "");
  return `Carnet_Prospection_DPE_${propre || "Ville"}_${jour}.csv`;
}

export function ligneCarnet(logement, rang) {
  return [
    String(rang),
    rueSansLocalisation(logement?.adresse, logement?.codePostal, logement?.commune),
    texte(logement?.codePostal),
    texte(logement?.commune),
    texte(logement?.etiquette),
    nombreFr(logement?.conso),
    texte(logement?.chauffage),
    nombreFr(logement?.surface),
    logement?.annee == null || logement?.annee === "" ? "" : texte(logement.annee),
    lienCadastreGeorisques(logement),
    "",
  ];
}

export function construireCsvCarnetVille(logements) {
  const lignes = [COLONNES.join(";")];
  (logements || []).forEach((logement, index) => {
    lignes.push(ligneCarnet(logement, index + 1).map(cellule).join(";"));
  });
  return lignes.join("\r\n");
}

export function telechargerCsv(contenu, nomFichier) {
  if (typeof document === "undefined") return;
  const blob = new Blob([contenu], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
