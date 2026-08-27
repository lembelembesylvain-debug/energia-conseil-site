import type { Audit, Document, Project, Scenario, WorkItem } from "../types/audit";
import type { ChampFoyer, FoyerAides } from "../types/aides";
import { AID_RULES_2026 } from "./aidRules2026";

const AUDIT_REF = "A26420094510Q";
const AUDIT_DATE = "09/05/2026";
const MENTION_AUDIT = `Données issues de l’audit réglementaire n° ${AUDIT_REF} du ${AUDIT_DATE}.`;

const ITE_TTC = 26720;
const TOITURE_TTC = 6330;
const MENUISERIES_TTC = 5498;
const PORTE_TTC = 2718;
const PAC_TTC = 4220;
const ECS_TTC = 3693;
const VMC_TTC = 2296;
const ANNEXES_TTC = 13560;
export const ROYER_SCENARIO3_TTC = 65035;

function champ(label: string, value: string, statut: ChampFoyer["statut"], note?: string): ChampFoyer {
  return { label, value, statut, note };
}

const LOTS_SCENARIO_3: WorkItem[] = [
  {
    libelle: "Isolation murs — ITE 14 cm (65 m², R ≥ 4,4)",
    detail:
      "ITE 14 cm sur 65 m² de murs pierre, y compris retours linteaux / tableaux / appuis, finition enduit. R ≥ 4,40 m².K/W.",
    montantTtc: ITE_TTC,
    source: "ESTIMATION TECHNIQUE",
    reference: `${MENTION_AUDIT} — 26 720 € TTC`,
  },
  {
    libelle: "Isolation toiture — sarking laine de bois (78 m², R ≥ 6,25)",
    detail:
      "Sarking : pare-vapeur + double STEICO FLEX F 100 mm (R=2,75 chacune) + pare-pluie STEICO UNIVERSAL DRY 35 mm (R=0,75). R ≥ 6,25 m².K/W. Surface d’isolant 78 m² (le texte d’audit mentionne aussi 60 m² de mise en œuvre — à confirmer en visite).",
    montantTtc: TOITURE_TTC,
    source: "ESTIMATION TECHNIQUE",
    reference: `${MENTION_AUDIT} — 6 330 € TTC`,
  },
  {
    libelle: "Menuiseries — 5 fenêtres PVC + 1 porte-fenêtre (Uw ≤ 1,3)",
    detail: "Remplacement de 5 fenêtres et 1 porte-fenêtre, PVC double vitrage peu émissif, Uw ≤ 1,30 W/m².K, Sw ≥ 0,30. Surface ouvrants 6,4 m².",
    montantTtc: MENUISERIES_TTC,
    source: "ESTIMATION TECHNIQUE",
    reference: `${MENTION_AUDIT} — 5 498 € TTC`,
  },
  {
    libelle: "Porte d’entrée isolante (menuiserie Ud = 1,5)",
    detail: "Remplacement de la porte d’entrée bois vétuste par une porte isolante Ud = 1,50 W/m².K. Surface porte 1,8 m².",
    montantTtc: PORTE_TTC,
    source: "ESTIMATION TECHNIQUE",
    reference: `${MENTION_AUDIT} — 2 718 € TTC`,
  },
  {
    libelle: "PAC air/air (SCOP ≥ 4,0)",
    detail: "Pompe à chaleur air/air SCOP ≥ 4,0 en remplacement des convecteurs électriques. Appoint bois conservé selon l’audit.",
    montantTtc: PAC_TTC,
    source: "ESTIMATION TECHNIQUE",
    reference: `${MENTION_AUDIT} — 4 220 € TTC`,
  },
  {
    libelle: "ECS thermodynamique 200 L (COP ≥ 3,5)",
    detail: "Chauffe-eau thermodynamique 200 L, COP ECS ≥ 3,5 (COP 4,06 cité par l’auditeur). Remplace le ballon électrique 100 L.",
    montantTtc: ECS_TTC,
    source: "ESTIMATION TECHNIQUE",
    reference: `${MENTION_AUDIT} — 3 693 € TTC`,
  },
  {
    libelle: "VMC Hygro B",
    detail: "VMC individuelle hygroréglable type B, extraction et entrées d’air hygroréglables à prévoir dans les menuiseries.",
    montantTtc: VMC_TTC,
    source: "ESTIMATION TECHNIQUE",
    reference: `${MENTION_AUDIT} — 2 296 € TTC`,
  },
  {
    libelle: "Frais annexes et coordination",
    detail:
      "Travaux induits, mises en œuvre, coordination et frais annexes pour atteindre le total scénario 3 de l’audit (65 035 € TTC). Pas un devis artisan nominatif.",
    montantTtc: ANNEXES_TTC,
    source: "ESTIMATION TECHNIQUE",
    reference: `${MENTION_AUDIT} — 13 560 € TTC (ajustement au total 65 035 €)`,
  },
];

