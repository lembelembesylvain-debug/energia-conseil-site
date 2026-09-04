import { PAGES_TEST_LOCALES } from "../../lib/crm/crmDataService";
import { euro } from "../../lib/crm/mockData";
import RepartitionMarges from "./RepartitionMarges";

const ORDRE_TRAVAUX = [
  "Isolation combles",
  "Isolation murs (ITE ou ITI)",
  "Isolation planchers",
  "Fenêtres",
  "VMC",
  "PAC (dimensionnement post-isolation)",
  "Ballon thermodynamique",
  "Photovoltaïque",
];

function BoutonTablette({ children, onClick, actif }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-16 w-full rounded-2xl px-4 text-base font-semibold shadow-lg transition sm:text-lg ${
        actif
          ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white"
          : "border border-slate-700 bg-slate-900/80 text-slate-100 hover:border-emerald-500/50"
      }`}
    >
      {children}
    </button>
  );
}

export default function PresentationTablette({
  vue,
  onVue,
  dossier,
  tablette,
  voirMargesInternes = false,
}) {
  const pad = tablette ? "p-5 sm:p-7" : "p-5";
  const titre = tablette ? "text-2xl sm:text-3xl" : "text-xl";
  const travaux = Array.isArray(dossier?.travaux) ? [...dossier.travaux].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0)) : [];
  const estDossierTest = dossier?.source === "test-local";

  return (
    <div className="space-y-4">
      <div className={`grid gap-3 ${tablette ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-4"}`}>
        <BoutonTablette actif={vue === "fiche"} onClick={() => onVue("fiche")}>
          Fiche client
        </BoutonTablette>
        <BoutonTablette actif={vue === "travaux"} onClick={() => onVue("travaux")}>
          Travaux
        </BoutonTablette>
        <BoutonTablette actif={vue === "aides"} onClick={() => onVue("aides")}>
          Aides indicatives
        </BoutonTablette>
        <BoutonTablette actif={vue === "financement"} onClick={() => onVue("financement")}>
          Financement
        </BoutonTablette>
      </div>

      {vue === "fiche" ? (
        <section className={`rounded-2xl border border-slate-800 bg-slate-900/80 ${pad}`}>
          <h2 className={`font-semibold text-white ${titre}`}>Fiche client</h2>
          {dossier ? (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Identité</dt>
                <dd className="mt-1 text-lg text-white">{dossier.nom}</dd>
              </div>
              {dossier.auditId ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Identifiant d’audit</dt>
                  <dd className="mt-1 font-mono text-sm text-sky-200">{dossier.auditId}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Localisation</dt>
                <dd className="mt-1 text-lg text-white">{dossier.ville || "Non renseignée"}</dd>
              </div>
              {dossier.adresse ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Adresse du chantier</dt>
                  <dd className="mt-1 text-lg text-white">{dossier.adresse}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Type de projet</dt>
                <dd className="mt-1 text-lg text-white">{dossier.typeProjet || "Non renseigné"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Statut dossier</dt>
                <dd className="mt-1 text-lg text-white">{dossier.statut}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Apporteur d’affaires</dt>
                <dd className="mt-1 text-lg text-white">{dossier.apporteurNom || "Non renseigné"}</dd>
              </div>
              {dossier.interlocuteur ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Interlocuteur</dt>
                  <dd className="mt-1 text-lg text-white">{dossier.interlocuteur}</dd>
                </div>
              ) : null}
              {dossier.telephone ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Téléphone</dt>
                  <dd className="mt-1 text-lg text-white">{dossier.telephone}</dd>
                </div>
              ) : null}
              {dossier.email ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">E-mail</dt>
                  <dd className="mt-1 text-lg text-white">{dossier.email}</dd>
                </div>
              ) : null}
              {dossier.factureElectrique ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Facture électrique actuelle</dt>
                  <dd className="mt-1 text-lg text-white">{dossier.factureElectrique}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Budget client</dt>
                <dd className="mt-1 text-lg text-white">
                  {dossier.caTtc
                    ? `${euro(dossier.caTtc)} TTC`
                    : "Non renseigné dans les champs publics"}
                </dd>
              </div>
              {dossier.href ? (
                <div className="sm:col-span-2">
                  <a
                    href={dossier.href}
                    className="inline-flex rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:border-emerald-400"
                  >
                    Ouvrir le dossier
                  </a>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Aucun dossier n’est sélectionné. Ouvrez un projet depuis le tableau de bord, ou une
              page de test locale ci-dessous.
            </p>
          )}
          {estDossierTest ? (
            <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              Jeu de test local — hors production. Ne pas présenter comme un dossier signé.
            </p>
          ) : null}
          <ul className="mt-5 space-y-2">
            {PAGES_TEST_LOCALES.map((page) => (
              <li key={page.id}>
                <a
                  href={page.href}
                  className={`block rounded-xl border border-slate-700 bg-slate-950/60 text-emerald-200 hover:border-emerald-500/40 ${
                    tablette ? "min-h-14 px-4 py-4 text-base" : "px-4 py-3 text-sm"
                  }`}
                >
                  {page.label}
                  <span className="mt-0.5 block text-xs text-slate-500">{page.hint}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {vue === "travaux" ? (
        <section className={`rounded-2xl border border-slate-800 bg-slate-900/80 ${pad}`}>
          <h2 className={`font-semibold text-white ${titre}`}>Présentation des travaux</h2>
          {travaux.length > 0 ? (
            <>
              <p className="mt-2 text-sm text-slate-400">
                Ordre optimal ENERGIA — isolation avant chauffage. Montants HT du devis de test.
              </p>
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-3 py-2 font-medium">N°</th>
                      <th className="px-3 py-2 font-medium">Poste</th>
                      <th className="px-3 py-2 font-medium text-right">Montant HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {travaux.map((ligne, index) => (
                      <tr key={ligne.id}>
                        <td className="px-3 py-2.5 text-slate-500">{index + 1}</td>
                        <td className="px-3 py-2.5 text-white">{ligne.label}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-emerald-200">
                          {euro(ligne.ht)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {dossier?.caHt != null ? (
                <p className="mt-4 text-sm text-slate-300">
                  Total devis : <strong className="text-white">{euro(dossier.caHt)} HT</strong>
                  {dossier.caTtc != null ? (
                    <>
                      {" "}
                      / <strong className="text-emerald-200">{euro(dossier.caTtc)} TTC</strong>
                    </>
                  ) : null}
                </p>
              ) : null}
              {voirMargesInternes && dossier?.marges ? (
                <div className="mt-6 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-red-300">
                    Répartition interne des marges — administrateur uniquement
                  </p>
                  <RepartitionMarges
                    marges={dossier.marges}
                    apporteurNom={dossier.apporteurNom}
                    compact
                  />
                </div>
              ) : null}
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-400">
                Ordre optimal ENERGIA — règle d’or : isolation avant chauffage. Aucun chiffrage interne.
              </p>
              <ol className="mt-5 space-y-3">
                {ORDRE_TRAVAUX.map((poste, index) => (
                  <li
                    key={poste}
                    className={`flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/50 ${
                      tablette ? "min-h-14 px-4 py-3 text-base" : "px-4 py-2.5 text-sm"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600/30 text-sm font-semibold text-emerald-200">
                      {index + 1}
                    </span>
                    <span className="text-white">{poste}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      ) : null}

      {vue === "aides" ? (
        <section className={`rounded-2xl border border-slate-800 bg-slate-900/80 ${pad}`}>
          <h2 className={`font-semibold text-white ${titre}`}>Aides indicatives</h2>
          <p className="mt-3 text-sm font-medium text-amber-200">
            Aides financières 2026 (estimation à titre indicatif).
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
            <li>Aides à valider selon revenus réels du client et éligibilité en vigueur.</li>
            <li>Montants définitifs après instruction ANAH et CEE.</li>
            <li>Aucun montant n’est affiché ici tant qu’il n’est pas issu d’un calcul validé sur le dossier.</li>
            <li>Cumul des aides ≤ 100 % des travaux. Travaux RGE. MAR Léo-Energy pour le Parcours.</li>
          </ul>
        </section>
      ) : null}

      {vue === "financement" ? (
        <section className={`rounded-2xl border border-slate-800 bg-slate-900/80 ${pad}`}>
          <h2 className={`font-semibold text-white ${titre}`}>Financement — sous réserve</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Étude de financement via FABIEN — VIVONS COURTIER — 06 71 19 96 45. Éco-PTZ jusqu’à
            50 000 € à taux 0 % si éligible. Prêt travaux jusqu’à 75 000 €. Apport 0 € possible
            selon dossier. Aucun taux, aucune mensualité et aucun accord ne sont garantis ici.
          </p>
          <p className="mt-4 rounded-xl border border-orange-500/40 bg-orange-500/10 p-4 text-sm text-orange-100">
            NE JAMAIS SIGNER LES DEVIS DÉFINITIFS AVANT L’ACCORD ÉCRIT DE L’ANAH (sinon perte
            définitive et irrémédiable du MPR).
          </p>
        </section>
      ) : null}

      <p className="text-xs text-slate-500">
        Vue commerciale / client : aucun coût fournisseur, matériel, pose, coût Clyve d’achat ni
        prix plancher. La répartition des marges n’apparaît que pour l’administrateur.
      </p>
    </div>
  );
}
