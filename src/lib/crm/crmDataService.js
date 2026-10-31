import {
  etapeAnahDepuisStatut,
  infererSourceApporteur,
  libelleParcoursAnah,
  libelleSourceApporteur,
  normaliserEtapeAnah,
} from "./operationnelCrm.js";
import {
  clientSupabaseCrm,
  lireConfigSupabase,
  lireProjetsCrmDepuisSupabase,
  ligneCrmVersProjetManuel,
  synchroniserLeadsCourtierDepuisProjets,
  synchroniserProjetsVersSupabase,
} from "./crmSupabaseSync.js";

function clientOuNull() {
  return clientSupabaseCrm();
}

function texte(value) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function nomDepuisClient(client) {
  if (!client || typeof client !== "object") return "";
  return `${texte(client.prenom ?? client.first_name)} ${texte(client.nom ?? client.last_name)}`.trim();
}

function montant(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function estPaye(status) {
  const s = texte(status).toLowerCase();
  return s.includes("payé") || s.includes("paye") || s.includes("paid") || s.includes("réglé") || s.includes("regle");
}

function etapeDepuisStatut(status) {
  const s = texte(status).toLowerCase();
  if (!s) return "non_renseigne";
  if (s.includes("chantier") || s.includes("travaux")) return "chantier";
  if (s.includes("attente") && s.includes("signature")) return "devis";
  if (s.includes("contrat") && s.includes("validé")) return "devis";
  if (s.includes("devis")) return "devis";
  if (s.includes("signé") || s.includes("signe ")) return "signe";
  if (s.includes("audit") || s.includes("cours")) return "audit";
  if (s.includes("qualif")) return "qualifie";
  if (s.includes("attente") || s.includes("nouveau") || s.includes("lead") || s.includes("étude") || s.includes("etude")) {
    return "nouveau";
  }
  return "autre";
}

function mapperLigneLive(row, sourceTable) {
  const client =
    !row.clients || Array.isArray(row.clients)
      ? row.client && !Array.isArray(row.client)
        ? row.client
        : null
      : row.clients;
  const statut = texte(row.status ?? row.statut);
  const nom =
    texte(row.nom ?? row.name ?? row.client_nom) ||
    nomDepuisClient(client) ||
    `${texte(row.prenom)} ${texte(row.nom_famille ?? row.last_name)}`.trim();
  const apporteurId = infererSourceApporteur({
    apporteurId: row.apporteur_id ?? row.apporteur,
    apporteurNom: row.apporteur_nom ?? row.apporteur,
    partenaireId: row.partenaire_id ?? row.partner_id,
    source: row.source ?? sourceTable,
  });
  const brutAnah = texte(row.etape_anah ?? row.etapeAnah);
  const etapeAnah = brutAnah ? normaliserEtapeAnah(brutAnah) : etapeAnahDepuisStatut(statut);
  const caTtc = montant(row.ca_ttc ?? row.montant_ttc ?? row.total_ttc ?? row.montant_ttc);
  const caHt = montant(row.ca_ht ?? row.montant_ht ?? row.total_ht);
  return {
    id: texte(row.id),
    nom: nom || `Dossier ${texte(row.id).slice(0, 8) || "sans nom"}`,
    nomRenseigne: Boolean(nom),
    ville: texte(row.ville ?? client?.ville) || texte(row.adresse ?? client?.adresse),
    adresse: texte(row.adresse ?? client?.adresse),
    statut: statut || "Non renseigné",
    etape: etapeDepuisStatut(statut),
    etapeAnah,
    parcoursAnah: libelleParcoursAnah(etapeAnah),
    paye: estPaye(statut),
    date: row.created_at || row.updated_at || null,
    href: texte(row.id) ? `/audit/${row.id}` : "",
    source: sourceTable,
    email: texte(row.email ?? row.client_email ?? client?.email),
    telephone: texte(row.telephone ?? row.phone ?? row.tel ?? client?.telephone),
    caHt,
    caTtc,
    apporteurId,
    apporteurNom: texte(row.apporteur_nom) || libelleSourceApporteur(apporteurId),
    reference: texte(row.reference),
    typeProjet: texte(row.type_projet),
  };
}

function mapperLead(row, sourceTable) {
  const nom = `${texte(row.prenom ?? row.first_name)} ${texte(row.nom ?? row.last_name)}`.trim();
  const apporteurId = infererSourceApporteur({
    apporteurId: row.apporteur_id ?? row.apporteur ?? row.source,
    apporteurNom: row.apporteur_nom ?? row.apporteur ?? row.source,
    partenaireId: row.partenaire_id ?? row.partner_id,
    source: row.source ?? row.apporteur ?? sourceTable,
  });
  return {
    id: texte(row.id),
    prenom: texte(row.prenom ?? row.first_name),
    nomFamille: texte(row.nom ?? row.last_name),
    nom: nom || `Lead ${texte(row.id).slice(0, 8)}`,
    region: texte(row.ville ?? row.region ?? row.code_postal),
    ville: texte(row.ville ?? row.region),
    date: row.created_at || row.updated_at || null,
    source: sourceTable,
    sourceLead: texte(row.source ?? row.apporteur),
    apporteurId,
    email: texte(row.email),
    telephone: texte(row.telephone ?? row.phone),
    reference: texte(row.reference ?? row.id),
    typeProjet: texte(row.type_projet ?? row.type_travaux),
    typeTravaux: texte(row.type_travaux ?? row.type_projet),
    budget: montant(row.budget ?? row.montant_ttc),
    caTtc: montant(row.montant_ttc ?? row.budget),
    caHt: montant(row.montant_ht),
    statut: texte(row.statut),
    notes: texte(row.notes ?? row.description),
  };
}

/** Normalise un téléphone FR pour comparaison / déduplication. */
export function normaliserTelephoneLead(value) {
  const digits = texte(value).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 11 && digits.startsWith("33")) return `0${digits.slice(2)}`;
  if (digits.length === 12 && digits.startsWith("330")) return `0${digits.slice(3)}`;
  return digits;
}