/** Profil Jaune supposé (60 %) — RFR non lu sur l’audit, hypothèse de travail 28 000 € / 2 personnes, hors IDF. */
export const ROYER_FOYER: FoyerAides = {
  rfr: 28000,
  rfrYear: 2024,
  householdSize: 2,
  region: "Auvergne-Rhône-Alpes",
  regionCode: "HORS_IDF",
  department: "42 — Loire",
  housingStatus: "Maison individuelle",
  residenceType: "principale",
  occupantType: "proprietaire_occupant",
  constructionYear: null,
  housingAgeLabel: "Avant 1948",
  dpeActuel: "G",
  dpeVise: "B",
  parcoursType: "parcours",
  eligibleWorksLabel: "Parcours Accompagné — saut G → B (5 classes) — scénario 3 audit LEO ENERGY",
  rgeCompany: "Entreprises RGE à sélectionner (LEO ENERGY = auditeur, pas l’entreprise travaux)",
  filingDate: "2026-09-15",
  champs: [
    champ("RFR du foyer", "28 000 € (hypothèse profil Jaune)", "HYPOTHÈSE DE TEST", "Absent de l’audit. Profil Jaune supposé 60 %."),
    champ("Année du RFR", "2024", "HYPOTHÈSE DE TEST"),
    champ("Nombre de personnes dans le foyer", "2", "HYPOTHÈSE DE TEST", "Dossier client existant — à confirmer par avis d’imposition."),
    champ("Région", "Auvergne-Rhône-Alpes", "EXTRAIT", "Déduite du CP 42600 / audit."),
    champ("Département", "42 — Loire", "EXTRAIT"),
    champ("Statut du logement", "Maison individuelle", "EXTRAIT"),
    champ("Résidence principale ou secondaire", "Résidence principale", "À VÉRIFIER"),
    champ("Propriétaire occupant ou bailleur", "Propriétaire occupant", "À VÉRIFIER", "Propriétaire nommé ROYER Maixent sur l’audit."),
    champ("Ancienneté du logement", "Avant 1948 — pierre de taille 60 cm", "EXTRAIT"),
    champ("DPE actuel", "G — 577 kWhEP/m².an", "EXTRAIT", MENTION_AUDIT),
    champ("Gain DPE visé", "G ➔ B — 117 kWhEP/m².an (5 classes)", "EXTRAIT", MENTION_AUDIT),
    champ("Type de parcours d’aide", "MaPrimeRénov’ Parcours Accompagné", "EXTRAIT"),
    champ("Travaux éligibles", "ITE, sarking, menuiseries, porte, PAC, ECS, VMC — hors frais annexes", "À VÉRIFIER"),
    champ("Entreprise RGE associée", "À sélectionner après validation MAR", "DONNÉE MANQUANTE"),
    champ("Date prévue de dépôt du dossier", "15/09/2026", "HYPOTHÈSE DE TEST"),
  ],
};

