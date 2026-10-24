/**
 * Dossier Mme Leïla Gilbertas — Clermont-Ferrand (63).
 * Marché global 14/10/2026 : cuisine clé en main + LVT + peinture + électricité.
 * TVA rénovation 10 %. Chiffres contractuels figés (ne pas recalculer).
 * Document client : interlocuteur unique ENERGIA — aucune marge, aucun apporteur, aucun débours.
 */

import {
  ETAPE_ANAH_AUDIT,
  SOURCE_APPORTEUR_DAMIEN,
  STATUT_COMMISSION_EN_ATTENTE,
  libelleSourceApporteur,
} from "./operationnelCrm.js";

export const GILBERTAS_DOSSIER_ID = "dossier-gilbertas-clermont-2026";
export const GILBERTAS_REFERENCE = "EC-2026-CLERMONT-GILBERTAS-01";
export const GILBERTAS_CONTRAT_NUMERO = "CONTRAT-2026-CLERMONT-GILBERTAS-01";
export const GILBERTAS_CONTRAT_DATE = "2026-10-14";
export const GILBERTAS_CONTRAT_TITRE =
  "CONTRAT DE CONTRACTANT GÉNÉRAL — GILBERTAS CLERMONT — RÉNOVATION COMPLÈTE SECOND ŒUVRE & CUISINE CLÉ EN MAIN";
export const NOM_FICHIER_CONTRAT_GILBERTAS = "CONTRAT_GILBERTAS_CLERMONT_2026_FINAL.html";
export const CHEMIN_CONTRAT_GILBERTAS = `/${NOM_FICHIER_CONTRAT_GILBERTAS}`;
export const STATUT_GILBERTAS = "Contrat CG établi";
export const PHASE_GILBERTAS = "Signature du marché global — 37 600 € TTC";
export const INTITULE_MARCHE_GILBERTAS =
  "Rénovation Complète de Second Œuvre & Agencement Cuisine Clé en Main";

/** Mention figée du cadre Client et du lieu d'exécution (contrat + facture d'acompte). */
export const LIEU_EXECUTION_GILBERTAS = "Appartement 80 m² — 63000 Clermont-Ferrand";

export const FACTURE_ACOMPTE_GILBERTAS = {
  numero: "FA-2026-GILBERTAS-01",
  libelle: "Acompte Gilbertas FA-2026-01",
  ht: 10254.55,
  tva: 1025.45,
  ttc: 11280,
};

export const RIB_REGLEMENT_GILBERTAS = {
  titulaire: "ENERGIA CONSEIL",
  iban: "FR76 1695 8000 0186 6836 4808 772",
  bic: "QNTOFRP1XXX",
  libelle: FACTURE_ACOMPTE_GILBERTAS.libelle,
};

export const CLAUSE_VT_GILBERTAS =
  "Visite Technique (VT) préalable obligatoire : Réalisation d'une visite technique sur site à Clermont-Ferrand dès encaissement de l'acompte de 30 % pour le relevé millimétrique des cotes réelles, des aplombs, des alimentations/évacuations et des réservations électriques avant tout lancement en production.";

export const CLAUSE_DELAI_USINE_GILBERTAS =
  "Délai de fabrication usine : Délai ferme de 5 semaines pour la fabrication des meubles sur-mesure et l'approvisionnement électroménager, débutant à compter de la validation du procès-verbal de métré de la VT et de l'encaissement de l'acompte.";

export const CLAUSE_PHASAGE_GILBERTAS =
  "Phasage des travaux préparatoires : La préparation des supports, la pose du sol LVT 80 m², la mise en peinture complète des murs/plafonds (280 m² développés) et les reprises électriques/fibre sont exécutées pendant les 5 semaines de fabrication usine, garantissant un chantier prêt pour la pose cuisine finale.";

export const CLAUSES_PLANNING_GILBERTAS = [
  CLAUSE_VT_GILBERTAS,
  CLAUSE_DELAI_USINE_GILBERTAS,
  CLAUSE_PHASAGE_GILBERTAS,
];

