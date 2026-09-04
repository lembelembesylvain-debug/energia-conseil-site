/**
 * Types du module de chiffrage rénovation d’ampleur — ENERGIA CONSEIL IA® 2026.
 *
 * Aucun tarif fournisseur n’est embarqué : les coûts entrants sont saisis
 * par l’utilisateur et toujours rattachés à une source explicite.
 */

/** Unités de métrés autorisées dans la grille. */
export type UnitePoste = "forfait" | "m2" | "ml" | "unite" | "kWc" | "panneau";

/**
 * Origine du coût entrant. Ne jamais laisser un prix sans source.
 * - tarif_fournisseur_verifie : grille / tarif du fournisseur, date de vérif renseignée
 * - devis_sous_traitant : devis d’entreprise RGE ou sous-traitant
 * - estimation_marche : ordre de grandeur de marché, non contractuel
 * - hypothese_provisoire : valeur de travail en attendant un devis
 */
export type SourcePrix =
  | "tarif_fournisseur_verifie"
  | "devis_sous_traitant"
  | "estimation_marche"
  | "hypothese_provisoire";

export type ComplexiteChantier = "standard" | "complexe";

export type NiveauScenario = "essentiel" | "performance" | "excellence";

export type TauxTva = 0.055 | 0.1 | 0.2;

export type CategoriePoste = "etude" | "enveloppe" | "equipement" | "chantier" | "structure";

export type PosteId =
  | "audit_etude"
  | "isolation_combles"
  | "isolation_rampants"
  | "ite"
  | "iti"
  | "isolation_planchers"
  | "fenetres_portes_fenetres"
  | "pac_air_eau"
  | "pac_air_air"
  | "vmc_simple_flux"
  | "vmc_double_flux"
  | "ballon_thermodynamique"
  | "panneaux_photovoltaiques"
  | "depose_evacuation"
  | "finitions"
  | "coordination_pilotage"
  | "frais_administratifs"
  | "aleas_techniques";

/** Définition catalogue d’un poste (sans prix inventé). */
export type PosteCatalogue = {
  id: PosteId;
  nom: string;
  unite: UnitePoste;
  categorie: CategoriePoste;
  /** Si faux, les taux d’aléas / pilotage ne s’appliquent pas (poste déjà un overhead). */
  appliqueAleas: boolean;
  appliquePilotage: boolean;
  description: string;
};

/** Saisie utilisateur pour une ligne de grille. */
export type PosteSaisie = {
  id: PosteId;
  inclus: boolean;
  nom: string;
  unite: UnitePoste;
  quantite: number;
  /** Coût unitaire HT fournisseur / sous-traitant. null = non renseigné. */
  coutEntrantUnitaireHt: number | null;
  tauxAleas: number;
  tauxPilotage: number;
  fraisComplementaires: number;
  /** Taux de marge sur le prix de vente HT (ex. 0,10 pour 10 %). */
  tauxMarge: number;
  tauxTva: TauxTva;
  sourcePrix: SourcePrix;
  dateVerification: string | null;
  commentaire: string;
};

export type PosteCalcule = PosteSaisie & {
  coutEntrantTotalHt: number | null;
  montantAleas: number | null;
  montantPilotage: number | null;
  coutInterne: number | null;
  montantMarge: number | null;
  prixSortantHt: number | null;
  montantTva: number | null;
  prixSortantTtc: number | null;
  prixRenseigne: boolean;
  dateObsolete: boolean;
};

export type SourceDistance = "saisie_manuelle" | "calcul_cartographique";

export type TypeVisiteEnergia =
  | "audit_initial"
  | "visite_metres"
  | "reunion_lancement"
  | "suivi_chantier"
  | "reception"
  | "autre";

/** Coûts kilométriques et annexes — toujours configurables, jamais imposés en dur. */
export type ParametresDeplacement = {
  coutKilometriqueEnergiaHt: number | null;
  coutKilometriqueArtisanHt: number | null;
  coutPeageHt: number;
  coutStationnementHt: number;
  /** Coût horaire optionnel du temps de trajet (null = non appliqué). */
  coutHoraireTempsDeplacementHt: number | null;
};

export type VisiteEnergiaSaisie = {
  id: TypeVisiteEnergia;
  libelle: string;
  nombre: number;
  inclus: boolean;
};

export type DeplacementArtisanSaisie = {
  id: string;
  nomArtisan: string;
  adresseDepart: string;
  distanceAllerRetourKm: number | null;
  sourceDistance: SourceDistance;
  nombreDeplacements: number;
  coutKilometriqueHt: number | null;
  coutPeageHt: number;
  coutStationnementHt: number;
  tempsTrajetHeures: number | null;
  fraisFacturesArtisanHt: number;
  deplacementDejaInclusDansDevis: boolean;
  sourceCout: SourcePrix;
  dateVerification: string | null;
  commentaire: string;
};