export const royerDocuments: Document[] = [
  {
    id: "royer-audit-leo",
    nom: `AUDIT — ROYER MAIXENT — ${AUDIT_DATE} — Projet Bâtiment.pdf`,
    type: `Audit réglementaire LEO ENERGY n° ${AUDIT_REF} (visite 17/03/2026, établi ${AUDIT_DATE}, valable jusqu’au 08/05/2031)`,
    extraits: [
      "Auditeur : LIONEL MFEGUE — LEO ENERGY (Vienne) — certif. OPQIBI 24126087.",
      "Maison individuelle, 6 Route de Marcilly, 42600 CHALAIN-D'UZORE, 77,00 m², avant 1948, 2 niveaux.",
      "État initial : DPE G, 577 kWhEP/m².an, 20 kgCO₂/m².an, Ubat 1,756 W/(m².K).",
      "Scénario 3 retenu : 65 035 € TTC, cible 117 kWhEP/m².an, gain −80 %, GES −85 %.",
    ],
    confiance: "élevé",
    origine: "audit",
    statut: "AUDIT RÉGLEMENTAIRE REÇU",
    kind: "devis",
  },
  {
    id: "royer-photo-avant-facades",
    nom: "Photos avant — façades / menuiseries (à charger)",
    type: "Emplacement photo réelle avant travaux",
    extraits: ["Murs pierre de taille 60 cm non isolés.", "Menuiseries bois vétustes (double vitrage ancien + porte-fenêtre simple vitrage)."],
    confiance: "moyen",
    origine: "photo",
    statut: "DONNÉE MANQUANTE",
    kind: "photo",
  },
  {
    id: "royer-photo-apres",
    nom: "Photos après travaux (à charger)",
    type: "Emplacement photo réelle après travaux — distinct d’une projection",
    extraits: ["Aucun après réel au dossier à ce jour."],
    confiance: "faible",
    origine: "photo",
    statut: "DONNÉE MANQUANTE",
    kind: "photo",
  },
];

export const royerScenarios: Scenario[] = [
  {
    id: "3",
    code: "parcours-global",
    titre: "Scénario 3 — Rénovation globale (audit LEO ENERGY)",
    nomCourt: "Parcours global",
    objectif:
      "Traiter l’enveloppe (ITE + sarking + menuiseries) puis les systèmes (PAC air/air, ECS thermodynamique, VMC Hygro B) — ordre isolation avant chauffage.",
    badge: "SCÉNARIO 3 — AUDIT",
    recommande: true,
    dpeAvantHypothese: "G",
    dpeApresHypothese: "B",
    gainDeperditionsHypothese: "−80 %",
    dpeOfficiel: true,
    dpeCaption: `${MENTION_AUDIT} Cible 117 kWhEP/m².an. Réduction CO₂ −85 %.`,
    lotsInclus: LOTS_SCENARIO_3,
    lotsExclus: [
      "Scénario 1 audit (étiquette A / ~72 358 € — non retenu ici)",
      "Scénario 2 par étapes",
      "Photovoltaïque",
    ],
    totalTtc: ROYER_SCENARIO3_TTC,
    transformations: [
      "ITE 14 cm sur 65 m² — pierre de taille conservée, enduit de finition",
      "Sarking laine de bois 78 m² — R ≥ 6,25",
      "5 fenêtres + 1 porte-fenêtre PVC Uw ≤ 1,3 et porte Ud = 1,5",
      "PAC air/air SCOP ≥ 4 et ECS 200 L COP ≥ 3,5",
      "VMC Hygro B — renouvellement d’air maîtrisé",
    ],
    sources: [`Audit réglementaire LEO ENERGY n° ${AUDIT_REF} du ${AUDIT_DATE}`, "Chiffrage scénario 3 : 65 035 € TTC"],
    confiance: "élevé",
    notesTechniques: [
      MENTION_AUDIT,
      "Total lots énergétiques 51 475 € TTC + frais annexes / coordination 13 560 € TTC = 65 035 € TTC.",
      "Surfaces de façades relevées (44,50 + 15,22 + 51,80 + 16,04 m²) > 65 m² d’ITE : la surface isolée sera confirmée en visite.",
      "Sarking : 78 m² d’isolant cités, 60 m² de complexe également mentionnés — incohérence de métré à lever.",
      AID_RULES_2026.disclaimer,
    ],
  },
];

