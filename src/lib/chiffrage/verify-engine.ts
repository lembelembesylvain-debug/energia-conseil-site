/**
 * Vérifications du moteur de chiffrage (sans framework de test).
 * Exécution : npx tsx src/lib/chiffrage/verify-engine.ts
 */

import {
  calculerChiffrage,
  calculerDeplacementArtisan,
  calculerDeplacementEnergia,
  calculerDeplacements,
  calculerLigne,
  creerArtisanVide,
  creerDeplacementsInitiaux,
  creerDeplacementEnergia,
  creerGrilleInitiale,
  parametresParDefaut,
  prixSortantDepuisCoutInterne,
  round2,
  visitesEnergiaParDefaut,
} from "./index";
import type { AideEstimative, DeplacementArtisanSaisie, PosteSaisie } from "./types";

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(`ÉCHEC : ${message}`);
  }
}

function almostEqual(a: number, b: number, eps = 0.02): boolean {
  return Math.abs(a - b) <= eps;
}

function ligneCombles(tauxMarge: number): PosteSaisie {
  const params = parametresParDefaut("standard");
  const base = creerGrilleInitiale("performance", params).find((l) => l.id === "isolation_combles");
  if (!base) throw new Error("Poste isolation_combles introuvable");
  return {
    ...base,
    inclus: true,
    quantite: 100,
    coutEntrantUnitaireHt: 40,
    sourcePrix: "devis_sous_traitant",
    dateVerification: "2026-01-15",
    tauxAleas: 0.04,
    tauxPilotage: 0.07,
    fraisComplementaires: 0,
    tauxMarge,
    tauxTva: 0.055,
  };
}

function aide(montantRetenu: number): AideEstimative {
  return {
    id: "test",
    libelle: "Test",
    organisme: "ANAH",
    conditionsAVerifier: "Test",
    dateValidite: "2026-12-31",
    montantEstimatif: montantRetenu,
    montantRetenu,
    commentaire: "",
  };
}

console.log("— Formule de marge (coût interne → prix de vente HT) —");
const casMarge: { taux: number; interne: number; attendu: number }[] = [
  { taux: 0.1, interne: 900, attendu: 1000 },
  { taux: 0.12, interne: 880, attendu: 1000 },
  { taux: 0.15, interne: 850, attendu: 1000 },
];
for (const cas of casMarge) {
  const obtenu = prixSortantDepuisCoutInterne(cas.interne, cas.taux);
  assert(
    almostEqual(obtenu, cas.attendu),
    `marge ${cas.taux * 100} % : attendu ${cas.attendu}, obtenu ${obtenu}`,
  );
  const margeEuros = round2(obtenu - cas.interne);
  const margeReelle = margeEuros / obtenu;
  assert(
    almostEqual(margeReelle, cas.taux, 0.0001),
    `marge réelle ${cas.taux * 100} % : obtenu ${(margeReelle * 100).toFixed(4)} %`,
  );
  console.log(
    `  ${cas.taux * 100} % : ${cas.interne} € / ${1 - cas.taux} = ${obtenu} € HT (marge ${margeEuros} €)`,
  );
}

console.log("— Ligne isolation combles (entrant 4 000 €, aléas 4 %, pilotage 7 %) —");
const interneAttendu = 4000 + 160 + 280;
assert(interneAttendu === 4440, "coût interne de référence 4 440 €");

const attendusLigne: Record<number, number> = {
  0.1: round2(4440 / 0.9),
  0.12: round2(4440 / 0.88),
  0.15: round2(4440 / 0.85),
};

for (const taux of [0.1, 0.12, 0.15] as const) {
  const calculee = calculerLigne(ligneCombles(taux));
  const ht = calculee.prixSortantHt;
  const attendu = attendusLigne[taux];
  assert(calculee.coutInterne === 4440, `coût interne 4 440 € (marge ${taux * 100} %)`);
  assert(ht != null && almostEqual(ht, attendu), `HT marge ${taux * 100} % : attendu ${attendu}, obtenu ${ht}`);
  assert(
    ht != null && calculee.montantMarge != null && almostEqual(calculee.montantMarge / ht, taux, 0.0001),
    `taux de marge réel ${taux * 100} % sur le prix de vente`,
  );
  console.log(
    `  ${taux * 100} % : HT ${ht} € | marge ${calculee.montantMarge} € | TTC ${calculee.prixSortantTtc} €`,
  );
}

const params = parametresParDefaut("standard");
const lignes = creerGrilleInitiale("performance", params).map((ligne): PosteSaisie =>
  ligne.id === "isolation_combles" ? ligneCombles(0.1) : ligne,
);

