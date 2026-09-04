import { createClient } from "@supabase/supabase-js";

function clientOuNull() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

function texte(value) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function nomDepuisClient(client) {
  if (!client || typeof client !== "object") return "";
  return `${texte(client.prenom)} ${texte(client.nom)}`.trim();
}

function estPaye(status) {
  const s = texte(status).toLowerCase();
  return s.includes("payé") || s.includes("paye") || s.includes("paid") || s.includes("réglé") || s.includes("regle");
}

function etapeDepuisStatut(status) {
  const s = texte(status).toLowerCase();
  if (!s) return "non_renseigne";
  if (s.includes("chantier") || s.includes("travaux")) return "chantier";
  if (s.includes("devis") || s.includes("attente de signature")) return "devis";
  if (s.includes("sign")) return "signe";
  if (s.includes("audit") || s.includes("cours")) return "audit";
  if (s.includes("qualif")) return "qualifie";
  if (s.includes("attente") || s.includes("nouveau") || s.includes("lead")) return "nouveau";
  return "autre";
}

/**
 * Charge uniquement des lignes existantes. Aucun client ni montant n’est inventé.
 * En cas d’erreur RLS / réseau : listes vides + message, jamais de jeu fictif mélange.
 */
export async function chargerDonneesCrm() {
  const resultat = {
    source: "indisponible",
    audits: [],
    leads: [],
    leadsCount: 0,
    erreurs: [],
  };

  const supabase = clientOuNull();
  if (!supabase) {
    resultat.erreurs.push("Variables Supabase absentes (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
    return resultat;
  }

  const auditsReq = supabase
    .from("audits")
    .select("id, status, statut, created_at, client_id, clients(nom, prenom, ville, adresse)")
    .order("created_at", { ascending: false })
    .limit(50);

  const leadsReq = supabase
    .from("leads_courtier")
    .select("id, prenom, nom, region, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(50);

  const [auditsRes, leadsRes] = await Promise.allSettled([auditsReq, leadsReq]);

  if (auditsRes.status === "fulfilled") {
    const { data, error } = auditsRes.value;
    if (error) {
      resultat.erreurs.push(`Table audits : ${error.message}`);
    } else {
      resultat.source = "live";
      resultat.audits = (data ?? []).map((row) => {
        const client = row.clients && !Array.isArray(row.clients) ? row.clients : null;
        const statut = texte(row.status ?? row.statut);
        const nom = nomDepuisClient(client);
        return {
          id: texte(row.id),
          nom: nom || `Dossier ${texte(row.id).slice(0, 8) || "sans nom"}`,
          nomRenseigne: Boolean(nom),
          ville: texte(client?.ville) || texte(client?.adresse),
          statut: statut || "Non renseigné",
          etape: etapeDepuisStatut(statut),
          paye: estPaye(statut),
          date: row.created_at || null,
          href: texte(row.id) ? `/audit/${row.id}` : "",
        };
      });
    }
  } else {
    resultat.erreurs.push(`Table audits : ${auditsRes.reason?.message ?? "échec de lecture"}`);
  }

  if (leadsRes.status === "fulfilled") {
    const { data, error, count } = leadsRes.value;
    if (error) {
      resultat.erreurs.push(`Table leads_courtier : ${error.message}`);
    } else {
      resultat.source = "live";
      resultat.leads = (data ?? []).map((row) => ({
        id: texte(row.id),
        nom: `${texte(row.prenom)} ${texte(row.nom)}`.trim() || `Lead ${texte(row.id).slice(0, 8)}`,
        region: texte(row.region),
        date: row.created_at || null,
      }));
      resultat.leadsCount = typeof count === "number" ? count : resultat.leads.length;
    }
  } else {
    resultat.erreurs.push(`Table leads_courtier : ${leadsRes.reason?.message ?? "échec de lecture"}`);
  }

  return resultat;
}

export function regrouperPipeline(audits) {
  const ordre = [
    { id: "nouveau", label: "Nouveau / en attente", color: "#38bdf8" },
    { id: "qualifie", label: "Qualifié", color: "#22d3ee" },
    { id: "audit", label: "Audit en cours", color: "#34d399" },
    { id: "devis", label: "Devis", color: "#a3e635" },
    { id: "signe", label: "Signé", color: "#10b981" },
    { id: "chantier", label: "Chantier", color: "#0f766e" },
    { id: "autre", label: "Autre statut", color: "#64748b" },
    { id: "non_renseigne", label: "Non renseigné", color: "#475569" },
  ];
  const counts = Object.fromEntries(ordre.map((etape) => [etape.id, 0]));
  for (const audit of audits) {
    counts[audit.etape] = (counts[audit.etape] ?? 0) + 1;
  }
  return ordre
    .map((etape) => ({ ...etape, count: counts[etape.id] }))
    .filter((etape) => etape.count > 0);
}

export const PAGES_TEST_LOCALES = [
  {
    id: "royer",
    label: "Page de test Royer",
    href: "/test-maison-royer",
    hint: "Module audit énergétique — hors production",
  },
  {
    id: "pereira",
    label: "Page de test Pereira",
    href: "/test-maison-pereira",
    hint: "Dossier CRM de test — devis 50 103 € TTC — hors production",
  },
  {
    id: "marjollet",
    label: "Dossier Monsieur Marjollet",
    href: "/test-maison-marjollet",
    hint: "AUDIT-MARJOLLET-2026-001 — estimation à saisir — hors production",
  },
  {
    id: "clyve",
    label: "Page de test Clyve",
    href: "/test-maison-clyve",
    hint: "Dossier de démonstration Clyve — hors production",
  },
];
