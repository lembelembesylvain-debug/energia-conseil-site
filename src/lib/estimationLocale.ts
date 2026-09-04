import { isAuditIdValide, isUuidAuditId } from "./auditId";

export type TypeProjetLocal = "photovoltaique" | "renovation_globale" | "autre";

export type EstimationLocale = {
  id: string;
  auditId: string;
  typeProjet: TypeProjetLocal;
  statut: "brouillon" | "enregistree";
  lignes: Array<Record<string, unknown>>;
  totaux: Record<string, unknown>;
};

const PREFIX = "energia.estimation.";
const TYPES_PROJET: TypeProjetLocal[] = ["photovoltaique", "renovation_globale", "autre"];

export function estAuditIdLocal(auditId: string | null | undefined): boolean {
  return isAuditIdValide(auditId) && !isUuidAuditId(auditId);
}

function cle(auditId: string): string {
  return `${PREFIX}${auditId.trim()}`;
}

function nouveauId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}`;
}

function mapTypeProjet(value: unknown): TypeProjetLocal {
  return TYPES_PROJET.includes(value as TypeProjetLocal) ? (value as TypeProjetLocal) : "autre";
}

export function getEstimationLocale(
  auditId: string,
): { data: EstimationLocale | null; error: string | null } {
  if (!estAuditIdLocal(auditId)) {
    return { data: null, error: "Identifiant d’audit manquant ou invalide." };
  }
  if (typeof window === "undefined") {
    return { data: null, error: null };
  }
  try {
    const raw = window.localStorage.getItem(cle(auditId));
    if (!raw) return { data: null, error: null };
    const parsed = JSON.parse(raw) as Partial<EstimationLocale>;
    const idLu = typeof parsed.auditId === "string" ? parsed.auditId : "";
    if (!idLu || idLu.trim().toLowerCase() !== auditId.trim().toLowerCase()) {
      return { data: null, error: null };
    }
    return {
      data: {
        id: typeof parsed.id === "string" && parsed.id ? parsed.id : `local-${auditId.trim()}`,
        auditId: idLu,
        typeProjet: mapTypeProjet(parsed.typeProjet),
        statut: parsed.statut === "brouillon" ? "brouillon" : "enregistree",
        lignes: Array.isArray(parsed.lignes) ? parsed.lignes : [],
        totaux: parsed.totaux && typeof parsed.totaux === "object" ? parsed.totaux : {},
      },
      error: null,
    };
  } catch {
    return { data: null, error: "Impossible de charger l’estimation locale." };
  }
}

export function saveEstimationLocale(input: {
  auditId: string;
  estimationId?: string | null;
  typeProjet: TypeProjetLocal;
  lignes: Array<Record<string, unknown>>;
  totaux: Record<string, unknown>;
}): { data: EstimationLocale | null; error: string | null } {
  if (!estAuditIdLocal(input.auditId)) {
    return { data: null, error: "Identifiant d’audit manquant ou invalide." };
  }
  if (typeof window === "undefined") {
    return { data: null, error: "Enregistrement local indisponible hors navigateur." };
  }
  const auditId = input.auditId.trim();
  const existante = getEstimationLocale(auditId).data;
  const estimation: EstimationLocale = {
    id: input.estimationId?.trim() || existante?.id || nouveauId(),
    auditId,
    typeProjet: input.typeProjet,
    statut: "enregistree",
    lignes: input.lignes,
    totaux: input.totaux,
  };
  try {
    window.localStorage.setItem(cle(auditId), JSON.stringify(estimation));
    return { data: estimation, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Impossible d’enregistrer l’estimation localement.",
    };
  }
}
