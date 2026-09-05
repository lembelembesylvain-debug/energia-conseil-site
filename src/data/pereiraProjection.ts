/** Comparaison visuelle Pereira uniquement. Photos réelles (audit + client). Projection ITI visuelle indicative, jamais une photo réelle après travaux. */

export const PEREIRA_LABEL_AVANT = "Avant — photo réelle";
export const PEREIRA_LABEL_APRES = "Après — projection visuelle indicative de l’ITI 12 cm";
export const PEREIRA_MENTION_SIMULATION =
  "Image simulée — ne constitue pas une photo réelle après travaux, une mesure thermographique ou un engagement de résultat.";
export const PEREIRA_PLACEHOLDER_APRES = "Projection réaliste à générer";

const SOURCE_AUDIT = "Photo réelle extraite de l’audit LEO ENERGY (visite 03/07/2026).";
const SOURCE_CLIENT =
  "Photo réelle fournie pour le dossier AUDIT-PEREIRA-2026-001. Murs existants sans isolation intérieure.";

export const PEREIRA_PHOTOS_AVANT = [
  {
    id: "facade-angle",
    src: "/test-maison-pereira/avant/facade-angle.png",
    titre: "Façade d’angle — état des lieux",
    source: SOURCE_AUDIT,
  },
  {
    id: "facade-porche",
    src: "/test-maison-pereira/avant/facade-porche.png",
    titre: "Façade porche — état des lieux",
    source: SOURCE_AUDIT,
  },
  {
    id: "interieur-angle",
    src: "/test-maison-pereira/avant/interieur-angle.png",
    titre: "Angle intérieur — murs pisé existants",
    source: SOURCE_AUDIT,
  },
  {
    id: "interieur-voliere",
    src: "/test-maison-pereira/avant/interieur-voliere.jpg",
    titre: "Pièce intérieure occupée",
    source: SOURCE_CLIENT,
  },
  {
    id: "interieur-fenetre",
    src: "/test-maison-pereira/avant/interieur-fenetre.jpg",
    titre: "Pièce avec baie et sommier",
    source: SOURCE_CLIENT,
  },
  {
    id: "interieur-evier",
    src: "/test-maison-pereira/avant/interieur-evier.jpg",
    titre: "Pièce technique — évier et baie",
    source: SOURCE_CLIENT,
  },
  {
    id: "interieur-frigo",
    src: "/test-maison-pereira/avant/interieur-frigo.jpg",
    titre: "Pièce avec radiateur et baie",
    source: SOURCE_CLIENT,
  },
  {
    id: "interieur-etagere",
    src: "/test-maison-pereira/avant/interieur-etagere.jpg",
    titre: "Pièce avec étagère et baie",
    source: SOURCE_CLIENT,
  },
  {
    id: "interieur-voliere-baie",
    src: "/test-maison-pereira/avant/interieur-voliere-baie.jpg",
    titre: "Pièce occupée — baie et radiateur",
    source: SOURCE_CLIENT,
  },
  {
    id: "interieur-coin-radiateur",
    src: "/test-maison-pereira/avant/interieur-coin-radiateur.jpg",
    titre: "Angle — baie et radiateur",
    source: SOURCE_CLIENT,
  },
  {
    id: "interieur-stockage",
    src: "/test-maison-pereira/avant/interieur-stockage.jpg",
    titre: "Pièce de stockage — baie",
    source: SOURCE_CLIENT,
  },
  {
    id: "interieur-loire",
    src: "/test-maison-pereira/avant/interieur-loire.jpg",
    titre: "Pièce vide — baie sur rue",
    source: SOURCE_CLIENT,
  },
  {
    id: "interieur-baie-encastree",
    src: "/test-maison-pereira/avant/interieur-baie-encastree.jpg",
    titre: "Baie encastrée — tableau existant",
    source: SOURCE_CLIENT,
  },
] as const;

