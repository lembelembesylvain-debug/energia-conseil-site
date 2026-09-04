/**
 * Seed du catalogue métiers.
 *
 * - Prestations existantes du module chiffrage : reprises sans tarif inventé.
 * - Quelques lignes clairement marquées « données de démonstration ».
 * Aucun tarif fictif n’est attribué aux autres fiches.
 */

import { CATALOGUE_POSTES } from "../../chiffrage/catalogue-postes";
import { SOUS_CATEGORIES_METIERS } from "./categories";
import type { PrestationCatalogue, TauxTvaCatalogue, UnitePrestation } from "./types";

const DATE_SEED = "2026-09-04";

function sousId(categorieId: string, nom: string): string {
  const found = SOUS_CATEGORIES_METIERS.find(
    (item) => item.categorieId === categorieId && item.nom === nom,
  );
  if (!found) {
    throw new Error(`Sous-catégorie introuvable : ${categorieId} / ${nom}`);
  }
  return found.id;
}

function fiche(partial: Omit<PrestationCatalogue, "dateMiseAJour" | "actif">): PrestationCatalogue {
  return {
    ...partial,
    dateMiseAJour: DATE_SEED,
    actif: true,
  };
}

type MappingLegacy = {
  posteId: string;
  categorieId: string;
  sousCategorieNom: string;
  tauxTva: TauxTvaCatalogue;
  unite: UnitePrestation;
  notes?: string;
};

const MAPPING_POSTES_EXISTANTS: MappingLegacy[] = [
  {
    posteId: "audit_etude",
    categorieId: "etude-accompagnement",
    sousCategorieNom: "Audit énergétique",
    tauxTva: 0.2,
    unite: "forfait",
  },
  {
    posteId: "isolation_combles",
    categorieId: "isolation",
    sousCategorieNom: "Isolation des combles perdus",
    tauxTva: 0.055,
    unite: "m²",
  },
  {
    posteId: "isolation_rampants",
    categorieId: "isolation",
    sousCategorieNom: "Isolation des rampants",
    tauxTva: 0.055,
    unite: "m²",
  },
  {
    posteId: "ite",
    categorieId: "isolation",
    sousCategorieNom: "Isolation des murs par l’extérieur",
    tauxTva: 0.055,
    unite: "m²",
  },
  {
    posteId: "iti",
    categorieId: "isolation",
    sousCategorieNom: "Isolation des murs par l’intérieur",
    tauxTva: 0.055,
    unite: "m²",
  },
  {
    posteId: "isolation_planchers",
    categorieId: "isolation",
    sousCategorieNom: "Isolation du plancher bas",
    tauxTva: 0.055,
    unite: "m²",
  },
  {
    posteId: "fenetres_portes_fenetres",
    categorieId: "menuiserie",
    sousCategorieNom: "Fenêtres aluminium",
    tauxTva: 0.055,
    unite: "u",
  },
  {
    posteId: "pac_air_eau",
    categorieId: "pompe-a-chaleur",
    sousCategorieNom: "PAC air/eau",
    tauxTva: 0.055,
    unite: "forfait",
  },
  {
    posteId: "pac_air_air",
    categorieId: "pompe-a-chaleur",
    sousCategorieNom: "PAC air/air",
    tauxTva: 0.055,
    unite: "u",
  },
  {
    posteId: "vmc_simple_flux",
    categorieId: "electricite",
    sousCategorieNom: "VMC et alimentation électrique",
    tauxTva: 0.055,
    unite: "forfait",
  },
  {
    posteId: "vmc_double_flux",
    categorieId: "electricite",
    sousCategorieNom: "VMC et alimentation électrique",
    tauxTva: 0.055,
    unite: "forfait",
  },
  {
    posteId: "ballon_thermodynamique",
    categorieId: "plomberie-sanitaire",
    sousCategorieNom: "Ballon d’eau chaude",
    tauxTva: 0.055,
    unite: "forfait",
  },
  {
    posteId: "panneaux_photovoltaiques",
    categorieId: "photovoltaique",
    sousCategorieNom: "Panneaux photovoltaïques",
    tauxTva: 0.055,
    unite: "kWc",
    notes:
      "TVA 5,5 % si puissance ≤ 9 kWc (hypothèse à vérifier) ; 20 % au-delà. Primes et tarifs de rachat : voir données réglementaires, jamais définitifs sans source validée.",
  },
  {
    posteId: "depose_evacuation",
    categorieId: "demolition",
    sousCategorieNom: "Évacuation des déchets",
    tauxTva: 0.2,
    unite: "forfait",
  },
  {
    posteId: "finitions",
    categorieId: "peinture",
    sousCategorieNom: "Finitions",
    tauxTva: 0.1,
    unite: "forfait",
  },
  {
    posteId: "coordination_pilotage",
    categorieId: "frais-administratifs-coordination",
    sousCategorieNom: "Coordination",
    tauxTva: 0.2,
    unite: "forfait",
  },
  {
    posteId: "frais_administratifs",
    categorieId: "frais-administratifs-coordination",
    sousCategorieNom: "Frais administratifs",
    tauxTva: 0.2,
    unite: "forfait",
  },
  {
    posteId: "aleas_techniques",
    categorieId: "frais-administratifs-coordination",
    sousCategorieNom: "Aléas techniques",
    tauxTva: 0.2,
    unite: "forfait",
  },
];

