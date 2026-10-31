import { useEffect, useState } from "react";
import { IDENTITE_LEGALE } from "../lib/branding";
import CatalogueFormations from "./components/CatalogueFormations";
import FinancementBancaire from "./components/FinancementBancaire";
import MarAmoModule from "./components/MarAmoModule";
import QcmSimulator from "./components/QcmSimulator";
import SavMaintenance from "./components/SavMaintenance";
import Viewer3D from "./components/Viewer3D";
import {
  FILIERES,
  FILIERE_IDS,
  QUESTIONS,
  type ExamResult,
  type FiliereId,
} from "./data/rgeQuestions";

type View = "dashboard" | "qcm" | "viewer" | "sav" | "mar" | "finance" | "masterclass";

type Stats = {
  examsTaken: number;
  examsValidated: number;
  totalCorrect: number;
  totalAnswered: number;
  bestScore: number;
  viewerOpened: boolean;
  savOpened: boolean;
  marOpened: boolean;
  financeOpened: boolean;
  masterclassOpened: boolean;
  filiereProgress: Record<FiliereId, number>;
  filiereSample: Record<FiliereId, number>;
};

const STORAGE_KEY = "energia-prepa-rge-v1";

const BADGES: { id: string; label: string; hint: string; unlocked: (stats: Stats) => boolean }[] = [
  { id: "blanc", label: "Premier examen blanc", hint: "Terminer une série de 30 questions", unlocked: (stats) => stats.examsTaken >= 1 },
  { id: "mention", label: "Reçu avec mention", hint: "Atteindre 24/30", unlocked: (stats) => stats.bestScore >= 24 },
  { id: "parfait", label: "Sans-faute", hint: "30/30 sur une série", unlocked: (stats) => stats.bestScore >= 30 },
  { id: "pac", label: "Aptitude QualiPAC", hint: "80 % sur au moins 5 questions QualiPAC", unlocked: (stats) => stats.filiereProgress.qualipac >= 80 && stats.filiereSample.qualipac >= 5 },
  { id: "pv", label: "Aptitude QualiPV", hint: "80 % sur au moins 5 questions QualiPV", unlocked: (stats) => stats.filiereProgress.qualipv >= 80 && stats.filiereSample.qualipv >= 5 },
  { id: "bois", label: "Aptitude Qualibois", hint: "80 % sur au moins 5 questions Qualibois", unlocked: (stats) => stats.filiereProgress.qualibois >= 80 && stats.filiereSample.qualibois >= 5 },
  { id: "reno", label: "Aptitude Rénovation globale", hint: "80 % sur au moins 5 questions rénovation", unlocked: (stats) => stats.filiereProgress.renovation >= 80 && stats.filiereSample.renovation >= 5 },
  { id: "labo", label: "Labo 3D exploré", hint: "Ouvrir une coupe : PAC, solaire, bois ou maison", unlocked: (stats) => stats.viewerOpened },
  { id: "sav", label: "SAV GRAFCET", hint: "Ouvrir le diagnostic de panne", unlocked: (stats) => stats.savOpened },
  { id: "mar", label: "MAR & AMO", hint: "Ouvrir la matrice du parcours accompagné", unlocked: (stats) => stats.marOpened },
  { id: "finance", label: "Financements bancaires", hint: "Ouvrir le module ORIAS et crédit affecté", unlocked: (stats) => stats.financeOpened },
  { id: "masterclass", label: "Masterclass", hint: "Ouvrir le catalogue des formations", unlocked: (stats) => stats.masterclassOpened },
];

function emptyStats(): Stats {
  return {
    examsTaken: 0,
    examsValidated: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    bestScore: 0,
    viewerOpened: false,
    savOpened: false,
    marOpened: false,
    financeOpened: false,
    masterclassOpened: false,
    filiereProgress: { qualipac: 0, qualipv: 0, qualibois: 0, renovation: 0 },
    filiereSample: { qualipac: 0, qualipv: 0, qualibois: 0, renovation: 0 },
  };
}

