import {
  COUT_BORNE_22_HT,
  DUREE_AMORTISSEMENT_ANS,
  PLAFOND_ADVENIR_PAR_BORNE,
  POWERWALL_3,
  PRIX_BATTERIE_CI_HT_KWH,
  PRIX_TARIF_PRO,
  TAUX_ADVENIR,
  TAUX_IS,
} from "./catalogue";
import { borne } from "./layout";
import type { ArchitectureId, BilanProduction, PointCourbe, TarifPro } from "./types";

const INFLATION = 0.03;
const ANNEES = 25;
const ANNEES_INJECTION = 20;

/**
 * Facteur par rapport au productible de référence (sud, 30°).
 * Inclinaison optimale France ~32°. L'azimut pèse d'autant plus que la toiture est pentue.
 * Méthode locale inspirée des abaques PVGIS, sans appel réseau.
 */
export function facteurOrientation(inclinaisonDeg: number, azimutDeg: number): number {
  const inclinaison = borne(inclinaisonDeg, 0, 90);
  const azimut = Math.abs(borne(azimutDeg, -180, 180));
  const delta = ((inclinaison - 32) * Math.PI) / 180;
  const facteurInclinaison = Math.cos(delta * 0.72);
  const poidsPente = Math.sin((inclinaison * Math.PI) / 180);
  const azimutRad = (azimut * Math.PI) / 180;
  const facteurAzimut = 1 - poidsPente * (1 - Math.cos(azimutRad)) * 0.34;
  const nord = azimut > 90 ? 1 - ((azimut - 90) / 90) * 0.42 * poidsPente : 1;
  return borne(facteurInclinaison * facteurAzimut * nord, 0.12, 1.05);
}

export function tauxCibleAutoconsommation(productionKwh: number, consommationKwh: number, avecBatterie: boolean): number {
  if (productionKwh <= 0) return 0;
  const ratio = borne(consommationKwh / productionKwh, 0, 1);
  if (avecBatterie) return 0.8 + 0.1 * ratio;
  return 0.3 + 0.1 * ratio;
}

export function estimerInvestissement(kwc: number, architecture: ArchitectureId): { total: number; detail: string } {
  const puissance = Math.max(0, kwc);
  if (architecture === "tesla-pw3") {
    const modules = Math.round(puissance * 1550);
    return {
      total: modules + POWERWALL_3.prixPoseTtc,
      detail: `Modules et pose ${modules.toLocaleString("fr-FR")} EUR (1 550 EUR/kWc) + Powerwall 3 posée ${POWERWALL_3.prixPoseTtc.toLocaleString("fr-FR")} EUR. Hors aides.`,
    };
  }
  if (architecture === "micro") {
    const total = Math.round(puissance * 2150);
    return { total, detail: "Micro-onduleurs, modules et pose : 2 150 EUR/kWc TTC. Hors aides." };
  }
  const total = Math.round(puissance * 1850);
  return { total, detail: "Onduleur central, modules et pose : 1 850 EUR/kWc TTC. Hors aides." };
}

/** kWh/an qu'une borne 22 kW peut absorber sur le surplus de journée : 3 h x 220 jours x 55 %. */
const KWH_IRVE_PAR_BORNE = 22 * 3 * 220 * 0.55;

export function tarifInjectionS21(kwc: number): number {
  return kwc <= 100 ? 0.078 : 0.065;
}

function euroParWcHt(kwc: number): number {
  if (kwc <= 50) return 1.2;
  if (kwc <= 120) return 1.05;
  if (kwc <= 280) return 0.9;
  return 0.8;
}

function courbeGain(
  investissement: number,
  autoconsommationKwh: number,
  surplusKwh: number,
  prix: number,
  injection: number,
  fiscalAnnuel: number,
): { courbe: PointCourbe[]; retourAns: number | null; cumul: number } {
  const courbe: PointCourbe[] = [];
  let cumul = 0;
  let retourAns: number | null = null;
  for (let annee = 1; annee <= ANNEES; annee += 1) {
    const prixAn = prix * (1 + INFLATION) ** (annee - 1);
    const tarif = annee <= ANNEES_INJECTION ? injection : 0;
    const fiscal = annee <= DUREE_AMORTISSEMENT_ANS ? fiscalAnnuel : 0;
    const gain = autoconsommationKwh * prixAn + surplusKwh * tarif + fiscal;
    const avant = cumul;
    cumul += gain;
    if (retourAns === null && investissement > 0 && cumul >= investissement && gain > 0) {
      retourAns = annee - 1 + (investissement - avant) / gain;
    }
    courbe.push({ annee, gain, cumul });
  }
  return { courbe, retourAns, cumul };
}