export const CLIENT_GILBERTAS = {
  nom: "Leïla Gilbertas",
  civilite: "Madame",
  telephone: "+33 6 37 96 06 91",
  telephoneAffiche: "06 37 96 06 91",
  ville: "Clermont-Ferrand",
  codePostal: "63000",
  villeAffichee: "Clermont-Ferrand (63000)",
  lieuExecution: LIEU_EXECUTION_GILBERTAS,
  typeBien: "Appartement",
  surfaceTotale: 80,
  dateCreation: "2026-10-04",
  intituleMarche: INTITULE_MARCHE_GILBERTAS,
};

export const EQUIPE_GILBERTAS = {
  directionContractantGeneral:
    "Sylvain LEMBELEMBE — ENERGIA CONSEIL IA® — Garantie Décennale Calipso Assurances n° LUNPIB2604975",
  directionArtistique:
    "Catarina MARTINS — mission de suivi sur site et harmonie des teintes",
  designAgencement: "Catarina MARTINS — Direction artistique & coordination terrain",
};

/** Photos terrain avant travaux — fichiers dans /public et /public/gilbertas. */
export const PHOTOS_TERRAIN_GILBERTAS = [
  {
    id: "gilbertas-photo-cuisine",
    src: "/gilbertas/PHOTO-2026-10-04-12-08-59.jpg",
    fallbackSrc: "/PHOTO-2026-10-04-12-08-59.jpg",
    titre: "Vue d'ensemble Cuisine",
    badge: "Dépose totale & nouvelle implantation linéaire en L",
    label: "Vue d'ensemble Cuisine — Dépose totale & nouvelle implantation linéaire en L",
  },
  {
    id: "gilbertas-photo-evier",
    src: "/gilbertas/PHOTO-2026-10-04-12-09-10.jpg",
    fallbackSrc: "/PHOTO-2026-10-04-12-09-10.jpg",
    titre: "Zone Évier & Fenêtre",
    badge: "Suppression conflit lave-vaisselle & évier sous-plan",
    label: "Zone Évier & Fenêtre — Suppression conflit lave-vaisselle & évier sous-plan",
  },
  {
    id: "gilbertas-photo-radiateur",
    src: "/gilbertas/PHOTO-2026-10-04-12-09-42.jpg",
    fallbackSrc: "/PHOTO-2026-10-04-12-09-42.jpg",
    titre: "Zone Radiateur & Soffite",
    badge: "Dépose meuble suspendu, radiateur vertical design & fileurs",
    label: "Zone Radiateur & Soffite — Dépose meuble suspendu, radiateur vertical design & fileurs",
  },
  {
    id: "gilbertas-photo-salon-fibre",
    src: "/gilbertas/PHOTO-2026-10-04-12-52-14.jpg",
    fallbackSrc: "/PHOTO-2026-10-04-12-52-14.jpg",
    titre: "Salon 80 m² & Déplacement Fibre",
    badge: "Rénovation sol LVT, peinture et câblage fibre",
    label: "Salon 80 m² & Déplacement Fibre — Rénovation sol LVT, peinture et câblage fibre",
  },
];

export const RENDUS_3D_GILBERTAS = [
  {
    id: "gilbertas-3d-perspective-1",
    src: "/gilbertas/rendu-3d-cuisine-perspective-1.jpg",
    titre: "Perspective 1 — Linéaire de cuisson et îlot",
    badge: "Façades Macaron Porcelaine / 30 · plan Chêne du Jura D016 · évier Full Black · hotte verre noir",
  },
  {
    id: "gilbertas-3d-perspective-2",
    src: "/gilbertas/rendu-3d-cuisine-perspective-2.jpg",
    titre: "Perspective 2 — Retour d'angle et étagère quart de rond",
    badge: "Étagère quart de rond Chêne du Jura · poignée fine 381 · accès terrasse",
  },
];

/**
 * Pack électroménager — références lues sur les fiches techniques du 14/10/2026.
 * Garanties : uniquement ce que la fiche énonce, plus la garantie légale de conformité.
 */