export const royerProjectData: Project = {
  titre: "Audit énergétique — M. Maixent ROYER",
  sousTitre:
    "Maison individuelle, 6 route de Marcilly, 42600 Chalain-d’Uzore. Pierre de taille 60 cm, avant 1948, 77 m². Dossier local — hors production.",
  documentTitle: "TEST LOCAL — M. ROYER | ENERGIA CONSEIL IA®",
  clientNom: "M. Maixent ROYER",
  adresse: "6 route de Marcilly, 42600 Chalain-d’Uzore",
  disclaimer: `${MENTION_AUDIT} Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.`,
  missingLabel: "Non communiqué — à confirmer.",
  headerKicker: "Test local — audit réglementaire reçu — ne pas publier",
  scenariosIntro:
    "Scénario 3 de l’audit LEO ENERGY : rénovation globale 65 035 € TTC. DPE G → B, gain −80 %. Photos avant / après : chargement manuel.",
  footer:
    "ENERGIA CONSEIL IA® — 16 rue Cuvier, 69006 Lyon — contact@energia-conseil-ia.com — page locale /test-maison-royer — hors production.",
  piecesPlan: [
    { nom: "Rez-de-chaussée (séjour + cuisine)", surface: "42,54 m²", surfaceM2: 42.54 },
    { nom: "Étage 1 (2 chambres, SDB, WC)", surface: "36,72 m²", surfaceM2: 36.72 },
    { nom: "Étage 2", surface: "Non aménagé — hors surface habitable", surfaceM2: 0 },
    { nom: "Surface de référence (audit)", surface: "77,00 m² (référence, non additionnée ici)", surfaceM2: 0 },
  ],
  piecesPlanSommeDetail: "RDC 42,54 + étage 36,72 = 79,26 m² cotés — surface de référence audit 77,00 m² (écart à confirmer).",
  donneesLogement: [
    { libelle: "Client", valeur: "M. Maixent ROYER", origine: "audit", statut: "EXTRAIT" },
    { libelle: "Adresse", valeur: "6 Route de Marcilly, 42600 CHALAIN-D'UZORE", origine: "audit", statut: "EXTRAIT" },
    { libelle: "Type de bien", valeur: "Maison individuelle — 2 niveaux habitables, 6 pièces", origine: "audit", statut: "EXTRAIT" },
    {
      libelle: "Année de construction",
      valeur: "Avant 1948 — pierre de taille / moellons 60 cm",
      origine: "audit",
      statut: "EXTRAIT",
    },
    { libelle: "Surface de référence", valeur: "77,00 m²", origine: "audit", statut: "EXTRAIT" },
    { libelle: "DPE initial", valeur: "G — 577 kWhEP/m².an", origine: "audit", statut: "EXTRAIT", note: MENTION_AUDIT },
    { libelle: "DPE cible (scénario 3)", valeur: "B — 117 kWhEP/m².an", origine: "audit", statut: "EXTRAIT" },
    { libelle: "Gain de consommation", valeur: "−80 %", origine: "audit", statut: "EXTRAIT" },
    { libelle: "Réduction CO₂", valeur: "−85 %", origine: "audit", statut: "EXTRAIT" },
    { libelle: "Ubat initial", valeur: "1,756 W/(m².K)", origine: "audit", statut: "EXTRAIT" },
    { libelle: "Altitude / département", valeur: "369 m — Loire (42)", origine: "audit", statut: "EXTRAIT" },
    {
      libelle: "Chauffage actuel",
      valeur: "Convecteurs électriques + poêle à bois (env. 2005) — état moyen",
      origine: "audit",
      statut: "EXTRAIT",
    },
    { libelle: "ECS actuelle", valeur: "Ballon électrique 100 L — état mauvais", origine: "audit", statut: "EXTRAIT" },
    { libelle: "Ventilation actuelle", valeur: "Entrées d’air hautes et basses — non fonctionnelle", origine: "audit", statut: "EXTRAIT" },
    { libelle: "N° audit / auditeur", valeur: `${AUDIT_REF} — LEO ENERGY / LIONEL MFEGUE`, origine: "audit", statut: "AUDIT RÉGLEMENTAIRE REÇU" },
  ],
  devis: [
    {
      fichier: `Audit ${AUDIT_REF} — scénario 3 (chiffrage auditeur, pas un devis artisan)`,
      entreprise: "LEO ENERGY (auditeur) — entreprises RGE travaux à sélectionner",
      poste: "Rénovation globale — scénario 3",
      ht: "Non ventilé HT/TTC sur l’audit (montants TTC)",
      tva: "TVA des travaux selon régime en vigueur à la réalisation",
      ttc: "65 035,00 €",
      date: AUDIT_DATE,
      validite: "Audit valable jusqu’au 08/05/2031 — chiffrage non contractuel",
      nonLisible: ["Numéros RGE des entreprises de travaux", "RFR du foyer", "Ventilation HT / TVA par lot"],
      lignes: [
        { ref: "ITE", designation: "Isolation murs ITE 14 cm, 65 m², R ≥ 4,4", montantHt: "26 720 € TTC" },
        { ref: "SARKING", designation: "Isolation toiture laine de bois, 78 m², R ≥ 6,25", montantHt: "6 330 € TTC" },
        { ref: "FEN", designation: "5 fenêtres PVC + 1 porte-fenêtre Uw ≤ 1,3", montantHt: "5 498 € TTC" },
        { ref: "PORTE", designation: "Porte d’entrée isolante Ud = 1,5", montantHt: "2 718 € TTC" },
        { ref: "PAC", designation: "PAC air/air SCOP ≥ 4,0", montantHt: "4 220 € TTC" },
        { ref: "ECS", designation: "ECS thermodynamique 200 L COP ≥ 3,5", montantHt: "3 693 € TTC" },
        { ref: "VMC", designation: "VMC Hygro B", montantHt: "2 296 € TTC" },
        { ref: "ANNEXES", designation: "Frais annexes et coordination (ajustement total)", montantHt: "13 560 € TTC" },
      ],
      notes: [
        MENTION_AUDIT,
        "Ce chiffrage d’audit ne constitue pas un devis RGE. Validation MAR obligatoire avant signature des devis définitifs.",
      ],
      statut: "EXTRAIT",
    },
  ],
  foyer: ROYER_FOYER,
};

