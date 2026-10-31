export type FiliereId = "qualipac" | "qualipv" | "qualibois" | "renovation";

export type RgeQuestion = {
  id: string;
  filiere: FiliereId;
  theme: string;
  norme: string;
  question: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

export type ExamResult = {
  filiere: FiliereId | "mixte";
  score: number;
  total: number;
  perFiliere: Record<FiliereId, { correct: number; total: number }>;
  weakThemes: string[];
};

export const EXAM_SIZE = 30;
export const EXAM_SECONDS = 45 * 60;
export const PASS_SCORE = 24;
export const FILIERE_IDS: FiliereId[] = ["qualipac", "qualipv", "qualibois", "renovation"];

export const FILIERES: {
  id: FiliereId;
  title: string;
  subtitle: string;
  refs: string[];
  equipments: string[];
  detail: string;
  accent: string;
}[] = [
  {
    id: "qualipac",
    title: "QualiPAC 3D",
    subtitle: "PAC air/eau, air/air & CET",
    refs: ["BAR-TH-104", "BAR-TH-148", "DTU 65.16"],
    equipments: ["PAC air/eau", "PAC air/air", "CET 250 L", "Groupe 7 bar"],
    detail:
      "Coupe frigorifique, cuve isolée du chauffe-eau thermodynamique, groupe de sécurité sanitaire 7 bar, schéma hydraulique DTU 65.16 et fiches air/eau BAR-TH-104 / CET BAR-TH-148.",
    accent: "#38bdf8",
  },
  {
    id: "qualipv",
    title: "QualiPV & CESI 3D",
    subtitle: "Photovoltaïque & solaire thermique",
    refs: ["NF C 15-100", "C 15-712-1", "BAR-TH-101"],
    equipments: ["Modules toiture", "Onduleur / micro-onduleurs", "Coffrets DC/AC", "CESI glycolé"],
    detail:
      "Panneaux et capteurs en toiture, coffrets parafoudre, autoconsommation, station solaire (circulateur, vase) et ballon bi-énergie BAR-TH-101.",
    accent: "#e8c872",
  },
  {
    id: "qualibois",
    title: "Qualibois 3D",
    subtitle: "Granulés, bûches & fumisterie",
    refs: ["DTU 24.1"],
    equipments: ["Poêle granulés", "Chaudière bûches", "Vis sans fin", "Conduit double paroi"],
    detail:
      "Écorché foyer, bougie d'allumage, vis sans fin, conduit isolé double paroi, écart au feu et arrivée d'air comburant.",
    accent: "#fb923c",
  },
  {
    id: "renovation",
    title: "Rénovation Globale 3D",
    subtitle: "Enveloppe BAR-TH-164, VMC & étanchéité",
    refs: ["BAR-TH-164", "Uw ≤ 1,3", "VMC Hygro B"],
    equipments: ["Sarking / combles", "ITE / ITI", "Menuiseries", "Test d'étanchéité"],
    detail:
      "Maison écorchée : isolation toiture et murs, menuiseries Uw ≤ 1,3, flux VMC Hygro B et traitement des ponts thermiques.",
    accent: "#34d399",
  },
];

type Draft = {
  id: string;
  filiere: FiliereId;
  theme: string;
  norme: string;
  question: string;
  correct: string;
  wrong: [string, string, string];
  explanation: string;
};

const DRAFTS: Draft[] = [
  {
    id: "pac-01",
    filiere: "qualipac",
    theme: "Dimensionnement",
    norme: "NF EN 12831",
    question: "À quoi sert la température extérieure de base ?",
    correct:
      "C'est la valeur conventionnelle du lieu pour calculer les déperditions, pas le record de froid ni la moyenne de janvier",
    wrong: [
      "C'est la température moyenne de janvier, utilisée pour régler la loi d'eau",
      "C'est le point d'essai du COP à +7 °C affiché sur l'étiquette",
      "C'est la consigne intérieure diminuée de 20 °C",
    ],
    explanation:
      "La NF EN 12831 fixe une température extérieure de base, conventionnelle, pour dimensionner la puissance. Ce n'est ni la température la plus basse jamais mesurée, ni la moyenne hivernale. S'en écarter fausse les déperditions, donc la puissance de la PAC et le point de bivalence.",
  },
  {
    id: "pac-02",
    filiere: "qualipac",
    theme: "Dimensionnement",
    norme: "NF EN 12831 · DTU 65.16",
    question: "Dimensionner une PAC air/eau sur la puissance de l'ancienne chaudière, avant isolation, conduit à :",
    correct: "Un surdimensionnement : courts cycles, COP dégradé et surcoût de matériel",
    wrong: [
      "La méthode imposée par la fiche BAR-TH-104",
      "Une PAC plus fiable, car la marge compense toujours le dégivrage",
      "La suppression possible du vase d'expansion",
    ],
    explanation:
      "La puissance se calcule sur les déperditions après isolation (NF EN 12831), avec une marge raisonnable, pas sur la plaque de l'ancienne chaudière. Une PAC trop forte court-cycle, use le compresseur et baisse le COP saisonnier. Le DTU 65.16 encadre l'installation hydraulique une fois cette puissance connue.",
  },
  {
    id: "pac-03",
    filiere: "qualipac",
    theme: "Loi d'eau",
    norme: "DTU 65.16",
    question: "Entre un plancher chauffant et des radiateurs haute température, la pente de loi d'eau du plancher est :",
    correct: "Plus faible, car l'émetteur travaille à basse température de départ",
    wrong: [
      "Toujours plus forte, pour compenser l'inertie du plancher",
      "Nulle : le plancher se régule uniquement en tout ou rien",
      "Identique : seule la vitesse du circulateur change",
    ],
    explanation:
      "La loi d'eau relie la température de départ d'eau à la température extérieure. Un plancher chauffant émet à basse température : la pente reste douce. Une pente de radiateur (départ élevé par grand froid) sur un plancher surchauffe la dalle, dégrade le COP et peut dépasser la limite de température de surface.",
  },
  {
    id: "pac-04",
    filiere: "qualipac",
    theme: "Loi d'eau",
    norme: "DTU 65.16",
    question: "Le décalage parallèle d'une loi d'eau sert à :",
    correct: "Translater toute la courbe sans changer sa pente, pour ajuster le confort",
    wrong: [
      "Modifier uniquement la pente quand il gèle",
      "Remplacer un désembouage incomplet",
      "Augmenter la pression de gonflage du vase d'expansion",
    ],
    explanation:
      "La pente dépend du type d'émetteur. Le décalage (translation parallèle) relève ou abaisse toute la courbe quand le logement est trop frais ou trop chaud à toute température extérieure. On ne corrige pas un problème de pente par un simple décalage, ni l'inverse.",
  },
  {
    id: "pac-05",
    filiere: "qualipac",
    theme: "Hydraulique",
    norme: "DTU 65.16",
    question: "Où se pose le filtre à boues magnétique sur une PAC air/eau raccordée à un réseau existant ?",
    correct: "Sur le retour, en amont de l'échangeur de la PAC",
    wrong: [
      "Sur le départ, immédiatement sous les radiateurs les plus éloignés",
      "Sur l'arrivée d'eau froide sanitaire du chauffe-eau",
      "Dans le bac à condensats de l'unité extérieure",
    ],
    explanation:
      "Les boues et les particules magnétiques (magnétite) se concentrent dans le retour. Le filtre magnétique se place avant l'échangeur à plaques ou le condenseur hydraulique, sinon elles l'encrassent, font chuter l'échange et peuvent lever un défaut débit. Il complète le désembouage, il ne le remplace pas.",
  },
  {
    id: "pac-06",
    filiere: "qualipac",
    theme: "Hydraulique",
    norme: "DTU 65.16",
    question: "Peut-on poser une vanne d'isolement entre la PAC et la soupape de sécurité chauffage ?",
    correct: "Non : aucun organe d'isolement entre le générateur et la soupape",
    wrong: [
      "Oui, si la vanne est plombée ouverte et repérée sur le schéma",
      "Oui, c'est même obligatoire pour remplacer la soupape sans vidange",
      "Oui, uniquement sur une installation monophasée",
    ],
    explanation:
      "La soupape de sécurité du circuit chauffage (tarage usuel 3 bar, installation basse température) doit rester en communication permanente avec le générateur. Une vanne fermée par erreur supprime la protection contre la surpression. La décharge est conduite vers une évacuation visible.",
  },
  {
    id: "pac-07",
    filiere: "qualipac",
    theme: "Hydraulique",
    norme: "DTU 65.16",
    question: "Quelle pression de tarage distingue le circuit chauffage de l'eau chaude sanitaire ?",
    correct: "Soupape chauffage 3 bar ; groupe de sécurité sanitaire du CET 7 bar",
    wrong: [
      "Les deux organes sont tarés à 3 bar",
      "Chauffage 7 bar et sanitaire 3 bar, car l'ECS est plus froide",
      "Une seule soupape 10 bar protège les deux réseaux s'ils sont raccordés",
    ],
    explanation:
      "Le circuit fermé de chauffage se protège en général à 3 bar. Le ballon sanitaire d'un chauffe-eau thermodynamique (fiche BAR-TH-148) reçoit un groupe de sécurité taré à 7 bar, sur l'arrivée d'eau froide, avec écoulement libre. Intervertir les deux organes est une non-conformité classique.",
  },
  {
    id: "pac-08",
    filiere: "qualipac",
    theme: "Hydraulique",
    norme: "DTU 65.16",
    question: "Comment règle-t-on la pression de gonflage du vase d'expansion chauffage ?",
    correct: "À la pression statique de l'installation, majorée d'environ 0,2 à 0,3 bar, vase isolé du réseau",
    wrong: [
      "Toujours à 3 bar, pour coller au tarage de la soupape",
      "À 0 bar : le vase se gonfle tout seul à la mise en eau",
      "À la pression du fluide frigorigène mesurée sur la vanne service",
    ],
    explanation:
      "Le vase absorbe la dilatation de l'eau. Sa pression de gonflage (à l'azote, vase séparé du circuit) suit la hauteur statique, avec une marge d'environ 0,2 à 0,3 bar. On le raccorde sur le retour, côté aspiration du circulateur, pour que le point de raccordement reste le point neutre. Un vase à 0 bar ou gonflé à 3 bar ne remplit plus son rôle.",
  },
  {
    id: "pac-09",
    filiere: "qualipac",
    theme: "Hydraulique",
    norme: "DTU 65.16",
    question: "Avant de raccorder une PAC sur un réseau de radiateurs existant, la séquence correcte est :",
    correct: "Désembouer, rincer jusqu'à eau claire, injecter un inhibiteur, puis protéger le retour par un filtre magnétique",
    wrong: [
      "Ajouter l'inhibiteur sur l'eau sale : le filtre fera le reste en quelques jours",
      "Rincer uniquement si les radiateurs sont froids en partie basse",
      "Remplacer l'eau par du glycol sanitaire sans analyse ni filtre",
    ],
    explanation:
      "Une PAC a un échangeur beaucoup plus sensible qu'une vieille chaudière fonte. Le désembouage et le rinçage jusqu'à eau claire sont un préalable. L'inhibiteur se dose ensuite sur un réseau propre. Le filtre à boues magnétique reste en place sur le retour. Verser l'inhibiteur dans une boue dilue le produit et laisse la magnétite circuler.",
  },
  {
    id: "pac-10",
    filiere: "qualipac",
    theme: "Fluides frigorigènes",
    norme: "DTU 65.16 · liaisons frigorifiques",
    question: "Que faut-il faire sur des liaisons frigorifiques avant d'ouvrir les vannes d'un groupe préchargé ?",
    correct: "Contrôler l'étanchéité sous azote, puis réaliser un tirage au vide poussé",
    wrong: [
      "Purger les liaisons à l'atmosphère avec une pincée de fluide",
      "Remplir les liaisons d'eau glycolée pour chasser l'air",
      "Chauffer les dudgeons au chalumeau pour les sertir",
    ],
    explanation:
      "L'épreuve sous azote révèle les fuites (dudgeons, raccords). Le tirage au vide ensuite chasse l'air et l'humidité, ennemis de l'huile et du compresseur. Rejeter du fluide à l'air libre est interdit. La charge ne s'ouvre qu'une fois le vide tenu. Le couple de serrage des dudgeons est celui de la notice, pas une chauffe.",
  },
  {
    id: "pac-11",
    filiere: "qualipac",
    theme: "Fluides frigorigènes",
    norme: "Notice constructeur · liaisons frigorifiques",
    question: "La liaison dépasse la longueur préchargée par le constructeur. Quelle est la règle ?",
    correct: "Compléter la charge selon la notice, en grammes par mètre supplémentaire",
    wrong: [
      "Ne jamais ajouter de fluide : la précharge couvre toutes les longueurs",
      "Vider le groupe et recharger « au manomètre » sans pesée",
      "Allonger seulement la liaison liquide, la liaison gaz se passe de complément",
    ],
    explanation:
      "La précharge couvre une longueur donnée (souvent quelques mètres). Au-delà, l'appoint est une masse, en g/m, lue dans la notice et pesée. Une charge à l'œil donne soit un manque de puissance, soit des coups de liquide au compresseur. Les deux liaisons sont isolées, la ligne gaz en particulier, avec une protection aux UV.",
  },
  {
    id: "pac-12",
    filiere: "qualipac",
    theme: "Fluides frigorigènes",
    norme: "Fiche de sécurité fluide",
    question: "Par rapport au R410A, le R32 utilisé sur beaucoup de PAC récentes est :",
    correct: "Un fluide A2L, légèrement inflammable, au GWP nettement plus faible",
    wrong: [
      "Un fluide A3, même famille que le propane, interdit dans une PAC",
      "Un fluide ininflammable qui dispense du tirage au vide",
      "Un fluide qui se manipule sans pesée ni détection de fuite",
    ],
    explanation:
      "Le R32 est classé A2L : toxicité faible, inflammabilité légère. Son GWP (675) est très inférieur à celui du R410A (environ 2 088). La mise en œuvre garde le tirage au vide, la pesée, l'outillage compatible et les précautions d'aération. Ce n'est pas un A3 et ce n'est pas un motif pour relâcher l'étanchéité.",
  },
  {
    id: "pac-13",
    filiere: "qualipac",
    theme: "Performance",
    norme: "Étiquetage · essai A7/W35",
    question: "Que mesure le SCOP que le COP ponctuel ne mesure pas ?",
    correct: "La performance sur une saison de chauffe, là où le COP est un point d'essai (souvent A7/W35)",
    wrong: [
      "Uniquement le rendement à −15 °C extérieur",
      "La production d'eau chaude sanitaire du ballon tampon",
      "Le niveau sonore de l'unité extérieure en décibels",
    ],
    explanation:
      "Le COP est un rapport puissance calorifique / puissance électrique à un point fixe, souvent air 7 °C et eau 35 °C. Le SCOP intègre une saison, donc les charges partielles, le dégivrage et les températures plus basses. C'est lui qui rapproche le discours commercial de la facture réelle. Il ne remplace pas un dimensionnement à la température de base.",
  },
  {
    id: "pac-14",
    filiere: "qualipac",
    theme: "Dimensionnement",
    norme: "NF EN 12831",
    question: "Le point de bivalence d'une PAC air/eau est :",
    correct:
      "La température extérieure où la puissance PAC égale les déperditions ; en dessous, l'appoint couvre l'écart",
    wrong: [
      "La consigne d'eau chaude sanitaire à 55 °C",
      "La température de départ d'eau fixée à 35 °C toute l'année",
      "Le seuil de pression qui ouvre la soupape 3 bar",
    ],
    explanation:
      "À la bivalence, la courbe de puissance de la PAC croise la courbe de déperditions. Plus froid, la PAC ne suffit plus : l'appoint (électrique ou autre, selon le schéma) fournit le complément. Confondre ce point avec une loi d'eau ou avec la soupape conduit à un appoint qui ne démarre jamais, ou qui tourne en permanence.",
  },
  {
    id: "pac-15",
    filiere: "qualipac",
    theme: "Hydraulique",
    norme: "DTU 65.16",
    question: "À quoi sert un ballon tampon sur une PAC air/eau ?",
    correct: "À donner un volume de découplage : dégivrage et limitation des courts cycles",
    wrong: [
      "À produire l'eau chaude sanitaire à la place du CET",
      "À remplacer le vase d'expansion et la soupape",
      "À filtrer les boues à la place du pot à boues magnétique",
    ],
    explanation:
      "Le tampon n'est pas un ballon sanitaire. Il assure un volume d'eau minimum pour que le compresseur ne court-cycle pas, et une réserve d'énergie lors du dégivrage par inversion de cycle. Le volume se lit dans la notice (souvent ramené en litres par kilowatt). L'ECS reste un ballon dédié, avec son groupe de sécurité 7 bar.",
  },
  {
    id: "pac-16",
    filiere: "qualipac",
    theme: "Fiches CEE",
    norme: "BAR-TH-104",
    question: "La fiche CEE BAR-TH-104 concerne :",
    correct: "Une pompe à chaleur air/eau",
    wrong: [
      "Un chauffe-eau thermodynamique à accumulation",
      "Une chaudière à granulés hydraulique",
      "Une rénovation globale de maison individuelle",
    ],
    explanation:
      "BAR-TH-104 est la fiche d'opération standardisée de la PAC air/eau. Le chauffe-eau thermodynamique relève de BAR-TH-148, le bouquet de rénovation globale de BAR-TH-164. Mélanger les fiches, c'est déposer un dossier CEE sur le mauvais équipement et risquer un refus de valorisation.",
  },
  {
    id: "pac-17",
    filiere: "qualipac",
    theme: "Fiches CEE",
    norme: "BAR-TH-148",
    question: "La fiche CEE BAR-TH-148 concerne :",
    correct: "Un chauffe-eau thermodynamique à accumulation",
    wrong: [
      "Une PAC air/air monosplit",
      "L'isolation des murs par l'extérieur",
      "Un onduleur photovoltaïque en autoconsommation",
    ],
    explanation:
      "BAR-TH-148 vise le chauffe-eau thermodynamique. L'appareil prélève les calories sur l'air (ambiant, extérieur ou extrait selon le modèle) pour chauffer un ballon. Le groupe de sécurité sanitaire reste à 7 bar, les condensats s'évacuent, et le local doit offrir le volume d'air ou la gaine prévus par la notice. Ce n'est pas une PAC de chauffage.",
  },
  {
    id: "pac-18",
    filiere: "qualipac",
    theme: "Électricité",
    norme: "NF C 15-100",
    question: "Quelle alimentation électrique est conforme pour une PAC inverter ?",
    correct:
      "Un circuit spécialisé, sectionné selon la NF C 15-100, avec différentiel 30 mA du type imposé par la notice (A, F ou B)",
    wrong: [
      "Une reprise sur le circuit prises 16 A du séjour, en 1,5 mm²",
      "Une alimentation sans terre, le châssis étant isolé par les plots",
      "Le câble DC du champ photovoltaïque, déjà protégé par l'onduleur",
    ],
    explanation:
      "La PAC part sur un circuit spécialisé. La section dépend de l'intensité, du mode de pose, de la longueur et de la chute de tension (NF C 15-100), pas d'une habitude. Le différentiel 30 mA est du type demandé par le fabricant : un type AC est souvent inadapté à un variateur. La terre est obligatoire. Le câble DC photovoltaïque n'a rien à faire sur ce circuit.",
  },
  {
    id: "pac-19",
    filiere: "qualipac",
    theme: "Pose",
    norme: "DTU 65.16",
    question: "Les condensats de l'unité extérieure doivent :",
    correct: "S'évacuer de façon gravitaire, hors gel, sans stagner ni geler sur un passage",
    wrong: [
      "Être renvoyés dans le circuit frigorigène pour améliorer le COP",
      "Couler librement devant l'appareil, le bac étant prévu pour ça",
      "Être bouchés en hiver afin d'éviter tout rejet d'eau",
    ],
    explanation:
      "En chauffage, l'évaporateur condense puis givre. Le dégivrage libère une quantité d'eau importante. L'évacuation est gravitaire, isolée si elle peut geler, et ne débouche pas sur un passage où elle formerait une plaque de glace. Obturer le rejet noie le bac et peut prendre l'hélice dans la glace.",
  },
  {
    id: "pac-20",
    filiere: "qualipac",
    theme: "Dimensionnement",
    norme: "NF EN 12831",
    question: "Dans une rénovation globale, à quel moment fige-t-on la puissance de la PAC ?",
    correct: "Après l'isolation de l'enveloppe, sur les déperditions recalculées",
    wrong: [
      "Dès la visite commerciale, d'après la facture de fioul",
      "Après la pose des modules photovoltaïques, qui chauffent la toiture",
      "Avant les menuiseries, car les fenêtres ne changent pas les déperditions",
    ],
    explanation:
      "L'isolation change les déperditions de façon massive. Dimensionner avant, c'est figer une puissance trop forte (souvent plusieurs kilowatts de trop) et rater le point de bivalence. L'ordre de l'académie est constant : enveloppe d'abord, émetteurs et ventilation, puis générateur. Les menuiseries participent au calcul, elles ne sont pas négligeables.",
  },
  {
    id: "pv-01",
    filiere: "qualipv",
    theme: "Grandeurs",
    norme: "Conditions STC",
    question: "Le kilowatt-crête (kWc) d'un module est :",
    correct: "Sa puissance sous conditions STC : 1 000 W/m², 25 °C cellule, AM 1,5",
    wrong: [
      "L'énergie produite en un an sur une toiture sud",
      "La puissance maximale de l'onduleur côté AC",
      "Le courant de court-circuit multiplié par la tension du réseau 230 V",
    ],
    explanation:
      "Le Wc se mesure aux conditions standard : éclairement 1 000 W/m², température de cellule 25 °C, spectre AM 1,5. Ce n'est pas une énergie. Le productible annuel s'exprime en kWh/kWc/an et dépend du site, de l'orientation, de l'inclinaison et des ombres. Confondre kWc et kWh fausse le discours d'autoconsommation.",
  },
  {
    id: "pv-02",
    filiere: "qualipv",
    theme: "Dimensionnement strings",
    norme: "NF C 15-100 · C 15-712-1",
    question: "Que devient la tension à vide Voc d'une chaîne quand la température des cellules baisse ?",
    correct: "Elle augmente : on vérifie que Voc à la température minimale reste sous la tension max de l'onduleur",
    wrong: [
      "Elle baisse, comme le courant : le risque est seulement l'été",
      "Elle ne dépend que de l'éclairement, pas de la température",
      "Elle est écrêtée par le sectionneur DC, donc le calcul est inutile",
    ],
    explanation:
      "Le coefficient de température de la tension est négatif : plus la cellule est froide, plus Voc est élevée. Un matin d'hiver très clair peut dépasser la tension d'entrée maximale de l'onduleur et le détruire. Le contrôle se fait à la température minimale de cellule du site, chaîne ouverte, pas à 25 °C.",
  },
  {
    id: "pv-03",
    filiere: "qualipv",
    theme: "Dimensionnement strings",
    norme: "NF C 15-100 · C 15-712-1",
    question: "Sur quelle intensité se dimensionnent câbles et protections DC d'une chaîne ?",
    correct: "Sur 1,25 fois le courant de court-circuit Isc dans les conditions de calcul",
    wrong: [
      "Sur le courant nominal de l'abonnement 230 V",
      "Sur l'intensité du différentiel AC divisée par le nombre de modules",
      "Sur 0,8 fois Impp, pour tenir compte des ombres",
    ],
    explanation:
      "Le courant de court-circuit PV dépasse Impp, et l'éclairement peut dépasser 1 000 W/m². La règle de l'art majore Isc (facteur 1,25) pour la section des câbles DC et le calibre des protections de chaîne. Les câbles sont prévus pour la tension DC, à double isolation, et ne sont pas du câble bâtiment ordinaire.",
  },
  {
    id: "pv-04",
    filiere: "qualipv",
    theme: "Sécurité",
    norme: "NF C 15-100 · C 15-712-1",
    question: "L'onduleur est coupé côté AC. Que peut-on affirmer sur le champ de modules en pleine journée ?",
    correct: "Les câbles DC restent sous tension tant qu'il y a de la lumière : le danger n'est pas supprimé",
    wrong: [
      "Tout le champ est hors tension, comme un circuit prises ouvert",
      "Seule la première chaîne reste sous tension, les autres s'éteignent",
      "Le sectionneur AC décharge les modules en moins d'une seconde",
    ],
    explanation:
      "Un module éclairé est un générateur. Ouvrir l'AC ou arrêter l'onduleur ne met pas le DC à zéro. L'étiquette de danger, le sectionneur DC et les consignes d'intervention en tiennent compte. C'est le piège le plus grave de la filière : croire qu'un disjoncteur 230 V « coupe le toit ».",
  },
  {
    id: "pv-05",
    filiere: "qualipv",
    theme: "Norme",
    norme: "NF C 15-100 · C 15-712-1",
    question: "Quel couple de textes encadre une installation photovoltaïque raccordée au réseau basse tension ?",
    correct: "La NF C 15-100 pour l'installation électrique, et le guide C 15-712-1 pour la partie photovoltaïque",
    wrong: [
      "Uniquement le DTU 24.1, car les câbles passent en toiture",
      "Uniquement la fiche BAR-TH-104",
      "Le seul avis de l'assureur, sans norme d'installation",
    ],
    explanation:
      "La NF C 15-100 reste la norme des installations électriques à basse tension. Le guide UTE C 15-712-1 précise les règles propres au photovoltaïque : câbles DC, découplage, parafoudres, signalisation, onduleurs. Le DTU 24.1 concerne la fumisterie, pas le champ PV.",
  },
  {
    id: "pv-06",
    filiere: "qualipv",
    theme: "Raccordement",
    norme: "Consuel · Enedis",
    question: "Avant la mise en service d'une installation de production raccordée au réseau, il faut :",
    correct: "L'attestation de conformité Consuel, puis l'accord de raccordement du gestionnaire de réseau",
    wrong: [
      "Uniquement la facture des modules, l'onduleur se déclare tout seul",
      "Le qualificatif RGE suffit à injecter dès la pose",
      "Une déclaration en mairie après un an de fonctionnement",
    ],
    explanation:
      "On ne raccorde pas une production au réseau sur un simple essai. Le Consuel atteste la conformité électrique. Enedis (ou l'ELD) autorise la mise en service selon le contrat : autoconsommation avec vente du surplus, ou injection totale. Injecter sans ces étapes expose à un refus de raccordement et à un risque pour le réseau.",
  },
  {
    id: "pv-07",
    filiere: "qualipv",
    theme: "Sécurité",
    norme: "NF C 15-100 · C 15-712-1",
    question: "Les cadres métalliques des modules doivent :",
    correct: "Être reliés à la terre par une liaison équipotentielle des masses",
    wrong: [
      "Rester flottants pour ne pas créer de boucle d'induction",
      "Être reliés au pôle négatif DC de la chaîne",
      "Être peints pour isoler la terre, surtout en autoconsommation",
    ],
    explanation:
      "Les masses (cadres, structures) se raccordent à la borne de terre. Une masse flottante peut monter en potentiel en cas de défaut d'isolement. On n'utilise pas un pôle DC comme terre. La liaison se contrôle : continuité, section, et absence de serrage sur l'anodisation sans dispositif prévu pour percer le traitement.",
  },
  {
    id: "pv-08",
    filiere: "qualipv",
    theme: "Sécurité",
    norme: "C 15-712-1",
    question: "Le parafoudre côté DC est-il systématique sur toute toiture photovoltaïque ?",
    correct:
      "Non : le guide C 15-712-1 le rend nécessaire selon le niveau kéraunique, la longueur de ligne DC et la présence d'un paratonnerre",
    wrong: [
      "Oui, un parafoudre DC type 1 est obligatoire sur chaque module",
      "Non, le photovoltaïque est dispensé de protection foudre en France",
      "Oui, mais seulement si l'onduleur est dans les combles perdus",
    ],
    explanation:
      "La protection contre les surtensions n'est pas un réflexe unique. Elle dépend de la densité de foudroiement, de la longueur entre modules et onduleur, et de l'existence d'un paratonnerre sur le bâtiment. Poser un parafoudre inadapté (mauvais type, mauvaise tension, terre trop longue) donne une fausse sécurité.",
  },
  {
    id: "pv-09",
    filiere: "qualipv",
    theme: "Sécurité",
    norme: "C 15-712-1",
    question: "Deux connecteurs DC de marques différentes, « compatibles MC4 » d'après le vendeur :",
    correct: "Ne s'accouplent pas : on apparie des connecteurs de la même famille, sertis avec l'outil prévu",
    wrong: [
      "Sont acceptés dès qu'ils s'enclenchent à la main",
      "Sont obligatoires pour distinguer les chaînes entre elles",
      "Se justifient si l'un des deux est noir et l'autre rouge",
    ],
    explanation:
      "Un connecteur qui « rentre » n'est pas un connecteur conforme. Le mélange de fabricants est une cause connue d'échauffement et d'incendie : géométrie, joint et sertissage diffèrent. On sertit avec la pince du système, on contrôle le clic, et on ne laisse pas un connecteur ouvert à la pluie.",
  },
  {
    id: "pv-10",
    filiere: "qualipv",
    theme: "Sécurité",
    norme: "C 15-712-1",
    question: "À quoi sert le sectionneur DC placé près de l'onduleur ?",
    correct: "À séparer le champ DC de l'onduleur de façon certaine, en charge si l'appareil est prévu pour cela",
    wrong: [
      "À régler la tension Voc en hiver",
      "À remplacer le différentiel 30 mA du tableau",
      "À vendre le surplus sans contrat d'injection",
    ],
    explanation:
      "Le sectionneur DC isole l'onduleur du générateur pour la maintenance. Il est adapté à la tension et au courant DC, et à la coupure en charge lorsque c'est exigé. Il ne remplace ni le différentiel AC, ni le Consuel, ni la coupure d'urgence. Son accès reste dégagé et repéré.",
  },
  {
    id: "pv-11",
    filiere: "qualipv",
    theme: "Architecture",
    norme: "C 15-712-1",
    question: "Une cheminée porte une ombre mouvante sur un module d'une longue chaîne. Quelle architecture limite le mieux la perte ?",
    correct: "Des micro-onduleurs ou des optimiseurs, qui isolent l'effet au module ombré",
    wrong: [
      "Allonger la chaîne : plus il y a de modules, moins l'ombre compte",
      "Orienter toute la chaîne au nord pour lisser l'éclairement",
      "Shunter la diode de by-pass, qui consomme de l'énergie",
    ],
    explanation:
      "Dans une chaîne, le courant est celui du maillon le plus faible. Les diodes de by-pass limitent la casse au sous-groupe, mais la production de la chaîne chute quand même. Micro-onduleur ou optimiseur cantonne l'ombre au module concerné. Supprimer une diode de by-pass crée un point chaud. Le nord n'est pas une stratégie d'ombrage.",
  },
  {
    id: "pv-12",
    filiere: "qualipv",
    theme: "Productible",
    norme: "Productible France",
    question: "Pour un productible annuel maximal en France métropolitaine, on vise en priorité :",
    correct: "Une orientation proche du sud et une inclinaison d'environ 30 à 35° selon la latitude, sans ombre proche",
    wrong: [
      "Une façade plein nord, verticale, pour capter le soleil d'été",
      "Une inclinaison à 5°, quelle que soit la région, afin de poser plus de modules",
      "L'est le matin et l'ouest l'après-midi sur la même chaîne série",
    ],
    explanation:
      "Le productible se compte en kWh/kWc/an : de l'ordre de 1 000 au nord, souvent 1 200 à 1 400 au sud, selon masques et inclinaison. Le plein sud et une inclinaison voisine de 30-35° sont la référence pédagogique en métropole. Une ombre proche (cheminée, lucarne, arbre) pèse plus qu'un écart de quelques degrés. On ne met pas est et ouest dans la même chaîne.",
  },
  {
    id: "pv-13",
    filiere: "qualipv",
    theme: "Raccordement",
    norme: "Enedis · autoconsommation",
    question: "En autoconsommation avec vente du surplus, l'installation :",
    correct: "Consomme d'abord sur place et n'injecte le surplus qu'avec un contrat et une mise en service autorisée",
    wrong: [
      "Peut injecter librement : le compteur Linky régularise sans démarche",
      "Doit déconnecter l'onduleur dès que la maison ne consomme plus",
      "Est interdite dès qu'il y a une PAC dans le même tableau",
    ],
    explanation:
      "L'autoconsommation individuelle avec surplus suppose une demande de raccordement, un contrat d'achat ou de cession du surplus, et la mise en service. Injecter « en attendant le papier » n'est pas une zone grise acceptable. La présence d'une PAC ne l'interdit pas : elle augmente au contraire souvent le taux d'autoconsommation si les usages sont pilotés.",
  },
  {
    id: "pv-14",
    filiere: "qualipv",
    theme: "Sécurité",
    norme: "NF C 15-100 · C 15-712-1",
    question: "La coupure d'urgence demandée pour les secours agit surtout sur :",
    correct: "La partie AC ; le champ DC éclairé reste une source et doit être traité comme tel",
    wrong: [
      "Les deux polarités DC de chaque module, qui tombent à 0 V",
      "Uniquement le différentiel des prises de la cuisine",
      "Le parafoudre, qui se met en court-circuit volontaire",
    ],
    explanation:
      "La coupure d'urgence, accessible et identifiée, ouvre la production côté alternatif pour protéger les intervenants sur le réseau du bâtiment. Elle ne rend pas un module sombre. Le repérage DC, le sectionneur et la consigne « tension présente de jour » restent affichés près de l'onduleur.",
  },
  {
    id: "pv-15",
    filiere: "qualipv",
    theme: "Électricité",
    norme: "NF C 15-100",
    question: "Quel différentiel place-t-on en amont d'un onduleur sans transformateur ?",
    correct: "Celui imposé par la notice : souvent un type A si la protection DC est intégrée, un type B si le courant de défaut continu n'est pas couvert",
    wrong: [
      "Toujours un type AC, moins cher et suffisant pour tout onduleur",
      "Aucun : l'onduleur est de classe II donc dispensé de différentiel",
      "Un différentiel 500 mA instantané, pour éviter les déclenchements",
    ],
    explanation:
      "Un onduleur sans séparation galvanique peut renvoyer une composante continue. Un différentiel type AC ne la voit pas correctement. La notice tranche : dispositif intégré plus type A en amont, ou type B (ou B+ selon les cas) si rien ne couvre le défaut DC. Un calibre 500 mA n'est pas la protection des personnes à 30 mA.",
  },
  {
    id: "pv-16",
    filiere: "qualipv",
    theme: "Productible",
    norme: "Conditions STC",
    question: "Un commercial annonce « 1 200 kWc par an » pour une toiture de 6 kWc à Lyon. Quelle lecture est juste ?",
    correct: "L'unité est fausse : 1 200 kWh/kWc/an est un productible, soit environ 7 200 kWh/an pour 6 kWc",
    wrong: [
      "1 200 kWc/an est l'unité officielle du Consuel",
      "Il faut diviser 6 kWc par 1 200 pour obtenir l'énergie",
      "Le kWc/an mesure la tension à vide hivernale",
    ],
    explanation:
      "Le productible s'exprime en kilowattheures par kilowatt-crête et par an. Autour de 1 100 à 1 300 kWh/kWc/an est un ordre de grandeur du centre-est, avant masques. Pour 6 kWc : 6 × 1 200 = 7 200 kWh/an, pas 1 200 kWc. Cette confusion est un grand classique des devis à reprendre.",
  },
  {
    id: "bois-01",
    filiere: "qualibois",
    theme: "Fumisterie",
    norme: "DTU 24.1",
    question: "Le NF DTU 24.1 encadre principalement :",
    correct: "La conception et la mise en œuvre des conduits de fumée",
    wrong: [
      "Le dimensionnement électrique d'une PAC inverter",
      "Le raccordement d'un onduleur photovoltaïque",
      "Le calcul des déperditions selon la NF EN 12831",
    ],
    explanation:
      "Le DTU 24.1 est le texte de la fumisterie : tracé du conduit, matériaux, désignation, distance aux combustibles, traversées, souche, tubage. Il ne se remplace ni par une notice commerciale de poêle, ni par le DTU 65.16 des PAC. L'appareil et le conduit forment un couple : l'un conforme sans l'autre ne l'est pas.",
  },
  {
    id: "bois-02",
    filiere: "qualibois",
    theme: "Fumisterie",
    norme: "DTU 24.1",
    question: "Dans la désignation d'un conduit, une classe G50 signifie notamment :",
    correct: "Résistance au feu de cheminée, avec une distance de sécurité de 50 mm aux matériaux combustibles",
    wrong: [
      "Un rendement garanti de 50 % sur granulés humides",
      "Une section de conduit de 50 cm², suffisante pour tout poêle",
      "Une température de fumée maximale de 50 °C",
    ],
    explanation:
      "La lettre G indique la résistance à un feu de cheminée (suie). Le nombre qui suit est la distance minimale aux combustibles, en millimètres. G50 n'autorise pas à coller le conduit à une poutre. Réduire cette distance au nom de l'esthétique est une non-conformité DTU 24.1, quel que soit le diamètre.",
  },
  {
    id: "bois-03",
    filiere: "qualibois",
    theme: "Fumisterie",
    norme: "DTU 24.1",
    question: "Un boisseau maçonné ancien, non conforme et hétérogène, pour un poêle à granulés :",
    correct: "Se tube avec un conduit adapté, mis en œuvre selon le DTU 24.1, après diagnostic du conduit existant",
    wrong: [
      "S'utilise tel quel si le tirage « a l'air bon » le jour de la pose",
      "Se chemise avec un flexible non classé, plus souple à passer",
      "Peut être abandonné : un poêle étanche n'a pas besoin de conduit",
    ],
    explanation:
      "Le conduit existant se diagnostique (stabilité, section, dévoiements, souche). S'il n'est pas apte, le tubage se fait avec un procédé désigné pour l'usage, pas avec un flexible de ventilation. Un poêle étanche a toujours une évacuation des fumées conforme. Le raccordement et la ventilation de l'espace annulaire suivent le DTU 24.1.",
  },
  {
    id: "bois-04",
    filiere: "qualibois",
    theme: "Air comburant",
    norme: "DTU 24.1",
    question: "Après une rénovation qui rend le logement très étanche, un poêle qui prenait son air dans la pièce :",
    correct: "Doit avoir une amenée d'air comburant dimensionnée, directe ou par conduit, sinon la combustion se dégrade",
    wrong: [
      "N'a plus besoin d'air : l'étanchéité améliore le tirage",
      "Peut prendre l'air de la VMC en aspirant sur une bouche d'extraction",
      "Se contente d'entrouvrir la trappe de ramonage",
    ],
    explanation:
      "Le bois consomme de l'air. Une enveloppe étanche sans amenée d'air met le logement en dépression, surtout avec une VMC, et peut inverser le tirage. L'amenée est dimensionnée selon la puissance, débouchant correctement, et non piquée sur l'extraction de la VMC. C'est un point de vigilance majeur quand Qualibois croise une rénovation globale.",
  },
  {
    id: "bois-05",
    filiere: "qualibois",
    theme: "Entretien",
    norme: "Règlement sanitaire · DTU 24.1",
    question: "Le ramonage d'un conduit de fumée utilisé pour le chauffage :",
    correct: "Se fait deux fois par an, dont une fois pendant la période de chauffe",
    wrong: [
      "Se fait une fois tous les cinq ans, comme le contrôle électrique",
      "Est inutile sur les granulés, qui ne produisent pas de suie",
      "Peut être remplacé par un additif versé dans le réservoir",
    ],
    explanation:
      "Le règlement sanitaire type impose deux ramonages annuels, dont un en période d'utilisation. Les granulés encrassent moins qu'un bois humide, ils n'exemptent pas le conduit. Le ramonage mécanique s'accompagne du contrôle de l'état du conduit. Un additif n'est pas un ramonage et ne se déclare pas comme tel à l'assurance.",
  },
  {
    id: "bois-06",
    filiere: "qualibois",
    theme: "Qualification",
    norme: "Qualibois",
    question: "Quelle distinction sépare Qualibois Air et Qualibois Eau ?",
    correct: "Air : appareils indépendants (poêle, insert). Eau : appareil raccordé à un circuit de chauffage hydraulique",
    wrong: [
      "Air : granulés. Eau : bûches uniquement",
      "Air : conduit extérieur. Eau : conduit intérieur",
      "Air : maison individuelle. Eau : logement collectif seulement",
    ],
    explanation:
      "Qualibois Air couvre les appareils indépendants qui chauffent l'air de la pièce. Qualibois Eau couvre les chaudières et poêles hydro qui alimentent un réseau d'eau. Le second croise le DTU 65.16 (hydraulique, soupape, vase) en plus du DTU 24.1. La qualification de l'entreprise doit coller à l'appareil réellement posé.",
  },
  {
    id: "bois-07",
    filiere: "qualibois",
    theme: "Dimensionnement",
    norme: "DTU 24.1",
    question: "Un poêle fortement surdimensionné par rapport aux déperditions :",
    correct: "Fonctionne au ralenti, s'encrasse, pollue davantage et use le conduit",
    wrong: [
      "Est recommandé : la réserve de puissance tient lieu de loi d'eau",
      "Améliore le rendement, car le foyer reste toujours très chaud",
      "Dispense de l'amenée d'air, le surplus d'appareil aspirant moins",
    ],
    explanation:
      "Un appareil trop puissant est bridé par l'utilisateur. La combustion incomplète au ralenti produit imbrûlés, goudron et particules, et encrasse le conduit jusqu'au risque de feu de cheminée. On dimensionne sur les déperditions réelles, après isolation si elle est prévue, et on privilégie une allure nominale plutôt qu'une veille permanente.",
  },
  {
    id: "bois-08",
    filiere: "qualibois",
    theme: "Combustible",
    norme: "DTU 24.1",
    question: "Des granulés stockés dans un local humide, sacs ouverts :",
    correct: "Se dégradent : mauvaise combustion, mâchefer, encrassement du foyer et du conduit",
    wrong: [
      "Brûlent mieux, l'humidité ralentit utilement la flamme",
      "Restent conformes tant que le poêle est Qualibois",
      "Peuvent sécher dans le foyer en lançant un allumage long",
    ],
    explanation:
      "Le granulé de qualité (sec, calibré, type ENplus A1 dans le discours de chantier) se stocke au sec, sacs fermés, hors sol mouillé. L'humidité casse le pouvoir calorifique, fait mottes dans la vis et encrasse l'échangeur. Aucun réglage d'air ne rattrape un combustible détrempé. Ce n'est pas un défaut de conduit, mais il finit par le devenir.",
  },
  {
    id: "reno-01",
    filiere: "renovation",
    theme: "Fiches CEE",
    norme: "BAR-TH-164",
    question: "La fiche BAR-TH-164 vise :",
    correct: "La rénovation globale d'une maison individuelle, sur un bouquet de travaux, pas un geste isolé",
    wrong: [
      "Le remplacement seul d'une chaudière fioul par une PAC",
      "Un chauffe-eau thermodynamique posé sans autre travaux",
      "La pose de 3 kWc photovoltaïques en revente totale",
    ],
    explanation:
      "BAR-TH-164 est le cadre CEE de la rénovation globale : plusieurs postes coordonnés, avec un gain énergétique justifié, pas un équipement posé seul. Une PAC seule relève d'une autre fiche (BAR-TH-104). Le bouquet se construit à partir de l'audit, dans un ordre qui traite l'enveloppe avant le générateur.",
  },
  {
    id: "reno-02",
    filiere: "renovation",
    theme: "Audit",
    norme: "Audit énergétique",
    question: "Dans un parcours de rénovation globale, l'audit énergétique sert à :",
    correct: "Établir l'état initial, le gain de classes visé et l'ordre des travaux avant de figer les devis",
    wrong: [
      "Remplacer le Consuel et le DTU 24.1",
      "Choisir la couleur des unités extérieures",
      "Déclarer les aides après la fin du chantier",
    ],
    explanation:
      "L'audit décrit le bâti, les déperditions et les scénarios de gain de classes. Il précède les devis définitifs du bouquet : sinon on finance un générateur sur une enveloppe qui va encore changer. Il ne se substitue ni à la conformité électrique, ni à la fumisterie, ni au dépôt des aides avant démarrage lorsque MaPrimeRénov' est visée.",
  },
  {
    id: "reno-03",
    filiere: "renovation",
    theme: "Ordre des travaux",
    norme: "BAR-TH-164 · NF EN 12831",
    question: "Quel ordre respecte la physique du bâtiment et les aides ?",
    correct: "Isolation de l'enveloppe, menuiseries coordonnées, ventilation, puis générateur dimensionné sur l'état final",
    wrong: [
      "PAC immédiatement, isolation l'année suivante si le budget reste",
      "Photovoltaïque d'abord, pour financer l'isolation avec les économies",
      "VMC double flux avant toute étanchéité, afin de « sécher » le logement",
    ],
    explanation:
      "Isoler après avoir figé la PAC, c'est la laisser surdimensionnée. Poser le photovoltaïque avant d'avoir baissé les besoins, c'est le surdimensionner. Une VMC posée sur une passoire ne tient pas ses débits utiles, et une étanchéité sans ventilation piège l'humidité. L'ordre de l'académie suit les déperditions : combles, murs, planchers, menuiseries, VMC, puis chauffage.",
  },
  {
    id: "reno-04",
    filiere: "renovation",
    theme: "Ventilation",
    norme: "VMC · étanchéité",
    question: "Une fois l'enveloppe isolée et rendue plus étanche, la ventilation :",
    correct: "Doit être reprise et dimensionnée (débits cuisine, salle de bains, WC), sinon l'humidité et l'air vicié s'accumulent",
    wrong: [
      "Devient inutile : moins de fuites signifie moins de besoin d'air neuf",
      "Se limite à ouvrir les fenêtres dix minutes, sans bouche",
      "Se raccorde sur le conduit de fumée pour économiser un réseau",
    ],
    explanation:
      "L'étanchéité supprime la ventilation « par les trous ». Les débits réglementaires restent dus : cuisine, salle de bains, WC. Une VMC simple ou double flux se pose après le traitement de l'enveloppe, avec des gaines étanches et des entrées d'air cohérentes avec les menuiseries. Le conduit de fumée n'est pas un réseau de VMC.",
  },
  {
    id: "reno-05",
    filiere: "renovation",
    theme: "Aides 2026",
    norme: "MaPrimeRénov' 2026",
    question: "En 2026, une isolation des murs par l'intérieur réalisée seule, en geste isolé :",
    correct: "Est exclue de MaPrimeRénov' ; l'ITI s'inscrit dans un parcours accompagné ou un bouquet, pas en geste seul",
    wrong: [
      "Ouvre le taux bleu maximum, même sans autre travaux",
      "Remplace l'audit énergétique",
      "Est bonifiée si elle est posée après la PAC",
    ],
    explanation:
      "Le geste isolé ITI ne porte pas MaPrimeRénov' 2026. L'isolation des murs prend son sens dans un parcours : traitement des ponts, coordination avec les menuiseries, ventilation, puis chauffage. La poser seule, ou après avoir déjà figé la PAC, rate et l'aide et la performance. Les montants d'aides restent indicatifs tant que l'ANAH n'a pas instruit le dossier.",
  },
  {
    id: "reno-06",
    filiere: "renovation",
    theme: "Ordre des travaux",
    norme: "BAR-TH-164",
    question: "Pourquoi les menuiseries se traitent-elles après les murs, et non avant ?",
    correct: "Pour reprendre les tableaux et limiter les ponts thermiques entre dormant et isolation",
    wrong: [
      "Parce que les fenêtres n'ont aucun effet sur les déperditions",
      "Pour pouvoir poser la PAC sur l'ancien simple vitrage",
      "Parce que le DTU 24.1 interdit de changer les fenêtres en premier",
    ],
    explanation:
      "Une fenêtre posée avant l'isolation laisse un pont autour du dormant, parfois un rejet d'eau mal repris. On coordonne l'isolation des murs et les menuiseries pour que l'isolant retrouve le dormant. Les fenêtres comptent dans les déperditions (souvent 10 à 15 %). Le DTU 24.1, lui, ne parle pas de l'ordre des menuiseries.",
  },
  {
    id: "reno-07",
    filiere: "renovation",
    theme: "Audit",
    norme: "BAR-TH-164 · MaPrimeRénov'",
    question: "Le gain visé par un parcours de rénovation globale se juge d'abord :",
    correct: "En nombre de classes énergétiques gagnées sur l'audit, pas au seul remplacement du générateur",
    wrong: [
      "Au montant de la facture d'acompte versée à l'artisan",
      "À la puissance crête photovoltaïque installée",
      "À la couleur du profil MaPrimeRénov', indépendamment des travaux",
    ],
    explanation:
      "Les plafonds d'aides du parcours (deux classes, ou trois et plus) dépendent du gain démontré. Changer la chaudière sans toucher à l'enveloppe peut améliorer la facture sans produire le saut de classes du bouquet. L'audit avant / après est la pièce qui relie les postes BAR-TH-164 au résultat. La couleur de profil module le taux, elle ne crée pas le gain.",
  },
  {
    id: "reno-08",
    filiere: "renovation",
    theme: "Étanchéité",
    norme: "VMC · étanchéité à l'air",
    question: "Renforcer fortement l'étanchéité à l'air sans reprendre la ventilation :",
    correct: "Enferme l'humidité et les polluants : la perméabilité se traite en même temps que les débits d'air neuf",
    wrong: [
      "Est l'objectif final : un logement sain est un logement sans aucune entrée d'air",
      "Se mesure en kWc et se compense par des modules photovoltaïques",
      "Dispense du désembouage du réseau de chauffage",
    ],
    explanation:
      "L'étanchéité baisse les fuites (et les déperditions), elle ne respire pas à la place des occupants. Sans VMC adaptée, l'humidité migre dans les parois froides résiduelles. Le couple étanchéité + ventilation se vérifie ensemble : continuité de la barrière d'air, gaines, débits, entrées d'air des menuiseries. Ce n'est ni un sujet photovoltaïque, ni un sujet de qualité d'eau de chauffage.",
  },
  {
    id: "pac-21",
    filiere: "qualipac",
    theme: "CET",
    norme: "BAR-TH-148",
    question: "Un chauffe-eau thermodynamique de 250 L se distingue d'une PAC air/eau de chauffage par :",
    correct: "Il chauffe un ballon sanitaire ; son groupe de sécurité est taré à 7 bar, pas à 3 bar",
    wrong: [
      "Il remplace la soupape chauffage et le vase d'expansion du réseau radiateurs",
      "Il se raccorde sur le circuit frigorigène de la PAC air/eau sans groupe de sécurité",
      "Il est couvert par la fiche BAR-TH-104, comme une PAC air/eau",
    ],
    explanation:
      "BAR-TH-148 vise le CET à accumulation. Les 250 L sont un volume sanitaire courant, pas un ballon tampon de chauffage. Le réseau sanitaire se protège à 7 bar (groupe de sécurité, évacuation libre). Le circuit chauffage reste à 3 bar (DTU 65.16). Mélanger les deux organes est une erreur de mise en service.",
  },
  {
    id: "pac-22",
    filiere: "qualipac",
    theme: "Air/air",
    norme: "Liaisons frigorifiques",
    question: "Sur une PAC air/air (split), les condensats de l'unité intérieure doivent :",
    correct: "S'évacuer en gravitaire, avec une pente continue, sans remonter dans le bac de l'unité",
    wrong: [
      "Être renvoyés dans les liaisons frigorifiques pour améliorer le COP",
      "Rester dans le bac : l'unité les évapore toujours seule",
      "Être raccordés au conduit de fumée le plus proche",
    ],
    explanation:
      "L'unité intérieure condense en froid, et parfois en déshumidification. Une contre-pente renvoie l'eau dans l'appareil. L'évacuation est gravitaire, ou relevée par une pompe de relevage prévue pour ça, jamais par le circuit frigorigène. L'air/air n'est pas la fiche BAR-TH-104, qui vise l'air/eau.",
  },
  {
    id: "pac-23",
    filiere: "qualipac",
    theme: "Fiches CEE",
    norme: "BAR-TH-104",
    question: "La fiche BAR-TH-104 ne couvre pas :",
    correct: "Une PAC air/air seule, ni un chauffe-eau thermodynamique",
    wrong: [
      "Une PAC air/eau utilisée pour le chauffage",
      "Une installation dont la puissance a été calculée après isolation",
      "Un réseau désemboué avant raccordement",
    ],
    explanation:
      "BAR-TH-104 est la PAC air/eau. L'air/air relève d'une autre opération, et le CET de BAR-TH-148. Déposer la mauvaise fiche, c'est exposer le dossier CEE à un refus. Le DTU 65.16 reste le cadre hydraulique de l'air/eau, pas celui d'un split sans réseau d'eau.",
  },
  {
    id: "pv-17",
    filiere: "qualipv",
    theme: "CESI",
    norme: "BAR-TH-101",
    question: "La fiche BAR-TH-101 concerne :",
    correct: "Un chauffe-eau solaire individuel : capteurs thermiques et ballon, pas des modules photovoltaïques",
    wrong: [
      "L'autoconsommation photovoltaïque avec vente du surplus",
      "Une PAC air/eau BAR-TH-104",
      "Le ramonage d'un conduit de granulés",
    ],
    explanation:
      "BAR-TH-101 est le solaire thermique individuel (CESI). Les capteurs chauffent un fluide, pas un courant continu. Le photovoltaïque se traite en électricité (NF C 15-100, guide C 15-712-1), avec onduleur et coffrets. Les deux peuvent partager une toiture, ils ne partagent ni la fiche ni le fluide.",
  },
  {
    id: "pv-18",
    filiere: "qualipv",
    theme: "CESI",
    norme: "Circuit solaire",
    question: "Le circuit entre capteurs thermiques et ballon se remplit :",
    correct: "D'un fluide caloporteur glycolé, adapté au gel et à la stagnation, pas d'eau sanitaire pure",
    wrong: [
      "D'eau froide sanitaire, protégée seulement par le groupe 7 bar",
      "Du fluide frigorigène R32 de la PAC",
      "D'eau de chauffage du réseau radiateurs, sans vase dédié",
    ],
    explanation:
      "Les capteurs montent très haut en stagnation. L'eau pure gèle l'hiver et vaporise l'été. Le glycol (taux selon la notice et le climat) circule dans un circuit fermé, avec sa station : circulateur, clapet, vase d'expansion solaire et soupape. Ce vase n'est pas celui du chauffage 3 bar, et le groupe 7 bar reste sur l'eau sanitaire du ballon.",
  },
  {
    id: "pv-19",
    filiere: "qualipv",
    theme: "CESI",
    norme: "Station solaire",
    question: "La station solaire d'un CESI réunit typiquement :",
    correct: "Le circulateur, le vase d'expansion solaire, les organes de sécurité et le réglage de débit du glycol",
    wrong: [
      "L'onduleur photovoltaïque et le parafoudre DC",
      "Le filtre à boues magnétique de la PAC et la soupape chauffage 3 bar",
      "La vis sans fin et la bougie d'allumage",
    ],
    explanation:
      "La station est le cœur hydraulique du solaire thermique. Elle fait circuler le glycol quand les capteurs sont plus chauds que le bas de ballon, absorbe la dilatation dans le vase solaire et protège le circuit en surpression. L'onduleur et les parafoudres appartiennent au photovoltaïque, pas à cette station.",
  },
  {
    id: "pv-20",
    filiere: "qualipv",
    theme: "CESI",
    norme: "BAR-TH-101",
    question: "Un ballon bi-énergie solaire :",
    correct: "Est chauffé d'abord par les capteurs, avec un appoint (électrique ou chaudière) qui ne part que si le solaire ne suffit pas",
    wrong: [
      "Interdit tout appoint, même en décembre",
      "Se raccorde en injection sur le réseau Enedis",
      "Remplace le sectionneur DC des modules photovoltaïques",
    ],
    explanation:
      "Le bi-énergie superpose l'échangeur solaire et un appoint. La régulation doit laisser le solaire travailler avant d'enclencher l'appoint, sinon les capteurs ne servent à rien. Ce ballon sanitaire n'injecte pas sur le réseau : ça, c'est l'onduleur photovoltaïque, après Consuel et accord de raccordement.",
  },
  {
    id: "pv-21",
    filiere: "qualipv",
    theme: "Sécurité",
    norme: "C 15-712-1",
    question: "Les coffrets DC et AC d'une installation photovoltaïque servent à :",
    correct: "Regrouper sectionneur, parafoudres et protections, chacun sur son domaine de tension",
    wrong: [
      "Mélanger le DC des modules et le 230 V dans le même bornier non séparé",
      "Remplacer la mise à la terre des cadres",
      "Chauffer le fluide glycolé du CESI",
    ],
    explanation:
      "Le guide C 15-712-1 sépare le domaine DC (modules, sectionneur, parafoudre adapté à la tension de chaîne) et le domaine AC (sortie onduleur, protection, coupure d'urgence). Un parafoudre DC ne se pose pas au hasard sur le tableau 230 V. Les cadres restent reliés à la terre. Le glycol du CESI est un autre coffret : la station solaire.",
  },
  {
    id: "bois-09",
    filiere: "qualibois",
    theme: "Allumage",
    norme: "Poêle à granulés",
    question: "La bougie d'allumage d'un poêle à granulés :",
    correct: "Chauffe le flux d'air qui enflamme les granulés amenés par la vis ; une bougie grillée empêche le démarrage",
    wrong: [
      "Remplace le conduit de fumée double paroi",
      "Sert de résistance d'appoint du ballon solaire",
      "Se shunte si le tirage est bon, sans la remplacer",
    ],
    explanation:
      "Sans bougie, la vis peut tourner et déposer des granulés qui ne s'allument pas : imbrûlés dans le creuset, défaut d'allumage, parfois mise en sécurité. On contrôle l'alimentation, l'état de la bougie et l'arrivée d'air, puis on la remplace. Enchaîner les tentatives encrasse le foyer. Le conduit DTU 24.1 reste obligatoire à côté.",
  },
  {
    id: "bois-10",
    filiere: "qualibois",
    theme: "Alimentation",
    norme: "Poêle à granulés",
    question: "La vis sans fin d'un poêle ou d'une chaudière à granulés :",
    correct: "Dose le combustible du réservoir vers le foyer ; elle ne doit pas tourner à vide ni forcer sur un bourrage",
    wrong: [
      "Assure le tirage du conduit à la place du modérateur",
      "Remplace l'amenée d'air comburant",
      "Se graisse avec le glycol solaire",
    ],
    explanation:
      "La vis transporte un débit de granulés. Un réservoir humide fait des mottes et bloque la vis : on n'insiste pas au risque de casser l'entraînement. Granulés secs, réservoir propre, et foyer qui reçoit la bonne dose à l'allure nominale. Le tirage et l'air comburant sont d'autres organes.",
  },
  {
    id: "bois-11",
    filiere: "qualibois",
    theme: "Fumisterie",
    norme: "DTU 24.1",
    question: "Un conduit isolé double paroi, pour un poêle, se justifie notamment pour :",
    correct: "Tenir la température de fumée et respecter l'écart au feu aux matériaux combustibles",
    wrong: [
      "Supprimer l'amenée d'air comburant",
      "Autoriser un passage au contact d'une poutre si le poêle est étanche",
      "Remplacer les deux ramonages annuels",
    ],
    explanation:
      "Le DTU 24.1 relie la désignation du conduit (classe de température, résistance au feu de cheminée G, distance en mm) à la mise en œuvre. La double paroi isolée sert les montages extérieurs ou les traversées, elle ne réduit pas l'écart au feu en dessous de la distance indiquée. L'arrivée d'air comburant reste due, surtout après une étanchéité du logement. Le ramonage reste bisannuel.",
  },
  {
    id: "bois-12",
    filiere: "qualibois",
    theme: "Air comburant",
    norme: "DTU 24.1",
    question: "L'arrivée d'air comburant d'un poêle à granulés étanche :",
    correct: "Est un conduit dédié jusqu'à l'extérieur ou un vide sanitaire ventilé prévu pour ça, pas une bouche de VMC",
    wrong: [
      "Peut être piquée sur l'extraction de la VMC Hygro B",
      "Devient inutile dès que les menuiseries sont en Uw ≤ 1,3",
      "Se confond avec le conduit de fumée double paroi",
    ],
    explanation:
      "L'air de combustion et les fumées sont deux réseaux distincts. Un appareil étanche prend son air dehors par un conduit dimensionné, surtout dans une maison rendue étanche (BAR-TH-164). Le prélever sur la VMC met le logement en dépression et peut inverser le tirage. Le DTU 24.1 ne traite pas l'air comburant comme un accessoire optionnel.",
  },
  {
    id: "reno-09",
    filiere: "renovation",
    theme: "Toiture",
    norme: "BAR-TH-164",
    question: "Le sarking, par rapport à une isolation de combles perdus sur le plancher, consiste à :",
    correct: "Isoler par l'extérieur, au-dessus des chevrons, en continu, pour traiter la toiture sans perdre le volume habitable",
    wrong: [
      "Poser seulement un écran sous toiture sans isolant",
      "Remplacer la VMC par une lame d'air",
      "Isoler uniquement le plafond du rez-de-chaussée",
    ],
    explanation:
      "Le sarking déroule l'isolant au-dessus de la charpente : la barrière est continue et les ponts de chevrons sont limités. L'isolation sur plancher de combles perdus est un autre choix, pertinent si les combles ne sont pas habités. Dans les deux cas, l'étanchéité à l'air et la ventilation suivent. Le bouquet BAR-TH-164 décrit le poste retenu dans l'audit, il n'impose pas le sarking à toute maison.",
  },
  {
    id: "reno-10",
    filiere: "renovation",
    theme: "Murs",
    norme: "BAR-TH-164",
    question: "Entre ITE et ITI dans une rénovation globale :",
    correct: "L'ITE enveloppe le mur par l'extérieur et traite mieux les ponts de plancher ; l'ITI reste côté intérieur et se coordonne avec les ouvrages intérieurs",
    wrong: [
      "L'ITI en geste isolé ouvre MaPrimeRénov' 2026 au taux maximum",
      "L'ITE se pose après la PAC, pour ne pas gêner l'unité extérieure",
      "Les deux dispensent de traiter les tableaux de fenêtres",
    ],
    explanation:
      "L'ITE coupe les ponts de dalle et de refend si les retours sont faits. L'ITI est plus intrusive dedans et laisse souvent les abouts de plancher. En 2026, l'ITI seule, en geste isolé, est exclue de MaPrimeRénov' : elle s'inscrit dans le parcours. Les menuiseries se coordonnent avec le mur pour que l'isolant retrouve le dormant.",
  },
  {
    id: "reno-11",
    filiere: "renovation",
    theme: "Menuiseries",
    norme: "BAR-TH-164",
    question: "Le repère Uw ≤ 1,3 W/m².K sur une menuiserie du bouquet signifie :",
    correct: "Un coefficient de transmission de la fenêtre complète (vitrage + menuiserie) au plus égal à 1,3",
    wrong: [
      "Uniquement le Ug du vitrage, le châssis n'entre pas dans le calcul",
      "Le débit de la VMC Hygro B en m³/h",
      "L'écart au feu du conduit de fumée en millimètres",
    ],
    explanation:
      "Uw caractérise la fenêtre entière. Un bon Ug avec un châssis médiocre peut rater le seuil. Dans le bouquet, on vise Uw ≤ 1,3 et on pose la menuiserie en cohérence avec l'isolation des murs, pour ne pas laisser un pont en tableau. Ce chiffre n'a rien à voir avec un débit de ventilation ni avec le DTU 24.1.",
  },
  {
    id: "reno-12",
    filiere: "renovation",
    theme: "Ventilation",
    norme: "VMC Hygro B",
    question: "Une VMC Hygro B, après isolation et étanchéité :",
    correct: "Module les débits selon l'humidité, avec des bouches et des entrées d'air cohérentes ; elle ne se supprime pas parce que la maison est étanche",
    wrong: [
      "Se pose avant toute étanchéité, puis se démonte une fois le test réussi",
      "Extrait l'air comburant du poêle à la place d'une arrivée dédiée",
      "Remplace le test d'étanchéité à l'air",
    ],
    explanation:
      "Hygro B fait varier l'extraction (et les entrées d'air) avec l'humidité. Les débits de base restent dus : cuisine, salle de bains, WC. L'étanchéité sans cette ventilation enferme l'humidité. Le test d'étanchéité (sous écart de pression) mesure les fuites de l'enveloppe ; il ne règle pas les débits. L'air du poêle ne se prend pas sur une bouche d'extraction.",
  },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

function materialize(draft: Draft): RgeQuestion {
  const bag = shuffle([draft.correct, draft.wrong[0], draft.wrong[1], draft.wrong[2]]);
  const choices: [string, string, string, string] = [bag[0], bag[1], bag[2], bag[3]];
  const correctIndex = choices.indexOf(draft.correct);
  return {
    id: draft.id,
    filiere: draft.filiere,
    theme: draft.theme,
    norme: draft.norme,
    question: draft.question,
    choices,
    correctIndex: correctIndex as 0 | 1 | 2 | 3,
    explanation: draft.explanation,
  };
}

export const QUESTIONS: RgeQuestion[] = DRAFTS.map(materialize);

function takeRoundRobin(buckets: RgeQuestion[][], count: number): RgeQuestion[] {
  const queues = buckets.map((bucket) => [...bucket]);
  const picked: RgeQuestion[] = [];
  while (picked.length < count) {
    let progressed = false;
    for (const queue of queues) {
      const next = queue.shift();
      if (!next) continue;
      picked.push(next);
      progressed = true;
      if (picked.length >= count) break;
    }
    if (!progressed) break;
  }
  return picked;
}

export function buildExam(filiere: FiliereId | "mixte", count = EXAM_SIZE): RgeQuestion[] {
  if (filiere === "mixte") {
    const buckets = FILIERE_IDS.map((id) => shuffle(QUESTIONS.filter((item) => item.filiere === id)));
    return shuffle(takeRoundRobin(buckets, count));
  }

  const primary = shuffle(QUESTIONS.filter((item) => item.filiere === filiere));
  const others = FILIERE_IDS.filter((id) => id !== filiere).map((id) =>
    shuffle(QUESTIONS.filter((item) => item.filiere === id)),
  );
  const picked = primary.slice(0, count);
  if (picked.length < count) picked.push(...takeRoundRobin(others, count - picked.length));
  return shuffle(picked);
}

export function emptyPerFiliere(): Record<FiliereId, { correct: number; total: number }> {
  return {
    qualipac: { correct: 0, total: 0 },
    qualipv: { correct: 0, total: 0 },
    qualibois: { correct: 0, total: 0 },
    renovation: { correct: 0, total: 0 },
  };
}

export function verdictLabel(score: number, total = EXAM_SIZE): string {
  const passed = total === EXAM_SIZE ? score >= PASS_SCORE : score / total >= PASS_SCORE / EXAM_SIZE;
  return passed ? "Validé - Reçu avec mention" : "Ajourné - Révisez les points faibles";
}

export function filiereTitle(id: FiliereId | "mixte"): string {
  if (id === "mixte") return "Examen blanc mixte";
  return FILIERES.find((item) => item.id === id)?.title ?? id;
}
