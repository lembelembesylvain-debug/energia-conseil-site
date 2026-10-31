/**
 * Contrat HTML signable — DEVIS_PEREIRA_NERVIEUX_2026_FINAL.html
 * Moteur : Template Master Contractant Général (charte Pereira).
 */

import { PEREIRA_NERVIEUX_NUMERO, FICHIER_DEVIS_PEREIRA_NERVIEUX } from "./pereiraNervieuxOfficiel.js";
import {
  LOGO_ENERGIA_CONTRAT,
  cssChartePremiumEnergia as cssMaster,
  construireHtmlContratContractantGeneral,
} from "./contratContractantGeneralHtml.js";
import {
  htmlAnnexePhotosPereira,
  payloadContratPereiraOfficiel,
} from "./payloadContratCrm.js";

export { LOGO_ENERGIA_CONTRAT, htmlAnnexePhotosPereira };

export function cssChartePremiumEnergia() {
  return cssMaster(PEREIRA_NERVIEUX_NUMERO);
}

export function construireHtmlDevisPereiraNervieux() {
  return construireHtmlContratContractantGeneral(payloadContratPereiraOfficiel());
}

export { FICHIER_DEVIS_PEREIRA_NERVIEUX };
