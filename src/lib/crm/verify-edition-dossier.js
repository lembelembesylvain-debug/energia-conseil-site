/**
 * Contrôles du mode édition CRM (6 modules).
 * Exécution : node src/lib/crm/verify-edition-dossier.js
 */

import {
  CANAL_ECO_PTZ_ETAT,
  CANAL_PRET_TRAVAUX_FABIEN,
  calculerAidesIndicatives,
  calculerFinancement,
  calculerFinancesInternes,
  coutClyveEffectif,
  calculerLigneTravaux,
  creerLigneTravaux,
  editionVide,
  MENTION_CEE_INTEGREE_PARCOURS,
  mensualiteTauxZero,
  ordreThermiqueLigne,
  regionDepuisCodePostal,
  reinitialiserEditionTests,
  totauxTravaux,
  trierLignesThermiques,
} from "./editionDossier.js";
import { ecoPtzAutomatique } from "./tunnelProptech.js";
import { ROLE_ADMIN, ROLE_COMMERCIAL, ROLE_PARTENAIRE } from "./roles.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

reinitialiserEditionTests();

assert(ordreThermiqueLigne({ nom: "Isolation combles perdus" }) === 1, "ordre combles");
assert(ordreThermiqueLigne({ nom: "ITE murs", familleId: "isolation" }) === 2, "ordre murs");
assert(ordreThermiqueLigne({ nom: "Fenêtres PVC" }) === 4, "ordre fenêtres");
assert(ordreThermiqueLigne({ nom: "VMC double flux" }) === 5, "ordre VMC");
assert(ordreThermiqueLigne({ nom: "PAC air/eau" }) === 6, "ordre PAC");
assert(ordreThermiqueLigne({ nom: "Ballon thermodynamique" }) === 7, "ordre ECS");
assert(ordreThermiqueLigne({ nom: "Photovoltaïque 6 kWc" }) === 8, "ordre PV");

const desordonne = trierLignesThermiques([
  { id: "pv", nom: "Panneaux PV" },
  { id: "combles", nom: "Isolation combles" },
  { id: "pac", nom: "PAC air/eau" },
]);
assert(desordonne[0].id === "combles" && desordonne[2].id === "pv", "tri thermique Combles avant PV");

assert(regionDepuisCodePostal("71150") === "BFC", "Chagny / Saône-et-Loire → BFC");
assert(regionDepuisCodePostal("69006") === "AURA", "Lyon → AURA");

const ligneCombles = {
  id: "l1",
  nom: "Isolation des combles perdus",
  familleId: "isolation",
  quantite: 40,
  puHt: 50,
  tauxTva: 0.055,
};
const lignePac = {
  id: "l2",
  nom: "PAC air/eau",
  familleId: "chauffage",
  quantite: 1,
  puHt: 15000,
  tauxTva: 0.055,
};
const ligneVmc = {
  id: "l3",
  nom: "VMC double flux",
  familleId: "ventilation",
  quantite: 1,
  puHt: 6000,
  tauxTva: 0.055,
};

const totaux = totauxTravaux([ligneVmc, lignePac, ligneCombles]);
assert(totaux.lignes[0].nom.includes("combles"), "totaux triés");
assert(totaux.totalHt === 23000, `HT ${totaux.totalHt} ≠ 23000`);

const edition = {
  ...editionVide(),
  travaux: totaux.lignes,
  aides: {
    profil: "bleu",
    parcours: "parcours",
    gainClasses: 2,
    region: "BFC",
    overrides: { mpr: null, cee: null, locales: null, coupDePouce: null },
  },
  financement: { ecoPtzMontant: 15000, ecoPtzDuree: 15, apportPersonnel: null },
  finances: { coutMaterielHt: 8000, coutPoseRgeHt: 10000, tauxCommission: 10 },
};

