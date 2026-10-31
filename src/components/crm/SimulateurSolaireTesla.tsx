import { useMemo, useState } from "react";
import {
  PROFILS_BATTERIE,
  PUISSANCES_KWC,
  SAISIE_DEFAUT,
  euroSimulateur,
  simulerSolaireTesla,
  type OptionBatterie,
  type PuissanceKwc,
  type SaisieSolaireTesla,
} from "../../lib/crm/simulateurSolaireTesla";
import { telechargerPropositionSolaireTesla } from "../../lib/crm/propositionSolaireTeslaPdf";

type Props = {
  clientNomInitial?: string;
};

function JaugeIndependance({ taux }: { taux: number }) {
  const rayon = 54;
  const perimetre = 2 * Math.PI * rayon;
  const progression = Math.min(1, Math.max(0, taux));
  const offset = perimetre * (1 - progression);
  const affiche = Math.round(progression * 100);

  return (
    <div className="relative mx-auto h-44 w-44" aria-hidden>
      <svg viewBox="0 0 140 140" className="h-full w-full">
        <circle cx="70" cy="70" r={rayon} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={rayon}
          fill="none"
          stroke="#34d399"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={perimetre}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 700ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-mono text-4xl font-semibold tabular-nums text-white">{affiche} %</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-emerald-300">Indépendance</p>
      </div>
    </div>
  );
}

