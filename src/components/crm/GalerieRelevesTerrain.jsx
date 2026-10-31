import { useCallback, useEffect, useState } from "react";
import {
  CLE_PING_RELEVES,
  EVENEMENT_RELEVES,
  chargerRelevesTransmis,
  telechargerZipPhotos,
} from "../../lib/crm/photosReleveTerrain.js";
import {
  formaterMesure,
  titreFicheReleve,
} from "../../lib/crm/releveTerrainCatarina.js";
import VisionneusePhoto from "./VisionneusePhoto.jsx";

function ligneMesures(releve) {
  const morceaux = [];
  if (releve.hauteurSousPlafond != null) morceaux.push(`Hauteur ${formaterMesure(releve.hauteurSousPlafond)} m`);
  if (releve.surfaceCombles != null) morceaux.push(`Combles ${formaterMesure(releve.surfaceCombles)} m²`);
  return morceaux.join(" · ");
}

export default function GalerieRelevesTerrain({ variante = "crm" }) {
  const [releves, setReleves] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [visionneuse, setVisionneuse] = useState(null);
  const [zipEnCours, setZipEnCours] = useState("");

  const rafraichir = useCallback(async () => {
    try {
      const liste = await chargerRelevesTransmis();
      setReleves(liste);
    } catch {
      setReleves([]);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    rafraichir();
    const timer = window.setInterval(rafraichir, 5000);
    const surEvenement = () => rafraichir();
    const surStockage = (event) => {
      if (event.key === CLE_PING_RELEVES) rafraichir();
    };
    window.addEventListener(EVENEMENT_RELEVES, surEvenement);
    window.addEventListener("storage", surStockage);
    window.addEventListener("focus", surEvenement);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(EVENEMENT_RELEVES, surEvenement);
      window.removeEventListener("storage", surStockage);
      window.removeEventListener("focus", surEvenement);
    };
  }, [rafraichir]);

  const telecharger = async (releve) => {
    if (!releve.galerie?.length) return;
    setZipEnCours(releve.id);
    try {
      const nom = `releve-${String(releve.nom || "terrain")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}.zip`;
      await telechargerZipPhotos(nom, releve.galerie);
    } finally {
      setZipEnCours("");
    }
  };

  const sombre = variante === "terrain";
  const photosOuvertes = visionneuse ? releves.find((item) => item.id === visionneuse.id)?.galerie || [] : [];

  return (
    <section
      className={
        sombre
          ? "rounded-3xl border border-amber-300/30 bg-slate-900/90 p-4 sm:p-5"
          : "mb-6 overflow-hidden rounded-2xl border border-amber-400/30 bg-slate-900/70"
      }
    >
      <div className={sombre ? "" : "border-b border-amber-400/20 px-5 py-4"}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={`font-semibold uppercase tracking-wide text-amber-100 ${sombre ? "text-base" : "text-sm"}`}>
              Derniers Relevés Terrain Transmis
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Photos haute résolution prises par Catarina, consultables ici dès la transmission.
            </p>
          </div>
          <button
            type="button"
            onClick={rafraichir}
            className="rounded-xl border border-amber-300/40 px-3 py-2 text-xs font-semibold text-amber-100"
          >
            Actualiser
          </button>
        </div>
      </div>

      <div className={sombre ? "mt-4 space-y-4" : "space-y-4 px-5 py-4"}>
        {chargement ? <p className="text-sm text-slate-400">Chargement des relevés…</p> : null}
        {!chargement && releves.length === 0 ? (
          <p className="text-sm text-slate-400">
            Aucun relevé terrain transmis pour le moment. Les photos prises sur le smartphone apparaîtront dans cette galerie.
          </p>
        ) : null}
        {releves.map((releve) => {
          const mesures = ligneMesures(releve);
          return (
            <article key={releve.id} className="rounded-2xl border border-slate-700/80 bg-slate-950/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/90">
                {releve.nom || "Client"}
              </p>
              <h3 className="mt-1 text-base font-semibold text-white">{titreFicheReleve(releve)}</h3>
              {mesures ? <p className="mt-1 text-sm text-slate-300">{mesures}</p> : null}
              <p className="mt-1 text-xs text-slate-500">
                {releve.galerie?.length || 0} photo{(releve.galerie?.length || 0) > 1 ? "s" : ""}
              </p>

              {releve.galerie?.length ? (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {releve.galerie.map((photo, index) => (
                      <figure key={`${releve.id}-${photo.id}`} className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
                        <button
                          type="button"
                          className="block w-full text-left"
                          onClick={() => setVisionneuse({ id: releve.id, index })}
                        >
                          <img
                            src={photo.src}
                            alt={photo.label}
                            className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </button>
                        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent px-3 pb-2 pt-8 text-xs font-semibold text-white">
                          {photo.label}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => telecharger(releve)}
                    disabled={zipEnCours === releve.id}
                    className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-amber-300 px-4 text-sm font-bold text-slate-950 disabled:opacity-60"
                  >
                    {zipEnCours === releve.id ? "Préparation du ZIP…" : "Télécharger toutes les photos (ZIP / Tout enregistrer)"}
                  </button>
                </>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  Dossier transmis. Les fichiers photo sont en cours de synchronisation.
                </p>
              )}
            </article>
          );
        })}
      </div>

      {visionneuse ? (
        <VisionneusePhoto
          photos={photosOuvertes}
          index={visionneuse.index}
          onIndex={(index) => setVisionneuse({ id: visionneuse.id, index })}
          onClose={() => setVisionneuse(null)}
        />
      ) : null}
    </section>
  );
}
