// Barèmes MaPrimeRénov' 2026 (OFFICIELS - Mis à jour février 2026)  
 
import { MaPrimeRenovCategory, Region } from './types';  
 
export const INCOME_THRESHOLDS = {  
  IDF: {  
    1: { bleu: 24031, jaune: 29253, violet: 40851 },  
    2: { bleu: 35270, jaune: 42933, violet: 60051 },  
    3: { bleu: 42357, jaune: 51564, violet: 71846 },  
    4: { bleu: 49455, jaune: 60208, violet: 84562 },  
    5: { bleu: 56580, jaune: 68877, violet: 96817 },  
    perAdditional: { bleu: 7116, jaune: 8663, violet: 12257 }  
  },  
  OTHER: {  
    1: { bleu: 17173, jaune: 22015, violet: 30844 },  
    2: { bleu: 25115, jaune: 32197, violet: 45340 },  
    3: { bleu: 30206, jaune: 38719, violet: 54592 },  
    4: { bleu: 35285, jaune: 45234, violet: 63844 },  
    5: { bleu: 40388, jaune: 51775, violet: 73098 },  
    perAdditional: { bleu: 5094, jaune: 6525, violet: 9254 }  
  }  
};  
 
export const ISOLATION_RATES = {  
  roofInsulation: {  
    BLEU: 25,  
    JAUNE: 20,  
    VIOLET: 15,  
    ROSE: 0  
  },  
  ite: {  
    BLEU: 75,  
    JAUNE: 60,  
    VIOLET: 40,  
    ROSE: 15  
  },  
  iti: {  
    BLEU: 25,  
    JAUNE: 20,  
    VIOLET: 15,  
    ROSE: 7  
  },  
  floorInsulation: {  
    BLEU: 50,  
    JAUNE: 40,  
    VIOLET: 25,  
    ROSE: 0  
  },  
  roofTerrace: {  
    BLEU: 75,  
    JAUNE: 60,  
    VIOLET: 40,  
    ROSE: 0  
  }  
};  
 
export const ISOLATION_SURFACE_MAX = 100;  

export const HEATING_RATES = {  
  heatPumpAirWater: {  
    BLEU: 5000,  
    JAUNE: 4000,  
    VIOLET: 3000,  
    ROSE: 1000  
  },  
  heatPumpGeothermal: {  
    BLEU: 11000,  
    JAUNE: 9000,  
    VIOLET: 6000,  
    ROSE: 2000  
  },  
  biomassFurnace: {  
    BLEU: 10000,  
    JAUNE: 8000,  
    VIOLET: 4000,  
    ROSE: 0  
  },  
  pelletStove: {  
    BLEU: 2500,  
    JAUNE: 2000,  
    VIOLET: 1500,  
    ROSE: 0  
  },  
  solarWaterHeater: {  
    BLEU: 4000,  
    JAUNE: 3000,  
    VIOLET: 2000,  
    ROSE: 0  
  },  
  thermodynamicWaterHeater: {  
    BLEU: 1200,  
    JAUNE: 800,  
    VIOLET: 400,  
    ROSE: 0  
  },  
  fuelTankRemoval: {  
    BLEU: 1200,  
    JAUNE: 800,  
    VIOLET: 400,  
    ROSE: 0  
  }  
};  
  
export const VENTILATION_RATES = {  
  vmcDoubleFlux: {  
    BLEU: 4000,  
    JAUNE: 3000,  
    VIOLET: 2000,  
    ROSE: 0  
  },  
  vmcSimpleFlux: {  
    BLEU: 800,  
    JAUNE: 600,  
    VIOLET: 400,  
    ROSE: 0  
  }  
};  
 
export const WINDOWS_RATES = {  
  windows: {  
    BLEU: 100,  
    JAUNE: 80,  
    VIOLET: 40,  
    ROSE: 0  
  },  
  frenchWindows: {  
    BLEU: 100,  
    JAUNE: 80,  
    VIOLET: 40,  
    ROSE: 0  
  },  
  insulatedDoors: {  
    BLEU: 150,  
    JAUNE: 120,  
    VIOLET: 80,  
    ROSE: 0  
  }  
};  
 
export const WINDOWS_MAX_QUANTITY = 10;  

export const BONUS_SORTIE_PASSOIRE = 1500;  
export const BONUS_BBC = 1500;  
export const BONUS_BATIMENT_BC = 500;  
 
export const MONOGESTE_MAX_CUMUL = 20000;  
  
export const PARCOURS_ACCOMPAGNE = {  
  plafonds: {  
    '2classes': 30000,  
    '3classesPlus': 40000  
  },  
  taux: {  
    BLEU: 0.80,  
    JAUNE: 0.60,  
    VIOLET: 0.45,  
    ROSE: 0.10  
  },  
  ecretement: {  
    BLEU: 1.00,  
    JAUNE: 0.90,  
    VIOLET: 0.80,  
    ROSE: 0.50  
  },  
  mar: {  
    BLEU: 1.00,  
    JAUNE: 1.00,  
    VIOLET: 0.80,  
    ROSE: 0.40  
  },  
  coutMAR: 3000  
};  
 
export const CEE_RATES = {  
  isolation: {  
    combles: 15,  
    murs: 20,  
    planchers: 17  
  },  
  heating: {  
    pacAirEau: 3500,  
    pacAirAir: 700,  
    pacGeothermal: 4500,  
    biomassFurnace: 3800,  
    pelletStove: 650,  
    thermodynamicWaterHeater: 125  
  },  
  ventilation: {  
    vmcDoubleFlux: 500  
  },  
  windows: 65,  
  reductionNonModestes: 0.65  
};  

export const ECO_PTZ = {  
  montants: {  
    1: 15000,  
    2: 25000,  
    3: 50000  
  },  
  duree: 15  
};  
  
export const TVA_REDUITE = 0.055;  
export const TVA_NORMALE = 0.20;  
 
export const AIDES_LOCALES_RATE = 0.05;  