export default function SimulateurSolaireTesla({ clientNomInitial = "" }: Props) {
  const [clientNom, setClientNom] = useState(clientNomInitial);
  const [saisie, setSaisie] = useState<SaisieSolaireTesla>(SAISIE_DEFAUT);
  const resultat = useMemo(() => simulerSolaireTesla(saisie), [saisie]);

  const patcher = (partial: Partial<SaisieSolaireTesla>) => {
    setSaisie((current) => ({ ...current, ...partial }));
  };

  return (
    <section
      data-testid="simulateur-solaire-tesla"
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg shadow-slate-950/40"
    >
      <header className="border-b border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
              ENERGIA CONSEIL IA®
            </p>
            <h2 className="mt-2 max-w-xl text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Dimensionnement Solaire Hybride & Stockage Haute Capacité
            </h2>
          </div>
          <p className="max-w-xs rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-center text-[11px] font-semibold leading-snug text-red-100">
            Partenaire Agréé Tesla Energy — Powerwall 3 & Wall Connector
          </p>
        </div>
      </header>

      <figure className="border-b border-slate-800 bg-slate-900">
        <img
          src="/assets/solaire/maison-solaire-stockage.jpg"
          alt="Coupe 16:9 d'une maison solaire : panneaux plein noir 9 kWc, batterie murale, Wall Connector, onduleur hybride, tableau électrique, compteur bidirectionnel et flux d'autoconsommation"
          className="aspect-video w-full object-cover"
          width={1024}
          height={574}
        />
        <figcaption className="px-5 py-2 text-[11px] leading-relaxed text-slate-400 sm:px-6">
          Coupe de référence 9 kWc : toiture photovoltaïque, batterie murale haute capacité, borne véhicule,
          onduleur hybride, coffret et échanges avec le réseau.
        </figcaption>
      </figure>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] sm:p-6">
        <div className="space-y-5">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Nom du foyer
            </span>
            <input
              value={clientNom}
              onChange={(event) => setClientNom(event.target.value)}
              placeholder="Nom du client"
              className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            />
          </label>

          <label className="block">
            <span className="flex items-baseline justify-between gap-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Facture d&apos;électricité annuelle
              <span className="font-mono text-sm normal-case tracking-normal text-white">
                {euroSimulateur(saisie.factureAnnuelleEur)} / an
              </span>
            </span>
            <input
              type="range"
              min={600}
              max={8000}
              step={50}
              value={Math.min(8000, Math.max(600, saisie.factureAnnuelleEur))}
              onChange={(event) => patcher({ factureAnnuelleEur: Number(event.target.value) })}
              className="mt-3 w-full accent-emerald-400"
              aria-valuetext={`${saisie.factureAnnuelleEur} euros par an`}
            />
            <input
              type="number"
              min={0}
              step={50}
              value={saisie.factureAnnuelleEur}
              onChange={(event) => patcher({ factureAnnuelleEur: Number(event.target.value) })}
              className="mt-2 w-36 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-sm text-white"
            />
          </label>

          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Surface de toiture ou puissance souhaitée
            </legend>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {PUISSANCES_KWC.map((kwc) => (
                <button
                  key={kwc}
                  type="button"
                  onClick={() => patcher({ puissanceKwc: kwc as PuissanceKwc })}
                  className={`rounded-xl border px-2 py-3 font-mono text-sm font-semibold ${
                    saisie.puissanceKwc === kwc
                      ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                  }`}
                  aria-pressed={saisie.puissanceKwc === kwc}
                >
                  {kwc} kWc
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Option stockage batterie
            </legend>
            <div className="mt-2 space-y-2">
              {PROFILS_BATTERIE.map((profil) => (
                <label
                  key={profil.id}
                  className={`flex cursor-pointer gap-3 rounded-xl border px-3 py-3 ${
                    saisie.batterie === profil.id
                      ? "border-emerald-400/70 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-900/70"
                  }`}
                >
                  <input
                    type="radio"
                    name="batterie-tesla"
                    className="mt-1 accent-emerald-400"
                    checked={saisie.batterie === profil.id}
                    onChange={() => patcher({ batterie: profil.id as OptionBatterie })}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-white">{profil.titre}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">{profil.detail}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Tesla Wall Connector (borne 22 kW)
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { id: true, label: "Oui" },
                { id: false, label: "Non" },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => patcher({ wallConnector: option.id })}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                    saisie.wallConnector === option.id
                      ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
                      : "border-slate-700 bg-slate-900 text-slate-300"
                  }`}
                  aria-pressed={saisie.wallConnector === option.id}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="space-y-4" aria-live="polite">
          <article className="rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-5">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Taux d&apos;indépendance énergétique
            </p>
            <JaugeIndependance taux={resultat.independance} />
            <p className="sr-only">
              Indépendance énergétique {Math.round(resultat.independance * 100)} pour cent. Économie{" "}
              {euroSimulateur(resultat.economieAnnuelleEur)} par an. Total indicatif{" "}
              {euroSimulateur(resultat.prixTotalTtc)}.
            </p>
            <p className="text-center text-xs text-slate-400">
              {resultat.productionKwh.toLocaleString("fr-FR")} kWh produits / an ·{" "}
              {resultat.consommationKwh.toLocaleString("fr-FR")} kWh consommés
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Économie estimée
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-emerald-300">
              {euroSimulateur(resultat.economieAnnuelleEur)}
              <span className="ml-2 text-base font-medium text-slate-400">/ an</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Maison {euroSimulateur(resultat.economieMaisonEur)}
              {resultat.saisie.wallConnector
                ? ` · recharge véhicule sur surplus ${euroSimulateur(resultat.economieBorneEur)}`
                : ""}
              .
            </p>
          </article>

          <article
            className={`rounded-2xl border p-4 ${
              resultat.secoursActif
                ? "border-emerald-400/40 bg-emerald-500/10"
                : "border-slate-800 bg-slate-900/50"
            }`}
          >
            <p className="text-sm font-semibold text-white">
              Alimentation de secours (back-up) en cas de coupure Enedis
            </p>
            <p className={`mt-1 text-xs ${resultat.secoursActif ? "text-emerald-200" : "text-slate-400"}`}>
              {resultat.secoursActif
                ? "Activée — les circuits prioritaires restent alimentés par la Powerwall 3."
                : "Inactive — sans batterie, la centrale s'arrête avec le réseau."}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Prix indicatif clé en main
            </p>
            <p className="mt-1 text-xs text-slate-500">Matériel + pose par l&apos;équipe certifiée RGE / QualiPV</p>
            <dl className="mt-3 space-y-1.5 text-sm text-slate-300">
              <div className="flex justify-between gap-3">
                <dt>Centrale {saisie.puissanceKwc} kWc</dt>
                <dd className="font-mono tabular-nums">{euroSimulateur(resultat.prixCentraleTtc)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Powerwall 3</dt>
                <dd className="font-mono tabular-nums">{euroSimulateur(resultat.prixBatteriesTtc)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Wall Connector</dt>
                <dd className="font-mono tabular-nums">{euroSimulateur(resultat.prixBorneTtc)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-slate-800 pt-2 text-base font-semibold text-white">
                <dt>Total TTC indicatif</dt>
                <dd className="font-mono tabular-nums">{euroSimulateur(resultat.prixTotalTtc)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => {
                void telechargerPropositionSolaireTesla(resultat, clientNom);
              }}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/30 hover:from-emerald-400 hover:to-teal-300"
            >
              Générer la Proposition Commerciale Solaire & Tesla PDF
            </button>
          </article>
        </div>
      </div>

      <p className="border-t border-slate-800 px-5 py-3 text-[10px] leading-relaxed text-slate-500 sm:px-6">
        Simulation à titre indicatif. Productivité Centre 1 100 kWh/kWc/an, électricité 0,25 €/kWh TTC.
        Prix hors aides, à confirmer après visite de toiture. La borne 22 kW dépend de l&apos;alimentation
        disponible. Le photovoltaïque s&apos;installe après l&apos;isolation et le dimensionnement du chauffage.
        Aides financières 2026 non déduites : à valider selon éligibilité en vigueur, montants définitifs
        après instruction.
      </p>
    </section>
  );
}
