import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import ModuleAConnecter from "../components/crm/ModuleAConnecter";
import PresentationTablette from "../components/crm/PresentationTablette";
import RepartitionMarges from "../components/crm/RepartitionMarges";
import EnergiaCoPilot from "../components/EnergiaCoPilot";
import {
  chargerDonneesCrm,
  PAGES_TEST_LOCALES,
  regrouperPipeline,
} from "../lib/crm/crmDataService";
import {
  AUDITS_TEST_LOCAUX,
  CA_PREVISIONNEL_TEST_TTC,
} from "../lib/crm/mockData";
import {
  DEMO_STORAGE_KEY,
  ROLE_ADMIN,
  ROLE_PRESENTATION,
  ROLES,
  TABLETTE_STORAGE_KEY,
  CHAMPS_INTERDITS_HORS_ADMIN,
  enregistrerFlag,
  enregistrerRole,
  estPresentationClient,
  lireFlag,
  lireRoleStocke,
  peutVoirCentreControle,
  peutVoirCoutsInternes,
  peutVoirCrmCommercial,
} from "../lib/crm/roles";

const CentreControleInterne = lazy(() => import("../components/crm/CentreControleInterne"));
const CatalogueMetiers = lazy(() => import("../components/crm/CatalogueMetiers"));

const VUES = [
  "dashboard",
  "pipeline",
  "projets",
  "relances",
  "partenaires",
  "artisans",
  "presentation",
  "catalogue",
  "controle-interne",
];

function lireJeuDemo() {
  try {
    const stored = sessionStorage.getItem(DEMO_STORAGE_KEY);
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {
    /* ignore */
  }
  return true;
}

const euro = (n) =>
  n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

function vueDepuisHash() {
  const raw = window.location.hash.replace(/^#/, "").split("?")[0];
  return VUES.includes(raw) ? raw : "dashboard";
}

function etapeDepuisHash() {
  const query = window.location.hash.split("?")[1] ?? "";
  return new URLSearchParams(query).get("etape") ?? "";
}

function aller(vue, extra = "") {
  window.location.hash = extra ? `${vue}?${extra}` : vue;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function IconEuro() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10h12" />
      <path d="M4 14h10" />
      <path d="M19 6.5A7.5 7.5 0 1 0 19 17.5" />
    </svg>
  );
}

function IconFunnel() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}

function statutClass(statut) {
  const s = (statut ?? "").toLowerCase();
  if (s.includes("payé") || s.includes("paye") || s.includes("sign")) return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
  if (s.includes("chantier")) return "bg-teal-500/15 text-teal-200 border-teal-400/30";
  if (s.includes("devis")) return "bg-lime-500/15 text-lime-200 border-lime-400/30";
  return "bg-sky-500/15 text-sky-200 border-sky-400/30";
}

