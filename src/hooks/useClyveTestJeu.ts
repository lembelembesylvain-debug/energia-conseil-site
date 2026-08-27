import { useCallback, useMemo, useState } from "react";
import { calculateAidEstimate } from "../lib/calculateAidEstimate";
import { CLYVE_FOYER_CORPUS, CLYVE_FOYER_FICTIF } from "../data/clyveFoyer";
import { clyveScenarios } from "../data/clyveAuditModuleProps";
import type { FoyerAides } from "../types/aides";

export type ClyveJeuTest = "corpus" | "fictif";

const STORAGE_KEY = "energia-clyve-jeu-test";

function readJeu(): ClyveJeuTest {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "fictif" ? "fictif" : "corpus";
  } catch {
    return "corpus";
  }
}

export function useClyveTestJeu() {
  const [jeu, setJeuState] = useState<ClyveJeuTest>(readJeu);

  const setJeu = useCallback((next: ClyveJeuTest) => {
    setJeuState(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const foyer: FoyerAides = jeu === "fictif" ? CLYVE_FOYER_FICTIF : CLYVE_FOYER_CORPUS;

  const controleMoteur = useMemo(() => {
    const sample = clyveScenarios[1] ?? clyveScenarios[0];
    const corpus = calculateAidEstimate({
      foyer: CLYVE_FOYER_CORPUS,
      budgetTtc: sample.totalTtc,
      lots: sample.lotsInclus,
    });
    const fictif = calculateAidEstimate({
      foyer: CLYVE_FOYER_FICTIF,
      budgetTtc: sample.totalTtc,
      lots: sample.lotsInclus,
    });
    return {
      corpusOk:
        !corpus.calculable &&
        corpus.profile == null &&
        corpus.totalAides == null &&
        corpus.status === "DONNEES_FISCALES_MANQUANTES",
      fictifOk:
        fictif.calculable &&
        fictif.profile === "jaune" &&
        fictif.totalAides != null &&
        fictif.status === "CALCUL_CONTROLE",
      fictif,
    };
  }, []);

  return { jeu, setJeu, foyer, controleMoteur };
}
