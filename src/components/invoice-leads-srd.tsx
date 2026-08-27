export default function InvoiceLeadsSrd() {
  return (
    <div className="min-h-screen bg-white text-black print:bg-white">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 18mm 16mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="no-print fixed right-6 top-6 z-50">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-sm border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium tracking-wide text-neutral-900 shadow-sm transition hover:border-neutral-500 hover:bg-neutral-50"
        >
          Imprimer
        </button>
      </div>

      <article className="mx-auto max-w-[780px] px-8 py-14 print:max-w-none print:px-0 print:py-0">
        <header className="flex items-start justify-between gap-8 border-b border-neutral-300 pb-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-500">
              Facture
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
              ENERGIA CONSEIL IA
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              16 Rue Cuvier
              <br />
              69006 Lyon
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-neutral-950">
              FAC-2026-08-LEADS
            </p>
            <p className="mt-1 text-sm text-neutral-500">04/08/2026</p>
          </div>
        </header>

        <section className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
              Émetteur
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-950">
              ENERGIA CONSEIL IA
            </p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">
              16 Rue Cuvier
              <br />
              69006 Lyon
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
              Client
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-950">
              SRD Conseils
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              À l&apos;attention de Damien Richard
            </p>
          </div>
        </section>

        <section className="mt-12">
          <div className="overflow-hidden border border-neutral-300">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-300 bg-neutral-50">
                  <th className="px-4 py-3 font-medium text-neutral-700">
                    Désignation
                  </th>
                  <th className="w-16 px-4 py-3 text-center font-medium text-neutral-700">
                    Qté
                  </th>
                  <th className="w-36 px-4 py-3 text-right font-medium text-neutral-700">
                    Prix unitaire
                  </th>
                  <th className="w-36 px-4 py-3 text-right font-medium text-neutral-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-neutral-200 px-4 py-5 align-top text-neutral-800">
                    <p className="font-medium text-neutral-950">
                      Pack Leads « TravauxOptim »
                    </p>
                    <p className="mt-2 max-w-md text-[13px] leading-relaxed text-neutral-600">
                      Configuration du flux de leads exclusifs via la plateforme
                      TravauxOptim pour les 10 départements cibles.
                    </p>
                  </td>
                  <td className="border-b border-neutral-200 px-4 py-5 text-center align-top text-neutral-800">
                    1
                  </td>
                  <td className="border-b border-neutral-200 px-4 py-5 text-right align-top tabular-nums text-neutral-800">
                    6&nbsp;000,00&nbsp;€
                  </td>
                  <td className="border-b border-neutral-200 px-4 py-5 text-right align-top font-semibold tabular-nums text-neutral-950">
                    6&nbsp;000,00&nbsp;€
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 flex justify-end">
          <div className="w-full max-w-sm border border-neutral-300">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 text-sm text-neutral-600">
              <span>Sous-total</span>
              <span className="tabular-nums">6&nbsp;000,00&nbsp;€</span>
            </div>
            <div className="flex items-center justify-between bg-neutral-50 px-4 py-4">
              <span className="text-sm font-semibold tracking-wide text-neutral-950">
                Total à payer
              </span>
              <span className="text-lg font-bold tabular-nums tracking-tight text-neutral-950">
                6&nbsp;000,00&nbsp;€&nbsp;TTC
              </span>
            </div>
          </div>
        </section>

        <p className="mt-4 text-right text-xs italic text-neutral-500">
          TVA non applicable, art. 293 B du CGI
        </p>

        <section className="mt-12 border border-neutral-300 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            Paiement
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
              <dt className="text-neutral-500">Mode</dt>
              <dd className="font-medium text-neutral-950">Virement bancaire</dd>
            </div>
            <div className="flex flex-col gap-1 border-t border-neutral-200 pt-3 sm:flex-row sm:justify-between">
              <dt className="text-neutral-500">Libellé obligatoire</dt>
              <dd className="font-semibold tracking-wide text-neutral-950">
                JMPG2026146240
              </dd>
            </div>
          </dl>
        </section>

        <footer className="mt-14 border-t border-neutral-300 pt-6 text-center text-[11px] leading-relaxed text-neutral-500">
          ENERGIA CONSEIL IA — 16 Rue Cuvier, 69006 Lyon
          <br />
          Facture n° FAC-2026-08-LEADS — 04/08/2026
        </footer>
      </article>
    </div>
  );
}
