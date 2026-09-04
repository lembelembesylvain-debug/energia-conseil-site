import { useState } from "react";
import {
  CGV_DEVIS_CLIENT,
  CONTACT_CHIFFRAGE,
  LOGO_PUBLIC_PATH,
  formatEuro,
  formatUnite,
  type DevisClientChiffrage as DevisClientData,
  type LigneDevisClientDetail,
} from "../../lib/chiffrage";
import { generateDevisPdf, type DevisClientPdfLigne } from "../../lib/generateDevisPdf";

type Props = {
  devis: DevisClientData;
  libelleProjet: string;
  numero?: string;
  clientNom?: string;
  clientAdresse?: string;
  date?: string;
  validite?: string;
  mentionTva?: string;
};

function formatTva(taux: number): string {
  return `${(taux * 100).toLocaleString("fr-FR", {
    minimumFractionDigits: taux === 0.055 ? 1 : 0,
    maximumFractionDigits: 1,
  })} %`;
}

function lignesAffichees(devis: DevisClientData): LigneDevisClientDetail[] {
  if (devis.lignesDetaillees?.length) return devis.lignesDetaillees;
  return devis.lignes.map((ligne) => ({
    id: ligne.id,
    designation: ligne.libelle,
    quantite: 1,
    unite: "forfait",
    prixUnitaireHt: ligne.montantHt,
    montantHt: ligne.montantHt,
    tauxTva: 0.055,
    montantTva: 0,
    montantTtc: ligne.montantHt,
  }));
}

function versPdfLignes(lignes: LigneDevisClientDetail[]): DevisClientPdfLigne[] {
  return lignes.map((ligne) => ({
    designation: ligne.designation,
    quantite: ligne.quantite,
    unite: ligne.unite,
    prixUnitaireHt: ligne.prixUnitaireHt,
    montantHt: ligne.montantHt,
    tauxTva: ligne.tauxTva,
    montantTva: ligne.montantTva,
    montantTtc: ligne.montantTtc,
  }));
}

