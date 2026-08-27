import { supabase } from "../supabase";
import type {
  Audit,
  AuditEnergetiqueModuleProps,
  Confiance,
  Controle,
  DevisAnalyse,
  Document,
  DonneeLogement,
  Origine,
  PiecePlan,
  Project,
  Scenario,
  Statut,
  WorkItem,
} from "../../types/audit";
import {
  DEFAULT_AID_PROFILES,
  DEFAULT_DISCLAIMER,
  DEFAULT_MISSING_LABEL,
  DEFAULT_STATUT_LEGENDES,
} from "../../types/audit";

export type ProjectAuditBundle = AuditEnergetiqueModuleProps;

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : null;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function text(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function optionalText(value: unknown): string | undefined {
  const result = text(value);
  return result ? result : undefined;
}

function isStatut(value: unknown): value is Statut {
  return (
    value === "EXTRAIT" ||
    value === "À VÉRIFIER" ||
    value === "INCOHÉRENCE" ||
    value === "DONNÉE MANQUANTE" ||
    value === "PRÊT POUR VALIDATION HUMAINE" ||
    value === "AUDIT RÉGLEMENTAIRE REÇU" ||
    value === "PRÊT POUR VALIDATION MAR"
  );
}

function isOrigine(value: unknown): value is Origine {
  return value === "photo" || value === "plan" || value === "devis" || value === "hypothèse" || value === "audit";
}

function isConfiance(value: unknown): value is Confiance {
  return value === "élevé" || value === "moyen" || value === "faible" || value === "illisible";
}

async function fetchTableById(table: string, id: string): Promise<JsonRecord | null> {
  const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (error) return null;
  return asRecord(data);
}

async function fetchByForeignKey(table: string, column: string, id: string): Promise<JsonRecord[]> {
  const { data, error } = await supabase.from(table).select("*").eq(column, id);
  if (error) return [];
  return asArray<JsonRecord>(data);
}

function mapDocument(row: JsonRecord, index: number): Document {
  const nom = text(row.nom ?? row.name ?? row.fichier ?? row.filename, `document-${index + 1}`);
  const url = optionalText(row.imageSrc ?? row.image_src ?? row.url ?? row.public_url);
  const origine = isOrigine(row.origine) ? row.origine : url ? "photo" : "hypothèse";
  const typePhoto = text(row.type, origine);
  return {
    id: text(row.id, `doc-${index + 1}`),
    nom,
    type: typePhoto,
    extraits: asArray<string>(row.extraits),
    confiance: isConfiance(row.confiance) ? row.confiance : "moyen",
    origine,
    statut: isStatut(row.statut) ? row.statut : "À VÉRIFIER",
    imageSrc: url,
    kind: origine === "devis" ? "devis" : origine === "plan" ? "plan" : "photo",
    photoAvantSrc: optionalText(row.photoAvantSrc ?? row.photo_avant_src) ?? url,
    photoApresSrc: optionalText(row.photoApresSrc ?? row.photo_apres_src ?? row.after_url),
  };
}

function mapWorkItem(row: JsonRecord): WorkItem {
  const source =
    row.source === "DEVIS RÉEL" || row.source === "ESTIMATION TECHNIQUE" || row.source === "HYPOTHÈSE"
      ? row.source
      : "ESTIMATION TECHNIQUE";
  return {
    libelle: text(row.libelle ?? row.label, "Lot"),
    detail: text(row.detail ?? row.description),
    montantTtc: Number(row.montantTtc ?? row.montant_ttc ?? 0) || 0,
    source,
    reference: text(row.reference),
  };
}

function mapScenario(row: JsonRecord, index: number): Scenario {
  return {
    id: text(row.id, String.fromCharCode(65 + index)),
    code: optionalText(row.code),
    titre: text(row.titre ?? row.title, `Scénario ${index + 1}`),
    nomCourt: text(row.nomCourt ?? row.nom_court, text(row.titre, `Option ${index + 1}`)),
    objectif: text(row.objectif ?? row.objective),
    badge: text(row.badge, "Option"),
    recommande: Boolean(row.recommande ?? row.recommended),
    dpeAvantHypothese: optionalText(row.dpeAvantHypothese ?? row.dpe_avant),
    dpeApresHypothese: optionalText(row.dpeApresHypothese ?? row.dpe_apres),
    gainDeperditionsHypothese: optionalText(row.gainDeperditionsHypothese ?? row.gain_deperditions),
    lotsInclus: asArray<JsonRecord>(row.lotsInclus ?? row.lots_inclus ?? row.travaux).map(mapWorkItem),
    lotsExclus: asArray<string>(row.lotsExclus ?? row.lots_exclus),
    totalTtc: Number(row.totalTtc ?? row.total_ttc ?? 0) || 0,
    photoAvantSrc: optionalText(row.photoAvantSrc ?? row.photo_avant_src),
    photoAvantNom: optionalText(row.photoAvantNom ?? row.photo_avant_nom),
    projectionWowSrc: optionalText(row.projectionWowSrc ?? row.projection_wow_src),
    photoApresSrc: optionalText(row.photoApresSrc ?? row.photo_apres_src),
    transformations: asArray<string>(row.transformations),
    sources: asArray<string>(row.sources),
    confiance: isConfiance(row.confiance) ? row.confiance : "moyen",
    notesTechniques: asArray<string>(row.notesTechniques ?? row.notes_techniques),
  };
}

function mapProjectFromRow(
  projectRow: JsonRecord | null,
  clientRow: JsonRecord | null,
  fallbackId: string,
): Project {
  const nested = asRecord(projectRow?.project_data ?? projectRow?.projectData);
  const source = nested ?? projectRow ?? {};
  const clientNom = optionalText(
    source.clientNom ?? source.client_nom ?? clientRow?.nom ?? clientRow?.name,
  );
  const adresse = optionalText(
    source.adresse ??
      source.client_adresse ??
      clientRow?.adresse ??
      clientRow?.address,
  );
  return {
    id: text(source.id ?? projectRow?.id, fallbackId),
    titre: text(source.titre ?? source.title, clientNom ? `Audit — ${clientNom}` : "Audit énergétique"),
    sousTitre: optionalText(source.sousTitre ?? source.sous_titre),
    documentTitle: optionalText(source.documentTitle ?? source.document_title),
    clientNom,
    adresse,
    disclaimer: text(source.disclaimer, DEFAULT_DISCLAIMER),
    missingLabel: text(source.missingLabel ?? source.missing_label, DEFAULT_MISSING_LABEL),
    headerKicker: optionalText(source.headerKicker ?? source.header_kicker),
    headerNote: optionalText(source.headerNote ?? source.header_note),
    scenariosIntro: optionalText(source.scenariosIntro ?? source.scenarios_intro),
    footer: optionalText(source.footer),
    presentationHref: optionalText(source.presentationHref ?? source.presentation_href),
    rapportHref: optionalText(source.rapportHref ?? source.rapport_href),
    piecesPlan: asArray<PiecePlan>(source.piecesPlan ?? source.pieces_plan),
    piecesPlanSommeDetail: optionalText(source.piecesPlanSommeDetail ?? source.pieces_plan_somme_detail),
    donneesLogement: asArray<DonneeLogement>(source.donneesLogement ?? source.donnees_logement),
    devis: asArray<DevisAnalyse>(source.devis),
    links: Array.isArray(source.links) ? source.links : undefined,
  };
}

function mapAuditFromRow(auditRow: JsonRecord | null, projectId: string): Audit {
  const nested = asRecord(auditRow?.audit_data ?? auditRow?.auditData);
  const source = nested ?? auditRow ?? {};
  return {
    id: optionalText(source.id ?? auditRow?.id),
    projectId: optionalText(source.projectId ?? source.project_id ?? auditRow?.client_id) ?? projectId,
    controles: asArray<Controle>(source.controles),
    statutLegendes: asArray(source.statutLegendes ?? source.statut_legendes).length
      ? asArray(source.statutLegendes ?? source.statut_legendes)
      : DEFAULT_STATUT_LEGENDES,
    statutGlobal: source.statutGlobal ?? source.statut_global ?? undefined,
    preRapport: asArray<string>(source.preRapport ?? source.pre_rapport),
    mentions: asRecord(source.mentions) ?? undefined,
    profilsSimulation: asArray(source.profilsSimulation ?? source.profils_simulation).length
      ? asArray(source.profilsSimulation ?? source.profils_simulation)
      : DEFAULT_AID_PROFILES,
    defaultProfilId: source.defaultProfilId ?? source.default_profil_id ?? "bleu",
  };
}

function assembleBundle(input: {
  projectId: string;
  projectRow: JsonRecord | null;
  auditRow: JsonRecord | null;
  clientRow: JsonRecord | null;
  documentRows: JsonRecord[];
  scenarioRows: JsonRecord[];
}): ProjectAuditBundle {
  const storedDocuments = asArray<JsonRecord>(
    input.projectRow?.documents ??
      input.projectRow?.documents_list ??
      input.auditRow?.documents ??
      input.auditRow?.documents_list,
  );
  const storedScenarios = asArray<JsonRecord>(
    input.projectRow?.scenarios ?? input.auditRow?.scenarios ?? input.auditRow?.scenarios_json,
  );

  const documentsList =
    storedDocuments.length > 0
      ? storedDocuments.map(mapDocument)
      : input.documentRows.map(mapDocument);

  const scenarios =
    storedScenarios.length > 0
      ? storedScenarios.map(mapScenario)
      : input.scenarioRows.map(mapScenario);

  return {
    projectData: mapProjectFromRow(input.projectRow ?? input.auditRow, input.clientRow, input.projectId),
    auditData: mapAuditFromRow(input.auditRow, input.projectId),
    documentsList,
    scenarios,
  };
}

/**
 * Charge un dossier d’audit par identifiant (projet ou audit).
 * Accepte un payload JSONB déjà au format du module, ou reconstitue depuis
 * les tables `audits`, `clients`, `photos`, `documents`, `scenarios`, `dossiers_clients`.
 */
export async function getProjectAuditById(projectId: string): Promise<ProjectAuditBundle> {
  if (!projectId) {
    throw new Error("Identifiant de projet manquant.");
  }

  const [auditRow, projectRow, dossierRow] = await Promise.all([
    fetchTableById("audits", projectId),
    fetchTableById("projects", projectId),
    fetchTableById("dossiers_clients", projectId),
  ]);

  const root = auditRow ?? projectRow ?? dossierRow;
  if (!root) {
    throw new Error(`Aucun projet trouvé pour l’id ${projectId}.`);
  }

  const clientId = text(root.client_id ?? root.clientId);
  const clientRow = clientId
    ? await fetchTableById("clients", clientId)
    : asRecord(root.clients) ?? null;

  const relatedId = text(root.id, projectId);
  const [photos, documents, scenarios] = await Promise.all([
    fetchByForeignKey("photos", "audit_id", relatedId),
    fetchByForeignKey("documents", "audit_id", relatedId),
    fetchByForeignKey("scenarios", "audit_id", relatedId),
  ]);

  return assembleBundle({
    projectId,
    projectRow: projectRow ?? dossierRow,
    auditRow,
    clientRow,
    documentRows: documents.length > 0 ? documents : photos,
    scenarioRows: scenarios,
  });
}
