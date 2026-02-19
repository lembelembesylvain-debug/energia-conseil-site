// Types pour le calculateur énergétique Energia-Conseil  
 
export type MaPrimeRenovCategory = 'BLEU' | 'JAUNE' | 'VIOLET' | 'ROSE';  
export type DPEClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';  
export type Region = 'IDF' | 'OTHER';  
export type LogementType = 'MAISON' | 'APPARTEMENT' | 'IMMEUBLE';  
export type HeatingType = 'GAZ' | 'FIOUL' | 'ELECTRIQUE' | 'BOIS' | 'CHARBON' | 'AUTRE';  

export interface HouseholdInfo {  
  income: number;  
  householdSize: number;  
  zipCode: string;  
  region: Region;  
}  
 
export interface LogementInfo {  
  surface: number;  
  constructionYear: number;  
  type: LogementType;  
  dpeActuel: DPEClass;  
  dpeVise: DPEClass;  
  heatingType: HeatingType;  
  annualConsumption?: number;  
}  
  
export interface WorksItem {  
  type: string;  
  surface?: number;  
  quantity?: number;  
  rValue?: number;  
  cop?: number;  
  material?: string;  
  thickness?: number;  
  estimatedCost: number;  
}  
 
export interface Works {  
  roofInsulation?: WorksItem;  
  ite?: WorksItem;  
  iti?: WorksItem;  
  floorInsulation?: WorksItem;  
  roofTerrace?: WorksItem;  
  heatPumpAirWater?: WorksItem;  
  heatPumpGeothermal?: WorksItem;  
  biomassFurnace?: WorksItem;  
  pelletStove?: WorksItem;  
  solarWaterHeater?: WorksItem;  
  thermodynamicWaterHeater?: WorksItem;  
  fuelTankRemoval?: WorksItem;  
  vmcDoubleFlux?: WorksItem;  
  vmcSimpleFlux?: WorksItem;  
  windows?: WorksItem;  
  frenchWindows?: WorksItem;  
  insulatedDoors?: WorksItem;  
}  
 
export interface AideDetail {  
  poste: string;  
  calcul: string;  
  montant: number;  
}  

export interface MaPrimeRenovResult {  
  category: MaPrimeRenovCategory;  
  total: number;  
  details: AideDetail[];  
  bonusSortiePassoire: number;  
  bonusBBC: number;  
  bonusGlobal: number;  
}  
 
export interface CEEResult {  
  total: number;  
  details: AideDetail[];  
}  
 
export interface EcoPTZResult {  
  montant: number;  
  nbActions: number;  
  duree: number;  
}  
 
export interface TVAResult {  
  montantEconomise: number;  
  tauxApplique: number;  
}  

export interface AidesLocalesResult {  
  total: number;  
  details: AideDetail[];  
}  
  
export interface CalculationResult {  
  coutTotalTravaux: number;  
  maPrimeRenov: MaPrimeRenovResult;  
  cee: CEEResult;  
  ecoPTZ: EcoPTZResult;  
  tva: TVAResult;  
  aidesLocales: AidesLocalesResult;  
  totalAides: number;  
  resteACharge: number;  
  dpeAvant: DPEClass;  
  dpeApres: DPEClass;  
  gainClasses: number;  
  economiesAnnuelles: number;  
  roi: number;  
}  