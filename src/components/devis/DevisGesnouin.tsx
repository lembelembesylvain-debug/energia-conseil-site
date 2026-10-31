/**
 * Devis officiel Joël GESNOUIN — charte graphique contrats CG (logo /logo.png).
 * Réf. DEV-2026-ELEC-GESNOUIN-01 — 890 € HT / 1 068 € TTC.
 */
import { useEffect } from "react";
import { LOGO_ENERGIA_CONTRAT_PATH } from "../../lib/crm/contratContractantGeneralHtml.js";
import {
  BADGES_OFFICIELS,
  LIGNES_IDENTITE_OFFICIELLE,
  MENTION_MARCHE_CONTRACTANT_GENERAL,
} from "../../lib/branding";
import {
  CLIENT_GESNOUIN,
  FINANCEMENT_GESNOUIN,
  GESNOUIN_CLIENT_ID,
  GESNOUIN_REFERENCE,
  POSTES_GESNOUIN_CONTRAT,
  TOTAUX_GESNOUIN,
} from "../../lib/crm/gesnouinBatterieOfficiel.js";

const DATE_DEVIS = "8 octobre 2026";
const REFERENCE = GESNOUIN_REFERENCE;
const CLAUSE_EDF_OA =
  "Raccordement en couplage alternatif (AC-Coupled) indépendant préservant intégralement le contrat d'achat EDF Obligation d'Achat (EDF OA) du client.";

