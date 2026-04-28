"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { computeMpr2026HorsIdf } from "@/lib/mpr";
import { supabase } from "@/lib/supabase/client";

type Step = 1 | 2 | 3;

export default function DashboardPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);

  const [surface, setSurface] = useState(100);
  const [yearBuilt, setYearBuilt] = useState(2000);
  const [homeType, setHomeType] = useState("Maison");
  const [postalCode, setPostalCode] = useState("");
  const [dpe, setDpe] = useState("F");
  const [annualIncome, setAnnualIncome] = useState(25000);
  const [householdSize, setHouseholdSize] = useState(2);

  const [isolationCombles, setIsolationCombles] = useState(true);
  const [ite, setIte] = useState(true);
  const [pacAirEau, setPacAirEau] = useState(true);
  const [vmc, setVmc] = useState(false);
  const [fenetres, setFenetres] = useState(false);
  const [solaire, setSolaire] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      setIsCheckingSession(false);
    };

    void checkSession();
  }, [router]);

  const result = useMemo(
    () =>
      computeMpr2026HorsIdf(
        {
          surface,
          annualIncome,
          householdSize,
        },
        {
          combles: isolationCombles,
          ite,
          pacAirEau,
        }
      ),
    [surface, annualIncome, householdSize, isolationCombles, ite, pacAirEau]
  );

  const onLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.push("/login");
  };

  const onPrint = (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    window.print();
  };

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <main className="mx-auto w-full max-w-4xl space-y-6">
        <header className="no-print rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Dashboard Renov&apos;Optim IA</h1>
              <p className="mt-1 text-sm text-slate-600">
                Parcours 3 etapes: logement, travaux, resultats.
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            >
              {loading ? "Deconnexion..." : "Deconnexion"}
            </button>
          </div>
        </header>

        <section className="no-print rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2 text-sm">
            {[1, 2, 3].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStep(value as Step)}
                className={`rounded-full px-3 py-1 ${
                  step === value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Etape {value}
              </button>
            ))}
          </div>

          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <InputNumber label="Surface (m2)" value={surface} onChange={setSurface} />
              <InputNumber
                label="Annee de construction"
                value={yearBuilt}
                onChange={setYearBuilt}
              />
              <InputText label="Type de logement" value={homeType} onChange={setHomeType} />
              <InputText label="Code postal" value={postalCode} onChange={setPostalCode} />
              <InputText label="DPE actuel" value={dpe} onChange={setDpe} />
              <InputNumber
                label="Revenus annuels (EUR)"
                value={annualIncome}
                onChange={setAnnualIncome}
              />
              <InputNumber
                label="Personnes du foyer (1 a 3)"
                value={householdSize}
                onChange={setHouseholdSize}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <CheckItem
                label="Isolation combles"
                checked={isolationCombles}
                onChange={setIsolationCombles}
              />
              <CheckItem label="ITE (isolation murs exterieurs)" checked={ite} onChange={setIte} />
              <CheckItem label="PAC air/eau" checked={pacAirEau} onChange={setPacAirEau} />
              <CheckItem label="VMC" checked={vmc} onChange={setVmc} />
              <CheckItem label="Fenetres" checked={fenetres} onChange={setFenetres} />
              <CheckItem label="Solaire" checked={solaire} onChange={setSolaire} />
              <p className="mt-2 text-xs text-slate-500">
                Le calcul MPR hardcode ne prend en compte que Combles, ITE et PAC air/eau.
              </p>
            </div>
          )}

          {step === 3 && (
            <div id="print-results" className="print-results space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Resultats MPR 2026 (Hors IDF)</h2>
              <p className="text-sm text-slate-600">
                Categorie detectee: <strong>{result.category}</strong>
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <ResultCard label="Aide Combles" value={result.comblesAid} />
                <ResultCard label="Aide ITE" value={result.iteAid} />
                <ResultCard label="Aide PAC air/eau" value={result.pacAid} />
                <ResultCard label="Total aides estimees" value={result.totalAid} emphasized />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p>Logement: {homeType}</p>
                <p>Surface: {surface} m2</p>
                <p>Annee: {yearBuilt}</p>
                <p>Code postal: {postalCode || "Non renseigne"}</p>
                <p>DPE actuel: {dpe}</p>
                <p>Revenus annuels: {annualIncome.toLocaleString("fr-FR")} EUR</p>
                <p>Personnes foyer: {householdSize}</p>
                <p>
                  Travaux selectionnes:{" "}
                  {[
                    isolationCombles && "Combles",
                    ite && "ITE",
                    pacAirEau && "PAC air/eau",
                    vmc && "VMC",
                    fenetres && "Fenetres",
                    solaire && "Solaire",
                  ]
                    .filter(Boolean)
                    .join(", ") || "Aucun"}
                </p>
              </div>

              <button
                type="button"
                onClick={onPrint}
                className="no-print rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Imprimer le PDF
              </button>
            </div>
          )}

          <div className="no-print mt-6 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as Step)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
              >
                Precedent
              </button>
            )}
            {step < 3 && (
              <button
                type="button"
                onClick={() => setStep((step + 1) as Step)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Suivant
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function InputNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-700">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring"
      />
    </label>
  );
}

function InputText({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-900 focus:ring"
      />
    </label>
  );
}

function CheckItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}

function ResultCard({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: number;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        emphasized
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">
        {value.toLocaleString("fr-FR")} EUR
      </p>
    </div>
  );
}
