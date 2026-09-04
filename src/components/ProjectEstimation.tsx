import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CATALOGUE_POSTES,
  TAUX_TVA,
  formatEuro,
  formatPct,
  formatUnite,
  round2,
  type CategoriePoste,
  type DevisClientChiffrage,
  type LigneDevisClientDetail,
  type PosteCatalogue,
  type PosteId,
  type UnitePoste,
} from "../lib/chiffrage";
import tarifsFournisseurs from "../lib/chiffrage/tarifs-fournisseurs.2026.json";
import { isAuditIdValide } from "../lib/auditId";
import { estAuditIdLocal, getEstimationLocale, saveEstimationLocale } from "../lib/estimationLocale";
import {
  kwcDepuisLignePv,
  puissanceKwcDepuisLignes,
  tauxTvaPhotovoltaique,
} from "../lib/calculators/photovoltaique-2026";
import {
  ALERTE_ONDULEUR_CENTRAL,
  analyserPuissancePv,
  architectureDepuisSousCategorie,
  lignesOntArchitecture,
  MENTION_ESTIMATION_PV,
  nombrePanneaux500Wc,
  prixPlancherHt,
  quantiteProposeeDepuisPrestation,
  quantitePvVerrouillee,
} from "../lib/calculators/photovoltaique-installation";
import PhotovoltaiqueBareme2026 from "./PhotovoltaiqueBareme2026";
import ChiffragePhotovoltaiqueAssistant, {
  type BrouillonLignePv,
} from "./chiffrage/ChiffragePhotovoltaiqueAssistant";
import SelecteurPrestationCatalogue from "./crm/SelecteurPrestationCatalogue";
import DevisClientPanel from "./chiffrage/DevisClientChiffrage";
import {
  calculerPrestation,
  categoriePosteDepuisMetier,
  formatEuroOuPlaceholder,
  getPrestationCatalogue,
  getSousCategorieMetier,
  LIBELLES_UNITE,
  prestationParPosteLegacy,
  statutEstimationDepuisCatalogue,
  uniteChiffrageDepuisCatalogue,
  type PrestationCatalogue,
} from "../lib/crm/catalogue";

const TVA_DEFAUT = 0.055;
const TAUX_COMMISSION_DAMIEN = 0.1;
const PRESTATION_CLYVE_HT = {
  photovoltaique: 500,
  renovation_globale: 1100,
  autre: 0,
} as const;

type TypeProjet = "photovoltaique" | "renovation_globale" | "autre";
type StatutPrestation = "estimation" | "devis_demande" | "devis_recu" | "valide";
type SourceCout = "estimation" | "devis_reel";

const TYPES_PROJET: { value: TypeProjet; label: string }[] = [
  { value: "photovoltaique", label: "Photovoltaïque" },
  { value: "renovation_globale", label: "Rénovation globale" },
  { value: "autre", label: "Autre" },
];

const STATUTS_PRESTATION: {
  value: StatutPrestation;
  label: string;
  hint: string;
}[] = [
  { value: "estimation", label: "Estimation", hint: "Chiffrage théorique de départ" },
  { value: "devis_demande", label: "Devis demandé", hint: "En attente du retour de l’artisan" },
  { value: "devis_recu", label: "Devis reçu", hint: "Devis reçu de l’artisan RGE" },
  { value: "valide", label: "Validé", hint: "Validé et contractuel pour le client" },
];

const CATEGORIE_LABEL: Record<CategoriePoste, string> = {
  etude: "Étude",
  enveloppe: "Enveloppe",
  equipement: "Équipement",
  chantier: "Chantier",
  structure: "Structure",
};

type LigneEstimation = {
  id: string;
  posteId: string;
  nom: string;
  categorie: CategoriePoste;
  unite: UnitePoste;
  description: string;
  quantite: number;
  coutMaterielUnitaireHt: number;
  coutMainOeuvreUnitaireHt: number;
  prixVenteUnitaireHt: number;
  tauxTva: number;
  statut: StatutPrestation;
  artisan: string;
  montantDevisReel: number;
  cataloguePrestationId?: string;
  categorieMetierId?: string;
  sousCategorieId?: string;
};

type LigneCalculee = LigneEstimation & {
  totalMaterielHt: number;
  totalMainOeuvreHt: number;
  coutEstimeHt: number;
  coutRevientHt: number;
  sourceCout: SourceCout;
  prixVenteHt: number;
  montantTva: number;
  prixVenteTtc: number;
  margeBruteHt: number;
  tauxMarge: number;
};

type RecapEstimation = {
  totalMaterielHt: number;
  totalArtisansHt: number;
  totalCoutRevientHt: number;
  totalVenteHt: number;
  totalTva: number;
  totalVenteTtc: number;
  margeBruteTotale: number;
  tauxMargeGlobal: number;
  commissionDamienHt: number;
  prestationClyveHt: number;
  margeEstimeeApresFraisHt: number;
  totalEstimeTheoriqueHt: number;
  totalDevisRecusHt: number;
  totalContractuelValideTtc: number;
  aDesDevisReels: boolean;
};

type FormulaireLigne = {
  posteId: string;
  cataloguePrestationId: string;
  categorieMetierId: string;
  sousCategorieId: string;
  quantite: number;
  coutMaterielUnitaireHt: number;
  coutMainOeuvreUnitaireHt: number;
  prixVenteUnitaireHt: number;
  tauxTvaPct: number;
  statut: StatutPrestation;
  artisan: string;
  montantDevisReel: number;
};

const FORMULAIRE_VIDE: FormulaireLigne = {
  posteId: "",
  cataloguePrestationId: "",
  categorieMetierId: "",
  sousCategorieId: "",
  quantite: 1,
  coutMaterielUnitaireHt: 0,
  coutMainOeuvreUnitaireHt: 0,
  prixVenteUnitaireHt: 0,
  tauxTvaPct: TVA_DEFAUT * 100,
  statut: "estimation",
  artisan: "",
  montantDevisReel: 0,
};

function nouveauId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ligne-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function prixIndicatifCatalogue(posteId: PosteId): number | null {
  const tarif = (
    tarifsFournisseurs.postes as Record<string, { coutEntrantUnitaireHt: number | null }>
  )[posteId];
  return tarif?.coutEntrantUnitaireHt ?? null;
}

const POSTES_ISOLATION_CHAUFFAGE: ReadonlySet<PosteId> = new Set([
  "isolation_combles",
  "isolation_rampants",
  "ite",
  "iti",
  "isolation_planchers",
  "pac_air_eau",
  "pac_air_air",
  "ballon_thermodynamique",
]);

function detecteIsolationOuChauffage(lignes: { posteId: string }[]): boolean {
  return lignes.some((ligne) => isPosteId(ligne.posteId) && POSTES_ISOLATION_CHAUFFAGE.has(ligne.posteId));
}

function typeProjetClyveConfirme(type: TypeProjet): boolean {
  return type === "photovoltaique" || type === "renovation_globale";
}

function utiliseDevisReel(statut: StatutPrestation): boolean {
  return statut === "devis_recu" || statut === "valide";
}

function isStatutPrestation(value: string): value is StatutPrestation {
  return STATUTS_PRESTATION.some((item) => item.value === value);
}

function labelStatut(statut: StatutPrestation): string {
  return STATUTS_PRESTATION.find((item) => item.value === statut)?.label ?? "Estimation";
}

function calculerLigne(ligne: LigneEstimation): LigneCalculee {
  const totalMaterielHt = round2(ligne.quantite * ligne.coutMaterielUnitaireHt);
  const totalMainOeuvreHt = round2(ligne.quantite * ligne.coutMainOeuvreUnitaireHt);
  const coutEstimeHt = round2(totalMaterielHt + totalMainOeuvreHt);
  const sourceCout: SourceCout = utiliseDevisReel(ligne.statut) ? "devis_reel" : "estimation";
  const coutRevientHt = sourceCout === "devis_reel" ? round2(ligne.montantDevisReel) : coutEstimeHt;
  const prixVenteHt = round2(ligne.quantite * ligne.prixVenteUnitaireHt);
  const montantTva = round2(prixVenteHt * ligne.tauxTva);
  const prixVenteTtc = round2(prixVenteHt + montantTva);
  const margeBruteHt = round2(prixVenteHt - coutRevientHt);
  const tauxMarge = prixVenteHt > 0 ? margeBruteHt / prixVenteHt : 0;
  return {
    ...ligne,
    totalMaterielHt,
    totalMainOeuvreHt,
    coutEstimeHt,
    coutRevientHt,
    sourceCout,
    prixVenteHt,
    montantTva,
    prixVenteTtc,
    margeBruteHt,
    tauxMarge,
  };
}

