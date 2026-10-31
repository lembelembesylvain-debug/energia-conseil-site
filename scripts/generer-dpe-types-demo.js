/**
 * Génère des extraits DPE de démonstration par type de bâtiment (collectif, tertiaire, industriel).
 * Ne touche pas aux fichiers existants 21.json / 69.json / 71.json (individuel).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const dossier = join(racine, "public", "data", "dpe");

const DEPARTEMENTS = [
  {
    code: "21",
    nom: "Côte-d'Or",
    villePrincipale: { nom: "Dijon", lat: 47.322, lng: 5.0415, zoom: 12 },
    collectif: [
      { commune: "Dijon", cp: "21000", lat: 47.322, lng: 5.0415, rues: ["Résidence de la Fontaine", "Square des Grésilles", "Allée du Parc"] },
      { commune: "Chenôve", cp: "21300", lat: 47.2936, lng: 5.0047, rues: ["Résidence du 8 Mai"] },
    ],
    tertiaire: [
      { commune: "Dijon", cp: "21000", lat: 47.3238, lng: 5.0419, sites: ["Immeuble de bureaux République", "Commerce centre-ville", "Pôle tertiaire Toison d'Or"] },
    ],
    industriel: [
      { commune: "Dijon", cp: "21000", lat: 47.348, lng: 5.072, sites: ["Entrepôt logistique nord", "Atelier métallurgie", "Site agroalimentaire"] },
    ],
  },
  {
    code: "69",
    nom: "Rhône",
    villePrincipale: { nom: "Lyon", lat: 45.7578, lng: 4.832, zoom: 12 },
    collectif: [
      { commune: "Lyon", cp: "69003", lat: 45.7578, lng: 4.832, rues: ["Résidence Part-Dieu", "Immeuble Guillotière", "Résidence Monplaisir"] },
      { commune: "Villeurbanne", cp: "69100", lat: 45.7719, lng: 4.8902, rues: ["Résidence Gratte-Ciel"] },
    ],
    tertiaire: [
      { commune: "Lyon", cp: "69003", lat: 45.7606, lng: 4.859, sites: ["Tour de bureaux Part-Dieu", "Commerce rue de la République", "Immeuble tertiaire Gerland"] },
    ],
    industriel: [
      { commune: "Vénissieux", cp: "69200", lat: 45.6978, lng: 4.8869, sites: ["Usine mécanique", "Entrepôt logistique", "Atelier chaudronnerie"] },
    ],
  },
  {
    code: "71",
    nom: "Saône-et-Loire",
    villePrincipale: { nom: "Chalon-sur-Saône", lat: 46.7808, lng: 4.8539, zoom: 12 },
    collectif: [
      { commune: "Chalon-sur-Saône", cp: "71100", lat: 46.7808, lng: 4.8539, rues: ["Résidence Saint-Cosme", "Immeuble Saint-Jean", "Résidence du Colombier"] },
      { commune: "Le Creusot", cp: "71200", lat: 46.8075, lng: 4.4414, rues: ["Résidence de la Paix"] },
    ],
    tertiaire: [
      { commune: "Chalon-sur-Saône", cp: "71100", lat: 46.7815, lng: 4.855, sites: ["Bureaux centre-ville", "Commerce rue de Strasbourg", "Pôle tertiaire Nicéphore"] },
    ],
    industriel: [
      { commune: "Chalon-sur-Saône", cp: "71100", lat: 46.801, lng: 4.872, sites: ["Zone industrielle nord", "Entrepôt logistique Saône", "Atelier mécanique"] },
    ],
  },
];

const ETIQUETTES = ["G", "G", "F", "F", "E", "E", "D", "C"];
const ACTIVITES = ["logistique", "métallurgie", "agroalimentaire", "mécanique"];
const DECRET = ["Assujetti", "Assujetti", "À vérifier", "Non assujetti"];

function mulberry32(a) {
  return function alea() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function choisir(rng, liste) {
  return liste[Math.floor(rng() * liste.length)];
}

function genererCollectif(dept, rng) {
  const logements = [];
  let n = 0;
  for (const zone of dept.collectif) {
    const count = zone.rues.length * 4;
    for (let i = 0; i < count; i += 1) {
      n += 1;
      const etiquette = choisir(rng, ETIQUETTES);
      logements.push({
        id: `${dept.code}-COL-${String(n).padStart(4, "0")}`,
        adresse: choisir(rng, zone.rues),
        commune: zone.commune,
        code_postal: zone.cp,
        etiquette_dpe: etiquette,
        dpe_immeuble: etiquette,
        surface_habitable: 1800 + Math.floor(rng() * 4200),
        annee_construction: 1960 + Math.floor(rng() * 35),
        type_batiment: "collectif",
        nb_lots: 12 + Math.floor(rng() * 48),
        lat: zone.lat + (rng() - 0.5) * 0.018,
        lng: zone.lng + (rng() - 0.5) * 0.022,
        conso_energie: etiquette === "G" ? 390 + Math.floor(rng() * 70) : 220 + Math.floor(rng() * 140),
        type_chauffage: choisir(rng, ["gaz collectif", "réseau de chaleur", "électrique"]),
      });
    }
  }
  return logements;
}

function genererTertiaire(dept, rng) {
  const logements = [];
  let n = 0;
  for (const zone of dept.tertiaire) {
    for (const site of zone.sites) {
      for (let i = 0; i < 4; i += 1) {
        n += 1;
        const etiquette = choisir(rng, ETIQUETTES);
        const surface = 400 + Math.floor(rng() * 2600);
        logements.push({
          id: `${dept.code}-TER-${String(n).padStart(4, "0")}`,
          adresse: `${site} — plateau ${i + 1}`,
          commune: zone.commune,
          code_postal: zone.cp,
          etiquette_dpe: etiquette,
          surface_habitable: surface,
          annee_construction: 1975 + Math.floor(rng() * 40),
          type_batiment: "tertiaire",
          decret_tertiaire: surface >= 1000 ? choisir(rng, DECRET) : "Non assujetti",
          lat: zone.lat + (rng() - 0.5) * 0.014,
          lng: zone.lng + (rng() - 0.5) * 0.016,
          conso_energie: 180 + Math.floor(rng() * 220),
          type_chauffage: choisir(rng, [" PAC", "gaz", "réseau de chaleur"].map((s) => s.trim())),
        });
      }
    }
  }
  return logements;
}

function genererIndustriel(dept, rng) {
  const logements = [];
  let n = 0;
  for (const zone of dept.industriel) {
    for (const site of zone.sites) {
      for (let i = 0; i < 3; i += 1) {
        n += 1;
        const etiquette = choisir(rng, ["E", "F", "G", "D"]);
        const surfaceToiture = 800 + Math.floor(rng() * 4200);
        logements.push({
          id: `${dept.code}-IND-${String(n).padStart(4, "0")}`,
          adresse: `${site} ${i + 1}`,
          commune: zone.commune,
          code_postal: zone.cp,
          etiquette_dpe: etiquette,
          surface_habitable: 1200 + Math.floor(rng() * 6000),
          annee_construction: 1965 + Math.floor(rng() * 45),
          type_batiment: "industriel",
          activite: choisir(rng, ACTIVITES),
          potentiel_pv_kwc: Math.round(surfaceToiture / 7),
          lat: zone.lat + (rng() - 0.5) * 0.016,
          lng: zone.lng + (rng() - 0.5) * 0.02,
          conso_energie: 250 + Math.floor(rng() * 280),
          type_chauffage: choisir(rng, ["gaz process", "électrique", "biomasse"]),
        });
      }
    }
  }
  return logements;
}

await mkdir(dossier, { recursive: true });

for (const dept of DEPARTEMENTS) {
  const rng = mulberry32(Number(dept.code) * 13331);
  const fichiers = [
    { suffixe: "collectif", logements: genererCollectif(dept, rng) },
    { suffixe: "tertiaire", logements: genererTertiaire(dept, rng) },
    { suffixe: "industriel", logements: genererIndustriel(dept, rng) },
  ];
  for (const fichier of fichiers) {
    const payload = {
      departement: dept.code,
      nom: dept.nom,
      villePrincipale: dept.villePrincipale,
      type_batiment: fichier.suffixe,
      source: "extrait de démonstration par type de bâtiment — hors fichier individuel",
      logements: fichier.logements,
    };
    const chemin = join(dossier, `${dept.code}-${fichier.suffixe}.json`);
    await writeFile(chemin, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`OK ${dept.code}-${fichier.suffixe}.json — ${payload.logements.length} bâtiments`);
  }
}
