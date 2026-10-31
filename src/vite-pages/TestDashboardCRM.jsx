import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flame, Target, Wrench } from "lucide-react";
import ModuleAConnecter from "../components/crm/ModuleAConnecter";
import PresentationTablette from "../components/crm/PresentationTablette";
import AnnuaireArtisansRge from "../components/crm/AnnuaireArtisansRge";
import RadarRge from "../components/artisans/RadarRge";
import RepartitionMarges from "../components/crm/RepartitionMarges";
import LogoEnergia from "../components/crm/LogoEnergia";
import BadgesOfficielsEnergia from "../components/crm/BadgesOfficielsEnergia";
import BoutonAuditRapportDevis from "../components/crm/BoutonAuditRapportDevis";
import MarketTickerBar from "../components/crm/MarketTickerBar";
import CeeMarketBarometer from "../components/crm/CeeMarketBarometer";
import RadarCeeMarches from "../components/crm/RadarCeeMarches";
import CatalogueCommercial from "../components/crm/CatalogueCommercial";
import CatalogueMaisonMartins from "../components/crm/CatalogueMaisonMartins";
import SimulateurSolaireTesla from "../components/crm/SimulateurSolaireTesla";
import SolarCalpinage from "../components/solar/SolarCalpinage";
import PacDimensionnement from "../components/hvac/PacDimensionnement";
import DevisPlafondSDB from "../components/crm/DevisPlafondSDB";
import EmailHub from "../components/messaging/EmailHub";
import GmaoHub from "../components/maintenance/GmaoHub";
import { EVENEMENT_HISTORIQUE, compterRelancesDues } from "../components/messaging/historique";
import EnergiaCoPilot from "../components/EnergiaCoPilot";
import {
  chargerDonneesCrm,
  nettoyerLeadsCourtier,
  PAGES_TEST_LOCALES,
  regrouperPipeline,
  synchroniserLeadsCourtierDepuisProjets,
  synchroniserProjetsVersSupabase,
} from "../lib/crm/crmDataService";
import {
  AUDITS_TEST_LOCAUX,
  CA_PREVISIONNEL_TEST_TTC,
  euro as euroHt,
} from "../lib/crm/mockData";
import {
  DEMO_STORAGE_KEY,
  ROLE_ADMIN,
  ROLE_COMMERCIAL,
  ROLE_PRESENTATION,
  ROLES,
  CHAMPS_INTERDITS_HORS_ADMIN,
  enregistrerFlag,
  enregistrerPartenaireId,
  enregistrerRole,
  estAdministrateurProprietaire,
  estAgentAssociation,
  estPartenaireApporteur,
  estPresentationClient,
  lireCommercialIdStocke,
  lireFlag,
  lirePartenaireIdStocke,
  lireRoleStocke,
  peutVoirCentreControle,
  peutVoirCatalogueMetiers,
  peutVoirCatalogueCommercial,
  peutVoirCatalogueMaisonMartins,
  peutModifierCatalogueMetiers,
  peutVoirDpeMapper,
  peutVoirDevisEtMarges,
  peutVoirArtisansSousTraitance,
  peutVoirMessagerie,
  purgerAccesDamien,
  peutVoirRadarInsalubrite,
  peutVoirCoutsInternes,
  peutVoirCrmCommercial,
  peutVoirOngletFinances,
  peutVoirPipelinePartenaire,
  peutCreerProjetManuel,
  peutVoirRfr,
  peutVoirReferencesDocumentaires,
} from "../lib/crm/roles";
import {
  enrichirDossierFinances,
  totauxCommissionsCommercial,
  totauxFinancesAdmin,
} from "../lib/crm/finances";
import {
  PARTENAIRE_CATARINA,
  filtrerDossiersPartenaire,
  partenairesVisiblesPourRole,
  trouverPartenaireCrm,
} from "../lib/crm/partenaires";
import { lireLeadsPourRole, mettreAJourStatutLead, STATUTS_LEAD } from "../lib/crm/leadsDiagnostic";
import { lireNotificationsPourRole } from "../lib/crm/notificationsPartner";
import ModalNouveauProjet from "../components/crm/ModalNouveauProjet";
import ModalDevisMarcheLead, { ModalContratOfficiel, construireMarcheLeadCourtier } from "../components/crm/ModalDevisMarcheLead";
import BonDeCommandeArtisanModal, { commandeDepuisLead } from "../components/crm/BonDeCommandeArtisanModal";
import ChantierOrchestrateurModal, { EVENT_MARCHE_ACTIF, lireMarchesActifs } from "../components/crm/ChantierOrchestrateurModal";
import ChantierMasterOrchestratorModal from "../components/crm/ChantierMasterOrchestratorModal";
import { MARCHES } from "../components/crm/ModulesStrategiquesCrm";
import { SynthesePhasagePipeline } from "../components/crm/PhasageEtancheChantier";
import MenuActionsProjet from "../components/crm/MenuActionsProjet";
import BadgeApporteur from "../components/crm/BadgeApporteur";
import IndicateurEtapeAnah from "../components/crm/IndicateurEtapeAnah";
import ConsultationDuoCatarina from "../components/crm/ConsultationDuoCatarina";
import GalerieRelevesTerrain from "../components/crm/GalerieRelevesTerrain";
import RecapCommissionsCatarina from "../components/crm/RecapCommissionsCatarina";
import {
  enregistrerProjetManuel,
  modifierProjetManuel,
  lireProjetsManuels,
  mettreAJourOperationnelProjet,
  projetManuelVersAudit,
  sanitiserProjetPourRole,
  avancerStatutExpressProjet,
  archiverProjetManuel,
  supprimerProjetManuel,
  estDossierOfficiel,
} from "../lib/crm/projetsManuels";
import { BRUNEL_DOSSIER_ID } from "../lib/crm/brunelWorkingBase";
import {
  listerReferencesDocumentaires,
  sanitiserReferencePourRole,
} from "../lib/crm/referencesDocumentaires";
import {
  SOURCES_APPORTEUR,
  ETAPES_ANAH,
  calculerCaPrevisionnelOperationnel,
  calculerMargeNetteSanctuarisee,
  calculerTresorerieEngagee,
  normaliserEtapeAnah,
} from "../lib/crm/pipelineOperationnel";
import {
  VUES_HUB,
  enregistrerVueHub,
  estVueAmo,
  lireVueHub,
  normaliserSourceApporteur,
  regrouperPipelineAnah,
  sanitiserProjetPourVueHub,
} from "../lib/crm/operationnelCrm";

const CentreControleInterne = lazy(() => import("../components/crm/CentreControleInterne"));
const CatalogueMetiers = lazy(() => import("../components/crm/CatalogueMetiers"));
const DpeMapper = lazy(() => import("../components/crm/DpeMapper"));
const AssociationVue = lazy(() => import("../components/association/AssociationVue"));
const ModulesStrategiquesCrm = lazy(() => import("../components/crm/ModulesStrategiquesCrm"));