export const ELECTROMENAGER_GILBERTAS = [
  {
    id: "em-four",
    poste: "Four pyrolyse encastrable",
    marque: "AEG",
    reference: "TU5PB40SK",
    ean: "7333394116914",
    classe: "A++",
    garantie: "Garantie légale de conformité 2 ans. Durée complémentaire non indiquée sur la fiche AEG.",
    detail: "Série 5000 SurroundCook® · XXL 72 L · noir · pyrolyse · commandes EXPlore rétractables · 3 490 W",
  },
  {
    id: "em-plaque",
    poste: "Table induction 60 cm",
    marque: "Electrolux",
    reference: "MIV63346IT",
    ean: "7333394175188",
    classe: "182,5 Wh/kg (EU 66/2014) — pas de classe A à G sur la fiche",
    garantie: "Garantie légale de conformité 2 ans. Conditions constructeur Electrolux.",
    detail: "SaphirMatt® SE Série 600 Bridge · 7 200 W · verre noir mat anti-rayures · zone flexible Bridge · 3 foyers",
  },
  {
    id: "em-hotte",
    poste: "Hotte décorative inclinée",
    marque: "Elica",
    reference: "PRF0119819A — SHIRE BL/A/60",
    ean: "8020283041110",
    classe: "A",
    garantie: "Garantie légale de conformité 2 ans. Conditions constructeur Elica.",
    detail: "Verre noir · 650 m³/h en booster · commandes tactiles · LED 2×1 W · extraction ou recyclage",
  },
  {
    id: "em-lv",
    poste: "Lave-vaisselle tout intégré 45 cm",
    marque: "Bosch",
    reference: "SPV4EMX17E",
    ean: "4242005540037",
    classe: "B",
    garantie: "AquaStop Bosch pour toute la durée de vie de l'appareil. Garantie légale de conformité 2 ans.",
    detail: "Série 4 · 10 couverts · 44 dB · cuve inox · EfficientDry · niche 815–875 × 450 × 550 mm",
  },
  {
    id: "em-frigo",
    poste: "Réfrigérateur combiné intégrable 254 L",
    marque: "Beko",
    reference: "BCNA275E4ZSN",
    ean: "8690842620683",
    classe: "E",
    garantie: "Pièces détachées Beko conservées 12 ans à compter de l'achat. Garantie légale de conformité 2 ans.",
    detail: "NeoFrost™ Dual Cooling · ProSmart Inverter · 38 dB · froid ventilé · glissières · EverFresh+®",
  },
  {
    id: "em-ll",
    poste: "Lave-linge intégrable sous plan 9 kg",
    marque: "Beko",
    reference: "B3WBT691415W",
    ean: "8690842706691",
    classe: "A",
    garantie: "Pièces détachées Beko conservées 12 ans à compter de l'achat. Garantie légale de conformité 2 ans.",
    detail: "1 400 tr/min · SteamCure · vapeur SteamTherapy · 15 programmes · pose sous plan",
  },
  {
    id: "em-mo",
    poste: "Micro-ondes grill encastrable 22 L",
    marque: "Whirlpool",
    reference: "MBNA 920 B",
    ean: "8003437396823",
    classe: "Non indiquée sur la fiche",
    garantie: "Garantie légale de conformité 2 ans. Conditions constructeur Whirlpool.",
    detail: "Technologie 3D double sortie d'ondes · commandes escamotables push-push · gril quartz 700 W · micro-ondes 750 W",
  },
];

