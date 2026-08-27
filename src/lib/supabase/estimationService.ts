import { supabase } from "../supabase";

export type TypeProjetEstimation = "photovoltaique" | "renovation_globale" | "autre";

export type StatutPrestationJson = "estimation" | "devis_demande" | "devis_recu" | "valide";

export type LigneEstimationJson = {
  id: string;
  posteId: string;
  nom: string;
  categorie: string;
  unite: string;
  description: string;
  quantite: number;
  coutMaterielUnitaireHt: number;
  coutMainOeuvreUnitaireHt: number;
  prixVenteUnitaireHt: number;
  tauxTva: number;
  statut: StatutPrestationJson;
  artisan: string;
  montantDevisReel: number;
  montant_devis_reel: number;
};

export type TotauxEstimation = {
  totalMaterielHt: number;
  totalArtisansHt: number;
  totalCoutRevientHt: number;
  totalVenteHt: number;
  totalTva: number;
  totalVenteTtc: number;
  margeBruteTotale: number;
  tauxMargeGlobal: number;
  commissionDamienHt: number;
  prestationClyveHt: number;
  margeEstimeeApresFraisHt: number;
  totalEstimeTheoriqueHt: number;
  totalDevisRecusHt: number;
  totalContractuelValideTtc: number;
};

export type EstimationEnregistree = {
  id: string;
  auditId: string;
  typeProjet: TypeProjetEstimation;
  statut: "brouillon" | "enregistree";
  lignes: LigneEstimationJson[];
  totaux: TotauxEstimation;
};

export type SaveEstimationInput = {
  auditId: string;
  estimationId?: string | null;
  typeProjet: TypeProjetEstimation;
  lignes: LigneEstimationJson[];
  totaux: TotauxEstimation;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TYPES_PROJET: TypeProjetEstimation[] = [
  "photovoltaique",
  "renovation_globale",
  "autre",
];

const MESSAGE_AUDIT_INTROUVABLE =
  "Aucun audit correspondant n’existe pour cet identifiant. L’estimation n’a pas été enregistrée.";

const MESSAGE_AUDIT_ID_INVALIDE = "Identifiant d’audit manquant ou invalide.";

const MESSAGE_MAUVAIS_AUDIT =
  "L’estimation renvoyée ne correspond pas à cet audit. Aucune donnée n’a été appliquée.";

const MESSAGE_RLS =
  "Accès refusé. Connectez-vous avec votre compte équipe ENERGIA.";

export function isAuditIdValide(auditId: string | null | undefined): auditId is string {
  return typeof auditId === "string" && UUID_RE.test(auditId.trim());
}

function normaliserId(value: string): string {
  return value.trim().toLowerCase();
}

function memeAudit(a: string, b: string): boolean {
  return normaliserId(a) === normaliserId(b);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

type ErreurSupabase = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
} | null;

function erreurPostgres(error: ErreurSupabase): string {
  return `${error?.code ?? ""} ${error?.message ?? ""} ${error?.details ?? ""} ${error?.hint ?? ""}`.toLowerCase();
}

function estErreurRls(error: ErreurSupabase): boolean {
  const texte = erreurPostgres(error);
  const code = (error?.code ?? "").toUpperCase();
  return (
    code === "42501" ||
    code === "PGRST301" ||
    code === "401" ||
    code === "403" ||
    texte.includes("42501") ||
    texte.includes("permission denied") ||
    texte.includes("row-level security") ||
    texte.includes("rls") ||
    texte.includes("not authorized") ||
    texte.includes("jwt") && texte.includes("expired")
  );
}

function messageErreurPersistance(error: ErreurSupabase, fallback: string): string {
  if (estErreurRls(error)) {
    return MESSAGE_RLS;
  }
  if (estAuditIntrouvable(error)) {
    return MESSAGE_AUDIT_INTROUVABLE;
  }
  return error?.message || fallback;
}

function estAuditIntrouvable(error: ErreurSupabase): boolean {
  const texte = erreurPostgres(error);
  return (
    error?.code === "23503" ||
    texte.includes("23503") ||
    texte.includes("foreign key") ||
    texte.includes("estimations_audit_id_fkey") ||
    (texte.includes("audits") && texte.includes("violat"))
  );
}

function estConflitUniqueAbsent(error: ErreurSupabase): boolean {
  const texte = erreurPostgres(error);
  return texte.includes("no unique or exclusion constraint matching the on conflict");
}

const STATUTS_PRESTATION: StatutPrestationJson[] = [
  "estimation",
  "devis_demande",
  "devis_recu",
  "valide",
];

function mapStatutPrestation(value: unknown): StatutPrestationJson {
  return STATUTS_PRESTATION.includes(value as StatutPrestationJson)
    ? (value as StatutPrestationJson)
    : "estimation";
}

function mapLigne(value: unknown): LigneEstimationJson | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = toText(row.id);
  const posteId = toText(row.posteId ?? row.poste_id);
  if (!id || !posteId) return null;
  const montantDevisReel = toNumber(row.montantDevisReel ?? row.montant_devis_reel);
  return {
    id,
    posteId,
    nom: toText(row.nom),
    categorie: toText(row.categorie),
    unite: toText(row.unite),
    description: toText(row.description),
    quantite: toNumber(row.quantite),
    coutMaterielUnitaireHt: toNumber(row.coutMaterielUnitaireHt ?? row.cout_materiel_unitaire_ht),
    coutMainOeuvreUnitaireHt: toNumber(
      row.coutMainOeuvreUnitaireHt ?? row.cout_main_oeuvre_unitaire_ht,
    ),
    prixVenteUnitaireHt: toNumber(row.prixVenteUnitaireHt ?? row.prix_vente_unitaire_ht),
    tauxTva: toNumber(row.tauxTva ?? row.taux_tva),
    statut: mapStatutPrestation(row.statut),
    artisan: toText(row.artisan),
    montantDevisReel,
    montant_devis_reel: montantDevisReel,
  };
}

