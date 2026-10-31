/**
 * Parseur devis PDF texte / lignes tabulaires.
 * Un prix n’est jamais marqué ferme. Une fourchette reste indicative.
 * Une recommandation sans quantité n’est pas une ligne de travaux.
 */

import { creerChampPropose, identifiantChamp } from "../extractionChamps.js";

function nombreFr(brut) {
  if (brut == null || brut === "") return null;
  const n = Number(String(brut).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function ligneEstFourchette(ligne) {
  return /fourchette|indicatif|indicative|\d+[.,]?\d*\s*(à|a|\/|-|–)\s*\d+[.,]?\d*/i.test(ligne);
}

function ligneEstRecommandation(ligne) {
  return /recommand/i.test(ligne) && !/\d+[.,]?\d*\s*(m²|m2|u|ml|ens|forfait)/i.test(ligne);
}

export function extraireEnteteDevis(texte, sourceDocument, sourcePage = 1) {
  const brut = String(texte || "");
  const champs = [];
  const push = (field, value, confidence = "high") => {
    if (value == null || String(value).trim() === "") return;
    champs.push(
      creerChampPropose({
        field,
        value: typeof value === "string" ? value.trim() : value,
        sourceDocument,
        sourcePage,
        confidence,
        categorie: "devis",
        prixFerme: false,
      }),
    );
  };

  const numero = brut.match(/\b(DEV-20\d{2}-[A-Z0-9-]+)\b/i)?.[1];
  push("referenceDevis", numero ? numero.toUpperCase() : null);

  const client = brut.match(/client\s*[:\-]\s*([^\n]+)/i)?.[1];
  push("nomClient", client, "medium");

  const adresse = brut.match(/adresse(?: des travaux| du bien)?\s*[:\-]\s*([^\n]+)/i)?.[1];
  push("adresseTravaux", adresse, "medium");

  return champs;
}

export function extraireLignesDevisDepuisTexte(texte, sourceDocument, sourcePage = 1) {
  const champs = extraireEnteteDevis(texte, sourceDocument, sourcePage);
  const lignes = String(texte || "").split(/\r?\n/);

  for (const ligne of lignes) {
    const trimmed = ligne.trim();
    if (!trimmed) continue;

    if (ligneEstRecommandation(trimmed)) {
      champs.push(
        creerChampPropose({
          field: identifiantChamp("recommandation", trimmed),
          value: trimmed,
          sourceDocument,
          sourcePage,
          confidence: "medium",
          categorie: "recommandation",
          nEstPasUneLigneTravaux: true,
          prixFerme: false,
        }),
      );
      continue;
    }

    const match = trimmed.match(
      /^(.+?)\s+(\d+[.,]?\d*)\s*(m²|m2|u|ens|forfait|ml|unité|unite)\s+(\d[\d\s]*[.,]?\d*)(?:\s*[-–à/]\s*(\d[\d\s]*[.,]?\d*))?\s*€/i,
    );
    if (!match) continue;

    const designation = match[1].trim();
    const quantite = nombreFr(match[2]);
    const unite = match[3];
    const fourchette = ligneEstFourchette(trimmed) || Boolean(match[5]);
    const prixHt = fourchette ? null : nombreFr(match[4]);
    if (!designation || quantite == null) continue;
    if (prixHt == null && !fourchette) continue;

    champs.push(
      creerChampPropose({
        field: identifiantChamp("ligneTravaux", designation),
        value: {
          prestation: designation,
          quantite,
          unite,
          prixHt,
          tva: null,
          prixTtc: null,
          sourcePrix: fourchette ? "fourchette" : "devis",
          prixFerme: false,
          statutPrix: fourchette ? "indicatif" : "a_verifier",
        },
        sourceDocument,
        sourcePage,
        confidence: fourchette ? "medium" : "high",
        categorie: "travaux",
        nEstPasUneLigneTravaux: false,
        prixFerme: false,
        sourcePrix: fourchette ? "fourchette" : "devis",
      }),
    );
  }

  return champs;
}