/** Lots de travaux — montants contractuels client (HT / TVA 10 % / TTC). */
export const LOTS_GILBERTAS = [
  {
    id: "gilbertas-lot-cuisine",
    ordre: 1,
    nom: "Cuisine sur-mesure & pack électroménager 100 % encastré (fourniture & pose)",
    categorieId: "cuisines-agencement",
    quantite: 1,
    unite: "forfait",
    postes: [
      "Façades et socles H. 15 cm gamme Macaron mélaminé mat, coloris Porcelaine / 30. Libre choix sans surcoût dans Les Basiques : Blanc 20, Perle 35, Cachemire 37, Lin 21, Sauge 230",
      "Plans stratifié bois ép. 39 mm chant droit et crédences H. 30 cm Chêne du Jura / D016, chants assortis. Étagère quart de rond galbée assortie. Libre choix sans surcoût : Chêne clair D097, Chêne brut D080, Travertin D108, Calacatta doré D110",
      "Poignées fines réf. 381, inox brossé profilé, entraxe 192 mm. Bandeau LED sous meubles hauts",
      "Évier Luisina Tam Tam 1 bac Luisigranit Full Black et mitigeur laiton noir mat avec douchette (RC35DO079)",
      "Pack de 7 électroménagers encastrés en finition harmonisée Full Black et verre noir mat",
    ],
    specifications:
      "Façades et socles (H. 15 cm) : gamme Macaron, mélaminé mat, coloris officiel Porcelaine / 30 (blanc crème minéral mat). La cliente conserve le libre choix, sans surcoût, parmi le nuancier Les Basiques : Blanc / 20, Perle / 35, Cachemire / 37, Lin / 21, Sauge / 230.<br>Plans de travail : stratifié bois, épaisseur 39 mm, chant droit, coloris officiel Chêne du Jura / D016, chants assortis D016. Crédences assorties H. 30 cm, même coloris D016. Étagère de terminaison galbée en quart de rond, finition Chêne du Jura assortie. Libre choix, sans surcoût, dans le nuancier Bois / Matière : Chêne clair / D097, Chêne brut / D080, Travertin / D108, Calacatta doré / D110. Éclairage bandeau LED sous meubles hauts.<br>Poignées : catégorie Fines, modèle officiel réf. 381, inox brossé profilé, entraxe 192 mm.<br>Sanitaires : évier Luisina Tam Tam, cuve 1 bac, Luisigranit Full Black (noir mat, 790×500) et mitigeur design avec douchette en laiton noir mat (réf. RC35DO079).<br>Pack de 7 électroménagers encastrés : finition harmonisée Full Black et verre noir mat sur les faces visibles (four, table induction, hotte, micro-ondes). Lave-vaisselle, réfrigérateur et lave-linge sont intégrés derrière la façade mobilier Porcelaine / 30 ; leurs éléments apparents suivent la finition noire de leur fiche. Références, classes et garanties en annexe technique.<br>Prestation : livraison et installation complète par les équipes de poseurs qualifiés d'ENERGIA CONSEIL IA®.",
    totalHt: 15909.09,
    totalTva: 1590.91,
    totalTtc: 17500,
    coutAchatHt: null,
    margeBruteHt: null,
    tauxTva: 0.1,
  },
  {
    id: "gilbertas-lot-sols",
    ordre: 2,
    nom: "Revêtement de sol LVT acoustique haute résistance (80 m²)",
    categorieId: "sols-lvt",
    quantite: 1,
    unite: "forfait",
    postes: [
      "Préparation soignée des sols",
      "LVT acoustique clipsable grand passage, décor Chêne Naturel structuré, accord chromatique avec le Chêne du Jura D016 de la cuisine",
      "Plinthes décoratives assorties sur tout le linéaire",
    ],
    specifications:
      "Préparation soignée des sols. Fourniture et pose d'un sol LVT acoustique clipsable grand passage, décor Chêne Naturel structuré, en accord chromatique avec le Chêne du Jura / D016 de la cuisine, sous-couche acoustique intégrée, sur l'ensemble de l'appartement (80 m², hors salle de bain). Fourniture et pose des plinthes décoratives assorties sur tout le linéaire.",
    totalHt: 5272.73,
    totalTva: 527.27,
    totalTtc: 5800,
    coutAchatHt: null,
    margeBruteHt: null,
    tauxTva: 0.1,
  },
  {
    id: "gilbertas-lot-peinture",
    ordre: 3,
    nom: "Rénovation peinture complète murs & plafonds (80 m² sol / ~280 m² développés)",
    categorieId: "peinture",
    quantite: 1,
    unite: "forfait",
    postes: [
      "Préparation lourde : lessivage, décapage, rebouchage, enduit de lissage complet et ponçage mécanique fin",
      "Plafonds en blanc velours lumineux",
      "Murs en teintes contemporaines douces, coordonnées par Catarina MARTINS",
    ],
    specifications:
      "Préparation lourde et soignée des supports : lessivage, décapage, rebouchage des fissures, enduit de lissage complet et ponçage mécanique fin. Sous-couche d'impression régulatrice + 2 couches de finition peinture velours dépolluante et lessivable haute résistance. Plafonds : blanc velours lumineux. Murs : teintes contemporaines douces, coordonnées avec la direction artistique de Catarina MARTINS, sur tous les plafonds et tous les murs (salon, séjour, couloirs, chambres, cuisine). Assiette : 80 m² au sol, environ 280 m² développés.",
    totalHt: 9545.45,
    totalTva: 954.55,
    totalTtc: 10500,
    coutAchatHt: null,
    margeBruteHt: null,
    tauxTva: 0.1,
  },
  {
    id: "gilbertas-lot-electricite",
    ordre: 4,
    nom: "Électricité complète des appareillages, lignes dédiées & réseau",
    categorieId: "electricite",
    quantite: 1,
    unite: "forfait",
    postes: [
      "Remplacement intégral des appareillages (prises, interrupteurs, commandes d'éclairage Legrand / Schneider)",
      "Lignes de puissance dédiées et sécurisées sous disjoncteurs divisionnaires : four, table induction, lave-vaisselle, lave-linge",
      "Déplacement des alimentations salon et raccordement optimisé de la fibre optique",
    ],
    specifications:
      "Remplacement intégral de tous les appareillages existants (prises de courant, interrupteurs, commandes d'éclairage Legrand / Schneider) sur l'ensemble de l'appartement. Création et tirage des lignes d'alimentation de puissance dédiées et sécurisées sous disjoncteurs divisionnaires pour l'électroménager de la cuisine (four, table induction, lave-vaisselle, lave-linge). Déplacement des alimentations salon et raccordement optimisé de la fibre optique.",
    totalHt: 3454.55,
    totalTva: 345.45,
    totalTtc: 3800,
    coutAchatHt: null,
    margeBruteHt: null,
    tauxTva: 0.1,
  },
];

