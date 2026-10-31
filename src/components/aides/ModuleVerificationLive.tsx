import { useState } from "react";
import { URL_ANAH_GOUV, mentionLegaleAidesVerifiees } from "../../lib/aides/verificationLive.js";
import BadgeVerificationLive from "./BadgeVerificationLive";

type LigneVerification = {
  id: string;
  libelle: string;
  dateVerificationWeb: string | null;
  verifieeWeb: boolean;
};

type VerificationAidesDossier = {
  source_verification_url: string | null;
  aides_verifiees_web: boolean;
  aides_date_verification_web: string | null;
  aides_verifiees_web_par: string | null;
  lignes: LigneVerification[];
};

type Props = {
  verification: VerificationAidesDossier;
  admin?: boolean;
  onDateLigne?: (ligneId: string, date: string | null) => void;
  onMarquerVerifieesWeb?: (url: string) => void;
  onSourceUrl?: (url: string) => void;
};

export default function ModuleVerificationLive({
  verification,
  admin = false,
  onDateLigne,
  onMarquerVerifieesWeb,
  onSourceUrl,
}: Props) {
  const [url, setUrl] = useState(verification.source_verification_url || URL_ANAH_GOUV);

  return (
    <section className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-800">
        Vérification live
      </p>
      <h3 className="mt-1 text-base font-semibold text-slate-900">Barèmes d’aides — contrôle web</h3>
      <p className="mt-2 text-sm text-slate-700">{mentionLegaleAidesVerifiees()}</p>
      <p className="mt-2 text-xs text-slate-600">
        Source :{" "}
        {admin && onSourceUrl ? (
          <input
            type="url"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              onSourceUrl(event.target.value);
            }}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs"
          />
        ) : (
          <a href={verification.source_verification_url || URL_ANAH_GOUV} className="underline" target="_blank" rel="noopener noreferrer">
            {verification.source_verification_url || URL_ANAH_GOUV}
          </a>
        )}
      </p>

      <ul className="mt-4 space-y-3">
        {verification.lignes.map((ligne) => (
          <li key={ligne.id} className="rounded-lg border border-white bg-white/80 px-3 py-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-sm font-medium text-slate-900">{ligne.libelle}</p>
              <BadgeVerificationLive dateVerificationWeb={ligne.dateVerificationWeb} compact />
            </div>
            {admin && onDateLigne ? (
              <label className="mt-2 block text-[11px] text-slate-500">
                Confirmer la date de dernière vérification web
                <input
                  type="date"
                  value={ligne.dateVerificationWeb ?? ""}
                  onChange={(event) => onDateLigne(ligne.id, event.target.value || null)}
                  className="mt-1 block rounded border border-slate-300 px-2 py-1 text-sm text-slate-900"
                />
              </label>
            ) : null}
          </li>
        ))}
      </ul>

      {admin && onMarquerVerifieesWeb ? (
        <button
          type="button"
          onClick={() => onMarquerVerifieesWeb(url || URL_ANAH_GOUV)}
          className="mt-4 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
        >
          Marquer les aides « Vérifiées Web »
        </button>
      ) : null}

      {verification.aides_verifiees_web ? (
        <p className="mt-3 text-xs font-medium text-emerald-800">
          Aides marquées Vérifiées Web
          {verification.aides_verifiees_web_par ? ` par ${verification.aides_verifiees_web_par}` : ""}
          {verification.aides_date_verification_web
            ? ` le ${verification.aides_date_verification_web}`
            : ""}
          .
        </p>
      ) : (
        <p className="mt-3 text-xs font-medium text-orange-800">
          Aides non marquées « Vérifiées Web » — le statut Validé reste bloqué.
        </p>
      )}
    </section>
  );
}
