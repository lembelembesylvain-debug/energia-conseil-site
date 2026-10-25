import type { StatutTransaction } from "../../lib/proptech/statutTransactionDvf";

const TEINTES: Record<NonNullable<StatutTransaction["id"]>, string> = {
  vendu_recent: "border-emerald-400/50 bg-emerald-500/15 text-emerald-50",
  vente_active: "border-cyan-400/50 bg-cyan-500/15 text-cyan-50",
  bailleur_interdit: "border-rose-400/50 bg-rose-500/15 text-rose-50",
  occupant_historique: "border-slate-500/50 bg-slate-700/40 text-slate-200",
};

export default function StatutTransactionBloc({ statut }: { statut: StatutTransaction | null | undefined }) {
  if (!statut?.id) return null;
  return (
    <section className={`mt-3 rounded-xl border p-3 ${TEINTES[statut.id]}`} data-testid="statut-transaction">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">Statut de la transaction</p>
      <p className="mt-1 text-sm font-semibold">{statut.titre}</p>
      <p className="mt-1 text-[12px] leading-snug">{statut.detail}</p>
      {statut.approche ? <p className="mt-2 text-[11px] leading-snug opacity-90">{statut.approche}</p> : null}
    </section>
  );
}
