import { BADGES_OFFICIELS, BRANDING } from "../branding";
import { ficheStrategiqueParCode, type FicheStrategiqueCee } from "./fichesStrategiquesCee";

export const MENTION_AIDES_CATALOGUE =
  "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon les revenus réels du client et l'éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE. Cumul des aides plafonné à 100 % des travaux.";

export const POLICE_DECENNALE = "Calipso Assurances n° LUNPIB2604975";

export const QUALIFICATION_CERTIBAT =
  "Référent Technique Rénovation Globale Certibat / Réno-Perf — évaluation QCM 28/30";

export const BADGE_TESLA =
  BADGES_OFFICIELS.find((item) => item.includes("Tesla")) ??
  "Partenaire Référencé Tesla Energy (Powerwall 3 & Wall Connector)";

export const ORDRE_TRAVAUX =
  "Ordre d'exécution impératif : combles, murs, planchers, fenêtres, VMC, pompe à chaleur, ballon thermodynamique, photovoltaïque en dernier. La puissance de la PAC se calcule après isolation.";

export type BlocCatalogue = {
  titre: string;
  texte?: string;
  puces?: string[];
};

export type SectionCatalogue = "couverture" | "garanties" | "residentiel" | "b2b" | "profils" | "trame";

export type PlancheCatalogue = {
  id: string;
  section: SectionCatalogue;
  kicker: string;
  titre: string;
  image?: string;
  alt?: string;
  blocs: BlocCatalogue[];
};

export const LOGO_COUVERTURE = "/assets/energia-logo-arbres.png";

export const MOT_FONDATEUR = [
  "La rénovation énergétique ne doit plus être un parcours du combattant, ni une source d'angoisse financière pour les propriétaires et les chefs d'entreprise.",
  "Chez ENERGIA-CONSEIL IA®, le Bureau d'Études Thermiques et le Contractant Général sont réunis sous une même autorité.",
  "Nos modélisations d'ingénierie et l'intelligence artificielle analysent chaque bâtiment. Nous constituons les dossiers d'aides — MaPrimeRénov', Certificats d'Économies d'Énergie, Coup de Pouce — et le financement du montant des travaux est monté sans avance de trésorerie sur le chantier, sous réserve d'acceptation du prêt. L'exécution est pilotée par des artisans qualifiés RGE, sous la responsabilité décennale d'ENERGIA-CONSEIL IA®, Contractant Général.",
  "La mission est claire : transformer les contraintes réglementaires et les dépenses énergétiques en un investissement patrimonial durable. La garantie décennale couvre les travaux pendant 10 ans. La rentabilité se démontre chantier par chantier, après audit.",
].join("\n\n");

function depuisFiche(fiche: FicheStrategiqueCee, section: SectionCatalogue, complement?: BlocCatalogue[]): PlancheCatalogue {
  return {
    id: fiche.code.toLowerCase(),
    section,
    kicker: `${fiche.segment} · ${fiche.code}`,
    titre: fiche.titre,
    image: fiche.image,
    alt: fiche.alt,
    blocs: [
      { titre: "Principe", texte: fiche.principe },
      { titre: "Lecture commerciale", texte: `${fiche.technologie}. ${fiche.economies}.` },
      { titre: "Colisage", puces: fiche.equipements },
      { titre: "Corps d'état", puces: fiche.corpsEtat },
      { titre: "Conditions", puces: fiche.eligibilite },
      {
        titre: "Aides indicatives",
        texte: `Prime CEE : ${fiche.primeFourchette}. Volume : ${fiche.volumeCumac}. ${fiche.financement.join(" ")} ${MENTION_AIDES_CATALOGUE}`,
      },
      ...(complement ?? []),
    ],
  };
}

function ficheOuVide(code: string, section: SectionCatalogue, complement?: BlocCatalogue[]): PlancheCatalogue {
  const fiche = ficheStrategiqueParCode(code);
  if (!fiche) {
    return { id: code, section, kicker: code, titre: code, blocs: [] };
  }
  return depuisFiche(fiche, section, complement);
}

