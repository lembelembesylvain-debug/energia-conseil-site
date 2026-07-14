import { calculateEnergyAids } from "../lib/calculators/energy-calculator";
import type { CalculationResult, DPEClass, Region } from "../lib/calculators/types";
import {
  getNormeForYear,
  getDefaultDPEForYear,
  getConsoParM2ForYearAndDPE,
  getDPEIncoherenceMessage,
  getEligibilityStatus,
  estimateFactureFromNormes,
  computeFourchettesFreemium,
} from "../lib/calculators/normes-thermiques";
import { useCallback, useMemo, useState } from "react";

/** Freemium : masque les détails financiers avancés et affiche le bloc conversion Premium */
const FREEMIUM = true;

type TabId = "calculateur" | "audit";

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

const fmtCo2 = (t: number) =>
  t.toLocaleString("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

const TRAVAUX_PRESETS: Record<string, number> = {
  essentiel: 25000,
  performance: 43000,
  performancePlus: 55000,
  excellence: 67500,
};

function dpeIndex(dpe: DPEClass): number {
  return "ABCDEFG".indexOf(dpe);
}

function buildWorks(totalCost: number) {
  const roof = Math.round(totalCost * 0.12);
  const walls = Math.round(totalCost * 0.28);
  const windows = Math.round(totalCost * 0.1);
  const vmc = Math.round(totalCost * 0.06);
  const pac = Math.round(totalCost * 0.32);
  const ballon = Math.round(totalCost * 0.07);
  const remainder = totalCost - roof - walls - windows - vmc - pac - ballon;

  return {
    roofInsulation: { type: "combles", surface: 80, rValue: 8, estimatedCost: roof },
    iti: { type: "iti", surface: 100, rValue: 3.7, estimatedCost: walls + Math.max(0, remainder) },
    windows: { type: "fenetres", quantity: 8, estimatedCost: windows },
    vmcDoubleFlux: { type: "vmc_df", estimatedCost: vmc },
    heatPumpAirWater: { type: "pac", cop: 4.5, estimatedCost: pac },
    thermodynamicWaterHeater: { type: "ballon", estimatedCost: ballon },
  };
}

function estimateMonthlyLoan(resteACharge: number, years = 15): number {
  if (resteACharge <= 0) return 0;
  return Math.round(resteACharge / (years * 12));
}

function estimateGainNetMensuel(
  economiesMois: number,
  mensualite: number,
): number {
  return Math.round(economiesMois - mensualite);
}

function buildProjection30Ans(
  resteACharge: number,
  economiesAnnuelles: number,
): { year: number; cumul: number }[] {
  const rows: { year: number; cumul: number }[] = [];
  let cumul = -resteACharge;
  for (let year = 1; year <= 30; year += 1) {
    cumul += economiesAnnuelles;
    rows.push({ year, cumul });
  }
  return rows;
}

function AuditPremiumBlock({ onCheckout }: { onCheckout: () => void }) {
  return (
    <div className="rounded-2xl border-4 border-emerald-600 bg-emerald-50 p-6 md:p-8 shadow-lg">
      <h3 className="text-xl md:text-2xl font-bold text-emerald-900 mb-3">
        🚀 Passez au niveau supérieur !
      </h3>
      <p className="text-emerald-800 font-medium mb-4">
        Débloquez l&apos;analyse complète de votre projet :
      </p>
      <ul className="space-y-2 text-emerald-900 text-sm md:text-base mb-2">
        <li>✅ Votre plan de financement détaillé sur 30 ans</li>
        <li>✅ Le ROI précis de votre batterie solaire</li>
        <li>✅ Tous les détails des aides au centime près</li>
        <li>✅ Votre Rapport d&apos;Audit IA complet de 85 pages</li>
      </ul>
      <p className="text-emerald-700 text-sm italic mb-1">
        (Envoyé par email sous 5 minutes après paiement)
      </p>
      <button type="button" onClick={onCheckout} className="big-green-button">
        Je veux mon Audit IA Premium (199 €)
      </button>
    </div>
  );
}

function PlanFinancementCourtierTable({
  montantTravaux,
  resteACharge,
  economiesAnnuelles,
}: {
  montantTravaux: number;
  resteACharge: number;
  economiesAnnuelles: number;
}) {
  const mensualite = estimateMonthlyLoan(montantTravaux);
  const economiesMois = Math.round(economiesAnnuelles / 12);
  const gainNet = estimateGainNetMensuel(economiesMois, mensualite);

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        💳 Plan de Financement Courtier
      </h3>
      <p className="text-xs text-amber-700 mb-3">
        Aides financières 2026 (estimation à titre indicatif). Montants définitifs
        après instruction ANAH et CEE.
      </p>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td className="py-2 text-gray-600">Montant financé (FABIEN)</td>
            <td className="py-2 text-right font-semibold">{fmt(montantTravaux)}</td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600">Mensualité estimée (15 ans)</td>
            <td className="py-2 text-right font-semibold text-teal-700">
              {fmt(mensualite)}/mois
            </td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600">Économies chauffage/mois</td>
            <td className="py-2 text-right font-semibold text-emerald-700">
              +{fmt(economiesMois)}/mois
            </td>
          </tr>
          <tr className="bg-emerald-50">
            <td className="py-3 font-bold text-emerald-900">Gain net mensuel</td>
            <td className="py-3 text-right font-bold text-emerald-800">
              {gainNet >= 0 ? "+" : ""}
              {fmt(gainNet)}/mois
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Projection30AnsTable({
  resteACharge,
  economiesAnnuelles,
}: {
  resteACharge: number;
  economiesAnnuelles: number;
}) {
  const rows = buildProjection30Ans(resteACharge, economiesAnnuelles);
  const breakeven = rows.find((r) => r.cumul >= 0)?.year;

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        📈 Projection sur 30 ans
      </h3>
      {breakeven ? (
        <p className="text-sm text-emerald-700 mb-3">
          Rentabilité estimée à <strong>{breakeven} ans</strong>
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[280px]">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 pr-4">Année</th>
              <th className="py-2 text-right">Bénéfice net cumulé</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[5, 10, 15, 20, 25, 30].map((year) => {
              const row = rows[year - 1];
              return (
                <tr key={year}>
                  <td className="py-2 text-gray-600">An {year}</td>
                  <td
                    className={`py-2 text-right font-medium ${
                      row.cumul >= 0 ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {fmt(row.cumul)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ROIBatterieBlock({ roiBatterieAns }: { roiBatterieAns: number }) {
  const alerte = roiBatterieAns > 12;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2">🔋 ROI Batterie</h3>
        <p className="text-2xl font-bold text-amber-800">
          {roiBatterieAns.toFixed(1)} ans
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Retour sur investissement batterie LFP 7 kWh (option solaire)
        </p>
      </div>
      {alerte ? (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4 text-red-800 text-sm">
          ⚠️ <strong>Alerte :</strong> le ROI batterie dépasse 12 ans — l&apos;analyse
          Premium détaille les scénarios avec et sans stockage pour optimiser votre
          rentabilité.
        </div>
      ) : null}
    </div>
  );
}

type AuditSimulatorProps = {
  onBack: () => void;
};

export default function AuditSimulator({ onBack }: AuditSimulatorProps) {
  const [activeTab, setActiveTab] = useState<TabId>("calculateur");
  const [calculated, setCalculated] = useState(false);

  const [surface, setSurface] = useState(100);
  const [anneeConstruction, setAnneeConstruction] = useState(1985);
  const [consommationReelle, setConsommationReelle] = useState<number | "">("");
  const [revenus, setRevenus] = useState(25000);
  const [personnes, setPersonnes] = useState(2);
  const [region, setRegion] = useState<Region>("OTHER");
  const [dpeActuel, setDpeActuel] = useState<DPEClass>(() =>
    getDefaultDPEForYear(1985),
  );
  const [dpeVise, setDpeVise] = useState<DPEClass>("B");
  const [presetTravaux, setPresetTravaux] = useState("performancePlus");

  const montantTravaux = TRAVAUX_PRESETS[presetTravaux] ?? 55000;

  const eligibility = getEligibilityStatus(anneeConstruction);
  const dpeIncoherentMessage = getDPEIncoherenceMessage(dpeActuel, anneeConstruction);
  const norme = getNormeForYear(anneeConstruction);
  const normeBadge = `🏗️ Norme applicable : ${norme.norme} (construction ${anneeConstruction})`;
  const consoParM2Estimee = getConsoParM2ForYearAndDPE(anneeConstruction, dpeActuel);
  const annualConsumption =
    consommationReelle === "" ? undefined : Number(consommationReelle);

  const result: CalculationResult | null = useMemo(() => {
    if (!calculated || eligibility.status === "blocked") return null;
    return calculateEnergyAids(
      {
        income: revenus,
        householdSize: personnes,
        zipCode: "69000",
        region,
      },
      {
        surface,
        constructionYear: anneeConstruction,
        type: "MAISON",
        dpeActuel,
        dpeVise,
        heatingType: "GAZ",
        annualConsumption,
      },
      buildWorks(montantTravaux),
      true,
    );
  }, [
    calculated,
    eligibility.status,
    revenus,
    personnes,
    region,
    surface,
    anneeConstruction,
    dpeActuel,
    dpeVise,
    montantTravaux,
    annualConsumption,
  ]);

  const factureAvant = estimateFactureFromNormes(
    surface,
    anneeConstruction,
    dpeActuel,
    annualConsumption,
  );
  const factureApres = estimateFactureFromNormes(
    surface,
    anneeConstruction,
    dpeVise,
    annualConsumption,
    dpeActuel,
  );
  const economiesAnnuelles =
    result?.economiesAnnuelles ?? Math.max(0, factureAvant - factureApres);
  const resteACharge = result?.resteACharge ?? montantTravaux;
  const totalAides = result?.totalAides ?? 0;
  const roiBatterieAns = 14.5;

  const fourchettesFreemium = useMemo(() => {
    if (!calculated) return null;
    return computeFourchettesFreemium(
      surface,
      anneeConstruction,
      dpeActuel,
      dpeVise,
      annualConsumption,
    );
  }, [
    calculated,
    surface,
    anneeConstruction,
    dpeActuel,
    dpeVise,
    annualConsumption,
  ]);

  const goCheckout = useCallback(() => {
    window.alert(
      "Paiement Audit Premium (199 €) — intégration Stripe à configurer.",
    );
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (eligibility.status === "blocked") return;
    setCalculated(true);
    setActiveTab("audit");
  };

  if (eligibility.status === "blocked") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-950 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <button
              type="button"
              onClick={onBack}
              className="mb-4 inline-block text-sm text-emerald-200/90 underline-offset-2 hover:text-white hover:underline"
            >
              ← Retour à l&apos;accueil
            </button>
            <p className="text-emerald-200/80 text-sm font-medium tracking-wide uppercase mb-1">
              ENERGIA-CONSEIL IA®
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Simulateur rénovation énergétique 2026
            </h1>
          </header>
          <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-8 text-center shadow-xl">
            <p className="text-lg font-semibold text-red-800 leading-relaxed">
              {eligibility.message}
            </p>
            <button
              type="button"
              onClick={onBack}
              className="mt-6 px-6 py-3 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-700"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </main>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "calculateur", label: "Calculateur" },
    { id: "audit", label: "Audit Énergétique" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-block text-sm text-emerald-200/90 underline-offset-2 hover:text-white hover:underline"
          >
            ← Retour à l&apos;accueil
          </button>
          <p className="text-emerald-200/80 text-sm font-medium tracking-wide uppercase mb-1">
            ENERGIA-CONSEIL IA®
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Simulateur rénovation énergétique 2026
          </h1>
          <p className="text-teal-100/90 mt-2 text-sm md:text-base">
            Estimation gratuite · Audit complet Premium 199 €
          </p>
        </header>

        <div
          className="flex rounded-xl bg-white/10 p-1 mb-6 backdrop-blur-sm"
          role="tablist"
          aria-label="Sections simulateur"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              disabled={tab.id === "audit" && !calculated}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-emerald-900 shadow-md"
                  : "text-white/80 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "calculateur" ? (
          <section
            role="tabpanel"
            className="rounded-2xl bg-white p-6 md:p-8 shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📋 Vos informations
            </h2>
            <form onSubmit={handleCalculate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Surface (m²)
                  </span>
                  <input
                    type="number"
                    min={20}
                    max={500}
                    value={surface}
                    onChange={(e) => setSurface(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Année de construction
                  </span>
                  <input
                    type="number"
                    min={1800}
                    max={new Date().getFullYear()}
                    value={anneeConstruction}
                    onChange={(e) => {
                      const year = Number(e.target.value);
                      setAnneeConstruction(year);
                      setDpeActuel(getDefaultDPEForYear(year));
                    }}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                  <p className="mt-1 text-xs text-teal-700">{normeBadge}</p>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Consommation réelle annuelle (kWh) — optionnel
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={consommationReelle}
                  onChange={(e) =>
                    setConsommationReelle(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder={`Par défaut : ${Math.round(consoParM2Estimee)} kWh/m²/an (${Math.round(consoParM2Estimee * surface)} kWh/an)`}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </label>

              {dpeIncoherentMessage ? (
                <div className="rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {dpeIncoherentMessage}
                </div>
              ) : null}

              {eligibility.status === "warning" && eligibility.message ? (
                <div className="rounded-lg border border-orange-400 bg-orange-50 px-4 py-3 text-sm text-orange-900">
                  {eligibility.message}
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Revenus annuels (€)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={revenus}
                    onChange={(e) => setRevenus(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Personnes au foyer
                  </span>
                  <select
                    value={personnes}
                    onChange={(e) => setPersonnes(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} personne{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Région</span>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 md:max-w-xs"
                >
                  <option value="OTHER">Hors Île-de-France</option>
                  <option value="IDF">Île-de-France</option>
                </select>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    DPE actuel
                  </span>
                  <select
                    value={dpeActuel}
                    onChange={(e) => setDpeActuel(e.target.value as DPEClass)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5"
                  >
                    {(["G", "F", "E", "D", "C"] as DPEClass[]).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    DPE typique pour {anneeConstruction} : {norme.dpeTypique.join(" ou ")}
                  </p>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    DPE visé
                  </span>
                  <select
                    value={dpeVise}
                    onChange={(e) => setDpeVise(e.target.value as DPEClass)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5"
                  >
                    {(["D", "C", "B", "A"] as DPEClass[]).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Bouquet de travaux
                </span>
                <select
                  value={presetTravaux}
                  onChange={(e) => setPresetTravaux(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5"
                >
                  <option value="essentiel">Essentiel — 25 000 €</option>
                  <option value="performance">Performance — 43 000 €</option>
                  <option value="performancePlus">Performance+ — 55 000 €</option>
                  <option value="excellence">Excellence — 67 500 €</option>
                </select>
              </label>

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:shadow-lg transition-shadow"
              >
                📈 Calculer mon audit gratuit
              </button>
            </form>
          </section>
        ) : null}

        {activeTab === "audit" && result ? (
          <section role="tabpanel" className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300/50 p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ⚡ Synthèse de votre audit (aperçu gratuit)
              </h2>

              <div className="rounded-xl border border-teal-300 bg-white/90 p-4 mb-6">
                <h3 className="text-sm font-bold text-gray-800 mb-2">
                  Profil énergétique
                </h3>
                <span className="inline-flex items-center rounded-full bg-teal-100 border border-teal-300 px-3 py-1.5 text-sm font-medium text-teal-900">
                  {result.profilEnergetique.normeBadge}
                </span>
                {result.profilEnergetique.dpeIncoherentMessage ? (
                  <p className="mt-3 text-sm text-amber-800">
                    {result.profilEnergetique.dpeIncoherentMessage}
                  </p>
                ) : null}
                {result.profilEnergetique.eligibilityMessage ? (
                  <p className="mt-3 text-sm text-orange-800">
                    {result.profilEnergetique.eligibilityMessage}
                  </p>
                ) : null}
                {fourchettesFreemium ? (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-center">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Économies/an
                      </p>
                      <p className="mt-1 text-sm font-bold text-emerald-800">
                        Entre {fmt(fourchettesFreemium.economies.min)} et{" "}
                        {fmt(fourchettesFreemium.economies.max)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-teal-200 bg-teal-50/80 px-4 py-3 text-center">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Réduction CO₂/an
                      </p>
                      <p className="mt-1 text-sm font-bold text-teal-800">
                        Entre {fmtCo2(fourchettesFreemium.co2.min)} t/an et{" "}
                        {fmtCo2(fourchettesFreemium.co2.max)} t/an
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <p className="text-xs text-gray-500">Travaux TTC</p>
                  <p className="font-bold text-gray-900">{fmt(montantTravaux)}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <p className="text-xs text-gray-500">Aides estimées</p>
                  <p className="font-bold text-emerald-700">{fmt(totalAides)}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <p className="text-xs text-gray-500">Reste à charge</p>
                  <p className="font-bold text-teal-800">{fmt(resteACharge)}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <p className="text-xs text-gray-500">Profil MPR</p>
                  <p className="font-bold text-gray-900">
                    {result.maPrimeRenov.category}
                  </p>
                </div>
              </div>

              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                Aides financières 2026 (estimation à titre indicatif). Aides à valider
                selon revenus réels du client. Montants définitifs après instruction
                ANAH et CEE.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl bg-white/70 p-4 text-center">
                  <p className="text-xs text-gray-500">Facture AVANT</p>
                  <p className="text-lg font-bold text-amber-700">
                    {fmt(factureAvant)}/an
                  </p>
                  <p className="text-xs text-gray-500">DPE {dpeActuel}</p>
                </div>
                <div className="rounded-xl bg-white/70 p-4 text-center">
                  <p className="text-xs text-gray-500">Facture APRÈS</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {fmt(factureApres)}/an
                  </p>
                  <p className="text-xs text-gray-500">DPE {dpeVise}</p>
                </div>
              </div>

              <p className="text-center text-emerald-800 font-semibold">
                Gain DPE : {dpeActuel} → {dpeVise} (
                {Math.max(0, dpeIndex(dpeActuel) - dpeIndex(dpeVise))} classe
                {Math.max(0, dpeIndex(dpeActuel) - dpeIndex(dpeVise)) > 1 ? "s" : ""})
                · Économies ~{fmt(economiesAnnuelles)}/an
              </p>
            </div>

            {FREEMIUM ? (
              <AuditPremiumBlock onCheckout={goCheckout} />
            ) : (
              <div className="space-y-6">
                <PlanFinancementCourtierTable
                  montantTravaux={montantTravaux}
                  resteACharge={resteACharge}
                  economiesAnnuelles={economiesAnnuelles}
                />
                <Projection30AnsTable
                  resteACharge={resteACharge}
                  economiesAnnuelles={economiesAnnuelles}
                />
                <ROIBatterieBlock roiBatterieAns={roiBatterieAns} />
              </div>
            )}

            <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl" aria-hidden>
                  🍒
                </span>
                <div>
                  <h3 className="text-xl font-bold">Cerise sur le gâteau</h3>
                  <p className="text-amber-200 text-sm">
                    Option Solaire Haute Performance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                {[
                  { icon: "☀️", title: "DualSun Bifacial", sub: "6 kWc · +30 % production" },
                  { icon: "⚡", title: "Enphase IQ8", sub: "Micro-onduleurs · anti-ombrage" },
                  { icon: "🔋", title: "Batterie LFP 7 kWh", sub: "Autoconsommation optimisée" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl bg-white/10 border border-white/10 p-4 text-center"
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-slate-300 mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>

              {FREEMIUM ? (
                <div className="rounded-xl bg-emerald-900/40 border border-emerald-500/40 p-4 text-emerald-100 text-sm leading-relaxed">
                  L&apos;analyse complète de rentabilité de votre option solaire, avec
                  projections financières et ROI détaillé, est disponible dans votre{" "}
                  <strong className="text-white">Audit IA Premium</strong>.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-slate-300 mb-1">ROI sur 30 ans (solaire)</p>
                    <p className="text-2xl font-bold text-emerald-400">8,2 ans</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-slate-300 mb-1">Gain net solaire/mois</p>
                    <p className="text-2xl font-bold text-emerald-400">+196 €</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4 md:col-span-2">
                    <p className="text-slate-300 mb-1">Mensualité option solaire</p>
                    <p className="text-xl font-bold">~89 €/mois (Éco-PTZ complémentaire)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center pb-8">
              <button
                type="button"
                onClick={goCheckout}
                className="big-green-button max-w-lg mx-auto text-base md:text-lg"
              >
                Je veux mon Audit IA complet (40-60 pages) sous 48h — 199 €
              </button>
              <p className="text-teal-100/70 text-xs mt-4">
                Paiement sécurisé Stripe · Remboursé si travaux &gt; 10 000 €
              </p>
            </div>
          </section>
        ) : null}

        {activeTab === "audit" && !result ? (
          <div className="rounded-2xl bg-white/10 p-8 text-center text-white">
            <p>Complétez d&apos;abord le calculateur pour voir votre audit.</p>
            <button
              type="button"
              onClick={() => setActiveTab("calculateur")}
              className="mt-4 text-emerald-200 underline hover:text-white"
            >
              Retour au calculateur
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
