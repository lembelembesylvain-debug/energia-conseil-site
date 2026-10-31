/**
 * Liaison dossiers clients → paires photo réelle / projection WOW IA.
 * Les visuels « après » sont des simulations illustratives, jamais des photos après travaux.
 */

import { BRUNEL_DOSSIER_ID } from "./brunelWorkingBase.js";

export const MENTION_PROJECTION_WOW =
  "Image simulée — projection visuelle indicative (ITE / ravalement, toiture, solaire). Ne constitue pas une photo réelle après travaux, une mesure thermographique ni un engagement de résultat.";

export const LABEL_AVANT_WOW = "Avant — photo réelle";
export const LABEL_APRES_WOW = "Après — projection WOW IA";

const PEREIRA_VUES = [
  {
    id: "facade-porche",
    titre: "Façade porche — ITE, menuiseries, toiture",
    avantSrc: "/test-maison-pereira/avant/facade-porche.png",
    apresSrc: "/test-maison-pereira/projections/projection-menuiserie-alu-facade-porche.jpg",
    portrait: true,
  },
  {
    id: "facade-angle",
    titre: "Façade d’angle — ravalement et ouvertures",
    avantSrc: "/test-maison-pereira/avant/facade-angle.png",
    apresSrc: "/test-maison-pereira/projections/projection-menuiserie-alu-porte-entree-facade.jpg",
    portrait: false,
  },
  {
    id: "toiture-pv",
    titre: "Potentiel solaire intégré (vue illustrative)",
    avantSrc: "/test-maison-pereira/galerie/avant-menuiserie-05.jpg",
    apresSrc: "/test-maison-pereira/galerie/apres-menuiserie-05.jpg",
    portrait: true,
  },
];

const BRUNEL_VUES = [
  {
    id: "facade-placeholder",
    titre: "Façade — photo à déposer (base de travail Bussières)",
    avantSrc: "",
    apresSrc: "",
    portrait: false,
    placeholder: true,
  },
];

export const PROJECTIONS_WOW_PAR_DOSSIER = {
  "demo-pereira": {
    dossierId: "demo-pereira",
    nom: "Pereira — Nervieux (42)",
    vues: PEREIRA_VUES,
  },
  "projet-manuel-pereira-nervieux": {
    dossierId: "projet-manuel-pereira-nervieux",
    nom: "David Emmanuel PEREIRA — Nervieux (42)",
    vues: PEREIRA_VUES,
  },
  [BRUNEL_DOSSIER_ID]: {
    dossierId: BRUNEL_DOSSIER_ID,
    nom: "Brunel — Bussières (42)",
    vues: BRUNEL_VUES,
  },
};

export function projectionWowPourDossier(dossierId, dossier) {
  const id = String(dossierId || dossier?.id || "").trim();
  if (PROJECTIONS_WOW_PAR_DOSSIER[id]) return PROJECTIONS_WOW_PAR_DOSSIER[id];
  const nom = String(dossier?.nom || "Dossier").trim();
  return {
    dossierId: id || "dossier",
    nom,
    vues: [
      {
        id: "facade-generique",
        titre: "Façade — projection illustrative",
        avantSrc: "",
        apresSrc: "",
        portrait: false,
        placeholder: true,
      },
    ],
  };
}
