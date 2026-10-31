import { useState } from "react";
import { euro } from "../../lib/crm/mockData";
import { libelleHonorairesAmoHubAdmin } from "../../lib/crm/operationnelCrm";
import BaremeAnahMar2026 from "./BaremeAnahMar2026";
import {
  CLIENT_BRUNEL_MARCHE,
  DETAIL_JALON_BRUNEL_DEPOT_MAR,
  LIGNES_DEVIS_HORS_ANAH,
  MAR_BRUNEL,
  MARGE_CG_BRUNEL_HT,
  MENTION_AIDES_BRUNEL_MARCHE,
  PROFIL_ANAH_BRUNEL,
  TOTAUX_DEVIS_HORS_ANAH,
  TOTAUX_OPTION_BAIE,
  TOTAUX_OPTION_SANS_BAIE,
  lignesMarcheBrunel,
  offreMarcheBrunelActive,
  totauxMarcheBrunel,
  OFFRE_BRUNEL_OPTION_SANS_BAIE,
} from "../../lib/crm/brunelMarcheOfficiel2026";
import {
  CHEMIN_CONTRAT_BRUNEL_MACONNERIE,
  CROQUIS_MANUSCRIT_MUSTAFA,
  DOC_ADMIN_DEVIS_HEZEN,
  HEZEN_SOUS_TRAITANCE,
  MENTION_JURIDIQUE_PROJECTIONS_BRUNEL,
  PHOTO_CADRAGE_BRUNEL,
  PHOTOS_ETAT_LIEUX_BRUNEL_MACONNERIE,
  PLAN_DAO_BRUNEL,
  POSTES_BRUNEL_MACONNERIE_CONTRAT,
  REF_PLAN_DAO_BRUNEL,
  TOTAUX_BRUNEL_MACONNERIE,
  documentsGaleriePublique,
} from "../../lib/crm/brunelMaconnerieOfficiel.js";
import VisionneusePhoto from "./VisionneusePhoto.jsx";
import PlanDaoBrunelSvg from "./PlanDaoBrunelSvg.jsx";

