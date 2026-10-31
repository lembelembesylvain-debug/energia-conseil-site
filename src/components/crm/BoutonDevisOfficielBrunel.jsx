import ContratContractantGeneralMaster from "./ContratContractantGeneralMaster";
import { BRUNEL_DOSSIER_ID } from "../../lib/crm/brunelWorkingBase";

export default function BoutonDevisOfficielBrunel({ dossierId, dossier, edition, compact = false }) {
  if (dossierId && dossierId !== BRUNEL_DOSSIER_ID) return null;
  return (
    <ContratContractantGeneralMaster
      dossier={dossier || { id: dossierId }}
      edition={edition}
      compact={compact}
    />
  );
}
