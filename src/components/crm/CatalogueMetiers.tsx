import { useMemo, useState, type FormEvent } from "react";
import {
  CATEGORIES_METIERS,
  LIBELLES_STATUT,
  STATUTS_CATALOGUE,
  TAUX_TVA_CATALOGUE,
  LIBELLES_UNITE,
  UNITES_PRESTATION,
  calculerPrestation,
  desactiverPrestationCatalogue,
  diagnostiquerCatalogue,
  dupliquerPrestationCatalogue,
  enregistrerPrestationCatalogue,
  formatEuroOuPlaceholder,
  formatTauxMarge,
  getCategorieMetier,
  getSousCategorieMetier,
  labelTva,
  listerPrestationsCalculees,
  reactiverPrestationCatalogue,
  sousCategoriesDe,
  type BrouillonPrestation,
  type PrestationCalculee,
  type StatutCatalogue,
  type TauxTvaCatalogue,
  type UnitePrestation,
} from "../../lib/crm/catalogue";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none";
const labelClass = "block text-xs font-medium uppercase tracking-wide text-slate-400";

type TriMarge = "aucun" | "desc" | "asc";

const BROUILLON_VIDE: BrouillonPrestation = {
  categorieId: "",
  sousCategorieId: "",
  nom: "",
  description: "",
  unite: "forfait",
  coutMaterielHt: null,
  coutMainOeuvreHt: null,
  prixVenteHt: null,
  tauxTva: 0.2,
  artisan: "",
  statut: "estimation",
  garantie: "",
  aides: "",
  notes: "",
  actif: true,
};

