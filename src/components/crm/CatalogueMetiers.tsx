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
  formatFourchetteMarcheTtc,
  formatTauxMarge,
  getCategorieMetier,
  getSousCategorieMetier,
  labelTva,
  listerPrestationsCalculees,
  reactiverPrestationCatalogue,
  sousCategoriesDe,
  AVERTISSEMENT_TARIF_MARCHE,
  AVERTISSEMENT_CATALOGUE_ADMIN,
  MENTIONS_AFFICHAGE_MARCHE,
  LIBELLES_BADGE_STATUT,
  badgeStatutTarif,
  prestationVisiblePourRole,
  COORDINATION_NATIONALE,
  CATEGORIES_COORDINATION_MOHAMED,
  estCategorieCoordonneeParMohamed,
  type BadgeStatutTarif,
  type BrouillonPrestation,
  type PrestationCalculee,
  type CategorieMetier,
  type ReferenceMarche,
  type StatutCatalogue,
  type TauxTvaCatalogue,
  type UnitePrestation,
} from "../../lib/crm/catalogue";
import {
  infererPrioriteTravaux,
  OPTIONS_PRIORITE_TRAVAUX,
  prioriteTravauxOuDefaut,
} from "../../lib/chiffrage/priorite-travaux";
import ToggleSousTraitance from "./ToggleSousTraitance";
import BadgeGainMarge from "./BadgeGainMarge";
import BadgePrioriteTravaux from "../chiffrage/BadgePrioriteTravaux";
import AlerteMargeLigne from "./AlerteMargeLigne";
import BoutonSecuriserMarge from "./BoutonSecuriserMarge";
import WidgetRentabiliteDevis from "./WidgetRentabiliteDevis";
import FicheReferenceModal from "./FicheReferenceModal";
import FicheStrategieCee from "./FicheStrategieCee";
import { FICHES_STRATEGIQUES_CEE } from "../../lib/crm/fichesStrategiquesCee";
import {
  CATEGORIES_STRATEGIQUES_DOUBLE_MODE,
  MODE_FOURNITURE_POSE,
  MODE_POSE_SEULE,
  estCategorieDoubleMode,
  estPrestationDoubleMode,
  extraMargePrestation,
} from "../../lib/crm/sousTraitanceDoubleMode";
import {
  STATUT_MARGE_PERTE,
  analyserCatalogue,
  analyserPrestationCatalogue,
  classesLigneMarge,
} from "../../lib/crm/gardeFouMarge";

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
  modeSousTraitance: "fourniture_pose",
  coutFourniturePoseHt: null,
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
  const analyse = analyserPrestationCatalogue(prestation);
  const marge = analyse.margeHt ?? prestation.margeBruteHt ?? prestation.margeVsBaseHt;
  const taux = analyse.tauxMarge ?? prestation.tauxMarge ?? prestation.tauxMargeVsBase;
  if (marge == null) {
    return <span className="text-amber-200">Tarif à renseigner</span>;
  }
  const couleur = analyse.statut === STATUT_MARGE_PERTE || marge < 0 ? "text-red-300" : "text-emerald-300";
  return (
    <span className={couleur}>
      {formatEuroOuPlaceholder(marge, "—")}{" "}
      <span className="text-slate-500">({formatTauxMarge(taux)})</span>
      {prestation.prixVenteHt == null && prestation.referenceMarche ? (
        <span className="ml-1 text-[10px] uppercase tracking-wide text-sky-300">vs médian marché 2026</span>
      ) : null}
    </span>
  );
}

function BlocTarifMarche({ reference }: { reference: ReferenceMarche }) {
  return (
    <div className="space-y-1 text-[11px] leading-relaxed text-sky-100">
      <p className="font-semibold uppercase tracking-wide text-sky-300">
        {MENTIONS_AFFICHAGE_MARCHE[0]}
      </p>
      <p>
        {MENTIONS_AFFICHAGE_MARCHE[1]} : {formatFourchetteMarcheTtc(
          reference.priceMinTTC,
          reference.priceMedianTTC,
          reference.priceMaxTTC,
        )}{" "}
        TTC / {reference.unit}
      </p>
      <p>
        {MENTIONS_AFFICHAGE_MARCHE[2]} : {reference.priceMedianTTC.toLocaleString("fr-FR")} € TTC
        {" · "}
        {reference.priceMedianHT.toLocaleString("fr-FR")} € HT
      </p>
      <p className="text-amber-200">
        {MENTIONS_AFFICHAGE_MARCHE[3]} · {MENTIONS_AFFICHAGE_MARCHE[4]} · {MENTIONS_AFFICHAGE_MARCHE[5]}
      </p>
    </div>
  );
}