/** Faux leads injectés en démo (061000000X, 060000000X, 0000000000, budget 0 factice). */
export function estLeadMockFactice(lead) {
  if (!lead || typeof lead !== "object") return true;
  const tel = normaliserTelephoneLead(lead.telephone);
  const email = texte(lead.email).toLowerCase();
  const budget = Number(lead.budget ?? lead.caTtc);
  const budgetZero = !Number.isFinite(budget) || budget <= 0;

  if (/^0+$/.test(tel)) return true;
  if (/^061000000\d$/.test(tel) || /^61000000\d$/.test(tel)) return true;
  if (/^060000000\d$/.test(tel) || /^60000000\d$/.test(tel)) return true;
  if (tel === "0000000000") return true;
  // Inserts CRM de test : crm+…@ 
  if (email.startsWith("crm+") && email.includes("@energia-conseil-ia.com")) return true;
  // Prénoms/noms clairement injectés par le sync mock sans téléphone réel
  const prenom = texte(lead.prenom).toLowerCase();
  const nom = texte(lead.nomFamille ?? lead.nom).toLowerCase();
  if (prenom === "cloison" || (prenom === "damien" && nom.includes("cloison"))) return true;
  if (prenom === "damien" && (nom.includes("pv") || nom.includes("100 kwc") || nom.includes("centrale")) && (/^060000000/.test(tel) || !tel || budgetZero)) {
    return true;
  }
  return false;
}

function scoreLeadPourDedup(lead) {
  let score = 0;
  if (texte(lead.telephone)) score += 2;
  if (texte(lead.ville || lead.region)) score += 1;
  if (texte(lead.typeTravaux || lead.typeProjet)) score += 2;
  if (texte(lead.email) && !texte(lead.email).startsWith("crm+")) score += 2;
  const budget = Number(lead.budget ?? lead.caTtc);
  if (Number.isFinite(budget) && budget > 0) score += 3 + Math.min(budget / 10000, 5);
  if (lead.date) score += 1;
  return score;
}

function cleNomLead(lead) {
  const prenom = texte(lead.prenom).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  const nom = texte(lead.nomFamille || lead.nom)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return `${prenom}|${nom}`.replace(/\s+/g, " ").trim();
}

/**
 * Retire les mocks et déduplique strictement par téléphone puis par nom.
 * En cas de doublon, conserve l’exemplaire le plus complet / récent.
 */
