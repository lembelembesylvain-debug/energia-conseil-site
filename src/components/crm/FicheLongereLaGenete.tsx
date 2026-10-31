import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IDENTITE_LEGALE, MENTION_PROPRIETE_INTELLECTUELLE } from "../../lib/branding";
import {
  ANNEXE_COUPE_3D,
  AVERTISSEMENT_AIDES_2027,
  CHARTE_PHASES,
  CLAUSES_DEVIS,
  CONTACTS_PROJET,
  INDEPENDANCE_PHASE_1,
  LIGNES_PHASE_3,
  MARGE_CG_PHASE_1_HT,
  MARGE_CG_PHASE_4_HT,
  MENTIONS_AIDES,
  MODULES_TRAVEES,
  PHASES,
  PHASE_4,
  TITRE_PROJECTION_FINANCIERE_2027,
  TOTAL_PHASE_1_HT,
  TOTAL_PHASE_4_HT,
  PRIORITES_VISITE,
  PROJET_LONGERE,
  TAUX_MARGE_CG_SANCTUARISE,
  euro,
  genererOffre,
  pct,
  sommeLongueurs,
  sommeSurfacesModules,
  type IdPhase,
  type ModeOffre,
  type ModuleTravee,
} from "../../data/longereLaGenete";

type OptionFiche = ModeOffre | "phase4";

const COULEUR_MODULE: Record<ModuleTravee["id"], string> = {
  A: "bg-amber-700",
  B: "bg-emerald-700",
  C: "bg-sky-700",
  D: "bg-violet-700",
  E: "bg-slate-600",
  F: "bg-stone-500",
};

type CibleImpression = "printemps" | "visite" | null;
type ZoneImpression = "fiche" | "devis" | "visite" | "marge" | "chrome" | "printemps";

function classeImpression(zone: ZoneImpression, cible: CibleImpression): string {
  if (zone === "printemps") return cible === "printemps" ? "hidden print:block" : "hidden";
  if (zone === "marge" || zone === "chrome") return "print:hidden";
  if (cible === "printemps") return "print:hidden";
  if (cible === "visite" && zone === "devis") return "print:hidden";
  if (cible === "visite" && zone === "fiche") return "print:hidden";
  return "";
}