type FiltreTypePrix = "" | BadgeStatutTarif;

function classesBadge(badge: BadgeStatutTarif): string {
  if (badge === "tarif_ferme") return "border-emerald-400/40 bg-emerald-500/15 text-emerald-100";
  if (badge === "reperes_marche") return "border-sky-400/40 bg-sky-500/15 text-sky-100";
  if (badge === "a_recalibrer") return "border-orange-400/40 bg-orange-500/15 text-orange-100";
  return "border-amber-400/40 bg-amber-500/15 text-amber-100";
}

function BadgeStatutTarifAffiche({ prestation }: { prestation: PrestationCalculee }) {
  const badge = badgeStatutTarif(prestation);
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${classesBadge(badge)}`}
    >
      {LIBELLES_BADGE_STATUT[badge]}
    </span>
  );
}

function libelleFourniturePose(prestation: PrestationCalculee): { fourniture: string; pose: string } {
  const mode = prestation.referenceMarche?.supplyMode;
  if (mode === "fourniture") return { fourniture: "Oui", pose: "Non" };
  if (mode === "pose") return { fourniture: "Non", pose: "Oui" };
  if (mode === "fourniture_pose") return { fourniture: "Oui", pose: "Oui" };
  return { fourniture: "—", pose: "—" };
}

type CatalogueMetiersProps = {
  voirMargesInternes?: boolean;
  peutModifier?: boolean;
  role?: string;
};

export default function CatalogueMetiers({
  voirMargesInternes = true,
  peutModifier = true,
  role = "administrateur",
}: CatalogueMetiersProps) {
  const [tick, setTick] = useState(0);
  const [categorieId, setCategorieId] = useState("");
  const [sousCategorieId, setSousCategorieId] = useState("");
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<StatutCatalogue | "">("");
  const [filtreTypePrix, setFiltreTypePrix] = useState<FiltreTypePrix>("");
  const [filtreCoordinationMohamed, setFiltreCoordinationMohamed] = useState(false);
  const [triMarge, setTriMarge] = useState<TriMarge>("aucun");
  const [inclureInactifs, setInclureInactifs] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [ficheCategorie, setFicheCategorie] = useState<CategorieMetier | null>(null);
  const [ficheStrategieCode, setFicheStrategieCode] = useState<string | null>(null);
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
      if (!prestationVisiblePourRole(item, role)) return false;
      if (!inclureInactifs && !item.actif) return false;
      if (categorieId && item.categorieId !== categorieId) return false;
      if (sousCategorieId && item.sousCategorieId !== sousCategorieId) return false;
      if (filtreCoordinationMohamed && !estCategorieCoordonneeParMohamed(item.categorieId)) return false;
      if (filtreStatut && item.statut !== filtreStatut) return false;
      if (filtreTypePrix && badgeStatutTarif(item) !== filtreTypePrix) return false;
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
    filtreCoordinationMohamed,
    filtreStatut,
    filtreTypePrix,
    recherche,
    triMarge,
    inclureInactifs,
    role,
  ]);

  const categoriesAffichees = useMemo(() => {
    if (!filtreCoordinationMohamed) return CATEGORIES_METIERS;
    return CATEGORIES_METIERS.filter((item) => CATEGORIES_COORDINATION_MOHAMED.includes(item.id));
  }, [filtreCoordinationMohamed]);

  const compteursCategorie = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of prestations) {
      if (!item.actif && !inclureInactifs) continue;
      map.set(item.categorieId, (map.get(item.categorieId) ?? 0) + 1);
    }
    return map;
  }, [prestations, inclureInactifs]);

  const rentabiliteFiltre = useMemo(
    () => (voirMargesInternes ? analyserCatalogue(listeFiltree) : null),
    [listeFiltree, voirMargesInternes],
  );

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

  function securiserMargePrestation(item: PrestationCalculee) {
    const analyse = analyserPrestationCatalogue(item);
    if (analyse.prixPlancher15Ht == null) return;
    const resultat = enregistrerPrestationCatalogue({
      ...item,
      prixVenteHt: analyse.prixPlancher15Ht,
    });
    setMessage(
      resultat.erreur ??
        `Prix de vente calé au plancher 15 % (${formatEuroOuPlaceholder(analyse.prixPlancher15Ht, "—")} HT).`,
    );
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
        <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-medium leading-relaxed text-amber-50">
          {AVERTISSEMENT_CATALOGUE_ADMIN}
        </p>
        <p className="mt-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm leading-relaxed text-sky-100">
          {AVERTISSEMENT_TARIF_MARCHE} {MENTIONS_AFFICHAGE_MARCHE.join(" · ")}
        </p>
        <dl className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
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
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Devis fermes renseignés</dt>
            <dd className="text-lg font-semibold text-white">
              {diagnostic.avecTarif}
              <span className="ml-1 text-xs font-normal text-slate-500">
                / {diagnostic.sansTarif} à confirmer
              </span>
            </dd>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Repères marché 2026</dt>
            <dd className="text-lg font-semibold text-white">{diagnostic.avecReferenceMarche}</dd>
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
          Type de tarif
          <select
            value={filtreTypePrix}
            onChange={(event) => setFiltreTypePrix(event.target.value as FiltreTypePrix)}
            className={inputClass}
          >
            <option value="">Tous</option>
            <option value="tarif_ferme">Tarif ferme</option>
            <option value="reperes_marche">Repère marché</option>
            <option value="a_confirmer">À confirmer</option>
            <option value="a_recalibrer">À recalibrer localement</option>
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
        {voirMargesInternes ? (
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
        ) : null}
        <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={inclureInactifs}
            onChange={(event) => setInclureInactifs(event.target.checked)}
          />
          Inclure désactivées
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
          <input
            type="checkbox"
            checked={filtreCoordinationMohamed}
            onChange={(event) => setFiltreCoordinationMohamed(event.target.checked)}
          />
          Corps d’état Mohamed ({CATEGORIES_COORDINATION_MOHAMED.length})
        </label>
        {peutModifier ? (
        <button
          type="button"
          onClick={() => ouvrirAjout()}
          className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Ajouter une prestation
        </button>
        ) : (
          <p className="rounded-xl border border-slate-800 px-3 py-2 text-xs text-slate-400">
            Lecture seule — les tarifs fermes ne sont pas modifiables.
          </p>
        )}
      </div>

      {!categorieId ? (
        <section>
          <div className="relative mb-5 overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-slate-950 via-emerald-950/40 to-slate-900 p-5 shadow-[0_0_40px_rgba(16,185,129,0.12)]">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 12% 20%, rgba(52,211,153,0.35), transparent 40%), radial-gradient(circle at 88% 10%, rgba(56,189,248,0.2), transparent 35%)",
              }}
            />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                {COORDINATION_NATIONALE.drapeau} Coordination Nationale
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {COORDINATION_NATIONALE.titre}
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
                {COORDINATION_NATIONALE.role}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Responsable</p>
                  <p className="text-sm font-semibold text-white">{COORDINATION_NATIONALE.responsable}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Contact direct</p>
                  <p className="text-sm font-semibold text-emerald-200">
                    {COORDINATION_NATIONALE.telephone}
                  </p>
                </div>
                <a
                  href={`tel:${COORDINATION_NATIONALE.telephoneTel}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/25"
                >
                  📞 Appeler
                </a>
                <a
                  href={COORDINATION_NATIONALE.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 py-2 text-xs font-semibold text-sky-100 hover:bg-sky-500/25"
                >
                  <span aria-hidden>💬</span> WhatsApp
                </a>
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-100">
                  {COORDINATION_NATIONALE.badgeReseau}
                </span>
              </div>
              <p className="mt-3 text-xs font-medium text-slate-400">{COORDINATION_NATIONALE.statut}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">
              Fiches techniques stratégiques
            </p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {FICHES_STRATEGIQUES_CEE.filter((fiche) => fiche.image).map((fiche) => (
                <button
                  key={fiche.code}
                  type="button"
                  onClick={() => setFicheStrategieCode(fiche.code)}
                  className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-3 py-3 text-left hover:bg-amber-500/15"
                >
                  <span className="block font-mono text-[10px] font-semibold text-amber-200">{fiche.code}</span>
                  <span className="mt-1 block text-sm font-semibold text-white">{fiche.titre}</span>
                </button>
              ))}
            </div>
          </div>

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Catégories principales
            {filtreCoordinationMohamed ? (
              <span className="ml-2 text-[11px] font-normal normal-case tracking-normal text-emerald-300">
                · filtrées Coordination Mohamed
              </span>
            ) : null}
          </h3>
          <p className="mb-3 text-xs text-slate-500">
            Double mode sous-traitance actif sur tous les corps d’état BTP (hors études, honoraires ENERGIA et cuisines direct usine).
            Ratios marché 2026 pré-remplis — le prix client reste le repère marché / tarif ferme.
            Quatre métiers phares avec grilles RGE :{" "}
            {CATEGORIES_STRATEGIQUES_DOUBLE_MODE.map((g) => g.label).join(" · ")}.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categoriesAffichees.map((categorie) => (
              <div
                key={categorie.id}
                role="button"
                tabIndex={0}
                onClick={() => setFicheCategorie(categorie)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setFicheCategorie(categorie);
                  }
                }}
                className={`flex cursor-pointer flex-col rounded-2xl border bg-slate-900/80 p-4 text-left transition hover:border-emerald-500/40 ${
                  estCategorieDoubleMode(categorie.id)
                    ? "border-emerald-500/40 ring-1 ring-emerald-500/20"
                    : "border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    {String(categorie.ordre).padStart(2, "0")}
                  </p>
                  {estCategorieCoordonneeParMohamed(categorie.id) ? (
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
                      {COORDINATION_NATIONALE.badgeReseau}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 font-medium text-white">{categorie.nom}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {sousCategoriesDe(categorie.id).length} sous-catégories ·{" "}
                  {compteursCategorie.get(categorie.id) ?? 0}{" "}
                  {(compteursCategorie.get(categorie.id) ?? 0) > 1 ? "prestations" : "prestation"}
                </p>
                {estCategorieCoordonneeParMohamed(categorie.id) ? (
                  <p className="mt-auto pt-3 text-[11px] leading-snug text-slate-300">
                    👷‍♂️ {COORDINATION_NATIONALE.mentionTuile}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setFicheCategorie(categorie);
                    }}
                    className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100 hover:bg-cyan-500/20"
                  >
                    📄 Fiche Référence PDF
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setCategorieId(categorie.id);
                      setSousCategorieId("");
                    }}
                    className="rounded-lg border border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white"
                  >
                    Voir les prestations
                  </button>
                </div>
              </div>
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

          {estCategorieCoordonneeParMohamed(categorieId) ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
              <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
                {COORDINATION_NATIONALE.badgeReseau}
              </span>
              <span>👷‍♂️ {COORDINATION_NATIONALE.mentionTuile}</span>
              <a
                href={`tel:${COORDINATION_NATIONALE.telephoneTel}`}
                className="text-xs font-semibold text-emerald-200 underline-offset-2 hover:underline"
              >
                Appeler
              </a>
              <a
                href={COORDINATION_NATIONALE.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-sky-200 underline-offset-2 hover:underline"
              >
                WhatsApp
              </a>
            </div>
          ) : null}

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
            <table className="min-w-[96rem] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-800 text-[11px] uppercase tracking-wide text-slate-300">
                <tr>
                  <th className="px-3 py-2">Prestation</th>
                  <th className="px-3 py-2">Catégorie</th>
                  <th className="px-3 py-2">Unité</th>
                  <th className="px-3 py-2">Prix HT</th>
                  <th className="px-3 py-2">Prix TTC</th>
                  <th className="px-3 py-2">Fourniture</th>
                  <th className="px-3 py-2">Pose</th>
                  {voirMargesInternes ? (
                    <>
                      <th className="px-3 py-2">Revient ST HT</th>
                      <th className="px-3 py-2">Marge ENERGIA</th>
                    </>
                  ) : null}
                  <th className="px-3 py-2">Complexité</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Statut</th>
                  {peutModifier ? <th className="px-3 py-2">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {listeFiltree.length === 0 ? (
                  <tr>
                    <td colSpan={peutModifier ? (voirMargesInternes ? 14 : 12) : voirMargesInternes ? 13 : 11} className="px-3 py-8 text-center text-slate-500">
                      Aucune prestation dans cette vue.
                    </td>
                  </tr>
                ) : (
                  listeFiltree.map((item) => {
                    const fp = libelleFourniturePose(item);
                    const ref = item.referenceMarche;
                    const analyseLigne = voirMargesInternes ? analyserPrestationCatalogue(item) : null;
                    return (
                    <tr
                      key={item.id}
                      className={`border-t border-slate-800 ${item.actif ? "" : "opacity-60"} ${
                        voirMargesInternes && analyseLigne ? classesLigneMarge(analyseLigne.statut) : ""
                      }`}
                    >
                      <td className="px-3 py-3">
                        <p className="font-medium text-white">{item.nom}</p>
                        <p className="mt-1">
                          <BadgePrioriteTravaux
                            priorite={infererPrioriteTravaux({
                              posteId: item.posteIdLegacy ?? item.id,
                              categorieId: item.categorieId,
                              sousCategorieId: item.sousCategorieId,
                              nom: item.nom,
                              description: item.description,
                              prioriteCatalogue: item.prioriteTravaux,
                            })}
                            compact
                          />
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {getSousCategorieMetier(item.sousCategorieId)?.nom}
                        </p>
                        {item.demo ? (
                          <span className="mt-1 inline-flex rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
                            Données de démonstration
                          </span>
                        ) : null}
                        {estPrestationDoubleMode(item) ? (
                          <div className="mt-2 space-y-1">
                            {peutModifier ? (
                              <ToggleSousTraitance
                                mode={item.modeSousTraitance || MODE_FOURNITURE_POSE}
                                onChange={(mode) => {
                                  const resultat = enregistrerPrestationCatalogue({
                                    ...item,
                                    modeSousTraitance: mode,
                                  });
                                  setMessage(resultat.erreur ?? "Mode sous-traitance enregistré.");
                                  rafraichir();
                                }}
                              />
                            ) : (
                              <p className="text-[11px] text-slate-500">
                                {item.modeSousTraitance === MODE_POSE_SEULE
                                  ? "Pose seule (achat matériel direct)"
                                  : "Fourniture & pose"}
                              </p>
                            )}
                            {voirMargesInternes ? (
                              <BadgeGainMarge
                                montantHt={item.extraMargeAchatDirectHt}
                                visible={item.modeSousTraitance === MODE_POSE_SEULE}
                              />
                            ) : null}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-slate-300">
                        {getCategorieMetier(item.categorieId)?.nom ?? item.categorieId}
                      </td>
                      <td className="px-3 py-3 text-slate-300">{LIBELLES_UNITE[item.unite]}</td>
                      <td className="px-3 py-3 text-slate-200">
                        {ref ? (
                          <span>
                            {ref.priceMinHT.toLocaleString("fr-FR")} – {ref.priceMaxHT.toLocaleString("fr-FR")} €
                          </span>
                        ) : item.prixVenteHt != null ? (
                          formatEuroOuPlaceholder(item.prixVenteHt, "—")
                        ) : (
                          <span className="text-slate-500">À confirmer</span>
                        )}
                        {voirMargesInternes && peutModifier && analyseLigne?.prixPlancher15Ht != null && (
                          analyseLigne.statut === STATUT_MARGE_PERTE ||
                          (analyseLigne.tauxMarge != null && analyseLigne.tauxMarge < 0.15)
                        ) ? (
                          <div className="mt-2">
                            <BoutonSecuriserMarge
                              prixPlancherHt={analyseLigne.prixPlancher15Ht}
                              onClick={() => securiserMargePrestation(item)}
                            />
                          </div>
                        ) : null}
                        {voirMargesInternes && analyseLigne ? (
                          <div className="mt-2">
                            <AlerteMargeLigne analyse={analyseLigne} />
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        {ref ? (
                          <BlocTarifMarche reference={ref} />
                        ) : item.prixVenteTtc != null ? (
                          formatEuroOuPlaceholder(item.prixVenteTtc, "—")
                        ) : (
                          <span className="text-slate-500">Pas de repère marché rattaché</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-300">{fp.fourniture}</td>
                      <td className="px-3 py-3 text-slate-300">{fp.pose}</td>
                      {voirMargesInternes ? (
                        <>
                          <td className="px-3 py-3 text-amber-100">
                            {formatEuroOuPlaceholder(
                              item.modeSousTraitance === MODE_POSE_SEULE
                                ? item.coutRevientHt
                                : item.coutFourniturePoseHt ?? item.coutRevientHt,
                              "—",
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <MargeAffichee prestation={item} />
                          </td>
                        </>
                      ) : null}
                      <td className="px-3 py-3 text-slate-300">{ref?.complexity ?? "—"}</td>
                      <td className="px-3 py-3 text-[11px] text-slate-400">{ref?.sourceName ?? "—"}</td>
                      <td className="px-3 py-3 text-slate-300">{ref?.sourceDate ?? item.dateMiseAJour}</td>
                      <td className="px-3 py-3">
                        <BadgeStatutTarifAffiche prestation={item} />
                        <p className="mt-1 text-[11px] text-slate-500">{LIBELLES_STATUT[item.statut]}</p>
                      </td>
                      {peutModifier ? (
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
                      ) : null}
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {rentabiliteFiltre ? <WidgetRentabiliteDevis analyse={rentabiliteFiltre} /> : null}
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
              {voirMargesInternes ? (
                <>
              {estPrestationDoubleMode(brouillon) ? (
                <div className="sm:col-span-2 space-y-2 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Mode sous-traitance RGE — autoliquidation TVA Art. 283-2 nonies CGI
                  </p>
                  <ToggleSousTraitance
                    mode={brouillon.modeSousTraitance || MODE_FOURNITURE_POSE}
                    onChange={(mode) => setBrouillon((a) => ({ ...a, modeSousTraitance: mode }))}
                  />
                  {brouillon.modeSousTraitance === MODE_POSE_SEULE ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className={labelClass}>
                        Coût Matériel Direct HT
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Prix négocié usine / grossiste"
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
                        Coût Pose Artisan RGE HT
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Main-d’œuvre sous-traitée pure"
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
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      L’artisan facture le forfait complet équipement + pose HT (TVA autoliquidée).
                    </p>
                  )}
                  <BadgeGainMarge
                    montantHt={extraMargePrestation(apercu)}
                    visible={brouillon.modeSousTraitance === MODE_POSE_SEULE}
                  />
                </div>
              ) : null}
              {!(
                brouillon.modeSousTraitance === MODE_POSE_SEULE && estPrestationDoubleMode(brouillon)
              ) ? (
                <>
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
                </>
              ) : null}
              {estPrestationDoubleMode(brouillon) &&
              (brouillon.modeSousTraitance || MODE_FOURNITURE_POSE) === MODE_FOURNITURE_POSE ? (
                <label className={labelClass}>
                  Forfait artisan Fourniture + Pose HT
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Sous-traitance complète autoliquidée"
                    value={champNombre(brouillon.coutFourniturePoseHt)}
                    onChange={(event) =>
                      setBrouillon((a) => ({
                        ...a,
                        coutFourniturePoseHt: nombreDepuisChamp(event.target.value),
                      }))
                    }
                    className={inputClass}
                  />
                </label>
              ) : null}
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
                Priorité DPE (devis client)
                <select
                  value={prioriteTravauxOuDefaut(
                    brouillon.prioriteTravaux ??
                      infererPrioriteTravaux({
                        posteId: brouillon.posteIdLegacy ?? brouillon.id,
                        categorieId: brouillon.categorieId,
                        sousCategorieId: brouillon.sousCategorieId,
                        nom: brouillon.nom,
                        description: brouillon.description,
                        prioriteCatalogue: brouillon.prioriteTravaux,
                      }),
                  )}
                  onChange={(event) =>
                    setBrouillon((a) => ({
                      ...a,
                      prioriteTravaux: prioriteTravauxOuDefaut(Number(event.target.value)),
                    }))
                  }
                  className={inputClass}
                >
                  {OPTIONS_PRIORITE_TRAVAUX.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
                </>
              ) : null}
            </div>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              {brouillon.referenceMarche ? (
                <div className="mb-3 rounded-lg border border-sky-500/30 bg-sky-500/10 p-3">
                  <BlocTarifMarche reference={brouillon.referenceMarche} />
                  <p className="mt-2 text-[11px] text-slate-400">
                    Source : {brouillon.referenceMarche.sourceName} · consultée le{" "}
                    {brouillon.referenceMarche.sourceDate}
                  </p>
                </div>
              ) : null}
              {voirMargesInternes ? (
                <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-fuchsia-200">
                    Panneau interne administrateur — jamais visible commercial / partenaire
                  </p>
                  <dl className="grid gap-2 text-xs sm:grid-cols-3">
                    <div>
                      <dt className="text-slate-500">Coût interne HT</dt>
                      <dd className="font-semibold text-white">
                        {formatEuroOuPlaceholder(apercu.coutRevientHt, "Non renseigné")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Marge brute HT</dt>
                      <dd className="font-semibold text-white">
                        {formatEuroOuPlaceholder(apercu.margeBruteHt, "—")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Prix de vente interne HT</dt>
                      <dd className="font-semibold text-white">
                        {formatEuroOuPlaceholder(apercu.prixVenteHt, "—")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Coût marché indicatif HT</dt>
                      <dd className="font-semibold text-white">
                        {formatEuroOuPlaceholder(
                          apercu.structurePrixInterne?.coutMarcheIndicatifHt,
                          "—",
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Marge cible ENERGIA</dt>
                      <dd className="font-semibold text-white">
                        {formatEuroOuPlaceholder(
                          apercu.structurePrixInterne?.margeCibleEnergiaHt,
                          "Protégé / vide",
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Prix vente proposé interne</dt>
                      <dd className="font-semibold text-white">
                        {formatEuroOuPlaceholder(
                          apercu.structurePrixInterne?.prixVenteProposeHt,
                          "Protégé / vide",
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : null}
              {voirMargesInternes ? (
                <>
                  <p className="mb-2 mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
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
                    {apercu.modeSousTraitance === MODE_POSE_SEULE ? (
                      <div className="sm:col-span-3">
                        <dt className="text-slate-500">Revient pose seule (matériel direct + pose artisan)</dt>
                        <dd className="font-semibold text-amber-100">
                          {formatEuroOuPlaceholder(apercu.coutRevientHt, "—")}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  {apercu.venteInferieureAuCout ? (
                    <p role="alert" className="mt-2 text-sm font-semibold text-red-300">
                      Prix de vente inférieur au coût de revient
                    </p>
                  ) : null}
                  {voirMargesInternes ? (
                    <div className="mt-3 space-y-2">
                      <AlerteMargeLigne analyse={analyserPrestationCatalogue(apercu)} />
                      {(() => {
                        const a = analyserPrestationCatalogue(apercu);
                        if (
                          a.prixPlancher15Ht == null ||
                          !(a.statut === STATUT_MARGE_PERTE || (a.tauxMarge != null && a.tauxMarge < 0.15))
                        ) {
                          return null;
                        }
                        return (
                          <BoutonSecuriserMarge
                            prixPlancherHt={a.prixPlancher15Ht}
                            onClick={() =>
                              setBrouillon((prev) => ({ ...prev, prixVenteHt: a.prixPlancher15Ht }))
                            }
                          />
                        );
                      })()}
                    </div>
                  ) : null}
                  {!apercu.tarifRenseigne ? (
                    <p className="mt-2 text-xs text-amber-200">
                      Cette fiche n’est pas présentée comme chiffrée tant que le coût et le prix de
                      vente ne sont pas renseignés. La validation est bloquée. Un repère marché
                      n’est pas un devis définitif.
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-xs text-slate-400">
                  Les coûts internes, marges ENERGIA et commissions ne sont pas affichés dans cet
                  espace. Les fourchettes marché restent indicatives et à confirmer par devis.
                </p>
              )}
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
                disabled={!peutModifier}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      ) : null}
      <FicheReferenceModal
        categorie={ficheCategorie}
        onClose={() => setFicheCategorie(null)}
        voirMarges={voirMargesInternes}
        reperes={prestations.map((item) => ({ categorieId: item.categorieId, baseHt: item.baseChiffrageHt }))}
      />
      <FicheStrategieCee
        code={ficheStrategieCode}
        onClose={() => setFicheStrategieCode(null)}
        voirMarges={voirMargesInternes}
      />
    </div>
  );
}