function uniteDepuisChiffrage(unite: string): UnitePrestation {
  if (unite === "m2") return "m²";
  if (unite === "ml") return "ml";
  if (unite === "unite") return "u";
  if (unite === "kWc") return "kWc";
  return "forfait";
}

const PRESTATIONS_COMPATIBLES: PrestationCatalogue[] = MAPPING_POSTES_EXISTANTS.map((mapping) => {
  const poste = CATALOGUE_POSTES.find((item) => item.id === mapping.posteId);
  return fiche({
    id: `compat-${mapping.posteId}`,
    categorieId: mapping.categorieId,
    sousCategorieId: sousId(mapping.categorieId, mapping.sousCategorieNom),
    nom: poste?.nom ?? mapping.posteId,
    description: poste?.description ?? "",
    unite: poste ? uniteDepuisChiffrage(poste.unite) : mapping.unite,
    coutMaterielHt: null,
    coutMainOeuvreHt: null,
    prixVenteHt: null,
    tauxTva: mapping.tauxTva,
    artisan: "",
    statut: "estimation",
    garantie: "",
    aides: "",
    notes:
      mapping.notes ??
      "Prestation existante du module chiffrage, rattachée à la hiérarchie métiers. Tarif à renseigner à partir d’un devis réel.",
    demo: false,
    posteIdLegacy: mapping.posteId,
  });
});

