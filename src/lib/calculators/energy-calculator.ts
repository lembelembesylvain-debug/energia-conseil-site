// Moteur de calcul énergétique Energia-Conseil  
// Version 2026 - Barèmes officiels mis à jour  
 
import {  
  MaPrimeRenovCategory,  
  DPEClass,  
  HouseholdInfo,  
  LogementInfo,  
  Works,  
  WorksItem,  
  CalculationResult,  
  MaPrimeRenovResult,  
  CEEResult,  
  EcoPTZResult,  
  TVAResult,  
  AidesLocalesResult,  
  AideDetail  
} from './types';  
 
import {  
  INCOME_THRESHOLDS,  
  ISOLATION_RATES,  
  ISOLATION_SURFACE_MAX,  
  HEATING_RATES,  
  VENTILATION_RATES,  
  WINDOWS_RATES,  
  WINDOWS_MAX_QUANTITY,  
  BONUS_SORTIE_PASSOIRE,  
  BONUS_BBC,  
  MONOGESTE_MAX_CUMUL,  
  PARCOURS_ACCOMPAGNE,  
  CEE_RATES,  
  ECO_PTZ,  
  TVA_REDUITE,  
  TVA_NORMALE,  
  AIDES_LOCALES_RATE  
} from './maprimerenov-data';  
 
export function calculateEnergyAids(  
  household: HouseholdInfo,  
  logement: LogementInfo,  
  works: Works,  
  isParcoursAccompagne: boolean = false  
): CalculationResult {  
    
  const category = getMaPrimeRenovCategory(  
    household.income,  
    household.householdSize,  
    household.region  
  );  
    
  const coutTotalTravaux = calculateTotalWorksCost(works);  
  const gainClasses = calculateDPEGain(logement.dpeActuel, logement.dpeVise);  
    
  const maPrimeRenov = isParcoursAccompagne  
    ? calculateMaPrimeRenovAccompagne(works, category, logement, gainClasses, coutTotalTravaux)  
    : calculateMaPrimeRenovMonogeste(works, category, logement);  
    
  const cee = calculateCEE(works, category, logement);  
  const ecoPTZ = calculateEcoPTZ(works);  
  const tva = calculateTVA(coutTotalTravaux);  
  const aidesLocales = calculateAidesLocales(coutTotalTravaux, household.zipCode);  
    
  const totalAides =   
    maPrimeRenov.total +  
    cee.total +  
    aidesLocales.total +  
    tva.montantEconomise;  
    
  const resteACharge = Math.max(0, coutTotalTravaux - totalAides);  
  const economiesAnnuelles = estimateAnnualSavings(logement, works);  
  const roi = resteACharge > 0 ? resteACharge / economiesAnnuelles : 0;  
    
  return {  
    coutTotalTravaux,  
    maPrimeRenov,  
    cee,  
    ecoPTZ,  
    tva,  
    aidesLocales,  
    totalAides,  
    resteACharge,  
    dpeAvant: logement.dpeActuel,  
    dpeApres: logement.dpeVise,  
    gainClasses,  
    economiesAnnuelles,  
    roi  
  };  
}  
  
export function getMaPrimeRenovCategory(  
  income: number,  
  householdSize: number,  
  region: 'IDF' | 'OTHER'  
): MaPrimeRenovCategory {  
    
  const thresholds = INCOME_THRESHOLDS[region];  
    
  let threshold;  
  if (householdSize <= 5) {  
    threshold = thresholds[householdSize as 1 | 2 | 3 | 4 | 5];  
  } else {  
    const base = thresholds[5];  
    threshold = {  
      bleu: base.bleu + (householdSize - 5) * thresholds.perAdditional.bleu,  
      jaune: base.jaune + (householdSize - 5) * thresholds.perAdditional.jaune,  
      violet: base.violet + (householdSize - 5) * thresholds.perAdditional.violet  
    };  
  }  
    
  if (income <= threshold.bleu) {  
    return 'BLEU';  
  } else if (income <= threshold.jaune) {  
    return 'JAUNE';  
  } else if (income <= threshold.violet) {  
    return 'VIOLET';  
  } else {  
    return 'ROSE';  
  }  
}  
  
