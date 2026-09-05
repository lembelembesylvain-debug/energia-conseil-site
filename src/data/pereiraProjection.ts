/** Comparaison visuelle Pereira uniquement. 8 paires Avant / Après ITI. Jamais une photo réelle après travaux. */

export const PEREIRA_LABEL_AVANT = "Avant — photo réelle";
export const PEREIRA_LABEL_APRES = "Après — projection visuelle indicative de l’ITI 12 cm";
export const PEREIRA_MENTION_SIMULATION =
  "Image simulée — ne constitue pas une photo réelle après travaux, une mesure thermographique ou un engagement de résultat.";
export const PEREIRA_PLACEHOLDER_APRES =
  "Projection après indisponible — vue à générer après validation technique";

export type PairePereiraIti = {
  id: string;
  index: number;
  titre: string;
  avantSrc: string;
  avantFichier: string;
  projectionSrc: string | null;
  apresFichier: string | null;
  portrait: boolean;
};

export const PEREIRA_PAIRES_ITI: readonly PairePereiraIti[] = [
  {
    id: "vue-01",
    index: 1,
    titre: "Pièce intérieure occupée",
    avantSrc: "/test-maison-pereira/galerie/avant-01.jpg",
    avantFichier: "public/test-maison-pereira/avant/interieur-voliere.jpg",
    projectionSrc: "/test-maison-pereira/galerie/apres-01.jpg",
    apresFichier: "public/test-maison-pereira/galerie/apres-01.jpg",
    portrait: false,
  },
  {
    id: "vue-02",
    index: 2,
    titre: "Pièce avec baie et sommier",
    avantSrc: "/test-maison-pereira/galerie/avant-02.jpg",
    avantFichier: "public/test-maison-pereira/avant/interieur-fenetre.jpg",
    projectionSrc: "/test-maison-pereira/galerie/apres-02.jpg",
    apresFichier: "public/test-maison-pereira/galerie/apres-02.jpg",
    portrait: true,
  },
  {
    id: "vue-03",
    index: 3,
    titre: "Pièce technique — évier et baie",
    avantSrc: "/test-maison-pereira/galerie/avant-03.jpg",
    avantFichier: "public/test-maison-pereira/avant/interieur-evier.jpg",
    projectionSrc: "/test-maison-pereira/galerie/apres-03.jpg",
    apresFichier: "public/test-maison-pereira/galerie/apres-03.jpg",
    portrait: true,
  },
  {
    id: "vue-04",
    index: 4,
    titre: "Pièce avec radiateur et baie",
    avantSrc: "/test-maison-pereira/galerie/avant-04.jpg",
    avantFichier: "public/test-maison-pereira/avant/interieur-frigo.jpg",
    projectionSrc: "/test-maison-pereira/galerie/apres-04.jpg",
    apresFichier: "public/test-maison-pereira/galerie/apres-04.jpg",
    portrait: true,
  },
  {
    id: "vue-05",
    index: 5,
    titre: "Pièce avec étagère et baie",
    avantSrc: "/test-maison-pereira/galerie/avant-05.jpg",
    avantFichier: "public/test-maison-pereira/avant/interieur-etagere.jpg",
    projectionSrc: "/test-maison-pereira/galerie/apres-05.jpg",
    apresFichier: "public/test-maison-pereira/galerie/apres-05.jpg",
    portrait: true,
  },
  {
    id: "vue-06",
    index: 6,
    titre: "Pièce occupée — baie et radiateur",
    avantSrc: "/test-maison-pereira/galerie/avant-06.jpg",
    avantFichier: "public/test-maison-pereira/avant/interieur-voliere-baie.jpg",
    projectionSrc: "/test-maison-pereira/galerie/apres-06.jpg",
    apresFichier: "public/test-maison-pereira/galerie/apres-06.jpg",
    portrait: true,
  },
  {
    id: "vue-07",
    index: 7,
    titre: "Angle — baie et radiateur",
    avantSrc: "/test-maison-pereira/galerie/avant-07.jpg",
    avantFichier: "public/test-maison-pereira/avant/interieur-coin-radiateur.jpg",
    projectionSrc: "/test-maison-pereira/galerie/apres-07.jpg",
    apresFichier: "public/test-maison-pereira/galerie/apres-07.jpg",
    portrait: true,
  },
  {
    id: "vue-08",
    index: 8,
    titre: "Baie encastrée — tableau existant",
    avantSrc: "/test-maison-pereira/galerie/avant-08.jpg",
    avantFichier: "public/test-maison-pereira/avant/interieur-baie-encastree.jpg",
    projectionSrc: "/test-maison-pereira/galerie/apres-08.jpg",
    apresFichier: "public/test-maison-pereira/galerie/apres-08.jpg",
    portrait: true,
  },
];

export const PEREIRA_PHOTOS_AVANT = PEREIRA_PAIRES_ITI.map((paire) => ({
  id: paire.id,
  src: paire.avantSrc,
  titre: paire.titre,
  source: "Photo réelle fournie pour le dossier AUDIT-PEREIRA-2026-001. Murs existants sans isolation intérieure.",
}));

export const PEREIRA_RESUME_ITI =
  "Galerie de 8 vues du logement. À gauche : photo réelle. À droite : projection visuelle indicative de la même pièce après doublage ITI 12 cm (murs régularisés, tableaux adaptés, finition plâtre / peinture neutre). Ces projections ne sont pas des photos réelles après travaux et ne figurent pas au devis contractuel.";

export const PEREIRA_LIMITE_ITI =
  "Aucune température, aucun pourcentage de confort et aucune économie financière ne sont simulés ici. Les consommations et classes DPE restent celles de l’audit joint (320 kWhEP/m².an en état initial ; 73 kWhEP/m².an après scénarios 1 et 2 de l’auditeur).";