function calculerRecap(lignes: LigneCalculee[], typeProjet: TypeProjet): RecapEstimation {
  const totalMaterielHt = round2(lignes.reduce((s, l) => s + l.totalMaterielHt, 0));
  const totalArtisansHt = round2(lignes.reduce((s, l) => s + l.totalMainOeuvreHt, 0));
  const totalCoutRevientHt = round2(lignes.reduce((s, l) => s + l.coutRevientHt, 0));
  const totalVenteHt = round2(lignes.reduce((s, l) => s + l.prixVenteHt, 0));
  const totalTva = round2(lignes.reduce((s, l) => s + l.montantTva, 0));
  const totalVenteTtc = round2(totalVenteHt + totalTva);
  const margeBruteTotale = round2(totalVenteHt - totalCoutRevientHt);
  const tauxMargeGlobal = totalVenteHt > 0 ? margeBruteTotale / totalVenteHt : 0;
  const commissionDamienHt = round2(totalVenteHt * TAUX_COMMISSION_DAMIEN);
  const prestationClyveHt = PRESTATION_CLYVE_HT[typeProjet];
  const margeEstimeeApresFraisHt = round2(
    margeBruteTotale - commissionDamienHt - prestationClyveHt,
  );
  const totalEstimeTheoriqueHt = round2(lignes.reduce((s, l) => s + l.coutEstimeHt, 0));
  const totalDevisRecusHt = round2(
    lignes
      .filter((l) => utiliseDevisReel(l.statut))
      .reduce((s, l) => s + round2(l.montantDevisReel), 0),
  );
  const totalContractuelValideTtc = round2(
    lignes.filter((l) => l.statut === "valide").reduce((s, l) => s + l.prixVenteTtc, 0),
  );
  const aDesDevisReels = lignes.some((l) => utiliseDevisReel(l.statut));
  return {
    totalMaterielHt,
    totalArtisansHt,
    totalCoutRevientHt,
    totalVenteHt,
    totalTva,
    totalVenteTtc,
    margeBruteTotale,
    tauxMargeGlobal,
    commissionDamienHt,
    prestationClyveHt,
    margeEstimeeApresFraisHt,
    totalEstimeTheoriqueHt,
    totalDevisRecusHt,
    totalContractuelValideTtc,
    aDesDevisReels,
  };
}

function serialiserLigneJson(ligne: LigneEstimation) {
  return {
    id: ligne.id,
    posteId: ligne.posteId,
    nom: ligne.nom,
    categorie: ligne.categorie,
    unite: ligne.unite,
    description: ligne.description,
    quantite: ligne.quantite,
    coutMaterielUnitaireHt: ligne.coutMaterielUnitaireHt,
    coutMainOeuvreUnitaireHt: ligne.coutMainOeuvreUnitaireHt,
    prixVenteUnitaireHt: ligne.prixVenteUnitaireHt,
    tauxTva: ligne.tauxTva,
    statut: ligne.statut,
    artisan: ligne.artisan,
    montantDevisReel: ligne.montantDevisReel,
    montant_devis_reel: ligne.montantDevisReel,
    cataloguePrestationId: ligne.cataloguePrestationId ?? "",
    categorieMetierId: ligne.categorieMetierId ?? "",
    sousCategorieId: ligne.sousCategorieId ?? "",
  };
}

function resoudrePrestationCatalogue(
  posteId: string,
  cataloguePrestationId?: string,
): PrestationCatalogue | undefined {
  if (cataloguePrestationId) {
    const directe = getPrestationCatalogue(cataloguePrestationId);
    if (directe) return directe;
  }
  const parId = getPrestationCatalogue(posteId);
  if (parId) return parId;
  if (isPosteId(posteId)) return prestationParPosteLegacy(posteId);
  return undefined;
}

function kwcDepuisFormulaire(form: FormulaireLigne, quantite = form.quantite): number {
  const catalogue = resoudrePrestationCatalogue(form.posteId, form.cataloguePrestationId);
  return kwcDepuisLignePv({
    posteId: form.posteId,
    unite: catalogue?.unite,
    nom: catalogue?.nom,
    quantite,
  });
}

function ligneDepuisFormulaire(form: FormulaireLigne, existante?: LigneEstimation): LigneEstimation | null {
  const catalogue = resoudrePrestationCatalogue(form.posteId, form.cataloguePrestationId);
  const poste = isPosteId(form.posteId)
    ? CATALOGUE_POSTES.find((item) => item.id === form.posteId)
    : undefined;
  if (!catalogue && !poste) return null;
  const posteId =
    catalogue?.posteIdLegacy && isPosteId(catalogue.posteIdLegacy)
      ? catalogue.posteIdLegacy
      : poste?.id ?? catalogue?.id ?? form.posteId;
  return {
    id: existante?.id ?? nouveauId(),
    posteId,
    nom: catalogue?.nom ?? poste?.nom ?? existante?.nom ?? "",
    categorie: catalogue
      ? categoriePosteDepuisMetier(catalogue.categorieId)
      : (poste?.categorie ?? "chantier"),
    unite: catalogue ? uniteChiffrageDepuisCatalogue(catalogue.unite) : (poste?.unite ?? "forfait"),
    description: catalogue?.description ?? poste?.description ?? existante?.description ?? "",
    quantite: form.quantite,
    coutMaterielUnitaireHt: form.coutMaterielUnitaireHt,
    coutMainOeuvreUnitaireHt: form.coutMainOeuvreUnitaireHt,
    prixVenteUnitaireHt: form.prixVenteUnitaireHt,
    tauxTva: form.tauxTvaPct / 100,
    statut: form.statut,
    artisan: form.artisan.trim(),
    montantDevisReel: utiliseDevisReel(form.statut) ? form.montantDevisReel : 0,
    cataloguePrestationId: catalogue?.id ?? form.cataloguePrestationId,
    categorieMetierId: catalogue?.categorieId ?? form.categorieMetierId,
    sousCategorieId: catalogue?.sousCategorieId ?? form.sousCategorieId,
  };
}

function formulaireDepuisLigne(ligne: LigneEstimation): FormulaireLigne {
  const catalogue = resoudrePrestationCatalogue(ligne.posteId, ligne.cataloguePrestationId);
  return {
    posteId: ligne.posteId,
    cataloguePrestationId: catalogue?.id ?? ligne.cataloguePrestationId ?? "",
    categorieMetierId: ligne.categorieMetierId ?? catalogue?.categorieId ?? "",
    sousCategorieId: ligne.sousCategorieId ?? catalogue?.sousCategorieId ?? "",
    quantite: ligne.quantite,
    coutMaterielUnitaireHt: ligne.coutMaterielUnitaireHt,
    coutMainOeuvreUnitaireHt: ligne.coutMainOeuvreUnitaireHt,
    prixVenteUnitaireHt: ligne.prixVenteUnitaireHt,
    tauxTvaPct: round2(ligne.tauxTva * 100),
    statut: ligne.statut,
    artisan: ligne.artisan,
    montantDevisReel: ligne.montantDevisReel,
  };
}

function isPosteId(value: string): value is PosteId {
  return CATALOGUE_POSTES.some((poste) => poste.id === value);
}

function isCategoriePoste(value: string): value is CategoriePoste {
  return value in CATEGORIE_LABEL;
}

function isUnitePoste(value: string): value is UnitePoste {
  return (
    value === "forfait" ||
    value === "m2" ||
    value === "ml" ||
    value === "unite" ||
    value === "kWc" ||
    value === "panneau"
  );
}

