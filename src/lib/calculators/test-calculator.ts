import { calculateEnergyAids, formatCurrency } from './energy-calculator';  
import type { HouseholdInfo, LogementInfo, Works } from './types';  
  
const household: HouseholdInfo = {  
  income: 35000,  
  householdSize: 4,  
  zipCode: '69001',  
  region: 'OTHER'  
};  
  
const logement: LogementInfo = {  
  surface: 120,  
  constructionYear: 1980,  
  type: 'MAISON',  
  dpeActuel: 'F',  
  dpeVise: 'C',  
  heatingType: 'GAZ'  
};  
 
const works: Works = {  
  roofInsulation: {  
    type: 'combles',  
    surface: 80,  
    rValue: 7,  
    estimatedCost: 2500  
  },  
  ite: {  
    type: 'murs',  
    surface: 100,  
    rValue: 4,  
    estimatedCost: 15000  
  },  
  heatPumpAirWater: {  
    type: 'PAC',  
    cop: 4.5,  
    estimatedCost: 12000  
  }  
};  
 
const result = calculateEnergyAids(household, logement, works, true);  
  
console.log('Cout travaux:', formatCurrency(result.coutTotalTravaux));  
console.log('MaPrimeRenov:', formatCurrency(result.maPrimeRenov.total));  
console.log('CEE:', formatCurrency(result.cee.total));  
console.log('TOTAL AIDES:', formatCurrency(result.totalAides));  
console.log('RESTE A CHARGE:', formatCurrency(result.resteACharge));  
console.log('ROI:', result.roi.toFixed(1), 'ans');  