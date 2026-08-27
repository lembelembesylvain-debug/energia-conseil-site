import { useEffect, useMemo, useState } from "react";
import {
  AVERTISSEMENT_TVA,
  SCENARIOS_AMPLEUR,
  TAUX_MARGE,
  TAUX_TVA,
  aidesInitiales,
  appliquerParametresAuxLignes,
  appliquerScenario,
  calculerChiffrage,
  creerDeplacementsInitiaux,
  creerGrilleInitiale,
  formatPct,
  normaliserDeplacements,
  normaliserParametresChiffrage,
  parametresParDefaut,
  type AideEstimative,
  type ComplexiteChantier,
  type DeplacementsSaisie,
  type NiveauScenario,
  type ParametresChiffrage,
  type PosteId,
  type PosteSaisie,
  type TauxTva,
} from "../../lib/chiffrage";
import AidesChiffragePanel from "./AidesChiffragePanel";
import DeplacementsPanel from "./DeplacementsPanel";
import DevisClientPanel from "./DevisClientChiffrage";
import GrillePostesTable from "./GrillePostesTable";
import RapportMentions from "./RapportMentions";
import RecapChiffrage from "./RecapChiffrage";
import RecapDeplacements from "./RecapDeplacements";

const STORAGE_KEY = "energia-chiffrage-ampleur-2026";

type EtatPersiste = {
  niveau: NiveauScenario;
  parametres: ParametresChiffrage;
  lignes: PosteSaisie[];
  aides: AideEstimative[];
  deplacements: DeplacementsSaisie;
};

function chargerEtat(): EtatPersiste {
  const params = parametresParDefaut("standard");
  const fallback: EtatPersiste = {
    niveau: "performance",
    parametres: params,
    lignes: creerGrilleInitiale("performance"),
    aides: aidesInitiales(),
    deplacements: creerDeplacementsInitiaux(params),
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<EtatPersiste>;
    if (!parsed?.lignes?.length || !parsed.parametres) return fallback;
    const parametres = normaliserParametresChiffrage(parsed.parametres);
    return {
      niveau: parsed.niveau ?? "performance",
      parametres,
      lignes: parsed.lignes,
      aides: parsed.aides ?? aidesInitiales(),
      deplacements: normaliserDeplacements(parsed.deplacements, parametres),
    };
  } catch {
    return fallback;
  }
}