export const PLANCHES_GARANTIES: PlancheCatalogue = {
  id: "garanties",
  section: "garanties",
  kicker: "Bouclier juridique · avant tout chiffrage",
  titre: "Charte des 4 protections ENERGIA",
  blocs: [
    {
      titre: "1. Garantie décennale du Contractant Général — 10 ans",
      texte: `ENERGIA-CONSEIL IA®, interlocuteur unique, engage sa responsabilité décennale sur les travaux objets du marché. Police ${POLICE_DECENNALE}.`,
    },
    {
      titre: "2. Garantie constructeur fabricant — jusqu'à 10 ans",
      texte: "Pompes à chaleur, ballons thermodynamiques, panneaux solaires et régulations : garanties des fabricants, transmises au client. Compresseurs et capteurs solaires : jusqu'à 5 à 10 ans selon le fabricant. Garantie officielle Tesla 10 ans sur la batterie Powerwall 3.",
    },
    {
      titre: "3. Garantie biennale de bon fonctionnement — 2 ans",
      texte: "Remplacement ou réparation de tout élément d'équipement dissociable qui présente un défaut de fonctionnement.",
    },
    {
      titre: "4. Garantie de parfait achèvement — 1 an",
      texte: "Prise en charge du désordre signalé à compter de la réception, pendant les 12 premiers mois.",
    },
    {
      titre: "Avis",
      texte: "Avis de principe : Julia — Juriste ENERGIA-CONSEIL IA®. La Clause Julia Protection Aides (plafond 2 000 €) figure au devis.",
    },
  ],
};

