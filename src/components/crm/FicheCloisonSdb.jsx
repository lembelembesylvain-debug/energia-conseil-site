import { useState } from "react";
import { euro } from "../../lib/crm/mockData";
import {
  CLIENT_CLOISON_SDB,
  CLOISON_SDB_REFERENCE,
  EQUIPE_CLOISON_SDB,
  LOTS_CLOISON_SDB,
  PHASE_CLOISON_SDB,
  PHOTOS_TERRAIN_CLOISON_SDB,
  STATUT_CLOISON_SDB,
  TOTAUX_CLOISON_SDB,
} from "../../lib/crm/cloisonSdbOfficiel.js";
import { COORDINATION_NATIONALE } from "../../lib/crm/catalogue/coordinationNationale.ts";
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

function GaleriePhotosTerrainCloisonSdb() {
  const [indexOuvert, setIndexOuvert] = useState(null);
  const photosVisionneuse = PHOTOS_TERRAIN_CLOISON_SDB.map((photo) => ({
    src: photo.src,
    label: photo.label,
  }));

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4" data-testid="galerie-photos-cloison-sdb">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Galerie Photos Chantier — Repérage technique
          </p>
          <p className="mt-1 text-sm text-white">
            Chambre · SDB vue haute · Porte / split clim · Vasque & cloison
          </p>
        </div>
        <span className="rounded-full border border-sky-400/40 bg-sky-500/15 px-3 py-1 text-[11px] font-semibold text-sky-100">
          4 photos de repérage
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {PHOTOS_TERRAIN_CLOISON_SDB.map((photo, index) => (
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

export default function FicheCloisonSdb({ afficherMargeCg = true }) {
  return (
    <div className="mt-4 space-y-4" data-testid="fiche-cloison-sdb">
      <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Référence dossier</p>
        <p className="mt-1 font-mono text-sky-200">{CLOISON_SDB_REFERENCE}</p>
        <p className="mt-2 text-sm text-white">{CLIENT_CLOISON_SDB.intitule}</p>
        <p className="mt-1 text-sm text-slate-300">{CLIENT_CLOISON_SDB.typeBien}</p>
        <p className="mt-2 text-sm text-emerald-100">
          {STATUT_CLOISON_SDB} — {PHASE_CLOISON_SDB}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="badges-equipe-cloison-sdb">
        <BadgeEquipe label="Direction CG" detail="Sylvain LEMBELEMBE" tone="emerald" />
        <BadgeEquipe label="Apporteur" detail="Damien RICHARD 10 %" tone="sky" />
        <BadgeEquipe label="Coordination" detail="Mohamed BENAOUDA" tone="amber" />
      </div>
      <p className="text-xs text-slate-400">
        {EQUIPE_CLOISON_SDB.directionContractantGeneral} · {EQUIPE_CLOISON_SDB.commercialApporteur} ·{" "}
        {EQUIPE_CLOISON_SDB.coordination}
      </p>
      <p className="text-[11px] text-slate-500">
        {EQUIPE_CLOISON_SDB.marqueInpi} — {EQUIPE_CLOISON_SDB.assuranceDecennale}
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={`tel:${COORDINATION_NATIONALE.telephoneTel}`}
          className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100"
        >
          Appeler Mohamed
        </a>
        <a
          href={COORDINATION_NATIONALE.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-sky-400/40 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-100"
        >
          WhatsApp Mohamed
        </a>
      </div>

      <GaleriePhotosTerrainCloisonSdb />

      <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Lots de travaux</p>
        <ul className="mt-3 space-y-4">
          {LOTS_CLOISON_SDB.map((lot) => (
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
                  <p className="mt-2 text-[11px] text-emerald-200/90">
                    Coordinateur France : Mohamed BENAOUDA ({COORDINATION_NATIONALE.telephoneAffiche})
                  </p>
                </div>
                <div className="shrink-0 text-right tabular-nums">
                  <p className="font-semibold text-emerald-200">{euro(lot.totalTtc)} TTC</p>
                  <p className="text-xs text-slate-400">{euro(lot.totalHt)} HT</p>
                  {afficherMargeCg ? (
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
            <span className="tabular-nums">{euro(TOTAUX_CLOISON_SDB.totalHt)}</span>
          </p>
          <p className="flex justify-between gap-3">
            <span>TVA rénovation 10 %</span>
            <span className="tabular-nums">{euro(TOTAUX_CLOISON_SDB.totalTva)}</span>
          </p>
          <p className="flex justify-between gap-3 font-semibold text-white">
            <span>Total TTC</span>
            <span className="tabular-nums">{euro(TOTAUX_CLOISON_SDB.totalTtc)}</span>
          </p>
          {afficherMargeCg ? (
            <>
              <p className="mt-2 flex justify-between gap-3 border-t border-emerald-500/20 pt-2 text-amber-100">
                <span>Coût sous-traitance artisans HT</span>
                <span className="tabular-nums">{euro(TOTAUX_CLOISON_SDB.coutsTravauxHt)}</span>
              </p>
              <p className="flex justify-between gap-3 text-amber-100">
                <span>Commission Damien RICHARD 10 % HT</span>
                <span className="tabular-nums">{euro(TOTAUX_CLOISON_SDB.commissionDamienHt)}</span>
              </p>
              <p className="flex justify-between gap-3 font-semibold text-amber-50">
                <span>Marge nette ENERGIA HT ({TOTAUX_CLOISON_SDB.tauxMargeNettePct} %)</span>
                <span className="tabular-nums">{euro(TOTAUX_CLOISON_SDB.margeNetteEnergiaHt)}</span>
              </p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
