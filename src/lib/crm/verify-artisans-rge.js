/**
 * Contrôles module Artisans RGE & grilles de sous-traitance.
 * Exécution : node src/lib/crm/verify-artisans-rge.js
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ROLE_ADMIN, ROLE_COMMERCIAL } from "./roles.js";
import { calculerFinancesInternes, calculerLigneTravaux } from "./editionDossier.js";
import { editionOfficielleBrunelV3, TOTAUX_BRUNEL_V3 } from "./brunelDevisV3Officiel.js";
import { editionOfficiellePereiraNervieux, TOTAUX_PEREIRA_NERVIEUX } from "./pereiraNervieuxOfficiel.js";
import {
  ARTICLE_CGI_AUTOLIQUIDATION,
  MODE_FOURNITURE_POSE,
  MODE_POSE_SEULE,
  MENTION_AUTOLIQUIDATION_TVA,
  REFERENTIEL_SEED,
  artisanParId,
  calculerMargesSousTraitance,
  decomposerLigneSousTraitance,
  grouperLignesParArtisan,
  listerArtisans,
  normaliserReferentielPourSauvegarde,
  patchTarifsDepuisArtisan,
  referentielParDefaut,
  resoudreArtisanPourLigne,
} from "./artisansRge.js";
import {
  htmlBonCommandePourGroupe,
  htmlBonCommandeSousTraitance,
  nomFichierBonCommande,
  payloadBonCommandeSousTraitance,
} from "./bonCommandeSousTraitanceHtml.js";
import { BRUNEL_DOSSIER_ID } from "./brunelWorkingBase.js";
import { lignesMarcheBrunel } from "./brunelMarcheOfficiel2026.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const json = JSON.parse(readFileSync(join(root, "data/artisans-rge-referentiel.json"), "utf8"));

assert(json.artisans.length === 5, "5 artisans dans le JSON");
assert(
  json.artisans.map((a) => a.id).join(",") === "c2l-isolation,bonheur-amarante,smn-energies,bmi-mohamed-benaouda,hezen-mustafa",
  "ids C2L / Bonheur / SMN / BMI / HEZEN",
);
assert(REFERENTIEL_SEED.artisans.length === 5, "seed JS aligné");
assert(json.mentionAutoliquidation.includes("283-2 nonies"), "mention autoliquidation JSON");
assert(MENTION_AUTOLIQUIDATION_TVA.includes("283-2 nonies"), "constante autoliquidation");
assert(ARTICLE_CGI_AUTOLIQUIDATION.includes("283-2 nonies"), "article CGI");

const c2l = json.artisans.find((a) => a.id === "c2l-isolation");
const bonheur = json.artisans.find((a) => a.id === "bonheur-amarante");
const smn = json.artisans.find((a) => a.id === "smn-energies");
const bmi = json.artisans.find((a) => a.id === "bmi-mohamed-benaouda");
const hezen = json.artisans.find((a) => a.id === "hezen-mustafa");

assert(c2l.raisonSociale === "C2L Isolation", "C2L raison sociale");
assert(c2l.siret === "53461962200101", "SIRET C2L réel");
assert(c2l.rge.numero === "E-E102269", "Qualibat C2L");
assert(c2l.rge.validite === "2027-12-31", "validité RGE C2L");
assert(c2l.decennale.compagnie === "GAN Assurances", "décennale GAN");
assert(c2l.decennale.police === "221200149", "police GAN");
assert(c2l.contratSousTraitance.autoliquidationTva === true, "C2L autoliquidation");
assert(c2l.zones.join(",") === "42,69,71,01,21", "zones C2L");
assert(
  c2l.grilles.find((g) => g.id === "combles-soufflage").fourniturePosePuHt === 22,
  "combles 22 €/m² fourniture+pose",
);
assert(c2l.grilles.find((g) => g.id === "combles-soufflage").poseSeulePuHt === 8, "combles pose 8 €/m²");

assert(bonheur.raisonSociale.includes("Bonheur d'Amarante"), "Bonheur raison sociale");
assert(bonheur.siret === "79180685400034", "SIRET Bonheur");
assert(bonheur.telephone === "04 72 18 09 35", "tél Bonheur");
assert(bonheur.email === "bonheurdamarante@gmail.com", "email Bonheur");
assert(
  bonheur.grilles.find((g) => g.id === "menuiseries-fenetres").poseSeulePuHt === 130,
  "pose fenêtre 130 € HT",
);

assert(smn.raisonSociale === "SMN ENERGIES", "SMN");
assert(bmi.raisonSociale === "BMI", "BMI raison sociale");
assert(bmi.dirigeant === "Mohamed BENAOUDA", "BMI dirigeant");
assert(bmi.forme === "Entreprise Individuelle", "forme BMI");
assert(bmi.siren === "488327784", "SIREN BMI");
assert(bmi.siret === "48832778400010", "SIRET BMI");
assert(bmi.telephone === "" && bmi.email === "", "coordonnées de contact BMI vides proprement");
assert(bmi.adresse === "5 Grande Rue, 71260 Lugny", "adresse BMI");
assert(bmi.zones.join(",") === "71,69,01,21", "zones BMI");
assert(bmi.rge.organisme && bmi.rge.numero && bmi.rge.validite, "champs RGE BMI présents");
assert(bmi.decennale.police === "CRCD04-001151", "police décennale BMI");
assert(bmi.decennale.validiteAu === "2026-10-31", "validité décennale BMI");
assert(bmi.contratSousTraitance.autoliquidationTva === true, "BMI autoliquidation");
assert(bmi.modeDefaut === MODE_FOURNITURE_POSE, "BMI mode défaut F+P");
assert(Array.isArray(bmi.grilles) && bmi.grilles.length === 0, "BMI sans grille tarifaire inventée");
assert(hezen.raisonSociale === "HEZEN MUSTAFA", "HEZEN raison sociale");
assert(hezen.siret === "84821544800010", "SIRET HEZEN");
assert(hezen.email === "contact@hezen-macon.fr", "email HEZEN");
assert(hezen.zones.join(",") === "71,01,69,21", "zones HEZEN");
assert(hezen.rge.organisme === "Qualibat RGE Façade / Maçonnerie", "RGE HEZEN");
assert(hezen.contratSousTraitance.autoliquidationTva === true, "HEZEN autoliquidation");
assert(hezen.modeDefaut === MODE_FOURNITURE_POSE, "HEZEN mode défaut F+P");
assert(hezen.grilles.length === 2, "2 grilles tarifaires HEZEN");
assert(hezen.grilles[0].motsCles.includes("ipn"), "mots-clés IPN HEZEN");
assert(smn.rge.organisme.includes("QualiPAC"), "QualiPAC");
assert(smn.rge.numero === "QPAC/84409", "n° QualiPAC");
assert(smn.grilles.find((g) => g.id === "pac-air-eau").fourniturePosePuHt === 10500, "PAC 10 500 HT");
assert(smn.grilles.find((g) => g.id === "pac-air-eau").poseSeulePuHt === 2500, "pose PAC 2 500 HT");
assert(smn.grilles.find((g) => g.id === "pac-air-eau").materielDirectPuHt === 7500, "matériel PAC 7 500 HT");
assert(smn.grilles.find((g) => g.id === "ballon-thermo").materielDirectPuHt === 1250, "ballon 1 250 HT");
assert(c2l.modeDefaut === MODE_FOURNITURE_POSE, "C2L mode défaut F+P");
assert(bonheur.modeDefaut === MODE_FOURNITURE_POSE, "Bonheur mode défaut F+P");
assert(smn.modeDefaut === MODE_FOURNITURE_POSE, "SMN mode défaut F+P");
assert(c2l.rge.validite === "2027-12-31", "validité RGE C2L éditable");

const referentiel = referentielParDefaut();
assert(listerArtisans(referentiel).length === 5, "lister 5");
assert(artisanParId("c2l-isolation", referentiel).enseigne.includes("C2L"), "artisanParId");

const lignePac = {
  id: "pac",
  nom: "PAC air/eau",
  familleId: "chauffage",
  artisan: "SMN Energies (RGE)",
  quantite: 1,
  unite: "forfait",
  puHt: 15000,
  totalHt: 15000,
  modeSousTraitance: MODE_FOURNITURE_POSE,
};
assert(resoudreArtisanPourLigne(lignePac, referentiel.artisans).id === "smn-energies", "match SMN");

const decompPacQte5 = decomposerLigneSousTraitance(
  { ...lignePac, quantite: 5, totalHt: 8000 },
  referentiel,
);
assert(decompPacQte5.coutFourniturePoseHt === 10500, "PAC forfait ignoré qté 5 kW");

const decompA = decomposerLigneSousTraitance(lignePac, referentiel);
assert(decompA.coutFourniturePoseHt === 10500, `F+P ${decompA.coutFourniturePoseHt}`);
assert(decompA.coutPoseSeuleHt === 2500, "pose 2500");
assert(decompA.coutMaterielDirectHt === 7500, "matériel 7500");
assert(decompA.extraMargeAchatDirectHt === 500, `extra ${decompA.extraMargeAchatDirectHt}`);
assert(decompA.extraMargeCaptureeHt === 0, "extra non captée en mode A");
assert(decompA.venteHt === 15000, "vente inchangée mode A");
assert(decompA.margeBruteHt === 4500, "marge 15000-10500");

const decompB = decomposerLigneSousTraitance(
  { ...lignePac, modeSousTraitance: MODE_POSE_SEULE },
  referentiel,
);
assert(decompB.coutRevientHt === 10000, "revient pose+mat 2500+7500");
assert(decompB.extraMargeCaptureeHt === 500, "500 € captés en pose seule");
assert(decompB.margeBruteHt === 5000, "marge 15000-10000");
assert(decompB.fourniturePar.includes("ENERGIA"), "matériel ENERGIA");

const ligneCombles = {
  id: "combles",
  nom: "Isolation des combles perdus",
  familleId: "isolation",
  artisan: "C2L (RGE)",
  quantite: 100,
  unite: "m²",
  puHt: 41.68,
  totalHt: 4168,
};
const decompCombles = decomposerLigneSousTraitance(
  { ...ligneCombles, modeSousTraitance: MODE_POSE_SEULE },
  referentiel,
);
assert(decompCombles.coutPoseSeuleHt === 800, "100 m² × 8");
assert(decompCombles.coutMaterielDirectHt === 1100, "100 × 11");
assert(decompCombles.extraMargeCaptureeHt === 300, "100 × (22-19)");

const avant = calculerLigneTravaux({
  ...lignePac,
  verrouillageOfficiel: true,
  totalTva: 825,
  totalTtc: 15825,
  tauxTva: 0.055,
});
const apres = calculerLigneTravaux({
  ...avant,
  modeSousTraitance: MODE_POSE_SEULE,
  artisanId: "smn-energies",
});
assert(apres.totalHt === avant.totalHt, "PU/HT client figés après toggle pose seule");
assert(apres.puHt === avant.puHt, "PU client figé");

const patch = patchTarifsDepuisArtisan(lignePac, "smn-energies", referentiel);
assert(patch.artisanId === "smn-energies", "patch artisanId");
assert(patch.totalHt === 15000, "patch ne touche pas totalHt");
assert(patch.poseSeulePuHt === 2500, "patch copie grille");

const editionBrunel = editionOfficielleBrunelV3();
assert(editionBrunel.travaux.length === 8, "Brunel 8 postes");
const totauxBrunelApres = editionBrunel.travaux.map((l) =>
  calculerLigneTravaux({ ...l, modeSousTraitance: MODE_POSE_SEULE }),
);
assert(
  totauxBrunelApres.reduce((s, l) => s + l.totalHt, 0) ===
    editionBrunel.travaux.reduce((s, l) => s + l.totalHt, 0),
  "Brunel HT inchangé après pose seule",
);
assert(TOTAUX_BRUNEL_V3.totalHt === 35742.41, "totaux Brunel 35 742,41 HT");
assert(TOTAUX_BRUNEL_V3.totalTtc === 37708.24, "totaux Brunel 37 708,24 TTC");

const editionPereira = editionOfficiellePereiraNervieux();
assert(editionPereira.travaux.length === 8, "Pereira 8 postes");
assert(TOTAUX_PEREIRA_NERVIEUX.totalHt === 30710.9, "Pereira 30 710,90 HT");
assert(TOTAUX_PEREIRA_NERVIEUX.totalTtc === 32400, "Pereira 32 400,00 TTC");
const pereiraApres = editionPereira.travaux.map((l) =>
  calculerLigneTravaux({ ...l, modeSousTraitance: MODE_POSE_SEULE, artisanId: l.artisanId }),
);
assert(
  Math.abs(
    pereiraApres.reduce((s, l) => s + l.totalHt, 0) - editionPereira.travaux.reduce((s, l) => s + l.totalHt, 0),
  ) < 0.01,
  "Pereira HT inchangé",
);

const groupes = grouperLignesParArtisan(editionBrunel.travaux, referentiel);
assert(groupes.some((g) => g.artisan.id === "c2l-isolation"), "BC groupe C2L");
assert(groupes.some((g) => g.artisan.id === "bonheur-amarante"), "BC groupe Bonheur");
assert(groupes.some((g) => g.artisan.id === "smn-energies"), "BC groupe SMN");
assert(!groupes.some((g) => /energia/i.test(g.artisan.raisonSociale)), "CG hors BC artisan");

const c2lGroupe = groupes.find((g) => g.artisan.id === "c2l-isolation");
const payload = payloadBonCommandeSousTraitance({
  artisan: c2lGroupe.artisan,
  lignes: c2lGroupe.lignes,
  client: { nom: "Indivision COUBLE", adresse: "Chagny" },
  chantier: { adresse: "Chagny", codePostal: "71150", ville: "Chagny" },
  dateIntervention: "2026-04-15",
  referentiel,
});
const html = htmlBonCommandeSousTraitance(payload);
assert(/BON DE COMMANDE SOUS-TRAITANCE/i.test(html), "titre BC");
assert(/283-2 nonies/i.test(html), "article 283-2 nonies dans le BC");
assert(/preneur assujetti/i.test(html), "mention preneur assujetti dans le BC");
assert(/autoliquidation/i.test(html), "mention autoliquidation");
assert(/Sylvain LEMBELEMBE/i.test(html), "Sylvain CG");
assert(/Contractant G/i.test(html), "Contractant Général");
assert(/C2L/i.test(html), "artisan C2L");

const payloadAvecDeplacement = payloadBonCommandeSousTraitance({
  artisan: c2lGroupe.artisan,
  lignes: c2lGroupe.lignes,
  distanceAllerKm: 45,
  joursDePose: 2,
  referentiel,
});
assert(payloadAvecDeplacement.fraisDeplacementHt === 180, "frais BC 180 € au-delà de 30 km");
assert(
  payloadAvecDeplacement.taches.some(
    (tache) => tache.nom === "Frais de déplacement et logistique chantier (> 30 km)" && tache.montantHt === 180,
  ),
  "ligne logistique ajoutée au BC",
);
assert(
  payloadAvecDeplacement.totalHt === payload.totalHt + 180,
  "frais logistiques inclus dans le total BC",
);

const finAdmin = calculerFinancesInternes(editionBrunel, ROLE_ADMIN);
assert(finAdmin.sousTraitance?.applicable > 0, "admin voit décomposition ST Brunel");
assert(finAdmin.coutClyveHt === 990, "Clyve inchangé");
const finCom = calculerFinancesInternes(editionBrunel, ROLE_COMMERCIAL);
assert(finCom.sousTraitance == null, "commercial sans marges ST");
assert(finCom.coutMaterielHt == null, "commercial sans matériel");

const masque = normaliserReferentielPourSauvegarde(referentiel, ROLE_COMMERCIAL);
assert(masque.artisans[0].grilles[0].fourniturePosePuHt == null, "PU internes masqués hors admin");

const marges = calculerMargesSousTraitance(
  [{ ...lignePac, modeSousTraitance: MODE_POSE_SEULE, artisanId: "smn-energies" }],
  referentiel,
);
assert(marges.extraMargeCaptureeHt === 500, "agrégat extra 500");

const lignesOs = lignesMarcheBrunel("option-baie");
const groupesOs = grouperLignesParArtisan(lignesOs, referentiel);
const c2lOs = groupesOs.find((g) => g.artisan.id === "c2l-isolation");
const bonheurOs = groupesOs.find((g) => g.artisan.id === "bonheur-amarante");
const smnOs = groupesOs.find((g) => g.artisan.id === "smn-energies");
assert(c2lOs?.lignes.length === 1 && c2lOs.lignes[0].quantite === 35, "OS C2L 35 m²");
assert(/soufflage laine de roche/i.test(c2lOs.lignes[0].specifications), "OS C2L soufflage R≥7");
assert(bonheurOs?.lignes.length === 3, "OS Bonheur 3 postes");
assert(bonheurOs.lignes.some((l) => l.quantite === 2 && /pvc blanc\/gris/i.test(l.nom)), "OS 2 fenêtres PVC");
assert(bonheurOs.lignes.some((l) => /ud ≤ 1,3/i.test(l.nom)), "OS porte Ud ≤ 1,3");
assert(bonheurOs.lignes.some((l) => /215×240/i.test(l.nom) && /ipn\/heb/i.test(l.nom)), "OS baie IPN/HEB");
assert(smnOs?.lignes.length === 3, "OS SMN 3 postes");
assert(smnOs.lignes.some((l) => /vmc hygro b/i.test(l.nom) && /gaines isolées/i.test(l.specifications)), "OS VMC");
assert(smnOs.lignes.some((l) => /200 l/i.test(l.nom)), "OS CET 200 L");
assert(smnOs.lignes.some((l) => /5 splits/i.test(l.nom) && /mustafa hezen/i.test(l.specifications)), "OS PAC SMN / HEZEN");
assert(!groupesOs.some((g) => /energia/i.test(g.artisan.raisonSociale)), "direction hors ordre de service");
const htmlOs = [
  payloadBonCommandeSousTraitance({ artisan: c2lOs.artisan, lignes: c2lOs.lignes, referentiel }),
  payloadBonCommandeSousTraitance({ artisan: bonheurOs.artisan, lignes: bonheurOs.lignes, referentiel }),
  payloadBonCommandeSousTraitance({ artisan: smnOs.artisan, lignes: smnOs.lignes, referentiel }),
]
  .map((payload) => htmlBonCommandeSousTraitance(payload))
  .join("\n");
assert(htmlOs.includes("35 m²"), "BC affiche 35 m²");
assert(!htmlOs.includes("100 m²"), "BC sans 100 m²");
assert(!/4 fenêtres/i.test(htmlOs), "BC sans 4 fenêtres");
assert(htmlOs.includes("2 fenêtres"), "BC quantité fenêtres");

const dossierBrunel = { id: BRUNEL_DOSSIER_ID, client: "Brunel" };
const htmlC2l = htmlBonCommandePourGroupe({
  artisan: c2lOs.artisan,
  lignes: c2lOs.lignes,
  dossier: dossierBrunel,
});
assert(htmlC2l.includes("BC-ST-2026-C2L-ISOLATION"), "numéro BC C2L");
assert(htmlC2l.includes("M. Emrick BRUNEL (Indivision COUBLE)"), "client Brunel");
assert(htmlC2l.includes("48 Impasse des Lagunes"), "adresse chantier");
assert(htmlC2l.includes("42510") && htmlC2l.includes("BUSSIÈRES"), "CP ville Bussières");
assert(htmlC2l.includes("À coordonner après validation Anah - Octobre 2026"), "date intervention");
assert(htmlC2l.includes("Isolation combles soufflage laine de roche 300 mm R=7,0"), "désignation C2L");
assert(htmlC2l.includes("35 m²"), "qté 35 m²");
assert(htmlC2l.includes("1 050,00"), "forfait 1 050 € HT");
assert(!htmlC2l.includes("2 200,00"), "plus de 2 200 € HT");
assert(!htmlC2l.includes("100 m²"), "plus de 100 m²");
assert(htmlC2l.includes("Cahier des Prescriptions Techniques Normalisées"), "section cahier Anah");
assert(htmlC2l.includes("Annexe — Cahier des Prescriptions Techniques Normalisées"), "annexe cahier");
assert(htmlC2l.includes("ACERMI") && htmlC2l.includes("DTU 45.11") && htmlC2l.includes("CEKAL"), "prescriptions lots");
assert(htmlC2l.includes("SCOP") && htmlC2l.includes("cerfa 15497"), "prescriptions CVC");
assert(htmlC2l.includes("certifie sur l’honneur"), "engagement sous-traitant");
assert(nomFichierBonCommande(c2lOs.artisan, dossierBrunel) === "c2l-isolation-chantier.html", "fichier C2L");

console.log("OK verify-artisans-rge — annuaire, double tarif, marges, BC autoliquidation, totaux verrouillés.");
