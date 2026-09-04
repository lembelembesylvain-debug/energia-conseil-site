import type { CategorieMetier, SousCategorieMetier, TauxTvaCatalogue } from "./types";

type DefCategorie = {
  id: string;
  nom: string;
  tauxTvaDefaut: TauxTvaCatalogue;
  sousCategories: string[];
};

const DEFINITIONS: DefCategorie[] = [
  {
    id: "etude-accompagnement",
    nom: "Étude et accompagnement",
    tauxTvaDefaut: 0.2,
    sousCategories: [
      "Audit énergétique",
      "Étude thermique",
      "Étude photovoltaïque",
      "Étude de dimensionnement",
      "Accompagnement administratif",
      "Coordination de projet",
      "Pilotage de chantier",
    ],
  },
  {
    id: "plafonds-tendus",
    nom: "Plafonds tendus",
    tauxTvaDefaut: 0.2,
    sousCategories: [
      "Plafond tendu PVC",
      "Plafond tendu textile",
      "Éclairage intégré",
      "Dépose d’ancien plafond",
    ],
  },
  {
    id: "peinture",
    nom: "Peinture",
    tauxTvaDefaut: 0.1,
    sousCategories: [
      "Peinture intérieure",
      "Peinture extérieure",
      "Préparation des supports",
      "Enduit",
      "Papier peint",
      "Finitions",
    ],
  },
  {
    id: "plomberie",
    nom: "Plomberie",
    tauxTvaDefaut: 0.1,
    sousCategories: [
      "Réseau d’eau",
      "Réseau d’évacuation",
      "Recherche de fuite",
      "Réparation",
      "Création de réseau",
      "Dépose et remplacement",
    ],
  },
  {
    id: "electricite",
    nom: "Électricité",
    tauxTvaDefaut: 0.1,
    sousCategories: [
      "Installation électrique",
      "Mise aux normes",
      "Tableau électrique",
      "Éclairage",
      "Prises et interrupteurs",
      "Courants faibles",
      "VMC et alimentation électrique",
    ],
  },
  {
    id: "chauffage",
    nom: "Chauffage",
    tauxTvaDefaut: 0.055,
    sousCategories: [
      "Chaudière gaz",
      "Chaudière fioul",
      "Chaudière granulés",
      "Radiateurs",
      "Plancher chauffant",
      "Régulation",
      "Désembouage",
      "Dépose et évacuation",
    ],
  },
  {
    id: "isolation",
    nom: "Isolation",
    tauxTvaDefaut: 0.055,
    sousCategories: [
      "Isolation des combles perdus",
      "Isolation des rampants",
      "Isolation des murs par l’intérieur",
      "Isolation des murs par l’extérieur",
      "Isolation du plancher bas",
      "Isolation des réseaux",
      "Traitement des ponts thermiques",
    ],
  },
  {
    id: "toiture",
    nom: "Toiture",
    tauxTvaDefaut: 0.1,
    sousCategories: [
      "Réparation de toiture",
      "Réfection de couverture",
      "Étanchéité",
      "Isolation de toiture",
      "Zinguerie",
      "Gouttières",
      "Fenêtres de toit",
    ],
  },
  {
    id: "menuiserie",
    nom: "Menuiserie",
    tauxTvaDefaut: 0.055,
    sousCategories: [
      "Fenêtres PVC",
      "Fenêtres aluminium",
      "Fenêtres bois",
      "Portes-fenêtres",
      "Baies vitrées",
      "Portes d’entrée",
      "Volets",
      "Portes de garage",
    ],
  },
  {
    id: "menuiserie-interieure",
    nom: "Menuiserie intérieure",
    tauxTvaDefaut: 0.2,
    sousCategories: [
      "Portes intérieures",
      "Escaliers",
      "Placards",
      "Dressing",
      "Parquet",
      "Aménagement intérieur",
    ],
  },
  {
    id: "carrelage",
    nom: "Carrelage",
    tauxTvaDefaut: 0.1,
    sousCategories: [
      "Sol intérieur",
      "Mur intérieur",
      "Salle de bains",
      "Terrasse",
      "Faïence",
      "Dépose ancien carrelage",
    ],
  },
  {
    id: "maconnerie",
    nom: "Maçonnerie",
    tauxTvaDefaut: 0.1,
    sousCategories: [
      "Gros œuvre",
      "Mur",
      "Dalle",
      "Chape",
      "Ouverture de mur",
      "Fondation",
      "Réparation de maçonnerie",
    ],
  },
  {
    id: "plomberie-sanitaire",
    nom: "Plomberie sanitaire",
    tauxTvaDefaut: 0.1,
    sousCategories: [
      "Salle de bains",
      "WC",
      "Douche",
      "Baignoire",
      "Lavabo",
      "Robinetterie",
      "Ballon d’eau chaude",
      "Évacuation sanitaire",
    ],
  },
  {
    id: "climatisation",
    nom: "Climatisation",
    tauxTvaDefaut: 0.2,
    sousCategories: [
      "Mono-split",
      "Bi-split",
      "Multi-split",
      "Climatisation réversible",
      "Installation",
      "Entretien",
      "Dépose",
    ],
  },
  {
    id: "serrurerie",
    nom: "Serrurerie",
    tauxTvaDefaut: 0.2,
    sousCategories: [
      "Serrure",
      "Porte blindée",
      "Cylindre",
      "Verrou",
      "Garde-corps",
      "Métallerie",
      "Dépannage",
    ],
  },
  {
    id: "vitrerie",
    nom: "Vitrerie",
    tauxTvaDefaut: 0.2,
    sousCategories: [
      "Simple vitrage",
      "Double vitrage",
      "Triple vitrage",
      "Verre de sécurité",
      "Remplacement de vitrage",
      "Vitrine",
    ],
  },
  {
    id: "demolition",
    nom: "Démolition",
    tauxTvaDefaut: 0.2,
    sousCategories: [
      "Dépose intérieure",
      "Dépose de cloison",
      "Dépose de revêtement",
      "Dépose de chaudière",
      "Dépose de cuve fioul",
      "Évacuation des déchets",
    ],
  },
  {
    id: "terrassement",
    nom: "Terrassement",
    tauxTvaDefaut: 0.2,
    sousCategories: [
      "Préparation du terrain",
      "Fouille",
      "Tranchée",
      "Nivellement",
      "Évacuation des terres",
      "Drainage",
    ],
  },
  {
    id: "paysagisme",
    nom: "Paysagisme",
    tauxTvaDefaut: 0.2,
    sousCategories: [
      "Création de jardin",
      "Terrasse",
      "Clôture",
      "Plantation",
      "Gazon",
      "Éclairage extérieur",
      "Arrosage",
    ],
  },
  {
    id: "photovoltaique",
    nom: "Photovoltaïque",
    /** Défaut résidentiel ≤ 9 kWc. Au-delà de 9 kWc : TVA 20 % (barème septembre 2026). */
    tauxTvaDefaut: 0.055,
    sousCategories: [
      "Installation photovoltaïque",
      "Panneaux photovoltaïques",
      "Micro-onduleurs",
      "Onduleur centralisé",
      "Batterie de stockage",
      "Coffret de protection",
      "Structure et fixations",
      "Crochets et supports",
      "Câbles et connectique",
      "Pose photovoltaïque",
      "Mise à la terre",
      "Protections complémentaires",
      "Calepinage",
      "Autoconsommation",
      "Revente du surplus",
      "Monitoring",
      "Raccordement",
      "Démarches administratives",
      "Consuel",
      "Mise en service",
      "Déplacement",
      "Maintenance",
      "Coordination ENERGIA",
      "Frais administratifs Clyve",
    ],
  },
  {
    id: "charpente",
    nom: "Charpente",
    tauxTvaDefaut: 0.1,
    sousCategories: [
      "Charpente bois",
      "Réparation",
      "Renforcement",
      "Traitement",
      "Modification de charpente",
      "Pose de structure photovoltaïque",
    ],
  },
  {
    id: "ravalement-facade",
    nom: "Ravalement de façade",
    tauxTvaDefaut: 0.1,
    sousCategories: [
      "Nettoyage",
      "Enduit",
      "Peinture de façade",
      "Isolation extérieure",
      "Réparation de fissures",
      "Traitement de façade",
    ],
  },
  {
    id: "pompe-a-chaleur",
    nom: "Pompe à chaleur",
    tauxTvaDefaut: 0.055,
    sousCategories: [
      "PAC air/eau",
      "PAC air/eau haute température",
      "PAC air/air",
      "PAC piscine",
      "PAC géothermique",
      "Remplacement de chaudière",
      "Désembouage",
      "Mise en service",
      "Entretien",
    ],
  },
  {
    id: "double-vitrage",
    nom: "Double vitrage",
    tauxTvaDefaut: 0.055,
    sousCategories: [
      "Remplacement de vitrage",
      "Fenêtre double vitrage",
      "Porte-fenêtre double vitrage",
      "Vitrage phonique",
      "Vitrage sécurité",
      "Vitrage à contrôle solaire",
    ],
  },
  {
    id: "renovation-globale",
    nom: "Rénovation globale",
    tauxTvaDefaut: 0.055,
    sousCategories: [
      "Rénovation énergétique",
      "Rénovation intérieure",
      "Rénovation extérieure",
      "Rénovation globale avec accompagnement",
      "Bouquet de travaux",
      "Travaux induits",
    ],
  },
  {
    id: "poele-bois-granules",
    nom: "Poêle à bois et granulés",
    tauxTvaDefaut: 0.055,
    sousCategories: [
      "Poêle à bois",
      "Poêle à granulés",
      "Conduit de fumée",
      "Tubage",
      "Ramonage",
      "Entretien",
    ],
  },
  {
    id: "chauffe-eau-solaire",
    nom: "Chauffe-eau solaire",
    tauxTvaDefaut: 0.055,
    sousCategories: [
      "Chauffe-eau solaire individuel",
      "Capteurs solaires thermiques",
      "Ballon solaire",
      "Station solaire",
      "Régulation",
      "Entretien",
    ],
  },
  {
    id: "piscine",
    nom: "Piscine",
    tauxTvaDefaut: 0.2,
    sousCategories: [
      "PAC piscine",
      "Panneaux solaires thermiques",
      "Filtration",
      "Pompe de filtration",
      "By-pass",
      "Couverture",
      "Étanchéité",
      "Rénovation de piscine",
    ],
  },
  {
    id: "mobilite-electrique",
    nom: "Mobilité électrique",
    tauxTvaDefaut: 0.2,
    sousCategories: [
      "Borne de recharge 3,7 kW",
      "Borne de recharge 7,4 kW",
      "Borne de recharge 11 kW",
      "Borne de recharge 22 kW",
      "Recharge pilotée par solaire",
      "Délestage dynamique",
      "Mise aux normes électriques",
    ],
  },
  {
    id: "frais-administratifs-coordination",
    nom: "Frais administratifs et coordination",
    tauxTvaDefaut: 0.2,
    sousCategories: [
      "Frais administratifs",
      "Prestation Clyve",
      "Coordination",
      "Pilotage",
      "Suivi de chantier",
      "Gestion de projet",
      "Déplacements",
      "Aléas techniques",
    ],
  },
];

