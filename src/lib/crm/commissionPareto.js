/**
 * Double règle de commissionnement ENERGIA CONSEIL IA®.
 * B2C < 50 000 € HT : 10 % du montant des travaux.
 * Haute valeur (B2B, tertiaire, industrie, 100 kWc, ou > 50 000 € HT) : 30 % de la marge brute, 70 % ENERGIA.
 */

export const SEUIL_B2C_HT = 50000;
export const TAUX_COMMISSION_B2C = 0.1;
export const PART_APPORTEUR_PARETO = 0.3;
export const PART_ENERGIA_PARETO = 0.7;

function round2(valeur) {
  return Math.round(Number(valeur) * 100) / 100;
}

function nombrePositif(...candidats) {
  for (const candidat of candidats) {
    const valeur = Number(candidat);
    if (Number.isFinite(valeur) && valeur > 0) return valeur;
  }
  return null;
}

export function lireMontantProjetHt(dossier) {
  return nombrePositif(
    dossier?.caHt,
    dossier?.montantHt,
    dossier?.syntheseFinanciere?.totalHt,
    dossier?.dossier?.montantHt,
    dossier?.dossier?.syntheseFinanciere?.totalHt,
  );
}

export function lireCoutTravauxHt(dossier) {
  return nombrePositif(
    dossier?.coutAchatHt,
    dossier?.coutArtisanHt,
    dossier?.coutsTravauxHt,
    dossier?.syntheseFinanciere?.coutsTravauxHt,
    dossier?.dossier?.syntheseFinanciere?.coutsTravauxHt,
  );
}

function texteClasse(dossier) {
  return [dossier?.id, dossier?.nom, dossier?.categorie, dossier?.typeBien, dossier?.typeProjet]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Haute valeur : segment nommé, ou montant strictement supérieur à 50 000 € HT. */
export function estSegmentHauteValeur(dossier, montantHt) {
  const texte = texteClasse(dossier);
  if (/100\s*kwc|photovolta|centrale solaire|tertiaire|industrie|\bb2b\b/.test(texte)) return true;
  return montantHt != null && montantHt > SEUIL_B2C_HT;
}

/**
 * Calcule la commission d'un dossier qui a déjà une commission apporteur.
 * Retourne null si le dossier n'est pas commissionné ou si les montants manquent.
 */
export function calculerCommissionOfficielle(dossier) {
  const commissionStockee = Number(dossier?.commissionDamienHt);
  if (!Number.isFinite(commissionStockee) || commissionStockee <= 0) return null;
  const montantHt = lireMontantProjetHt(dossier);
  if (montantHt == null) return null;
  return simulerCommission({
    montantHt,
    coutHt: lireCoutTravauxHt(dossier),
    hauteValeur: estSegmentHauteValeur(dossier, montantHt),
  });
}

/** Simulateur : les montants sont saisis, le segment est choisi. */
export function simulerCommission({ montantHt, coutHt = null, hauteValeur = false }) {
  const vente = Number(montantHt);
  if (!Number.isFinite(vente) || vente <= 0) return null;
  const cout = Number(coutHt);
  const coutConnu = Number.isFinite(cout) && cout >= 0;

  if (!hauteValeur && vente < SEUIL_B2C_HT) {
    const partApporteurHt = round2(vente * TAUX_COMMISSION_B2C);
    return {
      regle: "b2c",
      libelle: "B2C résidentiel · 10 % HT des travaux",
      montantHt: round2(vente),
      coutHt: coutConnu ? round2(cout) : null,
      margeBruteHt: null,
      partApporteurHt,
      partEnergiaHt: null,
    };
  }

  if (!coutConnu) return null;
  const margeBruteHt = round2(vente - cout);
  const partApporteurHt = round2(margeBruteHt * PART_APPORTEUR_PARETO);
  const partEnergiaHt = round2(margeBruteHt * PART_ENERGIA_PARETO);
  return {
    regle: "pareto",
    libelle: "Haute valeur · 30 % de la marge brute",
    montantHt: round2(vente),
    coutHt: round2(cout),
    margeBruteHt,
    partApporteurHt,
    partEnergiaHt,
  };
}