function hydraterLigne(raw: {
  id: string;
  posteId: string;
  nom: string;
  categorie: string;
  unite: string;
  description: string;
  quantite: number;
  coutMaterielUnitaireHt: number;
  coutMainOeuvreUnitaireHt: number;
  prixVenteUnitaireHt: number;
  tauxTva: number;
  statut?: string;
  artisan?: string;
  montantDevisReel?: number;
  montant_devis_reel?: number;
  cataloguePrestationId?: string;
  categorieMetierId?: string;
  sousCategorieId?: string;
}): LigneEstimation | null {
  const catalogue = resoudrePrestationCatalogue(raw.posteId, raw.cataloguePrestationId);
  const poste = isPosteId(raw.posteId)
    ? CATALOGUE_POSTES.find((item) => item.id === raw.posteId)
    : undefined;
  if (!poste && !catalogue && !raw.nom) return null;
  const montantDevisReel = raw.montantDevisReel ?? raw.montant_devis_reel ?? 0;
  const posteId =
    poste?.id ??
    (catalogue?.posteIdLegacy && isPosteId(catalogue.posteIdLegacy)
      ? catalogue.posteIdLegacy
      : raw.posteId);
  return {
    id: raw.id || nouveauId(),
    posteId,
    nom: raw.nom || catalogue?.nom || poste?.nom || "",
    categorie: isCategoriePoste(raw.categorie)
      ? raw.categorie
      : catalogue
        ? categoriePosteDepuisMetier(catalogue.categorieId)
        : (poste?.categorie ?? "chantier"),
    unite: isUnitePoste(raw.unite)
      ? raw.unite
      : catalogue
        ? uniteChiffrageDepuisCatalogue(catalogue.unite)
        : (poste?.unite ?? "forfait"),
    description: raw.description || catalogue?.description || poste?.description || "",
    quantite: raw.quantite,
    coutMaterielUnitaireHt: raw.coutMaterielUnitaireHt,
    coutMainOeuvreUnitaireHt: raw.coutMainOeuvreUnitaireHt,
    prixVenteUnitaireHt: raw.prixVenteUnitaireHt,
    tauxTva: raw.tauxTva,
    statut: raw.statut && isStatutPrestation(raw.statut) ? raw.statut : "estimation",
    artisan: raw.artisan?.trim() ?? "",
    montantDevisReel: Number.isFinite(montantDevisReel) ? montantDevisReel : 0,
    cataloguePrestationId: raw.cataloguePrestationId || undefined,
    categorieMetierId: raw.categorieMetierId || undefined,
    sousCategorieId: raw.sousCategorieId || undefined,
  };
}

type ProjectEstimationProps = {
  auditId: string;
  clientNom?: string;
  clientAdresse?: string;
  numeroDevis?: string;
  /** Réservé administrateur : coûts, marge, Clyve, commission, prix plancher. */
  voirCoutsInternes?: boolean;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none";

const labelClass = "block text-xs font-medium uppercase tracking-wide text-slate-400";

function NumberField({
  id,
  label,
  value,
  onChange,
  step = 0.01,
  min = 0,
  suffix,
  disabled = false,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label className={labelClass} htmlFor={id}>
      {label}
      <span className="relative mt-1 block">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          disabled={disabled}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            onChange(Number.isFinite(parsed) ? parsed : 0);
          }}
          className={`${inputClass} ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-500">
            {suffix}
          </span>
        ) : null}
      </span>
      {hint ? <span className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-slate-500">{hint}</span> : null}
    </label>
  );
}

function statutBadgeClass(statut: StatutPrestation): string {
  if (statut === "devis_demande") return "border-orange-500/50 bg-orange-500/15 text-orange-200";
  if (statut === "devis_recu") return "border-sky-500/50 bg-sky-500/15 text-sky-200";
  if (statut === "valide") return "border-emerald-500/50 bg-emerald-500/15 text-emerald-200";
  return "border-slate-500/50 bg-slate-500/15 text-slate-300";
}

function StatutBadge({ statut }: { statut: StatutPrestation }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statutBadgeClass(statut)}`}
    >
      {labelStatut(statut)}
    </span>
  );
}

