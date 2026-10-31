import { useEffect, useState } from "react";
import { BRANDING, LOGO_PUBLIC_PATH, MENTION_MARCHE_CONTRACTANT_GENERAL } from "../../lib/branding";
import { COORDINATION_NATIONALE, sousCategoriesDe, type CategorieMetier } from "../../lib/crm/catalogue";
import { ratioPourCategorie, type LigneRepereLot } from "../../lib/crm/ratiosDirection";
import { ficheParCategorie } from "../../lib/crm/fichesStrategiquesCee";
import CartesRatiosDirection from "./CartesRatiosDirection";
import { PresentationFicheStrategique } from "./FicheStrategieCee";

type ExigenceLot = {
  criteres: string[];
  references: string;
  controles: string[];
};

const PHOTOS_SURETE: readonly string[] = [
  "Avant — vue d’ensemble du local ou de la façade",
  "Avant — support existant et état des ouvrages",
  "Avant — points singuliers et accès chantier",
  "Pendant — matériaux livrés, étiquettes et références",
  "Pendant — mise en œuvre en cours",
  "Pendant — traitement des points singuliers",
  "Après — ouvrage terminé, vue d’ensemble",
  "Après — détail de finition",
  "Après — organes de sécurité, réglages et étiquetage",
  "Réception — PV zéro réserve signé, horodaté",
];

