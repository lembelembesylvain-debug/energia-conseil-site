/** Données extraites uniquement de l’audit BATIAUDIT / LEO ENERGY (visite 03/07/2026). Hors production. */

export const PEREIRA_AUDIT_PDF_HREF = "/test-maison-pereira/audit-pignard-batiment-01.pdf";

export const PEREIRA_A_RELEVER = "À relever lors de la visite";

export type ChampPereira = {
  label: string;
  valeur: string;
  source: "pdf" | "manquant";
};

export const PEREIRA_IDENTITE: ChampPereira[] = [
  { label: "Désignation interne ENERGIA", valeur: "Dossier Pereira (nom absent du PDF)", source: "manquant" },
  { label: "Propriétaire", valeur: "SUCCESSION PIGNARD", source: "pdf" },
  { label: "Commanditaire", valeur: "SUCCESSION PIGNARD", source: "pdf" },
  { label: "Prénom / nom occupant", valeur: PEREIRA_A_RELEVER, source: "manquant" },
  { label: "Téléphone / e-mail", valeur: PEREIRA_A_RELEVER, source: "manquant" },
  { label: "Adresse du bien (audit)", valeur: "1 route Route de Mizérieux, 42510 Nervieux", source: "pdf" },
  { label: "Adresse du propriétaire (audit)", valeur: "1 Route de Saint Germain Laval, 42510 NERVIEUX", source: "pdf" },
  { label: "Nom de fichier source", valeur: "1 ROUTE D EST GERMAIN (2)_Projet_Bâtiment 01", source: "pdf" },
  { label: "N° cadastre", valeur: PEREIRA_A_RELEVER + " (non communiquée dans l’audit)", source: "manquant" },
  { label: "Identifiant fiscal", valeur: PEREIRA_A_RELEVER + " (non communiqué dans l’audit)", source: "manquant" },
  { label: "N° ADEME", valeur: "[NON EMIS ADEME]", source: "pdf" },
  { label: "Réf. DPE (si utilisé)", valeur: "2442E0486592V", source: "pdf" },
];

export const PEREIRA_LOGEMENT: ChampPereira[] = [
  { label: "Type de bien", valeur: "Maison individuelle — 1 logement", source: "pdf" },
  { label: "Surface de référence", valeur: "164,00 m²", source: "pdf" },
  { label: "Niveaux", valeur: "2,0", source: "pdf" },
  { label: "Hauteur sous plafond", valeur: "2,50 m", source: "pdf" },
  { label: "Année de construction", valeur: "Entre 1948 et 1974", source: "pdf" },
  { label: "Département / zone", valeur: "42 — H1c — altitude 315 m", source: "pdf" },
  { label: "Murs", valeur: "Pisé ou béton de terre stabilisé, 60–65 cm, non isolés", source: "pdf" },
  {
    label: "Surfaces murs extérieurs",
    valeur: "Sud 12,00 m² + Ouest 73,00 m² + Nord 20,00 m² + Est 88,00 m² (193,00 m²)",
    source: "pdf",
  },
];

export const PEREIRA_DPE: ChampPereira[] = [
  { label: "Classe DPE (lettre A–G)", valeur: PEREIRA_A_RELEVER + " (étiquette graphique, non extraite en texte)", source: "manquant" },
  { label: "Consommation initiale", valeur: "320 kWhEP/m².an (304 EF)", source: "pdf" },
  { label: "Dont chauffage fioul", valeur: "286,6 kWhEP/m².an", source: "pdf" },
  { label: "Facture conventionnelle initiale", valeur: "6 510 € à 8 860 € / an", source: "pdf" },
  { label: "Ubat initial", valeur: "1,223 W/(m².K) — Ubat base 0,308 W/(m².K)", source: "pdf" },
  { label: "Après scénarios 1 et 2 (fin)", valeur: "73 kWhEP/m².an (38 EF) — −77 % — GES −98 % (−92 kg CO2/m².an)", source: "pdf" },
  { label: "Après scénario 3", valeur: "75 kWhEP/m².an (40 EF) — −77 % (−245 kWhEP/m².an)", source: "pdf" },
];

export const PEREIRA_EQUIPEMENTS: ChampPereira[] = [
  {
    label: "Chauffage",
    valeur: "Chaudière fioul classique avant 1970 (année 1969), 35,00 kW, radiateurs HT sans robinet thermostatique, réseau monotube non isolé, 164 m²",
    source: "pdf",
  },
  { label: "ECS", valeur: "Ballon électrique vertical 100 L, accumulation, en volume chauffé — état mauvais", source: "pdf" },
  { label: "Ventilation", valeur: "Ouverture des fenêtres / VMR — pas de VMC — « Ventilation non fonctionnelle »", source: "pdf" },
  { label: "Perméabilité (valeur par défaut)", valeur: "2,20 m³/(h.m²)", source: "pdf" },
  { label: "Plancher", valeur: "Dalle béton 60,00 m² sur sous-sol non chauffé, non isolé", source: "pdf" },
  { label: "Toiture / plafond", valeur: "Plafond solives bois 120,00 m² sur comble faiblement ventilé, non isolé", source: "pdf" },
  {
    label: "Menuiseries",
    valeur: "Bois simple vitrage, Uw 5,4 / Ujn 4, sans joints — 7 fenêtres (15,00 m²) + 2 portes",
    source: "pdf",
  },
  { label: "Pathologies notées", valeur: "Fissures façade — prévoir reprise ou rebouchement", source: "pdf" },
];