function clampPct(value: unknown) {
  const number = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function loadStats(): Stats {
  const base = emptyStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<Stats>;
    const progress = { ...base.filiereProgress };
    const sample = { ...base.filiereSample };
    for (const id of FILIERE_IDS) {
      progress[id] = clampPct(parsed.filiereProgress?.[id]);
      const seen = parsed.filiereSample?.[id];
      sample[id] = typeof seen === "number" && Number.isFinite(seen) ? Math.max(0, Math.round(seen)) : 0;
    }
    return {
      ...base,
      ...parsed,
      filiereProgress: progress,
      filiereSample: sample,
      examsTaken: Number(parsed.examsTaken) || 0,
      examsValidated: Number(parsed.examsValidated) || 0,
      totalCorrect: Number(parsed.totalCorrect) || 0,
      totalAnswered: Number(parsed.totalAnswered) || 0,
      bestScore: Number(parsed.bestScore) || 0,
      viewerOpened: Boolean(parsed.viewerOpened),
      savOpened: Boolean(parsed.savOpened),
      marOpened: Boolean(parsed.marOpened),
      financeOpened: Boolean(parsed.financeOpened),
      masterclassOpened: Boolean(parsed.masterclassOpened),
    };
  } catch {
    return base;
  }
}

function applyResult(stats: Stats, result: ExamResult): Stats {
  const next: Stats = {
    ...stats,
    examsTaken: stats.examsTaken + 1,
    examsValidated: stats.examsValidated + (result.score >= 24 ? 1 : 0),
    totalCorrect: stats.totalCorrect + result.score,
    totalAnswered: stats.totalAnswered + result.total,
    bestScore: Math.max(stats.bestScore, result.score),
    filiereProgress: { ...stats.filiereProgress },
    filiereSample: { ...stats.filiereSample },
  };
  for (const id of FILIERE_IDS) {
    const bucket = result.perFiliere[id];
    if (!bucket || bucket.total < 5) continue;
    const pct = Math.round((bucket.correct / bucket.total) * 100);
    if (pct >= next.filiereProgress[id]) {
      next.filiereProgress[id] = pct;
      next.filiereSample[id] = bucket.total;
    }
  }
  return next;
}