export function calculerProduction(input: {
  kwc: number;
  inclinaisonDeg: number;
  azimutDeg: number;
  productible: number;
  consommationKwh: number;
  prixKwh: number;
  tarifInjection: number;
  architecture: ArchitectureId;
  investissementSaisi: number | null;
  tertiaire?: {
    actif: boolean;
    tarifPro: TarifPro;
    prixManuel: boolean;
    injectionManuelle: boolean;
    nbBornes: number;
    irveActive: boolean;
    batterieKwh: number;
    unitesPowerwall: number;
  } | null;
}): BilanProduction {
  if (input.tertiaire?.actif) return calculerTertiaire(input);
  const facteur = facteurOrientation(input.inclinaisonDeg, input.azimutDeg);
  const reference = Math.max(0, input.productible);
  const corrige = reference * facteur;
  const productionKwh = Math.max(0, input.kwc) * corrige;
  const avecBatterie = input.architecture === "tesla-pw3";
  const tauxCible = tauxCibleAutoconsommation(productionKwh, input.consommationKwh, avecBatterie);
  const autoconsommationKwh = Math.min(Math.max(0, input.consommationKwh), productionKwh * tauxCible);
  const surplusKwh = Math.max(0, productionKwh - autoconsommationKwh);
  const tauxReel = productionKwh > 0 ? autoconsommationKwh / productionKwh : 0;
  const couvertureConso = input.consommationKwh > 0 ? Math.min(1, autoconsommationKwh / input.consommationKwh) : 0;
  const prix = Math.max(0, input.prixKwh);
  const injection = Math.max(0, input.tarifInjection);
  const economieAnnuelleEur = autoconsommationKwh * prix;
  const revenuInjectionEur = surplusKwh * injection;
  const estimation = estimerInvestissement(input.kwc, input.architecture);
  const investissement =
    input.investissementSaisi !== null && Number.isFinite(input.investissementSaisi) && input.investissementSaisi >= 0
      ? input.investissementSaisi
      : estimation.total;
  const detailInvestissement =
    input.investissementSaisi !== null ? "Montant d'investissement saisi. Hors aides." : estimation.detail;

  const courbe: PointCourbe[] = [];
  let cumul = 0;
  let retourAns: number | null = null;
  for (let annee = 1; annee <= ANNEES; annee += 1) {
    const prixAn = prix * (1 + INFLATION) ** (annee - 1);
    const tarif = annee <= ANNEES_INJECTION ? injection : 0;
    const gain = autoconsommationKwh * prixAn + surplusKwh * tarif;
    const avant = cumul;
    cumul += gain;
    if (retourAns === null && investissement > 0 && cumul >= investissement && gain > 0) {
      retourAns = annee - 1 + (investissement - avant) / gain;
    }
    courbe.push({ annee, gain, cumul });
  }

  const an1 = courbe[0];
  return {
    productibleReference: reference,
    facteurOrientation: facteur,
    productibleCorrige: corrige,
    productionKwh,
    tauxCible,
    tauxReel,
    couvertureConso,
    autoconsommationKwh,
    surplusKwh,
    economieAnnuelleEur,
    revenuInjectionEur,
    gainAnnuelEur: an1?.gain ?? 0,
    cumul25Eur: cumul,
    retourAns,
    courbe,
    investissementEur: investissement,
    detailInvestissement,
    avecBatterie,
    tertiaire: null,
  };
}