function nombreDepuisChamp(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function champNombre(value: number | null): string {
  return value == null ? "" : String(value);
}

function MargeAffichee({ prestation }: { prestation: PrestationCalculee }) {
  if (!prestation.tarifRenseigne) {
    return <span className="text-amber-200">Tarif à renseigner</span>;
  }
  const couleur = prestation.venteInferieureAuCout ? "text-red-300" : "text-emerald-300";
  return (
    <span className={couleur}>
      {formatEuroOuPlaceholder(prestation.margeBruteHt, "—")}{" "}
      <span className="text-slate-500">({formatTauxMarge(prestation.tauxMarge)})</span>
    </span>
  );
}

export default function CatalogueMetiers() {
  const [tick, setTick] = useState(0);
  const [categorieId, setCategorieId] = useState("");
  const [sousCategorieId, setSousCategorieId] = useState("");
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<StatutCatalogue | "">("");
  const [triMarge, setTriMarge] = useState<TriMarge>("aucun");
  const [inclureInactifs, setInclureInactifs] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [brouillon, setBrouillon] = useState<BrouillonPrestation>(BROUILLON_VIDE);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const prestations = useMemo(() => listerPrestationsCalculees(), [tick]);
  const diagnostic = useMemo(() => diagnostiquerCatalogue(), [tick]);
  const sousCategories = useMemo(
    () => (categorieId ? sousCategoriesDe(categorieId) : []),
    [categorieId],
  );

  const listeFiltree = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    const filtrées = prestations.filter((item) => {
      if (!inclureInactifs && !item.actif) return false;
      if (categorieId && item.categorieId !== categorieId) return false;
      if (sousCategorieId && item.sousCategorieId !== sousCategorieId) return false;
      if (filtreStatut && item.statut !== filtreStatut) return false;
      if (!q) return true;
      const categorie = getCategorieMetier(item.categorieId)?.nom ?? "";
      const sous = getSousCategorieMetier(item.sousCategorieId)?.nom ?? "";
      return `${item.nom} ${item.description} ${categorie} ${sous} ${item.artisan}`
        .toLowerCase()
        .includes(q);
    });
    if (triMarge === "aucun") return filtrées;
    return [...filtrées].sort((a, b) => {
      const ma = a.tauxMarge ?? -Infinity;
      const mb = b.tauxMarge ?? -Infinity;
      return triMarge === "desc" ? mb - ma : ma - mb;
    });
  }, [
    prestations,
    categorieId,
    sousCategorieId,
    filtreStatut,
    recherche,
    triMarge,
    inclureInactifs,
  ]);

  const compteursCategorie = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of prestations) {
      if (!item.actif && !inclureInactifs) continue;
      map.set(item.categorieId, (map.get(item.categorieId) ?? 0) + 1);
    }
    return map;
  }, [prestations, inclureInactifs]);

  function rafraichir() {
    setTick((n) => n + 1);
  }

  function ouvrirAjout(preset?: Partial<BrouillonPrestation>) {
    const catId = preset?.categorieId ?? categorieId;
    const categorie = catId ? getCategorieMetier(catId) : undefined;
    setBrouillon({
      ...BROUILLON_VIDE,
      categorieId: catId,
      sousCategorieId: preset?.sousCategorieId ?? sousCategorieId,
      tauxTva: categorie?.tauxTvaDefaut ?? 0.2,
      ...preset,
    });
    setErreur(null);
    setModalOpen(true);
  }

  function ouvrirEdition(item: PrestationCalculee) {
    setBrouillon({ ...item });
    setErreur(null);
    setModalOpen(true);
  }

  function fermerModal() {
    setModalOpen(false);
    setErreur(null);
  }

  function soumettre(event: FormEvent) {
    event.preventDefault();
    const resultat = enregistrerPrestationCatalogue(brouillon);
    if (resultat.erreur) {
      setErreur(resultat.erreur);
      return;
    }
    setMessage(brouillon.id ? "Prestation mise à jour." : "Prestation ajoutée au catalogue.");
    fermerModal();
    rafraichir();
  }

  function dupliquer(id: string) {
    const resultat = dupliquerPrestationCatalogue(id);
    setMessage(resultat.erreur ?? "Prestation dupliquée.");
    rafraichir();
  }

  function desactiver(id: string) {
    const err = desactiverPrestationCatalogue(id);
    setMessage(err ?? "Prestation désactivée.");
    rafraichir();
  }

  function reactiver(id: string) {
    const err = reactiverPrestationCatalogue(id);
    setMessage(err ?? "Prestation réactivée.");
    rafraichir();
  }

  const apercu = calculerPrestation({
    id: brouillon.id ?? "apercu",
    dateMiseAJour: "",
    demo: brouillon.demo === true,
    posteIdLegacy: brouillon.posteIdLegacy ?? null,
    ...brouillon,
  });

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
          Administration catalogue
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-white">Catalogue métiers</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
          Hiérarchie Catégorie → Sous-catégorie → Prestation. Les tarifs se renseignent
          progressivement à partir des devis artisans, des prix fournisseurs et des conditions
          de chantier. Les projets existants ne sont pas modifiés.
        </p>
        <dl className="mt-4 grid gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Catégories</dt>
            <dd className="text-lg font-semibold text-white">{diagnostic.nbCategories}</dd>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Sous-catégories</dt>
            <dd className="text-lg font-semibold text-white">{diagnostic.nbSousCategories}</dd>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Prestations</dt>
            <dd className="text-lg font-semibold text-white">{diagnostic.nbPrestations}</dd>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Tarifs renseignés</dt>
            <dd className="text-lg font-semibold text-white">
              {diagnostic.avecTarif}
              <span className="ml-1 text-xs font-normal text-slate-500">
                / {diagnostic.sansTarif} à renseigner
              </span>
            </dd>
          </div>
        </dl>
      </section>

      {message ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className={`${labelClass} flex-1`}>
          Rechercher une prestation
          <input
            type="search"
            value={recherche}
            onChange={(event) => setRecherche(event.target.value)}
            placeholder="Nom, artisan, catégorie…"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Catégorie
          <select
            value={categorieId}
            onChange={(event) => {
              setCategorieId(event.target.value);
              setSousCategorieId("");
            }}
            className={inputClass}
          >
            <option value="">Toutes</option>
            {CATEGORIES_METIERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nom}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Sous-catégorie
          <select
            value={sousCategorieId}
            disabled={!categorieId}
            onChange={(event) => setSousCategorieId(event.target.value)}
            className={inputClass}
          >
            <option value="">Toutes</option>
            {sousCategories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nom}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Statut
          <select
            value={filtreStatut}
            onChange={(event) => setFiltreStatut(event.target.value as StatutCatalogue | "")}
            className={inputClass}
          >
            <option value="">Tous</option>
            {STATUTS_CATALOGUE.map((statut) => (
              <option key={statut} value={statut}>
                {LIBELLES_STATUT[statut]}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Trier par marge
          <select
            value={triMarge}
            onChange={(event) => setTriMarge(event.target.value as TriMarge)}
            className={inputClass}
          >
            <option value="aucun">Aucun</option>
            <option value="desc">Marge décroissante</option>
            <option value="asc">Marge croissante</option>
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={inclureInactifs}
            onChange={(event) => setInclureInactifs(event.target.checked)}
          />
          Inclure désactivées
        </label>
        <button
          type="button"
          onClick={() => ouvrirAjout()}
          className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Ajouter une prestation
        </button>
      </div>

      {!categorieId ? (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Catégories principales
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {CATEGORIES_METIERS.map((categorie) => (
              <button
                key={categorie.id}
                type="button"
                onClick={() => {
                  setCategorieId(categorie.id);
                  setSousCategorieId("");
                }}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left transition hover:border-emerald-500/40"
              >
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  {String(categorie.ordre).padStart(2, "0")}
                </p>
                <p className="mt-1 font-medium text-white">{categorie.nom}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {sousCategoriesDe(categorie.id).length} sous-catégories ·{" "}
                  {compteursCategorie.get(categorie.id) ?? 0}{" "}
                  {(compteursCategorie.get(categorie.id) ?? 0) > 1 ? "prestations" : "prestation"}
                </p>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setCategorieId("");
                setSousCategorieId("");
              }}
              className="rounded-lg border border-slate-700 px-3 py-1 text-slate-300 hover:text-white"
            >
              Toutes les catégories
            </button>
            <span className="text-slate-600">/</span>
            <span className="font-medium text-white">
              {getCategorieMetier(categorieId)?.nom}
            </span>
            {sousCategorieId ? (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-emerald-200">
                  {getSousCategorieMetier(sousCategorieId)?.nom}
                </span>
              </>
            ) : null}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Sous-catégories
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSousCategorieId("")}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  !sousCategorieId
                    ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
                    : "border-slate-700 text-slate-300"
                }`}
              >
                Toutes
              </button>
              {sousCategories.map((sous) => (
                <button
                  key={sous.id}
                  type="button"
                  onClick={() => setSousCategorieId(sous.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    sousCategorieId === sous.id
                      ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
                      : "border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {sous.nom}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="min-w-[72rem] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-800 text-[11px] uppercase tracking-wide text-slate-300">
                <tr>
                  <th className="px-3 py-2">Prestation</th>
                  <th className="px-3 py-2">Unité</th>
                  <th className="px-3 py-2">Coût artisan HT</th>
                  <th className="px-3 py-2">Prix client HT</th>
                  <th className="px-3 py-2">Marge brute</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listeFiltree.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                      Aucune prestation dans cette vue. Ajoutez-en une pour commencer le
                      chiffrage progressif.
                    </td>
                  </tr>
                ) : (
                  listeFiltree.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-t border-slate-800 ${item.actif ? "" : "opacity-60"}`}
                    >
                      <td className="px-3 py-3">
                        <p className="font-medium text-white">{item.nom}</p>
                        <p className="text-[11px] text-slate-500">
                          {getSousCategorieMetier(item.sousCategorieId)?.nom}
                        </p>
                        {item.demo ? (
                          <span className="mt-1 inline-flex rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
                            Données de démonstration
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-slate-300">{LIBELLES_UNITE[item.unite]}</td>
                      <td className="px-3 py-3">
                        {item.coutRevientHt == null ? (
                          <span className="text-amber-200">Prix artisan à confirmer</span>
                        ) : (
                          formatEuroOuPlaceholder(item.coutRevientHt, "—")
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {item.prixVenteHt == null ? (
                          <span className="text-amber-200">Prix de vente à définir</span>
                        ) : (
                          formatEuroOuPlaceholder(item.prixVenteHt, "—")
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <MargeAffichee prestation={item} />
                        {item.venteInferieureAuCout ? (
                          <p className="mt-1 text-[11px] text-red-300">
                            Prix de vente inférieur au coût de revient
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-slate-300">{LIBELLES_STATUT[item.statut]}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => ouvrirEdition(item)}
                            className="rounded-lg border border-slate-600 px-2 py-1 text-[11px] font-semibold text-slate-200"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => dupliquer(item.id)}
                            className="rounded-lg border border-slate-600 px-2 py-1 text-[11px] font-semibold text-slate-200"
                          >
                            Dupliquer
                          </button>
                          {item.actif ? (
                            <button
                              type="button"
                              onClick={() => desactiver(item.id)}
                              className="rounded-lg border border-red-500/40 px-2 py-1 text-[11px] font-semibold text-red-300"
                            >
                              Désactiver
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => reactiver(item.id)}
                              className="rounded-lg border border-emerald-500/40 px-2 py-1 text-[11px] font-semibold text-emerald-200"
                            >
                              Réactiver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {categorieId ? null : listeFiltree.length > 0 && (recherche || filtreStatut || triMarge !== "aucun") ? (
        <section className="rounded-2xl border border-slate-800 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">
            Résultats de recherche ({listeFiltree.length})
          </h3>
          <ul className="space-y-2">
            {listeFiltree.map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="font-medium text-white">{item.nom}</p>
                <p className="text-xs text-slate-500">
                  {getCategorieMetier(item.categorieId)?.nom} →{" "}
                  {getSousCategorieMetier(item.sousCategorieId)?.nom}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 sm:items-center sm:p-4"
          onClick={fermerModal}
        >
          <form
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl sm:max-w-3xl sm:rounded-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
            onSubmit={soumettre}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">
                {brouillon.id ? "Modifier la prestation" : "Ajouter une prestation"}
              </h3>
              <button
                type="button"
                onClick={fermerModal}
                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                Catégorie principale
                <select
                  required
                  value={brouillon.categorieId}
                  onChange={(event) => {
                    const next = event.target.value;
                    const categorie = getCategorieMetier(next);
                    setBrouillon((actuel) => ({
                      ...actuel,
                      categorieId: next,
                      sousCategorieId: "",
                      tauxTva: categorie?.tauxTvaDefaut ?? actuel.tauxTva,
                    }));
                  }}
                  className={inputClass}
                >
                  <option value="">Choisir une catégorie…</option>
                  {CATEGORIES_METIERS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.ordre}. {item.nom}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Sous-catégorie
                <select
                  required
                  value={brouillon.sousCategorieId}
                  disabled={!brouillon.categorieId}
                  onChange={(event) =>
                    setBrouillon((actuel) => ({
                      ...actuel,
                      sousCategorieId: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">
                    {brouillon.categorieId
                      ? "Choisir une sous-catégorie…"
                      : "D’abord une catégorie"}
                  </option>
                  {sousCategoriesDe(brouillon.categorieId).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nom}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>
                Nom de la prestation
                <input
                  required
                  value={brouillon.nom}
                  onChange={(event) => setBrouillon((a) => ({ ...a, nom: event.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Description
                <textarea
                  rows={3}
                  value={brouillon.description}
                  onChange={(event) =>
                    setBrouillon((a) => ({ ...a, description: event.target.value }))
                  }
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Unité
                <select
                  value={brouillon.unite}
                  onChange={(event) =>
                    setBrouillon((a) => ({ ...a, unite: event.target.value as UnitePrestation }))
                  }
                  className={inputClass}
                >
                  {UNITES_PRESTATION.map((unite) => (
                    <option key={unite} value={unite}>
                      {LIBELLES_UNITE[unite]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Taux de TVA
                <select
                  value={brouillon.tauxTva}
                  onChange={(event) =>
                    setBrouillon((a) => ({
                      ...a,
                      tauxTva: Number(event.target.value) as TauxTvaCatalogue,
                    }))
                  }
                  className={inputClass}
                >
                  {TAUX_TVA_CATALOGUE.map((taux) => (
                    <option key={taux} value={taux}>
                      {labelTva(taux)}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Coût matériel HT
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Tarif à renseigner"
                  value={champNombre(brouillon.coutMaterielHt)}
                  onChange={(event) =>
                    setBrouillon((a) => ({
                      ...a,
                      coutMaterielHt: nombreDepuisChamp(event.target.value),
                    }))
                  }
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Coût main-d’œuvre HT
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Prix artisan à confirmer"
                  value={champNombre(brouillon.coutMainOeuvreHt)}
                  onChange={(event) =>
                    setBrouillon((a) => ({
                      ...a,
                      coutMainOeuvreHt: nombreDepuisChamp(event.target.value),
                    }))
                  }
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Prix de vente HT client
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Prix de vente à définir"
                  value={champNombre(brouillon.prixVenteHt)}
                  onChange={(event) =>
                    setBrouillon((a) => ({
                      ...a,
                      prixVenteHt: nombreDepuisChamp(event.target.value),
                    }))
                  }
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Statut
                <select
                  value={brouillon.statut}
                  onChange={(event) =>
                    setBrouillon((a) => ({ ...a, statut: event.target.value as StatutCatalogue }))
                  }
                  className={inputClass}
                >
                  {STATUTS_CATALOGUE.map((statut) => (
                    <option key={statut} value={statut}>
                      {LIBELLES_STATUT[statut]}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Artisan ou responsable
                <input
                  value={brouillon.artisan}
                  onChange={(event) => setBrouillon((a) => ({ ...a, artisan: event.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Garantie
                <input
                  value={brouillon.garantie}
                  onChange={(event) =>
                    setBrouillon((a) => ({ ...a, garantie: event.target.value }))
                  }
                  className={inputClass}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Aides éventuelles (indicatif)
                <input
                  value={brouillon.aides}
                  onChange={(event) => setBrouillon((a) => ({ ...a, aides: event.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>
                Notes
                <textarea
                  rows={2}
                  value={brouillon.notes}
                  onChange={(event) => setBrouillon((a) => ({ ...a, notes: event.target.value }))}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Calcul automatique — marge brute, pas bénéfice net
              </p>
              <dl className="grid gap-2 text-xs sm:grid-cols-3">
                <div>
                  <dt className="text-slate-500">Coût de revient HT</dt>
                  <dd className="font-semibold text-white">
                    {formatEuroOuPlaceholder(apercu.coutRevientHt, "Tarif à renseigner")}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">TVA</dt>
                  <dd className="font-semibold text-white">
                    {formatEuroOuPlaceholder(apercu.montantTva, "—")}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Prix de vente TTC</dt>
                  <dd className="font-semibold text-emerald-300">
                    {formatEuroOuPlaceholder(apercu.prixVenteTtc, "Prix de vente à définir")}
                  </dd>
                </div>
                <div className="sm:col-span-3">
                  <dt className="text-slate-500">Marge brute HT / taux de marge</dt>
                  <dd>
                    <MargeAffichee prestation={apercu} />
                  </dd>
                </div>
              </dl>
              {apercu.venteInferieureAuCout ? (
                <p role="alert" className="mt-2 text-sm font-semibold text-red-300">
                  Prix de vente inférieur au coût de revient
                </p>
              ) : null}
              {!apercu.tarifRenseigne ? (
                <p className="mt-2 text-xs text-amber-200">
                  Cette fiche n’est pas présentée comme chiffrée tant que le coût et le prix de
                  vente ne sont pas renseignés. La validation est bloquée.
                </p>
              ) : null}
            </div>

            {erreur ? (
              <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {erreur}
              </p>
            ) : null}

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={fermerModal}
                className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
