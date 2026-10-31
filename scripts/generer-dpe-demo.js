/**
 * Génère des extraits DPE de démonstration, un fichier par département.
 * Remplaçables ensuite par un dump ADEME réel (même nom : 71.json, 21.json, 69.json).
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
    communes: [
      { nom: "Dijon", cp: "21000", lat: 47.322, lng: 5.0415, rues: ["Rue de la Liberté", "Avenue Victor Hugo", "Rue Devosge", "Boulevard de Strasbourg", "Rue Jeannin"] },
      { nom: "Beaune", cp: "21200", lat: 47.026, lng: 4.84, rues: ["Rue de Lorraine", "Avenue de la République", "Rue du Faubourg Madeleine"] },
      { nom: "Chenôve", cp: "21300", lat: 47.2936, lng: 5.0047, rues: ["Rue de Marsannay", "Avenue du 8 Mai"] },
      { nom: "Talant", cp: "21240", lat: 47.3372, lng: 5.0086, rues: ["Rue de la Fontaine", "Chemin de Plombières"] },
      { nom: "Quetigny", cp: "21800", lat: 47.3144, lng: 5.1175, rues: ["Rue de la République", "Avenue du Parc"] },
    ],
  },
  {
    code: "69",
    nom: "Rhône",
    villePrincipale: { nom: "Lyon", lat: 45.7578, lng: 4.832, zoom: 12 },
    communes: [
      { nom: "Lyon", cp: "69003", lat: 45.7578, lng: 4.832, rues: ["Rue de la République", "Cours Lafayette", "Rue Garibaldi", "Avenue de Saxe", "Rue Duguesclin"] },
      { nom: "Villeurbanne", cp: "69100", lat: 45.7719, lng: 4.8902, rues: ["Cours Émile Zola", "Rue Léon Blum", "Avenue de Grange Blanche"] },
      { nom: "Vénissieux", cp: "69200", lat: 45.6978, lng: 4.8869, rues: ["Avenue Marcel Houël", "Rue de la Pressée"] },
      { nom: "Caluire-et-Cuire", cp: "69300", lat: 45.7953, lng: 4.8472, rues: ["Rue Coste", "Avenue du Général de Gaulle"] },
      { nom: "Villefranche-sur-Saône", cp: "69400", lat: 45.9896, lng: 4.72, rues: ["Rue Nationale", "Quai de l'Allée"] },
    ],
  },
  {
    code: "71",
    nom: "Saône-et-Loire",
    villePrincipale: { nom: "Chalon-sur-Saône", lat: 46.7808, lng: 4.8539, zoom: 12 },
    communes: [
      { nom: "Chalon-sur-Saône", cp: "71100", lat: 46.7808, lng: 4.8539, rues: ["Rue de Strasbourg", "Avenue Nicéphore Niépce", "Rue du Port Villiers", "Boulevard de la République", "Rue de Chagny"] },
      { nom: "Chagny", cp: "71150", lat: 46.9106, lng: 4.7531, rues: ["Rue de la République", "Rue des Halles", "Avenue de la Gare"] },
      { nom: "Mâcon", cp: "71000", lat: 46.3069, lng: 4.8287, rues: ["Rue Carnot", "Quai des Marans", "Rue de Lyon"] },
      { nom: "Le Creusot", cp: "71200", lat: 46.8075, lng: 4.4414, rues: ["Rue de la République", "Avenue de la Paix"] },
      { nom: "Tournus", cp: "71700", lat: 46.5636, lng: 4.9122, rues: ["Rue du Docteur Privey", "Quai de Saône"] },
    ],
  },
];

const ETIQUETTES = ["G", "G", "F", "F", "F", "E", "E", "D", "C", "B"];
const CHAUFFAGES = ["fioul", "gaz", "électrique", "bois", "fioul", "gaz"];
const TYPES = ["maison", "maison", "maison", "appartement"];

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

function genererLogements(dept) {
  const rng = mulberry32(Number(dept.code) * 7919);
  const logements = [];
  let n = 0;
  for (const commune of dept.communes) {
    const count = commune.nom === dept.villePrincipale.nom ? 16 : 8;
    for (let i = 0; i < count; i += 1) {
      n += 1;
      const etiquette = choisir(rng, ETIQUETTES);
      logements.push({
        id: `${dept.code}-DPE-${String(n).padStart(4, "0")}`,
        adresse: `${10 + Math.floor(rng() * 180)} ${choisir(rng, commune.rues)}`,
        commune: commune.nom,
        code_postal: commune.cp,
        etiquette_dpe: etiquette,
        surface_habitable: 70 + Math.floor(rng() * 110),
        annee_construction: 1950 + Math.floor(rng() * 45),
        type_batiment: choisir(rng, TYPES),
        lat: commune.lat + (rng() - 0.5) * 0.028,
        lng: commune.lng + (rng() - 0.5) * 0.036,
        conso_energie: etiquette === "G" ? 420 + Math.floor(rng() * 80) : etiquette === "F" ? 340 + Math.floor(rng() * 70) : 180 + Math.floor(rng() * 140),
        type_chauffage: choisir(rng, CHAUFFAGES),
      });
    }
  }
  return logements;
}

await mkdir(dossier, { recursive: true });

for (const dept of DEPARTEMENTS) {
  const payload = {
    departement: dept.code,
    nom: dept.nom,
    villePrincipale: dept.villePrincipale,
    source: "extrait de démonstration — remplacer par un dump ADEME local du même nom",
    logements: genererLogements(dept),
  };
  const chemin = join(dossier, `${dept.code}.json`);
  await writeFile(chemin, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`OK ${dept.code}.json — ${payload.logements.length} logements, centre ${dept.villePrincipale.nom}`);
}
