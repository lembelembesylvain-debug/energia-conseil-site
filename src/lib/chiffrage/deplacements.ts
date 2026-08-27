/**
 * Modèle mixte de déplacements — ENERGIA CONSEIL IA®, contractant général.
 *
 * Deux origines distinctes, jamais mélangées :
 * 1. Artisan : adresse de l’entreprise → adresse du chantier client.
 * 2. ENERGIA : base opérationnelle ENERGIA → adresse du chantier.
 *
 * Aucune distance ni coût kilométrique n’est inventé. Sans calcul
 * cartographique, la source est « saisie manuelle » et le résultat
 * n’est pas présenté comme définitif.
 *
 * Double comptage interdit : si le devis artisan indique « déplacement
 * compris », les frais estimés restent affichés mais ne sont pas ajoutés
 * au coût interne.
 */

import {
  ADRESSE_BASE_ENERGIA_DEFAUT,
  LIBELLE_DEPLACEMENTS_ENERGIA,
  PARAMETRES_DEPLACEMENT_DEFAUT,
  TYPES_VISITE_ENERGIA,
} from "./constantes";
import type {
  AvertissementChiffrage,
  DeplacementArtisanCalcule,
  DeplacementArtisanSaisie,
  DeplacementEnergiaCalcule,
  DeplacementEnergiaSaisie,
  DeplacementsSaisie,
  ParametresChiffrage,
  ParametresDeplacement,
  ResultatDeplacements,
  SourceDistance,
  VisiteEnergiaSaisie,
} from "./types";

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function creerIdArtisan(): string {
  return `artisan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function visitesEnergiaParDefaut(): VisiteEnergiaSaisie[] {
  return TYPES_VISITE_ENERGIA.map((type) => ({
    id: type.value,
    libelle: type.libelle,
    nombre: 0,
    inclus: true,
  }));
}

export function creerArtisanVide(
  parametres: ParametresDeplacement = PARAMETRES_DEPLACEMENT_DEFAUT,
): DeplacementArtisanSaisie {
  return {
    id: creerIdArtisan(),
    nomArtisan: "",
    adresseDepart: "",
    distanceAllerRetourKm: null,
    sourceDistance: "saisie_manuelle",
    nombreDeplacements: 0,
    coutKilometriqueHt: parametres.coutKilometriqueArtisanHt,
    coutPeageHt: parametres.coutPeageHt,
    coutStationnementHt: parametres.coutStationnementHt,
    tempsTrajetHeures: null,
    fraisFacturesArtisanHt: 0,
    deplacementDejaInclusDansDevis: false,
    sourceCout: "hypothese_provisoire",
    dateVerification: null,
    commentaire: "",
  };
}

export function creerDeplacementEnergia(
  adresseDepart = ADRESSE_BASE_ENERGIA_DEFAUT,
  parametres: ParametresDeplacement = PARAMETRES_DEPLACEMENT_DEFAUT,
): DeplacementEnergiaSaisie {
  return {
    adresseDepart,
    distanceAllerRetourKm: null,
    sourceDistance: "saisie_manuelle",
    visites: visitesEnergiaParDefaut(),
    coutKilometriqueHt: parametres.coutKilometriqueEnergiaHt,
    coutPeageHt: parametres.coutPeageHt,
    coutStationnementHt: parametres.coutStationnementHt,
    tempsTrajetHeures: null,
    sourceCout: "hypothese_provisoire",
    dateVerification: null,
    commentaire: "",
  };
}

export function creerDeplacementsInitiaux(
  parametres: ParametresChiffrage,
): DeplacementsSaisie {
  return {
    artisans: [],
    energia: creerDeplacementEnergia(
      parametres.adresseDepartEnergia,
      parametres.deplacement,
    ),
  };
}

export function normaliserParametresDeplacement(
  brut: Partial<ParametresDeplacement> | undefined,
): ParametresDeplacement {
  return {
    ...PARAMETRES_DEPLACEMENT_DEFAUT,
    ...(brut ?? {}),
    coutPeageHt: Math.max(0, brut?.coutPeageHt ?? 0),
    coutStationnementHt: Math.max(0, brut?.coutStationnementHt ?? 0),
  };
}

export function normaliserDeplacements(
  brut: Partial<DeplacementsSaisie> | undefined,
  parametres: ParametresChiffrage,
): DeplacementsSaisie {
  const fallback = creerDeplacementsInitiaux(parametres);
  if (!brut) return fallback;
  return {
    artisans: Array.isArray(brut.artisans) ? brut.artisans : [],
    energia: {
      ...fallback.energia,
      ...(brut.energia ?? {}),
      adresseDepart:
        brut.energia?.adresseDepart || parametres.adresseDepartEnergia,
      visites:
        brut.energia?.visites?.length === TYPES_VISITE_ENERGIA.length
          ? brut.energia.visites
          : fusionnerVisites(brut.energia?.visites, fallback.energia.visites),
    },
  };
}

function fusionnerVisites(
  saisies: VisiteEnergiaSaisie[] | undefined,
  defaut: VisiteEnergiaSaisie[],
): VisiteEnergiaSaisie[] {
  const parId = new Map((saisies ?? []).map((visite) => [visite.id, visite]));
  return defaut.map((visite) => parId.get(visite.id) ?? visite);
}

export function calculerDistanceTotaleKm(
  distanceAllerRetourKm: number | null,
  nombreDeplacements: number,
): number | null {
  if (distanceAllerRetourKm == null || !Number.isFinite(distanceAllerRetourKm)) {
    return null;
  }
  if (!Number.isFinite(nombreDeplacements) || distanceAllerRetourKm < 0 || nombreDeplacements < 0) {
    return null;
  }
  return round2(distanceAllerRetourKm * nombreDeplacements);
}

function nombrePositif(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value) || value < 0) return 0;
  return value;
}

export function calculerFraisKmHt(
  distanceTotaleKm: number | null,
  coutKilometriqueHt: number | null,
): number | null {
  if (distanceTotaleKm == null || coutKilometriqueHt == null) return null;
  if (distanceTotaleKm < 0 || coutKilometriqueHt < 0) return null;
  return round2(distanceTotaleKm * coutKilometriqueHt);
}

export function calculerFraisTempsHt(
  tempsTrajetHeures: number | null,
  nombreDeplacements: number,
  coutHoraireHt: number | null,
): number | null {
  if (tempsTrajetHeures == null || coutHoraireHt == null) return null;
  if (tempsTrajetHeures < 0 || coutHoraireHt < 0 || nombreDeplacements < 0) return null;
  return round2(tempsTrajetHeures * nombreDeplacements * coutHoraireHt);
}

function assemblerFraisHt(parts: {
  fraisKmHt: number | null;
  fraisTempsHt: number | null;
  coutPeageHt: number;
  coutStationnementHt: number;
  fraisFacturesArtisanHt?: number;
}): number {
  return round2(
    nombrePositif(parts.fraisKmHt) +
      nombrePositif(parts.fraisTempsHt) +
      nombrePositif(parts.coutPeageHt) +
      nombrePositif(parts.coutStationnementHt) +
      nombrePositif(parts.fraisFacturesArtisanHt),
  );
}

function estimationComplete(params: {
  nombre: number;
  distanceAllerRetourKm: number | null;
  coutKilometriqueHt: number | null;
  sourceDistance: SourceDistance;
}): boolean {
  if (params.nombre <= 0) return true;
  if (params.distanceAllerRetourKm == null) return false;
  if (params.coutKilometriqueHt == null && params.distanceAllerRetourKm > 0) return false;
  if (params.sourceDistance !== "calcul_cartographique") return false;
  return true;
}

export function nombreVisitesEnergia(energia: DeplacementEnergiaSaisie): number {
  return energia.visites.reduce((acc, visite) => {
    if (!visite.inclus) return acc;
    return acc + Math.max(0, visite.nombre || 0);
  }, 0);
}

export function calculerDeplacementArtisan(
  artisan: DeplacementArtisanSaisie,
  adresseChantier: string,
  coutHoraireHt: number | null,
): DeplacementArtisanCalcule {
  const distanceTotaleKm = calculerDistanceTotaleKm(
    artisan.distanceAllerRetourKm,
    artisan.nombreDeplacements,
  );
  const fraisKmHt = calculerFraisKmHt(distanceTotaleKm, artisan.coutKilometriqueHt);
  const fraisTempsHt = calculerFraisTempsHt(
    artisan.tempsTrajetHeures,
    artisan.nombreDeplacements,
    coutHoraireHt,
  );
  const fraisEstimesHt =
    artisan.nombreDeplacements > 0 ||
    artisan.fraisFacturesArtisanHt > 0 ||
    artisan.coutPeageHt > 0 ||
    artisan.coutStationnementHt > 0
      ? assemblerFraisHt({
          fraisKmHt,
          fraisTempsHt,
          coutPeageHt: artisan.coutPeageHt,
          coutStationnementHt: artisan.coutStationnementHt,
          fraisFacturesArtisanHt: artisan.fraisFacturesArtisanHt,
        })
      : 0;
  const inclus = artisan.deplacementDejaInclusDansDevis;
  return {
    ...artisan,
    adresseChantier,
    distanceTotaleKm,
    fraisKmHt,
    fraisTempsHt,
    fraisEstimesHt,
    fraisAjoutesHt: inclus ? 0 : fraisEstimesHt,
    estimationComplete: estimationComplete({
      nombre: artisan.nombreDeplacements,
      distanceAllerRetourKm: artisan.distanceAllerRetourKm,
      coutKilometriqueHt: artisan.coutKilometriqueHt,
      sourceDistance: artisan.sourceDistance,
    }),
    statutFacturation: inclus ? "inclus_dans_devis" : "ajoute_separement",
  };
}

export function calculerDeplacementEnergia(
  energia: DeplacementEnergiaSaisie,
  adresseChantier: string,
  coutHoraireHt: number | null,
): DeplacementEnergiaCalcule {
  const nombreVisites = nombreVisitesEnergia(energia);
  const distanceTotaleKm = calculerDistanceTotaleKm(
    energia.distanceAllerRetourKm,
    nombreVisites,
  );
  const fraisKmHt = calculerFraisKmHt(distanceTotaleKm, energia.coutKilometriqueHt);
  const fraisTempsHt = calculerFraisTempsHt(
    energia.tempsTrajetHeures,
    nombreVisites,
    coutHoraireHt,
  );
  const aDesFrais =
    nombreVisites > 0 || energia.coutPeageHt > 0 || energia.coutStationnementHt > 0;
  const fraisDeplacementHt = aDesFrais
    ? assemblerFraisHt({
        fraisKmHt,
        fraisTempsHt,
        coutPeageHt: energia.coutPeageHt,
        coutStationnementHt: energia.coutStationnementHt,
      })
    : 0;
  return {
    ...energia,
    libelle: LIBELLE_DEPLACEMENTS_ENERGIA,
    adresseChantier,
    nombreVisites,
    distanceTotaleKm,
    fraisKmHt,
    fraisTempsHt,
    fraisDeplacementHt,
    estimationComplete: estimationComplete({
      nombre: nombreVisites,
      distanceAllerRetourKm: energia.distanceAllerRetourKm,
      coutKilometriqueHt: energia.coutKilometriqueHt,
      sourceDistance: energia.sourceDistance,
    }),
  };
}

export function calculerDeplacements(
  saisie: DeplacementsSaisie,
  parametres: ParametresChiffrage,
): ResultatDeplacements {
  const horaire = parametres.deplacement.coutHoraireTempsDeplacementHt;
  const artisans = saisie.artisans.map((artisan) =>
    calculerDeplacementArtisan(
      {
        ...artisan,
        coutKilometriqueHt:
          artisan.coutKilometriqueHt ?? parametres.deplacement.coutKilometriqueArtisanHt,
      },
      parametres.adresseChantier,
      horaire,
    ),
  );
  const energia = calculerDeplacementEnergia(
    {
      ...saisie.energia,
      adresseDepart: saisie.energia.adresseDepart || parametres.adresseDepartEnergia,
      coutKilometriqueHt:
        saisie.energia.coutKilometriqueHt ?? parametres.deplacement.coutKilometriqueEnergiaHt,
    },
    parametres.adresseChantier,
    horaire,
  );
  const totalArtisansEstimesHt = round2(
    artisans.reduce((acc, artisan) => acc + (artisan.fraisEstimesHt ?? 0), 0),
  );
  const totalArtisansAjoutesHt = round2(
    artisans.reduce((acc, artisan) => acc + artisan.fraisAjoutesHt, 0),
  );
  const totalEnergiaHt = energia.fraisDeplacementHt ?? 0;
  const definitif =
    artisans.every((artisan) => artisan.estimationComplete) && energia.estimationComplete;

  return {
    artisans,
    energia,
    totalArtisansEstimesHt,
    totalArtisansAjoutesHt,
    totalEnergiaHt,
    totalAjoutesHt: round2(totalArtisansAjoutesHt + totalEnergiaHt),
    definitif,
  };
}

export function construireAvertissementsDeplacement(
  resultat: ResultatDeplacements,
  parametres: ParametresChiffrage,
): AvertissementChiffrage[] {
  const avis: AvertissementChiffrage[] = [];
  const artisansActifs = resultat.artisans.filter(
    (artisan) => artisan.nombreDeplacements > 0 || artisan.fraisFacturesArtisanHt > 0,
  );

  if (!parametres.adresseChantier.trim() && (artisansActifs.length > 0 || resultat.energia.nombreVisites > 0)) {
    avis.push({
      id: "adresse-chantier-manquante",
      niveau: "warning",
      message:
        "Adresse du chantier non renseignée. Les frais de déplacement restent indicatifs tant que l’adresse n’est pas saisie.",
    });
  }

  const distanceInconnue = [
    ...artisansActifs.filter((artisan) => artisan.distanceAllerRetourKm == null),
    resultat.energia.nombreVisites > 0 && resultat.energia.distanceAllerRetourKm == null
      ? resultat.energia
      : null,
  ].filter(Boolean);
  if (distanceInconnue.length > 0) {
    avis.push({
      id: "distance-inconnue",
      niveau: "warning",
      message:
        "Distance inconnue : aucun calcul cartographique n’est disponible. Saisissez manuellement les kilomètres aller-retour. Le résultat n’est pas définitif.",
    });
  }

  const saisieManuelle = [
    ...artisansActifs.filter((artisan) => artisan.sourceDistance === "saisie_manuelle"),
    resultat.energia.nombreVisites > 0 && resultat.energia.sourceDistance === "saisie_manuelle"
      ? resultat.energia
      : null,
  ].filter(Boolean);
  if (saisieManuelle.length > 0) {
    avis.push({
      id: "distance-saisie-manuelle",
      niveau: "warning",
      message:
        "Distance identifiée comme « saisie manuelle ». Les frais de déplacement sont indicatifs et ne sont pas présentés comme définitifs.",
    });
  }

  const kmManquantArtisan = artisansActifs.some(
    (artisan) =>
      !artisan.deplacementDejaInclusDansDevis &&
      artisan.distanceAllerRetourKm != null &&
      artisan.distanceAllerRetourKm > 0 &&
      artisan.coutKilometriqueHt == null,
  );
  const kmManquantEnergia =
    resultat.energia.nombreVisites > 0 &&
    resultat.energia.distanceAllerRetourKm != null &&
    resultat.energia.distanceAllerRetourKm > 0 &&
    resultat.energia.coutKilometriqueHt == null;
  if (kmManquantArtisan || kmManquantEnergia) {
    avis.push({
      id: "cout-kilometrique-manquant",
      niveau: "warning",
      message:
        "Coût kilométrique non renseigné dans les paramètres du module. Aucune valeur n’est inventée (pas de 0,60 €/km implicite). Saisissez le barème interne ENERGIA et/ou artisan.",
    });
  }

  const artisansSansAdresse = artisansActifs.filter((artisan) => !artisan.adresseDepart.trim());
  if (artisansSansAdresse.length > 0) {
    avis.push({
      id: "adresse-artisan-manquante",
      niveau: "warning",
      message:
        "Au moins un artisan n’a pas d’adresse de départ. Les déplacements artisans se calculent depuis l’adresse de l’entreprise, jamais depuis Lyon par défaut.",
    });
  }

  const inclus = resultat.artisans.filter((artisan) => artisan.deplacementDejaInclusDansDevis);
  if (inclus.length > 0) {
    avis.push({
      id: "deplacement-deja-inclus",
      niveau: "info",
      message: `${inclus.length} entreprise(s) : déplacements déjà inclus dans le devis — non ajoutés une seconde fois au coût interne.`,
    });
  }

  return avis;
}
