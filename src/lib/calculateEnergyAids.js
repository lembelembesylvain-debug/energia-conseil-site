export function calculateEnergyAids({ revenus, nb_personnes, code_postal }) {  
  const baremesIDF = {  
    1: { bleu: 23541, jaune: 28657, violet: 38184 },  
    2: { bleu: 34551, jaune: 42058, violet: 56130 },  
    3: { bleu: 41493, jaune: 50513, violet: 67585 },  
    4: { bleu: 48447, jaune: 58981, violet: 79041 },  
    5: { bleu: 55427, jaune: 67473, violet: 90496 },  
  }  
 
  const baremesAutres = {  
    1: { bleu: 17009, jaune: 21805, violet: 30549 },  
    2: { bleu: 24875, jaune: 31889, violet: 44907 },  
    3: { bleu: 29917, jaune: 38349, violet: 54071 },  
    4: { bleu: 34948, jaune: 44802, violet: 63235 },  
    5: { bleu: 40002, jaune: 51281, violet: 72400 },  
  }  
  
  const departementsIDF = ['75', '77', '78', '91', '92', '93', '94', '95']  
  const isIDF = departementsIDF.includes(code_postal?.substring(0, 2))  
  
  const baremes = isIDF ? baremesIDF : baremesAutres  
  const personnes = Math.min(nb_personnes, 5)  
  const bareme = baremes[personnes]  
  
  let categorie = 'rose'  
  let tauxMoyenRenovationGlobale = 0.35  
 
  if (revenus <= bareme.bleu) {  
    categorie = 'bleu'  
    tauxMoyenRenovationGlobale = 0.85  
  } else if (revenus <= bareme.jaune) {  
    categorie = 'jaune'  
    tauxMoyenRenovationGlobale = 0.65  
  } else if (revenus <= bareme.violet) {  
    categorie = 'violet'  
    tauxMoyenRenovationGlobale = 0.50  
  } else {  
    categorie = 'rose'  
    tauxMoyenRenovationGlobale = 0.35  
  }  
  
  const plafondMaPrimeRenov = 40000  
  const montantTravauxEstime = 35000  
  const aidesMaPrimeRenov = Math.round(Math.min(montantTravauxEstime, plafondMaPrimeRenov) * tauxMoyenRenovationGlobale)  
    
  let aidesCEE = 2000  
  if (categorie === 'bleu') aidesCEE = 4000  
  else if (categorie === 'jaune') aidesCEE = 3000  
  else if (categorie === 'violet') aidesCEE = 2500  
    
  const ecoPTZ = 50000  
  const total = aidesMaPrimeRenov + aidesCEE  
 
  return {  
    categorie,  
    taux: tauxMoyenRenovationGlobale,  
    aidesMaPrimeRenov,  
    aidesCEE,  
    ecoPTZ,  
    total,  
    details: {  
      montantTravauxEstime,  
      plafondMaPrimeRenov: 40000,  
      note: 'Estimation pour une rénovation globale avec gain ≥ 2 classes DPE (Plafond 2026 : 40 000€)'  
    }  
  }  
}  