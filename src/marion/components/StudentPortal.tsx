import { useEffect, useMemo, useState } from "react";
import {
  ALL_LESSONS,
  BRAND,
  MODULES,
  PROGRESS_KEY,
  lessonDurationLabel,
  protocoleLines,
  type Lesson,
} from "../data/courseData";

const serif = '"Cormorant Garamond", Georgia, serif';

type StudentPortalProps = {
  onBackToOffer: () => void;
};

export default function StudentPortal({ onBackToOffer }: StudentPortalProps) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState(ALL_LESSONS[0].id);
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROGRESS_KEY);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      setDone({});
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(done));
  }, [done]);

  const active = ALL_LESSONS.find((lesson) => lesson.id === activeId) ?? ALL_LESSONS[0];
  const duration = active.durationMin * 60;
  const completedCount = ALL_LESSONS.filter((lesson) => done[lesson.id]).length;
  const ratio = completedCount / ALL_LESSONS.length;

  useEffect(() => {
    setPlaying(false);
    setSeconds(0);
  }, [activeId]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current + 1 >= duration) {
          setPlaying(false);
          setDone((prev) => ({ ...prev, [active.id]: true }));
          return duration;
        }
        return current + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, duration, active.id]);

  const moduleProgress = useMemo(
    () =>
      MODULES.map((module) => ({
        id: module.id,
        complete: module.lessons.every((lesson) => done[lesson.id]),
      })),
    [done],
  );

  function toggleLesson(lesson: Lesson) {
    setDone((prev) => ({ ...prev, [lesson.id]: !prev[lesson.id] }));
  }

  function selectLesson(lesson: Lesson) {
    setActiveId(lesson.id);
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[320px_1fr] sm:px-8">
      <aside className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#6E7F62]">Espace membre</p>
          <h1 className="mt-2 text-4xl text-[#2C3328]" style={{ fontFamily: serif }}>
            {BRAND.formation}
          </h1>
          <p className="mt-2 text-sm text-[#6E655C]">
            {completedCount} / {ALL_LESSONS.length} leçons validées
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E7E0D4]" aria-hidden="true">
            <div className="h-full rounded-full bg-[#6E7F62] transition-all" style={{ width: `${ratio * 100}%` }} />
          </div>
          <p className="mt-1 text-xs text-[#8A8178]">{Math.round(ratio * 100)} % du parcours</p>
        </div>

        <nav className="space-y-4" aria-label="Modules">
          {MODULES.map((module) => {
            const moduleDone = moduleProgress.find((item) => item.id === module.id)?.complete;
            return (
              <section key={module.id} className="rounded-2xl border border-[#E3D8C8] bg-[#FBF8F4]/90 p-4">
                <header className="flex items-start gap-3">
                  <Check checked={Boolean(moduleDone)} label={`Module ${module.index} ${moduleDone ? "terminé" : "en cours"}`} />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#C4846A]">Module {module.index}</p>
                    <h2 className="text-xl leading-tight text-[#2C3328]" style={{ fontFamily: serif }}>
                      {module.title}
                    </h2>
                  </div>
                </header>
                <ul className="mt-3 space-y-1">
                  {module.lessons.map((lesson) => {
                    const selected = lesson.id === active.id;
                    return (
                      <li key={lesson.id}>
                        <div
                          className={`flex items-start gap-2 rounded-xl px-2 py-2 ${selected ? "bg-[#E7EFE4]" : "hover:bg-white"}`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleLesson(lesson)}
                            className="mt-0.5"
                            aria-label={done[lesson.id] ? `Retirer la validation de ${lesson.title}` : `Valider ${lesson.title}`}
                          >
                            <Check checked={Boolean(done[lesson.id])} />
                          </button>
                          <button type="button" onClick={() => selectLesson(lesson)} className="min-w-0 flex-1 text-left">
                            <span className="block text-sm text-[#2F2A26]">{lesson.title}</span>
                            <span className="text-xs text-[#8A8178]">{lessonDurationLabel(lesson.durationMin)}</span>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </nav>
      </aside>

      <section className="space-y-6">
        <VideoPlayer
          title={active.title}
          summary={active.summary}
          seconds={seconds}
          duration={duration}
          playing={playing}
          onToggle={() => setPlaying((value) => !value)}
          onSeek={(next) => setSeconds(next)}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#6E655C]">
            {done[active.id] ? "Leçon validée." : "La leçon se valide à la fin de la lecture, ou tout de suite si vous la connaissez déjà."}
          </p>
          <button
            type="button"
            onClick={() => toggleLesson(active)}
            className="rounded-full border border-[#6E7F62] px-4 py-2 text-sm text-[#3F4F3C]"
          >
            {done[active.id] ? "Retirer la coche" : "Marquer comme vue"}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-[1.4rem] border border-[#E3D8C8] bg-white/80 p-5">
            <h2 className="text-2xl text-[#2C3328]" style={{ fontFamily: serif }}>
              Protocole PDF
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5C554C]">
              La fiche de séance : accueil, pieds, mains, tête, clôture. À garder ouverte pendant vos premières pratiques.
            </p>
            <button
              type="button"
              onClick={downloadProtocole}
              className="mt-4 rounded-full bg-[#3F4F3C] px-4 py-2.5 text-sm text-[#F7F3EC]"
            >
              Télécharger le protocole
            </button>
          </article>
          <article className="rounded-[1.4rem] border border-[#E7C8B8] bg-[#FBF6F2] p-5">
            <h2 className="text-2xl text-[#2C3328]" style={{ fontFamily: serif }}>
              {BRAND.telegramLabel}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5C554C]">
              Les questions de geste, les doutes après une première séance, et les nouvelles de Marion.
            </p>
            <a
              href={BRAND.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block rounded-full bg-[#C4846A] px-4 py-2.5 text-sm text-white"
            >
              Ouvrir le groupe Telegram
            </a>
          </article>
        </div>

        <button type="button" onClick={onBackToOffer} className="text-sm text-[#6E7F62] underline-offset-4 hover:underline">
          Revenir à la page de la formation
        </button>
      </section>
    </main>
  );
}

function Check({ checked, label }: { checked: boolean; label?: string }) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
        checked ? "border-[#6E7F62] bg-[#6E7F62] text-white" : "border-[#C9BBA8] bg-white text-transparent"
      }`}
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
        <path d="M3.5 8.2 6.4 11l6.1-6.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function VideoPlayer({
  title,
  summary,
  seconds,
  duration,
  playing,
  onToggle,
  onSeek,
}: {
  title: string;
  summary: string;
  seconds: number;
  duration: number;
  playing: boolean;
  onToggle: () => void;
  onSeek: (seconds: number) => void;
}) {
  const ratio = duration === 0 ? 0 : seconds / duration;

  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-[#E3D8C8] bg-[#2C3328] text-[#F7F3EC] shadow-[0_24px_50px_-32px_rgba(44,51,40,0.7)]">
      <div className="relative flex min-h-[280px] flex-col justify-between bg-[radial-gradient(circle_at_20%_20%,#6E7F62,transparent_42%),radial-gradient(circle_at_80%_80%,#C4846A,transparent_36%),#2C3328] p-6 sm:min-h-[360px] sm:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#E4EBDF]/80">Lecteur · séance enregistrée</p>
        <div>
          <h2 className="max-w-xl text-4xl leading-tight sm:text-5xl" style={{ fontFamily: serif }}>
            {title}
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#E4EBDF]">{summary}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F3EC] text-lg text-[#3F4F3C] sm:bottom-8 sm:right-8"
          aria-label={playing ? "Mettre en pause" : "Lire la leçon"}
        >
          {playing ? "II" : "▶"}
        </button>
      </div>
      <div className="bg-[#243026] px-4 py-3 sm:px-6">
        <label className="block text-[11px] uppercase tracking-[0.16em] text-[#C9D4C4]">
          Progression de la lecture
          <input
            type="range"
            min={0}
            max={duration}
            value={seconds}
            onChange={(event) => onSeek(Number(event.target.value))}
            className="mt-2 w-full accent-[#C4846A]"
            aria-valuetext={`${formatTime(seconds)} sur ${formatTime(duration)}`}
          />
        </label>
        <div className="mt-1 flex justify-between text-xs text-[#C9D4C4]">
          <span>{formatTime(seconds)}</span>
          <span>{Math.round(ratio * 100)} %</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

function formatTime(total: number): string {
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function downloadProtocole() {
  const content = buildPdf(protocoleLines());
  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Plume-de-Soi-protocole-metamorphose.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

function buildPdf(lines: string[]): string {
  const commands = ["BT", "/F1 11 Tf", "0.25 0.28 0.24 rg"];
  let y = 760;
  lines.forEach((line) => {
    const safe = line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    commands.push(`1 0 0 1 56 ${y} Tm (${safe}) Tj`);
    y -= line === "" ? 12 : 16;
  });
  commands.push("ET");
  const stream = commands.join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let body = "%PDF-1.4\n";
  const offsets: number[] = [0];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return body;
}
