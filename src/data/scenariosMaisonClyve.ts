/** Trois scénarios de travail — Maison Clyve (test local). Devis réels au centime ; DPE / aides / PAC / VMC / PV = hypothèses. */

export const DISCLAIMER_SCENARIOS =
  "Les scénarios présentés sont des simulations de travail basées sur les devis fournis et des estimations techniques. Ils ne constituent pas un audit réglementaire officiel ni un engagement contractuel d’aides ou de financement. Validation humaine par le MAR obligatoire.";

export const BANDEAU_WOW = "PROJECTION WOW — APRÈS TRAVAUX — À VALIDER";
export const LEGENDE_WOW =
  "Simulation visuelle indicative basée sur les photos et documents disponibles. Elle ne constitue pas une photographie du résultat final, un plan architectural définitif ou un engagement contractuel.";

export const LABEL_AVANT = "AVANT — PHOTO RÉELLE";
export const LABEL_APRES_REEL = "APRÈS — PHOTO RÉELLE";

export const MENTION_DPE =
  "Aucun DPE ni audit réglementaire n’est joint au corpus Clyve. Les classes G ➔ E / C / A et les pourcentages de déperditions sont des hypothèses de travail, non calculées, non garanties.";

export const MENTION_AIDES =
  "Aucun RFR n’est au dossier. Le simulateur applique des taux d’interface 80 / 70 / 50 / 35 % à titre pédagogique. Ce ne sont pas les barèmes officiels MaPrimeRénov’ Parcours 2026 (80 / 60 / 45 / 10 %, plafonds 24 000 / 18 000 / 13 500 / 3 000 € hors IDF). Aucun plafond ANAH n’est appliqué ici. Montants à titre indicatif, à valider selon revenus réels, définitifs après instruction ANAH et CEE.";

export const MENTION_MADINIER =
  "L’offre Madinier EST0001 (total unique 57 850,00 €, 450 m², tuile plate Delta 10) n’est pas intégrée aux totaux : non cumulable avec Faivre 508-v1.";

export const MENTION_TOITURE_FAIVRE =
  "Devis SARL FAIVRE n° 508-v1 : couverture neuve 360,000 m² tuiles oméga 10 (pas 80 m²). Sous-toiture R3 + contre-lattage 360 m². Laine de bois 100 mm R=2,75 : non lue sur ce devis.";

export type SourceChiffrage = "DEVIS RÉEL" | "ESTIMATION TECHNIQUE" | "HYPOTHÈSE";

export type StatutScenarioVisuel =
  | "PHOTO AVANT CONFIRMÉE"
  | "PROJECTION WOW À VALIDER"
  | "VALIDÉE PAR HUMAIN"
  | "PHOTO APRÈS TRAVAUX RÉELLE À AJOUTER";

export type LotScenario = {
  libelle: string;
  detail: string;
  montantTtc: number;
  source: SourceChiffrage;
  reference: string;
};

export type ProfilSimulationId = "bleu" | "jaune" | "violet" | "rose";

export type ProfilSimulation = {
  id: ProfilSimulationId;
  label: string;
  sousTitre: string;
  taux: number;
  note: string;
};

export type ScenarioTravaux = {
  id: "A" | "B" | "C";
  code: "essentiel" | "optimal" | "excellence";
  titre: string;
  nomCourt: string;
  objectif: string;
  badge: string;
  recommande: boolean;
  dpeAvantHypothese: "G";
  dpeApresHypothese: "E" | "C" | "A";
  gainDeperditionsHypothese: string;
  lotsInclus: LotScenario[];
  lotsExclus: string[];
  totalTtc: number;
  photoAvantSrc: string;
  photoAvantNom: string;
  projectionWowSrc: string;
  transformations: string[];
  sources: string[];
  confiance: "élevé" | "moyen" | "faible";
  notesTechniques: string[];
};

/** Montants devis extraits — ne pas arrondir. */
export const FAIVRE_HT = 48879.2;
export const FAIVRE_TTC = 53767.12;
export const MTL_HT = 25239;
export const MTL_TTC = 27762.9;
export const ESTIM_PAC_BALLON_B = 15500;
export const ESTIM_VMC_SF_B = 1500;
export const ESTIM_CHAUFFAGE_VMC_C = 22500;
export const ESTIM_SOLAIRE_C = 18000;

const LOT_FAIVRE: LotScenario = {
  libelle: "Réfection et isolation de toiture",
  detail:
    "Couverture neuve tuiles oméga 10 — 360,000 m² ; sous-toiture R3 + contre-lattage 360 m² ; zinguerie. Validité échue (15/03/2022).",
  montantTtc: FAIVRE_TTC,
  source: "DEVIS RÉEL",
  reference: "SARL FAIVRE n° 508-v1 — 48 879,20 € HT / 53 767,12 € TTC",
};