const EXIGENCES: Record<string, ExigenceLot> = {
  "etude-accompagnement": {
    criteres: [
      "Audit et étude thermique selon la méthode réglementaire en vigueur, hypothèses tracées.",
      "Dimensionnement des équipements uniquement après isolation (PAC, VMC, solaire).",
      "Scénarios et aides présentés à titre indicatif, jamais comme un accord ANAH.",
    ],
    references: "Méthode 3CL / audit réglementaire, normes NF EN 12831 (déperditions) et NF EN 16247 (audits énergétiques).",
    controles: ["Hypothèses de calcul archivées", "Ordre des travaux isolation avant chauffage", "Cohérence DPE de départ / cible"],
  },
  "plafonds-tendus": {
    criteres: [
      "Procédé sous Avis Technique CSTB ou équivalent, toile et profilés du même système.",
      "Hauteur libre, spots et VMC intégrés sans percer hors des réservations prévues.",
      "Classement feu et locaux humides respectés selon la pièce.",
    ],
    references: "Avis Technique CSTB du procédé de plafond tendu. DTU 58.1 pour les plafonds suspendus rapportés lorsque le support l’exige.",
    controles: ["Plan de calepinage et réservations", "Fixations dans un support sain", "Absence de plis, de fluage et de blessure de toile"],
  },
  peinture: {
    criteres: [
      "Préparation du support avant toute finition : lessivage, rebouchage, impression adaptée.",
      "Système peinture compatible avec le subjectile (plâtre, bois, métal, façade).",
      "Nombre de couches et teinte conformes au descriptif du lot.",
    ],
    references: "DTU 59.1 (peintures) et DTU 59.2 (revêtements plastiques épais). DTU 42.1 si peinture de façade.",
    controles: ["Humidité du support", "Adhérence après impression", "Aspect, teinte et reprises"],
  },
  plomberie: {
    criteres: [
      "Réseaux eau froide, eau chaude et évacuations distincts, pentes d’évacuation respectées.",
      "Pressions, diamètres et protections antigel adaptés à l’usage.",
      "Essai d’étanchéité avant fermeture des gaines.",
    ],
    references: "DTU 60.1, DTU 60.11 et DTU 60.33 (canalisations). Règles sanitaires en vigueur.",
    controles: ["Essai de pression", "Pentes et siphons", "Repérage des réseaux"],
  },
  electricite: {
    criteres: [
      "Installation conforme à la NF C 15-100 : protections, sections, terres et volumes.",
      "Tableau étiqueté, différentiels adaptés, circuits spécialisés séparés.",
      "Consuel lorsque la nature des travaux l’exige.",
    ],
    references: "NF C 15-100 et guides UTE associés. Avis Techniques CSTB pour les systèmes encastrés spécifiques.",
    controles: ["Continuité de terre", "Essai des différentiels", "Schéma unifilaire remis"],
  },
  chauffage: {
    criteres: [
      "COP ou rendement certifié, dimensionnement après isolation du bâti.",
      "PAC : gamme Daikin Premium A+++ lorsque le lot retient l’air/air ou l’air/eau Daikin.",
      "Régulation, désembouage et émetteurs compatibles avec la température de départ.",
    ],
    references: "NF EN 14511 et NF EN 14825 (PAC). DTU 65.11 (radiateurs) et DTU 65.14 (plancher chauffant).",
    controles: ["Puissance retenue vs déperditions", "Mise en service et paramètres", "Absence de fuite et de bruit anormal"],
  },
  isolation: {
    criteres: [
      "Combles perdus : laine de roche ou équivalent soufflé, R ≥ 7 (épaisseur selon λ certifié ACERMI).",
      "Murs : ITE ou ITI R ≥ 3,7, traitement des ponts thermiques et de la perspirance du bâti.",
      "Repérage des spots, conduits et trappes avant soufflage. Ordre : isolation avant chauffage.",
    ],
    references: "DTU 45.11 (combles), DTU 45.10 (ITI), DTU 45.4 et CPT 3035 (ITE). Avis Techniques CSTB des systèmes sous enduit.",
    controles: ["Épaisseur et R mesurés", "Pare-vapeur ou frein-vapeur selon le complexe", "Photos du soufflage avant fermeture"],
  },
  toiture: {
    criteres: [
      "Couverture, étanchéité et zinguerie adaptées à la pente, à la zone de vent et à l’altitude.",
      "Écrans, ventilation de sous-face et évacuations d’eaux pluviales continus.",
      "Aucune pose photovoltaïque sur une couverture non réceptionnée.",
    ],
    references: "Série DTU 40 (couvertures) selon le matériau, DTU 43.1 (étanchéité), DTU 40.5 (évacuation des eaux pluviales).",
    controles: ["Pente et recouvrements", "Noues, arêtiers, solins", "Étanchéité à l’eau après pose"],
  },
  menuiserie: {
    criteres: [
      "Menuiseries Uw ≤ 1,3 W/m².K, vitrage et intercalaire cohérents avec le Uw annoncé.",
      "Pose en applique, tunnel ou feuillure selon le support, calage et étanchéité à l’air.",
      "Entrées d’air uniquement si la ventilation du logement l’exige.",
    ],
    references: "DTU 36.5 (mise en œuvre des fenêtres et portes extérieures). NF EN 14351-1. Classement AEV du PV d’essai.",
    controles: ["Cotes de tableau", "Compribande, membranes et rejingots", "Jeu, quincaillerie et Uw du marquage"],
  },
  "menuiserie-interieure": {
    criteres: [
      "Ouvrages bois ou dérivés stables, jeux de pose et affleurages conformes.",
      "Blocs-portes, escaliers, placards et parquets selon le descriptif (essence, classement UPEC ou usage).",
      "Aucune menuiserie intérieure ne se substitue à une menuiserie extérieure thermique.",
    ],
    references: "DTU 36.2 (menuiseries intérieures bois) et DTU 51.2 (parquets). Avis Techniques CSTB des systèmes industriels.",
    controles: ["Humidité du bois et du support", "Aplomb et jeux", "Quincaillerie et finition"],
  },
  carrelage: {
    criteres: [
      "Support plan, sec et compatible. Spécification sol ou mur, format et joints.",
      "Locaux humides : système d’étanchéité sous carrelage lorsque le DTU l’exige.",
      "Pentes de douche et de terrasse dirigées vers l’évacuation.",
    ],
    references: "DTU 52.2 (carrelage collé) et DTU 52.1 (sols scellés). Règles professionnelles SPEC / SEL.",
    controles: ["Planéité", "Adhérence et joints", "Pentes et seuils de douche"],
  },
  maconnerie: {
    criteres: [
      "Ouvrages de structure, dalles, chapes et ouvertures selon notes de calcul lorsqu’elles sont requises.",
      "Chaînages, appuis et linteaux dimensionnés. IPN ou renfort seulement sur étude.",
      "Réservations des autres corps d’état avant coulage.",
    ],
    references: "DTU 20.1 (maçonnerie), DTU 21 (béton), DTU 26.2 (chapes). Eurocodes lorsque le bureau d’études les vise.",
    controles: ["Implantation et niveaux", "Ferraillage avant coulage", "Réservations et arases"],
  },
  "plomberie-sanitaire": {
    criteres: [
      "Appareils, robinetterie et évacuations accessibles, avec siphons et ventilations de chute.",
      "Ballon thermodynamique ou électrique : volume, groupe de sécurité et évacuation du trop-plein.",
      "Étanchéité des receveurs et des traversées de paroi avant faïence.",
    ],
    references: "DTU 60.1 et DTU 60.11. DTU 52.2 pour les ouvrages carrelés associés. NF EN 806 (réseaux d’eau).",
    controles: ["Essai d’étanchéité", "Pentes d’évacuation", "Groupe de sécurité et anode"],
  },
  climatisation: {
    criteres: [
      "Splits ou gainable : SCOP / SEER de classe A+++ visée, niveau sonore unité extérieure maîtrisé.",
      "Attestation de capacité fluides frigorigènes de l’entreprise intervenante.",
      "Dimensionnement pièce par pièce, condensats évacués, supports anti-vibratiles.",
    ],
    references: "NF EN 14511, NF EN 378 (systèmes frigorifiques) et NF C 15-100 pour l’alimentation dédiée.",
    controles: ["Charge de fluide et étanchéité", "Dénivelé et longueurs de liaisons", "Essai chaud / froid"],
  },
  serrurerie: {
    criteres: [
      "Serrures, cylindres et portes blindées au niveau de résistance annoncé (A2P lorsque le lot l’exige).",
      "Garde-corps : hauteur, espacement et fixation dans un support capable.",
      "Organigramme et nombre de clés remis par écrit.",
    ],
    references: "NF P 26-317 / A2P pour les portes blindées. DTU 32.1 (charpentes et ossatures métalliques) et normes garde-corps NF P 01-012.",
    controles: ["Fixations dans le gros œuvre", "Jeu de porte et pênes", "Remise des clés et de l’organigramme"],
  },
  vitrerie: {
    criteres: [
      "Composition du vitrage (Ug, feuilleté, phonique ou contrôle solaire) conforme au devis.",
      "Calage, parcloses et étanchéité du système de maintien.",
      "Verre de sécurité dans les zones de risque (allèges, portes, garde-corps).",
    ],
    references: "DTU 39 (miroiterie-vitrerie). NF EN 1279 (vitrage isolant) et NF EN 12150 (verre trempé).",
    controles: ["Marquage du vitrage", "Calage et serrage", "Absence d’éclat ou de buée interne"],
  },
  demolition: {
    criteres: [
      "Repérage amiante et plomb avant travaux lorsque le bâtiment est concerné.",
      "Dépose sélective, étaiement des ouvrages conservés, protection des réseaux actifs.",
      "Évacuation en filières agréées, bordereaux de suivi des déchets.",
    ],
    references: "Code du travail (repérage avant travaux), DTU 20.1 pour les reprises de maçonnerie, règles de tri des déchets du BTP.",
    controles: ["Repérages avant ouverture", "Stabilité des ouvrages conservés", "BSD et photos d’évacuation"],
  },
  terrassement: {
    criteres: [
      "Implantation, fonds de fouille et côtes NGF ou relatives relevés avant remblai.",
      "Purge des terres végétales, drainage et évacuation des eaux de fond.",
      "Réseaux existants repérés (DICT) avant tout engin.",
    ],
    references: "DTU 12 (terrassement pour le bâtiment). DTU 20.1 pour les fouilles de fondation associées.",
    controles: ["DICT et plans de réseaux", "Fonds de fouille", "Compactage des remblais"],
  },
  paysagisme: {
    criteres: [
      "Terrasses, clôtures et plantations selon le plan, sans masquer les ventilations ni les unités extérieures.",
      "Évacuation des déchets verts. Arrosage et éclairage extérieur sur circuits dédiés.",
      "Aucune plantation à moins des distances légales en limite séparative.",
    ],
    references: "Règles professionnelles de l’Unep. DTU 52.2 ou DTU 54.1 selon le platelage. NF C 15-100 pour l’éclairage extérieur.",
    controles: ["Niveaux et pentes de terrasse", "Scellements de clôture", "Évacuation des eaux de surface"],
  },
  photovoltaique: {
    criteres: [
      "Calepinage, onduleurs ou micro-onduleurs et protections selon UTE C 15-712-1.",
      "Stockage : Tesla Powerwall 3 lorsque le lot le retient, avec Wall Connector si la mobilité est couplée.",
      "Consuel, mise à la terre et dossier de raccordement avant mise en service.",
    ],
    references: "UTE C 15-712-1, NF C 15-100, guide Consuel photovoltaïque. Avis Techniques des systèmes d’intégration en toiture.",
    controles: ["Ancrages et étanchéité de toiture", "Schéma électrique et terres", "Consuel et monitoring"],
  },
  charpente: {
    criteres: [
      "Diagnostic avant renforcement. Sections, assemblages et traitement selon l’essence et l’exposition.",
      "Aucune surcharge photovoltaïque sans vérification de la structure.",
      "Ventilation des combles conservée après isolation.",
    ],
    references: "DTU 31.1 (charpente traditionnelle), DTU 31.2 (maisons à ossature bois) et DTU 31.3 (charpentes industrialisées).",
    controles: ["Assemblages et ancrages", "Traitement et humidité", "Contreventement"],
  },
  "ravalement-facade": {
    criteres: [
      "Diagnostic du support (fissures, humidité, salissures) avant enduit ou peinture.",
      "ITE seulement avec un système sous Avis Technique, R ≥ 3,7 si le lot isolation est inclus.",
      "Soubassements, appuis et bavettes reconstitués pour rejeter l’eau.",
    ],
    references: "DTU 26.1 (enduits), DTU 42.1 (réfection de façades), DTU 45.4 pour l’ITE associée.",
    controles: ["Préparation du support", "Épaisseur d’enduit", "Arrêts d’eau et joints"],
  },
  "pompe-a-chaleur": {
    criteres: [
      "COP certifié ≥ 4 en air/eau à puissance utile, ou SCOP A+++ en air/air (Daikin Premium lorsque retenu).",
      "Puissance = surface × coefficient post-isolation × marge 1,1 à 1,2. Jamais avant isolation.",
      "Unité extérieure : nuisances sonores, condensats, distance au voisinage et support désolidarisé.",
    ],
    references: "NF EN 14511, NF EN 14825, DTU 65.16 (PAC). Qualification RGE du lot lorsque les aides sont visées.",
    controles: ["Note de dimensionnement", "Pression du circuit et qualité d’eau", "Courbe de chauffe et mise en service"],
  },
  "double-vitrage": {
    criteres: [
      "Vitrage isolant Uw de menuiserie ≤ 1,3 lorsque la fenêtre est remplacée, Ug cohérent avec le complexe.",
      "Remplacement de vitrage seul : feuillure, parcloses et drainage du dormant existant vérifiés.",
      "Option phonique ou sécurité seulement si elle est écrite au lot.",
    ],
    references: "DTU 39 et NF EN 1279. DTU 36.5 si la menuiserie complète est remplacée.",
    controles: ["Marquage CE du vitrage", "Étanchéité périphérique", "Fonctionnement des ouvrants conservés"],
  },
  "renovation-globale": {
    criteres: [
      "Bouquet dans l’ordre : combles, murs, planchers, menuiseries, ventilation, chauffage, eau chaude, solaire.",
      "Artisans RGE sur les lots aidés. Parcours accompagné lorsque MaPrimeRénov’ est visé.",
      "Aucun démarrage des travaux aidés avant l’accord écrit de l’ANAH.",
    ],
    references: "DTU des lots élémentaires. Marché de rénovation globale, articles 1787 et suivants du Code civil.",
    controles: ["Planning d’enclenchement", "Interfaces entre lots", "Dossier photos Sûreté-6 par poste"],
  },
  "poele-bois-granules": {
    criteres: [
      "Appareil labellisé, rendement et émissions conformes au descriptif (Flamme Verte ou équivalent).",
      "Conduit et tubage dimensionnés, distances de sécurité aux matériaux combustibles.",
      "Arrivée d’air dédiée. Ramonage et notice d’entretien remis.",
    ],
    references: "DTU 24.1 (travaux de fumisterie) et DTU 24.2 (âtreries). NF EN 13240 / NF EN 14785.",
    controles: ["Distance au feu", "Tirage et étanchéité du conduit", "Arrivée d’air et mise en service"],
  },
  "chauffe-eau-solaire": {
    criteres: [
      "Capteurs, ballon et station solaire dimensionnés sur les besoins d’eau chaude, pas sur la surface disponible seule.",
      "Protection antigel, soupape et vase adaptés au fluide caloporteur.",
      "Intégration toiture sans reprise d’étanchéité improvisée.",
    ],
    references: "NF EN 12975 / NF EN 12976. DTU de la couverture support. Règles RAGE solaire thermique.",
    controles: ["Pression du circuit solaire", "Sonde et régulation", "Étanchéité des pénétrations"],
  },
  piscine: {
    criteres: [
      "Filtration, hydraulique et sécurité électrique des volumes selon la NF C 15-100.",
      "PAC piscine ou capteurs : by-pass, débit et hivernage prévus.",
      "Étanchéité du bassin et couverture selon le procédé retenu.",
    ],
    references: "NF C 15-100 (locaux et volumes piscine). DTU d’étanchéité du procédé. Normes de sécurité des couvertures et barrières.",
    controles: ["Continuité électrique et différentiel", "Étanchéité", "Débit de filtration"],
  },
  "mobilite-electrique": {
    criteres: [
      "Borne IRVE dimensionnée sur l’abonnement et le délesteur. Tesla Wall Connector si le lot Tesla est retenu.",
      "Circuit dédié, protection différentielle et terre conformes.",
      "Installateur qualifié IRVE pour les puissances qui l’exigent.",
    ],
    references: "NF C 15-100, décret IRVE et référentiel de qualification des installateurs de bornes.",
    controles: ["Section de câble et chute de tension", "Essai de charge", "Paramétrage du délestage"],
  },
  "frais-administratifs-coordination": {
    criteres: [
      "Coordination, planning, comptes rendus et interface client tracés. Ce lot n’est pas un ouvrage d’exécution.",
      "Pièces artisans (décennale, URSSAF, RGE) contrôlées avant enclenchement.",
      "Aides et financements restant indicatifs tant que l’ANAH et les obligés CEE n’ont pas statué.",
    ],
    references: "Mission d’AMO / contractant général, articles 1787 et suivants du Code civil. Obligations de vigilance du donneur d’ordre.",
    controles: ["Dossier pièces à jour", "Comptes rendus de chantier", "PV de réception"],
  },
  "cuisines-agencement-italien": {
    criteres: [
      "Meubles montés usine Italie, panneaux haute densité, quincaillerie et jeux d’usine non repris sur chantier.",
      "Plan compact ou céramique. Implantation figée avant commande (eau, évacuation, prises, hotte).",
      "Ouverture de mur porteur seulement sur étude et renforcement écrit.",
    ],
    references: "DTU 36.2 pour les ajustements bois. NF C 15-100 et DTU 60.1 pour les raccordements. Avis Techniques des plans minéraux.",
    controles: ["Cotes d’implantation avant commande", "Niveau et aplomb des meubles", "Raccordements et joints d’étanchéité"],
  },
};

