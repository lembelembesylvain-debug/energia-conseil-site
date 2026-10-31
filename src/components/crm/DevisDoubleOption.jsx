import { useState } from "react";
import { euroParade } from "../../lib/crm/paradesAntiFuite";

const selectClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none";

function CarteOption({ titre, sousTitre, total, acompte, unite, fond, testid }) {
  return (
    <article className={`rounded-2xl border p-4 ${fond}`} data-testid={testid}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/90">{sousTitre}</p>
      <h4 className="mt-1 font-serif text-lg text-white">{titre}</h4>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-white">
        {euroParade(total)} <span className="text-sm font-medium text-slate-300">{unite === "HT" ? "HT" : "TTC"}</span>
      </p>
      <p className="mt-2 text-sm text-emerald-100">
        Acompte 30 % à la signature : <strong className="tabular-nums">{euroParade(acompte)}</strong>
      </p>
    </article>
  );
}

export default function DevisDoubleOption({
  calcul,
  editable = false,
  optionRetenue = "",
  onOptionRetenue,
  onAffecter,
  onModifierLot,
  onAjouterLot,
  onRetirerLot,
  recadrageRequis = false,
  recadrageOral = false,
  onRecadrageOral,
}) {
  const lots = calcul?.lots || [];
  const uniteEssentiel = calcul?.essentiels?.unite || "TTC";
  const uniteSignature = calcul?.signature?.unite || "TTC";
  const [voirPhase2, setVoirPhase2] = useState(false);
  const phase2Masquee = Boolean(calcul?.phase2Masquee) && !voirPhase2;

  return (
    <section data-testid="devis-double-option" className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
          Devis à double option
        </p>
        <h3 className="mt-1 font-serif text-lg text-white">Pack Essentiel et Pack Signature</h3>
        <p className="mt-1 text-xs text-slate-400">
          Le client peut signer l&apos;option 1 en repli, sans rejeter l&apos;ensemble du projet.
          Les lots de Phase 2 restent hors du devis Anah tant que l&apos;accord n&apos;est pas notifié.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <CarteOption
          testid="option-essentiel"
          sousTitre="Option 1"
          titre="Pack Essentiel"
          total={calcul?.essentiels?.total || 0}
          acompte={calcul?.essentiels?.acompte30 || 0}
          unite={uniteEssentiel}
          fond="border-emerald-400/40 bg-emerald-500/10"
        />
        <CarteOption
          testid="option-signature"
          sousTitre="Option 2"
          titre="Pack Signature clé en main"
          total={calcul?.signature?.total || 0}
          acompte={calcul?.signature?.acompte30 || 0}
          unite={uniteSignature}
          fond="border-sky-400/40 bg-sky-500/10"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#1a3c5e] text-[11px] uppercase tracking-wide text-white">
            <tr>
              <th className="px-3 py-2 font-medium">Lot</th>
              <th className="px-3 py-2 text-right font-medium">Montant</th>
              <th className="px-3 py-2 font-medium">Option</th>
              <th className="px-3 py-2 font-medium">Phase</th>
              {onRetirerLot ? <th className="px-3 py-2" /> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {lots.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-slate-400">
                  Ajoutez les lots prioritaires (Pack Essentiel) puis les finitions (Pack Signature).
                </td>
              </tr>
            ) : (
              lots.map((lot) => {
                const montantMasque = lot.phase === "phase2" && phase2Masquee;
                return (
                <tr key={lot.id} className={lot.phase === "phase2" ? "bg-slate-900/80" : ""}>
                  <td className="px-3 py-2 text-white">
                    {onModifierLot && editable ? (
                      <input
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                        value={lot.nom}
                        onChange={(event) => onModifierLot(lot.id, { nom: event.target.value })}
                      />
                    ) : (
                      lot.nom
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-emerald-100">
                    {montantMasque ? (
                      <span className="text-xs font-semibold text-slate-400">Masqué</span>
                    ) : onModifierLot && editable ? (
                      <input
                        type="number"
                        min="0"
                        className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-right text-sm text-white"
                        value={lot.total}
                        onChange={(event) => onModifierLot(lot.id, { totalTtc: Number(event.target.value) })}
                      />
                    ) : (
                      <>
                        {euroParade(lot.total)} {lot.unite === "HT" ? "HT" : "TTC"}
                      </>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      aria-label={`Option du lot ${lot.nom}`}
                      disabled={!editable}
                      className={selectClass}
                      value={lot.pack}
                      onChange={(event) => onAffecter?.(lot.id, { pack: event.target.value })}
                    >
                      <option value="essentiel">Essentiel (options 1 et 2)</option>
                      <option value="signature">Signature uniquement (option 2)</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      aria-label={`Phase du lot ${lot.nom}`}
                      disabled={!editable}
                      className={selectClass}
                      value={lot.phase}
                      onChange={(event) => onAffecter?.(lot.id, { phase: event.target.value })}
                    >
                      <option value="phase1">Phase 1 Anah</option>
                      <option value="phase2">Phase 2 hors Anah</option>
                    </select>
                  </td>
                  {onRetirerLot ? (
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        className="text-xs text-slate-400 hover:text-red-200"
                        onClick={() => onRetirerLot(lot.id)}
                      >
                        Retirer
                      </button>
                    </td>
                  ) : null}
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {calcul?.phase2Masquee ? (
        <button
          type="button"
          className="text-xs font-semibold text-sky-200 underline-offset-2 hover:underline"
          onClick={() => setVoirPhase2((v) => !v)}
        >
          {voirPhase2 ? "Masquer les montants de Phase 2" : "Afficher les montants de Phase 2 en interne"}
        </button>
      ) : null}
      {onAjouterLot && editable ? (
        <button
          type="button"
          onClick={onAjouterLot}
          className="rounded-xl border border-emerald-400/40 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/10"
        >
          Ajouter un lot
        </button>
      ) : null}

      <div className="grid gap-3 rounded-2xl border border-orange-400/50 bg-white p-4 text-slate-900 shadow-lg shadow-slate-950/20 sm:grid-cols-2">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={optionRetenue === "essentiel"}
            onChange={() => onOptionRetenue?.(optionRetenue === "essentiel" ? "" : "essentiel")}
          />
          <span>
            <strong>J&apos;accepte l&apos;Option 1 — Pack Essentiel</strong>
            <span className="mt-1 block text-xs text-slate-600">
              Acompte 30 % : {euroParade(calcul?.essentiels?.acompte30 || 0)}
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={optionRetenue === "signature"}
            onChange={() => onOptionRetenue?.(optionRetenue === "signature" ? "" : "signature")}
          />
          <span>
            <strong>J&apos;accepte l&apos;Option 2 — Pack Signature clé en main</strong>
            <span className="mt-1 block text-xs text-slate-600">
              Acompte 30 % : {euroParade(calcul?.signature?.acompte30 || 0)}
            </span>
          </span>
        </label>
        <p className="sm:col-span-2 text-xs text-slate-500">Fait à _______________ le _______________ — Signature client _______________</p>
      </div>

      {recadrageRequis ? (
        <label className="flex items-start gap-2 rounded-xl border border-orange-400/50 bg-orange-500/10 px-3 py-2 text-sm text-orange-50">
          <input
            type="checkbox"
            className="mt-1"
            checked={Boolean(recadrageOral)}
            onChange={(event) => onRecadrageOral?.(event.target.checked)}
          />
          <span>Appel de recadrage oral effectué avant l&apos;envoi du document.</span>
        </label>
      ) : null}
    </section>
  );
}