export const PLANCHES_RESIDENTIEL: PlancheCatalogue[] = [
  ficheOuVide("BAR-TH-164", "residentiel", [
    {
      titre: "Saut de classe",
      texte:
        "Objectif lu sur l'audit : sortie de passoire F/G, visée B en parcours Performance, visée A en parcours Excellence. Le gain affiché est celui du scénario réalisé.",
    },
    {
      titre: "Parcours Accompagné ANAH 2026",
      texte: `Prise en charge jusqu'à 80 % pour un profil Bleu, plafonds 30 000 € HT (2 classes) et 40 000 € HT (3 classes et plus), soit au plus 24 000 € ou 32 000 €. Jaune 60 %, Violet 45 %, Rose 10 %. Bonus sortie de passoire : 1 500 €. MAR Antoine BARATIER — Cabinet C2ET. ${MENTION_AIDES_CATALOGUE}`,
    },
    { titre: "Ordre d'exécution", texte: ORDRE_TRAVAUX },
  ]),
  ficheOuVide("BAR-TH-145", "residentiel", [
    {
      titre: "Lecture immeuble",
      texte:
        "La fiche BAR-TH-145 vise la copropriété et le bailleur, avec un gain calculé d'au moins 35 %. La sortie de passoire d'une maison individuelle se traite sur BAR-TH-164.",
    },
  ]),
  ficheOuVide("BAR-TH-104", "residentiel", [
    {
      titre: "Générateur retenu",
      texte:
        "Fluide R290, COP d'au moins 4 après isolation (4,5 en parcours Performance). Pose selon les distances de la notice : le R290 est inflammable. Socle antivibratile, hors des chambres. MaPrimeRénov' geste : 5 000 / 4 000 / 3 000 / 0 € selon Bleu, Jaune, Violet, Rose. Le reste à charge se lit sur le devis CRM.",
    },
    { titre: "Ordre d'exécution", texte: ORDRE_TRAVAUX },
  ]),
  ficheOuVide("BAR-TH-148", "residentiel", [
    {
      titre: "Eau chaude",
      texte:
        "Jusqu'à −70 % d'électricité sur l'eau chaude par rapport à un cumulus à résistance, pour un COP supérieur à 2,4 (EN 16147). Ordre de grandeur, pas un résultat garanti. MaPrimeRénov' : 1 200 / 800 / 400 / 0 €.",
    },
  ]),
  ficheOuVide("BAR-EN-102", "residentiel", [
    {
      titre: "Mise en œuvre ITE",
      texte:
        "PSE graphité gris, R ≥ 3,7 m².K/W, chevilles à rosace étoile, sous-enduit armé, retours de tableaux. Bâti en pisé : étude de perspiration avant PSE. L'ITI en geste isolé est exclue de MaPrimeRénov' 2026. Période favorable : avril à octobre.",
    },
  ]),
  ficheOuVide("BAR-EN-101", "residentiel"),
  ficheOuVide("BAR-EN-103", "residentiel"),
  ficheOuVide("BAR-TH-173", "residentiel", [
    {
      titre: "Prise en charge",
      texte:
        "Lorsque le devis de matériel et de pose tient dans l'enveloppe CEE (repère 620 € à 1 200 €), la prise en charge couvre 100 % du poste pour le ménage. Au-dessus de l'enveloppe accordée, le surplus reste dû.",
    },
  ]),
  {
    id: "tesla",
    section: "residentiel",
    kicker: "Solaire · dernier poste du chantier",
    titre: "Écosystème solaire et stockage Tesla Energy",
    image: "/assets/solaire/maison-solaire-stockage.jpg",
    alt: "Coupe d'une maison solaire : toiture Full Black, Powerwall 3, Wall Connector et circuits prioritaires",
    blocs: [
      { titre: "Statut", texte: BADGE_TESLA },
      {
        titre: "Toiture Full Black",
        texte:
          "3 à 36 kWc, calepinage après baisse des besoins. Repère de production : 1 000 à 1 100 kWh/kWc/an dans le Centre, 1 200 à 1 400 dans le Sud. Les seuils 3, 9 et 36 kWc se figent dans l'étude.",
      },
      {
        titre: "Powerwall 3",
        texte:
          "13,5 kWh par unité, jusqu'à 4 unités en parallèle (54 kWh). Onduleur intégré, 6 MPPT, plafond solaire 20 kWc. Secours sans coupure sur les circuits prioritaires, pas sur l'intégralité du tableau. Garantie officielle Tesla 10 ans sur la batterie.",
      },
      {
        titre: "Wall Connector",
        texte: "Borne 22 kW. La puissance délivrée dépend du triphasé, de l'abonnement et du chargeur du véhicule.",
      },
      { titre: "Ordre d'exécution", texte: ORDRE_TRAVAUX },
      { titre: "Aides", texte: MENTION_AIDES_CATALOGUE },
    ],
  },
];

/** Fiches client. Aucun ratio de direction (marge HT, coût, %) n'est recopié ici. */
const CODES_TERTIAIRE = [
  "BAT-TH-116",
  "BAT-TH-139",
  "BAT-TH-134",
  "BAT-TH-140",
  "BAT-EQ-127",
  "BAT-TH-104",
  "BAT-EN-101",
  "BAT-TH-157",
] as const;

const CODES_INDUSTRIE = [
  "IND-UT-117",
  "IND-UT-125",
  "IND-UT-121",
  "IND-UT-114",
  "IND-UT-102",
  "IND-UT-129",
  "IND-UT-116",
  "IND-UT-115",
  "IND-UT-134",
] as const;

function planchePublique(code: string, famille: string): PlancheCatalogue {
  const fiche = ficheStrategiqueParCode(code);
  if (!fiche) {
    return { id: code.toLowerCase(), section: "b2b", kicker: `${famille} · ${code}`, titre: code, blocs: [] };
  }
  return {
    id: fiche.code.toLowerCase(),
    section: "b2b",
    kicker: `${famille} · ${fiche.code}`,
    titre: fiche.titre,
    image: fiche.image,
    alt: fiche.alt,
    blocs: [
      { titre: "Principe physique", texte: fiche.principe },
      { titre: "Colisage matériel", puces: [...fiche.equipements] },
      { titre: "Corps d'état qualifiés", puces: [...fiche.corpsEtat] },
      {
        titre: "Prime CEE indicative",
        texte: `${fiche.primeFourchette}. Volume : ${fiche.volumeCumac}. ${MENTION_AIDES_CATALOGUE}`,
      },
    ],
  };
}