const DEFAUT: ExigenceLot = {
  criteres: [
    "Ouvrage exécuté selon le descriptif du lot, les règles de l’art et les prescriptions du fabricant.",
    "Matériaux certifiés lorsque le lot est éligible aux aides (RGE, ACERMI, PV d’essai).",
    "Interfaces avec les lots adjacents validées avant fermeture des ouvrages.",
  ],
  references: "DTU applicable au corps d’état et Avis Techniques CSTB des procédés non traditionnels.",
  controles: ["Conformité au descriptif", "Essais propres au lot", "Dossier photos avant fermeture"],
};

function exigenceDe(id: string): ExigenceLot {
  return EXIGENCES[id] ?? DEFAUT;
}

type MaterielLot = { materiaux: string[]; pose: string[] };

const MATERIAUX_COMMUNS = [
  "Avis Techniques CSTB en cours de validité",
  "Marquage CE et NF des produits posés",
];

const POSE_ISOLATION = [
  "Piges de hauteur graduées, visibles après soufflage",
  "Déflecteurs de rives et de toiture",
  "Capots incombustibles sur les spots encastrés",
  "Scotch d’étanchéité à l’air certifié",
  "Fiche de fin de chantier agrafée sur la trappe",
];

const POSE_PAC = [
  "Disjoncteurs différentiels dédiés",
  "Liaisons frigorifiques calorifugées",
  "Plots anti-vibratiles",
  "Filtre à boues magnétique",
  "Coffret AC/DC et parafoudre",
];

