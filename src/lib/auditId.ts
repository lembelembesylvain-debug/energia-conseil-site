const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Identifiants internes type AUDIT-PEREIRA-2026-001 (dossiers hors UUID Supabase). */
const AUDIT_CODE_RE = /^AUDIT-[A-Z0-9]+-\d{4}-\d{3}$/i;

export function isUuidAuditId(auditId: string | null | undefined): boolean {
  return typeof auditId === "string" && UUID_RE.test(auditId.trim());
}

export function isAuditIdValide(auditId: string | null | undefined): auditId is string {
  if (typeof auditId !== "string") return false;
  const id = auditId.trim();
  return UUID_RE.test(id) || AUDIT_CODE_RE.test(id);
}