const resultat = calculerChiffrage(lignes, params, [aide(1000)]);
const combles = resultat.lignes.find((l) => l.id === "isolation_combles");
assert(combles?.coutEntrantTotalHt === 4000, "entrant combles 4 000 €");
assert(combles?.montantAleas === 160, "aléas 4 % = 160");
assert(combles?.montantPilotage === 280, "pilotage 7 % = 280");
assert(resultat.totaux.budgetAffichable, "budget affichable avec un devis sous-traitant");
assert(
  resultat.recapAides.resteAChargeEstimatif != null &&
    resultat.recapAides.resteAChargeEstimatif ===
      round2(resultat.totaux.totalSortantTtc - 1000),
  "reste à charge = TTC − aides (sous le plafond)",
);

const sansPrix = calculerChiffrage(creerGrilleInitiale("performance", params), params, [aide(1000)]);
assert(!sansPrix.totaux.budgetAffichable, "pas de budget sans tarif vérifié");
assert(
  sansPrix.avertissements.some((a) => a.id === "budget-non-affichable"),
  "avertissement budget non affichable",
);

console.log("— Plafond des aides ≤ coût des travaux TTC —");
const ttc = resultat.totaux.totalSortantTtc;
assert(ttc > 0, "TTC de référence > 0");

const depassement = calculerChiffrage(lignes, params, [aide(999999)]);
assert(depassement.recapAides.plafondApplique, "plafond appliqué si saisie > TTC");
assert(
  depassement.recapAides.totalRetenu === ttc,
  `aides retenues plafonnées au TTC (${ttc}), obtenu ${depassement.recapAides.totalRetenu}`,
);
assert(
  depassement.recapAides.totalRetenu <= ttc,
  "les aides retenues ne dépassent jamais le TTC",
);
assert(
  depassement.recapAides.resteAChargeEstimatif === 0,
  "reste à charge = 0 € si aides plafonnées à 100 %",
);
assert(
  depassement.avertissements.some((a) => a.id === "aides-superieures"),
  "avertissement aides > travaux conservé",
);
assert(
  depassement.recapAides.totalRetenuSaisi === 999999,
  "la saisie brute reste visible (999 999 €)",
);
console.log(
  `  saisi 999 999 € → retenu ${depassement.recapAides.totalRetenu} € (TTC ${ttc} €) | RAC ${depassement.recapAides.resteAChargeEstimatif} €`,
);

const pilePoil = calculerChiffrage(lignes, params, [aide(ttc)]);
assert(pilePoil.recapAides.totalRetenu === ttc, "aides = TTC : retenu égal au TTC");
assert(pilePoil.recapAides.resteAChargeEstimatif === 0, "aides = TTC : RAC 0");
assert(!pilePoil.recapAides.plafondApplique, "pas de plafond si aides = TTC");

const sousPlafond = calculerChiffrage(lignes, params, [aide(500)]);
assert(sousPlafond.recapAides.totalRetenu === 500, "sous le plafond : retenu = saisi");
assert(!sousPlafond.recapAides.plafondApplique, "pas de plafond si aides < TTC");
assert(
  sousPlafond.recapAides.resteAChargeEstimatif === round2(ttc - 500),
  "RAC = TTC − 500",
);

const obsolete = calculerChiffrage(
  lignes.map((l) => (l.id === "isolation_combles" ? { ...l, dateVerification: "2020-01-01" } : l)),
  params,
  [aide(1000)],
);
assert(
  obsolete.avertissements.some((a) => a.id === "tarifs-obsoletes"),
  "avertissement tarif > 12 mois",
);

console.log("— Barèmes kilométriques : aucune valeur inventée —");
const defautKm = parametresParDefaut("standard");
assert(defautKm.deplacement.coutKilometriqueEnergiaHt == null, "pas de 0,60 €/km ENERGIA par défaut");
assert(defautKm.deplacement.coutKilometriqueArtisanHt == null, "pas de coût km artisan inventé");
assert(defautKm.deplacement.coutHoraireTempsDeplacementHt == null, "pas de coût horaire inventé");
assert(!defautKm.adresseChantier, "adresse chantier vide par défaut");

function artisanLocal(inclusDansDevis: boolean): DeplacementArtisanSaisie {
  return {
    ...creerArtisanVide(),
    nomArtisan: "2C ENERGIES",
    adresseDepart: "12 rue des Artisans, 69100 Villeurbanne",
    distanceAllerRetourKm: 8,
    sourceDistance: "saisie_manuelle",
    nombreDeplacements: 2,
    coutKilometriqueHt: 0.55,
    coutPeageHt: 0,
    coutStationnementHt: 0,
    deplacementDejaInclusDansDevis: inclusDansDevis,
    sourceCout: "devis_sous_traitant",
    dateVerification: "2026-03-01",
  };
}