export type DeplacementEnergiaSaisie = {
  adresseDepart: string;
  distanceAllerRetourKm: number | null;
  sourceDistance: SourceDistance;
  visites: VisiteEnergiaSaisie[];
  coutKilometriqueHt: number | null;
  coutPeageHt: number;
  coutStationnementHt: number;
  tempsTrajetHeures: number | null;
  sourceCout: SourcePrix;
  dateVerification: string | null;
  commentaire: string;
};

export type DeplacementsSaisie = {
  artisans: DeplacementArtisanSaisie[];
  energia: DeplacementEnergiaSaisie;
};

export type DeplacementArtisanCalcule = DeplacementArtisanSaisie & {
  adresseChantier: string;
  distanceTotaleKm: number | null;
  fraisKmHt: number | null;
  fraisTempsHt: number | null;
  fraisEstimesHt: number | null;
  fraisAjoutesHt: number;
  estimationComplete: boolean;
  statutFacturation: "inclus_dans_devis" | "ajoute_separement";
};

export type DeplacementEnergiaCalcule = DeplacementEnergiaSaisie & {
  libelle: string;
  adresseChantier: string;
  nombreVisites: number;
  distanceTotaleKm: number | null;
  fraisKmHt: number | null;
  fraisTempsHt: number | null;
  fraisDeplacementHt: number | null;
  estimationComplete: boolean;
};

export type ResultatDeplacements = {
  artisans: DeplacementArtisanCalcule[];
  energia: DeplacementEnergiaCalcule;
  totalArtisansEstimesHt: number;
  totalArtisansAjoutesHt: number;
  totalEnergiaHt: number;
  totalAjoutesHt: number;
  definitif: boolean;
};

export type LigneCommercialeClient = {
  id: string;
  libelle: string;
  montantHt: number;
};

/** Ligne commerciale détaillée — prix client uniquement, sans coûts internes. */
export type LigneDevisClientDetail = {
  id: string;
  designation: string;
  quantite: number;
  unite: string;
  prixUnitaireHt: number;
  montantHt: number;
  tauxTva: number;
  montantTva: number;
  montantTtc: number;
};

export type DevisClientChiffrage = {
  lignes: LigneCommercialeClient[];
  lignesDetaillees: LigneDevisClientDetail[];
  totalHt: number;
  totalTva: number;
  totalTtc: number;
};

export type ParametresChiffrage = {
  anneeReference: 2026;
  complexite: ComplexiteChantier;
  tauxAleas: number;
  tauxPilotage: number;
  /** Marge cible sur le prix de vente HT (pas une majoration du coût). */
  tauxMarge: number;
  tauxTvaDefaut: TauxTva;
  /** Frais de structure globaux HT (saisie libre, jamais inventés). */
  fraisStructureHt: number;
  libelleProjet: string;
  adresseChantier: string;
  /** Base opérationnelle ENERGIA — ne s’applique jamais aux artisans. */
  adresseDepartEnergia: string;
  deplacement: ParametresDeplacement;
};

export type TotauxChiffrage = {
  totalEntrantHt: number;
  totalDeplacementsArtisansAjoutesHt: number;
  totalDeplacementsEnergiaHt: number;
  totalDeplacementsAjoutesHt: number;
  totalAleas: number;
  totalPilotage: number;
  totalFraisComplementaires: number;
  totalFraisStructure: number;
  totalCoutInterne: number;
  totalMargeEuros: number;
  tauxMargeReel: number | null;
  totalSortantHt: number;
  totalTva: number;
  totalSortantTtc: number;
  nbPostesInclus: number;
  nbPostesPrixRenseignes: number;
  nbPostesPrixManquants: number;
  nbPostesVerifies: number;
  budgetAffichable: boolean;
  deplacementsDefinitifs: boolean;
};

export type AvertissementChiffrage = {
  id: string;
  niveau: "info" | "warning" | "critique";
  message: string;
};

export type AideEstimative = {
  id: string;
  libelle: string;
  organisme: string;
  conditionsAVerifier: string;
  dateValidite: string;
  montantEstimatif: number | null;
  montantRetenu: number;
  commentaire: string;
};

export type RecapAides = {
  totalEstimatif: number;
  /** Somme saisie par l’utilisateur, avant plafonnement. */
  totalRetenuSaisi: number;
  /** Montant retenu dans la simulation : jamais supérieur au TTC des travaux. */
  totalRetenu: number;
  resteAChargeEstimatif: number | null;
  aidesSuperieuresAuxTravaux: boolean;
  plafondApplique: boolean;
};

export type ResultatChiffrage = {
  parametres: ParametresChiffrage;
  lignes: PosteCalcule[];
  totaux: TotauxChiffrage;
  aides: AideEstimative[];
  recapAides: RecapAides;
  deplacements: ResultatDeplacements;
  devisClient: DevisClientChiffrage;
  avertissements: AvertissementChiffrage[];
};

export type ScenarioAmpleur = {
  id: NiveauScenario;
  nom: string;
  icone: string;
  couleur: string;
  recommande: boolean;
  synthese: string;
  postesInclus: PosteId[];
};