export const royerAuditData: Audit = {
  controles: [
    {
      titre: "Audit réglementaire reçu",
      statut: "AUDIT RÉGLEMENTAIRE REÇU",
      detail: `${MENTION_AUDIT} Auditeur LEO ENERGY, visite 17/03/2026.`,
    },
    {
      titre: "DPE G → B et gain −80 %",
      statut: "EXTRAIT",
      detail: "577 → 117 kWhEP/m².an, réduction CO₂ −85 %. Classe B affichée selon la cible dossier (117 kWhEP/m².an).",
    },
    {
      titre: "Total scénario 3 = 65 035 € TTC",
      statut: "EXTRAIT",
      detail: "Lots énergétiques 51 475 € + annexes / coordination 13 560 €. Le tableau p.19 de l’audit cite aussi ~26 678 € (périmètre partiel) : écart documentaire à rappeler au MAR, le total retenu est celui des recommandations (65 035 €).",
    },
    {
      titre: "Métrés ITE et sarking",
      statut: "À VÉRIFIER",
      detail: "ITE 65 m² vs façades relevées ~127 m². Sarking 78 m² d’isolant vs 60 m² de complexe. Visite technique obligatoire.",
    },
    {
      titre: "Ordre des travaux",
      statut: "EXTRAIT",
      detail: "Isolation murs et toiture + menuiseries avant PAC / ECS / VMC. Isolation avant chauffage respectée.",
    },
  ],
  statutLegendes: [
    { statut: "EXTRAIT", texte: "Lu tel quel dans l’audit réglementaire." },
    { statut: "À VÉRIFIER", texte: "Lu mais incomplet, ambigu ou à recouper sur site." },
    { statut: "INCOHÉRENCE", texte: "Deux mentions du même audit se contredisent." },
    { statut: "DONNÉE MANQUANTE", texte: "Absent de l’audit — non inventé (sauf hypothèse fiscale clairement marquée)." },
    { statut: "AUDIT RÉGLEMENTAIRE REÇU", texte: "Audit officiel LEO ENERGY joint." },
    { statut: "PRÊT POUR VALIDATION MAR", texte: "Analyse prête pour validation du MAR (parcours accompagné)." },
  ],
  statutGlobal: {
    statut: "PRÊT POUR VALIDATION MAR",
    label: "Statut du projet : AUDIT RÉGLEMENTAIRE REÇU — statut de l’analyse :",
    texte: "PRÊT POUR VALIDATION MAR. " + MENTION_AUDIT,
  },
  mentions: {
    documentsIntro: `1 audit réglementaire LEO ENERGY n° ${AUDIT_REF} + emplacements photos avant / après. ${MENTION_AUDIT}`,
    logementIntro: "Chaque ligne porte une origine. Les surfaces non écrites sur l’audit restent à confirmer en visite.",
    devisIntro: "Chiffrage repris du scénario 3 de l’audit (TTC). Ce n’est pas un devis artisan RGE.",
    dpe: MENTION_AUDIT,
    aides: AID_RULES_2026.disclaimer,
    scenarios: `${MENTION_AUDIT} Les montants d’aides sont une estimation contrôlée (barème ${AID_RULES_2026.version}), profil Jaune supposé.`,
  },
  pathologies: [
    {
      titre: "Façades — pierre de taille non isolée",
      description:
        "L’ensemble des murs extérieurs (sud, est, sud-ouest, nord-ouest) sont en pierre de taille / moellons d’un seul matériau, épaisseur 60 cm, parois anciennes non isolées. Principal poste de déperditions.",
      conseils: "ITE 14 cm, R ≥ 4,4, sur 65 m² selon le scénario 3 — surface exacte à caler en visite.",
    },
    {
      titre: "Menuiseries bois vétustes",
      description:
        "Fenêtres bois double vitrage ancien (air 12 mm, sans couche peu émissive), porte-fenêtre bois simple vitrage, porte d’entrée bois avec 30 à 60 % de vitrage simple. Performances insuffisantes, infiltrations.",
      conseils: "5 fenêtres + 1 porte-fenêtre PVC Uw ≤ 1,3 et porte Ud = 1,5.",
    },
    {
      titre: "Toiture / plafond bois non isolé",
      description: "Plafond bois sur solives bois, non isolé. Combles / rampants responsables d’une part importante des pertes.",
      conseils: "Sarking laine de bois, 78 m², R ≥ 6,25.",
    },
    {
      titre: "Plancher bas terre-plein",
      description: "Plancher sur terre-plein non isolé. Non traité dans le scénario 3 retenu.",
      conseils: "Hors périmètre du scénario 3 — à arbitrer avec le MAR si confort de sol insuffisant.",
    },
  ],
  photoSlots: [
    {
      id: "avant-facades",
      titre: "Façades pierre (sud, est, nord-ouest)",
      cote: "avant",
      description: "Photo réelle avant — murs 60 cm non isolés. À charger manuellement.",
    },
    {
      id: "apres-facades",
      titre: "Façades après ITE",
      cote: "apres",
      description: "Photo réelle après travaux — distincte d’une projection. À charger manuellement.",
    },
    {
      id: "avant-menuiseries",
      titre: "Menuiseries bois existantes",
      cote: "avant",
      description: "Fenêtres / porte-fenêtre / porte d’entrée vétustes. À charger manuellement.",
    },
    {
      id: "apres-menuiseries",
      titre: "Menuiseries après remplacement",
      cote: "apres",
      description: "Photo réelle après travaux. À charger manuellement.",
    },
  ],
  performanceBanner: {
    dpeAvant: "G",
    dpeApres: "B",
    consoAvant: "577 kWhEP/m².an",
    consoApres: "117 kWhEP/m².an",
    gain: "−80 %",
    reductionCo2: "CO₂ −85 %",
    mention: MENTION_AUDIT,
  },
  preRapport: [
    `**${MENTION_AUDIT}** Auditeur LEO ENERGY (LIONEL MFEGUE), visite le 17/03/2026. Statut projet : **AUDIT RÉGLEMENTAIRE REÇU**. Statut analyse : **PRÊT POUR VALIDATION MAR**.`,
    "Maison individuelle à Chalain-d’Uzore, 77 m², avant 1948, pierre de taille 60 cm, 2 niveaux habitables. DPE initial **G (577 kWhEP/m².an)**. Cible scénario 3 : **B (117 kWhEP/m².an)**, gain **−80 %**, CO₂ **−85 %**.",
    "Scénario 3 retenu, total **65 035 € TTC** : ITE 26 720 €, sarking 6 330 €, menuiseries 5 498 €, porte 2 718 €, PAC air/air 4 220 €, ECS 3 693 €, VMC Hygro B 2 296 €, frais annexes et coordination 13 560 €.",
    "Profil **Jaune supposé (60 %)** — RFR non lu sur l’audit. Le moteur contrôlé applique le barème 2026 (plafonds / écrêtement), parcours G → B (5 classes). Mensualité Éco-PTZ au **taux 0 %** uniquement, sous réserve d’acceptation. Validation MAR obligatoire.",
    "Photos avant / après : emplacements prévus, chargement manuel. Rien de ce pré-rapport ne constitue un devis RGE ni un accord d’aides.",
  ],
};
