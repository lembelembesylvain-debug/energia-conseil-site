import { useState } from "react";
import {
  CONDITIONS_PAIEMENT_DEVIS,
  CONTACT_CHIFFRAGE,
  LOGO_PUBLIC_PATH,
  OBJET_TRAVAUX_DEFAUT,
  formatEuro,
  formatUnite,
  type DevisClientChiffrage as DevisClientData,
  type LigneDevisClientDetail,
} from "../../lib/chiffrage";
import {
  formatTvaTaux,
  generateDevisPdf,
  texteOuACompleter,
  totauxDevisClient,
  type DevisClientPdfEtudeFinanciere,
  type DevisClientPdfGesteCommercial,
  type DevisClientPdfLigne,
} from "../../lib/generateDevisPdf";

type Props = {
  devis: DevisClientData;
  libelleProjet: string;
  objetTravaux?: string;
  introductionProjet?: string;
  numero?: string;
  clientNom?: string;
  clientAdresse?: string;
  clientEmail?: string;
  clientTelephone?: string;
  adresseFacturation?: string;
  referenceDossier?: string;
  statut?: string;
  date?: string;
  validite?: string;
  mentionTva?: string;
  etudeFinanciere?: DevisClientPdfEtudeFinanciere;
  gesteCommercial?: DevisClientPdfGesteCommercial;
};

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
    description: ligne.description,
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
  objetTravaux = OBJET_TRAVAUX_DEFAUT,
  introductionProjet,
  numero = "DEV-2026-BROUILLON",
  clientNom = "",
  clientAdresse = "",
  clientEmail,
  clientTelephone,
  adresseFacturation,
  referenceDossier,
  statut = "Estimatif — non contractuel",
  date = new Date().toLocaleDateString("fr-FR"),
  validite = CONDITIONS_PAIEMENT_DEVIS.validite,
  mentionTva,
  etudeFinanciere,
  gesteCommercial,
}: Props) {
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfErreur, setPdfErreur] = useState<string | null>(null);
  const lignes = lignesAffichees(devis);
  const pdfInput = {
    numero,
    date,
    validite,
    clientNom: clientNom || "À compléter",
    clientAdresse,
    clientEmail,
    clientTelephone,
    adresseFacturation,
    referenceDossier,
    statut,
    libelleProjet,
    objetTravaux,
    introductionProjet,
    lignes: versPdfLignes(lignes),
    totalHt: devis.totalHt,
    totalTva: devis.totalTva,
    totalTtc: devis.totalTtc,
    mentionTva,
    etudeFinanciere,
    gesteCommercial,
  };
  const totaux = totauxDevisClient(pdfInput);
  const facturation =
    adresseFacturation?.trim() && adresseFacturation.trim() !== clientAdresse.trim()
      ? adresseFacturation.trim()
      : null;
  const intro = introductionProjet || objetTravaux;
  const statutAlerte = /estimation|non contractuel/i.test(statut);

  async function exporterPdf() {
    setPdfBusy(true);
    setPdfErreur(null);
    try {
      await generateDevisPdf({
        ...pdfInput,
        filename: `Devis_${numero.replace(/[^\w-]+/g, "_")}.pdf`,
      });
    } catch (error) {
      setPdfErreur(error instanceof Error ? error.message : "Export PDF impossible.");
    } finally {
      setPdfBusy(false);
    }
  }

  const champsClient: [string, string][] = [
    ["Nom du client", texteOuACompleter(clientNom)],
    ["Adresse du chantier", texteOuACompleter(clientAdresse)],
    ["Téléphone", texteOuACompleter(clientTelephone)],
    ["E-mail", texteOuACompleter(clientEmail)],
    ["Référence dossier / audit", texteOuACompleter(referenceDossier)],
  ];
  if (facturation) champsClient.push(["Adresse de facturation", facturation]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[#f4f7f5] p-3 shadow-sm sm:p-5 print:border-0 print:bg-white print:p-0 print:shadow-none">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm font-semibold text-[#1a3c5e]">Aperçu du devis client</p>
        <button
          type="button"
          onClick={() => void exporterPdf()}
          disabled={pdfBusy}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#14532d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pdfBusy ? "Génération PDF…" : "Télécharger le PDF client"}
        </button>
      </div>
      {pdfErreur ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 print:hidden" role="alert">
          {pdfErreur}
        </p>
      ) : null}

      <article className="mx-auto max-w-[210mm] overflow-hidden bg-white text-slate-800 shadow-md print:max-w-none print:shadow-none">
        <div className="h-2 bg-[#14532d]" />
        <header className="grid gap-6 px-6 pt-6 pb-4 sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(13rem,18rem)] sm:px-8">
          <img
            src={LOGO_PUBLIC_PATH}
            alt="ENERGIA CONSEIL IA®"
            className="h-auto w-[min(100%,64mm)] max-w-[70mm] object-contain object-left"
          />
          <div className="min-w-0 self-center">
            <p className="text-base font-bold text-[#14532d]">{CONTACT_CHIFFRAGE.enseigne}</p>
            <p className="mt-1 text-sm font-semibold text-[#1a3c5e]">
              {CONTACT_CHIFFRAGE.dirigeant} — {CONTACT_CHIFFRAGE.fondateurQualite}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              {CONTACT_CHIFFRAGE.adresse}
              <br />
              {CONTACT_CHIFFRAGE.telephone} · {CONTACT_CHIFFRAGE.email}
              <br />
              SIRET {CONTACT_CHIFFRAGE.siret} · RCS {CONTACT_CHIFFRAGE.rcs} · {CONTACT_CHIFFRAGE.forme}
              <br />
              {CONTACT_CHIFFRAGE.assurances}
            </p>
          </div>
          <div className="rounded-xl bg-[#1a3c5e] px-4 py-4 text-white">
            <p className="text-center text-2xl font-bold tracking-wide">DEVIS</p>
            <dl className="mt-3 space-y-2 text-xs">
              {[
                ["N°", numero],
                ["Émission", date],
                ["Validité", validite],
                ["Objet", libelleProjet],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="font-semibold uppercase tracking-wide text-emerald-200">{label}</dt>
                  <dd className="text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {statutAlerte ? (
          <p className="mx-6 mb-4 inline-flex rounded-md bg-red-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-red-700 sm:mx-8">
            {texteOuACompleter(statut)}
          </p>
        ) : (
          <p className="mx-6 mb-4 text-xs font-semibold text-[#1a3c5e] sm:mx-8">{texteOuACompleter(statut)}</p>
        )}

        <section className="mx-6 mb-5 rounded-xl border border-slate-200 border-l-4 border-l-[#14532d] bg-white px-5 py-4 sm:mx-8">
          <h2 className="text-sm font-bold text-[#1a3c5e]">Informations client</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            {champsClient.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-0.5 text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-6 mb-5 rounded-xl bg-[#ecfdf5] px-5 py-4 sm:mx-8">
          <h2 className="text-sm font-bold text-[#14532d]">Objet du projet</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{intro}</p>
        </section>

        <div className="mx-6 mb-5 max-w-full overflow-hidden sm:mx-8">
          <table className="w-full max-w-full table-fixed border-collapse text-[12px] leading-snug sm:text-[13px]">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[26%]" />
              <col className="w-[7%]" />
              <col className="w-[8%]" />
              <col className="w-[15%]" />
              <col className="w-[7%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="bg-[#14532d] text-white">
              <tr>
                <th className="px-1.5 py-2 text-left font-semibold break-words sm:px-2">Désignation</th>
                <th className="px-1.5 py-2 text-left font-semibold break-words sm:px-2">Description</th>
                <th className="px-1 py-2 text-right font-semibold break-words">Qté</th>
                <th className="px-1 py-2 text-left font-semibold break-words">Unité</th>
                <th className="px-1 py-2 text-right font-semibold break-words">Prix unitaire HT</th>
                <th className="px-1 py-2 text-right font-semibold break-words">TVA</th>
                <th className="px-1 py-2 text-right font-semibold break-words">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {lignes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-2 py-3 text-slate-500">
                    Aucune ligne commerciale : saisissez d’abord un coût de prestation.
                  </td>
                </tr>
              ) : (
                lignes.map((ligne, index) => (
                  <tr key={ligne.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="min-w-0 px-1.5 py-2 align-top font-semibold break-words text-slate-900 sm:px-2">
                      {ligne.designation}
                    </td>
                    <td className="min-w-0 px-1.5 py-2 align-top break-words text-slate-600 sm:px-2">
                      {ligne.description || "—"}
                    </td>
                    <td className="px-1 py-2 text-right align-top tabular-nums">
                      {ligne.quantite.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-1 py-2 align-top break-words">{formatUnite(ligne.unite)}</td>
                    <td className="px-1 py-2 text-right align-top break-words tabular-nums">
                      {formatEuro(ligne.prixUnitaireHt)}
                    </td>
                    <td className="px-1 py-2 text-right align-top tabular-nums">
                      {formatTvaTaux(ligne.tauxTva)}
                    </td>
                    <td className="px-1 py-2 text-right align-top font-semibold break-words tabular-nums">
                      {formatEuro(ligne.montantHt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {gesteCommercial ? (
          <section className="mx-6 mb-5 rounded-xl border border-orange-300 bg-[#fff7ed] px-5 py-4 sm:mx-8">
            <p className="text-sm text-slate-800">
              <span className="font-semibold">{gesteCommercial.vmcLibelle}</span>
              {" — Montant TTC : "}
              <span className="font-bold tabular-nums">{formatEuro(gesteCommercial.vmcMontantTtc)}</span>
            </p>
            <h3 className="mt-3 text-sm font-bold text-[#14532d]">{gesteCommercial.titre}</h3>
            <p className="mt-1 text-sm text-slate-800">
              {gesteCommercial.remiseLibelle} :{" "}
              <span className="font-bold tabular-nums text-[#14532d]">
                −{formatEuro(gesteCommercial.remiseMontantTtc)}
              </span>
            </p>
            <p className="mt-3 text-xs italic leading-relaxed text-slate-600">{gesteCommercial.mention}</p>
          </section>
        ) : null}

        <div className="mx-6 mb-5 ml-auto w-full max-w-md overflow-hidden rounded-xl border border-slate-200 sm:mx-8">
          <div className="space-y-2 px-5 py-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Total HT</span>
              <span className="font-semibold text-[#1a3c5e]">{formatEuro(totaux.totalHt)}</span>
            </div>
            {totaux.tvaParTaux.map((row) => (
              <div key={row.taux} className="flex justify-between gap-4">
                <span className="text-slate-500">TVA {formatTvaTaux(row.taux)}</span>
                <span className="text-right">{formatEuro(row.tva)}</span>
              </div>
            ))}
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Total TVA</span>
              <span>{formatEuro(totaux.totalTva)}</span>
            </div>
            {totaux.totalTtcAvantRemise != null && totaux.remiseCommercialeTtc != null ? (
              <>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Total TTC avant remise</span>
                  <span className="tabular-nums">{formatEuro(totaux.totalTtcAvantRemise)}</span>
                </div>
                <div className="flex justify-between gap-4 font-semibold text-[#14532d]">
                  <span>Remise commerciale</span>
                  <span className="tabular-nums">−{formatEuro(totaux.remiseCommercialeTtc)}</span>
                </div>
              </>
            ) : null}
          </div>
          <div className="flex items-center justify-between bg-[#14532d] px-5 py-3.5 text-white">
            <span className="font-bold">
              {totaux.remiseCommercialeTtc ? "Total TTC net" : "Total TTC"}
            </span>
            <span className="text-xl font-bold">{formatEuro(totaux.totalTtc)}</span>
          </div>
          {etudeFinanciere ? (
            <div className="space-y-2 border-t border-slate-100 px-5 py-3 text-sm">
              <div className="flex justify-between gap-4 text-[#14532d]">
                <span>Aides estimatives</span>
                <span className="font-semibold">{formatEuro(etudeFinanciere.totalAides)}</span>
              </div>
              <div className="flex justify-between gap-4 rounded-lg bg-[#1a3c5e] px-3 py-2 text-white">
                <span className="font-semibold">
                  {totaux.remiseCommercialeTtc ? "Reste à charge après remise TTC" : "Reste à charge net TTC"}
                </span>
                <span className="font-bold">{formatEuro(etudeFinanciere.resteACharge)}</span>
              </div>
            </div>
          ) : totaux.acompteTtc != null ? (
            <div className="space-y-1 border-t border-slate-100 px-5 py-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Acompte demandé (30 %)</span>
                <span>{formatEuro(totaux.acompteTtc)}</span>
              </div>
            </div>
          ) : null}
        </div>

        {mentionTva ? <p className="mx-6 mb-5 text-xs leading-relaxed text-slate-500 sm:mx-8">{mentionTva}</p> : null}

        {etudeFinanciere ? (
          <section className="mx-6 mb-5 sm:mx-8">
            <h2 className="text-sm font-bold text-[#1a3c5e]">
              Étude financière et aides 2026 (simulation indicative)
            </h2>
            {etudeFinanciere.profil ? (
              <p className="mt-1 text-xs italic text-slate-500">{etudeFinanciere.profil}</p>
            ) : null}
            <div className="mt-3 rounded-xl border border-emerald-200 bg-[#f0fdf4] px-5 py-4">
              {etudeFinanciere.aides.map((aide) => (
                <div key={aide.libelle} className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-700">{aide.libelle}</span>
                  <span className="font-bold text-[#14532d]">{formatEuro(aide.montant)}</span>
                </div>
              ))}
              <div className="mt-3 flex justify-between gap-4 border-t border-emerald-200 pt-3 text-sm font-semibold text-[#1a3c5e]">
                <span>Reste à charge après remise TTC</span>
                <span>{formatEuro(etudeFinanciere.resteACharge)}</span>
              </div>
            </div>
            <ul className="mt-2 space-y-1 text-xs italic text-slate-500">
              {etudeFinanciere.disclaimers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3 className="mt-4 text-sm font-bold text-[#1a3c5e]">
              {etudeFinanciere.financementTitre ||
                "Solutions de financement (simulations indicatives à valider)"}
            </h3>
            {etudeFinanciere.solutionsExclusives ? (
              <div className="mt-2 space-y-3">
                <article className="rounded-xl border border-emerald-200 bg-[#f0fdf4] px-5 py-4 text-sm">
                  <p className="font-bold text-[#14532d]">
                    SOLUTION OPTION {etudeFinanciere.solutionsExclusives.optionA.code} :{" "}
                    {etudeFinanciere.solutionsExclusives.optionA.titre}
                  </p>
                  {etudeFinanciere.solutionsExclusives.optionA.sousTitre ? (
                    <p className="mt-1 text-xs italic text-slate-500">
                      {etudeFinanciere.solutionsExclusives.optionA.sousTitre}
                    </p>
                  ) : null}
                  {etudeFinanciere.solutionsExclusives.optionA.blocs.map((bloc) => (
                    <div key={bloc.titre || bloc.lignes[0]?.libelle} className="mt-3">
                      {bloc.titre ? (
                        <p className="font-semibold text-[#1a3c5e]">{bloc.titre}</p>
                      ) : null}
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
                        {bloc.lignes.map((ligne) => (
                          <li key={ligne.libelle}>
                            <span className="font-medium">{ligne.libelle}</span> : {ligne.detail}
                          </li>
                        ))}
                      </ul>
                      {bloc.note ? (
                        <p className="mt-1 text-xs italic text-slate-500">{bloc.note}</p>
                      ) : null}
                    </div>
                  ))}
                </article>
                <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#1a3c5e]">
                  {etudeFinanciere.solutionsExclusives.separateur || "OU"}
                </p>
                <article className="rounded-xl border border-sky-200 bg-[#f0f9ff] px-5 py-4 text-sm">
                  <p className="font-bold text-[#1a3c5e]">
                    SOLUTION OPTION {etudeFinanciere.solutionsExclusives.optionB.code} :{" "}
                    {etudeFinanciere.solutionsExclusives.optionB.titre}
                  </p>
                  {etudeFinanciere.solutionsExclusives.optionB.sousTitre ? (
                    <p className="mt-1 text-xs italic text-slate-500">
                      {etudeFinanciere.solutionsExclusives.optionB.sousTitre}
                    </p>
                  ) : null}
                  {etudeFinanciere.solutionsExclusives.optionB.blocs.map((bloc) => (
                    <div key={bloc.titre || bloc.lignes[0]?.libelle} className="mt-3">
                      {bloc.titre ? (
                        <p className="font-semibold text-[#1a3c5e]">{bloc.titre}</p>
                      ) : null}
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
                        {bloc.lignes.map((ligne) => (
                          <li key={ligne.libelle}>
                            <span className="font-medium">{ligne.libelle}</span> : {ligne.detail}
                          </li>
                        ))}
                      </ul>
                      {bloc.note ? (
                        <p className="mt-1 text-xs italic text-slate-500">{bloc.note}</p>
                      ) : null}
                    </div>
                  ))}
                </article>
              </div>
            ) : (
              <div className="mt-2 space-y-2 rounded-xl border border-sky-200 bg-[#f0f9ff] px-5 py-4 text-sm">
                {etudeFinanciere.financement.map((row) => (
                  <div key={row.libelle} className="grid gap-1 sm:grid-cols-[11rem_1fr]">
                    <p className="font-semibold text-[#1a3c5e]">{row.libelle}</p>
                    <p className="text-slate-700">{row.detail}</p>
                  </div>
                ))}
              </div>
            )}
            {etudeFinanciere.mentionFinancement ? (
              <p className="mt-2 text-xs italic leading-relaxed text-slate-500">
                {etudeFinanciere.mentionFinancement}
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="mx-6 mb-5 sm:mx-8">
          <h2 className="text-sm font-bold text-[#1a3c5e]">Conditions de paiement</h2>
          <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-[12rem_1fr]">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Acompte</dt>
            <dd>
              {CONDITIONS_PAIEMENT_DEVIS.acompte}
              {totaux.acompteTtc != null ? ` (${formatEuro(totaux.acompteTtc)} TTC)` : ""}
            </dd>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Échéances</dt>
            <dd>
              {CONDITIONS_PAIEMENT_DEVIS.echeances}
              {totaux.miChantierTtc != null ? ` (${formatEuro(totaux.miChantierTtc)} TTC)` : ""}
            </dd>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Solde</dt>
            <dd>
              {CONDITIONS_PAIEMENT_DEVIS.solde}
              {totaux.soldeTtc != null ? ` (${formatEuro(totaux.soldeTtc)} TTC)` : ""}
            </dd>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Validité du devis</dt>
            <dd>{validite}</dd>
          </dl>
        </section>

        <section className="mx-6 mb-5 space-y-2 text-xs leading-relaxed text-slate-600 sm:mx-8">
          <h2 className="text-sm font-bold text-[#1a3c5e]">Mentions légales</h2>
          <p>
            Document estimatif, valable 3 mois. Travaux RGE coordonnés par ENERGIA CONSEIL IA®. Aides 2026 à titre
            indicatif, à valider selon revenus réels. Montants définitifs après ANAH et CEE. Financement sous réserve
            d’étude et d’acceptation bancaire. Garanties légales : décennale, biennale, parfait achèvement.
          </p>
        </section>

        <section className="mx-6 mb-6 sm:mx-8">
          <h2 className="text-sm font-bold text-[#1a3c5e]">Bon pour accord</h2>
          <p className="mt-2 text-sm text-slate-600">Fait à ____________________ le ____________________</p>
          <div className="mt-3 h-24 max-w-xs rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-500">
            Signature du client
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-emerald-100 bg-[#f0fdf4] px-6 py-3 text-[11px] text-slate-500 sm:px-8">
          <span className="font-semibold text-[#14532d]">{CONTACT_CHIFFRAGE.enseigne}</span>
          <span>{CONTACT_CHIFFRAGE.adresse}</span>
          <span>{numero}</span>
          <span>Date d’édition : {date}</span>
        </footer>
      </article>
    </section>
  );
}
