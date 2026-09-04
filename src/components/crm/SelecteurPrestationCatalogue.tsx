import { useMemo } from "react";
import {
  CATEGORIES_METIERS,
  getCategorieMetier,
  prestationsDeSousCategorie,
  sousCategoriesDe,
  type PrestationCatalogue,
} from "../../lib/crm/catalogue";

const selectClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none";
const labelClass = "block text-xs font-medium uppercase tracking-wide text-slate-400";

type Props = {
  categorieId: string;
  sousCategorieId: string;
  prestationId: string;
  onChange: (next: {
    categorieId: string;
    sousCategorieId: string;
    prestationId: string;
    prestation: PrestationCatalogue | null;
  }) => void;
  inclureInactifs?: boolean;
};

export default function SelecteurPrestationCatalogue({
  categorieId,
  sousCategorieId,
  prestationId,
  onChange,
  inclureInactifs = false,
}: Props) {
  const sousCategories = useMemo(
    () => (categorieId ? sousCategoriesDe(categorieId) : []),
    [categorieId],
  );
  const prestations = useMemo(
    () =>
      categorieId && sousCategorieId
        ? prestationsDeSousCategorie(categorieId, sousCategorieId, { inclureInactifs })
        : [],
    [categorieId, sousCategorieId, inclureInactifs],
  );

  const categorie = categorieId ? getCategorieMetier(categorieId) : undefined;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <label className={labelClass} htmlFor="catalogue-categorie">
        Catégorie principale
        <select
          id="catalogue-categorie"
          value={categorieId}
          className={selectClass}
          onChange={(event) => {
            const next = event.target.value;
            onChange({
              categorieId: next,
              sousCategorieId: "",
              prestationId: "",
              prestation: null,
            });
          }}
        >
          <option value="">Choisir une catégorie…</option>
          {CATEGORIES_METIERS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.ordre}. {item.nom}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass} htmlFor="catalogue-sous-categorie">
        Sous-catégorie
        <select
          id="catalogue-sous-categorie"
          value={sousCategorieId}
          disabled={!categorieId}
          className={selectClass}
          onChange={(event) => {
            const next = event.target.value;
            onChange({
              categorieId,
              sousCategorieId: next,
              prestationId: "",
              prestation: null,
            });
          }}
        >
          <option value="">
            {categorieId ? "Choisir une sous-catégorie…" : "D’abord une catégorie"}
          </option>
          {sousCategories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nom}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass} htmlFor="catalogue-prestation">
        Prestation
        <select
          id="catalogue-prestation"
          value={prestationId}
          disabled={!sousCategorieId}
          className={selectClass}
          onChange={(event) => {
            const next = event.target.value;
            const prestation = prestations.find((item) => item.id === next) ?? null;
            onChange({
              categorieId,
              sousCategorieId,
              prestationId: next,
              prestation,
            });
          }}
        >
          <option value="">
            {sousCategorieId
              ? prestations.length
                ? "Choisir une prestation…"
                : "Aucune prestation — à créer dans le catalogue"
              : "D’abord une sous-catégorie"}
          </option>
          {prestations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.demo ? `[DÉMO] ${item.nom}` : item.nom}
            </option>
          ))}
        </select>
      </label>

      {categorie && sousCategorieId && prestations.length === 0 ? (
        <p className="sm:col-span-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Aucune prestation dans cette sous-catégorie. Ajoutez-en une depuis le catalogue
          métiers, puis revenez sélectionner la ligne.
        </p>
      ) : null}
    </div>
  );
}
