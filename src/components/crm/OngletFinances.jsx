import { euro } from "../../lib/crm/mockData";
import {
  estVueFinancesComplete,
  libelleCommissionAgent,
} from "../../lib/crm/finances";
import { COUT_CLYVE_HT_DEFAUT, LIBELLE_COUT_CLYVE } from "../../lib/crm/editionDossier";
import { libelleHonorairesAmoHubAdmin } from "../../lib/crm/operationnelCrm";

const inputClass =
  "mt-1 w-full max-w-[12rem] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-right text-sm text-white focus:border-emerald-500 focus:outline-none";

function LigneMontant({ label, value, emphasis = false, hint, children }) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-2 rounded-xl border px-4 py-3 ${
        emphasis
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-slate-800 bg-slate-950/50"
      }`}
    >
      <div>
        <p className={`text-sm font-semibold ${emphasis ? "text-emerald-100" : "text-slate-200"}`}>
          {label}
        </p>
        {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
      </div>
      {children || (
        <p className={`text-lg font-semibold tabular-nums ${emphasis ? "text-white" : "text-emerald-200"}`}>
          {value == null ? "—" : euro(value)}
        </p>
      )}
    </div>
  );
}

export default function OngletFinances({
  vueFinances,
  role,
  financesCalculees,
  onFinancesChange,
  editable = false,
}) {
  const vueEdition = Boolean(financesCalculees);
  if (!vueFinances && !vueEdition) {
    return (
      <p className="mt-4 text-sm text-slate-400">
        Aucune donnée financière n’est disponible pour ce rôle ou ce dossier.
      </p>
    );
  }

  const rate = financesCalculees?.taux ?? vueFinances?.commission_rate_default;
  const libelle = vueFinances?.libelleCommission || libelleCommissionAgent(rate);
  const complete = vueEdition
    ? Boolean(financesCalculees?.visibleComplet)
    : estVueFinancesComplete(vueFinances);
  const venteHt = (financesCalculees?.venteHt || 0) > 0
    ? financesCalculees.venteHt
    : vueFinances?.venteHt;
  const commission =
    (financesCalculees?.venteHt || 0) > 0
      ? financesCalculees.commission
      : vueFinances?.commission_amount;

  return (
    <div className="mt-4 space-y-4">
      <LigneMontant
        label={`${libelle} :`}
        value={commission}
        emphasis
        hint={
          vueFinances?.commercialNom
            ? `Commercial rattaché : ${vueFinances.commercialNom}`
            : "Règle 10 % HT du montant des travaux (prix de vente client)."
        }
      />

      {complete ? (
        <>
          {editable && onFinancesChange ? (
            <>
              <LigneMontant
                label={LIBELLE_COUT_CLYVE}
                hint={`Coût interne Clyve par dossier — montage Anah / aides. Non facturé au client. Déduit de la marge nette ENERGIA. ${libelleHonorairesAmoHubAdmin()}`}
              >
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  value={financesCalculees.coutClyveHt ?? COUT_CLYVE_HT_DEFAUT}
                  onChange={(event) =>
                    onFinancesChange({
                      coutClyveHt: event.target.value === "" ? null : event.target.value,
                    })
                  }
                />
              </LigneMontant>
              {financesCalculees.recetteCoordinationHt > 0 ? (
                <>
                  <LigneMontant
                    label="Recette Coordination & suivi HT (client)"
                    value={financesCalculees.recetteCoordinationHt}
                    hint="Ligne devis — honoraires ENERGIA facturés au client."
                  />
                  <LigneMontant
                    label="Bénéfice net Coordination ENERGIA"
                    value={financesCalculees.margeNetteCoordination}
                    emphasis
                    hint={`${euro(financesCalculees.recetteCoordinationHt)} HT facturés − ${euro(financesCalculees.coutClyveHt)} HT Clyve.`}
                  />
                </>
              ) : null}
              <LigneMontant
                label="Coût d’achat matériel HT"
                hint="Saisie administrateur — interne, hors devis client."
              >
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  value={financesCalculees.coutMaterielHt ?? ""}
                  onChange={(event) =>
                    onFinancesChange({
                      coutMaterielHt: event.target.value === "" ? null : event.target.value,
                    })
                  }
                />
              </LigneMontant>
              <LigneMontant
                label="Pose sous-traitance RGE HT"
                hint="Devis artisans RGE — non déduit du devis client."
              >
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  value={financesCalculees.coutPoseRgeHt ?? ""}
                  onChange={(event) =>
                    onFinancesChange({
                      coutPoseRgeHt: event.target.value === "" ? null : event.target.value,
                    })
                  }
                />
              </LigneMontant>
              <LigneMontant
                label="Taux commission commerciale / apporteur (%)"
                hint="Défaut 10 % HT."
              >
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  className={inputClass}
                  value={financesCalculees.taux ?? 10}
                  onChange={(event) =>
                    onFinancesChange({
                      tauxCommission: event.target.value === "" ? 10 : event.target.value,
                    })
                  }
                />
              </LigneMontant>
            </>
          ) : (
            <LigneMontant
              label="Coût artisan HT"
              value={vueFinances?.coutArtisanHt}
              hint="À renseigner depuis les devis artisans. Non déduit du devis client."
            />
          )}
          <LigneMontant
            label="Prix de vente HT (client)"
            value={venteHt}
            hint="Identique au devis. La commission n’est pas ajoutée au HT/TTC client."
          />
          {financesCalculees?.coutRevient != null ? (
            <LigneMontant
              label="Coût de revient HT (matériel + pose RGE)"
              value={financesCalculees.coutRevient}
            />
          ) : null}
          <LigneMontant
            label="Marge brute ENERGIA"
            value={financesCalculees?.margeBrute ?? null}
            hint="Vente HT − coût de revient HT."
          />
          {financesCalculees?.sousTraitance?.applicable ? (
            <LigneMontant
              label="Marge brute supplémentaire (achat fabricant)"
              value={financesCalculees.sousTraitance.extraMargeCaptureeHt}
              emphasis={financesCalculees.sousTraitance.extraMargeCaptureeHt > 0}
              hint="Écart entre forfait fourniture+pose artisan et (matériel direct ENERGIA + pose seule). Captée uniquement sur les postes en mode Pose seule."
            />
          ) : null}
          <LigneMontant
            label="Commission partenaire HT"
            value={vueFinances?.partner_commission}
            hint="Apporteur d’affaires (ex. Catarina) — montant configuré à part, 0 € si non paramétré."
          />
          <LigneMontant
            label="Marge nette ENERGIA"
            value={financesCalculees?.margeNette ?? vueFinances?.net_margin}
            hint="Marge brute − commission commerciale HT − Clyve."
          />
          {financesCalculees?.margeNette == null && vueFinances?.net_margin == null ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              Marge nette non calculable tant que le coût matériel / pose RGE n’est pas renseigné. La
              commission agent 10 % HT reste due sur le montant de vente.
            </p>
          ) : null}
        </>
      ) : (
        <p className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-xs text-slate-400">
          Vue commerciale : seule votre commission de {rate} % HT est affichée. La marge nette
          ENERGIA, les coûts artisans et la commission partenaire restent masqués.
        </p>
      )}

      {role === "administrateur" ? (
        <p className="text-[11px] text-slate-500">
          Ces montants sont internes au CRM. Ils n’apparaissent pas sur le devis client et ne
          modifient pas les tarifs fermes (DualSun, etc.).
        </p>
      ) : null}
    </div>
  );
}