const paramsDeplacement = parametresParDefaut("standard");
paramsDeplacement.adresseChantier = "10 rue du Client, 69003 Lyon";
paramsDeplacement.adresseDepartEnergia = "16 Rue Cuvier, 69006 Lyon";
paramsDeplacement.deplacement.coutKilometriqueEnergiaHt = 0.5;
paramsDeplacement.deplacement.coutKilometriqueArtisanHt = 0.55;
paramsDeplacement.tauxMarge = 0.1;

console.log("— Artisan local, déplacement déjà inclus dans le devis —");
const artisanInclus = calculerDeplacementArtisan(artisanLocal(true), paramsDeplacement.adresseChantier, null);
assert(almostEqual(artisanInclus.fraisEstimesHt ?? -1, 8.8), `estimé 8,80 €, obtenu ${artisanInclus.fraisEstimesHt}`);
assert(artisanInclus.fraisAjoutesHt === 0, "inclus : 0 € ajouté au coût interne");
assert(artisanInclus.statutFacturation === "inclus_dans_devis", "statut inclus dans le devis");
assert(artisanInclus.adresseDepart.includes("Villeurbanne"), "adresse artisan, pas Lyon par défaut");
assert(!creerArtisanVide().adresseDepart, "nouvel artisan : adresse de départ vide (pas Lyon)");

console.log("— Artisan local, déplacement non inclus —");
const artisanAjoute = calculerDeplacementArtisan(artisanLocal(false), paramsDeplacement.adresseChantier, null);
assert(almostEqual(artisanAjoute.fraisAjoutesHt, 8.8), "non inclus : 8,80 € ajoutés");
assert(artisanAjoute.statutFacturation === "ajoute_separement", "statut ajouté séparément");

console.log("— ENERGIA : une visite —");
const energiaBase = creerDeplacementEnergia(paramsDeplacement.adresseDepartEnergia, paramsDeplacement.deplacement);
energiaBase.distanceAllerRetourKm = 40;
energiaBase.coutKilometriqueHt = 0.5;
energiaBase.visites = visitesEnergiaParDefaut().map((visite) =>
  visite.id === "audit_initial" ? { ...visite, nombre: 1 } : visite,
);
const uneVisite = calculerDeplacementEnergia(energiaBase, paramsDeplacement.adresseChantier, null);
assert(uneVisite.nombreVisites === 1, "1 visite ENERGIA");
assert(uneVisite.distanceTotaleKm === 40, "40 km totaux");
assert(almostEqual(uneVisite.fraisDeplacementHt ?? -1, 20), `frais 20 €, obtenu ${uneVisite.fraisDeplacementHt}`);
assert(uneVisite.libelle === "Déplacements, visites et suivi ENERGIA CONSEIL IA®", "libellé ENERGIA");

console.log("— ENERGIA : plusieurs visites —");
energiaBase.visites = visitesEnergiaParDefaut().map((visite) => {
  if (visite.id === "audit_initial") return { ...visite, nombre: 1 };
  if (visite.id === "suivi_chantier") return { ...visite, nombre: 2 };
  if (visite.id === "reception") return { ...visite, nombre: 1 };
  return visite;
});
const plusieursVisites = calculerDeplacementEnergia(energiaBase, paramsDeplacement.adresseChantier, null);
assert(plusieursVisites.nombreVisites === 4, "4 visites ENERGIA");
assert(plusieursVisites.distanceTotaleKm === 160, "160 km totaux");
assert(almostEqual(plusieursVisites.fraisDeplacementHt ?? -1, 80), "80 € pour 4 visites");

console.log("— Distance inconnue —");
const inconnu = calculerDeplacementArtisan(
  { ...artisanLocal(false), distanceAllerRetourKm: null, coutPeageHt: 0, coutStationnementHt: 0 },
  paramsDeplacement.adresseChantier,
  null,
);
assert(inconnu.distanceTotaleKm == null, "distance totale inconnue");
assert(inconnu.fraisKmHt == null, "pas de frais km inventés");
assert(!inconnu.estimationComplete, "estimation incomplète");

console.log("— Péage et stationnement —");
const avecAnnexes = calculerDeplacementArtisan(
  { ...artisanLocal(false), coutPeageHt: 12, coutStationnementHt: 8 },
  paramsDeplacement.adresseChantier,
  null,
);
assert(almostEqual(avecAnnexes.fraisEstimesHt ?? -1, 28.8), `8,80 + 12 + 8 = 28,80, obtenu ${avecAnnexes.fraisEstimesHt}`);