function calculateTotalWorksCost(works: Works): number {  
  let total = 0;  
  Object.values(works).forEach(work => {  
    if (work && work.estimatedCost) {  
      total += work.estimatedCost;  
    }  
  });  
  return total;  
}  
 
function calculateDPEGain(dpeActuel: DPEClass, dpeVise: DPEClass): number {  
  const dpeOrder: DPEClass[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];  
  const indexActuel = dpeOrder.indexOf(dpeActuel);  
  const indexVise = dpeOrder.indexOf(dpeVise);  
  return indexActuel - indexVise;  
}  
 
function calculateMaPrimeRenovMonogeste(  
  works: Works,  
  category: MaPrimeRenovCategory,  
  logement: LogementInfo  
): MaPrimeRenovResult {  
    
  let total = 0;  
  const details: AideDetail[] = [];  
    
  if (works.roofInsulation) {  
    const surface = Math.min(works.roofInsulation.surface || 0, ISOLATION_SURFACE_MAX);  
    const rate = ISOLATION_RATES.roofInsulation[category];  
    if (rate > 0 && (works.roofInsulation.rValue || 0) >= 7) {  
      const montant = surface * rate;  
      total += montant;  
      details.push({  
        poste: 'Isolation combles',  
        calcul: `${surface}m² × ${rate}€`,  
        montant  
      });  
    }  
  }  
    
  if (works.ite) {  
    const surface = Math.min(works.ite.surface || 0, ISOLATION_SURFACE_MAX);  
    const rate = ISOLATION_RATES.ite[category];  
    if (rate > 0 && (works.ite.rValue || 0) >= 3.7) {  
      const montant = surface * rate;  
      total += montant;  
      details.push({  
        poste: 'ITE murs',  
        calcul: `${surface}m² × ${rate}€`,  
        montant  
      });  
    }  
  }  
    
  if (works.iti) {  
    const surface = Math.min(works.iti.surface || 0, ISOLATION_SURFACE_MAX);  
    const rate = ISOLATION_RATES.iti[category];  
    if (rate > 0 && (works.iti.rValue || 0) >= 3.7) {  
      const montant = surface * rate;  
      total += montant;  
      details.push({  
        poste: 'ITI murs',  
        calcul: `${surface}m² × ${rate}€`,  
        montant  
      });  
    }  
  }  
    
  if (works.floorInsulation) {  
    const surface = Math.min(works.floorInsulation.surface || 0, ISOLATION_SURFACE_MAX);  
    const rate = ISOLATION_RATES.floorInsulation[category];  
    if (rate > 0 && (works.floorInsulation.rValue || 0) >= 3) {  
      const montant = surface * rate;  
      total += montant;  
      details.push({  
        poste: 'Isolation planchers',  
        calcul: `${surface}m² × ${rate}€`,  
        montant  
      });  
    }  
  }  
    
  if (works.roofTerrace) {  
    const surface = Math.min(works.roofTerrace.surface || 0, ISOLATION_SURFACE_MAX);  
    const rate = ISOLATION_RATES.roofTerrace[category];  
    if (rate > 0 && (works.roofTerrace.rValue || 0) >= 4.5) {  
      const montant = surface * rate;  
      total += montant;  
      details.push({  
        poste: 'Isolation toiture terrasse',  
        calcul: `${surface}m² × ${rate}€`,  
        montant  
      });  
    }  
  }  
    
  if (works.heatPumpAirWater && (works.heatPumpAirWater.cop || 0) >= 4) {  
    const montant = HEATING_RATES.heatPumpAirWater[category];  
    if (montant > 0) {  
      total += montant;  
      details.push({  
        poste: 'PAC air-eau',  
        calcul: 'Forfait',  
        montant  
      });  
    }  
  }  
    
  if (works.heatPumpGeothermal && (works.heatPumpGeothermal.cop || 0) >= 4) {  
    const montant = HEATING_RATES.heatPumpGeothermal[category];  
    if (montant > 0) {  
      total += montant;  
      details.push({  
        poste: 'PAC géothermique',  
        calcul: 'Forfait',  
        montant  
      });  
    }  
  }  
    
  if (works.biomassFurnace) {  
    const montant = HEATING_RATES.biomassFurnace[category];  
    if (montant > 0) {  
      total += montant;  
      details.push({  
        poste: 'Chaudière biomasse',  
        calcul: 'Forfait',  
        montant  
      });  
    }  
  }  
    
  if (works.pelletStove) {  
    const montant = HEATING_RATES.pelletStove[category];  
    if (montant > 0) {  
      total += montant;  
      details.push({  
        poste: 'Poêle à granulés',  
        calcul: 'Forfait',  
        montant  
      });  
    }  
  }  
    
  if (works.solarWaterHeater) {  
    const montant = HEATING_RATES.solarWaterHeater[category];  
    if (montant > 0) {  
      total += montant;  
      details.push({  
        poste: 'Chauffe-eau solaire',  
        calcul: 'Forfait',  
        montant  
      });  
    }  
  }  
    
  if (works.thermodynamicWaterHeater) {  
    const montant = HEATING_RATES.thermodynamicWaterHeater[category];  
    if (montant > 0) {  
      total += montant;  
      details.push({  
        poste: 'Chauffe-eau thermodynamique',  
        calcul: 'Forfait',  
        montant  
      });  
    }  
  }  
    
  if (works.fuelTankRemoval) {  
    const montant = HEATING_RATES.fuelTankRemoval[category];  
    if (montant > 0) {  
      total += montant;  
      details.push({  
        poste: 'Dépose cuve fioul',  
        calcul: 'Forfait',  
        montant  
      });  
    }  
  }  
    
  if (works.vmcDoubleFlux) {  
    const montant = VENTILATION_RATES.vmcDoubleFlux[category];  
    if (montant > 0) {  
      total += montant;  
      details.push({  
        poste: 'VMC double flux',  
        calcul: 'Forfait',  
        montant  
      });  
    }  
  }  
    
  if (works.vmcSimpleFlux) {  
    const montant = VENTILATION_RATES.vmcSimpleFlux[category];  
    if (montant > 0) {  
      total += montant;  
      details.push({  
        poste: 'VMC simple flux hygro',  
        calcul: 'Forfait',  
        montant  
      });  
    }  
  }  
    
  if (works.windows) {  
    const quantity = Math.min(works.windows.quantity || 0, WINDOWS_MAX_QUANTITY);  
    const rate = WINDOWS_RATES.windows[category];  
    if (rate > 0) {  
      const montant = quantity * rate;  
      total += montant;  
      details.push({  
        poste: 'Fenêtres',  
        calcul: `${quantity} × ${rate}€`,  
        montant  
      });  
    }  
  }  
    
  if (works.frenchWindows) {  
    const quantity = Math.min(works.frenchWindows.quantity || 0, WINDOWS_MAX_QUANTITY);  
    const rate = WINDOWS_RATES.frenchWindows[category];  
    if (rate > 0) {  
      const montant = quantity * rate;  
      total += montant;  
      details.push({  
        poste: 'Porte-fenêtres',  
        calcul: `${quantity} × ${rate}€`,  
        montant  
      });  
    }  
  }  
    
  if (works.insulatedDoors) {  
    const quantity = Math.min(works.insulatedDoors.quantity || 0, WINDOWS_MAX_QUANTITY);  
    const rate = WINDOWS_RATES.insulatedDoors[category];  
    if (rate > 0) {  
      const montant = quantity * rate;  
      total += montant;  
      details.push({  
        poste: 'Portes d\'entrée isolantes',  
        calcul: `${quantity} × ${rate}€`,  
        montant  
      });  
    }  
  }  
    
  let bonusSortiePassoire = 0;  
  let bonusBBC = 0;  
    
  if (['F', 'G'].includes(logement.dpeActuel) && ['A', 'B', 'C', 'D'].includes(logement.dpeVise)) {  
    bonusSortiePassoire = BONUS_SORTIE_PASSOIRE;  
    total += bonusSortiePassoire;  
    details.push({  
      poste: 'Bonus sortie passoire',  
      calcul: `${logement.dpeActuel} → ${logement.dpeVise}`,  
      montant: bonusSortiePassoire  
    });  
  }  
    
  if (['A', 'B'].includes(logement.dpeVise)) {  
    bonusBBC = BONUS_BBC;  
    total += bonusBBC;  
    details.push({  
      poste: 'Bonus BBC',  
      calcul: `DPE ${logement.dpeVise}`,  
      montant: bonusBBC  
    });  
  }  
    
  if (total > MONOGESTE_MAX_CUMUL) {  
    total = MONOGESTE_MAX_CUMUL;  
  }  
    
  return {  
    category,  
    total,  
    details,  
    bonusSortiePassoire,  
    bonusBBC,  
    bonusGlobal: 0  
  };  
}  

