import { useEffect, useState } from "react";
import {
  CONTROLES,
  DEVIS,
  DISCLAIMER,
  DOCUMENTS,
  DONNEES_LOGEMENT,
  MANQUANT,
  PIECES_PLAN,
  SCENARIOS,
  type Statut,
} from "../data/testMaisonClyve";

const STATUT_CLASS: Record<Statut, string> = {
  EXTRAIT: "bg-emerald-100 text-emerald-900 border-emerald-300",
  "À VÉRIFIER": "bg-amber-100 text-amber-950 border-amber-300",
  INCOHÉRENCE: "bg-red-100 text-red-900 border-red-300",
  "DONNÉE MANQUANTE": "bg-slate-200 text-slate-800 border-slate-400",
  "PRÊT POUR VALIDATION HUMAINE": "bg-sky-100 text-sky-950 border-sky-300",
};

function Badge({ statut }: { statut: Statut }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUT_CLASS[statut]}`}
    >
      {statut}
    </span>
  );
}

function OrigineTag({ value }: { value: string }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
      Origine : {value}
    </span>
  );
}

export default function TestMaisonClyve() {
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const previous = document.title;
    document.title = "TEST LOCAL — Maison Clyve | ENERGIA CONSEIL IA®";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900">
      <header className="border-b-4 border-amber-500 bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-400">
            Test local — ne pas publier
          </p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Parcours test — Maison Clyve
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
            Documents → Données bâtiment → Contrôles → Scénarios → Pré-rapport.
            Corpus unique : photos, plan et trois devis joints. Aucune donnée
            absente n’a été complétée. Aucun audit réglementaire.
          </p>
          <p className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {DISCLAIMER}
          </p>
          <a
            href="/test-maison-clyve/rapport-complet"
            className="mt-4 inline-flex rounded-full border border-amber-400 px-4 py-1.5 text-sm text-amber-100 hover:bg-amber-500/20"
          >
            Ouvrir le rapport complet avant / après
          </a>
        </div>
      </header>

      <nav
        className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur"
        aria-label="Sections du test"
      >
        <div className="mx-auto flex max-w-5xl gap-3 overflow-x-auto px-4 py-2 text-xs font-medium sm:px-6">
          {[
            ["#documents", "1. Documents"],
            ["#logement", "2. Logement"],
            ["#devis", "3. Devis"],
            ["#controles", "4. Contrôles"],
            ["#statuts", "5. Statuts"],
            ["#scenarios", "Scénarios"],
            ["#pre-rapport", "6. Pré-rapport"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-slate-700 hover:border-slate-900"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6">
        <section id="documents">
          <h2 className="text-xl font-semibold">1. Documents analysés</h2>
          <p className="mt-1 text-sm text-slate-600">
            8 visuels joints + 3 devis PDF. Confiance = lisibilité de
            l’extraction, pas une validation technique de chantier.
          </p>
          <div className="mt-4 grid gap-4">
            {DOCUMENTS.map((doc) => (
              <article
                key={doc.nom}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid gap-0 md:grid-cols-[180px_1fr]">
                  {doc.imageSrc && !brokenImages[doc.nom] ? (
                    <img
                      src={doc.imageSrc}
                      alt=""
                      className="h-40 w-full object-cover md:h-full"
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [doc.nom]: true }))
                      }
                    />
                  ) : (
                    <div className="flex min-h-24 items-center justify-center bg-slate-50 px-3 text-center text-xs text-slate-500">
                      {doc.type.startsWith("Devis")
                        ? "PDF"
                        : "Aperçu non chargé en local"}
                    </div>
                  )}
                  <div className="space-y-2 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold break-all">{doc.nom}</h3>
                      <Badge statut={doc.statut} />
                    </div>
                    <p className="text-sm text-slate-700">{doc.type}</p>
                    <OrigineTag value={doc.origine} />
                    <p className="text-xs text-slate-500">
                      Niveau de confiance : {doc.confiance}
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {doc.extraits.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="logement">
          <h2 className="text-xl font-semibold">2. Données du logement</h2>
          <p className="mt-1 text-sm text-slate-600">
            Chaque ligne porte une origine. Les totaux non écrits sur le plan
            restent « {MANQUANT} ».
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Donnée</th>
                  <th className="px-3 py-2">Valeur</th>
                  <th className="px-3 py-2">Origine</th>
                  <th className="px-3 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {DONNEES_LOGEMENT.map((row) => (
                  <tr key={row.libelle} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2 font-medium">{row.libelle}</td>
                    <td className="px-3 py-2">
                      {row.valeur}
                      {row.note ? (
                        <p className="mt-1 text-xs text-slate-500">{row.note}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-xs uppercase">{row.origine}</td>
                    <td className="px-3 py-2">
                      <Badge statut={row.statut} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 text-base font-semibold">Pièces cotées sur le plan</h3>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Pièce</th>
                  <th className="px-3 py-2">Surface (plan)</th>
                </tr>
              </thead>
              <tbody>
                {PIECES_PLAN.map((piece) => (
                  <tr key={piece.nom} className="border-t border-slate-100">
                    <td className="px-3 py-2">{piece.nom}</td>
                    <td className="px-3 py-2">{piece.surface}</td>
                  </tr>
                ))}
                <tr className="border-t border-slate-200 bg-slate-50 font-medium">
                  <td className="px-3 py-2">Somme des pièces cotées</td>
                  <td className="px-3 py-2">153,00 m² — EXTRAIT plan</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="devis">
          <h2 className="text-xl font-semibold">3. Analyse des devis</h2>
          <p className="mt-1 text-sm text-slate-600">
            Montants repris exactement. Les deux devis toiture ne sont pas
            additionnés.
          </p>
          <div className="mt-4 space-y-6">
            {DEVIS.map((devis) => (
              <article
                key={devis.fichier}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold break-all">{devis.fichier}</h3>
                  <Badge statut={devis.statut} />
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Entreprise</dt>
                    <dd>{devis.entreprise}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Poste</dt>
                    <dd>{devis.poste}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Montant HT</dt>
                    <dd>{devis.ht}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">TVA</dt>
                    <dd>{devis.tva}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Montant TTC</dt>
                    <dd>{devis.ttc}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Date</dt>
                    <dd>{devis.date}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase text-slate-500">Validité</dt>
                    <dd>{devis.validite}</dd>
                  </div>
                </dl>
                <h4 className="mt-4 text-sm font-semibold">Lignes lues</h4>
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-2 py-1">Réf.</th>
                        <th className="px-2 py-1">Désignation</th>
                        <th className="px-2 py-1">Montant lu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devis.lignes.map((ligne) => (
                        <tr key={ligne.ref} className="border-t border-slate-100">
                          <td className="px-2 py-1 align-top">{ligne.ref}</td>
                          <td className="px-2 py-1">{ligne.designation}</td>
                          <td className="whitespace-nowrap px-2 py-1">{ligne.montantHt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <h4 className="mt-4 text-sm font-semibold">Informations non lisibles</h4>
                <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
                  {devis.nonLisible.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {devis.notes.map((note) => (
                    <li key={note}>— {note}</li>
                  ))}
                </ul>
                <OrigineTag value="devis" />
              </article>
            ))}
          </div>
        </section>

        <section id="controles">
          <h2 className="text-xl font-semibold">4. Contrôles de cohérence</h2>
          <div className="mt-4 space-y-3">
            {CONTROLES.map((item) => (
              <article
                key={item.titre}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{item.titre}</h3>
                  <Badge statut={item.statut} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="statuts">
          <h2 className="text-xl font-semibold">5. Statuts</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {(
              [
                ["EXTRAIT", "Lu tel quel sur photo, plan ou devis."],
                ["À VÉRIFIER", "Lu mais incomplet, ambigu ou à recouper sur site."],
                ["INCOHÉRENCE", "Deux documents du corpus se contredisent."],
                ["DONNÉE MANQUANTE", "Absent du corpus — non inventé."],
                [
                  "PRÊT POUR VALIDATION HUMAINE",
                  "Extraction chiffrée cohérente en interne ; devis échus, pas un audit.",
                ],
              ] as [Statut, string][]
            ).map(([statut, texte]) => (
              <li
                key={statut}
                className="rounded-xl border border-slate-200 bg-white p-3 text-sm"
              >
                <Badge statut={statut} />
                <p className="mt-2 text-slate-700">{texte}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm">
            Statut global du dossier test :{" "}
            <Badge statut="À VÉRIFIER" /> — extraits exploitables, devis échus,
            surfaces toiture contradictoires, SHAB totale absente. Pas{" "}
            <span className="font-medium">PRÊT POUR VALIDATION HUMAINE</span> au
            niveau du dossier entier.
          </p>
        </section>

        <section id="scenarios">
          <h2 className="text-xl font-semibold">Scénarios de travail</h2>
          <p className="mt-1 text-sm text-slate-600">
            Pistes issues uniquement des devis joints. Aucune économie, aide ou
            DPE projeté.
          </p>
          <div className="mt-4 grid gap-3">
            {SCENARIOS.map((scenario) => (
              <article
                key={scenario.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">
                    {scenario.id}. {scenario.titre}
                  </h3>
                  <Badge statut={scenario.statut} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {scenario.contenu}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="pre-rapport" className="rounded-2xl border-2 border-slate-900 bg-white p-5">
          <h2 className="text-xl font-semibold">6. Pré-rapport — synthèse de travail</h2>
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950">
            {DISCLAIMER}
          </p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-800">
            <p>
              Dossier test « Maison Clyve » constitué de 8 visuels (7 photos + 1
              plan) et 3 devis au nom de Mme ANDRIOT Clyve, 654 route
              départementale 975, 71290 (graphie LA GENETE / LA GENÊTE).
            </p>
            <p>
              Le plan permet d’extraire 14 pièces pour une somme de{" "}
              <strong>153,00 m²</strong>. La surface habitable totale n’est pas
              écrite. Le couloir et des salles d’eau communes restent{" "}
              {MANQUANT}
            </p>
            <p>
              Les photos montrent une longère à toiture dégradée, des murs à
              enduit manquant, des menuiseries hétérogènes, des travaux de dalle
              / plancher en cours. Le chauffage se limite à des souches de
              cheminée visibles. La ventilation n’est pas documentée.
            </p>
            <p>
              Toiture : deux offres non cumulables — SARL FAIVRE 15/03/2022,{" "}
              <strong>48 879,20 € HT / 53 767,12 € TTC</strong> (360 m² de
              couverture) ; Madinier entreprise 25/10/2021,{" "}
              <strong>57 850,00 €</strong> sans ventilation HT/TTC (450 m²).
              Surfaces 360 / 450 / 505 m² : incohérence.
            </p>
            <p>
              Maçonnerie : MTL MACONNERIE 14/04/2022,{" "}
              <strong>25 239,00 € HT / 27 762,90 € TTC</strong>, cinq dalles.
              Lien possible avec la dalle photographiée, non démontré.
            </p>
            <p>
              Les trois devis sont échus à la date du test. Aucun devis
              menuiserie, isolation des murs, VMC ou système de chauffage n’est
              joint. Aucun scénario énergétique chiffré n’est produit.
            </p>
            <p>
              Suite utile : visite, métrés de toiture et de SHAB, actualisation
              des devis, documents manquants listés en section 2. Rien de ce
              pré-rapport ne constitue un audit, un DPE, un devis ENERGIA ni un
              engagement d’aides.
            </p>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            ENERGIA CONSEIL IA® — 16 rue Cuvier, 69006 Lyon —
            contact@energia-conseil-ia.com — page locale /test-maison-clyve —
            hors production.
          </p>
        </section>
      </main>
    </div>
  );
}
