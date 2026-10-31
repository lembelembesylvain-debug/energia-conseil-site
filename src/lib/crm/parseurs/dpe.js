/**
 * Parseur DPE PDF texte — uniquement les champs clairement libellés.
 * Une recommandation DPE n’est jamais une ligne de travaux.
 */

import { creerChampPropose, identifiantChamp } from "../extractionChamps.js";

function capture(texte, regex) {
  const match = texte.match(regex);
  return match ? match[1].trim() : null;
}

function nombreFr(brut) {
  if (!brut) return null;
  const n = Number(String(brut).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function extraireRecommandationsDpe(texte, sourceDocument, sourcePage = 1) {
  const lignes = String(texte || "").split(/\r?\n/);
  const champs = [];
  for (const ligne of lignes) {
    if (!/recommand/i.test(ligne)) continue;
    const value = ligne.replace(/^[^\wÀ-ÿ]+/, "").trim();
    if (value.length < 8) continue;
    champs.push(
      creerChampPropose({
        field: identifiantChamp("recommandation", value),
        value,
        sourceDocument,
        sourcePage,
        confidence: "medium",
        categorie: "recommandation",
        nEstPasUneLigneTravaux: true,
      }),
    );
  }
  return champs;
}

export function extraireChampsDpe(texte, sourceDocument, sourcePage = 1) {
  const brut = String(texte || "");
  const champs = [];

  const push = (field, value, unit, confidence = "high") => {
    if (value == null || value === "") return;
    champs.push(
      creerChampPropose({
        field,
        value,
        unit,
        sourceDocument,
        sourcePage,
        confidence,
        categorie: "logement",
      }),
    );
  };

  const surface = nombreFr(capture(brut, /surface habitable[^0-9]{0,30}(\d+[.,]?\d*)\s*(?:m²|m2|m)/i));
  push("surfaceHabitable", surface, "m²");

  const annee = capture(brut, /ann[ée]e de construction[^0-9]{0,20}(\d{4})/i);
  if (annee && Number(annee) >= 1700 && Number(annee) <= 2026) push("anneeConstruction", Number(annee), null);

  const dpe = capture(brut, /(?:classe|étiquette)\s*[ée]nerg[ée]tique\s*[:\-]?\s*([A-G])\b/i) ||
    capture(brut, /\bDPE\s*(?:actuel)?\s*[:\-]\s*([A-G])\b/i);
  push("dpeActuel", dpe ? dpe.toUpperCase() : null, null);

  const numeroDpe = capture(brut, /(?:n[°o]\s*(?:dpe|ademe)|r[ée]f[ée]rence dpe)\s*[:\-]?\s*(\d{4}[A-Z]\d{5,12})/i) ||
    capture(brut, /\b(\d{4}[A-Z]\d{6,12})\b/);
  push("numeroDpe", numeroDpe, null);

  const conso = nombreFr(capture(brut, /consommation[^0-9]{0,50}(\d+[.,]?\d*)\s*kWh/i));
  push("consommationAnnuelle", conso, "kWh/m².an");

  const ges = nombreFr(capture(brut, /(?:émissions?\s*(?:de\s*)?GES|GES)\s*[:\-]?[^0-9]{0,20}(\d+[.,]?\d*)\s*kg/i));
  push("emissionsGes", ges, "kgCO2/m².an");

  const adresse = capture(brut, /adresse(?: du bien| du logement)?\s*[:\-]\s*([^\n]+)/i);
  push("adresseExacte", adresse, null);

  const cp = capture(brut, /(?:code postal|cp)\s*[:\-]?\s*(\d{5})/i);
  push("codePostal", cp, null);

  const commune = capture(brut, /(?:commune|ville)\s*[:\-]\s*([A-Za-zÀ-ÿ'’\- ]{2,40})/i);
  push("commune", commune, null);

  const typeLogement = /maison/i.test(brut) ? "maison" : /appartement/i.test(brut) ? "appartement" : null;
  if (typeLogement && /(type (?:de )?(?:bâtiment|logement)|maison individuelle|appartement)/i.test(brut)) {
    push("typeLogement", typeLogement, null);
  }

  const chauffage = capture(brut, /chauffage(?: existant)?\s*[:\-]\s*([^\n]+)/i);
  push("chauffageExistant", chauffage, null, "medium");

  const ecs = capture(brut, /(?:eau chaude|ECS)\s*[:\-]\s*([^\n]+)/i);
  push("eauChaude", ecs, null, "medium");

  const ventilation = capture(brut, /ventilation\s*[:\-]\s*([^\n]+)/i);
  push("ventilation", ventilation, null, "medium");

  return [...champs, ...extraireRecommandationsDpe(brut, sourceDocument, sourcePage)];
}
