import { euro } from "../../lib/crm/mockData";
import {
  MODE_FOURNITURE_POSE,
  MODE_POSE_SEULE,
  artisansEligiblesPourLigne,
  decomposerLigneSousTraitance,
  estPosteHorsSousTraitance,
  patchTarifsDepuisArtisan,
} from "../../lib/crm/artisansRge";
import { estPrestationDoubleMode } from "../../lib/crm/sousTraitanceDoubleMode";
import ToggleSousTraitance from "./ToggleSousTraitance";
import BadgeGainMarge from "./BadgeGainMarge";
import AlerteMargeLigne from "./AlerteMargeLigne";
import BoutonSecuriserMarge from "./BoutonSecuriserMarge";
import { analyserLigneTravaux, puHtPlancherDepuisRevientTotal, STATUT_MARGE_PERTE } from "../../lib/crm/gardeFouMarge";

const inputClass =
  "w-28 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-right text-xs text-white focus:border-emerald-500 focus:outline-none";

/**
 * Toggle Fourniture+Pose / Pose seule + sélection artisan — PU client inchangé.
 */
export default function SelecteurSousTraitanceLigne({
  ligne,
  referentiel,
  voirCoutsInternes = false,
  editable = false,
  onChange,
}) {
  if (estPosteHorsSousTraitance(ligne)) {
    return <p className="text-[11px] text-slate-500">Poste ENERGIA — hors sous-traitance artisan.</p>;
  }

  const eligibles = artisansEligiblesPourLigne(ligne, referentiel?.artisans || []);
  const decomp = decomposerLigneSousTraitance(ligne, referentiel);
  const mode = decomp.mode || MODE_FOURNITURE_POSE;
  const doubleMode = estPrestationDoubleMode(ligne);
  const analyse = voirCoutsInternes ? analyserLigneTravaux(ligne, referentiel) : null;

  const changerArtisan = (artisanId) => {
    onChange?.(patchTarifsDepuisArtisan(ligne, artisanId, referentiel));
  };

  const changerMode = (next) => {
    onChange?.({
      ...ligne,
      modeSousTraitance: next,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="max-w-[220px] rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white focus:border-emerald-500 focus:outline-none"
          value={ligne.artisanId || decomp.artisan?.id || ""}
          disabled={!editable}
          onChange={(event) => changerArtisan(event.target.value)}
        >
          <option value="">Artisan RGE…</option>
          {eligibles.map((artisan) => (
            <option key={artisan.id} value={artisan.id}>
              {artisan.enseigne || artisan.raisonSociale}
            </option>
          ))}
        </select>
        {doubleMode ? (
          editable ? (
            <ToggleSousTraitance mode={mode} onChange={changerMode} />
          ) : (
            <span className="text-[11px] text-slate-400">
              {mode === MODE_POSE_SEULE ? "Pose seule (achat matériel direct)" : "Fourniture & pose"}
            </span>
          )
        ) : null}
      </div>

      {voirCoutsInternes && doubleMode && mode === MODE_POSE_SEULE && editable ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-[11px] uppercase tracking-wide text-slate-500">
            Coût Matériel Direct HT
            <input
              className={`${inputClass} mt-1 w-full`}
              type="number"
              min="0"
              step="0.01"
              value={ligne.coutMaterielDirectSaisiHt ?? decomp.coutMaterielDirectHt ?? ""}
              onChange={(event) =>
                onChange?.({
                  ...ligne,
                  coutMaterielDirectSaisiHt:
                    event.target.value === "" ? null : Number(event.target.value),
                })
              }
            />
          </label>
          <label className="text-[11px] uppercase tracking-wide text-slate-500">
            Coût Pose Artisan RGE HT
            <input
              className={`${inputClass} mt-1 w-full`}
              type="number"
              min="0"
              step="0.01"
              value={ligne.coutPoseArtisanSaisiHt ?? decomp.coutPoseSeuleHt ?? ""}
              onChange={(event) =>
                onChange?.({
                  ...ligne,
                  coutPoseArtisanSaisiHt:
                    event.target.value === "" ? null : Number(event.target.value),
                })
              }
            />
          </label>
        </div>
      ) : null}

      {voirCoutsInternes && decomp.applicable ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-300">
          <p>
            Vente client : <strong className="text-white">{euro(decomp.venteHt)}</strong>
            {" · "}Revient ST : <strong className="text-amber-100">{euro(decomp.coutRevientHt)}</strong>
            {" · "}Marge brute : <strong className="text-emerald-200">{euro(decomp.margeBruteHt)}</strong>
            {decomp.venteHt > 0 ? (
              <span className="text-emerald-200/80">
                {" "}
                ({((decomp.margeBruteHt / decomp.venteHt) * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %)
              </span>
            ) : null}
          </p>
          {mode === MODE_POSE_SEULE ? (
            <p className="mt-1 text-sky-200">
              Matériel direct {euro(decomp.coutMaterielDirectHt)} + pose RGE {euro(decomp.coutPoseSeuleHt)}
              {" · "}coût de revient interne {euro(decomp.coutRevientHt)}
            </p>
          ) : (
            <p className="mt-1 text-slate-500">
              Forfait artisan Fourniture + Pose {euro(decomp.coutFourniturePoseHt)} HT (TVA autoliquidée Art.
              283-2 nonies CGI). Potentiel pose seule : +{euro(decomp.extraMargeAchatDirectHt)} HT.
            </p>
          )}
          <div className="mt-2">
            <BadgeGainMarge
              montantHt={decomp.extraMargeCaptureeHt}
              visible={mode === MODE_POSE_SEULE}
            />
          </div>
          {analyse ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <AlerteMargeLigne analyse={analyse} />
              {editable &&
              !ligne.verrouillageOfficiel &&
              analyse.prixPlancher15Ht != null &&
              (analyse.statut === STATUT_MARGE_PERTE ||
                (analyse.tauxMarge != null && analyse.tauxMarge < 0.15)) ? (
                <BoutonSecuriserMarge
                  prixPlancherHt={puHtPlancherDepuisRevientTotal(analyse.coutRevientHt, ligne.quantite)}
                  onClick={() => {
                    const pu = puHtPlancherDepuisRevientTotal(analyse.coutRevientHt, ligne.quantite);
                    if (pu != null) onChange?.({ ...ligne, puHt: pu });
                  }}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
