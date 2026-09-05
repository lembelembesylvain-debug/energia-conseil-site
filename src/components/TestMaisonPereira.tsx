import { useEffect, useMemo, useState } from "react";
import EnergiaCoPilot from "./EnergiaCoPilot";
import ProjectEstimation from "./ProjectEstimation";
import DevisClientPanel from "./chiffrage/DevisClientChiffrage";
import ProjectionAvantApresPereira from "./ProjectionAvantApresPereira";
import {
  PEREIRA_A_RELEVER,
  PEREIRA_AUDIT_ID,
  PEREIRA_AUDIT_PDF_HREF,
  PEREIRA_AUDITEUR,
  PEREIRA_CONTRADICTIONS,
  PEREIRA_DPE,
  PEREIRA_EQUIPEMENTS,
  PEREIRA_IDENTITE,
  PEREIRA_LOGEMENT,
  PEREIRA_LOTS_SCENARIO_1,
  PEREIRA_SCENARIOS,
  type ChampPereira,
} from "../data/pereiraAuditExtract";
import { generateDevisPdf } from "../lib/generateDevisPdf";
import {
  PEREIRA_ADRESSE_CHANTIER,
  PEREIRA_ADRESSE_FACTURATION,
  PEREIRA_APPORT_PERSONNEL,
  PEREIRA_CLIENT_NOM,
  PEREIRA_DEVIS_NUMERO,
  PEREIRA_ECO_PTZ_DUREE_ANS,
  PEREIRA_ECO_PTZ_MENSUALITE,
  PEREIRA_ECO_PTZ_MONTANT,
  PEREIRA_MPR_PARCOURS_TTC,
  PEREIRA_OBJET_TRAVAUX,
  PEREIRA_PAC_DESIGNATION,
  PEREIRA_PLAFOND_MPR_HT,
  PEREIRA_PRET_RELAIS_ANAH,
  PEREIRA_PROFIL_MPR,
  PEREIRA_RAC_NET_TTC,
  PEREIRA_RAC_THEORIQUE_TTC,
  PEREIRA_REMISE_COMMERCIALE_TTC,
  PEREIRA_STATUT_DEVIS,
  PEREIRA_TAUX_MPR_VIOLET,
  PEREIRA_TOTAL_NET_TTC,
  PEREIRA_TOTAL_VENTE_TTC,
  PEREIRA_VMC_TTC,
  construireDevisPereiraTest,
} from "../data/pereiraDevisTest";
import { PEREIRA_LIGNES_ESTIMATION_INITIALES } from "../data/pereiraItiEstimation";
import { formatEuro } from "../lib/chiffrage";
import { UMAFI } from "../data/umafi";

function ChampValeur({ champ }: { champ: ChampPereira }) {
  if (champ.source === "manquant") {
    return (
      <span className="inline-flex max-w-full flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-500/50 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
          {PEREIRA_A_RELEVER}
        </span>
        <span className="text-amber-100/90">{champ.valeur}</span>
      </span>
    );
  }
  return <span className="text-white">{champ.valeur}</span>;
}

