/**
 * Moteur de chiffrage rénovation d’ampleur — ENERGIA CONSEIL IA®.
 *
 * Construction du coût interne :
 *   coûts entrants des artisans
 *   + déplacements artisans non inclus
 *   + fournitures complémentaires
 *   + aléas techniques
 *   + déplacements ENERGIA
 *   + frais administratifs / structure
 *   + pilotage et coordination
 *
 * Formule de marge (taux t sur le prix de vente HT) :
 *   prix_sortant_HT = coût_interne / (1 - t)
 *
 * Exemples : 10 % → / 0,90 ; 12 % → / 0,88 ; 15 % → / 0,85.
 * Ne jamais appliquer une majoration simple (× 1,10) pour une marge de 10 %.
 */

import { CATALOGUE_POSTES } from "./catalogue-postes";
import {
  DUREE_VALIDITE_TARIF_MOIS,
  SOURCES_PRIX,
  parametresParDefaut,
} from "./constantes";
import {
  calculerDeplacements,
  construireAvertissementsDeplacement,
  creerDeplacementsInitiaux,
  normaliserDeplacements,
} from "./deplacements";
import { construireDevisClient } from "./devis-client";
import tarifsFournisseurs from "./tarifs-fournisseurs.2026.json";
import type {
  AideEstimative,
  AvertissementChiffrage,
  DeplacementsSaisie,
  NiveauScenario,
  ParametresChiffrage,
  PosteCalcule,
  PosteCatalogue,
  PosteId,
  PosteSaisie,
  RecapAides,
  ResultatChiffrage,
  ResultatDeplacements,
  SourcePrix,
  TotauxChiffrage,
} from "./types";
import { SCENARIOS_AMPLEUR } from "./scenarios";

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Prix de vente HT pour obtenir exactement `tauxMarge` du CA HT. */
export function prixSortantDepuisCoutInterne(
  coutInterne: number,
  tauxMarge: number,
): number {
  if (coutInterne < 0) {
    throw new Error("Le coût interne ne peut pas être négatif.");
  }
  if (tauxMarge < 0 || tauxMarge >= 1) {
    throw new Error("Le taux de marge doit être compris dans [0 ; 1[.");
  }
  return round2(coutInterne / (1 - tauxMarge));
}

export function coutEntrantTotal(
  quantite: number,
  puHt: number | null,
): number | null {
  if (puHt == null || !Number.isFinite(puHt) || !Number.isFinite(quantite)) {
    return null;
  }
  if (quantite < 0 || puHt < 0) return null;
  return round2(quantite * puHt);
}

export function isSourceVerifiee(source: SourcePrix): boolean {
  return SOURCES_PRIX.find((item) => item.value === source)?.verifie === true;
}