function KpiCard({ label, value, hint, icon, accent, demo, onClick }) {
  const inner = (
    <>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <span className="rounded-lg bg-slate-950/40 p-2 text-emerald-300">{icon}</span>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
      {demo ? (
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-amber-300">Mode démonstration</p>
      ) : null}
    </>
  );
  const className = `rounded-2xl border border-slate-800 bg-gradient-to-br ${accent} p-4 text-left shadow-lg shadow-slate-950/40`;
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} transition hover:border-emerald-500/40`}>
        {inner}
      </button>
    );
  }
  return <article className={className}>{inner}</article>;
}

function PipelineBlock({ etapes, total, demo, onEtape }) {
  const somme = total || etapes.reduce((s, e) => s + e.count, 0);
  const gradient = etapes.reduce(
    (acc, step) => {
      const start = acc.offset;
      acc.offset = start + (somme ? (step.count / somme) * 360 : 0);
      acc.stops.push(`${step.color} ${start}deg ${acc.offset}deg`);
      return acc;
    },
    { offset: 0, stops: [] },
  ).stops.join(", ");

  return (
    <section className="mb-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-300">Répartition du pipeline</h2>
        <p className="mb-5 text-xs text-slate-500">
          {demo
            ? "Jeu de test local — dossiers hors production"
            : somme
              ? `${somme} dossier${somme > 1 ? "s" : ""} issu${somme > 1 ? "s" : ""} de la base`
              : "Aucun dossier réel à répartir"}
        </p>
        {somme ? (
          <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-slate-800">
            {etapes.map((step) => (
              <button
                key={step.id}
                type="button"
                className="h-full"
                style={{ width: `${(step.count / somme) * 100}%`, backgroundColor: step.color }}
                title={step.label}
                onClick={() => onEtape(step.id)}
              />
            ))}
          </div>
        ) : (
          <p className="mb-5 text-sm text-slate-400">En attente de statuts renseignés en base.</p>
        )}
        <ul className="grid gap-2 sm:grid-cols-2">
          {etapes.map((step) => (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onEtape(step.id)}
                className="flex w-full items-center justify-between rounded-lg bg-slate-950/50 px-3 py-2 text-left hover:bg-slate-800/80"
              >
                <span className="flex items-center gap-2 text-sm text-slate-200">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: step.color }} />
                  {step.label}
                </span>
                <span className="text-sm font-semibold text-white">{step.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </article>
      <article className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="mb-4 self-start text-sm font-semibold uppercase tracking-wide text-slate-300">Mix commercial</h2>
        <div
          className="relative h-44 w-44 rounded-full"
          style={{ background: somme ? `conic-gradient(${gradient})` : "#1e293b" }}
        >
          <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-slate-950">
            <span className="text-3xl font-semibold text-white">{somme}</span>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">dossiers</span>
          </div>
        </div>
      </article>
    </section>
  );
}

export default function TestDashboardCRM() {
  const [role, setRole] = useState(lireRoleStocke);
  const [tablette, setTablette] = useState(() => lireFlag(TABLETTE_STORAGE_KEY, false));
  const [jeuDemo, setJeuDemo] = useState(lireJeuDemo);
  const [vue, setVue] = useState(vueDepuisHash);
  const [etapeFiltre, setEtapeFiltre] = useState(etapeDepuisHash);
  const [presentationVue, setPresentationVue] = useState("fiche");
  const [dossierId, setDossierId] = useState("demo-pereira");
  const [chargement, setChargement] = useState(true);
  const [donnees, setDonnees] = useState({
    source: "indisponible",
    audits: [],
    leads: [],
    leadsCount: 0,
    erreurs: [],
  });

  useEffect(() => {
    document.title = "CRM ENERGIA — MODE LOCAL | ENERGIA CONSEIL IA®";
  }, []);

  useEffect(() => {
    const sync = () => {
      setVue(vueDepuisHash());
      setEtapeFiltre(etapeDepuisHash());
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    let actif = true;
    chargerDonneesCrm().then((payload) => {
      if (actif) {
        setDonnees(payload);
        setChargement(false);
      }
    });
    return () => {
      actif = false;
    };
  }, []);

  useEffect(() => {
    if (
      (vue === "controle-interne" || vue === "catalogue") &&
      !peutVoirCentreControle(role)
    ) {
      aller("dashboard");
    }
    if (estPresentationClient(role) && !["presentation", "dashboard"].includes(vue)) {
      aller("presentation");
    }
  }, [role, vue]);

  const changerRole = (next) => {
    setRole(next);
    enregistrerRole(next);
    if (next === ROLE_PRESENTATION) aller("presentation");
    if (next !== ROLE_ADMIN && (vue === "controle-interne" || vue === "catalogue")) {
      aller("dashboard");
    }
  };

  const changerTablette = () => {
    const next = !tablette;
    setTablette(next);
    enregistrerFlag(TABLETTE_STORAGE_KEY, next);
    if (next) aller("presentation");
  };

  const changerDemo = () => {
    const next = !jeuDemo;
    setJeuDemo(next);
    enregistrerFlag(DEMO_STORAGE_KEY, next);
  };

  const auditsAffiches = useMemo(() => {
    if (!jeuDemo) return donnees.audits;
    const idsLive = new Set(donnees.audits.map((a) => a.id));
    const tests = AUDITS_TEST_LOCAUX.filter((a) => !idsLive.has(a.id));
    return [...tests, ...donnees.audits];
  }, [donnees.audits, jeuDemo]);

  const pipelineAffiche = useMemo(() => regrouperPipeline(auditsAffiches), [auditsAffiches]);
  const auditsPayes = auditsAffiches.filter((a) => a.paye).length;
  const nbLeads = (donnees.leadsCount || donnees.leads.length) + (jeuDemo ? AUDITS_TEST_LOCAUX.length : 0);
  const conversionLive = nbLeads > 0 ? Math.round((auditsPayes / nbLeads) * 100) : null;
  const caPrevisionnel = jeuDemo ? CA_PREVISIONNEL_TEST_TTC : null;

  const totalPipeline = pipelineAffiche.reduce((s, e) => s + e.count, 0);

  const projetsFiltres = etapeFiltre
    ? auditsAffiches.filter((a) => a.etape === etapeFiltre)
    : auditsAffiches;

  const dossier = auditsAffiches.find((a) => a.id === dossierId) ?? (jeuDemo ? AUDITS_TEST_LOCAUX[0] : null);
  const voirMargesInternes = peutVoirCoutsInternes(role);

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", visible: true },
    { id: "pipeline", label: "Pipeline", visible: peutVoirCrmCommercial(role) },
    { id: "projets", label: "Projets", visible: peutVoirCrmCommercial(role) },
    { id: "relances", label: "Relances", visible: peutVoirCrmCommercial(role) },
    { id: "partenaires", label: "Partenaires", visible: peutVoirCrmCommercial(role) },
    { id: "artisans", label: "Artisans RGE", visible: peutVoirCrmCommercial(role) },
    { id: "presentation", label: "Présentation client", visible: true },
    {
      id: "catalogue",
      label: "Catalogue métiers",
      visible: peutVoirCentreControle(role),
    },
    {
      id: "controle-interne",
      label: "Centre de Contrôle Interne",
      visible: peutVoirCentreControle(role),
    },
  ].filter((item) => item.visible);

  const ouvrirEtape = (etapeId) => {
    aller("projets", `etape=${etapeId}`);
  };

  const grosBouton = tablette || estPresentationClient(role);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/4 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#0f766e]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[420px] w-[420px] translate-x-1/2 rounded-full bg-[#10b981]/15 blur-[100px]" />
      </div>

      <div className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-center sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200 sm:text-xs">
          TABLEAU DE BORD CRM - MODE DÉMO LOCAL - HORS PRODUCTION
        </p>
      </div>

      {jeuDemo ? (
        <div className="border-b border-orange-500/40 bg-orange-500/15 px-4 py-2 text-center text-xs font-medium text-orange-100">
          Jeu de test local — dossiers Monsieur Pereira et Monsieur Marjollet (CA prévisionnel{" "}
          {euro(CA_PREVISIONNEL_TEST_TTC)} TTC, Pereira uniquement tant que Marjollet n’a pas
          d’estimation). Hors production.
        </div>
      ) : null}

      <div className="mx-auto flex min-h-[calc(100vh-2.75rem)] max-w-[90rem]">
        <aside className={`w-60 shrink-0 border-r border-slate-800/80 bg-slate-950/70 p-4 ${grosBouton ? "hidden" : "hidden lg:block"}`}>
          <p className="mb-6 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-sm font-bold tracking-tight text-transparent">
            ENERGIA CONSEIL IA®
          </p>
          <nav className="space-y-1" aria-label="Navigation CRM">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => aller(item.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                  vue === item.id
                    ? "bg-gradient-to-r from-emerald-600/40 to-teal-500/30 font-medium text-white shadow-[0_0_16px_rgba(16,185,129,0.18)]"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <p className="mt-8 text-[10px] leading-relaxed text-slate-500">
            Rôle local. Champs internes ({CHAMPS_INTERDITS_HORS_ADMIN.slice(0, 3).join(", ")}…)
            masqués hors administrateur.
          </p>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
                  {vue === "controle-interne"
                    ? "Centre de Contrôle Interne"
                    : vue === "catalogue"
                      ? "Catalogue métiers"
                      : "Tableau de bord CRM"}
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {donnees.source === "live"
                    ? "Données lues depuis Supabase lorsqu’elles existent"
                    : "Base non accessible pour l’instant — aucun client inventé"}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Route <code className="text-sky-300">/test-dashboard-crm</code>
              </p>
            </div>

            <div className={`flex flex-wrap gap-2 ${grosBouton ? "gap-3" : ""}`}>
              <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
                Rôle
                <select
                  value={role}
                  onChange={(e) => changerRole(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                >
                  {ROLES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={changerTablette}
                className={`rounded-xl border px-4 ${grosBouton ? "min-h-12 text-sm" : "py-2 text-xs"} ${
                  tablette
                    ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-100"
                    : "border-slate-800 bg-slate-900/70 text-slate-300"
                }`}
              >
                Mode tablette Damien
              </button>
              {peutVoirCrmCommercial(role) ? (
                <button
                  type="button"
                  onClick={changerDemo}
                  className={`rounded-xl border px-4 ${grosBouton ? "min-h-12 text-sm" : "py-2 text-xs"} ${
                    jeuDemo
                      ? "border-amber-400/50 bg-amber-500/20 text-amber-100"
                      : "border-slate-800 bg-slate-900/70 text-slate-300"
                  }`}
                >
                  {jeuDemo ? "Masquer le jeu de test local" : "Afficher le jeu de test local"}
                </button>
              ) : null}
            </div>

            {grosBouton ? (
              <nav className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => aller(item.id)}
                    className={`min-h-14 rounded-2xl px-3 text-sm font-semibold ${
                      vue === item.id
                        ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white"
                        : "border border-slate-700 bg-slate-900 text-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            ) : null}
          </header>

          {vue === "dashboard" && peutVoirCrmCommercial(role) ? (
            <>
              <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <KpiCard
                  label="Nombre de leads"
                  value={chargement && !jeuDemo ? "…" : String(nbLeads)}
                  hint={jeuDemo ? "Leads base + dossiers de test Pereira et Marjollet" : "Table leads_courtier"}
                  icon={<IconUsers />}
                  accent="from-sky-500/25 to-cyan-500/10"
                  demo={jeuDemo}
                  onClick={() => aller("pipeline")}
                />
                <KpiCard
                  label="Audits payés"
                  value={chargement && !jeuDemo ? "…" : String(auditsPayes)}
                  hint={jeuDemo ? "Pereira : devis non signé" : "Statut contenant un paiement réel"}
                  icon={<IconCheck />}
                  accent="from-emerald-500/25 to-teal-500/10"
                  demo={jeuDemo}
                  onClick={() => aller("projets")}
                />
                <KpiCard
                  label="CA prévisionnel"
                  value={caPrevisionnel != null ? euro(caPrevisionnel) : "—"}
                  hint={
                    jeuDemo
                      ? "Devis Pereira 50 103 € TTC — Marjollet sans estimation (0 €)"
                      : "Aucun montant public en base — non inventé"
                  }
                  icon={<IconEuro />}
                  accent="from-teal-500/25 to-emerald-500/10"
                  demo={jeuDemo}
                  onClick={() => aller("projets")}
                />
                <KpiCard
                  label="Taux de conversion"
                  value={conversionLive == null ? "—" : `${conversionLive} %`}
                  hint={jeuDemo ? "Audits payés / leads (jeu de test inclus)" : "Audits payés / leads (si les deux existent)"}
                  icon={<IconFunnel />}
                  accent="from-cyan-500/25 to-sky-500/10"
                  demo={jeuDemo}
                />
                <KpiCard
                  label="Relances à effectuer"
                  value={jeuDemo ? String(AUDITS_TEST_LOCAUX.filter((a) => !a.paye).length) : "0"}
                  hint={jeuDemo ? "Devis en attente de signature (jeu de test)" : "Aucune table relances"}
                  icon={<IconBell />}
                  accent="from-amber-500/20 to-orange-500/10"
                  demo={jeuDemo}
                  onClick={() => aller("relances")}
                />
              </section>

              <PipelineBlock
                etapes={pipelineAffiche}
                total={totalPipeline}
                demo={jeuDemo}
                onEtape={ouvrirEtape}
              />

              {!voirMargesInternes && jeuDemo ? (
                <p className="mb-6 text-xs text-slate-500">
                  Pour voir la répartition des marges (Part Travaux, Part Apporteur, Part ENERGIA
                  CONSEIL IA), passez le rôle sur « Administrateur propriétaire » ou ouvrez le
                  Centre de Contrôle Interne.
                </p>
              ) : null}

              <section className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
                <div className="border-b border-slate-800 px-5 py-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Projets récents</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {jeuDemo
                      ? "Jeu de test local (Pereira, Marjollet) + audits en base s’ils existent"
                      : chargement
                        ? "Chargement des audits…"
                        : donnees.audits.length
                          ? "Dossiers issus de la table audits"
                          : "Aucun audit lisible — activez le jeu de test pour afficher Pereira et Marjollet"}
                  </p>
                </div>
                {auditsAffiches.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-5 py-3 font-medium">Client</th>
                          <th className="px-5 py-3 font-medium">Type / localisation</th>
                          <th className="px-5 py-3 font-medium">Statut</th>
                          <th className="px-5 py-3 font-medium">Identifiant</th>
                          <th className="px-5 py-3 font-medium">CA TTC</th>
                          <th className="px-5 py-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {auditsAffiches.slice(0, 8).map((projet) => (
                          <tr key={projet.id}>
                            <td className="px-5 py-3.5">
                              <button
                                type="button"
                                className="font-medium text-sky-300 underline-offset-2 hover:underline"
                                onClick={() => {
                                  setDossierId(projet.id);
                                  aller("presentation");
                                }}
                              >
                                {projet.nom}
                              </button>
                              {projet.source === "test-local" ? (
                                <span className="ml-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                                  Test
                                </span>
                              ) : null}
                            </td>
                            <td className="px-5 py-3.5 text-slate-300">
                              {projet.typeProjet || projet.ville || "—"}
                            </td>
                            <td className="px-5 py-3.5">
                              <button
                                type="button"
                                onClick={() => ouvrirEtape(projet.etape)}
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statutClass(projet.statut)}`}
                              >
                                {projet.statut}
                              </button>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-[11px] text-sky-300">
                              {projet.auditId || projet.id || "—"}
                            </td>
                            <td className="px-5 py-3.5 font-medium text-emerald-200">
                              {projet.caTtc ? euro(projet.caTtc) : "—"}
                            </td>
                            <td className="px-5 py-3.5 text-slate-400">{formatDate(projet.date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="px-5 py-6 text-sm text-slate-400">
                    Aucun dossier à afficher. Activez le jeu de test pour voir Pereira et Marjollet,
                    ou chargez des audits depuis la base.
                  </p>
                )}
              </section>

              {voirMargesInternes && dossier?.marges ? (
                <section className="mb-6 rounded-2xl border border-red-500/30 bg-red-950/20 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-300">
                    Administrateur uniquement
                  </p>
                  <h2 className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-300">
                    Répartition des marges — {dossier.nom}
                  </h2>
                  <p className="mt-1 mb-4 text-xs text-slate-500">
                    Part Travaux, Part Apporteur ({dossier.apporteurNom || "apporteur"}) et Part
                    ENERGIA CONSEIL IA. Masqué pour le commercial et la présentation client.
                  </p>
                  <RepartitionMarges marges={dossier.marges} apporteurNom={dossier.apporteurNom} />
                </section>
              ) : null}

              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Pages de test locales
                </h2>
                <p className="mt-1 mb-4 text-xs text-slate-500">
                  Liens vers des modules déjà existants — hors production.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PAGES_TEST_LOCALES.map((page) => (
                    <a
                      key={page.id}
                      href={page.href}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-emerald-200 hover:border-emerald-500/40"
                    >
                      {page.label}
                      <span className="mt-1 block text-xs text-slate-500">{page.hint}</span>
                    </a>
                  ))}
                </div>
              </section>

              {donnees.erreurs.length > 0 ? (
                <p className="mt-4 text-xs text-slate-500">
                  Lecture base : {donnees.erreurs.join(" · ")}
                </p>
              ) : null}
            </>
          ) : null}

          {vue === "dashboard" && estPresentationClient(role) ? (
            <PresentationTablette
              vue={presentationVue}
              onVue={setPresentationVue}
              dossier={dossier}
              tablette={grosBouton}
              voirMargesInternes={false}
            />
          ) : null}

          {vue === "pipeline" ? (
            <div>
              <PipelineBlock
                etapes={pipelineAffiche}
                total={totalPipeline}
                demo={jeuDemo}
                onEtape={ouvrirEtape}
              />
              <p className="text-sm text-slate-400">
                Cliquez une étape pour ouvrir les projets correspondants.
              </p>
            </div>
          ) : null}

          {vue === "projets" ? (
            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Projets {etapeFiltre ? `— filtre ${etapeFiltre}` : ""}
                </h2>
                {etapeFiltre ? (
                  <button type="button" className="text-xs text-sky-300" onClick={() => aller("projets")}>
                    Retirer le filtre
                  </button>
                ) : null}
              </div>
              {projetsFiltres.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-400">
                  Aucun projet réel pour ce filtre. Les pages de test Royer / Pereira / Marjollet /
                  Clyve restent accessibles depuis le tableau de bord.
                </p>
              ) : (
                <ul className="divide-y divide-slate-800">
                  {projetsFiltres.map((projet) => (
                    <li key={projet.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                      <div className="min-w-0">
                        <button
                          type="button"
                          className="font-medium text-white hover:text-emerald-300"
                          onClick={() => {
                            setDossierId(projet.id);
                            aller("presentation");
                          }}
                        >
                          {projet.nom}
                        </button>
                        <p className="mt-1 text-sm text-slate-300">
                          {projet.ville || "Localisation non renseignée"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {projet.typeProjet || "Type de projet non renseigné"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statutClass(projet.statut)}`}
                          >
                            {projet.statut}
                          </span>
                          {projet.auditId ? (
                            <span className="ml-2 font-mono text-[11px] text-sky-300">{projet.auditId}</span>
                          ) : null}
                          {projet.caTtc ? ` · ${euro(projet.caTtc)} TTC` : ""}
                          {projet.source === "test-local" ? " · jeu de test" : ""}
                        </p>
                      </div>
                      {projet.href ? (
                        <a
                          href={projet.href}
                          className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:border-emerald-400"
                        >
                          Ouvrir le dossier
                        </a>
                      ) : (
                        <span className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-500">
                          Dossier sans fiche
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {vue === "relances" ? (
            jeuDemo ? (
              <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                  Relance de test
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">Monsieur Pereira</h2>
                <p className="mt-3 text-sm text-amber-50/90">
                  Devis en attente de signature — CA prévisionnel {euro(CA_PREVISIONNEL_TEST_TTC)} TTC.
                  Apporteur : Damien Richards.
                </p>
                <button
                  type="button"
                  className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => {
                    setDossierId("demo-pereira");
                    aller("presentation");
                  }}
                >
                  Ouvrir la fiche
                </button>
              </section>
            ) : (
              <ModuleAConnecter
                titre="Relances"
                description="Aucune table de relances n’existe dans les migrations du dépôt. Le clic ouvre ce message plutôt qu’un faux écran de suivi."
              />
            )
          ) : null}

          {vue === "partenaires" ? (
            <ModuleAConnecter
              titre="Partenaires"
              description="Pas de module partenaires branché. FABIEN (VIVONS COURTIER) et MAR Léo-Energy restent les contacts process, sans annuaire CRM pour le moment."
            />
          ) : null}

          {vue === "artisans" ? (
            <ModuleAConnecter
              titre="Artisans RGE"
              description="Pas de page CRM artisans. La sélection RGE se fait hors de ce tableau de bord (réseau coordonné par Sylvain). Aucune liste d’entreprises n’a été inventée ici."
            />
          ) : null}

          {vue === "presentation" ? (
            <PresentationTablette
              vue={presentationVue}
              onVue={setPresentationVue}
              dossier={dossier}
              tablette={grosBouton}
              voirMargesInternes={voirMargesInternes}
            />
          ) : null}

          {vue === "catalogue" && peutVoirCentreControle(role) ? (
            <Suspense
              fallback={<p className="text-sm text-slate-400">Chargement du catalogue métiers…</p>}
            >
              <CatalogueMetiers />
            </Suspense>
          ) : null}

          {vue === "controle-interne" && peutVoirCentreControle(role) ? (
            <Suspense
              fallback={
                <p className="text-sm text-slate-400">Chargement du Centre de Contrôle Interne…</p>
              }
            >
              <CentreControleInterne />
            </Suspense>
          ) : null}
        </main>
      </div>

      {role !== ROLE_PRESENTATION && vue !== "controle-interne" && vue !== "catalogue" ? (
        <EnergiaCoPilot syntheseAudit="CRM ENERGIA — vue commerciale. Ne jamais communiquer marges, coûts d’achat, commission Damien, coût Clyve ni prix plancher." />
      ) : null}
    </div>
  );
}