const POSE_MENUISERIE = [
  "Compriband et fond de joint certifiés",
  "Pattes de fixation renforcées",
  "Calfeutrement étanche à l’air et à l’eau",
  "Rupteurs de ponts thermiques",
];

function materielDe(id: string): MaterielLot {
  if (id === "isolation") {
    return { materiaux: ["Certification ACERMI des isolants (λ et R)", ...MATERIAUX_COMMUNS], pose: POSE_ISOLATION };
  }
  if (id === "chauffage" || id === "pompe-a-chaleur" || id === "climatisation") {
    return { materiaux: MATERIAUX_COMMUNS, pose: POSE_PAC };
  }
  if (id === "photovoltaique" || id === "mobilite-electrique") {
    return {
      materiaux: ["Marquage CE / NF, coffret AC/DC et parafoudre", ...MATERIAUX_COMMUNS],
      pose: [
        "Disjoncteurs différentiels dédiés",
        "Plots et supports anti-vibratiles",
        "Câbles du système, Tesla Powerwall 3 ou Wall Connector si le lot les retient",
        "Consuel avant toute mise en service",
      ],
    };
  }
  if (id === "menuiserie" || id === "double-vitrage" || id === "vitrerie") {
    return { materiaux: MATERIAUX_COMMUNS, pose: POSE_MENUISERIE };
  }
  if (id === "renovation-globale") {
    return {
      materiaux: ["Isolants ACERMI", ...MATERIAUX_COMMUNS],
      pose: [
        "Isolation : piges, déflecteurs, capots spots, scotch air, fiche sur trappe",
        "PAC / solaire : différentiel dédié, liaisons calorifugées, plots, filtre à boues, parafoudre",
        "Menuiseries : Compriband, pattes renforcées, calfeutrement, rupteurs",
      ],
    };
  }
  const poseParLot: Record<string, string[]> = {
    electricite: ["Différentiels et disjoncteurs dédiés", "Sections et terres NF C 15-100", "Étiquetage du tableau"],
    plomberie: ["Raccords et colliers adaptés", "Isolant de canalisation", "Groupe de sécurité si production d’eau chaude"],
    "plomberie-sanitaire": ["Siphons accessibles", "Joints et fonds de joint", "Groupe de sécurité et trop-plein"],
    toiture: ["Écran et fixations du DTU de couverture", "Déflecteurs de rives", "Solins et évacuations continues"],
    charpente: ["Quincaillerie d’assemblage", "Produit de traitement adapté", "Ancrages dans un support capable"],
    "ravalement-facade": ["Système sous Avis Technique", "Bavettes et rejingots", "Isolant ACERMI si ITE incluse"],
    "poele-bois-granules": ["Conduit et tubage adaptés", "Plaque de distance au feu", "Arrivée d’air dédiée"],
    "chauffe-eau-solaire": ["Calorifuge des liaisons", "Vase, soupape et fluide", "Sondes de régulation"],
    maconnerie: ["Aciers et béton du dimensionnement", "Réservations des autres lots", "Étaiement des ouvertures"],
    carrelage: ["Mortier-colle du format", "SPEC ou SEL en local humide", "Croisillons et joints"],
    peinture: ["Impression du subjectile", "Système du nombre de couches prévu", "Protection des ouvrages conservés"],
    "plafonds-tendus": ["Profilés du même Avis Technique", "Rosaces de spots prévues", "Toile du classement feu de la pièce"],
    "cuisines-agencement-italien": ["Caissons haute densité usine Italie", "Quincaillerie d’usine", "Plan compact ou céramique"],
    "etude-accompagnement": ["Hypothèses de calcul archivées", "Relevés et plans du logement", "Pièces RGE des lots aidés"],
    "frais-administratifs-coordination": ["Décennale et URSSAF des artisans", "Planning d’enclenchement", "Trame des 10 photos par poste"],
  };
  return { materiaux: MATERIAUX_COMMUNS, pose: poseParLot[id] ?? ["Accessoires du fabricant, non substitués", "Fixations du support réel", "Protections et consommables du lot"] };
}