export default function FicheLongereLaGenete() {
  const [moduleActif, setModuleActif] = useState<ModuleTravee["id"]>("B");
  const [mode, setMode] = useState<OptionFiche>("phase1");
  const [cibleImpression, setCibleImpression] = useState<CibleImpression>(null);
  const [rapportEnCours, setRapportEnCours] = useState(false);
  const offrePhase1 = useMemo(() => genererOffre("phase1"), []);
  const offrePhase1et2 = useMemo(() => genererOffre("phase1et2"), []);
  const offre = mode === "phase1et2" ? offrePhase1et2 : offrePhase1;
  const module = MODULES_TRAVEES.find((item) => item.id === moduleActif) ?? MODULES_TRAVEES[1];
  const longueur = sommeLongueurs();
  const ecartSurface = PROJET_LONGERE.surfaceHabitablePlanM2 - sommeSurfacesModules();

  useEffect(() => {
    if (cibleImpression === "printemps") {
      document.title = "Devis prévisionnel Printemps 2027 — La Genête | ENERGIA CONSEIL IA®";
      return;
    }
    document.title = "Maison Clyve — La Genête | ENERGIA CONSEIL IA®";
  }, [cibleImpression]);

  useEffect(() => {
    const reset = () => setCibleImpression(null);
    window.addEventListener("afterprint", reset);
    return () => window.removeEventListener("afterprint", reset);
  }, []);

  const imprimer = (cible: Exclude<CibleImpression, null>) => {
    setCibleImpression(cible);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.print());
    });
  };

  const telechargerRapport = async () => {
    setRapportEnCours(true);
    try {
      const { generateRapportLaGenetePdf } = await import("../../lib/generateRapportLaGenetePdf");
      await generateRapportLaGenetePdf();
    } finally {
      setRapportEnCours(false);
    }
  };

  const imprimerMarcheUrgence = async () => {
    setRapportEnCours(true);
    try {
      const { imprimerContratUrgenceLaGenete } = await import("../../lib/generateRapportLaGenetePdf");
      await imprimerContratUrgenceLaGenete();
    } finally {
      setRapportEnCours(false);
    }
  };

  const imprimerDevisPrintemps = async () => {
    setRapportEnCours(true);
    try {
      const { imprimerDevisPrintempsLaGenete } = await import("../../lib/generateRapportLaGenetePdf");
      await imprimerDevisPrintempsLaGenete();
    } finally {
      setRapportEnCours(false);
    }
  };

  return (
    <div className="fiche-longere min-h-screen bg-stone-100 text-slate-900">
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: white !important; }
          .fiche-longere img {
            image-rendering: auto;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .annexe-technique {
            text-align: center;
          }
          .annexe-technique h3 {
            text-align: left;
            break-after: avoid;
            page-break-after: avoid;
          }
          .annexe-figure {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .annexe-technique img {
            display: block;
            margin: 0 auto;
            max-width: 100%;
            max-height: 130mm;
            width: auto;
          }
          .annexe-technique figcaption,
          .annexe-technique p {
            text-align: left;
          }
          .badge-phase,
          .liseret-phase,
          .thead-phase th,
          .bandeau-printemps {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .saut-page-impression {
            break-before: page;
            page-break-before: always;
          }
          .bloc-impression {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <header className="bg-[#0B1F3A] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
              ENERGIA-CONSEIL IA® · Bureau d'études et contractant général
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Longère La Genête</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-200">
              {PROJET_LONGERE.typologie}. {longueur.toLocaleString("fr-FR")} m de façade,{" "}
              {PROJET_LONGERE.surfaceHabitablePlanM2.toLocaleString("fr-FR")} m² au plan.
            </p>
          </div>
          <div className={`flex flex-wrap gap-2 ${classeImpression("chrome", cibleImpression)}`}>
            <button
              type="button"
              onClick={() => void imprimerMarcheUrgence()}
              disabled={rapportEnCours}
              className="rounded-full bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
            >
              {rapportEnCours ? "Préparation du contrat…" : "Imprimer le Marché d'Urgence Hiver"}
            </button>
            <button
              type="button"
              onClick={() => void imprimerDevisPrintemps()}
              disabled={rapportEnCours}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-amber-100 shadow-sm ring-1 ring-[#C9A227] disabled:opacity-60"
            >
              {rapportEnCours ? "Préparation du devis…" : "Imprimer le Devis Prévisionnel Printemps 2027"}
            </button>
            <button
              type="button"
              onClick={() => imprimer("visite")}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0B1F3A]"
            >
              Imprimer la visite
            </button>
            <button
              type="button"
              onClick={() => void telechargerRapport()}
              disabled={rapportEnCours}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {rapportEnCours ? "Préparation du contrat…" : "Télécharger le PDF client"}
            </button>
            <Link
              to="/contrat-lagenete"
              className="rounded-full border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-300"
            >
              Voir le contrat officiel
            </Link>
            <Link to="/test-maison-clyve" className="rounded-full border border-white/30 px-4 py-2 text-sm text-white">
              Dossier Clyve
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto min-w-0 max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <section className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${classeImpression("fiche", cibleImpression)}`}>
          <CarteMeta label="Maître d'ouvrage" valeur={PROJET_LONGERE.client} detail={PROJET_LONGERE.cabinet} />
          <CarteMeta
            label="Adresse"
            valeur={`${PROJET_LONGERE.codePostal} ${PROJET_LONGERE.commune}`}
            detail={PROJET_LONGERE.adresse}
          />
          <CarteMeta
            label="Géométrie"
            valeur={`Faîtage ${PROJET_LONGERE.hauteurFaitageM.toLocaleString("fr-FR")} m`}
            detail={`Égout ${PROJET_LONGERE.hauteurEgoutM.toLocaleString("fr-FR")} m · refends ${PROJET_LONGERE.epaisseurRefendsCm} cm`}
          />
          <CarteMeta
            label="Alerte pisé"
            valeur="Mur B imbibé"
            detail="Fuite nourrice / cuivre. Étanchéité à reprendre avant l'hiver."
            alerte
          />
        </section>

        <section className={`rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 ${classeImpression("fiche", cibleImpression)}`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#0B1F3A]">Six travées, de A à F</h2>
              <p className="mt-1 text-sm text-slate-600">
                Cotes intérieures entre murs de refend. Largeur du bandeau proportionnelle à la longueur de façade.
              </p>
            </div>
            <p className="text-sm text-slate-500">
              Somme des modules {sommeSurfacesModules().toLocaleString("fr-FR")} m² · écart au plan{" "}
              {ecartSurface.toLocaleString("fr-FR")} m² à recouper sur site
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <div className="flex min-w-[760px] gap-1" role="tablist" aria-label="Travées de la longère">
              {MODULES_TRAVEES.map((item) => {
                const actif = item.id === moduleActif;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={actif}
                    onClick={() => setModuleActif(item.id)}
                    style={{ flexGrow: item.longueurM, flexBasis: 0 }}
                    className={`min-h-28 rounded-xl px-2 py-3 text-left text-white transition ${COULEUR_MODULE[item.id]} ${
                      actif ? "ring-2 ring-[#0B1F3A] ring-offset-2" : "opacity-90 hover:opacity-100"
                    } ${item.horsPerimetreUrgent ? "opacity-70" : ""}`}
                  >
                    <span className="block text-lg font-semibold">{item.id}</span>
                    <span className="mt-1 block text-xs leading-snug">{item.nom}</span>
                    <span className="mt-2 block text-xs font-medium">
                      {item.longueurM.toLocaleString("fr-FR")} m · {item.surfaceM2.toLocaleString("fr-FR")} m²
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]" role="tabpanel">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Module {module.id} · {module.role}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{module.etat}</p>
              <ul className="mt-3 divide-y divide-stone-100">
                {module.pieces.map((piece) => (
                  <li key={piece.nom} className="flex items-baseline justify-between gap-3 py-2 text-sm">
                    <span>
                      <span className="font-medium">{piece.nom}</span>
                      {piece.note ? <span className="mt-0.5 block text-xs text-slate-500">{piece.note}</span> : null}
                    </span>
                    <span className="shrink-0 tabular-nums">{piece.surfaceM2.toLocaleString("fr-FR")} m²</span>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="space-y-2">
              {module.alertes.map((alerte) => (
                <li key={alerte} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  {alerte}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={classeImpression("chrome", cibleImpression)} aria-labelledby="selecteur-phase">
          <h2 id="selecteur-phase" className="text-lg font-semibold text-[#0B1F3A]">
            Devis client instantané
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Phase 1 à signer maintenant. Phase 4 : option printemps, parcours MAR / Anah, hors marché d'urgence.
          </p>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Légende des phases">
            <BadgePhase id={1} />
            <BadgePhase id={2} />
            <BadgePhase id={3} />
            <BadgePhase id={4} />
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-3" role="radiogroup" aria-label="Périmètre du devis">
            <BoutonPhase
              actif={mode === "phase1"}
              onSelect={() => setMode("phase1")}
              phase={1}
              titre="Phase 1 — urgence hiver"
              montant="8 850 € HT · 9 735 € TTC"
              detail="Charpente, hors d'eau, plomberie, direction 1 500 € HT."
            />
            <BoutonPhase
              actif={mode === "phase1et2"}
              onSelect={() => setMode("phase1et2")}
              phase={2}
              secondaire={1}
              titre="Phases 1 et 2 — urgence et habitabilité B"
              montant="14 850 € HT · 16 335 € TTC"
              detail="Ajoute le plancher haut du module B et les attentes cuisine."
            />
            <BoutonPhase
              actif={mode === "phase4"}
              onSelect={() => setMode("phase4")}
              phase={4}
              titre="Phase 4 — rénovation énergétique globale"
              montant="69 000 € HT · 72 795 € TTC"
              detail="Printemps, parcours MAR / Anah. TVA 5,5 %. Direction 5 200 € HT sanctuarisée."
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void imprimerMarcheUrgence()}
              disabled={rapportEnCours}
              className="rounded-full bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {rapportEnCours ? "Préparation du contrat…" : "Imprimer le Marché d'Urgence Hiver"}
            </button>
            <button
              type="button"
              onClick={() => void imprimerDevisPrintemps()}
              disabled={rapportEnCours}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-amber-100 ring-1 ring-[#C9A227] disabled:opacity-60"
            >
              {rapportEnCours ? "Préparation du devis…" : "Imprimer le Devis Prévisionnel Printemps 2027"}
            </button>
          </div>
        </section>

        <div className="grid min-w-0 gap-6 print:block xl:grid-cols-[1.4fr_0.8fr]">
          <article
            id="devis-client"
            className={`liseret-phase min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 ${
              mode === "phase4"
                ? CHARTE_PHASES[4].liseretClasse
                : mode === "phase1et2"
                  ? CHARTE_PHASES[2].liseretClasse
                  : CHARTE_PHASES[1].liseretClasse
            } ${classeImpression("devis", cibleImpression)}`}
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center gap-2">
              {mode === "phase4" ? (
                <BadgePhase id={4} />
              ) : mode === "phase1et2" ? (
                <>
                  <BadgePhase id={1} />
                  <BadgePhase id={2} />
                </>
              ) : (
                <BadgePhase id={1} />
              )}
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
              {mode === "phase4" ? "Option printemps — hors marché d'urgence" : "Devis client"}
            </p>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#0B1F3A]">
                  {mode === "phase4" ? "OPT-2026-LAGENETE-P4" : offre.numero}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {PROJET_LONGERE.dateLibelle} · validité {PROJET_LONGERE.validite} ·{" "}
                  {mode === "phase4"
                    ? "TVA 5,5 % — rénovation énergétique d'un logement achevé depuis plus de deux ans. Option indicative, devis définitif après accord ANAH."
                    : PROJET_LONGERE.motifTva}
                </p>
              </div>
              <p className="text-right text-sm text-slate-600">
                {PROJET_LONGERE.client}
                <span className="block">{PROJET_LONGERE.cabinet}</span>
                <span className="block">
                  {PROJET_LONGERE.adresse}, {PROJET_LONGERE.codePostal} {PROJET_LONGERE.commune}
                </span>
              </p>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-700">
              {mode === "phase4"
                ? PHASE_4.libelleOption +
                  ". Ordre impératif : isolation sarking, tuiles, menuiseries, VMC, puis PAC et chauffe-eau. À signer seulement après l'accord écrit de l'ANAH."
                : "Mise hors d'eau des travées B à D et sécurisation de la plomberie avant l'hiver. Le module F (grange, 71,9 m²) reste hors de ce marché. La couverture en tuiles et l'isolation sarking sont reportées au printemps, avec le parcours d'aides."}
            </p>

            {mode === "phase4" ? (
              <>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                    <thead>
                      <tr className={`thead-phase text-xs uppercase tracking-wide ${CHARTE_PHASES[4].theadClasse}`}>
                        <th className="px-3 py-2 font-medium">N°</th>
                        <th className="px-3 py-2 font-medium">Désignation</th>
                        <th className="px-3 py-2 text-right font-medium">Total HT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PHASE_4.postes.map((poste) => (
                        <tr key={poste.ordre} className="border-b border-stone-100 align-top">
                          <td className="py-3 pr-3 tabular-nums text-slate-500">{poste.ordre}</td>
                          <td className="py-3 pr-3">
                            <span className="font-medium text-slate-900">{poste.nom}</span>
                            <span className="mt-1 block text-xs leading-relaxed text-slate-500">{poste.detail}</span>
                          </td>
                          <td className="py-3 text-right font-medium tabular-nums">{euro(poste.ht)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <dl className="mt-4 grid gap-2 border-t border-slate-200 pt-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Total HT</dt>
                    <dd className="text-lg font-semibold tabular-nums">{euro(PHASE_4.totalHt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">TVA 5,5 %</dt>
                    <dd className="text-lg font-semibold tabular-nums">{euro(PHASE_4.totalTva)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Total TTC</dt>
                    <dd className="text-lg font-semibold tabular-nums">{euro(PHASE_4.totalTtc)}</dd>
                  </div>
                </dl>
                <SectionProjection2027 detailMontants />
              </>
            ) : (
              <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className={`thead-phase text-xs uppercase tracking-wide ${mode === "phase1et2" ? CHARTE_PHASES[2].theadClasse : CHARTE_PHASES[1].theadClasse}`}>
                    <th className="px-3 py-2 font-medium">N°</th>
                    <th className="px-3 py-2 font-medium">Désignation</th>
                    <th className="px-3 py-2 font-medium">Module</th>
                    <th className="px-3 py-2 text-right font-medium">Qté</th>
                    <th className="px-3 py-2 text-right font-medium">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {offre.lignes.map((ligne, index) => (
                    <tr key={ligne.id} className="border-b border-stone-100 align-top">
                      <td className="py-3 pr-3 tabular-nums text-slate-500">{index + 1}</td>
                      <td className="py-3 pr-3">
                        <span className="font-medium text-slate-900">{ligne.designation}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-slate-500">{ligne.specifications}</span>
                      </td>
                      <td className="py-3 pr-3 text-slate-600">{ligne.module}</td>
                      <td className="py-3 pr-3 text-right text-slate-600">
                        {ligne.quantite} {ligne.unite}
                      </td>
                      <td className="py-3 text-right font-medium tabular-nums">{euro(ligne.totalHt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="mt-4 grid gap-2 border-t border-slate-200 pt-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Total HT</dt>
                <dd className="text-lg font-semibold tabular-nums">{euro(offre.totalHt)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">TVA 10 %</dt>
                <dd className="text-lg font-semibold tabular-nums">{euro(offre.totalTva)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">Total TTC · reste à charge</dt>
                <dd className="text-lg font-semibold tabular-nums text-emerald-800">{euro(offre.totalTtc)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-slate-500">
              Aucune aide n'est déduite de ce devis. Le reste à charge est le total TTC.
            </p>
            <SectionProjection2027 detailMontants />
              </>
            )}

            <section className="annexe-technique mt-6 border-t border-slate-200 pt-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B1F3A]">
                {ANNEXE_COUPE_3D.titre}
              </h3>
              {ANNEXE_COUPE_3D.figures.map((figure) => (
                <figure key={figure.src} className="annexe-figure mt-4">
                  <img
                    src={figure.src}
                    alt={figure.alt}
                    loading="eager"
                    decoding="sync"
                    className="mx-auto block h-auto max-w-full rounded-lg border border-stone-300"
                  />
                  <figcaption className="mt-3 text-sm leading-relaxed text-slate-700">{figure.legende}</figcaption>
                  <p className="mt-1 text-xs text-slate-500">{figure.mention}</p>
                </figure>
              ))}
            </section>

            <section className="mt-6">
              <h3 className="text-base font-semibold text-[#0B1F3A]">Plan de financement et scénarios de démarrage</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Ce marché d'urgence se règle par déblocage 30 / 40 / 30. Le 40 % et le solde ne partent qu'après
                validation de Sylvain LEMBELEMBE. La phase énergétique du printemps suit un choix séparé.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <Echeance label="30 % à la signature" montant={offre.echeancier.signature} />
                <Echeance label="40 % mi-chantier, après Sylvain" montant={offre.echeancier.miChantier} />
                <Echeance label="30 % à la réception" montant={offre.echeancier.reception} />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                Paiement par déblocage progressif 30/40/30 : 30 % à la signature, 40 % mi-chantier après validation
                de Sylvain LEMBELEMBE (contractant général — ENERGIA-CONSEIL IA®), 30 % à réception. Courtier :
                FABIEN — VIVONS COURTIER — 06 71 19 96 45. Prêt travaux jusqu'à 75 000 €, apport 0 € possible,
                réponse sous 48 à 72 h.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[#1a3c5e] text-white">
                      <th className="px-3 py-2 font-medium">Critère</th>
                      <th className="bg-[#f0fdf4] px-3 py-2 font-medium text-slate-900">Scénario A – Aides Max</th>
                      <th className="bg-[#f0f9ff] px-3 py-2 font-medium text-slate-900">Scénario B – Rapide</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Délai démarrage", "3 à 6 mois", "3 semaines"],
                      ["MaPrimeRénov'", "Oui", "Non"],
                      ["Éco-PTZ", "Oui", "Oui"],
                      ["Prêt FABIEN", "Oui", "Oui"],
                      ["CEE (hors ITE/ITI)", "Oui", "Oui"],
                      ["Financement max", "MPR + 125 000 EUR", "125 000 EUR"],
                      ["Reste à charge", "Minimisé", "Plus élevé"],
                      ["Contrainte", "Accord ANAH obligatoire", "Aucune"],
                      ["Idéal pour", "BLEU / JAUNE / VIOLET", "ROSE / Non éligible / Pressé"],
                    ].map(([critere, a, b]) => (
                      <tr key={critere} className="border-b border-stone-100">
                        <th className="px-3 py-2 text-left font-medium">{critere}</th>
                        <td className="bg-[#f0fdf4] px-3 py-2">{a}</td>
                        <td className="bg-[#f0f9ff] px-3 py-2">{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm font-semibold text-emerald-900">
                NE JAMAIS SIGNER LES DEVIS DÉFINITIFS AVANT L'ACCORD ÉCRIT DE L'ANAH (sinon perte définitive et
                irrémédiable du MPR).
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Cette règle vise la phase 4 (toiture isolée, pompe à chaleur, eau chaude, VMC). Le présent devis
                d'urgence, lui, peut être signé maintenant : il ne contient aucun geste énergétique subventionné.
                Ordre de grandeur des aides de la phase 4 : 80 % de prise en charge financière (Profil Anah Bleu — Très Modeste). Subvention Anah directe estimée : 55 200 € à 56 000 €. Reste à charge prévisionnel estimé : ~13 600 € à 17 595 € TTC (finançable via Éco-PTZ à taux 0 % par Vivons Courtier).
              </p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {MENTIONS_AIDES.map((mention) => (
                  <li key={mention}>{mention}</li>
                ))}
              </ul>

              <fieldset className="mt-4 rounded-xl border border-[#f97316] bg-white p-4 shadow-sm">
                <legend className="px-1 text-sm font-semibold text-[#0B1F3A]">Choix du client — phase 4 uniquement</legend>
                <label className="mt-2 flex gap-2 text-sm">
                  <input type="checkbox" className="mt-1" />
                  Scénario A : j'attends l'accord ANAH (3 à 6 mois) avant tout devis énergétique définitif.
                </label>
                <label className="mt-2 flex gap-2 text-sm">
                  <input type="checkbox" className="mt-1" />
                  Scénario B : je renonce à MaPrimeRénov' pour un démarrage rapide (3 semaines).
                </label>
                <p className="mt-3 text-sm text-slate-600">Fait à ____________________ le ______________</p>
                <p className="mt-1 text-sm text-slate-600">Signature client ____________________</p>
              </fieldset>

              <aside className="mt-4 border-l-4 border-[#f97316] bg-[#fff7ed] px-4 py-3 text-sm leading-relaxed text-slate-800">
                <p className="font-semibold">Avis juridique — scénarios exclusifs</p>
                <p className="mt-1">
                  Scénario A : l'accord écrit de l'ANAH précède toute signature de devis définitif sur les travaux
                  énergétiques, sinon perte définitive et irrémédiable de MaPrimeRénov'. Scénario B : renonciation
                  définitive à MaPrimeRénov' pour les travaux concernés. ENERGIA-CONSEIL IA® n'est pas responsable
                  d'un non-respect de ce choix par le client.
                </p>
                <p className="mt-2 text-xs">Avis établi par Julia – Juriste ENERGIA-CONSEIL IA® – Mars 2026</p>
              </aside>
            </section>

            <section className="mt-6">
              <h3 className="text-base font-semibold text-[#0B1F3A]">Conditions</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {CLAUSES_DEVIS.map((clause) => (
                  <li key={clause.titre}>
                    <span className="font-medium">{clause.titre}. </span>
                    {clause.texte}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-slate-700">
                Artisans certifiés RGE, choisis par Sylvain LEMBELEMBE, deux à trois devis par poste. Ordre impératif
                en phase 4 : isolation sarking, tuiles, VMC, pompe à chaleur, chauffe-eau. Le client certifie
                l'exactitude des informations données pour les aides ; une fausse déclaration reste à sa charge.
              </p>
            </section>

            <section className="mt-6 rounded-xl border border-slate-200 p-4">
              <h3 className="text-base font-semibold">Bon pour accord</h3>
              <p className="mt-2 text-sm leading-relaxed">
                Je soussigné(e) {PROJET_LONGERE.client}, accepte le devis {offre.numero} et mandate ENERGIA-CONSEIL
                IA® pour la coordination du projet. Fait à ____________________, le ______________ Signature :
                ____________________
              </p>
            </section>

            <section className="mt-6 border-l-4 border-[#f97316] bg-[#fff7ed] px-4 py-3">
              <h3 className="text-base font-semibold text-[#0B1F3A]">X. Avis juridique</h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-slate-800">
                <li>Travaux d'urgence hors MaPrimeRénov'. TVA 10 % sur l'ensemble du forfait, direction comprise.</li>
                <li>
                  Pisé : charges reprises par des sablières en tête de mur, matériaux qui laissent sécher la terre,
                  aucun ciment sur le mur imbibé.
                </li>
                <li>
                  Un aléa de charpente découvert à l'ouverture, au-delà du forfait décrit, fait l'objet d'un avenant.
                </li>
                <li>
                  Clause Julia Protection Aides : responsabilité ENERGIA plafonnée à 2 000 € en cas d'écart &gt; 10 %
                  imputable à une erreur prouvée d'ENERGIA ; 0 % si erreur client ou décision ANAH/CEE.
                </li>
              </ul>
              <p className="mt-3 text-sm">Avis établi sous la responsabilité de Julia, juriste. {PROJET_LONGERE.dateLibelle}.</p>
            </section>
          </article>

          <aside
            className={`min-w-0 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5 ${classeImpression("marge", cibleImpression)}`}
            aria-label="Ventilation interne de la marge"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800">
              Interne ENERGIA — absent du devis client
            </p>
            <h2 className="mt-1 text-lg font-semibold text-amber-950">Marge de contractant général sanctuarisée</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-950">
              {mode === "phase4"
                ? `Phase 4 : direction sanctuarisée ${euro(MARGE_CG_PHASE_4_HT)} / ${euro(TOTAL_PHASE_4_HT)}. Dossier direct Sylvain LEMBELEMBE : 100 % de la marge CG à ENERGIA, aucun intermédiaire commercial.`
                : `Taux verrouillé sur la phase 1 : ${euro(MARGE_CG_PHASE_1_HT)} / ${euro(TOTAL_PHASE_1_HT)} = ${pct(TAUX_MARGE_CG_SANCTUARISE)}. Dossier direct Sylvain LEMBELEMBE : 100 % de la marge CG à ENERGIA, aucun intermédiaire commercial.`}
            </p>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-white">
              <div
                className="bg-slate-500"
                style={{
                  width: `${
                    mode === "phase4"
                      ? ((TOTAL_PHASE_4_HT - MARGE_CG_PHASE_4_HT) / TOTAL_PHASE_4_HT) * 100
                      : (offre.travauxHt / offre.totalHt) * 100
                  }%`,
                }}
              />
              <div
                className="bg-emerald-600"
                style={{
                  width: `${
                    mode === "phase4" ? (MARGE_CG_PHASE_4_HT / TOTAL_PHASE_4_HT) * 100 : offre.tauxMargeCg * 100
                  }%`,
                }}
              />
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt>Lots travaux, prix ferme client</dt>
                <dd className="font-semibold tabular-nums">
                  {euro(mode === "phase4" ? TOTAL_PHASE_4_HT - MARGE_CG_PHASE_4_HT : offre.travauxHt)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Direction ENERGIA, sanctuarisée</dt>
                <dd className="font-semibold tabular-nums text-emerald-800">
                  {euro(mode === "phase4" ? MARGE_CG_PHASE_4_HT : offre.margeCgHt)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Commission commerciale (aucun intermédiaire)</dt>
                <dd className="font-semibold tabular-nums">0,00 €</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-amber-200 pt-3">
                <dt>Part ENERGIA sur la marge CG</dt>
                <dd className="font-semibold tabular-nums">100 %</dd>
              </div>
            </dl>
            <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium text-emerald-900">
              {mode === "phase4"
                ? "100 % de la marge CG Phase 4 (5 200 € HT) reste à ENERGIA — dossier direct, sans commission commerciale."
                : offre.libelleStatutMarge}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {offre.lignes
                .filter((ligne) => ligne.nature === "marge_cg")
                .map((ligne) => (
                  <li key={ligne.id} className="flex justify-between gap-3 rounded-lg bg-white px-3 py-2">
                    <span>Phase {ligne.phase} verrouillée</span>
                    <span className="tabular-nums">{euro(ligne.totalHt)}</span>
                  </li>
                ))}
              <li className="flex justify-between gap-3 px-3 text-amber-900/80">
                <span>Phase 3, hors ce devis</span>
                <span className="tabular-nums">
                  {euro(LIGNES_PHASE_3.filter((ligne) => ligne.nature === "marge_cg").reduce((s, l) => s + l.totalHt, 0))}{" "}
                  sur {euro(4200)}
                </span>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-amber-900/80">
              Les coûts d'achat artisans seront connus après deux à trois devis par poste. Ils ne modifient pas le
              prix ferme présenté au client. Cette ventilation ne s'imprime pas.
            </p>
          </aside>
        </div>

        <section
          id="priorites-visite"
          className={`rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 ${classeImpression("visite", cibleImpression)}`}
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-[#0B1F3A]">Priorités pour la visite de chantier</h2>
              <p className="mt-1 text-sm text-slate-600">
                {PROJET_LONGERE.commune} · {PROJET_LONGERE.client} · à cocher sur place
              </p>
            </div>
            <p className="text-xs text-slate-500">{IDENTITE_LEGALE.raisonSociale} · {IDENTITE_LEGALE.siege}</p>
          </div>
          <ol className="mt-4 space-y-3">
            {PRIORITES_VISITE.map((priorite) => (
              <li key={priorite.rang} className="grid grid-cols-[auto_1fr] gap-3 border-b border-stone-100 pb-3">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border border-slate-400 text-xs print:border-black">
                  {priorite.rang}
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    <span className="mr-2 rounded bg-stone-100 px-1.5 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-600">
                      {priorite.niveau} · {priorite.module}
                    </span>
                    {priorite.titre}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{priorite.constat}</p>
                  <p className="mt-1 text-sm text-slate-900">{priorite.action}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={`grid gap-3 md:grid-cols-2 ${classeImpression("visite", cibleImpression)}`}>
          {PHASES.filter((phase) => phase.id === 3).map((phase) => (
            <article
              key={phase.id}
              className={`liseret-phase rounded-2xl border border-slate-200 ${CHARTE_PHASES[3].fondCarte} p-4 ${CHARTE_PHASES[3].liseretClasse}`}
            >
              <BadgePhase id={3} />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Hors devis instantané</p>
              <h2 className="mt-1 font-semibold">{phase.nom}</h2>
              <p className="mt-2 text-sm text-slate-700">{phase.resume}</p>
              <p className="mt-3 text-lg font-semibold tabular-nums">{euro(phase.totalHt)} HT</p>
            </article>
          ))}
          <article className={`liseret-phase rounded-2xl border border-emerald-200 ${CHARTE_PHASES[4].fondCarte} p-4 ${CHARTE_PHASES[4].liseretClasse}`}>
            <BadgePhase id={4} />
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Phase 4 · {PHASE_4.saison}
            </p>
            <h2 className="mt-1 font-semibold">{PHASE_4.libelleOption}</h2>
            <p className="mt-2 text-sm text-slate-700">{PHASE_4.resume}</p>
            <ol className="mt-3 list-decimal space-y-1 pl-4 text-sm text-slate-800">
              {PHASE_4.postes.map((poste) => (
                <li key={poste.ordre} className="flex justify-between gap-3">
                  <span>
                    <span className="font-medium">{poste.nom}. </span>
                    {poste.detail}
                  </span>
                  <span className="shrink-0 tabular-nums">{euro(poste.ht)}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-lg font-semibold tabular-nums text-emerald-950">
              {euro(PHASE_4.totalHt)} HT · {euro(PHASE_4.totalTtc)} TTC
            </p>
            <p className="mt-1 text-sm font-medium text-emerald-900">
              MaPrimeRénov' Parcours Accompagné (Profil Bleu 80 % indicatif) : ~55 200 €. Subvention Anah
              estimée : 55 200 € à 56 000 €. Reste à charge ~13 600 € à 17 595 € TTC.
            </p>
            <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
              {MENTIONS_AIDES.map((mention) => (
                <li key={mention}>{mention}</li>
              ))}
            </ul>
          </article>
        </section>

        <footer className={`rounded-2xl bg-[#0B1F3A] px-4 py-5 text-sm text-slate-100 sm:px-6 ${classeImpression("fiche", cibleImpression)}`}>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Contacts du projet</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACTS_PROJET.map((contact) => (
              <li key={contact.nom}>
                <span className="block text-xs text-slate-300">{contact.role}</span>
                <span className="font-medium text-white">{contact.nom}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-300">{contact.detail}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-400">
            {IDENTITE_LEGALE.raisonSociale}. {IDENTITE_LEGALE.forme}. {IDENTITE_LEGALE.ape}. {IDENTITE_LEGALE.siege}. {MENTION_PROPRIETE_INTELLECTUELLE}
          </p>
        </footer>
      </main>
    </div>
  );
}

function CarteMeta({
  label,
  valeur,
  detail,
  alerte = false,
}: {
  label: string;
  valeur: string;
  detail: string;
  alerte?: boolean;
}) {
  return (
    <article className={`rounded-2xl border p-4 ${alerte ? "border-red-200 bg-red-50" : "border-stone-200 bg-white"}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-semibold ${alerte ? "text-red-900" : "text-slate-900"}`}>{valeur}</p>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
    </article>
  );
}

function BoutonPhase({
  actif,
  onSelect,
  phase,
  secondaire,
  titre,
  montant,
  detail,
}: {
  actif: boolean;
  onSelect: () => void;
  phase: IdPhase;
  secondaire?: IdPhase;
  titre: string;
  montant: string;
  detail: string;
}) {
  const charte = CHARTE_PHASES[phase];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={actif}
      onClick={onSelect}
      className={`liseret-phase rounded-2xl border p-4 text-left shadow-sm ${charte.liseretClasse} ${
        actif ? charte.boutonActif : "border-stone-200 bg-white hover:border-slate-300"
      }`}
    >
      <span className="flex flex-wrap gap-1.5">
        {secondaire ? <BadgePhase id={secondaire} compact /> : null}
        <BadgePhase id={phase} compact />
      </span>
      <span className="mt-3 block font-semibold text-[#0B1F3A]">{titre}</span>
      <span className="mt-1 block text-sm font-medium tabular-nums text-emerald-800">{montant}</span>
      <span className="mt-2 block text-sm text-slate-600">{detail}</span>
    </button>
  );
}

function BadgePhase({ id, compact = false }: { id: IdPhase; compact?: boolean }) {
  const charte = CHARTE_PHASES[id];
  return (
    <span
      className={`badge-phase inline-flex items-center gap-1.5 rounded-full font-semibold uppercase tracking-wide ${charte.badgeClasse} ${
        compact ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]"
      }`}
    >
      <IconePhase id={id} />
      {charte.badge}
    </span>
  );
}

function IconePhase({ id }: { id: IdPhase }) {
  const commun = "h-3.5 w-3.5 shrink-0";
  if (id === 1) {
    return (
      <span className="inline-flex items-center" aria-hidden>
        <svg viewBox="0 0 24 24" className={commun} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3v18M4.8 7.2l14.4 9.6M4.8 16.8l14.4-9.6" />
        </svg>
        <svg viewBox="0 0 24 24" className={commun} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3 5 7v6c0 5 3.2 7.8 7 9 3.8-1.2 7-4 7-9V7l-7-4Z" />
        </svg>
      </span>
    );
  }
  if (id === 2) {
    return (
      <svg viewBox="0 0 24 24" className={commun} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M4 11 12 4l8 7v9H4z" />
        <path d="M10 20v-6h4v6" />
      </svg>
    );
  }
  if (id === 3) {
    return (
      <svg viewBox="0 0 24 24" className={commun} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M4 20h16M6 20V9h4v11M14 20V6h4v14" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={commun} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 21c6-4 8-8.2 8-12a8 8 0 1 0-16 0c0 3.8 2 8 8 12Z" />
      <path d="M12 8.5 13.2 11h2.6l-2.1 1.6.8 2.5L12 13.7 9.5 15.1l.8-2.5L8.2 11h2.6L12 8.5Z" />
    </svg>
  );
}

function SectionProjection2027({ detailMontants = false }: { detailMontants?: boolean }) {
  return (
    <section className={`liseret-phase mt-5 rounded-xl border border-emerald-200 ${CHARTE_PHASES[4].fondCarte} p-4 ${CHARTE_PHASES[4].liseretClasse}`}>
      <div className="flex flex-wrap items-center gap-2">
        <BadgePhase id={4} />
      </div>
      <h3 className="mt-3 text-base font-semibold text-[#0B1F3A]">{TITRE_PROJECTION_FINANCIERE_2027}</h3>
      {detailMontants ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-800">
              MaPrimeRénov' Parcours Accompagné (Profil Bleu 80 % indicatif)
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-900">~ 55 200 €</p>
            <p className="mt-1 text-xs text-emerald-900">
              80 % de prise en charge financière (Profil Anah Bleu — Très Modeste). Subvention Anah directe
              estimée : 55 200 € à 56 000 €.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-800">Reste à charge prévisionnel estimé</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-emerald-900">~ 13 600 € à 17 595 € TTC</p>
            <p className="mt-1 text-xs text-emerald-900">
              Finançable via Éco-PTZ à taux 0 % par Vivons Courtier.
            </p>
          </div>
        </div>
      ) : null}
      <aside className="mt-3 border-l-4 border-[#f97316] bg-[#fff7ed] px-3 py-2 text-sm leading-relaxed text-slate-800">
        {AVERTISSEMENT_AIDES_2027}
      </aside>
      <p className={`mt-3 text-sm font-medium ${CHARTE_PHASES[1].liseretClasse} border-stone-200 bg-slate-50 px-3 py-2 text-slate-800`}>
        {INDEPENDANCE_PHASE_1}
      </p>
      <ul className="mt-3 space-y-0.5 text-xs text-slate-600">
        {MENTIONS_AIDES.map((mention) => (
          <li key={mention}>{mention}</li>
        ))}
      </ul>
    </section>
  );
}

function Echeance({ label, montant }: { label: string; montant: number }) {
  return (
    <div className="rounded-xl bg-stone-50 px-3 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold tabular-nums">{euro(montant)}</p>
    </div>
  );
}
