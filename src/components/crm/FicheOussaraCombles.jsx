import { Download, Printer } from "lucide-react";
import { euro } from "../../lib/crm/mockData";
import {
  ASSURANCE_DECENNALE_OUSSARA_COMBLES,
  CHEMIN_DEVIS_OUSSARA_COMBLES,
  CHEMIN_PDF_OUSSARA_COMBLES,
  CLIENT_OUSSARA_COMBLES,
  FINANCEMENT_OUSSARA_COMBLES,
  INTERLOCUTEUR_UNIQUE_OUSSARA_COMBLES,
  OUSSARA_COMBLES_DATE_LONGUE,
  OUSSARA_COMBLES_DEVIS_NUMERO,
  OUSSARA_COMBLES_VALIDITE_LIBELLE,
  POSTES_OUSSARA_COMBLES,
  RIB_OUSSARA_COMBLES,
  SIEGE_OUSSARA_COMBLES,
  STATUT_OUSSARA_COMBLES,
  TITRE_OUSSARA_COMBLES,
  TOTAUX_OUSSARA_COMBLES,
} from "../../lib/crm/oussaraComblesOfficiel.js";

function imprimerDevis() {
  const fenetre = window.open(CHEMIN_DEVIS_OUSSARA_COMBLES, "_blank");
  if (!fenetre) return;
  fenetre.addEventListener("load", () => fenetre.print());
}

function ouvrirConsultationSousTraitant() {
  window.open(`${CHEMIN_DEVIS_OUSSARA_COMBLES}?st=1`, "_blank");
}

export default function FicheOussaraCombles() {
  return (
    <div className="mt-4 space-y-4" data-testid="fiche-oussara-combles">
      <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
          Devis officiel A4 — {OUSSARA_COMBLES_DEVIS_NUMERO}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">{CLIENT_OUSSARA_COMBLES.libelleSignature}</h3>
        <p className="mt-1 text-sm text-slate-200">{TITRE_OUSSARA_COMBLES}</p>
        <p className="mt-1 text-sm text-slate-300">Chantier : {CLIENT_OUSSARA_COMBLES.adresse}</p>
        <p className="mt-2 text-sm font-semibold text-white" data-testid="interlocuteur-oussara-combles">
          {INTERLOCUTEUR_UNIQUE_OUSSARA_COMBLES}
        </p>
        <p className="mt-2 text-sm font-semibold text-amber-100">{STATUT_OUSSARA_COMBLES}</p>
        <p className="mt-1 font-mono text-xs text-emerald-100">
          {OUSSARA_COMBLES_DATE_LONGUE} — Validité {OUSSARA_COMBLES_VALIDITE_LIBELLE}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          {SIEGE_OUSSARA_COMBLES} — {ASSURANCE_DECENNALE_OUSSARA_COMBLES}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={CHEMIN_PDF_OUSSARA_COMBLES}
            download
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#1a3c5e] px-3 text-xs font-semibold text-white hover:bg-[#24527f]"
            data-testid="telecharger-devis-oussara-combles"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Télécharger le Devis Officiel PDF A4
          </a>
          <button
            type="button"
            onClick={imprimerDevis}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-emerald-300/50 px-3 text-xs font-semibold text-emerald-50 hover:bg-emerald-500/20"
            data-testid="imprimer-devis-oussara-combles"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden />
            Imprimer le Devis
          </button>
          <button
            type="button"
            onClick={ouvrirConsultationSousTraitant}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-orange-300/60 bg-orange-500/15 px-3 text-xs font-semibold text-orange-50 hover:bg-orange-500/25"
            data-testid="consultation-sous-traitant-oussara-combles"
          >
            👷‍♂️ Version Consultation Sous-Traitant (Sans prix de vente)
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-700">
        <table className="min-w-full text-left text-sm text-slate-100">
          <thead className="bg-[#1a3c5e] text-xs uppercase tracking-wide text-white">
            <tr>
              <th className="px-3 py-2">N°</th>
              <th className="px-3 py-2">Prestation</th>
            </tr>
          </thead>
          <tbody>
            {POSTES_OUSSARA_COMBLES.map((poste) => (
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

      <dl className="grid gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm sm:grid-cols-3" data-testid="bilan-oussara-combles">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Fourniture et pose HT</dt>
          <dd className="mt-1 font-semibold text-white">{euro(TOTAUX_OUSSARA_COMBLES.totalHt)} HT</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">TVA 20 %</dt>
          <dd className="mt-1 font-semibold text-white">{euro(TOTAUX_OUSSARA_COMBLES.totalTva)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Total net TTC</dt>
          <dd className="mt-1 text-lg font-semibold text-emerald-200">{euro(TOTAUX_OUSSARA_COMBLES.totalTtc)} TTC</dd>
        </div>
      </dl>

      <div className="rounded-2xl border border-slate-700 p-4 text-sm text-slate-200">
        <p className="font-semibold text-white">Règlement</p>
        <ul className="mt-2 space-y-1 tabular-nums">
          <li>{FINANCEMENT_OUSSARA_COMBLES.libelleAcompte} : {euro(FINANCEMENT_OUSSARA_COMBLES.acompte)} TTC</li>
          <li>{FINANCEMENT_OUSSARA_COMBLES.libelleSolde} : {euro(FINANCEMENT_OUSSARA_COMBLES.solde)} TTC</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-emerald-400/40 bg-[#0b1f3a] p-4 text-sm text-slate-100" data-testid="rib-oussara-combles">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Virement Qonto</p>
        <p className="mt-2">Titulaire : {RIB_OUSSARA_COMBLES.titulaire}</p>
        <p>Banque : {RIB_OUSSARA_COMBLES.banque}</p>
        <p className="mt-1 font-mono text-sm">IBAN : {RIB_OUSSARA_COMBLES.iban}</p>
        <p className="font-mono text-sm">BIC : {RIB_OUSSARA_COMBLES.bic}</p>
        <p className="mt-2 text-xs text-emerald-100">Libellé : {RIB_OUSSARA_COMBLES.referenceVirement}</p>
      </div>
    </div>
  );
}