const VUES = [
  "dashboard",
  "pipeline",
  "projets",
  "relances",
  "partenaires",
  "artisans",
  "radar-rge",
  "presentation",
  "catalogue",
  "dpe-mapper",
  "association",
  "devis",
  "coordination",
  "cuisines",
  "apporteurs",
  "controle-interne",
  "radar-cee",
  "simulateur-solaire",
  "calpinage-solaire",
  "dimensionnement-pac",
  "plafond-sdb",
  "messagerie-crm",
  "catalogue-commercial",
  "maison-martins",
  "maintenance",
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

const DOSSIER_ACTIF_KEY = "energia-crm-dossier-actif-v1";

function lireDossierActif() {
  try {
    return localStorage.getItem(DOSSIER_ACTIF_KEY) || BRUNEL_DOSSIER_ID;
  } catch {
    return BRUNEL_DOSSIER_ID;
  }
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

function apporteurDepuisHash() {
  const query = window.location.hash.split("?")[1] ?? "";
  return new URLSearchParams(query).get("apporteur") ?? "";
}

function anahDepuisHash() {
  const query = window.location.hash.split("?")[1] ?? "";
  return new URLSearchParams(query).get("anah") ?? "";
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
  if (s.includes("payé") || s.includes("paye") || s.includes("signé") || s.includes("signe ")) {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
  }
  if (s.includes("chantier")) return "bg-teal-500/15 text-teal-200 border-teal-400/30";
  if (s.includes("attente") || s.includes("contrat")) return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  if (s.includes("devis")) return "bg-lime-500/15 text-lime-200 border-lime-400/30";
  if (s.includes("vérification") || s.includes("document")) return "bg-amber-500/15 text-amber-200 border-amber-400/30";
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

function PipelineAnahBlock({ etapes, demo, onEtape }) {
  const somme = etapes.reduce((s, e) => s + e.count, 0);
  return (
    <section className="mb-6 rounded-2xl border border-amber-500/25 bg-slate-900/70 p-5">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-amber-200">
        Pipeline réglementaire ANAH / CEE
      </h2>
      <p className="mb-4 text-xs text-slate-500">
        {demo
          ? "Cinq jalons de la rénovation globale — jeu local Brunel / Pereira"
          : "Jalons lus depuis les dossiers production (et dossiers officiels locaux)"}
      </p>
      <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {etapes.map((etape) => (
          <li key={etape.id}>
            <button
              type="button"
              onClick={() => onEtape(etape.id)}
              className="flex h-full w-full flex-col rounded-xl border border-amber-500/20 bg-slate-950/50 px-3 py-3 text-left hover:border-amber-400/50"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                  Jalon {etape.ordre}/5
                </span>
                {etape.verrouMar ? (
                  <span className="rounded-full border border-rose-400/50 bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-rose-100">
                    Verrou MAR
                  </span>
                ) : null}
              </span>
              <span className="mt-1 text-sm font-medium leading-snug text-white">{etape.compactLabel}</span>
              {etape.sousTexte ? (
                <span className="mt-1 text-[11px] leading-snug text-amber-100/80">{etape.sousTexte}</span>
              ) : null}
              <span className="mt-2 text-2xl font-semibold text-amber-100">{etape.count}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] text-slate-500">{somme} dossier{somme > 1 ? "s" : ""} positionné{somme > 1 ? "s" : ""} sur le parcours ANAH.</p>
    </section>
  );
}

function SyncLoader() {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-cyan-400/30 bg-slate-900/80 p-6">
      <div className="flex items-center gap-4">
        <span className="relative flex h-10 w-10 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/30" />
          <span className="relative inline-flex h-10 w-10 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
        </span>
        <div>
          <p className="text-sm font-semibold text-cyan-100">Synchronisation Supabase en cours</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Lecture des tables projects / leads — aucun message d’erreur pendant le chargement.
          </p>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 to-amber-300" />
      </div>
    </div>
  );
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

function formaterBudgetLead(budget) {
  if (budget == null || budget === "") return "—";
  const n = Number(budget);
  if (!Number.isFinite(n)) return String(budget);
  return euro(n);
}

function LeadsCourtierTable({ leads, demo, chargement }) {
  const liste = Array.isArray(leads) ? leads : [];
  const [devisLead, setDevisLead] = useState(null);
  const [commandeLead, setCommandeLead] = useState(null);
  const [dispatchLead, setDispatchLead] = useState(null);
  const [masterLead, setMasterLead] = useState(null);
  const [marchesActifs, setMarchesActifs] = useState(() => lireMarchesActifs());
  useEffect(() => {
    const rafraichir = () => setMarchesActifs(lireMarchesActifs());
    window.addEventListener(EVENT_MARCHE_ACTIF, rafraichir);
    return () => window.removeEventListener(EVENT_MARCHE_ACTIF, rafraichir);
  }, []);
  const sousTitre = demo
    ? "Basculer en Mode Production pour lire la table Supabase leads_courtier"
    : chargement
      ? "Chargement de leads_courtier…"
      : `${liste.length} lead${liste.length > 1 ? "s" : ""} uniques — leads_courtier (sans mocks ni doublons)`;

  const ouvrirDevisContrat = (lead) => {
    setDevisLead(construireMarcheLeadCourtier(lead));
  };

  let corps;
  if (chargement) {
    corps = <p className="px-5 py-6 text-sm text-slate-400">Synchronisation leads_courtier…</p>;
  } else if (liste.length === 0) {
    corps = (
      <p className="px-5 py-6 text-sm text-slate-400">Aucun lead dans leads_courtier pour le moment.</p>
    );
  } else {
    corps = (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3 font-medium">Prénom</th>
              <th className="px-5 py-3 font-medium">Nom</th>
              <th className="px-5 py-3 font-medium">Téléphone</th>
              <th className="px-5 py-3 font-medium">Ville</th>
              <th className="px-5 py-3 font-medium">Type de travaux</th>
              <th className="px-5 py-3 font-medium text-right">Budget</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {liste.map((lead) => (
              <tr
                key={lead.id || `${lead.prenom}-${lead.nomFamille}-${lead.telephone}`}
                className="hover:bg-emerald-500/5"
              >
                <td className="px-5 py-3.5 font-medium text-emerald-100">
                  {lead.prenom || "—"}
                  {lead.id && marchesActifs[lead.id] ? (
                    <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                      Marché actif
                    </span>
                  ) : null}
                </td>
                <td className="px-5 py-3.5 text-slate-100">{lead.nomFamille || "—"}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-sky-300">{lead.telephone || "—"}</td>
                <td className="px-5 py-3.5 text-slate-200">{lead.ville || lead.region || "—"}</td>
                <td className="max-w-md px-5 py-3.5 text-slate-300">
                  <span className="line-clamp-2" title={lead.typeTravaux || lead.typeProjet || ""}>
                    {lead.typeTravaux || lead.typeProjet || "—"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-white">
                  {formaterBudgetLead(lead.budget ?? lead.caTtc)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      data-testid={`voir-devis-contrat-${lead.id || lead.nomFamille || lead.nom || "lead"}`}
                      onClick={() => ouvrirDevisContrat(lead)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/50 bg-sky-500/20 px-3 py-1.5 text-[11px] font-semibold text-sky-100 shadow-sm shadow-sky-900/30 hover:bg-sky-500/35"
                    >
                      [ 📄 Voir Devis & Contrat ]
                    </button>
                    <button
                      type="button"
                      data-testid={`bdc-artisan-lead-${lead.id || lead.nomFamille || lead.nom || "lead"}`}
                      onClick={() => setCommandeLead(commandeDepuisLead(lead))}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/50 bg-amber-500/15 px-3 py-1.5 text-[11px] font-semibold text-amber-100 shadow-sm shadow-amber-900/30 hover:bg-amber-500/30"
                    >
                      [ 🔨 BDC Artisan ]
                    </button>
                    <button
                      type="button"
                      data-testid={`dispatch-chantier-${lead.id || lead.nomFamille || lead.nom || "lead"}`}
                      onClick={() => setDispatchLead(lead)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/50 bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/30"
                    >
                      [ 🏗 Dispatch chantier ]
                    </button>
                    <button
                      type="button"
                      data-testid={`orchestrateur-maitre-${lead.id || lead.nomFamille || lead.nom || "lead"}`}
                      onClick={() => setMasterLead(lead)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#f9c74f]/50 bg-[#1a5c2e]/80 px-3 py-1.5 text-[11px] font-semibold text-[#f9c74f] hover:bg-[#1a5c2e]"
                    >
                      [ 🏛 Orchestrateur maître ]
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-900/70 shadow-[0_0_24px_rgba(16,185,129,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-emerald-500/20 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
            Leads courtier — fiches en direct
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">{sousTitre}</p>
        </div>
        {!demo && liste.length > 0 ? (
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
            {liste.length} fiches live
          </span>
        ) : null}
      </div>
      {corps}
      <ModalDevisMarcheLead marche={devisLead} onFermer={() => setDevisLead(null)} />
      <BonDeCommandeArtisanModal
        ouvert={Boolean(commandeLead)}
        onFermer={() => setCommandeLead(null)}
        clientNom={commandeLead?.clientNom}
        clientAdresse={commandeLead?.clientAdresse}
        clientTel={commandeLead?.clientTel}
        clientVille={commandeLead?.clientVille}
        marcheRef={commandeLead?.marcheRef}
        bdcRef={commandeLead?.bdcRef}
        lotDescription={commandeLead?.lotDescription}
        artisanNom={commandeLead?.artisanNom}
        artisanCorpsEtat={commandeLead?.artisanCorpsEtat}
        montantHT={commandeLead?.montantHT}
        photos={commandeLead?.photos}
        dossierId={commandeLead?.dossierId}
      />
      <ChantierOrchestrateurModal
        ouvert={Boolean(dispatchLead)}
        lead={dispatchLead}
        onFermer={() => setDispatchLead(null)}
      />
      <ChantierMasterOrchestratorModal
        ouvert={Boolean(masterLead)}
        lead={masterLead}
        onFermer={() => setMasterLead(null)}
      />
    </section>
  );
}

const TITRES_VUE = {
  dashboard: "Tableau de bord",
  pipeline: "Pipeline & Dossiers Clients",
  projets: "Pipeline & Dossiers Clients",
  relances: "Pipeline & Dossiers Clients",
  "radar-cee": "Radar CEE & Marchés B2B",
  catalogue: "Catalogue des 31 Métiers",
  devis: "Devis & Marchés",
  "plafond-sdb": "Devis plafond salle de bain",
  "simulateur-solaire": "Simulateur Solaire & Tesla Powerwall 3",
  "calpinage-solaire": "Calepinage solaire & stockage Tesla",
  "dimensionnement-pac": "Dimensionnement PAC & Chaufferies Hybrides",
  "messagerie-crm": "Messagerie & Emails Clients",
  artisans: "Artisans RGE & Coordination",
  "radar-rge": "Radar Artisans RGE",
  coordination: "Artisans RGE & Coordination",
  partenaires: "Partenaires Stratégiques",
  apporteurs: "Apporteurs & Commissions",
  cuisines: "Cuisines & Agencement Prestige",
  presentation: "Présentation client",
  "catalogue-commercial": "Catalogue Commercial 2026",
  "maison-martins": "Maison Martins · Édition Privée",
  "dpe-mapper": "Carte DPE — prospection territoriale",
  association: "Association — radar insalubrité",
  "controle-interne": "Centre de Contrôle Interne",
  maintenance: "GMAO & Maintenance",
};

function vueActive(item, vue) {
  return (item.actifSi || [item.id]).includes(vue);
}

function BoutonNav({ item, vue, compact }) {
  const actif = vueActive(item, vue);
  const classe = compact
    ? `inline-flex min-h-14 items-center justify-center rounded-2xl px-3 text-center text-sm font-semibold leading-tight ${
        item.href
          ? "border border-emerald-400/50 bg-emerald-500/15 text-emerald-100"
          : actif
            ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white"
            : "border border-slate-700 bg-slate-900 text-slate-100"
      }`
    : `block w-full rounded-lg px-3 py-2 text-left text-sm ${
        actif
          ? "bg-gradient-to-r from-emerald-600/40 to-teal-500/30 font-medium text-white shadow-[0_0_16px_rgba(16,185,129,0.18)]"
          : "text-slate-300 hover:bg-slate-900 hover:text-white"
      }`;
  const contenu = (
    <>
      <span className={`flex items-start gap-2 ${compact ? "flex-col items-center text-center" : ""}`}>
        {item.icon ? <item.icon className={`${compact ? "h-5 w-5" : "mt-0.5 h-4 w-4"} shrink-0`} aria-hidden /> : null}
        <span className="flex items-center gap-2">
          <span className="block">{item.label}</span>
          {item.badge > 0 ? (
            <span
              className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-none text-white shadow-[0_0_12px_rgba(244,63,94,0.55)]"
              title={`${item.badge} email${item.badge > 1 ? "s" : ""} à relancer`}
            >
              {item.badge}
            </span>
          ) : null}
        </span>
      </span>
      {!compact && item.hint ? (
        <span className={`mt-0.5 block text-[10px] font-normal leading-snug ${actif ? "text-emerald-100/75" : "text-slate-500"} ${item.icon ? "pl-6" : ""}`}>
          {item.hint}
        </span>
      ) : null}
    </>
  );
  if (item.href) {
    return (
      <Link key={item.id} to={item.href} className={classe}>
        {contenu}
      </Link>
    );
  }
  return (
    <button
      key={item.id}
      type="button"
      data-testid={item.testid}
      onClick={() => (item.onSelect ? item.onSelect() : aller(item.id))}
      className={classe}
    >
      {contenu}
    </button>
  );
}

function NavigationCrm({ groupes, vue, compact = false }) {
  return (
    <nav className={compact ? "space-y-5" : "space-y-6"} aria-label="Navigation CRM">
      {groupes.map((groupe) => (
        <div key={groupe.id}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {groupe.titre}
          </p>
          <div className={compact ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : "space-y-0.5"}>
            {groupe.items.map((item) => (
              <BoutonNav key={item.id} item={item} vue={vue} compact={compact} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function AccesReserve({ titre }) {
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-rose-500/40 bg-slate-900 px-6 py-10 text-center shadow-2xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-300">Accès refusé</p>
      <h2 className="mt-3 text-xl font-semibold text-white">{titre}</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">
        Cette zone est réservée au Super-Admin. La prospection territoriale, les marges réelles,
        les artisans et la messagerie ne sont pas accessibles avec ce profil.
      </p>
      <a
        href="mailto:contact@energia-conseil-ia.com"
        className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950"
      >
        Contacter ENERGIA CONSEIL IA
      </a>
    </section>
  );
}

function BarreFamille({ vue }) {
  const familleDossiers = ["pipeline", "projets", "relances"].includes(vue);
  const familleTerrain = ["artisans", "coordination"].includes(vue);
  if (!familleDossiers && !familleTerrain) return null;
  const onglets = familleDossiers
    ? [
        { id: "pipeline", label: "Pipeline" },
        { id: "projets", label: "Dossiers" },
        { id: "relances", label: "Relances" },
      ]
    : [
        { id: "artisans", label: "Artisans RGE" },
        { id: "coordination", label: "Coordination chantiers" },
      ];
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {onglets.map((onglet) => (
        <button
          key={onglet.id}
          type="button"
          onClick={() => aller(onglet.id)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            vue === onglet.id
              ? "bg-emerald-500/20 text-emerald-100"
              : "border border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          {onglet.label}
        </button>
      ))}
      {familleDossiers ? (
        <Link
          to="/longere-la-genete"
          className="rounded-full border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200"
        >
          Dossier Clyve
        </Link>
      ) : null}
    </div>
  );
}

export default function TestDashboardCRM() {
  const [role, setRole] = useState(lireRoleStocke);
  const [vueHub, setVueHub] = useState(lireVueHub);
  useEffect(() => {
    purgerAccesDamien();
  }, []);
  const [jeuDemo, setJeuDemo] = useState(lireJeuDemo);
  const [vue, setVue] = useState(vueDepuisHash);
  const [etapeFiltre, setEtapeFiltre] = useState(etapeDepuisHash);
  const [filtreApporteur, setFiltreApporteur] = useState(apporteurDepuisHash);
  const [filtreAnah, setFiltreAnah] = useState(anahDepuisHash);
  const [presentationVue, setPresentationVue] = useState("fiche");
  const [dossierId, setDossierId] = useState(lireDossierActif);
  const [relancesEmail, setRelancesEmail] = useState(() => compterRelancesDues());
  const [chargement, setChargement] = useState(true);
  const [donnees, setDonnees] = useState({
    source: "demo",
    connexion: "local",
    sync: "idle",
    audits: [],
    leads: [],
    leadsCount: 0,
    erreurs: [],
    avertissements: [],
  });
  const [leadsDiagnostic, setLeadsDiagnostic] = useState([]);
  const [partenaireId, setPartenaireId] = useState(
    () => lirePartenaireIdStocke() || PARTENAIRE_CATARINA.id,
  );
  const [commercialId, setCommercialId] = useState(() => lireCommercialIdStocke());
  const [notifsPartenaire, setNotifsPartenaire] = useState([]);
  const [projetsManuels, setProjetsManuels] = useState(() => lireProjetsManuels());
  const [modalNouveauProjet, setModalNouveauProjet] = useState(false);
  const [marcheModal, setMarcheModal] = useState(null);
  const [projetEnEdition, setProjetEnEdition] = useState(null);
  const [workingRev, setWorkingRev] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(DOSSIER_ACTIF_KEY, dossierId);
    } catch {
      /* quota */
    }
  }, [dossierId]);

  useEffect(() => {
    const maj = () => setRelancesEmail(compterRelancesDues());
    maj();
    window.addEventListener(EVENEMENT_HISTORIQUE, maj);
    return () => window.removeEventListener(EVENEMENT_HISTORIQUE, maj);
  }, []);

  useEffect(() => {
    document.title = jeuDemo
      ? "CRM ENERGIA — MODE DÉMO LOCAL | ENERGIA CONSEIL IA®"
      : "CRM ENERGIA — MODE PRODUCTION | ENERGIA CONSEIL IA®";
  }, [jeuDemo]);

  useEffect(() => {
    setLeadsDiagnostic(lireLeadsPourRole(role, partenaireId));
    setNotifsPartenaire(lireNotificationsPourRole(role, partenaireId));
  }, [role, vue, partenaireId]);

  useEffect(() => {
    const sync = () => {
      setVue(vueDepuisHash());
      setEtapeFiltre(etapeDepuisHash());
      setFiltreApporteur(apporteurDepuisHash());
      setFiltreAnah(anahDepuisHash());
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    let actif = true;
    if (jeuDemo) {
      setChargement(false);
      setDonnees({
        source: "demo",
        connexion: "local",
        sync: "idle",
        configure: false,
        audits: [],
        leads: [],
        leadsCount: 0,
        projetsCrm: [],
        syncProjets: null,
        syncLeads: null,
        erreurs: [],
        avertissements: [],
      });
      return () => {
        actif = false;
      };
    }
    setChargement(true);
    const locaux = typeof lireProjetsManuels === "function" ? lireProjetsManuels() : projetsManuels;
    chargerDonneesCrm({ production: true, projetsLocaux: locaux }).then((payload) => {
      if (actif) {
        setDonnees(payload);
        setChargement(false);
      }
    });
    return () => {
      actif = false;
    };
  }, [jeuDemo]);

  useEffect(() => {
    if (jeuDemo || !projetsManuels?.length) return undefined;
    let actif = true;
    Promise.all([
      synchroniserProjetsVersSupabase(projetsManuels),
      synchroniserLeadsCourtierDepuisProjets(projetsManuels),
    ]).then(([syncProjets, syncLeads]) => {
      if (!actif) return;
      setDonnees((prev) => ({
        ...prev,
        syncProjets,
        syncLeads,
        connexion:
          (syncProjets?.ok || syncLeads?.ok || prev.connexion === "supabase") &&
          (syncProjets?.configure || syncLeads?.configure || prev.configure)
            ? "supabase"
            : prev.connexion,
        sync: syncProjets?.ok || syncLeads?.ok || prev.sync === "ok" ? "ok" : prev.sync,
        erreurs:
          syncProjets?.ok || syncLeads?.ok || prev.connexion === "supabase" ? [] : prev.erreurs,
      }));
    });
    return () => {
      actif = false;
    };
  }, [jeuDemo, projetsManuels]);

  useEffect(() => {
    if (
      vue === "controle-interne" &&
      !peutVoirCentreControle(role)
    ) {
      aller("dashboard");
    }
    if (vue === "catalogue" && !peutVoirCatalogueMetiers(role)) {
      aller("dashboard");
    }
    if (vue === "association" && !peutVoirRadarInsalubrite(role)) {
      aller("dashboard");
    }
    if (vue === "radar-cee" && !peutVoirCrmCommercial(role)) {
      aller("dashboard");
    }
    if (vue === "simulateur-solaire" && !peutVoirCrmCommercial(role)) {
      aller("dashboard");
    }
    if (vue === "calpinage-solaire" && !peutVoirCrmCommercial(role)) {
      aller("dashboard");
    }
    if (vue === "dimensionnement-pac" && !peutVoirCrmCommercial(role)) {
      aller("dashboard");
    }
    if (vue === "maintenance" && !peutVoirCrmCommercial(role)) {
      aller("dashboard");
    }
    if (estAgentAssociation(role) && vue !== "association") {
      aller("association");
    }
    if (
      estPresentationClient(role) &&
      !["presentation", "dashboard", "dpe-mapper", "messagerie-crm", "artisans", "coordination", "devis", "catalogue-commercial", "maison-martins"].includes(vue)
    ) {
      aller("presentation");
    }
    if (estPartenaireApporteur(role) && vue === "presentation") {
      aller("projets");
    }
    if (presentationVue === "finances" && (!peutVoirOngletFinances(role) || estVueAmo(vueHub))) {
      setPresentationVue("fiche");
    }
    if (estVueAmo(vueHub) && vue === "controle-interne") {
      setVue("presentation");
    }
  }, [role, vue, presentationVue, vueHub]);

  const changerRole = (next) => {
    setRole(next);
    enregistrerRole(next);
    if (next === ROLE_PRESENTATION) aller("presentation");
    if (next !== ROLE_ADMIN && vue === "controle-interne") {
      aller("dashboard");
    }
    if (!peutVoirCatalogueMetiers(next) && vue === "catalogue") {
      aller("dashboard");
    }
    if (!peutVoirDpeMapper(next) && vue === "dpe-mapper") {
      aller("dashboard");
    }
    if (estAgentAssociation(next)) {
      aller("association");
    }
    if (!peutVoirRadarInsalubrite(next) && vue === "association") {
      aller("dashboard");
    }
    if (estPartenaireApporteur(next) && vue === "presentation") {
      aller("projets");
    }
    if (!peutVoirOngletFinances(next) && presentationVue === "finances") {
      setPresentationVue("fiche");
    }
  };

  const changerDemo = (next) => {
    const valeur = Boolean(next);
    setJeuDemo(valeur);
    enregistrerFlag(DEMO_STORAGE_KEY, valeur);
  };

  const changerPartenaireId = (next) => {
    const value = String(next || "").trim() || PARTENAIRE_CATARINA.id;
    setPartenaireId(value);
    enregistrerPartenaireId(value);
  };

  const ouvrirNouveauProjetManuel = () => {
    setProjetEnEdition(null);
    setModalNouveauProjet(true);
  };

  const ouvrirEditionProjet = (projet) => {
    const source = projetsManuels.find((item) => item.id === projet.id) || projet.dossier || projet;
    setProjetEnEdition(source);
    setModalNouveauProjet(true);
  };

  const enregistrerDossierManuel = (valeurs, id) => {
    const resultat = id ? modifierProjetManuel(id, valeurs) : enregistrerProjetManuel(valeurs);
    if (resultat.ok && resultat.liste) {
      setProjetsManuels(resultat.liste);
    }
    return resultat;
  };

  const appliquerOperationnel = (id, patch) => {
    const resultat = mettreAJourOperationnelProjet(id, patch);
    if (resultat.ok && resultat.liste) setProjetsManuels(resultat.liste);
    return resultat;
  };

  const changerStatutExpress = (projet) => {
    const resultat = avancerStatutExpressProjet(projet.id);
    if (resultat.ok && resultat.liste) {
      setProjetsManuels(resultat.liste);
    } else if (resultat.erreur) {
      window.alert(resultat.erreur);
    }
  };

  const archiverOuSupprimerProjet = (projet) => {
    const officiel = estDossierOfficiel(projet.id);
    const message = officiel
      ? `Archiver le dossier « ${projet.nom} » ?\n\nLes dossiers officiels ne sont pas supprimés définitivement.`
      : `Archiver / supprimer le projet « ${projet.nom} » ?\n\nCette action retire le dossier du pipeline et du CA prévisionnel.`;
    if (!window.confirm(message)) return;
    const resultat = officiel ? archiverProjetManuel(projet.id) : supprimerProjetManuel(projet.id);
    if (resultat.ok && resultat.liste) {
      setProjetsManuels(resultat.liste);
      if (dossierId === projet.id) {
        setDossierId(resultat.liste.find((item) => !item.archive)?.id || "");
      }
    } else if (resultat.erreur) {
      window.alert(resultat.erreur);
    }
  };

  const voirFicheProjet = (projet) => {
    setDossierId(projet.id);
    aller("presentation");
  };

  const auditsSources = useMemo(() => {
    const idsLive = new Set(donnees.audits.map((a) => a.id));
    const tests = jeuDemo ? AUDITS_TEST_LOCAUX.filter((a) => !idsLive.has(a.id)) : [];
    const base = jeuDemo ? [...tests, ...donnees.audits] : donnees.audits;
    const manuels = projetsManuels
      .filter((item) => item.archive !== true)
      .map(projetManuelVersAudit)
      .filter((item) => !idsLive.has(item.id) && item.archive !== true);
    const enrichis = [...manuels, ...base].map((audit) => enrichirDossierFinances(audit));
    return estPartenaireApporteur(role)
      ? filtrerDossiersPartenaire(enrichis, trouverPartenaireCrm(partenaireId))
      : enrichis;
  }, [donnees.audits, jeuDemo, role, partenaireId, projetsManuels, workingRev]);

  const auditsAffiches = useMemo(
    () => auditsSources.map((audit) => sanitiserProjetPourRole(audit, role)),
    [auditsSources, role],
  );

  const dossierPresentation = useMemo(() => {
    const brut = auditsSources.find((audit) => audit.id === dossierId);
    if (!brut) return null;
    const roleLecture = peutVoirCoutsInternes(role) ? ROLE_ADMIN : role;
    return sanitiserProjetPourVueHub(sanitiserProjetPourRole(brut, roleLecture), vueHub);
  }, [auditsSources, dossierId, vueHub]);

  const pipelineAffiche = useMemo(() => regrouperPipeline(auditsAffiches), [auditsAffiches]);
  const pipelineAnah = useMemo(() => regrouperPipelineAnah(auditsAffiches), [auditsAffiches]);
  const leadsCourtierLive = useMemo(() => {
    const liste = (Array.isArray(donnees.leads) ? donnees.leads : []).filter(
      (lead) => !lead.source || lead.source === "leads_courtier",
    );
    return nettoyerLeadsCourtier(liste);
  }, [donnees.leads]);
  const auditsPayes = auditsAffiches.filter((a) => a.paye).length;
  const nbLeads = (donnees.leadsCount || donnees.leads.length) + (jeuDemo ? AUDITS_TEST_LOCAUX.length : 0);
  const conversionLive = nbLeads > 0 ? Math.round((auditsPayes / nbLeads) * 100) : null;
  const caPrevisionnel = calculerCaPrevisionnelOperationnel(auditsAffiches);
  const margeSanctuarisee = calculerMargeNetteSanctuarisee(auditsAffiches);
  const tresorerie = calculerTresorerieEngagee(auditsAffiches);
  const adminProprietaire = estAdministrateurProprietaire(role);

  const totalPipeline = pipelineAffiche.reduce((s, e) => s + e.count, 0);

  const projetsFiltres = auditsAffiches.filter((a) => {
    if (etapeFiltre && a.etape !== etapeFiltre) return false;
    if (filtreApporteur && normaliserSourceApporteur(a.apporteurId) !== normaliserSourceApporteur(filtreApporteur)) {
      return false;
    }
    if (filtreAnah && (a.horsAidesPubliques || normaliserEtapeAnah(a.etapeAnah) !== filtreAnah)) return false;
    return true;
  });

  const dossier =
    auditsAffiches.find((a) => a.id === dossierId) ??
    (estPartenaireApporteur(role) ? auditsAffiches[0] ?? null : jeuDemo ? AUDITS_TEST_LOCAUX[0] : null);
  const voirMargesInternes = peutVoirCoutsInternes(role);
  const totauxAdmin = totauxFinancesAdmin(auditsAffiches);
  const totauxCommercial = totauxCommissionsCommercial(auditsAffiches, commercialId);
  const referencesDocumentaires = useMemo(
    () =>
      peutVoirReferencesDocumentaires(role)
        ? listerReferencesDocumentaires().map((item) => sanitiserReferencePourRole(item, role))
        : [],
    [role],
  );

  const navGroupes = [
    {
      id: "pilotage",
      titre: "Pilotage général",
      items: [
        { id: "dashboard", label: "Tableau de bord", visible: !estAgentAssociation(role) },
        {
          id: "projets",
          label: "Pipeline & Dossiers Clients",
          hint: "Projets, relances, dossier Clyve",
          actifSi: ["pipeline", "projets", "relances"],
          visible: peutVoirPipelinePartenaire(role),
        },
        {
          id: "radar-cee",
          label: "Radar CEE & Marchés B2B",
          visible: peutVoirCrmCommercial(role),
        },
        {
          id: "messagerie-crm",
          label: "✉️ Messagerie & Relances",
          hint: "Messagerie & Emails Clients",
          badge: relancesEmail,
          visible: peutVoirMessagerie(role),
        },
      ],
    },
    {
      id: "ingenierie",
      titre: "Ingénierie & devis",
      items: [
        {
          id: "catalogue",
          label: "Catalogue des 31 Métiers",
          hint: "Fiches DTU A4",
          visible: peutVoirCatalogueMetiers(role),
        },
        {
          id: "devis",
          label: "Devis & Marchés",
          hint: "Contrats Contractant Général",
          visible: peutVoirDevisEtMarges(role),
          onSelect: () => {
            aller("devis");
            setMarcheModal(MARCHES.find((item) => item.id === dossierId) || MARCHES[0]);
          },
        },
        {
          id: "plafond-sdb",
          label: "Devis plafond SDB",
          hint: "Reprise sinistrée · zone 03",
          visible: peutVoirCrmCommercial(role),
        },
        {
          id: "simulateur-solaire",
          label: "Simulateur Solaire & Tesla Powerwall 3",
          visible: peutVoirCrmCommercial(role),
        },
        {
          id: "calpinage-solaire",
          label: "Calepinage solaire & Tesla",
          hint: "Toiture, chaînes MPPT, bilan 25 ans",
          visible: peutVoirCrmCommercial(role),
        },
        {
          id: "dimensionnement-pac",
          label: "Dimensionnement PAC & Chaufferies Hybrides",
          hint: "Déperditions, bivalence, hydraulique",
          icon: Flame,
          visible: peutVoirCrmCommercial(role),
        },
      ],
    },
    {
      id: "reseau",
      titre: "Réseau & terrain",
      items: [
        {
          id: "artisans",
          label: "Artisans RGE & Coordination",
          hint: "Mohamed Benaouda",
          actifSi: ["artisans", "coordination"],
          visible: peutVoirArtisansSousTraitance(role),
        },
        {
          id: "radar-rge",
          label: "Radar RGE",
          hint: "Artisans certifiés autour du chantier",
          icon: Target,
          testid: "nav-radar-rge",
          visible: peutVoirArtisansSousTraitance(role),
        },
        {
          id: "maintenance",
          label: "GMAO & Maintenance",
          hint: "ENERGIA Sérénité · parc PAC",
          icon: Wrench,
          testid: "nav-gmao",
          visible: peutVoirCrmCommercial(role),
        },
        {
          id: "partenaires",
          label: "Partenaires Stratégiques",
          hint: "C2ET · Vivons Courtier · Adeline RSE",
          visible: peutVoirPipelinePartenaire(role),
        },
      ],
    },
    {
      id: "commerce",
      titre: "Commerce & commissions",
      items: [
        {
          id: "maison-martins",
          label: "Maison Martins · Édition Privée",
          hint: "Book prestige · Catarina",
          testid: "nav-maison-martins",
          visible: peutVoirCatalogueMaisonMartins(role),
        },
        {
          id: "catalogue-commercial",
          label: "📕 Catalogue Commercial 2026",
          hint: "Book de vente Damien",
          testid: "nav-catalogue-commercial",
          visible: peutVoirCatalogueCommercial(role),
        },
        {
          id: "apporteurs",
          label: "Apporteurs & Commissions",
          hint: "Catarina · Jamel ENERG'ÉTHIQUE",
          visible: peutVoirCrmCommercial(role),
        },
        {
          id: "cuisines",
          label: "Cuisines & Agencement Prestige",
          hint: "Catarina",
          visible: peutVoirPipelinePartenaire(role),
        },
      ],
    },
    {
      id: "outils",
      titre: "Outils",
      items: [
        {
          id: "presentation",
          label: "Présentation client",
          visible: !estPartenaireApporteur(role) && !estAgentAssociation(role),
        },
        { id: "dpe-mapper", label: "Carte DPE", visible: peutVoirDpeMapper(role) },
        { id: "association", label: "Association", visible: peutVoirRadarInsalubrite(role) },
        {
          id: "controle-interne",
          label: "Centre de Contrôle Interne",
          visible: peutVoirCentreControle(role) && !estVueAmo(vueHub),
        },
      ],
    },
  ]
    .map((groupe) => ({ ...groupe, items: groupe.items.filter((item) => item.visible) }))
    .filter((groupe) => groupe.items.length > 0);

  const ouvrirEtape = (etapeId) => {
    aller("projets", `etape=${etapeId}`);
  };

  const ouvrirJalonAnah = (anahId) => {
    aller("projets", `anah=${anahId}`);
  };

  const grosBouton = estPresentationClient(role);
  const accesReserve =
    vue === "dpe-mapper" && !peutVoirDpeMapper(role)
      ? "Carte DPE"
      : vue === "messagerie-crm" && !peutVoirMessagerie(role)
        ? "Messagerie"
        : (vue === "artisans" || vue === "coordination" || vue === "radar-rge") && !peutVoirArtisansSousTraitance(role)
          ? "Artisans et sous-traitance"
          : vue === "devis" && !peutVoirDevisEtMarges(role)
            ? "Devis et marges réelles"
            : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <MarketTickerBar />
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/4 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#0f766e]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[420px] w-[420px] translate-x-1/2 rounded-full bg-[#10b981]/15 blur-[100px]" />
      </div>

      <div
        className={`border-b px-4 py-2.5 sm:px-6 ${
          jeuDemo
            ? "border-amber-500/40 bg-amber-500/15"
            : donnees.connexion === "supabase"
              ? "border-emerald-500/50 bg-emerald-500/20"
              : "border-cyan-400/40 bg-cyan-500/10"
        }`}
      >
        <div className="mx-auto flex max-w-[90rem] flex-col items-center justify-between gap-3 sm:flex-row">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs ${
              jeuDemo
                ? "text-amber-200"
                : donnees.connexion === "supabase"
                  ? "text-emerald-100"
                  : "text-cyan-100"
            }`}
          >
            {jeuDemo
              ? "Tableau de bord CRM — Mode Démo Local — Brunel & Pereira"
              : donnees.connexion === "supabase"
                ? "PRODUCTION : SUPABASE CONNECTÉ — BASE ACTIVE"
                : chargement
                  ? "Production : synchronisation Supabase…"
                  : donnees.configure
                    ? "Production : Supabase configuré — tables en attente (migration / RLS)"
                    : "Production : connexion Supabase en attente"}
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {adminProprietaire ? (
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-100">
              <span className="sr-only">Mode d'affichage</span>
              <select
                data-testid="selecteur-vue-hub"
                value={vueHub}
                onChange={(event) => {
                  const next = event.target.value;
                  setVueHub(next);
                  enregistrerVueHub(next);
                }}
                className="rounded-full border border-white/30 bg-slate-950 px-3 py-1.5 text-[11px] font-semibold text-white"
              >
                {VUES_HUB.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            ) : null}
          {peutVoirCrmCommercial(role) ? (
            <div className="inline-flex rounded-full border border-slate-700/80 bg-slate-950/70 p-1 shadow-lg shadow-slate-950/40">
              <button
                type="button"
                onClick={() => changerDemo(true)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${
                  jeuDemo ? "bg-amber-400 text-slate-950" : "text-slate-300 hover:text-white"
                }`}
              >
                Mode Démo Local
              </button>
              <button
                type="button"
                onClick={() => changerDemo(false)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${
                  !jeuDemo ? "bg-cyan-400 text-slate-950" : "text-slate-300 hover:text-white"
                }`}
              >
                {!jeuDemo && donnees.connexion === "supabase"
                  ? "PRODUCTION : SUPABASE CONNECTÉ — BASE ACTIVE"
                  : "Mode Production (Supabase)"}
              </button>
            </div>
          ) : null}
          </div>
        </div>
      </div>

      {jeuDemo && peutVoirCrmCommercial(role) && vue !== "association" ? (
        <div className="border-b border-orange-500/40 bg-orange-500/15 px-4 py-2 text-center text-xs font-medium text-orange-100">
          Jeu de test local — Pereira {euro(CA_PREVISIONNEL_TEST_TTC)} TTC + Brunel 33 478,53 € TTC
          (CA prévisionnel {euro(caPrevisionnel || 0)}). Hors production.
        </div>
      ) : null}

      {!jeuDemo && peutVoirCrmCommercial(role) && vue !== "association" ? (
        <div
          className={`border-b px-4 py-2 text-center text-xs font-medium ${
            donnees.connexion === "supabase"
              ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-50"
              : "border-cyan-500/40 bg-cyan-500/10 text-cyan-100"
          }`}
        >
          {donnees.connexion === "supabase"
            ? `PRODUCTION : SUPABASE CONNECTÉ — BASE ACTIVE — ${donnees.leadsCount || 0} lead(s) leads_courtier · sync ${donnees.syncProjets?.ok || donnees.syncLeads?.ok ? "OK" : "…"}`
            : chargement
              ? "Production : synchronisation Supabase en cours…"
              : donnees.configure
                ? "Production : clés Supabase détectées — migration / RLS à finaliser pour passer En Ligne"
                : "Production : connexion Supabase en attente — ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local"}
        </div>
      ) : null}

      <div className="mx-auto flex min-h-[calc(100vh-2.75rem)] max-w-[90rem]">
        <aside className={`sticky top-0 max-h-[calc(100dvh-6.5rem)] w-72 shrink-0 self-start overflow-y-auto border-r border-slate-800/80 bg-slate-950/70 px-3 py-5 ${grosBouton ? "hidden" : "hidden lg:block"}`}>
          <div className="mb-6 flex flex-col items-start gap-2">
            <LogoEnergia
              className="h-12 w-auto max-w-[11rem] object-contain"
              width={160}
              height={48}
              showCaption
            />
            <p className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-sm font-bold tracking-tight text-transparent">
              ENERGIA CONSEIL IA®
            </p>
          </div>
          <NavigationCrm groupes={navGroupes} vue={vue} />
          <p className="mt-8 text-[10px] leading-relaxed text-slate-500">
            Rôle local. Champs internes ({CHAMPS_INTERDITS_HORS_ADMIN.slice(0, 3).join(", ")}…)
            masqués hors administrateur.
          </p>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-3 sm:gap-4">
                <LogoEnergia
                  className="mt-0.5 h-11 w-auto max-w-[9rem] object-contain sm:h-12"
                  width={140}
                  height={48}
                />
                <div>
                <h1 className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
                  {TITRES_VUE[vue] || "Tableau de bord"}
                </h1>
                {vue === "plafond-sdb" ? (
                  <p className="mt-2 max-w-xl text-sm text-slate-400">
                    Chiffrage Contractant Général — reprise de plafond de salle de bain. La marge
                    nette reste interne et ne sort pas à l&apos;impression.
                  </p>
                ) : (
                  <BadgesOfficielsEnergia className="mt-2" />
                )}
                {vue === "plafond-sdb" ? null : (
                <p className="mt-2 text-sm text-slate-400">
                  {jeuDemo
                    ? "Données locales officielles Brunel / Pereira + jeu de test"
                    : donnees.connexion === "supabase"
                      ? "PRODUCTION : SUPABASE CONNECTÉ — BASE ACTIVE — leads_courtier / crm_projets + dossiers synchronisés"
                      : chargement
                        ? "Synchronisation en cours…"
                        : donnees.configure
                          ? "Clés présentes — appliquez la migration SQL crm_projets / policies leads_courtier"
                          : "Production : connexion Supabase en attente — renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY"}
                </p>
                )}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Route <code className="text-sky-300">/test-dashboard-crm</code>
              </p>
            </div>

            <div className={`flex flex-wrap gap-2 ${grosBouton ? "gap-3" : ""}`}>
              {peutCreerProjetManuel(role) && (vue === "dashboard" || vue === "projets") ? (
                <button
                  type="button"
                  onClick={ouvrirNouveauProjetManuel}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-900/40 hover:from-emerald-500 hover:to-teal-400"
                >
                  + Nouveau Projet Manuel
                </button>
              ) : null}
              <label
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                  adminProprietaire
                    ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-100"
                    : "border-slate-800 bg-slate-900/70 text-slate-300"
                }`}
              >
                Rôle
                <select
                  value={role}
                  onChange={(e) => changerRole(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                >
                  {ROLES.filter((item) => item.id !== ROLE_COMMERCIAL).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              {estPartenaireApporteur(role) ? (
                <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
                  ID partenaire connecté
                  <input
                    value={partenaireId}
                    onChange={(e) => changerPartenaireId(e.target.value)}
                    placeholder="identifiant partenaire"
                    className="w-44 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                    autoComplete="off"
                  />
                </label>
              ) : null}
              <Link
                to="/terrain-catarina"
                className={`inline-flex items-center justify-center rounded-xl border border-amber-400/60 bg-amber-400/15 px-4 font-semibold text-amber-100 active:scale-[0.98] ${
                  grosBouton ? "min-h-12 text-sm" : "min-h-11 py-2 text-xs"
                }`}
              >
                Mode terrain Catarina
              </Link>
              <Link
                to="/nouveau-client"
                data-testid="bouton-nouveau-client-direct"
                className={`inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-emerald-500 px-4 font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 active:scale-[0.98] ${
                  grosBouton ? "min-h-12 text-sm" : "min-h-11 py-2 text-xs"
                }`}
              >
                + Nouveau Client Direct (Sylvain)
              </Link>
              {peutVoirCrmCommercial(role) ? (
                <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900/70 p-1">
                  <button
                    type="button"
                    onClick={() => changerDemo(true)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      jeuDemo ? "bg-amber-500/20 text-amber-100" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Démo local
                  </button>
                  <button
                    type="button"
                    onClick={() => changerDemo(false)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      !jeuDemo ? "bg-cyan-500/20 text-cyan-100" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {!jeuDemo && donnees.connexion === "supabase"
                      ? "PRODUCTION : SUPABASE CONNECTÉ — BASE ACTIVE"
                      : "Production"}
                  </button>
                </div>
              ) : null}
            </div>

            {grosBouton ? <NavigationCrm groupes={navGroupes} vue={vue} compact /> : null}
          </header>

          {accesReserve ? null : <BarreFamille vue={vue} />}

          {accesReserve ? <AccesReserve titre={accesReserve} /> : null}

          {vue === "dashboard" && peutVoirCrmCommercial(role) ? (
            <>
              {!jeuDemo && chargement ? <SyncLoader /> : null}
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
                  label="CA Global Prévisionnel"
                  value={caPrevisionnel ? euro(caPrevisionnel) : "—"}
                  hint={
                    caPrevisionnel
                      ? `CA live ${euro(caPrevisionnel)} — officiels + projets manuels actifs`
                      : "Aucun marché officiel à agréger"
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

              <CeeMarketBarometer />

              {adminProprietaire && !estVueAmo(vueHub) ? (
                <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard
                    label="Marge Nette ENERGIA Sanctuarisée"
                    value={margeSanctuarisee.nbDossiers ? euroHt(margeSanctuarisee.totalHt) : "—"}
                    hint={
                      margeSanctuarisee.nbDossiers
                        ? margeSanctuarisee.lignes.map((ligne) => `${ligne.nom.split(" — ")[0]} ${ligne.ht.toLocaleString("fr-FR")} €`).join(" + ") + " HT sécurisés"
                        : "Postes Direction Contractant Général (Brunel + Pereira)"
                    }
                    icon={<IconEuro />}
                    accent="from-emerald-500/25 to-lime-500/10"
                    demo={jeuDemo}
                    onClick={() => aller("controle-interne")}
                  />
                  <KpiCard
                    label="Trésorerie engagée — 30 % à la commande"
                    value={tresorerie.nbDossiers ? euro(tresorerie.totalEngage) : "—"}
                    hint={
                      tresorerie.nbDossiers
                        ? `${euro(tresorerie.totalARecevoir)} à encaisser · ${euro(tresorerie.totalRecu)} reçus — acomptes 30 %`
                        : "Acomptes 30 % des marchés officiels"
                    }
                    icon={<IconEuro />}
                    accent="from-amber-500/25 to-yellow-500/10"
                    demo={jeuDemo}
                    onClick={() => aller("projets")}
                  />
                  <KpiCard
                    label="Total Commissions à payer (10% HT)"
                    value={totauxAdmin.nbCommissions ? euroHt(totauxAdmin.totalCommissions) : "—"}
                    hint="Somme des commissions agents 10 % HT — hors devis client"
                    icon={<IconEuro />}
                    accent="from-lime-500/20 to-emerald-500/10"
                    demo={jeuDemo}
                    onClick={() => aller("presentation")}
                  />
                  <KpiCard
                    label="Marge Nette Totale"
                    value={totauxAdmin.nbMarges ? euroHt(totauxAdmin.totalMargeNette) : "—"}
                    hint={
                      totauxAdmin.nbMarges
                        ? "Vente HT − artisans − commissions commercial et partenaire"
                        : "Coût artisan HT à renseigner pour la marge nette de production"
                    }
                    icon={<IconEuro />}
                    accent="from-rose-500/20 to-orange-500/10"
                    demo={jeuDemo}
                  />
                </section>
              ) : null}

              {role === ROLE_COMMERCIAL && !estVueAmo(vueHub) ? (
                <section className="mb-6 grid gap-4 sm:grid-cols-2">
                  <KpiCard
                    label="Mes commissions (10 % HT)"
                    value={totauxCommercial.nb ? euroHt(totauxCommercial.total) : "—"}
                    hint="Uniquement vos dossiers rattachés — la marge nette ENERGIA n’est pas affichée"
                    icon={<IconEuro />}
                    accent="from-lime-500/20 to-emerald-500/10"
                    demo={jeuDemo}
                    onClick={() => aller("presentation")}
                  />
                </section>
              ) : null}

              <PipelineBlock
                etapes={pipelineAffiche}
                total={totalPipeline}
                demo={jeuDemo}
                onEtape={ouvrirEtape}
              />
              <PipelineAnahBlock etapes={pipelineAnah} demo={jeuDemo} onEtape={ouvrirJalonAnah} />
              <LeadsCourtierTable leads={leadsCourtierLive} demo={jeuDemo} chargement={chargement} />

              {!voirMargesInternes && jeuDemo ? (
                <p className="mb-6 text-xs text-slate-500">
                  Pour voir la marge nette ENERGIA sanctuarisée et la répartition interne, passez le
                  rôle sur « Administrateur propriétaire (Sylvain) ».
                </p>
              ) : null}

              <GalerieRelevesTerrain />

              <section className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Projets récents</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {jeuDemo
                        ? "Pilotage manuel interactif + dossiers officiels + jeu de test local"
                        : chargement
                          ? "Chargement des audits…"
                          : "Projets manuels et dossiers issus de la table audits"}
                    </p>
                  </div>
                  {peutCreerProjetManuel(role) ? (
                    <button
                      type="button"
                      onClick={ouvrirNouveauProjetManuel}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-900/40 hover:from-emerald-500 hover:to-teal-400"
                    >
                      + Nouveau Projet Manuel
                    </button>
                  ) : null}
                </div>
                {auditsAffiches.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-950/80 text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-5 py-3 font-medium">Client</th>
                          <th className="px-5 py-3 font-medium">Type / localisation</th>
                          <th className="px-5 py-3 font-medium">Apporteur</th>
                          <th className="px-5 py-3 font-medium">Statut / ANAH</th>
                          <th className="px-5 py-3 font-medium">Identifiant</th>
                          <th className="px-5 py-3 font-medium">CA TTC</th>
                          <th className="px-5 py-3 font-medium">Date</th>
                          <th className="px-5 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {auditsAffiches.slice(0, 8).map((projet) => (
                          <tr key={projet.id}>
                            <td className="px-5 py-3.5">
                              <button
                                type="button"
                                className="font-medium text-sky-300 underline-offset-2 hover:underline"
                                onClick={() => voirFicheProjet(projet)}
                              >
                                {projet.nom}
                              </button>
                              {projet.source === "test-local" ? (
                                <span className="ml-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                                  Test
                                </span>
                              ) : null}
                              {projet.source === "manuel" ? (
                                <span className="ml-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                                  Manuel
                                </span>
                              ) : null}
                              {projet.source === "lead-prospect" ? (
                                <span className="ml-2 rounded-full border border-orange-400/40 bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-200">
                                  Lead
                                </span>
                              ) : null}
                            </td>
                            <td className="px-5 py-3.5 text-slate-300">
                              {projet.typeProjet || projet.ville || "—"}
                              {projet.sourceLead ? (
                                <span className="mt-1 block text-[11px] text-slate-500">Source : {projet.sourceLead}</span>
                              ) : null}
                            </td>
                            <td className="px-5 py-3.5">
                              <BadgeApporteur
                                compact
                                apporteurId={projet.apporteurId}
                                apporteurNom={projet.apporteurNom}
                              />
                              <div className="mt-1.5">
                                <ConsultationDuoCatarina
                                  compact
                                  apporteurId={projet.apporteurId}
                                  cochee={projet.consultationDuo}
                                />
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <button
                                type="button"
                                onClick={() => ouvrirEtape(projet.etape)}
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statutClass(projet.statut)}`}
                              >
                                {projet.statut}
                              </button>
                              {projet.etapeAnah ? (
                                <div className="mt-1.5">
                                  <IndicateurEtapeAnah
                                    etapeAnah={projet.etapeAnah}
                                    validationMar={projet.validationMar}
                                    detailJalon={projet.detailJalon}
                                    compact
                                  />
                                </div>
                              ) : null}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-[11px] text-sky-300">
                              {projet.auditId || projet.id || "—"}
                            </td>
                            <td className="px-5 py-3.5 font-medium text-emerald-200">
                              {projet.caTtc ? euro(projet.caTtc) : "—"}
                            </td>
                            <td className="px-5 py-3.5 text-slate-400">{formatDate(projet.date)}</td>
                            <td className="px-5 py-3.5 text-right">
                              <MenuActionsProjet
                                projet={projet}
                                compact
                                peutEditer={peutCreerProjetManuel(role)}
                                onModifier={ouvrirEditionProjet}
                                onStatutExpress={changerStatutExpress}
                                onVoirFiche={voirFicheProjet}
                                onArchiver={archiverOuSupprimerProjet}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="px-5 py-6 text-sm text-slate-400">
                    Aucun dossier à afficher. Créez un projet manuel ou activez le jeu de test.
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
                    Répartition historique Part Travaux / Apporteur / ENERGIA. Distincte de l’onglet
                    Finances (commission agent 10 % HT et marge nette). Masqué pour le commercial,
                    le partenaire et la présentation client.
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

              {donnees.avertissements?.length && !chargement && !jeuDemo ? (
                <p className="mt-4 text-xs text-cyan-200/70">
                  Production : {donnees.avertissements.join(" · ")}
                </p>
              ) : null}
            </>
          ) : null}

          {vue === "dashboard" && estPresentationClient(role) ? (
            <PresentationTablette
              key={dossierPresentation?.id || dossier?.id || "aucun"}
              vue={presentationVue}
              onVue={setPresentationVue}
              dossier={dossierPresentation || dossier}
              tablette={grosBouton}
              vueHub={vueHub}
              voirMargesInternes={false}
              role={role}
              commercialId={commercialId}
              onWorkingBaseChange={() => setWorkingRev((n) => n + 1)}
              onOperationnelChange={appliquerOperationnel}
            />
          ) : null}

          {vue === "pipeline" ? (
            <div>
              {!jeuDemo && chargement ? <SyncLoader /> : null}
              <PipelineBlock
                etapes={pipelineAffiche}
                total={totalPipeline}
                demo={jeuDemo}
                onEtape={ouvrirEtape}
              />
              <PipelineAnahBlock etapes={pipelineAnah} demo={jeuDemo} onEtape={ouvrirJalonAnah} />
              <SynthesePhasagePipeline dossiers={auditsAffiches} />
              <LeadsCourtierTable leads={leadsCourtierLive} demo={jeuDemo} chargement={chargement} />
              <p className="text-sm text-slate-400">
                Cliquez une étape commerciale ou un jalon ANAH pour ouvrir les projets correspondants.
              </p>
            </div>
          ) : null}

          {vue === "projets" ? (
            <div className="space-y-6">
            {peutVoirCrmCommercial(role) ? <GalerieRelevesTerrain /> : null}
            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Projets {etapeFiltre ? `— filtre ${etapeFiltre}` : ""}
                  {filtreApporteur ? ` · ${SOURCES_APPORTEUR.find((s) => s.id === filtreApporteur)?.label || ""}` : ""}
                  {filtreAnah ? ` · ${ETAPES_ANAH.find((s) => s.id === filtreAnah)?.compactLabel || ""}` : ""}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-400">
                    Apporteur
                    <select
                      value={filtreApporteur}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFiltreApporteur(value);
                        const params = new URLSearchParams();
                        if (etapeFiltre) params.set("etape", etapeFiltre);
                        if (filtreAnah) params.set("anah", filtreAnah);
                        if (value) params.set("apporteur", value);
                        aller("projets", params.toString());
                      }}
                      className="max-w-[18rem] rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                    >
                      <option value="">Tous</option>
                      {SOURCES_APPORTEUR.map((source) => (
                        <option key={source.id} value={source.id}>
                          {source.selectLabel}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-400">
                    Jalon ANAH
                    <select
                      value={filtreAnah}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFiltreAnah(value);
                        const params = new URLSearchParams();
                        if (etapeFiltre) params.set("etape", etapeFiltre);
                        if (filtreApporteur) params.set("apporteur", filtreApporteur);
                        if (value) params.set("anah", value);
                        aller("projets", params.toString());
                      }}
                      className="max-w-[16rem] rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                    >
                      <option value="">Tous</option>
                      {ETAPES_ANAH.map((etape) => (
                        <option key={etape.id} value={etape.id}>
                          {etape.ordre}. {etape.compactLabel}
                        </option>
                      ))}
                    </select>
                  </label>
                  {etapeFiltre || filtreApporteur || filtreAnah ? (
                    <button type="button" className="text-xs text-sky-300" onClick={() => aller("projets")}>
                      Retirer les filtres
                    </button>
                  ) : null}
                  {peutCreerProjetManuel(role) ? (
                    <button
                      type="button"
                      onClick={ouvrirNouveauProjetManuel}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-900/40 hover:from-emerald-500 hover:to-teal-400"
                    >
                      + Nouveau Projet Manuel
                    </button>
                  ) : null}
                </div>
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
                        <div className="mt-2">
                          <BoutonAuditRapportDevis dossier={projet} />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {projet.typeProjet || (projet.source === "manuel" ? "Dossier créé manuellement" : "Type de projet non renseigné")}
                        </p>
                        {projet.id === "damien-pv-100kwc-07" ? (
                          <p className="mt-1 text-xs text-sky-200/90">
                            Client : Exploitation Tertiaire / Agricole (07)
                            {voirMargesInternes ? " · Commission commerciale 3 500 € HT · Marge CG 14 500 € HT · TVA 20 %" : ""}
                          </p>
                        ) : null}
                        {projet.detailsTechniques?.resume ? (
                          <p className="mt-0.5 text-[11px] text-slate-500">{projet.detailsTechniques.resume}</p>
                        ) : null}
                        {peutVoirRfr(role) && projet.libelleRfr ? (
                          <p className="mt-1 text-xs text-amber-200/90">{projet.libelleRfr}</p>
                        ) : null}
                        <p className="mt-1 text-xs text-slate-500">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statutClass(projet.statut)}`}
                          >
                            {projet.statut}
                          </span>
                          <span className="ml-2 inline-flex align-middle">
                            <BadgeApporteur
                              compact
                              apporteurId={projet.apporteurId}
                              apporteurNom={projet.apporteurNom}
                            />
                          </span>
                          {projet.equipe ? (
                            <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
                              {projet.equipe.direction || projet.equipe.directionContractantGeneral ? (
                                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
                                  Sylvain
                                </span>
                              ) : null}
                              {projet.equipe.designAgencement ? (
                                <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
                                  Catarina
                                </span>
                              ) : null}
                            </span>
                          ) : null}
                          <span className="ml-2 inline-flex align-middle">
                            <ConsultationDuoCatarina
                              compact
                              apporteurId={projet.apporteurId}
                              cochee={projet.consultationDuo}
                            />
                          </span>
                          {projet.auditId ? (
                            <span className="ml-2 font-mono text-[11px] text-sky-300">{projet.auditId}</span>
                          ) : null}
                          {projet.montantEstimeTtc
                            ? ` · estimé ${euro(projet.montantEstimeTtc)} TTC`
                            : projet.caTtc
                              ? ` · ${euro(projet.caTtc)} TTC`
                              : ""}
                          {projet.source === "test-local" ? " · jeu de test" : ""}
                          {projet.source === "manuel" ? " · dossier manuel" : ""}
                          {projet.source === "client-direct" ? " · client direct" : ""}
                          {projet.source === "lead-prospect" ? " · lead prospect" : ""}
                          {projet.sourceLead ? ` · ${projet.sourceLead}` : ""}
                        </p>
                        {projet.priorite ? (
                          <p className="mt-1 text-xs font-medium text-orange-200">{projet.priorite}</p>
                        ) : null}
                        {projet.horsAidesPubliques ? (
                          <p className="mt-1 text-xs text-emerald-200">
                            Commission apporteur 10 % HT — périmètre strict hors énergie et hors aides publiques. Montant non calculé : pas de devis HT.
                          </p>
                        ) : null}
                        {projet.etapeAnah ? (
                          <div className="mt-2">
                            <IndicateurEtapeAnah
                              etapeAnah={projet.etapeAnah}
                              validationMar={projet.validationMar}
                              detailJalon={projet.detailJalon}
                              compact
                            />
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <MenuActionsProjet
                          projet={projet}
                          peutEditer={peutCreerProjetManuel(role)}
                          onModifier={ouvrirEditionProjet}
                          onStatutExpress={changerStatutExpress}
                          onVoirFiche={voirFicheProjet}
                          onArchiver={archiverOuSupprimerProjet}
                        />
                        {projet.href ? (
                          <a href={projet.href} className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:border-emerald-400">
                            Ouvrir le dossier
                          </a>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            </div>
          ) : null}

          {vue === "projets" && referencesDocumentaires.length > 0 ? (
            <section className="mt-6 overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900/70">
              <div className="border-b border-amber-500/20 px-5 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200">
                  Références documentaires internes
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Hors pipeline client. Aucun PDF, montant, aide ou adresse n’est recopié dans le
                  dossier Feurs.
                </p>
              </div>
              <ul className="divide-y divide-slate-800">
                {referencesDocumentaires.map((reference) => (
                  <li key={reference.id} className="px-5 py-4">
                    <p className="font-medium text-white">{reference.libelle}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {reference.numero} · {reference.statut}
                      {reference.perimetre?.villeTravaux
                        ? ` · travaux mentionnés : ${reference.perimetre.codePostalTravaux} ${reference.perimetre.villeTravaux}`
                        : ""}
                    </p>
                    <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                      {reference.alerte}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Fichier hors dépôt · montants non importés · non associé au dossier Feurs
                    </p>
                  </li>
                ))}
              </ul>
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
            <div className="space-y-6">
              {!estVueAmo(vueHub) ? (
              <RecapCommissionsCatarina
                dossiers={auditsAffiches}
                editable={!estPartenaireApporteur(role)}
                voirPartEnergia={!estPartenaireApporteur(role)}
                onStatut={(id, statutCommission) => appliquerOperationnel(id, { statutCommission })}
              />
              ) : null}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Partenaires et bureaux d'études</h2>
              <p className="mt-1 text-sm text-slate-500">
                Accès CRM limité aux prospects et dossiers rattachés. Les coûts internes, la
                commission agent ENERGIA (10 % HT) et la marge nette ne sont jamais affichés au
                partenaire. Un partenaire ne voit jamais les données d’autres apporteurs.
              </p>
              {notifsPartenaire.filter((notif) => !notif.lue).length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {notifsPartenaire.filter((notif) => !notif.lue).slice(0, 5).map((notif) => (
                    <li key={notif.id} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                      <strong>{notif.titre}</strong> — {notif.message}
                    </li>
                  ))}
                </ul>
              ) : null}
              <ul className="mt-4 space-y-3">
                {partenairesVisiblesPourRole(role, partenaireId).map((partenaire) => (
                  <li key={partenaire.id} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{partenaire.nom}</p>
                    <p className="text-sm text-slate-600">
                      {partenaire.entite} — {partenaire.qualite}
                    </p>
                    <p className="mt-2 text-sm text-slate-800">{partenaire.email}</p>
                    <p className="text-sm text-slate-600">
                      {partenaire.telephone} · {(partenaire.site || "").replace("https://", "") || "[À COMPLÉTER]"}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-emerald-700">
                      Périmètre : {partenaire.acces.perimetre.join(" · ")}
                    </p>
                    {partenaire.certification ? (
                      <p className="mt-2 text-sm text-slate-700">
                        {partenaire.referent ? `Référent ${partenaire.referent} · ` : ""}
                        Certification {partenaire.certification}
                      </p>
                    ) : null}
                    {Array.isArray(partenaire.poles) && partenaire.poles.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm text-slate-600">
                        {partenaire.poles.map((pole) => (
                          <li key={pole.id}>
                            <span className="font-medium text-slate-800">{pole.titre}.</span>{" "}
                            {pole.missions.join(" · ")}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {partenaire.conventionChemin ? (
                      <a
                        href={partenaire.conventionChemin}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sm font-semibold text-emerald-700 underline"
                      >
                        Convention {partenaire.conventionRef}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>

              <h3 className="mt-8 text-base font-semibold text-slate-900">Prospects pré-qualifiés (QR partenaire)</h3>
              <label className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600">
                Filtrer par apporteur
                <select
                  value={filtreApporteur}
                  onChange={(event) => setFiltreApporteur(event.target.value)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
                >
                  <option value="">Tous</option>
                  {SOURCES_APPORTEUR.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.selectLabel}
                    </option>
                  ))}
                </select>
              </label>
              {leadsDiagnostic.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  Aucun lead rattaché pour le moment. Source attendue : /partenaire/:id ou /diagnostic-rapide.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {leadsDiagnostic
                    .filter((lead) => !filtreApporteur || lead.sourceApporteur === filtreApporteur)
                    .map((lead) => (
                    <li key={lead.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {lead.prenom} {lead.nom}
                          </p>
                          <p className="text-sm text-slate-600">
                            {lead.email} · {lead.telephone}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Source {lead.source} · partenaire {lead.partenaire_id} · {lead.objectif_projet} · DPE {lead.dpe} · score{" "}
                            {lead.score_prequalification}
                          </p>
                          <div className="mt-2">
                            <BadgeApporteur
                              compact
                              apporteurId={lead.sourceApporteur}
                              apporteurNom={lead.assignee}
                            />
                          </div>
                          <p className="text-xs text-slate-500">
                            Consentement contact : {lead.consentement_contact ? "oui" : "non"} · mini-bilan email :{" "}
                            {lead.consentement_email ? "oui" : "non"}
                          </p>
                          <p className="text-xs text-slate-400">
                            Transmis le {lead.date_transmission ? new Date(lead.date_transmission).toLocaleString("fr-FR") : "—"}
                          </p>
                        </div>
                        <label className="text-xs font-medium text-slate-600">
                          Statut
                          <select
                            className="mt-1 block rounded-lg border border-slate-200 px-2 py-1 text-sm"
                            value={lead.statut_lead}
                            onChange={(event) => {
                              const updated = mettreAJourStatutLead(lead.id, event.target.value, role, partenaireId);
                              if (updated) setLeadsDiagnostic(lireLeadsPourRole(role, partenaireId));
                            }}
                          >
                            {STATUTS_LEAD.map((statut) => (
                              <option key={statut} value={statut}>
                                {statut}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            </div>
          ) : null}

          {vue === "maintenance" && peutVoirCrmCommercial(role) ? <GmaoHub /> : null}

          {vue === "radar-cee" && peutVoirCrmCommercial(role) ? <RadarCeeMarches voirMarges={voirMargesInternes} /> : null}

          {vue === "simulateur-solaire" && peutVoirCrmCommercial(role) ? <SimulateurSolaireTesla /> : null}

          {vue === "calpinage-solaire" && peutVoirCrmCommercial(role) ? (
            <SolarCalpinage clientNomInitial={dossier?.nom || ""} dossierId={dossier?.id || null} afficherMarge={voirMargesInternes} />
          ) : null}

          {vue === "dimensionnement-pac" && peutVoirCrmCommercial(role) ? (
            <PacDimensionnement clientNomInitial={dossier?.nom || ""} dossierId={dossier?.id || null} afficherMarge={voirMargesInternes} isAdmin={voirMargesInternes} />
          ) : null}

          {vue === "messagerie-crm" && peutVoirMessagerie(role) ? (
            <EmailHub dossierIdInitial={dossier?.id || null} clientNomInitial={dossier?.nom || ""} />
          ) : null}

          {vue === "plafond-sdb" && peutVoirCrmCommercial(role) ? (
            <DevisPlafondSDB cadre="crm" afficherMargeInterne={voirMargesInternes} />
          ) : null}

          {vue === "artisans" && peutVoirArtisansSousTraitance(role) ? (
            <AnnuaireArtisansRge role={role} dossier={dossier} voirBonsCommande={!estVueAmo(vueHub)} />
          ) : null}

          {vue === "radar-rge" && peutVoirArtisansSousTraitance(role) ? (
            <RadarRge
              chantiers={auditsAffiches.map((audit) => ({
                id: audit.id,
                nom: audit.nom,
                ville: audit.ville || "",
                codePostal: audit.codePostal || "",
                adresse: audit.adresse || "",
              }))}
            />
          ) : null}

          {vue === "catalogue-commercial" && peutVoirCatalogueCommercial(role) ? <CatalogueCommercial /> : null}

          {vue === "maison-martins" && peutVoirCatalogueMaisonMartins(role) ? <CatalogueMaisonMartins /> : null}

          {vue === "presentation" ? (
            <PresentationTablette
              key={dossierPresentation?.id || dossier?.id || "aucun"}
              vue={presentationVue}
              onVue={setPresentationVue}
              dossier={dossierPresentation || dossier}
              tablette={grosBouton}
              vueHub={vueHub}
              voirMargesInternes={voirMargesInternes}
              role={role}
              commercialId={commercialId}
              onWorkingBaseChange={() => setWorkingRev((n) => n + 1)}
              onOperationnelChange={appliquerOperationnel}
              dossiersDisponibles={auditsAffiches}
              onChangerDossier={setDossierId}
            />
          ) : null}

          {vue === "dpe-mapper" && peutVoirDpeMapper(role) ? (
            <Suspense fallback={<p className="text-sm text-slate-400">Chargement de la carte DPE…</p>}>
              <DpeMapper />
            </Suspense>
          ) : null}

          {vue === "association" && peutVoirRadarInsalubrite(role) ? (
            <Suspense fallback={<p className="text-sm text-slate-400">Chargement du radar association…</p>}>
              <AssociationVue />
            </Suspense>
          ) : null}

          {["devis", "coordination"].includes(vue) &&
          (vue === "devis" ? peutVoirDevisEtMarges(role) : peutVoirArtisansSousTraitance(role)) ? (
            <Suspense fallback={<p className="text-sm text-slate-400">Chargement du module stratégique…</p>}>
              <ModulesStrategiquesCrm
                module={vue}
                dossiers={auditsAffiches}
                masquerMarges={estVueAmo(vueHub)}
                voirPartEnergia={!estVueAmo(vueHub)}
                onOuvrirContrat={setMarcheModal}
              />
            </Suspense>
          ) : null}

          {["cuisines", "apporteurs"].includes(vue) &&
          (peutVoirCrmCommercial(role) || (vue === "cuisines" && peutVoirPipelinePartenaire(role))) ? (
            <Suspense fallback={<p className="text-sm text-slate-400">Chargement du module stratégique…</p>}>
              <ModulesStrategiquesCrm
                module={vue}
                dossiers={auditsAffiches}
                masquerMarges={estVueAmo(vueHub)}
                voirPartEnergia={!estVueAmo(vueHub)}
                onOuvrirContrat={setMarcheModal}
              />
            </Suspense>
          ) : null}

          {vue === "catalogue" && peutVoirCatalogueMetiers(role) ? (
            <Suspense
              fallback={<p className="text-sm text-slate-400">Chargement du catalogue métiers…</p>}
            >
              <CatalogueMetiers
                voirMargesInternes={voirMargesInternes}
                peutModifier={peutModifierCatalogueMetiers(role)}
                role={role}
              />
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

      <ModalContratOfficiel
        marches={
          marcheModal && MARCHES.some((item) => item.id === marcheModal.id) ? MARCHES : marcheModal ? [marcheModal] : MARCHES
        }
        marche={marcheModal}
        onChoisir={setMarcheModal}
        onFermer={() => setMarcheModal(null)}
      />

      {peutCreerProjetManuel(role) ? (
        <ModalNouveauProjet
          ouvert={modalNouveauProjet}
          projet={projetEnEdition}
          masquerMarges={estVueAmo(vueHub)}
          onFermer={() => {
            setModalNouveauProjet(false);
            setProjetEnEdition(null);
          }}
          onEnregistrer={enregistrerDossierManuel}
        />
      ) : null}

      {role !== ROLE_PRESENTATION && vue !== "controle-interne" && vue !== "catalogue" && vue !== "dpe-mapper" && vue !== "association" && vue !== "plafond-sdb" ? (
        <EnergiaCoPilot syntheseAudit="CRM ENERGIA. Ne jamais communiquer marges, coûts d’achat, commissions, coût Clyve ni prix plancher." />
      ) : null}
    </div>
  );
}