export const TOTAUX_GILBERTAS = {
  totalHt: 34181.82,
  totalTva: 3418.18,
  totalTtc: 37600,
  coutsTravauxHt: null,
  commissionDamienHt: null,
  forfaitCatarinaHt: null,
  margeNetteEnergiaHt: null,
  tauxTva: 0.1,
};

export const FINANCEMENT_GILBERTAS = {
  acompte: 11280,
  intermediaire: 15040,
  solde: 11280,
  resteACharge: 37600,
};

export const MENTION_HORS_MPR_GILBERTAS =
  "Travaux de second œuvre et d'agencement cuisine clé en main — hors MaPrimeRénov' Parcours. Aucune aide ANAH déduite. Reste à charge client = montant ferme et définitif du marché, TVA rénovation 10 %. Interlocuteur unique : ENERGIA CONSEIL IA®.";

export const ORDRE_EXECUTION_GILBERTAS =
  "Fenêtre de mise à disposition de 15 jours, appartement vide, avant les vacances scolaires. Exécution groupée en 7 jours ouvrés : protections et électricité (J1) → peinture murs et plafonds (J1 à J4) → sol LVT et plinthes (J4 à J6) → pose cuisine, sanitaires et électroménager encastré, raccordements et réception (J5 à J7).";

export const PLANNING_COMMANDO_GILBERTAS = [
  {
    phase: "Visite Technique (VT) préalable obligatoire",
    duree: "Dès encaissement de l'acompte 30 %",
    detail: CLAUSE_VT_GILBERTAS,
  },
  {
    phase: "Délai de fabrication usine",
    duree: "5 semaines fermes",
    detail: CLAUSE_DELAI_USINE_GILBERTAS,
  },
  {
    phase: "Phasage des travaux préparatoires",
    duree: "Pendant les 5 semaines d'usine",
    detail: CLAUSE_PHASAGE_GILBERTAS,
  },
  {
    phase: "Mise à disposition",
    duree: "15 jours",
    detail: "Appartement vide, avant les vacances scolaires. Fenêtre dans laquelle s'inscrit la semaine de pose cuisine, une fois les supports, le sol, la peinture et l'électricité préparés.",
  },
  {
    phase: "J1 — Protections & électricité",
    duree: "1 jour",
    detail: "Protection des volumes. Lignes dédiées cuisine, remplacement des appareillages, déplacement fibre et alimentations salon.",
  },
  {
    phase: "J1 à J4 — Peinture",
    duree: "4 jours",
    detail: "Préparation lourde, impression, plafonds en blanc velours lumineux et murs en teintes douces coordonnées par Catarina MARTINS.",
  },
  {
    phase: "J4 à J6 — Sol LVT",
    duree: "3 jours",
    detail: "Préparation des sols, pose du LVT Chêne Naturel structuré (hors salle de bain), accordé au Chêne du Jura, et plinthes assorties.",
  },
  {
    phase: "J5 à J7 — Cuisine clé en main",
    duree: "3 jours",
    detail: "Pose du mobilier, plan, évier, bandeau LED et des 7 électroménagers encastrés. Raccordements et mise en service.",
  },
  {
    phase: "J7 — Réception",
    duree: "Le jour même",
    detail: "Procès-verbal de réception sans réserve avec Sylvain LEMBELEMBE. Solde de 30 % à la livraison finale.",
  },
];