function calculateMaPrimeRenovAccompagne(  
  works: Works,  
  category: MaPrimeRenovCategory,  
  logement: LogementInfo,  
  gainClasses: number,  
  coutTotalTravaux: number  
): MaPrimeRenovResult {  
    
  const details: AideDetail[] = [];  
    
  const plafondDepenses = gainClasses >= 3  
    ? PARCOURS_ACCOMPAGNE.plafonds['3classesPlus']  
    : PARCOURS_ACCOMPAGNE.plafonds['2classes'];  
    
  const coutEligible = Math.min(coutTotalTravaux, plafondDepenses);  
  const taux = PARCOURS_ACCOMPAGNE.taux[category];  
    
  let montantMPR = coutEligible * taux;  
    
  details.push({  
    poste: `Rénovation d'ampleur (${gainClasses} classes)`,  
    calcul: `${coutEligible.toLocaleString()}€ × ${(taux * 100).toFixed(0)}%`,  
    montant: montantMPR  
  });  
    
  const tauxEcretement = PARCOURS_ACCOMPAGNE.ecretement[category];  
  const montantMaxAvecEcretement = coutTotalTravaux * tauxEcretement;  
    
  if (montantMPR > montantMaxAvecEcretement) {  
    montantMPR = montantMaxAvecEcretement;  
    details.push({  
      poste: 'Écrêtement appliqué',  
      calcul: `Plafonné à ${(tauxEcretement * 100).toFixed(0)}% du coût`,  
      montant: 0  
    });  
  }  
    
  const tauxMAR = PARCOURS_ACCOMPAGNE.mar[category];  
  const montantMAR = PARCOURS_ACCOMPAGNE.coutMAR * tauxMAR;  
    
  details.push({  
    poste: 'Mon Accompagnateur Rénov\' (MAR)',  
    calcul: `${PARCOURS_ACCOMPAGNE.coutMAR.toLocaleString()}€ × ${(tauxMAR * 100).toFixed(0)}%`,  
    montant: montantMAR  
  });  
    
  const total = montantMPR + montantMAR;  
    
  return {  
    category,  
    total,  
    details,  
    bonusSortiePassoire: 0,  
    bonusBBC: 0,  
    bonusGlobal: 0  
  };  
}  
 