export const PEREIRA_PAIRES_ITI = [
  {
    id: "iti-12cm-voliere",
    titre: "Pièce intérieure occupée",
    avantSrc: "/test-maison-pereira/avant/interieur-voliere.jpg",
    projectionSrc: "/test-maison-pereira/projections/projection-realiste-iti-voliere.jpg",
    portrait: false,
  },
  {
    id: "iti-12cm-fenetre",
    titre: "Pièce avec baie et sommier",
    avantSrc: "/test-maison-pereira/avant/interieur-fenetre.jpg",
    projectionSrc: "/test-maison-pereira/projections/projection-realiste-iti-fenetre.jpg",
    portrait: true,
  },
  {
    id: "iti-12cm-evier",
    titre: "Pièce technique — évier et baie",
    avantSrc: "/test-maison-pereira/avant/interieur-evier.jpg",
    projectionSrc: "/test-maison-pereira/projections/projection-realiste-iti-evier.jpg",
    portrait: true,
  },
  {
    id: "iti-12cm-frigo",
    titre: "Pièce avec radiateur et baie",
    avantSrc: "/test-maison-pereira/avant/interieur-frigo.jpg",
    projectionSrc: "/test-maison-pereira/projections/projection-realiste-iti-frigo.jpg",
    portrait: true,
  },
  {
    id: "iti-12cm-etagere",
    titre: "Pièce avec étagère et baie",
    avantSrc: "/test-maison-pereira/avant/interieur-etagere.jpg",
    projectionSrc: "/test-maison-pereira/projections/projection-realiste-iti-etagere.jpg",
    portrait: true,
  },
  {
    id: "iti-12cm-voliere-baie",
    titre: "Pièce occupée — baie et radiateur",
    avantSrc: "/test-maison-pereira/avant/interieur-voliere-baie.jpg",
    projectionSrc: "/test-maison-pereira/projections/projection-realiste-iti-voliere-baie.jpg",
    portrait: true,
  },
  {
    id: "iti-12cm-coin-radiateur",
    titre: "Angle — baie et radiateur",
    avantSrc: "/test-maison-pereira/avant/interieur-coin-radiateur.jpg",
    projectionSrc: "/test-maison-pereira/projections/projection-realiste-iti-coin-radiateur.jpg",
    portrait: true,
  },
  {
    id: "iti-12cm-stockage",
    titre: "Pièce de stockage — baie",
    avantSrc: "/test-maison-pereira/avant/interieur-stockage.jpg",
    projectionSrc: "/test-maison-pereira/projections/projection-realiste-iti-stockage.jpg",
    portrait: true,
  },
  {
    id: "iti-12cm-loire",
    titre: "Pièce vide — baie sur rue",
    avantSrc: "/test-maison-pereira/avant/interieur-loire.jpg",
    projectionSrc: "/test-maison-pereira/projections/projection-realiste-iti-loire.jpg",
    portrait: true,
  },
  {
    id: "iti-12cm-baie-encastree",
    titre: "Baie encastrée — tableau existant",
    avantSrc: "/test-maison-pereira/avant/interieur-baie-encastree.jpg",
    projectionSrc: "/test-maison-pereira/projections/projection-realiste-iti-baie-encastree.jpg",
    portrait: true,
  },
] as const;

export const PEREIRA_RESUME_ITI =
  "À gauche : photo réelle du logement. À droite : projection visuelle de la même pièce après doublage ITI 12 cm (murs régularisés, tableaux adaptés, finition plâtre / peinture neutre). Ce n’est pas une photo réelle après travaux.";

export const PEREIRA_LIMITE_ITI =
  "Aucune température, aucun pourcentage de confort et aucune économie financière ne sont simulés ici. Les consommations et classes DPE restent celles de l’audit joint (320 kWhEP/m².an en état initial ; 73 kWhEP/m².an après scénarios 1 et 2 de l’auditeur).";