const aides = calculerAidesIndicatives(edition);
assert(aides.calculable === true, "aides calculables");
assert(aides.mpr === 18400, `MPR parcours bleu ${aides.mpr} ≠ 18400`);
assert(aides.cee === 0, `CEE parcours = 0 (intégrées MPR), obtenu ${aides.cee}`);
assert(aides.locales === 0, `locales auto = 0, obtenu ${aides.locales}`);
assert(aides.coupDePouce === 0, "coup de pouce parcours = 0");
assert(aides.nonCumulCeeParcours === true, "flag non-cumul CEE parcours");
assert(aides.mentionCee === MENTION_CEE_INTEGREE_PARCOURS, "mention CEE intégrée");
assert(aides.totalAides === 18400, `total aides parcours = MPR seul ${aides.totalAides}`);
assert(aides.ecrete === false, "pas d’écrêtement MPR seul sous plafond TTC");
assert(aides.totalAides <= aides.totalTtc, "cumul ≤ TTC");
assert(/indicatif/i.test(aides.mention), "disclaimer aides");

const aidesGeste = calculerAidesIndicatives({
  ...edition,
  aides: { ...edition.aides, parcours: "geste" },
});
assert(aidesGeste.cee === 4600, `CEE geste ${aidesGeste.cee} ≠ 4600`);
assert(aidesGeste.coupDePouce === 4700, "coup de pouce geste 2 classes");
assert(aidesGeste.locales === 0, "geste : pas de locales auto");
assert(aidesGeste.nonCumulCeeParcours === false, "geste : cumul CEE autorisé");

const localesManuelles = calculerAidesIndicatives({
  ...edition,
  aides: { ...edition.aides, overrides: { ...edition.aides.overrides, locales: 1200 } },
});
assert(localesManuelles.locales === 1200, "locales uniquement si saisie manuelle");
assert(localesManuelles.totalAides === 19600, `MPR + locales manuelles ${localesManuelles.totalAides}`);

const ecraseCeeParcours = calculerAidesIndicatives({
  ...edition,
  aides: { ...edition.aides, overrides: { ...edition.aides.overrides, cee: 8000, coupDePouce: 4700 } },
});
assert(ecraseCeeParcours.cee === 0 && ecraseCeeParcours.coupDePouce === 0, "parcours : CEE/CDP forcés à 0 même en override");

const ecrase = calculerAidesIndicatives({
  ...edition,
  aides: { ...edition.aides, overrides: { ...edition.aides.overrides, mpr: 10000 } },
});
assert(ecrase.mpr === 10000, "override admin MPR");

const plan = calculerFinancement(edition);
assert(plan.totalTtc === totaux.totalTtc, "TTC financement = travaux");
assert(plan.resteACharge === Math.round((totaux.totalTtc - aides.totalAides + Number.EPSILON) * 100) / 100, "RAC = TTC − aides");
assert(plan.mensualite === 83.33, `mensualité 0 % ${plan.mensualite} ≠ 83.33`);
assert(plan.ecoPtzDuree === 15, "durée 15 ans");
assert(plan.mensualite15 === 83.33 && plan.mensualite20 === 62.5, "simulations 15 / 20 ans");
assert(plan.canalEcoPtz.id === CANAL_ECO_PTZ_ETAT.id, "canal 1 Éco-PTZ État");
assert(!/FABIEN|VIVONS|courtier/i.test(CANAL_ECO_PTZ_ETAT.titre + CANAL_ECO_PTZ_ETAT.rappel + CANAL_ECO_PTZ_ETAT.option), "Éco-PTZ sans Fabien");
assert(/FABIEN/.test(CANAL_PRET_TRAVAUX_FABIEN.titre) && /06 71 19 96 45/.test(CANAL_PRET_TRAVAUX_FABIEN.option), "canal 2 Fabien");
assert(/6 000/.test(CANAL_PRET_TRAVAUX_FABIEN.pretTravaux) && /75 000/.test(CANAL_PRET_TRAVAUX_FABIEN.enveloppe), "enveloppe prêt travaux");
assert(/35 %/.test(CANAL_PRET_TRAVAUX_FABIEN.regroupement), "taux d’endettement 35 %");
assert(/ne constitue pas une offre de prêt/i.test(plan.mention), "disclaimer financement");

const finAdmin = calculerFinancesInternes(edition, ROLE_ADMIN);
assert(finAdmin.visibleComplet === true, "admin voit tout");
assert(finAdmin.commission === 2300, `commission 10 % ${finAdmin.commission}`);
assert(finAdmin.coutRevient === 18000, "coût revient matériel + pose");
assert(finAdmin.margeBrute === 5000, "marge brute");
assert(finAdmin.coutClyveHt === 990, "Clyve 990 HT par défaut");
assert(coutClyveEffectif({ coutClyveHt: 1100 }) === 990, "ancien forfait 1 100 HT relu en 990");
assert(finAdmin.margeNette === 1710, "marge nette après Clyve (5 000 − 2 300 − 990)");

