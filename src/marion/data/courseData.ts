export const BRAND = {
  name: "Plume de Soi",
  formation: "L'Art de la Métamorphose",
  discipline: "Massage métamorphique",
  priceEur: 195,
  email: "marion.d@plumedesoi.fr",
  formatrice: "Marion Duriaux",
  telegramUrl: "https://t.me/+plumedesoi",
  telegramLabel: "Cercle privé des élèves",
  garantieJours: 14,
  acces: "Accès à vie",
} as const;

export type Lesson = {
  id: string;
  title: string;
  durationMin: number;
  summary: string;
};

export type CourseModule = {
  id: string;
  index: number;
  title: string;
  intention: string;
  lessons: Lesson[];
};

export const MODULES: CourseModule[] = [
  {
    id: "m1",
    index: 1,
    title: "Poser le geste",
    intention: "Comprendre l'esprit du massage métamorphique et préparer une présence juste, avant même de toucher.",
    lessons: [
      {
        id: "m1-l1",
        title: "D'où vient cette pratique",
        durationMin: 14,
        summary:
          "L'histoire douce du massage métamorphique, son intention, et ce qu'il n'est pas : ni soin médical, ni technique à performer.",
      },
      {
        id: "m1-l2",
        title: "La carte des zones, sans jargon",
        durationMin: 18,
        summary:
          "Lire les pieds, les mains et la tête comme une carte sensible. Repères clairs, pression plume, aucun schéma à réciter.",
      },
      {
        id: "m1-l3",
        title: "Préparer l'espace et soi",
        durationMin: 12,
        summary:
          "Lumière, silence, installation de la personne, et la qualité d'attention qui précède le premier contact.",
      },
      {
        id: "m1-l4",
        title: "Le toucher plume, en démonstration",
        durationMin: 16,
        summary:
          "Marion montre le poids de la main, le rythme, et la façon de rester quand il ne se passe « rien ».",
      },
    ],
  },
  {
    id: "m2",
    index: 2,
    title: "Le protocole des pieds",
    intention: "Traverser le cœur de la séance : les deux pieds, dans l'ordre, avec une pression constante et légère.",
    lessons: [
      {
        id: "m2-l1",
        title: "Pied gauche, du talon vers les orteils",
        durationMin: 20,
        summary: "Le fil de la séance côté gauche. Où poser les doigts, combien de temps rester, quand avancer.",
      },
      {
        id: "m2-l2",
        title: "Pied droit, le même chant",
        durationMin: 18,
        summary: "Reprendre le protocole sans accélérer. Les différences fines, et l'erreur de vouloir « équilibrer ».",
      },
      {
        id: "m2-l3",
        title: "Rythme, silence, et ce qui émerge",
        durationMin: 11,
        summary: "Respirer avec la séance. Accueillir une émotion, un souvenir, ou un simple calme, sans interpréter.",
      },
      {
        id: "m2-l4",
        title: "Pratique guidée intégrale",
        durationMin: 28,
        summary: "Une séance des pieds à suivre en même temps, chez vous, sur une personne volontaire ou en auto-pratique guidée.",
      },
    ],
  },
  {
    id: "m3",
    index: 3,
    title: "Mains, tête, clôture",
    intention: "Étendre le même geste aux mains et à la tête, puis refermer la séance sans la brusquer.",
    lessons: [
      {
        id: "m3-l1",
        title: "Le protocole des mains",
        durationMin: 16,
        summary: "La même qualité de toucher, une géographie plus petite. Ordre, durée, et comment tenir une main sans la diriger.",
      },
      {
        id: "m3-l2",
        title: "Le protocole de la tête",
        durationMin: 15,
        summary: "Gestes lents autour du crâne. Pression minimale, consentement permanent, et les zones que l'on n'insiste jamais.",
      },
      {
        id: "m3-l3",
        title: "Clôturer, rester, raccompagner",
        durationMin: 10,
        summary: "Le dernier instant compte autant que le premier. Comment quitter le contact et laisser la personne revenir à son rythme.",
      },
      {
        id: "m3-l4",
        title: "Séance complète commentée",
        durationMin: 32,
        summary: "Pieds, mains, tête : Marion commente une séance entière, les micro-choix et les silences.",
      },
    ],
  },
  {
    id: "m4",
    index: 4,
    title: "Tenir l'accompagnement",
    intention: "Passer de la technique apprise à une première séance offerte, avec une éthique simple et tenue.",
    lessons: [
      {
        id: "m4-l1",
        title: "Posture, limites, et non-promesse",
        durationMin: 13,
        summary:
          "Ce que l'on peut dire, ce que l'on ne promet pas. Le cadre d'une pratique de bien-être, distincte d'un acte de soin.",
      },
      {
        id: "m4-l2",
        title: "Accueillir sans interpréter",
        durationMin: 12,
        summary: "Mots justes quand quelque chose se dit. Rester praticienne du geste, pas enquêtrice du passé.",
      },
      {
        id: "m4-l3",
        title: "Votre première séance offerte",
        durationMin: 14,
        summary: "Préparer, proposer, conduire et clore une séance pour un proche, avec la fiche protocole à côté de vous.",
      },
      {
        id: "m4-l4",
        title: "La suite du chemin",
        durationMin: 9,
        summary: "Comment répéter, quoi noter, et comment le cercle Telegram prolonge la formation sans la remplacer.",
      },
    ],
  },
];