function eur(montant: number) {
  return (
    montant.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

/** Charte contrats CG officiels — bleu nuit #0B1F3A · émeraude #059669 · logo /logo.png */
const PRINT_CSS = `
  .devis-gesnouin {
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    color: #0B1F3A;
    -webkit-font-smoothing: antialiased;
  }
  .devis-sheet {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  @page {
    size: A4 portrait;
    margin: 0;
  }
  @media print {
    html, body, #root {
      background: #fff !important;
      margin: 0 !important;
      padding: 0 !important;
      min-height: 0 !important;
      width: auto !important;
    }
    .devis-toolbar { display: none !important; }
    .devis-stage {
      background: #fff !important;
      padding: 0 !important;
      gap: 0 !important;
    }
    .devis-sheet {
      box-shadow: none !important;
      margin: 0 !important;
      width: 210mm !important;
      min-height: 297mm !important;
      height: 297mm !important;
      break-after: page;
      page-break-after: always;
      overflow: hidden;
    }
    .devis-sheet:last-child {
      break-after: auto;
      page-break-after: auto;
    }
  }
`;

function EnteteOfficiel({ page }: { page: string }) {
  return (
    <header className="border-b-[3px] border-[#059669] pb-[2.5mm]">
      <div className="flex items-start justify-between gap-[6mm]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-[3.2mm]">
            <img
              src={LOGO_ENERGIA_CONTRAT_PATH}
              alt="ENERGIA-CONSEIL IA®"
              height={60}
              className="h-[60px] w-auto max-w-[170px] object-contain object-left"
            />
            <div className="min-w-0">
              <p className="text-[16pt] leading-tight font-extrabold tracking-[0.02em] text-[#059669]">
                ENERGIA CONSEIL IA®
              </p>
              <p className="mt-[0.8mm] text-[8pt] leading-snug text-[#475569]">
                Audit Énergétique Intelligence Artificielle · Marque déposée INPI n°5213845
              </p>
              <p className="mt-[1mm] flex flex-wrap gap-1">
                {BADGES_OFFICIELS.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-[#059669] bg-[#ecfdf5] px-1.5 py-0.5 text-[6.5pt] font-bold text-[#065f46]"
                  >
                    {badge}
                  </span>
                ))}
              </p>
            </div>
          </div>
          <p className="mt-[2mm] text-[8pt] leading-[1.4] text-[#475569]">
            SASU — 16 Rue Cuvier, 69006 Lyon
            <br />
            SIRET 941 819 427 00019 — RCS Lyon 941 819 427 — TVA FR01941819427 — APE 7112B
            <br />
            Assurance RC Professionnelle &amp; Décennale BTP
            <br />
            Direction &amp; Contractant Général : Sylvain LEMBELEMBE — 06 10 59 68 98 —
            contact@energia-conseil-ia.com
          </p>
        </div>
        <div className="w-[62mm] shrink-0 text-right text-[8pt] leading-snug text-[#475569]">
          <p className="text-[11pt] font-extrabold text-[#0B1F3A]">DEVIS</p>
          <p className="mt-[1mm]">
            N° {REFERENCE}
            <br />
            Client {GESNOUIN_CLIENT_ID}
            <br />
            Date : {DATE_DEVIS}
            <br />
            Validité : 30 jours
            <br />
            Montant total TTC : {eur(TOTAUX_GESNOUIN.totalTtc)} TTC
            <br />
            Page {page}
          </p>
        </div>
      </div>
      <div className="mt-[3mm] bg-[#0B1F3A] px-[3mm] py-[2mm] text-[10pt] font-extrabold tracking-wide text-white uppercase">
        Devis — Raccordement électrique &amp; mise en service batterie Zendure SolarFlow 2400 AC
      </div>
    </header>
  );
}

function Pied() {
  return (
    <footer className="mt-auto border-t border-slate-200 pt-[2.2mm] text-[6.2pt] leading-snug text-[#64748b]">
      {LIGNES_IDENTITE_OFFICIELLE.map((ligne) => (
        <span key={ligne} className="block">
          {ligne}
        </span>
      ))}
      <span className="mt-1 block text-[#0f172a]">{MENTION_MARCHE_CONTRACTANT_GENERAL}</span>
      <span className="mt-1 block">
        Sylvain LEMBELEMBE (AMO) 06 10 59 68 98 · DAMIEN (Commercial) 06 72 68 09 68 · FABIEN –
        VIVONS COURTIER 06 71 19 96 45 · Julia (Juriste) · MAR Antoine BARATIER – Cabinet C2ET.
        Document confidentiel — année de référence 2026. Aides financières 2026 (estimation à titre
        indicatif).
      </span>
    </footer>
  );
}

export default function DevisGesnouin() {
  useEffect(() => {
    const precedent = document.title;
    document.title = REFERENCE;
    return () => {
      document.title = precedent;
    };
  }, []);

  return (
    <div className="devis-gesnouin min-h-screen bg-[#e8eef5]">
      <style>{PRINT_CSS}</style>

      <div className="devis-toolbar sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-[#0B1F3A] px-4 py-3 text-white shadow-md print:hidden">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_ENERGIA_CONTRAT_PATH}
            alt=""
            className="h-9 w-auto object-contain brightness-0 invert"
            aria-hidden
          />
          <div>
            <p className="text-[11px] tracking-[0.18em] text-emerald-300/90 uppercase">
              ENERGIA CONSEIL IA®
            </p>
            <p className="text-sm font-medium">
              {REFERENCE} — {CLIENT_GESNOUIN.libelleSignature}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden max-w-sm text-[11px] leading-snug text-white/75 sm:block">
            Enregistrer en PDF · A4 · marges Aucune · graphiques d&apos;arrière-plan · sans
            en-têtes du navigateur.
          </p>
          <button
            id="btn-export-pdf"
            type="button"
            onClick={() => window.print()}
            className="shrink-0 cursor-pointer rounded-lg border-0 bg-[#059669] px-4 py-2 text-[12px] font-bold tracking-wide text-[#0B1F3A] uppercase hover:bg-emerald-400"
          >
            Imprimer / Enregistrer en PDF
          </button>
        </div>
      </div>

      <div className="devis-stage flex flex-col items-center gap-8 px-4 py-8">
        <article className="devis-sheet flex h-[297mm] w-[210mm] flex-col bg-white px-[11mm] pt-[12mm] pb-[14mm] shadow-[0_12px_40px_rgba(11,31,58,0.16)]">
          <EnteteOfficiel page="1 / 2" />

          <section className="mt-[3.5mm]">
            <h2 className="border-b border-[#059669]/40 pb-[1mm] text-[10pt] font-extrabold text-[#0B1F3A]">
              I. Identification des parties
            </h2>
            <table className="mt-[2mm] w-full border-collapse text-[8pt]">
              <tbody>
                <tr className="border border-slate-200">
                  <th className="w-[28%] bg-[#f1f5f9] px-[2.5mm] py-[1.8mm] text-left align-top font-semibold text-[#0B1F3A]">
                    Client
                  </th>
                  <td className="px-[2.5mm] py-[1.8mm] leading-snug text-[#334155]">
                    <strong>{CLIENT_GESNOUIN.libelleSignature}</strong>
                    <br />
                    {CLIENT_GESNOUIN.adresse}
                    <br />
                    {CLIENT_GESNOUIN.telephone} · {CLIENT_GESNOUIN.email}
                    <br />
                    ID client : {GESNOUIN_CLIENT_ID}
                  </td>
                </tr>
                <tr className="border border-slate-200">
                  <th className="bg-[#f1f5f9] px-[2.5mm] py-[1.8mm] text-left align-top font-semibold text-[#0B1F3A]">
                    Lieu d&apos;exécution
                  </th>
                  <td className="px-[2.5mm] py-[1.8mm] leading-snug text-[#334155]">
                    <strong>{CLIENT_GESNOUIN.adresse}</strong> (Calvados / Normandie)
                    <br />
                    Installation existante : PV 3 kWc + contrat EDF OA actif — matériel Zendure
                    SolarFlow 2400 AC + 2× AB3000X (5,76 kWh) fourni par le client.
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mt-[3.5mm] flex-1">
            <h2 className="border-b border-[#059669]/40 pb-[1mm] text-[10pt] font-extrabold text-[#0B1F3A]">
              II. Détail des postes — marché de travaux
            </h2>
            <table className="mt-[2mm] w-full border-collapse text-[7.8pt]">
              <thead>
                <tr className="bg-[#0B1F3A] text-left text-white">
                  <th className="w-[8mm] px-[2mm] py-[1.6mm] font-semibold">N°</th>
                  <th className="px-[2mm] py-[1.6mm] font-semibold">Désignation détaillée</th>
                  <th className="w-[26mm] px-[2mm] py-[1.6mm] text-right font-semibold">
                    Montant HT
                  </th>
                </tr>
              </thead>
              <tbody>
                {POSTES_GESNOUIN_CONTRAT.map((poste, index) => (
                  <tr
                    key={poste.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}
                  >
                    <td className="border-b border-slate-200 px-[2mm] py-[1.8mm] align-top font-bold text-[#059669]">
                      {poste.ordreContractuel}
                    </td>
                    <td className="border-b border-slate-200 px-[2mm] py-[1.8mm] align-top">
                      <p className="font-semibold text-[#0B1F3A]">{poste.nom}</p>
                      <p className="mt-[0.5mm] leading-snug text-[#475569]">{poste.specifications}</p>
                    </td>
                    <td className="border-b border-slate-200 px-[2mm] py-[1.8mm] text-right align-top font-semibold tabular-nums text-[#0B1F3A]">
                      {eur(poste.totalHt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-[3mm] grid grid-cols-[1fr_64mm] gap-[4mm]">
              <div>
                <p className="text-[8pt] font-extrabold text-[#0B1F3A]">Modalités de règlement</p>
                <table className="mt-[1.2mm] w-full text-[8pt]">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-[1.2mm] pr-2">Acompte à la commande (30 %)</td>
                      <td className="py-[1.2mm] text-right font-semibold tabular-nums">
                        {eur(FINANCEMENT_GESNOUIN.acompte)} TTC
                      </td>
                    </tr>
                    <tr>
                      <td className="py-[1.2mm] pr-2 leading-snug">
                        Solde à réception des travaux (70 %), après validation Sylvain LEMBELEMBE
                      </td>
                      <td className="py-[1.2mm] text-right align-top font-semibold tabular-nums">
                        {eur(FINANCEMENT_GESNOUIN.solde)} TTC
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="border border-[#0B1F3A]">
                <div className="flex justify-between px-[3mm] py-[1.4mm] text-[8pt]">
                  <span>Total HT</span>
                  <span className="font-semibold tabular-nums">{eur(TOTAUX_GESNOUIN.totalHt)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 px-[3mm] py-[1.4mm] text-[8pt]">
                  <span>TVA 20 %</span>
                  <span className="font-semibold tabular-nums">{eur(TOTAUX_GESNOUIN.totalTva)}</span>
                </div>
                <div className="flex justify-between bg-[#0B1F3A] px-[3mm] py-[2mm] text-[10pt] font-extrabold text-white">
                  <span>Total TTC</span>
                  <span id="total-ttc" className="tabular-nums">
                    {eur(TOTAUX_GESNOUIN.totalTtc)}
                  </span>
                </div>
              </div>
            </div>

            <aside className="mt-[3mm] border-l-4 border-[#059669] bg-[#ecfdf5] px-[3mm] py-[2mm] text-[7.8pt] leading-snug text-[#14532d]">
              <strong>Clause contractuelle. </strong>
              {CLAUSE_EDF_OA}
            </aside>

            <section className="mt-[3mm] grid grid-cols-2 gap-[3.5mm]">
              <div className="flex min-h-[32mm] flex-col border border-slate-300 px-[3mm] py-[2.2mm]">
                <p className="text-[7pt] font-semibold tracking-[0.12em] text-[#64748b] uppercase">
                  Pour ENERGIA CONSEIL IA®
                </p>
                <p className="mt-[1mm] text-[8pt] leading-snug text-[#0B1F3A]">
                  Sylvain LEMBELEMBE
                  <br />
                  Direction &amp; Contractant Général
                </p>
                <p className="mt-auto pt-[5mm] text-[7pt] text-[#94a3b8]">Cachet et signature</p>
              </div>
              <div className="flex min-h-[32mm] flex-col border-2 border-[#059669] px-[3mm] py-[2.2mm]">
                <p className="text-[7pt] font-semibold tracking-[0.12em] text-[#059669] uppercase">
                  Bon pour accord et exécution des travaux
                </p>
                <p className="mt-[1mm] text-[7.5pt] leading-snug text-[#334155]">
                  Faire précéder la signature de la mention manuscrite :
                  <span className="mt-[0.6mm] block font-semibold text-[#0B1F3A]">
                    « Bon pour accord et exécution des travaux »
                  </span>
                </p>
                <p className="mt-[2mm] text-[7.5pt] text-[#475569]">
                  Fait à ____________________ le ____ / ____ / ________
                </p>
                <p className="mt-auto pt-[2mm] text-[7.5pt] font-semibold text-[#0B1F3A]">
                  {CLIENT_GESNOUIN.libelleSignature} — Signature
                </p>
              </div>
            </section>
          </section>

          <Pied />
        </article>

        <article className="devis-sheet flex h-[297mm] w-[210mm] flex-col bg-white px-[11mm] pt-[12mm] pb-[14mm] shadow-[0_12px_40px_rgba(11,31,58,0.16)]">
          <EnteteOfficiel page="2 / 2" />

          <h2 className="mt-[3.5mm] border-b border-[#059669]/40 pb-[1mm] text-[10pt] font-extrabold text-[#0B1F3A]">
            III. Conditions &amp; avis juridique
          </h2>
          <p className="mt-[1.5mm] text-[7.6pt] text-[#64748b]">
            Annexé au devis {REFERENCE} du {DATE_DEVIS} — {CLIENT_GESNOUIN.libelleSignature}.
          </p>

          <div className="mt-[3mm] grid grid-cols-2 gap-x-[5mm] gap-y-[2.8mm] text-[7.5pt] leading-snug">
            <Bloc
              titre="1. Périmètre"
              texte="Pose et raccordement NF C 15-100 du Zendure SolarFlow 2400 AC et modules AB3000X (5,76 kWh) fournis par le client, sur PV 3 kWc existant. ENERGIA n'est pas vendeur du matériel de stockage."
            />
            <Bloc titre="2. EDF OA" texte={CLAUSE_EDF_OA} />
            <Bloc
              titre="3. Protections"
              texte="Différentiel dédié 30 mA Type F / Hpi 20A, liaisons équipotentielles, R2V 3G2.5 sous goulotte, tore CT Linky pour pilotage surplus / zéro injection."
            />
            <Bloc
              titre="4. Prix"
              texte="890,00 € HT + TVA 20 % (178,00 €) = 1 068,00 € TTC. Validité 30 jours. Aucune aide publique estimée sur ce devis."
            />
            <Bloc
              titre="5. Règlement"
              texte="Acompte 320,40 € TTC (30 %) à la commande. Solde 747,60 € TTC (70 %) à réception / mise en service après validation Sylvain LEMBELEMBE."
            />
          </div>

          <section className="mt-[4mm] border-l-4 border-[#f97316] bg-[#fff7ed] px-[3.2mm] py-[2.4mm]">
            <p className="text-[8pt] font-extrabold text-[#9a3412]">X. Avis juridique — Julia</p>
            <ul className="mt-[1.2mm] list-disc space-y-[0.8mm] pl-[4mm] text-[7.4pt] leading-snug text-[#334155]">
              <li>
                Conformité : NF C 15-100, couplage AC indépendant, différentiel dédié, tore Linky,
                TVA 20 %.
              </li>
              <li>
                Le contrat EDF OA est sanctuarisé. Le matériel batterie est fourni par le client.
              </li>
              <li>
                Clause Julia Protection Aides : plafond 2 000 € si écart &gt; 10 % imputable à
                ENERGIA ; 0 % si erreur client ou décision ANAH/CEE. Ce devis n&apos;estime aucune
                aide.
              </li>
              <li>
                Solde 70 % exigible uniquement après mise en service et validation Sylvain
                LEMBELEMBE.
              </li>
            </ul>
            <p className="mt-[2mm] text-[7.4pt] text-[#475569]">
              Avis établi par Julia – Juriste ENERGIA-CONSEIL IA® – {DATE_DEVIS}
            </p>
            <div className="mt-[3mm] h-[8mm] w-[48mm] border-b border-slate-400" />
          </section>

          <Pied />
        </article>
      </div>
    </div>
  );
}

function Bloc({ titre, texte }: { titre: string; texte: string }) {
  return (
    <section>
      <h3 className="text-[7.8pt] font-extrabold text-[#059669]">{titre}</h3>
      <p className="mt-[0.4mm] text-[#334155]">{texte}</p>
    </section>
  );
}