/** Quelques lignes de test — ne jamais les traiter comme des tarifs validés. */
const PRESTATIONS_DEMO: PrestationCatalogue[] = [
  fiche({
    id: "demo-isolation-combles-soufflee",
    categorieId: "isolation",
    sousCategorieId: sousId("isolation", "Isolation des combles perdus"),
    nom: "Isolation combles perdus soufflée — donnée de démonstration",
    description:
      "Exemple pédagogique : ouate de cellulose soufflée, R ≥ 7. Tarifs fictifs destinés uniquement à tester les calculs de marge.",
    unite: "m²",
    coutMaterielHt: 12,
    coutMainOeuvreHt: 8,
    prixVenteHt: 28,
    tauxTva: 0.055,
    artisan: "Artisan démo RGE",
    statut: "estimation",
    garantie: "Décennale (exemple)",
    aides: "MaPrimeRénov’ / CEE — estimation à titre indicatif",
    notes: "DONNÉES DE DÉMONSTRATION — ne pas utiliser sur un projet client.",
    demo: true,
    posteIdLegacy: "isolation_combles",
  }),
  fiche({
    id: "demo-plafond-tendu-pvc",
    categorieId: "plafonds-tendus",
    sousCategorieId: sousId("plafonds-tendus", "Plafond tendu PVC"),
    nom: "Plafond tendu PVC pièce — donnée de démonstration",
    description:
      "Exemple pédagogique : toile PVC mate, profils périphériques. Tarifs fictifs de test.",
    unite: "m²",
    coutMaterielHt: 35,
    coutMainOeuvreHt: 25,
    prixVenteHt: 85,
    tauxTva: 0.2,
    artisan: "Artisan démo plafonds",
    statut: "devis_recu",
    garantie: "2 ans (exemple)",
    aides: "",
    notes: "DONNÉES DE DÉMONSTRATION — ne pas utiliser sur un projet client.",
    demo: true,
    posteIdLegacy: null,
  }),
  fiche({
    id: "demo-peinture-interieure",
    categorieId: "peinture",
    sousCategorieId: sousId("peinture", "Peinture intérieure"),
    nom: "Peinture intérieure murs et plafonds — donnée de démonstration",
    description:
      "Exemple pédagogique : deux couches acrylique, préparation légère. Tarifs fictifs de test.",
    unite: "m²",
    coutMaterielHt: 4,
    coutMainOeuvreHt: 12,
    prixVenteHt: 22,
    tauxTva: 0.1,
    artisan: "Artisan démo peinture",
    statut: "estimation",
    garantie: "",
    aides: "",
    notes: "DONNÉES DE DÉMONSTRATION — ne pas utiliser sur un projet client.",
    demo: true,
    posteIdLegacy: null,
  }),
  fiche({
    id: "demo-pac-air-eau",
    categorieId: "pompe-a-chaleur",
    sousCategorieId: sousId("pompe-a-chaleur", "PAC air/eau"),
    nom: "PAC air/eau 8 kW — donnée de démonstration",
    description:
      "Exemple pédagogique : PAC air-eau dimensionnée post-isolation, COP ≥ 4. Tarifs fictifs de test.",
    unite: "forfait",
    coutMaterielHt: 4500,
    coutMainOeuvreHt: 2200,
    prixVenteHt: 8900,
    tauxTva: 0.055,
    artisan: "Artisan démo PAC",
    statut: "estimation",
    garantie: "Décennale + constructeur (exemple)",
    aides: "MaPrimeRénov’ / CEE — estimation à titre indicatif",
    notes: "DONNÉES DE DÉMONSTRATION — ne pas utiliser sur un projet client.",
    demo: true,
    posteIdLegacy: "pac_air_eau",
  }),
  fiche({
    id: "demo-coordination-amo",
    categorieId: "frais-administratifs-coordination",
    sousCategorieId: sousId("frais-administratifs-coordination", "Coordination"),
    nom: "Coordination AMO — donnée de démonstration",
    description:
      "Exemple pédagogique : coordination de chantier ENERGIA. Tarifs fictifs de test.",
    unite: "forfait",
    coutMaterielHt: 0,
    coutMainOeuvreHt: 800,
    prixVenteHt: 1200,
    tauxTva: 0.2,
    artisan: "ENERGIA CONSEIL IA®",
    statut: "estimation",
    garantie: "",
    aides: "",
    notes: "DONNÉES DE DÉMONSTRATION — ne pas utiliser sur un projet client.",
    demo: true,
    posteIdLegacy: "coordination_pilotage",
  }),
];

const AIDES_PV_INDICATIF =
  "Aides financières 2026 (estimation à titre indicatif). Aucune prime ni tarif de rachat n’est définitif sans source validée. Aides à valider selon revenus réels. Montants définitifs après instruction ANAH et CEE.";

type TarifPv = {
  id: string;
  sousCategorieNom: string;
  nom: string;
  description: string;
  unite: UnitePrestation;
  coutMaterielHt: number | null;
  coutMainOeuvreHt: number | null;
  prixVenteHt: number | null;
  tauxTva?: TauxTvaCatalogue;
  garantie: string;
  aides?: string;
  notes?: string;
};

function fichePv(item: TarifPv): PrestationCatalogue {
  return fiche({
    id: item.id,
    categorieId: "photovoltaique",
    sousCategorieId: sousId("photovoltaique", item.sousCategorieNom),
    nom: item.nom,
    description: item.description,
    unite: item.unite,
    coutMaterielHt: item.coutMaterielHt,
    coutMainOeuvreHt: item.coutMainOeuvreHt,
    prixVenteHt: item.prixVenteHt,
    tauxTva: item.tauxTva ?? 0.055,
    artisan: "RGE QualiPV — à confirmer",
    statut: "estimation",
    garantie: item.garantie,
    aides: item.aides ?? AIDES_PV_INDICATIF,
    notes:
      item.notes ??
      "Tarifs HT 2026 à titre d’estimation catalogue. Estimation à confirmer par devis fournisseur ou artisan. TVA 5,5 % si puissance ≤ 9 kWc (à vérifier), 20 % au-delà.",
    demo: false,
    posteIdLegacy: null,
  });
}

/**
 * Fiches précises catégorie 20. Photovoltaïque.
 * Prix HT indicatifs 2026 (fourniture + pose artisan), à confirmer devis réel.
 */
