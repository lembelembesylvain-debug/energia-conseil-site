import { useState } from "react";
import { Link } from "react-router-dom";
import { generateRapportLaGenetePdf } from "../../lib/generateRapportLaGenetePdf";
import {
  CLYVE_CONTRAT_DATE_TXT,
  CLYVE_CONTRAT_NUMERO,
  CLYVE_CONTRAT_TITRE,
  ECHEANCIER_CLYVE_PHASE_1,
  TOTAUX_CLYVE_PHASE_1,
  TOTAUX_CLYVE_PHASE_1_ET_2,
} from "../../lib/crm/clyveLaGeneteContrat";
import { euro } from "../../data/longereLaGenete";

export default function BoutonRapportLaGenete() {
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function telecharger() {
    setEnCours(true);
    setMessage(null);
    setErreur(null);
    try {
      await generateRapportLaGenetePdf();
      setMessage(`Contrat officiel ouvert — ${CLYVE_CONTRAT_NUMERO}. Enregistrez-le en PDF depuis la fenêtre d'impression.`);
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : "Génération du contrat impossible.");
    } finally {
      setEnCours(false);
    }
  }

  return (
    <section className="mt-5 rounded-xl border-2 border-[#0B1F3A] bg-[#0B1F3A] p-4 text-white print:hidden">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
        Document client — charte Contractant Général
      </p>
      <h3 className="mt-1 text-lg font-semibold">{CLYVE_CONTRAT_TITRE}</h3>
      <p className="mt-1 text-sm text-slate-300">
        Mme Clyve A. — Cabinet HUB ADMIN · 71290 La Genête · {CLYVE_CONTRAT_DATE_TXT}
      </p>
      <p className="mt-2 font-mono text-xs text-emerald-200">{CLYVE_CONTRAT_NUMERO}</p>

      <dl className="mt-3 grid gap-2 border-t border-white/15 pt-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-400">Prix ferme Phase 1</dt>
          <dd className="text-sm font-semibold tabular-nums text-emerald-300">
            {euro(TOTAUX_CLYVE_PHASE_1.totalHt)} HT · {euro(TOTAUX_CLYVE_PHASE_1.totalTtc)} TTC
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Option Phase 1+2</dt>
          <dd className="text-sm font-semibold tabular-nums text-emerald-300">
            {euro(TOTAUX_CLYVE_PHASE_1_ET_2.totalHt)} HT · {euro(TOTAUX_CLYVE_PHASE_1_ET_2.totalTtc)} TTC
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-slate-400">Échéancier 30 / 40 / 30</dt>
          <dd className="text-sm tabular-nums text-slate-200">
            Commande {euro(ECHEANCIER_CLYVE_PHASE_1.acompte)} · Démarrage {euro(ECHEANCIER_CLYVE_PHASE_1.intermediaire)} ·
            Réception {euro(ECHEANCIER_CLYVE_PHASE_1.solde)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void telecharger()}
          disabled={enCours}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#0B1F3A] disabled:opacity-60"
        >
          {enCours ? "Préparation du contrat…" : "Télécharger le PDF client"}
        </button>
        <Link
          to="/contrat-lagenete"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white"
        >
          Ouvrir le contrat officiel
        </Link>
        <Link
          to="/longere-la-genete"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white"
        >
          Fiche chantier
        </Link>
      </div>

      {message ? (
        <p className="mt-3 text-xs text-emerald-300" role="status">
          {message}
        </p>
      ) : null}
      {erreur ? (
        <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-200" role="alert">
          {erreur}
        </p>
      ) : null}
    </section>
  );
}
