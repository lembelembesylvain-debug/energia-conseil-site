import ContratContractantGeneralMaster from "./ContratContractantGeneralMaster";
import { PEREIRA_NERVIEUX_DOSSIER_ID } from "../../lib/crm/pereiraNervieuxOfficiel";

export default function BoutonDevisOfficielPereira({ dossierId, dossier, edition, compact = false }) {
  if (dossierId && dossierId !== PEREIRA_NERVIEUX_DOSSIER_ID) return null;
  return (
    <ContratContractantGeneralMaster
      dossier={dossier || { id: dossierId }}
      edition={edition}
      compact={compact}
    />
  );
}