console.log("— Absence de double comptabilisation —");
const mixte = calculerDeplacements(
  {
    artisans: [artisanLocal(true), artisanLocal(false)],
    energia: {
      ...energiaBase,
      visites: visitesEnergiaParDefaut().map((visite) =>
        visite.id === "audit_initial" ? { ...visite, nombre: 1 } : visite,
      ),
      distanceAllerRetourKm: 40,
      coutKilometriqueHt: 0.5,
      coutPeageHt: 0,
      coutStationnementHt: 0,
    },
  },
  paramsDeplacement,
);
assert(almostEqual(mixte.totalArtisansEstimesHt, 17.6), "deux artisans estimés 17,60 €");
assert(almostEqual(mixte.totalArtisansAjoutesHt, 8.8), "un seul artisan ajouté (l’autre déjà inclus)");
assert(almostEqual(mixte.totalEnergiaHt, 20), "ENERGIA 20 € séparément");
assert(almostEqual(mixte.totalAjoutesHt, 28.8), "ajouté au coût interne : 8,80 + 20 = 28,80");
assert(
  mixte.artisans[0].adresseDepart !== paramsDeplacement.adresseDepartEnergia,
  "l’artisan n’utilise pas la base ENERGIA / Lyon",
);

console.log("— Marge réelle 10 %, 12 % et 15 % avec déplacements —");
const deplacementsMarge = creerDeplacementsInitiaux(paramsDeplacement);
deplacementsMarge.artisans = [artisanLocal(false)];
deplacementsMarge.energia = {
  ...energiaBase,
  visites: visitesEnergiaParDefaut().map((visite) =>
    visite.id === "audit_initial" ? { ...visite, nombre: 1 } : visite,
  ),
  distanceAllerRetourKm: 40,
  coutKilometriqueHt: 0.5,
};
const travelAjoute = 8.8 + 20;
const interneAvecTravel = 4440 + travelAjoute;

for (const taux of [0.1, 0.12, 0.15] as const) {
  const paramsTaux = { ...paramsDeplacement, tauxMarge: taux };
  const lignesTaux = creerGrilleInitiale("performance", paramsTaux).map((ligne): PosteSaisie =>
    ligne.id === "isolation_combles" ? ligneCombles(taux) : { ...ligne, inclus: ligne.id === "isolation_combles" },
  );
  const resultatTaux = calculerChiffrage(lignesTaux, paramsTaux, [aide(0)], deplacementsMarge);
  const attenduHt = round2(interneAvecTravel / (1 - taux));
  assert(
    almostEqual(resultatTaux.totaux.totalCoutInterne, interneAvecTravel),
    `coût interne ${interneAvecTravel} € (marge ${taux * 100} %)`,
  );
  assert(
    almostEqual(resultatTaux.totaux.totalSortantHt, attenduHt),
    `HT marge ${taux * 100} % : attendu ${attenduHt}, obtenu ${resultatTaux.totaux.totalSortantHt}`,
  );
  assert(
    resultatTaux.totaux.tauxMargeReel != null &&
      almostEqual(resultatTaux.totaux.tauxMargeReel, taux, 0.0001),
    `marge réelle ${taux * 100} % sur le prix de vente, pas une majoration du coût`,
  );
  const majorationNaive = round2(interneAvecTravel * (1 + taux));
  assert(
    !almostEqual(resultatTaux.totaux.totalSortantHt, majorationNaive),
    `ne pas confondre marge ${taux * 100} % et majoration × ${1 + taux}`,
  );
  const libellesClient = resultatTaux.devisClient.lignes.map((l) => l.libelle.toLowerCase());
  assert(!libellesClient.some((l) => l.includes("coût entrant") || l.includes("marge") || l.includes("sous-traitant")),
    "le devis client n’expose pas les données internes sensibles");
  console.log(
    `  ${taux * 100} % : interne ${interneAvecTravel} € → HT ${resultatTaux.totaux.totalSortantHt} € (≠ majoration ${majorationNaive} €)`,
  );
}

const resultatInconnu = calculerChiffrage(
  lignes,
  paramsDeplacement,
  [aide(1000)],
  {
    artisans: [{ ...artisanLocal(false), distanceAllerRetourKm: null }],
    energia: { ...energiaBase, distanceAllerRetourKm: null, visites: visitesEnergiaParDefaut().map((v) => v.id === "audit_initial" ? { ...v, nombre: 1 } : v) },
  },
);
assert(
  resultatInconnu.avertissements.some((a) => a.id === "distance-inconnue"),
  "avertissement distance inconnue",
);
assert(
  resultatInconnu.avertissements.some((a) => a.id === "distance-saisie-manuelle"),
  "avertissement saisie manuelle",
);
assert(!resultatInconnu.deplacements.definitif, "résultat non définitif si distance inconnue");

console.log("Vérifications du moteur de chiffrage : OK");
