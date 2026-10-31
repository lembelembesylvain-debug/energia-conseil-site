/**
 * Simulation indicative photovoltaïque + Tesla Powerwall 3.
 * Hypothèses de travail ENERGIA — pas un devis contractuel.
 */

export const PRIX_KWH_TTC = 0.25;
export const PRODUCTIVITE_KWH_PAR_KWC = 1100;

export const PUISSANCES_KWC = [3, 6, 9, 12] as const;
export type PuissanceKwc = (typeof PUISSANCES_KWC)[number];

export type OptionBatterie = "aucune" | "powerwall-1" | "powerwall-2";

export type SaisieSolaireTesla = {
  factureAnnuelleEur: number;
  puissanceKwc: PuissanceKwc;
  batterie: OptionBatterie;
  wallConnector: boolean;
};

type ProfilBatterie = {
  id: OptionBatterie;
  titre: string;
  detail: string;
  autoconsommationProduction: number;
  plafondIndependance: number;
  unites: number;
};

export const PROFILS_BATTERIE: ProfilBatterie[] = [
  {
    id: "aucune",
    titre: "Sans batterie",
    detail: "Autoconsommation standard ~35 %",
    autoconsommationProduction: 0.35,
    plafondIndependance: 0.4,
    unites: 0,
  },
  {
    id: "powerwall-1",
    titre: "1× Tesla Powerwall 3",
    detail: "13,5 kWh / 11,5 kW — autonomie ~80-85 %",
    autoconsommationProduction: 0.82,
    plafondIndependance: 0.85,
    unites: 1,
  },
  {
    id: "powerwall-2",
    titre: "2× Tesla Powerwall 3",
    detail: "27 kWh — autonomie ~95 % / grandes propriétés",
    autoconsommationProduction: 0.9,
    plafondIndependance: 0.95,
    unites: 2,
  },
];

/** Ordres de grandeur clé en main 2026, pose comprise, hors aides. */
export const PRIX_CENTRALE_TTC: Record<PuissanceKwc, number> = {
  3: 8400,
  6: 13200,
  9: 17100,
  12: 21000,
};

export const PRIX_POWERWALL_3_POSE_TTC = 12900;
export const PRIX_WALL_CONNECTOR_POSE_TTC = 1890;

/** Part du surplus solaire valorisée en recharge véhicule si la borne est retenue. */
const PART_SURPLUS_BORNE = 0.25;

export type ResultatSolaireTesla = {
  saisie: SaisieSolaireTesla;
  profil: ProfilBatterie;
  consommationKwh: number;
  productionKwh: number;
  energieMaisonKwh: number;
  surplusKwh: number;
  rechargeVehiculeKwh: number;
  independance: number;
  economieMaisonEur: number;
  economieBorneEur: number;
  economieAnnuelleEur: number;
  secoursActif: boolean;
  prixCentraleTtc: number;
  prixBatteriesTtc: number;
  prixBorneTtc: number;
  prixTotalTtc: number;
};

export const SAISIE_DEFAUT: SaisieSolaireTesla = {
  factureAnnuelleEur: 2400,
  puissanceKwc: 9,
  batterie: "powerwall-1",
  wallConnector: false,
};

export function euroSimulateur(montant: number) {
  return montant.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function simulerSolaireTesla(saisie: SaisieSolaireTesla): ResultatSolaireTesla {
  const facture = Math.max(0, Number(saisie.factureAnnuelleEur) || 0);
  const profil = PROFILS_BATTERIE.find((item) => item.id === saisie.batterie) ?? PROFILS_BATTERIE[0];
  const consommationKwh = facture > 0 ? facture / PRIX_KWH_TTC : 0;
  const productionKwh = saisie.puissanceKwc * PRODUCTIVITE_KWH_PAR_KWC;
  const plafondKwh = consommationKwh * profil.plafondIndependance;
  const autoconsommeKwh = productionKwh * profil.autoconsommationProduction;
  const energieMaisonKwh =
    consommationKwh > 0 ? Math.min(autoconsommeKwh, plafondKwh, consommationKwh) : 0;
  const surplusKwh = Math.max(0, productionKwh - energieMaisonKwh);
  const rechargeVehiculeKwh = saisie.wallConnector ? surplusKwh * PART_SURPLUS_BORNE : 0;
  const independance = consommationKwh > 0 ? energieMaisonKwh / consommationKwh : 0;
  const economieMaisonEur = energieMaisonKwh * PRIX_KWH_TTC;
  const economieBorneEur = rechargeVehiculeKwh * PRIX_KWH_TTC;
  const prixCentraleTtc = PRIX_CENTRALE_TTC[saisie.puissanceKwc];
  const prixBatteriesTtc = profil.unites * PRIX_POWERWALL_3_POSE_TTC;
  const prixBorneTtc = saisie.wallConnector ? PRIX_WALL_CONNECTOR_POSE_TTC : 0;

  return {
    saisie: { ...saisie, factureAnnuelleEur: facture },
    profil,
    consommationKwh: Math.round(consommationKwh),
    productionKwh: Math.round(productionKwh),
    energieMaisonKwh: Math.round(energieMaisonKwh),
    surplusKwh: Math.round(surplusKwh),
    rechargeVehiculeKwh: Math.round(rechargeVehiculeKwh),
    independance,
    economieMaisonEur: Math.round(economieMaisonEur),
    economieBorneEur: Math.round(economieBorneEur),
    economieAnnuelleEur: Math.round(economieMaisonEur + economieBorneEur),
    secoursActif: profil.unites > 0,
    prixCentraleTtc,
    prixBatteriesTtc,
    prixBorneTtc,
    prixTotalTtc: prixCentraleTtc + prixBatteriesTtc + prixBorneTtc,
  };
}