export default function ChiffrageAmpleurModule() {
  const [niveau, setNiveau] = useState<NiveauScenario>("performance");
  const [parametres, setParametres] = useState<ParametresChiffrage>(() =>
    parametresParDefaut("standard"),
  );
  const [lignes, setLignes] = useState<PosteSaisie[]>(() =>
    creerGrilleInitiale("performance"),
  );
  const [aides, setAides] = useState<AideEstimative[]>(() => aidesInitiales());
  const [deplacements, setDeplacements] = useState<DeplacementsSaisie>(() =>
    creerDeplacementsInitiaux(parametresParDefaut("standard")),
  );
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const etat = chargerEtat();
    setNiveau(etat.niveau);
    setParametres(etat.parametres);
    setLignes(etat.lignes);
    setAides(etat.aides);
    setDeplacements(etat.deplacements);
    setPret(true);
  }, []);

  useEffect(() => {
    if (!pret) return;
    const etat: EtatPersiste = { niveau, parametres, lignes, aides, deplacements };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(etat));
  }, [pret, niveau, parametres, lignes, aides, deplacements]);

  const resultat = useMemo(
    () => calculerChiffrage(lignes, parametres, aides, deplacements),
    [lignes, parametres, aides, deplacements],
  );

  function changerComplexite(complexite: ComplexiteChantier) {
    setParametres((actuel) => {
      const suivants = {
        ...parametresParDefaut(complexite),
        libelleProjet: actuel.libelleProjet,
        fraisStructureHt: actuel.fraisStructureHt,
        tauxTvaDefaut: actuel.tauxTvaDefaut,
        adresseChantier: actuel.adresseChantier,
        adresseDepartEnergia: actuel.adresseDepartEnergia,
        deplacement: actuel.deplacement,
      };
      setLignes((lignesActuelles) => appliquerParametresAuxLignes(lignesActuelles, suivants));
      return suivants;
    });
  }

  function changerScenario(suivant: NiveauScenario) {
    setNiveau(suivant);
    setLignes((actuel) => appliquerScenario(actuel, suivant));
  }

  function patchParametres(patch: Partial<ParametresChiffrage>) {
    setParametres((actuel) => {
      const suivants = { ...actuel, ...patch };
      if (
        patch.tauxAleas != null ||
        patch.tauxPilotage != null ||
        patch.tauxMarge != null ||
        patch.tauxTvaDefaut != null
      ) {
        setLignes((lignesActuelles) => appliquerParametresAuxLignes(lignesActuelles, suivants));
      }
      return suivants;
    });
  }

  function reinitialiser() {
    const params = parametresParDefaut("standard");
    setNiveau("performance");
    setParametres(params);
    setLignes(creerGrilleInitiale("performance", params));
    setAides(aidesInitiales());
    setDeplacements(creerDeplacementsInitiaux(params));
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-800 bg-[#1a3c5e] text-white">
        <div className="mx-auto flex max-w-[96rem] flex-wrap items-start justify-between gap-4 px-4 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-200">
              ENERGIA CONSEIL IA® — 2026
            </p>
            <h1 className="mt-1 text-2xl font-bold">
              Grille tarifaire — rénovation d’ampleur
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-200">
              Calculateur interne : tarif entrant, déplacements artisans et ENERGIA, aléas,
              pilotage, frais de structure, marge commerciale, HT, TVA et TTC. Aucun tarif
              ni kilométrage n’est inventé.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-white/30 px-3 py-2 text-sm hover:bg-white/10"
            >
              Imprimer le rapport
            </button>
            <button
              type="button"
              onClick={reinitialiser}
              className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#1a3c5e]"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[96rem] space-y-6 px-4 py-6">
        <section className="grid gap-4 lg:grid-cols-3">
          {SCENARIOS_AMPLEUR.map((scenario) => {
            const actif = niveau === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => changerScenario(scenario.id)}
                className={`rounded-xl border p-4 text-left shadow-sm transition ${
                  actif
                    ? "border-transparent ring-2 ring-offset-2"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
                style={
                  actif
                    ? { backgroundColor: `${scenario.couleur}14`, outlineColor: scenario.couleur }
                    : undefined
                }
              >
                <p className="text-sm font-semibold" style={{ color: scenario.couleur }}>
                  {scenario.icone} {scenario.nom}
                  {scenario.recommande ? " — recommandé" : ""}
                </p>
                <p className="mt-2 text-sm text-slate-700">{scenario.synthese}</p>
                <p className="mt-3 text-xs text-slate-500">
                  {scenario.postesInclus.length} postes sélectionnés — aucun budget fixe
                  tant qu’un devis ou tarif vérifié n’est pas saisi.
                </p>
              </button>
            );
          })}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1a3c5e]">Paramètres du chiffrage</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm">
              Intitulé du projet
              <input
                type="text"
                value={parametres.libelleProjet}
                onChange={(event) => patchParametres({ libelleProjet: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2"
              />
            </label>
            <label className="text-sm">
              Complexité du chantier
              <select
                value={parametres.complexite}
                onChange={(event) =>
                  changerComplexite(event.target.value as ComplexiteChantier)
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2"
              >
                <option value="standard">Standard — aléas 4 %, pilotage 7 %, marge 10 %</option>
                <option value="complexe">Complexe — aléas 5 %, pilotage 8 %, marge 12 %</option>
              </select>
            </label>
            <label className="text-sm">
              TVA par défaut
              <select
                value={parametres.tauxTvaDefaut}
                onChange={(event) =>
                  patchParametres({ tauxTvaDefaut: Number(event.target.value) as TauxTva })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2"
              >
                {TAUX_TVA.map((taux) => (
                  <option key={taux.value} value={taux.value}>
                    {taux.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Frais de structure HT (€)
              <input
                type="number"
                min={0}
                step={1}
                value={parametres.fraisStructureHt || ""}
                placeholder="0 — à saisir si identifiés"
                onChange={(event) =>
                  patchParametres({
                    fraisStructureHt:
                      event.target.value === "" ? 0 : Number(event.target.value),
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2"
              />
            </label>
            <label className="text-sm">
              Aléas (%)
              <input
                type="number"
                min={0}
                step={0.1}
                value={Math.round(parametres.tauxAleas * 10000) / 100}
                onChange={(event) =>
                  patchParametres({ tauxAleas: Number(event.target.value) / 100 })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2"
              />
            </label>
            <label className="text-sm">
              Pilotage (%)
              <input
                type="number"
                min={0}
                step={0.1}
                value={Math.round(parametres.tauxPilotage * 10000) / 100}
                onChange={(event) =>
                  patchParametres({ tauxPilotage: Number(event.target.value) / 100 })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2"
              />
            </label>
            <label className="text-sm">
              Marge cible (% du prix de vente HT)
              <input
                type="number"
                min={0}
                max={99}
                step={0.5}
                value={Math.round(parametres.tauxMarge * 10000) / 100}
                onChange={(event) =>
                  patchParametres({ tauxMarge: Number(event.target.value) / 100 })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-2"
              />
            </label>
            <p className="text-xs text-slate-600 md:col-span-2 xl:col-span-1">
              Marge standard minimale {formatPct(TAUX_MARGE.standardMinimale)}. Chantier
              complexe recommandé {formatPct(TAUX_MARGE.complexeRecommandeeMin)} à{" "}
              {formatPct(TAUX_MARGE.complexeRecommandeeMax)}. Formule : prix HT = coût
              interne / (1 − marge).
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#1a3c5e]">
              {parametres.libelleProjet}
            </h2>
            <p className="text-xs text-slate-500">
              Lignes ambrées : poste inclus sans coût entrant. Lignes orange : tarif
              non vérifié depuis plus de 12 mois.
            </p>
          </div>
          <GrillePostesTable
            lignes={resultat.lignes}
            onChange={(id: PosteId, patch) => {
              setLignes((actuel) =>
                actuel.map((ligne) => (ligne.id === id ? { ...ligne, ...patch } : ligne)),
              );
            }}
          />
        </section>

        <DeplacementsPanel
          parametres={parametres}
          deplacements={deplacements}
          onParametres={patchParametres}
          onDeplacements={setDeplacements}
        />

        <RecapChiffrage
          totaux={resultat.totaux}
          avertissements={resultat.avertissements}
          tvaWarning={AVERTISSEMENT_TVA}
        />

        <RecapDeplacements
          deplacements={resultat.deplacements}
          adresseChantier={parametres.adresseChantier}
        />

        <DevisClientPanel
          devis={resultat.devisClient}
          libelleProjet={parametres.libelleProjet}
        />

        <AidesChiffragePanel
          aides={aides}
          recap={resultat.recapAides}
          budgetAffichable={resultat.totaux.budgetAffichable}
          onChange={(id, patch) => {
            setAides((actuel) =>
              actuel.map((aide) => (aide.id === id ? { ...aide, ...patch } : aide)),
            );
          }}
        />

        <RapportMentions />
      </main>
    </div>
  );
}