export const PLANCHES_B2B: PlancheCatalogue[] = [
  ...CODES_TERTIAIRE.map((code) => planchePublique(code, "Tertiaire")),
  ...CODES_INDUSTRIE.map((code) => planchePublique(code, "Industrie")),
];

export const SLOGAN_INSTITUTIONNEL =
  "L'intelligence artificielle et l'ingénierie thermique au service de votre transition énergétique durable.";

export type ProfilClient = {
  id: string;
  titre: string;
  psychologie: string;
  posture: string;
  argument: string;
  levier: string;
};

export const PROFILS_CLIENTS: ProfilClient[] = [
  {
    id: "passoire",
    titre: "Passoire thermique F/G — résidentiel ANAH, PAC, ITE",
    psychologie: "Peur de l'arnaque, budget serré, angoisse des factures.",
    posture: "Médecin de famille rassurant, tiers de confiance bienveillant.",
    argument:
      "Zéro avance de trésorerie sur le chantier, sous réserve d'acceptation du financement. Rien n'est signé comme devis définitif sans l'accord écrit de l'ANAH. Garantie décennale 10 ans, police Calipso Assurances.",
    levier: "Sécurité absolue et reste à charge minimisé.",
  },
  {
    id: "prestige",
    titre: "Prestige et demeures de caractère — solaire Tesla Powerwall 3 et Wall Connector",
    psychologie: "Fierté de la propriété, passion pour la technique, recherche d'indépendance et d'esthétique.",
    posture: "Consultant haute technologie, design et valorisation de patrimoine.",
    argument:
      "Finition Full Black intégrée. Batterie Tesla de 13,5 à 54 kWh, relais instantané anti-coupure sur les circuits prioritaires, borne 22 kW. Garantie officielle Tesla 10 ans sur la Powerwall 3.",
    levier: "Autonomie énergétique et standing.",
  },
  {
    id: "usine",
    titre: "Directeur d'usine — fiches CEE IND-UT, chaleur fatale et compresseurs",
    psychologie: "Pragmatique, pressé, focalisé sur l'EBITDA, le cash et le retour sur investissement.",
    posture: "Ingénieur d'affaires B2B et financier d'énergie.",
    argument:
      "Phrase de rendez-vous : valorisation d'une chaleur perdue vers 85 °C, prime CEE pouvant financer 70 à 85 % de l'installation, retour visé sous 14 mois, sans arrêt machine. Ces ordres de grandeur se confirment sur le dossier. Ils ne se garantissent pas à la première poignée de main.",
    levier: "Cash net, baisse des coûts fixes et décarbonation.",
  },
  {
    id: "tertiaire",
    titre: "Gestionnaire tertiaire et collectivités — décret BACS et GTB BAT-TH-116",
    psychologie: "Peur du contrôle réglementaire, obligation BACS 2027, exigence de conformité.",
    posture: "Auditeur et garant de conformité réglementaire.",
    argument:
      "Mise en conformité du décret BACS. Prime CEE indicative jusqu'à 180 000 € sur la fiche BAT-TH-116, avant l'échéance des assujettis concernés.",
    levier: "Sécurité juridique et tranquillité d'esprit.",
  },
];

export const PLANCHE_PROFILS: PlancheCatalogue = {
  id: "profils",
  section: "profils",
  kicker: "Guide Damien · avant la trame",
  titre: "Profils clients et postures commerciales",
  blocs: [
    ...PROFILS_CLIENTS.map((profil) => ({
      titre: profil.titre,
      puces: [
        `Psychologie : ${profil.psychologie}`,
        `Posture : ${profil.posture}`,
        `Argument : ${profil.argument}`,
        `Levier : ${profil.levier}`,
      ],
    })),
    { titre: "Aides", texte: MENTION_AIDES_CATALOGUE },
  ],
};

