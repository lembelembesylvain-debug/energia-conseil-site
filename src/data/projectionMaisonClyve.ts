/** Projections illustratives Maison Clyve — jamais présentées comme photos réelles. */

export const FILIGRANE_PROJECTION = "PROJECTION — NON CONTRACTUELLE";
export const BANDEAU_PROJECTION =
  "PROJECTION ILLUSTRATIVE — APRÈS TRAVAUX — À VALIDER";
export const LEGENDE_PROJECTION =
  "Cette image est une simulation visuelle réalisée à partir des photos disponibles. Elle ne constitue pas une photographie du résultat final, un plan architectural définitif ou un engagement contractuel.";
export const LEGENDE_TERRASSE =
  "Simulation visuelle indicative : nettoyage des abords, création d’une terrasse et restauration esthétique de la façade. Les choix définitifs devront être validés techniquement, financièrement et par le client.";
export const MENTION_PDF_PROJECTION = LEGENDE_PROJECTION;

export type StatutProjection =
  | "PHOTO AVANT CONFIRMÉE"
  | "PROJECTION TECHNIQUE À VALIDER"
  | "PROJECTION WOW À VALIDER"
  | "VALIDÉE PAR HUMAIN"
  | "PHOTO APRÈS TRAVAUX RÉELLE À AJOUTER"
  | "PHOTO APRÈS TRAVAUX REÇUE";

export type VersionProjectionId = "technique" | "wow";

export type VersionProjection = {
  id: VersionProjectionId;
  titre: string;
  statut: Extract<StatutProjection, "PROJECTION TECHNIQUE À VALIDER" | "PROJECTION WOW À VALIDER">;
  src: string;
  resume: string;
};

export type CategorieProjection =
  | "Façade avant"
  | "Façade arrière"
  | "Pignon"
  | "Toiture"
  | "Sous-face de toiture"
  | "Murs et enduits"
  | "Combles"
  | "Menuiseries"
  | "Zones de travaux visibles";

export type PaireProjection = {
  id: string;
  categorie: CategorieProjection;
  photoAvantSrc: string;
  photoAvantNom: string;
  projectionSrc: string;
  travauxRepresentes: string[];
  travauxNonSimules: string[];
  source: string;
  devisOuReco: string;
  elementsConfirmes: string[];
  elementsEstimatifs: string[];
  pointsAValider: string[];
  confiance: "élevé" | "moyen" | "faible";
  statutInitial: StatutProjection;
  categoriePhotoApres?: string;
  versions: VersionProjection[];
  exploitable: boolean;
  noteLimitation?: string;
  legende?: string;
};

function versions(id: string, techniqueResume: string, wowResume: string): VersionProjection[] {
  return [
    {
      id: "technique",
      titre: "A. Projection technique",
      statut: "PROJECTION TECHNIQUE À VALIDER",
      src: `/test-maison-clyve/projections/projection-${id}-technique.png`,
      resume: techniqueResume,
    },
    {
      id: "wow",
      titre: "B. Projection WOW",
      statut: "PROJECTION WOW À VALIDER",
      src: `/test-maison-clyve/projections/projection-${id}-wow.png`,
      resume: wowResume,
    },
  ];
}