export const PRESTATIONS_PHOTOVOLTAIQUE: PrestationCatalogue[] = [
  fichePv({
    id: "pv-dualsun-flash-500",
    sousCategorieNom: "Installation photovoltaïque",
    nom: "Panneaux DualSun Flash 500Wc",
    description:
      "Module DualSun Flash 500 Wc verre/verre, à poser sur toiture. Compter 2 panneaux par kWc.",
    unite: "panneau",
    coutMaterielHt: 200,
    coutMainOeuvreHt: 50,
    prixVenteHt: 350,
    garantie: "Produit 30 ans / performance 25 ans (constructeur)",
  }),
  fichePv({
    id: "pv-dualsun-spring-500",
    sousCategorieNom: "Installation photovoltaïque",
    nom: "Panneaux DualSun Spring 500Wc (Hybride)",
    description:
      "Module hybride DualSun Spring 500 Wc (photovoltaïque + thermique). Pose toiture, réseau caloporteur à prévoir.",
    unite: "panneau",
    coutMaterielHt: 280,
    coutMainOeuvreHt: 60,
    prixVenteHt: 450,
    garantie: "Produit 30 ans / performance 25 ans (constructeur)",
  }),
  fichePv({
    id: "pv-enphase-iq8plus",
    sousCategorieNom: "Micro-onduleurs",
    nom: "Micro-onduleur Enphase IQ8+ (pour 500Wc)",
    description:
      "Micro-onduleur Enphase IQ8+ associé à un module 500 Wc. Un micro-onduleur par panneau, monitoring Enphase.",
    unite: "u",
    coutMaterielHt: 160,
    coutMainOeuvreHt: 40,
    prixVenteHt: 280,
    garantie: "25 ans constructeur",
  }),
  fichePv({
    id: "pv-enphase-iq8m",
    sousCategorieNom: "Micro-onduleurs",
    nom: "Micro-onduleur Enphase IQ8M (pour 500Wc)",
    description:
      "Micro-onduleur Enphase IQ8M (puissance supérieure à l’IQ8+) pour module 500 Wc. Un par panneau.",
    unite: "u",
    coutMaterielHt: 190,
    coutMainOeuvreHt: 40,
    prixVenteHt: 320,
    garantie: "25 ans constructeur",
  }),
  fichePv({
    id: "pv-huawei-sun2000-3-6",
    sousCategorieNom: "Onduleur centralisé",
    nom: "Onduleur Centralisé Huawei SUN2000 (3-6 kW)",
    description:
      "Onduleur string Huawei SUN2000, gamme 3 à 6 kW, pour installations résidentielles ≤ 9 kWc.",
    unite: "u",
    coutMaterielHt: 900,
    coutMainOeuvreHt: 250,
    prixVenteHt: 1600,
    garantie: "10 ans constructeur",
  }),
  fichePv({
    id: "pv-huawei-sun2000-9-12",
    sousCategorieNom: "Onduleur centralisé",
    nom: "Onduleur Centralisé Huawei SUN2000 (9-12 kW)",
    description:
      "Onduleur string Huawei SUN2000, gamme 9 à 12 kW. Au-delà de 9 kWc : TVA 20 % (barème sept. 2026).",
    unite: "u",
    coutMaterielHt: 1400,
    coutMainOeuvreHt: 300,
    prixVenteHt: 2300,
    garantie: "10 ans constructeur",
    notes:
      "Tarifs HT 2026 à titre d’estimation catalogue. Installation > 9 kWc : TVA 20 %. À confirmer par devis artisan RGE.",
  }),
  fichePv({
    id: "pv-pylontech-h2-3-5",
    sousCategorieNom: "Batterie de stockage",
    nom: "Batterie LFP Pylontech Force H2 (3,5 kWh)",
    description:
      "Module batterie LFP Pylontech Force H2 3,5 kWh. Option de stockage, jamais obligatoire. Dimensionnement indicatif selon puissance, consommation et profil de charge.",
    unite: "u",
    coutMaterielHt: 1200,
    coutMainOeuvreHt: 200,
    prixVenteHt: 1900,
    garantie: "10 ans constructeur",
    aides:
      "Pas d’aide MaPrimeRénov’ spécifique sur le stockage 2026. Prime autoconso liée à l’installation PV — estimation à titre indicatif.",
  }),
  fichePv({
    id: "pv-pylontech-h2-7",
    sousCategorieNom: "Batterie de stockage",
    nom: "Batterie LFP Pylontech Force H2 (7 kWh)",
    description: "Batterie LFP Pylontech Force H2 7 kWh (deux modules 3,5 kWh ou équivalent).",
    unite: "u",
    coutMaterielHt: 2100,
    coutMainOeuvreHt: 250,
    prixVenteHt: 3200,
    garantie: "10 ans constructeur",
    aides:
      "Pas d’aide MaPrimeRénov’ spécifique sur le stockage 2026. Prime autoconso liée à l’installation PV — estimation à titre indicatif.",
  }),
  fichePv({
    id: "pv-pylontech-h2-10",
    sousCategorieNom: "Batterie de stockage",
    nom: "Batterie LFP Pylontech Force H2 (10 kWh)",
    description: "Batterie LFP Pylontech Force H2 10 kWh, usage résidentiel / autoconsommation.",
    unite: "u",
    coutMaterielHt: 2900,
    coutMainOeuvreHt: 300,
    prixVenteHt: 4400,
    garantie: "10 ans constructeur",
    aides:
      "Pas d’aide MaPrimeRénov’ spécifique sur le stockage 2026. Prime autoconso liée à l’installation PV — estimation à titre indicatif.",
  }),
  fichePv({
    id: "pv-huawei-luna-5",
    sousCategorieNom: "Batterie de stockage",
    nom: "Batterie LFP Huawei Luna 2000 (5 kWh)",
    description:
      "Module batterie LFP Huawei LUNA2000 5 kWh, coupleable à un onduleur Huawei SUN2000.",
    unite: "u",
    coutMaterielHt: 1800,
    coutMainOeuvreHt: 250,
    prixVenteHt: 2800,
    garantie: "10 ans constructeur",
    aides:
      "Pas d’aide MaPrimeRénov’ spécifique sur le stockage 2026. Prime autoconso liée à l’installation PV — estimation à titre indicatif.",
  }),
  fichePv({
    id: "pv-huawei-luna-10",
    sousCategorieNom: "Batterie de stockage",
    nom: "Batterie LFP Huawei Luna 2000 (10 kWh)",
    description: "Batterie LFP Huawei LUNA2000 10 kWh (deux modules 5 kWh).",
    unite: "u",
    coutMaterielHt: 3200,
    coutMainOeuvreHt: 300,
    prixVenteHt: 4800,
    garantie: "10 ans constructeur",
    aides:
      "Pas d’aide MaPrimeRénov’ spécifique sur le stockage 2026. Prime autoconso liée à l’installation PV — estimation à titre indicatif.",
  }),
  fichePv({
    id: "pv-pylontech-h2-15",
    sousCategorieNom: "Batterie de stockage",
    nom: "Batterie LFP Pylontech Force H2 (15 kWh)",
    description:
      "Assemblage de modules Pylontech Force H2 3,5 kWh pour viser 15 kWh. Estimation à confirmer par devis réel.",
    unite: "u",
    coutMaterielHt: 4800,
    coutMainOeuvreHt: 450,
    prixVenteHt: 7200,
    garantie: "10 ans constructeur",
    aides:
      "Pas d’aide MaPrimeRénov’ spécifique sur le stockage 2026. Prime autoconso liée à l’installation PV — estimation à titre indicatif.",
  }),
  fichePv({
    id: "pv-pylontech-h2-20",
    sousCategorieNom: "Batterie de stockage",
    nom: "Batterie LFP Pylontech Force H2 (20 kWh)",
    description:
      "Assemblage de modules Pylontech Force H2 3,5 kWh pour viser 20 kWh. Estimation à confirmer par devis réel.",
    unite: "u",
    coutMaterielHt: 7200,
    coutMainOeuvreHt: 550,
    prixVenteHt: 10500,
    garantie: "10 ans constructeur",
    aides:
      "Pas d’aide MaPrimeRénov’ spécifique sur le stockage 2026. Prime autoconso liée à l’installation PV — estimation à titre indicatif.",
  }),
  fichePv({
    id: "pv-pylontech-h2-30",
    sousCategorieNom: "Batterie de stockage",
    nom: "Batterie LFP Pylontech Force H2 (30 kWh)",
    description:
      "Assemblage de modules Pylontech Force H2 3,5 kWh pour viser 30 kWh. Estimation à confirmer par devis réel.",
    unite: "u",
    coutMaterielHt: 10800,
    coutMainOeuvreHt: 750,
    prixVenteHt: 15750,
    garantie: "10 ans constructeur",
    aides:
      "Pas d’aide MaPrimeRénov’ spécifique sur le stockage 2026. Prime autoconso liée à l’installation PV — estimation à titre indicatif.",
  }),
  fichePv({
    id: "pv-huawei-luna-15",
    sousCategorieNom: "Batterie de stockage",
    nom: "Batterie LFP Huawei Luna 2000 (15 kWh)",
    description:
      "Trois modules Huawei LUNA2000 5 kWh. Estimation à confirmer par devis réel.",
    unite: "u",
    coutMaterielHt: 5400,
    coutMainOeuvreHt: 550,
    prixVenteHt: 7800,
    garantie: "10 ans constructeur",
    aides:
      "Pas d’aide MaPrimeRénov’ spécifique sur le stockage 2026. Prime autoconso liée à l’installation PV — estimation à titre indicatif.",
  }),
  fichePv({
    id: "pv-huawei-luna-20",
    sousCategorieNom: "Batterie de stockage",
    nom: "Batterie LFP Huawei Luna 2000 (20 kWh)",
    description:
      "Quatre modules Huawei LUNA2000 5 kWh. Estimation à confirmer par devis réel.",
    unite: "u",
    coutMaterielHt: 7200,
    coutMainOeuvreHt: 650,
    prixVenteHt: 10200,
    garantie: "10 ans constructeur",
    aides:
      "Pas d’aide MaPrimeRénov’ spécifique sur le stockage 2026. Prime autoconso liée à l’installation PV — estimation à titre indicatif.",
  }),
  fichePv({
    id: "pv-huawei-luna-30",
    sousCategorieNom: "Batterie de stockage",
    nom: "Batterie LFP Huawei Luna 2000 (30 kWh)",
    description:
      "Six modules Huawei LUNA2000 5 kWh. Estimation à confirmer par devis réel.",
    unite: "u",
    coutMaterielHt: 10800,
    coutMainOeuvreHt: 850,
    prixVenteHt: 15000,
    garantie: "10 ans constructeur",
    aides:
      "Pas d’aide MaPrimeRénov’ spécifique sur le stockage 2026. Prime autoconso liée à l’installation PV — estimation à titre indicatif.",
  }),
  fichePv({
    id: "pv-coffret-ac-dc",
    sousCategorieNom: "Coffret de protection",
    nom: "Coffret de protection AC/DC",
    description:
      "Forfait fixe par installation : coffret AC/DC, parafoudres et protections. Quantité 1, jamais multiplié par le nombre de panneaux.",
    unite: "forfait",
    coutMaterielHt: 220,
    coutMainOeuvreHt: 180,
    prixVenteHt: 520,
    garantie: "",
    aides: "",
  }),
  fichePv({
    id: "pv-rails-fixations",
    sousCategorieNom: "Structure et fixations",
    nom: "Rails et fixations (par panneau)",
    description:
      "Structure de pose proportionnelle au nombre de panneaux, avec kit minimum de 4. Estimation à confirmer par devis réel selon toiture.",
    unite: "u",
    coutMaterielHt: 28,
    coutMainOeuvreHt: 18,
    prixVenteHt: 65,
    garantie: "",
    aides: "",
  }),
  fichePv({
    id: "pv-cables-connectique",
    sousCategorieNom: "Câbles et connectique",
    nom: "Câbles et connectique (part variable)",
    description:
      "Part variable : lots supplémentaires au-delà du forfait de base (1 lot pour 6 panneaux après le premier). Ne pas appliquer une règle de trois à toute l’installation.",
    unite: "u",
    coutMaterielHt: 85,
    coutMainOeuvreHt: 45,
    prixVenteHt: 180,
    garantie: "",
    aides: "",
  }),
  fichePv({
    id: "pv-cables-forfait-base",
    sousCategorieNom: "Câbles et connectique",
    nom: "Câbles et connectique (part fixe)",
    description:
      "Forfait de base câbles DC/AC et connectique par installation. Quantité 1. Complété éventuellement par la part variable.",
    unite: "forfait",
    coutMaterielHt: 85,
    coutMainOeuvreHt: 45,
    prixVenteHt: 180,
    garantie: "",
    aides: "",
  }),
  fichePv({
    id: "pv-crochets-supports",
    sousCategorieNom: "Crochets et supports",
    nom: "Crochets et supports (par panneau)",
    description:
      "Crochets / supports proportionnels au nombre de panneaux, minimum 4. Distinct des rails. N’activer que si non inclus dans « Rails et fixations ».",
    unite: "u",
    coutMaterielHt: null,
    coutMainOeuvreHt: null,
    prixVenteHt: null,
    garantie: "",
    aides: "",
    notes:
      "Aucun tarif fournisseur inventé. Estimation à confirmer par devis fournisseur ou artisan. Éviter le double comptage avec les rails.",
  }),
  fichePv({
    id: "pv-pose-forfait",
    sousCategorieNom: "Pose photovoltaïque",
    nom: "Pose photovoltaïque (part fixe)",
    description:
      "Part fixe de pose artisan par installation. Quantité 1. Ne pas cumuler avec la main-d’œuvre déjà incluse dans les équipements.",
    unite: "forfait",
    coutMaterielHt: null,
    coutMainOeuvreHt: null,
    prixVenteHt: null,
    garantie: "",
    aides: "",
    notes:
      "Aucun tarif fournisseur inventé. Estimation à confirmer par devis fournisseur ou artisan. Éviter le double comptage avec la MO des panneaux / onduleurs.",
  }),
  fichePv({
    id: "pv-pose-variable",
    sousCategorieNom: "Pose photovoltaïque",
    nom: "Pose photovoltaïque (part variable)",
    description:
      "Part variable de pose artisan, proportionnelle au nombre de panneaux. Ne pas cumuler avec la MO déjà incluse dans les équipements.",
    unite: "panneau",
    coutMaterielHt: null,
    coutMainOeuvreHt: null,
    prixVenteHt: null,
    garantie: "",
    aides: "",
    notes:
      "Aucun tarif fournisseur inventé. Estimation à confirmer par devis fournisseur ou artisan.",
  }),
  fichePv({
    id: "pv-mise-a-la-terre",
    sousCategorieNom: "Mise à la terre",
    nom: "Mise à la terre",
    description: "Forfait liaison équipotentielle et mise à la terre. Quantité 1, distinct des protections complémentaires.",
    unite: "forfait",
    coutMaterielHt: 90,
    coutMainOeuvreHt: 160,
    prixVenteHt: 390,
    garantie: "",
    aides: "",
  }),
  fichePv({
    id: "pv-calepinage",
    sousCategorieNom: "Calepinage",
    nom: "Calepinage et étude d’implantation",
    description: "Forfait étude d’implantation, ombrage et calepinage. Quantité 1.",
    unite: "forfait",
    coutMaterielHt: 0,
    coutMainOeuvreHt: 220,
    prixVenteHt: 380,
    garantie: "",
    aides: "",
  }),
  fichePv({
    id: "pv-raccordement-enedis-consuel",
    sousCategorieNom: "Raccordement",
    nom: "Raccordement Enedis",
    description:
      "Forfait raccordement Enedis (C01/C08 selon puissance). Démarches administratives et Consuel en lignes séparées. Quantité 1.",
    unite: "forfait",
    coutMaterielHt: 150,
    coutMainOeuvreHt: 120,
    prixVenteHt: 400,
    garantie: "",
    aides: "",
    notes:
      "Montant indicatif 2026. Enedis parfois 0 € en autoconsommation ≤ 36 kVA. Estimation à confirmer par devis fournisseur ou artisan.",
  }),
  fichePv({
    id: "pv-consuel",
    sousCategorieNom: "Consuel",
    nom: "Consuel",
    description: "Forfait attestation Consuel. Quantité 1, distinct du raccordement Enedis.",
    unite: "forfait",
    coutMaterielHt: 80,
    coutMainOeuvreHt: 80,
    prixVenteHt: 250,
    garantie: "",
    aides: "",
  }),
  fichePv({
    id: "pv-mise-en-service",
    sousCategorieNom: "Mise en service",
    nom: "Mise en service",
    description: "Forfait mise en service, tests et réception. Quantité 1.",
    unite: "forfait",
    coutMaterielHt: 0,
    coutMainOeuvreHt: 150,
    prixVenteHt: 280,
    garantie: "",
    aides: "",
  }),
  fichePv({
    id: "pv-monitoring-production",
    sousCategorieNom: "Monitoring",
    nom: "Monitoring de production",
    description: "Forfait supervision de production (passerelle / application). Quantité 1.",
    unite: "forfait",
    coutMaterielHt: 90,
    coutMainOeuvreHt: 50,
    prixVenteHt: 220,
    garantie: "",
    aides: "",
  }),
  fichePv({
    id: "pv-deplacement",
    sousCategorieNom: "Déplacement",
    nom: "Déplacement installation photovoltaïque",
    description: "Forfait déplacement chantier. Quantité 1, sauf configuration particulière.",
    unite: "forfait",
    coutMaterielHt: 0,
    coutMainOeuvreHt: 80,
    prixVenteHt: 180,
    garantie: "",
    aides: "",
  }),
  fichePv({
    id: "pv-maintenance-annuelle",
    sousCategorieNom: "Maintenance",
    nom: "Contrat de maintenance annuelle (PV + Batterie)",
    description:
      "Visite annuelle : contrôle production, onduleurs/micro-onduleurs, batterie LFP, nettoyage visuel, rapport.",
    unite: "forfait",
    coutMaterielHt: 0,
    coutMainOeuvreHt: 180,
    prixVenteHt: 350,
    tauxTva: 0.2,
    garantie: "1 an",
    aides: "",
    notes:
      "Contrat de service annuel — TVA 20 %. Estimation à confirmer par devis fournisseur ou artisan, hors pièces de remplacement.",
  }),
  fichePv({
    id: "pv-protections-complementaires",
    sousCategorieNom: "Protections complémentaires",
    nom: "Protections complémentaires",
    description:
      "Forfait parafoudres / protections additionnelles distinctes du coffret AC/DC. Quantité 1.",
    unite: "forfait",
    coutMaterielHt: null,
    coutMainOeuvreHt: null,
    prixVenteHt: null,
    garantie: "",
    aides: "",
    notes: "Aucun tarif fournisseur inventé. Estimation à confirmer par devis fournisseur ou artisan.",
  }),
  fichePv({
    id: "pv-demarches-administratives",
    sousCategorieNom: "Démarches administratives",
    nom: "Démarches administratives",
    description:
      "Forfait démarches (urbanisme, convention, dossier Enedis hors raccordement technique). Quantité 1.",
    unite: "forfait",
    coutMaterielHt: null,
    coutMainOeuvreHt: null,
    prixVenteHt: null,
    garantie: "",
    aides: "",
    notes: "Aucun tarif fournisseur inventé. Distinct du raccordement Enedis et du Consuel.",
  }),
  fichePv({
    id: "pv-coordination-energia",
    sousCategorieNom: "Coordination ENERGIA",
    nom: "Coordination ENERGIA",
    description:
      "Forfait coordination AMO ENERGIA pour le lot photovoltaïque. Quantité 1. Distinct de la pose artisan et des frais Clyve.",
    unite: "forfait",
    coutMaterielHt: null,
    coutMainOeuvreHt: null,
    prixVenteHt: null,
    garantie: "",
    aides: "",
    notes:
      "Aucun tarif inventé. Ne pas cumuler avec un autre poste de coordination du même projet. Estimation à confirmer.",
  }),
  fichePv({
    id: "pv-frais-clyve",
    sousCategorieNom: "Frais administratifs Clyve",
    nom: "Frais administratifs Clyve",
    description:
      "Coût administratif interne Clyve (500 € HT photovoltaïque). Non facturé au client. Quantité 1. Réservé à la vue administrateur.",
    unite: "forfait",
    coutMaterielHt: 0,
    coutMainOeuvreHt: 500,
    prixVenteHt: null,
    tauxTva: 0.2,
    garantie: "",
    aides: "",
    notes:
      "Charge interne ENERGIA. Ne pas ajouter au devis client. La recette Clyve du récap (500 € HT) reste la règle ; ne pas double-compter.",
  }),
];

export const PRESTATIONS_SEED: PrestationCatalogue[] = [
  ...PRESTATIONS_COMPATIBLES,
  ...PRESTATIONS_PHOTOVOLTAIQUE,
  ...PRESTATIONS_DEMO,
];

export function prestationParPosteLegacy(
  posteId: string,
  prestations: PrestationCatalogue[] = PRESTATIONS_SEED,
): PrestationCatalogue | undefined {
  return prestations.find((item) => item.posteIdLegacy === posteId && !item.demo && item.actif);
}
