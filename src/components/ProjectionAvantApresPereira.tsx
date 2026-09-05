import { useState } from "react";
import {
  PEREIRA_LABEL_APRES,
  PEREIRA_LABEL_AVANT,
  PEREIRA_LIMITE_ITI,
  PEREIRA_MENTION_SIMULATION,
  PEREIRA_PAIRES_ITI,
  PEREIRA_PHOTOS_AVANT,
  PEREIRA_PLACEHOLDER_APRES,
  PEREIRA_RESUME_ITI,
} from "../data/pereiraProjection";

const TOTAL_VUES = PEREIRA_PAIRES_ITI.length;

function SliderAvantProjection({
  avantSrc,
  apresSrc,
  portrait,
}: {
  avantSrc: string;
  apresSrc: string | null;
  portrait?: boolean;
}) {
  const [pos, setPos] = useState(50);
  const fit = portrait ? "object-contain" : "object-cover";
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
      <div className={portrait ? "relative h-[28rem] md:h-[36rem]" : "relative h-72 md:h-96"}>
        <img src={avantSrc} alt={PEREIRA_LABEL_AVANT} className={`absolute inset-0 h-full w-full ${fit}`} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          {apresSrc ? (
            <img src={apresSrc} alt={PEREIRA_LABEL_APRES} className={`h-full w-full ${fit}`} />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 px-6 text-center">
              <p className="text-sm font-semibold text-amber-200">{PEREIRA_PLACEHOLDER_APRES}</p>
              <p className="mt-2 text-[11px] leading-snug text-slate-300">{PEREIRA_MENTION_SIMULATION}</p>
            </div>
          )}
        </div>
        <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }} />
        <p className="absolute left-2 top-2 z-10 rounded bg-slate-950/85 px-2 py-1 text-[11px] font-semibold text-white">
          {PEREIRA_LABEL_AVANT}
        </p>
        <p className="absolute right-2 top-2 z-10 max-w-[58%] rounded bg-amber-400 px-2 py-1 text-right text-[11px] font-semibold leading-snug text-slate-950">
          {PEREIRA_LABEL_APRES}
        </p>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(event) => setPos(Number(event.target.value))}
        className="absolute bottom-10 left-4 right-4 z-10"
        aria-label="Comparer la photo réelle et la projection visuelle indicative ITI 12 cm"
      />
      <div className="space-y-1 border-t border-slate-800 bg-slate-900 px-3 py-2">
        <p className="text-[11px] leading-snug text-slate-200">{PEREIRA_MENTION_SIMULATION}</p>
      </div>
    </div>
  );
}

function MiniaturesRangee({
  paireId,
  onSelect,
  cote,
}: {
  paireId: string;
  onSelect: (id: string) => void;
  cote: "avant" | "apres";
}) {
  return (
    <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
      {PEREIRA_PAIRES_ITI.map((item) => {
        const src = cote === "avant" ? item.avantSrc : item.projectionSrc;
        const selected = item.id === paireId;
        return (
          <button
            key={`${cote}-${item.id}`}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`overflow-hidden rounded-lg border ${
              selected ? "border-amber-400 ring-2 ring-amber-400/40" : "border-slate-700"
            }`}
            aria-pressed={selected}
            aria-label={`${cote === "avant" ? PEREIRA_LABEL_AVANT : PEREIRA_LABEL_APRES} — vue ${item.index}/${TOTAL_VUES}`}
          >
            {src ? (
              <img src={src} alt="" className="h-16 w-full object-cover md:h-20" />
            ) : (
              <span className="flex h-16 items-center justify-center bg-slate-900 px-1 text-center text-[9px] leading-tight text-amber-200 md:h-20">
                {PEREIRA_PLACEHOLDER_APRES}
              </span>
            )}
            <span className="block bg-slate-900 px-1 py-0.5 text-center text-[10px] text-slate-200">
              {item.index}/{TOTAL_VUES}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function ProjectionAvantApresPereira() {
  const [index, setIndex] = useState(0);
  const paire = PEREIRA_PAIRES_ITI[index] ?? PEREIRA_PAIRES_ITI[0];

  function aller(id: string) {
    const next = PEREIRA_PAIRES_ITI.findIndex((item) => item.id === id);
    if (next >= 0) setIndex(next);
  }

  return (
    <section className="space-y-4 overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900/80 p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200">
          Comparaison visuelle — Avant / Après
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{PEREIRA_RESUME_ITI}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PEREIRA_PHOTOS_AVANT.map((photo) => (
          <figure key={photo.id} className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
            <p className="bg-slate-800 px-3 py-1.5 text-center text-[11px] font-semibold text-white">
              {PEREIRA_LABEL_AVANT}
            </p>
            <img src={photo.src} alt={photo.titre} className="h-36 w-full object-cover md:h-40" />
            <figcaption className="space-y-1 px-3 py-2 text-[11px] leading-snug text-slate-400">
              <span className="block font-medium text-slate-200">{photo.titre}</span>
              {photo.source}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-white">
            Vue {paire.index}/{TOTAL_VUES} — {paire.titre}
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIndex((value) => (value - 1 + TOTAL_VUES) % TOTAL_VUES)}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-100"
            >
              Vue précédente
            </button>
            <button
              type="button"
              onClick={() => setIndex((value) => (value + 1) % TOTAL_VUES)}
              className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950"
            >
              Vue suivante
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{PEREIRA_LABEL_AVANT}</p>
          <MiniaturesRangee paireId={paire.id} onSelect={aller} cote="avant" />
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{PEREIRA_LABEL_APRES}</p>
          <MiniaturesRangee paireId={paire.id} onSelect={aller} cote="apres" />
        </div>

        <SliderAvantProjection
          key={paire.id}
          avantSrc={paire.avantSrc}
          apresSrc={paire.projectionSrc}
          portrait={paire.portrait}
        />
      </div>
      <p className="text-xs leading-relaxed text-slate-400">{PEREIRA_LIMITE_ITI}</p>
    </section>
  );
}
