/**
 * Fiches techniques CEE du Radar — industrie, tertiaire, résidentiel.
 * Les montants et les volumes cumac restent indicatifs (cours EMMY classique 7,45 €).
 * Les visuels des cinq fiches historiques ne sont pas des performances contractuelles.
 */

export type FicheStrategiqueCee = {
  code: string;
  codesAssocies: string[];
  titre: string;
  sousTitre: string;
  segment: string;
  image?: string;
  alt?: string;
  technologie: string;
  economies: string;
  primeFourchette: string;
  volumeCumac: string;
  indicateurs: string[];
  principe: string;
  equipements: string[];
  corpsEtat: string[];
  eligibilite: string[];
  financement: string[];
  /** Lot catalogue dont l'onglet Ratios reprend ce visuel. */
  categorieId?: string;
};

type SaisieFiche = Omit<FicheStrategiqueCee, "codesAssocies" | "indicateurs" | "sousTitre"> & {
  sousTitre?: string;
};

function fiche(data: SaisieFiche): FicheStrategiqueCee {
  const { sousTitre, ...reste } = data;
  return {
    ...reste,
    codesAssocies: [],
    sousTitre: sousTitre ?? `Référence officielle CEE ${data.code}`,
    indicateurs: [data.technologie, data.economies, `Prime CEE : ${data.primeFourchette}`],
  };
}

