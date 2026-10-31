import { useMemo, useState } from "react";
import InsalubriteRadar from "./InsalubriteRadar";
import { libelleProbleme } from "../../lib/crm/insalubrite";
import { lireDossiersInsalubrite } from "../../lib/crm/dossiersInsalubrite";

export default function AssociationVue() {
  const [tick, setTick] = useState(0);
  const dossiers = useMemo(() => lireDossiersInsalubrite(), [tick]);

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
        Radar réservé à l'association. Les points correspondent à des zones ou bâtiments agrégés —
        jamais à une personne. RAPHAËLLE et l'administrateur peuvent ouvrir un dossier vide, puis
        le compléter uniquement après contact et consentement.
      </p>
      <InsalubriteRadar onDossierCree={() => setTick((n) => n + 1)} />
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
          Dossiers insalubrité ({dossiers.length})
        </h2>
        {dossiers.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            Aucun dossier pour l'instant. Créez-en un depuis une zone de la carte.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {dossiers.map((dossier) => (
              <li
                key={dossier.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-sm text-slate-200"
              >
                <p className="font-medium text-white">
                  {libelleProbleme(dossier.type_pb)} · {dossier.city} — {dossier.quartier}
                </p>
                <p className="mt-1 text-xs text-slate-400">{dossier.zone_label}</p>
                <p className="mt-1 text-[11px] text-amber-200">
                  Statut : en attente de consentement · urgence {dossier.urgency_score}/5
                </p>
                <p className="mt-1 text-[11px] text-slate-500">{dossier.notes}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
