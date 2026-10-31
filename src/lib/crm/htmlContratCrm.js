/**
 * Point d’entrée CRM : génère le contrat prestige pour n’importe quel dossier.
 */

import { construireHtmlContratContractantGeneral } from "./contratContractantGeneralHtml.js";
import {
  estDossierBrunelMaconnerieOfficiel,
  estDossierBrunelOfficiel,
  estDossierCloisonSdbOfficiel,
  estDossierDamienPv100kwcOfficiel,
  estDossierGesnouinOfficiel,
  estDossierMassonOfficiel,
  estDossierCoutyEscalierOfficiel,
  estDossierFarissOfficiel,
  estDossierGilbertasOfficiel,
  estDossierMassardierOfficiel,
  estDossierPack3en1MarseilleOfficiel,
  estDossierPereiraOfficiel,
  estDossierZoulouParisOfficiel,
  payloadContratBrunelMaconnerieOfficiel,
  payloadContratBrunelMarche2026,
  payloadContratBrunelSelonOffre,
  payloadContratCloisonSdbOfficiel,
  payloadContratDamienPv100kwcOfficiel,
  payloadContratDepuisEdition,
  payloadContratGesnouinOfficiel,
  payloadContratCoutyEscalierOfficiel,
  payloadContratFarissOfficiel,
  payloadContratGilbertasOfficiel,
  payloadContratMassardierOfficiel,
  payloadContratPack3en1MarseilleOfficiel,
  payloadContratPereiraOfficiel,
  payloadContratZoulouParisOfficiel,
} from "./payloadContratCrm.js";
import { OFFRE_AUTONOMIE } from "./brunelOffresV5.js";
import { OFFRE_BRUNEL_OPTION_SANS_BAIE } from "./brunelMarcheOfficiel2026.js";
import {
  NOM_FICHIER_CONTRAT_CLYVE,
  NOM_FICHIER_DEVIS_P4_CLYVE,
  estDossierClyveLaGenete,
  payloadContratClyveLaGenete,
  payloadDevisPrintempsClyveLaGenete,
} from "./clyveLaGeneteContrat.js";
import { NOM_FICHIER_CONTRAT_CLOISON_SDB } from "./cloisonSdbOfficiel.js";
import { CHEMIN_CONTRAT_GILBERTAS, NOM_FICHIER_CONTRAT_GILBERTAS } from "./gilbertasClermontOfficiel.js";
import { CHEMIN_CONTRAT_MASSARDIER, NOM_FICHIER_CONTRAT_MASSARDIER } from "./massardierLeadOfficiel.js";
import {
  CHEMIN_CONTRAT_DAMIEN_PV_100KWC,
  NOM_FICHIER_CONTRAT_DAMIEN_PV_100KWC,
} from "./damienPv100kwcOfficiel.js";
import {
  CHEMIN_DEVIS_GESNOUIN_PDF,
  NOM_FICHIER_CONTRAT_GESNOUIN,
} from "./gesnouinBatterieOfficiel.js";
import { NOM_FICHIER_DEVIS_COUTY } from "./coutyEscalierOfficiel.js";
import { NOM_FICHIER_DEVIS_FARISS } from "./farissLaRicamarieOfficiel.js";
import {
  CHEMIN_DEVIS_OUSSARA,
  NOM_FICHIER_DEVIS_OUSSARA,
  OUSSARA_DOSSIER_ID,
  htmlDevisOussara,
} from "./oussaraColombierOfficiel.js";
import {
  CHEMIN_DEVIS_OUSSARA_COMBLES,
  NOM_FICHIER_DEVIS_OUSSARA_COMBLES,
  OUSSARA_COMBLES_DOSSIER_ID,
  htmlDevisOussaraCombles,
} from "./oussaraComblesOfficiel.js";
import { CHEMIN_DEVIS_MASSON, NOM_FICHIER_DEVIS_MASSON, htmlDevisMassonClient } from "./massonToulonOfficiel.js";
import {
  CHEMIN_CONTRAT_PACK3EN1_MARSEILLE,
  NOM_FICHIER_CONTRAT_PACK3EN1_MARSEILLE,
} from "./pack3en1MarseilleOfficiel.js";
import {
  CHEMIN_CONTRAT_ZOULOU_PARIS,
  NOM_FICHIER_CONTRAT_ZOULOU_PARIS,
} from "./zoulouParisOfficiel.js";
import { CHEMIN_DEVIS_BRUNEL_FINAL } from "./brunelDevisV3Officiel.js";
import { CHEMIN_DEVIS_PEREIRA_NERVIEUX } from "./pereiraNervieuxOfficiel.js";
import {
  CHEMIN_CONTRAT_BRUNEL_MACONNERIE,
  NOM_FICHIER_CONTRAT_BRUNEL_MACONNERIE,
} from "./brunelMaconnerieOfficiel.js";

export const CHEMIN_CONTRAT_PV_100KWC_ARDECHE = "/CONTRAT_PHOTOVOLTAIQUE_100KWC_ARDECHE_2026.html";