export const PAIRES_PROJECTION: PaireProjection[] = [
  {
    id: "facade-avant",
    categorie: "Façade avant",
    photoAvantSrc: "/test-maison-clyve/avant/facade-avant.png",
    photoAvantNom: "FACADE AVANT .png",
    projectionSrc: "/test-maison-clyve/projections/projection-facade-avant-wow.png",
    versions: versions(
      "facade-avant",
      "Toiture régularisée, zinguerie cohérente, enduit clair texturé, menuiseries existantes améliorées. Abords nettoyés.",
      "Même longère, lumière plus chaude, pelouse soignée, plantations sobres. Rendu commercial, maison toujours reconnaissable.",
    ),
    travauxRepresentes: [
      "Tuiles terre cuite homogènes et faîtage visuellement plus régulier",
      "Zinguerie cohérente (chéneaux / descentes — devis Faivre)",
      "Enduit traditionnel clair légèrement texturé (estimatif — reco P2)",
      "Menuiseries existantes améliorées visuellement (emplacements conservés)",
      "Abords nettoyés ; poteau, puits et route conservés",
    ],
    travauxNonSimules: [
      "Remplacement structurel des menuiseries (aucun devis menuiserie)",
      "Grandes baies vitrées inexistantes sur la photo originale",
      "Panneaux photovoltaïques",
      "Pompe à chaleur visible",
      "Démolition de cheminées (2 UN au devis Faivre — lesquelles : non identifiées)",
    ],
    source: "Photo réelle FACADE AVANT .png + devis toiture Faivre / Madinier + reco P1 / P2",
    devisOuReco:
      "Devis Faivre 508-v1 et Madinier EST0001 (toiture, non cumulables). Reco P1 toiture ; reco P2 enduit à vérifier.",
    elementsConfirmes: [
      "Toiture dégradée visible sur la photo avant (EXTRAIT)",
      "Volumétrie de longère, cheminées, ouvertures et puits (EXTRAIT)",
    ],
    elementsEstimatifs: [
      "Modèle de tuile (oméga 10 vs Delta 10) non choisi",
      "Teinte d’enduit",
      "Plantations de la version WOW : illustration, pas un lot paysager devisé",
    ],
    pointsAValider: ["Métrée de toiture unique", "Choix d’un seul devis toiture", "Traitement d’enduit après diagnostic humidité"],
    confiance: "moyen",
    statutInitial: "PROJECTION WOW À VALIDER",
    categoriePhotoApres: "Façade avant",
    exploitable: true,
  },
  {
    id: "facade-arriere",
    categorie: "Façade arrière",
    photoAvantSrc: "/test-maison-clyve/avant/facade-arriere.png",
    photoAvantNom: "FACADE ARRIERE .JPG / facade-arriere.png",
    projectionSrc: "/test-maison-clyve/projections/projection-facade-arriere-wow.png",
    versions: versions(
      "facade-arriere",
      "Couverture et rives remises en ordre, enduit restauré, galerie bois conservée.",
      "Même angle et mêmes arbres, lumière plus valorisante, pelouse plus nette. Galerie et cheminée conservées.",
    ),
    travauxRepresentes: [
      "Couverture et rive de toiture remises en ordre",
      "Zinguerie illustrée",
      "Nettoyage / ragréage d’enduit estimatif",
    ],
    travauxNonSimules: [
      "Remplacement des menuiseries existantes",
      "Transformation de la galerie sur poteaux bois",
      "Photovoltaïque",
      "Ajout de bâtiments annexes (si un volume extra apparaît : artefact, à ignorer)",
    ],
    source: "Photo réelle FACADE ARRIERE (filigrane NEYRAT IMMOBILIER retiré uniquement sur la simulation)",
    devisOuReco: "Devis Faivre / Madinier (toiture). Reco P2 pour l’enduit (À VÉRIFIER).",
    elementsConfirmes: ["Faîtage irrégulier et rive endommagée (EXTRAIT)", "Galerie sur poteaux bois conservée"],
    elementsEstimatifs: ["Teinte et étendue de l’enduit", "Profil exact des chéneaux"],
    pointsAValider: ["État de la charpente de la galerie", "Origine des traces d’humidité en soubassement"],
    confiance: "moyen",
    statutInitial: "PROJECTION WOW À VALIDER",
    categoriePhotoApres: "Façade arrière",
    exploitable: true,
    noteLimitation: "Tout volume bâti supplémentaire éventuellement visible sur la version WOW est un artefact de simulation, non documenté.",
  },
  {
    id: "pignon",
    categorie: "Pignon",
    photoAvantSrc: "/test-maison-clyve/avant/pignon.png",
    photoAvantNom: "PIGNON NORD .JPG / PHOTO-2026-07-28-21-36-39.png",
    projectionSrc: "/test-maison-clyve/projections/projection-pignon-wow.png",
    versions: versions(
      "pignon",
      "Tuiles de rive remises en place, enduit unifié, végétation conservée mais plus nette.",
      "Même cadrage, rive soignée, enduit lumineux, haie conservée.",
    ),
    travauxRepresentes: [
      "Tuiles de rive remises en place",
      "Rive / zinguerie de pignon illustrée (devis Faivre : rives en pignon)",
    ],
    travauxNonSimules: ["Suppression totale de la végétation (non prévue au devis)", "Isolation par l’extérieur"],
    source: "Photos réelles PIGNON NORD .JPG et PHOTO-2026-07-28-21-36-39.png",
    devisOuReco: "Faivre lignes rives en pignon. Végétation : aucune ligne de devis.",
    elementsConfirmes: ["Tuiles manquantes en rive (EXTRAIT)", "Végétation présente (EXTRAIT)"],
    elementsEstimatifs: ["Nettoyage des traces d’humidité sur l’enduit"],
    pointsAValider: ["Faut-il traiter la végétation ? Non documenté à ce jour."],
    confiance: "moyen",
    statutInitial: "PROJECTION WOW À VALIDER",
    categoriePhotoApres: "Pignon",
    exploitable: true,
  },
  {
    id: "pignon-sud",
    categorie: "Pignon",
    photoAvantSrc: "/test-maison-clyve/avant/pignon-sud.jpg",
    photoAvantNom: "PIGNON SUD.JPG",
    projectionSrc: "/test-maison-clyve/projections/projection-pignon-sud-wow.png",
    versions: versions(
      "pignon-sud",
      "Faîtage et tuiles régularisés, enduit nettoyé, sous-face d’égout plus soignée.",
      "Même contre-plongée, toiture homogène, enduit clair, lumière plus nette.",
    ),
    travauxRepresentes: ["Faîtage visuellement régularisé", "Tuiles d’égout réalignées", "Enduit de pignon ragréé (estimatif)"],
    travauxNonSimules: ["Photovoltaïque", "Modification de la pente de toiture"],
    source: "Photo réelle PIGNON SUD.JPG",
    devisOuReco: "Lot toiture Faivre / Madinier (rives, faîtage). Non cumulables.",
    elementsConfirmes: ["Tuiles et faîtage irréguliers (EXTRAIT)", "Câble apparent en rive (EXTRAIT)"],
    elementsEstimatifs: ["Cheminement définitif des réseaux apparents"],
    pointsAValider: ["Traitement des réseaux en façade / rive"],
    confiance: "moyen",
    statutInitial: "PROJECTION WOW À VALIDER",
    categoriePhotoApres: "Pignon",
    exploitable: true,
  },
  {
    id: "toiture-exterieur",
    categorie: "Toiture",
    photoAvantSrc: "/test-maison-clyve/avant/toiture-exterieur.jpg",
    photoAvantNom: "TOITURE EXTERIEUR.jpg",
    projectionSrc: "/test-maison-clyve/projections/projection-toiture-exterieur-wow.png",
    versions: versions(
      "toiture-exterieur",
      "Vue aérienne : couverture plus homogène, faîtage plus lisible, emprise conservée.",
      "Même emprise de longère, tuiles plus nettes. Tout panneau solaire éventuellement visible est un artefact à ignorer.",
    ),
    travauxRepresentes: ["Couverture terre cuite visuellement homogène", "Faîtage plus régulier", "Cheminées conservées"],
    travauxNonSimules: [
      "Panneaux photovoltaïques (implantation non confirmée)",
      "Modification de l’emprise au sol",
    ],
    source: "Photo réelle TOITURE EXTERIEUR.jpg (vue aérienne basse définition)",
    devisOuReco: "Devis toiture Faivre / Madinier — surfaces contradictoires 360 / 450 / 505 m².",
    elementsConfirmes: ["Longère allongée, toiture à deux pans, souches visibles (EXTRAIT, confiance limitée par la résolution)"],
    elementsEstimatifs: [
      "Détail des tuiles (image source peu définie)",
      "Si des panneaux solaires apparaissent sur la simulation : artefact de génération, non confirmé, à ignorer",
    ],
    pointsAValider: ["Photo de toiture en toiture (pas seulement satellite)", "Implantation PV : non documentée"],
    confiance: "faible",
    statutInitial: "PROJECTION WOW À VALIDER",
    categoriePhotoApres: "Toiture",
    exploitable: true,
    noteLimitation: "Source aérienne très pixellisée. Toute apparition de photovoltaïque est un artefact, pas un projet validé.",
  },
  {
    id: "combles",
    categorie: "Combles",
    photoAvantSrc: "/test-maison-clyve/avant/combles.png",
    photoAvantNom: "PHOTO-2026-07-28-21-10-34.png",
    projectionSrc: "/test-maison-clyve/projections/projection-combles-wow.png",
    versions: versions(
      "combles",
      "Jour traversant refermé, écran sous-toiture illustré, pièce toujours en travaux.",
      "Même volume, toiture close, enduit plus propre, plancher rangé. Pas de velux inventé comme certain.",
    ),
    travauxRepresentes: [
      "Plus de jour traversant (couverture refermée)",
      "Écran / sous-toiture illustré (Faivre R3 / Madinier écran delta vent)",
    ],
    travauxNonSimules: [
      "Plafond plâtre / pièce habitable finie garantie",
      "Fenêtres de toit (velux) : non au devis",
      "Menuiserie dans la baie (non au devis)",
    ],
    source: "Photo réelle PHOTO-2026-07-28-21-10-34.png + devis toiture",
    devisOuReco: "Faivre : sous-toiture R3 + tuiles. Madinier : écran delta vent. Non cumulables.",
    elementsConfirmes: ["Jour traversant et liteaux exposés (EXTRAIT, confiance élevée)"],
    elementsEstimatifs: ["Aspect exact de l’écran", "Finition intérieure"],
    pointsAValider: ["Visite charpente / liteaux / écran", "Surface de toiture unique"],
    confiance: "moyen",
    statutInitial: "PROJECTION WOW À VALIDER",
    categoriePhotoApres: "Combles",
    exploitable: true,
    noteLimitation: "Si des fenêtres de toit apparaissent : non documentées, à ignorer jusqu’à validation.",
  },
  {
    id: "sous-face",
    categorie: "Sous-face de toiture",
    photoAvantSrc: "/test-maison-clyve/avant/interieur-toiture.png",
    photoAvantNom: "PHOTO-2026-07-28-22-05-52.png",
    projectionSrc: "/test-maison-clyve/projections/projection-sous-face-wow.png",
    versions: versions(
      "sous-face",
      "Percées de jour refermées, écran illustré, niche conservée.",
      "Même contre-plongée, sous-face plus propre et plus lumineuse, niche conservée.",
    ),
    travauxRepresentes: ["Tuiles continues, plus de percées de jour", "Écran sous-toiture illustré (devis toiture)"],
    travauxNonSimules: ["Isolation épaisse type combles aménagés", "Finition intérieure complète"],
    source: "Photo réelle PHOTO-2026-07-28-22-05-52.png + devis toiture",
    devisOuReco: "Faivre sous-toiture R3 ; Madinier écran delta vent.",
    elementsConfirmes: ["Jour visible et absence d’isolant sur le cliché (EXTRAIT)"],
    elementsEstimatifs: ["L’écran illustré n’est pas un audit de performance"],
    pointsAValider: ["Contrôle de l’écran et des liteaux sur toute la surface"],
    confiance: "moyen",
    statutInitial: "PROJECTION WOW À VALIDER",
    categoriePhotoApres: "Sous-face de toiture",
    exploitable: true,
  },
  {
    id: "murs-enduits",
    categorie: "Murs et enduits",
    photoAvantSrc: "/test-maison-clyve/avant/interieur-toiture.png",
    photoAvantNom: "PHOTO-2026-07-28-22-05-52.png",
    projectionSrc: "/test-maison-clyve/projections/projection-murs-wow.png",
    versions: versions(
      "murs",
      "Reprise visuelle locale de la fissure et de l’enduit, niche conservée.",
      "Enduit traditionnel plus lumineux, fissure atténuée visuellement, niche conservée.",
    ),
    travauxRepresentes: [
      "Toiture refermée (documenté)",
      "Reprise visuelle locale de la fissure et de l’enduit (estimatif, reco P2)",
    ],
    travauxNonSimules: [
      "Diagnostic d’humidité déjà réalisé",
      "Identification du matériau porteur (pisé non retenu)",
      "Isolation des murs",
    ],
    source: "Même cliché que la sous-face + recommandation P2",
    devisOuReco: "Reco P2 (À VÉRIFIER). Aucun devis de traitement d’humidité joint.",
    elementsConfirmes: ["Fissure verticale et mur rugueux (EXTRAIT)", "Niche en arc conservée"],
    elementsEstimatifs: ["Reprise de fissure", "Teinte du ragréage"],
    pointsAValider: ["Origine de l’humidité", "Avis professionnel avant tout traitement"],
    confiance: "faible",
    statutInitial: "PROJECTION WOW À VALIDER",
    categoriePhotoApres: "Murs et enduits",
    exploitable: true,
  },
  {
    id: "menuiseries",
    categorie: "Menuiseries",
    photoAvantSrc: "/test-maison-clyve/avant/facade-pierre.png",
    photoAvantNom: "PHOTO-2026-07-28-22-18-11.png",
    projectionSrc: "/test-maison-clyve/projections/projection-menuiseries-wow.png",
    versions: versions(
      "menuiseries",
      "Palettes et matériaux retirés. Terrasse pierre claire simple, enduit restauré, volets et ouvertures conservés.",
      "Même angle : terrasse bois, plantations sobres, façade plus lumineuse, volets restaurés. Maison habitable, sans chantier.",
    ),
    travauxRepresentes: [
      "Suppression visuelle des palettes, tuyaux et matériaux de chantier",
      "Terrasse finie (pierre claire en version technique, bois naturel en version WOW) — illustration, pas un devis terrasse",
      "Menuiseries existantes conservées (châssis blanc + volets bois rouges, emplacements inchangés)",
      "Ragréage d’enduit et conservation de la pierre en soubassement (estimatif)",
      "Abords nettoyés, plantations sobres (version WOW)",
    ],
    travauxNonSimules: [
      "Remplacement des fenêtres (aucun devis menuiserie)",
      "Nouvelles baies vitrées ou ouverture dans la porte de grange",
      "Valeurs Uw ou double/triple vitrage",
      "Lot terrasse chiffré (aucun devis terrasse dans le corpus)",
    ],
    source: "Photo réelle PHOTO-2026-07-28-22-18-11.png — pas de devis menuiseries ni terrasse",
    devisOuReco: "Aucune ligne menuiserie ni terrasse dans Faivre, Madinier ou MTL. Reco P5 : à relever. Terrasse : illustration à valider.",
    elementsConfirmes: [
      "Ouverture mixte existante (EXTRAIT)",
      "Palettes et matériaux au sol sur la photo avant (EXTRAIT)",
      "Pas de devis de remplacement des menuiseries",
    ],
    elementsEstimatifs: [
      "Matériau de terrasse (pierre vs bois)",
      "Teinte d’enduit",
      "Plantations et mobilier de la version WOW",
    ],
    pointsAValider: [
      "Tableau menuiserie par menuiserie",
      "Uw / vitrage / dimensions",
      "Faisabilité technique et financière de la terrasse",
    ],
    confiance: "faible",
    statutInitial: "PROJECTION WOW À VALIDER",
    categoriePhotoApres: "Menuiseries",
    exploitable: true,
    legende: LEGENDE_TERRASSE,
  },
  {
    id: "facade-terrasse",
    categorie: "Zones de travaux visibles",
    photoAvantSrc: "/test-maison-clyve/avant/facade-terrasse.png",
    photoAvantNom: "PHOTO-2026-07-28-21-27-52.png",
    projectionSrc: "/test-maison-clyve/projections/projection-facade-terrasse-wow.png",
    versions: versions(
      "facade-terrasse",
      "Poutres, palettes et bacs retirés. Terrasse pierre claire sur l’emprise de la dalle, enduit restauré, ouvertures conservées.",
      "Terrasse bois, mobilier sobre, plantations discrètes, façade plus lumineuse. Même angle, pas de baie nouvelle.",
    ),
    travauxRepresentes: [
      "Suppression visuelle des matériaux de chantier (poutres, palettes, bacs)",
      "Terrasse finie sur l’emprise de la dalle déjà visible (EXTRAIT)",
      "Égout de toiture et tuiles réalignés",
      "Ragréage d’enduit estimatif, volets rouges conservés",
    ],
    travauxNonSimules: [
      "Grandes baies coulissantes (absentes de la photo originale)",
      "Remplacement des menuiseries",
      "Aménagement paysager haut de gamme",
    ],
    source: "Photo réelle PHOTO-2026-07-28-21-27-52.png + devis toiture ; dalle déjà visible",
    devisOuReco: "Toiture : Faivre / Madinier. Dalle : devis MTL possible, non démontré pièce par pièce. Terrasse finie : illustration à valider.",
    elementsConfirmes: ["Toiture d’égout dégradée (EXTRAIT)", "Dalle béton déjà en place (EXTRAIT)"],
    elementsEstimatifs: ["Revêtement de terrasse (pierre vs bois)", "Enduit de façade", "Lien dalle photo ↔ devis MTL"],
    pointsAValider: ["Correspondance dalles MTL", "Faisabilité de la terrasse", "Ordre des lots restants"],
    confiance: "moyen",
    statutInitial: "PROJECTION WOW À VALIDER",
    categoriePhotoApres: "Autre",
    exploitable: true,
    legende: LEGENDE_TERRASSE,
    noteLimitation: "Si une baie vitrée large apparaît : elle n’existe pas sur la photo originale, à ignorer.",
  },
];

export const PHOTOS_SANS_PROJECTION = [
  {
    categorie: "Chauffage",
    motif: "Aucun cliché dédié dans le corpus. Souches de cheminée visibles sur d’autres vues uniquement.",
  },
  {
    categorie: "Tableau électrique",
    motif: "Photo du tableau non fournie. Emplacement après : PHOTO APRÈS TRAVAUX RÉELLE À AJOUTER.",
  },
  {
    categorie: "Plan intérieur",
    motif: "Le plan coté n’est pas une photo de bâtiment : il reste en galerie AVANT, sans projection architecturale.",
  },
];

export const DISCLAIMER_PROJECTION = [
  "Les images de droite / versions technique et WOW sont des simulations illustratives, pas des photographies après travaux.",
  "Les originaux à gauche n’ont pas été modifiés. Copies dans /test-maison-clyve/avant/.",
  "Aucun DPE, aucune économie, aucun photovoltaïque confirmé n’est simulé comme certain.",
  "Les deux devis toiture restent non cumulables ; la tuile illustrée n’est pas un choix d’entreprise.",
  LEGENDE_PROJECTION,
];
