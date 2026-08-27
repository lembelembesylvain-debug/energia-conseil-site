import { useMemo, useState } from "react";
import {
  BANDEAU_PROJECTION,
  DISCLAIMER_PROJECTION,
  LEGENDE_PROJECTION,
  MENTION_PDF_PROJECTION,
  PAIRES_PROJECTION,
  PHOTOS_SANS_PROJECTION,
  type PaireProjection,
  type StatutProjection,
  type VersionProjection,
} from "../data/projectionMaisonClyve";
import { DISCLAIMER, type AfterPhoto, type CategoriePhoto } from "../data/rapportCompletMaisonClyve";
import { generateProjectionClyvePdf } from "../lib/generateProjectionClyvePdf";

const STATUT_CLASS: Record<StatutProjection, string> = {
  "PHOTO AVANT CONFIRMÉE": "bg-emerald-100 text-emerald-900 border-emerald-300",
  "PROJECTION TECHNIQUE À VALIDER": "bg-amber-100 text-amber-950 border-amber-300",
  "PROJECTION WOW À VALIDER": "bg-orange-100 text-orange-950 border-orange-300",
  "VALIDÉE PAR HUMAIN": "bg-sky-200 text-sky-950 border-sky-400",
  "PHOTO APRÈS TRAVAUX RÉELLE À AJOUTER": "bg-slate-200 text-slate-800 border-slate-400",
  "PHOTO APRÈS TRAVAUX REÇUE": "bg-emerald-200 text-emerald-950 border-emerald-400",
};

function statutKey(paireId: string, versionId?: string) {
  return versionId ? `${paireId}:${versionId}` : paireId;
}

