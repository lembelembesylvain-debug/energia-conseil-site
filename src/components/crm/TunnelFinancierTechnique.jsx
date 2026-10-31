import { euro } from "../../lib/crm/mockData";
import { CANAL_ECO_PTZ_ETAT } from "../../lib/crm/editionDossier";
import { calculerTunnelProptech } from "../../lib/crm/tunnelProptech";
import CanauxFinancement from "./CanauxFinancement";

function Etape({ n, titre, valeur, detail, emphasis }) {
  return (
    <li
      className={`rounded-xl border px-4 py-3 ${
        emphasis ? "border-emerald-500/40 bg-emerald-500/10" : "border-slate-800 bg-slate-950/50"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {n}. {titre}
      </p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${emphasis ? "text-white" : "text-emerald-200"}`}>
        {valeur}
      </p>
      {detail ? <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{detail}</p> : null}
    </li>
  );
}

export default function TunnelFinancierTechnique({
  edition,
  prixM2Constate,
  dpeActuel,
  onAppliquerEcoPtz,
  editable = false,
}) {
  const tunnel = calculerTunnelProptech(edition, { prixM2Constate, dpeActuel });
  const { totaux, aides, resteACharge, ecoPtzAuto, plusValue, roi, surfaces } = tunnel;
  const roiTxt =
    roi.pourcentage != null
      ? `+${Math.round(plusValue.montant).toLocaleString("fr-FR")} € / ${Math.round(roi.pourcentage)} %`
      : "—";

  return (
    <section className="mt-5 rounded-2xl border border-sky-500/25 bg-slate-950/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">
            Tunnel financier & technique
          </p>
          <h3 className="mt-1 text-sm font-semibold text-white">Cascade automatique 2026</h3>
        </div>
        {editable && onAppliquerEcoPtz ? (
          <button
            type="button"
            className="rounded-lg border border-sky-400/40 bg-sky-500/15 px-3 py-1.5 text-[11px] font-semibold text-sky-100 hover:bg-sky-500/25"
            onClick={() => onAppliquerEcoPtz(ecoPtzAuto)}
          >
            Appliquer l’Éco-PTZ auto ({euro(ecoPtzAuto.montant)} / {ecoPtzAuto.duree} ans)
          </button>
        ) : null}
      </div>

      <ol className="mt-4 grid gap-2 md:grid-cols-2">
        <Etape
          n="1"
          titre="Surface × PU catalogue"
          valeur={
            surfaces.surfaceRef != null
              ? `${surfaces.surfaceRef} m² · ${euro(totaux.totalHt)} HT`
              : euro(totaux.totalHt)
          }
          detail="Prix unitaires Catalogue Tarifs Marché 2026 (médiane ou tarif ferme). Ordre thermique conservé."
        />
        <Etape n="2" titre="Total travaux TTC" valeur={euro(totaux.totalTtc)} detail={`TVA rénovation sur ${euro(totaux.totalTva)}.`} />
        <Etape
          n="3"
          titre="Aides d’État (indicatif)"
          valeur={euro(aides.totalAides)}
          detail={
            aides.nonCumulCeeParcours
              ? `MaPrimeRénov’ ${euro(aides.mpr)}. CEE et Coup de pouce : 0,00 € (${aides.mentionCee}). Aides locales : ${euro(aides.locales)} (saisie manuelle). ${aides.mention}`
              : `MaPrimeRénov’ ${euro(aides.mpr)} + CEE ${euro(aides.cee)} + coup de pouce ${euro(aides.coupDePouce)} + locales ${euro(aides.locales)}. ${aides.mention}`
          }
        />
        <Etape n="4" titre="Reste à charge net" valeur={euro(resteACharge)} emphasis />
        <Etape
          n="5"
          titre={CANAL_ECO_PTZ_ETAT.option}
          valeur={euro(ecoPtzAuto.mensualite)}
          detail={`${euro(ecoPtzAuto.montant)} sur ${ecoPtzAuto.duree} ans à 0,00 %. ${ecoPtzAuto.duree === 20 ? `${euro(ecoPtzAuto.mensualite15)} / mois sur 15 ans.` : `${euro(ecoPtzAuto.mensualite20)} / mois sur 20 ans.`} ${CANAL_ECO_PTZ_ETAT.rappel}`}
        />
        <Etape
          n="6"
          titre="Plus-value vénale / ROI"
          valeur={roiTxt}
          emphasis
          detail={
            plusValue.calculable
              ? `Valeur actuelle estimée ${euro(plusValue.valeurActuelle)} × prime ${(plusValue.prime * 100).toFixed(1)} % (${plusValue.prixM2.toLocaleString("fr-FR")} €/m²). ${plusValue.mention}`
              : "Renseignez la surface habitable pour estimer la plus-value."
          }
        />
      </ol>

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Deux canaux pour le reste à charge
        </p>
        <CanauxFinancement
          compact
          resteACharge={resteACharge}
          montantEcoPtz={ecoPtzAuto.montant}
          dureeEcoPtz={ecoPtzAuto.duree}
        />
      </div>
    </section>
  );
}