function calculateCEE(  
  works: Works,  
  category: MaPrimeRenovCategory,  
  logement: LogementInfo  
): CEEResult {  
    
  let total = 0;  
  const details: AideDetail[] = [];  
    
  const isModeste = ['BLEU', 'JAUNE'].includes(category);  
  const reductionRate = isModeste ? 1 : CEE_RATES.reductionNonModestes;  
    
  if (works.roofInsulation) {  
    const surface = works.roofInsulation.surface || 0;  
    const montant = surface * CEE_RATES.isolation.combles * reductionRate;  
    total += montant;  
    details.push({  
      poste: 'CEE Isolation combles',  
      calcul: `${surface}m² × ${CEE_RATES.isolation.combles}€`,  
      montant  
    });  
  }  
    
  if (works.ite || works.iti) {  
    const surface = (works.ite?.surface || 0) + (works.iti?.surface || 0);  
    const montant = surface * CEE_RATES.isolation.murs * reductionRate;  
    total += montant;  
    details.push({  
      poste: 'CEE Isolation murs',  
      calcul: `${surface}m² × ${CEE_RATES.isolation.murs}€`,  
      montant  
    });  
  }  
    
  if (works.floorInsulation) {  
    const surface = works.floorInsulation.surface || 0;  
    const montant = surface * CEE_RATES.isolation.planchers * reductionRate;  
    total += montant;  
    details.push({  
      poste: 'CEE Isolation planchers',  
      calcul: `${surface}m² × ${CEE_RATES.isolation.planchers}€`,  
      montant  
    });  
  }  
    
  if (works.heatPumpAirWater) {  
    const montant = CEE_RATES.heating.pacAirEau * reductionRate;  
    total += montant;  
    details.push({  
      poste: 'CEE PAC air-eau',  
      calcul: 'Forfait',  
      montant  
    });  
  }  
    
  if (works.heatPumpGeothermal) {  
    const montant = CEE_RATES.heating.pacGeothermal * reductionRate;  
    total += montant;  
    details.push({  
      poste: 'CEE PAC géothermique',  
      calcul: 'Forfait',  
      montant  
    });  
  }  
    
  if (works.biomassFurnace) {  
    const montant = CEE_RATES.heating.biomassFurnace * reductionRate;  
    total += montant;  
    details.push({  
      poste: 'CEE Chaudière biomasse',  
      calcul: 'Forfait',  
      montant  
    });  
  }  
    
  if (works.pelletStove) {  
    const montant = CEE_RATES.heating.pelletStove * reductionRate;  
    total += montant;  
    details.push({  
      poste: 'CEE Poêle à granulés',  
      calcul: 'Forfait',  
      montant  
    });  
  }  
    
  if (works.thermodynamicWaterHeater) {  
    const montant = CEE_RATES.heating.thermodynamicWaterHeater * reductionRate;  
    total += montant;  
    details.push({  
      poste: 'CEE Chauffe-eau thermodynamique',  
      calcul: 'Forfait',  
      montant  
    });  
  }  
    
  if (works.vmcDoubleFlux) {  
    const montant = CEE_RATES.ventilation.vmcDoubleFlux * reductionRate;  
    total += montant;  
    details.push({  
      poste: 'CEE VMC double flux',  
      calcul: 'Forfait',  
      montant  
    });  
  }  
    
  const totalWindows = (works.windows?.quantity || 0) +   
                       (works.frenchWindows?.quantity || 0) +   
                       (works.insulatedDoors?.quantity || 0);  
    
  if (totalWindows > 0) {  
    const montant = totalWindows * CEE_RATES.windows * reductionRate;  
    total += montant;  
    details.push({  
      poste: 'CEE Menuiseries',  
      calcul: `${totalWindows} équipements × ${CEE_RATES.windows}€`,  
      montant  
    });  
  }  
    
  return {  
    total: Math.round(total),  
    details  
  };  
}  
 