export default function DevisClientPanel({
  devis,
  libelleProjet,
  numero = "DEV-2026-BROUILLON",
  clientNom = "",
  clientAdresse = "",
  date = new Date().toLocaleDateString("fr-FR"),
  validite = "3 mois",
  mentionTva,
}: Props) {
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfErreur, setPdfErreur] = useState<string | null>(null);
  const lignes = lignesAffichees(devis);

  async function exporterPdf() {
    setPdfBusy(true);
    setPdfErreur(null);
    try {
      await generateDevisPdf({
        numero,
        date,
        validite,
        clientNom: clientNom || "Client",
        clientAdresse,
        libelleProjet,
        lignes: versPdfLignes(lignes),
        totalHt: devis.totalHt,
        totalTva: devis.totalTva,
        totalTtc: devis.totalTtc,
        mentionTva,
        filename: `Devis_${numero.replace(/[^\w-]+/g, "_")}.pdf`,
      });
    } catch (error) {
      setPdfErreur(error instanceof Error ? error.message : "Export PDF impossible.");
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 print:border-0 print:shadow-none">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <img
            src={LOGO_PUBLIC_PATH}
            alt="ENERGIA CONSEIL IA®"
            className="h-auto w-[min(100%,13.5rem)] max-w-[55mm] object-contain object-left sm:w-[12.5rem]"
          />
          <p className="mt-3 text-sm font-semibold text-[#1a3c5e]">{CONTACT_CHIFFRAGE.enseigne}</p>
          <p className="text-xs text-slate-600">{CONTACT_CHIFFRAGE.fondateurQualite}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            {CONTACT_CHIFFRAGE.adresse}
            <br />
            {CONTACT_CHIFFRAGE.telephone} · {CONTACT_CHIFFRAGE.email}
            <br />
            SIRET {CONTACT_CHIFFRAGE.siret} · RCS {CONTACT_CHIFFRAGE.rcs} · {CONTACT_CHIFFRAGE.forme}
            <br />
            {CONTACT_CHIFFRAGE.assurances}
          </p>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <p className="text-2xl font-bold tracking-wide text-[#1a3c5e]">DEVIS</p>
          <p className="mt-1 font-mono text-xs text-slate-500">{numero}</p>
          <p className="text-xs text-slate-500">{date} · validité {validite}</p>
          <button
            type="button"
            onClick={() => void exporterPdf()}
            disabled={pdfBusy || lignes.length === 0}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#1a3c5e] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
          >
            {pdfBusy ? "Génération PDF…" : "Télécharger le PDF client"}
          </button>
        </div>
      </header>

      <h2 className="mt-4 text-lg font-semibold text-[#1a3c5e]">Devis client — {libelleProjet}</h2>
      {clientNom ? (
        <p className="mt-1 text-sm text-slate-600">
          {clientNom}
          {clientAdresse ? ` · ${clientAdresse}` : ""}
        </p>
      ) : null}
      <p className="mt-1 text-sm text-slate-600">
        Vue commerciale uniquement. Prestations, quantités, prix client HT, TVA, totaux HT/TTC,
        CGV et mentions légales. Aucun coût d’achat, marge, commission ni coût interne.
      </p>
      {pdfErreur ? (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {pdfErreur}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead className="bg-[#1a3c5e] text-white">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Prestation</th>
              <th className="px-3 py-2 text-right font-semibold">Qté</th>
              <th className="px-3 py-2 text-right font-semibold">Prix HT</th>
              <th className="px-3 py-2 text-right font-semibold">TVA</th>
              <th className="px-3 py-2 text-right font-semibold">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {lignes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-3 text-slate-500">
                  Aucune ligne commerciale : saisissez d’abord un coût de prestation.
                </td>
              </tr>
            ) : (
              lignes.map((ligne) => (
                <tr key={ligne.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{ligne.designation}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {ligne.quantite.toLocaleString("fr-FR")} {formatUnite(ligne.unite)}
                  </td>
                  <td className="px-3 py-2 text-right">{formatEuro(ligne.prixUnitaireHt)}</td>
                  <td className="px-3 py-2 text-right">{formatTva(ligne.tauxTva)}</td>
                  <td className="px-3 py-2 text-right font-medium">{formatEuro(ligne.montantHt)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300">
              <th className="px-3 py-2 text-left" colSpan={4}>
                Total HT
              </th>
              <td className="px-3 py-2 text-right font-bold">{formatEuro(devis.totalHt)}</td>
            </tr>
            <tr>
              <th className="px-3 py-2 text-left font-medium text-slate-600" colSpan={4}>
                TVA appliquée
              </th>
              <td className="px-3 py-2 text-right">{formatEuro(devis.totalTva)}</td>
            </tr>
            <tr className="bg-teal-50">
              <th className="px-3 py-2 text-left" colSpan={4}>
                Total TTC
              </th>
              <td className="px-3 py-2 text-right text-lg font-bold text-[#1a3c5e]">
                {formatEuro(devis.totalTtc)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {mentionTva ? <p className="mt-3 text-xs leading-relaxed text-slate-500">{mentionTva}</p> : null}

      <div className="mt-5 space-y-3 text-xs leading-relaxed text-slate-600">
        <h3 className="text-sm font-semibold text-[#1a3c5e]">Conditions générales de vente</h3>
        <ul className="list-disc space-y-1 pl-4">
          {CGV_DEVIS_CLIENT.map((mention) => (
            <li key={mention}>{mention}</li>
          ))}
        </ul>
        <h3 className="text-sm font-semibold text-[#1a3c5e]">Mentions légales</h3>
        <p>
          {CONTACT_CHIFFRAGE.enseigne} — {CONTACT_CHIFFRAGE.forme}. {CONTACT_CHIFFRAGE.adresse}.
          SIRET {CONTACT_CHIFFRAGE.siret} — RCS {CONTACT_CHIFFRAGE.rcs}. {CONTACT_CHIFFRAGE.assurances}
        </p>
      </div>
    </section>
  );
}
