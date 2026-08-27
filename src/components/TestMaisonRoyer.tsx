import AuditEnergetiqueModule from "./AuditEnergetiqueModule";
import {
  royerAuditData,
  royerDocuments,
  royerProjectData,
  royerScenarios,
} from "../data/royerAuditModuleProps";

/** Dossier M. ROYER — audit réglementaire LEO ENERGY. Hors production. Ne pas confondre avec le test Clyve. */
export default function TestMaisonRoyer() {
  return (
    <AuditEnergetiqueModule
      projectData={royerProjectData}
      auditData={royerAuditData}
      documentsList={royerDocuments}
      scenarios={royerScenarios}
    />
  );
}
