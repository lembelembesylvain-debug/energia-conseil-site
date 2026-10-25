import ExportFicheTerrainPdf from "./ExportFicheSniper";
import {
  COULEURS_ADEME,
  composerFicheOpportunite,
  formaterHectares,
  formaterRatio,
} from "../../lib/proptech/ficheOpportuniteSniper";
import BannieresOpportunite from "./BannieresOpportunite";
import BlocEtudeSolaire from "./ExportEtudeSolaire";

function euro(valeur) {
  if (valeur == null || !Number.isFinite(Number(valeur))) return "—";
  return `${Math.round(Number(valeur)).toLocaleString("fr-FR")} €`;
}

function Ligne({ label, value }) {
  return (
    <li className="flex items-start justify-between gap-3 text-[11px] leading-snug text-slate-300">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-white">{value || "—"}</span>
    </li>
  );
}

function surfaceTerrain(m2) {
  if (m2 == null) return "Non communiquée";
  const ha = formaterHectares(m2);
  const metres = `${Math.round(m2).toLocaleString("fr-FR")} m²`;
  return ha ? `${metres} (${ha} ha)` : metres;
}

export default function PanneauSniperProptech({
  sniper,
  logement = null,
  chargement,
  erreur,
  onFermer,
  onAppliquerPrixM2,
}) {
  const fiche = composerFicheOpportunite(logement, sniper);
  const parcelle = sniper?.cadastre?.parcelle;
  const bati = sniper?.cadastre?.bati;
  const dvf = sniper?.dvf;
  const risques = sniper?.georisques?.resume;
  const teinte = fiche.etiquette ? COULEURS_ADEME[fiche.etiquette] : null;
  const brutNumero = String(parcelle?.numero || "").trim();
  const numeroLive = /^\d+$/.test(brutNumero) ? brutNumero.padStart(4, "0") : brutNumero.toUpperCase();
  const sectionLive = String(parcelle?.section || "").toUpperCase();
  const diverge =
    fiche.ancreeSurReleve &&
    sectionLive &&
    (sectionLive !== fiche.section || (fiche.numero && numeroLive !== fiche.numero));

  return (
    <aside className="absolute bottom-4 right-4 z-[2100] max-h-[min(78vh,40rem)] w-[min(100%-2rem,24rem)] overflow-y-auto rounded-2xl border border-amber-400/25 bg-slate-950/96 p-4 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
            Carto sniper · Cadastre + DPE + DVF
          </p>
          <p className="mt-1 text-sm font-semibold text-white">Enrichissement parcelle</p>
        </div>
        {onFermer ? (
          <button type="button" className="text-xs text-slate-400 hover:text-white" onClick={onFermer}>
            Fermer
          </button>
        ) : null}
      </div>

      <ExportFicheTerrainPdf fiche={fiche} />
      <BlocEtudeSolaire fiche={fiche} />

      {chargement ? <p className="mt-3 text-xs text-amber-100">Interrogation des APIs ouvertes…</p> : null}
      {erreur ? <p className="mt-3 text-xs text-rose-200">{erreur}</p> : null}

      {logement || fiche.etiquette || fiche.consoKwhM2 != null ? (
        <section className="mt-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-200">Diagnostic DPE</p>
          <BannieresOpportunite bien={fiche} valeurVenale={fiche.valeurSectorielle} />
          <div className="mt-2 flex items-start gap-2.5">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-bold"
              style={{ backgroundColor: teinte?.fond ?? "#64748b", color: teinte?.texte ?? "#ffffff" }}
            >
              {fiche.etiquette ?? "–"}
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-medium leading-snug text-white">{fiche.adresseComplete}</p>
              <p className="mt-0.5 text-[11px] text-slate-300">
                {fiche.consoKwhM2 != null ? `${fiche.consoKwhM2} kWh/m².an` : "Conso non renseignée"}
                {" · "}
                {fiche.chauffage}
              </p>
            </div>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-amber-100/90">{fiche.statutClimat}</p>
        </section>
      ) : null}

      {fiche.ancreeSurReleve || parcelle ? (
        <section className="mt-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
            {fiche.ancreeSurReleve ? "Cadastre · relevé terrain" : "Cadastre IGN"}
          </p>
          {fiche.ancreeSurReleve ? (
            <p className="mt-1 text-[10px] leading-snug text-emerald-100/80">
              Métrés du relevé Chagny / Corpeau. Le contour sur la carte suit le point cliqué.
            </p>
          ) : null}
          {diverge ? (
            <p className="mt-1 text-[10px] leading-snug text-amber-200">
              Le flux IGN renvoie {sectionLive} {numeroLive}. La fiche retient la parcelle du relevé.
            </p>
          ) : null}
          <ul className="mt-2 space-y-1.5">
            {fiche.ancreeSurReleve ? (
              <>
                <Ligne label="Section" value={fiche.section || "Non communiquée"} />
                <Ligne label="N° parcelle" value={fiche.numero || "Non communiquée"} />
                <Ligne label="Terrain" value={surfaceTerrain(fiche.terrainM2)} />
                <Ligne
                  label="Emprise au sol"
                  value={fiche.empriseM2 != null ? `${fiche.empriseM2.toLocaleString("fr-FR")} m²` : "Non communiquée"}
                />
                <Ligne label="Ratio d'occupation" value={formaterRatio(fiche.ratioOccupation)} />
                <Ligne label="Commune" value={`${fiche.commune} (${fiche.codeDep})`} />
              </>
            ) : (
              <>
                <Ligne label="Section" value={parcelle.section} />
                <Ligne label="N° parcelle" value={parcelle.numero} />
                <Ligne
                  label="Terrain"
                  value={parcelle.surfaceTerrainM2 != null ? `${parcelle.surfaceTerrainM2.toLocaleString("fr-FR")} m²` : "—"}
                />
                <Ligne
                  label="Emprise au sol"
                  value={bati?.empriseSolM2 != null ? `${bati.empriseSolM2.toLocaleString("fr-FR")} m²` : "Non fournie"}
                />
                <Ligne label="Commune" value={parcelle.commune || parcelle.codeInsee} />
              </>
            )}
          </ul>
          {fiche.ancreeSurReleve ? (
            <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{fiche.potentielFoncier}</p>
          ) : null}
        </section>
      ) : !chargement ? (
        <p className="mt-3 text-xs text-slate-400">Aucune parcelle PCI à cette coordonnée.</p>
      ) : null}

      <section className="mt-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-300">
          {fiche.ancreeSurReleve ? fiche.perimetreMarche : `DVF 5 ans · ${dvf?.perimetre || "—"}`}
        </p>
        {fiche.ancreeSurReleve ? (
          fiche.prixM2Median != null ? (
            <p className="mt-2 text-lg font-semibold text-sky-200">{euro(fiche.prixM2Median)} / m²</p>
          ) : (
            <p className="mt-2 text-xs text-slate-400">Pas de prix au m² dans le relevé.</p>
          )
        ) : dvf?.prixM2Median != null ? (
          <p className="mt-2 text-lg font-semibold text-sky-200">{euro(dvf.prixM2Median)} / m²</p>
        ) : (
          <p className="mt-2 text-xs text-slate-400">Pas de mutation récente dans le périmètre.</p>
        )}
        <ul className="mt-2 space-y-1.5">
          {(fiche.ancreeSurReleve ? fiche.transactions : dvf?.mutations || []).slice(0, 5).map((m) => (
            <li key={`${m.date}-${m.prixNet}-${m.adresse}`} className="text-[11px] text-slate-300">
              <span className="text-slate-500">{m.date}</span> · {euro(m.prixNet)}
              {m.prixM2 != null ? ` · ${euro(m.prixM2)}/m²` : ""}
              {m.surfaceM2 ? ` · ${m.surfaceM2} m²` : ""}
              {m.adresse ? ` · ${m.adresse}` : ""}
            </li>
          ))}
        </ul>
        {(fiche.ancreeSurReleve ? fiche.prixM2Median : dvf?.prixM2Median) != null && onAppliquerPrixM2 ? (
          <button
            type="button"
            className="mt-2 w-full rounded-lg border border-sky-500/40 bg-sky-500/10 px-2 py-1.5 text-[11px] font-semibold text-sky-100 hover:bg-sky-500/20"
            onClick={() => onAppliquerPrixM2(fiche.ancreeSurReleve ? fiche.prixM2Median : dvf.prixM2Median)}
          >
            Utiliser ce prix/m² pour la plus-value
          </button>
        ) : null}
        {fiche.ancreeSurReleve && fiche.noteMarche ? (
          <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{fiche.noteMarche}</p>
        ) : (
          <p className="mt-2 text-[10px] text-slate-500">{dvf?.attribution}</p>
        )}
      </section>

      {risques ? (
        <section className="mt-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-300">Géorisques</p>
          <ul className="mt-2 space-y-1.5">
            <Ligne label={risques.rga.libelle} value={risques.rga.niveau} />
            <Ligne label={risques.inondation.libelle} value={risques.inondation.niveau} />
            <Ligne label={risques.sismicite.libelle} value={risques.sismicite.niveau} />
            <Ligne label={risques.radon.libelle} value={risques.radon.niveau} />
          </ul>
        </section>
      ) : null}

      {sniper?.mention ? <p className="mt-3 text-[10px] leading-relaxed text-slate-500">{sniper.mention}</p> : null}
    </aside>
  );
}
