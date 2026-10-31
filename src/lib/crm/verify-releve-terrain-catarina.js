/**
 * Contrôle du relevé terrain Catarina.
 * Exécution : node src/lib/crm/verify-releve-terrain-catarina.js
 */

const memoire = new Map();
let refuserImages = false;

globalThis.localStorage = {
  getItem(key) {
    return memoire.has(key) ? memoire.get(key) : null;
  },
  setItem(key, value) {
    const texte = String(value);
    if (refuserImages && texte.includes("base64,QUOTA")) {
      const erreur = new Error("quota");
      erreur.name = "QuotaExceededError";
      throw erreur;
    }
    memoire.set(key, texte);
  },
  removeItem(key) {
    memoire.delete(key);
  },
};

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const { lireProjetsManuels, projetManuelVersAudit } = await import("./projetsManuels.js");
const {
  JALON_RELEVE_TERRAIN,
  ETIQUETTE_APPORTEUR_CATARINA,
  MAX_PHOTOS_RELEVE,
  enregistrerReleveTerrainCatarina,
  extraireLocalisation,
  mentionPhotosSynchronisees,
  messageTransmissionWhatsApp,
  titreFicheReleve,
  validerReleveTerrain,
} = await import("./releveTerrainCatarina.js");

const lieu = extraireLocalisation("12 rue des Lilas, 71150 Chagny");
assert(lieu.ok && lieu.codePostal === "71150" && lieu.ville === "Chagny", "adresse Chagny");
assert(!extraireLocalisation("12 rue des Lilas").ok, "adresse sans code postal rejetée");

const incomplet = validerReleveTerrain({ nom: "A", telephone: "123", adresse: "Chagny" });
assert(!incomplet.ok, "relevé incomplet rejeté");
assert(incomplet.erreurs.nom && incomplet.erreurs.telephone && incomplet.erreurs.adresse, "erreurs client");

const payload = {
  nom: "Camille Martin",
  telephone: "06 12 34 56 78",
  adresse: "12 rue des Lilas, 71150 Chagny",
  dateVisite: "2026-09-22",
  objectif: "valorisation",
  surfaceHabitable: "128",
  longueurSol: "11,5",
  largeurSol: "8",
  hauteurSousPlafond: "2,5",
  nombreFenetres: "6",
  photosBien: { facade: "data:image/jpeg;base64,AAAA" },
  photosDocuments: { avis: "data:image/jpeg;base64,BBBB" },
};

const cree = enregistrerReleveTerrainCatarina(payload);
assert(cree.ok, "dossier créé");
assert(cree.projet.apporteurId === "catarina_martins", "apporteur Catarina");
assert(cree.projet.etiquetteApporteur === ETIQUETTE_APPORTEUR_CATARINA, "étiquette CATARINA MARTINS");
assert(cree.projet.etapeAnah === "audit_reglementaire", "jalon 1");
assert(cree.projet.validationMar === false, "verrou MAR");
assert(cree.projet.detailJalon === JALON_RELEVE_TERRAIN, "libellé jalon");
assert(cree.projet.surfaceHabitable === 128, "surface");
assert(cree.projet.longueurSol === 11.5, "longueur");
assert(cree.projet.nombreFenetres === 6, "fenêtres");
assert(MAX_PHOTOS_RELEVE === 10, "compteur 10 photos");
const beaune = enregistrerReleveTerrainCatarina({
  ...payload,
  nom: "Appartement Beaune",
  adresse: "App 12, 21200 Beaune",
  dateVisite: "2026-09-24",
  surfaceHabitable: "76",
  hauteurSousPlafond: "2,45",
  surfaceCombles: "65",
  photosBien: {
    facade: "data:image/jpeg;base64,AAAA",
    salon: "data:image/jpeg;base64,BBBB",
    toiture: "data:image/jpeg;base64,CCCC",
    tableau: "data:image/jpeg;base64,DDDD",
    compteur: "data:image/jpeg;base64,EEEE",
  },
});
assert(beaune.ok, "relevé Beaune");
assert(beaune.projet.surfaceHabitable === 76, "76 m²");
assert(beaune.projet.hauteurSousPlafond === 2.45, "hauteur 2,45 m");
assert(beaune.projet.surfaceCombles === 65, "combles 65 m²");
assert(beaune.projet.photos.bien.tableau.startsWith("data:image/"), "photo tableau");
assert(beaune.projet.photos.bien.compteur.startsWith("data:image/"), "photo compteur");
assert(
  titreFicheReleve(beaune.projet) === "App 12, 21200 Beaune — 76 m² — Relevé du 24/09/2026",
  "fiche bien",
);
assert(
  mentionPhotosSynchronisees(5) === "✅ 5 photos haute résolution synchronisées dans le CRM",
  "mention WhatsApp",
);
assert(messageTransmissionWhatsApp(beaune.projet, 5).includes("Cotes laser : 76 m²"), "message cotes");
assert(messageTransmissionWhatsApp(beaune.projet, 5).includes("Combles : 65 m²"), "message combles");
assert(cree.projet.photos.bien.facade.startsWith("data:image/"), "photo façade conservée");
assert(cree.projet.rfr == null, "pas de RFR inventé");

const audit = projetManuelVersAudit(cree.projet);
assert(audit.apporteurNom === "Catarina Martins", "nom apporteur CRM");
assert(audit.etapeAnah === "audit_reglementaire", "audit au jalon 1");
assert(audit.validationMar === false, "audit verrouillé MAR");
assert(audit.detailJalon === JALON_RELEVE_TERRAIN, "détail jalon visible");
assert(audit.typeProjet.includes("Valorisation avant vente"), "objectif visible");
assert(audit.adresse.includes("71150 Chagny"), "adresse du bien");
assert(audit.telephone === "06 12 34 56 78", "téléphone");
assert(audit.surface === 128, "surface sur la fiche");

const stock = lireProjetsManuels();
assert(stock.some((item) => item.id === cree.projet.id), "dossier relu dans le CRM");
assert(stock.some((item) => item.id === "projet-manuel-brunel-emrick"), "Brunel conservé");

const doublon = enregistrerReleveTerrainCatarina(payload);
assert(!doublon.ok && doublon.erreurs.nom, "doublon refusé");

refuserImages = true;
const allege = enregistrerReleveTerrainCatarina({
  ...payload,
  nom: "Noah Bernard",
  adresse: "4 place de l'Hôtel de Ville, 71150 Chagny",
  photosBien: { facade: "data:image/jpeg;base64,QUOTA" },
  photosDocuments: {},
});
assert(allege.ok && allege.photosAllegees, "repli sans images si quota");
assert(allege.projet.photos.bien.facade === "present", "photo marquée présente");
assert(allege.projet.apporteurId === "catarina_martins", "apporteur conservé sans images");

console.log("OK — relevé terrain Catarina : dossier, apporteur, jalon 1, verrou MAR.");
