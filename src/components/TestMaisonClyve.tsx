import { useMemo } from "react";
import AuditEnergetiqueModule from "./AuditEnergetiqueModule";
import ClyveTestBanner from "./ClyveTestBanner";
import {
  clyveAuditData,
  clyveDocuments,
  clyveProjectData,
  clyveScenarios,
} from "../data/clyveAuditModuleProps";
import { CLYVE_FOYER_FICTIF } from "../data/clyveFoyer";
import { useClyveTestJeu } from "../hooks/useClyveTestJeu";

export default function TestMaisonClyve() {
  const { jeu, setJeu, foyer, controleMoteur } = useClyveTestJeu();

  const projectData = useMemo(() => {
    if (jeu === "fictif") {
      return {
        ...clyveProjectData,
        titre: "Parcours test — Maison Clyve (jeu fictif foyer)",
        headerKicker: "Test local — jeu fictif — ne pas publier",
        foyer: CLYVE_FOYER_FICTIF,
      };
    }
    return { ...clyveProjectData, foyer };
  }, [jeu, foyer]);

  const auditData = useMemo(() => {
    if (jeu === "fictif") {
      return {
        ...clyveAuditData,
        alertesAides: undefined,
        statutGlobal: {
          statut: "À VÉRIFIER" as const,
          label: "Jeu fictif foyer renseigné :",
          texte:
            "— RFR / occupants / RP / DPE sont des hypothèses de test. Le moteur doit produire une estimation versionnée (CALCUL_CONTROLE), pas un accord d’aides.",
        },
      };
    }
    return clyveAuditData;
  }, [jeu]);

  return (
    <div>
      <ClyveTestBanner jeu={jeu} onChange={setJeu} controleMoteur={controleMoteur} />
      <AuditEnergetiqueModule
        projectData={projectData}
        auditData={auditData}
        documentsList={clyveDocuments}
        scenarios={clyveScenarios}
      />
    </div>
  );
}
