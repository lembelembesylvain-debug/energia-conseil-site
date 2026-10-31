import { useMemo } from "react";
import {
  PAIRES_PHOTOS_CONTRAT_PEREIRA,
  PEREIRA_NERVIEUX_DOSSIER_ID,
  pairesPhotosPereiraPourEdition,
} from "../../lib/crm/pereiraNervieuxOfficiel";

function lireFichierImage(fichier) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Lecture image impossible"));
    reader.readAsDataURL(fichier);
  });
}

export default function OngletPhotosChantierPereira({
  dossierId,
  edition,
  editable = false,
  onPhotosChange,
}) {
  const paires = useMemo(() => pairesPhotosPereiraPourEdition(edition), [edition]);
  const ajouts = edition?.photos?.ajouts && typeof edition.photos.ajouts === "object" ? edition.photos.ajouts : {};

  if (dossierId !== PEREIRA_NERVIEUX_DOSSIER_ID) return null;

  const importer = async (paireId, cote, fichier) => {
    if (!fichier || !onPhotosChange) return;
    const dataUrl = await lireFichierImage(fichier);
    onPhotosChange({
      ...edition?.photos,
      ajouts: {
        ...ajouts,
        [paireId]: { ...(ajouts[paireId] || {}), [cote]: dataUrl },
      },
    });
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <h2 className="text-xl font-semibold text-white">Chantier / Photos — Avant / Après</h2>
      <p className="mt-2 text-sm text-slate-400">
        Photos officielles du dossier Pereira (visite AUDIT-PEREIRA-2026-001), stockées dans{" "}
        <code className="text-emerald-200">public/images/pereira/</code>. Les visuels « après » sont des
        projections indicatives, jamais des photos réelles après travaux.
      </p>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {paires.map((paire) => (
          <article key={paire.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="text-sm font-semibold text-emerald-200">{paire.titre}</h3>
            <p className="mt-1 text-xs text-slate-400">{paire.cote}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <figure>
                {paire.avantSrc ? (
                  <img src={paire.avantSrc} alt={paire.legendAvant} className="h-36 w-full rounded-lg object-cover" />
                ) : (
                  <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-slate-700 text-xs text-slate-500">
                    Photo avant manquante
                  </div>
                )}
                <figcaption className="mt-1 text-[11px] text-slate-400">{paire.legendAvant}</figcaption>
                {editable ? (
                  <label className="mt-2 block text-[11px] text-emerald-300">
                    Remplacer l’avant
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-1 block w-full text-[11px] text-slate-400"
                      onChange={(event) => importer(paire.id, "avantSrc", event.target.files?.[0])}
                    />
                  </label>
                ) : null}
              </figure>
              <figure>
                {paire.apresSrc ? (
                  <img src={paire.apresSrc} alt={paire.legendApres} className="h-36 w-full rounded-lg object-cover" />
                ) : (
                  <div className="flex h-36 flex-col justify-center rounded-lg border border-dashed border-amber-500/40 bg-amber-500/10 px-3 text-[11px] text-amber-100">
                    <strong>Préconisation RGE</strong>
                    <span className="mt-1 text-amber-50/80">{paire.preconisationRge}</span>
                  </div>
                )}
                <figcaption className="mt-1 text-[11px] text-slate-400">{paire.legendApres}</figcaption>
                {editable ? (
                  <label className="mt-2 block text-[11px] text-emerald-300">
                    {paire.apresSrc ? "Remplacer l’après" : "Importer la photo après-pose"}
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-1 block w-full text-[11px] text-slate-400"
                      onChange={(event) => importer(paire.id, "apresSrc", event.target.files?.[0])}
                    />
                  </label>
                ) : null}
              </figure>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              <strong>Usure :</strong> {paire.etatUsure}
            </p>
          </article>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-slate-500">
        {PAIRES_PHOTOS_CONTRAT_PEREIRA.length} paires verrouillées. Un import local sert d’aperçu CRM ; le
        devis HTML officiel conserve les fichiers de <code>public/images/pereira/</code>.
      </p>
    </section>
  );
}
