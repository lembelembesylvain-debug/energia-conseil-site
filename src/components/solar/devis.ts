import { primeAutoconsoTotale } from "../../lib/calculators/photovoltaique-2026";
import {
  BPU_2026,
  PLAFOND_ADVENIR_PAR_BORNE,
  PRIX_BATTERIE_CI_HT_KWH,
  TAUX_ADVENIR,
  prixOnduleurChaineHt,
} from "./catalogue";
import type {
  AideDevis,
  ArchitectureId,
  BilanElectrique,
  DevisContractant,
  LigneDevis,
  SegmentProjet,
  TypeCouverture,
} from "./types";

function argent(valeur: number): number {
  return Math.round(valeur);
}

function ajouter(
  lignes: LigneDevis[],
  ligne: {
    id: string;
    famille: LigneDevis["famille"];
    designation: string;
    quantite: number;
    unite: string;
    puHt: number;
    coutUnitaireHt: number;
    margeConnue: boolean;
  },
) {
  if (!(ligne.quantite > 0) || !(ligne.puHt > 0)) return;
  const quantite = Math.round(ligne.quantite * 100) / 100;
  const puHt = argent(ligne.puHt);
  const totalHt = argent(quantite * puHt);
  lignes.push({
    id: ligne.id,
    famille: ligne.famille,
    designation: ligne.designation,
    quantite,
    unite: ligne.unite,
    puHt,
    totalHt,
    coutHt: argent(quantite * ligne.coutUnitaireHt),
    margeConnue: ligne.margeConnue,
  });
}

function somme(lignes: LigneDevis[], famille: LigneDevis["famille"]): number {
  return argent(lignes.filter((ligne) => ligne.famille === famille).reduce((total, ligne) => total + ligne.totalHt, 0));
}