export function nettoyerLeadsCourtier(leads) {
  const bruts = (Array.isArray(leads) ? leads : []).filter((lead) => !estLeadMockFactice(lead));
  const parTel = new Map();
  const sansTel = [];

  for (const lead of bruts) {
    const tel = normaliserTelephoneLead(lead.telephone);
    if (tel.length >= 9) {
      const existant = parTel.get(tel);
      if (!existant) {
        parTel.set(tel, lead);
        continue;
      }
      const scoreN = scoreLeadPourDedup(lead);
      const scoreE = scoreLeadPourDedup(existant);
      const dateN = lead.date ? new Date(lead.date).getTime() : 0;
      const dateE = existant.date ? new Date(existant.date).getTime() : 0;
      if (scoreN > scoreE || (scoreN === scoreE && dateN >= dateE)) {
        parTel.set(tel, lead);
      }
      continue;
    }
    sansTel.push(lead);
  }

  const uniques = [...parTel.values()];
  const parNom = new Map();
  for (const lead of uniques) {
    const cle = cleNomLead(lead);
    if (!cle || cle === "|") {
      parNom.set(lead.id || `${Math.random()}`, lead);
      continue;
    }
    const existant = parNom.get(cle);
    if (!existant) {
      parNom.set(cle, lead);
      continue;
    }
    if (scoreLeadPourDedup(lead) >= scoreLeadPourDedup(existant)) parNom.set(cle, lead);
  }

  for (const lead of sansTel) {
    const cle = cleNomLead(lead);
    if (!cle || cle === "|") continue;
    // Déjà couvert par un lead avec téléphone + même identité
    if ([...parNom.values()].some((u) => cleNomLead(u) === cle)) continue;
    const existant = parNom.get(cle);
    if (!existant || scoreLeadPourDedup(lead) > scoreLeadPourDedup(existant)) {
      parNom.set(cle, lead);
    }
  }

  return [...parNom.values()].sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    return tb - ta;
  });
}

async function lireTable(supabase, table, select) {
  try {
    const { data, error, count } = await supabase.from(table).select(select, { count: "exact" }).limit(120);
    if (error) {
      return { ok: false, table, message: error.message, data: [], count: 0 };
    }
    return { ok: true, table, data: data ?? [], count: typeof count === "number" ? count : (data ?? []).length };
  } catch (erreur) {
    return { ok: false, table, message: erreur?.message ?? "échec de lecture", data: [], count: 0 };
  }
}

function resultatVide(source, connexion, sync) {
  return {
    source,
    connexion,
    sync,
    configure: lireConfigSupabase().configure,
    audits: [],
    leads: [],
    leadsCount: 0,
    projetsCrm: [],
    syncProjets: null,
    syncLeads: null,
    erreurs: [],
    avertissements: [],
  };
}

/**
 * Charge les données production Supabase.
 * Connexion = supabase dès que leads_courtier ou crm_projets répond OK (tables officielles).
 */
