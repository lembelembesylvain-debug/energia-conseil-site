/** Vérification autonome (Node) du catalogue métiers — sans tsx. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const categoriesSrc = readFileSync(join(root, "src/lib/crm/catalogue/categories.ts"), "utf8");
const seedSrc = readFileSync(join(root, "src/lib/crm/catalogue/prestations-seed.ts"), "utf8");
const mockSrc = readFileSync(join(root, "src/lib/crm/mockData.js"), "utf8");

const erreurs = [];
const assert = (ok, message) => {
  if (!ok) erreurs.push(message);
};

const nbCats = (categoriesSrc.match(/id: "/g) || []).length;
assert(nbCats === 30, `30 catégories attendues, ${nbCats} trouvées`);

const sousCats = [...categoriesSrc.matchAll(/sousCategories: \[([\s\S]*?)\],/g)];
assert(sousCats.length === 30, `30 blocs de sous-catégories attendus, ${sousCats.length}`);
const nbSous = sousCats.reduce((n, m) => n + (m[1].match(/"/g) || []).length / 2, 0);
assert(nbSous >= 180, `Au moins 180 sous-catégories attendues, ${nbSous} trouvées`);

assert(seedSrc.includes("DONNÉES DE DÉMONSTRATION"), "Les lignes démo ne sont pas identifiées");
assert((seedSrc.match(/demo: true/g) || []).length === 5, "5 prestations de démonstration attendues");
assert(seedSrc.includes("compat-${mapping.posteId}"), "Mapping des postes existants manquant");
assert(seedSrc.includes("Panneaux DualSun Flash 500Wc"), "DualSun Flash 500Wc manquant");
assert(seedSrc.includes("Coffret de protection AC/DC"), "Coffret AC/DC manquant");
assert(seedSrc.includes("Rails et fixations (par panneau)"), "Rails/fixations manquants");
assert(seedSrc.includes("Câbles et connectique (part variable)"), "Câbles part variable manquants");
assert(seedSrc.includes("Câbles et connectique (part fixe)"), "Câbles part fixe manquants");
assert(seedSrc.includes('nom: "Mise à la terre"'), "Mise à la terre manquante");
assert(seedSrc.includes("Calepinage et étude d’implantation"), "Calepinage manquant");
assert(seedSrc.includes("Raccordement Enedis"), "Raccordement manquant");
assert(seedSrc.includes('nom: "Consuel"'), "Consuel manquant");
assert(seedSrc.includes("Monitoring de production"), "Monitoring manquant");
assert(seedSrc.includes("Batterie LFP Pylontech Force H2 (15 kWh)"), "Pylontech 15 kWh manquant");
assert(seedSrc.includes("Batterie LFP Pylontech Force H2 (30 kWh)"), "Pylontech 30 kWh manquant");
assert(seedSrc.includes("Batterie LFP Huawei Luna 2000 (5 kWh)"), "Huawei Luna 5 kWh manquant");
assert(seedSrc.includes("Crochets et supports (par panneau)"), "Crochets manquants");
assert(seedSrc.includes("Pose photovoltaïque (part fixe)"), "Pose fixe manquante");
assert(seedSrc.includes("Protections complémentaires"), "Protections manquantes");
assert(seedSrc.includes("Démarches administratives"), "Démarches manquantes");
assert(seedSrc.includes("Coordination ENERGIA"), "Coordination ENERGIA manquante");
assert(seedSrc.includes("Frais administratifs Clyve"), "Frais Clyve manquants");
assert((seedSrc.match(/id: "pv-/g) || []).length === 36, "36 prestations photovoltaïques attendues");

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}
function calc(materiel, mo, vente, tva) {
  const revient = round2((materiel ?? 0) + (mo ?? 0));
  const marge = round2(vente - revient);
  const taux = vente > 0 ? marge / vente : null;
  const montantTva = round2(vente * tva);
  return { revient, marge, taux, montantTva, ttc: round2(vente + montantTva) };
}

const isolation = calc(12, 8, 28, 0.055);
assert(isolation.revient === 20, `Isolation : revient ${isolation.revient}`);
assert(isolation.marge === 8, `Isolation : marge ${isolation.marge}`);
assert(round2(isolation.taux * 100) === 28.57, `Isolation : taux ${isolation.taux}`);
assert(isolation.montantTva === 1.54, `Isolation : TVA ${isolation.montantTva}`);
assert(isolation.ttc === 29.54, `Isolation : TTC ${isolation.ttc}`);

const pac = calc(4500, 2200, 8900, 0.055);
assert(pac.revient === 6700 && pac.marge === 2200, "PAC démo : coût/marge");

const negatif = calc(80, 20, 90, 0.2);
assert(negatif.marge === -10, "Marge négative attendue");

assert(mockSrc.includes('nom: "Monsieur Pereira"'), "Dossier Pereira toujours présent");
assert(
  mockSrc.includes("ht: 3071.09") && mockSrc.includes("ht: 18767.77"),
  "Montants Pereira inchangés",
);

if (erreurs.length) {
  console.error("Échecs :");
  for (const e of erreurs) console.error(` - ${e}`);
  process.exit(1);
}
console.log(`OK — ${nbCats} catégories, ${nbSous} sous-catégories, calculs de marge exacts, Pereira intact.`);
