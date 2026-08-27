import type { DevisClientChiffrage as DevisClientData } from "../../lib/chiffrage";
import { formatEuro } from "../../lib/chiffrage";

type Props = {
  devis: DevisClientData;
  libelleProjet: string;
};

export default function DevisClientPanel({ devis, libelleProjet }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm print:border-0 print:shadow-none">
      <h2 className="text-lg font-semibold text-[#1a3c5e]">Devis client — {libelleProjet}</h2>
      <p className="mt-1 text-sm text-slate-600">
        Vue commerciale uniquement. Les coûts internes, marges et prix payés aux
        sous-traitants ne figurent pas sur ce document.
      </p>
      <table className="mt-4 w-full border-collapse text-sm">
        <thead className="bg-[#1a3c5e] text-white">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Désignation</th>
            <th className="px-3 py-2 text-right font-semibold">Montant HT</th>
          </tr>
        </thead>
        <tbody>
          {devis.lignes.length === 0 ? (
            <tr>
              <td colSpan={2} className="px-3 py-3 text-slate-500">
                Aucune ligne commerciale : saisissez d’abord un coût de prestation.
              </td>
            </tr>
          ) : (
            devis.lignes.map((ligne) => (
              <tr key={ligne.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{ligne.libelle}</td>
                <td className="px-3 py-2 text-right font-medium">{formatEuro(ligne.montantHt)}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-300">
            <th className="px-3 py-2 text-left">Total HT</th>
            <td className="px-3 py-2 text-right font-bold">{formatEuro(devis.totalHt)}</td>
          </tr>
          <tr>
            <th className="px-3 py-2 text-left font-medium text-slate-600">TVA</th>
            <td className="px-3 py-2 text-right">{formatEuro(devis.totalTva)}</td>
          </tr>
          <tr className="bg-teal-50">
            <th className="px-3 py-2 text-left">Total TTC</th>
            <td className="px-3 py-2 text-right text-lg font-bold text-[#1a3c5e]">
              {formatEuro(devis.totalTtc)}
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
