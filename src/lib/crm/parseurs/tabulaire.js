/**
 * Parseur CSV / lignes tabulaires.
 * Une quantité ou un prix absent n’est jamais inventé.
 */

import { creerChampPropose, identifiantChamp } from "../extractionChamps.js";

const ALIAS_COLONNES = {
  surfacehabitable: "surfaceHabitable",
  surface: "surfaceHabitable",
  anneeconstruction: "anneeConstruction",
  annee: "anneeConstruction",
  dpeactuel: "dpeActuel",
  dpe: "dpeActuel",
  numerodpe: "numeroDpe",
  consommationannuelle: "consommationAnnuelle",
  consommation: "consommationAnnuelle",
  emissionsges: "emissionsGes",
  ges: "emissionsGes",
  adresseexacte: "adresseExacte",
  adresse: "adresseExacte",
  codepostal: "codePostal",
  cp: "codePostal",
  commune: "commune",
  ville: "commune",
  chauffageexistant: "chauffageExistant",
  chauffage: "chauffageExistant",
  eauchaude: "eauChaude",
  ecs: "eauChaude",
  ventilation: "ventilation",
  designation: "prestation",
  prestation: "prestation",
  quantite: "quantite",
  qte: "quantite",
  unite: "unite",
  prixht: "prixHt",
  puht: "prixHt",
  tva: "tva",
  prixttc: "prixTtc",
  champ: "champ",
  field: "champ",
  valeur: "valeur",
  value: "valeur",
};

function normaliserEntete(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function nombreFr(brut) {
  if (brut == null || String(brut).trim() === "") return null;
  const n = Number(String(brut).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function detecterSeparateur(ligne) {
  const pointsVirgule = (ligne.match(/;/g) || []).length;
  const virgules = (ligne.match(/,/g) || []).length;
  const tabs = (ligne.match(/\t/g) || []).length;
  if (tabs > 0 && tabs >= pointsVirgule && tabs >= virgules) return "\t";
  if (pointsVirgule >= virgules) return ";";
  return ",";
}

export function parserCsv(texte) {
  const brut = String(texte || "").replace(/^\uFEFF/, "");
  const lignes = brut.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lignes.length === 0) return { entetes: [], lignes: [] };
  const sep = detecterSeparateur(lignes[0]);
  const cellules = (ligne) => ligne.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
  const entetes = cellules(lignes[0]).map((h) => ALIAS_COLONNES[normaliserEntete(h)] || h);
  const rows = lignes.slice(1).map((ligne) => {
    const values = cellules(ligne);
    const obj = {};
    entetes.forEach((cle, i) => {
      obj[cle] = values[i] ?? "";
    });
    return obj;
  });
  return { entetes, lignes: rows };
}

function estLigneTravaux(entetes) {
  return entetes.includes("prestation") && (entetes.includes("quantite") || entetes.includes("prixHt"));
}

function estCleValeur(entetes) {
  return entetes.includes("champ") && entetes.includes("valeur");
}

export function extraireChampsTabulaires(texte, sourceDocument, sourcePage = 1) {
  const { entetes, lignes } = parserCsv(texte);
  if (entetes.length === 0 || lignes.length === 0) return [];

  if (estCleValeur(entetes)) {
    return lignes
      .filter((row) => row.champ && String(row.valeur).trim() !== "")
      .map((row) => {
        const field = ALIAS_COLONNES[normaliserEntete(row.champ)] || row.champ;
        const numerique = nombreFr(row.valeur);
        return creerChampPropose({
          field,
          value: numerique != null && String(row.valeur).match(/^[\d\s.,]+$/) ? numerique : row.valeur,
          unit: row.unite || row.unit || null,
          sourceDocument,
          sourcePage,
          confidence: "high",
          categorie: field === "prestation" ? "travaux" : "logement",
          prixFerme: false,
        });
      });
  }

  if (estLigneTravaux(entetes)) {
    return lignes.flatMap((row) => {
      const prestation = String(row.prestation || "").trim();
      const quantite = nombreFr(row.quantite);
      const prixHt = nombreFr(row.prixHt);
      if (!prestation) return [];
      if (quantite == null && prixHt == null) {
        return [
          creerChampPropose({
            field: identifiantChamp("recommandation", prestation),
            value: prestation,
            sourceDocument,
            sourcePage,
            confidence: "medium",
            categorie: "recommandation",
            nEstPasUneLigneTravaux: true,
            prixFerme: false,
          }),
        ];
      }
      if (quantite == null || prixHt == null) return [];
      const fourchette = /fourchette|indicatif|-/.test(String(row.sourcePrix || row.statut || ""));
      return [
        creerChampPropose({
          field: identifiantChamp("ligneTravaux", prestation),
          value: {
            prestation,
            quantite,
            unite: row.unite || null,
            prixHt,
            tva: nombreFr(row.tva),
            prixTtc: nombreFr(row.prixTtc),
            sourcePrix: fourchette ? "fourchette" : "devis",
            prixFerme: false,
            statutPrix: fourchette ? "indicatif" : "a_verifier",
          },
          sourceDocument,
          sourcePage,
          confidence: "high",
          categorie: "travaux",
          prixFerme: false,
          sourcePrix: fourchette ? "fourchette" : "devis",
        }),
      ];
    });
  }

  const champsLogement = [
    "surfaceHabitable",
    "anneeConstruction",
    "dpeActuel",
    "numeroDpe",
    "consommationAnnuelle",
    "emissionsGes",
    "adresseExacte",
    "codePostal",
    "commune",
    "chauffageExistant",
    "eauChaude",
    "ventilation",
  ];
  const row = lignes[0];
  return champsLogement
    .filter((field) => entetes.includes(field) && String(row[field] || "").trim() !== "")
    .map((field) => {
      const brut = row[field];
      const numerique = nombreFr(brut);
      const estNombre = ["surfaceHabitable", "anneeConstruction", "consommationAnnuelle", "emissionsGes"].includes(field);
      return creerChampPropose({
        field,
        value: estNombre && numerique != null ? numerique : brut,
        unit: field === "surfaceHabitable" ? "m²" : null,
        sourceDocument,
        sourcePage,
        confidence: "high",
        categorie: "logement",
        prixFerme: false,
      });
    });
}