function calculateEcoPTZ(works: Works): EcoPTZResult {  
    
  let nbActions = 0;  
    
  if (works.roofInsulation || works.ite || works.iti || works.floorInsulation || works.roofTerrace) {  
    nbActions++;  
  }  
    
  if (works.heatPumpAirWater || works.heatPumpGeothermal || works.biomassFurnace ||   
      works.pelletStove || works.solarWaterHeater || works.thermodynamicWaterHeater) {  
    nbActions++;  
  }  
    
  if (works.vmcDoubleFlux || works.vmcSimpleFlux) {  
    nbActions++;  
  }  
    
  if (works.windows || works.frenchWindows || works.insulatedDoors) {  
    nbActions++;  
  }  
    
  let montant = 0;  
  if (nbActions === 1) {  
    montant = ECO_PTZ.montants[1];  
  } else if (nbActions === 2) {  
    montant = ECO_PTZ.montants[2];  
  } else if (nbActions >= 3) {  
    montant = ECO_PTZ.montants[3];  
  }  
    
  return {  
    montant,  
    nbActions,  
    duree: ECO_PTZ.duree  
  };  
}  

function calculateTVA(coutTotalTravaux: number): TVAResult {  
    
  const tvaReduite = coutTotalTravaux * TVA_REDUITE;  
  const tvaNormale = coutTotalTravaux * TVA_NORMALE;  
  const montantEconomise = tvaNormale - tvaReduite;  
    
  return {  
    montantEconomise: Math.round(montantEconomise),  
    tauxApplique: TVA_REDUITE  
  };  
}  
 
