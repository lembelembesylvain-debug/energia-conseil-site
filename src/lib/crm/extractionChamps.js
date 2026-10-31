/**
 * Modèle d’extraction semi-automatique.
 * Les valeurs restent proposées jusqu’à validation humaine.
 * Aucune écriture silencieuse sur une valeur existante.
 */

export const STATUTS_CHAMP = [
  "missing",
  "extracted",
  "proposed",
  "manually_corrected",
  "validated",
  "conflicting",
  "rejected",
];

export const NIVEAUX_CONFIANCE = ["high", "medium", "low", "none"];

export function identifiantChamp(prefix, value) {
  const slug = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${prefix}:${slug || "valeur"}`;
}

function maintenantIso() {
  return new Date().toISOString();
}

function idChamp() {
  return `champ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function creerChampPropose({
  field,
  value,
  unit = null,
  sourceDocument,
  sourcePage = null,
  confidence = "medium",
  categorie = "donnee",
  nEstPasUneLigneTravaux = false,
  prixFerme = false,
  sourcePrix = null,
  sensible = false,
}) {
  const date = maintenantIso();
  return {
    id: idChamp(),
    field,
    value,
    unit,
    sourceDocument,
    sourcePage,
    confidence,
    status: "proposed",
    validatedBy: null,
    validatedAt: null,
    categorie,
    nEstPasUneLigneTravaux,
    prixFerme: false,
    prixFermePropose: Boolean(prixFerme),
    sourcePrix,
    sensible,
    valeurProposee: null,
    sourceDocumentConflict: null,
    historique: [
      {
        date,
        action: "extracted",
        valeur: value,
        auteur: "systeme",
      },
    ],
  };
}

export function valeursEquivalentes(a, b) {
  if (a == null && b == null) return true;
  if (typeof a === "number" && typeof b === "number") return a === b;
  if (typeof a === "object" || typeof b === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return String(a ?? "").trim() === String(b ?? "").trim();
}

/**
 * Ajoute des champs extraits sans écraser une valeur déjà présente.
 * En cas d’écart : statut conflicting, ancienne valeur conservée.
 */
export function fusionnerChampsSansEcrasement(existants, nouveaux) {
  const resultat = Array.isArray(existants) ? existants.map((c) => ({ ...c, historique: [...(c.historique || [])] })) : [];

  for (const nouveau of nouveaux || []) {
    const actuel = resultat.find((c) => c.field === nouveau.field && c.status !== "rejected");
    if (!actuel) {
      resultat.push({ ...nouveau, status: nouveau.status || "proposed" });
      continue;
    }
    if (valeursEquivalentes(actuel.value, nouveau.value)) {
      actuel.historique = [
        ...(actuel.historique || []),
        {
          date: maintenantIso(),
          action: "source_confirmee",
          valeur: nouveau.value,
          auteur: "systeme",
          sourceDocument: nouveau.sourceDocument,
        },
      ];
      continue;
    }
    actuel.status = "conflicting";
    actuel.valeurProposee = nouveau.value;
    actuel.sourceDocumentConflict = nouveau.sourceDocument;
    actuel.historique = [
      ...(actuel.historique || []),
      {
        date: maintenantIso(),
        action: "conflict",
        valeur: actuel.value,
        valeurProposee: nouveau.value,
        auteur: "systeme",
        sourceDocument: nouveau.sourceDocument,
      },
    ];
  }

  return resultat;
}

export function validerChamp(champ, auteur = "administrateur") {
  if (!champ) return champ;
  return {
    ...champ,
    status: "validated",
    validatedBy: auteur,
    validatedAt: maintenantIso(),
    historique: [
      ...(champ.historique || []),
      { date: maintenantIso(), action: "validated", valeur: champ.value, auteur },
    ],
  };
}

export function modifierChamp(champ, nouvelleValeur, auteur = "administrateur") {
  if (!champ) return champ;
  return {
    ...champ,
    value: nouvelleValeur,
    status: "manually_corrected",
    valeurProposee: null,
    sourceDocumentConflict: null,
    validatedBy: null,
    validatedAt: null,
    historique: [
      ...(champ.historique || []),
      {
        date: maintenantIso(),
        action: "manually_corrected",
        ancienneValeur: champ.value,
        valeur: nouvelleValeur,
        auteur,
      },
    ],
  };
}

export function rejeterChamp(champ, auteur = "administrateur") {
  if (!champ) return champ;
  return {
    ...champ,
    status: "rejected",
    validatedBy: null,
    validatedAt: null,
    historique: [
      ...(champ.historique || []),
      { date: maintenantIso(), action: "rejected", valeur: champ.value, auteur },
    ],
  };
}

export function appliquerActionChamp(champs, champId, action, payload = {}, auteur = "administrateur") {
  return (champs || []).map((champ) => {
    if (champ.id !== champId) return champ;
    if (action === "valider") return validerChamp(champ, auteur);
    if (action === "modifier") return modifierChamp(champ, payload.valeur, auteur);
    if (action === "rejeter") return rejeterChamp(champ, auteur);
    return champ;
  });
}

export function champEstIncertain(champ) {
  if (!champ) return true;
  if (champ.status === "conflicting" || champ.status === "rejected" || champ.status === "missing") return true;
  if (champ.confidence === "low" || champ.confidence === "none") return true;
  if (champ.status !== "validated") return true;
  return false;
}