const LOT_MTL: LotScenario = {
  libelle: "Dalles et ouvertures (grange + habitation)",
  detail: "5 dalles (66 + 40 + 33 + 36 + 36 m²) et ouvertures. Validité échue (14/04/2022). Lien photo ↔ devis : non démontré pièce par pièce.",
  montantTtc: MTL_TTC,
  source: "DEVIS RÉEL",
  reference: "MTL MAÇONNERIE n° I-22-04-4 — 25 239,00 € HT / 27 762,90 € TTC",
};

export const PROFILS_SIMULATION: ProfilSimulation[] = [
  {
    id: "bleu",
    label: "Profil Bleu",
    sousTitre: "Très modestes",
    taux: 0.8,
    note: "80 % d’aides max — simulation interne, RFR non fourni",
  },
  {
    id: "jaune",
    label: "Profil Jaune",
    sousTitre: "Modestes",
    taux: 0.7,
    note: "70 % d’aides max — simulation interne (barème officiel 2026 = 60 %)",
  },
  {
    id: "violet",
    label: "Profil Violet",
    sousTitre: "Intermédiaires",
    taux: 0.5,
    note: "50 % d’aides max — simulation interne (barème officiel 2026 = 45 %)",
  },
  {
    id: "rose",
    label: "Profil Rose",
    sousTitre: "Aisés",
    taux: 0.35,
    note: "35 % d’aides max — simulation interne (barème officiel 2026 = 10 %)",
  },
];