export const FICHES_STRATEGIQUES_CEE: FicheStrategiqueCee[] = [
  fiche({
    code: "IND-UT-117",
    titre: "Récupération de chaleur fatale sur process",
    segment: "Industrie",
    image: "/assets/cee/ind-ut-117.jpg",
    alt: "Schéma de récupération de chaleur fatale : échangeur, ballon tampon et circuit d'eau chaude d'usine",
    technologie: "Échangeurs thermiques process",
    economies: "−20 % à −40 % sur le chauffage d'usine",
    primeFourchette: "75 000 € à 350 000 €",
    volumeCumac: "10 067 à 46 980 MWh cumac",
    principe:
      "Captage des calories résiduelles des fours, buées, condensats et fumées industrielles via échangeurs thermiques pour alimenter le chauffage d'ateliers ou l'eau chaude.",
    equipements: [
      "Échangeur thermique à plaques inox 316L ou titane : bloc rectangulaire compact, fixé sur châssis au sol.",
      "Ballon tampon calorifugé de 1 000 L : cuve verticale isolée pour stocker l'eau chaude.",
      "Pompe de circulation d'eau, circulateur modulant, raccordée aux tuyaux.",
      "Vanne 3 voies motorisée, pour diriger l'eau chaude vers le chauffage ou le ballon.",
      "Compteur d'énergie thermique MID télérelevé, obligatoire pour prouver les calories récupérées.",
    ],
    corpsEtat: [
      "Tuyauteur industriel (soudeur TIG inox)",
      "Chauffagiste CVC industriel",
      "Automaticien",
      "Calorifugeur",
    ],
    eligibilite: [
      "Valorisation vers un usage thermique identifié (bâtiments ou process).",
      "Compteur d'énergie thermique dédié et télérelevé.",
    ],
    financement: [
      "La récupération dédiée au seul compresseur d'air relève de la fiche IND-UT-125.",
    ],
  }),
  fiche({
    code: "IND-UT-116",
    titre: "Système de régulation par haute pression flottante (HP flottante)",
    segment: "Industrie",
    image: "/assets/cee/ind-ut-116.jpg",
    alt: "Schéma 3D d'une centrale frigorifique industrielle en haute pression flottante : compresseurs à vis, condenseurs à air à vitesse variable, circuits gaz et liquide, armoire automate IND-UT-116",
    technologie: "HP flottante — froid industriel",
    economies: "Réduction de l'effort des compresseurs selon l'air extérieur",
    primeFourchette: "45 000 € à 130 000 €",
    volumeCumac: "6 000 à 17 500 MWh cumac",
    principe:
      "Abaissement dynamique et continu de la pression de condensation des groupes frigorifiques en fonction de la température extérieure ambiante, ce qui réduit l'effort des compresseurs. Le gaz chaud part vers les condenseurs à air ; le liquide refroidi revient vers les évaporateurs.",
    equipements: [
      "Coffret automate mural à écran tactile (Carel, Danfoss ou Schneider).",
      "Transmetteurs de pression inox 4-20 mA, vissés sur la ligne de refoulement du gaz.",
      "Variateurs de vitesse pour moduler les ventilateurs du condenseur en toiture.",
      "Sonde météo extérieure sous coupelles étanches, fixée en façade nord.",
    ],
    corpsEtat: [
      "Frigoriste industriel",
      "Automaticien régulation froid",
      "Électricien industriel",
    ],
    eligibilite: [
      "Système autonome asservissant la haute pression à la température extérieure.",
      "Gain énergétique minimum certifié par le fabricant.",
    ],
    financement: ["Chambres froides, agroalimentaire et abattoirs."],
  }),
  fiche({
    code: "IND-UT-115",
    titre: "Système de régulation par basse pression flottante (BP flottante)",
    segment: "Industrie",
    image: "/assets/cee/ind-ut-115.jpg",
    alt: "Schéma 3D d'une chambre froide en basse pression flottante IND-UT-115 : évaporateurs plafonniers, vannes d'expansion électroniques, capteur d'aspiration, sonde d'air et régulateur numérique",
    technologie: "BP flottante — évaporation",
    economies: "Environ −3 % d'électricité par degré relevé",
    primeFourchette: "35 000 € à 90 000 €",
    volumeCumac: "4 700 à 12 000 MWh cumac",
    principe:
      "Remonter la pression d'évaporation dans les chambres froides pour soulager les compresseurs, au niveau le plus haut compatible avec la conservation des denrées. Chaque degré relevé représente environ 3 % d'électricité économisée.",
    equipements: [
      "Détendeurs électroniques pas-à-pas : vannes motorisées de précision qui remplacent les détendeurs mécaniques sur les évaporateurs.",
      "Capteurs de pression d'aspiration (basse pression), vissés sur le collecteur d'aspiration.",
      "Sondes de température d'ambiance et de reprise d'air, dans chaque chambre froide.",
      "Régulateur électronique multi-circuits, en salle des machines.",
    ],
    corpsEtat: [
      "Frigoriste agroalimentaire",
      "Frigoriste d'intervention chambres froides",
    ],
    eligibilite: [
      "Dispositif de modulation continue de la pression d'aspiration.",
      "Enregistrement continu des températures réglementaires.",
    ],
    financement: ["Groupes de production de froid, agroalimentaire et process."],
  }),
  fiche({
    code: "IND-UT-125",
    titre: "Récupération de chaleur sur compresseur d'air comprimé",
    segment: "Industrie",
    image: "/assets/cee/ind-ut-125.jpg",
    alt: "Schéma 3D de récupération de chaleur sur compresseur d'air IND-UT-125 : compresseur à vis, échangeur huile/eau, compteur d'énergie thermique et ballon tampon 1 000 L",
    technologie: "Échangeur huile / eau sur compresseur",
    economies: "Huile à 85 °C valorisée en eau de chauffage à 80 °C",
    primeFourchette: "25 000 € à 70 000 €",
    volumeCumac: "3 350 à 9 400 MWh cumac",
    principe:
      "Capter la chaleur de l'huile des compresseurs d'air (départ vers 85 °C) pour chauffer les ateliers ou préchauffer l'eau. L'échangeur à plaques transfère les calories de l'huile vers l'eau ; le ballon tampon stocke l'eau chaude.",
    equipements: [
      "Kit échangeur huile/eau du compresseur (Atlas Copco, Kaeser ou Ingersoll Rand), sur le circuit d'huile.",
      "Module hydraulique avec circulateur à vitesse variable.",
      "Ballon tampon de 500 L à 1 000 L.",
      "Tuyaux de liaison acier ou cuivre, calorifugés, vers les aérothermes de l'atelier.",
      "Compteur de calories (M-Bus ou MID), pour prouver l'énergie thermique récupérée.",
    ],
    corpsEtat: [
      "Spécialiste air comprimé",
      "Tuyauteur industriel",
      "Chauffagiste d'usine",
    ],
    eligibilite: [
      "Puissance compresseur supérieure à 20 kW.",
      "Efficacité d'échange supérieure à 70 %.",
      "Mesurage de l'énergie thermique récupérée.",
    ],
    financement: ["Ateliers mécaniques et usines de plasturgie."],
  }),
  fiche({
    code: "IND-UT-121",
    titre: "Matelas isolants pour points singuliers de réseaux",
    segment: "Industrie",
    image: "/assets/cee/ind-ut-121.jpg",
    alt: "Matelas isolants thermiques posés sur une vanne et un collecteur de chaufferie industrielle",
    technologie: "Calorifuge amovible classe 4",
    economies: "Pertes stoppées sur vannes, brides, filtres et détendeurs",
    primeFourchette: "15 000 € à 45 000 €",
    volumeCumac: "2 000 à 6 000 MWh cumac",
    principe:
      "Éliminer les brûlures et les pertes de chaleur sur les vannes et brides de vapeur ou d'eau chaude, par des matelas démontables posés sur les points singuliers.",
    equipements: [
      "Matelas et housses thermiques démontables sur mesure : tissu fibre de verre enduit silicone, garnissage laine minérale haute densité.",
      "Sangles de serrage et attaches velcro ignifuges.",
      "Plaquettes métalliques rivetées, avec numéro de repère pour le contrôle CEE.",
    ],
    corpsEtat: [
      "Calorifugeur industriel certifié (pose rapide, de l'ordre de 50 à 100 matelas par jour)",
    ],
    eligibilite: [
      "Température de fluide supérieure à 60 °C.",
      "Température de contact externe inférieure à 40 °C.",
      "Pose sur robinetterie non isolée.",
    ],
    financement: ["Le visuel de température est une illustration, pas une performance garantie."],
  }),
  fiche({
    code: "IND-UT-114",
    titre: "Moteurs électriques à haut rendement IE4 (Super Premium)",
    segment: "Industrie",
    image: "/assets/cee/ind-ut-114.jpg",
    alt: "Moteur électrique triphasé IE4 bleu, plaque IND-UT-114, accouplé à une pompe centrifuge, avec variateur de fréquence et disjoncteurs moteur en armoire",
    technologie: "Moteurs IE4 — CEI 60034-30-1",
    economies: "Remplacement des moteurs IE1 ou IE2 énergivores",
    primeFourchette: "12 000 € à 35 000 €",
    volumeCumac: "1 600 à 4 700 MWh cumac",
    principe:
      "Remplacer les moteurs énergivores des machines (IE1 ou IE2) par des moteurs triphasés de classe IE4, à réluctance synchrone ou à aimants permanents.",
    equipements: [
      "Moteur électrique triphasé classe IE4 (Leroy-Somer, WEG, ABB ou Siemens) : carcasse fonte à ailettes, plaque signalétique certifiant IE4.",
      "Kit d'accouplement mécanique, poulie et clavette.",
      "Disjoncteur magnétothermique moteur neuf, calibré pour l'armoire.",
    ],
    corpsEtat: [
      "Électromécanicien d'usine",
      "Bobinier industriel",
      "Électricien industriel",
    ],
    eligibilite: [
      "Puissance nominale entre 0,75 kW et 1 000 kW.",
      "Rendement certifié norme CEI 60034-30-1, classe IE4.",
    ],
    financement: ["Lignes de production, ventilation et pompage industriels."],
  }),
  fiche({
    code: "IND-UT-102",
    titre: "Variation électronique de vitesse sur moteur électrique",
    segment: "Industrie",
    image: "/assets/cee/ind-ut-102.jpg",
    alt: "Variateur de fréquence IND-UT-102 à 42 Hz, câbles blindés vers un moteur asynchrone accouplé à une pompe centrifuge, débit modulé à 58 %",
    technologie: "Variateur de fréquence",
    economies: "Débit adapté au besoin réel de la pompe ou du ventilateur",
    primeFourchette: "10 000 € à 28 000 €",
    volumeCumac: "1 340 à 3 750 MWh cumac",
    principe:
      "Ralentir les pompes et les ventilateurs selon le besoin réel, au lieu de les laisser tourner à pleine vitesse en permanence.",
    equipements: [
      "Variateur de fréquence (Schneider Altivar, Danfoss VLT ou équivalent) : boîtier mural IP55 avec écran de paramétrage.",
      "Filtre d'harmoniques réseau (inductance de ligne), pour protéger le réseau de l'usine.",
      "Câble blindé CEM, pour relier le variateur au moteur sans parasites.",
      "Capteur de pression ou de débit 4-20 mA, pour la consigne.",
    ],
    corpsEtat: [
      "Électricien industriel tableautier",
      "Automaticien process",
    ],
    eligibilite: [
      "Moteur électrique de 1,1 kW à 1 000 kW entraînant une pompe ou un ventilateur.",
      "Asservissement à un capteur physique (débit ou pression).",
    ],
    financement: ["Pompage, ventilation et compression sur moteur asynchrone."],
  }),
  fiche({
    code: "IND-UT-129",
    titre: "Déstratificateur ou brasseur d'air industriel",
    segment: "Industrie",
    image: "/assets/cee/ind-ut-129.jpg",
    alt: "Déstratificateur HVLS IND-UT-129 de 5 m sous charpente : air chaud à 35 °C rabattu vers la zone de travail à environ 20 °C",
    technologie: "Déstratification HVLS",
    economies: "Gradient d'environ 1 °C par mètre rabattu vers le sol",
    primeFourchette: "8 000 € à 25 000 €",
    volumeCumac: "1 070 à 3 350 MWh cumac",
    principe:
      "Rabattre l'air chaud accumulé sous le toit, vers 10 m de haut, vers le sol où travaillent les équipes. Le gradient est de l'ordre de 1 °C par mètre.",
    equipements: [
      "Ventilateurs de déstratification HVLS, diamètre 3 m à 6 m : pales en aluminium, moteur silencieux.",
      "Kits de suspension par élingues acier sous charpente.",
      "Armoire de commande murale avec deux sondes de température : une au sol, une en toiture.",
    ],
    corpsEtat: [
      "Électricien industriel",
      "Échafaudeur ou nacelliste qualifié CACES",
    ],
    eligibilite: [
      "Hauteur sous plafond supérieure à 5 m.",
      "Régulation automatique par sonde de température différentielle sol / plafond.",
    ],
    financement: ["Hangars et ateliers à grande hauteur sous plafond."],
  }),
  fiche({
    code: "IND-UT-134",
    titre: "Système de mesurage et indicateurs de performance IPÉ (ISO 50001)",
    segment: "Industrie",
    image: "/assets/cee/ind-ut-134.jpg",
    alt: "Armoire IND-UT-134 : sous-compteurs sur rail DIN, tores Rogowski, débitmètres à ultrasons, passerelle IoT et tableau de bord énergétique ISO 50001",
    technologie: "Comptage multi-énergies — ISO 50001",
    economies: "Pilotage des usages énergétiques significatifs",
    primeFourchette: "15 000 € à 50 000 €",
    volumeCumac: "2 000 à 6 700 MWh cumac",
    principe:
      "Poser des compteurs communicants sur l'électricité, le gaz, la vapeur et l'air comprimé pour suivre les usages énergétiques significatifs et les indicateurs de performance.",
    equipements: [
      "Sous-compteurs électriques modulaires communicants, sur rail DIN dans les armoires.",
      "Tores de courant ouvrants (boucles Rogowski), clipsés autour des câbles sans coupure.",
      "Débitmètres gaz ou vapeur à ultrasons.",
      "Passerelle IoT / Modbus, pour transmettre les données.",
    ],
    corpsEtat: [
      "Intégrateur IoT et électricien instrumentation",
      "Référent efficacité énergétique",
    ],
    eligibilite: [
      "Couverture des usages énergétiques significatifs.",
      "Archivage des données au pas horaire pendant 3 ans minimum.",
      "Calcul automatique des IPÉ.",
    ],
    financement: ["Instrumentation énergétique et démarche ISO 50001."],
  }),
  fiche({
    code: "BAT-TH-116",
    titre: "GTB tertiaire / décret BACS",
    segment: "Tertiaire",
    image: "/assets/visualisation-technique-gtb-futuriste.jpg",
    alt: "Supervision GTB d'un bâtiment tertiaire : régulation CVC, sondes et vannes motorisées",
    technologie: "GTB classe B — décret BACS",
    economies: "−20 % à −35 % sur la facture tertiaire",
    primeFourchette: "75 000 € à 180 000 €",
    volumeCumac: "10 067 à 24 161 MWh cumac",
    principe:
      "Supervision centralisée du chauffage, de l'eau chaude, du refroidissement, de l'éclairage et des auxiliaires. La GTB de classe B détecte les dérives et régule en temps réel, pour la mise en conformité du décret BACS.",
    equipements: [
      "Automates CVC (Schneider, Siemens ou Sauter).",
      "Sondes de température et de CO₂.",
      "Vannes modulantes BACnet ou Modbus.",
      "Passerelle et écran de supervision.",
      "Comptage énergétique par usage.",
    ],
    corpsEtat: [
      "Intégrateur GTB / automaticien tertiaire",
      "Électricien courants faibles",
      "Exploitant de maintenance CVC",
      "Bureau d'études fluides",
    ],
    eligibilite: [
      "Bâtiment tertiaire existant, en pratique au-delà de 1 000 m².",
      "GTB de classe B minimum (NF EN ISO 52120-1) couvrant chauffage, eau chaude, refroidissement, éclairage et auxiliaires.",
      "Échéance décret BACS : 2027 pour les assujettis concernés.",
    ],
    financement: ["Bureaux, supermarchés, mairies et cliniques de plus de 1 000 m²."],
  }),
  fiche({
    code: "BAT-TH-139",
    titre: "Récupération de chaleur sur groupe froid",
    segment: "Tertiaire",
    image: "/assets/cee/bat-th-139.jpg",
    alt: "Schéma 3D BAT-TH-139 : rack de compression d'un supermarché, échangeur à plaques, ballon tampon 2 000 L et allées chauffées par la chaleur des meubles froids",
    technologie: "Récupération sur condensation frigorifique",
    economies: "−15 % à −30 % sur le chauffage et l'eau chaude du site (indicatif)",
    primeFourchette: "50 000 € à 140 000 €",
    volumeCumac: "6 711 à 18 792 MWh cumac",
    principe:
      "Captage des calories rejetées par les groupes de froid alimentaire (linéaires, chambres, laboratoires) pour préchauffer l'eau ou alimenter le chauffage du magasin ou de la cuisine centrale.",
    equipements: [
      "Échangeur de récupération sur le circuit de condensation.",
      "Ballon tampon et circulateurs.",
      "Compteur thermique télérelevé.",
      "Régulation anti-surchauffe du groupe froid.",
    ],
    corpsEtat: [
      "Frigoriste commercial grande surface",
      "Tuyauteur",
      "Automaticien froid",
      "Exploitant maintenance magasin",
    ],
    eligibilite: [
      "Groupe de production de froid en supermarché, hypermarché ou cuisine centrale.",
      "Valorisation vers un usage thermique identifié.",
      "Mesure de l'énergie thermique récupérée.",
    ],
    financement: ["Supermarchés, hypermarchés et cuisines centrales."],
  }),
  fiche({
    code: "BAT-TH-134",
    titre: "Haute pression flottante tertiaire",
    segment: "Tertiaire",
    image: "/assets/cee/bat-th-134.jpg",
    alt: "Condenseurs à air en toiture de supermarché BAT-TH-134 : ventilateurs à vitesse variable, transmetteurs de pression et armoire de régulation haute pression flottante",
    technologie: "HP flottante — froid tertiaire",
    economies: "−10 % à −25 % d'électricité frigorifique (indicatif)",
    primeFourchette: "30 000 € à 80 000 €",
    volumeCumac: "4 027 à 10 738 MWh cumac",
    principe:
      "Abaissement dynamique de la pression de condensation des groupes froids tertiaires selon la température extérieure, pour réduire l'effort des compresseurs en magasin alimentaire ou en clinique.",
    equipements: [
      "Automate de haute pression flottante.",
      "Capteurs de haute pression.",
      "Sonde de température extérieure.",
      "Variateurs sur les ventilateurs de condenseurs.",
    ],
    corpsEtat: [
      "Frigoriste tertiaire",
      "Intégrateur d'automatisme frigorifique",
      "Électricien",
    ],
    eligibilite: [
      "Régulation autonome asservissant la haute pression à la température extérieure.",
      "Groupe froid de magasin alimentaire ou de clinique.",
    ],
    financement: ["Magasins alimentaires et cliniques."],
  }),
  fiche({
    code: "BAT-TH-140",
    titre: "Pompe à chaleur collective tertiaire (air/eau ou eau/eau)",
    segment: "Tertiaire",
    image: "/assets/plantes-mecaniques-tertiaires-bleues-et-cyan.jpg",
    alt: "Pompes à chaleur collectives en toiture d'un immeuble tertiaire",
    technologie: "PAC collective — sortie du fossile",
    economies: "Remplacement d'une chaufferie gaz ou fioul",
    primeFourchette: "40 000 € à 110 000 €",
    volumeCumac: "5 400 à 14 800 MWh cumac",
    principe:
      "Remplacement des anciennes chaudières collectives gaz ou fioul par des cascades de pompes à chaleur réversibles ou chaud seul, pour alimenter bureaux, résidences étudiantes ou cliniques.",
    equipements: [
      "Cascade de PAC air/eau tertiaire haute performance (COP supérieur à 3,8).",
      "Ballon tampon de découplage hydraulique gros volume.",
      "Circulateurs collectifs haute efficacité.",
      "Armoire électrique dédiée avec délestage.",
    ],
    corpsEtat: [
      "Installateur génie climatique tertiaire (CVC gros tertiaire)",
      "Frigoriste industriel fluides sous pression",
      "Électricien fort calibre (raccordement TGBT)",
      "Grutier levage terrasse",
    ],
    eligibilite: [
      "Efficacité énergétique saisonnière (ETAS) d'au moins 115 % en moyenne ou haute température, ou d'au moins 126 % en basse température.",
      "Puissance thermique collective.",
      "Dimensionnement après isolation de l'enveloppe.",
    ],
    financement: ["Bureaux, résidences étudiantes et cliniques. L'isolation reste prioritaire avant la chaufferie."],
  }),
  fiche({
    code: "BAT-EQ-127",
    titre: "Luminaire à LED avec détection intégrée (relamping)",
    segment: "Tertiaire",
    image: "/assets/cee/bat-eq-127.jpg",
    alt: "Relamping BAT-EQ-127 : dalles et linéaires LED en plafond de bureau, détection de présence, mesure de lumière naturelle et gradation automatique",
    technologie: "LED ≥ 120 lm/W avec détection",
    economies: "Extinction des zones inoccupées",
    primeFourchette: "15 000 € à 60 000 €",
    volumeCumac: "2 000 à 8 000 MWh cumac",
    principe:
      "Remplacement des anciens tubes néon fluorescents ou projecteurs énergivores par des luminaires LED basse consommation intégrant détection de présence et gradation crépusculaire.",
    equipements: [
      "Dalles LED basse luminance (UGR inférieur à 19) pour bureaux.",
      "Réglettes LED étanches IP65 pour parkings souterrains.",
      "Suspensions LED grande hauteur pour surfaces de vente.",
      "Bus de pilotage DALI.",
    ],
    corpsEtat: [
      "Installateur électricien tertiaire",
      "Électricien de maintenance commerciale",
      "Nacelliste habilité CACES",
    ],
    eligibilite: [
      "Efficacité lumineuse du luminaire d'au moins 120 lm/W.",
      "Extinction ou gradation automatique après temporisation.",
      "Durée de vie L80B10 d'au moins 50 000 heures.",
    ],
    financement: ["Parkings couverts, surfaces de vente et entrepôts."],
  }),
  fiche({
    code: "BAT-TH-104",
    titre: "Robinets thermostatiques sur radiateurs de bâtiments tertiaires",
    segment: "Tertiaire",
    image: "/assets/cee/bat-th-104.jpg",
    alt: "Radiateur tertiaire BAT-TH-104 : tête thermostatique anti-vandalisme, eau chaude à 65 °C en entrée, eau refroidie à 45 °C en sortie et gradient thermique dans le corps de chauffe",
    technologie: "Régulation terminale — VT ≤ 0,6 K",
    economies: "Suppression des surchauffes pièce par pièce",
    primeFourchette: "8 000 € à 25 000 €",
    volumeCumac: "1 070 à 3 350 MWh cumac",
    principe:
      "Installation de têtes et de corps de robinets thermostatiques pour réguler la température pièce par pièce et éliminer les surchauffes dans les bureaux et les écoles.",
    equipements: [
      "Corps de robinets thermostatiques à préréglage d'équilibrage.",
      "Têtes thermostatiques rigides renforcées antivol, ou têtes sans fil connectées.",
      "Vannes de régulation de colonnes montantes.",
    ],
    corpsEtat: [
      "Plombier-chauffagiste tertiaire",
      "Exploitant de maintenance de chauffage collectif",
    ],
    eligibilite: [
      "Bâtiment tertiaire chauffé par un réseau de radiateurs à eau chaude.",
      "Certification CEN de la tête thermostatique, variation temporelle VT inférieure ou égale à 0,6 K.",
    ],
    financement: ["Bureaux, écoles et bâtiments tertiaires à radiateurs."],
  }),
  fiche({
    code: "BAT-EN-101",
    titre: "Isolation de toitures de bâtiments tertiaires",
    segment: "Tertiaire",
    image: "/assets/cee/bat-en-101.jpg",
    alt: "Écorché BAT-EN-101 : dalle béton, pare-vapeur bitumineux, deux couches de panneaux PIR haute densité et membrane d'étanchéité EPDM sur toiture tertiaire",
    technologie: "Toiture-terrasse ou bac acier",
    economies: "Premier poste de déperdition de l'enveloppe",
    primeFourchette: "20 000 € à 75 000 €",
    volumeCumac: "2 700 à 10 000 MWh cumac",
    principe:
      "Réfection et surisolation thermique de la toiture-terrasse ou des toitures bac acier de bâtiments administratifs, gymnases ou magasins, pour stopper les déperditions thermiques.",
    equipements: [
      "Panneaux rigides d'isolation (polyuréthane PIR haute résistance ou laine de roche double densité) certifiés ACERMI.",
      "Membrane d'étanchéité bitumineuse ou synthétique.",
      "Pare-vapeur continu.",
    ],
    corpsEtat: [
      "Entreprise d'étanchéité et toiture-terrasse certifiée",
      "Couvreur-bardeur industriel",
      "Échafaudeur sécurité collective",
    ],
    eligibilite: [
      "Résistance thermique installée R d'au moins 6,5 m².K/W en toiture-terrasse, ou R d'au moins 7,0 m².K/W en combles tertiaires.",
      "Certification ACERMI obligatoire.",
    ],
    financement: ["Prime au m². Bâtiments tertiaires de plus de 1 000 m², toiture accessible."],
  }),
  fiche({
    code: "BAT-TH-157",
    titre: "Chaudière biomasse collective tertiaire (granulés / bois déchiqueté)",
    segment: "Tertiaire",
    image: "/assets/cee/bat-th-157.jpg",
    alt: "Chaufferie BAT-TH-157 : silo de plaquettes et granulés, vis d'alimentation, chaudière biomasse, ballons d'hydro-accumulation et cheminée inox",
    technologie: "Chaufferie bois automatique",
    economies: "Sortie du fioul ou du gaz des équipements publics",
    primeFourchette: "35 000 € à 90 000 €",
    volumeCumac: "4 700 à 12 000 MWh cumac",
    principe:
      "Production de chaleur collective renouvelable pour les équipements publics municipaux (écoles, gymnases, mairies, EHPAD) par une chaufferie centrale automatique à bois.",
    equipements: [
      "Chaudière automatique biomasse de 50 kW à 500 kW.",
      "Alimentation par vis sans fin ou désileur rotatif.",
      "Silo de stockage de granulés ou de plaquettes.",
      "Ballon tampon d'hydro-accumulation.",
      "Électrofiltre à particules.",
    ],
    corpsEtat: [
      "Chauffagiste collectif certifié RGE Qualibois, module fortes puissances",
      "Fumiste industriel (conduit inox double paroi)",
      "Maçon gros œuvre (réalisation du silo)",
    ],
    eligibilite: [
      "Rendement énergétique saisonnier de la chaudière d'au moins 77 %.",
      "Émissions de particules fines conformes aux seuils en vigueur.",
      "Contrat de maintenance biomasse.",
    ],
    financement: ["Mairies, écoles, gymnases et EHPAD."],
  }),
  fiche({
    code: "BAR-TH-164",
    titre: "Rénovation globale d'une maison individuelle",
    segment: "Résidentiel",
    image: "/assets/villa-energetique-contemporaine-renovee.jpg",
    alt: "Maison contemporaine rénovée : isolation, menuiseries et pompe à chaleur",
    technologie: "Bouquet isolation, PAC et ventilation",
    economies: "Saut d'au moins 2 classes DPE",
    primeFourchette: "5 400 € à 15 000 € CEE",
    volumeCumac: "725 à 2 013 MWh cumac",
    principe:
      "Traitement thermique complet et coordonné de l'habitat : au minimum deux postes d'isolation, le remplacement du chauffage fossile par une pompe à chaleur et une ventilation contrôlée, avec un saut d'au moins deux classes DPE. L'isolation précède le chauffage.",
    equipements: [
      "Audit énergétique initial réglementaire.",
      "Pompe à chaleur air/eau haute performance, dimensionnée après isolation.",
      "Isolation thermique (murs, combles, planchers).",
      "VMC hygroréglable.",
      "Robinets thermostatiques.",
      "Test d'infiltrométrie final.",
    ],
    corpsEtat: [
      "Contractant général et bureau d'études (ENERGIA CONSEIL IA®)",
      "Auditeur énergétique certifié RGE (Mon Accompagnateur Rénov' — MAR)",
      "Plombier-chauffagiste RGE QualiPAC",
      "Façadier ITE certifié RGE",
      "Plaquiste ou couvreur isolation RGE",
      "Électricien",
    ],
    eligibilite: [
      "Audit préalable obligatoire.",
      "Gain énergétique conventionnel d'au moins 35 %, ou 55 % pour un parcours performant.",
      "Interdiction de conserver une chaudière fioul ou charbon.",
      "Taux d'énergie renouvelable d'au moins 50 %.",
      "Si MaPrimeRénov' est visé : ne pas signer les devis définitifs avant l'accord écrit de l'ANAH.",
    ],
    financement: [
      "Cumulable avec MaPrimeRénov' Parcours Accompagné jusqu'à 63 000 €.",
      "Le visuel de la maison aboutie n'impose ni le triple vitrage ni une batterie.",
    ],
    categorieId: "renovation-globale",
  }),
  fiche({
    code: "BAR-TH-145",
    titre: "Rénovation globale d'un bâtiment résidentiel collectif (copropriété)",
    segment: "Résidentiel",
    image: "/assets/cee/bar-th-145.jpg",
    alt: "Copropriété BAR-TH-145 : isolation par l'extérieur, toiture-terrasse isolée, fenêtres haute performance, pompes à chaleur collectives et ballons tampons en chaufferie",
    technologie: "Rénovation d'immeuble — ITE et chaufferie",
    economies: "Gain énergétique calculé d'au moins 35 %",
    primeFourchette: "60 000 € à 250 000 € par immeuble",
    volumeCumac: "8 054 à 33 557 MWh cumac",
    principe:
      "Rénovation énergétique lourde à l'échelle d'un immeuble en copropriété ou d'un parc de bailleur social : façades, toiture-terrasse et chaufferie collective.",
    equipements: [
      "Isolation thermique des façades par l'extérieur, gros volume.",
      "Isolation et étanchéité de toiture-terrasse.",
      "Chaufferie collective par pompe à chaleur ou raccordement à un réseau de chaleur.",
      "Équilibrage dynamique des colonnes de chauffage.",
      "VMC collective hygroréglable.",
    ],
    corpsEtat: [
      "Maître d'œuvre / contractant général copropriété",
      "Ingénieur thermicien, audit collectif",
      "Entreprise générale du bâtiment ou groupement d'artisans RGE",
      "Façadier ITE façades hautes",
      "Chauffagiste collectif",
      "Syndic de copropriété",
    ],
    eligibilite: [
      "Immeuble composé d'au moins 75 % de résidences principales.",
      "Gain énergétique calculé d'au moins 35 %.",
      "Vote en assemblée générale de copropriété.",
      "Audit initial normé.",
      "Si MaPrimeRénov' est visé : ne pas signer les devis définitifs avant l'accord écrit de l'ANAH.",
    ],
    financement: ["Prime par immeuble, selon le nombre de lots et la surface chauffée. Bailleurs et syndics."],
  }),
  fiche({
    code: "BAR-TH-104",
    titre: "Pompe à chaleur air/eau individuelle",
    segment: "Résidentiel",
    technologie: "PAC air/eau — coup de pouce",
    economies: "−30 % à −50 % sur la facture de chauffage, après isolation",
    primeFourchette: "~4 000 €",
    volumeCumac: "~537 MWh cumac",
    principe:
      "Remplacement d'une chaudière fioul ou gaz par une pompe à chaleur air/eau. La puissance se calcule après isolation, pour éviter un surcoût de puissance de 4 000 à 6 000 €.",
    equipements: [
      "Pompe à chaleur air/eau.",
      "Module hydraulique et ballon tampon.",
      "Réseau d'émetteurs désemboué.",
      "Note de dimensionnement.",
    ],
    corpsEtat: ["Plombier-chauffagiste RGE QualiPAC", "Électricien"],
    eligibilite: [
      "Logement existant de plus de 2 ans, chauffé par une chaudière individuelle.",
      "Efficacité saisonnière conforme à la fiche BAR-TH-104.",
      "Dépose de l'ancien générateur et installateur RGE.",
      "Isolation de l'enveloppe avant le dimensionnement du générateur.",
    ],
    financement: ["Coup de pouce chauffage. Maisons au fioul ou au gaz."],
  }),
  fiche({
    code: "BAR-EN-101",
    titre: "Isolation des combles ou de toitures",
    segment: "Résidentiel",
    technologie: "Combles perdus ou rampants",
    economies: "Jusqu'à −30 % des déperditions du logement",
    primeFourchette: "1 500 € à 4 500 €",
    volumeCumac: "201 à 604 MWh cumac",
    principe:
      "Soufflage ou pose en combles perdus, ou isolation des rampants aménagés, avant tout remplacement de chaudière. Les combles sont le premier poste de déperdition.",
    equipements: [
      "Isolant certifié (laine ou ouate de cellulose).",
      "Pare-vapeur lorsque le rampant l'exige.",
      "Trappe isolée et repérage des spots et conduits.",
    ],
    corpsEtat: ["Couvreur ou isoleur RGE", "Plaquiste pour les rampants"],
    eligibilite: [
      "Maison existante de plus de 2 ans.",
      "Résistance thermique au moins égale au seuil de la fiche en vigueur (repère usuel : R ≥ 7 m².K/W en combles perdus, R ≥ 6 m².K/W en rampants).",
      "Entreprise RGE. Prise en charge au m².",
    ],
    financement: ["Repère de chantier maison, sur une base de 10 à 25 €/m²."],
  }),
  fiche({
    code: "BAR-EN-102",
    titre: "Isolation des murs par l'extérieur ou par l'intérieur",
    segment: "Résidentiel",
    technologie: "ITE ou ITI",
    economies: "−20 % à −25 % des déperditions (murs)",
    primeFourchette: "2 500 € à 9 000 €",
    volumeCumac: "336 à 1 208 MWh cumac",
    principe:
      "Isolation des façades par l'extérieur ou par l'intérieur, avant le remplacement de la chaudière. Le générateur se dimensionne ensuite sur des besoins réduits.",
    equipements: [
      "Isolant certifié et finition de façade en ITE, ou doublage en ITI.",
      "Retours de tableau pour limiter les ponts thermiques.",
      "Avis technique du système retenu.",
    ],
    corpsEtat: ["Façadier ITE certifié RGE", "Plaquiste ITI certifié RGE"],
    eligibilite: [
      "Maison existante. Résistance thermique au moins égale au seuil de la fiche en vigueur (repère usuel : R ≥ 3,7 m².K/W).",
      "Entreprise RGE. Prise en charge au m².",
      "L'ITI en geste isolé est exclue de MaPrimeRénov' 2026 : le CEE reste le levier, le parcours accompagné exige un bouquet.",
    ],
    financement: ["Chantiers de façade. L'isolation précède le chauffage."],
  }),
  fiche({
    code: "BAR-EN-103",
    titre: "Isolation d'un plancher bas",
    segment: "Résidentiel",
    technologie: "Plancher sur sous-sol, cave ou vide sanitaire",
    economies: "−7 % à −10 % des déperditions (plancher bas)",
    primeFourchette: "900 € à 3 000 €",
    volumeCumac: "121 à 403 MWh cumac",
    principe:
      "Isolation en sous-face du plancher bas sur sous-sol, cave ou vide sanitaire, en complément des combles et des murs.",
    equipements: [
      "Isolant en sous-face, fixé mécaniquement ou projeté selon le support.",
      "Continuité aux murs pour limiter le pont thermique périphérique.",
    ],
    corpsEtat: ["Isolateur plancher bas certifié RGE"],
    eligibilite: [
      "Maison existante avec sous-sol, cave ou vide sanitaire accessible.",
      "Résistance thermique au moins égale au seuil de la fiche en vigueur (repère usuel : R ≥ 3 m².K/W).",
      "Entreprise RGE. Prise en charge au m².",
    ],
    financement: ["Repère de chantier maison. Geste d'enveloppe souvent oublié."],
  }),
  fiche({
    code: "BAR-TH-148",
    titre: "Chauffe-eau thermodynamique individuel (CET)",
    segment: "Résidentiel",
    technologie: "Ballon thermodynamique — COP > 2,4",
    economies: "−70 % d'électricité sur l'eau chaude",
    primeFourchette: "250 € à 500 € CEE",
    volumeCumac: "34 à 67 MWh cumac",
    principe:
      "Ballon d'eau chaude sanitaire équipé d'une micro-pompe à chaleur intégrée, qui extrait les calories de l'air ambiant ou extérieur pour chauffer l'eau avec environ 70 % d'électricité en moins.",
    equipements: [
      "Ballon thermodynamique émaillé ou inox, 200 L à 270 L.",
      "Fluide frigorigène R290.",
      "Conduits aérauliques rigides isolés vers l'extérieur.",
      "Groupe de sécurité neuf 7 bar et vase d'expansion sanitaire.",
    ],
    corpsEtat: [
      "Plombier-chauffagiste certifié RGE QualiPAC ou Qualit'EnR sanitaire",
      "Électricien (protection différentielle 30 mA)",
    ],
    eligibilite: [
      "Coefficient de performance COP supérieur à 2,4 selon EN 16147.",
      "Profil de soutirage certifié.",
      "Remplacement d'un chauffe-eau électrique en maison individuelle de plus de 2 ans.",
    ],
    financement: ["Cumulable avec MaPrimeRénov' jusqu'à 1 200 €."],
  }),
  fiche({
    code: "BAR-TH-173",
    titre: "Système de régulation par thermostat programmable connecté",
    segment: "Résidentiel",
    technologie: "Régulation connectée classe B",
    economies: "Abaissement automatique en cas d'absence",
    primeFourchette: "620 € à 1 200 € CEE",
    volumeCumac: "83 à 161 MWh cumac",
    principe:
      "Pilotage intelligent du chauffage logement par logement et pièce par pièce : programmation hebdomadaire et abaissement automatique en cas d'absence.",
    equipements: [
      "Thermostat programmable d'ambiance connecté radio ou Wi-Fi.",
      "Têtes thermostatiques électroniques communicantes sur chaque radiateur.",
      "Passerelle domotique.",
      "Sonde de température extérieure.",
      "Application de gestion.",
    ],
    corpsEtat: [
      "Électricien installateur domotique / intégrateur",
      "Plombier-chauffagiste d'entretien",
    ],
    eligibilite: [
      "Régulation de classe B ou supérieure (NF EN ISO 52120-1).",
      "Régulation par pièce : robinets thermostatiques ou régulation zonale.",
      "Coup de pouce pilotage connecté.",
    ],
    financement: ["Prise en charge intégrale à 100 % du matériel et de la pose pour le ménage."],
  }),
];

export function ficheStrategiqueParCode(code: string): FicheStrategiqueCee | null {
  const cle = code.trim().toUpperCase();
  return (
    FICHES_STRATEGIQUES_CEE.find((fiche) => fiche.code === cle) ??
    FICHES_STRATEGIQUES_CEE.find((fiche) => fiche.codesAssocies.includes(cle)) ??
    null
  );
}

export function ficheParCategorie(categorieId: string): FicheStrategiqueCee | null {
  return FICHES_STRATEGIQUES_CEE.find((fiche) => fiche.categorieId === categorieId) ?? null;
}
