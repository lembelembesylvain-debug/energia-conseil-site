"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

const DPE_ORDER = ["A", "B", "C", "D", "E", "F", "G"] as const;
export type DpeLetter = (typeof DPE_ORDER)[number];

const DPE_CELL_COLORS: Record<DpeLetter, string> = {
  A: "#166534",
  B: "#22c55e",
  C: "#a3e635",
  D: "#facc15",
  E: "#fb923c",
  F: "#ef4444",
  G: "#991b1b",
};

type DpeGaugeProps = {
  current: DpeLetter;
  target: DpeLetter;
  onPickTarget?: (d: DpeLetter) => void;
};

export function InteractiveDpeGauge({ current, target, onPickTarget }: DpeGaugeProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-800">Jauge DPE (A → G)</p>
      <div className="flex flex-wrap gap-2">
        {DPE_ORDER.map((L) => {
          const isCurrent = L === current;
          const isTarget = L === target;
          return (
            <button
              key={L}
              type="button"
              onClick={() => onPickTarget?.(L)}
              className="relative h-11 w-11 rounded-md text-sm font-bold text-white shadow-sm transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
              style={{ backgroundColor: DPE_CELL_COLORS[L] }}
              title={onPickTarget ? `Définir la cible sur ${L}` : undefined}
            >
              <span className="relative z-10">{L}</span>
              {isCurrent && (
                <span
                  className="pointer-events-none absolute inset-0 rounded-md ring-[3px] ring-black ring-offset-0"
                  aria-hidden
                />
              )}
              {isTarget && (
                <span
                  className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-emerald-600 ring-offset-1"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-zinc-600">
        Actuel <span className="font-semibold text-zinc-900">{current}</span> — Cible{" "}
        <span className="font-semibold text-emerald-700">{target}</span>
        {onPickTarget ? " (cliquez sur une lettre pour ajuster la cible)" : ""}
      </p>
    </div>
  );
}

export type RoiChartProps = {
  years: number;
  annualBillWithoutWorks: number;
  annualBillWithWorks: number;
  resteACharge: number;
};

export function DashboardRoiChart({
  years,
  annualBillWithoutWorks,
  annualBillWithWorks,
  resteACharge,
}: RoiChartProps) {
  const data = useMemo(() => {
    const rows: { year: number; sans: number; avec: number }[] = [];
    let cumSans = 0;
    let cumAvec = resteACharge;
    for (let y = 1; y <= years; y++) {
      cumSans += annualBillWithoutWorks;
      cumAvec += annualBillWithWorks;
      rows.push({ year: y, sans: Math.round(cumSans), avec: Math.round(cumAvec) });
    }
    return rows;
  }, [annualBillWithoutWorks, annualBillWithWorks, resteACharge, years]);

  const roiYear = useMemo(() => {
    const delta = annualBillWithoutWorks - annualBillWithWorks;
    if (delta <= 0 || resteACharge <= 0) return null;
    return Math.ceil(resteACharge / delta);
  }, [annualBillWithoutWorks, annualBillWithWorks, resteACharge]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-800">ROI sur {years} ans</p>
      <p className="text-xs text-zinc-600">
        Courbe rouge : coût cumulé sans travaux (facture énergétique). Courbe verte : reste à charge + facture après
        travaux.
        {roiYear != null && roiYear <= years ? (
          <>
            {" "}
            Intersection estimée vers l&apos;année <strong>{roiYear}</strong>.
          </>
        ) : null}
      </p>
      <div className="h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Année", position: "insideBottom", offset: -2, fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(v: number) => `${v.toLocaleString("fr-FR")} €`} />
            <Legend />
            <Line type="monotone" dataKey="sans" name="Sans travaux" stroke="#dc2626" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="avec" name="Avec travaux" stroke="#16a34a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export type AidesPieProps = {
  mpr: number;
  cee: number;
  tva: number;
  aidesLocales: number;
  reste: number;
};

const PIE_COLORS = ["#16a34a", "#2563eb", "#ea580c", "#9333ea", "#dc2626"];

export function DashboardAidesPie({ mpr, cee, tva, aidesLocales, reste }: AidesPieProps) {
  const data = useMemo(
    () => [
      { name: "MPR", value: Math.max(0, Math.round(mpr)) },
      { name: "CEE", value: Math.max(0, Math.round(cee)) },
      { name: "TVA", value: Math.max(0, Math.round(tva)) },
      { name: "Aides locales", value: Math.max(0, Math.round(aidesLocales)) },
      { name: "Reste à charge", value: Math.max(0, Math.round(reste)) },
    ],
    [mpr, cee, tva, aidesLocales, reste],
  );

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return <p className="text-sm text-zinc-500">Aucune donnée pour le camembert.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-800">Répartition des montants</p>
      <div className="h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={88}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => `${v.toLocaleString("fr-FR")} €`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
