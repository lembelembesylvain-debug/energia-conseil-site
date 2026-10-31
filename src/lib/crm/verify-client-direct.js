/**
 * Contrôles du dossier client direct.
 * Exécution : node src/lib/crm/verify-client-direct.js
 */

import {
  MARGE_CG_CLIENT_DIRECT_HT,
  calculerDevisClientDirect,
  calculerProfilAnahClient,
  enregistrerClientDirect,
  validerClientDirect,
} from "./clientDirect.js";
import { projetManuelVersAudit, lireProjetsManuels } from "./projetsManuels.js";
import { etapeDepuisStatutManuel } from "./projetsManuels.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const store = new Map();
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => {
    store.set(key, String(value));
  },
  removeItem: (key) => {
    store.delete(key);
  },
};

assert(calculerProfilAnahClient(10000, 1).profil === "bleu", "10 000 € = Bleu");
assert(calculerProfilAnahClient(20216, 1).profil === "jaune", "20 216 € = Jaune");
assert(calculerProfilAnahClient(25000, 1).profil === "violet", "25 000 € = Violet");
assert(calculerProfilAnahClient(40000, 1).profil === "rose", "40 000 € = Rose");

const fiscalite = calculerProfilAnahClient(25000, 1);
const devis = calculerDevisClientDirect(["combles"], fiscalite, 3);
assert(devis.margeCgHt === MARGE_CG_CLIENT_DIRECT_HT, "marge CG 5 200 HT");
assert(devis.margeCgTtc === 6240, "CG 6 240 TTC");
assert(devis.totalHt === 2800 + 5200, "HT combles + CG");
assert(devis.plafondHt === 40000, "plafond 3 classes");
assert(devis.mpr === Math.round(2800 * 0.45 * 100) / 100, "MPR violet 45 %");
assert(devis.mention.includes("à titre indicatif"), "disclaimer aides");
assert(devis.lignes.at(-1).margeCg === true, "ligne CG en dernier");

const incomplet = validerClientDirect({ nom: "D", prenom: "A" });
assert(!incomplet.ok && incomplet.erreurs.nom && incomplet.erreurs.adresse, "validation coordonnées");

const retour = enregistrerClientDirect({
  nom: "Martin",
  prenom: "Claire",
  telephone: "0611223344",
  email: "claire.martin@example.com",
  adresse: "8 rue des Tilleuls, 69006 Lyon",
  personnes: 2,
  rfr: "24000",
  numeroAuditMar: "A123",
  sautClasses: 2,
  posteIds: ["combles", "pac"],
  photos: {},
});
assert(retour.ok, `enregistrement ${JSON.stringify(retour.erreurs)}`);
assert(retour.projet.profilAnah === "bleu", "foyer 2 pers. 24 000 = Bleu");
assert(retour.projet.devisIndicatif.margeCgHt === 5200, "marge stockée");
assert(retour.projet.statut === "Devis en attente de signature", "statut pipeline devis");
assert(etapeDepuisStatutManuel(retour.projet.statut) === "devis", "étape devis");

const audit = projetManuelVersAudit(retour.projet);
assert(audit.source === "client-direct", "source liste");
assert(audit.caTtc === retour.projet.devisIndicatif.totalTtc, "CA TTC liste");
assert(audit.margeDirectionHt === 5200, "marge visible CRM");
assert(audit.auditId === "A123", "n° audit");
assert(lireProjetsManuels().some((item) => item.id === retour.projet.id), "présent dans les projets");

console.log("OK — client direct : profil Anah, devis, marge CG 5 200 HT, pipeline.");
