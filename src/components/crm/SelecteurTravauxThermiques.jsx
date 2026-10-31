import { FAMILLES_TRAVAUX_CRM } from "../../lib/crm/editionDossier";
import {
  getSousCategorieMetier,
  prestationsDeSousCategorie,
  prestationPourRole,
  sousCategoriesDe,
} from "../../lib/crm/catalogue";
import {
  MODE_FOURNITURE_POSE,
  estPrestationDoubleMode,
  extraMargePrestation,
} from "../../lib/crm/sousTraitanceDoubleMode";
import { analyserPrestationCatalogue } from "../../lib/crm/gardeFouMarge";
import ToggleSousTraitance from "./ToggleSousTraitance";
import BadgeGainMarge from "./BadgeGainMarge";
import AlerteMargeLigne from "./AlerteMargeLigne";

const selectClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none";
const labelClass = "block text-xs font-medium uppercase tracking-wide text-slate-400";

function sousCategoriesFamille(famille) {
  if (!famille) return [];
  const filtre = famille.sousCategorieFiltre;
  return famille.categorieIds.flatMap((categorieId) => {
    const sous = sousCategoriesDe(categorieId);
    return filtre ? sous.filter((item) => filtre.test(item.nom)) : sous;
  });
}

export default function SelecteurTravauxThermiques({
  familleId,
  sousCategorieId,
  prestationId,
  quantite,
  modeSousTraitance = MODE_FOURNITURE_POSE,
  onChange,
  role = "administrateur",
}) {
  const famille = FAMILLES_TRAVAUX_CRM.find((item) => item.id === familleId);
  const sousCategories = sousCategoriesFamille(famille);
  const sous = sousCategorieId ? getSousCategorieMetier(sousCategorieId) : null;
  const categorieId = sous?.categorieId || "";
  const prestations = categorieId && sousCategorieId
    ? prestationsDeSousCategorie(categorieId, sousCategorieId)
        .map((item) => prestationPourRole(item, role))
        .filter(Boolean)
    : [];
  const prestationActive = prestations.find((item) => item.id === prestationId) ?? null;
  const doubleMode = estPrestationDoubleMode({
    ...prestationActive,
    familleId,
    categorieId,
    sousCategorieId,
  });

  const patch = (next) => {
    const nextSous = next.sousCategorieId
      ? getSousCategorieMetier(next.sousCategorieId)
      : null;
    const nextPrestations =
      nextSous
        ? prestationsDeSousCategorie(nextSous.categorieId, nextSous.id)
            .map((item) => prestationPourRole(item, role))
            .filter(Boolean)
        : [];
    const prestation = nextPrestations.find((item) => item.id === next.prestationId) ?? null;
    const mode =
      next.modeSousTraitance ||
      prestation?.modeSousTraitance ||
      MODE_FOURNITURE_POSE;
    onChange({
      familleId: next.familleId ?? "",
      categorieId: nextSous?.categorieId || "",
      sousCategorieId: next.sousCategorieId ?? "",
      prestationId: next.prestationId ?? "",
      prestation: prestation
        ? { ...prestation, modeSousTraitance: mode }
        : null,
      quantite: next.quantite,
      modeSousTraitance: mode,
    });
  };

  return (
    <div className="space-y-3">
    <div className="grid gap-3 lg:grid-cols-4">
      <label className={labelClass} htmlFor="famille-thermique">
        Catégorie principale
        <select
          id="famille-thermique"
          className={selectClass}
          value={familleId}
          onChange={(event) =>
            patch({
              familleId: event.target.value,
              sousCategorieId: "",
              prestationId: "",
              quantite,
            })
          }
        >
          <option value="">Choisir une catégorie…</option>
          {FAMILLES_TRAVAUX_CRM.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nom}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass} htmlFor="sous-thermique">
        Sous-catégorie
        <select
          id="sous-thermique"
          className={selectClass}
          value={sousCategorieId}
          disabled={!familleId}
          onChange={(event) =>
            patch({
              familleId,
              sousCategorieId: event.target.value,
              prestationId: "",
              quantite,
            })
          }
        >
          <option value="">{familleId ? "Choisir une sous-catégorie…" : "D’abord une catégorie"}</option>
          {sousCategories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nom}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass} htmlFor="prestation-thermique">
        Prestation
        <select
          id="prestation-thermique"
          className={selectClass}
          value={prestationId}
          disabled={!sousCategorieId}
          onChange={(event) =>
            patch({
              familleId,
              sousCategorieId,
              prestationId: event.target.value,
              quantite,
            })
          }
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
              {item.referenceMarche
                ? ` — indicatif ${item.referenceMarche.priceMedianHT.toLocaleString("fr-FR")} € HT/${item.referenceMarche.unit}`
                : item.prixVenteHt != null
                  ? ` — ${Number(item.prixVenteHt).toLocaleString("fr-FR")} € HT`
                  : ""}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass} htmlFor="quantite-thermique">
        Quantité / Surface
        <input
          id="quantite-thermique"
          type="number"
          min="0"
          step="0.01"
          className={selectClass}
          value={quantite}
          onChange={(event) =>
            patch({
              familleId,
              sousCategorieId,
              prestationId,
              quantite: event.target.value,
              modeSousTraitance,
            })
          }
        />
      </label>
    </div>
    {doubleMode && prestationActive ? (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2">
        <ToggleSousTraitance
          mode={modeSousTraitance}
          onChange={(mode) =>
            patch({
              familleId,
              sousCategorieId,
              prestationId,
              quantite,
              modeSousTraitance: mode,
            })
          }
        />
        <p className="text-[11px] text-slate-400">
          {modeSousTraitance === "pose_seule"
            ? "Pose seule : achat matériel direct ENERGIA + pose artisan RGE (TVA autoliquidée)."
            : "Fourniture + pose : l’artisan facture le forfait complet (TVA autoliquidée Art. 283-2 nonies CGI)."}
        </p>
        {role === "administrateur" ? (
          <BadgeGainMarge
            montantHt={extraMargePrestation({
              ...prestationActive,
              modeSousTraitance,
            })}
            visible={modeSousTraitance === "pose_seule"}
          />
        ) : null}
        {role === "administrateur" && prestationActive ? (
          <AlerteMargeLigne
            analyse={analyserPrestationCatalogue({
              ...prestationActive,
              modeSousTraitance,
            })}
          />
        ) : null}
      </div>
    ) : null}
    </div>
  );
}