export const CONTACTS_QUATRIEME = [
  { role: "Direction", valeur: "Sylvain LEMBELEMBE — 06 10 59 68 98" },
  { role: "Commercial référent", valeur: "Damien — 06 72 68 09 68" },
  { role: "Email officiel", valeur: "contact@renovoptim-ia.com" },
  { role: "Siège", valeur: BRANDING.siege },
] as const;

export const BADGES_QUATRIEME = [
  `Marque déposée INPI n° ${BRANDING.inpi}`,
  "Référent Certibat Réno-Perf (28/30)",
  "Partenaire Référencé Tesla Energy",
] as const;

export const PLANCHE_TRAME: PlancheCatalogue = {
  id: "trame",
  section: "trame",
  kicker: "Méthode Damien · deux temps",
  titre: "Trame de vente en 2 temps",
  blocs: [
    {
      titre: "Temps 1 — Diagnostic initial",
      texte:
        "Visite, état des lieux, déperditions, DPE de départ, scénario de saut de classe. Aucun marché ferme n'est annoncé à ce rendez-vous.",
      puces: [
        "Écouter le bâtiment avant de parler d'aides.",
        "Poser l'ordre des travaux : enveloppe, puis générateur, puis solaire.",
        "Qualifier le profil d'aides sans chiffrer un reste à charge ferme.",
      ],
    },
    {
      titre: "Temps 2 — Restitution du devis officiel CRM",
      texte:
        "Le devis Contractant Général, le colisage, les aides estimées et le reste à charge indicatif sortent du CRM. C'est le seul document qui se signe.",
      puces: [
        "Scénario A — aides maximum : le devis définitif se signe après l'accord écrit de l'ANAH. Le signer avant fait perdre le MaPrimeRénov'.",
        "Scénario B — démarrage rapide : renonciation au MaPrimeRénov', départ possible sans cette attente.",
        "Les deux scénarios sont exclusifs.",
        "Financement : FABIEN — VIVONS COURTIER — 06 71 19 96 45. Éco-PTZ jusqu'à 50 000 €. Prêt travaux jusqu'à 75 000 €.",
      ],
    },
    {
      titre: "Phrase de clôture",
      texte:
        "L'enveloppe d'abord, le générateur ensuite, le soleil en dernier. Le devis définitif du parcours MaPrimeRénov' attend l'accord écrit de l'ANAH. Le stockage Tesla couvre les circuits choisis ensemble, avec une garantie batterie de 10 ans.",
    },
    { titre: "Aides", texte: MENTION_AIDES_CATALOGUE },
  ],
};

export const SECTIONS_BOOK: { id: string; ancre: string; label: string }[] = [
  { id: "couverture", ancre: "book-couverture", label: "Couverture" },
  { id: "garanties", ancre: "book-garanties", label: "4 garanties" },
  { id: "residentiel", ancre: "book-residentiel", label: "Résidentiel & Tesla" },
  { id: "b2b", ancre: "book-b2b", label: "Tertiaire & industrie" },
  { id: "profils", ancre: "book-profils", label: "4 profils clients" },
  { id: "trame", ancre: "book-trame", label: "Trame en 2 temps" },
  { id: "quatrieme", ancre: "book-quatrieme", label: "Quatrième de couverture" },
];

export const MENTIONS_COUVERTURE = [
  `Marque déposée INPI n° ${BRANDING.inpi}`,
  `${BRANDING.forme} au capital de ${BRANDING.capital} — SIREN ${BRANDING.rcsAffiche} — SIRET ${BRANDING.siretAffiche}`,
  `Siège : ${BRANDING.siege}`,
  QUALIFICATION_CERTIBAT,
  `Garantie décennale et responsabilité civile professionnelle — ${POLICE_DECENNALE}`,
];
