/**
 * Simulations illustratives de valorisation — Chagny et communes limitrophes.
 * Ne constitue ni un DPE réglementaire, ni une estimation immobilière opposable,
 * ni une garantie d’aides, de délai, d’économie ou de plus-value.
 */

export const TYPES_BIEN = [
  { id: "maison", label: "Maison individuelle" },
  { id: "appartement", label: "Appartement" },
] as const;

export const BANDES_DPE = [
  { id: "passoire", label: "G / F — Passoire thermique", classes: "G / F" },
  { id: "energivore", label: "E — Très énergivore", classes: "E" },
  { id: "standard", label: "D — Standard", classes: "D" },
  { id: "performant", label: "A / B / C", classes: "A / B / C" },
] as const;

export const MODES_CHAUFFAGE = [
  { id: "fioul", label: "Fioul" },
  { id: "gaz", label: "Gaz" },
  { id: "electrique", label: "Électrique convecteurs" },
  { id: "autre", label: "Autre / Bois" },
] as const;

export const COMMUNES_SECTEUR = [
  "Chagny (71)",
  "Chassey-le-Camp (71)",
  "Rully (71)",
  "Bouzeron (71)",
  "Demigny (71)",
  "Remigny (71)",
  "Chaudenay (71)",
  "Saint-Léger-sur-Dheune (71)",
  "Aluze (71)",
  "Dennevy (71)",
  "Cheilly-lès-Maranges (71)",
  "Chassagne-Montrachet (21)",
  "Puligny-Montrachet (21)",
  "Corpeau (21)",
  "Ébaty (21)",
  "Autre commune 71 / 21",
] as const;

export const JOURS_RDV = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"] as const;
export const CRENEAUX_RDV = [
  { id: "matin", label: "Matin" },
  { id: "apres-midi", label: "Après-midi" },
] as const;

export const SURFACE_MIN = 80;
export const SURFACE_MAX = 250;
export const SURFACE_DEFAUT = 120;

export type TypeBien = (typeof TYPES_BIEN)[number]["id"];
export type BandeDpe = (typeof BANDES_DPE)[number]["id"];
export type ModeChauffage = (typeof MODES_CHAUFFAGE)[number]["id"];

export type ReponsesEstimer = {
  typeBien: TypeBien;
  surface: number;
  dpe: BandeDpe;
  chauffage: ModeChauffage;
  commune: string;
};

export type ScenarioValorisation = {
  id: "etat" | "ciblee" | "globale";
  titre: string;
  sousTitre: string;
  accent: "navy" | "gold" | "green";
  points: string[];
  plusValue: string;
  badge: string;
};

const DECOTE: Record<BandeDpe, { min: number; max: number }> = {
  passoire: { min: 10, max: 20 },
  energivore: { min: 8, max: 15 },
  standard: { min: 4, max: 10 },
  performant: { min: 0, max: 5 },
};

export function labelDpe(id: BandeDpe): string {
  return BANDES_DPE.find((item) => item.id === id)?.label ?? id;
}

export function labelChauffage(id: ModeChauffage): string {
  return MODES_CHAUFFAGE.find((item) => item.id === id)?.label ?? id;
}

export function labelBien(id: TypeBien): string {
  return TYPES_BIEN.find((item) => item.id === id)?.label ?? id;
}

export function resumerScenarios(scenarios: ScenarioValorisation[]): string {
  return scenarios
    .map((s, i) => `${i + 1}. ${s.titre} — ${s.plusValue}\n${s.points.map((p) => `   • ${p}`).join("\n")}`)
    .join("\n\n");
}

export function calculerScenarios(reponses: ReponsesEstimer): {
  scenarios: ScenarioValorisation[];
  mention: string;
} {
  const decote = DECOTE[reponses.dpe];
  const chauffageLourd = reponses.chauffage === "fioul" || reponses.chauffage === "electrique";
  const dejaPerformant = reponses.dpe === "performant";
  const passoire = reponses.dpe === "passoire" || reponses.dpe === "energivore";

  const scenarios: ScenarioValorisation[] = [
    {
      id: "etat",
      titre: "Vente en l'état",
      sousTitre: "Sans travaux de rénovation énergétique",
      accent: "navy",
      badge: "Marché actuel",
      plusValue:
        decote.max <= 5
          ? "Peu ou pas de décote DPE estimée"
          : `Décote estimée ${decote.min} % à ${decote.max} %`,
      points: [
        dejaPerformant
          ? `Classe DPE déclarée ${labelDpe(reponses.dpe)} : décote énergétique limitée, à confirmer par un DPE en cours de validité.`
          : `Décote estimée de ${decote.min} % à ${decote.max} % liée à la note DPE (${labelDpe(reponses.dpe)}).`,
        passoire
          ? "Délais de vente allongés sur le marché actuel, surtout pour les passoires thermiques."
          : "Les délais de vente restent liés à la demande locale et à la classe énergétique présentée aux acquéreurs.",
        chauffageLourd
          ? "Le mode de chauffage actuel pèse souvent sur le diagnostic et la négociation."
          : "La classe énergétique reste un critère de décision pour les acquéreurs.",
      ],
    },
    {
      id: "ciblee",
      titre: "Rénovation ciblée",
      sousTitre: "Pompe à chaleur + isolation combles",
      accent: "gold",
      badge: "Travaux essentiels",
      plusValue: "Valorisation vénale +8 % à +12 % (indicatif)",
      points: [
        "Travaux essentiels : pompe à chaleur et isolation des combles.",
        "Aides financières 2026 (MaPrimeRénov' + CEE) : estimation à titre indicatif, à valider selon revenus réels et éligibilité.",
        "Valorisation vénale immédiate estimée de +8 % à +12 % — hypothèse de travail, non opposable.",
      ],
    },
    {
      id: "globale",
      titre: "Rénovation globale optimale",
      sousTitre: "Partenariat Energia Conseil IA®",
      accent: "green",
      badge: "Recommandé",
      plusValue: dejaPerformant
        ? "Optimisation patrimoniale à confirmer sur site"
        : "Plus-value patrimoniale +20 % à +30 % (indicatif)",
      points: [
        "Bouquet complet : isolation thermique, PAC, ventilation.",
        "Aides jusqu'à 70-80 % selon barème 2026 : estimation à titre indicatif, montants définitifs après instruction ANAH et CEE.",
        dejaPerformant
          ? "Un DPE A / B / C déclaré n'exclut pas un bouquet ciblé ; le saut de classe se confirme uniquement après visite et simulation."
          : "Saut de classe DPE vers A ou B — simulation indicative, ne constituant pas une mesure réglementaire ni un audit réalisé sur site.",
        "Plus-value patrimoniale maximale estimée de +20 % à +30 % — hypothèse de travail, non garantie.",
      ],
    },
  ];

  return {
    scenarios,
    mention:
      "Simulation illustrative. Ne constitue pas une mesure réglementaire, un DPE, un audit sur site, une estimation immobilière opposable, ni une garantie d'aide, de délai, d'économie ou de plus-value. Montants définitifs après visite, métrés et instruction ANAH / CEE.",
  };
}