export type LotPereira = {
  poste: string;
  quantiteTableau: string;
  quantiteTexteAuditeur: string;
  montantTtcTableau: string;
  aRelever: boolean;
};

export const PEREIRA_LOTS_SCENARIO_1: LotPereira[] = [
  {
    poste: "Menuiseries PVC Uw ≤ 1,30",
    quantiteTableau: "surface des ouvrants : 0,0 m² (anomalie)",
    quantiteTexteAuditeur: "7 fenêtres + 2 portes (fiche technique)",
    montantTtcTableau: "6 226 €",
    aRelever: true,
  },
  {
    poste: "ITI 12 cm, R ≥ 3,50",
    quantiteTableau: "30 m²",
    quantiteTexteAuditeur: "environ 164 m² (murs extérieurs mesurés : 193 m²)",
    montantTtcTableau: "16 400 €",
    aRelever: true,
  },
  {
    poste: "Isolation combles, R ≥ 7",
    quantiteTableau: "120 m²",
    quantiteTexteAuditeur: "environ 40 m²",
    montantTtcTableau: "2 500 €",
    aRelever: true,
  },
  {
    poste: "Isolation plancher, R ≥ 3",
    quantiteTableau: "60 m²",
    quantiteTexteAuditeur: "environ 60 m²",
    montantTtcTableau: "10 445 €",
    aRelever: false,
  },
  {
    poste: "VMC Hygro B",
    quantiteTableau: "1 forfait",
    quantiteTexteAuditeur: "simple flux hygroréglable type B",
    montantTtcTableau: "1 500 €",
    aRelever: false,
  },
  {
    poste: "PAC air/air 5 splits 12 kW + dépose fioul/cuve",
    quantiteTableau: "5 splits — SCOP ≥ 3,5",
    quantiteTexteAuditeur: "multi-split réversible 12 kW",
    montantTtcTableau: "14 000 €",
    aRelever: true,
  },
  {
    poste: "Ballon 200 L",
    quantiteTableau: "ballon thermique 200 L",
    quantiteTexteAuditeur: "ballon thermodynamique 200 L, COP = 3,5",
    montantTtcTableau: "2 200 €",
    aRelever: true,
  },
  {
    poste: "Travaux induits",
    quantiteTableau: "dépose menuiseries + remise en état élec./plomberie",
    quantiteTexteAuditeur: "63 € + 63 €",
    montantTtcTableau: "126 €",
    aRelever: false,
  },
];

export const PEREIRA_SCENARIOS = [
  { nom: "Scénario 1 — rénovation en une fois", totalTtc: "~ 53 397 €", conso: "73 kWhEP/m².an", note: "Tous postes y compris plancher" },
  { nom: "Scénario 2 — étape 1 (enveloppe)", totalTtc: "~ 35 697 €", conso: "−53 % (−170 kWhEP/m².an)", note: "Sans VMC / PAC / ballon" },
  { nom: "Scénario 2 — étape 2 (systèmes)", totalTtc: "~ 17 700 €", conso: "73 kWhEP/m².an", note: "VMC + PAC + ballon" },
  { nom: "Scénario 3 — rénovation en une fois", totalTtc: "~ 42 952 €", conso: "75 kWhEP/m².an", note: "Sans isolation plancher" },
];

export const PEREIRA_CONTRADICTIONS = [
  "Le tableau logiciel du scénario 1 totalise ~ 53 397 € TTC ; le texte auditeur écrit ~ 124 983 € TTC / ~ 125 000 € TTC.",
  "ITI : 30 m² (tableau) vs ~ 164 m² (texte) vs 193 m² de murs extérieurs mesurés.",
  "Combles : 120 m² (tableau) vs ~ 40 m² (texte).",
  "Surface des ouvrants indiquée 0,0 m² dans le tableau de travaux, alors que la fiche technique liste 15,00 m² de fenêtres.",
  "Ballon : « thermique 200 L » dans le tableau vs « thermodynamique COP = 3,5 » dans le texte.",
];

export const PEREIRA_AUDITEUR = {
  organisme: "LEO ENERGY — 37 Rue Druge, 38200 Vienne",
  auditeur: "Lionel MFEGUE",
  telephone: "0666373960",
  email: "Imfegue@leo-energy.com",
  logiciel: "BATIAUDIT V1.4.22.0 — moteur 3CL-DPE2021 V2025.11.1.0",
  visite: "03/07/2026",
  validite: "[AUCUNE]",
  aidesNationales: "MaPrimeRénov' parcours Accompagné",
  aidesLocales: "Aucune",
};