export default function PrepaRgeApp() {
  const [view, setView] = useState<View>("dashboard");
  const [filiere, setFiliere] = useState<FiliereId | "mixte">("qualipac");
  const [selected, setSelected] = useState<FiliereId>("qualipac");
  const [examKey, setExamKey] = useState(0);
  const [examLive, setExamLive] = useState(false);
  const [stats, setStats] = useState<Stats>(() => loadStats());

  useEffect(() => {
    const previous = document.title;
    document.title = "Prépa RGE 3D — Académie BTP | ENERGIA-CONSEIL IA®";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (view === "sav") {
      setStats((current) => (current.savOpened ? current : { ...current, savOpened: true }));
    }
    if (view === "mar") {
      setStats((current) => (current.marOpened ? current : { ...current, marOpened: true }));
    }
    if (view === "finance") {
      setStats((current) => (current.financeOpened ? current : { ...current, financeOpened: true }));
    }
    if (view === "masterclass") {
      setStats((current) => (current.masterclassOpened ? current : { ...current, masterclassOpened: true }));
    }
  }, [view]);

  function go(next: View) {
    if (view === "qcm" && examLive && next !== "qcm") {
      const leave = window.confirm("Quitter l'examen en cours ? La série ne sera pas enregistrée.");
      if (!leave) return;
    }
    setView(next);
  }

  function openExam(target: FiliereId | "mixte") {
    if (view === "qcm" && examLive) {
      const leave = window.confirm("Quitter l'examen en cours ? La série ne sera pas enregistrée.");
      if (!leave) return;
    }
    setFiliere(target);
    setExamKey((value) => value + 1);
    setView("qcm");
  }

  const rate = stats.totalAnswered === 0 ? null : Math.round((stats.totalCorrect / stats.totalAnswered) * 100);
  const unlocked = BADGES.filter((badge) => badge.unlocked(stats)).length;
  const active = FILIERES.find((item) => item.id === selected) ?? FILIERES[0];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-[#e8c872]/10 blur-3xl" />
      </div>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#070b12]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <button type="button" onClick={() => go("dashboard")} className="text-left">
            <span className="block text-[11px] font-semibold tracking-[0.18em] text-[#e8c872]">ENERGIA-CONSEIL IA®</span>
            <span className="block text-sm font-semibold text-white">Prépa RGE 3D</span>
          </button>
          <nav className="flex flex-wrap gap-2">
            <NavButton active={view === "dashboard"} onClick={() => go("dashboard")}>
              Tableau de bord
            </NavButton>
            <NavButton active={view === "qcm"} onClick={() => openExam(selected)}>
              Examen blanc QCM
            </NavButton>
            <NavButton active={view === "viewer"} onClick={() => go("viewer")}>
              Labo 3D
            </NavButton>
            <NavButton active={view === "sav"} onClick={() => go("sav")}>
              SAV & Dépannage GRAFCET
            </NavButton>
            <NavButton active={view === "mar"} onClick={() => go("mar")}>
              MAR & AMO
            </NavButton>
            <NavButton active={view === "finance"} onClick={() => go("finance")}>
              Financements Bancaires
            </NavButton>
            <NavButton active={view === "masterclass"} onClick={() => go("masterclass")}>
              Masterclass & Métiers
            </NavButton>
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8">
        {view === "dashboard" ? (
          <>
            <p className="text-xs font-semibold tracking-[0.28em] text-[#e8c872]">L&apos;ACADÉMIE BTP NOUVELLE GÉNÉRATION</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Prépa RGE 3D
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
              Quatre filières, l&apos;examen blanc, le labo 3D, le GRAFCET, le MAR, les financements et les masterclass métiers.
              Le simulateur prépare l&apos;artisan et les accompagnateurs ; il reste distinct de l&apos;examen officiel RGE.
            </p>

            <section className="mt-8 grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Examens blancs passés"
                value={String(stats.examsTaken)}
                hint={stats.examsTaken === 0 ? "Aucune copie remise" : `${stats.examsValidated} validés à 24/30 ou plus`}
              />
              <StatCard
                label="Taux de réussite au QCM"
                value={rate === null ? "—" : `${rate} %`}
                hint={rate === null ? "Les bonnes réponses s'afficheront ici" : `${stats.totalCorrect} bonnes réponses sur ${stats.totalAnswered}`}
              />
              <StatCard
                label="Badges d'aptitude"
                value={`${unlocked}/${BADGES.length}`}
                hint={unlocked === 0 ? "Le premier badge s'ouvre avec un examen" : "Débloqués sur cet appareil"}
              />
            </section>

            <section className="mt-10">
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Filières RGE</h2>
                <p className="text-xs text-slate-500">{QUESTIONS.length} questions en banque</p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {FILIERES.map((item) => {
                  const progress = stats.filiereProgress[item.id];
                  const count = QUESTIONS.filter((question) => question.filiere === item.id).length;
                  const isSelected = selected === item.id;
                  return (
                    <article
                      key={item.id}
                      className={`rounded-3xl border bg-white/[0.03] p-4 ${isSelected ? "border-transparent" : "border-white/10"}`}
                      style={
                        isSelected
                          ? { boxShadow: `0 0 0 1px ${item.accent}, 0 18px 50px -28px ${item.accent}` }
                          : undefined
                      }
                    >
                      <button type="button" onClick={() => setSelected(item.id)} className="w-full text-left">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-white">{item.title}</h3>
                            <p className="mt-1 text-sm text-slate-400">{item.subtitle}</p>
                          </div>
                          <Ring value={progress} color={item.accent} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {item.equipments.map((gear) => (
                            <span key={gear} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">
                              {gear}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: item.accent }} />
                        </div>
                        <p className="mt-2 text-[11px] tracking-wide text-[#e8c872]/80">{item.refs.join(" · ")}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Progression {progress} % · {count} questions cœur
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => openExam(item.id)}
                        className="mt-4 w-full rounded-full border border-white/10 py-2 text-sm text-white hover:border-[#e8c872]/50"
                      >
                        Examen 30 questions
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
              <div>
                <p className="text-xs tracking-[0.16em] text-[#e8c872]">FILIÈRE SÉLECTIONNÉE</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{active.title}</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">{active.detail}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
                <button
                  type="button"
                  onClick={() => openExam(active.id)}
                  className="rounded-full bg-gradient-to-r from-[#f5e6b8] to-[#c8962e] px-5 py-2.5 text-sm font-semibold text-[#1a1203]"
                >
                  Lancer {active.title}
                </button>
                <button
                  type="button"
                  onClick={() => openExam("mixte")}
                  className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white"
                >
                  Examen mixte
                </button>
                <button
                  type="button"
                  onClick={() => go("viewer")}
                  className="rounded-full border border-sky-400/30 px-5 py-2.5 text-sm text-sky-200"
                >
                  Ouvrir le labo 3D
                </button>
                <button
                  type="button"
                  onClick={() => go("sav")}
                  className="rounded-full border border-red-400/30 px-5 py-2.5 text-sm text-red-200"
                >
                  SAV GRAFCET
                </button>
                <button
                  type="button"
                  onClick={() => go("mar")}
                  className="rounded-full border border-[#e8c872]/40 px-5 py-2.5 text-sm text-[#e8c872]"
                >
                  MAR & AMO
                </button>
                <button
                  type="button"
                  onClick={() => go("finance")}
                  className="rounded-full border border-[#e8c872]/40 px-5 py-2.5 text-sm text-[#e8c872]"
                >
                  Financements
                </button>
                <button
                  type="button"
                  onClick={() => go("masterclass")}
                  className="rounded-full border border-[#e8c872]/40 px-5 py-2.5 text-sm text-[#e8c872]"
                >
                  Masterclass
                </button>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-lg font-semibold text-white">Badges d&apos;aptitude débloqués</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {BADGES.map((badge) => {
                  const open = badge.unlocked(stats);
                  return (
                    <li
                      key={badge.id}
                      className={`rounded-2xl border p-4 ${open ? "border-[#e8c872]/50 bg-[#e8c872]/10" : "border-white/10 bg-white/[0.02] opacity-70"}`}
                    >
                      <p className="text-sm font-semibold text-white">{badge.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">{badge.hint}</p>
                      <p className={`mt-3 text-xs font-medium ${open ? "text-[#e8c872]" : "text-slate-500"}`}>
                        {open ? "Débloqué" : "Verrouillé"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>

            <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-500">
              <p>{IDENTITE_LEGALE.raisonSociale} · {IDENTITE_LEGALE.siege} · module de révision 2026</p>
              <button
                type="button"
                className="underline decoration-white/20 underline-offset-2"
                onClick={() => {
                  if (window.confirm("Effacer les statistiques de cet appareil ?")) {
                    setStats(emptyStats());
                  }
                }}
              >
                Réinitialiser les statistiques
              </button>
            </footer>
          </>
        ) : null}

        {view === "qcm" ? (
          <QcmSimulator
            key={examKey}
            filiere={filiere}
            onExit={() => go("dashboard")}
            onLiveChange={setExamLive}
            onFinished={(result) => setStats((current) => applyResult(current, result))}
          />
        ) : null}

        {view === "viewer" ? (
          <Viewer3D onExplored={() => setStats((current) => (current.viewerOpened ? current : { ...current, viewerOpened: true }))} />
        ) : null}

        {view === "sav" ? (
          <SavMaintenance
            filiere={selected}
            onFiliereChange={(next) => {
              setSelected(next);
              setStats((current) => (current.savOpened ? current : { ...current, savOpened: true }));
            }}
          />
        ) : null}

        {view === "mar" ? <MarAmoModule /> : null}

        {view === "finance" ? <FinancementBancaire /> : null}

        {view === "masterclass" ? <CatalogueFormations /> : null}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ${active ? "bg-[#e8c872] text-[#1a1203]" : "text-slate-300 hover:bg-white/5"}`}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </article>
  );
}

function Ring({ value, color }: { value: number; color: string }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
      <circle cx="26" cy="26" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
      <circle
        cx="26"
        cy="26"
        r={radius}
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <text x="26" y="30" textAnchor="middle" fontSize="11" fill="#f8fafc">
        {value}
      </text>
    </svg>
  );
}