function calculateAidesLocales(  
  coutTotalTravaux: number,  
  zipCode: string  
): AidesLocalesResult {  
    
  const montant = coutTotalTravaux * AIDES_LOCALES_RATE;  
    
  const details: AideDetail[] = [{  
    poste: 'Aides locales (estimation)',  
    calcul: `${(AIDES_LOCALES_RATE * 100).toFixed(0)}% du coût travaux`,  
    montant  
  }];  
    
  return {  
    total: Math.round(montant),  
    details  
  };  
}  
 
function estimateAnnualSavings(  
  logement: LogementInfo,  
  works: Works  
): number {  
    
  const gainClasses = calculateDPEGain(logement.dpeActuel, logement.dpeVise);  
    
  const consommationParClasse: Record<DPEClass, number> = {  
    'A': 50,  
    'B': 90,  
    'C': 150,  
    'D': 230,  
    'E': 330,  
    'F': 420,  
    'G': 550  
  };  
    
  const consoAvant = consommationParClasse[logement.dpeActuel];  
  const consoApres = consommationParClasse[logement.dpeVise];  
    
  const economieskWh = (consoAvant - consoApres) * logement.surface;  
  const prixkWh = 0.18;  
  const economiesAnnuelles = economieskWh * prixkWh;  
    
  return Math.round(economiesAnnuelles);  
}  
 
export function formatCurrency(amount: number): string {  
  return new Intl.NumberFormat('fr-FR', {  
    style: 'currency',  
    currency: 'EUR',  
    minimumFractionDigits: 0,  
    maximumFractionDigits: 0  
  }).format(amount);  
}  
 
export function formatPercentage(value: number): string {  
  return `${(value * 100).toFixed(0)}%`;  
}  
 
export function getDPEColor(dpe: DPEClass): string {  
  const colors: Record<DPEClass, string> = {  
    'A': '#00A651',  
    'B': '#50B848',  
    'C': '#C8D200',  
    'D': '#FCEE21',  
    'E': '#F7941D',  
    'F': '#ED1C24',  
    'G': '#CC0033'  
  };  
  return colors[dpe];  
}  
 
export function getDPELabel(dpe: DPEClass): string {  
  const labels: Record<DPEClass, string> = {  
    'A': 'Excellente performance',  
    'B': 'Très bonne performance',  
    'C': 'Bonne performance',  
    'D': 'Performance moyenne',  
    'E': 'Performance médiocre',  
    'F': 'Mauvaise performance (passoire)',  
    'G': 'Très mauvaise performance (passoire)'  
  };  
  return labels[dpe];  
}  