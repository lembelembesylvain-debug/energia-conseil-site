/**
 * Orchestrateur d’analyse bornée.
 * Images, PDF scannés et DOCX : pièce jointe, pas d’extraction automatique.
 * Aucun calcul d’aides, aucun prix ferme, aucun PDF généré.
 */

import { extraireChampsDpe } from "./dpe.js";
import { extraireLignesDevisDepuisTexte } from "./devis.js";
import { extraireChampsTabulaires } from "./tabulaire.js";
import { extraireCsvDepuisXlsx } from "./xlsx.js";
import {
  bytesSemblentTexte,
  decoderTexte,
  estCsv,
  estDocx,
  estImage,
  estPdf,
  estXlsx,
  extraireTextePdf,
} from "./texte.js";

export const TYPES_DOCUMENTS = [
  { id: "dpe", label: "DPE", sensible: false },
  { id: "audit", label: "Audit énergétique", sensible: false },
  { id: "devis", label: "Devis", sensible: false },
  { id: "rapport_diagnostics", label: "Rapport de diagnostics", sensible: false },
  { id: "avis_impot", label: "Avis d’impôt", sensible: true },
  { id: "identite", label: "Justificatif d’identité", sensible: true },
  { id: "facture", label: "Facture", sensible: false },
  { id: "photo_logement", label: "Photo du logement", sensible: false },
  { id: "notarial", label: "Document notarial", sensible: true },
  { id: "autre", label: "Autre document", sensible: false },
];

export const FORMATS_ACCEPTES = ".pdf,.docx,.xlsx,.csv,.jpg,.jpeg,.png";

const SANS_EXTRACTION = new Set(["avis_impot", "identite", "notarial", "photo_logement"]);

function typeInfo(typeDocument) {
  return TYPES_DOCUMENTS.find((t) => t.id === typeDocument) || TYPES_DOCUMENTS[TYPES_DOCUMENTS.length - 1];
}

export function analyserDocument({
  nomFichier,
  typeMime = "",
  typeDocument = "autre",
  texte = "",
  binaire = null,
  inflateRaw = null,
}) {
  const info = typeInfo(typeDocument);
  const nom = nomFichier || "document";

  if (estImage(nom, typeMime) || typeDocument === "photo_logement") {
    return {
      statutAnalyse: "piece_jointe_sans_extraction",
      niveauConfiance: "none",
      texte: "",
      champs: [],
      motif: "image_sans_ocr",
      sensible: info.sensible,
    };
  }

  if (estDocx(nom, typeMime)) {
    return {
      statutAnalyse: "piece_jointe_sans_extraction",
      niveauConfiance: "none",
      texte: "",
      champs: [],
      motif: "docx_sans_extraction",
      sensible: info.sensible,
    };
  }

  if (SANS_EXTRACTION.has(typeDocument)) {
    return {
      statutAnalyse: "piece_jointe_sans_extraction",
      niveauConfiance: "none",
      texte: "",
      champs: [],
      motif: "document_sensible_ou_photo",
      sensible: true,
    };
  }

  let contenu = String(texte || "").trim();
  let sourcePage = 1;

  if (!contenu && binaire) {
    if (estPdf(nom, typeMime)) {
      const pdf = extraireTextePdf(binaire);
      if (pdf.pieceJointeSeule || !pdf.ok) {
        return {
          statutAnalyse: "piece_jointe_sans_extraction",
          niveauConfiance: "none",
          texte: "",
          champs: [],
          motif: pdf.motif || "pdf_scanne_sans_texte",
          sensible: info.sensible,
        };
      }
      contenu = pdf.texte;
      sourcePage = pdf.sourcePage || 1;
    } else if (estCsv(nom, typeMime) || bytesSemblentTexte(binaire)) {
      contenu = decoderTexte(binaire);
    } else if (estXlsx(nom, typeMime)) {
      if (typeof inflateRaw !== "function") {
        return {
          statutAnalyse: "piece_jointe_sans_extraction",
          niveauConfiance: "none",
          texte: "",
          champs: [],
          motif: "xlsx_inflate_indisponible",
          sensible: info.sensible,
        };
      }
      const xlsx = extraireCsvDepuisXlsx(binaire, inflateRaw);
      if (!xlsx.ok) {
        return {
          statutAnalyse: "piece_jointe_sans_extraction",
          niveauConfiance: "none",
          texte: "",
          champs: [],
          motif: xlsx.motif,
          sensible: info.sensible,
        };
      }
      contenu = xlsx.csv;
    }
  }

  if (!contenu) {
    return {
      statutAnalyse: "piece_jointe_sans_extraction",
      niveauConfiance: "none",
      texte: "",
      champs: [],
      motif: "aucun_texte_identifiable",
      sensible: info.sensible,
    };
  }

  const premiere = contenu.split(/\r?\n/)[0] || "";
  const tabulaireFichier = estCsv(nom, typeMime) || estXlsx(nom, typeMime);
  const tabulaireTexte = (premiere.match(/;/g) || []).length >= 2 || premiere.includes("\t");
  const tabulaire = tabulaireFichier || tabulaireTexte;
  let champs = [];

  if (tabulaire && (estCsv(nom, typeMime) || estXlsx(nom, typeMime) || typeDocument === "devis")) {
    champs = extraireChampsTabulaires(contenu, nom, sourcePage);
  } else if (typeDocument === "devis" || typeDocument === "facture") {
    champs = extraireLignesDevisDepuisTexte(contenu, nom, sourcePage);
  } else if (typeDocument === "dpe" || typeDocument === "audit" || typeDocument === "rapport_diagnostics") {
    champs = extraireChampsDpe(contenu, nom, sourcePage);
  } else if (tabulaire) {
    champs = extraireChampsTabulaires(contenu, nom, sourcePage);
  } else if (/surface habitable|\bDPE\b|classe énergétique/i.test(contenu)) {
    champs = extraireChampsDpe(contenu, nom, sourcePage);
  } else if (/\bDEV-20\d{2}-/i.test(contenu) || /prix ht|€/i.test(contenu)) {
    champs = extraireLignesDevisDepuisTexte(contenu, nom, sourcePage);
  }

  const niveauConfiance =
    champs.length === 0
      ? "none"
      : champs.every((c) => c.confidence === "high")
        ? "high"
        : champs.some((c) => c.confidence === "high")
          ? "medium"
          : "low";

  return {
    statutAnalyse: champs.length > 0 ? "analyse_terminee" : "texte_extrait_sans_champ",
    niveauConfiance,
    texte: contenu,
    champs,
    motif: champs.length > 0 ? null : "aucune_donnee_clairement_identifiable",
    sensible: info.sensible,
  };
}
