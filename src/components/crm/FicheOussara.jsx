import { Download, Printer } from "lucide-react";
import { euro } from "../../lib/crm/mockData";
import {
  ASSURANCE_DECENNALE_OUSSARA,
  CHEMIN_DEVIS_OUSSARA,
  CHEMIN_PDF_OUSSARA,
  CLIENT_OUSSARA,
  FINANCEMENT_OUSSARA,
  MENTION_CERTIBAT_OUSSARA,
  MENTION_INPI_OUSSARA,
  OUSSARA_DEVIS_DATE_LONGUE,
  OUSSARA_DEVIS_NUMERO,
  OUSSARA_DEVIS_VALIDITE_LIBELLE,
  POSTES_OUSSARA_DEVIS,
  INTERLOCUTEUR_UNIQUE_OUSSARA,
  RIB_OUSSARA,
  STATUT_OUSSARA,
  TITRE_OUSSARA,
  TOTAUX_OUSSARA,
} from "../../lib/crm/oussaraColombierOfficiel.js";

function imprimerDevis() {
  const fenetre = window.open(CHEMIN_DEVIS_OUSSARA, "_blank");
  if (!fenetre) return;
  fenetre.addEventListener("load", () => fenetre.print());
}

export default function FicheOussara() {
  return (
    <div className="mt-4 space-y-4" data-testid="fiche-oussara">
      <div className="rounded-2xl border border-sky-400/40 bg-sky-500/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-200">
          Devis Contractant Général A4 — {OUSSARA_DEVIS_NUMERO}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">{CLIENT_OUSSARA.libelleSignature}</h3>
        <p className="mt-1 text-sm text-slate-200">{TITRE_OUSSARA}</p>
        <p className="mt-1 text-sm text-slate-300">Chantier : {CLIENT_OUSSARA.adresse}</p>
        <p className="mt-2 text-sm font-semibold text-white" data-testid="interlocuteur-oussara">
          {INTERLOCUTEUR_UNIQUE_OUSSARA}
        </p>
        <p className="mt-2 text-sm font-semibold text-amber-100">{STATUT_OUSSARA}</p>
        <p className="mt-1 font-mono text-xs text-sky-200">
          {OUSSARA_DEVIS_DATE_LONGUE} — Validité {OUSSARA_DEVIS_VALIDITE_LIBELLE}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          SIRET 941 819 427 00019 — 16 Rue Cuvier, 69006 Lyon — {MENTION_INPI_OUSSARA} — {ASSURANCE_DECENNALE_OUSSARA} — {MENTION_CERTIBAT_OUSSARA}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={CHEMIN_PDF_OUSSARA}
            download
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#1a3c5e] px-3 text-xs font-semibold text-white hover:bg-[#24527f]"
            data-testid="telecharger-devis-oussara"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Télécharger le Devis Officiel PDF A4
          </a>
          <button
            type="button"
            onClick={imprimerDevis}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-sky-300/50 px-3 text-xs font-semibold text-sky-50 hover:bg-sky-500/20"
            data-testid="imprimer-devis-oussara"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden />
            Imprimer le Devis
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-700">
        <table className="min-w-full text-left text-sm text-slate-100">
          <thead className="bg-[#1a3c5e] text-xs uppercase tracking-wide text-white">
            <tr>
              <th className="px-3 py-2">N°</th>
              <th className="px-3 py-2">Poste technique</th>
            </tr>
          </thead>
          <tbody>
            {POSTES_OUSSARA_DEVIS.map((poste) => (
              <tr key={poste.id} className="border-t border-slate-800">
                <td className="px-3 py-2 tabular-nums">{poste.ordreContractuel}</td>
                <td className="px-3 py-2">
                  <span className="font-medium">{poste.nom}</span>
                  <span className="mt-0.5 block text-xs text-slate-400">{poste.specifications}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="grid gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm sm:grid-cols-2" data-testid="bilan-oussara">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Total vente HT brut</dt>
          <dd className="mt-1 font-semibold text-white">{euro(TOTAUX_OUSSARA.totalHtBrut)} HT</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Geste commercial de Direction</dt>
          <dd className="mt-1 font-semibold text-orange-200">− {euro(TOTAUX_OUSSARA.gesteCommercialHt)} HT</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Total net HT</dt>
          <dd className="mt-1 font-semibold text-white">{euro(TOTAUX_OUSSARA.totalHt)} HT</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">TVA 20 %</dt>
          <dd className="mt-1 font-semibold text-white">{euro(TOTAUX_OUSSARA.totalTva)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-wide text-slate-400">Total net TTC client</dt>
          <dd className="mt-1 text-lg font-semibold text-emerald-200">{euro(TOTAUX_OUSSARA.totalTtc)} TTC</dd>
        </div>
      </dl>

      <div className="rounded-2xl border border-slate-700 p-4 text-sm text-slate-200">
        <p className="font-semibold text-white">Échéancier de paiement</p>
        <ul className="mt-2 space-y-1 tabular-nums">
          <li>{FINANCEMENT_OUSSARA.libelleAcompte} : {euro(FINANCEMENT_OUSSARA.acompte)} TTC</li>
          <li>{FINANCEMENT_OUSSARA.libelleIntermediaire} : {euro(FINANCEMENT_OUSSARA.intermediaire)} TTC</li>
          <li>{FINANCEMENT_OUSSARA.libelleSolde} : {euro(FINANCEMENT_OUSSARA.solde)} TTC</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-sky-400/40 bg-[#0b1f3a] p-4 text-sm text-slate-100" data-testid="rib-oussara">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-200">Virement de l'acompte</p>
        <p className="mt-2">Titulaire : {RIB_OUSSARA.titulaire}</p>
        <p>Banque : {RIB_OUSSARA.banque} ({RIB_OUSSARA.adresseBanque})</p>
        <p className="mt-1 font-mono text-sm">IBAN : {RIB_OUSSARA.iban}</p>
        <p className="font-mono text-sm">BIC : {RIB_OUSSARA.bic}</p>
        <p className="mt-2 text-xs text-sky-100">Référence à indiquer : {RIB_OUSSARA.referenceVirement}</p>
      </div>
    </div>
  );
}
