import { useEffect, useMemo, useRef, useState } from "react";
import {
  EXAM_SECONDS,
  EXAM_SIZE,
  FILIERES,
  PASS_SCORE,
  buildExam,
  emptyPerFiliere,
  filiereTitle,
  verdictLabel,
  type ExamResult,
  type FiliereId,
  type RgeQuestion,
} from "../data/rgeQuestions";

type FeedbackMode = "immediat" | "final";

type QcmSimulatorProps = {
  filiere: FiliereId | "mixte";
  onExit: () => void;
  onFinished: (result: ExamResult) => void;
  onLiveChange: (live: boolean) => void;
};

const LETTERS = ["A", "B", "C", "D"] as const;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function QcmSimulator({ filiere, onExit, onFinished, onLiveChange }: QcmSimulatorProps) {
  const [questions] = useState<RgeQuestion[]>(() => buildExam(filiere, EXAM_SIZE));
  const [feedback, setFeedback] = useState<FeedbackMode>("immediat");
  const [phase, setPhase] = useState<"intro" | "question" | "result">("intro");
  const [cursor, setCursor] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(EXAM_SIZE).fill(null));
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [report, setReport] = useState<ExamResult | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const finishedRef = useRef(false);
  const answersRef = useRef(answers);
  const onFinishedRef = useRef(onFinished);
  answersRef.current = answers;
  onFinishedRef.current = onFinished;

  const composition = useMemo(
    () =>
      FILIERES.map((item) => ({
        ...item,
        count: questions.filter((question) => question.filiere === item.id).length,
      })).filter((item) => item.count > 0),
    [questions],
  );

  useEffect(() => {
    onLiveChange(phase === "question");
    return () => onLiveChange(false);
  }, [onLiveChange, phase]);

  useEffect(() => {
    if (phase !== "question" || startedAt === null) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [phase, startedAt]);

  const remaining =
    startedAt === null ? EXAM_SECONDS : Math.max(0, EXAM_SECONDS - Math.floor((now - startedAt) / 1000));

  function finish(finalAnswers: (number | null)[], reason: "submit" | "timeout") {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const perFiliere = emptyPerFiliere();
    let score = 0;
    const misses = new Map<string, number>();
    questions.forEach((question, index) => {
      const bucket = perFiliere[question.filiere];
      bucket.total += 1;
      if (finalAnswers[index] === question.correctIndex) {
        score += 1;
        bucket.correct += 1;
      } else {
        misses.set(question.theme, (misses.get(question.theme) ?? 0) + 1);
      }
    });
    const weakThemes = [...misses.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([theme, count]) => `${theme} (${count})`);
    const result: ExamResult = {
      filiere,
      score,
      total: questions.length,
      perFiliere,
      weakThemes,
    };
    setTimeUp(reason === "timeout");
    setReport(result);
    setPhase("result");
    setRevealed(false);
  }

  useEffect(() => {
    if (phase !== "question" || startedAt === null || remaining > 0) return;
    finish(answersRef.current, "timeout");
    // finish is stable enough for the timeout edge; the ref blocks a second call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, remaining, startedAt]);

  useEffect(() => {
    if (!report) return;
    onFinishedRef.current(report);
  }, [report]);

  function choose(index: number) {
    if (phase !== "question") return;
    if (feedback === "immediat" && revealed) return;
    setAnswers((current) => {
      const next = [...current];
      next[cursor] = index;
      return next;
    });
    if (feedback === "immediat") setRevealed(true);
  }

  function goNext() {
    if (phase !== "question") return;
    if (answersRef.current[cursor] === null) return;
    if (feedback === "immediat" && !revealed) return;
    if (cursor >= questions.length - 1) {
      finish(answersRef.current, "submit");
      return;
    }
    setCursor((current) => current + 1);
    setRevealed(false);
  }

  function jumpTo(index: number) {
    if (feedback !== "final" || phase !== "question") return;
    setCursor(index);
    setRevealed(false);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (phase !== "question") return;
      const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, "1": 0, "2": 1, "3": 2, "4": 3 };
      const index = map[event.key.toLowerCase()];
      if (index !== undefined) {
        event.preventDefault();
        choose(index);
      }
      if (event.key === "Enter") {
        event.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const question = questions[cursor];
  const showCorrection = feedback === "immediat" && revealed && phase === "question";
  const selected = answers[cursor];
  const timerDanger = remaining < 60;
  const timerWarn = remaining < 5 * 60;

  if (phase === "intro") {
    return (
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] text-[#e8c872]">EXAMEN BLANC · {EXAM_SIZE} QUESTIONS</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">{filiereTitle(filiere)}</h2>
        <p className="mt-4 leading-relaxed text-slate-300">
          Même rythme qu&apos;une épreuve : {EXAM_SIZE} questions, {EXAM_SECONDS / 60} minutes, seuil de
          l&apos;académie à {PASS_SCORE}/{EXAM_SIZE}. Les questions de la filière choisie passent en priorité. La
          banque est complétée pour atteindre {EXAM_SIZE} items.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {composition.map((item) => (
            <li
              key={item.id}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200"
            >
              <span style={{ color: item.accent }}>{item.title}</span>
              <span className="text-slate-400"> · {item.count}</span>
            </li>
          ))}
        </ul>
        <fieldset className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <legend className="px-2 text-sm font-medium text-[#e8c872]">Mode de correction</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ModeCard
              active={feedback === "immediat"}
              title="Retour immédiat"
              text="Vert ou rouge dès le choix, avec l'explication du DTU ou de la norme."
              onClick={() => setFeedback("immediat")}
            />
            <ModeCard
              active={feedback === "final"}
              title="Fin d'examen"
              text="Vous répondez toute la série. La correction détaillée s'ouvre à la remise de copie."
              onClick={() => setFeedback("final")}
            />
          </div>
        </fieldset>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              finishedRef.current = false;
              setAnswers(Array(questions.length).fill(null));
              setCursor(0);
              setRevealed(false);
              setStartedAt(Date.now());
              setNow(Date.now());
              setPhase("question");
            }}
            className="rounded-full bg-gradient-to-r from-[#f5e6b8] to-[#c8962e] px-6 py-3 text-sm font-semibold text-[#1a1203]"
          >
            Lancer le chrono
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-white/15 px-6 py-3 text-sm text-slate-200"
          >
            Retour
          </button>
        </div>
      </section>
    );
  }

  if (phase === "result" && report) {
    const passed = report.score >= PASS_SCORE;
    return (
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] text-[#e8c872]">RÉSULTAT</p>
        <h2 className="mt-3 text-4xl font-semibold tabular-nums text-white">
          {report.score}
          <span className="text-2xl text-slate-400">/{report.total}</span>
        </h2>
        <p
          className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
            passed ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
          }`}
        >
          {verdictLabel(report.score, report.total)}
        </p>
        {timeUp ? <p className="mt-3 text-sm text-amber-200">Temps écoulé — la copie a été remise automatiquement.</p> : null}
        <p className="mt-4 text-sm text-slate-400">Seuil de l&apos;académie : {PASS_SCORE}/{EXAM_SIZE}.</p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-white">Points faibles</h3>
          {report.weakThemes.length === 0 ? (
            <p className="mt-2 text-sm text-emerald-300">Aucun point faible sur cette série.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              {report.weakThemes.map((theme) => (
                <li key={theme}>{theme}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowReview((value) => !value)}
            className="rounded-full border border-[#e8c872]/40 px-5 py-2.5 text-sm text-[#e8c872]"
          >
            {showReview ? "Masquer la copie" : "Revoir la copie"}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-full bg-white/10 px-5 py-2.5 text-sm text-white"
          >
            Retour au tableau de bord
          </button>
        </div>
        {showReview ? (
          <ol className="mt-6 space-y-4">
            {questions.map((item, index) => {
              const answer = answers[index];
              const ok = answer === item.correctIndex;
              return (
                <li key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs tracking-wide text-[#e8c872]">
                    {index + 1}. {item.norme} · {item.theme}
                  </p>
                  <p className="mt-2 font-medium text-white">{item.question}</p>
                  <p className={`mt-2 text-sm ${ok ? "text-emerald-300" : "text-red-300"}`}>
                    {ok ? "Bonne réponse" : "Erreur"} — bonne réponse {LETTERS[item.correctIndex]}.{" "}
                    {answer === null ? "Sans réponse." : `Votre choix : ${LETTERS[answer]}.`}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.explanation}</p>
                </li>
              );
            })}
          </ol>
        ) : null}
      </section>
    );
  }

  if (!question) return null;

  return (
    <section className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-300">
          Question <span className="tabular-nums text-white">{cursor + 1}</span> / {questions.length}
          <span className="mx-2 text-slate-600">·</span>
          {filiereTitle(filiere)}
        </p>
        <p
          className={`rounded-full border px-4 py-1.5 font-mono text-lg tabular-nums ${
            timerDanger
              ? "border-red-400/50 text-red-300"
              : timerWarn
                ? "border-amber-300/40 text-amber-200"
                : "border-[#e8c872]/30 text-[#e8c872]"
          }`}
          aria-live="polite"
        >
          {formatTime(remaining)}
        </p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-[#e8c872]"
          style={{ width: `${((cursor + (showCorrection ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>
      {feedback === "final" ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {questions.map((item, index) => {
            const filled = answers[index] !== null;
            const active = index === cursor;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => jumpTo(index)}
                className={`h-7 w-7 rounded-md text-xs tabular-nums ${
                  active
                    ? "bg-[#e8c872] text-[#1a1203]"
                    : filled
                      ? "bg-sky-500/20 text-sky-200"
                      : "bg-white/5 text-slate-400"
                }`}
                aria-label={`Question ${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      ) : null}
      <article className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
        <p className="text-xs font-semibold tracking-[0.16em] text-[#e8c872]">
          {question.norme} · {question.theme}
        </p>
        <h2 className="mt-3 text-xl font-medium leading-snug text-white sm:text-2xl">{question.question}</h2>
        <div className="mt-6 space-y-3">
          {question.choices.map((choice, index) => {
            const isSelected = selected === index;
            const isCorrect = index === question.correctIndex;
            let tone = "border-white/10 bg-black/20 hover:border-white/25";
            if (showCorrection && isCorrect) tone = "border-emerald-400 bg-emerald-500/15";
            else if (showCorrection && isSelected) tone = "border-red-400 bg-red-500/15";
            else if (isSelected) tone = "border-[#e8c872] bg-[#e8c872]/10";
            return (
              <button
                key={choice}
                type="button"
                onClick={() => choose(index)}
                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${tone}`}
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-sm font-semibold">
                  {LETTERS[index]}
                </span>
                <span className="text-sm leading-relaxed text-slate-100 sm:text-base">{choice}</span>
              </button>
            );
          })}
        </div>
        {showCorrection ? (
          <div
            className={`mt-5 rounded-2xl border p-4 ${
              selected === question.correctIndex
                ? "border-emerald-400/40 bg-emerald-500/10"
                : "border-red-400/40 bg-red-500/10"
            }`}
          >
            <p className="text-sm font-semibold text-white">
              {selected === question.correctIndex ? "Bonne réponse" : "Réponse incorrecte"} — la bonne réponse est{" "}
              {LETTERS[question.correctIndex]}.
            </p>
            <p className="mt-1 text-xs tracking-wide text-[#e8c872]">{question.norme}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{question.explanation}</p>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Touches A B C D ou 1 2 3 4 · Entrée pour continuer</p>
          <button
            type="button"
            onClick={goNext}
            disabled={selected === null || (feedback === "immediat" && !revealed)}
            className="rounded-full bg-gradient-to-r from-[#f5e6b8] to-[#c8962e] px-5 py-2.5 text-sm font-semibold text-[#1a1203] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {cursor === questions.length - 1 ? "Remettre la copie" : "Question suivante"}
          </button>
        </div>
      </article>
    </section>
  );
}

function ModeCard({
  active,
  title,
  text,
  onClick,
}: {
  active: boolean;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left ${
        active ? "border-[#e8c872] bg-[#e8c872]/10" : "border-white/10 bg-black/20"
      }`}
      aria-pressed={active}
    >
      <span className="block text-sm font-semibold text-white">{title}</span>
      <span className="mt-1 block text-sm leading-relaxed text-slate-400">{text}</span>
    </button>
  );
}