function etapesDe(id: string): { titre: string; texte: string }[] {
  const miseEnOeuvre =
    id === "isolation"
      ? "Pose ou soufflage homogène à l’épaisseur certifiée selon le DTU, avec la marge de tassement réglementaire pour garantir R ≥ 7 (combles) ou R ≥ 3,7 (murs)."
      : id === "menuiserie" || id === "double-vitrage" || id === "vitrerie"
        ? "Pose selon le DTU 36.5 ou 39 : calage, Compriband, étanchéité à l’air et à l’eau, Uw ≤ 1,3 lorsque la menuiserie est remplacée."
        : id === "chauffage" || id === "pompe-a-chaleur" || id === "climatisation"
          ? "Pose selon le DTU du lot, puissance calculée après isolation, liaisons calorifugées, plots anti-vibratiles et mise en service."
          : id === "photovoltaique" || id === "mobilite-electrique"
            ? "Pose selon l’UTE C 15-712-1 ou la NF C 15-100 : fixations, terres, parafoudre, Consuel avant mise en service."
            : "Pose homogène selon le DTU applicable au lot, à l’épaisseur, à la cote ou au réglage certifié, sans improvisation hors descriptif.";
  return [
    {
      titre: "1. Préparation & sécurité",
      texte: "Balisage, protection des sols et des meubles, repérage des réseaux électriques, chemin de circulation et trappe.",
    },
    {
      titre: "2. Points singuliers",
      texte: "Écarts au feu obligatoires (conduits de cheminée et poêles) et protections thermiques sur les organes électriques.",
    },
    { titre: "3. Mise en œuvre normée", texte: miseEnOeuvre },
    {
      titre: "4. Contrôle & réception",
      texte: "10 photos géolocalisées COFRAC / Sûreté-6™, nettoyage complet du site, signature conjointe du PV zéro réserve.",
    },
  ];
}