function TableauChamps({ titre, champs }: { titre: string; champs: ChampPereira[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
      <h2 className="border-b border-slate-800 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-300 sm:px-5">
        {titre}
      </h2>
      <dl className="divide-y divide-slate-800">
        {champs.map((champ) => (
          <div key={champ.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[14rem_1fr] sm:gap-4 sm:px-5">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{champ.label}</dt>
            <dd className="text-sm leading-relaxed">
              <ChampValeur champ={champ} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Dossier SUCCESSION PIGNARD / Pereira — audit LEO ENERGY. Hors production. Ne pas confondre avec Royer. */
export default function TestMaisonPereira() {
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfMessage, setPdfMessage] = useState<string | null>(null);
  const devisPereira = useMemo(() => construireDevisPereiraTest(), []);
  const devisApercu = useMemo(
    () => ({
      lignes: devisPereira.lignes.map((ligne, index) => ({
        id: `pereira-${index}`,
        libelle: ligne.designation,
        montantHt: ligne.montantHt ?? 0,
      })),
      lignesDetaillees: devisPereira.lignes.map((ligne, index) => ({
        id: `pereira-${index}`,
        designation: ligne.designation,
        description: ligne.description,
        quantite: ligne.quantite,
        unite: ligne.unite,
        prixUnitaireHt: ligne.prixUnitaireHt ?? 0,
        montantHt: ligne.montantHt ?? 0,
        tauxTva: ligne.tauxTva ?? 0.055,
        montantTva: ligne.montantTva ?? 0,
        montantTtc: ligne.montantTtc ?? 0,
      })),
      totalHt: devisPereira.totalHt ?? 0,
      totalTva: devisPereira.totalTva ?? 0,
      totalTtc: devisPereira.totalTtc,
    }),
    [devisPereira],
  );

  useEffect(() => {
    document.title = "TEST LOCAL — PEREIRA | ENERGIA CONSEIL IA®";
  }, []);

  async function genererDevisPdfPereira() {
    setPdfBusy(true);
    setPdfMessage(null);
    try {
      await generateDevisPdf(construireDevisPereiraTest());
      setPdfMessage("PDF client de test généré pour AUDIT-PEREIRA-2026-001.");
    } catch (error) {
      setPdfMessage(error instanceof Error ? error.message : "Export PDF impossible.");
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Dossier de démonstration — hors production
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Test local — audit Pereira
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
            Audit réglementaire LEO ENERGY — propriétaire et commanditaire{" "}
            <strong className="text-white">SUCCESSION PIGNARD</strong>. Le nom « Pereira » n’apparaît pas dans le
            PDF. Route <code className="text-sky-200">/test-maison-pereira</code> — hors production. Identifiant
            d’audit <code className="text-sky-200">{PEREIRA_AUDIT_ID}</code> — enregistrement local de
            l’estimation.
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Document d’audit joint</h2>
            <a
              href={PEREIRA_AUDIT_PDF_HREF}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-sky-300 underline decoration-sky-500/40 underline-offset-2 hover:text-white"
            >
              Ouvrir le PDF dans un nouvel onglet
            </a>
          </div>
          <p className="text-xs text-slate-400">
            {PEREIRA_AUDITEUR.organisme} — {PEREIRA_AUDITEUR.auditeur} — visite {PEREIRA_AUDITEUR.visite} —{" "}
            {PEREIRA_AUDITEUR.logiciel}
          </p>
          <iframe
            title="Audit énergétique SUCCESSION PIGNARD — Bâtiment 01"
            src={PEREIRA_AUDIT_PDF_HREF}
            className="h-[min(70vh,44rem)] w-full rounded-xl border border-slate-800 bg-slate-950"
          />
        </section>

        <TableauChamps titre="Identité et adresse" champs={PEREIRA_IDENTITE} />
        <TableauChamps titre="Logement" champs={PEREIRA_LOGEMENT} />
        <ProjectionAvantApresPereira />
        <TableauChamps titre="DPE et consommations" champs={PEREIRA_DPE} />
        <TableauChamps titre="Chauffage, ECS, ventilation, isolation" champs={PEREIRA_EQUIPEMENTS} />

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
          <h2 className="border-b border-slate-800 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-300 sm:px-5">
            Scénarios de travaux (montants TTC du tableau logiciel)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Scénario</th>
                  <th className="px-4 py-2 font-medium">Coût estimé TTC</th>
                  <th className="px-4 py-2 font-medium">Conso. après</th>
                  <th className="px-4 py-2 font-medium">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {PEREIRA_SCENARIOS.map((scenario) => (
                  <tr key={scenario.nom}>
                    <td className="px-4 py-2.5 text-white">{scenario.nom}</td>
                    <td className="px-4 py-2.5 text-emerald-200">{scenario.totalTtc}</td>
                    <td className="px-4 py-2.5">{scenario.conso}</td>
                    <td className="px-4 py-2.5 text-slate-400">{scenario.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-slate-800 px-4 py-3 text-xs text-slate-400 sm:px-5">
            Aides nationales citées : {PEREIRA_AUDITEUR.aidesNationales}. Aides locales : {PEREIRA_AUDITEUR.aidesLocales}.
            Estimation auditeur, pas un devis.
          </p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
          <h2 className="border-b border-slate-800 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-300 sm:px-5">
            Lots scénario 1 — tableau vs texte auditeur
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Poste</th>
                  <th className="px-4 py-2 font-medium">Qté tableau</th>
                  <th className="px-4 py-2 font-medium">Qté texte auditeur</th>
                  <th className="px-4 py-2 font-medium">TTC tableau</th>
                  <th className="px-4 py-2 font-medium">Visite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {PEREIRA_LOTS_SCENARIO_1.map((lot) => (
                  <tr key={lot.poste}>
                    <td className="px-4 py-2.5 text-white">{lot.poste}</td>
                    <td className="px-4 py-2.5">{lot.quantiteTableau}</td>
                    <td className="px-4 py-2.5">{lot.quantiteTexteAuditeur}</td>
                    <td className="px-4 py-2.5 text-emerald-200">{lot.montantTtcTableau}</td>
                    <td className="px-4 py-2.5">
                      {lot.aRelever ? (
                        <span className="rounded-full border border-amber-500/50 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                          {PEREIRA_A_RELEVER}
                        </span>
                      ) : (
                        <span className="text-slate-500">Cohérent</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-slate-800 px-4 py-3 text-xs text-slate-400 sm:px-5">
            Tableau auditeur ci-dessus (PAC air/air + ballon) : données du PDF LEO ENERGY, non reprises telles
            quelles. Devis ENERGIA : une seule ligne « {PEREIRA_PAC_DESIGNATION} ». Puissance 12 kW = estimation
            issue de l’audit, à confirmer. Dépose / évacuation chaudière et cuve fioul à confirmer. Pas de ballon
            thermodynamique séparé. {PEREIRA_STATUT_DEVIS}.
          </p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-900/80">
          <h2 className="border-b border-slate-800 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-emerald-200 sm:px-5">
            Étude financière — devis client septembre 2026
          </h2>
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Récapitulatif client</p>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Total avant remise</dt>
                  <dd className="font-semibold text-white">{formatEuro(PEREIRA_TOTAL_VENTE_TTC)} TTC</dd>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Remise</dt>
                  <dd className="font-semibold text-emerald-200">−{formatEuro(PEREIRA_REMISE_COMMERCIALE_TTC)}</dd>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Total net</dt>
                  <dd className="text-lg font-semibold text-white">{formatEuro(PEREIRA_TOTAL_NET_TTC)} TTC</dd>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Aides estimatives</dt>
                  <dd className="font-semibold text-sky-200">{formatEuro(PEREIRA_MPR_PARCOURS_TTC)}</dd>
                </div>
                <div className="flex justify-between gap-3 sm:col-span-2 sm:block">
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Reste à charge après remise</dt>
                  <dd className="text-lg font-semibold text-white">{formatEuro(PEREIRA_RAC_NET_TTC)} TTC</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-slate-400">
                Combles 60 m² déroulés, plancher bas 19 m². {PEREIRA_PAC_DESIGNATION} (12 kW, estimation audit à
                confirmer) — une seule ligne, sans ballon thermodynamique séparé. Geste commercial sur les honoraires
                de coordination (VMC Hygro B {formatEuro(PEREIRA_VMC_TTC)} TTC).
              </p>
            </div>
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-200">MaPrimeRénov’ Parcours</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatEuro(PEREIRA_MPR_PARCOURS_TTC)}</p>
              <p className="mt-1 text-xs text-slate-400">
                {PEREIRA_TAUX_MPR_VIOLET * 100} % du plafond {formatEuro(PEREIRA_PLAFOND_MPR_HT)} HT (3 classes et plus),
                hors bonus supprimés — septembre 2026. Estimation à titre indicatif.
              </p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reste à charge après remise</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatEuro(PEREIRA_RAC_NET_TTC)} TTC</p>
              <p className="mt-1 text-xs text-slate-400">
                {formatEuro(PEREIRA_TOTAL_NET_TTC)} TTC net − {formatEuro(PEREIRA_MPR_PARCOURS_TTC)} d’aides
                estimatives.
              </p>
            </div>
          </div>
          <dl className="grid gap-3 border-t border-slate-800 px-4 py-4 text-sm sm:grid-cols-2 sm:px-5">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Solutions exclusives UMAFI</dt>
              <dd className="mt-1 text-white">Option A ou Option B — simulations indicatives à valider</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Option A — Éco-PTZ + préfinancement</dt>
              <dd className="mt-1 text-white">
                Éco-PTZ {formatEuro(PEREIRA_ECO_PTZ_MONTANT)} (taux 0 %, {PEREIRA_ECO_PTZ_DUREE_ANS} ans,{" "}
                {formatEuro(PEREIRA_ECO_PTZ_MENSUALITE)} / mois) + apport {formatEuro(PEREIRA_APPORT_PERSONNEL)} — reste
                à charge après remise {formatEuro(PEREIRA_RAC_NET_TTC)} couvert (RAC théorique hors geste commercial{" "}
                {formatEuro(PEREIRA_RAC_THEORIQUE_TTC)}). Relais ANAH {formatEuro(PEREIRA_PRET_RELAIS_ANAH)} (Fabien —
                UMAFI).
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Option B — Regroupement global</dt>
              <dd className="mt-1 text-white">
                Intégration de l’enveloppe de travaux {formatEuro(PEREIRA_TOTAL_VENTE_TTC)} dans les encours existants —
                mensualité unique à étudier par Fabien (UMAFI — ORIAS 26 009 255)
              </dd>
            </div>
          </dl>
          <p className="border-t border-slate-800 px-4 py-3 text-xs leading-relaxed text-slate-400 sm:px-5">
            Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et
            éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE. Études de financement réalisées
            sous réserve d’acceptation définitive par les partenaires financiers. Aucun accord de prêt ou de regroupement
            n’est garanti avant étude complète du dossier. {UMAFI.contact.libelle}.
          </p>
        </section>

        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200">
            Contradictions du PDF — {PEREIRA_A_RELEVER}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-50">
            {PEREIRA_CONTRADICTIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Estimation des travaux (test local)
            </h2>
            <button
              type="button"
              onClick={() => void genererDevisPdfPereira()}
              disabled={pdfBusy}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1a3c5e] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pdfBusy ? "Génération PDF…" : "Télécharger le devis PDF de test"}
            </button>
          </div>
          {pdfMessage ? (
            <p className="text-sm text-sky-200" role="status">
              {pdfMessage}
            </p>
          ) : null}
          <DevisClientPanel
            devis={devisApercu}
            libelleProjet={devisPereira.libelleProjet}
            objetTravaux={devisPereira.objetTravaux}
            introductionProjet={devisPereira.introductionProjet}
            numero={devisPereira.numero}
            clientNom={devisPereira.clientNom}
            clientAdresse={devisPereira.clientAdresse}
            clientEmail={devisPereira.clientEmail}
            clientTelephone={devisPereira.clientTelephone}
            adresseFacturation={devisPereira.adresseFacturation}
            referenceDossier={devisPereira.referenceDossier}
            statut={devisPereira.statut}
            date={devisPereira.date}
            validite={devisPereira.validite}
            mentionTva={devisPereira.mentionTva}
            etudeFinanciere={devisPereira.etudeFinanciere}
            gesteCommercial={devisPereira.gesteCommercial}
          />
          <ProjectEstimation
            auditId={PEREIRA_AUDIT_ID}
            clientNom={PEREIRA_CLIENT_NOM}
            clientAdresse={PEREIRA_ADRESSE_CHANTIER}
            adresseFacturation={PEREIRA_ADRESSE_FACTURATION}
            numeroDevis={PEREIRA_DEVIS_NUMERO}
            objetTravaux={PEREIRA_OBJET_TRAVAUX}
            statutDevis={PEREIRA_STATUT_DEVIS}
            lignesInitiales={PEREIRA_LIGNES_ESTIMATION_INITIALES}
            afficherDevisClient={false}
          />
        </section>
      </main>

      <EnergiaCoPilot
        syntheseAudit={`Dossier SUCCESSION PIGNARD (désignation interne Pereira) — 1 route de Mizérieux, 42510 Nervieux (42, H1c, 315 m). Maison 164 m², 2 niveaux, construction 1948–1974.

Enveloppe : murs pisé / béton de terre 60–65 cm non isolés (193 m² de façades) ; plafond solives 120 m² (audit) — travaux confirmés : 60 m² déroulés R ≥ 7 ; dalle 60 m² (audit) — travaux confirmés : 19 m² R ≥ 3 ; bois simple vitrage (7 fenêtres + 2 portes). Fissures façade notées.

Systèmes : chaudière fioul 1969 35 kW + radiateurs HT ; ballon électrique 100 L (mauvais état) ; ventilation par ouverture des fenêtres (non fonctionnelle).

Conso initiale auditeur : 320 kWhEP/m².an (304 EF), facture conventionnelle 6 510 à 8 860 €/an. Après scénarios 1 et 2 : 73 kWhEP/m².an (−77 %).

Chiffrage auditeur LEO ENERGY (TTC document, pas un coût d’achat ENERGIA) : scénario 1 ~ 53 397 € TTC (texte auditeur ~ 125 000 € — contradiction à lever) ; scénario 3 ~ 42 952 € TTC sans plancher. Surfaces ITI / combles / ouvrants incohérentes — à relever en visite.

Devis client ENERGIA (septembre 2026) : ${formatEuro(PEREIRA_TOTAL_VENTE_TTC)} TTC avant remise, ${formatEuro(PEREIRA_TOTAL_NET_TTC)} TTC net après geste commercial (−${formatEuro(PEREIRA_REMISE_COMMERCIALE_TTC)} TTC sur honoraires de coordination, équivalent VMC Hygro B fourniture et pose). Combles 60 m² déroulés R ≥ 7 ; plancher bas 19 m² R ≥ 3. Remplacement chaudière fioul par PAC air/eau haute température double service (chauffage + ECS, 12 kW estimation audit à confirmer) — une seule ligne, sans ballon thermodynamique séparé. Dépose et évacuation chaudière / cuve fioul à confirmer. MaPrimeRénov’ Parcours profil Violet ${formatEuro(PEREIRA_MPR_PARCOURS_TTC)} (50 % du plafond ${formatEuro(PEREIRA_PLAFOND_MPR_HT)} HT, hors bonus). Reste à charge net ${formatEuro(PEREIRA_RAC_NET_TTC)}. Plan de financement exclusif (simulations indicatives) : Option A = Éco-PTZ ${formatEuro(PEREIRA_ECO_PTZ_MONTANT)} / ${PEREIRA_ECO_PTZ_DUREE_ANS} ans (${formatEuro(PEREIRA_ECO_PTZ_MENSUALITE)}/mois) + apport ${formatEuro(PEREIRA_APPORT_PERSONNEL)} pour un RAC théorique ${formatEuro(PEREIRA_RAC_THEORIQUE_TTC)} (${formatEuro(PEREIRA_TOTAL_VENTE_TTC)} − ${formatEuro(PEREIRA_MPR_PARCOURS_TTC)} MPR) + prêt relais ANAH ${formatEuro(PEREIRA_PRET_RELAIS_ANAH)} ; OU Option B = regroupement de crédits global UMAFI sur l’enveloppe de travaux ${formatEuro(PEREIRA_TOTAL_VENTE_TTC)}. Statut : estimation à confirmer par devis artisan RGE.

Ordre ENERGIA : isolation (combles, murs ITI pisé perspirant, planchers) puis menuiseries, VMC, PAC air/eau HT double service dimensionnée post-isolation.`}
      />
    </div>
  );
}