function SourceCoutBadge({ source }: { source: SourceCout }) {
  if (source === "devis_reel") {
    return (
      <span className="inline-flex items-center rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-200">
        Devis réel
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      Estimation
    </span>
  );
}

function RecapCard({
  label,
  value,
  hint,
  note,
  emphasize,
  danger,
}: {
  label: string;
  value: string;
  hint?: string;
  note?: string;
  emphasize?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 ${
        danger
          ? "border-red-500/50 bg-red-500/15"
          : emphasize
            ? "border-emerald-500/40 bg-emerald-500/10"
            : "border-slate-800 bg-slate-950/80"
      }`}
    >
      <p className={`text-[11px] font-medium uppercase tracking-wide ${danger ? "text-red-300" : "text-slate-400"}`}>
        {label}
      </p>
      {hint ? (
        <p className={`mt-0.5 text-[11px] ${danger ? "text-red-200/80" : "text-slate-500"}`}>{hint}</p>
      ) : null}
      <p
        className={`mt-1 text-sm font-semibold sm:text-base ${
          danger ? "text-red-300" : emphasize ? "text-emerald-300" : "text-white"
        }`}
      >
        {value}
      </p>
      {note ? (
        <p className="mt-1.5 text-[11px] leading-snug text-sky-300/90">{note}</p>
      ) : null}
    </div>
  );
}

function DetailPrestationCrm({
  prestation,
  voirCoutsInternes,
}: {
  prestation: PrestationCatalogue;
  voirCoutsInternes: boolean;
}) {
  const calculee = calculerPrestation(prestation);
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">
      {prestation.demo ? (
        <p className="mb-2 inline-flex rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
          Données de démonstration
        </p>
      ) : null}
      <dl className="grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Nom</dt>
          <dd className="font-medium text-white">{prestation.nom}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Unité</dt>
          <dd>{LIBELLES_UNITE[prestation.unite]}</dd>
        </div>
        {voirCoutsInternes ? (
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Coût de revient HT</dt>
            <dd>
              {calculee.coutRevientHt == null
                ? "Prix artisan à confirmer"
                : formatEuroOuPlaceholder(calculee.coutRevientHt, "Tarif à renseigner")}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Prix de vente HT</dt>
          <dd>
            {calculee.prixVenteHt == null
              ? "Prix de vente à définir"
              : formatEuroOuPlaceholder(calculee.prixVenteHt, "Tarif à renseigner")}
          </dd>
        </div>
        {prestation.description ? (
          <div className="sm:col-span-2">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Description</dt>
            <dd className="text-slate-300">{prestation.description}</dd>
          </div>
        ) : null}
      </dl>
      {!calculee.tarifRenseigne ? (
        <p className="mt-2 text-xs text-amber-200">
          Tarif à renseigner — cette prestation n’est pas présentée comme chiffrée.
        </p>
      ) : prestation.statut === "estimation" ? (
        <p className="mt-2 text-xs text-amber-200">{MENTION_ESTIMATION_PV}</p>
      ) : null}
    </div>
  );
}

function DetailCatalogue({ poste }: { poste: PosteCatalogue }) {
  const prix = prixIndicatifCatalogue(poste.id);
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">
      <dl className="grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Nom</dt>
          <dd className="font-medium text-white">{poste.nom}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Catégorie</dt>
          <dd>{CATEGORIE_LABEL[poste.categorie]}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Unité</dt>
          <dd>{formatUnite(poste.unite)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Prix indicatif</dt>
          <dd>
            {prix == null
              ? "Tarif à renseigner"
              : `${formatEuro(prix)} HT / ${formatUnite(poste.unite)}`}
          </dd>
        </div>
        {poste.description ? (
          <div className="sm:col-span-2">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500">Description</dt>
            <dd className="text-slate-300">{poste.description}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

function CalcsPreview({
  ligne,
  voirCoutsInternes,
}: {
  ligne: LigneCalculee;
  voirCoutsInternes: boolean;
}) {
  const plancher = prixPlancherHt(ligne.coutRevientHt);
  return (
    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
      {voirCoutsInternes ? (
        <>
          <p className="text-slate-400">
            Matériel HT
            <span className="mt-0.5 block font-semibold text-white">{formatEuro(ligne.totalMaterielHt)}</span>
          </p>
          <p className="text-slate-400">
            Main-d’œuvre HT
            <span className="mt-0.5 block font-semibold text-white">{formatEuro(ligne.totalMainOeuvreHt)}</span>
          </p>
          <p className="text-slate-400">
            Estimation théorique HT
            <span className="mt-0.5 block font-semibold text-slate-200">{formatEuro(ligne.coutEstimeHt)}</span>
          </p>
          <p className="text-slate-400">
            Coût de revient HT
            <span className="mt-0.5 block font-semibold text-white">{formatEuro(ligne.coutRevientHt)}</span>
            <span className="mt-1 block">
              <SourceCoutBadge source={ligne.sourceCout} />
            </span>
          </p>
        </>
      ) : null}
      <p className="text-slate-400">
        Vente HT
        <span className="mt-0.5 block font-semibold text-white">{formatEuro(ligne.prixVenteHt)}</span>
      </p>
      <p className="text-slate-400">
        TVA
        <span className="mt-0.5 block font-semibold text-white">{formatEuro(ligne.montantTva)}</span>
      </p>
      <p className="text-slate-400">
        Vente TTC
        <span className="mt-0.5 block font-semibold text-emerald-300">{formatEuro(ligne.prixVenteTtc)}</span>
      </p>
      {voirCoutsInternes ? (
        <>
          <p className="text-slate-400">
            Marge brute HT
            <span
              className={`mt-0.5 block font-semibold ${
                ligne.margeBruteHt < 0 ? "text-red-300" : "text-emerald-300"
              }`}
            >
              {formatEuro(ligne.margeBruteHt)}
            </span>
          </p>
          <p className="text-slate-400">
            Taux de marge
            <span className="mt-0.5 block font-semibold text-white">{formatPct(ligne.tauxMarge)}</span>
          </p>
          <p className="text-slate-400">
            Prix plancher HT
            <span className="mt-0.5 block font-semibold text-white">{formatEuro(plancher)}</span>
          </p>
        </>
      ) : null}
    </div>
  );
}

export default function ProjectEstimation({
  auditId,
  clientNom = "",
  clientAdresse = "",
  numeroDevis,
  voirCoutsInternes = true,
}: ProjectEstimationProps) {
  const [lignes, setLignes] = useState<LigneEstimation[]>([]);
  const [typeProjet, setTypeProjet] = useState<TypeProjet>("autre");
  const [typeProjetConfirme, setTypeProjetConfirme] = useState(false);
  const [estimationId, setEstimationId] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
  const [messagePersistance, setMessagePersistance] = useState<{
    type: "success" | "error";
    texte: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [form, setForm] = useState<FormulaireLigne>(FORMULAIRE_VIDE);
  const [erreur, setErreur] = useState<string | null>(null);
  const [confirmerZero, setConfirmerZero] = useState(false);
  const auditIdValide = isAuditIdValide(auditId);

  const prestationCatalogue = resoudrePrestationCatalogue(
    form.posteId,
    form.cataloguePrestationId,
  );
  const posteSelectionne = isPosteId(form.posteId)
    ? (CATALOGUE_POSTES.find((item) => item.id === form.posteId) ?? null)
    : null;
  const ligneBrouillon = ligneDepuisFormulaire(form);
  const calcsBrouillon = ligneBrouillon ? calculerLigne(ligneBrouillon) : null;
  const lignesCalculees = useMemo(() => lignes.map(calculerLigne), [lignes]);
  const recap = useMemo(
    () => calculerRecap(lignesCalculees, typeProjet),
    [lignesCalculees, typeProjet],
  );
  const devisClient = useMemo((): DevisClientChiffrage => {
    const lignesDetaillees: LigneDevisClientDetail[] = lignesCalculees
      .filter((ligne) => ligne.prixVenteHt > 0)
      .map((ligne) => ({
        id: ligne.id,
        designation: ligne.nom,
        quantite: ligne.quantite,
        unite: ligne.unite,
        prixUnitaireHt: ligne.prixVenteUnitaireHt,
        montantHt: ligne.prixVenteHt,
        tauxTva: ligne.tauxTva,
        montantTva: ligne.montantTva,
        montantTtc: ligne.prixVenteTtc,
      }));
    return {
      lignes: lignesDetaillees.map((ligne) => ({
        id: ligne.id,
        libelle: ligne.designation,
        montantHt: ligne.montantHt,
      })),
      lignesDetaillees,
      totalHt: recap.totalVenteHt,
      totalTva: recap.totalTva,
      totalTtc: recap.totalVenteTtc,
    };
  }, [lignesCalculees, recap.totalTva, recap.totalVenteHt, recap.totalVenteTtc]);
  const puissancePvKwc = useMemo(
    () => puissanceKwcDepuisLignes(lignes),
    [lignes],
  );
  const analysePv = useMemo(() => analyserPuissancePv(puissancePvKwc), [puissancePvKwc]);
  const nPanneauxProjet = analysePv.ok ? analysePv.nombrePanneaux : 0;
  const verrouQuantite = prestationCatalogue
    ? quantitePvVerrouillee(prestationCatalogue, nPanneauxProjet)
    : { verrouillee: false, quantite: form.quantite, motif: null };
  const typeProjetAConfirmer = !typeProjetConfirme || !typeProjetClyveConfirme(typeProjet);

  useEffect(() => {
    if (typeProjetConfirme) return;
    if (puissancePvKwc > 0 && typeProjet === "autre") {
      setTypeProjet("photovoltaique");
      return;
    }
    if (typeProjet !== "autre") return;
    if (!detecteIsolationOuChauffage(lignes)) return;
    setTypeProjet("renovation_globale");
  }, [lignes, puissancePvKwc, typeProjet, typeProjetConfirme]);

  useEffect(() => {
    if (!auditIdValide) {
      setEstimationId(null);
      setTypeProjetConfirme(false);
      setChargement(false);
      return;
    }

    let annule = false;
    setChargement(true);
    setMessagePersistance(null);

    const appliquer = (result: {
      data: {
        id: string;
        auditId: string;
        typeProjet: TypeProjet;
        lignes: Array<Parameters<typeof hydraterLigne>[0]>;
      } | null;
      error: string | null;
    }) => {
      if (annule) return;
      setChargement(false);
      if (result.error) {
        setMessagePersistance({ type: "error", texte: result.error });
        return;
      }
      if (!result.data) {
        setEstimationId(null);
        return;
      }
      if (result.data.auditId.trim().toLowerCase() !== auditId.trim().toLowerCase()) {
        setEstimationId(null);
        setMessagePersistance({
          type: "error",
          texte:
            "L’estimation chargée ne correspond pas à cet audit. Aucune donnée n’a été appliquée.",
        });
        return;
      }
      setEstimationId(result.data.id);
      setTypeProjet(result.data.typeProjet);
      setTypeProjetConfirme(typeProjetClyveConfirme(result.data.typeProjet));
      setLignes(
        result.data.lignes.map(hydraterLigne).filter((ligne): ligne is LigneEstimation => ligne !== null),
      );
    };

    if (estAuditIdLocal(auditId)) {
      const locale = getEstimationLocale(auditId);
      appliquer({
        data: locale.data
          ? {
              id: locale.data.id,
              auditId: locale.data.auditId,
              typeProjet: locale.data.typeProjet,
              lignes: locale.data.lignes as Array<Parameters<typeof hydraterLigne>[0]>,
            }
          : null,
        error: locale.error,
      });
      return () => {
        annule = true;
      };
    }

    void import("../lib/supabase/estimationService")
      .then(({ getEstimationByAuditId }) => getEstimationByAuditId(auditId))
      .then((result) => {
        appliquer({
          data: result.data
            ? {
                id: result.data.id,
                auditId: result.data.auditId,
                typeProjet: result.data.typeProjet,
                lignes: result.data.lignes,
              }
            : null,
          error: result.error,
        });
      })
      .catch((error: unknown) => {
        if (annule) return;
        setChargement(false);
        setMessagePersistance({
          type: "error",
          texte: error instanceof Error ? error.message : "Impossible de charger l’estimation.",
        });
      });

    return () => {
      annule = true;
    };
  }, [auditId, auditIdValide]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setModalOpen(false);
      setEditionId(null);
      setErreur(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen]);

  function ouvrirAjout() {
    setEditionId(null);
    setForm(FORMULAIRE_VIDE);
    setErreur(null);
    setConfirmerZero(false);
    setModalOpen(true);
  }

  function ouvrirEdition(ligne: LigneEstimation) {
    setEditionId(ligne.id);
    setForm(formulaireDepuisLigne(ligne));
    setErreur(null);
    setConfirmerZero(false);
    setModalOpen(true);
  }

  function fermerModal() {
    setModalOpen(false);
    setEditionId(null);
    setErreur(null);
    setConfirmerZero(false);
  }

  function patchForm(patch: Partial<FormulaireLigne>) {
    setForm((actuel) => ({ ...actuel, ...patch }));
    setErreur(null);
  }

  function choisirPrestationCatalogue(next: {
    categorieId: string;
    sousCategorieId: string;
    prestationId: string;
    prestation: PrestationCatalogue | null;
  }) {
    if (!next.prestation) {
      patchForm({
        categorieMetierId: next.categorieId,
        sousCategorieId: next.sousCategorieId,
        cataloguePrestationId: next.prestationId,
        posteId: "",
      });
      return;
    }
    const prestation = next.prestation;
    const posteId =
      prestation.posteIdLegacy && isPosteId(prestation.posteIdLegacy)
        ? prestation.posteIdLegacy
        : prestation.id;
    const prixFournisseur = isPosteId(posteId) ? prixIndicatifCatalogue(posteId) : null;
    const nPanneaux = Math.round(nombrePanneaux500Wc(puissancePvKwc));
    let quantite = form.quantite;
    if (!editionId) {
      const verrou = quantitePvVerrouillee(prestation, nPanneaux > 0 ? nPanneaux : 0);
      quantite = verrou.verrouillee
        ? verrou.quantite
        : quantiteProposeeDepuisPrestation(prestation, nPanneaux > 0 ? nPanneaux : 0);
    }
    const kwcLigne = kwcDepuisLignePv({
      posteId,
      unite: prestation.unite,
      nom: prestation.nom,
      quantite,
    });
    patchForm({
      categorieMetierId: next.categorieId,
      sousCategorieId: next.sousCategorieId,
      cataloguePrestationId: prestation.id,
      posteId,
      quantite,
      coutMaterielUnitaireHt: editionId
        ? form.coutMaterielUnitaireHt
        : (prestation.coutMaterielHt ?? prixFournisseur ?? 0),
      coutMainOeuvreUnitaireHt: editionId
        ? form.coutMainOeuvreUnitaireHt
        : (prestation.coutMainOeuvreHt ?? 0),
      prixVenteUnitaireHt: editionId
        ? form.prixVenteUnitaireHt
        : (prestation.prixVenteHt ?? 0),
      tauxTvaPct: kwcLigne > 0
        ? round2(tauxTvaPhotovoltaique(kwcLigne) * 100)
        : round2(prestation.tauxTva * 100),
      artisan: editionId ? form.artisan : prestation.artisan,
      statut: editionId
        ? form.statut
        : statutEstimationDepuisCatalogue(prestation.statut) === "valide" &&
            (prestation.prixVenteHt == null ||
              (prestation.coutMaterielHt == null && prestation.coutMainOeuvreHt == null))
          ? "estimation"
          : statutEstimationDepuisCatalogue(prestation.statut),
    });
  }

  function enregistrerLigne(event: FormEvent) {
    event.preventDefault();
    const ligne = ligneDepuisFormulaire(
      form,
      editionId ? lignes.find((item) => item.id === editionId) : undefined,
    );
    if (!ligne) {
      setErreur("Sélectionnez une prestation du catalogue.");
      return;
    }
    if (!form.cataloguePrestationId && !form.posteId) {
      setErreur("Impossible d’ajouter une prestation vide.");
      return;
    }
    if (ligne.quantite <= 0) {
      setErreur("La quantité doit être supérieure à 0.");
      return;
    }
    if (prestationCatalogue) {
      const verrou = quantitePvVerrouillee(prestationCatalogue, nPanneauxProjet);
      if (verrou.verrouillee) {
        ligne.quantite = verrou.quantite;
      }
    }
    const arch = architectureDepuisSousCategorie(ligne.sousCategorieId, ligne.nom);
    const autres = editionId ? lignes.filter((item) => item.id !== editionId) : lignes;
    if (arch === "micro" && lignesOntArchitecture(autres, "central")) {
      setErreur(
        "Micro-onduleurs et onduleur centralisé ne peuvent pas être sélectionnés ensemble.",
      );
      return;
    }
    if (arch === "central" && lignesOntArchitecture(autres, "micro")) {
      setErreur(
        "Micro-onduleurs et onduleur centralisé ne peuvent pas être sélectionnés ensemble.",
      );
      return;
    }
    const venteNulle =
      ligne.prixVenteUnitaireHt <= 0 &&
      ligne.coutMaterielUnitaireHt <= 0 &&
      ligne.coutMainOeuvreUnitaireHt <= 0;
    if (venteNulle && !confirmerZero) {
      setErreur(
        "Cette prestation est à 0 €. Cochez la confirmation ci-dessous si vous voulez l’ajouter malgré l’absence de tarif.",
      );
      return;
    }
    const coutRevientSaisi = round2(ligne.coutMaterielUnitaireHt + ligne.coutMainOeuvreUnitaireHt);
    if (ligne.statut === "valide") {
      if (coutRevientSaisi <= 0 && ligne.montantDevisReel <= 0) {
        setErreur("Impossible de valider : prix artisan à confirmer (coût absent).");
        return;
      }
      if (ligne.prixVenteUnitaireHt <= 0) {
        setErreur("Impossible de valider : prix de vente à définir.");
        return;
      }
    }
    if (utiliseDevisReel(ligne.statut) && ligne.montantDevisReel <= 0) {
      setErreur("Indiquez le montant du devis artisan réel HT (supérieur à 0).");
      return;
    }
    setLignes((prev) => {
      if (editionId) {
        return prev.map((item) => (item.id === editionId ? ligne : item));
      }
      return [...prev, ligne];
    });
    fermerModal();
  }

  function supprimerLigne(id: string) {
    setLignes((prev) => prev.filter((item) => item.id !== id));
  }

  function ajouterDepuisAssistant(brouillons: BrouillonLignePv[]) {
    const nouvelles: LigneEstimation[] = [];
    for (const brouillon of brouillons) {
      const prestation = getPrestationCatalogue(brouillon.cataloguePrestationId);
      if (!prestation) continue;
      const posteId =
        prestation.posteIdLegacy && isPosteId(prestation.posteIdLegacy)
          ? prestation.posteIdLegacy
          : prestation.id;
      nouvelles.push({
        id: nouveauId(),
        posteId,
        nom: prestation.nom,
        categorie: categoriePosteDepuisMetier(prestation.categorieId),
        unite: uniteChiffrageDepuisCatalogue(prestation.unite),
        description: prestation.description,
        quantite: brouillon.quantite,
        coutMaterielUnitaireHt: prestation.coutMaterielHt ?? 0,
        coutMainOeuvreUnitaireHt: prestation.coutMainOeuvreHt ?? 0,
        prixVenteUnitaireHt: prestation.prixVenteHt ?? 0,
        tauxTva: brouillon.tauxTva,
        statut: "estimation",
        artisan: prestation.artisan,
        montantDevisReel: 0,
        cataloguePrestationId: prestation.id,
        categorieMetierId: prestation.categorieId,
        sousCategorieId: prestation.sousCategorieId,
      });
    }
    if (nouvelles.length === 0) return;
    setLignes((prev) => [...prev, ...nouvelles]);
    if (!typeProjetConfirme) {
      setTypeProjet("photovoltaique");
    }
  }

  async function enregistrerEstimation() {
    if (!auditIdValide) {
      setMessagePersistance({
        type: "error",
        texte: "Identifiant d’audit manquant ou invalide. L’estimation n’a pas été enregistrée.",
      });
      return;
    }

    setEnregistrementEnCours(true);
    setMessagePersistance(null);
    try {
      const payload = {
        auditId,
        estimationId,
        typeProjet,
        lignes: lignes.map(serialiserLigneJson),
        totaux: recap,
      };
      const result = estAuditIdLocal(auditId)
        ? saveEstimationLocale(payload)
        : await (await import("../lib/supabase/estimationService")).saveEstimation(payload);
      setEnregistrementEnCours(false);

      if (result.error || !result.data) {
        setMessagePersistance({
          type: "error",
          texte: result.error ?? "Impossible d’enregistrer l’estimation.",
        });
        return;
      }

      if (result.data.auditId.trim().toLowerCase() !== auditId.trim().toLowerCase()) {
        setMessagePersistance({
          type: "error",
          texte:
            "L’estimation enregistrée ne correspond pas à cet audit. Vérifiez l’identifiant du dossier.",
        });
        return;
      }

      setEstimationId(result.data.id);
      setMessagePersistance({
        type: "success",
        texte: "Estimation enregistrée.",
      });
    } catch (error) {
      setEnregistrementEnCours(false);
      setMessagePersistance({
        type: "error",
        texte: error instanceof Error ? error.message : "Impossible d’enregistrer l’estimation.",
      });
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900 p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Estimation des Travaux du Projet
          </h2>
          {auditIdValide ? (
            <p className="mt-1 font-mono text-[11px] text-slate-400">
              Audit {auditId.trim()}
            </p>
          ) : null}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => void enregistrerEstimation()}
            disabled={enregistrementEnCours || chargement || !auditIdValide}
            className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-400/60 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {enregistrementEnCours ? "Enregistrement…" : "Enregistrer l’estimation"}
          </button>
          <button
            type="button"
            onClick={ouvrirAjout}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(16,185,129,0.25)] transition hover:brightness-110 sm:w-auto"
          >
            Ajouter une prestation au projet
          </button>
        </div>
      </div>

      {chargement ? (
        <p className="text-xs text-slate-400 sm:text-sm">Chargement de l’estimation…</p>
      ) : null}

      {messagePersistance ? (
        <p
          role={messagePersistance.type === "error" ? "alert" : "status"}
          className={`rounded-xl border px-3 py-2 text-sm ${
            messagePersistance.type === "error"
              ? "border-red-500/40 bg-red-500/10 text-red-200"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {messagePersistance.texte}
        </p>
      ) : !auditIdValide ? (
        <p className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-400 sm:text-sm">
          Enregistrement indisponible : identifiant d’audit manquant ou invalide.
        </p>
      ) : null}

      <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100 sm:text-sm">
        Montants indicatifs, non contractuels, à titre de simulation interne. Les prix doivent
        être confirmés par les devis réels des artisans RGE, qui restent la référence. Aucun
        engagement commercial ni d’aide n’est constitué par cette estimation.
      </p>

      {typeProjet === "photovoltaique" || puissancePvKwc > 0 ? (
        <PhotovoltaiqueBareme2026 puissanceKwc={puissancePvKwc} />
      ) : null}

      {typeProjet === "photovoltaique" || form.categorieMetierId === "photovoltaique" || puissancePvKwc > 0 ? (
        <ChiffragePhotovoltaiqueAssistant
          lignesExistantes={lignes}
          onAjouterLignes={ajouterDepuisAssistant}
          voirCoutsInternes={voirCoutsInternes}
          coutClyveHt={PRESTATION_CLYVE_HT.photovoltaique}
        />
      ) : typeProjet === "autre" ? (
        <p className="text-xs text-slate-500">
          Pour le chiffrage structuré 500 Wc → 100 kWc, choisissez le type de projet
          « Photovoltaïque ».
        </p>
      ) : null}

      {lignesCalculees.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
          Aucune prestation ajoutée. Sélectionnez un poste du catalogue pour démarrer
          l’estimation.
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-slate-800 md:block">
            <table className="min-w-[76rem] w-full border-collapse text-left text-xs text-slate-200">
              <thead className="bg-slate-800 text-[11px] uppercase tracking-wide text-slate-300">
                <tr>
                  <th className="px-3 py-2 font-semibold">Prestation</th>
                  <th className="px-3 py-2 font-semibold">Statut</th>
                  <th className="px-3 py-2 font-semibold">Quantité</th>
                  {voirCoutsInternes ? (
                    <th className="px-3 py-2 font-semibold">Coût de revient HT</th>
                  ) : null}
                  <th className="px-3 py-2 font-semibold">Prix de vente HT</th>
                  <th className="px-3 py-2 font-semibold">Prix de vente TTC</th>
                  {voirCoutsInternes ? (
                    <th className="px-3 py-2 font-semibold">Marge brute</th>
                  ) : null}
                  <th className="px-3 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lignesCalculees.map((ligne) => (
                  <tr
                    key={ligne.id}
                    className={`border-t border-slate-800 ${
                      ligne.sourceCout === "devis_reel" ? "bg-sky-500/[0.04]" : ""
                    }`}
                  >
                    <td className="px-3 py-2">
                      <p className="font-medium text-white">{ligne.nom}</p>
                      <p className="text-[11px] text-slate-500">
                        {CATEGORIE_LABEL[ligne.categorie]} · {formatUnite(ligne.unite)}
                      </p>
                      {ligne.artisan ? (
                        <p className="mt-1 text-[11px] text-slate-300">
                          Artisan RGE : <span className="font-medium text-white">{ligne.artisan}</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-slate-600">Artisan non renseigné</p>
                      )}
                      {ligne.statut === "estimation" || ligne.prixVenteHt <= 0 ? (
                        <p className="mt-1 text-[11px] text-amber-200">{MENTION_ESTIMATION_PV}</p>
                      ) : null}
                      {ligne.prixVenteHt <= 0 ? (
                        <p className="mt-1 text-[11px] text-red-300">Montant 0 € — tarif à renseigner.</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col items-start gap-1">
                        <StatutBadge statut={ligne.statut} />
                        <SourceCoutBadge source={ligne.sourceCout} />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {ligne.quantite.toLocaleString("fr-FR")} {formatUnite(ligne.unite)}
                    </td>
                    {voirCoutsInternes ? (
                      <td className="whitespace-nowrap px-3 py-2">
                        <p
                          className={
                            ligne.sourceCout === "devis_reel" ? "font-semibold text-sky-200" : "text-slate-200"
                          }
                        >
                          {formatEuro(ligne.coutRevientHt)}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {ligne.sourceCout === "devis_reel"
                            ? "Devis artisan réel"
                            : `Estimé · mat. ${formatEuro(ligne.totalMaterielHt)} + MO ${formatEuro(ligne.totalMainOeuvreHt)}`}
                        </p>
                      </td>
                    ) : null}
                    <td className="whitespace-nowrap px-3 py-2">{formatEuro(ligne.prixVenteHt)}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-emerald-300">
                      {formatEuro(ligne.prixVenteTtc)}
                    </td>
                    {voirCoutsInternes ? (
                      <td
                        className={`whitespace-nowrap px-3 py-2 ${
                          ligne.margeBruteHt < 0 ? "text-red-300" : "text-emerald-300"
                        }`}
                      >
                        {formatEuro(ligne.margeBruteHt)}
                        <span className="ml-1 text-slate-500">({formatPct(ligne.tauxMarge)})</span>
                      </td>
                    ) : null}
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => ouvrirEdition(ligne)}
                          className="rounded-lg border border-slate-600 px-2 py-1 text-[11px] font-semibold text-slate-200 hover:border-emerald-400 hover:text-white"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => supprimerLigne(ligne.id)}
                          className="rounded-lg border border-red-500/40 px-2 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/10"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {lignesCalculees.map((ligne) => (
              <li
                key={ligne.id}
                className={`rounded-xl border p-3 text-sm text-slate-200 ${
                  ligne.sourceCout === "devis_reel"
                    ? "border-sky-500/30 bg-sky-500/[0.06]"
                    : "border-slate-800 bg-slate-950/70"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-white">{ligne.nom}</p>
                  <div className="flex flex-wrap gap-1">
                    <StatutBadge statut={ligne.statut} />
                    <SourceCoutBadge source={ligne.sourceCout} />
                  </div>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {CATEGORIE_LABEL[ligne.categorie]} · {ligne.quantite.toLocaleString("fr-FR")}{" "}
                  {formatUnite(ligne.unite)}
                </p>
                {ligne.artisan ? (
                  <p className="mt-1 text-xs text-slate-300">
                    Artisan RGE : <span className="font-medium text-white">{ligne.artisan}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-600">Artisan non renseigné</p>
                )}
                {ligne.statut === "estimation" || ligne.prixVenteHt <= 0 ? (
                  <p className="mt-1 text-[11px] text-amber-200">{MENTION_ESTIMATION_PV}</p>
                ) : null}
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {voirCoutsInternes ? (
                    <>
                      <div>
                        <dt className="text-slate-500">Coût de revient HT</dt>
                        <dd className={ligne.sourceCout === "devis_reel" ? "font-semibold text-sky-200" : ""}>
                          {formatEuro(ligne.coutRevientHt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">
                          {ligne.sourceCout === "devis_reel" ? "Devis artisan réel" : "Estimation théorique"}
                        </dt>
                        <dd>
                          {ligne.sourceCout === "devis_reel"
                            ? formatEuro(ligne.montantDevisReel)
                            : formatEuro(ligne.coutEstimeHt)}
                        </dd>
                      </div>
                    </>
                  ) : null}
                  <div>
                    <dt className="text-slate-500">Vente HT</dt>
                    <dd>{formatEuro(ligne.prixVenteHt)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Vente TTC</dt>
                    <dd className="font-medium text-emerald-300">{formatEuro(ligne.prixVenteTtc)}</dd>
                  </div>
                  {voirCoutsInternes ? (
                    <div className="col-span-2">
                      <dt className="text-slate-500">Marge brute</dt>
                      <dd className={ligne.margeBruteHt < 0 ? "text-red-300" : "text-emerald-300"}>
                        {formatEuro(ligne.margeBruteHt)} ({formatPct(ligne.tauxMarge)})
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => ouvrirEdition(ligne)}
                    className="flex-1 rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => supprimerLigne(ligne.id)}
                    className="flex-1 rounded-lg border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-300"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Récapitulatif
        </h3>
        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {voirCoutsInternes ? (
            <RecapCard
              label="Total Estimé (Théorique) HT"
              hint="Somme des estimations de départ (matériel + main-d’œuvre)"
              value={formatEuro(recap.totalEstimeTheoriqueHt)}
            />
          ) : null}
          <RecapCard
            label="Total Devis Reçus HT"
            hint="Somme des devis artisans réels (reçus ou validés)"
            value={formatEuro(recap.totalDevisRecusHt)}
          />
          <RecapCard
            label="Total Contractuel Validé TTC"
            hint="Montant validé à faire signer au client"
            value={formatEuro(recap.totalContractuelValideTtc)}
            emphasize
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {voirCoutsInternes ? (
            <>
              <RecapCard
                label="Total matériel HT"
                hint={!recap.aDesDevisReels ? "(Basé sur estimations)" : undefined}
                value={formatEuro(recap.totalMaterielHt)}
              />
              <RecapCard
                label="Total artisans HT"
                hint={!recap.aDesDevisReels ? "(Basé sur estimations)" : undefined}
                value={formatEuro(recap.totalArtisansHt)}
              />
              <RecapCard
                label="Total coût de revient HT"
                hint={
                  recap.aDesDevisReels
                    ? "Devis artisan réel HT pour les lignes reçues ou validées, sinon estimation"
                    : "(Basé sur estimations)"
                }
                value={formatEuro(recap.totalCoutRevientHt)}
              />
            </>
          ) : null}
          <RecapCard label="Total vente HT" value={formatEuro(recap.totalVenteHt)} />
          <RecapCard label="Total TVA" value={formatEuro(recap.totalTva)} />
          <RecapCard label="Total vente TTC" value={formatEuro(recap.totalVenteTtc)} emphasize />
          {voirCoutsInternes ? (
            <>
              <RecapCard label="Marge brute totale" value={formatEuro(recap.margeBruteTotale)} />
              <RecapCard label="Taux de marge global" value={formatPct(recap.tauxMargeGlobal)} />
            </>
          ) : null}
        </div>

        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <label className={labelClass} htmlFor="type-projet">
              Type de projet
              <select
                id="type-projet"
                value={typeProjet}
                onChange={(event) => {
                  const value = event.target.value as TypeProjet;
                  setTypeProjet(value);
                  setTypeProjetConfirme(typeProjetClyveConfirme(value));
                }}
                className={`${inputClass} ${
                  typeProjetAConfirmer
                    ? "border-orange-500 ring-1 ring-orange-500/60"
                    : ""
                }`}
              >
                {TYPES_PROJET.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {typeProjetAConfirmer && voirCoutsInternes ? (
                <span className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-orange-300">
                  Choisissez Photovoltaïque ou Rénovation globale pour appliquer les frais
                  Clyve (500 € ou 1 100 €) à la marge.
                </span>
              ) : null}
            </label>
            {voirCoutsInternes ? (
              <p className="text-[11px] leading-relaxed text-slate-500 sm:max-w-sm sm:text-right">
                Commission Damien et coût administratif Clyve déduits de la marge ENERGIA.
              </p>
            ) : null}
          </div>

          {voirCoutsInternes ? (
          <>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <RecapCard
              label="Total des coûts internes HT"
              hint="Coût de revient retenu (estimé ou devis réel selon le statut)"
              value={formatEuro(recap.totalCoutRevientHt)}
            />
            <RecapCard label="Total vente HT" value={formatEuro(recap.totalVenteHt)} />
            <RecapCard
              label="Commission commerciale Damien"
              hint="10 % du total de vente HT des travaux"
              value={formatEuro(recap.commissionDamienHt)}
            />
            <RecapCard
              label="Coût Administratif (Clyve)"
              hint={
                typeProjet === "photovoltaique"
                  ? "500 € HT — Photovoltaïque — charge interne ENERGIA"
                  : typeProjet === "renovation_globale"
                    ? "1 100 € HT — Rénovation globale — charge interne ENERGIA"
                    : "0 € — Autre"
              }
              value={formatEuro(recap.prestationClyveHt)}
            />
            <RecapCard
              label="Marge brute HT"
              hint="Avant commission Damien et Clyve"
              value={formatEuro(recap.margeBruteTotale)}
            />
            <RecapCard
              label="Marge estimée après frais"
              hint="Marge brute − Damien − Clyve"
              value={formatEuro(recap.margeEstimeeApresFraisHt)}
              emphasize={recap.margeEstimeeApresFraisHt >= 0}
              danger={recap.margeEstimeeApresFraisHt < 0}
            />
          </div>

          {recap.margeEstimeeApresFraisHt < 0 ? (
            <div
              role="alert"
              className="mt-3 rounded-xl border border-red-500/50 bg-red-500/15 px-3 py-3 text-red-200 sm:px-4"
            >
              <p className="text-sm font-semibold text-red-300 sm:text-base">
                Marge négative à vérifier
              </p>
              <p className="mt-1 text-sm font-semibold text-red-100">
                Perte estimée : {formatEuro(Math.abs(recap.margeEstimeeApresFraisHt))}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-red-200/90 sm:text-sm">
                Vérifier le prix de vente, le coût artisan, le coût matériel, la commission
                Damien et le coût administratif Clyve.
              </p>
            </div>
          ) : null}
          </>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-100 p-1 sm:p-2">
        <DevisClientPanel
          devis={devisClient}
          libelleProjet="Estimation des travaux"
          numero={numeroDevis ?? `DEV-2026-${auditId || "PROJET"}`}
          clientNom={clientNom}
          clientAdresse={clientAdresse}
        />
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 sm:items-center sm:p-4"
          onClick={fermerModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="estimation-modal-title"
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl sm:max-w-2xl sm:rounded-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 id="estimation-modal-title" className="text-lg font-semibold text-white">
                {editionId ? "Modifier la prestation" : "Ajouter une prestation au projet"}
              </h3>
              <button
                type="button"
                onClick={fermerModal}
                className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4" onSubmit={enregistrerLigne}>
              <SelecteurPrestationCatalogue
                categorieId={form.categorieMetierId}
                sousCategorieId={form.sousCategorieId}
                prestationId={form.cataloguePrestationId}
                onChange={choisirPrestationCatalogue}
              />

              {prestationCatalogue ? (
                <DetailPrestationCrm
                  prestation={prestationCatalogue}
                  voirCoutsInternes={voirCoutsInternes}
                />
              ) : posteSelectionne ? (
                <DetailCatalogue poste={posteSelectionne} />
              ) : form.sousCategorieId && form.categorieMetierId === "photovoltaique" ? (
                <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                  Aucune prestation sélectionnée. Si le catalogue ne propose rien pour «{" "}
                  {getSousCategorieMetier(form.sousCategorieId)?.nom ?? "cette sous-catégorie"} »,
                  créez-la d’abord dans le catalogue métiers.
                </p>
              ) : null}

              {architectureDepuisSousCategorie(form.sousCategorieId, prestationCatalogue?.nom) ===
              "central" ? (
                <p role="status" className="rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-xs text-orange-100">
                  {ALERTE_ONDULEUR_CENTRAL}
                </p>
              ) : null}

              {analysePv.ok && form.categorieMetierId === "photovoltaique" ? (
                <p className="text-xs text-slate-400">{analysePv.correspondance}.</p>
              ) : puissancePvKwc > 0 && form.categorieMetierId === "photovoltaique" ? (
                <p className="text-xs text-amber-200">{analysePv.alerte}</p>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className={labelClass} htmlFor="statut-prestation">
                  Statut de la prestation
                  <select
                    id="statut-prestation"
                    value={form.statut}
                    onChange={(event) =>
                      patchForm({ statut: event.target.value as StatutPrestation })
                    }
                    className={inputClass}
                  >
                    {STATUTS_PRESTATION.map((statut) => (
                      <option key={statut.value} value={statut.value}>
                        {statut.label} — {statut.hint}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={labelClass} htmlFor="artisan-rge">
                  Artisan RGE pressenti / responsable
                  <input
                    id="artisan-rge"
                    type="text"
                    value={form.artisan}
                    onChange={(event) => patchForm({ artisan: event.target.value })}
                    placeholder="Nom de l’entreprise RGE"
                    className={inputClass}
                  />
                </label>
              </div>

              {utiliseDevisReel(form.statut) ? (
                <NumberField
                  id="montant-devis-reel"
                  label="Montant Devis Artisan Réel HT"
                  value={form.montantDevisReel}
                  min={0}
                  step={0.01}
                  suffix="€"
                  onChange={(montantDevisReel) => patchForm({ montantDevisReel })}
                />
              ) : (
                <p className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-500">
                  Le montant du devis artisan réel HT sera saisi lorsque le statut passera à
                  « Devis reçu » ou « Validé ». En attendant, la marge utilise le coût estimé
                  (matériel + main-d’œuvre).
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <NumberField
                  id="quantite"
                  label={`Quantité (${
                    prestationCatalogue
                      ? prestationCatalogue.unite === "forfait"
                        ? "forfait"
                        : LIBELLES_UNITE[prestationCatalogue.unite]
                      : posteSelectionne
                        ? formatUnite(posteSelectionne.unite)
                        : "unité"
                  })`}
                  value={verrouQuantite.verrouillee ? verrouQuantite.quantite : form.quantite}
                  min={0}
                  step={0.01}
                  disabled={verrouQuantite.verrouillee}
                  hint={verrouQuantite.motif ?? undefined}
                  onChange={(quantite) => {
                    if (verrouQuantite.verrouillee) return;
                    const kwcLigne = kwcDepuisFormulaire(form, quantite);
                    patchForm(
                      kwcLigne > 0
                        ? {
                            quantite,
                            tauxTvaPct: round2(tauxTvaPhotovoltaique(kwcLigne) * 100),
                          }
                        : { quantite },
                    );
                  }}
                />
                <NumberField
                  id="taux-tva"
                  label="Taux de TVA"
                  value={form.tauxTvaPct}
                  min={0}
                  step={0.1}
                  suffix="%"
                  onChange={(tauxTvaPct) => patchForm({ tauxTvaPct })}
                />
                {voirCoutsInternes ? (
                  <>
                    <NumberField
                      id="cout-materiel"
                      label="Coût matériel unitaire HT"
                      value={form.coutMaterielUnitaireHt}
                      onChange={(coutMaterielUnitaireHt) => patchForm({ coutMaterielUnitaireHt })}
                    />
                    <NumberField
                      id="cout-mo"
                      label="Coût main-d’œuvre artisan unitaire HT"
                      value={form.coutMainOeuvreUnitaireHt}
                      onChange={(coutMainOeuvreUnitaireHt) => patchForm({ coutMainOeuvreUnitaireHt })}
                    />
                  </>
                ) : null}
                <div className="sm:col-span-2">
                  <NumberField
                    id="prix-vente"
                    label="Prix de vente unitaire HT"
                    value={form.prixVenteUnitaireHt}
                    onChange={(prixVenteUnitaireHt) => patchForm({ prixVenteUnitaireHt })}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {TAUX_TVA.map((taux) => (
                  <button
                    key={taux.value}
                    type="button"
                    onClick={() => patchForm({ tauxTvaPct: round2(taux.value * 100) })}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      form.tauxTvaPct === round2(taux.value * 100)
                        ? "border-emerald-400 bg-emerald-500/15 text-emerald-200"
                        : "border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {taux.label}
                  </button>
                ))}
              </div>

              {calcsBrouillon ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Synthèse avant validation — {calcsBrouillon.quantite.toLocaleString("fr-FR")}{" "}
                    {prestationCatalogue
                      ? LIBELLES_UNITE[prestationCatalogue.unite]
                      : formatUnite(calcsBrouillon.unite)}
                  </p>
                  <CalcsPreview ligne={calcsBrouillon} voirCoutsInternes={voirCoutsInternes} />
                  {voirCoutsInternes && calcsBrouillon.prixVenteHt > 0 && calcsBrouillon.prixVenteHt < prixPlancherHt(calcsBrouillon.coutRevientHt) ? (
                    <p role="alert" className="mt-2 text-sm font-semibold text-red-300">
                      Prix de vente inférieur au prix plancher ({formatEuro(prixPlancherHt(calcsBrouillon.coutRevientHt))})
                    </p>
                  ) : null}
                  {calcsBrouillon.margeBruteHt < 0 ? (
                    <p role="alert" className="mt-2 text-sm font-semibold text-red-300">
                      Prix de vente inférieur au coût de revient
                    </p>
                  ) : null}
                  {calcsBrouillon.statut === "estimation" ? (
                    <p className="mt-2 text-[11px] text-amber-200">{MENTION_ESTIMATION_PV}</p>
                  ) : null}
                </div>
              ) : null}

              {form.prixVenteUnitaireHt <= 0 &&
              form.coutMaterielUnitaireHt <= 0 &&
              form.coutMainOeuvreUnitaireHt <= 0 ? (
                <label className="flex items-start gap-2 text-xs text-amber-100">
                  <input
                    type="checkbox"
                    checked={confirmerZero}
                    onChange={(event) => setConfirmerZero(event.target.checked)}
                  />
                  Ajouter malgré le tarif à 0 € (prestation vide)
                </label>
              ) : null}

              {erreur ? (
                <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {erreur}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fermerModal}
                  className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
                >
                  {editionId ? "Enregistrer les modifications" : "Ajouter au projet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