function Badge({ statut }: { statut: StatutProjection }) {
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUT_CLASS[statut]}`}>
      {statut}
    </span>
  );
}

function PhotoFrame({
  src,
  alt,
  label,
  badge,
  legend,
}: {
  src: string;
  alt: string;
  label: string;
  badge?: string;
  legend?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <p className="bg-slate-900 px-3 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-white">
        {label}
      </p>
      <img src={src} alt={alt} className="h-56 w-full object-cover sm:h-72 lg:h-80" />
      {badge ? (
        <p className="border-t border-amber-200 bg-amber-50 px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-amber-950">
          {badge}
        </p>
      ) : null}
      {legend ? (
        <figcaption className="px-3 py-2 text-center text-[11px] leading-snug text-slate-600">{legend}</figcaption>
      ) : null}
    </figure>
  );
}

function SliderCompare({ avantSrc, apresSrc }: { avantSrc: string; apresSrc: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative h-56 overflow-hidden rounded-xl border sm:h-72 lg:h-80">
      <img src={avantSrc} alt="Avant réel" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={apresSrc} alt="Projection illustrative" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }} />
      <p className="absolute left-2 top-2 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] font-semibold text-white">
        AVANT — PHOTO RÉELLE
      </p>
      <p className="absolute right-2 top-2 rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-slate-950">
        APRÈS — PROJECTION ILLUSTRATIVE
      </p>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(event) => setPos(Number(event.target.value))}
        className="absolute bottom-3 left-4 right-4"
        aria-label="Comparer avant et projection"
      />
    </div>
  );
}

function VersionCard({
  paire,
  version,
  statut,
  comparing,
  onCompare,
  onValidate,
  onDownload,
  pdfBusy,
}: {
  paire: PaireProjection;
  version: VersionProjection;
  statut: StatutProjection;
  comparing: boolean;
  onCompare: () => void;
  onValidate: () => void;
  onDownload: () => void;
  pdfBusy: boolean;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-2 sm:p-3">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="font-semibold">{version.titre}</h4>
        <Badge statut={statut} />
      </div>
      <p className="text-xs text-slate-600">{version.resume}</p>
      <PhotoFrame
        src={version.src}
        alt={`${version.titre} — ${paire.categorie}`}
        label="APRÈS — PROJECTION ILLUSTRATIVE"
        badge={BANDEAU_PROJECTION}
        legend={paire.legende ?? LEGENDE_PROJECTION}
      />
      {comparing ? <SliderCompare avantSrc={paire.photoAvantSrc} apresSrc={version.src} /> : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" onClick={onCompare}>
          {comparing ? "Fermer la comparaison" : "Comparer avant / après"}
        </button>
        <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={onDownload} disabled={pdfBusy}>
          Télécharger la comparaison
        </button>
        {statut !== "PHOTO APRÈS TRAVAUX REÇUE" && statut !== "VALIDÉE PAR HUMAIN" ? (
          <button type="button" className="rounded-lg border border-sky-700 px-3 py-2 text-sm text-sky-900" onClick={onValidate}>
            Valider cette projection
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function ProjectionAvantApresMaisonClyve({
  afterPhotos,
}: {
  afterPhotos: Partial<Record<CategoriePhoto, AfterPhoto>>;
}) {
  const [statuts, setStatuts] = useState<Record<string, StatutProjection>>(() =>
    Object.fromEntries(
      PAIRES_PROJECTION.flatMap((item) =>
        item.versions?.length
          ? item.versions.map((version) => [statutKey(item.id, version.id), version.statut] as const)
          : [[item.id, item.statutInitial] as const],
      ),
    ),
  );
  const [compareId, setCompareId] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [message, setMessage] = useState("");

  const paires = useMemo(() => PAIRES_PROJECTION, []);

  function statutEffectif(paire: PaireProjection, version?: VersionProjection): StatutProjection {
    const cat = paire.categoriePhotoApres as CategoriePhoto | undefined;
    if (cat && afterPhotos[cat]?.dataUrl) return "PHOTO APRÈS TRAVAUX REÇUE";
    const key = statutKey(paire.id, version?.id);
    return statuts[key] ?? version?.statut ?? paire.statutInitial;
  }

  async function download(paire?: PaireProjection, versionId?: string) {
    setPdfBusy(true);
    try {
      await generateProjectionClyvePdf({
        paires: paire ? [paire] : paires,
        statuts,
        afterPhotos,
        versionId,
      });
      setMessage("PDF de comparaison téléchargé.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Export PDF impossible.");
    } finally {
      setPdfBusy(false);
      window.setTimeout(() => setMessage(""), 3500);
    }
  }

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-amber-400 bg-amber-50 px-3 py-2 text-sm text-amber-950">
        {DISCLAIMER} {MENTION_PDF_PROJECTION}
      </p>
      <ul className="list-disc pl-5 text-sm text-slate-700">
        {DISCLAIMER_PROJECTION.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-900 px-3 py-2 text-sm"
          onClick={() => download()}
          disabled={pdfBusy}
        >
          {pdfBusy ? "Export…" : "Télécharger toutes les comparaisons"}
        </button>
        {message ? <span className="self-center text-xs text-emerald-800">{message}</span> : null}
      </div>

      <div>
        <h3 className="text-base font-semibold">Galerie des projections WOW</h3>
        <p className="mb-2 text-xs text-slate-500">Simulations uniquement — à valider. Pas des photos réelles.</p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {paires.map((paire) => {
            const wow = paire.versions.find((item) => item.id === "wow");
            return (
              <figure key={`gal-${paire.id}`} className="overflow-hidden rounded-lg border">
                <img src={wow?.src ?? paire.projectionSrc} alt={`WOW ${paire.categorie}`} className="h-24 w-full object-cover" />
                <figcaption className="px-2 py-1 text-[10px] text-slate-600">{paire.categorie}</figcaption>
              </figure>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 p-3 text-sm">
        <p className="font-semibold">Photos sans projection architecturale</p>
        <ul className="mt-1 list-disc pl-5 text-slate-700">
          {PHOTOS_SANS_PROJECTION.map((item) => (
            <li key={item.categorie}>
              <span className="font-medium">{item.categorie} — </span>
              {item.motif}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-6">
        {paires.map((paire) => {
          const photoReelleApres = paire.categoriePhotoApres
            ? afterPhotos[paire.categoriePhotoApres as CategoriePhoto]
            : undefined;
          const versions = paire.versions;

          return (
            <article key={paire.id} className="rounded-2xl border border-slate-200 p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">{paire.categorie}</h3>
                <Badge statut="PHOTO AVANT CONFIRMÉE" />
                {versions?.length ? (
                  versions.map((version) => (
                    <Badge key={version.id} statut={statutEffectif(paire, version)} />
                  ))
                ) : (
                  <Badge statut={statutEffectif(paire)} />
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Source avant : {paire.photoAvantNom} — confiance projection : {paire.confiance}
              </p>
              {paire.noteLimitation ? (
                <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-950">
                  {paire.noteLimitation}
                </p>
              ) : null}

              <div className="mt-3">
                <PhotoFrame
                  src={paire.photoAvantSrc}
                  alt={`Avant réel — ${paire.categorie}`}
                  label="AVANT — PHOTO RÉELLE"
                />
              </div>

              {photoReelleApres?.dataUrl ? (
                <div className="mt-3">
                  <PhotoFrame
                    src={photoReelleApres.dataUrl}
                    alt={`Après réel — ${paire.categorie}`}
                    label="APRÈS — PHOTO RÉELLE"
                  />
                </div>
              ) : null}

              {versions?.length ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {versions.map((version) => {
                    const key = statutKey(paire.id, version.id);
                    return (
                      <VersionCard
                        key={version.id}
                        paire={paire}
                        version={version}
                        statut={statutEffectif(paire, version)}
                        comparing={compareId === key}
                        onCompare={() => setCompareId(compareId === key ? null : key)}
                        onValidate={() =>
                          setStatuts((prev) => ({ ...prev, [key]: "VALIDÉE PAR HUMAIN" }))
                        }
                        onDownload={() => download(paire, version.id)}
                        pdfBusy={pdfBusy}
                      />
                    );
                  })}
                </div>
              ) : (
                <>
                  <div className="mt-3">
                    <PhotoFrame
                      src={paire.projectionSrc}
                      alt={`Projection illustrative — ${paire.categorie}`}
                      label="APRÈS — PROJECTION ILLUSTRATIVE"
                      badge={BANDEAU_PROJECTION}
                      legend={LEGENDE_PROJECTION}
                    />
                  </div>
                  {compareId === paire.id ? (
                    <div className="mt-3">
                      <SliderCompare avantSrc={paire.photoAvantSrc} apresSrc={paire.projectionSrc} />
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
                      onClick={() => setCompareId(compareId === paire.id ? null : paire.id)}
                    >
                      {compareId === paire.id ? "Fermer la comparaison" : "Comparer avant / après"}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-2 text-sm"
                      onClick={() => download(paire)}
                      disabled={pdfBusy}
                    >
                      Télécharger la comparaison
                    </button>
                    {statutEffectif(paire) !== "PHOTO APRÈS TRAVAUX REÇUE" &&
                    statutEffectif(paire) !== "VALIDÉE PAR HUMAIN" ? (
                      <button
                        type="button"
                        className="rounded-lg border border-sky-700 px-3 py-2 text-sm text-sky-900"
                        onClick={() =>
                          setStatuts((prev) => ({ ...prev, [paire.id]: "VALIDÉE PAR HUMAIN" }))
                        }
                      >
                        Valider cette projection
                      </button>
                    ) : null}
                  </div>
                </>
              )}

              {photoReelleApres?.dataUrl && versions?.length ? (
                <p className="mt-3 text-xs text-slate-500">
                  Photo après travaux réelle jointe : les deux projections restent affichées à titre de simulation, elles ne remplacent pas la photo réelle.
                </p>
              ) : null}

              <dl className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase text-slate-500">Travaux représentés</dt>
                  <dd>
                    <ul className="list-disc pl-5">
                      {paire.travauxRepresentes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">Source</dt>
                  <dd>{paire.source}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">Devis ou recommandation associée</dt>
                  <dd>{paire.devisOuReco}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">Éléments confirmés</dt>
                  <dd>
                    <ul className="list-disc pl-5">
                      {paire.elementsConfirmes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">Éléments estimatifs</dt>
                  <dd>
                    <ul className="list-disc pl-5">
                      {paire.elementsEstimatifs.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase text-slate-500">Non simulé</dt>
                  <dd>
                    <ul className="list-disc pl-5">
                      {paire.travauxNonSimules.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">Points à valider par le professionnel</dt>
                  <dd>
                    <ul className="list-disc pl-5">
                      {paire.pointsAValider.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-slate-500">Statut</dt>
                  <dd className="flex flex-wrap gap-1">
                    {versions?.length ? (
                      versions.map((version) => <Badge key={version.id} statut={statutEffectif(paire, version)} />)
                    ) : (
                      <Badge statut={statutEffectif(paire)} />
                    )}
                  </dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}