export function isDateObsolete(
  dateVerification: string | null,
  au: Date = new Date(),
): boolean {
  if (!dateVerification) return false;
  const parsed = new Date(`${dateVerification}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  const limite = new Date(au);
  limite.setMonth(limite.getMonth() - DUREE_VALIDITE_TARIF_MOIS);
  return parsed < limite;
}

type TarifJson = {
  coutEntrantUnitaireHt: number | null;
  sourcePrix: SourcePrix;
  dateVerification: string | null;
  commentaire: string;
};

function tarifDuPoste(id: PosteId): TarifJson {
  const postes = tarifsFournisseurs.postes as Record<string, TarifJson>;
  const tarif = postes[id];
  return (
    tarif ?? {
      coutEntrantUnitaireHt: null,
      sourcePrix: "hypothese_provisoire",
      dateVerification: null,
      commentaire: "À renseigner depuis le tarif / devis 2026.",
    }
  );
}

export function quantiteParDefaut(unite: PosteCatalogue["unite"]): number {
  return unite === "forfait" ? 1 : 0;
}

export function creerLigneDepuisCatalogue(
  poste: PosteCatalogue,
  parametres: ParametresChiffrage,
  inclus: boolean,
): PosteSaisie {
  const tarif = tarifDuPoste(poste.id);
  return {
    id: poste.id,
    inclus,
    nom: poste.nom,
    unite: poste.unite,
    quantite: quantiteParDefaut(poste.unite),
    coutEntrantUnitaireHt: tarif.coutEntrantUnitaireHt,
    tauxAleas: poste.appliqueAleas ? parametres.tauxAleas : 0,
    tauxPilotage: poste.appliquePilotage ? parametres.tauxPilotage : 0,
    fraisComplementaires: 0,
    tauxMarge: parametres.tauxMarge,
    tauxTva: parametres.tauxTvaDefaut,
    sourcePrix: tarif.sourcePrix,
    dateVerification: tarif.dateVerification,
    commentaire: tarif.commentaire,
  };
}

export function creerGrilleInitiale(
  niveau: NiveauScenario = "performance",
  parametres: ParametresChiffrage = parametresParDefaut(),
): PosteSaisie[] {
  const inclusIds = new Set(SCENARIOS_AMPLEUR.find((s) => s.id === niveau)?.postesInclus ?? []);
  return CATALOGUE_POSTES.map((poste) =>
    creerLigneDepuisCatalogue(poste, parametres, inclusIds.has(poste.id)),
  );
}

export function appliquerParametresAuxLignes(
  lignes: PosteSaisie[],
  parametres: ParametresChiffrage,
): PosteSaisie[] {
  return lignes.map((ligne) => {
    const catalogue = CATALOGUE_POSTES.find((p) => p.id === ligne.id);
    return {
      ...ligne,
      tauxAleas: catalogue?.appliqueAleas ? parametres.tauxAleas : 0,
      tauxPilotage: catalogue?.appliquePilotage ? parametres.tauxPilotage : 0,
      tauxMarge: parametres.tauxMarge,
      tauxTva: parametres.tauxTvaDefaut,
    };
  });
}

export function appliquerScenario(
  lignes: PosteSaisie[],
  niveau: NiveauScenario,
): PosteSaisie[] {
  const inclusIds = new Set(SCENARIOS_AMPLEUR.find((s) => s.id === niveau)?.postesInclus ?? []);
  return lignes.map((ligne) => ({
    ...ligne,
    inclus: inclusIds.has(ligne.id),
  }));
}

export function calculerLigne(ligne: PosteSaisie): PosteCalcule {
  const dateObsolete = isDateObsolete(ligne.dateVerification);
  const entrant = ligne.inclus
    ? coutEntrantTotal(ligne.quantite, ligne.coutEntrantUnitaireHt)
    : null;
  const prixRenseigne = ligne.inclus && entrant != null && ligne.quantite > 0;

  if (!ligne.inclus || !prixRenseigne || entrant == null) {
    return {
      ...ligne,
      coutEntrantTotalHt: ligne.inclus ? entrant : null,
      montantAleas: null,
      montantPilotage: null,
      coutInterne: null,
      montantMarge: null,
      prixSortantHt: null,
      montantTva: null,
      prixSortantTtc: null,
      prixRenseigne: false,
      dateObsolete: ligne.inclus && dateObsolete && Boolean(ligne.dateVerification),
    };
  }

  const montantAleas = round2(entrant * ligne.tauxAleas);
  const montantPilotage = round2(entrant * ligne.tauxPilotage);
  const coutInterne = round2(
    entrant + montantAleas + montantPilotage + ligne.fraisComplementaires,
  );
  const prixSortantHt = prixSortantDepuisCoutInterne(coutInterne, ligne.tauxMarge);
  const montantMarge = round2(prixSortantHt - coutInterne);
  const montantTva = round2(prixSortantHt * ligne.tauxTva);
  const prixSortantTtc = round2(prixSortantHt + montantTva);

  return {
    ...ligne,
    coutEntrantTotalHt: entrant,
    montantAleas,
    montantPilotage,
    coutInterne,
    montantMarge,
    prixSortantHt,
    montantTva,
    prixSortantTtc,
    prixRenseigne: true,
    dateObsolete,
  };
}

function somme(lignes: PosteCalcule[], champ: keyof PosteCalcule): number {
  return round2(
    lignes.reduce((acc, ligne) => {
      const value = ligne[champ];
      return acc + (typeof value === "number" ? value : 0);
    }, 0),
  );
}

export function calculerTotaux(
  lignes: PosteCalcule[],
  fraisStructureHt: number,
  tauxMargeStructure: number,
  tauxTvaStructure: number,
  deplacements: ResultatDeplacements | null = null,
): TotauxChiffrage {
  const inclus = lignes.filter((l) => l.inclus);
  const renseignes = inclus.filter((l) => l.prixRenseigne);
  const verifiees = renseignes.filter(
    (l) => isSourceVerifiee(l.sourcePrix) && l.coutEntrantUnitaireHt != null,
  );

  const totalEntrantHt = somme(renseignes, "coutEntrantTotalHt");
  const totalAleas = somme(renseignes, "montantAleas");
  const totalPilotage = somme(renseignes, "montantPilotage");
  const totalFraisComplementaires = round2(
    renseignes.reduce((acc, l) => acc + l.fraisComplementaires, 0),
  );
  const totalFraisStructure = round2(Math.max(0, fraisStructureHt));
  const totalDeplacementsArtisansAjoutesHt = round2(
    deplacements?.totalArtisansAjoutesHt ?? 0,
  );
  const totalDeplacementsEnergiaHt = round2(deplacements?.totalEnergiaHt ?? 0);
  const totalDeplacementsAjoutesHt = round2(
    totalDeplacementsArtisansAjoutesHt + totalDeplacementsEnergiaHt,
  );

  const coutInterneLignes = somme(renseignes, "coutInterne");
  const totalCoutInterne = round2(
    coutInterneLignes + totalFraisStructure + totalDeplacementsAjoutesHt,
  );

  const htLignes = somme(renseignes, "prixSortantHt");
  const htStructure =
    totalFraisStructure > 0
      ? prixSortantDepuisCoutInterne(totalFraisStructure, tauxMargeStructure)
      : 0;
  const htDeplacements =
    totalDeplacementsAjoutesHt > 0
      ? prixSortantDepuisCoutInterne(totalDeplacementsAjoutesHt, tauxMargeStructure)
      : 0;
  const totalSortantHt = round2(htLignes + htStructure + htDeplacements);

  const tvaLignes = somme(renseignes, "montantTva");
  const tvaStructure = round2(htStructure * tauxTvaStructure);
  const tvaDeplacements = round2(htDeplacements * tauxTvaStructure);
  const totalTva = round2(tvaLignes + tvaStructure + tvaDeplacements);
  const totalSortantTtc = round2(totalSortantHt + totalTva);

  const totalMargeEuros = round2(totalSortantHt - totalCoutInterne);
  const tauxMargeReel =
    totalSortantHt > 0 ? round2((totalMargeEuros / totalSortantHt) * 100) / 100 : null;

  return {
    totalEntrantHt,
    totalDeplacementsArtisansAjoutesHt,
    totalDeplacementsEnergiaHt,
    totalDeplacementsAjoutesHt,
    totalAleas,
    totalPilotage,
    totalFraisComplementaires,
    totalFraisStructure,
    totalCoutInterne,
    totalMargeEuros,
    tauxMargeReel,
    totalSortantHt,
    totalTva,
    totalSortantTtc,
    nbPostesInclus: inclus.length,
    nbPostesPrixRenseignes: renseignes.length,
    nbPostesPrixManquants: inclus.filter((l) => !l.prixRenseigne).length,
    nbPostesVerifies: verifiees.length,
    budgetAffichable: verifiees.length > 0 && renseignes.length > 0,
    deplacementsDefinitifs: deplacements?.definitif ?? true,
  };
}

export function calculerRecapAides(
  aides: AideEstimative[],
  totalSortantTtc: number,
  hasPrixRenseignes: boolean,
): RecapAides {
  const totalEstimatif = round2(
    aides.reduce((acc, a) => acc + Math.max(0, a.montantEstimatif ?? 0), 0),
  );
  const totalRetenuSaisi = round2(
    aides.reduce((acc, a) => acc + Math.max(0, a.montantRetenu || 0), 0),
  );
  const coutTravaux = Math.max(0, totalSortantTtc);
  const depassement = hasPrixRenseignes && totalRetenuSaisi > coutTravaux;
  const totalRetenu = hasPrixRenseignes
    ? round2(Math.min(totalRetenuSaisi, coutTravaux))
    : totalRetenuSaisi;
  const resteAChargeEstimatif = hasPrixRenseignes
    ? round2(Math.max(0, coutTravaux - totalRetenu))
    : null;
  return {
    totalEstimatif,
    totalRetenuSaisi,
    totalRetenu,
    resteAChargeEstimatif,
    aidesSuperieuresAuxTravaux: depassement,
    plafondApplique: depassement,
  };
}

export function construireAvertissements(
  lignes: PosteCalcule[],
  totaux: TotauxChiffrage,
  recapAides: RecapAides,
  deplacements: ResultatDeplacements | null = null,
  parametres: ParametresChiffrage | null = null,
): AvertissementChiffrage[] {
  const avis: AvertissementChiffrage[] = [];

  if (totaux.nbPostesPrixManquants > 0) {
    avis.push({
      id: "prix-manquants",
      niveau: "warning",
      message: `${totaux.nbPostesPrixManquants} poste(s) inclus sans coût entrant. Aucun tarif fournisseur n’est inventé : saisissez un devis, un tarif vérifié, une estimation de marché ou une hypothèse provisoire.`,
    });
  }

  if (!totaux.budgetAffichable) {
    avis.push({
      id: "budget-non-affichable",
      niveau: "warning",
      message:
        "Aucun budget n’est affiché comme chiffrage de référence : il faut au moins un coût entrant issu d’un tarif fournisseur vérifié ou d’un devis sous-traitant.",
    });
  }

  const hypothese = lignes.filter(
    (l) =>
      l.inclus &&
      l.prixRenseigne &&
      (l.sourcePrix === "hypothese_provisoire" || l.sourcePrix === "estimation_marche"),
  );
  if (hypothese.length > 0) {
    avis.push({
      id: "sources-non-verifiees",
      niveau: "info",
      message: `${hypothese.length} poste(s) reposent sur une estimation de marché ou une hypothèse provisoire. Les montants restent indicatifs.`,
    });
  }

  const obsoletes = lignes.filter((l) => l.inclus && l.dateObsolete);
  if (obsoletes.length > 0) {
    avis.push({
      id: "tarifs-obsoletes",
      niveau: "warning",
      message: `${obsoletes.length} poste(s) n’ont pas été vérifiés depuis plus de ${DUREE_VALIDITE_TARIF_MOIS} mois. Actualiser le tarif fournisseur ou le devis avant engagement.`,
    });
  }

  if (recapAides.aidesSuperieuresAuxTravaux) {
    avis.push({
      id: "aides-superieures",
      niveau: "critique",
      message:
        `Les aides saisies (${recapAides.totalRetenuSaisi.toLocaleString("fr-FR", {
          style: "currency",
          currency: "EUR",
        })}) dépassent le coût des travaux. Le cumul retenu dans la simulation a été plafonné à 100 % du TTC. Les aides ne constituent pas une décision d’attribution.`,
    });
  }

  if (deplacements && parametres) {
    avis.push(...construireAvertissementsDeplacement(deplacements, parametres));
  }

  return avis;
}

export function calculerChiffrage(
  lignes: PosteSaisie[],
  parametres: ParametresChiffrage,
  aides: AideEstimative[],
  deplacementsSaisie?: DeplacementsSaisie | null,
): ResultatChiffrage {
  const calculees = lignes.map(calculerLigne);
  const deplacements = calculerDeplacements(
    normaliserDeplacements(
      deplacementsSaisie ?? creerDeplacementsInitiaux(parametres),
      parametres,
    ),
    parametres,
  );
  const totaux = calculerTotaux(
    calculees,
    parametres.fraisStructureHt,
    parametres.tauxMarge,
    parametres.tauxTvaDefaut,
    deplacements,
  );
  const recapAides = calculerRecapAides(
    aides,
    totaux.totalSortantTtc,
    totaux.nbPostesPrixRenseignes > 0,
  );
  const devisClient = construireDevisClient(
    calculees,
    deplacements,
    parametres,
    totaux.totalSortantHt,
    totaux.totalTva,
    totaux.totalSortantTtc,
  );
  return {
    parametres,
    lignes: calculees,
    totaux,
    aides,
    recapAides,
    deplacements,
    devisClient,
    avertissements: construireAvertissements(
      calculees,
      totaux,
      recapAides,
      deplacements,
      parametres,
    ),
  };
}
