/**
 * Contrat HTML signable — DEVIS_BRUNEL_Indivision_COUBLE_2026_FINAL.html
 * Moteur : Template Master Contractant Général (charte Pereira = standard officiel).
 */

import { FICHIER_DEVIS_BRUNEL_FINAL } from "./brunelDevisV3Officiel.js";
import { construireHtmlContratContractantGeneral } from "./contratContractantGeneralHtml.js";
import { CONTACTS_BRUNEL_FINAL, payloadContratBrunelMarche2026 } from "./payloadContratCrm.js";

export { CONTACTS_BRUNEL_FINAL };

export function genererHtmlDevisBrunelFinal() {
  return construireHtmlContratContractantGeneral(payloadContratBrunelMarche2026());
}

export { FICHIER_DEVIS_BRUNEL_FINAL };