export function calculerDevis(input: {
  clientNom: string;
  dossierId: string | null;
  segment: SegmentProjet;
  typeCouverture: TypeCouverture;
  kwc: number;
  modulesActifs: number;
  architecture: ArchitectureId;
  unitesPowerwall: number;
  irveActive: boolean;
  nbBornes: number;
  batterieCiKwh: number;
  electrique: BilanElectrique;
}): DevisContractant {
  const lignes: LigneDevis[] = [];
  const tertiaire = input.segment === "tertiaire";
  const tauxTva = !tertiaire && input.kwc <= 3 ? 0.1 : 0.2;
  const modules = Math.max(0, input.modulesActifs);
  const kwc = Math.max(0, input.kwc);

  if (modules > 0) {
    ajouter(lignes, {
      id: "modules",
      famille: "fourniture",
      designation: "Modules photovoltaïques bi-verre TOPCon 450-500 Wc",
      quantite: modules,
      unite: "module",
      puHt: BPU_2026.moduleVenteHt,
      coutUnitaireHt: BPU_2026.moduleAchatHt,
      margeConnue: true,
    });
    const fixation = BPU_2026.fixationHt[input.typeCouverture];
    const libelleFixation =
      input.typeCouverture === "bac-acier"
        ? "Fixation bac acier"
        : input.typeCouverture === "terrasse"
          ? "Fixation toiture terrasse lestée"
          : input.typeCouverture === "ombriere"
            ? "Ombrière de parking — charpente métallique et intégration"
            : "Fixation surimposition tuiles (K2 / Esdec)";
    ajouter(lignes, {
      id: "fixation",
      famille: "fourniture",
      designation: libelleFixation,
      quantite: modules,
      unite: "module",
      puHt: fixation,
      coutUnitaireHt: fixation,
      margeConnue: false,
    });
  }

  const coffrets = tertiaire ? Math.max(1, Math.ceil(kwc / BPU_2026.coffretTrancheKwc)) : 1;
  if (kwc > 0) {
    ajouter(lignes, {
      id: "coffret",
      famille: "fourniture",
      designation: tertiaire
        ? "Coffret AC/DC tertiaire, parafoudre T2 et coupure d'urgence"
        : "Coffret AC/DC résidentiel, parafoudre T2 et coupure d'urgence",
      quantite: coffrets,
      unite: "u",
      puHt: tertiaire ? BPU_2026.coffretHt.tertiaire : BPU_2026.coffretHt.residentiel,
      coutUnitaireHt: tertiaire ? BPU_2026.coffretHt.tertiaire : BPU_2026.coffretHt.residentiel,
      margeConnue: false,
    });
    const plancher = tertiaire ? BPU_2026.cablePlancherHt.tertiaire : BPU_2026.cablePlancherHt.residentiel;
    const eurKwc = tertiaire ? BPU_2026.cableEurKwc.tertiaire : BPU_2026.cableEurKwc.residentiel;
    const cable = Math.max(plancher, argent(kwc * eurKwc));
    ajouter(lignes, {
      id: "cable",
      famille: "fourniture",
      designation: tertiaire
        ? "Câblage solaire 10 mm² résistant UV, liaisons et terre"
        : "Câblage solaire 6 mm² résistant UV, liaisons et terre",
      quantite: 1,
      unite: "forfait",
      puHt: cable,
      coutUnitaireHt: cable,
      margeConnue: false,
    });
    ajouter(lignes, {
      id: "consuel",
      famille: "fourniture",
      designation: "Passage Consuel",
      quantite: 1,
      unite: "u",
      puHt: BPU_2026.consuelHt,
      coutUnitaireHt: BPU_2026.consuelHt,
      margeConnue: false,
    });
  }

  if (input.architecture === "tesla-pw3" && kwc > 0) {
    const unites = tertiaire ? Math.min(4, Math.max(1, Math.round(input.unitesPowerwall || 1))) : 1;
    const venteHt = argent(BPU_2026.powerwallPoseTtc / (1 + tauxTva));
    ajouter(lignes, {
      id: "powerwall",
      famille: "fourniture",
      designation: "Tesla Powerwall 3, 13,5 kWh / 11,5 kW, avec Backup Gateway, posée",
      quantite: unites,
      unite: "u",
      puHt: venteHt,
      coutUnitaireHt: BPU_2026.powerwallAchatHt,
      margeConnue: true,
    });
  }

  if (input.electrique.cascade && input.electrique.cascade.nombre > 0) {
    const kwUnitaire = input.electrique.cascade.kwAcTotal / input.electrique.cascade.nombre;
    const prix = prixOnduleurChaineHt(kwUnitaire);
    ajouter(lignes, {
      id: "onduleurs",
      famille: "fourniture",
      designation: prix.officiel
        ? input.electrique.cascade.nom
        : `${input.electrique.cascade.nom} (prix ramené au barème 30 / 50 / 100 kW)`,
      quantite: input.electrique.cascade.nombre,
      unite: "u",
      puHt: prix.puHt,
      coutUnitaireHt: prix.puHt,
      margeConnue: false,
    });
  }

  if (input.architecture === "hybride" && input.electrique.centrale) {
    const prix = prixOnduleurChaineHt(input.electrique.centrale.kwAc);
    ajouter(lignes, {
      id: "centrale",
      famille: "fourniture",
      designation: prix.officiel ? input.electrique.centrale.nom : `${input.electrique.centrale.nom} (prix de repli, hors 30 / 50 / 100 kW)`,
      quantite: 1,
      unite: "u",
      puHt: prix.puHt,
      coutUnitaireHt: prix.puHt,
      margeConnue: false,
    });
  }

  if (input.architecture === "micro" && input.electrique.micro && input.electrique.micro.nombreMicros > 0) {
    const pu = BPU_2026.microVenteHt[input.electrique.micro.id];
    ajouter(lignes, {
      id: "micros",
      famille: "fourniture",
      designation: `${input.electrique.micro.nom} (prix de repli, hors barème chaîne 30 / 50 / 100 kW)`,
      quantite: input.electrique.micro.nombreMicros,
      unite: "u",
      puHt: pu,
      coutUnitaireHt: pu,
      margeConnue: false,
    });
  }

  if (tertiaire && input.architecture === "cascade" && input.batterieCiKwh > 0) {
    ajouter(lignes, {
      id: "batterie-ci",
      famille: "fourniture",
      designation: "Batterie centralisée C&I",
      quantite: input.batterieCiKwh,
      unite: "kWh",
      puHt: PRIX_BATTERIE_CI_HT_KWH,
      coutUnitaireHt: PRIX_BATTERIE_CI_HT_KWH,
      margeConnue: false,
    });
  }

  const bornes = input.irveActive ? Math.min(10, Math.max(1, Math.round(input.nbBornes))) : 0;
  if (bornes > 0) {
    if (tertiaire) {
      ajouter(lignes, {
        id: "irve",
        famille: "fourniture",
        designation: "Borne tertiaire communicante OCPP 22 kW, fourniture et pose",
        quantite: bornes,
        unite: "u",
        puHt: BPU_2026.borneCiPoseHt,
        coutUnitaireHt: BPU_2026.borneCiAchatHt,
        margeConnue: true,
      });
    } else {
      const venteHt = argent(BPU_2026.wallConnectorPoseTtc / (1 + tauxTva));
      ajouter(lignes, {
        id: "irve",
        famille: "fourniture",
        designation: "Tesla Wall Connector 22 kW, fourniture et pose",
        quantite: bornes,
        unite: "u",
        puHt: venteHt,
        coutUnitaireHt: BPU_2026.wallConnectorAchatHt,
        margeConnue: true,
      });
    }
  }

  if (kwc > 0) {
    const pose =
      tertiaire && input.typeCouverture === "ombriere"
        ? BPU_2026.poseEurKwc.ombriere
        : tertiaire
          ? BPU_2026.poseEurKwc.tertiaireToiture
          : BPU_2026.poseEurKwc.residentiel;
    ajouter(lignes, {
      id: "pose",
      famille: "ingenierie",
      designation: tertiaire
        ? "Pose toiture QualiPV — tertiaire"
        : "Pose toiture certifiée QualiPV",
      quantite: Math.round(kwc * 100) / 100,
      unite: "kWc",
      puHt: pose,
      coutUnitaireHt: pose,
      margeConnue: false,
    });
    const mes =
      input.typeCouverture === "ombriere"
        ? BPU_2026.miseEnServiceHt.ombriere
        : tertiaire
          ? BPU_2026.miseEnServiceHt.tertiaire
          : BPU_2026.miseEnServiceHt.residentiel;
    ajouter(lignes, {
      id: "mes",
      famille: "ingenierie",
      designation: "Raccordement électrique et mise en service",
      quantite: 1,
      unite: "forfait",
      puHt: mes,
      coutUnitaireHt: mes,
      margeConnue: false,
    });
    const demarches =
      tertiaire && kwc > 100
        ? BPU_2026.demarchesHt.tertiaireAuDela100
        : tertiaire
          ? BPU_2026.demarchesHt.tertiaire
          : BPU_2026.demarchesHt.residentiel;
    ajouter(lignes, {
      id: "demarches",
      famille: "ingenierie",
      designation: "Démarches administratives — déclaration préalable, raccordement Enedis (PDR / CRAE)",
      quantite: 1,
      unite: "forfait",
      puHt: demarches,
      coutUnitaireHt: demarches,
      margeConnue: false,
    });
  }

  const fournituresHt = somme(lignes, "fourniture");
  const ingenierieHt = somme(lignes, "ingenierie");
  const totalHt = argent(fournituresHt + ingenierieHt);
  const tvaEur = argent(totalHt * tauxTva);
  const totalTtc = argent(totalHt + tvaEur);
  const aides: AideDevis[] = [];

  if (!tertiaire && kwc > 0 && kwc <= 100) {
    const prime = primeAutoconsoTotale(kwc);
    if (prime > 0) {
      aides.push({
        id: "prime-autoconso",
        libelle: "Prime à l'autoconsommation (hypothèse de barème, à titre indicatif)",
        montantEur: argent(prime),
      });
    }
  }

  const ligneIrve = lignes.find((ligne) => ligne.id === "irve");
  if (ligneIrve) {
    const plafond = bornes * PLAFOND_ADVENIR_PAR_BORNE;
    const aide = argent(Math.min(ligneIrve.totalHt * TAUX_ADVENIR, plafond));
    if (aide > 0) {
      aides.push({
        id: "advenir",
        libelle: "Prime ADVENIR (jusqu'à 50 % du lot bornes, plafonnée, à titre indicatif)",
        montantEur: aide,
      });
    }
  }

  const totalAidesEur = argent(aides.reduce((total, aide) => total + aide.montantEur, 0));
  const resteAChargeTtc = argent(Math.max(0, totalTtc - totalAidesEur));
  const coutAchatHt = argent(lignes.reduce((total, ligne) => total + ligne.coutHt, 0));
  const margeBruteHt = argent(totalHt - coutAchatHt);
  const margeBrutePct = totalHt > 0 ? Math.round((margeBruteHt / totalHt) * 1000) / 1000 : 0;
  const code = (input.dossierId || input.clientNom || "LIBRE").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 16) || "LIBRE";

  return {
    numero: `DEV-2026-PV-${code}`,
    lignes,
    fournituresHt,
    ingenierieHt,
    totalHt,
    tauxTva,
    tvaEur,
    totalTtc,
    aides,
    totalAidesEur,
    resteAChargeTtc,
    coutAchatHt,
    margeBruteHt,
    margeBrutePct,
    margeMasquee: false,
    mentions: [
      "Devis contractant général ENERGIA-CONSEIL IA. Validité 3 mois. Il ne se substitue pas au devis RGE de l'installateur QualiPV.",
      "TVA retenue : 10 % si résidentiel jusqu'à 3 kWc, 20 % au-delà ou en tertiaire. À confirmer selon l'âge du logement.",
      "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon éligibilité en vigueur. Montants définitifs après instruction.",
      "Câblage, démarches administratives et mise en service : forfaits de la grille ENERGIA.",
      "La marge brute est une donnée interne. Elle ne figure pas sur le document remis au client.",
    ],
  };
}