const finCom = calculerFinancesInternes(edition, ROLE_COMMERCIAL);
assert(finCom.visibleComplet === false, "commercial : pas de marge");
assert(finCom.margeNette == null && finCom.coutRevient == null, "coûts masqués commercial");
assert(finCom.coutClyveHt == null, "commercial : pas de coût Clyve");
assert(finCom.commission === 2300, "commercial voit sa commission");

const finPart = calculerFinancesInternes(edition, ROLE_PARTENAIRE);
assert(finPart.margeNette == null, "partenaire sans marge nette");

const creee = creerLigneTravaux({
  familleId: "isolation",
  prestation: {
    id: "x",
    nom: "Isolation combles",
    unite: "m²",
    prixVenteHt: 45,
    tauxTva: 0.055,
    referenceMarche: null,
  },
  quantite: 20,
});
assert(creee.totalHt === 900, "ligne catalogue 20×45");
assert(creee.ordreThermique === 1, "nouvelle ligne combles en 1");

const brunelJaune = {
  ...editionVide(),
  travaux: [
    calculerLigneTravaux({
      id: "brunel-anah",
      nom: "Bouquet Parcours Accompagné Brunel",
      familleId: "isolation",
      quantite: 1,
      unite: "forfait",
      puHt: 28933.89,
      tauxTva: 0.055,
    }),
  ],
  aides: {
    profil: "jaune",
    parcours: "parcours",
    gainClasses: 2,
    region: "AURA",
    overrides: { mpr: null, cee: null, locales: null, coupDePouce: null },
  },
};
const aidesBrunel = calculerAidesIndicatives(brunelJaune);
assert(aidesBrunel.mpr === 17360.33, `Brunel Jaune 60 % HT ${aidesBrunel.mpr} ≠ 17 360,33`);
assert(aidesBrunel.cee === 0 && aidesBrunel.coupDePouce === 0 && aidesBrunel.locales === 0, "Brunel : CEE/CDP/locales à 0");
assert(aidesBrunel.totalAides === 17360.33, "Brunel : aides d’État = MPR");
const racBrunel = Math.round((aidesBrunel.totalTtc - aidesBrunel.totalAides + Number.EPSILON) * 100) / 100;
assert(Math.round(Math.abs(racBrunel - 13164.93) * 100) <= 1, `Brunel RAC ${racBrunel} ≈ 13 164,93 (écart ≤ 1 ct TVA)`);
assert(aidesBrunel.totalAides <= aidesBrunel.plafondEcretement, "Brunel : sous écrêtement Jaune 80 % TTC");
const ecoBrunel = ecoPtzAutomatique(13164.93, { parcours: "parcours" });
assert(ecoBrunel.duree === 20, "Brunel Éco-PTZ 20 ans (parcours)");
assert(ecoBrunel.montant === 13164.93, "Éco-PTZ = 13 164,93 €");
assert(ecoBrunel.mensualite === 54.85, `mensualité 54,85 €, obtenu ${ecoBrunel.mensualite}`);
assert(ecoBrunel.mensualite20 === 54.85, "Option A 20 ans = 54,85 €");
assert(ecoBrunel.mensualite15 === 73.14, `Option A 15 ans = 73,14 €, obtenu ${ecoBrunel.mensualite15}`);
assert(mensualiteTauxZero(13164.93, 20) === 54.85, "mensualité taux zéro 20 ans");
assert(ecoBrunel.canal === CANAL_ECO_PTZ_ETAT.id, "Brunel : Éco-PTZ = canal 1 État");
const planBrunel = calculerFinancement({
  ...brunelJaune,
  financement: { ecoPtzMontant: 13164.93, ecoPtzDuree: 20, apportPersonnel: null },
});
assert(planBrunel.mensualite === 54.85, "formulaire Brunel 54,85 € / mois");
assert(planBrunel.canalPretTravaux.id === CANAL_PRET_TRAVAUX_FABIEN.id, "Brunel : canal 2 Fabien distinct");

console.log("OK — mode édition CRM : fiche/travaux/aides/financement/pièces/finances.");