export async function chargerDonneesCrm({ production = false, projetsLocaux = [] } = {}) {
  if (!production) {
    return resultatVide("demo", "local", "idle");
  }

  const resultat = resultatVide("production", "offline", "loading");
  const { configure } = lireConfigSupabase();
  resultat.configure = configure;

  const supabase = clientOuNull();
  if (!supabase) {
    resultat.sync = "idle";
    resultat.connexion = "offline";
    resultat.avertissements.push(
      "Supabase non configuré — ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env ou .env.local puis redémarrez Vite.",
    );
    return resultat;
  }

  // Ping leads_courtier — schéma production réel (ville/notes/type_travaux…)
  let leadsCourtierRes = await lireTable(
    supabase,
    "leads_courtier",
    "id, prenom, nom, telephone, email, adresse, ville, code_postal, statut, type_travaux, budget, apporteur, commission_apporteur, notes, created_at, updated_at",
  );
  if (!leadsCourtierRes.ok && /column|does not exist|schema/i.test(leadsCourtierRes.message || "")) {
    leadsCourtierRes = await lireTable(supabase, "leads_courtier", "*");
  }

  const [projectsRes, auditsRes, leadsRes, crmProjetsRes] = await Promise.all([
    lireTable(supabase, "projects", "*"),
    lireTable(
      supabase,
      "audits",
      "id, status, statut, created_at, client_id, apporteur_id, partenaire_id, clients(nom, prenom, ville, adresse, email, telephone)",
    ),
    lireTable(supabase, "leads", "*"),
    lireProjetsCrmDepuisSupabase(),
  ]);

  const baseCrmOk = leadsCourtierRes.ok || crmProjetsRes.ok;
  const vus = new Set();
  const audits = [];

  if (crmProjetsRes.ok) {
    for (const row of crmProjetsRes.data) {
      const mapped = mapperLigneLive(
        {
          id: row.id,
          client_nom: row.client_nom,
          statut: row.statut,
          created_at: row.created_at,
          updated_at: row.updated_at,
          ville: row.ville,
          email: row.email,
          telephone: row.telephone,
          montant_ttc: row.montant_ttc,
          montant_ht: row.montant_ht,
          apporteur_id: row.apporteur_id,
          apporteur_nom: row.apporteur_nom,
          source: row.source,
          reference: row.reference,
          type_projet: row.type_projet,
        },
        "crm_projets",
      );
      if (!mapped.id || vus.has(mapped.id)) continue;
      vus.add(mapped.id);
      audits.push(mapped);
    }
    resultat.connexion = "supabase";
    resultat.source = "live";
    resultat.projetsCrm = crmProjetsRes.data.map(ligneCrmVersProjetManuel).filter(Boolean);
  } else if (crmProjetsRes.message && !baseCrmOk) {
    resultat.avertissements.push(`Table crm_projets : ${crmProjetsRes.message}`);
  }

  for (const lecture of [projectsRes, auditsRes]) {
    if (!lecture.ok) {
      if (!baseCrmOk) resultat.avertissements.push(`Table ${lecture.table} : ${lecture.message}`);
      continue;
    }
    for (const row of lecture.data) {
      const mapped = mapperLigneLive(row, lecture.table);
      if (!mapped.id || vus.has(mapped.id)) continue;
      vus.add(mapped.id);
      audits.push(mapped);
    }
    resultat.source = "live";
    resultat.connexion = "supabase";
  }
  resultat.audits = audits;

  const leads = [];
  for (const lecture of [leadsCourtierRes, leadsRes]) {
    if (!lecture.ok) {
      if (lecture.table === "leads_courtier" || !baseCrmOk) {
        resultat.avertissements.push(`Table ${lecture.table} : ${lecture.message}`);
      }
      continue;
    }
    resultat.source = "live";
    resultat.connexion = "supabase";
    for (const row of lecture.data) {
      leads.push(mapperLead(row, lecture.table));
    }
  }
  resultat.leads = nettoyerLeadsCourtier(leads);
  resultat.leadsCount = resultat.leads.length;

  // Sync push dossiers locaux → crm_projets (+ leads_courtier uniquement si téléphone réel)
  if (Array.isArray(projetsLocaux) && projetsLocaux.length) {
    const syncProjets = await synchroniserProjetsVersSupabase(projetsLocaux);
    resultat.syncProjets = syncProjets;
    if (!syncProjets.ok && syncProjets.erreur) {
      resultat.avertissements.push(`Sync crm_projets : ${syncProjets.erreur}`);
    } else if (syncProjets.ok) {
      resultat.connexion = "supabase";
    }
    const syncLeads = await synchroniserLeadsCourtierDepuisProjets(projetsLocaux);
    resultat.syncLeads = syncLeads;
    if (!syncLeads.ok && syncLeads.erreur) {
      resultat.avertissements.push(`Sync leads_courtier : ${syncLeads.erreur}`);
    } else if (syncLeads.ok) {
      resultat.connexion = "supabase";
      // Relecture leads_courtier après push pour afficher les dossiers synchronisés
      if (leadsCourtierRes.ok || syncLeads.inserted > 0) {
        let leadsApres = await lireTable(
          supabase,
          "leads_courtier",
          "id, prenom, nom, telephone, email, adresse, ville, code_postal, statut, type_travaux, budget, apporteur, commission_apporteur, notes, created_at, updated_at",
        );
        if (!leadsApres.ok) {
          leadsApres = await lireTable(supabase, "leads_courtier", "*");
        }
        if (leadsApres.ok) {
          const autres = leads.filter((l) => l.source !== "leads_courtier");
          const depuisCourtier = leadsApres.data.map((row) => mapperLead(row, "leads_courtier"));
          resultat.leads = nettoyerLeadsCourtier([...depuisCourtier, ...autres]);
          resultat.leadsCount = resultat.leads.length;
          leadsCourtierRes = leadsApres;
        }
      }
    }
  }

  // Base active : leads_courtier ou crm_projets OK (même vide)
  if (leadsCourtierRes.ok || crmProjetsRes.ok || projectsRes.ok || auditsRes.ok || leadsRes.ok) {
    resultat.connexion = "supabase";
    resultat.sync = "ok";
    resultat.erreurs = [];
  } else {
    resultat.sync = "idle";
    resultat.connexion = "offline";
    resultat.erreurs.push(
      "Aucune table CRM accessible — vérifiez les policies RLS sur leads_courtier / crm_projets.",
    );
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
    id: "maison-martins",
    label: "Maison Martins — Édition Privée",
    href: "/maison-martins",
    hint: "Vitrine prestige Bourgogne — consultation duo 390 € et leads CRM",
  },
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
  {
    id: "longere-la-genete",
    label: "Longère La Genête — offre CG",
    href: "/longere-la-genete",
    hint: "Fiche des 6 travées et devis d'urgence phases 1 et 2 — 9 735 € ou 16 335 € TTC",
  },
  {
    id: "contrat-lagenete",
    label: "Contrat Clyve — Phase 1",
    href: "/contrat-lagenete",
    hint: "CONTRAT-2026-LAGENETE-CLYVE-PHASE1 — 8 850 € HT / 9 735 € TTC — charte Contractant Général",
  },
];

export { synchroniserProjetsVersSupabase, synchroniserLeadsCourtierDepuisProjets, lireConfigSupabase };