export const ALL_LESSONS: Lesson[] = MODULES.flatMap((module) => module.lessons);

export function lessonDurationLabel(minutes: number): string {
  return `${minutes} min`;
}

export function totalDurationMin(): number {
  return ALL_LESSONS.reduce((sum, lesson) => sum + lesson.durationMin, 0);
}

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  detail: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Je croyais devoir apprendre une technique compliquée. Marion m'a appris à rester. Mes premières séances sont devenues simples, et les personnes repartent plus lentes, plus présentes.",
    name: "Claire",
    detail: "Praticienne bien-être, Lyon",
  },
  {
    id: "t2",
    quote:
      "Le protocole des pieds est filmé avec une clarté rare. J'ai pu le refaire le soir même, fiche PDF ouverte, sans me perdre dans les zones.",
    name: "Inès",
    detail: "Élève de la première session",
  },
  {
    id: "t3",
    quote:
      "Ce n'est pas une formation qui pousse à vendre. C'est un geste que l'on intègre. Le cercle Telegram m'a tenue dans les semaines d'après, quand le doute revenait.",
    name: "Nadia",
    detail: "Accompagnante, Bordeaux",
  },
  {
    id: "t4",
    quote:
      "J'ai offert trois séances à des proches avant d'oser le proposer. La garantie m'a enlevé la peur de me tromper d'achat : je n'en ai pas eu besoin.",
    name: "Julien",
    detail: "Reconversion douce, Nantes",
  },
  {
    id: "t5",
    quote:
      "La voix de Marion est le vrai support. On sent qu'elle pratique. Rien n'est survendu, et c'est précisément ce qui m'a décidée.",
    name: "Sophie",
    detail: "Élève, Annecy",
  },
];

export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ: FaqItem[] = [
  {
    question: "Faut-il déjà pratiquer un massage ?",
    answer:
      "Non. La formation part du geste le plus simple. Si vous avez déjà une pratique, elle affine surtout votre qualité de présence et votre cadre.",
  },
  {
    question: "Combien de temps faut-il pour tout voir ?",
    answer: `Les quatre modules représentent environ ${Math.round(totalDurationMin() / 60)} heures de vidéo. Vous avancez à votre rythme : l'accès reste ouvert.`,
  },
  {
    question: "Puis-je exercer ensuite ?",
    answer:
      "Vous repartez avec un protocole complet pour offrir des séances de bien-être. Cette formation ne délivre pas un diplôme d'État et ne remplace aucun cursus de soin réglementé.",
  },
  {
    question: "Le paiement est-il réel sur cette page ?",
    answer:
      "Sur cette démonstration, le paiement est simulé : aucun débit n'est effectué. L'inscription ouvre immédiatement l'espace élève sur cet appareil.",
  },
  {
    question: "Comment fonctionne la garantie ?",
    answer: `Vous disposez de ${BRAND.garantieJours} jours après l'inscription. Un écrit à ${BRAND.email} suffit pour demander le remboursement intégral.`,
  },
];

export const ENROLL_KEY = "plume-de-soi-inscrit";
export const PROGRESS_KEY = "plume-de-soi-progression";

export function protocoleLines(): string[] {
  return [
    "PLUME DE SOI",
    "Protocole — L'Art de la Metamorphose",
    "Massage metamorphique · Marion Duriaux",
    "",
    "Avant la seance",
    "- Piece calme, lumiere basse, couverture a portee.",
    "- Expliquer : pratique de bien-etre, sans promesse de soin.",
    "- Demander le consentement, y compris pour la tete.",
    "",
    "1. Accueil et silence (2 a 3 minutes)",
    "2. Pieds — pression plume, du talon vers les orteils",
    "   Pied gauche, puis pied droit. Rester, ne pas insister.",
    "3. Mains — meme qualite de toucher, geste plus court.",
    "4. Tete — lenteur, pression minimale, zones jamais forcees.",
    "5. Cloture — quitter le contact, rester un instant,",
    "   puis laisser la personne revenir a son rythme.",
    "",
    "Apres",
    "- Ne pas interpreter ce qui a ete dit ou ressenti.",
    "- Noter seulement la duree et votre propre posture.",
    "",
    `Contact : ${BRAND.email}`,
    "Groupe prive : cercle des eleves Plume de Soi",
  ];
}
