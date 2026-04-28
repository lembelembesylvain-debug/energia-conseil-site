export type MprCategory = "Bleu" | "Jaune" | "Violet" | "Rose";

export type HousingInput = {
  surface: number;
  annualIncome: number;
  householdSize: number;
};

export type WorkInput = {
  combles: boolean;
  ite: boolean;
  pacAirEau: boolean;
};

export type MprResult = {
  category: MprCategory;
  comblesAid: number;
  iteAid: number;
  pacAid: number;
  totalAid: number;
};

const MPR_2026_HORS_IDF_THRESHOLDS: Record<number, [number, number, number]> = {
  1: [17363, 22259, 31185],
  2: [25393, 32553, 45842],
  3: [30540, 39148, 55196],
};

const MPR_2026_RATES: Record<
  MprCategory,
  { comblesPerM2: number; itePerM2: number; pacAirEau: number }
> = {
  Bleu: { comblesPerM2: 25, itePerM2: 75, pacAirEau: 5000 },
  Jaune: { comblesPerM2: 20, itePerM2: 60, pacAirEau: 4000 },
  Violet: { comblesPerM2: 15, itePerM2: 40, pacAirEau: 3000 },
  Rose: { comblesPerM2: 0, itePerM2: 0, pacAirEau: 0 },
};

export function getMprCategoryHorsIdf(
  annualIncome: number,
  householdSize: number
): MprCategory {
  const normalizedSize = Math.max(1, Math.min(householdSize, 3));
  const [bleu, jaune, violet] = MPR_2026_HORS_IDF_THRESHOLDS[normalizedSize];

  if (annualIncome <= bleu) return "Bleu";
  if (annualIncome <= jaune) return "Jaune";
  if (annualIncome <= violet) return "Violet";
  return "Rose";
}

export function computeMpr2026HorsIdf(
  housing: HousingInput,
  work: WorkInput
): MprResult {
  const category = getMprCategoryHorsIdf(
    housing.annualIncome,
    housing.householdSize
  );
  const rates = MPR_2026_RATES[category];

  const comblesAid = work.combles ? Math.round(housing.surface * rates.comblesPerM2) : 0;
  const iteAid = work.ite ? Math.round(housing.surface * rates.itePerM2) : 0;
  const pacAid = work.pacAirEau ? rates.pacAirEau : 0;
  const totalAid = comblesAid + iteAid + pacAid;

  return {
    category,
    comblesAid,
    iteAid,
    pacAid,
    totalAid,
  };
}