function mapTypeProjet(value: unknown): TypeProjetEstimation {
  return TYPES_PROJET.includes(value as TypeProjetEstimation)
    ? (value as TypeProjetEstimation)
    : "autre";
}

function mapRow(row: Record<string, unknown>): EstimationEnregistree {
  const lignesRaw = Array.isArray(row.lignes_json) ? row.lignes_json : [];
  return {
    id: toText(row.id),
    auditId: toText(row.audit_id),
    typeProjet: mapTypeProjet(row.type_projet),
    statut: row.statut === "brouillon" ? "brouillon" : "enregistree",
    lignes: lignesRaw.map(mapLigne).filter((ligne): ligne is LigneEstimationJson => ligne !== null),
    totaux: {
      totalMaterielHt: toNumber(row.total_materiel_ht),
      totalArtisansHt: toNumber(row.total_artisans_ht),
      totalCoutRevientHt: toNumber(row.total_cout_revient_ht),
      totalVenteHt: toNumber(row.total_vente_ht),
      totalTva: toNumber(row.total_tva),
      totalVenteTtc: toNumber(row.total_vente_ttc),
      margeBruteTotale: toNumber(row.marge_brute_totale),
      tauxMargeGlobal: toNumber(row.taux_marge_global),
      commissionDamienHt: toNumber(row.commission_damien_ht),
      prestationClyveHt: toNumber(row.prestation_clyve_ht),
      margeEstimeeApresFraisHt: toNumber(row.marge_estimee_apres_frais_ht),
      totalEstimeTheoriqueHt: toNumber(row.total_estime_theorique_ht),
      totalDevisRecusHt: toNumber(row.total_devis_recus_ht),
      totalContractuelValideTtc: toNumber(row.total_contractuel_valide_ttc),
    },
  };
}

function payloadDb(input: SaveEstimationInput) {
  return {
    audit_id: input.auditId.trim(),
    type_projet: input.typeProjet,
    statut: "enregistree" as const,
    lignes_json: input.lignes,
    total_materiel_ht: input.totaux.totalMaterielHt,
    total_artisans_ht: input.totaux.totalArtisansHt,
    total_cout_revient_ht: input.totaux.totalCoutRevientHt,
    total_vente_ht: input.totaux.totalVenteHt,
    total_tva: input.totaux.totalTva,
    total_vente_ttc: input.totaux.totalVenteTtc,
    marge_brute_totale: input.totaux.margeBruteTotale,
    taux_marge_global: input.totaux.tauxMargeGlobal,
    commission_damien_ht: input.totaux.commissionDamienHt,
    prestation_clyve_ht: input.totaux.prestationClyveHt,
    marge_estimee_apres_frais_ht: input.totaux.margeEstimeeApresFraisHt,
    updated_at: new Date().toISOString(),
  };
}

