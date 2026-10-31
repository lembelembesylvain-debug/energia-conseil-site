import {
  CONSULTATION_DUO_CATARINA,
  estApporteurCatarina,
} from "../../lib/crm/operationnelCrm.js";

export default function ConsultationDuoCatarina({ apporteurId, cochee = false, compact = false }) {
  if (!estApporteurCatarina(apporteurId) || cochee !== true) return null;

  if (compact) {
    return (
      <span
        className="inline-flex items-center rounded-full border border-violet-400/40 bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-100"
        title={CONSULTATION_DUO_CATARINA.deductibilite}
      >
        {CONSULTATION_DUO_CATARINA.label}
      </span>
    );
  }

  return (
    <article className="rounded-xl border border-violet-400/40 bg-violet-500/10 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200">
        Canal Catarina Martins · La Signature Immobilière
      </p>
      <p className="mt-1 text-sm font-semibold text-violet-50">{CONSULTATION_DUO_CATARINA.label}</p>
      <p className="mt-0.5 text-[11px] text-violet-100/80">{CONSULTATION_DUO_CATARINA.hint}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-violet-100/90">
        {CONSULTATION_DUO_CATARINA.deductibilite}
      </p>
    </article>
  );
}
