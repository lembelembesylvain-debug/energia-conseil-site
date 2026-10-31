import { MENTIONS_ETUDE, panneauDepuisEtat } from "./catalogue";
import { calculerDevis } from "./devis";
import { evaluerElectrique } from "./electrical";
import { genererCalpinage, toitureDepuis } from "./layout";
import { calculerProduction } from "./production";
import type { EtatCalpinage, EtudeTechnique } from "./types";

const MENTIONS_TERTIAIRE = [
  "Segment tertiaire : Tarif Jaune ou Vert et injection S21 sont des hypothèses de travail, à confirmer au trimestre de raccordement. Estimation à titre indicatif.",
  "L'aide ADVENIR est une estimation indicative, plafonnée à 50 % du lot bornes, déduite de ce seul lot. Elle ne vaut pas accord Avere. Aucune aide photovoltaïque n'est déduite.",
  "Amortissement linéaire 20 ans et économie d'impôt à 25 %, entreprise à l'impôt sur les sociétés. TVA 20 % considérée comme récupérable, hors retour sur investissement. Hors IFER et CFE.",
];

export function construireEtude(etat: EtatCalpinage, dossierId: string | null): EtudeTechnique {
  const toiture = toitureDepuis(
    etat.largeurM,
    etat.rampantM,
    etat.inclinaisonDeg,
    etat.azimutDeg,
    etat.typeCouverture,
    etat.segment,
  );
  const panneau = panneauDepuisEtat(etat);
  const modulesMax =
    etat.segment === "tertiaire" && etat.kwcCible
      ? Math.round((etat.kwcCible * 1000) / Math.max(1, panneau.wc))
      : undefined;
  const cellules = genererCalpinage(toiture, etat.orientation, panneau, etat.obstacles, etat.desactives, { modulesMax });
  const modulesActifs = cellules.filter((cellule) => cellule.actif).length;
  const kwc = (modulesActifs * Math.max(0, panneau.wc)) / 1000;
  const electrique = evaluerElectrique({
    architecture: etat.architecture,
    panneau,
    modulesActifs,
    kwc,
    repartition: etat.segment === "tertiaire" ? "auto" : etat.repartition,
    comptes: etat.comptes,
    secours: etat.secours,
    microId: etat.microId,
    marqueCentrale: etat.marqueCentrale,
    modeleCentralId: etat.modeleCentralId,
    unitesPowerwall: etat.unitesPowerwall,
    marqueCascade: etat.marqueCascade,
    modeleCascadeId: etat.modeleCascadeId,
    segment: etat.segment,
  });
  const production = calculerProduction({
    kwc,
    inclinaisonDeg: toiture.inclinaisonDeg,
    azimutDeg: toiture.azimutDeg,
    productible: etat.productible,
    consommationKwh: etat.consoKwh,
    prixKwh: etat.prixKwh,
    tarifInjection: etat.tarifInjection,
    architecture: etat.architecture,
    investissementSaisi: etat.investissementSaisi,
    tertiaire:
      etat.segment === "tertiaire"
        ? {
            actif: true,
            tarifPro: etat.tarifPro,
            prixManuel: etat.prixManuel,
            injectionManuelle: etat.injectionManuelle,
            nbBornes: etat.nbBornes,
            irveActive: etat.irveActive,
            batterieKwh: etat.architecture === "cascade" ? etat.batterieCiKwh : 0,
            unitesPowerwall: etat.unitesPowerwall,
          }
        : null,
  });
  const devis = calculerDevis({
    clientNom: etat.clientNom,
    dossierId,
    segment: etat.segment,
    typeCouverture: etat.typeCouverture,
    kwc,
    modulesActifs,
    architecture: etat.architecture,
    unitesPowerwall: etat.unitesPowerwall,
    irveActive: etat.irveActive,
    nbBornes: etat.nbBornes,
    batterieCiKwh: etat.batterieCiKwh,
    electrique,
  });

  return {
    version: 1,
    genereLe: new Date().toISOString(),
    clientNom: etat.clientNom.trim(),
    dossierId,
    departement: etat.departement,
    toiture,
    obstacles: etat.obstacles,
    orientation: etat.orientation,
    panneau,
    cellules,
    modulesActifs,
    kwc,
    electrique,
    production,
    devis,
    mentions: etat.segment === "tertiaire" ? [...MENTIONS_ETUDE, ...MENTIONS_TERTIAIRE] : [...MENTIONS_ETUDE],
  };
}