function reponseLigne(
  row: Record<string, unknown> | null,
  auditId: string,
  fallbackErreur: string,
): { data: EstimationEnregistree | null; error: string | null } {
  if (!row) {
    return { data: null, error: fallbackErreur };
  }
  const mapped = mapRow(row);
  if (!memeAudit(mapped.auditId, auditId)) {
    return { data: null, error: MESSAGE_MAUVAIS_AUDIT };
  }
  return { data: mapped, error: null };
}

async function verifierAuditExiste(auditId: string): Promise<string | null> {
  const { data, error } = await supabase.from("audits").select("id").eq("id", auditId).maybeSingle();
  if (error) {
    if (estErreurRls(error)) {
      return MESSAGE_RLS;
    }
    return null;
  }
  return data ? null : MESSAGE_AUDIT_INTROUVABLE;
}

async function updateParAuditId(
  body: ReturnType<typeof payloadDb>,
  auditId: string,
): Promise<{ data: EstimationEnregistree | null; error: string | null }> {
  const { data, error } = await supabase
    .from("estimations")
    .update(body)
    .eq("audit_id", auditId)
    .select("*")
    .maybeSingle();

  if (error) {
    return { data: null, error: messageErreurPersistance(error, "Impossible de mettre à jour l’estimation.") };
  }
  return reponseLigne(asRecord(data), auditId, "La mise à jour n’a renvoyé aucune ligne.");
}

async function insertOuUpdate(
  body: ReturnType<typeof payloadDb>,
  auditId: string,
): Promise<{ data: EstimationEnregistree | null; error: string | null }> {
  const existing = await getEstimationByAuditId(auditId);
  if (existing.error) {
    return existing;
  }
  if (existing.data) {
    return updateParAuditId(body, auditId);
  }

  const { data, error } = await supabase.from("estimations").insert(body).select("*").maybeSingle();
  if (error) {
    if (error.code === "23505") {
      return updateParAuditId(body, auditId);
    }
    return { data: null, error: messageErreurPersistance(error, "Impossible d’enregistrer l’estimation.") };
  }
  return reponseLigne(asRecord(data), auditId, "L’enregistrement n’a renvoyé aucune ligne.");
}

export async function getEstimationByAuditId(
  auditId: string,
): Promise<{ data: EstimationEnregistree | null; error: string | null }> {
  if (!isAuditIdValide(auditId)) {
    return { data: null, error: MESSAGE_AUDIT_ID_INVALIDE };
  }

  const id = auditId.trim();
  const { data, error } = await supabase
    .from("estimations")
    .select("*")
    .eq("audit_id", id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { data: null, error: messageErreurPersistance(error, "Impossible de charger l’estimation.") };
  }
  if (!data) {
    return { data: null, error: null };
  }
  return reponseLigne(asRecord(data), id, "Impossible de charger l’estimation.");
}

export async function saveEstimation(
  input: SaveEstimationInput,
): Promise<{ data: EstimationEnregistree | null; error: string | null }> {
  if (!isAuditIdValide(input.auditId)) {
    return { data: null, error: MESSAGE_AUDIT_ID_INVALIDE };
  }

  const auditId = input.auditId.trim();
  const auditManquant = await verifierAuditExiste(auditId);
  if (auditManquant) {
    return { data: null, error: auditManquant };
  }

  const body = payloadDb({ ...input, auditId });

  const { data, error } = await supabase
    .from("estimations")
    .upsert(body, { onConflict: "audit_id" })
    .select("*")
    .maybeSingle();

  if (!error) {
    return reponseLigne(asRecord(data), auditId, "L’enregistrement n’a renvoyé aucune ligne.");
  }

  if (estErreurRls(error)) {
    return { data: null, error: MESSAGE_RLS };
  }

  if (estAuditIntrouvable(error)) {
    return { data: null, error: MESSAGE_AUDIT_INTROUVABLE };
  }

  if (estConflitUniqueAbsent(error)) {
    return insertOuUpdate(body, auditId);
  }

  if (error.code === "23505") {
    return updateParAuditId(body, auditId);
  }

  return { data: null, error: messageErreurPersistance(error, "Impossible d’enregistrer l’estimation.") };
}