export const SCENARIOS_TRAVAUX: ScenarioTravaux[] = [
  {
    id: "A",
    code: "essentiel",
    titre: "Scénario Essentiel — Sécurisation & Étanchéité",
    nomCourt: "Essentiel",
    objectif: "Stopper les infiltrations critiques et isoler la toiture.",
    badge: "Priorité Enveloppe",
    recommande: false,
    dpeAvantHypothese: "G",
    dpeApresHypothese: "E",
    gainDeperditionsHypothese: "−35 %",
    lotsInclus: [LOT_FAIVRE],
    lotsExclus: [
      "Maçonnerie / dalles (devis MTL non retenu dans cette option)",
      "Chauffage (PAC) — absent du corpus",
      "Ventilation",
      "Menuiseries",
      "Solaire / batterie",
    ],
    totalTtc: FAIVRE_TTC,
    photoAvantSrc: "/test-maison-clyve/avant/facade-avant.png",
    photoAvantNom: "FACADE AVANT .png",
    projectionWowSrc: "/test-maison-clyve/projections/projection-scenario-a-wow.png",
    transformations: [
      "Toiture réparée, tuiles homogènes, faîtage plus régulier",
      "Zinguerie cohérente (chéneaux / descentes — devis Faivre)",
      "Palettes, bâche bleue et déchets de chantier retirés de la vue",
      "Abords nettoyés — enduit de façade illustratif, non chiffré dans Faivre",
    ],
    sources: [
      "Devis réel SARL FAIVRE 508-v1 (53 767,12 € TTC)",
      "Photo réelle FACADE AVANT .png (non retouchée)",
    ],
    confiance: "moyen",
    notesTechniques: [
      MENTION_TOITURE_FAIVRE,
      "Surfaces toiture du corpus : 360 / 450 / 505 m² — incohérence à lever.",
      "2 cheminées à démolir au devis Faivre : lesquelles, non identifiées sur photo.",
    ],
  },
  {
    id: "B",
    code: "optimal",
    titre: "Scénario Optimal — Rénovation Globale & Confort",
    nomCourt: "Optimal",
    objectif: "Traiter l’enveloppe, la maçonnerie et installer un chauffage performant.",
    badge: "⭐ RECOMMANDÉ",
    recommande: true,
    dpeAvantHypothese: "G",
    dpeApresHypothese: "C",
    gainDeperditionsHypothese: "−65 %",
    lotsInclus: [
      LOT_FAIVRE,
      LOT_MTL,
      {
        libelle: "Système de chauffage & ECS",
        detail: "PAC air-eau 12 kW + ballon thermodynamique 250 L. Aucun devis chauffage au corpus. Dimensionnement POST-ISOLATION à recalculer (12 kW peut être surdimensionné).",
        montantTtc: ESTIM_PAC_BALLON_B,
        source: "ESTIMATION TECHNIQUE",
        reference: "Estimation interne 15 500,00 € TTC — pas un devis artisan",
      },
      {
        libelle: "Ventilation",
        detail: "VMC simple flux hygrovariable. Ventilation non documentée sur photos / devis.",
        montantTtc: ESTIM_VMC_SF_B,
        source: "ESTIMATION TECHNIQUE",
        reference: "Estimation interne 1 500,00 € TTC — pas un devis artisan",
      },
    ],
    lotsExclus: [
      "Solaire photovoltaïque et batterie",
      "VMC double flux (réservée à l’option Excellence)",
      "Menuiseries (aucun devis menuiserie)",
      "Offre toiture Madinier (non cumulable)",
    ],
    totalTtc: FAIVRE_TTC + MTL_TTC + ESTIM_PAC_BALLON_B + ESTIM_VMC_SF_B,
    photoAvantSrc: "/test-maison-clyve/avant/facade-avant.png",
    photoAvantNom: "FACADE AVANT .png",
    projectionWowSrc: "/test-maison-clyve/projections/projection-scenario-b-wow.png",
    transformations: [
      "Toiture réparée (lot Faivre) et abords nettoyés",
      "Façade plus soignée, volets restaurés, ouvertures aux mêmes emplacements",
      "Pas de panneaux photovoltaïques (hors option)",
      "PAC / VMC : lots estimés, non visibles comme équipements confirmés sur la façade",
    ],
    sources: [
      "Devis réel SARL FAIVRE 508-v1 (53 767,12 € TTC)",
      "Devis réel MTL MAÇONNERIE I-22-04-4 (27 762,90 € TTC)",
      "PAC + ballon : estimation 15 500,00 € TTC",
      "VMC SF : estimation 1 500,00 € TTC",
    ],
    confiance: "faible",
    notesTechniques: [
      "Total TTC = 53 767,12 + 27 762,90 + 15 500,00 + 1 500,00 = 98 530,02 €.",
      "Isolation avant chauffage : impératif. PAC à dimensionner après isolation.",
      "Dalles MTL : correspondance avec la dalle photographiée non établie pièce par pièce.",
    ],
  },
  {
    id: "C",
    code: "excellence",
    titre: "Scénario Excellence — Maison BBC & Autonomie Solaire",
    nomCourt: "Excellence",
    objectif: "Atteindre le niveau basse consommation et l’autonomie énergétique (hypothèse de travail).",
    badge: "Maison BBC & Autonome",
    recommande: false,
    dpeAvantHypothese: "G",
    dpeApresHypothese: "A",
    gainDeperditionsHypothese: "−85 %",
    lotsInclus: [
      LOT_FAIVRE,
      LOT_MTL,
      {
        libelle: "Chauffage, ECS et ventilation premium",
        detail: "PAC air-eau 12 kW + ballon thermodynamique + VMC double flux haut rendement. Estimation, pas de devis.",
        montantTtc: ESTIM_CHAUFFAGE_VMC_C,
        source: "ESTIMATION TECHNIQUE",
        reference: "Estimation interne 22 500,00 € TTC — pas un devis artisan",
      },
      {
        libelle: "Autonomie solaire (option pilote Clyve)",
        detail: "Panneaux DualSun 6 kWc + batterie de stockage LFP 7 kWh. Aucune implantation PV n’est confirmée au corpus.",
        montantTtc: ESTIM_SOLAIRE_C,
        source: "HYPOTHÈSE",
        reference: "Hypothèse fiche de référence Energia — 18 000,00 € TTC estimés",
      },
    ],
    lotsExclus: [
      "Offre toiture Madinier (non cumulable avec Faivre)",
      "Devis menuiseries (absent)",
    ],
    totalTtc: FAIVRE_TTC + MTL_TTC + ESTIM_CHAUFFAGE_VMC_C + ESTIM_SOLAIRE_C,
    photoAvantSrc: "/test-maison-clyve/avant/facade-avant.png",
    photoAvantNom: "FACADE AVANT .png",
    projectionWowSrc: "/test-maison-clyve/projections/projection-scenario-c-wow.png",
    transformations: [
      "Même longère, même angle : toiture homogène et façade restaurée (illustration)",
      "Champ photovoltaïque DualSun illustré sur le rampant — HYPOTHÈSE, implantation non confirmée",
      "Batterie LFP : équipement intérieur, non visible sur la façade",
      "Ouvertures conservées ; pas de baie vitrée inventée",
    ],
    sources: [
      "Devis réel SARL FAIVRE 508-v1 (53 767,12 € TTC)",
      "Devis réel MTL MAÇONNERIE I-22-04-4 (27 762,90 € TTC)",
      "PAC + ballon + VMC DF : estimation 22 500,00 € TTC",
      "DualSun 6 kWc + batterie LFP 7 kWh : hypothèse 18 000,00 € TTC",
    ],
    confiance: "faible",
    notesTechniques: [
      "Total TTC = 53 767,12 + 27 762,90 + 22 500,00 + 18 000,00 = 122 030,02 €.",
      "Classe A / BBC : hypothèse, aucun DPE au dossier.",
      "PV : si la projection montre des capteurs, les traiter comme illustration d’hypothèse, pas comme un lot contractuel.",
    ],
  },
];

export function formatEuro(montant: number): string {
  return `${montant.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

export function simulerAides(totalTtc: number, taux: number): {
  aides: number;
  reste: number;
  mensualite: number;
} {
  const aides = Math.round(totalTtc * taux * 100) / 100;
  const reste = Math.round((totalTtc - aides) * 100) / 100;
  const mensualite = Math.round((reste / (15 * 12)) * 100) / 100;
  return { aides, reste, mensualite };
}
