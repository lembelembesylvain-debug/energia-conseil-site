import { useEffect } from "react";
import EnergiaCoPilot from "./EnergiaCoPilot";
import ProjectEstimation from "./ProjectEstimation";
import {
  PEREIRA_A_RELEVER,
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
  useEffect(() => {
    document.title = "TEST LOCAL — PEREIRA | ENERGIA CONSEIL IA®";
  }, []);

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
            PDF. Route <code className="text-sky-200">/test-maison-pereira</code> — hors production, sans UUID
            d’audit, sans enregistrement Supabase.
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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Estimation des travaux (test local)
          </h2>
          <ProjectEstimation auditId="" />
        </section>
      </main>

      <EnergiaCoPilot
        syntheseAudit={`Dossier SUCCESSION PIGNARD (désignation interne Pereira) — 1 route de Mizérieux, 42510 Nervieux (42, H1c, 315 m). Maison 164 m², 2 niveaux, construction 1948–1974.

Enveloppe : murs pisé / béton de terre 60–65 cm non isolés (193 m² de façades) ; plafond solives 120 m² non isolé ; dalle 60 m² sur sous-sol non isolée ; bois simple vitrage (7 fenêtres + 2 portes). Fissures façade notées.

Systèmes : chaudière fioul 1969 35 kW + radiateurs HT ; ballon électrique 100 L (mauvais état) ; ventilation par ouverture des fenêtres (non fonctionnelle).

Conso initiale auditeur : 320 kWhEP/m².an (304 EF), facture conventionnelle 6 510 à 8 860 €/an. Après scénarios 1 et 2 : 73 kWhEP/m².an (−77 %).

Chiffrage auditeur LEO ENERGY (TTC document, pas un coût d’achat ENERGIA) : scénario 1 ~ 53 397 € TTC (texte auditeur ~ 125 000 € — contradiction à lever) ; scénario 3 ~ 42 952 € TTC sans plancher. Surfaces ITI / combles / ouvrants incohérentes — à relever en visite.

Ordre ENERGIA : isolation (combles, murs ITI pisé perspirant, planchers) puis menuiseries, VMC, PAC dimensionnée post-isolation (l’audit propose un air/air 12 kW à recaler), ballon thermo.`}
      />
    </div>
  );
}