function calculerTertiaire(input: {
  kwc: number;
  inclinaisonDeg: number;
  azimutDeg: number;
  productible: number;
  consommationKwh: number;
  prixKwh: number;
  tarifInjection: number;
  architecture: ArchitectureId;
  investissementSaisi: number | null;
  tertiaire?: {
    actif: boolean;
    tarifPro: TarifPro;
    prixManuel: boolean;
    injectionManuelle: boolean;
    nbBornes: number;
    irveActive: boolean;
    batterieKwh: number;
    unitesPowerwall: number;
  } | null;
}): BilanProduction {
  const options = input.tertiaire!;
  const facteur = facteurOrientation(input.inclinaisonDeg, input.azimutDeg);
  const reference = Math.max(0, input.productible);
  const corrige = reference * facteur;
  const productionKwh = Math.max(0, input.kwc) * corrige;
  const consommation = Math.max(0, input.consommationKwh);
  const ratioSite = productionKwh > 0 ? borne(consommation / productionKwh, 0, 1) : 0;
  const tauxBatiment = 0.45 + 0.25 * ratioSite;
  const kwhBatiment = Math.min(consommation, productionKwh * tauxBatiment);
  let surplus = Math.max(0, productionKwh - kwhBatiment);

  const bornes = options.irveActive ? Math.round(borne(options.nbBornes, 1, 10)) : 0;
  const kwhIrve = Math.min(surplus, bornes * KWH_IRVE_PAR_BORNE);
  surplus -= kwhIrve;

  const unites = Math.min(POWERWALL_3.unitesMax, Math.max(1, Math.round(options.unitesPowerwall || 1)));
  const kwhStockage = input.architecture === "tesla-pw3" ? POWERWALL_3.capaciteKwh * unites : Math.max(0, options.batterieKwh);
  const kwAcStockage = input.architecture === "tesla-pw3" ? POWERWALL_3.secoursKw * unites : 0;
  const transit = kwhStockage * 0.9 * 365 * 0.5;
  const kwhBatterie = Math.min(surplus, transit);
  surplus -= kwhBatterie;

  const autoconsommationKwh = kwhBatiment + kwhIrve + kwhBatterie;
  const surplusKwh = Math.max(0, surplus);
  const tauxReel = productionKwh > 0 ? autoconsommationKwh / productionKwh : 0;
  const couvertureConso = consommation > 0 ? Math.min(1, kwhBatiment / consommation) : 0;
  const prix = options.prixManuel ? Math.max(0, input.prixKwh) : PRIX_TARIF_PRO[options.tarifPro];
  const injectionS21 = tarifInjectionS21(input.kwc);
  const injection = options.injectionManuelle ? Math.max(0, input.tarifInjection) : injectionS21;

  const pvHt = Math.round(Math.max(0, input.kwc) * euroParWcHt(input.kwc) * 1000);
  const stockageHt =
    input.architecture === "tesla-pw3"
      ? unites * POWERWALL_3.prixPoseHt
      : Math.round(Math.max(0, options.batterieKwh) * PRIX_BATTERIE_CI_HT_KWH);
  const coutIrveHt = bornes * COUT_BORNE_22_HT;
  const aideAdvenirEur = Math.min(coutIrveHt * TAUX_ADVENIR, bornes * PLAFOND_ADVENIR_PAR_BORNE);
  const coutIrveNetHt = coutIrveHt - aideAdvenirEur;
  const netHt = pvHt + stockageHt + coutIrveNetHt;
  const saisi =
    input.investissementSaisi !== null && Number.isFinite(input.investissementSaisi) && input.investissementSaisi >= 0;
  const investissement = saisi ? input.investissementSaisi! : netHt;
  const amortissementAnnuelHt = DUREE_AMORTISSEMENT_ANS > 0 ? investissement / DUREE_AMORTISSEMENT_ANS : 0;
  const economieFiscaleEur = amortissementAnnuelHt * TAUX_IS;
  const tvaRecuperableEur = (pvHt + stockageHt + coutIrveHt) * 0.2;
  const detailInvestissement = saisi
    ? "Montant d'investissement saisi, hors aides photovoltaiques. TVA 20 % consideree comme recuperable et hors retour."
    : `PV ${pvHt.toLocaleString("fr-FR")} EUR HT (${euroParWcHt(input.kwc).toLocaleString("fr-FR")} EUR/Wc) + stockage ${stockageHt.toLocaleString("fr-FR")} EUR HT + IRVE nette ${coutIrveNetHt.toLocaleString("fr-FR")} EUR HT. ADVENIR indicatif ${Math.round(aideAdvenirEur).toLocaleString("fr-FR")} EUR, déduit du seul lot bornes.`;

  const energie = courbeGain(investissement, autoconsommationKwh, surplusKwh, prix, injection, economieFiscaleEur);
  const an1 = energie.courbe[0];
  return {
    productibleReference: reference,
    facteurOrientation: facteur,
    productibleCorrige: corrige,
    productionKwh,
    tauxCible: tauxBatiment,
    tauxReel,
    couvertureConso,
    autoconsommationKwh,
    surplusKwh,
    economieAnnuelleEur: autoconsommationKwh * prix,
    revenuInjectionEur: surplusKwh * injection,
    gainAnnuelEur: an1?.gain ?? 0,
    cumul25Eur: energie.cumul,
    retourAns: energie.retourAns,
    courbe: energie.courbe,
    investissementEur: investissement,
    detailInvestissement,
    avecBatterie: kwhStockage > 0,
    tertiaire: {
      tarif: options.tarifPro,
      investissementHt: investissement,
      tvaRecuperableEur,
      aideAdvenirEur,
      coutIrveHt,
      coutIrveNetHt,
      kwhIrve,
      kwhBatterie,
      economieFiscaleEur,
      amortissementAnnuelHt,
      tarifInjectionS21: injection,
      kwhStockage,
      kwAcStockage,
    },
  };
}
