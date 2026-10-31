import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";
import { htmlConventionIngenierie } from "../../lib/crm/paradesAntiFuite";

export default function ConventionIngenierieModal({ ouvert, onFermer, client, adresse, ville, reference }) {
  const html = useMemo(
    () => htmlConventionIngenierie({ client, adresse, ville, reference }),
    [client, adresse, ville, reference],
  );

  useEffect(() => {
    if (!ouvert) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onFermer?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ouvert, onFermer]);

  if (!ouvert) return null;

  const imprimer = () => {
    const frame = document.getElementById("convention-ingenierie-frame");
    const fenetre = frame?.contentWindow;
    if (fenetre) {
      fenetre.focus();
      fenetre.print();
      return;
    }
    const popup = window.open("", "_blank", "noopener,noreferrer,width=900,height=1100");
    if (!popup) return;
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="convention-ingenierie-titre"
      data-testid="modal-convention-ingenierie"
      onClick={onFermer}
    >
      <div
        className="flex h-[min(94vh,1100px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-emerald-400/40 bg-slate-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/30 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              ENERGIA CONSEIL IA® · Calipso · INPI
            </p>
            <h2 id="convention-ingenierie-titre" className="mt-1 font-serif text-lg text-white">
              Convention d&apos;assistance &amp; d&apos;ingénierie de projet
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={imprimer}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden />
              Imprimer / PDF
            </button>
            <button
              type="button"
              onClick={onFermer}
              className="rounded-lg border border-slate-700 p-1.5 text-slate-300 hover:bg-slate-800"
              aria-label="Fermer la convention"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <iframe
          id="convention-ingenierie-frame"
          title="Convention d'ingénierie"
          srcDoc={html}
          className="min-h-0 w-full flex-1 bg-white"
        />
      </div>
    </div>,
    document.body,
  );
}

export function BoutonConventionIngenierie({
  onClick,
  testId = "bouton-convention-ingenierie",
  label = "[📄 Convention d'Ingénierie]",
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-950/40 hover:bg-emerald-500"
    >
      {label}
    </button>
  );
}
