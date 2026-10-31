import { useEffect, useState } from "react";

function SelecteurAvantApres({ mode, onChange, compact = false }) {
  const base = compact
    ? "rounded-lg px-2.5 py-1.5 text-[10px] font-semibold"
    : "min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold";
  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1 rounded-2xl border border-white/20 bg-slate-950/80 p-1.5 shadow-lg ${
        compact ? "" : "ring-1 ring-emerald-400/20"
      }`}
      role="group"
      aria-label="Comparateur Avant / Après"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-pressed={mode === "avant"}
        onClick={() => onChange("avant")}
        className={`${base} transition ${
          mode === "avant"
            ? "bg-sky-500 text-slate-950 shadow"
            : "text-slate-200 hover:bg-white/10"
        }`}
      >
        📸 Avant travaux
      </button>
      <button
        type="button"
        aria-pressed={mode === "apres"}
        onClick={() => onChange("apres")}
        className={`${base} transition ${
          mode === "apres"
            ? "bg-emerald-400 text-slate-950 shadow"
            : "text-slate-200 hover:bg-white/10"
        }`}
      >
        ✨ Projection 3D Après
      </button>
    </div>
  );
}

function srcAvecFallback(photo, modeApres) {
  if (!modeApres) return photo?.src;
  return photo?.srcApres || photo?.srcApresFallbacks?.[0] || photo?.src;
}

export default function VisionneusePhoto({
  photos,
  index,
  onIndex,
  onClose,
  modeInitial = "avant",
}) {
  const photo = photos?.[index];
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState(modeInitial === "apres" ? "apres" : "avant");
  const aProjection = Boolean(photo?.srcApres || photo?.srcApresFallbacks?.length);

  useEffect(() => {
    setZoom(1);
    setMode(modeInitial === "apres" && (photos?.[index]?.srcApres || photos?.[index]?.srcApresFallbacks?.length)
      ? "apres"
      : "avant");
  }, [index, photo?.src, photo?.srcApres, modeInitial, photos]);

  useEffect(() => {
    if (!photo) return undefined;
    const precedent = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndex(Math.min(photos.length - 1, index + 1));
      if (event.key === "ArrowLeft") onIndex(Math.max(0, index - 1));
      if (event.key === "+" || event.key === "=") setZoom((valeur) => Math.min(5, valeur + 0.35));
      if (event.key === "-") setZoom((valeur) => Math.max(1, valeur - 0.35));
      if (aProjection && (event.key === "a" || event.key === "A")) setMode("avant");
      if (aProjection && (event.key === "p" || event.key === "P")) setMode("apres");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = precedent;
      window.removeEventListener("keydown", onKey);
    };
  }, [photo, index, photos, onClose, onIndex, aProjection]);

  if (!photo) return null;

  const afficherApres = aProjection && mode === "apres";
  const srcAffiche = srcAvecFallback(photo, afficherApres);
  const labelAffiche = afficherApres
    ? photo.labelApres || photo.label || "Projection 3D"
    : photo.label || "Photo";

  const zoomer = (event) => {
    event.preventDefault();
    const sens = event.deltaY < 0 ? 0.28 : -0.28;
    setZoom((valeur) => Math.min(5, Math.max(1, Math.round((valeur + sens) * 100) / 100)));
  };

  const basculerMode = (suivant) => {
    setMode(suivant);
    setZoom(1);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-slate-950/95 text-white"
      role="dialog"
      aria-modal="true"
      aria-label={labelAffiche}
      data-testid="visionneuse-avant-apres"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="truncate text-sm font-semibold tracking-wide">{labelAffiche}</p>
          {aProjection ? (
            <SelecteurAvantApres mode={mode} onChange={basculerMode} />
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-xl border border-white/15 text-lg"
            onClick={() => setZoom((valeur) => Math.max(1, valeur - 0.35))}
            aria-label="Réduire"
          >
            −
          </button>
          <span className="w-14 text-center text-xs text-slate-300">{Math.round(zoom * 100)} %</span>
          <button
            type="button"
            className="min-h-11 min-w-11 rounded-xl border border-white/15 text-lg"
            onClick={() => setZoom((valeur) => Math.min(5, valeur + 0.35))}
            aria-label="Agrandir"
          >
            +
          </button>
          <button
            type="button"
            className="min-h-11 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto px-4"
        onWheel={zoomer}
        onDoubleClick={() => setZoom((valeur) => (valeur > 1 ? 1 : 2.5))}
      >
        {afficherApres ? (
          <span className="absolute left-6 top-2 z-10 rounded-xl border border-emerald-400/50 bg-emerald-500/25 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-50 backdrop-blur">
            PROJECTION 3D ACHEVÉE — NIVEAU 0 FINI
          </span>
        ) : null}
        <img
          key={`${index}-${mode}-${srcAffiche}`}
          src={srcAffiche}
          alt={labelAffiche}
          className="max-h-[78vh] max-w-full origin-center object-contain transition-opacity duration-300 ease-out"
          style={{ transform: `scale(${zoom})` }}
          onError={(event) => {
            if (!afficherApres) return;
            const tries = Number(event.currentTarget.dataset.fb || "0");
            const fallbacks = photo.srcApresFallbacks || [];
            if (tries < fallbacks.length) {
              event.currentTarget.dataset.fb = String(tries + 1);
              event.currentTarget.src = fallbacks[tries];
            }
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <button
          type="button"
          className="min-h-11 rounded-xl border border-white/15 px-4 text-sm disabled:opacity-40"
          disabled={index <= 0}
          onClick={() => onIndex(index - 1)}
        >
          Précédente
        </button>
        <p className="text-center text-xs text-slate-400">
          {index + 1} / {photos.length}
          {aProjection ? " · interrupteur Avant / Projection 3D ci-dessus" : " · molette pour zoomer"}
        </p>
        <button
          type="button"
          className="min-h-11 rounded-xl border border-white/15 px-4 text-sm disabled:opacity-40"
          disabled={index >= photos.length - 1}
          onClick={() => onIndex(index + 1)}
        >
          Suivante
        </button>
      </div>
    </div>
  );
}

export { SelecteurAvantApres };