export const CONTACTS_CLIENT_GILBERTAS = [
  {
    role: "Direction & portage Contractant Général",
    nom: "Sylvain LEMBELEMBE",
    detail:
      "ENERGIA CONSEIL IA® — 06 10 59 68 98 — contact@energia-conseil-ia.com — Garantie Décennale Calipso Assurances n° LUNPIB2604975",
  },
  {
    role: "Direction artistique & coordination terrain",
    nom: "Catarina MARTINS",
    detail: "Mission de suivi sur site et harmonie des teintes, sous la maîtrise d'ENERGIA CONSEIL IA®",
  },
  {
    role: "Juriste ENERGIA CONSEIL IA®",
    nom: "Julia",
    detail: "Avis juridique du marché et clause de protection",
  },
];

/** Postes contractuels fermes (corps du contrat CG). */
export const POSTES_GILBERTAS_CONTRAT = LOTS_GILBERTAS.map((lot) => ({
  id: lot.id,
  ordreContractuel: lot.ordre,
  nom: lot.nom,
  specifications: lot.specifications,
  artisan: "",
  quantite: lot.quantite,
  unite: lot.unite,
  puHt: lot.totalHt,
  tauxTva: lot.tauxTva,
  totalHt: lot.totalHt,
  totalTva: lot.totalTva,
  totalTtc: lot.totalTtc,
  verrouillageOfficiel: true,
}));