export function htmlContratPourDossier(edition, dossier = {}) {
  const id = dossier?.id;
  if (estDossierClyveLaGenete(id)) {
    if (edition?.devisPrintemps) {
      return construireHtmlContratContractantGeneral(payloadDevisPrintempsClyveLaGenete());
    }
    return construireHtmlContratContractantGeneral(payloadContratClyveLaGenete());
  }
  if (estDossierPereiraOfficiel(id)) {
    return construireHtmlContratContractantGeneral(payloadContratPereiraOfficiel());
  }
  if (estDossierBrunelMaconnerieOfficiel(id)) {
    return construireHtmlContratContractantGeneral(payloadContratBrunelMaconnerieOfficiel());
  }
  if (estDossierBrunelOfficiel(id)) {
    if (edition?.offreActive === OFFRE_AUTONOMIE) {
      return construireHtmlContratContractantGeneral(payloadContratBrunelSelonOffre(edition));
    }
    return construireHtmlContratContractantGeneral(
      payloadContratBrunelMarche2026(
        edition?.offreActive === OFFRE_BRUNEL_OPTION_SANS_BAIE ? OFFRE_BRUNEL_OPTION_SANS_BAIE : undefined,
      ),
    );
  }
  if (estDossierCloisonSdbOfficiel(id)) {
    return construireHtmlContratContractantGeneral(payloadContratCloisonSdbOfficiel());
  }
  if (estDossierGilbertasOfficiel(id)) {
    return construireHtmlContratContractantGeneral(payloadContratGilbertasOfficiel());
  }
  if (estDossierMassardierOfficiel(id)) {
    return construireHtmlContratContractantGeneral(payloadContratMassardierOfficiel());
  }
  if (estDossierDamienPv100kwcOfficiel(id)) {
    return construireHtmlContratContractantGeneral(payloadContratDamienPv100kwcOfficiel());
  }
  if (estDossierGesnouinOfficiel(id)) {
    return construireHtmlContratContractantGeneral(payloadContratGesnouinOfficiel());
  }
  if (estDossierMassonOfficiel(id)) {
    return htmlDevisMassonClient();
  }
  if (estDossierCoutyEscalierOfficiel(id)) {
    return construireHtmlContratContractantGeneral(payloadContratCoutyEscalierOfficiel());
  }
  if (estDossierFarissOfficiel(id)) {
    return construireHtmlContratContractantGeneral(payloadContratFarissOfficiel());
  }
  if (id === OUSSARA_DOSSIER_ID) {
    return htmlDevisOussara();
  }
  if (id === OUSSARA_COMBLES_DOSSIER_ID) {
    return htmlDevisOussaraCombles();
  }
  if (estDossierPack3en1MarseilleOfficiel(id)) {
    return construireHtmlContratContractantGeneral(payloadContratPack3en1MarseilleOfficiel());
  }
  if (estDossierZoulouParisOfficiel(id)) {
    return construireHtmlContratContractantGeneral(payloadContratZoulouParisOfficiel());
  }
  return construireHtmlContratContractantGeneral(payloadContratDepuisEdition(edition, dossier));
}

function blobVersDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function embarquerImagesHtmlContrat(html) {
  const source = String(html || "");
  if (typeof fetch !== "function") return source;
  const origine =
    typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";
  const re = /src="((?:https?:\/\/[^"]+)|(?:\/[^"]+\.(?:jpg|jpeg|png|webp|svg)))"/g;
  const uniques = [...new Set([...source.matchAll(re)].map((m) => m[1]))].filter(
    (src) => src && !src.startsWith("data:"),
  );
  let out = source;
  for (const src of uniques) {
    try {
      const url = src.startsWith("http") ? src : `${origine}${src}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const blob = await res.blob();
      const dataUrl = await blobVersDataUrl(blob);
      if (dataUrl.startsWith("data:")) {
        out = out.split(`src="${src}"`).join(`src="${dataUrl}"`);
      }
    } catch {
      /* conserve l’URL absolue ou relative */
    }
  }
  return out;
}

export async function htmlContratPourDossierAvecImagesEmbarquees(edition, dossier = {}) {
  return embarquerImagesHtmlContrat(htmlContratPourDossier(edition, dossier));
}

/** Chemin public du HTML signable (pour Ouvrir HTML / impression PDF). */
export function cheminContratPublic(dossierId, edition = {}) {
  if (estDossierPereiraOfficiel(dossierId)) return CHEMIN_DEVIS_PEREIRA_NERVIEUX;
  if (estDossierBrunelMaconnerieOfficiel(dossierId)) return CHEMIN_CONTRAT_BRUNEL_MACONNERIE;
  if (estDossierBrunelOfficiel(dossierId)) {
    if (edition?.offreActive === OFFRE_AUTONOMIE) {
      return "/DEVIS_BRUNEL_Indivision_COUBLE_2026_AUTONOMIE.html";
    }
    if (edition?.offreActive === OFFRE_BRUNEL_OPTION_SANS_BAIE) {
      return "/DEVIS_BRUNEL_Indivision_COUBLE_2026_OPTION2.html";
    }
    return CHEMIN_DEVIS_BRUNEL_FINAL;
  }
  if (estDossierCloisonSdbOfficiel(dossierId)) return `/${NOM_FICHIER_CONTRAT_CLOISON_SDB}`;
  if (estDossierGilbertasOfficiel(dossierId)) return CHEMIN_CONTRAT_GILBERTAS;
  if (estDossierMassardierOfficiel(dossierId)) return CHEMIN_CONTRAT_MASSARDIER;
  if (estDossierDamienPv100kwcOfficiel(dossierId)) return CHEMIN_CONTRAT_PV_100KWC_ARDECHE;
  if (estDossierGesnouinOfficiel(dossierId)) return CHEMIN_DEVIS_GESNOUIN_PDF;
  if (estDossierMassonOfficiel(dossierId)) return CHEMIN_DEVIS_MASSON;
  if (estDossierCoutyEscalierOfficiel(dossierId)) return `/${NOM_FICHIER_DEVIS_COUTY}`;
  if (estDossierFarissOfficiel(dossierId)) return `/${NOM_FICHIER_DEVIS_FARISS}`;
  if (dossierId === OUSSARA_DOSSIER_ID) return CHEMIN_DEVIS_OUSSARA;
  if (dossierId === OUSSARA_COMBLES_DOSSIER_ID) return CHEMIN_DEVIS_OUSSARA_COMBLES;
  if (estDossierPack3en1MarseilleOfficiel(dossierId)) return CHEMIN_CONTRAT_PACK3EN1_MARSEILLE;
  if (estDossierZoulouParisOfficiel(dossierId)) return CHEMIN_CONTRAT_ZOULOU_PARIS;
  return null;
}

export function nomFichierContrat(dossier = {}, edition = {}) {
  if (estDossierClyveLaGenete(dossier.id)) {
    return edition?.devisPrintemps ? NOM_FICHIER_DEVIS_P4_CLYVE : NOM_FICHIER_CONTRAT_CLYVE;
  }
  if (estDossierPereiraOfficiel(dossier.id)) return "DEVIS_PEREIRA_NERVIEUX_2026_FINAL.html";
  if (estDossierBrunelMaconnerieOfficiel(dossier.id)) return NOM_FICHIER_CONTRAT_BRUNEL_MACONNERIE;
  if (estDossierBrunelOfficiel(dossier.id)) {
    if (edition?.offreActive === OFFRE_AUTONOMIE) {
      return "DEVIS_BRUNEL_Indivision_COUBLE_2026_AUTONOMIE.html";
    }
    if (edition?.offreActive === OFFRE_BRUNEL_OPTION_SANS_BAIE) {
      return "DEVIS_BRUNEL_Indivision_COUBLE_2026_OPTION2.html";
    }
    return "DEVIS_BRUNEL_Indivision_COUBLE_2026_FINAL.html";
  }
  if (estDossierCloisonSdbOfficiel(dossier.id)) return NOM_FICHIER_CONTRAT_CLOISON_SDB;
  if (estDossierGilbertasOfficiel(dossier.id)) return NOM_FICHIER_CONTRAT_GILBERTAS;
  if (estDossierMassardierOfficiel(dossier.id)) return NOM_FICHIER_CONTRAT_MASSARDIER;
  if (estDossierDamienPv100kwcOfficiel(dossier.id)) return "CONTRAT_PHOTOVOLTAIQUE_100KWC_ARDECHE_2026.html";
  if (estDossierGesnouinOfficiel(dossier.id)) return NOM_FICHIER_CONTRAT_GESNOUIN;
  if (estDossierMassonOfficiel(dossier.id)) return NOM_FICHIER_DEVIS_MASSON;
  if (estDossierCoutyEscalierOfficiel(dossier.id)) return NOM_FICHIER_DEVIS_COUTY;
  if (estDossierFarissOfficiel(dossier.id)) return NOM_FICHIER_DEVIS_FARISS;
  if (dossier.id === OUSSARA_DOSSIER_ID) return NOM_FICHIER_DEVIS_OUSSARA;
  if (dossier.id === OUSSARA_COMBLES_DOSSIER_ID) return NOM_FICHIER_DEVIS_OUSSARA_COMBLES;
  if (estDossierPack3en1MarseilleOfficiel(dossier.id)) return NOM_FICHIER_CONTRAT_PACK3EN1_MARSEILLE;
  if (estDossierZoulouParisOfficiel(dossier.id)) return NOM_FICHIER_CONTRAT_ZOULOU_PARIS;
  const numero = edition?.devisOfficiel?.numero || dossier?.nom || "CLIENT";
  return `${String(numero).replace(/[^\w.-]+/g, "_")}.html`;
}
