import {
  ALERTE_VERIFICATION_ANAH,
  LIBELLE_BADGE_VERIFICATION_WEB,
  URL_ANAH_GOUV,
  formaterDateFr,
  verificationWebObsolete,
} from "../../lib/aides/verificationLive.js";

type Props = {
  dateVerificationWeb?: string | null;
  compact?: boolean;
};

export default function BadgeVerificationLive({ dateVerificationWeb = null, compact = false }: Props) {
  const obsolete = verificationWebObsolete(dateVerificationWeb);
  const dateAffichee = dateVerificationWeb ? formaterDateFr(dateVerificationWeb) : "Non vérifiée";

  return (
    <div className={compact ? "mt-1 space-y-1" : "space-y-1"}>
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          obsolete
            ? "border-orange-400 bg-orange-50 text-orange-950"
            : "border-emerald-400 bg-emerald-50 text-emerald-950"
        }`}
      >
        {LIBELLE_BADGE_VERIFICATION_WEB} : {dateAffichee}
      </span>
      {obsolete ? (
        <p className="rounded border border-orange-400 bg-orange-50 px-2 py-1 text-[11px] font-medium text-orange-950">
          {ALERTE_VERIFICATION_ANAH}{" "}
          <a
            href={URL_ANAH_GOUV}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            anah.gouv.fr
          </a>
        </p>
      ) : null}
    </div>
  );
}