function slugifier(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const CATEGORIES_METIERS: CategorieMetier[] = DEFINITIONS.map((def, index) => ({
  id: def.id,
  nom: def.nom,
  ordre: index + 1,
  tauxTvaDefaut: def.tauxTvaDefaut,
}));

export const SOUS_CATEGORIES_METIERS: SousCategorieMetier[] = DEFINITIONS.flatMap((def) =>
  def.sousCategories.map((nom, index) => ({
    id: `${def.id}__${slugifier(nom)}`,
    categorieId: def.id,
    nom,
    ordre: index + 1,
  })),
);

export function getCategorieMetier(id: string): CategorieMetier | undefined {
  return CATEGORIES_METIERS.find((item) => item.id === id);
}

export function getSousCategorieMetier(id: string): SousCategorieMetier | undefined {
  return SOUS_CATEGORIES_METIERS.find((item) => item.id === id);
}

export function sousCategoriesDe(categorieId: string): SousCategorieMetier[] {
  return SOUS_CATEGORIES_METIERS.filter((item) => item.categorieId === categorieId).sort(
    (a, b) => a.ordre - b.ordre,
  );
}

export function sousCategorieAppartientA(sousCategorieId: string, categorieId: string): boolean {
  const sous = getSousCategorieMetier(sousCategorieId);
  return Boolean(sous && sous.categorieId === categorieId);
}

export function labelTva(taux: number): string {
  return `${(taux * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
}