function Lignes({ lignes }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-2 py-2 font-medium">Poste</th>
            <th className="px-2 py-2 text-right font-medium">Qté</th>
            <th className="px-2 py-2 text-right font-medium">PU HT</th>
            <th className="px-2 py-2 text-right font-medium">Total HT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {lignes.map((ligne) => (
            <tr key={ligne.id}>
              <td className="px-2 py-2 text-white">{ligne.nom}</td>
              <td className="px-2 py-2 text-right text-slate-300">
                {ligne.quantite} {ligne.unite}
              </td>
              <td className="px-2 py-2 text-right text-slate-300">{euro(ligne.puHt)}</td>
              <td className="px-2 py-2 text-right font-medium text-emerald-200">{euro(ligne.totalHt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Montant({ label, valeur, testId, fort = false }) {
  return (
    <p className="flex items-baseline justify-between gap-3 text-sm text-slate-300">
      <span>{label}</span>
      <strong className={fort ? "text-base text-white" : "text-emerald-200"} data-testid={testId}>
        {euro(valeur)}
      </strong>
    </p>
  );
}

function CarteDoc({ doc, index, onOpen, miseEnAvant = false }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group overflow-hidden rounded-2xl border bg-slate-900/80 text-left transition hover:border-emerald-500/50 hover:shadow-[0_0_24px_rgba(16,185,129,0.12)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
        miseEnAvant ? "border-sky-400/50 sm:col-span-2 xl:col-span-2" : "border-slate-800"
      }`}
    >
      <div className={`relative overflow-hidden bg-slate-950 ${miseEnAvant ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <img
          src={doc.src}
          alt={doc.titre}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-2 top-2 rounded-lg border border-white/15 bg-slate-950/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
          {doc.adminOnly ? "Admin" : `Doc ${index + 1}`}
        </span>
        {miseEnAvant ? (
          <span className="absolute bottom-2 right-2 rounded-lg border border-sky-400/40 bg-sky-500/20 px-2 py-1 text-[10px] font-semibold text-sky-50 backdrop-blur">
            En-tête technique
          </span>
        ) : null}
      </div>
      <div className="space-y-2 p-3">
        <p className="text-sm font-semibold text-white">{doc.titre}</p>
        {doc.sousTitre || doc.label ? (
          <p className="text-[11px] leading-snug text-slate-400">{doc.sousTitre || doc.label}</p>
        ) : null}
        <p
          className={`inline-flex rounded-lg border px-2 py-1 text-[11px] leading-snug ${
            doc.adminOnly
              ? "border-sky-400/40 bg-sky-500/15 text-sky-100"
              : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
          }`}
        >
          {doc.badge}
        </p>
      </div>
    </button>
  );
}

function SelecteurPlanTechniqueBrunel({ onLightbox }) {
  const [onglet, setOnglet] = useState("dao");
  const doc = onglet === "dao" ? PLAN_DAO_BRUNEL : CROQUIS_MANUSCRIT_MUSTAFA;

  return (
    <div
      className="overflow-hidden rounded-2xl border-[3px] border-slate-950 bg-slate-950"
      data-testid="selecteur-plan-dao-brunel"
    >
      <div className="flex flex-wrap gap-2 border-b border-sky-500/30 bg-slate-950 p-3" role="tablist" aria-label="Plans techniques Brunel">
        <button
          type="button"
          role="tab"
          aria-selected={onglet === "dao"}
          onClick={() => setOnglet("dao")}
          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
            onglet === "dao"
              ? "border-sky-400/60 bg-sky-500/20 text-sky-50"
              : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
          }`}
        >
          📐 Plan Technique DAO Vectoriel
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={onglet === "croquis"}
          onClick={() => setOnglet("croquis")}
          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
            onglet === "croquis"
              ? "border-amber-400/60 bg-amber-500/20 text-amber-50"
              : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
          }`}
        >
          📝 Croquis Manuscrit Terrain (Mustafa)
        </button>
      </div>

      <div className="p-3">
        {onglet === "dao" ? (
          <button
            type="button"
            onClick={() => onLightbox?.(PLAN_DAO_BRUNEL)}
            className="group block w-full overflow-hidden rounded-xl border-2 border-sky-400/50 bg-slate-950 text-left transition hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          >
            <div className="relative">
              <PlanDaoBrunelSvg />
              <span className="absolute left-3 top-3 rounded-lg border border-sky-400/40 bg-slate-950/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-100 backdrop-blur">
                DAO SVG · {REF_PLAN_DAO_BRUNEL}
              </span>
            </div>
            <div className="space-y-1 border-t border-sky-500/20 bg-slate-950/90 p-3">
              <p className="text-sm font-semibold text-white">{PLAN_DAO_BRUNEL.titre}</p>
              <p className="text-[11px] leading-snug text-sky-200/90">{PLAN_DAO_BRUNEL.badge}</p>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onLightbox?.(doc)}
            className="group block w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-left transition hover:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <div className="relative max-h-[520px] overflow-auto bg-slate-950">
              <img
                src={CROQUIS_MANUSCRIT_MUSTAFA.src}
                alt={CROQUIS_MANUSCRIT_MUSTAFA.titre}
                className="h-full w-full object-contain p-2"
                loading="lazy"
              />
              <span className="absolute left-2 top-2 rounded-lg border border-amber-400/40 bg-slate-950/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-100 backdrop-blur">
                Archive
              </span>
            </div>
            <div className="space-y-1 border-t border-slate-800 bg-slate-950/90 p-3">
              <p className="text-sm font-semibold text-white">{CROQUIS_MANUSCRIT_MUSTAFA.titre}</p>
              <p className="text-[11px] leading-snug text-amber-100/90">{CROQUIS_MANUSCRIT_MUSTAFA.badge}</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

function ZoneComparativeCard({ photo, index, onOpen }) {
  const [mode, setMode] = useState("cote");
  const montrerAvant = mode === "cote" || mode === "avant";
  const montrerApres = mode === "cote" || mode === "apres";

  return (
    <article
      className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/80 p-3"
      data-testid={`zone-comparative-${photo.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-300">Zone {photo.zone}</p>
          <h3 className="text-sm font-semibold text-white">{photo.zoneTitre}</h3>
        </div>
        <div className="inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-slate-900 p-1">
          {[
            { id: "cote", label: "Vis-à-vis" },
            { id: "avant", label: "📸 Avant" },
            { id: "apres", label: "✨ Après 3D" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMode(opt.id)}
              className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition ${
                mode === opt.id
                  ? "bg-emerald-400 text-slate-950"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`mt-3 grid gap-2 ${mode === "cote" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
        {montrerAvant ? (
          <button
            type="button"
            onClick={() => onOpen(index, "avant")}
            className="group relative overflow-hidden rounded-xl border border-slate-600 bg-slate-900 text-left"
          >
            <img
              src={photo.src}
              alt={photo.label}
              className="aspect-[4/3] h-full w-full object-cover transition group-hover:scale-[1.02]"
              loading="lazy"
            />
            <span className="absolute left-2 top-2 rounded-md bg-slate-600 px-2 py-1 text-[9px] font-bold uppercase text-white">
              État initial brut
            </span>
          </button>
        ) : null}
        {montrerApres ? (
          <button
            type="button"
            onClick={() => onOpen(index, "apres")}
            className="group relative overflow-hidden rounded-xl border border-emerald-500/50 bg-slate-900 text-left"
          >
            <img
              src={photo.srcApres}
              alt={photo.labelApres}
              className="aspect-[4/3] h-full w-full object-cover transition group-hover:scale-[1.02]"
              loading="lazy"
              onError={(event) => {
                const tries = Number(event.currentTarget.dataset.fb || "0");
                const fallbacks = photo.srcApresFallbacks || [];
                if (tries < fallbacks.length) {
                  event.currentTarget.dataset.fb = String(tries + 1);
                  event.currentTarget.src = fallbacks[tries];
                }
              }}
            />
            <span className="absolute left-2 top-2 rounded-md bg-emerald-600 px-2 py-1 text-[9px] font-bold uppercase text-emerald-50">
              {photo.badgeApres}
            </span>
          </button>
        ) : null}
      </div>

      <p className="mt-3 border-l-4 border-sky-400 bg-slate-900/80 pl-3 text-[11px] leading-relaxed text-slate-300">
        {photo.legende}
      </p>
    </article>
  );
}

function GalerieTechniqueBrunelMaconnerie({ afficherAdmin = false }) {
  const [indexOuvert, setIndexOuvert] = useState(null);
  const [indexPhotoOuverte, setIndexPhotoOuverte] = useState(null);
  const [modePhotoOuverte, setModePhotoOuverte] = useState("avant");
  const docs = documentsGaleriePublique(afficherAdmin);
  const photosVisionneuseDocs = docs.map((doc) => ({
    src: doc.src,
    srcApres: doc.srcApres,
    srcApresFallbacks: doc.srcApresFallbacks,
    label: doc.label,
    labelApres: doc.labelApres,
  }));
  const photosVisionneuseEtat = PHOTOS_ETAT_LIEUX_BRUNEL_MACONNERIE.map((photo) => ({
    src: photo.src,
    srcApres: photo.srcApres,
    srcApresFallbacks: photo.srcApresFallbacks,
    label: photo.label,
    labelApres: photo.labelApres,
  }));
  const indexCadrage = docs.findIndex((d) => d.id === PHOTO_CADRAGE_BRUNEL.id);
  const indexAdmin = docs.findIndex((d) => d.id === DOC_ADMIN_DEVIS_HEZEN.id);

  const ouvrirDoc = (doc) => {
    const index = docs.findIndex((d) => d.id === doc.id);
    if (index >= 0) {
      setIndexPhotoOuverte(null);
      setIndexOuvert(index);
    }
  };

  return (
    <section
      className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4"
      data-testid="galerie-technique-brunel-maconnerie"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Galerie Architecturale — Avenant n°01 Gros Œuvre
          </p>
          <p className="mt-1 text-sm text-white">
            Plan DAO · comparatif Avant/Après 3D (10 zones) · réf. {REF_PLAN_DAO_BRUNEL}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-100">
            10 zones Avant / Après
          </span>
          <a
            href={CHEMIN_CONTRAT_BRUNEL_MACONNERIE}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-100 hover:bg-emerald-500/25"
          >
            Ouvrir avenant HTML
          </a>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 rounded-t-xl bg-slate-950 px-3 py-2 text-xs font-bold uppercase tracking-wide text-sky-300 ring-1 ring-sky-500/40">
          Plan technique d&apos;ingénierie gros œuvre — réf. {REF_PLAN_DAO_BRUNEL}
        </p>
        <div className="overflow-hidden rounded-b-xl border border-sky-500/40 bg-slate-950">
          <SelecteurPlanTechniqueBrunel onLightbox={ouvrirDoc} />
        </div>
      </div>

      {indexCadrage >= 0 ? (
        <div className="mt-4 max-w-sm">
          <CarteDoc
            doc={docs[indexCadrage]}
            index={indexCadrage}
            onOpen={() => {
              setIndexPhotoOuverte(null);
              setIndexOuvert(indexCadrage);
            }}
          />
        </div>
      ) : null}

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Galerie comparative « Avant / Après travaux » — 10 zones
      </p>
      <div className="mt-3 grid gap-4 xl:grid-cols-2">
        {PHOTOS_ETAT_LIEUX_BRUNEL_MACONNERIE.map((photo, index) => (
          <ZoneComparativeCard
            key={photo.id}
            photo={photo}
            index={index}
            onOpen={(i, mode) => {
              setIndexOuvert(null);
              setModePhotoOuverte(mode === "apres" ? "apres" : "avant");
              setIndexPhotoOuverte(i);
            }}
          />
        ))}
      </div>

      <aside className="mt-5 rounded-xl border-2 border-orange-500/50 bg-orange-500/10 p-4 text-sm leading-relaxed text-orange-50">
        <p>⚖️ {MENTION_JURIDIQUE_PROJECTIONS_BRUNEL}</p>
      </aside>

      {afficherAdmin && indexAdmin >= 0 ? (
        <div className="mt-5 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4" data-testid="doc-admin-hezen-sans-prix">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-200">
            {HEZEN_SOUS_TRAITANCE.titrePresentation}
          </p>
          <p className="mt-1 text-sm text-sky-50">{HEZEN_SOUS_TRAITANCE.sousTitrePresentation}</p>
          <div className="mt-3 max-w-md">
            <CarteDoc
              doc={docs[indexAdmin]}
              index={indexAdmin}
              onOpen={() => {
                setIndexPhotoOuverte(null);
                setIndexOuvert(indexAdmin);
              }}
            />
          </div>
        </div>
      ) : null}

      {indexPhotoOuverte != null ? (
        <VisionneusePhoto
          photos={photosVisionneuseEtat}
          index={indexPhotoOuverte}
          modeInitial={modePhotoOuverte}
          onIndex={setIndexPhotoOuverte}
          onClose={() => setIndexPhotoOuverte(null)}
        />
      ) : null}

      {indexOuvert != null ? (
        <VisionneusePhoto
          photos={photosVisionneuseDocs}
          index={indexOuvert}
          onIndex={setIndexOuvert}
          onClose={() => setIndexOuvert(null)}
        />
      ) : null}
    </section>
  );
}

function BlocAvenantMaconnerie({ afficherMargeCg = true }) {
  return (
    <div
      className="rounded-xl border border-orange-500/30 bg-slate-950/70 p-4"
      data-testid="avenant-brunel-maconnerie"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-orange-200">
        Avenant n°01 — Gros Œuvre &amp; Dalle 80 m²
      </p>
      <p className="mt-2 text-sm text-slate-300">
        Ouverture IPN 260×230 · soutènement / mur banché · dalle 80 m² City pompe — TVA 10 % · hors MaPrimeRénov’.
      </p>
      <Lignes lignes={POSTES_BRUNEL_MACONNERIE_CONTRAT} />
      <div className="mt-4 space-y-1 border-t border-slate-800 pt-3">
        <Montant label="Total avenant HT" valeur={TOTAUX_BRUNEL_MACONNERIE.totalHt} testId="brunel-maco-ht" fort />
        <Montant label="TVA 10 %" valeur={TOTAUX_BRUNEL_MACONNERIE.totalTva} testId="brunel-maco-tva" />
        <Montant label="Total avenant TTC" valeur={TOTAUX_BRUNEL_MACONNERIE.totalTtc} testId="brunel-maco-ttc" fort />
        {afficherMargeCg ? (
          <Montant
            label="Marge brute CG HT"
            valeur={TOTAUX_BRUNEL_MACONNERIE.margeBruteHt}
            testId="brunel-maco-marge"
          />
        ) : null}
      </div>
    </div>
  );
}

export default function FicheMarcheBrunel({
  offreActive,
  afficherBareme = false,
  afficherEcoPtz = false,
  afficherMargeCg = true,
}) {
  const active = offreMarcheBrunelActive(offreActive);
  const sansBaie = active === OFFRE_BRUNEL_OPTION_SANS_BAIE;
  const totaux = totauxMarcheBrunel(active);
  const lignes = lignesMarcheBrunel(active).filter((ligne) => afficherMargeCg || ligne.id !== "brunel-2026-direction-cg");
  const autre = sansBaie ? TOTAUX_OPTION_BAIE : TOTAUX_OPTION_SANS_BAIE;

  return (
    <div className="mt-4 space-y-4" data-brunel-marche="officiel">
      <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-50">
        <p className="font-semibold text-white">{CLIENT_BRUNEL_MARCHE.nom}</p>
        <p className="mt-1">{CLIENT_BRUNEL_MARCHE.adresse}</p>
        <p className="mt-1">{CLIENT_BRUNEL_MARCHE.typeBien}</p>
        <p className="mt-2">
          {CLIENT_BRUNEL_MARCHE.scenarioMar} — DPE {CLIENT_BRUNEL_MARCHE.dpeActuel} → {CLIENT_BRUNEL_MARCHE.dpeCible}.
        </p>
        <p className="mt-1">
          Profil ANAH <strong>{PROFIL_ANAH_BRUNEL.libelle}</strong> — foyer 1 personne, RFR ≤ 31 185 € — taux de
          subvention travaux {Math.round(PROFIL_ANAH_BRUNEL.taux * 100)} %.
        </p>
        <p className="mt-1">Jalon 2 — {DETAIL_JALON_BRUNEL_DEPOT_MAR}.</p>
        {afficherMargeCg ? (
          <p className="mt-1" data-testid="marge-cg-brunel">
            Rémunération Contractant Général sanctuarisée : <strong>{euro(MARGE_CG_BRUNEL_HT)} HT</strong>.
          </p>
        ) : null}
        <p className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-50" data-testid="honoraires-amo-fiche-brunel">
          {libelleHonorairesAmoHubAdmin()}
        </p>
      </div>

      {afficherBareme ? <BaremeAnahMar2026 afficherEcoPtz={afficherEcoPtz} /> : null}

      <GalerieTechniqueBrunelMaconnerie afficherAdmin={afficherMargeCg} />

      <BlocAvenantMaconnerie afficherMargeCg={afficherMargeCg} />

      <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">MAR — Mon Accompagnateur Rénov'</p>
        <p className="mt-2 text-sm text-white">{MAR_BRUNEL.nom}</p>
        <div className="mt-2 space-y-1">
          <Montant label="Honoraires TTC" valeur={MAR_BRUNEL.honorairesTtc} testId="brunel-mar-honoraires" />
          <Montant label="Aide ANAH 40 %" valeur={MAR_BRUNEL.aideAnah} testId="brunel-mar-aide" />
          <Montant label="Reste à charge MAR client TTC" valeur={MAR_BRUNEL.resteAChargeClientTtc} testId="brunel-mar-rac" fort />
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/30 bg-slate-950/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
          {sansBaie
            ? "Devis n°1 — option 2, sans baie vitrée ni linteau IPN (TVA 5,5 %)"
            : "Devis n°1 — option 1, avec baie et IPN (TVA 5,5 %)"}
        </p>
        <Lignes lignes={lignes} />
        <div className="mt-4 space-y-1 border-t border-slate-800 pt-3">
          <Montant label="Total travaux HT" valeur={totaux.totalHt} testId="brunel-total-ht" fort />
          <Montant label="TVA 5,5 %" valeur={totaux.totalTva} testId="brunel-total-tva" />
          <Montant label="Total travaux TTC" valeur={totaux.totalTtc} testId="brunel-total-ttc" fort />
          <Montant label="Subvention ANAH 45 %" valeur={totaux.subventionAnah} testId="brunel-anah" />
          <Montant label="Reste à charge travaux TTC" valeur={totaux.resteAChargeTravauxTtc} testId="brunel-rac-travaux" />
          <Montant label="Reste à charge global TTC (travaux + MAR)" valeur={totaux.resteAChargeGlobalTtc} testId="brunel-rac-global" fort />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-amber-100">{MENTION_AIDES_BRUNEL_MARCHE}</p>
        <p className="mt-3 text-xs text-slate-400">
          Déblocage 30/40/30 sur le TTC du devis n°1 : {euro(totaux.acompte)} à la signature, {euro(totaux.intermediaire)}{" "}
          mi-chantier après validation de Sylvain LEMBELEMBE, {euro(totaux.solde)} à réception.
        </p>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4 text-sm text-slate-300">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {sansBaie ? "Variante non affichée — option 1 avec baie et IPN" : "Variante option 2 — sans baie ni IPN"}
        </p>
        <p className="mt-2">
          {euro(autre.totalHt)} HT / {euro(autre.totalTtc)} TTC — ANAH {euro(autre.subventionAnah)} — RAC travaux{" "}
          {euro(autre.resteAChargeTravauxTtc)} — RAC global {euro(autre.resteAChargeGlobalTtc)}
          {afficherMargeCg ? `. Marge CG ${euro(MARGE_CG_BRUNEL_HT)} HT préservée` : ""}.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-slate-950/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">
          Devis n°2 complémentaire — hors ANAH, locaux non chauffés (TVA 10 %)
        </p>
        <Lignes lignes={LIGNES_DEVIS_HORS_ANAH} />
        <div className="mt-4 space-y-1 border-t border-slate-800 pt-3">
          <Montant label="Total hors ANAH HT" valeur={TOTAUX_DEVIS_HORS_ANAH.totalHt} testId="brunel-hors-ht" />
          <Montant label="TVA 10 %" valeur={TOTAUX_DEVIS_HORS_ANAH.totalTva} testId="brunel-hors-tva" />
          <Montant label="Total hors ANAH TTC" valeur={TOTAUX_DEVIS_HORS_ANAH.totalTtc} testId="brunel-hors-ttc" fort />
        </div>
      </div>
    </div>
  );
}
