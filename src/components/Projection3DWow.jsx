import { useMemo, useState } from "react";
import {
  LABEL_APRES_WOW,
  LABEL_AVANT_WOW,
  MENTION_PROJECTION_WOW,
  projectionWowPourDossier,
} from "../lib/crm/projectionsWow";

function PlaceholderWow({ titre }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 px-6 text-center">
      <p className="text-sm font-semibold text-amber-200">{titre}</p>
      <p className="mt-2 max-w-sm text-[11px] leading-relaxed text-slate-300">
        Déposez la photo de façade dans le dossier de travail. La projection WOW (ITE, toiture neuve, solaire
        intégré) sera générée après validation technique.
      </p>
    </div>
  );
}

function CadrePhoto({ src, alt, portrait, placeholderTitre }) {
  const fit = portrait ? "object-contain" : "object-cover";
  if (!src) return <PlaceholderWow titre={placeholderTitre} />;
  return <img src={src} alt={alt} className={`h-full w-full ${fit}`} />;
}

function SliderWow({ avantSrc, apresSrc, portrait, labelAvant, labelApres }) {
  const [pos, setPos] = useState(52);
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
      <div className={portrait ? "relative h-[26rem] md:h-[34rem]" : "relative h-72 md:h-[26rem]"}>
        <div className="absolute inset-0">
          <CadrePhoto src={avantSrc} alt={labelAvant} portrait={portrait} placeholderTitre={labelAvant} />
        </div>
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <div className="h-full w-full [transform:perspective(1200px)_rotateY(-4deg)]">
            <CadrePhoto src={apresSrc} alt={labelApres} portrait={portrait} placeholderTitre={labelApres} />
          </div>
        </div>
        <div className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_12px_rgba(251,191,36,0.8)]" style={{ left: `${pos}%` }} />
        <p className="absolute left-2 top-2 z-20 max-w-[46%] rounded bg-slate-950/85 px-2 py-1 text-[11px] font-semibold leading-snug text-white">
          {labelAvant}
        </p>
        <p className="absolute right-2 top-2 z-20 max-w-[50%] rounded bg-amber-400 px-2 py-1 text-right text-[11px] font-semibold leading-snug text-slate-950">
          {labelApres}
        </p>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(event) => setPos(Number(event.target.value))}
        className="absolute bottom-12 left-4 right-4 z-20"
        aria-label="Comparer la photo réelle et la projection WOW IA"
      />
    </div>
  );
}

function CoteACoteWow({ avantSrc, apresSrc, portrait, labelAvant, labelApres }) {
  const hauteur = portrait ? "h-[22rem] md:h-[28rem]" : "h-64 md:h-80";
  return (
    <div className="grid gap-3 md:grid-cols-2 print:grid-cols-2">
      <figure className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
        <div className={`relative ${hauteur}`}>
          <CadrePhoto src={avantSrc} alt={labelAvant} portrait={portrait} placeholderTitre={labelAvant} />
        </div>
        <figcaption className="border-t border-slate-800 bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white">
          {labelAvant}
        </figcaption>
      </figure>
      <figure className="overflow-hidden rounded-xl border border-amber-400/40 bg-slate-950">
        <div className={`relative ${hauteur}`}>
          <CadrePhoto src={apresSrc} alt={labelApres} portrait={portrait} placeholderTitre={labelApres} />
        </div>
        <figcaption className="border-t border-amber-400/30 bg-amber-400 px-3 py-2 text-[11px] font-semibold text-slate-950">
          {labelApres}
        </figcaption>
      </figure>
    </div>
  );
}

/**
 * Projection visuelle avant / après réutilisable (CRM, rapport, PDF).
 * `disposition="slider"` pour le web client ; `"cote-a-cote"` pour l’export PDF / print.
 */
export default function Projection3DWow({
  dossierId,
  dossier,
  vues: vuesProp,
  disposition = "slider",
  titre,
}) {
  const pack = useMemo(() => {
    if (Array.isArray(vuesProp) && vuesProp.length) {
      return { nom: titre || dossier?.nom || "Projection WOW", vues: vuesProp };
    }
    return projectionWowPourDossier(dossierId, dossier);
  }, [vuesProp, dossierId, dossier, titre]);

  const [vueId, setVueId] = useState(pack.vues[0]?.id);
  const vue = pack.vues.find((item) => item.id === vueId) || pack.vues[0];
  const labelAvant = LABEL_AVANT_WOW;
  const labelApres = LABEL_APRES_WOW;

  if (!vue) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 print:border-slate-300 print:bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 px-4 py-3 sm:px-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">Projection 3D WOW</p>
          <h2 className="mt-1 text-lg font-semibold text-white print:text-slate-900">{titre || pack.nom}</h2>
          <p className="mt-1 text-sm text-slate-300 print:text-slate-600">{vue.titre}</p>
        </div>
        {pack.vues.length > 1 ? (
          <div className="flex flex-wrap gap-1.5 print:hidden">
            {pack.vues.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setVueId(item.id)}
                className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                  item.id === vue.id
                    ? "border-amber-400/70 bg-amber-400/20 text-amber-100"
                    : "border-slate-700 bg-slate-950 text-slate-300 hover:border-amber-400/40"
                }`}
              >
                {item.titre.split("—")[0].trim()}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="p-4 sm:p-5">
        <div className="print:hidden">
          {disposition === "slider" ? (
            <SliderWow
              avantSrc={vue.avantSrc}
              apresSrc={vue.apresSrc}
              portrait={vue.portrait}
              labelAvant={labelAvant}
              labelApres={labelApres}
            />
          ) : (
            <CoteACoteWow
              avantSrc={vue.avantSrc}
              apresSrc={vue.apresSrc}
              portrait={vue.portrait}
              labelAvant={labelAvant}
              labelApres={labelApres}
            />
          )}
        </div>
        <div className="hidden print:block">
          <CoteACoteWow
            avantSrc={vue.avantSrc}
            apresSrc={vue.apresSrc}
            portrait={vue.portrait}
            labelAvant={labelAvant}
            labelApres={labelApres}
          />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-400 print:text-slate-600">{MENTION_PROJECTION_WOW}</p>
      </div>
    </section>
  );
}
