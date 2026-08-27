import {
  CONTROLES,
  DEVIS,
  DISCLAIMER,
  DOCUMENTS,
  DONNEES_LOGEMENT,
  MANQUANT,
  PIECES_PLAN,
} from "./testMaisonClyve";
import {
  DISCLAIMER_SCENARIOS,
  MENTION_AIDES,
  MENTION_DPE,
  MENTION_MADINIER,
  MENTION_TOITURE_FAIVRE,
  SCENARIOS_TRAVAUX,
} from "./scenariosMaisonClyve";
import type { Audit, Document, Project, Scenario } from "../types/audit";
import { CLYVE_AID_ALERTS, CLYVE_FOYER_CORPUS } from "./clyveFoyer";

export const clyveDocuments: Document[] = DOCUMENTS.map((doc, index) => ({
  id: `clyve-doc-${index + 1}`,
  nom: doc.nom,
  type: doc.type,
  extraits: doc.extraits,
  confiance: doc.confiance,
  origine: doc.origine,
  statut: doc.statut,
  imageSrc: doc.imageSrc,
  kind: doc.origine === "devis" ? "devis" : doc.origine === "plan" ? "plan" : "photo",
  photoAvantSrc: doc.imageSrc,
}));

export const clyveScenarios: Scenario[] = SCENARIOS_TRAVAUX.map((scenario) => ({
  ...scenario,
}));

export const clyveProjectData: Project = {
  titre: "Parcours test — Maison Clyve",
  sousTitre:
    "Documents → Données bâtiment → Contrôles → Scénarios → Pré-rapport. Corpus unique : photos, plan et trois devis joints. Aucune donnée absente n’a été complétée. Aucun audit réglementaire.",
  documentTitle: "TEST LOCAL — Maison Clyve | ENERGIA CONSEIL IA®",
  clientNom: "Mme ANDRIOT Clyve",
  adresse: "654 route départementale 975, 71290 LA GENÊTE",
  disclaimer: DISCLAIMER,
  missingLabel: MANQUANT,
  headerKicker: "Test local — ne pas publier",
  scenariosIntro:
    "Trois options progressives, même façade. Montants Faivre et MTL au centime. PAC, VMC, solaire, DPE et aides : hypothèses, pas des extraits du dossier.",
  footer:
    "ENERGIA CONSEIL IA® — 16 rue Cuvier, 69006 Lyon — contact@energia-conseil-ia.com — page locale /test-maison-clyve — hors production.",
  presentationHref: "/test-maison-clyve/presentation",
  rapportHref: "/test-maison-clyve/rapport-complet",
  piecesPlan: PIECES_PLAN,
  piecesPlanSommeDetail: "153,00 m² — EXTRAIT plan",
  donneesLogement: DONNEES_LOGEMENT,
  devis: DEVIS,
  foyer: CLYVE_FOYER_CORPUS,
};

export const clyveAuditData: Audit = {
  controles: CONTROLES,
  statutLegendes: [
    { statut: "EXTRAIT", texte: "Lu tel quel sur photo, plan ou devis." },
    { statut: "À VÉRIFIER", texte: "Lu mais incomplet, ambigu ou à recouper sur site." },
    { statut: "INCOHÉRENCE", texte: "Deux documents du corpus se contredisent." },
    { statut: "DONNÉE MANQUANTE", texte: "Absent du corpus — non inventé." },
    {
      statut: "PRÊT POUR VALIDATION HUMAINE",
      texte: "Extraction chiffrée cohérente en interne ; devis échus, pas un audit.",
    },
  ],
  statutGlobal: {
    statut: "À VÉRIFIER",
    label: "Statut global du dossier test :",
    texte:
      "— extraits exploitables, devis échus, surfaces toiture contradictoires, SHAB totale absente. Pas PRÊT POUR VALIDATION HUMAINE au niveau du dossier entier.",
  },
  mentions: {
    documentsIntro:
      "8 visuels joints + 3 devis PDF. Confiance = lisibilité de l’extraction, pas une validation technique de chantier.",
    logementIntro: `Chaque ligne porte une origine. Les totaux non écrits sur le plan restent « ${MANQUANT} ».`,
    devisIntro: "Montants repris exactement. Les deux devis toiture ne sont pas additionnés.",
    dpe: MENTION_DPE,
    aides: MENTION_AIDES,
    toiture: MENTION_TOITURE_FAIVRE,
    devisNonCumulable: MENTION_MADINIER,
    scenarios: DISCLAIMER_SCENARIOS,
  },
  alertesAides: CLYVE_AID_ALERTS,
  preRapport: [
    "Dossier test « Maison Clyve » constitué de 8 visuels (7 photos + 1 plan) et 3 devis au nom de Mme ANDRIOT Clyve, 654 route départementale 975, 71290 (graphie LA GENETE / LA GENÊTE).",
    `Le plan permet d’extraire 14 pièces pour une somme de **153,00 m²**. La surface habitable totale n’est pas écrite. Le couloir et des salles d’eau communes restent ${MANQUANT}`,
    "Les photos montrent une longère à toiture dégradée, des murs à enduit manquant, des menuiseries hétérogènes, des travaux de dalle / plancher en cours. Le chauffage se limite à des souches de cheminée visibles. La ventilation n’est pas documentée.",
    "Toiture : deux offres non cumulables — SARL FAIVRE 15/03/2022, **48 879,20 € HT / 53 767,12 € TTC** (360 m² de couverture) ; Madinier entreprise 25/10/2021, **57 850,00 €** sans ventilation HT/TTC (450 m²). Surfaces 360 / 450 / 505 m² : incohérence.",
    "Maçonnerie : MTL MACONNERIE 14/04/2022, **25 239,00 € HT / 27 762,90 € TTC**, cinq dalles. Lien possible avec la dalle photographiée, non démontré.",
    "Les trois devis sont échus à la date du test. Des scénarios de travail A / B / C sont proposés dans l’onglet Scénarios : totaux Faivre et MTL repris au centime ; PAC, VMC, solaire, DPE restent des hypothèses. **Aides : NON CALCULABLES** (RFR et composition du foyer manquants). **Reste à charge : NON CALCULABLE.** Validation MAR obligatoire. L’offre Madinier n’est pas cumulée avec Faivre.",
    "Suite utile : visite, métrés de toiture et de SHAB, actualisation des devis, documents manquants listés en section 2. Rien de ce pré-rapport ne constitue un audit, un DPE, un devis ENERGIA ni un engagement d’aides.",
  ],
};