export function editionOfficielleGilbertas() {
  return {
    client: {
      nom: CLIENT_GILBERTAS.nom,
      prenom: "Leïla",
      telephone: CLIENT_GILBERTAS.telephoneAffiche,
      email: "",
      adresse: LIEU_EXECUTION_GILBERTAS,
      adresseChantier: LIEU_EXECUTION_GILBERTAS,
      surfaceHabitable: String(CLIENT_GILBERTAS.surfaceTotale),
      statutOccupation: "proprietaire_occupant",
    },
    devisOfficiel: {
      numero: GILBERTAS_CONTRAT_NUMERO,
      date: GILBERTAS_CONTRAT_DATE,
      reference: GILBERTAS_REFERENCE,
    },
    verrouillageOfficiel: true,
    aides: {
      profil: "",
      parcours: "",
      rfr: 0,
      parts: 0,
      gainClasses: 0,
      verrouillageOfficiel: true,
    },
    financement: {
      ecoPtzMontant: 0,
      ecoPtzDuree: 15,
      apportPersonnel: FINANCEMENT_GILBERTAS.resteACharge,
      acompte: FINANCEMENT_GILBERTAS.acompte,
      intermediaire: FINANCEMENT_GILBERTAS.intermediaire,
      solde: FINANCEMENT_GILBERTAS.solde,
    },
    travaux: POSTES_GILBERTAS_CONTRAT.map((poste) => ({
      ...poste,
      familleId: "second-oeuvre",
      categorieId: LOTS_GILBERTAS.find((lot) => lot.id === poste.id)?.categorieId || "",
      prestationId: poste.id,
    })),
    mentionsJuridiques: [MENTION_HORS_MPR_GILBERTAS],
    photos: {
      paires: PHOTOS_TERRAIN_GILBERTAS.map((photo) => ({
        id: photo.id,
        titre: photo.titre,
        avantSrc: photo.fallbackSrc || photo.src,
        apresSrc: null,
        legendAvant: photo.label,
        legendApres: "",
      })),
    },
    rendus3d: RENDUS_3D_GILBERTAS,
    electromenager: ELECTROMENAGER_GILBERTAS,
  };
}

export function syntheseFinanciereGilbertas() {
  return { ...TOTAUX_GILBERTAS };
}

export function lotsGilbertasPourTravaux() {
  return LOTS_GILBERTAS.map((lot) => ({
    id: lot.id,
    nom: lot.nom,
    quantite: lot.quantite,
    unite: lot.unite,
    prixVentePuHt: lot.totalHt,
    coutAchatPuHt: lot.coutAchatHt == null ? null : Math.round((lot.coutAchatHt / lot.quantite) * 100) / 100,
    tauxTva: lot.tauxTva,
    postes: lot.postes,
    totalHt: lot.totalHt,
    totalTtc: lot.totalTtc,
    coutAchatHt: lot.coutAchatHt,
    margeBruteHt: lot.margeBruteHt,
    ordre: lot.ordre,
    categorieId: lot.categorieId,
  }));
}

export const PROJET_GILBERTAS_DEFAUT = {
  id: GILBERTAS_DOSSIER_ID,
  nom: CLIENT_GILBERTAS.nom,
  prenom: "Leïla",
  ville: CLIENT_GILBERTAS.ville,
  codePostal: CLIENT_GILBERTAS.codePostal,
  adresse: LIEU_EXECUTION_GILBERTAS,
  telephone: CLIENT_GILBERTAS.telephoneAffiche,
  email: "",
  rfr: null,
  statut: STATUT_GILBERTAS,
  phase: PHASE_GILBERTAS,
  reference: GILBERTAS_REFERENCE,
  numeroAuditMar: GILBERTAS_REFERENCE,
  typeBien: CLIENT_GILBERTAS.typeBien,
  typeProjet: `${CLIENT_GILBERTAS.typeBien} 80 m² — ${INTITULE_MARCHE_GILBERTAS} — ${TOTAUX_GILBERTAS.totalTtc.toLocaleString("fr-FR")} € TTC`,
  surfaceHabitable: CLIENT_GILBERTAS.surfaceTotale,
  source: "manuel",
  createdAt: CLIENT_GILBERTAS.dateCreation,
  apporteurId: SOURCE_APPORTEUR_DAMIEN,
  apporteurNom: libelleSourceApporteur(SOURCE_APPORTEUR_DAMIEN, { select: true }),
  etapeAnah: ETAPE_ANAH_AUDIT,
  validationMar: false,
  acompte30Encaisse: false,
  dateVisiteTechnique: "",
  consultationDuo: false,
  statutCommission: STATUT_COMMISSION_EN_ATTENTE,
  detailJalon: PHASE_GILBERTAS,
  equipe: EQUIPE_GILBERTAS,
  travaux: lotsGilbertasPourTravaux(),
  syntheseFinanciere: syntheseFinanciereGilbertas(),
  margeDirectionHt: null,
  margeDirectionTtc: null,
  alertes: [],
};