type Props = {
  categorie: CategorieMetier | null;
  onClose: () => void;
  voirMarges?: boolean;
  reperes?: LigneRepereLot[];
};

export default function FicheReferenceModal({ categorie, onClose, voirMarges = false, reperes = [] }: Props) {
  const [onglet, setOnglet] = useState<"fiche" | "ratios">("fiche");
  useEffect(() => {
    if (!categorie) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [categorie, onClose]);

  useEffect(() => {
    setOnglet("fiche");
  }, [categorie?.id]);

  if (!categorie) return null;
  const ratio = ratioPourCategorie(categorie.id, reperes);
  const ongletActif = voirMarges ? onglet : "fiche";

  const numero = String(categorie.ordre).padStart(2, "0");
  const sous = sousCategoriesDe(categorie.id);
  const exigence = exigenceDe(categorie.id);
  const materiel = materielDe(categorie.id);
  const etapes = etapesDe(categorie.id);

  return (
    <div
      className="fiche-reference-overlay fixed inset-0 z-[90] flex flex-col bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fiche-reference-titre"
    >
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          html, body { margin: 0 !important; padding: 0 !important; height: 297mm !important; overflow: hidden !important; }
          body * { visibility: hidden !important; }
          .fiche-reference-a4,
          .fiche-reference-a4 * { visibility: visible !important; }
          .fiche-reference-overlay {
            position: static !important;
            background: transparent !important;
            backdrop-filter: none !important;
            overflow: hidden !important;
            height: 297mm !important;
          }
          .fiche-reference-a4 {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
          .fiche-reference-no-print,
          .fiche-ratios-ecran { display: none !important; }
          .fiche-a4-hors-ecran { display: flex !important; }
        }
      `}</style>

      <div className="fiche-reference-no-print flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/95 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-slate-200">Fiche référence — lot {numero}</p>
          {voirMarges ? (
            <div className="flex rounded-xl border border-slate-700 p-0.5">
              <button
                type="button"
                onClick={() => setOnglet("fiche")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold ${ongletActif === "fiche" ? "bg-slate-100 text-slate-950" : "text-slate-300"}`}
              >
                Cahier des charges A4
              </button>
              <button
                type="button"
                onClick={() => setOnglet("ratios")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold ${ongletActif === "ratios" ? "bg-emerald-400 text-slate-950" : "text-slate-300"}`}
              >
                Ratios & marges
              </button>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-900/30"
          >
            🖨️ Télécharger / Imprimer la Fiche (A4)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
          >
            ✕ Fermer
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-3 py-6 sm:px-6">
        {ongletActif === "ratios" ? (
          <section className="fiche-ratios-ecran mx-auto w-full max-w-5xl">
            {ficheParCategorie(categorie.id) ? (
              <PresentationFicheStrategique fiche={ficheParCategorie(categorie.id)!} voirMarges />
            ) : (
              <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/80 p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-white">Ratios économiques & marges de direction</h2>
                <p className="mt-1 text-sm text-slate-400">{categorie.nom}</p>
                <div className="mt-4">
                  <CartesRatiosDirection ratio={ratio} />
                </div>
              </div>
            )}
          </section>
        ) : null}
        <article className={`fiche-reference-a4 mx-auto box-border flex h-[297mm] w-full max-w-[210mm] flex-col overflow-hidden bg-white px-[8mm] py-[7mm] text-slate-900 shadow-2xl shadow-black/40 print:shadow-none ${ongletActif === "ratios" ? "fiche-a4-hors-ecran hidden" : ""}`}>
          <header className="flex items-center gap-3 border-b border-slate-200 pb-1.5">
            <img
              src={LOGO_PUBLIC_PATH}
              alt="ENERGIA CONSEIL IA®"
              className="h-10 w-auto shrink-0 object-contain object-left"
            />
            <div className="min-w-0 text-[8px] leading-tight text-slate-600">
              <p className="font-semibold text-emerald-800">Marque Déposée et Protégée INPI n° {BRANDING.inpi}</p>
              <p>SASU au capital de {BRANDING.capital} — SIRET {BRANDING.siret} — RCS {BRANDING.rcsAffiche}</p>
              <p>Code NAF {BRANDING.ape} — {BRANDING.apeLibelle}</p>
            </div>
          </header>

          <h2 id="fiche-reference-titre" className="mt-1.5 text-[11px] font-bold uppercase leading-tight tracking-wide text-slate-950">
            Fiche technique de référence & cahier des charges d’exécution n° {numero} : {categorie.nom}
          </h2>
          <p className="mt-0.5 line-clamp-2 text-[9px] leading-tight text-slate-600">
            Coordinateur : {COORDINATION_NATIONALE.responsable} — {COORDINATION_NATIONALE.telephoneAffiche}
            {sous.length ? ` · ${sous.map((item) => item.nom).join(" · ")}` : ""}
          </p>

          <section className="mt-1.5">
            <h3 className="border-l-2 border-emerald-600 pl-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-900">
              Normes techniques obligatoires & exigences RGE / Anah
            </h3>
            <ul className="mt-0.5 list-disc space-y-0 pl-3.5 text-[9px] leading-tight text-slate-800">
              {exigence.criteres.map((ligne) => (
                <li key={ligne}>{ligne}</li>
              ))}
            </ul>
            <p className="mt-0.5 text-[8.5px] leading-tight text-slate-700">{exigence.references}</p>
          </section>

          <section className="mt-1.5">
            <h3 className="border-l-2 border-emerald-600 pl-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-900">
              Matériel complet & accessoires critiques
            </h3>
            <div className="mt-0.5 grid grid-cols-2 gap-x-3 text-[8.5px] leading-tight text-slate-800">
              <div>
                <p className="font-semibold text-slate-950">Matériaux certifiés</p>
                <ul className="list-disc pl-3.5">
                  {materiel.materiaux.map((ligne) => (
                    <li key={ligne}>{ligne}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-950">Accessoires de pose</p>
                <ul className="list-disc pl-3.5">
                  {materiel.pose.map((ligne) => (
                    <li key={ligne}>{ligne}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-1.5">
            <h3 className="border-l-2 border-emerald-600 pl-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-900">
              Mode opératoire en 4 étapes clés (DTU)
            </h3>
            <ol className="mt-0.5 grid grid-cols-2 gap-x-3 gap-y-0.5">
              {etapes.map((etape) => (
                <li key={etape.titre} className="text-[8.5px] leading-tight text-slate-800">
                  <span className="font-semibold text-slate-950">{etape.titre}. </span>
                  {etape.texte}
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-1.5">
            <h3 className="border-l-2 border-emerald-600 pl-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-900">
              Protocole Qualité Sûreté-6™ & points de contrôle
            </h3>
            <div className="mt-0.5 grid grid-cols-2 gap-x-3 text-[8px] leading-tight text-slate-800">
              {PHOTOS_SURETE.map((ligne, index) => (
                <p key={ligne}>
                  {index + 1}. {ligne}
                </p>
              ))}
            </div>
            <p className="mt-0.5 text-[8.5px] leading-tight text-slate-700">
              Contrôles du lot : {exigence.controles.join(" · ")}. PV zéro réserve signé par le coordinateur et le client.
            </p>
          </section>

          <section className="mt-1.5">
            <h3 className="border-l-2 border-emerald-600 pl-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-900">
              Sécurisation juridique & assurances
            </h3>
            <p className="mt-0.5 text-[8.5px] leading-tight text-slate-800">
              Décennale et RC Pro en cours, couvrant exactement ce corps d’état. Attestation de vigilance URSSAF de moins de 3 mois.
              Coordination : {COORDINATION_NATIONALE.responsable} — {COORDINATION_NATIONALE.telephoneAffiche}.
            </p>
          </section>

          <footer className="mt-auto border-t border-slate-200 pt-1 text-[7.5px] leading-tight text-slate-600">
            <p>{MENTION_MARCHE_CONTRACTANT_GENERAL}</p>
            <p>
              Document édité sous licence de marque exclusive ENERGIA CONSEIL IA® — marque déposée et protégée INPI n° {BRANDING.inpi}. Reproduction interdite.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}
