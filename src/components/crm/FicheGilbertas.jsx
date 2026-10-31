import { useState } from "react";
import { euro } from "../../lib/crm/mockData";
import {
  CLAUSES_PLANNING_GILBERTAS,
  CLIENT_GILBERTAS,
  ELECTROMENAGER_GILBERTAS,
  EQUIPE_GILBERTAS,
  FACTURE_ACOMPTE_GILBERTAS,
  FINANCEMENT_GILBERTAS,
  GILBERTAS_REFERENCE,
  INTITULE_MARCHE_GILBERTAS,
  LIEU_EXECUTION_GILBERTAS,
  LOTS_GILBERTAS,
  PHASE_GILBERTAS,
  PHOTOS_TERRAIN_GILBERTAS,
  RENDUS_3D_GILBERTAS,
  RIB_REGLEMENT_GILBERTAS,
  STATUT_GILBERTAS,
  TOTAUX_GILBERTAS,
} from "../../lib/crm/gilbertasClermontOfficiel.js";
import VisionneusePhoto from "./VisionneusePhoto.jsx";

function BadgeEquipe({ label, detail, tone = "emerald" }) {
  const tones = {
    emerald: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
    sky: "border-sky-400/40 bg-sky-500/15 text-sky-100",
    amber: "border-amber-400/40 bg-amber-500/15 text-amber-100",
  };
  return (
    <span className={`inline-flex flex-col rounded-xl border px-3 py-2 text-left ${tones[tone] || tones.emerald}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{label}</span>
      <span className="text-xs font-semibold">{detail}</span>
    </span>
  );
}

function GaleriePhotosTerrainGilbertas() {
  const [indexOuvert, setIndexOuvert] = useState(null);
  const photosVisionneuse = PHOTOS_TERRAIN_GILBERTAS.map((photo) => ({
    src: photo.src,
    label: photo.label,
  }));

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4" data-testid="galerie-photos-gilbertas">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            📸 Galerie Photos Avant Travaux (Diagnostic Terrain)
          </p>
          <p className="mt-1 text-sm text-white">Relevé chantier Clermont-Ferrand — 04/10/2026</p>
        </div>
        <span className="rounded-full border border-sky-400/40 bg-sky-500/15 px-3 py-1 text-[11px] font-semibold text-sky-100">
          4 photos terrain enregistrées
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PHOTOS_TERRAIN_GILBERTAS.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setIndexOuvert(index)}
            className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 text-left transition hover:border-emerald-500/50 hover:shadow-[0_0_24px_rgba(16,185,129,0.12)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
              <img
                src={photo.src}
                alt={photo.titre}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(event) => {
                  if (photo.fallbackSrc && event.currentTarget.src !== photo.fallbackSrc) {
                    event.currentTarget.src = photo.fallbackSrc;
                  }
                }}
              />
              <span className="absolute left-2 top-2 rounded-lg border border-white/15 bg-slate-950/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                Photo {index + 1}
              </span>
            </div>
            <div className="space-y-2 p-3">
              <p className="text-sm font-semibold text-white">{photo.titre}</p>
              <p className="inline-flex rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[11px] leading-snug text-emerald-100">
                {photo.badge}
              </p>
            </div>
          </button>
        ))}
      </div>

      {indexOuvert != null ? (
        <VisionneusePhoto
          photos={photosVisionneuse}
          index={indexOuvert}
          onIndex={setIndexOuvert}
          onClose={() => setIndexOuvert(null)}
        />
      ) : null}
    </section>
  );
}

export default function FicheGilbertas({ afficherMargeCg = true }) {
  return (
    <div className="mt-4 space-y-4" data-testid="fiche-gilbertas">
      <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Référence dossier</p>
        <p className="mt-1 font-mono text-sky-200">{GILBERTAS_REFERENCE}</p>
        <p className="mt-2 text-sm text-white">
          {CLIENT_GILBERTAS.civilite} {CLIENT_GILBERTAS.nom}
        </p>
        <p className="mt-1 text-sm text-slate-200">Téléphone : {CLIENT_GILBERTAS.telephoneAffiche}</p>
        <p className="mt-1 text-sm text-white">Lieu d&apos;exécution : {LIEU_EXECUTION_GILBERTAS}</p>
        <p className="mt-1 text-sm text-slate-200">{INTITULE_MARCHE_GILBERTAS}</p>
        <p className="mt-2 text-sm text-emerald-100">
          {STATUT_GILBERTAS} — {PHASE_GILBERTAS}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="badges-equipe-gilbertas">
        <BadgeEquipe label="Direction CG" detail="Sylvain LEMBELEMBE" tone="emerald" />
        <BadgeEquipe label="Direction artistique" detail="Catarina MARTINS" tone="amber" />
      </div>
      <p className="text-xs text-slate-400">
        {EQUIPE_GILBERTAS.directionContractantGeneral} · {EQUIPE_GILBERTAS.designAgencement}
      </p>

      <GaleriePhotosTerrainGilbertas />

      <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4" data-testid="rendus-3d-gilbertas">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rendus 3D cuisine</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {RENDUS_3D_GILBERTAS.map((rendu) => (
            <figure key={rendu.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
              <img src={rendu.src} alt={rendu.titre} className="aspect-[4/3] w-full object-cover" />
              <figcaption className="space-y-1 p-3">
                <p className="text-sm font-semibold text-white">{rendu.titre}</p>
                <p className="text-[11px] text-emerald-100">{rendu.badge}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm" data-testid="electromenager-gilbertas">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Pack électroménager — 7 fiches techniques
        </p>
        <ul className="mt-3 space-y-2">
          {ELECTROMENAGER_GILBERTAS.map((item) => (
            <li key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <p className="font-semibold text-white">
                {item.marque} — {item.poste}
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Réf. {item.reference} · Classe {item.classe}
              </p>
              <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Lots de travaux</p>
        <ul className="mt-3 space-y-4">
          {LOTS_GILBERTAS.map((lot) => (
            <li key={lot.id} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    Lot {lot.ordre} — {lot.nom}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-300">
                    {lot.postes.map((poste) => (
                      <li key={poste}>{poste}</li>
                    ))}
                  </ul>
                </div>
                <div className="shrink-0 text-right tabular-nums">
                  <p className="font-semibold text-emerald-200">{euro(lot.totalTtc)} TTC</p>
                  <p className="text-xs text-slate-400">{euro(lot.totalHt)} HT</p>
                  {afficherMargeCg && lot.coutAchatHt != null ? (
                    <p className="mt-1 text-[11px] text-amber-100">
                      Achat {euro(lot.coutAchatHt)} · Marge {euro(lot.margeBruteHt)}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-50">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Synthèse financière</p>
        <div className="mt-3 space-y-1">
          <p className="flex justify-between gap-3">
            <span>Total HT</span>
            <span className="tabular-nums">{euro(TOTAUX_GILBERTAS.totalHt)}</span>
          </p>
          <p className="flex justify-between gap-3">
            <span>TVA rénovation 10 %</span>
            <span className="tabular-nums">{euro(TOTAUX_GILBERTAS.totalTva)}</span>
          </p>
          <p className="flex justify-between gap-3 font-semibold text-white">
            <span>Total TTC</span>
            <span className="tabular-nums">{euro(TOTAUX_GILBERTAS.totalTtc)}</span>
          </p>
          <p className="mt-2 flex justify-between gap-3 border-t border-emerald-500/20 pt-2">
            <span>Acompte 30 % — {FACTURE_ACOMPTE_GILBERTAS.numero}</span>
            <span className="tabular-nums text-right">
              {euro(FACTURE_ACOMPTE_GILBERTAS.ht)} HT
              <br />
              TVA {euro(FACTURE_ACOMPTE_GILBERTAS.tva)}
              <br />
              {euro(FACTURE_ACOMPTE_GILBERTAS.ttc)} TTC
            </span>
          </p>
          <p className="flex justify-between gap-3">
            <span>40 % démarrage des travaux</span>
            <span className="tabular-nums">{euro(FINANCEMENT_GILBERTAS.intermediaire)} TTC</span>
          </p>
          <p className="flex justify-between gap-3">
            <span>Solde 30 % réception sans réserve</span>
            <span className="tabular-nums">{euro(FINANCEMENT_GILBERTAS.solde)} TTC</span>
          </p>
          <p className="mt-2 text-xs text-emerald-100/90">
            RIB Qonto — {RIB_REGLEMENT_GILBERTAS.titulaire} — {RIB_REGLEMENT_GILBERTAS.iban} — {RIB_REGLEMENT_GILBERTAS.bic}.
            Libellé : « {RIB_REGLEMENT_GILBERTAS.libelle} ».
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm" data-testid="planning-gilbertas">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Planning, visite technique et conditions particulières
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-200">
          {CLAUSES_PLANNING_GILBERTAS.map((clause) => (
            <li key={clause}>{clause}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
